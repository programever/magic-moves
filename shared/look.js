// Camera brightness setting (remembered in this browser, separately for each game).
// cam = how bright the camera picture is (0..1), bg = how strong the game background is over it (0..1)  [Snitch]
// over = the camera drawn again over the background, before the game items (0 = not)                   [most games]
// inset = width of the small camera window (pixels on a 900-high screen)                                [Forest Run]
export const LOOKS = {
  dim: { name: 'Dim', cam: 0.5, bg: 1, over: 0, inset: 220 },
  normal: { name: 'Normal', cam: 0.8, bg: 0.55, over: 0.45, inset: 360 },
  bright: { name: 'Bright', cam: 1, bg: 0.3, over: 0.75, inset: 520 },
};
// each game remembers its own setting (the kids choose per game)
const KEY = 'magic-moves-camera-' + (location.pathname.split('/').filter(Boolean).pop() || 'game');

export function getLookName() {
  try { const v = localStorage.getItem(KEY); return LOOKS[v] ? v : 'normal'; } catch { return 'normal'; }
}
export function setLookName(v) {
  if (!LOOKS[v]) return;
  try { localStorage.setItem(KEY, v); } catch {}
}
export const look = () => LOOKS[getLookName()];

// The next setting (for the C key during play): dim -> normal -> bright -> dim
export function nextLook() {
  const names = Object.keys(LOOKS), v = names[(names.indexOf(getLookName()) + 1) % names.length];
  setLookName(v);
  return LOOKS[v];
}

// Draw the camera again over the game background (call it after the background, before the game items),
// so the kids are clearer. Mirrored, like the rest of the game.
export function drawCameraOver(ctx, video, W, H) {
  const a = look().over;
  if (!a || video.readyState < 2) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W, 0); ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, W, H); ctx.restore();
}

// The menu row + the C key, the same in every game. Call once after the menu exists.
// refresh = the game's own refreshMenu (it is called after a change); onKey(name) = show a short message.
export function setupLookMenu(refresh) {
  const start = document.getElementById('start');
  if (!start || document.querySelector('[data-look]')) return;
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = '<span style="width:auto;margin-left:18px">📷</span>' + Object.entries(LOOKS).map(([k, l]) => `<button data-look="${k}">${l.name}</button>`).join('');
  start.parentNode.insertBefore(row, start);
  const home = document.getElementById('home'); // same line as "All games", so the menu does not get taller
  if (home) row.prepend(home);
  const mark = () => document.querySelectorAll('[data-look]').forEach(b => b.classList.toggle('on', b.dataset.look === getLookName()));
  row.querySelectorAll('[data-look]').forEach(b => b.onclick = () => { setLookName(b.dataset.look); mark(); refresh && refresh(); });
  mark();
  return mark;
}
