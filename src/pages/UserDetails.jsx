import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
        <p>Loading user...</p>
      </AdminLayout>
    );
  }

  if (!user) return null;

  const isActive = !user.isBlocked;

  return (
    <AdminLayout>
      <button className="btn btn-light mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="card p-4">
        <h4 className="mb-3">User Profile</h4>

        <p><strong>Name:</strong> {user.name || "-"}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Email:</strong> {user.email || "-"}</p>

        <p>
          <strong>Status:</strong>{" "}
          <span className={`badge ${user.isBlocked ? "bg-danger" : "bg-success"}`}>
  {user.isBlocked ? "Blocked" : "Active"}
</span>

        </p>

        <p>
          <strong>Joined:</strong>{" "}
          {new Date(user.createdAt).toLocaleString()}
        </p>

        <div className="mt-3">
         <button
  className={`btn ${user.isBlocked ? "btn-success" : "btn-danger"}`}
  onClick={toggleStatus}
>
  {user.isBlocked ? "Unblock User" : "Block User"}
</button>

        </div>

        <hr className="my-4" />

        {/* LINKS */}
        <div className="d-flex gap-2">
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
      </div>
    </AdminLayout>
  );
}
