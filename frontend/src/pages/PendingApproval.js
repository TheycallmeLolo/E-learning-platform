// src/pages/PendingApproval.js
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const PendingApproval = () => {
  const navigate = useNavigate();

  // ✅ تأكد إن مفيش access_token — لو موجود يبقى دخل بطريقة غلط
  useEffect(() => {
    const hasToken = !!localStorage.getItem('access_token');
    if (hasToken) {
      // مدرس معنده token فعلي — روّحه للـ dashboard
      navigate('/dashboard/instructor');
    }
  }, [navigate]);

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Icon */}
        <div style={s.iconWrap}>
          <div style={s.iconCircle}>⏳</div>
          <div style={s.iconPulse} />
        </div>

        <h1 style={s.title}>طلبك قيد المراجعة</h1>
        <p style={s.sub}>
          تم استلام طلب تسجيلك كمدرّس بنجاح.<br />
          سيقوم الأدمن بمراجعة بياناتك والموافقة عليها في أقرب وقت.
        </p>

        {/* Steps */}
        <div style={s.steps}>
          <Step done  icon="✅" label="تم التسجيل" />
          <div style={s.stepLine} />
          <Step active icon="⏳" label="مراجعة الأدمن" />
          <div style={s.stepLine} />
          <Step icon="🎓" label="بدء التدريس" />
        </div>

        {/* Info */}
        <div style={s.infoBox}>
          <p style={s.infoTitle}>📋 ماذا يحدث الآن؟</p>
          <ul style={s.infoList}>
            <li>سيتلقى الأدمن إشعاراً بطلبك</li>
            <li>ستصلك رسالة بريد إلكتروني تحتوي على رابط الدخول عند الموافقة</li>
            <li>اضغط الرابط في الإيميل وستدخل مباشرةً بدون كلمة مرور</li>
            <li>بعد الدخول ستتمكن من نشر الكورسات والتجارب</li>
          </ul>
        </div>

        <div style={s.btnRow}>
          <button style={s.homeBtn} onClick={() => navigate('/')}>
            🏠 الصفحة الرئيسية
          </button>
        </div>

        <p style={s.note}>
          يمكنك تصفح الكورسات والمحتوى في هذه الأثناء
        </p>
      </div>
    </div>
  );
};

const Step = ({ done, active, icon, label }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
    <div style={{
      width:40, height:40, borderRadius:'50%',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:18,
      background: done   ? 'rgba(0,200,150,0.15)'
                : active ? 'rgba(200,151,58,0.15)'
                :          'rgba(255,255,255,0.05)',
      border: `2px solid ${done ? '#00c896' : active ? '#c8973a' : 'rgba(255,255,255,0.1)'}`,
    }}>
      {icon}
    </div>
    <span style={{
      fontSize:11, fontWeight:600,
      color: done ? '#00c896' : active ? '#c8973a' : 'rgba(255,255,255,0.3)',
    }}>
      {label}
    </span>
  </div>
);

const s = {
  page     : { background:'#0f0f1a', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card     : { background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'40px 32px', maxWidth:480, width:'100%', textAlign:'center', direction:'rtl' },
  iconWrap : { position:'relative', display:'inline-block', marginBottom:24 },
  iconCircle:{ width:80, height:80, borderRadius:'50%', background:'rgba(200,151,58,0.12)', border:'2px solid rgba(200,151,58,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto' },
  iconPulse : { position:'absolute', inset:-8, borderRadius:'50%', border:'2px solid rgba(200,151,58,0.2)', animation:'pulse 2s ease-in-out infinite' },
  title    : { color:'#fff', fontSize:24, fontWeight:800, margin:'0 0 12px', fontFamily:'Georgia,serif' },
  sub      : { color:'rgba(255,255,255,0.5)', fontSize:14, lineHeight:1.9, margin:'0 0 28px' },
  steps    : { display:'flex', alignItems:'flex-start', justifyContent:'center', gap:0, marginBottom:28 },
  stepLine : { width:40, height:2, background:'rgba(255,255,255,0.1)', marginTop:20, flexShrink:0 },
  infoBox  : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'16px 20px', marginBottom:24, textAlign:'right' },
  infoTitle: { color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:700, margin:'0 0 10px' },
  infoList : { color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:2, margin:0, paddingRight:16 },
  btnRow   : { display:'flex', gap:10, marginBottom:16 },
  homeBtn  : { flex:1, padding:'12px', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:14, cursor:'pointer', fontFamily:'inherit' },
  note     : { color:'rgba(255,255,255,0.25)', fontSize:12, margin:0 },
};

if (typeof document !== 'undefined' && !document.getElementById('pa-kf')) {
  const st = document.createElement('style');
  st.id = 'pa-kf';
  st.innerHTML = '@keyframes pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.1);opacity:.3}}';
  document.head.appendChild(st);
}

export default PendingApproval;