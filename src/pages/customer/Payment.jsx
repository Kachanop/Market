import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Payment({ bookings, setBookings, markets }) {
  const { bookingId } = useParams(); // รับ ID การจองจาก URL
  const navigate = useNavigate();
  const [previewImg, setPreviewImg] = useState(null);

  // 1. ค้นหาข้อมูลการจอง
  const booking = bookings.find(b => b.id === parseInt(bookingId));
  
  // 2. ถ้าไม่เจอ หรือจ่ายไปแล้ว ให้เด้งออก
  if (!booking) return <div style={{padding:20}}>ไม่พบข้อมูลการจอง</div>;
  if (booking.status !== 'pending_payment' && booking.status !== 'rejected') {
    return <div style={{padding:20}}>รายการนี้ชำระเงินแล้ว</div>;
  }

  // ค้นหาข้อมูลตลาดเพื่อแสดงชื่อ
  const market = markets.find(m => m.id === booking.marketId);

  // 3. ฟังก์ชันจัดการไฟล์
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  // 4. บันทึกแจ้งโอน
  const handleSubmit = () => {
    if (!previewImg) return alert("กรุณาแนบรูปสลิปก่อนยืนยัน");

    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        return { 
          ...b, 
          status: 'paid', // เปลี่ยนสถานะเป็น รอตรวจสอบ
          slipImage: previewImg 
        };
      }
      return b;
    });

    setBookings(updatedBookings);
    alert("✅ แจ้งโอนเงินเรียบร้อย! เจ้าหน้าที่จะตรวจสอบเร็วๆ นี้");
    navigate('/customer/my-bookings'); // กลับไปหน้ารายการ
  };

  // --- Styles ---
  const styles = {
    container: { padding: '40px 20px', minHeight: '100vh', backgroundColor: '#f4f6f9', display: 'flex', justifyContent: 'center' },
    card: { backgroundColor: 'white', maxWidth: '500px', width: '100%', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' },
    header: { backgroundColor: '#2E8B57', color: 'white', padding: '20px', textAlign: 'center' },
    body: { padding: '30px' },
    
    // Bank Section
    bankBox: { backgroundColor: '#e9ecef', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', border: '1px dashed #999' },
    bankName: { fontSize: '1.2rem', fontWeight: 'bold', color: '#333' },
    accNumber: { fontSize: '1.5rem', color: '#2E8B57', fontWeight: 'bold', margin: '10px 0', letterSpacing: '2px' },
    
    // Details
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' },
    totalPrice: { fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'right', color: '#d9534f', marginTop: '15px' },
    
    // Upload Section
    uploadSection: { marginTop: '25px', textAlign: 'center' },
    input: { display: 'none' }, // ซ่อน input จริง
    uploadLabel: {
      display: 'inline-block', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', 
      borderRadius: '5px', cursor: 'pointer', marginBottom: '10px'
    },
    preview: { width: '100%', maxHeight: '300px', objectFit: 'contain', marginTop: '10px', borderRadius: '8px', border: '1px solid #ddd' },
    
    btnConfirm: { width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{margin: 0}}>💸 แจ้งชำระเงิน</h2>
          <p style={{margin: '5px 0 0', opacity: 0.9}}>Booking ID: #{booking.id}</p>
        </div>

        <div style={styles.body}>
          {/* 1. รายละเอียดบัญชีธนาคาร */}
          <div style={styles.bankBox}>
            <p style={{margin:0, color:'#666'}}>โอนเงินเข้าบัญชี</p>
            <div style={styles.bankName}>🏦 ธนาคารกสิกรไทย (KBANK)</div>
            <div style={styles.accNumber}>123-4-56789-0</div>
            <p style={{margin:0}}>ชื่อบัญชี: บจก. ตลาดออนไลน์</p>
          </div>

          {/* 2. สรุปยอด */}
          <div>
            <div style={styles.row}><span>ตลาด:</span> <strong>{market?.name}</strong></div>
            <div style={styles.row}><span>ล็อก:</span> <strong>{booking.lockId}</strong></div>
            <div style={styles.row}><span>วันที่:</span> <span>{booking.dates}</span></div>
            
            <div style={{ textAlign: 'right', marginTop: '10px' }}>ยอดที่ต้องชำระ:</div>
            <div style={styles.totalPrice}>฿{booking.price.toLocaleString()}</div>
          </div>

          {/* 3. ส่วนอัปโหลด */}
          <div style={styles.uploadSection}>
            <hr />
            <p>หลักฐานการโอนเงิน (สลิป)</p>
            
            <label htmlFor="slip-upload" style={styles.uploadLabel}>
              📷 เลือกรูปภาพสลิป
            </label>
            <input 
              id="slip-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={styles.input} 
            />

            {previewImg && (
              <div>
                <img src={previewImg} alt="Slip Preview" style={styles.preview} />
              </div>
            )}

            <button 
              style={{...styles.btnConfirm, opacity: previewImg ? 1 : 0.5}} 
              onClick={handleSubmit}
              disabled={!previewImg}
            >
              ยืนยันการโอนเงิน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}