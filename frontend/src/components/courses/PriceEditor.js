// src/components/courses/PriceEditor.js
// ── يتضاف جوه ManageCourse أو CourseDetail لصاحب الكورس ──
import { useState } from 'react';
import api from '../../services/api';

const PriceEditor = ({ course, onUpdated }) => {
  const [open,          setOpen]          = useState(false);
  const [price,         setPrice]         = useState(parseFloat(course.price) || 0);
  const [discountPrice, setDiscountPrice] = useState(
    course.discount_price ? parseFloat(course.discount_price) : ''
  );
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [err,     setErr]     = useState('');

  const effectivePrice = discountPrice !== '' && discountPrice < price
    ? discountPrice : price;
  const discountPct = discountPrice !== '' && discountPrice < price && price > 0
    ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleSave = async () => {
    setErr(''); setSuccess('');
    if (price < 0) { setErr('السعر لا يمكن أن يكون سالباً'); return; }
    if (discountPrice !== '' && discountPrice >= price) {
      setErr('سعر التخفيض يجب أن يكون أقل من السعر الأصلي'); return;
    }
    setSaving(true);
    try {
      const body = { price };
      if (discountPrice !== '') body.discount_price = discountPrice;
      else body.discount_price = null;   // إلغاء التخفيض

      const res = await api.patch(`/courses/${course.id}/update-price/`, body);
      setSuccess(`✅ تم التحديث – السعر الفعلي: ${res.data.effective_price} EGP`);
      onUpdated?.(res.data);
      setTimeout(() => { setSuccess(''); setOpen(false); }, 2000);
    } catch (e) {
      setErr(e.response?.data?.error || 'فشل التحديث');
    } finally { setSaving(false); }
  };

  if (!open) return (
    <button style={s.openBtn} onClick={() => setOpen(true)}>
      ✏ تعديل السعر
      {discountPct > 0 && <span style={s.discChip}>خصم {discountPct}%</span>}
    </button>
  );

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <h4 style={s.cardTitle}>✏ تعديل السعر</h4>
        <button style={s.closeBtn} onClick={() => setOpen(false)}>✕</button>
      </div>

      {/* Live preview */}
      <div style={s.preview}>
        {discountPct > 0 && (
          <span style={s.originalPrice}>{price} EGP</span>
        )}
        <span style={s.effectivePrice}>{effectivePrice} EGP</span>
        {discountPct > 0 && (
          <span style={s.discBadge}>خصم {discountPct}%</span>
        )}
      </div>

      {/* Price */}
      <label style={s.label}>السعر الأصلي (EGP)</label>
      <input style={s.input} type="number" min="0" step="1"
        value={price} onChange={e => setPrice(+e.target.value)} />

      {/* Discount */}
      <label style={s.label}>
        سعر التخفيض (EGP)
        <span style={s.optional}> – اتركه فارغاً لو مفيش تخفيض</span>
      </label>
      <div style={s.discRow}>
        <input style={{ ...s.input, flex:1 }} type="number" min="0" step="1"
          placeholder="مثال: 199"
          value={discountPrice}
          onChange={e => setDiscountPrice(e.target.value === '' ? '' : +e.target.value)} />
        {discountPrice !== '' && (
          <button style={s.clearBtn} onClick={() => setDiscountPrice('')}>✕ إلغاء التخفيض</button>
        )}
      </div>

      {err     && <p style={s.errTxt}>⚠ {err}</p>}
      {success && <p style={s.sucTxt}>{success}</p>}

      <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
      </button>
    </div>
  );
};

const s = {
  openBtn: {
    display:'inline-flex', alignItems:'center', gap:8,
    background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.8)',
    border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
    padding:'8px 16px', cursor:'pointer', fontSize:13, fontWeight:600,
    fontFamily:'Cairo,sans-serif',
  },
  discChip: { background:'rgba(0,200,150,0.15)', color:'#00c896',
              borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700 },

  card:       { background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:14, padding:20, marginTop:12 },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  cardTitle:  { color:'#fff', fontSize:16, fontWeight:700, margin:0 },
  closeBtn:   { background:'none', border:'none', color:'rgba(255,255,255,0.4)',
                cursor:'pointer', fontSize:18, padding:0 },

  preview:       { display:'flex', alignItems:'center', gap:10, marginBottom:18,
                   padding:'10px 14px', background:'rgba(255,255,255,0.04)',
                   borderRadius:8, border:'1px solid rgba(255,255,255,0.08)' },
  originalPrice: { color:'rgba(255,255,255,0.3)', textDecoration:'line-through', fontSize:14 },
  effectivePrice:{ color:'#fff', fontWeight:900, fontSize:22 },
  discBadge:     { background:'rgba(0,200,150,0.12)', color:'#00c896',
                   border:'1px solid rgba(0,200,150,0.25)', borderRadius:20,
                   padding:'3px 10px', fontSize:12, fontWeight:700 },

  label:    { display:'block', color:'rgba(255,255,255,0.55)', fontSize:13,
              fontWeight:600, margin:'12px 0 6px' },
  optional: { color:'rgba(255,255,255,0.3)', fontWeight:400 },
  input:    { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.06)',
              border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
              color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box',
              fontFamily:'Cairo,sans-serif' },
  discRow:  { display:'flex', gap:8, alignItems:'center' },
  clearBtn: { background:'rgba(233,69,96,0.1)', color:'#e94560',
              border:'1px solid rgba(233,69,96,0.25)', borderRadius:6,
              padding:'8px 12px', cursor:'pointer', fontSize:12, fontWeight:600,
              whiteSpace:'nowrap', fontFamily:'Cairo,sans-serif' },
  errTxt:   { color:'#e94560', fontSize:13, margin:'8px 0 0' },
  sucTxt:   { color:'#00c896', fontSize:13, margin:'8px 0 0' },
  saveBtn:  { width:'100%', marginTop:16, padding:'11px', background:'linear-gradient(135deg,#28a745,#1e7e34)',
              color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700,
              cursor:'pointer', fontFamily:'Cairo,sans-serif' },
};

export default PriceEditor;