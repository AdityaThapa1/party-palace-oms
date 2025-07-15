import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

// Import all required components and constants
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import Spinner from '../../components/common/Spinner';
import MealPlanCard from '../../components/bookings/MealPlanCard';
import { MEAL_TYPES, MENU_DATA } from '../../constants/menu';
import { FaUtensils } from 'react-icons/fa';

/**
 * A comprehensive form for Admins/Staff to Create and Edit Bookings.
 */
const BookingForm = ({ booking, onSuccess, onCancel }) => {
    const isEditing = !!booking;
    const [customers, setCustomers] = useState([]);
    const getInitialState = () => ({
        customerId: '',
        eventType: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        guestCount: '',
        totalAmount: '',
        notes: '',
        status: 'Pending',
        mealPlan: {
            Lunch: { plan: 'None' },
            Snack: { plan: 'None' },
            Dinner: { plan: 'None' },
        },
    });
    
    const [formData, setFormData] = useState(getInitialState());
    const [loading, setLoading] = useState(false);

    // Fetch the list of customers for the dropdown menu when the component mounts.
    useEffect(() => {
        api.get('/customers')
            .then(res => setCustomers(res.data))
            .catch(() => toast.error("Could not fetch customer list."));
    }, []);

    // This effect runs when the `booking` prop changes, populating the form for editing.
    useEffect(() => {
        if (booking) {
            const initialMealPlan = getInitialState().mealPlan;
            let finalMealPlan = { ...initialMealPlan };

            // Safely parse the meal plan from the booking data.
            if (booking.mealPlan) {
                try {
                    const savedPlan = typeof booking.mealPlan === 'string' 
                        ? JSON.parse(booking.mealPlan) 
                        : booking.mealPlan;
                    
                    // Merge saved plan choices over the default structure.
                    finalMealPlan.Lunch = { plan: savedPlan.Lunch?.plan || initialMealPlan.Lunch.plan };
                    finalMealPlan.Snack = { plan: savedPlan.Snack?.plan || initialMealPlan.Snack.plan };
                    finalMealPlan.Dinner = { plan: savedPlan.Dinner?.plan || initialMealPlan.Dinner.plan };

                } catch (e) { console.error("Could not parse meal plan JSON:", e); }
            }
            
            setFormData({
                customerId: booking.customerId || '',
                eventType: booking.eventType || '',
                eventDate: booking.eventDate ? format(parseISO(booking.eventDate), 'yyyy-MM-dd') : '',
                startTime: booking.startTime || '',
                endTime: booking.endTime || '',
                guestCount: booking.guestCount || '',
                totalAmount: booking.totalAmount || '',
                notes: booking.notes || '',
                status: booking.status || 'Pending',
                mealPlan: finalMealPlan,
            });
        } else {
            setFormData(getInitialState());
        }
    }, [booking]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    /**
     * Correctly updates the nested meal plan state immutably.
     */
    const handleMealPlanChange = (mealType, field, value) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            mealPlan: {
                ...prevFormData.mealPlan,
                [mealType]: {
                    ...prevFormData.mealPlan[mealType],
                    [field]: value,
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const mealPlanWithItems = {};
        for (const mealType in formData.mealPlan) {
            const selection = formData.mealPlan[mealType];
            mealPlanWithItems[mealType] = {
                plan: selection.plan,
                items: selection.plan === 'None' ? [] : MENU_DATA[mealType].options[selection.plan] || []
            };
        }
        
        const payload = {
            ...formData,
            mealPlan: mealPlanWithItems,
            customerId: parseInt(formData.customerId),
            guestCount: parseInt(formData.guestCount),
            totalAmount: parseFloat(formData.totalAmount)
        };

        if (!payload.customerId) {
            toast.error("Please select a customer.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                await api.put(`/bookings/${booking.id}`, payload);
                toast.success('Booking updated successfully!');
            } else {
                await api.post('/bookings/admin', payload);
                toast.success('Booking created successfully!');
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save booking.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Customer</label>
                    <select id="customerId" name="customerId" value={formData.customerId} onChange={handleChange} required className="mt-1 block w-full input-field">
                        <option value="" disabled>-- Select a Customer --</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                    </select>
                </div>
                <FormInput label="Event Type" name="eventType" value={formData.eventType} onChange={handleChange} required/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput label="Event Date" name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} required />
                <FormInput label="Start Time" name="startTime" type="time" value={formData.startTime} onChange={handleChange} required />
                <FormInput label="End Time" name="endTime" type="time" value={formData.endTime} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="# of Guests" name="guestCount" type="number" min="1" value={formData.guestCount} onChange={handleChange} required/>
                <FormInput label="Total Amount (Rs)" name="totalAmount" type="number" min="0" value={formData.totalAmount} onChange={handleChange} required/>
            </div>
             
            <div className="pt-4">
                <h3 className="text-lg font-medium flex items-center mb-1"><FaUtensils className="mr-3 text-primary"/>Meal Plan</h3>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {MEAL_TYPES.map(mealType => (
                        <MealPlanCard
                            key={mealType}
                            mealType={mealType}
                            selectedPlan={formData.mealPlan[mealType]}
                            onPlanChange={handleMealPlanChange}
                        />
                    ))}
                </div>
            </div>
             
            <FormInput label="Notes" name="notes" value={formData.notes} onChange={handleChange} isTextarea/>
             
            {isEditing && (
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Booking Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full input-field">
                        <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
                    </select>
                </div>
            )}
             
            <div className="flex justify-end space-x-3 pt-5 border-t">
                <Button type="button" variant="light" onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <Spinner /> : (isEditing ? 'Update Booking' : 'Create Booking')}
                </Button>
            </div>
        </form>
    );
};

export default BookingForm;