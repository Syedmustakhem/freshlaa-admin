import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get("/admin/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      .then((res) => setAdmin(res.data.data))
      .catch(() => {
        showToast({
          type: "error",
          message: "Failed to load profile",
        });
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-card text-muted">
          Loading profile…
        </div>
      </AdminLayout>
    );
  }

  if (!admin) return null;

  return (
    <AdminLayout>
      <h3 className="page-heading">My Profile</h3>

      <div className="dashboard-card" style={{ maxWidth: 500 }}>
        <div className="profile-row">
          <span>Name</span>
          <strong>{admin.name || "—"}</strong>
        </div>

        <div className="profile-row">
          <span>Email</span>
          <strong>{admin.email}</strong>
        </div>

        <div className="profile-row">
          <span>Role</span>
          <strong>{admin.role || "Admin"}</strong>
        </div>

        <div className="profile-row">
          <span>Joined</span>
          <strong>
            {new Date(admin.createdAt).toLocaleDateString()}
          </strong>
        </div>
      </div>
    </AdminLayout>
  );
}
