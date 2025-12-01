import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import Login from './pages/login/Login';
import AdminHome from './pages/admin/AdminHome';
import MarketManage from './pages/admin/MarketManage';
import CheckSlip from './pages/admin/CheckSlip';
import CustomerHome from './pages/customer/CustomerHome';
import Booking from './pages/customer/Booking';
import MyBookings from './pages/customer/MyBookings';
import Payment from './pages/customer/Payment';

// 🔥 IMPORT ไฟล์ข้อมูลใหม่ 2 ไฟล์
import { initialUsers, initialBookings } from './data/userData';
import { initialMarkets } from './data/marketData';

function App() {
  // 1. โหลดข้อมูล (พยายามโหลดจาก LocalStorage ก่อน ถ้าไม่มีให้ใช้ข้อมูลจากไฟล์ใหม่)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('app_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [markets, setMarkets] = useState(() => {
    const saved = localStorage.getItem('app_markets');
    return saved ? JSON.parse(saved) : initialMarkets; // ดึงจาก marketData.js
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('app_bookings');
    return saved ? JSON.parse(saved) : initialBookings; // ดึงจาก userData.js
  });

  // 2. Auto-save ลง LocalStorage เมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    localStorage.setItem('app_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('app_markets', JSON.stringify(markets));
  }, [markets]);

  useEffect(() => {
    localStorage.setItem('app_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !user ? <Login setUser={setUser} /> : <Navigate to="/" />
        } />

        {user ? (
          <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={
              user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/customer" />
            } />

            {/* Admin Routes */}
            {user.role === 'admin' && (
              <>
                <Route 
                  path="/admin" 
                  element={<AdminHome bookings={bookings} markets={markets} />} 
                />
                <Route 
                  path="/admin/manage-market" 
                  element={<MarketManage markets={markets} setMarkets={setMarkets} />} 
                />
                <Route 
                  path="/admin/check-slip" 
                  element={<CheckSlip bookings={bookings} setBookings={setBookings} markets={markets} />} 
                />
              </>
            )}

            {/* Customer Routes */}
            {user.role === 'customer' && (
              <>
                <Route 
                  path="/customer" 
                  element={<CustomerHome markets={markets} />} 
                />
                <Route 
                  path="/customer/booking/:marketId" 
                  element={<Booking markets={markets} bookings={bookings} setBookings={setBookings} user={user} />} 
                />
                <Route 
                  path="/customer/my-bookings" 
                  element={<MyBookings bookings={bookings} setBookings={setBookings} user={user} markets={markets} />} 
                />
                <Route 
                  path="/customer/payment/:bookingId" 
                  element={<Payment bookings={bookings} setBookings={setBookings} markets={markets} />} 
                />
              </>
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;