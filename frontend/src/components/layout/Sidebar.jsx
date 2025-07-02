import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  RxDashboard, RxCalendar, RxCube, RxPerson, RxFileText, RxGear
} from 'react-icons/rx';
import { FaMoneyBillWave, FaTimes } from 'react-icons/fa';

// Import the hook to get the logged-in user's role
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    // Get the user object from the authentication context
    const { user } = useAuth();
    
    // Guard clause: Prevents errors if the user data hasn't loaded yet.
    if (!user) {
        return null;
    }

    const baseLinkClasses = "flex items-center px-4 py-2.5 text-gray-300 hover:bg-dark-light hover:text-white rounded-md transition duration-200";
    const activeLinkClasses = "bg-primary text-white font-semibold";
    
    // Your navItems array is perfect as is. It contains the roles required for each link.
    const navItems = [
      { to: "/dashboard", icon: <RxDashboard className="mr-3" />, text: "Dashboard", role: ["Admin", "Staff"] },
      { to: "/bookings", icon: <RxCalendar className="mr-3" />, text: "Bookings", role: ["Admin", "Staff"] },
      { to: "/inventory", icon: <RxCube className="mr-3" />, text: "Inventory", role: ["Admin", "Staff"] },
      { to: "/customers", icon: <RxPerson className="mr-3" />, text: "Customers", role: ["Admin", "Staff"] },
      { to: "/payments", icon: <FaMoneyBillWave className="mr-3" />, text: "Payments", role: ["Admin"] },
      { to: "/reports", icon: <RxFileText className="mr-3" />, text: "Reports", role: ["Admin"] },
      { to: "/users", icon: <RxGear className="mr-3" />, text: "User Mgt.", role: ["Admin"] }
    ];

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            <aside className={`fixed z-30 inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col w-64 bg-dark text-white transition-transform duration-200 ease-in-out`}>
                <div className="flex items-center justify-between h-20 px-4 border-b border-gray-700">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="OMS Logo" className="h-10 w-10 mr-2"/>
                        <span className="text-xl font-bold text-white">OMS</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <FaTimes className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems
                        // --- THIS IS THE ONLY CHANGE ---
                        // Before mapping, we filter the array. An item is only kept if the
                        // current user's role is found within its `role` array.
                        .filter(item => item.role.includes(user.role))
                        .map(item => (
                            <NavLink 
                                key={item.to} 
                                to={item.to}
                                className={({isActive}) => isActive ? `${baseLinkClasses} ${activeLinkClasses}`: baseLinkClasses}
                                onClick={() => { if(sidebarOpen) { setSidebarOpen(false) } }}
                            >
                                {item.icon}
                                {item.text}
                            </NavLink>
                        ))
                    }
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;