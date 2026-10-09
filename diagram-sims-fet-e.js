/* ========================================
   BIOFETS & MOSFETS: INTERACTIVE SIMULATORS, PART 5

   Unit 2: drift versus diffusion, mobility, inversion-layer mobility.

   Registers on window.FabInteract; loaded by diagram-sims-fet.js.
   Teaching models: numbers and shapes are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers || !F.fetHelpers) {
        return;
    }

    const M = F.memsHelpers;
    const H = F.fetHelpers;
    const clamp = M.clamp;
    const mulberry = M.mulberry;
    const seg = M.seg;
    const wire = M.wire;
    const head = M.head;
    const setVal = M.setVal;
    const out = M.out;
    const stat = M.stat;
    const animate = M.animate;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const TEAL = H.TEAL;
    const GOLD = H.GOLD;
    const ROSE = H.ROSE;
    const BLUE = H.BLUE;
    const GREY = H.GREY;
    const TEXT = H.TEXT;
    const canvasFor = H.canvasFor;
    const clear = H.clear;
    const txt = H.txt;
    const dot = H.dot;

    function arrow(ctx, x1, y1, x2, y2, col, w) {

        const a = Math.atan2(y2 - y1, x2 - x1);

        ctx.strokeStyle = col;
        ctx.fillStyle = col;
        ctx.lineWidth = w || 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 10 * Math.cos(a - 0.45), y2 - 10 * Math.sin(a - 0.45));
        ctx.lineTo(x2 - 10 * Math.cos(a + 0.45), y2 - 10 * Math.sin(a + 0.45));
        ctx.closePath();
        ctx.fill();
    }


    /* ======================================
       DRIFT VERSUS DIFFUSION
    ====================================== */

    SIMS["fet-driftdiff"] = function (root) {

        const defaults = { mode: "drift", e: 5, d: 5 };
        const state = { mode: "drift", e: 5, d: 5 };
        const N = 90;
        const X0 = 60;
        const X1 = 620;
        const T = 40;
        const B = 210;
        const rand = mulberry(Date.now() % 99999);
        const seen = {};
        let parts = [];
        let flow = 0;
        let t = 0;
        let hist = [];

        function gauss() {

            const u = Math.max(1e-9, rand());
            const v = rand();

            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        }

        root.innerHTML =
            head("Try it: two ways charge moves") +
            canvasFor(680, 340, "A box of electrons. In drift mode an electric field pushes all the electrons the same way. In diffusion mode the electrons start crowded on the left and spread out by random motion, from high concentration to low. In the combined mode the field pushes them back against the spreading.") +
            '<div class="fd-stat-row">' + stat("Field strength", "e") + stat("Drift speed (v = μE)", "v") + stat("Net flow of electrons", "net") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("What moves the charge?", "mode", [["drift", "Drift (an electric field)"], ["diff", "Diffusion (a concentration gradient)"], ["both", "Both at once"]]) +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-again>↻ Release the electrons again</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Electric field", key: "e", min: 0, max: 10, step: 0.5, value: 5 }) +
            slider({ label: "Random thermal motion (sets how fast it spreads)", key: "d", min: 1, max: 10, step: 0.5, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Drift: charges pushed along by an electric field, with speed v = μE, where μ is the mobility. Diffusion: charges spreading from high concentration to low, with no field at all. Both can happen together, and they can cancel: a field that pushes against the spreading holds the gradient in place.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function spawn() {

            parts = [];

            for (let i = 0; i < N; i++) {

                const crowded = state.mode !== "drift";

                parts.push({
                    x: crowded ? X0 + rand() * 90 : X0 + rand() * (X1 - X0),
                    y: T + 8 + rand() * (B - T - 16),
                    tr: []
                });
            }

            flow = 0;
            hist = [];
        }

        function vd() { return state.mode === "diff" ? 0 : state.e * 38; }

        function dpx() { return state.mode === "drift" ? 700 : state.d * 1300; }

        function update() {

            seen[state.mode] = true;
            setVal(root, "e", state.e.toFixed(1));
            setVal(root, "d", state.d.toFixed(1));

            const eff = state.mode === "diff" ? 0 : state.e;

            out(root, "e", state.mode === "diff" ? "none" : (eff * 100).toFixed(0) + " V/cm");
            out(root, "v", state.mode === "diff" || eff === 0 ? "0" : H.sci(1400 * eff * 100) + " cm/s");
            out(root, "net", Math.abs(flow) < 25 ? "about zero" : flow > 0 ? "to the right" : "to the left");

            out(root, "verdict", state.mode === "drift" ? "Drift: the field drags every electron the same way, against the field direction" :
                state.mode === "diff" ? "Diffusion: no field, yet the crowd spreads from high concentration to low" :
                    Math.abs(flow) < 25 ? "Drift and diffusion cancel: the gradient stays in place" : flow > 0 ? "Diffusion wins: the crowd still spreads to the right" : "Drift wins: the field has pushed the electrons back");

            if (seen.drift && seen.diff && seen.both) {
                F.reward("fet-driftdiff", 10, "You compared drift, diffusion and both");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            ctx.fillStyle = BLUE + ".07)";
            ctx.fillRect(X0, T, X1 - X0, B - T);
            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(X0, T, X1 - X0, B - T);

            // field arrows
            if (state.mode !== "diff" && state.e > 0) {

                for (let i = 0; i < 3; i++) {
                    arrow(ctx, 160 + i * 180, 22, 160 + i * 180 + 20 + state.e * 7, 22, GOLD + ".95)", 3);
                }

                txt(ctx, "electric field", 340, 14, 12, GOLD + "1)");
            }

            parts.forEach(function (p) {

                // trails
                if (p.tr.length > 1) {

                    ctx.strokeStyle = TEAL + ".28)";
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.moveTo(p.tr[0][0], p.tr[0][1]);

                    for (let i = 1; i < p.tr.length; i++) {

                        if (Math.abs(p.tr[i][0] - p.tr[i - 1][0]) > 100) { ctx.moveTo(p.tr[i][0], p.tr[i][1]); } else { ctx.lineTo(p.tr[i][0], p.tr[i][1]); }
                    }

                    ctx.stroke();
                }

                dot(ctx, p.x, p.y, 4.2, TEAL + ".98)");
            });

            // density histogram
            const bins = 28;
            const cnt = new Array(bins).fill(0);

            parts.forEach(function (p) { cnt[clamp(Math.floor((p.x - X0) / (X1 - X0) * bins), 0, bins - 1)]++; });

            const bw = (X1 - X0) / bins;

            cnt.forEach(function (c, i) {

                const h = Math.min(100, c * 9);

                ctx.fillStyle = GOLD + ".75)";
                ctx.fillRect(X0 + i * bw + 1, 322 - h, bw - 2, h);
            });

            txt(ctx, "concentration along the box", 340, 336, 12, TEXT + ".7)");
            txt(ctx, "● electrons (negative charge)", 150, 232, 12, TEAL + "1)", "center", true);
        }

        animate(root, function (dt) {

            t += dt;

            const v = vd();
            const sd = Math.sqrt(2 * dpx() * dt);
            let sumDx = 0;

            parts.forEach(function (p) {

                const dx = -v * dt + gauss() * sd; // electrons drift opposite to the field
                const dy = gauss() * sd * 0.6;

                p.x += dx;
                p.y += dy;
                sumDx += dx;

                if (state.mode === "drift") {

                    if (p.x < X0) { p.x += X1 - X0; p.tr = []; }
                    if (p.x > X1) { p.x -= X1 - X0; p.tr = []; }

                } else {

                    if (p.x < X0) { p.x = X0 + (X0 - p.x); }
                    if (p.x > X1) { p.x = X1 - (p.x - X1); }
                }

                if (p.y < T + 5) { p.y = T + 5 + (T + 5 - p.y); }
                if (p.y > B - 5) { p.y = B - 5 - (p.y - (B - 5)); }

                p.tr.push([p.x, p.y]);

                if (p.tr.length > 14) { p.tr.shift(); }
            });

            // the net motion of the crowd: how fast its centre of mass is moving
            if (state.mode === "drift") {

                flow = -vd();

            } else {

                const mean = parts.reduce(function (a, p) { return a + p.x; }, 0) / Math.max(1, parts.length);

                hist.push([t, mean]);

                while (hist.length > 1 && t - hist[0][0] > 0.8) { hist.shift(); }

                flow = hist.length > 1 ? (mean - hist[0][1]) / Math.max(0.1, t - hist[0][0]) : 0;
            }

            sumDx;

            if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) { update(); }

            draw();
        });

        root.querySelector("[data-again]").addEventListener("click", function () { spawn(); });

        wire(root, state, defaults, function () {

            spawn();
            update();
        });

        spawn();
        update();
        draw();
    };


    /* ======================================
       MOBILITY
    ====================================== */

    SIMS["fet-mobility"] = function (root) {

        const defaults = { where: "bulk", e: 20 };
        const state = { where: "bulk", e: 20 };
        const MU = { bulk: { e: 1400, h: 450 }, surf: { e: 400, h: 150 } };
        const seen = {};
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: race electrons against holes") +
            canvasFor(680, 300, "Two runners cross a one-micrometer channel under the same electric field: an electron and a hole. The electron has the higher mobility, so it moves faster and finishes first. Switching to the inversion layer at the surface slows both of them.") +
            '<div class="fd-stat-row">' + stat("Electron mobility", "me") + stat("Hole mobility", "mh") + stat("Electron crossing time", "te") + stat("Hole crossing time", "th") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Where are the carriers?", "where", [["bulk", "Deep in the silicon (bulk)"], ["surf", "In the inversion layer (surface)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Electric field along the channel", key: "e", min: 1, max: 100, step: 1, value: 20 }) +
            "</div>" +
            '<p class="fd-sim-formula">Mobility μ is how easily a carrier moves: v = μE. About 1400 cm²/V·s for bulk electrons and 450 for holes. At the surface the mobility is lower, often a few hundred (here 400 and 150, illustrative). Electrons move faster than holes, which is why NMOS (n-channel MOSFET) transistors beat PMOS (p-channel MOSFET) in speed. The animation is slowed down enormously: a real crossing takes picoseconds.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function times() {

            const m = MU[state.where];
            const E = state.e * 1000; // V/cm
            const L = 1e-4; // 1 µm in cm

            return { te: L / (m.e * E) * 1e12, th: L / (m.h * E) * 1e12, m: m };
        }

        function update() {

            const k = times();

            seen[state.where] = true;
            setVal(root, "e", (state.e * 1000).toLocaleString() + " V/cm");
            out(root, "me", k.m.e + " cm²/V·s");
            out(root, "mh", k.m.h + " cm²/V·s");
            out(root, "te", k.te.toFixed(1) + " ps");
            out(root, "th", k.th.toFixed(1) + " ps");
            out(root, "verdict", "Electrons are " + (k.m.e / k.m.h).toFixed(1) + "× faster than holes here" + (state.where === "surf" ? ", but both are slower than in the bulk" : ""));

            if (!hit && seen.bulk && seen.surf) {

                hit = true;
                F.reward("fet-mobility", 10, "You raced carriers in the bulk and at the surface");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const k = times();
            const x0 = 80;
            const x1 = 600;
            const lapE = 3; // seconds for the electron to cross in the animation
            const lapH = lapE * k.m.e / k.m.h;
            const total = lapH + 1.2;
            const tt = t % total;

            [["electron", TEAL, 90, k.m.e, "−", lapE], ["hole", ROSE, 190, k.m.h, "+", lapH]].forEach(function (r) {

                const u = Math.min(1, tt / r[5]);

                ctx.fillStyle = GREY + ".18)";
                ctx.fillRect(x0, r[2] - 22, x1 - x0, 44);
                txt(ctx, r[0] + "  (μ = " + r[3] + ")", x0, r[2] - 30, 13, r[1] + "1)", "start", true);

                ctx.strokeStyle = TEXT + ".6)";
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(x1, r[2] - 26); ctx.lineTo(x1, r[2] + 26);
                ctx.stroke();
                ctx.setLineDash([]);

                // trail
                ctx.fillStyle = r[1] + ".3)";
                ctx.fillRect(x0, r[2] - 6, (x1 - x0) * u, 12);

                dot(ctx, x0 + (x1 - x0) * u, r[2], 14, r[1] + ".98)");
                txt(ctx, r[4], x0 + (x1 - x0) * u, r[2] + 6, 18, "rgba(6,10,24,.95)", "center", true);

                if (u >= 1) { txt(ctx, "finished", x1 - 30, r[2] + 4, 12, TEXT + ".85)", "center", true); }
            });

            txt(ctx, "start", x0, 262, 12, TEXT + ".6)");
            txt(ctx, "1 µm channel: finish", x1 - 40, 262, 12, TEXT + ".6)");
            txt(ctx, "the hole is still running when the electron has finished", 340, 286, 12, TEXT + ".6)");
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () {

            t = 0;
            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       INVERSION LAYER MOBILITY
    ====================================== */

    SIMS["fet-surfscatter"] = function (root) {

        const defaults = { where: "bulk", f: 5 };
        const state = { where: "bulk", f: 5 };
        const N = 7;
        const rand = mulberry(31);
        const seen = {};
        let carriers = [];
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: why the surface is slower") +
            canvasFor(680, 330, "A cross-section with the gate oxide at the top and silicon below. Electrons drift to the right. Deep in the silicon they glide with only occasional bumps. In the inversion layer, the gate's field pushes them against the rough oxide interface, where they scatter much more and make less headway.") +
            '<div class="fd-stat-row">' + stat("Effective mobility", "mu") + stat("Compared with the bulk", "rel") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Where are the electrons?", "where", [["bulk", "Deep in the silicon (bulk)"], ["surf", "In the inversion layer"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Gate field pressing carriers against the oxide", key: "f", min: 0, max: 10, step: 0.5, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">In an inversion layer the electrons sit within a few nanometers of the oxide interface, pulled there by the gate. They scatter off the interface roughness and trapped charge, so the mobility is lower than in the bulk: often a few hundred cm²/V·s instead of about 1400. A stronger gate field lowers it further. (Illustrative model.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function mu() { return state.where === "bulk" ? 1400 : 1400 / (1 + 0.35 * (state.f + 1.2)); }

        function top() { return state.where === "bulk" ? 150 : 98; }
        function bot() { return state.where === "bulk" ? 300 : 112; }

        function spawn() {

            carriers = [];

            for (let i = 0; i < N; i++) {

                carriers.push({ x: 60 + rand() * 120, y: top() + rand() * (bot() - top()), tr: [] });
            }
        }

        function update() {

            seen[state.where] = true;
            setVal(root, "f", state.f.toFixed(1));
            out(root, "mu", Math.round(mu()) + " cm²/V·s");
            out(root, "rel", Math.round(mu() / 1400 * 100) + " %");
            out(root, "verdict", state.where === "bulk" ? "Deep in the silicon: electrons glide, with only occasional bumps" : "At the surface: constant scattering off the rough interface slows the electrons");

            if (!hit && seen.bulk && seen.surf && state.f >= 8) {

                hit = true;
                F.reward("fet-surfscatter", 10, "You saw a strong gate field slow the inversion layer");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            // gate, oxide, silicon
            ctx.fillStyle = GOLD + ".85)";
            ctx.fillRect(40, 20, 600, 36);
            txt(ctx, "gate", 340, 44, 14, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = BLUE + ".55)";
            ctx.fillRect(40, 56, 600, 28);
            txt(ctx, "oxide", 340, 75, 12, TEXT + ".85)");

            ctx.fillStyle = GREY + ".4)";
            ctx.fillRect(40, 84, 600, 236);

            // a rough interface
            ctx.strokeStyle = TEXT + ".8)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let x = 40; x <= 640; x += 6) {

                const y = 86 + Math.sin(x * 0.9) * 1.8 + Math.sin(x * 2.3) * 1.2;

                if (x === 40) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }

            ctx.stroke();

            if (state.where === "surf") {

                ctx.fillStyle = TEAL + ".18)";
                ctx.fillRect(40, 86, 600, 34);
                txt(ctx, "inversion layer (a few nm thick, much exaggerated)", 340, 142, 12, TEAL + "1)");
            } else {

                // impurities
                for (let i = 0; i < 26; i++) { dot(ctx, 60 + (i * 47) % 560, 150 + (i * 31) % 150, 2.4, TEXT + ".35)"); }
            }

            carriers.forEach(function (c) {

                if (c.tr.length > 1) {

                    ctx.strokeStyle = TEAL + ".6)";
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.moveTo(c.tr[0][0], c.tr[0][1]);

                    for (let i = 1; i < c.tr.length; i++) { ctx.lineTo(c.tr[i][0], c.tr[i][1]); }

                    ctx.stroke();
                }

                dot(ctx, c.x, c.y, 4.6, TEAL + ".98)");
            });

            arrow(ctx, 70, 312, 70 + mu() / 1400 * 150 + 10, 312, TEAL + ".95)", 3);
            txt(ctx, "average progress to the right", 330, 316, 12, TEXT + ".75)", "start");
        }

        animate(root, function (dt) {

            t += dt;

            const k = mu() / 1400;
            const scatter = state.where === "bulk" ? 1.2 : 3 + state.f * 0.9; // kinks per second weight

            carriers.forEach(function (c) {

                // a steady push to the right, plus random kicks that are bigger when scattering is stronger
                const push = 120 * k;
                const kick = 25 * scatter;

                c.x += push * dt + (rand() - 0.5) * kick * dt * 4;
                c.y += (rand() - 0.5) * kick * dt * 5;

                const lo = top();
                const hi = bot();

                if (c.y < lo) { c.y = lo + (lo - c.y); }
                if (c.y > hi) { c.y = hi - (c.y - hi); }

                c.y = clamp(c.y, lo, hi);

                if (c.x > 630) { c.x = 50; c.tr = []; }

                c.tr.push([c.x, c.y]);

                if (c.tr.length > 22) { c.tr.shift(); }
            });

            draw();
        });

        wire(root, state, defaults, function () {

            spawn();
            update();
        });

        spawn();
        update();
        draw();
    };


    document.querySelectorAll('.fd-sim[data-sim^="fet-"]').forEach(F.mount);

})();
