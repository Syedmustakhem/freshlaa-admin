import { useEffect, useState } from "react";
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

    // Optional: show your own install button
    console.log("Admin app install available");
  });
}, []);

  if (!data) {
    return (
      <AdminLayout>
        <p>Loading dashboard...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h3 className="mb-4">Dashboard</h3>

      {/* METRIC CARDS */}
      <div className="row mb-4">
        <Metric title="Users" value={data.totalUsers} />
        <Metric title="Orders" value={data.totalOrders} />
        <Metric title="Revenue" value={`₹${data.totalRevenue}`} />
        <Metric title="Today Orders" value={data.todayOrders} />
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="card mb-4">
        <div className="card-header">Orders by Status</div>
        <ul className="list-group list-group-flush">
          {data.statusStats.map((s) => (
            <li className="list-group-item d-flex justify-content-between" key={s._id}>
              <span>{s._id}</span>
              <strong>{s.count}</strong>
            </li>
          ))}
        </ul>
      </div>

      {/* RECENT ORDERS */}
      <div className="card">
        <div className="card-header">Recent Orders</div>
        <table className="table mb-0">
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
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

/* METRIC CARD */
function Metric({ title, value }) {
  return (
    <div className="col-md-3">
      <div className="card text-center">
        <div className="card-body">
          <h6 className="text-muted">{title}</h6>
          <h3>{value}</h3>
        </div>
      </div>
    </div>
  );
}
