import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import Spinner from '../../components/common/Spinner';

const InventoryForm = ({ item, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        itemName: '',
        quantity: '',
        unit: '',
        lowStockThreshold: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                itemName: item.itemName || '',
                quantity: item.quantity || '',
                unit: item.unit || '',
                lowStockThreshold: item.lowStockThreshold || ''
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { 
                ...formData,
                quantity: parseInt(formData.quantity, 10),
                lowStockThreshold: parseInt(formData.lowStockThreshold, 10)
            };

            if (item) {
                await api.put(`/inventory/${item.id}`, payload);
                toast.success('Item updated successfully!');
            } else {
                await api.post('/inventory', payload);
                toast.success('Item created successfully!');
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save item:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Item Name" id="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g., Plastic Chairs" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormInput label="Quantity" id="quantity" type="number" min="0" value={formData.quantity} onChange={handleChange} required />
                 <FormInput label="Unit of Measurement" id="unit" value={formData.unit} onChange={handleChange} placeholder="e.g., pcs, kgs, sets" required />
            </div>
             <FormInput label="Low Stock Threshold" id="lowStockThreshold" type="number" min="0" value={formData.lowStockThreshold} onChange={handleChange} required 
                title="The quantity at which you will be alerted for low stock."
            />
            
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="light" onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <Spinner size="5" /> : (item ? 'Update Item' : 'Add Item')}
                </Button>
            </div>
        </form>
    );
};

export default InventoryForm;