import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';
import PriceEditor from '../components/courses/PriceEditor';  // ✅ path صح

// ─── helpers ──────────────────────────────────────────────────────────────────
const newLectureForm = () => ({
  localId: Date.now() + Math.random(),
  title: '', description: '', video_type: 'upload',
  video_url: '', file: null, s3_key: '',
  duration_minutes: 0, is_free_preview: false,
  uploadStatus: '', uploadProgress: 0,
});

// ─── LectureForm ──────────────────────────────────────────────────────────────
const LectureForm = ({ sectionId, lectureCount, onSaved }) => {
  const [open, setOpen]     = useState(false);
  const [lec, setLec]       = useState(newLectureForm());
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const update = (field, value) => setLec(p => ({ ...p, [field]: value }));

  const uploadToS3 = async (file) => {
    update('uploadStatus', 'uploading'); update('uploadProgress', 0);
    try {
      const { data } = await api.post('/courses/lectures/presigned-upload/', {
        file_name: file.name, file_type: file.type,
      });
      await axios.put(data.upload_url, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: e => update('uploadProgress', Math.round((e.loaded/e.total)*100)),
      });
      update('s3_key', data.s3_key);
      update('uploadStatus', 'done');
    } catch { update('uploadStatus', 'error'); }
  };

  const handleSave = async () => {
    setErr('');
    if (!lec.title.trim())                          { setErr('عنوان الليكتشر مطلوب'); return; }
    if (lec.video_type === 'upload' && !lec.s3_key) { setErr('ارفع الفيديو على S3 الأول'); return; }
    if (lec.video_type !== 'upload' && !lec.video_url) { setErr('الرابط مطلوب'); return; }
    setSaving(true);
    try {
      await api.post('/courses/lectures/', {
        section: sectionId, title: lec.title, description: lec.description,
        video_type: lec.video_type,
        video_url: lec.video_type !== 'upload' ? lec.video_url : '',
        s3_key:    lec.video_type === 'upload'  ? lec.s3_key   : '',
        duration_minutes: lec.duration_minutes, order: lectureCount,
        is_free_preview: lec.is_free_preview,
      });
      setLec(newLectureForm()); setOpen(false); onSaved();
    } catch (e) { setErr('فشل الحفظ: ' + (e.response?.data?.detail || e.message)); }
    finally { setSaving(false); }
  };

  if (!open) return (
    <button style={s.btnAddLec} onClick={() => setOpen(true)}>+ إضافة ليكتشر</button>
  );

  return (
    <div style={s.lecForm}>
      <div style={s.rowBetween}>
        <strong style={{ fontSize:14, color:'rgba(255,255,255,0.9)' }}>ليكتشر جديد</strong>
        <button style={s.btnClose} onClick={() => { setOpen(false); setLec(newLectureForm()); }}>✕</button>
      </div>

      <label style={s.label}>عنوان الليكتشر *</label>
      <input style={s.input} value={lec.title} placeholder="مثال: مقدمة عن الوحدة"
        onChange={e => update('title', e.target.value)} />

      <label style={s.label}>نوع المحتوى</label>
      <select style={s.input} value={lec.video_type}
        onChange={e => update('video_type', e.target.value)}>
        <option value="upload">🎬 رفع فيديو على S3</option>
        <option value="youtube">▶ رابط YouTube</option>
        <option value="vimeo">▶ رابط Vimeo</option>
      </select>

      {lec.video_type === 'upload' ? (
        <div style={s.uploadBox}>
          {lec.uploadStatus !== 'done' && (
            <>
              <label style={s.label}>📁 اختر ملف الفيديو</label>
              <input type="file" accept="video/mp4,video/webm,video/quicktime"
                style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}
                onChange={e => { const f=e.target.files[0]; if(f) update('file',f); }} />
              {lec.file && (
                <div style={s.fileInfo}>
                  <span>📹 {lec.file.name}</span>
                  <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>
                    {(lec.file.size/1024/1024).toFixed(1)} MB
                  </span>
                </div>
              )}
              {lec.file && lec.uploadStatus === '' && (
                <button style={s.btnUpload} onClick={() => uploadToS3(lec.file)}>⬆ ارفع على S3</button>
              )}
            </>
          )}
          {lec.uploadStatus === 'uploading' && (
            <div style={{ marginTop:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4, color:'rgba(255,255,255,0.6)' }}>
                <span>⏳ جاري الرفع...</span><span>{lec.uploadProgress}%</span>
              </div>
              <div style={s.progressWrap}><div style={{ ...s.progressBar, width:`${lec.uploadProgress}%` }} /></div>
            </div>
          )}
          {lec.uploadStatus === 'done' && (
            <div style={s.uploadDone}>
              <span>✅ تم الرفع بنجاح</span>
              <button style={s.btnSmGray} onClick={() => { update('file',null); update('s3_key',''); update('uploadStatus',''); }}>🔄 تغيير</button>
            </div>
          )}
          {lec.uploadStatus === 'error' && (
            <><p style={{ color:'#e94560', fontSize:13 }}>❌ فشل الرفع</p>
            <button style={s.btnUpload} onClick={() => uploadToS3(lec.file)}>🔄 إعادة</button></>
          )}
        </div>
      ) : (
        <div>
          <label style={s.label}>{lec.video_type === 'youtube' ? '▶ رابط YouTube' : '▶ رابط Vimeo'}</label>
          <input style={s.input} type="url"
            placeholder={lec.video_type === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://vimeo.com/...'}
            value={lec.video_url} onChange={e => update('video_url', e.target.value)} />
        </div>
      )}

      <div style={{ display:'flex', gap:16, marginTop:8, alignItems:'flex-end' }}>
        <div>
          <label style={s.label}>المدة (دقيقة)</label>
          <input style={{ ...s.input, width:90 }} type="number" min="0"
            value={lec.duration_minutes} onChange={e => update('duration_minutes', +e.target.value)} />
        </div>
        <label style={{ cursor:'pointer', fontSize:14, paddingBottom:8, color:'rgba(255,255,255,0.7)' }}>
          <input type="checkbox" checked={lec.is_free_preview}
            onChange={e => update('is_free_preview', e.target.checked)} />
          {' '}معاينة مجانية
        </label>
      </div>

      {err && <p style={{ color:'#e94560', fontSize:13, marginTop:8 }}>⚠ {err}</p>}
      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <button style={s.btnSaveLec} onClick={handleSave} disabled={saving}>
          {saving ? '⏳...' : '💾 حفظ الليكتشر'}
        </button>
        <button style={s.btnCancelLec} onClick={() => { setOpen(false); setLec(newLectureForm()); }}>إلغاء</button>
      </div>
    </div>
  );
};

