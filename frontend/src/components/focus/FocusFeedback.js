// src/components/focus/FocusFeedback.js
// ═══════════════════════════════════════════════════════════════════════════
//  بيظهر في آخر الجلسة أو لما يشرد كتير
//  بيعرض: نسبة التركيز + النصائح الشخصية
// ═══════════════════════════════════════════════════════════════════════════
import React from 'react';

const FOCUS_LEVELS = [
  { min: 90, label: 'ممتاز! 🏆',   color: '#00c896', bg: 'rgba(0,200,150,0.1)'  },
  { min: 70, label: 'كويس 👍',      color: '#c8973a', bg: 'rgba(200,151,58,0.1)' },
  { min: 50, label: 'مقبول 😐',     color: '#f5c542', bg: 'rgba(245,197,66,0.1)' },
  { min: 0,  label: 'محتاج تحسين 😕', color: '#e94560', bg: 'rgba(233,69,96,0.1)' },
];

const TIPS_BY_LEVEL = {
  low: [
    { icon:'📵', tip:'حط الموبايل في أوضة تانية أثناء الدراسة' },
    { icon:'🎯', tip:'حدد هدف محدد قبل ما تبدأ المحاضرة' },
    { icon:'⏱', tip:'جرب تقنية Pomodoro: 25 دقيقة دراسة + 5 راحة' },
    { icon:'🎧', tip:'استخدم سماعات وافصل الإنترنت لو مش محتاجه' },
    { icon:'✍',  tip:'خد نوتس أثناء المحاضرة عشان تفضل منتبه' },
  ],
  mid: [
    { icon:'💧', tip:'اشرب مية كفاية — الجفاف بيأثر على التركيز' },
    { icon:'🌙', tip:'تأكد إنك نمت كافي' },
    { icon:'🪑', tip:'اجلس في مكان مريح وهادي' },
  ],
  high: [
    { icon:'🔥', tip:'استمر كده! تركيزك ممتاز' },
    { icon:'📚', tip:'حاول تراجع المحتوى بعد 24 ساعة لتثبيت المعلومات' },
  ],
};

