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
        order: sections.map((s, i) => ({
          id: s.id,
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
   <div className="home-layout-page container mt-4">
  <div className="home-layout-header">
    <h3>🏠 Home Layout</h3>
    {saving && <span className="saving-indicator">Saving…</span>}
  </div>

  <Reorder.Group
    axis="y"
    values={sections}
    onReorder={setSections}
    onDragEnd={saveOrder}
    className="home-layout-list"
  >
    {sections.map((sec) => (
      <Reorder.Item
        key={sec.id}
        value={sec}
        className="home-layout-item"
      >
        <div className="home-layout-left">
          <span className="drag-handle">☰</span>

          <span className="section-type">{sec.type}</span>

          <span
            className={`section-status ${
              sec.isActive ? "active" : "disabled"
            }`}
          >
            {sec.isActive ? "ACTIVE" : "DISABLED"}
          </span>
        </div>

        <button
          className={`section-action-btn ${
            sec.isActive ? "disable" : "enable"
          }`}
          onClick={() => toggleSection(sec.id)}
        >
          {sec.isActive ? "Disable" : "Enable"}
        </button>
      </Reorder.Item>
    ))}
  </Reorder.Group>
</div>

  );
}
