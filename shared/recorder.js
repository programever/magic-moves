// Records each round (from 5 s after the start): the CAMERA picture + the MICROPHONE sound of the room (no game picture, no game music).
// The video lives only in memory: on the end screen the kids can "Replay" or "Save video" (goes to Downloads).
// If nobody saves it, it is thrown away when the next round starts, the menu opens or the page closes.
//
// Use in a game:  recStart() when the round starts, recStop() when it ends, recCancel() when going back to the menu.
// Games call recStart(canvas, ac, [gameSong, winnerSong]); only the songs are used (paused during a replay).
import { video } from './tracking.js';

const SKIP = 5000; // do not record the first 5 seconds of a round (the 3-2-1 countdown and getting ready)
let rec = null, chunks = [], url = null, mic = null, micAsked = false, songs = [], waitTimer = null, round = 0;

// Ask for the microphone once (Chrome remembers "Allow" for this page). No microphone = video without sound.
async function getMic() {
  if (mic || micAsked) return mic;
  micAsked = true;
  try { mic = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); }
  catch (e) { console.warn('no microphone, recording without sound', e); }
  return mic;
}
getMic(); // ask early, on page load, not in the middle of the countdown

export async function recStart(_canvas, _ac, songList = []) {
  recCancel();
  songs = songList;
  if (!window.MediaRecorder) return;
  const cam = video.srcObject;
  if (!cam || !cam.getVideoTracks().length) return; // camera not ready: no recording this round
  const me = round, t0 = performance.now();
  const m = await getMic();
  if (me !== round) return; // cancelled while waiting
  waitTimer = setTimeout(() => { if (me === round) begin(cam, m); }, Math.max(0, SKIP - (performance.now() - t0)));
}

function begin(cam, m) {
  try {
    const stream = new MediaStream([...cam.getVideoTracks(), ...(m ? m.getAudioTracks() : [])]);
    const type = ['video/webm;codecs=vp8,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
    const r = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 2_500_000 });
    chunks = [];
    r.ondataavailable = e => e.data.size && chunks.push(e.data);
    r.start(1000);
    rec = r;
  } catch (e) { console.warn('recording off', e); rec = null; }
}

export function recStop() {
  clearTimeout(waitTimer);
  const r = rec;
  if (!r || r.state === 'inactive') return;
  r.onstop = () => {
    if (rec !== r) return; // a newer round started meanwhile
    url = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
    chunks = [];
    showButtons(true);
  };
  r.stop();
}

export function recCancel() { // throw the video away
  clearTimeout(waitTimer); round++;
  if (rec && rec.state !== 'inactive') { rec.onstop = null; rec.stop(); }
  rec = null; chunks = [];
  if (url) { URL.revokeObjectURL(url); url = null; }
  showButtons(false); closeReplay();
}
addEventListener('pagehide', recCancel);

// ---------- end screen: "Replay" + "Save video" ----------
const box = document.createElement('div');
box.id = 'replayBox';
box.innerHTML = `<span class="ask">🎬 Watch yourselves?</span>
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
  #replay { position: fixed; inset: 0; z-index: 1000; background: #000; display: none;
    flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
  #replay video { display: block !important; width: 92vw; height: 80vh; object-fit: contain; background: #111; border-radius: 14px;
    transform: scaleX(-1); } /* mirrored, like in the game */
  #replay .bar { display: flex; gap: 14px; }
  #replay button { font: inherit; font-size: 24px; padding: 10px 26px; border-radius: 40px; border: 3px solid #fff5;
    background: #ffffff22; color: #fff; cursor: pointer; }`;
const player = document.createElement('div');
player.id = 'replay';
player.innerHTML = `<video playsinline></video>
  <div class="bar"><button id="playPause">⏸ Pause</button> <button id="saveBtn2">💾 Save video</button>
  <button id="closeReplay">✖ Close</button></div>`;

function mount() {
  document.head.append(style);
  document.body.append(player);
  const end = document.getElementById('end'), again = end && end.querySelector('.again');
  if (again) end.insertBefore(box, again); else if (end) end.append(box);
  box.querySelector('#watchBtn').onclick = openReplay;
  box.querySelector('#saveBtn').onclick = save;
  player.querySelector('#saveBtn2').onclick = save;
  player.querySelector('#closeReplay').onclick = closeReplay;
  const v = player.querySelector('video'), pp = player.querySelector('#playPause');
  pp.onclick = () => { if (v.paused || v.ended) v.play(); else v.pause(); };
  v.onplay = () => pp.textContent = '⏸ Pause';
  v.onpause = v.onended = () => pp.textContent = '▶ Play';
}
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', mount); else mount();

function showButtons(on) { box.style.display = on && url ? 'block' : 'none'; }

function openReplay() {
  if (!url) return;
  songs.forEach(s => s.pause()); // stop the winner song so the replay sound is clear
  const v = player.querySelector('video');
  player.style.display = 'flex';
  v.src = url;
  v.currentTime = 0;
  v.play().catch(e => console.warn('replay', e));
}
function closeReplay() {
  const v = player.querySelector('video');
  if (!v) return;
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
