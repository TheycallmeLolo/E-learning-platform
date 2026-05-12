// src/components/experiences/ExperienceList.js
import { useState, useEffect } from 'react';
import { experiencesService } from '../../services/experiences';
import ExperienceCard from './ExperienceCard';

const ExperienceList = ({ filters = {} }) => {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [pagination, setPagination] = useState({ count:0, next:null, previous:null });
  const [page, setPage]           = useState(1);

  useEffect(() => { load(); }, [filters]);

  const load = async () => {
    try {
      setLoading(true);
      const params = {
        search       : filters.search  || undefined,
        price__lte   : filters.price   || undefined,
        is_featured  : filters.featured || undefined,
      };
      const res     = await experiencesService.getAll(params);
      let results   = res.data.results ?? res.data;

      // client-side price filter fallback
      if (filters.price && !isNaN(filters.price)) {
        results = results.filter(e => parseFloat(e.effective_price) <= parseFloat(filters.price));
      }

      setItems(results);
      if (res.data.count !== undefined) {
        setPagination({ count:res.data.count, next:res.data.next, previous:res.data.previous });
      }
    } catch {
      setError('فشل تحميل التجارب');
    } finally {
      setLoading(false);
    }
  };

  const goNext = async () => {
    if (!pagination.next) return;
    const res = await experiencesService.getAll({ url: pagination.next });
    const results = res.data.results ?? res.data;
    setItems(results);
    setPagination({ count: res.data.count, next: res.data.next, previous: res.data.previous });
    setPage(p => p + 1);
  };

  const goPrev = async () => {
    if (!pagination.previous) return;
    const res = await experiencesService.getAll({ url: pagination.previous });
    const results = res.data.results ?? res.data;
    setItems(results);
    setPagination({ count: res.data.count, next: res.data.next, previous: res.data.previous });
    setPage(p => p - 1);
  };

  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color:'rgba(255,255,255,0.4)', marginTop:16 }}>جاري التحميل...</p>
    </div>
  );

  if (error) return <div style={s.errorBox}>{error}</div>;

  if (items.length === 0) return (
    <div style={s.empty}>
      <p style={s.emptyIcon}>🔍</p>
      <p style={s.emptyText}>لم يتم العثور على تجارب</p>
      <p style={s.emptySub}>جرّب تغيير كلمة البحث أو رفع السعر الأقصى</p>
    </div>
  );

  return (
    <div>
      <p style={s.count}>
        {items.length} تجربة{pagination.count > items.length ? ` من ${pagination.count}` : ''}
      </p>
      <div style={s.grid}>
        {items.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
      </div>
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
  center  : { textAlign:'center', padding:'80px 20px' },
  spinner : { width:44, height:44, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'#c8973a', animation:'spin 0.8s linear infinite', margin:'0 auto' },
  errorBox: { background:'rgba(233,69,96,0.1)', border:'1px solid rgba(233,69,96,0.3)', color:'#e94560', borderRadius:12, padding:'20px', textAlign:'center' },
  empty   : { textAlign:'center', padding:'80px 20px' },
  emptyIcon:{ fontSize:48, margin:'0 0 16px' },
  emptyText:{ color:'#fff', fontSize:20, fontWeight:700, margin:'0 0 8px' },
  emptySub: { color:'rgba(255,255,255,0.4)', fontSize:14, margin:0 },
  count   : { color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:20 },
  grid    : { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 },
  pag     : { display:'flex', justifyContent:'center', alignItems:'center', gap:16, marginTop:48 },
  pagBtn  : (disabled) => ({ padding:'10px 24px', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(200,151,58,0.15)', color: disabled ? 'rgba(255,255,255,0.2)' : '#c8973a', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight:600, fontSize:14 }),
  pagInfo : { color:'rgba(255,255,255,0.5)', fontSize:14 },
};

if (typeof document !== 'undefined' && !document.getElementById('el-spin')) {
  const st = document.createElement('style');
  st.id = 'el-spin';
  st.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}

export default ExperienceList;
