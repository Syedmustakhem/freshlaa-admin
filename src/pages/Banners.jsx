import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";

const API = "https://api.freshlaa.com/api";

function getToken() {
  return localStorage.getItem("adminToken") || "";
}

const SCREENS = [
  "OffersScreen",
  "SearchScreen",
  "HomeScreen",
  "CartScreen",
  "ProfileScreen",
  "CategoriesScreen",
  "ProductDetails",
  "DealsScreen",
  "LandingScreen"
];

const fieldLabel = {
  display: "block", fontWeight: 600, fontSize: 13,
  color: "var(--gray-700)", marginBottom: 6,
};

const fieldInput = {
  width: "100%", padding: "9px 13px",
  border: "1px solid var(--gray-200)", borderRadius: "var(--border-radius-sm)",
  fontSize: 13, outline: "none", boxSizing: "border-box",
};

const selectStyle = {
  ...fieldInput, cursor: "pointer", background: "#fff",
};

// Migrate old string[] format → new object[] format
function migrateImages(images = []) {
  return images.map(img => {
    if (typeof img === "string") {
      return { url: img, action: { type: "navigate", screen: "OffersScreen" } };
    }
    return img;
  });
}

// ─── Single Banner Card ───────────────────────────────────────────────────────
function BannerCard({ banner, index, total, onChange, onDelete, onMove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="home-layout-item"
      style={{ flexDirection: "column", alignItems: "stretch", padding: 0, overflow: "hidden" }}
    >
      {/* Card Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", background: "var(--gray-50)",
        borderBottom: "1px solid var(--gray-200)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            background: "var(--gray-800)", color: "#fff",
            borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700,
          }}>#{index + 1}</span>
          <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
            → <strong>{banner.action?.screen || "—"}</strong>
          </span>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => onMove(-1)} disabled={index === 0}
            style={{ padding: "5px 10px", border: "1px solid var(--gray-200)",
                     borderRadius: 6, background: "#fff", cursor: index === 0 ? "not-allowed" : "pointer",
                     opacity: index === 0 ? 0.4 : 1, fontSize: 12 }}>↑</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            style={{ padding: "5px 10px", border: "1px solid var(--gray-200)",
                     borderRadius: 6, background: "#fff",
                     cursor: index === total - 1 ? "not-allowed" : "pointer",
                     opacity: index === total - 1 ? 0.4 : 1, fontSize: 12 }}>↓</button>
          <button onClick={onDelete}
            style={{ padding: "5px 12px", border: "1px solid var(--danger-500)",
                     borderRadius: 6, background: "#fff", color: "var(--danger-600)",
                     cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕ Remove</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 16 }}>

        {/* Image URL */}
        <div>
          <label style={fieldLabel}>Banner Image URL</label>
          <input
            style={fieldInput}
            value={banner.url || ""}
            onChange={e => onChange({ ...banner, url: e.target.value })}
            placeholder="https://res.cloudinary.com/…"
          />

          {/* Image preview */}
          {banner.url ? (
            <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden",
                          border: "1px solid var(--gray-200)", height: 120 }}>
              <img src={banner.url} alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={e => { e.target.style.display = "none"; }} />
            </div>
          ) : (
            <div style={{ marginTop: 10, borderRadius: 10, height: 120,
                          border: "2px dashed var(--gray-200)", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 24 }}>🖼️</span>
              <span style={{ fontSize: 11, color: "var(--gray-400)" }}>Paste image URL above</span>
            </div>
          )}
        </div>

        {/* Action */}
        <div>
          <label style={fieldLabel}>Tap Action</label>

          <div style={{ marginBottom: 12 }}>
            <label style={{ ...fieldLabel, fontSize: 11, color: "var(--gray-500)", marginBottom: 4 }}>
              Navigate to Screen
            </label>
            <select
              style={selectStyle}
              value={banner.action?.screen || "OffersScreen"}
              onChange={e => onChange({
                ...banner,
                action: { ...banner.action, type: "navigate", screen: e.target.value }
              })}
            >
              {SCREENS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Action preview pill */}
          <div style={{
            marginTop: 8, background: "var(--success-50, #f0fdf4)",
            border: "1px solid var(--success-200, #bbf7d0)",
            borderRadius: 8, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>👆</span>
            <div>
              <div style={{ fontSize: 11, color: "var(--gray-500)", fontWeight: 500 }}>On tap</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--success-700, #15803d)" }}>
                Navigate → {banner.action?.screen || "OffersScreen"}
              </div>
            </div>
          </div>

          {/* JSON snippet */}
          <pre style={{
            marginTop: 10, background: "var(--gray-50)",
            border: "1px solid var(--gray-200)", borderRadius: 8,
            padding: "8px 12px", fontSize: 10, color: "#4338ca",
            lineHeight: 1.6, overflow: "auto", margin: "10px 0 0",
          }}>
            {JSON.stringify({ url: banner.url || "…", action: banner.action }, null, 2)}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BannerEditor() {
  const [config,  setConfig]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load ──
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/admin/home-layout`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json();
        const section = (json.sections || []).find(s => s.type === "BANNERS");
        if (section) {
          // Migrate old string[] to new object[] format
          section.data.image = migrateImages(section.data?.image || []);
          setConfig(section);
        } else {
          showToast("BANNERS section not found", "error");
        }
      } catch {
        showToast("Failed to load banners", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const banners = config?.data?.image || [];

  const setBanners = (newBanners) =>
    setConfig(c => ({ ...c, data: { ...c.data, image: newBanners } }));

  const updateBanner = (idx, updated) => {
    const next = [...banners]; next[idx] = updated; setBanners(next);
  };

  const deleteBanner = (idx) =>
    setBanners(banners.filter((_, i) => i !== idx));

  const moveBanner = (idx, dir) => {
    const next = [...banners]; const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setBanners(next);
  };

  const addBanner = () =>
    setBanners([...banners, { url: "", action: { type: "navigate", screen: "OffersScreen" } }]);

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/admin/home-section/${config.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
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

  // ── Loading ──
  if (loading) return (
    <AdminLayout>
      <motion.div className="dashboard-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ textAlign: "center", padding: 80 }}>
        <div className="login-spinner" style={{ margin: "0 auto 16px", width: 32, height: 32,
          borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--primary-600)" }} />
        <p style={{ color: "var(--gray-500)", margin: 0 }}>Loading Banners…</p>
      </motion.div>
    </AdminLayout>
  );

  if (!config) return (
    <AdminLayout>
      <div className="dashboard-card" style={{ padding: 40, textAlign: "center", color: "var(--danger-600)" }}>
        Could not load BANNERS config.
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h3 className="page-heading" style={{ marginBottom: 4 }}>🖼️ Banner Editor</h3>
          <p style={{ fontSize: 13, color: "var(--gray-500)", margin: 0 }}>
            {banners.length} banner{banners.length !== 1 ? "s" : ""} · tap actions control where users land
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={addBanner}>+ Add Banner</button>
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

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Banners", value: banners.length, icon: "🖼️" },
          { label: "With Images",   value: banners.filter(b => b.url).length, icon: "✅" },
          { label: "Missing Image", value: banners.filter(b => !b.url).length, icon: "⚠️" },
          { label: "Unique Screens", value: new Set(banners.map(b => b.action?.screen)).size, icon: "📱" },
        ].map(stat => (
          <div key={stat.label} className="dashboard-card"
            style={{ flex: 1, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--gray-900)" }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "var(--gray-500)", fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Banner list */}
      <div className="home-layout-list">
        <AnimatePresence>
          {banners.length === 0 ? (
            <div className="banner-placeholder">
              <div className="banner-icon">🖼️</div>
              <h5>No Banners Yet</h5>
              <p style={{ color: "var(--gray-500)", fontSize: 14 }}>
                Click "Add Banner" to create your first banner.
              </p>
            </div>
          ) : banners.map((banner, idx) => (
            <BannerCard
              key={idx}
              index={idx}
              banner={banner}
              total={banners.length}
              onChange={updated => updateBanner(idx, updated)}
              onDelete={() => deleteBanner(idx)}
              onMove={dir => moveBanner(idx, dir)}
            />
          ))}
        </AnimatePresence>
      </div>

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