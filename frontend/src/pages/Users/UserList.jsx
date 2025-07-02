import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../../components/common/Modal';
import UserForm from './UserForm';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';

const UserList = () => {
    const { user: loggedInUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user = null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchUsers();
    };

    const openDeleteConfirm = (user) => {
        if (user.id === loggedInUser.id) {
            toast.error("You cannot delete your own account.");
            return;
        }
        setUserToDelete(user);
        setIsConfirmOpen(true);
    };

    const closeDeleteConfirm = () => {
        setUserToDelete(null);
        setIsConfirmOpen(false);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete.id}`);
            toast.success("User deleted successfully!");
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
        } finally {
            closeDeleteConfirm();
        }
    };
    
    return (
        <div>
            <PageHeader title="User Management">
                <Button onClick={() => handleOpenModal()} variant="primary" className="flex items-center">
                    <FaPlus className="mr-2" /> Add New User
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
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center space-x-2">
                                        <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-800"><FaEdit/></button>
                                        <button onClick={() => openDeleteConfirm(user)} className="text-red-600 hover:text-red-800" disabled={user.id === loggedInUser.id}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     )}
                </div>
            </div>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedUser ? "Edit User" : "Create New User"}>
                    <UserForm user={selectedUser} onSuccess={handleSuccess} onCancel={handleCloseModal} />
                </Modal>
            )}

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={closeDeleteConfirm}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the user '${userToDelete?.name}'?`}
                confirmText="Delete"
            />
        </div>
    );
};

export default UserList;