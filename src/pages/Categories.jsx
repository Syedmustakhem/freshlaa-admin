import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
const res = await api.get("/admin/categories");
      // support both response shapes
      const data = res.data.data || res.data || [];
      setCategories(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <AdminLayout>
      <h3 className="page-heading">Categories</h3>

      <motion.div
        className="dashboard-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Slug</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>

                  {/* ✅ title (NOT name) */}
                  <td>
                    <strong>{c.title}</strong>
                  </td>

                  <td className="text-muted">{c.slug}</td>

                  {/* ✅ populated section */}
                  <td>
                    {c.sectionId?.title ? (
                      <span className="badge badge-info">
                        {c.sectionId.title}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  {/* ✅ isActive */}
                  <td>
                    {c.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
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
