import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Payment({ bookings, setBookings, markets }) {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [previewImg, setPreviewImg] = useState(null);

  const booking = bookings.find(b => b.id === parseInt(bookingId));

  // Validation: ถ้าไม่เจอ หรือสถานะไม่ใช่ pending ให้เด้งกลับ (ป้องกันการจ่ายซ้ำ)
  if (!booking) return <div style={{ padding: 40, textAlign: 'center' }}>Booking not found</div>;
  if (booking.status !== 'pending_payment' && booking.status !== 'rejected') {
    return <div style={{ padding: 40, textAlign: 'center' }}>Already paid or approved.</div>;
  }

  const market = markets.find(m => m.id === booking.marketId);

  // 🔥 Helper: ฟังก์ชันแปลงไฟล์เป็น Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // จัดการการอัปโหลดรูปภาพสลิป
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // จำกัดขนาดไฟล์ไม่เกิน 2MB เพื่อป้องกัน LocalStorage เต็มเร็วเกินไป
        if (file.size > 2 * 1024 * 1024) {
          alert("File size too large! Please upload image under 2MB.");
          return;
        }
        const base64 = await convertToBase64(file);
        setPreviewImg(base64);
      } catch (error) {
        console.error("Error converting file:", error);
        alert("Error uploading file.");
      }
    }
  };

  // บันทึกการชำระเงิน
  const handleSubmit = () => {
    if (!previewImg) return alert("Please upload slip.");

    // อัปเดตข้อมูลการจองจริงใน State
    const updatedBookings = bookings.map(b =>
      b.id === booking.id ? { ...b, status: 'paid', slipImage: previewImg } : b
    );

    setBookings(updatedBookings);
    alert("✅ Payment Submitted! Waiting for approval.");
    navigate('/customer/my-bookings');
  };

  const styles = {
    container: { padding: '40px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    card: {
      background: 'white', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '450px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.1)', textAlign: 'center'
    },
    title: { fontSize: '1.8rem', fontWeight: '800', marginBottom: '20px', color: '#1C1C1E' },
    amount: { fontSize: '2.5rem', fontWeight: '800', color: '#007AFF', marginBottom: '30px' },

    box: { background: '#F2F2F7', padding: '20px', borderRadius: '20px', marginBottom: '20px', textAlign: 'left' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#3A3A3C' },

    uploadBtn: {
      display: 'block', width: '100%', padding: '16px', border: '2px dashed #C7C7CC', borderRadius: '16px',
      color: '#8E8E93', cursor: 'pointer', marginBottom: '20px', background: 'white', position: 'relative', overflow: 'hidden'
    },
    confirmBtn: {
      width: '100%', padding: '16px', background: '#34C759', color: 'white', borderRadius: '16px',
      border: 'none', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', opacity: previewImg ? 1 : 0.5,
      transition: 'opacity 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="anim-scale">
        <h2 style={styles.title}>Confirm Payment</h2>
        <div style={styles.amount}>฿{booking.price.toLocaleString()}</div>

        <div style={styles.box}>
          <div style={styles.row}><span>Market</span> <b>{market?.name}</b></div>
          <div style={styles.row}><span>Lock</span> <b>{booking.lockId}</b></div>
          <hr style={{ border: '0', borderBottom: '1px solid #E5E5EA', margin: '10px 0' }} />
          <div style={{ fontSize: '0.8rem', color: '#8E8E93', textAlign: 'center' }}>Transfer to: KBANK 123-4-56789-0</div>
        </div>

        <label style={styles.uploadBtn}>
          {previewImg ? 'Tap to Change Slip' : 'Tap to Upload Slip'}
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </label>

        {previewImg && (
          <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
            <img src={previewImg} style={{ width: '100%', display: 'block' }} alt="Slip Preview" />
          </div>
        )}

        <button style={styles.confirmBtn} onClick={handleSubmit} disabled={!previewImg}>
          Submit Payment
        </button>
      </div>
    </div>
  );
}