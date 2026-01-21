import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [imageUrls, setImageUrls] = useState(""); // comma-separated URLs

  /* ---------------- FETCH CATEGORIES ---------------- */

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data || []);
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

    if (!imageUrls.trim()) {
      alert("Please paste at least one Cloudinary image URL");
      return;
    }

    const payload = {
      name,
      slug: name.toLowerCase().trim().replace(/\s+/g, "-"),
      images: imageUrls.split(",").map((url) => url.trim()),
      isActive: true,
    };

    try {
      await api.post("/category", payload);
      setName("");
      setImageUrls("");
      fetchCategories();
    } catch (err) {
      console.error("Failed to add category", err);
      alert("Failed to add category");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <AdminLayout>
      <h3>Categories</h3>

      <div className="card p-3 mb-4">
        <input
          className="form-control mb-2"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="form-control mb-2"
          placeholder="Paste Cloudinary image URLs (comma separated)"
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
          rows={3}
        />

        <button className="btn btn-dark" onClick={addCategory}>
          Add Category
        </button>
      </div>

      <table className="table card">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Images</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c, i) => (
            <tr key={c._id}>
              <td>{i + 1}</td>
              <td>{c.name}</td>
              <td>{c.images?.length || 0}</td>
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
