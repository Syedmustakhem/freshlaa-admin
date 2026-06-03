import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

/* ─────────────────────────────────────────────
   HELPERS  (ALL LOGIC UNCHANGED)
───────────────────────────────────────────── */
const STATUS_META = {
  Placed:         { color: "#818cf8", bg: "rgba(129,140,248,.12)", label: "Placed",           icon: "🛒" },
  Packed:         { color: "#fbbf24", bg: "rgba(251,191,36,.12)",  label: "Packed",           icon: "📦" },
  OutForDelivery: { color: "#38bdf8", bg: "rgba(56,189,248,.12)",  label: "Out for Delivery", icon: "🚴" },
  Delivered:      { color: "#34d399", bg: "rgba(52,211,153,.12)",  label: "Delivered",        icon: "✅" },
  Cancelled:      { color: "#f87171", bg: "rgba(248,113,113,.12)", label: "Cancelled",        icon: "❌" },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: "#9ca3af", bg: "rgba(156,163,175,.12)", label: status, icon: "•" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700,
      color: meta.color, background: meta.bg,
      border: `1px solid ${meta.color}40`,
      letterSpacing: ".03em",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
      {meta.label}
    </span>
  );
};

const METRIC_CONFIG = [
  { key: "totalUsers",   label: "Total Users",    icon: "👥", accent: "#818cf8", glow: "rgba(129,140,248,.25)", format: v => v?.toLocaleString("en-IN") },
  { key: "totalOrders",  label: "Total Orders",   icon: "🛒", accent: "#fbbf24", glow: "rgba(251,191,36,.25)",  format: v => v?.toLocaleString("en-IN") },
  { key: "totalRevenue", label: "Total Revenue",  icon: "💰", accent: "#34d399", glow: "rgba(52,211,153,.25)",  format: v => `₹${Number(v)?.toLocaleString("en-IN")}` },
  { key: "todayOrders",  label: "Today's Orders", icon: "📅", accent: "#38bdf8", glow: "rgba(56,189,248,.25)",  format: v => v?.toLocaleString("en-IN") },
];

