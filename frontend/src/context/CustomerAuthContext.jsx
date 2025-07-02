import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.js';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    
    const storageKey = 'customer_token';
    const customerDataKey = 'customer_data';

    useEffect(() => {
        try {
            const storedCustomer = localStorage.getItem(customerDataKey);
            const token = localStorage.getItem(storageKey);
            if (storedCustomer && token) {
                setCustomer(JSON.parse(storedCustomer));
                // Do not set headers here, let the ProtectedRoute do it on page load
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const setAuthHeaders = (token) => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }

    const customerLogin = async (credentials) => {
        try {
            // Clearing any potential staff session before customer login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            const { data } = await api.post('/customers/login', credentials);
            localStorage.setItem(customerDataKey, JSON.stringify(data));
            localStorage.setItem(storageKey, data.accessToken);
            setAuthHeaders(data.accessToken);
            setCustomer(data);
            toast.success(`Welcome back, ${data.name}!`);
            
            const from = location.state?.from?.pathname || "/my-account"; 
            navigate(from, { replace: true });

        } catch (error) {
            console.error('Customer login attempt failed:', error.response?.data?.message || error.message);
        }
    };
    
    const customerLogout = () => {
        setCustomer(null);
        localStorage.removeItem(customerDataKey);
        localStorage.removeItem(storageKey);
        setAuthHeaders(null); 
        toast.success("You have been logged out.");
        navigate('/'); // Redirect to public home page on logout
    };

    const value = { customer, isCustomerAuthenticated: !!customer, customerLogin, customerLogout, loading, setAuthHeaders };

    return (
        <CustomerAuthContext.Provider value={value}>
            {!loading && children}
        </CustomerAuthContext.Provider>
    );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);