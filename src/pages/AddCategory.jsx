import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function AddCategory() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [images, setImages] = useState([""]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ================= AUTO SLUG ================= */
  useEffect(() => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    setSlug(generatedSlug);
  }, [title]);

  /* ================= HANDLE IMAGE CHANGE ================= */
  const handleImageChange = (value, index) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  const addImageField = () => {
    if (images.length >= 4) {
      alert("Maximum 4 images allowed");
      return;
    }
    setImages([...images, ""]);
  };

  const removeImageField = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanImages = images.filter((img) => img.trim() !== "");

      await api.post("/admin/categories", {
        title,
        slug,
        images: cleanImages,
        isActive,
      });

      alert("Category created successfully");
      navigate("/admin/categories");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h3 className="page-heading">Add Category</h3>

      <div className="dashboard-card">
        <form onSubmit={handleSubmit}>

          {/* TITLE */}
          <div className="form-group">
            <label>Title</label>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* SLUG */}
          <div className="form-group">
            <label>Slug</label>
            <input
              className="form-control"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          {/* IMAGES */}
          <div className="form-group">
            <label>Category Images (Max 4)</label>

            {images.map((img, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Paste Cloudinary Image URL"
                  value={img}
                  onChange={(e) =>
                    handleImageChange(e.target.value, index)
                  }
                />

                {img && (
                  <img
                    src={img}
                    alt=""
                    style={{
                      width: 80,
                      height: 80,
                      marginTop: 5,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                )}

                {images.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => removeImageField(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            {images.length < 4 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addImageField}
              >
                + Add Another Image
              </button>
            )}
          </div>

          {/* STATUS */}
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
              />{" "}
              Active
            </label>
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Category"}
          </button>

        </form>
      </div>
    </AdminLayout>
  );
}
