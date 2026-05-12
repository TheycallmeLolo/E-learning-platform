import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesService } from '../../services/courses';
import { enrollmentsService } from '../../services/enrollments';
import { authService } from '../../services/auth';
import api from '../../services/api';
import PaymentModal from '../payment/PaymentModal';
import { useFocusTracker } from '../../hooks/useFocusTracker';
import FocusOverlay from '../focus/FocusOverlay';
import FocusFeedback from '../focus/FocusFeedback';
import FocusStatusBar from '../focus/FocusStatusBar';

// ─── Video Player (محدّث — بيرجع isPlaying state) ─────────────────────────
const VideoPlayer = ({ lecture, onPlayStateChange }) => {
  const [streamUrl, setStreamUrl] = useState('');
  const [loading,   setLoading]   = useState(false);
  const videoRef                  = useRef(null);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&enablejsapi=1`;
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
    return null;
  };

  useEffect(() => {
    if (lecture?.video_type === 'upload' && lecture?.s3_key) {
      setLoading(true);
      api.get(`/courses/lectures/${lecture.id}/stream/`)
        .then(r => setStreamUrl(r.data.stream_url))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setStreamUrl('');
    }
  }, [lecture?.id]);

  // Track play/pause on native <video>
  const handlePlay  = useCallback(() => onPlayStateChange?.(true),  [onPlayStateChange]);
  const handlePause = useCallback(() => onPlayStateChange?.(false), [onPlayStateChange]);

  if (!lecture) return null;

  if (lecture.video_type === 'upload') {
    if (loading) return (
      <div style={vp.placeholder}>
        <div style={vp.spinner} />
        <p style={{ color:'rgba(255,255,255,0.5)', marginTop:16 }}>جاري تحميل الفيديو...</p>
      </div>
    );
    if (!streamUrl) return (
      <div style={vp.placeholder}>
        <span style={{ fontSize:40 }}>❌</span>
        <p style={{ color:'rgba(255,255,255,0.4)', marginTop:12 }}>تعذّر تحميل الفيديو</p>
      </div>
    );
    return (
      <video
        ref={videoRef}
        style={vp.video}
        controls
        controlsList="nodownload"
        autoPlay
        key={streamUrl}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handlePause}
      >
        <source src={streamUrl} />
      </video>
    );
  }

  const embedUrl = getEmbedUrl(lecture.video_url);
  useEffect(() => { onPlayStateChange?.(true); return () => onPlayStateChange?.(false); }, []);
  if (!embedUrl) return (
    <div style={vp.placeholder}>
      <span style={{ fontSize:40 }}>⚠️</span>
      <p style={{ color:'rgba(255,255,255,0.4)', marginTop:12 }}>رابط الفيديو غير صالح</p>
    </div>
  );
  // For iframe videos, we assume playing on mount
  return (
    <iframe
      style={vp.iframe}
      src={embedUrl}
      title={lecture.title}
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  );
};

const vp = {
  video      : { width:'100%', display:'block', background:'#000', maxHeight:480,
                 borderRadius:'0 0 12px 12px' },
  iframe     : { width:'100%', height:460, border:'none', borderRadius:'0 0 12px 12px', display:'block' },
  placeholder: { height:360, display:'flex', flexDirection:'column', alignItems:'center',
                 justifyContent:'center', background:'rgba(0,0,0,0.4)', borderRadius:'0 0 12px 12px' },
  spinner    : { width:40, height:40, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)',
                 borderTopColor:'#c8973a', animation:'spin 0.8s linear infinite' },
};


// ─── Main Component ───────────────────────────────────────────────────────────
const CourseDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [course, setCourse]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [isEnrolled, setIsEnrolled]   = useState(false);
  const [enrolling, setEnrolling]     = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [activeLecture, setActiveLecture] = useState(null);
  const [openSections, setOpenSections]   = useState({});

  // ── Focus tracking state ────────────────────────────────────────────────
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showReport,     setShowReport]     = useState(false);
  const [lastReason,     setLastReason]     = useState('idle');
  const [focusEnabled,   setFocusEnabled]   = useState(true); // toggle on/off

  const user         = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin      = user?.is_staff;
  const isInstructor = user?.is_instructor;
  const isOwner      = isInstructor && course?.instructor === user?.id;
  const canWatch     = isEnrolled || isAdmin || isOwner;

  // ── Focus tracker hook ───────────────────────────────────────────────────
  const videoRef   = useRef(null);

  const pauseVideo  = useCallback(() => {
    setIsVideoPlaying(false);
    // لو native video — إيقاف فعلي
    if (videoRef.current) videoRef.current.pause?.();
  }, []);

  const resumeVideo = useCallback(() => {
    setIsVideoPlaying(true);
  }, []);

  const {
    isDistracted,
    distractCount,
    sessionTime,
    warningCountdown,
    feedbackMsg,
    resumeFocus,
    getSessionSummary,
    dismissFeedback,
  } = useFocusTracker({
    isPlaying : focusEnabled && isVideoPlaying && canWatch,
    onPause   : pauseVideo,
    onResume  : resumeVideo,
    lectureId : activeLecture?.id,
  });

  // ── Save focus session to backend ────────────────────────────────────────
  const saveFocusSession = useCallback(async (summary) => {
    try {
      await api.post('/focus/sessions/', {
        lecture_id        : summary.lectureId,
        total_watch_seconds: summary.totalWatchSeconds,
        distracted_count  : summary.distractedCount,
        distracted_times  : summary.distractedTimes,
        focus_score       : summary.focusScore,
      });
      alert('✅ تم حفظ تقرير التركيز');
    } catch {
      // silent fail — backend optional
    }
    setShowReport(false);
  }, []);

  useEffect(() => { loadCourse(); checkEnrollment(); }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await coursesService.getById(id);
      setCourse(data);
      if (data.sections?.length) setOpenSections({ [data.sections[0].id]: true });
    } catch { setError('تعذّر تحميل الكورس'); }
    finally  { setLoading(false); }
  };

  const checkEnrollment = async () => {
    if (!authService.isAuthenticated()) return;
    try { setIsEnrolled(await enrollmentsService.checkEnrollment(id)); } catch {}
  };

  const handleEnrollFree = async () => {
    if (!authService.isAuthenticated()) { navigate('/login'); return; }
    try {
      setEnrolling(true);
      await enrollmentsService.enroll(id);
      setIsEnrolled(true);
      await loadCourse();
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.[0] || 'فشل التسجيل');
    } finally { setEnrolling(false); }
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false); setIsEnrolled(true); await loadCourse();
  };

  const toggleSection = (sId) =>
    setOpenSections(p => ({ ...p, [sId]: !p[sId] }));

  const selectLecture = (lec, locked) => {
    if (locked) return;
    setActiveLecture(lec);
    setIsVideoPlaying(false); // reset
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div style={s.center}><div style={s.spinner} /></div>;
  if (error || !course) return (
    <div style={s.center}>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:18 }}>{error || 'الكورس غير موجود'}</p>
    </div>
  );

  const isPaid    = parseFloat(course.price) > 0;
  const price     = parseFloat(course.price).toFixed(0);
  const totalLecs = course.sections?.reduce((a, sec) => a + (sec.lectures?.length || 0), 0) || 0;
  const totalMins = course.sections?.reduce((a, sec) =>
    a + sec.lectures?.reduce((b, l) => b + (l.duration_minutes || 0), 0), 0) || 0;

  return (
    <div style={s.page}>

      {/* ══ FOCUS OVERLAY ══ */}
      <FocusOverlay
        isDistracted={isDistracted}
        distractCount={distractCount}
        warningCountdown={warningCountdown}
        reason={lastReason}
        onResume={resumeFocus}
      />

      {/* ══ FOCUS FEEDBACK (end of session / when dismissed) ══ */}
      {showReport && (
        <FocusFeedback
          summary={getSessionSummary()}
          onDismiss={() => setShowReport(false)}
          onSave={saveFocusSession}
        />
      )}

      {/* ══ VIDEO PLAYER ══ */}
      {activeLecture && canWatch && (
        <div style={s.playerSection}>
          <div style={s.playerWrap}>
            <div style={s.playerHeader}>
              <button style={s.backLecBtn} onClick={() => {
                setShowReport(true);
                setActiveLecture(null);
                setIsVideoPlaying(false);
              }}>✕ إغلاق</button>
              <span style={s.playerTitle}>▶ {activeLecture.title}</span>
              {activeLecture.is_free_preview && (
                <span style={s.freeBadge}>معاينة مجانية</span>
              )}
              {/* Focus toggle */}
              <button
                style={{ ...s.focusToggle, opacity: focusEnabled ? 1 : 0.4 }}
                onClick={() => setFocusEnabled(f => !f)}
                title="تشغيل/إيقاف تتبع التركيز"
              >
                {focusEnabled ? '🎯 التركيز مفعّل' : '😴 التركيز متوقف'}
              </button>
            </div>

            {/* Status bar */}
            <FocusStatusBar
              isTracking={focusEnabled && isVideoPlaying}
              distractCount={distractCount}
              sessionTime={sessionTime}
              onShowReport={() => setShowReport(true)}
            />

            <VideoPlayer
              lecture={activeLecture}
              onPlayStateChange={setIsVideoPlaying}
            />
          </div>
        </div>
      )}

      {/* ══ HERO ══ */}
      <div style={s.hero}>
        <div style={s.heroBlob} />
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <div style={s.breadcrumb}>
              <span style={s.breadLink} onClick={() => navigate('/courses')}>الكورسات</span>
              <span style={s.breadSep}>›</span>
              <span style={s.breadCurrent}>{course.title}</span>
            </div>
            <h1 style={s.courseTitle}>{course.title}</h1>
            <p style={s.courseDesc}>{course.description}</p>
            <div style={s.metaRow}>
              <span style={s.metaItem}>👤 {course.instructor_name || course.instructor_email}</span>
              <span style={s.metaDot}>·</span>
              <span style={s.metaItem}>📂 {course.total_sections || 0} قسم</span>
              <span style={s.metaDot}>·</span>
              <span style={s.metaItem}>🎬 {totalLecs} ليكتشر</span>
              {totalMins > 0 && <>
                <span style={s.metaDot}>·</span>
                <span style={s.metaItem}>⏱ {Math.round(totalMins / 60)} ساعة</span>
              </>}
            </div>
            <div style={s.badgeRow}>
              {isEnrolled && <span style={s.badgeEnrolled}>✓ مسجّل</span>}
              {isOwner    && <span style={s.badgeOwner}>✏ كورسك</span>}
              {isAdmin    && <span style={s.badgeAdmin}>🛡 أدمن</span>}
              {!isPaid    && <span style={s.badgeFree}>مجاني</span>}
            </div>
          </div>

          {/* Hero card */}
          <div style={s.heroCard}>
            <div style={s.cardImgWrap}>
              {course.image_url
                ? <img src={course.image_url} alt={course.title} style={s.cardImg} />
                : <div style={s.cardImgPlaceholder}>
                    <span style={{ fontSize:48, opacity:0.3 }}>🎓</span>
                  </div>}
            </div>
            <div style={s.cardBody}>
              <div style={s.priceRow}>
                <span style={s.priceTag}>{isPaid ? `${price} EGP` : '🎁 مجاني'}</span>
              </div>
              {canWatch ? (
                <button style={s.ctaBtnGreen} onClick={() => {
                  const first = course.sections?.[0]?.lectures?.[0];
                  if (first) selectLecture(first, false);
                  else document.getElementById('content-sec')?.scrollIntoView({ behavior:'smooth' });
                }}>
                  ▶ ابدأ التعلم الآن
                </button>
              ) : isPaid ? (
                <button style={s.ctaBtn} onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  setShowPayment(true);
                }}>
                  💳 اشتري مقابل {price} EGP
                </button>
              ) : (
                <button style={s.ctaBtn} disabled={enrolling} onClick={handleEnrollFree}>
                  {enrolling ? '⏳ جاري التسجيل...' : '🎓 سجّل مجاناً الآن'}
                </button>
              )}
              {isOwner && (
                <button style={s.manageBtn} onClick={() => navigate(`/courses/${id}/manage`)}>
                  ⚙ إدارة محتوى الكورس
                </button>
              )}
              <div style={s.cardFeatures}>
                {[
                  ['🎯','تتبع التركيز الذكي'],
                  ['📱','وصول من أي جهاز'],
                  ['🏆','شهادة إتمام'],
                ].map(([ico, txt]) => (
                  <div key={txt} style={s.feature}>
                    <span>{ico}</span><span>{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div id="content-sec" style={s.contentSection}>
        <div style={s.contentInner}>
          {!canWatch && (
            <div style={s.lockNotice}>
              <span style={{ fontSize:24 }}>🔒</span>
              <div>
                <p style={s.lockTitle}>
                  {isPaid ? `اشتري الكورس مقابل ${price} EGP للوصول الكامل` : 'سجّل مجاناً للوصول للمحتوى'}
                </p>
                <p style={s.lockSub}>يمكنك مشاهدة الليكتشرات المجانية بدون تسجيل</p>
              </div>
            </div>
          )}

          <h2 style={s.contentTitle}>
            محتوى الكورس
            <span style={s.contentMeta}>
              {course.sections?.length || 0} أقسام · {totalLecs} ليكتشر
            </span>
          </h2>

          {course.sections?.map((sec, si) => (
            <div key={sec.id} style={s.secCard}>
              <div style={s.secHeader} onClick={() => toggleSection(sec.id)}>
                <div style={s.secLeft}>
                  <span style={s.secToggle}>{openSections[sec.id] ? '▾' : '▸'}</span>
                  <span style={s.secNum}>القسم {si + 1}</span>
                  <span style={s.secTitle}>{sec.title}</span>
                </div>
                <span style={s.secCount}>{sec.lectures?.length || 0} ليكتشر</span>
              </div>
              {openSections[sec.id] && (
                <div style={s.lecList}>
                  {sec.lectures?.map((lec) => {
                    const isFree  = lec.is_free_preview;
                    const locked  = !canWatch && !isFree;
                    const isActive = activeLecture?.id === lec.id;
                    return (
                      <div key={lec.id} style={s.lecRow(isActive, locked)}
                        onClick={() => selectLecture(lec, locked)}>
                        <div style={s.lecLeft}>
                          <span style={s.lecIcon}>
                            {locked ? '🔒' : isActive ? '▶' : '🎬'}
                          </span>
                          <div>
                            <p style={s.lecTitle(isActive)}>{lec.title}</p>
                            {lec.description && (
                              <p style={s.lecDesc}>{lec.description}</p>
                            )}
                          </div>
                        </div>
                        <div style={s.lecRight}>
                          {isFree && !canWatch && <span style={s.lecFree}>مجاني</span>}
                          {lec.duration_minutes > 0 && (
                            <span style={s.lecDur}>{lec.duration_minutes} د</span>
                          )}
                          {isActive && <span style={s.lecPlaying}>يشتغل الآن</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {(!course.sections || course.sections.length === 0) && (
            <div style={s.noContent}>
              <span style={{ fontSize:40 }}>📭</span>
              <p style={{ color:'rgba(255,255,255,0.3)', marginTop:12 }}>لا يوجد محتوى بعد</p>
            </div>
          )}
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          course={course}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page   : { background:'#0f0f1a', minHeight:'100vh' },
  center : { display:'flex', justifyContent:'center', alignItems:'center',
             minHeight:'60vh', background:'#0f0f1a' },
  spinner: { width:44, height:44, borderRadius:'50%',
             border:'3px solid rgba(255,255,255,0.1)',
             borderTopColor:'#c8973a', animation:'spin 0.8s linear infinite' },

  // Player
  playerSection: { background:'#000', borderBottom:'1px solid rgba(255,255,255,0.08)' },
  playerWrap   : { maxWidth:900, margin:'0 auto' },
  playerHeader : { display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                   background:'rgba(255,255,255,0.04)', flexWrap:'wrap' },
  backLecBtn   : { background:'rgba(255,255,255,0.08)', border:'none',
                   color:'rgba(255,255,255,0.6)', borderRadius:6, padding:'5px 12px',
                   cursor:'pointer', fontSize:13, fontFamily:'Cairo,sans-serif' },
  playerTitle  : { color:'#fff', fontWeight:700, fontSize:14, flex:1 },
  freeBadge    : { background:'rgba(0,200,150,0.15)', color:'#00c896',
                   border:'1px solid rgba(0,200,150,0.3)', borderRadius:20,
                   padding:'3px 10px', fontSize:12, fontWeight:600 },
  focusToggle  : { background:'rgba(200,151,58,0.12)', color:'#c8973a',
                   border:'1px solid rgba(200,151,58,0.25)', borderRadius:6,
                   padding:'4px 10px', cursor:'pointer', fontSize:11,
                   fontWeight:700, fontFamily:'Cairo,sans-serif', whiteSpace:'nowrap' },

  // Hero
  hero     : { background:'linear-gradient(160deg, #0f0f1a 0%, #1a1a2e 50%, #0f3460 100%)',
               padding:'60px 20px 70px', position:'relative', overflow:'hidden' },
  heroBlob : { position:'absolute', width:600, height:600, borderRadius:'50%',
               background:'radial-gradient(circle, rgba(200,151,58,0.07) 0%, transparent 70%)',
               top:-100, right:-100, pointerEvents:'none' },
  heroInner: { maxWidth:1100, margin:'0 auto', display:'flex', gap:48,
               alignItems:'flex-start', flexWrap:'wrap', position:'relative', zIndex:1 },
  heroLeft : { flex:1, minWidth:300 },

  breadcrumb  : { display:'flex', alignItems:'center', gap:8, marginBottom:20 },
  breadLink   : { color:'rgba(255,255,255,0.4)', fontSize:13, cursor:'pointer' },
  breadSep    : { color:'rgba(255,255,255,0.2)', fontSize:13 },
  breadCurrent: { color:'rgba(255,255,255,0.7)', fontSize:13 },
  courseTitle : { color:'#fff', fontSize:'clamp(22px,3.5vw,38px)', fontWeight:900,
                  lineHeight:1.2, margin:'0 0 16px' },
  courseDesc  : { color:'rgba(255,255,255,0.55)', fontSize:15, lineHeight:1.8,
                  margin:'0 0 24px', maxWidth:620 },
  metaRow     : { display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, marginBottom:20 },
  metaItem    : { color:'rgba(255,255,255,0.55)', fontSize:14 },
  metaDot     : { color:'rgba(255,255,255,0.2)' },
  badgeRow    : { display:'flex', gap:8, flexWrap:'wrap' },
  badgeEnrolled:{ background:'rgba(0,200,150,0.15)', color:'#00c896',
                  border:'1px solid rgba(0,200,150,0.25)', borderRadius:20,
                  padding:'4px 12px', fontSize:12, fontWeight:700 },
  badgeOwner  : { background:'rgba(100,100,255,0.12)', color:'#8888ff',
                  border:'1px solid rgba(100,100,255,0.25)', borderRadius:20,
                  padding:'4px 12px', fontSize:12, fontWeight:700 },
  badgeAdmin  : { background:'rgba(255,200,0,0.1)', color:'#f5c542',
                  border:'1px solid rgba(245,197,66,0.25)', borderRadius:20,
                  padding:'4px 12px', fontSize:12, fontWeight:700 },
  badgeFree   : { background:'rgba(0,200,150,0.12)', color:'#00c896',
                  border:'1px solid rgba(0,200,150,0.25)', borderRadius:20,
                  padding:'4px 12px', fontSize:12, fontWeight:700 },

  heroCard : { width:340, flexShrink:0, background:'#1a1a2e', borderRadius:16,
               border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden',
               boxShadow:'0 24px 60px rgba(0,0,0,0.5)' },
  cardImgWrap: { height:200, overflow:'hidden' },
  cardImg    : { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  cardImgPlaceholder: { width:'100%', height:'100%',
                        background:'linear-gradient(135deg,#0f3460,#16213e)',
                        display:'flex', alignItems:'center', justifyContent:'center' },
  cardBody   : { padding:20 },
  priceRow   : { marginBottom:16 },
  priceTag   : { color:'#fff', fontSize:28, fontWeight:900 },
  ctaBtn     : { width:'100%', padding:'13px',
                 background:'linear-gradient(135deg,#c8973a,#a07020)',
                 color:'#000', border:'none', borderRadius:10, fontSize:16,
                 fontWeight:700, cursor:'pointer', marginBottom:10,
                 fontFamily:'Cairo,sans-serif' },
  ctaBtnGreen: { width:'100%', padding:'13px',
                 background:'linear-gradient(135deg,#00c896,#009e76)',
                 color:'#fff', border:'none', borderRadius:10, fontSize:16,
                 fontWeight:700, cursor:'pointer', marginBottom:10,
                 fontFamily:'Cairo,sans-serif' },
  manageBtn  : { width:'100%', padding:'10px', background:'rgba(255,255,255,0.06)',
                 color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)',
                 borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer',
                 marginBottom:14, fontFamily:'Cairo,sans-serif' },
  cardFeatures:{ display:'flex', flexDirection:'column', gap:8,
                 borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:14 },
  feature    : { display:'flex', alignItems:'center', gap:10,
                 color:'rgba(255,255,255,0.5)', fontSize:13 },

  // Content
  contentSection: { maxWidth:900, margin:'0 auto', padding:'48px 20px' },
  contentInner  : {},
  lockNotice    : { display:'flex', alignItems:'center', gap:16,
                    background:'rgba(200,151,58,0.07)', border:'1px solid rgba(200,151,58,0.2)',
                    borderRadius:14, padding:'16px 20px', marginBottom:28 },
  lockTitle     : { color:'#fff', fontWeight:700, fontSize:15, margin:'0 0 4px' },
  lockSub       : { color:'rgba(255,255,255,0.4)', fontSize:13, margin:0 },
  contentTitle  : { color:'#fff', fontSize:22, fontWeight:800, marginBottom:20,
                    display:'flex', alignItems:'center', gap:12 },
  contentMeta   : { color:'rgba(255,255,255,0.35)', fontSize:14, fontWeight:400 },
  noContent     : { textAlign:'center', padding:'60px 0' },

  secCard  : { background:'#1a1a2e', borderRadius:12, marginBottom:10,
               border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' },
  secHeader: { display:'flex', justifyContent:'space-between', alignItems:'center',
               padding:'14px 18px', cursor:'pointer', userSelect:'none' },
  secLeft  : { display:'flex', alignItems:'center', gap:10 },
  secToggle: { color:'#c8973a', fontWeight:700, fontSize:16, width:20 },
  secNum   : { color:'rgba(255,255,255,0.3)', fontSize:12, fontWeight:600 },
  secTitle : { color:'#fff', fontWeight:700, fontSize:15 },
  secCount : { color:'rgba(255,255,255,0.35)', fontSize:13 },

  lecList  : { borderTop:'1px solid rgba(255,255,255,0.06)' },
  lecRow   : (active, locked) => ({
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'12px 18px', cursor: locked ? 'not-allowed' : 'pointer',
    background: active ? 'rgba(200,151,58,0.08)' : 'transparent',
    opacity: locked ? 0.5 : 1,
    borderBottom:'1px solid rgba(255,255,255,0.04)',
    transition:'background 0.15s',
  }),
  lecLeft  : { display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 },
  lecIcon  : { fontSize:16, flexShrink:0 },
  lecTitle : (active) => ({
    color: active ? '#c8973a' : '#fff',
    fontSize:14, fontWeight: active ? 700 : 500, margin:0,
  }),
  lecDesc  : { color:'rgba(255,255,255,0.35)', fontSize:12, margin:'3px 0 0',
               whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:400 },
  lecRight : { display:'flex', alignItems:'center', gap:8, flexShrink:0 },
  lecFree  : { background:'rgba(0,200,150,0.12)', color:'#00c896',
               border:'1px solid rgba(0,200,150,0.2)', borderRadius:20,
               padding:'2px 8px', fontSize:11, fontWeight:600 },
  lecDur   : { color:'rgba(255,255,255,0.3)', fontSize:12 },
  lecPlaying:{ background:'rgba(200,151,58,0.15)', color:'#c8973a',
               borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 },
};

if (typeof document !== 'undefined' && !document.getElementById('cd-spin')) {
  const st = document.createElement('style');
  st.id = 'cd-spin';
  st.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}

export default CourseDetail;