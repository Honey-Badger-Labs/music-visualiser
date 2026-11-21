// Psychedelic Visualiser: a built-in demo track, generated live (no audio files), so the visualiser
// has something to dance to with no microphone, no file and no permissions. 118 BPM, in A minor:
// kick, offbeat hats, a sliding bass line, a pad that changes chord every two bars, and a bell arpeggio.
(function (global) {
  "use strict";

  function createDemo(ctx, dest) {
    var BPM = 118, beat = 60 / BPM, out = ctx.createGain(); out.gain.value = 0.8; out.connect(dest);
    var A2 = 110; function hz(s) { return A2 * Math.pow(2, s / 12); }
    var noise = (function () {
      var b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return b;
    })();
    // a wide, soft reverb for the pad and bells
    var verb = ctx.createConvolver(), vb = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var vd = vb.getChannelData(c); for (var i = 0; i < vd.length; i++) vd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / vd.length, 3); }
    verb.buffer = vb; var wet = ctx.createGain(); wet.gain.value = 0.35; verb.connect(wet); wet.connect(out);

    function env(g, t, a, peak, d) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
    function kick(t) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      env(g, t, 0.003, 1, 0.38); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.45);
    }
    function hat(t, open) {
      var n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noise; f.type = "highpass"; f.frequency.value = 7500;
      env(g, t, 0.002, open ? 0.12 : 0.08, open ? 0.22 : 0.05); n.connect(f); f.connect(g); g.connect(out);
      n.start(t, Math.random() * 0.5); n.stop(t + 0.3);
    }
    function clap(t) {
      var n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noise; f.type = "bandpass"; f.frequency.value = 1500; f.Q.value = 0.8;
      env(g, t, 0.004, 0.28, 0.16); n.connect(f); f.connect(g); g.connect(out); g.connect(verb); n.start(t, Math.random() * 0.5); n.stop(t + 0.25);
    }
    function bass(t, s, len) {
      var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(hz(s - 12), t);
      f.type = "lowpass"; f.Q.value = 7; f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(160, t + len);
      env(g, t, 0.005, 0.32, len); o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.05);
    }
    function pad(t, chord, len) {
      chord.forEach(function (s, i) {
        [-8, 8].forEach(function (cents) {
          var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
          o.type = "sawtooth"; o.frequency.value = hz(s); o.detune.value = cents;
          f.type = "lowpass"; f.frequency.value = 900;
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.03, t + len * 0.3); g.gain.linearRampToValueAtTime(0, t + len);
          o.connect(f); f.connect(g); g.connect(out); g.connect(verb); o.start(t); o.stop(t + len + 0.05);
        });
      });
    }
    function bell(t, s) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = hz(s + 12); env(g, t, 0.005, 0.07, 1.2); o.connect(g); g.connect(verb); g.connect(out); o.start(t); o.stop(t + 1.3);
    }

    // Am - F - C - G, two bars each; the bass follows the roots
    var CHORDS = [[0, 3, 7, 12], [-4, 0, 3, 8], [3, 7, 10, 15], [-2, 2, 5, 10]], ROOTS = [0, -4, 3, -2];
    var step = 0, next = ctx.currentTime + 0.1, timer = null, running = true;
    function schedule() {
      while (next < ctx.currentTime + 0.25) {
        var sixteenth = step % 16, bar = Math.floor(step / 16), section = Math.floor(bar / 8) % 4, ch = Math.floor(bar / 2) % 4;
        // a breakdown every fourth section: no kick, the pad and bells carry it
        var drop = section !== 3;
        if (drop && sixteenth % 4 === 0) kick(next);
        if (drop && sixteenth % 4 === 2) hat(next, sixteenth === 14);
        if (sixteenth % 2 === 1) hat(next, false);
        if (drop && (sixteenth === 4 || sixteenth === 12)) clap(next);
        if ([0, 3, 6, 10, 14].indexOf(sixteenth) >= 0) bass(next, ROOTS[ch] + (sixteenth === 14 ? 12 : 0), beat * 0.45);
        if (sixteenth === 0 && bar % 2 === 0) pad(next, CHORDS[ch], beat * 8);
        if (sixteenth % 3 === 0) bell(next, CHORDS[ch][(step / 3) % 4 | 0] + 12);
        next += beat / 4; step++;
      }
      if (running) timer = setTimeout(schedule, 60);
    }
    schedule();
    return { output: out, stop: function () { running = false; clearTimeout(timer); out.gain.setTargetAtTime(0, ctx.currentTime, 0.1); setTimeout(function () { out.disconnect(); }, 600); } };
  }

  global.createDemo = createDemo;
})(typeof window !== "undefined" ? window : globalThis);
