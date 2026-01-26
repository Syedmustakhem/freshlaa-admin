import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Restaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    categoryId: "",
  });

  /* ================= FETCH RESTAURANTS ================= */
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

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setCategories(res.data.data || []);
    } catch {
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchCategories();
  }, []);

  /* ================= ADD RESTAURANT ================= */
  const addRestaurant = async () => {
    if (!form.name || !form.categoryId) {
      alert("Restaurant name and category are required");
      return;
    }

    try {
      await api.post("/restaurants", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      setShowModal(false);
      setForm({ name: "", address: "", categoryId: "" });
      fetchRestaurants();
    } catch {
      alert("Failed to add restaurant");
    }
  };

  /* ================= TOGGLE OPEN / CLOSE ================= */
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

      {/* ================= TABLE ================= */}
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
                <th>Category</th>
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
                    {r.categoryId?.name || "—"}
                  </td>

                  <td className="text-muted">
                    {r.address || "—"}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        r.isOpen ? "completed" : "cancelled"
                      }`}
                    >
                      {r.isOpen ? "Open" : "Closed"}
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
                        r.isOpen
                          ? "btn-outline-danger"
                          : "btn-outline-success"
                      }`}
                      onClick={() => toggleStatus(r._id)}
                    >
                      {r.isOpen ? "Close" : "Open"}
                    </button>
                  </td>
                </tr>
              ))}

              {restaurants.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No restaurants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ================= ADD MODAL ================= */}
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

                <select
                  className="form-control mb-3"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

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
