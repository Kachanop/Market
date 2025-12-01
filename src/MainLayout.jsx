import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';

const MainLayout = ({ user, onLogout }) => {
  return (
    <div>
      {/* ส่วนหัวและเมนู (แสดงทุกหน้าเมื่อ Login แล้ว) */}
      <Header user={user} onLogout={onLogout} />
      <Navbar user={user} />
      
      {/* Outlet คือจุดที่ React Router จะเอาเนื้อหาของแต่ละหน้ามาแสดง */}
      <div style={{ minHeight: '80vh', position: 'relative' }}>
        <Outlet />
      </div>
      
      {/* Footer (ส่วนท้ายเว็บ) */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '20px', 
        color: '#888', 
        fontSize: '0.8rem',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #ddd',
        marginTop: 'auto'
      }}>
        © 2023 ระบบจองล็อกตลาดออนไลน์
      </footer>
    </div>
  );
};

export default MainLayout;