/* ─────────────────────────────────────────────
   MAIN  (ALL LOGIC UNCHANGED)
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
      <div style={styles.centerBox}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(129,140,248,.2)", borderTopColor: "#818cf8" }}
        />
        <p style={{ color: "#6b7280", margin: 0, fontSize: 13, letterSpacing: ".03em" }}>Loading dashboard…</p>
      </div>
    </AdminLayout>
  );

  /* ── Error ── */
  if (error) return (
    <AdminLayout>
      <div style={styles.centerBox}>
        <div style={{ fontSize: 44 }}>⚠️</div>
        <p style={{ color: "#6b7280", margin: 0 }}>Failed to load dashboard</p>
        <button onClick={fetchDashboard} style={styles.retryBtn}>Try Again</button>
      </div>
    </AdminLayout>
  );

  const maxStatusCount = Math.max(...(data.statusStats?.map(s => s.count) || [1]));

  /* ─────────── UI ─────────── */
  return (
    <>
      <style>{CSS}</style>
      <AdminLayout>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 4, height: 28, borderRadius: 4,
                background: "linear-gradient(180deg, #818cf8, #38bdf8)",
                boxShadow: "0 0 12px rgba(129,140,248,.6)",
              }} />
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "#f1f5f9", letterSpacing: "-.02em", fontFamily: "'Syne', sans-serif" }}>
                Dashboard Overview
              </h3>
            </div>
            <p style={{ margin: "0 0 0 14px", color: "#64748b", fontSize: 12.5, letterSpacing: ".02em" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button onClick={fetchDashboard} className="refresh-btn">
            <span style={{ display: "inline-block", animation: "none" }} className="refresh-icon">🔄</span>
            Refresh
          </button>
        </motion.div>

        {/* ── Metric Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 20 }}>
          {METRIC_CONFIG.map((m, i) => (
            <MetricCard key={m.key} config={m} value={data[m.key]} delay={i * 0.07} />
          ))}
        </div>

        {/* ── Bottom Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 16 }}>

          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={styles.card}
          >
            <div style={styles.cardHeader}>
              <span style={styles.cardAccent} />
              <h5 style={styles.cardTitle}>Orders by Status</h5>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.statusStats?.map((s) => {
                const meta = STATUS_META[s._id] || { color: "#9ca3af", bg: "rgba(156,163,175,.12)", label: s._id, icon: "•" };
                const pct  = Math.round((s.count / maxStatusCount) * 100);
                return (
                  <div key={s._id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8, background: meta.bg,
                          display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                          border: `1px solid ${meta.color}30`,
                        }}>{meta.icon}</span>
                        {meta.label}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: meta.color, fontFamily: "'Syne', sans-serif" }}>{s.count}</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,.06)", borderRadius: 999, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.45, duration: 0.7, ease: "easeOut" }}
                        style={{
                          height: "100%", borderRadius: 999,
                          background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})`,
                          boxShadow: `0 0 10px ${meta.color}55`,
                        }}
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
            style={styles.card}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={styles.cardAccent} />
                <h5 style={styles.cardTitle}>Recent Orders</h5>
              </div>
              <button
                onClick={() => navigate("/admin/orders")}
                style={{
                  fontSize: 12, color: "#818cf8", background: "rgba(129,140,248,.1)",
                  border: "1px solid rgba(129,140,248,.25)", cursor: "pointer", fontWeight: 700,
                  padding: "5px 12px", borderRadius: 8, letterSpacing: ".03em", transition: "all .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(129,140,248,.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(129,140,248,.1)"; }}
              >
                View All →
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                    {["Order", "Customer", "Total", "Status", "Date"].map(h => (
                      <th key={h} style={{
                        padding: "8px 12px 12px", textAlign: "left", fontWeight: 700,
                        color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em",
                        fontFamily: "'Syne', sans-serif",
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
                      className="order-row"
                      style={{ borderBottom: "1px solid rgba(255,255,255,.04)", cursor: "pointer" }}
                    >
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{
                          fontFamily: "monospace", fontSize: 11, color: "#818cf8",
                          background: "rgba(129,140,248,.12)", padding: "3px 7px", borderRadius: 6,
                          border: "1px solid rgba(129,140,248,.2)", letterSpacing: ".05em",
                        }}>
                          #{o._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "11px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg, #818cf8, #38bdf8)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: 12, color: "#fff",
                            boxShadow: "0 0 10px rgba(129,140,248,.35)",
                          }}>
                            {(o.user?.name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{o.user?.name || "—"}</div>
                            <div style={{ fontSize: 11, color: "#475569" }}>{o.user?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "11px 12px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne', sans-serif", fontSize: 14 }}>
                        ₹{Number(o.total)?.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "11px 12px" }}>
                        <StatusBadge status={o.status} />
                      </td>
                      <td style={{ padding: "11px 12px", color: "#475569", fontSize: 12, whiteSpace: "nowrap" }}>
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
    </>
  );
}

/* ── Metric Card ── */
function MetricCard({ config, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="metric-card"
      style={{
        borderRadius: 16,
        border: `1px solid ${config.accent}25`,
        padding: "20px 22px",
        display: "flex", alignItems: "flex-start", gap: 16,
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, rgba(15,23,42,.95) 0%, rgba(15,23,42,.8) 100%)`,
        boxShadow: `0 0 0 1px ${config.accent}15, inset 0 1px 0 rgba(255,255,255,.05)`,
      }}
    >
      {/* Glow top-right */}
      <div style={{
        position: "absolute", top: -30, right: -30, width: 100, height: 100,
        background: config.glow, borderRadius: "50%", filter: "blur(30px)", pointerEvents: "none",
      }} />
      {/* Bottom bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: "0 0 16px 16px",
        background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)`,
        opacity: .7,
      }} />

      <div style={{
        width: 48, height: 48, borderRadius: 13,
        background: `linear-gradient(135deg, ${config.accent}22, ${config.accent}11)`,
        border: `1px solid ${config.accent}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0,
        boxShadow: `0 4px 16px ${config.glow}`,
      }}>
        {config.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10.5, color: "#475569", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
          {config.label}
        </div>
        <div style={{
          fontSize: 26, fontWeight: 900, color: "#f1f5f9", marginTop: 4, lineHeight: 1,
          letterSpacing: "-.02em", fontFamily: "'Syne', sans-serif",
        }}>
          {config.format(value)}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Shared style objects ── */
const styles = {
  card: {
    background: "linear-gradient(135deg, rgba(15,23,42,.95) 0%, rgba(15,23,42,.8) 100%)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.07)",
    padding: "22px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.04)",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 18 },
  cardAccent: {
    display: "inline-block", width: 3, height: 18, borderRadius: 4,
    background: "linear-gradient(180deg, #818cf8, #38bdf8)",
    boxShadow: "0 0 8px rgba(129,140,248,.6)",
    flexShrink: 0,
  },
  cardTitle: { margin: 0, fontWeight: 700, fontSize: 13.5, color: "#cbd5e1", letterSpacing: ".04em", textTransform: "uppercase", fontFamily: "'Syne', sans-serif" },
  centerBox: { display: "flex", alignItems: "center", justifyContent: "center", height: 340, flexDirection: "column", gap: 14 },
  retryBtn: { padding: "9px 22px", borderRadius: 10, background: "linear-gradient(135deg, #818cf8, #6366f1)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 0 20px rgba(99,102,241,.4)" },
};

/* ── Global CSS injected once ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&display=swap');

  .metric-card { transition: transform .2s, box-shadow .2s; }
  .metric-card:hover { transform: translateY(-3px); }

  .refresh-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px;
    border: 1px solid rgba(129,140,248,.3);
    background: rgba(129,140,248,.08);
    cursor: pointer; font-size: 13px; font-weight: 600;
    color: #a5b4fc; letter-spacing: .03em;
    transition: all .2s;
  }
  .refresh-btn:hover {
    background: rgba(129,140,248,.16);
    border-color: rgba(129,140,248,.5);
    color: #c7d2fe;
  }
  .refresh-btn:hover .refresh-icon { animation: spin .5s linear; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .order-row { transition: background .15s; }
  .order-row:hover { background: rgba(129,140,248,.06) !important; }
`;