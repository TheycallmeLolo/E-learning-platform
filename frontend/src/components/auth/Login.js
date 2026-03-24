import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(formData.email, formData.password);
      const user = await authService.getCurrentUser();
      navigate(user?.is_instructor ? '/dashboard/instructor' : '/dashboard/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'البريد أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.brand}>🎓 EduPlatform</div>
          <h1 style={s.leftTitle}>تعلّم بلا حدود</h1>
          <p style={s.leftSub}>انضم لآلاف الطلاب وابدأ رحلتك التعليمية اليوم</p>
          <div style={s.features}>
            {['📚 مئات الكورسات', '🎬 فيديوهات عالية الجودة', '🏆 شهادات معتمدة', '💬 دعم مستمر'].map(f => (
              <div key={f} style={s.feature}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={s.right}>
        <div style={s.formBox}>
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>مرحباً بعودتك 👋</h2>
            <p style={s.formSub}>سجّل دخولك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>البريد الإلكتروني</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>✉️</span>
                <input style={s.input} type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="example@email.com" required />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>كلمة المرور</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input style={s.input} type={showPass ? 'text' : 'password'}
                  name="password" value={formData.password} onChange={handleChange}
                  placeholder="••••••••" required />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div style={s.errorBox}>
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading
                ? <span style={s.loadingDots}><span>.</span><span>.</span><span>.</span></span>
                : 'تسجيل الدخول →'}
            </button>
          </form>

          <p style={s.switchText}>
            مش عندك حساب؟{' '}
            <Link to="/register" style={s.switchLink}>إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const s = {
  page:  { display: 'flex', minHeight: '100vh', background: '#0f0f1a' },

  // Left
  left:  { flex: 1, background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
           display: 'flex', alignItems: 'center', justifyContent: 'center',
           padding: '60px 40px', position: 'relative', overflow: 'hidden' },
  leftInner: { maxWidth: 400, position: 'relative', zIndex: 1 },
  brand: { color: '#e94560', fontSize: 22, fontWeight: 800, marginBottom: 32, letterSpacing: -0.5 },
  leftTitle: { color: '#fff', fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 800,
               lineHeight: 1.2, margin: '0 0 16px' },
  leftSub:   { color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.7, margin: '0 0 40px' },
  features:  { display: 'flex', flexDirection: 'column', gap: 14 },
  feature:   { color: 'rgba(255,255,255,0.75)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 },

  // Right
  right: { width: '45%', minWidth: 340, display: 'flex', alignItems: 'center',
           justifyContent: 'center', padding: '40px 32px', background: '#13131f' },
  formBox: { width: '100%', maxWidth: 400 },
  formHeader: { marginBottom: 32 },
  formTitle:  { color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 8px' },
  formSub:    { color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 },

  form:  { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 },

  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, fontSize: 16, zIndex: 1, pointerEvents: 'none' },
  input: {
    width: '100%', padding: '13px 44px', borderRadius: 10,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  eyeBtn: { position: 'absolute', right: 14, background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 16, padding: 0, color: 'rgba(255,255,255,0.4)' },

  errorBox: { background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)',
              color: '#e94560', borderRadius: 10, padding: '12px 16px', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8 },

  submitBtn: {
    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #e94560, #c73652)',
    color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
    marginTop: 4, transition: 'opacity 0.2s',
  },
  loadingDots: { display: 'flex', justifyContent: 'center', gap: 4 },

  switchText: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 24 },
  switchLink: { color: '#e94560', fontWeight: 700, textDecoration: 'none' },
};

// Responsive: hide left panel on small screens
if (typeof document !== 'undefined' && !document.getElementById('auth-resp')) {
  const st = document.createElement('style');
  st.id = 'auth-resp';
  st.innerHTML = `
    @media (max-width: 768px) {
      .auth-left { display: none !important; }
      .auth-right { width: 100% !important; }
    }
  `;
  document.head.appendChild(st);
}

export default Login;