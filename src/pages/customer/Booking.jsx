import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Booking({ markets, bookings, setBookings, user }) {
  const { marketId } = useParams();
  const navigate = useNavigate();
  
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [selectedLock, setSelectedLock] = useState(null);
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' });
  const [bookingTime, setBookingTime] = useState('08:00 - 18:00');
  const [totalPrice, setTotalPrice] = useState(0);

  const market = markets.find(m => m.id === parseInt(marketId));
  const currentFloor = market?.floors[selectedFloorIndex];

  // 🔥 Helper: คำนวณเส้นโค้ง (เหมือนหน้า Admin)
  const getSmoothPath = (points, defaultTension = 0) => {
    if (!points || points.length < 1) return "";
    if (points.length < 3) {
      return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + " Z";
    }
    const pts = points.map(p => ({x: p.x, y: p.y})); 
    const k = defaultTension; 
    const size = pts.length;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < size; i++) {
        const p0 = pts[(i - 1 + size) % size];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % size];
        const p3 = pts[(i + 2) % size];
        
        const tension1 = (points[i].curvature !== undefined) ? points[i].curvature : k;
        const tension2 = (points[(i + 1) % size].curvature !== undefined) ? points[(i + 1) % size].curvature : k;

        const cp1x = p1.x + (p2.x - p0.x) / 6 * tension1;
        const cp1y = p1.y + (p2.y - p0.y) / 6 * tension1;
        const cp2x = p2.x - (p3.x - p1.x) / 6 * tension2;
        const cp2y = p2.y - (p3.y - p1.y) / 6 * tension2;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path + " Z";
  };

  useEffect(() => {
    if (selectedLock && bookingDates.start && bookingDates.end) {
      const start = new Date(bookingDates.start);
      const end = new Date(bookingDates.end);
      const timeDiff = end.getTime() - start.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; 
      setTotalPrice(dayDiff > 0 ? dayDiff * selectedLock.price : 0);
    }
  }, [bookingDates, selectedLock]);

  const isLockBooked = (lockId) => {
    return bookings.some(b => b.marketId === market.id && b.lockId === lockId && b.status !== 'rejected');
  };

  const handleConfirmBooking = () => {
    if (!selectedLock || totalPrice <= 0) return alert("กรุณาเลือกวันจอง");
    const newBooking = {
      id: Date.now(), userId: user.id, marketId: market.id, floorNumber: currentFloor.floorNumber,
      lockId: selectedLock.id, dates: `${bookingDates.start} ถึง ${bookingDates.end}`, time: bookingTime,
      price: totalPrice, status: 'pending_payment', slipImage: null
    };
    setBookings([...bookings, newBooking]);
    navigate('/customer/my-bookings');
  };

  const styles = {
    container: { padding: '30px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif", backgroundColor: '#FAFCFB' },
    flexContainer: { display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '30px' },
    
    // Map Section
    mapSection: { flex: 3, minWidth: '400px', backgroundColor: 'white', borderRadius: '16px', padding: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eee' },
    mapWrapper: { position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', lineHeight: 0, backgroundColor: '#f9f9f9' },
    mapImage: { width: '100%', display: 'block', pointerEvents: 'none' },
    svgOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
    
    // Form Section
    formSection: { flex: 2, minWidth: '300px', backgroundColor: '#F7FDF9', padding: '30px', borderRadius: '20px', border: '1px solid #E6F4EA' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#1a1a1a' },
    inputBox: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #A7F3D0', backgroundColor: '#FFFFFF', fontSize: '1rem', outline: 'none' },
    btnNext: { width: '100%', padding: '15px', backgroundColor: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' },
    floorBtn: (isActive) => ({ padding: '8px 16px', marginRight: '8px', borderRadius: '50px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', backgroundColor: isActive ? '#1a1a1a' : 'white', color: isActive ? 'white' : '#1a1a1a', transition: 'all 0.2s' }),
    
    // Custom Field Display
    customFieldBox: { marginTop: '10px', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #A7F3D0', fontSize: '0.9rem', color: '#555' },
    cfRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }
  };

  if (!market) return <div style={{padding: 20}}>ไม่พบตลาด</div>;

  return (
    <div style={styles.container}>
      <div>
        <h1 style={{margin:0, fontSize:'1.8rem', color: '#111'}}>📍 {market.name}</h1>
        <p style={{color:'#666', margin:'5px 0'}}>เลือกทำเลค้าขายที่คุณต้องการ</p>
      </div>

      <div style={styles.flexContainer}>
        {/* --- Map Section --- */}
        <div style={styles.mapSection}>
          <div style={{ marginBottom: '15px' }}>
            {market.floors.map((f, index) => (
              <button key={index} onClick={() => { setSelectedFloorIndex(index); setSelectedLock(null); }} style={styles.floorBtn(selectedFloorIndex === index)}>
                ชั้น {f.floorNumber}
              </button>
            ))}
          </div>

          {currentFloor ? (
            <div style={styles.mapWrapper}>
              <img src={currentFloor.image} alt="Map" style={styles.mapImage} />
              
              <svg style={styles.svgOverlay} viewBox="0 0 100 100" preserveAspectRatio="none">
                {currentFloor.locks.map(lock => {
                  if (!lock.isPolygon) return null;
                  const booked = isLockBooked(lock.id);
                  const isSelected = selectedLock?.id === lock.id;
                  return (
                    <g key={lock.id} onClick={() => !booked && setSelectedLock(lock)} style={{cursor: booked?'not-allowed':'pointer'}}>
                        {/* 🔥 Render Path แทน Polygon เพื่อรองรับ Curve */}
                        <path 
                          d={getSmoothPath(lock.points, lock.curvature || 0)} 
                          fill={booked ? '#EF4444' : (isSelected ? '#F59E0B' : (lock.color || '#4ADE80'))}
                          fillOpacity={isSelected ? '0.8' : '0.5'}
                          stroke={isSelected ? '#111' : (lock.strokeColor || 'white')}
                          strokeWidth={isSelected ? '0.5' : (lock.borderRadius || 0.5)}
                          strokeLinejoin="round" strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                        <text x={lock.x} y={lock.y} fontSize={Math.max(0.2, (lock.fontSize/10 || 0.3))} fill="black" textAnchor="middle" alignmentBaseline="middle" style={{pointerEvents:'none'}}>
                          {lock.id}
                        </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div style={{ padding: 60, textAlign: 'center', backgroundColor: '#f9f9f9', color: '#999' }}>ยังไม่มีแผนผังในชั้นนี้</div>
          )}
          
          <div style={{ marginTop: '15px', display: 'flex', gap: '15px', justifyContent: 'center', fontSize: '0.8rem', color: '#666' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width:12,height:12,background:'#E5E7EB',border:'2px solid #ccc',borderRadius:'4px'}}></div> ว่าง</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width:12,height:12,background:'#EF4444',borderRadius:'4px'}}></div> จองแล้ว</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width:12,height:12,background:'#F59E0B',borderRadius:'4px'}}></div> ที่เลือกอยู่</div>
          </div>
        </div>

        {/* --- Form Section (ขวา) --- */}
        <div style={styles.formSection}>
          <div style={styles.formGroup}>
            <label style={styles.label}>ชั้น (Floor)</label>
            <input style={{...styles.inputBox, color: '#2E8B57', fontWeight: 'bold'}} value={currentFloor?.floorNumber || ''} readOnly />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>ล็อก (Stall)</label>
            <input style={styles.inputBox} placeholder="คลิกเลือกบนแผนที่..." value={selectedLock ? selectedLock.id : ''} readOnly />
            
            {/* แสดงรายละเอียดล็อก */}
            {selectedLock && (
               <div style={styles.customFieldBox}>
                  <div style={styles.cfRow}><span>🏷️ โซน:</span> <strong>{selectedLock.zone || '-'}</strong></div>
                  <div style={styles.cfRow}><span>📏 พื้นที่:</span> <strong>{selectedLock.area || '-'} ตร.ม.</strong></div>
                  <div style={styles.cfRow}><span>💰 ราคา:</span> <strong>{selectedLock.price.toLocaleString()} บาท/วัน</strong></div>
                  
                  {/* 🔥 แสดง Custom Fields (ถ้ามี) */}
                  {selectedLock.customFields && selectedLock.customFields.length > 0 && (
                    <div style={{marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #ddd'}}>
                      {selectedLock.customFields.map((field, idx) => (
                        <div key={idx} style={styles.cfRow}>
                          <span style={{color:'#666'}}>{field.label}:</span> 
                          <span>{field.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            )}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>วันที่จอง (Start - End)</label>
            <div style={{display:'flex', gap:'10px'}}>
              <input type="date" style={styles.inputBox} value={bookingDates.start} onChange={(e) => setBookingDates({ ...bookingDates, start: e.target.value })} />
              <input type="date" style={styles.inputBox} min={bookingDates.start} value={bookingDates.end} onChange={(e) => setBookingDates({ ...bookingDates, end: e.target.value })} />
            </div>
          </div>
          
          <div style={styles.formGroup}>
             <label style={styles.label}>เวลาขาย</label>
             <input type="text" style={styles.inputBox} value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
          </div>
          
          <div style={{ marginTop: '30px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
            {totalPrice > 0 && (
              <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{fontWeight:'bold', color:'#555'}}>ยอดรวมสุทธิ:</span>
                 <span style={{fontWeight: 'bold', fontSize: '1.4rem', color: '#22C55E'}}>฿{totalPrice.toLocaleString()}</span>
              </div>
            )}
            <button 
              style={{...styles.btnNext, opacity: (selectedLock && totalPrice > 0) ? 1 : 0.5, cursor: (selectedLock && totalPrice > 0) ? 'pointer' : 'not-allowed'}} 
              onClick={handleConfirmBooking} 
              disabled={!selectedLock || totalPrice <= 0}
            >
              ยืนยันการจอง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}