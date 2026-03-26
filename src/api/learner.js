import api from "./axiosInstance";

export const submitAssessment = (data) => api.post("/learner/assessment", data);

export const getProfile = () => api.get("/learner/profile");

export const getLessons = () => api.get("/learner/lessons");

export const startLesson = (lessonId) =>
  api.post("/learner/lesson/start", { lessonId });

export const getBlock = (lessonId, blockType, retryCount, hintCount, timeOnTaskSeconds) =>
  api.post("/learner/lesson/block", {
    lessonId,
    blockType,
    retryCount,
    hintCount,
    timeOnTaskSeconds,
  });

export const completeLesson = (lessonId, totalTimeOnTaskSeconds) =>
  api.post("/learner/lesson/complete", { lessonId, totalTimeOnTaskSeconds });

export const abandonLesson = (lessonId) =>
  api.post("/learner/lesson/abandon", { lessonId });

export const logAccessibilityToggle = (feature, enabled) =>
  api.post("/learner/accessibility/toggle", { feature, enabled });
