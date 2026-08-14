import api from './api';

export const learningApi = {
  // Lessons
  getLessons: () => api.get('/api/admin/learning/lessons'),
  createLesson: (data) => api.post('/api/admin/learning/lessons', data),
  updateLesson: (lessonId, data) => api.put(`/api/admin/learning/lessons/${lessonId}`, data),
  deleteLesson: (lessonId) => api.delete(`/api/admin/learning/lessons/${lessonId}`),
  reorderLessons: (data) => api.post('/api/admin/learning/lessons/reorder', data),
  
  // Public Catalog
  getCatalog: () => api.get('/api/student/learning/catalog'),
  getLessonDetail: (lessonId) => api.get(`/api/student/learning/lessons/${lessonId}`),
  
  // Student Progress
  markLessonComplete: (lessonId, timeSpent) => api.post(`/api/student/learning/lessons/${lessonId}/complete`, { time_spent: timeSpent }),
  
  // AI Tutor
  askAITutor: (lessonId, prompt) => api.post(`/api/student/learning/lessons/${lessonId}/ai-tutor`, { prompt })
};
