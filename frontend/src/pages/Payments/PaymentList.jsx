import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Modal from '../../components/common/Modal';
import PaymentForm from './PaymentForm';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';

const PaymentList = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/payments');
            setPayments(data);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchPayments();
    };

    const openDeleteConfirm = (payment) => {
        setPaymentToDelete(payment);
        setIsConfirmOpen(true);
    };

    const closeDeleteConfirm = () => {
        setPaymentToDelete(null);
        setIsConfirmOpen(false);
    };

    const handleDelete = async () => {
        if (!paymentToDelete) return;
        try {
            await api.delete(`/payments/${paymentToDelete.id}`);
            toast.success("Payment record deleted successfully!");
            fetchPayments();
        } catch (error) {
            console.error("Failed to delete payment:", error);
        } finally {
            closeDeleteConfirm();
        }
    };

    const columns = useMemo(() => [
        { header: 'Payment Date', accessor: 'paymentDate' },
        { header: 'Booking (Customer)', accessor: 'booking' },
        { header: 'Amount', accessor: 'amount' },
        { header: 'Method', accessor: 'paymentMethod' },
        { header: 'Notes', accessor: 'notes' },
        { header: 'Actions', accessor: 'actions' },
    ], []);

    return (
        <div>
            <PageHeader title="Payment Records">
                <Button onClick={handleOpenModal} variant="primary" className="flex items-center">
                    <FaPlus className="mr-2" /> Record New Payment
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
                                {columns.map(col => <th key={col.accessor} scope="col" className="px-6 py-3">{col.header}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{format(parseISO(payment.paymentDate), 'PPP p')}</td>
                                    <td className="px-6 py-4 font-medium">{payment.Booking?.eventType} <span className="text-gray-500 font-normal">({payment.Booking?.customer?.name})</span></td>
                                    <td className="px-6 py-4 font-bold text-green-600">Rs {parseFloat(payment.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">{payment.paymentMethod}</td>
                                    <td className="px-6 py-4">{payment.notes || '-'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => openDeleteConfirm(payment)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Record New Payment">
                <PaymentForm onSuccess={handleSuccess} onCancel={handleCloseModal} />
            </Modal>

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={closeDeleteConfirm}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete this payment record of Rs ${paymentToDelete ? parseFloat(paymentToDelete.amount).toLocaleString() : ''}? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default PaymentList;