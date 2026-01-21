import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const token = localStorage.getItem("adminToken");

  const fetchCategories = async () => {
    const res = await api.get("/category/admin/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCategories(res.data.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    await api.post(
      "/category/admin",
      { name },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setName("");
    fetchCategories();
  };

  const toggleStatus = async (cat) => {
    await api.put(
      `/category/admin/${cat._id}`,
      { isActive: !cat.isActive },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCategories();
  };

  return (
    <AdminLayout>
      <h3>Categories</h3>

      <div className="d-flex mb-3">
        <input
          className="form-control me-2"
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-dark" onClick={addCategory}>
          Add
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
        </tbody>
      </table>
    </AdminLayout>
  );
}
