// src/components/CertificateCard.jsx
import { useState } from 'react';
import { generateCertificate, downloadCertificate } from '../utils/generateCertificate';
import styles from './CertificateCard.module.css';

/**
 * Props:
 *   title    {string}  - اسم الكورس أو التراك
 *   isTrack  {boolean} - شهادة تراك كامل ولا كورس واحد
 *   onClose  {func}    - optional، لو عايز تقفلها
 */
export default function CertificateCard({ title, isTrack = false, onClose }) {
  const [name, setName] = useState('');
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState('');
  const canvasId = `cert-${title.replace(/\s+/g, '-').slice(0, 20)}`;

  function handleGenerate() {
    if (!name.trim()) {
      setError('من فضلك اكتب اسمك الكامل');
      return;
    }
    setError('');
    setGenerated(true);
    // setTimeout عشان الـ canvas يتعمل render في الـ DOM الأول
    setTimeout(() => {
      generateCertificate(canvasId, name.trim(), title, isTrack);
    }, 50);
  }

  function handleDownload() {
    downloadCertificate(canvasId, title);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.icon}>{isTrack ? '🏆' : '🎓'}</span>
        <div>
          <p className={styles.label}>{isTrack ? 'شهادة إتمام التراك' : 'شهادة إتمام الكورس'}</p>
          <p className={styles.title}>{title}</p>
        </div>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">✕</button>
        )}
      </div>

      <div className={styles.formRow}>
        <input
          type="text"
          className={styles.input}
          placeholder="اكتب اسمك الكامل..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()}
        />
        <button className={styles.genBtn} onClick={handleGenerate}>
          {generated ? 'إعادة التوليد' : 'توليد الشهادة'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}

      {generated && (
        <div className={styles.canvasWrap}>
          <canvas id={canvasId} />
          <button className={styles.dlBtn} onClick={handleDownload}>
            ⬇ تحميل الشهادة PNG
          </button>
        </div>
      )}
    </div>
  );
}