import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setUser, users }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // 1. ค้นหา User ในฐานข้อมูล
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      // ✅ สร้าง Object ใหม่เพื่อป้องกันการแก้ไขข้อมูลเดิมโดยตรงทันที
      // (แต่ใน Logic จริงควรไปอัปเดต Database ด้วย ถ้าต้องการให้สิทธิ์ถาวร)
      let activeUser = { ...foundUser };

      // 🔥 AUTO ADMIN LOGIC: ถ้าอีเมลลงท้ายด้วย @admin.com ให้เป็น Admin ทันที
      if (activeUser.email.endsWith('@admin.com')) {
        activeUser.role = 'admin';
      }

      // 2. บันทึกลง State (App.jsx จะได้รับข้อมูลที่เป็น admin แล้ว)
      setUser(activeUser);

      // 3. เปลี่ยนหน้าตาม Role ที่เพิ่งอัปเดต
      if (activeUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/'); // ไปหน้าโฮม
      }
      
    } else {
      alert("❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: "'Inter', sans-serif" },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    logo: { fontSize: '3rem', marginBottom: '10px', display: 'block' },
    title: { color: '#333', marginBottom: '5px', fontSize: '1.5rem', fontWeight: 'bold' },
    subtitle: { color: '#666', marginBottom: '30px', fontSize: '0.9rem' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' },
    button: { width: '100%', padding: '12px', backgroundColor: '#2E8B57', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: '0.3s' },
    link: { display: 'block', marginTop: '20px', color: '#666', fontSize: '0.9rem', textDecoration: 'none' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="anim-slide-up">
        <span style={styles.logo}>🏪</span>
        <h2 style={styles.title}>ยินดีต้อนรับ</h2>
        <p style={styles.subtitle}>ระบบจองล็อกตลาดออนไลน์ทั่วไทย</p>

        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="อีเมล" 
            style={styles.input} 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="รหัสผ่าน" 
            style={styles.input} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" style={styles.button} className="hover-scale">เข้าสู่ระบบ</button>
        </form>

        <Link to="/register" style={styles.link}>
          ยังไม่มีบัญชี? <span style={{color: '#2E8B57', fontWeight: 'bold'}}>สมัครสมาชิกใหม่</span>
        </Link>
      </div>
    </div>
  );
}