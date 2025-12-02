import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Layouts & Pages
// ตรวจสอบ Path ให้แน่ใจว่าไฟล์เหล่านี้มีอยู่จริงใน src/components และ src/pages
import MainLayout from './components/MainLayout';
import Login from './pages/login/Login';
import Register from './pages/login/Register';
import AdminHome from './pages/admin/AdminHome';
import MarketManage from './pages/admin/MarketManage';
import CheckSlip from './pages/admin/CheckSlip';
import CustomerHome from './pages/customer/CustomerHome';
import Booking from './pages/customer/Booking';
import MyBookings from './pages/customer/MyBookings';
import Payment from './pages/customer/Payment';

const AppRouter = ({ 
  user, 
  users, 
  setUser, 
  setUsers, 
  markets, 
  setMarkets, 
  bookings, 
  setBookings, 
  handleLogout 
}) => {
  // ✅ ใช้ user จาก props หรืออ่านจาก Session
  const activeUser = user || JSON.parse(sessionStorage.getItem('app_current_user'));

  // 🔥 Helper: ฟังก์ชันหาเส้นทางเริ่มต้นตาม Role
  const getRedirectPath = (u) => {
    return u?.role === 'admin' ? '/admin' : '/';
  };

  return (
    <Routes>
      
      {/* === GROUP 1: Public Pages (Login/Register) === */}
      <Route 
        path="/login" 
        element={activeUser ? <Navigate to={getRedirectPath(activeUser)} replace /> : <Login setUser={setUser} users={users} />} 
      />
      <Route 
        path="/register" 
        element={activeUser ? <Navigate to={getRedirectPath(activeUser)} replace /> : <Register users={users} setUsers={setUsers} />} 
      />

      {/* === GROUP 2: Pages with MainLayout === */}
      <Route element={<MainLayout user={activeUser} onLogout={handleLogout} />}>
          
          {/* 1. หน้าแรก (Public) */}
          <Route path="/" element={<CustomerHome markets={markets} />} />

          {/* 2. Customer Zone */}
          <Route path="/customer/booking/:marketId" element={activeUser ? <Booking markets={markets} bookings={bookings} setBookings={setBookings} user={activeUser} /> : <Navigate to="/login" replace />} />
          <Route path="/customer/my-bookings" element={activeUser ? <MyBookings bookings={bookings} setBookings={setBookings} user={activeUser} markets={markets} /> : <Navigate to="/login" replace />} />
          <Route path="/customer/payment/:bookingId" element={activeUser ? <Payment bookings={bookings} setBookings={setBookings} markets={markets} /> : <Navigate to="/login" replace />} />

          {/* 3. Admin Zone */}
          <Route path="/admin" element={activeUser?.role === 'admin' ? <AdminHome bookings={bookings} markets={markets} /> : <Navigate to="/" replace />} />
          <Route path="/admin/manage-market" element={activeUser?.role === 'admin' ? <MarketManage markets={markets} setMarkets={setMarkets} /> : <Navigate to="/" replace />} />
          <Route path="/admin/check-slip" element={activeUser?.role === 'admin' ? <CheckSlip bookings={bookings} setBookings={setBookings} markets={markets} /> : <Navigate to="/" replace />} />

          {/* 4. Redirect */}
          <Route path="/customer" element={<Navigate to="/" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRouter;