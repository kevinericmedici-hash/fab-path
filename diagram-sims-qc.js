/* ========================================
   QUANTUM COMPUTING CHIPS: INTERACTIVE SIMULATORS, PART 1

   Unit 1: bits, qubits and quantum physics (bytes, scale, quanta, double slit).
   Unit 2: why quantum (memory explosion, a timeline, the ingredients).
   Unit 3: bits vs qubits (coin, register, bit-or-qubit game).
   Unit 4: the Bloch sphere (what the poles mean, latitude, longitude).
   Unit 5: superposition and measurement (amplitudes, collapse, bases).
   Unit 6: entanglement (two-qubit state, Bell pairs, the CHSH test).
   Unit 7: interference (waves, an interferometer, Grover's search).
   Unit 8: what quantum computers are good for.

   Registers on window.FabInteract; shares the helpers from
   diagram-sims-mems.js. Chains diagram-sims-qc-b.js (units 9-14),
   diagram-sims-qc-c.js (units 15-20), diagram-sims-qc-d.js (units 21-27)
   and diagram-sims-qc-3d.js (the 3D models).
   Teaching models: numbers are illustrative unless a slide says otherwise.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers) {
        return;
    }

    const M = F.memsHelpers;
    const clamp = M.clamp;
    const mulberry = M.mulberry;
    const seg = M.seg;
    const wire = M.wire;
    const head = M.head;
    const setVal = M.setVal;
    const out = M.out;
    const stat = M.stat;
    const animate = M.animate;
    const quiz = M.quiz;
    const stepper = M.stepper;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const TEAL = "rgba(84,224,199,";
    const GOLD = "rgba(255,214,102,";
    const ROSE = "rgba(255,105,120,";
    const BLUE = "rgba(120,180,255,";
    const GREY = "rgba(170,179,207,";
    const TEXT = "rgba(245,247,255,";
    const PURPLE = "rgba(190,150,255,";

    // ---------- shared drawing helpers (also copied into the -b file) ----------

    function canvasFor(w, h, aria) {

        return '<canvas class="fd-sim-canvas fd-wide" width="' + w + '" height="' + h + '" role="img" aria-label="' + aria + '"></canvas>';
    }

    function clear(ctx, w, h) {

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(6,10,24,.55)";
        ctx.fillRect(0, 0, w, h);
    }

    function txt(ctx, s, x, y, size, color, align, bold) {

        ctx.font = (bold ? "bold " : "") + size + "px sans-serif";
        ctx.textAlign = align || "center";
        ctx.fillStyle = color || (TEXT + ".9)");
        ctx.fillText(s, x, y);
    }

    function dot(ctx, x, y, r, fill) {

        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    function line(ctx, x1, y1, x2, y2, col, w, dash) {

        ctx.strokeStyle = col;
        ctx.lineWidth = w || 1.5;
        ctx.setLineDash(dash || []);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function arrow(ctx, x1, y1, x2, y2, col, w) {

        const a = Math.atan2(y2 - y1, x2 - x1);
        const hl = 10;

        line(ctx, x1, y1, x2 - Math.cos(a) * hl * 0.6, y2 - Math.sin(a) * hl * 0.6, col, w || 2.5);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - hl * Math.cos(a - 0.4), y2 - hl * Math.sin(a - 0.4));
        ctx.lineTo(x2 - hl * Math.cos(a + 0.4), y2 - hl * Math.sin(a + 0.4));
        ctx.closePath();
        ctx.fill();
    }

    function box(ctx, x, y, w, h, fill, stroke) {

        if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.strokeRect(x, y, w, h); }
    }

    // Histogram of 0/1 counts.
    function hist01(ctx, x, y, w, h, n0, n1, labels) {

        const tot = Math.max(1, n0 + n1);
        const bw = w / 2 - 20;

        [[n0, labels ? labels[0] : "0", TEAL], [n1, labels ? labels[1] : "1", GOLD]].forEach(function (b, i) {

            const bh = (b[0] / tot) * (h - 30);
            const bx = x + 10 + i * (w / 2);

            box(ctx, bx, y + h - 20 - bh, bw, bh, b[2] + ".75)", b[2] + "1)");
            txt(ctx, b[1], bx + bw / 2, y + h - 4, 14, TEXT + ".9)", "center", true);
            txt(ctx, b[0] + " (" + Math.round(b[0] / tot * 100) + "%)", bx + bw / 2, y + h - 26 - bh, 12, TEXT + ".85)");
        });
    }

    function sup(n) { return String(n).split("").map(function (c) { return "⁰¹²³⁴⁵⁶⁷⁸⁹⁻"["0123456789-".indexOf(c)] || c; }).join(""); }

    function deg(x) { return x * Math.PI / 180; }

    // A generic canvas simulator: sliders, segment buttons, action buttons, stats and a canvas.
    function make(name, cfg) {

        SIMS[name] = function (root) {

            const state = Object.assign({}, cfg.defaults || {});
            const defaults = Object.assign({}, state);
            const data = {};
            let html = head(cfg.title);

            if (cfg.w) { html += canvasFor(cfg.w, cfg.h, cfg.aria || cfg.title); }
            if (cfg.stats) { html += '<div class="fd-stat-row">' + cfg.stats.map(function (s) { return stat(s[0], s[1]); }).join("") + "</div>"; }
            if (cfg.verdict !== false) { html += '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>'; }
            if (cfg.extraHTML) { html += cfg.extraHTML; }
            (cfg.segs || []).forEach(function (s) { html += seg(s[0], s[1], s[2]); });
            if (cfg.actions) { html += '<div class="fd-play">' + cfg.actions.map(function (a) { return '<button type="button" class="fd-sim-btn" data-act="' + a[0] + '">' + a[1] + "</button>"; }).join("") + "</div>"; }
            if (cfg.sliders) { html += '<div class="fd-sim-controls">' + cfg.sliders.map(function (s) { return slider({ label: s[0], key: s[1], min: s[2], max: s[3], step: s[4], value: state[s[1]] }); }).join("") + "</div>"; }
            if (cfg.note) { html += '<p class="fd-sim-note" data-out="note"></p>'; }
            if (cfg.formula) { html += '<p class="fd-sim-formula">' + cfg.formula + "</p>"; }

            root.innerHTML = html;

            const canvas = root.querySelector("canvas");
            const ctx = canvas ? canvas.getContext("2d") : null;
            let hit = false;
            let time = 0;

            if (cfg.init) { cfg.init(state, data, root); }

            function refresh() {

                (cfg.sliders || []).forEach(function (s) { setVal(root, s[1], s[5] ? s[5](state[s[1]], state) : state[s[1]]); });

                const r = cfg.read ? cfg.read(state, data, root) : {};

                Object.keys(r).forEach(function (k) { out(root, k, r[k]); });

                if (!hit && cfg.reward && cfg.reward.when(state, data)) {

                    hit = true;
                    F.reward(name, 10, cfg.reward.msg);
                }
            }

            function draw() {

                if (ctx && cfg.draw) {

                    clear(ctx, cfg.w, cfg.h);
                    cfg.draw(ctx, state, data, time);
                }
            }

            data.redraw = function () { refresh(); draw(); };

            root.querySelectorAll("[data-act]").forEach(function (b) {

                b.addEventListener("click", function () {

                    cfg.act(b.dataset.act, state, data, root);
                    refresh();

                    if (!cfg.animated) { draw(); }
                });
            });

            wire(root, state, defaults, function () {

                if (cfg.onChange) { cfg.onChange(state, data); }

                refresh();

                if (!cfg.animated) { draw(); }
            });

            const rs = root.querySelector("[data-reset]");

            if (rs) {

                rs.addEventListener("click", function () {

                    if (cfg.init) { cfg.init(state, data, root); }

                    refresh();
                    draw();
                });
            }

            refresh();
            draw();

            if (cfg.animated) {

                animate(root, function (dt) {

                    time += dt;

                    if (cfg.step) { cfg.step(dt, state, data); }

                    draw();

                    if (cfg.liveRead) { refresh(); }
                });
            }
        };
    }

    F.qcHelpers = { make: make, canvasFor: canvasFor, clear: clear, txt: txt, dot: dot, line: line, arrow: arrow, box: box, hist01: hist01, sup: sup, deg: deg, TEAL: TEAL, GOLD: GOLD, ROSE: ROSE, BLUE: BLUE, GREY: GREY, TEXT: TEXT, PURPLE: PURPLE };


    /* ======================================
       UNIT 1: BITS, QUBITS AND QUANTUM PHYSICS
    ====================================== */

    // Eight bits: toggle them and see the number and the letter they spell.
    SIMS["qc-bits"] = function (root) {

        const st = { bits: [0, 1, 0, 0, 0, 0, 0, 1], target: "Q", won: false };

        root.innerHTML = head("Try it: eight bits make a byte") +
            '<p class="fd-sim-note">Each bit is a switch: 0 (off) or 1 (on). Tap the bits to make the letter shown in gold.</p>' +
            '<div data-row style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:12px 0"></div>' +
            '<div class="fd-stat-row">' + stat("As a number", "num") + stat("As a letter", "chr") + stat("Target letter", "tgt") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-new>New target letter</button></div>' +
            '<p class="fd-sim-formula">A bit (short for "binary digit") is the smallest piece of information: a 0 or a 1. Eight bits make a byte, enough for 256 patterns: every letter, number and symbol on a keyboard. In your phone, each bit is stored as a transistor that is switched on or off. Everything digital, from photos to videos, is just a very long list of bits.</p>';

        const row = root.querySelector("[data-row]");
        const rand = mulberry(Date.now() % 7777);

        function render() {

            row.innerHTML = "";

            st.bits.forEach(function (b, i) {

                const btn = document.createElement("button");

                btn.type = "button";
                btn.className = "fd-sim-btn" + (b ? " on" : "");
                btn.textContent = String(b);
                btn.title = "bit worth " + Math.pow(2, 7 - i);
                btn.style.cssText = "min-width:46px;padding:14px 0;font-size:20px;font-weight:800";
                btn.addEventListener("click", function () { st.bits[i] = 1 - st.bits[i]; render(); });
                row.appendChild(btn);
            });

            const n = st.bits.reduce(function (a, b) { return a * 2 + b; }, 0);
            const ch = n >= 32 && n < 127 ? String.fromCharCode(n) : "·";

            out(root, "num", String(n));
            out(root, "chr", ch);
            out(root, "tgt", st.target + " (" + st.target.charCodeAt(0) + ")");

            if (ch === st.target) {

                out(root, "verdict", "You spelled " + st.target + " in binary: " + st.bits.join(""));

                if (!st.won) { st.won = true; F.reward("qc-bits", 10, "You wrote a letter in binary"); }

            } else {

                out(root, "verdict", "Leftmost bit is worth 128, then 64, 32, 16, 8, 4, 2, 1");
            }
        }

        root.querySelector("[data-new]").addEventListener("click", function () { st.target = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(rand() * 26)); render(); });
        root.querySelector("[data-reset]").addEventListener("click", function () { st.bits = [0, 0, 0, 0, 0, 0, 0, 0]; render(); });

        render();
    };


    const SCALE = [
        { lg: 0.23, n: "a person", e: "🧍" },
        { lg: -3, n: "an ant", e: "🐜" },
        { lg: -4, n: "a hair's width", e: "〰️" },
        { lg: -5, n: "a blood cell", e: "🔴" },
        { lg: -6, n: "a bacterium", e: "🦠" },
        { lg: -7.7, n: "a transistor in a modern chip", e: "▦" },
        { lg: -8.7, n: "the width of DNA", e: "🧬" },
        { lg: -10, n: "an atom", e: "⚛️" }
    ];

    make("qc-scale", {
        title: "Try it: zoom down to where quantum physics takes over",
        w: 680, h: 230,
        aria: "A size scale from a person down to an atom, with a marker for the chosen size and a shaded zone where quantum effects become impossible to ignore.",
        defaults: { lg: 0 },
        sliders: [["Zoom down to", "lg", -10.5, 0.5, 0.05, function (v) { return fmtLen(v); }]],
        stats: [["Size", "size"], ["About as big as", "obj"]],
        formula: "Quantum physics is the set of rules that governs very small things: atoms, electrons and particles of light (photons). The rules apply to everything, but for big, warm objects the strange effects average out and everyday physics works fine. They become impossible to ignore for tiny things, and for carefully isolated, very cold systems. Quantum chips are built to be exactly that.",
        read: function (s) {

            const near = SCALE.reduce(function (a, b) { return Math.abs(b.lg - s.lg) < Math.abs(a.lg - s.lg) ? b : a; });

            return {
                size: fmtLen(s.lg),
                obj: near.e + " " + near.n,
                verdict: s.lg > -7 ? "Everyday physics works well here" : s.lg > -9 ? "Quantum effects start to matter: transistors already feel them" : "Deep in the quantum world: atoms and electrons follow quantum rules"
            };
        },
        reward: { when: function (s) { return s.lg <= -10; }, msg: "You zoomed all the way down to an atom" },
        draw: function (ctx, s) {

            const L = 40;
            const R = 650;
            const X = function (lg) { return L + (R - L) * (0.5 - lg) / 11; };
            const g = ctx.createLinearGradient(X(-6.5), 0, X(-10.5), 0);

            g.addColorStop(0, "rgba(190,150,255,0)");
            g.addColorStop(1, "rgba(190,150,255,.35)");
            box(ctx, X(-6.5), 30, X(-10.5) - X(-6.5), 150, g);
            txt(ctx, "quantum effects matter →", X(-8.5), 48, 12, PURPLE + "1)", "center", true);
            txt(ctx, "← everyday physics", X(-2), 48, 12, TEAL + "1)", "center", true);
            line(ctx, L, 150, R, 150, GREY + ".6)", 1);

            [0, -3, -6, -9].forEach(function (k) { line(ctx, X(k), 146, X(k), 154, GREY + ".8)", 1); txt(ctx, fmtLen(k), X(k), 172, 11, GREY + ".9)"); });

            SCALE.forEach(function (o, i) {

                const y = 90 + (i % 2) * 26;

                txt(ctx, o.e, X(o.lg), y, 18, TEXT + "1)");
            });

            line(ctx, X(s.lg), 60, X(s.lg), 150, GOLD + "1)", 2.5);
            dot(ctx, X(s.lg), 150, 6, GOLD + "1)");
            txt(ctx, "1 m to 0.1 nm: each step is ten times smaller", (L + R) / 2, 210, 11, GREY + ".85)");
        }
    });

    function fmtLen(lg) {

        const m = Math.pow(10, lg);

        if (m >= 1) { return m.toPrecision(2) + " m"; }
        if (m >= 1e-3) { return (m * 1e3).toPrecision(2) + " mm"; }
        if (m >= 1e-6) { return (m * 1e6).toPrecision(2) + " µm"; }
        if (m >= 1e-9) { return (m * 1e9).toPrecision(2) + " nm"; }

        return (m * 1e9).toPrecision(2) + " nm";
    }


    SIMS["qc-quanta"] = stepper({
        title: "Explore: energy comes in packets (quanta)",
        viewBox: "0 0 340 150",
        aria: "A smooth ramp compared with a staircase of energy levels, and an atom giving off light only at certain colours.",
        interval: 6.5,
        steps: [
            { t: "What you'd expect: a smooth ramp", text: "In everyday life, energy seems to come in any amount: a ball can roll at any speed, a lamp can glow at any brightness." },
            { t: "What really happens: a staircase", text: "At the scale of atoms, energy comes only in fixed packets called quanta. An electron in an atom can sit on one step or the next, never in between. That's where the name 'quantum' comes from." },
            { t: "Light is made of packets too", text: "Light comes in packets called photons. Each photon's energy is E = hf (h is Planck's constant, f the frequency), so bluer light carries more energy per photon." },
            { t: "Atoms glow at only certain colours", text: "When an electron drops from one step to a lower one, it gives off one photon with exactly that energy gap. That's why each element glows with its own fingerprint of colours." },
            { t: "Why it matters for qubits", text: "A qubit uses two of these steps: the bottom one is called 0 and the next one up is 1. Because the steps are separate, you can tell them apart and switch between them precisely." }
        ],
        rewardKey: "qc-quanta",
        rewardMsg: "You learned where the word 'quantum' comes from",
        draw: function (step, st) {

            let s = "";

            if (step === 0) {

                s += '<polygon points="40,120 300,120 300,30" style="fill:rgba(84,224,199,.25);stroke:#54e0c7"/>';
                const k = (st.anim * 0.25) % 1;

                s += '<circle cx="' + (40 + k * 260) + '" cy="' + (120 - k * 90 - 7) + '" r="6" style="fill:#ffd666"/>';

            } else {

                for (let i = 0; i < 5; i++) { s += '<rect x="' + (40 + i * 52) + '" y="' + (120 - (i + 1) * 18) + '" width="52" height="' + ((i + 1) * 18) + '" style="fill:rgba(190,150,255,.2);stroke:#be96ff"/>'; }

                const lvl = Math.floor(st.anim * 0.5) % 5;

                s += '<circle cx="' + (66 + lvl * 52) + '" cy="' + (120 - (lvl + 1) * 18 - 7) + '" r="6" style="fill:#ffd666"/>';
            }

            if (step >= 2) {

                [["#ff6978", 250], ["#78b4ff", 280], ["#be96ff", 305]].forEach(function (c) { s += '<line x1="' + c[1] + '" y1="132" x2="' + c[1] + '" y2="146" style="stroke:' + c[0] + ';stroke-width:4"/>'; });
                s += '<text x="200" y="143" text-anchor="end" style="font-size:7px;fill:rgba(245,247,255,.85)">only certain colours →</text>';
            }

            if (step === 4) {

                s += '<text x="66" y="22" text-anchor="middle" style="font-size:9px;font-weight:700;fill:#54e0c7">0</text>';
                s += '<text x="118" y="22" text-anchor="middle" style="font-size:9px;font-weight:700;fill:#ffd666">1</text>';
                s += '<rect x="40" y="66" width="104" height="58" rx="4" style="fill:none;stroke:#ffd666;stroke-dasharray:4 3"/>';
            }

            return s;
        }
    });


    make("qc-doubleslit", {
        title: "Try it: the double-slit experiment, one electron at a time",
        w: 680, h: 280,
        aria: "Electrons are fired one at a time at a wall with two slits. Each lands as a single dot on the screen, and over time the dots build up a pattern of bright and dark stripes.",
        defaults: { watch: "no" },
        segs: [["Detector at the slits", "watch", [["no", "Off: don't look"], ["yes", "On: watch which slit"]]]],
        actions: [["play", "Fire electrons"], ["clr", "Clear the screen"]],
        stats: [["Electrons fired", "n"]],
        animated: true,
        liveRead: true,
        formula: "Each electron arrives as a single dot, like a particle. But hundreds of dots build up stripes of light and dark: an interference pattern, which only waves make. Each electron behaves as a wave passing through both slits at once, and the probability of where it lands follows that wave. Turn the detector on to see which slit each electron used, and the stripes vanish. Looking changes the result: this is the heart of quantum physics.",
        init: function (s, d) { d.dots = []; d.fly = []; d.run = false; d.t = 0; d.rand = mulberry(31); },
        onChange: function (s, d) { d.dots = []; d.fly = []; },
        act: function (id, s, d) { if (id === "clr") { d.dots = []; d.fly = []; } else { d.run = !d.run; } },
        step: function (dt, s, d) {

            if (d.run) {

                d.t += dt;

                while (d.t > 0.08) {

                    d.t -= 0.08;

                    const y = sampleY(s, d.rand);

                    d.fly.push({ x: 60, y0: 140, y1: y, k: 0 });
                }
            }

            d.fly.forEach(function (f) { f.k += dt * 1.4; });
            d.fly = d.fly.filter(function (f) { if (f.k >= 1) { d.dots.push(f.y1); return false; } return true; });

            if (d.dots.length > 2500) { d.dots = d.dots.slice(-2500); }
        },
        read: function (s, d) {

            return {
                n: String(d.dots.length),
                verdict: d.dots.length < 80 ? "Fire electrons and watch the screen fill up" : s.watch === "no" ? "Stripes: each electron went through both slits as a wave" : "Two plain bands: watching the slits destroyed the interference"
            };
        },
        reward: { when: function (s, d) { return d.dots.length >= 600; }, msg: "You built an interference pattern one electron at a time" },
        draw: function (ctx, s, d) {

            box(ctx, 30, 120, 50, 40, GREY + ".5)", GREY + "1)");
            txt(ctx, "electron gun", 55, 178, 11, GREY + "1)");
            box(ctx, 300, 20, 10, 100, GREY + ".7)");
            box(ctx, 300, 128, 10, 24, GREY + ".7)");
            box(ctx, 300, 160, 10, 100, GREY + ".7)");
            txt(ctx, "two slits", 305, 274, 11, GREY + "1)");

            if (s.watch === "yes") { dot(ctx, 330, 140, 7, ROSE + ".9)"); txt(ctx, "👁 detector", 342, 112, 11, ROSE + "1)", "left", true); }

            box(ctx, 560, 20, 14, 240, "rgba(255,255,255,.06)", GREY + ".6)");
            txt(ctx, "screen", 567, 274, 11, GREY + "1)");

            d.fly.forEach(function (f) {

                const x = f.k < 0.45 ? 80 + (300 - 80) * f.k / 0.45 : 310 + (560 - 310) * (f.k - 0.45) / 0.55;
                const y = f.k < 0.45 ? 140 : 140 + (f.y1 - 140) * (f.k - 0.45) / 0.55;

                dot(ctx, x, y, 2.5, TEAL + ".9)");
            });

            const bins = new Array(60).fill(0);

            d.dots.forEach(function (y) { const i = Math.floor((y - 20) / 4); if (i >= 0 && i < 60) { bins[i]++; } dot(ctx, 562 + ((y * 7.3) % 10), y, 1.3, TEAL + ".85)"); });

            const mx = Math.max(1, Math.max.apply(null, bins));

            bins.forEach(function (b, i) { box(ctx, 580, 20 + i * 4, (b / mx) * 80, 3.5, GOLD + ".75)"); });
        }
    });

    // Where an electron lands on the screen (y in pixels, 20 to 260).
    function sampleY(s, rand) {

        for (let tries = 0; tries < 200; tries++) {

            const y = 20 + rand() * 240;
            const u = (y - 140) / 120;
            const env = Math.pow(Math.max(0.0001, Math.abs(Math.sin(u * 3.2) / (u * 3.2 || 1e-6))), 2);
            let p;

            if (s.watch === "no") {

                p = env * Math.pow(Math.cos(u * 11), 2);

            } else {

                const a = Math.exp(-Math.pow((u - 0.12) / 0.32, 2));
                const b = Math.exp(-Math.pow((u + 0.12) / 0.32, 2));

                p = 0.5 * (a + b) * env * 1.4;
            }

            if (rand() < p) { return y; }
        }

        return 140;
    }


    /* ======================================
       UNIT 2: WHY QUANTUM?
    ====================================== */

    // Memory a classical computer needs to store the state of n qubits.
    const STORES = [
        { b: 1.6e10, n: "a laptop's memory (16 GB)" },
        { b: 1e12, n: "a large hard drive (1 TB)" },
        { b: 1e16, n: "the biggest supercomputers (about 10 petabytes)" },
        { b: 1.5e23, n: "all the digital data on Earth (about 150 zettabytes)" }
    ];

    function bytesText(lg) {

        const units = [["bytes", 0], ["kB", 3], ["MB", 6], ["GB", 9], ["TB", 12], ["PB", 15], ["EB", 18], ["ZB", 21], ["YB", 24]];

        if (lg > 26) { return "10" + sup(Math.floor(lg)) + " bytes"; }

        let u = units[0];

        units.forEach(function (x) { if (lg >= x[1]) { u = x; } });

        const v = Math.pow(10, lg - u[1]);

        return (v >= 100 ? Math.round(v) : v.toPrecision(2)) + " " + u[0];
    }

    make("qc-growth", {
        title: "Try it: how much memory does it take to fake n qubits?",
        w: 680, h: 230,
        aria: "A logarithmic bar from one byte to beyond the number of atoms in the universe, with a marker for the memory needed to store the full state of the chosen number of qubits.",
        defaults: { n: 10 },
        sliders: [["Number of qubits", "n", 1, 300, 1]],
        stats: [["Numbers to track (2ⁿ)", "amps"], ["Memory needed", "mem"]],
        formula: "Storing the full state of n qubits takes 2ⁿ complex numbers, about 16 bytes each. Every qubit you add doubles the memory. Around 50 qubits it outgrows the biggest supercomputers, and by 300 there are more numbers to track than atoms in the observable universe (about 10⁸⁰).",
        read: function (s) {

            const lg = Math.log10(16) + s.n * Math.log10(2);
            const fits = STORES.filter(function (x) { return Math.log10(x.b) >= lg; })[0];

            return {
                amps: s.n <= 40 ? Math.pow(2, s.n).toLocaleString("en-US") : "about 10" + sup(Math.floor(s.n * Math.log10(2))),
                mem: bytesText(lg),
                verdict: s.n >= 266 ? "More numbers than atoms in the observable universe. No classical computer could ever hold this." :
                    fits ? "Fits in " + fits.n + "." : "Too big for any computer on Earth."
            };
        },
        reward: { when: function (s) { return s.n >= 50; }, msg: "You found where classical computers give up" },
        draw: function (ctx, s) {

            const L = 40;
            const R = 650;
            const Y = 120;
            const max = 100;
            const xOf = function (lg) { return L + (R - L) * clamp(lg, 0, max) / max; };

            const g = ctx.createLinearGradient(L, 0, R, 0);

            g.addColorStop(0, TEAL + ".55)");
            g.addColorStop(0.3, GOLD + ".55)");
            g.addColorStop(1, ROSE + ".55)");
            box(ctx, L, Y - 10, R - L, 20, g);

            [0, 20, 40, 60, 80, 100].forEach(function (k) {

                line(ctx, xOf(k), Y + 12, xOf(k), Y + 18, GREY + ".8)", 1);
                txt(ctx, "10" + sup(k), xOf(k), Y + 32, 11, GREY + ".9)");
            });

            txt(ctx, "bytes (log scale)", (L + R) / 2, Y + 50, 11, GREY + ".8)");

            STORES.forEach(function (x, i) {

                const xx = xOf(Math.log10(x.b));

                line(ctx, xx, Y - 12, xx, Y - 30 - (i % 2) * 22, TEXT + ".5)", 1, [3, 3]);
                txt(ctx, ["laptop", "hard drive", "supercomputer", "all data on Earth"][i], xx, Y - 34 - (i % 2) * 22, 11, TEXT + ".8)");
            });

            const xa = xOf(80);

            line(ctx, xa, Y - 12, xa, Y - 52, TEXT + ".5)", 1, [3, 3]);
            txt(ctx, "atoms in the universe", xa, Y - 56, 11, TEXT + ".8)");

            const lg = Math.log10(16) + s.n * Math.log10(2);
            const xm = xOf(lg);

            dot(ctx, xm, Y, 9, TEXT + "1)");
            dot(ctx, xm, Y, 5, lg > 80 ? ROSE + "1)" : TEAL + "1)");
            txt(ctx, s.n + " qubits", xm, Y + 76, 13, TEXT + "1)", "center", true);

            if (lg > max) { txt(ctx, "→ off the scale", R - 4, Y + 76, 12, ROSE + "1)", "right", true); }
        }
    });


    const TIMELINE = [
        { y: 1982, t: "Feynman's idea", text: "Richard Feynman points out that nature is quantum, so simulating it on ordinary computers is hopeless, and suggests building computers out of quantum parts instead." },
        { y: 1985, t: "A universal quantum computer", text: "David Deutsch describes a quantum computer that could, in principle, run any quantum program, the quantum version of a general-purpose computer." },
        { y: 1994, t: "Shor's algorithm", text: "Peter Shor shows a quantum computer could factor large numbers exponentially faster than known classical methods, which would break much of today's encryption. Funding takes off." },
        { y: 1995, t: "The first quantum logic gate", text: "Researchers at NIST demonstrate a two-qubit logic gate using a trapped ion, turning the theory into a working device." },
        { y: 1999, t: "The first superconducting qubit", text: "A team at NEC in Japan makes a qubit from a tiny superconducting circuit on a chip, starting the platform most companies use today." },
        { y: 2007, t: "The transmon", text: "Yale researchers design the transmon, a superconducting qubit far less sensitive to stray electric charge. It becomes the workhorse of superconducting quantum chips." },
        { y: 2019, t: "Quantum supremacy experiment", text: "Google's 53-qubit chip finishes a specially designed sampling task that was claimed to take classical supercomputers far longer. Not useful by itself, but a milestone." },
        { y: 2023, t: "Logical qubits on atom arrays", text: "A Harvard-led team runs algorithms on dozens of error-corrected logical qubits built from neutral atoms held by lasers." },
        { y: 2024, t: "Errors fall as codes grow", text: "Google shows that making its surface code bigger makes logical errors smaller, the key proof that error correction can scale." }
    ];

    SIMS["qc-timeline"] = stepper({
        title: "Explore: how quantum computing got here",
        viewBox: "0 0 340 120",
        aria: "A timeline from 1982 to 2024 with a marker on the selected milestone.",
        interval: 6.5,
        steps: TIMELINE.map(function (m) { return { t: m.y + ": " + m.t, text: m.text }; }),
        rewardKey: "qc-timeline",
        rewardMsg: "You walked through the history of quantum computing",
        draw: function (step) {

            const x0 = 20;
            const x1 = 320;
            const xOf = function (y) { return x0 + (x1 - x0) * (y - 1980) / 46; };
            let s = '<line x1="' + x0 + '" y1="60" x2="' + x1 + '" y2="60" style="stroke:rgba(170,179,207,.6);stroke-width:1.5"/>';

            [1980, 1990, 2000, 2010, 2020].forEach(function (y) {

                s += '<text x="' + xOf(y) + '" y="88" text-anchor="middle" style="font-size:7px;fill:rgba(170,179,207,.85)">' + y + "</text>";
                s += '<line x1="' + xOf(y) + '" y1="57" x2="' + xOf(y) + '" y2="63" style="stroke:rgba(170,179,207,.6)"/>';
            });

            TIMELINE.forEach(function (m, i) {

                const on = i === step;
                const past = i < step;

                s += '<circle cx="' + xOf(m.y) + '" cy="60" r="' + (on ? 6 : 3.5) + '" style="fill:' + (on ? "#ffd666" : past ? "#54e0c7" : "rgba(170,179,207,.6)") + '"/>';
            });

            const m = TIMELINE[step];

            s += '<text x="' + xOf(m.y) + '" y="40" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#ffd666">' + m.y + "</text>";
            s += '<text x="170" y="112" text-anchor="middle" style="font-size:8px;fill:rgba(245,247,255,.9)">' + m.t + "</text>";

            return s;
        }
    });


    SIMS["qc-ingredients"] = quiz(
        "Game: which quantum ingredient is it?",
        ["Superposition", "Entanglement", "Interference"],
        [
            { q: "A qubit holds a blend of 0 and 1 until it is measured.", a: "Superposition", why: "A blend of both, with amplitudes for each." },
            { q: "Two qubits share one state, so measuring one tells you about the other.", a: "Entanglement", why: "Their results are linked." },
            { q: "Wrong answers cancel out and right answers add up.", a: "Interference", why: "Amplitudes behave like waves." },
            { q: "Three qubits carry eight amplitudes at once.", a: "Superposition", why: "n qubits carry 2ⁿ amplitudes." },
            { q: "The results of two far-apart qubits match every time, even though each one is random.", a: "Entanglement", why: "A correlation no classical link can copy." },
            { q: "Quantum algorithms choreograph amplitudes so the answer you want becomes likely.", a: "Interference", why: "That is how algorithms win." }
        ],
        5,
        "qc-ingredients-done",
        "You know the three quantum ingredients",
        "Superposition, entanglement and interference: every quantum algorithm uses all three.",
        "Superposition is the blend, entanglement the link, interference the cancelling. Hit Reset to try again."
    );


    /* ======================================
       UNIT 3: BITS VS QUBITS
    ====================================== */

    make("qc-coin", {
        title: "Try it: a bit vs a qubit",
        w: 680, h: 260,
        aria: "On the left, a switch or a spinning coin shows the bit or qubit. On the right, a bar chart counts how many times each result came up.",
        defaults: { mode: "qubit", theta: 90, bit: 0 },
        segs: [["Store information in", "mode", [["bit", "A bit"], ["qubit", "A qubit"]]]],
        actions: [["m1", "Read it once"], ["m100", "Read 100 fresh copies"], ["flip", "Flip the bit"], ["clr", "Clear counts"]],
        sliders: [["Qubit blend: towards 1 (θ)", "theta", 0, 180, 1, function (v) { return v + "°"; }]],
        stats: [["Chance of reading 0", "p0"], ["Chance of reading 1", "p1"]],
        animated: true,
        formula: "A bit is always definitely 0 or 1, and reading it changes nothing. A qubit can sit in a blend: reading it gives 0 with probability cos²(θ/2) and 1 with probability sin²(θ/2), and afterwards the qubit is left in whatever you read. To learn the blend you need many identical copies.",
        init: function (s, d) { d.n0 = 0; d.n1 = 0; d.last = null; d.flash = 0; d.rand = mulberry(Date.now() % 9999); },
        read: function (s, d) {

            const p0 = s.mode === "bit" ? (s.bit === 0 ? 1 : 0) : Math.pow(Math.cos(deg(s.theta) / 2), 2);

            return {
                p0: Math.round(p0 * 100) + "%",
                p1: Math.round((1 - p0) * 100) + "%",
                verdict: d.last === null ? (s.mode === "bit" ? "A bit is a switch: it is 0 or it is 1" : "A qubit is a blend until you read it") :
                    "You read " + d.last + (s.mode === "qubit" && s.theta > 5 && s.theta < 175 ? ". Read many fresh copies to see the odds." : ".")
            };
        },
        reward: { when: function (s, d) { return s.mode === "qubit" && d.n0 + d.n1 >= 100 && s.theta > 30 && s.theta < 150; }, msg: "You measured a qubit's odds with 100 copies" },
        act: function (id, s, d) {

            const p0 = s.mode === "bit" ? (s.bit === 0 ? 1 : 0) : Math.pow(Math.cos(deg(s.theta) / 2), 2);
            const one = function () { const r = d.rand() < p0 ? 0 : 1; if (r === 0) { d.n0++; } else { d.n1++; } d.last = r; };

            if (id === "m1") { one(); d.flash = 1.2; }
            if (id === "m100") { for (let i = 0; i < 100; i++) { one(); } d.flash = 1.2; }
            if (id === "flip") { s.bit = 1 - s.bit; d.last = null; }
            if (id === "clr") { d.n0 = 0; d.n1 = 0; d.last = null; }
        },
        onChange: function (s, d) { d.n0 = 0; d.n1 = 0; d.last = null; },
        step: function (dt, s, d) { d.flash = Math.max(0, d.flash - dt); },
        draw: function (ctx, s, d, t) {

            const cx = 170;
            const cy = 125;

            if (s.mode === "bit") {

                box(ctx, cx - 60, cy - 70, 120, 140, "rgba(255,255,255,.04)", GREY + ".5)");
                box(ctx, cx - 22, cy - 50, 44, 100, "rgba(10,16,36,.9)", GREY + ".7)");
                box(ctx, cx - 18, s.bit === 1 ? cy - 46 : cy + 2, 36, 44, s.bit === 1 ? GOLD + ".9)" : TEAL + ".9)");
                txt(ctx, "1", cx + 40, cy - 30, 14, TEXT + ".8)", "center", true);
                txt(ctx, "0", cx + 40, cy + 34, 14, TEXT + ".8)", "center", true);
                txt(ctx, "A bit: a switch, stored as " + s.bit, cx, cy + 96, 13, TEXT + ".9)");

            } else {

                const p1 = Math.pow(Math.sin(deg(s.theta) / 2), 2);
                const spin = d.flash > 0 ? 0 : t * 3;
                const sx = Math.abs(Math.cos(spin)) * 64 + 4;

                if (d.flash > 0 && d.last !== null) {

                    dot(ctx, cx, cy, 64, d.last === 0 ? TEAL + ".9)" : GOLD + ".9)");
                    txt(ctx, String(d.last), cx, cy + 14, 44, "rgba(6,10,24,.9)", "center", true);

                } else {

                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.scale(sx / 64, 1);
                    const g = ctx.createLinearGradient(-64, 0, 64, 0);

                    g.addColorStop(0, TEAL + ".95)");
                    g.addColorStop(clamp(1 - p1, 0.02, 0.98), "rgba(200,220,200,.9)");
                    g.addColorStop(1, GOLD + ".95)");
                    dot(ctx, 0, 0, 64, g);
                    ctx.restore();
                }

                txt(ctx, "A qubit: a blend of 0 and 1", cx, cy + 96, 13, TEXT + ".9)");
            }

            hist01(ctx, 360, 20, 300, 220, d.n0, d.n1);
        }
    });


    make("qc-register", {
        title: "Try it: how many amplitudes do n qubits carry?",
        w: 680, h: 250,
        aria: "A bar chart with one bar for every possible pattern of the qubits, showing each pattern's amplitude.",
        defaults: { n: 3, prep: "even" },
        sliders: [["Number of qubits", "n", 1, 10, 1]],
        segs: [["Prepared in", "prep", [["zero", "All 0"], ["even", "An even blend"], ["random", "A random state"]]]],
        stats: [["Amplitudes (2ⁿ)", "amps"], ["Bits you get when you measure", "bits"]],
        formula: "n qubits carry 2ⁿ amplitudes, one for every pattern of 0s and 1s. Ten qubits hold 1,024 at once. But measuring gives back just one pattern, n plain bits. That is why quantum algorithms need interference to steer the odds towards the answer before measuring.",
        init: function (s, d) { d.rand = mulberry(42); d.amps = null; },
        onChange: function (s, d) { d.amps = null; },
        read: function (s) {

            return {
                amps: Math.pow(2, s.n).toLocaleString("en-US"),
                bits: s.n + (s.n === 1 ? " bit" : " bits"),
                verdict: s.prep === "even" ? "Every pattern is equally likely: each has probability 1/" + Math.pow(2, s.n) : s.prep === "zero" ? "All the weight is on 000…0" : "A random state: some patterns are likelier than others"
            };
        },
        reward: { when: function (s) { return s.n >= 10; }, msg: "You built a 10-qubit register with 1,024 amplitudes" },
        draw: function (ctx, s, d) {

            const N = Math.pow(2, s.n);

            if (!d.amps || d.amps.length !== N || d.prep !== s.prep) {

                d.prep = s.prep;
                d.amps = [];

                let tot = 0;

                for (let i = 0; i < N; i++) {

                    const v = s.prep === "zero" ? (i === 0 ? 1 : 0) : s.prep === "even" ? 1 : Math.pow(d.rand(), 2);

                    d.amps.push(v);
                    tot += v * v;
                }

                d.amps = d.amps.map(function (v) { return v / Math.sqrt(tot); });
            }

            const L = 40;
            const R = 660;
            const B = 200;
            const H = 160;
            const bw = (R - L) / N;
            const maxA = Math.max.apply(null, d.amps);

            line(ctx, L, B, R, B, GREY + ".7)", 1);

            d.amps.forEach(function (a, i) {

                const h = (a / maxA) * H;

                box(ctx, L + i * bw + Math.min(1, bw * 0.15), B - h, Math.max(1, bw - Math.min(2, bw * 0.3)), h, (i % 2 ? TEAL : BLUE) + ".8)");

                if (s.n <= 4) {

                    const lbl = i.toString(2).padStart(s.n, "0");

                    txt(ctx, "|" + lbl + "⟩", L + (i + 0.5) * bw, B + 18, 12, TEXT + ".85)");
                }
            });

            txt(ctx, "amplitude of each pattern", 40, 26, 12, GREY + ".9)", "left");

            if (s.n > 4) { txt(ctx, N + " patterns, from |" + "0".repeat(s.n) + "⟩ to |" + "1".repeat(s.n) + "⟩", (L + R) / 2, B + 22, 12, TEXT + ".8)"); }
        }
    });


    SIMS["qc-bitorqubit"] = quiz(
        "Game: bit, qubit or both?",
        ["Bit", "Qubit", "Both"],
        [
            { q: "Reading it never changes it.", a: "Bit", why: "Measuring a qubit leaves it in the result you read." },
            { q: "It can hold a blend of 0 and 1.", a: "Qubit", why: "A superposition with two amplitudes." },
            { q: "When you read it, you get a 0 or a 1.", a: "Both", why: "Measuring a qubit also gives a plain 0 or 1." },
            { q: "You can copy it as many times as you like.", a: "Bit", why: "Unknown qubit states can't be copied (the no-cloning theorem)." },
            { q: "Stored as the voltage on a transistor in your phone.", a: "Bit", why: "That is classical memory." },
            { q: "Its state is an arrow on a sphere.", a: "Qubit", why: "The Bloch sphere." },
            { q: "Ten of them can carry 1,024 amplitudes.", a: "Qubit", why: "n qubits carry 2ⁿ amplitudes." },
            { q: "Can be built on a silicon chip in a cleanroom.", a: "Both", why: "Transistors and many kinds of qubits are both microfabricated." }
        ],
        6,
        "qc-bitorqubit-done",
        "You can tell bits from qubits",
        "Both give 0 or 1 when read, but only a qubit holds a blend beforehand.",
        "A bit is always definite; a qubit is a blend until read. Hit Reset to try again."
    );


    /* ======================================
       UNIT 4: THE BLOCH SPHERE, A MAP OF A QUBIT
    ====================================== */

    // A Bloch circle (side view) with an arrow at angle theta from the top.
    function blochSide(ctx, cx, cy, R, theta, col) {

        ctx.strokeStyle = GREY + ".5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy, R, R * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
        txt(ctx, "|0⟩ north pole", cx, cy - R - 10, 12, TEAL + "1)", "center", true);
        txt(ctx, "|1⟩ south pole", cx, cy + R + 20, 12, GOLD + "1)", "center", true);
        arrow(ctx, cx, cy, cx + Math.sin(theta) * R, cy - Math.cos(theta) * R, col || PURPLE + "1)", 3.5);
    }

    const POLE_PLATFORMS = {
        transmon: { n: "Superconducting circuit", top: "|0⟩: the circuit holds its lowest possible energy", bottom: "|1⟩: the circuit holds one extra packet (quantum) of energy, sloshing back and forth as current" },
        atom: { n: "Atom (trapped ion)", top: "|0⟩: the electron is in the atom's lowest energy level (ground state)", bottom: "|1⟩: the electron is in a higher energy level (excited state)" },
        spin: { n: "Electron spin", top: "|0⟩: the electron's spin points one way (the lower-energy direction in the magnet's field)", bottom: "|1⟩: the spin points the opposite way (higher energy)" }
    };

    make("qc-poles", {
        title: "Try it: what do the north and south poles mean on a real qubit?",
        w: 680, h: 270,
        aria: "On the left, the Bloch sphere with the arrow at the north or south pole. On the right, a picture of what that means physically for the chosen kind of qubit.",
        defaults: { plat: "atom", pole: 0 },
        segs: [["Kind of qubit", "plat", [["transmon", "Superconducting circuit"], ["atom", "Atom"], ["spin", "Electron spin"]]], ["Arrow at", "pole", [[0, "North pole: |0⟩"], [1, "South pole: |1⟩"]]]],
        animated: true,
        formula: "The poles are always the qubit's two basic states. By convention the north pole, |0⟩, is the lower-energy state, and the south pole, |1⟩, is the higher-energy one. What 'lower' and 'higher' physically mean depends on the kind of qubit. The sphere itself is not a place: it's a map of the qubit's state.",
        read: function (s) {

            const p = POLE_PLATFORMS[s.plat];

            return { verdict: s.pole === 0 ? p.top : p.bottom };
        },
        reward: { when: function (s, d) { d.seen = d.seen || {}; d.seen[s.plat + s.pole] = true; return Object.keys(d.seen).length >= 5; }, msg: "You matched the poles to real qubits" },
        draw: function (ctx, s, d, t) {

            const th = s.pole === 0 ? 0 : Math.PI;

            blochSide(ctx, 150, 135, 90, th, s.pole === 0 ? TEAL + "1)" : GOLD + "1)");
            txt(ctx, "the map", 150, 22, 12, GREY + "1)", "center", true);
            line(ctx, 290, 40, 290, 240, GREY + ".3)", 1, [4, 4]);
            txt(ctx, "what's really happening", 480, 22, 12, GREY + "1)", "center", true);

            const cx = 480;
            const cy = 140;

            if (s.plat === "atom") {

                [40, 75].forEach(function (r, i) {

                    ctx.strokeStyle = (i === 0 ? TEAL : GOLD) + ".6)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.stroke();
                });

                dot(ctx, cx, cy, 12, ROSE + ".9)");
                txt(ctx, "+", cx, cy + 5, 14, TEXT + "1)", "center", true);

                const r = s.pole === 0 ? 40 : 75;
                const a = t * (s.pole === 0 ? 1.6 : 0.9);

                dot(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 7, BLUE + "1)");
                txt(ctx, "lower energy level", cx + 44, cy - 34, 11, TEAL + "1)", "left");
                txt(ctx, "higher energy level", cx + 60, cy + 76, 11, GOLD + "1)", "left");
                txt(ctx, "schematic, not to scale", cx, 260, 10, GREY + ".9)");

            } else if (s.plat === "spin") {

                for (let i = 0; i < 4; i++) { arrow(ctx, 380 + i * 70, 240, 380 + i * 70, 200, GREY + ".45)", 1.5); }

                txt(ctx, "magnetic field", cx, 258, 11, GREY + "1)");
                dot(ctx, cx, cy - 10, 22, BLUE + ".85)");

                const up = s.pole === 0;

                arrow(ctx, cx, up ? cy + 30 : cy - 50, cx, up ? cy - 50 : cy + 30, (up ? TEAL : GOLD) + "1)", 4);
                txt(ctx, up ? "spin one way: lower energy" : "spin flipped: higher energy", cx, 60, 12, (up ? TEAL : GOLD) + "1)", "center", true);

            } else {

                const lv = [200, 150, 100];

                lv.forEach(function (y, i) { line(ctx, 400, y, 560, y, (i === 0 ? TEAL : i === 1 ? GOLD : GREY) + "1)", 2.5); txt(ctx, "energy level " + i, 570, y + 4, 11, GREY + "1)", "left"); });

                dot(ctx, 480, lv[s.pole] - 10, 9, PURPLE + "1)");

                const amp = s.pole === 0 ? 4 : 22;

                ctx.strokeStyle = BLUE + ".9)";
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let x = 400; x <= 560; x += 2) { const y = 60 + Math.sin((x - 400) / 12 - t * 4) * amp; if (x === 400) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } }

                ctx.stroke();
                txt(ctx, s.pole === 0 ? "almost no current sloshing" : "current sloshing back and forth", cx, 40, 11, BLUE + "1)");
            }
        }
    });


    make("qc-latitude", {
        title: "Try it: latitude sets the odds",
        w: 680, h: 270,
        aria: "A globe-like sphere with a gold latitude line at the arrow's height. Bars show the chance of reading 0 or 1, and dots show 100 simulated measurements.",
        defaults: { theta: 45 },
        sliders: [["How far down from the north pole (θ)", "theta", 0, 180, 1, function (v) { return v + "°"; }]],
        stats: [["Chance of reading 0", "p0"], ["Chance of reading 1", "p1"], ["Where you are", "zone"]],
        formula: "Think of a globe. The closer the arrow is to the north pole, the more likely you'll read 0; the closer to the south pole, the more likely 1. On the equator it's exactly 50/50. The exact rule is P(0) = cos²(θ/2), where θ is the angle down from the north pole. The dots are 100 imaginary measurements of identical qubits.",
        read: function (s) {

            const p0 = Math.pow(Math.cos(deg(s.theta) / 2), 2);

            return {
                p0: Math.round(p0 * 100) + "%",
                p1: Math.round((1 - p0) * 100) + "%",
                zone: s.theta < 3 ? "North pole" : s.theta > 177 ? "South pole" : Math.abs(s.theta - 90) < 3 ? "Equator" : s.theta < 90 ? "Northern half" : "Southern half",
                verdict: s.theta < 3 ? "Always 0" : s.theta > 177 ? "Always 1" : Math.abs(s.theta - 90) < 3 ? "A perfect 50/50 blend" : p0 > 0.5 ? "More likely 0" : "More likely 1"
            };
        },
        reward: { when: function (s) { return Math.abs(s.theta - 90) < 2; }, msg: "You put the qubit on the equator" },
        draw: function (ctx, s) {

            const th = deg(s.theta);
            const cx = 160;
            const cy = 135;
            const R = 95;

            blochSide(ctx, cx, cy, R, th, PURPLE + "1)");

            const y = cy - Math.cos(th) * R;
            const rx = Math.sin(th) * R;

            ctx.strokeStyle = GOLD + ".9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(cx, y, Math.max(rx, 0.5), Math.max(rx * 0.28, 0.5), 0, 0, Math.PI * 2);
            ctx.stroke();
            txt(ctx, "latitude", cx + rx + 6, y + 4, 11, GOLD + "1)", "left");

            const p0 = Math.pow(Math.cos(th / 2), 2);
            const rand = mulberry(Math.round(s.theta) + 7);

            for (let i = 0; i < 100; i++) { const r = rand() < p0 ? 0 : 1; dot(ctx, 330 + (i % 10) * 16, 60 + Math.floor(i / 10) * 16, 5.5, r === 0 ? TEAL + ".9)" : GOLD + ".9)"); }

            txt(ctx, "100 measurements", 402, 38, 12, GREY + "1)", "center", true);
            dot(ctx, 340, 246, 5.5, TEAL + ".9)");
            txt(ctx, "read 0", 350, 250, 11, TEXT + ".9)", "left");
            dot(ctx, 420, 246, 5.5, GOLD + ".9)");
            txt(ctx, "read 1", 430, 250, 11, TEXT + ".9)", "left");

            [[p0, "P(0)", TEAL], [1 - p0, "P(1)", GOLD]].forEach(function (p, i) {

                const x = 540 + i * 60;
                const h = p[0] * 170;

                box(ctx, x, 40, 40, 170, null, GREY + ".35)");
                box(ctx, x, 210 - h, 40, h, p[2] + ".8)");
                txt(ctx, p[1], x + 20, 228, 12, TEXT + ".9)", "center", true);
                txt(ctx, Math.round(p[0] * 100) + "%", x + 20, 204 - h, 11, TEXT + ".9)");
            });
        }
    });


    make("qc-longitude", {
        title: "Try it: longitude is the phase, hidden but real",
        w: 680, h: 270,
        aria: "A top-down view of the equator with the arrow pointing at the chosen longitude. Bars compare measuring the qubit directly with measuring it after a Hadamard gate.",
        defaults: { phi: 0 },
        sliders: [["Longitude around the equator (φ)", "phi", 0, 360, 5, function (v) { return v + "°"; }]],
        stats: [["State", "name"], ["Measured directly: P(0)", "d0"], ["After an H gate: P(0)", "h0"]],
        formula: "Every point on the equator is a 50/50 blend, so measuring directly can't tell them apart. They differ in phase, the longitude. Phase becomes visible through interference: apply a Hadamard (H) gate first and P(0) becomes (1 + cos φ)/2, so |+⟩ (φ = 0°) always gives 0 and |−⟩ (φ = 180°) always gives 1. Quantum algorithms work by steering this hidden phase.",
        read: function (s) {

            const h0 = (1 + Math.cos(deg(s.phi))) / 2;

            return {
                name: stateName(90, s.phi),
                d0: "50%",
                h0: Math.round(h0 * 100) + "%",
                verdict: Math.abs(h0 - 0.5) < 0.05 ? "Even after H, still 50/50 (this phase lines up with neither result)" : h0 > 0.5 ? "The H gate turns this phase into a likely 0" : "The H gate turns this phase into a likely 1"
            };
        },
        reward: { when: function (s) { return Math.abs(s.phi - 180) < 3; }, msg: "You found |−⟩, which an H gate turns into a certain 1" },
        draw: function (ctx, s) {

            const cx = 160;
            const cy = 135;
            const R = 100;

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.stroke();
            txt(ctx, "equator, seen from above the north pole", cx, 22, 11, GREY + "1)", "center", true);

            [[0, "|+⟩"], [90, "|+i⟩"], [180, "|−⟩"], [270, "|−i⟩"]].forEach(function (m) {

                const a = deg(m[0]);

                dot(ctx, cx + Math.cos(a) * R, cy - Math.sin(a) * R, 4, GREY + "1)");
                txt(ctx, m[1], cx + Math.cos(a) * (R + 22), cy - Math.sin(a) * (R + 22) + 4, 13, TEXT + ".9)", "center", true);
            });

            const a = deg(s.phi);

            arrow(ctx, cx, cy, cx + Math.cos(a) * R, cy - Math.sin(a) * R, PURPLE + "1)", 3.5);

            const h0 = (1 + Math.cos(a)) / 2;

            [[0.5, "directly"], [h0, "after H"]].forEach(function (p, i) {

                const x = 380 + i * 140;

                [[p[0], TEAL, "0"], [1 - p[0], GOLD, "1"]].forEach(function (q, j) {

                    const h = q[0] * 160;

                    box(ctx, x + j * 50, 200 - h, 40, h, q[1] + ".8)");
                    txt(ctx, q[2], x + j * 50 + 20, 218, 12, TEXT + ".9)", "center", true);
                });

                txt(ctx, "measure " + p[1], x + 45, 246, 12, GREY + "1)", "center", true);
            });
        }
    });


    /* ======================================
       UNIT 5: SUPERPOSITION AND MEASUREMENT
    ====================================== */

    function stateName(theta, phi) {

        const near = function (a, b) { return Math.abs(a - b) < 4; };
        const p = ((phi % 360) + 360) % 360;

        if (near(theta, 0)) { return "|0⟩"; }
        if (near(theta, 180)) { return "|1⟩"; }

        if (near(theta, 90)) {

            if (near(p, 0) || near(p, 360)) { return "|+⟩"; }
            if (near(p, 180)) { return "|−⟩"; }
            if (near(p, 90)) { return "|+i⟩"; }
            if (near(p, 270)) { return "|−i⟩"; }
        }

        return "a general superposition";
    }

    make("qc-amplitudes", {
        title: "Try it: amplitudes are arrows, probabilities are their length squared",
        w: 680, h: 250,
        aria: "Two circles show the amplitudes for 0 and 1 as arrows with a length and a direction. Bars on the right show the probability of each result.",
        defaults: { theta: 90, phi: 0 },
        sliders: [["Blend (θ)", "theta", 0, 180, 1, function (v) { return v + "°"; }], ["Phase (φ)", "phi", 0, 360, 5, function (v) { return v + "°"; }]],
        stats: [["State", "name"], ["P(0) = |α|²", "p0"], ["P(1) = |β|²", "p1"]],
        formula: "A qubit's state is α|0⟩ + β|1⟩. Each amplitude is an arrow: its length squared is the probability, and its direction (the phase) is invisible to a single measurement. The phase decides whether amplitudes add or cancel later, which is the heart of quantum computing. Try φ = 0° and φ = 180° at θ = 90°: same odds, opposite states.",
        read: function (s) {

            const a = Math.cos(deg(s.theta) / 2);
            const b = Math.sin(deg(s.theta) / 2);

            return {
                name: stateName(s.theta, s.phi),
                p0: Math.round(a * a * 100) + "%",
                p1: Math.round(b * b * 100) + "%",
                verdict: s.theta === 90 ? (s.phi % 360 === 180 ? "|−⟩: the same 50/50 odds as |+⟩, but the opposite phase" : "An equal blend: 50/50 odds") : "Unequal blend: " + (a * a > b * b ? "0" : "1") + " is more likely"
            };
        },
        reward: { when: function (s) { return Math.abs(s.theta - 90) < 3 && Math.abs(s.phi - 180) < 6; }, msg: "You built the |−⟩ state" },
        draw: function (ctx, s) {

            const a = Math.cos(deg(s.theta) / 2);
            const b = Math.sin(deg(s.theta) / 2);

            [[140, "α (for 0)", a, 0, TEAL], [330, "β (for 1)", b, s.phi, GOLD]].forEach(function (c) {

                const cx = c[0];
                const cy = 120;
                const R = 80;

                ctx.strokeStyle = GREY + ".4)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(cx, cy, R, 0, Math.PI * 2);
                ctx.stroke();
                line(ctx, cx - R, cy, cx + R, cy, GREY + ".25)", 1);
                line(ctx, cx, cy - R, cx, cy + R, GREY + ".25)", 1);

                const ang = deg(c[3]);

                if (c[2] > 0.02) { arrow(ctx, cx, cy, cx + Math.cos(ang) * R * c[2], cy - Math.sin(ang) * R * c[2], c[4] + "1)", 3); }

                txt(ctx, c[1], cx, cy + R + 22, 13, TEXT + ".9)", "center", true);
                txt(ctx, "length " + c[2].toFixed(2), cx, cy - R - 8, 11, GREY + ".9)");
            });

            [[a * a, "P(0)", TEAL], [b * b, "P(1)", GOLD]].forEach(function (p, i) {

                const x = 480 + i * 90;
                const h = p[0] * 170;

                box(ctx, x, 210 - h, 56, h, p[2] + ".8)", p[2] + "1)");
                box(ctx, x, 40, 56, 170, null, GREY + ".35)");
                txt(ctx, p[1], x + 28, 230, 13, TEXT + ".9)", "center", true);
                txt(ctx, Math.round(p[0] * 100) + "%", x + 28, 204 - h, 12, TEXT + ".9)");
            });
        }
    });


    make("qc-measure", {
        title: "Try it: measuring a qubit collapses it",
        w: 680, h: 260,
        aria: "A circle shows the qubit's state as an arrow between 0 at the top and 1 at the bottom. A bar chart counts results.",
        defaults: { theta: 60 },
        sliders: [["Prepare the qubit at θ", "theta", 0, 180, 1, function (v) { return v + "°"; }]],
        actions: [["fresh", "Prepare a fresh qubit"], ["m", "Measure it"], ["again", "Measure the same qubit again"], ["m100", "Measure 100 fresh qubits"]],
        stats: [["Predicted P(0)", "p0"], ["Measured share of 0", "f0"]],
        formula: "Before measuring, the qubit's arrow points anywhere between |0⟩ (top) and |1⟩ (bottom). Measuring gives 0 with probability cos²(θ/2). Then the arrow jumps to the result, so measuring the same qubit again always repeats it. Only many fresh copies reveal the odds.",
        init: function (s, d) { d.n0 = 0; d.n1 = 0; d.collapsed = null; d.rand = mulberry(Date.now() % 7777); d.repeats = 0; },
        onChange: function (s, d) { d.n0 = 0; d.n1 = 0; d.collapsed = null; },
        act: function (id, s, d) {

            const p0 = Math.pow(Math.cos(deg(s.theta) / 2), 2);
            const meas = function () { const r = d.rand() < p0 ? 0 : 1; if (r === 0) { d.n0++; } else { d.n1++; } return r; };

            if (id === "fresh") { d.collapsed = null; }

            if (id === "m") { d.collapsed = meas(); }

            if (id === "again") {

                if (d.collapsed === null) { d.collapsed = meas(); } else { if (d.collapsed === 0) { d.n0++; } else { d.n1++; } d.repeats++; }
            }

            if (id === "m100") { for (let i = 0; i < 100; i++) { meas(); } d.collapsed = null; }
        },
        read: function (s, d) {

            const p0 = Math.pow(Math.cos(deg(s.theta) / 2), 2);
            const tot = d.n0 + d.n1;

            return {
                p0: Math.round(p0 * 100) + "%",
                f0: tot ? Math.round(d.n0 / tot * 100) + "% of " + tot : "—",
                verdict: d.collapsed === null ? "The qubit is in a superposition" : "Collapsed to " + d.collapsed + ": measuring it again will give " + d.collapsed + " every time"
            };
        },
        reward: { when: function (s, d) { return d.repeats >= 2; }, msg: "You saw that a measured qubit stays put" },
        draw: function (ctx, s, d) {

            const cx = 160;
            const cy = 130;
            const R = 90;

            ctx.strokeStyle = GREY + ".45)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.stroke();
            txt(ctx, "|0⟩", cx, cy - R - 10, 14, TEAL + "1)", "center", true);
            txt(ctx, "|1⟩", cx, cy + R + 22, 14, GOLD + "1)", "center", true);

            const th = d.collapsed === null ? deg(s.theta) : (d.collapsed === 0 ? 0 : Math.PI);

            arrow(ctx, cx, cy, cx + Math.sin(th) * R, cy - Math.cos(th) * R, d.collapsed === null ? PURPLE + "1)" : (d.collapsed === 0 ? TEAL + "1)" : GOLD + "1)"), 3.5);

            if (d.collapsed !== null) { txt(ctx, "collapsed", cx + 100, cy, 12, ROSE + "1)", "left", true); }

            hist01(ctx, 360, 20, 300, 230, d.n0, d.n1);
        }
    });


    make("qc-basis", {
        title: "Try it: what you measure changes what you see",
        w: 680, h: 230,
        aria: "A bar chart shows the share of each result for the chosen state and measurement direction.",
        defaults: { st: "plus", basis: "Z" },
        segs: [["Prepare", "st", [["zero", "|0⟩"], ["one", "|1⟩"], ["plus", "|+⟩"], ["minus", "|−⟩"]]], ["Measure along", "basis", [["Z", "Z (0 or 1)"], ["X", "X (+ or −)"]]]],
        actions: [["m50", "Measure 50 fresh copies"]],
        stats: [["Result A", "ra"], ["Result B", "rb"]],
        formula: "You can measure a qubit along different directions. |+⟩ gives 50/50 when measured as 0 or 1, but always gives + when measured along X. |0⟩ is the reverse. In practice you measure along X by rotating the qubit first. Quantum key distribution uses exactly this to catch eavesdroppers.",
        init: function (s, d) { d.a = 0; d.b = 0; d.rand = mulberry(99); },
        onChange: function (s, d) { d.a = 0; d.b = 0; },
        act: function (id, s, d) {

            const pA = s.basis === "Z" ? { zero: 1, one: 0, plus: 0.5, minus: 0.5 }[s.st] : { zero: 0.5, one: 0.5, plus: 1, minus: 0 }[s.st];

            for (let i = 0; i < 50; i++) { if (d.rand() < pA) { d.a++; } else { d.b++; } }
        },
        read: function (s, d) {

            const n = s.basis === "Z" ? ["0", "1"] : ["+", "−"];
            const tot = d.a + d.b;

            return {
                ra: n[0] + ": " + (tot ? Math.round(d.a / tot * 100) + "%" : "—"),
                rb: n[1] + ": " + (tot ? Math.round(d.b / tot * 100) + "%" : "—"),
                verdict: tot === 0 ? "Pick a state and a direction, then measure" : (d.a === 0 || d.b === 0) ? "Certain: this state lines up with this direction" : "Random: this state sits halfway between the two results"
            };
        },
        reward: { when: function (s, d) { return s.st === "plus" && s.basis === "X" && d.a + d.b >= 50; }, msg: "You measured |+⟩ along X and got + every time" },
        draw: function (ctx, s, d) {

            const n = s.basis === "Z" ? ["0", "1"] : ["+", "−"];

            hist01(ctx, 190, 10, 300, 210, d.a, d.b, n);
        }
    });


    SIMS["qc-collapse"] = stepper({
        title: "Explore: how the world 'measures' a qubit",
        viewBox: "0 0 340 150",
        aria: "A qubit drawn as an arrow, with the surroundings slowly taking in information about it.",
        interval: 6.5,
        steps: [
            { t: "1. An isolated qubit", text: "Left alone, the qubit holds its superposition: a blend of 0 and 1 with a definite phase." },
            { t: "2. Something bumps into it", text: "A stray photon, a vibrating atom or a defect in the chip interacts with the qubit, even very weakly." },
            { t: "3. Information leaks out", text: "The bump carries away a little information about whether the qubit was 0 or 1. Nobody has to read it: the leak is enough." },
            { t: "4. It acts like a measurement", text: "The qubit now behaves as if it had been measured: the blend turns into ordinary 'either 0 or 1' odds. This is decoherence." },
            { t: "5. That's why chips are cold, dark and quiet", text: "Quantum chips sit in shielded fridges at about 10 thousandths of a degree above absolute zero, so almost nothing can bump into the qubits." }
        ],
        rewardKey: "qc-collapse",
        rewardMsg: "You followed how decoherence works",
        draw: function (step, st) {

            const cx = 170;
            const cy = 75;
            const blur = step >= 3;
            let s = '<circle cx="' + cx + '" cy="' + cy + '" r="40" style="fill:none;stroke:rgba(170,179,207,.5)"/>';

            s += '<text x="' + cx + '" y="' + (cy - 46) + '" text-anchor="middle" style="font-size:8px;fill:#54e0c7">|0⟩</text>';
            s += '<text x="' + cx + '" y="' + (cy + 54) + '" text-anchor="middle" style="font-size:8px;fill:#ffd666">|1⟩</text>';

            if (blur) {

                s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - 36) + '" style="stroke:rgba(84,224,199,.55);stroke-width:3"/>';
                s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy + 36) + '" style="stroke:rgba(255,214,102,.55);stroke-width:3"/>';

            } else {

                s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + 34) + '" y2="' + (cy - 20) + '" style="stroke:#be96ff;stroke-width:3"/>';
            }

            if (step >= 1 && step <= 3) {

                const k = (st.anim * 1.6) % 1;
                const px = 40 + k * 90;

                s += '<circle cx="' + px + '" cy="' + (cy - 10) + '" r="5" style="fill:#ff6978"/>';
                s += '<text x="40" y="' + (cy - 22) + '" style="font-size:7px;fill:#ff6978">stray photon</text>';
            }

            if (step >= 2) {

                for (let i = 0; i < (step >= 3 ? 9 : 4); i++) {

                    s += '<circle cx="' + (250 + (i % 3) * 18) + '" cy="' + (50 + Math.floor(i / 3) * 18) + '" r="3" style="fill:rgba(255,105,120,.7)"/>';
                }

                s += '<text x="268" y="120" text-anchor="middle" style="font-size:7px;fill:rgba(245,247,255,.8)">information in the surroundings</text>';
            }

            if (step === 4) {

                s += '<rect x="110" y="18" width="120" height="114" rx="10" style="fill:none;stroke:#78b4ff;stroke-width:2;stroke-dasharray:4 3"/>';
                s += '<text x="170" y="146" text-anchor="middle" style="font-size:7px;fill:#78b4ff">shielding, cold and vacuum</text>';
            }

            return s;
        }
    });


    /* ======================================
       UNIT 6: ENTANGLEMENT
    ====================================== */

    const R2 = Math.SQRT1_2;

    // Two-qubit state as real amplitudes [00, 01, 10, 11]; qubit A is the left bit.
    function gate2(v, g) {

        const a = v.slice();

        if (g === "HA") { return [R2 * (a[0] + a[2]), R2 * (a[1] + a[3]), R2 * (a[0] - a[2]), R2 * (a[1] - a[3])]; }
        if (g === "HB") { return [R2 * (a[0] + a[1]), R2 * (a[0] - a[1]), R2 * (a[2] + a[3]), R2 * (a[2] - a[3])]; }
        if (g === "XA") { return [a[2], a[3], a[0], a[1]]; }
        if (g === "XB") { return [a[1], a[0], a[3], a[2]]; }
        if (g === "ZA") { return [a[0], a[1], -a[2], -a[3]]; }
        if (g === "CNOT") { return [a[0], a[1], a[3], a[2]]; }
        if (g === "CZ") { return [a[0], a[1], a[2], -a[3]]; }

        return a;
    }

    function conc(v) { return 2 * Math.abs(v[0] * v[3] - v[1] * v[2]); }

    function bars4(ctx, v, x0, y0, w, h) {

        const names = ["|00⟩", "|01⟩", "|10⟩", "|11⟩"];
        const mid = y0 + h / 2;
        const bw = w / 4;

        line(ctx, x0, mid, x0 + w, mid, GREY + ".6)", 1);

        v.forEach(function (a, i) {

            const hh = a * (h / 2 - 14);
            const x = x0 + i * bw + bw * 0.2;

            if (Math.abs(a) > 0.001) { box(ctx, x, a > 0 ? mid - hh : mid, bw * 0.6, Math.abs(hh), (a > 0 ? TEAL : ROSE) + ".8)", (a > 0 ? TEAL : ROSE) + "1)"); }

            txt(ctx, names[i], x + bw * 0.3, y0 + h + 16, 13, TEXT + ".9)", "center", true);
            txt(ctx, (a >= 0 ? "+" : "−") + Math.abs(a).toFixed(2), x + bw * 0.3, a >= 0 ? mid - Math.abs(hh) - 6 : mid + Math.abs(hh) + 14, 11, GREY + "1)");
        });
    }

    make("qc-twoqubit", {
        title: "Try it: build an entangled pair",
        w: 680, h: 260,
        aria: "Four bars show the amplitudes of the two-qubit patterns 00, 01, 10 and 11, positive above the line and negative below.",
        defaults: {},
        actions: [["HA", "H on A"], ["HB", "H on B"], ["XA", "X on A"], ["XB", "X on B"], ["ZA", "Z on A"], ["CNOT", "CNOT (A controls B)"], ["reset", "Reset to |00⟩"]],
        stats: [["Gates used", "n"], ["Entangled?", "ent"], ["Entanglement (0 to 1)", "c"]],
        formula: "Two qubits carry four amplitudes. A state is entangled when it can't be split into 'qubit A's state' times 'qubit B's state'. H puts A in a blend, then CNOT flips B only when A is 1, giving (|00⟩ + |11⟩)/√2: each qubit alone is random, but they always agree. The entanglement score here is the concurrence, 2|a₀₀a₁₁ − a₀₁a₁₀|.",
        init: function (s, d) { d.v = [1, 0, 0, 0]; d.n = 0; d.bell = false; },
        act: function (id, s, d) {

            if (id === "reset") { d.v = [1, 0, 0, 0]; d.n = 0; return; }

            d.v = gate2(d.v, id);
            d.n++;

            if (conc(d.v) > 0.99) { d.bell = true; }
        },
        read: function (s, d) {

            const c = conc(d.v);

            return {
                n: String(d.n),
                ent: c > 0.01 ? "Yes" : "No",
                c: c.toFixed(2),
                verdict: c > 0.99 ? "Maximally entangled: a Bell pair" : c > 0.01 ? "Partly entangled" : "Not entangled: each qubit has its own state"
            };
        },
        reward: { when: function (s, d) { return d.bell; }, msg: "You made a Bell pair with H and CNOT" },
        draw: function (ctx, s, d) { bars4(ctx, d.v, 60, 20, 560, 200); }
    });


    SIMS["qc-bellcircuit"] = stepper({
        title: "Explore: the two-gate recipe for entanglement",
        viewBox: "0 0 340 150",
        aria: "A quantum circuit with two wires, an H gate on the top wire and a CNOT connecting them, with the state shown after each step.",
        interval: 6.5,
        steps: [
            { t: "Start: |00⟩", text: "Both qubits begin in 0. The state is simply |00⟩: one amplitude, no entanglement." },
            { t: "After H on qubit A: (|00⟩ + |10⟩)/√2", text: "The Hadamard gate puts qubit A into an equal blend of 0 and 1. Qubit B is still 0, so the two are still independent." },
            { t: "After CNOT: (|00⟩ + |11⟩)/√2", text: "CNOT flips B only in the part of the blend where A is 1. Now the |10⟩ part becomes |11⟩: the qubits are entangled." },
            { t: "Measure: always 00 or 11", text: "Each qubit alone gives 0 or 1 at random, but they always agree. Neither qubit has its own state any more, only the pair does." }
        ],
        rewardKey: "qc-bellcircuit",
        rewardMsg: "You followed the Bell-pair circuit",
        draw: function (step) {

            let s = "";
            const yA = 45;
            const yB = 95;

            s += '<text x="18" y="' + (yA + 3) + '" style="font-size:9px;font-weight:700;fill:#f5f7ff">A</text>';
            s += '<text x="18" y="' + (yB + 3) + '" style="font-size:9px;font-weight:700;fill:#f5f7ff">B</text>';
            s += '<line x1="30" y1="' + yA + '" x2="310" y2="' + yA + '" style="stroke:rgba(170,179,207,.8);stroke-width:1.5"/>';
            s += '<line x1="30" y1="' + yB + '" x2="310" y2="' + yB + '" style="stroke:rgba(170,179,207,.8);stroke-width:1.5"/>';
            s += '<rect x="80" y="' + (yA - 13) + '" width="26" height="26" rx="4" style="fill:' + (step >= 1 ? "rgba(84,224,199,.35)" : "rgba(170,179,207,.15)") + ';stroke:#54e0c7"/>';
            s += '<text x="93" y="' + (yA + 4) + '" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#f5f7ff">H</text>';
            s += '<circle cx="170" cy="' + yA + '" r="4" style="fill:' + (step >= 2 ? "#ffd666" : "rgba(170,179,207,.6)") + '"/>';
            s += '<line x1="170" y1="' + yA + '" x2="170" y2="' + (yB + 9) + '" style="stroke:' + (step >= 2 ? "#ffd666" : "rgba(170,179,207,.6)") + ';stroke-width:1.5"/>';
            s += '<circle cx="170" cy="' + yB + '" r="9" style="fill:none;stroke:' + (step >= 2 ? "#ffd666" : "rgba(170,179,207,.6)") + ';stroke-width:1.5"/>';
            s += '<line x1="161" y1="' + yB + '" x2="179" y2="' + yB + '" style="stroke:' + (step >= 2 ? "#ffd666" : "rgba(170,179,207,.6)") + ';stroke-width:1.5"/>';
            s += '<rect x="250" y="' + (yA - 11) + '" width="30" height="22" rx="3" style="fill:' + (step >= 3 ? "rgba(255,105,120,.3)" : "rgba(170,179,207,.12)") + ';stroke:#ff6978"/>';
            s += '<rect x="250" y="' + (yB - 11) + '" width="30" height="22" rx="3" style="fill:' + (step >= 3 ? "rgba(255,105,120,.3)" : "rgba(170,179,207,.12)") + ';stroke:#ff6978"/>';
            s += '<text x="265" y="' + (yA + 3) + '" text-anchor="middle" style="font-size:7px;fill:#f5f7ff">meas.</text>';
            s += '<text x="265" y="' + (yB + 3) + '" text-anchor="middle" style="font-size:7px;fill:#f5f7ff">meas.</text>';

            const xs = [55, 135, 215, 295];

            s += '<line x1="' + xs[step] + '" y1="20" x2="' + xs[step] + '" y2="120" style="stroke:#be96ff;stroke-width:1.5;stroke-dasharray:3 3"/>';
            s += '<text x="170" y="140" text-anchor="middle" style="font-size:9px;font-weight:700;fill:#ffd666">' + ["|00⟩", "(|00⟩ + |10⟩)/√2", "(|00⟩ + |11⟩)/√2", "00 or 11, always matching"][step] + "</text>";

            return s;
        }
    });


    make("qc-bell", {
        title: "Try it: measure entangled pairs",
        w: 680, h: 240,
        aria: "A grid of results: each column is one measured pair, with qubit A on top and qubit B below, coloured by result.",
        defaults: { src: "bell" },
        segs: [["Source", "src", [["bell", "Entangled pairs"], ["coins", "Two independent random qubits"]]]],
        actions: [["one", "Measure 1 pair"], ["twenty", "Measure 20 pairs"], ["clr", "Clear"]],
        stats: [["Pairs measured", "n"], ["A's results that were 0", "a0"], ["Pairs that matched", "match"]],
        formula: "Each qubit of an entangled pair gives 0 or 1 at random, 50/50, so neither one alone can send a message. But the pair always matches. Two independent random qubits match only half the time. In 2022 the Nobel Prize in Physics went to experiments showing these links can't be explained by hidden instructions carried by the particles.",
        init: function (s, d) { d.res = []; d.rand = mulberry(Date.now() % 5555); },
        onChange: function (s, d) { d.res = []; },
        act: function (id, s, d) {

            const one = function () { const a = d.rand() < 0.5 ? 0 : 1; const b = s.src === "bell" ? a : (d.rand() < 0.5 ? 0 : 1); d.res.push([a, b]); };

            if (id === "one") { one(); }
            if (id === "twenty") { for (let i = 0; i < 20; i++) { one(); } }
            if (id === "clr") { d.res = []; }

            if (d.res.length > 40) { d.res = d.res.slice(-40); }
        },
        read: function (s, d) {

            const n = d.res.length;
            const a0 = d.res.filter(function (r) { return r[0] === 0; }).length;
            const m = d.res.filter(function (r) { return r[0] === r[1]; }).length;

            return {
                n: String(n),
                a0: n ? Math.round(a0 / n * 100) + "%" : "—",
                match: n ? Math.round(m / n * 100) + "%" : "—",
                verdict: n < 5 ? "Measure some pairs" : m === n ? "Every single pair matched, yet each qubit alone was random" : "About half matched: no link between them"
            };
        },
        reward: { when: function (s, d) { return s.src === "bell" && d.res.length >= 20; }, msg: "You measured 20 entangled pairs" },
        draw: function (ctx, s, d) {

            const x0 = 30;
            const cw = 15.5;

            txt(ctx, "A", 18, 92, 13, TEXT + ".9)", "center", true);
            txt(ctx, "B", 18, 142, 13, TEXT + ".9)", "center", true);

            d.res.forEach(function (r, i) {

                const x = x0 + i * cw + cw / 2;

                dot(ctx, x, 88, 6, r[0] === 0 ? TEAL + ".95)" : GOLD + ".95)");
                dot(ctx, x, 138, 6, r[1] === 0 ? TEAL + ".95)" : GOLD + ".95)");

                if (r[0] !== r[1]) { line(ctx, x, 98, x, 128, ROSE + ".9)", 2); }
            });

            dot(ctx, 40, 200, 6, TEAL + ".95)");
            txt(ctx, "result 0", 52, 204, 12, TEXT + ".85)", "left");
            dot(ctx, 140, 200, 6, GOLD + ".95)");
            txt(ctx, "result 1", 152, 204, 12, TEXT + ".85)", "left");
            line(ctx, 240, 194, 240, 206, ROSE + ".9)", 2);
            txt(ctx, "pair disagreed", 250, 204, 12, TEXT + ".85)", "left");
        }
    });


    make("qc-chsh", {
        title: "Try it: beat the classical limit (a Bell test)",
        w: 680, h: 250,
        aria: "Two dials show the measurement angles chosen by Alice and Bob, and a bar compares the resulting score S with the classical limit of 2.",
        defaults: { a: 0, a2: 45, b: 0, b2: 45 },
        sliders: [["Alice, setting 1", "a", 0, 90, 2.5, function (v) { return v + "°"; }], ["Alice, setting 2", "a2", 0, 90, 2.5, function (v) { return v + "°"; }], ["Bob, setting 1", "b", 0, 90, 2.5, function (v) { return v + "°"; }], ["Bob, setting 2", "b2", 0, 90, 2.5, function (v) { return v + "°"; }]],
        stats: [["Score S", "S"], ["Classical limit", "lim"]],
        formula: "Alice and Bob each measure one photon of an entangled pair along one of two angles. For each pair of settings their results agree with correlation E = cos 2(x − y). The score S = E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′) can never exceed 2 if the photons just carried hidden instructions. Quantum physics reaches 2√2 ≈ 2.83 at 0°, 45°, 22.5° and 67.5°. Real experiments see the quantum value.",
        read: function (s) {

            const E = function (x, y) { return Math.cos(2 * deg(x - y)); };
            const S = Math.abs(E(s.a, s.b) - E(s.a, s.b2) + E(s.a2, s.b) + E(s.a2, s.b2));

            return {
                S: S.toFixed(2),
                lim: "2.00",
                verdict: S > 2.01 ? "S = " + S.toFixed(2) + ": above 2, impossible for any classical explanation" : "S = " + S.toFixed(2) + ": still within what hidden instructions could do"
            };
        },
        reward: { when: function (s) { const E = function (x, y) { return Math.cos(2 * deg(x - y)); }; return Math.abs(E(s.a, s.b) - E(s.a, s.b2) + E(s.a2, s.b) + E(s.a2, s.b2)) > 2.75; }, msg: "You beat the classical limit in a Bell test" },
        draw: function (ctx, s) {

            const E = function (x, y) { return Math.cos(2 * deg(x - y)); };
            const S = Math.abs(E(s.a, s.b) - E(s.a, s.b2) + E(s.a2, s.b) + E(s.a2, s.b2));

            [[110, "Alice", s.a, s.a2, TEAL], [290, "Bob", s.b, s.b2, GOLD]].forEach(function (p) {

                const cx = p[0];
                const cy = 130;
                const R = 70;

                ctx.strokeStyle = GREY + ".4)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(cx, cy, R, -Math.PI / 2 - 0.05, 0.05);
                ctx.stroke();
                arrow(ctx, cx, cy, cx + Math.sin(deg(p[2])) * R, cy - Math.cos(deg(p[2])) * R, p[4] + "1)", 3);
                arrow(ctx, cx, cy, cx + Math.sin(deg(p[3])) * R * 0.8, cy - Math.cos(deg(p[3])) * R * 0.8, p[4] + ".55)", 3);
                txt(ctx, p[1], cx, cy + 30, 14, TEXT + ".9)", "center", true);
                txt(ctx, "solid: setting 1 · faint: setting 2", cx, cy + 50, 10, GREY + ".9)");
            });

            const L = 430;
            const W = 220;
            const xOf = function (v) { return L + W * v / 3; };

            box(ctx, L, 100, W, 30, "rgba(255,255,255,.05)", GREY + ".4)");
            box(ctx, L, 100, xOf(Math.min(S, 3)) - L, 30, (S > 2 ? TEAL : BLUE) + ".75)");
            line(ctx, xOf(2), 88, xOf(2), 142, ROSE + "1)", 2, [4, 3]);
            line(ctx, xOf(2 * Math.SQRT2), 88, xOf(2 * Math.SQRT2), 142, GOLD + "1)", 2, [4, 3]);
            txt(ctx, "classical limit 2", xOf(2), 82, 11, ROSE + "1)");
            txt(ctx, "quantum max 2.83", xOf(2 * Math.SQRT2), 160, 11, GOLD + "1)");
            txt(ctx, "S = " + S.toFixed(2), L + W / 2, 200, 18, TEXT + "1)", "center", true);
        }
    });


    SIMS["qc-entangle-quiz"] = quiz(
        "Game: true or false?",
        ["True", "False"],
        [
            { q: "Entanglement lets you send a message faster than light.", a: "False", why: "Each side's results look random on their own, so no message gets through." },
            { q: "Measuring one qubit of a Bell pair tells you what the other will give.", a: "True", why: "Their results are perfectly correlated." },
            { q: "Two entangled qubits each have their own definite state.", a: "False", why: "Only the pair has a state." },
            { q: "Quantum computers use entangling gates like CNOT.", a: "True", why: "Without entanglement, a quantum computer is no more powerful than a classical one." },
            { q: "Entanglement is easy to keep for a long time.", a: "False", why: "It is fragile: any leak of information to the surroundings destroys it." },
            { q: "Error correction spreads one qubit's information across many entangled qubits.", a: "True", why: "That is how errors are caught without reading the data." }
        ],
        5,
        "qc-entangle-quiz-done",
        "You know what entanglement can and can't do",
        "Entanglement links results, powers algorithms and error correction, and can't send messages.",
        "Linked results, no messages, very fragile. Hit Reset to try again."
    );


    /* ======================================
       UNIT 7: INTERFERENCE
    ====================================== */

    make("qc-waves", {
        title: "Try it: waves add or cancel",
        w: 680, h: 250,
        aria: "Two waves and their sum. Shifting one wave changes whether the sum grows or cancels.",
        defaults: { ph: 0 },
        sliders: [["Shift wave 2 by", "ph", 0, 360, 5, function (v) { return v + "°"; }]],
        stats: [["Size of the sum", "amp"], ["Brightness (amplitude²)", "int"]],
        animated: true,
        formula: "When two waves line up (0° shift) they add to twice the size: constructive interference. Shifted by 180°, they cancel completely: destructive interference. Brightness goes as amplitude squared, 4cos²(φ/2) times one wave. Quantum amplitudes behave the same way, which is why phase matters.",
        read: function (s) {

            const A = 2 * Math.abs(Math.cos(deg(s.ph) / 2));

            return {
                amp: A.toFixed(2) + "×",
                int: (A * A).toFixed(2) + "×",
                verdict: A > 1.9 ? "In step: they add up" : A < 0.1 ? "Opposite: they cancel out" : "Partly in step"
            };
        },
        reward: { when: function (s) { return Math.abs(s.ph - 180) < 3; }, msg: "You made two waves cancel" },
        draw: function (ctx, s, d, t) {

            const L = 40;
            const R = 650;
            const rows = [[60, 0, TEAL, "wave 1"], [125, deg(s.ph), GOLD, "wave 2"], [200, null, PURPLE, "sum"]];

            rows.forEach(function (r) {

                line(ctx, L, r[0], R, r[0], GREY + ".25)", 1);
                ctx.strokeStyle = r[2] + "1)";
                ctx.lineWidth = 2.5;
                ctx.beginPath();

                for (let x = L; x <= R; x += 3) {

                    const k = (x - L) / 60 - t * 1.5;
                    const y = r[1] === null ? 20 * (Math.sin(k) + Math.sin(k + deg(s.ph))) : 20 * Math.sin(k + r[1]);

                    if (x === L) { ctx.moveTo(x, r[0] - y); } else { ctx.lineTo(x, r[0] - y); }
                }

                ctx.stroke();
                txt(ctx, r[3], L - 4, r[0] - 26, 11, r[2] + "1)", "left", true);
            });
        }
    });


    make("qc-mz", {
        title: "Try it: one qubit, two paths, interference",
        w: 680, h: 270,
        aria: "A photon enters a beam splitter, travels two paths, one with a phase shifter, and recombines at a second beam splitter before two detectors.",
        defaults: { ph: 0 },
        sliders: [["Phase shift on the upper path", "ph", 0, 360, 5, function (v) { return v + "°"; }]],
        actions: [["send", "Send 100 photons"], ["clr", "Clear"]],
        stats: [["Predicted at detector 0", "p0"], ["Counts 0 / 1", "cnt"]],
        animated: true,
        formula: "This is a single qubit in disguise: the photon's two paths are |0⟩ and |1⟩, the beam splitters are Hadamard gates, and the phase shifter is a Z rotation. Each photon takes both paths at once, and the paths interfere: detector 0 fires with probability cos²(φ/2). At φ = 0 every photon goes to detector 0; at 180° every photon goes to detector 1.",
        init: function (s, d) { d.n0 = 0; d.n1 = 0; d.dots = []; d.rand = mulberry(17); },
        onChange: function (s, d) { d.n0 = 0; d.n1 = 0; },
        act: function (id, s, d) {

            if (id === "clr") { d.n0 = 0; d.n1 = 0; d.dots = []; return; }

            const p0 = Math.pow(Math.cos(deg(s.ph) / 2), 2);

            for (let i = 0; i < 100; i++) {

                const r = d.rand() < p0 ? 0 : 1;

                d.dots.push({ t: -i * 0.03, r: r });
            }
        },
        step: function (dt, s, d) {

            d.dots.forEach(function (p) { p.t += dt * 0.9; });

            d.dots = d.dots.filter(function (p) {

                if (p.t >= 1) { if (p.r === 0) { d.n0++; } else { d.n1++; } return false; }

                return true;
            });
        },
        liveRead: true,
        read: function (s, d) {

            const p0 = Math.pow(Math.cos(deg(s.ph) / 2), 2);

            return {
                p0: Math.round(p0 * 100) + "%",
                cnt: d.n0 + " / " + d.n1,
                verdict: p0 > 0.99 ? "Perfect interference: every photon reaches detector 0" : p0 < 0.01 ? "Perfect interference the other way: every photon reaches detector 1" : "Partial interference"
            };
        },
        reward: { when: function (s, d) { return Math.abs(s.ph - 180) < 3 && d.n1 >= 100; }, msg: "You steered every photon with interference" },
        draw: function (ctx, s, d) {

            const A = [80, 190];
            const B1 = [200, 190];
            const UP = [200, 70];
            const C = [480, 70];
            const B2 = [480, 190];
            const D0 = [600, 190];
            const D1 = [480, 250];

            line(ctx, A[0] - 40, A[1], B1[0], B1[1], ROSE + ".6)", 2);
            line(ctx, B1[0], B1[1], B2[0], B2[1], ROSE + ".6)", 2);
            line(ctx, B1[0], B1[1], UP[0], UP[1], ROSE + ".6)", 2);
            line(ctx, UP[0], UP[1], C[0], C[1], ROSE + ".6)", 2);
            line(ctx, C[0], C[1], B2[0], B2[1], ROSE + ".6)", 2);
            line(ctx, B2[0], B2[1], D0[0], D0[1], ROSE + ".6)", 2);
            line(ctx, B2[0], B2[1], D1[0], D1[1] - 14, ROSE + ".6)", 2);

            [B1, B2].forEach(function (p) {

                ctx.save();
                ctx.translate(p[0], p[1]);
                ctx.rotate(-Math.PI / 4);
                box(ctx, -20, -3, 40, 6, BLUE + ".8)");
                ctx.restore();
            });

            [UP, C].forEach(function (p) { ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.PI / 4); box(ctx, -18, -3, 36, 6, GREY + ".9)"); ctx.restore(); });

            box(ctx, 320, 55, 44, 30, GOLD + ".35)", GOLD + "1)");
            txt(ctx, "φ = " + s.ph + "°", 342, 48, 12, GOLD + "1)", "center", true);
            txt(ctx, "beam splitter (H)", B1[0], B1[1] + 30, 11, BLUE + "1)");
            txt(ctx, "beam splitter (H)", B2[0] - 70, B2[1] + 30, 11, BLUE + "1)");

            box(ctx, D0[0], D0[1] - 16, 34, 32, TEAL + ".4)", TEAL + "1)");
            txt(ctx, "D0", D0[0] + 17, D0[1] + 5, 12, TEXT + "1)", "center", true);
            txt(ctx, String(d.n0), D0[0] + 17, D0[1] - 24, 13, TEAL + "1)", "center", true);
            box(ctx, D1[0] - 17, D1[1] - 14, 34, 22, GOLD + ".4)", GOLD + "1)");
            txt(ctx, "D1", D1[0], D1[1] + 2, 12, TEXT + "1)", "center", true);
            txt(ctx, String(d.n1), D1[0] + 32, D1[1] + 2, 13, GOLD + "1)", "left", true);

            const lerp = function (p, q, k) { return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]; };

            d.dots.forEach(function (p) {

                if (p.t < 0) { return; }

                if (p.t < 0.2) {

                    const q = lerp([A[0] - 40, A[1]], B1, p.t / 0.2);

                    dot(ctx, q[0], q[1], 4, ROSE + "1)");

                } else if (p.t < 0.75) {

                    const k = (p.t - 0.2) / 0.55;
                    const lower = lerp(B1, B2, k);
                    const upper = k < 0.15 ? lerp(B1, UP, k / 0.15) : k < 0.85 ? lerp(UP, C, (k - 0.15) / 0.7) : lerp(C, B2, (k - 0.85) / 0.15);

                    dot(ctx, lower[0], lower[1], 3.4, ROSE + ".6)");
                    dot(ctx, upper[0], upper[1], 3.4, ROSE + ".6)");

                } else {

                    const k = (p.t - 0.75) / 0.25;
                    const q = p.r === 0 ? lerp(B2, D0, k) : lerp(B2, [D1[0], D1[1] - 14], k);

                    dot(ctx, q[0], q[1], 4, (p.r === 0 ? TEAL : GOLD) + "1)");
                }
            });

            txt(ctx, "the photon travels both paths at once", 340, 130, 12, GREY + ".9)");
        }
    });


    SIMS["qc-algo-steps"] = stepper({
        title: "Explore: the recipe behind quantum algorithms",
        viewBox: "0 0 340 150",
        aria: "Bars for eight possible answers change through four steps: spread out, mark, amplify and measure.",
        interval: 6.5,
        steps: [
            { t: "1. Spread out", text: "Put the qubits in an even superposition, so every possible answer has the same small amplitude." },
            { t: "2. Mark the answer", text: "A clever circuit flips the sign of the right answer's amplitude. Nothing is measured yet, so nothing is revealed." },
            { t: "3. Interfere", text: "Another circuit makes the amplitudes interfere: the marked one grows, the others shrink." },
            { t: "4. Measure", text: "Now measuring gives the right answer with high probability. The trick is not trying every answer at once, but choreographing the cancellations." }
        ],
        rewardKey: "qc-algo-steps",
        rewardMsg: "You followed the four steps of a quantum algorithm",
        draw: function (step) {

            const sets = [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, -1, 1, 1], [0.35, 0.35, 0.35, 0.35, 0.35, 2.6, 0.35, 0.35], [0, 0, 0, 0, 0, 2.8, 0, 0]];
            const v = sets[step];
            let s = '<line x1="30" y1="80" x2="310" y2="80" style="stroke:rgba(170,179,207,.6)"/>';

            v.forEach(function (a, i) {

                const h = a * 22;
                const x = 40 + i * 34;

                s += '<rect x="' + x + '" y="' + (h >= 0 ? 80 - h : 80) + '" width="22" height="' + Math.abs(h) + '" style="fill:' + (i === 5 ? "#ffd666" : (a < 0 ? "#ff6978" : "#54e0c7")) + ';opacity:.85"/>';
                s += '<text x="' + (x + 11) + '" y="140" text-anchor="middle" style="font-size:7px;fill:rgba(245,247,255,.8)">' + i.toString(2).padStart(3, "0") + "</text>";
            });

            s += '<text x="210" y="18" style="font-size:7px;fill:#ffd666">the right answer</text>';

            return s;
        }
    });


    make("qc-grover", {
        title: "Try it: Grover's search, one step at a time",
        w: 680, h: 260,
        aria: "One bar for every item in the list, showing its amplitude. The marked item's bar grows with each Grover step.",
        defaults: { N: 16 },
        segs: [["Items in the list", "N", [[4, "4"], [8, "8"], [16, "16"], [32, "32"], [64, "64"]]]],
        actions: [["oracle", "Mark (flip the answer)"], ["diffuse", "Interfere (reflect about the average)"], ["step", "One full Grover step"], ["measure", "Measure"], ["new", "New hidden answer"]],
        stats: [["Grover steps done", "it"], ["Chance of finding it", "p"], ["Best number of steps", "best"]],
        formula: "Searching N items classically takes about N/2 tries on average. Grover's algorithm needs only about (π/4)√N steps, a quadratic speedup. Each step marks the answer (flip its sign) and then reflects every amplitude about the average, which grows the marked one. Go past the best number of steps and the chance falls again: it is interference, so timing matters.",
        init: function (s, d) { d.rand = mulberry(Date.now() % 3333); d.reset = true; },
        onChange: function (s, d) { d.reset = true; },
        act: function (id, s, d) {

            if (id === "new") { d.reset = true; return; }

            const N = s.N;

            if (id === "oracle" || id === "step") { d.v[d.mark] = -d.v[d.mark]; }

            if (id === "diffuse" || id === "step") {

                const mean = d.v.reduce(function (a, b) { return a + b; }, 0) / N;

                d.v = d.v.map(function (a) { return 2 * mean - a; });
            }

            if (id === "step") { d.it++; }

            if (id === "measure") {

                let r = d.rand();
                let pick = 0;

                for (let i = 0; i < N; i++) { r -= d.v[i] * d.v[i]; if (r <= 0) { pick = i; break; } }

                d.measured = pick;
                d.found = pick === d.mark;

                if (d.found && d.it >= 1) { d.win = true; }
            }
        },
        read: function (s, d) {

            if (d.reset) { setup(s, d); }

            return {
                it: String(d.it),
                p: Math.round(d.v[d.mark] * d.v[d.mark] * 100) + "%",
                best: String(Math.max(1, Math.round(Math.PI / 4 * Math.sqrt(s.N) - 0.5))),
                verdict: d.measured !== null ? (d.found ? "Found it on the first look, after " + d.it + " Grover step" + (d.it === 1 ? "" : "s") : "Missed: measured item " + d.measured + ". Try the best number of steps.") : "Press One full Grover step, then Measure"
            };
        },
        reward: { when: function (s, d) { return d.win && s.N >= 16; }, msg: "You found the hidden item with Grover's algorithm" },
        draw: function (ctx, s, d) {

            if (d.reset) { setup(s, d); }

            const N = s.N;
            const L = 40;
            const R = 650;
            const mid = 140;
            const bw = (R - L) / N;

            line(ctx, L, mid, R, mid, GREY + ".6)", 1);

            d.v.forEach(function (a, i) {

                const h = a * 110;
                const isM = i === d.mark;

                box(ctx, L + i * bw + bw * 0.15, h >= 0 ? mid - h : mid, bw * 0.7, Math.abs(h), (isM ? GOLD : a < 0 ? ROSE : TEAL) + ".85)");

                if (d.measured === i) { txt(ctx, "▼", L + (i + 0.5) * bw, mid - Math.abs(h) - 8, 14, TEXT + "1)"); }
            });

            const mean = d.v.reduce(function (a, b) { return a + b; }, 0) / N;

            line(ctx, L, mid - mean * 110, R, mid - mean * 110, PURPLE + ".9)", 1.5, [5, 4]);
            txt(ctx, "average", R, mid - mean * 110 - 6, 11, PURPLE + "1)", "right");
            txt(ctx, "gold bar: the hidden answer", L, 248, 12, GOLD + "1)", "left");
        }
    });

    function setup(s, d) {

        const N = s.N;

        d.v = [];

        for (let i = 0; i < N; i++) { d.v.push(1 / Math.sqrt(N)); }

        d.mark = Math.floor(d.rand() * N);
        d.it = 0;
        d.measured = null;
        d.found = false;
        d.reset = false;
    }


    make("qc-speedup", {
        title: "Try it: how much faster? It depends on the problem",
        w: 680, h: 250,
        aria: "A chart of the number of steps needed against problem size, comparing the best classical method with the quantum algorithm.",
        defaults: { prob: "search", size: 6 },
        segs: [["Problem", "prob", [["search", "Search an unsorted list"], ["factor", "Factor a large number"]]]],
        sliders: [["Problem size", "size", 2, 12, 0.25, function (v, s) { return s.prob === "search" ? "10" + sup(Math.round(v)) + " items" : Math.round(Math.pow(2, v)) + "-bit number"; }]],
        stats: [["Classical steps", "c"], ["Quantum steps", "q"]],
        formula: "Searching gives a quadratic speedup: N/2 classical tries against about √N quantum steps. Useful, but modest. Factoring gives an exponential one: the best known classical method grows almost exponentially with the number of digits, while Shor's algorithm grows only polynomially (roughly n³ steps for an n-bit number). Step counts here are rough illustrations, not timings.",
        read: function (s) {

            const r = speed(s);

            return {
                c: "about 10" + sup(Math.round(r.c)),
                q: "about 10" + sup(Math.round(r.q)),
                verdict: s.prob === "search" ? "Quadratic speedup: quantum needs the square root of the classical effort" : "Exponential speedup: the gap explodes as numbers get bigger"
            };
        },
        draw: function (ctx, s) {

            const L = 70;
            const R = 650;
            const B = 210;
            const T = 20;
            const xs = [];

            for (let v = 2; v <= 12.001; v += 0.1) { xs.push(v); }

            const pts = xs.map(function (v) { return speed({ prob: s.prob, size: v }); });
            const maxY = Math.max.apply(null, pts.map(function (p) { return p.c; })) * 1.05;
            const X = function (v) { return L + (R - L) * (v - 2) / 10; };
            const Y = function (lg) { return B - (B - T) * lg / maxY; };

            line(ctx, L, B, R, B, GREY + ".6)", 1);
            line(ctx, L, B, L, T, GREY + ".6)", 1);
            txt(ctx, "steps (log)", L - 8, T + 4, 11, GREY + ".9)", "right");
            txt(ctx, "bigger problem →", R, B + 22, 11, GREY + ".9)", "right");

            [["c", ROSE, "best classical method"], ["q", TEAL, "quantum algorithm"]].forEach(function (k) {

                ctx.strokeStyle = k[1] + "1)";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                pts.forEach(function (p, i) { const y = Y(p[k[0]]); if (i === 0) { ctx.moveTo(X(xs[i]), y); } else { ctx.lineTo(X(xs[i]), y); } });
                ctx.stroke();
                txt(ctx, k[2], X(12) - 4, Y(pts[pts.length - 1][k[0]]) - 8, 12, k[1] + "1)", "right", true);
            });

            const r = speed(s);

            line(ctx, X(s.size), B, X(s.size), T, TEXT + ".4)", 1, [4, 4]);
            dot(ctx, X(s.size), Y(r.c), 5, ROSE + "1)");
            dot(ctx, X(s.size), Y(r.q), 5, TEAL + "1)");
        }
    });

    // log10 of step counts. Search: size = log10(N). Factor: size = log2(bits).
    function speed(s) {

        if (s.prob === "search") {

            const lgN = s.size;

            return { c: lgN - Math.log10(2), q: lgN / 2 + Math.log10(Math.PI / 4) };
        }

        const n = Math.pow(2, s.size);
        const lnN = n * Math.LN2;
        const gnfs = 1.923 * Math.pow(lnN, 1 / 3) * Math.pow(Math.log(lnN), 2 / 3);

        return { c: gnfs / Math.LN10, q: 3 * Math.log10(n) };
    }


    /* ======================================
       UNIT 8: WHAT QUANTUM COMPUTERS ARE GOOD FOR
    ====================================== */

    SIMS["qc-usecase"] = quiz(
        "Game: quantum, classical, or still unclear?",
        ["Quantum could help a lot", "Classical is fine", "Still unclear"],
        [
            { q: "Simulating how a catalyst molecule breaks apart nitrogen.", a: "Quantum could help a lot", why: "Molecules are quantum systems: the original reason to build quantum computers." },
            { q: "Streaming a video.", a: "Classical is fine", why: "Nothing quantum about it, and classical chips do it cheaply." },
            { q: "Designing a better battery electrolyte from first principles.", a: "Quantum could help a lot", why: "Electron behaviour in materials is a natural fit." },
            { q: "Running a spreadsheet.", a: "Classical is fine", why: "Quantum computers won't speed up everyday software." },
            { q: "Planning delivery routes for a fleet of trucks.", a: "Still unclear", why: "Speedups for optimisation are modest or unproven, and classical methods are very good." },
            { q: "Training a huge AI model on terabytes of data.", a: "Still unclear", why: "Loading big data into qubits is a bottleneck; claimed speedups are debated." },
            { q: "Breaking today's RSA encryption.", a: "Quantum could help a lot", why: "Shor's algorithm, though it needs a very large error-corrected machine." },
            { q: "Searching your email inbox.", a: "Classical is fine", why: "Indexes make this instant on classical computers." },
            { q: "Measuring tiny magnetic fields from the brain or heart.", a: "Quantum could help a lot", why: "Quantum sensors already do this today." }
        ],
        6,
        "qc-usecase-done",
        "You can sort real uses from hype",
        "Quantum computers are specialists: chemistry, materials, cryptography and sensing, not everything.",
        "Chemistry and cryptography: quantum. Everyday software: classical. Optimisation and machine learning: unclear. Hit Reset to try again."
    );


    SIMS["qc-hndl"] = stepper({
        title: "Explore: harvest now, decrypt later",
        viewBox: "0 0 340 150",
        aria: "A timeline: encrypted data is copied today, stored for years, and decrypted once a large quantum computer exists, unless it was protected with post-quantum encryption.",
        interval: 6.5,
        steps: [
            { t: "Today: your data is encrypted", text: "Health records, bank transfers and government messages are protected with RSA or elliptic-curve encryption, which classical computers can't break." },
            { t: "An eavesdropper copies it anyway", text: "They can't read it yet, so they simply store the encrypted data and wait." },
            { t: "Years later: a large quantum computer", text: "If an error-corrected quantum computer arrives, Shor's algorithm could unlock the stored data, even if it is ten or twenty years old." },
            { t: "The fix: post-quantum encryption, now", text: "New encryption methods based on maths that quantum computers can't easily solve were standardised by NIST in 2024. Data protected with them today stays safe later." }
        ],
        rewardKey: "qc-hndl",
        rewardMsg: "You understand harvest now, decrypt later",
        draw: function (step) {

            let s = '<line x1="20" y1="100" x2="320" y2="100" style="stroke:rgba(170,179,207,.6);stroke-width:1.5"/>';

            s += '<text x="40" y="118" text-anchor="middle" style="font-size:7px;fill:rgba(170,179,207,.9)">today</text>';
            s += '<text x="280" y="118" text-anchor="middle" style="font-size:7px;fill:rgba(170,179,207,.9)">years later</text>';
            s += '<rect x="25" y="55" width="30" height="34" rx="3" style="fill:rgba(84,224,199,.3);stroke:#54e0c7"/><text x="40" y="76" text-anchor="middle" style="font-size:12px">🔒</text>';

            if (step >= 1) {

                s += '<rect x="130" y="55" width="40" height="34" rx="3" style="fill:rgba(255,105,120,.25);stroke:#ff6978"/><text x="150" y="76" text-anchor="middle" style="font-size:12px">💾</text>';
                s += '<text x="150" y="48" text-anchor="middle" style="font-size:7px;fill:#ff6978">stored copy</text>';
            }

            if (step >= 2) {

                s += '<rect x="255" y="55" width="50" height="34" rx="3" style="fill:rgba(255,214,102,.25);stroke:#ffd666"/><text x="280" y="76" text-anchor="middle" style="font-size:12px">⚛️</text>';
                s += '<text x="280" y="48" text-anchor="middle" style="font-size:7px;fill:#ffd666">quantum computer</text>';
            }

            if (step === 2) { s += '<text x="200" y="140" text-anchor="middle" style="font-size:8px;font-weight:700;fill:#ff6978">old data unlocked 🔓</text>'; }
            if (step === 3) { s += '<text x="170" y="140" text-anchor="middle" style="font-size:8px;font-weight:700;fill:#54e0c7">post-quantum encryption keeps it locked 🔒</text>'; }

            return s;
        }
    });


    const NEEDS = [
        { lo: 2, hi: 3.1, n: "Today's largest chips", c: BLUE, note: "hundreds to about a thousand noisy physical qubits" },
        { lo: 5, hi: 6, n: "Useful chemistry simulations", c: TEAL, note: "estimates run from about 100,000 to millions" },
        { lo: 5.8, hi: 6.3, n: "Breaking RSA-2048", c: ROSE, note: "about a million (a 2025 estimate)" }
    ];

    make("qc-resource", {
        title: "Try it: how big a quantum computer do we need?",
        w: 680, h: 240,
        aria: "A logarithmic scale of physical qubit counts with bands for today's chips, useful chemistry and breaking RSA encryption, and a marker for the chosen machine size.",
        defaults: { lg: 3 },
        sliders: [["Physical qubits in your machine", "lg", 1, 7, 0.1, function (v) { return Math.round(Math.pow(10, v)).toLocaleString("en-US"); }]],
        stats: [["Qubits", "q"], ["What it could do", "can"]],
        formula: "Useful algorithms need error-corrected logical qubits, and each logical qubit takes hundreds to thousands of physical ones. Estimates here are rough, depend on how good each qubit is, and keep dropping as algorithms improve. The gap between today's chips and useful machines is why fabrication quality and scaling are the central challenge.",
        read: function (s) {

            const can = NEEDS.filter(function (x) { return s.lg >= x.lo; }).map(function (x) { return x.n; });

            return {
                q: Math.round(Math.pow(10, s.lg)).toLocaleString("en-US"),
                can: s.lg >= 5.8 ? "Chemistry, and possibly breaking RSA" : s.lg >= 5 ? "Some useful chemistry" : "Experiments and demonstrations",
                verdict: s.lg < 3.2 ? "About where today's machines are" : s.lg < 5 ? "Beyond today, but still short of useful error-corrected computing" : "The scale where quantum computers start to pay off"
            };
        },
        reward: { when: function (s) { return s.lg >= 6; }, msg: "You found the million-qubit scale" },
        draw: function (ctx, s) {

            const L = 40;
            const R = 650;
            const X = function (lg) { return L + (R - L) * (lg - 1) / 6; };

            line(ctx, L, 190, R, 190, GREY + ".6)", 1);

            for (let k = 1; k <= 7; k++) {

                line(ctx, X(k), 186, X(k), 194, GREY + ".8)", 1);
                txt(ctx, Math.pow(10, k).toLocaleString("en-US"), X(k), 212, 11, GREY + ".9)");
            }

            NEEDS.forEach(function (x, i) {

                const y = 40 + i * 48;

                box(ctx, X(x.lo), y, X(x.hi) - X(x.lo), 26, x.c + ".35)", x.c + "1)");
                txt(ctx, x.n, X(x.lo) - 6, y + 12, 12, TEXT + "1)", "right", true);
                txt(ctx, x.note, X(x.lo) - 6, y + 26, 10, GREY + ".9)", "right");
            });

            line(ctx, X(s.lg), 30, X(s.lg), 192, GOLD + "1)", 2.5);
            dot(ctx, X(s.lg), 190, 6, GOLD + "1)");
            txt(ctx, "physical qubits (log scale)", (L + R) / 2, 234, 11, GREY + ".8)");
        }
    });


    // The rest of the course simulators, and the 3D models when the page has one.
    // Unit pages load only the file their part needs; other pages load them all.
    const unitNo = (location.pathname.match(/qcunit(\d+)\.html/) || [])[1];
    const needs = function (lo, hi) { return !unitNo || (+unitNo >= lo && +unitNo <= hi); };

    [].concat(needs(9, 14) ? [["fabQcScriptB", "diagram-sims-qc-b.js"]] : [])
        .concat(needs(15, 20) ? [["fabQcScriptC", "diagram-sims-qc-c.js"]] : [])
        .concat(needs(21, 27) ? [["fabQcScriptD", "diagram-sims-qc-d.js"]] : [])
        .concat(document.querySelector('.fd-sim[data-sim^="qc-3d-"]') ? [["fabQc3dScript", "diagram-sims-qc-3d.js"]] : [])
        .forEach(function (f) {

            if (document.getElementById(f[0])) {
                return;
            }

            const more = document.createElement("script");

            more.id = f[0];
            more.src = f[1];

            document.head.appendChild(more);
        });

    document.querySelectorAll('.fd-sim[data-sim^="qc-"]').forEach(F.mount);

})();
