import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

const UNITS = ["kg", "g", "l", "ml", "pcs"];

const emptyVariant = {
  label: "", unit: "kg", value: 1,
  price: 0, mrp: 0, stock: 0, isDefault: true,
};

const emptyProduct = {
  name: "", description: "", sectionId: "",
  subCategory: "", category: "", images: [""],
  quickFilter: "",
  isFlashSale: false,
  flashSalePrice: 0,
  flashSaleEndTime: "",
  variants: [{ ...emptyVariant }],
};

const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 5 }}>
    {children}
  </div>
);

const Input = ({ style, ...props }) => (
  <input style={{ width: "100%", padding: "8px 11px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", boxSizing: "border-box", ...style }} {...props} />
);

const Select = ({ style, children, ...props }) => (
  <select style={{ width: "100%", padding: "8px 11px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box", ...style }} {...props}>
    {children}
  </select>
);

const Textarea = ({ style, ...props }) => (
  <textarea style={{ width: "100%", padding: "8px 11px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", ...style }} {...props} />
);

const Section = ({ icon, title, children }) => (
  <div style={{ background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16, marginBottom: 14 }}>
    <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12 }}>{icon} {title}</div>
    {children}
  </div>
);

const Modal = ({ title, onClose, onSave, saveLabel = "Save", saveDisabled, size = 760, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
    <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: size, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{title}</div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}>×</button>
      </div>
      <div style={{ overflowY: "auto", padding: "20px", flex: 1 }}>{children}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "1px solid #e5e7eb" }}>
        <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>Cancel</button>
        <button onClick={onSave} disabled={saveDisabled} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: saveDisabled ? "#d1d5db" : "#6366f1", color: "#fff", cursor: saveDisabled ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, boxShadow: saveDisabled ? "none" : "0 2px 8px rgba(99,102,241,.3)" }}>
          {saveLabel}
        </button>
      </div>
    </div>
  </div>
);

