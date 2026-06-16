// src/pages/MagicLogin.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function MagicLogin() {
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); return; }

    api.post('/accounts/magic-login/', { token })
      .then(res => {
        const { access, refresh, user } = res.data;
        // ✅ حفظ الـ tokens — المدرس دلوقتي logged in
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        setStatus('success');
        // انتظر ثانيتين عشان يشوف رسالة الترحيب، بعدين روح للـ dashboard
        setTimeout(() => navigate('/dashboard/instructor'), 2000);
      })
      .catch(() => setStatus('error'));
  }, [navigate, searchParams]);

  return (
    <div style={s.page}>
      <div style={s.card}>
        {status === 'loading' && (
          <>
            <div style={s.spinner} />
            <p style={s.text}>جاري التحقق من الرابط...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={s.successIcon}>🎉</div>
            <h2 style={s.title}>تم تفعيل حسابك!</h2>
            <p style={s.text}>أهلاً وسهلاً بك في منصتنا التعليمية 🎓</p>
            <p style={s.sub}>جاري تحويلك للوحة التحكم...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={s.errorIcon}>❌</div>
            <h2 style={s.title}>الرابط غير صالح</h2>
            <p style={s.text}>هذا الرابط منتهي الصلاحية أو تم استخدامه من قبل.</p>
            <button style={s.btn} onClick={() => navigate('/login')}>
              الذهاب لصفحة تسجيل الدخول
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page      : { minHeight: '100vh', background: '#0f0f1a', display: 'flex',
                alignItems: 'center', justifyContent: 'center' },
  card      : { background: '#1a1a2e', borderRadius: 20, padding: '48px 40px',
                textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)',
                maxWidth: 400, width: '90%', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 16 },
  spinner   : { width: 48, height: 48, border: '4px solid rgba(200,151,58,0.2)',
                borderTop: '4px solid #c8973a', borderRadius: '50%',
                animation: 'spin 1s linear infinite' },
  successIcon: { fontSize: 64 },
  errorIcon : { fontSize: 64 },
  title     : { margin: 0, color: '#fff', fontSize: 24, fontWeight: 800 },
  text      : { margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6 },
  sub       : { margin: 0, color: '#c8973a', fontSize: 13 },
  btn       : { marginTop: 8, padding: '12px 28px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#c8973a,#a07020)',
                color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
};