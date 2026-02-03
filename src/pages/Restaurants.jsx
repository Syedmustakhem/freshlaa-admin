import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

/* 🔥 SAME SLUGS AS APP */
const CATEGORY_OPTIONS = [
  { name: "Fresh Fruit Juices", slug: "fresh-fruit-juices" },
  { name: "Fresh Fruits & Salads", slug: "fresh-fruits-salads" },
  { name: "Cool Drinks", slug: "cool-drinks" },
  { name: "Meals, Biryani & Curries", slug: "meals-biryani-curries" },
  { name: "Home Food", slug: "home-food" },
  { name: "Pizza & Noodles", slug: "pizza-noodles" },
  { name: "Non-Veg", slug: "non-veg" },
  { name: "Fast Food", slug: "fast-food" },
  { name: "Pani Puri & More", slug: "pani-puri-more" },
];

export default function Restaurants() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    image: "",
    categorySlug: "",
    isOpen: true,
  });

  /* ================= FETCH ================= */
  const fetchRestaurants = async () => {
    const res = await api.get("/restaurants");
    setRestaurants(res.data.data || []);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  /* ================= ADD ================= */
  const addRestaurant = async () => {
    if (!form.name || !form.categorySlug) {
      alert("Restaurant name and category are required");
      return;
    }

    await api.post("/restaurants", form);
    closeModal();
    fetchRestaurants();
  };

  /* ================= UPDATE ================= */
  const updateRestaurant = async () => {
    if (!form.name || !form.categorySlug) {
      alert("Restaurant name and category are required");
      return;
    }

    await api.put(`/restaurants/${editId}`, form);
    closeModal();
    fetchRestaurants();
  };

  /* ================= CLOSE MODAL ================= */
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({
      name: "",
      address: "",
      image: "",
      categorySlug: "",
      isOpen: true,
    });
  };

  /* ================= TOGGLE ================= */
  const toggleStatus = async (id) => {
    await api.patch(`/restaurants/${id}/toggle`);
    fetchRestaurants();
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
                  <td className="text-muted">{r.categorySlug}</td>
                  <td className="text-muted">{r.address || "—"}</td>
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
                    {/* MENU */}
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() =>
                        navigate(`/admin/restaurants/${r._id}/menu`)
                      }
                    >
                      Menu
                    </button>

                    {/* EDIT */}
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => {
                        setForm({
                          name: r.name || "",
                          address: r.address || "",
                          image: r.image || "",
                          categorySlug: r.categorySlug || "",
                          isOpen: r.isOpen ?? true,
                        });
                        setEditId(r._id);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>

                    {/* TOGGLE */}
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

              {!restaurants.length && (
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

      {/* MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editId ? "Edit Restaurant" : "Add Restaurant"}</h5>
                <button className="btn-close" onClick={closeModal} />
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

                <input
                  className="form-control mb-3"
                  placeholder="Banner Image URL"
                  value={form.image}
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.value })
                  }
                />

                <select
                  className="form-control mb-3"
                  value={form.categorySlug}
                  onChange={(e) =>
                    setForm({ ...form, categorySlug: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.slug} value={c.slug}>
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

                <div className="form-check form-switch mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.isOpen}
                    onChange={(e) =>
                      setForm({ ...form, isOpen: e.target.checked })
                    }
                  />
                  <label className="form-check-label">
                    Restaurant Open
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className="btn btn-dark"
                  onClick={editId ? updateRestaurant : addRestaurant}
                >
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
