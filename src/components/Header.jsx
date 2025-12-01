import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // Theme Config
  const theme = {
    bg: isAdmin 
      ? 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)' 
      : 'linear-gradient(90deg, #2E8B57 0%, #3CB371 100%)',
    shadow: isAdmin ? '0 4px 10px rgba(0,0,0,0.3)' : '0 4px 15px rgba(46, 139, 87, 0.3)',
    btnColor: isAdmin ? '#ff4d4d' : '#fff',
    btnBg: isAdmin ? 'white' : 'rgba(255,255,255,0.2)',
    btnText: isAdmin ? '#1e3c72' : 'white'
  };

  const styles = {
    header: {
      background: theme.bg, color: 'white', padding: '12px 30px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxShadow: theme.shadow, position: 'sticky', top: 0, zIndex: 1000, transition: 'all 0.3s ease'
    },
    logo: { fontSize: '1.6rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
    userDetails: { textAlign: 'right', fontSize: '0.9rem', lineHeight: '1.2' },
    badge: { fontSize: '0.7rem', backgroundColor: isAdmin ? '#FFD700' : 'rgba(255,255,255,0.9)', color: '#333', padding: '2px 8px', borderRadius: '12px', fontWeight: '800', marginLeft: '5px', letterSpacing: '0.5px', textTransform: 'uppercase' },
    
    // ปุ่มต่างๆ
    actionBtn: { backgroundColor: theme.btnBg, color: theme.btnText, border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '5px' },
    loginBtn: { backgroundColor: 'white', color: '#2E8B57', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    registerBtn: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', padding: '7px 19px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }
  };

  const handleLogoClick = () => {
    if (isAdmin) navigate('/admin');
    else navigate('/');
  };

  return (
    <header style={styles.header} className="anim-slide-up">
      <div style={styles.logo} onClick={handleLogoClick}>
        <span style={{fontSize: '2rem'}}>{isAdmin ? '🛡️' : '🏪'}</span>
        <div style={{display:'flex', flexDirection:'column'}}>
          <span>{isAdmin ? 'Market Admin' : 'StallFinder'}</span>
          <span style={{fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.9}}>
            {isAdmin ? 'ระบบจัดการตลาด' : 'จองล็อกตลาดง่ายๆ'}
          </span>
        </div>
      </div>

      {user ? (
        <div style={styles.userInfo}>
          <div style={styles.userDetails}>
            <div style={{fontWeight: '600'}}>{user.name || user.email}</div>
            <div style={{ marginTop: '2px' }}><span style={styles.badge}>{user.role}</span></div>
          </div>
          <button style={styles.actionBtn} onClick={onLogout} className="hover-scale">↪ ออกจากระบบ</button>
        </div>
      ) : (
        <div style={styles.userInfo}>
           <button style={styles.loginBtn} onClick={() => navigate('/login')} className="hover-scale">เข้าสู่ระบบ</button>
           <button style={styles.registerBtn} onClick={() => navigate('/register')} className="hover-scale">สมัครสมาชิก</button>
        </div>
      )}
    </header>
  );
};

export default Header;