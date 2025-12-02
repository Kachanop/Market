import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';

const MainLayout = ({ user, onLogout }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header แบบใหม่ (Glass) */}
      <Header user={user} onLogout={onLogout} />
      
      {/* เนื้อหาหลัก */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        paddingBottom: '100px' // เผื่อที่ให้ Floating Navbar ด้านล่าง
      }}>
        <Outlet />
      </div>

      {/* Floating Navbar (อยู่ด้านล่าง) */}
      <Navbar user={user} />
      
      {/* Footer แบบเรียบง่าย */}
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