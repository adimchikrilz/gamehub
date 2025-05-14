// Fix for AuthContext.tsx

// First, we need to see what type of object AuthService.getCurrentUser() returns
// Update the useEffect block to properly handle the userData type

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/authService';

interface PlayerStats {
  played: number;
  wins: number;
  losses: number;
  totalPoints: number;
  currentRank: number;
}

// Modify the User interface to match what AuthService.getCurrentUser() returns
interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  stats: PlayerStats;
}

// Define what AuthService.getCurrentUser() actually returns
interface AuthUserData {
  id: string;
  username: string;
  email: string;
  // Add any other fields that might be returned
}

// Rest of the AuthContext remains the same
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(AuthService.isAuthenticated());

  // Default stats object to use if stats is missing
  const defaultStats: PlayerStats = {
    played: 0,
    wins: 0,
    losses: 0,
    totalPoints: 0,
    currentRank: 0,
  };

  // Fix the useEffect to handle the correct type for userData
  useEffect(() => {
    const fetchUser = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const userData = await AuthService.getCurrentUser() as AuthUserData;
          const savedProfile = localStorage.getItem('userProfile');
          const profileData = savedProfile ? JSON.parse(savedProfile) : {};
          
          // Ensure stats is properly merged - fixing the type error
          setCurrentUser({
            ...userData,
            ...profileData,
            stats: { 
              ...defaultStats, 
              // Type-safe access to stats (which might not exist in userData)
              ...((userData as any).stats || {}),
              ...(profileData.stats || {})
            }
          });
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          AuthService.logout();
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [defaultStats]);

  // Rest of the component remains the same
  const login = async (username: string, password: string) => {
    try {
      setError(null);
      const response = await AuthService.login({ username, password });
      const savedProfile = localStorage.getItem('userProfile');
      const profileData = savedProfile ? JSON.parse(savedProfile) : {};
      // Ensure stats is always present
      setCurrentUser({
        ...response.user,
        ...profileData,
        stats: { ...defaultStats, ...profileData.stats }, // response.user.stats is not available
      });
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      const response = await AuthService.register({ email, password, username });
      const savedProfile = localStorage.getItem('userProfile');
      const profileData = savedProfile ? JSON.parse(savedProfile) : {};
      // Ensure stats is always present
      setCurrentUser({
        ...response.user,
        ...profileData,
        stats: { ...defaultStats, ...profileData.stats }, // response.user.stats is not available
      });
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Optionally clear localStorage on logout
    // localStorage.removeItem('userProfile');
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }
    const updatedProfile = { ...currentUser, ...profileData };
    // Ensure stats is always present when updating profile
    updatedProfile.stats = { ...defaultStats, ...updatedProfile.stats };
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setCurrentUser(updatedProfile);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
