// components/RiderLayout.jsx
import { useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

const NAV = [
  { to: "/rider/dashboard", icon: "🛵", label: "My Orders"  },
  { to: "/rider/earnings",  icon: "💰", label: "Earnings"   },
  { to: "/rider/profile",   icon: "👤", label: "Profile"    },
];

export default function RiderLayout({ children }) {
  const navigate = useNavigate();
  const rider    = JSON.parse(localStorage.getItem("rider") || "null");

  useEffect(() => {
    if (!rider) navigate("/rider/login");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("riderToken");
    localStorage.removeItem("rider");
    navigate("/rider/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6f7f9", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#1a1f2e", display: "flex",
        flexDirection: "column", padding: "0 0 20px",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        {/* Header */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {rider?.name?.[0]?.toUpperCase() || "R"}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{rider?.name || "Rider"}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Delivery Agent</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, marginBottom: 4,
              textDecoration: "none", fontSize: 14, fontWeight: 500,
              background: isActive ? "rgba(249,115,22,.15)" : "transparent",
              color: isActive ? "#f97316" : "#9ca3af",
              transition: "all .15s",
            })}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ margin: "0 10px", padding: "10px 12px", borderRadius: 10, border: "none", background: "rgba(239,68,68,.12)", color: "#ef4444", cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: 24, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}