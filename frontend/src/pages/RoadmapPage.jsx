// src/pages/RoadmapPage.jsx
import { useState } from 'react';
import { TRACKS, AVATARS } from '../data/tracks';
import CertificateCard from '../components/CertificateCard';
import styles from './RoadmapPage.module.css';

// ── helpers ────────────────────────────────────────────────────────────────
function getLevelColor(level) {
  if (level === 'مبتدئ')  return { bg: '#dcfce7', text: '#166534' };
  if (level === 'متوسط')  return { bg: '#fef9c3', text: '#854d0e' };
  if (level === 'متقدم') return { bg: '#fee2e2', text: '#991b1b' };
  return { bg: '#f3f4f6', text: '#374151' };
}

// ── TrackCard ──────────────────────────────────────────────────────────────
function TrackCard({ track, progress, onClick }) {
  const total = track.courses.length;
  const done  = progress ? Object.values(progress).filter(Boolean).length : 0;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <button className={styles.trackCard} onClick={onClick} style={{ '--accent': track.color }}>
      <span className={styles.trackIcon}>{track.icon}</span>
      <span className={styles.trackName}>{track.nameAr}</span>
      <span className={styles.trackSub}>{track.name}</span>
      <span className={styles.trackCount}>{total} كورسات</span>
      {done > 0 && (
        <div className={styles.miniProgress}>
          <div className={styles.miniBar} style={{ width: `${pct}%`, background: track.color }} />
        </div>
      )}
    </button>
  );
}

// ── RoadmapNode ────────────────────────────────────────────────────────────
function RoadmapNode({ course, index, isDone, isCurrent, isLast, trackColor, onMarkDone, onOpenCert }) {
  const [showCert, setShowCert] = useState(false);
  const lvlColor = getLevelColor(course.level);

  return (
    <div className={styles.node}>
      {/* خط + دوت */}
      <div className={styles.lineWrap}>
        <div
          className={`${styles.dot} ${isDone ? styles.dotDone : isCurrent ? styles.dotCurrent : styles.dotLocked}`}
          style={isDone ? { background: trackColor, borderColor: trackColor }
               : isCurrent ? { borderColor: trackColor }
               : {}}
        >
          {isDone ? '✓' : index + 1}
        </div>
        {!isLast && (
          <div className={styles.connector} style={{ background: isDone ? trackColor : '#e5e7eb' }} />
        )}
      </div>

      {/* بطاقة الكورس */}
      <div className={`${styles.card} ${isDone ? styles.cardDone : isCurrent ? styles.cardCurrent : styles.cardLocked}`}
           style={isDone ? { borderColor: trackColor + '60' } : isCurrent ? { borderColor: trackColor } : {}}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}>{course.title}</span>
          {isDone && <span className={styles.badge} style={{ background: '#dcfce7', color: '#166534' }}>مكتمل ✓</span>}
          {isCurrent && <span className={styles.badge} style={{ background: '#dbeafe', color: '#1d4ed8' }}>الحالي</span>}
          {!isDone && !isCurrent && <span className={styles.badge} style={{ background: '#f3f4f6', color: '#9ca3af' }}>🔒 محلوط</span>}
        </div>

        <div className={styles.cardMeta}>
          <span>⏱ {course.duration}</span>
          <span
            className={styles.levelPill}
            style={{ background: lvlColor.bg, color: lvlColor.text }}
          >
            {course.level}
          </span>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>{course.dept}</span>
        </div>

        <div className={styles.cardActions}>
          {isDone && (
            <button
              className={styles.btnCert}
              style={{ borderColor: trackColor, color: trackColor }}
              onClick={() => setShowCert(v => !v)}
            >
              🎓 {showCert ? 'إخفاء الشهادة' : 'شهادة الكورس ده'}
            </button>
          )}
          {isCurrent && (
            <button
              className={styles.btnDone}
              style={{ background: trackColor }}
              onClick={onMarkDone}
            >
              ✓ خلّصت الكورس ده
            </button>
          )}
          {!isDone && !isCurrent && (
            <button className={styles.btnLocked} disabled>
              🔒 أكمل اللي قبله الأول
            </button>
          )}
        </div>

        {showCert && (
          <CertificateCard
            title={course.title}
            isTrack={false}
            onClose={() => setShowCert(false)}
          />
        )}
      </div>
    </div>
  );
}

