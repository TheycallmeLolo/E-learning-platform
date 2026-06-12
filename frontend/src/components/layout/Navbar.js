import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';

/* ─── Inject global styles once ─────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('nb-global')) {
  const st = document.createElement('style');
  st.id = 'nb-global';
  st.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

    @keyframes nb-fadeSlide {
      from { opacity:0; transform:translateY(-10px) scale(0.97); }
      to   { opacity:1; transform:translateY(0)    scale(1);    }
    }
    @keyframes nb-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes nb-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(233,69,96,0.4); }
      50%      { box-shadow: 0 0 0 6px rgba(233,69,96,0);  }
    }
    @keyframes nb-slideIn {
      from { opacity:0; transform:translateX(20px); }
      to   { opacity:1; transform:translateX(0);    }
    }

    .nb-link-item:hover { color:#fff !important; background: rgba(255,255,255,0.08) !important; }
    .nb-link-item:hover .nb-link-dot { opacity:1 !important; transform:scale(1) !important; }

    .nb-avatar-btn:hover { background: rgba(255,255,255,0.1) !important; border-color: rgba(233,69,96,0.4) !important; }
    .nb-login-btn:hover  { border-color: rgba(255,255,255,0.35) !important; color:#fff !important; background: rgba(255,255,255,0.05) !important; }
    .nb-reg-btn:hover    { transform:translateY(-1px) !important; box-shadow: 0 8px 24px rgba(233,69,96,0.45) !important; }

    .nb-drop-item:hover { background: rgba(255,255,255,0.06) !important; padding-right: 20px !important; }
    .nb-drop-danger:hover { background: rgba(233,69,96,0.1) !important; }
    .nb-drop-accent:hover { background: rgba(245,197,66,0.08) !important; }

    .nb-mobile-link:hover { background: rgba(255,255,255,0.05) !important; color:#fff !important; }

    @media (max-width: 820px) {
      .nb-desktop-links { display:none !important; }
      .nb-desktop-auth  { display:none !important; }
      .nb-burger        { display:flex !important; }
    }
  `;
  document.head.appendChild(st);
}

/* ══════════════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [user, setUser]         = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => { setUser(authService.getUserFromStorage()); }, [location.pathname]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location.pathname]);

  const handleLogout = () => { authService.logout(); setUser(null); navigate('/'); };
  const isActive = (p) => location.pathname === p;
  const initials = user
    ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')) || user.email?.[0]?.toUpperCase()
    : '';
  const dashPath = user?.is_instructor ? '/dashboard/instructor' : '/dashboard/student';

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      fontFamily: 'Cairo, sans-serif',
      background: scrolled
        ? 'rgba(8,8,18,0.97)'
        : 'rgba(8,8,18,0.75)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: scrolled
        ? '1px solid rgba(233,69,96,0.15)'
        : '1px solid rgba(255,255,255,0.05)',
      boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.6)' : 'none',
      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    }}>

      {/* Top accent line */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:2,
        background:'linear-gradient(90deg, transparent, #e94560 30%, #ff6b6b 50%, #e94560 70%, transparent)',
        backgroundSize:'200% auto',
        animation:'nb-shimmer 3s linear infinite',
        opacity: scrolled ? 1 : 0.5,
        transition:'opacity 0.4s',
      }}/>

      <div style={{
        maxWidth:1200, margin:'0 auto',
        display:'flex', alignItems:'center',
        padding:'0 24px', height:66, gap:28,
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#e94560 0%,#c73652 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18,
            boxShadow:'0 4px 16px rgba(233,69,96,0.4)',
            animation:'nb-pulse 3s ease-in-out infinite',
          }}>🎓</div>
          <div style={{ display:'flex', flexDirection:'column', lineHeight:1.1 }}>
            <span style={{ color:'#fff', fontSize:17, fontWeight:900, letterSpacing:-0.5 }}>
              Edu<span style={{
                background:'linear-gradient(135deg,#e94560,#ff8fa3)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>Platform</span>
            </span>
            <span style={{ color:'rgba(255,255,255,0.3)', fontSize:9, fontWeight:500, letterSpacing:2 }}>
              LEARN · GROW · SUCCEED
            </span>
          </div>
        </Link>

        {/* ── Desktop links ── */}
        <div className="nb-desktop-links" style={{ display:'flex', alignItems:'center', gap:2, flex:1 }}>
          <NavLink to="/"        active={isActive('/')}>الرئيسية</NavLink>
          <NavLink to="/courses" active={isActive('/courses')}>الكورسات</NavLink>
          {user?.is_instructor && (
            <NavLink to="/courses/create" active={isActive('/courses/create')} isNew>+ كورس جديد</NavLink>
          )}
          {user?.is_staff && (
            <Link to="/admin/courses" style={{
              display:'flex', alignItems:'center', gap:6,
              color:'#f5c542', textDecoration:'none', fontSize:13, fontWeight:700,
              padding:'6px 14px', borderRadius:8,
              background:'rgba(245,197,66,0.08)',
              border:'1px solid rgba(245,197,66,0.2)',
              transition:'all 0.2s',
            }}>
              <span>🛡</span><span>الأدمن</span>
            </Link>
          )}
        </div>

        {/* ── Desktop auth ── */}
        <div className="nb-desktop-auth" style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
          {user ? (
            <div style={{ position:'relative' }} ref={dropRef}>
              <button
                className="nb-avatar-btn"
                onClick={() => setDropOpen(!dropOpen)}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:12, padding:'5px 14px 5px 6px',
                  cursor:'pointer', transition:'all 0.2s',
                }}
              >
                <div style={{
                  width:34, height:34, borderRadius:10,
                  background:'linear-gradient(135deg,#e94560,#c73652)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:800, color:'#fff',
                  boxShadow:'0 4px 12px rgba(233,69,96,0.35)',
                }}>{initials}</div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
                  <span style={{ color:'#fff', fontSize:13, fontWeight:700, lineHeight:1.3 }}>
                    {user.first_name || user.email?.split('@')[0]}
                  </span>
                  <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11, lineHeight:1.2 }}>
                    {user.is_staff ? '🛡 أدمن' : user.is_instructor ? '🎓 مدرّس' : '📚 طالب'}
                  </span>
                </div>
                <span style={{
                  color:'rgba(255,255,255,0.3)', fontSize:10,
                  marginRight:2,
                  transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                  display:'block',
                }}>▼</span>
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div style={{
                  position:'absolute', top:'calc(100% + 12px)',
                  left: 0,
                  minWidth:230,
                  background:'linear-gradient(145deg,#13131f,#1a1a2e)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:16, overflow:'hidden',
                  boxShadow:'0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(233,69,96,0.08)',
                  animation:'nb-fadeSlide 0.2s cubic-bezier(0.4,0,0.2,1)',
                  zIndex:300,
                }}>
                  {/* Header */}
                  <div style={{
                    padding:'16px 18px 14px',
                    background:'rgba(233,69,96,0.06)',
                    borderBottom:'1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{
                        width:40, height:40, borderRadius:12,
                        background:'linear-gradient(135deg,#e94560,#c73652)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:16, fontWeight:800, color:'#fff',
                        boxShadow:'0 4px 14px rgba(233,69,96,0.4)',
                      }}>{initials}</div>
                      <div>
                        <p style={{ color:'#fff', fontWeight:800, fontSize:14, margin:'0 0 2px' }}>
                          {user.first_name} {user.last_name}
                        </p>
                        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, margin:0 }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding:'8px 0' }}>
                    <DropItem icon="📊" label="لوحة التحكم"     onClick={() => navigate(dashPath)} />
                    <DropItem icon="👤" label="الملف الشخصي"   onClick={() => navigate('/profile')} />
                    {user.is_instructor && <DropItem icon="➕" label="إنشاء كورس"  onClick={() => navigate('/courses/create')} />}
                    {user.is_staff      && <DropItem icon="🛡" label="لوحة الأدمن" onClick={() => navigate('/admin/courses')} accent />}
                  </div>

                  <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'0 18px' }}/>
                  <div style={{ padding:'8px 0' }}>
                    <DropItem icon="🚪" label="تسجيل الخروج" onClick={handleLogout} danger />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <Link to="/login" className="nb-login-btn" style={{
                color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13, fontWeight:600,
                padding:'7px 18px', borderRadius:9,
                border:'1px solid rgba(255,255,255,0.1)',
                transition:'all 0.2s',
              }}>دخول</Link>
              <Link to="/register" className="nb-reg-btn" style={{
                background:'linear-gradient(135deg,#e94560 0%,#c73652 100%)',
                color:'#fff', textDecoration:'none', fontSize:13, fontWeight:700,
                padding:'8px 20px', borderRadius:9,
                boxShadow:'0 4px 16px rgba(233,69,96,0.3)',
                transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              }}>إنشاء حساب</Link>
            </div>
          )}
        </div>

        {/* ── Hamburger ── */}
        <button
          className="nb-burger"
          style={{
            display:'none', flexDirection:'column', gap:5,
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:8, cursor:'pointer', padding:'8px 9px',
            marginRight:'auto', transition:'all 0.2s',
          }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {['top','mid','bot'].map((pos) => (
            <span key={pos} style={{
              display:'block', width:20, height:2,
              background: menuOpen ? '#e94560' : 'rgba(255,255,255,0.6)',
              borderRadius:2, transition:'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              transform: menuOpen
                ? pos==='top' ? 'translateY(7px) rotate(45deg)'
                : pos==='bot' ? 'translateY(-7px) rotate(-45deg)'
                : 'scaleX(0)'
                : 'none',
              opacity: menuOpen && pos==='mid' ? 0 : 1,
            }}/>
          ))}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div style={{
          background:'rgba(8,8,18,0.98)',
          borderTop:'1px solid rgba(255,255,255,0.06)',
          padding:'8px 0 20px',
          display:'flex', flexDirection:'column',
        }}>
          {/* Mobile links */}
          {[
            { to:'/', label:'🏠 الرئيسية' },
            { to:'/courses', label:'📚 الكورسات' },
          ].map(({ to, label }, i) => (
            <Link key={to} to={to} className="nb-mobile-link" style={{
              display:'block', padding:'13px 26px',
              color: isActive(to) ? '#fff' : 'rgba(255,255,255,0.55)',
              textDecoration:'none', fontSize:15, fontWeight: isActive(to) ? 700 : 500,
              background: isActive(to) ? 'rgba(233,69,96,0.08)' : 'transparent',
              borderRight: isActive(to) ? '3px solid #e94560' : '3px solid transparent',
              transition:'all 0.2s',
              animation:`nb-slideIn 0.2s ${i*0.05}s both`,
            }}>{label}</Link>
          ))}

          {user ? (
            <>
              {[
                { to: dashPath, label:'📊 لوحة التحكم' },
                { to:'/profile', label:'👤 الملف الشخصي' },
                ...(user.is_instructor ? [{ to:'/courses/create', label:'➕ كورس جديد' }] : []),
              ].map(({ to, label }, i) => (
                <Link key={to} to={to} className="nb-mobile-link" style={{
                  display:'block', padding:'13px 26px',
                  color:'rgba(255,255,255,0.55)', textDecoration:'none',
                  fontSize:15, fontWeight:500,
                  borderRight:'3px solid transparent',
                  transition:'all 0.2s',
                  animation:`nb-slideIn 0.2s ${(i+2)*0.05}s both`,
                }}>{label}</Link>
              ))}
              {user.is_staff && (
                <Link to="/admin/courses" style={{
                  display:'block', padding:'13px 26px', color:'#f5c542',
                  textDecoration:'none', fontSize:15, fontWeight:700,
                  borderRight:'3px solid rgba(245,197,66,0.4)',
                }}>🛡 الأدمن</Link>
              )}
              <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'10px 26px' }}/>
              <button onClick={handleLogout} style={{
                display:'block', width:'calc(100% - 52px)', margin:'4px 26px 0',
                padding:'12px', color:'#e94560',
                background:'rgba(233,69,96,0.08)',
                border:'1px solid rgba(233,69,96,0.2)',
                borderRadius:10, fontSize:14, fontWeight:700,
                textAlign:'center', cursor:'pointer',
                fontFamily:'Cairo,sans-serif',
                transition:'all 0.2s',
              }}>🚪 تسجيل الخروج</button>
            </>
          ) : (
            <div style={{ display:'flex', gap:10, padding:'14px 26px 4px' }}>
              <Link to="/login" style={{
                flex:1, textAlign:'center', padding:'11px',
                color:'rgba(255,255,255,0.7)',
                border:'1px solid rgba(255,255,255,0.12)', borderRadius:9,
                textDecoration:'none', fontWeight:600, fontSize:14,
              }}>دخول</Link>
              <Link to="/register" style={{
                flex:1, textAlign:'center', padding:'11px',
                background:'linear-gradient(135deg,#e94560,#c73652)', color:'#fff',
                borderRadius:9, textDecoration:'none', fontWeight:700, fontSize:14,
                boxShadow:'0 4px 16px rgba(233,69,96,0.3)',
              }}>إنشاء حساب</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

/* ─── Nav Link ───────────────────────────────────────────────────────── */
const NavLink = ({ to, active, children, isNew }) => (
  <Link to={to} className="nb-link-item" style={{
    position:'relative',
    display:'flex', alignItems:'center', gap:6,
    color: active ? '#fff' : 'rgba(255,255,255,0.45)',
    textDecoration:'none', fontSize:13.5, fontWeight: active ? 700 : 500,
    padding:'6px 14px', borderRadius:9,
    background: active ? 'rgba(233,69,96,0.1)' : 'transparent',
    border: active ? '1px solid rgba(233,69,96,0.18)' : '1px solid transparent',
    transition:'all 0.2s cubic-bezier(0.4,0,0.2,1)',
  }}>
    <span className="nb-link-dot" style={{
      width:5, height:5, borderRadius:'50%',
      background:'#e94560',
      opacity: active ? 1 : 0,
      transform: active ? 'scale(1)' : 'scale(0)',
      transition:'all 0.2s',
      flexShrink:0,
    }}/>
    {children}
    {isNew && (
      <span style={{
        fontSize:9, fontWeight:800, color:'#e94560',
        background:'rgba(233,69,96,0.12)',
        border:'1px solid rgba(233,69,96,0.25)',
        borderRadius:4, padding:'1px 5px', letterSpacing:0.5,
      }}>NEW</span>
    )}
  </Link>
);

/* ─── Dropdown Item ──────────────────────────────────────────────────── */
const DropItem = ({ icon, label, onClick, danger, accent }) => (
  <button
    className={`nb-drop-item${danger ? ' nb-drop-danger' : ''}${accent ? ' nb-drop-accent' : ''}`}
    onClick={onClick}
    style={{
      display:'flex', alignItems:'center', gap:12, width:'100%',
      padding:'10px 18px', background:'none', border:'none',
      color: danger ? '#e94560' : accent ? '#f5c542' : 'rgba(255,255,255,0.65)',
      fontSize:13.5, cursor:'pointer', fontFamily:'Cairo,sans-serif',
      textAlign:'right', transition:'all 0.18s',
    }}
  >
    <span style={{
      width:28, height:28, borderRadius:7,
      background: danger ? 'rgba(233,69,96,0.1)' : accent ? 'rgba(245,197,66,0.08)' : 'rgba(255,255,255,0.05)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:14, flexShrink:0,
    }}>{icon}</span>
    <span style={{ fontWeight:600 }}>{label}</span>
  </button>
);

export default Navbar;