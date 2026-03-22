// pages/rider/RiderProfile.jsx
import { useState } from "react";
import RiderLayout from "../../components/RiderLayout";

export default function RiderProfile() {
  const rider = JSON.parse(localStorage.getItem("rider") || "{}");

  return (
    <RiderLayout>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "#1a1f2e" }}>👤 My Profile</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Your account details</p>
      </div>

      {/* Profile card */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24, marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff7ed", border: "3px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#f97316", flexShrink: 0 }}>
          {rider?.name?.[0]?.toUpperCase() || "R"}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1f2e" }}>{rider?.name || "Rider"}</div>
          <div style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>{rider?.email}</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>{rider?.phone}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: rider?.isOnline ? "#f0fdf4" : "#f3f4f6", color: rider?.isOnline ? "#15803d" : "#6b7280", border: rider?.isOnline ? "1px solid #bbf7d0" : "1px solid #e5e7eb" }}>
              {rider?.isOnline ? "🟢 Online" : "⚫ Offline"}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#eef2ff", color: "#6366f1", border: "1px solid #c7d2fe" }}>
              ⭐ {(rider?.stats?.rating || 5).toFixed(1)} Rating
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Total Deliveries",  value: rider?.stats?.totalDeliveries  || 0, icon: "📦" },
          { label: "Today's Deliveries",value: rider?.stats?.todayDeliveries  || 0, icon: "🛵" },
          { label: "Total Earned",      value: `₹${rider?.earnings?.total || 0}`,    icon: "💰" },
          { label: "This Month",        value: `₹${rider?.earnings?.month || 0}`,    icon: "📅" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "14px 16px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1f2e" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div style={{ background: "#f0f9ff", borderRadius: 12, border: "1px solid #bae6fd", padding: 14 }}>
        <p style={{ fontSize: 13, color: "#0369a1", margin: 0, lineHeight: 1.6 }}>
          ℹ️ To update your profile details, contact your Freshlaa admin. Your earnings are calculated at ₹30 per successful delivery.
        </p>
      </div>
    </RiderLayout>
  );
}