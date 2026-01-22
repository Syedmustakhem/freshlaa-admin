import { useEffect, useState } from "react";
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
      <h3>Categories</h3>

      {/* ADD CATEGORY */}
      <div className="card p-3 mb-4">
        <input
          className="form-control mb-2"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {images.map((img, i) => (
          <input
            key={i}
            className="form-control mb-2"
            placeholder={`Image URL ${i + 1}`}
            value={img}
            onChange={(e) => {
              const arr = [...images];
              arr[i] = e.target.value;
              setImages(arr);
            }}
          />
        ))}

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

      {/* TABLE */}
      <table className="table card">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Products</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c, i) => (
            <tr key={c._id}>
              <td>{i + 1}</td>
              <td>{c.name}</td>
              <td>{c.productCount}</td>
              <td>
                <span
                  className={`badge ${
                    c.isActive ? "bg-success" : "bg-danger"
                  }`}
                >
                  {c.isActive ? "Active" : "Disabled"}
                </span>
              </td>
              <td>
                <button
                  className={`btn btn-sm ${
                    c.isActive ? "btn-danger" : "btn-success"
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
              <td colSpan="5" className="text-center">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
}
