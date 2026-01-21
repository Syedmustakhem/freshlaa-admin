import OrderTimeline from "./OrderTimeline";

export default function OrderDrawer({ order, onClose }) {
  return (
    <div className="order-drawer">
      <div className="drawer-header">
        <h5>Order Details</h5>
        <button className="btn-close" onClick={onClose} />
      </div>

      <div className="drawer-body">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Total:</strong> ₹{order.total}</p>

        <OrderTimeline status={order.status} />

        <hr />

        <h6>Items</h6>
        {order.items.map((item, i) => (
          <div key={i} className="mb-2">
            <strong>{item.name}</strong>
            <div>Qty: {item.qty}</div>
            <div>₹{item.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
