import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminHome({ bookings, markets }) {
  
  // Logic Calculations
  const totalIncome = bookings.filter(b => b.status === 'approved').reduce((sum, b) => sum + parseInt(b.price || 0), 0);
  const pendingCheck = bookings.filter(b => b.status === 'paid').length;
  let totalLocks = 0;
  markets.forEach(m => m.floors?.forEach(f => totalLocks += f.locks?.length || 0));
  const bookedCount = bookings.length;
  const availableCount = totalLocks - bookedCount;

  const styles = {
    container: { padding: '30px', backgroundColor: '#F0F2F5', minHeight: '100vh' },
    header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { color: '#1a237e', margin: 0 },
    subtitle: { color: '#666', marginTop: '5px' },
    
    // Stats Cards
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' },
    card: {
      backgroundColor: 'white', padding: '25px', borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden'
    },
    cardIcon: { position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '5rem', opacity: 0.1, transform: 'rotate(-15deg)' },
    cardLabel: { fontSize: '0.95rem', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    cardValue: { fontSize: '2.2rem', fontWeight: '800', margin: '10px 0', color: '#333' },
    
    // Status Colors
    highlight: { color: '#28a745' },
    alert: { color: '#d32f2f' },
    info: { color: '#0288d1' },

    // Table Section
    section: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '25px', border: '1px solid #e0e0e0' },
    sectionHeader: { fontSize: '1.2rem', fontWeight: 'bold', color: '#333', marginBottom: '20px', borderLeft: '4px solid #1a237e', paddingLeft: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' },
    th: { textAlign: 'left', padding: '15px', borderBottom: '2px solid #eee', color: '#555', fontWeight: '600' },
    td: { padding: '15px', borderBottom: '1px solid #eee', color: '#333' },
    badge: (status) => {
      const map = {
        pending_payment: { bg: '#FFF3E0', col: '#EF6C00', label: 'รอชำระ' },
        paid: { bg: '#E3F2FD', col: '#1976D2', label: 'รอตรวจสอบ' },
        approved: { bg: '#E8F5E9', col: '#2E7D32', label: 'อนุมัติแล้ว' },
        rejected: { bg: '#FFEBEE', col: '#C62828', label: 'ปฏิเสธ' }
      };
      const s = map[status] || { bg: '#eee', col: '#333', label: status };
      return { backgroundColor: s.bg, color: s.col, padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block' };
    }
  };

  const StatCard = ({ title, value, icon, color, footer }) => (
    <div style={styles.card} className="anim-scale-in hover-scale">
      <div style={styles.cardIcon}>{icon}</div>
      <div style={styles.cardLabel}>{title}</div>
      <div style={{...styles.cardValue, color: color}}>{value}</div>
      <div style={{fontSize: '0.85rem', color: '#888'}}>{footer}</div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header} className="anim-slide-up">
        <div>
          <h2 style={styles.title}>Dashboard</h2>
          <p style={styles.subtitle}>ภาพรวมระบบจัดการตลาด</p>
        </div>
        <div style={{textAlign: 'right'}}>
          <span style={{padding: '8px 15px', background: '#e8eaf6', color: '#1a237e', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem'}}>
            📅 {new Date().toLocaleDateString('th-TH')}
          </span>
        </div>
      </div>

      <div style={styles.grid}>
        <StatCard title="รายได้รวม" value={`฿${totalIncome.toLocaleString()}`} icon="💰" color="#2E7D32" footer="เฉพาะรายการที่สำเร็จ" />
        <StatCard title="การจองทั้งหมด" value={bookedCount} icon="🎟️" color="#1565C0" footer={`ว่าง ${availableCount} ล็อก`} />
        
        {/* Card แจ้งเตือน */}
        <div style={{...styles.card, border: '2px solid #1976D2', backgroundColor: '#E3F2FD'}} className="anim-scale-in hover-scale">
           <div style={styles.cardIcon}>🔔</div>
           <div style={styles.cardLabel}>งานที่ต้องทำ</div>
           <div style={{...styles.cardValue, color: '#1565C0'}}>{pendingCheck}</div>
           <Link to="/admin/check-slip" style={{marginTop: 'auto', textDecoration: 'none', background: '#1976D2', color: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold'}}>
             ตรวจสอบสลิป ➝
           </Link>
        </div>
      </div>

      <div style={styles.section} className="anim-slide-up">
        <div style={styles.sectionHeader}>รายการจองล่าสุด (Recent Bookings)</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>ตลาด</th>
              <th style={styles.th}>ล็อก</th>
              <th style={styles.th}>ราคา</th>
              <th style={styles.th}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? bookings.slice().reverse().slice(0, 5).map((b, i) => (
              <tr key={b.id} style={{animationDelay: `${i * 0.1}s`}} className="anim-fade-in">
                <td style={{...styles.td, fontFamily: 'monospace', fontWeight: 'bold'}}>#{b.id}</td>
                <td style={styles.td}>{markets.find(m => m.id === b.marketId)?.name || '-'}</td>
                <td style={styles.td}><span style={{background:'#f5f5f5', padding:'2px 6px', borderRadius:'4px'}}>{b.lockId}</span></td>
                <td style={{...styles.td, fontWeight: 'bold'}}>฿{b.price.toLocaleString()}</td>
                <td style={styles.td}>
                  <span style={styles.badge(b.status)}>{styles.badge(b.status).label}</span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{...styles.td, textAlign: 'center', color: '#999'}}>ยังไม่มีข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}