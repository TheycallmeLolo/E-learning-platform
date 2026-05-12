import { useState } from 'react';
import { experiencesService } from '../../services/experiences';

const METHODS = [
  { id: 'card',      icon: '💳', label: 'بطاقة بنكية',  sub: 'Visa / Mastercard' },
  { id: 'instapay',  icon: '⚡', label: 'InstaPay',      sub: 'الدفع الفوري' },
  { id: 'vodafone',  icon: '🔴', label: 'Vodafone Cash', sub: 'فودافون كاش' },
  { id: 'orange',    icon: '🟠', label: 'Orange Cash',   sub: 'أورانج كاش' },
  { id: 'fawry',     icon: '🏪', label: 'Fawry',         sub: 'فوري' },
];

const fmtCard   = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
const fmtExpiry = (v) => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2?d.slice(0,2)+'/'+d.slice(2):d; };
const fmtCVV    = (v) => v.replace(/\D/g,'').slice(0,3);

// ─── Card Form ────────────────────────────────────────────────────────────────
const CardForm = ({ price, onPay, loading }) => {
  const [card, setCard] = useState({ name:'', number:'', expiry:'', cvv:'' });
  const [err,  setErr]  = useState('');

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
    setErr(''); onPay(card);
  };

  return (
    <div>
      <div style={s.cardPreview}>
        <div style={s.cardNumber}>{card.number || '•••• •••• •••• ••••'}</div>
        <div style={s.cardBottom}>
          <div><div style={s.cardLabel}>CARD HOLDER</div><div style={s.cardValue}>{card.name || 'YOUR NAME'}</div></div>
          <div><div style={s.cardLabel}>EXPIRES</div><div style={s.cardValue}>{card.expiry || 'MM/YY'}</div></div>
        </div>
      </div>
      <div style={s.field}><label style={s.label}>اسم حامل البطاقة</label>
        <input style={s.input} name="name" placeholder="Ahmed Mohamed" value={card.name} onChange={handleChange} /></div>
      <div style={s.field}><label style={s.label}>رقم البطاقة</label>
        <input style={s.input} name="number" placeholder="1234 5678 9012 3456" value={card.number} onChange={handleChange} /></div>
      <div style={{ display:'flex', gap:12 }}>
        <div style={{ ...s.field, flex:1 }}><label style={s.label}>تاريخ الانتهاء</label>
          <input style={s.input} name="expiry" placeholder="MM/YY" value={card.expiry} onChange={handleChange} /></div>
        <div style={{ ...s.field, flex:1 }}><label style={s.label}>CVV</label>
          <input style={s.input} name="cvv" placeholder="123" type="password" value={card.cvv} onChange={handleChange} /></div>
      </div>
      {err && <p style={s.errMsg}>⚠ {err}</p>}
      <button style={s.payBtn} onClick={handlePay} disabled={loading}>
        {loading ? '⏳ جاري الدفع...' : `ادفع ${price} EGP 🔒`}
      </button>
      <p style={s.secureNote}>🔒 بيئة تجريبية – لا يتم خصم مبالغ حقيقية</p>
    </div>
  );
};

