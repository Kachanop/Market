import React, { useState, useRef, useEffect } from 'react';

export default function MarketManage({ markets, setMarkets }) {
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  
  // State สร้าง/แก้ไขตลาด
  const [newMarketName, setNewMarketName] = useState('');
  const [newMarketDescription, setNewMarketDescription] = useState('');
  const [editingMarketId, setEditingMarketId] = useState(null);
  const [editMarketName, setEditMarketName] = useState('');
  const [editMarketDescription, setEditMarketDescription] = useState('');

  // Tools
  const [tool, setTool] = useState('select'); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  
  // 🔥 REMOVED: Zoom & Pan States (zoom, pan, isSpaceDown, isPanning, etc.)
  
  // Interaction
  const [editingLock, setEditingLock] = useState(null);
  const [draggingPointIndex, setDraggingPointIndex] = useState(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null); 
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);

  const svgRef = useRef(null);
  const mapContainerRef = useRef(null);

  const selectedMarket = markets.find(m => m.id === selectedMarketId);
  const currentFloor = selectedMarket?.floors[selectedFloorIndex];

  // --- Keyboard Shortcuts (ADJUSTED) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 🔥 REMOVED: Spacebar handling for Panning
      
      if (e.key === 'Escape') {
        if (isDrawing) { 
            setIsDrawing(false); 
            setCurrentPoints([]); 
        } else if (editingLock) {
            if (selectedPointIndex !== null) setSelectedPointIndex(null);
            else handleSaveLock();
        } else if (editingMarketId) {
            setEditingMarketId(null);
        }
        setTool('select');
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleCloneLock();
      }
    };
    
    // 🔥 REMOVED: handleKeyUp (since Spacebar is gone)

    window.addEventListener('keydown', handleKeyDown);
    // window.addEventListener('keyup', handleKeyUp); // No longer needed
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // window.removeEventListener('keyup', handleKeyUp); // No longer needed
    };
  }, [editingLock, isDrawing, selectedPointIndex, editingMarketId]);

  // --- Helpers (UNCHANGED) ---
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 800; 
          const originalWidth = img.width;
          const originalHeight = img.height;
          const aspectRatio = originalHeight / originalWidth; 
          const scale = maxWidth / originalWidth; 
          const canvas = document.createElement("canvas");
          
          if (img.width > maxWidth) { 
              canvas.width = maxWidth; 
              canvas.height = img.height * scale; 
          } else { 
              canvas.width = img.width; 
              canvas.height = img.height; 
          }
          const ctx = canvas.getContext("2d"); 
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve({ base64: canvas.toDataURL("image/jpeg", 0.7), aspectRatio });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

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

  const pointsStr = (pts) => pts && pts.length ? pts.map(p => `${p.x},${p.y}`).join(' ') : "";
  const getNextID = (currentId) => {
    if (!currentId) return "A01";
    const match = currentId.match(/(\d+)$/);
    if (match) { const number = parseInt(match[0], 10); const nextNumber = number + 1; const prefix = currentId.slice(0, match.index); const paddedNumber = nextNumber.toString().padStart(match[0].length, '0'); return prefix + paddedNumber; }
    return currentId + "_new";
  };
  const getLastID = () => { if (!currentFloor || currentFloor.locks.length === 0) return "A00"; return currentFloor.locks[currentFloor.locks.length - 1].id; };
  const getCoords = (e) => { const rect = svgRef.current.getBoundingClientRect(); return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }; };

  // --- Handlers (ADJUSTED) ---
  // 🔥 REMOVED: handleWheel, zoomIn, zoomOut, zoomReset
  const handleWheel = (e) => { /* Disabled */ };

  const handleCreateMarket = () => { 
      if(!newMarketName.trim()) return; 
      setMarkets([...markets, { id: Date.now(), name: newMarketName, description: newMarketDescription, floors: [] }]); 
      setNewMarketName(''); setNewMarketDescription(''); setIsCreating(false); 
  };
  const handleDeleteMarket = (id) => { if(window.confirm('⚠️ Delete this market?')) { setMarkets(markets.filter(m=>m.id!==id)); if(selectedMarketId===id) setSelectedMarketId(null); } };
  const startEditingMarket = (market) => { setEditingMarketId(market.id); setEditMarketName(market.name); setEditMarketDescription(market.description || ''); };
  const saveMarketDetails = () => { 
      if (!editMarketName.trim()) return; 
      const updatedMarkets = markets.map(m => m.id === editingMarketId ? { ...m, name: editMarketName, description: editMarketDescription } : m); 
      setMarkets(updatedMarkets); 
      setEditingMarketId(null); 
  };
  
  const handleMarketImageUpload = async (e) => { 
      const file = e.target.files[0]; 
      if (file && selectedMarketId) { 
          try { 
              const img = await resizeImage(file); 
              const updatedMarkets = markets.map(m => m.id === selectedMarketId ? { ...m, image: img.base64 } : m); 
              setMarkets(updatedMarkets); 
              alert("✅ Cover image updated!"); 
          } catch (err) { alert("Error uploading cover image"); } 
      } 
  };
  
  const handleAddFloorImage = async(e) => { 
      const f=e.target.files[0]; 
      if(f){ 
          try { 
              const result = await resizeImage(f); 
              const updated = markets.map(m=>m.id===selectedMarketId ? {
                  ...m, 
                  floors:[...m.floors, {
                      floorNumber:m.floors.length+1, 
                      image: result.base64, 
                      aspectRatio: result.aspectRatio, 
                      locks:[]
                  }]
              } : m); 
              setMarkets(updated); 
          } catch(err) { alert("Error adding floor image."); } 
      } 
  };

  const addShape = (type) => {
    const center = { x: 50, y: 50 }; 
    const size = 5; 
    let points = [];
    if (type === 'rect') { points = [ { x: center.x - size, y: center.y - size, curvature: 0 }, { x: center.x + size, y: center.y - size, curvature: 0 }, { x: center.x + size, y: center.y + size, curvature: 0 }, { x: center.x - size, y: center.x + size, curvature: 0 } ]; } 
    else if (type === 'circle') { for (let i = 0; i < 12; i++) { const angle = (i / 12) * Math.PI * 2; points.push({ x: center.x + size * Math.cos(angle), y: center.y + size * Math.sin(angle), curvature: 1 }); } }
    setEditingLock({ isNew: true, id: 'New', price: '', area: '', zone: '', customFields: [], points: points, x: center.x, y: center.y, color: '#34C759', strokeColor: '#ffffff', fontSize: 10, borderRadius: 0, curvature: type === 'circle' ? 1 : 0 }); setTool('select');
  };
  
  const handleCloneLock = () => { if (!editingLock) return; const offset = 2; const newPoints = editingLock.points.map(p => ({ ...p, x: p.x + offset, y: p.y + offset })); const newCenter = { x: editingLock.x + offset, y: editingLock.y + offset }; const nextId = getNextID(editingLock.id); if (editingLock.isNew) handleSaveLock(); setEditingLock({ ...editingLock, isNew: true, id: nextId, points: newPoints, x: newCenter.x, y: newCenter.y }); };
  
  // 🔥 ADJUSTED: ลบ Panning/Zooming Logic ออก
  const handleMouseDown = (e) => {
    // if (isSpaceDown || tool === 'hand' || e.button === 1) { e.preventDefault(); setIsPanning(true); setStartPanMouse({ x: e.clientX, y: e.clientY }); return; }
    if (tool === 'rect' || tool === 'circle') { if (editingLock) handleSaveLock(); const coords = getCoords(e); setIsDrawing(true); setDragStartPos(coords); setEditingLock({ isNew: true, id: getNextID(getLastID()), price: '', area: '', zone: '', customFields: [], points: [coords, coords, coords, coords].map(p => ({...p, curvature: tool === 'circle' ? 1 : 0})), x: coords.x, y: coords.y, color: '#34C759', strokeColor: '#ffffff', fontSize: 10, borderRadius: 0, curvature: tool === 'circle' ? 1 : 0 }); }
  };
  
  const handleSvgClick = (e) => {
    // if (isSpaceDown || isPanning || tool === 'hand') return; // 🔥 REMOVED CHECK
    if (draggingPointIndex !== null) return;
    if (tool === 'poly') { const coords = getCoords(e); if (!isDrawing) { setCurrentPoints([coords]); setIsDrawing(true); } else { if (currentPoints.length >= 3) { const startPoint = currentPoints[0]; const dist = Math.sqrt(Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2)); if (dist < 3) { finishPolyDrawing(); return; } } setCurrentPoints([...currentPoints, coords]); } } 
    else if (tool === 'select') { 
        if (editingLock && !isDraggingShape) { 
            if (selectedPointIndex !== null) { setSelectedPointIndex(null); } else { handleSaveLock(); }
        } 
    }
  };
  
  const handleMouseDownOnLock = (e, lock) => { 
      // if (isSpaceDown || tool === 'hand' || tool === 'draw' || tool === 'rect' || tool === 'circle') return; // 🔥 REMOVED CHECK
      e.stopPropagation(); 
      if (editingLock && editingLock.id === lock.id) return;
      if (editingLock && editingLock.id !== lock.id) handleSaveLock(); 
      setEditingLock({ ...lock, isNew: false, customFields: lock.customFields || [] }); 
      setIsDraggingShape(true); 
      setDragStartPos(getCoords(e)); 
      setSelectedPointIndex(null); 
  };
  
  const handleMouseDownOnPoint = (e, index) => { 
      e.stopPropagation(); 
      e.preventDefault();
      setDraggingPointIndex(index); 
      setSelectedPointIndex(index); 
  };

  // 🔥 ADJUSTED: ลบ Panning/Zooming Logic ออก
  const handleMouseMove = (e) => {
    // if (isPanning) { const dx = e.clientX - startPanMouse.x; const dy = e.clientY - startPanMouse.y; setPan({ x: pan.x + dx, y: pan.y + dy }); setStartPanMouse({ x: e.clientX, y: e.clientY }); return; } // 🔥 REMOVED PANNING
    const coords = getCoords(e);
    if (tool === 'poly' && isDrawing) { let targetPos = coords; if (currentPoints.length >= 3) { const startPoint = currentPoints[0]; const dist = Math.sqrt(Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2)); if (dist < 3) targetPos = startPoint; } setMousePos(targetPos); }
    if (isDrawing && (tool === 'rect' || tool === 'circle') && dragStartPos) { const start = dragStartPos; const current = coords; const minX = Math.min(start.x, current.x); const minY = Math.min(start.y, current.y); const width = Math.abs(current.x - start.x); const height = Math.abs(current.y - start.y); let newPoints = []; if (tool === 'rect') { newPoints = [ { x: minX, y: minY, curvature: 0 }, { x: minX + width, y: minY, curvature: 0 }, { x: minX + width, y: minY + height, curvature: 0 }, { x: minX, y: minY + height, curvature: 0 } ]; } else { const cx = minX + width/2; const cy = minY + height/2; const rx = width/2; const ry = height/2; for (let i = 0; i < 16; i++) { const angle = (i / 16) * Math.PI * 2; newPoints.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle), curvature: 1 }); } } setEditingLock({ ...editingLock, points: newPoints, x: minX + width/2, y: minY + height/2 }); return; }
    if (draggingPointIndex !== null && editingLock) { const updatedPoints = [...editingLock.points]; updatedPoints[draggingPointIndex] = { ...updatedPoints[draggingPointIndex], x: coords.x, y: coords.y }; const cx = updatedPoints.reduce((s,p)=>s+p.x,0)/updatedPoints.length; const cy = updatedPoints.reduce((s,p)=>s+p.y,0)/updatedPoints.length; setEditingLock({...editingLock, points: updatedPoints, x: cx, y: cy}); } 
    else if (isDraggingShape && editingLock && dragStartPos) { const dx = coords.x - dragStartPos.x; const dy = coords.y - dragStartPos.y; const updatedPoints = editingLock.points.map(p => ({ ...p, x: p.x + dx, y: p.y + dy })); setEditingLock({ ...editingLock, points: updatedPoints, x: editingLock.x + dx, y: editingLock.y + dy }); setDragStartPos(coords); }
  };
  
  const handleMouseUp = () => { 
      if (isDrawing && (tool === 'rect' || tool === 'circle')) { setIsDrawing(false); setDragStartPos(null); } 
      setDraggingPointIndex(null); 
      setIsDraggingShape(false); 
      // setIsPanning(false); // 🔥 REMOVED
  };
  
  const finishPolyDrawing = () => { if (currentPoints.length < 3) return alert("At least 3 points required."); const cx = currentPoints.reduce((s,p)=>s+p.x,0)/currentPoints.length; const cy = currentPoints.reduce((s,p)=>s+p.y,0)/currentPoints.length; const finalPoints = currentPoints.map(p => ({...p, curvature: 0})); setEditingLock({ isNew: true, id: getNextID(getLastID()), price: '', area: '', zone: '', customFields: [], points: finalPoints, x: cx, y: cy, color: '#34C759', strokeColor: '#ffffff', fontSize: 10, borderRadius: 0 }); setIsDrawing(false); setCurrentPoints([]); setTool('select'); setMousePos(null); };
  const handleSaveLock = () => { if (!editingLock) return; const lockData = { ...editingLock, price: parseInt(editingLock.price) || 0, area: parseFloat(editingLock.area) || 0, zone: editingLock.zone || '', isPolygon: true, customFields: editingLock.customFields || [] }; delete lockData.tenant; delete lockData.status; delete lockData.description; delete lockData.isNew; const updatedMarkets = markets.map(m => { if (m.id === selectedMarketId) { const newFloors = [...m.floors]; let tempLocks = newFloors[selectedFloorIndex].locks.filter(l => l.id !== editingLock.id); tempLocks.push(lockData); newFloors[selectedFloorIndex].locks = tempLocks; return { ...m, floors: newFloors }; } return m; }); setMarkets(updatedMarkets); setEditingLock(null); setSelectedPointIndex(null); };
  const handleDeleteLock = (lockId) => { const updated = markets.map(m => { if(m.id === selectedMarketId) { const nf = [...m.floors]; nf[selectedFloorIndex].locks = nf[selectedFloorIndex].locks.filter(l => l.id !== lockId); return {...m, floors:nf}; } return m; }); setMarkets(updated); setEditingLock(null); setSelectedPointIndex(null); };
  const updatePointCurvature = (val) => {
      if (!editingLock || selectedPointIndex === null) return;
      const newPoints = [...editingLock.points];
      newPoints[selectedPointIndex].curvature = parseFloat(val);
      setEditingLock({...editingLock, points: newPoints});
  };

  // Styles (ADJUSTED)
  const styles = {
    layout: { display: 'flex', height: '100vh', width: '100%', background: '#F2F2F7', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif', overflow: 'hidden' },
    leftPanel: { width: '280px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(0,0,0,0.1)', padding: '20px', overflowY: 'auto', zIndex: 30 },
    centerPanel: { flex: 1, position: 'relative', overflow: 'hidden', background: '#E5E5EA', display: 'flex', justifyContent: 'center', alignItems: 'center' }, // 🔥 FIX: Center the map
    rightPanel: { width: '320px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(0,0,0,0.1)', padding: '0', display: 'flex', flexDirection: 'column', zIndex: 30 },
    btn: { padding: '10px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', width: '100%', marginBottom: '8px', fontWeight: '600', transition: 'all 0.2s' },
    // 🔥 FIX: ลบ marginBottom ออกจาก input/textarea หลัก
    input: { width: '100%', padding: '10px', border: '1px solid #E5E5EA', borderRadius: '10px', fontSize: '0.9rem', background: '#F2F2F7', /* marginBottom: '10px', */ outline:'none' },
    textarea: { width: '100%', padding: '10px', border: '1px solid #E5E5EA', borderRadius: '10px', fontSize: '0.9rem', background: '#F2F2F7', /* marginBottom: '10px', */ outline:'none', resize:'vertical', minHeight:'60px' },
    listItem: (active) => ({ padding: '12px', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer', background: active ? '#007AFF' : 'transparent', color: active ? 'white' : '#1C1C1E', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }),
    toolbar: { position: 'absolute', top: 20, left: 20, zIndex: 20, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' },
    toolBtn: (active) => ({ width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: active ? '#007AFF' : 'transparent', color: active ? 'white' : '#1C1C1E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'all 0.2s' }),
    coverPreview: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E5E5EA', backgroundColor: '#eee' },
    editInput: { flex: 1, padding: '6px 8px', border: '1px solid #007AFF', borderRadius: '8px', fontSize: '0.9rem', marginBottom:'5px' },
    editTextarea: { width: '100%', padding: '6px 8px', border: '1px solid #007AFF', borderRadius: '8px', fontSize: '0.85rem', marginBottom:'10px', minHeight:'50px', resize:'vertical' }, // เพิ่ม marginBottom: '10px'
    mapContainerStatic: (aspectRatio) => ({
      position: 'relative',
      width: '100%',
      maxWidth: '650px', 
      paddingTop: aspectRatio ? `${aspectRatio * 100}%` : '75%',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      margin: '20px',
      background: '#fff',
    }),
    mapContentStatic: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    }
  };

  return (
    <div style={styles.layout}>
      <div style={styles.leftPanel}>
        <h2 style={{marginTop:0, fontSize:'1.5rem', fontWeight:'800', color: '#1C1C1E'}}>Markets</h2>
        <button style={styles.btn} onClick={() => setIsCreating(true)}>+ New Market</button>
        {isCreating && (
          <div style={{background:'#fff', padding:'10px', borderRadius:'12px', marginBottom:'10px', border:'1px solid #E5E5EA'}}>
             {/* 🔥 FIX: เพิ่ม marginBottom: '10px' ให้ input/textarea และลบออกจากสไตล์หลัก */}
             <input autoFocus placeholder="Market Name" value={newMarketName} onChange={e=>setNewMarketName(e.target.value)} style={{...styles.input, marginBottom: '10px'}} /> 
             <textarea placeholder="Description (Optional)" value={newMarketDescription} onChange={e=>setNewMarketDescription(e.target.value)} style={{...styles.textarea, marginBottom: '10px'}} />
             <div style={{display:'flex', gap:'5px', marginTop:'0'}}> {/* 🔥 FIX: ลบ marginTop ซ้ำซ้อน */}
               <button style={{...styles.btn, flex:1}} onClick={handleCreateMarket}>Add</button>
               <button style={{...styles.btn, background:'#E5E5EA', color:'black', flex:1}} onClick={()=>setIsCreating(false)}>Cancel</button>
             </div>
          </div>
        )}
        <div style={{marginTop:'20px'}}>
            {markets.map(m => (
                <div key={m.id} style={styles.listItem(selectedMarketId===m.id)} onClick={()=>{setSelectedMarketId(m.id); setSelectedFloorIndex(0); setEditingLock(null); setEditingMarketId(null);}}>
                    {editingMarketId === m.id ? (
                        <div style={{width:'90%'}} onClick={e => e.stopPropagation()}>
                            {/* 🔥 แก้ไข input และ textarea เพื่อให้มีระยะห่างที่ถูกต้อง */}
                            <input autoFocus style={{...styles.editInput, width:'100%', marginBottom: '10px'}} value={editMarketName} onChange={e => setEditMarketName(e.target.value)} />
                            <textarea style={styles.editTextarea} placeholder="Edit Description..." value={editMarketDescription} onChange={e => setEditMarketDescription(e.target.value)} />
                            <div style={{display:'flex', gap:'4px', marginTop:'0px'}}>
                                <button onClick={saveMarketDetails} style={{...styles.btn, padding:'6px', fontSize:'0.8rem', marginBottom:0}}>Save</button>
                                <button onClick={() => setEditingMarketId(null)} style={{...styles.btn, background:'#ccc', color:'black', padding:'6px', fontSize:'0.8rem', marginBottom:0}}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                            <div style={{flex:1, overflow:'hidden'}}>
                                <div style={{fontWeight:'600', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{m.name}</div>
                                {m.description && <div style={{fontSize:'0.75rem', opacity:0.7, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{m.description}</div>}
                            </div>
                            <div style={{display:'flex', gap:'5px'}}>
                                <button onClick={(e) => { e.stopPropagation(); startEditingMarket(m); }} style={{border:'none', background:'none', cursor:'pointer', opacity:0.6, fontSize:'0.9rem'}}>✏️</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteMarket(m.id); }} style={{border:'none', background:'none', cursor:'pointer', opacity:0.6, color: selectedMarketId===m.id ? 'white' : '#FF3B30', fontWeight:'bold'}}>✕</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
        {selectedMarket && !editingMarketId && (
           <div style={{marginTop:'30px'}}>
             <h3 style={{fontSize:'0.8rem', color:'#8E8E93', textTransform:'uppercase', letterSpacing:1}}>Settings</h3>
             {selectedMarket.image && <img src={selectedMarket.image} style={styles.coverPreview} alt="Cover" />}
             
             {/* 🔥 FIX: ห่อหุ้มด้วย div เพื่อบังคับให้ label อยู่ตรงกลาง */}
             <div style={{display:'flex', justifyContent:'center', marginBottom: '10px'}}>
               <label style={{...styles.btn, background:'#34C759', display:'inline-flex', width:'auto', padding:'10px 20px'}}>📸 Upload Cover Image <input type="file" hidden accept="image/*" onChange={handleMarketImageUpload} /></label>
             </div>
             
             <hr style={{border:'0', borderBottom:'1px solid #E5E5EA', margin:'15px 0'}} />
             <h3 style={{fontSize:'0.8rem', color:'#8E8E93', textTransform:'uppercase', letterSpacing:1}}>Floors</h3>
             {selectedMarket.floors.map((f, i) => ( <div key={i} onClick={()=>setSelectedFloorIndex(i)} style={{...styles.listItem(selectedFloorIndex===i), padding:'8px 12px'}}> Floor {f.floorNumber} </div> ))}
             
             {/* 🔥 FIX: ห่อหุ้มด้วย div เพื่อบังคับให้ label อยู่ตรงกลาง */}
             <div style={{display:'flex', justifyContent:'center', marginTop:'10px'}}>
               <label style={{...styles.btn, background:'#E5E5EA', color:'#007AFF', display:'inline-flex', width:'auto', padding:'10px 20px'}}>Upload Plan <input type="file" hidden accept="image/*" onChange={handleAddFloorImage} /></label>
             </div>
           </div>
        )}
      </div>

      <div style={styles.centerPanel}>
        {currentFloor ? (
             // 🔥 ใช้ Map Container Static Style
             <div 
                ref={mapContainerRef} 
                style={styles.mapContainerStatic(currentFloor.aspectRatio)}
                // 🔥 REMOVED: onWheel, onMouseDown, onMouseMove, onMouseUp, onMouseLeave (Zoom/Pan handlers)
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onContextMenu={(e) => e.preventDefault()}
             >
                <div style={styles.mapContentStatic}>
                    <img src={currentFloor.image} style={{width:'100%', height:'100%', objectFit:'fill', pointerEvents:'none', userSelect:'none'}} />
                    <svg ref={svgRef} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}} viewBox="0 0 100 100" preserveAspectRatio="none" onClick={handleSvgClick}>
                        {showGrid && (
                            <g style={{pointerEvents: 'none', opacity: 0.1}}>
                              {Array.from({ length: 21 }).map((_, i) => (<React.Fragment key={i}><line x1={i * 5} y1="0" x2={i * 5} y2="100" stroke="black" strokeWidth={0.1 / 1} /><line x1="0" y1={i * 5} x2="100" y2={i * 5} stroke="black" strokeWidth={0.1 / 1} /></React.Fragment>))}
                            </g>
                        )}
                        {currentFloor.locks.map(lock => {
                            if(!lock.isPolygon || (editingLock && editingLock.id === lock.id)) return null; 
                            return ( 
                                <g key={lock.id} onClick={(e)=>e.stopPropagation()} onMouseDown={(e)=>handleMouseDownOnLock(e, lock)}> 
                                    <path d={getSmoothPath(lock.points, lock.curvature || 0)} fill={lock.color || '#34C759'} fillOpacity="0.5" stroke={lock.strokeColor || 'white'} strokeWidth={lock.borderRadius || 0.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" /> 
                                    {/* 🔥 ADJUSTED: FontSize ใช้ค่าคงที่ 0.3 */}
                                    <text x={lock.x} y={lock.y} fontSize={0.3} fill="black" textAnchor="middle" style={{pointerEvents:'none'}}>{lock.id}</text> 
                                </g> 
                            )
                        })}
                        {tool === 'poly' && isDrawing && <><polyline points={pointsStr(currentPoints)} fill="none" stroke="#2E8B57" strokeWidth={0.5/1} />{currentPoints.length > 0 && mousePos && <line x1={currentPoints[currentPoints.length-1].x} y1={currentPoints[currentPoints.length-1].y} x2={mousePos.x} y2={mousePos.y} stroke="#F59E0B" strokeWidth={0.5/1} strokeDasharray="1,1" />}</>}
                        {editingLock && (
                            <g cursor="move" onClick={(e)=>e.stopPropagation()}>
                                <path d={getSmoothPath(editingLock.points, editingLock.curvature || 0)} fill={editingLock.color} fillOpacity="0.6" stroke="#007AFF" strokeWidth={editingLock.borderRadius || 0.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                {editingLock.points.map((p, i) => ( 
                                    <React.Fragment key={i}>
                                        <circle 
                                            cx={p.x} cy={p.y} 
                                            r={0.6/1} 
                                            fill={i === selectedPointIndex ? "#007AFF" : "white"} 
                                            stroke="#007AFF" strokeWidth={0.1/1} 
                                            onMouseDown={(e)=>handleMouseDownOnPoint(e, i)} 
                                            onClick={(e)=>e.stopPropagation()} 
                                            style={{cursor: 'pointer'}}
                                        />
                                    </React.Fragment>
                                ))}
                            </g>
                        )}
                    </svg>
                </div>
             </div>
        ) : ( <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%', flexDirection:'column', gap:'20px'}}> <div style={{fontSize:'3rem', opacity:0.2}}>🗺️</div> <div style={{color:'#8E8E93'}}>Select a floor or upload a plan to start</div> </div> )}
        {currentFloor && ( 
            <div style={styles.toolbar}>
                <button style={styles.toolBtn(tool==='select')} onClick={()=>setTool('select')}>👆</button>
                <button style={styles.toolBtn(tool==='hand')} onClick={()=>setTool('hand')}>✋</button>
                <div style={{height:'1px', background:'#E5E5EA', margin:'2px 0'}} />
                <button style={styles.toolBtn(tool==='rect')} onClick={()=>setTool('rect')}>⬜</button>
                <button style={styles.toolBtn(tool==='circle')} onClick={()=>setTool('circle')}>⚪</button>
                <button style={styles.toolBtn(tool==='poly')} onClick={()=>setTool('poly')}>✏️</button>
            </div>
        )}
      </div>

      <div style={styles.rightPanel}>
         {editingLock ? (
           <div style={{padding:'20px', overflowY:'auto'}}>
              <h3 style={{marginTop:0, color:'#1C1C1E'}}>Edit Stall</h3>
              <div style={{marginBottom:'15px'}}> <label style={{fontSize:'0.8rem', color:'#8E8E93', fontWeight:'600'}}>ID</label> <input style={styles.input} value={editingLock.id} onChange={e=>setEditingLock({...editingLock, id:e.target.value})} /> </div>
              <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}> <div style={{flex:1}}> <label style={{fontSize:'0.8rem', color:'#8E8E93', fontWeight:'600'}}>Price</label> <input type="number" style={styles.input} value={editingLock.price} onChange={e=>setEditingLock({...editingLock, price:e.target.value})} /> </div> <div style={{flex:1}}> <label style={{fontSize:'0.8rem', color:'#8E8E93', fontWeight:'600'}}>Area (sqm)</label> <input type="number" style={styles.input} value={editingLock.area} onChange={e=>setEditingLock({...editingLock, area:e.target.value})} /> </div> </div>
              <div style={{marginBottom:'15px'}}> <label style={{fontSize:'0.8rem', color:'#8E8E93', fontWeight:'600'}}>Color</label> <div style={{display:'flex', gap:'5px', marginTop:'5px'}}> <input type="color" style={{flex:1, height:'40px', border:'none', borderRadius:'8px', cursor:'pointer'}} value={editingLock.color} onChange={e=>setEditingLock({...editingLock, color:e.target.value})} /> </div> </div>
              <hr style={{border:'0', borderBottom:'1px solid #E5E5EA', margin:'20px 0'}} />
              {selectedPointIndex !== null ? (
                  <div style={{marginBottom:'15px', background:'#eef2ff', padding:'10px', borderRadius:'8px'}}> 
                    <label style={{fontSize:'0.8rem', color:'#007AFF', fontWeight:'600'}}>Point {selectedPointIndex} Curvature</label> 
                    <input type="range" min="0" max="1" step="0.05" style={{width:'100%', accentColor:'#007AFF'}} value={editingLock.points[selectedPointIndex]?.curvature || 0} onChange={e=>updatePointCurvature(e.target.value)} /> 
                  </div>
              ) : (
                  <div style={{marginBottom:'15px'}}> <label style={{fontSize:'0.8rem', color:'#8E8E93', fontWeight:'600'}}>Curvature (All Points)</label> <input type="range" min="0" max="1" step="0.05" style={{width:'100%', accentColor:'#007AFF'}} value={editingLock.curvature || 0} onChange={e=>setEditingLock({...editingLock, curvature:parseFloat(e.target.value)})} /> </div>
              )}
              <div style={{marginBottom:'15px'}}> <label style={{fontSize:'0.8rem', color:'#8E8E93', fontWeight:'600'}}>Border Radius</label> <input type="range" min="0" max="5" step="0.1" style={{width:'100%', accentColor:'#007AFF'}} value={editingLock.borderRadius || 0} onChange={e=>setEditingLock({...editingLock, borderRadius:parseFloat(e.target.value)})} /> </div>
              <button style={styles.btn} onClick={handleSaveLock}>Save Changes</button>
              <button style={{...styles.btn, background:'#FF3B30'}} onClick={()=>handleDeleteLock(editingLock.id)}>Delete</button>
           </div>
         ) : ( <div style={{padding:'30px', textAlign:'center', color:'#8E8E93', display:'flex', flexDirection:'column', justifyContent:'center', height:'100%'}}> <div style={{fontSize:'2rem', marginBottom:'10px'}}>👆</div> <div>Select a stall to edit properties</div> </div> )}
      </div>
    </div>
  );
}