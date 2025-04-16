import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

// Create a context with default values
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  loading: true
});

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Provide default values for server-side rendering
    return {
      isAuthenticated: false,
      user: null,
      login: () => {},
      logout: () => {},
      loading: true
    };
  }
  return context;
};

// Provider component that wraps your app and makes auth available
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if we're in the browser environment
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    // Only run this effect on the client side
    if (isBrowser) {
      // Check if user is stored in localStorage
      const storedUser = localStorage.getItem('bookpilot_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, [isBrowser]);

  // Login function
  const login = async (email) => {
    try {
      // In a real app, this would call an API
      const userData = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0]
      };
      
      // Store user in state and localStorage
      setUser(userData);
      if (isBrowser) {
        localStorage.setItem('bookpilot_user', JSON.stringify(userData));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    if (isBrowser) {
      localStorage.removeItem('bookpilot_user');
    }
    router.push('/auth/login');
  };

  // Memoized value of the authentication context
  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    loading
  };

  // Provide the authentication context to children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
