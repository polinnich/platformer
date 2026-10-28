

let audioCtx = null;
let muted = false;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function setMute(val) {
  muted = !!val;
}


function beep(freq, duration = 0.1, type = 'square', vol = 0.12) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {  }
}

export function playJump() {
  beep(280, 0.09, 'square', 0.1);
}

export function playCollect() {
  beep(520, 0.08, 'square', 0.12);
  setTimeout(() => beep(780, 0.1, 'square', 0.1), 60);
}

export function playWin() {
  beep(400, 0.12, 'square', 0.12);
  setTimeout(() => beep(550, 0.12, 'square', 0.12), 120);
  setTimeout(() => beep(700, 0.18, 'square', 0.12), 240);
}

export function playLose() {
  beep(200, 0.15, 'sawtooth', 0.1);
  setTimeout(() => beep(120, 0.25, 'sawtooth', 0.1), 120);
}

export function playClick() {
  beep(600, 0.04, 'square', 0.06);
}