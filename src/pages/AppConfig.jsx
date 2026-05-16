import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import { Save, RefreshCw, Smartphone, Monitor, ShieldAlert, Sparkles, Timer, Plus, Trash2 } from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

const fieldLabel = {
  display: "block",
  fontWeight: 700,
  fontSize: 12,
  color: "#94a3b8",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const fieldInput = {
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
};

const darkCard = {
  background: "linear-gradient(135deg, #0f1923 0%, #0a1628 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};

export default function AppConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/app-config");
      setConfig(res.data.data);
    } catch (err) {
      showToast({ message: "Failed to load app configuration", type: "error" });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/app-config", config);
      showToast({ message: "App configuration updated successfully!", type: "success" });
    } catch (err) {
      showToast({ message: "Failed to update configuration", type: "error" });
    }
    setSaving(false);
  };

  const updateField = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateSplash = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      splash: { ...prev.splash, [key]: value },
    }));
  };

  const updateDelivery = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      deliveryTiming: { ...prev.deliveryTiming, [key]: value },
    }));
  };

  const addDistanceRule = () => {
    const currentRules = config.deliveryTiming?.distanceRules || [];
    updateDelivery("distanceRules", [...currentRules, { maxKm: 5, eta: "30 mins" }]);
  };

  const removeDistanceRule = (index) => {
    const currentRules = config.deliveryTiming?.distanceRules || [];
    updateDelivery("distanceRules", currentRules.filter((_, i) => i !== index));
  };

  const updateDistanceRule = (index, key, value) => {
    const currentRules = [...(config.deliveryTiming?.distanceRules || [])];
    currentRules[index] = { ...currentRules[index], [key]: value };
    updateDelivery("distanceRules", currentRules);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <div className="spinner"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 28, color: "#f1f5f9" }}>📱 App Configuration</h2>
            <p style={{ margin: "4px 0 0", color: "#64748b" }}>Manage splash screen, versions, and maintenance mode</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-success"
            style={{ padding: "12px 24px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* SPLASH SCREEN */}
          <section style={{ ...darkCard, gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Sparkles color="#22c55e" size={24} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Splash Screen</h3>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label htmlFor="splash-type" style={fieldLabel}>Splash Type</label>
                  <select 
                    id="splash-type"
                    name="splash-type"
                    style={fieldInput} 
                    value={config.splash?.type || "image"}
                    onChange={(e) => updateSplash("type", e.target.value)}
                  >
                    <option value="image">Static Image</option>
                    <option value="lottie">Lottie Animation</option>
                  </select>
                </div>

                {config.splash?.type === "image" ? (
                  <div>
                    <label htmlFor="splash-image-url" style={fieldLabel}>Image URL</label>
                    <input 
                      id="splash-image-url"
                      name="splash-image-url"
                      style={fieldInput}
                      value={config.splash?.image_url || ""}
                      onChange={(e) => updateSplash("image_url", e.target.value)}
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="splash-lottie-url" style={fieldLabel}>Lottie URL</label>
                    <input 
                      id="splash-lottie-url"
                      name="splash-lottie-url"
                      style={fieldInput}
                      value={config.splash?.lottie_url || ""}
                      onChange={(e) => updateSplash("lottie_url", e.target.value)}
                      placeholder="https://assets.lottiefiles.com/..."
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="splash-duration" style={fieldLabel}>Duration (ms)</label>
                  <input 
                    id="splash-duration"
                    name="splash-duration"
                    type="number"
                    style={fieldInput}
                    value={config.splash?.duration_ms || 1500}
                    onChange={(e) => updateSplash("duration_ms", Number(e.target.value))}
                  />
                </div>
              </div>

              {/* PREVIEW */}
              <div style={{ 
                background: "rgba(0,0,0,0.4)", 
                borderRadius: 16, 
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                minHeight: 300
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 12, textTransform: "uppercase" }}>Live Preview</span>
                {config.splash?.type === "image" && config.splash?.image_url ? (
                  <img 
                    src={config.splash.image_url} 
                    alt="Splash" 
                    style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }} 
                  />
                ) : config.splash?.type === "lottie" ? (
                  <div style={{ textAlign: "center", color: "#64748b" }}>
                    <Monitor size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p style={{ fontSize: 12 }}>Lottie animations are previewed on the device</p>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#475569" }}>
                    <p style={{ fontSize: 12 }}>Enter a URL to preview</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* VERSIONING */}
          <section style={darkCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Smartphone color="#3b82f6" size={24} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Version Control</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label htmlFor="min-android" style={fieldLabel}>Min Android Version</label>
                <input 
                  id="min-android"
                  name="min-android"
                  style={fieldInput}
                  value={config.min_version_android || ""}
                  onChange={(e) => updateField("min_version_android", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="latest-android" style={fieldLabel}>Latest Android Version</label>
                <input 
                  id="latest-android"
                  name="latest-android"
                  style={fieldInput}
                  value={config.latest_version_android || ""}
                  onChange={(e) => updateField("latest_version_android", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="min-ios" style={fieldLabel}>Min iOS Version</label>
                <input 
                  id="min-ios"
                  name="min-ios"
                  style={fieldInput}
                  value={config.min_version_ios || ""}
                  onChange={(e) => updateField("min_version_ios", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="force-update-msg" style={fieldLabel}>Force Update Message</label>
                <textarea 
                  id="force-update-msg"
                  name="force-update-msg"
                  style={{ ...fieldInput, height: 80, resize: "none" }}
                  value={config.force_update_message || ""}
                  onChange={(e) => updateField("force_update_message", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* DELIVERY TIMING */}
          <section style={{ ...darkCard, gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Timer color="#8b5cf6" size={24} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Delivery Timing & Surge</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label htmlFor="base-eta" style={fieldLabel}>Global Base ETA</label>
                  <input 
                    id="base-eta"
                    name="base-eta"
                    style={fieldInput}
                    value={config.deliveryTiming?.baseEtaRange || ""}
                    onChange={(e) => updateDelivery("baseEtaRange", e.target.value)}
                    placeholder="e.g. 30-40 mins"
                  />
                </div>
                <div>
                  <label htmlFor="global-delay" style={fieldLabel}>Global Surge Delay (Minutes)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input 
                      id="global-delay"
                      name="global-delay"
                      type="number"
                      style={{ ...fieldInput, flex: 1 }}
                      value={config.deliveryTiming?.globalDelayMins || 0}
                      onChange={(e) => updateDelivery("globalDelayMins", Number(e.target.value))}
                    />
                    {config.deliveryTiming?.globalDelayMins > 0 && (
                      <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>⚠️ +{config.deliveryTiming.globalDelayMins}m Surge Applied</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <label style={fieldLabel}>Distance Rules (Algorithm)</label>
                  <button 
                    onClick={addDistanceRule}
                    style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Plus size={14} /> Add Rule
                  </button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(config.deliveryTiming?.distanceRules || []).map((rule, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(255,255,255,0.02)", padding: 8, borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Max Distance (km)</div>
                        <input 
                          type="number"
                          style={{ ...fieldInput, padding: "6px 10px", fontSize: 13 }}
                          value={rule.maxKm}
                          onChange={(e) => updateDistanceRule(idx, "maxKm", Number(e.target.value))}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>ETA String</div>
                        <input 
                          style={{ ...fieldInput, padding: "6px 10px", fontSize: 13 }}
                          value={rule.eta}
                          onChange={(e) => updateDistanceRule(idx, "eta", e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => removeDistanceRule(idx)}
                        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginTop: 15 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(!config.deliveryTiming?.distanceRules || config.deliveryTiming.distanceRules.length === 0) && (
                    <div style={{ textAlign: "center", padding: "20px", color: "#475569", fontSize: 13, background: "rgba(0,0,0,0.1)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.1)" }}>
                      No distance rules set. App will use Global Base ETA.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* MAINTENANCE */}
          <section style={darkCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <ShieldAlert color="#ef4444" size={24} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Maintenance</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                padding: "12px 16px",
                background: config.maintenance_mode ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.03)",
                borderRadius: 12,
                border: `1px solid ${config.maintenance_mode ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.3s"
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Maintenance Mode</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Blocks all app access</div>
                </div>
                <div 
                  onClick={() => updateField("maintenance_mode", !config.maintenance_mode)}
                  style={{
                    width: 48,
                    height: 24,
                    background: config.maintenance_mode ? "#ef4444" : "#1e293b",
                    borderRadius: 12,
                    position: "relative",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 3,
                    left: config.maintenance_mode ? 27 : 3,
                    transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
                  }} />
                </div>
              </div>

              <div>
                <label htmlFor="maintenance-msg" style={fieldLabel}>Maintenance Message</label>
                <textarea 
                  id="maintenance-msg"
                  name="maintenance-msg"
                  style={{ ...fieldInput, height: 100, resize: "none" }}
                  value={config.maintenance_message || ""}
                  onChange={(e) => updateField("maintenance_message", e.target.value)}
                />
              </div>

              {config.maintenance_mode && (
                <div style={{ 
                  padding: 12, 
                  background: "rgba(239,68,68,0.1)", 
                  borderRadius: 10, 
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "center"
                }}>
                  ⚠️ Warning: App is currently inaccessible to users.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(34,197,94,0.1);
          border-top-color: #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </AdminLayout>
  );
}
