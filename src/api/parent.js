import api from "./axiosInstance";

export const getLearnerProgress = (learnerEmail) =>
  api.get(`/parent/learner/${learnerEmail}/progress`);
