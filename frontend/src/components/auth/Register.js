import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);   // 1 = personal info, 2 = password + type
  const [formData, setFormData] = useState({
    email: '', password: '', password2: '',
    first_name: '', last_name: '', is_instructor: false,
  });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.first_name) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.password2) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      await authService.register(formData);
      const user = await authService.getCurrentUser();
      navigate(user?.is_instructor ? '/dashboard/instructor' : '/dashboard/student');
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object' ? Object.values(d).flat().join(', ') : 'فشل التسجيل');
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
          <h1 style={s.leftTitle}>ابدأ رحلتك التعليمية</h1>
          <p style={s.leftSub}>سواء كنت طالباً أو مدرّساً، مكانك هنا</p>

          {/* Step indicator */}
          <div style={s.steps}>
            <div style={s.stepItem(step >= 1)}>
              <div style={s.stepCircle(step >= 1)}>1</div>
              <span style={s.stepLabel(step >= 1)}>بياناتك الشخصية</span>
            </div>
            <div style={s.stepLine(step >= 2)} />
            <div style={s.stepItem(step >= 2)}>
              <div style={s.stepCircle(step >= 2)}>2</div>
              <span style={s.stepLabel(step >= 2)}>كلمة المرور ونوع الحساب</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.formBox}>
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>
              {step === 1 ? 'إنشاء حساب جديد 🚀' : 'خطوة أخيرة 🔑'}
            </h2>
            <p style={s.formSub}>
              {step === 1 ? 'أدخل بياناتك الشخصية' : 'اختر كلمة مرور قوية'}
            </p>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} style={s.form}>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>الاسم الأول *</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}>👤</span>
                    <input style={s.input} name="first_name" value={formData.first_name}
                      onChange={handleChange} placeholder="Ahmed" required />
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>اسم العائلة</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}>👤</span>
                    <input style={s.input} name="last_name" value={formData.last_name}
                      onChange={handleChange} placeholder="Mohamed" />
                  </div>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>البريد الإلكتروني *</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>✉️</span>
                  <input style={s.input} type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="example@email.com" required />
                </div>
              </div>

              {error && <div style={s.errorBox}><span>⚠</span> {error}</div>}

              <button type="submit" style={s.submitBtn}>التالي →</button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>كلمة المرور *</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔒</span>
                  <input style={s.input} type={showPass ? 'text' : 'password'}
                    name="password" value={formData.password} onChange={handleChange}
                    placeholder="8 أحرف على الأقل" required />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {/* Password strength */}
                {formData.password && (
                  <div style={s.strengthWrap}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={s.strengthBar(formData.password.length >= i * 3)} />
                    ))}
                    <span style={s.strengthText}>
                      {formData.password.length < 6 ? 'ضعيفة' : formData.password.length < 10 ? 'متوسطة' : 'قوية'}
                    </span>
                  </div>
                )}
              </div>

              <div style={s.field}>
                <label style={s.label}>تأكيد كلمة المرور *</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔒</span>
                  <input style={s.input} type="password" name="password2"
                    value={formData.password2} onChange={handleChange}
                    placeholder="أعد كتابة كلمة المرور" required />
                  {formData.password2 && (
                    <span style={{ position:'absolute', right:14, fontSize:16 }}>
                      {formData.password === formData.password2 ? '✅' : '❌'}
                    </span>
                  )}
                </div>
              </div>

              {/* Account type */}
              <div style={s.typeWrap}>
                <p style={s.typeTitle}>نوع الحساب</p>
                <div style={s.typeCards}>
                  <div style={s.typeCard(!formData.is_instructor)}
                    onClick={() => setFormData({ ...formData, is_instructor: false })}>
                    <span style={{ fontSize: 28 }}>📚</span>
                    <span style={s.typeCardLabel}>طالب</span>
                    <span style={s.typeCardSub}>أتعلم وأطور مهاراتي</span>
                  </div>
                  <div style={s.typeCard(formData.is_instructor)}
                    onClick={() => setFormData({ ...formData, is_instructor: true })}>
                    <span style={{ fontSize: 28 }}>🎓</span>
                    <span style={s.typeCardLabel}>مدرّس</span>
                    <span style={s.typeCardSub}>أنشئ وأبيع الكورسات</span>
                  </div>
                </div>
              </div>

              {error && <div style={s.errorBox}><span>⚠</span> {error}</div>}

              <div style={{ display:'flex', gap:10 }}>
                <button type="button" style={s.backBtn} onClick={() => { setStep(1); setError(''); }}>
                  ← رجوع
                </button>
                <button type="submit" style={{ ...s.submitBtn, flex:1 }} disabled={loading}>
                  {loading ? '⏳ جاري التسجيل...' : 'إنشاء الحساب 🎉'}
                </button>
              </div>
            </form>
          )}

          <p style={s.switchText}>
            عندك حساب بالفعل؟{' '}
            <Link to="/login" style={s.switchLink}>سجّل دخولك</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const s = {
  page:  { display:'flex', minHeight:'100vh', background:'#0f0f1a' },

  left:  { flex:1, background:'linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
           display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 40px' },
  leftInner: { maxWidth:380, width:'100%' },
  brand: { color:'#e94560', fontSize:22, fontWeight:800, marginBottom:32 },
  leftTitle: { color:'#fff', fontSize:'clamp(24px, 3vw, 38px)', fontWeight:800,
               lineHeight:1.2, margin:'0 0 14px' },
  leftSub:   { color:'rgba(255,255,255,0.55)', fontSize:15, lineHeight:1.7, margin:'0 0 48px' },

  // Steps
  steps:       { display:'flex', alignItems:'center', gap:0 },
  stepItem:    (on) => ({ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }),
  stepCircle:  (on) => ({
    width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
    fontWeight:700, fontSize:15,
    background: on ? '#e94560' : 'rgba(255,255,255,0.1)',
    color: on ? '#fff' : 'rgba(255,255,255,0.3)',
    transition: 'all 0.3s',
  }),
  stepLabel:   (on) => ({ fontSize:12, color: on ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                          textAlign:'center', maxWidth:80 }),
  stepLine:    (on) => ({
    flex:1, height:2, margin:'0 8px', marginBottom:24,
    background: on ? '#e94560' : 'rgba(255,255,255,0.1)', transition:'background 0.3s',
  }),

  right: { width:'45%', minWidth:340, display:'flex', alignItems:'center',
           justifyContent:'center', padding:'40px 32px', background:'#13131f' },
  formBox:    { width:'100%', maxWidth:420 },
  formHeader: { marginBottom:28 },
  formTitle:  { color:'#fff', fontSize:24, fontWeight:800, margin:'0 0 6px' },
  formSub:    { color:'rgba(255,255,255,0.4)', fontSize:14, margin:0 },

  form:  { display:'flex', flexDirection:'column', gap:18 },
  row2:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  field: { display:'flex', flexDirection:'column', gap:8 },
  label: { color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:600 },

  inputWrap: { position:'relative', display:'flex', alignItems:'center' },
  inputIcon: { position:'absolute', left:14, fontSize:15, zIndex:1, pointerEvents:'none' },
  input: {
    width:'100%', padding:'12px 44px', borderRadius:10,
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
    color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box',
  },
  eyeBtn: { position:'absolute', right:14, background:'none', border:'none',
            cursor:'pointer', fontSize:15, color:'rgba(255,255,255,0.4)', padding:0 },

  // Password strength
  strengthWrap: { display:'flex', alignItems:'center', gap:6, marginTop:6 },
  strengthBar:  (on) => ({
    flex:1, height:3, borderRadius:2,
    background: on ? '#e94560' : 'rgba(255,255,255,0.1)',
    transition:'background 0.3s',
  }),
  strengthText: { color:'rgba(255,255,255,0.4)', fontSize:11, whiteSpace:'nowrap' },

  // Account type
  typeWrap:     { background:'rgba(255,255,255,0.03)', borderRadius:12, padding:16 },
  typeTitle:    { color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, margin:'0 0 12px' },
  typeCards:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  typeCard:     (active) => ({
    display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'16px 12px',
    borderRadius:10, cursor:'pointer', transition:'all 0.2s',
    background: active ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? 'rgba(233,69,96,0.4)' : 'rgba(255,255,255,0.08)'}`,
  }),
  typeCardLabel: { color:'#fff', fontWeight:700, fontSize:14 },
  typeCardSub:   { color:'rgba(255,255,255,0.4)', fontSize:11, textAlign:'center' },

  errorBox: { background:'rgba(233,69,96,0.1)', border:'1px solid rgba(233,69,96,0.3)',
              color:'#e94560', borderRadius:10, padding:'12px 16px', fontSize:14,
              display:'flex', alignItems:'center', gap:8 },
  submitBtn: {
    width:'100%', padding:'13px', borderRadius:10, border:'none',
    background:'linear-gradient(135deg, #e94560, #c73652)',
    color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer',
  },
  backBtn: { padding:'13px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)',
             background:'transparent', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:14 },
  switchText: { textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:14, marginTop:24 },
  switchLink: { color:'#e94560', fontWeight:700, textDecoration:'none' },
};

export default Register;