import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";

const API = "https://api.freshlaa.com/api";

function getToken() {
  return localStorage.getItem("adminToken") || "";
}

const deep = (o) => JSON.parse(JSON.stringify(o));
function uid() { return Math.random().toString(36).slice(2, 8); }

const BLOCK_TYPES = ["DEFAULT_HOME", "ANIMATION", "BANNERS", "PRODUCTS"];
const TYPE_COLOR  = { DEFAULT_HOME: "#6366f1", ANIMATION: "#f59e0b", BANNERS: "#10b981", PRODUCTS: "#3b82f6" };
const TYPE_ICON   = { DEFAULT_HOME: "🏠", ANIMATION: "✨", BANNERS: "🖼️", PRODUCTS: "📦" };

const blockDefaults = {
  DEFAULT_HOME: { type: "DEFAULT_HOME" },
  ANIMATION:    { type: "ANIMATION",  data: { lottie: "", height: 180 } },
  BANNERS:      { type: "BANNERS",    data: { image: [""] } },
  PRODUCTS:     { type: "PRODUCTS",   data: { query: { quickFilter: "", limit: 5 }, productIds: [] } },
};

// ─── Product Picker (same pattern as BrandManager) ────────────────────────────
function ProductPicker({ selectedIds = [], allProducts, onChange }) {
  const [search, setSearch] = useState("");

  const filtered = allProducts.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  return (
    <div>
      <input
        style={{
          width: "100%", padding: "8px 12px", marginBottom: 8,
          border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)",
          fontSize: 13, outline: "none", boxSizing: "border-box",
        }}
        placeholder="Search products…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div style={{
        maxHeight: 260, overflowY: "auto",
        border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius)", padding: 8,
      }}>
        {filtered.length === 0 ? (
          <p style={{ color: "var(--gray-400)", fontSize: 13, textAlign: "center", padding: 20, margin: 0 }}>
            No products found
          </p>
        ) : filtered.map(p => {
          const isSelected = selectedIds.includes(p._id);
          return (
            <div
              key={p._id}
              onClick={() => toggle(p._id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: "var(--border-radius-sm)",
                cursor: "pointer", marginBottom: 4,
                background: isSelected ? "var(--success-50)" : "#fff",
                border: `1px solid ${isSelected ? "var(--success-500)" : "var(--gray-200)"}`,
                transition: "all 0.15s",
              }}
            >
              <img
                src={p.images?.[0]} alt={p.name}
                style={{ width: 38, height: 38, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                onError={e => e.target.style.display = "none"}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--gray-500)" }}>
                  ₹{p.variants?.[0]?.price} · {p.category}
                </div>
              </div>
              {isSelected && <span style={{ color: "var(--success-600)", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✓</span>}
            </div>
          );
        })}
      </div>
      {selectedIds.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--success-600)", fontWeight: 600 }}>
          ✓ {selectedIds.length} product{selectedIds.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

// ─── Block Editor ─────────────────────────────────────────────────────────────
function BlockEditor({ block, index, isFirst, isLast, allProducts, onChange, onDelete, onMove }) {
  const [open, setOpen] = useState(true);
  const color = TYPE_COLOR[block.type] || "#999";

  const set = (path, value) => {
    const clone = deep(block);
    const keys  = path.split(".");
    let ref = clone;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!ref[keys[i]]) ref[keys[i]] = {};
      ref = ref[keys[i]];
    }
    ref[keys[keys.length - 1]] = value;
    onChange(clone);
  };

  const changeType = (t) => onChange(deep(blockDefaults[t]));

  const addImg = () => { const c = deep(block); c.data.image.push(""); onChange(c); };
  const setImg = (i, v) => { const c = deep(block); c.data.image[i] = v; onChange(c); };
  const delImg = (i) => { const c = deep(block); c.data.image.splice(i, 1); onChange(c); };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{
        border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`,
        borderRadius: 8, marginBottom: 8, overflow: "hidden", background: "#fff",
      }}
    >
      {/* Block Header */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", background: color + "0a", cursor: "pointer",
        }}
        onClick={() => setOpen(o => !o)}
      >
        <span>{TYPE_ICON[block.type]}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color,
          background: color + "18", padding: "2px 8px",
          borderRadius: 4, fontFamily: "monospace", letterSpacing: 0.5,
        }}>
          {block.type}
        </span>

        <select
          value={block.type}
          onClick={e => e.stopPropagation()}
          onChange={e => changeType(e.target.value)}
          style={{
            fontSize: 12, border: "1px solid var(--gray-200)",
            borderRadius: 5, padding: "3px 8px", cursor: "pointer", outline: "none",
          }}
        >
          {BLOCK_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>

        <div style={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ color: "var(--gray-300)", fontSize: 11, fontFamily: "monospace", marginRight: 4 }}>
            #{index + 1}
          </span>
          <button onClick={e => { e.stopPropagation(); onMove(-1); }} disabled={isFirst}
            style={smBtn}>↑</button>
          <button onClick={e => { e.stopPropagation(); onMove(1); }} disabled={isLast}
            style={smBtn}>↓</button>
          <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
            style={smBtn}>{open ? "▴" : "▾"}</button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ ...smBtn, color: "var(--danger-600)", borderColor: "var(--danger-500)" }}>✕</button>
        </div>
      </div>

      {/* Block Body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "14px 16px", borderTop: `1px solid ${color}15` }}>

              {block.type === "DEFAULT_HOME" && (
                <p style={{ color: "var(--gray-400)", fontSize: 13, fontStyle: "italic", margin: 0 }}>
                  Renders the default home layout — no configuration needed.
                </p>
              )}

              {block.type === "ANIMATION" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={fieldLabel}>Lottie URL</label>
                    <input style={fieldInput} value={block.data?.lottie || ""}
                      onChange={e => set("data.lottie", e.target.value)}
                      placeholder="https://assets.lottiefiles.com/…" />
                  </div>
                  <div style={{ width: 110 }}>
                    <label style={fieldLabel}>Height (px)</label>
                    <input style={fieldInput} type="number" value={block.data?.height || 180}
                      onChange={e => set("data.height", parseInt(e.target.value) || 180)} />
                  </div>
                </div>
              )}

              {block.type === "BANNERS" && (
                <div>
                  <label style={fieldLabel}>Banner Images ({block.data?.image?.length || 0})</label>
                  {(block.data?.image || []).map((img, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      {img && (
                        <img src={img} alt="" style={{ width: 52, height: 38, objectFit: "cover",
                          borderRadius: 5, border: "1px solid var(--gray-200)", flexShrink: 0 }}
                          onError={e => e.target.style.display = "none"} />
                      )}
                      <input style={{ ...fieldInput, flex: 1 }} value={img}
                        onChange={e => setImg(i, e.target.value)}
                        placeholder="https://res.cloudinary.com/…" />
                      <button onClick={() => delImg(i)}
                        style={{ ...smBtn, color: "var(--danger-600)", borderColor: "var(--danger-500)" }}>✕</button>
                    </div>
                  ))}
                  <button onClick={addImg} style={{
                    marginTop: 4, fontSize: 12, color: "#6366f1", background: "transparent",
                    border: "1px dashed #6366f1", borderRadius: 6, padding: "6px 14px",
                    cursor: "pointer", width: "100%",
                  }}>+ Add Image URL</button>
                </div>
              )}

              {block.type === "PRODUCTS" && (
                <div>
                  {/* Query fields */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 130 }}>
                      <label style={fieldLabel}>quickFilter</label>
                      <input style={fieldInput} value={block.data?.query?.quickFilter || ""}
                        onChange={e => set("data.query.quickFilter", e.target.value)}
                        placeholder="festival, deals, snacks…" />
                    </div>
                    <div style={{ flex: 1, minWidth: 130 }}>
                      <label style={fieldLabel}>category</label>
                      <input style={fieldInput} value={block.data?.query?.category || ""}
                        onChange={e => set("data.query.category", e.target.value)}
                        placeholder="dry-fruits, vegetables…" />
                    </div>
                    <div style={{ width: 80 }}>
                      <label style={fieldLabel}>limit</label>
                      <input style={fieldInput} type="number" min={1} max={50}
                        value={block.data?.query?.limit ?? 5}
                        onChange={e => set("data.query.limit", parseInt(e.target.value) || 5)} />
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
                    <span style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      OR pin specific products
                    </span>
                    <div style={{ flex: 1, height: 1, background: "var(--gray-200)" }} />
                  </div>

                  {/* Product Picker */}
                  <label style={fieldLabel}>
                    Pin Products{" "}
                    <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>
                      ({block.data?.productIds?.length || 0} pinned)
                    </span>
                  </label>
                  <ProductPicker
                    allProducts={allProducts}
                    selectedIds={block.data?.productIds || []}
                    onChange={ids => set("data.productIds", ids)}
                  />
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const smBtn = {
  width: 26, height: 26, fontSize: 11, cursor: "pointer", borderRadius: 5,
  border: "1px solid var(--gray-200)", background: "#fff", color: "var(--gray-600)",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};

const fieldLabel = {
  display: "block", fontWeight: 600, fontSize: 13,
  color: "var(--gray-700)", marginBottom: 6,
};

const fieldInput = {
  width: "100%", padding: "9px 13px",
  border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)",
  fontSize: 13, outline: "none", boxSizing: "border-box",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Quickfilters() {
  const [config,      setConfig]      = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [tab,         setTab]         = useState("editor");
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load config + products (same pattern as BrandManager) ──
  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/home-layout`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }).then(r => r.json()),
      fetch(`${API}/products?limit=200`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }).then(r => r.json()),
    ])
      .then(([layoutData, prodData]) => {
        const sections = layoutData?.sections || [];
        const section  = sections.find(s => s.type === "QUICK_FILTERS");
        if (section) setConfig(section);
        else showToast("QUICK_FILTERS section not found", "error");

        const list = prodData?.products || prodData?.data || (Array.isArray(prodData) ? prodData : []);
        setAllProducts(list);
      })
      .catch(() => showToast("Failed to load data", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout>
      <motion.div className="dashboard-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ textAlign: "center", padding: 80 }}>
        <div className="login-spinner" style={{ margin: "0 auto 16px", width: 32, height: 32,
          borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--primary-600)" }} />
        <p style={{ color: "var(--gray-500)", margin: 0 }}>Loading Quick Filters…</p>
      </motion.div>
    </AdminLayout>
  );

  if (!config) return (
    <AdminLayout>
      <div className="dashboard-card" style={{ padding: 40, textAlign: "center", color: "var(--danger-600)" }}>
        Could not load QUICK_FILTERS config.
      </div>
    </AdminLayout>
  );

  const filters  = config.data?.filters || [];
  const selected = filters[selectedIdx];

  // ── State helpers ──
  const setFilters = (newFilters) =>
    setConfig(c => ({ ...c, data: { ...c.data, filters: newFilters } }));

  const updateFilter = (idx, updated) => {
    const f = [...filters]; f[idx] = updated; setFilters(f);
  };

  const updateBlock = (bIdx, updated) => {
    const layout = [...selected.layout];
    layout[bIdx] = updated;
    updateFilter(selectedIdx, { ...selected, layout });
  };

  const deleteBlock = (bIdx) =>
    updateFilter(selectedIdx, { ...selected, layout: selected.layout.filter((_, i) => i !== bIdx) });

  const addBlock = (type) =>
    updateFilter(selectedIdx, { ...selected, layout: [...(selected.layout || []), deep(blockDefaults[type])] });

  const moveBlock = (idx, dir) => {
    const layout = [...selected.layout];
    const t = idx + dir;
    if (t < 0 || t >= layout.length) return;
    [layout[idx], layout[t]] = [layout[t], layout[idx]];
    updateFilter(selectedIdx, { ...selected, layout });
  };

  const addFilter = () => {
    const f = {
      id: `filter-${uid()}`, title: "New Filter",
      icon: "https://img.icons8.com/ios/50/category.png",
      layout: [deep(blockDefaults.PRODUCTS)],
    };
    const next = [...filters, f];
    setFilters(next);
    setSelectedIdx(next.length - 1);
  };

  const deleteFilter = (idx) => {
    if (filters.length <= 1) return;
    const next = filters.filter((_, i) => i !== idx);
    setFilters(next);
    setSelectedIdx(Math.min(idx, next.length - 1));
  };

  const moveFilter = (idx, dir) => {
    const f = [...filters]; const t = idx + dir;
    if (t < 0 || t >= f.length) return;
    [f[idx], f[t]] = [f[t], f[idx]];
    setFilters(f);
    setSelectedIdx(t);
  };

  // ── Save ──
 const handleSave = async () => {
  setSaving(true);
  try {
    // Deep clone and clean empty query fields before saving
    const cleanConfig = deep(config);
    cleanConfig.data?.filters?.forEach(filter => {
      filter.layout?.forEach(block => {
        if (block.type === "PRODUCTS" && block.data?.query) {
          block.data.query = Object.fromEntries(
            Object.entries(block.data.query).filter(([_, v]) => v !== "" && v !== null)
          );
        }
      });
    });

    const res = await fetch(`${API}/admin/home-section/${config.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(cleanConfig),
    });
    const data = await res.json();
    if (data.success !== false) showToast("✅ Quick Filters saved! App reflects changes instantly.");
    else showToast("❌ " + (data.message || "Save failed"), "error");
  } catch {
    showToast("❌ Network error. Please try again.", "error");
  }
  setSaving(false);
};

  return (
    <AdminLayout>

      {/* Page Header — same as BrandManager */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h3 className="page-heading" style={{ marginBottom: 0 }}>⚡ Quick Filters</h3>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Editor / JSON toggle */}
          <div style={{ display: "flex", border: "1px solid var(--gray-200)", borderRadius: 8, overflow: "hidden" }}>
            {[["editor", "✏️ Editor"], ["json", "{ } JSON"]].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "7px 16px", fontSize: 13, fontWeight: 600,
                border: "none", cursor: "pointer",
                background: tab === t ? "var(--primary-600)" : "#fff",
                color:      tab === t ? "#fff" : "var(--gray-600)",
              }}>{label}</button>
            ))}
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 180 }}>
            {saving
              ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="login-spinner" style={{ width: 16, height: 16 }} /> Saving...
                </span>
              : "🚀 Publish to App"
            }
          </button>
        </div>
      </div>

      {/* JSON Tab */}
      {tab === "json" && (
        <div className="dashboard-card" style={{ position: "relative" }}>
          <button
            onClick={() => { navigator.clipboard?.writeText(JSON.stringify(config, null, 2)); showToast("Copied to clipboard!"); }}
            style={{ position: "absolute", top: 16, right: 16, fontSize: 12, background: "var(--primary-600)",
                     color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", zIndex: 1 }}
          >📋 Copy</button>
          <pre style={{ background: "var(--gray-50)", borderRadius: 8, padding: 20, fontSize: 12,
                        color: "#4338ca", lineHeight: 1.7, overflow: "auto", maxHeight: "70vh", margin: 0 }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}

      {/* Editor Tab */}
      {tab === "editor" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "flex-start" }}>

          {/* LEFT — Filter List */}
          <motion.div className="dashboard-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ position: "sticky", top: 16 }}>
            <h5 className="card-title" style={{ fontSize: 14, marginBottom: 12 }}>
              Filters ({filters.length})
            </h5>

            {/* Section title */}
            <div style={{ marginBottom: 12 }}>
              <label style={fieldLabel}>Section Title</label>
              <input
                style={fieldInput}
                placeholder="Quick Picks…"
                value={config.data?.title || ""}
                onChange={e => setConfig(c => ({ ...c, data: { ...c.data, title: e.target.value } }))}
              />
            </div>

            {/* Filter list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {filters.map((f, idx) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedIdx(idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                    background: selectedIdx === idx ? "var(--primary-50, #eef2ff)" : "#fff",
                    border: `1.5px solid ${selectedIdx === idx ? "var(--primary-500, #6366f1)" : "var(--gray-200)"}`,
                    transition: "all 0.15s",
                  }}
                >
                  <img src={f.icon} alt="" style={{ width: 24, height: 24, objectFit: "contain" }}
                    onError={e => e.target.style.display = "none"} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: selectedIdx === idx ? 700 : 400,
                                  color: selectedIdx === idx ? "#4338ca" : "var(--gray-800)",
                                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--gray-400)", fontFamily: "monospace" }}>
                      {f.layout?.length || 0} blocks
                    </div>
                  </div>
                  {selectedIdx === idx && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <button onClick={e => { e.stopPropagation(); moveFilter(idx, -1); }}
                        disabled={idx === 0} style={smBtn}>↑</button>
                      <button onClick={e => { e.stopPropagation(); moveFilter(idx, 1); }}
                        disabled={idx === filters.length - 1} style={smBtn}>↓</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={addFilter} className="btn btn-secondary"
                style={{ flex: 1, fontSize: 12, padding: "7px 8px" }}>
                + Add Filter
              </button>
              {filters.length > 1 && (
                <button onClick={() => deleteFilter(selectedIdx)}
                  style={{ padding: "7px 10px", fontSize: 12, cursor: "pointer", borderRadius: 6,
                           border: "1px solid var(--danger-500)", background: "#fff5f5", color: "var(--danger-600)" }}>
                  🗑
                </button>
              )}
            </div>
          </motion.div>

          {/* RIGHT — Filter Editor */}
          {selected && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>

              {/* Filter Settings Card */}
              <div className="dashboard-card" style={{ marginBottom: 16 }}>
                <h5 className="card-title" style={{ fontSize: 14, marginBottom: 14 }}>⚙ Filter Settings</h5>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={fieldLabel}>Title</label>
                    <input style={fieldInput} value={selected.title}
                      onChange={e => updateFilter(selectedIdx, { ...selected, title: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={fieldLabel}>ID</label>
                    <input style={{ ...fieldInput, fontFamily: "monospace", fontSize: 12 }} value={selected.id}
                      onChange={e => updateFilter(selectedIdx, { ...selected, id: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={fieldLabel}>Icon URL</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input style={{ ...fieldInput, flex: 1 }} value={selected.icon}
                      onChange={e => updateFilter(selectedIdx, { ...selected, icon: e.target.value })}
                      placeholder="https://img.icons8.com/…" />
                    <img src={selected.icon} alt=""
                      style={{ width: 44, height: 44, objectFit: "contain", border: "1px solid var(--gray-200)",
                               borderRadius: 8, padding: 4, flexShrink: 0 }}
                      onError={e => e.target.style.display = "none"} />
                  </div>
                </div>
              </div>

              {/* Layout Blocks Card */}
              <div className="dashboard-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h5 className="card-title" style={{ fontSize: 14, marginBottom: 0 }}>
                    📐 Layout Blocks ({selected.layout?.length || 0})
                  </h5>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["ANIMATION", "BANNERS", "PRODUCTS"].map(t => (
                      <button key={t} onClick={() => addBlock(t)} className="btn btn-secondary"
                        style={{ fontSize: 11, padding: "5px 10px",
                                 color: TYPE_COLOR[t], borderColor: TYPE_COLOR[t] + "66" }}>
                        + {t}
                      </button>
                    ))}
                  </div>
                </div>

                {(!selected.layout || selected.layout.length === 0) && (
                  <div className="banner-placeholder" style={{ padding: "32px 16px" }}>
                    <div className="banner-icon">📐</div>
                    <p style={{ color: "var(--gray-500)", fontSize: 13, margin: 0 }}>
                      No blocks yet — add one above ↑
                    </p>
                  </div>
                )}

                <AnimatePresence>
                  {selected.layout?.map((block, idx) => (
                    <BlockEditor
                      key={idx} index={idx} block={block}
                      isFirst={idx === 0} isLast={idx === selected.layout.length - 1}
                      allProducts={allProducts}
                      onChange={u => updateBlock(idx, u)}
                      onDelete={() => deleteBlock(idx)}
                      onMove={dir => moveBlock(idx, dir)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Toast — same as BrandManager */}
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