import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // Style แบบ Inline เพื่อให้นำไปวางแล้วสวยเลยโดยไม่ต้องสร้างไฟล์ CSS แยก
  const styles = {
    header: {
      backgroundColor: '#2E8B57', // สีเขียว SeaGreen ให้ความรู้สึกตลาด/ธรรมชาติ
      color: 'white',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    userDetails: {
      textAlign: 'right',
      fontSize: '0.9rem'
    },
    badge: {
      fontSize: '0.75rem',
      backgroundColor: user?.role === 'admin' ? '#FFD700' : '#fff', // Admin สีทอง, Customer สีขาว
      color: '#333',
      padding: '2px 8px',
      borderRadius: '10px',
      fontWeight: 'bold',
      marginLeft: '5px'
    },
    logoutBtn: {
      backgroundColor: '#ff4d4d',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: '0.3s'
    }
  };

  const handleLogoClick = () => {
    if (user?.role === 'admin') navigate('/admin');
    else navigate('/customer');
  };

  return (
    <header style={styles.header}>
      {/* ส่วนโลโก้ด้านซ้าย */}
      <div style={styles.logo} onClick={handleLogoClick}>
        <span>🏪</span>
        <span>ระบบจองล็อกตลาดทั่วไทย</span>
      </div>

      {/* ส่วนข้อมูลผู้ใช้ด้านขวา */}
      {user && (
        <div style={styles.userInfo}>
          <div style={styles.userDetails}>
            <div>{user.email}</div>
            <div style={{ marginTop: '2px' }}>
              <span style={styles.badge}>
                {user.role === 'admin' ? 'ADMIN' : 'CUSTOMER'}
              </span>
            </div>
          </div>
          
          <button 
            style={styles.logoutBtn} 
            onClick={onLogout}
            onMouseOver={(e) => e.target.style.backgroundColor = '#cc0000'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff4d4d'}
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;