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

  const saveOrder = async () => {
    try {
      setSaving(true);
      await api.put("/admin/home-section/reorder", {
        sections: sections.map((s, i) => ({
          _id: s._id,
          order: i + 1,
        })),
      });
      toast.success("Order saved");
    } catch {
      toast.error("Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading home layout…</div>;

  return (
    <div className="home-layout-container" style={{ padding: '20px', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .home-layout-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
          margin-top: 20px;
          min-height: 400px;
        }
        .home-layout-item-card {
          background: #fff;
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid #eee;
          transition: transform 0.2s;
        }
        .drag-handle {
          cursor: grab;
          color: #999;
          margin-right: 15px;
          font-size: 20px;
        }
        .save-banner {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4f46e5;
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          z-index: 1000;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold m-0">🏠 Home Layout Editor</h3>
          <p className="text-muted small m-0">Drag handle to reorder • Changes save automatically</p>
        </div>
        <button className="btn btn-primary btn-sm px-4" onClick={saveOrder} disabled={saving}>
          {saving ? 'Saving...' : 'Force Save Order'}
        </button>
      </div>

      {saving && <div className="save-banner">Saving Changes...</div>}

      <div className="home-layout-scroll-area">
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
              className="home-layout-item-card"
            >
              <div className="d-flex align-items-center">
                <span className="drag-handle">☰</span>
                <div>
                  <div className="fw-bold text-dark">{sec.type}</div>
                  <div className="text-muted" style={{ fontSize: '10px' }}>{sec._id || sec.id}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <span className={`badge ${sec.isActive ? 'bg-success-subtle text-success' : 'bg-light text-muted'}`}>
                  {sec.isActive ? 'VISIBLE' : 'HIDDEN'}
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
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
};

export default HomeLayout;
