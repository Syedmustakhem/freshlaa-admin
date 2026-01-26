import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories"); // ✅ CORRECT
      setCategories(res.data.data || []);
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
      <h3 className="page-heading">Categories (Read Only)</h3>

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
                <th>Name</th>
                <th>Slug</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td className="text-muted">{c.slug}</td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
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
