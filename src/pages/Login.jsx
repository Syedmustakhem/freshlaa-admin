import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);

      // ✅ success animation before redirect
      setSuccess(true);

      setTimeout(() => {
        navigate("/products");
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      {/* Background blobs */}
      <div className="login-blob blob-1" />
      <div className="login-blob blob-2" />

      <AnimatePresence>
        {!success && (
          <motion.form
            className="login-glass-card"
            onSubmit={handleLogin}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="login-logo-circle">🛡️</div>

            <h2 className="login-title">FreshLaa Admin</h2>
            <p className="login-subtitle">
              Secure access to your control panel
            </p>

            {error && (
              <motion.div
                className="login-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ⚠️ {error}
              </motion.div>
            )}

            <div className="login-field">
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD FIELD WITH EYE INSIDE */}
            <div className="login-field password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <motion.button
              className="login-gradient-btn"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? <div className="login-spinner" /> : "Sign In"}
            </motion.button>

            <div className="login-footer">
              Authorized personnel only
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* SUCCESS STATE */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="login-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="success-check">✓</div>
            <h3>Login Successful</h3>
            <p>Redirecting to dashboard…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
