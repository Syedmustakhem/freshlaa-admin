// pages/DeliveryPanel.jsx  (admin panel)
import { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import { connectAdminSocket } from "../socket";
import { useToast } from "../context/ToastContext";

const STATUS_META = {
  Placed:         { color: "#6366f1", bg: "#eef2ff", label: "Placed"           },
  Packed:         { color: "#f59e0b", bg: "#fffbeb", label: "Packed"           },
  OutForDelivery: { color: "#0ea5e9", bg: "#e0f2fe", label: "Out for Delivery" },
  Delivered:      { color: "#22c55e", bg: "#f0fdf4", label: "Delivered"        },
  Cancelled:      { color: "#ef4444", bg: "#fef2f2", label: "Cancelled"        },
};

// ─── REVEAL OTP ───────────────────────────────────────────────────────────────
function RevealOTP({ otp }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
        Customer's OTP
      </p>
      {revealed ? (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            {otp.toString().split("").map((d, i) => (
              <div key={i} style={{ width: 42, height: 48, borderRadius: 10, background: "#fff7ed", border: "2px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#ea580c" }}>
                {d}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>This is what the customer sees in their app</p>
        </>
      ) : (
        <button onClick={() => setRevealed(true)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #fed7aa", background: "#fff7ed", color: "#ea580c", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          👁 Reveal OTP
        </button>
      )}
    </div>
  );
}

// ─── OTP INPUT ────────────────────────────────────────────────────────────────
function OTPInput({ orderId, existingOTP, onVerified, onRegenerate }) {
  const [otp,          setOtp]          = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const arr  = otp.split("");
    arr[idx]   = val.slice(-1);
    const next = arr.join("").slice(0, 4);
    setOtp(next);
    setError("");
    if (val && idx < 3) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    if (otp.length !== 4) { setError("Enter all 4 digits"); return; }
    setLoading(true);
    setError("");
    try {
      await api.post(`/orders/${orderId}/verify-otp`, { otp });
      setSuccess(true);
      onVerified(orderId);
    } catch (err) {
      const msg  = err?.response?.data?.message || "Incorrect OTP";
      const left = err?.response?.data?.attemptsLeft;
      setError(left !== undefined ? `${msg} (${left} attempts left)` : msg);
      setOtp("");
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenLoading(true);
    setError("");
    try {
      await api.post(`/orders/${orderId}/generate-otp`);
      onRegenerate(orderId);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to regenerate OTP");
    } finally {
      setRegenLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#22c55e", fontWeight: 700, fontSize: 14 }}>
        <span style={{ fontSize: 20 }}>✅</span> OTP Verified — Marked Delivered
      </div>
    );
  }

  return (
    <div>
      {/* ✅ Customer OTP hidden until revealed */}
      {existingOTP && <RevealOTP otp={existingOTP} />}

      {/* Agent enters OTP */}
      <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
        Enter OTP to Confirm Delivery
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[0, 1, 2, 3].map((idx) => (
          <input
            key={idx}
            ref={(el) => (inputs.current[idx] = el)}
            type="text" inputMode="numeric" maxLength={1}
            value={otp[idx] || ""}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            style={{ width: 48, height: 52, borderRadius: 10, textAlign: "center", fontSize: 22, fontWeight: 800, border: error ? "2px solid #ef4444" : otp[idx] ? "2px solid #0ea5e9" : "2px solid #e5e7eb", outline: "none", color: "#111827", background: "#fff", transition: "border-color .15s" }}
          />
        ))}
      </div>

      {error && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 8, fontWeight: 500 }}>⚠️ {error}</p>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={handleVerify} disabled={loading || otp.length !== 4}
          style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: otp.length === 4 ? "#0ea5e9" : "#e5e7eb", color: otp.length === 4 ? "#fff" : "#9ca3af", fontWeight: 700, fontSize: 13, cursor: otp.length === 4 ? "pointer" : "not-allowed", transition: "all .15s" }}>
          {loading ? "Verifying…" : "✓ Confirm Delivery"}
        </button>
        <button onClick={handleRegenerate} disabled={regenLoading}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
          {regenLoading ? "…" : "↻ Regenerate OTP"}
        </button>
      </div>
    </div>
  );
}

