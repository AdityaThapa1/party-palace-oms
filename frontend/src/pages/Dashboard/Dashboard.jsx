import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import StatCard from '../../components/common/StatCard';
import { FaBook, FaMoneyBillWave, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

// --- Imports for charts from your reference file ---
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format, subMonths, getMonth, getYear } from 'date-fns';

// Register Chart.js components. This must be done once for the chart to render.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    // Get the user object from the AuthContext to check their role
    const { user } = useAuth();
    
    // State hooks to manage dashboard data, loading state, and chart data
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    // Fetch dashboard summary data from the API when the component mounts
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const { data } = await api.get('/reports/dashboard-summary');
                setStats(data);

                // --- Chart Data Transformation Logic (from your reference) ---
                if (data.revenueByMonth && data.revenueByMonth.length > 0) {
                    const today = new Date();
                    const labels = [];
                    // 1. Generate labels for the last 6 months (e.g., "Jan", "Feb", ... "Jun")
                    for (let i = 5; i >= 0; i--) {
                        labels.push(format(subMonths(today, i), 'MMM'));
                    }
                    
                    // 2. Create a complete 6-month data array, initialized to zeros.
                    const dataPoints = new Array(6).fill(0);
                    
                    // 3. Create a map of the API data for quick lookup (e.g., { '2024-6': 120000 })
                    const revenueMap = new Map();
                    data.revenueByMonth.forEach(item => {
                        const key = `${item.year}-${item.month}`;
                        revenueMap.set(key, parseFloat(item.total));
                    });

                    // 4. Populate the dataPoints array using the revenueMap for the correct months.
                    for (let i = 5; i >= 0; i--) {
                        const targetDate = subMonths(today, i);
                        const year = getYear(targetDate);
                        const month = getMonth(targetDate) + 1; // getMonth is 0-indexed, so add 1
                        const key = `${year}-${month}`;

                        if (revenueMap.has(key)) {
                            const labelIndex = 5 - i;
                            dataPoints[labelIndex] = revenueMap.get(key);
                        }
                    }

                    // 5. Set the final, correctly formatted data state for the chart
                    setChartData({
                        labels,
                        datasets: [{
                            label: 'Monthly Revenue',
                            data: dataPoints,
                            fill: true,
                            borderColor: 'rgb(79, 70, 229)', // indigo-600
                            backgroundColor: 'rgba(79, 70, 229, 0.2)',
                            tension: 0.2,
                            pointBackgroundColor: 'rgb(79, 70, 229)',
                        }],
                    });
                }

            } catch (error) {
                console.error("Failed to fetch dashboard summary:", error);
                toast.error("Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []); // Empty dependency array ensures this runs only once

    // Display a spinner while data is being fetched
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-gray-500 mb-6">Here's a summary of your operations.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* --- Cards visible to ALL authenticated roles (Admin and Staff) --- */}
                <StatCard title="Total Bookings" value={stats?.totalBookings} icon={<FaBook />} color="bg-blue-500" />
                <StatCard title="Upcoming Events" value={stats?.upcomingEvents} icon={<FaCalendarAlt />} color="bg-indigo-500" />
                <StatCard title="Low Stock Alerts" value={stats?.lowStockItems} icon={<FaExclamationTriangle />} color="bg-red-500" />
                
                {/* --- ROLE-BASED CARD --- */}
                {/* This card will ONLY be rendered if the user's role is 'Admin'. Staff users will not see it. */}
                {user && user.role === 'Admin' && (
                    <StatCard 
                        title="Total Revenue" 
                        value={`Rs. ${parseFloat(stats?.totalRevenue || 0).toLocaleString()}`} 
                        icon={<FaMoneyBillWave />} 
                        color="bg-green-500" 
                    />
                )}
            </div>

            <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-dark">Revenue Trend (Last 6 Months)</h2>
                {/* Conditionally render the chart or a fallback message */}
                {chartData.labels.length > 0 && chartData.datasets[0]?.data.some(d => d > 0) ? (
                    <div className="h-64 md:h-80">
                         <Line 
                            data={chartData} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }, // Hide legend as per your reference
                                scales: { 
                                    y: { 
                                        ticks: { 
                                            // Format Y-axis ticks to be more readable (e.g., Rs. 50k)
                                            callback: value => `Rs. ${value/1000}k` 
                                        } 
                                    } 
                                }
                            }}
                        />
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-10">No recent revenue data available to display a chart.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;