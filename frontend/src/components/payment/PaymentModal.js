import { useState } from 'react';
import { enrollmentsService } from '../../services/enrollments';

// ─── Payment methods config ───────────────────────────────────────────────────
const METHODS = [
  { id: 'card',         icon: '💳', label: 'بطاقة بنكية',     sub: 'Visa / Mastercard' },
  { id: 'instapay',     icon: '⚡', label: 'InstaPay',         sub: 'الدفع الفوري' },
  { id: 'vodafone',     icon: '🔴', label: 'Vodafone Cash',    sub: 'فودافون كاش' },
  { id: 'orange',       icon: '🟠', label: 'Orange Cash',      sub: 'أورانج كاش' },
  { id: 'etisalat',     icon: '🟢', label: 'Etisalat Cash',    sub: 'اتصالات كاش' },
  { id: 'fawry',        icon: '🏪', label: 'Fawry',            sub: 'فوري' },
];

// ─── Card helpers ─────────────────────────────────────────────────────────────
const fmtCard   = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
const fmtExpiry = (v) => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2?d.slice(0,2)+'/'+d.slice(2):d; };
const fmtCVV    = (v) => v.replace(/\D/g,'').slice(0,3);
const detectBrand = (n) => {
  const d = n.replace(/\s/g,'');
  if (d.startsWith('4'))  return 'Visa';
  if (/^5[1-5]/.test(d)) return 'Mastercard';
  return null;
};

// ─── Wallet form ──────────────────────────────────────────────────────────────
const WalletForm = ({ method, price, onPay, loading }) => {
  const [phone, setPhone] = useState('');
  const [err,   setErr]   = useState('');

  const validate = () => {
    const p = phone.replace(/\D/g,'');
    if (p.length !== 11) return 'أدخل رقم هاتف صحيح (11 رقم)';
    return null;
  };

  const handlePay = () => {
    const e = validate(); if (e) { setErr(e); return; }
    setErr('');
    onPay({ phone });
  };

  const placeholders = {
    vodafone: '010XXXXXXXX', orange: '012XXXXXXXX',
    etisalat: '011XXXXXXXX', instapay: '01XXXXXXXXX',
  };

  return (
    <div>
      <div style={s.walletInfo}>
        <span style={{ fontSize:28 }}>{METHODS.find(m=>m.id===method)?.icon}</span>
        <div>
          <p style={s.walletName}>{METHODS.find(m=>m.id===method)?.label}</p>
          <p style={s.walletSub}>سيتم إرسال طلب دفع لرقم هاتفك</p>
        </div>
      </div>
      <label style={s.label}>رقم الهاتف</label>
      <div style={s.phoneWrap}>
        <span style={s.phoneFlag}>🇪🇬 +20</span>
        <input style={s.phoneInput} type="tel" inputMode="numeric"
          placeholder={placeholders[method] || '01XXXXXXXXX'}
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,11))} />
      </div>
      {err && <p style={s.errMsg}>⚠ {err}</p>}
      <button style={s.payBtn} onClick={handlePay} disabled={loading}>
        {loading ? '⏳ جاري الإرسال...' : `ادفع ${price} EGP 🔒`}
      </button>
      <p style={s.secureNote}>🔒 بيئة تجريبية – لا يتم خصم أي مبالغ حقيقية</p>
    </div>
  );
};

// ─── Fawry form ───────────────────────────────────────────────────────────────
const FawryForm = ({ price, onPay, loading }) => {
  const fawryCode = '1234-5678-9012';
  return (
    <div>
      <div style={s.fawryBox}>
        <p style={s.fawryTitle}>🏪 كود الدفع عبر فوري</p>
        <div style={s.fawryCode}>{fawryCode}</div>
        <p style={s.fawrySub}>توجّه لأي فرع فوري وادفع الكود ده</p>
        <div style={s.fawrySteps}>
          {['اطلب دفع فوري','أدخل الكود أعلاه',`ادفع ${price} EGP`,'تم التفعيل تلقائياً'].map((step,i)=>(
            <div key={i} style={s.fawryStep}>
              <span style={s.fawryStepNum}>{i+1}</span>
              <span style={s.fawryStepTxt}>{step}</span>
            </div>
          ))}
        </div>
      </div>
      <button style={s.payBtn} onClick={() => onPay({})} disabled={loading}>
        {loading ? '⏳...' : '✓ تأكيد الدفع'}
      </button>
      <p style={s.secureNote}>🔒 بيئة تجريبية – لا يتم خصم أي مبالغ حقيقية</p>
    </div>
  );
};

