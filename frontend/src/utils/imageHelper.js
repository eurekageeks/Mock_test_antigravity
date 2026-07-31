import api from '../services/api';

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:image')) return url;
  
  // Normalize legacy URLs that were stored as /uploads/... instead of /api/uploads/...
  // Also handle bare filenames without slashes
  let normalizedUrl = url;
  if (!normalizedUrl.includes('/')) {
    normalizedUrl = `/api/uploads/${normalizedUrl}`;
  } else if (normalizedUrl.startsWith('/uploads/')) {
    normalizedUrl = `/api${normalizedUrl}`;
  } else if (!normalizedUrl.startsWith('/')) {
    normalizedUrl = `/${normalizedUrl}`;
  }
  
  const baseUrl = api.defaults.baseURL || '';
  const finalBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${finalBaseUrl}${normalizedUrl}`;
};

export const processHtmlImages = (htmlContent) => {
  if (!htmlContent) return '';
  // Match src attributes with or without quotes: src="url", src='url', or src=url
  return htmlContent.replace(/<img\s+([^>]*?)src=(?:["']([^"']+)["']|([^ >]+))([^>]*)>/gi, (match, before, srcQuoted, srcUnquoted, after) => {
    const src = srcQuoted || srcUnquoted;
    return `<img ${before}src="${getImageUrl(src)}"${after}>`;
  });
};
