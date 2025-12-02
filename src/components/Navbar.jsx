import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user }) => {
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const styles = {
    container: {
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      width: 'auto',
      maxWidth: '90%',
    },
    dock: {
      display: 'flex',
      gap: '8px',
      padding: '10px 14px',
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
      borderRadius: '30px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.4) inset',
      border: '1px solid rgba(255,255,255,0.2)',
    },
    item: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 16px',
      borderRadius: '20px',
      textDecoration: 'none',
      color: isActive ? '#FFFFFF' : '#8E8E93',
      background: isActive ? (isAdmin ? '#FF3B30' : '#007AFF') : 'transparent',
      fontWeight: isActive ? '600' : '500',
      fontSize: '0.95rem',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring Animation
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
      gap: '8px',
      minWidth: '100px',
    }),
    icon: { fontSize: '1.2rem' }
  };

  const NavItem = ({ to, icon, label }) => {
    const isActive = location.pathname === to || (to !== '/' && to !== '/admin' && location.pathname.startsWith(to));
    return (
      <Link to={to} style={styles.item(isActive)}>
        <span style={styles.icon}>{icon}</span>
        {isActive && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div style={styles.container} className="anim-slide-up stagger-3">
      <div style={styles.dock}>
        {isAdmin ? (
          <>
            <NavItem to="/admin" icon="📊" label="Dashboard" />
            <NavItem to="/admin/manage-market" icon="⚙️" label="Manage" />
            <NavItem to="/admin/check-slip" icon="💰" label="Slips" />
          </>
        ) : (
          <>
            <NavItem to="/" icon="🏠" label="Home" />
            {user && <NavItem to="/customer/my-bookings" icon="🎟️" label="Bookings" />}
            {/* สามารถเพิ่มเมนูอื่นๆ ได้ที่นี่ */}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;