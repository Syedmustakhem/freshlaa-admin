import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import AdminAvatar from "./AdminAvatar";
import api from "../services/api";
import { urlBase64ToUint8Array } from "../utils/vapid";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  /* 🔔 Ask notification permission once */
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  /* 🔔 Enable sound + push */
  const enableNotificationsAndSound = async () => {
    try {
      window.__soundEnabled = true;
      const audio = new Audio("/notification.mp3");
      await audio.play();

      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
      }

      await registerAdminPush();
    } catch (err) {
      console.error("Enable notification failed", err);
    }
  };

  /* 🚀 Register admin push */
  const registerAdminPush = async () => {
    if (!("serviceWorker" in navigator)) return;

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY
        ),
      });
    }

    await api.post("/admin/push/subscribe", {
      endpoint: sub.endpoint,
      keys: sub.keys,
    });
  };

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <Sidebar onClose={() => setMobileOpen(false)} />
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        {/* TOP BAR */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
            <h5 className="page-title">FreshLaa</h5>
          </div>

          <div className="topbar-actions">
            <NotificationBell />
            <button
              className="btn btn-sm btn-outline-success"
              onClick={enableNotificationsAndSound}
            >
              Enable Notifications
            </button>
            <AdminAvatar />
          </div>
        </header>

        {/* CONTENT */}
        <motion.main
          className="admin-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