export default function FocusFeedback({ summary, onDismiss, onSave }) {
  if (!summary) return null;

  const { focusScore, totalWatchSeconds, distractedCount, distractedTimes } = summary;
  const level   = FOCUS_LEVELS.find(l => focusScore >= l.min) || FOCUS_LEVELS[3];
  const tipKey  = focusScore >= 80 ? 'high' : focusScore >= 50 ? 'mid' : 'low';
  const tips    = TIPS_BY_LEVEL[tipKey];
  const minutes = Math.floor(totalWatchSeconds / 60);
  const seconds = totalWatchSeconds % 60;

  return (
    <div style={s.backdrop}>
      <div style={s.card}>

        {/* Header */}
        <div style={{ ...s.header, background: level.bg, borderColor: level.color + '44' }}>
          <h2 style={s.headerTitle}>تقرير جلسة التعلم 📊</h2>
          <p style={{ ...s.levelLabel, color: level.color }}>{level.label}</p>
        </div>

        {/* Score ring */}
        <div style={s.scoreWrap}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2a38" strokeWidth="10"/>
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke={level.color} strokeWidth="10"
              strokeDasharray={`${(focusScore / 100) * 314} 314`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div style={s.scoreInner}>
            <span style={{ ...s.scoreNum, color: level.color }}>{focusScore}</span>
            <span style={s.scorePct}>%</span>
            <span style={s.scoreLabel}>تركيز</span>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.stat}>
            <span style={s.statNum}>{minutes}:{String(seconds).padStart(2,'0')}</span>
            <span style={s.statLabel}>وقت المشاهدة</span>
          </div>
          <div style={s.statDivider}/>
          <div style={s.stat}>
            <span style={{ ...s.statNum, color: distractedCount > 3 ? '#e94560' : '#c8973a' }}>
              {distractedCount}
            </span>
            <span style={s.statLabel}>مرة شردت</span>
          </div>
          {distractedTimes?.length > 0 && (
            <>
              <div style={s.statDivider}/>
              <div style={s.stat}>
                <span style={s.statNum}>
                  {Math.round(distractedTimes.reduce((a, d) =>
                    a + (d.sessionSecond || 0), 0) / distractedTimes.length / 60)}د
                </span>
                <span style={s.statLabel}>متوسط وقت الشرود</span>
              </div>
            </>
          )}
        </div>

        {/* Distract timeline */}
        {distractedTimes?.length > 0 && (
          <div style={s.timeline}>
            <p style={s.timelineTitle}>أوقات الشرود خلال الجلسة:</p>
            <div style={s.timelineBars}>
              {distractedTimes.map((d, i) => (
                <div key={i} style={s.timelineItem}>
                  <span style={s.timelineDot} />
                  <span style={s.timelineTime}>
                    {Math.floor((d.sessionSecond || 0) / 60)}د {(d.sessionSecond || 0) % 60}ث
                  </span>
                  <span style={s.timelineReason}>
                    { d.reason === 'tab_switch'   ? '📱 غير التاب'
                    : d.reason === 'window_blur'  ? '🪟 طلع من النافذة'
                    : '⏳ بطّل يتفاعل' }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div style={s.tipsSection}>
          <p style={s.tipsTitle}>💡 نصائح لك:</p>
          {tips.map((t, i) => (
            <div key={i} style={s.tipRow}>
              <span style={s.tipIcon}>{t.icon}</span>
              <span style={s.tipText}>{t.tip}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={s.btnRow}>
          {onSave && (
            <button style={s.btnSave} onClick={() => onSave(summary)}>
              💾 حفظ التقرير
            </button>
          )}
          <button style={s.btnClose} onClick={onDismiss}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop : { position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
               display:'flex', alignItems:'center', justifyContent:'center', zIndex:9998,
               padding:16 },
  card     : { background:'#16161f', borderRadius:14, width:'100%', maxWidth:440,
               border:'1px solid #2a2a38', overflow:'hidden', fontFamily:'Cairo, sans-serif',
               direction:'rtl', maxHeight:'90vh', overflowY:'auto' },
  header   : { padding:'20px 24px', borderBottom:'1px solid' },
  headerTitle: { color:'#fff', fontSize:17, fontWeight:800, margin:'0 0 4px' },
  levelLabel:  { fontSize:18, fontWeight:900, margin:0 },

  // Score
  scoreWrap  : { display:'flex', justifyContent:'center', padding:'24px 0 16px', position:'relative' },
  scoreInner : { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                 display:'flex', flexDirection:'column', alignItems:'center' },
  scoreNum   : { fontSize:28, fontWeight:900, lineHeight:1 },
  scorePct   : { color:'rgba(255,255,255,0.4)', fontSize:12 },
  scoreLabel : { color:'rgba(255,255,255,0.4)', fontSize:11, marginTop:2 },

  // Stats
  statsRow   : { display:'flex', justifyContent:'space-around', padding:'0 24px 20px',
                 borderBottom:'1px solid rgba(255,255,255,0.07)' },
  stat       : { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  statNum    : { color:'#c8973a', fontSize:20, fontWeight:800 },
  statLabel  : { color:'rgba(255,255,255,0.35)', fontSize:11 },
  statDivider: { width:1, background:'rgba(255,255,255,0.07)', alignSelf:'stretch' },

  // Timeline
  timeline      : { padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  timelineTitle : { color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:700,
                    margin:'0 0 10px', letterSpacing:1 },
  timelineBars  : { display:'flex', flexDirection:'column', gap:6 },
  timelineItem  : { display:'flex', alignItems:'center', gap:10 },
  timelineDot   : { width:7, height:7, borderRadius:'50%', background:'#e94560', flexShrink:0 },
  timelineTime  : { color:'rgba(255,255,255,0.5)', fontSize:12, width:60 },
  timelineReason: { color:'rgba(255,255,255,0.4)', fontSize:12 },

  // Tips
  tipsSection: { padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  tipsTitle  : { color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:700,
                 margin:'0 0 10px', letterSpacing:1 },
  tipRow     : { display:'flex', alignItems:'center', gap:10, padding:'5px 0' },
  tipIcon    : { fontSize:16, flexShrink:0 },
  tipText    : { color:'rgba(255,255,255,0.55)', fontSize:13, lineHeight:1.6 },

  // Buttons
  btnRow  : { display:'flex', gap:10, padding:'16px 24px' },
  btnSave : { flex:1, padding:'11px', background:'#c8973a', color:'#000', border:'none',
              borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer',
              fontFamily:'Cairo, sans-serif' },
  btnClose: { flex:1, padding:'11px', background:'rgba(255,255,255,0.07)',
              color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer',
              fontFamily:'Cairo, sans-serif' },
};
