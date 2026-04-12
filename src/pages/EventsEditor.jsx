import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";

const API = "https://api.freshlaa.com/api";

function getToken() {
  return localStorage.getItem("adminToken") || "";
}

const COLORS = [
  { label: "Pink", value: "#ffeaef" },
  { label: "Orange", value: "#fff4e1" },
  { label: "Peach", value: "#ffe9d6" },
  { label: "Beige", value: "#f5f3ef" },
  { label: "Green", value: "#e8f5e9" },
  { label: "Blue", value: "#e3f2fd" },
];

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
            {selectedIds.length > 0 ? `${selectedIds.length} products selected` : "Select products for this event"}
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
                maxHeight: 200, overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: 6,
                background: "rgba(0,0,0,0.2)",
              }}>
                {filtered.map(p => {
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
                      }}
                    >
                      <img src={p.images?.[0]} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>₹{p.variants?.[0]?.price}</div>
                      </div>
                      {isSel && <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Event Card ─────────────────────────────────────────────── */
function EventCard({ event, index, allProducts, onChange }) {
  const update = (key, val) => onChange({ ...event, [key]: val });

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f1923 0%, #0a1628 100%)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: 20, marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
          color: "#fff", borderRadius: 7, padding: "3px 10px",
          fontSize: 12, fontWeight: 800,
        }}>EVENT #{index + 1}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left Col: Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={fieldLabel}>Title</label>
            <input style={fieldInput} value={event.title || ""} onChange={e => update("title", e.target.value)} placeholder="e.g. Summer Glow Up" />
          </div>
          <div>
            <label style={fieldLabel}>Badge (Optional)</label>
            <input style={fieldInput} value={event.badge || ""} onChange={e => update("badge", e.target.value)} placeholder="e.g. ENDING SOON!" />
          </div>
          <div>
            <label style={fieldLabel}>Background Color</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLORS.map(c => (
                <div
                  key={c.value}
                  onClick={() => update("bgColor", c.value)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                    background: c.value, border: `2px solid ${event.bgColor === c.value ? "#22c55e" : "transparent"}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                />
              ))}
              <input 
                type="color" 
                value={event.bgColor || "#ffffff"} 
                onChange={e => update("bgColor", e.target.value)}
                style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer" }}
              />
            </div>
          </div>
        </div>

        {/* Right Col: Images */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={fieldLabel}>Product Montage URL</label>
            <input style={fieldInput} value={event.imageUrl || ""} onChange={e => update("imageUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label style={fieldLabel}>Brand Logo URL</label>
            <input style={fieldInput} value={event.logoUrl || ""} onChange={e => update("logoUrl", e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={fieldLabel}>Pinned Products</label>
        <ProductPicker
          allProducts={allProducts}
          selectedIds={event.productIds || []}
          onChange={ids => update("productIds", ids)}
        />
      </div>
    </div>
  );
}

export default function EventsEditor() {
  const [config, setConfig] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`${API}/admin/home-layout`, { headers: { Authorization: `Bearer ${getToken()}` } }),
          fetch(`${API}/products/admin/all`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        ]);
        const json1 = await res1.json();
        const json2 = await res2.json();

        let section = (json1.sections || []).find(s => s.type === "EVENT_GRID");
        if (!section) {
          section = {
            type: "EVENT_GRID",
            data: { 
              title: "Events this week",
              items: Array(4).fill().map(() => ({ title: "", badge: "", bgColor: "#ffeaef", imageUrl: "", logoUrl: "", productIds: [] }))
            },
            isActive: true,
          };
        }
        setConfig(section);
        setAllProducts(json2.data || json2.products || []);
      } catch (err) {
        showToast("Failed to load events", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = config._id 
        ? `${API}/admin/home-section/${config._id}` 
        : `${API}/admin/home-section`;
      const res = await fetch(url, {
        method: config._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success !== false) {
        showToast("✅ Events saved successfully!");
        if (!config._id) setConfig(data.section);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      showToast(err.message || "Failed to save events", "error");
    }
    setSaving(false);
  };

  if (loading) return <AdminLayout><div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading Editor...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, color: "#f1f5f9" }}>📅 Events Grid Editor</h3>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Configure the 2x2 grid for "Events this week"</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          padding: "10px 24px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
          color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
          boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
        }}>
          {saving ? "Saving..." : "🚀 Publish Events"}
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={fieldLabel}>Grid Section Title</label>
        <input 
          style={{ ...fieldInput, maxWidth: 400 }} 
          value={config.data.title || ""} 
          onChange={e => setConfig({ ...config, data: { ...config.data, title: e.target.value } })}
          placeholder="e.g. Events this week"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {config.data.items.map((item, idx) => (
          <EventCard
            key={idx}
            index={idx}
            event={item}
            allProducts={allProducts}
            onChange={updated => {
              const next = [...config.data.items];
              next[idx] = updated;
              setConfig({ ...config, data: { ...config.data, items: next } });
            }}
          />
        ))}
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10,
          background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
          color: toast.type === "error" ? "#b91c1c" : "#15803d",
          border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          fontWeight: 700, zIndex: 1000,
        }}>
          {toast.msg}
        </div>
      )}
    </AdminLayout>
  );
}
