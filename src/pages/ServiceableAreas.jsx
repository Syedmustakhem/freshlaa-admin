import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import { MapPin, Plus, Trash2, CheckCircle, XCircle, Search, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
  UI COMPONENTS (Native Admin Pattern)
═══════════════════════════════════════════════════════════════ */
const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: .5, marginBottom: 5 }}>
    {children}
  </div>
);

const Input = ({ style, ...props }) => (
  <input style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f9fafb", ...style }} {...props} />
);

const Textarea = ({ style, ...props }) => (
  <textarea style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", background: "#f9fafb", ...style }} {...props} />
);

const Card = ({ title, icon, children, style }) => (
  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24, flex: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.02)", ...style }}>
    {title && (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ padding: 8, background: "#f0fdf4", borderRadius: 8, color: "#16a34a" }}>{icon}</div>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>{title}</div>
      </div>
    )}
    {children}
  </div>
);

const Modal = ({ title, onClose, onSave, saveLabel = "Confirm", saveDisabled, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 450, overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>{title}</div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: "#94a3b8", cursor: "pointer" }}>×</button>
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
      <div style={{ padding: "16px 24px", background: "#f8fafc", display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#64748b" }}>Cancel</button>
        <button onClick={onSave} disabled={saveDisabled} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{saveLabel}</button>
      </div>
    </div>
  </div>
);

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

/* ═══════════════════════════════════════════════════════════════
  MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ServiceableAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deletePincode, setDeletePincode] = useState(null);
  const [toast, setToast] = useState(null);

  const [newArea, setNewArea] = useState({
    pincode: "",
    areaName: "",
    isActive: true,
    notes: ""
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAreas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/serviceability/admin/all", { headers: authHeader() });
      setAreas(res.data.areas || []);
    } catch (err) {
      showToast("Unauthorized or failed to load areas", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newArea.pincode) return showToast("Pincode is missing", "error");

    try {
      setSaving(true);
      const res = await api.post("/serviceability/admin/save", newArea, { headers: authHeader() });
      if (res.data.success) {
        showToast(`Area ${newArea.pincode} successfully updated!`);
        setNewArea({ pincode: "", areaName: "", isActive: true, notes: "" });
        fetchAreas();
      }
    } catch (err) {
      showToast("Failed to save area", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (area) => {
    try {
      const res = await api.post("/serviceability/admin/save", 
        { ...area, isActive: !area.isActive }, 
        { headers: authHeader() }
      );
      if (res.data.success) {
        showToast("Service status updated");
        fetchAreas();
      }
    } catch (err) {
      showToast("Toggle failed", "error");
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/serviceability/admin/${deletePincode}`, { headers: authHeader() });
      if (res.data.success) {
        showToast("Pincode removed successfully");
        setDeletePincode(null);
        fetchAreas();
      }
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const filtered = areas.filter(a => 
    a.pincode.includes(search) || 
    (a.areaName && a.areaName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div style={{ padding: "20px 30px" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#0f172a", letterSpacing: "-1px" }}>Delivery Pincodes</h1>
            <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 14 }}>Manage active and restricted service areas across FreshLaa</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: 12, color: "#94a3b8" }}><Search size={16} /></span>
              <input 
                placeholder="Find pincode..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "10px 14px 10px 36px", borderRadius: 10, border: "1px solid #e2e8f0", outline: "none", fontSize: 13, width: 220 }}
              />
            </div>
            <button onClick={fetchAreas} style={{ padding: 10, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#64748b" }}>
              <RefreshCw size={18} className={loading ? "spin-anim" : ""} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
          {/* ADD ZONE */}
          <div style={{ width: 340 }}>
            <Card title="Add Service Zone" icon={<MapPin size={20} />}>
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <Label>Pincode *</Label>
                  <Input 
                    value={newArea.pincode} 
                    onChange={e => setNewArea({ ...newArea, pincode: e.target.value })} 
                    placeholder="e.g. 515591"
                  />
                </div>
                <div>
                  <Label>Area Title</Label>
                  <Input 
                    value={newArea.areaName} 
                    onChange={e => setNewArea({ ...newArea, areaName: e.target.value })} 
                    placeholder="e.g. Whitefield"
                  />
                </div>
                <div>
                  <Label>Delivery Notes</Label>
                  <Textarea 
                    value={newArea.notes} 
                    onChange={e => setNewArea({ ...newArea, notes: e.target.value })} 
                    placeholder="Shift timings, gates, etc..."
                    style={{ height: 100 }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
                  <button 
                    type="button" 
                    onClick={() => setNewArea({ ...newArea, isActive: !newArea.isActive })}
                    style={{ width: 44, height: 22, borderRadius: 11, background: newArea.isActive ? "#16a34a" : "#cbd5e1", position: "relative", border: "none", cursor: "pointer", transition: "all .3s" }}
                  >
                    <div style={{ position: "absolute", top: 2, left: newArea.isActive ? 24 : 2, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "all .3s" }} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#334155" }}>Service Enabled</span>
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{ marginTop: 10, height: 48, borderRadius: 12, border: "none", background: "#16a34a", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}
                >
                  {saving ? "Saving..." : "Add to Live List"}
                </button>
              </form>
            </Card>
          </div>

          {/* ZONE LIST */}
          <div style={{ flex: 1 }}>
            <Card>
              {loading ? (
                <div style={{ padding: "60px 0", textAlign: "center", color: "#94a3b8" }}>
                  <Loader2 size={32} style={{ marginBottom: 15, animation: "spin 1s linear infinite" }} />
                  <div style={{ fontSize: 13, fontWeight: 700 }}>VERIFYING CLOUD DATA...</div>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📍</div>
                  <div style={{ fontWeight: 800, color: "#1e293b" }}>No active areas found</div>
                  <p style={{ color: "#64748b", fontSize: 13 }}>Expand your service by adding pincodes on the left</p>
                </div>
              ) : (
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                        <th style={{ textAlign: "left", padding: "12px 15px", fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Pincode</th>
                        <th style={{ textAlign: "left", padding: "12px 15px", fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Location</th>
                        <th style={{ textAlign: "center", padding: "12px 15px", fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Status</th>
                        <th style={{ textAlign: "right", padding: "12px 15px", fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a.pincode} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "18px 15px", fontWeight: 900, fontSize: 15, color: "#0f172a" }}>{a.pincode}</td>
                          <td style={{ padding: "18px 15px" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#334155" }}>{a.areaName || "Not Specified"}</div>
                            {a.notes && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{a.notes}</div>}
                          </td>
                          <td style={{ padding: "18px 15px", textAlign: "center" }}>
                            <div 
                              onClick={() => toggleStatus(a)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: a.isActive ? "#dcfce7" : "#fee2e2", color: a.isActive ? "#16a34a" : "#dc2626", cursor: "pointer", fontWeight: 800, fontSize: 10 }}
                            >
                              {a.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {a.isActive ? "SERVICEABLE" : "RESTRICTED"}
                            </div>
                          </td>
                          <td style={{ padding: "18px 15px", textAlign: "right" }}>
                            <button 
                              onClick={() => setDeletePincode(a.pincode)}
                              style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", padding: 5 }}
                              onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                              onMouseLeave={e => e.currentTarget.style.color = "#cbd5e1"}
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* TOAST PANEL */}
        {toast && (
          <div style={{ 
            position: "fixed", bottom: 30, right: 30, background: toast.type === "success" ? "#16a34a" : "#dc2626", color: "#fff", 
            padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            zIndex: 9999, display: "flex", alignItems: "center", gap: 10
          }}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.msg}
          </div>
        )}

        {/* DELETE MODAL */}
        {deletePincode && (
          <Modal title="Confirm Removal" onClose={() => setDeletePincode(null)} onSave={confirmDelete} saveLabel="Remove Area">
            <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
              Are you sure you want to remove <strong style={{color: "#1e293b"}}>{deletePincode}</strong>? Customers in this area will no longer be able to place orders.
            </p>
          </Modal>
        )}

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-anim { animation: spin 2s linear infinite; }
      `}</style>
    </AdminLayout>
  );
}
