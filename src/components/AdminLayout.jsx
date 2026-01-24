import { useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {

  // 🔔 REQUEST NOTIFICATION PERMISSION ONCE
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-light min-vh-100">
        {children}
      </div>
    </div>
  );
}
