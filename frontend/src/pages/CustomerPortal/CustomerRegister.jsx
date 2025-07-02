import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

const CustomerRegister = () => {
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        setIsLoading(true);
        try {
            await api.post('/customers/register', formData);
            toast.success("Registration successful! Please log in.");
            navigate('/customer/login');
        } catch (error) {
            // Interceptor handles toast
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-center text-3xl font-bold text-dark">Create Your Account</h2>
             <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleChange} className="input-field" />
                <input type="tel" name="phone" placeholder="Phone Number (e.g., 98...)" required value={formData.phone} onChange={handleChange} className="input-field" />
                <input type="email" name="email" placeholder="Email Address (Optional)" value={formData.email} onChange={handleChange} className="input-field" />
                <input type="password" name="password" placeholder="Password (min. 6 characters)" required value={formData.password} onChange={handleChange} className="input-field" />
                <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                    {isLoading ? <Spinner size="5" /> : 'Register'}
                </Button>
             </form>
             <p className="text-center text-sm text-gray-600">
                Already have an account? <Link to="/customer/login" className="font-medium text-primary hover:underline">Login Here</Link>
             </p>
          </div>
      </div>
    )
}

export default CustomerRegister;