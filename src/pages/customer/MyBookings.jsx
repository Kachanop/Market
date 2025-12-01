import React from 'react';

export default function MyBookings({ bookings, setBookings, user, markets }) {
  // 1. กรองเฉพาะรายการของ User คนปัจจุบัน
  const myBookings = bookings.filter(b => b.userId === user.id);

  // 2. ฟังก์ชันหาชื่อตลาด
  const getMarketName = (marketId) => {
    const market = markets.find(m => m.id === marketId);
    return market ? market.name : 'ไม่ระบุตลาด';
  };

  // 3. ฟังก์ชันอัปโหลดสลิป
  const handleFileUpload = (event, bookingId) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // จำลอง URL ของไฟล์ภาพ

      // อัปเดตข้อมูลการจอง
      const updatedBookings = bookings.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            slipImage: imageUrl, // บันทึกรูป
            status: 'paid'       // เปลี่ยนสถานะเป็น 'รอตรวจสอบ'
          };
        }
        return b;
      });

      setBookings(updatedBookings);
      alert("✅ แนบสลิปเรียบร้อย! กรุณารอแอดมินตรวจสอบ");
    }
  };

  // --- Styles ---
  const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f9f9f9' },
    header: { marginBottom: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px' },
    listContainer: { display: 'grid', gap: '20px' },
    card: { 
      backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexWrap: 'wrap',
      borderLeft: '5px solid #ccc' // Default border color
    },
    // Dynamic border color based on status
    cardStatusColor: (status) => {
      switch(status) {
        case 'approved': return '#28a745'; // เขียว
        case 'pending_payment': return '#ffc107'; // เหลือง
        case 'paid': return '#17a2b8'; // ฟ้า
        case 'rejected': return '#dc3545'; // แดง
        default: return '#ccc';
      }
    },
    content: { padding: '20px', flex: 1, minWidth: '300px' },
    actionSection: { 
      padding: '20px', width: '250px', backgroundColor: '#f8f9fa', 
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      borderLeft: '1px solid #eee'
    },
    row: { marginBottom: '8px', fontSize: '0.95rem' },
    label: { fontWeight: 'bold', color: '#555', marginRight: '5px' },
    badge: (status) => ({
      display: 'inline-block', padding: '5px 10px', borderRadius: '15px', 
      fontSize: '0.8rem', fontWeight: 'bold', color: 'white',
      backgroundColor: styles.cardStatusColor(status)
    }),
    uploadBtn: {
      marginTop: '10px',
      padding: '8px 15px',
      backgroundColor: '#2E8B57',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      width: '100%'
    },
    inputFile: { marginTop: '10px', fontSize: '0.9rem', maxWidth: '200px' },
    slipPreview: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px', border: '1px solid #ddd', marginTop: '10px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>🎟️ การจองของฉัน (My Bookings)</h2>
        <p>ตรวจสอบสถานะและชำระเงิน</p>
      </div>

      {myBookings.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>
          <h3>คุณยังไม่มีรายการจอง</h3>
          <p>ไปเลือกจองล็อกทำเลทองกันเถอะ!</p>
        </div>
      ) : (
        <div style={styles.listContainer}>
          {myBookings.slice().reverse().map(item => (
            <div 
              key={item.id} 
              style={{...styles.card, borderLeft: `5px solid ${styles.cardStatusColor(item.status)}`}}
            >
              
              {/* ส่วนข้อมูลการจอง */}
              <div style={styles.content}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>#{item.id}</span>
                  <span style={styles.badge(item.status)}>
                    {item.status === 'pending_payment' && 'รอชำระเงิน'}
                    {item.status === 'paid' && 'รอตรวจสอบ'}
                    {item.status === 'approved' && 'อนุมัติแล้ว'}
                    {item.status === 'rejected' && 'ถูกปฏิเสธ'}
                  </span>
                </div>
                
                <div style={styles.row}><span style={styles.label}>ตลาด:</span> {getMarketName(item.marketId)}</div>
                <div style={styles.row}><span style={styles.label}>ล็อก:</span> {item.lockId} (ชั้น {item.floorNumber})</div>
                <div style={styles.row}><span style={styles.label}>วันที่:</span> {item.dates}</div>
                <div style={styles.row}><span style={styles.label}>ราคา:</span> <span style={{color: '#2E8B57', fontWeight: 'bold'}}>{item.price.toLocaleString()} บาท</span></div>
              </div>

              {/* ส่วนจัดการ (อัปโหลด/แสดงผล) */}
              <div style={styles.actionSection}>
                
                {/* 1. กรณีรอชำระเงิน: แสดงปุ่มอัปโหลด */}
                {item.status === 'pending_payment' && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>กรุณาแนบสลิป</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, item.id)}
                      style={styles.inputFile}
                    />
                  </div>
                )}

                {/* 2. กรณีจ่ายแล้ว หรือ อนุมัติแล้ว: แสดงรูปสลิป */}
                {(item.status === 'paid' || item.status === 'approved') && item.slipImage && (
                  <div style={{ textAlign: 'center' }}>
                     <p style={{ fontSize: '0.8rem', color: 'green' }}>✅ ส่งสลิปแล้ว</p>
                     <a href={item.slipImage} target="_blank" rel="noreferrer">
                       <img src={item.slipImage} alt="Slip" style={styles.slipPreview} />
                     </a>
                  </div>
                )}

                {/* 3. กรณีถูกปฏิเสธ */}
                {item.status === 'rejected' && (
                  <div style={{ textAlign: 'center', color: '#dc3545' }}>
                    <p>❌ สลิปไม่ถูกต้อง</p>
                    <small>กรุณาติดต่อเจ้าหน้าที่</small>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}