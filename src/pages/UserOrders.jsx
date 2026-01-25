import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function UserOrders() {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await api.get(`/admin/users/${id}/orders`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });
    setOrders(res.data.data || []);
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(
        "/admin/orders/status",
        { orderId, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchOrders();
    } catch {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [id]);

  return (
    <AdminLayout>
      <h3 className="page-heading">User Orders</h3>

      <motion.div
        className="dashboard-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {orders.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No orders found
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Change</th>
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
                      <select
                        value={o.status}
                        onChange={(e) =>
                          updateStatus(o._id, e.target.value)
                        }
                        className="form-select form-select-sm"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Packed">Packed</option>
                        <option value="OutForDelivery">
                          Out For Delivery
                        </option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>

                    <td>
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}
