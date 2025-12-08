import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './Router';

import { initialUsers, initialBookings } from './data/userData';
import { initialMarkets } from './data/marketData';

// ฟังก์ชันหลักของแอปพลิเคชัน (Root Component)
function App() {
  // --- 1. Database จำลอง (Load from Local Storage) ---
  // ดึงข้อมูลผู้ใช้งานจาก Local Storage หรือใช้ค่าเริ่มต้นจากไฟล์ข้อมูล
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // ใช้ Session Storage สำหรับ Current User เพื่อให้ Login ค้างอยู่เฉพาะ Session นี้
  // หรือใช้ Local Storage ถ้าอยากให้ "Remember Me"
  // ดึงข้อมูลผู้ใช้งานที่ล็อกอินอยู่ปัจจุบัน
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('app_current_user'); // เปลี่ยนเป็น Local Storage เพื่อความสะดวก
    return saved ? JSON.parse(saved) : null;
  });

  // ดึงข้อมูลตลาดจาก Local Storage
  const [markets, setMarkets] = useState(() => {
    const saved = localStorage.getItem('app_markets');
    return saved ? JSON.parse(saved) : initialMarkets;
  });

  // ดึงข้อมูลการจองจาก Local Storage
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('app_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  // --- 2. Auto-save Effects (Save to Local Storage) ---
  // บันทึกข้อมูลผู้ใช้งานลง Local Storage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => { localStorage.setItem('app_users', JSON.stringify(users)); }, [users]);

  // บันทึกข้อมูลผู้ใช้งานที่ล็อกอินอยู่ลง Local Storage (หรือลบออกถ้าล็อกเอาท์)
  useEffect(() => {
    if (user) localStorage.setItem('app_current_user', JSON.stringify(user));
    else localStorage.removeItem('app_current_user');
  }, [user]);

  // บันทึกข้อมูลตลาดลง Local Storage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => { localStorage.setItem('app_markets', JSON.stringify(markets)); }, [markets]);

  // บันทึกข้อมูลการจองลง Local Storage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => { localStorage.setItem('app_bookings', JSON.stringify(bookings)); }, [bookings]);

  // ฟังก์ชันสำหรับออกจากระบบ (Logout)
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