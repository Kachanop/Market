import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminHome({ bookings, markets }) {
  
  // --- ส่วนการคำนวณข้อมูล (Logic) ---

  // 1. คำนวณรายได้ (เฉพาะบิลที่ Anwpprod/อนุมัติแล้ว)
  const totalIncome = bookings
    .filter(b => b.status === 'approved')
    .reduce((sum, b) => sum + parseInt(b.price || 0), 0);

  // 2. คำนวณยอดรอตรวจสอบ (เพื่อเตือนแอดมิน)
  const pendingCheck = bookings.filter(b => b.status === 'paid').length;

  // 3. นับจำนวนล็อกทั้งหมดในระบบ (Loop ทุกตลาด ทุกชั้น)
  let totalLocks = 0;
  markets.forEach(market => {
    if (market.floors) {
      market.floors.forEach(floor => {
        if (floor.locks) {
          totalLocks += floor.locks.length;
        }
      });
    }
  });

  // 4. สถานะล็อก
  const bookedCount = bookings.length; // จำนวนที่ถูกจอง (รวมทุกสถานะ)
  const availableCount = totalLocks - bookedCount; // ล็อกที่ว่าง

  // --- ส่วน Style (CSS) ---
  const styles = {
    container: { padding: '20px', backgroundColor: '#f4f6f9', minHeight: '90vh' },
    header: { marginBottom: '20px' },
    cardContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    card: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    cardTitle: { fontSize: '1.1rem', color: '#666', marginBottom: '10px' },
    cardValue: { fontSize: '2rem', fontWeight: 'bold', color: '#333' },
    sectionTitle: { borderLeft: '5px solid #2E8B57', paddingLeft: '10px', marginBottom: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' },
    th: { backgroundColor: '#2E8B57', color: 'white', padding: '12px', textAlign: 'left' },
    td: { padding: '12px', borderBottom: '1px solid #ddd' },
    statusBadge: (status) => {
      const colors = {
        pending_payment: '#f0ad4e', // สีส้ม (รอจ่าย)
        paid: '#0275d8',            // สีฟ้า (รอตรวจ)
        approved: '#5cb85c',        // สีเขียว (อนุมัติ)
        rejected: '#d9534f'         // สีแดง (ปฏิเสธ)
      };
      return {
        backgroundColor: colors[status] || '#999',
        color: 'white',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '0.8rem'
      };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>📊 แดชบอร์ดภาพรวม (Admin Dashboard)</h2>
        <p>ยินดีต้อนรับผู้ดูแลระบบ</p>
      </div>

      {/* Cards แสดงผลลัพธ์ */}
      <div style={styles.cardContainer}>
        {/* รายได้ */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>💰 รายได้รวม (อนุมัติแล้ว)</div>
          <div style={{ ...styles.cardValue, color: '#28a745' }}>
            ฿{totalIncome.toLocaleString()}
          </div>
          <small>จากยอดจองที่ยืนยันแล้ว</small>
        </div>

        {/* ล็อกที่ถูกจอง */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🎟️ ล็อกที่ถูกจอง</div>
          <div style={styles.cardValue}>{bookedCount}</div>
          <small>ล็อก</small>
        </div>

        {/* ล็อกที่ว่าง */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>✅ ล็อกที่ว่าง</div>
          <div style={styles.cardValue}>{availableCount}</div>
          <small>จากทั้งหมด {totalLocks} ล็อก</small>
        </div>

        {/* แจ้งเตือนงานที่ต้องทำ */}
        <div style={{...styles.card, border: '2px solid #0275d8'}}>
          <div style={styles.cardTitle}>🔔 รอตรวจสอบสลิป</div>
          <div style={{...styles.cardValue, color: '#0275d8'}}>{pendingCheck}</div>
          <Link to="/admin/check-slip" style={{ textDecoration: 'none', color: '#0275d8', fontWeight: 'bold' }}>
            ไปหน้าตรวจสอบ &rarr;
          </Link>
        </div>
      </div>

      {/* ตารางรายการจองล่าสุด */}
      <h3 style={styles.sectionTitle}>รายการจองล่าสุด 5 รายการ</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>รหัสจอง</th>
            <th style={styles.th}>ตลาด</th>
            <th style={styles.th}>ล็อก</th>
            <th style={styles.th}>ราคา</th>
            <th style={styles.th}>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.slice().reverse().slice(0, 5).map((b) => {
              // หาชื่อตลาดจาก ID
              const marketName = markets.find(m => m.id === b.marketId)?.name || 'Unknown';
              return (
                <tr key={b.id}>
                  <td style={styles.td}>#{b.id}</td>
                  <td style={styles.td}>{marketName}</td>
                  <td style={styles.td}>{b.lockId}</td>
                  <td style={styles.td}>{b.price} บาท</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(b.status)}>
                      {b.status === 'pending_payment' && 'รอชำระเงิน'}
                      {b.status === 'paid' && 'รอตรวจสอบ'}
                      {b.status === 'approved' && 'อนุมัติแล้ว'}
                      {b.status === 'rejected' && 'ถูกปฏิเสธ'}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" style={{...styles.td, textAlign: 'center'}}>ยังไม่มีข้อมูลการจอง</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}