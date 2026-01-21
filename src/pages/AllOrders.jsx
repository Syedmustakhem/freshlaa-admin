import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const statusColor = (status) => {
  switch (status) {
    case "Placed": return "secondary";
    case "Confirmed": return "primary";
    case "Packed": return "warning";
    case "OutForDelivery": return "info";
    case "Delivered": return "success";
    case "Cancelled": return "danger";
    default: return "dark";
  }
};

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
  try {
    await api.patch(
      "/admin/orders/status",
      {
        orderId: orderId,
        status: status,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    alert("Status updated");
    fetchOrders(); // reload orders
  } catch (err) {
    console.error(err);
    alert("Failed to update status");
  }
};


  useEffect(() => {
    fetchOrders();
  }, []);

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
                    onClick={() => navigate(`/admin/users/${o.user?._id}`)}
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
                      <option>Confirmed</option>
                      <option>Packed</option>
                      <option>OutForDelivery</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </td>

                  <td>
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
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
