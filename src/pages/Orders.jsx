import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import OrderDrawer from "../components/OrderDrawer";
import socket from "../socket";

const STATUS_MAP = {
  Placed: "Placed",
  Packed: "Packed",
  "Out for Delivery": "OutForDelivery",
  Delivered: "Delivered",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data.data || []);
    } catch {
      alert("Failed to load orders");
    }
  };

  // 🔊 SOUND (browser-safe)
  const playSound = () => {
    if (!window.__soundEnabled) return;
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchOrders();

    const enableSound = () => {
      window.__soundEnabled = true;
      document.removeEventListener("click", enableSound);
    };
    document.addEventListener("click", enableSound);
  }, []);

  // 🔥 SOCKET LISTENERS
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Admin socket connected");
    });

    socket.on("new-order", (order) => {
      playSound();

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🛒 New Order Received", {
          body: `${order.userName} • ₹${order.total}`,
          icon: order.items?.[0]?.image || "/logo.png",
        });
      }

      fetchOrders();
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

  // 🔄 UPDATE STATUS
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

  return (
    <AdminLayout>
      <h3 className="page-heading">Orders</h3>

      <motion.div
        className="dashboard-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Order</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <motion.tr
                  key={o._id}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                  onClick={() => setSelectedOrder(o)}
                  style={{ cursor: "pointer" }}
                >
                  <td>#{o._id.slice(-6)}</td>
                  <td>{o.user?.phone || "-"}</td>
                  <td>₹{o.total}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`status-select ${o.status.toLowerCase()}`}
                      value={o.status}
                      onChange={(e) =>
                        updateStatus(
                          o._id,
                          STATUS_MAP[e.target.value]
                        )
                      }
                    >
                      <option>Placed</option>
                      <option>Packed</option>
                      <option>Out for Delivery</option>
                      <option>Delivered</option>
                    </select>
                  </td>
                  <td>
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </AdminLayout>
  );
}
