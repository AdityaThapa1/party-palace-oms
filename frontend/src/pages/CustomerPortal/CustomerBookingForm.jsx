import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUtensils, FaArrowLeft, FaMoneyBillWave } from 'react-icons/fa';
import { format, startOfToday } from 'date-fns';

// Required component imports
import api from '../../services/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import FormInput from '../../components/common/FormInput';
import MealPlanCard from '../../components/bookings/MealPlanCard';
import { MEAL_TYPES } from '../../constants/menu';


const CustomerBookingForm = () => {
    const { customer } = useCustomerAuth();
    const navigate = useNavigate();

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

    // Handlers
    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleMealPlanChange = (mealType, field, value) => {
        setFormData(prev => {
            const newMealPlanState = { ...prev.mealPlan };
            const updatedSelection = { ...newMealPlanState[mealType], [field]: value };
            newMealPlanState[mealType] = updatedSelection;
            return { ...prev, mealPlan: newMealPlanState };
        });
    };

    // Handles the form submission.
     
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.eventDate) {
            toast.error("Please select an event date.");
            return;
        }
        const selectedDate = new Date(`${formData.eventDate}T00:00:00`);
        const today = startOfToday();
        
        if (selectedDate < today) {
            toast.error("Event date cannot be in the past. Please choose a current or future date.");
            return; // Exit the function early
        }
        
        setLoading(true);
        const payload = { 
            ...formData, 
            guestCount: parseInt(formData.guestCount) || 0,
            totalAmount: parseFloat(formData.totalAmount) || 0 
        };

        try {
            await api.post('/bookings/customer', payload);
            toast.success('Your booking request has been sent!');
            navigate('/my-account');
        } catch (error) {
            toast.error(error.response?.data?.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancel = () => navigate('/my-account');

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-5xl mx-auto my-12">
            <div className="mb-6">
                <Link to="/my-account" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                    <FaArrowLeft className="mr-2" />
                    Back to My Bookings
                </Link>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="border-b pb-6">
                    <h2 className="text-2xl font-bold text-dark">Request a New Booking</h2>
                    <p className="mt-1 text-sm text-gray-500">Logged in as: <span className="font-medium text-primary">{customer?.name}</span></p>
                </div>
                
                <FormInput label="Event Type" name="eventType" value={formData.eventType} onChange={handleChange} required placeholder="e.g., Wedding, Birthday..."/>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Event Date" name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} required />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="Start Time" name="startTime" type="time" value={formData.startTime} onChange={handleChange} required />
                        <FormInput label="End Time" name="endTime" type="time" value={formData.endTime} onChange={handleChange} required />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Estimated Guests" name="guestCount" type="number" min="1" value={formData.guestCount} onChange={handleChange} required placeholder="e.g., 250" />
                    <FormInput label="Expected Budget (Rs)" name="totalAmount" type="number" min="0" value={formData.totalAmount} onChange={handleChange} placeholder="Optional" icon={<FaMoneyBillWave />} />
                </div>
                
                <div className="pt-4">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900 flex items-center"><FaUtensils className="mr-3 text-primary"/>Meal Plan</h3>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                       {MEAL_TYPES.map(mealType => (<MealPlanCard key={mealType} mealType={mealType} selectedPlan={formData.mealPlan[mealType]} onPlanChange={handleMealPlanChange}/>))}
                    </div>
                </div>

                <FormInput label="Special Notes" name="notes" value={formData.notes} onChange={handleChange} isTextarea />

                <div className="flex justify-end space-x-4 pt-5 border-t">
                    <Button type="button" variant="light" onClick={handleCancel} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? <Spinner /> : 'Request Booking'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CustomerBookingForm;