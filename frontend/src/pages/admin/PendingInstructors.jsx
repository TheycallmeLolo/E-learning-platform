// src/pages/admin/PendingInstructors.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function PendingInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionId, setActionId]       = useState(null); // يعرف مين بيتعمله action
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject]   = useState(null); // id المدرس اللي بيتعمله reject

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts/admin/pending-instructors/');
      setInstructors(res.data.results || res.data);
    } catch {
      alert('فشل تحميل البيانات');
    } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await api.post(`/accounts/admin/instructors/${id}/approve/`);
      setInstructors(prev => prev.filter(i => i.id !== id));
      alert('✅ تم قبول المدرس وإرسال إيميل التفعيل');
    } catch {
      alert('فشل القبول');
    } finally { setActionId(null); }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await api.post(`/accounts/admin/instructors/${id}/reject/`, {
        reason: rejectReason,
      });
      setInstructors(prev => prev.filter(i => i.id !== id));
      setShowReject(null);
      setRejectReason('');
    } catch {
      alert('فشل الرفض');
    } finally { setActionId(null); }
  };

  if (loading) return <div style={s.center}>⏳ جاري التحميل...</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>🕐 المدرسون في انتظار الموافقة</h1>
        <span style={s.badge}>{instructors.length} طلب</span>
      </div>

      {instructors.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyIcon}>✅</p>
          <p style={s.emptyText}>لا يوجد طلبات معلقة</p>
        </div>
      ) : (
        <div style={s.grid}>
          {instructors.map(user => (
            <div key={user.id} style={s.card}>
              {/* Avatar */}
              <div style={s.avatarWrap}>
                {user.instructor_profile?.avatar
                  ? <img src={user.instructor_profile.avatar} alt="" style={s.avatar} />
                  : <div style={s.avatarFallback}>{user.first_name?.[0] || '?'}</div>
                }
              </div>

              {/* Info */}
              <div style={s.info}>
                <h3 style={s.name}>{user.first_name} {user.last_name}</h3>
                <p style={s.email}>{user.email}</p>
                {user.instructor_profile?.university && (
                  <p style={s.meta}>🏛️ {user.instructor_profile.university}</p>
                )}
                {user.instructor_profile?.department && (
                  <p style={s.meta}>📚 {user.instructor_profile.department}</p>
                )}
                {user.instructor_profile?.expertise && (
                  <p style={s.meta}>🔬 {user.instructor_profile.expertise}</p>
                )}
                {user.instructor_profile?.bio && (
                  <p style={s.bio}>{user.instructor_profile.bio}</p>
                )}
              </div>

              {/* CV */}
              {user.instructor_profile?.cv_file && (
                <a href={user.instructor_profile.cv_file} target="_blank"
                   rel="noreferrer" style={s.cvBtn}>
                  📄 عرض السيرة الذاتية
                </a>
              )}

              {/* Actions */}
              <div style={s.actions}>
                <button
                  style={s.approveBtn}
                  disabled={actionId === user.id}
                  onClick={() => handleApprove(user.id)}
                >
                  {actionId === user.id ? '⏳...' : '✅ قبول وإرسال إيميل التفعيل'}
                </button>
                <button
                  style={s.rejectBtn}
                  onClick={() => setShowReject(showReject === user.id ? null : user.id)}
                >
                  ❌ رفض
                </button>
              </div>

              {/* Reject reason */}
              {showReject === user.id && (
                <div style={s.rejectBox}>
                  <textarea
                    style={s.rejectInput}
                    placeholder="سبب الرفض (اختياري)..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={3}
                  />
                  <button
                    style={s.confirmReject}
                    disabled={actionId === user.id}
                    onClick={() => handleReject(user.id)}
                  >
                    {actionId === user.id ? '⏳...' : 'تأكيد الرفض'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page       : { padding: '32px', minHeight: '100vh', background: '#0f0f1a', color: '#fff' },
  header     : { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 },
  title      : { margin: 0, fontSize: 24, fontWeight: 800 },
  badge      : { background: '#c8973a', color: '#000', fontWeight: 700, fontSize: 13,
                 padding: '4px 12px', borderRadius: 20 },
  center     : { display: 'flex', alignItems: 'center', justifyContent: 'center',
                 height: '60vh', color: '#fff', fontSize: 18 },
  empty      : { textAlign: 'center', padding: '80px 0' },
  emptyIcon  : { fontSize: 48, margin: '0 0 16px' },
  emptyText  : { color: 'rgba(255,255,255,0.4)', fontSize: 18 },
  grid       : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))',
                 gap: 24 },
  card       : { background: '#1a1a2e', borderRadius: 16, padding: 24,
                 border: '1px solid rgba(255,255,255,0.08)', display: 'flex',
                 flexDirection: 'column', gap: 16 },
  avatarWrap : { display: 'flex', justifyContent: 'center' },
  avatar     : { width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
                 border: '3px solid #c8973a' },
  avatarFallback: { width: 80, height: 80, borderRadius: '50%', background: '#c8973a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, fontWeight: 800, color: '#000' },
  info       : { display: 'flex', flexDirection: 'column', gap: 6 },
  name       : { margin: 0, fontSize: 18, fontWeight: 700, textAlign: 'center' },
  email      : { margin: 0, color: '#c8973a', fontSize: 13, textAlign: 'center' },
  meta       : { margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  bio        : { margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: 12,
                 lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.06)',
                 paddingTop: 10 },
  cvBtn      : { display: 'block', textAlign: 'center', padding: '10px',
                 background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                 borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: 13 },
  actions    : { display: 'flex', gap: 10 },
  approveBtn : { flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                 background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                 color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  rejectBtn  : { padding: '12px 16px', borderRadius: 10,
                 border: '1px solid rgba(233,69,96,0.4)', background: 'transparent',
                 color: '#e94560', fontSize: 13, cursor: 'pointer' },
  rejectBox  : { display: 'flex', flexDirection: 'column', gap: 10,
                 background: 'rgba(233,69,96,0.06)', borderRadius: 10, padding: 14,
                 border: '1px solid rgba(233,69,96,0.2)' },
  rejectInput: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                 borderRadius: 8, color: '#fff', padding: 10, fontSize: 13, resize: 'vertical' },
  confirmReject: { padding: '10px', borderRadius: 8, border: 'none',
                   background: '#e94560', color: '#fff', fontWeight: 700,
                   fontSize: 13, cursor: 'pointer' },
};
