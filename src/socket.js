// src/socket.js  (admin panel)
// ─── Singleton socket client for the admin panel ─────────────────────────────
import { io } from "socket.io-client";

const SOCKET_URL = "https://api.freshlaa.com"; // no /api suffix

let socket = null;

const getAdminToken = () => localStorage.getItem("adminToken") || "";

export const connectAdminSocket = () => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports:            ["websocket", "polling"], // fallback to polling if websocket blocked
    auth:                  { token: getAdminToken() },
    reconnection:          true,
    reconnectionDelay:     1500,
    reconnectionAttempts:  10,
    timeout:               10000,
  });

  socket.on("connect",       () => console.log("🟢 Admin socket connected:", socket.id));
  socket.on("disconnect",    (r) => console.log("🔴 Admin socket disconnected:", r));
  socket.on("connect_error", (e) => console.log("🔴 Admin socket error:", e.message));

  return socket;
};

export const disconnectAdminSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const getAdminSocket = () => socket;

// Default export for backward compat (used as `import socket from "../socket"`)
// Returns the raw socket instance — connect first via connectAdminSocket()
export default {
  on:  (event, cb) => { connectAdminSocket().on(event, cb); },
  off: (event, cb) => { if (socket) socket.off(event, cb); },
  emit:(event, data) => { connectAdminSocket().emit(event, data); },
  get connected() { return socket?.connected || false; },
};