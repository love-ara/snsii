import api from "./axiosInstance";

export const register = (data) => api.post("/api/auth/register", data);

export const login = (email, password) =>
  api.post("/api/auth/login", { email, password });

export const deleteAccount = () => api.delete("/auth/account");
