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
  { name: "Fast Food", slug: "fast-food" },
  { name: "Pani Puri & More", slug: "pani-puri-more" },
];
const MENU_FILTER_OPTIONS = [
  { label: "🍕 Pizza", value: "pizza" },
  { label: "🍔 Burger", value: "burger" },
  { label: "🥤 Juices", value: "juices" },
  { label: "🥗 Veg Starters", value: "veg-starters" },
  { label: "🍗 Non-Veg Starters", value: "non-veg-starters" },
  { label: "🍛 Curries", value: "curries" },
  { label: "🍚 Fried Rice", value: "fried-rice" },
  { label: "🍖 Biryani", value: "biryani" },
  { label: "🍲 Non-Veg Curries", value: "non-veg-curries" },
  { label: "🍟 Fast Food", value: "fast-food" },
  { label: "🥛 Butter Milk", value: "butter-milk" },
  { label: "🍯 Dates Juices", value: "dates-juices" },
  { label: "🥜 Dry Fruit Juices", value: "dry-fruit-juices" },
  { label: "🥚 Egg", value: "egg" },
  { label: "🍟 French Fries", value: "french-fries" },
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
  variants: [], // ✅ ADD THIS
  filters: [],
  isAvailable: true,
  isBestseller: false,
  isRecommended: false,
  availableFrom: "",
  availableTo: "",
  deliveryTime: "20-30 mins",
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
    variants: [], // ✅ ADD THIS
    filters: [],
    isAvailable: true,
    isBestseller: false,
    isRecommended: false,
    availableFrom: "",
    availableTo: "",
    deliveryTime: "20-30 mins",
  });
};



  /* ================= SAVE ================= */
 const saveMenuItem = async () => {
if (!form.name || !form.categoryKey) {
  alert("Name and category are required");
  return;
}

if (!form.basePrice && form.variants.length === 0) {
  alert("Either base price or at least one variant is required");
  return;
}

if (!form.filters.length) {
  alert("Please select at least one menu filter");
  return;
}
if (form.variants.length > 0) {
  for (const v of form.variants) {
    if (!v.label || !v.price) {
      alert("Each variant must have label and price");
      return;
    }

    if (v.mrp && Number(v.mrp) < Number(v.price)) {
      alert("Variant MRP cannot be less than price");
      return;
    }
  }
}

  if (form.mrp && Number(form.mrp) < Number(form.basePrice)) {
    alert("MRP cannot be less than Base Price");
    return;
  }

 const payload = {
  ...form,
  basePrice:
    form.variants.length > 0
      ? undefined
      : Number(form.basePrice),
  mrp:
    form.variants.length > 0
      ? undefined
      : form.mrp
      ? Number(form.mrp)
      : undefined,
  variants: form.variants.map(v => ({
    label: v.label,
    price: Number(v.price),
    mrp: v.mrp ? Number(v.mrp) : undefined,
  })),
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

<th>Filters</th>

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
  {/* ITEM */}
  <td><strong>{item.name}</strong></td>

  {/* CATEGORY */}
  <td className="text-muted">{item.categoryKey}</td>

  {/* FILTERS */}
  <td className="text-muted">
    {item.filters?.length ? item.filters.join(", ") : "—"}
  </td>

  {/* PRICE (VARIANT AWARE) */}
  <td>
    {item.variants?.length ? (
      <>
        <strong>
          From ₹{Math.min(...item.variants.map(v => v.price))}
        </strong>
        <div className="text-muted small">
          {item.variants.map(v => `${v.label} ₹${v.price}`).join(", ")}
        </div>
      </>
    ) : (
      <>
        <strong>₹{item.basePrice}</strong>
        {item.mrp && item.mrp > item.basePrice && (
          <span className="text-muted ms-2 text-decoration-line-through">
            ₹{item.mrp}
          </span>
        )}
      </>
    )}
  </td>

  {/* TIMING */}
  <td>
    {item.availableFrom && item.availableTo
      ? `${item.availableFrom} – ${item.availableTo}`
      : "All Day"}
  </td>

  {/* DELIVERY */}
  <td>{item.deliveryTime || "—"}</td>

  {/* STATUS */}
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
  variants: item.variants
  ? item.variants.map(v => ({
      label: v.label,
      price: String(v.price),
      mrp: v.mrp ? String(v.mrp) : "",
    }))
  : [],

 // ✅ ADD THIS
  filters: item.filters || [],
  isAvailable: item.isAvailable ?? true,
  isBestseller: item.isBestseller ?? false,
  isRecommended: item.isRecommended ?? false,
  availableFrom: item.availableFrom || "",
  availableTo: item.availableTo || "",
  deliveryTime: item.deliveryTime || "20-30 mins",
});



                      setShowModal(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className={`btn btn-sm ${item.isAvailable ? "btn-outline-danger" : "btn-outline-success"}`}
                    onClick={async () => {
                     try {
  await api.put(`/hotel/menu/${item._id}`, {
    isAvailable: !item.isAvailable,
  });
  fetchMenu();
} catch {
  alert("Failed to update status");
}

                    }}
                  >
                    {item.isAvailable ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}

            {!menu.length && (
              <tr>
               <td colSpan="8" className="text-center text-muted py-5">
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
                <button className="btn-close" onClick={() => {
  setShowModal(false);
  setEditItem(null);
  resetForm();
}}
 />
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

              {form.variants.length === 0 && (
  <>
    <input
      className="form-control mb-2"
      type="number"
      placeholder="Base Price"
      value={form.basePrice}
      onChange={(e) =>
        setForm({ ...form, basePrice: e.target.value })
      }
    />

    <input
      className="form-control mb-2"
      type="number"
      placeholder="MRP (optional)"
      value={form.mrp}
      onChange={(e) =>
        setForm({ ...form, mrp: e.target.value })
      }
    />
  </>
)}

<div className="mb-3">
  <label className="form-label fw-bold">Variants (Half / Full)</label>

  {form.variants.map((v, index) => (
    <div key={index} className="border rounded p-2 mb-2">
      <div className="row g-2">
        <div className="col">
          <input
            className="form-control"
            placeholder="Label (e.g. Half)"
            value={v.label}
            onChange={(e) => {
              const variants = [...form.variants];
              variants[index].label = e.target.value;
              setForm({ ...form, variants });
            }}
          />
        </div>

        <div className="col">
          <input
            type="number"
            className="form-control"
            placeholder="Price"
            value={v.price}
            onChange={(e) => {
              const variants = [...form.variants];
              variants[index].price = e.target.value;
              setForm({ ...form, variants });
            }}
          />
        </div>

        <div className="col">
          <input
            type="number"
            className="form-control"
            placeholder="MRP"
            value={v.mrp || ""}
            onChange={(e) => {
              const variants = [...form.variants];
              variants[index].mrp = e.target.value;
              setForm({ ...form, variants });
            }}
          />
        </div>

        <div className="col-auto">
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              setForm({
                ...form,
                variants: form.variants.filter((_, i) => i !== index),
              });
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  ))}


<button
  type="button"
  className="btn btn-outline-dark btn-sm"
  onClick={() =>
    setForm({
      ...form,
      basePrice: "",
      mrp: "",
      variants: [
        ...form.variants,
        { label: "", price: "", mrp: "" },
      ],
    })
  }
>
  + Add Variant
</button>



</div>

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
<div className="mb-3">
  <label className="form-label fw-bold">Menu Filters</label>

  <div className="d-flex flex-wrap gap-2">
    {MENU_FILTER_OPTIONS.map((f) => (
      <label key={f.value} className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          checked={form.filters.includes(f.value)}
          onChange={(e) => {
            if (e.target.checked) {
              setForm({
                ...form,
                filters: [...form.filters, f.value],
              });
            } else {
              setForm({
                ...form,
                filters: form.filters.filter(x => x !== f.value),
              });
            }
          }}
        />
        <span className="ms-2">{f.label}</span>
      </label>
    ))}
  </div>
</div>

<div className="form-check mb-2">
  <input
    className="form-check-input"
    type="checkbox"
    checked={form.isBestseller}
    onChange={(e) =>
      setForm({ ...form, isBestseller: e.target.checked })
    }
  />
  <label className="form-check-label">
    ⭐ Bestseller
  </label>
</div>

<div className="form-check mb-2">
  <input
    className="form-check-input"
    type="checkbox"
    checked={form.isRecommended}
    onChange={(e) =>
      setForm({ ...form, isRecommended: e.target.checked })
    }
  />
  <label className="form-check-label">
    👍 Recommended
  </label>
</div>

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
