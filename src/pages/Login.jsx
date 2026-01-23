import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";
import "../index.css"; // 👈 ADD THIS

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/products");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-bg">
      <motion.form
        className="admin-login-card"
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="login-logo">🛡️</div>

        <h3 className="login-title">Freshlaa Admin</h3>
        <p className="login-subtitle">Secure dashboard access</p>

        <div className="login-input">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-input">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="login-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        <p className="login-footer">Authorized access only</p>
      </motion.form>
    </div>
  );
}
