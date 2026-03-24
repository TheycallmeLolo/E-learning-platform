import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const Profile = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
    </div>
  );

  if (!user) return <div style={s.center} onClick={() => navigate('/login')} style={{ ...s.center, cursor:'pointer', color:'#e94560' }}>فشل تحميل الملف الشخصي – اضغط للتسجيل</div>;

  const initials = ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')) || user.email[0].toUpperCase();
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
  const joined   = user.date_joined ? new Date(user.date_joined).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' }) : '—';

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Top card */}
        <div style={s.topCard}>
          <div style={s.avatarWrap}>
            <div style={s.avatar}>{initials}</div>
            <div style={s.avatarRing} />
          </div>
          <div style={s.topInfo}>
            <h1 style={s.name}>{fullName}</h1>
            <p style={s.email}>{user.email}</p>
            <div style={s.badges}>
              <span style={user.is_instructor ? s.badgeInstructor : s.badgeStudent}>
                {user.is_instructor ? '🎓 مدرّس' : '📚 طالب'}
              </span>
              {user.is_staff && <span style={s.badgeAdmin}>🛡 أدمن</span>}
            </div>
          </div>
          <button style={s.dashBtn}
            onClick={() => navigate(user.is_instructor ? '/dashboard/instructor' : '/dashboard/student')}>
            لوحة التحكم ←
          </button>
        </div>

        {/* Info grid */}
        <div style={s.grid}>
          <InfoCard icon="✉️" label="البريد الإلكتروني" value={user.email} />
          <InfoCard icon="👤" label="الاسم الأول" value={user.first_name || '—'} />
          <InfoCard icon="👤" label="اسم العائلة" value={user.last_name || '—'} />
          <InfoCard icon="🏷️" label="نوع الحساب" value={user.is_instructor ? 'مدرّس' : 'طالب'} />
          <InfoCard icon="📅" label="تاريخ الانضمام" value={joined} />
          {user.is_staff && <InfoCard icon="🛡" label="الصلاحيات" value="مدير النظام" highlight />}
        </div>

        {/* Instructor profile */}
        {user.instructor_profile && (
          <div style={s.instructorCard}>
            <h3 style={s.sectionTitle}>🎓 الملف التعليمي</h3>
            {user.instructor_profile.bio && (
              <p style={s.bio}>{user.instructor_profile.bio}</p>
            )}
            {user.instructor_profile.expertise && (
              <div style={s.expertiseWrap}>
                <span style={s.expertiseLabel}>التخصص:</span>
                <span style={s.expertiseValue}>{user.instructor_profile.expertise}</span>
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div style={s.actions}>
          <ActionBtn icon="📚" label="تصفح الكورسات" onClick={() => navigate('/courses')} />
          {user.is_instructor && (
            <ActionBtn icon="➕" label="إنشاء كورس" onClick={() => navigate('/courses/create')} accent />
          )}
          {user.is_staff && (
            <ActionBtn icon="🛡" label="لوحة الأدمن" onClick={() => navigate('/admin/courses')} />
          )}
        </div>

      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value, highlight }) => (
  <div style={{ ...s.infoCard, ...(highlight ? s.infoCardHighlight : {}) }}>
    <span style={s.infoIcon}>{icon}</span>
    <div>
      <p style={s.infoLabel}>{label}</p>
      <p style={{ ...s.infoValue, ...(highlight ? { color: '#e94560' } : {}) }}>{value}</p>
    </div>
  </div>
);

const ActionBtn = ({ icon, label, onClick, accent }) => (
  <button style={{ ...s.actionBtn, ...(accent ? s.actionBtnAccent : {}) }} onClick={onClick}>
    <span style={{ fontSize: 20 }}>{icon}</span>
    <span>{label}</span>
  </button>
);

const s = {
  page:      { background: '#0f0f1a', minHeight: '100vh', padding: '40px 20px' },
  container: { maxWidth: 820, margin: '0 auto' },
  center:    { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  spinner:   { width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)',
               borderTopColor: '#e94560', animation: 'spin 0.8s linear infinite' },

  // Top card
  topCard:   { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 20,
               padding: '32px 28px', display: 'flex', alignItems: 'center', gap: 24,
               marginBottom: 20, border: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' },
  avatarWrap:{ position: 'relative', flexShrink: 0 },
  avatar:    { width: 80, height: 80, borderRadius: '50%', background: '#e94560',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontSize: 28, fontWeight: 800, color: '#fff', position: 'relative', zIndex: 1 },
  avatarRing:{ position: 'absolute', inset: -4, borderRadius: '50%',
               border: '2px solid rgba(233,69,96,0.3)', top: -4, left: -4, right: -4, bottom: -4 },
  topInfo:   { flex: 1 },
  name:      { color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 4px' },
  email:     { color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: '0 0 12px' },
  badges:    { display: 'flex', gap: 8 },
  badgeInstructor: { background: 'rgba(233,69,96,0.15)', color: '#e94560', border: '1px solid rgba(233,69,96,0.3)',
                     padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  badgeStudent:    { background: 'rgba(0,200,150,0.15)', color: '#00c896', border: '1px solid rgba(0,200,150,0.3)',
                     padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  badgeAdmin:      { background: 'rgba(100,100,255,0.15)', color: '#8888ff', border: '1px solid rgba(100,100,255,0.3)',
                     padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  dashBtn:   { background: 'rgba(233,69,96,0.12)', color: '#e94560', border: '1px solid rgba(233,69,96,0.25)',
               borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14,
               whiteSpace: 'nowrap' },

  // Info grid
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 20 },
  infoCard:  { background: '#1a1a2e', borderRadius: 12, padding: '16px 18px', display: 'flex',
               alignItems: 'center', gap: 14, border: '1px solid rgba(255,255,255,0.06)' },
  infoCardHighlight: { border: '1px solid rgba(233,69,96,0.2)', background: 'rgba(233,69,96,0.05)' },
  infoIcon:  { fontSize: 22, flexShrink: 0 },
  infoLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, textTransform: 'uppercase',
               letterSpacing: 1, margin: '0 0 4px', fontWeight: 600 },
  infoValue: { color: '#fff', fontSize: 15, fontWeight: 600, margin: 0 },

  // Instructor card
  instructorCard: { background: '#1a1a2e', borderRadius: 16, padding: '24px', marginBottom: 20,
                    border: '1px solid rgba(255,255,255,0.07)' },
  sectionTitle:   { color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 16px' },
  bio:            { color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 12px' },
  expertiseWrap:  { display: 'flex', gap: 8, alignItems: 'center' },
  expertiseLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  expertiseValue: { color: '#e94560', fontWeight: 600, fontSize: 14 },

  // Actions
  actions:   { display: 'flex', gap: 12, flexWrap: 'wrap' },
  actionBtn: { flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
               gap: 8, padding: '14px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
               background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
               fontSize: 14, fontWeight: 600 },
  actionBtnAccent: { background: 'rgba(233,69,96,0.12)', color: '#e94560',
                     border: '1px solid rgba(233,69,96,0.25)' },
};

// Inject spinner keyframes
if (typeof document !== 'undefined' && !document.getElementById('pr-spin')) {
  const st = document.createElement('style');
  st.id = 'pr-spin';
  st.innerHTML = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(st);
}

export default Profile;