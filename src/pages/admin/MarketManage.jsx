import React, { useState, useRef, useEffect } from 'react';

export default function MarketManage({ markets, setMarkets }) {
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [newMarketName, setNewMarketName] = useState('');
  
  // Tools
  const [tool, setTool] = useState('select'); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  
  // Zoom & Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanMouse, setStartPanMouse] = useState({ x: 0, y: 0 });
  
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

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) setIsSpaceDown(true);
      
      if (e.key === 'Escape') {
        if (isDrawing) { setIsDrawing(false); setCurrentPoints([]); }
        else if (editingLock) {
            if (selectedPointIndex !== null) setSelectedPointIndex(null);
            else handleSaveLock();
        }
        setTool('select');
      }

      if (!editingLock) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
           if (selectedPointIndex !== null && editingLock.points.length > 3) {
               const newPoints = editingLock.points.filter((_, i) => i !== selectedPointIndex);
               setEditingLock({...editingLock, points: newPoints});
               setSelectedPointIndex(null);
           } else {
               if(confirm('ลบล็อกนี้?')) handleDeleteLock(editingLock.id);
           }
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleCloneLock();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') { setIsSpaceDown(false); setIsPanning(false); }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [editingLock, isDrawing, selectedPointIndex]);

  // --- Helpers ---
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1200;
          const scale = maxWidth / img.width;
          const canvas = document.createElement("canvas");
          canvas.width = img.width > maxWidth ? maxWidth : img.width;
          canvas.height = img.width > maxWidth ? img.height * scale : img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

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

  const pointsStr = (pts) => pts && pts.length ? pts.map(p => `${p.x},${p.y}`).join(' ') : "";
  const getNextID = (currentId) => {
    if (!currentId) return "A01";
    const match = currentId.match(/(\d+)$/);
    if (match) {
      const number = parseInt(match[0], 10);
      const nextNumber = number + 1;
      const prefix = currentId.slice(0, match.index);
      const paddedNumber = nextNumber.toString().padStart(match[0].length, '0');
      return prefix + paddedNumber;
    }
    return currentId + "_new";
  };
  const getLastID = () => { if (!currentFloor || currentFloor.locks.length === 0) return "A00"; return currentFloor.locks[currentFloor.locks.length - 1].id; };
  const getCoords = (e) => { const rect = svgRef.current.getBoundingClientRect(); return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }; };

  const handleWheel = (e) => { if (e.ctrlKey || e.metaKey) e.preventDefault(); const scaleAmount = -e.deltaY * 0.001; let newZoom = zoom + scaleAmount; if (newZoom < 0.5) newZoom = 0.5; if (newZoom > 5) newZoom = 5; setZoom(newZoom); };
  const zoomIn = () => setZoom(Math.min(zoom + 0.5, 5)); const zoomOut = () => setZoom(Math.max(zoom - 0.5, 0.5)); const zoomReset = () => { setZoom(1); setPan({x:0, y:0}); };
  const handleCreateMarket = () => { if(!newMarketName.trim())return; setMarkets([...markets, {id:Date.now(), name:newMarketName, floors:[]}]); setNewMarketName(''); setIsCreating(false); };
  const handleDeleteMarket = (id) => { if(confirm('⚠️ ลบตลาดนี้?')) { setMarkets(markets.filter(m=>m.id!==id)); if(selectedMarketId===id) setSelectedMarketId(null); } };
  const handleAddFloorImage = async(e) => { const f=e.target.files[0]; if(f){ const img=await resizeImage(f); const updated=markets.map(m=>m.id===selectedMarketId?{...m, floors:[...m.floors, {floorNumber:m.floors.length+1, image:img, locks:[]}]}:m); setMarkets(updated); } };

  const addShape = (type) => {
    const center = { x: 50, y: 50 }; const size = 5; let points = [];
    if (type === 'rect') { points = [ { x: center.x - size, y: center.y - size, curvature: 0 }, { x: center.x + size, y: center.y - size, curvature: 0 }, { x: center.x + size, y: center.y + size, curvature: 0 }, { x: center.x - size, y: center.y + size, curvature: 0 }, ]; } 
    else if (type === 'circle') { for (let i = 0; i < 12; i++) { const angle = (i / 12) * Math.PI * 2; points.push({ x: center.x + size * Math.cos(angle), y: center.y + size * Math.sin(angle), curvature: 1 }); } }
    // 🔥 ลบ tenant, status ออกจาก default state
    setEditingLock({ 
        isNew: true, id: 'New', price: '', area: '', zone: '', customFields: [],
        points: points, x: center.x, y: center.y, color: '#4ADE80', strokeColor: '#ffffff', fontSize: 10, borderRadius: 0, curvature: type === 'circle' ? 1 : 0 
    }); 
    setTool('select');
  };
  
  const handleCloneLock = () => { if (!editingLock) return; const offset = 2; const newPoints = editingLock.points.map(p => ({ ...p, x: p.x + offset, y: p.y + offset })); const newCenter = { x: editingLock.x + offset, y: editingLock.y + offset }; const nextId = getNextID(editingLock.id); if (editingLock.isNew) handleSaveLock(); setEditingLock({ ...editingLock, isNew: true, id: nextId, points: newPoints, x: newCenter.x, y: newCenter.y }); };

  const handleMouseDown = (e) => {
    if (isSpaceDown || tool === 'hand' || e.button === 1) { e.preventDefault(); setIsPanning(true); setStartPanMouse({ x: e.clientX, y: e.clientY }); return; }
    if (tool === 'rect' || tool === 'circle') {
       if (editingLock) handleSaveLock();
       const coords = getCoords(e); setIsDrawing(true); setDragStartPos(coords);
       // 🔥 ลบ tenant, status ออกจาก default state
       setEditingLock({ 
           isNew: true, id: getNextID(getLastID()), price: '', area: '', zone: '', customFields: [],
           points: [coords, coords, coords, coords].map(p => ({...p, curvature: tool === 'circle' ? 1 : 0})), x: coords.x, y: coords.y, color: '#4ADE80', strokeColor: '#ffffff', fontSize: 10, borderRadius: 0, curvature: tool === 'circle' ? 1 : 0 
       });
    }
  };

  const handleSvgClick = (e) => {
    if (isSpaceDown || isPanning || tool === 'hand') return;
    
    // Poly Tool Drawing Logic
    if (tool === 'poly') { 
        const coords = getCoords(e);
        if (!isDrawing) {
            setIsDrawing(true); 
            setCurrentPoints([coords]);
        } else {
            // Check for snapping to start point to Close Path
            if (currentPoints.length >= 3) {
                const startPoint = currentPoints[0];
                const dist = Math.sqrt(Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2));
                if (dist < 3) {
                    finishPolyDrawing();
                    return;
                }
            }
            setCurrentPoints([...currentPoints, coords]); 
        }
    } 
    else if (tool === 'select') { 
        if (editingLock && !isDraggingShape && draggingPointIndex === null) { 
            if (selectedPointIndex !== null) setSelectedPointIndex(null); 
            else handleSaveLock(); 
        } 
    }
  };

  const handleMouseDownOnLock = (e, lock) => { 
      if (isSpaceDown || tool === 'hand' || tool === 'draw' || tool === 'rect' || tool === 'circle') return; 
      e.stopPropagation(); 
      if (editingLock && editingLock.id !== lock.id) handleSaveLock(); 
      setEditingLock({ ...lock, isNew: false, customFields: lock.customFields || [] }); 
      setIsDraggingShape(true); 
      setDragStartPos(getCoords(e)); 
      setSelectedPointIndex(null); 
  };
  
  const handleMouseDownOnPoint = (e, index) => { 
      e.stopPropagation(); 
      setDraggingPointIndex(index); 
      setSelectedPointIndex(index); 
  };

  const handleMouseMove = (e) => {
    if (isPanning) { 
        const dx = e.clientX - startPanMouse.x; const dy = e.clientY - startPanMouse.y; 
        setPan({ x: pan.x + dx, y: pan.y + dy }); setStartPanMouse({ x: e.clientX, y: e.clientY }); return; 
    }
    
    const coords = getCoords(e);
    
    if (tool === 'poly' && isDrawing) {
        let targetPos = coords;
        if (currentPoints.length >= 3) {
             const startPoint = currentPoints[0];
             const dist = Math.sqrt(Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2));
             if (dist < 3) targetPos = startPoint;
        }
        setMousePos(targetPos);
    }

    if (isDrawing && (tool === 'rect' || tool === 'circle') && dragStartPos) {
       const start = dragStartPos; const current = coords; const minX = Math.min(start.x, current.x); const minY = Math.min(start.y, current.y); const width = Math.abs(current.x - start.x); const height = Math.abs(current.y - start.y); let newPoints = [];
       if (tool === 'rect') { newPoints = [ { x: minX, y: minY, curvature: 0 }, { x: minX + width, y: minY, curvature: 0 }, { x: minX + width, y: minY + height, curvature: 0 }, { x: minX, y: minY + height, curvature: 0 } ]; } 
       else { const cx = minX + width/2; const cy = minY + height/2; const rx = width/2; const ry = height/2; for (let i = 0; i < 16; i++) { const angle = (i / 16) * Math.PI * 2; newPoints.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle), curvature: 1 }); } }
       setEditingLock({ ...editingLock, points: newPoints, x: minX + width/2, y: minY + height/2 }); return;
    }

    if (draggingPointIndex !== null && editingLock) { const updatedPoints = [...editingLock.points]; updatedPoints[draggingPointIndex] = { ...updatedPoints[draggingPointIndex], x: coords.x, y: coords.y }; const cx = updatedPoints.reduce((s,p)=>s+p.x,0)/updatedPoints.length; const cy = updatedPoints.reduce((s,p)=>s+p.y,0)/updatedPoints.length; setEditingLock({...editingLock, points: updatedPoints, x: cx, y: cy}); } 
    else if (isDraggingShape && editingLock && dragStartPos) { const dx = coords.x - dragStartPos.x; const dy = coords.y - dragStartPos.y; const updatedPoints = editingLock.points.map(p => ({ ...p, x: p.x + dx, y: p.y + dy })); setEditingLock({ ...editingLock, points: updatedPoints, x: editingLock.x + dx, y: editingLock.y + dy }); setDragStartPos(coords); }
  };

  const handleMouseUp = () => { if (isDrawing && (tool === 'rect' || tool === 'circle')) { setIsDrawing(false); setDragStartPos(null); } setDraggingPointIndex(null); setIsDraggingShape(false); setIsPanning(false); };
  
  const finishPolyDrawing = () => { 
      if (currentPoints.length < 3) return alert("ต้องมีอย่างน้อย 3 จุด"); 
      const cx = currentPoints.reduce((s,p)=>s+p.x,0)/currentPoints.length; 
      const cy = currentPoints.reduce((s,p)=>s+p.y,0)/currentPoints.length; 
      const finalPoints = currentPoints.map(p => ({...p, curvature: 0})); 
      setEditingLock({ 
          isNew: true, id: getNextID(getLastID()), price: '', area: '', zone: '', customFields: [],
          points: finalPoints, x: cx, y: cy, color: '#4ADE80', strokeColor: '#ffffff', fontSize: 10, borderRadius: 0 
      }); 
      setIsDrawing(false); setCurrentPoints([]); setTool('select'); setMousePos(null); 
  };
  
  const handleSaveLock = () => { 
      if (!editingLock) return; 
      const lockData = { 
          ...editingLock, 
          price: parseInt(editingLock.price) || 0, 
          area: parseFloat(editingLock.area) || 0, 
          zone: editingLock.zone || '', 
          isPolygon: true,
          customFields: editingLock.customFields || []
      }; 
      // 🔥 ลบ fields ที่ไม่ต้องการออก (tenant, status, description)
      delete lockData.tenant;
      delete lockData.status;
      delete lockData.description;
      delete lockData.isNew; 

      const updatedMarkets = markets.map(m => { 
          if (m.id === selectedMarketId) { 
              const newFloors = [...m.floors]; 
              let tempLocks = newFloors[selectedFloorIndex].locks.filter(l => l.id !== editingLock.id); 
              tempLocks.push(lockData); 
              newFloors[selectedFloorIndex].locks = tempLocks; 
              return { ...m, floors: newFloors }; 
          } 
          return m; 
      }); 
      setMarkets(updatedMarkets); 
      setEditingLock(null); 
      setSelectedPointIndex(null); 
  };
  
  const handleDeleteLock = (lockId) => { const updated = markets.map(m => { if(m.id === selectedMarketId) { const nf = [...m.floors]; nf[selectedFloorIndex].locks = nf[selectedFloorIndex].locks.filter(l => l.id !== lockId); return {...m, floors:nf}; } return m; }); setMarkets(updated); setEditingLock(null); setSelectedPointIndex(null); };
  
  const updatePointCurvature = (val) => {
      if (!editingLock || selectedPointIndex === null) return;
      const newPoints = [...editingLock.points];
      newPoints[selectedPointIndex].curvature = parseFloat(val);
      setEditingLock({...editingLock, points: newPoints});
  };

  // 🔥 Helper functions for Custom Fields
  const addCustomField = () => {
    const newFields = [...(editingLock.customFields || []), { label: '', value: '' }];
    setEditingLock({ ...editingLock, customFields: newFields });
  };

  const updateCustomField = (index, field, value) => {
    const newFields = [...(editingLock.customFields || [])];
    newFields[index][field] = value;
    setEditingLock({ ...editingLock, customFields: newFields });
  };

  const removeCustomField = (index) => {
    const newFields = (editingLock.customFields || []).filter((_, i) => i !== index);
    setEditingLock({ ...editingLock, customFields: newFields });
  };

  const styles = {
    layout: { display: 'flex', height: 'calc(100vh - 110px)', width: '100%', background: '#f8f9fa', fontFamily: 'Inter', overflow: 'hidden' },
    leftPanel: { width: '240px', background: 'white', borderRight: '1px solid #ddd', padding: '15px', overflowY: 'auto', zIndex: 30 },
    centerPanel: { flex: 1, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' },
    rightPanel: { width: '320px', background: 'white', borderLeft: '1px solid #ddd', padding: '0', display: 'flex', flexDirection: 'column', zIndex: 30 },
    toolbar: { position: 'absolute', top: 20, left: 20, zIndex: 20, background: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '8px' },
    toolBtn: (active) => ({ padding: '8px', border: active ? '2px solid #2E8B57' : '1px solid #eee', borderRadius: '6px', background: active ? '#E8F5E9' : 'white', cursor: 'pointer', textAlign: 'center', fontSize: '1.2rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    mapViewport: { flex: 1, overflow: 'hidden', position: 'relative', background: '#e9e9e9', cursor: (isPanning || tool === 'hand' || isSpaceDown) ? 'grabbing' : (tool === 'select' ? 'default' : 'crosshair') },
    mapContent: { transformOrigin: '0 0', transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, width: '100%', height: '100%', position: 'relative' },
    svg: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 10, cursor: 'inherit' },
    mapImage: { width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' },
    btn: { padding: '8px 12px', background: '#2E8B57', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', marginBottom: '5px' },
    btnDelete: { marginLeft: 'auto', background: '#FFEBEE', color: '#D32F2F', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold' },
    propHeader: { padding: '15px', background: '#f1f1f1', borderBottom: '1px solid #ddd', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    propBody: { padding: '15px', overflowY: 'auto' },
    inputGroup: { marginBottom: '12px' },
    label: { display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '6px', fontWeight:'500' },
    input: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' },
    row: { display: 'flex', gap: '10px' },
    zoomControls: { position: 'absolute', bottom: 20, left: 20, zIndex: 20, background: 'white', padding: '5px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', gap: '5px' },
    zoomBtn: { width: '30px', height: '30px', cursor: 'pointer', border: '1px solid #eee', background: 'white', borderRadius: '4px', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '1.2rem' },
    saveBtn: { background:'#2E8B57', color:'white', width:'100%', padding:'12px', border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', marginTop:'10px' },
    
    // Custom Field Styles
    customFieldRow: { display: 'flex', gap: '5px', marginBottom: '8px', alignItems: 'center' },
    cfInput: { flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem' },
    cfBtn: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 8px', cursor: 'pointer', fontSize: '0.8rem' },
    addCfBtn: { background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer', width: '100%', fontSize: '0.85rem', marginTop: '5px' }
  };

  return (
    <div style={styles.layout}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <h4 style={{marginTop:0}}>📂 ตลาด ({markets.length})</h4>
        <button style={styles.btn} onClick={() => { setIsCreating(true); }}>+ เพิ่มตลาดใหม่</button>
        {isCreating && (
          <div style={{marginBottom:'10px', padding:'10px', background:'#f9f9f9', borderRadius:'4px', border:'1px solid #eee'}}>
             <input autoFocus placeholder="ชื่อตลาด..." value={newMarketName} onChange={e=>setNewMarketName(e.target.value)} style={styles.input} />
             <div style={{display:'flex', gap:'5px', marginTop:'5px'}}>
               <button style={{...styles.btn, marginTop:'5px'}} onClick={handleCreateMarket}>ตกลง</button>
               <button style={{...styles.btn, marginTop:'5px', background:'#999'}} onClick={()=>setIsCreating(false)}>ยกเลิก</button>
             </div>
          </div>
        )}
        <div style={{marginTop:'10px'}}>
            {markets.map(m => (
            <div key={m.id} style={{padding:'10px', cursor:'pointer', marginBottom:'5px', borderRadius:'6px', background: selectedMarketId===m.id?'#E8F5E9':'white', border: selectedMarketId===m.id?'1px solid #2E8B57':'1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}} onClick={()=>{setSelectedMarketId(m.id); setSelectedFloorIndex(0); setEditingLock(null);}}>
                <span style={{fontWeight: selectedMarketId===m.id?'bold':'normal'}}>{m.name}</span>
                <button style={styles.btnDelete} onClick={(e) => { e.stopPropagation(); handleDeleteMarket(m.id); }}>ลบ</button>
            </div>
            ))}
        </div>
        {selectedMarket && (
           <div style={{marginTop:'20px', paddingTop:'15px', borderTop:'1px solid #eee'}}>
             <h4>ชั้น (Floor)</h4>
             {selectedMarket.floors.map((f, i) => (
                <button key={i} style={{...styles.btn, background: selectedFloorIndex===i?'#333':'#ddd', color: selectedFloorIndex===i?'white':'black'}} onClick={()=>setSelectedFloorIndex(i)}>ชั้น {f.floorNumber}</button>
             ))}
             <label style={{...styles.btn, display:'block', textAlign:'center', marginTop:'10px', background:'#555'}}>+ เพิ่มรูปชั้น<input type="file" hidden accept="image/*" onChange={handleAddFloorImage} /></label>
           </div>
        )}
      </div>

      <div style={styles.centerPanel}>
        {currentFloor && (
          <>
            <div style={styles.toolbar}>
                <button style={styles.toolBtn(tool==='select')} onClick={()=>setTool('select')} title="👆 Select">👆</button>
                <button style={styles.toolBtn(tool==='hand')} onClick={()=>setTool('hand')} title="✋ Pan">✋</button>
                <hr style={{margin: '2px 0', border: 'none', borderTop: '1px solid #eee'}} />
                <button style={styles.toolBtn(tool==='rect')} onClick={()=>setTool('rect')} title="⬜ Rect">⬜</button>
                <button style={styles.toolBtn(tool==='circle')} onClick={()=>setTool('circle')} title="⚪ Circle">⚪</button>
                <button style={styles.toolBtn(tool==='poly')} onClick={()=>setTool('poly')} title="✏️ Poly">✏️</button>
                <hr style={{margin: '2px 0', border: 'none', borderTop: '1px solid #eee'}} />
                <button style={styles.toolBtn(showGrid)} onClick={()=>setShowGrid(!showGrid)} title="Toggle Grid">#</button>
            </div>
            <div style={styles.zoomControls}>
                <button style={styles.zoomBtn} onClick={zoomOut}>-</button>
                <span style={{display:'flex', alignItems:'center', fontSize:'0.9rem', width:'40px', justifyContent:'center'}}>{Math.round(zoom*100)}%</span>
                <button style={styles.zoomBtn} onClick={zoomIn}>+</button>
                <button style={styles.zoomBtn} onClick={zoomReset}>⟲</button>
            </div>
          </>
        )}

        {currentFloor ? (
             <div 
                ref={mapContainerRef}
                style={styles.mapViewport} 
                onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onContextMenu={(e) => e.preventDefault()}
             >
                <div style={styles.mapContent}>
                    <img src={currentFloor.image} style={styles.mapImage} />
                    <svg 
                        ref={svgRef} style={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none" onClick={handleSvgClick}
                    >
                        {showGrid && (
                            <g style={{pointerEvents: 'none', opacity: 0.15}}>
                            {Array.from({ length: 21 }).map((_, i) => (
                                <React.Fragment key={i}>
                                <line x1={i * 5} y1="0" x2={i * 5} y2="100" stroke="black" strokeWidth={0.1 / zoom} />
                                <line x1="0" y1={i * 5} x2="100" y2={i * 5} stroke="black" strokeWidth={0.1 / zoom} />
                                </React.Fragment>
                            ))}
                            </g>
                        )}

                        {currentFloor.locks.map(lock => {
                            if(!lock.isPolygon || !lock.points) return null; 
                            const isEdit = editingLock && editingLock.id === lock.id;
                            if(isEdit) return null; 
                            return (
                            <g 
                                key={lock.id} 
                                onMouseDown={(e)=>handleMouseDownOnLock(e, lock)}
                                onClick={(e)=>e.stopPropagation()} 
                            >
                                <path 
                                  d={getSmoothPath(lock.points, lock.curvature || 0)} 
                                  fill={lock.color || '#4ADE80'} 
                                  fillOpacity="0.5"
                                  stroke={lock.strokeColor || 'white'} 
                                  strokeWidth={lock.borderRadius || 0.5} 
                                  strokeLinejoin="round" strokeLinecap="round"
                                  vectorEffect="non-scaling-stroke"
                                />
                                <text x={lock.x} y={lock.y} fontSize={(lock.fontSize/10 || 0.3) / zoom} fill="black" textAnchor="middle" alignmentBaseline="middle" style={{pointerEvents:'none'}}>
                                  {lock.id}
                                </text>
                            </g>
                            )
                        })}

                        {tool === 'poly' && isDrawing && (
                            <>
                            {currentPoints.length > 0 && (
                                <circle 
                                    cx={currentPoints[0].x} cy={currentPoints[0].y} 
                                    r={1/zoom} fill="#F59E0B" stroke="white" strokeWidth={0.2/zoom} 
                                    style={{filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'}}
                                />
                            )}
                            <polyline points={pointsStr(currentPoints)} fill="none" stroke="#2E8B57" strokeWidth={0.5/zoom} />
                            {currentPoints.length > 0 && mousePos && (
                                <line 
                                    x1={currentPoints[currentPoints.length-1].x} y1={currentPoints[currentPoints.length-1].y}
                                    x2={mousePos.x} y2={mousePos.y}
                                    stroke={(currentPoints.length >= 3 && Math.sqrt(Math.pow(mousePos.x - currentPoints[0].x, 2) + Math.pow(mousePos.y - currentPoints[0].y, 2)) < 3) ? "#F59E0B" : "#2E8B57"} 
                                    strokeWidth={0.5/zoom} strokeDasharray="1,1"
                                />
                            )}
                            </>
                        )}

                        {editingLock && (
                            <g cursor="move" onMouseDown={()=>{}} onClick={(e)=>e.stopPropagation()}>
                            <path 
                                d={getSmoothPath(editingLock.points, editingLock.curvature || 0)} 
                                fill={editingLock.color} 
                                fillOpacity="0.6"
                                stroke="#2563EB" 
                                strokeWidth={editingLock.borderRadius || 0.5}
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                            />
                            {editingLock.points.map((p, i) => (
                                <circle 
                                    key={i} cx={p.x} cy={p.y} 
                                    r={i === selectedPointIndex ? 0.8/zoom : 0.5/zoom} 
                                    fill={i === selectedPointIndex ? "#FF4081" : (p.curvature > 0 ? "#3B82F6" : "white")}
                                    stroke="#2563EB" strokeWidth={0.1/zoom} cursor="move"
                                    onMouseDown={(e)=>handleMouseDownOnPoint(e, i)}
                                    onClick={(e)=>e.stopPropagation()} 
                                />
                            ))}
                            <text x={editingLock.x} y={editingLock.y} fontSize={(editingLock.fontSize/10 || 0.3)/zoom} fill="black" textAnchor="middle" alignmentBaseline="middle" style={{pointerEvents:'none'}}>{editingLock.id}</text>
                            </g>
                        )}
                    </svg>
                </div>
                {tool==='poly' && isDrawing && currentPoints.length >= 3 && (
                   <button onClick={finishPolyDrawing} style={{position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', padding:'10px 20px', background:'#22c55e', color:'white', border:'none', borderRadius:30, cursor:'pointer', zIndex: 30, boxShadow:'0 4px 10px rgba(0,0,0,0.2)'}}>✅ Finish Polygon</button>
                )}
             </div>
        ) : (
           <div style={{textAlign:'center', marginTop:100, color:'#999'}}>กรุณาเลือกชั้นหรือเพิ่มรูป</div>
        )}
      </div>

      <div style={styles.rightPanel}>
         {editingLock ? (
           <>
             <div style={styles.propHeader}>
                <span style={{display:'flex', alignItems:'center', gap:'5px'}}>🛠️ แก้ไขล็อก</span>
                <div style={{display:'flex', gap:'5px'}}>
                   <button onClick={handleCloneLock} title="Clone" style={{...styles.btn, width:'auto', background:'#3b82f6', padding:'4px 8px', fontSize:'0.9rem'}}>📑</button>
                   <button onClick={()=>handleDeleteLock(editingLock.id)} title="Delete" style={{...styles.btn, width:'auto', background:'#ef4444', padding:'4px 8px', fontSize:'0.9rem'}}>🗑️</button>
                </div>
             </div>
             <div style={styles.propBody}>
                {selectedPointIndex !== null && (
                    <div style={{marginBottom:'20px', padding:'12px', background:'#E3F2FD', borderRadius:'8px', border:'1px solid #90CAF9'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px', color:'#1976D2', fontWeight:'bold'}}>
                            📍 จุดที่เลือก ({selectedPointIndex})
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={{fontSize:'0.8rem', color:'#555'}}>ความโค้งของจุดนี้: {Math.round((editingLock.points[selectedPointIndex]?.curvature || 0) * 100)}%</label>
                            <input 
                                type="range" min="0" max="1" step="0.05" style={{width:'100%'}} 
                                value={editingLock.points[selectedPointIndex]?.curvature || 0} 
                                onChange={(e) => updatePointCurvature(e.target.value)} 
                            />
                        </div>
                        <small style={{color:'#666', fontStyle:'italic'}}>Double-click ที่จุดเพื่อลบ</small>
                    </div>
                )}

                <div style={styles.inputGroup}>
                    <label style={styles.label}>รหัสล็อก (ID)</label>
                    <input style={styles.input} value={editingLock.id} onChange={e=>setEditingLock({...editingLock, id:e.target.value})} placeholder="A01" />
                </div>
                
                <div style={styles.row}>
                   <div style={styles.inputGroup}>
                       <label style={styles.label}>ราคา</label>
                       <input type="number" style={styles.input} value={editingLock.price} onChange={e=>setEditingLock({...editingLock, price:e.target.value})} />
                   </div>
                   <div style={styles.inputGroup}>
                       <label style={styles.label}>พื้นที่ (ตร.ม.)</label>
                       <input type="number" style={styles.input} value={editingLock.area} onChange={e=>setEditingLock({...editingLock, area:e.target.value})} />
                   </div>
                </div>

                {/* 🔥 เหลือไว้แค่โซน */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>โซน (Zone)</label>
                    <input style={styles.input} value={editingLock.zone || ''} onChange={e=>setEditingLock({...editingLock, zone:e.target.value})} placeholder="เช่น โซนอาหาร" />
                </div>

                {/* 🔥 Custom Fields Section */}
                <div style={{marginTop:'15px', borderTop:'1px dashed #ddd', paddingTop:'15px'}}>
                    <label style={{...styles.label, color:'#0369a1', fontWeight:'bold'}}>✨ ข้อมูลแบบกำหนดเอง (Custom Fields)</label>
                    
                    {(editingLock.customFields || []).map((field, index) => (
                        <div key={index} style={styles.customFieldRow}>
                            <input 
                                style={styles.cfInput} 
                                placeholder="ชื่อข้อมูล (Key)" 
                                value={field.label} 
                                onChange={(e) => updateCustomField(index, 'label', e.target.value)} 
                            />
                            <input 
                                style={styles.cfInput} 
                                placeholder="ค่า (Value)" 
                                value={field.value} 
                                onChange={(e) => updateCustomField(index, 'value', e.target.value)} 
                            />
                            <button style={styles.cfBtn} onClick={() => removeCustomField(index)} title="ลบ">🗑️</button>
                        </div>
                    ))}
                    
                    <button style={styles.addCfBtn} onClick={addCustomField}>+ เพิ่มข้อมูล</button>
                </div>

                <hr style={{border:'0', borderTop:'1px solid #eee', margin:'15px 0'}} />

                <div style={styles.row}>
                    <div style={{flex:1}}>
                        <label style={styles.label}>สีพื้น สีขอบ</label>
                        <div style={{display:'flex', gap:'5px'}}>
                            <input type="color" style={{flex:1, height:'35px', border:'none', cursor:'pointer', padding:0}} value={editingLock.color} onChange={e=>setEditingLock({...editingLock, color:e.target.value})} />
                            <input type="color" style={{flex:1, height:'35px', border:'none', cursor:'pointer', padding:0}} value={editingLock.strokeColor || '#ffffff'} onChange={e=>setEditingLock({...editingLock, strokeColor:e.target.value})} />
                        </div>
                    </div>
                </div>

                <div style={{marginTop:'15px'}}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>ความโค้งรวม (Global Curve): {Math.round((editingLock.curvature||0)*100)}%</label>
                        <input type="range" min="0" max="1" step="0.05" style={{width:'100%'}} value={editingLock.curvature || 0} onChange={e=>setEditingLock({...editingLock, curvature:parseFloat(e.target.value)})} />
                    </div>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>ความหนาขอบ: {editingLock.borderRadius}</label>
                        <input type="range" min="0" max="5" step="0.1" style={{width:'100%'}} value={editingLock.borderRadius || 0} onChange={e=>setEditingLock({...editingLock, borderRadius:parseFloat(e.target.value)})} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>ขนาดฟอนต์: {editingLock.fontSize}</label>
                        <input type="range" min="1" max="50" step="1" style={{width:'100%'}} value={editingLock.fontSize || 10} onChange={e=>setEditingLock({...editingLock, fontSize:parseInt(e.target.value)})} />
                    </div>
                </div>

                <button style={styles.saveBtn} onClick={handleSaveLock}>บันทึก ✅</button>
             </div>
           </>
         ) : (
           <div style={{padding:'20px', color:'#666', textAlign:'center'}}>
             <p style={{marginBottom:'10px'}}><b>💡 วิธีใช้งาน:</b></p>
             <ul style={{textAlign:'left', fontSize:'0.9rem', paddingLeft:'20px', lineHeight:'1.6'}}>
               <li>คลิก ✋ เพื่อเลื่อนแผนที่</li>
               <li>คลิก ⬜ หรือ ✏️ เพื่อวาดล็อก</li>
               <li><b>คลิกที่จุดสีขาว</b> แล้วปรับความโค้งเฉพาะจุดได้</li>
             </ul>
           </div>
         )}
      </div>
    </div>
  );
}