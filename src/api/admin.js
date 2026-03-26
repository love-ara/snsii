import api from "./axiosInstance";

export const getLearners = () => api.get("/admin/learners");

export const getAdaptationLogs = (userId) =>
  api.get(`/admin/learners/${userId}/adaptations`);

export const exportEvents = () =>
  api.get("/admin/export/events", { responseType: "blob" });

export const exportProgress = () =>
  api.get("/admin/export/progress", { responseType: "blob" });

export const exportAdaptations = () =>
  api.get("/admin/export/adaptations", { responseType: "blob" });
