// src/services/authService.ts
import api from './api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    // Add any other user properties returned by your API
  };
}

const AuthService = {
  // Register a new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    }
  },

  // Login user
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    }
  },

  // Get authenticated user info
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    try {
      const response = await api.get('/get_authenticated_user');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user data');
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

export default AuthService;