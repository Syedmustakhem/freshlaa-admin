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
    mrp: "",
    isAvailable: true,
    availableFrom: "",
    availableTo: "",
    deliveryTime: "20–30 mins",
  });

  /* ================= FETCH MENU ================= */
  const fetchMenu = async () => {
    try {
      const res = await api.get(`/hotel/menu/admin/${restaurantId}`);
      setMenu(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  /* ================= RESET ================= */
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      image: "",
      categoryKey: "",
      basePrice: "",
      mrp: "",
      isAvailable: true,
      availableFrom: "",
      availableTo: "",
      deliveryTime: "20–30 mins",
    });
  };

  /* ================= SAVE ================= */
  const saveMenuItem = async () => {
    if (!form.name || !form.categoryKey || !form.basePrice) {
      alert("Name, category and base price are required");
      return;
    }

    if (form.mrp && Number(form.mrp) < Number(form.basePrice)) {
      alert("MRP cannot be less than Base Price");
      return;
    }

    const payload = {
      ...form,
      basePrice: Number(form.basePrice),
      mrp: form.mrp ? Number(form.mrp) : undefined,
      hotelId: restaurantId,
    };

    try {
      if (editItem) {
        await api.put(`/hotel/menu/${editItem._id}`, payload);
      } else {
        await api.post("/hotel/menu", payload);
      }

      setShowModal(false);
      setEditItem(null);
      resetForm();
      fetchMenu();
    } catch (err) {
      alert("Failed to save item");
    }
  };

  return (
    <AdminLayout>
      <h3 className="page-heading mb-4">Restaurant Menu</h3>

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

      <div className="dashboard-card">
        <table className="table table-modern">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Timing</th>
              <th>Delivery</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            {menu.map((item) => (
              <tr key={item._id}>
                <td><strong>{item.name}</strong></td>
                <td className="text-muted">{item.categoryKey}</td>

                <td>
                  <strong>₹{item.basePrice}</strong>
                  {item.mrp && item.mrp > item.basePrice && (
                    <span className="text-muted ms-2 text-decoration-line-through">
                      ₹{item.mrp}
                    </span>
                  )}
                </td>

                <td>
                  {item.availableFrom && item.availableTo
                    ? `${item.availableFrom} – ${item.availableTo}`
                    : "All Day"}
                </td>

                <td>{item.deliveryTime || "—"}</td>

                <td>
                  <span className={`status-badge ${item.isAvailable ? "completed" : "cancelled"}`}>
                    {item.isAvailable ? "Enabled" : "Disabled"}
                  </span>
                </td>

                <td className="text-end">
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
                        mrp: item.mrp || "",
                        isAvailable: item.isAvailable ?? true,
                        availableFrom: item.availableFrom || "",
                        availableTo: item.availableTo || "",
                        deliveryTime: item.deliveryTime || "20–30 mins",
                      });
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className={`btn btn-sm ${item.isAvailable ? "btn-outline-danger" : "btn-outline-success"}`}
                    onClick={async () => {
                      await api.put(`/hotel/menu/${item._id}`, {
                        isAvailable: !item.isAvailable,
                      });
                      fetchMenu();
                    }}
                  >
                    {item.isAvailable ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}

            {!menu.length && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-5">
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
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">
                <input className="form-control mb-2" placeholder="Item Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input className="form-control mb-2" placeholder="Image URL"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />

                <input className="form-control mb-2" type="number" placeholder="Base Price"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                />

                <input className="form-control mb-2" type="number" placeholder="MRP (optional)"
                  value={form.mrp}
                  onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                />

                <input className="form-control mb-2"
                  placeholder="Delivery Time"
                  value={form.deliveryTime}
                  onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                />

                <select className="form-control mb-2"
                  value={form.categoryKey}
                  onChange={(e) => setForm({ ...form, categoryKey: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>

                <textarea className="form-control" rows={3} placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-dark" onClick={saveMenuItem}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