// ─── DELIVERY ORDER CARD ──────────────────────────────────────────────────────
function DeliveryOrderCard({ order, onVerified, onStatusChange, onRegenerate }) {
  const [expanded,      setExpanded]      = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const meta = STATUS_META[order.status] || STATUS_META.Placed;
  const formatTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try { await onStatusChange(order._id, newStatus); }
    finally { setStatusLoading(false); }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden", borderLeft: `4px solid ${meta.color}` }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }} onClick={() => setExpanded((e) => !e)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6366f1", background: "#eef2ff", padding: "2px 7px", borderRadius: 5, fontWeight: 700 }}>
              #{order.orderId || order._id?.slice(-8).toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30` }}>
              {meta.label}
            </span>
            {order.deliveryOTP && !order.otpVerified && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "#ea580c", background: "#fff7ed", border: "1px solid #fed7aa", animation: "pulse 2s infinite" }}>
                🔐 OTP Active
              </span>
            )}
            {order.otpVerified && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "#22c55e", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                ✅ OTP Verified
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                {(order.user?.name || "U")[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{order.user?.name || "User"}</span>
              {order.user?.phone && <span style={{ fontSize: 12, color: "#9ca3af" }}>· {order.user.phone}</span>}
            </div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>₹{order.total?.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{formatTime(order.createdAt)}</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{formatDate(order.createdAt)}</div>
        </div>
        <span style={{ color: "#9ca3af", fontSize: 16, flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f3f4f6", padding: 16, display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* Left */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Items</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={item.image || "/logo.png"} alt={item.name} style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", flexShrink: 0 }} onError={(e) => { e.target.src = "/logo.png"; }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>×{item.qty} · ₹{item.finalPrice ?? item.price}</div>
                  </div>
                </div>
              ))}
            </div>
            {order.address && (
              <>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Delivery Address</p>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, background: "#f9fafb", borderRadius: 8, padding: "8px 10px" }}>
                  {[order.address.house, order.address.street, order.address.area, order.address.city, order.address.pincode].filter(Boolean).join(", ")}
                </div>
              </>
            )}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Change Status</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Placed", "Packed", "OutForDelivery", "Delivered", "Cancelled"].map((s) => (
                  <button key={s} onClick={() => handleStatusChange(s)} disabled={order.status === s || statusLoading}
                    style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, border: order.status === s ? `2px solid ${STATUS_META[s].color}` : "1px solid #e5e7eb", background: order.status === s ? STATUS_META[s].bg : "#fff", color: order.status === s ? STATUS_META[s].color : "#6b7280", cursor: order.status === s ? "default" : "pointer", opacity: statusLoading ? 0.6 : 1 }}>
                    {s === "OutForDelivery" ? "Out for Delivery" : s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Right: OTP */}
          <div style={{ flex: "0 0 300px", background: "#f9fafb", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 12 }}>🔐 Delivery OTP Verification</p>
            {order.status === "OutForDelivery" ? (
              <OTPInput orderId={order._id} existingOTP={order.deliveryOTP} onVerified={onVerified} onRegenerate={onRegenerate} />
            ) : (
              <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>
                OTP is only available when status is <strong style={{ color: "#0ea5e9" }}>Out for Delivery</strong>.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DeliveryPanel() {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("OutForDelivery");
  const [search,        setSearch]        = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data.data || []);
      setLastRefreshed(new Date());
    } catch {
      showToast({ type: "error", message: "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => {
    const id = setInterval(fetchOrders, 30000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  useEffect(() => {
    const socket = connectAdminSocket();
    socket.on("new-order", fetchOrders);
    socket.on("order-status-updated", ({ orderId, status }) => {
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
    });
    socket.on("delivery-otp-generated", ({ orderId, otp }) => {
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, deliveryOTP: otp } : o));
    });
    return () => {
      socket.off("new-order");
      socket.off("order-status-updated");
      socket.off("delivery-otp-generated");
    };
  }, [fetchOrders]);

  const handleVerified     = (orderId) => {
    setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "Delivered", otpVerified: true } : o));
    showToast({ type: "success", message: "✅ Order marked as Delivered!" });
  };
  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put("/admin/orders/status", { orderId, status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      showToast({ type: "success", message: `Status → ${status}` });
    } catch (err) {
      showToast({ type: "error", message: err?.response?.data?.message || "Failed to update" });
    }
  };
  const handleRegenerate   = () => {
    fetchOrders();
    showToast({ type: "success", message: "New OTP generated and sent to customer" });
  };

  const filtered = orders
    .filter((o) => filter === "All" || o.status === filter)
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (o.orderId || o._id).toLowerCase().includes(q) || (o.user?.name || "").toLowerCase().includes(q) || (o.user?.phone || "").includes(q);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const stats = {
    outForDelivery: orders.filter((o) => o.status === "OutForDelivery").length,
    withOTP:        orders.filter((o) => o.status === "OutForDelivery" && o.deliveryOTP && !o.otpVerified).length,
    deliveredToday: orders.filter((o) => o.status === "Delivered" && new Date(o.updatedAt || o.createdAt).toDateString() === new Date().toDateString()).length,
    packed:         orders.filter((o) => o.status === "Packed").length,
  };

  return (
    <AdminLayout>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>🛵 Delivery Panel</h3>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
            Manage deliveries · verify OTPs · update order status
            {lastRefreshed && <span style={{ marginLeft: 8, color: "#9ca3af" }}>· Refreshed {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
          </p>
        </div>
        <button onClick={fetchOrders} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Out for Delivery", value: stats.outForDelivery, color: "#0ea5e9", bg: "#e0f2fe", icon: "🛵" },
          { label: "OTP Awaiting",     value: stats.withOTP,        color: "#ea580c", bg: "#fff7ed", icon: "🔐" },
          { label: "Delivered Today",  value: stats.deliveredToday, color: "#22c55e", bg: "#f0fdf4", icon: "✅" },
          { label: "Ready to Pack",    value: stats.packed,         color: "#f59e0b", bg: "#fffbeb", icon: "📦" },
        ].map((stat) => (
          <div key={stat.label} style={{ flex: "1 1 160px", background: stat.bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${stat.color}30` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, letterSpacing: -1 }}>{stat.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: stat.color, opacity: 0.8 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
          <input type="text" placeholder="Search order, customer, phone…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "7px 10px 7px 32px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", "Packed", "OutForDelivery", "Delivered", "Cancelled"].map((s) => {
            const meta = STATUS_META[s] || { color: "#6366f1", bg: "#eef2ff" };
            const active = filter === s;
            return (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: active ? `2px solid ${meta.color}` : "1px solid #e5e7eb", background: active ? meta.bg : "#fff", color: active ? meta.color : "#6b7280", cursor: "pointer", transition: "all .15s" }}>
                {s === "OutForDelivery" ? "Out for Delivery" : s}
                {s === "OutForDelivery" && stats.outForDelivery > 0 && (
                  <span style={{ marginLeft: 6, background: "#0ea5e9", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{stats.outForDelivery}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order list */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}><div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>Loading delivery orders…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{filter === "OutForDelivery" ? "🛵" : "📭"}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{filter === "OutForDelivery" ? "No active deliveries" : "No orders found"}</div>
          <div style={{ fontSize: 13 }}>{filter === "OutForDelivery" ? "Orders marked 'Out for Delivery' will appear here with their OTP" : "Try changing the filter or search term"}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{filtered.length} order{filtered.length !== 1 ? "s" : ""} · click any card to expand</p>
          {filtered.map((order) => (
            <DeliveryOrderCard key={order._id} order={order} onVerified={handleVerified} onStatusChange={handleStatusChange} onRegenerate={handleRegenerate} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}