import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

// ✅ IMPORT YOUR CUSTOM CSS (MISSING)
import "./index.css";

import * as serviceWorker from "./serviceWorker";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ⚠️ TEMPORARILY DISABLE SERVICE WORKER
serviceWorker.register();
