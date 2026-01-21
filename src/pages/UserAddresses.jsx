import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      .then(res => setAddresses(res.data.data))
      .catch(() => alert("Failed to load addresses"));
  }, [id]);

  return (
    <AdminLayout>
      <h4>User Addresses</h4>

      {addresses.length === 0 && <p>No addresses found</p>}

      {addresses.map((a, i) => (
        <div key={i} className="card p-3 mb-2">
          <p><strong>Name:</strong> {a.name}</p>
          <p><strong>Phone:</strong> {a.phone}</p>
          <p>
            {a.address}, {a.city}, {a.state} - {a.pincode}
          </p>
        </div>
      ))}
    </AdminLayout>
  );
}
