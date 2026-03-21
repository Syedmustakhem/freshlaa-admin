import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import axios from "axios";

const API = "https://api.freshlaa.com/api/notifications";

const BANNER_TYPES = [
  { id: "rain",   icon: "🌧️", label: "Heavy Rain",    color: "#1565c0", desc: "Delivery may take a few extra minutes" },
  { id: "demand", icon: "🔥", label: "High Demand",    color: "#b71c1c", desc: "Some orders may take slightly longer" },
  { id: "offer",  icon: "🎉", label: "Free Delivery",  color: "#1b5e20", desc: "₹0 handling · ₹0 delivery · ₹0 surge" },
  { id: "custom", icon: "📢", label: "Custom Message", color: "#6a1b9a", desc: "Write your own message" },
];

export default function AppNotifications() {
  const [selected, setSelected]         = useState(null);
  const [connectedUsers, setConnected]  = useState(0);
  const [sending, setSending]           = useState(false);
  const [sent, setSent]                 = useState(false);
  const [error, setError]               = useState("");
  const [duration, setDuration]         = useState(7);

  // Custom fields
  const [customTitle,    setCustomTitle]    = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [customColor,    setCustomColor]    = useState("#6a1b9a");
  const [customIcon,     setCustomIcon]     = useState("📢");

  // Fetch connected users count on mount
  useEffect(() => {
    axios.get(`${API}/banner-status`)
      .then(r => setConnected(r.data.connectedClients ?? 0))
      .catch(() => setConnected(0));

    // Refresh every 10s
    const interval = setInterval(() => {
      axios.get(`${API}/banner-status`)
        .then(r => setConnected(r.data.connectedClients ?? 0))
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    setError("");
    setSent(false);

    try {
      const body = { type: selected, duration: duration * 1000 };

      if (selected === "custom") {
        if (!customTitle.trim()) { setError("Title is required for custom message"); setSending(false); return; }
        body.title    = customTitle.trim();
        body.subtitle = customSubtitle.trim();
        body.color    = customColor;
        body.icon     = customIcon;
      }

      await axios.post(`${API}/broadcast`, body);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send. Try again.");
    } finally {
      setSending(false);
    }
  };

  const activeType = BANNER_TYPES.find(t => t.id === selected);

  return (
    <AdminLayout>
      <div style={s.page}>

        {/* Header */}
        <div style={s.pageHeader}>
          <div>
            <h2 style={s.pageTitle}>App Notifications</h2>
            <p style={s.pageDesc}>Push live banners to all app users instantly</p>
          </div>
          <div style={s.liveChip}>
            <span style={{ ...s.dot, background: connectedUsers > 0 ? "#22c55e" : "#94a3b8" }} />
            <span style={s.liveText}>
              {connectedUsers} user{connectedUsers !== 1 ? "s" : ""} online
            </span>
          </div>
        </div>

        <div style={s.grid}>

          {/* Left — Type selector */}
          <div style={s.card}>
            <p style={s.sectionLabel}>Select banner type</p>
            <div style={s.typeGrid}>
              {BANNER_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => { setSelected(type.id); setSent(false); setError(""); }}
                  style={{
                    ...s.typeBtn,
                    borderColor: selected === type.id ? type.color : "#e2e8f0",
                    background:  selected === type.id ? type.color + "12" : "#fff",
                  }}
                >
                  <span style={s.typeIcon}>{type.icon}</span>
                  <span style={{ ...s.typeLabel, color: selected === type.id ? type.color : "#1e293b" }}>
                    {type.label}
                  </span>
                  <span style={s.typeDesc}>{type.desc}</span>
                  {selected === type.id && (
                    <span style={{ ...s.checkBadge, background: type.color }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right — Config + Send */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Custom fields */}
            {selected === "custom" && (
              <div style={s.card}>
                <p style={s.sectionLabel}>Custom message</p>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Icon (emoji)</label>
                  <input
                    style={s.input}
                    value={customIcon}
                    onChange={e => setCustomIcon(e.target.value)}
                    placeholder="📢"
                    maxLength={4}
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    style={s.input}
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="e.g. Flash sale live now!"
                    maxLength={60}
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Subtitle</label>
                  <input
                    style={s.input}
                    value={customSubtitle}
                    onChange={e => setCustomSubtitle(e.target.value)}
                    placeholder="e.g. 50% off for next 10 minutes"
                    maxLength={80}
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Banner color</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="color"
                      value={customColor}
                      onChange={e => setCustomColor(e.target.value)}
                      style={{ width: 44, height: 36, borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer", padding: 2 }}
                    />
                    <span style={{ fontSize: 13, color: "#64748b" }}>{customColor}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Duration */}
            <div style={s.card}>
              <p style={s.sectionLabel}>Display duration</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[5, 7, 10, 15, 30].map(sec => (
                  <button
                    key={sec}
                    onClick={() => setDuration(sec)}
                    style={{
                      ...s.durBtn,
                      background:   duration === sec ? "#0f172a" : "#f8fafc",
                      color:        duration === sec ? "#fff"    : "#475569",
                      borderColor:  duration === sec ? "#0f172a" : "#e2e8f0",
                    }}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {selected && (
              <div style={s.card}>
                <p style={s.sectionLabel}>Preview</p>
                <div style={{
                  ...s.preview,
                  background: selected === "custom" ? customColor : activeType?.color,
                }}>
                  <span style={{ fontSize: 20 }}>
                    {selected === "custom" ? customIcon : activeType?.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={s.prevTitle}>
                      {selected === "custom" ? (customTitle || "Your title here") : activeType?.label}
                    </div>
                    <div style={s.prevSub}>
                      {selected === "custom" ? (customSubtitle || "Your subtitle here") : activeType?.desc}
                    </div>
                  </div>
                  <div style={s.prevDur}>{duration}s</div>
                </div>
                <div style={s.previewBar}>
                  <div style={{ ...s.previewBarFill, background: selected === "custom" ? customColor : activeType?.color }} />
                </div>
              </div>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!selected || sending}
              style={{
                ...s.sendBtn,
                background: !selected || sending ? "#94a3b8" : "#0f172a",
                cursor:     !selected || sending ? "not-allowed" : "pointer",
              }}
            >
              {sending ? "Sending..." : sent ? "✓ Sent!" : `Send to ${connectedUsers} users`}
            </button>

            {sent && (
              <div style={s.successMsg}>
                ✅ Banner sent successfully to {connectedUsers} connected users
              </div>
            )}

            {error && (
              <div style={s.errorMsg}>⚠️ {error}</div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ── Styles ── */
const s = {
  page:       { padding: "24px", maxWidth: 900, margin: "0 auto" },
  pageHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 },
  pageTitle:  { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 },
  pageDesc:   { fontSize: 14, color: "#64748b", marginTop: 4 },
  liveChip:   { display: "flex", alignItems: "center", gap: 7, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 20, padding: "6px 14px" },
  dot:        { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  liveText:   { fontSize: 13, fontWeight: 600, color: "#475569" },
  grid:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  card:       { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, marginTop: 0 },
  typeGrid:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  typeBtn:    { position: "relative", border: "2px solid", borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 4 },
  typeIcon:   { fontSize: 24, lineHeight: 1 },
  typeLabel:  { fontSize: 14, fontWeight: 700 },
  typeDesc:   { fontSize: 11, color: "#94a3b8", lineHeight: 1.4 },
  checkBadge: { position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  fieldGroup: { marginBottom: 14 },
  label:      { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 },
  input:      { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box" },
  durBtn:     { padding: "7px 16px", borderRadius: 8, border: "1px solid", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" },
  preview:    { borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 },
  prevTitle:  { color: "#fff", fontWeight: 700, fontSize: 14 },
  prevSub:    { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  prevDur:    { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" },
  previewBar: { height: 3, background: "#e2e8f0", borderRadius: 2, marginTop: 10, overflow: "hidden" },
  previewBarFill: { height: "100%", width: "60%", borderRadius: 2, opacity: 0.6 },
  sendBtn:    { width: "100%", padding: "14px", borderRadius: 12, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, transition: "all 0.15s" },
  successMsg: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#166534" },
  errorMsg:   { background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#991b1b" },
};