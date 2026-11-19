// The players: name + face photo. Real ones live in shared/private/ (not in git, see kids.example.js).
// Without that folder the game still works, with "Player 1" / "Player 2" and no photos.
let kids = { player1: { name: "Player 1" }, player2: { name: "Player 2" } };
try { kids = (await import('./private/kids.js')).default; } catch { console.info('No shared/private/kids.js, using default players'); }
for (const k of Object.values(kids)) {
  k.img = new Image();
  if (k.src) k.img.src = new URL('./private/' + k.src, import.meta.url).href;
}
export const KIDS = kids;

// Draw a kid's face as a circle on a canvas.
export function drawKidFace(ctx, kid, x, y, r, ring) {
  if (!kid.img.complete || !kid.img.naturalWidth) return;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  ctx.drawImage(kid.img, kid.cx - kid.s / 2, kid.cy - kid.s / 2, kid.s, kid.s, x - r, y - r, r * 2, r * 2);
  ctx.restore();
  ctx.strokeStyle = ring; ctx.lineWidth = Math.max(3, r * 0.12); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
}

// A round face picture as an <img> tag, for HTML screens.
export function kidImg(kid, color) {
  if (!kid.img.naturalWidth) return '';
  const c = document.createElement('canvas'); c.width = c.height = 120;
  const x = c.getContext('2d'); x.beginPath(); x.arc(60, 60, 56, 0, 7); x.clip();
  x.drawImage(kid.img, kid.cx - kid.s / 2, kid.cy - kid.s / 2, kid.s, kid.s, 0, 0, 120, 120);
  return `<img src="${c.toDataURL()}" style="width:64px;height:64px;border-radius:50%;border:4px solid ${color};vertical-align:middle">`;
}
