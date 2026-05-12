import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { experiencesService } from '../../services/experiences';
import { authService } from '../../services/auth';
import { useFocusTracker } from '../../hooks/useFocusTracker';
import FocusOverlay from '../focus/FocusOverlay';
import FocusFeedback from '../focus/FocusFeedback';
import FocusStatusBar from '../focus/FocusStatusBar';
import ExperiencePaymentModal from './ExperiencePaymentModal';

// ─── Video Player ─────────────────────────────────────────────────────────────
const VideoPlayer = ({ url, onPlayStateChange }) => {
  useEffect(() => {
    onPlayStateChange?.(true);
    return () => onPlayStateChange?.(false);
  }, [url]);

  if (!url) return (
    <div style={vp.placeholder}>
      <span style={{ fontSize: 40 }}>⚠️</span>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>لا يوجد فيديو</p>
    </div>
  );

  const getEmbed = (u) => {
    const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
    const vm = u.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
    return null;
  };

  const embed = getEmbed(url);

  if (!embed) return (
    <video style={vp.video} controls autoPlay key={url}
      onPlay={() => onPlayStateChange?.(true)}
      onPause={() => onPlayStateChange?.(false)}
      onEnded={() => onPlayStateChange?.(false)}>
      <source src={url} />
    </video>
  );

  return (
    <iframe style={vp.iframe} src={embed} title="video"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media" />
  );
};

const vp = {
  video      : { width: '100%', display: 'block', background: '#000', maxHeight: 480, borderRadius: '0 0 12px 12px' },
  iframe     : { width: '100%', height: 460, border: 'none', borderRadius: '0 0 12px 12px', display: 'block' },
  placeholder: { height: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '0 0 12px 12px' },
};


