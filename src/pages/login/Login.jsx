import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setUser, users }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      let activeUser = { ...foundUser };
      if (activeUser.email.endsWith('@admin.com')) activeUser.role = 'admin';
      setUser(activeUser);
      navigate(activeUser.role === 'admin' ? '/admin' : '/');
    } else {
      alert("❌ Incorrect email or password");
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F2F2F7', // iOS BG
      padding: '20px',
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      padding: '40px',
      background: 'white',
      borderRadius: '32px', // Super rounded
      boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      textAlign: 'center',
    },
    logo: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #007AFF, #5AC8FA)',
      borderRadius: '22px',
      margin: '0 auto 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.5rem',
      color: 'white',
      boxShadow: '0 10px 25px rgba(0, 122, 255, 0.3)',
    },
    title: { fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: '#1C1C1E' },
    subtitle: { color: '#8E8E93', marginBottom: '32px' },
    formGroup: { marginBottom: '20px', textAlign: 'left' },
    label: { display:'block', fontSize:'0.9rem', fontWeight:'600', marginBottom:'8px', color:'#3A3A3C', marginLeft:'4px' },
    footerLink: { marginTop: '24px', fontSize: '0.9rem', color: '#8E8E93' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="anim-scale">
        <div style={styles.logo}>🛍️</div>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to continue to MarketOS</p>

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" placeholder="user@mail.com" className="input-ios"
              value={email} onChange={e => setEmail(e.target.value)} required 
              style={{ textAlign: 'left', boxSizing: 'border-box' }} 
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" placeholder="•••••••" className="input-ios"
              value={password} onChange={e => setPassword(e.target.value)} required 
              style={{ textAlign: 'left', boxSizing: 'border-box' }} 
            />
          </div>
          
          <button type="submit" className="btn-ios btn-primary" style={{width: '100%', marginTop: '10px', padding: '16px'}}>
            Sign In
          </button>
        </form>

        <div style={styles.footerLink}>
          Don't have an account? <Link to="/register" style={{color: '#007AFF', fontWeight: '600'}}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}