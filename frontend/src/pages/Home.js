import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { coursesService } from '../services/courses';
import { getInstructors } from '../services/instructors';
import CourseCard from '../components/courses/CourseCard';

// ─── Stats counter ─────────────────────────────────────────────────────────────
const StatItem = ({ num, label, icon }) => (
  <div style={s.statItem}>
    <span style={s.statIcon}>{icon}</span>
    <span style={s.statNum}>{num}</span>
    <span style={s.statLabel}>{label}</span>
  </div>
);

// ─── Instructor mini card ──────────────────────────────────────────────────────
const InstructorMini = ({ inst }) => {
  const initials = (inst.display_name || '')
    .split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <Link to={`/instructors/${inst.id}`} style={s.instCard}>
      <div style={s.instAvatar}>
        {inst.avatar_url
          ? <img src={inst.avatar_url} alt={inst.display_name} style={s.instAvatarImg} />
          : <span style={s.instInitials}>{initials}</span>
        }
        {inst.is_featured && <div style={s.instStar}>★</div>}
      </div>
      <div style={s.instBody}>
        <span style={s.instTitleLabel}>{inst.title_label}</span>
        <p style={s.instName}>{inst.display_name}</p>
        {inst.department && <p style={s.instDept}>{inst.department}</p>}
        <div style={s.instMeta}>
          <span>{inst.course_count} كورس</span>
          {inst.years_experience > 0 && <span>{inst.years_experience} سنة خبرة</span>}
        </div>
        <div style={s.instTags}>
          {inst.expertise?.split(',').slice(0, 2).map(e => (
            <span key={e} style={s.instTag}>{e.trim()}</span>
          ))}
        </div>
      </div>
    </Link>
  );
};

