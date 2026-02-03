import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [variantProduct, setVariantProduct] = useState(null);
const [showAddModal, setShowAddModal] = useState(false);
const [sections, setSections] = useState([]);
const [categories, setCategories] = useState([]);

const emptyVariant = {
  label: "",
  unit: "kg",
  value: 1,
  price: 0,
  mrp: 0,
  stock: 0,
  isDefault: true,
};

const [newProduct, setNewProduct] = useState({
  name: "",
  description: "",
  sectionId: "",
  subCategory: "",
  category: "",
  images: [],
  variants: [emptyVariant],
});
const fetchProducts = async () => {
  try {
    const res = await api.get("/products/admin/all", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });
    setProducts(res.data.data || []);
  } catch (err) {
    console.error("Failed to load products", err);
    alert("Failed to load products");
  }
};

 const fetchSections = async () => {
  const res = await api.get("/admin/category-sections", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  });
  setSections(res.data.data || []);
};
useEffect(() => {
  fetchProducts();
  fetchSections();
}, []);

  /* ================= PRODUCT STATUS ================= */
  const toggleStatus = async (product) => {
    try {
     await api.patch(
  `/products/${product._id}/status`,
  {},
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  }
);
fetchProducts();
    } catch {
      alert("Failed to update status");
    }
  };
