// pages/AllOrders.jsx  (admin panel)
// UI UPGRADED — zero logic changes

import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import { connectAdminSocket, getAdminSocket } from "../socket";
import { useToast } from "../context/ToastContext";

/* ─── STATUS META ────────────────────────────────────────────────────────────── */
const STATUS_META = {
  Placed:         { color: "#818cf8", bg: "rgba(129,140,248,.12)", label: "Placed"           },
  Packed:         { color: "#fbbf24", bg: "rgba(251,191,36,.12)",  label: "Packed"           },
  OutForDelivery: { color: "#38bdf8", bg: "rgba(56,189,248,.12)",  label: "Out for Delivery" },
  Delivered:      { color: "#34d399", bg: "rgba(52,211,153,.12)",  label: "Delivered"        },
  Cancelled:      { color: "#f87171", bg: "rgba(248,113,113,.12)", label: "Cancelled"        },
};

const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, { label }]) => ({ value, label }));
const PAGE_SIZES     = [10, 25, 50];

/* ─── MINI COMPONENTS ────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: "#9ca3af", bg: "rgba(156,163,175,.12)", label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 700,
      color: meta.color, background: meta.bg,
      border: `1px solid ${meta.color}40`,
      letterSpacing: ".03em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, boxShadow: `0 0 6px ${meta.color}`, display: "inline-block" }} />
      {meta.label}
    </span>
  );
};

const SortIcon = ({ field, sortBy, sortDir }) => {
  if (sortBy !== field) return <span style={{ opacity: 0.2, marginLeft: 4, fontSize: 10 }}>↕</span>;
  return <span style={{ marginLeft: 4, color: "#818cf8", fontSize: 11 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
};

function PagBtn({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        minWidth: 32, height: 32, padding: "0 6px", borderRadius: 8,
        border:     active   ? "1px solid #818cf8"                 : "1px solid rgba(255,255,255,.08)",
        background: active   ? "linear-gradient(135deg,#818cf8,#6366f1)" : disabled ? "transparent" : "rgba(255,255,255,.04)",
        color:      active   ? "#fff" : disabled ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.6)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 13, fontWeight: active ? 700 : 400,
        transition: "all .15s",
        boxShadow: active ? "0 0 12px rgba(129,140,248,.4)" : "none",
      }}
    >
      {label}
    </button>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
export default function AllOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const { showToast }         = useToast();

  const [search,       setSearch]     = useState("");
  const [statusFilter, setStatus]     = useState("All");
  const [dateFrom,     setDateFrom]   = useState("");
  const [dateTo,       setDateTo]     = useState("");
  const [sortBy,       setSortBy]     = useState("createdAt");
  const [sortDir,      setSortDir]    = useState("desc");
  const [page,         setPage]       = useState(1);
  const [pageSize,     setPageSize]   = useState(10);

  /* ── Sound ── */
  const playSound = () => {
    if (!window.__soundEnabled) return;
    new Audio("/notification.mp3").play().catch(() => {});
  };

  /* ── Browser notification ── */
  const showNotification = (order) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🛒 New Order Received", {
        body: `${order.userName || order.user?.name || "User"} • ₹${order.total}`,
        icon: order.items?.[0]?.image || "/logo.png",
      });
    }
  };

  /* ── Fetch all orders ── */
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

  /* ── Update order status ── */
  const updateStatus = async (orderId, status) => {
    try {
      await api.put("/admin/orders/status", { orderId, status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      showToast({ type: "success", message: `Status updated to ${status}` });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update order status";
      showToast({ type: "error", message: msg });
      console.error("❌ updateStatus error:", err?.response?.data || err.message);
    }
  };

  /* ── Initial load ── */
  useEffect(() => {
    fetchOrders();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    const enable = () => { window.__soundEnabled = true; document.removeEventListener("click", enable); };
    document.addEventListener("click", enable);
    return () => document.removeEventListener("click", enable);
  }, []);

  /* ── Socket ── */
  useEffect(() => {
    const socket = connectAdminSocket();
    socket.on("new-order", (order) => { playSound(); showNotification(order); fetchOrders(); });
    socket.on("order-status-updated", ({ orderId, status }) => {
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
    });
    return () => { socket.off("new-order"); socket.off("order-status-updated"); };
  }, []);

  /* ── Reset page ── */
  useEffect(() => setPage(1), [search, statusFilter, dateFrom, dateTo, sortBy, sortDir, pageSize]);

  /* ── Sort ── */
  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  /* ── Derived data ── */
  const filtered = useMemo(() => {
    let list = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        o._id.toLowerCase().includes(q) ||
        (o.user?.name  || "").toLowerCase().includes(q) ||
        (o.user?.phone || "").includes(q)
      );
    }
    if (statusFilter !== "All") list = list.filter((o) => o.status === statusFilter);
    if (dateFrom) list = list.filter((o) => new Date(o.createdAt) >= new Date(dateFrom));
    if (dateTo)   list = list.filter((o) => new Date(o.createdAt) <= new Date(dateTo + "T23:59:59"));
    list.sort((a, b) => {
      let av, bv;
      if      (sortBy === "total")  { av = a.total;              bv = b.total; }
      else if (sortBy === "status") { av = a.status;             bv = b.status; }
      else                          { av = new Date(a.createdAt); bv = new Date(b.createdAt); }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [orders, search, statusFilter, dateFrom, dateTo, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const clearFilters = () => { setSearch(""); setStatus("All"); setDateFrom(""); setDateTo(""); };
  const hasFilters   = search || statusFilter !== "All" || dateFrom || dateTo;

  /* ─── UI ─────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <AdminLayout>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 4, height: 28, borderRadius: 4,
                background: "linear-gradient(180deg, #818cf8, #38bdf8)",
                boxShadow: "0 0 12px rgba(129,140,248,.6)",
              }} />
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "#f1f5f9", letterSpacing: "-.02em", fontFamily: "'Syne', sans-serif" }}>
                All Orders
              </h3>
            </div>
            <p style={{ margin: "0 0 0 14px", color: "#475569", fontSize: 12.5, letterSpacing: ".02em" }}>
              <span style={{ color: "#818cf8", fontWeight: 700 }}>{filtered.length}</span> order{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button onClick={fetchOrders} className="ao-refresh-btn">
            <span className="ao-refresh-icon">🔄</span> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="ao-filters">
          {/* Search */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: "1 1 200px", minWidth: 180 }}>
            <label className="ao-label">Search</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#475569" }}>🔍</span>
              <input
                type="text" placeholder="Order ID, name, phone…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="ao-input" style={{ paddingLeft: 34 }}
              />
            </div>
          </div>

          {/* Status */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: "0 0 170px" }}>
            <label className="ao-label">Status</label>
            <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="ao-input ao-select">
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Date From */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: "0 0 150px" }}>
            <label className="ao-label">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="ao-input ao-date" />
          </div>

          {/* Date To */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: "0 0 150px" }}>
            <label className="ao-label">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="ao-input ao-date" />
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="ao-clear-btn">✕ Clear</button>
          )}
        </div>

        {/* Table Card */}
        <div className="ao-table-card">
          {loading ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div className="ao-spinner" />
              <p style={{ color: "#475569", marginTop: 14, fontSize: 13 }}>Loading orders…</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                      {[
                        { label: "Order ID",      field: null },
                        { label: "Products",      field: null },
                        { label: "Customer",      field: null },
                        { label: "Total",         field: "total" },
                        { label: "Status",        field: "status" },
                        { label: "Change Status", field: null },
                        { label: "Date",          field: "createdAt" },
                      ].map(({ label, field }) => (
                        <th
                          key={label}
                          onClick={field ? () => handleSort(field) : undefined}
                          style={{
                            padding: "12px 14px", textAlign: "left", fontWeight: 700,
                            color: "#475569", fontSize: 11, textTransform: "uppercase",
                            letterSpacing: ".08em", whiteSpace: "nowrap",
                            cursor: field ? "pointer" : "default", userSelect: "none",
                            fontFamily: "'Syne', sans-serif",
                            transition: "color .15s",
                          }}
                          onMouseEnter={e => { if (field) e.currentTarget.style.color = "#818cf8"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#475569"; }}
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
                        <td colSpan={7} style={{ padding: 60, textAlign: "center" }}>
                          <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                          <p style={{ color: "#475569", margin: 0 }}>No orders found</p>
                        </td>
                      </tr>
                    ) : paginated.map((o, idx) => (
                      <tr
                        key={o._id}
                        onClick={() => navigate(`/admin/order/${o._id}`)}
                        className="ao-row"
                        style={{ borderBottom: "1px solid rgba(255,255,255,.04)", cursor: "pointer" }}
                      >
                        {/* Order ID */}
                        <td style={{ padding: "13px 14px" }}>
                          <span style={{
                            fontFamily: "monospace", fontSize: 11, color: "#818cf8",
                            background: "rgba(129,140,248,.12)", padding: "3px 8px", borderRadius: 6,
                            border: "1px solid rgba(129,140,248,.2)", letterSpacing: ".05em",
                          }}>
                            #{o._id.slice(-8).toUpperCase()}
                          </span>
                        </td>

                        {/* Products */}
                        <td style={{ padding: "13px 14px" }}>
                          {o.items?.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {o.items.slice(0, 2).map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <img
                                    src={item.image || "/logo.png"} alt={item.name}
                                    style={{ width: 34, height: 34, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,.08)", flexShrink: 0 }}
                                    onError={(e) => { e.target.style.display = "none"; }}
                                  />
                                  <span style={{ color: "#cbd5e1", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12.5 }}>
                                    {item.name}
                                  </span>
                                </div>
                              ))}
                              {o.items.length > 2 && (
                                <span style={{ color: "#475569", fontSize: 11 }}>+{o.items.length - 2} more</span>
                              )}
                            </div>
                          ) : <span style={{ color: "#334155" }}>—</span>}
                        </td>

                        {/* Customer */}
                        <td style={{ padding: "13px 14px" }} onClick={(e) => { e.stopPropagation(); navigate(`/admin/users/${o.user?._id}`); }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                              background: "linear-gradient(135deg, #818cf8, #38bdf8)",
                              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 800, fontSize: 13,
                              boxShadow: "0 0 10px rgba(129,140,248,.35)",
                            }}>
                              {(o.user?.name || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>
                                {o.user?.name || "User"}
                              </div>
                              <div style={{ color: "#475569", fontSize: 11 }}>{o.user?.phone}</div>
                            </div>
                          </div>
                        </td>

                        {/* Total */}
                        <td style={{ padding: "13px 14px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne', sans-serif", fontSize: 14, letterSpacing: "-.01em" }}>
                          ₹{o.total?.toLocaleString("en-IN")}
                        </td>

                        {/* Status badge */}
                        <td style={{ padding: "13px 14px" }}>
                          <StatusBadge status={o.status} />
                        </td>

                        {/* Status change dropdown */}
                        <td style={{ padding: "13px 14px" }} onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            onChange={(e) => updateStatus(o._id, e.target.value)}
                            className="ao-status-select"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </td>

                        {/* Date */}
                        <td style={{ padding: "13px 14px", whiteSpace: "nowrap" }}>
                          <div style={{ fontWeight: 600, color: "#cbd5e1", fontSize: 12.5 }}>
                            {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                            {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,.06)",
                flexWrap: "wrap", gap: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
                  Show
                  <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="ao-input" style={{ width: "auto", padding: "4px 8px" }}>
                    {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  entries ·&nbsp;<strong style={{ color: "#818cf8" }}>{filtered.length}</strong>&nbsp;total
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <PagBtn onClick={() => setPage(1)}              disabled={page === 1}          label="«" />
                  <PagBtn onClick={() => setPage((p) => p - 1)}  disabled={page === 1}          label="‹" />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…"
                        ? <span key={`e${i}`} style={{ padding: "0 4px", color: "#475569", fontSize: 13 }}>…</span>
                        : <PagBtn key={p} onClick={() => setPage(p)} active={page === p} label={p} />
                    )
                  }
                  <PagBtn onClick={() => setPage((p) => p + 1)}  disabled={page === totalPages} label="›" />
                  <PagBtn onClick={() => setPage(totalPages)}     disabled={page === totalPages} label="»" />
                </div>
              </div>
            </>
          )}
        </div>

      </AdminLayout>
    </>
  );
}

/* ── Global CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&display=swap');

  /* Refresh button */
  .ao-refresh-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px;
    border: 1px solid rgba(129,140,248,.3);
    background: rgba(129,140,248,.08);
    cursor: pointer; font-size: 13px; font-weight: 600;
    color: #a5b4fc; letter-spacing: .03em; transition: all .2s;
    font-family: 'Syne', sans-serif;
  }
  .ao-refresh-btn:hover { background: rgba(129,140,248,.16); border-color: rgba(129,140,248,.5); color: #c7d2fe; }
  .ao-refresh-btn:hover .ao-refresh-icon { display: inline-block; animation: ao-spin .5s linear; }
  @keyframes ao-spin { to { transform: rotate(360deg); } }

  /* Filter bar */
  .ao-filters {
    background: linear-gradient(135deg, rgba(15,23,42,.95), rgba(15,23,42,.8));
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.07);
    padding: 16px 18px; margin-bottom: 16px;
    display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
    box-shadow: 0 1px 3px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.04);
  }

  .ao-label {
    font-size: 10.5px; font-weight: 700; color: #475569;
    text-transform: uppercase; letter-spacing: .08em;
    font-family: 'Syne', sans-serif;
  }

  .ao-input {
    width: 100%; padding: 8px 11px; border-radius: 9px;
    border: 1px solid rgba(255,255,255,.09);
    background: rgba(255,255,255,.05);
    color: #e2e8f0; font-size: 13px; outline: none;
    box-sizing: border-box; transition: border-color .2s, box-shadow .2s;
    font-family: inherit;
  }
  .ao-input::placeholder { color: #334155; }
  .ao-input:focus { border-color: rgba(129,140,248,.5); box-shadow: 0 0 0 3px rgba(129,140,248,.1); }

  .ao-select option, .ao-date::-webkit-calendar-picker-indicator { background: #1e293b; color: #e2e8f0; }
  .ao-date { color-scheme: dark; }

  .ao-clear-btn {
    align-self: flex-end; padding: 8px 16px; border-radius: 9px;
    border: 1px solid rgba(248,113,113,.3);
    background: rgba(248,113,113,.08);
    color: #f87171; cursor: pointer; font-size: 13px; font-weight: 600;
    transition: all .2s; letter-spacing: .02em;
  }
  .ao-clear-btn:hover { background: rgba(248,113,113,.16); border-color: rgba(248,113,113,.5); }

  /* Table card */
  .ao-table-card {
    background: linear-gradient(135deg, rgba(15,23,42,.95), rgba(15,23,42,.8));
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,.07);
    box-shadow: 0 1px 3px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.04);
    overflow: hidden;
  }

  /* Table rows */
  .ao-row { transition: background .15s; }
  .ao-row:hover { background: rgba(129,140,248,.06) !important; }

  /* Status dropdown in table */
  .ao-status-select {
    padding: 6px 10px; border-radius: 9px;
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.06);
    color: #cbd5e1; font-size: 12px; cursor: pointer; outline: none;
    min-width: 148px; transition: border-color .2s;
    font-family: inherit;
  }
  .ao-status-select:hover { border-color: rgba(129,140,248,.4); }
  .ao-status-select:focus { border-color: rgba(129,140,248,.6); box-shadow: 0 0 0 3px rgba(129,140,248,.1); }
  .ao-status-select option { background: #1e293b; color: #e2e8f0; }

  /* Spinner */
  .ao-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid rgba(129,140,248,.15);
    border-top-color: #818cf8;
    animation: ao-spin .9s linear infinite;
    margin: 0 auto;
  }
`;