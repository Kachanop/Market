import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';

const MainLayout = ({ user, onLogout }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ส่วนหัวของหน้าเว็บ (Header) พร้อมเอฟเฟกต์เบลอแบบกระจก (Glassmorphism) */}
      <Header user={user} onLogout={onLogout} />

      {/* พื้นที่แสดงเนื้อหาหลักของแต่ละหน้า (Outlet) */}
      <div style={{
        flex: 1,
        position: 'relative',
        paddingBottom: '100px' // เผื่อพื้นที่ด้านล่างป้องกันไม่ให้เนื้อหาถูก Floating Navbar บัง
      }}>
        <Outlet />
      </div>

      {/* แถบนำทางด้านล่างแบบลอย (Floating Navbar) */}
      <Navbar user={user} />

      {/* ส่วนท้ายของหน้าเว็บ (Footer) */}
      <footer style={{
        textAlign: 'center',
        padding: '30px 20px 100px 20px', // เพิ่ม padding ล่างเพื่อไม่ให้ Navbar บัง
        color: '#8E8E93',
        fontSize: '0.8rem',
        marginTop: 'auto'
      }}>
        <p>© 2025 MarketOS. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;