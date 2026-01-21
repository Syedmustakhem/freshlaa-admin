import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [images, setImages] = useState([]);

  const token = localStorage.getItem("adminToken");

  /* ---------------- FETCH CATEGORIES ---------------- */

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------------- ADD CATEGORY ---------------- */

  const addCategory = async () => {
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }

    if (images.length > 4) {
      alert("Maximum 4 images allowed");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append(
      "slug",
      name.toLowerCase().trim().replace(/\s+/g, "-")
    );

    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      await api.post("/category/admin", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setName("");
      setImages([]);
      fetchCategories();
    } catch (err) {
      console.error("Failed to add category", err);
      alert("Failed to add category");
    }
  };

  /* ---------------- TOGGLE STATUS ---------------- */

  const toggleStatus = async (cat) => {
    try {
      await api.put(
        `/category/admin/${cat._id}`,
        { isActive: !cat.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCategories();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <AdminLayout>
      <h3>Categories</h3>

      <div className="card p-3 mb-4">
        <div className="mb-2">
          <input
            className="form-control"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <input
            type="file"
            multiple
            accept="image/*"
            className="form-control"
            onChange={(e) => setImages([...e.target.files])}
          />
          <small className="text-muted">
            Upload 1–4 images
          </small>
        </div>

        <button className="btn btn-dark mt-2" onClick={addCategory}>
          Add Category
        </button>
      </div>

      <table className="table card">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c, i) => (
            <tr key={c._id}>
              <td>{i + 1}</td>
              <td>{c.name}</td>
              <td>
                <button
                  className={`btn btn-sm ${
                    c.isActive ? "btn-success" : "btn-danger"
                  }`}
                  onClick={() => toggleStatus(c)}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </button>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
}
