import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";

const API = "https://api.freshlaa.com/api";
const SECTION_TYPES = ["hero_banner", "promo_banner", "featured_products", "image_strip"];

function getToken() {
  return localStorage.getItem("adminToken") || "";
}

// ─── Image URL Input (matches Products.jsx pattern) ───────────
function ImageUpload({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--gray-700)", marginBottom: 8 }}>
          {label}
        </label>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          style={{
            flex: 1, padding: "10px 14px",
            border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)",
            fontSize: 13, outline: "none", color: "var(--gray-700)", boxSizing: "border-box",
          }}
          placeholder="Paste Cloudinary image URL here…"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <img
            src={value}
            alt="preview"
            style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid var(--gray-200)", flexShrink: 0 }}
            onError={e => e.target.style.display = "none"}
          />
        )}
      </div>
      {value && (
        <div style={{ marginTop: 8, borderRadius: "var(--border-radius)", overflow: "hidden", border: "1px solid var(--gray-200)" }}>
          <img src={value} alt="preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
        </div>
      )}
    </div>
  );
}

// ─── Section Editor ───────────────────────────────────────────
function SectionEditor({ section, index, products, onChange, onRemove, onMove, total }) {
  const update = (key, val) => onChange(index, { ...section, [key]: val });

  const toggleProduct = (productId) => {
    const exists = section.products?.find((p) => p.productId === productId);
    const updated = exists
      ? section.products.filter((p) => p.productId !== productId)
      : [...(section.products || []), { productId, displayOrder: section.products?.length || 0 }];
    update("products", updated);
  };

  const typeLabels = {
    hero_banner: "🖼️ Hero Banner",
    promo_banner: "📢 Promo Banner",
    featured_products: "🛍️ Featured Products",
    image_strip: "🎞️ Image Strip",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="home-layout-item"
      style={{ flexDirection: "column", alignItems: "stretch", padding: 20 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: "var(--gray-800)", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
            #{index + 1}
          </span>
          <select
            value={section.type}
            onChange={(e) => update("type", e.target.value)}
            style={{
              padding: "6px 12px", borderRadius: "var(--border-radius-sm)",
              border: "1px solid var(--gray-200)", fontWeight: 600, fontSize: 13,
              background: "#fff", cursor: "pointer", outline: "none",
            }}
          >
            {SECTION_TYPES.map((t) => (
              <option key={t} value={t}>{typeLabels[t] || t}</option>
            ))}
          </select>
          <span className={`section-status ${section.isActive !== false ? "active" : "disabled"}`}>
            {section.isActive !== false ? "Active" : "Hidden"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            className={`section-action-btn ${section.isActive !== false ? "disable" : "enable"}`}
            onClick={() => update("isActive", section.isActive === false)}
            style={{ fontSize: 12 }}
          >
            {section.isActive !== false ? "Hide" : "Show"}
          </button>
          <button onClick={() => onMove(index, -1)} disabled={index === 0}
            style={{ padding: "6px 10px", border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)", background: "#fff", cursor: index === 0 ? "not-allowed" : "pointer", opacity: index === 0 ? 0.4 : 1 }}>
            ↑
          </button>
          <button onClick={() => onMove(index, 1)} disabled={index === total - 1}
            style={{ padding: "6px 10px", border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)", background: "#fff", cursor: index === total - 1 ? "not-allowed" : "pointer", opacity: index === total - 1 ? 0.4 : 1 }}>
            ↓
          </button>
          <button onClick={() => onRemove(index)}
            style={{ padding: "6px 12px", border: "1px solid var(--danger-500)", borderRadius: "var(--border-radius-sm)", background: "#fff", color: "var(--danger-600)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            ✕ Remove
          </button>
        </div>
      </div>

      {/* Title */}
      {["featured_products", "hero_banner"].includes(section.type) && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--gray-700)", marginBottom: 6 }}>Section Title</label>
          <input
            style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            placeholder="e.g. New Arrivals"
            value={section.title || ""}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>
      )}

      {/* Banner Image */}
      {["hero_banner", "promo_banner"].includes(section.type) && (
        <>
          <ImageUpload label="Banner Image" value={section.image || ""} onChange={(url) => update("image", url)} />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--gray-700)", marginBottom: 6 }}>Action URL</label>
            <input
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="e.g. app://sale or https://..."
              value={section.actionUrl || ""}
              onChange={(e) => update("actionUrl", e.target.value)}
            />
          </div>
        </>
      )}

      {/* Image Strip */}
      {section.type === "image_strip" && (
        <div>
          <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--gray-700)", marginBottom: 8 }}>Strip Images</label>
          {(section.images?.length ? section.images : [""]).map((img, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input
                style={{ flex: 1, padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)", fontSize: 14, outline: "none" }}
                placeholder={`Image ${i + 1} URL`}
                value={img}
                onChange={(e) => {
                  const imgs = [...(section.images || [])];
                  imgs[i] = e.target.value;
                  update("images", imgs);
                }}
              />
              {img && <img src={img} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", border: "1px solid var(--gray-200)", flexShrink: 0 }} />}
              <button
                onClick={() => update("images", (section.images || []).filter((_, idx) => idx !== i))}
                style={{ padding: "0 12px", height: 40, border: "1px solid var(--danger-500)", borderRadius: "var(--border-radius-sm)", background: "#fff", color: "var(--danger-600)", cursor: "pointer", fontWeight: 700, flexShrink: 0 }}>
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => update("images", [...(section.images || []), ""])}
            style={{ padding: "8px 16px", border: "1px solid var(--gray-300)", borderRadius: "var(--border-radius-sm)", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
            + Add Image
          </button>
        </div>
      )}

      {/* Featured Products */}
      {section.type === "featured_products" && (
        <div>
          <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--gray-700)", marginBottom: 8 }}>
            Select Products <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>({section.products?.length || 0} selected)</span>
          </label>
          <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius)", padding: 8 }}>
            {products.length === 0 ? (
              <p style={{ color: "var(--gray-500)", fontSize: 13, textAlign: "center", padding: 20, margin: 0 }}>Loading products...</p>
            ) : products.map((p) => {
              const selected = section.products?.some((sp) => sp.productId === p._id);
              return (
                <div
                  key={p._id}
                  onClick={() => toggleProduct(p._id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                    borderRadius: "var(--border-radius-sm)", cursor: "pointer", marginBottom: 4,
                    background: selected ? "var(--success-50)" : "#fff",
                    border: `1px solid ${selected ? "var(--success-500)" : "var(--gray-200)"}`,
                    transition: "all var(--transition-base)",
                  }}
                >
                  <img src={p.images?.[0]} alt={p.name} style={{ width: 38, height: 38, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--gray-500)" }}>₹{p.variants?.[0]?.price} · {p.category}</div>
                  </div>
                  {selected && <span style={{ color: "var(--success-600)", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function BrandManager() {
  const [tabIcon, setTabIcon]   = useState("");
  const [tabLabel, setTabLabel] = useState("Brand");
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/brand`).then((r) => r.json()),
      fetch(`${API}/products?limit=200`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }).then((r) => r.json()),
    ])
      .then(([brandData, prodData]) => {
        if (brandData?.success && brandData?.data) {
          setTabIcon(brandData.data.tabIcon || "");
          setTabLabel(brandData.data.tabLabel || "Brand");
          setSections(brandData.data.sections || []);
        }
        const list = prodData?.products || prodData?.data || (Array.isArray(prodData) ? prodData : []);
        setProducts(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addSection = () =>
    setSections((prev) => [
      ...prev,
      { type: "hero_banner", title: "", image: "", isActive: true, displayOrder: prev.length, products: [], images: [] },
    ]);

  const updateSection = (index, updated) =>
    setSections((prev) => prev.map((s, i) => (i === index ? updated : s)));

  const removeSection = (index) =>
    setSections((prev) => prev.filter((_, i) => i !== index));

  const moveSection = (index, dir) => {
    setSections((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr.map((s, i) => ({ ...s, displayOrder: i }));
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ tabIcon, tabLabel, sections }),
      });
      const data = await res.json();
      if (data.success) showToast("✅ Brand updated! App reflects changes instantly.");
      else showToast("❌ " + (data.message || "Save failed"), "error");
    } catch {
      showToast("❌ Network error. Please try again.", "error");
    }
    setSaving(false);
  };

  return (
    <AdminLayout>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h3 className="page-heading" style={{ marginBottom: 0 }}>Brand Manager</h3>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 160 }}>
          {saving
            ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="login-spinner" style={{ width: 16, height: 16 }} /> Saving...</span>
            : "🚀 Publish to App"
          }
        </button>
      </div>

      {loading ? (
        <motion.div className="dashboard-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: 80 }}>
          <div className="login-spinner" style={{ margin: "0 auto 16px", width: 32, height: 32, borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--primary-600)" }} />
          <p style={{ color: "var(--gray-500)", margin: 0 }}>Loading brand config...</p>
        </motion.div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>

          {/* LEFT — Tab Settings */}
          <motion.div className="dashboard-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: "sticky", top: 16 }}>
            <h5 className="card-title" style={{ fontSize: 16 }}>📱 Tab Settings</h5>
            <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 20 }}>
              Controls the bottom tab icon and label in the app.
            </p>

            <ImageUpload label="Tab Icon Image" value={tabIcon} onChange={setTabIcon} />

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--gray-700)", marginBottom: 6 }}>Tab Label</label>
              <input
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                placeholder="e.g. Brand"
                value={tabLabel}
                onChange={(e) => setTabLabel(e.target.value)}
              />
            </div>

            {/* Preview */}
            <div style={{ background: "var(--gray-50)", borderRadius: "var(--border-radius)", padding: 20, textAlign: "center", border: "1px solid var(--gray-200)" }}>
              <p style={{ fontSize: 11, color: "var(--gray-500)", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Tab Preview</p>
              <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, background: "var(--success-50)", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "10px 20px" }}>
                {tabIcon
                  ? <img src={tabIcon} alt="tab" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover", border: "2px solid var(--success-600)" }} />
                  : <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏷️</div>
                }
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--success-600)" }}>{tabLabel || "Brand"}</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Total Sections", value: sections.length, color: "var(--gray-900)" },
                { label: "Active", value: sections.filter((s) => s.isActive !== false).length, color: "var(--success-600)" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "var(--gray-50)", borderRadius: "var(--border-radius-sm)", padding: 12, textAlign: "center", border: "1px solid var(--gray-200)" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "var(--gray-500)", fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Sections */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
            <div className="dashboard-card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h5 className="card-title" style={{ fontSize: 16, marginBottom: 4 }}>🗂 Brand Screen Sections</h5>
                  <p style={{ fontSize: 13, color: "var(--gray-500)", margin: 0 }}>Add banners, product rows, and image strips. Use ↑↓ to reorder.</p>
                </div>
                <button className="btn btn-secondary" onClick={addSection}>+ Add Section</button>
              </div>
            </div>

            <div className="home-layout-list">
              <AnimatePresence>
                {sections.length === 0 ? (
                  <div className="banner-placeholder">
                    <div className="banner-icon">🖼️</div>
                    <h5>No Sections Yet</h5>
                    <p style={{ color: "var(--gray-500)", fontSize: 14 }}>Click "Add Section" to start building your Brand tab.</p>
                  </div>
                ) : sections.map((section, i) => (
                  <SectionEditor
                    key={i} index={i} section={section} products={products}
                    total={sections.length} onChange={updateSection}
                    onRemove={removeSection} onMove={moveSection}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            className={`admin-toast ${toast.type}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}