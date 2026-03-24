import { useState, useEffect } from 'react';
import { coursesService } from '../../services/courses';
import CourseCard from './CourseCard';

const CourseList = ({ filters = {} }) => {
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [page, setPage]           = useState(1);

  useEffect(() => { loadCourses(); }, [filters]);

  const loadCourses = async (url = null) => {
    try {
      setLoading(true);
      // Build params – use price as max_price filter (backend lte)
      const params = url ? {} : {
        search: filters.search || undefined,
        price__lte: filters.price || undefined,   // ← أقل من أو يساوي
      };
      const response = url
        ? await coursesService.getAll({ url })
        : await coursesService.getAll(params);

      // Client-side price filter as fallback (if backend doesn't support price__lte)
      let results = response.results || response;
      if (filters.price && !isNaN(filters.price)) {
        results = results.filter(c => parseFloat(c.price) <= parseFloat(filters.price));
      }

      setCourses(results);
      if (response.count !== undefined) {
        setPagination({ count: response.count, next: response.next, previous: response.previous });
      }
    } catch {
      setError('فشل تحميل الكورسات');
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => { loadCourses(pagination.next); setPage(p => p + 1); };
  const goPrev = () => { loadCourses(pagination.previous); setPage(p => p - 1); };

  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>جاري التحميل...</p>
    </div>
  );

  if (error) return <div style={s.errorBox}>{error}</div>;

  if (courses.length === 0) return (
    <div style={s.empty}>
      <p style={s.emptyIcon}>🔍</p>
      <p style={s.emptyText}>لم يتم العثور على كورسات</p>
      <p style={s.emptySub}>جرّب تغيير كلمة البحث أو رفع السعر الأقصى</p>
    </div>
  );

  return (
    <div>
      {/* Count */}
      <p style={s.count}>{courses.length} كورس{pagination.count > courses.length ? ` من ${pagination.count}` : ''}</p>

      {/* Grid */}
      <div style={s.grid}>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Pagination */}
      {(pagination.next || pagination.previous) && (
        <div style={s.pag}>
          <button style={s.pagBtn(!pagination.previous)} onClick={goPrev} disabled={!pagination.previous}>
            ← السابق
          </button>
          <span style={s.pagInfo}>صفحة {page}</span>
          <button style={s.pagBtn(!pagination.next)} onClick={goNext} disabled={!pagination.next}>
            التالي →
          </button>
        </div>
      )}
    </div>
  );
};

const s = {
  center:  { textAlign: 'center', padding: '80px 20px' },
  spinner: { width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)',
             borderTopColor: '#e94560', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
  errorBox:{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)',
             color: '#e94560', borderRadius: 12, padding: '20px', textAlign: 'center' },
  empty:   { textAlign: 'center', padding: '80px 20px' },
  emptyIcon:{ fontSize: 48, margin: '0 0 16px' },
  emptyText:{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px' },
  emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 },
  count:   { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 },
  pag:     { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 48 },
  pagBtn:  (disabled) => ({
    padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
    background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(233,69,96,0.15)',
    color: disabled ? 'rgba(255,255,255,0.2)' : '#e94560',
    cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14,
  }),
  pagInfo: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
};

// Inject spinner keyframes
if (typeof document !== 'undefined' && !document.getElementById('cl-spin')) {
  const st = document.createElement('style');
  st.id = 'cl-spin';
  st.innerHTML = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(st);
}

export default CourseList;