// Checks the sound analysis with made-up spectra: bands land where they should, beats are found in a beat
// and not in steady sound, and the tempo estimate is right. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import "../analysis.js";             // a plain script: it puts VisAnalysis on the global object
const A = globalThis.VisAnalysis;

const BIN = 48000 / 2048; // Hz per bin at 48 kHz with the page's FFT size
function spectrumWith(hz, level = 255) {
  const s = new Uint8Array(1024);
  const i = Math.round(hz / BIN);
  for (let k = i - 1; k <= i + 1; k++) s[k] = level;
  return s;
}

test("a 60 Hz kick lands in bass, a 5 kHz hat in high", () => {
  const kick = A.bands(spectrumWith(60), BIN), hat = A.bands(spectrumWith(5000), BIN);
  assert.ok(kick.bass > 0.3 && kick.high === 0, JSON.stringify(kick));
  assert.ok(hat.high > 0 && hat.bass === 0, JSON.stringify(hat));
});

test("the follower rises fast and falls slowly", () => {
  const f = A.follower(0.02, 0.4);
  let v = 0;
  for (let i = 0; i < 6; i++) v = f(1, 1 / 60);
  assert.ok(v > 0.9, `rose to ${v}`);
  for (let i = 0; i < 6; i++) v = f(0, 1 / 60);
  assert.ok(v > 0.7, `fell to ${v} in 0.1 s; should still be high`);
});

function play(bpm, seconds, steady = false) {
  const d = A.beatDetector(), dt = 1 / 60;
  let beats = 0;
  for (let t = 0; t < seconds; t += dt) {
    const phase = (t * bpm / 60) % 1;
    // a kick: a sharp hit that decays over a fifth of a beat, over a quiet bed; or steady loud sound
    const level = steady ? 0.6 + 0.02 * Math.sin(t * 7) : 0.08 + 0.7 * Math.exp(-phase * 12);
    if (d.update(level, dt)) beats++;
  }
  return { beats, bpm: d.bpm() };
}

test("finds every beat of a 120 BPM kick, and its tempo", () => {
  const r = play(120, 10);
  assert.ok(r.beats >= 18 && r.beats <= 21, `${r.beats} beats in 10 s`);
  assert.equal(r.bpm, 120);
});

test("finds the tempo of a slow and a fast track", () => {
  assert.ok(Math.abs(play(84, 12).bpm - 84) <= 2);
  assert.ok(Math.abs(play(174, 12).bpm - 174) <= 3);
});

test("no beats in steady sound", () => {
  assert.ok(play(120, 10, true).beats <= 1);
});

test("finds the kick under a busy bass line, at 10 frames a second as at 60", () => {
  // the level the page measured from the demo track: a bass line that never lets the band rest
  for (const fps of [60, 10]) {
    const d = A.beatDetector(), dt = 1 / fps; let beats = 0;
    for (let t = 0; t < 10; t += dt) {
      const beat = (t * 118 / 60) % 1, sixteenth = (t * 118 / 15) % 1;
      const level = 0.45 + 0.12 * Math.exp(-sixteenth * 5) + 0.3 * Math.exp(-beat * 9);
      if (d.update(level, dt)) beats++;
    }
    assert.ok(beats >= 17 && beats <= 21, `${beats} beats in 10 s at ${fps} frames/s (expected about 19.7)`);
    assert.ok(Math.abs(d.bpm() - 118) <= 2, `tempo ${d.bpm()} at ${fps} frames/s`);
  }
});
