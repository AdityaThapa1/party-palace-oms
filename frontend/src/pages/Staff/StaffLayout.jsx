import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { FaSignOutAlt } from 'react-icons/fa';
import { RxDashboard, RxCalendar, RxCube, RxPerson } from 'react-icons/rx';

const StaffSidebar = () => {
    const baseLinkClasses = "flex items-center px-4 py-2.5 text-gray-300 hover:bg-blue-900/50 hover:text-white rounded-md transition duration-200";
    const activeLinkClasses = "bg-primary text-white font-semibold";
    
    const navItems = [
      { to: "/staff/dashboard", icon: <RxDashboard className="mr-3" />, text: "Dashboard" },
      { to: "/staff/bookings", icon: <RxCalendar className="mr-3" />, text: "Bookings" },
      { to: "/staff/customers", icon: <RxPerson className="mr-3" />, text: "Customers" },
      { to: "/staff/inventory", icon: <RxCube className="mr-3" />, text: "Inventory" },
    ];
    
    const getNavLinkClass = ({isActive}) => isActive ? `${baseLinkClasses} ${activeLinkClasses}` : baseLinkClasses;

    return (
        <aside className="flex flex-col w-64 bg-dark text-white shadow-lg">
            <div className="flex items-center justify-center h-20 border-b border-gray-700">
                <img src="/logo.png" alt="OMS Logo" className="h-10 w-10 mr-3"/>
                <span className="text-xl font-bold text-white">Staff Panel</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map(item => (
                    <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                        {item.icon}
                        {item.text}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

const StaffLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex h-screen bg-light">
            <StaffSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                     <div className="px-6 py-4 flex justify-end items-center">
                        <span className="text-sm text-gray-600 mr-4">Welcome, {user?.name} (Staff)</span>
                         <Button variant="light" size="sm" onClick={logout}>
                            <FaSignOutAlt className="mr-2"/> Logout
                        </Button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light">
                    <div className="container mx-auto px-6 py-8">
                        {/* Child routes will be rendered here */}
                        <Outlet /> 
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;