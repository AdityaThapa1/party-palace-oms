
import { Toaster } from 'react-hot-toast';
import { Routes, Route } from 'react-router-dom';

// Layout and Route Components
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/routes/ProtectedRoute.jsx';
import AdminRoute from './components/routes/AdminRoute.jsx';
import CustomerProtectedRoute from './components/routes/CustomerProtectedRoute.jsx';

// Page Components
import HomePage from './pages/HomePage/HomePage.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import BookingList from './pages/Bookings/BookingList.jsx';
import InventoryList from './pages/Inventory/InventoryList.jsx';
import CustomerList from './pages/CustomerPortal/CustomerList.jsx';
import PaymentList from './pages/Payments/PaymentList.jsx';
import UserList from './pages/Users/UserList.jsx';
import Reports from './pages/Reports/Reports.jsx';
import NotFound from './pages/NotFound.jsx';

import CustomerBookingForm from './pages/CustomerPortal/CustomerBookingForm.jsx';

// Customer Portal Components
import CustomerLogin from './pages/CustomerPortal/CustomerLogin.jsx';
import CustomerRegister from './pages/CustomerPortal/CustomerRegister.jsx';
import CustomerDashboard from './pages/CustomerPortal/CustomerDashboard.jsx';

//Staff portal components
import StaffLayout from './pages/Staff/StaffLayout';
import StaffDashboard from './pages/Staff/StaffDashboard';
import StaffBookingList from './pages/Staff/StaffBookingList';
import StaffCustomerList from './pages/Staff/StaffCustomerList';

function App() {
return (
<>
<Toaster
position="top-right"
toastOptions={{
className: 'font-sans text-sm',
duration: 4000,
}}
/>
<Routes>
{/* --- PUBLIC ROUTES --- */}
<Route path="/" element={<HomePage />} />
<Route path="/staff/login" element={<Login />} />
<Route path="/customer/login" element={<CustomerLogin />} />
<Route path="/customer/register" element={<CustomerRegister />} />


{/* --- PROTECTED CUSTOMER ROUTE --- */}
    <Route 
      path="/my-account" 
      element={
        <CustomerProtectedRoute>
          <CustomerDashboard />
        </CustomerProtectedRoute>
      }
    />
    <Route 
      path="/my-account/bookings/new" 
      element={
        <CustomerProtectedRoute>
          <CustomerBookingForm />
        </CustomerProtectedRoute>
      }
    />
    
    <Route element={<ProtectedRoute requiredRole="Staff"><StaffLayout /></ProtectedRoute>}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/bookings" element={<StaffBookingList />} />
            <Route path="/staff/customers" element={<StaffCustomerList />} />
        </Route>

    {/* --- PROTECTED STAFF & ADMIN ROUTES (Dashboard etc.) --- */}
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/bookings" element={<BookingList />} />
      <Route path="/inventory" element={<InventoryList />} />
      <Route path="/customers" element={<CustomerList />} />
      <Route path="/payments" element={<AdminRoute><PaymentList /></AdminRoute>} />
      <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
      <Route path="/users" element={<AdminRoute><UserList /></AdminRoute>} />
    </Route>

    {/* --- Fallback Not Found Route --- */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</>


);
}

export default App;