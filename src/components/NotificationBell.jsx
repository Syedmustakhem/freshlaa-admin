import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../socket";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef();

  // 🔔 Listen for notifications (socket / push trigger)
  useEffect(() => {
    socket.on("new-order", (order) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "New Order Received",
          message: `₹${order.total} • ${order.userName}`,
          read: false,
        },
        ...prev,
      ]);
    });

    return () => socket.off("new-order");
  }, []);

  // ❌ close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  return (
    <div className="notif-wrapper" ref={ref}>
      <button
        className="notif-bell"
        onClick={() => setOpen(!open)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="notif-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="notif-header">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <button onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>

            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${
                      n.read ? "read" : ""
                    }`}
                  >
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
