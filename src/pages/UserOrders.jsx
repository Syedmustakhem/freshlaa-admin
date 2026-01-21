import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      <h4>User Orders</h4>

      {orders.length === 0 && <p>No orders found</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Total</th>
            <th>Status</th>
            <th>Change</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>₹{o.total}</td>
              <td>
                <span className="badge bg-info">{o.status}</span>
              </td>
              <td>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  className="form-select form-select-sm"
                >
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="OutForDelivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
