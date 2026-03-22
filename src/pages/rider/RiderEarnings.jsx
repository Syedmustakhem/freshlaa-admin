// pages/rider/RiderEarnings.jsx
import { useEffect, useState } from "react";
import RiderLayout from "../../components/RiderLayout";
import api from "../../services/api";

export default function RiderEarnings() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const riderToken = localStorage.getItem("riderToken");

  useEffect(() => {
    api.get("/rider/earnings", { headers: { Authorization: `Bearer ${riderToken}` } })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const formatTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <RiderLayout>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "#1a1f2e" }}>💰 Earnings</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Your delivery income summary</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div> Loading earnings…
        </div>
      ) : (
        <>
          {/* Earnings cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Today",       value: data?.earnings?.today  || 0, icon: "☀️",  color: "#f97316", bg: "#fff7ed" },
              { label: "This Week",   value: data?.earnings?.week   || 0, icon: "📅",  color: "#6366f1", bg: "#eef2ff" },
              { label: "This Month",  value: data?.earnings?.month  || 0, icon: "🗓️",  color: "#0ea5e9", bg: "#e0f2fe" },
              { label: "Total",       value: data?.earnings?.total  || 0, icon: "💎",  color: "#22c55e", bg: "#f0fdf4" },
            ].map((card) => (
              <div key={card.label} style={{ background: card.bg, borderRadius: 14, padding: "16px", border: `1px solid ${card.color}30` }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: card.color, letterSpacing: -1 }}>₹{card.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: card.color, opacity: 0.8 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total Deliveries", value: data?.stats?.totalDeliveries || 0, icon: "📦" },
              { label: "Today's Deliveries", value: data?.stats?.todayDeliveries || 0, icon: "🛵" },
              { label: "Rating", value: `${(data?.stats?.rating || 5).toFixed(1)} ⭐`, icon: "🌟" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb", textAlign: "center" }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1f2e" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent deliveries */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1f2e" }}>Recent Deliveries</h4>
            </div>
            {data?.recent?.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                No deliveries yet
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["Date", "Time", "Order Amount", "Your Earning"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recent || []).map((d, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 14px", color: "#374151", fontWeight: 500 }}>{formatDate(d.deliveredAt)}</td>
                      <td style={{ padding: "12px 14px", color: "#6b7280" }}>{formatTime(d.deliveredAt)}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>₹{d.amount?.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: "#f0fdf4", color: "#15803d", fontWeight: 700, padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>
                          +₹{d.earning}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </RiderLayout>
  );
}