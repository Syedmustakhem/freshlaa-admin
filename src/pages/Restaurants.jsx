import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Restaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", address: "" });

  /* ================= FETCH ================= */
  const fetchRestaurants = async () => {
    try {
      const res = await api.get("/restaurants", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setRestaurants(res.data.data || []);
    } catch {
      alert("Failed to load restaurants");
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  /* ================= ADD ================= */
  const addRestaurant = async () => {
    try {
      await api.post("/restaurants", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setShowModal(false);
      setForm({ name: "", address: "" });
      fetchRestaurants();
    } catch {
      alert("Failed to add restaurant");
    }
  };

  /* ================= TOGGLE ================= */
  const toggleStatus = async (id) => {
    try {
      await api.patch(
        `/restaurants/${id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchRestaurants();
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="page-heading">Restaurants</h3>
        <button className="btn btn-dark" onClick={() => setShowModal(true)}>
          + Add Restaurant
        </button>
      </div>

      {/* TABLE */}
      <motion.div
        className="dashboard-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Restaurant</th>
                <th>Address</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {restaurants.map((r, i) => (
                <tr key={r._id}>
                  <td>{i + 1}</td>

                  <td>
                    <strong>{r.name}</strong>
                  </td>

                  <td className="text-muted">
                    {r.address || "—"}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        r.isActive ? "completed" : "cancelled"
                      }`}
                    >
                      {r.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() =>
                        navigate(`/restaurants/${r._id}/products`)
                      }
                    >
                      Products
                    </button>

                    <button
                      className="btn btn-sm btn-outline-dark me-2"
                      onClick={() =>
                        navigate(`/restaurants/${r._id}/orders`)
                      }
                    >
                      Orders
                    </button>

                    <button
                      className="btn btn-sm btn-outline-success me-2"
                      onClick={() =>
                        navigate(`/restaurants/${r._id}/dashboard`)
                      }
                    >
                      Dashboard
                    </button>

                    <button
                      className={`btn btn-sm ${
                        r.isActive
                          ? "btn-outline-danger"
                          : "btn-outline-success"
                      }`}
                      onClick={() => toggleStatus(r._id)}
                    >
                      {r.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}

              {restaurants.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No restaurants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ADD MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Add Restaurant</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-3"
                  placeholder="Restaurant Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />

                <textarea
                  className="form-control"
                  placeholder="Address"
                  rows={3}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-dark" onClick={addRestaurant}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
