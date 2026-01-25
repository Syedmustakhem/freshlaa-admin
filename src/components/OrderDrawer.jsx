import { motion } from "framer-motion";
import OrderTimeline from "./OrderTimeline";

export default function OrderDrawer({ order, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <motion.div
        className="order-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="drawer-header">
          <h5>Order Details</h5>
          <button className="btn-close" onClick={onClose} />
        </div>

        <div className="drawer-body">
          {/* Order Info */}
          <div className="drawer-section">
            <p>
              <strong>Order ID:</strong>{" "}
              <span className="text-muted">
                #{order._id.slice(-6)}
              </span>
            </p>
            <p>
              <strong>Total:</strong>{" "}
              <span className="order-total">₹{order.total}</span>
            </p>
          </div>

          {/* Timeline */}
          <div className="drawer-section">
            <OrderTimeline status={order.status} />
          </div>

          <hr />

          {/* Items */}
          <div className="drawer-section">
            <h6 className="section-title">Items</h6>

            {order.items.map((item, i) => (
              <div key={i} className="order-item">
                <div>
                  <strong>{item.name}</strong>
                  <div className="item-qty">
                    Qty: {item.qty}
                  </div>
                </div>

                <div className="item-price">
                  ₹{item.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
