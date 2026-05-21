import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import { 
  Sparkles, 
  Smartphone, 
  Image as ImageIcon, 
  Settings, 
  Layout, 
  Play, 
  Plus, 
  Trash2, 
  Check, 
  HelpCircle, 
  AlertCircle, 
  FolderPlus,
  RefreshCw,
  Search,
  Eye,
  Type
} from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

// Glassmorphism design tokens for Admin Panel
const formStyles = {
  label: {
    display: "block",
    fontWeight: 700,
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    color: "#f1f5f9",
    transition: "all 0.2s",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    background: "#0f172a",
    color: "#f1f5f9",
    cursor: "pointer",
  },
  card: {
    background: "linear-gradient(135deg, #0f1923 0%, #0a1628 100%)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  }
};

export default function PopupModalManager() {
  const [modals, setModals] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    type: "announcement", // announcement | deal
    imageUrl: "",
    description: "",
    textColor: "#ffffff",
    backgroundColor: "#7c3aed", // beautiful premium violet default
    primaryBtnText: "Explore Offer",
    redirectionType: "none", // product | category | offer | none
    redirectionId: "",
    dealProducts: [],
    dealStartingPrice: 9,
    showOncePerUser: true,
    isActive: false
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [modalRes, prodRes, catRes, offerRes] = await Promise.all([
        api.get("/admin/popup-modal/all"),
        api.get("/products?limit=250"),
        api.get("/categories"),
        api.get("/offers")
      ]);

      setModals(modalRes.data.data || []);
      setProducts(prodRes.data.products || prodRes.data.data || []);
      setCategories(catRes.data.data || catRes.data || []);
      setOffers(offerRes.data.data || offerRes.data || []);
    } catch (err) {
      console.error(err);
      showToast({ message: "Failed to load modals or configuration dependencies", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) {
      return showToast({ message: "Title and Banner Image URL are required!", type: "error" });
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/admin/popup-modal/${editingId}`, form);
        showToast({ message: "Popup modal updated successfully!", type: "success" });
        setModals(prev => prev.map(m => m._id === editingId ? res.data.data : m));
        setEditingId(null);
      } else {
        const res = await api.post("/admin/popup-modal", form);
        showToast({ message: "New popup modal created successfully!", type: "success" });
        setModals(prev => [res.data.data, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      showToast({ message: "Failed to save configuration", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      type: "announcement",
      imageUrl: "",
      description: "",
      textColor: "#ffffff",
      backgroundColor: "#7c3aed",
      primaryBtnText: "Explore Offer",
      redirectionType: "none",
      redirectionId: "",
      dealProducts: [],
      dealStartingPrice: 9,
      showOncePerUser: true,
      isActive: false
    });
    setEditingId(null);
  };

  const handleEdit = (modal) => {
    setEditingId(modal._id);
    setForm({
      title: modal.title || "",
      type: modal.type || "announcement",
      imageUrl: modal.imageUrl || "",
      description: modal.description || "",
      textColor: modal.textColor || "#ffffff",
      backgroundColor: modal.backgroundColor || "#7c3aed",
      primaryBtnText: modal.primaryBtnText || "Explore Offer",
      redirectionType: modal.redirectionType || "none",
      redirectionId: modal.redirectionId || "",
      dealProducts: modal.dealProducts ? modal.dealProducts.map(p => typeof p === 'object' ? p._id : p) : [],
      dealStartingPrice: modal.dealStartingPrice || 9,
      showOncePerUser: modal.showOncePerUser !== undefined ? modal.showOncePerUser : true,
      isActive: modal.isActive || false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await api.patch(`/admin/popup-modal/${id}/toggle`);
      showToast({ message: res.data.message, type: "success" });
      
      // Since only one can be active at a time, fetch modals again to sync states perfectly
      const modalRes = await api.get("/admin/popup-modal/all");
      setModals(modalRes.data.data || []);
    } catch (err) {
      showToast({ message: "Failed to toggle modal status", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this popup modal template?")) return;
    try {
      await api.delete(`/admin/popup-modal/${id}`);
      showToast({ message: "Popup modal template deleted successfully!", type: "success" });
      setModals(prev => prev.filter(m => m._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      showToast({ message: "Failed to delete popup template", type: "error" });
    }
  };

  const handleProductToggle = (prodId) => {
    setForm(prev => {
      const exists = prev.dealProducts.includes(prodId);
      let updated = [];
      if (exists) {
        updated = prev.dealProducts.filter(id => id !== prodId);
      } else {
        if (prev.dealProducts.length >= 3) {
          showToast({ message: "You can select up to 3 showcase products for premium styling!", type: "error" });
          return prev;
        }
        updated = [...prev.dealProducts, prodId];
      }
      return { ...prev, dealProducts: updated };
    });
  };

  const filteredProducts = products.filter(p => 
    p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Home Popup Modal Manager">
      <div style={{ color: "#f8fafc", paddingBottom: 60 }}>
        
        {/* Header Title Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, background: "linear-gradient(to right, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Dynamic Home Popup Manager
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
              Design gorgeous seasonal greetings, announcements, or dynamic special deals triggered on app start!
            </p>
          </div>
          <button 
            onClick={fetchInitialData}
            style={{ padding: "10px 14px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 10, color: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync DB
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24, alignItems: "start" }}>
            
            {/* Left Column: Form & Existing Templates */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Creator Form */}
              <div style={formStyles.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ padding: 8, background: "rgba(99, 102, 241, 0.15)", borderRadius: 8, color: "#6366f1" }}>
                    <Settings size={20} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                    {editingId ? "Edit Modal Template" : "Create New Popup Modal"}
                  </h3>
                </div>

                <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  
                  {/* Title & Type */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={formStyles.label}>Modal Headline</label>
                      <input 
                        type="text" 
                        value={form.title} 
                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. SPECIAL DEALS"
                        style={formStyles.input}
                        required
                      />
                    </div>
                    <div>
                      <label style={formStyles.label}>Modal Type</label>
                      <select 
                        value={form.type} 
                        onChange={e => setForm(p => ({ ...p, type: e.target.value, dealProducts: e.target.value === 'announcement' ? [] : p.dealProducts }))}
                        style={formStyles.select}
                      >
                        <option value="announcement">📢 Announcement Banner / Greeting</option>
                        <option value="deal">🛍️ Special Deal (Showcase Products)</option>
                      </select>
                    </div>
                  </div>

                  {/* Banner Image URL & Description */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                    <div>
                      <label style={formStyles.label}>Banner Graphic Image URL</label>
                      <div style={{ position: "relative" }}>
                        <input 
                          type="text" 
                          value={form.imageUrl} 
                          onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                          placeholder="https://res.cloudinary.com/.../festive_deal.png"
                          style={{ ...formStyles.input, paddingLeft: 42 }}
                          required
                        />
                        <ImageIcon size={18} style={{ position: "absolute", left: 14, top: 14, color: "#475569" }} />
                      </div>
                    </div>
                    <div>
                      <label style={formStyles.label}>Bottom Micro-subtext</label>
                      <input 
                        type="text" 
                        value={form.description} 
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="e.g. *Available till stocks last"
                        style={formStyles.input}
                      />
                    </div>
                  </div>

                  {/* Design Colors & Customization */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={formStyles.label}>Card Background (Hex)</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input 
                          type="color" 
                          value={form.backgroundColor} 
                          onChange={e => setForm(p => ({ ...p, backgroundColor: e.target.value }))}
                          style={{ width: 44, height: 44, border: "none", borderRadius: 8, background: "none", cursor: "pointer" }}
                        />
                        <input 
                          type="text" 
                          value={form.backgroundColor} 
                          onChange={e => setForm(p => ({ ...p, backgroundColor: e.target.value }))}
                          style={{ ...formStyles.input, flex: 1 }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={formStyles.label}>Text / Accent Color</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input 
                          type="color" 
                          value={form.textColor} 
                          onChange={e => setForm(p => ({ ...p, textColor: e.target.value }))}
                          style={{ width: 44, height: 44, border: "none", borderRadius: 8, background: "none", cursor: "pointer" }}
                        />
                        <input 
                          type="text" 
                          value={form.textColor} 
                          onChange={e => setForm(p => ({ ...p, textColor: e.target.value }))}
                          style={{ ...formStyles.input, flex: 1 }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={formStyles.label}>Button Call-To-Action</label>
                      <input 
                        type="text" 
                        value={form.primaryBtnText} 
                        onChange={e => setForm(p => ({ ...p, primaryBtnText: e.target.value }))}
                        style={formStyles.input}
                      />
                    </div>
                  </div>

                  {/* Deal-Specific Fields */}
                  {form.type === "deal" && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      style={{ border: "1px dashed rgba(99, 102, 241, 0.3)", borderRadius: 14, padding: 16, background: "rgba(99, 102, 241, 0.02)" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: "#6366f1", display: "flex", alignItems: "center", gap: 6 }}>
                          <Sparkles size={14} />
                          Product Showcase Showcase Setup (Max 3 items)
                        </h4>
                        <div style={{ fontSize: 11, color: form.dealProducts.length === 3 ? "#10b981" : "#94a3b8" }}>
                          Selected: {form.dealProducts.length}/3
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 16, marginBottom: 14 }}>
                        <div>
                          <label style={formStyles.label}>Starting price label</label>
                          <input 
                            type="number" 
                            value={form.dealStartingPrice} 
                            onChange={e => setForm(p => ({ ...p, dealStartingPrice: Number(e.target.value) }))}
                            placeholder="9"
                            style={formStyles.input}
                          />
                        </div>
                        <div>
                          <label style={formStyles.label}>Search Showcase Products</label>
                          <div style={{ position: "relative" }}>
                            <input 
                              type="text"
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              placeholder="Search by product name..."
                              style={{ ...formStyles.input, paddingLeft: 38 }}
                            />
                            <Search size={14} style={{ position: "absolute", left: 14, top: 15, color: "#64748b" }} />
                          </div>
                        </div>
                      </div>

                      {/* Horizontal product selector selection grid */}
                      <div style={{ maxHeight: 180, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 8 }}>
                        {filteredProducts.length === 0 ? (
                          <div style={{ gridColumn: "span 2", textAlign: "center", color: "#64748b", fontSize: 12, padding: 12 }}>No products found matching query.</div>
                        ) : (
                          filteredProducts.map(p => {
                            const isSelected = form.dealProducts.includes(p._id);
                            return (
                              <div 
                                key={p._id}
                                onClick={() => handleProductToggle(p._id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: 8,
                                  background: isSelected ? "rgba(99, 102, 241, 0.1)" : "rgba(255,255,255,0.02)",
                                  border: `1px solid ${isSelected ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
                                  borderRadius: 8,
                                  cursor: "pointer",
                                  userSelect: "none"
                                }}
                              >
                                <img src={p.image || "/placeholder.png"} style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                                  <div style={{ fontSize: 9, color: "#64748b" }}>Val: ₹{p.discountPrice || p.price}</div>
                                </div>
                                {isSelected && <Check size={12} style={{ color: "#6366f1" }} />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Redirection Settings */}
                  <div style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, background: "rgba(255, 255, 255, 0.01)" }}>
                    <h4 style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                      Button Navigation Action Settings
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={formStyles.label}>Redirection Type</label>
                        <select 
                          value={form.redirectionType} 
                          onChange={e => setForm(p => ({ ...p, redirectionType: e.target.value, redirectionId: "" }))}
                          style={formStyles.select}
                        >
                          <option value="none">❌ No Redirection (Simple Dismiss)</option>
                          <option value="product">📦 Specific Product Detail Screen</option>
                          <option value="category">📂 Specific Category Listing Screen</option>
                          <option value="offer">🎉 Specific Dynamic Campaign/Offer Page</option>
                        </select>
                      </div>

                      <div>
                        {form.redirectionType !== "none" && (
                          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                            <label style={formStyles.label}>Target Redemption Link</label>
                            {form.redirectionType === "product" && (
                              <select 
                                value={form.redirectionId} 
                                onChange={e => setForm(p => ({ ...p, redirectionId: e.target.value }))}
                                style={formStyles.select}
                              >
                                <option value="">-- Choose Target Product --</option>
                                {products.map(p => (
                                  <option key={p._id} value={p._id}>{p.name} (₹{p.discountPrice || p.price})</option>
                                ))}
                              </select>
                            )}

                            {form.redirectionType === "category" && (
                              <select 
                                value={form.redirectionId} 
                                onChange={e => setForm(p => ({ ...p, redirectionId: e.target.value }))}
                                style={formStyles.select}
                              >
                                <option value="">-- Choose Target Category --</option>
                                {categories.map(c => (
                                  <option key={c._id} value={c._id}>{c.title}</option>
                                ))}
                              </select>
                            )}

                            {form.redirectionType === "offer" && (
                              <select 
                                value={form.redirectionId} 
                                onChange={e => setForm(p => ({ ...p, redirectionId: e.target.value }))}
                                style={formStyles.select}
                              >
                                <option value="">-- Choose Target Offer Page --</option>
                                {offers.map(o => (
                                  <option key={o._id || o.slug} value={o.slug || o._id}>{o.title || o.name}</option>
                                ))}
                              </select>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Checkbox settings */}
                  <div style={{ display: "flex", gap: 24, alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                      <input 
                        type="checkbox" 
                        checked={form.showOncePerUser} 
                        onChange={e => setForm(p => ({ ...p, showOncePerUser: e.target.checked }))}
                        style={{ width: 16, height: 16, accentColor: "#6366f1" }}
                      />
                      <span>Show once per user session (Recommended)</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                      <input 
                        type="checkbox" 
                        checked={form.isActive} 
                        onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                        style={{ width: 16, height: 16, accentColor: "#6366f1" }}
                      />
                      <span style={{ color: form.isActive ? "#10b981" : "#f8fafc", fontWeight: 700 }}>
                        Activate Modal Immediately
                      </span>
                    </label>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                    {editingId && (
                      <button 
                        type="button" 
                        onClick={resetForm}
                        style={{ padding: "12px 20px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 12, color: "#f8fafc", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit" 
                      disabled={saving}
                      style={{ padding: "12px 28px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", border: "none", borderRadius: 12, color: "#ffffff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {saving ? "Saving..." : editingId ? "Update Modal Template" : "Deploy Modal"}
                    </button>
                  </div>

                </form>
              </div>

              {/* Existing Templates Grid */}
              <div style={formStyles.card}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Layout size={18} style={{ color: "#6366f1" }} />
                  Saved Popup Modal Templates ({modals.length})
                </h3>

                {modals.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                    No popup modal templates saved. Complete the form above to deploy your first festival banner!
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {modals.map(m => (
                      <div 
                        key={m._id} 
                        style={{ 
                          background: "rgba(255, 255, 255, 0.02)", 
                          border: `1px solid ${m.isActive ? "rgba(99, 102, 241, 0.4)" : "rgba(255, 255, 255, 0.06)"}`, 
                          borderRadius: 14, 
                          padding: 16,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: 12,
                          boxShadow: m.isActive ? "0 0 16px rgba(99, 102, 241, 0.1)" : "none"
                        }}
                      >
                        <div style={{ display: "flex", gap: 10 }}>
                          <img src={m.imageUrl} style={{ width: 70, height: 70, borderRadius: 8, objectFit: "cover" }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 9, padding: "2px 6px", background: m.type === 'deal' ? "rgba(236, 72, 153, 0.15)" : "rgba(99, 102, 241, 0.15)", color: m.type === 'deal' ? "#ec4899" : "#6366f1", borderRadius: 4, fontWeight: 700, textTransform: "uppercase" }}>
                                {m.type}
                              </span>
                              {m.isActive && (
                                <span style={{ fontSize: 9, padding: "2px 6px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", borderRadius: 4, fontWeight: 700 }}>
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <h4 style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</h4>
                            <p style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                              <span>CTA: {m.primaryBtnText}</span>
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10 }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button 
                              onClick={() => handleToggleActive(m._id)}
                              style={{ 
                                padding: "6px 12px", 
                                background: m.isActive ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", 
                                color: m.isActive ? "#ef4444" : "#10b981", 
                                border: "none", 
                                borderRadius: 8, 
                                fontSize: 11, 
                                fontWeight: 700, 
                                cursor: "pointer" 
                              }}
                            >
                              {m.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button 
                              onClick={() => handleEdit(m)}
                              style={{ padding: "6px 10px", background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11, cursor: "pointer" }}
                            >
                              Edit
                            </button>
                          </div>

                          <button 
                            onClick={() => handleDelete(m._id)}
                            style={{ padding: 6, background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>

            {/* Right Column: Dynamic Mobile UI Realtime Preview */}
            <div style={{ position: "sticky", top: 24 }}>
              <div style={{ ...formStyles.card, padding: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                  <Smartphone size={16} />
                  Live Mobile UI Preview
                </h4>

                {/* Smartphone shell mock */}
                <div style={{ width: "100%", height: 530, borderRadius: 28, background: "#020617", border: "8px solid #1e293b", position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                  
                  {/* Home screen mock background content */}
                  <div style={{ padding: 12, opacity: 0.25, userSelect: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ width: 120, height: 14, background: "#475569", borderRadius: 4 }} />
                      <div style={{ width: 24, height: 24, background: "#475569", borderRadius: 12 }} />
                    </div>
                    <div style={{ width: "100%", height: 38, background: "#1e293b", borderRadius: 8, marginBottom: 16 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                      {[0,1,2,3].map(i => <div key={i} style={{ height: 40, background: "#1e293b", borderRadius: 6 }} />)}
                    </div>
                    <div style={{ width: "100%", height: 80, background: "#1e293b", borderRadius: 10 }} />
                  </div>

                  {/* Modal Backdrop overlay overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", padding: 16, zIndex: 10 }}>
                    
                    {/* Close modal X button mock */}
                    <div style={{ position: "absolute", top: 28, right: 28, width: 24, height: 24, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✕</div>

                    {/* Pop-up Card */}
                    <div style={{ 
                      width: "100%", 
                      background: form.backgroundColor, 
                      borderRadius: 20, 
                      padding: 16, 
                      display: "flex", 
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.12)"
                    }}>
                      
                      {/* Decorative Introducer */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255, 255, 255, 0.7)", fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.5 }}>
                        <span>✦</span>
                        <span>INTRODUCING</span>
                        <span>✦</span>
                      </div>

                      {/* Header Title */}
                      <h4 style={{ fontSize: 18, fontWeight: 900, color: form.textColor, textTransform: "uppercase", letterSpacing: -0.5, textAlign: "center", margin: 0 }}>
                        {form.title || "SPECIAL DEALS"}
                      </h4>

                      {/* Starting Price Banner */}
                      {form.type === "deal" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ef4444", padding: "4px 10px", borderRadius: 6, color: "#fff", fontSize: 9, fontWeight: 800 }}>
                          <span>STARTING AT</span>
                          <span style={{ background: "#fff", color: "#ef4444", padding: "1px 4px", borderRadius: 3, fontSize: 10, fontWeight: 900 }}>
                            ₹{form.dealStartingPrice}
                          </span>
                        </div>
                      )}

                      {/* Main Banner Image */}
                      <div style={{ width: "100%", height: 110, borderRadius: 12, background: "rgba(0,0,0,0.2)", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {form.imageUrl ? (
                          <img src={form.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <ImageIcon size={28} style={{ color: "rgba(255,255,255,0.3)" }} />
                        )}
                      </div>

                      {/* Showcase Showcase Products row if deal type */}
                      {form.type === "deal" && (
                        <div style={{ display: "flex", gap: 6, width: "100%", justifyContent: "center" }}>
                          {form.dealProducts.length === 0 ? (
                            [0, 1, 2].map(i => (
                              <div key={i} style={{ flex: 1, height: 75, background: "rgba(255,255,255,0.06)", borderRadius: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)" }}>Deal {i+1}</span>
                              </div>
                            ))
                          ) : (
                            form.dealProducts.map((prodId, idx) => {
                              const p = products.find(p => p._id === prodId);
                              if (!p) return null;
                              return (
                                <div key={prodId} style={{ flex: 1, background: "#ffffff", borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
                                  <img src={p.image || "/placeholder.png"} style={{ width: 34, height: 34, objectFit: "contain" }} />
                                  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                                    <span style={{ fontSize: 9, fontWeight: 900, color: "#111827" }}>₹{p.discountPrice || p.price}</span>
                                    <span style={{ fontSize: 7, color: "#9ca3af", textDecoration: "line-through" }}>₹{p.price}</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* Action Pill Button */}
                      <button style={{ width: "100%", padding: "10px", background: "#ffffff", border: "none", borderRadius: 30, color: form.backgroundColor, fontWeight: 800, fontSize: 12, cursor: "pointer", transition: "transform 0.1s" }}>
                        {form.primaryBtnText || "Explore Offer"}
                      </button>

                      {/* Sub description text */}
                      {form.description && (
                        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", textAlign: "center", fontStyle: "italic" }}>
                          {form.description}
                        </span>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
