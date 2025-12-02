import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const [scrolled, setScrolled] = useState(false);

  // Detect Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation Config
  const navItems = isAdmin ? [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/manage-market', label: 'Manage', icon: '⚙️' },
    { to: '/admin/check-slip', label: 'Slips', icon: '💰' },
  ] : [
    { to: '/', label: 'Home', icon: '🏠' },
    ...(user ? [{ to: '/customer/my-bookings', label: 'My Bookings', icon: '🎟️' }] : [])
  ];

  const styles = {
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.4s ease',
      background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.03)' : 'none',
    },
    // Left: Logo
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
    },
    // Right: Nav + User
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    logoIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      background: isAdmin ? 'linear-gradient(135deg, #FF3B30, #FF9500)' : 'linear-gradient(135deg, #007AFF, #5AC8FA)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    logoText: {
      fontSize: '1.1rem',
      fontWeight: '700',
      letterSpacing: '-0.5px',
      color: '#1C1C1E',
    },
    nav: {
      display: 'flex',
      gap: '8px',
    },
    navItem: (isActive) => ({
      textDecoration: 'none',
      color: isActive ? '#1C1C1E' : '#8E8E93',
      fontWeight: isActive ? '600' : '500',
      fontSize: '0.9rem',
      padding: '8px 16px',
      borderRadius: '20px',
      background: isActive ? 'rgba(0,0,0,0.06)' : 'transparent',
      transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }),
    userActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderLeft: '1px solid rgba(0,0,0,0.1)',
      paddingLeft: '16px'
    },
    userChip: {
      padding: '4px 12px 4px 4px',
      background: 'rgba(0,0,0,0.04)',
      borderRadius: '50px',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#3A3A3C',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid rgba(0,0,0,0.02)'
    },
    avatar: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9rem',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      color: isAdmin ? '#FF3B30' : '#007AFF'
    },
    logoutBtn: {
      background: 'transparent',
      border: 'none',
      color: '#FF3B30',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.85rem',
      padding: '8px 12px',
      borderRadius: '12px',
      transition: 'background 0.2s',
    }
  };

  return (
    <header style={styles.header} className="anim-slide-up">
      <div style={styles.leftSection} onClick={() => navigate(isAdmin ? '/admin' : '/')}>
        <div style={styles.logoIcon}>
          {isAdmin ? '🛡️' : '🛍️'}
        </div>
        <div>
          <div style={styles.logoText}>MarketOS <span style={{opacity:0.4, fontWeight:400}}>26</span></div>
        </div>
      </div>

      <div style={styles.rightSection}>
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && item.to !== '/admin' && location.pathname.startsWith(item.to));
            return (
              <Link key={item.to} to={item.to} style={styles.navItem(isActive)} className="hover-scale">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={styles.userActions}>
          {user ? (
            <>
              <div style={styles.userChip}>
                <div style={styles.avatar}>{user.name.charAt(0)}</div>
                <span>{user.name.split(' ')[0]}</span>
              </div>
              <button 
                style={styles.logoutBtn} 
                onClick={onLogout}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 59, 48, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button className="btn-ios" style={{background:'transparent', color:'#007AFF', padding:'8px 16px', fontSize:'0.9rem'}} onClick={() => navigate('/login')}>
                Log In
              </button>
              <button className="btn-ios btn-primary" style={{padding:'8px 20px', fontSize:'0.9rem'}} onClick={() => navigate('/register')}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;