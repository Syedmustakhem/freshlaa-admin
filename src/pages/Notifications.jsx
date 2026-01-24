import { useState } from "react";
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
      <h3>Send Push Notification</h3>

      <div className="card p-4 mt-3">
        <input
          className="form-control mb-3"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          className="form-control mb-3"
          placeholder="Message"
          rows="3"
          value={body}
          onChange={e => setBody(e.target.value)}
        />

        <button
          className="btn btn-dark"
          disabled={loading}
          onClick={sendNotification}
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </div>
    </AdminLayout>
  );
}
