// src/context/AuthContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define user type
interface User {
  id: string;
  username: string;
  email: string;
  // Profile fields
  displayName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  favoriteGames?: string[];
  // Add more user properties as needed
}

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // Update profile function
  const updateProfile = async (profileData: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      // In a real app, you would make an API call to your backend here
      const response = await simulateAPICall({
        method: 'PUT',
        endpoint: `/api/users/${currentUser.id}/profile`,
        body: profileData
      });
      
      // Update user data with new profile info
      const updatedUser = { ...currentUser, ...response.user };
      
      // Save updated user to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call to your backend here
      // For demo purposes, we'll simulate a successful signup
      const response = await simulateAPICall({
        method: 'POST',
        endpoint: '/api/signup',
        body: { email, password, username }
      });
      
      const newUser = response.user;
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(newUser));
      setCurrentUser(newUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would make an API call to your backend here
      // For demo purposes, we'll simulate a successful login
      const response = await simulateAPICall({
        method: 'POST',
        endpoint: '/api/login',
        body: { usernameOrEmail, password }
      });
      
      const user = response.user;
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateProfile,
    loading,
    error,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to simulate API calls (remove this in production and use a real API)
async function simulateAPICall({ method, endpoint, body }: { 
  method: string, 
  endpoint: string, 
  body: any 
}) {
  return new Promise<any>((resolve, reject) => {
    setTimeout(() => {
      // For demo purposes, simulate success for specific endpoints
      if (endpoint === '/api/signup') {
        // Check if email is valid
        if (!body.email.includes('@')) {
          reject(new Error('Invalid email address'));
          return;
        }
        
        // Check if password is strong enough
        if (body.password.length < 6) {
          reject(new Error('Password must be at least 6 characters'));
          return;
        }
        
        resolve({
          user: {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            username: body.username,
            email: body.email,
            createdAt: new Date().toISOString()
          }
        });
      } else if (endpoint === '/api/login') {
        // For demo purposes, allow any login with valid format
        // In a real app, you would check credentials against your database
        if (body.password.length < 6) {
          reject(new Error('Invalid credentials'));
          return;
        }
        
        resolve({
          user: {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            username: body.usernameOrEmail.includes('@') ? body.usernameOrEmail.split('@')[0] : body.usernameOrEmail,
            email: body.usernameOrEmail.includes('@') ? body.usernameOrEmail : `${body.usernameOrEmail}@example.com`,
            createdAt: new Date().toISOString()
          }
        });
      } else if (endpoint.includes('/api/users/') && endpoint.includes('/profile')) {
        // Handle profile update
        resolve({
          user: {
            ...body,
            updatedAt: new Date().toISOString()
          }
        });
      } else {
        reject(new Error('Unknown endpoint'));
      }
    }, 800); // Simulate network delay
  });
}