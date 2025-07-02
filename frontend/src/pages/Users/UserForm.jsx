import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import Spinner from '../../components/common/Spinner';

const UserForm = ({ user, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Staff'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                role: user.role || 'Staff'
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user && !formData.password) {
            toast.error("Password is required for new users.");
            return;
        }

        setLoading(true);
        try {
            let payload = { ...formData };
            if (user && !payload.password) {
                delete payload.password;
            }

            if (user) {
                await api.put(`/users/${user.id}`, payload);
                toast.success('User updated successfully!');
            } else {
                await api.post('/users', payload);
                toast.success('User created successfully!');
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save user:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Full Name" id="name" value={formData.name} onChange={handleChange} required />
            <FormInput label="Email Address" id="email" type="email" value={formData.email} onChange={handleChange} required />
            <FormInput 
                label={user ? "New Password (optional)" : "Password"}
                id="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange}
                required={!user} 
                placeholder={user ? "Leave blank to keep current password" : ""}
            />
            <div>
                 <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                 <select id="role" name="role" value={formData.role} onChange={handleChange} required className="input-field">
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                 </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="light" onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <Spinner size="5" /> : (user ? 'Update User' : 'Create User')}
                </Button>
            </div>
        </form>
    );
};

export default UserForm;