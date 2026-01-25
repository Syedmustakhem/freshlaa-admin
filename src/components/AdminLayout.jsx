import { useEffect } from "react";
import Sidebar from "./Sidebar";
import api from "../services/api";
import { urlBase64ToUint8Array } from "../utils/vapid";

export default function AdminLayout({ children }) {

  // 🔔 Ask notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 🔔 Enable sound + notification + push
  const enableNotificationsAndSound = async () => {
    try {
      // 🔊 Unlock sound
      window.__soundEnabled = true;
      const audio = new Audio("/notification.mp3");
      await audio.play();

      // 🔔 Request permission
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
      }

      // 🚀 Register push
      await registerAdminPush();

      console.log("✅ Notifications & sound enabled");
    } catch (err) {
      console.error("❌ Enable notification failed", err);
    }
  };

  // 🚀 Register admin push
  const registerAdminPush = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY
        ),
      });

      await api.post("/admin/push/subscribe", sub);
      console.log("✅ Admin push subscribed");
    } catch (err) {
      console.error("❌ Push subscription failed", err);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 p-4 bg-light min-vh-100">
        <button
          className="btn btn-sm btn-success mb-3"
          onClick={enableNotificationsAndSound}
        >
          Enable Notifications & Sound
        </button>

        {children}
      </div>
    </div>
  );
}
