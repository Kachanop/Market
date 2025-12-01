import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user }) => {
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  // Theme Config
  const theme = {
    bg: '#ffffff',
    borderBottom: isAdmin ? '1px solid #e0e0e0' : '1px solid #e6f4ea',
    textDefault: '#666',
    textActive: isAdmin ? '#1a237e' : '#2E8B57',
    indicator: isAdmin ? '#1a237e' : '#2E8B57',
    shadow: isAdmin ? '0 2px 4px rgba(0,0,0,0.05)' : '0 4px 10px rgba(46, 139, 87, 0.05)'
  };

  const styles = {
    nav: { backgroundColor: theme.bg, padding: '0 20px', borderBottom: theme.borderBottom, display: 'flex', justifyContent: 'center', boxShadow: theme.shadow, position: 'sticky', top: '70px', zIndex: 900, transition: 'all 0.3s ease' },
    menuContainer: { display: 'flex', gap: '40px', listStyle: 'none', margin: 0, padding: 0 }
  };

  const NavItem = ({ to, icon, label }) => {
    const isActive = location.pathname === to || (to !== '/' && to !== '/admin' && location.pathname.startsWith(to));
    const itemStyle = {
      display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
      color: isActive ? theme.textActive : theme.textDefault, fontWeight: isActive ? '700' : '500',
      padding: '16px 5px', borderBottom: isActive ? `3px solid ${theme.indicator}` : '3px solid transparent',
      transition: 'all 0.2s ease', fontSize: '0.95rem', cursor: 'pointer'
    };
    return (
      <Link to={to} style={itemStyle} className={isActive ? 'anim-scale-in' : ''}>
        <span style={{fontSize: '1.2rem'}}>{icon}</span><span>{label}</span>
      </Link>
    );
  };

  return (
    <nav style={styles.nav} className="anim-fade-in">
      <div style={styles.menuContainer}>
        {/* เมนู Admin */}
        {isAdmin && (
          <>
            <NavItem to="/admin" icon="📊" label="ภาพรวม" />
            <NavItem to="/admin/manage-market" icon="⚙️" label="จัดการตลาด" />
            <NavItem to="/admin/check-slip" icon="💰" label="ตรวจสอบสลิป" />
          </>
        )}

        {/* เมนู Customer/Guest */}
        {!isAdmin && (
          <>
            <NavItem to="/" icon="🏠" label="หน้าแรก" />
            {/* แสดงเฉพาะคนล็อกอินแล้ว */}
            {user && <NavItem to="/customer/my-bookings" icon="🎟️" label="การจองของฉัน" />}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;