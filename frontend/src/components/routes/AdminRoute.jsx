import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const AdminRoute = ({ children }) => {
    const { user } = useAuth();

    if (user && user.role !== 'Admin') {
        // Redirect non-admin users to the home page or a "not authorized" page
        toast.error("Access Denied: You don't have permission to view this page.");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;