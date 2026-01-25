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

  const fetchUser = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setUser(res.data.data);
    } catch {
      alert("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      await api.patch(
        `/admin/users/${id}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchUser();
    } catch {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchUser();
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

  const isActive = !user.isBlocked;

  return (
    <AdminLayout>
      <button
        className="btn btn-light mb-4"
        onClick={() => navigate(-1)}
      >
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
              <span
                className={`status-badge ${
                  isActive ? "completed" : "cancelled"
                }`}
              >
                {isActive ? "Active" : "Blocked"}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <strong>Joined</strong>
          <div>
            {new Date(user.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="mb-4">
          <button
            className={`btn ${
              isActive ? "btn-outline-danger" : "btn-outline-success"
            }`}
            onClick={toggleStatus}
          >
            {isActive ? "Block User" : "Unblock User"}
          </button>
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
