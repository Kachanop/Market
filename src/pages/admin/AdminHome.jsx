import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminHome({ bookings, markets }) {

  // --- 1. Overview Logic (คำนวณภาพรวมระบบ) ---
  // คำนวณรายได้ทั้งหมดจากรายการที่อนุมัติแล้ว
  const totalIncome = bookings.filter(b => b.status === 'approved').reduce((sum, b) => sum + parseInt(b.price || 0), 0);
  // นับจำนวนรายการที่รอตรวจสอบหลักฐานการโอน
  const pendingCheck = bookings.filter(b => b.status === 'paid').length;
  // คำนวณจำนวนล็อกทั้งหมดในทุกตลาดทุกชั้น
  let totalLocks = 0;
  markets.forEach(m => m.floors?.forEach(f => totalLocks += f.locks?.length || 0));
  // จำนวนที่ถูกจองไปแล้ว
  const bookedCount = bookings.length;
  // จำนวนล็อกว่างที่เหลือ
  const availableCount = totalLocks - bookedCount;

  // --- 2. Revenue by Market Logic (รายได้แยกตามตลาด) ---
  const revenueByMarket = markets.map(market => {
    // หาผลรวมรายได้ของแต่ละตลาด เฉพาะรายการที่อนุมัติแล้ว
    const marketIncome = bookings
      .filter(b => b.marketId === market.id && b.status === 'approved')
      .reduce((sum, b) => sum + parseInt(b.price || 0), 0);
    return {
      id: market.id,
      name: market.name,
      income: marketIncome
    };
  }).sort((a, b) => b.income - a.income); // เรียงลำดับจากมากไปน้อย

  // --- 3. Top Zone Logic (โซนขายดี) ---
  const zoneStats = {};
  bookings.forEach(b => {
    // นับสถิติจากรายการที่จ่ายเงินแล้วหรืออนุมัติแล้ว
    if (b.status === 'approved' || b.status === 'paid') {
      const market = markets.find(m => m.id === b.marketId);
      if (market) {
        const floor = market.floors?.find(f => f.floorNumber === b.floorNumber);
        const lock = floor?.locks?.find(l => l.id === b.lockId);
        // ถ้าไม่มีชื่อโซน ให้ใช้ชื่อ Default
        const zoneName = lock?.zone ? `Zone ${lock.zone}` : 'General Zone';
        const key = `${market.name} ${zoneName}`;
        zoneStats[key] = (zoneStats[key] || 0) + 1;
      }
    }
  });

  // แปลง object เป็น array และเลือก 5 อันดับแรก
  const topZones = Object.entries(zoneStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // --- Helper: Get Info for Table (ดึงข้อมูลสำหรับแสดงในตาราง) ---
  const getLockDetails = (booking) => {
    const market = markets.find(m => m.id === booking.marketId);
    const floor = market?.floors?.find(f => f.floorNumber === booking.floorNumber);
    const lock = floor?.locks?.find(l => l.id === booking.lockId);
    return {
      marketName: market?.name || 'Unknown',
      zone: lock?.zone || '-',
      floor: booking.floorNumber
    };
  };

  const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '80px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '2.5rem', fontWeight: '800', color: '#1C1C1E', marginBottom: '5px' },
    subtitle: { fontSize: '1.1rem', color: '#8E8E93' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' },

    card: {
      background: 'white', padding: '24px', borderRadius: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden',
      transition: 'transform 0.3s ease', cursor: 'default'
    },
    cardTitle: { fontSize: '0.9rem', fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.5px' },
    cardValue: { fontSize: '2.5rem', fontWeight: '700', color: '#1C1C1E', marginTop: '8px' },
    cardIcon: { position: 'absolute', right: '20px', top: '20px', fontSize: '2rem', opacity: 0.8 },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' },
    sectionTitle: { fontSize: '1.2rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '15px' },

    statItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
    statName: { fontWeight: '500', color: '#3A3A3C' },
    statValue: { fontWeight: '700', color: '#1C1C1E' },
    barContainer: { height: '6px', width: '100%', background: '#F2F2F7', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' },
    barFill: (percent, color) => ({ height: '100%', width: `${percent}%`, background: color, borderRadius: '3px' }),

    tableContainer: { background: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0' },
    th: { textAlign: 'left', padding: '12px', color: '#8E8E93', fontWeight: '600', fontSize: '0.9rem', borderBottom: '1px solid #E5E5EA', whiteSpace: 'nowrap' },
    td: { padding: '16px 12px', borderBottom: '1px solid #E5E5EA', color: '#1C1C1E', fontSize: '0.95rem' },

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

      {/* KPI Cards (การ์ดแสดงตัวเลขสำคัญ) */}
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
          <div style={{ color: '#34C759', marginTop: '5px', fontSize: '0.9rem' }}>Available: {availableCount} locks</div>
        </div>

        <Link to="/admin/check-slip" style={{ textDecoration: 'none' }}>
          <div style={{ ...styles.card, background: '#007AFF', color: 'white' }} className="anim-scale stagger-3 hover-scale">
            <span style={styles.cardIcon}>🔔</span>
            <div style={{ ...styles.cardTitle, color: 'rgba(255,255,255,0.8)' }}>Pending Actions</div>
            <div style={{ ...styles.cardValue, color: 'white' }}>{pendingCheck}</div>
            <div style={{ marginTop: '10px', fontWeight: '600' }}>Check Slips →</div>
          </div>
        </Link>
      </div>

      {/* NEW: Market Revenue & Top Zones (กราฟรายได้และโซนยอดนิยม) */}
      <div style={styles.statsGrid}>
        {/* Revenue by Market */}
        <div style={styles.card} className="anim-slide-up">
          <h3 style={styles.sectionTitle}>📈 Revenue by Market</h3>
          {revenueByMarket.length > 0 ? revenueByMarket.map((m, i) => {
            const percent = totalIncome > 0 ? (m.income / totalIncome) * 100 : 0;
            return (
              <div key={m.id} style={{ marginBottom: '15px' }}>
                <div style={styles.statItem}>
                  <span style={styles.statName}>{m.name}</span>
                  <span style={styles.statValue}>฿{m.income.toLocaleString()}</span>
                </div>
                <div style={styles.barContainer}>
                  <div style={styles.barFill(percent, '#34C759')}></div>
                </div>
              </div>
            );
          }) : <div style={{ color: '#8E8E93' }}>No revenue data yet.</div>}
        </div>

        {/* Top Zones */}
        <div style={styles.card} className="anim-slide-up" style={{ ...styles.card, animationDelay: '0.1s' }}>
          <h3 style={styles.sectionTitle}>🏆 Top Zones (Most Rented)</h3>
          {topZones.length > 0 ? topZones.map((z, i) => {
            const maxCount = topZones[0].count;
            const percent = (z.count / maxCount) * 100;
            return (
              <div key={i} style={{ marginBottom: '15px' }}>
                <div style={styles.statItem}>
                  <span style={styles.statName}>#{i + 1} {z.name}</span>
                  <span style={styles.statValue}>{z.count} Bookings</span>
                </div>
                <div style={styles.barContainer}>
                  <div style={styles.barFill(percent, '#007AFF')}></div>
                </div>
              </div>
            );
          }) : <div style={{ color: '#8E8E93' }}>No booking data yet.</div>}
        </div>
      </div>

      {/* Recent Activity Table with Zone (ตารางกิจกรรมล่าสุด) */}
      <div>
        <h2 style={{ ...styles.sectionTitle, fontSize: '1.5rem' }}>Recent Activities</h2>
        <div style={styles.tableContainer} className="anim-slide-up">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Market</th>
                <th style={styles.th}>Zone</th> {/* ✅ เพิ่มคอลัมน์ Zone */}
                <th style={styles.th}>Lock</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice().reverse().slice(0, 5).map(b => {
                const info = getLockDetails(b); // ดึงข้อมูลล็อกและโซน
                return (
                  <tr key={b.id}>
                    <td style={styles.td}>#{b.id}</td>
                    <td style={styles.td}>{info.marketName}</td>
                    <td style={styles.td}>
                      <span style={{ background: '#F2F2F7', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500', color: '#3A3A3C' }}>
                        {info.zone}
                      </span>
                    </td>
                    <td style={styles.td}>{b.lockId}</td>
                    <td style={styles.td}>฿{b.price.toLocaleString()}</td>
                    <td style={styles.td}><span style={styles.badge(b.status)}>{b.status}</span></td>
                  </tr>
                );
              })}
              {bookings.length === 0 && <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#8E8E93' }}>No bookings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}