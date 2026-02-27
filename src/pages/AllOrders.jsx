import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import socket from "../socket";
import { useToast } from "../context/ToastContext";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const STATUS_META = {
  Placed:          { color: "#6366f1", bg: "#eef2ff", label: "Placed" },
  Packed:          { color: "#f59e0b", bg: "#fffbeb", label: "Packed" },
  OutForDelivery:  { color: "#0ea5e9", bg: "#e0f2fe", label: "Out for Delivery" },
  Delivered:       { color: "#22c55e", bg: "#f0fdf4", label: "Delivered" },
  Cancelled:       { color: "#ef4444", bg: "#fef2f2", label: "Cancelled" },
};

const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, { label }]) => ({ value, label }));

const PAGE_SIZES = [10, 25, 50];

/* ─────────────────────────────────────────────
   MINI COMPONENTS
───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: "#6b7280", bg: "#f3f4f6", label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, display: "inline-block" }} />
      {meta.label}
    </span>
  );
};

const SortIcon = ({ field, sortBy, sortDir }) => {
  if (sortBy !== field) return <span style={{ opacity: 0.25, marginLeft: 4 }}>↕</span>;
  return <span style={{ marginLeft: 4, color: "#6366f1" }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function AllOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate                = useNavigate();
  const { showToast }           = useToast();

  /* filters */
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("All");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");

  /* sorting */
  const [sortBy, setSortBy]     = useState("createdAt");
  const [sortDir, setSortDir]   = useState("desc");

  /* pagination */
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ── sound ── */
  const playSound = () => {
    if (!window.__soundEnabled) return;
    new Audio("/notification.mp3").play().catch(() => {});
  };

  /* ── notification ── */
  const showNotification = (order) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🛒 New Order Received", {
        body: `${order.userName || order.user?.name || "User"} • ₹${order.total}`,
        icon: order.items?.[0]?.image || "/logo.png",
      });
    }
  };

  /* ── API ── */
  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data.data || []);
    } catch {
      showToast({ type: "error", message: "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch("/admin/orders/status", { orderId, status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      showToast({ type: "success", message: "Order status updated" });
    } catch {
      showToast({ type: "error", message: "Failed to update order status" });
    }
  };

  /* ── initial load ── */
  useEffect(() => {
    fetchOrders();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    const enable = () => { window.__soundEnabled = true; document.removeEventListener("click", enable); };
    document.addEventListener("click", enable);
  }, []);

  /* ── socket ── */
  useEffect(() => {
    socket.on("new-order", (order) => { playSound(); showNotification(order); fetchOrders(); });
    socket.on("order-updated", ({ orderId, status }) => {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    });
    return () => { socket.off("new-order"); socket.off("order-updated"); };
  }, []);

  /* ── reset page on filter change ── */
  useEffect(() => setPage(1), [search, statusFilter, dateFrom, dateTo, sortBy, sortDir, pageSize]);

  /* ── sorting handler ── */
  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  /* ── derived data ── */
  const filtered = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o._id.toLowerCase().includes(q) ||
        (o.user?.name || "").toLowerCase().includes(q) ||
        (o.user?.phone || "").includes(q)
      );
    }

    if (statusFilter !== "All") list = list.filter(o => o.status === statusFilter);

    if (dateFrom) list = list.filter(o => new Date(o.createdAt) >= new Date(dateFrom));
    if (dateTo)   list = list.filter(o => new Date(o.createdAt) <= new Date(dateTo + "T23:59:59"));

    list.sort((a, b) => {
      let av, bv;
      if (sortBy === "total")     { av = a.total;             bv = b.total; }
      else if (sortBy === "status") { av = a.status;           bv = b.status; }
      else                        { av = new Date(a.createdAt); bv = new Date(b.createdAt); }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    return list;
  }, [orders, search, statusFilter, dateFrom, dateTo, sortBy, sortDir]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated   = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ── clear filters ── */
  const clearFilters = () => { setSearch(""); setStatus("All"); setDateFrom(""); setDateTo(""); };
  const hasFilters   = search || statusFilter !== "All" || dateFrom || dateTo;

  /* ─────────────── UI ─────────────── */
  return (
    <AdminLayout>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22 }}>All Orders</h3>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 13 }}>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500,
            color: "#374151", boxShadow: "0 1px 2px rgba(0,0,0,.05)",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ── Filters Bar ── */}
      <div style={{
        background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
        padding: "14px 16px", marginBottom: 16,
        display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end",
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
      }}>

        {/* Search */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px", minWidth: 180 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5 }}>Search</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
            <input
              type="text" placeholder="Order ID, name, phone…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "7px 10px 7px 32px", borderRadius: 8,
                border: "1px solid #d1d5db", fontSize: 13, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "0 0 160px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5 }}>Status</label>
          <select
            value={statusFilter} onChange={e => setStatus(e.target.value)}
            style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none" }}
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Date From */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "0 0 150px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5 }}>From</label>
          <input
            type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none" }}
          />
        </div>

        {/* Date To */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "0 0 150px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5 }}>To</label>
          <input
            type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none" }}
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              alignSelf: "flex-end", padding: "7px 14px", borderRadius: 8,
              border: "1px solid #fca5a5", background: "#fef2f2", color: "#ef4444",
              cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Table Card ── */}
      <div style={{
        background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,.06)", overflow: "hidden",
      }}>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            Loading orders…
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {[
                      { label: "Order ID",   field: null },
                      { label: "Products",   field: null },
                      { label: "Customer",   field: null },
                      { label: "Total",      field: "total" },
                      { label: "Status",     field: "status" },
                      { label: "Change Status", field: null },
                      { label: "Date",       field: "createdAt" },
                    ].map(({ label, field }) => (
                      <th
                        key={label}
                        onClick={field ? () => handleSort(field) : undefined}
                        style={{
                          padding: "11px 14px", textAlign: "left", fontWeight: 600,
                          color: "#374151", fontSize: 12, textTransform: "uppercase",
                          letterSpacing: .5, whiteSpace: "nowrap",
                          cursor: field ? "pointer" : "default",
                          userSelect: "none",
                        }}
                      >
                        {label}
                        {field && <SortIcon field={field} sortBy={sortBy} sortDir={sortDir} />}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                        No orders found
                      </td>
                    </tr>
                  ) : paginated.map((o, idx) => (
                    <tr
                      key={o._id}
                      onClick={() => navigate(`/admin/order/${o._id}`)}
                      style={{
                        cursor: "pointer",
                        borderBottom: "1px solid #f3f4f6",
                        background: idx % 2 === 0 ? "#fff" : "#fafafa",
                        transition: "background .15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"}
                    >

                      {/* Order ID */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{
                          fontFamily: "monospace", fontSize: 11,
                          color: "#6366f1", background: "#eef2ff",
                          padding: "2px 6px", borderRadius: 4,
                        }}>
                          #{o._id.slice(-8).toUpperCase()}
                        </span>
                      </td>

                      {/* Products */}
                      <td style={{ padding: "12px 14px" }}>
                        {o.items?.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {o.items.slice(0, 2).map((item, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <img
                                  src={item.image || "/logo.png"} alt={item.name}
                                  style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb", flexShrink: 0 }}
                                />
                                <span style={{ color: "#374151", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.name}
                                </span>
                              </div>
                            ))}
                            {o.items.length > 2 && (
                              <span style={{ color: "#9ca3af", fontSize: 11 }}>+{o.items.length - 2} more</span>
                            )}
                          </div>
                        ) : "—"}
                      </td>

                      {/* Customer — stop propagation so click goes to user page only */}
                      <td
                        style={{ padding: "12px 14px" }}
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/admin/users/${o.user?._id}`);
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%", background: "#6366f1",
                            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 13, flexShrink: 0,
                          }}>
                            {(o.user?.name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#111827", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>
                              {o.user?.name || "User"}
                            </div>
                            <div style={{ color: "#9ca3af", fontSize: 11 }}>{o.user?.phone}</div>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#111827" }}>
                        ₹{o.total?.toLocaleString("en-IN")}
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: "12px 14px" }}>
                        <StatusBadge status={o.status} />
                      </td>

                      {/* Status select — stop propagation */}
                      <td
                        style={{ padding: "12px 14px" }}
                        onClick={e => e.stopPropagation()}
                      >
                        <select
                          value={o.status}
                          onChange={e => updateStatus(o._id, e.target.value)}
                          style={{
                            padding: "5px 8px", borderRadius: 8,
                            border: "1px solid #d1d5db", fontSize: 12,
                            background: "#fff", cursor: "pointer", outline: "none",
                            minWidth: 140,
                          }}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "12px 14px", color: "#6b7280", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 500, color: "#374151" }}>
                          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderTop: "1px solid #e5e7eb", flexWrap: "wrap", gap: 10,
            }}>
              {/* Page size */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" }}>
                Show
                <select
                  value={pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                >
                  {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                entries · <strong style={{ color: "#111827" }}>{filtered.length}</strong> total
              </div>

              {/* Page buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <PagBtn onClick={() => setPage(1)}      disabled={page === 1}          label="«" />
                <PagBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}      label="‹" />

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…"
                      ? <span key={`e${i}`} style={{ padding: "0 4px", color: "#9ca3af" }}>…</span>
                      : <PagBtn key={p} onClick={() => setPage(p)} active={page === p} label={p} />
                  )
                }

                <PagBtn onClick={() => setPage(p => p + 1)} disabled={page === totalPages} label="›" />
                <PagBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} label="»" />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

/* ── Pagination Button ── */
function PagBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 32, height: 32, padding: "0 6px", borderRadius: 7,
        border: active ? "1px solid #6366f1" : "1px solid #e5e7eb",
        background: active ? "#6366f1" : disabled ? "#f9fafb" : "#fff",
        color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 13, fontWeight: active ? 700 : 400,
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}