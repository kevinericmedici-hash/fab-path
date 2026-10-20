/* ========================================
   FAB VALLEY ADVENTURE: SOUND AND MUSIC
   Everything is synthesized live with the
   Web Audio API, so there are no audio files.
   The style is "robotic but charming": square
   and triangle beeps, servo clicks, pneumatic
   hisses and a soft cleanroom hum.

   Music is generated from a seed, so each
   town gets its own tune in a shared style:
     town   - bouncy major pentatonic
     beach  - gentle, with rolling waves
     lab    - calm dorian blips over the hum
     cafe   - laid-back swing with 7th chords
     battle - fast minor arps and a driving beat

   The engine calls FabAdventureAudio.sfx(name)
   and .music(mood, seed). Browsers only allow
   sound after a click or key press, so audio
   starts on the first one.
======================================== */

window.FabAdventureAudio = (function () {

    "use strict";

    const PREF_KEY = "fabPathAdventureAudio";

    let prefs = { music: true, sfx: true };
    try {
        prefs = Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || "{}"));
    } catch (e) { /* storage blocked: defaults */ }

    let ctx = null;
    let master = null;
    let musicBus = null;
    let sfxBus = null;
    let noiseBuf = null;

    const MUSIC_VOL = 0.2;
    const SFX_VOL = 0.5;

    function ensure() {
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) {
                return null;
            }
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0.85;
            master.connect(ctx.destination);
            musicBus = ctx.createGain();
            musicBus.gain.value = prefs.music ? MUSIC_VOL : 0;
            musicBus.connect(master);
            sfxBus = ctx.createGain();
            sfxBus.gain.value = prefs.sfx ? SFX_VOL : 0;
            sfxBus.connect(master);
            noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
            const d = noiseBuf.getChannelData(0);
            for (let i = 0; i < d.length; i++) {
                d[i] = Math.random() * 2 - 1;
            }
        }
        if (ctx.state === "suspended") {
            ctx.resume();
        }
        return ctx;
    }

    function unlock() {
        if (ensure()) {
            startScheduler();
        }
    }

    ["pointerdown", "keydown", "touchstart"].forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));

    document.addEventListener("visibilitychange", () => {
        if (!ctx) {
            return;
        }
        if (document.hidden) {
            ctx.suspend();
        } else {
            ctx.resume();
        }
    });


    /* ---------- Synth voices ---------- */

    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

    // a single enveloped oscillator note
    function tone(freq, t, dur, o) {
        o = o || {};
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = o.type || "square";
        osc.frequency.setValueAtTime(freq, t);
        if (o.slide) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
        }
        if (o.vibrato) {
            const lfo = ctx.createOscillator();
            const lg = ctx.createGain();
            lfo.frequency.value = o.vibrato;
            lg.gain.value = freq * 0.012;
            lfo.connect(lg);
            lg.connect(osc.frequency);
            lfo.start(t);
            lfo.stop(t + dur + 0.1);
        }
        const peak = o.gain || 0.2;
        const a = o.attack || 0.004;
        const r = o.release || 0.06;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + a);
        g.gain.setValueAtTime(peak, t + Math.max(a, dur - r));
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        let node = osc;
        if (o.lowpass) {
            const f = ctx.createBiquadFilter();
            f.type = "lowpass";
            f.frequency.value = o.lowpass;
            osc.connect(f);
            node = f;
        }
        node.connect(g);
        g.connect(o.dest || sfxBus);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    }

    // filtered noise: hisses, clicks and hats
    function noise(t, dur, o) {
        o = o || {};
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        const f = ctx.createBiquadFilter();
        f.type = o.filter || "bandpass";
        f.frequency.value = o.freq || 2000;
        f.Q.value = o.q || 1;
        if (o.sweep) {
            f.frequency.exponentialRampToValueAtTime(o.sweep, t + dur);
        }
        const g = ctx.createGain();
        const peak = o.gain || 0.1;
        g.gain.setValueAtTime(peak, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f);
        f.connect(g);
        g.connect(o.dest || sfxBus);
        src.start(t, Math.random() * 0.5);
        src.stop(t + dur + 0.02);
    }

    function kick(t, dest, gain) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
        g.gain.setValueAtTime(gain || 0.5, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        osc.connect(g);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + 0.18);
    }


    /* ---------- Sound effects ---------- */

    let stepFlip = false;
    let lastStep = 0;
    let lastBlip = 0;

    const SFX = {
        // a soft servo tick per footstep
        step(t) {
            stepFlip = !stepFlip;
            noise(t, 0.03, { filter: "highpass", freq: 4200, gain: 0.05 });
            tone(stepFlip ? 1650 : 1450, t, 0.018, { gain: 0.018, type: "square" });
        },
        // robot chatter for each line of dialog
        blip(t) {
            const notes = [1046, 1175, 1318, 1568, 1760];
            const a = notes[Math.floor(Math.random() * notes.length)];
            const b = notes[Math.floor(Math.random() * notes.length)];
            tone(a, t, 0.045, { gain: 0.05, type: "square", lowpass: 3500 });
            tone(b, t + 0.055, 0.045, { gain: 0.04, type: "square", lowpass: 3500 });
        },
        select(t) {
            tone(880, t, 0.05, { gain: 0.06, type: "triangle" });
            tone(1320, t + 0.045, 0.06, { gain: 0.06, type: "triangle" });
        },
        // a little servo whirr as a panel slides open or shut
        open(t) {
            tone(260, t, 0.14, { slide: 620, gain: 0.05, type: "sawtooth", lowpass: 1400 });
            noise(t, 0.08, { filter: "highpass", freq: 5000, gain: 0.02 });
        },
        close(t) {
            tone(560, t, 0.12, { slide: 240, gain: 0.045, type: "sawtooth", lowpass: 1200 });
        },
        // pneumatic door: hiss and clunk
        door(t) {
            noise(t, 0.32, { filter: "bandpass", freq: 2600, sweep: 900, q: 0.8, gain: 0.12 });
            tone(95, t + 0.22, 0.1, { gain: 0.25, type: "sine", slide: 60 });
        },
        pickup(t) {
            [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.06, 0.08, { gain: 0.07, type: "square", lowpass: 5000 }));
            tone(2637, t + 0.26, 0.2, { gain: 0.04, type: "triangle" });
        },
        // an item clicked into a machine
        use(t) {
            noise(t, 0.02, { filter: "highpass", freq: 3000, gain: 0.12 });
            noise(t + 0.08, 0.02, { filter: "highpass", freq: 2400, gain: 0.1 });
            tone(660, t + 0.1, 0.07, { gain: 0.05, type: "triangle" });
        },
        xp(t) {
            tone(1318, t, 0.08, { gain: 0.06, type: "triangle" });
            tone(1976, t + 0.07, 0.14, { gain: 0.06, type: "triangle" });
        },
        levelup(t) {
            [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, t + i * 0.07, 0.1, { gain: 0.08, type: "square", lowpass: 4000 }));
            [523, 659, 784].forEach((f) => tone(f * 2, t + 0.4, 0.45, { gain: 0.05, type: "triangle", release: 0.3 }));
        },
        correct(t) {
            tone(784, t, 0.07, { gain: 0.08, type: "square", lowpass: 4000 });
            tone(1175, t + 0.08, 0.12, { gain: 0.08, type: "square", lowpass: 4000 });
        },
        // a sad little error buzz
        wrong(t) {
            tone(220, t, 0.12, { gain: 0.07, type: "square", lowpass: 1200 });
            tone(165, t + 0.13, 0.2, { gain: 0.07, type: "square", lowpass: 1000 });
        },
        // your move lands: a zap
        zap(t) {
            tone(1400, t, 0.16, { slide: 180, gain: 0.09, type: "sawtooth", lowpass: 3000 });
            noise(t, 0.12, { filter: "highpass", freq: 2500, gain: 0.08 });
        },
        // the boss hits you: a low crunch
        hurt(t) {
            tone(150, t, 0.2, { slide: 55, gain: 0.16, type: "square", lowpass: 700 });
            noise(t, 0.18, { filter: "lowpass", freq: 900, gain: 0.18 });
        },
        victory(t) {
            const mel = [[72, 0], [76, 0.12], [79, 0.24], [84, 0.36], [79, 0.6], [84, 0.72]];
            mel.forEach(([m, d]) => tone(mtof(m), t + d, 0.14, { gain: 0.08, type: "square", lowpass: 4500 }));
            [60, 64, 67].forEach((m) => tone(mtof(m), t + 0.72, 0.6, { gain: 0.05, type: "triangle", release: 0.4 }));
        },
        lose(t) {
            [[67, 0], [63, 0.2], [60, 0.4]].forEach(([m, d]) => tone(mtof(m), t + d, 0.24, { gain: 0.07, type: "triangle" }));
        },
        // a machine finishing its job: chime and two robot beeps
        done(t) {
            [[76, 0], [79, 0.09], [88, 0.18]].forEach(([m, d]) => tone(mtof(m), t + d, 0.12, { gain: 0.07, type: "triangle" }));
            tone(2093, t + 0.42, 0.05, { gain: 0.04, type: "square" });
            tone(2093, t + 0.52, 0.05, { gain: 0.04, type: "square" });
        },
        tram(t) {
            tone(988, t, 0.18, { gain: 0.07, type: "triangle" });
            tone(784, t + 0.2, 0.3, { gain: 0.07, type: "triangle" });
        }
    };

    function sfx(name) {
        if (!prefs.sfx || !ensure() || !SFX[name]) {
            return;
        }
        const now = ctx.currentTime;
        if (name === "step") {
            if (now - lastStep < 0.12) {
                return;
            }
            lastStep = now;
        }
        if (name === "blip") {
            if (now - lastBlip < 0.08) {
                return;
            }
            lastBlip = now;
        }
        SFX[name](now + 0.005);
    }


    /* ---------- Music ---------- */

    const SCALES = {
        majPenta: [0, 2, 4, 7, 9],
        major: [0, 2, 4, 5, 7, 9, 11],
        lydian: [0, 2, 4, 6, 7, 9, 11],
        dorian: [0, 2, 3, 5, 7, 9, 10],
        mixo: [0, 2, 4, 5, 7, 9, 10],
        minor: [0, 2, 3, 5, 7, 8, 10]
    };

    // chord roots are scale degrees (0-based) of a 7-note scale
    const MOODS = {
        town: { bpm: 112, scale: "major", melody: "majPenta", prog: [0, 4, 5, 3], root: 60, lead: "square", arp: 8, hats: true, kick: [0, 8], swing: 0 },
        beach: { bpm: 94, scale: "lydian", melody: "majPenta", prog: [0, 3, 0, 4], root: 62, lead: "triangle", arp: 8, hats: false, kick: [0], swing: 0, waves: true },
        lab: { bpm: 84, scale: "dorian", melody: "dorian", prog: [0, 3, 0, 6], root: 57, lead: "triangle", arp: 16, hats: false, servo: true, kick: [], swing: 0, hum: true },
        cafe: { bpm: 92, scale: "mixo", melody: "mixo", prog: [1, 4, 0, 5], root: 58, lead: "triangle", arp: 0, hats: true, kick: [0, 10], swing: 0.18, sevenths: true },
        battle: { bpm: 148, scale: "minor", melody: "minor", prog: [0, 5, 6, 0], root: 57, lead: "square", arp: 16, hats: true, kick: [0, 4, 8, 12], swing: 0, drive: true }
    };

    function hashStr(s) {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function rng(seed) {
        let a = seed;
        return () => {
            a = (a + 0x6d2b79f5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function degreeToMidi(root, scale, deg) {
        const n = scale.length;
        const oct = Math.floor(deg / n);
        const idx = ((deg % n) + n) % n;
        return root + oct * 12 + scale[idx];
    }

    // Build a 4-bar song from the mood and a seed: A A' B A phrasing.
    function compose(moodId, seedStr) {
        const md = MOODS[moodId];
        const rand = rng(hashStr(moodId + ":" + seedStr));
        const scale = SCALES[md.scale];
        const shift = moodId === "battle" ? 0 : Math.floor(rand() * 5) - 2;
        const root = md.root + shift;
        const mel = SCALES[md.melody];
        const motif = () => {
            const notes = [];
            let deg = Math.floor(rand() * 4) + 3;
            for (let s = 0; s < 16; s++) {
                const onBeat = s % 4 === 0;
                const play = onBeat ? rand() < 0.85 : rand() < (moodId === "battle" ? 0.55 : 0.32);
                if (play) {
                    deg = Math.max(0, Math.min(9, deg + Math.floor(rand() * 5) - 2));
                    const len = onBeat && rand() < 0.4 ? 3 : 1;
                    notes.push({ s: s, deg: deg, len: len });
                }
            }
            return notes;
        };
        const a = motif();
        const b = motif();
        const a2 = a.map((n, i) => (i === a.length - 1 ? Object.assign({}, n, { deg: 0, len: 4 }) : n));
        return { md: md, root: root, scale: scale, mel: mel, bars: [a, a2, b, a], prog: md.prog, rand: rand };
    }

    const player = {
        song: null,
        moodKey: "",
        want: null,
        step: 0,
        bar: 0,
        nextTime: 0,
        timer: null
    };

    function scheduleStep(t) {
        const song = player.song;
        if (!song || !prefs.music) {
            return;
        }
        const md = song.md;
        const s = player.step;
        const bar = player.bar;
        const chordDeg = song.prog[bar % song.prog.length];
        const out = musicBus;
        const stepDur = 60 / md.bpm / 4;
        const chordTones = [0, 2, 4].concat(md.sevenths ? [6] : []).map((k) => degreeToMidi(song.root, song.scale, chordDeg + k));

        // bass: roots and fifths
        if (s % 4 === 0 || (md.drive && s % 2 === 0)) {
            const bassNote = chordTones[0] - 24 + (s === 8 && !md.drive ? 7 : 0);
            tone(mtof(bassNote), t, stepDur * (md.drive ? 1.8 : 3.4), { type: "triangle", gain: md.drive ? 0.32 : 0.28, dest: out, release: 0.05 });
        }

        // arpeggio: a robot tapping out the chord
        if (md.arp && s % (16 / md.arp) === 0) {
            const k = (s / (16 / md.arp)) % chordTones.length;
            tone(mtof(chordTones[k] + 12), t, stepDur * 0.9, { type: "square", gain: 0.035, dest: out, lowpass: md.drive ? 3200 : 2200 });
        }

        // cafe comping: soft 7th chords on the offbeats
        if (md.sevenths && (s === 4 || s === 10)) {
            chordTones.forEach((m) => tone(mtof(m), t, stepDur * 2.5, { type: "triangle", gain: 0.035, dest: out, release: 0.12 }));
        }

        // lead melody
        const phrase = song.bars[bar % 4];
        phrase.filter((n) => n.s === s).forEach((n) => {
            const m = degreeToMidi(song.root + 12, song.mel.length === 5 ? song.mel : song.scale, n.deg);
            tone(mtof(m), t, stepDur * n.len * 0.95, { type: md.lead, gain: md.lead === "square" ? 0.05 : 0.08, dest: out, lowpass: 3800, vibrato: n.len > 2 ? 5.5 : 0 });
        });

        // percussion: kick, pneumatic hats and servo clicks
        if (md.kick.includes(s)) {
            kick(t, out, md.drive ? 0.45 : 0.32);
        }
        if (md.hats && s % 2 === 0 && s % 4 !== 0) {
            noise(t, 0.035, { filter: "highpass", freq: 7000, gain: md.drive ? 0.06 : 0.035, dest: out });
        }
        if (md.drive && (s === 4 || s === 12)) {
            noise(t, 0.12, { filter: "bandpass", freq: 1800, q: 0.7, gain: 0.12, dest: out });
        }
        if (md.servo && (s === 6 || s === 14)) {
            noise(t, 0.015, { filter: "highpass", freq: 5000, gain: 0.05, dest: out });
            tone(2400 + (bar % 2) * 300, t + 0.02, 0.03, { type: "square", gain: 0.015, dest: out });
        }

        // the cleanroom hum under the labs, and waves at the beach
        if (s === 0 && md.hum) {
            tone(mtof(song.root - 24), t, stepDur * 16, { type: "sawtooth", gain: 0.03, dest: out, lowpass: 320, attack: 0.4, release: 0.6 });
            tone(mtof(song.root - 17), t, stepDur * 16, { type: "sawtooth", gain: 0.02, dest: out, lowpass: 320, attack: 0.4, release: 0.6 });
        }
        if (s === 0 && md.waves && bar % 2 === 0) {
            noise(t, stepDur * 14, { filter: "lowpass", freq: 600, sweep: 1500, gain: 0.05, dest: out });
        }
    }

    function tick() {
        if (!ctx || !player.song) {
            return;
        }
        const md = player.song.md;
        const stepDur = 60 / md.bpm / 4;
        while (player.nextTime < ctx.currentTime + 0.15) {
            const swingOff = md.swing && player.step % 2 === 1 ? stepDur * md.swing : 0;
            scheduleStep(player.nextTime + swingOff);
            player.nextTime += stepDur;
            player.step++;
            if (player.step >= 16) {
                player.step = 0;
                player.bar++;
                // switch songs only at the end of a bar, with a quick fade in
                if (player.want && player.want.key !== player.moodKey) {
                    applySong();
                }
            }
        }
    }

    function applySong() {
        const w = player.want;
        player.moodKey = w.key;
        player.song = compose(w.mood, w.seed);
        player.bar = 0;
        player.step = 0;
        if (musicBus && prefs.music) {
            const t = ctx.currentTime;
            musicBus.gain.cancelScheduledValues(t);
            musicBus.gain.setValueAtTime(0.0001, t);
            musicBus.gain.exponentialRampToValueAtTime(MUSIC_VOL, t + 0.6);
        }
    }

    function startScheduler() {
        if (player.timer || !ctx) {
            return;
        }
        player.nextTime = ctx.currentTime + 0.05;
        if (player.want) {
            applySong();
        }
        player.timer = setInterval(tick, 25);
    }

    function music(mood, seed) {
        const key = mood + ":" + (mood === "battle" ? "" : seed);
        player.want = { mood: mood, seed: seed, key: key };
        if (!ctx || !player.timer) {
            return;
        }
        if (!player.song || mood === "battle" || player.moodKey.split(":")[0] === "battle") {
            // battles start (and end) right away instead of waiting for the bar
            if (player.moodKey !== key) {
                applySong();
                player.nextTime = ctx.currentTime + 0.05;
            }
        }
    }


    /* ---------- Preferences ---------- */

    function setPrefs(p) {
        prefs = Object.assign(prefs, p);
        try {
            localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
        } catch (e) { /* storage blocked */ }
        if (ctx) {
            const t = ctx.currentTime;
            musicBus.gain.cancelScheduledValues(t);
            musicBus.gain.setValueAtTime(prefs.music ? MUSIC_VOL : 0, t);
            sfxBus.gain.setValueAtTime(prefs.sfx ? SFX_VOL : 0, t);
        }
    }

    // cycles: everything on → music off → all muted → everything on
    function cycle() {
        if (prefs.music && prefs.sfx) {
            setPrefs({ music: false, sfx: true });
        } else if (prefs.sfx) {
            setPrefs({ music: false, sfx: false });
        } else {
            setPrefs({ music: true, sfx: true });
        }
        return state();
    }

    function state() {
        return prefs.music && prefs.sfx ? "on" : prefs.sfx ? "sfx" : "off";
    }

    // for checking from the console: is audio running, and what's playing?
    function status() {
        return { audio: ctx ? ctx.state : "not started", playing: player.moodKey, bar: player.bar, prefs: Object.assign({}, prefs) };
    }

    return { sfx: sfx, music: music, cycle: cycle, state: state, unlock: unlock, status: status };

})();
