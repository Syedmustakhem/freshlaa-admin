import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";

const API = "https://api.freshlaa.com/api";

function getToken() {
  return localStorage.getItem("adminToken") || "";
}

const SCREENS = [
  "LandingScreen",
  "OffersScreen",
  "SearchScreen",
  "HomeScreen",
  "CartScreen",
  "ProfileScreen",
  "CategoriesScreen",
  "ProductDetails",
  "DealsScreen",
];

const SCREEN_ICONS = {
  LandingScreen: "🚀",
  OffersScreen: "🏷️",
  SearchScreen: "🔍",
  HomeScreen: "🏠",
  CartScreen: "🛒",
  ProfileScreen: "👤",
  CategoriesScreen: "📂",
  ProductDetails: "📦",
  DealsScreen: "⚡",
};

const fieldLabel = {
  display: "block", fontWeight: 700, fontSize: 11,
  color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px",
};

const fieldInput = {
  width: "100%", padding: "10px 14px",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, fontSize: 13, outline: "none",
  boxSizing: "border-box", background: "rgba(255,255,255,0.04)",
  color: "#f1f5f9", transition: "border-color 0.2s",
};

const selectStyle = {
  ...fieldInput, cursor: "pointer",
};

function migrateImages(images = []) {
  return images.map(img => {
    if (typeof img === "string") {
      return { url: img, title: "", subtitle: "", productIds: [], action: { type: "navigate", screen: "LandingScreen" } };
    }
    return { productIds: [], ...img };
  });
}

