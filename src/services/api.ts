
// Fix for api.ts
// src/services/api.ts
const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://eightbit-backend.onrender.com/api/v1';

const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    // Define the headers with proper typing
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Final request options
    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    // Make the request
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, requestOptions);
      
      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        // Parse error response
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! Status: ${response.status}`,
        }));
        
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      // For successful responses, try to parse as JSON
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // HTTP method wrappers
  get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },
  
  post(endpoint: string, data: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put(endpoint: string, data: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};

export default api;