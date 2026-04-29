// ✅ FIX: This file must be at src/services/api.js (lowercase 's')
// All pages import from "../services/api" (lowercase) but the folder was named
// "Services" (capital S). On Linux/case-sensitive filesystems this causes
// "Module not found" errors. Rename the folder: Services → services
//
// HOW TO FIX IN WEBSTORM:
//   Right-click the "Services" folder → Refactor → Rename → type "services" → Refactor

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/app",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});

// Add JWT token to every request automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // Don't send "guest-token" - it will be rejected by Spring Security
    if (token && token !== "guest-token") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method.toUpperCase()} → ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// Handle 401 Unauthorized globally
API.interceptors.response.use(
  (response) => {
    console.log(`[API] ← ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("[API] Error:", error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;
