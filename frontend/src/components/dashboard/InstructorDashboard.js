import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '../../services/courses';
import { authService } from '../../services/auth';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [formData, setFormData]     = useState({ title:'', description:'', price:'', image:null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const user = authService.getUserFromStorage();

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const u = authService.getUserFromStorage();
      const data = await coursesService.getAll({ instructor: u?.id });
      setCourses(Array.isArray(data) ? data : (data.results || []));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') setFormData({ ...formData, image: e.target.files[0] });
    else setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      const created = await coursesService.create(formData);
      setShowForm(false);
      setFormData({ title:'', description:'', price:'', image:null });
      await loadCourses();
      // Go directly to manage page
      navigate(`/courses/${created.id}/manage`);
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object' ? Object.values(d).flat().join(', ') : 'فشل إنشاء الكورس');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={s.center}><div style={s.spinner} /></div>;

  const approved  = courses.filter(c => c.is_approved);
  const pending   = courses.filter(c => !c.is_approved);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.eyebrow}>🎓 لوحة المدرّس</p>
          <h1 style={s.title}>كورساتي</h1>
          <div style={s.stats}>
            <div style={s.stat}>
              <span style={s.statNum}>{courses.length}</span>
              <span style={s.statLabel}>إجمالي</span>
            </div>
            <div style={s.statDiv} />
            <div style={s.stat}>
              <span style={{ ...s.statNum, color:'#00c896' }}>{approved.length}</span>
              <span style={s.statLabel}>معتمد</span>
            </div>
            <div style={s.statDiv} />
            <div style={s.stat}>
              <span style={{ ...s.statNum, color:'#f5a623' }}>{pending.length}</span>
              <span style={s.statLabel}>انتظار</span>
            </div>
          </div>
        </div>
        <div style={s.headerBtns}>
          <button style={s.createBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ إلغاء' : '+ كورس جديد'}
          </button>
          {user?.is_staff && (
            <button style={s.adminBtn} onClick={() => navigate('/admin/courses')}>
              🛡 لوحة الأدمن
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>إنشاء كورس جديد</h3>
          <p style={s.formNote}>💡 بعد الإنشاء ستنتقل لصفحة إضافة الأقسام والليكتشرات</p>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formRow}>
              <div style={s.field}>
                <label style={s.label}>عنوان الكورس *</label>
                <input style={s.input} name="title" value={formData.title}
                  onChange={handleChange} placeholder="مثال: تعلم React من الصفر" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>السعر (EGP) *</label>
                <input style={s.input} type="number" name="price" value={formData.price}
                  onChange={handleChange} min="0" step="0.01" placeholder="0 = مجاني" required />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>الوصف *</label>
              <textarea style={{ ...s.input, height:90, resize:'vertical' }} name="description"
                value={formData.description} onChange={handleChange} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>صورة الغلاف</label>
              <input type="file" name="image" accept="image/*" onChange={handleChange}
                style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }} />
            </div>
            {error && <p style={s.errorTxt}>⚠ {error}</p>}
            <button type="submit" style={s.submitBtn} disabled={submitting}>
              {submitting ? '⏳ جاري الإنشاء...' : '✓ إنشاء وإدارة المحتوى →'}
            </button>
          </form>
        </div>
      )}

      {/* Empty state */}
      {courses.length === 0 && !showForm && (
        <div style={s.empty}>
          <div style={{ fontSize:64, marginBottom:16 }}>📝</div>
          <h3 style={{ color:'#fff', margin:'0 0 8px' }}>لم تنشئ أي كورسات بعد</h3>
          <p style={{ color:'rgba(255,255,255,0.4)', margin:'0 0 24px' }}>ابدأ بإنشاء كورسك الأول</p>
          <button style={s.createBtn} onClick={() => setShowForm(true)}>+ إنشاء كورس</button>
        </div>
      )}

      {/* Course grid */}
      {courses.length > 0 && (
        <div style={s.grid}>
          {courses.map((course) => (
            <div key={course.id} style={s.card}>
              {/* Image */}
              <div style={s.imgWrap} onClick={() => navigate(`/courses/${course.id}`)}>
                {course.image_url
                  ? <img src={course.image_url} alt={course.title} style={s.img} />
                  : <div style={s.imgPlaceholder}><span style={{ fontSize:40, opacity:0.3 }}>🎓</span></div>}
                <div style={s.statusBadge(course.is_approved)}>
                  {course.is_approved ? '✓ معتمد' : '⏳ انتظار'}
                </div>
              </div>

              {/* Body */}
              <div style={s.cardBody}>
                <h3 style={s.cardTitle} onClick={() => navigate(`/courses/${course.id}`)}>
                  {course.title}
                </h3>
                <div style={s.cardMeta}>
                  <span style={s.price}>{parseFloat(course.price) === 0 ? 'مجاني' : `${parseFloat(course.price).toFixed(0)} EGP`}</span>
                  {course.total_sections > 0 && <span style={s.metaItem}>📂 {course.total_sections}</span>}
                  {course.total_lectures > 0 && <span style={s.metaItem}>🎬 {course.total_lectures}</span>}
                </div>
                <button style={s.manageBtn} onClick={() => navigate(`/courses/${course.id}/manage`)}>
                  ⚙ إدارة المحتوى
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const s = {
  page:   { background:'#0f0f1a', minHeight:'100vh', padding:'40px 20px' },
  center: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0f0f1a' },
  spinner:{ width:44, height:44, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)',
            borderTopColor:'#e94560', animation:'spin 0.8s linear infinite' },

  header:     { maxWidth:1200, margin:'0 auto 28px', display:'flex', justifyContent:'space-between',
                alignItems:'flex-start', flexWrap:'wrap', gap:16 },
  eyebrow:    { color:'#e94560', fontSize:13, fontWeight:700, letterSpacing:2,
                textTransform:'uppercase', margin:'0 0 8px' },
  title:      { color:'#fff', fontSize:'clamp(24px,4vw,36px)', fontWeight:800, margin:'0 0 16px' },
  stats:      { display:'flex', alignItems:'center', gap:20 },
  stat:       { display:'flex', flexDirection:'column', alignItems:'center' },
  statNum:    { color:'#fff', fontSize:28, fontWeight:800, lineHeight:1 },
  statLabel:  { color:'rgba(255,255,255,0.35)', fontSize:12, marginTop:4 },
  statDiv:    { width:1, height:40, background:'rgba(255,255,255,0.1)' },
  headerBtns: { display:'flex', gap:10, flexWrap:'wrap' },
  createBtn:  { background:'linear-gradient(135deg,#e94560,#c73652)', color:'#fff', border:'none',
                borderRadius:10, padding:'11px 22px', cursor:'pointer', fontWeight:700, fontSize:14 },
  adminBtn:   { background:'rgba(100,100,255,0.12)', color:'#8888ff', border:'1px solid rgba(100,100,255,0.25)',
                borderRadius:10, padding:'11px 22px', cursor:'pointer', fontWeight:700, fontSize:14 },

  formCard:  { maxWidth:1200, margin:'0 auto 28px', background:'#1a1a2e', borderRadius:16,
               padding:24, border:'1px solid rgba(255,255,255,0.08)' },
  formTitle: { color:'#fff', fontSize:18, fontWeight:700, margin:'0 0 6px' },
  formNote:  { color:'rgba(255,255,255,0.4)', fontSize:13, margin:'0 0 20px' },
  form:      { display:'flex', flexDirection:'column', gap:16 },
  formRow:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  field:     { display:'flex', flexDirection:'column', gap:6 },
  label:     { color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600 },
  input:     { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
               color:'#fff', borderRadius:8, padding:'10px 14px', fontSize:14, outline:'none',
               boxSizing:'border-box', width:'100%' },
  errorTxt:  { color:'#e94560', fontSize:13 },
  submitBtn: { background:'linear-gradient(135deg,#28a745,#1e7e34)', color:'#fff', border:'none',
               borderRadius:8, padding:'12px', fontSize:15, fontWeight:700, cursor:'pointer' },

  empty: { maxWidth:400, margin:'80px auto', textAlign:'center' },

  grid: { maxWidth:1200, margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 },

  card:     { background:'#1a1a2e', borderRadius:16, overflow:'hidden',
              border:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column' },
  imgWrap:  { position:'relative', height:160, cursor:'pointer', overflow:'hidden', flexShrink:0 },
  img:      { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  imgPlaceholder: { width:'100%', height:'100%', background:'linear-gradient(135deg,#0f3460,#16213e)',
                    display:'flex', alignItems:'center', justifyContent:'center' },
  statusBadge: (approved) => ({
    position:'absolute', top:10, right:10, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20,
    background: approved ? 'rgba(0,200,150,0.9)' : 'rgba(245,166,35,0.9)', color:'#fff',
  }),
  cardBody:  { padding:'14px 16px 16px', display:'flex', flexDirection:'column', flex:1 },
  cardTitle: { color:'#fff', fontSize:15, fontWeight:700, margin:'0 0 10px', cursor:'pointer',
               lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  cardMeta:  { display:'flex', gap:10, alignItems:'center', marginBottom:14, flex:1, flexWrap:'wrap' },
  price:     { color:'#e94560', fontWeight:700, fontSize:14 },
  metaItem:  { color:'rgba(255,255,255,0.35)', fontSize:12 },
  manageBtn: { background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.8)',
               border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px',
               cursor:'pointer', fontWeight:600, fontSize:13, width:'100%' },
};

if (typeof document !== 'undefined' && !document.getElementById('id-spin')) {
  const st = document.createElement('style');
  st.id = 'id-spin';
  st.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}

export default InstructorDashboard;