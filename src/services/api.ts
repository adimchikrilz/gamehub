
// // Fix for api.ts
// // src/services/api.ts
// const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://eightbit-backend.onrender.com/api/v1';

// const api = {
//   async request(endpoint: string, options: RequestInit = {}) {
//     // Define the headers with proper typing
//     const headers: Record<string, string> = {
//       'Content-Type': 'application/json',
//       ...(options.headers as Record<string, string> || {}),
//     };

//     // Add auth token if available
//     const token = getCookie('__session') || "token";
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     // Final request options
//     const requestOptions: RequestInit = {
//       ...options,
//       headers,
//     };

//     // Make the request
//     try {
//       const response = await fetch(`${BASE_URL}${endpoint}`, requestOptions);
      
//       // Check if the response is ok (status in the range 200-299)
//       if (!response.ok) {
//         // Parse error response
//         const errorData = await response.json().catch(() => ({
//           message: `HTTP error! Status: ${response.status}`,
//         }));
        
//         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//       }
      
//       // For successful responses, try to parse as JSON
//       return await response.json();
//     } catch (error) {
//       console.error('API request failed:', error);
//       throw error;
//     }
//   },

//   // HTTP method wrappers
//   get(endpoint: string, options: RequestInit = {}) {
//     return this.request(endpoint, { ...options, method: 'GET' });
//   },
  
//   post(endpoint: string, data: any, options: RequestInit = {}) {
//     return this.request(endpoint, {
//       ...options,
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },
  
//   put(endpoint: string, data: any, options: RequestInit = {}) {
//     return this.request(endpoint, {
//       ...options,
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   },
  
//   delete(endpoint: string, options: RequestInit = {}) {
//     return this.request(endpoint, { ...options, method: 'DELETE' });
//   }
// };

// export default api;

// function getCookie(cname: string) {
//   const cookies = document.cookie.split(";")
//   const token = cookies.find(row => row.startsWith(cname + "="))?.split("=")[1];
//   console.log(token, cname, cookies)
//   return token
// }


// // api.ts - Configure axios interceptors for JWT
// import axios from 'axios';

// // Create API instance
// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Add request interceptor to include JWT token in headers
// api.interceptors.request.use(
//   config => {
//     const token = localStorage.getItem('authToken');
    
//     // Skip adding token for auth endpoints
//     const isAuthEndpoint = 
//       config.url?.includes('/auth/login') || 
//       config.url?.includes('/auth/register');
      
//     if (token && !token.startsWith('session_') && !isAuthEndpoint) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor to handle token errors
// api.interceptors.response.use(
//   response => {
//     return response;
//   },
//   error => {
//     // Handle 401 Unauthorized errors
//     if (error.response && error.response.status === 401) {
//       console.log('JWT token expired or invalid, logging out');
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('tokenCreatedAt');
//       localStorage.removeItem('username');
//       // You could redirect to login page here
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;


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