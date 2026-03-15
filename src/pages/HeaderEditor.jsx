/**
 * OffersPageEditor.jsx — Admin Panel (FIXED)
 *
 * All API calls now match home.routes.js:
 *   LOAD:  GET  /api/home-layout/admin/offer-page/:slug
 *   SAVE:  PUT  /api/home-layout/admin/offer-page/:slug
 *   PRODS: GET  /api/products/admin/all
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";

const API = "https://api.freshlaa.com/api";

function getToken() {
  return localStorage.getItem("adminToken") || "";
}

/* ══════════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════════ */
const fieldLabel = {
  display: "block", fontWeight: 700, fontSize: 11,
  color: "#94a3b8", marginBottom: 6,
  textTransform: "uppercase", letterSpacing: "0.6px",
};
const fieldInput = {
  width: "100%", padding: "10px 14px",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, fontSize: 13, outline: "none",
  boxSizing: "border-box",
  background: "rgba(255,255,255,0.04)",
  color: "#f1f5f9", transition: "border-color 0.2s",
};
const darkCard = {
  background: "linear-gradient(135deg, #0f1923 0%, #0a1628 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

/* ══════════════════════════════════════════════════════
   PRODUCT PICKER
══════════════════════════════════════════════════════ */
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
            {selectedIds.length > 0
              ? `${selectedIds.length} product${selectedIds.length !== 1 ? "s" : ""} pinned`
              : "Pin products to this section"}
          </span>
        </div>
        <span style={{
          color: "#64748b", fontSize: 12, display: "inline-block",
          transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s",
        }}>▾</span>
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
                placeholder="Search by name or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div style={{
                maxHeight: 260, overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: 6,
                background: "rgba(0,0,0,0.2)",
              }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#475569", fontSize: 13 }}>
                    No products found
                  </div>
                ) : filtered.map(p => {
                  const isSel = selectedIds.includes(p._id);
                  const variant = p.variants?.find(v => v.isDefault) || p.variants?.[0];
                  return (
                    <div
                      key={p._id}
                      onClick={() => toggle(p._id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px", borderRadius: 8,
                        cursor: "pointer", marginBottom: 3,
                        background: isSel ? "rgba(34,197,94,0.1)" : "transparent",
                        border: `1px solid ${isSel ? "rgba(34,197,94,0.3)" : "transparent"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <img
                        src={p.images?.[0]} alt=""
                        style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)" }}
                        onError={e => { e.target.src = ""; e.target.style.background = "#1e293b"; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                          ₹{variant?.price ?? "—"} · {p.category || "Uncategorized"}
                          {variant?.mrp > variant?.price && (
                            <span style={{ marginLeft: 6, color: "#22c55e", fontWeight: 700 }}>
                              {Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}% off
                            </span>
                          )}
                        </div>
                      </div>
                      {isSel && <span style={{ color: "#22c55e", fontSize: 16, flexShrink: 0 }}>✓</span>}
                    </div>
                  );
                })}
              </div>

              {selectedIds.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>
                    ✓ {selectedIds.length} product{selectedIds.length !== 1 ? "s" : ""} pinned
                  </span>
                  <button
                    onClick={() => onChange([])}
                    style={{ fontSize: 10, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                  >
                    Clear all
                  </button>
                </div>
              )}

              {selectedIds.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedIds.map((id) => {
                    const p = allProducts.find(x => x._id === id);
                    if (!p) return null;
                    return (
                      <div key={id} style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        borderRadius: 8, padding: "4px 8px 4px 4px",
                        fontSize: 11, color: "#86efac",
                      }}>
                        <img src={p.images?.[0]} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: "cover" }}
                          onError={e => e.target.style.display = "none"} />
                        <span style={{ fontWeight: 600, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        <span
                          onClick={e => { e.stopPropagation(); toggle(id); }}
                          style={{ color: "#ef4444", cursor: "pointer", fontWeight: 700, fontSize: 13, lineHeight: 1, marginLeft: 2 }}
                        >×</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SECTION CARD
══════════════════════════════════════════════════════ */
function SectionCard({ section, index, total, allProducts, onChange, onDelete, onMove }) {
  const [expanded, setExpanded] = useState(true);
  const update = (key, val) => onChange({ ...section, [key]: val });

  const productCount = section.productIds?.length || 0;

  const variant0 = (id) => {
    const p = allProducts.find(x => x._id === id);
    return p?.variants?.find(v => v.isDefault) || p?.variants?.[0];
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{ ...darkCard, marginBottom: 14, overflow: "hidden" }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", cursor: "pointer",
          background: "rgba(255,255,255,0.02)",
          borderBottom: expanded ? "1px solid rgba(255,255,255,0.06)" : "none",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "#fff", borderRadius: 7, padding: "3px 10px",
            fontSize: 12, fontWeight: 800, letterSpacing: 0.5, flexShrink: 0,
          }}>
            Section {index + 1}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
            {section.title || <span style={{ color: "#475569", fontStyle: "italic" }}>Untitled Section</span>}
          </span>
          {productCount > 0 ? (
            <span style={{ fontSize: 10, background: "rgba(34,197,94,0.15)", color: "#22c55e", borderRadius: 6, padding: "2px 8px", fontWeight: 700, border: "1px solid rgba(34,197,94,0.25)" }}>
              {productCount} products
            </span>
          ) : (
            <span style={{ fontSize: 10, background: "rgba(239,68,68,0.1)", color: "#f87171", borderRadius: 6, padding: "2px 8px", fontWeight: 700, border: "1px solid rgba(239,68,68,0.2)" }}>
              ⚠️ No products
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={e => { e.stopPropagation(); onMove(-1); }} disabled={index === 0}
            style={{ padding: "5px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, background: "rgba(255,255,255,0.04)", cursor: index === 0 ? "not-allowed" : "pointer", opacity: index === 0 ? 0.3 : 1, color: "#94a3b8", fontSize: 12 }}>↑</button>
          <button onClick={e => { e.stopPropagation(); onMove(1); }} disabled={index === total - 1}
            style={{ padding: "5px 10px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, background: "rgba(255,255,255,0.04)", cursor: index === total - 1 ? "not-allowed" : "pointer", opacity: index === total - 1 ? 0.3 : 1, color: "#94a3b8", fontSize: 12 }}>↓</button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ padding: "5px 12px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕</button>
          <span style={{ color: "#475569", fontSize: 16, marginLeft: 4 }}>{expanded ? "▴" : "▾"}</span>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Meta fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={fieldLabel}>Section Title *</label>
                  <input style={fieldInput} value={section.title || ""} onChange={e => update("title", e.target.value)} placeholder="e.g. Mega Flash Deals" />
                </div>
                <div>
                  <label style={fieldLabel}>Subtitle (optional)</label>
                  <input style={fieldInput} value={section.subtitle || ""} onChange={e => update("subtitle", e.target.value)} placeholder="e.g. Limited stock — hurry!" />
                </div>
                <div>
                  <label style={fieldLabel}>Badge Text (optional)</label>
                  <input style={fieldInput} value={section.badge || ""} onChange={e => update("badge", e.target.value)} placeholder="e.g. 🔥 Hot Picks" />
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

              {/* Product picker */}
              <div>
                <label style={{ ...fieldLabel, marginBottom: 10 }}>Pinned Products</label>
                <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 12, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)" }}>
                  <p style={{ fontSize: 12, color: "#86efac", margin: 0, lineHeight: 1.6 }}>
                    <strong>📌 Products pinned here</strong> will appear in this section's horizontal scroll on the Offers Screen. Order matters — first pinned = first shown.
                  </p>
                </div>
                <ProductPicker
                  allProducts={allProducts}
                  selectedIds={section.productIds || []}
                  onChange={ids => update("productIds", ids)}
                />
              </div>

              {/* Preview order */}
              {productCount > 0 && (
                <div>
                  <label style={{ ...fieldLabel, marginBottom: 10 }}>Preview Order</label>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                    {section.productIds.map((id, i) => {
                      const p = allProducts.find(x => x._id === id);
                      const v = variant0(id);
                      if (!p) return (
                        <div key={id} style={{ width: 80, flexShrink: 0, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", height: 100, fontSize: 10, color: "#f87171", textAlign: "center", padding: 6 }}>
                          Not found
                        </div>
                      );
                      const disc = v?.mrp > v?.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
                      return (
                        <div key={id} style={{ width: 86, flexShrink: 0, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", position: "relative" }}>
                          <div style={{ position: "absolute", top: 5, left: 5, background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 5, fontSize: 9, fontWeight: 800, padding: "2px 5px", zIndex: 1 }}>#{i + 1}</div>
                          {disc > 0 && <div style={{ position: "absolute", top: 5, right: 5, background: "#ef4444", color: "#fff", borderRadius: 5, fontSize: 9, fontWeight: 800, padding: "2px 5px", zIndex: 1 }}>{disc}%</div>}
                          <img src={p.images?.[0]} alt="" style={{ width: "100%", height: 70, objectFit: "cover", display: "block" }}
                            onError={e => { e.target.src = ""; e.target.parentElement.style.background = "#1e293b"; }} />
                          <div style={{ padding: "6px 7px 8px" }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.name}</div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#22c55e", marginTop: 3 }}>₹{v?.price ?? "—"}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   BANNER BLOCK
══════════════════════════════════════════════════════ */
function BannerBlock({ banner, onChange }) {
  return (
    <div style={{ ...darkCard, padding: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 20 }}>🖼️</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>Offer Page Banner</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>Full-width hero image at the top of the Offers Screen</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <div>
          <label style={fieldLabel}>Banner Image URL</label>
          <input style={fieldInput} value={banner || ""} onChange={e => onChange(e.target.value)} placeholder="https://res.cloudinary.com/…" />
          <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>Recommended: 1200×480px, JPG/PNG/WebP</div>
        </div>
        <div style={{ borderRadius: 12, overflow: "hidden", height: 130, position: "relative", background: "#0f1923", border: "1px solid rgba(255,255,255,0.07)" }}>
          {banner ? (
            <>
              <img src={banner} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
              <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(34,197,94,0.9)", color: "#fff", borderRadius: 6, fontSize: 10, fontWeight: 700, padding: "2px 8px" }}>✓ Preview</div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", height: "100%", gap: 8 }}>
              <span style={{ fontSize: 32 }}>🖼️</span>
              <span style={{ fontSize: 11, color: "#475569" }}>Paste URL to preview</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   META BLOCK
══════════════════════════════════════════════════════ */
function MetaBlock({ slug, pageData, onChange }) {
  const update = (key, val) => onChange({ ...pageData, [key]: val });
  return (
    <div style={{ ...darkCard, padding: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 20 }}>⚙️</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>Page Settings</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>
            Slug: <code style={{ color: "#22c55e", fontSize: 11 }}>{slug}</code>
            &nbsp;·&nbsp;
            <span style={{ color: "#334155" }}>Public URL: </span>
            <code style={{ color: "#22c55e", fontSize: 11 }}>/api/home-layout/offer-page/{slug}</code>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div>
          <label style={fieldLabel}>Page Title</label>
          <input style={fieldInput} value={pageData?.title || ""} onChange={e => update("title", e.target.value)} placeholder="e.g. Maxxed Out Sale" />
        </div>
        <div>
          <label style={fieldLabel}>Subtitle</label>
          <input style={fieldInput} value={pageData?.subtitle || ""} onChange={e => update("subtitle", e.target.value)} placeholder="e.g. Up to 60% off" />
        </div>
        <div>
          <label style={fieldLabel}>Countdown (hours)</label>
          <input style={fieldInput} type="number" min={0} value={pageData?.countdownHours ?? 6} onChange={e => update("countdownHours", Number(e.target.value))} placeholder="6" />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function OffersPageEditor() {
  const [slug,      setSlug]      = useState("maxxed-out-sale");
  const [slugInput, setSlugInput] = useState("maxxed-out-sale");
  const [pageData,  setPageData]  = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [viewMode,  setViewMode]  = useState("editor");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch all products once ── */
  useEffect(() => {
    fetch(`${API}/products/admin/all`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(j => {
        const list = j?.data || j?.products || (Array.isArray(j) ? j : []);
        setAllProducts(list);
      })
      .catch(() => showToast("Failed to load products", "error"));
  }, []);

  /* ── Fetch offer page (admin route — returns raw productIds) ── */
  const fetchPage = useCallback(async (s) => {
    setLoading(true);
    setPageData(null);
    try {
      // ✅ FIXED: uses /admin/offer-page/:slug
      const res  = await fetch(`${API}/home-layout/admin/offer-page/${s}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();

      const raw = json.page || json;

      // Normalise sections — ensure productIds is always a string array
      // (backend stores ObjectIds; convert to strings for JS comparison)
      const normalised = {
        ...raw,
        sections: (raw.sections || []).map(sec => ({
          title:      sec.title      || "",
          subtitle:   sec.subtitle   || "",
          badge:      sec.badge      || "",
          // productIds from Mongo come as ObjectId objects or strings
          productIds: (sec.productIds || []).map(id => String(id)),
        })),
      };
      setPageData(normalised);
    } catch {
      // Start fresh if not found
      setPageData({ slug: s, banner: "", title: "", subtitle: "", countdownHours: 6, sections: [] });
      showToast("New page — fill in details and publish", "info");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPage(slug); }, [slug]);

  /* ── Section helpers ── */
  const sections    = pageData?.sections || [];
  const setSections = (next) => setPageData(p => ({ ...p, sections: next }));

  const updateSection = (idx, updated) => { const n = [...sections]; n[idx] = updated; setSections(n); };
  const deleteSection = (idx) => setSections(sections.filter((_, i) => i !== idx));
  const moveSection   = (idx, dir) => {
    const n = [...sections]; const t = idx + dir;
    if (t < 0 || t >= n.length) return;
    [n[idx], n[t]] = [n[t], n[idx]]; setSections(n);
  };
  const addSection = () => setSections([...sections, { title: "", subtitle: "", badge: "", productIds: [] }]);

  /* ── Save ── */
  const handleSave = async () => {
    if (!pageData) return;
    setSaving(true);
    try {
      const payload = {
        banner:         pageData.banner         || "",
        title:          pageData.title          || "",
        subtitle:       pageData.subtitle       || "",
        countdownHours: pageData.countdownHours ?? 6,
        isActive:       pageData.isActive       !== false,
        // ✅ Send clean sections with productIds array
        sections: sections.map(sec => ({
          title:      sec.title      || "",
          subtitle:   sec.subtitle   || "",
          badge:      sec.badge      || "",
          productIds: sec.productIds || [],
        })),
      };

      // ✅ FIXED: uses /admin/offer-page/:slug
      const res  = await fetch(`${API}/home-layout/admin/offer-page/${slug}`, {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success !== false) {
        showToast("✅ Offers page published! App reflects changes instantly.");
        // Refresh so we have the saved _ids
        fetchPage(slug);
      } else {
        showToast("❌ " + (data.message || "Save failed"), "error");
      }
    } catch {
      showToast("❌ Network error. Please try again.", "error");
    }
    setSaving(false);
  };

  const totalPinned   = sections.reduce((s, sec) => s + (sec.productIds?.length || 0), 0);
  const emptySections = sections.filter(sec => !sec.productIds?.length).length;

  return (
    <AdminLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #334155 !important; }
        input:focus, textarea:focus { border-color: rgba(34,197,94,0.4) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        code { font-family: 'Fira Code', 'Courier New', monospace; }
      `}</style>

      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 24, color: "#f1f5f9", letterSpacing: -0.5 }}>
            🏷️ Offers Page Editor
          </h3>
          <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 13 }}>
            {sections.length} section{sections.length !== 1 ? "s" : ""} · {totalPinned} total products pinned
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
            {[["editor", "✏️ Editor"], ["json", "{ } JSON"]].map(([v, label]) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: "8px 16px", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
                background: viewMode === v ? "rgba(34,197,94,0.15)" : "transparent",
                color: viewMode === v ? "#22c55e" : "#475569", transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>

          <button onClick={addSection} style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#f1f5f9", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            + Add Section
          </button>

          <button onClick={handleSave} disabled={saving || loading} style={{
            padding: "9px 22px", borderRadius: 10, border: "none",
            background: saving ? "rgba(34,197,94,0.3)" : "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "#fff", fontSize: 13, fontWeight: 800,
            cursor: saving || loading ? "not-allowed" : "pointer",
            boxShadow: saving ? "none" : "0 4px 16px rgba(34,197,94,0.3)",
            display: "flex", alignItems: "center", gap: 8, minWidth: 190, justifyContent: "center",
          }}>
            {saving ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Publishing…
              </>
            ) : "🚀 Publish to App"}
          </button>
        </div>
      </div>

      {/* SLUG SWITCHER */}
      <div style={{ ...darkCard, padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#475569", fontWeight: 600, flexShrink: 0 }}>Offer Slug:</span>
        <input
          style={{ ...fieldInput, flex: 1, maxWidth: 280 }}
          value={slugInput}
          onChange={e => setSlugInput(e.target.value)}
          placeholder="maxxed-out-sale"
          onKeyDown={e => { if (e.key === "Enter") setSlug(slugInput.trim()); }}
        />
        <button
          onClick={() => setSlug(slugInput.trim())}
          style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >Load →</button>
        <span style={{ fontSize: 11, color: "#334155", flexShrink: 0 }}>
          Mobile fetches: <code style={{ color: "#22c55e" }}>/api/home-layout/offer-page/{slug}</code>
        </span>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, border: "3px solid rgba(34,197,94,0.2)", borderTopColor: "#22c55e", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#475569", margin: 0, fontSize: 14 }}>Loading offers page…</p>
          </div>
        </div>
      )}

      {!loading && pageData && (
        <>
          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Sections",       value: sections.length,    icon: "📋", color: "#22c55e" },
              { label: "Total Products", value: totalPinned,        icon: "📦", color: "#22c55e" },
              { label: "Empty Sections", value: emptySections,      icon: "⚠️", color: emptySections > 0 ? "#ef4444" : "#22c55e" },
              { label: "Has Banner",     value: pageData.banner ? "Yes" : "No", icon: "🖼️", color: pageData.banner ? "#22c55e" : "#ef4444" },
            ].map(stat => (
              <div key={stat.label} style={{ ...darkCard, padding: "16px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* JSON VIEW */}
          {viewMode === "json" && (
            <div style={{ ...darkCard, position: "relative", padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => { navigator.clipboard?.writeText(JSON.stringify(pageData, null, 2)); showToast("Copied!"); }}
                style={{ position: "absolute", top: 16, right: 16, zIndex: 1, fontSize: 12, background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}
              >📋 Copy</button>
              <pre style={{ background: "rgba(0,0,0,0.3)", borderRadius: 16, padding: 24, fontSize: 11, color: "#86efac", lineHeight: 1.8, overflow: "auto", maxHeight: "70vh", margin: 0 }}>
                {JSON.stringify(pageData, null, 2)}
              </pre>
            </div>
          )}

          {/* EDITOR VIEW */}
          {viewMode === "editor" && (
            <>
              <BannerBlock banner={pageData.banner} onChange={val => setPageData(p => ({ ...p, banner: val }))} />
              <MetaBlock slug={slug} pageData={pageData} onChange={updated => setPageData(p => ({ ...p, ...updated }))} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 3, height: 20, borderRadius: 2, background: "linear-gradient(#22c55e, #16a34a)" }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>Product Sections</span>
                  <span style={{ fontSize: 11, color: "#22c55e", background: "rgba(34,197,94,0.12)", padding: "2px 8px", borderRadius: 6, fontWeight: 700, border: "1px solid rgba(34,197,94,0.2)" }}>{sections.length}</span>
                </div>
                <button onClick={addSection} style={{ padding: "8px 16px", borderRadius: 9, fontSize: 12, fontWeight: 700, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#22c55e", cursor: "pointer" }}>
                  + Add Section
                </button>
              </div>

              {sections.length === 0 ? (
                <div style={{ ...darkCard, padding: 60, textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                  <h5 style={{ color: "#f1f5f9", margin: "0 0 8px", fontWeight: 700, fontSize: 18 }}>No Sections Yet</h5>
                  <p style={{ color: "#475569", margin: "0 0 20px", fontSize: 14 }}>Add a section to pin products to the Offers Screen.</p>
                  <button onClick={addSection} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add First Section</button>
                </div>
              ) : (
                <AnimatePresence>
                  {sections.map((sec, idx) => (
                    <SectionCard
                      key={idx}
                      index={idx}
                      section={sec}
                      total={sections.length}
                      allProducts={allProducts}
                      onChange={updated => updateSection(idx, updated)}
                      onDelete={() => deleteSection(idx)}
                      onMove={dir => moveSection(idx, dir)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </>
          )}
        </>
      )}

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60 }}
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