// ─── Categories ───────────────────────────────────────────────────────────────
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
  const [courses, setCourses]         = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [instLoading, setInstLoading] = useState(true);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    coursesService.getAll({ page_size: 6 })
      .then((data) => setCourses(data.results || data.slice?.(0, 6) || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    getInstructors()
      .then(res => {
        const data = res.data.results ?? res.data;
        setInstructors(data.filter(i => i.is_featured).slice(0, 4));
      })
      .catch(() => {
        // mock fallback
        setInstructors([
          {
            id: '1', display_name: 'دكتور أحمد محمد', title_label: 'دكتور',
            avatar_url: null, expertise: 'Machine Learning, Python',
            department: 'Computer Science', years_experience: 12,
            course_count: 4, is_featured: true,
          },
          {
            id: '2', display_name: 'أ.د. سارة علي', title_label: 'أستاذ دكتور',
            avatar_url: null, expertise: 'Data Science, Statistics',
            department: 'Mathematics', years_experience: 18,
            course_count: 6, is_featured: true,
          },
          {
            id: '3', display_name: 'دكتور خالد إبراهيم', title_label: 'دكتور',
            avatar_url: null, expertise: 'Web Development, React',
            department: 'Software Engineering', years_experience: 8,
            course_count: 3, is_featured: true,
          },
          {
            id: '4', display_name: 'دكتور منى حسن', title_label: 'دكتور',
            avatar_url: null, expertise: 'AI, Neural Networks',
            department: 'Electrical Engineering', years_experience: 10,
            course_count: 5, is_featured: true,
          },
        ]);
      })
      .finally(() => setInstLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses?search=${encodeURIComponent(search)}`);
  };

  return (
    <div style={s.page}>

      {/* ══════════════ HERO ══════════════ */}
      <section style={s.hero}>
        <div style={s.blob1} />
        <div style={s.blob2} />
        <div style={s.heroGrid} />

        <div style={s.heroInner}>
          <div style={s.heroBadge}>
            <span style={s.heroBadgeDot} />
            منصة تعليمية أكاديمية
          </div>
          <h1 style={s.heroTitle}>
            طوّر مهاراتك
            <br />
            <span style={s.heroAccent}>تعلّم من نخبة الأكاديميين</span>
          </h1>
          <p style={s.heroSub}>
            كورسات أكاديمية احترافية يقدّمها دكاتره ومتخصصون معتمدون —
            تعلّم، احصل على شهادة، وابدأ مستقبلك
          </p>

          <form onSubmit={handleSearch} style={s.searchForm}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن كورس أو دكتور..."
            />
            <button type="submit" style={s.searchBtn}>ابحث</button>
          </form>

          <div style={s.cats}>
            <span style={s.catsLabel}>تصفح:</span>
            {categories.map((c) => (
              <button key={c.label} style={s.catChip}
                onClick={() => navigate(`/courses?search=${c.label}`)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Quick links */}
          <div style={s.heroQuickLinks}>
            <Link to="/instructors" style={s.quickLink}>
              👨‍🏫 تعرف على الدكاتره
            </Link>
            <Link to="/courses" style={s.quickLink}>
              📚 كل الكورسات
            </Link>
          </div>
        </div>

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
          <StatItem icon="🎓" num="100+" label="عضو هيئة تدريس" />
          <div style={s.statsDivider} />
          <StatItem icon="⭐" num="4.9" label="متوسط التقييم" />
        </div>
      </section>

      {/* ══════════════ FEATURED INSTRUCTORS ══════════════ */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <div>
              <p style={s.sectionEyebrow}>Faculty</p>
              <h2 style={s.sectionTitle}>أعضاء هيئة التدريس المتميزون</h2>
            </div>
            <Link to="/instructors" style={s.seeAll}>عرض الكل ←</Link>
          </div>

          {instLoading ? (
            <div style={s.instGrid}>
              {[1,2,3,4].map(i => <div key={i} style={s.skeleton} />)}
            </div>
          ) : (
            <div style={s.instGrid}>
              {instructors.map(inst => (
                <InstructorMini key={inst.id} inst={inst} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link to="/instructors" style={s.outlineBtn}>
              تعرف على جميع أعضاء هيئة التدريس →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ DIVIDER ══════════════ */}
      <div style={s.dividerLine} />

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
            <div style={s.grid}>
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
            <Link to="/courses" style={s.heroAccentBtn}>
              تصفح جميع الكورسات →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ WHY US ══════════════ */}
      <section style={{ ...s.section, background:'#16213e' }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <p style={s.sectionEyebrow}>لماذا نحن؟</p>
            <h2 style={s.sectionTitle}>تعلّم بطريقة أكاديمية مختلفة</h2>
          </div>
          <div style={s.whyGrid}>
            {[
              { icon:'🎬', title:'فيديوهات أكاديمية', desc:'محتوى مرئي احترافي يقدمه متخصصون معتمدون' },
              { icon:'📜', title:'شهادات معتمدة', desc:'احصل على شهادة إتمام معتمدة لكل كورس' },
              { icon:'👨‍🏫', title:'دكاتره متخصصون', desc:'تعلّم من نخبة الأكاديميين وأعضاء هيئة التدريس' },
              { icon:'🗺️', title:'مسار تعليمي واضح', desc:'Roadmap مخصص يرشدك خطوة بخطوة' },
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
          <h2 style={s.ctaTitle}>مستعد تبدأ رحلتك الأكاديمية؟</h2>
          <p style={s.ctaSub}>انضم لأكثر من 12,000 طالب يتعلمون من نخبة الأكاديميين</p>
          <div style={s.ctaBtns}>
            <Link to="/register" style={s.ctaBtn}>ابدأ مجاناً →</Link>
            <Link to="/instructors" style={s.ctaBtnOutline}>تعرف على الدكاتره</Link>
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
    background: 'linear-gradient(160deg, #0a0a0f 0%, #0f0f1a 40%, #0d1829 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '80px 6% 60px', gap: 40, position: 'relative', overflow: 'hidden',
    flexWrap: 'wrap',
  },
  heroGrid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: 'linear-gradient(rgba(200,151,58,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,151,58,0.04) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
  },
  blob1: {
    position:'absolute', width:500, height:500, borderRadius:'50%',
    background:'radial-gradient(circle, rgba(200,151,58,0.07) 0%, transparent 70%)',
    top:-100, right:-100, pointerEvents:'none',
  },
  blob2: {
    position:'absolute', width:400, height:400, borderRadius:'50%',
    background:'radial-gradient(circle, rgba(74,127,165,0.1) 0%, transparent 70%)',
    bottom:-100, left:-50, pointerEvents:'none',
  },
  heroInner:  { flex:1, minWidth:300, maxWidth:620, position:'relative', zIndex:1 },
  heroBadge:  {
    display:'inline-flex', alignItems:'center', gap:8,
    background:'rgba(200,151,58,0.1)', color:'#c8973a',
    border:'1px solid rgba(200,151,58,0.25)', borderRadius:4,
    padding:'6px 16px', fontSize:12, fontWeight:700,
    marginBottom:20, letterSpacing:2, textTransform:'uppercase',
  },
  heroBadgeDot: {
    width:6, height:6, borderRadius:'50%',
    background:'#c8973a', flexShrink:0,
    boxShadow:'0 0 6px #c8973a',
  },
  heroTitle:  {
    color:'#fff', fontSize:'clamp(30px,5vw,52px)', fontWeight:900,
    lineHeight:1.2, margin:'0 0 18px',
    fontFamily:'Georgia, serif',
  },
  heroAccent: { color:'#c8973a' },
  heroSub:    {
    color:'rgba(255,255,255,0.5)', fontSize:'clamp(14px,2vw,16px)',
    lineHeight:1.85, margin:'0 0 32px', maxWidth:500,
  },

  // Search
  searchForm: {
    display:'flex', alignItems:'center',
    background:'rgba(255,255,255,0.05)',
    borderRadius:4, border:'1px solid rgba(255,255,255,0.1)',
    padding:'6px 6px 6px 16px', marginBottom:20, maxWidth:500,
  },
  searchIcon:  { fontSize:16, marginLeft:4, flexShrink:0, opacity:0.5 },
  searchInput: {
    flex:1, background:'none', border:'none', color:'#fff', fontSize:14,
    outline:'none', padding:'6px 10px', fontFamily:'inherit',
  },
  searchBtn: {
    background:'#c8973a', color:'#000',
    border:'none', borderRadius:3, padding:'9px 20px', cursor:'pointer',
    fontWeight:700, fontSize:13, fontFamily:'inherit', flexShrink:0,
  },

  // Categories
  cats:      { display:'flex', flexWrap:'wrap', alignItems:'center', gap:8 },
  catsLabel: { color:'rgba(255,255,255,0.3)', fontSize:12, letterSpacing:1 },
  catChip:   {
    background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.6)',
    border:'1px solid rgba(255,255,255,0.08)', borderRadius:3,
    padding:'5px 12px', cursor:'pointer', fontSize:12, fontFamily:'inherit',
  },

  heroQuickLinks: { display:'flex', gap:12, marginTop:20, flexWrap:'wrap' },
  quickLink: {
    display:'inline-flex', alignItems:'center', gap:6,
    color:'rgba(255,255,255,0.5)', fontSize:13, textDecoration:'none',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:3,
    padding:'7px 14px', transition:'all 0.2s',
  },

  // Hero visual
  heroVisual: { flex:'0 0 auto', display:'flex', flexDirection:'column', gap:16, position:'relative', zIndex:1 },
  visualCard: {
    background:'rgba(255,255,255,0.06)', backdropFilter:'blur(16px)',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
    padding:'16px 20px', display:'flex', alignItems:'center', gap:14, minWidth:240,
  },
  visualAvatar:{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#c8973a,#8a6320)',
                 display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 },
  visualName:  { color:'#fff', fontWeight:700, fontSize:14, margin:'0 0 3px' },
  visualRole:  { color:'rgba(255,255,255,0.4)', fontSize:12, margin:0 },
  visualBadge: { marginRight:'auto', background:'#00c896', color:'#fff', borderRadius:'50%',
                 width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center',
                 fontSize:12, fontWeight:700, flexShrink:0 },
  visualStats: {
    background:'rgba(255,255,255,0.04)', borderRadius:6, padding:'14px 18px',
    display:'flex', justifyContent:'space-between', gap:20,
    border:'1px solid rgba(255,255,255,0.07)',
  },
  visualStat:      { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  visualStatNum:   { color:'#fff', fontWeight:800, fontSize:17 },
  visualStatLabel: { color:'rgba(255,255,255,0.35)', fontSize:11 },

  // Stats bar
  statsBar:    { background:'#111118', borderTop:'1px solid #1e1e2e', borderBottom:'1px solid #1e1e2e', padding:'28px 20px' },
  statsInner:  { maxWidth:900, margin:'0 auto', display:'flex', justifyContent:'space-around', alignItems:'center', flexWrap:'wrap', gap:20 },
  statItem:    { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  statIcon:    { fontSize:20 },
  statNum:     { color:'#c8973a', fontWeight:800, fontSize:22, fontFamily:'Georgia, serif' },
  statLabel:   { color:'rgba(255,255,255,0.35)', fontSize:11, letterSpacing:1 },
  statsDivider:{ width:1, height:40, background:'rgba(255,255,255,0.07)' },

  // Sections
  section:      { padding:'70px 20px' },
  sectionInner: { maxWidth:1200, margin:'0 auto' },
  sectionHeader:{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36 },
  sectionEyebrow:{
    color:'#c8973a', fontSize:11, fontWeight:700, letterSpacing:3,
    textTransform:'uppercase', margin:'0 0 8px',
  },
  sectionTitle: { color:'#fff', fontSize:'clamp(20px,3vw,28px)', fontWeight:800, margin:0, fontFamily:'Georgia, serif' },
  seeAll:       { color:'#c8973a', fontSize:13, fontWeight:700, textDecoration:'none' },
  dividerLine:  { height:1, background:'rgba(255,255,255,0.05)', margin:'0 5%' },

  // Instructors grid
  instGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 },
  instCard: {
    background:'#16161f', border:'1px solid #2a2a38',
    borderRadius:4, display:'flex', gap:14, padding:'18px',
    textDecoration:'none', color:'inherit',
    transition:'border-color 0.2s, transform 0.2s',
    position:'relative', overflow:'hidden',
  },
  instAvatar: {
    flexShrink:0, width:58, height:58, borderRadius:'50%',
    background:'linear-gradient(135deg, #c8973a, #4a7fa5)',
    display:'flex', alignItems:'center', justifyContent:'center',
    position:'relative', overflow:'hidden',
  },
  instAvatarImg: { width:'100%', height:'100%', objectFit:'cover' },
  instInitials:  { color:'#000', fontWeight:700, fontSize:'1.1rem', fontFamily:'Georgia, serif' },
  instStar: {
    position:'absolute', bottom:0, right:0,
    background:'#c8973a', color:'#000',
    fontSize:'0.55rem', fontWeight:700,
    width:16, height:16,
    display:'flex', alignItems:'center', justifyContent:'center',
    borderRadius:'50%',
  },
  instBody:       { flex:1, minWidth:0 },
  instTitleLabel: { fontSize:'0.65rem', color:'#c8973a', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:2 },
  instName:       { color:'#fff', fontWeight:700, fontSize:'0.92rem', margin:'0 0 3px', fontFamily:'Georgia, serif' },
  instDept:       { color:'rgba(255,255,255,0.4)', fontSize:'0.75rem', margin:'0 0 6px' },
  instMeta:       { display:'flex', gap:10, fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', marginBottom:6 },
  instTags:       { display:'flex', flexWrap:'wrap', gap:4 },
  instTag:        {
    background:'rgba(74,127,165,0.15)', border:'1px solid rgba(74,127,165,0.25)',
    color:'#4a7fa5', fontSize:'0.65rem', padding:'2px 7px', borderRadius:2,
  },

  // Course grid
  grid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:24 },
  skeleton:   {
    height:280, borderRadius:4,
    background:'linear-gradient(90deg,#16161f 25%,#1e1e2a 50%,#16161f 75%)',
    backgroundSize:'200% 100%',
  },
  empty:      { textAlign:'center', padding:'60px 0' },

  // Buttons
  heroAccentBtn: {
    display:'inline-block', background:'#c8973a', color:'#000',
    borderRadius:3, padding:'13px 28px', fontWeight:700,
    fontSize:15, textDecoration:'none', fontFamily:'inherit',
  },
  outlineBtn: {
    display:'inline-block',
    background:'transparent', color:'#c8973a',
    border:'1px solid #c8973a', borderRadius:3,
    padding:'11px 26px', fontWeight:700, fontSize:14,
    textDecoration:'none', fontFamily:'inherit',
  },

  // Why us
  whyGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:18 },
  whyCard: {
    background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
    borderRadius:4, padding:'26px 20px',
  },
  whyIcon:  { fontSize:32, marginBottom:14 },
  whyTitle: { color:'#fff', fontSize:16, fontWeight:700, margin:'0 0 9px', fontFamily:'Georgia, serif' },
  whyDesc:  { color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:1.75, margin:0 },

  // CTA
  cta:     { background:'linear-gradient(160deg,#0d0d18,#111118)', padding:'80px 20px', textAlign:'center', position:'relative', overflow:'hidden', borderTop:'1px solid #1e1e2e' },
  ctaBlob: { position:'absolute', width:600, height:600, borderRadius:'50%',
             background:'radial-gradient(circle, rgba(200,151,58,0.06) 0%, transparent 70%)',
             top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' },
  ctaInner:{ maxWidth:540, margin:'0 auto', position:'relative', zIndex:1 },
  ctaTitle:{ color:'#fff', fontSize:'clamp(24px,4vw,36px)', fontWeight:900, margin:'0 0 16px', fontFamily:'Georgia, serif' },
  ctaSub:  { color:'rgba(255,255,255,0.4)', fontSize:15, margin:'0 0 36px', lineHeight:1.8 },
  ctaBtns: { display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' },
  ctaBtn:  { background:'#c8973a', color:'#000', borderRadius:3, padding:'13px 28px', fontWeight:700, fontSize:15, textDecoration:'none', fontFamily:'inherit' },
  ctaBtnOutline: {
    background:'transparent', color:'rgba(255,255,255,0.7)',
    border:'1px solid rgba(255,255,255,0.15)', borderRadius:3,
    padding:'13px 28px', fontWeight:700, fontSize:15,
    textDecoration:'none', fontFamily:'inherit',
  },
};

export default Home;