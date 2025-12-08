import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyBookings({ bookings, setBookings, user, markets }) {
  const navigate = useNavigate();
  // กรองเฉพาะการจองของผู้ใช้ที่ล็อกอินอยู่
  const myBookings = bookings.filter(b => b.userId === user.id);

  const styles = {
    container: { padding: '40px 20px', maxWidth: '800px', margin: '0 auto' },
    header: { marginBottom: '40px', textAlign: 'center' },
    title: { fontSize: '2rem', fontWeight: '800', color: '#1C1C1E' },

    card: {
      background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '20px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      transition: 'transform 0.2s', border: '1px solid rgba(0,0,0,0.02)'
    },

    info: { display: 'flex', flexDirection: 'column', gap: '4px' },
    id: { fontSize: '0.8rem', color: '#8E8E93', fontWeight: '600' },
    marketName: { fontSize: '1.2rem', fontWeight: '700', color: '#1C1C1E' },
    details: { fontSize: '0.9rem', color: '#3A3A3C' },

    badge: (status) => {
      const config = {
        pending_payment: { bg: '#FF9500', text: 'white', label: 'Payment Pending' },
        paid: { bg: '#007AFF', text: 'white', label: 'In Review' },
        approved: { bg: '#34C759', text: 'white', label: 'Approved' },
        rejected: { bg: '#FF3B30', text: 'white', label: 'Rejected' }
      };
      const c = config[status] || {};
      return {
        padding: '6px 12px', borderRadius: '20px', background: c.bg, color: c.text,
        fontSize: '0.8rem', fontWeight: '700', alignSelf: 'center'
      };
    },

    btnPay: {
      padding: '8px 16px', background: '#1C1C1E', color: 'white', borderRadius: '20px',
      border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container} className="anim-fade">
      <div style={styles.header}>
        <h1 style={styles.title}>My Tickets</h1>
      </div>

      {myBookings.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#8E8E93', marginTop: 50 }}>No bookings found.</div>
      ) : (
        myBookings.slice().reverse().map((b, i) => (
          <div key={b.id} style={{ ...styles.card, animationDelay: `${i * 0.1}s` }} className="anim-slide-up">
            <div style={styles.info}>
              <span style={styles.id}>#{b.id}</span>
              <div style={styles.marketName}>{markets.find(m => m.id === b.marketId)?.name}</div>
              <div style={styles.details}>Lock: <b>{b.lockId}</b> (Floor {b.floorNumber})</div>
              <div style={styles.details}>{b.dates}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
              <span style={styles.badge(b.status)}>{styles.badge(b.status).label || b.status}</span>
              {b.status === 'pending_payment' && (
                <button style={styles.btnPay} onClick={() => navigate(`/customer/payment/${b.id}`)}>
                  Pay ฿{b.price.toLocaleString()}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}