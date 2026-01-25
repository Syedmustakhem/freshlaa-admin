import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

export default function UserAddresses() {
  const { id } = useParams();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    api
      .get(`/admin/users/${id}/addresses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      .then((res) => setAddresses(res.data.data || []))
      .catch(() => alert("Failed to load addresses"));
  }, [id]);

  return (
    <AdminLayout>
      <h3 className="page-heading">User Addresses</h3>

      {addresses.length === 0 && (
        <div className="dashboard-card text-center text-muted py-5">
          No addresses found
        </div>
      )}

      <div className="row">
        {addresses.map((a, i) => (
          <div className="col-md-6" key={i}>
            <motion.div
              className="dashboard-card mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <h6 className="mb-2">{a.name}</h6>

              <div className="text-muted small mb-2">
                📞 {a.phone}
              </div>

              <div>
                {a.address}, {a.city}, {a.state} –{" "}
                <strong>{a.pincode}</strong>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
