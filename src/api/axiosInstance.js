import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("snsi_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler — clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const is401 = error.response?.status === 401;
    const isExcluded = url.includes("/export/") || 
                       url.includes("/auth/login") || 
                       url.includes("/auth/register");

    if (is401 && !isExcluded) {
      localStorage.removeItem("snsi_token");
      localStorage.removeItem("snsi_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
