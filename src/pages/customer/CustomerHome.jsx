import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerHome({ markets }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // --- 1. Logic ค้นหาตลาด (จากข้อมูลจริง markets) ---
  const filteredMarkets = markets.filter(market => 
    market.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 2. Logic ตลาดขวัญใจมหาชน (สมมติเอา 4 อันแรกจากข้อมูลจริง) ---
  const popularMarkets = markets.slice(0, 4);

  // --- Styles (ดีไซน์เดิม StallFinder) ---
  const styles = {
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: "'Inter', 'Sarabun', sans-serif",
      color: '#333'
    },
    
    // Search Bar
    searchContainer: {
      backgroundColor: '#E8F5E9',
      padding: '15px 25px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '40px',
      maxWidth: '800px', // จำกัดความกว้างช่องค้นหาไม่ให้ยาวเกินไป
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    searchIcon: {
      fontSize: '1.2rem',
      marginRight: '15px',
      color: '#4CAF50'
    },
    input: {
      border: 'none',
      backgroundColor: 'transparent',
      width: '100%',
      fontSize: '1rem',
      color: '#2E7D32',
      outline: 'none',
      fontWeight: '500'
    },

    // Headers
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '20px',
      marginTop: '10px',
      color: '#111'
    },

    // Grid
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // ปรับขนาด Grid ให้พอดี
      gap: '30px',
      marginBottom: '50px'
    },

    // Card
    card: {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: 'transparent',
      border: 'none',
      textAlign: 'left'
    },
    cardImageWrapper: {
      width: '100%',
      height: '180px',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      backgroundColor: '#f0f0f0' // สีพื้นหลังเผื่อรูปโหลดไม่ทัน
    },
    cardImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s'
    },
    cardContent: {
      padding: '0 5px'
    },
    cardTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      marginBottom: '4px',
      color: '#1a1a1a',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    cardLocation: {
      fontSize: '0.9rem',
      color: '#4CAF50',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  };

  // Component การ์ด
  const MarketCard = ({ market }) => {
    // หารูปภาพ: ใช้รูปชั้น 1 หรือ Placeholder ถ้าไม่มี
    const displayImage = market.floors?.[0]?.image || 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    // สมมติ Location (เนื่องจากใน mockData เราอาจจะยังไม่มี field นี้)
    const displayLocation = market.location || "Bangkok, Thailand";

    return (
      <div 
        style={styles.card}
        onClick={() => navigate(`/customer/booking/${market.id}`)}
        onMouseEnter={(e) => {
          e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.querySelector('img').style.transform = 'scale(1)';
        }}
      >
        <div style={styles.cardImageWrapper}>
          <img 
            src={displayImage} 
            alt={market.name} 
            style={styles.cardImage} 
          />
        </div>
        <div style={styles.cardContent}>
          <div style={styles.cardTitle}>{market.name}</div>
          <div style={styles.cardLocation}>📍 {displayLocation}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      
      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <span style={styles.searchIcon}>🔍</span>
        <input 
          type="text" 
          placeholder="Search for markets..." 
          style={styles.input}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ถ้าไม่มีการค้นหา ให้โชว์ Popular Markets */}
      {!searchTerm && markets.length > 0 && (
        <>
          <h2 style={styles.sectionTitle}>Popular Markets</h2>
          <div style={styles.grid}>
            {popularMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </>
      )}

      {/* All Markets (หรือผลการค้นหา) */}
      <h2 style={styles.sectionTitle}>
        {searchTerm ? 'Search Results' : 'All Markets'}
      </h2>
      
      <div style={styles.grid}>
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '40px' }}>
            <h3>ไม่พบตลาดที่คุณค้นหา</h3>
            <p>ลองใช้คำค้นหาอื่นดูนะครับ</p>
          </div>
        )}
      </div>

    </div>
  );
}