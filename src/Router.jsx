import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Layouts & Pages
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
  // ✅ ใช้ user จาก props หรืออ่านจาก Session เพื่อความชัวร์ที่สุด
  const activeUser = user || JSON.parse(sessionStorage.getItem('app_current_user'));

  return (
    <Routes>
      
      {/* === GROUP 1: Public Pages (Login/Register) === */}
      {/* ถ้ามี activeUser แล้ว ให้เด้งไปหน้าแรก (/) ทันที ห้ามเข้าหน้า Login */}
      <Route 
        path="/login" 
        element={activeUser ? <Navigate to="/" replace /> : <Login setUser={setUser} users={users} />} 
      />
      <Route 
        path="/register" 
        element={activeUser ? <Navigate to="/" replace /> : <Register users={users} setUsers={setUsers} />} 
      />

      {/* === GROUP 2: Pages with MainLayout === */}
      <Route element={<MainLayout user={activeUser} onLogout={handleLogout} />}>
          
          {/* 1. หน้าแรก (Public) - เข้าได้ทุกคน */}
          <Route path="/" element={<CustomerHome markets={markets} />} />

          {/* 2. Customer Zone (ต้องล็อกอิน) */}
          <Route path="/customer/booking/:marketId" element={activeUser ? <Booking markets={markets} bookings={bookings} setBookings={setBookings} user={activeUser} /> : <Navigate to="/login" replace />} />
          <Route path="/customer/my-bookings" element={activeUser ? <MyBookings bookings={bookings} setBookings={setBookings} user={activeUser} markets={markets} /> : <Navigate to="/login" replace />} />
          <Route path="/customer/payment/:bookingId" element={activeUser ? <Payment bookings={bookings} setBookings={setBookings} markets={markets} /> : <Navigate to="/login" replace />} />

          {/* 3. Admin Zone (ต้องเป็น Admin) */}
          <Route path="/admin" element={activeUser?.role === 'admin' ? <AdminHome bookings={bookings} markets={markets} /> : <Navigate to="/" replace />} />
          <Route path="/admin/manage-market" element={activeUser?.role === 'admin' ? <MarketManage markets={markets} setMarkets={setMarkets} /> : <Navigate to="/" replace />} />
          <Route path="/admin/check-slip" element={activeUser?.role === 'admin' ? <CheckSlip bookings={bookings} setBookings={setBookings} markets={markets} /> : <Navigate to="/" replace />} />

          {/* 4. Redirect เส้นทางเก่า */}
          <Route path="/customer" element={<Navigate to="/" replace />} />
      </Route>

      {/* Fallback - หน้าไหนไม่เจอก็กลับหน้าแรก */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default AppRouter;