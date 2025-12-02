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
  
  // 🔥 FIX: อ่านขนาดแผนที่ Admin จาก Local Storage เพื่อใช้เป็น MAX WIDTH
  const [adminMapSize] = useState(() => {
    try {
        const size = localStorage.getItem('admin_map_size');
        // ให้ค่า default ที่เหมาะสม ถ้าหาไม่เจอ
        return size ? JSON.parse(size) : { width: 750, height: 500 }; 
    } catch (e) {
        return { width: 750, height: 500 };
    }
  });

  // Helper: ฟังก์ชันวาดเส้นโค้ง (Path Smoother)
  const getSmoothPath = (points, defaultTension = 0) => {
    if (!points || points.length < 1) return "";
    if (points.length < 3) return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + " Z";
    
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

  // เช็คสถานะล็อก
  const getLockStatus = (lockId) => {
    const booking = bookings.find(b => 
      b.marketId === market.id && 
      b.lockId === lockId && 
      b.status !== 'rejected' 
    );

    if (!booking) return 'available'; 
    if (booking.status === 'approved') return 'booked'; 
    return 'pending'; 
  };

  const handleConfirmBooking = () => {
    if (!selectedLock || totalPrice <= 0) return alert("Please select dates.");
    if (getLockStatus(selectedLock.id) !== 'available') return alert("This stall is currently booked or pending.");

    const newBooking = {
      id: Date.now(), userId: user.id, marketId: market.id, floorNumber: currentFloor.floorNumber,
      lockId: selectedLock.id, dates: `${bookingDates.start} to ${bookingDates.end}`, time: bookingTime,
      price: totalPrice, status: 'pending_payment', slipImage: null
    };
    setBookings([...bookings, newBooking]);
    navigate('/customer/my-bookings');
  };

  const styles = {
    container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { fontSize: '2.5rem', fontWeight: '800', color: '#1C1C1E' },
    
    layout: { display: 'flex', gap: '30px', flexDirection: 'row', flexWrap: 'wrap' },
    
    // 🔥 FIX: ใช้ adminMapSize มาบังคับ max-width
    mapPanel: { 
        flex: 3, 
        minWidth: '350px', 
        width: '100%', 
        // บังคับความกว้างสูงสุดตามที่ Admin เห็น (ใช้ width จาก Local Storage)
        maxWidth: `${adminMapSize.width + 40}px`, // + 40px เพื่อรวม padding 20px ซ้าย/ขวา
        background: 'white', 
        borderRadius: '24px', 
        padding: '20px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
    },
    
    mapContainer: (aspectRatio) => ({ 
      position: 'relative', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      background: '#F2F2F7', 
      border: '1px solid #E5E5EA',
      width: '100%',
      // ใช้ Aspect Ratio ที่บันทึกไว้เพื่อบังคับความสูง
      paddingTop: aspectRatio ? `${aspectRatio * 100}%` : '75%', 
      margin: 0,
    }),
    mapContent: { 
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        margin: 0,
        padding: 0,
    },
    
    infoPanel: { flex: 1, minWidth: '300px', background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', height: 'fit-content' },
    label: { fontSize: '0.9rem', fontWeight: '600', color: '#8E8E93', marginBottom: '8px', display: 'block' },
    input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E5E5EA', fontSize: '1rem', marginBottom: '20px', outline: 'none', background: '#F9F9F9' },
    btnPrimary: { width: '100%', padding: '16px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,122,255,0.3)', transition: 'all 0.2s' },
    floorTab: (active) => ({ padding: '8px 16px', borderRadius: '20px', background: active ? '#1C1C1E' : '#F2F2F7', color: active ? 'white' : '#1C1C1E', marginRight: '10px', cursor: 'pointer', border: 'none', fontWeight: '600' }),
    legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#666' },
    legendBox: (color) => ({ width: 12, height: 12, borderRadius: 4, background: color })
  };

  if (!market) return <div>Market not found</div>;

  return (
    <div style={styles.container} className="anim-fade">
      <div style={styles.header}>
        <h1 style={styles.title}>{market.name}</h1>
        <p style={{color:'#8E8E93'}}>Interactive Layout Booking</p>
      </div>

      <div style={styles.layout}>
        <div style={styles.mapPanel} className="anim-scale">
           <div style={{marginBottom: '15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
             <div>
               {market.floors.map((f, i) => (
                 <button key={i} style={styles.floorTab(selectedFloorIndex === i)} onClick={() => { setSelectedFloorIndex(i); setSelectedLock(null); }}>
                   Floor {f.floorNumber}
                 </button>
               ))}
             </div>
             {/* Legend */}
             <div style={{display:'flex', gap:'10px'}}>
                <div style={styles.legendItem}><div style={styles.legendBox('#4ADE80')}></div> Available</div>
                <div style={styles.legendItem}><div style={styles.legendBox('#FFCC00')}></div> Pending</div>
                <div style={styles.legendItem}><div style={styles.legendBox('#FF3B30')}></div> Booked</div>
             </div>
           </div>
           
           {currentFloor ? (
             <div style={styles.mapContainer(currentFloor.aspectRatio)}>
               <div style={styles.mapContent}>
                 {/* รูปแผนผัง */}
                 <img 
                    src={currentFloor.image} 
                    style={{
                        width:'100%', 
                        height:'100%', 
                        display:'block', 
                        objectFit:'fill', 
                        pointerEvents:'none'
                    }} 
                 />
                 
                 {/* SVG Overlay */}
                 <svg 
                    style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}} 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none" 
                 >
                   {currentFloor.locks.map(lock => {
                     if (!lock.isPolygon) return null;
                     
                     const status = getLockStatus(lock.id);
                     const isSelected = selectedLock?.id === lock.id;
                     
                     // กำหนดสี
                     let fillColor = lock.color || '#4ADE80';
                     if (status === 'booked') fillColor = '#FF3B30';
                     else if (status === 'pending') fillColor = '#FFCC00'; 
                     else if (isSelected) fillColor = '#007AFF';

                     return (
                       <g key={lock.id} onClick={() => status === 'available' && setSelectedLock(lock)} style={{cursor: status === 'available' ? 'pointer' : 'not-allowed'}}>
                          <path 
                            d={getSmoothPath(lock.points, lock.curvature || 0)} 
                            fill={fillColor}
                            fillOpacity={status !== 'available' ? '0.6' : (isSelected ? '0.8' : '0.4')}
                            stroke={lock.strokeColor || 'white'}
                            strokeWidth={lock.borderRadius || 0.3}
                            vectorEffect="non-scaling-stroke"
                          />
                          <text 
                            x={lock.x} y={lock.y} 
                            fontSize={0.3} 
                            fill="black" 
                            textAnchor="middle" 
                            style={{pointerEvents:'none'}}
                          >
                            {lock.id}
                          </text>
                       </g>
                     )
                   })}
                 </svg>
               </div>
             </div>
           ) : <div>No Floor Plan</div>}
        </div>

        <div style={styles.infoPanel} className="anim-slide-up">
           <h2 style={{marginTop:0, fontSize:'1.5rem'}}>Booking Details</h2>
           <hr style={{border:'0', borderBottom:'1px solid #E5E5EA', margin:'20px 0'}} />
           
           <div>
             <label style={styles.label}>Selected Stall</label>
             <div style={{padding:'12px', background:'#F2F2F7', borderRadius:'12px', marginBottom:'20px', fontWeight:'bold', color: selectedLock ? '#1C1C1E' : '#8E8E93'}}>
               {selectedLock ? `${selectedLock.id} (Zone: ${selectedLock.zone || '-'})` : 'Please select a stall on map'}
             </div>
             {selectedLock && (
               <div style={{marginBottom:'20px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'5px'}}>
                    <span style={{color:'#8E8E93'}}>Size</span>
                    <span>{selectedLock.area} sqm</span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                    <span style={{color:'#8E8E93'}}>Price</span>
                    <span>฿{selectedLock.price.toLocaleString()}/day</span>
                  </div>
               </div>
             )}
           </div>

           <div>
             <label style={styles.label}>Date Range</label>
             <div style={{display:'flex', gap:'10px'}}>
               <input type="date" style={styles.input} onChange={e => setBookingDates({...bookingDates, start: e.target.value})} />
               <input type="date" style={styles.input} min={bookingDates.start} onChange={e => setBookingDates({...bookingDates, end: e.target.value})} />
             </div>
           </div>

           {totalPrice > 0 && (
             <div style={{margin:'20px 0', padding:'20px', background:'#F2F2F7', borderRadius:'16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
               <span style={{fontWeight:'600', color:'#8E8E93'}}>Total</span>
               <span style={{fontSize:'1.5rem', fontWeight:'800', color:'#007AFF'}}>฿{totalPrice.toLocaleString()}</span>
             </div>
           )}

           <button 
             style={{...styles.btnPrimary, opacity: (!selectedLock || totalPrice <= 0 || getLockStatus(selectedLock?.id) !== 'available') ? 0.5 : 1}} 
             disabled={!selectedLock || totalPrice <= 0 || getLockStatus(selectedLock?.id) !== 'available'}
             onClick={handleConfirmBooking}
           >
             Confirm Booking
           </button>
        </div>
      </div>
    </div>
  );
}