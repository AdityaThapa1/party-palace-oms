import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal'; // Ensure you have this component
import CustomerBookingForm from './CustomerBookingForm';
import { FaPlus, FaSignOutAlt, FaHome, FaEdit, FaTimesCircle } from 'react-icons/fa';

// A reusable layout wrapper for all customer-facing pages.
const CustomerLayout = ({ children }) => {
    const { customer, customerLogout } = useCustomerAuth();
    if (!customer) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
    
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <Link to="/" className="flex items-center text-xl font-bold text-primary hover:opacity-80 transition">
                       <FaHome className="mr-2" />
                       <span>Thapagaun Banquet</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <span className="hidden sm:inline text-gray-600">Welcome, {customer.name}</span>
                        <Button variant="light" size="sm" onClick={customerLogout}>
                            <FaSignOutAlt className="mr-2" /> Logout
                        </Button>
                    </div>
                </nav>
            </header>
            <main className="container mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
};


const CustomerDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // State management for the modal pop-up 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingToEdit, setBookingToEdit] = useState(null);

    // Data Fetching Logic
    const fetchMyBookings = useCallback(async () => {
        // We don't set loading true here, only on initial load.
        try {
            const { data } = await api.get('/customers/my-bookings'); 
            setBookings(data);
        } catch (error) {
            toast.error("Could not load your bookings.");
        } finally {
            // This ensures the main spinner only shows once on page load.
            if(loading) setLoading(false);
        }
    }, [loading]); // Only depend on 'loading' to prevent re-creating the function unnecessarily

    useEffect(() => {
        fetchMyBookings();
    }, [fetchMyBookings]); // This effect runs once on component mount


    // --- Handlers for Modal and Actions ---

    const handleCreateClick = () => {
        setBookingToEdit(null); // Clear any previous edit data
        setIsModalOpen(true);
    };

    const handleEditClick = (booking) => {
        setBookingToEdit(booking); // Pass the selected booking's data
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setBookingToEdit(null); // Clean up state on close
    };

    const handleSuccess = () => {
        handleCloseModal(); // Close the modal
        fetchMyBookings();  // Refresh the data in the table
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking request?")) {
            try {
                await api.delete(`/bookings/customer/${bookingId}`);
                toast.success("Booking cancelled successfully.");
                fetchMyBookings();
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to cancel booking.");
            }
        }
    };
    
    const getStatusChip = (status) => {
        const classes = { 'Pending': 'bg-yellow-100 text-yellow-800', 'Confirmed': 'bg-green-100 text-green-800', 'Completed': 'bg-blue-100 text-blue-800', 'Cancelled': 'bg-red-100 text-red-800' };
        return `px-2 py-1 text-xs font-semibold leading-tight rounded-full ${classes[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (
        <CustomerLayout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark">My Bookings</h2>
                <Button onClick={handleCreateClick} variant="primary">
                    <FaPlus className="mr-2"/> Request a New Booking
                </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md">
                {loading ? <div className="p-10 text-center"><Spinner /></div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-gray-600">
                                    <th className="p-4 font-semibold">Event</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{b.eventType}</td>
                                        <td className="p-4 text-gray-700">{format(parseISO(b.eventDate), 'PPP')}</td>
                                        <td className="p-4 text-center"><span className={getStatusChip(b.status)}>{b.status}</span></td>
                                        <td className="p-4 text-center">
                                            {b.status === 'Pending' && (
                                                <div className="flex justify-center items-center space-x-4">
                                                    <button onClick={() => handleEditClick(b)} className="text-indigo-600 hover:text-indigo-800" title="Edit Request"><FaEdit /></button>
                                                    <button onClick={() => handleCancelBooking(b.id)} className="text-red-600 hover:text-red-800" title="Cancel Request"><FaTimesCircle /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr><td colSpan="4" className="p-10 text-center text-gray-500">You haven't made any bookings yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {isModalOpen && (
                 <Modal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    title={bookingToEdit ? "Edit Your Booking Request" : "Request a New Booking"}
                >
                    <CustomerBookingForm 
                        bookingToEdit={bookingToEdit} 
                        onSuccess={handleSuccess}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            )}
        </CustomerLayout>
    );
};

export default CustomerDashboard;