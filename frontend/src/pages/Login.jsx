import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth.js';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx'; // Import customer context
import { FaUser, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login: staffLogin } = useAuth();
    const { customerLogout, isCustomerAuthenticated } = useCustomerAuth(); // Get customer logout function

    // Log out any logged-in customer when visiting this page
    useEffect(() => {
        if (isCustomerAuthenticated) {
            customerLogout();
        }
    }, [isCustomerAuthenticated, customerLogout]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await staffLogin({ email, password });
            // The AuthContext will handle navigation on success.
        } catch (error) {
            // Error is handled by the API interceptor toast.
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-light">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
                <div className="text-center">
                    <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto" />
                    <h2 className="mt-6 text-3xl font-bold text-dark">
                        Staff & Admin Portal
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaUser className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            id="email-address" name="email" type="email" autoComplete="email" required
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="input-field pl-10" placeholder="Email address"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaLock className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            id="password" name="password" type="password" autoComplete="current-password" required
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="input-field pl-10" placeholder="Password"
                        />
                    </div>
                    
                    <div>
                        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                            {isLoading ? <Spinner size="5" /> : 'Sign In'}
                        </Button>
                    </div>
                </form>
                 <div className="text-center pt-4 border-t">
                     <Link to="/customer/login" className="text-sm text-gray-500 hover:underline">Switch to Customer Login →</Link>
                 </div>
            </div>
        </div>
    );
};

export default Login;