import axios from 'axios';

// Load BASE_URL from environment variables
const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://eightbit-backend.onrender.com/api/v1';

// Create an axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Fixed syntax
      // Or use X-API-Key if required by your backend
      // config.headers['X-API-Key'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;