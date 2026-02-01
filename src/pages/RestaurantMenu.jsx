import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

/* SAME CATEGORY KEYS AS APP */
const CATEGORY_OPTIONS = [
  { name: "Fresh Fruits", slug: "fresh-fruits" },
  { name: "Cool Drinks", slug: "cool-drinks" },
  { name: "Dosa & More", slug: "dosa-more" },
  { name: "Biryani", slug: "biryani" },
  { name: "Home Food", slug: "home-food" },
  { name: "Curries", slug: "curries" },
  { name: "Non-Veg", slug: "non-veg" },
  { name: "Fast Food", slug: "fast-food" },
  { name: "Pani Puri & More", slug: "pani-puri-more" },
];

export default function RestaurantMenu() {
  const { restaurantId } = useParams();

  const [menu, setMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    categoryKey: "",
    basePrice: "",
    isAvailable: true,
  });

  /* ================= FETCH MENU ================= */
  const fetchMenu = async () => {
    const res = await api.get(`/hotel/menu/admin/${restaurantId}`);
    setMenu(res.data.data || []);
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  /* ================= SAVE ================= */
  const saveMenuItem = async () => {
    if (!form.name || !form.categoryKey || !form.basePrice) {
      alert("Name, category and price are required");
      return;
    }

    if (editItem) {
      await api.put(`/hotel/menu/${editItem._id}`, form);
    } else {
      await api.post("/hotel/menu", {
        ...form,
        hotelId: restaurantId,
      });
    }

    setShowModal(false);
    setEditItem(null);
    resetForm();
    fetchMenu();
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      image: "",
      categoryKey: "",
      basePrice: "",
      isAvailable: true,
    });
  };

  return (
    <AdminLayout>
      <h3 className="page-heading mb-4">Restaurant Menu</h3>

      {/* ADD BUTTON */}
      <button
        className="btn btn-dark mb-3"
        onClick={() => {
          resetForm();
          setEditItem(null);
          setShowModal(true);
        }}
      >
        + Add Menu Item
      </button>

      {/* TABLE */}
      <div className="dashboard-card">
        <table className="table table-modern">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Base Price</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            {menu.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.name}</strong>
                </td>
                <td className="text-muted">{item.categoryKey}</td>
                <td>₹{item.basePrice}</td>
                <td>
                  <span
                    className={`status-badge ${
                      item.isAvailable ? "completed" : "cancelled"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Hidden"}
                  </span>
                </td>

                <td className="text-end">
                  {/* EDIT */}
                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => {
                      setEditItem(item);
                      setForm({
                        name: item.name || "",
                        description: item.description || "",
                        image: item.image || "",
                        categoryKey: item.categoryKey || "",
                        basePrice: item.basePrice || "",
                        isAvailable: item.isAvailable ?? true,
                      });
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>

                  {/* DISABLE */}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={async () => {
                      await api.put(`/hotel/menu/${item._id}`, {
                        isAvailable: false,
                      });
                      fetchMenu();
                    }}
                  >
                    Disable
                  </button>
                </td>
              </tr>
            ))}

            {!menu.length && (
              <tr>
                <td colSpan="5" className="text-center text-muted py-5">
                  No menu items added
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editItem ? "Edit Menu Item" : "Add Menu Item"}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  placeholder="Item Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Image URL"
                  value={form.image}
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.value })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Base Price"
                  type="number"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm({ ...form, basePrice: e.target.value })
                  }
                />

                <select
                  className="form-control mb-2"
                  value={form.categoryKey}
                  onChange={(e) =>
                    setForm({ ...form, categoryKey: e.target.value })
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
                  rows={3}
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />

                <div className="form-check form-switch mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) =>
                      setForm({ ...form, isAvailable: e.target.checked })
                    }
                  />
                  <label className="form-check-label">Available</label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-dark" onClick={saveMenuItem}>
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