// ─── Main ─────────────────────────────────────────────────────────────────────
const ExperienceDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [exp, setExp]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [isPurchased, setIsPurchased] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showVideo, setShowVideo]   = useState(false);

  // focus
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showReport, setShowReport]         = useState(false);
  const [focusEnabled, setFocusEnabled]     = useState(true);

  const user    = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.is_staff;
  const isOwner = user?.is_instructor && String(exp?.instructor) === String(user?.id);
  const canWatch = isPurchased || isAdmin || isOwner;

  const pauseVideo  = useCallback(() => setIsVideoPlaying(false), []);
  const resumeVideo = useCallback(() => setIsVideoPlaying(true),  []);

  const { isDistracted, distractCount, sessionTime, warningCountdown,
          resumeFocus, getSessionSummary } = useFocusTracker({
    isPlaying : focusEnabled && isVideoPlaying && canWatch,
    onPause   : pauseVideo,
    onResume  : resumeVideo,
    lectureId : exp?.id,
  });

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res  = await experiencesService.getById(id);
      const data = res.data;
      setExp(data);
      setIsPurchased(data.is_purchased || false);
    } catch {
      setError('تعذّر تحميل التجربة');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setIsPurchased(true);
    await load();
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
    setIsVideoPlaying(false);
    setShowReport(true);
  };

  if (loading) return <div style={s.center}><div style={s.spinner} /></div>;
  if (error || !exp) return (
    <div style={s.center}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>{error || 'التجربة غير موجودة'}</p>
    </div>
  );

  const isFree      = parseFloat(exp.effective_price) === 0;
  const price       = parseFloat(exp.effective_price).toFixed(0);
  const imgSrc      = exp.image_url || null;
  const isAvailable = exp.status === 'published' && exp.is_approved;
  // الفيديو الصح — content_video_url للمشترين، preview للكل
  const watchUrl    = canWatch ? (exp.content_video_url || exp.preview_video_url) : exp.preview_video_url;

  return (
    <div style={s.page}>

      {/* Payment Modal */}
      {showPayment && (
        <ExperiencePaymentModal
          experience={exp}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* Focus */}
      <FocusOverlay isDistracted={isDistracted} distractCount={distractCount}
        warningCountdown={warningCountdown} reason="idle" onResume={resumeFocus} />
      {showReport && (
        <FocusFeedback summary={getSessionSummary()}
          onDismiss={() => setShowReport(false)} />
      )}

      {/* ══ VIDEO PLAYER ══ */}
      {showVideo && (
        <div style={s.playerSection}>
          <div style={s.playerWrap}>
            <div style={s.playerHeader}>
              <button style={s.backBtn} onClick={handleCloseVideo}>✕ إغلاق</button>
              <span style={s.playerTitle}>▶ {exp.title}</span>
              {!canWatch && <span style={s.previewBadge}>معاينة مجانية</span>}
              <button style={{ ...s.focusToggle, opacity: focusEnabled ? 1 : 0.4 }}
                onClick={() => setFocusEnabled(f => !f)}>
                {focusEnabled ? '🎯 التركيز مفعّل' : '😴 التركيز متوقف'}
              </button>
            </div>
            {canWatch && (
              <FocusStatusBar isTracking={focusEnabled && isVideoPlaying}
                distractCount={distractCount} sessionTime={sessionTime}
                onShowReport={() => setShowReport(true)} />
            )}
            <VideoPlayer url={watchUrl} onPlayStateChange={setIsVideoPlaying} />
          </div>
        </div>
      )}

      {/* ══ HERO ══ */}
      <div style={s.hero}>
        <div style={s.heroBlob} />
        <div style={s.heroInner}>

          {/* Left */}
          <div style={s.heroLeft}>
            <div style={s.breadcrumb}>
              <span style={s.breadLink} onClick={() => navigate('/experiences')}>التجارب</span>
              <span style={s.breadSep}>›</span>
              <span style={s.breadCurrent}>{exp.title}</span>
            </div>

            {/* Approval notice */}
            {!isAvailable && (
              <div style={s.pendingNotice}>
                {isOwner
                  ? '⏳ التجربة في انتظار موافقة الأدمن'
                  : isAdmin
                  ? '🔍 هذه التجربة تحتاج موافقتك'
                  : '⏳ هذه التجربة غير متاحة حالياً'}
              </div>
            )}

            <h1 style={s.expTitle}>{exp.title}</h1>
            <p style={s.expDesc}>{exp.description}</p>

            <div style={s.metaRow}>
              {exp.instructor_name && <span style={s.metaItem}>👤 {exp.instructor_name}</span>}
              {exp.course_title    && <><span style={s.metaDot}>·</span><span style={s.metaItem}>📚 {exp.course_title}</span></>}
              {exp.section_title   && <><span style={s.metaDot}>·</span><span style={s.metaItem}>📂 {exp.section_title}</span></>}
              {exp.total_buyers > 0 && <><span style={s.metaDot}>·</span><span style={s.metaItem}>👥 {exp.total_buyers} مشترٍ</span></>}
            </div>

            <div style={s.badgeRow}>
              {isPurchased  && <span style={s.badgePurchased}>✓ مشترك</span>}
              {isOwner      && <span style={s.badgeOwner}>✏ تجربتك</span>}
              {isAdmin      && <span style={s.badgeAdmin}>🛡 أدمن</span>}
              {isFree       && <span style={s.badgeFree}>مجاني</span>}
              {!isAvailable && <span style={s.badgePending}>⏳ قيد المراجعة</span>}
            </div>
          </div>

          {/* Card */}
          <div style={s.heroCard}>
            <div style={s.cardImgWrap}>
              {imgSrc
                ? <img src={imgSrc} alt={exp.title} style={s.cardImg} />
                : <div style={s.cardImgPlaceholder}><span style={{ fontSize: 48, opacity: 0.3 }}>🧪</span></div>
              }
              {exp.discount_percent > 0 && (
                <div style={s.discountBadge}>-{exp.discount_percent}%</div>
              )}
            </div>

            <div style={s.cardBody}>
              <div style={s.priceRow}>
                {isFree
                  ? <span style={s.priceFree}>🎁 مجاني</span>
                  : <>
                      <span style={s.priceTag}>{price} EGP</span>
                      {exp.discount_price && (
                        <span style={s.priceOld}>{parseFloat(exp.price).toFixed(0)} EGP</span>
                      )}
                    </>
                }
              </div>

              {/* ── CTA buttons ── */}
              {canWatch ? (
                // مشترك أو أدمن أو صاحب التجربة
                <button style={s.ctaBtnGreen} onClick={() => setShowVideo(true)}>
                  ▶ شاهد التجربة الآن
                </button>
              ) : !isAvailable ? (
                // مش معتمدة بعد
                <button style={{ ...s.ctaBtn, opacity: 0.5, cursor: 'not-allowed' }} disabled>
                  ⏳ غير متاحة حالياً
                </button>
              ) : isFree ? (
                // مجانية ومعتمدة
                <button style={s.ctaBtnGreen} onClick={() => {
                  if (!authService.isAuthenticated()) { navigate('/login'); return; }
                  experiencesService.buy(id)
                    .then(() => { setIsPurchased(true); load(); })
                    .catch(err => alert(err.response?.data?.detail || 'حدث خطأ'));
                }}>
                  🎁 احصل عليها مجاناً
                </button>
              ) : (
                // مدفوعة ومعتمدة
                <button style={s.ctaBtn} onClick={() => {
                  if (!authService.isAuthenticated()) { navigate('/login'); return; }
                  setShowPayment(true);
                }}>
                  💳 اشتري مقابل {price} EGP
                </button>
              )}

              {/* Preview button — لو مش مشترك وفيه preview */}
              {!canWatch && exp.preview_video_url && (
                <button style={s.previewBtn} onClick={() => setShowVideo(true)}>
                  ▶ شاهد معاينة مجانية
                </button>
              )}

              {/* Admin approve */}
              {isAdmin && !exp.is_approved && (
                <button style={s.approveBtn} onClick={async () => {
                  try {
                    await experiencesService.approve(id);
                    await load();
                    alert('✅ تم الاعتماد والنشر');
                  } catch { alert('حدث خطأ'); }
                }}>
                  ✅ اعتماد ونشر التجربة
                </button>
              )}

              {/* Revenue split */}
              {(isOwner || isAdmin) && (
                <div style={s.splitInfo}>
                  <p style={s.splitTitle}>توزيع الأرباح</p>
                  <div style={s.splitRow}>
                    <span>المدرس</span>
                    <span style={{ color: '#c8973a' }}>{exp.instructor_cut}%</span>
                  </div>
                  <div style={s.splitRow}>
                    <span>الكلية</span>
                    <span style={{ color: '#4a7fa5' }}>{exp.college_cut}%</span>
                  </div>
                </div>
              )}

              <div style={s.cardFeatures}>
                {[['🎯','تتبع التركيز'], ['🔒','محتوى حصري'], ['📱','من أي جهاز']].map(([i,t]) => (
                  <div key={t} style={s.feature}><span>{i}</span><span>{t}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page   : { background: '#0f0f1a', minHeight: '100vh' },
  center : { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', background: '#0f0f1a' },
  spinner: { width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c8973a', animation: 'spin 0.8s linear infinite' },

  playerSection: { background: '#000', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  playerWrap   : { maxWidth: 900, margin: '0 auto' },
  playerHeader : { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', flexWrap: 'wrap' },
  backBtn      : { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
  playerTitle  : { color: '#fff', fontWeight: 700, fontSize: 14, flex: 1 },
  previewBadge : { background: 'rgba(0,200,150,0.15)', color: '#00c896', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 },
  focusToggle  : { background: 'rgba(200,151,58,0.12)', color: '#c8973a', border: '1px solid rgba(200,151,58,0.25)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' },

  hero     : { background: 'linear-gradient(160deg, #0f0f1a 0%, #1a1a2e 50%, #0f3460 100%)', padding: '60px 20px 70px', position: 'relative', overflow: 'hidden' },
  heroBlob : { position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,151,58,0.07) 0%, transparent 70%)', top: -100, right: -100, pointerEvents: 'none' },
  heroInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  heroLeft : { flex: 1, minWidth: 300 },

  pendingNotice: { background: 'rgba(245,197,66,0.1)', border: '1px solid rgba(245,197,66,0.25)', borderRadius: 8, padding: '10px 14px', color: '#f5c542', fontSize: 13, fontWeight: 600, marginBottom: 16 },

  breadcrumb  : { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 },
  breadLink   : { color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' },
  breadSep    : { color: 'rgba(255,255,255,0.2)', fontSize: 13 },
  breadCurrent: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  expTitle    : { color: '#fff', fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 16px', fontFamily: 'Georgia, serif' },
  expDesc     : { color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.8, margin: '0 0 24px', maxWidth: 620 },
  metaRow     : { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 20 },
  metaItem    : { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  metaDot     : { color: 'rgba(255,255,255,0.2)' },
  badgeRow    : { display: 'flex', gap: 8, flexWrap: 'wrap' },
  badgePurchased: { background: 'rgba(0,200,150,0.15)', color: '#00c896', border: '1px solid rgba(0,200,150,0.25)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 },
  badgeOwner  : { background: 'rgba(100,100,255,0.12)', color: '#8888ff', border: '1px solid rgba(100,100,255,0.25)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 },
  badgeAdmin  : { background: 'rgba(255,200,0,0.1)', color: '#f5c542', border: '1px solid rgba(245,197,66,0.25)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 },
  badgeFree   : { background: 'rgba(0,200,150,0.12)', color: '#00c896', border: '1px solid rgba(0,200,150,0.25)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 },
  badgePending: { background: 'rgba(245,197,66,0.1)', color: '#f5c542', border: '1px solid rgba(245,197,66,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 },

  heroCard          : { width: 340, flexShrink: 0, background: '#1a1a2e', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' },
  cardImgWrap       : { height: 200, overflow: 'hidden', position: 'relative' },
  cardImg           : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  cardImgPlaceholder: { width: '100%', height: '100%', background: 'linear-gradient(135deg,#0f3460,#16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  discountBadge     : { position: 'absolute', top: 12, left: 12, background: '#e94560', color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 4 },
  cardBody          : { padding: 20 },
  priceRow          : { marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 },
  priceTag          : { color: '#fff', fontSize: 28, fontWeight: 900 },
  priceFree         : { color: '#00c896', fontSize: 22, fontWeight: 900 },
  priceOld          : { color: 'rgba(255,255,255,0.3)', fontSize: 14, textDecoration: 'line-through' },

  ctaBtn     : { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#c8973a,#a07020)', color: '#000', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10, fontFamily: 'Cairo,sans-serif' },
  ctaBtnGreen: { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#00c896,#009e76)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 10, fontFamily: 'Cairo,sans-serif' },
  previewBtn : { width: '100%', padding: '10px', background: 'rgba(74,127,165,0.12)', color: '#4a7fa5', border: '1px solid rgba(74,127,165,0.3)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10, fontFamily: 'Cairo,sans-serif' },
  approveBtn : { width: '100%', padding: '10px', background: 'rgba(0,200,150,0.12)', color: '#00c896', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10, fontFamily: 'Cairo,sans-serif' },

  splitInfo : { background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 14px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.07)' },
  splitTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: 1, margin: '0 0 8px' },
  splitRow  : { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  cardFeatures: { display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14 },
  feature     : { display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.5)', fontSize: 13 },
};

if (typeof document !== 'undefined' && !document.getElementById('exp-spin')) {
  const st = document.createElement('style');
  st.id = 'exp-spin';
  st.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}

export default ExperienceDetail;