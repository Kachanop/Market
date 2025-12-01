import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './Router'; // ✅ เรียกใช้ Router ที่เราแยกไว้

import { initialUsers, initialBookings } from './data/userData';
import { initialMarkets } from './data/marketData';

function App() {
  // --- 1. Database จำลอง ---
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('app_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [markets, setMarkets] = useState(() => {
    const saved = localStorage.getItem('app_markets');
    return saved ? JSON.parse(saved) : initialMarkets;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('app_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  // --- 2. Auto-save Effects ---
  useEffect(() => { localStorage.setItem('app_users', JSON.stringify(users)); }, [users]);
  
  useEffect(() => {
    if (user) sessionStorage.setItem('app_current_user', JSON.stringify(user));
    else sessionStorage.removeItem('app_current_user');
  }, [user]);

  useEffect(() => { localStorage.setItem('app_markets', JSON.stringify(markets)); }, [markets]);
  useEffect(() => { localStorage.setItem('app_bookings', JSON.stringify(bookings)); }, [bookings]);

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('app_current_user');
  };

  return (
    <Router>
      {/* ✅ ส่ง Props ทุกอย่างไปให้ AppRouter จัดการ */}
      {/* ❌ ห้ามใส่ MainLayout ตรงนี้เด็ดขาด เพราะใน Router.jsx ใส่ไว้ให้แล้ว */}
      <AppRouter 
        user={user}
        users={users}
        setUser={setUser}
        setUsers={setUsers}
        markets={markets}
        setMarkets={setMarkets}
        bookings={bookings}
        setBookings={setBookings}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;