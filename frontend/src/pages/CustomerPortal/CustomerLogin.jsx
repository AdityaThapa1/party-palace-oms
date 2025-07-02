import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';
import useAuth from '../../hooks/useAuth.js'; // Staff auth hook
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';

const CustomerLogin = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { customerLogin } = useCustomerAuth();
    const { logout: staffLogout, isAuthenticated: isStaffAuthenticated } = useAuth();

    useEffect(() => {
        if (isStaffAuthenticated) {
            staffLogout();
        }
    }, [isStaffAuthenticated, staffLogout]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await customerLogin({ phone, password });
        } catch (error) {
           // Interceptor handles the toast message
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
            <div className="text-center">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto" />
                <h2 className="mt-4 text-3xl font-bold text-dark">Customer Portal</h2>
            </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <input type="tel" placeholder="Your Phone Number (e.g., 98...)" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
                <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
                <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                    {isLoading ? <Spinner size="5" /> : 'Login to My Account'}
                </Button>
             </form>
             <div className="text-sm text-center text-gray-600">
                Don't have an account?{' '}
                <Link to="/customer/register" className="font-medium text-primary hover:underline">
                    Register Here
                </Link>
             </div>
             <div className="text-center pt-4 border-t">
                 <Link to="/staff/login" className="text-sm text-gray-500 hover:underline">Switch to Staff & Admin Login →</Link>
             </div>
          </div>
      </div>
    )
}

export default CustomerLogin;