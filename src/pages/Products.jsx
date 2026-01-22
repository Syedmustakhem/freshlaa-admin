import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [variantProduct, setVariantProduct] = useState(null);
const [showAddModal, setShowAddModal] = useState(false);

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
  category: "",
  images: [],
  variants: [emptyVariant],
});

  /* ================= FETCH PRODUCTS (ADMIN) ================= */
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.get("/products/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Failed to load products", err);
      alert("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= PRODUCT STATUS ================= */
  const toggleStatus = async (product) => {
    try {
      await api.put(
        `/products/${product._id}`,
        { isActive: !product.isActive },
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
 const openEditProduct = (product) => {
  setEditProduct({
    ...JSON.parse(JSON.stringify(product)),
    variants: (product.variants || []).map(v => ({
  ...v,
  unit: v.unit || "kg",
}))
,
  });
};

  const saveEditProduct = async () => {
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
  try {
    const payload = {
      ...newProduct,
      variants: newProduct.variants.map(v => ({
        ...v,
        unit: v.unit || "kg",   // FORCE unit
      })),
    };

    await api.post("/products/manual", payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    setShowAddModal(false);
    setNewProduct({
  name: "",
  description: "",
  category: "",
  images: [],
  variants: [{ ...emptyVariant }],
});

    fetchProducts();
  } catch (err) {
    alert(err.response?.data?.message || "Failed to add product");
  }
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
<div className="d-flex justify-content-between mb-3">
  <h3>Products</h3>
  <button
    className="btn btn-dark"
    onClick={() => setShowAddModal(true)}
  >
    + Add Product
  </button>
</div>

      {/* ================= PRODUCT TABLE ================= */}
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
            {products.map((p, i) => (
              <tr key={p._id}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>
                  ₹{p.variants?.find(v => v.isDefault)?.price || "-"}
                </td>
               <td>
  {p.stock === 0 ? (
    <span className="badge bg-secondary">Out of Stock</span>
  ) : (
    <button
      className={`btn btn-sm ${
        p.isActive ? "btn-success" : "btn-danger"
      }`}
      onClick={() => toggleStatus(p)}
    >
      {p.isActive ? "Active" : "Inactive"}
    </button>
  )}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= EDIT PRODUCT MODAL ================= */}
      {editProduct && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Product</h5>
                <button className="btn-close" onClick={() => setEditProduct(null)} />
              </div>

              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  placeholder="Name"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />

                <textarea
                  className="form-control mb-2"
                  placeholder="Description"
                  rows={3}
                  value={editProduct.description || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, description: e.target.value })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Category"
                  value={editProduct.category || ""}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, category: e.target.value })
                  }
                />

                {/* Images */}
                <h6 className="mt-3">Images</h6>
                {editProduct.images?.map((img, i) => (
                  <div className="d-flex mb-2" key={i}>
                    <input
                      className="form-control"
                      value={img}
                      onChange={(e) => {
                        const imgs = [...editProduct.images];
                        imgs[i] = e.target.value;
                        setEditProduct({ ...editProduct, images: imgs });
                      }}
                    />
                    <button
                      className="btn btn-danger ms-2"
                      onClick={() => {
                        const imgs = editProduct.images.filter((_, idx) => idx !== i);
                        setEditProduct({ ...editProduct, images: imgs });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() =>
                    setEditProduct({
                      ...editProduct,
                      images: [...(editProduct.images || []), ""],
                    })
                  }
                >
                  + Add Image
                </button>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditProduct(null)}>
                  Cancel
                </button>
                <button className="btn btn-dark" onClick={saveEditProduct}>
                  Save Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VARIANTS MODAL ================= */}
      {variantProduct && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Product Variants</h5>
                <button className="btn-close" onClick={() => setVariantProduct(null)} />
              </div>

              <div className="modal-body">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Price</th>
                      <th>MRP</th>
                      <th>Stock</th>
                      <th>Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantProduct.variants.map((v, i) => (
                      <tr key={i}>
                        <td>{v.label}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={v.price}
                            onChange={(e) =>
                              updateVariantField(i, "price", Number(e.target.value))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={v.mrp}
                            onChange={(e) =>
                              updateVariantField(i, "mrp", Number(e.target.value))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={v.stock}
                            onChange={(e) =>
                              updateVariantField(i, "stock", Number(e.target.value))
                            }
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="radio"
                            checked={v.isDefault}
                            onChange={() => setDefaultVariant(i)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setVariantProduct(null)}>
                  Cancel
                </button>
                <button className="btn btn-dark" onClick={saveVariants}>
                  Save Variants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
  <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }}>
    <div className="modal-dialog modal-xl">
      <div className="modal-content">
        <div className="modal-header">
          <h5>Add Product</h5>
          <button className="btn-close" onClick={() => setShowAddModal(false)} />
        </div>

        <div className="modal-body">
          <input
            className="form-control mb-2"
            placeholder="Product Name"
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />

          <input
            className="form-control mb-2"
            placeholder="Category"
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
          />

          <textarea
            className="form-control mb-3"
            placeholder="Description"
            rows={3}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />
{/* ================= ADD PRODUCT IMAGES ================= */}
<h6 className="mt-3">Product Images</h6>

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
      className="btn btn-danger ms-2"
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
  className="btn btn-sm btn-outline-success mb-3"
  onClick={() =>
    setNewProduct({
      ...newProduct,
      images: [...newProduct.images, ""],
    })
  }
>
  + Add Image
</button>

          <h6>Variants</h6>
          {newProduct.variants.map((v, i) => (
            <div className="row g-2 mb-2" key={i}>
              <div className="col">
                <input
                  className="form-control"
                  placeholder="Label (e.g. 500g Pack)"
                  onChange={(e) =>
                    updateNewVariant(i, "label", e.target.value)
                  }
                />
              </div>

              <div className="col">
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

              <div className="col">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Qty"
                  onChange={(e) =>
                    updateNewVariant(i, "value", Number(e.target.value))
                  }
                />
              </div>

              <div className="col">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Price"
                  onChange={(e) =>
                    updateNewVariant(i, "price", Number(e.target.value))
                  }
                />
              </div>

              <div className="col">
                <input
                  type="number"
                  className="form-control"
                  placeholder="MRP"
                  onChange={(e) =>
                    updateNewVariant(i, "mrp", Number(e.target.value))
                  }
                />
              </div>

              <div className="col">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Stock"
                  onChange={(e) =>
                    updateNewVariant(i, "stock", Number(e.target.value))
                  }
                />
              </div>

              <div className="col text-center">
                <input
                  type="radio"
                  checked={v.isDefault}
                  onChange={() => setNewDefaultVariant(i)}
                />
              </div>
            </div>
          ))}

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={addNewVariant}
          >
            + Add Variant
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </button>
          <button className="btn btn-dark" onClick={saveNewProduct}>
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
