import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
}, [fetchUsers]);


  return (
    <AdminLayout>
      <h3 className="mb-3">Users</h3>

      {/* SEARCH + FILTER */}
      <div className="row mb-3">
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

      {/* USERS TABLE */}
      <div className="card">
        <table className="table mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
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
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/admin/users/${u._id}`)}
                >
                  <td>{i + 1}</td>
                  <td>{u.name || "-"}</td>
                  <td>{u.phone}</td>
                  <td>{u.email || "-"}</td>
                  <td>
                    <span
                      className={`badge ${
                        isActive ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
