// src/pages/CreateCourse.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '../services/courses';
import axios from 'axios';
import api from '../services/api';
import './CreateCourse.css';

// ─── helpers ─────────────────────────────────────────────────────────────────
const emptySection = () => ({ id: Date.now(), title: '', description: '', order: 0, lectures: [] });
const emptyLecture = (sId) => ({
  id: Date.now() + Math.random(),
  sectionLocalId: sId,
  title: '', description: '',
  video_type: 'upload',
  video_url: '', file: null, s3_key: '',
  duration_minutes: 0, order: 0,
  is_free_preview: false,
  uploadProgress: 0,
  uploadStatus: '', // '' | 'uploading' | 'done' | 'error'
});

// ─── Video Type Selector ──────────────────────────────────────────────────────
const VideoTypeSelector = ({ value, onChange }) => {
  const options = [
    { value: 'upload',  label: 'رفع فيديو',  icon: '☁️', desc: 'S3 Upload' },
    { value: 'youtube', label: 'YouTube',     icon: '▶',  desc: 'رابط YouTube' },
    { value: 'vimeo',   label: 'Vimeo',       icon: '▶',  desc: 'رابط Vimeo' },
  ];
  return (
    <div className="video-type-selector">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`vt-option ${value === o.value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          <span className="vt-icon">{o.icon}</span>
          <span className="vt-label">{o.label}</span>
          <span className="vt-desc">{o.desc}</span>
        </button>
      ))}
    </div>
  );
};

// ─── component ────────────────────────────────────────────────────────────────
const CreateCourse = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [courseData, setCourseData] = useState({ title: '', description: '', price: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [sections, setSections] = useState([emptySection()]);
  const [submitting, setSubmitting] = useState(false);

  if (!user || !user.is_instructor) {
    alert('فقط المدرّسين يمكنهم إنشاء كورسات');
    navigate('/');
    return null;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCourseChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setCourseData((p) => ({ ...p, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setCourseData((p) => ({ ...p, [name]: value }));
    }
  };

  const addSection    = () => setSections((p) => [...p, { ...emptySection(), order: p.length }]);
  const removeSection = (id) => setSections((p) => p.filter((s) => s.id !== id));
  const updateSection = (id, field, val) =>
    setSections((p) => p.map((s) => s.id === id ? { ...s, [field]: val } : s));

  const addLecture    = (sId) =>
    setSections((p) => p.map((s) => s.id === sId
      ? { ...s, lectures: [...s.lectures, { ...emptyLecture(sId), order: s.lectures.length }] }
      : s));
  const removeLecture = (sId, lId) =>
    setSections((p) => p.map((s) => s.id === sId
      ? { ...s, lectures: s.lectures.filter((l) => l.id !== lId) }
      : s));
  const updateLecture = (sId, lId, field, val) =>
    setSections((p) => p.map((s) => s.id === sId
      ? { ...s, lectures: s.lectures.map((l) => l.id === lId ? { ...l, [field]: val } : l) }
      : s));

  // ── S3 upload ─────────────────────────────────────────────────────────────
  const uploadVideoToS3 = async (sId, lId, file) => {
    updateLecture(sId, lId, 'uploadStatus', 'uploading');
    updateLecture(sId, lId, 'uploadProgress', 0);
    try {
      const { data } = await api.post('/courses/lectures/presigned-upload/', {
        file_name: file.name,
        file_type: file.type,
      });
      await axios.put(data.upload_url, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (e) =>
          updateLecture(sId, lId, 'uploadProgress', Math.round((e.loaded / e.total) * 100)),
      });
      updateLecture(sId, lId, 's3_key', data.s3_key);
      updateLecture(sId, lId, 'uploadStatus', 'done');
    } catch (err) {
      console.error('S3 upload failed', err);
      updateLecture(sId, lId, 'uploadStatus', 'error');
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', courseData.title);
      fd.append('description', courseData.description);
      fd.append('price', courseData.price);
      if (courseData.image) fd.append('image', courseData.image);

      const courseRes = await coursesService.create(fd);
      const courseId  = courseRes.id;

      for (let si = 0; si < sections.length; si++) {
        const sec    = sections[si];
        const secRes = await api.post('/courses/sections/', {
          course: courseId, title: sec.title, description: sec.description, order: si,
        });
        const sectionId = secRes.data.id;

        for (let li = 0; li < sec.lectures.length; li++) {
          const lec = sec.lectures[li];
          if (lec.video_type === 'upload' && !lec.s3_key) {
            alert(`الليكتشر "${lec.title}" لسه ما اترفعش على S3`);
            setSubmitting(false);
            return;
          }
          await api.post('/courses/lectures/', {
            section: sectionId,
            title: lec.title, description: lec.description,
            video_type: lec.video_type,
            video_url: lec.video_type !== 'upload' ? lec.video_url : '',
            s3_key:    lec.video_type === 'upload'  ? lec.s3_key   : '',
            duration_minutes: lec.duration_minutes,
            order: li, is_free_preview: lec.is_free_preview,
          });
        }
      }
      alert('تم إنشاء الكورس بنجاح! في انتظار موافقة الأدمن.');
      navigate('/courses');
    } catch (err) {
      alert('فشل إنشاء الكورس: ' + (err.response?.data?.detail || 'حدث خطأ'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="cc-page">
      <div className="cc-container">

        {/* Page Title */}
        <div className="cc-page-header">
          <h1 className="cc-title">إنشاء كورس جديد</h1>
          <p className="cc-subtitle">أضف محتواك التعليمي وانتظر موافقة الأدمن</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Course Info ──────────────────────────────────────────── */}
          <div className="cc-card">
            <div className="cc-card-header">
              <span className="cc-card-icon">📋</span>
              <h2>معلومات الكورس</h2>
            </div>

            <div className="cc-field">
              <label>عنوان الكورس <span className="req">*</span></label>
              <input
                className="cc-input"
                name="title"
                value={courseData.title}
                onChange={handleCourseChange}
                placeholder="مثال: كورس React من الصفر للاحتراف"
                required
              />
            </div>

            <div className="cc-field">
              <label>وصف الكورس <span className="req">*</span></label>
              <textarea
                className="cc-input cc-textarea"
                name="description"
                value={courseData.description}
                onChange={handleCourseChange}
                placeholder="اوصف محتوى الكورس وما سيتعلمه الطلاب..."
                required
              />
            </div>

            <div className="cc-field-row">
              <div className="cc-field">
                <label>السعر (EGP) <span className="req">*</span></label>
                <input
                  className="cc-input"
                  type="number"
                  name="price"
                  value={courseData.price}
                  onChange={handleCourseChange}
                  min="0" step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="cc-field">
                <label>صورة الغلاف</label>
                <div className="cc-image-upload">
                  {imagePreview ? (
                    <div className="image-preview-wrap">
                      <img src={imagePreview} alt="preview" className="image-preview" />
                      <label className="image-change-btn">
                        تغيير الصورة
                        <input type="file" name="image" accept="image/*"
                          onChange={handleCourseChange} hidden />
                      </label>
                    </div>
                  ) : (
                    <label className="image-drop-zone">
                      <span className="drop-icon">🖼️</span>
                      <span className="drop-text">اختر صورة الغلاف</span>
                      <span className="drop-hint">PNG, JPG حتى 5MB</span>
                      <input type="file" name="image" accept="image/*"
                        onChange={handleCourseChange} hidden />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Sections ─────────────────────────────────────────────── */}
          <div className="cc-card">
            <div className="cc-card-header">
              <span className="cc-card-icon">📚</span>
              <h2>الأقسام والليكتشرات</h2>
              <button type="button" className="cc-btn-add-section" onClick={addSection}>
                + قسم جديد
              </button>
            </div>

            {sections.map((sec, si) => (
              <div key={sec.id} className="cc-section">

                {/* Section Header */}
                <div className="cc-section-header">
                  <div className="section-num">القسم {si + 1}</div>
                  <div className="cc-section-fields">
                    <input
                      className="cc-input"
                      value={sec.title}
                      onChange={(e) => updateSection(sec.id, 'title', e.target.value)}
                      placeholder="عنوان القسم"
                      required
                    />
                    <input
                      className="cc-input"
                      value={sec.description}
                      onChange={(e) => updateSection(sec.id, 'description', e.target.value)}
                      placeholder="وصف القسم (اختياري)"
                    />
                  </div>
                  {sections.length > 1 && (
                    <button type="button" className="cc-btn-remove" onClick={() => removeSection(sec.id)}>
                      🗑
                    </button>
                  )}
                </div>

                {/* Lectures */}
                <div className="cc-lectures">
                  {sec.lectures.map((lec, li) => (
                    <div key={lec.id} className="cc-lecture">
                      <div className="cc-lecture-header">
                        <span className="lec-num">#{li + 1}</span>
                        <input
                          className="cc-input lec-title-input"
                          value={lec.title}
                          onChange={(e) => updateLecture(sec.id, lec.id, 'title', e.target.value)}
                          placeholder="عنوان الليكتشر"
                          required
                        />
                        <button type="button" className="cc-btn-remove"
                          onClick={() => removeLecture(sec.id, lec.id)}>🗑</button>
                      </div>

                      {/* Video Type Picker */}
                      <div className="cc-field">
                        <label className="cc-field-label">نوع المحتوى</label>
                        <VideoTypeSelector
                          value={lec.video_type}
                          onChange={(v) => updateLecture(sec.id, lec.id, 'video_type', v)}
                        />
                      </div>

                      {/* Upload or URL */}
                      {lec.video_type === 'upload' ? (
                        <div className="cc-field">
                          <label className="cc-field-label">ملف الفيديو</label>
                          <div className="upload-zone">
                            {lec.uploadStatus === 'done' ? (
                              <div className="upload-done">
                                <span>✅</span>
                                <span>تم الرفع بنجاح — في انتظار موافقة الأدمن</span>
                                <label className="re-upload-link">
                                  رفع مجدداً
                                  <input type="file" accept="video/*" hidden
                                    onChange={(e) => updateLecture(sec.id, lec.id, 'file', e.target.files[0])} />
                                </label>
                              </div>
                            ) : lec.uploadStatus === 'uploading' ? (
                              <div className="upload-progress-wrap">
                                <div className="upload-progress-info">
                                  <span>جاري الرفع...</span>
                                  <span>{lec.uploadProgress}%</span>
                                </div>
                                <div className="upload-progress-bar">
                                  <div className="upload-progress-fill" style={{ width: `${lec.uploadProgress}%` }} />
                                </div>
                              </div>
                            ) : (
                              <>
                                <label className="file-drop-label">
                                  <span className="drop-icon">🎬</span>
                                  <span>{lec.file ? lec.file.name : 'اختر ملف فيديو'}</span>
                                  <span className="drop-hint">MP4, MOV, AVI</span>
                                  <input type="file" accept="video/*" hidden
                                    onChange={(e) => updateLecture(sec.id, lec.id, 'file', e.target.files[0])} />
                                </label>
                                {lec.file && (
                                  <button type="button" className="btn-upload-s3"
                                    onClick={() => uploadVideoToS3(sec.id, lec.id, lec.file)}>
                                    ⬆ ارفع على S3
                                  </button>
                                )}
                                {lec.uploadStatus === 'error' && (
                                  <p className="upload-error">❌ فشل الرفع، حاول مرة تانية</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="cc-field">
                          <label className="cc-field-label">
                            {lec.video_type === 'youtube' ? '🔴 رابط YouTube' : '🔵 رابط Vimeo'}
                          </label>
                          <input
                            className="cc-input"
                            type="url"
                            placeholder={lec.video_type === 'youtube'
                              ? 'https://youtube.com/watch?v=...'
                              : 'https://vimeo.com/...'}
                            value={lec.video_url}
                            onChange={(e) => updateLecture(sec.id, lec.id, 'video_url', e.target.value)}
                          />
                        </div>
                      )}

                      {/* Duration + Free Preview */}
                      <div className="cc-lecture-footer">
                        <div className="cc-field inline">
                          <label className="cc-field-label">المدة</label>
                          <div className="duration-input-wrap">
                            <input
                              className="cc-input duration-input"
                              type="number" min="0"
                              value={lec.duration_minutes}
                              onChange={(e) => updateLecture(sec.id, lec.id, 'duration_minutes', +e.target.value)}
                            />
                            <span className="duration-unit">دقيقة</span>
                          </div>
                        </div>

                        <label className="free-preview-toggle">
                          <div className={`toggle-switch ${lec.is_free_preview ? 'on' : ''}`}
                            onClick={() => updateLecture(sec.id, lec.id, 'is_free_preview', !lec.is_free_preview)}>
                            <div className="toggle-thumb" />
                          </div>
                          <span>معاينة مجانية</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="cc-btn-add-lecture"
                    onClick={() => addLecture(sec.id)}>
                    + ليكتشر جديد
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="cc-submit-row">
            <button type="button" className="cc-btn-cancel" onClick={() => navigate(-1)}>
              إلغاء
            </button>
            <button type="submit" className="cc-btn-submit" disabled={submitting}>
              {submitting ? (
                <><span className="btn-spinner" /> جاري الإنشاء...</>
              ) : (
                '🚀 إنشاء الكورس'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateCourse;