import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const MainLayout = ({ user, onLogout }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* ส่วนหัวของหน้าเว็บ */}
      <Header user={user} onLogout={onLogout} />

      {/* ส่วนเนื้อหาหลัก */}
      <div style={{
        flex: 1,
        position: 'relative',
        width: '100%',
        paddingBottom: '40px'
      }}>
        <Outlet />
      </div>

      {/* ส่วนท้ายของหน้าเว็บ */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 20px',
        color: '#8E8E93',
        fontSize: '0.8rem',
        marginTop: 'auto',
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0,0,0,0.05)'
      }}>
        <p>© 2025 MarketOS. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;