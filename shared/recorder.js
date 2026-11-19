// Records each round (game picture + game sound). The video lives only in memory:
// on the end screen the kids can "Watch replay" or "Save video" (goes to Downloads).
// If nobody saves it, it is thrown away when the next round starts or the page closes.
//
// Use in a game:  recStart(canvas, ac, [gameSong, winnerSong]) when the round starts,
//                 recStop() when it ends, recCancel() when going back to the menu.

const W = 960, FPS = 24;                 // small video, so the Intel Mac stays fast
let small = null, sctx = null, src = null, copyTimer = null;
let rec = null, chunks = [], url = null, recDest = null, recCtx = null, songs = [];
const hooked = new WeakSet();

// Every sound that goes to the speakers also goes to the recording.
const connect = AudioNode.prototype.connect;
AudioNode.prototype.connect = function (target, ...rest) {
  const r = connect.call(this, target, ...rest);
  if (recDest && this.context === recCtx && target === recCtx.destination) connect.call(this, recDest);
  return r;
};

function hookSongs(ac, list) {
  songs = list;
  for (const el of list) {
    if (hooked.has(el)) continue;
    hooked.add(el);
    try { ac.createMediaElementSource(el).connect(ac.destination); } catch (e) { console.warn('song not recorded', e); }
  }
}

function copyFrame() { // copy the big game canvas into the small video canvas
  if (!src) return;
  const h = Math.round(W * src.height / src.width);
  if (small.height !== h) small.height = h;
  sctx.drawImage(src, 0, 0, W, h);
}

export function recStart(canvas, ac, songList = []) {
  recCancel();
  if (!window.MediaRecorder) return;
  try {
    if (!recDest || recCtx !== ac) { recCtx = ac; recDest = ac.createMediaStreamDestination(); }
    hookSongs(ac, songList);
    if (!small) { small = document.createElement('canvas'); small.width = W; small.height = 540; sctx = small.getContext('2d'); }
    src = canvas; copyFrame();
    copyTimer = setInterval(copyFrame, 1000 / FPS);
    const stream = small.captureStream(FPS);
    recDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    const type = ['video/webm;codecs=vp8,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
    rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 2_000_000 });
    chunks = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec.start(1000);
  } catch (e) { console.warn('recording off', e); rec = null; }
}

export function recStop() {
  clearInterval(copyTimer); copyTimer = null;
  if (!rec || rec.state === 'inactive') return;
  rec.onstop = () => {
    url = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
    chunks = [];
    showButtons(true);
  };
  rec.stop();
}

export function recCancel() { // throw the video away
  clearInterval(copyTimer); copyTimer = null;
  if (rec && rec.state !== 'inactive') { rec.onstop = null; rec.stop(); }
  rec = null; chunks = [];
  if (url) { URL.revokeObjectURL(url); url = null; }
  showButtons(false); closeReplay();
}
addEventListener('pagehide', recCancel);

// ---------- end screen: "Watch replay" + "Save video" ----------
const box = document.createElement('div');
box.id = 'replayBox';
box.innerHTML = `<span class="ask">🎬 Watch your game?</span>
  <button id="watchBtn">▶ Replay</button> <button id="saveBtn">💾 Save video</button>
  <div class="note">Not saved = deleted when you play again.</div>`;
const style = document.createElement('style');
style.textContent = `
  #replayBox { display: none; text-align: center; }
  #replayBox .ask { font-size: 24px; margin-right: 10px; }
  #replayBox .note { font-size: 14px; opacity: .65; margin-top: 4px; }
  #replayBox button { font-size: 22px; padding: 8px 22px; }
  @media (max-height: 820px) { /* small screen: make the end screen fit */
    #end h1 { font-size: 34px !important; }
    #end .cup, #end .cup svg { width: 120px !important; }
    #end .cupface { top: 46px !important; }
    #end .cupface img { width: 50px !important; height: 50px !important; }
    #result { font-size: 22px !important; line-height: 1.35 !important; }
    #result img { width: 44px !important; height: 44px !important; }
    #end .again { font-size: 30px !important; padding: 12px 44px !important; }
  }
  #replay { position: fixed; inset: 0; z-index: 50; background: #000d; display: none;
    flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  #replay video { max-width: 92vw; max-height: 80vh; border-radius: 14px; box-shadow: 0 0 40px #ffd70066; }`;
const player = document.createElement('div');
player.id = 'replay';
player.innerHTML = `<video controls playsinline></video>
  <div><button id="saveBtn2">💾 Save video</button> <button id="closeReplay">✖ Close</button></div>`;

function mount() {
  document.head.append(style);
  document.body.append(player);
  const end = document.getElementById('end'), again = end && end.querySelector('.again');
  if (again) end.insertBefore(box, again); else if (end) end.append(box);
  box.querySelector('#watchBtn').onclick = openReplay;
  box.querySelector('#saveBtn').onclick = save;
  player.querySelector('#saveBtn2').onclick = save;
  player.querySelector('#closeReplay').onclick = closeReplay;
}
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', mount); else mount();

function showButtons(on) { box.style.display = on && url ? 'block' : 'none'; }

function openReplay() {
  if (!url) return;
  songs.forEach(s => s.pause()); // stop the winner song so the replay sound is clear
  const v = player.querySelector('video');
  v.src = url; player.style.display = 'flex';
  // Chrome does not write the length into recorded videos; jump to the end once so the time bar works
  v.onloadedmetadata = () => {
    if (v.duration !== Infinity) { v.play().catch(() => {}); return; }
    v.ontimeupdate = () => { v.ontimeupdate = null; v.currentTime = 0; v.play().catch(() => {}); };
    v.currentTime = 1e9;
  };
}
function closeReplay() {
  const v = player.querySelector('video');
  v.pause(); v.removeAttribute('src'); v.load();
  player.style.display = 'none';
}

function save() {
  if (!url) return;
  const game = location.pathname.split('/').filter(Boolean).pop() || 'game';
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  const a = document.createElement('a');
  a.href = url;
  a.download = `magic-moves-${game}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.webm`;
  document.body.append(a); a.click(); a.remove();
  for (const b of [box.querySelector('#saveBtn'), player.querySelector('#saveBtn2')]) b.textContent = '✅ Saved!';
  setTimeout(() => { for (const b of [box.querySelector('#saveBtn'), player.querySelector('#saveBtn2')]) b.textContent = '💾 Save video'; }, 2500);
}
