// src/utils/generateCertificate.js
// بيرسم الشهادة على canvas وبيرجع data URL

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawStar(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = Math.PI / 2 + i * ((2 * Math.PI) / 5);
    const b = a + Math.PI / 5;
    if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy - r * Math.sin(a));
    else ctx.lineTo(cx + r * Math.cos(a), cy - r * Math.sin(a));
    ctx.lineTo(cx + r * 0.4 * Math.cos(b), cy - r * 0.4 * Math.sin(b));
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * @param {string} canvasId  - id of <canvas> element
 * @param {string} name      - student name
 * @param {string} title     - course or track name
 * @param {boolean} isTrack  - true = track cert (purple), false = course cert (blue)
 */
export function generateCertificate(canvasId, name, title, isTrack = false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const W = 900, H = 620;
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';

  const ctx = canvas.getContext('2d');
  const primaryColor = isTrack ? '#7F77DD' : '#378ADD';
  const lightColor   = isTrack ? '#EEEDFE' : '#E6F1FB';
  const darkColor    = isTrack ? '#3C3489' : '#0C447C';

  // خلفية
  ctx.fillStyle = '#FAFAF8';
  ctx.fillRect(0, 0, W, H);

  // إطار خارجي
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 10;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // إطار داخلي
  ctx.strokeStyle = isTrack ? '#AFA9EC' : '#85B7EB';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // هيدر ملون
  ctx.fillStyle = lightColor;
  ctx.fillRect(38, 38, W - 76, 75);

  // اسم المنصة
  ctx.fillStyle = darkColor;
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('E-Learning Platform', W / 2, 85);

  // شهادة إتمام
  ctx.fillStyle = '#5F5E5A';
  ctx.font = '15px Arial';
  ctx.fillText('شهادة إتمام', W / 2, 145);

  // اسم الطالب
  ctx.fillStyle = '#2C2C2A';
  ctx.font = 'bold 38px Arial';
  ctx.fillText(name, W / 2, 208);

  // نص "أتمّ بنجاح"
  ctx.fillStyle = '#888780';
  ctx.font = '16px Arial';
  ctx.fillText('أتمّ بنجاح', W / 2, 258);

  // اسم الكورس / التراك (مع line wrapping)
  ctx.fillStyle = darkColor;
  ctx.font = 'bold 28px Arial';
  const lines = wrapText(ctx, title, W - 140);
  lines.forEach((line, i) => ctx.fillText(line, W / 2, 302 + i * 38));

  const afterLines = 302 + lines.length * 38;

  // التاريخ
  ctx.fillStyle = '#888780';
  ctx.font = '14px Arial';
  const dateStr = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  ctx.fillText(dateStr, W / 2, afterLines + 32);

  // خطوط التوقيع
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(150, H - 88); ctx.lineTo(370, H - 88); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(530, H - 88); ctx.lineTo(750, H - 88); ctx.stroke();

  ctx.fillStyle = '#888780';
  ctx.font = '13px Arial';
  ctx.fillText('توقيع الدكتور', 260, H - 68);
  ctx.fillText('توقيع الإدارة', 640, H - 68);

  // نجمة وسط أسفل
  drawStar(ctx, W / 2, H - 55, 14, primaryColor);
}

export function downloadCertificate(canvasId, fileName) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const a = document.createElement('a');
  a.download = `شهادة - ${fileName}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}
