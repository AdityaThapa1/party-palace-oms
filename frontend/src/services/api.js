import axios from 'axios';
import toast from 'react-hot-toast';


const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('customer_token');
    
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Check if the server responded with an error status code.
    if (error.response) {
      // Check if the error is a 401 and if it happened on a login/register endpoint.
      const isAuthEndpoint = originalRequest.url.endsWith('/login') || originalRequest.url.endsWith('/register');
      
      if (error.response.status === 401 && isAuthEndpoint) {
          // This is a FAILED LOGIN ATTEMPT.
          // We show the error message from the backend but DO NOT redirect.
          // Let the login page component handle the UI state (e.g., stop the spinner).
          const message = error.response.data?.message || 'Invalid credentials.';
          toast.error(message);
          // We must reject the promise so the .catch() block or the login page will run.
          return Promise.reject(error);
      }
      
      // If the error is 401 but NOT from a login/register page, it's an EXPIRED SESSION.
      if (error.response.status === 401) {
        toast.error("Your session has expired. Please log in again.");

        // Check which type of session expired to redirect to the correct login page.
        const wasCustomerSession = !!localStorage.getItem('customer_token');
        
        // Clear all session data from local storage.
        localStorage.removeItem('token'); // staff token
        localStorage.removeItem('user'); // staff data
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_data');
        
        // Force a page redirect.
        if (wasCustomerSession) {
            window.location.href = '/customer/login';
        } else {
            window.location.href = '/staff/login';
        }
      } else {
        // Handle other server errors (e.g., 400, 404, 500) by showing the error message from the backend.
        const message = error.response.data?.message || 'An unexpected error occurred.';
        if (message) toast.error(message);
      }
    } else if (error.request) {
      // Handle cases where the request was made but no response was received (e.g., backend server is down).
      toast.error('Network Error: Could not connect to the server.');
    } else {
      // Handle other unknown errors.
      toast.error('An error occurred: ' + error.message);
    }

    // Always reject the promise for any error so that component-level .catch() blocks can execute if needed.
    return Promise.reject(error);
  }
);

export default api;