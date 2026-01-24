import { useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {

  // 🔔 REQUEST NOTIFICATION PERMISSION ONCE
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const enableNotificationsAndSound = () => {
    // 🔊 unlock sound
    window.__soundEnabled = true;

    const audio = new Audio("/notification.mp3");
    audio.play()
      .then(() => console.log("🔊 Sound unlocked"))
      .catch(err => console.error("Sound error:", err));

    // 🔔 force notification permission check
    if ("Notification" in window) {
      Notification.requestPermission().then(p => {
        console.log("Notification permission:", p);
      });
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 p-4 bg-light min-vh-100">
        
        {/* 🔔 Enable Notification Button */}
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
