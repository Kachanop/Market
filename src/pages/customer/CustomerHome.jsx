import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerHome({ markets }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMarkets = markets.filter(market => 
    market.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: "'Inter', sans-serif" },
    heroSection: {
      textAlign: 'center', marginBottom: '50px', padding: '40px 20px',
      background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
      borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', color: '#00695c'
    },
    heroTitle: {
      fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px',
      background: 'linear-gradient(to right, #2E8B57, #20B2AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    searchContainer: { position: 'relative', maxWidth: '600px', margin: '0 auto' },
    input: {
      width: '100%', padding: '18px 25px', paddingLeft: '50px', borderRadius: '50px',
      border: 'none', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', outline: 'none', transition: 'all 0.3s'
    },
    searchIcon: { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#888' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
    card: {
      backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)', cursor: 'pointer', position: 'relative', border: '1px solid #f0f0f0'
    },
    cardImage: { width: '100%', height: '220px', objectFit: 'cover' },
    cardContent: { padding: '20px' },
    cardTitle: { fontSize: '1.3rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', color: '#666', fontSize: '0.9rem' },
    btnBook: { padding: '8px 20px', backgroundColor: '#2E8B57', color: 'white', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', border: 'none' }
  };

  const handleMarketClick = (marketId) => {
    // ส่งไปหน้าจอง (ถ้ายังไม่ล็อกอิน App.jsx จะดีดไปหน้า Login ให้เอง)
    navigate(`/customer/booking/${marketId}`);
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.heroSection} className="anim-scale-in">
        <h1 style={styles.heroTitle}>ค้นหาตลาดที่ใช่ ทำเลที่ชอบ</h1>
        <p style={{fontSize: '1.1rem', marginBottom: '30px', opacity: 0.8}}>จองพื้นที่ขายของออนไลน์ได้ง่ายๆ ตลอด 24 ชั่วโมง</p>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input 
            type="text" placeholder="ค้นหาชื่อตลาด..." style={styles.input}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => e.target.style.boxShadow = '0 6px 20px rgba(46, 139, 87, 0.2)'}
            onBlur={(e) => e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'}
          />
        </div>
      </div>

      <h2 style={{color: '#444', marginBottom: '20px'}} className="anim-slide-up">
        {searchTerm ? 'ผลการค้นหา' : 'ตลาดทั้งหมด'}
      </h2>
      
      <div style={styles.grid}>
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market, index) => (
            <div 
              key={market.id} 
              style={{...styles.card, animationDelay: `${index * 0.1}s`}} 
              className="anim-slide-up hover-scale hover-shadow"
              onClick={() => handleMarketClick(market.id)}
            >
              <img 
                // ✅ แก้ไขตรงนี้: ลบ Syntax Markdown ออก ให้เหลือแค่ URL string
                src={market.floors?.[0]?.image || 'https://via.placeholder.com/400x250?text=Market+Image'} 
                alt={market.name} style={styles.cardImage} 
              />
              <div style={styles.cardContent}>
                <div style={styles.cardTitle}>{market.name}</div>
                <div style={{color: '#888', fontSize: '0.9rem'}}>📍 ทำเลทอง ย่านชุมชน</div>
                <div style={styles.cardFooter}>
                  <span>{market.floors?.length || 0} ชั้น</span>
                  <button style={styles.btnBook}>จองเลย ➝</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#888' }}>
            <div style={{fontSize: '3rem', marginBottom: '10px'}}>😕</div>
            <h3>ไม่พบตลาดที่คุณค้นหา</h3>
          </div>
        )}
      </div>
    </div>
  );
}