import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import Spinner from '../../components/common/Spinner';

const PaymentForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        bookingId: '',
        amount: '',
        paymentMethod: 'Cash',
        notes: ''
    });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingBookings, setLoadingBookings] = useState(true);

    const fetchBookings = useCallback(async () => {
        setLoadingBookings(true);
        try {
            const { data } = await api.get('/bookings');
            // Filter for bookings that are not fully paid
            const unpaidBookings = data.filter(b => b.status !== 'Cancelled' && b.balance > 0);
            setBookings(unpaidBookings);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoadingBookings(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, amount: parseFloat(formData.amount) };
            await api.post('/payments', payload);
            toast.success('Payment recorded successfully!');
            onSuccess();
        } catch (error) {
            console.error("Failed to save payment:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                 <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-1">Select Booking <span className="text-red-500">*</span></label>
                 <select id="bookingId" name="bookingId" value={formData.bookingId} onChange={handleChange} required className="input-field">
                    <option value="">{loadingBookings ? 'Loading bookings...' : 'Choose a booking to pay for'}</option>
                    {bookings.map(b => (
                        <option key={b.id} value={b.id}>
                            {b.eventType} ({b.customer.name}) on {format(parseISO(b.eventDate), 'MMM d')} - Balance: Rs {parseFloat(b.balance).toLocaleString()}
                        </option>
                    ))}
                 </select>
            </div>
            <FormInput label="Amount (Rs)" id="amount" type="number" min="1" step="0.01" value={formData.amount} onChange={handleChange} required />
            <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="input-field">
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="E-Sewa">E-Sewa</option>
                    <option value="Khalti">Khalti</option>
                    <option value="Cheque">Cheque</option>
                </select>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea id="notes" name="notes" rows="2" value={formData.notes} onChange={handleChange} className="input-field"></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="light" onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={loading || loadingBookings}>
                    {loading ? <Spinner size="5" /> : 'Record Payment'}
                </Button>
            </div>
        </form>
    );
};

export default PaymentForm;