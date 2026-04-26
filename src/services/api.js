import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://api.freshlaa.com/api",
});

/* 🔐 AUTO-ATTACH ADMIN TOKEN */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ FIXED
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
