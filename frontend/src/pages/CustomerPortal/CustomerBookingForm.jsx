import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format, parseISO, startOfToday } from 'date-fns';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import FormInput from '../../components/common/FormInput';
import MealPlanCard from '../../components/bookings/MealPlanCard';
import { MEAL_TYPES, MENU_DATA } from '../../constants/menu'; 
import { FaMoneyBillWave } from 'react-icons/fa';

/**
 * A form for customers to create or edit their own booking requests.
 */
const CustomerBookingForm = ({ bookingToEdit, onSuccess, onCancel }) => {
    const isEditing = !!bookingToEdit;
    // Defines the initial state for a blank form
    const getInitialState = () => ({
        eventType: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        guestCount: '',
        totalAmount: '',
        notes: '',
        mealPlan: {
            Lunch: { plan: 'None', items: [] },
            Snack: { plan: 'None', items: [] },
            Dinner: { plan: 'None', items: [] },
        },
    });

    const [formData, setFormData] = useState(getInitialState());
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (isEditing) {
            let parsedMealPlan = bookingToEdit.mealPlan || getInitialState().mealPlan;
            try {
                // Safely parse the meal plan if it comes from the DB as a string
                if (typeof bookingToEdit.mealPlan === 'string') {
                    parsedMealPlan = { ...getInitialState().mealPlan, ...JSON.parse(bookingToEdit.mealPlan) };
                }
            } catch (e) {
                console.error("Error parsing meal plan from database:", e);
                toast.error("Could not load saved meal plan.");
            }

            setFormData({
                eventType: bookingToEdit.eventType || '',
                eventDate: bookingToEdit.eventDate ? format(parseISO(bookingToEdit.eventDate), 'yyyy-MM-dd') : '',
                startTime: bookingToEdit.startTime || '',
                endTime: bookingToEdit.endTime || '',
                guestCount: bookingToEdit.guestCount || '',
                totalAmount: bookingToEdit.totalAmount || '',
                notes: bookingToEdit.notes || '',
                mealPlan: parsedMealPlan,
            });
        } else {
            // If creating, reset to a blank form.
            setFormData(getInitialState());
        }
    }, [bookingToEdit, isEditing]);


    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

   
    const handleMealPlanChange = (mealType, field, value) => {
        setFormData(prev => {
            const newMealPlanState = { ...prev.mealPlan };
            // We only need to update the 'plan' selected by the user in the state
            const updatedSelection = { ...newMealPlanState[mealType], [field]: value };
            newMealPlanState[mealType] = updatedSelection;
            return { ...prev, mealPlan: newMealPlanState };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.eventDate || new Date(`${formData.eventDate}T00:00:00`) < startOfToday()) {
            toast.error("Event date must be today or a future date.");
            return;
        }

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
            guestCount: parseInt(formData.guestCount) || 0,
            totalAmount: parseFloat(formData.totalAmount) || 0,
            mealPlan: mealPlanWithItems, 
        };

        try {
            if (isEditing) {
                await api.put(`/bookings/customer/${bookingToEdit.id}`, payload);
                toast.success('Booking request updated!');
            } else {
                await api.post('/bookings/customer', payload);
                toast.success('Booking request sent!');
            }
            if (onSuccess) onSuccess(); // Signal parent to close modal & refresh
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save changes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-1">
            <FormInput label="Event Type" name="eventType" value={formData.eventType} onChange={handleChange} required placeholder="e.g., Wedding, Birthday..." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <FormInput label="Event Date" name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                     <FormInput label="Start Time" name="startTime" type="time" value={formData.startTime} onChange={handleChange} required />
                     <FormInput label="End Time" name="endTime" type="time" value={formData.endTime} onChange={handleChange} required />
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <FormInput label="Estimated Guests" name="guestCount" type="number" min="1" value={formData.guestCount} onChange={handleChange} required />
                 <FormInput label="Expected Budget (Rs)" name="totalAmount" type="number" min="0" value={formData.totalAmount} onChange={handleChange} placeholder="Optional" icon={<FaMoneyBillWave />} />
            </div>
            <div>
                 <h3 className="text-md font-medium text-gray-800 mb-2">Meal Plans</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {MEAL_TYPES.map(mealType => (<MealPlanCard key={mealType} mealType={mealType} selectedPlan={formData.mealPlan[mealType]} onPlanChange={handleMealPlanChange}/>))}
                </div>
            </div>
             <FormInput label="Special Notes" name="notes" value={formData.notes} onChange={handleChange} isTextarea />
            <div className="flex justify-end space-x-3 pt-5 border-t mt-8">
                <Button type="button" variant="light" onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={loading}>{loading ? <Spinner /> : (isEditing ? 'Update Request' : 'Submit Request')}</Button>
            </div>
        </form>
    );
};


export default CustomerBookingForm;