import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const STATUS_META = {
  Placed:         { color: "#6366f1", bg: "#eef2ff", label: "Placed" },
  Packed:         { color: "#f59e0b", bg: "#fffbeb", label: "Packed" },
  OutForDelivery: { color: "#0ea5e9", bg: "#e0f2fe", label: "Out for Delivery" },
  Delivered:      { color: "#22c55e", bg: "#f0fdf4", label: "Delivered" },
  Cancelled:      { color: "#ef4444", bg: "#fef2f2", label: "Cancelled" },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: "#6b7280", bg: "#f3f4f6", label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, display: "inline-block" }} />
      {meta.label}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
    <span style={{ color: "#6b7280", fontSize: 13 }}>{label}</span>
    <span style={{ fontWeight: 600, color: "#111827", fontSize: 13, textAlign: "right", maxWidth: "60%" }}>{value}</span>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [downloading, setDownloading] = useState(false);

  /* ── Load ── */
  useEffect(() => {
    api.get("/admin/orders")
      .then(res => {
        const o = res.data.data.find(x => x._id === id);
        setOrder(o || null);
      });
  }, [id]);

  /* ── PDF ── */
  const downloadInvoice = async () => {
    setDownloading(true);
    try {
      const input = document.getElementById("invoice-print");
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`invoice-${order._id}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  /* ── Loading ── */
  if (!order) return (
    <AdminLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 36 }}>📦</div>
        <p style={{ color: "#6b7280", margin: 0 }}>Loading order details…</p>
      </div>
    </AdminLayout>
  );

  const subtotal = order.items.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const addonTotal = order.items.reduce((sum, i) =>
    sum + (i.selectedAddons?.reduce((a, ad) => a + (ad.price || 0), 0) || 0), 0);

  /* ─────────── UI ─────────── */
  return (
    <AdminLayout>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
              background: "#fff", cursor: "pointer", fontSize: 13, color: "#374151",
            }}
          >
            ← Back
          </button>
          <div>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>Order Details</h3>
            <p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: 12, fontFamily: "monospace" }}>
              #{order._id}
            </p>
          </div>
        </div>

        <button
          onClick={downloadInvoice}
          disabled={downloading}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 10,
            background: downloading ? "#d1d5db" : "#6366f1",
            color: "#fff", border: "none", cursor: downloading ? "not-allowed" : "pointer",
            fontWeight: 600, fontSize: 14, boxShadow: "0 2px 8px rgba(99,102,241,.3)",
            transition: "all .2s",
          }}
        >
          {downloading ? "⏳ Generating…" : "⬇ Download Invoice PDF"}
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { icon: "🛒", label: "Total Items", value: order.items.length },
          { icon: "💰", label: "Grand Total", value: `₹${order.total?.toLocaleString("en-IN")}` },
          { icon: "💳", label: "Payment", value: order.paymentMethod || "—" },
          { icon: "📍", label: "Status", value: <StatusBadge status={order.status} /> },
        ].map(c => (
          <div key={c.label} style={{
            background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb",
            padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,.05)",
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 2 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Customer */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
          <h5 style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
            👤 Customer
          </h5>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", background: "#6366f1",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 18,
            }}>
              {(order.user?.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#111827" }}>{order.user?.name || "—"}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{order.user?.phone || "—"}</div>
            </div>
          </div>
          <InfoRow label="Date" value={new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} />
          <InfoRow label="Payment" value={order.paymentMethod || "—"} />
        </div>

        {/* Address */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
          <h5 style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
            📍 Delivery Address
          </h5>
          <div style={{
            background: "#f9fafb", borderRadius: 8, padding: 12, fontSize: 13,
            color: "#374151", lineHeight: 1.7, border: "1px solid #e5e7eb",
          }}>
            {order.address?.house && <div><strong>House:</strong> {order.address.house}</div>}
            {order.address?.area  && <div><strong>Area:</strong> {order.address.area}</div>}
            {order.address?.city  && <div><strong>City:</strong> {order.address.city}</div>}
            {order.address?.pincode && <div><strong>PIN:</strong> {order.address.pincode}</div>}
            {!order.address && <span style={{ color: "#9ca3af" }}>No address on record</span>}
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 18, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}>
        <h5 style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 14, color: "#374151" }}>🛍 Products</h5>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, padding: 12,
              background: "#f9fafb", borderRadius: 10, border: "1px solid #f3f4f6",
              alignItems: "flex-start",
            }}>
              <img
                src={item.image || "/logo.png"} alt={item.name}
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{item.name}</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#6b7280" }}>
                  <span>Qty: <strong style={{ color: "#374151" }}>{item.qty}</strong></span>
                  <span>Price: <strong style={{ color: "#374151" }}>₹{item.price}</strong></span>
                  {item.variant?.label && <span>Variant: <strong style={{ color: "#6366f1" }}>{item.variant.label}</strong></span>}
                </div>
                {item.selectedAddons?.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {item.selectedAddons.map((a, j) => (
                      <span key={j} style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 20,
                        background: "#e0f2fe", color: "#0369a1", fontWeight: 500,
                      }}>
                        {a.name} +₹{a.price}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 15, whiteSpace: "nowrap" }}>
                ₹{(item.qty * item.price).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div style={{ marginTop: 16, borderTop: "2px solid #f3f4f6", paddingTop: 14 }}>
          <div style={{ maxWidth: 320, marginLeft: "auto" }}>
            <InfoRow label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
            {addonTotal > 0 && <InfoRow label="Add-ons" value={`₹${addonTotal.toLocaleString("en-IN")}`} />}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#6366f1" }}>
                ₹{order.total?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────
          HIDDEN INVOICE (for PDF export)
      ─────────────────────────────────────── */}
      <div style={{ position: "absolute", left: -9999, top: 0 }}>
        <div id="invoice-print" style={{
          width: 794, background: "#fff", fontFamily: "'Segoe UI', sans-serif",
          fontSize: 13, color: "#1a1a2e", overflow: "hidden",
        }}>

          {/* ── TOP HEADER BAND ── */}
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
            padding: "36px 40px 28px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* decorative circles */}
            <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.04)", top: -60, right: -40 }} />
            <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.06)", top: 20, right: 80 }} />
            <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.05)", bottom: -20, left: 200 }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
              {/* Brand */}
              <div>
                <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>
                  🌿 Freshlaa
                </div>
                <div style={{ color: "#a5b4fc", fontSize: 12, marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>
                  Fresh Grocery Delivery
                </div>
              </div>

              {/* Invoice label */}
              <div style={{ textAlign: "right" }}>
                <div style={{
                  display: "inline-block", background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.25)",
                  borderRadius: 8, padding: "4px 16px", marginBottom: 8,
                }}>
                  <span style={{ color: "#e0e7ff", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Invoice</span>
                </div>
                <div style={{ color: "#c7d2fe", fontSize: 12, fontFamily: "monospace" }}>#{order._id.slice(-10).toUpperCase()}</div>
                <div style={{ color: "#a5b4fc", fontSize: 11, marginTop: 2 }}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
              </div>
            </div>

            {/* Status pill inside header */}
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              {[
                { label: "Payment", value: order.paymentMethod || "—" },
                { label: "Status", value: STATUS_META[order.status]?.label || order.status },
                { label: "Items", value: `${order.items.length} item${order.items.length !== 1 ? "s" : ""}` },
              ].map(tag => (
                <div key={tag.label} style={{
                  background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)",
                  borderRadius: 20, padding: "4px 14px", fontSize: 11,
                }}>
                  <span style={{ color: "#a5b4fc" }}>{tag.label}: </span>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{tag.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── CUSTOMER & ADDRESS STRIP ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            background: "#f8faff", borderBottom: "2px solid #e0e7ff",
          }}>
            {[
              {
                icon: "👤", title: "Bill To",
                lines: [
                  { text: order.user?.name || "—", bold: true, size: 14 },
                  { text: order.user?.phone || "—", color: "#6b7280" },
                  { text: order.user?.email || "", color: "#9ca3af", small: true },
                ],
              },
              {
                icon: "📍", title: "Deliver To",
                lines: [
                  { text: order.address?.house || "", bold: true },
                  { text: [order.address?.area, order.address?.city].filter(Boolean).join(", "), color: "#6b7280" },
                  { text: order.address?.pincode ? `PIN: ${order.address.pincode}` : "", color: "#9ca3af", small: true },
                ],
              },
              {
                icon: "📋", title: "Order Info",
                lines: [
                  { text: `#${order._id.slice(-8).toUpperCase()}`, bold: true, mono: true },
                  { text: new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }), color: "#6b7280", small: true },
                  { text: `via ${order.paymentMethod || "—"}`, color: "#9ca3af", small: true },
                ],
              },
            ].map((col, ci) => (
              <div key={ci} style={{
                padding: "20px 22px",
                borderRight: ci < 2 ? "1px solid #e0e7ff" : "none",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#6366f1", marginBottom: 8 }}>
                  {col.icon} {col.title}
                </div>
                {col.lines.filter(l => l.text).map((l, li) => (
                  <div key={li} style={{
                    fontWeight: l.bold ? 700 : 400,
                    fontSize: l.size || (l.small ? 11 : 13),
                    color: l.color || "#1a1a2e",
                    fontFamily: l.mono ? "monospace" : "inherit",
                    lineHeight: 1.5,
                  }}>{l.text}</div>
                ))}
              </div>
            ))}
          </div>

          {/* ── ITEMS TABLE ── */}
          <div style={{ padding: "0 0 24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f1f5ff" }}>
                  <th style={{ padding: "12px 22px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6366f1", borderBottom: "2px solid #c7d2fe" }}>#</th>
                  <th style={{ padding: "12px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6366f1", borderBottom: "2px solid #c7d2fe" }}>Item</th>
                  <th style={{ padding: "12px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6366f1", borderBottom: "2px solid #c7d2fe" }}>Variant / Add-ons</th>
                  <th style={{ padding: "12px 12px", textAlign: "center", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6366f1", borderBottom: "2px solid #c7d2fe" }}>Qty</th>
                  <th style={{ padding: "12px 12px", textAlign: "right", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6366f1", borderBottom: "2px solid #c7d2fe" }}>Unit Price</th>
                  <th style={{ padding: "12px 22px", textAlign: "right", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6366f1", borderBottom: "2px solid #c7d2fe" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f0f8" }}>
                    <td style={{ padding: "14px 22px", color: "#9ca3af", fontSize: 12 }}>{i + 1}</td>
                    <td style={{ padding: "14px 12px" }}>
                      <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 13 }}>{item.name}</div>
                    </td>
                    <td style={{ padding: "14px 12px", color: "#6b7280", fontSize: 11 }}>
                      {item.variant?.label ? (
                        <span style={{ background: "#eef2ff", color: "#6366f1", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{item.variant.label}</span>
                      ) : "—"}
                      {item.selectedAddons?.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          {item.selectedAddons.map((a, j) => (
                            <span key={j} style={{ background: "#e0f2fe", color: "#0369a1", padding: "1px 6px", borderRadius: 20, fontSize: 10, marginRight: 3 }}>
                              {a.name} +₹{a.price}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 12px", textAlign: "center", fontWeight: 600, color: "#374151" }}>{item.qty}</td>
                    <td style={{ padding: "14px 12px", textAlign: "right", color: "#374151" }}>₹{item.price}</td>
                    <td style={{ padding: "14px 22px", textAlign: "right", fontWeight: 800, color: "#1a1a2e", fontSize: 14 }}>
                      ₹{(item.qty * item.price).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── TOTALS + THANK YOU ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 22px 32px" }}>

            {/* Thank you note */}
            <div style={{
              maxWidth: 300, background: "#f8faff", borderRadius: 12,
              border: "1px solid #e0e7ff", padding: "14px 18px",
            }}>
              <div style={{ fontWeight: 700, color: "#4338ca", fontSize: 13, marginBottom: 4 }}>Thank you for your order! 🌿</div>
              <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.6 }}>
                For support, reach us at<br />
                <span style={{ color: "#6366f1", fontWeight: 600 }}>support@freshlaa.com</span>
              </div>
            </div>

            {/* Totals box */}
            <div style={{ minWidth: 260 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280", fontSize: 13 }}>Subtotal</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {addonTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ color: "#6b7280", fontSize: 13 }}>Add-ons</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>₹{addonTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              {/* Grand total chip */}
              <div style={{
                marginTop: 10,
                background: "linear-gradient(135deg, #1e1b4b, #4338ca)",
                borderRadius: 12, padding: "14px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ color: "#c7d2fe", fontWeight: 700, fontSize: 13 }}>Grand Total</span>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>
                  ₹{order.total?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* ── FOOTER BAND ── */}
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b, #312e81)",
            padding: "14px 40px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: "#a5b4fc", fontSize: 11 }}>🌿 Freshlaa — Fresh Grocery Delivery</span>
            <span style={{ color: "#6366f1", fontSize: 11, fontFamily: "monospace" }}>
              #{order._id.slice(-10).toUpperCase()}
            </span>
            <span style={{ color: "#a5b4fc", fontSize: 11 }}>support@freshlaa.com</span>
          </div>

        </div>
      </div>

    </AdminLayout>
  );
}