// Camera + body tracking, shared by all games.
// Usage: await startTracking(showStatus); then every frame: const poses = track(performance.now());
// Each pose is a list of 33 body points (x, y from 0 to 1). 0 = nose, 16 = right wrist, 20 = right finger.
// The camera is mirrored on screen, so screen x = (1 - point.x) * width.
import { PoseLandmarker, FilesetResolver } from './lib/vision_bundle.mjs';

export const video = document.createElement('video');
video.playsInline = true; video.muted = true; video.style.display = 'none';
document.body.append(video);

let landmarker = null, lastVideoTime = -1, poses = [];

export async function startTracking(status = () => {}) {
  try {
    status('Starting camera…');
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
    await video.play();
    status('Loading body tracking…');
    const files = await FilesetResolver.forVisionTasks(new URL('./lib/wasm', import.meta.url).href);
    const opts = delegate => ({
      baseOptions: { modelAssetPath: new URL('./lib/pose_landmarker_lite.task', import.meta.url).href, delegate },
      runningMode: 'VIDEO', numPoses: 2,
      minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5,
    });
    try { landmarker = await PoseLandmarker.createFromOptions(files, opts('GPU')); }
    catch { landmarker = await PoseLandmarker.createFromOptions(files, opts('CPU')); }
    status('');
  } catch (e) {
    status('Problem: ' + e.message);
    console.error(e);
  }
}

export function track(now) {
  if (landmarker && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    poses = landmarker.detectForVideo(video, now).landmarks || [];
  }
  return poses;
}
