import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
      .then((res) => setCart(res.data.data || []))
      .catch(() => alert("Failed to load cart"));
  }, [id]);

  return (
    <AdminLayout>
      <h3 className="page-heading">User Cart</h3>

      {cart.length === 0 && (
        <div className="dashboard-card text-center text-muted py-5">
          Cart is empty
        </div>
      )}

      <div className="row">
        {cart.map((c, i) => (
          <div className="col-md-6" key={i}>
            <motion.div
              className="dashboard-card mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <h6 className="mb-2">
                {c.productId?.name || "Unknown Product"}
              </h6>

              <div className="text-muted small mb-2">
                Quantity: {c.quantity}
              </div>

              <div className="fw-semibold">
                Price: ₹{c.price}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
