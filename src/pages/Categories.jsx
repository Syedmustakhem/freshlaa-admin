import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [img1, setImg1] = useState("");
  const [img2, setImg2] = useState("");
  const [img3, setImg3] = useState("");
  const [img4, setImg4] = useState("");
  const [more, setMore] = useState("");

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

    if (!img1 || !img2 || !img3 || !img4) {
      alert("Please add all 4 image URLs");
      return;
    }

    const payload = {
      name,
      slug: name.toLowerCase().trim().replace(/\s+/g, "-"),
      images: [img1, img2, img3, img4],
      more,
      type: "shop_by_category", // 🔥 future-proof
      isActive: true,
    };

    try {
      await api.post("/category", payload);
      setName("");
      setImg1("");
      setImg2("");
      setImg3("");
      setImg4("");
      setMore("");
      fetchCategories();
    } catch (err) {
      console.error("Failed to add category", err);
      alert("Failed to add category");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <AdminLayout>
      <h3>Shop by Category</h3>

      <div className="card p-3 mb-4">
        <input
          className="form-control mb-2"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Image URL 1"
          value={img1}
          onChange={(e) => setImg1(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Image URL 2"
          value={img2}
          onChange={(e) => setImg2(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Image URL 3"
          value={img3}
          onChange={(e) => setImg3(e.target.value)}
        />

        <input
          className="form-control mb-2"
          placeholder="Image URL 4"
          value={img4}
          onChange={(e) => setImg4(e.target.value)}
        />

        <input
          className="form-control mb-3"
          placeholder="More text (eg: +10 more)"
          value={more}
          onChange={(e) => setMore(e.target.value)}
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
            <th>More</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c, i) => (
            <tr key={c._id}>
              <td>{i + 1}</td>
              <td>{c.name}</td>
              <td>{c.images?.length || 0}</td>
              <td>{c.more}</td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
}
