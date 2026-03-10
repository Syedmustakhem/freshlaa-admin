import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";

const API = "https://api.freshlaa.com/api";

const getToken = () => localStorage.getItem("adminToken") || "";

/* ───────── PRODUCT SELECTOR ───────── */

function ProductSelector({ products = [], selectedProduct, onSelect }) {
  if (!Array.isArray(products)) products = [];

  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--gray-700)",
          marginBottom: 8,
        }}
      >
        Select Campaign Product
      </label>

      <div
        style={{
          maxHeight: 260,
          overflowY: "auto",
          border: "1px solid var(--gray-200)",
          borderRadius: "var(--border-radius)",
          padding: 8,
        }}
      >
        {products.length === 0 ? (
          <p
            style={{
              color: "var(--gray-500)",
              fontSize: 13,
              textAlign: "center",
              padding: 20,
            }}
          >
            No products available
          </p>
        ) : (
          products.map((p) => {
            const selected = selectedProduct === p._id;

            return (
              <div
                key={p._id}
                onClick={() => onSelect(p._id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: "var(--border-radius-sm)",
                  cursor: "pointer",
                  marginBottom: 4,
                  background: selected ? "var(--success-50)" : "#fff",
                  border: `1px solid ${
                    selected ? "var(--success-500)" : "var(--gray-200)"
                  }`,
                }}
              >
                <img
                  src={p?.images?.[0] || "/placeholder.png"}
                  alt={p?.name || "product"}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 6,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--gray-900)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p?.name || "Unnamed"}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--gray-500)",
                    }}
                  >
                    ₹{p?.variants?.[0]?.price || 0} · {p?.category || "General"}
                  </div>
                </div>

                {selected && (
                  <span
                    style={{
                      color: "var(--success-600)",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ───────── MAIN PAGE ───────── */

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "CART",
    discountType: "UNLOCK_PRODUCT",
    minCartValue: 0,
    campaignProduct: "",
    campaignPrice: 0,
    startDate: "",
    endDate: "",
  });

  /* ───────── FETCH DATA ───────── */

  useEffect(() => {
    const load = async () => {
      try {
        const [campRes, prodRes] = await Promise.all([
          fetch(`${API}/admin/campaign`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          fetch(`${API}/products?limit=200`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);

        const campData = await campRes.json();
        const prodData = await prodRes.json();

        setCampaigns(campData?.campaigns || []);

        const list =
          prodData?.products ||
          prodData?.data ||
          (Array.isArray(prodData) ? prodData : []);

        setProducts(list);
      } catch (err) {
        console.error("API error", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ───────── CREATE CAMPAIGN ───────── */

  const createCampaign = async () => {
    if (!form.name) return alert("Campaign name required");
    if (!form.startDate || !form.endDate)
      return alert("Start & End date required");

    setSaving(true);

    try {
      const res = await fetch(`${API}/admin/campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...form,
          minCartValue: Number(form.minCartValue),
          campaignPrice: Number(form.campaignPrice),
          campaignProduct: form.campaignProduct || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Campaign Created");

      setCampaigns((prev) => [...prev, data.campaign]);

      setForm({
        name: "",
        type: "CART",
        discountType: "UNLOCK_PRODUCT",
        minCartValue: 0,
        campaignProduct: "",
        campaignPrice: 0,
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      alert(err.message || "Failed to create campaign");
    }

    setSaving(false);
  };

  return (
    <AdminLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h3 className="page-heading">Campaign Manager</h3>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "420px 1fr",
            gap: 24,
          }}
        >
          {/* CREATE CAMPAIGN */}

          <motion.div className="dashboard-card">
            <h5 className="card-title">Create Campaign</h5>

            <input
              placeholder="Campaign Name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              style={input}
            />

            <select
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, type: e.target.value }))
              }
              style={input}
            >
              <option value="CART">Cart Campaign</option>
              <option value="PRODUCT">Product Campaign</option>
              <option value="CATEGORY">Category Campaign</option>
              <option value="GLOBAL">Global Campaign</option>
              <option value="CART_PROGRESS">Cart Progress</option>
            </select>

            <input
              type="number"
              placeholder="Minimum Cart Value"
              value={form.minCartValue}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  minCartValue: Number(e.target.value),
                }))
              }
              style={input}
            />

            <select
              value={form.discountType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  discountType: e.target.value,
                }))
              }
              style={input}
            >
              <option value="UNLOCK_PRODUCT">Unlock Product</option>
              <option value="PERCENT">Percent Discount</option>
              <option value="FLAT">Flat Discount</option>
              <option value="FREE_DELIVERY">Free Delivery</option>
            </select>

            <ProductSelector
              products={products}
              selectedProduct={form.campaignProduct}
              onSelect={(id) =>
                setForm((prev) => ({ ...prev, campaignProduct: id }))
              }
            />

            <input
              type="number"
              placeholder="Campaign Price"
              value={form.campaignPrice}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  campaignPrice: Number(e.target.value),
                }))
              }
              style={input}
            />

            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, startDate: e.target.value }))
              }
              style={input}
            />

            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, endDate: e.target.value }))
              }
              style={input}
            />

            <button
              className="btn btn-primary"
              onClick={createCampaign}
              disabled={saving}
              style={{ width: "100%" }}
            >
              {saving ? "Creating..." : "Create Campaign"}
            </button>
          </motion.div>

          {/* CAMPAIGN LIST */}

          <motion.div className="dashboard-card">
            <h5 className="card-title">Campaign List</h5>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Cart Value</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {campaigns?.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>₹{c.minCartValue}</td>
                    <td>
                      <span
                        className={`section-status ${
                          c.isActive ? "active" : "disabled"
                        }`}
                      >
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}

/* INPUT STYLE */

const input = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--gray-200)",
  borderRadius: "var(--border-radius-sm)",
  fontSize: 14,
  marginBottom: 14,
};