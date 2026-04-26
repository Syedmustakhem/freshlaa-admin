import { useEffect, useState } from "react";
import api from "../services/api";
import { Reorder } from "framer-motion";
import { toast } from "react-toastify";

const HomeLayout = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSections = async () => {
    try {
      const res = await api.get("/admin/home-layout");
      setSections(res.data.sections || []);
    } catch {
      toast.error("Failed to load home layout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const toggleSection = async (id) => {
    try {
      await api.patch(`/admin/home-section/${id}/toggle`);
      loadSections();
      toast.success("Section status updated");
    } catch {
      toast.error("Failed to update section");
    }
  };
  
  const addSection = async (type) => {
    try {
      const order = sections.length + 1;
      await api.post("/admin/home-section", { type, order, data: { layoutStyle: "GRID" } });
      loadSections();
      toast.success(`${type} section added`);
    } catch {
      toast.error("Failed to add section");
    }
  };

  const deleteSection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      await api.delete(`/admin/home-section/${id}`);
      loadSections();
      toast.success("Section deleted");
    } catch {
      toast.error("Failed to delete section");
    }
  };

  const saveOrder = async () => {
    try {
      setSaving(true);
      const payload = sections
        .map((s, i) => ({
          _id: s._id || s.id,
          id: s._id || s.id,
          order: i + 1,
        }))
        .filter(item => item._id); // 🛡️ CRITICAL: Remove any items with missing IDs
      
      if (payload.length === 0) {
        toast.warn("No items to reorder");
        return;
      }

      console.log("Saving order with payload:", payload);
      
      await api.put("/admin/home-section/reorder", {
        sections: payload,
        order: payload // sending both keys for compatibility
      });
      toast.success("Order saved");
    } catch (err) {
      console.error("Save order error:", err);
      if (err.response?.data) {
        console.error("Server Error Details:", err.response.data);
        toast.error(`Error: ${err.response.data.message || "Server error"}`);
      } else {
        toast.error("Failed to save order");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading home layout…</div>;

  return (
    <div className="home-layout-editor-wrapper" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .home-layout-scroll-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8fafc;
        }
        .home-layout-card {
          background: #fff;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }
        .drag-handle {
          cursor: grab;
          color: #cbd5e1;
          margin-right: 15px;
          font-size: 20px;
        }
      `}</style>

      <div className="bg-white p-3 border-bottom d-flex justify-content-between align-items-center shadow-sm">
        <div>
          <h4 className="m-0 fw-bold">🏠 Home Layout</h4>
          <p className="m-0 text-muted small">Drag items to reorder • Save to apply changes</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {saving && <span className="badge bg-primary">Saving...</span>}
          <button className="btn btn-outline-primary btn-sm px-3" onClick={() => addSection("DYNAMIC_CATEGORIES")}>
            + Add Dynamic Section
          </button>
          <button className="btn btn-outline-success btn-sm px-3" onClick={() => addSection("SERVICE_HIGHLIGHTS")}>
            + Add Service Highlights
          </button>
          <button className="btn btn-primary px-4" onClick={saveOrder} disabled={saving}>
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      <div className="home-layout-scroll-container">
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={setSections}
          onDragEnd={saveOrder}
          className="list-unstyled"
        >
          {sections.map((sec) => (
            <Reorder.Item
              key={sec._id || sec.id}
              value={sec}
              className="home-layout-card"
              style={{ cursor: 'grab' }}
            >
              <div className="d-flex align-items-center">
                <span className="drag-handle">☰</span>
                <div>
                  <div className="fw-bold">{sec.type}</div>
                  <div className="text-muted" style={{ fontSize: '10px' }}>{sec._id || sec.id}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                {["CATEGORIES", "ZEPTO_CATEGORIES", "ZOMATO", "CATEGORY_CAROUSEL", "DYNAMIC_CATEGORIES"].includes(sec.type) && (
                  <div className="me-2">
                    <select
                      className="form-select form-select-sm mb-1"
                      value={sec.data?.layoutStyle || "GRID"}
                      onChange={async (e) => {
                        const style = e.target.value;
                        try {
                          await api.put(`/admin/home-section/${sec._id || sec.id}`, {
                            ...sec,
                            data: { ...sec.data, layoutStyle: style }
                          });
                          loadSections();
                          toast.success(`Layout changed to ${style}`);
                        } catch {
                          toast.error("Failed to update layout style");
                        }
                      }}
                      style={{ fontSize: '10px', width: '120px' }}
                    >
                      <option value="GRID">Standard Grid</option>
                      <option value="BENTO">Bento Grid</option>
                      <option value="VERTICAL">Vertical Banners</option>
                      <option value="CIRCLES">Circle Bubbles</option>
                    </select>

                    <input
                      type="text"
                      className="form-control form-control-sm mb-1"
                      placeholder="Section Title"
                      defaultValue={sec.data?.title || ""}
                      onBlur={async (e) => {
                        const title = e.target.value;
                        if (title === sec.data?.title) return;
                        try {
                          await api.put(`/admin/home-section/${sec._id || sec.id}`, {
                            ...sec,
                            data: { ...sec.data, title }
                          });
                          loadSections();
                          toast.success("Title updated");
                        } catch {
                          toast.error("Failed to update title");
                        }
                      }}
                      style={{ fontSize: '10px', width: '120px' }}
                    />

                    {sec.type === "DYNAMIC_CATEGORIES" && (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Category Slugs (fruits,veg)"
                        defaultValue={sec.data?.categorySlugs || ""}
                        onBlur={async (e) => {
                          const slugs = e.target.value;
                          if (slugs === sec.data?.categorySlugs) return;
                          try {
                            await api.put(`/admin/home-section/${sec._id || sec.id}`, {
                              ...sec,
                              data: { ...sec.data, categorySlugs: slugs }
                            });
                            loadSections();
                            toast.success("Categories updated");
                          } catch {
                            toast.error("Failed to update categories");
                          }
                        }}
                        style={{ fontSize: '10px', width: '120px' }}
                      />
                    )}
                  </div>
                )}

                {sec.type === "SERVICE_HIGHLIGHTS" && (
                  <div className="me-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Section Title"
                      defaultValue={sec.data?.title || ""}
                      onBlur={async (e) => {
                        const title = e.target.value;
                        if (title === sec.data?.title) return;
                        try {
                          await api.put(`/admin/home-section/${sec._id || sec.id}`, {
                            ...sec,
                            data: { ...sec.data, title }
                          });
                          loadSections();
                          toast.success("Title updated");
                        } catch {
                          toast.error("Failed to update title");
                        }
                      }}
                      style={{ fontSize: '10px', width: '120px' }}
                    />
                  </div>
                )}

                {sec.type === "FOOTER" && (
                  <div className="me-2 d-flex flex-column gap-1" style={{ width: '150px' }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Headline"
                      defaultValue={sec.data?.headline || ""}
                      onBlur={async (e) => {
                        const val = e.target.value;
                        if (val === sec.data?.headline) return;
                        try {
                          await api.put(`/admin/home-section/${sec._id || sec.id}`, {
                            ...sec,
                            data: { ...sec.data, headline: val }
                          });
                          loadSections();
                          toast.success("Footer updated");
                        } catch {
                          toast.error("Failed to update footer");
                        }
                      }}
                      style={{ fontSize: '10px' }}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Accent (e.g. 10 minutes)"
                      defaultValue={sec.data?.headlineAccent || ""}
                      onBlur={async (e) => {
                        const val = e.target.value;
                        if (val === sec.data?.headlineAccent) return;
                        try {
                          await api.put(`/admin/home-section/${sec._id || sec.id}`, {
                            ...sec,
                            data: { ...sec.data, headlineAccent: val }
                          });
                          loadSections();
                        } catch {}
                      }}
                      style={{ fontSize: '10px' }}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Tagline"
                      defaultValue={sec.data?.tagline || ""}
                      onBlur={async (e) => {
                        const val = e.target.value;
                        if (val === sec.data?.tagline) return;
                        try {
                          await api.put(`/admin/home-section/${sec._id || sec.id}`, {
                            ...sec,
                            data: { ...sec.data, tagline: val }
                          });
                          loadSections();
                        } catch {}
                      }}
                      style={{ fontSize: '10px' }}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Copyright"
                      defaultValue={sec.data?.copyright || ""}
                      onBlur={async (e) => {
                        const val = e.target.value;
                        if (val === sec.data?.copyright) return;
                        try {
                          await api.put(`/admin/home-section/${sec._id || sec.id}`, {
                            ...sec,
                            data: { ...sec.data, copyright: val }
                          });
                          loadSections();
                        } catch {}
                      }}
                      style={{ fontSize: '10px' }}
                    />
                  </div>
                )}

                <span className={`badge ${sec.isActive ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '10px' }}>
                  {sec.isActive ? 'ACTIVE' : 'HIDDEN'}
                </span>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={sec.isActive}
                    onChange={() => toggleSection(sec._id || sec.id)}
                    style={{ cursor: 'pointer', scale: '1.2' }}
                  />
                </div>
                <button 
                  className="btn btn-link text-danger p-0 ms-2" 
                  onClick={() => deleteSection(sec._id || sec.id)}
                  title="Delete Section"
                >
                  🗑️
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
};

export default HomeLayout;
