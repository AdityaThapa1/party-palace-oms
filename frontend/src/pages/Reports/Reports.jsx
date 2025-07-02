import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import { FaFilePdf, FaFileCsv, FaBan, FaSpinner } from 'react-icons/fa';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Reports = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(null); 

    // Security check to ensure only Admins can see this page
    if (user.role !== 'Admin') {
        return (
            <div className="text-center p-12 bg-white rounded-lg shadow-md">
                 <FaBan className="mx-auto h-16 w-16 text-red-400" />
                <h2 className="mt-4 text-2xl font-semibold text-dark">Access Denied</h2>
                <p className="mt-2 text-gray-500">
                    This section is available for Admin users only.
                </p>
            </div>
        );
    }
    
    /**
     * Handles API call and file download process.
     * @param {string} reportType - The type of report (e.g., 'bookings', 'revenue').
     * @param {string} fileType - The file format ('pdf' or 'csv').
     */

    const handleDownload = async (reportType, fileType) => {
        const loadingKey = `${reportType}-${fileType}`;
        setLoading(loadingKey);

        try {
            const response = await api.get(`/reports/${reportType}?format=${fileType}`, {
                responseType: 'blob', // Important for file downloads
            });

            // Create a temporary URL for the downloaded file blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            // Create an invisible link element
            const link = document.createElement('a');
            link.href = url;
            
            // Generate and set the filename for the download prompt
            const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${fileType}`;
            link.setAttribute('download', filename);
            
            // Programmatically click the link to trigger download, then remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error(`Failed to download ${reportType} report:`, error);
            toast.error(`Could not generate the ${reportType} report.`);
        } finally {
            setLoading(null); // Clear loading state for the specific button
        }
    };

    return (
        <div>
            <PageHeader title="Generate Reports" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Bookings Report Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-dark mb-4">Bookings Report</h3>
                    <p className="text-sm text-gray-600 mb-6">A complete list of all bookings created in the system.</p>
                    <div className="flex space-x-2">
                        {/* CORRECTED: Pass the correct parameters to handleDownload */}
                        <Button onClick={() => handleDownload('bookings', 'pdf')} className="flex-1" variant="outline" disabled={!!loading}>
                           {loading === 'bookings-pdf' ? <FaSpinner className="animate-spin mr-2"/> : <FaFilePdf className="mr-2"/>} 
                           Download PDF
                        </Button>
                        <Button onClick={() => handleDownload('bookings', 'csv')} className="flex-1" variant="outline" disabled={!!loading}>
                           {loading === 'bookings-csv' ? <FaSpinner className="animate-spin mr-2"/> : <FaFileCsv className="mr-2"/>} 
                           Download CSV
                        </Button>
                    </div>
                </div>

                {/* Revenue Report Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-dark mb-4">Revenue Report</h3>
                    <p className="text-sm text-gray-600 mb-6">A detailed report of all payments received within a date range.</p>
                    <div className="flex space-x-2">
                        <Button onClick={() => handleDownload('revenue', 'pdf')} className="flex-1" variant="outline" disabled={!!loading}>
                           {loading === 'revenue-pdf' ? <FaSpinner className="animate-spin mr-2"/> : <FaFilePdf className="mr-2"/>} 
                           Download PDF
                        </Button>
                        <Button onClick={() => handleDownload('revenue', 'csv')} className="flex-1" variant="outline" disabled={!!loading}>
                           {loading === 'revenue-csv' ? <FaSpinner className="animate-spin mr-2"/> : <FaFileCsv className="mr-2"/>} 
                           Download CSV
                        </Button>
                    </div>
                </div>

                {/* Customers Report Card */}
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-dark mb-4">Customer Report</h3>
                    <p className="text-sm text-gray-600 mb-6">Export a list of customers with contact details and booking counts.</p>
                     <div className="flex space-x-2">
                         <Button onClick={() => handleDownload('customers', 'pdf')} className="flex-1" variant="outline" disabled={!!loading}>
                           {loading === 'customers-pdf' ? <FaSpinner className="animate-spin mr-2"/> : <FaFilePdf className="mr-2"/>} 
                           Download PDF
                         </Button>
                        <Button onClick={() => handleDownload('customers', 'csv')} className="flex-1" variant="outline" disabled={!!loading}>
                           {loading === 'customers-csv' ? <FaSpinner className="animate-spin mr-2"/> : <FaFileCsv className="mr-2"/>} 
                           Download CSV
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Reports;