// ─── Card form ────────────────────────────────────────────────────────────────
const CardForm = ({ price, onPay, loading }) => {
  const [card, setCard] = useState({ name:'', number:'', expiry:'', cvv:'' });
  const [err,  setErr]  = useState('');
  const brand = detectBrand(card.number);

  const handleChange = e => {
    const { name, value } = e.target;
    setCard(p => ({
      ...p,
      name:   name==='name'   ? value           : p.name,
      number: name==='number' ? fmtCard(value)  : p.number,
      expiry: name==='expiry' ? fmtExpiry(value): p.expiry,
      cvv:    name==='cvv'    ? fmtCVV(value)   : p.cvv,
    }));
  };

  const handlePay = () => {
    if (!card.name.trim())                         { setErr('أدخل اسم حامل البطاقة'); return; }
    if (card.number.replace(/\s/g,'').length < 16) { setErr('رقم البطاقة غير مكتمل'); return; }
    if (card.expiry.length < 5)                    { setErr('تاريخ الانتهاء غير مكتمل'); return; }
    if (card.cvv.length < 3)                       { setErr('CVV غير مكتمل'); return; }
    setErr('');
    onPay(card);
  };

  return (
    <div>
      {/* Card preview */}
      <div style={s.cardPreview}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <span style={{ opacity:0.6, letterSpacing:2, fontSize:14 }}>▪▪▪▪</span>
          {brand && <span style={{ fontSize:14, fontWeight:700, opacity:0.9 }}>{brand}</span>}
        </div>
        <div style={s.cardNumber}>{card.number || '•••• •••• •••• ••••'}</div>
        <div style={s.cardBottom}>
          <div>
            <div style={s.cardLabel}>CARD HOLDER</div>
            <div style={s.cardValue}>{card.name || 'YOUR NAME'}</div>
          </div>
          <div>
            <div style={s.cardLabel}>EXPIRES</div>
            <div style={s.cardValue}>{card.expiry || 'MM/YY'}</div>
          </div>
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>اسم حامل البطاقة</label>
        <input style={s.input} name="name" placeholder="Ahmed Mohamed"
          value={card.name} onChange={handleChange} />
      </div>
      <div style={s.field}>
        <label style={s.label}>رقم البطاقة</label>
        <input style={s.input} name="number" placeholder="1234 5678 9012 3456"
          value={card.number} onChange={handleChange} inputMode="numeric" />
      </div>
      <div style={{ display:'flex', gap:12 }}>
        <div style={{ ...s.field, flex:1 }}>
          <label style={s.label}>تاريخ الانتهاء</label>
          <input style={s.input} name="expiry" placeholder="MM/YY"
            value={card.expiry} onChange={handleChange} inputMode="numeric" />
        </div>
        <div style={{ ...s.field, flex:1 }}>
          <label style={s.label}>CVV</label>
          <input style={s.input} name="cvv" placeholder="123" type="password"
            value={card.cvv} onChange={handleChange} inputMode="numeric" />
        </div>
      </div>

      {err && <p style={s.errMsg}>⚠ {err}</p>}
      <button style={s.payBtn} onClick={handlePay} disabled={loading}>
        {loading ? '⏳ جاري الدفع...' : `ادفع ${price} EGP 🔒`}
      </button>
      <p style={s.secureNote}>🔒 بيئة تجريبية – لا يتم خصم أي مبالغ حقيقية</p>
    </div>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
const PaymentModal = ({ course, onSuccess, onClose }) => {
  const [method, setMethod] = useState('card');
  const [step,   setStep]   = useState('form');   // form | processing | success | error
  const [errMsg, setErrMsg] = useState('');

  const effectivePrice = course.discount_price
    ? parseFloat(course.discount_price)
    : parseFloat(course.price);
  const originalPrice  = parseFloat(course.price);
  const hasDiscount    = course.discount_price && effectivePrice < originalPrice;
  const discountPct    = hasDiscount
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;

  const price = effectivePrice.toFixed(2);

  const handlePay = async (data) => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 2000));
    try {
      await enrollmentsService.enroll(course.id);
      setStep('success');
    } catch (err) {
      setErrMsg(err.response?.data?.non_field_errors?.[0] || 'فشلت عملية الدفع');
      setStep('error');
    }
  };

  // ── Processing ──
  if (step === 'processing') return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.centered}>
          <div style={s.spinner} />
          <h3 style={s.procTitle}>جاري معالجة الدفع...</h3>
          <p style={s.procSub}>لا تغلق هذه الصفحة</p>
        </div>
      </div>
    </div>
  );

  // ── Success ──
  if (step === 'success') return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.centered}>
          <div style={s.successCircle}>✓</div>
          <h3 style={{ color:'#00c896', margin:'16px 0 8px', fontSize:20 }}>تم الدفع بنجاح! 🎉</h3>
          <p style={s.procSub}>تم تسجيلك في كورس "{course.title}"</p>
          <button style={s.payBtn} onClick={onSuccess}>ابدأ التعلم الآن ▶</button>
        </div>
      </div>
    </div>
  );

  // ── Error ──
  if (step === 'error') return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.centered}>
          <div style={s.errorCircle}>✕</div>
          <h3 style={{ color:'#e94560', margin:'16px 0 8px' }}>فشلت العملية</h3>
          <p style={s.procSub}>{errMsg}</p>
          <button style={{ ...s.payBtn, background:'rgba(255,255,255,0.1)' }}
            onClick={() => setStep('form')}>حاول مرة أخرى</button>
        </div>
      </div>
    </div>
  );

  // ── Main form ──
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h3 style={s.headerTitle}>إتمام الشراء</h3>
            <p style={s.headerSub}>{course.title}</p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Price summary */}
        <div style={s.priceSummary}>
          <div>
            <span style={s.priceLabel}>إجمالي الطلب</span>
            {hasDiscount && (
              <span style={s.originalPrice}>{originalPrice.toFixed(2)} EGP</span>
            )}
          </div>
          <div style={s.priceRight}>
            {hasDiscount && <span style={s.discountBadge}>خصم {discountPct}%</span>}
            <span style={s.effectivePrice}>{price} EGP</span>
          </div>
        </div>

        <div style={s.body}>
          {/* Method selector */}
          <p style={s.methodTitle}>اختر طريقة الدفع</p>
          <div style={s.methodGrid}>
            {METHODS.map(m => (
              <button key={m.id} style={s.methodBtn(method===m.id)}
                onClick={() => setMethod(m.id)}>
                <span style={{ fontSize:22 }}>{m.icon}</span>
                <span style={s.methodLabel}>{m.label}</span>
                <span style={s.methodSub}>{m.sub}</span>
              </button>
            ))}
          </div>

          <div style={s.divider} />

          {/* Form based on method */}
          {method === 'card'    && <CardForm   price={price} onPay={handlePay} loading={false} />}
          {method === 'fawry'   && <FawryForm  price={price} onPay={handlePay} loading={false} />}
          {['instapay','vodafone','orange','etisalat'].includes(method) && (
            <WalletForm method={method} price={price} onPay={handlePay} loading={false} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex',
             alignItems:'center', justifyContent:'center', zIndex:2000,
             backdropFilter:'blur(4px)' },
  modal:   { background:'#1a1a2e', borderRadius:20, width:'92%', maxWidth:480,
             maxHeight:'90vh', overflowY:'auto', border:'1px solid rgba(255,255,255,0.1)',
             boxShadow:'0 30px 80px rgba(0,0,0,0.6)' },

  header:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                 padding:'20px 22px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  headerTitle: { color:'#fff', fontSize:18, fontWeight:800, margin:'0 0 4px' },
  headerSub:   { color:'rgba(255,255,255,0.4)', fontSize:13, margin:0 },
  closeBtn:    { background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,255,255,0.6)',
                 borderRadius:8, width:30, height:30, cursor:'pointer', fontSize:16,
                 display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },

  priceSummary: { display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'12px 22px', background:'rgba(233,69,96,0.08)',
                  borderBottom:'1px solid rgba(255,255,255,0.07)' },
  priceLabel:    { color:'rgba(255,255,255,0.5)', fontSize:13, display:'block' },
  originalPrice: { color:'rgba(255,255,255,0.3)', fontSize:13, textDecoration:'line-through',
                   marginRight:8 },
  priceRight:    { display:'flex', alignItems:'center', gap:8 },
  discountBadge: { background:'rgba(0,200,150,0.15)', color:'#00c896',
                   border:'1px solid rgba(0,200,150,0.3)', borderRadius:20,
                   padding:'2px 10px', fontSize:12, fontWeight:700 },
  effectivePrice:{ color:'#fff', fontSize:22, fontWeight:900 },

  body:        { padding:'16px 22px 22px' },
  methodTitle: { color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600,
                 letterSpacing:1, textTransform:'uppercase', margin:'0 0 12px' },
  methodGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:4 },
  methodBtn:   (active) => ({
    display:'flex', flexDirection:'column', alignItems:'center', gap:4,
    padding:'10px 6px', borderRadius:10, cursor:'pointer',
    background: active ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? 'rgba(233,69,96,0.4)' : 'rgba(255,255,255,0.08)'}`,
    transition:'all 0.15s',
    fontFamily:'Cairo,sans-serif',
  }),
  methodLabel: { color:'#fff', fontSize:12, fontWeight:700 },
  methodSub:   { color:'rgba(255,255,255,0.35)', fontSize:10 },
  divider:     { height:1, background:'rgba(255,255,255,0.07)', margin:'16px 0' },

  // Wallet
  walletInfo:  { display:'flex', alignItems:'center', gap:14, background:'rgba(255,255,255,0.04)',
                 borderRadius:12, padding:'14px', marginBottom:16,
                 border:'1px solid rgba(255,255,255,0.08)' },
  walletName:  { color:'#fff', fontWeight:700, fontSize:15, margin:'0 0 3px' },
  walletSub:   { color:'rgba(255,255,255,0.4)', fontSize:12, margin:0 },
  phoneWrap:   { display:'flex', alignItems:'center', background:'rgba(255,255,255,0.06)',
                 border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
                 overflow:'hidden', marginBottom:14 },
  phoneFlag:   { padding:'11px 12px', color:'rgba(255,255,255,0.5)', fontSize:13,
                 borderLeft:'1px solid rgba(255,255,255,0.08)', flexShrink:0 },
  phoneInput:  { flex:1, background:'none', border:'none', color:'#fff', fontSize:15,
                 padding:'11px 12px', outline:'none', fontFamily:'Cairo,sans-serif' },

  // Fawry
  fawryBox:     { background:'rgba(255,255,255,0.04)', borderRadius:14, padding:20,
                  textAlign:'center', marginBottom:16, border:'1px solid rgba(255,255,255,0.08)' },
  fawryTitle:   { color:'rgba(255,255,255,0.6)', fontSize:13, margin:'0 0 12px' },
  fawryCode:    { background:'rgba(233,69,96,0.1)', border:'1px solid rgba(233,69,96,0.3)',
                  borderRadius:8, padding:'12px 20px', fontSize:22, fontWeight:900,
                  color:'#e94560', letterSpacing:3, marginBottom:8 },
  fawrySub:     { color:'rgba(255,255,255,0.4)', fontSize:12, margin:'0 0 16px' },
  fawrySteps:   { display:'flex', flexDirection:'column', gap:8, textAlign:'right' },
  fawryStep:    { display:'flex', alignItems:'center', gap:10 },
  fawryStepNum: { width:22, height:22, borderRadius:'50%', background:'rgba(233,69,96,0.15)',
                  color:'#e94560', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700, flexShrink:0 },
  fawryStepTxt: { color:'rgba(255,255,255,0.6)', fontSize:13 },

  // Card
  cardPreview: { background:'linear-gradient(135deg,#0f3460,#16213e)', borderRadius:14,
                 padding:'20px 22px', color:'#fff', marginBottom:16,
                 border:'1px solid rgba(255,255,255,0.1)' },
  cardNumber:  { fontSize:17, letterSpacing:4, fontFamily:'monospace', margin:'8px 0 16px' },
  cardBottom:  { display:'flex', justifyContent:'space-between' },
  cardLabel:   { fontSize:9, opacity:0.5, textTransform:'uppercase', letterSpacing:1, marginBottom:3 },
  cardValue:   { fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:1 },

  // Shared form
  field:  { marginBottom:14 },
  label:  { display:'block', color:'rgba(255,255,255,0.55)', fontSize:13,
            fontWeight:600, marginBottom:6 },
  input:  { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.06)',
            border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
            color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box',
            fontFamily:'Cairo,sans-serif' },
  errMsg: { color:'#e94560', fontSize:13, margin:'0 0 12px' },
  payBtn: { width:'100%', padding:'13px', background:'linear-gradient(135deg,#e94560,#c73652)',
            color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700,
            cursor:'pointer', marginTop:4, fontFamily:'Cairo,sans-serif' },
  secureNote: { textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:11, marginTop:10 },

  // Processing / success / error
  centered:     { padding:'48px 24px', display:'flex', flexDirection:'column', alignItems:'center' },
  spinner:      { width:50, height:50, borderRadius:'50%', border:'4px solid rgba(255,255,255,0.1)',
                  borderTopColor:'#e94560', animation:'spin 0.9s linear infinite' },
  procTitle:    { color:'#fff', fontSize:18, fontWeight:700, margin:'20px 0 8px' },
  procSub:      { color:'rgba(255,255,255,0.4)', fontSize:14, margin:'0 0 24px', textAlign:'center' },
  successCircle:{ width:64, height:64, borderRadius:'50%', background:'rgba(0,200,150,0.15)',
                  border:'2px solid #00c896', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:28, color:'#00c896', fontWeight:700 },
  errorCircle:  { width:64, height:64, borderRadius:'50%', background:'rgba(233,69,96,0.12)',
                  border:'2px solid #e94560', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:28, color:'#e94560', fontWeight:700 },
};

if (typeof document !== 'undefined' && !document.getElementById('pm-spin')) {
  const st = document.createElement('style');
  st.id = 'pm-spin';
  st.innerHTML = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(st);
}

export default PaymentModal;