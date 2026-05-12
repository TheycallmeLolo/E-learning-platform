// src/pages/CreateExperience.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { experiencesService } from '../services/experiences';
import './CreateCourse.css'; // نفس الـ CSS

const CreateExperience = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [form, setForm] = useState({
    title             : '',
    description       : '',
    price             : '',
    discount_price    : '',
    instructor_cut    : '70',
    college_cut       : '30',
    preview_video_url : '',
    content_video_url : '',
    image             : null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [errors, setErrors]             = useState({});

  if (!user?.is_instructor) { navigate('/'); return null; }

  const handle = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(p => ({ ...p, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      if (name === 'instructor_cut') {
        const ic = parseFloat(value) || 0;
        setForm(p => ({ ...p, instructor_cut: value, college_cut: String(100 - ic) }));
      } else {
        setForm(p => ({ ...p, [name]: value }));
      }
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())  e.title = 'أدخل عنوان التجربة';
    if (!form.price)         e.price = 'أدخل السعر';
    if (parseFloat(form.price) < 0) e.price = 'السعر لا يمكن أن يكون سالباً';
    if (form.discount_price && parseFloat(form.discount_price) >= parseFloat(form.price))
      e.discount_price = 'سعر الخصم يجب أن يكون أقل من السعر الأصلي';
    const ic = parseFloat(form.instructor_cut) || 0;
    const cc = parseFloat(form.college_cut)    || 0;
    if (ic + cc !== 100) e.instructor_cut = 'مجموع النسب يجب أن يساوي 100%';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title',          form.title);
      fd.append('description',    form.description);
      fd.append('price',          form.price);
      fd.append('instructor_cut', form.instructor_cut);
      fd.append('college_cut',    form.college_cut);
      if (form.discount_price)       fd.append('discount_price',    form.discount_price);
      if (form.preview_video_url)    fd.append('preview_video_url', form.preview_video_url);
      if (form.content_video_url)    fd.append('content_video_url', form.content_video_url);
      if (form.image)                fd.append('image',             form.image);

      await experiencesService.create(fd);
      alert('✅ تم الإرسال! في انتظار موافقة الأدمن.');
      navigate('/experiences');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') setErrors(data);
      else alert('حدث خطأ: ' + (err.response?.data?.detail || 'حاول مرة أخرى'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cc-page">
      <div className="cc-container">

        <div className="cc-page-header">
          <h1 className="cc-title">إنشاء تجربة جديدة 🧪</h1>
          <p className="cc-subtitle">ستُرسل للأدمن للمراجعة والاعتماد قبل النشر</p>
        </div>

        <form onSubmit={submit}>

          {/* ── معلومات أساسية ── */}
          <div className="cc-card">
            <div className="cc-card-header">
              <span className="cc-card-icon">📋</span>
              <h2>المعلومات الأساسية</h2>
            </div>

            <div className="cc-field">
              <label>عنوان التجربة <span className="req">*</span></label>
              <input className="cc-input" name="title" value={form.title}
                onChange={handle} placeholder="مثال: حل تمارين الـ Recursion" />
              {errors.title && <p style={err}>⚠ {errors.title}</p>}
            </div>

            <div className="cc-field">
              <label>وصف التجربة</label>
              <textarea className="cc-input cc-textarea" name="description"
                value={form.description} onChange={handle}
                placeholder="اشرح ما سيستفيد منه الطالب..." />
            </div>

            {/* Image */}
            <div className="cc-field">
              <label>صورة الغلاف</label>
              <div className="cc-image-upload">
                {imagePreview
                  ? <div className="image-preview-wrap">
                      <img src={imagePreview} alt="preview" className="image-preview" />
                      <label className="image-change-btn">
                        تغيير الصورة
                        <input type="file" name="image" accept="image/*" onChange={handle} hidden />
                      </label>
                    </div>
                  : <label className="image-drop-zone">
                      <span className="drop-icon">🖼️</span>
                      <span className="drop-text">اختر صورة الغلاف</span>
                      <span className="drop-hint">PNG, JPG حتى 5MB</span>
                      <input type="file" name="image" accept="image/*" onChange={handle} hidden />
                    </label>
                }
              </div>
            </div>
          </div>

          {/* ── الفيديوهات ── */}
          <div className="cc-card">
            <div className="cc-card-header">
              <span className="cc-card-icon">🎬</span>
              <h2>الفيديوهات</h2>
            </div>

            <div className="cc-field">
              <label>🆓 فيديو المعاينة المجاني (اختياري)</label>
              <input className="cc-input" name="preview_video_url"
                value={form.preview_video_url} onChange={handle}
                placeholder="https://youtube.com/embed/... — يشوفه الكل قبل الشراء" />
            </div>

            <div className="cc-field">
              <label>🔒 فيديو المحتوى الكامل <span className="req">*</span></label>
              <input className="cc-input" name="content_video_url"
                value={form.content_video_url} onChange={handle}
                placeholder="https://youtube.com/embed/... — للمشترين فقط بعد الموافقة" />
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, marginTop:4 }}>
                ⚠ لن يظهر إلا بعد موافقة الأدمن وإتمام الشراء
              </p>
            </div>
          </div>

          {/* ── التسعير ── */}
          <div className="cc-card">
            <div className="cc-card-header">
              <span className="cc-card-icon">💰</span>
              <h2>التسعير وتوزيع الأرباح</h2>
            </div>

            <div className="cc-field-row">
              <div className="cc-field">
                <label>السعر (EGP) <span className="req">*</span></label>
                <input className="cc-input" type="number" name="price"
                  value={form.price} onChange={handle} min="0" placeholder="0" />
                {errors.price && <p style={err}>⚠ {errors.price}</p>}
              </div>
              <div className="cc-field">
                <label>السعر بعد الخصم (اختياري)</label>
                <input className="cc-input" type="number" name="discount_price"
                  value={form.discount_price} onChange={handle} min="0"
                  placeholder="اتركه فارغاً لو مفيش خصم" />
                {errors.discount_price && <p style={err}>⚠ {errors.discount_price}</p>}
              </div>
            </div>

            {/* Revenue split */}
            <div className="cc-field">
              <label>توزيع الأرباح %</label>
              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                <div>
                  <label className="cc-field-label">حصة المدرس %</label>
                  <input className="cc-input duration-input" type="number"
                    name="instructor_cut" value={form.instructor_cut}
                    onChange={handle} min="0" max="100" style={{ width:100 }} />
                </div>
                <span style={{ color:'rgba(255,255,255,0.4)', fontSize:18, marginTop:16 }}>+</span>
                <div>
                  <label className="cc-field-label">حصة الكلية %</label>
                  <input className="cc-input" value={form.college_cut} readOnly
                    style={{ width:100, opacity:0.6 }} />
                </div>
                <span style={{ color:'#c8973a', fontWeight:700, marginTop:16 }}>= 100%</span>
              </div>
              {errors.instructor_cut && <p style={err}>⚠ {errors.instructor_cut}</p>}
            </div>
          </div>

          {/* ── Buttons ── */}
          <div className="cc-submit-row">
            <button type="button" className="cc-btn-cancel"
              onClick={() => navigate(-1)}>
              إلغاء
            </button>
            <button type="submit" className="cc-btn-submit" disabled={submitting}>
              {submitting
                ? <><span className="btn-spinner" /> جاري الإرسال...</>
                : '📤 إرسال للمراجعة'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

const err = { color:'#ef4444', fontSize:13, margin:'4px 0 0' };

export default CreateExperience;
