import { useState } from 'react';
import CourseList from '../components/courses/CourseList';

const Courses = () => {
  const [filters, setFilters] = useState({ search: '', price: '' });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => setFilters({ search: '', price: '' });

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <p style={s.heroEyebrow}>📚 مكتبة الكورسات</p>
          <h1 style={s.heroTitle}>ابدأ رحلة التعلم</h1>
          <p style={s.heroSub}>اكتشف مئات الكورسات في مختلف المجالات</p>

          {/* Search bar */}
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="ابحث عن كورس..."
            />
            {filters.search && (
              <button style={s.searchClear} onClick={() => setFilters({ ...filters, search: '' })}>✕</button>
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
              <span style={s.priceIcon}>💰</span>
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
              <button style={s.clearBtn} onClick={handleClearFilters}>
                ✕ مسح الكل
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course list */}
      <div style={s.listWrap}>
        <CourseList filters={filters} />
      </div>
    </div>
  );
};

const s = {
  page: { background: '#0f0f1a', minHeight: '100vh' },

  // Hero
  hero: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '60px 20px 50px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroInner: { maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 },
  heroEyebrow: { color: '#e94560', fontWeight: 700, fontSize: 13, letterSpacing: 3,
                  textTransform: 'uppercase', margin: '0 0 12px' },
  heroTitle: { color: '#fff', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800,
               margin: '0 0 12px', lineHeight: 1.15 },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 16, margin: '0 0 32px' },

  // Search
  searchWrap: { position: 'relative', maxWidth: 520, margin: '0 auto', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 16, fontSize: 18, zIndex: 1 },
  searchInput: {
    width: '100%', padding: '14px 44px 14px 48px', borderRadius: 50,
    border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff',
    fontSize: 15, outline: 'none', backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
    '::placeholder': { color: 'rgba(255,255,255,0.4)' },
  },
  searchClear: { position: 'absolute', right: 16, background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 16 },

  // Filters bar
  filtersBar: { background: '#16213e', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px' },
  filtersInner: { maxWidth: 1200, margin: '0 auto' },
  filterChips: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  filterLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600 },
  priceWrap: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.07)',
               borderRadius: 8, padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)' },
  priceIcon: { fontSize: 14, marginRight: 6 },
  priceInput: { background: 'none', border: 'none', color: '#fff', fontSize: 13,
                padding: '8px 0', outline: 'none', width: 160 },
  clearBtn: { background: 'rgba(233,69,96,0.15)', color: '#e94560', border: '1px solid rgba(233,69,96,0.3)',
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },

  // List
  listWrap: { maxWidth: 1200, margin: '0 auto', padding: '40px 20px' },
};

export default Courses;