import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useDebounce from '../../hooks/useDebounce';

// Import all required components
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import CustomerForm from './CustomerForm'; // Make sure this is the correct path for your Admin-facing Customer form
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const CustomerList = () => {
    const { user } = useAuth(); // Needed to conditionally render admin-only actions
    
    // State management
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    // Debounce the search term to avoid firing API calls on every keystroke
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Data fetching logic
    const fetchCustomers = useCallback(async (searchQuery) => {
        setLoading(true);
        try {
            // Correct API endpoint for fetching all customers, with an optional search query
            const { data } = await api.get('/customers', {
                params: { search: searchQuery }
            });
            setCustomers(data);
        } catch (error) {
            toast.error("Failed to fetch customer data.");
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // --- The key useEffect for data fetching ---
    // This hook runs on the initial component mount and whenever the debounced search term changes.
    useEffect(() => {
        fetchCustomers(debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchCustomers]);

    // Handlers for modal windows and CRUD actions
    const handleOpenModal = (customer = null) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        // Refetch with the current search term to update the list
        fetchCustomers(debouncedSearchTerm);
    };

    const openDeleteConfirm = (customer) => {
        setCustomerToDelete(customer);
        setIsConfirmOpen(true);
    };
    
    const closeDeleteConfirm = () => {
        setIsConfirmOpen(false);
        setCustomerToDelete(null);
    };

    const handleDelete = async () => {
        if (!customerToDelete) return;
        try {
            await api.delete(`/customers/${customerToDelete.id}`);
            toast.success("Customer deleted successfully!");
            handleSuccess(); // Re-use success handler to close modal and refetch
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete customer.");
            closeDeleteConfirm();
        }
    };


    return (
        <div>
            <PageHeader title="Customer Management">
                {/* Admins can always add a new customer */}
                <Button onClick={() => handleOpenModal()} variant="primary">
                    <FaPlus className="mr-2" /> New Customer
                </Button>
            </PageHeader>

            <div className="mb-4 mt-6">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaSearch className="w-5 h-5 text-gray-400" /></span>
                    <input type="text" placeholder="Search by name, phone, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 block px-10 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? <div className="p-16 text-center"><Spinner /></div> : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Phone</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{customer.name}</td>
                                        <td className="px-6 py-4">{customer.phone}</td>
                                        <td className="px-6 py-4">{customer.email || 'N/A'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-3">
                                                <button onClick={() => handleOpenModal(customer)} className="text-indigo-600 hover:text-indigo-800" title="Edit Customer"><FaEdit /></button>
                                                <button onClick={() => openDeleteConfirm(customer)} className="text-red-600 hover:text-red-800" title="Delete Customer"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!loading && customers.length === 0 && (
                        <p className="p-10 text-center text-gray-500">
                            {debouncedSearchTerm ? 'No customers match your search.' : 'No customers have been added yet.'}
                        </p>
                    )}
                </div>
            </div>

            {isModalOpen && (
                 <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedCustomer ? "Edit Customer Details" : "Create New Customer"}>
                    <CustomerForm customer={selectedCustomer} onSuccess={handleSuccess} onCancel={handleCloseModal} />
                </Modal>
            )}

            {isConfirmOpen && (
                <ConfirmModal isOpen={isConfirmOpen} onClose={closeDeleteConfirm} onConfirm={handleDelete} title="Confirm Deletion"
                    message={`Are you sure you want to delete '${customerToDelete?.name}'?`}
                />
            )}
        </div>
    );
};

export default CustomerList;