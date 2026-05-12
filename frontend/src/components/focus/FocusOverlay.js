// src/components/focus/FocusOverlay.js
// ═══════════════════════════════════════════════════════════════════════════
//  الـ Overlay اللي بيظهر لما الطالب يشرد
// ═══════════════════════════════════════════════════════════════════════════
import React from 'react';

const REASON_LABELS = {
  idle         : 'لاحظنا إنك مش بتتفاعل',
  tab_switch   : 'غيّرت التاب!',
  window_blur  : 'طلعت من النافذة!',
};

export default function FocusOverlay({
  isDistracted,
  distractCount,
  warningCountdown,
  reason,
  onResume,
}) {
  if (!isDistracted) return null;

  return (
    <div style={s.overlay}>
      <div style={s.modal}>

        {/* Icon */}
        <div style={s.iconWrap}>
          <span style={s.icon}>⚠️</span>
          <div style={s.pulse} />
        </div>

        {/* Title */}
        <h2 style={s.title}>انتبه! 🔔</h2>
        <p style={s.reason}>
          {REASON_LABELS[reason] || 'لاحظنا إنك شاردت'}
        </p>

        {/* Counter */}
        <div style={s.statRow}>
          <div style={s.stat}>
            <span style={s.statNum}>{distractCount}</span>
            <span style={s.statLabel}>مرة شردت</span>
          </div>
          {warningCountdown !== null && (
            <div style={s.stat}>
              <span style={{ ...s.statNum, color: '#e94560' }}>
                {warningCountdown}
              </span>
              <span style={s.statLabel}>ثانية</span>
            </div>
          )}
        </div>

        {/* Tips */}
        <div style={s.tips}>
          <p style={s.tipsTitle}>نصائح للتركيز:</p>
          <ul style={s.tipsList}>
            <li style={s.tip}>📵 حط الموبايل بعيد عنك</li>
            <li style={s.tip}>🎧 استخدم سماعات عشان تتركز</li>
            <li style={s.tip}>⏱ خد استراحة كل 25 دقيقة</li>
          </ul>
        </div>

        {/* Resume button */}
        <button style={s.resumeBtn} onClick={onResume}>
          ▶ أنا جاهز، كمّل الفيديو
        </button>

        {/* Progress bar (countdown visual) */}
        {warningCountdown !== null && (
          <div style={s.progressTrack}>
            <div style={{
              ...s.progressBar,
              width: `${(warningCountdown / 5) * 100}%`,
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position        : 'fixed',
    inset           : 0,
    background      : 'rgba(0,0,0,0.92)',
    backdropFilter  : 'blur(8px)',
    display         : 'flex',
    alignItems      : 'center',
    justifyContent  : 'center',
    zIndex          : 9999,
    animation       : 'fadeIn 0.25s ease',
  },
  modal: {
    background      : '#16161f',
    border          : '1px solid rgba(233,69,96,0.4)',
    borderRadius    : 12,
    padding         : '36px 32px',
    maxWidth        : 400,
    width           : '90%',
    textAlign       : 'center',
    boxShadow       : '0 0 60px rgba(233,69,96,0.15)',
    fontFamily      : 'Cairo, sans-serif',
    direction       : 'rtl',
    position        : 'relative',
    overflow        : 'hidden',
  },

  // Icon
  iconWrap: { position:'relative', display:'inline-block', marginBottom:16 },
  icon    : { fontSize: 52, display:'block' },
  pulse   : {
    position        : 'absolute',
    inset           : -8,
    borderRadius    : '50%',
    border          : '2px solid rgba(233,69,96,0.4)',
    animation       : 'pulse 1.5s ease-in-out infinite',
  },

  // Text
  title : { color:'#fff', fontSize:22, fontWeight:900, margin:'0 0 8px' },
  reason: { color:'rgba(255,255,255,0.5)', fontSize:14, margin:'0 0 20px' },

  // Stats
  statRow  : { display:'flex', justifyContent:'center', gap:32, marginBottom:20 },
  stat     : { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  statNum  : { color:'#c8973a', fontSize:28, fontWeight:900 },
  statLabel: { color:'rgba(255,255,255,0.4)', fontSize:11, letterSpacing:1 },

  // Tips
  tips     : { background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'14px 16px',
               marginBottom:22, textAlign:'right' },
  tipsTitle: { color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:700,
               margin:'0 0 8px', letterSpacing:1 },
  tipsList : { margin:0, padding:0, listStyle:'none' },
  tip      : { color:'rgba(255,255,255,0.5)', fontSize:13, padding:'3px 0' },

  // Button
  resumeBtn: {
    width           : '100%',
    padding         : '13px',
    background      : 'linear-gradient(135deg, #c8973a, #a07020)',
    color           : '#000',
    border          : 'none',
    borderRadius    : 8,
    fontSize        : 15,
    fontWeight      : 700,
    cursor          : 'pointer',
    fontFamily      : 'Cairo, sans-serif',
    marginBottom    : 12,
  },

  // Progress
  progressTrack: {
    height         : 3,
    background     : 'rgba(255,255,255,0.1)',
    borderRadius   : 2,
    overflow       : 'hidden',
  },
  progressBar: {
    height         : '100%',
    background     : '#e94560',
    borderRadius   : 2,
    transition     : 'width 1s linear',
  },
};

// Inject keyframes
if (typeof document !== 'undefined' && !document.getElementById('focus-kf')) {
  const st = document.createElement('style');
  st.id = 'focus-kf';
  st.innerHTML = `
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes pulse  {
      0%,100% { transform:scale(1);   opacity:0.6; }
      50%     { transform:scale(1.15); opacity:0.3; }
    }
  `;
  document.head.appendChild(st);
}
