import { motion } from "framer-motion";
import AdminLayout from "../components/AdminLayout";

export default function Banners() {
  return (
    <AdminLayout>
      <h3 className="page-heading">Banners</h3>

      <motion.div
        className="dashboard-card text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="banner-placeholder">
          <div className="banner-icon">🖼️</div>

          <h5>Banner Management</h5>
          <p className="text-muted">
            Manage homepage banners, promotional sliders, and featured
            campaigns from here.
          </p>

          <button
            className="btn btn-dark mt-3"
            disabled
          >
            Coming Soon
          </button>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
