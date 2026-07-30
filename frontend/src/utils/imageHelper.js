import api from '../services/api';

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  // Normalize legacy URLs that were stored as /uploads/... instead of /api/uploads/...
  let normalizedUrl = url;
  if (normalizedUrl.startsWith('/uploads/')) {
    normalizedUrl = `/api${normalizedUrl}`;
  }
  
  return `${api.defaults.baseURL}${normalizedUrl}`;
};
