

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
      
      // Store the token right after registration
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        
        // Add a timestamp for token creation
        localStorage.setItem('tokenCreatedAt', Date.now().toString());
        
        // Log successful registration (helpful for debugging)
        console.log('Registration successful', { username: userData.username });
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      // Rethrow with clear message for UI
      throw error instanceof Error 
        ? error 
        : new Error('Registration failed. Please try again.');
    }
  },

  // Login user
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store the token in localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        
        // Add a timestamp for token creation
        localStorage.setItem('tokenCreatedAt', Date.now().toString());
        
        // Log successful login (helpful for debugging)
        console.log('Login successful', { username: credentials.username });
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Rethrow with clear message for UI
      throw error instanceof Error 
        ? error 
        : new Error('Login failed. Please check your credentials.');
    }
  },

  // Get authenticated user info
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    try {
      // Check if token exists before making the request
      if (!localStorage.getItem('authToken')) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.get('/user/me');
      return response.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to fetch user data');
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenCreatedAt');
    localStorage.removeItem('userProfile');
    
    // Add any other cleanup needed
    console.log('User logged out');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const tokenCreatedAt = localStorage.getItem('tokenCreatedAt');
    
    if (!token) return false;
    
    // Optional: check token expiration
    if (tokenCreatedAt) {
      const createdAt = parseInt(tokenCreatedAt);
      const now = Date.now();
      const tokenAgeHours = (now - createdAt) / (1000 * 60 * 60);
      
      // If token is older than 24 hours, consider it expired
      // Adjust this based on your backend token expiration
      if (tokenAgeHours > 24) {
        console.log('Token expired, logging out');
        AuthService.logout();
        return false;
      }
    }
    
    return true;
  }
};

export default AuthService;