export default function Products() {
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [editProduct, setEditProduct]       = useState(null);
  const [variantProduct, setVariantProduct] = useState(null);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [sections, setSections]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [subCategoryImage, setSubCategoryImage] = useState("");
  const [newProduct, setNewProduct]         = useState(emptyProduct);
  const [toast, setToast]                   = useState(null);

  // ✅ Restock subscriber counts — { [productId]: number }
  const [restockCounts, setRestockCounts]   = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/admin/all", { headers: authHeader() });
      const prods = res.data.data || [];
      setProducts(prods);

      // ✅ Fetch restock counts for OOS products only
      const oosIds = prods
        .filter(p => p.stock === 0)
        .map(p => p._id);

      if (oosIds.length > 0) {
        fetchRestockCounts(oosIds);
      }
    } catch {
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch restock subscriber counts for multiple products
  const fetchRestockCounts = useCallback(async (productIds) => {
    const counts = {};
    await Promise.all(
      productIds.map(async (id) => {
        try {
          const res = await api.get(`/restock/count/${id}`, { headers: authHeader() });
          counts[id] = res.data.count ?? 0;
        } catch {
          counts[id] = 0;
        }
      })
    );
    setRestockCounts(prev => ({ ...prev, ...counts }));
  }, []);

  const fetchSections = async () => {
    const res = await api.get("/admin/category-sections", { headers: authHeader() });
    setSections(res.data.data || []);
  };

  const fetchCategories = async (sectionId = null) => {
    try {
      const url = sectionId ? `/admin/categories?sectionId=${sectionId}` : "/admin/categories";
      const res = await api.get(url, { headers: authHeader() });
      setCategories(res.data.data || []);
    } catch { console.error("Failed to load categories"); }
  };

  useEffect(() => { fetchProducts(); fetchSections(); }, []);

  const toggleStatus = async (product) => {
    try {
      await api.patch(`/products/${product._id}/status`, {}, { headers: authHeader() });
      fetchProducts();
      showToast(`Product ${product.isActive ? "deactivated" : "activated"}`);
    } catch { showToast("Failed to update status", "error"); }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`, { headers: authHeader() });
      fetchProducts();
      showToast("Product deleted");
    } catch { showToast("Failed to delete product", "error"); }
  };

  const openEditProduct = async (product) => {
    await fetchCategories(product.sectionId || null);
    setEditProduct({
      ...JSON.parse(JSON.stringify(product)),
      variants: (product.variants || []).map(v => ({ ...v, unit: v.unit || "kg" })),
      category: product.category,
      subCategory: product.category,
      isFlashSale: product.isFlashSale ?? false,
      flashSalePrice: product.flashSalePrice ?? 0,
      flashSaleEndTime: product.flashSaleEndTime ? new Date(product.flashSaleEndTime).toISOString().slice(0, 16) : "",
    });
  };

  const saveEditProduct = async () => {
    if (!editProduct.category) { showToast("Category is required", "error"); return; }
    try {
      await api.put(`/products/${editProduct._id}`, {
        name: editProduct.name,
        description: editProduct.description,
        isActive: editProduct.isActive,
        sectionId: editProduct.sectionId,
        subCategory: editProduct.category,
        category: editProduct.category,
        images: editProduct.images,
        variants: editProduct.variants,
        quickFilter: editProduct.quickFilter || null,
        isFlashSale: editProduct.isFlashSale,
        flashSalePrice: Number(editProduct.flashSalePrice),
        flashSaleEndTime: editProduct.flashSaleEndTime || null,
      }, { headers: authHeader() });
      setEditProduct(null);
      fetchProducts();
      showToast("Product updated ✅ Restock notifications sent if stock restored");
    } catch (err) { showToast(err.response?.data?.message || "Update failed", "error"); }
  };

  const saveNewProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.images.filter(Boolean).length) {
      showToast("Name, category, and at least one image are required", "error"); return;
    }
    if (!newProduct.variants.some(v => v.isDefault)) {
      showToast("Please select a default variant", "error"); return;
    }
    try {
      await api.post("/products/manual", {
        name: newProduct.name,
        description: newProduct.description,
        sectionId: newProduct.sectionId || null,
        category: newProduct.category,
        subCategory: newProduct.category,
        quickFilter: newProduct.quickFilter || null,
        images: newProduct.images.filter(Boolean),
        isFlashSale: newProduct.isFlashSale,
        flashSalePrice: Number(newProduct.flashSalePrice),
        flashSaleEndTime: newProduct.flashSaleEndTime || null,
        variants: newProduct.variants.map(v => ({
          label: v.label, unit: v.unit || "kg",
          value: Number(v.value || 1),
          price: Number(v.price), mrp: Number(v.mrp || v.price),
          stock: Number(v.stock), isDefault: v.isDefault,
        })),
      }, { headers: authHeader() });

      if (subCategoryImage) {
        await api.patch(`/admin/categories/${newProduct.category}/image`, { image: subCategoryImage }, { headers: authHeader() });
      }

      setShowAddModal(false);
      setSubCategoryImage("");
      setNewProduct(emptyProduct);
      fetchProducts();
      showToast("Product added successfully");
    } catch (err) { showToast(err.response?.data?.message || "Failed to add product", "error"); }
  };

  const updateVariantField = (index, field, value) => {
    const updated = [...variantProduct.variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariantProduct({ ...variantProduct, variants: updated });
  };

  const setDefaultVariant = (index) => {
    setVariantProduct({
      ...variantProduct,
      variants: variantProduct.variants.map((v, i) => ({ ...v, isDefault: i === index })),
    });
  };

  const saveVariants = async () => {
    try {
      await api.put(`/products/${variantProduct._id}`, {
        variants: variantProduct.variants.map(v => ({
          label: v.label, unit: v.unit || "kg",
          value: Number(v.value || 1),
          price: Number(v.price), mrp: Number(v.mrp || v.price),
          stock: Number(v.stock), isDefault: v.isDefault,
        })),
      }, { headers: authHeader() });
      setVariantProduct(null);
      fetchProducts();
      showToast("Variants saved ✅ Restock notifications sent if stock restored");
    } catch { showToast("Failed to save variants", "error"); }
  };

  const addNewVariant    = () => setNewProduct(p => ({ ...p, variants: [...p.variants, { ...emptyVariant, isDefault: false }] }));
  const updateNewVariant = (i, field, value) => { const v = [...newProduct.variants]; v[i][field] = value; setNewProduct(p => ({ ...p, variants: v })); };
  const setNewDefaultVariant = (i) => setNewProduct(p => ({ ...p, variants: p.variants.map((v, j) => ({ ...v, isDefault: j === i })) }));

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const VariantRow = ({ v, i, onChange, onDefault, onRemove }) => (
    <div style={{
      display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 40px 40px",
      gap: 8, alignItems: "end", padding: "10px 12px",
      background: v.isDefault ? "#f5f3ff" : v.stock === 0 ? "#fff7f7" : "#fff",
      borderRadius: 8, border: `1px solid ${v.isDefault ? "#a5b4fc" : v.stock === 0 ? "#fca5a5" : "#e5e7eb"}`,
      marginBottom: 8,
    }}>
      {[
        { label: "Label", field: "label", type: "text", placeholder: "500g Pack" },
        { label: "Unit",  field: "unit",  type: "select" },
        { label: "Qty",   field: "value", type: "number" },
        { label: "Price ₹", field: "price", type: "number" },
        { label: "MRP ₹",   field: "mrp",   type: "number" },
        { label: "Stock",   field: "stock",  type: "number" },
      ].map(f => (
        <div key={f.field}>
          <Label>{f.label}</Label>
          {f.type === "select" ? (
            <Select value={v.unit} onChange={e => onChange(i, "unit", e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </Select>
          ) : (
            <Input
              type={f.type}
              value={v[f.field]}
              placeholder={f.placeholder || ""}
              // ✅ Highlight stock field red if 0
              style={f.field === "stock" && v.stock === 0 ? { borderColor: "#fca5a5", background: "#fff7f7" } : {}}
              onChange={e => onChange(i, f.field, f.type === "number" ? Number(e.target.value) : e.target.value)}
            />
          )}
        </div>
      ))}
      <div style={{ textAlign: "center" }}>
        <Label>Def</Label>
        <input type="radio" checked={v.isDefault} onChange={() => onDefault(i)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#6366f1" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <Label>&nbsp;</Label>
        <button onClick={() => onRemove && onRemove(i)} disabled={!onRemove}
          style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #fca5a5", background: "#fef2f2", color: "#ef4444", cursor: onRemove ? "pointer" : "not-allowed", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", opacity: onRemove ? 1 : 0.3 }}>
          ×
        </button>
      </div>
    </div>
  );

  return (
    <AdminLayout>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, background: toast.type === "error" ? "#fef2f2" : "#f0fdf4", color: toast.type === "error" ? "#ef4444" : "#16a34a", border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#86efac"}`, boxShadow: "0 4px 12px rgba(0,0,0,.1)" }}>
          {toast.type === "error" ? "❌ " : "✅ "}{toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>Products</h3>
          <p style={{ margin: "3px 0 0", color: "#9ca3af", fontSize: 13 }}>{products.length} total products</p>
        </div>
        <button
          onClick={() => { fetchCategories(); setSubCategoryImage(""); setNewProduct({ ...emptyProduct, images: [""], variants: [{ ...emptyVariant }] }); setShowAddModal(true); }}
          style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#6366f1", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 2px 8px rgba(99,102,241,.35)" }}
        >
          + Add Product
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
        <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
        <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "9px 11px 9px 34px", borderRadius: 9, border: "1px solid #d1d5db", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>Loading products…
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["#", "Product", "Default Price", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12, textTransform: "uppercase", letterSpacing: .5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}><div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>No products found</td></tr>
              ) : filtered.map((p, i) => {
                const def = p.variants?.find(v => v.isDefault);
                const isOOS = p.stock === 0;
                // ✅ Restock subscriber count for this product
                const waitingCount = restockCounts[p._id] ?? 0;

                return (
                  <tr key={p._id} style={{ borderBottom: "1px solid #f3f4f6", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: 12 }}>{i + 1}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid #e5e7eb", flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: "#111827" }}>{p.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>{p.variants?.length} variant{p.variants?.length !== 1 ? "s" : ""}</span>
                            {p.isFlashSale && (
                              <span style={{ fontSize: 10, fontWeight: 900, background: "#fef2f2", color: "#ef4444", padding: "1px 6px", borderRadius: 4, border: "1px solid #fca5a5", display: "flex", alignItems: "center", gap: 3 }}>
                                ⚡ FLASH
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#111827" }}>
                      {def ? (
                        <>₹{def.price}{def.mrp > def.price && <span style={{ marginLeft: 6, fontSize: 11, color: "#9ca3af", textDecoration: "line-through" }}>₹{def.mrp}</span>}</>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {def ? (
                          <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: def.stock > 0 ? "#f0fdf4" : "#fef2f2", color: def.stock > 0 ? "#16a34a" : "#ef4444", border: `1px solid ${def.stock > 0 ? "#86efac" : "#fca5a5"}`, display: "inline-block" }}>
                            {def.stock > 0 ? `${def.stock} in stock` : "Out of stock"}
                          </span>
                        ) : "—"}

                        {/* ✅ Restock waiting badge */}
                        {isOOS && waitingCount > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", display: "inline-block" }}>
                            🔔 {waitingCount} waiting
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <button onClick={() => toggleStatus(p)} style={{ padding: "4px 12px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: p.isActive ? "#f0fdf4" : "#fef2f2", color: p.isActive ? "#16a34a" : "#ef4444", border: `1px solid ${p.isActive ? "#86efac" : "#fca5a5"}` }}>
                        {p.isActive ? "● Active" : "○ Inactive"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { label: "Edit",     color: "#6366f1", bg: "#eef2ff", border: "#a5b4fc", action: () => openEditProduct(p) },
                          { label: "Variants", color: "#0ea5e9", bg: "#e0f2fe", border: "#7dd3fc", action: () => setVariantProduct({ ...JSON.parse(JSON.stringify(p)), variants: p.variants.map(v => ({ ...v, unit: v.unit || "kg" })) }) },
                          { label: "Delete",   color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", action: () => deleteProduct(p._id) },
                        ].map(btn => (
                          <button key={btn.label} onClick={btn.action} style={{ padding: "4px 11px", borderRadius: 7, border: `1px solid ${btn.border}`, background: btn.bg, color: btn.color, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── ADD PRODUCT MODAL ── */}
      {showAddModal && (
        <Modal title="➕ Add New Product" onClose={() => { setShowAddModal(false); setSubCategoryImage(""); setNewProduct(emptyProduct); }} onSave={saveNewProduct} saveLabel="Save Product" saveDisabled={!newProduct.name || !newProduct.category} size={860}>
          <Section icon="🧾" title="Basic Information">
            <div style={{ marginBottom: 12 }}><Label>Product Name *</Label><Input placeholder="e.g. Fresh Tomatoes" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} /></div>
            <div style={{ marginBottom: 12 }}><Label>Description</Label><Textarea rows={2} placeholder="Short product description…" value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Quick Filter Tag</Label>
              <Select value={newProduct.quickFilter} onChange={e => setNewProduct(p => ({ ...p, quickFilter: e.target.value }))}>
                <option value="">None</option>
                <option value="festival">🎉 Festival</option>
                <option value="deals">🏷️ Deals</option>
                <option value="snacks">🍿 Snacks</option>
                <option value="dry-fruits-pan">🥜 Dry Fruits & Pan</option>
                <option value="vegetables">🥦 Vegetables</option>
              </Select>
            </div>
          </Section>

          <Section icon="⚡" title="Flash Sale">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
              <div>
                <Label>Enable Flash Sale</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={newProduct.isFlashSale} onChange={e => setNewProduct(p => ({ ...p, isFlashSale: e.target.checked }))} style={{ width: 18, height: 18, cursor: "pointer" }} />
                  <span style={{ fontSize: 13, color: "#374151" }}>{newProduct.isFlashSale ? "Active" : "Inactive"}</span>
                </div>
              </div>
              <div>
                <Label>Flash Sale Price (₹)</Label>
                <Input type="number" placeholder="99" value={newProduct.flashSalePrice} onChange={e => setNewProduct(p => ({ ...p, flashSalePrice: e.target.value }))} disabled={!newProduct.isFlashSale} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="datetime-local" value={newProduct.flashSaleEndTime} onChange={e => setNewProduct(p => ({ ...p, flashSaleEndTime: e.target.value }))} disabled={!newProduct.isFlashSale} />
              </div>
            </div>
          </Section>

          <Section icon="📂" title="Category Selection">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Section</Label>
                <Select value={newProduct.sectionId} onChange={e => { const id = e.target.value; setNewProduct(p => ({ ...p, sectionId: id, category: "", subCategory: "" })); fetchCategories(id || null); }}>
                  <option value="">All Sections</option>
                  {sections.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                </Select>
              </div>
              <div><Label>Category *</Label>
                <Select value={newProduct.category} onChange={e => { const sel = categories.find(c => c.slug === e.target.value); if (!sel) return; setNewProduct(p => ({ ...p, category: sel.slug, subCategory: sel.slug })); }}>
                  <option value="">{categories.length ? "Select Category" : "Select section first"}</option>
                  {categories.map(c => <option key={c._id} value={c.slug}>{c.title}</option>)}
                </Select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}><Label>Sub-Category Image URL (optional)</Label><Input placeholder="https://…" value={subCategoryImage} onChange={e => setSubCategoryImage(e.target.value)} /></div>
          </Section>
          <Section icon="🖼" title="Product Images">
            {newProduct.images.map((img, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Input placeholder="https://image-url.com/photo.jpg" value={img} onChange={e => { const imgs = [...newProduct.images]; imgs[i] = e.target.value; setNewProduct(p => ({ ...p, images: imgs })); }} />
                {img && <img src={img} alt="" style={{ width: 38, height: 38, borderRadius: 6, objectFit: "cover", border: "1px solid #e5e7eb", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />}
                <button onClick={() => setNewProduct(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))} style={{ padding: "0 12px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button onClick={() => setNewProduct(p => ({ ...p, images: [...p.images, ""] }))} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #a5b4fc", background: "#eef2ff", color: "#6366f1", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Add Image</button>
          </Section>
          <Section icon="📦" title="Variants">
            {newProduct.variants.map((v, i) => (
              <VariantRow key={i} v={v} i={i} onChange={updateNewVariant} onDefault={setNewDefaultVariant}
                onRemove={newProduct.variants.length > 1 ? (idx) => setNewProduct(p => ({ ...p, variants: p.variants.filter((_, j) => j !== idx) })) : null} />
            ))}
            <button onClick={addNewVariant} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #a5b4fc", background: "#eef2ff", color: "#6366f1", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Add Variant</button>
          </Section>
        </Modal>
      )}

      {/* ── EDIT PRODUCT MODAL ── */}
      {editProduct && (
        <Modal title={`✏️ Edit: ${editProduct.name}`} onClose={() => setEditProduct(null)} onSave={saveEditProduct} saveLabel="Save Changes" saveDisabled={!editProduct.category} size={700}>
          <Section icon="🧾" title="Basic Information">
            <div style={{ marginBottom: 12 }}><Label>Product Name</Label><Input value={editProduct.name} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))} /></div>
            <div style={{ marginBottom: 12 }}><Label>Description</Label><Textarea rows={2} value={editProduct.description} onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Quick Filter Tag</Label>
              <Select value={editProduct.quickFilter || ""} onChange={e => setEditProduct(p => ({ ...p, quickFilter: e.target.value }))}>
                <option value="">None</option>
                <option value="festival">🎉 Festival</option>
                <option value="deals">🏷️ Deals</option>
                <option value="snacks">🍿 Snacks</option>
                <option value="dry-fruits-pan">🥜 Dry Fruits & Pan</option>
                <option value="vegetables">🥦 Vegetables</option>
              </Select>
            </div>
          </Section>

          <Section icon="⚡" title="Flash Sale">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
              <div>
                <Label>Enable Flash Sale</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={editProduct.isFlashSale} onChange={e => setEditProduct(p => ({ ...p, isFlashSale: e.target.checked }))} style={{ width: 18, height: 18, cursor: "pointer" }} />
                  <span style={{ fontSize: 13, color: "#374151" }}>{editProduct.isFlashSale ? "Active" : "Inactive"}</span>
                </div>
              </div>
              <div>
                <Label>Flash Sale Price (₹)</Label>
                <Input type="number" placeholder="99" value={editProduct.flashSalePrice} onChange={e => setEditProduct(p => ({ ...p, flashSalePrice: e.target.value }))} disabled={!editProduct.isFlashSale} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="datetime-local" value={editProduct.flashSaleEndTime} onChange={e => setEditProduct(p => ({ ...p, flashSaleEndTime: e.target.value }))} disabled={!editProduct.isFlashSale} />
              </div>
            </div>
          </Section>

          <Section icon="📂" title="Category">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><Label>Section</Label>
                <Select value={editProduct.sectionId} onChange={e => { setEditProduct(p => ({ ...p, sectionId: e.target.value, category: "", subCategory: "" })); fetchCategories(e.target.value || null); }}>
                  <option value="">All Sections</option>
                  {sections.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                </Select>
              </div>
              <div><Label>Category</Label>
                <Select value={editProduct.category} onChange={e => { const sel = categories.find(c => c.slug === e.target.value); if (!sel) return; setEditProduct(p => ({ ...p, category: sel.slug, subCategory: sel.slug })); }}>
                  <option value="">{categories.length ? "Select Category" : "Select section first"}</option>
                  {categories.map(c => <option key={c._id} value={c.slug}>{c.title}</option>)}
                </Select>
              </div>
            </div>
            <div><Label>Status</Label>
              <Select value={editProduct.isActive ? "true" : "false"} onChange={e => setEditProduct(p => ({ ...p, isActive: e.target.value === "true" }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </Section>
          <Section icon="🖼" title="Product Images">
            {(editProduct.images || []).map((img, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Input placeholder="https://…" value={img} onChange={e => { const imgs = [...editProduct.images]; imgs[i] = e.target.value; setEditProduct(p => ({ ...p, images: imgs })); }} />
                {img && <img src={img} alt="" style={{ width: 38, height: 38, borderRadius: 6, objectFit: "cover", border: "1px solid #e5e7eb", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />}
                <button onClick={() => setEditProduct(p => ({ ...p, images: p.images.filter((_, j) => j !== i) }))} style={{ padding: "0 12px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button onClick={() => setEditProduct(p => ({ ...p, images: [...(p.images || []), ""] }))} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #a5b4fc", background: "#eef2ff", color: "#6366f1", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Add Image</button>
          </Section>
        </Modal>
      )}

      {/* ── VARIANTS MODAL ── */}
      {variantProduct && (
        <Modal title={`📦 Variants — ${variantProduct.name}`} onClose={() => setVariantProduct(null)} onSave={saveVariants} saveLabel="Save Variants" size={860}>
          {/* ✅ Restock warning if product has waiting users */}
          {restockCounts[variantProduct._id] > 0 && (
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#c2410c" }}>
                  {restockCounts[variantProduct._id]} user{restockCounts[variantProduct._id] !== 1 ? "s" : ""} waiting for restock
                </div>
                <div style={{ fontSize: 12, color: "#9a3412", marginTop: 2 }}>
                  Update stock above 0 to automatically notify them via push notification
                </div>
              </div>
            </div>
          )}
          <div style={{ marginBottom: 12, fontSize: 12, color: "#9ca3af" }}>
            Set prices, stock, and mark one variant as default. OOS variants are highlighted in red.
          </div>
          {variantProduct.variants.map((v, i) => (
            <VariantRow key={i} v={v} i={i} onChange={updateVariantField} onDefault={setDefaultVariant}
              onRemove={variantProduct.variants.length > 1 ? (idx) => setVariantProduct(p => ({ ...p, variants: p.variants.filter((_, j) => j !== idx) })) : null} />
          ))}
          <button onClick={() => setVariantProduct(p => ({ ...p, variants: [...p.variants, { ...emptyVariant, isDefault: false }] }))}
            style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid #a5b4fc", background: "#eef2ff", color: "#6366f1", cursor: "pointer", fontSize: 12, fontWeight: 600, marginTop: 4 }}>
            + Add Variant
          </button>
        </Modal>
      )}

    </AdminLayout>
  );
}