// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navStyle = {
    backgroundColor: '#f8f9fa',
    padding: '10px 20px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '1rem'
  };

  return (
    <nav style={navStyle}>
      {/* เมนูสำหรับ ADMIN */}
      {user.role === 'admin' && (
        <>
          <Link to="/admin" style={linkStyle}>🏠 หน้าหลักแอดมิน</Link>
          <Link to="/admin/manage-market" style={linkStyle}>⚙️ จัดการตลาด</Link>
          <Link to="/admin/check-slip" style={linkStyle}>💰 ตรวจสอบสลิป</Link>
        </>
      )}

      {/* เมนูสำหรับ CUSTOMER */}
      {user.role === 'customer' && (
        <>
          <Link to="/customer" style={linkStyle}>🏠 หน้าแรก</Link>
          <Link to="/customer/my-bookings" style={linkStyle}>🎟️ การจองของฉัน</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;