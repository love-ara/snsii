import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("snsi_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const is401 = error.response?.status === 401;
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");

    // Only auto-logout on 401 if it's NOT an auth endpoint
    if (is401 && !isAuthEndpoint) {
      localStorage.removeItem("snsi_token");
      localStorage.removeItem("snsi_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;