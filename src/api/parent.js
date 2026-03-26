import api from "./axiosInstance";

export const getLearnerProgress = (learnerId) =>
  api.get(`/parent/learner/${learnerId}/progress`);
