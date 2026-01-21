import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      .then(res => {
        const filtered = res.data.orders.filter(order =>
          order.items.some(i => i.restaurantId === id)
        );
        setOrders(filtered);
      })
      .catch(() => alert("Failed to load orders"));
  }, [id]);

  return (
    <AdminLayout>
      <h4 className="mb-3">Restaurant Orders</h4>

      <table className="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Total</th>
            <th>Status</th>
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
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
