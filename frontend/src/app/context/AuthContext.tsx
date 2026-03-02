import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      // Verify token is still valid by fetching user
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (authToken) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }
      const response = await fetch(
        `${apiUrl}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(authToken);
      } else {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }
      const response = await fetch(
        `${apiUrl}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password, confirmPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }
      const response = await fetch(
        `${apiUrl}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const loginWithGoogle = async (googleId, name, email, profileImage) => {
    try {
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }
      const response = await fetch(
        `${apiUrl}/auth/google`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ googleId, name, email, profileImage }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const loginWithFacebook = async (facebookId, name, email, profileImage) => {
    try {
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }
      const response = await fetch(
        `${apiUrl}/auth/facebook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ facebookId, name, email, profileImage }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Facebook login failed');
      }

      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    register,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