/* ── Product Picker ─────────────────────────────────────────── */
function ProductPicker({ selectedIds = [], allProducts, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

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
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderRadius: 10, cursor: "pointer",
          border: `1px solid ${open ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)"}`,
          background: open ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.04)",
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>📦</span>
          <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>
            {selectedIds.length > 0 ? `${selectedIds.length} product${selectedIds.length !== 1 ? "s" : ""} pinned` : "Pin specific products"}
          </span>
        </div>
        <span style={{ color: "#64748b", fontSize: 12, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 8 }}>
              <input
                style={{ ...fieldInput, marginBottom: 8 }}
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div style={{
                maxHeight: 240, overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: 6,
                background: "rgba(0,0,0,0.2)",
              }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "#475569", fontSize: 13 }}>No products found</div>
                ) : filtered.map(p => {
                  const isSel = selectedIds.includes(p._id);
                  return (
                    <div
                      key={p._id}
                      onClick={() => toggle(p._id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 3,
                        background: isSel ? "rgba(34,197,94,0.1)" : "transparent",
                        border: `1px solid ${isSel ? "rgba(34,197,94,0.3)" : "transparent"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <img src={p.images?.[0]} alt="" style={{ width: 36, height: 36, borderRadius: 7, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)" }}
                        onError={e => e.target.style.display = "none"} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>₹{p.variants?.[0]?.price} · {p.category}</div>
                      </div>
                      {isSel && <span style={{ color: "#22c55e", fontSize: 16, flexShrink: 0 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
              {selectedIds.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>✓ {selectedIds.length} pinned</span>
                  <button
                    onClick={() => onChange([])}
                    style={{ fontSize: 10, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Banner Card ─────────────────────────────────────────────── */
function BannerCard({ banner, index, total, allProducts = [], onChange, onDelete, onMove }) {
  const [tab, setTab] = useState("content");

  const update = (key, val) => onChange({ ...banner, [key]: val });
  const updateAction = (key, val) => onChange({ ...banner, action: { ...banner.action, [key]: val } });

  const tabs = [
    { id: "content", label: "Content", icon: "✏️" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "action", label: "Action", icon: "👆" },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{
        background: "linear-gradient(135deg, #0f1923 0%, #0a1628 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, marginBottom: 12, overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "#fff", borderRadius: 7, padding: "3px 10px",
            fontSize: 12, fontWeight: 800, letterSpacing: 0.5,
          }}>#{index + 1}</span>

          {/* Image preview pill */}
          {banner.url && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "4px 10px 4px 4px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <img src={banner.url} style={{ width: 24, height: 24, borderRadius: 5, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{banner.title || "Untitled Banner"}</span>
            </div>
          )}

          {!banner.url && (
            <span style={{ fontSize: 12, color: "#475569", fontStyle: "italic" }}>No image yet</span>
          )}

          {/* Product count badge */}
          {banner.productIds?.length > 0 && (
            <span style={{ fontSize: 10, background: "rgba(34,197,94,0.15)", color: "#22c55e", borderRadius: 6, padding: "2px 8px", fontWeight: 700, border: "1px solid rgba(34,197,94,0.25)" }}>
              {banner.productIds.length} products
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => onMove(-1)} disabled={index === 0}
            style={{ padding: "5px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, background: "rgba(255,255,255,0.04)", cursor: index === 0 ? "not-allowed" : "pointer", opacity: index === 0 ? 0.3 : 1, color: "#94a3b8", fontSize: 12 }}>↑</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            style={{ padding: "5px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, background: "rgba(255,255,255,0.04)", cursor: index === total - 1 ? "not-allowed" : "pointer", opacity: index === total - 1 ? 0.3 : 1, color: "#94a3b8", fontSize: 12 }}>↓</button>
          <button onClick={onDelete}
            style={{ padding: "5px 12px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 16px" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 16px", fontSize: 12, fontWeight: 700,
              border: "none", background: "none", cursor: "pointer",
              color: tab === t.id ? "#22c55e" : "#475569",
              borderBottom: `2px solid ${tab === t.id ? "#22c55e" : "transparent"}`,
              transition: "all 0.2s", marginBottom: -1,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 16 }}>
        <AnimatePresence mode="wait">

          {/* CONTENT TAB */}
          {tab === "content" && (
            <motion.div key="content" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={fieldLabel}>Banner Image URL</label>
                  <input style={fieldInput} value={banner.url || ""} onChange={e => update("url", e.target.value)} placeholder="https://res.cloudinary.com/…" />
                  {banner.url ? (
                    <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", height: 130, position: "relative" }}>
                      <img src={banner.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, borderRadius: 12, height: 130, border: "2px dashed rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 28 }}>🖼️</span>
                      <span style={{ fontSize: 11, color: "#475569" }}>Paste image URL above</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={fieldLabel}>Landing Screen Title</label>
                    <input style={fieldInput} value={banner.title || ""} onChange={e => update("title", e.target.value)} placeholder="e.g. Festival Deals" />
                  </div>
                  <div>
                    <label style={fieldLabel}>Subtitle</label>
                    <input style={fieldInput} value={banner.subtitle || ""} onChange={e => update("subtitle", e.target.value)} placeholder="e.g. Up to 50% off" />
                  </div>
                  <div>
                    <label style={fieldLabel}>Badge Text (optional)</label>
                    <input style={fieldInput} value={banner.badge || ""} onChange={e => update("badge", e.target.value)} placeholder="e.g. 🔥 Limited Time" />
                  </div>
                  <div>
                    <label style={fieldLabel}>Countdown Timer (optional)</label>
                    <input type="datetime-local" style={fieldInput} value={banner.timerEndsAt || ""} onChange={e => update("timerEndsAt", e.target.value)} />
                    <span style={{ fontSize: 10, color: "#64748b", marginTop: 4, display: "block" }}>Adds a live countdown overlay on the app</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PRODUCTS TAB */}
          {tab === "products" && (
            <motion.div key="products" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <p style={{ fontSize: 12, color: "#86efac", margin: 0, lineHeight: 1.6 }}>
                  <strong>📌 Pinned products</strong> will show exclusively on the landing screen when this banner is tapped. Leave empty to load products based on the screen/filter setting in the Action tab.
                </p>
              </div>
              <ProductPicker
                allProducts={allProducts}
                selectedIds={banner.productIds || []}
                onChange={ids => update("productIds", ids)}
              />
            </motion.div>
          )}

          {/* ACTION TAB */}
          {tab === "action" && (
            <motion.div key="action" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabel}>Navigate to Screen</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {SCREENS.map(sc => (
                    <div
                      key={sc}
                      onClick={() => updateAction("screen", sc)}
                      style={{
                        padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                        background: banner.action?.screen === sc ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${banner.action?.screen === sc ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.07)"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{SCREEN_ICONS[sc] || "📱"}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: banner.action?.screen === sc ? "#22c55e" : "#64748b" }}>
                        {sc.replace("Screen", "")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {SCREEN_ICONS[banner.action?.screen] || "📱"}
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>On tap</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>Navigate → {banner.action?.screen || "LandingScreen"}</div>
                  {banner.productIds?.length > 0 && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>with {banner.productIds.length} pinned products</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function BannerEditor() {
  const [config,      setConfig]      = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [viewMode,    setViewMode]    = useState("editor"); // editor | json

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`${API}/admin/home-layout`, { headers: { Authorization: `Bearer ${getToken()}` } }),
          fetch(`${API}/products/admin/all`,  { headers: { Authorization: `Bearer ${getToken()}` } }),
        ]);
        const json     = await res1.json();
        const prodJson = await res2.json();

        const section = (json.sections || []).find(s => s.type === "BANNERS");
        if (section) {
          section.data.image = migrateImages(section.data?.image || []);
          setConfig(section);
        } else {
          showToast("BANNERS section not found", "error");
        }

        const list = prodJson?.data || prodJson?.products || (Array.isArray(prodJson) ? prodJson : []);
        setAllProducts(list);
      } catch {
        showToast("Failed to load banners", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const banners    = config?.data?.image || [];
  const setBanners = (next) => setConfig(c => ({ ...c, data: { ...c.data, image: next } }));

  const updateBanner = (idx, updated) => { const n = [...banners]; n[idx] = updated; setBanners(n); };
  const deleteBanner = (idx) => setBanners(banners.filter((_, i) => i !== idx));
  const moveBanner   = (idx, dir) => {
    const n = [...banners]; const t = idx + dir;
    if (t < 0 || t >= n.length) return;
    [n[idx], n[t]] = [n[t], n[idx]]; setBanners(n);
  };
  const addBanner = () => setBanners([...banners, { url: "", title: "", subtitle: "", badge: "", timerEndsAt: "", productIds: [], action: { type: "navigate", screen: "LandingScreen" } }]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/admin/home-section/${config.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success !== false) showToast("✅ Banners saved! App reflects changes instantly.");
      else showToast("❌ " + (data.message || "Save failed"), "error");
    } catch {
      showToast("❌ Network error. Please try again.", "error");
    }
    setSaving(false);
  };

  /* ── dark theme wrapper ── */
  const darkCard = {
    background: "linear-gradient(135deg, #0f1923 0%, #0a1628 100%)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, padding: 20,
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid rgba(34,197,94,0.2)", borderTopColor: "#22c55e", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#475569", margin: 0, fontSize: 14 }}>Loading Banners…</p>
        </div>
      </div>
    </AdminLayout>
  );

  if (!config) return (
    <AdminLayout>
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>Could not load BANNERS config.</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #334155 !important; }
        input:focus { border-color: rgba(34,197,94,0.4) !important; }
        select option { background: #0f172a; color: #f1f5f9; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 24, color: "#f1f5f9", letterSpacing: -0.5 }}>
            🖼️ Banner Editor
          </h3>
          <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 13 }}>
            {banners.length} banner{banners.length !== 1 ? "s" : ""} · configure tap actions, products & visuals
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* View toggle */}
          <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
            {[["editor", "✏️ Editor"], ["json", "{ } JSON"]].map(([v, label]) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: "8px 16px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
                background: viewMode === v ? "rgba(34,197,94,0.15)" : "transparent",
                color: viewMode === v ? "#22c55e" : "#475569",
                transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>
          <button onClick={addBanner} style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#f1f5f9", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            + Add Banner
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "9px 22px", borderRadius: 10, border: "none",
            background: saving ? "rgba(34,197,94,0.3)" : "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "#fff", fontSize: 13, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer",
            boxShadow: saving ? "none" : "0 4px 16px rgba(34,197,94,0.3)",
            display: "flex", alignItems: "center", gap: 8, minWidth: 180, justifyContent: "center",
          }}>
            {saving ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Saving…
              </>
            ) : "🚀 Publish to App"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Banners",   value: banners.length,                                          icon: "🖼️", color: "#22c55e" },
          { label: "With Images",     value: banners.filter(b => b.url).length,                       icon: "✅", color: "#22c55e" },
          { label: "Pinned Products", value: banners.reduce((s, b) => s + (b.productIds?.length || 0), 0), icon: "📦", color: "#f59e0b" },
          { label: "Missing Image",   value: banners.filter(b => !b.url).length,                      icon: "⚠️", color: "#ef4444" },
        ].map(stat => (
          <div key={stat.label} style={{ ...darkCard, padding: "16px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* JSON View */}
      {viewMode === "json" && (
        <div style={{ ...darkCard, position: "relative" }}>
          <button
            onClick={() => { navigator.clipboard?.writeText(JSON.stringify(config, null, 2)); showToast("Copied!"); }}
            style={{ position: "absolute", top: 16, right: 16, fontSize: 12, background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}
          >📋 Copy</button>
          <pre style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 20, fontSize: 11, color: "#86efac", lineHeight: 1.8, overflow: "auto", maxHeight: "70vh", margin: 0 }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}

      {/* Editor View */}
      {viewMode === "editor" && (
        <>
          {banners.length === 0 ? (
            <div style={{ ...darkCard, padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
              <h5 style={{ color: "#f1f5f9", margin: "0 0 8px", fontWeight: 700, fontSize: 18 }}>No Banners Yet</h5>
              <p style={{ color: "#475569", margin: "0 0 20px", fontSize: 14 }}>Click "Add Banner" to create your first banner.</p>
              <button onClick={addBanner} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                + Add Your First Banner
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {banners.map((banner, idx) => (
                <BannerCard
                  key={idx}
                  index={idx}
                  banner={banner}
                  total={banners.length}
                  allProducts={allProducts}
                  onChange={updated => updateBanner(idx, updated)}
                  onDelete={() => deleteBanner(idx)}
                  onMove={dir => moveBanner(idx, dir)}
                />
              ))}
            </AnimatePresence>
          )}
        </>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 60 }}
            style={{
              position: "fixed", bottom: 24, right: 24, zIndex: 9999,
              padding: "14px 22px", borderRadius: 12, fontWeight: 700, fontSize: 13,
              background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
              color: toast.type === "error" ? "#f87171" : "#22c55e",
              border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}