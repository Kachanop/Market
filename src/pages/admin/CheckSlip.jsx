import React, { useState } from 'react';

// ✅ เพิ่ม export default ตรงนี้ เพื่อแก้ปัญหา Error ใน App.jsx
export default function CheckSlip({ bookings, setBookings, markets }) {
  const [selectedImg, setSelectedImg] = useState(null); // สำหรับเก็บ url รูปที่กดดูขยาย

  // 1. กรองเฉพาะรายการที่สถานะเป็น 'paid' (รอตรวจสอบ)
  const pendingBookings = bookings.filter(b => b.status === 'paid');

  // 2. ฟังก์ชันอัปเดตสถานะ
  const handleUpdateStatus = (bookingId, newStatus) => {
    const confirmMsg = newStatus === 'approved' ? 'ยืนยันการอนุมัติ?' : 'ยืนยันการปฏิเสธ?';
    if (!window.confirm(confirmMsg)) return;

    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: newStatus };
      }
      return b;
    });

    setBookings(updatedBookings);
  };

  // Helper หาชื่อตลาดจาก ID
  const getMarketName = (id) => {
    const market = markets?.find(m => m.id === id);
    return market ? market.name : 'ไม่ระบุตลาด';
  };

  // --- Styles ---
  const styles = {
    container: { padding: '20px', backgroundColor: '#f4f6f9', minHeight: '100vh' },
    header: { marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow: 'hidden' },
    cardHeader: { backgroundColor: '#0275d8', color: 'white', padding: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' },
    cardBody: { padding: '15px' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' },
    slipThumbnail: { 
      width: '100%', height: '200px', objectFit: 'cover', cursor: 'zoom-in', 
      border: '1px solid #ddd', borderRadius: '5px', marginTop: '10px' 
    },
    actions: { display: 'flex', gap: '10px', marginTop: '15px' },
    btnApprove: { flex: 1, backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    btnReject: { flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    emptyState: { textAlign: 'center', marginTop: '50px', color: '#888' },
    
    // Modal Styles (Popup ดูรูป)
    modalOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    },
    modalImage: { maxWidth: '90%', maxHeight: '90%', borderRadius: '5px', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>💰 ตรวจสอบสลิปการโอนเงิน</h2>
        <p>รายการที่ลูกค้ายืนยันการโอนแล้ว ({pendingBookings.length} รายการ)</p>
      </div>

      {pendingBookings.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>✅ ไม่มีรายการรอตรวจสอบ</h3>
          <p>คุณจัดการครบทุกรายการแล้ว</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {pendingBookings.map(item => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span>Order #{item.id}</span>
                <span>฿{item.price.toLocaleString()}</span>
              </div>
              
              <div style={styles.cardBody}>
                <div style={styles.row}>
                  <strong>ตลาด:</strong> <span>{getMarketName(item.marketId)}</span>
                </div>
                <div style={styles.row}>
                  <strong>ล็อก:</strong> <span>{item.lockId} (ชั้น {item.floorNumber})</span>
                </div>
                <div style={styles.row}>
                  <strong>วันที่จอง:</strong> <span style={{fontSize: '0.9rem'}}>{item.dates}</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <small style={{ color: '#666' }}>คลิกที่รูปเพื่อดูภาพขยาย</small>
                  {item.slipImage ? (
                    <img 
                      src={item.slipImage} 
                      alt="slip" 
                      style={styles.slipThumbnail}
                      onClick={() => setSelectedImg(item.slipImage)}
                    />
                  ) : (
                    <div style={{...styles.slipThumbnail, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0'}}>
                      ไม่มีไฟล์แนบ
                    </div>
                  )}
                </div>

                <div style={styles.actions}>
                  <button 
                    style={styles.btnApprove}
                    onClick={() => handleUpdateStatus(item.id, 'approved')}
                  >
                    อนุมัติ ✅
                  </button>
                  <button 
                    style={styles.btnReject}
                    onClick={() => handleUpdateStatus(item.id, 'rejected')}
                  >
                    ปฏิเสธ ❌
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal ดูรูปขยาย */}
      {selectedImg && (
        <div style={styles.modalOverlay} onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} style={styles.modalImage} alt="Full Slip" />
        </div>
      )}
    </div>
  );
}