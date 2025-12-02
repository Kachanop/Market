import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminHome({ bookings, markets }) {
  
  const totalIncome = bookings.filter(b => b.status === 'approved').reduce((sum, b) => sum + parseInt(b.price || 0), 0);
  const pendingCheck = bookings.filter(b => b.status === 'paid').length;
  let totalLocks = 0;
  markets.forEach(m => m.floors?.forEach(f => totalLocks += f.locks?.length || 0));
  const bookedCount = bookings.length;
  const availableCount = totalLocks - bookedCount;

  const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { fontSize: '2.5rem', fontWeight: '800', color: '#1C1C1E', marginBottom: '5px' },
    subtitle: { fontSize: '1.1rem', color: '#8E8E93' },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' },
    
    // iOS Widget Style
    card: {
      background: 'white', padding: '24px', borderRadius: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden',
      transition: 'transform 0.3s ease', cursor: 'default'
    },
    cardTitle: { fontSize: '0.9rem', fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' },
    cardValue: { fontSize: '2.5rem', fontWeight: '700', color: '#1C1C1E', marginTop: '8px' },
    cardIcon: { position: 'absolute', right: '20px', top: '20px', fontSize: '2rem', opacity: 0.8 },
    
    // Table Section
    sectionTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '20px' },
    tableContainer: { background: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0' },
    th: { textAlign: 'left', padding: '12px', color: '#8E8E93', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid #E5E5EA' },
    td: { padding: '16px 12px', borderBottom: '1px solid #E5E5EA', color: '#1C1C1E' },
    
    badge: (status) => {
      const colors = {
        pending_payment: { bg: '#FF9500', text: 'white' },
        paid: { bg: '#007AFF', text: 'white' },
        approved: { bg: '#34C759', text: 'white' },
        rejected: { bg: '#FF3B30', text: 'white' }
      };
      const c = colors[status] || { bg: '#E5E5EA', text: 'black' };
      return {
        padding: '6px 12px', borderRadius: '20px', background: c.bg, color: c.text,
        fontSize: '0.75rem', fontWeight: '700', display: 'inline-block'
      };
    }
  };

  return (
    <div style={styles.container} className="anim-fade">
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Overview of your market performance.</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card} className="anim-scale stagger-1">
          <span style={styles.cardIcon}>💰</span>
          <div style={styles.cardTitle}>Total Revenue</div>
          <div style={styles.cardValue}>฿{totalIncome.toLocaleString()}</div>
        </div>
        <div style={styles.card} className="anim-scale stagger-2">
           <span style={styles.cardIcon}>🎟️</span>
          <div style={styles.cardTitle}>Total Bookings</div>
          <div style={styles.cardValue}>{bookedCount}</div>
          <div style={{color: '#34C759', marginTop: '5px', fontSize: '0.9rem'}}>Available: {availableCount}</div>
        </div>
        
        {/* Action Card */}
        <Link to="/admin/check-slip" style={{textDecoration:'none'}}>
          <div style={{...styles.card, background: '#007AFF', color: 'white'}} className="anim-scale stagger-3 hover-scale">
            <span style={styles.cardIcon}>🔔</span>
            <div style={{...styles.cardTitle, color: 'rgba(255,255,255,0.8)'}}>Pending Actions</div>
            <div style={{...styles.cardValue, color: 'white'}}>{pendingCheck}</div>
            <div style={{marginTop: '10px', fontWeight: '600'}}>Check Slips →</div>
          </div>
        </Link>
      </div>

      <div>
        <h2 style={styles.sectionTitle}>Recent Activities</h2>
        <div style={styles.tableContainer} className="anim-slide-up">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Market</th>
                <th style={styles.th}>Lock</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice().reverse().slice(0, 5).map(b => (
                <tr key={b.id}>
                  <td style={styles.td}>#{b.id}</td>
                  <td style={styles.td}>{markets.find(m => m.id === b.marketId)?.name}</td>
                  <td style={styles.td}>{b.lockId}</td>
                  <td style={styles.td}>฿{b.price.toLocaleString()}</td>
                  <td style={styles.td}><span style={styles.badge(b.status)}>{b.status}</span></td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="5" style={{...styles.td, textAlign:'center', color:'#8E8E93'}}>No bookings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}