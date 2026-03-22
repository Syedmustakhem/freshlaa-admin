// pages/rider/RiderDashboard.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RiderLayout from "../../components/RiderLayout";
import api from "../../services/api";

// ─── OTP INPUT ────────────────────────────────────────────────────────────────
function OTPVerify({ orderId, onVerified }) {
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
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
      const riderToken = localStorage.getItem("riderToken");
      await api.post(`/rider/orders/${orderId}/verify-otp`, { otp }, {
        headers: { Authorization: `Bearer ${riderToken}` },
      });
      setSuccess(true);
      setTimeout(() => onVerified(orderId), 1200);
    } catch (err) {
      const msg  = err?.response?.data?.message || "Incorrect OTP";
      const left = err?.response?.data?.attemptsLeft;
      setError(left !== undefined ? `${msg} (${left} left)` : msg);
      setOtp("");
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#22c55e", fontWeight: 700, padding: "10px 0" }}>
      <span style={{ fontSize: 20 }}>✅</span> Delivered! Great work 🎉
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
        🔐 Enter Customer OTP
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[0,1,2,3].map((idx) => (
          <input key={idx} ref={(el) => (inputs.current[idx] = el)}
            type="text" inputMode="numeric" maxLength={1}
            value={otp[idx] || ""}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            style={{ width: 52, height: 56, borderRadius: 10, textAlign: "center", fontSize: 24, fontWeight: 800, border: error ? "2px solid #ef4444" : otp[idx] ? "2px solid #f97316" : "2px solid #e5e7eb", outline: "none", color: "#111827" }}
          />
        ))}
      </div>
      {error && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 8, fontWeight: 600 }}>⚠️ {error}</p>}
      <button onClick={handleVerify} disabled={loading || otp.length !== 4}
        style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: otp.length === 4 ? "#f97316" : "#e5e7eb", color: otp.length === 4 ? "#fff" : "#9ca3af", fontWeight: 700, fontSize: 14, cursor: otp.length === 4 ? "pointer" : "not-allowed" }}>
        {loading ? "Verifying…" : "✓ Confirm Delivery"}
      </button>
    </div>
  );
}

