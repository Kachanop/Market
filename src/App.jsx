import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './Router';

import { initialUsers, initialBookings } from './data/userData';
import { initialMarkets } from './data/marketData';

function App() {
  // --- 1. Database จำลอง (Load from Local Storage) ---
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // ใช้ Session Storage สำหรับ Current User เพื่อให้ Login ค้างอยู่เฉพาะ Session นี้
  // หรือใช้ Local Storage ถ้าอยากให้ "Remember Me"
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('app_current_user'); // เปลี่ยนเป็น Local Storage เพื่อความสะดวก
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

  // --- 2. Auto-save Effects (Save to Local Storage) ---
  useEffect(() => { localStorage.setItem('app_users', JSON.stringify(users)); }, [users]);
  
  useEffect(() => {
    if (user) localStorage.setItem('app_current_user', JSON.stringify(user));
    else localStorage.removeItem('app_current_user');
  }, [user]);

  useEffect(() => { localStorage.setItem('app_markets', JSON.stringify(markets)); }, [markets]);
  useEffect(() => { localStorage.setItem('app_bookings', JSON.stringify(bookings)); }, [bookings]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_current_user');
  };

  return (
    <Router>
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