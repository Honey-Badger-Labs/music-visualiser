// Psychedelic Visualiser: turning sound into a few numbers the picture can follow.
// Pure functions, no Web Audio, so the tests can feed them made-up spectra.
(function (global) {
  "use strict";

  // frequency bands, in Hz: what a listener feels as kick, bass line, voice and instruments, cymbals
  var BANDS = { bass: [25, 150], low: [150, 500], mid: [500, 2500], high: [2500, 12000] };

  // spectrum: byte magnitudes 0..255 from AnalyserNode.getByteFrequencyData; binHz = sampleRate / fftSize
  function bands(spectrum, binHz) {
    var out = {};
    Object.keys(BANDS).forEach(function (k) {
      var lo = Math.max(1, Math.floor(BANDS[k][0] / binHz)), hi = Math.min(spectrum.length - 1, Math.ceil(BANDS[k][1] / binHz));
      var sum = 0;
      for (var i = lo; i <= hi; i++) sum += spectrum[i];
      out[k] = hi >= lo ? sum / ((hi - lo + 1) * 255) : 0;
    });
    out.energy = (out.bass * 1.2 + out.low + out.mid + out.high * 0.8) / 4;
    return out;
  }

  // a band level that jumps up quickly and falls away slowly, the way a VU meter does
  function follower(attack, release) {
    var v = 0;
    return function (x, dt) {
      var k = 1 - Math.exp(-dt / (x > v ? attack : release));
      v += (x - v) * k;
      return v;
    };
  }

  // Beats: a sudden rise in the bass, measured against how much the bass usually rises. Comparing rises,
  // not levels, keeps a busy bass line from hiding the kick; comparing with the low point of the last tenth
  // of a second makes it work the same at 60 frames a second or 10. Adapts to loud and quiet sources.
  function beatDetector(opts) {
    opts = opts || {};
    var recent = [], rises = [], histSeconds = opts.window || 1.5, minGap = opts.minGap || 0.26, last = -1e9, t = 0;
    var intervals = [];
    return {
      // level: the bass band (0..1) this frame; dt: seconds since the last frame. Returns true on a beat.
      update: function (level, dt) {
        t += dt;
        recent.push([t, level]);
        while (recent.length && recent[0][0] < t - 0.1) recent.shift();
        var low = Infinity;
        for (var i = 0; i < recent.length; i++) low = Math.min(low, recent[i][1]);
        var rise = Math.max(0, level - low);
        rises.push([t, rise]);
        while (rises.length && rises[0][0] < t - histSeconds) rises.shift();
        var n = rises.length, mean = 0, v = 0;
        for (var j = 0; j < n; j++) mean += rises[j][1];
        mean /= n || 1;
        for (var k = 0; k < n; k++) v += (rises[k][1] - mean) * (rises[k][1] - mean);
        var sd = Math.sqrt(v / (n || 1));
        var beat = n > 4 && rise > 0.04 && rise > mean + sd * (opts.k || 1.4) && t - last >= minGap;
        if (beat) {
          if (t - last < 2) { intervals.push(t - last); if (intervals.length > 16) intervals.shift(); }
          last = t;
        }
        return beat;
      },
      // a tempo estimate from the gaps between recent beats, in beats per minute (null until it has a few)
      bpm: function () {
        if (intervals.length < 4) return null;
        var s = intervals.slice().sort(function (a, b) { return a - b; }), mid = s[Math.floor(s.length / 2)];
        var b = 60 / mid;
        while (b < 70) b *= 2;
        while (b > 180) b /= 2;
        return Math.round(b);
      },
      sinceBeat: function () { return t - last; }
    };
  }

  var api = { BANDS: BANDS, bands: bands, follower: follower, beatDetector: beatDetector };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.VisAnalysis = api;
})(typeof window !== "undefined" ? window : globalThis);
