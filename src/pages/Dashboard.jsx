import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const STATUS_META = {
  Placed:         { color: "#6366f1", bg: "#eef2ff", label: "Placed",           icon: "🛒" },
  Packed:         { color: "#f59e0b", bg: "#fffbeb", label: "Packed",           icon: "📦" },
  OutForDelivery: { color: "#0ea5e9", bg: "#e0f2fe", label: "Out for Delivery", icon: "🚴" },
  Delivered:      { color: "#22c55e", bg: "#f0fdf4", label: "Delivered",        icon: "✅" },
  Cancelled:      { color: "#ef4444", bg: "#fef2f2", label: "Cancelled",        icon: "❌" },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: "#6b7280", bg: "#f3f4f6", label: status, icon: "•" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      color: meta.color, background: meta.bg, border: `1px solid ${meta.color}22`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color }} />
      {meta.label}
    </span>
  );
};

const METRIC_CONFIG = [
  { key: "totalUsers",   label: "Total Users",    icon: "👥", color: "#6366f1", bg: "#eef2ff", format: v => v?.toLocaleString("en-IN") },
  { key: "totalOrders",  label: "Total Orders",   icon: "🛒", color: "#f59e0b", bg: "#fffbeb", format: v => v?.toLocaleString("en-IN") },
  { key: "totalRevenue", label: "Total Revenue",  icon: "💰", color: "#22c55e", bg: "#f0fdf4", format: v => `₹${Number(v)?.toLocaleString("en-IN")}` },
  { key: "todayOrders",  label: "Today's Orders", icon: "📅", color: "#0ea5e9", bg: "#e0f2fe", format: v => v?.toLocaleString("en-IN") },
];

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const navigate              = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      setData(res.data.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    let deferredPrompt;
    const handler = (e) => { e.preventDefault(); deferredPrompt = e; };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  /* ── Loading ── */
  if (loading) return (
    <AdminLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 340, flexDirection: "column", gap: 14 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#6366f1" }}
        />
        <p style={{ color: "#9ca3af", margin: 0, fontSize: 14 }}>Loading dashboard…</p>
      </div>
    </AdminLayout>
  );

  /* ── Error ── */
  if (error) return (
    <AdminLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <p style={{ color: "#6b7280", margin: 0 }}>Failed to load dashboard</p>
        <button
          onClick={fetchDashboard}
          style={{ padding: "8px 20px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}
        >
          Try Again
        </button>
      </div>
    </AdminLayout>
  );

  /* ── max for progress bars ── */
  const maxStatusCount = Math.max(...(data.statusStats?.map(s => s.count) || [1]));

  /* ─────────── UI ─────────── */
  return (
    <AdminLayout>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Dashboard Overview</h3>
          <p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: 13 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={fetchDashboard}
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

      {/* ── Metric Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        {METRIC_CONFIG.map((m, i) => (
          <MetricCard key={m.key} config={m} value={data[m.key]} delay={i * 0.08} />
        ))}
      </div>

      {/* ── Bottom Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 16 }}>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}
        >
          <h5 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 14, color: "#374151" }}>📊 Orders by Status</h5>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.statusStats?.map((s) => {
              const meta = STATUS_META[s._id] || { color: "#6b7280", bg: "#f3f4f6", label: s._id, icon: "•" };
              const pct  = Math.round((s.count / maxStatusCount) * 100);
              return (
                <div key={s._id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                      {meta.icon} {meta.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>{s.count}</span>
                  </div>
                  <div style={{ height: 7, background: "#f3f4f6", borderRadius: 10, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                      style={{ height: "100%", background: meta.color, borderRadius: 10 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h5 style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#374151" }}>🕒 Recent Orders</h5>
            <button
              onClick={() => navigate("/admin/orders")}
              style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              View All →
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                  {["Order", "Customer", "Total", "Status", "Date"].map(h => (
                    <th key={h} style={{
                      padding: "8px 10px", textAlign: "left", fontWeight: 600,
                      color: "#9ca3af", fontSize: 11, textTransform: "uppercase", letterSpacing: .5,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentOrders?.map((o, i) => (
                  <motion.tr
                    key={o._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    onClick={() => navigate(`/admin/order/${o._id}`)}
                    style={{ borderBottom: "1px solid #f9fafb", cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 10px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#6366f1", background: "#eef2ff", padding: "2px 6px", borderRadius: 4 }}>
                        #{o._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{o.user?.name || "—"}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{o.user?.phone}</div>
                    </td>
                    <td style={{ padding: "10px 10px", fontWeight: 700, color: "#111827" }}>
                      ₹{Number(o.total)?.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td style={{ padding: "10px 10px", color: "#9ca3af", fontSize: 12, whiteSpace: "nowrap" }}>
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </AdminLayout>
  );
}

/* ── Metric Card ── */
function MetricCard({ config, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      style={{
        background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
        padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        display: "flex", alignItems: "flex-start", gap: 14,
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 12, background: config.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0,
      }}>
        {config.icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>
          {config.label}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginTop: 2, lineHeight: 1 }}>
          {config.format(value)}
        </div>
      </div>
    </motion.div>
  );
}