import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ REGISTER ONLY ADMIN SERVICE WORKER
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/admin-sw.js")
    .then(() => console.log("✅ Admin Service Worker registered"))
    .catch(err => console.error("SW error:", err));
}