// ─── Wallet Form ──────────────────────────────────────────────────────────────
const WalletForm = ({ method, price, onPay, loading }) => {
  const [phone, setPhone] = useState('');
  const [err,   setErr]   = useState('');
  const handlePay = () => {
    if (phone.replace(/\D/g,'').length !== 11) { setErr('أدخل رقم هاتف صحيح (11 رقم)'); return; }
    setErr(''); onPay({ phone });
  };
  return (
    <div>
      <label style={s.label}>رقم الهاتف</label>
      <div style={s.phoneWrap}>
        <span style={s.phoneFlag}>🇪🇬 +20</span>
        <input style={s.phoneInput} type="tel"
          value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,11))}
          placeholder="01XXXXXXXXX" />
      </div>
      {err && <p style={s.errMsg}>⚠ {err}</p>}
      <button style={s.payBtn} onClick={handlePay} disabled={loading}>
        {loading ? '⏳...' : `ادفع ${price} EGP 🔒`}
      </button>
      <p style={s.secureNote}>🔒 بيئة تجريبية</p>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const ExperiencePaymentModal = ({ experience, onSuccess, onClose }) => {
  const [method, setMethod] = useState('card');
  const [step,   setStep]   = useState('form');
  const [errMsg, setErrMsg] = useState('');

  const price = parseFloat(experience.effective_price).toFixed(2);
  const originalPrice = parseFloat(experience.price).toFixed(2);
  const hasDiscount = experience.discount_price &&
    parseFloat(experience.discount_price) < parseFloat(experience.price);

  const handlePay = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 1500));
    try {
      await experiencesService.buy(experience.id);
      setStep('success');
    } catch (err) {
      setErrMsg(err.response?.data?.detail || 'فشلت عملية الدفع');
      setStep('error');
    }
  };

  if (step === 'processing') return (
    <div style={s.overlay}><div style={s.modal}>
      <div style={s.centered}>
        <div style={s.spinner} />
        <h3 style={s.procTitle}>جاري معالجة الدفع...</h3>
        <p style={s.procSub}>لا تغلق هذه الصفحة</p>
      </div>
    </div></div>
  );

  if (step === 'success') return (
    <div style={s.overlay}><div style={s.modal}>
      <div style={s.centered}>
        <div style={s.successCircle}>✓</div>
        <h3 style={{ color:'#00c896', margin:'16px 0 8px', fontSize:20 }}>تم الشراء بنجاح! 🎉</h3>
        <p style={s.procSub}>يمكنك الآن مشاهدة "{experience.title}"</p>
        <button style={s.payBtn} onClick={onSuccess}>شاهد التجربة الآن ▶</button>
      </div>
    </div></div>
  );

  if (step === 'error') return (
    <div style={s.overlay}><div style={s.modal}>
      <div style={s.centered}>
        <div style={s.errorCircle}>✕</div>
        <h3 style={{ color:'#e94560', margin:'16px 0 8px' }}>فشلت العملية</h3>
        <p style={s.procSub}>{errMsg}</p>
        <button style={{ ...s.payBtn, background:'rgba(255,255,255,0.1)' }}
          onClick={() => setStep('form')}>حاول مرة أخرى</button>
      </div>
    </div></div>
  );

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        <div style={s.header}>
          <div>
            <h3 style={s.headerTitle}>إتمام الشراء</h3>
            <p style={s.headerSub}>{experience.title}</p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={s.priceSummary}>
          <span style={s.priceLabel}>إجمالي الطلب</span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {hasDiscount && <span style={s.originalPrice}>{originalPrice} EGP</span>}
            <span style={s.effectivePrice}>{price} EGP</span>
          </div>
        </div>

        <div style={s.body}>
          <p style={s.methodTitle}>اختر طريقة الدفع</p>
          <div style={s.methodGrid}>
            {METHODS.map(m => (
              <button key={m.id} style={s.methodBtn(method===m.id)} onClick={() => setMethod(m.id)}>
                <span style={{ fontSize:20 }}>{m.icon}</span>
                <span style={s.methodLabel}>{m.label}</span>
              </button>
            ))}
          </div>
          <div style={s.divider} />
          {method === 'card' && <CardForm price={price} onPay={handlePay} loading={false} />}
          {method !== 'card' && method !== 'fawry' && (
            <WalletForm method={method} price={price} onPay={handlePay} loading={false} />
          )}
          {method === 'fawry' && (
            <div style={{ textAlign:'center' }}>
              <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:16 }}>ادفع عند أقرب فرع فوري</p>
              <button style={s.payBtn} onClick={handlePay}>✓ تأكيد الدفع</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const s = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, backdropFilter:'blur(4px)' },
  modal  : { background:'#1a1a2e', borderRadius:20, width:'92%', maxWidth:460, maxHeight:'90vh', overflowY:'auto', border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 30px 80px rgba(0,0,0,0.6)' },
  header : { display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'20px 22px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  headerTitle: { color:'#fff', fontSize:18, fontWeight:800, margin:'0 0 4px' },
  headerSub  : { color:'rgba(255,255,255,0.4)', fontSize:13, margin:0 },
  closeBtn   : { background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,255,255,0.6)', borderRadius:8, width:30, height:30, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' },
  priceSummary: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 22px', background:'rgba(200,151,58,0.08)', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  priceLabel  : { color:'rgba(255,255,255,0.5)', fontSize:13 },
  originalPrice:{ color:'rgba(255,255,255,0.3)', fontSize:13, textDecoration:'line-through' },
  effectivePrice:{ color:'#fff', fontSize:22, fontWeight:900 },
  body       : { padding:'16px 22px 22px' },
  methodTitle: { color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase', margin:'0 0 12px' },
  methodGrid : { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:4 },
  methodBtn  : (active) => ({ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 6px', borderRadius:10, cursor:'pointer', background: active ? 'rgba(200,151,58,0.12)' : 'rgba(255,255,255,0.04)', border:`1px solid ${active ? 'rgba(200,151,58,0.4)' : 'rgba(255,255,255,0.08)'}`, fontFamily:'Cairo,sans-serif' }),
  methodLabel: { color:'#fff', fontSize:11, fontWeight:700 },
  divider    : { height:1, background:'rgba(255,255,255,0.07)', margin:'16px 0' },
  field      : { marginBottom:14 },
  label      : { display:'block', color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:600, marginBottom:6 },
  input      : { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Cairo,sans-serif' },
  errMsg     : { color:'#e94560', fontSize:13, margin:'0 0 12px' },
  payBtn     : { width:'100%', padding:'13px', background:'linear-gradient(135deg,#c8973a,#a07020)', color:'#000', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', marginTop:4, fontFamily:'Cairo,sans-serif' },
  secureNote : { textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:11, marginTop:10 },
  cardPreview: { background:'linear-gradient(135deg,#0f3460,#16213e)', borderRadius:14, padding:'20px 22px', color:'#fff', marginBottom:16, border:'1px solid rgba(255,255,255,0.1)' },
  cardNumber : { fontSize:17, letterSpacing:4, fontFamily:'monospace', margin:'8px 0 16px' },
  cardBottom : { display:'flex', justifyContent:'space-between' },
  cardLabel  : { fontSize:9, opacity:0.5, textTransform:'uppercase', letterSpacing:1, marginBottom:3 },
  cardValue  : { fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:1 },
  phoneWrap  : { display:'flex', alignItems:'center', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, overflow:'hidden', marginBottom:14 },
  phoneFlag  : { padding:'11px 12px', color:'rgba(255,255,255,0.5)', fontSize:13, borderLeft:'1px solid rgba(255,255,255,0.08)', flexShrink:0 },
  phoneInput : { flex:1, background:'none', border:'none', color:'#fff', fontSize:15, padding:'11px 12px', outline:'none', fontFamily:'Cairo,sans-serif' },
  centered   : { padding:'48px 24px', display:'flex', flexDirection:'column', alignItems:'center' },
  spinner    : { width:50, height:50, borderRadius:'50%', border:'4px solid rgba(255,255,255,0.1)', borderTopColor:'#c8973a', animation:'spin 0.9s linear infinite' },
  procTitle  : { color:'#fff', fontSize:18, fontWeight:700, margin:'20px 0 8px' },
  procSub    : { color:'rgba(255,255,255,0.4)', fontSize:14, margin:'0 0 24px', textAlign:'center' },
  successCircle: { width:64, height:64, borderRadius:'50%', background:'rgba(0,200,150,0.15)', border:'2px solid #00c896', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#00c896', fontWeight:700 },
  errorCircle  : { width:64, height:64, borderRadius:'50%', background:'rgba(233,69,96,0.12)', border:'2px solid #e94560', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#e94560', fontWeight:700 },
};

export default ExperiencePaymentModal;
