import { useEffect, useState } from "react";
import api from "../services/api";
import { Reorder } from "framer-motion";
import { toast } from "react-toastify";

export default function HomeLayout() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSections = async () => {
    try {
      const res = await api.get("/admin/home-layout"); // ✅ admin API
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
    <div className="home-layout-page container mt-4" style={{ height: "calc(100vh - 80px)", overflowY: "auto", paddingBottom: "50px" }}>
      <div className="home-layout-header d-flex justify-content-between align-items-center mb-3">
        <h3>🏠 Home Layout</h3>
        {saving && <span className="badge bg-primary">Saving changes...</span>}
      </div>

      <Reorder.Group
        axis="y"
        values={sections}
        onReorder={setSections}
        onDragEnd={saveOrder}
        className="home-layout-list list-unstyled"
      >
        {sections.map((sec) => (
          <Reorder.Item
            key={sec._id}
            value={sec}
            className="home-layout-item card mb-2 shadow-sm"
            style={{ cursor: "grab" }}
          >
            <div className="card-body d-flex align-items-center justify-content-between p-3">
              <div className="home-layout-left d-flex align-items-center">
                <span className="drag-handle me-3" style={{ fontSize: "20px", color: "#ccc" }}>☰</span>
                <div className="d-flex flex-column">
                  <span className="section-type fw-bold">{sec.type}</span>
                  <span
                    className={`badge ${
                      sec.isActive ? "bg-success" : "bg-secondary"
                    } mt-1`}
                    style={{ width: "fit-content", fontSize: "10px" }}
                  >
                    {sec.isActive ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>
              </div>

              <button
                className={`btn btn-sm ${
                  sec.isActive ? "btn-outline-danger" : "btn-outline-success"
                }`}
                onClick={() => toggleSection(sec._id)}
              >
                {sec.isActive ? "Disable" : "Enable"}
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default HomeLayout;
