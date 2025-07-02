import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';
import Spinner from '../common/Spinner.jsx';

const CustomerProtectedRoute = ({ children }) => {
    const { isCustomerAuthenticated, loading, setAuthHeaders } = useCustomerAuth();
    const location = useLocation();
    React.useEffect(() => {
        const token = localStorage.getItem('customer_token');
        if (isCustomerAuthenticated && token) {
            setAuthHeaders(token);
        }
    }, [isCustomerAuthenticated, setAuthHeaders]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen"><Spinner /></div>
        );
    }

    // If loading is finished and the user is NOT authenticated, redirect them to the login page.
    if (!isCustomerAuthenticated) {
        return <Navigate to="/customer/login" state={{ from: location }} replace />;
    }
    return children;
};

export default CustomerProtectedRoute;