/* ================= DELETE PRODUCT ================= */
const deleteProduct = async (productId) => {
  if (!window.confirm("Are you sure you want to delete this product?")) return;

  try {
    await api.delete(`/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    fetchProducts();
  } catch (err) {
    alert("Failed to delete product");
  }
};

  /* ================= EDIT PRODUCT ================= */
 const openEditProduct = async (product) => {
  setEditProduct({
    ...JSON.parse(JSON.stringify(product)),
    variants: (product.variants || []).map(v => ({
      ...v,
      unit: v.unit || "kg",
    })),
  });

  if (product.sectionId) {
    await fetchCategoriesBySection(product.sectionId);
  }
};

  
const saveEditProduct = async () => {
  if (!editProduct.sectionId || !editProduct.subCategory) {
    alert("Please select section and category");
    return;
  }

  try {
    await api.put(
      `/products/${editProduct._id}`,
      {
        ...editProduct,
        variants: (editProduct.variants || []).map(v => ({
          ...v,
          unit: v.unit || "kg",
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    setEditProduct(null);
    fetchProducts();
  } catch {
    alert("Update failed");
  }
};

const addNewVariant = () => {
  setNewProduct({
    ...newProduct,
    variants: [
      ...newProduct.variants,
      { ...emptyVariant, isDefault: false },
    ],
  });
};

const updateNewVariant = (index, field, value) => {
  const updated = [...newProduct.variants];
  updated[index][field] = value;
  setNewProduct({ ...newProduct, variants: updated });
};

const setNewDefaultVariant = (index) => {
  const updated = newProduct.variants.map((v, i) => ({
    ...v,
    isDefault: i === index,
  }));
  setNewProduct({ ...newProduct, variants: updated });
};

const saveNewProduct = async () => {
  if (
    !newProduct.name ||
    !newProduct.sectionId ||
    !newProduct.subCategory ||
    !newProduct.images.length
  ) {
    alert("All required fields must be filled");
    return;
  }
if (!newProduct.variants.some(v => v.isDefault)) {
  alert("Please select a default variant");
  return;
}

  try {
    const payload = {
      ...newProduct,

      variants: newProduct.variants.map(v => ({
        label: v.label,
        unit: v.unit,
        value: Number(v.value),
        price: Number(v.price),
        mrp: Number(v.mrp || v.price),
        stock: Number(v.stock),
        isDefault: v.isDefault,
      })),
    };
const totalStock = newProduct.variants.reduce(
  (sum, v) => sum + Number(v.stock || 0),
  0
);

    await api.post("/products/manual", payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    setShowAddModal(false);
    fetchProducts();

  } catch (err) {
    alert(err.response?.data?.message || "Failed to add product");
  }
};

const fetchCategoriesBySection = async (sectionId) => {
  if (!sectionId) {
    setCategories([]);
    return;
  }

  const res = await api.get(
    `/admin/categories?sectionId=${sectionId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    }
  );

  setCategories(res.data.data || []);
};
const handleEditSectionChange = async (sectionId) => {
  setEditProduct({
    ...editProduct,
    sectionId,
    subCategory: "",
    category: "",
  });
  await fetchCategoriesBySection(sectionId);
};

  /* ================= VARIANT HELPERS ================= */
  const updateVariantField = (index, field, value) => {
    const updated = [...variantProduct.variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariantProduct({ ...variantProduct, variants: updated });
  };

  const setDefaultVariant = (index) => {
    const updated = variantProduct.variants.map((v, i) => ({
      ...v,
      isDefault: i === index,
    }));
    setVariantProduct({ ...variantProduct, variants: updated });
  };

const saveVariants = async () => {
  try {
    const payload = {
      variants: (variantProduct.variants || []).map(v => ({
        ...v,
        unit: v.unit || "kg",
      })),
    };

    await api.put(
      `/products/${variantProduct._id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    setVariantProduct(null);
    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Failed to save variants");
  }
};

  return (
  <AdminLayout>

    {/* ================= HEADER ================= */}
    <div className="d-flex justify-content-between mb-3">
      <h3>Products</h3>
      <button
        className="btn btn-dark"
       onClick={() => {
  setCategories([]);
  setNewProduct({
    name: "",
    description: "",
    sectionId: "",
    subCategory: "",
    category: "",
    images: [""],               // ✅ REQUIRED
    variants: [{ ...emptyVariant }], // ✅ GUARANTEED ONE VARIANT
  });
  setShowAddModal(true);
}}

      >
        + Add Product
      </button>
    </div>

    {/* ================= PRODUCTS TABLE ================= */}
    <div className="card">
      <table className="table mb-0">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Default Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-muted">
                No products found
              </td>
            </tr>
          ) : (
            products.map((p, i) => (
              <tr key={p._id}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>
                  ₹{p.variants?.find(v => v.isDefault)?.price || "-"}
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${
                      p.isActive ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() => toggleStatus(p)}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-dark me-2"
                    onClick={() => openEditProduct(p)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() =>
                      setVariantProduct({
                        ...JSON.parse(JSON.stringify(p)),
                        variants: p.variants.map(v => ({
                          ...v,
                          unit: v.unit || "kg",
                        })),
                      })
                    }
                  >
                    Variants
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteProduct(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* ================= ADD PRODUCT MODAL ================= */}
    {showAddModal && (
      <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <h5>Add Product</h5>
              <button
                className="btn-close"
                onClick={() => setShowAddModal(false)}
              />
            </div>

            {/* BODY */}
            <div className="modal-body">

              {/* BASIC INFO */}
              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">🧾 Basic Information</h6>

                <label className="form-label">Product Name</label>
                <input
                  className="form-control mb-2"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />

                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                />
              </div>

              {/* CATEGORY */}
              <div className="border rounded p-3 mb-3">
                <h6 className="mb-3">📂 Category Selection</h6>

                <label className="form-label">Section</label>
               <select
  className="form-control"
  disabled={!categories.length}
  value={newProduct.subCategory}
  onChange={(e) => {
    const selected = categories.find(c => c.slug === e.target.value);

    setNewProduct({
      ...newProduct,
      subCategory: selected.title, // ✅ readable
      category: selected.slug,     // ✅ slug (indexed)
    });
  }}
>

                  <option value="">Select Section</option>
                  {sections.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.title}
                    </option>
                  ))}
                </select>

                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  disabled={!categories.length}
                  value={newProduct.subCategory}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      subCategory: e.target.value,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="">
                    {categories.length ? "Select Category" : "Select section first"}
                  </option>
                  {categories.map(c => (
                    <option key={c._id} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
{/* IMAGES */}
<div className="border rounded p-3 mb-3">
  <h6 className="mb-2">🖼 Product Images</h6>

  {newProduct.images.map((img, i) => (
    <div className="d-flex mb-2" key={i}>
      <input
        className="form-control"
        placeholder="Image URL"
        value={img}
        onChange={(e) => {
          const imgs = [...newProduct.images];
          imgs[i] = e.target.value;
          setNewProduct({ ...newProduct, images: imgs });
        }}
      />
      <button
        className="btn btn-outline-danger ms-2"
        onClick={() => {
          const imgs = newProduct.images.filter((_, idx) => idx !== i);
          setNewProduct({ ...newProduct, images: imgs });
        }}
      >
        ✕
      </button>
    </div>
  ))}

  <button
    className="btn btn-sm btn-outline-success"
    onClick={() =>
      setNewProduct({
        ...newProduct,
        images: [...newProduct.images, ""],
      })
    }
  >
    + Add Image
  </button>
</div>

        
          {/* VARIANTS */}
<div className="border rounded p-3">
  <h6 className="mb-2">📦 Variants</h6>

  {newProduct.variants.map((v, i) => (
    <div className="row g-2 align-items-end mb-2" key={i}>

      <div className="col-md-3">
        <label className="form-label">Label</label>
        <input
          className="form-control"
          placeholder="500g Pack"
          value={v.label}
          onChange={(e) =>
            updateNewVariant(i, "label", e.target.value)
          }
        />
      </div>

      <div className="col-md-2">
        <label className="form-label">Unit</label>
        <select
          className="form-select"
          value={v.unit}
          onChange={(e) =>
            updateNewVariant(i, "unit", e.target.value)
          }
        >
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="l">l</option>
          <option value="ml">ml</option>
          <option value="pcs">pcs</option>
        </select>
      </div>

      <div className="col-md-1">
        <label className="form-label">Qty</label>
        <input
          type="number"
          className="form-control"
          value={v.value}
          onChange={(e) =>
            updateNewVariant(i, "value", Number(e.target.value))
          }
        />
      </div>

      <div className="col-md-2">
        <label className="form-label">Price</label>
        <input
          type="number"
          className="form-control"
          value={v.price}
          onChange={(e) =>
            updateNewVariant(i, "price", Number(e.target.value))
          }
        />
      </div>

      <div className="col-md-2">
        <label className="form-label">MRP</label>
        <input
          type="number"
          className="form-control"
          value={v.mrp}
          onChange={(e) =>
            updateNewVariant(i, "mrp", Number(e.target.value))
          }
        />
      </div>

      <div className="col-md-1">
        <label className="form-label">Stock</label>
        <input
          type="number"
          className="form-control"
          value={v.stock}
          onChange={(e) =>
            updateNewVariant(i, "stock", Number(e.target.value))
          }
        />
      </div>

      <div className="col-md-1 text-center">
        <label className="form-label">Default</label>
        <input
          type="radio"
          checked={v.isDefault}
          onChange={() => setNewDefaultVariant(i)}
        />
      </div>

    </div>
  ))}

  <button
    className="btn btn-sm btn-outline-primary mt-2"
    onClick={addNewVariant}
  >
    + Add Variant
  </button>
</div>

            </div>

            {/* FOOTER */}
            <div className="modal-footer">
             <button
  className="btn btn-secondary"
  onClick={() => {
    setShowAddModal(false);
    setNewProduct({
      name: "",
      description: "",
      sectionId: "",
      subCategory: "",
      category: "",
      images: [""],
      variants: [{ ...emptyVariant }],
    });
  }}
>
  Cancel
</button>

              <button
                className="btn btn-dark"
                disabled={
                  !newProduct.name ||
                  !newProduct.sectionId ||
                  !newProduct.subCategory
                }
                onClick={saveNewProduct}
              >
                Save Product
              </button>
            </div>

          </div>
        </div>
      </div>
    )}

  </AdminLayout>
);




}
