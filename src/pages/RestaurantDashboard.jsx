import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function RestaurantOrders() {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get("/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      .then((res) => {
        const filtered = res.data.orders.filter((order) =>
          order.items.some((i) => i.restaurantId === id)
        );
        setOrders(filtered);
      })
      .catch(() => alert("Failed to load orders"));
  }, [id]);

  return (
    <AdminLayout>
      <h3 className="page-heading">Restaurant Orders</h3>

      <motion.div
        className="dashboard-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Order</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6)}</td>
                  <td>₹{o.total}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        o.status === "Delivered"
                          ? "completed"
                          : o.status === "Cancelled"
                          ? "cancelled"
                          : "pending"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    No orders found for this restaurant
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
