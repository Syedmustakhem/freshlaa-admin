import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function UserCart() {
  const { id } = useParams();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    api
      .get(`/admin/users/${id}/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      .then(res => setCart(res.data.data))
      .catch(() => alert("Failed to load cart"));
  }, [id]);

  return (
    <AdminLayout>
      <h4>User Cart</h4>

      {cart.length === 0 && <p>Cart is empty</p>}

      {cart.map((c, i) => (
        <div key={i} className="card p-3 mb-2">
          <p><strong>Product:</strong> {c.productId?.name}</p>
          <p><strong>Quantity:</strong> {c.quantity}</p>
          <p><strong>Price:</strong> ₹{c.price}</p>
        </div>
      ))}
    </AdminLayout>
  );
}
