// src/components/experiences/ExperienceCard.js
import { Link } from 'react-router-dom';

const ExperienceCard = ({ experience: exp }) => {
  const price  = parseFloat(exp.effective_price ?? exp.price);
  const isFree = price === 0;
  const imgSrc = exp.image_url || null;

  return (
    <Link to={`/experiences/${exp.id}`} style={s.link}>
      <div style={s.card}>

        {/* Image */}
        <div style={s.imgWrap}>
          {imgSrc
            ? <img src={imgSrc} alt={exp.title} style={s.img} />
            : <div style={s.imgPlaceholder}><span style={s.placeholderIcon}>🧪</span></div>
          }
          <div style={isFree ? s.badgeFree : s.badgePaid}>
            {isFree ? 'مجاني' : `${price.toFixed(0)} EGP`}
          </div>
          {exp.discount_percent > 0 && (
            <div style={s.discountBadge}>-{exp.discount_percent}%</div>
          )}
          {exp.is_purchased && <div style={s.purchasedBadge}>✓ مشترك</div>}
          {exp.is_featured  && <div style={s.featuredBadge}>★</div>}
        </div>

        {/* Body */}
        <div style={s.body}>
          {exp.course_title  && <p style={s.courseLabel}>{exp.course_title}</p>}
          {exp.section_title && <p style={s.sectionLabel}>📂 {exp.section_title}</p>}
          <p style={s.instructor}><span>👤</span>{exp.instructor_name}</p>
          <h3 style={s.title}>{exp.title}</h3>
          <p style={s.desc}>
            {exp.description?.length > 90 ? exp.description.slice(0,90)+'…' : exp.description}
          </p>
          <div style={s.meta}>
            {exp.total_buyers > 0 && <span style={s.metaItem}>👥 {exp.total_buyers} مشترٍ</span>}
            {exp.preview_video_url && <span style={s.metaItem}>▶ معاينة مجانية</span>}
          </div>
          <div style={s.cta}>
            <span style={s.ctaText}>
              {exp.is_purchased ? 'شاهد التجربة' : isFree ? 'احصل مجاناً' : 'اشتري الآن'}
            </span>
            <span style={s.ctaArrow}>←</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const s = {
  link           : { textDecoration:'none', display:'block' },
  card           : { background:'#1a1a2e', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)', transition:'transform 0.2s, border-color 0.2s', cursor:'pointer', height:'100%', display:'flex', flexDirection:'column' },
  imgWrap        : { position:'relative', height:180, overflow:'hidden', flexShrink:0 },
  img            : { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  imgPlaceholder : { width:'100%', height:'100%', background:'linear-gradient(135deg,#0f3460,#16213e)', display:'flex', alignItems:'center', justifyContent:'center' },
  placeholderIcon: { fontSize:48, opacity:0.4 },
  badgeFree      : { position:'absolute', top:12, right:12, background:'#00c896', color:'#fff', fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:20 },
  badgePaid      : { position:'absolute', top:12, right:12, background:'rgba(200,151,58,0.9)', color:'#000', fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:20 },
  discountBadge  : { position:'absolute', top:44, right:12, background:'#e94560', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20 },
  purchasedBadge : { position:'absolute', top:12, left:12, background:'rgba(0,100,255,0.85)', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20 },
  featuredBadge  : { position:'absolute', bottom:10, right:12, background:'rgba(200,151,58,0.9)', color:'#000', fontSize:13, fontWeight:700, padding:'2px 8px', borderRadius:20 },
  body           : { padding:'14px 16px 16px', display:'flex', flexDirection:'column', flex:1 },
  courseLabel    : { color:'#4a7fa5', fontSize:11, fontWeight:700, margin:'0 0 2px', textTransform:'uppercase', letterSpacing:1 },
  sectionLabel   : { color:'rgba(255,255,255,0.35)', fontSize:11, margin:'0 0 6px' },
  instructor     : { color:'rgba(255,255,255,0.45)', fontSize:12, margin:'0 0 6px', display:'flex', alignItems:'center', gap:5 },
  title          : { color:'#fff', fontSize:15, fontWeight:700, margin:'0 0 8px', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  desc           : { color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:1.6, margin:'0 0 12px', flex:1 },
  meta           : { display:'flex', gap:12, marginBottom:12, flexWrap:'wrap' },
  metaItem       : { color:'rgba(255,255,255,0.4)', fontSize:12 },
  cta            : { display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.07)' },
  ctaText        : { color:'#c8973a', fontSize:13, fontWeight:700 },
  ctaArrow       : { color:'#c8973a', fontSize:18 },
};

export default ExperienceCard;
