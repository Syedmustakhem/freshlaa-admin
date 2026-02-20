import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [editingId, setEditingId] = useState(null);

  const fetchCoupons = async () => {
    const res = await api.get("/admin/coupons");
    setCoupons(res.data.data);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  function initialForm() {
    return {
      code: "",
      discountType: "FLAT",
      discountValue: "",
      minOrderAmount: "",
      maxDiscount: "",
      usageLimit: "",
      expiryDate: "",
      isActive: true,
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await api.put(`/admin/coupons/${editingId}`, form);
    } else {
      await api.post("/admin/coupons", form);
    }

    setForm(initialForm());
    setEditingId(null);
    fetchCoupons();
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      ...coupon,
      expiryDate: coupon.expiryDate?.slice(0, 10),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    await api.delete(`/admin/coupons/${id}`);
    fetchCoupons();
  };

  const toggleStatus = async (id) => {
    await api.patch(`/admin/coupons/${id}/status`);
    fetchCoupons();
  };

  return (
    <AdminLayout>
      <h3 className="page-heading">Coupons</h3>

      {/* CREATE / EDIT FORM */}
      <div className="dashboard-card">
        <h5>{editingId ? "Edit Coupon" : "Create Coupon"}</h5>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-2">
            <input
              className="form-control"
              placeholder="Code"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={form.discountType}
              onChange={(e) =>
                setForm({ ...form, discountType: e.target.value })
              }
            >
              <option value="FLAT">Flat</option>
              <option value="PERCENT">Percent</option>
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Discount"
              value={form.discountValue}
              onChange={(e) =>
                setForm({ ...form, discountValue: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Min Order"
              value={form.minOrderAmount}
              onChange={(e) =>
                setForm({ ...form, minOrderAmount: e.target.value })
              }
            />
          </div>

          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Usage Limit"
              value={form.usageLimit}
              onChange={(e) =>
                setForm({ ...form, usageLimit: e.target.value })
              }
            />
          </div>

          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              value={form.expiryDate}
              onChange={(e) =>
                setForm({ ...form, expiryDate: e.target.value })
              }
              required
            />
          </div>

          <div className="col-12">
            <button className="btn btn-primary">
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>

      {/* COUPON TABLE */}
      <div className="dashboard-card">
        <h5>All Coupons</h5>

        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Used</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <motion.tr
                  key={c._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td>{c.code}</td>
                  <td>{c.discountType}</td>
                  <td>{c.discountValue}</td>
                  <td>₹{c.minOrderAmount}</td>
                  <td>
                    {c.usedCount} /{" "}
                    {c.usageLimit === 0
                      ? "∞"
                      : c.usageLimit}
                  </td>
                  <td>
                    {new Date(c.expiryDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        c.isActive ? "delivered" : "cancelled"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(c)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => toggleStatus(c._id)}
                    >
                      Toggle
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(c._id)}
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}