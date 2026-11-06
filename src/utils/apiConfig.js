/**
 * Centralized API Client Configuration
 * Supports dynamic backend URLs for Netlify (Frontend) + Render (Backend) deployment.
 */

// Get base URL from Vite environment variable (if deployed to Netlify with separate Render backend)
// Defaults to empty string or relative path so requests route through proxy or local dev server
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

/**
 * Helper to build full endpoint URL
 * @param {string} endpoint - e.g. '/api/weather' or '/api/v1/crops'
 * @returns {string} - Full URL formatted correctly
 */
export function getApiUrl(endpoint) {
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }
  return API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
}

/**
 * Standardized API Fetch Wrapper with Auth Headers
 * @param {string} endpoint 
 * @param {RequestInit} [options={}] 
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('agri_ai_token') || localStorage.getItem('aicrop_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If payload is FormData, do not set Content-Type header manually
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const url = getApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
