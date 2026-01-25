import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [images, setImages] = useState(["", "", "", ""]);
  const [more, setMore] = useState("");

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      const res = await api.get("/category/admin/all");
      setCategories(res.data || []);
    } catch {
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= ADD ================= */
  const addCategory = async () => {
    if (!name.trim()) return alert("Category name required");
    if (images.some((i) => !i)) return alert("All 4 images required");

    const payload = {
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      images,
      more,
      isActive: true,
    };

    await api.post("/category", payload);
    setName("");
    setImages(["", "", "", ""]);
    setMore("");
    fetchCategories();
  };

  /* ================= TOGGLE ================= */
  const toggleStatus = async (cat) => {
    await api.put(`/category/${cat._id}`, {
      isActive: !cat.isActive,
    });
    fetchCategories();
  };

  return (
    <AdminLayout>
      <h3 className="page-heading">Categories</h3>

      {/* ADD CATEGORY */}
      <motion.div
        className="dashboard-card mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h5 className="mb-3">Add Category</h5>

        <input
          className="form-control mb-3"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="row g-3 mb-3">
          {images.map((img, i) => (
            <div className="col-md-3" key={i}>
              <input
                className="form-control"
                placeholder={`Image URL ${i + 1}`}
                value={img}
                onChange={(e) => {
                  const arr = [...images];
                  arr[i] = e.target.value;
                  setImages(arr);
                }}
              />
            </div>
          ))}
        </div>

        <input
          className="form-control mb-3"
          placeholder="More text (eg: +10 more)"
          value={more}
          onChange={(e) => setMore(e.target.value)}
        />

        <button className="btn btn-dark" onClick={addCategory}>
          Add Category
        </button>
      </motion.div>

      {/* CATEGORIES TABLE */}
      <motion.div
        className="dashboard-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Products</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{c.name}</strong>
                    {c.more && (
                      <div className="text-muted small">
                        {c.more}
                      </div>
                    )}
                  </td>
                  <td>{c.productCount}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        c.isActive ? "completed" : "cancelled"
                      }`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className={`btn btn-sm ${
                        c.isActive
                          ? "btn-outline-danger"
                          : "btn-outline-success"
                      }`}
                      onClick={() => toggleStatus(c)}
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
