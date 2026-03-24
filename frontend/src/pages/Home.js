import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { coursesService } from '../services/courses';
import CourseCard from '../components/courses/CourseCard';

// ─── Stats counter ────────────────────────────────────────────────────────────
const StatItem = ({ num, label, icon }) => (
  <div style={s.statItem}>
    <span style={s.statIcon}>{icon}</span>
    <span style={s.statNum}>{num}</span>
    <span style={s.statLabel}>{label}</span>
  </div>
);

// ─── Category pill ────────────────────────────────────────────────────────────
const categories = [
  { icon: '💻', label: 'برمجة' },
  { icon: '🎨', label: 'تصميم' },
  { icon: '📈', label: 'تسويق' },
  { icon: '🗣', label: 'لغات' },
  { icon: '🎬', label: 'فيديو' },
  { icon: '🧠', label: 'ذكاء اصطناعي' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    coursesService.getAll({ page_size: 6 })
      .then((data) => setCourses(data.results || data.slice?.(0, 6) || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses?search=${encodeURIComponent(search)}`);
  };

  return (
    <div style={s.page}>

      {/* ══════════════ HERO ══════════════ */}
      <section style={s.hero}>
        {/* Background blobs */}
        <div style={s.blob1} />
        <div style={s.blob2} />

        <div style={s.heroInner}>
          <div style={s.heroBadge}>🚀 منصة التعلم الأولى عربياً</div>
          <h1 style={s.heroTitle}>
            طوّر مهاراتك
            <span style={s.heroAccent}> وابدأ مستقبلك</span>
          </h1>
          <p style={s.heroSub}>
            آلاف الكورسات في البرمجة والتصميم والتسويق وأكثر —
            تعلّم من أفضل المدرّسين في راحة بيتك
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={s.searchForm}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن أي كورس..."
            />
            <button type="submit" style={s.searchBtn}>ابحث</button>
          </form>

          {/* Quick categories */}
          <div style={s.cats}>
            <span style={s.catsLabel}>ابحث بسرعة:</span>
            {categories.map((c) => (
              <button key={c.label} style={s.catChip}
                onClick={() => navigate(`/courses?search=${c.label}`)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div style={s.heroVisual}>
          <div style={s.visualCard}>
            <div style={s.visualAvatar}>🎓</div>
            <div>
              <p style={s.visualName}>Ahmed Mohamed</p>
              <p style={s.visualRole}>انضم للتو!</p>
            </div>
            <span style={s.visualBadge}>✓</span>
          </div>
          <div style={s.visualStats}>
            {[['12K+','طالب'],['500+','كورس'],['4.9','تقييم']].map(([n,l]) => (
              <div key={l} style={s.visualStat}>
                <span style={s.visualStatNum}>{n}</span>
                <span style={s.visualStatLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section style={s.statsBar}>
        <div style={s.statsInner}>
          <StatItem icon="👥" num="12,000+" label="طالب نشط" />
          <div style={s.statsDivider} />
          <StatItem icon="📚" num="500+" label="كورس متاح" />
          <div style={s.statsDivider} />
          <StatItem icon="🎓" num="100+" label="مدرّس خبير" />
          <div style={s.statsDivider} />
          <StatItem icon="⭐" num="4.9" label="متوسط التقييم" />
        </div>
      </section>

      {/* ══════════════ FEATURED COURSES ══════════════ */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <div>
              <p style={s.sectionEyebrow}>🔥 الأكثر شعبية</p>
              <h2 style={s.sectionTitle}>كورسات مميزة</h2>
            </div>
            <Link to="/courses" style={s.seeAll}>عرض الكل ←</Link>
          </div>

          {loading ? (
            <div style={s.loadingGrid}>
              {[1,2,3].map(i => <div key={i} style={s.skeleton} />)}
            </div>
          ) : courses.length > 0 ? (
            <div style={s.grid}>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div style={s.empty}>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:16 }}>لا توجد كورسات بعد</p>
            </div>
          )}

          <div style={{ textAlign:'center', marginTop:36 }}>
            <Link to="/courses" style={{ ...s.heroAccentBtn }}>
              تصفح جميع الكورسات →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ WHY US ══════════════ */}
      <section style={{ ...s.section, background:'#16213e' }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <p style={s.sectionEyebrow}>💡 لماذا نحن؟</p>
            <h2 style={s.sectionTitle}>تعلّم بطريقة مختلفة</h2>
          </div>
          <div style={s.whyGrid}>
            {[
              { icon:'🎬', title:'فيديوهات عالية الجودة', desc:'محتوى مرئي احترافي يمكنك مشاهدته في أي وقت' },
              { icon:'📱', title:'تعلّم من أي مكان', desc:'متاح على جميع الأجهزة — موبايل، تابلت، لاب توب' },
              { icon:'🏆', title:'شهادات معتمدة', desc:'احصل على شهادة إتمام معتمدة لكل كورس تنهيه' },
              { icon:'💬', title:'دعم مستمر', desc:'تواصل مع المدرّس وزملاءك في أي وقت' },
            ].map((f) => (
              <div key={f.title} style={s.whyCard}>
                <div style={s.whyIcon}>{f.icon}</div>
                <h3 style={s.whyTitle}>{f.title}</h3>
                <p style={s.whyDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section style={s.cta}>
        <div style={s.ctaBlob} />
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>مستعد تبدأ رحلتك؟</h2>
          <p style={s.ctaSub}>انضم لأكثر من 12,000 طالب يتعلمون معنا الآن</p>
          <div style={s.ctaBtns}>
            <Link to="/register" style={s.ctaBtn}>ابدأ مجاناً →</Link>
            <Link to="/courses" style={s.ctaBtnOutline}>تصفح الكورسات</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { background:'#0f0f1a', minHeight:'100vh', overflowX:'hidden' },

  // Hero
  hero: {
    minHeight: '90vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f3460 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '80px 6% 60px', gap: 40, position: 'relative', overflow: 'hidden',
    flexWrap: 'wrap',
  },
  blob1: {
    position:'absolute', width:500, height:500, borderRadius:'50%',
    background:'radial-gradient(circle, rgba(233,69,96,0.12) 0%, transparent 70%)',
    top:-100, right:-100, pointerEvents:'none',
  },
  blob2: {
    position:'absolute', width:400, height:400, borderRadius:'50%',
    background:'radial-gradient(circle, rgba(15,52,96,0.4) 0%, transparent 70%)',
    bottom:-100, left:-50, pointerEvents:'none',
  },
  heroInner:  { flex:1, minWidth:300, maxWidth:600, position:'relative', zIndex:1 },
  heroBadge:  {
    display:'inline-block', background:'rgba(233,69,96,0.12)', color:'#e94560',
    border:'1px solid rgba(233,69,96,0.25)', borderRadius:20, padding:'6px 16px',
    fontSize:13, fontWeight:700, marginBottom:20, letterSpacing:0.5,
  },
  heroTitle:  { color:'#fff', fontSize:'clamp(32px,5vw,56px)', fontWeight:900,
                lineHeight:1.15, margin:'0 0 18px' },
  heroAccent: { color:'#e94560' },
  heroSub:    { color:'rgba(255,255,255,0.55)', fontSize:'clamp(14px,2vw,17px)',
                lineHeight:1.8, margin:'0 0 32px', maxWidth:500 },

  // Search
  searchForm:  { display:'flex', alignItems:'center', background:'rgba(255,255,255,0.08)',
                  borderRadius:50, border:'1px solid rgba(255,255,255,0.12)',
                  padding:'6px 6px 6px 20px', marginBottom:24, maxWidth:520,
                  backdropFilter:'blur(10px)' },
  searchIcon:  { fontSize:18, marginLeft:4, flexShrink:0 },
  searchInput: { flex:1, background:'none', border:'none', color:'#fff', fontSize:15,
                  outline:'none', padding:'6px 12px', fontFamily:'Cairo,sans-serif' },
  searchBtn:   { background:'linear-gradient(135deg,#e94560,#c73652)', color:'#fff',
                  border:'none', borderRadius:40, padding:'10px 22px', cursor:'pointer',
                  fontWeight:700, fontSize:14, fontFamily:'Cairo,sans-serif', flexShrink:0 },

  // Categories
  cats:      { display:'flex', flexWrap:'wrap', alignItems:'center', gap:8 },
  catsLabel: { color:'rgba(255,255,255,0.35)', fontSize:13 },
  catChip:   { background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)',
               border:'1px solid rgba(255,255,255,0.1)', borderRadius:20,
               padding:'6px 14px', cursor:'pointer', fontSize:13, fontFamily:'Cairo,sans-serif',
               transition:'all 0.2s' },

  // Hero visual
  heroVisual: { flex:'0 0 auto', display:'flex', flexDirection:'column', gap:16,
                position:'relative', zIndex:1 },
  visualCard: { background:'rgba(255,255,255,0.08)', backdropFilter:'blur(16px)',
                border:'1px solid rgba(255,255,255,0.12)', borderRadius:16,
                padding:'16px 20px', display:'flex', alignItems:'center', gap:14, minWidth:240 },
  visualAvatar:{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#e94560,#c73652)',
                 display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 },
  visualName:  { color:'#fff', fontWeight:700, fontSize:14, margin:'0 0 3px' },
  visualRole:  { color:'rgba(255,255,255,0.45)', fontSize:12, margin:0 },
  visualBadge: { marginRight:'auto', background:'#00c896', color:'#fff', borderRadius:'50%',
                 width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center',
                 fontSize:12, fontWeight:700, flexShrink:0 },
  visualStats: { background:'rgba(255,255,255,0.06)', borderRadius:14, padding:'16px 20px',
                 display:'flex', justifyContent:'space-between', gap:24,
                 border:'1px solid rgba(255,255,255,0.08)' },
  visualStat:  { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  visualStatNum:  { color:'#fff', fontWeight:800, fontSize:18 },
  visualStatLabel:{ color:'rgba(255,255,255,0.4)', fontSize:11 },

  // Stats bar
  statsBar:   { background:'#16213e', borderTop:'1px solid rgba(255,255,255,0.06)',
                borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'28px 20px' },
  statsInner: { maxWidth:900, margin:'0 auto', display:'flex', justifyContent:'space-around',
                alignItems:'center', flexWrap:'wrap', gap:20 },
  statItem:   { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  statIcon:   { fontSize:22 },
  statNum:    { color:'#fff', fontWeight:800, fontSize:24 },
  statLabel:  { color:'rgba(255,255,255,0.4)', fontSize:12 },
  statsDivider:{ width:1, height:50, background:'rgba(255,255,255,0.08)' },

  // Sections
  section:    { padding:'70px 20px' },
  sectionInner:{ maxWidth:1200, margin:'0 auto' },
  sectionHeader:{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36 },
  sectionEyebrow:{ color:'#e94560', fontSize:13, fontWeight:700, letterSpacing:2,
                   textTransform:'uppercase', margin:'0 0 8px' },
  sectionTitle:{ color:'#fff', fontSize:'clamp(22px,3vw,32px)', fontWeight:800, margin:0 },
  seeAll:     { color:'#e94560', fontSize:14, fontWeight:700, textDecoration:'none' },

  grid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 },
  loadingGrid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 },
  skeleton:   { height:320, borderRadius:16, background:'linear-gradient(90deg,#1a1a2e 25%,#22223a 50%,#1a1a2e 75%)',
                backgroundSize:'200% 100%', animation:'pulse 1.5s infinite' },
  empty:      { textAlign:'center', padding:'60px 0' },

  heroAccentBtn: {
    display:'inline-block', background:'linear-gradient(135deg,#e94560,#c73652)',
    color:'#fff', borderRadius:12, padding:'14px 32px', fontWeight:700,
    fontSize:16, textDecoration:'none', fontFamily:'Cairo,sans-serif',
  },

  // Why us
  whyGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 },
  whyCard: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
             borderRadius:16, padding:'28px 22px', transition:'transform 0.2s, border-color 0.2s' },
  whyIcon:  { fontSize:36, marginBottom:16 },
  whyTitle: { color:'#fff', fontSize:17, fontWeight:700, margin:'0 0 10px' },
  whyDesc:  { color:'rgba(255,255,255,0.45)', fontSize:14, lineHeight:1.7, margin:0 },

  // CTA
  cta:     { background:'linear-gradient(135deg,#1a1a2e,#0f3460)', padding:'80px 20px',
             textAlign:'center', position:'relative', overflow:'hidden' },
  ctaBlob: { position:'absolute', width:600, height:600, borderRadius:'50%',
             background:'radial-gradient(circle, rgba(233,69,96,0.1) 0%, transparent 70%)',
             top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' },
  ctaInner:{ maxWidth:560, margin:'0 auto', position:'relative', zIndex:1 },
  ctaTitle:{ color:'#fff', fontSize:'clamp(26px,4vw,40px)', fontWeight:900, margin:'0 0 16px' },
  ctaSub:  { color:'rgba(255,255,255,0.5)', fontSize:16, margin:'0 0 36px', lineHeight:1.7 },
  ctaBtns: { display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' },
  ctaBtn:  { background:'linear-gradient(135deg,#e94560,#c73652)', color:'#fff',
             borderRadius:12, padding:'14px 32px', fontWeight:700, fontSize:16,
             textDecoration:'none', fontFamily:'Cairo,sans-serif' },
  ctaBtnOutline: { background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.8)',
                   border:'1px solid rgba(255,255,255,0.15)', borderRadius:12,
                   padding:'14px 32px', fontWeight:700, fontSize:16,
                   textDecoration:'none', fontFamily:'Cairo,sans-serif' },
};

export default Home;