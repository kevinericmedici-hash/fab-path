/* ========================================
   BIOFETS & MOSFETS: INTERACTIVE SIMULATORS, PART 3

   Unit 10: the electrical double layer, Debye length.
   Unit 11: the Nernst limit, sensing insulators, a pH shift.
   Unit 12: reference electrodes, readout.
   Unit 13: drift, hysteresis, temperature, ISFET-REFET pairs.
   Unit 14: receptors, a BioFET binding.
   Unit 15: cleaning, silanes, APTES.
   Unit 16: layers, linkers, receptor density.
   Unit 17: blocking and selectivity.

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
    const art = M.art;
    const stat = M.stat;
    const rect = M.rect;
    const label = M.label;
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
    const KT = H.KT;
    const canvasFor = H.canvasFor;
    const clear = H.clear;
    const txt = H.txt;
    const dot = H.dot;


    /* ======================================
       UNIT 10: THE ELECTRICAL DOUBLE LAYER
    ====================================== */

    function debye(mM) { return 0.304 / Math.sqrt(mM / 1000); } // nm

    SIMS["fet-dl"] = function (root) {

        const defaults = { c: 10, sign: "neg" };
        const state = { c: 10, sign: "neg" };
        const rand = mulberry(5);
        const ions = [];
        const seen = {};

        for (let i = 0; i < 70; i++) { ions.push({ u: rand(), y: rand(), co: i % 9 === 0, ph: rand() * 6 }); }

        root.innerHTML =
            head("Try it: the screening cloud") +
            canvasFor(680, 340, "A charged surface on the left, with a cloud of oppositely charged ions in the liquid that thins out with distance. A curve below shows the potential falling from its value at the surface to zero. Adding salt squeezes the cloud closer to the surface.") +
            '<div class="fd-stat-row">' + stat("Debye length", "ld") + stat("Cloud thickness (3 λD)", "th") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Surface charge", "sign", [["neg", "Negative (silica in water)"], ["pos", "Positive (alumina in water)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Salt concentration (log scale)", key: "c", min: 1, max: 150, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">λ<sub>D</sub> ≈ 0.3 nm ÷ √c (c in mol/L). 1 mM: about 10 nm. 10 mM: about 3 nm. 100 mM: about 1 nm. 150 mM, like physiological saline: about 0.8 nm. In body-like salt, the double layer is under a nanometer thick.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function update() {

            const ld = debye(state.c);

            seen[state.c < 5 ? "low" : state.c > 100 ? "high" : "mid"] = true;
            setVal(root, "c", state.c + " mM");
            out(root, "ld", ld.toFixed(1) + " nm");
            out(root, "th", (3 * ld).toFixed(1) + " nm");
            out(root, "verdict", ld > 6 ? "Little salt: a wide cloud, long reach" : ld < 1.5 ? "Lots of salt: a thin, tight cloud, short reach" : "A medium cloud");

            if (seen.low && seen.high) {
                F.reward("fet-dl", 10, "You squeezed and stretched the double layer");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const x0 = 90;
            const sc = 24; // px per nm
            const ld = debye(state.c);
            const neg = state.sign === "neg";

            // the surface
            ctx.fillStyle = GREY + ".55)";
            ctx.fillRect(40, 20, x0 - 40, 230);
            txt(ctx, "surface", 65, 140, 12, "rgba(6,10,24,.95)", "center", true);

            for (let i = 0; i < 9; i++) { txt(ctx, neg ? "−" : "+", x0 - 12, 42 + i * 25, 18, (neg ? BLUE : ROSE) + "1)", "center", true); }

            // the Stern layer
            ctx.fillStyle = GOLD + ".12)";
            ctx.fillRect(x0, 20, 12, 230);
            txt(ctx, "Stern", x0 + 6, 266, 11, GOLD + "1)");

            // ions: counter-ions follow exp(-x/λ); co-ions are scarce
            ions.forEach(function (ion) {

                const u = clamp(ion.u, 0.001, 0.999);
                const d = -ld * Math.log(1 - u) * (ion.co ? 3 : 1);
                const x = x0 + 14 + Math.min(d * sc, 560 - x0) + Math.sin(t * 1.4 + ion.ph) * 3;
                const y = 30 + ion.y * 210 + Math.cos(t * 1.2 + ion.ph) * 3;
                const counter = !ion.co;
                const col = counter ? (neg ? ROSE : BLUE) : (neg ? BLUE : ROSE);

                dot(ctx, x, y, 4.6, col + ".92)");
            });

            txt(ctx, "solution", 600, 36, 13, TEXT + ".7)");

            // potential curve
            const py = 320;
            const ph = 44;

            ctx.strokeStyle = GREY + ".4)";
            ctx.beginPath();
            ctx.moveTo(x0, py); ctx.lineTo(660, py);
            ctx.stroke();
            ctx.strokeStyle = GOLD + ".95)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let x = 0; x <= 560 - x0; x += 4) {

                const v = Math.exp(-(x / sc) / ld);

                if (x === 0) { ctx.moveTo(x0 + x, py - ph * v); } else { ctx.lineTo(x0 + x, py - ph * v); }
            }

            ctx.stroke();
            txt(ctx, "potential ψ", 130, py - ph - 6, 12, GOLD + "1)", "start");
            ctx.strokeStyle = TEXT + ".8)";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(x0 + ld * sc, py - ph / Math.E - 6); ctx.lineTo(x0 + ld * sc, py + 6);
            ctx.stroke();
            txt(ctx, "λD", x0 + ld * sc + 14, py + 18, 12, TEXT + ".9)", "center", true);
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


    SIMS["fet-debyematch"] = quiz(
        "Game: match the salt to the Debye length",
        ["about 10 nm", "about 3 nm", "about 1 nm", "about 0.8 nm"],
        [
            { q: "1 mM salt", a: "about 10 nm", why: "λD ≈ 0.3 ÷ √0.001 nm." },
            { q: "10 mM salt", a: "about 3 nm", why: "λD ≈ 0.3 ÷ √0.01 nm." },
            { q: "100 mM salt", a: "about 1 nm", why: "λD ≈ 0.3 ÷ √0.1 nm." },
            { q: "150 mM salt, like physiological saline", a: "about 0.8 nm", why: "In body-like salt the double layer is under a nanometer thick." },
        ],
        4,
        "fet-debyematch-done",
        "You can estimate a Debye length",
        "More salt, shorter reach.",
        "λD ≈ 0.3 nm ÷ √c. Hit Reset to try again."
    );


    SIMS["fet-series"] = function (root) {

        const defaults = { cox: 0.35, ldl: 1.3 };
        const state = { cox: 0.35, ldl: 1.3 };
        let hit = false;

        root.innerHTML =
            head("Try it: the double layer is stiff") +
            art("0 0 340 190", "Two capacitors in series, the oxide capacitance and the double-layer capacitance. The combined capacitance is dominated by the smaller one, which is the oxide.") +
            '<div class="fd-stat-row">' + stat("Oxide Cox", "cox") + stat("Double layer Cdl", "cdl") + stat("Together", "tot") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Oxide capacitance (µF/cm²)", key: "cox", min: 0.1, max: 3, step: 0.05, value: 0.35 }) +
            slider({ label: "Double-layer capacitance (log of µF/cm²)", key: "ldl", min: 0, max: 2, step: 0.05, value: 1.3 }) +
            "</div>" +
            '<p class="fd-sim-formula">In typical salt the double layer holds tens of µF/cm², against about 0.35 µF/cm² for a 10 nm oxide. Capacitors in series are dominated by the smaller one, so the gate stack behaves almost like the oxide alone, and the interface potential passes through to the channel.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const cdl = Math.pow(10, state.ldl);
            const tot = 1 / (1 / state.cox + 1 / cdl);

            setVal(root, "cox", state.cox.toFixed(2) + " µF/cm²");
            setVal(root, "ldl", cdl.toFixed(0) + " µF/cm²");
            out(root, "cox", state.cox.toFixed(2) + " µF/cm²");
            out(root, "cdl", cdl.toFixed(1) + " µF/cm²");
            out(root, "tot", tot.toFixed(3) + " µF/cm²  (" + Math.round(tot / state.cox * 100) + " % of Cox)");
            out(root, "verdict", tot / state.cox > 0.9 ? "The oxide sets the gate capacitance: the liquid side adds little" : "The double layer is now comparable: it matters");

            const w = function (c) { return 20 + Math.min(1, c / 60) * 130; };

            svg.innerHTML =
                label(14, 20, "Cox", 8, "start", "var(--text)") + rect(60, 10, w(state.cox), 14, "rgba(120,180,255,.85)") +
                label(14, 54, "Cdl", 8, "start", "var(--text)") + rect(60, 44, w(cdl), 14, "rgba(255,214,102,.85)") +
                label(14, 88, "together", 8, "start", "var(--text)") + rect(60, 78, w(tot), 14, "rgba(84,224,199,.9)") +
                label(14, 130, "bars use a compressed scale: the combined bar is almost the same as the oxide's", 6.5, "start", "var(--muted)");

            if (!hit && state.ldl >= 1.2 && state.cox <= 0.5) {

                hit = true;
                F.reward("fet-series", 10, "You saw the oxide dominate the gate capacitance");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 11: PH RESPONSE AND THE NERNST LIMIT
    ====================================== */

    const INS = {
        sio2: { n: "SiO₂", s: 30, note: "a weak response, and it hydrates over time" },
        si3n4: { n: "Si₃N₄", s: 50, note: "a common, reasonable choice" },
        al2o3: { n: "Al₂O₃", s: 55, note: "near the limit" },
        ta2o5: { n: "Ta₂O₅", s: 57, note: "near the limit, and stable" },
        ideal: { n: "Ideal surface (α = 1)", s: 59.2, note: "the Nernst ceiling" }
    };

    SIMS["fet-nernst"] = function (root) {

        const defaults = { ins: "si3n4", ph: 7.4 };
        const state = { ins: "si3n4", ph: 7.4 };
        const seen = {};

        root.innerHTML =
            head("Try it: the 59 mV per pH ceiling") +
            canvasFor(680, 330, "A plot of the threshold shift against pH. Both lines pass through zero at pH 7. The ideal surface climbs 59 millivolts per pH unit. The chosen insulator climbs more slowly, so the same pH change gives a smaller signal.") +
            '<div class="fd-stat-row">' + stat("Sensitivity", "s") + stat("Fraction of the ceiling (α)", "a") + stat("Threshold shift at this pH", "dv") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Sensing insulator", "ins", Object.keys(INS).map(function (k) { return [k, INS[k].n]; })) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Solution pH", key: "ph", min: 3, max: 11, step: 0.1, value: 7.4 }) +
            "</div>" +
            '<p class="fd-sim-formula">Δψ₀ = −2.3 · (kT/q) · α · ΔpH. At 25 °C, 2.3·kT/q = 59.2 mV per pH unit. A steeper line means a larger signal for the same pH change. A rising pH raises the threshold of an NMOS ISFET.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const m = INS[state.ins];
            const dv = m.s * (state.ph - 7);

            seen[state.ins] = true;
            setVal(root, "ph", state.ph.toFixed(1));
            out(root, "s", m.s.toFixed(m.s === 59.2 ? 1 : 0) + " mV/pH");
            out(root, "a", (m.s / 59.2).toFixed(2));
            out(root, "dv", (dv >= 0 ? "+" : "") + dv.toFixed(0) + " mV");
            out(root, "verdict", m.n + ": " + m.note);

            if (Object.keys(seen).length >= 5) {
                F.reward("fet-nernst", 10, "You compared every sensing insulator");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 90;
            const R = 650;
            const T = 20;
            const B = 285;
            const X = function (p) { return L + (p - 3) / 8 * (R - L); };
            const Y = function (v) { return (T + B) / 2 - v / 260 * ((B - T) / 2); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            ctx.strokeStyle = GREY + ".25)";
            ctx.beginPath();
            ctx.moveTo(L, Y(0)); ctx.lineTo(R, Y(0));
            ctx.stroke();

            for (let p = 3; p <= 11; p += 2) { txt(ctx, "pH " + p, X(p), B + 18, 12, TEXT + ".7)"); }

            [-200, 0, 200].forEach(function (v) { txt(ctx, v + " mV", L - 36, Y(v) + 4, 12, TEXT + ".7)"); });
            txt(ctx, "pH →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "threshold shift ↑", L + 60, T + 4, 12, TEXT + ".75)");

            function line(s, col, w, dash) {

                ctx.strokeStyle = col;
                ctx.lineWidth = w;
                ctx.setLineDash(dash || []);
                ctx.beginPath();
                ctx.moveTo(X(3), Y(s * -4)); ctx.lineTo(X(11), Y(s * 4));
                ctx.stroke();
                ctx.setLineDash([]);
            }

            line(59.2, GREY + ".7)", 2, [6, 5]);
            line(INS[state.ins].s, TEAL + ".98)", 3.5);

            const dvIdeal = 59.2 * (state.ph - 7);
            const dv = INS[state.ins].s * (state.ph - 7);

            dot(ctx, X(state.ph), Y(dvIdeal), 5, GREY + ".95)");
            dot(ctx, X(state.ph), Y(dv), 8, GOLD + "1)");

            txt(ctx, "dashed: ideal 59.2 mV/pH", 520, T + 14, 12, TEXT + ".7)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-insulators"] = quiz(
        "Game: which sensing insulator?",
        ["SiO₂", "Si₃N₄", "Al₂O₃", "Ta₂O₅"],
        [
            { q: "Roughly 20–40 mV/pH: a weak response, and it hydrates over time.", a: "SiO₂", why: "Few active surface sites." },
            { q: "Roughly 45–55 mV/pH: a common, reasonable choice.", a: "Si₃N₄", why: "A solid middle option." },
            { q: "Roughly 53–58 mV/pH: near the Nernst limit.", a: "Al₂O₃", why: "Many active surface sites." },
            { q: "Roughly 55–59 mV/pH: near the limit, and stable.", a: "Ta₂O₅", why: "Nearly ideal and robust." },
            { q: "Which is the weakest pH sensor of the four?", a: "SiO₂", why: "It sits furthest from the ceiling." },
            { q: "Which one does α come closest to 1 for?", a: "Ta₂O₅", why: "Insulators with more active surface sites sit closer to the Nernst limit." }
        ],
        5,
        "fet-insulators-done",
        "You know the sensing insulators",
        "More active surface sites means closer to the Nernst limit.",
        "SiO₂ weak, Si₃N₄ middle, Al₂O₃ and Ta₂O₅ near the ceiling. Hit Reset to try again."
    );


    SIMS["fet-phshift"] = function (root) {

        const defaults = { a: 0.9, d: 0.4, s: 70 };
        const state = { a: 0.9, d: 0.4, s: 70 };
        let hit = false;

        root.innerHTML =
            head("Try it: predict the threshold shift") +
            art("0 0 340 190", "A threshold shift in millivolts and the resulting change in subthreshold drain current, shown as bars.") +
            '<div class="fd-stat-row">' + stat("Sensitivity (α × 59.2)", "sens") + stat("Threshold shift", "dv") + stat("Subthreshold current changes by", "f") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "α (how completely the surface follows pH)", key: "a", min: 0.2, max: 1, step: 0.05, value: 0.9 }) +
            slider({ label: "pH change", key: "d", min: -2, max: 2, step: 0.1, value: 0.4 }) +
            slider({ label: "Subthreshold swing (mV per decade)", key: "s", min: 60, max: 120, step: 5, value: 70 }) +
            "</div>" +
            '<p class="fd-sim-formula">Multiply the pH change by α × 59.2 mV. The lesson\'s example: α = 0.9 gives about 53 mV per pH, so 7.0 to 7.4 shifts Vth by about 21 mV, and at 70 mV per decade the current changes by 10<sup>21/70</sup>, about 2×.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const sens = state.a * 59.2;
            const dv = sens * state.d;
            const f = Math.pow(10, dv / state.s);

            setVal(root, "a", state.a.toFixed(2));
            setVal(root, "d", (state.d >= 0 ? "+" : "") + state.d.toFixed(1));
            setVal(root, "s", state.s + " mV/dec");
            out(root, "sens", sens.toFixed(0) + " mV/pH");
            out(root, "dv", (dv >= 0 ? "+" : "") + dv.toFixed(0) + " mV");
            out(root, "f", f.toFixed(2) + "×");
            out(root, "verdict", Math.abs(state.d - 0.4) < 0.01 && Math.abs(state.a - 0.9) < 0.01 && state.s === 70 ? "The lesson's example: about 21 mV and a 2× current change" : "Multiply the pH change by α × 59.2 mV");

            const w1 = 220 * Math.min(1, Math.abs(dv) / 240);
            const w2 = 220 * Math.min(1, Math.abs(Math.log10(f)) / 3.5);

            svg.innerHTML =
                label(14, 24, "threshold shift: " + dv.toFixed(0) + " mV", 8.5, "start", "var(--text)") +
                rect(14, 32, 250, 16, "rgba(170,179,207,.18)") + rect(14, 32, w1, 16, "rgba(255,214,102,.9)") +
                label(14, 90, "current change: " + f.toFixed(2) + "× (log scale)", 8.5, "start", "var(--text)") +
                rect(14, 98, 250, 16, "rgba(170,179,207,.18)") + rect(14, 98, w2, 16, dv >= 0 ? "rgba(84,224,199,.9)" : "rgba(255,105,120,.85)") +
                label(14, 150, "In subthreshold, a small pH change becomes a large, easy-to-read current change.", 7, "start", "var(--muted)");

            if (!hit && Math.abs(f) >= 10) {

                hit = true;
                F.reward("fet-phshift", 10, "You turned a pH change into a tenfold current change");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 12: REFERENCE ELECTRODES AND READOUT
    ====================================== */

    SIMS["fet-refdrift"] = function (root) {

        const defaults = { d: 0 };
        const state = { d: 0 };
        const TRUE = 7.4;
        let hit = false;

        root.innerHTML =
            head("Try it: a drifting reference looks like a pH change") +
            art("0 0 340 190", "A pH reading scale showing the true pH of the sample and the pH the sensor reports. Drift in the reference electrode moves the reported pH even though the sample has not changed.") +
            '<div class="fd-stat-row">' + stat("True pH", "t") + stat("Reported pH", "r") + stat("Error", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Drift of the reference electrode potential", key: "d", min: -40, max: 40, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">If the reference potential wanders, the threshold appears to move exactly as if the pH had changed. At 53 mV per pH unit, 21 mV of reference drift is a 0.4 pH error. The sensor can only be as stable as its reference.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const rep = TRUE + state.d / 53;

            setVal(root, "d", (state.d >= 0 ? "+" : "") + state.d + " mV");
            out(root, "t", TRUE.toFixed(1));
            out(root, "r", rep.toFixed(2));
            out(root, "e", (rep - TRUE >= 0 ? "+" : "") + (rep - TRUE).toFixed(2) + " pH");
            out(root, "verdict", Math.abs(state.d) < 2 ? "A stable reference: the reading is honest" : "The reference moved, not the sample, but the sensor cannot tell the difference");

            const X = function (p) { return 30 + (p - 6) / 3 * 280; };

            svg.innerHTML =
                rect(30, 70, 280, 18, "rgba(170,179,207,.2)") +
                [6, 7, 8, 9].map(function (p) { return label(X(p), 108, p, 8, "middle", "var(--muted)"); }).join("") +
                '<circle cx="' + X(TRUE) + '" cy="79" r="8" style="fill:#54e0c7;stroke:#fff;stroke-width:1.5"/>' +
                label(X(TRUE), 56, "true pH", 8, "middle", "#54e0c7") +
                '<circle cx="' + X(clamp(rep, 6, 9)) + '" cy="79" r="6" style="fill:#ffd666;stroke:#0b1020;stroke-width:1.5"/>' +
                label(X(clamp(rep, 6, 9)), 140, "reported pH", 8, "middle", "#ffd666");

            if (!hit && Math.abs(rep - TRUE) >= 0.3) {

                hit = true;
                F.reward("fet-refdrift", 10, "You made a drifting reference fake a pH change");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-refquiz"] = quiz(
        "Game: which reference electrode?",
        ["Ag/AgCl", "Pseudo-reference", "Miniaturized on-chip"],
        [
            { q: "A silver wire coated with silver chloride in a fixed chloride solution: stable and well defined.", a: "Ag/AgCl", why: "The stable standard." },
            { q: "A bare Ag/AgCl or Pt wire in the sample: tiny, but its potential shifts with the sample's chloride.", a: "Pseudo-reference", why: "Convenient, less stable." },
            { q: "Trades some stability for size, for portable devices.", a: "Miniaturized on-chip", why: "Small enough for a handheld device." },
            { q: "Most stable choice for a careful lab measurement.", a: "Ag/AgCl", why: "Fixed internal solution." },
            { q: "Its potential depends on the chloride in the sample.", a: "Pseudo-reference", why: "There is no fixed internal solution." }
        ],
        5,
        "fet-refquiz-done",
        "You know your reference electrodes",
        "The choice is a trade between stability and size.",
        "Stable, small, or both. Hit Reset to try again."
    );


    SIMS["fet-readout"] = function (root) {

        const defaults = { mode: "cc", dph: 0.4 };
        const state = { mode: "cc", dph: 0.4 };
        const S = 70;
        const SENS = 53;
        const seen = {};

        root.innerHTML =
            head("Try it: two ways to read the signal") +
            canvasFor(680, 320, "The sensor output plotted against the change in pH. In constant-current mode the output is a threshold shift in millivolts and is almost a straight line. In constant-voltage mode the output is the drain current, which changes exponentially in subthreshold.") +
            '<div class="fd-stat-row">' + stat("What you read", "what") + stat("Value", "val") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Readout", "mode", [["cc", "Constant current: read ΔVth"], ["cv", "Constant voltage: read ΔID"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "pH change of the sample", key: "dph", min: -1, max: 1, step: 0.05, value: 0.4 }) +
            "</div>" +
            '<p class="fd-sim-formula">Constant current: a feedback loop holds I<sub>D</sub> fixed and reports the gate voltage it needs, so the output tracks pH almost linearly. Constant voltage: hold V<sub>GS</sub> and V<sub>DS</sub> fixed and read the drain current: simple, but nonlinear.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function value(dph) {

            const dv = SENS * dph;

            return state.mode === "cc" ? dv : Math.pow(10, dv / S);
        }

        function update() {

            seen[state.mode] = true;
            setVal(root, "dph", (state.dph >= 0 ? "+" : "") + state.dph.toFixed(2));

            const v = value(state.dph);

            out(root, "what", state.mode === "cc" ? "gate voltage shift ΔVth" : "drain current ratio ID / ID₀");
            out(root, "val", state.mode === "cc" ? (v >= 0 ? "+" : "") + v.toFixed(0) + " mV" : v.toFixed(2) + "×");
            out(root, "verdict", state.mode === "cc" ? "A straight line: millivolts track pH" : "Curved: the current doubles for a 0.4 pH step, but is not proportional to pH");

            if (seen.cc && seen.cv) {
                F.reward("fet-readout", 10, "You tried both readout modes");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 90;
            const R = 640;
            const T = 20;
            const B = 270;
            const X = function (p) { return L + (p + 1) / 2 * (R - L); };
            const cc = state.mode === "cc";
            const ymax = cc ? 60 : Math.pow(10, 60 / S);
            const ymin = cc ? -60 : Math.pow(10, -60 / S);
            const Y = function (v) { return B - (v - ymin) / (ymax - ymin) * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [-1, -0.5, 0, 0.5, 1].forEach(function (p) { txt(ctx, (p > 0 ? "+" : "") + p, X(p), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "pH change →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, cc ? "ΔVth (mV) ↑" : "ID ratio ↑", L + 50, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = cc ? TEAL + ".98)" : GOLD + ".98)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let p = -1; p <= 1.001; p += 0.02) {

                const y = Y(value(p));

                if (p === -1) { ctx.moveTo(X(p), y); } else { ctx.lineTo(X(p), y); }
            }

            ctx.stroke();
            dot(ctx, X(state.dph), Y(value(state.dph)), 8, "rgba(255,255,255,1)");

            // straight reference line for comparison
            if (!cc) {

                ctx.strokeStyle = GREY + ".5)";
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(X(-1), Y(ymin)); ctx.lineTo(X(1), Y(ymax));
                ctx.stroke();
                ctx.setLineDash([]);
                txt(ctx, "dashed: a straight line, for comparison", 470, T + 14, 12, TEXT + ".7)");
            }
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-measure"] = orderGame(
        "Game: a real measurement",
        [
            { n: "Dip", d: "put the sensor and the reference electrode in the sample", why: "Both must touch the same solution." },
            { n: "Bias", d: "set VDS and hold the gate bias through the reference electrode", why: "The reference sets the gate potential." },
            { n: "Read", d: "record ΔVth or ΔID", why: "The raw signal." },
            { n: "Calibrate", d: "convert to pH with a calibration line", why: "Known buffers turn millivolts into pH." }
        ],
        "fet-measure-done",
        "You ordered a real measurement",
        "Tap the four steps in the order they happen.",
        "Calibrating in known buffers turns millivolts into pH."
    );


    /* ======================================
       UNIT 13: DRIFT, HYSTERESIS, NOISE
    ====================================== */

    SIMS["fet-limits"] = quiz(
        "Game: drift, hysteresis or noise?",
        ["Drift", "Hysteresis", "Noise"],
        [
            { q: "A slow, one-way creep of the output even at constant pH.", a: "Drift", why: "Water slowly hydrates the insulator." },
            { q: "The reading depends on which pH the sensor saw before.", a: "Hysteresis", why: "The sensor remembers." },
            { q: "Random fluctuations that set the smallest change you can detect.", a: "Noise", why: "It sets the floor." },
            { q: "Go from pH 7 to 4 and back to 7: the reading does not return to its start.", a: "Hysteresis", why: "Slow, deeper sites respond late." },
            { q: "A few millivolts per hour is common for bare SiO₂ or Si₃N₄.", a: "Drift", why: "Denser oxides drift less." },
            { q: "Flicker noise from charge traps at the oxide.", a: "Noise", why: "A major source of noise in transistors." }
        ],
        5,
        "fet-limits-done",
        "You can tell the three limits apart",
        "A good sensor manages all three, not just sensitivity.",
        "Drift creeps, hysteresis remembers, noise jitters. Hit Reset to try again."
    );


    SIMS["fet-drift"] = function (root) {

        const defaults = { r: 2, h: 10 };
        const state = { r: 2, h: 10 };
        let hit = false;

        root.innerHTML =
            head("Try it: a creeping threshold") +
            canvasFor(680, 320, "A plot of the apparent pH over time in a buffer whose pH never changes. The reading creeps in one direction at a rate set by the drift of the threshold, adding up to a large error over a long run.") +
            '<div class="fd-stat-row">' + stat("Error rate", "rate") + stat("Error after the run", "err") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Threshold drift", key: "r", min: 0, max: 10, step: 0.5, value: 2 }) +
            slider({ label: "Length of the run", key: "h", min: 1, max: 24, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">At 2 mV per hour and 53 mV per pH unit, the error grows about 0.04 pH per hour. Over a 10-hour run, that drift adds up to about 0.4 pH of error. Denser oxides drift less.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(8);
        const noise = [];

        for (let i = 0; i < 200; i++) { noise.push((rand() - 0.5) * 0.02); }

        function update() {

            const rate = state.r / 53;

            setVal(root, "r", state.r + " mV/h");
            setVal(root, "h", state.h + " h");
            out(root, "rate", rate.toFixed(3) + " pH per hour");
            out(root, "err", (rate * state.h).toFixed(2) + " pH");
            out(root, "verdict", rate * state.h < 0.1 ? "A well-behaved sensor over this run" : rate * state.h > 0.5 ? "Drift is now the biggest error in the measurement" : "A noticeable error: calibrate again or settle the sensor");

            if (!hit && state.r <= 0.5 && state.h >= 10) {

                hit = true;
                F.reward("fet-drift", 10, "You found a stable, long run");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (h) { return L + h / 24 * (R - L); };
            const Y = function (ph) { return B - (ph + 0.2) / 1.6 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 0.5, 1].forEach(function (p) { txt(ctx, "+" + p.toFixed(1), L - 26, Y(p) + 4, 12, TEXT + ".7)"); });
            [0, 6, 12, 18, 24].forEach(function (h) { txt(ctx, h + " h", X(h), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "time in a fixed-pH buffer →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "apparent pH error ↑", L + 70, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = GREY + ".4)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y(0)); ctx.lineTo(R, Y(0));
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 2.4;
            ctx.beginPath();

            for (let i = 0; i <= state.h * 8; i++) {

                const h = i / 8;
                const y = Y(state.r / 53 * h + noise[i % 200]);

                if (i === 0) { ctx.moveTo(X(h), y); } else { ctx.lineTo(X(h), y); }
            }

            ctx.stroke();

            ctx.strokeStyle = GOLD + ".9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(X(state.h), Y(0)); ctx.lineTo(X(state.h), Y(state.r / 53 * state.h));
            ctx.stroke();
            txt(ctx, (state.r / 53 * state.h).toFixed(2) + " pH", X(state.h) - 40, Y(state.r / 53 * state.h / 2), 13, GOLD + "1)", "center", true);
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-hysteresis"] = function (root) {

        const defaults = { h: 12 };
        const state = { h: 12 };
        const SENS = 55;
        let phase = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: go from pH 7 to 4 and back") +
            canvasFor(680, 320, "A plot of threshold shift against pH as the pH is swept from 7 down to 4 and back up to 7. The way back does not retrace the way down, so the loop does not close: the sensor remembers.") +
            '<div class="fd-stat-row">' + stat("Gap at the end", "gap") + stat("Equivalent pH error", "ph") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Hysteresis of the sensor", key: "h", min: 0, max: 40, step: 1, value: 12 }) +
            "</div>" +
            '<p class="fd-sim-formula">Slow, deeper sites in the hydrated insulator respond late. Hysteresis is measured in millivolts: the gap between the up and down readings. Dense insulators, settling time, and a known pH history help.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function dv(p, up) {

            const ideal = SENS * (p - 7);

            return up ? ideal - state.h * (p - 4) / 3 : ideal;
        }

        function update() {

            setVal(root, "h", state.h + " mV");
            out(root, "gap", state.h + " mV");
            out(root, "ph", (state.h / SENS).toFixed(2) + " pH");
            out(root, "verdict", state.h < 2 ? "Nearly retraces: a dense, settled insulator" : "The reading does not return to its start");

            if (!hit && state.h >= 25) {

                hit = true;
                F.reward("fet-hysteresis", 10, "You opened the hysteresis loop");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 90;
            const R = 640;
            const T = 20;
            const B = 270;
            const X = function (p) { return L + (7.3 - p) / 3.6 * (R - L); };
            const Y = function (v) { return T + (60 - v) / 260 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [4, 5, 6, 7].forEach(function (p) { txt(ctx, "pH " + p, X(p), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "← pH falls", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "threshold shift ↑", L + 60, T + 4, 12, TEXT + ".75)");

            [["down", GOLD], ["up", TEAL]].forEach(function (pair) {

                const up = pair[0] === "up";

                ctx.strokeStyle = pair[1] + ".95)";
                ctx.lineWidth = 2.6;
                ctx.beginPath();

                for (let p = 7; p >= 4 - 1e-9; p -= 0.05) {

                    const y = Y(dv(p, up));

                    if (p === 7) { ctx.moveTo(X(p), y); } else { ctx.lineTo(X(p), y); }
                }

                ctx.stroke();
            });

            txt(ctx, "going down", X(5.5) - 40, Y(dv(5.5, false)) - 12, 12, GOLD + "1)");
            txt(ctx, "coming back", X(5.5) + 50, Y(dv(5.5, true)) + 24, 12, TEAL + "1)");

            // moving dot: down then up
            const u = phase % 2;
            const up = u >= 1;
            const p = up ? 4 + (u - 1) * 3 : 7 - u * 3;

            dot(ctx, X(p), Y(dv(p, up)), 7, "rgba(255,255,255,1)");

            // the gap at pH 7
            ctx.strokeStyle = ROSE + ".95)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(X(7) + 12, Y(0)); ctx.lineTo(X(7) + 12, Y(dv(7, true)));
            ctx.stroke();
            txt(ctx, "gap", X(7) + 36, (Y(0) + Y(dv(7, true))) / 2 + 4, 12, ROSE + "1)", "center", true);
        }

        animate(root, function (dt) {

            phase += dt * 0.25;
            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-tempslope"] = function (root) {

        const defaults = { T: 25, dph: 0.5 };
        const state = { T: 25, dph: 0.5 };
        let hit = false;

        root.innerHTML =
            head("Try it: the slope depends on temperature") +
            art("0 0 340 190", "Two bars: the Nernst slope at the chosen temperature and at 25 degrees Celsius, with the reading error if the sensor was calibrated at 25 degrees but used at the chosen temperature.") +
            '<div class="fd-stat-row">' + stat("Slope at this temperature", "s") + stat("Calibrated at 25 °C reads", "r") + stat("Error", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Temperature of use", key: "T", min: 5, max: 60, step: 1, value: 25 }) +
            slider({ label: "True pH change", key: "dph", min: 0.1, max: 3, step: 0.1, value: 0.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">The Nernst slope 2.3·kT/q grows with temperature: 59.2 mV/pH at 25 °C, 61.5 at body temperature (37 °C). Threshold and mobility also shift, so calibrate at, or correct to, the temperature of use.</p>';

        const svg = root.querySelector("svg");

        function slope(T) { return 8.617e-5 * (T + 273.15) * Math.LN10 * 1000; }

        function update() {

            const s = slope(state.T);
            const shift = s * state.dph;
            const reads = shift / slope(25);

            setVal(root, "T", state.T + " °C");
            setVal(root, "dph", state.dph.toFixed(1));
            out(root, "s", s.toFixed(1) + " mV/pH");
            out(root, "r", reads.toFixed(2) + " pH");
            out(root, "e", (reads - state.dph >= 0 ? "+" : "") + (reads - state.dph).toFixed(3) + " pH");
            out(root, "verdict", Math.abs(state.T - 25) < 1.5 ? "At the calibration temperature there is no error" : state.T === 37 ? "Body temperature: 61.5 mV per pH, about 4 % steeper" : "Calibrate at the temperature you plan to measure at");

            svg.innerHTML =
                label(14, 24, "slope at " + state.T + " °C: " + s.toFixed(1) + " mV/pH", 8.5, "start", "var(--text)") +
                rect(14, 32, 250 * s / 70, 16, "rgba(255,214,102,.9)") +
                label(14, 84, "slope at 25 °C: " + slope(25).toFixed(1) + " mV/pH", 8.5, "start", "var(--text)") +
                rect(14, 92, 250 * slope(25) / 70, 16, "rgba(170,179,207,.85)") +
                label(14, 150, "differences are small but real: calibrate at the temperature of use", 7, "start", "var(--muted)");

            if (!hit && state.T === 37) {

                hit = true;
                F.reward("fet-tempslope", 10, "You found the body-temperature slope");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-refet"] = function (root) {

        const defaults = { sub: "off", dr: 3 };
        const state = { sub: "off", dr: 3 };
        const SENS = 53;
        let phase = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: cancel the drift with a blind twin") +
            canvasFor(680, 330, "Time traces from an ISFET and a REFET twin. Both drift together; only the ISFET sees the pH step. Subtracting the REFET removes the shared drift and leaves a clean step.") +
            '<div class="fd-stat-row">' + stat("ISFET output at the end", "a") + stat("Subtracted output", "b") + stat("True pH step", "c") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Subtract the REFET?", "sub", [["off", "No: raw ISFET only"], ["on", "Yes: ISFET − REFET"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Shared drift (mV per hour)", key: "dr", min: 0, max: 10, step: 0.5, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">An ISFET–REFET pair: a twin transistor with a pH-insensitive surface. Subtracting it cancels shared drift and temperature effects. Pairing a sensor with a blind twin is the standard trick for cancelling shared errors.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function isfet(h) { return (h >= 5 ? 0.4 * SENS : 0) + state.dr * h; }
        function refet(h) { return state.dr * h; }

        function update() {

            setVal(root, "dr", state.dr + " mV/h");

            const end = isfet(10);
            const diff = end - refet(10);

            out(root, "a", end.toFixed(0) + " mV  (true step: " + (0.4 * SENS).toFixed(0) + " mV)");
            out(root, "b", diff.toFixed(0) + " mV");
            out(root, "c", "0.4 pH → " + (0.4 * SENS).toFixed(0) + " mV");
            out(root, "verdict", state.sub === "on" ? "Drift cancelled: the step is clean" : state.dr > 1 ? "The drift is hiding or inflating the true step" : "Little drift: both readings look similar");

            if (!hit && state.sub === "on" && state.dr >= 5) {

                hit = true;
                F.reward("fet-refet", 10, "You cancelled a large drift with a REFET");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 280;
            const X = function (h) { return L + h / 10 * (R - L); };
            const Y = function (v) { return B - (v + 5) / 110 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 25, 50, 75, 100].forEach(function (v) { txt(ctx, v + " mV", L - 30, Y(v) + 4, 11, TEXT + ".65)"); });
            txt(ctx, "time (hours) →", (L + R) / 2, B + 34, 13, TEXT + ".85)");

            ctx.strokeStyle = GREY + ".35)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(X(5), T); ctx.lineTo(X(5), B);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "pH steps up by 0.4 here", X(5) + 80, T + 14, 12, TEXT + ".7)");

            function trace(fn, col, w) {

                const limit = clamp(phase, 0, 10);

                ctx.strokeStyle = col;
                ctx.lineWidth = w;
                ctx.beginPath();

                for (let h = 0; h <= limit; h += 0.05) {

                    const y = clamp(Y(fn(h)), T, B);

                    if (h === 0) { ctx.moveTo(X(h), y); } else { ctx.lineTo(X(h), y); }
                }

                ctx.stroke();
            }

            if (state.sub === "off") {

                trace(isfet, TEAL + ".98)", 3);
                trace(refet, GREY + ".7)", 2);
                txt(ctx, "ISFET (sees pH + drift)", 330, Y(isfet(7)) - 16, 12, TEAL + "1)", "center", true);
                txt(ctx, "REFET (drift only)", 330, Y(refet(7)) + 22, 12, GREY + "1)", "center", true);
            } else {

                trace(function (h) { return isfet(h) - refet(h); }, GOLD + ".98)", 3.5);
                txt(ctx, "ISFET − REFET: a clean step", 330, Y(0.4 * SENS) - 16, 13, GOLD + "1)", "center", true);
            }
        }

        animate(root, function (dt) {

            phase += dt * 2;

            if (phase > 14) { phase = 0; }

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
       UNIT 14: RECEPTORS ON THE GATE
    ====================================== */

    SIMS["fet-receptors"] = quiz(
        "Game: which bioreceptor?",
        ["DNA or RNA probe", "Antibody", "Aptamer", "Enzyme"],
        [
            { q: "A short single strand that pairs with its complementary sequence.", a: "DNA or RNA probe", why: "Base pairing gives the specificity." },
            { q: "A Y-shaped protein about 10 nm across that binds one antigen.", a: "Antibody", why: "Large, but very specific." },
            { q: "A short folded strand of DNA or RNA selected to bind a target.", a: "Aptamer", why: "Small and chemically made." },
            { q: "A catalyst whose reaction makes or uses ions the FET can read.", a: "Enzyme", why: "The FET senses the ions it produces." },
            { q: "The biggest of these receptors, so its bound charge sits furthest from the surface.", a: "Antibody", why: "That matters once ions screen charge." }
        ],
        5,
        "fet-receptors-done",
        "You know the bioreceptors",
        "Each one trades off size, stability, and cost.",
        "Probe pairs, antibody grabs, aptamer folds, enzyme reacts. Hit Reset to try again."
    );


    SIMS["fet-biofet"] = function (root) {

        const defaults = { sign: "neg" };
        const state = { sign: "neg" };
        const SITES = 12;
        const rand = mulberry(41);
        const seen = {};
        let targets = [];
        let bound = 0;
        let full = false;

        root.innerHTML =
            head("Try it: catch targets on the gate") +
            canvasFor(680, 340, "A transistor gate surface covered in receptor molecules. Target molecules float in the solution above. When a target binds to a receptor, its charge joins the surface charge and the threshold shifts.") +
            '<div class="fd-stat-row">' + stat("Receptors occupied", "occ") + stat("Threshold shift", "dv") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-add>➕ Add targets</button><button type="button" class="fd-sim-btn" data-rinse>🚿 Rinse</button></div>' +
            seg("Charge of the target", "sign", [["neg", "Negative (DNA, streptavidin)"], ["pos", "Positive"]]) +
            '<p class="fd-sim-formula">When a target binds, its charge joins the surface charge and the threshold moves just as it did for pH: ΔVth ≈ −Q/C<sub>ox</sub>. A negative target raises an NMOS threshold; a positive one lowers it. No label is needed, and the reading is electrical and continuous.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const sites = [];
        let t = 0;

        for (let i = 0; i < SITES; i++) { sites.push({ x: 100 + i * 45, taken: null }); }

        function spawn(n) {

            for (let i = 0; i < n; i++) {

                targets.push({ x: 90 + rand() * 500, y: 40 + rand() * 80, vx: (rand() - 0.5) * 30, vy: 0, site: null, ph: rand() * 6 });
            }
        }

        function update() {

            seen[state.sign] = true;

            const dv = (state.sign === "neg" ? 1 : -1) * bound * 12;

            out(root, "occ", bound + " of " + SITES);
            out(root, "dv", (dv >= 0 ? "+" : "") + dv + " mV");
            out(root, "verdict", bound === 0 ? "No targets bound: no shift" : state.sign === "neg" ? "Negative charge arrives: the NMOS threshold rises" : "Positive charge arrives: the NMOS threshold falls");

            if (bound >= SITES) { full = true; }

            if (full && seen.neg && seen.pos) {
                F.reward("fet-biofet", 10, "You filled the receptors with both charge signs");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const base = 300;

            ctx.fillStyle = BLUE + ".5)";
            ctx.fillRect(60, base - 6, 560, 10);
            ctx.fillStyle = GREY + ".5)";
            ctx.fillRect(60, base + 4, 560, 30);
            txt(ctx, "transistor gate (sensing insulator)", 340, base + 24, 13, "rgba(6,10,24,.95)", "center", true);

            sites.forEach(function (s, i) {

                // the receptor: a stalk with a Y at the top
                ctx.strokeStyle = TEAL + ".95)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(s.x, base - 6); ctx.lineTo(s.x, base - 52);
                ctx.moveTo(s.x, base - 52); ctx.lineTo(s.x - 9, base - 66);
                ctx.moveTo(s.x, base - 52); ctx.lineTo(s.x + 9, base - 66);
                ctx.stroke();
                i;
            });

            targets.forEach(function (tg) {

                const col = state.sign === "neg" ? BLUE : ROSE;

                dot(ctx, tg.x + Math.sin(t * 2 + tg.ph) * 3, tg.y + Math.cos(t * 1.6 + tg.ph) * 3, 9, col + ".95)");
                txt(ctx, state.sign === "neg" ? "−" : "+", tg.x + Math.sin(t * 2 + tg.ph) * 3, tg.y + Math.cos(t * 1.6 + tg.ph) * 3 + 5, 15, "rgba(6,10,24,.95)", "center", true);
            });

            // threshold-shift gauge
            const dv = (state.sign === "neg" ? 1 : -1) * bound * 12;

            ctx.fillStyle = GREY + ".2)";
            ctx.fillRect(600, 30, 14, 130);
            ctx.fillStyle = GOLD + ".95)";

            if (dv >= 0) { ctx.fillRect(600, 95 - dv / 144 * 65, 14, dv / 144 * 65); } else { ctx.fillRect(600, 95, 14, -dv / 144 * 65); }

            txt(ctx, "ΔVth", 607, 22, 12, GOLD + "1)", "center", true);
        }

        animate(root, function (dt) {

            t += dt;

            targets.forEach(function (tg) {

                if (tg.site !== null) { return; }

                tg.x += tg.vx * dt;
                tg.y += 28 * dt;

                if (tg.x < 70 || tg.x > 610) { tg.vx *= -1; }

                if (tg.y > 220) {

                    // find a free receptor near this target
                    let best = null;

                    sites.forEach(function (s) {

                        if (!s.taken && (best === null || Math.abs(s.x - tg.x) < Math.abs(best.x - tg.x))) { best = s; }
                    });

                    if (best) {

                        best.taken = tg;
                        tg.site = best;
                        tg.x = best.x;
                        tg.y = 300 - 74;
                        bound++;
                        update();
                    } else {

                        tg.y = 220;
                    }
                }
            });

            draw();
        });

        root.querySelector("[data-add]").addEventListener("click", function () { spawn(5); });

        root.querySelector("[data-rinse]").addEventListener("click", function () {

            targets = [];
            bound = 0;
            sites.forEach(function (s) { s.taken = null; });
            update();
        });

        wire(root, state, defaults, function () {

            targets = [];
            bound = 0;
            sites.forEach(function (s) { s.taken = null; });
            update();
            draw();
        });

        spawn(5);
        update();
        draw();
    };


    SIMS["fet-goodreceptor"] = quiz(
        "Game: what makes a good receptor?",
        ["Specific", "Strong", "Stable", "Small"],
        [
            { q: "It binds the target and little else.", a: "Specific", why: "Selectivity." },
            { q: "High affinity, so low concentrations still register.", a: "Strong", why: "A small KD." },
            { q: "It survives storage and repeated rinsing.", a: "Stable", why: "It has to last." },
            { q: "It keeps the target close to the surface, where the gate can feel it.", a: "Small", why: "This becomes critical once ions screen charge." },
            { q: "Why do antibodies sometimes struggle in salty samples?", a: "Small", why: "Their large size puts the bound charge too far from the surface." }
        ],
        4,
        "fet-goodreceptor-done",
        "You know what makes a good receptor",
        "Specific, strong, stable and small.",
        "Four things to look for. Hit Reset to try again."
    );


    /* ======================================
       UNIT 15: SILANES AND SELF-ASSEMBLED MONOLAYERS
    ====================================== */

    SIMS["fet-prep"] = orderGame(
        "Game: prepare the surface",
        [
            { n: "Clean", d: "remove organic residue with solvents, then plasma or piranha", why: "A clean surface is the starting line." },
            { n: "Hydroxylate", d: "cover the oxide in –OH groups", why: "Those are the anchor points." },
            { n: "Dry", d: "bake off loose water", why: "So the silane bonds to the surface, not to itself." }
        ],
        "fet-prep-done",
        "You prepared the surface in the right order",
        "Tap the three steps in order.",
        "A clean, fully hydroxylated surface is the starting line."
    );


    SIMS["fet-aptes"] = function (root) {

        const defaults = { w: 40 };
        const state = { w: 40 };
        const rand = mulberry(77);
        const cols = [];
        let hit = false;

        for (let i = 0; i < 28; i++) { cols.push({ r: rand(), r2: rand() }); }

        root.innerHTML =
            head("Try it: grow an APTES layer") +
            canvasFor(680, 320, "An oxide surface covered in hydroxyl groups with silane molecules attaching. With too little water the coverage is patchy, with the right amount it forms a smooth single layer about one nanometer thick, and with too much it clumps into thick, uneven multilayers.") +
            '<div class="fd-stat-row">' + stat("Coverage", "cov") + stat("Layer thickness", "th") + stat("Smoothness", "sm") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Water in the reaction (relative)", key: "w", min: 0, max: 100, step: 5, value: 40 }) +
            "</div>" +
            '<p class="fd-sim-formula">Si–OH + R–Si(OR′)₃ → Si–O–Si–R. APTES has an amine tail (–NH₂) and forms about 1 nm when it makes a single layer. Too much water makes it clump into thick, uneven multilayers: control the water and the time.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function model() {

            const w = state.w;
            const cov = clamp(0.2 + w / 50 * 0.8, 0.2, 1);
            const multi = clamp((w - 55) / 45, 0, 1);

            return { cov: cov, multi: multi, thick: 1 + multi * 6 };
        }

        function update() {

            const m = model();

            setVal(root, "w", state.w + " %");
            out(root, "cov", Math.round(m.cov * 100) + " %");
            out(root, "th", m.thick.toFixed(1) + " nm");
            out(root, "sm", m.multi > 0.2 ? "clumpy" : m.cov < 0.7 ? "patchy" : "smooth");
            out(root, "verdict", m.multi > 0.2 ? "Too wet: thick, uneven multilayers" : m.cov < 0.7 ? "Too dry: bare patches remain" : "A smooth single layer, about 1 nm thick");

            if (!hit && m.cov >= 0.9 && m.multi < 0.1) {

                hit = true;
                F.reward("fet-aptes", 10, "You grew a smooth APTES monolayer");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const m = model();
            const base = 250;

            ctx.fillStyle = GREY + ".55)";
            ctx.fillRect(40, base, 600, 50);
            txt(ctx, "oxide with –OH groups", 340, base + 32, 13, "rgba(6,10,24,.95)", "center", true);

            cols.forEach(function (c, i) {

                const x = 60 + i * 21;
                const there = c.r < m.cov;

                dot(ctx, x, base - 3, 3.5, there ? TEAL + ".9)" : ROSE + ".8)");

                if (!there) { return; }

                const h = 30 + (m.multi > 0.2 ? c.r2 * m.multi * 160 : 0);

                ctx.strokeStyle = TEAL + ".9)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x, base - 6); ctx.lineTo(x, base - h);
                ctx.stroke();
                txt(ctx, "NH₂", x, base - h - 6, 9, GOLD + "1)");
            });

            txt(ctx, "red dots: bare –OH sites   green: bonded silane", 340, 30, 13, TEXT + ".75)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-silanes"] = quiz(
        "Game: silane or thiol?",
        ["Silane", "Thiol"],
        [
            { q: "The anchor chemistry for an oxide surface.", a: "Silane", why: "Silanes react with surface –OH groups." },
            { q: "The anchor chemistry for a gold sensing pad.", a: "Thiol", why: "Au–S bonds." },
            { q: "APTES.", a: "Silane", why: "A silane with an amine tail." },
            { q: "Packs into a self-assembled monolayer on metal.", a: "Thiol", why: "A SAM on gold." },
            { q: "Used in extended-gate FETs where a gold electrode is wired to the gate.", a: "Thiol", why: "The sensing pad is gold." },
            { q: "Forms Si–O–Si bonds.", a: "Silane", why: "That is the silane bond to the oxide." }
        ],
        5,
        "fet-silanes-done",
        "You know silanes and thiols",
        "Oxides use silanes; gold uses thiols.",
        "Silane for oxide, thiol for gold. Hit Reset to try again."
    );


    SIMS["fet-aminecharge"] = quiz(
        "Game: what does the threshold do?",
        ["Goes down", "Goes up", "Stays the same"],
        [
            { q: "An APTES layer at neutral pH adds positive charge (–NH₃⁺). The NMOS threshold…", a: "Goes down", why: "Positive charge lowers an NMOS threshold." },
            { q: "A layer of DNA (negative) is added to the gate. The NMOS threshold…", a: "Goes up", why: "Negative charge raises it." },
            { q: "A step that adds no charge to the surface changes the threshold…", a: "Stays the same", why: "That is a red flag that the chemistry did not happen." },
            { q: "Positive charge binds at the gate. The transfer curve moves…", a: "Goes down", why: "The gate needs less positive voltage." },
            { q: "Negative charge binds at the gate. The threshold…", a: "Goes up", why: "ΔVth = −Q/Cox with Q negative." }
        ],
        4,
        "fet-aminecharge-done",
        "The transistor can test its own chemistry",
        "Watch the threshold step after each stage.",
        "Positive charge lowers an NMOS threshold; negative charge raises it. Hit Reset to try again."
    );


    /* ======================================
       UNIT 16: LINKERS AND IMMOBILIZATION
    ====================================== */

    SIMS["fet-layercake"] = orderGame(
        "Game: build the layer cake",
        [
            { n: "Silane layer", d: "gives the oxide a reactive tail", why: "It bonds to the oxide below." },
            { n: "Linker", d: "ties the tail to the receptor", why: "It bonds to the silane and to the receptor." },
            { n: "Receptor", d: "catches the target", why: "The recognition layer." },
            { n: "Blocking layer", d: "covers any bare spots", why: "Added after the receptors." },
            { n: "Target", d: "the molecule you want to detect", why: "It arrives last, from the sample." }
        ],
        "fet-layercake-done",
        "You stacked the layers in order",
        "Tap the layers from the bottom up.",
        "Every layer has to bond to the one below it and the one above it."
    );


    SIMS["fet-linkers"] = quiz(
        "Game: which linker?",
        ["Glutaraldehyde", "EDC/NHS", "Biotin–streptavidin", "Thiol–maleimide"],
        [
            { q: "Joins amines on the surface to amines on the receptor.", a: "Glutaraldehyde", why: "A classic amine-to-amine crosslinker." },
            { q: "Turns a carboxyl group into an amide bond with an amine.", a: "EDC/NHS", why: "Carboxyl-to-amine coupling." },
            { q: "One of the strongest non-covalent bonds in biology, KD ≈ 10⁻¹⁴ M.", a: "Biotin–streptavidin", why: "Effectively irreversible on lab timescales." },
            { q: "Links a thiol on the receptor to a maleimide on the surface.", a: "Thiol–maleimide", why: "Thiol meets maleimide." },
            { q: "A standard way to attach biotin-labeled receptors; streptavidin has four binding pockets.", a: "Biotin–streptavidin", why: "It can bridge a biotin surface to a biotin receptor." }
        ],
        5,
        "fet-linkers-done",
        "You know your linkers",
        "Pick the linker that matches the groups on both sides.",
        "Match the chemical groups. Hit Reset to try again."
    );


    SIMS["fet-density"] = function (root) {

        const defaults = { d: 40, o: "up" };
        const state = { d: 40, o: "up" };
        const seen = {};
        const rand = mulberry(66);
        const angles = [];

        for (let i = 0; i < 40; i++) { angles.push({ a: rand() * 2 - 1, r: rand() }); }

        root.innerHTML =
            head("Try it: space the receptors out") +
            canvasFor(680, 320, "A surface with antibody receptors, drawn upright or at random angles, at a chosen density. Large target molecules bind only where there is room and the binding site faces outward.") +
            '<div class="fd-stat-row">' + stat("Receptors on the surface", "n") + stat("Working receptors", "w") + stat("Signal", "sig") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Orientation", "o", [["up", "Oriented (Protein A or G)"], ["rand", "Random (amine coupling)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Receptor density", key: "d", min: 5, max: 100, step: 5, value: 40 }) +
            "</div>" +
            '<p class="fd-sim-formula">Random amine coupling can attach at any lysine, so some receptors face the wrong way. Too dense and large targets cannot reach the binding sites; too sparse and there are too few receptors to make a measurable charge change. Sensors are tuned between the two.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function model() {

            const n = Math.round(state.d / 100 * 28);
            const face = state.o === "up" ? 1 : 0.5;
            const crowd = state.d <= 40 ? 1 : clamp(1 - (state.d - 40) / 60 * 0.8, 0.2, 1);
            const work = n * face * crowd;

            return { n: n, work: work };
        }

        function update() {

            const m = model();

            seen[state.o] = true;
            setVal(root, "d", state.d + " %");
            out(root, "n", m.n);
            out(root, "w", m.work.toFixed(1));
            out(root, "sig", Math.round(m.work / 28 * 100) + " %");
            out(root, "verdict", state.d > 70 ? "Too crowded: targets cannot reach the binding sites" : state.d < 20 ? "Too sparse: too few receptors for a measurable signal" : state.o === "up" ? "Spaced out and upright: each receptor has room to bind" : "Random orientation wastes about half of the receptors");

            if (seen.up && seen.rand && state.d >= 30 && state.d <= 50) {
                F.reward("fet-density", 10, "You tuned receptor density and orientation");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const m = model();
            const base = 270;

            ctx.fillStyle = GREY + ".55)";
            ctx.fillRect(40, base, 600, 36);
            txt(ctx, "sensing surface", 340, base + 24, 13, "rgba(6,10,24,.95)", "center", true);

            const step = 560 / Math.max(m.n, 1);
            let working = 0;

            for (let i = 0; i < m.n; i++) {

                const x = 60 + i * step + step / 2;
                const ang = state.o === "up" ? 0 : angles[i].a * 1.1;
                const facing = Math.abs(ang) < 0.55;
                const blocked = state.d > 40 && angles[i].r > (1 - (1 - clamp(1 - (state.d - 40) / 60 * 0.8, 0.2, 1)) ) + 0.0 && false;
                const top = [x + Math.sin(ang) * 70, base - Math.cos(ang) * 70];

                ctx.strokeStyle = (facing ? TEAL : GREY) + ".95)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x, base); ctx.lineTo(top[0], top[1]);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(top[0], top[1]); ctx.lineTo(top[0] - 10, top[1] - 12);
                ctx.moveTo(top[0], top[1]); ctx.lineTo(top[0] + 10, top[1] - 12);
                ctx.stroke();

                // a target on working receptors
                const crowdOk = angles[i].r < clamp(1 - (state.d - 40) / 60 * 0.8, 0.2, 1);

                if (facing && crowdOk && !blocked) {

                    dot(ctx, top[0], top[1] - 22, 11, BLUE + ".95)");
                    txt(ctx, "−", top[0], top[1] - 17, 15, "rgba(6,10,24,.95)", "center", true);
                    working++;
                }
            }

            txt(ctx, working + " targets bound", 340, 36, 15, GOLD + "1)", "center", true);
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 17: BLOCKING AND NON-SPECIFIC BINDING
    ====================================== */

    SIMS["fet-blocking"] = quiz(
        "Game: which blocking method?",
        ["BSA", "Antifouling polymers", "Wash buffers"],
        [
            { q: "Bovine serum albumin coats bare spots with a harmless protein.", a: "BSA", why: "A protein blanket." },
            { q: "PEG or OEG chains form a hydrated brush that resists proteins.", a: "Antifouling polymers", why: "A water-loving brush." },
            { q: "A mild detergent such as Tween-20 rinses off loosely stuck molecules.", a: "Wash buffers", why: "Wash away what is only weakly stuck." },
            { q: "When does blocking happen?", a: "BSA", why: "After the receptors are attached and before the sample arrives." },
            { q: "A hydrated brush on the surface.", a: "Antifouling polymers", why: "It keeps proteins away." }
        ],
        4,
        "fet-blocking-done",
        "You know the blocking methods",
        "Fill the gaps before the sample arrives.",
        "BSA fills, polymers repel, washes rinse. Hit Reset to try again."
    );


    SIMS["fet-controls"] = quiz(
        "Game: which control?",
        ["Blank sample", "Wrong target", "No-receptor twin", "Difference"],
        [
            { q: "Buffer alone should give no threshold shift.", a: "Blank sample", why: "Nothing to detect." },
            { q: "An unrelated molecule should give no shift.", a: "Wrong target", why: "That tests selectivity." },
            { q: "A FET with no receptors, like the REFET, shows the non-specific signal alone.", a: "No-receptor twin", why: "It sees only the background." },
            { q: "Signal minus twin isolates the specific binding.", a: "Difference", why: "Subtract the background." },
            { q: "Controls turn 'it responded' into…", a: "Difference", why: "'It responded to the target.'" }
        ],
        4,
        "fet-controls-done",
        "You know the controls",
        "Controls turn 'it responded' into 'it responded to the target'.",
        "Blank, wrong target, twin, difference. Hit Reset to try again."
    );


    SIMS["fet-selectivity"] = function (root) {

        const defaults = { b: 50, s: "buffer" };
        const state = { b: 50, s: "buffer" };
        const seen = {};
        let hit = false;

        root.innerHTML =
            head("Try it: how selective is the surface?") +
            art("0 0 340 190", "Two bars: the response to the target and the response to a wrong or blank sample, with their ratio. Better blocking lowers the non-specific response; serum raises it.") +
            '<div class="fd-stat-row">' + stat("Response to the target", "a") + stat("Response to a wrong sample", "b") + stat("Specific ÷ non-specific", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Sample", "s", [["buffer", "Clean buffer"], ["serum", "Blood serum (60–80 mg/mL protein)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Quality of blocking and washing", key: "b", min: 0, max: 100, step: 5, value: 50 }) +
            "</div>" +
            '<p class="fd-sim-formula">A useful summary is the response to the target divided by the response to a wrong or blank sample. A ratio near 1 means the surface cannot tell them apart. Blocking and washing raise the ratio. A good result in buffer does not guarantee one in a real sample. (Illustrative numbers.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const spec = 40;
            const base = state.s === "buffer" ? 12 : 60;
            const nonspec = Math.max(0.5, base * (1 - state.b / 100 * 0.97));
            const r = (spec + nonspec) / nonspec;

            seen[state.s] = true;
            setVal(root, "b", state.b + " %");
            out(root, "a", (spec + nonspec).toFixed(1) + " mV");
            out(root, "b", nonspec.toFixed(1) + " mV");
            out(root, "r", r.toFixed(1) + " : 1");
            out(root, "verdict", r < 3 ? "The surface can barely tell the target from the rest" : r > 20 ? "A very selective surface" : "Reasonable selectivity: more blocking would help");

            svg.innerHTML =
                label(14, 24, "target: " + (spec + nonspec).toFixed(1) + " mV", 8.5, "start", "var(--text)") +
                rect(14, 32, 250 * Math.min(1, (spec + nonspec) / 110), 16, "rgba(84,224,199,.9)") +
                label(14, 84, "wrong sample: " + nonspec.toFixed(1) + " mV", 8.5, "start", "var(--text)") +
                rect(14, 92, 250 * Math.min(1, nonspec / 110), 16, "rgba(255,105,120,.85)") +
                label(14, 150, "ratio " + r.toFixed(1) + " : 1", 11, "start", "var(--accent)");

            if (seen.buffer && seen.serum && !hit && state.s === "serum" && r > 8) {

                hit = true;
                F.reward("fet-selectivity", 10, "You made a surface selective even in serum");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    document.querySelectorAll('.fd-sim[data-sim^="fet-"]').forEach(F.mount);

})();