// ─── AddSectionForm ───────────────────────────────────────────────────────────
const AddSectionForm = ({ courseId, sectionCount, onSaved }) => {
  const [open, setOpen]     = useState(false);
  const [title, setTitle]   = useState('');
  const [desc, setDesc]     = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const handleSave = async () => {
    if (!title.trim()) { setErr('عنوان القسم مطلوب'); return; }
    setSaving(true);
    try {
      await api.post('/courses/sections/', { course: courseId, title, description: desc, order: sectionCount });
      setTitle(''); setDesc(''); setOpen(false); onSaved();
    } catch (e) { setErr('فشل الحفظ: ' + (e.response?.data?.detail || e.message)); }
    finally { setSaving(false); }
  };

  if (!open) return (
    <button style={s.btnAddSec} onClick={() => setOpen(true)}>+ إضافة قسم جديد</button>
  );

  return (
    <div style={s.secForm}>
      <div style={s.rowBetween}>
        <strong style={{ color:'rgba(255,255,255,0.9)' }}>قسم جديد</strong>
        <button style={s.btnClose} onClick={() => setOpen(false)}>✕</button>
      </div>
      <label style={s.label}>عنوان القسم *</label>
      <input style={s.input} value={title} placeholder="مثال: الوحدة الأولى"
        onChange={e => setTitle(e.target.value)} />
      <label style={s.label}>الوصف (اختياري)</label>
      <input style={s.input} value={desc} onChange={e => setDesc(e.target.value)} />
      {err && <p style={{ color:'#e94560', fontSize:13 }}>⚠ {err}</p>}
      <div style={{ display:'flex', gap:8, marginTop:10 }}>
        <button style={s.btnSaveLec} onClick={handleSave} disabled={saving}>
          {saving ? '⏳...' : '💾 حفظ القسم'}
        </button>
        <button style={s.btnCancelLec} onClick={() => setOpen(false)}>إلغاء</button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ManageCourse = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState('');

  const loadCourse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${courseId}/`);
      setCourse(res.data);
    } catch { setErrMsg('تعذّر تحميل الكورس'); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  if (loading) return <div style={s.center}><div style={s.spinner} /></div>;
  if (!course)  return <div style={s.center}>❌ {errMsg}</div>;

  const sections = course.sections || [];

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* ── Header ── */}
        <div style={s.header}>
          <div style={{ flex:1 }}>
            <button style={s.btnBack} onClick={() => navigate(-1)}>← رجوع</button>
            <h2 style={{ margin:'8px 0 4px', color:'#fff' }}>⚙ إدارة الكورس</h2>
            <p style={{ color:'rgba(255,255,255,0.5)', margin:'0 0 10px' }}>📚 {course.title}</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={s.chip(course.is_approved)}>
                {course.is_approved ? '✓ معتمد' : '⏳ انتظار موافقة'}
              </span>
              <span style={s.chip(course.is_published)}>
                {course.is_published ? '🌐 منشور' : '🔒 غير منشور'}
              </span>
              {/* السعر الحالي */}
              <span style={s.priceChip}>
                {course.discount_price
                  ? <><s style={{ opacity:0.5 }}>{parseFloat(course.price).toFixed(0)}</s>
                    {' '}{parseFloat(course.discount_price).toFixed(0)} EGP</>
                  : `${parseFloat(course.price).toFixed(0)} EGP`
                }
              </span>
            </div>
          </div>
        </div>

        {/* ── PriceEditor ── */}
        <div style={s.priceSection}>
          <h3 style={s.sectionTitle}>💰 السعر والتخفيضات</h3>
          <PriceEditor course={course} onUpdated={loadCourse} />
        </div>

        {/* ── Sections ── */}
        <h3 style={s.sectionTitle}>📂 الأقسام والمحتوى</h3>

        {sections.length === 0 && (
          <div style={s.emptyBox}>
            <p style={{ color:'rgba(255,255,255,0.3)', margin:0 }}>لا يوجد أقسام بعد – أضف قسم الأول ⬇</p>
          </div>
        )}

        {sections.map((sec, si) => (
          <div key={sec.id} style={s.sectionCard}>
            <div style={s.secHeader}>
              <span style={{ fontWeight:700, color:'#fff' }}>📂 القسم {si+1}: {sec.title}</span>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>{sec.lectures?.length||0} ليكتشر</span>
            </div>

            {sec.lectures?.map(lec => (
              <div key={lec.id} style={s.lecRow}>
                <span style={{ fontSize:15 }}>{lec.video_type==='upload'?'🎬':'▶'}</span>
                <span style={{ flex:1, color:'rgba(255,255,255,0.8)', fontSize:14 }}>{lec.title}</span>
                {lec.duration_minutes > 0 && (
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>{lec.duration_minutes} د</span>
                )}
                <span style={s.statusBadge(lec.video_status)}>
                  {lec.video_status==='approved'?'✓ معتمد': lec.video_status==='rejected'?'✗ مرفوض':'⏳ معلق'}
                </span>
              </div>
            ))}

            <div style={{ padding:'0 12px 12px' }}>
              <LectureForm sectionId={sec.id} lectureCount={sec.lectures?.length||0} onSaved={loadCourse} />
            </div>
          </div>
        ))}

        <div style={s.addSecWrap}>
          <AddSectionForm courseId={courseId} sectionCount={sections.length} onSaved={loadCourse} />
        </div>

      </div>
    </div>
  );
};

// ─── Styles (dark theme) ──────────────────────────────────────────────────────
const s = {
  page:      { background:'#0f0f1a', minHeight:'100vh', padding:'30px 20px' },
  container: { maxWidth:800, margin:'0 auto' },
  center:    { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', background:'#0f0f1a' },
  spinner:   { width:40, height:40, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)',
               borderTopColor:'#e94560', animation:'spin 0.8s linear infinite' },

  header:    { background:'#1a1a2e', borderRadius:14, padding:20, marginBottom:16,
               border:'1px solid rgba(255,255,255,0.08)' },
  btnBack:   { background:'none', border:'none', color:'#e94560', cursor:'pointer', fontSize:14, padding:0 },
  chip: (on) => ({
    display:'inline-block', fontSize:12, padding:'3px 10px', borderRadius:20, fontWeight:600,
    background: on ? 'rgba(0,200,150,0.12)' : 'rgba(245,166,35,0.12)',
    color:      on ? '#00c896'              : '#f5a623',
    border:     `1px solid ${on ? 'rgba(0,200,150,0.25)' : 'rgba(245,166,35,0.25)'}`,
  }),
  priceChip: { display:'inline-block', fontSize:12, padding:'3px 10px', borderRadius:20,
               fontWeight:700, background:'rgba(233,69,96,0.1)', color:'#e94560',
               border:'1px solid rgba(233,69,96,0.25)' },

  priceSection: { background:'#1a1a2e', borderRadius:14, padding:20, marginBottom:16,
                  border:'1px solid rgba(255,255,255,0.08)' },
  sectionTitle: { color:'rgba(255,255,255,0.7)', fontSize:14, fontWeight:700,
                  letterSpacing:1, margin:'0 0 12px', textTransform:'uppercase' },

  emptyBox:   { background:'#1a1a2e', borderRadius:12, padding:30, textAlign:'center',
                marginBottom:16, border:'1px solid rgba(255,255,255,0.06)' },
  sectionCard:{ background:'#1a1a2e', borderRadius:12, marginBottom:12,
                border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' },
  secHeader:  { display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'13px 16px', background:'rgba(255,255,255,0.04)',
                borderBottom:'1px solid rgba(255,255,255,0.06)' },
  lecRow:     { display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
                borderBottom:'1px solid rgba(255,255,255,0.04)' },
  statusBadge:(st) => ({
    fontSize:11, padding:'2px 8px', borderRadius:10, fontWeight:600,
    background: st==='approved'?'rgba(0,200,150,0.12)': st==='rejected'?'rgba(233,69,96,0.12)':'rgba(245,166,35,0.12)',
    color:      st==='approved'?'#00c896': st==='rejected'?'#e94560':'#f5a623',
  }),
  addSecWrap: { background:'#1a1a2e', borderRadius:12, padding:20,
                border:'1px solid rgba(255,255,255,0.07)' },

  btnAddSec:  { background:'linear-gradient(135deg,#e94560,#c73652)', color:'#fff', border:'none',
                borderRadius:8, padding:'11px 20px', cursor:'pointer', fontWeight:700,
                fontSize:14, width:'100%', fontFamily:'Cairo,sans-serif' },
  btnAddLec:  { background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.7)',
                border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'8px 16px',
                cursor:'pointer', fontWeight:600, fontSize:13, width:'100%', marginTop:8,
                fontFamily:'Cairo,sans-serif' },
  lecForm:    { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:10, padding:14, marginTop:8 },
  secForm:    { background:'rgba(0,200,150,0.04)', border:'1px solid rgba(0,200,150,0.15)',
                borderRadius:10, padding:14 },
  rowBetween: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  label:      { display:'block', fontSize:13, fontWeight:500, marginBottom:4, marginTop:8,
                color:'rgba(255,255,255,0.55)' },
  input:      { width:'100%', padding:'9px 12px', borderRadius:6,
                background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                color:'#fff', fontSize:14, boxSizing:'border-box', fontFamily:'Cairo,sans-serif',
                outline:'none' },
  btnClose:   { background:'none', border:'none', fontSize:18, cursor:'pointer',
                color:'rgba(255,255,255,0.4)' },
  btnSaveLec: { background:'#28a745', color:'#fff', border:'none', borderRadius:6,
                padding:'8px 18px', cursor:'pointer', fontWeight:600, fontSize:13,
                fontFamily:'Cairo,sans-serif' },
  btnCancelLec:{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)',
                 border:'none', borderRadius:6, padding:'8px 14px', cursor:'pointer',
                 fontSize:13, fontFamily:'Cairo,sans-serif' },
  uploadBox:  { background:'rgba(255,255,255,0.03)', border:'1px dashed rgba(255,255,255,0.15)',
                borderRadius:8, padding:12, marginTop:8 },
  fileInfo:   { display:'flex', justifyContent:'space-between', background:'rgba(255,255,255,0.04)',
                borderRadius:6, padding:'6px 10px', marginTop:6, fontSize:13,
                border:'1px solid rgba(255,255,255,0.08)' },
  btnUpload:  { background:'#0066cc', color:'#fff', border:'none', borderRadius:6,
                padding:'9px 16px', cursor:'pointer', fontSize:13, marginTop:8,
                width:'100%', fontWeight:600, fontFamily:'Cairo,sans-serif' },
  btnSmGray:  { background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', border:'none',
                borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:12, marginRight:8 },
  uploadDone: { display:'flex', alignItems:'center', justifyContent:'space-between',
                background:'rgba(0,200,150,0.1)', borderRadius:6, padding:'8px 12px', marginTop:8,
                color:'#00c896', fontWeight:500, fontSize:13 },
  progressWrap:{ background:'rgba(255,255,255,0.08)', borderRadius:6, height:16, overflow:'hidden' },
  progressBar: { background:'#0066cc', height:'100%', transition:'width 0.3s' },
};

if (typeof document !== 'undefined' && !document.getElementById('mc-spin')) {
  const st = document.createElement('style');
  st.id = 'mc-spin';
  st.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}

export default ManageCourse;