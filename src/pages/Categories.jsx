import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories");
      const data = res.data.data || [];
      setCategories(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= DELETE ================= */
  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/categories/${id}/status`);
      fetchCategories();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  /* ================= SAVE EDIT ================= */
  const saveEdit = async () => {
    if (!editing.title) {
      alert("Title is required");
      return;
    }

    try {
      await api.put(`/admin/categories/${editing._id}`, {
        title: editing.title,
        slug: editing.slug,
        isActive: editing.isActive,
        displayType: editing.displayType,
        order: editing.order,
        images: editing.images,
      });

      setEditing(null);
      fetchCategories();
    } catch (err) {
      alert("Failed to update category");
    }
  };

  return (
    <AdminLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 className="page-heading">Categories</h3>

        <Link to="/admin/add-category" className="btn btn-primary">
          + Add Category
        </Link>
      </div>

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
                <th>Section</th>      {/* ✅ matches tbody: sectionId?.title */}
                <th>Type</th>         {/* ✅ matches tbody: displayType */}
                <th>Order</th>        {/* ✅ matches tbody: c.order */}
                <th>Status</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>

                  <td>
                    <strong>{c.title}</strong>
                  </td>

                  <td className="text-muted">{c.slug}</td>

                  {/* Section */}
                  <td>
                    {c.sectionId?.title ? (
                      <span className="badge bg-info">{c.sectionId.title}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  {/* Display Type */}
                  <td>
                    <span className="badge bg-secondary">{c.displayType}</span>
                  </td>

                  {/* Order */}
                  <td>{c.order || 0}</td>

                  {/* Status */}
                  <td>
                    <button
                      className={`btn btn-sm ${
                        c.isActive ? "btn-success" : "btn-danger"
                      }`}
                      onClick={() => toggleStatus(c._id)}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td>
                    <button
                      className="btn btn-sm btn-outline-dark me-2"
                      onClick={() => setEditing(c)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteCategory(c._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted"> {/* ✅ was 6, now 8 */}
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ================= EDIT MODAL ================= */}
      {editing && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Category</h5>
                <button
                  className="btn-close"
                  onClick={() => setEditing(null)}
                />
              </div>

              <div className="modal-body">
                <label className="form-label">Title</label>
                <input
                  className="form-control mb-2"
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />

                <label className="form-label">Slug</label>
                <input
                  className="form-control mb-2"
                  value={editing.slug}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value })
                  }
                />

                <label className="form-label">Display Type</label>
                <select
                  className="form-control mb-2"
                  value={editing.displayType || "section"}
                  onChange={(e) =>
                    setEditing({ ...editing, displayType: e.target.value })
                  }
                >
                  <option value="section">Section</option>
                  <option value="top">Top</option>
                  <option value="featured">Featured</option>
                  <option value="festival">Festival</option>
                  <option value="trending">Trending</option>
                </select>

                <label className="form-label">Order</label>
                <input
                  type="number"
                  className="form-control mb-2"
                  value={editing.order || 0}
                  onChange={(e) =>
                    setEditing({ ...editing, order: Number(e.target.value) })
                  }
                />

                <label className="form-label">Images (comma separated URLs)</label>
                <input
                  className="form-control mb-2"
                  value={(editing.images || []).join(",")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      images: e.target.value.split(",").map((url) => url.trim()),
                    })
                  }
                />

                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={editing.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      isActive: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>

                <button className="btn btn-dark" onClick={saveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}