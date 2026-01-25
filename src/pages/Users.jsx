import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users", {
        params: { search, status },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setUsers(res.data.data || []);
    } catch {
      alert("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, status]);

  return (
    <AdminLayout>
      <h3 className="page-heading">Users</h3>

      {/* Search & Filter */}
      <motion.div
        className="dashboard-card mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Search by name, phone, email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Users</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        className="dashboard-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, i) => {
                const isActive = !u.isBlocked;

                return (
                  <tr
                    key={u._id}
                    onClick={() => navigate(`/admin/users/${u._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{i + 1}</td>

                    <td>
                      <strong>{u.name || "—"}</strong>
                      <div className="text-muted small">
                        {u.email || "No email"}
                      </div>
                    </td>

                    <td>{u.phone}</td>

                    <td>
                      <span
                        className={`status-badge ${
                          isActive ? "completed" : "cancelled"
                        }`}
                      >
                        {isActive ? "Active" : "Blocked"}
                      </span>
                    </td>

                    <td>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
