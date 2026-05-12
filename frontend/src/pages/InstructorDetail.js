// src/pages/InstructorDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInstructorById, getInstructorCourses } from '../services/instructors';
import './InstructorDetail.css';

export default function InstructorDetail() {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('about');

  useEffect(() => {
    getInstructorById(id)
      .then(res => {
        setInstructor(res.data);
        return getInstructorCourses(res.data.user.id);
      })
      .then(res => setCourses(res.data.results ?? res.data))
      .catch(() => {
        // mock fallback
        setInstructor({
          id,
          display_name: 'دكتور أحمد محمد',
          title_label: 'دكتور',
          avatar_url: null,
          bio: 'أستاذ متخصص في مجال الذكاء الاصطناعي وتعلم الآلة مع خبرة تزيد عن 12 عاماً في التدريس والبحث العلمي. حاصل على دكتوراه من جامعة القاهرة وله العديد من الأبحاث المنشورة في مجلات دولية محكمة.',
          expertise: 'Machine Learning, Python, Deep Learning',
          department: 'Computer Science Department',
          university: 'Cairo University',
          years_experience: 12,
          course_count: 4,
          total_students: 850,
          office_hours: 'الأحد والثلاثاء 10 صباحاً - 12 ظهراً',
          linkedin: 'https://linkedin.com',
          google_scholar: 'https://scholar.google.com',
          show_cv: true,
          cv_url: null,
          is_featured: true,
        });
        setCourses([
          { id: 'c1', title: 'Machine Learning من الصفر', price: 299, slug: 'ml-from-scratch', image_url: null },
          { id: 'c2', title: 'Python للمبتدئين', price: 0, slug: 'python-beginners', image_url: null },
        ]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('');

  if (loading) {
    return (
      <div className="idet-loading">
        <div className="idet-loading__spinner" />
      </div>
    );
  }
  if (!instructor) return <div className="idet-loading"><p>لم يتم العثور على المدرس</p></div>;

  return (
    <div className="idet-page">

      {/* ── Profile Header ───────────────────────────── */}
      <div className="idet-header">
        <div className="idet-header__inner">
          <Link to="/instructors" className="idet-back">← العودة للدكاتره</Link>

          <div className="idet-profile">
            <div className="idet-profile__avatar">
              {instructor.avatar_url
                ? <img src={instructor.avatar_url} alt={instructor.display_name} />
                : <span>{getInitials(instructor.display_name)}</span>
              }
              {instructor.is_featured && (
                <div className="idet-featured-badge">★ متميز</div>
              )}
            </div>

            <div className="idet-profile__info">
              <span className="idet-profile__label">{instructor.title_label}</span>
              <h1 className="idet-profile__name">{instructor.display_name}</h1>
              {instructor.department && (
                <p className="idet-profile__dept">{instructor.department}</p>
              )}
              {instructor.university && (
                <p className="idet-profile__uni">🎓 {instructor.university}</p>
              )}

              <div className="idet-profile__tags">
                {instructor.expertise?.split(',').map(e => (
                  <span key={e} className="idet-tag">{e.trim()}</span>
                ))}
              </div>

              <div className="idet-profile__stats">
                <div className="idet-stat">
                  <strong>{instructor.course_count}</strong>
                  <span>كورس</span>
                </div>
                <div className="idet-stat">
                  <strong>{instructor.years_experience}</strong>
                  <span>سنة خبرة</span>
                </div>
                {instructor.total_students > 0 && (
                  <div className="idet-stat">
                    <strong>{instructor.total_students.toLocaleString()}</strong>
                    <span>طالب</span>
                  </div>
                )}
              </div>

              {/* Social links */}
              <div className="idet-profile__links">
                {instructor.linkedin && (
                  <a href={instructor.linkedin} target="_blank" rel="noreferrer" className="idet-link idet-link--li">
                    LinkedIn
                  </a>
                )}
                {instructor.google_scholar && (
                  <a href={instructor.google_scholar} target="_blank" rel="noreferrer" className="idet-link idet-link--gs">
                    Google Scholar
                  </a>
                )}
                {instructor.research_gate && (
                  <a href={instructor.research_gate} target="_blank" rel="noreferrer" className="idet-link idet-link--rg">
                    ResearchGate
                  </a>
                )}
                {instructor.show_cv && instructor.cv_url && (
                  <a href={instructor.cv_url} download className="idet-link idet-link--cv">
                    ↓ تحميل السيرة الذاتية
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="idet-tabs">
            {['about', 'courses', 'contact'].map(t => (
              <button
                key={t}
                className={`idet-tab ${tab === t ? 'idet-tab--active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'about' ? 'نبذة عن الدكتور' : t === 'courses' ? `الكورسات (${courses.length})` : 'التواصل'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div className="idet-content">
        <div className="idet-content__inner">

          {tab === 'about' && (
            <div className="idet-about">
              <h2>السيرة الذاتية</h2>
              <p>{instructor.bio || 'لم يتم إضافة سيرة ذاتية بعد.'}</p>
              {instructor.office_hours && (
                <div className="idet-info-block">
                  <h3>ساعات المكتب</h3>
                  <p>🕐 {instructor.office_hours}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'courses' && (
            <div className="idet-courses">
              {courses.length === 0 ? (
                <p className="idet-empty">لا توجد كورسات منشورة حتى الآن.</p>
              ) : (
                <div className="idet-courses__grid">
                  {courses.map(c => (
                    <Link key={c.id} to={`/courses/${c.slug}`} className="idet-course-card">
                      <div className="idet-course-card__img">
                        {c.image_url
                          ? <img src={c.image_url} alt={c.title} />
                          : <span>📚</span>
                        }
                      </div>
                      <div className="idet-course-card__body">
                        <h3>{c.title}</h3>
                        <p className="idet-course-card__price">
                          {c.price === 0 ? 'مجاني' : `${c.price} جنيه`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'contact' && (
            <div className="idet-contact">
              {instructor.show_contact && instructor.phone_number ? (
                <div className="idet-info-block">
                  <h3>رقم التواصل</h3>
                  <p>📞 {instructor.phone_number}</p>
                </div>
              ) : (
                <p className="idet-empty">التواصل المباشر غير متاح حالياً.</p>
              )}
              <div className="idet-contact__links">
                {instructor.linkedin && (
                  <a href={instructor.linkedin} target="_blank" rel="noreferrer" className="idet-contact-btn">
                    تواصل عبر LinkedIn
                  </a>
                )}
                {instructor.show_cv && instructor.cv_url && (
                  <a href={instructor.cv_url} download className="idet-contact-btn idet-contact-btn--gold">
                    ↓ تحميل السيرة الذاتية (PDF)
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
