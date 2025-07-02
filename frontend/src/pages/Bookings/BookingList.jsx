import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../../components/common/Modal';
import BookingForm from './BookingForm'; // Correctly named BookingForm to match the child component
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import useAuth from '../../hooks/useAuth';

const BookingList = () => {
    const { user } = useAuth(); // Get the logged-in user to check roles for permissions
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State management for the form modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // State management for the delete confirmation modal
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);

    // Fetch all bookings from the backend using a useCallback hook for efficiency
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/bookings');
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Modal and Action Handlers

    // Handles both Create (booking=null) and Edit (booking=object)
    const handleOpenModal = (booking = null) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    // Callback for when the form submits successfully
    const handleSuccess = () => {
        handleCloseModal();
        fetchBookings(); // Refresh the list to show new/updated data
    };

    // Prepares the delete action by opening a confirmation dialog
    const openDeleteConfirm = (booking) => {
        setBookingToDelete(booking);
        setIsConfirmOpen(true);
    };

    const closeDeleteConfirm = () => {
        setBookingToDelete(null);
        setIsConfirmOpen(false);
    };

    // Executes the delete operation after confirmation
    const handleDelete = async () => {
        if (!bookingToDelete) return;
        try {
            await api.delete(`/bookings/${bookingToDelete.id}`);
            toast.success("Booking deleted successfully!");
            fetchBookings(); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete booking.');
        } finally {
            closeDeleteConfirm();
        }
    };

    // Helper function for styling the status badges
    const getStatusChip = (status) => {
        const classes = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Confirmed': 'bg-green-100 text-green-800',
            'Completed': 'bg-blue-100 text-blue-800',
            'Cancelled': 'bg-red-100 text-red-800',
        };
        return `px-2 py-1 text-xs font-semibold rounded-full ${classes[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (
        <div>
            <PageHeader title="Event Bookings">
                <Button onClick={() => handleOpenModal()} variant="primary" className="flex items-center">
                    <FaPlus className="mr-2" /> New Booking
                </Button>
            </PageHeader>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                         <div className="flex justify-center items-center h-64"><Spinner /></div>
                    ) : (
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Event Type</th>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Event Date</th>
                                <th scope="col" className="px-6 py-3">Guests</th>
                                <th scope="col" className="px-6 py-3 text-right">Total (Rs)</th>
                                <th scope="col" className="px-6 py-3 text-right">Balance (Rs)</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{booking.eventType}</td>
                                    <td className="px-6 py-4 text-gray-700">{booking.customer?.name}</td>
                                    <td className="px-6 py-4 text-gray-700">{format(parseISO(booking.eventDate), 'PPP')}</td>
                                    <td className="px-6 py-4 text-center text-gray-700">{booking.guestCount}</td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-800">{parseFloat(booking.totalAmount).toLocaleString()}</td>
                                    <td className={`px-6 py-4 text-right font-semibold ${booking.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{parseFloat(booking.balance).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={getStatusChip(booking.status)}>{booking.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center space-x-3">
                                            {/* Users with Admin role can Edit and Delete */}
                                            {user.role === 'Admin' && (
                                                <>
                                                    <button onClick={() => handleOpenModal(booking)} className="text-indigo-600 hover:text-indigo-800" title="Edit Booking">
                                                        <FaEdit/>
                                                    </button>
                                                    <button onClick={() => openDeleteConfirm(booking)} className="text-red-600 hover:text-red-800" title="Delete Booking">
                                                        <FaTrash />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     )}
                     {!loading && bookings.length === 0 && (
                        <p className="p-10 text-center text-gray-500">No bookings have been made yet.</p>
                     )}
                </div>
            </div>

            {/* Modal for Creating or Editing a booking */}
            {isModalOpen && (
                 <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedBooking ? "Edit Booking Details" : "Create New Booking"}>
                    <BookingForm booking={selectedBooking} onSuccess={handleSuccess} onCancel={handleCloseModal} />
                </Modal>
            )}

            {/* Confirmation Modal for Deletion */}
            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={closeDeleteConfirm}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the booking for '${bookingToDelete?.customer?.name}' on ${bookingToDelete ? format(parseISO(bookingToDelete.eventDate), 'PPP') : ''}? This action cannot be undone.`}
                confirmText="Delete Booking"
            />
        </div>
    );
};

export default BookingList;