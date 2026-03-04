import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";

const API = "https://api.freshlaa.com/api";

function getToken() {
  return localStorage.getItem("adminToken") || "";
}

const SCREENS = [
  "SearchScreen",
  "OffersScreen",
  "HomeScreen",
  "CartScreen",
  "ProfileScreen",
  "ProductDetails",
  "Categories",
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
  ...fieldInput,
  cursor: "pointer", background: "#fff",
};

// ─── Live Phone Preview ───────────────────────────────────────────────────────
function PhonePreview({ data }) {
  const placeholder = data?.search?.placeholder || 'Search "Milk"';
  const ctaVisible  = data?.search?.rightCTA?.visible ?? true;
  const ctaImage    = data?.search?.rightCTA?.image || "";
  const ctaScreen   = data?.search?.rightCTA?.action?.screen || "";
  const searchScreen = data?.search?.action?.screen || "SearchScreen";

  return (
    <div style={{
      background: "var(--gray-50)", borderRadius: 16,
      padding: 20, border: "1px solid var(--gray-200)",
    }}>
      <p style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14, margin: "0 0 14px" }}>
        📱 Live Preview
      </p>

      {/* Phone frame */}
      <div style={{
        background: "#1a1a2e", borderRadius: 24, padding: "16px 12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}>
        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
          <span style={{ fontSize: 10, color: "#ffffff88", fontWeight: 700 }}>9:41</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["▪","▪","▪"].map((d,i) => (
              <span key={i} style={{ fontSize: 8, color: "#ffffff88" }}>{d}</span>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff", borderRadius: 14,
          padding: "10px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <span style={{ flex: 1, fontSize: 13, color: "#aaa", fontWeight: 500 }}>
            {placeholder}
          </span>
          {ctaVisible && (
            <div style={{ position: "relative" }}>
              {ctaImage ? (
                <img src={ctaImage} alt="CTA"
                  style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover",
                           border: "2px solid #e5e7eb" }}
                  onError={e => e.target.style.display = "none"} />
              ) : (
                <div style={{ width: 34, height: 34, borderRadius: 10,
                              background: "#f3f4f6", display: "flex",
                              alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  🎁
                </div>
              )}
              <div style={{
                position: "absolute", bottom: -2, right: -2,
                width: 10, height: 10, borderRadius: "50%",
                background: "#10b981", border: "1.5px solid #fff",
              }} />
            </div>
          )}
        </div>

        {/* Navigation labels */}
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#ffffff55" }}>Search taps →</div>
            <div style={{ fontSize: 9, color: "#10b981", fontWeight: 700 }}>{searchScreen}</div>
          </div>
          {ctaVisible && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#ffffff55" }}>CTA taps →</div>
              <div style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700 }}>{ctaScreen}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HeaderEditor() {
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
        const section = (json.sections || []).find(s => s.type === "HEADER");
        if (section) setConfig(section);
        else showToast("HEADER section not found", "error");
      } catch {
        showToast("Failed to load header config", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Deep update helper ──
  const setPath = (obj, path, value) => {
    const clone = JSON.parse(JSON.stringify(obj));
    const keys  = path.split(".");
    let ref = clone;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!ref[keys[i]]) ref[keys[i]] = {};
      ref = ref[keys[i]];
    }
    ref[keys[keys.length - 1]] = value;
    return clone;
  };

  const update = (path, value) => {
    setConfig(c => ({
      ...c,
      data: setPath(c.data, path, value),
    }));
  };

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
      if (data.success !== false) showToast("✅ Header saved! App reflects changes instantly.");
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
        <p style={{ color: "var(--gray-500)", margin: 0 }}>Loading Header config…</p>
      </motion.div>
    </AdminLayout>
  );

  if (!config) return (
    <AdminLayout>
      <div className="dashboard-card" style={{ padding: 40, textAlign: "center", color: "var(--danger-600)" }}>
        Could not load HEADER config.
      </div>
    </AdminLayout>
  );

  const d = config.data;

  return (
    <AdminLayout>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h3 className="page-heading" style={{ marginBottom: 0 }}>🔍 Header Editor</h3>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 180 }}>
          {saving
            ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="login-spinner" style={{ width: 16, height: 16 }} /> Saving...
              </span>
            : "🚀 Publish to App"
          }
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "flex-start" }}>

        {/* LEFT — Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Search Bar Settings */}
          <motion.div className="dashboard-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h5 className="card-title" style={{ fontSize: 15, marginBottom: 16 }}>🔍 Search Bar</h5>

            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>Placeholder Text</label>
              <input
                style={fieldInput}
                value={d?.search?.placeholder || ""}
                onChange={e => update("search.placeholder", e.target.value)}
                placeholder='Search "Milk"'
              />
              <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>
                This is the greyed-out hint text inside the search bar.
              </div>
            </div>

            <div>
              <label style={fieldLabel}>Tap Action → Navigate to Screen</label>
              <select
                style={selectStyle}
                value={d?.search?.action?.screen || "SearchScreen"}
                onChange={e => update("search.action.screen", e.target.value)}
              >
                {SCREENS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </motion.div>

          {/* Right CTA Settings */}
          <motion.div className="dashboard-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h5 className="card-title" style={{ fontSize: 15, marginBottom: 0 }}>🎯 Right CTA Button</h5>

              {/* Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "var(--gray-600)" }}>
                  {d?.search?.rightCTA?.visible ? "Visible" : "Hidden"}
                </span>
                <div
                  onClick={() => update("search.rightCTA.visible", !d?.search?.rightCTA?.visible)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                    background: d?.search?.rightCTA?.visible ? "var(--success-500, #10b981)" : "var(--gray-300)",
                    position: "relative", transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 2,
                    left: d?.search?.rightCTA?.visible ? 22 : 2,
                    width: 20, height: 20, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }} />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {d?.search?.rightCTA?.visible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  {/* CTA Type */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={fieldLabel}>CTA Type</label>
                    <select
                      style={selectStyle}
                      value={d?.search?.rightCTA?.type || "image"}
                      onChange={e => update("search.rightCTA.type", e.target.value)}
                    >
                      <option value="image">Image</option>
                      <option value="icon">Icon</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  {/* CTA Image URL */}
                  {d?.search?.rightCTA?.type === "image" && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={fieldLabel}>Image URL</label>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input
                          style={{ ...fieldInput, flex: 1 }}
                          value={d?.search?.rightCTA?.image || ""}
                          onChange={e => update("search.rightCTA.image", e.target.value)}
                          placeholder="https://res.cloudinary.com/…"
                        />
                        {d?.search?.rightCTA?.image && (
                          <img
                            src={d.search.rightCTA.image} alt="CTA preview"
                            style={{ width: 48, height: 48, borderRadius: 10,
                                     objectFit: "cover", border: "1px solid var(--gray-200)",
                                     flexShrink: 0 }}
                            onError={e => e.target.style.display = "none"}
                          />
                        )}
                      </div>
                      {d?.search?.rightCTA?.image && (
                        <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden",
                                      border: "1px solid var(--gray-200)", maxHeight: 120 }}>
                          <img src={d.search.rightCTA.image} alt="preview"
                            style={{ width: "100%", maxHeight: 120, objectFit: "cover", display: "block" }}
                            onError={e => e.target.style.display = "none"} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA Action */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={fieldLabel}>CTA Tap Action → Navigate to Screen</label>
                    <select
                      style={selectStyle}
                      value={d?.search?.rightCTA?.action?.screen || "OffersScreen"}
                      onChange={e => update("search.rightCTA.action.screen", e.target.value)}
                    >
                      {SCREENS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Action Type */}
                  <div>
                    <label style={fieldLabel}>Action Type</label>
                    <select
                      style={selectStyle}
                      value={d?.search?.rightCTA?.action?.type || "navigate"}
                      onChange={e => update("search.rightCTA.action.type", e.target.value)}
                    >
                      <option value="navigate">navigate</option>
                      <option value="deeplink">deeplink</option>
                      <option value="url">url</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* JSON Preview */}
          <motion.div className="dashboard-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h5 className="card-title" style={{ fontSize: 15, marginBottom: 0 }}>{ } Output JSON</h5>
              <button
                onClick={() => { navigator.clipboard?.writeText(JSON.stringify(config, null, 2)); showToast("Copied!"); }}
                style={{ fontSize: 12, background: "var(--primary-600)", color: "#fff",
                         border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}
              >📋 Copy</button>
            </div>
            <pre style={{ background: "var(--gray-50)", borderRadius: 8, padding: "14px 16px",
                          fontSize: 11, color: "#4338ca", lineHeight: 1.7,
                          overflow: "auto", maxHeight: 200, margin: 0 }}>
              {JSON.stringify(config.data, null, 2)}
            </pre>
          </motion.div>
        </div>

        {/* RIGHT — Live Preview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
          style={{ position: "sticky", top: 16 }}>
          <PhonePreview data={d} />

          {/* Config summary */}
          <div className="dashboard-card" style={{ marginTop: 16 }}>
            <h5 className="card-title" style={{ fontSize: 14, marginBottom: 12 }}>📋 Config Summary</h5>
            {[
              { label: "Placeholder",    value: d?.search?.placeholder || "—" },
              { label: "Search → Screen", value: d?.search?.action?.screen || "—" },
              { label: "CTA Visible",    value: d?.search?.rightCTA?.visible ? "✅ Yes" : "❌ No" },
              { label: "CTA Type",       value: d?.search?.rightCTA?.type || "—" },
              { label: "CTA → Screen",   value: d?.search?.rightCTA?.action?.screen || "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between",
                                        alignItems: "center", padding: "7px 0",
                                        borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 12, color: "var(--gray-800)", fontWeight: 600,
                               maxWidth: 160, textAlign: "right", overflow: "hidden",
                               textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
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