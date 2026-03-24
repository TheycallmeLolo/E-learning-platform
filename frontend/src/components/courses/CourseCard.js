import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const price = parseFloat(course.price);
  const isFree = price === 0;

  return (
    <Link to={`/courses/${course.id}`} style={s.link}>
      <div style={s.card}>
        {/* Image */}
        <div style={s.imgWrap}>
          {course.image_url
            ? <img src={course.image_url} alt={course.title} style={s.img} />
            : <div style={s.imgPlaceholder}>
                <span style={s.placeholderIcon}>🎓</span>
              </div>}
          {/* Price badge */}
          <div style={isFree ? s.badgeFree : s.badgePaid}>
            {isFree ? 'مجاني' : `${price.toFixed(0)} EGP`}
          </div>
          {course.is_enrolled && (
            <div style={s.enrolledBadge}>✓ مسجّل</div>
          )}
        </div>

        {/* Body */}
        <div style={s.body}>
          <p style={s.instructor}>
            <span style={s.instructorDot}>👤</span>
            {course.instructor_name || course.instructor_email}
          </p>
          <h3 style={s.title}>{course.title}</h3>
          <p style={s.desc}>
            {course.description?.length > 90
              ? course.description.substring(0, 90) + '…'
              : course.description}
          </p>

          {/* Meta */}
          <div style={s.meta}>
            {course.total_sections > 0 && (
              <span style={s.metaItem}>📂 {course.total_sections} أقسام</span>
            )}
            {course.total_lectures > 0 && (
              <span style={s.metaItem}>🎬 {course.total_lectures} ليكتشر</span>
            )}
          </div>

          {/* CTA */}
          <div style={s.cta}>
            <span style={s.ctaText}>عرض الكورس</span>
            <span style={s.ctaArrow}>←</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const s = {
  link: { textDecoration: 'none', display: 'block' },
  card: {
    background: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.07)',
    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  // Image
  imgWrap: { position: 'relative', height: 180, overflow: 'hidden', flexShrink: 0 },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block',
         transition: 'transform 0.3s' },
  imgPlaceholder: {
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg, #0f3460, #16213e)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 48, opacity: 0.4 },

  // Badges
  badgeFree: {
    position: 'absolute', top: 12, right: 12,
    background: '#00c896', color: '#fff',
    fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
  },
  badgePaid: {
    position: 'absolute', top: 12, right: 12,
    background: 'rgba(233,69,96,0.9)', color: '#fff',
    fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
    backdropFilter: 'blur(4px)',
  },
  enrolledBadge: {
    position: 'absolute', top: 12, left: 12,
    background: 'rgba(0,100,255,0.85)', color: '#fff',
    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
  },

  // Body
  body: { padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 },
  instructor: { color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '0 0 8px',
                display: 'flex', alignItems: 'center', gap: 5 },
  instructorDot: { fontSize: 11 },
  title: { color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 10px', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  desc: { color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6,
          margin: '0 0 14px', flex: 1 },

  // Meta
  meta: { display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' },
  metaItem: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  // CTA
  cta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
         paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' },
  ctaText: { color: '#e94560', fontSize: 13, fontWeight: 700 },
  ctaArrow: { color: '#e94560', fontSize: 18 },
};

export default CourseCard;