import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enrollmentsService } from '../../services/enrollments';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const navigate                       = useNavigate();

  useEffect(() => { loadEnrollments(); }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await enrollmentsService.getMyCourses();
      setEnrollments(Array.isArray(data) ? data : data.results || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={s.center}><div style={s.spinner} /></div>
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.eyebrow}>📚 لوحة الطالب</p>
          <h1 style={s.title}>كورساتي</h1>
          <p style={s.sub}>{enrollments.length} كورس مسجّل</p>
        </div>
        <button style={s.browseBtn} onClick={() => navigate('/courses')}>
          🔍 تصفح كورسات جديدة
        </button>
      </div>

      {enrollments.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🎓</div>
          <h3 style={s.emptyTitle}>لم تسجّل في أي كورس بعد</h3>
          <p style={s.emptySub}>ابدأ رحلتك التعليمية الآن</p>
          <button style={s.browseBtn} onClick={() => navigate('/courses')}>
            تصفح الكورسات →
          </button>
        </div>
      ) : (
        <div style={s.grid}>
          {enrollments.map((en) => {
            const course = en.course || en;
            const enrolledAt = en.enrolled_at
              ? new Date(en.enrolled_at).toLocaleDateString('ar-EG', { year:'numeric', month:'short', day:'numeric' })
              : '';
            return (
              <div key={en.id} style={s.card}>
                {/* Image */}
                <div style={s.imgWrap}>
                  {course.image_url
                    ? <img src={course.image_url} alt={course.title} style={s.img} />
                    : <div style={s.imgPlaceholder}><span style={{ fontSize:40, opacity:0.3 }}>🎓</span></div>}
                  <div style={s.enrolledBadge}>✓ مسجّل</div>
                </div>

                {/* Body */}
                <div style={s.cardBody}>
                  <h3 style={s.cardTitle}>{course.title}</h3>
                  <p style={s.cardInstructor}>👤 {course.instructor_name || course.instructor_email}</p>
                  {enrolledAt && <p style={s.cardDate}>📅 تسجيل: {enrolledAt}</p>}

                  <div style={s.cardMeta}>
                    {course.total_sections > 0 && <span style={s.metaItem}>📂 {course.total_sections} أقسام</span>}
                    {course.total_lectures > 0 && <span style={s.metaItem}>🎬 {course.total_lectures} ليكتشر</span>}
                  </div>

                  <button style={s.continueBtn} onClick={() => navigate(`/courses/${course.id}`)}>
                    ▶ تابع التعلم
                  </button>
                </div>
              </div>
            );
          })}
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

  header: { maxWidth:1200, margin:'0 auto 32px', display:'flex', justifyContent:'space-between',
            alignItems:'flex-start', flexWrap:'wrap', gap:16 },
  eyebrow:{ color:'#e94560', fontSize:13, fontWeight:700, letterSpacing:2,
            textTransform:'uppercase', margin:'0 0 8px' },
  title:  { color:'#fff', fontSize:'clamp(24px,4vw,36px)', fontWeight:800, margin:'0 0 6px' },
  sub:    { color:'rgba(255,255,255,0.4)', fontSize:14, margin:0 },
  browseBtn:{ background:'rgba(233,69,96,0.12)', color:'#e94560', border:'1px solid rgba(233,69,96,0.25)',
              borderRadius:10, padding:'11px 22px', cursor:'pointer', fontWeight:700, fontSize:14 },

  empty:      { maxWidth:400, margin:'80px auto', textAlign:'center' },
  emptyIcon:  { fontSize:64, marginBottom:16 },
  emptyTitle: { color:'#fff', fontSize:22, fontWeight:700, margin:'0 0 8px' },
  emptySub:   { color:'rgba(255,255,255,0.4)', margin:'0 0 24px' },

  grid: { maxWidth:1200, margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 },

  card:     { background:'#1a1a2e', borderRadius:16, overflow:'hidden',
              border:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column' },
  imgWrap:  { position:'relative', height:170, flexShrink:0, overflow:'hidden' },
  img:      { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  imgPlaceholder: { width:'100%', height:'100%', background:'linear-gradient(135deg,#0f3460,#16213e)',
                    display:'flex', alignItems:'center', justifyContent:'center' },
  enrolledBadge: { position:'absolute', top:12, left:12, background:'rgba(0,200,150,0.9)',
                   color:'#fff', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20 },
  cardBody:   { padding:'16px 18px 18px', display:'flex', flexDirection:'column', flex:1 },
  cardTitle:  { color:'#fff', fontSize:16, fontWeight:700, margin:'0 0 8px', lineHeight:1.4 },
  cardInstructor:{ color:'rgba(255,255,255,0.4)', fontSize:12, margin:'0 0 4px' },
  cardDate:   { color:'rgba(255,255,255,0.3)', fontSize:12, margin:'0 0 12px' },
  cardMeta:   { display:'flex', gap:10, flexWrap:'wrap', marginBottom:16, flex:1 },
  metaItem:   { color:'rgba(255,255,255,0.4)', fontSize:12 },
  continueBtn:{ background:'linear-gradient(135deg,#e94560,#c73652)', color:'#fff', border:'none',
                borderRadius:8, padding:'10px', cursor:'pointer', fontWeight:700, fontSize:14,
                width:'100%' },
};

if (typeof document !== 'undefined' && !document.getElementById('sd-spin')) {
  const st = document.createElement('style');
  st.id = 'sd-spin';
  st.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}

export default StudentDashboard;