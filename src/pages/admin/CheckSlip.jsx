import React, { useState } from 'react';

export default function CheckSlip({ bookings, setBookings, markets }) {
  const [selectedImg, setSelectedImg] = useState(null);
  
  // กรองเฉพาะรายการที่สถานะเป็น 'paid' (รอตรวจสอบ)
  const pendingBookings = bookings.filter(b => b.status === 'paid');

  const handleUpdate = (id, status) => {
    const action = status === 'approved' ? 'Approve' : 'Reject';
    if (!window.confirm(`Confirm ${action} this payment?`)) return;
    
    // อัปเดตสถานะใน State หลัก
    const updatedBookings = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(updatedBookings);
    
    // บันทึกลง localStorage ทันที (เผื่อ App.jsx ยังไม่ sync หรือ user ปิดหน้าเว็บเร็ว)
    localStorage.setItem('app_bookings', JSON.stringify(updatedBookings));
  };

  const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
    title: { fontSize: '2rem', fontWeight: '800', marginBottom: '30px', color: '#1C1C1E' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: {
      background: 'white', borderRadius: '24px', padding: '20px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)', position: 'relative', display: 'flex', flexDirection: 'column'
    },
    imgContainer: {
      width: '100%', height: '200px', borderRadius: '16px', marginBottom: '15px', 
      overflow: 'hidden', cursor: 'zoom-in', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    img: { width: '100%', height: '100%', objectFit: 'contain' },
    info: { flex: 1 },
    actions: { display: 'flex', gap: '10px', marginTop: '15px' },
    btn: (type) => ({
      flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer',
      background: type === 'approve' ? '#34C759' : '#FF3B30', color: 'white', transition: 'transform 0.1s'
    }),
    empty: { textAlign: 'center', color: '#8E8E93', marginTop: '50px', fontSize: '1.2rem' }
  };

  return (
    <div style={styles.container} className="anim-fade">
      <h1 style={styles.title}>Verify Payments ({pendingBookings.length})</h1>
      
      {pendingBookings.length === 0 ? (
        <div style={styles.empty}>✅ All caught up! No pending slips.</div>
      ) : (
        <div style={styles.grid}>
          {pendingBookings.map(item => (
             <div key={item.id} style={styles.card} className="anim-scale">
                <div style={styles.imgContainer} onClick={() => setSelectedImg(item.slipImage)}>
                   {item.slipImage ? (
                     <img src={item.slipImage} style={styles.img} alt="Slip" />
                   ) : (
                     <span style={{color:'#999'}}>No Image</span>
                   )}
                </div>
                
                <div style={styles.info}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', alignItems:'center'}}>
                     <span style={{fontWeight:'700', fontSize:'1.1rem'}}>#{item.id}</span>
                     <span style={{color:'#007AFF', fontWeight:'800', fontSize:'1.2rem'}}>฿{item.price.toLocaleString()}</span>
                  </div>
                  <div style={{fontSize:'0.9rem', color:'#8E8E93', marginBottom:'4px'}}>
                     📍 {markets.find(m => m.id === item.marketId)?.name}
                  </div>
                  <div style={{fontSize:'0.9rem', color:'#3A3A3C'}}>
                     🔐 Lock: <b>{item.lockId}</b> (Floor {item.floorNumber})
                  </div>
                  <div style={{fontSize:'0.8rem', color:'#8E8E93', marginTop:'4px'}}>
                     📅 {item.dates}
                  </div>
                </div>

                <div style={styles.actions}>
                   <button 
                     style={styles.btn('approve')} 
                     onClick={() => handleUpdate(item.id, 'approved')}
                     onMouseDown={e => e.target.style.transform = 'scale(0.95)'}
                     onMouseUp={e => e.target.style.transform = 'scale(1)'}
                   >
                     Approve
                   </button>
                   <button 
                     style={styles.btn('reject')} 
                     onClick={() => handleUpdate(item.id, 'rejected')}
                     onMouseDown={e => e.target.style.transform = 'scale(0.95)'}
                     onMouseUp={e => e.target.style.transform = 'scale(1)'}
                   >
                     Reject
                   </button>
                </div>
             </div>
          ))}
        </div>
      )}

      {selectedImg && (
        <div 
          style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center', cursor:'zoom-out'}} 
          onClick={() => setSelectedImg(null)}
        >
           <img src={selectedImg} style={{maxWidth:'90%', maxHeight:'90%', borderRadius:'12px', boxShadow:'0 20px 50px rgba(0,0,0,0.5)'}} />
        </div>
      )}
    </div>
  );
}