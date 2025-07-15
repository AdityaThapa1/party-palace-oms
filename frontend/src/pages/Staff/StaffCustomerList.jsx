import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce'; 
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import { FaSearch } from 'react-icons/fa';


const StaffCustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Debounce search term to prevent excessive API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch customers with the debounced search term
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            // Staff uses the same endpoint as admin to get the customer list
            const { data } = await api.get(`/customers?search=${debouncedSearchTerm}`);
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            // In a real app, a toast notification might go here
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Phone Number', accessor: 'phone' },
        { header: 'Email', accessor: 'email' },
        { header: 'Address', accessor: 'address' },
    ];

    return (
        <div>
            <PageHeader title="Customer Directory" />

            <div className="mb-4 mt-6">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaSearch className="w-5 h-5 text-gray-400" />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search by name, phone, or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 block px-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
            </div>

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
                            {customers.map(customer => (
                                <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                                    <td className="px-6 py-4">{customer.phone}</td>
                                    <td className="px-6 py-4">{customer.email || 'N/A'}</td>
                                    <td className="px-6 py-4">{customer.address || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     )}
                     {!loading && customers.length === 0 && (
                        <p className="p-10 text-center text-gray-500">No customers found for your search criteria.</p>
                     )}
                </div>
            </div>

        </div>
    );
};

export default StaffCustomerList;