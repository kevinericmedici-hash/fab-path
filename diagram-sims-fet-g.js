/* ========================================
   TRANSISTORS: INTERACTIVE SIMULATORS, PART 7

   Unit 31: the common-source amplifier, the current mirror.
   Unit 32: the SRAM cell and the DRAM cell.
   Unit 33: floating-gate Flash, bits per cell.
   Unit 34: high-k dielectrics, strain.
   Unit 35: FinFET geometry, how many sides the gate wraps.
   Unit 36: nanosheets, stacking the pair.
   Unit 37: the process flow, self-aligned gates.

   Registers on window.FabInteract; loaded by diagram-sims-fet-f.js.
   Chains diagram-sims-fet-h.js.
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
    const orderGame = M.orderGame;
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
    const plot = H.plot;
    const sample = H.sample;
    const arrowLine = H.arrowLine;
    const box = H.box;
    const eng = H.eng;
    const fmt = H.fmt;


    /* ======================================
       UNIT 31: ANALOG
    ====================================== */

    const VDDA = 1.8;
    const KA = 4;       // mA/V², a wide device
    const VTHA = 0.5;
    const LAMA = 0.1;

    function idsA(vgs, vds, k) {

        const vov = vgs - VTHA;

        return idrain(vgs, vds, VTHA, k) * (vov > 0 && vds >= vov ? 1 + LAMA * vds : 1);
    }

    // Output of a common-source stage with a resistor load (kΩ, mA, V).
    function csOut(vin, rd) {

        let lo = 0;
        let hi = VDDA;

        for (let i = 0; i < 40; i++) {

            const mid = (lo + hi) / 2;

            if (idsA(vin, mid, KA) - (VDDA - mid) / rd > 0) { hi = mid; } else { lo = mid; }
        }

        return (lo + hi) / 2;
    }

    SIMS["fet-amp"] = function (root) {

        const defaults = { vb: 0.8, rd: 5, amp: 50 };
        const state = { vb: 0.8, rd: 5, amp: 50 };
        const seen = {};
        let phase = 0;

        root.innerHTML =
            head("Try it: a transistor as an amplifier") +
            canvasFor(680, 340, "On the left, a graph of the output voltage against the input voltage for a common-source amplifier, with the operating point marked and the input swing shown as a bar. On the right, two waveforms over time: the small sine-wave input and the larger, inverted output. If the bias is wrong the output flattens at the top or bottom.") +
            '<div class="fd-stat-row">' + stat("Bias output", "vq") + stat("Gain (small signal)", "gain") + stat("Transistor is in", "reg") + stat("Output swing", "swing") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Bias voltage on the gate", key: "vb", min: 0.45, max: 1.2, step: 0.01, value: 0.8 }) +
            slider({ label: "Load resistor R<sub>D</sub>", key: "rd", min: 1, max: 12, step: 0.5, value: 5 }) +
            slider({ label: "Input signal amplitude", key: "amp", min: 0, max: 250, step: 5, value: 50 }) +
            "</div>" +
            '<p class="fd-sim-formula">Small-signal gain A<sub>v</sub> = −g<sub>m</sub>·(R<sub>D</sub> ∥ r<sub>o</sub>), with g<sub>m</sub> = 2I<sub>D</sub>/V<sub>ov</sub>. The minus sign means the output is inverted. The bias must keep the transistor in saturation through the whole swing, or the output clips. (V<sub>DD</sub> = 1.8 V, V<sub>th</sub> = 0.5 V, illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function gainAt(vin) {

            const d = 0.002;

            return (csOut(vin + d, state.rd) - csOut(vin - d, state.rd)) / (2 * d);
        }

        function update() {

            setVal(root, "vb", state.vb.toFixed(2) + " V");
            setVal(root, "rd", state.rd.toFixed(1) + " kΩ");
            setVal(root, "amp", state.amp + " mV");

            const vq = csOut(state.vb, state.rd);
            const g = gainAt(state.vb);
            const vov = state.vb - VTHA;
            const reg = vov <= 0 ? "cutoff" : (vq >= vov ? "saturation" : "triode");
            const hi = csOut(state.vb - state.amp / 1000, state.rd);
            const lo = csOut(state.vb + state.amp / 1000, state.rd);
            const clipped = reg !== "saturation" || csOut(state.vb + state.amp / 1000, state.rd) < state.vb + state.amp / 1000 - VTHA;

            seen[g < -8 ? "high" : g > -2 ? "low" : "mid"] = true;

            out(root, "vq", vq.toFixed(2) + " V");
            out(root, "gain", g.toFixed(1) + "×");
            out(root, "reg", reg);
            out(root, "swing", ((hi - lo) * 1000).toFixed(0) + " mV p-p");
            out(root, "verdict", reg === "cutoff" ? "Gate below threshold: no current, no gain" :
                reg === "triode" ? "Bias too high: the transistor drops out of saturation and the gain collapses" :
                    clipped ? "The output swing reaches the edge of saturation and gets clipped" :
                        g < -5 ? "Well biased: a small input becomes a large, inverted output" : "Weak gain: raise the load resistor or the overdrive");

            if (seen.high && seen.low) {
                F.reward("fet-amp", 10, "You biased an amplifier for gain");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            const vq = csOut(state.vb, state.rd);
            const g = plot(ctx, {
                box: [56, 28, 250, 240], x: [0.3, 1.3], y: [0, VDDA],
                xt: [[0.5, "0.5"], [0.8, "0.8"], [1.1, "1.1"]], yt: [[0, "0"], [0.9, "0.9"], [1.8, "1.8"]],
                xl: "input (V)", yl: "output (V)",
                curves: [{ pts: sample(function (v) { return csOut(v, state.rd); }, 0.3, 1.3, 100), col: TEAL + ".98)", w: 3.2 }]
            });

            dot(ctx, g.sx(state.vb), g.sy(vq), 7, GOLD + "1)");

            ctx.strokeStyle = GOLD + ".95)";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(g.sx(state.vb - state.amp / 1000), 274);
            ctx.lineTo(g.sx(state.vb + state.amp / 1000), 274);
            ctx.stroke();

            // waveforms
            const x0 = 370;
            const x1 = 660;
            const yIn = 60;
            const yOut = 190;
            const n = 120;

            txt(ctx, "input", x0, 24, 12, GOLD + "1)", "start", true);
            txt(ctx, "output", x0, 138, 12, TEAL + "1)", "start", true);

            ctx.lineWidth = 2.6;

            [[GOLD, yIn, function (p) { return state.amp / 250 * 38 * Math.sin(p); }], [TEAL, yOut, function (p) {

                const vin = state.vb + state.amp / 1000 * Math.sin(p);

                return -(csOut(vin, state.rd) - vq) / 0.9 * 55;
            }]].forEach(function (w) {

                ctx.strokeStyle = w[0] + ".98)";
                ctx.beginPath();

                for (let i = 0; i <= n; i++) {

                    const p = phase + i / n * Math.PI * 4;
                    const x = x0 + i / n * (x1 - x0);
                    const y = w[1] - w[2](p);

                    if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
                }

                ctx.stroke();

                ctx.strokeStyle = GREY + ".3)";
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 4]);
                ctx.beginPath(); ctx.moveTo(x0, w[1]); ctx.lineTo(x1, w[1]); ctx.stroke();
                ctx.setLineDash([]);
                ctx.lineWidth = 2.6;
            });
        }

        animate(root, function (dt) { phase -= dt * 1.1; draw(); });

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-mirror"] = function (root) {

        const defaults = { iref: 100, m: 2, vl: 1.0 };
        const state = { iref: 100, m: 2, vl: 1.0 };
        const K = 2;
        const seen = {};

        root.innerHTML =
            head("Try it: copy a current") +
            canvasFor(680, 330, "On the left, a current mirror: a diode-connected reference transistor and an output transistor with their gates tied together. On the right, a graph of the output current against the voltage on the load, rising from zero and then going nearly flat when the output transistor is in saturation. A dot marks the chosen load voltage.") +
            '<div class="fd-stat-row">' + stat("Reference current", "ir") + stat("Ideal copy", "ideal") + stat("Actual output", "io") + stat("Error", "err") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Reference current", key: "iref", min: 20, max: 200, step: 5, value: 100 }) +
            slider({ label: "Width ratio (output ÷ reference)", key: "m", min: 1, max: 8, step: 1, value: 2 }) +
            slider({ label: "Voltage at the load", key: "vl", min: 0.05, max: 1.6, step: 0.05, value: 1.0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Both gates sit at the same voltage, so each transistor carries a current in proportion to its width: I<sub>out</sub> = (W<sub>2</sub>/W<sub>1</sub>)·I<sub>ref</sub>. The copy is only good while the output transistor stays in saturation, and short channels make the copy drift with the load voltage. (Illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function vgsFor(iref) {

            // solve ids(vgs, vgs) = iref for the diode-connected reference
            let lo = VTHA;
            let hi = 2;

            for (let i = 0; i < 40; i++) {

                const mid = (lo + hi) / 2;

                if (idsA(mid, mid, K) * 1000 > iref) { hi = mid; } else { lo = mid; }
            }

            return (lo + hi) / 2;
        }

        function iout(vl) { return idsA(vgsFor(state.iref), vl, K * state.m) * 1000; }

        function update() {

            setVal(root, "iref", state.iref + " µA");
            setVal(root, "m", state.m + " ×");
            setVal(root, "vl", state.vl.toFixed(2) + " V");

            const ideal = state.iref * state.m;
            const act = iout(state.vl);
            const vov = vgsFor(state.iref) - VTHA;

            seen[state.vl < vov ? "triode" : "sat"] = true;

            out(root, "ir", state.iref + " µA");
            out(root, "ideal", ideal.toFixed(0) + " µA");
            out(root, "io", act.toFixed(0) + " µA");
            out(root, "err", ((act / ideal - 1) * 100).toFixed(0) + "%");
            out(root, "verdict", state.vl < vov ? "Load voltage too low: the output transistor leaves saturation and the copy shrinks" :
                Math.abs(act / ideal - 1) < 0.06 ? "A good copy: the output follows the reference times the width ratio" : "Saturated but tilted: the short channel makes the copy creep up with the load voltage");

            if (seen.triode && seen.sat) {
                F.reward("fet-mirror", 10, "You copied a current, and saw where the copy fails");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            // schematic: two transistors, gates tied, the left one wired as a diode
            const m1 = 130;
            const m2 = 270;

            ctx.lineWidth = 2.4;
            ctx.strokeStyle = TEXT + ".6)";
            ctx.beginPath();
            // drains up to the currents
            ctx.moveTo(m1, 50); ctx.lineTo(m1, 130);
            ctx.moveTo(m2, 50); ctx.lineTo(m2, 130);
            // sources down to ground
            ctx.moveTo(m1, 190); ctx.lineTo(m1, 296);
            ctx.moveTo(m2, 190); ctx.lineTo(m2, 296);
            // diode connection: drain back to the gate
            ctx.moveTo(m1, 100); ctx.lineTo(60, 100); ctx.lineTo(60, 160); ctx.lineTo(m1 - 30, 160);
            // gates tied
            ctx.moveTo(60, 160); ctx.lineTo(60, 240); ctx.lineTo(m2 - 50, 240); ctx.lineTo(m2 - 50, 160); ctx.lineTo(m2 - 30, 160);
            ctx.stroke();
            dot(ctx, m1, 100, 4, TEXT + ".8)");
            dot(ctx, 60, 160, 4, TEXT + ".8)");

            arrowLine(ctx, m1 + 28, 60, m1 + 28, 100, TEAL + "1)", 3);
            arrowLine(ctx, m2 + 28, 60, m2 + 28, 100, GOLD + "1)", 3);
            txt(ctx, "Iref", m1 + 36, 84, 12, TEAL + "1)", "start", true);
            txt(ctx, "Iout", m2 + 36, 84, 12, GOLD + "1)", "start", true);

            box(ctx, m1 - 30, 130, 60, 60, TEAL + ".6)", GREY + ".7)");
            txt(ctx, "1×", m1, 166, 14, TEXT + ".95)", "center", true);
            box(ctx, m2 - 30, 130, 60, 60, GOLD + ".55)", GREY + ".7)");
            txt(ctx, state.m + "×", m2, 166, 14, TEXT + ".95)", "center", true);

            txt(ctx, "gates tied together", 160, 256, 12, TEXT + ".8)");
            txt(ctx, "diode-connected", 6, 92, 11, TEXT + ".7)", "start");

            ctx.strokeStyle = GREY + ".8)";
            ctx.beginPath(); ctx.moveTo(m1 - 30, 296); ctx.lineTo(m2 + 30, 296); ctx.stroke();
            txt(ctx, "ground", (m1 + m2) / 2, 316, 12, TEXT + ".8)");

            // output curve
            const ymax = Math.max(state.iref * state.m * 1.3, 60);
            const g = plot(ctx, {
                box: [400, 28, 250, 240], x: [0, 1.6], y: [0, ymax],
                xt: [[0, "0"], [0.4, "0.4"], [0.8, "0.8"], [1.2, "1.2"], [1.6, "1.6"]],
                yt: [[0, "0"], [ymax / 2, fmt(ymax / 2)], [ymax * 0.95, fmt(ymax * 0.95)]],
                xl: "voltage at the load (V)", yl: "output current (µA)",
                curves: [
                    { pts: [[0, state.iref * state.m], [1.6, state.iref * state.m]], col: GREY + ".6)", w: 1.6, dash: [5, 5] },
                    { pts: sample(iout, 0, 1.6, 100), col: GOLD + ".98)", w: 3.2 }
                ]
            });

            dot(ctx, g.sx(state.vl), g.sy(iout(state.vl)), 7, TEAL + "1)");
            txt(ctx, "ideal copy", 640, 22, 11, GREY + "1)", "end");
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-ampq"] = quiz(
        "Game: bias, gain or clipping?",
        ["Bias", "Gain", "Clipping"],
        [
            { q: "A fixed DC voltage on the gate that holds the transistor in saturation.", a: "Bias", why: "It sets the operating point." },
            { q: "How many times larger the output wiggle is than the input wiggle.", a: "Gain", why: "Set mostly by gm and the load." },
            { q: "The output flattens because the transistor leaves saturation at the extremes.", a: "Clipping", why: "The swing has run out of room." },
            { q: "Choosing it too high or too low leaves no headroom for the signal.", a: "Bias", why: "It must sit in the middle of the range." },
            { q: "Roughly gm times the load resistance, with a minus sign.", a: "Gain", why: "Inverting amplification." },
            { q: "A larger input amplitude can cause it, even with a perfect bias.", a: "Clipping", why: "The output cannot go beyond the rails." }
        ],
        5,
        "fet-ampq-done",
        "You know the three words of analog design",
        "Bias sets the stage, gain does the work, clipping is the limit.",
        "Bias, gain, clipping. Hit Reset to try again."
    );


    /* ======================================
       UNIT 32: SRAM AND DRAM
    ====================================== */

    SIMS["fet-sram"] = function (root) {

        const defaults = { wl: 0, bl: "float" };
        const state = { wl: 0, bl: "float" };
        const seen = {};
        let q = 1;
        let msg = "";

        root.innerHTML =
            head("Try it: read and write a six-transistor cell") +
            canvasFor(680, 360, "A six-transistor SRAM cell. Two inverters feed each other in a loop and hold a bit. Two access transistors connect the cell to the left and right bit lines when the word line is high. Transistors that are on are colored.") +
            '<div class="fd-stat-row">' + stat("Stored bit", "q") + stat("Word line", "wl") + stat("Bit lines", "bl") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Word line", "wl", [["0", "Off (holding)"], ["1", "On (selected)"]]) +
            seg("Bit lines", "bl", [["float", "Precharged (read)"], ["w0", "Drive to write 0"], ["w1", "Drive to write 1"]]) +
            '<p class="fd-sim-formula">Two cross-coupled inverters give a bistable loop: whichever side is high keeps the other low. With the word line off, the cell holds its bit as long as power is on. Turning the word line on connects it to the bit lines; a strongly driven pair of bit lines overpowers the loop and writes, while precharged ones only let a sense amplifier read the small swing.</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function update() {

            if (state.wl === 1) {

                if (state.bl === "w0") { q = 0; msg = "Written: the bit lines overpowered the loop and flipped the cell to 0"; } else if (state.bl === "w1") { q = 1; msg = "Written: the bit lines overpowered the loop and flipped the cell to 1"; } else { msg = "Read: the cell nudges one bit line lower, and a sense amplifier reads a " + q + " without changing it"; }

                seen["wl1" + state.bl] = true;

            } else {

                msg = "Word line off: the access transistors isolate the cell. It holds a " + q + " by itself, as long as power is on";
                seen.hold = true;
            }

            out(root, "q", q);
            out(root, "wl", state.wl ? "on" : "off");
            out(root, "bl", state.bl === "float" ? "precharged" : state.bl === "w0" ? "driven to 0" : "driven to 1");
            out(root, "verdict", msg);

            if (seen.hold && seen.wl1w0 && seen.wl1w1 && seen.wl1float) {
                F.reward("fet-sram", 10, "You held, read and wrote a 6T cell");
            }

            draw();
        }

        function tri(x0, y0, dir, label, lab2, hi) {

            // an inverter drawn as a triangle with a bubble; dir 1 points right, -1 points left
            ctx.beginPath();
            ctx.moveTo(x0, y0 - 34);
            ctx.lineTo(x0, y0 + 34);
            ctx.lineTo(x0 + dir * 70, y0);
            ctx.closePath();
            ctx.fillStyle = (hi ? GOLD : GREY) + ".2)";
            ctx.fill();
            ctx.strokeStyle = TEXT + ".75)";
            ctx.lineWidth = 2.4;
            ctx.stroke();
            ctx.beginPath(); ctx.arc(x0 + dir * 76, y0, 6, 0, Math.PI * 2); ctx.stroke();
            txt(ctx, label, x0 + dir * 24, y0 - 44, 12, TEXT + ".95)", "center", true);
            txt(ctx, lab2, x0 + dir * 24, y0 + 52, 11, TEXT + ".8)");
        }

        function line(pts, hi, col) {

            ctx.strokeStyle = hi ? (col || GOLD) + ".95)" : GREY + ".6)";
            ctx.lineWidth = hi ? 4 : 2.6;
            ctx.beginPath();
            pts.forEach(function (p, i) { if (i === 0) { ctx.moveTo(p[0], p[1]); } else { ctx.lineTo(p[0], p[1]); } });
            ctx.stroke();
        }

        function draw() {

            clear(ctx, 680, 360);

            const hi = q === 1; // Q is high
            const wl = state.wl === 1;
            const drv0 = state.bl === "w0";
            const drv1 = state.bl === "w1";

            // the loop: inverter 1 makes Q from QB, inverter 2 makes QB from Q
            line([[170, 100], [250, 100]], !hi);
            line([[332, 100], [480, 100]], hi);
            line([[480, 100], [480, 260], [420, 260]], hi);
            line([[344, 260], [170, 260], [170, 100]], !hi);

            tri(250, 100, 1, "inverter 1", hi ? "P1 on · N1 off" : "P1 off · N1 on", hi);
            tri(420, 260, -1, "inverter 2", hi ? "P2 off · N2 on" : "P2 on · N2 off", !hi);

            dot(ctx, 480, 100, 7, hi ? GOLD + "1)" : GREY + ".9)");
            dot(ctx, 170, 260, 7, hi ? GREY + ".9)" : GOLD + "1)");
            txt(ctx, "Q = " + (hi ? 1 : 0), 480, 86, 15, (hi ? GOLD : TEXT) + "1)", "center", true);
            txt(ctx, "QB = " + (hi ? 0 : 1), 170, 286, 15, (hi ? TEXT : GOLD) + "1)", "center", true);

            // access transistors and the bit lines
            const blCol = state.bl === "float" ? BLUE : drv1 ? GOLD : GREY;
            const blbCol = state.bl === "float" ? BLUE : drv0 ? GOLD : GREY;

            // BL on the Q side (right), BLB on the QB side (left)
            line([[480, 180], [530, 180]], hi && wl);
            line([[590, 180], [630, 180]], wl, blCol);
            ctx.strokeStyle = blCol + ".95)"; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(630, 60); ctx.lineTo(630, 180); ctx.stroke();
            txt(ctx, "BL", 630, 50, 13, TEXT + ".95)", "center", true);

            line([[170, 180], [120, 180]], !hi && wl);
            line([[60, 180], [50, 180]], wl, blbCol);
            ctx.strokeStyle = blbCol + ".95)"; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(50, 60); ctx.lineTo(50, 180); ctx.stroke();
            txt(ctx, "BLB", 50, 50, 13, TEXT + ".95)", "center", true);

            [[530, "A1"], [60, "A2"]].forEach(function (a) {

                box(ctx, a[0], 160, 60, 40, wl ? TEAL + ".78)" : GREY + ".22)", GREY + ".7)");
                txt(ctx, a[1], a[0] + 30, 177, 12, TEXT + ".95)", "center", true);
                txt(ctx, wl ? "on" : "off", a[0] + 30, 192, 11, TEXT + ".85)");
            });

            // word line
            ctx.strokeStyle = (wl ? GOLD : GREY) + ".9)"; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(30, 330); ctx.lineTo(650, 330); ctx.stroke();
            ctx.lineWidth = 2.4;
            ctx.beginPath(); ctx.moveTo(560, 330); ctx.lineTo(560, 200); ctx.moveTo(90, 330); ctx.lineTo(90, 200); ctx.stroke();
            txt(ctx, "word line " + (wl ? "high" : "low"), 340, 322, 13, (wl ? GOLD : TEXT) + "1)", "center", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-dram"] = function (root) {

        const defaults = { temp: 45, ref: 64 };
        const state = { temp: 45, ref: 64 };
        const seen = {};
        let t = 0;

        root.innerHTML =
            head("Try it: a leaky bucket that needs refilling") +
            canvasFor(680, 340, "On the left, a one-transistor, one-capacitor DRAM cell with the capacitor shown as a bucket whose level falls over time. On the right, a graph of the stored voltage against time: it decays exponentially and snaps back up at every refresh. A dashed line marks the lowest voltage that can still be read as a one.") +
            '<div class="fd-stat-row">' + stat("Retention time", "ret") + stat("Refresh every", "ref") + stat("Cell survives?", "ok") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Temperature", key: "temp", min: 25, max: 105, step: 1, value: 45 }) +
            slider({ label: "Refresh interval", key: "ref", min: 8, max: 256, step: 4, value: 64 }) +
            "</div>" +
            '<p class="fd-sim-formula">The stored charge leaks away through the access transistor and the junction: V(t) = V<sub>0</sub>·e<sup>−t/τ</sup>. Leakage roughly doubles every 10 to 15 °C, so τ shrinks fast when the chip heats up. A refresh reads each row and writes it back before the voltage falls below the sensing limit (about 60% here). (Illustrative numbers.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function tau() { return 8000 * Math.pow(2, -(state.temp - 25) / 12); } // ms
        function retention() { return tau() * Math.log(1 / 0.6); }

        function update() {

            setVal(root, "temp", state.temp + " °C");
            setVal(root, "ref", state.ref + " ms");

            const ok = retention() > state.ref;

            seen[ok ? "ok" : "fail"] = true;

            out(root, "ret", retention().toFixed(0) + " ms");
            out(root, "ref", state.ref + " ms");
            out(root, "ok", ok ? "yes" : "no: the bit is lost");
            out(root, "verdict", ok ? "Refreshed in time: the stored 1 never drops below the sensing limit" :
                "Too slow: the charge leaks below the limit before the next refresh, and the 1 reads as a 0");

            if (seen.ok && seen.fail) {
                F.reward("fet-dram", 10, "You saw a DRAM cell fail and be rescued");
            }
        }

        function volt(time) { return Math.exp(-(time % state.ref) / tau()); }

        function draw() {

            clear(ctx, 680, 340);

            const now = t % 300;
            const v = volt(now);

            // the cell
            txt(ctx, "word line", 40, 40, 12, TEXT + ".8)", "start");
            ctx.strokeStyle = GREY + ".7)"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(40, 50); ctx.lineTo(240, 50); ctx.stroke();
            txt(ctx, "bit line", 40, 118, 12, TEXT + ".8)", "start");
            ctx.beginPath(); ctx.moveTo(40, 128); ctx.lineTo(150, 128); ctx.stroke();

            box(ctx, 150, 100, 50, 56, TEAL + ".6)", GREY + ".7)");
            txt(ctx, "NMOS", 175, 133, 11, TEXT + ".95)", "center", true);
            ctx.strokeStyle = TEXT + ".6)"; ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.moveTo(175, 50); ctx.lineTo(175, 100); ctx.moveTo(200, 128); ctx.lineTo(250, 128); ctx.stroke();

            // the capacitor as a bucket
            const bx = 250;
            const by = 90;
            const bw = 90;
            const bh = 150;

            ctx.strokeStyle = TEXT + ".8)"; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by); ctx.stroke();
            ctx.fillStyle = (v > 0.6 ? TEAL : ROSE) + ".6)";
            ctx.fillRect(bx + 3, by + bh - v * (bh - 4), bw - 6, v * (bh - 4));
            ctx.strokeStyle = GOLD + ".9)"; ctx.setLineDash([5, 4]); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(bx - 8, by + bh - 0.6 * (bh - 4)); ctx.lineTo(bx + bw + 8, by + bh - 0.6 * (bh - 4)); ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "capacitor", bx + bw / 2, by + bh + 20, 12, TEXT + ".85)");
            txt(ctx, "stored bit: 1 · V = " + v.toFixed(2), bx + bw / 2, by + bh + 38, 12, (v > 0.6 ? TEAL : ROSE) + "1)", "center", true);

            // plot
            const g = plot(ctx, {
                box: [420, 40, 230, 200], x: [0, 300], y: [0, 1.05],
                xt: [[0, "0"], [100, "100"], [200, "200"], [300, "300"]], yt: [[0, "0"], [0.6, "0.6"], [1, "1"]],
                xl: "time (ms)", yl: "stored voltage",
                curves: [
                    { pts: [[0, 0.6], [300, 0.6]], col: GOLD + ".8)", w: 1.6, dash: [5, 4] },
                    { pts: sample(volt, 0, 300, 600), col: TEAL + ".98)", w: 2.6 }
                ]
            });

            dot(ctx, g.sx(now), g.sy(v), 6, v > 0.6 ? GOLD + "1)" : ROSE + "1)");
        }

        animate(root, function (dt) { t += dt * 40; draw(); }); // 40 ms of chip time per real second

        wire(root, state, defaults, update);
        update();
        draw();
    };


    SIMS["fet-memq"] = quiz(
        "Game: SRAM or DRAM?",
        ["SRAM", "DRAM"],
        [
            { q: "Six transistors per bit, no refresh needed.", a: "SRAM", why: "A cross-coupled latch plus two access transistors." },
            { q: "One transistor and one capacitor per bit.", a: "DRAM", why: "The smallest cell, so the densest memory." },
            { q: "Used for the fast caches next to the processor core.", a: "SRAM", why: "It is the fastest, at a cost in area." },
            { q: "Must be read and rewritten every few tens of milliseconds.", a: "DRAM", why: "The stored charge leaks away." },
            { q: "The main memory of a computer, in gigabytes.", a: "DRAM", why: "Density matters more than speed here." },
            { q: "Holds its bit with no refresh, but loses it when the power goes off.", a: "SRAM", why: "Static, yet still volatile." }
        ],
        5,
        "fet-memq-done",
        "You know the two workhorse memories",
        "SRAM is fast and big, DRAM is dense and needs refreshing. Both forget when power goes.",
        "SRAM: fast and large. DRAM: dense and leaky. Hit Reset to try again."
    );


    /* ======================================
       UNIT 33: FLASH
    ====================================== */

    function erfc(x) {

        // Abramowitz-Stegun approximation
        const z = Math.abs(x);
        const tt = 1 / (1 + 0.5 * z);
        const r = tt * Math.exp(-z * z - 1.26551223 + tt * (1.00002368 + tt * (0.37409196 + tt * (0.09678418 + tt * (-0.18628806 + tt * (0.27886807 + tt * (-1.13520398 + tt * (1.48851587 + tt * (-0.82215223 + tt * 0.17087277)))))))));

        return x >= 0 ? r : 2 - r;
    }

    SIMS["fet-flash"] = function (root) {

        const defaults = { mode: "idle" };
        const state = { mode: "idle" };
        const seen = {};
        const rand = mulberry(5);
        let q = 0;      // stored electrons, 0 to 1
        let target = 0;
        let t = 0;
        const parts = [];

        for (let i = 0; i < 24; i++) { parts.push({ u: rand(), v: rand() }); }

        root.innerHTML =
            head("Try it: trap charge on a floating gate") +
            canvasFor(680, 350, "On the left, a cross-section of a floating-gate memory cell: a control gate on top, a floating gate wrapped in oxide, then the channel. Electrons can tunnel onto the floating gate or off it. On the right, two transfer curves, one for an erased cell and one for the current state, and a dashed read voltage between them.") +
            '<div class="fd-stat-row">' + stat("Charge on the floating gate", "q") + stat("Threshold voltage", "vth") + stat("Read current", "ir") + stat("Reads as", "bit") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Operation", "mode", [["prog", "Program (high gate voltage)"], ["erase", "Erase (reverse the field)"], ["idle", "Hold"]]) +
            '<p class="fd-sim-formula">Electrons on the floating gate shield the channel from the control gate, so the threshold rises by ΔV<sub>th</sub> = −Q/C<sub>cg</sub>, the same rule as for charge at a sensor gate. At the read voltage an erased cell conducts (a 1) and a programmed cell does not (a 0). The oxide is thick enough that the charge stays put for years with no power.</p>';

        const ctx = root.querySelector("canvas").getContext("2d");
        const VREAD = 3;

        function vth() { return 1 + 4 * q; }

        function cur(v, vt) { return H.idsLog(v / 3.2, vt / 3.2, 80) * 1e3; }

        function update() {

            seen[state.mode] = true;
            target = state.mode === "prog" ? 1 : state.mode === "erase" ? 0 : q;

            out(root, "bit", q > 0.5 ? "0 (programmed)" : "1 (erased)");

            if (seen.prog && seen.erase) {
                F.reward("fet-flash", 10, "You programmed and erased a floating gate");
            }
        }

        function readout() {

            out(root, "q", Math.round(q * 100) + "%");
            out(root, "vth", vth().toFixed(1) + " V");
            out(root, "ir", H.eng(cur(VREAD, vth()) * 1e-3, "A"));
            out(root, "bit", q > 0.5 ? "0 (programmed)" : "1 (erased)");
            out(root, "verdict", state.mode === "prog" && q < 0.98 ? "Programming: electrons tunnel through the oxide onto the floating gate" :
                state.mode === "erase" && q > 0.02 ? "Erasing: the reversed field pulls the electrons back off" :
                    q > 0.5 ? "Programmed: the stored electrons keep the transistor off at the read voltage" : "Erased: with no trapped charge the cell conducts at the read voltage");
        }

        function draw() {

            clear(ctx, 680, 350);

            const bx = 30;
            const by = 60;

            // channel, source, drain
            ctx.fillStyle = GREY + ".4)"; ctx.fillRect(bx, by + 190, 280, 60);
            ctx.fillStyle = TEAL + ".5)"; ctx.fillRect(bx, by + 190, 60, 34); ctx.fillRect(bx + 220, by + 190, 60, 34);
            txt(ctx, "source", bx + 30, by + 270, 11, TEXT + ".8)"); txt(ctx, "drain", bx + 250, by + 270, 11, TEXT + ".8)");

            // oxide + floating gate + oxide + control gate
            ctx.fillStyle = BLUE + ".4)"; ctx.fillRect(bx + 50, by + 170, 180, 20);
            txt(ctx, "tunnel oxide", bx + 140, by + 184, 10, TEXT + ".8)");
            ctx.fillStyle = GREY + ".75)"; ctx.fillRect(bx + 50, by + 112, 180, 58);
            txt(ctx, "floating gate", bx + 140, by + 150, 12, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = BLUE + ".4)"; ctx.fillRect(bx + 40, by + 92, 200, 20);
            ctx.fillStyle = GOLD + ".85)"; ctx.fillRect(bx + 40, by + 40, 200, 52);
            txt(ctx, "control gate", bx + 140, by + 72, 13, "rgba(6,10,24,.95)", "center", true);

            // charges on the floating gate
            const n = Math.round(q * 18);

            for (let i = 0; i < n; i++) {

                const p = parts[i];

                dot(ctx, bx + 62 + p.u * 156, by + 122 + p.v * 36, 4.2, BLUE + "1)");
            }

            // moving tunneling electrons
            if (Math.abs(target - q) > 0.01) {

                for (let i = 0; i < 6; i++) {

                    const ph = (t * 0.5 + i / 6) % 1;
                    const y = target > q ? by + 224 - ph * 70 : by + 154 + ph * 70;

                    dot(ctx, bx + 80 + i * 28, y, 4, "rgba(255,255,255,.95)");
                }
            }

            // transfer curves
            const g = plot(ctx, {
                box: [380, 40, 270, 230], x: [0, 7], y: [1e-12, 1e-3], logy: true,
                xt: [[0, "0"], [2, "2"], [4, "4"], [6, "6"]], yt: [[1e-12, "1 pA"], [1e-9, "1 nA"], [1e-6, "1 µA"], [1e-3, "1 mA"]],
                xl: "control-gate voltage (V)", yl: "read current (A)",
                curves: [
                    { pts: sample(function (v) { return cur(v, 1); }, 0, 7, 100), col: TEAL + ".9)", w: 2.4, dash: [6, 4] },
                    { pts: sample(function (v) { return cur(v, vth()); }, 0, 7, 100), col: GOLD + ".98)", w: 3.2 }
                ]
            });

            ctx.strokeStyle = TEXT + ".5)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(g.sx(VREAD), 40); ctx.lineTo(g.sx(VREAD), 270); ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "read voltage", g.sx(VREAD) + 4, 54, 11, TEXT + ".85)", "start");
            txt(ctx, "erased", 640, 60, 12, TEAL + "1)", "end", true);
            txt(ctx, "this cell", 640, 78, 12, GOLD + "1)", "end", true);
            dot(ctx, g.sx(VREAD), g.sy(Math.max(cur(VREAD, vth()) * 1e-3, 1e-12)), 6, GOLD + "1)");
        }

        animate(root, function (dt) {

            t += dt;

            // about 6 seconds from erased to programmed, easy to follow
            const rate = dt / 6;

            if (q < target) { q = Math.min(target, q + rate); } else if (q > target) { q = Math.max(target, q - rate); }

            readout();
            draw();
        });

        wire(root, state, defaults, update);
        update();
        readout();
        draw();
    };


    SIMS["fet-mlc"] = function (root) {

        const defaults = { bits: 2, wear: 0 };
        const state = { bits: 2, wear: 0 };
        const seen = {};
        const ENDURANCE = { 1: "about 100,000", 2: "about 10,000", 3: "about 3,000", 4: "about 1,000" };

        root.innerHTML =
            head("Try it: pack more bits into one cell") +
            canvasFor(680, 320, "A histogram of threshold voltages across many cells. With one bit per cell there are two humps with a wide gap between them. With more bits per cell there are more humps squeezed into the same range, and as the cells wear out the humps widen and overlap, which causes read errors.") +
            '<div class="fd-stat-row">' + stat("Levels per cell", "lv") + stat("Capacity vs one bit", "cap") + stat("Raw read errors", "err") + stat("Typical endurance (cycles)", "end") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Bits per cell", "bits", [["1", "1 (SLC)"], ["2", "2 (MLC)"], ["3", "3 (TLC)"], ["4", "4 (QLC)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Wear: program/erase cycles used (hundreds)", key: "wear", min: 0, max: 30, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">A cell holds n bits by storing one of 2<sup>n</sup> charge levels, so the window between the lowest and highest threshold is divided into 2<sup>n</sup> − 1 gaps. Wear damages the tunnel oxide, which widens each hump. More bits per cell means a cheaper bit, a slower cell and a shorter life. (Illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function sigma() { return 0.035 + state.wear / 100 * 0.10; }

        function rawErrors() {

            const n = Math.pow(2, state.bits);
            const gap = 5 / (n - 1);
            const s = sigma() * (1 + state.bits * 0.15);
            const pErr = erfc((gap / 2) / (s * Math.SQRT2)) / 2;

            return pErr * 2 * (n - 1) / n;
        }

        function update() {

            setVal(root, "wear", state.wear * 100);

            const n = Math.pow(2, state.bits);
            const e = rawErrors();

            seen[state.bits] = true;

            out(root, "lv", n);
            out(root, "cap", state.bits + "×");
            out(root, "err", e < 1e-9 ? "≈ 0" : H.sci(e));
            out(root, "end", ENDURANCE[state.bits]);
            out(root, "verdict", e > 0.01 ? "The humps overlap: many cells are read as the wrong level. Error-correcting codes struggle" :
                e > 1e-4 ? "Getting noisy: strong error correction is needed to keep the data safe" : "Clean gaps between the levels: every cell reads correctly");

            if (seen[1] && seen[4]) {
                F.reward("fet-mlc", 10, "You packed four bits into a cell");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 320);

            const n = Math.pow(2, state.bits);
            const s = sigma() * (1 + state.bits * 0.15);
            const x0 = 40;
            const x1 = 640;
            const base = 250;
            const sx = function (v) { return x0 + (v + 0.4) / 5.8 * (x1 - x0); };

            const cols = [TEAL, BLUE, GOLD, ROSE];

            for (let k = 0; k < n; k++) {

                const mu = k * 5 / (n - 1);

                ctx.beginPath();
                ctx.moveTo(sx(mu - 4 * s), base);

                for (let v = mu - 4 * s; v <= mu + 4 * s; v += s / 6) {

                    const h = Math.exp(-0.5 * Math.pow((v - mu) / s, 2)) * (190 / Math.max(1, Math.sqrt(n / 2)));

                    ctx.lineTo(sx(v), base - Math.min(h * (0.1 / s), 205));
                }

                ctx.lineTo(sx(mu + 4 * s), base);
                ctx.closePath();
                ctx.fillStyle = cols[k % 4] + ".45)";
                ctx.fill();
                ctx.strokeStyle = cols[k % 4] + ".95)";
                ctx.lineWidth = 2;
                ctx.stroke();

                const label = state.bits === 1 ? (k ? "0" : "1") : (state.bits === 2 ? ["11", "10", "00", "01"][k] : k.toString(2).padStart(state.bits, "0"));

                txt(ctx, label, sx(mu), base + 18, 11, TEXT + ".85)", "center", true);
            }

            // read thresholds
            ctx.strokeStyle = TEXT + ".4)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.2;

            for (let k = 0; k < n - 1; k++) {

                const m = (k + 0.5) * 5 / (n - 1);

                ctx.beginPath(); ctx.moveTo(sx(m), 30); ctx.lineTo(sx(m), base); ctx.stroke();
            }

            ctx.setLineDash([]);
            ctx.strokeStyle = GREY + ".6)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x1, base); ctx.stroke();
            txt(ctx, "threshold voltage →", 340, 300, 12, TEXT + ".8)");
            txt(ctx, "number of cells ↑", 80, 24, 12, TEXT + ".8)", "start");
            txt(ctx, "dashed lines: read thresholds", 640, 24, 12, TEXT + ".7)", "end");
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-flashq"] = quiz(
        "Game: how does Flash store a bit?",
        ["Floating gate", "Charge-trap layer", "3D NAND stack", "Threshold shift"],
        [
            { q: "A conductive polysilicon island, fully wrapped in oxide, holds the electrons.", a: "Floating gate", why: "The classic cell." },
            { q: "A silicon-nitride film holds the electrons in many separate traps.", a: "Charge-trap layer", why: "One pinhole does not drain the whole cell." },
            { q: "Cells are strung vertically in tall columns, over a hundred layers high.", a: "3D NAND stack", why: "Density grows by building up." },
            { q: "How the stored electrons are actually read.", a: "Threshold shift", why: "Trapped charge changes the threshold voltage." },
            { q: "Used in today's densest SSDs, with the cells wrapped around a vertical channel.", a: "3D NAND stack", why: "Dozens to hundreds of layers." },
            { q: "Fewer charges stored on the gate, read as a lower value.", a: "Threshold shift", why: "Charge in, Vth up. Charge out, Vth down." }
        ],
        5,
        "fet-flashq-done",
        "You know how Flash remembers",
        "A trapped charge shifts the threshold, and the cell reads that shift.",
        "A trapped charge shifts the threshold. Hit Reset to try again."
    );


    /* ======================================
       UNIT 34: HIGH-K, METAL GATE, STRAIN
    ====================================== */

    const DIEL = {
        sio2: { name: "SiO₂", k: 3.9, b: 1 },
        si3n4: { name: "Si₃N₄", k: 7.5, b: 0.45 },
        al2o3: { name: "Al₂O₃", k: 9, b: 0.5 },
        hfo2: { name: "HfO₂", k: 20, b: 0.25 },
        zro2: { name: "ZrO₂", k: 25, b: 0.23 }
    };

    SIMS["fet-highk"] = function (root) {

        const defaults = { mat: "hfo2", tinv: 1.5, gate: "metal" };
        const state = { mat: "hfo2", tinv: 1.5, gate: "metal" };
        const seen = {};

        root.innerHTML =
            head("Try it: same control, thicker film") +
            canvasFor(680, 330, "A side view of a gate stack drawn to scale: a gate on top, a dielectric film, then silicon. A dashed outline shows the thickness of silicon dioxide that would give the same capacitance. A high-k film is much thicker than that outline, which is what cuts the tunneling leakage.") +
            '<div class="fd-stat-row">' + stat("Film thickness", "t") + stat("Equivalent oxide (EOT)", "eot") + stat("Leakage vs SiO₂ at the same EOT", "red") + stat("Leakage of 0.5 cm² of gate", "chip") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Dielectric", "mat", [["sio2", "SiO₂ (k = 3.9)"], ["si3n4", "Si₃N₄ (7.5)"], ["al2o3", "Al₂O₃ (9)"], ["hfo2", "HfO₂ (≈ 20)"], ["zro2", "ZrO₂ (≈ 25)"]]) +
            seg("Gate material", "gate", [["poly", "Polysilicon"], ["metal", "Metal"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Target electrical thickness (what the channel feels)", key: "tinv", min: 1.0, max: 2.5, step: 0.05, value: 1.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">EOT = t<sub>film</sub> × (3.9 ÷ k). The channel feels the dielectric plus about 0.4 nm from the quantum width of the inversion layer, plus another 0.4 nm if the gate is polysilicon, which depletes. A metal gate removes that extra term, so the dielectric can stay thicker. (Leakage numbers illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function calc() {

            const d = DIEL[state.mat];
            const eot = Math.max(0.2, state.tinv - 0.4 - (state.gate === "poly" ? 0.4 : 0));
            const t = eot * d.k / 3.9;
            const j0 = Math.pow(10, (1.5 - eot) / 0.22);
            const red = Math.pow(10, -d.b * (t - eot) / 0.22 * (state.mat === "sio2" ? 0 : 1));
            const jj = j0 * (state.mat === "sio2" ? 1 : red);

            return { eot: eot, t: t, red: state.mat === "sio2" ? 1 : red, j: jj };
        }

        function update() {

            setVal(root, "tinv", state.tinv.toFixed(2) + " nm");

            const c = calc();

            seen[state.mat] = true;

            out(root, "t", c.t.toFixed(1) + " nm");
            out(root, "eot", c.eot.toFixed(2) + " nm");
            out(root, "red", c.red >= 0.9 ? "none" : "÷ " + H.sci(1 / c.red));
            out(root, "chip", H.eng(c.j * 0.5, "A"));
            out(root, "verdict", c.j * 0.5 > 5 ? "This much gate leakage would drain a battery: the film is too thin to hold back the electrons" :
                state.gate === "poly" ? "Polysilicon depletion eats 0.4 nm of control: the dielectric has to be thinner, so it leaks more" :
                    state.mat === "sio2" ? "Plain SiO₂ at this thickness leaks too much. Try a high-k film" : "A thick, high-k film gives the same control with far less tunneling");

            if (seen.sio2 && seen.hfo2) {
                F.reward("fet-highk", 10, "You swapped SiO₂ for high-k");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const c = calc();
            const sc = 14; // px per nm
            const x0 = 150;
            const w = 380;
            const base = 250;
            const tpx = Math.max(2, c.t * sc);
            const epx = c.eot * sc;

            ctx.fillStyle = GREY + ".42)"; ctx.fillRect(x0, base, w, 60);
            txt(ctx, "silicon channel", x0 + w / 2, base + 38, 13, TEXT + ".9)");

            ctx.fillStyle = (state.mat === "sio2" ? BLUE : GOLD) + ".6)"; ctx.fillRect(x0, base - tpx, w, tpx);
            txt(ctx, DIEL[state.mat].name + "  ·  " + c.t.toFixed(1) + " nm", x0 + w + 10, base - tpx / 2 + 4, 13, (state.mat === "sio2" ? BLUE : GOLD) + "1)", "start", true);

            ctx.strokeStyle = BLUE + ".95)"; ctx.setLineDash([6, 4]); ctx.lineWidth = 2;
            ctx.strokeRect(x0 + 2, base - epx, w - 4, epx);
            ctx.setLineDash([]);
            txt(ctx, "same control from SiO₂: " + c.eot.toFixed(2) + " nm", x0 - 10, base - epx / 2 + 4, 12, BLUE + "1)", "end", true);

            const gh = 46;

            ctx.fillStyle = (state.gate === "poly" ? ROSE : TEAL) + ".6)";
            ctx.fillRect(x0, base - tpx - gh, w, gh);
            txt(ctx, state.gate === "poly" ? "polysilicon gate (depletes: +0.4 nm)" : "metal gate", x0 + w / 2, base - tpx - gh / 2 + 5, 13, TEXT + ".95)", "center", true);

            if (state.gate === "poly") {

                ctx.fillStyle = ROSE + ".35)";
                ctx.fillRect(x0, base - tpx - 12, w, 12);
                txt(ctx, "depleted layer", x0 + w - 10, base - tpx - 3, 10, TEXT + ".9)", "end");
            }

            // tunneling arrows scaled by leakage
            const nA = clamp(Math.round(Math.log10(1 + c.j) * 2.2), 0, 8);

            for (let i = 0; i < nA; i++) {

                arrowLine(ctx, x0 + 40 + i * 42, base + 40, x0 + 40 + i * 42, base - tpx - 5, ROSE + ".8)", 2);
            }

            txt(ctx, nA > 0 ? "electrons tunneling through" : "no measurable tunneling", x0 + w / 2, 22, 12, (nA > 0 ? ROSE : TEAL) + "1)", "center", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-strain"] = function (root) {

        const defaults = { eps: 0 };
        const state = { eps: 0 };
        const seen = {};

        root.innerHTML =
            head("Try it: stretch or squeeze the crystal") +
            canvasFor(680, 330, "A grid of silicon atoms. Dragging the strain slider to the right stretches the lattice, which is tensile strain, and to the left squeezes it, which is compressive strain. Two bars show how much faster electrons and holes move as a result.") +
            '<div class="fd-stat-row">' + stat("Strain", "eps") + stat("Electron mobility", "me") + stat("Hole mobility", "mh") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Strain (negative = squeezed, positive = stretched)", key: "eps", min: -1.5, max: 1.5, step: 0.1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Strain changes the band structure, so carriers have a lower effective mass or scatter less. Tensile strain helps electrons (NMOS); compressive strain helps holes (PMOS). Real chips apply it with SiGe in the source and drain for PMOS, and stressed nitride films for NMOS. (Mobility factors illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function me() { return state.eps >= 0 ? 1 + 0.55 * state.eps : Math.max(0.4, 1 + 0.35 * state.eps); }
        function mh() { return state.eps <= 0 ? 1 - 0.7 * state.eps : Math.max(0.5, 1 - 0.3 * state.eps); }

        function update() {

            setVal(root, "eps", (state.eps >= 0 ? "+" : "") + state.eps.toFixed(1) + "%");

            seen[state.eps > 0.5 ? "tensile" : state.eps < -0.5 ? "compressive" : "mid"] = true;

            out(root, "eps", (state.eps >= 0 ? "+" : "") + state.eps.toFixed(1) + "%" + (state.eps > 0 ? " (tensile)" : state.eps < 0 ? " (compressive)" : ""));
            out(root, "me", "× " + me().toFixed(2));
            out(root, "mh", "× " + mh().toFixed(2));
            out(root, "verdict", state.eps > 0.3 ? "Stretched: electrons gain speed, holes lose a little. This helps NMOS" :
                state.eps < -0.3 ? "Squeezed: holes gain speed, electrons lose some. This helps PMOS" : "Relaxed silicon: the baseline mobility for both carriers");

            if (seen.tensile && seen.compressive) {
                F.reward("fet-strain", 10, "You tuned mobility with strain");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const sp = 36 * (1 + state.eps / 100 * 6); // exaggerated for visibility
            const rows = 5;
            const cols = 12;
            const x0 = 30;
            const y0 = 30;

            ctx.strokeStyle = GREY + ".4)"; ctx.lineWidth = 2;

            for (let r = 0; r < rows; r++) {

                for (let c = 0; c < cols; c++) {

                    const x = x0 + c * sp;
                    const y = y0 + r * 36;

                    if (c < cols - 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sp, y); ctx.stroke(); }
                    if (r < rows - 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 36); ctx.stroke(); }
                }
            }

            for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { dot(ctx, x0 + c * sp, y0 + r * 36, 6, GREY + ".95)"); } }

            const col = state.eps > 0.05 ? GOLD : state.eps < -0.05 ? BLUE : TEXT;

            txt(ctx, state.eps > 0.05 ? "◀ stretched ▶" : state.eps < -0.05 ? "▶ squeezed ◀" : "relaxed lattice", 340, 206, 13, col + "1)", "center", true);

            // bars
            const bars = [["electrons", me(), TEAL], ["holes", mh(), ROSE]];

            bars.forEach(function (b, i) {

                const y = 226 + i * 44;

                txt(ctx, b[0], 30, y + 20, 13, TEXT + ".9)", "start", true);
                ctx.fillStyle = GREY + ".15)"; ctx.fillRect(130, y, 500, 28);
                ctx.fillStyle = b[2] + ".8)"; ctx.fillRect(130, y, 500 * (b[1] / 2), 28);
                ctx.strokeStyle = TEXT + ".7)"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(130 + 250, y - 3); ctx.lineTo(130 + 250, y + 31); ctx.stroke();
                txt(ctx, "× " + b[1].toFixed(2), 130 + 500 * (b[1] / 2) + 8, y + 20, 13, TEXT + ".95)", "start", true);
            });

            txt(ctx, "unstrained = 1.00", 380, 218, 11, TEXT + ".7)", "start");
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-hkq"] = quiz(
        "Game: what problem does it solve?",
        ["High-k dielectric", "Metal gate", "Strain"],
        [
            { q: "Keeps the gate capacitance high while making the film thick enough to stop tunneling.", a: "High-k dielectric", why: "More capacitance per nanometer." },
            { q: "Removes the depletion layer that polysilicon gates form and fixes the work function.", a: "Metal gate", why: "No poly depletion, tunable Vth." },
            { q: "Makes electrons or holes move faster, without changing the geometry.", a: "Strain", why: "A change in the band structure." },
            { q: "SiGe grown in the source and drain squeezes the PMOS channel.", a: "Strain", why: "Compressive strain helps holes." },
            { q: "HfO₂ is the standard material for this.", a: "High-k dielectric", why: "Introduced at 45 nm in 2007." },
            { q: "Different work-function metals set the threshold of NMOS and PMOS.", a: "Metal gate", why: "Without changing the channel doping." }
        ],
        5,
        "fet-hkq-done",
        "You know the three big transistor upgrades",
        "High-k keeps the control, metal fixes the gate, strain speeds the carriers.",
        "High-k, metal gate, strain. Hit Reset to try again."
    );


    /* ======================================
       UNIT 35: FINFET
    ====================================== */

    SIMS["fet-finfet"] = function (root) {

        const defaults = { h: 50, w: 7, n: 2, p: 30 };
        const state = { h: 50, w: 7, n: 2, p: 30 };
        const seen = {};

        root.innerHTML =
            head("Try it: design a fin") +
            canvasFor(680, 330, "A cross-section across several silicon fins standing on a substrate, with a gate wrapped over the top and both sides of each fin. The conducting width of each fin is its height twice plus its top width. A planar transistor of the same footprint is drawn beside it for comparison.") +
            '<div class="fd-stat-row">' + stat("Width per fin (2H + W)", "wf") + stat("Total drive width", "weff") + stat("Footprint", "foot") + stat("Drive vs planar, same footprint", "gain") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Fin height H", key: "h", min: 20, max: 70, step: 1, value: 50 }) +
            slider({ label: "Fin width W", key: "w", min: 4, max: 20, step: 1, value: 7 }) +
            slider({ label: "Number of fins", key: "n", min: 1, max: 6, step: 1, value: 2 }) +
            slider({ label: "Fin pitch", key: "p", min: 20, max: 60, step: 1, value: 30 }) +
            "</div>" +
            '<p class="fd-sim-formula">W<sub>eff</sub> = N × (2H<sub>fin</sub> + W<sub>fin</sub>). The width adds up in height instead of area, so a tall, thin fin drives much more current than a planar device on the same footprint. For good control the fin must stay thin: W<sub>fin</sub> below about two-thirds of the gate length. Width comes in whole fins, never fractions.</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function update() {

            setVal(root, "h", state.h + " nm");
            setVal(root, "w", state.w + " nm");
            setVal(root, "n", state.n);
            setVal(root, "p", state.p + " nm");

            const wf = 2 * state.h + state.w;
            const weff = state.n * wf;
            const foot = state.n * state.p;

            seen[state.h > 55 ? "tall" : state.h < 30 ? "short" : "mid"] = true;

            out(root, "wf", wf + " nm");
            out(root, "weff", weff + " nm");
            out(root, "foot", foot + " nm");
            out(root, "gain", (weff / foot).toFixed(1) + "×");
            out(root, "verdict", state.w > 14 ? "A fat fin: the middle of it is far from the gate, and control is weaker" :
                state.p < state.w + 8 ? "Fins this close together will not leave room for the gate between them" :
                    weff / foot > 3 ? "Tall, thin fins pack a lot of conducting width into a small footprint" : "Taller fins would drive more current from the same footprint");

            if (seen.tall && seen.short) {
                F.reward("fet-finfet", 10, "You traded fin height against footprint");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const sc = 3.4;
            const base = 270;
            const n = state.n;
            const w = state.w * sc;
            const h = state.h * sc;
            const pitch = state.p * sc;
            const total = (n - 1) * pitch + w;
            const x0 = 40 + (400 - total) / 2;

            ctx.fillStyle = GREY + ".42)"; ctx.fillRect(20, base, 440, 40);
            txt(ctx, "silicon substrate", 240, base + 28, 12, TEXT + ".85)");

            // oxide in between, a little lower than the fin top
            ctx.fillStyle = BLUE + ".3)"; ctx.fillRect(20, base - h * 0.28, 440, h * 0.28);

            // gate wrap
            for (let i = 0; i < n; i++) {

                const fx = x0 + i * pitch;

                ctx.fillStyle = GOLD + ".72)";
                ctx.fillRect(fx - 5, base - h - 5, w + 10, h + 5 - h * 0.28);
                ctx.fillStyle = TEAL + ".9)";
                ctx.fillRect(fx, base - h, w, h);
            }

            txt(ctx, "gate (gold) wraps three sides of each fin (teal)", 240, 26, 13, TEXT + ".9)", "center", true);

            // dimension labels
            const f0 = x0;

            ctx.strokeStyle = TEXT + ".8)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(f0 - 14, base - h); ctx.lineTo(f0 - 14, base); ctx.stroke();
            txt(ctx, "H = " + state.h, f0 - 20, base - h / 2, 12, TEXT + ".9)", "end", true);
            txt(ctx, "W = " + state.w, f0 + w / 2, base - h - 12, 12, TEXT + ".9)", "center", true);

            if (n > 1) {

                ctx.beginPath(); ctx.moveTo(x0, base + 54); ctx.lineTo(x0 + pitch, base + 54); ctx.stroke();
                txt(ctx, "pitch " + state.p, x0 + pitch / 2, base + 68, 12, TEXT + ".9)");
            }

            // the planar comparison
            const px = 490;

            txt(ctx, "planar, same footprint", 575, 60, 12, TEXT + ".85)", "center", true);
            ctx.fillStyle = GREY + ".42)"; ctx.fillRect(px, base, 170, 40);
            ctx.fillStyle = GOLD + ".72)"; ctx.fillRect(px + 20, base - 24, 130, 16);
            ctx.fillStyle = TEAL + ".9)"; ctx.fillRect(px + 20, base - 6, 130, 6);
            txt(ctx, "width = footprint", 575, base - 36, 12, TEXT + ".85)");

            const ratio = (n * (2 * state.h + state.w)) / (n * state.p);

            txt(ctx, "FinFET: " + ratio.toFixed(1) + "× the planar drive", 575, 140, 13, GOLD + "1)", "center", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-wrap"] = function (root) {

        const defaults = { sides: 3, L: 20 };
        const state = { sides: 3, L: 20 };
        const seen = {};
        const LAM = { 1: 10, 2: 7.1, 3: 5.8, 4: 5.0 };
        const NAMES = { 1: "planar (one side)", 2: "double gate (two sides)", 3: "FinFET (three sides)", 4: "gate-all-around (four sides)" };

        root.innerHTML =
            head("Try it: how many sides does the gate wrap?") +
            canvasFor(680, 340, "On the left, a square channel cross-section with the gate drawn on one, two, three or all four sides. On the right, a graph of subthreshold swing against channel length for all four gate arrangements. More gate sides keep the swing close to the ideal 60 millivolts per decade down to shorter channels.") +
            '<div class="fd-stat-row">' + stat("Gate", "g") + stat("Natural length λ", "lam") + stat("Swing at this L", "ss") + stat("DIBL at this L", "dibl") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Gate wraps", "sides", [["1", "1 side"], ["2", "2 sides"], ["3", "3 sides"], ["4", "4 sides"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Gate length L", key: "L", min: 8, max: 40, step: 1, value: 20 }) +
            "</div>" +
            '<p class="fd-sim-formula">A short channel stays well controlled as long as L is more than a few natural lengths λ, where λ ≈ √(ε<sub>Si</sub>/ε<sub>ox</sub> · t<sub>Si</sub> · t<sub>ox</sub>) shrinks with every extra gate side. Roughly: S ≈ 60 + 130·e<sup>−L/1.4λ</sup> mV/dec. (Illustrative λ for each arrangement.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function ss(L, s) { return 60 + 130 * Math.exp(-L / (1.4 * LAM[s])); }
        function dibl(L, s) { return 400 * Math.exp(-L / (1.1 * LAM[s])); }

        function update() {

            setVal(root, "L", state.L + " nm");

            seen[state.sides] = true;

            out(root, "g", NAMES[state.sides]);
            out(root, "lam", LAM[state.sides].toFixed(1) + " nm");
            out(root, "ss", ss(state.L, state.sides).toFixed(0) + " mV/dec");
            out(root, "dibl", dibl(state.L, state.sides).toFixed(0) + " mV/V");
            out(root, "verdict", ss(state.L, state.sides) < 70 ? "Excellent: the gate holds the channel and the swing is near the 60 mV limit" :
                ss(state.L, state.sides) < 90 ? "Fair control: some leakage is creeping in" : "Poor: at this length the drain has too much say. Wrap the gate on more sides");

            if (seen[1] && seen[4]) {
                F.reward("fet-wrap", 10, "You compared planar to gate-all-around");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 340);

            // cross-section
            const cx = 130;
            const cy = 160;
            const s = 70;
            const n = state.sides;

            ctx.fillStyle = TEAL + ".85)";
            ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
            txt(ctx, "channel", cx, cy + 5, 12, "rgba(6,10,24,.95)", "center", true);

            ctx.fillStyle = GOLD + ".8)";

            // one side: the top; two: top and bottom; three: top and both sides; four: all
            if (n >= 1) { ctx.fillRect(cx - s / 2 - 8, cy - s / 2 - 16, s + 16, 14); }
            if (n === 2 || n === 4) { ctx.fillRect(cx - s / 2 - 8, cy + s / 2 + 2, s + 16, 14); }
            if (n >= 3) { ctx.fillRect(cx - s / 2 - 16, cy - s / 2 - 16, 14, s + 16 + (n === 4 ? 16 : 0)); ctx.fillRect(cx + s / 2 + 2, cy - s / 2 - 16, 14, s + 16 + (n === 4 ? 16 : 0)); }

            if (n === 3) {

                ctx.fillStyle = GREY + ".45)";
                ctx.fillRect(cx - s / 2 - 16, cy + s / 2, s + 32, 30);
                txt(ctx, "substrate", cx, cy + s / 2 + 22, 11, TEXT + ".85)");
            }

            if (n === 1) {

                ctx.fillStyle = GREY + ".45)";
                ctx.fillRect(cx - s / 2, cy + s / 2, s, 30);
                txt(ctx, "substrate", cx, cy + s / 2 + 22, 11, TEXT + ".85)");
            }

            txt(ctx, NAMES[n], cx, 40, 13, GOLD + "1)", "center", true);
            txt(ctx, "gate in gold", cx, 300, 12, GOLD + "1)");

            const g = plot(ctx, {
                box: [300, 30, 340, 240], x: [8, 40], y: [55, 190],
                xt: [[10, "10"], [20, "20"], [30, "30"], [40, "40"]], yt: [[60, "60"], [100, "100"], [150, "150"]],
                xl: "gate length L (nm)", yl: "subthreshold swing (mV/dec)",
                curves: [1, 2, 3, 4].map(function (k) {

                    return {
                        pts: sample(function (L) { return ss(L, k); }, 8, 40, 80),
                        col: [GREY, BLUE, GOLD, TEAL][k - 1] + (k === n ? ".98)" : ".5)"),
                        w: k === n ? 3.6 : 1.8
                    };
                })
            });

            ctx.strokeStyle = TEXT + ".4)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(g.sx(state.L), 30); ctx.lineTo(g.sx(state.L), 270); ctx.stroke();
            ctx.setLineDash([]);
            dot(ctx, g.sx(state.L), g.sy(ss(state.L, n)), 7, GOLD + "1)");

            [[1, "planar", GREY], [2, "2 sides", BLUE], [3, "3 sides", GOLD], [4, "all 4", TEAL]].forEach(function (k, i) {
                txt(ctx, k[1], 632, 50 + i * 16, 11, k[2] + "1)", "end", true);
            });
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-finq"] = quiz(
        "Game: planar or FinFET?",
        ["Planar", "FinFET"],
        [
            { q: "The channel lies flat under a gate that touches only its top surface.", a: "Planar", why: "One gate side." },
            { q: "The gate wraps over the top and both sides of a thin raised silicon fin.", a: "FinFET", why: "Three gate sides." },
            { q: "Width is quantized: you add whole fins, never fractions.", a: "FinFET", why: "Width = number of fins × (2H + W)." },
            { q: "Short-channel leakage got hard to control at 22 nm and below.", a: "Planar", why: "The gate lost its grip on the deep body." },
            { q: "First produced in volume by Intel in 2011 under the name Tri-gate.", a: "FinFET", why: "A change in geometry, not just a shrink." },
            { q: "Drive current grows by making the footprint wider.", a: "Planar", why: "Width is the footprint." }
        ],
        5,
        "fet-finq-done",
        "You know why the transistor stood up",
        "A raised fin gives more width per footprint and more of the channel under the gate.",
        "Planar is flat, FinFET stands up. Hit Reset to try again."
    );


    /* ======================================
       UNIT 36: NANOSHEETS
    ====================================== */

    SIMS["fet-nanosheet"] = function (root) {

        const defaults = { w: 25, n: 3, t: 5 };
        const state = { w: 25, n: 3, t: 5 };
        const seen = {};

        root.innerHTML =
            head("Try it: stack the sheets") +
            canvasFor(680, 330, "A cross-section across a stack of horizontal silicon nanosheets, each completely surrounded by gate material. On the right, a two-fin FinFET of the same footprint is drawn for comparison. More sheets and wider sheets give more drive; thinner sheets give better gate control.") +
            '<div class="fd-stat-row">' + stat("Width per sheet (2W + 2T)", "ws") + stat("Total drive width", "weff") + stat("Two-fin FinFET, same footprint", "fin") + stat("Gate control", "ctl") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Sheet width W", key: "w", min: 8, max: 45, step: 1, value: 25 }) +
            slider({ label: "Sheets in the stack", key: "n", min: 1, max: 5, step: 1, value: 3 }) +
            slider({ label: "Sheet thickness T", key: "t", min: 3, max: 9, step: 0.5, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">With the gate on all four sides, each sheet conducts around its whole perimeter: W<sub>eff</sub> = N × 2(W + T). Unlike fins, the sheet width can be tuned continuously: wide sheets for fast logic, narrow ones for compact memory. Thickness T sets how well the gate controls the sheet, so it must stay thin (about 5 nm or less). (Dimensions illustrative.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function update() {

            setVal(root, "w", state.w + " nm");
            setVal(root, "n", state.n);
            setVal(root, "t", state.t.toFixed(1) + " nm");

            const ws = 2 * (state.w + state.t);
            const weff = state.n * ws;
            const fin = 2 * (2 * 50 + 7);

            seen[state.w > 35 ? "wide" : state.w < 15 ? "narrow" : "mid"] = true;

            out(root, "ws", ws + " nm");
            out(root, "weff", weff + " nm");
            out(root, "fin", fin + " nm");
            out(root, "ctl", state.t <= 5.5 ? "excellent" : state.t <= 7 ? "good" : "weakening");
            out(root, "verdict", weff > fin * 1.15 ? "More drive than the FinFET in the same footprint, with a tunable width" :
                weff < fin * 0.7 ? "Compact, but a lot less current: add sheets or widen them" : "Similar drive to the two-fin device, with tighter gate control all around");

            if (seen.wide && seen.narrow) {
                F.reward("fet-nanosheet", 10, "You tuned a nanosheet stack");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 330);

            const sc = 5;
            const base = 290;
            const w = state.w * sc;
            const t = state.t * sc;
            const gap = 11 * sc;
            const x0 = 40;
            const stackH = state.n * (t + gap);

            ctx.fillStyle = GREY + ".42)"; ctx.fillRect(10, base, 440, 30);

            // gate fills all the space around the sheets
            ctx.fillStyle = GOLD + ".55)";
            ctx.fillRect(x0 - 12, base - stackH - 12, w + 24, stackH + 12);

            for (let i = 0; i < state.n; i++) {

                const y = base - (i + 1) * (t + gap) + gap * 0.45;

                ctx.fillStyle = TEAL + ".95)";
                ctx.fillRect(x0, y, w, t);
            }

            txt(ctx, "gate (gold) surrounds every sheet (teal)", 330, 24, 13, TEXT + ".9)", "center", true);
            txt(ctx, "W = " + state.w, x0 + w / 2, base - stackH - 20, 12, TEXT + ".9)", "center", true);
            txt(ctx, "T = " + state.t.toFixed(1), x0 + w + 20, base - stackH + (t + gap) / 2, 12, TEXT + ".9)", "start", true);

            // FinFET reference with the same footprint: two fins
            const fx = 490;
            const finH = 50 * 2.2;

            ctx.fillStyle = GREY + ".42)"; ctx.fillRect(fx, base, 170, 30);

            [0, 1].forEach(function (i) {

                ctx.fillStyle = GOLD + ".6)"; ctx.fillRect(fx + 30 + i * 76 - 5, base - finH - 5, 21, finH + 5);
                ctx.fillStyle = TEAL + ".95)"; ctx.fillRect(fx + 30 + i * 76, base - finH, 11, finH);
            });

            txt(ctx, "two-fin FinFET", fx + 85, 60, 12, TEXT + ".85)", "center", true);
            txt(ctx, "(H = 50, W = 7)", fx + 85, 76, 11, TEXT + ".7)");
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-cfet"] = function (root) {

        const defaults = { fold: 0 };
        const state = { fold: 0 };
        const seen = {};

        root.innerHTML =
            head("Try it: fold the complementary pair") +
            canvasFor(680, 300, "Two transistors, an NMOS in teal and a PMOS in rose. At the left of the slider they sit side by side, taking up two footprints. As the slider moves to the right the PMOS lifts and sits on top of the NMOS, so the pair needs only one footprint.") +
            '<div class="fd-stat-row">' + stat("Footprint of the pair", "fp") + stat("Height of the stack", "ht") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Fold the PMOS on top of the NMOS", key: "fold", min: 0, max: 1, step: 0.02, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">A complementary FET (CFET) stacks the n-type and p-type nanosheet devices in a single column, which could cut the area of a logic cell by up to about 30 to 50 percent. The price: the two transistors must be built and wired in three dimensions. (Research stage as of this writing.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function update() {

            setVal(root, "fold", Math.round(state.fold * 100) + "%");

            seen[state.fold > 0.9 ? "stacked" : state.fold < 0.1 ? "flat" : "mid"] = true;

            out(root, "fp", (2 - state.fold).toFixed(2) + " ×");
            out(root, "ht", (1 + state.fold).toFixed(2) + " ×");
            out(root, "verdict", state.fold > 0.9 ? "Stacked: the same pair in about half the floor area" : state.fold < 0.1 ? "Side by side: each transistor takes its own footprint" : "Moving the PMOS up halves the area, but the stack gets taller");

            if (seen.stacked && seen.flat) {
                F.reward("fet-cfet", 10, "You folded a CMOS pair into a CFET");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 300);

            const f = state.fold;
            const bx = 150;
            const base = 240;

            ctx.fillStyle = GREY + ".4)"; ctx.fillRect(100, base, 420, 30);

            const pw = 130;
            const ph = 80;
            const nx = bx;
            const nY = base - ph;
            const pxX = bx + pw + 40 - f * (pw + 40);
            const pY = nY - f * (ph + 14);

            ctx.fillStyle = TEAL + ".75)"; ctx.fillRect(nx, nY, pw, ph);
            txt(ctx, "NMOS nanosheets", nx + pw / 2, nY + ph / 2 + 4, 12, TEXT + ".95)", "center", true);
            ctx.fillStyle = ROSE + ".75)"; ctx.fillRect(pxX, pY, pw, ph);
            txt(ctx, "PMOS nanosheets", pxX + pw / 2, pY + ph / 2 + 4, 12, TEXT + ".95)", "center", true);

            ctx.strokeStyle = GOLD + ".9)"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
            ctx.strokeRect(bx - 8, base - 2 - (1 + f) * (ph + 6), (2 - f) * (pw + 40) - 24, (1 + f) * (ph + 6) + 4 );
            ctx.setLineDash([]);
            txt(ctx, "dashed box: the pair's footprint and height", bx - 8, base - 2 - (1 + f) * (ph + 6) - 8, 12, GOLD + "1)", "start", true);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-gaaq"] = quiz(
        "Game: fin, nanosheet or CFET?",
        ["FinFET", "Nanosheet GAA", "CFET"],
        [
            { q: "A tall vertical fin with the gate on three sides.", a: "FinFET", why: "The 2011 to 2020s workhorse." },
            { q: "Stacked horizontal sheets, each fully surrounded by the gate.", a: "Nanosheet GAA", why: "Gate on all four sides of every sheet." },
            { q: "An n-type device sits directly on top of a p-type device.", a: "CFET", why: "Folding the complementary pair." },
            { q: "Channel width can be tuned continuously by drawing wider or narrower sheets.", a: "Nanosheet GAA", why: "No quantization to whole fins." },
            { q: "Width comes only in whole numbers of fins.", a: "FinFET", why: "Quantized width." },
            { q: "Could shrink a standard cell's area by stacking both polarities.", a: "CFET", why: "Two transistors in one footprint." }
        ],
        5,
        "fet-gaaq-done",
        "You can tell the architectures apart",
        "Fin, sheet, then stack: each step wraps the gate more and uses the footprint better.",
        "Fin, sheet, stack. Hit Reset to try again."
    );


    /* ======================================
       UNIT 37: MAKING A TRANSISTOR
    ====================================== */

    const FLOW = [
        { n: "Bare wafer", d: "A polished p-type silicon wafer is the blank canvas. Everything that follows is built on its top few hundred nanometers." },
        { n: "Isolation (STI)", d: "Trenches are etched, filled with oxide and polished flat, fencing each transistor off from its neighbors." },
        { n: "Well and threshold implants", d: "Ion implantation sets the doping of the well and of the channel, and with it the threshold voltage." },
        { n: "Gate stack and patterning", d: "A thin gate dielectric and a placeholder gate are deposited and then etched into lines with lithography." },
        { n: "Extensions and halos", d: "Shallow implants, aligned to the gate, form lightly doped source/drain tips and halo pockets that fight short-channel effects." },
        { n: "Spacers", d: "A conformal nitride film is etched back, leaving walls on each side of the gate that set the distance to the source and drain." },
        { n: "Source and drain", d: "Heavy doping, often grown as strained SiGe or Si:P epitaxy, followed by an anneal to activate the dopants." },
        { n: "Silicide contacts", d: "A metal such as nickel-platinum reacts with the silicon to make a low-resistance contact on the source and drain." },
        { n: "Dielectric fill and polish", d: "Oxide fills the gaps and chemical-mechanical polishing exposes the top of the gate." },
        { n: "Replacement metal gate", d: "The placeholder is etched out and replaced with the high-k dielectric and work-function metals, then tungsten or cobalt fill." },
        { n: "Contacts and first metal", d: "Contact holes are filled with metal and the first wiring level connects the transistor to the circuit." }
    ];

    SIMS["fet-fabflow"] = function (root) {

        const defaults = { step: 0 };
        const state = { step: 0 };
        let playing = false;
        let clock = 0;
        const seen = {};

        root.innerHTML =
            head("Try it: build a transistor, layer by layer") +
            canvasFor(680, 300, "A side cross-section of a transistor being built, one process step at a time. Layers are added in order from a bare wafer to isolation trenches, doped wells, the gate, spacers, source and drain, silicide, dielectric, the metal gate, and the first wiring.") +
            '<div class="fd-stat-row">' + stat("Step", "n") + stat("Now", "name") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="desc" style="font-size:15px;line-height:1.5"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-prev>← Step back</button> <button type="button" class="fd-sim-btn" data-play>▶ Play</button> <button type="button" class="fd-sim-btn" data-next>Next step →</button></div>' +
            '<p class="fd-sim-formula">A modern chip repeats this kind of sequence, with dozens of mask layers and well over a thousand individual process steps. Play advances one step about every 6 seconds. (Simplified: gate-last flow, planar for clarity.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");
        const playBtn = root.querySelector("[data-play]");

        function go(k) {

            state.step = clamp(k, 0, FLOW.length - 1);
            seen[state.step] = true;
            clock = 0;

            out(root, "n", (state.step + 1) + " of " + FLOW.length);
            out(root, "name", FLOW[state.step].n);
            out(root, "desc", FLOW[state.step].d);

            if (state.step === FLOW.length - 1) {
                F.reward("fet-fabflow", 10, "You built a transistor from bare silicon to metal");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 300);

            const s = state.step;
            const W = 680;
            const top = 150;
            const bot = 270;
            const gx0 = 290;
            const gx1 = 390;

            // wafer
            ctx.fillStyle = GREY + ".42)";
            ctx.fillRect(20, top, W - 40, bot - top);
            txt(ctx, "p-type silicon", 60, bot - 10, 12, TEXT + ".8)", "start");

            // STI
            if (s >= 1) {

                ctx.fillStyle = BLUE + ".55)";
                ctx.fillRect(20, top, 80, 48);
                ctx.fillRect(W - 100, top, 80, 48);
                txt(ctx, "STI", 60, top + 28, 12, TEXT + ".95)", "center", true);
                txt(ctx, "STI", W - 60, top + 28, 12, TEXT + ".95)", "center", true);
            }

            // well
            if (s === 2) {

                ctx.strokeStyle = ROSE + ".9)"; ctx.lineWidth = 2;

                for (let i = 0; i < 9; i++) { arrowLine(ctx, 130 + i * 52, top - 50, 130 + i * 52, top - 4, ROSE + ".9)", 2); }

                txt(ctx, "implant", 340, top - 56, 12, ROSE + "1)", "center", true);
            }

            if (s >= 2) {

                ctx.fillStyle = ROSE + ".12)";
                ctx.fillRect(100, top, W - 200, 90);
            }

            // gate: dummy poly, later metal
            const gateTop = top - 62;

            if (s >= 3) {

                ctx.fillStyle = BLUE + ".7)";
                ctx.fillRect(gx0, top - 4, gx1 - gx0, 4);

                if (s < 9) {

                    ctx.fillStyle = GREY + ".95)";
                    ctx.fillRect(gx0 + 6, gateTop, gx1 - gx0 - 12, 58);
                    txt(ctx, "placeholder gate", (gx0 + gx1) / 2, gateTop + 35, 10, "rgba(6,10,24,.95)", "center", true);
                } else {

                    ctx.fillStyle = GOLD + ".85)";
                    ctx.fillRect(gx0 + 6, gateTop, gx1 - gx0 - 12, 58);
                    ctx.fillStyle = TEAL + ".8)";
                    ctx.fillRect(gx0 + 6, top - 18, gx1 - gx0 - 12, 14);
                    txt(ctx, "metal gate", (gx0 + gx1) / 2, gateTop + 32, 11, "rgba(6,10,24,.95)", "center", true);
                }
            }

            // extension implants (step 4) and S/D
            if (s === 4) {

                for (let i = 0; i < 3; i++) {

                    arrowLine(ctx, 160 + i * 20, top - 50, 160 + i * 20, top - 4, ROSE + ".9)", 2);
                    arrowLine(ctx, 440 + i * 20, top - 50, 440 + i * 20, top - 4, ROSE + ".9)", 2);
                }
            }

            if (s >= 4) {

                ctx.fillStyle = TEAL + ".4)";
                ctx.fillRect(gx0 - 28, top, 28, 16);
                ctx.fillRect(gx1, top, 28, 16);
            }

            // spacers
            if (s >= 5) {

                ctx.fillStyle = BLUE + ".85)";
                ctx.fillRect(gx0 - 6, gateTop + 2, 12, 60);
                ctx.fillRect(gx1 - 6, gateTop + 2, 12, 60);
                ctx.fillRect(gx0 - 14, top - 14, 12, 14);
                ctx.fillRect(gx1 + 2, top - 14, 12, 14);
            }

            // deep source/drain
            if (s >= 6) {

                ctx.fillStyle = TEAL + ".65)";
                ctx.fillRect(110, top, gx0 - 110 - 14, 62);
                ctx.fillRect(gx1 + 14, top, W - 110 - gx1 - 14, 62);
                txt(ctx, "source", 190, top + 36, 12, "rgba(6,10,24,.95)", "center", true);
                txt(ctx, "drain", 500, top + 36, 12, "rgba(6,10,24,.95)", "center", true);
            }

            // silicide
            if (s >= 7) {

                ctx.fillStyle = GOLD + ".9)";
                ctx.fillRect(110, top - 4, gx0 - 110 - 14, 6);
                ctx.fillRect(gx1 + 14, top - 4, W - 110 - gx1 - 14, 6);
            }

            // dielectric fill
            if (s >= 8) {

                ctx.fillStyle = BLUE + ".28)";
                ctx.fillRect(20, gateTop - 12, gx0 - 6 - 20 - 8, top - gateTop + 8);
                ctx.fillRect(gx1 + 14, gateTop - 12, W - 20 - gx1 - 14, top - gateTop + 8);
            }

            // contacts and metal 1
            if (s >= 10) {

                ctx.fillStyle = TEXT + ".85)";
                ctx.fillRect(170, gateTop - 12, 24, top - gateTop + 6);
                ctx.fillRect(500, gateTop - 12, 24, top - gateTop + 6);
                ctx.fillStyle = GOLD + ".9)";
                ctx.fillRect(130, gateTop - 28, 104, 18);
                ctx.fillRect(460, gateTop - 28, 104, 18);
                txt(ctx, "metal 1", 182, gateTop - 33, 11, GOLD + "1)");
                txt(ctx, "metal 1", 512, gateTop - 33, 11, GOLD + "1)");
            }

            txt(ctx, "step " + (s + 1) + ": " + FLOW[s].n, 340, 22, 15, TEAL + "1)", "center", true);
        }

        root.querySelector("[data-prev]").addEventListener("click", function () { go(state.step - 1); });
        root.querySelector("[data-next]").addEventListener("click", function () { go(state.step + 1); });

        playBtn.addEventListener("click", function () {

            playing = !playing;
            playBtn.textContent = playing ? "⏸ Pause" : "▶ Play";

            if (playing && state.step === FLOW.length - 1) { go(0); }
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            playing = false;
            playBtn.textContent = "▶ Play";
            go(0);
        });

        animate(root, function (dt) {

            if (!playing) { return; }

            clock += dt;

            if (clock >= 6.5) {

                if (state.step < FLOW.length - 1) { go(state.step + 1); } else { playing = false; playBtn.textContent = "▶ Play"; }
            }
        });

        go(0);
    };


    SIMS["fet-selfalign"] = function (root) {

        const defaults = { shift: 10, sa: "off" };
        const state = { shift: 10, sa: "off" };
        const seen = {};
        const LG = 40; // gate length, nm

        root.innerHTML =
            head("Try it: misalign the masks") +
            canvasFor(680, 300, "A top-down view of a gate between a source and a drain. Without self-alignment the source and drain regions are patterned by their own mask, and when the mask shifts one side overlaps the gate too much while the other side leaves a gap in the channel. With self-alignment the gate itself blocks the implant, so both edges line up with the gate however far the masks shift.") +
            '<div class="fd-stat-row">' + stat("Source-side overlap", "os") + stat("Drain-side overlap", "od") + stat("Result", "res") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("How are source and drain made?", "sa", [["off", "Separate mask"], ["on", "Self-aligned to the gate"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Mask misalignment", key: "shift", min: -25, max: 25, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">Gate overlap capacitance C<sub>ov</sub> grows with the overlap, and any gap between the channel and the source or drain adds a huge series resistance. Using the gate as the implant mask removes the problem: the source and drain edges can only land where the gate is. (Illustrative; the design overlap is 3 nm.)</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function edges() {

            const nominal = 3;

            if (state.sa === "on") { return { os: nominal, od: nominal }; }

            return { os: nominal + state.shift, od: nominal - state.shift };
        }

        function update() {

            setVal(root, "shift", (state.shift >= 0 ? "+" : "") + state.shift + " nm");

            const e = edges();
            const gap = Math.min(e.os, e.od) < 0;
            const heavy = Math.max(e.os, e.od) > 12;

            seen[state.sa + (Math.abs(state.shift) > 8 ? "big" : "small")] = true;

            out(root, "os", (e.os >= 0 ? e.os : e.os) + " nm" + (e.os < 0 ? " (gap)" : ""));
            out(root, "od", (e.od >= 0 ? e.od : e.od) + " nm" + (e.od < 0 ? " (gap)" : ""));
            out(root, "res", gap ? "broken channel: huge resistance" : heavy ? "too much overlap: extra capacitance" : "good: small overlap both sides");
            out(root, "verdict", state.sa === "on" ? "Self-aligned: the gate shields the channel from the implant, so the edges line up every time" :
                gap ? "A gap opens between the channel and the drain or source: the transistor barely conducts" :
                    heavy ? "One side overlaps far too much: the parasitic capacitance slows the circuit" : "Lucky: the masks happened to line up");

            if (seen.offbig && seen.onbig) {
                F.reward("fet-selfalign", 10, "You saw why gates are self-aligned");
            }

            draw();
        }

        function draw() {

            clear(ctx, 680, 300);

            const e = edges();
            const sc = 4;
            const cx = 340;
            const gx0 = cx - LG * sc / 2;
            const gx1 = cx + LG * sc / 2;
            const y0 = 90;
            const y1 = 230;

            // wafer
            ctx.fillStyle = GREY + ".3)"; ctx.fillRect(20, y0, 640, y1 - y0);

            // source and drain regions
            const srcEdge = gx0 + e.os * sc;
            const drnEdge = gx1 - e.od * sc;

            ctx.fillStyle = TEAL + ".6)";
            ctx.fillRect(20, y0, srcEdge - 20, y1 - y0);
            ctx.fillRect(drnEdge, y0, 660 - drnEdge, y1 - y0);
            txt(ctx, "source", 120, y0 + 76, 14, TEXT + ".95)", "center", true);
            txt(ctx, "drain", 560, y0 + 76, 14, TEXT + ".95)", "center", true);

            // gate on top
            ctx.fillStyle = GOLD + ".8)";
            ctx.fillRect(gx0, y0 - 20, gx1 - gx0, y1 - y0 + 40);
            txt(ctx, "gate", cx, y0 + 76, 14, "rgba(6,10,24,.95)", "center", true);

            if (state.sa === "off") {

                // the separate mask edges
                ctx.strokeStyle = ROSE + ".95)"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
                ctx.beginPath(); ctx.moveTo(srcEdge, y0 - 10); ctx.lineTo(srcEdge, y1 + 10); ctx.moveTo(drnEdge, y0 - 10); ctx.lineTo(drnEdge, y1 + 10); ctx.stroke();
                ctx.setLineDash([]);
                txt(ctx, "mask edge", srcEdge, y0 - 18, 11, ROSE + "1)", "center", true);
                txt(ctx, "mask edge", drnEdge, y0 - 18, 11, ROSE + "1)", "center", true);
            } else {

                for (let i = 0; i < 7; i++) {

                    arrowLine(ctx, 60 + i * 20, 30, 60 + i * 20, 80, ROSE + ".8)", 2);
                    arrowLine(ctx, 500 + i * 20, 30, 500 + i * 20, 80, ROSE + ".8)", 2);
                }

                txt(ctx, "implant ions (the gate blocks them)", 340, 24, 12, ROSE + "1)", "center", true);
            }

            if (e.os < 0 || e.od < 0) {

                txt(ctx, "GAP", e.os < 0 ? (gx0 + srcEdge) / 2 : (drnEdge + gx1) / 2, y1 + 24, 13, ROSE + "1)", "center", true);
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-flowgame"] = orderGame(
        "Game: the order of a transistor build",
        [
            { n: "Isolation", d: "etch trenches and fill them with oxide", why: "Transistors need walls between them first." },
            { n: "Wells and implants", d: "set the doping of the channel", why: "The channel doping is chosen before the gate exists." },
            { n: "Gate stack", d: "deposit and pattern the gate", why: "The gate then acts as the alignment mark for what follows." },
            { n: "Spacers and source/drain", d: "implant or grow the source and drain", why: "Self-aligned to the gate and spacers." },
            { n: "Contacts", d: "silicide and metal plugs", why: "Only the source, drain and gate are contacted." },
            { n: "Wiring", d: "metal layers and vias", why: "The wiring connects the transistors into circuits." }
        ],
        "fet-flowgame-done",
        "You ordered a transistor build",
        "Tap the six stages in the order they happen.",
        "Isolation, wells, gate, source/drain, contacts, wiring."
    );


    // Chain the last simulator file, then mount whatever is on the page.
    if (!document.getElementById("fabFetScriptH")) {

        const more = document.createElement("script");

        more.id = "fabFetScriptH";
        more.src = "diagram-sims-fet-h.js";

        document.head.appendChild(more);
    }

    document.querySelectorAll('.fd-sim[data-sim^="fet-"]').forEach(F.mount);

})();
