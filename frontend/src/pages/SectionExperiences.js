// src/pages/SectionExperiences.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExperienceList from '../components/experiences/ExperienceList';

const SectionExperiences = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search:'', price:'' });
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleFilterChange = (e) =>
    setFilters(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleClear = () => setFilters({ search:'', price:'' });

  return (
    <div style={s.page}>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <p style={s.heroEyebrow}>🧪 تجارب السكاشن</p>
          <h1 style={s.heroTitle}>اشترِ وشاهد</h1>
          <p style={s.heroSub}>فاتك سكشن؟ اشتريه واشوف كيف اتحلّت المسائل خطوة بخطوة</p>

          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="ابحث عن تجربة أو كورس..."
            />
            {filters.search && (
              <button style={s.searchClear}
                onClick={() => setFilters(p => ({ ...p, search:'' }))}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div style={s.filtersBar}>
        <div style={s.filtersInner}>
          <div style={s.filterChips}>
            <span style={s.filterLabel}>تصفية:</span>
            <div style={s.priceWrap}>
              <span>💰</span>
              <input
                style={s.priceInput}
                type="number"
                name="price"
                value={filters.price}
                onChange={handleFilterChange}
                placeholder="أقصى سعر (EGP)"
                min="0"
              />
            </div>
            {(filters.search || filters.price) && (
              <button style={s.clearBtn} onClick={handleClear}>✕ مسح الكل</button>
            )}
            {/* زر إضافة تجربة للمدرس */}
            {user?.is_instructor && (
              <button style={s.addBtn} onClick={() => navigate('/experiences/create')}>
                + إضافة تجربة
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div style={s.listWrap}>
        <ExperienceList filters={filters} />
      </div>
    </div>
  );
};

const s = {
  page       : { background:'#0f0f1a', minHeight:'100vh' },
  hero       : { background:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', padding:'60px 20px 50px', position:'relative', overflow:'hidden' },
  heroInner  : { maxWidth:700, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 },
  heroEyebrow: { color:'#c8973a', fontWeight:700, fontSize:13, letterSpacing:3, textTransform:'uppercase', margin:'0 0 12px' },
  heroTitle  : { color:'#fff', fontSize:'clamp(32px,5vw,52px)', fontWeight:800, margin:'0 0 12px', lineHeight:1.15 },
  heroSub    : { color:'rgba(255,255,255,0.6)', fontSize:16, margin:'0 0 32px' },
  searchWrap : { position:'relative', maxWidth:520, margin:'0 auto', display:'flex', alignItems:'center' },
  searchIcon : { position:'absolute', left:16, fontSize:18, zIndex:1 },
  searchInput: { width:'100%', padding:'14px 44px 14px 48px', borderRadius:50, border:'none', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:15, outline:'none', backdropFilter:'blur(10px)', boxSizing:'border-box' },
  searchClear: { position:'absolute', right:16, background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:16 },
  filtersBar : { background:'#16213e', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 20px' },
  filtersInner:{ maxWidth:1200, margin:'0 auto' },
  filterChips: { display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' },
  filterLabel: { color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:600 },
  priceWrap  : { display:'flex', alignItems:'center', background:'rgba(255,255,255,0.07)', borderRadius:8, padding:'0 12px', border:'1px solid rgba(255,255,255,0.1)', gap:6 },
  priceInput : { background:'none', border:'none', color:'#fff', fontSize:13, padding:'8px 0', outline:'none', width:160 },
  clearBtn   : { background:'rgba(233,69,96,0.15)', color:'#e94560', border:'1px solid rgba(233,69,96,0.3)', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:13, fontWeight:600 },
  addBtn     : { background:'rgba(200,151,58,0.15)', color:'#c8973a', border:'1px solid rgba(200,151,58,0.3)', borderRadius:8, padding:'7px 16px', cursor:'pointer', fontSize:13, fontWeight:700, marginRight:'auto' },
  listWrap   : { maxWidth:1200, margin:'0 auto', padding:'40px 20px' },
};

export default SectionExperiences;
