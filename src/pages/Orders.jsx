import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import OrderDrawer from "../components/OrderDrawer";
import { useEffect, useState } from "react";
import socket from "../socket";


const STATUS_MAP = {
  "Placed": "Placed",
  "Packed": "Packed",
  "Out for Delivery": "OutForDelivery",
  "Delivered": "Delivered",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setOrders(res.data.data || []);
    } catch {
      alert("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
     api.patch(
  "/admin/orders/status",
  { orderId, status },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  }
);


      // 🔥 realtime UI update
      setOrders(prev =>
        prev.map(o =>
          o._id === orderId ? { ...o, status } : o
        )
      );
    } catch (err) {
  console.error("UPDATE STATUS ERROR:", err.response?.data || err.message);
  alert(
    err.response?.data?.message ||
    "Failed to update status"
  );
}

  };

  return (
    <AdminLayout>
      <h3 className="mb-3">All Orders</h3>

      <div className="card">
        <table className="table mb-0">
          <thead className="table-light">
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(o => (
              <tr
                key={o._id}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedOrder(o)}
              >
                <td>{o._id.slice(-6)}</td>
                <td>{o.user?.phone || "-"}</td>
                <td>₹{o.total}</td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={o.status}
                    onChange={(e) =>
  updateStatus(o._id, STATUS_MAP[e.target.value])
}

                  >
                    <option value="Placed">Placed</option>
                    <option value="Packed">Packed</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </AdminLayout>
  );
}
