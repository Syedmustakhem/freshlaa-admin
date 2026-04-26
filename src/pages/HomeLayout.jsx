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
      const payload = sections.map((s, i) => ({
        _id: s._id || s.id,
        id: s._id || s.id,
        order: i + 1,
      }));
      
      console.log("Saving order with payload:", payload);
      
      await api.put("/admin/home-section/reorder", {
        sections: payload,
        order: payload // sending both keys for compatibility
      });
      toast.success("Order saved");
    } catch (err) {
      console.error("Save order error:", err);
      toast.error("Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading home layout…</div>;

  return (
    <div className="home-layout-container" style={{ position: 'fixed', top: '70px', left: '260px', right: '20px', bottom: '20px', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <style>{`
        .home-layout-scroll-area {
          flex: 1;
          overflow-y: scroll !important;
          padding: 20px;
          padding-bottom: 100px;
        }
        .home-layout-item-card {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          cursor: default;
        }
        .drag-handle {
          cursor: grab;
          color: #94a3b8;
          margin-right: 20px;
          font-size: 24px;
          user-select: none;
        }
        .save-banner {
          background: #4f46e5;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
        }
      `}</style>

      <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center shadow-sm">
        <div>
          <h4 className="fw-bold m-0">🏠 Home Layout Editor</h4>
          <p className="text-muted small m-0">Reorder sections by dragging the ☰ handle</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          {saving && <div className="save-banner">Saving...</div>}
          <button className="btn btn-primary" onClick={saveOrder} disabled={saving}>
            Save Current Order
          </button>
        </div>
      </div>

      <div className="home-layout-scroll-area">
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={setSections}
          onDragEnd={saveOrder}
          className="list-unstyled m-0"
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
                  <div className="fw-bold text-slate-800">{sec.type.replace(/_/g, " ")}</div>
                  <div className="text-muted" style={{ fontSize: '10px', fontFamily: 'monospace' }}>{sec._id || sec.id}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-4">
                <div className="text-end me-2">
                  <div className={`fw-bold small ${sec.isActive ? 'text-success' : 'text-danger'}`}>
                    {sec.isActive ? '● Active' : '○ Hidden'}
                  </div>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={sec.isActive}
                    onChange={() => toggleSection(sec._id || sec.id)}
                    style={{ cursor: 'pointer', scale: '1.3' }}
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
