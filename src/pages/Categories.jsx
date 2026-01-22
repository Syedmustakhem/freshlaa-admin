import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [img1, setImg1] = useState("");
  const [img2, setImg2] = useState("");
  const [img3, setImg3] = useState("");
  const [img4, setImg4] = useState("");
  const [more, setMore] = useState("");

  /* ---------------- FETCH ---------------- */

  const fetchCategories = async () => {
    const res = await api.get("/category");
    setCategories(res.data || []);
    setOrderedCategories(res.data || []);
  };

  const fetchProducts = async () => {
    const res = await api.get("/products/admin/all", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });
    setProducts(res.data.data || []);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  /* ---------------- ADD CATEGORY ---------------- */

  const addCategory = async () => {
    if (!name || !img1 || !img2 || !img3 || !img4) {
      alert("All fields required");
      return;
    }

    const payload = {
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      images: [img1, img2, img3, img4],
      more,
      isActive: true,
    };

    await api.post("/category", payload);
    setName(""); setImg1(""); setImg2(""); setImg3(""); setImg4(""); setMore("");
    fetchCategories();
  };

  /* ---------------- TOGGLE CATEGORY ---------------- */

  const toggleCategory = async (cat) => {
    await api.put(`/category/${cat._id}`, {
      isActive: !cat.isActive,
    });
    fetchCategories();
  };

  /* ---------------- DRAG & DROP ---------------- */

  const onDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
  };

  const onDrop = (e, index) => {
    const from = e.dataTransfer.getData("index");
    const updated = [...orderedCategories];
    const moved = updated.splice(from, 1)[0];
    updated.splice(index, 0, moved);
    setOrderedCategories(updated);
  };

  /* ---------------- HELPERS ---------------- */

  const productCount = (categoryName) =>
    products.filter(
      p => p.category?.toLowerCase() === categoryName.toLowerCase()
    ).length;

  /* ---------------- UI ---------------- */

  return (
    <AdminLayout>
      <h3>Shop by Category</h3>

      {/* ADD */}
      <div className="card p-3 mb-4">
        <input className="form-control mb-2" placeholder="Category name" value={name} onChange={e => setName(e.target.value)} />
        <input className="form-control mb-2" placeholder="Image URL 1" value={img1} onChange={e => setImg1(e.target.value)} />
        <input className="form-control mb-2" placeholder="Image URL 2" value={img2} onChange={e => setImg2(e.target.value)} />
        <input className="form-control mb-2" placeholder="Image URL 3" value={img3} onChange={e => setImg3(e.target.value)} />
        <input className="form-control mb-2" placeholder="Image URL 4" value={img4} onChange={e => setImg4(e.target.value)} />
        <input className="form-control mb-3" placeholder="More text" value={more} onChange={e => setMore(e.target.value)} />
        <button className="btn btn-dark" onClick={addCategory}>Add Category</button>
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
          {orderedCategories.map((c, i) => (
            <tr
              key={c._id}
              draggable
              onDragStart={(e) => onDragStart(e, i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, i)}
              style={{ cursor: "grab" }}
            >
              <td>{i + 1}</td>
              <td>{c.name}</td>
              <td>{productCount(c.name)}</td>
              <td>
                <span className={`badge ${c.isActive ? "bg-success" : "bg-danger"}`}>
                  {c.isActive ? "Active" : "Disabled"}
                </span>
              </td>
              <td>
                <button
                  className={`btn btn-sm ${c.isActive ? "btn-danger" : "btn-success"}`}
                  onClick={() => toggleCategory(c)}
                >
                  {c.isActive ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}

          {orderedCategories.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center">No categories found</td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
}
