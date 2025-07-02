import React from 'react';
import useAuth from '../../hooks/useAuth';
import { FaSignOutAlt, FaUserCircle, FaBars } from 'react-icons/fa';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();

    return (
        <header className="relative z-10 bg-white shadow-md">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Hamburger menu for mobile */}
                <button
                    onClick={toggleSidebar}
                    className="text-gray-500 focus:outline-none lg:hidden"
                >
                    <FaBars className="h-6 w-6" />
                </button>

                {/* Placeholder for title or search */}
                <div className="hidden sm:block">
                   <div className="text-gray-700 font-semibold">Operational Management System</div>
                </div>

                <div className="flex items-center">
                    <div className="flex items-center mr-4">
                        <FaUserCircle className="w-6 h-6 text-primary mr-2" />
                        <span className="text-gray-700 text-sm font-medium">
                            {user?.name} ({user?.role})
                        </span>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center text-gray-500 hover:text-primary focus:outline-none"
                        title="Logout"
                    >
                        <FaSignOutAlt className="w-5 h-5" />
                        <span className="hidden sm:inline sm:ml-2 text-sm">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;