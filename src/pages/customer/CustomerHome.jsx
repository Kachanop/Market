import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerHome({ markets }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // กรองตลาดตามชื่อที่ผู้ใช้ค้นหา
  const filteredMarkets = markets.filter(market =>
    market.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: { padding: '40px 20px 120px 20px', maxWidth: '1200px', margin: '0 auto' },
    hero: { textAlign: 'center', marginBottom: '60px', position: 'relative' },
    title: { fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '10px', background: 'linear-gradient(180deg, #1C1C1E 0%, #3A3A3C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { fontSize: '1.2rem', color: '#8E8E93', marginBottom: '40px' },
    searchWrapper: { position: 'relative', maxWidth: '500px', margin: '0 auto' },
    searchIcon: { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', fontSize: '1.2rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '40px' },
    card: { borderRadius: '24px', background: 'white', overflow: 'hidden', position: 'relative', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)', height: '450px', display: 'flex', flexDirection: 'column' },
    cardImageContainer: { height: '55%', width: '100%', position: 'relative', overflow: 'hidden' },
    cardImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' },
    cardContent: { padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, background: 'white' },
    cardLabel: { fontSize: '0.8rem', fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
    cardTitle: { fontSize: '1.6rem', fontWeight: '700', color: '#1C1C1E', marginBottom: '8px', lineHeight: 1.2 },
    // 🔥 Style สำหรับรายละเอียดตลาด
    cardDesc: { fontSize: '0.9rem', color: '#666', marginBottom: '15px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 },
    btnFloating: { padding: '8px 18px', background: '#F2F2F7', color: '#007AFF', fontWeight: '700', borderRadius: '20px', fontSize: '0.9rem', alignSelf: 'flex-start' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero} className="anim-fade">
        <h1 style={styles.title}>MarketOS</h1>
        <p style={styles.subtitle}>Discover the perfect space for your business.</p>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input className="input-ios" placeholder="Search markets..." style={{ paddingLeft: '50px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div style={styles.grid}>
        {filteredMarkets.length > 0 ? filteredMarkets.map((market, index) => (
          <div key={market.id} style={{ ...styles.card, animationDelay: `${index * 0.1}s` }} className="anim-slide-up" onClick={() => navigate(`/customer/booking/${market.id}`)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02) translateY(-10px)'; e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.12)'; e.currentTarget.querySelector('img').style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'; e.currentTarget.querySelector('img').style.transform = 'scale(1)'; }}
          >
            <div style={styles.cardImageContainer}>
              <img src={market.image || market.floors?.[0]?.image || 'https://via.placeholder.com/400x250?text=No+Image'} alt={market.name} style={styles.cardImg} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4))' }} />
            </div>

            <div style={styles.cardContent}>
              <div>
                <div style={styles.cardLabel}>FEATURED MARKET</div>
                <div style={styles.cardTitle}>{market.name}</div>
                {/* 🔥 แสดงรายละเอียดตลาด */}
                {market.description && <div style={styles.cardDesc}>{market.description}</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#8E8E93', fontSize: '0.9rem' }}>{market.floors?.length || 0} Floors available</span>
                <span style={styles.btnFloating}>VIEW</span>
              </div>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '60px', color: '#8E8E93' }}>
            <h2>No markets found.</h2>
          </div>
        )}
      </div>
    </div>
  );
}