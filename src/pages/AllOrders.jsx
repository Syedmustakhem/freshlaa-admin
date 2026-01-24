import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import socket from "../socket";

/* ---------------- STATUS COLOR ---------------- */
const statusColor = (status) => {
  switch (status) {
    case "Placed":
      return "secondary";
    case "Packed":
      return "warning";
    case "OutForDelivery":
      return "info";
    case "Delivered":
      return "success";
    case "Cancelled":
      return "danger";
    default:
      return "dark";
  }
};

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ---------------- HELPERS ---------------- */

  // 🔊 SOUND (browser safe)
  const playSound = () => {
    if (!window.__soundEnabled) return;
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  // 🔔 DESKTOP NOTIFICATION
  const showNotification = (order) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🛒 New Order Received", {
        body: `${order.userName || order.user?.name || "User"} • ₹${order.total}`,
        icon: order.items?.[0]?.image || "/logo.png",
      });
    }
  };

  /* ---------------- API ---------------- */

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch("/admin/orders/status", {
        orderId,
        status,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    fetchOrders();

    // 🔔 Ask notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // 🔊 Unlock sound after first click
    const enableSound = () => {
      window.__soundEnabled = true;
      document.removeEventListener("click", enableSound);
    };

    document.addEventListener("click", enableSound);
  }, []);

  /* ---------------- SOCKET LISTENERS ---------------- */

  useEffect(() => {
    socket.on("new-order", (order) => {
      console.log("🟢 New order received:", order);

      playSound();
      showNotification(order);
      fetchOrders(); // safest sync
    });

    socket.on("order-updated", ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status } : o
        )
      );
    });

    return () => {
      socket.off("new-order");
      socket.off("order-updated");
    };
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <AdminLayout>
      <h3 className="mb-3">All Orders</h3>

      {loading && <p>Loading orders...</p>}

      {!loading && (
        <div className="card">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Change</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td><small>{o._id}</small></td>

                  <td
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/admin/users/${o.user?._id}`)
                    }
                  >
                    <strong>{o.user?.name || "User"}</strong><br />
                    <small>{o.user?.phone}</small>
                  </td>

                  <td>₹{o.total}</td>

                  <td>
                    <span className={`badge bg-${statusColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>

                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={o.status}
                      onChange={(e) =>
                        updateStatus(o._id, e.target.value)
                      }
                    >
                      <option>Placed</option>
                      <option>Packed</option>
                      <option>OutForDelivery</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </td>

                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
