import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import Spinner from '../../components/common/Spinner';

/**
 * A form specifically for Creating and Editing Customer details.
 */
const CustomerForm = ({ customer, onSuccess, onCancel }) => {
    const isEditing = !!customer;

    const getInitialState = () => ({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    const [formData, setFormData] = useState(getInitialState());
    const [loading, setLoading] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: customer.name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                address: customer.address || '',
            });
        } else {
            setFormData(getInitialState());
        }
    }, [customer, isEditing]);


    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        if (!formData.name || !formData.phone) {
            toast.error("Name and Phone are required fields.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                // Use the generic /customers/:id endpoint for updating
                await api.put(`/customers/${customer.id}`, formData);
                toast.success('Customer updated successfully!');
            } else {
                // Use the generic /customers endpoint for creating
                await api.post('/customers', formData);
                toast.success('Customer added successfully!');
            }
            if (onSuccess) onSuccess(); // Trigger parent to close modal and refresh
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save customer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
                <FormInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} isTextarea />

            <div className="flex justify-end space-x-3 pt-5 border-t">
                <Button type="button" variant="light" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <Spinner /> : (isEditing ? 'Update Customer' : 'Add Customer')}
                </Button>
            </div>
        </form>
    );
};

export default CustomerForm;