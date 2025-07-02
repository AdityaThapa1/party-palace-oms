import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import StatCard from '../../components/common/StatCard';
import { FaBook, FaExclamationTriangle, FaCalendarAlt  } from 'react-icons/fa';
import Spinner from '../../components/common/Spinner';

const StaffDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const { data } = await api.get('/dashboard/staff');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard summary:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Welcome, {user?.name}!</h1>
            <p className="text-gray-500 mb-6">Here's a quick overview of today's operational status.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Bookings" value={stats?.totalBookings} icon={<FaBook />} color="bg-blue-500" />
                <StatCard title="Low Stock Alerts" value={stats?.lowStockItems} icon={<FaExclamationTriangle />} color="bg-red-500" />
                <StatCard title="Upcoming Events" value={stats?.upcomingEvents} icon={<FaCalendarAlt />} color="bg-indigo-500" />
            </div>

        </div>
    );
};

export default StaffDashboard;