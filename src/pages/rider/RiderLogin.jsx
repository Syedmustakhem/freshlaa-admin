// pages/rider/RiderLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function RiderLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Enter email and password"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/rider/login", { email, password });
      localStorage.setItem("riderToken", res.data.token);
      localStorage.setItem("rider",      JSON.stringify(res.data.rider));
      navigate("/rider/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a1f2e 0%,#2d3748 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ width: 380, background: "#fff", borderRadius: 20, padding: 36, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 32, border: "2px solid #fed7aa" }}>
            🛵
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1a1f2e" }}>Rider Portal</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Freshlaa Delivery</p>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#ef4444", fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="rider@freshlaa.com"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{ padding: "12px", borderRadius: 10, border: "none", background: loading ? "#fed7aa" : "#f97316", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#9ca3af" }}>
          Contact your admin for login credentials
        </p>
      </div>
    </div>
  );
}