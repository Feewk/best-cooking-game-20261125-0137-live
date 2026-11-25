// audio.js — tiny WebAudio synth: every sound is made from oscillators, so
// the game ships no audio files and still answers every action at once.

let ctx = null;

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function blip(freqA, freqB, seconds, type, gainPeak) {
  const ac = ensureContext();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqA, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqB, 1), t + seconds);
  gain.gain.setValueAtTime(gainPeak, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + seconds);
}

export const sfx = {
  pickup() { blip(520, 760, 0.08, 'square', 0.05); },
  chop() { blip(220, 90, 0.07, 'sawtooth', 0.09); },
  sizzle() { blip(1400, 900, 0.16, 'sawtooth', 0.03); },
  plate() { blip(880, 1180, 0.09, 'triangle', 0.07); },
  serve() { blip(660, 990, 0.12, 'triangle', 0.08); blip(990, 1320, 0.14, 'triangle', 0.06); },
  trash() { blip(300, 120, 0.12, 'square', 0.06); },
  bell() { blip(1560, 1560, 0.2, 'sine', 0.08); },
  fail() { blip(240, 110, 0.25, 'sawtooth', 0.07); },
};

export function unlockAudio() {
  const ac = ensureContext();
  if (ac && ac.state === 'suspended') ac.resume();
}

let muted = false;

// M toggles the kitchen quiet; returns the new state for the HUD to show.
export function toggleMute() {
  muted = !muted;
  if (ctx) ctx.suspend();
  if (ctx && !muted) ctx.resume();
  return muted;
}
