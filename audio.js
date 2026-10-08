/* OUROBOROS sound engine - pure Web Audio synthesis, no external assets. */
(function () {
  'use strict';
  var KEY = 'ouroboros-audio';
  var S = { master: 0.8, music: 0.5, sfx: 0.8, muted: false };
  var ctx = null, inited = false;
  var hideG, masterG, comp, sfxBus, musicBus, duck, revIn, conv, revOut, noiseBuf;
  var pg = [null, null, null, null, null], ps = [null, null, null, null, null];
  var cur = { phase: 0, intensity: 0 }, want = false, nextT = 0, tick = 0, timer = null;
  var voiceEnds = [];
  var lastClick = 0;

  // ---------- util ----------
  function clamp01(v) { v = +v; return isFinite(v) ? Math.max(0, Math.min(1, v)) : 0; }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function guard(fn, fb) {
    return function () { try { return fn.apply(null, arguments); } catch (e) { return fb; } };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      ['master', 'music', 'sfx'].forEach(function (k) { if (typeof o[k] === 'number') S[k] = clamp01(o[k]); });
      if (typeof o.muted === 'boolean') S.muted = o.muted;
    } catch (e) {}
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  load();

  // ---------- graph ----------
  function makeIR(sec) {
    var rate = ctx.sampleRate, len = Math.floor(rate * sec);
    var buf = ctx.createBuffer(2, len, rate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c), y = 0;
      for (var i = 0; i < len; i++) {
        var x = i / len;
        var k = 0.85 - 0.7 * Math.min(1, x * 1.6); // darker over time
        y += ((Math.random() * 2 - 1) - y) * k;
        d[i] = y * Math.pow(1 - x, 2.6);
      }
    }
    return buf;
  }

  function setupGraph() {
    hideG = ctx.createGain();
    masterG = ctx.createGain();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 20; comp.ratio.value = 4;
    comp.attack.value = 0.005; comp.release.value = 0.2;
    masterG.connect(hideG); hideG.connect(comp); comp.connect(ctx.destination);

    sfxBus = ctx.createGain(); sfxBus.connect(masterG);
    musicBus = ctx.createGain(); musicBus.connect(masterG);
    duck = ctx.createGain(); duck.connect(musicBus);

    conv = ctx.createConvolver(); conv.buffer = makeIR(3);
    revIn = ctx.createGain(); revOut = ctx.createGain(); revOut.gain.value = 0.55;
    revIn.connect(conv); conv.connect(revOut); revOut.connect(masterG);

    var rv = [0, 0.2, 0.28, 0.6, 0.6];
    for (var p = 1; p <= 4; p++) {
      pg[p] = ctx.createGain(); pg[p].gain.value = 0; pg[p].connect(duck);
      ps[p] = ctx.createGain(); ps[p].gain.value = rv[p]; pg[p].connect(ps[p]); ps[p].connect(revIn);
    }

    var n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    noiseBuf = b;
    applyAll(true);
  }

  function applyAll(instant) {
    if (!ctx) return;
    var t = ctx.currentTime, tc = instant ? 0.005 : 0.04;
    masterG.gain.setTargetAtTime(S.muted ? 0 : S.master, t, tc);
    musicBus.gain.setTargetAtTime(S.muted ? 0 : S.music * 0.3, t, tc);
    sfxBus.gain.setTargetAtTime(S.muted ? 0 : S.sfx * 0.9, t, tc);
  }

  // ---------- voice primitives ----------
  function route(node, dest, rv, list) {
    node.connect(dest || sfxBus);
    if (rv > 0) {
      var s = ctx.createGain(); s.gain.value = rv; node.connect(s); s.connect(revIn); list.push(s);
    }
  }
  function cleanup(src, nodes) {
    src.onended = function () {
      for (var i = 0; i < nodes.length; i++) { try { nodes[i].disconnect(); } catch (e) {} }
    };
  }
  function envelope(g, t, a, d, peak) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  }

  // o: type f f2 t a d g rv dest det lp lp2 q
  function tone(o) {
    var t = o.t, a = Math.max(0.003, o.a === undefined ? 0.005 : o.a), d = Math.max(o.d || 0.2, a + 0.02);
    var osc = ctx.createOscillator(), env = ctx.createGain(), nodes = [osc, env], last = osc;
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + d);
    if (o.det) osc.detune.value = o.det;
    if (o.lp) {
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = o.q || 0.7;
      f.frequency.setValueAtTime(o.lp, t);
      if (o.lp2) f.frequency.exponentialRampToValueAtTime(o.lp2, t + d);
      last.connect(f); last = f; nodes.push(f);
    }
    last.connect(env);
    envelope(env, t, a, d, o.g || 0.1);
    route(env, o.dest, o.rv || 0, nodes);
    osc.start(t); osc.stop(t + d + 0.05);
    cleanup(osc, nodes);
    return osc;
  }

  // o: t d a g ft f f2 q rv dest
  function noise(o) {
    var t = o.t, a = Math.max(0.003, o.a === undefined ? 0.01 : o.a), d = Math.max(o.d || 0.2, a + 0.02);
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), env = ctx.createGain();
    var nodes = [src, f, env];
    src.buffer = noiseBuf; src.loop = true;
    f.type = o.ft || 'bandpass'; f.Q.value = o.q || 0.8;
    f.frequency.setValueAtTime(o.f, t);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + d);
    src.connect(f); f.connect(env);
    envelope(env, t, a, d, o.g || 0.1);
    route(env, o.dest, o.rv || 0, nodes);
    src.start(t, Math.random() * 1.5); src.stop(t + d + 0.05);
    cleanup(src, nodes);
  }

  function bell(m, t, g, d, rv, dest) {
    var f = mtof(m);
    tone({ f: f, t: t, a: 0.004, d: d, g: g, rv: rv, dest: dest });
    tone({ f: f * 2.76, t: t, a: 0.003, d: d * 0.3, g: g * 0.25, rv: rv, dest: dest });
  }

  // soft sustained pad note: detuned saw + triangle through opening lowpass
  function padVoice(o) {
    var t = o.t, atk = o.atk, dur = o.dur, rel = o.rel || 1.5;
    var env = ctx.createGain(), lp = ctx.createBiquadFilter(), nodes = [env, lp], oscs = [];
    lp.type = 'lowpass'; lp.Q.value = 0.6;
    lp.frequency.setValueAtTime(o.lp * 0.5, t);
    lp.frequency.linearRampToValueAtTime(o.lp2 || o.lp, t + atk);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(o.g, t + atk);
    env.gain.setValueAtTime(o.g, t + Math.max(atk, dur - rel));
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var specs = [['sawtooth', -7, 0.45], ['triangle', 7, 1], ['sawtooth', 9, 0.3]];
    for (var i = 0; i < specs.length; i++) {
      var os = ctx.createOscillator(), og = ctx.createGain();
      os.type = specs[i][0]; os.detune.value = specs[i][1]; os.frequency.value = o.f;
      og.gain.value = specs[i][2] * 0.55;
      os.connect(og); og.connect(lp);
      if (o.lfo) o.lfo.connect(os.detune);
      os.start(t); os.stop(t + dur + 0.05);
      oscs.push(os); nodes.push(os, og);
    }
    lp.connect(env);
    route(env, o.dest, o.rv || 0, nodes);
    cleanup(oscs[0], nodes);
  }

  // ---------- SFX ----------
  var SFX = {
    click: function (t, o) {
      var c = clamp01(o && o.combo), f = 640 * Math.pow(2, c * 1.1);
      tone({ f: f, f2: f * 1.15, t: t, a: 0.003, d: 0.07, g: 0.1, rv: 0.05 });
      tone({ type: 'triangle', f: f * 2, t: t, a: 0.003, d: 0.05, g: 0.02 + 0.05 * c, rv: 0.05 });
    },
    buy: function (t) {
      bell(88, t, 0.12, 0.4, 0.25);
      bell(95, t + 0.07, 0.1, 0.5, 0.3);
    },
    research: function (t) {
      [81, 84, 88].forEach(function (m, i) { bell(m, t + i * 0.07, 0.09, 0.45, 0.35); });
      tone({ type: 'triangle', f: mtof(93), t: t + 0.21, d: 0.35, g: 0.03, rv: 0.4 });
    },
    train: function (t) {
      tone({ type: 'sawtooth', f: 110, f2: 440, t: t, a: 0.15, d: 0.95, g: 0.07, lp: 250, lp2: 3500, q: 3, rv: 0.2 });
      noise({ t: t, d: 0.9, a: 0.5, g: 0.04, f: 500, f2: 5000, q: 1.5, rv: 0.2 });
      [72, 76, 79, 84].forEach(function (m, i) {
        bell(m, t + 0.95 + i * 0.03, 0.09, 1.4, 0.4);
        tone({ type: 'triangle', f: mtof(m), t: t + 0.95, a: 0.02, d: 1.1, g: 0.04, rv: 0.3 });
      });
    },
    stage: function (t) {
      function chord(ms, t0, d, g) {
        ms.forEach(function (m, i) {
          var f = mtof(m), s = t0 + i * 0.07;
          tone({ type: 'triangle', f: f, t: s, a: 0.04, d: d, g: g, lp: 2600, rv: 0.3 });
          tone({ type: 'sawtooth', f: f, t: s, a: 0.05, d: d, g: g * 0.3, lp: 1500, det: 6, rv: 0.3 });
        });
      }
      chord([53, 57, 60, 65], t, 0.8, 0.07);
      chord([36, 48, 55, 60, 64, 72], t + 0.5, 1.6, 0.07);
      bell(84, t + 0.85, 0.06, 1.2, 0.4);
    },
    event: function (t) {
      [0, 0.4].forEach(function (o) {
        tone({ type: 'triangle', f: 880, t: t + o, a: 0.02, d: 0.2, g: 0.1, lp: 3000, rv: 0.15 });
        tone({ type: 'triangle', f: 659, t: t + o + 0.18, a: 0.02, d: 0.28, g: 0.1, lp: 3000, rv: 0.15 });
      });
    },
    choose: function (t) {
      tone({ f: 523, t: t, a: 0.01, d: 0.14, g: 0.09, rv: 0.15 });
      tone({ f: 659, t: t + 0.07, a: 0.01, d: 0.28, g: 0.09, rv: 0.2 });
    },
    ach: function (t) {
      [84, 88, 91, 96, 100, 103].forEach(function (m, i) { bell(m, t + i * 0.075, 0.08, 0.7, 0.45); });
      [72, 76, 79].forEach(function (m) { tone({ type: 'triangle', f: mtof(m), t: t + 0.45, a: 0.02, d: 1.2, g: 0.035, rv: 0.4 }); });
    },
    probe: function (t) {
      noise({ t: t, d: 1.5, a: 0.55, g: 0.1, f: 400, f2: 3500, q: 2, rv: 0.45 });
      tone({ f: 180, f2: 760, t: t, a: 0.4, d: 1.4, g: 0.04, lp: 1200, rv: 0.4 });
    },
    golden: function (t) {
      [96, 100, 103].forEach(function (m, i) {
        bell(m, t + i * 0.1, 0.07, 1.0, 0.5);
        tone({ f: mtof(m) * 1.004, t: t + i * 0.1, a: 0.01, d: 0.9, g: 0.035, rv: 0.5 });
      });
    },
    goldenClick: function (t) {
      [72, 76, 79, 84, 88, 91, 96].forEach(function (m, i) {
        bell(m, t + i * 0.055, 0.09, 0.6, 0.4);
        tone({ type: 'triangle', f: mtof(m), t: t + i * 0.055, a: 0.005, d: 0.2, g: 0.04, rv: 0.2 });
      });
      [84, 88, 91, 96].forEach(function (m) { bell(m, t + 0.42, 0.06, 1.3, 0.5); });
    },
    buff_end: function (t) {
      tone({ f: 660, f2: 440, t: t, a: 0.02, d: 0.5, g: 0.09, lp: 1800, rv: 0.25 });
    },
    tab: function (t) {
      tone({ f: 1200, t: t, a: 0.002, d: 0.03, g: 0.035 });
    },
    error: function (t) {
      tone({ f: 120, f2: 70, t: t, a: 0.005, d: 0.25, g: 0.22, lp: 400 });
      noise({ t: t, d: 0.08, g: 0.05, ft: 'lowpass', f: 250 });
    },
    cine: function (t) {
      noise({ t: t, d: 1.0, a: 0.7, g: 0.09, f: 200, f2: 1800, q: 1.2, rv: 0.5 });
      tone({ f: 90, f2: 45, t: t + 0.9, a: 0.01, d: 0.9, g: 0.3 });
      noise({ t: t + 0.9, d: 0.35, g: 0.1, ft: 'lowpass', f: 700, f2: 150, rv: 0.5 });
    },
    chapter: function (t) {
      noise({ t: t, d: 1.7, a: 1.5, g: 0.08, f: 300, f2: 3500, q: 1.2, rv: 0.5 });
      tone({ f: 65, f2: 40, t: t + 1.5, a: 0.01, d: 1.6, g: 0.28 });
      [48, 55, 64, 67, 74].forEach(function (m, i) {
        padVoice({ f: mtof(m), t: t + 1.4 + i * 0.04, atk: 0.3, dur: 4.2, rel: 2.5, g: 0.04, lp: 1200, lp2: 3000, rv: 0.6 });
      });
      bell(88, t + 1.6, 0.06, 2.5, 0.6);
    },
    ending: function (t) {
      [48, 55, 60, 64, 67, 71, 74].forEach(function (m, i) {
        padVoice({ f: mtof(m), t: t + i * 0.18, atk: 2.2, dur: 5.6, rel: 2.5, g: 0.035, lp: 1100, lp2: 2600, rv: 0.7 });
      });
      [84, 88, 91, 95, 98].forEach(function (m, i) { bell(m, t + 1.5 + i * 0.7, 0.05, 2.5, 0.7); });
    },
    rebirth: function (t) {
      // reversed-cymbal style swell, then fresh chord
      noise({ t: t, d: 1.5, a: 1.45, g: 0.12, f: 200, f2: 5000, q: 1.0, rv: 0.4 });
      tone({ type: 'sawtooth', f: 100, f2: 400, t: t, a: 1.4, d: 1.5, g: 0.05, lp: 300, lp2: 3000, rv: 0.3 });
      var t2 = t + 1.5;
      [60, 64, 67, 71, 74].forEach(function (m, i) {
        bell(m + 12, t2 + i * 0.05, 0.08, 2.2, 0.55);
        padVoice({ f: mtof(m - 12), t: t2 + i * 0.03, atk: 0.4, dur: 3.5, rel: 2, g: 0.04, lp: 1200, lp2: 2800, rv: 0.55 });
      });
    }
  };

  function play(name, opts) {
    if (!ctx || S.muted || document.hidden) return;
    var fn = SFX[name];
    if (!fn) return;
    if (ctx.state === 'suspended') ctx.resume();
    var now = ctx.currentTime;
    if (name === 'click') { if (now - lastClick < 0.025) return; lastClick = now; }
    fn(now + 0.01, opts || {});
  }

  // ---------- charge riser ----------
  function noopHandle() { return { setProgress: function () {}, stop: function () {} }; }
  function charge() {
    if (!ctx) return noopHandle();
    var t = ctx.currentTime, nodes = [], oscs = [], stopped = false;
    var out = ctx.createGain(), trem = ctx.createGain(), lp = ctx.createBiquadFilter();
    var mix = ctx.createGain(), lfo = ctx.createOscillator(), lfoG = ctx.createGain();
    var nsrc = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain(), send = ctx.createGain();
    lp.type = 'lowpass'; lp.Q.value = 3; lp.frequency.value = 300;
    out.gain.setValueAtTime(0.0001, t);
    trem.gain.value = 0.65; lfoG.gain.value = 0.35; lfo.frequency.value = 3;
    mix.gain.value = 0.5; send.gain.value = 0.2;
    lfo.connect(lfoG); lfoG.connect(trem.gain);
    [-9, 0, 9].forEach(function (d) {
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.detune.value = d; o.frequency.value = 70;
      o.connect(mix); o.start(t); oscs.push(o);
    });
    nsrc.buffer = noiseBuf; nsrc.loop = true; nf.type = 'bandpass'; nf.Q.value = 0.6; nf.frequency.value = 800; ng.gain.value = 0.1;
    nsrc.connect(nf); nf.connect(ng); ng.connect(lp); nsrc.start(t);
    mix.connect(lp); lp.connect(trem); trem.connect(out); out.connect(sfxBus); out.connect(send); send.connect(revIn);
    lfo.start(t);
    nodes = oscs.concat([out, trem, lp, mix, lfo, lfoG, nsrc, nf, ng, send]);
    function end(delay) {
      var all = oscs.concat([lfo, nsrc]);
      all.forEach(function (n) { try { n.stop(ctx.currentTime + delay); } catch (e) {} });
      setTimeout(function () { nodes.forEach(function (n) { try { n.disconnect(); } catch (e) {} }); }, delay * 1000 + 200);
    }
    return {
      setProgress: guard(function (p) {
        if (stopped) return;
        p = clamp01(p); var k = ctx.currentTime;
        oscs.forEach(function (o) { o.frequency.setTargetAtTime(70 * Math.pow(2, p * 3.2), k, 0.08); });
        lp.frequency.setTargetAtTime(250 * Math.pow(2, p * 5), k, 0.08);
        nf.frequency.setTargetAtTime(800 * Math.pow(2, p * 3), k, 0.08);
        ng.gain.setTargetAtTime(0.1 + 0.3 * p, k, 0.08);
        out.gain.setTargetAtTime(0.03 + 0.2 * p, k, 0.08);
        lfo.frequency.setTargetAtTime(3 + 22 * p * p, k, 0.1);
      }),
      stop: guard(function (success) {
        if (stopped) return; stopped = true;
        var k = ctx.currentTime;
        if (success) {
          out.gain.cancelScheduledValues(k); out.gain.setValueAtTime(out.gain.value, k);
          out.gain.linearRampToValueAtTime(0, k + 0.03); end(0.08);
        } else {
          out.gain.setTargetAtTime(0, k, 0.07); end(0.6);
        }
      })
    };
  }

  // ---------- singularity ----------
  var DROP = 5.2;
  function singularity() {
    if (!ctx) return DROP;
    try {
      var t0 = ctx.currentTime + 0.05, T = t0 + DROP;
      if (S.muted) return DROP;
      // duck music
      duck.gain.cancelScheduledValues(t0);
      duck.gain.setTargetAtTime(0.25, t0, 0.3);
      duck.gain.setTargetAtTime(1, T + 6, 1.5);
      // accelerating tick counter
      var pent = [0, 3, 5, 7, 10], tt = 0, iv = 0.5, n = 0;
      while (tt < DROP - 0.1) {
        var i = Math.min(14, Math.floor(n * 0.5));
        var m = 69 + pent[i % 5] + 12 * Math.floor(i / 5);
        if (i >= 14 && n % 2) m -= 5;
        tone({ f: mtof(m), t: t0 + tt, a: 0.002, d: 0.06, g: 0.07, rv: 0.2 });
        tone({ type: 'triangle', f: mtof(m) * 2, t: t0 + tt, a: 0.002, d: 0.03, g: 0.02 });
        tt += iv; iv = Math.max(iv * 0.9, 0.025); n++;
      }
      // huge riser (cut just before the drop)
      noise({ t: t0, d: DROP - 0.02, a: DROP - 0.1, g: 0.2, f: 200, f2: 9000, q: 1.2, rv: 0.3 });
      tone({ type: 'sawtooth', f: 80, f2: 1200, t: t0, a: DROP - 0.1, d: DROP - 0.02, g: 0.07, lp: 400, lp2: 8000, q: 2, rv: 0.3 });
      tone({ type: 'sawtooth', f: 80.6, f2: 1210, t: t0, a: DROP - 0.1, d: DROP - 0.02, g: 0.05, lp: 400, lp2: 8000, q: 2, rv: 0.3 });
      // drop: sub + noise burst through reverb
      tone({ f: 120, f2: 30, t: T, a: 0.01, d: 3.2, g: 0.45 });
      tone({ f: 240, f2: 60, t: T, a: 0.01, d: 2.2, g: 0.2, rv: 0.2 });
      noise({ t: T, d: 2.6, a: 0.01, g: 0.32, ft: 'lowpass', f: 9000, f2: 400, q: 0.5, rv: 1.3 });
      // angelic pad
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5.2; lg.gain.value = 7; lfo.connect(lg);
      lfo.start(T); lfo.stop(T + 6.4);
      lfo.onended = function () { try { lfo.disconnect(); lg.disconnect(); } catch (e) {} };
      [48, 55, 60, 64, 67, 72, 76, 83].forEach(function (m, k) {
        padVoice({ f: mtof(m), t: T + 0.1 + k * 0.05, atk: 1.5, dur: 6, rel: 2.5, g: 0.032, lp: 1400, lp2: 3200, rv: 0.7, lfo: lg });
      });
      // sparkle
      [88, 91, 95, 96, 100, 103].forEach(function (m, k) { bell(m, T + 0.6 + k * 0.45, 0.04, 2.2, 0.8); });
    } catch (e) {}
    return DROP;
  }

  // ---------- generative music ----------
  var CH = [ // Am7, Fmaj7, Cmaj7, G6
    { b: 45, v: [57, 60, 64, 67] },
    { b: 41, v: [57, 60, 64, 65] },
    { b: 48, v: [55, 59, 64, 67] },
    { b: 43, v: [55, 59, 62, 64] }
  ];
  var CH3 = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 53, 60, 64], [43, 50, 59, 62]];
  var CH4 = [[48, 55, 64, 67], [47, 55, 62, 67], [41, 57, 60, 65], [48, 55, 64, 72]];
  var PENT = [69, 72, 74, 76, 79];

  function canVoice(endT) {
    var now = ctx.currentTime;
    voiceEnds = voiceEnds.filter(function (e) { return e > now; });
    if (voiceEnds.length >= 12) return false;
    voiceEnds.push(endT);
    return true;
  }

  function ep(m, t, g, dur, dest, bright) {
    if (!canVoice(t + dur)) return;
    var f = mtof(m);
    tone({ type: 'triangle', f: f, t: t, a: 0.006, d: dur, g: g, dest: dest, lp: 2500 * (bright || 1) });
    tone({ f: f * 2, t: t, a: 0.003, d: dur * 0.3, g: g * 0.4 * (bright || 1), dest: dest });
  }

  function tickDur() {
    switch (cur.phase) {
      case 1: return 60 / 72 / 4;
      case 2: return 60 / (84 + 24 * cur.intensity) / 4;
      case 3: return 60 / 40 / 4;
      default: return 60 / 32 / 4;
    }
  }

  function scheduleTick(k, t) {
    var ph = cur.phase, I = cur.intensity, dest = pg[ph], bar = Math.floor(k / 16) % 4, ti = k % 16;
    var ch = CH[bar], j = rnd(0, 0.012);
    if (ph === 1) {
      if (ti === 0) {
        ch.v.forEach(function (m, i) { ep(m, t + i * 0.025 + j, 0.05, 2.6, dest, 1); });
        if (canVoice(t + 1.8)) tone({ f: mtof(ch.b), t: t, a: 0.02, d: 1.8, g: 0.12, dest: dest, lp: 500 });
      }
      if (ti === 10 && canVoice(t + 0.9)) tone({ f: mtof(ch.b), t: t + j, a: 0.02, d: 0.9, g: 0.08, dest: dest, lp: 500 });
      if (ti === 6) { ep(ch.v[1], t + j, 0.03, 1.0, dest, 1); ep(ch.v[2], t + j + 0.02, 0.03, 1.0, dest, 1); }
      if (ti === 12 && Math.random() < 0.3) ep(pick(PENT), t + j, 0.035, 1.3, dest, 1.2);
      if (ti % 4 === 2 && I > 0.05) noise({ t: t, d: 0.04, g: 0.045 * I, ft: 'highpass', f: 7000, q: 0.5, dest: dest });
      if (ti % 4 === 3 && I > 0.6 && Math.random() < 0.5) noise({ t: t, d: 0.03, g: 0.02 * I, ft: 'highpass', f: 8000, q: 0.5, dest: dest });
    } else if (ph === 2) {
      if (ti === 0) {
        ch.v.forEach(function (m, i) { ep(m, t + i * 0.02, 0.05, 2.0, dest, 1.5); });
      }
      if ((ti === 0 || ti === 8) && canVoice(t + 1.2)) tone({ f: mtof(ch.b), t: t, a: 0.015, d: 1.2, g: 0.12, dest: dest, lp: 600 });
      var step = I < 0.35 ? 4 : (I < 0.7 ? 2 : 1);
      if (ti % step === 0) {
        var idx = [0, 1, 2, 3, 4, 3, 2, 1][(ti / step) % 8], m = ch.v[idx % 4] + 12 * Math.floor(idx / 4);
        if (canVoice(t + 0.4)) {
          tone({ type: 'triangle', f: mtof(m), t: t, a: 0.004, d: 0.35, g: 0.035, dest: dest, lp: 900 + 6000 * I });
          tone({ f: mtof(m) * 2, t: t, a: 0.003, d: 0.12, g: 0.012, dest: dest });
        }
      }
      if (ti % 4 === 2) noise({ t: t, d: 0.04, g: 0.03 + 0.03 * I, ft: 'highpass', f: 7500, q: 0.5, dest: dest });
      if (ti % 2 === 1 && I > 0.5) noise({ t: t, d: 0.025, g: 0.015, ft: 'highpass', f: 9000, q: 0.5, dest: dest });
      if (I >= 0.8) {
        var kk = 0.3 + 0.7 * Math.min(1, (I - 0.8) / 0.2);
        if (ti % 4 === 0 && canVoice(t + 0.4)) tone({ f: 58, f2: 40, t: t, a: 0.01, d: 0.38, g: 0.13 * kk, dest: dest });
        if (ti === 0 && canVoice(t + 16 * tickDur())) {
          tone({ type: 'sawtooth', f: 55, t: t, a: 0.6, d: 16 * tickDur() + 0.3, g: 0.05 * kk, dest: dest, lp: 150, lp2: 400 });
        }
      }
    } else if (ph === 3) {
      if (ti === 0) {
        CH3[bar].forEach(function (m) {
          if (canVoice(t + 9)) padVoice({ f: mtof(m), t: t, atk: 2.5, dur: 9, rel: 3, g: 0.03, lp: 700 + 800 * I, lp2: 1000 + 1400 * I, dest: dest });
        });
        if (canVoice(t + 8)) tone({ f: mtof(CH3[bar][0] - 12), t: t, a: 1.5, d: 8, g: 0.08, dest: dest });
      }
      if (Math.random() < 0.05 + 0.1 * I && canVoice(t + 2.6)) bell(pick([84, 86, 88, 91, 93, 96]), t + j, 0.03, 2.5, 0, dest);
      if (I > 0.3 && ti % 4 === 0 && Math.random() < I * 0.5 && canVoice(t + 3)) {
        tone({ f: mtof(CH3[bar][Math.floor(Math.random() * 4)] + 12), t: t, a: 0.05, d: 3, g: 0.025, dest: dest });
      }
    } else if (ph === 4) {
      if (ti === 0) {
        CH4[bar].forEach(function (m) {
          if (canVoice(t + 10)) padVoice({ f: mtof(m), t: t, atk: 3.5, dur: 10, rel: 3.5, g: 0.028, lp: 900, lp2: 1500, dest: dest });
        });
      }
      if (ti % 4 === 0 && Math.random() < 0.06 && canVoice(t + 3)) bell(pick([84, 88, 91, 96]), t, 0.02, 3, 0, dest);
    }
  }

  function running() {
    return ctx && want && cur.phase > 0 && !document.hidden && !S.muted && S.music > 0 && ctx.state === 'running';
  }
  function sched() {
    try {
      if (!running()) { nextT = 0; return; }
      var now = ctx.currentTime;
      if (nextT === 0 || nextT < now - 0.2) nextT = now + 0.06;
      var guardN = 0;
      while (nextT < now + 0.25 && guardN++ < 20) {
        scheduleTick(tick, nextT);
        tick++; nextT += tickDur();
      }
    } catch (e) {}
  }

  function setMusic(o) {
    if (!ctx || !o) return;
    var ph = Math.max(1, Math.min(4, Math.round(+o.phase || 1)));
    var I = clamp01(o.intensity);
    if (want && ph === cur.phase && Math.abs(I - cur.intensity) < 0.01) return;
    cur.intensity = I;
    want = true;
    if (ph !== cur.phase) {
      cur.phase = ph; tick = 0;
      var t = ctx.currentTime;
      for (var p = 1; p <= 4; p++) pg[p].gain.setTargetAtTime(p === ph ? 1 : 0, t, 1.2);
    }
  }
  function stopMusic() {
    if (!ctx) return;
    want = false; cur.phase = 0;
    var t = ctx.currentTime;
    for (var p = 1; p <= 4; p++) pg[p].gain.setTargetAtTime(0, t, 0.8);
  }

  // ---------- public ----------
  function onVis() {
    if (!ctx) return;
    var t = ctx.currentTime;
    if (document.hidden) hideG.gain.setTargetAtTime(0, t, 0.15);
    else {
      if (ctx.state === 'suspended') ctx.resume();
      hideG.gain.setTargetAtTime(1, t, 0.2);
      nextT = 0;
    }
  }

  function init() {
    if (inited) { if (ctx && ctx.state === 'suspended') ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    inited = true;
    try { setupGraph(); } catch (e) { ctx = null; return; }
    if (ctx.state === 'suspended') ctx.resume();
    document.addEventListener('visibilitychange', onVis);
    timer = setInterval(sched, 100);
  }

  function settings() { return { master: S.master, music: S.music, sfx: S.sfx, muted: S.muted }; }
  function set(p) {
    if (!p) return;
    ['master', 'music', 'sfx'].forEach(function (k) { if (p[k] !== undefined) S[k] = clamp01(p[k]); });
    if (p.muted !== undefined) S.muted = !!p.muted;
    save();
    applyAll(false);
  }

  window.OURO_AUDIO = {
    init: guard(init),
    settings: guard(settings, { master: 0.8, music: 0.5, sfx: 0.8, muted: false }),
    set: guard(set),
    play: guard(play),
    charge: guard(charge, noopHandle()),
    singularity: guard(singularity, DROP),
    setMusic: guard(setMusic),
    stopMusic: guard(stopMusic)
  };
})();
