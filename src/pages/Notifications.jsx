import { useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

export default function Notifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const sendNotification = async () => {
    setLoading(true);
    try {
      await api.post("/admin/notifications/send", { title, body });
      alert("Notification sent!");
      setTitle("");
      setBody("");
    } catch {
      alert("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h3 className="page-heading">Push Notifications</h3>

      <motion.div
        className="dashboard-card notification-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-muted mb-4">
          Send a push notification to all subscribed admin devices.
        </p>

        <div className="mb-3">
          <label className="form-label small">Title</label>
          <input
            className="form-control"
            placeholder="New order received"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label small">Message</label>
          <textarea
            className="form-control"
            placeholder="Order #1234 has been placed"
            rows="4"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <button
          className="btn btn-dark px-4"
          disabled={loading || !title || !body}
          onClick={sendNotification}
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </motion.div>
    </AdminLayout>
  );
}
