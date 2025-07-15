import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import BookingForm from '../Bookings/BookingForm'; 
import { FaPlus, FaEye } from 'react-icons/fa';

const StaffBookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/bookings/staff');
            setBookings(data);
        } catch (error) { toast.error('Failed to fetch bookings.'); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const handleOpenModal = (booking = null) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchBookings();
    };

    const getStatusChip = (status) => { /* ... unchanged ... */ };
    
    return (
        <div>
            <PageHeader title="View All Bookings">
                <Button onClick={() => handleOpenModal()} variant="primary">
                    <FaPlus className="mr-2" /> Create Booking
                </Button>
            </PageHeader>
            <div className="bg-white rounded-lg shadow-md mt-6 overflow-hidden">
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
                                    <th scope="col" className="px-6 py-3 text-center">Guests</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount (Rs)</th>
                                    <th scope="col" className="px-6 py-3 text-center">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length > 0 ? (
                                    bookings.map(booking => (
                                        <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{booking.eventType}</td>
                                            <td className="px-6 py-4">{booking.customer?.name}</td>
                                            <td className="px-6 py-4">{format(parseISO(booking.eventDate), 'PPP')}</td>
                                            <td className="px-6 py-4 text-center">{booking.guestCount}</td>
                                            <td className="px-6 py-4 text-right font-medium">{parseFloat(booking.totalAmount).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center"><span className={getStatusChip(booking.status)}>{booking.status}</span></td>
                                            <td className="px-6 py-4 text-center">
                                                <Button variant="icon" size="sm" onClick={() => handleOpenModal(booking)} title="View Details">
                                                    <FaEye />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-10 text-center text-gray-500">No bookings have been made yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                 <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedBooking ? "Booking Details" : "Create New Booking"}>
                    <BookingForm booking={selectedBooking} onSuccess={handleSuccess} onCancel={handleCloseModal} isReadOnly={!!selectedBooking} />
                 </Modal>
            )}
        </div>
    );
};

export default StaffBookingList;