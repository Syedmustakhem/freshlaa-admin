import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

const Avatar = ({ name }) => {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["#6366f1","#0ea5e9","#f59e0b","#22c55e","#ec4899","#8b5cf6","#14b8a6"];
  const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", background: color,
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 13, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

const PAGE_SIZES = [10, 25, 50];

function PagBtn({ onClick, disabled, active, label }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: 32, height: 32, padding: "0 6px", borderRadius: 7,
      border: active ? "1px solid #6366f1" : "1px solid #e5e7eb",
      background: active ? "#6366f1" : disabled ? "#f9fafb" : "#fff",
      color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 13, fontWeight: active ? 700 : 400, transition: "all .15s",
    }}>{label}</button>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function Users() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState("");
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast]       = useState(null);
  const navigate                = useNavigate();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", {
        params: { search, status },
        headers: authHeader(),
      });
      setUsers(res.data.data || []);
      setPage(1);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, status]);

  /* ── Stats ── */
  const totalUsers   = users.length;
  const activeUsers  = users.filter(u => !u.isBlocked).length;
  const blockedUsers = users.filter(u => u.isBlocked).length;

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const paginated  = users.slice((page - 1) * pageSize, page * pageSize);

  const PagBtn = ({ onClick, disabled, active, label }) => (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: 32, height: 32, padding: "0 6px", borderRadius: 7,
      border: active ? "1px solid #6366f1" : "1px solid #e5e7eb",
      background: active ? "#6366f1" : disabled ? "#f9fafb" : "#fff",
      color: active ? "#fff" : disabled ? "#d1d5db" : "#374151",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 13, fontWeight: active ? 700 : 400,
    }}>{label}</button>
  );

  /* ─────────── RENDER ─────────── */
  return (
    <AdminLayout>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13,
          background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
          color: toast.type === "error" ? "#ef4444" : "#16a34a",
          border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`,
          boxShadow: "0 4px 12px rgba(0,0,0,.1)",
        }}>
          {toast.type === "error" ? "❌ " : "✅ "}{toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Users</h3>
          <p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: 13 }}>
            Manage and monitor your user base
          </p>
        </div>
        <button onClick={fetchUsers} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
          background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500,
          color: "#374151", boxShadow: "0 1px 2px rgba(0,0,0,.05)",
        }}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Total Users",   value: totalUsers,   icon: "👥", color: "#6366f1", bg: "#eef2ff" },
          { label: "Active",        value: activeUsers,  icon: "✅", color: "#22c55e", bg: "#f0fdf4" },
          { label: "Blocked",       value: blockedUsers, icon: "🚫", color: "#ef4444", bg: "#fef2f2" },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{
              background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
              padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,.05)",
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: c.color, lineHeight: 1.1 }}>{c.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        style={{
          background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
          padding: "14px 16px", marginBottom: 14,
          display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end",
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}
      >
        {/* Search */}
        <div style={{ flex: "1 1 220px", minWidth: 180 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 5 }}>Search</div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
            <input
              placeholder="Name, phone, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px 8px 32px", borderRadius: 8,
                border: "1px solid #d1d5db", fontSize: 13, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Status filter */}
        <div style={{ flex: "0 0 160px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 5 }}>Status</div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", background: "#fff" }}
          >
            <option value="">All Users</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Clear */}
        {(search || status) && (
          <button
            onClick={() => { setSearch(""); setStatus(""); }}
            style={{ alignSelf: "flex-end", padding: "8px 14px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
          >
            ✕ Clear
          </button>
        )}
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}
      >
        {loading ? (
          <div style={{ padding: 52, textAlign: "center", color: "#9ca3af" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#6366f1", margin: "0 auto 12px" }}
            />
            Loading users…
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    {["#", "User", "Contact", "Status", "Joined", ""].map(h => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: .5, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 52, textAlign: "center", color: "#9ca3af" }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                        No users found
                      </td>
                    </tr>
                  ) : paginated.map((u, i) => {
                    const isActive = !u.isBlocked;
                    return (
                      <tr
                        key={u._id}
                        style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer", transition: "background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                        onClick={() => navigate(`/admin/users/${u._id}`)}
                      >
                        {/* # */}
                        <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 12 }}>
                          {(page - 1) * pageSize + i + 1}
                        </td>

                        {/* User */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={u.name} />
                            <div>
                              <div style={{ fontWeight: 600, color: "#111827" }}>{u.name || "—"}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>{u.email || "No email"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: "12px 14px", color: "#374151" }}>
                          {u.phone || "—"}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            color: isActive ? "#16a34a" : "#ef4444",
                            background: isActive ? "#f0fdf4" : "#fef2f2",
                            border: `1px solid ${isActive ? "#86efac" : "#fca5a5"}`,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "#22c55e" : "#ef4444" }} />
                            {isActive ? "Active" : "Blocked"}
                          </span>
                        </td>

                        {/* Joined */}
                        <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: 12, whiteSpace: "nowrap" }}>
                          {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>

                        {/* Arrow */}
                        <td style={{ padding: "12px 14px", color: "#d1d5db", textAlign: "right" }}>
                          →
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderTop: "1px solid #e5e7eb", flexWrap: "wrap", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" }}>
                Show
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                >
                  {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                entries · <strong style={{ color: "#111827" }}>{users.length}</strong> total
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <PagBtn onClick={() => setPage(1)}          disabled={page === 1}          label="«" />
                <PagBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}          label="‹" />
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i-1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
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
      </motion.div>
    </AdminLayout>
  );

}