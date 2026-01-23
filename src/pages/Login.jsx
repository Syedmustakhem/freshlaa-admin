import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/admin/login", {
        email,
        password,
      });

      const token = res.data.token;
      if (!token) {
        throw new Error("Token not received");
      }

      localStorage.setItem("adminToken", token);
      navigate("/products");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-gradient">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-4 rounded-4 shadow-lg"
        style={{ width: "360px" }}
      >
        {/* LOGO / TITLE */}
        <div className="text-center mb-4">
          <div
            className="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center mb-2"
            style={{ width: 56, height: 56, fontSize: 24 }}
          >
            🛡️
          </div>
          <h4 className="fw-bold mb-1">Freshlaa Admin</h4>
          <small className="text-muted">Secure admin access</small>
        </div>

        {/* EMAIL */}
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Email</label>
        </div>

        {/* PASSWORD */}
        <div className="form-floating mb-4">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label>Password</label>
        </div>

        {/* BUTTON */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="btn btn-dark w-100 py-2 fw-bold"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2" />
          ) : null}
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        {/* FOOTER */}
        <div className="text-center mt-3">
          <small className="text-muted">
            Authorized access only
          </small>
        </div>
      </motion.form>

      {/* BACKGROUND STYLE */}
      <style>
        {`
          .bg-gradient {
            background: linear-gradient(135deg, #111827, #1f2933);
          }
        `}
      </style>
    </div>
  );
}