// ── RoadmapView ────────────────────────────────────────────────────────────
function RoadmapView({ track, progress, onMarkDone, onBack, avatar, customAvatar, onAvatarChange, onUploadAvatar }) {
  const done  = Object.values(progress).filter(Boolean).length;
  const total = track.courses.length;
  const pct   = Math.round((done / total) * 100);
  const allDone = done === total;

  return (
    <div className={styles.rmView}>
      {/* هيدر */}
      <div className={styles.rmHeader}>
        <button className={styles.backBtn} onClick={onBack}>← رجوع</button>
        <span className={styles.rmTitle} style={{ color: track.color }}>
          {track.icon} {track.nameAr}
        </span>
      </div>

      {/* أفاتار + progress */}
      <div className={styles.topBar}>
        <div className={styles.avatarArea}>
          {customAvatar
            ? <img src={customAvatar} className={styles.avatarImg} alt="avatar" />
            : <span className={styles.avatarEmoji}>{avatar}</span>
          }
          <div className={styles.avatarPicker}>
            {AVATARS.map(a => (
              <button
                key={a}
                className={`${styles.avatarBtn} ${avatar === a && !customAvatar ? styles.avatarBtnActive : ''}`}
                onClick={() => onAvatarChange(a)}
              >
                {a}
              </button>
            ))}
            <label className={styles.uploadBtn}>
              📁
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => onUploadAvatar(ev.target.result); r.readAsDataURL(f); }} />
            </label>
          </div>
        </div>

        <div className={styles.progressArea}>
          <p className={styles.progressLabel}>{done} من {total} كورسات ({pct}%)</p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%`, background: track.color }} />
          </div>
        </div>
      </div>

      {/* الـ nodes */}
      <div className={styles.path}>
        {track.courses.map((course, i) => {
          const isDone    = !!progress[i];
          const isCurrent = !isDone && (i === 0 || !!progress[i - 1]);
          return (
            <RoadmapNode
              key={i}
              course={course}
              index={i}
              isDone={isDone}
              isCurrent={isCurrent}
              isLast={i === track.courses.length - 1}
              trackColor={track.color}
              onMarkDone={() => onMarkDone(i)}
            />
          );
        })}
      </div>

      {/* شهادة التراك الكامل */}
      {allDone && (
        <div className={styles.trackCertSection}>
          <h3 className={styles.trackCertTitle}>🏆 أنهيت التراك كله!</h3>
          <CertificateCard title={`${track.nameAr} — ${track.name} Track`} isTrack />
        </div>
      )}
    </div>
  );
}

// ── GeneralRoadmap ─────────────────────────────────────────────────────────
function GeneralRoadmap() {
  const [open, setOpen] = useState({});

  return (
    <div className={styles.generalWrap}>
      <p className={styles.generalDesc}>نظرة عامة على كل التراكات والكورسات المتاحة في المنصة:</p>
      {TRACKS.map(track => (
        <div key={track.id} className={styles.genSection}>
          <button
            className={styles.genHead}
            onClick={() => setOpen(p => ({ ...p, [track.id]: !p[track.id] }))}
          >
            <span>{track.icon} {track.nameAr} <span style={{ color: '#9ca3af', fontWeight: 400 }}>— {track.name}</span></span>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>
              {track.courses.length} كورسات {open[track.id] ? '▲' : '▼'}
            </span>
          </button>
          {open[track.id] && (
            <div className={styles.genBody}>
              {track.courses.map((c, i) => {
                const lv = getLevelColor(c.level);
                return (
                  <div key={i} className={styles.genRow}>
                    <span className={styles.genDot} style={{ background: track.color }} />
                    <span className={styles.genCourseTitle}>{c.title}</span>
                    <span className={styles.genDuration}>⏱ {c.duration}</span>
                    <span className={styles.levelPill} style={{ background: lv.bg, color: lv.text }}>{c.level}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── RoadmapPage (main) ─────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [activeTab,   setActiveTab]   = useState('my');
  const [activeTrack, setActiveTrack] = useState(null);
  const [progress,    setProgress]    = useState({});   // { [trackId]: { [courseIndex]: true } }
  const [avatar,      setAvatar]      = useState('🧑‍💻');
  const [customAvatar, setCustomAvatar] = useState(null);

  function markDone(trackId, courseIndex) {
    setProgress(p => ({
      ...p,
      [trackId]: { ...(p[trackId] || {}), [courseIndex]: true },
    }));
  }

  const track = activeTrack ? TRACKS.find(t => t.id === activeTrack) : null;

  return (
    <div className={styles.page} dir="rtl">
      {/* تابز */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'my' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('my')}
        >
          🗺 الـ roadmap بتاعي
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('general')}
        >
          🌍 roadmap عامة
        </button>
      </div>

      {/* My Roadmap tab */}
      {activeTab === 'my' && (
        <>
          {!activeTrack ? (
            <div>
              <p className={styles.selectHint}>اختار التراك اللي عايز تبدأ فيه:</p>
              <div className={styles.trackGrid}>
                {TRACKS.map(t => (
                  <TrackCard
                    key={t.id}
                    track={t}
                    progress={progress[t.id]}
                    onClick={() => setActiveTrack(t.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <RoadmapView
              track={track}
              progress={progress[activeTrack] || {}}
              onMarkDone={idx => markDone(activeTrack, idx)}
              onBack={() => setActiveTrack(null)}
              avatar={avatar}
              customAvatar={customAvatar}
              onAvatarChange={a => { setAvatar(a); setCustomAvatar(null); }}
              onUploadAvatar={src => { setCustomAvatar(src); }}
            />
          )}
        </>
      )}

      {/* General tab */}
      {activeTab === 'general' && <GeneralRoadmap />}
    </div>
  );
}
