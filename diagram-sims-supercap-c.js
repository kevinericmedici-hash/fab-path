/* ========================================
   SUPERCAPACITORS: INTERACTIVE SIMULATORS, PART 3

   Unit 15: interdigitated combs, 3D electrodes, pattern games.
   Unit 16: fiber layouts, fiber resistance.
   Unit 17: stretchable serpentines, shape-shifting game.
   Unit 18: electrode pairing, charge balance, shape-to-job game.
   Unit 19: electrolyte jobs, wish list, solvation, power.
   Unit 20: the voltage window, past the limit.
   Unit 21: aqueous electrolytes, water splitting.
   Unit 22: organic and ionic liquids.
   Unit 23: gels and solids.
   Unit 24: ion size, temperature, choosing an electrolyte.

   Registers on window.FabInteract; loaded by diagram-sims-supercap.js.
   Teaching models: numbers and shapes are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers || !F.scHelpers) {
        return;
    }

    const M = F.memsHelpers;
    const H = F.scHelpers;
    const clamp = M.clamp;
    const mulberry = M.mulberry;
    const seg = M.seg;
    const wire = M.wire;
    const head = M.head;
    const setVal = M.setVal;
    const out = M.out;
    const art = M.art;
    const stat = M.stat;
    const rect = M.rect;
    const label = M.label;
    const animate = M.animate;
    const bindPause = M.bindPause;
    const quiz = M.quiz;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const canvasFor = H.canvasFor;
    const clear = H.clear;
    const txt = H.txt;
    const dot = H.dot;

    const TEAL = "rgba(84,224,199,";
    const GOLD = "rgba(255,214,102,";
    const ROSE = "rgba(255,105,120,";
    const BLUE = "rgba(120,180,255,";
    const GREY = "rgba(170,179,207,";
    const TEXT = "rgba(245,247,255,";

    // A "set your priorities" explorer: sliders weight the properties and bars rank the options.
    function priority(cfg) {

        return function (root) {

            const defaults = {};

            cfg.props.forEach(function (p) { defaults[p.k] = 1; });

            const state = Object.assign({}, defaults);
            const winners = {};

            root.innerHTML =
                head(cfg.title) +
                art("0 0 340 " + (30 + cfg.fam.length * 38), cfg.aria) +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
                '<p class="fd-sim-note" data-out="why"></p>' +
                '<div class="fd-sim-controls">' +
                cfg.props.map(function (p) { return slider({ label: p.n + " matters", key: p.k, min: 0, max: 3, step: 1, value: 1 }); }).join("") +
                "</div>" +
                '<p class="fd-sim-formula">' + cfg.foot + "</p>";

            const svg = root.querySelector("svg");

            function update() {

                const words = ["not at all", "a little", "quite a lot", "essential"];

                cfg.props.forEach(function (p) { setVal(root, p.k, words[state[p.k]]); });

                const total = cfg.props.reduce(function (a, p) { return a + state[p.k]; }, 0);
                const scores = cfg.fam.map(function (f) {

                    return total ? cfg.props.reduce(function (a, p) { return a + state[p.k] * f.r[p.k]; }, 0) / (total * 5) : 0;
                });

                let best = 0;

                scores.forEach(function (s, i) { if (s > scores[best]) { best = i; } });

                let s = label(14, 14, "How well each option fits your priorities", 8, "start", "var(--muted)");

                cfg.fam.forEach(function (f, i) {

                    const y = 30 + i * 38;

                    s += label(14, y + 4, f.n, 8.5, "start", "var(--text)");
                    s += rect(14, y + 9, 230, 15, "rgba(170,179,207,.2)");
                    s += rect(14, y + 9, 230 * scores[i], 15, f.c + (i === best && total ? ".95)" : ".45)"));
                    s += label(250, y + 21, Math.round(scores[i] * 100) + "%", 9, "start", "var(--text)");
                });

                svg.innerHTML = s;

                if (!total) {

                    out(root, "verdict", "Raise a priority above");
                    out(root, "why", "Slide at least one property up to see which option fits.");

                    return;
                }

                const weak = cfg.props.filter(function (p) { return cfg.fam[best].r[p.k] <= 2 && state[p.k] > 0; });

                out(root, "verdict", cfg.fam[best].n + " fits best");
                out(root, "why", weak.length ? "But it is weak on: " + weak.map(function (p) { return p.n.toLowerCase(); }).join(", ") + "." : "And it does not give up anything you asked for.");

                winners[best] = true;

                if (Object.keys(winners).length >= cfg.fam.length) {
                    F.reward(cfg.key, 10, "You found a priority set for every option");
                }
            }

            wire(root, state, defaults, update);
            update();
        };
    }


    /* ======================================
       UNIT 15: MICRO ARCHITECTURES
    ====================================== */

    SIMS["supercap-comb"] = function (root) {

        const defaults = { w: 20, g: 20, h: 20 };
        const state = { w: 20, g: 20, h: 20 };
        const W = 1000;
        const LEN = 1000;
        const base = { facing: 0, mat: 0 };

        root.innerHTML =
            head("Try it: design an interdigitated comb") +
            canvasFor(root, 680, 340, "A top view of two interleaved combs of electrode fingers, positive and negative, and a small side view showing the finger height.") +
            '<div class="fd-stat-row">' + stat("Fingers", "n") + stat("Facing electrode area", "face") + stat("Footprint covered by electrode", "cov") + stat("Ion trip across a gap", "trip") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Finger width", key: "w", min: 5, max: 60, step: 5, value: 20 }) +
            slider({ label: "Gap between fingers", key: "g", min: 2, max: 40, step: 2, value: 20 }) +
            slider({ label: "Finger height", key: "h", min: 5, max: 100, step: 5, value: 20 }) +
            "</div>" +
            '<p class="fd-sim-formula">Footprint fixed at 1 mm × 1 mm. Narrow gaps and tall fingers add facing area and shorten the ion trip; but narrow fingers leave less of the footprint holding material.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function calc(s) {

            const n = Math.max(2, Math.floor((W + s.g) / (s.w + s.g)));

            return { n: n, facing: (n - 1) * LEN * s.h, cov: n * s.w / W, trip: s.g };
        }

        const b0 = calc(defaults);

        function update() {

            const c = calc(state);

            setVal(root, "w", state.w + " µm");
            setVal(root, "g", state.g + " µm");
            setVal(root, "h", state.h + " µm");
            out(root, "n", c.n);
            out(root, "face", (c.facing / b0.facing).toFixed(1) + "× the start");
            out(root, "cov", Math.round(Math.min(1, c.cov) * 100) + " %");
            out(root, "trip", state.g + " µm");

            const rel = c.facing / b0.facing;

            out(root, "verdict", rel > 2.5 ? "Lots of facing area and short ion trips" : rel < 0.6 ? "Few facing edges: little area for charge" : "A balanced comb");

            if (rel >= 3 && Math.min(1, c.cov) >= 0.4) {
                F.reward("supercap-comb", 10, "You designed a dense, well-covered comb");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const c = calc(state);
            const k = 540 / W;
            const x0 = 30;
            const y0 = 40;
            const h = 250;

            ctx.fillStyle = GREY + ".12)";
            ctx.fillRect(x0 - 6, y0 - 6, W * k + 12, h + 12);

            // busbars
            ctx.fillStyle = TEAL + ".7)";
            ctx.fillRect(x0, y0 - 14, W * k, 8);
            ctx.fillStyle = GOLD + ".7)";
            ctx.fillRect(x0, y0 + h + 6, W * k, 8);

            for (let i = 0; i < c.n; i++) {

                const x = x0 + i * (state.w + state.g) * k;
                const even = i % 2 === 0;

                ctx.fillStyle = (even ? TEAL : GOLD) + ".85)";
                ctx.fillRect(x, even ? y0 - 6 : y0 + 12, Math.max(1, state.w * k), h - 12);
            }

            txt(ctx, "top view, 1 mm × 1 mm", x0 + W * k / 2, 20, 13, TEXT + ".7)");

            // side view of finger height
            const sx = 620;
            const sh = 220 * state.h / 100;

            ctx.fillStyle = GREY + ".4)";
            ctx.fillRect(sx - 40, 290, 80, 8);
            ctx.fillStyle = TEAL + ".8)";
            ctx.fillRect(sx - 14, 290 - sh, 28, sh);
            txt(ctx, "height", sx, 320, 12, TEXT + ".8)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-microarch"] = quiz(
        "Game: which micro pattern?",
        ["Concentric rings", "Spirals", "Serpentine", "Fractal-style"],
        [
            { q: "Round layouts that suit circular microchips and coin-like devices.", a: "Concentric rings", why: "Rings fit a round footprint." },
            { q: "Two intertwined arms packed into a small round footprint.", a: "Spirals", why: "A spiral packs long fingers into a round area." },
            { q: "Winding, meandering fingers that can also flex.", a: "Serpentine", why: "The wiggles let it bend and stretch." },
            { q: "Space-filling curves that pack long facing edges into little area.", a: "Fractal-style", why: "More edge per footprint means shorter ion paths." },
            { q: "Which pattern is best for a flexible device?", a: "Serpentine", why: "Meandering fingers flex without breaking." },
            { q: "Which pattern fits a round chip best?", a: "Concentric rings", why: "It matches the shape of the chip." }
        ],
        5,
        "supercap-microarch-done",
        "You know your micro patterns",
        "Rings, spirals, serpentines and fractals: all about more edge per footprint.",
        "The goal is more electrode-to-electrode edge in the same footprint. Hit Reset to try again."
    );


    SIMS["supercap-tall"] = function (root) {

        const defaults = { h: 30, g: 6 };
        const state = { h: 30, g: 6 };
        let hit = false;

        root.innerHTML =
            head("Try it: grow the electrodes taller") +
            canvasFor(root, 680, 340, "A cross-section of two tall electrode walls with electrolyte between them. Ions are brightest at the top and fade deeper down, so very tall, closely spaced walls leave the bottom unused.") +
            '<div class="fd-stat-row">' + stat("Wall area added", "area") + stat("Area ions actually reach", "reach") + stat("Bottom reached?", "bot") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Wall height", key: "h", min: 5, max: 200, step: 5, value: 30 }) +
            slider({ label: "Spacing between walls", key: "g", min: 2, max: 20, step: 1, value: 6 }) +
            "</div>" +
            '<p class="fd-sim-formula">The footprint stays the same, so more height means more area. But ions have to diffuse down a narrow channel: very tall, tight electrodes can starve. (Illustrative model.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(2);
        const ions = [];

        for (let i = 0; i < 40; i++) { ions.push({ x: rand(), y: rand(), v: 0.2 + rand() * 0.4 }); }

        function lam() { return state.g * 9; }

        function metrics() {

            const L = lam();
            const reach = L * (1 - Math.exp(-state.h / L));

            return { reach: reach, added: state.h, depthFrac: Math.exp(-state.h / L) };
        }

        function update() {

            const m = metrics();

            setVal(root, "h", state.h + " µm");
            setVal(root, "g", state.g + " µm");
            out(root, "area", state.h + " units");
            out(root, "reach", Math.round(m.reach) + " units (" + Math.round(m.reach / state.h * 100) + " %)");
            out(root, "bot", m.depthFrac > 0.3 ? "yes" : m.depthFrac > 0.1 ? "barely" : "no: starved");
            out(root, "verdict", m.reach / state.h > 0.8 ? "Almost all the extra area is used" : m.reach / state.h > 0.45 ? "Diminishing returns: the lower walls get less" : "Too tall for the spacing: most of the wall is wasted");

            if (!hit && state.h >= 100 && m.reach / state.h > 0.7) {

                hit = true;
                F.reward("supercap-tall", 10, "You found tall electrodes that are not starved");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const hh = 260;
            const top = 40;
            const gap = 40 + state.g * 6;
            const wall = 120;
            const cx = 340;
            const L = lam();
            const sc = hh / Math.max(state.h, 1);

            // electrolyte channel with ion concentration fading downward
            const grad = ctx.createLinearGradient(0, top, 0, top + hh);

            for (let i = 0; i <= 10; i++) {
                grad.addColorStop(i / 10, ROSE + (0.1 + 0.55 * Math.exp(-(i / 10 * state.h) / L)) + ")");
            }

            ctx.fillStyle = grad;
            ctx.fillRect(cx - gap / 2, top, gap, hh);

            ctx.fillStyle = TEAL + ".6)";
            ctx.fillRect(cx - gap / 2 - wall, top, wall, hh);
            ctx.fillStyle = GOLD + ".6)";
            ctx.fillRect(cx + gap / 2, top, wall, hh);

            ctx.fillStyle = GREY + ".7)";
            ctx.fillRect(cx - gap / 2 - wall, top + hh, gap + wall * 2, 10);

            ions.forEach(function (i) {

                const y = top + i.y * hh;
                const keep = Math.exp(-((y - top) / hh * state.h) / L);

                if (Math.random() < keep + 0.1) {
                    dot(ctx, cx - gap / 2 + 4 + i.x * (gap - 8), y, 3, ROSE + "1)");
                }
            });

            txt(ctx, "ions pour in from the top ↓", cx, top - 12, 13, TEXT + ".8)");
            txt(ctx, "unused", cx, top + hh - 14, 12, TEXT + ".6)");

            // ruler
            ctx.strokeStyle = TEXT + ".6)";
            ctx.beginPath();
            ctx.moveTo(cx + gap / 2 + wall + 20, top); ctx.lineTo(cx + gap / 2 + wall + 20, top + hh);
            ctx.stroke();
            txt(ctx, state.h + " µm", cx + gap / 2 + wall + 52, top + hh / 2, 13, TEXT + ".8)");
            sc;
        }

        animate(root, function () { draw(); });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-threed"] = quiz(
        "Game: which 3D electrode?",
        ["Tall walls", "Pillar arrays", "Etched trenches", "Porous scaffolds"],
        [
            { q: "High-aspect-ratio fingers that add sidewall area.", a: "Tall walls", why: "Taller walls mean more area in the same footprint." },
            { q: "A forest of posts or rods with lots of surface.", a: "Pillar arrays", why: "Every post adds sidewall area." },
            { q: "Deep wells carved into silicon, then coated with active material.", a: "Etched trenches", why: "The trench walls become the electrode." },
            { q: "Foams and sponges used as a 3D skeleton for active material.", a: "Porous scaffolds", why: "They give a large internal surface." },
            { q: "Deep electrodes like these can starve for ions if they get too tall or dense.", a: "Tall walls", why: "Ions struggle to reach the bottom of narrow, tall channels." },
            { q: "A sponge-like skeleton coated with the active material.", a: "Porous scaffolds", why: "The skeleton is the 3D structure." }
        ],
        5,
        "supercap-threed-done",
        "You know the 3D families",
        "Walls, pillars, trenches and scaffolds: all grow area upward.",
        "All four grow upward, not outward. Hit Reset to try again."
    );


    /* ======================================
       UNIT 16: FIBERS
    ====================================== */

    SIMS["supercap-fiberlayout"] = quiz(
        "Game: which fiber layout?",
        ["Parallel", "Twisted", "Coaxial"],
        [
            { q: "Two fibers side by side, coated in gel electrolyte.", a: "Parallel", why: "The simplest fiber device." },
            { q: "Two fibers wound around each other like a rope.", a: "Twisted", why: "Gel sits between the wound fibers." },
            { q: "A core electrode, an electrolyte sheath and an outer electrode.", a: "Coaxial", why: "Like a coaxial cable." },
            { q: "Resembles a coaxial cable in cross-section.", a: "Coaxial", why: "Concentric layers." },
            { q: "Stays together under bending because the fibers support each other.", a: "Twisted", why: "Winding holds the fibers in contact." }
        ],
        5,
        "supercap-fiberlayout-done",
        "You can tell the fiber layouts apart",
        "Parallel, twisted, coaxial: you know all three.",
        "Parallel: side by side. Twisted: like rope. Coaxial: core, sheath, outer. Hit Reset to try again."
    );


    SIMS["supercap-fiberR"] = function (root) {

        const defaults = { n: 1, len: 100 };
        const state = { n: 1, len: 100 };

        root.innerHTML =
            head("Try it: one long fiber or many short ones?") +
            canvasFor(root, 680, 300, "A total length of fiber cut into several short cells connected in parallel. Fewer, longer fibers have far more resistance than many short ones.") +
            '<div class="fd-stat-row">' + stat("Each cell's length", "cl") + stat("Total resistance", "r") + stat("Maximum power (relative)", "p") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Total fiber length used", key: "len", min: 10, max: 100, step: 10, value: 100 }) +
            slider({ label: "Cells in parallel (same total length)", key: "n", min: 1, max: 10, step: 1, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">R = ρL ÷ A. Cutting the same fiber into n cells wired in parallel makes each cell n times shorter and puts n of them side by side: the total resistance falls by n².</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function R() { return (state.len / 100) / (state.n * state.n) * 500; }

        function update() {

            const r = R();

            setVal(root, "len", state.len + " cm");
            setVal(root, "n", state.n);
            out(root, "cl", (state.len / state.n).toFixed(0) + " cm");
            out(root, "r", r >= 10 ? r.toFixed(0) + " Ω" : r.toFixed(1) + " Ω");
            out(root, "p", (500 / r).toFixed(1) + "×");
            out(root, "verdict", state.n === 1 ? "One long fiber: the current has a long way to run" : "Short cells in parallel: a much shorter electron path");

            if (state.n >= 8 && state.len >= 80) {
                F.reward("supercap-fiberR", 10, "You beat the length penalty with parallel cells");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const n = state.n;
            const rowH = Math.min(36, 230 / n);
            const total = 560 * state.len / 100;
            const each = total / n;
            const y0 = 150 - (n * rowH) / 2;

            // busbars
            ctx.fillStyle = GREY + ".7)";
            ctx.fillRect(40, y0 - 10, 8, n * rowH + 20);
            ctx.fillRect(40 + 600, y0 - 10, 8, n * rowH + 20);

            for (let i = 0; i < n; i++) {

                const y = y0 + i * rowH + rowH / 2;
                const x = 48 + (600 - each) / 2;

                ctx.fillStyle = TEAL + ".7)";
                ctx.fillRect(x, y - rowH / 4, each, rowH / 2);

                // current dots
                for (let k = 0; k < Math.max(2, Math.floor(each / 60)); k++) {

                    const u = ((t * 0.5 + k / Math.max(2, Math.floor(each / 60))) % 1);

                    dot(ctx, x + u * each, y, 3, GOLD + ".95)");
                }

                ctx.strokeStyle = GREY + ".5)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(48, y); ctx.lineTo(x, y);
                ctx.moveTo(x + each, y); ctx.lineTo(648, y);
                ctx.stroke();
            }

            txt(ctx, "same total fiber, cut into " + n + " cell" + (n > 1 ? "s" : ""), 340, 24, 14, TEXT + ".8)");
            txt(ctx, "electrons run the length of each fiber", 340, 286, 12, TEXT + ".6)");
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 17: SHAPE-SHIFTING
    ====================================== */

    SIMS["supercap-serpentine"] = function (root) {

        const defaults = { strain: 0 };
        const state = { strain: 0 };
        let auto = false;
        let dir = 1;
        let broke = false;

        root.innerHTML =
            head("Try it: stretch a wire, straight or wavy") +
            canvasFor(root, 680, 300, "Two conductors being stretched. The straight one is pulled taut and cracks after a small strain. The wavy serpentine one simply unfolds and its conductor barely strains.") +
            '<div class="fd-stat-row">' + stat("Stretch applied", "app") + stat("Strain in the straight wire", "st") + stat("Strain in the serpentine", "sn") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-auto>▶ Pull and release</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Stretch", key: "strain", min: 0, max: 60, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">A stiff conductor tolerates only a few percent strain (illustrative: 3 %). A serpentine shape stretches by straightening its bends, so the metal itself hardly stretches.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const X0 = 80;
        const LS = 380; // path length of the serpentine, px
        const REST = 280; // relaxed end-to-end distance

        function amplitude(span) {

            // find the amplitude for a sine path of length LS across `span`
            if (span >= LS) { return 0; }

            let lo = 0;
            let hi = 200;

            for (let i = 0; i < 30; i++) {

                const mid = (lo + hi) / 2;
                let len = 0;
                let px = 0;
                let py = 0;

                for (let k = 1; k <= 120; k++) {

                    const x = span * k / 120;
                    const y = mid * Math.sin(2 * Math.PI * 4 * k / 120);

                    len += Math.hypot(x - px, y - py);
                    px = x;
                    py = y;
                }

                if (len < LS) { lo = mid; } else { hi = mid; }
            }

            return (lo + hi) / 2;
        }

        function update() {

            setVal(root, "strain", state.strain + " %");

            const strained = state.strain / 100;
            const wireStrain = strained;
            const span = REST * (1 + strained);
            const serp = Math.max(0, span / LS - 1) * 100;

            out(root, "app", state.strain + " %");
            out(root, "st", wireStrain * 100 >= 3 ? "cracked (over 3 %)" : (wireStrain * 100).toFixed(1) + " %");
            out(root, "sn", serp.toFixed(1) + " % of the metal");

            if (wireStrain * 100 >= 3) { broke = true; }

            out(root, "verdict", wireStrain * 100 >= 3 ? "The straight wire has cracked: the circuit is open" : "Both are fine so far");

            if (state.strain >= 50 && serp < 5) {
                F.reward("supercap-serpentine", 10, "You stretched a serpentine by 50% without cracking it");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const strained = state.strain / 100;
            const span = REST * (1 + strained);
            const cracked = strained * 100 >= 3;

            // straight wire
            txt(ctx, "straight conductor", 340, 38, 14, TEXT + ".8)");

            const sx0 = X0;
            const sx1 = X0 + span;

            ctx.strokeStyle = cracked ? ROSE + ".95)" : TEAL + ".95)";
            ctx.lineWidth = 6;
            ctx.beginPath();

            if (cracked) {

                ctx.moveTo(sx0, 70); ctx.lineTo((sx0 + sx1) / 2 - 8, 70);
                ctx.moveTo((sx0 + sx1) / 2 + 8, 70); ctx.lineTo(sx1, 70);

            } else {

                ctx.moveTo(sx0, 70); ctx.lineTo(sx1, 70);
            }

            ctx.stroke();

            if (cracked) {

                txt(ctx, "✖ cracked", (sx0 + sx1) / 2, 100, 14, ROSE + "1)", "center", true);
            }

            // serpentine
            txt(ctx, "serpentine conductor", 340, 160, 14, TEXT + ".8)");

            const amp = amplitude(span);

            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 6;
            ctx.lineJoin = "round";
            ctx.beginPath();

            for (let k = 0; k <= 120; k++) {

                const x = X0 + span * k / 120;
                const y = 225 + amp * Math.sin(2 * Math.PI * 4 * k / 120);

                if (k === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }

            ctx.stroke();

            // anchors and arrows
            [70, 225].forEach(function (y) {

                ctx.fillStyle = GREY + ".9)";
                ctx.fillRect(X0 - 14, y - 14, 14, 28);
                ctx.fillRect(X0 + span, y - 14, 14, 28);
            });

            ctx.strokeStyle = GOLD + ".9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(X0 + span + 28, 148); ctx.lineTo(X0 + span + 60, 148);
            ctx.stroke();
            txt(ctx, "pull →", X0 + span + 44, 136, 12, GOLD + "1)");
        }

        animate(root, function (dt) {

            if (auto) {

                state.strain += dir * dt * 22;

                if (state.strain >= 60) { state.strain = 60; dir = -1; }
                if (state.strain <= 0) { state.strain = 0; dir = 1; }

                root.querySelector('input[data-key="strain"]').value = state.strain;

                update();
            }

            draw();
        });

        root.querySelector("[data-auto]").addEventListener("click", function () {

            auto = !auto;
            this.textContent = auto ? "⏸ Stop" : "▶ Pull and release";
        });

        wire(root, state, defaults, function () {

            auto = false;
            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-shapeshift"] = quiz(
        "Game: which shape-shifting design?",
        ["Stretchable or origami", "Printed", "Transparent", "Structural", "Implantable"],
        [
            { q: "Wavy, horseshoe-shaped connections that unfold when pulled.", a: "Stretchable or origami", why: "The bends unfold so the metal barely strains." },
            { q: "Electrodes laid down by screen or inkjet printing, even roll to roll.", a: "Printed", why: "What you can print decides what you can shape." },
            { q: "Ultrathin films or sparse meshes that let light through.", a: "Transparent", why: "At the cost of less stored charge." },
            { q: "A carbon-fiber panel that carries load and stores energy.", a: "Structural", why: "The battery is the body." },
            { q: "Soft, thin devices that conform to tissue, even dissolving afterward.", a: "Implantable", why: "The shape is set by the organ." },
            { q: "Fold and cut patterns that let a sheet expand or collapse.", a: "Stretchable or origami", why: "Kirigami and origami give stretch from folds." }
        ],
        5,
        "supercap-shapeshift-done",
        "You know the shape-shifting designs",
        "Stretchable, printed, transparent, structural, implantable: you can name them all.",
        "The host sets the shape for structural and implantable devices. Hit Reset to try again."
    );


    /* ======================================
       UNIT 18: PAIRING AND BALANCE
    ====================================== */

    SIMS["supercap-pairing"] = function (root) {

        const defaults = { kind: "sym" };
        const state = { kind: "sym" };
        const seen = {};

        root.innerHTML =
            head("Try it: same electrodes or different ones?") +
            art("0 0 340 200", "Two vertical bars showing the voltage range each electrode uses, side by side for a symmetric pair and stacked wider for an asymmetric pair, with the resulting cell voltage and relative energy.") +
            '<div class="fd-stat-row">' + stat("Cell voltage", "v") + stat("Energy (same capacitance)", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Pair", "kind", [["sym", "Carbon ‖ carbon (symmetric)"], ["asym", "Oxide ‖ carbon (asymmetric)"]]) +
            '<p class="fd-sim-formula">Illustrative aqueous numbers. Each electrode works in its own stable range, so a different partner can add voltage; energy grows as V².</p>';

        const svg = root.querySelector("svg");

        function update() {

            const sym = state.kind === "sym";
            const neg = sym ? 0.5 : 0.9;
            const pos = sym ? 0.5 : 0.9;
            const V = neg + pos;
            const axisTop = 24;
            const ph = 130 / 2; // pixels per volt (axis spans 2 V)

            seen[state.kind] = true;

            let s = label(14, 14, "Voltage each electrode swings", 8, "start", "var(--muted)");

            // axis: 0 at y=100
            s += '<line x1="40" y1="100" x2="300" y2="100" style="stroke:rgba(170,179,207,.45);stroke-dasharray:3 3"/>';
            s += label(34, 103, "rest", 7, "end", "var(--muted)");

            s += rect(80, 100 - pos * ph, 60, pos * ph, sym ? "rgba(84,224,199,.7)" : "rgba(255,214,102,.75)", "rgba(245,247,255,.7)");
            s += label(110, 94 - pos * ph, "positive: " + (sym ? "carbon" : "oxide"), 7.5, "middle", "var(--text)");
            s += label(110, 100 - pos * ph / 2 + 3, "+" + pos.toFixed(1) + " V", 9, "middle", "#04201b");

            s += rect(200, 100, 60, neg * ph, "rgba(84,224,199,.7)", "rgba(245,247,255,.7)");
            s += label(230, 112 + neg * ph, "negative: carbon", 7.5, "middle", "var(--text)");
            s += label(230, 100 + neg * ph / 2 + 3, "−" + neg.toFixed(1) + " V", 9, "middle", "#04201b");

            s += label(170, 196, "Cell voltage = " + V.toFixed(1) + " V", 9, "middle", "var(--accent)");
            s += axisTop ? "" : "";

            svg.innerHTML = s;

            out(root, "v", V.toFixed(1) + " V");
            out(root, "e", (V * V).toFixed(1) + "× (vs. 1 V)");
            out(root, "verdict", sym ? "Both electrodes are the same, so the window is capped" : "Different partners cover different ranges: a wider cell window");

            if (seen.sym && seen.asym) {
                F.reward("supercap-pairing", 10, "You compared symmetric and asymmetric pairs");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["supercap-balance"] = function (root) {

        const defaults = { m: 1.5 };
        const state = { m: 1.5 };
        const CP = 200; // oxide, F/g
        const DP = 0.8;
        const CN = 100; // carbon, F/g
        const DN = 1.0;
        const MN = 1;
        let ok = false;

        root.innerHTML =
            head("Try it: balance the two electrodes") +
            art("0 0 340 190", "Two tanks showing how much charge each electrode can hold. The cell can only use as much as the smaller tank, so any extra capacity in the larger one is wasted.") +
            '<div class="fd-stat-row">' + stat("Charge the cell can use", "q") + stat("Wasted capacity", "w") + stat("Cell capacitance", "c") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-bal>⚖️ Balance it for me</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Mass of the oxide (positive) electrode", key: "m", min: 0.2, max: 3, step: 0.05, value: 1.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">m₊C₊ΔV₊ = m₋C₋ΔV₋. Oxide: 200 F/g over 0.8 V; carbon fixed at 1 g: 100 F/g over 1.0 V (illustrative). Cell capacitance: 1/C = 1/C₊ + 1/C₋.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const qp = state.m * CP * DP;
            const qn = MN * CN * DN;
            const q = Math.min(qp, qn);
            const waste = 1 - q / Math.max(qp, qn);
            const cp = state.m * CP;
            const cn = MN * CN;
            const cell = 1 / (1 / cp + 1 / cn);

            setVal(root, "m", state.m.toFixed(2) + " g");
            out(root, "q", q.toFixed(0) + " C");
            out(root, "w", Math.round(waste * 100) + " %");
            out(root, "c", cell.toFixed(0) + " F");
            out(root, "verdict", waste < 0.04 ? "Balanced: both electrodes fill together" : qp > qn ? "The oxide has spare room: extra mass is wasted" : "The carbon has spare room: the oxide runs out first");

            const sc = 120 / Math.max(qp, qn, 100);

            let s = "";

            [[qp, "oxide (+)", "rgba(255,214,102,.8)", 70], [qn, "carbon (−)", "rgba(84,224,199,.8)", 200]].forEach(function (b) {

                const hh = b[0] * sc;
                const used = q * sc;

                s += rect(b[3], 160 - 120, 60, 120, "rgba(170,179,207,.12)", "rgba(170,179,207,.35)");
                s += rect(b[3], 160 - hh, 60, hh, b[2].replace(".8)", ".3)"), b[2]);
                s += rect(b[3], 160 - used, 60, used, b[2]);
                s += label(b[3] + 30, 176, b[1], 8, "middle", "var(--text)");
                s += label(b[3] + 30, 156 - hh - 3, Math.round(b[0]) + " C", 8, "middle", "var(--muted)");
            });

            s += label(170, 14, "bright = charge actually used, faint = capacity", 7, "middle", "var(--muted)");

            svg.innerHTML = s;

            if (waste < 0.04 && !ok) {

                ok = true;
                F.reward("supercap-balance", 10, "You balanced the two electrodes");
            }
        }

        wire(root, state, defaults, update);

        root.querySelector("[data-bal]").addEventListener("click", function () {

            state.m = Math.round((MN * CN * DN) / (CP * DP) * 20) / 20;
            root.querySelector('input[data-key="m"]').value = state.m;
            update();
        });

        update();
    };


    SIMS["supercap-matchshape"] = quiz(
        "Game: match the shape to the job",
        ["Coin cell", "Wound cylinder or big prismatic", "Pouch", "In-plane micro-device", "Fiber or textile", "Stretchable or printed film"],
        [
            { q: "Memory backup in a gadget.", a: "Coin cell", why: "A small stacked-disc cell." },
            { q: "Burst power for a bus or a crane.", a: "Wound cylinder or big prismatic", why: "Large, rugged cells in modules." },
            { q: "A thin pack in a tablet or drone.", a: "Pouch", why: "Flat and light." },
            { q: "On-chip power for a sensor node.", a: "In-plane micro-device", why: "Patterned on the chip surface." },
            { q: "Smart clothing.", a: "Fiber or textile", why: "Woven or knitted into fabric." },
            { q: "A skin patch or foldable display.", a: "Stretchable or printed film", why: "It has to bend and stretch." }
        ],
        5,
        "supercap-matchshape-done",
        "You can match shape to job",
        "There is no best geometry, only the best match to the job.",
        "Think about where the device lives. Hit Reset to try again."
    );


    /* ======================================
       UNIT 19: WHAT THE ELECTROLYTE DOES
    ====================================== */

    SIMS["supercap-ejobs"] = quiz(
        "Game: the electrolyte's three jobs",
        ["Ion source", "Ion highway", "Electron blocker"],
        [
            { q: "Supplies the ions that build the double layer.", a: "Ion source", why: "No ions, no stored charge." },
            { q: "Carries ions between the electrodes and deep into pores.", a: "Ion highway", why: "Good ionic conduction keeps resistance low." },
            { q: "Refuses to pass electrons so charge cannot short-circuit through the cell.", a: "Electron blocker", why: "Zero electronic conduction is part of the spec." },
            { q: "High ionic conductivity is mostly this job.", a: "Ion highway", why: "Ions have to move easily." },
            { q: "Without this job, the cell would simply short out.", a: "Electron blocker", why: "Electrons must go around through the external circuit." },
            { q: "A dissolved salt splitting into cations and anions.", a: "Ion source", why: "That is where the ions come from." }
        ],
        5,
        "supercap-ejobs-done",
        "You know the three jobs",
        "Source, highway, blocker: that is the electrolyte.",
        "Remember: it provides ions, moves ions, and blocks electrons. Hit Reset to try again."
    );


    SIMS["supercap-ewish"] = priority({
        title: "Try it: what matters most for your electrolyte?",
        aria: "Bars showing how well aqueous, organic, ionic liquid and gel or solid electrolytes fit the priorities you set.",
        key: "supercap-ewish",
        props: [
            { k: "win", n: "Wide voltage window" },
            { k: "cond", n: "Ionic conductivity" },
            { k: "temp", n: "Temperature range" },
            { k: "safe", n: "Safety" },
            { k: "cost", n: "Low cost" }
        ],
        fam: [
            { n: "Aqueous", c: BLUE, r: { win: 1, cond: 5, temp: 2, safe: 5, cost: 5 } },
            { n: "Organic", c: GOLD, r: { win: 4, cond: 3, temp: 4, safe: 2, cost: 3 } },
            { n: "Ionic liquid", c: ROSE, r: { win: 5, cond: 1, temp: 3, safe: 4, cost: 1 } },
            { n: "Gel / solid", c: TEAL, r: { win: 2, cond: 2, temp: 2, safe: 5, cost: 3 } }
        ],
        foot: "Ratings are rough and relative (1 to 5). No electrolyte wins every line, which is why several families exist."
    });


    SIMS["supercap-solvation"] = function (root) {

        const defaults = { kind: "salt" };
        const state = { kind: "salt" };
        const seen = {};

        root.innerHTML =
            head("Try it: an ion in a solvent vs. an ionic liquid") +
            canvasFor(root, 680, 320, "A cation in a solvent surrounded by a shell of solvent molecules that makes it act bigger, next to an ionic liquid where the ions are packed together with no solvent.") +
            '<div class="fd-stat-row">' + stat("Acts as big as", "size") + stat("Speed through the liquid", "speed") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrolyte", "kind", [["salt", "Salt + solvent"], ["il", "Ionic liquid (no solvent)"]]) +
            '<p class="fd-sim-formula">In a solution, each ion arrives with a solvation shell of solvent molecules that changes how big it acts and how fast it moves.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(8);
        const jit = [];

        for (let i = 0; i < 40; i++) { jit.push([rand() * 6.28, 0.5 + rand()]); }

        let t = 0;

        function update() {

            const salt = state.kind === "salt";

            seen[state.kind] = true;

            out(root, "size", salt ? "ion + shell (bigger)" : "the bare ion");
            out(root, "speed", salt ? "slowed by the shell" : "slowed by thick, packed liquid");
            out(root, "verdict", salt ? "Salt + solvent: each ion drags a shell of solvent" : "Ionic liquid: no solvent, ions at very high concentration");

            if (seen.salt && seen.il) {
                F.reward("supercap-solvation", 10, "You compared solvated ions and ionic liquids");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const salt = state.kind === "salt";

            if (salt) {

                // a few ions with shells
                [[170, 130, 1], [400, 190, -1], [540, 110, 1], [290, 240, -1]].forEach(function (ion, k) {

                    const x = ion[0] + Math.sin(t * 1.3 + k) * 8;
                    const y = ion[1] + Math.cos(t * 1.1 + k * 2) * 8;

                    ctx.strokeStyle = TEXT + ".35)";
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.arc(x, y, 46, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    for (let i = 0; i < 8; i++) {

                        const a = i / 8 * 6.28 + t * 0.8;

                        dot(ctx, x + 38 * Math.cos(a), y + 38 * Math.sin(a), 6, BLUE + ".85)");
                    }

                    dot(ctx, x, y, 15, (ion[2] > 0 ? ROSE : GOLD) + ".95)");
                    txt(ctx, ion[2] > 0 ? "+" : "−", x, y + 5, 16, "rgba(6,10,24,.95)", "center", true);
                });

                txt(ctx, "● solvent molecules  ┄ solvation shell", 340, 296, 13, TEXT + ".75)");

            } else {

                for (let r = 0; r < 6; r++) {

                    for (let c = 0; c < 12; c++) {

                        const x = 70 + c * 50 + Math.sin(t * jit[(r * 12 + c) % 40][1] + jit[(r * 12 + c) % 40][0]) * 3;
                        const y = 60 + r * 40 + Math.cos(t * jit[(r * 12 + c) % 40][1] + jit[(r * 12 + c) % 40][0]) * 3;
                        const pos = (r + c) % 2 === 0;

                        dot(ctx, x, y, 14, (pos ? ROSE : GOLD) + ".92)");
                        txt(ctx, pos ? "+" : "−", x, y + 4, 14, "rgba(6,10,24,.95)", "center", true);
                    }
                }

                txt(ctx, "just ions, packed shoulder to shoulder", 340, 306, 13, TEXT + ".75)");
            }
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-pmax"] = function (root) {

        const defaults = { v: 2.7, esr: 1 };
        const state = { v: 2.7, esr: 1 };
        const base = (2.7 * 2.7) / 4;

        root.innerHTML =
            head("Try it: P = V² ÷ (4 × ESR)") +
            art("0 0 340 170", "A bar showing the maximum power of a cell, with a second bar showing the same cell if the voltage window were cut to one volt.") +
            '<div class="fd-stat-row">' + stat("Maximum power", "p") + stat("vs. the starting cell", "rel") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Cell voltage (set by the electrolyte window)", key: "v", min: 0.8, max: 4, step: 0.1, value: 2.7 }) +
            slider({ label: "ESR (partly the electrolyte's conductivity)", key: "esr", min: 0.1, max: 5, step: 0.1, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">The electrolyte steers power twice: its window sets V, and its conductivity is a big part of the ESR.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const p = state.v * state.v / (4 * state.esr);
            const p1 = 1 / (4 * state.esr);
            const mx = 16 / (4 * 0.1);

            setVal(root, "v", state.v.toFixed(1) + " V");
            setVal(root, "esr", state.esr.toFixed(1) + " Ω");
            out(root, "p", p.toFixed(1) + " W");
            out(root, "rel", (p / base).toFixed(2) + "×");
            out(root, "verdict", p / base > 1.5 ? "A wider window or lower resistance: much more power" : p / base < 0.7 ? "Less power: narrower window or higher resistance" : "About the same as the starting cell");

            const w1 = 250 * Math.sqrt(p / mx);
            const w2 = 250 * Math.sqrt(p1 / mx);

            svg.innerHTML =
                label(14, 20, "Power at " + state.v.toFixed(1) + " V", 8, "start", "var(--text)") +
                rect(14, 26, 250, 18, "rgba(170,179,207,.18)") +
                rect(14, 26, Math.max(2, w1), 18, "rgba(84,224,199,.85)") +
                label(14, 74, "Power if the window were only 1 V", 8, "start", "var(--muted)") +
                rect(14, 80, 250, 18, "rgba(170,179,207,.18)") +
                rect(14, 80, Math.max(2, w2), 18, "rgba(255,214,102,.8)") +
                label(14, 130, "bars use a square-root scale so small ones stay visible", 6.5, "start", "var(--muted)");

            if (p / base >= 3) {
                F.reward("supercap-pmax", 10, "You tripled the maximum power");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 20: THE VOLTAGE WINDOW
    ====================================== */

    SIMS["supercap-window"] = function (root) {

        const defaults = { el: 1.2, lim: 1.0 };
        const state = { el: 1.2, lim: 1.0 };
        let safe = false;
        let burnt = false;

        root.innerHTML =
            head("Try it: charge past the edge of the window") +
            canvasFor(root, 680, 340, "A cyclic voltammogram of an electrolyte. Inside its stable window the current is a flat box; beyond the window it shoots up as the electrolyte breaks down, and bubbles appear.") +
            '<div class="fd-stat-row">' + stat("Charge into storage", "store") + stat("Lost to breakdown", "lost") + stat("Window", "win") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrolyte", "el", [["1.2", "Aqueous (≈1.2 V)"], ["2.7", "Organic (≈2.7 V)"], ["3.5", "Ionic liquid (≈3.5 V)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Charge up to", key: "lim", min: 0.5, max: 4, step: 0.1, value: 1.0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Past a limit, charge goes into destroying the electrolyte instead of storing energy. That is why cells are rated with margin below the limit. (Window values are illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(41);

        let phase = 0;
        let bubbles = [];

        const L = 70;
        const R = 640;
        const T = 20;
        const B = 270;

        const X = function (V) { return L + V / 4 * (R - L); };

        function cur(V, up) {

            const base = 1;
            const over = Math.max(0, V - state.el);
            const i = base + 14 * (Math.exp(over / 0.09) - 1);

            return (up ? 1 : -1) * Math.min(i, 24);
        }

        const Y = function (i) { return (T + B) / 2 - i / 26 * ((B - T) / 2); };

        function update() {

            setVal(root, "lim", state.lim.toFixed(1) + " V");

            let store = 0;
            let lost = 0;

            for (let V = 0; V <= state.lim + 1e-9; V += 0.02) {

                const i = Math.abs(cur(V, true));

                store += Math.min(i, 1);
                lost += Math.max(0, i - 1);
            }

            const total = store + lost || 1;

            out(root, "store", Math.round(store / total * 100) + " %");
            out(root, "lost", Math.round(lost / total * 100) + " %");
            out(root, "win", state.el.toFixed(1) + " V");

            const over = state.lim - state.el;

            out(root, "verdict", over <= -0.3 ? "Safe, with margin: all the charge goes into storage" :
                over <= 0.02 ? "Right at the edge: little margin" :
                    "Past the limit: the electrolyte is breaking down, with gas and heat");

            if (over <= -0.2 && state.lim >= state.el - 0.4) { safe = true; }
            if (over > 0.3) { burnt = true; }

            if (safe && burnt) {
                F.reward("supercap-window", 10, "You found both the safe zone and the breakdown edge");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            // allowed region
            ctx.fillStyle = TEAL + ".08)";
            ctx.fillRect(X(0), T, X(state.el) - X(0), B - T);
            ctx.fillStyle = ROSE + ".08)";
            ctx.fillRect(X(state.el), T, X(4) - X(state.el), B - T);

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            ctx.strokeStyle = GREY + ".25)";
            ctx.beginPath();
            ctx.moveTo(L, Y(0)); ctx.lineTo(R, Y(0));
            ctx.stroke();

            for (let V = 0; V <= 4; V++) {
                txt(ctx, V + " V", X(V), B + 20, 12, TEXT + ".7)");
            }

            txt(ctx, "voltage →", (L + R) / 2, B + 42, 13, TEXT + ".85)");
            M.ylab(ctx, "current (mA)", (T + B) / 2);
            [-20, 0, 20].forEach(function (v) { txt(ctx, v, L - 20, Y(v) + 4, 12, TEXT + ".7)"); });
            txt(ctx, "stable window", (X(0) + X(state.el)) / 2, T + 16, 13, TEAL + "1)", "center", true);
            txt(ctx, "breakdown", (X(state.el) + X(4)) / 2, T + 16, 13, ROSE + "1)", "center", true);

            // the trace up to the limit and back
            ctx.strokeStyle = GOLD + ".95)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            let first = true;

            for (let V = 0; V <= state.lim + 1e-9; V += 0.02) {

                const x = X(V);
                const y = Y(cur(V, true));

                if (first) { ctx.moveTo(x, y); first = false; } else { ctx.lineTo(x, y); }
            }

            for (let V = state.lim; V >= 0; V -= 0.02) {
                ctx.lineTo(X(V), Y(cur(V, false)));
            }

            ctx.stroke();

            // moving dot
            const u = phase % 2;
            const up = u < 1;
            const V = (up ? u : 2 - u) * state.lim;

            dot(ctx, X(V), Y(cur(V, up)), 7, "rgba(255,255,255,1)");

            // bubbles when past the limit
            if (V > state.el) {

                for (let i = 0; i < 2; i++) {
                    bubbles.push({ x: X(V) - 20 + rand() * 40, y: B - 4, v: 25 + rand() * 40, r: 2 + rand() * 3 });
                }
            }

            bubbles.forEach(function (b) {

                ctx.strokeStyle = TEXT + ".8)";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.stroke();
            });

            if (V > state.el) { txt(ctx, "gas!", X(V), Y(cur(V, up)) - 16, 14, ROSE + "1)", "center", true); }
        }

        animate(root, function (dt) {

            phase += dt * 0.35;

            bubbles.forEach(function (b) { b.y -= b.v * dt; });
            bubbles = bubbles.filter(function (b) { return b.y > T + 20; });

            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-pastlimit"] = quiz(
        "Game: what goes wrong past the limit?",
        ["Gas", "Resistance", "Leakage", "Safety"],
        [
            { q: "A sealed cell swells.", a: "Gas", why: "Gas forms and can swell a sealed cell." },
            { q: "Breakdown products make capacity fade.", a: "Resistance", why: "They raise the cell's resistance." },
            { q: "Self-discharge speeds up.", a: "Leakage", why: "Side reactions raise leakage current." },
            { q: "Heat and pressure build up in the worst cases.", a: "Safety", why: "That is why a margin is kept." },
            { q: "Charge goes into destroying the electrolyte instead of storing energy.", a: "Leakage", why: "Side reactions waste charge." },
            { q: "Why are cells rated below the limit?", a: "Safety", why: "Margin buys lifetime and safety." }
        ],
        5,
        "supercap-pastlimit-done",
        "You know what goes wrong past the limit",
        "Gas, resistance, leakage, safety: all reasons to keep a margin.",
        "Past the limit, charge goes into destroying the electrolyte. Hit Reset to try again."
    );


    /* ======================================
       UNIT 21: AQUEOUS ELECTROLYTES
    ====================================== */

    SIMS["supercap-aqueous"] = quiz(
        "Game: which water-based electrolyte?",
        ["Acidic", "Alkaline", "Neutral"],
        [
            { q: "H₂SO₄ solution, very conductive and common with carbon.", a: "Acidic", why: "Sulfuric acid is the classic." },
            { q: "KOH solution, suited to many oxide electrodes.", a: "Alkaline", why: "Potassium hydroxide works well with oxides." },
            { q: "Na₂SO₄ or KCl: milder, safer and with a wider window.", a: "Neutral", why: "Neutral salts are gentler on materials." },
            { q: "The strong version attacks many metal current collectors.", a: "Acidic", why: "Strong acids are corrosive." },
            { q: "Can reach roughly 1.6 to 2 V on carbon.", a: "Neutral", why: "Gas evolution is slow on carbon in neutral salts." },
            { q: "Often paired with metal oxide electrodes.", a: "Alkaline", why: "A natural match for many oxides." }
        ],
        5,
        "supercap-aqueous-done",
        "You can tell the aqueous electrolytes apart",
        "Acidic, alkaline, neutral: you can match each to its use.",
        "Acid for carbon, alkaline for oxides, neutral for a wider window. Hit Reset to try again."
    );


    SIMS["supercap-watersplit"] = function (root) {

        const defaults = { kind: 1.23, v: 0.8 };
        const state = { kind: 1.23, v: 0.8 };
        const seen = {};

        root.innerHTML =
            head("Try it: when does water split?") +
            canvasFor(root, 680, 320, "A beaker of electrolyte with two electrodes. When the cell voltage goes above the threshold, bubbles of hydrogen and oxygen form at the electrodes instead of charge being stored.") +
            '<div class="fd-stat-row">' + stat("Voltage", "v") + stat("Threshold", "th") + stat("Energy stored vs. a 1 V cell", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrolyte", "kind", [["1.23", "Plain water (1.23 V)"], ["1.8", "Neutral salt on carbon (≈1.8 V)"], ["2.8", "Water-in-salt (≈2.8 V)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Cell voltage", key: "v", min: 0, max: 3, step: 0.05, value: 0.8 }) +
            "</div>" +
            '<p class="fd-sim-formula">2 H₂O → 2 H₂ + O₂. A 2.7 V organic cell holds about (2.7 ÷ 1.0)² ≈ 7 times the energy of a 1 V cell with the same capacitance.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(17);

        let bubbles = [];

        function update() {

            const th = state.kind;

            setVal(root, "v", state.v.toFixed(2) + " V");
            seen[th] = true;
            out(root, "v", state.v.toFixed(2) + " V");
            out(root, "th", th.toFixed(2) + " V");
            out(root, "e", (Math.min(state.v, th) * Math.min(state.v, th)).toFixed(1) + "×");
            out(root, "verdict", state.v <= th ? "Stable: all the charge is stored" : "Past the threshold: water splits into hydrogen and oxygen");

            if (Object.keys(seen).length >= 3) {
                F.reward("supercap-watersplit", 10, "You compared the three water-based electrolytes");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            ctx.fillStyle = BLUE + ".16)";
            ctx.fillRect(130, 120, 420, 170);
            ctx.strokeStyle = TEXT + ".6)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(130, 110); ctx.lineTo(130, 290); ctx.lineTo(550, 290); ctx.lineTo(550, 110);
            ctx.stroke();

            ctx.fillStyle = GREY + ".85)";
            ctx.fillRect(210, 70, 26, 190);
            ctx.fillRect(444, 70, 26, 190);
            txt(ctx, "−", 223, 60, 20, BLUE + "1)", "center", true);
            txt(ctx, "+", 457, 60, 20, ROSE + "1)", "center", true);

            // wires and battery
            ctx.strokeStyle = GOLD + ".85)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(223, 70); ctx.lineTo(223, 26); ctx.lineTo(310, 26);
            ctx.moveTo(370, 26); ctx.lineTo(457, 26); ctx.lineTo(457, 70);
            ctx.stroke();
            ctx.fillStyle = "rgba(11,16,32,1)";
            ctx.fillRect(310, 10, 60, 32);
            ctx.strokeStyle = TEXT + ".8)";
            ctx.strokeRect(310, 10, 60, 32);
            txt(ctx, state.v.toFixed(1) + " V", 340, 33, 15, TEXT + ".95)", "center", true);

            // bubbles
            bubbles.forEach(function (b) {

                ctx.strokeStyle = (b.h ? BLUE : ROSE) + ".9)";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.stroke();
            });

            if (state.v > state.kind) {

                txt(ctx, "H₂", 223, 280, 15, BLUE + "1)", "center", true);
                txt(ctx, "O₂", 457, 280, 15, ROSE + "1)", "center", true);
            }

            // ions bunching at the surface when stable
            const lvl = Math.min(state.v, state.kind) / 3;

            for (let i = 0; i < Math.round(lvl * 14); i++) {

                dot(ctx, 242 + (i % 2) * 8, 110 + i * 11, 4, ROSE + ".9)");
                dot(ctx, 438 - (i % 2) * 8, 110 + i * 11, 4, GOLD + ".9)");
            }
        }

        animate(root, function (dt) {

            const over = state.v - state.kind;

            if (over > 0) {

                const n = Math.ceil(over * 10 * dt * 6);

                for (let i = 0; i < n; i++) {

                    const h = rand() < 0.5;

                    bubbles.push({ x: (h ? 223 : 457) + (rand() - 0.5) * 80, y: 250, v: 30 + rand() * 50, r: 2 + rand() * 4, h: h });
                }
            }

            bubbles.forEach(function (b) { b.y -= b.v * dt; });
            bubbles = bubbles.filter(function (b) { return b.y > 118; });

            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 22: ORGANIC AND IONIC LIQUIDS
    ====================================== */

    SIMS["supercap-liquidquiz"] = quiz(
        "Game: which liquid family?",
        ["Aqueous", "Organic", "Ionic liquid"],
        [
            { q: "Highest conductivity, cheapest, non-flammable.", a: "Aqueous", why: "Water is hard to beat for speed and cost." },
            { q: "The electrolyte in most commercial carbon supercapacitors, around 2.7 V.", a: "Organic", why: "TEABF₄ in acetonitrile or propylene carbonate." },
            { q: "A salt that is liquid on its own, with a 3 to 4 V window.", a: "Ionic liquid", why: "Bulky ions that do not pack into a crystal." },
            { q: "Needs dry assembly because trace moisture causes gas and aging.", a: "Organic", why: "Moisture is the enemy of organic cells." },
            { q: "Viscous, so power drops as it cools.", a: "Ionic liquid", why: "It thickens sharply in the cold." },
            { q: "Window only about 1 V, rising to about 3 V as water-in-salt.", a: "Aqueous", why: "Water splitting caps the voltage." },
            { q: "Flammable and sometimes toxic solvents.", a: "Organic", why: "Safety is its main catch." },
            { q: "Negligible vapor pressure and non-flammable, but costly.", a: "Ionic liquid", why: "Safe and stable, but expensive." }
        ],
        6,
        "supercap-liquidquiz-done",
        "You can tell the liquid families apart",
        "Aqueous, organic and ionic liquids: you can place each.",
        "Aqueous: fast and cheap. Organic: 2.7 V. Ionic liquid: widest window, slowest. Hit Reset to try again."
    );


    SIMS["supercap-liquidwish"] = priority({
        title: "Try it: pick the best liquid for the job",
        aria: "Bars showing how well aqueous, organic and ionic liquid electrolytes fit the priorities you set.",
        key: "supercap-liquidwish",
        props: [
            { k: "volt", n: "High voltage" },
            { k: "cond", n: "Conductivity" },
            { k: "safe", n: "Non-flammable" },
            { k: "cost", n: "Low cost" },
            { k: "cold", n: "Works in the cold" }
        ],
        fam: [
            { n: "Aqueous", c: BLUE, r: { volt: 1, cond: 5, safe: 5, cost: 5, cold: 2 } },
            { n: "Organic", c: GOLD, r: { volt: 4, cond: 3, safe: 1, cost: 3, cold: 4 } },
            { n: "Ionic liquid", c: ROSE, r: { volt: 5, cond: 1, safe: 5, cost: 1, cold: 1 } }
        ],
        foot: "Ratings are rough and relative (1 to 5). Families can be mixed: an ionic liquid diluted in acetonitrile cuts viscosity while keeping a wide window."
    });


    /* ======================================
       UNIT 23: GELS AND SOLIDS
    ====================================== */

    SIMS["supercap-gel"] = function (root) {

        const defaults = { kind: "liquid", bend: 0 };
        const state = { kind: "liquid", bend: 0 };
        const seen = {};

        root.innerHTML =
            head("Try it: bend the device") +
            canvasFor(root, 680, 320, "A flexible device being bent. With a liquid electrolyte it leaks drops once bent far enough; with a gel electrolyte it stays inside the device.") +
            '<div class="fd-stat-row">' + stat("Leak?", "leak") + stat("Ion speed vs. a liquid", "speed") + stat("Needs a separate separator?", "sep") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrolyte", "kind", [["liquid", "💧 Free liquid"], ["gel", "🧈 Gel"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Bend angle", key: "bend", min: 0, max: 90, step: 5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">A gel holds its liquid inside a polymer network: ions still move, but a bit slower. It also doubles as the separator.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(31);

        let drops = [];

        function update() {

            const liquid = state.kind === "liquid";
            const leaking = liquid && state.bend > 40;

            setVal(root, "bend", state.bend + "°");
            seen[state.kind] = true;
            out(root, "leak", leaking ? "yes, dripping" : "no");
            out(root, "speed", liquid ? "100 %" : "about 60 % (illustrative)");
            out(root, "sep", liquid ? "yes" : "no: the gel is the separator");
            out(root, "verdict", leaking ? "The liquid is escaping from the bent cell" : liquid ? "Fine while flat, but a bend can open a leak" : "Leak-free and bendable: some speed traded away");

            if (seen.liquid && seen.gel && state.bend >= 60 && !liquid) {
                F.reward("supercap-gel", 10, "You bent a gel device without leaking");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const k = state.bend / 90;
            const liquid = state.kind === "liquid";

            // curved strip drawn as an arc of thickness
            const cx = 340;
            const R0 = 420 - k * 280;
            const len = 440;
            const thick = 56;
            const ang = len / R0;
            const startA = -Math.PI / 2 - ang / 2;

            function strip(r1, r2, fill) {

                ctx.fillStyle = fill;
                ctx.beginPath();
                ctx.arc(cx, 40 + R0 + 60, r1, startA, startA + ang);
                ctx.arc(cx, 40 + R0 + 60, r2, startA + ang, startA, true);
                ctx.closePath();
                ctx.fill();
            }

            // outer = electrodes, inner = electrolyte
            strip(R0 + thick / 2, R0 + thick / 2 - 14, TEAL + ".7)");
            strip(R0 - thick / 2 + 14, R0 - thick / 2, GOLD + ".7)");
            strip(R0 + thick / 2 - 14, R0 - thick / 2 + 14, liquid ? BLUE + ".28)" : "rgba(180,210,150,.5)");

            const ex = cx + (R0 + 0) * Math.cos(startA);
            const ey = 40 + R0 + 60 + (R0 + 0) * Math.sin(startA);
            const fx = cx + R0 * Math.cos(startA + ang);
            const fy = 40 + R0 + 60 + R0 * Math.sin(startA + ang);

            if (!liquid) {

                for (let i = 0; i < 30; i++) {

                    const a = startA + ang * (i / 29);
                    const r = R0 + Math.sin(i * 3.1) * 8;

                    dot(ctx, cx + r * Math.cos(a), 40 + R0 + 60 + r * Math.sin(a), 2, "rgba(255,255,255,.35)");
                }
            }

            txt(ctx, liquid ? "liquid electrolyte (blue)" : "gel electrolyte (polymer network)", 340, 24, 14, TEXT + ".8)");

            drops.forEach(function (d) { dot(ctx, d.x, d.y, 4.5, BLUE + ".95)"); });

            // keep references for spawn points
            draw.ends = [[ex, ey], [fx, fy]];
        }

        animate(root, function (dt) {

            const leaking = state.kind === "liquid" && state.bend > 40;

            if (leaking && draw.ends) {

                const n = Math.ceil((state.bend - 40) / 12 * dt * 8);

                for (let i = 0; i < n; i++) {

                    const e = draw.ends[rand() < 0.5 ? 0 : 1];

                    drops.push({ x: e[0] + (rand() - 0.5) * 18, y: e[1] + 10, v: 30 });
                }
            }

            drops.forEach(function (d) { d.v += 380 * dt; d.y += d.v * dt; });
            drops = drops.filter(function (d) { return d.y < 330; });

            draw();
        });

        wire(root, state, defaults, function () {

            drops = [];
            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-gelmatch"] = quiz(
        "Game: match the electrolyte to the device",
        ["Liquid + separator", "Gel", "Stretchable hydrogel or ionogel", "Neutral, body-like saline"],
        [
            { q: "A coin cell or a wound can, sealed tight.", a: "Liquid + separator", why: "A rigid case can hold a free liquid." },
            { q: "A fiber or textile device that must flex without dripping.", a: "Gel", why: "The gel sits between the fibers." },
            { q: "A stretchable film.", a: "Stretchable hydrogel or ionogel", why: "It has to stretch with the film." },
            { q: "An implant or a skin patch.", a: "Neutral, body-like saline", why: "Neutral, biocompatible electrolytes are the safe choice." },
            { q: "An in-plane micro device.", a: "Gel", why: "A gel (or a thin liquid layer under a cover) fills the gap." },
            { q: "A pouch with foil sealing that keeps moisture out.", a: "Liquid + separator", why: "Liquid or gel, with a good seal." }
        ],
        5,
        "supercap-gelmatch-done",
        "You can match electrolyte to device shape",
        "Liquids for rigid cells, gels for flexible ones, saline for the body.",
        "Rigid cells use free liquids; flexible devices need gels; implants need neutral saline. Hit Reset to try again."
    );


    /* ======================================
       UNIT 24: CHOOSING AN ELECTROLYTE
    ====================================== */

    SIMS["supercap-ionpore"] = function (root) {

        const defaults = { w: 2.0 };
        const state = { w: 2.0 };
        const BARE = 0.36; // radius nm (illustrative)
        const SHELL = 0.66;

        root.innerHTML =
            head("Try it: an ion and its shell in a pore") +
            canvasFor(root, 680, 340, "A single ion with a dashed ring of water molecules around it, entering a slit pore. In a wide pore the shell stays on; in a very narrow pore the ion sheds part of its shell; if the pore is narrower than the bare ion it cannot enter.") +
            '<div class="fd-stat-row">' + stat("Ion fits?", "fit") + stat("Shell", "shell") + stat("Capacitance per area (illustrative)", "cap") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Pore width", key: "w", min: 0.4, max: 3, step: 0.05, value: 2.0 }) +
            "</div>" +
            '<p class="fd-sim-formula">In very small pores (under about a nanometer) ions can shed part of their shell and pack tightly, and capacitance per area can rise. Choose the pores for the ions, or the ions for the pores.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const SC = 70;
        let t = 0;
        let seenNarrow = false;
        let seenWide = false;

        function info() {

            const w = state.w;

            if (w < 2 * BARE) { return { fit: "no", shell: "n/a", cap: 0, keep: 0 }; }
            if (w < 2 * SHELL) {

                const keep = (w - 2 * BARE) / (2 * (SHELL - BARE));

                return { fit: "yes, squeezing", shell: "partly stripped", cap: 1 + 0.6 * (1 - keep), keep: keep };
            }

            return { fit: "yes, easily", shell: "intact", cap: 1, keep: 1 };
        }

        function update() {

            const i = info();

            setVal(root, "w", state.w.toFixed(2) + " nm");
            out(root, "fit", i.fit);
            out(root, "shell", i.shell);
            out(root, "cap", i.cap === 0 ? "none: blocked" : i.cap.toFixed(1) + "×");
            out(root, "verdict", i.fit === "no" ? "Too narrow: the ion cannot enter, so this surface is wasted" :
                i.keep < 1 ? "The ion sheds part of its shell to squeeze in, and packs tightly" : "A wide pore: the ion keeps its full shell");

            if (i.keep > 0 && i.keep < 1) { seenNarrow = true; }
            if (i.keep === 1) { seenWide = true; }

            if (seenNarrow && seenWide) {
                F.reward("supercap-ionpore", 10, "You saw an ion shed its shell in a narrow pore");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const i = info();
            const wpx = state.w * SC;
            const cx = 340;
            const topY = 150;

            // pore walls
            ctx.fillStyle = GREY + ".6)";
            ctx.fillRect(40, topY, cx - wpx / 2 - 40, 170);
            ctx.fillRect(cx + wpx / 2, topY, 680 - cx - wpx / 2 - 40, 170);
            ctx.fillStyle = BLUE + ".08)";
            ctx.fillRect(40, 20, 600, topY - 20);
            txt(ctx, "electrolyte", 110, 44, 13, TEXT + ".7)");
            txt(ctx, "carbon wall", 100, topY + 24, 13, "rgba(6,10,24,.9)", "center", true);

            // the ion goes down into the pore and back, bobbing
            const u = 0.5 + 0.5 * Math.sin(t * 0.8);
            let y = 70 + u * 150;

            if (i.fit === "no") { y = Math.min(y, topY - BARE * SC - 4); }

            const bare = BARE * SC;
            const shellR = SHELL * SC;

            // the shell size shrinks as the ion squeezes
            const sr = i.fit === "no" ? shellR : bare + (shellR - bare) * i.keep;

            if (i.keep > 0) {

                ctx.strokeStyle = TEXT + ".4)";
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(cx, y, sr, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                const n = Math.round(8 * i.keep);

                for (let k = 0; k < n; k++) {

                    const a = k / 8 * 6.28 + t;

                    dot(ctx, cx + sr * Math.cos(a), y + sr * Math.sin(a), 5, BLUE + ".85)");
                }

            } else {

                ctx.strokeStyle = TEXT + ".3)";
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(cx, y, shellR, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            dot(ctx, cx, y, bare, ROSE + ".95)");
            txt(ctx, "+", cx, y + 5, 15, "rgba(6,10,24,.95)", "center", true);

            // stripped water molecules float away
            if (i.keep > 0 && i.keep < 1) {

                for (let k = 0; k < 3; k++) {
                    dot(ctx, cx + 80 + k * 30, topY - 40 - (k % 2) * 20 + Math.sin(t * 2 + k) * 4, 5, BLUE + ".7)");
                }

                txt(ctx, "shed water", cx + 110, topY - 70, 12, BLUE + "1)");
            }

            txt(ctx, "bare ion: " + (BARE * 2).toFixed(2) + " nm   with shell: " + (SHELL * 2).toFixed(2) + " nm   (illustrative)", 340, 326, 12, TEXT + ".65)");
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-temp"] = function (root) {

        const defaults = { T: 25 };
        const state = { T: 25 };
        const hit = {};

        const fam = [
            { n: "Aqueous", lo: 0, hi: 80, c: "rgba(120,180,255,", lowWhy: "freezes", highWhy: "dries out" },
            { n: "Organic", lo: -40, hi: 65, c: "rgba(255,214,102,", lowWhy: "too cold", highWhy: "volatile and flammable" },
            { n: "Ionic liquid", lo: -10, hi: 150, c: "rgba(255,105,120,", lowWhy: "too viscous", highWhy: "" },
            { n: "Hydrogel", lo: 0, hi: 60, c: "rgba(84,224,199,", lowWhy: "freezes", highWhy: "dries out" }
        ];

        root.innerHTML =
            head("Try it: where will the device live?") +
            art("0 0 340 210", "Four horizontal bars showing the temperature range where aqueous, organic, ionic liquid and hydrogel electrolytes work, with a vertical line that follows the temperature slider.") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Operating temperature", key: "T", min: -60, max: 160, step: 5, value: 25 }) +
            "</div>" +
            '<p class="fd-sim-formula">Illustrative ranges: match the electrolyte to where the device will actually live. Hydrogels and aqueous cells must also keep their water in.</p>';

        const svg = root.querySelector("svg");

        const X = function (T) { return 70 + (T + 60) / 220 * 250; };

        function update() {

            setVal(root, "T", state.T + " °C");

            let s = label(14, 14, "Where each electrolyte works", 8, "start", "var(--muted)");

            [-60, -20, 20, 60, 100, 140].forEach(function (T) {

                s += '<line x1="' + X(T) + '" y1="24" x2="' + X(T) + '" y2="184" style="stroke:rgba(170,179,207,.18);stroke-width:.6"/>';
                s += label(X(T), 196, T + "°", 7, "middle", "var(--muted)");
            });

            const ok = [];

            fam.forEach(function (f, i) {

                const y = 34 + i * 38;
                const works = state.T >= f.lo && state.T <= f.hi;

                s += label(14, y + 14, f.n, 8, "start", "var(--text)");
                s += rect(X(f.lo), y, X(f.hi) - X(f.lo), 22, f.c + (works ? ".8)" : ".3)"), f.c + "1)");

                if (works) { ok.push(f.n); }
            });

            s += '<line x1="' + X(state.T) + '" y1="24" x2="' + X(state.T) + '" y2="184" style="stroke:#fff;stroke-width:1.6"/>';

            svg.innerHTML = s;

            out(root, "verdict", ok.length === 0 ? "None of these works at " + state.T + " °C" : ok.length === 4 ? "Every family works here" : "Works at " + state.T + " °C: " + ok.join(", "));

            if (state.T <= -30 && ok.indexOf("Organic") >= 0) { hit.cold = true; }
            if (state.T >= 100 && ok.indexOf("Ionic liquid") >= 0) { hit.hot = true; }

            if (hit.cold && hit.hot) {
                F.reward("supercap-temp", 10, "You found the cold and hot champions");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["supercap-choose"] = quiz(
        "Game: pick the electrolyte for the job",
        ["Neutral or acidic aqueous", "Organic (about 2.7 V)", "Ionic liquid", "Gel electrolyte", "Solid electrolyte"],
        [
            { q: "Cheap, safe, moderate energy.", a: "Neutral or acidic aqueous", why: "Water is cheap and non-flammable." },
            { q: "The highest energy in a big cell.", a: "Organic (about 2.7 V)", why: "Its wide window means more energy." },
            { q: "Extreme heat or strict safety needs.", a: "Ionic liquid", why: "Stable when hot and non-flammable." },
            { q: "A flexible, thin or wearable device.", a: "Gel electrolyte", why: "No puddle to leak when it bends." },
            { q: "The thinnest, safest, slowest option.", a: "Solid electrolyte", why: "Ions hop along polymer chains or through ceramics." },
            { q: "A cheap lab test cell with carbon electrodes.", a: "Neutral or acidic aqueous", why: "Water-based cells are the lab workhorse." }
        ],
        5,
        "supercap-choose-done",
        "You can choose an electrolyte",
        "There is no best electrolyte, only the one that fits the job.",
        "Match window, speed and packaging to the device. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="supercap-"]').forEach(F.mount);

})();
