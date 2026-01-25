import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setData(res.data.data);
    } catch {
      alert("Failed to load dashboard");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log("Admin app install available");
    });
  }, []);

  if (!data) {
    return (
      <AdminLayout>
        <p className="text-muted">Loading dashboard...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h3 className="page-heading">Dashboard Overview</h3>

      {/* METRIC CARDS */}
      <div className="dashboard-grid">
        <Metric title="Users" value={data.totalUsers} delay={0.05} />
        <Metric title="Orders" value={data.totalOrders} delay={0.1} />
        <Metric title="Revenue" value={`₹${data.totalRevenue}`} delay={0.15} />
        <Metric title="Today Orders" value={data.todayOrders} delay={0.2} />
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="dashboard-card">
        <h5 className="card-title">Orders by Status</h5>
        <ul className="status-list">
          {data.statusStats.map((s) => (
            <li key={s._id}>
              <span>{s._id}</span>
              <strong>{s.count}</strong>
            </li>
          ))}
        </ul>
      </div>

      {/* RECENT ORDERS */}
      <div className="dashboard-card">
        <h5 className="card-title">Recent Orders</h5>

        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Order</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6)}</td>
                  <td>{o.user?.name || o.user?.phone}</td>
                  <td>₹{o.total}</td>
                  <td>
                    <span className={`status-badge ${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ===== METRIC CARD ===== */
function Metric({ title, value, delay }) {
  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <h6>{title}</h6>
      <h2>{value}</h2>
    </motion.div>
  );
}
