import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codStatus, setCodStatus] = useState(null);
  const [codLoading, setCodLoading] = useState(false);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  };

  const fetchUser = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`, { headers });
      setUser(res.data.data);
    } catch {
      alert("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const fetchCodStatus = async () => {
    try {
      const res = await api.get(`/admin/users/${id}/cod-status`, { headers });
      setCodStatus(res.data.codStats);
    } catch {
      console.log("COD status fetch failed");
    }
  };

  const toggleCod = async () => {
    if (!codStatus) return;
    const enable = codStatus.isBlocked || !codStatus.isOverridden;
    setCodLoading(true);
    try {
      await api.put(
        `/admin/users/${id}/cod-override`,
        { enable },
        { headers: { ...headers, "Content-Type": "application/json" } }
      );
      await fetchCodStatus();
    } catch {
      alert("Failed to update COD status");
    } finally {
      setCodLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      await api.patch(`/admin/users/${id}/status`, {}, { headers });
      fetchUser();
    } catch {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCodStatus();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-card text-center py-5 text-muted">
          Loading user…
        </div>
      </AdminLayout>
    );
  }

  if (!user) return null;

  const isActive   = !user.isBlocked;
  const codEnabled = codStatus ? (!codStatus.isBlocked || codStatus.isOverridden) : true;

  return (
    <AdminLayout>
      <button className="btn btn-light mb-4" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <motion.div
        className="dashboard-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4 className="mb-4">User Profile</h4>

        <div className="row mb-3">
          <div className="col-md-6">
            <strong>Name</strong>
            <div>{user.name || "—"}</div>
          </div>
          <div className="col-md-6">
            <strong>Phone</strong>
            <div>{user.phone}</div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <strong>Email</strong>
            <div>{user.email || "—"}</div>
          </div>
          <div className="col-md-6">
            <strong>Status</strong>
            <div>
              <span className={`status-badge ${isActive ? "completed" : "cancelled"}`}>
                {isActive ? "Active" : "Blocked"}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <strong>Joined</strong>
          <div>{new Date(user.createdAt).toLocaleString()}</div>
        </div>

        <div className="mb-4">
          <button
            className={`btn ${isActive ? "btn-outline-danger" : "btn-outline-success"}`}
            onClick={toggleStatus}
          >
            {isActive ? "Block User" : "Unblock User"}
          </button>
        </div>

        <hr className="my-4" />

        {/* ── COD OVERRIDE SECTION ── */}
        <div
          style={{
            background: codEnabled ? "#f0fdf4" : "#fff5f5",
            border: `1px solid ${codEnabled ? "#86efac" : "#fca5a5"}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            {/* Left — info */}
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ fontSize: 18 }}>💵</span>
                <strong style={{ fontSize: 15 }}>Cash on Delivery (COD)</strong>
                {codStatus?.isOverridden && (
                  <span
                    style={{
                      fontSize: 10,
                      background: "#dcfce7",
                      color: "#15803d",
                      borderRadius: 20,
                      padding: "2px 8px",
                      fontWeight: 700,
                    }}
                  >
                    ADMIN OVERRIDE
                  </span>
                )}
              </div>

              {codStatus ? (
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  COD Orders: <strong>{codStatus.total}</strong> &nbsp;|&nbsp;
                  Cancelled: <strong style={{ color: codStatus.cancelled > 0 ? "#dc2626" : "#16a34a" }}>
                    {codStatus.cancelled}
                  </strong> &nbsp;|&nbsp;
                  Cancel Rate: <strong>{codStatus.rate}%</strong>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Loading COD stats…</div>
              )}

              <div style={{ marginTop: 4, fontSize: 12 }}>
                Status:{" "}
                <strong style={{ color: codEnabled ? "#16a34a" : "#dc2626" }}>
                  {codEnabled ? "✅ Enabled" : "❌ Blocked (auto)"}
                </strong>
              </div>
            </div>

            {/* Right — toggle button */}
            <button
              onClick={toggleCod}
              disabled={codLoading}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
                fontSize: 13,
                cursor: codLoading ? "not-allowed" : "pointer",
                background: codEnabled ? "#fee2e2" : "#dcfce7",
                color: codEnabled ? "#dc2626" : "#16a34a",
                opacity: codLoading ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {codLoading
                ? "Updating…"
                : codEnabled
                ? "🚫 Disable COD"
                : "✅ Enable COD"}
            </button>
          </div>
        </div>

        <hr className="my-4" />

        {/* LINKS */}
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate(`/admin/users/${id}/orders`)}
          >
            View Orders
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(`/admin/users/${id}/addresses`)}
          >
            View Addresses
          </button>
          <button
            className="btn btn-outline-dark"
            onClick={() => navigate(`/admin/users/${id}/cart`)}
          >
            View Cart
          </button>
        </div>
      </motion.div>
    </AdminLayout>
  );
}