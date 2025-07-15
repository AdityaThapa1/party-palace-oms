import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import Modal from '../../components/common/Modal';
import InventoryForm from '../Inventory/InventoryForm';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';

const StaffInventoryList = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/inventory');
            setInventory(data);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleOpenModal = (item = null) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchInventory();
    };

    const openDeleteConfirm = (item) => {
        setItemToDelete(item);
        setIsConfirmOpen(true);
    };

    const closeDeleteConfirm = () => {
        setItemToDelete(null);
        setIsConfirmOpen(false);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/inventory/${itemToDelete.id}`);
            toast.success("Inventory item deleted successfully!");
            fetchInventory();
        } catch (error) {
            console.error("Failed to delete item:", error);
        } finally {
            closeDeleteConfirm();
        }
    };

    const columns = useMemo(() => [
        { header: 'Item Name', accessor: 'itemName' },
        { header: 'Quantity', accessor: 'quantity' },
        { header: 'Unit', accessor: 'unit' },
        { header: 'Low Stock At', accessor: 'lowStockThreshold' },
        { header: 'Actions', accessor: 'actions' },
    ], []);

    return (
        <div>
            <PageHeader title="Inventory Management">
                <Button onClick={() => handleOpenModal()} variant="primary" className="flex items-center">
                    <FaPlus className="mr-2" /> Add New Item
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
                            {inventory.map(item => (
                                <tr key={item.id} className={`bg-white border-b hover:bg-gray-50 ${item.quantity <= item.lowStockThreshold ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4 font-medium flex items-center">
                                        {item.quantity <= item.lowStockThreshold && (
                                            <FaExclamationTriangle className="text-red-500 mr-2" title="Low Stock" />
                                        )}
                                        {item.itemName}
                                    </td>
                                    <td className="px-6 py-4 font-bold">{item.quantity}</td>
                                    <td className="px-6 py-4">{item.unit}</td>
                                    <td className="px-6 py-4">{item.lowStockThreshold}</td>
                                    <td className="px-6 py-4 flex items-center space-x-2">
                                        <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800"><FaEdit/></button>
                                        <button onClick={() => openDeleteConfirm(item)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     )}
                     {!loading && inventory.length === 0 && (
                        <p className="p-6 text-center text-gray-500">No inventory items found. Add one to get started!</p>
                     )}
                </div>
            </div>

            {isModalOpen && (
                 <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedItem ? "Edit Inventory Item" : "Add New Item"}>
                    <InventoryForm item={selectedItem} onSuccess={handleSuccess} onCancel={handleCloseModal} />
                </Modal>
            )}

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={closeDeleteConfirm}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the item '${itemToDelete?.itemName}'?`}
                confirmText="Delete"
            />
        </div>
    );
};

export default StaffInventoryList;