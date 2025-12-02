import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register({ users, setUsers }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("❌ Passwords do not match");
    if (users.find(u => u.email === formData.email)) return alert("❌ Email already exists");

    const role = formData.email.endsWith('@admin.com') ? 'admin' : 'customer';
    const newUser = { id: Date.now(), ...formData, role };

    setUsers([...users, newUser]);
    alert("✅ Account created successfully!");
    navigate('/login');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F2F2F7',
      padding: '20px',
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      padding: '40px',
      background: 'white',
      borderRadius: '32px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      textAlign: 'center',
    },
    title: { fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: '#1C1C1E' },
    subtitle: { color: '#8E8E93', marginBottom: '32px' },
    formGroup: { marginBottom: '16px', textAlign: 'left' },
    label: { display:'block', fontSize:'0.9rem', fontWeight:'600', marginBottom:'8px', color:'#3A3A3C', marginLeft:'4px' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="anim-scale">
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join MarketOS today</p>

        <form onSubmit={handleRegister}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input name="name" placeholder="John Doe" className="input-ios" onChange={handleChange} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" name="email" placeholder="john@example.com" className="input-ios" onChange={handleChange} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" placeholder="Create a password" className="input-ios" onChange={handleChange} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input type="password" name="confirmPassword" placeholder="Confirm password" className="input-ios" onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn-ios btn-primary" style={{width: '100%', marginTop: '16px', padding: '16px'}}>
            Create Account
          </button>
        </form>
        
        <div style={{marginTop: '24px', fontSize: '0.9rem', color: '#8E8E93'}}>
          Already have an account? <Link to="/login" style={{color: '#007AFF', fontWeight: '600'}}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}