// ─── MAP COMPONENT (Leaflet) ──────────────────────────────────────────────────
function DeliveryMap({ address }) {
  const mapRef     = useRef(null);
  const mapObjRef  = useRef(null);
  const markerRef  = useRef(null);

  useEffect(() => {
    if (mapObjRef.current || !mapRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link  = document.createElement("link");
      link.id     = "leaflet-css";
      link.rel    = "stylesheet";
      link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L   = window.L;
      const map = L.map(mapRef.current).setView([17.385, 78.4867], 12); // Default: Hyderabad

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const riderIcon = L.divIcon({
        html:      '<div style="font-size:28px;line-height:1">🛵</div>',
        iconSize:  [32, 32],
        iconAnchor:[16, 16],
        className: "",
      });

      markerRef.current = L.marker([17.385, 78.4867], { icon: riderIcon }).addTo(map);
      mapObjRef.current = map;

      // Watch rider's GPS position
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            markerRef.current?.setLatLng([latitude, longitude]);
            mapObjRef.current?.setView([latitude, longitude], 15);

            // Send location to backend
            const riderToken = localStorage.getItem("riderToken");
            api.put("/rider/location", { lat: latitude, lng: longitude }, {
              headers: { Authorization: `Bearer ${riderToken}` },
            }).catch(() => {});
          },
          (err) => console.log("GPS error:", err.message),
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      }
    };
    document.head.appendChild(script);

    return () => {
      mapObjRef.current?.remove();
      mapObjRef.current = null;
    };
  }, []);

  return (
    <div ref={mapRef} style={{ width: "100%", height: 220, borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", zIndex: 0 }} />
  );
}

// ─── ORDER CARD ───────────────────────────────────────────────────────────────
function OrderCard({ order, onVerified }) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", borderLeft: "4px solid #f97316", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }} onClick={() => setExpanded((e) => !e)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#f97316", background: "#fff7ed", padding: "2px 7px", borderRadius: 5, fontWeight: 700 }}>
              #{order.orderId || order._id?.slice(-8).toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "#f97316", background: "#fff7ed", border: "1px solid #fed7aa" }}>
              🛵 Out for Delivery
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
            📍 {[order.address?.area, order.address?.city].filter(Boolean).join(", ") || "Address not available"}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
            {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} · ₹{order.total?.toLocaleString("en-IN")} · {formatTime(order.createdAt)}
          </div>
        </div>
        <span style={{ color: "#9ca3af", fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f3f4f6", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Map */}
          <DeliveryMap address={order.address} />

          {/* Customer info */}
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Customer</p>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{order.user?.name || "Customer"}</div>
            {order.user?.phone && (
              <a href={`tel:${order.user.phone}`} style={{ fontSize: 13, color: "#f97316", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                📞 {order.user.phone}
              </a>
            )}
          </div>

          {/* Full address */}
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Delivery Address</p>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              {[order.address?.house, order.address?.street, order.address?.area, order.address?.city, order.address?.pincode].filter(Boolean).join(", ")}
            </div>
          </div>

          {/* Items */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Items</p>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <img src={item.image || "/logo.png"} alt={item.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} onError={(e) => { e.target.src = "/logo.png"; }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>×{item.qty} · ₹{item.finalPrice ?? item.price}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment */}
          <div style={{ background: order.paymentMethod === "COD" ? "#fff7ed" : "#f0fdf4", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: order.paymentMethod === "COD" ? "#ea580c" : "#15803d" }}>
              {order.paymentMethod === "COD" ? "💵 Collect ₹" + order.total + " (COD)" : "✅ Already Paid Online"}
            </span>
          </div>

          {/* OTP Verification */}
          <div style={{ background: "#fff7ed", borderRadius: 12, padding: 16, border: "1px solid #fed7aa" }}>
            <OTPVerify orderId={order._id} onVerified={onVerified} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function RiderDashboard() {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [isOnline,  setIsOnline]  = useState(false);
  const [toggling,  setToggling]  = useState(false);
  const riderToken = localStorage.getItem("riderToken");
  const rider      = JSON.parse(localStorage.getItem("rider") || "{}");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/rider/orders/active", {
        headers: { Authorization: `Bearer ${riderToken}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [riderToken]);

  useEffect(() => {
    fetchOrders();
    setIsOnline(rider?.isOnline || false);
    const id = setInterval(fetchOrders, 20000); // poll every 20s
    return () => clearInterval(id);
  }, []);

  const toggleOnline = async () => {
    setToggling(true);
    try {
      const res = await api.put("/rider/online", {}, {
        headers: { Authorization: `Bearer ${riderToken}` },
      });
      setIsOnline(res.data.isOnline);
      const stored = JSON.parse(localStorage.getItem("rider") || "{}");
      localStorage.setItem("rider", JSON.stringify({ ...stored, isOnline: res.data.isOnline }));
    } catch (err) {
      console.error("Toggle error:", err.message);
    } finally {
      setToggling(false);
    }
  };

  const handleVerified = (orderId) => {
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

  return (
    <RiderLayout>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "#1a1f2e" }}>My Deliveries</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            {orders.length} active order{orders.length !== 1 ? "s" : ""} assigned
          </p>
        </div>

        {/* Online toggle */}
        <button
          onClick={toggleOnline}
          disabled={toggling}
          style={{
            padding: "10px 20px", borderRadius: 20, border: "none",
            background: isOnline ? "#f0fdf4" : "#fef2f2",
            color: isOnline ? "#15803d" : "#ef4444",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            border: isOnline ? "1.5px solid #bbf7d0" : "1.5px solid #fca5a5",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: isOnline ? "#22c55e" : "#ef4444", display: "inline-block" }} />
          {toggling ? "…" : isOnline ? "Online — Go Offline" : "Offline — Go Online"}
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Active",      value: orders.length, color: "#f97316", bg: "#fff7ed", icon: "🛵" },
          { label: "Today",       value: rider?.stats?.todayDeliveries || 0, color: "#22c55e", bg: "#f0fdf4", icon: "✅" },
          { label: "Today's Pay", value: `₹${rider?.earnings?.today || 0}`, color: "#6366f1", bg: "#eef2ff", icon: "💰" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${s.color}30` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.color, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
          Loading your orders…
        </div>
      ) : !isOnline ? (
        <div style={{ textAlign: "center", padding: 48, background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#374151", marginBottom: 6 }}>You're Offline</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>Go online to start receiving delivery orders</div>
          <button onClick={toggleOnline} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#f97316", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Go Online
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛵</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#374151", marginBottom: 6 }}>No Active Deliveries</div>
          <div style={{ fontSize: 13, color: "#9ca3af" }}>Orders assigned to you will appear here</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onVerified={handleVerified} />
          ))}
        </div>
      )}
    </RiderLayout>
  );
}