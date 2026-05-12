import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { updateInstructorProfile } from '../services/instructors';

// ─── CV Viewer ────────────────────────────────────────────────────────────────
const CVViewer = ({ url }) => {
  const [open, setOpen] = useState(false);
  if (!url) return null;
  return (
    <>
      <button style={cv.btn} onClick={() => setOpen(true)}>
        📄 عرض السيرة الذاتية
      </button>
      {open && (
        <div style={cv.overlay} onClick={() => setOpen(false)}>
          <div style={cv.modal} onClick={e => e.stopPropagation()}>
            <div style={cv.header}>
              <span style={cv.headerTitle}>📄 السيرة الذاتية</span>
              <div style={{ display:'flex', gap:8 }}>
                <a href={url} download style={cv.downloadBtn}>⬇ تحميل</a>
                <button style={cv.closeBtn} onClick={() => setOpen(false)}>✕</button>
              </div>
            </div>
            <iframe
              src={url}
              style={cv.frame}
              title="CV"
            />
          </div>
        </div>
      )}
    </>
  );
};

const cv = {
  btn        : { background:'rgba(200,151,58,0.12)', color:'#c8973a', border:'1px solid rgba(200,151,58,0.3)', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontSize:13, fontWeight:700 },
  overlay    : { position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16 },
  modal      : { background:'#1a1a2e', borderRadius:14, width:'90%', maxWidth:800, height:'88vh', display:'flex', flexDirection:'column', border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden' },
  header     : { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)' },
  headerTitle: { color:'#fff', fontWeight:700, fontSize:15 },
  downloadBtn: { background:'rgba(200,151,58,0.15)', color:'#c8973a', border:'1px solid rgba(200,151,58,0.25)', borderRadius:6, padding:'6px 12px', textDecoration:'none', fontSize:12, fontWeight:700 },
  closeBtn   : { background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,255,255,0.6)', borderRadius:6, width:28, height:28, cursor:'pointer', fontSize:16 },
  frame      : { flex:1, border:'none', width:'100%' },
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Profile = () => {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData]   = useState({});
  const [files, setFiles]         = useState({ avatar: null, cv_file: null });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    authService.getCurrentUser()
      .then(res => {
        setUser(res);
        if (res?.instructor_profile) {
          // نحفظ فقط الـ fields القابلة للتعديل
          const p = res.instructor_profile;
          setEditData({
            title         : p.title        || 'dr',
            bio           : p.bio          || '',
            expertise     : p.expertise    || '',
            department    : p.department   || '',
            university    : p.university   || '',
            office_hours  : p.office_hours || '',
            linkedin      : p.linkedin     || '',
            google_scholar: p.google_scholar || '',
            research_gate : p.research_gate  || '',
            website       : p.website      || '',
            years_experience: p.years_experience || 0,
            phone_number  : p.phone_number || '',
            show_cv       : p.show_cv      ?? true,
            show_contact  : p.show_contact ?? false,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, files: f, type, checked } = e.target;
    if (f && f[0]) {
      if (name === 'avatar') setAvatarPreview(URL.createObjectURL(f[0]));
      setFiles(p => ({ ...p, [name]: f[0] }));
    } else if (type === 'checkbox') {
      setEditData(p => ({ ...p, [name]: checked }));
    } else {
      setEditData(p => ({ ...p, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      const fd = new FormData();
      // فقط الـ fields القابلة للتعديل — مش read_only
      const editableFields = [
        'title','bio','expertise','department','university',
        'office_hours','linkedin','google_scholar','research_gate',
        'website','years_experience','phone_number','show_cv','show_contact'
      ];
      editableFields.forEach(k => {
        if (editData[k] !== undefined && editData[k] !== null)
          fd.append(k, editData[k]);
      });
      if (files.avatar)  fd.append('avatar',  files.avatar);
      if (files.cv_file) fd.append('cv_file', files.cv_file);

      await updateInstructorProfile(user.instructor_profile.id, fd);
      setIsEditing(false);
      setFiles({ avatar: null, cv_file: null });
      setAvatarPreview(null);
      const updated = await authService.getCurrentUser();
      setUser(updated);
    } catch (err) {
      const data = err.response?.data;
      setSaveError(
        typeof data === 'object'
          ? Object.entries(data).map(([k,v]) => `${k}: ${v}`).join(' | ')
          : 'فشل حفظ التغييرات'
      );
    } finally { setSaving(false); }
  };

  if (loading) return <div style={s.center}><div style={s.spinner} /></div>;
  if (!user)   return (
    <div style={{...s.center, cursor:'pointer', color:'#e94560'}}
      onClick={() => navigate('/login')}>
      فشل تحميل الملف الشخصي — اضغط للتسجيل
    </div>
  );

  const initials = ((user.first_name?.[0]||'') + (user.last_name?.[0]||'')) || user.email[0].toUpperCase();
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
  const joined   = user.date_joined
    ? new Date(user.date_joined).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' })
    : '—';
  const prof = user.instructor_profile;

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* ── Top Card ── */}
        <div style={s.topCard}>
          <div style={s.avatarWrap}>
            {(avatarPreview || prof?.avatar_url)
              ? <img src={avatarPreview || prof.avatar_url} alt="avatar" style={s.avatarImg} />
              : <div style={s.avatar}>{initials}</div>
            }
            <div style={s.avatarRing} />
          </div>
          <div style={s.topInfo}>
            <h1 style={s.name}>
              {prof?.title_label && <span style={s.titleLabel}>{prof.title_label}</span>}
              {fullName}
            </h1>
            <p style={s.email}>{user.email}</p>
            {prof?.department && <p style={s.dept}>{prof.department} — {prof.university}</p>}
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

        {/* ── Info Grid ── */}
        <div style={s.grid}>
          <InfoCard icon="✉️" label="البريد الإلكتروني" value={user.email} />
          <InfoCard icon="👤" label="الاسم الأول"       value={user.first_name || '—'} />
          <InfoCard icon="👤" label="اسم العائلة"       value={user.last_name  || '—'} />
          <InfoCard icon="🏷️" label="نوع الحساب"       value={user.is_instructor ? 'مدرّس' : 'طالب'} />
          <InfoCard icon="📅" label="تاريخ الانضمام"   value={joined} />
          {user.is_staff && <InfoCard icon="🛡" label="الصلاحيات" value="مدير النظام" highlight />}
        </div>

        {/* ── Instructor Profile ── */}
        {prof && (
          <div style={s.instructorCard}>
            <div style={s.cardHeaderRow}>
              <h3 style={s.sectionTitle}>🎓 الملف التعليمي</h3>
              {!isEditing
                ? <button style={s.editBtn} onClick={() => setIsEditing(true)}>✏️ تعديل</button>
                : <div style={{ display:'flex', gap:8 }}>
                    <button style={{...s.editBtn, background:'transparent', border:'1px solid #e94560', color:'#e94560'}}
                      onClick={() => { setIsEditing(false); setSaveError(''); }}>إلغاء</button>
                    <button style={{...s.editBtn, background:'#c8973a', color:'#000'}}
                      onClick={handleSave} disabled={saving}>
                      {saving ? '⏳...' : '💾 حفظ'}
                    </button>
                  </div>
              }
            </div>

            {saveError && <p style={s.errMsg}>⚠ {saveError}</p>}

            {!isEditing ? (
              /* ── View Mode ── */
              <div>
                {prof.bio && <p style={s.bio}>{prof.bio}</p>}

                <div style={s.profileGrid}>
                  {prof.expertise     && <ProfileItem icon="🔬" label="التخصص"       value={prof.expertise} />}
                  {prof.department    && <ProfileItem icon="🏛"  label="القسم"         value={prof.department} />}
                  {prof.university    && <ProfileItem icon="🎓"  label="الجامعة"       value={prof.university} />}
                  {prof.years_experience > 0 && <ProfileItem icon="⏳" label="سنوات الخبرة" value={`${prof.years_experience} سنة`} />}
                  {prof.office_hours  && <ProfileItem icon="🕐"  label="ساعات المكتب"  value={prof.office_hours} />}
                  {prof.show_contact && prof.phone_number && <ProfileItem icon="📞" label="الهاتف" value={prof.phone_number} />}
                </div>

                {/* Social links */}
                <div style={s.linksRow}>
                  {prof.linkedin       && <SocialLink href={prof.linkedin}       label="LinkedIn"       color="#0077b5" />}
                  {prof.google_scholar && <SocialLink href={prof.google_scholar} label="Google Scholar" color="#4285f4" />}
                  {prof.research_gate  && <SocialLink href={prof.research_gate}  label="ResearchGate"   color="#00ccbb" />}
                  {prof.website        && <SocialLink href={prof.website}        label="الموقع"         color="#c8973a" />}
                </div>

                {/* CV Viewer */}
                {prof.cv_url && <div style={{ marginTop:16 }}><CVViewer url={prof.cv_url} /></div>}
                {prof.cv_file && !prof.show_cv && (
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, marginTop:8 }}>
                    السيرة الذاتية مرفوعة لكن إظهارها مغلق
                  </p>
                )}
              </div>
            ) : (
              /* ── Edit Mode ── */
              <div style={s.editGrid}>
                <Field label="اللقب">
                  <select style={s.input} name="title" value={editData.title} onChange={handleChange}>
                    <option value="dr">دكتور</option>
                    <option value="prof">أستاذ دكتور</option>
                    <option value="eng">مهندس</option>
                    <option value="mr">أستاذ</option>
                  </select>
                </Field>
                <Field label="التخصص">
                  <input style={s.input} name="expertise" value={editData.expertise} onChange={handleChange} placeholder="مثال: Machine Learning, Python" />
                </Field>
                <Field label="القسم">
                  <input style={s.input} name="department" value={editData.department} onChange={handleChange} />
                </Field>
                <Field label="الجامعة">
                  <input style={s.input} name="university" value={editData.university} onChange={handleChange} />
                </Field>
                <Field label="سنوات الخبرة">
                  <input style={s.input} type="number" name="years_experience" value={editData.years_experience} onChange={handleChange} min="0" />
                </Field>
                <Field label="ساعات المكتب">
                  <input style={s.input} name="office_hours" value={editData.office_hours} onChange={handleChange} placeholder="الأحد والثلاثاء 10ص-12ظ" />
                </Field>
                <Field label="LinkedIn">
                  <input style={s.input} name="linkedin" value={editData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                </Field>
                <Field label="Google Scholar">
                  <input style={s.input} name="google_scholar" value={editData.google_scholar} onChange={handleChange} />
                </Field>
                <Field label="ResearchGate">
                  <input style={s.input} name="research_gate" value={editData.research_gate} onChange={handleChange} />
                </Field>
                <Field label="الموقع الشخصي">
                  <input style={s.input} name="website" value={editData.website} onChange={handleChange} />
                </Field>
                <Field label="رقم الهاتف">
                  <input style={s.input} name="phone_number" value={editData.phone_number} onChange={handleChange} />
                </Field>
                <Field label="نبذة شخصية" fullWidth>
                  <textarea style={{...s.input, minHeight:80, resize:'vertical'}} name="bio" value={editData.bio} onChange={handleChange} />
                </Field>
                <Field label="صورة الملف الشخصي">
                  <input type="file" style={s.fileInput} accept="image/*" name="avatar" onChange={handleChange} />
                  {avatarPreview && <img src={avatarPreview} alt="preview" style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', marginTop:8 }} />}
                </Field>
                <Field label="السيرة الذاتية PDF">
                  <input type="file" style={s.fileInput} accept=".pdf" name="cv_file" onChange={handleChange} />
                  {prof.cv_url && !files.cv_file && (
                    <p style={{ color:'#00c896', fontSize:12, marginTop:4 }}>✓ يوجد ملف مرفوع حالياً</p>
                  )}
                </Field>
                <Field label="إظهار السيرة الذاتية للطلاب">
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                    <input type="checkbox" name="show_cv" checked={editData.show_cv} onChange={handleChange} />
                    <span style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>
                      {editData.show_cv ? 'مرئية ✓' : 'مخفية'}
                    </span>
                  </label>
                </Field>
                <Field label="إظهار رقم الهاتف للطلاب">
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                    <input type="checkbox" name="show_contact" checked={editData.show_contact} onChange={handleChange} />
                    <span style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>
                      {editData.show_contact ? 'مرئي ✓' : 'مخفي'}
                    </span>
                  </label>
                </Field>
              </div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        <div style={s.actions}>
          <ActionBtn icon="📚" label="تصفح الكورسات"  onClick={() => navigate('/courses')} />
          <ActionBtn icon="🧪" label="تصفح التجارب"   onClick={() => navigate('/experiences')} />
          {user.is_instructor && <ActionBtn icon="➕" label="إنشاء كورس"    onClick={() => navigate('/courses/create')} accent />}
          {user.is_instructor && <ActionBtn icon="🧪" label="إنشاء تجربة"  onClick={() => navigate('/experiences/create')} accent />}
          {user.is_staff      && <ActionBtn icon="🛡" label="لوحة الأدمن"  onClick={() => navigate('/admin/courses')} />}
        </div>

      </div>
    </div>
  );
};

// ─── Sub components ───────────────────────────────────────────────────────────
const InfoCard = ({ icon, label, value, highlight }) => (
  <div style={{...s.infoCard, ...(highlight ? s.infoCardHighlight : {})}}>
    <span style={s.infoIcon}>{icon}</span>
    <div><p style={s.infoLabel}>{label}</p><p style={s.infoValue}>{value}</p></div>
  </div>
);

const ProfileItem = ({ icon, label, value }) => (
  <div style={s.profileItem}>
    <span style={s.profileItemIcon}>{icon}</span>
    <div>
      <p style={s.profileItemLabel}>{label}</p>
      <p style={s.profileItemValue}>{value}</p>
    </div>
  </div>
);

const SocialLink = ({ href, label, color }) => (
  <a href={href} target="_blank" rel="noreferrer"
    style={{ ...s.socialLink, borderColor: color + '55', color }}>
    {label}
  </a>
);

const Field = ({ label, children, fullWidth }) => (
  <div style={{ ...(fullWidth ? { gridColumn:'1/-1' } : {}), display:'flex', flexDirection:'column', gap:6 }}>
    <label style={s.fieldLabel}>{label}</label>
    {children}
  </div>
);

const ActionBtn = ({ icon, label, onClick, accent }) => (
  <button style={{...s.actionBtn, ...(accent ? s.actionBtnAccent : {})}} onClick={onClick}>
    <span style={{ fontSize:18 }}>{icon}</span>{label}
  </button>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page     : { background:'#0f0f1a', minHeight:'100vh', padding:'40px 20px' },
  container: { maxWidth:860, margin:'0 auto' },
  center   : { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' },
  spinner  : { width:44, height:44, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'#c8973a', animation:'spin 0.8s linear infinite' },

  topCard  : { background:'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius:20, padding:'28px', display:'flex', alignItems:'center', gap:20, marginBottom:20, border:'1px solid rgba(255,255,255,0.07)', flexWrap:'wrap' },
  avatarWrap: { position:'relative', flexShrink:0 },
  avatarImg: { width:80, height:80, borderRadius:'50%', objectFit:'cover', position:'relative', zIndex:1, border:'2px solid rgba(200,151,58,0.3)' },
  avatar   : { width:80, height:80, borderRadius:'50%', background:'#c8973a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'#000', position:'relative', zIndex:1 },
  avatarRing:{ position:'absolute', inset:-4, borderRadius:'50%', border:'2px solid rgba(200,151,58,0.3)' },
  topInfo  : { flex:1 },
  titleLabel:{ color:'#c8973a', fontSize:13, fontWeight:700, marginLeft:8 },
  name     : { color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 4px' },
  email    : { color:'rgba(255,255,255,0.45)', fontSize:13, margin:'0 0 4px' },
  dept     : { color:'rgba(255,255,255,0.35)', fontSize:12, margin:'0 0 10px' },
  badges   : { display:'flex', gap:8, flexWrap:'wrap' },
  badgeInstructor: { background:'rgba(200,151,58,0.15)', color:'#c8973a', border:'1px solid rgba(200,151,58,0.3)', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 },
  badgeStudent   : { background:'rgba(0,200,150,0.15)', color:'#00c896', border:'1px solid rgba(0,200,150,0.3)', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 },
  badgeAdmin     : { background:'rgba(100,100,255,0.15)', color:'#8888ff', border:'1px solid rgba(100,100,255,0.3)', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 },
  dashBtn  : { background:'rgba(200,151,58,0.12)', color:'#c8973a', border:'1px solid rgba(200,151,58,0.25)', borderRadius:10, padding:'10px 18px', cursor:'pointer', fontWeight:700, fontSize:13, whiteSpace:'nowrap' },

  grid     : { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12, marginBottom:20 },
  infoCard : { background:'#1a1a2e', borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, border:'1px solid rgba(255,255,255,0.06)' },
  infoCardHighlight: { border:'1px solid rgba(200,151,58,0.2)', background:'rgba(200,151,58,0.04)' },
  infoIcon : { fontSize:20, flexShrink:0 },
  infoLabel: { color:'rgba(255,255,255,0.35)', fontSize:10, textTransform:'uppercase', letterSpacing:1, margin:'0 0 3px', fontWeight:600 },
  infoValue: { color:'#fff', fontSize:14, fontWeight:600, margin:0 },

  instructorCard: { background:'#1a1a2e', borderRadius:16, padding:'22px', marginBottom:20, border:'1px solid rgba(255,255,255,0.07)' },
  cardHeaderRow : { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  sectionTitle  : { color:'#fff', fontSize:17, fontWeight:700, margin:0 },
  bio           : { color:'rgba(255,255,255,0.6)', lineHeight:1.8, margin:'0 0 16px', fontSize:14 },
  errMsg        : { color:'#e94560', fontSize:13, background:'rgba(233,69,96,0.08)', border:'1px solid rgba(233,69,96,0.2)', borderRadius:8, padding:'8px 12px', marginBottom:12 },

  profileGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginBottom:16 },
  profileItem: { display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'10px 12px', border:'1px solid rgba(255,255,255,0.05)' },
  profileItemIcon : { fontSize:18, flexShrink:0 },
  profileItemLabel: { color:'rgba(255,255,255,0.35)', fontSize:10, textTransform:'uppercase', letterSpacing:1, margin:'0 0 2px' },
  profileItemValue: { color:'#fff', fontSize:13, fontWeight:600, margin:0 },

  linksRow  : { display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 },
  socialLink: { display:'inline-block', padding:'5px 12px', borderRadius:6, border:'1px solid', fontSize:12, fontWeight:700, textDecoration:'none' },

  editGrid  : { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
  editBtn   : { padding:'7px 14px', borderRadius:8, border:'none', background:'rgba(255,255,255,0.1)', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 },
  fieldLabel: { color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600 },
  input     : { width:'100%', padding:'9px 12px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:13, boxSizing:'border-box', outline:'none', fontFamily:'inherit' },
  fileInput : { color:'rgba(255,255,255,0.6)', fontSize:12 },

  actions      : { display:'flex', gap:12, flexWrap:'wrap' },
  actionBtn    : { flex:1, minWidth:140, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.8)', cursor:'pointer', fontSize:13, fontWeight:600 },
  actionBtnAccent: { background:'rgba(200,151,58,0.12)', color:'#c8973a', border:'1px solid rgba(200,151,58,0.25)' },
};

if (typeof document !== 'undefined' && !document.getElementById('pr-spin')) {
  const st = document.createElement('style');
  st.id = 'pr-spin';
  st.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}

export default Profile;