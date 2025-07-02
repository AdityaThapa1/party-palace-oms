import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // This useEffect correctly initializes the session on app load. No changes needed here.
  useEffect(() => {
    try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    } catch (error) { console.error("Failed to initialize auth state:", error); localStorage.clear(); }
    finally { setLoading(false); }
  }, []);

  /**
   * Logs in a Staff or Admin user and redirects them based on their role.
   */
  const login = async (credentials) => {
    try {
      // Clear any potential leftover customer session
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_data');

      // Make the login API call
      const { data } = await api.post('/auth/login', credentials);
      const { accessToken, ...userData } = data;
      
      // Store user data and token
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Update the auth state
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      
      // --- THIS IS THE CORRECTED REDIRECTION LOGIC ---

      // 1. Determine the correct default dashboard URL based on the user's role.
      let defaultPath = '/'; // A safe fallback
      if (userData.role === 'Admin') {
          defaultPath = '/dashboard'; // Admins go here
      } else if (userData.role === 'Staff') {
          defaultPath = '/staff/dashboard'; // Staff go here
      }

      // 2. Use the 'from' path if it exists, otherwise use our new role-based default path.
      const from = location.state?.from?.pathname || defaultPath;
      
      // 3. Navigate the user.
      navigate(from, { replace: true });

    } catch (error) {
      // Re-throw the error so the login form's `catch` block can handle it
      // and display a specific error toast to the user.
      throw error; 
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/staff/login');
  };

  // The value provided by the context
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;