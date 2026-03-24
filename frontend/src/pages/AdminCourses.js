// src/pages/AdminCourses.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { adminService } from '../services/admin';
import './AdminCourses.css';

// ─── Course Preview Modal ─────────────────────────────────────────────────────
const CoursePreviewModal = ({ course, onClose }) => {
  if (!course) return null;

  const statusLabel = (st) =>
    st === 'approved' ? '✓ معتمد' : st === 'rejected' ? '✗ مرفوض' : '⏳ معلق';

  const videoIcon = (type) =>
    type === 'youtube' ? '▶ YT' : type === 'vimeo' ? '▶ VM' : '🎬';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">📋</span>
            <h3>{course.title}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {course.image_url && (
            <img src={course.image_url} alt={course.title} className="modal-cover" />
          )}

          <div className="modal-meta-grid">
            <div className="meta-item">
              <span className="meta-label">المدرس</span>
              <span className="meta-value">{course.instructor_name || course.instructor_email}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">السعر</span>
              <span className="meta-value accent">{course.price} EGP</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">الأقسام</span>
              <span className="meta-value">{course.total_sections}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">الليكتشرات</span>
              <span className="meta-value">{course.total_lectures}</span>
            </div>
          </div>

          {course.description && (
            <div className="modal-desc">
              <span className="meta-label">الوصف</span>
              <p>{course.description}</p>
            </div>
          )}

          {course.sections?.length > 0 ? (
            <div className="modal-sections">
              <h4 className="sections-title">محتوى الكورس</h4>
              {course.sections.map((sec, si) => (
                <div key={sec.id} className="preview-section">
                  <div className="preview-section-header">
                    <span>القسم {si + 1}: <strong>{sec.title}</strong></span>
                    <span className="lec-count-badge">{sec.lectures?.length || 0} ليكتشر</span>
                  </div>
                  {sec.description && <p className="sec-desc">{sec.description}</p>}
                  {sec.lectures?.map((lec) => (
                    <div key={lec.id} className="preview-lecture-row">
                      <span className="lec-type-tag">{videoIcon(lec.video_type)}</span>
                      <span className="lec-title">{lec.title}</span>
                      <span className={`lec-status ${lec.video_status}`}>
                        {statusLabel(lec.video_status)}
                      </span>
                      {lec.duration_minutes > 0 && (
                        <span className="lec-duration">{lec.duration_minutes} د</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-msg">لا يوجد أقسام بعد</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Pending Courses Tab ──────────────────────────────────────────────────────
const PendingCoursesTab = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    api.get('/courses/admin/courses/pending/')
      .then((res) => setCourses(res.data.results ?? res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadPreview = async (courseId) => {
    try {
      const res = await api.get(`/courses/${courseId}/`);
      setPreview(res.data);
    } catch { alert('فشل تحميل المعاينة'); }
  };

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      await adminService.approveCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (preview?.id === id) setPreview(null);
    } catch { alert('فشل الموافقة'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '-reject');
    try {
      await adminService.rejectCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (preview?.id === id) setPreview(null);
    } catch { alert('فشل الرفض'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <div className="admin-loading"><div className="spinner" />جاري التحميل...</div>;
  if (!courses.length) return (
    <div className="admin-empty">
      <span>🎉</span>
      <p>لا يوجد كورسات معلّقة</p>
    </div>
  );

  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الكورس</th>
              <th>المُدرّس</th>
              <th>السعر</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="course-title-cell">
                    {c.image_url && <img src={c.image_url} alt="" className="course-thumb" />}
                    <span>{c.title}</span>
                  </div>
                </td>
                <td className="muted">{c.instructor_name || c.instructor_email}</td>
                <td><span className="price-tag">{c.price} EGP</span></td>
                <td>
                  <div className="action-btns">
                    <button className="btn-preview" onClick={() => loadPreview(c.id)}>
                      👁 معاينة
                    </button>
                    <button
                      className="btn-approve"
                      disabled={actionLoading === c.id + '-approve'}
                      onClick={() => handleApprove(c.id)}
                    >
                      {actionLoading === c.id + '-approve' ? '...' : '✔ موافقة'}
                    </button>
                    <button
                      className="btn-reject"
                      disabled={actionLoading === c.id + '-reject'}
                      onClick={() => handleReject(c.id)}
                    >
                      {actionLoading === c.id + '-reject' ? '...' : '✖ رفض'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {preview && <CoursePreviewModal course={preview} onClose={() => setPreview(null)} />}
    </>
  );
};

// ─── Pending Lectures Tab ─────────────────────────────────────────────────────
const PendingLecturesTab = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    api.get('/courses/admin/lectures/pending/')
      .then((res) => setLectures(res.data.results ?? res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + '-' + action);
    try {
      await api.patch(`/courses/admin/lectures/${id}/approve/`, { action });
      setLectures((prev) => prev.filter((l) => l.id !== id));
    } catch { alert('فشل الإجراء'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <div className="admin-loading"><div className="spinner" />جاري التحميل...</div>;
  if (!lectures.length) return (
    <div className="admin-empty">
      <span>🎉</span>
      <p>لا يوجد فيديوهات معلّقة</p>
    </div>
  );

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>الليكتشر</th>
            <th>الكورس</th>
            <th>النوع</th>
            <th>S3 Key / URL</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {lectures.map((l) => (
            <tr key={l.id}>
              <td className="lec-name">{l.title}</td>
              <td className="muted">{l.course?.title}</td>
              <td>
                <span className={`video-type-badge ${l.video_type}`}>
                  {l.video_type === 'youtube' ? '▶ YouTube'
                    : l.video_type === 'vimeo' ? '▶ Vimeo'
                    : '🎬 S3'}
                </span>
              </td>
              <td>
                <code className="s3-key">{l.s3_key || l.video_url || '—'}</code>
              </td>
              <td>
                <div className="action-btns">
                  <button
                    className="btn-approve"
                    disabled={actionLoading === l.id + '-approve'}
                    onClick={() => handleAction(l.id, 'approve')}
                  >
                    {actionLoading === l.id + '-approve' ? '...' : '✔ موافقة'}
                  </button>
                  <button
                    className="btn-reject"
                    disabled={actionLoading === l.id + '-reject'}
                    onClick={() => handleAction(l.id, 'reject')}
                  >
                    {actionLoading === l.id + '-reject' ? '...' : '✖ رفض'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminCourses = () => {
  const [tab, setTab] = useState('courses');

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Page Title */}
        <div className="admin-page-header">
          <div className="admin-title-group">
            <span className="admin-shield">🛡️</span>
            <div>
              <h1 className="admin-title">لوحة الأدمن</h1>
              <p className="admin-subtitle">إدارة ومراجعة الكورسات والمحتوى</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === 'courses' ? 'active' : ''}`}
            onClick={() => setTab('courses')}
          >
            <span>📚</span> كورسات معلّقة
          </button>
          <button
            className={`admin-tab ${tab === 'lectures' ? 'active' : ''}`}
            onClick={() => setTab('lectures')}
          >
            <span>🎬</span> فيديوهات معلّقة
          </button>
        </div>

        {/* Content */}
        <div className="admin-content">
          {tab === 'courses'  && <PendingCoursesTab />}
          {tab === 'lectures' && <PendingLecturesTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;