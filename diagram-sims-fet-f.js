/* ========================================
   TRANSISTORS: INTERACTIVE SIMULATORS, PART 6

   Unit 26: velocity saturation, channel-length modulation, DIBL.
   Unit 27: subthreshold leakage, gate tunneling.
   Unit 28: Moore's law, Dennard scaling.
   Unit 29: the CMOS inverter, restoring logic.
   Unit 30: logic gates, dynamic and static power.

   Registers on window.FabInteract; loaded by diagram-sims-fet.js.
   Chains diagram-sims-fet-g.js, which chains -h.js.
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
    const quiz = M.quiz;
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
    const idrain = H.idrain;


    /* ======================================
       SHARED PLOT HELPER (used by the g and h files too)
    ====================================== */

    function fmt(v) {

        const a = Math.abs(v);

        if (a >= 100) { return v.toFixed(0); }
        if (a >= 10) { return v.toFixed(0); }
        if (a >= 1) { return v.toFixed(1).replace(/\.0$/, ""); }
        if (a === 0) { return "0"; }

        return v.toFixed(2).replace(/0$/, "").replace(/\.0$/, "");
    }

    // o: { box:[x,y,w,h], x:[min,max], y:[min,max], logx, logy, xt:[[v,label]], yt:[[v,label]],
    //      xl, yl, curves:[{pts, col, w, dash}] }  Returns { sx, sy }.
    function plot(ctx, o) {

        const bx = o.box[0];
        const by = o.box[1];
        const bw = o.box[2];
        const bh = o.box[3];
        const fx = function (v) { return o.logx ? Math.log10(Math.max(v, 1e-30)) : v; };
        const fy = function (v) { return o.logy ? Math.log10(Math.max(v, 1e-30)) : v; };
        const x0 = fx(o.x[0]);
        const x1 = fx(o.x[1]);
        const y0 = fy(o.y[0]);
        const y1 = fy(o.y[1]);
        const sx = function (v) { return bx + (fx(v) - x0) / (x1 - x0) * bw; };
        const sy = function (v) { return by + bh - (fy(v) - y0) / (y1 - y0) * bh; };

        ctx.fillStyle = TEXT + ".04)";
        ctx.fillRect(bx, by, bw, bh);

        ctx.lineWidth = 1;
        ctx.strokeStyle = GREY + ".18)";

        (o.xt || []).forEach(function (t) {

            ctx.beginPath(); ctx.moveTo(sx(t[0]), by); ctx.lineTo(sx(t[0]), by + bh); ctx.stroke();
            txt(ctx, t[1], sx(t[0]), by + bh + 14, 11, TEXT + ".7)");
        });

        (o.yt || []).forEach(function (t) {

            ctx.beginPath(); ctx.moveTo(bx, sy(t[0])); ctx.lineTo(bx + bw, sy(t[0])); ctx.stroke();
            txt(ctx, t[1], bx - 6, sy(t[0]) + 4, 11, TEXT + ".7)", "end");
        });

        ctx.strokeStyle = GREY + ".6)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bw, bh);

        if (o.xl) { txt(ctx, o.xl, bx + bw / 2, by + bh + 30, 12, TEXT + ".8)"); }

        if (o.yl) {

            ctx.save();
            ctx.translate(bx - 38, by + bh / 2);
            ctx.rotate(-Math.PI / 2);
            txt(ctx, o.yl, 0, 0, 12, TEXT + ".8)");
            ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(bx, by, bw, bh);
        ctx.clip();

        (o.curves || []).forEach(function (c) {

            ctx.strokeStyle = c.col;
            ctx.lineWidth = c.w || 2.6;
            ctx.setLineDash(c.dash || []);
            ctx.beginPath();

            c.pts.forEach(function (p, i) {

                if (i === 0) { ctx.moveTo(sx(p[0]), sy(p[1])); } else { ctx.lineTo(sx(p[0]), sy(p[1])); }
            });

            ctx.stroke();
            ctx.setLineDash([]);
        });

        ctx.restore();

        return { sx: sx, sy: sy };
    }

    function sample(f, a, b, n) {

        const pts = [];

        for (let i = 0; i <= n; i++) {

            const x = a + (b - a) * i / n;

            pts.push([x, f(x)]);
        }

        return pts;
    }

    function arrowLine(ctx, x1, y1, x2, y2, col, w) {

        const a = Math.atan2(y2 - y1, x2 - x1);

        ctx.strokeStyle = col;
        ctx.fillStyle = col;
        ctx.lineWidth = w || 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 9 * Math.cos(a - 0.45), y2 - 9 * Math.sin(a - 0.45));
        ctx.lineTo(x2 - 9 * Math.cos(a + 0.45), y2 - 9 * Math.sin(a + 0.45));
        ctx.closePath();
        ctx.fill();
    }

    function box(ctx, x, y, w, h, fill, stroke, r) {

        ctx.beginPath();

        if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r || 6); } else { ctx.rect(x, y, w, h); }

        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
    }

    function eng(v, unit) {

        const a = Math.abs(v);

        if (a >= 1) { return v.toFixed(a >= 10 ? 0 : 2) + " " + unit; }
        if (a >= 1e-3) { return (v * 1e3).toFixed(a >= 1e-2 ? 0 : 1) + " m" + unit; }
        if (a >= 1e-6) { return (v * 1e6).toFixed(a >= 1e-5 ? 0 : 1) + " µ" + unit; }
        if (a >= 1e-9) { return (v * 1e9).toFixed(a >= 1e-8 ? 0 : 1) + " n" + unit; }
        if (a >= 1e-12) { return (v * 1e12).toFixed(a >= 1e-11 ? 0 : 1) + " p" + unit; }

        return (v * 1e15).toFixed(1) + " f" + unit;
    }

    // Drain current per width (A/µm) on a log-friendly curve: exponential below threshold,
    // a power law above, merged smoothly. 100 nA/µm flows at V = Vth.
    function idsLog(v, vth, S) {

        const sub = 1e-7 * Math.pow(10, (v - vth) / (S / 1000));
        const cap = 1e-7 + 1.2e-3 * Math.pow(Math.max(v - vth + 0.05, 0), 1.3);

        return 1 / (1 / sub + 1 / cap);
    }

    H.idsLog = idsLog;
    H.plot = plot;
    H.sample = sample;
    H.arrowLine = arrowLine;
    H.box = box;
    H.eng = eng;
    H.fmt = fmt;


    /* ======================================
       UNIT 26: SHORT-CHANNEL EFFECTS
    ====================================== */

    const MU = 250;      // inversion-layer electron mobility, cm²/V·s
    const COX = 2.9e-6;  // F/cm² for an equivalent oxide thickness of about 1.2 nm
    const VSAT = 1e7;    // cm/s

    // Drain current per width, mA/µm, saturation, with or without the velocity limit.
    function isatPerW(vov, Lnm, velocity) {

        if (vov <= 0) { return 0; }

        const L = Lnm * 1e-7;
        const ec = 2 * VSAT / MU;
        const sq = 0.5 * MU * COX / L * vov * vov;
        const amp = velocity ? sq / (1 + vov / (ec * L)) : sq;

        return amp * 0.1; // A/cm to mA/µm
    }

    SIMS["fet-velsat"] = function (root) {

        const defaults = { L: 100 };
        const state = { L: 100 };
        const VTH = 0.3;
        const seen = {};

        root.innerHTML =
            head("Try it: shrink the channel and watch the square law break") +
            canvasFor(680, 330, "A graph of drain current against gate voltage. A grey dashed curve shows the square law for a long channel, a gold dashed curve shows the square law at the chosen length, and a teal curve shows the real current once electrons reach their speed limit. As the channel gets shorter the teal curve falls far below the gold one and straightens into a line.") +
            '<div class="fd-stat-row">' + stat("Average field (V ÷ L)", "field") + stat("Current at 1 V", "ion") + stat("Real ÷ square law", "ratio") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Channel length L", key: "L", min: 30, max: 1000, step: 10, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">Square law: I<sub>D</sub> = ½ μC<sub>ox</sub>(W/L)(V<sub>GS</sub> − V<sub>th</sub>)². With a speed limit, the current is divided by (1 + V<sub>ov</sub>/E<sub>c</sub>L), where E<sub>c</sub> = 2v<sub>sat</sub>/μ ≈ 80 kV/cm. (V<sub>th</sub> = 0.3 V, illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function draw() {

            clear(ctx, 680, 330);

            const sqL = function (v) { return isatPerW(v - VTH, state.L, false); };
            const real = function (v) { return isatPerW(v - VTH, state.L, true); };
            const long = function (v) { return isatPerW(v - VTH, 1000, false); };
            const ymax = Math.max(0.2, sqL(1.0) * 1.08);
            const step = ymax > 3 ? 1 : ymax > 1.2 ? 0.5 : 0.2;
            const yt = [];

            for (let v = 0; v <= ymax; v += step) { yt.push([v, fmt(v)]); }

            plot(ctx, {
                box: [86, 24, 560, 240], x: [0.3, 1.0], y: [0, ymax],
                xt: [[0.3, "0.3"], [0.5, "0.5"], [0.7, "0.7"], [0.9, "0.9"], [1.0, "1.0"]], yt: yt,
                xl: "gate voltage VGS (V)", yl: "ID per width (mA/µm)",
                curves: [
                    { pts: sample(long, 0.3, 1.0, 60), col: GREY + ".8)", dash: [6, 5], w: 2 },
                    { pts: sample(sqL, 0.3, 1.0, 60), col: GOLD + ".95)", dash: [8, 5], w: 2.4 },
                    { pts: sample(real, 0.3, 1.0, 60), col: TEAL + ".98)", w: 3.4 }
                ]
            });

            txt(ctx, "long channel (1 µm)", 100, 44, 12, GREY + "1)", "start", true);
            txt(ctx, "square law at this L", 100, 62, 12, GOLD + "1)", "start", true);
            txt(ctx, "with the speed limit", 100, 80, 12, TEAL + "1)", "start", true);
        }

        function update() {

            setVal(root, "L", state.L + " nm");

            const r = isatPerW(0.7, state.L, true) / isatPerW(0.7, state.L, false);

            seen[state.L < 80 ? "short" : state.L > 500 ? "long" : "mid"] = true;

            out(root, "field", (1 / (state.L * 1e-7) / 1000).toFixed(0) + " kV/cm");
            out(root, "ion", isatPerW(0.7, state.L, true).toFixed(2) + " mA/µm");
            out(root, "ratio", (r * 100).toFixed(0) + "%");
            out(root, "verdict", r > 0.9 ? "Long channel: carriers keep speeding up, so the square law works" :
                r > 0.55 ? "Getting short: the speed limit starts to trim the current" :
                    "Short channel: electrons are at their speed limit and the current climbs only linearly");

            if (seen.short && seen.long) {
                F.reward("fet-velsat", 10, "You saw the square law give way to the speed limit");
            }

            draw();
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-clm"] = function (root) {

        const defaults = { L: 100 };
        const state = { L: 100 };
        const K = 1.2;
        const VTH = 0.3;
        const seen = {};

        root.innerHTML =
            head("Try it: how flat is saturation?") +
            canvasFor(680, 330, "Output curves of drain current against drain voltage for three gate voltages. In the saturation part of each curve the current keeps rising with drain voltage. The slope is steeper for a shorter channel.") +
            '<div class="fd-stat-row">' + stat("λ (slope factor)", "lam") + stat("Output resistance r<sub>o</sub>", "ro") + stat("Intrinsic gain g<sub>m</sub>·r<sub>o</sub>", "gain") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Channel length L", key: "L", min: 40, max: 1000, step: 10, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">Saturation current with channel-length modulation: I<sub>D</sub> = I<sub>sat</sub>(1 + λV<sub>DS</sub>). The factor λ is roughly proportional to 1/L, and the output resistance is r<sub>o</sub> = 1/(λI<sub>D</sub>). (Illustrative: λ ≈ 20 nm ÷ L per volt.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function lam() { return 20 / state.L; }

        function id(vgs, vds) {

            const vov = vgs - VTH;

            if (vov <= 0) { return 0; }

            const sat = 0.5 * K * vov * vov;

            if (vds < vov) { return K * (vov * vds - vds * vds / 2) * (1 + lam() * vds); }

            return sat * (1 + lam() * vds);
        }

        function update() {

            setVal(root, "L", state.L + " nm");

            const l = lam();
            const i = id(1.0, 1.0);
            const ro = 1 / (l * 0.5 * K * 0.49 * (1 + l)) ; // kΩ, with I in mA
            const gm = 2 * (0.5 * K * 0.49) / 0.7;

            seen[state.L < 80 ? "short" : state.L > 500 ? "long" : "mid"] = true;

            out(root, "lam", l.toFixed(2) + " V⁻¹");
            out(root, "ro", ro.toFixed(1) + " kΩ");
            out(root, "gain", (gm * ro).toFixed(0));
            out(root, "verdict", l < 0.05 ? "Long channel: saturation is almost flat, a good current source" :
                l < 0.15 ? "The curves tilt: the drain is starting to push current up" :
                    "Short channel: the current rises steadily with drain voltage, so it is a poor current source");

            if (seen.short && seen.long) {
                F.reward("fet-clm", 10, "You compared a flat and a tilted saturation region");
            }

            i;
            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const curves = [0.6, 0.8, 1.0].map(function (vg, k) {

                return {
                    pts: sample(function (v) { return id(vg, v); }, 0, 1.2, 70),
                    col: [BLUE, GOLD, TEAL][k] + ".98)",
                    w: 3
                };
            });

            plot(ctx, {
                box: [86, 24, 560, 240], x: [0, 1.2], y: [0, 0.3],
                xt: [[0, "0"], [0.3, "0.3"], [0.6, "0.6"], [0.9, "0.9"], [1.2, "1.2"]],
                yt: [[0, "0"], [0.1, "0.1"], [0.2, "0.2"], [0.3, "0.3"]],
                xl: "drain voltage VDS (V)", yl: "ID (mA, per unit width)", curves: curves
            });

            txt(ctx, "VGS = 1.0 V", 640, 40, 12, TEAL + "1)", "end", true);
            txt(ctx, "0.8 V", 640, 110, 12, GOLD + "1)", "end", true);
            txt(ctx, "0.6 V", 640, 182, 12, BLUE + "1)", "end", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-dibl"] = function (root) {

        const defaults = { L: 60 };
        const state = { L: 60 };
        const VDD = 0.8;
        const seen = {};

        root.innerHTML =
            head("Try it: the drain reaches across the channel") +
            canvasFor(680, 340, "A graph of drain current on a log scale against gate voltage. A grey curve is measured at a small drain voltage and a teal curve at the full supply voltage. For a long channel the two curves lie on top of each other. For a short channel the teal curve shifts to the left, which means a lower threshold and more leakage.") +
            '<div class="fd-stat-row">' + stat("V<sub>th</sub> at low V<sub>DS</sub>", "vlin") + stat("V<sub>th</sub> at high V<sub>DS</sub>", "vsat") + stat("DIBL", "dibl") + stat("Off current", "ioff") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Channel length L", key: "L", min: 20, max: 300, step: 5, value: 60 }) +
            "</div>" +
            '<p class="fd-sim-formula">DIBL = (V<sub>th,lin</sub> − V<sub>th,sat</sub>) ÷ (V<sub>DD</sub> − V<sub>DS,lin</sub>), in mV per volt. The same short channel also loses threshold voltage on its own (roll-off) and gets a worse subthreshold swing. (Illustrative numbers.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function vthLin(L) { return 0.40 - 0.15 * Math.exp(-(L - 20) / 35); }
        function dibl(L) { return 300 * Math.exp(-(L - 20) / 30); } // mV/V
        function swing(L) { return 62 + 45 * Math.exp(-(L - 20) / 35); }

        function cur(v, vth, S) { return idsLog(v, vth, S); }

        function update() {

            setVal(root, "L", state.L + " nm");

            const d = dibl(state.L);
            const vl = vthLin(state.L);
            const vs = vl - d / 1000 * (VDD - 0.05);
            const ioff = cur(0, vs, swing(state.L));
            const iref = cur(0, vthLin(300) , 62);

            seen[state.L < 40 ? "short" : state.L > 200 ? "long" : "mid"] = true;

            out(root, "vlin", (vl * 1000).toFixed(0) + " mV");
            out(root, "vsat", (vs * 1000).toFixed(0) + " mV");
            out(root, "dibl", d.toFixed(0) + " mV/V");
            out(root, "ioff", H.eng(ioff, "A/µm"));
            out(root, "verdict", d < 15 ? "Long channel: the gate alone sets the threshold, whatever the drain does" :
                d < 80 ? "The drain starts to help the gate: leakage rises with drain voltage" :
                    "Strong DIBL: the drain voltage pulls the barrier down and the transistor leaks " + Math.round(ioff / iref) + "× more than a long one");

            if (seen.short && seen.long) {
                F.reward("fet-dibl", 10, "You watched the drain lower the threshold");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const S = swing(state.L);
            const vl = vthLin(state.L);
            const vs = vl - dibl(state.L) / 1000 * (VDD - 0.05);

            const g = plot(ctx, {
                box: [86, 20, 560, 250], x: [0, 0.8], y: [1e-12, 1e-3], logy: true,
                xt: [[0, "0"], [0.2, "0.2"], [0.4, "0.4"], [0.6, "0.6"], [0.8, "0.8"]],
                yt: [[1e-12, "1 pA"], [1e-9, "1 nA"], [1e-6, "1 µA"], [1e-3, "1 mA"]],
                xl: "gate voltage VGS (V)", yl: "ID per width (A/µm)",
                curves: [
                    { pts: sample(function (v) { return cur(v, vl, S); }, 0, 0.8, 120), col: GREY + ".95)", w: 3 },
                    { pts: sample(function (v) { return cur(v, vs, S); }, 0, 0.8, 120), col: TEAL + ".98)", w: 3.4 }
                ]
            });

            const y1 = g.sy(1e-7);

            arrowLine(ctx, g.sx(vl), y1 - 18, g.sx(vs), y1 - 18, GOLD + "1)", 2.5);
            txt(ctx, "threshold shift", (g.sx(vl) + g.sx(vs)) / 2, y1 - 26, 12, GOLD + "1)", "center", true);
            txt(ctx, "VDS = 0.05 V", 560, 72, 12, GREY + "1)", "end", true);
            txt(ctx, "VDS = " + VDD.toFixed(1) + " V", 560, 90, 12, TEAL + "1)", "end", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-shortq"] = quiz(
        "Game: which short-channel effect?",
        ["Velocity saturation", "Channel-length modulation", "DIBL", "Threshold roll-off"],
        [
            { q: "Electrons reach about 10⁷ cm/s and stop speeding up, however strong the field.", a: "Velocity saturation", why: "The lattice limits the carrier speed." },
            { q: "Saturation current keeps creeping up as the drain voltage rises.", a: "Channel-length modulation", why: "The pinch-off point moves toward the source." },
            { q: "A higher drain voltage lowers the barrier at the source, so leakage grows.", a: "DIBL", why: "Drain-induced barrier lowering." },
            { q: "The threshold voltage falls as the channel is made shorter.", a: "Threshold roll-off", why: "Source and drain share the charge under the gate." },
            { q: "Current rises linearly with the gate overdrive instead of quadratically.", a: "Velocity saturation", why: "A constant speed times a growing charge is linear." },
            { q: "The output resistance of the transistor falls, and so does its gain.", a: "Channel-length modulation", why: "The output curves tilt." },
            { q: "Two transfer curves, at low and high drain voltage, no longer lie on top of each other.", a: "DIBL", why: "The high-VDS curve has shifted left." }
        ],
        5,
        "fet-shortq-done",
        "You can name the short-channel effects",
        "Speed limit, tilt, drain pull and roll-off: all four come from a channel too short for the gate to rule alone.",
        "Speed limit, tilt, drain pull, roll-off. Hit Reset to try again."
    );


    /* ======================================
       UNIT 27: LEAKAGE
    ====================================== */

    SIMS["fet-leak"] = function (root) {

        const defaults = { vth: 0.35, s: 70, vdd: 0.8 };
        const state = { vth: 0.35, s: 70, vdd: 0.8 };
        const seen = {};

        root.innerHTML =
            head("Try it: the on/off trade") +
            canvasFor(680, 340, "A graph of drain current on a log scale against gate voltage. The current falls by a fixed factor for every drop in gate voltage below the threshold. Marked points show the off current at zero gate voltage and the on current at the supply voltage.") +
            '<div class="fd-stat-row">' + stat("On current", "ion") + stat("Off current", "ioff") + stat("On ÷ off", "ratio") + stat("Chip leakage (10¹⁰ small devices)", "chip") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Threshold voltage V<sub>th</sub>", key: "vth", min: 0.15, max: 0.6, step: 0.01, value: 0.35 }) +
            slider({ label: "Subthreshold swing S (mV per decade)", key: "s", min: 60, max: 110, step: 1, value: 70 }) +
            slider({ label: "Supply voltage V<sub>DD</sub>", key: "vdd", min: 0.5, max: 1.1, step: 0.01, value: 0.8 }) +
            "</div>" +
            '<p class="fd-sim-formula">Below threshold, I<sub>D</sub> falls by a factor of 10 for every S of gate voltage, so I<sub>off</sub> ≈ I<sub>th</sub> × 10<sup>−V<sub>th</sub>/S</sup>. At room temperature S cannot be lower than (kT/q)·ln 10 ≈ 60 mV per decade. (I<sub>th</sub> = 100 nA/µm at V<sub>th</sub>, illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function cur(v) { return idsLog(v, state.vth, state.s); }

        function update() {

            setVal(root, "vth", state.vth.toFixed(2) + " V");
            setVal(root, "s", state.s + " mV/dec");
            setVal(root, "vdd", state.vdd.toFixed(2) + " V");

            const ion = cur(state.vdd);
            const ioff = cur(0);
            const chip = ioff * 1e9; // 10^10 devices x 0.1 µm of width

            seen[state.vth < 0.25 ? "low" : state.vth > 0.45 ? "high" : "mid"] = true;

            out(root, "ion", H.eng(ion, "A/µm"));
            out(root, "ioff", H.eng(ioff, "A/µm"));
            out(root, "ratio", "10" + H.sup(Math.round(Math.log10(Math.max(ion / ioff, 1)))) );
            out(root, "chip", H.eng(chip, "A"));
            out(root, "verdict", chip > 5 ? "Fast but hot: this chip would leak amps while doing nothing" :
                chip > 0.2 ? "Leaky: a noticeable slice of the power budget is wasted at rest" :
                    ion < 1.5e-4 ? "Quiet but slow: very little leaks, yet the on current is weak" : "A balanced design: strong drive, small standby leak");

            if (seen.low && seen.high) {
                F.reward("fet-leak", 10, "You traded speed against leakage");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const g = plot(ctx, {
                box: [86, 20, 560, 250], x: [0, 1.0], y: [1e-12, 1e-3], logy: true,
                xt: [[0, "0"], [0.2, "0.2"], [0.4, "0.4"], [0.6, "0.6"], [0.8, "0.8"], [1.0, "1.0"]],
                yt: [[1e-12, "1 pA"], [1e-9, "1 nA"], [1e-6, "1 µA"], [1e-3, "1 mA"]],
                xl: "gate voltage VGS (V)", yl: "ID per width (A/µm)",
                curves: [{ pts: sample(cur, 0, 1.0, 140), col: TEAL + ".98)", w: 3.4 }]
            });

            const offY = g.sy(cur(0));
            const onY = g.sy(cur(state.vdd));

            dot(ctx, g.sx(0), offY, 7, ROSE + "1)");
            dot(ctx, g.sx(state.vdd), onY, 7, GOLD + "1)");
            txt(ctx, "OFF (VGS = 0)", g.sx(0) + 14, offY - 10, 12, ROSE + "1)", "start", true);
            txt(ctx, "ON (VGS = VDD)", g.sx(state.vdd) - 12, onY + 20, 12, GOLD + "1)", "end", true);

            // the V_th marker
            ctx.strokeStyle = GREY + ".6)";
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(g.sx(state.vth), 20); ctx.lineTo(g.sx(state.vth), 270); ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "Vth", g.sx(state.vth), 34, 12, TEXT + ".85)");
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-tunnel"] = function (root) {

        const defaults = { t: 1.5, v: 1.0 };
        const state = { t: 1.5, v: 1.0 };
        const seen = {};

        root.innerHTML =
            head("Try it: electrons tunnel through a thin oxide") +
            canvasFor(680, 330, "On the left, an energy-band picture: a barrier representing the oxide, with electron waves leaking through it. The thinner the barrier, the more leaks through. On the right, a graph of gate leakage current density on a log scale against oxide thickness. Leakage rises about ten times for every quarter of a nanometer removed.") +
            '<div class="fd-stat-row">' + stat("Gate leakage density", "j") + stat("Leakage of a 0.5 cm² gate area", "chip") + stat("Oxide capacitance", "cox") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "SiO₂ thickness", key: "t", min: 1.0, max: 3.0, step: 0.05, value: 1.5 }) +
            slider({ label: "Gate voltage", key: "v", min: 0.5, max: 1.5, step: 0.05, value: 1.0 }) +
            "</div>" +
            '<p class="fd-sim-formula">The tunneling current falls off exponentially with the barrier width, roughly J ∝ exp(−2κt). Thinning the oxide raises C<sub>ox</sub> = ε<sub>ox</sub>/t (more control) but leaks far more. (Illustrative: J ≈ 1 A/cm² at 1.5 nm, ten times more per 0.22 nm removed.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");
        let t = 0;

        function jd(th, v) { return Math.pow(10, (1.5 - th) / 0.22) * Math.pow(v, 3); }

        function update() {

            setVal(root, "t", state.t.toFixed(2) + " nm");
            setVal(root, "v", state.v.toFixed(2) + " V");

            const j = jd(state.t, state.v);

            seen[state.t < 1.3 ? "thin" : state.t > 2.2 ? "thick" : "mid"] = true;

            out(root, "j", H.sci(j) + " A/cm²");
            out(root, "chip", H.eng(j * 0.5, "A"));
            out(root, "cox", (3.9 * 8.854e-14 / (state.t * 1e-7) * 1e6).toFixed(2) + " µF/cm²");
            out(root, "verdict", j > 5 ? "Far too leaky: the gates alone would drain a battery" :
                j > 0.01 ? "Noticeable gate leakage on top of the subthreshold leakage" : "Thick enough that the gate leakage is negligible");

            if (seen.thin && seen.thick) {
                F.reward("fet-tunnel", 10, "You saw gate leakage explode in thin oxides");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            // band picture
            const bx = 30;
            const by = 40;
            const bw = 270;
            const bh = 220;
            const wallW = 22 + state.t * 36;
            const wx = bx + bw / 2 - wallW / 2;

            ctx.fillStyle = TEAL + ".18)";
            ctx.fillRect(bx, by + 110, bw / 2 - wallW / 2, 100);
            ctx.fillRect(wx + wallW, by + 150, bw / 2 - wallW / 2, 60);
            ctx.fillStyle = BLUE + ".5)";
            ctx.fillRect(wx, by + 20, wallW, 190);
            txt(ctx, "SiO₂", wx + wallW / 2, by + 14, 12, BLUE + "1)", "center", true);
            txt(ctx, "silicon", bx + 60, by + 232, 12, TEXT + ".8)");
            txt(ctx, "gate", bx + bw - 50, by + 232, 12, TEXT + ".8)");

            const pass = Math.min(1, Math.log10(1 + jd(state.t, state.v)) / 3);

            for (let i = 0; i < 12; i++) {

                const ph = (t * 0.45 + i / 12) % 1;
                const y = by + 130 + (i % 4) * 18;
                const x = bx + 6 + ph * (wx - bx - 10);

                if (ph < 0.97) { dot(ctx, x, y, 3.8, "rgba(255,255,255,.95)"); }

                if (i / 12 < pass) {

                    const x2 = wx + wallW + 6 + ((ph * 1.3) % 1) * (bw / 2 - wallW / 2 - 12);

                    dot(ctx, x2, by + 160 + (i % 3) * 14, 3.8, GOLD + ".95)");
                }
            }

            // leakage vs thickness
            const g = plot(ctx, {
                box: [380, 40, 270, 220], x: [1.0, 3.0], y: [1e-8, 1e3], logy: true,
                xt: [[1, "1"], [1.5, "1.5"], [2, "2"], [2.5, "2.5"], [3, "3"]],
                yt: [[1e-6, "10⁻⁶"], [1e-3, "10⁻³"], [1, "1"], [1e3, "10³"]],
                xl: "oxide thickness (nm)", yl: "J (A/cm²)",
                curves: [{ pts: sample(function (th) { return jd(th, state.v); }, 1.0, 3.0, 80), col: ROSE + ".98)", w: 3.2 }]
            });

            dot(ctx, g.sx(state.t), g.sy(Math.min(Math.max(jd(state.t, state.v), 1e-8), 1e3)), 7, GOLD + "1)");
        }

        animate(root, function (dt) { t += dt; draw(); });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    SIMS["fet-leakq"] = quiz(
        "Game: which leak is it?",
        ["Subthreshold", "Gate tunneling", "Junction"],
        [
            { q: "Carriers with enough thermal energy climb over the source barrier, though the gate is off.", a: "Subthreshold", why: "A Boltzmann tail." },
            { q: "Electrons pass through the gate oxide, which is only a few atoms thick.", a: "Gate tunneling", why: "Quantum tunneling through a thin barrier." },
            { q: "Current leaks across the reverse-biased drain-to-body p–n junction.", a: "Junction", why: "A reverse-biased diode is never perfectly open." },
            { q: "It grows by 10× each time the threshold voltage drops by one swing.", a: "Subthreshold", why: "The exponential depends on Vth/S." },
            { q: "It grows by about 10× for every 0.2 nm of oxide removed.", a: "Gate tunneling", why: "Exponential in the barrier thickness." },
            { q: "A high-k gate dielectric is the main cure for this one.", a: "Gate tunneling", why: "A thicker film with the same capacitance." },
            { q: "Cooling the chip reduces this leak by a large factor.", a: "Subthreshold", why: "Fewer carriers have the energy to cross." }
        ],
        5,
        "fet-leakq-done",
        "You can tell the leaks apart",
        "Over the barrier, through the oxide, across the junction: three different roads out of the circuit.",
        "Over the barrier, through the oxide, across the junction. Hit Reset to try again."
    );


    /* ======================================
       UNIT 28: SCALING
    ====================================== */

    SIMS["fet-moore"] = function (root) {

        const defaults = { year: 2000, dbl: 2 };
        const state = { year: 2000, dbl: 2 };
        const seen = {};
        const CHIPS = [
            [1971, 2300, "4004"], [1978, 29000, "8086"], [1985, 275000, "386"], [1993, 3.1e6, "Pentium"],
            [2000, 4.2e7, "Pentium 4"], [2006, 2.91e8, "Core 2"], [2012, 1.4e9, "Core i7"],
            [2017, 1.9e10, "Server GPU"], [2020, 1.18e10, "Phone chip"], [2022, 1.14e11, "Big M-series"]
        ];

        root.innerHTML =
            head("Try it: fifty years of doubling") +
            canvasFor(680, 330, "A graph of the number of transistors on a chip, on a log scale, against the year from 1971 to 2024. The dots are real processors, from the 4004 with about two thousand transistors to modern chips with more than a hundred billion. A straight line shows a steady doubling.") +
            '<div class="fd-stat-row">' + stat("Year", "yr") + stat("Trend line says", "trend") + stat("Doublings since 1971", "dbls") + stat("Nearest real chip", "chip") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Year", key: "year", min: 1971, max: 2024, step: 1, value: 2000 }) +
            slider({ label: "Years per doubling", key: "dbl", min: 1.5, max: 3, step: 0.1, value: 2 }) +
            "</div>" +
            '<p class="fd-sim-formula">N(year) = 2300 × 2<sup>(year − 1971) / T</sup>, with T the doubling time. Moore\'s 1965 paper predicted a doubling every year; in 1975 he revised it to about two years. (Counts are approximate.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function trend(y) { return 2300 * Math.pow(2, (y - 1971) / state.dbl); }

        function update() {

            setVal(root, "year", state.year);
            setVal(root, "dbl", state.dbl.toFixed(1) + " yr");

            let best = CHIPS[0];

            CHIPS.forEach(function (c) { if (Math.abs(c[0] - state.year) < Math.abs(best[0] - state.year)) { best = c; } });

            seen[state.year < 1985 ? "early" : state.year > 2015 ? "late" : "mid"] = true;

            out(root, "yr", state.year);
            out(root, "trend", H.sci(trend(state.year)));
            out(root, "dbls", ((state.year - 1971) / state.dbl).toFixed(1));
            out(root, "chip", best[2] + " (" + best[0] + "): " + H.sci(best[1]));
            out(root, "verdict", "Every " + state.dbl.toFixed(1) + " years the count doubles: after " + (state.year - 1971) + " years that is a factor of " + H.sci(Math.pow(2, (state.year - 1971) / state.dbl)));

            if (seen.early && seen.late) {
                F.reward("fet-moore", 10, "You rode fifty years of doubling");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const g = plot(ctx, {
                box: [86, 20, 560, 250], x: [1970, 2025], y: [1e3, 1e12], logy: true,
                xt: [[1970, "1970"], [1980, "1980"], [1990, "1990"], [2000, "2000"], [2010, "2010"], [2020, "2020"]],
                yt: [[1e3, "10³"], [1e5, "10⁵"], [1e7, "10⁷"], [1e9, "10⁹"], [1e11, "10¹¹"]],
                xl: "year", yl: "transistors per chip",
                curves: [{ pts: sample(function (y) { return trend(y); }, 1971, 2024, 60), col: GOLD + ".9)", w: 2.4, dash: [8, 5] }]
            });

            CHIPS.forEach(function (c) { dot(ctx, g.sx(c[0]), g.sy(c[1]), 5.5, TEAL + ".98)"); });

            ctx.strokeStyle = TEXT + ".5)";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(g.sx(state.year), 20); ctx.lineTo(g.sx(state.year), 270); ctx.stroke();
            dot(ctx, g.sx(state.year), g.sy(clamp(trend(state.year), 1e3, 1e12)), 7, GOLD + "1)");

            txt(ctx, "● real chips", 100, 40, 12, TEAL + "1)", "start", true);
            txt(ctx, "- - doubling trend", 100, 58, 12, GOLD + "1)", "start", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-dennard"] = function (root) {

        const defaults = { k: 1.5, mode: "ideal" };
        const state = { k: 1.5, mode: "ideal" };
        const seen = {};
        const ROWS = [
            ["Length, oxide thickness", "len"], ["Supply voltage", "volt"], ["Gate delay", "delay"],
            ["Power per transistor", "ppt"], ["Transistors per area", "dens"], ["Power per area", "pd"]
        ];

        root.innerHTML =
            head("Try it: shrink everything by a factor κ") +
            canvasFor(680, 310, "A bar chart showing how six quantities change when a transistor is scaled down by a factor kappa. With ideal scaling, the power per area stays flat. When the voltage stays fixed, the power per area rises steeply.") +
            '<div class="fd-stat-row">' + stat("More transistors per area", "dens") + stat("Faster by", "speed") + stat("Power per area", "pd") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("How is it scaled?", "mode", [["ideal", "Ideal (voltage shrinks too)"], ["fixed", "Voltage stuck"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Scale factor κ (each linear size ÷ κ)", key: "k", min: 1, max: 4, step: 0.25, value: 1.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Ideal (Dennard) scaling: lengths, thickness and voltage all ÷ κ, doping × κ. Delay ∝ 1/κ, power per transistor ∝ 1/κ², density ∝ κ², so power per area stays constant. Hold the voltage fixed instead and the power per area grows as κ³.</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function factor(key) {

            const k = state.k;
            const ideal = state.mode === "ideal";

            switch (key) {
                case "len": return 1 / k;
                case "volt": return ideal ? 1 / k : 1;
                case "delay": return ideal ? 1 / k : 1 / (k * k);
                case "ppt": return ideal ? 1 / (k * k) : k;
                case "dens": return k * k;
                default: return ideal ? 1 : k * k * k;
            }
        }

        function update() {

            setVal(root, "k", "÷ " + state.k.toFixed(2));

            seen[state.mode] = true;

            out(root, "dens", "× " + factor("dens").toFixed(1));
            out(root, "speed", "× " + (1 / factor("delay")).toFixed(1));
            out(root, "pd", "× " + factor("pd").toFixed(1));
            out(root, "verdict", state.mode === "ideal" ? "Ideal scaling: more, faster transistors in the same power budget" :
                "Voltage stuck: the chip gets hotter by κ³. This is where scaling hit the power wall");

            if (seen.ideal && seen.fixed && state.k >= 2) {
                F.reward("fet-dennard", 10, "You saw why the voltage had to scale too");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 310);

            // log axis from 1/16 to 64
            const lo = Math.log2(1 / 16);
            const hi = Math.log2(64);
            const x0 = 250;
            const x1 = 640;
            const sx = function (v) { return x0 + (Math.log2(v) - lo) / (hi - lo) * (x1 - x0); };

            ctx.strokeStyle = GREY + ".25)";
            ctx.lineWidth = 1;

            [1 / 16, 1 / 4, 1, 4, 16, 64].forEach(function (v) {

                ctx.beginPath(); ctx.moveTo(sx(v), 20); ctx.lineTo(sx(v), 270); ctx.stroke();
                txt(ctx, v < 1 ? "1/" + Math.round(1 / v) : String(v), sx(v), 288, 11, TEXT + ".7)");
            });

            ctx.strokeStyle = TEXT + ".8)";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(sx(1), 20); ctx.lineTo(sx(1), 270); ctx.stroke();

            ROWS.forEach(function (r, i) {

                const y = 30 + i * 40;
                const v = factor(r[1]);
                const col = r[1] === "pd" ? (v > 1.05 ? ROSE : TEAL) : GOLD;

                txt(ctx, r[0], 20, y + 18, 13, TEXT + ".9)", "start", true);

                ctx.fillStyle = col + ".85)";
                ctx.fillRect(Math.min(sx(1), sx(v)), y, Math.abs(sx(v) - sx(1)), 26);
                txt(ctx, "× " + (v >= 10 ? v.toFixed(0) : v.toFixed(2)), sx(v) + (v >= 1 ? 8 : -8), y + 18, 12, TEXT + ".95)", v >= 1 ? "start" : "end", true);
            });
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-scalingq"] = quiz(
        "Game: Moore, Dennard, or the wall?",
        ["Moore's law", "Dennard scaling", "The power wall"],
        [
            { q: "The number of transistors on a chip doubles about every two years.", a: "Moore's law", why: "An observation about economics and density." },
            { q: "Shrink the lengths, the oxide and the voltage together and the power per area stays the same.", a: "Dennard scaling", why: "Constant-field scaling." },
            { q: "Clock speeds stalled near 3 to 5 GHz because the chip could not shed any more heat.", a: "The power wall", why: "Power per area stopped being constant." },
            { q: "It is a statement about cost and density, not about speed.", a: "Moore's law", why: "It counts transistors." },
            { q: "It broke down once the threshold voltage could not drop without leakage exploding.", a: "Dennard scaling", why: "Voltage stopped shrinking." },
            { q: "It pushed designers toward many slower cores instead of one very fast one.", a: "The power wall", why: "More parallelism, same heat." }
        ],
        5,
        "fet-scalingq-done",
        "You can tell the scaling ideas apart",
        "Moore counts, Dennard keeps the heat constant, and the wall is what happened when the voltage stopped shrinking.",
        "Moore counts, Dennard keeps the heat flat, the wall is what happened when voltage stopped. Hit Reset to try again."
    );


    /* ======================================
       UNIT 29: THE CMOS INVERTER
    ====================================== */

    const VDD = 1.0;
    const VTN = 0.3;
    const VTP = 0.3;

    // Square-law current with a little channel-length modulation, so the gain stays finite.
    function ids2(vgs, vds, vth, k) {

        const vov = vgs - vth;

        return idrain(vgs, vds, vth, k) * (vov > 0 && vds >= vov ? 1 + 0.12 * vds : 1);
    }

    // Solve for the output voltage of a CMOS inverter by bisection.
    // r is the PMOS-to-NMOS width ratio; holes are about 0.4 times as mobile as electrons.
    function inverterVout(vin, r) {

        const kn = 0.5;
        const kp = 0.5 * 0.4 * r;
        let lo = 0;
        let hi = VDD;

        for (let i = 0; i < 40; i++) {

            const mid = (lo + hi) / 2;
            const f = ids2(vin, mid, VTN, kn) - ids2(VDD - vin, VDD - mid, VTP, kp);

            if (f > 0) { hi = mid; } else { lo = mid; }
        }

        return (lo + hi) / 2;
    }

    function inverterCurrent(vin, r) {

        const vout = inverterVout(vin, r);

        return ids2(vin, vout, VTN, 0.5);
    }

    function regionOf(vgs, vds, vth) {

        const vov = vgs - vth;

        if (vov <= 0) { return "off"; }

        return vds >= vov ? "saturation" : "triode";
    }

    SIMS["fet-inverter"] = function (root) {

        const defaults = { vin: 0.2, r: 2.5 };
        const state = { vin: 0.2, r: 2.5 };
        const seen = {};

        root.innerHTML =
            head("Try it: sweep the input of a CMOS inverter") +
            canvasFor(680, 340, "On the left, a graph of the output voltage against the input voltage, an S-shaped curve that flips from high to low. A dot marks the chosen input. On the right, a schematic with a PMOS transistor to the supply and an NMOS to ground, colored by whether each is on.") +
            '<div class="fd-stat-row">' + stat("Output", "vout") + stat("NMOS (to ground)", "n") + stat("PMOS (to supply)", "p") + stat("Supply current", "i") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Input voltage", key: "vin", min: 0, max: 1, step: 0.01, value: 0.2 }) +
            slider({ label: "PMOS width ÷ NMOS width", key: "r", min: 0.5, max: 5, step: 0.1, value: 2.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Pull-down: the NMOS conducts when V<sub>in</sub> is high. Pull-up: the PMOS conducts when V<sub>in</sub> is low. In between both conduct briefly and a small short-circuit current flows. A PMOS about 2.5 times wider than the NMOS evens out the weaker holes. (V<sub>DD</sub> = 1 V, |V<sub>th</sub>| = 0.3 V.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function update() {

            setVal(root, "vin", state.vin.toFixed(2) + " V");
            setVal(root, "r", state.r.toFixed(1) + " ×");

            const vout = inverterVout(state.vin, state.r);
            const ni = ids2(state.vin, vout, VTN, 0.5);

            seen[state.vin < 0.25 ? "lo" : state.vin > 0.75 ? "hi" : "mid"] = true;

            out(root, "vout", vout.toFixed(2) + " V");
            out(root, "n", regionOf(state.vin, vout, VTN));
            out(root, "p", regionOf(VDD - state.vin, VDD - vout, VTP));
            out(root, "i", ni < 1e-4 ? "≈ 0" : (ni * 1000).toFixed(0) + " µA");
            out(root, "verdict", state.vin < VTN ? "Input low: the PMOS pulls the output up to the supply. No current flows" :
                state.vin > VDD - VTP ? "Input high: the NMOS pulls the output down to ground. No current flows" :
                    "In between: both transistors are on, the output swings fast, and a little current leaks straight through");

            if (seen.lo && seen.hi && seen.mid) {
                F.reward("fet-inverter", 10, "You swept a CMOS inverter end to end");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const g = plot(ctx, {
                box: [60, 30, 280, 250], x: [0, 1], y: [0, 1],
                xt: [[0, "0"], [0.5, "0.5"], [1, "1"]], yt: [[0, "0"], [0.5, "0.5"], [1, "1"]],
                xl: "input (V)", yl: "output (V)",
                curves: [
                    { pts: [[0, 0], [1, 1]], col: GREY + ".5)", w: 1.5, dash: [4, 4] },
                    { pts: sample(function (v) { return inverterVout(v, state.r); }, 0, 1, 100), col: TEAL + ".98)", w: 3.4 }
                ]
            });

            const vout = inverterVout(state.vin, state.r);

            dot(ctx, g.sx(state.vin), g.sy(vout), 8, GOLD + "1)");

            // schematic
            const nOn = state.vin > VTN;
            const pOn = VDD - state.vin > VTP;
            const cx = 520;

            txt(ctx, "VDD = 1 V", cx, 30, 13, GOLD + "1)", "center", true);

            ctx.strokeStyle = GOLD + ".8)";
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx - 40, 38); ctx.lineTo(cx + 40, 38); ctx.stroke();

            ctx.strokeStyle = TEXT + ".6)";
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(cx, 38); ctx.lineTo(cx, 70); ctx.moveTo(cx, 130); ctx.lineTo(cx, 170); ctx.moveTo(cx, 230); ctx.lineTo(cx, 270); ctx.stroke();

            box(ctx, cx - 36, 70, 72, 60, pOn ? ROSE + ".75)" : GREY + ".25)", GREY + ".7)");
            txt(ctx, "PMOS", cx, 96, 13, TEXT + ".95)", "center", true);
            txt(ctx, pOn ? "ON" : "OFF", cx, 116, 12, TEXT + ".85)");

            box(ctx, cx - 36, 170, 72, 60, nOn ? TEAL + ".75)" : GREY + ".25)", GREY + ".7)");
            txt(ctx, "NMOS", cx, 196, 13, TEXT + ".95)", "center", true);
            txt(ctx, nOn ? "ON" : "OFF", cx, 216, 12, TEXT + ".85)");

            ctx.strokeStyle = GOLD + ".9)";
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx, 130); ctx.lineTo(cx, 170); ctx.moveTo(cx, 150); ctx.lineTo(cx + 60, 150); ctx.stroke();
            dot(ctx, cx, 150, 5, GOLD + "1)");
            txt(ctx, "out = " + vout.toFixed(2) + " V", cx + 64, 154, 13, GOLD + "1)", "start", true);

            ctx.strokeStyle = GREY + ".8)";
            ctx.beginPath(); ctx.moveTo(cx - 28, 272); ctx.lineTo(cx + 28, 272); ctx.moveTo(cx - 18, 278); ctx.lineTo(cx + 18, 278); ctx.moveTo(cx - 8, 284); ctx.lineTo(cx + 8, 284); ctx.stroke();

            ctx.strokeStyle = TEXT + ".5)";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx - 36, 100); ctx.lineTo(cx - 70, 100); ctx.lineTo(cx - 70, 200); ctx.lineTo(cx - 36, 200); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx - 70, 150); ctx.lineTo(cx - 90, 150); ctx.stroke();
            txt(ctx, "in = " + state.vin.toFixed(2) + " V", cx - 94, 154, 13, TEXT + ".95)", "end", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-regen"] = function (root) {

        const defaults = { noise: 0.3, stages: 3 };
        const state = { noise: 0.3, stages: 3 };
        const rand = mulberry(11);
        const N = 320;
        const BITS = [];
        const NOISE = [];
        const seen = {};

        for (let i = 0; i < N / 40; i++) { BITS.push(rand() < 0.5 ? 0 : 1); }

        // smooth-ish noise so the wiggles look like a real wire
        let prev = 0;

        for (let i = 0; i < N; i++) {

            prev = prev * 0.55 + (rand() * 2 - 1) * 0.9;
            NOISE.push(prev);
        }

        root.innerHTML =
            head("Try it: noise dies out stage by stage") +
            canvasFor(680, 340, "Waveforms of a digital signal passing through a chain of inverters. The top trace is the noisy input. Each trace below it is the output of one more inverter, and it is cleaner than the one above, as long as the noise stays under the noise margin.") +
            '<div class="fd-stat-row">' + stat("Bits misread at the input", "e0") + stat("Bits misread at the last stage", "e1") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Noise on the wire (peak, in volts)", key: "noise", min: 0, max: 0.7, step: 0.02, value: 0.3 }) +
            slider({ label: "Inverters in the chain", key: "stages", min: 1, max: 4, step: 1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">Each inverter\'s steep middle gain pushes a slightly-low input to a clean 0 and a slightly-high one to a clean 1. This restoring action only works while the noise stays inside the noise margins (about 0.35 V here). Analog signals get no such cleanup.</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function signal(i) { return BITS[Math.floor(i / 40) % BITS.length] * VDD + NOISE[i % N] * state.noise; }

        function levels(i) {

            const arr = [signal(i)];

            for (let s = 1; s <= 4; s++) { arr.push(inverterVout(clamp(arr[s - 1], 0, VDD), 2.5)); }

            return arr;
        }

        function errors(stage) {

            let bad = 0;

            for (let i = 0; i < N; i++) {

                const v = levels(i)[stage];
                const bit = BITS[Math.floor(i / 40) % BITS.length];
                const want = stage % 2 === 0 ? bit : 1 - bit;
                const got = v > VDD / 2 ? 1 : 0;

                if (got !== want) { bad++; }
            }

            return bad;
        }

        function update() {

            setVal(root, "noise", "± " + state.noise.toFixed(2) + " V");
            setVal(root, "stages", state.stages);

            const e0 = errors(0);
            const e1 = errors(state.stages);

            seen[state.noise > 0.45 ? "loud" : state.noise < 0.15 ? "quiet" : "mid"] = true;

            out(root, "e0", e0 + " of " + N + " samples");
            out(root, "e1", e1 + " of " + N + " samples");
            out(root, "verdict", e0 === 0 && state.noise < 0.3 ? "Quiet wire: nothing to clean up yet. Raise the noise" :
                e1 < e0 ? "The chain cleans the signal: fewer misreads at the end than at the start" :
                    e1 === 0 ? "No errors anywhere: the noise stays inside the noise margin" : "Too much noise: past the noise margin, even logic gets fooled");

            if (seen.loud && seen.quiet && state.stages >= 2) {
                F.reward("fet-regen", 10, "You saw logic clean up a noisy signal");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const rows = state.stages + 1;
            const h = 290 / rows;
            const cols = [GOLD, TEAL, BLUE, ROSE, GREY];

            for (let s = 0; s < rows; s++) {

                const top = 20 + s * h;
                const bot = top + h - 14;

                txt(ctx, s === 0 ? "noisy input" : "after inverter " + s, 14, top + 12, 11, cols[s] + "1)", "start", true);

                ctx.strokeStyle = GREY + ".3)";
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 4]);
                ctx.beginPath(); ctx.moveTo(110, (top + bot) / 2 + 2); ctx.lineTo(660, (top + bot) / 2 + 2); ctx.stroke();
                ctx.setLineDash([]);

                ctx.strokeStyle = cols[s] + ".98)";
                ctx.lineWidth = 2.2;
                ctx.beginPath();

                for (let i = 0; i < N; i++) {

                    const v = clamp(levels(i)[s], -0.4, 1.4);
                    const x = 110 + i / (N - 1) * 550;
                    const y = bot - (v + 0.4) / 1.8 * (bot - top - 6);

                    if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
                }

                ctx.stroke();
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-cmosq"] = quiz(
        "Game: why CMOS?",
        ["Why it saves power", "Why it restores signals", "Why PMOS is wider"],
        [
            { q: "In a steady state one transistor is off, so almost no current flows from supply to ground.", a: "Why it saves power", why: "Only switching costs energy." },
            { q: "A steep transition in the middle of the curve pushes values toward 0 or 1.", a: "Why it restores signals", why: "High gain around the switching point." },
            { q: "Holes move more slowly than electrons, so the pull-up needs more width to match the pull-down.", a: "Why PMOS is wider", why: "Mobility ratio of roughly 2.5 to 1." },
            { q: "Noise margins let small errors on a wire be forgiven by the next gate.", a: "Why it restores signals", why: "The next inverter cleans them up." },
            { q: "A chip full of idle gates draws very little supply current.", a: "Why it saves power", why: "No static path to ground." },
            { q: "Equal rise and fall times need unequal widths.", a: "Why PMOS is wider", why: "To balance drive strength." }
        ],
        5,
        "fet-cmosq-done",
        "You know why CMOS won",
        "Low standby power, signal restoration and a balanced pair: the three gifts of CMOS.",
        "Low standby power, restoration, balanced pair. Hit Reset to try again."
    );


    /* ======================================
       UNIT 30: LOGIC GATES AND POWER
    ====================================== */

    SIMS["fet-gates"] = function (root) {

        const defaults = { g: "nand", a: 0, b: 0 };
        const state = { g: "nand", a: 0, b: 0 };
        const seen = {};

        root.innerHTML =
            head("Try it: build the gate from transistors") +
            canvasFor(680, 360, "A schematic of a CMOS logic gate. At the top a PMOS pull-up network connects the supply to the output. At the bottom an NMOS pull-down network connects the output to ground. Transistors that are on are colored, and the network that conducts is highlighted. A truth table at the right shows the current row.") +
            '<div class="fd-stat-row">' + stat("Input A", "a") + stat("Input B", "b") + stat("Output", "y") + stat("Conducting network", "net") + "</div>" +
            seg("Gate", "g", [["inv", "Inverter"], ["nand", "NAND"], ["nor", "NOR"]]) +
            seg("Input A", "a", [["0", "A = 0"], ["1", "A = 1"]]) +
            seg("Input B", "b", [["0", "B = 0"], ["1", "B = 1"]]) +
            '<p class="fd-sim-formula">A PMOS conducts when its gate is 0, an NMOS when its gate is 1. NAND: series NMOS, parallel PMOS. NOR: parallel NMOS, series PMOS. The pull-up and pull-down networks are duals, so exactly one of them conducts for every input.</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function logic() {

            const a = state.a === 1;
            const b = state.b === 1;
            const two = state.g !== "inv";
            const pA = !a;
            const pB = !b;
            const nA = a;
            const nB = b;
            let pun;
            let pdn;

            if (state.g === "inv") {
                pun = pA; pdn = nA;
            } else if (state.g === "nand") {
                pun = pA || pB; pdn = nA && nB;
            } else {
                pun = pA && pB; pdn = nA || nB;
            }

            return { a: a, b: b, two: two, pA: pA, pB: pB, nA: nA, nB: nB, pun: pun, pdn: pdn, y: pun ? 1 : 0 };
        }

        function update() {

            const L = logic();

            seen[state.g] = true;
            seen["a" + state.a + "b" + state.b] = true;

            out(root, "a", state.a);
            out(root, "b", state.g === "inv" ? "unused" : state.b);
            out(root, "y", L.y);
            out(root, "net", L.pun ? "pull-up (to VDD)" : "pull-down (to ground)");

            if (seen.inv && seen.nand && seen.nor) {
                F.reward("fet-gates", 10, "You wired all three gates");
            }

            draw();
        }

        function tr(x, y, kind, on, label) {

            box(ctx, x, y, 58, 44, on ? (kind === "P" ? ROSE : TEAL) + ".78)" : GREY + ".22)", GREY + ".7)");
            txt(ctx, kind + "MOS", x + 29, y + 18, 12, TEXT + ".95)", "center", true);
            txt(ctx, label + (on ? " · ON" : " · off"), x + 29, y + 36, 11, TEXT + ".85)");
        }

        function wireSeg(x1, y1, x2, y2, live, col) {

            ctx.strokeStyle = live ? col : GREY + ".4)";
            ctx.lineWidth = live ? 4 : 2.2;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }

        function draw() {

            clear(ctx, 680, 360);

            const L = logic();
            const cx = 200;

            txt(ctx, "VDD", cx, 22, 13, GOLD + "1)", "center", true);
            wireSeg(cx - 110, 28, cx + 110, 28, L.pun, GOLD + ".95)");

            // pull-up network
            if (state.g === "inv") {

                wireSeg(cx, 28, cx, 60, L.pun, GOLD + ".95)");
                tr(cx - 29, 60, "P", L.pA, "A");
                wireSeg(cx, 104, cx, 160, L.pun, GOLD + ".95)");

            } else if (state.g === "nand") {

                // parallel
                wireSeg(cx - 60, 28, cx - 60, 60, L.pA, GOLD + ".95)");
                wireSeg(cx + 60, 28, cx + 60, 60, L.pB, GOLD + ".95)");
                tr(cx - 89, 60, "P", L.pA, "A");
                tr(cx + 31, 60, "P", L.pB, "B");
                wireSeg(cx - 60, 104, cx - 60, 124, L.pA, GOLD + ".95)");
                wireSeg(cx + 60, 104, cx + 60, 124, L.pB, GOLD + ".95)");
                wireSeg(cx - 60, 124, cx + 60, 124, L.pun, GOLD + ".95)");
                wireSeg(cx, 124, cx, 160, L.pun, GOLD + ".95)");

            } else {

                // series
                wireSeg(cx, 28, cx, 46, L.pun, GOLD + ".95)");
                tr(cx - 29, 46, "P", L.pA, "A");
                wireSeg(cx, 90, cx, 100, L.pun, GOLD + ".95)");
                tr(cx - 29, 100, "P", L.pB, "B");
                wireSeg(cx, 144, cx, 160, L.pun, GOLD + ".95)");
            }

            // output node
            dot(ctx, cx, 160, 6, L.y ? GOLD + "1)" : GREY + ".9)");
            ctx.strokeStyle = TEXT + ".6)";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx, 160); ctx.lineTo(cx + 120, 160); ctx.stroke();
            txt(ctx, "Y = " + L.y, cx + 126, 165, 16, L.y ? GOLD + "1)" : TEXT + ".85)", "start", true);

            // pull-down network
            const tc = L.pdn ? TEAL + ".95)" : TEAL;

            if (state.g === "inv") {

                wireSeg(cx, 160, cx, 190, L.pdn, tc);
                tr(cx - 29, 190, "N", L.nA, "A");
                wireSeg(cx, 234, cx, 300, L.pdn, tc);

            } else if (state.g === "nand") {

                // series
                wireSeg(cx, 160, cx, 176, L.pdn, tc);
                tr(cx - 29, 176, "N", L.nA, "A");
                wireSeg(cx, 220, cx, 230, L.pdn, tc);
                tr(cx - 29, 230, "N", L.nB, "B");
                wireSeg(cx, 274, cx, 300, L.pdn, tc);

            } else {

                // parallel
                wireSeg(cx, 160, cx, 180, L.pdn, tc);
                wireSeg(cx - 60, 180, cx + 60, 180, L.pdn, tc);
                wireSeg(cx - 60, 180, cx - 60, 196, L.nA, tc);
                wireSeg(cx + 60, 180, cx + 60, 196, L.nB, tc);
                tr(cx - 89, 196, "N", L.nA, "A");
                tr(cx + 31, 196, "N", L.nB, "B");
                wireSeg(cx - 60, 240, cx - 60, 262, L.nA, tc);
                wireSeg(cx + 60, 240, cx + 60, 262, L.nB, tc);
                wireSeg(cx - 60, 262, cx + 60, 262, L.pdn, tc);
                wireSeg(cx, 262, cx, 300, L.pdn, tc);
            }

            txt(ctx, "ground", cx, 322, 13, TEXT + ".8)", "center", true);
            wireSeg(cx - 40, 304, cx + 40, 304, L.pdn, tc);

            // truth table
            const tx = 460;
            const rows = state.g === "inv" ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];

            txt(ctx, state.g === "inv" ? "A  Y" : "A  B  Y", tx + 70, 50, 14, TEXT + ".9)", "center", true);

            rows.forEach(function (r, i) {

                const y = 78 + i * 34;
                let yy;

                if (state.g === "inv") { yy = r[0] ? 0 : 1; } else if (state.g === "nand") { yy = (r[0] && r[1]) ? 0 : 1; } else { yy = (r[0] || r[1]) ? 0 : 1; }

                const cur = state.g === "inv" ? r[0] === state.a : (r[0] === state.a && r[1] === state.b);

                if (cur) { box(ctx, tx, y - 20, 140, 30, TEAL + ".28)", TEAL + ".9)"); }

                txt(ctx, r.concat([yy]).join("   "), tx + 70, y, 16, TEXT + ".95)", "center", cur);
            });

            txt(ctx, state.g === "inv" ? "NOT" : state.g.toUpperCase(), tx + 70, 250, 22, GOLD + "1)", "center", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-cv2f"] = function (root) {

        const defaults = { v: 0.8, f: 3, a: 0.1, vth: 0.35 };
        const state = { v: 0.8, f: 3, a: 0.1, vth: 0.35 };
        const seen = {};
        const NG = 3e8;     // gates
        const CG = 0.4e-15; // switched capacitance per gate, F

        root.innerHTML =
            head("Try it: where does the chip's power go?") +
            canvasFor(680, 330, "A graph of chip power against supply voltage, with dynamic power in teal and leakage power in rose, and a dot at the chosen supply voltage. Dynamic power rises with the square of the voltage. Leakage rises as the supply voltage rises and as the threshold voltage falls.") +
            '<div class="fd-stat-row">' + stat("Dynamic power", "pd") + stat("Leakage power", "ps") + stat("Total", "pt") + stat("Leakage share", "share") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Supply voltage V<sub>DD</sub>", key: "v", min: 0.4, max: 1.2, step: 0.02, value: 0.8 }) +
            slider({ label: "Clock frequency", key: "f", min: 0.5, max: 5, step: 0.1, value: 3 }) +
            slider({ label: "Activity (fraction of gates switching)", key: "a", min: 0.02, max: 0.4, step: 0.01, value: 0.1 }) +
            slider({ label: "Threshold voltage V<sub>th</sub>", key: "vth", min: 0.2, max: 0.5, step: 0.01, value: 0.35 }) +
            "</div>" +
            '<p class="fd-sim-formula">P<sub>total</sub> = α·N·C·V<sub>DD</sub>²·f + V<sub>DD</sub>·I<sub>off</sub>. The first term is dynamic power: every switching gate charges and discharges its capacitance. The second is the standby leak. (A chip with 3 × 10⁸ gates, illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function pdyn(v, f, a) { return a * NG * CG * v * v * f * 1e9; }

        function pleak(v, vth) {

            const ioff = 1e-5 * Math.pow(10, -vth / 0.08) * (1 + (v - 0.8) * 1.2); // A/µm, a little DIBL
            const width = 3e8; // µm of total width

            return v * Math.max(ioff, 0) * width;
        }

        function update() {

            setVal(root, "v", state.v.toFixed(2) + " V");
            setVal(root, "f", state.f.toFixed(1) + " GHz");
            setVal(root, "a", state.a.toFixed(2));
            setVal(root, "vth", state.vth.toFixed(2) + " V");

            const d = pdyn(state.v, state.f, state.a);
            const s = pleak(state.v, state.vth);

            seen[state.v < 0.6 ? "lowv" : state.v > 1.0 ? "highv" : "mid"] = true;

            out(root, "pd", d.toFixed(d < 10 ? 1 : 0) + " W");
            out(root, "ps", s.toFixed(s < 10 ? 2 : 0) + " W");
            out(root, "pt", (d + s).toFixed(d + s < 10 ? 1 : 0) + " W");
            out(root, "share", Math.round(100 * s / (d + s)) + "%");
            out(root, "verdict", s > d ? "Leakage dominates: lowering Vth made the chip hot even at rest" :
                d > 60 ? "Hot: the dynamic term grows as V² × f" : "Halve VDD and the dynamic power drops to a quarter, but the transistors get slower");

            if (seen.lowv && seen.highv) {
                F.reward("fet-cv2f", 10, "You traded voltage against power");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const ymax = Math.max(40, pdyn(1.2, state.f, state.a) + pleak(1.2, state.vth)) * 1.05;

            const g = plot(ctx, {
                box: [86, 20, 560, 250], x: [0.4, 1.2], y: [0, ymax],
                xt: [[0.4, "0.4"], [0.6, "0.6"], [0.8, "0.8"], [1.0, "1.0"], [1.2, "1.2"]],
                yt: [[0, "0"], [ymax / 2, fmt(ymax / 2)], [ymax * 0.98, fmt(ymax * 0.98)]],
                xl: "supply voltage VDD (V)", yl: "power (W)",
                curves: [
                    { pts: sample(function (v) { return pdyn(v, state.f, state.a); }, 0.4, 1.2, 60), col: TEAL + ".98)", w: 3.2 },
                    { pts: sample(function (v) { return pleak(v, state.vth); }, 0.4, 1.2, 60), col: ROSE + ".98)", w: 3.2 },
                    { pts: sample(function (v) { return pdyn(v, state.f, state.a) + pleak(v, state.vth); }, 0.4, 1.2, 60), col: GOLD + ".9)", w: 2, dash: [7, 5] }
                ]
            });

            const tot = pdyn(state.v, state.f, state.a) + pleak(state.v, state.vth);

            dot(ctx, g.sx(state.v), g.sy(Math.min(tot, ymax)), 7, GOLD + "1)");
            txt(ctx, "dynamic (αCV²f)", 100, 40, 12, TEAL + "1)", "start", true);
            txt(ctx, "leakage", 100, 58, 12, ROSE + "1)", "start", true);
            txt(ctx, "total", 100, 76, 12, GOLD + "1)", "start", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-gatesq"] = quiz(
        "Game: build the network",
        ["Series NMOS", "Parallel NMOS", "Series PMOS", "Parallel PMOS"],
        [
            { q: "NAND pull-down network: both inputs must be 1 to pull the output low.", a: "Series NMOS", why: "AND of the inputs means a series path." },
            { q: "NAND pull-up network: either input being 0 pulls the output high.", a: "Parallel PMOS", why: "OR of the inverted inputs means a parallel path." },
            { q: "NOR pull-down network: either input being 1 pulls the output low.", a: "Parallel NMOS", why: "A parallel path." },
            { q: "NOR pull-up network: both inputs must be 0 to pull the output high.", a: "Series PMOS", why: "A series path." },
            { q: "The pull-up network is the dual of this one in a NAND gate.", a: "Series NMOS", why: "Series becomes parallel when you swap NMOS for PMOS." },
            { q: "Four of these stacked in series would be slow, so wide gates are split into stages.", a: "Series NMOS", why: "Series resistance adds up." }
        ],
        5,
        "fet-gatesq-done",
        "You can wire a pull-up and a pull-down",
        "Series means AND, parallel means OR, and the two networks are duals.",
        "Series is AND, parallel is OR, the networks are duals. Hit Reset to try again."
    );


    // Chain the next simulator file, then mount whatever is on the page.
    if (!document.getElementById("fabFetScriptG")) {

        const more = document.createElement("script");

        more.id = "fabFetScriptG";
        more.src = "diagram-sims-fet-g.js";

        document.head.appendChild(more);
    }

    document.querySelectorAll('.fd-sim[data-sim^="fet-"]').forEach(F.mount);

})();
