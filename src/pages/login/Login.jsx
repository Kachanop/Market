import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUser }) {
  const navigate = useNavigate();
  
  // State เก็บค่า Input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault(); // ป้องกันการ Reload หน้า

    if (!email || !password) {
      alert("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    // --- Logic ตรวจสอบสิทธิ์ (Simulation) ---
    let role = '';
    let userId = 0;
    let redirectPath = '';

    if (email.endsWith('@admin.com')) {
      role = 'admin';
      userId = 99; // Mock ID ของแอดมิน
      redirectPath = '/admin';
    } else if (email.endsWith('@gmail.com')) {
      role = 'customer';
      userId = 1; // Mock ID ของลูกค้า (ในระบบจริงต้องดึงจาก DB)
      redirectPath = '/customer';
    } else {
      alert("อีเมลไม่ถูกต้อง! \n- ลูกค้าใช้ @mail.com \n- แอดมินใช้ @admin.com");
      return;
    }

    // สร้าง Object User จำลอง
    const userData = {
      id: userId,
      email: email,
      role: role
    };

    // อัปเดต State หลักที่ App.js และเปลี่ยนหน้า
    setUser(userData);
    navigate(redirectPath);
  };

  // --- Styles ---
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    card: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center'
    },
    logo: {
      fontSize: '3rem',
      marginBottom: '10px',
      display: 'block'
    },
    title: {
      color: '#333',
      marginBottom: '5px',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    subtitle: {
      color: '#666',
      marginBottom: '30px',
      fontSize: '0.9rem'
    },
    formGroup: {
      marginBottom: '20px',
      textAlign: 'left'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#333',
      fontWeight: '600',
      fontSize: '0.9rem'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.3s'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#2E8B57', // สีเขียวธีมตลาด
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background-color 0.3s'
    },
    hintBox: {
      marginTop: '25px',
      padding: '15px',
      backgroundColor: '#e9f7ef',
      borderRadius: '8px',
      fontSize: '0.85rem',
      color: '#1e6641',
      textAlign: 'left',
      border: '1px solid #c3e6cb'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.logo}>🏪</span>
        <h2 style={styles.title}>ยินดีต้อนรับ</h2>
        <p style={styles.subtitle}>ระบบจองล็อกตลาดออนไลน์ทั่วไทย</p>

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>อีเมล</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>รหัสผ่าน</label>
            <input 
              type="password" 
              placeholder="••••••" 
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            style={styles.button}
            onMouseOver={(e) => e.target.style.backgroundColor = '#256f46'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2E8B57'}
          >
            เข้าสู่ระบบ
          </button>
        </form>

        {/* กล่องคำใบ้สำหรับ Demo (เอาออกได้เมื่อใช้งานจริง) */}
        <div style={styles.hintBox}>
          <strong>💡 สำหรับทดสอบระบบ:</strong>
          <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
            <li><b>ลูกค้า:</b> user@mail.com</li>
            <li><b>แอดมิน:</b> admin@admin.com</li>
            <li>รหัสผ่าน: ใส่อะไรก็ได้ (เช่น 123)</li>
          </ul>
        </div>

      </div>
    </div>
  );
}