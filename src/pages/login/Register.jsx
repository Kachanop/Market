import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register({ users, setUsers }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert("❌ รหัสผ่านไม่ตรงกัน");
    if (users.find(u => u.email === formData.email)) return alert("❌ อีเมลนี้ถูกใช้งานแล้ว");

    // ถ้าอีเมลเป็น @admin.com ให้เป็น Admin ตั้งแต่เกิด (Optional)
    const role = formData.email.endsWith('@admin.com') ? 'admin' : 'customer';

    const newUser = { 
      id: Date.now(), 
      name: formData.name, 
      email: formData.email, 
      password: formData.password, 
      role: role 
    };

    setUsers([...users, newUser]);
    alert("✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
    navigate('/login');
  };

  const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: "'Inter', sans-serif" },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    title: { color: '#2E8B57', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 'bold' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' },
    button: { width: '100%', padding: '12px', backgroundColor: '#2E8B57', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', marginTop: '10px' },
    link: { display: 'block', marginTop: '15px', color: '#666', fontSize: '0.9rem', textDecoration: 'none' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="anim-slide-up">
        <h2 style={styles.title}>📝 สมัครสมาชิก</h2>
        <form onSubmit={handleRegister}>
          <input name="name" placeholder="ชื่อ-นามสกุล" required style={styles.input} onChange={handleChange} />
          <input type="email" name="email" placeholder="อีเมล" required style={styles.input} onChange={handleChange} />
          <input type="password" name="password" placeholder="รหัสผ่าน" required style={styles.input} onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="ยืนยันรหัสผ่าน" required style={styles.input} onChange={handleChange} />
          <button type="submit" style={styles.button} className="hover-scale">ยืนยันการสมัคร</button>
        </form>
        <Link to="/login" style={styles.link}>มีบัญชีอยู่แล้ว? <span style={{color: '#2E8B57', fontWeight: 'bold'}}>เข้าสู่ระบบ</span></Link>
      </div>
    </div>
  );
}