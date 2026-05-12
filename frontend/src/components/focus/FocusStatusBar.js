// src/components/focus/FocusStatusBar.js
// شريط صغير بيظهر فوق الفيديو يوضح حالة التركيز
import React from 'react';

export default function FocusStatusBar({
  isTracking,
  distractCount,
  sessionTime,
  onShowReport,
}) {
  if (!isTracking) return null;

  const minutes = Math.floor(sessionTime / 60);
  const secs    = String(sessionTime % 60).padStart(2, '0');
  const color   = distractCount === 0 ? '#00c896'
                : distractCount < 3   ? '#c8973a'
                :                       '#e94560';

  return (
    <div style={s.bar}>
      <div style={s.left}>
        <span style={{ ...s.dot, background: color }} />
        <span style={s.label}>تتبع التركيز</span>
      </div>
      <div style={s.center}>
        <span style={s.time}>⏱ {minutes}:{secs}</span>
      </div>
      <div style={s.right}>
        {distractCount > 0 && (
          <span style={{ ...s.badge, color }}>
            ⚠ {distractCount} شرود
          </span>
        )}
        <button style={s.reportBtn} onClick={onShowReport}>
          تقرير
        </button>
      </div>
    </div>
  );
}

const s = {
  bar: {
    display        : 'flex',
    justifyContent : 'space-between',
    alignItems     : 'center',
    background     : 'rgba(0,0,0,0.7)',
    backdropFilter : 'blur(4px)',
    padding        : '6px 14px',
    fontFamily     : 'Cairo, sans-serif',
    direction      : 'rtl',
    fontSize       : 12,
    gap            : 12,
  },
  left  : { display:'flex', alignItems:'center', gap:6 },
  center: { flex:1, textAlign:'center' },
  right : { display:'flex', alignItems:'center', gap:8 },
  dot   : { width:7, height:7, borderRadius:'50%', display:'inline-block',
            flexShrink:0, boxShadow:'0 0 6px currentColor' },
  label : { color:'rgba(255,255,255,0.5)', letterSpacing:.5 },
  time  : { color:'rgba(255,255,255,0.6)' },
  badge : { fontWeight:700, fontSize:11 },
  reportBtn: {
    background   : 'rgba(200,151,58,0.15)',
    color        : '#c8973a',
    border       : '1px solid rgba(200,151,58,0.3)',
    borderRadius : 4,
    padding      : '3px 9px',
    cursor       : 'pointer',
    fontSize     : 11,
    fontWeight   : 700,
    fontFamily   : 'Cairo, sans-serif',
  },
};
