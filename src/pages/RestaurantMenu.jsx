import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import "./RestaurantMenu.css";

/* CATEGORY OPTIONS */
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

/* MENU FILTER OPTIONS */
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

/* ADD-ON PRESETS */
const ADDON_PRESETS = [
  { name: "Extra Cheese", price: 30 },
  { name: "Extra Raita", price: 20 },
  { name: "Extra Gravy", price: 25 },
  { name: "Extra Butter", price: 15 },
  { name: "Boiled Egg", price: 20 },
];

export default function RestaurantMenu() {
  const { restaurantId } = useParams();

  const [menu, setMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    images: [],
    categoryKey: "",
    basePrice: "",
    mrp: "",
    variants: [],
    addons: [],
    filters: [],
    isAvailable: true,
    isBestseller: false,
    isRecommended: false,
    availableFrom: "",
    availableTo: "",
    deliveryTime: "20-30 mins",
  });

  /* ================= FETCH MENU ================= */
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hotel/menu/admin/${restaurantId}`);
      setMenu(res.data.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      image: "",
      images: [],
      categoryKey: "",
      basePrice: "",
      mrp: "",
      variants: [],
      addons: [],
      filters: [],
      isAvailable: true,
      isBestseller: false,
      isRecommended: false,
      availableFrom: "",
      availableTo: "",
      deliveryTime: "20-30 mins",
    });
    setImagePreview("");
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    if (!form.name.trim()) {
      alert("⚠️ Item name is required");
      return false;
    }

    if (!form.categoryKey) {
      alert("⚠️ Please select a category");
      return false;
    }

    if (!form.filters.length) {
      alert("⚠️ Please select at least one menu filter");
      return false;
    }

    if (!form.basePrice && form.variants.length === 0) {
      alert("⚠️ Either base price or at least one variant is required");
      return false;
    }

    if (form.variants.length > 0) {
      for (const v of form.variants) {
        if (!v.label || !v.price) {
          alert("⚠️ Each variant must have label and price");
          return false;
        }

        if (v.mrp && Number(v.mrp) < Number(v.price)) {
          alert("⚠️ Variant MRP cannot be less than price");
          return false;
        }
      }
    }

    if (form.mrp && Number(form.mrp) < Number(form.basePrice)) {
      alert("⚠️ MRP cannot be less than Base Price");
      return false;
    }

    if (form.addons.length > 0) {
      for (const addon of form.addons) {
        if (!addon.name || !addon.price) {
          alert("⚠️ Each add-on must have name and price");
          return false;
        }
      }
    }

    return true;
  };

  /* ================= SAVE MENU ITEM ================= */
  const saveMenuItem = async () => {
    if (!validateForm()) return;

    const payload = {
      ...form,
      basePrice: form.variants.length > 0 ? undefined : Number(form.basePrice),
      mrp:
        form.variants.length > 0
          ? undefined
          : form.mrp
          ? Number(form.mrp)
          : undefined,
      variants: form.variants.map((v) => ({
        label: v.label,
        price: Number(v.price),
        mrp: v.mrp ? Number(v.mrp) : undefined,
      })),
      addons: form.addons.map((a) => ({
        name: a.name,
        price: Number(a.price),
      })),
      hotelId: restaurantId,
    };

    try {
      setLoading(true);

      if (editItem) {
        await api.put(`/hotel/menu/${editItem._id}`, payload);
        alert("✅ Menu item updated successfully!");
      } else {
        await api.post("/hotel/menu", payload);
        alert("✅ Menu item added successfully!");
      }

      setShowModal(false);
      setEditItem(null);
      resetForm();
      fetchMenu();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE MENU ITEM ================= */
  const deleteMenuItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    try {
      setLoading(true);
      await api.delete(`/hotel/menu/${itemId}`);
      alert("✅ Menu item deleted successfully!");
      fetchMenu();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTERED MENU ================= */
  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || item.categoryKey === filterCategory;
    return matchesSearch && matchesCategory;
  });

  /* ================= ADD VARIANT ================= */
  const addVariant = () => {
    setForm({
      ...form,
      basePrice: "",
      mrp: "",
      variants: [...form.variants, { label: "", price: "", mrp: "" }],
    });
  };

  /* ================= REMOVE VARIANT ================= */
  const removeVariant = (index) => {
    setForm({
      ...form,
      variants: form.variants.filter((_, i) => i !== index),
    });
  };

  /* ================= ADD ADDON ================= */
  const addAddon = () => {
    setForm({
      ...form,
      addons: [...form.addons, { name: "", price: "" }],
    });
  };

  /* ================= REMOVE ADDON ================= */
  const removeAddon = (index) => {
    setForm({
      ...form,
      addons: form.addons.filter((_, i) => i !== index),
    });
  };

  /* ================= ADD IMAGE URL ================= */
  const addImageUrl = () => {
    if (!form.image.trim()) return;
    setForm({
      ...form,
      images: [...form.images, form.image],
      image: "",
    });
  };

  /* ================= REMOVE IMAGE ================= */
  const removeImage = (index) => {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index),
    });
  };

  return (
    <AdminLayout>
      <div className="restaurant-menu-page">
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h2 className="page-title">🍽️ Restaurant Menu</h2>
            <p className="page-subtitle">Manage your menu items, variants, and add-ons</p>
          </div>

          <button className="btn-primary" onClick={() => {
            resetForm();
            setEditItem(null);
            setShowModal(true);
          }}>
            <span>+</span> Add Menu Item
          </button>
        </div>

        {/* FILTERS */}
        <div className="filters-section">
          <div className="search-box">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM17 17l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <div className="stats-chips">
            <div className="stat-chip">
              <span className="stat-label">Total Items</span>
              <span className="stat-value">{menu.length}</span>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Available</span>
              <span className="stat-value success">{menu.filter(i => i.isAvailable).length}</span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="menu-table-container">
          {loading && menu.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading menu...</p>
            </div>
          ) : filteredMenu.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>No menu items found</h3>
              <p>
                {searchQuery || filterCategory
                  ? "Try adjusting your filters"
                  : "Get started by adding your first menu item"}
              </p>
            </div>
          ) : (
            <table className="menu-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Filters</th>
                  <th>Price</th>
                  <th>Variants</th>
                  <th>Add-ons</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMenu.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="item-cell">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="item-image" />
                        )}
                        <div>
                          <div className="item-name">{item.name}</div>
                          {item.description && (
                            <div className="item-desc">{item.description.substring(0, 50)}...</div>
                          )}
                          <div className="item-tags">
                            {item.isBestseller && <span className="tag tag-bestseller">⭐ Bestseller</span>}
                            {item.isRecommended && <span className="tag tag-recommended">👍 Recommended</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="category-badge">
                        {CATEGORY_OPTIONS.find(c => c.slug === item.categoryKey)?.name || item.categoryKey}
                      </span>
                    </td>

                    <td>
                      <div className="filter-tags">
                        {item.filters?.slice(0, 2).map((f, i) => (
                          <span key={i} className="filter-tag">
                            {MENU_FILTER_OPTIONS.find(opt => opt.value === f)?.label || f}
                          </span>
                        ))}
                        {item.filters?.length > 2 && (
                          <span className="filter-tag">+{item.filters.length - 2}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      {item.variants?.length ? (
                        <div className="price-info">
                          <div className="price-main">From ₹{Math.min(...item.variants.map(v => v.price))}</div>
                        </div>
                      ) : (
                        <div className="price-info">
                          <div className="price-main">₹{item.basePrice}</div>
                          {item.mrp && item.mrp > item.basePrice && (
                            <div className="price-strike">₹{item.mrp}</div>
                          )}
                        </div>
                      )}
                    </td>

                    <td>
                      {item.variants?.length > 0 ? (
                        <div className="variants-info">
                          {item.variants.map((v, i) => (
                            <div key={i} className="variant-chip">
                              {v.label}: ₹{v.price}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    <td>
                      {item.addons?.length > 0 ? (
                        <span className="addon-count">{item.addons.length} add-ons</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    <td>
                      <span className={`status-badge ${item.isAvailable ? "status-active" : "status-inactive"}`}>
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => {
                            setEditItem(item);
                            setForm({
                              name: item.name || "",
                              description: item.description || "",
                              image: "",
                              images: item.images || [],
                              categoryKey: item.categoryKey || "",
                              basePrice: item.basePrice || "",
                              mrp: item.mrp || "",
                              variants: item.variants
                                ? item.variants.map((v) => ({
                                    label: v.label,
                                    price: String(v.price),
                                    mrp: v.mrp ? String(v.mrp) : "",
                                  }))
                                : [],
                              addons: item.addons
                                ? item.addons.map((a) => ({
                                    name: a.name,
                                    price: String(a.price),
                                  }))
                                : [],
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
                          title="Edit"
                        >
                          ✏️
                        </button>

                        <button
                          className={`btn-icon ${item.isAvailable ? "btn-disable" : "btn-enable"}`}
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
                          title={item.isAvailable ? "Disable" : "Enable"}
                        >
                          {item.isAvailable ? "🚫" : "✅"}
                        </button>

                        <button
                          className="btn-icon btn-delete"
                          onClick={() => deleteMenuItem(item._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => {
            if (!loading) {
              setShowModal(false);
              setEditItem(null);
              resetForm();
            }
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>{editItem ? "Edit Menu Item" : "Add New Menu Item"}</h3>
                  <p>Fill in the details below</p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditItem(null);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {/* BASIC INFO */}
                <div className="form-section">
                  <h4 className="section-title">Basic Information</h4>

                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Paneer Butter Masala"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your dish..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={form.categoryKey}
                        onChange={(e) => setForm({ ...form, categoryKey: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Delivery Time</label>
                      <input
                        type="text"
                        placeholder="e.g., 20-30 mins"
                        value={form.deliveryTime}
                        onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* IMAGES */}
                <div className="form-section">
                  <h4 className="section-title">Images</h4>

                  <div className="form-group">
                    <label>Add Image URL</label>
                    <div className="image-input-group">
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={form.image}
                        onChange={(e) => {
                          setForm({ ...form, image: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={addImageUrl}
                      >
                        Add
                      </button>
                    </div>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                    )}
                  </div>

                  {form.images.length > 0 && (
                    <div className="image-list">
                      {form.images.map((img, index) => (
                        <div key={index} className="image-item">
                          <img src={img} alt={`Item ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => removeImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PRICING */}
                <div className="form-section">
                  <h4 className="section-title">Pricing & Variants</h4>

                  {form.variants.length === 0 && (
                    <div className="form-row">
                      <div className="form-group">
                        <label>Base Price *</label>
                        <input
                          type="number"
                          placeholder="₹ 0"
                          value={form.basePrice}
                          onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>MRP (Optional)</label>
                        <input
                          type="number"
                          placeholder="₹ 0"
                          value={form.mrp}
                          onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* VARIANTS */}
                  <div className="variants-section">
                    <div className="section-header">
                      <label>Variants (Half/Full)</label>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={addVariant}
                      >
                        + Add Variant
                      </button>
                    </div>

                    {form.variants.map((v, index) => (
                      <div key={index} className="variant-item">
                        <input
                          type="text"
                          placeholder="Label (e.g., Half)"
                          value={v.label}
                          onChange={(e) => {
                            const variants = [...form.variants];
                            variants[index].label = e.target.value;
                            setForm({ ...form, variants });
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={v.price}
                          onChange={(e) => {
                            const variants = [...form.variants];
                            variants[index].price = e.target.value;
                            setForm({ ...form, variants });
                          }}
                        />
                        <input
                          type="number"
                          placeholder="MRP (optional)"
                          value={v.mrp || ""}
                          onChange={(e) => {
                            const variants = [...form.variants];
                            variants[index].mrp = e.target.value;
                            setForm({ ...form, variants });
                          }}
                        />
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeVariant(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADD-ONS */}
                <div className="form-section">
                  <div className="section-header">
                    <h4 className="section-title">Add-ons (Optional)</h4>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={addAddon}
                    >
                      + Add Custom
                    </button>
                  </div>

                  {/* PRESET ADD-ONS */}
                  <div className="addon-presets">
                    {ADDON_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        className="preset-btn"
                        onClick={() => {
                          if (!form.addons.find(a => a.name === preset.name)) {
                            setForm({
                              ...form,
                              addons: [...form.addons, { ...preset, price: String(preset.price) }],
                            });
                          }
                        }}
                      >
                        {preset.name} (₹{preset.price})
                      </button>
                    ))}
                  </div>

                  {/* CUSTOM ADD-ONS */}
                  {form.addons.map((addon, index) => (
                    <div key={index} className="addon-item">
                      <input
                        type="text"
                        placeholder="Add-on name"
                        value={addon.name}
                        onChange={(e) => {
                          const addons = [...form.addons];
                          addons[index].name = e.target.value;
                          setForm({ ...form, addons });
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={addon.price}
                        onChange={(e) => {
                          const addons = [...form.addons];
                          addons[index].price = e.target.value;
                          setForm({ ...form, addons });
                        }}
                      />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeAddon(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* FILTERS */}
                <div className="form-section">
                  <h4 className="section-title">Menu Filters *</h4>
                  <div className="filter-grid">
                    {MENU_FILTER_OPTIONS.map((f) => (
                      <label key={f.value} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={form.filters.includes(f.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, filters: [...form.filters, f.value] });
                            } else {
                              setForm({
                                ...form,
                                filters: form.filters.filter((x) => x !== f.value),
                              });
                            }
                          }}
                        />
                        <span>{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* BADGES */}
                <div className="form-section">
                  <h4 className="section-title">Badges & Status</h4>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.isBestseller}
                        onChange={(e) =>
                          setForm({ ...form, isBestseller: e.target.checked })
                        }
                      />
                      <span>⭐ Mark as Bestseller</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.isRecommended}
                        onChange={(e) =>
                          setForm({ ...form, isRecommended: e.target.checked })
                        }
                      />
                      <span>👍 Mark as Recommended</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.isAvailable}
                        onChange={(e) =>
                          setForm({ ...form, isAvailable: e.target.checked })
                        }
                      />
                      <span>✅ Available for ordering</span>
                    </label>
                  </div>
                </div>

                {/* TIMING */}
                <div className="form-section">
                  <h4 className="section-title">Availability Timing (Optional)</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Available From</label>
                      <input
                        type="time"
                        value={form.availableFrom}
                        onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Available To</label>
                      <input
                        type="time"
                        value={form.availableTo}
                        onChange={(e) => setForm({ ...form, availableTo: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditItem(null);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={saveMenuItem}
                  disabled={loading}
                >
                  {loading ? "Saving..." : editItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}