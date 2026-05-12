// src/pages/Instructors.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstructors } from '../services/instructors';
import './Instructors.css';

const SPECIALTIES = ['الكل', 'Computer Science', 'Data Science', 'Engineering', 'Mathematics'];

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [active, setActive]           = useState('الكل');

  useEffect(() => {
    getInstructors()
      .then(res => {
        const data = res.data.results ?? res.data;
        setInstructors(data);
        setFiltered(data);
      })
      .catch(() => {
        // fallback mock data for development
        const mock = [
          {
            id: '1',
            display_name: 'دكتور أحمد محمد',
            title_label: 'دكتور',
            avatar_url: null,
            expertise: 'Machine Learning, Python',
            department: 'Computer Science Department',
            university: 'Cairo University',
            years_experience: 12,
            course_count: 4,
            is_featured: true,
            show_cv: true,
            user: { id: 'u1' },
          },
          {
            id: '2',
            display_name: 'أستاذ دكتور سارة علي',
            title_label: 'أستاذ دكتور',
            avatar_url: null,
            expertise: 'Data Science, Statistics',
            department: 'Mathematics Department',
            university: 'Ain Shams University',
            years_experience: 18,
            course_count: 6,
            is_featured: true,
            show_cv: true,
            user: { id: 'u2' },
          },
          {
            id: '3',
            display_name: 'دكتور خالد إبراهيم',
            title_label: 'دكتور',
            avatar_url: null,
            expertise: 'Web Development, React',
            department: 'Software Engineering',
            university: 'Alexandria University',
            years_experience: 8,
            course_count: 3,
            is_featured: false,
            show_cv: false,
            user: { id: 'u3' },
          },
        ];
        setInstructors(mock);
        setFiltered(mock);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = instructors;
    if (active !== 'الكل') {
      result = result.filter(i =>
        i.expertise?.toLowerCase().includes(active.toLowerCase())
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.display_name?.toLowerCase().includes(q) ||
        i.expertise?.toLowerCase().includes(q) ||
        i.department?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, active, instructors]);

  const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('');

  if (loading) {
    return (
      <div className="inst-loading">
        <div className="inst-loading__spinner" />
        <p>جاري تحميل أعضاء هيئة التدريس…</p>
      </div>
    );
  }

  return (
    <div className="inst-page">

      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="inst-hero">
        <div className="inst-hero__inner">
          <span className="inst-hero__eyebrow">Faculty</span>
          <h1 className="inst-hero__title">أعضاء هيئة التدريس</h1>
          <p className="inst-hero__sub">
            نخبة من الأكاديميين والممارسين المتخصصين في مجالاتهم
          </p>
          <div className="inst-hero__stats">
            <div className="inst-hero__stat">
              <strong>{instructors.length}</strong>
              <span>عضو هيئة تدريس</span>
            </div>
            <div className="inst-hero__stat">
              <strong>{instructors.reduce((a, i) => a + (i.course_count || 0), 0)}</strong>
              <span>كورس منشور</span>
            </div>
            <div className="inst-hero__stat">
              <strong>{instructors.filter(i => i.is_featured).length}</strong>
              <span>متميز</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="inst-controls">
        <div className="inst-controls__inner">
          <input
            className="inst-search"
            type="text"
            placeholder="ابحث باسم الدكتور أو التخصص…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="inst-filters">
            {SPECIALTIES.map(s => (
              <button
                key={s}
                className={`inst-filter-btn ${active === s ? 'inst-filter-btn--active' : ''}`}
                onClick={() => setActive(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured ─────────────────────────────────────── */}
      {filtered.some(i => i.is_featured) && active === 'الكل' && !search && (
        <section className="inst-featured">
          <div className="inst-section-inner">
            <h2 className="inst-section-title">
              <span>★</span> الدكاتره المتميزين
            </h2>
            <div className="inst-featured__grid">
              {filtered.filter(i => i.is_featured).map(inst => (
                <FeaturedCard key={inst.id} inst={inst} getInitials={getInitials} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── All Instructors ───────────────────────────────── */}
      <section className="inst-all">
        <div className="inst-section-inner">
          {(active !== 'الكل' || search) && (
            <h2 className="inst-section-title">
              نتائج البحث ({filtered.length})
            </h2>
          )}
          {!search && active === 'الكل' && (
            <h2 className="inst-section-title">جميع أعضاء هيئة التدريس</h2>
          )}

          {filtered.length === 0 ? (
            <div className="inst-empty">
              <p>لا توجد نتائج مطابقة للبحث</p>
            </div>
          ) : (
            <div className="inst-grid">
              {filtered.map(inst => (
                <InstructorCard key={inst.id} inst={inst} getInitials={getInitials} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


/* ── Featured Card ───────────────────────────────────────────────────────── */
function FeaturedCard({ inst, getInitials }) {
  return (
    <Link to={`/instructors/${inst.id}`} className="inst-feat-card">
      <div className="inst-feat-card__avatar">
        {inst.avatar_url
          ? <img src={inst.avatar_url} alt={inst.display_name} />
          : <span>{getInitials(inst.display_name)}</span>
        }
        <div className="inst-feat-card__badge">★ متميز</div>
      </div>
      <div className="inst-feat-card__body">
        <p className="inst-feat-card__title">{inst.title_label}</p>
        <h3 className="inst-feat-card__name">{inst.display_name}</h3>
        <p className="inst-feat-card__dept">{inst.department}</p>
        <p className="inst-feat-card__uni">{inst.university}</p>
        <div className="inst-feat-card__tags">
          {inst.expertise?.split(',').map(e => (
            <span key={e} className="inst-tag">{e.trim()}</span>
          ))}
        </div>
        <div className="inst-feat-card__stats">
          <span>{inst.course_count} كورس</span>
          <span>{inst.years_experience} سنة خبرة</span>
        </div>
      </div>
    </Link>
  );
}


/* ── Regular Card ────────────────────────────────────────────────────────── */
function InstructorCard({ inst, getInitials }) {
  return (
    <Link to={`/instructors/${inst.id}`} className="inst-card">
      <div className="inst-card__avatar">
        {inst.avatar_url
          ? <img src={inst.avatar_url} alt={inst.display_name} />
          : <span>{getInitials(inst.display_name)}</span>
        }
      </div>
      <div className="inst-card__body">
        <span className="inst-card__title-label">{inst.title_label}</span>
        <h3 className="inst-card__name">{inst.display_name}</h3>
        {inst.department && <p className="inst-card__dept">{inst.department}</p>}
        {inst.expertise && (
          <div className="inst-card__tags">
            {inst.expertise.split(',').slice(0, 2).map(e => (
              <span key={e} className="inst-tag inst-tag--sm">{e.trim()}</span>
            ))}
          </div>
        )}
        <div className="inst-card__footer">
          <span>{inst.course_count} كورس</span>
          {inst.years_experience > 0 && <span>{inst.years_experience} سنة</span>}
          {inst.show_cv && <span className="inst-card__cv">CV ↓</span>}
        </div>
      </div>
    </Link>
  );
}
