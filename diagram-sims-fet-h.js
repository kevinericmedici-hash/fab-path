/* ========================================
   TRANSISTORS: INTERACTIVE SIMULATORS, PART 8

   Unit 38: the bipolar transistor, gm per unit current.
   Unit 39: JFET pinch-off, the HEMT's two-dimensional electron gas.
   Unit 40: power transistors: the drift-region limit, switching loss.
   Unit 41: thin-film transistors: the pixel, mobility by material.
   Unit 42: carbon nanotubes, thin channels and 2D materials.
   Unit 43: steep-slope devices: the 60 mV/decade limit, the tunnel FET.
   Unit 44: bias-temperature instability, oxide breakdown.
   Unit 45: random variability, the road ahead.

   Registers on window.FabInteract; loaded by diagram-sims-fet-g.js.
   Teaching models: numbers and shapes are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers || !F.fetHelpers || !F.fetHelpers.plot) {
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
    const plot = H.plot;
    const sample = H.sample;
    const arrowLine = H.arrowLine;
    const box = H.box;
    const eng = H.eng;
    const fmt = H.fmt;

    const VT = 0.02569; // thermal voltage, volts


    /* ======================================
       UNIT 38: THE BIPOLAR TRANSISTOR
    ====================================== */

    SIMS["fet-bjt"] = function (root) {

        const defaults = { vbe: 0.65, beta: 100 };
        const state = { vbe: 0.65, beta: 100 };
        const IS = 1e-15;
        const seen = {};
        const rand = mulberry(21);
        const parts = [];
        let t = 0;

        for (let i = 0; i < 40; i++) { parts.push({ u: rand(), x: rand(), drop: rand() }); }

        root.innerHTML =
            head("Try it: an NPN bipolar transistor") +
            canvasFor(680, 340, "On the left, a cross-section of an NPN bipolar transistor: an n-type emitter on top, a very thin p-type base, and an n-type collector below. Electrons flow from the emitter through the base into the collector, and a few recombine in the base. On the right, a log graph of collector current against base-emitter voltage, which is a straight line.") +
            '<div class="fd-stat-row">' + stat("Collector current", "ic") + stat("Base current", "ib") + stat("Emitter current", "ie") + stat("g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub>", "gm") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Base-emitter voltage V<sub>BE</sub>", key: "vbe", min: 0.5, max: 0.78, step: 0.005, value: 0.65 }) +
            slider({ label: "Current gain β", key: "beta", min: 20, max: 300, step: 5, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">I<sub>C</sub> = I<sub>S</sub>·e<sup>V<sub>BE</sub>/V<sub>T</sub></sup>, I<sub>B</sub> = I<sub>C</sub>/β, I<sub>E</sub> = I<sub>C</sub> + I<sub>B</sub>. The emitter injects electrons into a base so thin that almost all of them cross into the collector before recombining. A tiny base current therefore controls a much larger collector current. V<sub>T</sub> = kT/q ≈ 25.7 mV. (I<sub>S</sub> = 10<sup>−15</sup> A, illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function ic() { return IS * Math.exp(state.vbe / VT); }

        function update() {

            setVal(root, "vbe", state.vbe.toFixed(3) + " V");
            setVal(root, "beta", state.beta);

            const i = ic();

            seen[state.vbe > 0.72 ? "high" : state.vbe < 0.58 ? "low" : "mid"] = true;

            out(root, "ic", eng(i, "A"));
            out(root, "ib", eng(i / state.beta, "A"));
            out(root, "ie", eng(i * (1 + 1 / state.beta), "A"));
            out(root, "gm", (i / VT * 1000).toFixed(i / VT * 1000 < 10 ? 2 : 0) + " mS");
            out(root, "verdict", "Every extra 60 mV of VBE multiplies the collector current by ten, at any current level");

            if (seen.high && seen.low) {
                F.reward("fet-bjt", 10, "You turned a bipolar transistor up and down");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const x0 = 40;
            const w = 220;

            ctx.fillStyle = TEAL + ".55)"; ctx.fillRect(x0, 60, w, 70);
            ctx.fillStyle = ROSE + ".5)"; ctx.fillRect(x0, 130, w, 30);
            ctx.fillStyle = TEAL + ".4)"; ctx.fillRect(x0, 160, w, 120);
            txt(ctx, "emitter (n+)", x0 + w / 2, 100, 13, TEXT + ".95)", "center", true);
            txt(ctx, "base (p, thin)", x0 + w / 2, 150, 12, TEXT + ".95)", "center", true);
            txt(ctx, "collector (n)", x0 + w / 2, 225, 13, TEXT + ".95)", "center", true);

            // terminals
            ctx.strokeStyle = TEXT + ".6)"; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x0 + w / 2, 60); ctx.lineTo(x0 + w / 2, 40);
            ctx.moveTo(x0, 145); ctx.lineTo(x0 - 24, 145);
            ctx.moveTo(x0 + w / 2, 280); ctx.lineTo(x0 + w / 2, 300);
            ctx.stroke();
            txt(ctx, "E", x0 + w / 2, 32, 13, TEXT + ".95)", "center", true);
            txt(ctx, "B", x0 - 30, 150, 13, TEXT + ".95)", "end", true);
            txt(ctx, "C", x0 + w / 2, 318, 13, TEXT + ".95)", "center", true);

            // electrons: from the emitter, a share leaving the base
            const speed = 0.12 + 0.1 * Math.log10(1 + ic() * 1e4);
            const frac = 1 / (state.beta + 1);
            const n = clamp(Math.round(Math.log10(1 + ic() * 1e5) * 9), 4, 40);

            for (let i = 0; i < n; i++) {

                const p = parts[i];
                const ph = (t * speed + p.u) % 1;
                const x = x0 + 14 + p.x * (w - 28);

                if (p.drop < frac * 4 && ph > 0.35 && ph < 0.55) {

                    // recombining in the base: leaves sideways
                    const k = (ph - 0.35) / 0.2;

                    dot(ctx, x - k * (x - (x0 - 20)), 145 + k * 0, 3.8, ROSE + ".95)");

                } else {

                    dot(ctx, x, 70 + ph * 200, 3.8, "rgba(255,255,255,.95)");
                }
            }

            txt(ctx, "rose dots: electrons lost to recombination (the base current)", x0 - 20, 336, 11, ROSE + "1)", "start");

            // log plot
            const g = plot(ctx, {
                box: [380, 30, 270, 230], x: [0.5, 0.78], y: [1e-7, 1e-2], logy: true,
                xt: [[0.5, "0.5"], [0.6, "0.6"], [0.7, "0.7"]], yt: [[1e-6, "1 µA"], [1e-4, "100 µA"], [1e-2, "10 mA"]],
                xl: "VBE (V)", yl: "collector current (A)",
                curves: [{ pts: sample(function (v) { return IS * Math.exp(v / VT); }, 0.5, 0.78, 60), col: GOLD + ".98)", w: 3.2 }]
            });

            dot(ctx, g.sx(state.vbe), g.sy(clamp(ic(), 1e-7, 1e-2)), 7, TEAL + "1)");
            txt(ctx, "straight on a log plot:", 650, 52, 11, TEXT + ".8)", "end");
            txt(ctx, "60 mV per decade", 650, 66, 11, TEXT + ".8)", "end");
        }

        animate(root, function (dt) { t += dt; draw(); });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    SIMS["fet-bjtvs"] = function (root) {

        const defaults = { vov: 0.2 };
        const state = { vov: 0.2 };
        const N = 1.3;
        const seen = {};

        root.innerHTML =
            head("Try it: how much gain per microamp?") +
            canvasFor(680, 320, "A graph of transconductance divided by current against the MOSFET overdrive voltage. A flat line shows the bipolar transistor, at about 39 per volt. A falling curve shows the MOSFET, which approaches the bipolar value only in weak inversion near the threshold and falls as the overdrive grows.") +
            '<div class="fd-stat-row">' + stat("BJT g<sub>m</sub>/I", "b") + stat("MOSFET g<sub>m</sub>/I", "m") + stat("Bipolar advantage", "adv") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "MOSFET overdrive V<sub>ov</sub> = V<sub>GS</sub> − V<sub>th</sub>", key: "vov", min: 0, max: 0.6, step: 0.01, value: 0.2 }) +
            "</div>" +
            '<p class="fd-sim-formula">Transconductance per unit current: BJT g<sub>m</sub>/I<sub>C</sub> = 1/V<sub>T</sub> ≈ 39 V<sup>−1</sup>, fixed by physics. MOSFET g<sub>m</sub>/I<sub>D</sub> ≈ 2/(V<sub>ov</sub> + 2nV<sub>T</sub>): at most about 30 V<sup>−1</sup> in weak inversion, and falling as the overdrive grows. (n = 1.3.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function gmi(v) { return 2 / (v + 2 * N * VT); }

        function update() {

            setVal(root, "vov", state.vov.toFixed(2) + " V");

            const b = 1 / VT;
            const m = gmi(state.vov);

            seen[state.vov < 0.08 ? "weak" : state.vov > 0.35 ? "strong" : "mid"] = true;

            out(root, "b", b.toFixed(0) + " V⁻¹");
            out(root, "m", m.toFixed(0) + " V⁻¹");
            out(root, "adv", (b / m).toFixed(1) + "×");
            out(root, "verdict", state.vov < 0.08 ? "Weak inversion: the MOSFET gets close to bipolar efficiency, but its current is tiny and slow" :
                state.vov > 0.35 ? "Strong inversion: fast and rugged, but the MOSFET gives a fraction of the bipolar gm for the same current" : "Moderate inversion: the usual trade between speed and gm efficiency");

            if (seen.weak && seen.strong) {
                F.reward("fet-bjtvs", 10, "You compared gm per current for two devices");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 320);

            const g = plot(ctx, {
                box: [86, 20, 560, 230], x: [0, 0.6], y: [0, 45],
                xt: [[0, "0"], [0.2, "0.2"], [0.4, "0.4"], [0.6, "0.6"]], yt: [[0, "0"], [20, "20"], [40, "40"]],
                xl: "MOSFET overdrive Vov (V)", yl: "gm / I (per volt)",
                curves: [
                    { pts: [[0, 1 / VT], [0.6, 1 / VT]], col: GOLD + ".98)", w: 3.2 },
                    { pts: sample(gmi, 0, 0.6, 80), col: TEAL + ".98)", w: 3.2 }
                ]
            });

            dot(ctx, g.sx(state.vov), g.sy(gmi(state.vov)), 7, TEAL + "1)");
            txt(ctx, "bipolar: 1/VT, always", 630, 120, 12, GOLD + "1)", "end", true);
            txt(ctx, "MOSFET: falls with overdrive", 630, 138, 12, TEAL + "1)", "end", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-bjtq"] = quiz(
        "Game: BJT or MOSFET?",
        ["BJT", "MOSFET"],
        [
            { q: "A small base current controls a much larger collector current.", a: "BJT", why: "Current-controlled, with gain β." },
            { q: "The gate is insulated, so it draws almost no DC current.", a: "MOSFET", why: "The oxide blocks it." },
            { q: "Collector current rises exponentially with the control voltage.", a: "BJT", why: "IC rises exponentially with VBE." },
            { q: "The dominant device in digital logic, billions per chip.", a: "MOSFET", why: "Low standby power and easy to scale." },
            { q: "Gives the most transconductance for a given current.", a: "BJT", why: "gm = I/VT." },
            { q: "SiGe heterojunction versions reach hundreds of GHz in radio chips.", a: "BJT", why: "The HBT, a fast bipolar." }
        ],
        5,
        "fet-bjtq-done",
        "You know the two transistor families",
        "Bipolar: current-controlled, high gm. MOSFET: voltage-controlled, nearly no gate current.",
        "BJT is current-controlled, MOSFET is field-controlled. Hit Reset to try again."
    );


    /* ======================================
       UNIT 39: JFET AND HEMT
    ====================================== */

    SIMS["fet-jfet"] = function (root) {

        const defaults = { vgs: 0, vds: 2 };
        const state = { vgs: 0, vds: 2 };
        const VP = -3;
        const IDSS = 10;
        const seen = {};

        root.innerHTML =
            head("Try it: pinch a channel with a reverse-biased junction") +
            canvasFor(680, 330, "On the left, a cross-section of a junction field-effect transistor: an n-type channel between source and drain, with p-type gates above and below. A reverse voltage on the gate widens the depletion regions, shown in rose, which squeeze the channel. On the right, a transfer curve of drain current against gate voltage that falls to zero at the pinch-off voltage.") +
            '<div class="fd-stat-row">' + stat("Channel open", "open") + stat("Drain current", "id") + stat("Mode", "mode") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Gate voltage V<sub>GS</sub> (reverse bias)", key: "vgs", min: -3, max: 0, step: 0.05, value: 0 }) +
            slider({ label: "Drain voltage V<sub>DS</sub>", key: "vds", min: 0, max: 6, step: 0.1, value: 2 }) +
            "</div>" +
            '<p class="fd-sim-formula">A JFET is always on at zero gate bias (depletion mode). Reverse-biasing the gate p–n junction widens its depletion layer and squeezes the channel until it pinches off at V<sub>P</sub> = −3 V. In saturation I<sub>D</sub> = I<sub>DSS</sub>(1 − V<sub>GS</sub>/V<sub>P</sub>)². The gate current is just a reverse-biased diode leak. (I<sub>DSS</sub> = 10 mA, illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function id() {

            const a = 1 - state.vgs / VP;

            if (a <= 0) { return 0; }

            const x = state.vds / Math.abs(VP);

            if (state.vds >= a * Math.abs(VP)) { return IDSS * a * a; }

            return IDSS * (2 * a * x - x * x);
        }

        function depth(frac) {

            // depletion depth under the gate, in channel half-heights, at fraction frac along the channel
            const v = Math.abs(state.vgs) + state.vds * frac;

            return Math.min(1, Math.sqrt(v / Math.abs(VP)) * 0.85);
        }

        function update() {

            setVal(root, "vgs", state.vgs.toFixed(2) + " V");
            setVal(root, "vds", state.vds.toFixed(1) + " V");

            const i = id();
            const a = 1 - state.vgs / VP;
            const pinched = depth(1) >= 0.999 || a <= 0.001;

            seen[a < 0.1 ? "off" : state.vgs > -0.3 ? "on" : "mid"] = true;

            out(root, "open", Math.round((1 - depth(0)) * 100) + "% at the source end");
            out(root, "id", i.toFixed(2) + " mA");
            out(root, "mode", a <= 0.001 ? "cut off" : pinched ? "saturation (pinched at the drain)" : "triode");
            out(root, "verdict", a <= 0.001 ? "Fully pinched off: the depletion layers have met and the channel is gone" :
                state.vgs > -0.3 ? "Zero bias: the channel is wide open and the JFET conducts at its maximum" : "A reverse gate voltage squeezes the channel, and the current falls");

            if (seen.off && seen.on) {
                F.reward("fet-jfet", 10, "You pinched off a JFET");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const x0 = 40;
            const x1 = 340;
            const top = 90;
            const bot = 230;
            const mid = (top + bot) / 2;
            const half = (bot - top) / 2;

            ctx.fillStyle = TEAL + ".38)"; ctx.fillRect(x0, top, x1 - x0, bot - top);
            ctx.fillStyle = ROSE + ".25)"; ctx.fillRect(x0, top - 40, x1 - x0, 40); ctx.fillRect(x0, bot, x1 - x0, 40);
            txt(ctx, "p gate", (x0 + x1) / 2, top - 22, 12, TEXT + ".85)", "center", true);
            txt(ctx, "p gate", (x0 + x1) / 2, bot + 28, 12, TEXT + ".85)", "center", true);
            txt(ctx, "n channel", (x0 + x1) / 2, mid + 4, 12, TEXT + ".85)", "center", true);
            txt(ctx, "source", x0 + 8, 76, 11, TEXT + ".8)", "start");
            txt(ctx, "drain", x1 - 8, 76, 11, TEXT + ".8)", "end");

            // depletion regions
            ctx.fillStyle = ROSE + ".6)";
            ctx.beginPath();
            ctx.moveTo(x0, top);

            for (let u = 0; u <= 1.001; u += 0.05) { ctx.lineTo(x0 + u * (x1 - x0), top + depth(u) * half); }

            ctx.lineTo(x1, top);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x0, bot);

            for (let u = 0; u <= 1.001; u += 0.05) { ctx.lineTo(x0 + u * (x1 - x0), bot - depth(u) * half); }

            ctx.lineTo(x1, bot);
            ctx.closePath();
            ctx.fill();

            // current arrows through the open part
            const open = 1 - depth(0.5);
            const i = id();

            if (i > 0.05) {

                for (let k = 0; k < 3; k++) {

                    arrowLine(ctx, x0 + 30, mid + (k - 1) * open * half * 0.55, x1 - 30, mid + (k - 1) * open * half * 0.55, GOLD + ".9)", clamp(i / 4, 1, 4));
                }
            }

            // transfer curve
            const g = plot(ctx, {
                box: [420, 30, 230, 220], x: [-3, 0], y: [0, 11],
                xt: [[-3, "−3"], [-2, "−2"], [-1, "−1"], [0, "0"]], yt: [[0, "0"], [5, "5"], [10, "10"]],
                xl: "VGS (V)", yl: "ID (mA), saturation",
                curves: [{ pts: sample(function (v) { return IDSS * Math.pow(Math.max(1 - v / VP, 0), 2); }, -3, 0, 60), col: TEAL + ".98)", w: 3 }]
            });

            const a = Math.max(1 - state.vgs / VP, 0);

            dot(ctx, g.sx(state.vgs), g.sy(IDSS * a * a), 7, GOLD + "1)");
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-hemt"] = function (root) {

        const defaults = { al: 25, vg: 0 };
        const state = { al: 25, vg: 0 };
        const MU = 1800; // cm²/V·s
        const seen = {};
        const rand = mulberry(8);
        const parts = [];
        let t = 0;

        for (let i = 0; i < 26; i++) { parts.push({ u: rand(), v: rand() }); }

        root.innerHTML =
            head("Try it: a sheet of electrons with no donors") +
            canvasFor(680, 330, "An energy-band picture of an AlGaN/GaN heterojunction under a gate. The conduction band dips below the Fermi level at the interface, forming a triangular well that holds a two-dimensional electron gas. More aluminum deepens the well; a negative gate voltage lifts it above the Fermi level and empties it.") +
            '<div class="fd-stat-row">' + stat("Electron sheet density", "ns") + stat("Gate threshold", "vth") + stat("Sheet resistance", "rs") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Aluminum fraction in the AlGaN barrier", key: "al", min: 10, max: 40, step: 1, value: 25 }) +
            slider({ label: "Gate voltage", key: "vg", min: -7, max: 1, step: 0.1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">The two materials have different polarization, so a sheet of electrons collects at the interface with no dopants at all: n<sub>s</sub> ≈ 10<sup>13</sup> cm<sup>−2</sup> at 25% Al. With no ionized dopants to scatter them, the electrons reach mobilities near 2000 cm²/V·s, so a HEMT is fast and its channel is a very good conductor. The gate depletes the sheet like any other normally-on FET. (Illustrative numbers.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function ns0() { return 1e13 * state.al / 25; }
        function vth() { return -4.5 * state.al / 25; }
        function ns() { return ns0() * clamp(1 - state.vg / vth(), 0, 1.2); }

        function update() {

            setVal(root, "al", state.al + "%");
            setVal(root, "vg", state.vg.toFixed(1) + " V");

            const n = ns();
            const rs = n > 1e9 ? 1 / (1.602e-19 * n * MU) : Infinity;

            seen[n < 1e11 ? "off" : state.al > 33 ? "rich" : "mid"] = true;

            out(root, "ns", n > 1e9 ? H.sci(n) + " cm⁻²" : "≈ 0");
            out(root, "vth", vth().toFixed(1) + " V");
            out(root, "rs", isFinite(rs) ? rs.toFixed(0) + " Ω/□" : "open");
            out(root, "verdict", n < 1e11 ? "The well has been lifted above the Fermi level: the electron sheet is gone and the HEMT is off" :
                state.al > 33 ? "More aluminum, a deeper well, more electrons: lower resistance, but a more negative threshold" : "A dense, high-mobility electron sheet: the channel conducts with no donors at all");

            if (seen.off && seen.rich) {
                F.reward("fet-hemt", 10, "You emptied and filled a 2D electron gas");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const x0 = 60;
            const x1 = 620;
            const efY = 190;
            const barrierX = 300;
            const depth = clamp(ns() / 1e13 * 46, 0, 80); // px below the Fermi level
            const wellY = efY + depth - 4 + (ns() < 1e9 ? -14 : 0);
            const topY = efY - 120 - (state.vg > 0 ? 0 : 0) + state.vg * -6;

            // Fermi level
            ctx.strokeStyle = GOLD + ".9)"; ctx.setLineDash([6, 5]); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x0, efY); ctx.lineTo(x1, efY); ctx.stroke(); ctx.setLineDash([]);
            txt(ctx, "Fermi level", x1, efY - 8, 12, GOLD + "1)", "end", true);

            // regions
            ctx.fillStyle = BLUE + ".12)"; ctx.fillRect(x0, 50, barrierX - x0, 260);
            ctx.fillStyle = TEAL + ".10)"; ctx.fillRect(barrierX, 50, x1 - barrierX, 260);
            txt(ctx, "gate", x0 + 20, 70, 12, TEXT + ".8)", "start", true);
            txt(ctx, "AlGaN barrier", (x0 + barrierX) / 2 + 10, 300, 12, BLUE + "1)", "center", true);
            txt(ctx, "GaN channel", (barrierX + x1) / 2, 300, 12, TEAL + "1)", "center", true);

            // conduction band: slopes down through the barrier to the interface, then rises in the GaN
            ctx.strokeStyle = TEXT + ".95)"; ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(x0, topY);
            ctx.lineTo(barrierX - 2, wellY);
            ctx.quadraticCurveTo(barrierX + 50, wellY + 4, barrierX + 140, efY - 38 + Math.min(depth, 40) * 0.2);
            ctx.lineTo(x1, efY - 40);
            ctx.stroke();
            txt(ctx, "conduction band", x1, efY - 52, 12, TEXT + ".85)", "end", true);

            // electrons in the well
            if (ns() > 1e9) {

                const n = Math.round(clamp(ns() / 1e13 * 14, 1, 26));

                for (let i = 0; i < n; i++) {

                    const p = parts[i];
                    const x = barrierX + 4 + ((p.u + t * 0.18) % 1) * 90;
                    const y = Math.min(efY - 4, wellY + 4) + p.v * Math.max(4, efY - wellY - 4) * 0.8 + 8;

                    dot(ctx, x, clamp(y, wellY + 4, efY + 6), 3.6, "rgba(255,255,255,.95)");
                }

                txt(ctx, "two-dimensional electron gas", barrierX + 60, efY + 40 + Math.min(depth, 40), 12, TEAL + "1)", "center", true);
            }
        }

        animate(root, function (dt) { t += dt; draw(); });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    SIMS["fet-hemtq"] = quiz(
        "Game: JFET, MESFET or HEMT?",
        ["JFET", "MESFET", "HEMT"],
        [
            { q: "The gate is a reverse-biased p–n junction.", a: "JFET", why: "A junction gate." },
            { q: "The gate is a metal–semiconductor Schottky contact, usually on gallium arsenide.", a: "MESFET", why: "A Schottky gate." },
            { q: "A sheet of electrons forms at a heterojunction, with no dopants in the channel.", a: "HEMT", why: "A two-dimensional electron gas." },
            { q: "Powers 5G base stations and radar amplifiers with GaN.", a: "HEMT", why: "High frequency and high power." },
            { q: "Normally on: the channel conducts at zero gate voltage and a reverse bias pinches it off.", a: "JFET", why: "A depletion-mode device." },
            { q: "The pinch-off voltage describes when the channel closes.", a: "JFET", why: "The gate depletion layers meet." }
        ],
        5,
        "fet-hemtq-done",
        "You can name the field-effect cousins",
        "Junction gate, Schottky gate, or heterojunction channel: three ways to control a channel.",
        "JFET: junction gate. MESFET: Schottky gate. HEMT: heterojunction. Hit Reset to try again."
    );


    /* ======================================
       UNIT 40: POWER TRANSISTORS
    ====================================== */

    const POWER = {
        si: { name: "Silicon", ec: 3e5, mu: 1350, eps: 11.7, col: GREY },
        sic: { name: "Silicon carbide", ec: 2.5e6, mu: 900, eps: 9.7, col: TEAL },
        gan: { name: "Gallium nitride", ec: 3.3e6, mu: 1500, eps: 9.0, col: GOLD }
    };

    function ronSp(key, vb) {

        const m = POWER[key];

        // ideal one-dimensional limit, ohm·cm²
        return 4 * vb * vb / (m.eps * 8.854e-14 * m.mu * Math.pow(m.ec, 3));
    }

    SIMS["fet-driftlimit"] = function (root) {

        const defaults = { vb: 600, mat: "si" };
        const state = { vb: 600, mat: "si" };
        const seen = {};

        root.innerHTML =
            head("Try it: how much silicon does it take to block voltage?") +
            canvasFor(680, 340, "On the left, a vertical power transistor drawn to scale: the drift region must be thicker to block more voltage, and thicker for silicon than for silicon carbide or gallium nitride. On the right, a log graph of ideal specific on-resistance against blocking voltage for the three materials. The wide-bandgap materials sit several orders of magnitude below silicon.") +
            '<div class="fd-stat-row">' + stat("Drift layer thickness", "t") + stat("Ideal on-resistance × area", "ron") + stat("vs silicon at this voltage", "vs") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Material", "mat", [["si", "Silicon (E<sub>c</sub> 0.3 MV/cm)"], ["sic", "SiC (≈ 2.5 MV/cm)"], ["gan", "GaN (≈ 3.3 MV/cm)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Blocking voltage", key: "vb", min: 50, max: 3000, step: 10, value: 600 }) +
            "</div>" +
            '<p class="fd-sim-formula">The drift region must hold the off-state voltage below the material\'s critical field E<sub>c</sub>, so it needs a thickness of about 2V<sub>B</sub>/E<sub>c</sub> and light doping. That sets a limit R<sub>on,sp</sub> = 4V<sub>B</sub>²/(εμE<sub>c</sub>³): resistance grows as V<sub>B</sub>², and falls as E<sub>c</sub><sup>3</sup>, which is why wide-bandgap materials win. (Ideal limits; real devices are several times worse.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function thick(key, vb) { return 2 * vb / POWER[key].ec * 1e4; } // µm

        function update() {

            seen[state.mat] = true;

            setVal(root, "vb", state.vb + " V");

            const r = ronSp(state.mat, state.vb);
            const rsi = ronSp("si", state.vb);

            out(root, "t", thick(state.mat, state.vb).toFixed(1) + " µm");
            out(root, "ron", H.sci(r * 1000) + " mΩ·cm²");
            out(root, "vs", state.mat === "si" ? "reference" : "÷ " + Math.round(rsi / r));
            out(root, "verdict", state.mat === "si" ? "Silicon needs a thick, lightly doped layer to hold this voltage, and pays for it in resistance" :
                "A much higher critical field means a thinner, more heavily doped layer: " + Math.round(rsi / r) + " times lower ideal resistance than silicon");

            if (seen.si && seen.sic && seen.gan) {
                F.reward("fet-driftlimit", 10, "You compared three materials at one voltage");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const m = POWER[state.mat];
            const tp = clamp(thick(state.mat, state.vb), 0.3, 220);
            const px = clamp(tp * 1.2, 5, 215);

            // device slab
            ctx.fillStyle = GOLD + ".7)"; ctx.fillRect(30, 40, 200, 22);
            txt(ctx, "source + gate", 130, 56, 11, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = ROSE + ".5)"; ctx.fillRect(30, 62, 200, 14);
            txt(ctx, "channel", 130, 73, 10, TEXT + ".9)");
            ctx.fillStyle = m.col + ".55)"; ctx.fillRect(30, 76, 200, px);
            txt(ctx, "drift region " + tp.toFixed(1) + " µm", 130, 76 + px / 2 + 4, 12, TEXT + ".95)", "center", true);
            ctx.fillStyle = TEAL + ".4)"; ctx.fillRect(30, 76 + px, 200, 20);
            txt(ctx, "substrate + drain", 130, 76 + px + 14, 11, TEXT + ".9)", "center", true);

            // log-log plot
            const g = plot(ctx, {
                box: [330, 30, 320, 240], x: [50, 3000], y: [1e-5, 1e2], logx: true, logy: true,
                xt: [[100, "100"], [300, "300"], [1000, "1000"], [3000, "3000 V"]], yt: [[1e-4, "10⁻⁴"], [1e-2, "10⁻²"], [1, "1"], [100, "100"]],
                xl: "blocking voltage (V)", yl: "ideal Ron,sp (Ω·cm²)",
                curves: ["si", "sic", "gan"].map(function (k) {

                    return {
                        pts: sample(function (v) { return ronSp(k, Math.exp(v)); }, Math.log(50), Math.log(3000), 40).map(function (p) { return [Math.exp(p[0]), p[1]]; }),
                        col: POWER[k].col + (k === state.mat ? ".98)" : ".5)"),
                        w: k === state.mat ? 3.6 : 1.8
                    };
                })
            });

            dot(ctx, g.sx(state.vb), g.sy(clamp(ronSp(state.mat, state.vb), 1e-5, 1e2)), 7, ROSE + "1)");
            [["si", "Si"], ["sic", "SiC"], ["gan", "GaN"]].forEach(function (k, i) {
                txt(ctx, k[1], 640, 50 + i * 16, 12, POWER[k[0]].col + "1)", "end", true);
            });
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-switchloss"] = function (root) {

        const defaults = { f: 4.5, dev: "sic" };
        const state = { f: 4.5, dev: "sic" };
        const seen = {};
        const I = 10;
        // [conduction loss at 10 A in W, switching energy per cycle in µJ at 400 V and 10 A]
        const DEV = {
            igbt: { name: "Silicon IGBT", pc: 0.9 * I + 0.04 * I * I, esw: 400, col: ROSE },
            sj: { name: "Si superjunction MOSFET", pc: 0.10 * I * I, esw: 120, col: GREY },
            sic: { name: "SiC MOSFET", pc: 0.06 * I * I, esw: 40, col: TEAL },
            gan: { name: "GaN HEMT", pc: 0.05 * I * I, esw: 15, col: GOLD }
        };

        root.innerHTML =
            head("Try it: where does the energy go in a switch?") +
            canvasFor(680, 340, "A graph of total power loss against switching frequency, on log axes, for four power devices at 400 volts and 10 amps. At low frequency conduction loss dominates and all the curves are flat. As frequency rises the switching loss takes over and the curves climb, the IGBT first and the GaN device last.") +
            '<div class="fd-stat-row">' + stat("Conduction loss", "pc") + stat("Switching loss", "ps") + stat("Total loss", "pt") + stat("Efficiency of a 4 kW stage", "eff") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Device", "dev", [["igbt", "Si IGBT"], ["sj", "Si MOSFET"], ["sic", "SiC MOSFET"], ["gan", "GaN HEMT"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Switching frequency", key: "f", min: 3, max: 6, step: 0.05, value: 4.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">P<sub>loss</sub> = P<sub>cond</sub> + E<sub>sw</sub>·f. Conduction loss (I²R<sub>on</sub>, or V·I for an IGBT) does not depend on frequency. Switching loss grows linearly with it, so fast devices with small switching energy can run at higher frequencies, which lets designers shrink the magnetics and capacitors. (Illustrative values, 10 A.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function loss(k, f) { return DEV[k].pc + DEV[k].esw * 1e-6 * f; }

        function update() {

            seen[state.dev] = true;

            const f = Math.pow(10, state.f);

            setVal(root, "f", f >= 1e6 ? "1 MHz" : f >= 1e3 ? (f / 1e3).toFixed(f >= 1e4 ? 0 : 1) + " kHz" : f.toFixed(0) + " Hz");

            const d = DEV[state.dev];
            const ps = d.esw * 1e-6 * f;

            out(root, "pc", d.pc.toFixed(1) + " W");
            out(root, "ps", ps.toFixed(ps < 10 ? 1 : 0) + " W");
            out(root, "pt", (d.pc + ps).toFixed(d.pc + ps < 10 ? 1 : 0) + " W");
            out(root, "eff", (100 * (1 - (d.pc + ps) / 4000)).toFixed(1) + "%");
            out(root, "verdict", ps > d.pc * 2 ? "Switching loss dominates: this device cannot run this fast without overheating" :
                ps < d.pc * 0.3 ? "Conduction loss dominates: you could switch faster for free" : "Conduction and switching loss are balanced: the sweet spot for this device");

            if (seen.igbt && seen.gan && state.f > 5) {
                F.reward("fet-switchloss", 10, "You ran four devices at high frequency");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const f = Math.pow(10, state.f);
            const g = plot(ctx, {
                box: [86, 24, 560, 230], x: [1e3, 1e6], y: [1, 1000], logx: true, logy: true,
                xt: [[1e3, "1 kHz"], [1e4, "10 kHz"], [1e5, "100 kHz"], [1e6, "1 MHz"]], yt: [[1, "1 W"], [10, "10 W"], [100, "100 W"], [1000, "1 kW"]],
                xl: "switching frequency", yl: "total loss per switch",
                curves: Object.keys(DEV).map(function (k) {

                    return {
                        pts: sample(function (e) { return loss(k, Math.pow(10, e)); }, 3, 6, 50).map(function (p) { return [Math.pow(10, p[0]), p[1]]; }),
                        col: DEV[k].col + (k === state.dev ? ".98)" : ".45)"),
                        w: k === state.dev ? 3.8 : 1.8
                    };
                })
            });

            ctx.strokeStyle = TEXT + ".4)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(g.sx(f), 24); ctx.lineTo(g.sx(f), 254); ctx.stroke(); ctx.setLineDash([]);
            dot(ctx, g.sx(f), g.sy(loss(state.dev, f)), 7, TEXT + ".98)");

            Object.keys(DEV).forEach(function (k, i) {
                txt(ctx, DEV[k].name, 100, 44 + i * 16, 12, DEV[k].col + "1)", "start", true);
            });
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-powerq"] = quiz(
        "Game: pick the power device",
        ["Silicon IGBT", "Silicon power MOSFET", "SiC MOSFET", "GaN HEMT"],
        [
            { q: "An electric-vehicle traction inverter at 800 V.", a: "SiC MOSFET", why: "High voltage with low loss." },
            { q: "A compact laptop charger switching at several hundred kHz.", a: "GaN HEMT", why: "Tiny switching energy." },
            { q: "A grid or industrial drive running at a few kHz and many amps.", a: "Silicon IGBT", why: "Low conduction voltage drop at high current." },
            { q: "A 12 V motor driver or computer-supply stage.", a: "Silicon power MOSFET", why: "Cheap and mature at low voltage." },
            { q: "A MOS gate controlling a bipolar output, so current is carried by both electrons and holes.", a: "Silicon IGBT", why: "Conductivity modulation." },
            { q: "Wide bandgap with a high critical field, grown on silicon carbide wafers.", a: "SiC MOSFET", why: "About 2.5 MV/cm." }
        ],
        5,
        "fet-powerq-done",
        "You can match a device to its job",
        "IGBT for big and slow, silicon MOSFET for low voltage, SiC for high voltage, GaN for fast and small.",
        "IGBT: big and slow. Si MOSFET: low voltage. SiC: high voltage. GaN: fast and small. Hit Reset to try again."
    );


    /* ======================================
       UNIT 41: THIN-FILM TRANSISTORS
    ====================================== */

    const TFT = {
        asi: { name: "Amorphous silicon", mu: 0.7, ioff: 1e-13, col: GREY, use: "Large LCD panels: slow, cheap, and uniform over a big glass sheet" },
        ltps: { name: "Low-temperature poly-Si", mu: 80, ioff: 1e-11, col: BLUE, use: "Phone OLED and LCD drivers: fast enough for integrated driver circuits" },
        igzo: { name: "Oxide (IGZO)", mu: 12, ioff: 1e-16, col: TEAL, use: "High-resolution and low-refresh displays: very low leakage, good uniformity" },
        org: { name: "Organic semiconductor", mu: 1, ioff: 1e-12, col: GOLD, use: "Flexible, printed electronics: low temperature, rough performance" }
    };

    SIMS["fet-pixel"] = function (root) {

        const defaults = { mat: "ltps", hz: 60 };
        const state = { mat: "ltps", hz: 60 };
        const seen = {};
        const CS = 2e-13; // storage capacitor, farads
        const V0 = 3;
        let t = 0;

        root.innerHTML =
            head("Try it: a display pixel is a leaky capacitor") +
            canvasFor(680, 330, "On the left, one pixel of an active-matrix display: a thin-film transistor switch between the data line and a storage capacitor, switched by the row line. On the right, a graph of the voltage held on the pixel over time. After each refresh the voltage droops because the off transistor leaks, and the droop is larger for a leakier transistor or a slower refresh rate.") +
            '<div class="fd-stat-row">' + stat("Off current", "ioff") + stat("Droop between refreshes", "droop") + stat("Visible flicker?", "flick") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Transistor", "mat", [["asi", "Amorphous Si"], ["ltps", "Low-temp poly-Si"], ["igzo", "Oxide (IGZO)"], ["org", "Organic"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Refresh rate", key: "hz", min: 1, max: 120, step: 1, value: 60 }) +
            "</div>" +
            '<p class="fd-sim-formula">The row line turns the TFT on, the data line charges the storage capacitor, and then the TFT turns off and the capacitor must hold its voltage until the next refresh: ΔV = I<sub>off</sub>·T ÷ C<sub>s</sub>. A smaller off current allows a lower refresh rate, which saves power. (C<sub>s</sub> = 0.2 pF, illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function droop() { return TFT[state.mat].ioff / state.hz / CS; }

        function update() {

            seen[state.mat] = true;

            setVal(root, "hz", state.hz + " Hz");

            const d = droop();
            const frac = d / V0;

            out(root, "ioff", H.sci(TFT[state.mat].ioff) + " A");
            out(root, "droop", d < 1e-3 ? "< 1 mV" : (d * 1000).toFixed(0) + " mV (" + (frac * 100).toFixed(1) + "%)");
            out(root, "flick", frac > 0.03 ? "yes: the brightness sags between refreshes" : "no");
            out(root, "verdict", frac > 0.15 ? "Heavy droop: this transistor leaks too much for this refresh rate, so the pixel loses its brightness" :
                frac > 0.03 ? "Visible sag: raise the refresh rate, or use a lower-leakage transistor" :
                    state.hz < 10 ? "Almost no droop even at a very slow refresh: a low-power display" : "The pixel holds its charge between refreshes");

            if (seen.asi && seen.igzo && state.hz <= 10) {
                F.reward("fet-pixel", 10, "You ran a pixel at a low refresh rate");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const frac = Math.min(droop() / V0, 1);

            // pixel schematic
            txt(ctx, "row line (gate)", 30, 44, 12, TEXT + ".8)", "start");
            ctx.strokeStyle = GOLD + ".8)"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(30, 54); ctx.lineTo(260, 54); ctx.stroke();
            ctx.strokeStyle = TEXT + ".5)"; ctx.lineWidth = 2.4;
            ctx.beginPath(); ctx.moveTo(150, 54); ctx.lineTo(150, 100); ctx.stroke();
            txt(ctx, "data line", 30, 140, 12, TEXT + ".8)", "start");
            ctx.strokeStyle = BLUE + ".85)"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(30, 150); ctx.lineTo(120, 150); ctx.stroke();

            box(ctx, 120, 100, 60, 60, TFT[state.mat].col + ".7)", GREY + ".7)");
            txt(ctx, "TFT", 150, 136, 14, TEXT + ".95)", "center", true);

            ctx.strokeStyle = TEXT + ".6)"; ctx.lineWidth = 2.4;
            ctx.beginPath(); ctx.moveTo(180, 150); ctx.lineTo(230, 150); ctx.lineTo(230, 180); ctx.stroke();

            // storage capacitor with a level
            ctx.fillStyle = (frac > 0.03 ? ROSE : TEAL) + ".6)";
            const lvl = (1 - frac) * 80;

            ctx.fillRect(210, 260 - lvl, 40, lvl);
            ctx.strokeStyle = TEXT + ".85)"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(204, 180); ctx.lineTo(256, 180); ctx.moveTo(204, 188); ctx.lineTo(256, 188); ctx.stroke();
            ctx.strokeRect(210, 180, 40, 80);
            txt(ctx, "storage capacitor", 230, 282, 12, TEXT + ".85)");
            txt(ctx, "pixel brightness: " + Math.round((1 - frac / 2) * 100) + "%", 230, 304, 13, (frac > 0.03 ? ROSE : TEAL) + "1)", "center", true);

            // droop plot
            const T = 1 / state.hz;
            const win = 3 * T;
            const g = plot(ctx, {
                box: [360, 40, 290, 200], x: [0, win], y: [0, 3.3],
                xt: [[0, "0"], [win / 3, ""], [win * 2 / 3, ""], [win, ""]], yt: [[0, "0"], [1.5, "1.5"], [3, "3"]],
                xl: "three refresh periods", yl: "pixel voltage (V)",
                curves: [{
                    pts: (function () {

                        const pts = [];

                        for (let k = 0; k < 3; k++) {

                            pts.push([k * T, V0]);
                            pts.push([(k + 1) * T - T * 1e-3, V0 - droop()]);
                        }

                        return pts;
                    }()),
                    col: TFT[state.mat].col + ".98)", w: 3.4
                }]
            });

            const ph = (t % 3);
            const x = ph / 3 * win;

            dot(ctx, g.sx(x), g.sy(V0 - droop() * ((x % T) / T)), 6, GOLD + "1)");
        }

        animate(root, function (dt) { t += dt; draw(); });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    SIMS["fet-tftmob"] = function (root) {

        const defaults = { mat: "igzo" };
        const state = { mat: "igzo" };
        const seen = {};
        const REF = { name: "Crystalline silicon (for reference)", mu: 300, col: TEXT };

        root.innerHTML =
            head("Try it: what does each film offer?") +
            canvasFor(680, 300, "A bar chart on a log scale of carrier mobility for four thin-film transistor technologies and, for reference, crystalline silicon. Amorphous silicon and organic films are slowest, oxide semiconductors are in the middle, low-temperature polysilicon is fastest, and a wafer is faster still.") +
            '<div class="fd-stat-row">' + stat("Mobility", "mu") + stat("Off current (per device)", "ioff") + stat("Best for", "use") + "</div>" +
            seg("Technology", "mat", [["asi", "Amorphous Si"], ["ltps", "Low-temp poly-Si"], ["igzo", "Oxide (IGZO)"], ["org", "Organic"]]) +
            '<p class="fd-sim-formula">Thin-film transistors are deposited on glass or plastic at well below the melting point of the substrate, so they cannot be crystalline silicon. Their mobility is far lower than a wafer\'s, but they can cover a panel the size of a wall. Ratings are typical figures, illustrative.</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function update() {

            seen[state.mat] = true;

            const d = TFT[state.mat];

            out(root, "mu", d.mu >= 1 ? "≈ " + d.mu + " cm²/V·s" : "≈ " + d.mu + " cm²/V·s");
            out(root, "ioff", H.sci(d.ioff) + " A");
            out(root, "use", d.use);

            if (seen.asi && seen.ltps && seen.igzo && seen.org) {
                F.reward("fet-tftmob", 10, "You compared the four thin-film technologies");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 300);

            const items = [TFT.org, TFT.asi, TFT.igzo, TFT.ltps, REF];
            const keys = ["org", "asi", "igzo", "ltps", "ref"];
            const x0 = 250;
            const sx = function (v) { return x0 + (Math.log10(v) + 1) / 3.7 * 400; };

            [0.1, 1, 10, 100, 1000].forEach(function (v) {

                ctx.strokeStyle = GREY + ".25)"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(sx(v), 24); ctx.lineTo(sx(v), 250); ctx.stroke();
                txt(ctx, String(v), sx(v), 268, 11, TEXT + ".7)");
            });

            txt(ctx, "mobility (cm²/V·s, log scale)", 450, 290, 12, TEXT + ".8)");

            items.forEach(function (d, i) {

                const y = 34 + i * 42;
                const on = keys[i] === state.mat;

                txt(ctx, d.name, x0 - 10, y + 22, 12, TEXT + (on ? "1)" : ".75)"), "end", on);
                ctx.fillStyle = d.col + (on ? ".95)" : ".45)");
                ctx.fillRect(x0, y, sx(d.mu) - x0, 30);
                txt(ctx, "≈ " + d.mu, sx(d.mu) + 6, y + 21, 12, TEXT + ".9)", "start", on);
            });
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-tftq"] = quiz(
        "Game: which thin-film transistor?",
        ["Amorphous silicon", "Low-temperature poly-Si", "Oxide (IGZO)", "Organic"],
        [
            { q: "The workhorse of large, low-cost LCD televisions.", a: "Amorphous silicon", why: "Cheap and uniform, but slow." },
            { q: "Fast enough to put the display's own driver circuits on the glass, as in many phone panels.", a: "Low-temperature poly-Si", why: "Mobility around 50 to 100." },
            { q: "Extremely low leakage lets the screen refresh at 1 Hz and save power.", a: "Oxide (IGZO)", why: "Off current near 10⁻¹⁶ A." },
            { q: "Can be printed on flexible plastic at low temperatures.", a: "Organic", why: "Soft chemistry on a soft substrate." },
            { q: "A mobility near 0.5 to 1 cm²/V·s, about a thousandth of a wafer's.", a: "Amorphous silicon", why: "Disordered bonds trap carriers." },
            { q: "A good partner for OLED pixels at high resolution, with decent mobility and uniformity.", a: "Oxide (IGZO)", why: "A balance of mobility, leakage and uniformity." }
        ],
        5,
        "fet-tftq-done",
        "You can match a film to a display",
        "Amorphous for cheap and big, poly-Si for fast, oxide for leakage-tight, organic for flexible.",
        "a-Si: cheap. LTPS: fast. Oxide: leak-tight. Organic: flexible. Hit Reset to try again."
    );


    /* ======================================
       UNIT 42: CARBON NANOTUBES AND 2D MATERIALS
    ====================================== */

    SIMS["fet-cnt"] = function (root) {

        const defaults = { n: 13, m: 0 };
        const state = { n: 13, m: 0 };
        const seen = {};

        root.innerHTML =
            head("Try it: roll up a sheet of graphene") +
            canvasFor(680, 330, "On the left, the end-on circle of a carbon nanotube whose size follows its diameter. On the right, an energy band diagram: a semiconducting tube has a gap between its valence and conduction bands, drawn as two curves, and a metallic tube has bands that touch.") +
            '<div class="fd-stat-row">' + stat("Chirality (n, m)", "nm") + stat("Diameter", "d") + stat("Type", "type") + stat("Band gap", "eg") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Index n", key: "n", min: 3, max: 20, step: 1, value: 13 }) +
            slider({ label: "Index m", key: "m", min: 0, max: 20, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">A nanotube is a graphene sheet rolled along the chiral vector (n, m). Its diameter is d = 0.0783·√(n² + nm + m²) nm. If (n − m) is a multiple of 3 the tube is metallic; otherwise it is semiconducting with E<sub>g</sub> ≈ 0.84/d eV. Growing tubes of a chosen (n, m) is the hard part: a random mix is one-third metallic. (m ≤ n here.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function calc() {

            const m = Math.min(state.m, state.n);
            const d = 0.0783 * Math.sqrt(state.n * state.n + state.n * m + m * m);
            const metal = (state.n - m) % 3 === 0;

            return { m: m, d: d, metal: metal, eg: metal ? 0 : 0.84 / d };
        }

        function update() {

            setVal(root, "n", state.n);
            setVal(root, "m", Math.min(state.m, state.n));

            const c = calc();

            seen[c.metal ? "metal" : "semi"] = true;

            out(root, "nm", "(" + state.n + ", " + c.m + ")");
            out(root, "d", c.d.toFixed(2) + " nm");
            out(root, "type", c.metal ? "metallic" : "semiconducting");
            out(root, "eg", c.metal ? "none" : c.eg.toFixed(2) + " eV");
            out(root, "verdict", c.metal ? "Metallic: the bands touch, so this tube cannot be switched off. In a transistor it is a short circuit" :
                c.eg > 0.5 ? "A wide gap: it switches off well, but it is a thin tube" :
                    c.eg > 0.3 ? "A usable gap, near silicon's 1.1 eV scaled down: a good transistor channel" : "A small gap: this tube leaks, since thermal energy can bridge it");

            if (seen.metal && seen.semi) {
                F.reward("fet-cnt", 10, "You found a metallic and a semiconducting tube");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const c = calc();
            const r = clamp(c.d * 42, 14, 110);

            ctx.strokeStyle = (c.metal ? ROSE : TEAL) + ".95)"; ctx.lineWidth = 8;
            ctx.beginPath(); ctx.arc(150, 160, r, 0, Math.PI * 2); ctx.stroke();

            for (let i = 0; i < 24; i++) {

                const a = i / 24 * Math.PI * 2;

                dot(ctx, 150 + r * Math.cos(a), 160 + r * Math.sin(a), 2.8, TEXT + ".85)");
            }

            txt(ctx, "d = " + c.d.toFixed(2) + " nm", 150, 160 + r + 30, 13, TEXT + ".9)", "center", true);
            txt(ctx, c.metal ? "metallic" : "semiconducting", 150, 30, 14, (c.metal ? ROSE : TEAL) + "1)", "center", true);

            // band diagram: E = ±sqrt((Eg/2)² + (v k)²)
            const x0 = 340;
            const x1 = 640;
            const yc = 170;
            const kx = function (u) { return x0 + (u + 1) / 2 * (x1 - x0); };

            ctx.strokeStyle = GREY + ".35)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x0, yc); ctx.lineTo(x1, yc); ctx.stroke();
            txt(ctx, "momentum k →", x1, yc + 14, 11, TEXT + ".7)", "end");
            txt(ctx, "energy ↑", x0, 36, 11, TEXT + ".7)", "start");

            [1, -1].forEach(function (sgn) {

                ctx.strokeStyle = (sgn > 0 ? GOLD : BLUE) + ".98)"; ctx.lineWidth = 3.2;
                ctx.beginPath();

                for (let u = -1; u <= 1.001; u += 0.02) {

                    const e = Math.sqrt(Math.pow(c.eg / 2, 2) + Math.pow(u * 0.55, 2));

                    if (u === -1) { ctx.moveTo(kx(u), yc - sgn * e * 130); } else { ctx.lineTo(kx(u), yc - sgn * e * 130); }
                }

                ctx.stroke();
            });

            txt(ctx, "conduction band", x1, yc - 100, 11, GOLD + "1)", "end", true);
            txt(ctx, "valence band", x1, yc + 112, 11, BLUE + "1)", "end", true);

            if (!c.metal) {

                arrowLine(ctx, kx(0), yc - c.eg / 2 * 130 + 4, kx(0), yc + c.eg / 2 * 130 - 4, TEXT + ".8)", 2);
                arrowLine(ctx, kx(0), yc + c.eg / 2 * 130 - 4, kx(0), yc - c.eg / 2 * 130 + 4, TEXT + ".8)", 2);
                txt(ctx, "Eg = " + c.eg.toFixed(2) + " eV", kx(0) + 10, yc + 4, 12, TEXT + ".95)", "start", true);
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-thin"] = function (root) {

        const defaults = { t: 3 };
        const state = { t: 3 };
        const seen = {};
        const TOX = 1; // nm of equivalent oxide

        root.innerHTML =
            head("Try it: how thin can the channel be?") +
            canvasFor(680, 330, "Two graphs against channel thickness. On the left, the shortest gate length that can still be controlled falls as the channel gets thinner, for silicon and for a two-dimensional semiconductor. On the right, carrier mobility: silicon collapses below about 5 nanometers, while the two-dimensional material keeps its mobility down to a single atomic layer.") +
            '<div class="fd-stat-row">' + stat("Silicon: shortest L", "lsi") + stat("Silicon: mobility", "musi") + stat("2D material: shortest L", "l2") + stat("2D material: mobility", "mu2") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Channel thickness", key: "t", min: 0.65, max: 10, step: 0.05, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">A thinner channel shrinks the natural length, λ = √((ε<sub>ch</sub>/ε<sub>ox</sub>) · t<sub>ch</sub> · t<sub>ox</sub>), so a shorter gate still works: L<sub>min</sub> ≈ 6λ. But silicon\'s mobility collapses below about 5 nm, because carriers scatter off the rough surfaces. A layered semiconductor such as MoS₂ has no dangling bonds, so it can be a single atomic layer (0.65 nm) and keep its mobility. (Illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function lmin(t, eps) { return 6 * Math.sqrt(eps / 3.9 * t * TOX); }
        function muSi(t) { return 400 / (1 + Math.pow(5 / t, 4)); }
        function mu2d() { return 40; }

        function update() {

            setVal(root, "t", state.t.toFixed(2) + " nm");

            seen[state.t < 1.5 ? "thin" : state.t > 7 ? "thick" : "mid"] = true;

            out(root, "lsi", lmin(state.t, 11.7).toFixed(0) + " nm");
            out(root, "musi", muSi(state.t).toFixed(0) + " cm²/V·s");
            out(root, "l2", lmin(Math.min(state.t, 5), 4.5).toFixed(0) + " nm");
            out(root, "mu2", mu2d() + " cm²/V·s");
            out(root, "verdict", state.t < 1.5 ? "Silicon this thin is hopeless: its mobility has collapsed. The 2D layer keeps its mobility and its short-channel control" :
                state.t < 5 ? "Silicon gets short-channel control here, but is losing mobility fast" : "Plenty of mobility, but a thick silicon channel needs a longer gate");

            if (seen.thin && seen.thick) {
                F.reward("fet-thin", 10, "You thinned the channel and watched silicon give out");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const g1 = plot(ctx, {
                box: [60, 30, 240, 220], x: [0.5, 10], y: [0, 60],
                xt: [[1, "1"], [3, "3"], [5, "5"], [10, "10"]], yt: [[0, "0"], [20, "20"], [40, "40"], [60, "60"]],
                xl: "channel thickness (nm)", yl: "shortest gate length (nm)",
                curves: [
                    { pts: sample(function (t) { return lmin(t, 11.7); }, 0.5, 10, 60), col: GREY + ".98)", w: 3 },
                    { pts: sample(function (t) { return lmin(Math.min(t, 5), 4.5); }, 0.65, 10, 60), col: TEAL + ".98)", w: 3 }
                ]
            });

            dot(ctx, g1.sx(state.t), g1.sy(Math.min(lmin(state.t, 11.7), 60)), 6, GREY + "1)");
            dot(ctx, g1.sx(state.t), g1.sy(lmin(Math.min(state.t, 5), 4.5)), 6, TEAL + "1)");

            const g2 = plot(ctx, {
                box: [390, 30, 250, 220], x: [0.5, 10], y: [0, 450],
                xt: [[1, "1"], [3, "3"], [5, "5"], [10, "10"]], yt: [[0, "0"], [200, "200"], [400, "400"]],
                xl: "channel thickness (nm)", yl: "mobility (cm²/V·s)",
                curves: [
                    { pts: sample(muSi, 0.5, 10, 60), col: GREY + ".98)", w: 3 },
                    { pts: [[0.65, mu2d()], [5, mu2d()]], col: TEAL + ".98)", w: 3 }
                ]
            });

            dot(ctx, g2.sx(state.t), g2.sy(muSi(state.t)), 6, GREY + "1)");
            dot(ctx, g2.sx(Math.min(state.t, 5)), g2.sy(mu2d()), 6, TEAL + "1)");

            txt(ctx, "silicon", 290, 48, 12, GREY + "1)", "end", true);
            txt(ctx, "2D material", 290, 64, 12, TEAL + "1)", "end", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-cntq"] = quiz(
        "Game: graphene, nanotube or MoS₂?",
        ["Graphene", "Carbon nanotube", "MoS₂ monolayer"],
        [
            { q: "A single sheet of carbon atoms with no band gap.", a: "Graphene", why: "Great conductor, poor switch." },
            { q: "A rolled-up sheet whose diameter and chirality set its gap.", a: "Carbon nanotube", why: "Roughly 0.84/d eV." },
            { q: "A layered semiconductor 0.65 nm thick with a gap near 1.8 eV.", a: "MoS₂ monolayer", why: "A true two-dimensional semiconductor." },
            { q: "One in three random ones is metallic, which is a problem for a switch.", a: "Carbon nanotube", why: "Set by (n − m) mod 3." },
            { q: "Its zero gap makes it hard to turn a transistor fully off.", a: "Graphene", why: "No gap, no off state." },
            { q: "Contact resistance and wafer-scale growth are the big open problems.", a: "MoS₂ monolayer", why: "Putting low-resistance metal on it is hard." }
        ],
        5,
        "fet-cntq-done",
        "You know the three channel candidates",
        "Graphene conducts, nanotubes depend on chirality, and MoS₂ is a true 2D semiconductor.",
        "Graphene: no gap. Nanotube: chirality. MoS₂: 2D semiconductor. Hit Reset to try again."
    );


    /* ======================================
       UNIT 43: STEEP-SLOPE DEVICES
    ====================================== */

    function steepCur(dev, v, a) {

        let cur;

        if (dev === "tfet") {

            if (v < 0.105) { cur = 1e-12 * Math.pow(10, v / 0.035); } else { cur = 1e-9 * Math.pow(10, (v - 0.105) / 0.08); }

            return 1 / (1 / cur + 1 / 1e-6);
        }

        const s = dev === "nc" ? 0.060 / a : 0.060;

        cur = 1e-12 * Math.pow(10, v / s);

        return 1 / (1 / cur + 1 / 1e-4);
    }

    SIMS["fet-steep"] = function (root) {

        const defaults = { dev: "mos", a: 1.8, vdd: 0.5 };
        const state = { dev: "mos", a: 1.8, vdd: 0.5 };
        const seen = {};

        root.innerHTML =
            head("Try it: break the 60 mV per decade limit") +
            canvasFor(680, 340, "A graph of drain current on a log scale against gate voltage for three devices. A conventional MOSFET rises one decade for every 60 millivolts. A tunnel FET rises faster at first but runs out of current. A negative-capacitance FET rises faster by an amplification factor all the way up.") +
            '<div class="fd-stat-row">' + stat("Best swing", "s") + stat("Gate swing for five decades", "dv") + stat("On current at the chosen V<sub>DD</sub>", "ion") + stat("Switching energy vs MOSFET", "en") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Device", "dev", [["mos", "Conventional MOSFET"], ["tfet", "Tunnel FET"], ["nc", "Negative-capacitance FET"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Voltage amplification A (negative-capacitance FET)", key: "a", min: 1, max: 3, step: 0.1, value: 1.8 }) +
            slider({ label: "Supply voltage V<sub>DD</sub>", key: "vdd", min: 0.2, max: 0.8, step: 0.01, value: 0.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Thermal carriers limit a MOSFET to S ≥ (kT/q)·ln 10 ≈ 60 mV/dec. To beat it, change the mechanism: a tunnel FET injects carriers by band-to-band tunneling, and a ferroelectric gate layer can amplify the internal gate voltage by A, so S = 60/A. Switching energy scales as V². (Teaching curves, not measured data.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function cur(v) { return steepCur(state.dev, v, state.a); }

        function vAt(dev, i) {

            for (let v = 0; v <= 1.2; v += 0.001) { if (steepCur(dev, v, state.a) >= i) { return v; } }

            return Infinity;
        }

        function update() {

            setVal(root, "a", state.a.toFixed(1) + "×");
            setVal(root, "vdd", state.vdd.toFixed(2) + " V");

            seen[state.dev] = true;

            let smin = 1e9;

            for (let v = 0.01; v < 0.5; v += 0.005) {

                const sl = 0.005 / (Math.log10(cur(v + 0.005)) - Math.log10(cur(v)));

                if (sl > 0 && sl < smin) { smin = sl; }
            }

            const dv = vAt(state.dev, 1e-7) - vAt(state.dev, 1e-12);
            const base = vAt("mos", 1e-7) - vAt("mos", 1e-12);

            out(root, "s", (smin * 1000).toFixed(0) + " mV/dec");
            out(root, "dv", isFinite(dv) ? (dv * 1000).toFixed(0) + " mV" : "out of range");
            out(root, "ion", eng(cur(state.vdd), "A/µm"));
            out(root, "en", isFinite(dv) ? Math.round(Math.pow(dv / base, 2) * 100) + "%" : "n/a");
            out(root, "verdict", state.dev === "mos" ? "The thermal limit: ten times the current costs at least 60 mV of gate voltage" :
                state.dev === "tfet" ? "Steeper at the start, but the on current is a hundred times lower than a MOSFET's: great for tiny currents, poor for speed" :
                    "A ferroelectric layer amplifies the gate voltage: the swing drops to " + (60 / state.a).toFixed(0) + " mV/dec all the way up. (Real devices are harder to make work, with hysteresis problems.)");

            if (seen.mos && seen.tfet && seen.nc) {
                F.reward("fet-steep", 10, "You tried all three ways to switch");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const g = plot(ctx, {
                box: [86, 20, 560, 250], x: [0, 0.8], y: [1e-12, 1e-3], logy: true,
                xt: [[0, "0"], [0.2, "0.2"], [0.4, "0.4"], [0.6, "0.6"], [0.8, "0.8"]],
                yt: [[1e-12, "1 pA"], [1e-9, "1 nA"], [1e-6, "1 µA"], [1e-3, "1 mA"]],
                xl: "gate voltage (V)", yl: "drain current per width (A/µm)",
                curves: [["mos", GREY], ["tfet", GOLD], ["nc", TEAL]].map(function (k) {

                    return {
                        pts: sample(function (v) { return steepCur(k[0], v, state.a); }, 0, 0.8, 120),
                        col: k[1] + (k[0] === state.dev ? ".98)" : ".4)"),
                        w: k[0] === state.dev ? 3.8 : 1.8
                    };
                })
            });

            ctx.strokeStyle = TEXT + ".4)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(g.sx(state.vdd), 20); ctx.lineTo(g.sx(state.vdd), 270); ctx.stroke(); ctx.setLineDash([]);
            dot(ctx, g.sx(state.vdd), g.sy(clamp(cur(state.vdd), 1e-12, 1e-3)), 7, ROSE + "1)");
            txt(ctx, "VDD", g.sx(state.vdd), 34, 12, TEXT + ".85)");
            txt(ctx, "MOSFET: 60 mV/dec", 100, 44, 12, GREY + "1)", "start", true);
            txt(ctx, "tunnel FET", 100, 62, 12, GOLD + "1)", "start", true);
            txt(ctx, "negative-capacitance FET", 100, 80, 12, TEAL + "1)", "start", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-tfet"] = function (root) {

        const defaults = { vg: 0.2 };
        const state = { vg: 0.2 };
        const seen = {};
        const rand = mulberry(31);
        const parts = [];
        let t = 0;

        for (let i = 0; i < 16; i++) { parts.push({ u: rand(), v: rand() }); }

        root.innerHTML =
            head("Try it: tunnel through the gap") +
            canvasFor(680, 330, "An energy-band diagram of a tunnel FET: a p-type source, a gated channel and an n-type drain. At low gate voltage the channel's conduction band sits above the source's valence band and nothing flows. Raising the gate voltage lowers the channel bands until the conduction band falls below the source valence band, opening a window through which electrons tunnel.") +
            '<div class="fd-stat-row">' + stat("Tunneling window", "win") + stat("Relative current", "i") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Gate voltage", key: "vg", min: 0, max: 0.8, step: 0.01, value: 0.2 }) +
            "</div>" +
            '<p class="fd-sim-formula">There is no thermal tail to fight: electrons only flow when the source valence band overlaps the channel conduction band, so the current switches on over a very small gate range. The price is a tunneling barrier that limits the on current. (Teaching diagram, band gap 0.7 eV.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function win() { return Math.max(0, state.vg - 0.4); }

        function update() {

            setVal(root, "vg", state.vg.toFixed(2) + " V");

            const w = win();

            seen[w > 0.2 ? "on" : w > 0 ? "edge" : "off"] = true;

            out(root, "win", w > 0 ? (w * 1000).toFixed(0) + " mV" : "closed");
            out(root, "i", w > 0 ? "≈ 10" + H.sup(Math.round(-12 + Math.min(w / 0.035, 8))) + " A/µm" : "≈ 0");
            out(root, "verdict", w <= 0 ? "Off: the bands do not overlap, so nothing can tunnel, however hot it is" :
                w < 0.2 ? "The window has just opened: the current grows by decades over a very small gate change" : "Wide open: the on current is limited by the tunneling barrier, not by the gate");

            if (seen.off && seen.on) {
                F.reward("fet-tfet", 10, "You opened and closed a tunneling window");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const y = function (e) { return 200 - e * 85; };
            const w = win();
            const ecCh = 0.4 - state.vg;   // channel conduction band edge, eV (source valence band is at 0)
            const evCh = ecCh - 0.7;
            const x0 = 40;
            const x1 = 640;
            const a = 210;
            const b = 430;

            ctx.fillStyle = ROSE + ".08)"; ctx.fillRect(x0, 40, a - x0, 250);
            ctx.fillStyle = GOLD + ".08)"; ctx.fillRect(a, 40, b - a, 250);
            ctx.fillStyle = TEAL + ".08)"; ctx.fillRect(b, 40, x1 - b, 250);
            txt(ctx, "p+ source", (x0 + a) / 2, 312, 12, ROSE + "1)", "center", true);
            txt(ctx, "gated channel", (a + b) / 2, 312, 12, GOLD + "1)", "center", true);
            txt(ctx, "n+ drain", (b + x1) / 2, 312, 12, TEAL + "1)", "center", true);

            function band(col, pts) {

                ctx.strokeStyle = col;
                ctx.lineWidth = 3.2;
                ctx.beginPath();
                pts.forEach(function (p, i) { if (i === 0) { ctx.moveTo(p[0], y(p[1])); } else { ctx.lineTo(p[0], y(p[1])); } });
                ctx.stroke();
            }

            band(GOLD + ".98)", [[x0, 0.7], [a - 10, 0.7], [a + 24, ecCh], [b - 24, ecCh], [b + 10, 0.2], [x1, 0.2]]);
            band(BLUE + ".98)", [[x0, 0], [a - 10, 0], [a + 24, evCh], [b - 24, evCh], [b + 10, -0.5], [x1, -0.5]]);
            txt(ctx, "conduction band", x1, y(0.2) - 10, 11, GOLD + "1)", "end", true);
            txt(ctx, "valence band", x1, y(-0.5) + 16, 11, BLUE + "1)", "end", true);

            // Fermi level in the heavily doped regions
            ctx.strokeStyle = TEXT + ".6)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x0, y(-0.05)); ctx.lineTo(a - 20, y(-0.05)); ctx.moveTo(b + 20, y(0.25)); ctx.lineTo(x1, y(0.25)); ctx.stroke(); ctx.setLineDash([]);

            if (w > 0) {

                // the window: energies between the channel conduction band and the source valence band
                ctx.fillStyle = TEAL + ".28)";
                ctx.fillRect(a - 12, y(0), 64, y(ecCh) - y(0));

                const n = Math.round(clamp(w / 0.04 * 2, 1, 16));

                for (let i = 0; i < n; i++) {

                    const p = parts[i];
                    const ph = (t * (0.25 + w) + p.u) % 1;
                    const ey = y(-p.v * w * 0.9);

                    dot(ctx, a - 12 + ph * 64, ey, 3.8, "rgba(255,255,255,.95)");
                }

                txt(ctx, "tunneling window", a + 20, y(ecCh) + 18, 12, TEAL + "1)", "center", true);
            }
        }

        animate(root, function (dt) { t += dt; draw(); });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    SIMS["fet-steepq"] = quiz(
        "Game: which way to beat 60 mV per decade?",
        ["Thermal limit", "Tunnel FET", "Negative capacitance"],
        [
            { q: "Carriers need thermal energy to climb a barrier, so ten times the current costs at least 60 mV.", a: "Thermal limit", why: "Boltzmann statistics: (kT/q)·ln 10." },
            { q: "Electrons tunnel from the source valence band into the channel conduction band.", a: "Tunnel FET", why: "Band-to-band tunneling." },
            { q: "A ferroelectric layer amplifies the voltage that reaches the channel.", a: "Negative capacitance", why: "Internal gain: S = 60/A." },
            { q: "Its current is held back by a tunneling barrier, so the on current is low.", a: "Tunnel FET", why: "A steep start, a weak finish." },
            { q: "Hysteresis and stability have made it hard to demonstrate cleanly.", a: "Negative capacitance", why: "A research challenge." },
            { q: "It sets the floor of 60 mV/dec at 300 K, and rises in proportion to temperature.", a: "Thermal limit", why: "S ∝ T." }
        ],
        5,
        "fet-steepq-done",
        "You can sort the ways past the limit",
        "Thermal limit, tunneling, or amplification: three stories about the same 60 mV.",
        "Thermal limit, tunneling, amplification. Hit Reset to try again."
    );


    /* ======================================
       UNIT 44: RELIABILITY
    ====================================== */

    SIMS["fet-bti"] = function (root) {

        const defaults = { v: 0.8, temp: 85 };
        const state = { v: 0.8, temp: 85 };
        const seen = {};
        const YEAR = 3.156e7;
        const LIMIT = 50; // mV, a typical end-of-life budget

        root.innerHTML =
            head("Try it: how fast does a transistor age?") +
            canvasFor(680, 330, "A graph on log axes of threshold voltage shift against stress time, from one second to ten years. The shift grows as a power law, and a dashed line marks the end-of-life budget. A dot marks where the chosen conditions cross it.") +
            '<div class="fd-stat-row">' + stat("V<sub>th</sub> shift after 10 years", "dv") + stat("Time to the budget", "life") + stat("Speed loss at 10 years", "slow") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Operating voltage", key: "v", min: 0.6, max: 1.2, step: 0.01, value: 0.8 }) +
            slider({ label: "Temperature", key: "temp", min: 25, max: 125, step: 1, value: 85 }) +
            "</div>" +
            '<p class="fd-sim-formula">Bias-temperature instability (BTI): charges get trapped at and near the gate dielectric under bias, so ΔV<sub>th</sub> = A(V, T)·t<sup>n</sup>, with n ≈ 0.15 to 0.25. Both voltage and temperature accelerate it. A shift of V<sub>th</sub> slows the transistor by roughly ΔV<sub>th</sub>/(V<sub>DD</sub> − V<sub>th</sub>). (Illustrative parameters; budget 50 mV.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function dvth(t) { return 4.5 * Math.pow(state.v / 0.8, 4) * Math.pow(2, (state.temp - 85) / 30) * Math.pow(t / 1e3, 0.18); }

        function life() { return 1e3 * Math.pow(LIMIT / (4.5 * Math.pow(state.v / 0.8, 4) * Math.pow(2, (state.temp - 85) / 30)), 1 / 0.18); }

        function years(t) {

            const y = t / YEAR;

            return y >= 1000 ? "> 1000 years" : y >= 1 ? y.toFixed(y < 10 ? 1 : 0) + " years" : y > 1 / 365 ? (y * 365).toFixed(0) + " days" : (t / 3600).toFixed(1) + " hours";
        }

        function update() {

            setVal(root, "v", state.v.toFixed(2) + " V");
            setVal(root, "temp", state.temp + " °C");

            const d10 = dvth(10 * YEAR);
            const l = life();

            seen[l < 10 * YEAR ? "fails" : "ok"] = true;

            out(root, "dv", d10.toFixed(0) + " mV");
            out(root, "life", years(l));
            out(root, "slow", (1.3 * d10 / ((state.v - 0.35) * 1000) * 100).toFixed(0) + "%");
            out(root, "verdict", l >= 10 * YEAR ? "A good design: the shift stays inside the budget for the ten-year target" :
                "Too hot or too high a voltage: the threshold drifts past the budget before ten years. Back off V or T");

            if (seen.fails && seen.ok) {
                F.reward("fet-bti", 10, "You found the edge of a 10-year lifetime");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const g = plot(ctx, {
                box: [86, 24, 560, 230], x: [1, 1e9], y: [1, 300], logx: true, logy: true,
                xt: [[1, "1 s"], [3600, "1 h"], [86400 * 30, "1 mo"], [YEAR, "1 yr"], [10 * YEAR, "10 yr"]], yt: [[1, "1 mV"], [10, "10"], [50, "50"], [100, "100"], [300, "300"]],
                xl: "stress time", yl: "threshold shift (mV)",
                curves: [
                    { pts: sample(function (e) { return dvth(Math.pow(10, e)); }, 0, 9, 60).map(function (p) { return [Math.pow(10, p[0]), p[1]]; }), col: TEAL + ".98)", w: 3.4 },
                    { pts: [[1, LIMIT], [1e9, LIMIT]], col: ROSE + ".95)", w: 2, dash: [7, 5] }
                ]
            });

            ctx.strokeStyle = GOLD + ".7)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(g.sx(10 * YEAR), 24); ctx.lineTo(g.sx(10 * YEAR), 254); ctx.stroke(); ctx.setLineDash([]);
            txt(ctx, "end-of-life budget", 640, g.sy(LIMIT) - 6, 11, ROSE + "1)", "end", true);

            const l = life();

            if (l < 1e9) { dot(ctx, g.sx(l), g.sy(LIMIT), 7, GOLD + "1)"); }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-tddb"] = function (root) {

        const defaults = { v: 1.2, e: 7, area: 400 };
        const state = { v: 1.2, e: 7, area: 400 };
        const seen = {};
        const rand = mulberry(77);
        const U = [];
        let playing = false;

        for (let i = 0; i < 1600; i++) { U.push(rand()); }

        root.innerHTML =
            head("Try it: the weakest oxide fails first") +
            canvasFor(680, 340, "A grid of gate oxides, one square per transistor, drawn teal while healthy and rose once the oxide has broken down. Each has a random lifetime from a Weibull distribution. Raising the voltage shortens every lifetime, and more transistors on the chip make it more likely that one is weak.") +
            '<div class="fd-stat-row">' + stat("Elapsed stress time", "tm") + stat("Failed oxides", "nf") + stat("First failure at", "first") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-play>▶ Run the clock</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Operating voltage", key: "v", min: 0.8, max: 1.5, step: 0.01, value: 1.2 }) +
            slider({ label: "Stress time", key: "e", min: 0, max: 10, step: 0.05, value: 7 }) +
            slider({ label: "Transistors on the chip", key: "area", min: 100, max: 1600, step: 100, value: 400 }) +
            "</div>" +
            '<p class="fd-sim-formula">Time-dependent dielectric breakdown (TDDB): defects accumulate in the oxide until a conducting path forms. Lifetimes follow a Weibull distribution, F(t) = 1 − exp(−(t/η)<sup>β</sup>), with η falling about ten times for every 0.1 V of extra stress. A chip is a chain of many oxides, so its life is set by the weakest link. (Illustrative: η = 10<sup>12</sup> s at 0.8 V, β = 1.8.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");
        const playBtn = root.querySelector("[data-play]");

        function eta() { return 1e12 * Math.pow(10, -(state.v - 0.8) * 10); }

        function failTime(u) { return eta() * Math.pow(-Math.log(1 - u), 1 / 1.8); }

        function when(t) {

            if (t >= YEAR) { return (t / YEAR).toFixed(1) + " years"; }
            if (t >= 86400) { return (t / 86400).toFixed(1) + " days"; }
            if (t >= 3600) { return (t / 3600).toFixed(1) + " hours"; }

            return t.toFixed(0) + " s";
        }

        const YEAR = 3.156e7;

        function update() {

            setVal(root, "v", state.v.toFixed(2) + " V");
            setVal(root, "e", when(Math.pow(10, state.e)));
            setVal(root, "area", state.area);

            const t = Math.pow(10, state.e);
            let nf = 0;
            let first = Infinity;

            for (let i = 0; i < state.area; i++) {

                const f = failTime(U[i]);

                if (f <= t) { nf++; }
                if (f < first) { first = f; }
            }

            seen[nf > 0 ? "fail" : "ok"] = true;

            out(root, "tm", when(t));
            out(root, "nf", nf + " of " + state.area);
            out(root, "first", when(first));
            out(root, "verdict", nf === 0 ? "No oxide has broken down yet. Raise the voltage or run the clock" :
                nf <= state.area * 0.03 ? "Only the weakest oxides have failed so far, long before the typical lifetime. One is enough to break a chain" : "Breakdown is spreading: this chip would not survive this long at this voltage");

            if (seen.fail && seen.ok) {
                F.reward("fet-tddb", 10, "You watched the weakest oxides fail first");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const t = Math.pow(10, state.e);
            const side = Math.ceil(Math.sqrt(state.area));
            const cell = Math.min(15, 300 / side);
            const x0 = (680 - side * cell) / 2;

            for (let i = 0; i < state.area; i++) {

                const bad = failTime(U[i]) <= t;
                const x = x0 + (i % side) * cell;
                const y = 20 + Math.floor(i / side) * cell;

                ctx.fillStyle = (bad ? ROSE : TEAL) + (bad ? ".95)" : ".45)");
                ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
            }
        }

        playBtn.addEventListener("click", function () {

            playing = !playing;
            playBtn.textContent = playing ? "⏸ Pause" : "▶ Run the clock";

            if (playing && state.e >= 10) { state.e = 0; }
        });

        animate(root, function (dt) {

            if (!playing) { return; }

            // 0.15 decades per second keeps the failures slow enough to follow
            state.e = Math.min(10, state.e + dt * 0.15);

            const input = root.querySelector('input[data-key="e"]');

            if (input) { input.value = state.e; }

            update();

            if (state.e >= 10) { playing = false; playBtn.textContent = "▶ Run the clock"; }
        });

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-relq"] = quiz(
        "Game: which aging mechanism?",
        ["BTI", "Hot-carrier injection", "Oxide breakdown", "Electromigration"],
        [
            { q: "Charges trap in the gate dielectric under bias, slowly shifting the threshold.", a: "BTI", why: "Bias-temperature instability." },
            { q: "Energetic carriers near the drain damage the oxide interface as they switch.", a: "Hot-carrier injection", why: "Worst at high drain field." },
            { q: "A conducting path forms through the gate oxide and the transistor shorts.", a: "Oxide breakdown", why: "TDDB, set by the weakest link." },
            { q: "Current pushes metal atoms along a wire until it opens.", a: "Electromigration", why: "A wire effect, not a transistor effect." },
            { q: "Partly recovers when the stress is removed.", a: "BTI", why: "Some of the trapped charge leaves." },
            { q: "Lifetime depends on the area of oxide in the chip, so bigger chips fail sooner.", a: "Oxide breakdown", why: "More oxide, more chance of a weak spot." }
        ],
        5,
        "fet-relq-done",
        "You know how transistors wear out",
        "Trapping, hot carriers, breakdown and migration: four ways time wins.",
        "BTI, hot carriers, breakdown, migration. Hit Reset to try again."
    );


    /* ======================================
       UNIT 45: VARIABILITY AND THE ROAD AHEAD
    ====================================== */

    SIMS["fet-var"] = function (root) {

        const defaults = { w: 100, L: 30, avt: 2 };
        const state = { w: 100, L: 30, avt: 2 };
        const seen = {};
        const rand = mulberry(2024);
        const Z = [];
        const D = [];

        function gauss() {

            const u = Math.max(1e-9, rand());
            const v = rand();

            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        }

        for (let i = 0; i < 3000; i++) { Z.push(gauss()); }
        for (let i = 0; i < 400; i++) { D.push([rand(), rand()]); }

        root.innerHTML =
            head("Try it: no two small transistors are alike") +
            canvasFor(680, 340, "On the left, the channel of a transistor drawn to scale with its random dopant atoms shown as dots. On the right, a histogram of the threshold voltages of three thousand nominally identical transistors. The smaller the transistor, the fewer dopant atoms it has and the wider the histogram.") +
            '<div class="fd-stat-row">' + stat("Dopant atoms in the channel", "n") + stat("σ(V<sub>th</sub>)", "sig") + stat("Worst of a billion (±6σ)", "worst") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Channel width W", key: "w", min: 20, max: 300, step: 5, value: 100 }) +
            slider({ label: "Channel length L", key: "L", min: 12, max: 100, step: 1, value: 30 }) +
            slider({ label: "Matching coefficient A<sub>VT</sub> (mV·µm)", key: "avt", min: 0.5, max: 4, step: 0.1, value: 2 }) +
            "</div>" +
            '<p class="fd-sim-formula">Pelgrom\'s law: σ(V<sub>th</sub>) = A<sub>VT</sub> ÷ √(W·L). The number of dopants is so small that the luck of the draw matters: with N atoms the relative spread is about 1/√N. Variation of this kind sets the minimum supply voltage of SRAM and limits how far a design can be shrunk. (Doping 10<sup>18</sup> cm<sup>−3</sup> over a 15 nm depth, illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function sigma() { return state.avt / Math.sqrt(state.w * state.L * 1e-6) ; } // mV

        function ndop() { return 1e18 * (state.w * 1e-7) * (state.L * 1e-7) * 15e-7; }

        function update() {

            setVal(root, "w", state.w + " nm");
            setVal(root, "L", state.L + " nm");
            setVal(root, "avt", state.avt.toFixed(1));

            const s = sigma();

            seen[s > 60 ? "wide" : s < 25 ? "tight" : "mid"] = true;

            out(root, "n", Math.round(ndop()));
            out(root, "sig", s.toFixed(0) + " mV");
            out(root, "worst", "± " + (6 * s).toFixed(0) + " mV");
            out(root, "verdict", s > 60 ? "A huge spread: some transistors are far faster or slower than the rest, and memory cells fail at low voltage" :
                s < 25 ? "Large devices average out the randomness: the threshold is tight" : "Moderate spread: designs must keep a margin for the unlucky ones");

            if (seen.wide && seen.tight) {
                F.reward("fet-var", 10, "You saw randomness grow as transistors shrink");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            // the channel to scale
            const sc = Math.min(1.0, 220 / Math.max(state.w, 60));
            const w = state.w * sc;
            const h = state.L * sc * 2.2;
            const cx = 150;
            const cy = 160;

            ctx.fillStyle = GREY + ".4)"; ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
            ctx.strokeStyle = TEXT + ".6)"; ctx.lineWidth = 1.5; ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

            const n = Math.min(Math.round(ndop()), 400);

            for (let i = 0; i < n; i++) { dot(ctx, cx - w / 2 + 4 + D[i][0] * (w - 8), cy - h / 2 + 4 + D[i][1] * (h - 8), 2.6, ROSE + ".95)"); }

            txt(ctx, "W = " + state.w + " nm", cx, cy + h / 2 + 22, 12, TEXT + ".85)", "center", true);
            txt(ctx, "L = " + state.L + " nm", cx - w / 2 - 12, cy + 4, 12, TEXT + ".85)", "end", true);
            txt(ctx, "red dots: dopant atoms (about " + Math.round(ndop()) + ")", cx, 36, 12, ROSE + "1)", "center", true);

            // histogram
            const s = sigma();
            const bins = 36;
            const cnt = new Array(bins).fill(0);
            const range = 280;

            Z.forEach(function (z) {

                const v = z * s;
                const k = Math.floor((v + range) / (2 * range) * bins);

                if (k >= 0 && k < bins) { cnt[k]++; }
            });

            const bx = 330;
            const bw = 320;
            const base = 270;
            const mx = Math.max.apply(null, cnt);

            cnt.forEach(function (c, i) {

                const hh = c / Math.max(mx, 150) * 190;

                ctx.fillStyle = TEAL + ".6)";
                ctx.fillRect(bx + i * (bw / bins), base - hh, bw / bins - 1, hh);
            });

            ctx.strokeStyle = GREY + ".6)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(bx, base); ctx.lineTo(bx + bw, base); ctx.stroke();
            [-200, -100, 0, 100, 200].forEach(function (v) {

                const x = bx + (v + range) / (2 * range) * bw;

                txt(ctx, (v > 0 ? "+" : "") + v, x, base + 16, 11, TEXT + ".75)");
            });

            txt(ctx, "Vth shift from the average (mV)", bx + bw / 2, base + 34, 12, TEXT + ".85)");
            txt(ctx, "3000 transistors", bx + bw, 40, 12, TEXT + ".85)", "end", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-roadmap"] = function (root) {

        const defaults = { era: 1 };
        const state = { era: 1 };
        const seen = {};
        const ERAS = [
            { name: "Planar bulk", when: "to about 2011", sides: 1, text: "The gate covers one side. Strain, high-k and metal gates keep it alive past 90 nm to 28 nm, but leakage grows." },
            { name: "FinFET", when: "about 2011 to 2024", sides: 3, text: "A raised fin, gate on three sides. Solves short-channel control down to the 5 to 3 nm node names, with quantized width." },
            { name: "Nanosheet GAA", when: "about 2022 onward", sides: 4, text: "Stacked ribbons, gate on four sides. Tunable width, better control, and room for a few more generations." },
            { name: "CFET and beyond", when: "research, 2030s", sides: 4, text: "n-type stacked on p-type, backside power, and perhaps 2D channels, to keep packing more transistors per area." }
        ];

        root.innerHTML =
            head("Try it: the shape of the next decade") +
            canvasFor(680, 330, "A timeline with four eras of transistor architecture and a drawing of the selected one. Planar transistors lie flat. FinFETs stand a fin on edge. Nanosheet transistors stack horizontal ribbons. CFETs stack an n-type device over a p-type one.") +
            '<div class="fd-stat-row">' + stat("Era", "era") + stat("Gate sides", "sides") + stat("Period", "when") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict" style="font-size:15px;line-height:1.5"></div></div>' +
            seg("Era", "era", [["0", "Planar"], ["1", "FinFET"], ["2", "Nanosheet GAA"], ["3", "CFET and beyond"]]) +
            '<p class="fd-sim-formula">Each step improved one thing: gate control (more sides), footprint use (taller, stacked), or area (folding the pair). Timelines are approximate, and the later ones are research as of this writing.</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function update() {

            seen[state.era] = true;

            const e = ERAS[state.era];

            out(root, "era", e.name);
            out(root, "sides", e.sides);
            out(root, "when", e.when);
            out(root, "verdict", e.text);

            if (seen[0] && seen[1] && seen[2] && seen[3]) {
                F.reward("fet-roadmap", 10, "You walked the whole transistor roadmap");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            // timeline
            ERAS.forEach(function (e, i) {

                const x = 60 + i * 190;
                const on = i === state.era;

                ctx.fillStyle = (on ? TEAL : GREY) + (on ? ".85)" : ".3)");
                ctx.fillRect(x, 20, 170, 34);
                txt(ctx, e.name, x + 85, 42, 12, on ? "rgba(6,10,24,.95)" : TEXT + ".8)", "center", true);
            });

            const cx = 340;
            const base = 282;

            ctx.fillStyle = GREY + ".4)"; ctx.fillRect(110, base, 460, 28);

            function gate(x, y, w, h) { ctx.fillStyle = GOLD + ".7)"; ctx.fillRect(x, y, w, h); }
            function chan(x, y, w, h, col) { ctx.fillStyle = (col || TEAL) + ".95)"; ctx.fillRect(x, y, w, h); }

            if (state.era === 0) {

                gate(cx - 90, base - 40, 180, 28);
                chan(cx - 90, base - 12, 180, 12);
                txt(ctx, "gate on top only", cx, base - 56, 13, TEXT + ".9)", "center", true);

            } else if (state.era === 1) {

                [-70, 70].forEach(function (dx) {

                    gate(cx + dx - 16, base - 150, 32, 150);
                    chan(cx + dx - 6, base - 140, 12, 140);
                });

                txt(ctx, "tall fins, gate on three sides", cx, base - 166, 13, TEXT + ".9)", "center", true);

            } else if (state.era === 2) {

                gate(cx - 80, base - 190, 160, 190);

                [0, 1, 2].forEach(function (k) { chan(cx - 55, base - 50 - k * 55, 110, 18); });

                txt(ctx, "stacked sheets, gate all around", cx, base - 206, 13, TEXT + ".9)", "center", true);

            } else {

                gate(cx - 80, base - 200, 160, 200);

                [0, 1].forEach(function (k) { chan(cx - 55, base - 34 - k * 36, 110, 13, TEAL); });
                [0, 1].forEach(function (k) { chan(cx - 55, base - 120 - k * 36, 110, 13, ROSE); });

                ctx.strokeStyle = TEXT + ".6)"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(cx - 100, base - 92); ctx.lineTo(cx + 100, base - 92); ctx.stroke(); ctx.setLineDash([]);
                txt(ctx, "p-type sheets (rose) stacked on n-type (teal)", cx, base - 210, 13, TEXT + ".9)", "center", true);
                txt(ctx, "backside power rails below", cx, base + 22, 12, GOLD + "1)", "center", true);
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-futq"] = quiz(
        "Game: which direction is it?",
        ["More Moore", "More than Moore", "Beyond CMOS"],
        [
            { q: "Keep shrinking silicon transistors with nanosheets and CFETs.", a: "More Moore", why: "Scaling the same kind of device." },
            { q: "Add sensors, radio, power and memory next to the logic in one package.", a: "More than Moore", why: "Function, not just density." },
            { q: "Replace the silicon MOSFET with nanotubes, tunnel FETs or spintronics.", a: "Beyond CMOS", why: "A different switch." },
            { q: "Stack chiplets with hybrid bonding to build one large system.", a: "More than Moore", why: "Integration instead of scaling." },
            { q: "Backside power delivery and complementary FETs.", a: "More Moore", why: "A new layout of the same transistor." },
            { q: "A FET that detects the charge of a protein is an example of this direction.", a: "More than Moore", why: "A transistor made to sense, not to compute." }
        ],
        5,
        "fet-futq-done",
        "You know the three roads forward",
        "Keep shrinking, add function, or change the switch: the field is doing all three.",
        "More Moore, More than Moore, Beyond CMOS. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="fet-"]').forEach(F.mount);

})();
