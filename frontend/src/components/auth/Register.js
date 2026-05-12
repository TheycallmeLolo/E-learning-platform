import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import { updateInstructorProfile } from '../../services/instructors';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [formData, setFormData] = useState({
    email: '', password: '', password2: '',
    first_name: '', last_name: '', is_instructor: false,
  });
  const [instructorData, setInstructorData] = useState({
    title: 'dr', bio: '', department: '', university: '',
    expertise: '', avatar: null, cv_file: null,
  });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleInstChange = (e) => {
    const value = e.target.files ? e.target.files[0] : e.target.value;
    setInstructorData({ ...instructorData, [e.target.name]: value });
  };

  const handleNext = (e) => {
    e.preventDefault(); setError('');
    if (!formData.email || !formData.first_name) {
      setError('يرجى تعبئة جميع الحقول المطلوبة'); return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.password2) { setError('كلمتا المرور غير متطابقتين'); return; }
    if (formData.password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }

    setLoading(true);
    try {
      await authService.register(formData);
      if (formData.is_instructor) {
        setStep(3); // خطوة بيانات الدكتور
      } else {
        navigate('/dashboard/student');
      }
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object' ? Object.values(d).flat().join(', ') : 'فشل التسجيل');
    } finally { setLoading(false); }
  };

  const handleInstructorSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = authService.getUserFromStorage();
      const fd   = new FormData();
      ['title','bio','department','university','expertise'].forEach(k => {
        if (instructorData[k]) fd.append(k, instructorData[k]);
      });
      if (instructorData.avatar)  fd.append('avatar',  instructorData.avatar);
      if (instructorData.cv_file) fd.append('cv_file', instructorData.cv_file);

      await updateInstructorProfile(user.id, fd);

      // ✅ مدرس → صفحة انتظار الموافقة
      navigate('/pending-approval');
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object' ? Object.values(d).flat().join(', ') : 'فشل رفع البيانات');
    } finally { setLoading(false); }
  };

  // لو الخطوة 3 وهو مش مدرس — skip مباشر
  const handleSkip = () => navigate('/pending-approval');

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.brand}>🎓 EduPlatform</div>
          <h1 style={s.leftTitle}>ابدأ رحلتك التعليمية</h1>
          <p style={s.leftSub}>سواء كنت طالباً أو مدرّساً، مكانك هنا</p>
          <div style={s.steps}>
            <StepDot n={1} active={step >= 1} label="بياناتك" />
            <div style={s.stepLine(step >= 2)} />
            <StepDot n={2} active={step >= 2} label="الحساب" />
            {formData.is_instructor && (
              <>
                <div style={s.stepLine(step >= 3)} />
                <StepDot n={3} active={step >= 3} label="بيانات الدكتور" />
              </>
            )}
          </div>

          {/* Notice for instructors */}
          {formData.is_instructor && (
            <div style={s.approvalNotice}>
              <p style={s.approvalIcon}>ℹ️</p>
              <p style={s.approvalText}>
                حسابات المدرسين تحتاج موافقة الأدمن قبل النشر
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.formBox}>
          <div style={s.formHeader}>
            <h2 style={s.formTitle}>
              {step === 1 ? 'إنشاء حساب جديد 🚀'
               : step === 2 ? 'خطوة أخيرة 🔑'
               : 'إكمال بيانات الدكتور 🎓'}
            </h2>
            <p style={s.formSub}>
              {step === 1 ? 'أدخل بياناتك الشخصية'
               : step === 2 ? 'اختر كلمة مرور قوية'
               : 'أضف معلوماتك الأكاديمية — يمكن إكمالها لاحقاً'}
            </p>
          </div>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleNext} style={s.form}>
              <div style={s.row2}>
                <Field label="الاسم الأول *">
                  <InputWrap icon="👤">
                    <input style={s.input} name="first_name" value={formData.first_name}
                      onChange={handleChange} placeholder="Ahmed" required />
                  </InputWrap>
                </Field>
                <Field label="اسم العائلة">
                  <InputWrap icon="👤">
                    <input style={s.input} name="last_name" value={formData.last_name}
                      onChange={handleChange} placeholder="Mohamed" />
                  </InputWrap>
                </Field>
              </div>
              <Field label="البريد الإلكتروني *">
                <InputWrap icon="✉️">
                  <input style={s.input} type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="example@email.com" required />
                </InputWrap>
              </Field>
              {error && <ErrorBox msg={error} />}
              <button type="submit" style={s.submitBtn}>التالي →</button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={s.form}>
              <Field label="كلمة المرور *">
                <InputWrap icon="🔒">
                  <input style={s.input} type={showPass ? 'text' : 'password'}
                    name="password" value={formData.password}
                    onChange={handleChange} placeholder="8 أحرف على الأقل" required />
                  <button type="button" style={s.eyeBtn}
                    onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </InputWrap>
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
              </Field>
              <Field label="تأكيد كلمة المرور *">
                <InputWrap icon="🔒">
                  <input style={s.input} type="password" name="password2"
                    value={formData.password2} onChange={handleChange}
                    placeholder="أعد كتابة كلمة المرور" required />
                  {formData.password2 && (
                    <span style={{ position:'absolute', right:14, fontSize:16 }}>
                      {formData.password === formData.password2 ? '✅' : '❌'}
                    </span>
                  )}
                </InputWrap>
              </Field>

              {/* Account type */}
              <div style={s.typeWrap}>
                <p style={s.typeTitle}>نوع الحساب</p>
                <div style={s.typeCards}>
                  <TypeCard
                    active={!formData.is_instructor}
                    icon="📚" label="طالب" sub="أتعلم وأطور مهاراتي"
                    onClick={() => setFormData({ ...formData, is_instructor: false })}
                  />
                  <TypeCard
                    active={formData.is_instructor}
                    icon="🎓" label="مدرّس" sub="أنشئ وأبيع الكورسات"
                    onClick={() => setFormData({ ...formData, is_instructor: true })}
                    badge="يحتاج موافقة"
                  />
                </div>
              </div>

              {error && <ErrorBox msg={error} />}
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" style={s.backBtn}
                  onClick={() => { setStep(1); setError(''); }}>← رجوع</button>
                <button type="submit" style={{ ...s.submitBtn, flex:1 }} disabled={loading}>
                  {loading ? '⏳ جاري التسجيل...' : 'إنشاء الحساب 🎉'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3 — Instructor data ── */}
          {step === 3 && formData.is_instructor && (
            <form onSubmit={handleInstructorSubmit} style={s.form}>
              <div style={s.pendingBanner}>
                ⏳ حسابك محفوظ — ستحتاج موافقة الأدمن للنشر
              </div>

              <div style={s.row2}>
                <Field label="اللقب *">
                  <InputWrap icon="🎓">
                    <select style={s.input} name="title" value={instructorData.title}
                      onChange={handleInstChange}>
                      <option value="dr">دكتور</option>
                      <option value="prof">أستاذ دكتور</option>
                      <option value="eng">مهندس</option>
                      <option value="mr">أستاذ</option>
                    </select>
                  </InputWrap>
                </Field>
                <Field label="القسم">
                  <InputWrap icon="🏛️">
                    <input style={s.input} name="department" value={instructorData.department}
                      onChange={handleInstChange} placeholder="Computer Science" />
                  </InputWrap>
                </Field>
              </div>
              <Field label="الجامعة">
                <InputWrap icon="🎓">
                  <input style={s.input} name="university" value={instructorData.university}
                    onChange={handleInstChange} placeholder="Cairo University" />
                </InputWrap>
              </Field>
              <Field label="التخصص">
                <InputWrap icon="🔬">
                  <input style={s.input} name="expertise" value={instructorData.expertise}
                    onChange={handleInstChange} placeholder="Machine Learning, Python" />
                </InputWrap>
              </Field>
              <Field label="نبذة عنك">
                <InputWrap icon="📝">
                  <textarea style={{ ...s.input, minHeight:80, resize:'vertical', paddingTop:14 }}
                    name="bio" value={instructorData.bio}
                    onChange={handleInstChange} placeholder="خبرتك الأكاديمية والبحثية..." />
                </InputWrap>
              </Field>
              <div style={s.row2}>
                <Field label="الصورة الشخصية">
                  <input type="file" style={s.fileInput} accept="image/*" name="avatar"
                    onChange={handleInstChange} />
                </Field>
                <Field label="السيرة الذاتية (PDF)">
                  <input type="file" style={s.fileInput} accept=".pdf" name="cv_file"
                    onChange={handleInstChange} />
                </Field>
              </div>
              {error && <ErrorBox msg={error} />}
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" style={s.skipBtn} onClick={handleSkip}>
                  تخطي — أكمل لاحقاً
                </button>
                <button type="submit" style={{ ...s.submitBtn, flex:1 }} disabled={loading}>
                  {loading ? '⏳...' : 'إرسال للمراجعة 📤'}
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

// ─── Sub components ───────────────────────────────────────────────────────────
const StepDot = ({ n, active, label }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
    <div style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, background: active ? '#c8973a' : 'rgba(255,255,255,0.1)', color: active ? '#000' : 'rgba(255,255,255,0.3)', transition:'all 0.3s' }}>{n}</div>
    <span style={{ fontSize:12, color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)', textAlign:'center', maxWidth:80 }}>{label}</span>
  </div>
);
const Field = ({ label, children }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
    <label style={{ color:'rgba(255,255,255,0.7)', fontSize:13, fontWeight:600 }}>{label}</label>
    {children}
  </div>
);
const InputWrap = ({ icon, children }) => (
  <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
    <span style={{ position:'absolute', left:14, fontSize:15, zIndex:1, pointerEvents:'none' }}>{icon}</span>
    {children}
  </div>
);
const TypeCard = ({ active, icon, label, sub, badge, onClick }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'16px 12px', borderRadius:10, cursor:'pointer', transition:'all 0.2s', background: active ? 'rgba(200,151,58,0.12)' : 'rgba(255,255,255,0.04)', border:`1px solid ${active ? 'rgba(200,151,58,0.4)' : 'rgba(255,255,255,0.08)'}`, position:'relative' }}
    onClick={onClick}>
    {badge && <span style={{ position:'absolute', top:-8, right:-8, background:'#c8973a', color:'#000', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10 }}>{badge}</span>}
    <span style={{ fontSize:28 }}>{icon}</span>
    <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{label}</span>
    <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11, textAlign:'center' }}>{sub}</span>
  </div>
);
const ErrorBox = ({ msg }) => (
  <div style={{ background:'rgba(233,69,96,0.1)', border:'1px solid rgba(233,69,96,0.3)', color:'#e94560', borderRadius:10, padding:'12px 16px', fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
    ⚠ {msg}
  </div>
);

const s = {
  page    : { display:'flex', minHeight:'100vh', background:'#0f0f1a' },
  left    : { flex:1, background:'linear-gradient(145deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 40px' },
  leftInner:{ maxWidth:380, width:'100%' },
  brand   : { color:'#c8973a', fontSize:22, fontWeight:800, marginBottom:32 },
  leftTitle:{ color:'#fff', fontSize:'clamp(24px,3vw,38px)', fontWeight:800, lineHeight:1.2, margin:'0 0 14px' },
  leftSub : { color:'rgba(255,255,255,0.55)', fontSize:15, lineHeight:1.7, margin:'0 0 36px' },
  steps   : { display:'flex', alignItems:'center', gap:0, marginBottom:24 },
  stepLine: (on) => ({ flex:1, height:2, margin:'0 8px', marginBottom:24, background: on ? '#c8973a' : 'rgba(255,255,255,0.1)', transition:'background 0.3s' }),
  approvalNotice: { background:'rgba(200,151,58,0.08)', border:'1px solid rgba(200,151,58,0.2)', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' },
  approvalIcon  : { margin:0, fontSize:16 },
  approvalText  : { color:'rgba(255,255,255,0.5)', fontSize:13, margin:0, lineHeight:1.6 },
  right   : { width:'45%', minWidth:340, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', background:'#13131f' },
  formBox : { width:'100%', maxWidth:440 },
  formHeader:{ marginBottom:28 },
  formTitle : { color:'#fff', fontSize:24, fontWeight:800, margin:'0 0 6px' },
  formSub   : { color:'rgba(255,255,255,0.4)', fontSize:14, margin:0 },
  form      : { display:'flex', flexDirection:'column', gap:18 },
  row2      : { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  input     : { width:'100%', padding:'12px 44px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box' },
  fileInput : { color:'rgba(255,255,255,0.6)', fontSize:12, padding:'8px 0' },
  eyeBtn    : { position:'absolute', right:14, background:'none', border:'none', cursor:'pointer', fontSize:15, color:'rgba(255,255,255,0.4)', padding:0 },
  strengthWrap: { display:'flex', alignItems:'center', gap:6, marginTop:6 },
  strengthBar : (on) => ({ flex:1, height:3, borderRadius:2, background: on ? '#c8973a' : 'rgba(255,255,255,0.1)', transition:'background 0.3s' }),
  strengthText: { color:'rgba(255,255,255,0.4)', fontSize:11, whiteSpace:'nowrap' },
  typeWrap  : { background:'rgba(255,255,255,0.03)', borderRadius:12, padding:16 },
  typeTitle : { color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, margin:'0 0 12px' },
  typeCards : { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  pendingBanner: { background:'rgba(200,151,58,0.1)', border:'1px solid rgba(200,151,58,0.25)', borderRadius:8, padding:'10px 14px', color:'#c8973a', fontSize:13, fontWeight:600, textAlign:'center' },
  submitBtn : { width:'100%', padding:'13px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#c8973a,#a07020)', color:'#000', fontSize:15, fontWeight:700, cursor:'pointer' },
  backBtn   : { padding:'13px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:14 },
  skipBtn   : { padding:'13px 16px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:13, whiteSpace:'nowrap' },
  switchText: { textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:14, marginTop:24 },
  switchLink: { color:'#c8973a', fontWeight:700, textDecoration:'none' },
};

export default Register;