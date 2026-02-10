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

  /* 🚫 Close mobile menu when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileOpen && !e.target.closest('.admin-sidebar') && !e.target.closest('.mobile-menu-btn')) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

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
      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div 
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

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
            <h5 className="page-title">FreshLaa Admin</h5>
          </div>

          <div className="topbar-actions">
            <NotificationBell />
            <button
              className="btn btn-success"
              onClick={enableNotificationsAndSound}
              style={{ whiteSpace: 'nowrap' }}
            >
              🔔 Enable Alerts
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