/* ========================================
   BIOFETS & MOSFETS: INTERACTIVE SIMULATORS, PART 2

   Unit 6: output curves, the three regions, the square law.
   Unit 7: transfer curves, shifting curves, subthreshold swing.
   Unit 8: from MOSFET to ISFET.
   Unit 9: surface sites, point of zero charge, surface pH.

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
    const idrain = H.idrain;
    const drawBody = H.drawBody;


    /* ======================================
       UNIT 6: CURRENT-VOLTAGE BEHAVIOR
    ====================================== */

    SIMS["fet-iv"] = function (root) {

        const defaults = { vg: 2, vd: 1 };
        const state = { vg: 2, vd: 1 };
        const VTH = 0.7;
        const K = 1.0;
        const seen = {};

        root.innerHTML =
            head("Try it: sweep the drain, step the gate") +
            canvasFor(680, 330, "On the left, a family of output curves of drain current against drain voltage, one for each gate voltage, with a dot at the present operating point. On the right, a cross-section of the channel, which pinches off near the drain in saturation.") +
            '<div class="fd-stat-row">' + stat("Region", "reg") + stat("Drain current", "id") + stat("Overdrive VGS − Vth", "vov") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Gate voltage VGS", key: "vg", min: 0, max: 3, step: 0.05, value: 2 }) +
            slider({ label: "Drain voltage VDS", key: "vd", min: 0, max: 3, step: 0.05, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">Higher gate voltage, taller curve: that is the gate controlling the current. The dashed line marks V<sub>DS</sub> = V<sub>GS</sub> − V<sub>th</sub>, where triode turns into saturation. (Threshold 0.7 V.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function region() {

            const vov = state.vg - VTH;

            return vov <= 0 ? "cutoff" : state.vd < vov ? "triode" : "saturation";
        }

        function update() {

            const r = region();
            const id = idrain(state.vg, state.vd, VTH, K);

            seen[r] = true;
            setVal(root, "vg", state.vg.toFixed(2) + " V");
            setVal(root, "vd", state.vd.toFixed(2) + " V");
            out(root, "reg", r);
            out(root, "id", id >= 1 ? id.toFixed(2) + " mA" : (id * 1000).toFixed(0) + " µA");
            out(root, "vov", (state.vg - VTH).toFixed(2) + " V");
            out(root, "verdict", r === "cutoff" ? "Cutoff: no channel, only a tiny leakage" : r === "triode" ? "Triode: the channel spans source to drain, a voltage-controlled resistor" : "Saturation: the channel pinches off and the current flattens");

            if (seen.cutoff && seen.triode && seen.saturation) {
                F.reward("fet-iv", 10, "You visited cutoff, triode and saturation");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 60;
            const R = 410;
            const T = 20;
            const B = 270;
            const X = function (v) { return L + v / 3 * (R - L); };
            const Y = function (i) { return B - i / 2.8 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 1, 2, 3].forEach(function (v) { txt(ctx, v + " V", X(v), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "VDS →", (L + R) / 2, B + 38, 13, TEXT + ".85)");
            txt(ctx, "ID (mA) ↑", L + 30, T + 4, 12, TEXT + ".75)");

            // boundary between triode and saturation
            ctx.strokeStyle = GOLD + ".6)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();

            for (let v = 0; v <= 2.3; v += 0.05) {

                const y = Y(idrain(v + VTH, v, VTH, K));

                if (v === 0) { ctx.moveTo(X(v), y); } else { ctx.lineTo(X(v), y); }
            }

            ctx.stroke();
            ctx.setLineDash([]);

            [1.0, 1.5, 2.0, 2.5, 3.0].forEach(function (vg) {

                const on = Math.abs(vg - state.vg) < 0.26;

                ctx.strokeStyle = on ? TEAL + ".98)" : GREY + ".5)";
                ctx.lineWidth = on ? 3 : 1.6;
                ctx.beginPath();

                for (let v = 0; v <= 3.001; v += 0.04) {

                    const y = Y(idrain(vg, v, VTH, K));

                    if (v === 0) { ctx.moveTo(X(v), y); } else { ctx.lineTo(X(v), y); }
                }

                ctx.stroke();
                txt(ctx, vg.toFixed(1), X(3) + 14, Y(idrain(vg, 3, VTH, K)) + 4, 11, TEXT + ".65)");
            });

            // operating point
            dot(ctx, X(state.vd), Y(idrain(state.vg, state.vd, VTH, K)), 8, "rgba(255,255,255,1)");

            // the channel cross-section on the right
            const cx0 = 470;
            const cx1 = 650;
            const top = 150;
            const vov = state.vg - VTH;

            ctx.fillStyle = GREY + ".42)";
            ctx.fillRect(cx0 - 10, top, cx1 - cx0 + 20, 100);
            ctx.fillStyle = TEAL + ".55)";
            ctx.fillRect(cx0 - 10, top, 30, 36);
            ctx.fillRect(cx1 - 20, top, 30, 36);
            ctx.fillStyle = BLUE + ".5)";
            ctx.fillRect(cx0 + 20, top - 8, cx1 - cx0 - 40, 8);
            ctx.fillStyle = GOLD + ".85)";
            ctx.fillRect(cx0 + 20, top - 36, cx1 - cx0 - 40, 28);
            txt(ctx, "gate", (cx0 + cx1) / 2, top - 17, 12, "rgba(6,10,24,.95)", "center", true);
            txt(ctx, "S", cx0 + 5, top + 24, 12, "rgba(6,10,24,.95)", "center", true);
            txt(ctx, "D", cx1 - 5, top + 24, 12, "rgba(6,10,24,.95)", "center", true);

            if (vov > 0) {

                const th = clamp(vov * 9, 3, 18);
                const pinch = state.vd >= vov ? 1 : state.vd / vov;

                ctx.beginPath();
                ctx.moveTo(cx0 + 20, top);

                for (let x = cx0 + 20; x <= cx1 - 20; x += 5) {

                    const u = (x - cx0 - 20) / (cx1 - cx0 - 40);

                    ctx.lineTo(x, top + th * (1 - u * pinch));
                }

                ctx.lineTo(cx1 - 20, top);
                ctx.closePath();
                ctx.fillStyle = TEAL + ".9)";
                ctx.fill();

                txt(ctx, state.vd >= vov ? "pinched off near the drain" : "channel spans source to drain", (cx0 + cx1) / 2, top + 70, 12, TEAL + "1)", "center", true);
            } else {

                txt(ctx, "no channel", (cx0 + cx1) / 2, top + 70, 13, ROSE + "1)", "center", true);
            }
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-regions"] = quiz(
        "Game: cutoff, triode or saturation?",
        ["Cutoff", "Triode", "Saturation"],
        [
            { q: "VGS < Vth: no inversion channel, only a tiny leakage current.", a: "Cutoff", why: "The transistor is off." },
            { q: "VDS < VGS − Vth: the channel spans source to drain.", a: "Triode", why: "A voltage-controlled resistor." },
            { q: "VDS ≥ VGS − Vth: the channel pinches off and the current flattens.", a: "Saturation", why: "A gate-controlled current source." },
            { q: "ID = k(VGS − Vth)·VDS for small VDS.", a: "Triode", why: "Current proportional to VDS." },
            { q: "ID = ½k(VGS − Vth)²: doubling the overdrive quadruples the current.", a: "Saturation", why: "The square law." },
            { q: "VGS = 0.3 V in a transistor with Vth = 0.7 V.", a: "Cutoff", why: "Below threshold." }
        ],
        5,
        "fet-regions-done",
        "You know the three regions",
        "Cutoff, triode, saturation: off, resistor, current source.",
        "Below threshold is cutoff; small VDS is triode; large VDS is saturation. Hit Reset to try again."
    );


    SIMS["fet-square"] = function (root) {

        const defaults = { vov: 0.5, wl: 10 };
        const state = { vov: 0.5, wl: 10 };
        const MUCOX = 100; // µA/V²
        let hit = false;

        root.innerHTML =
            head("Try it: the square law") +
            art("0 0 340 200", "A parabola of saturation current against gate overdrive voltage, with a moving dot and the current read out.") +
            '<div class="fd-stat-row">' + stat("Saturation current", "id") + stat("If the overdrive doubled", "dbl") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-double>×2 overdrive</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Overdrive VGS − Vth", key: "vov", min: 0.1, max: 1.5, step: 0.05, value: 0.5 }) +
            slider({ label: "W/L", key: "wl", min: 1, max: 50, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">I<sub>D</sub> = ½ · μC<sub>ox</sub> · (W/L) · V<sub>ov</sub>². With μC<sub>ox</sub> = 100 µA/V², W/L = 10 and an overdrive of 0.5 V: ½ × 100 × 10 × 0.25 = 125 µA.</p>';

        const svg = root.querySelector("svg");

        function id(v) { return 0.5 * MUCOX * state.wl * v * v; }

        function update() {

            const cur = id(state.vov);
            const mx = id(1.5);

            setVal(root, "vov", state.vov.toFixed(2) + " V");
            setVal(root, "wl", state.wl);
            out(root, "id", cur >= 1000 ? (cur / 1000).toFixed(2) + " mA" : cur.toFixed(0) + " µA");
            out(root, "dbl", (id(state.vov * 2) / cur).toFixed(1) + "× the current");
            out(root, "verdict", Math.abs(state.vov - 0.5) < 0.01 && state.wl === 10 ? "The lesson's example: 125 µA" : "Square law: double the overdrive, four times the current");

            let pts = "";

            for (let v = 0; v <= 1.5001; v += 0.05) { pts += (40 + v / 1.5 * 270).toFixed(1) + "," + (170 - id(v) / mx * 140).toFixed(1) + " "; }

            svg.innerHTML =
                rect(40, 30, 270, 140, "rgba(6,10,24,.55)", "rgba(170,179,207,.35)") +
                '<polyline points="' + pts + '" style="fill:none;stroke:#54e0c7;stroke-width:2"/>' +
                '<circle cx="' + (40 + state.vov / 1.5 * 270) + '" cy="' + (170 - cur / mx * 140) + '" r="5" style="fill:#ffd666"/>' +
                label(175, 190, "overdrive voltage →", 7, "middle", "var(--muted)") +
                '<text transform="rotate(-90 16 100)" x="16" y="100" text-anchor="middle" style="font-size:8px;fill:var(--muted)">saturation current ID</text>';

            if (!hit && state.vov >= 1 && state.wl >= 30) {

                hit = true;
                F.reward("fet-square", 10, "You pushed the square law hard");
            }
        }

        wire(root, state, defaults, update);

        root.querySelector("[data-double]").addEventListener("click", function () {

            state.vov = Math.min(1.5, Math.round(state.vov * 2 * 20) / 20);
            root.querySelector('input[data-key="vov"]').value = state.vov;
            update();
        });

        update();
    };


    /* ======================================
       UNIT 7: TRANSFER CURVES AND SENSITIVITY
    ====================================== */

    SIMS["fet-transfer"] = function (root) {

        const defaults = { scale: "lin", dv: 0, vg: 0.9 };
        const state = { scale: "lin", dv: 0, vg: 0.9 };
        const VTH = 0.7;
        const K = 1.0;
        const S = 0.08; // V per decade
        const seen = {};

        root.innerHTML =
            head("Try it: slide the transfer curve sideways") +
            canvasFor(680, 330, "A transfer curve of drain current against gate voltage. Above threshold it follows the square law; below, the current falls exponentially. A sensing event slides the whole curve sideways by the threshold shift.") +
            '<div class="fd-stat-row">' + stat("Transconductance gm at the probe", "gm") + stat("Current at the probe (before → after)", "i") + stat("Current change", "f") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Current axis", "scale", [["lin", "Linear"], ["log", "Logarithmic"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Threshold shift from bound charge (ΔVth)", key: "dv", min: -0.3, max: 0.3, step: 0.01, value: 0 }) +
            slider({ label: "Gate voltage where you read the current", key: "vg", min: 0.2, max: 2.5, step: 0.05, value: 0.9 }) +
            "</div>" +
            '<p class="fd-sim-formula">Above threshold: I<sub>D</sub> = ½k(V<sub>GS</sub> − V<sub>th</sub>)² and g<sub>m</sub> = k·V<sub>ov</sub>. Below threshold the current falls about 10× per 80 mV: a straight line on the log axis. Key idea: a sensing event slides the curve sideways.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function cur(v, vth) {

            const vov = v - vth;

            if (vov > 0.05) { return 0.5 * K * vov * vov; }

            return 0.5 * K * 0.0025 * Math.pow(10, (vov - 0.05) / S);
        }

        function update() {

            const vth2 = VTH + state.dv;
            const i1 = cur(state.vg, VTH);
            const i2 = cur(state.vg, vth2);
            const vov = state.vg - vth2;
            const gm = vov > 0.05 ? K * vov : i2 * Math.LN10 / S;

            seen[state.scale] = true;
            setVal(root, "dv", (state.dv >= 0 ? "+" : "") + (state.dv * 1000).toFixed(0) + " mV");
            setVal(root, "vg", state.vg.toFixed(2) + " V");

            const f = function (i) { return i >= 0.1 ? i.toFixed(2) + " mA" : i >= 1e-4 ? (i * 1000).toFixed(1) + " µA" : (i * 1e6).toFixed(0) + " nA"; };

            out(root, "gm", (gm * 1000).toFixed(gm > 0.01 ? 0 : 2) + " µS");
            out(root, "i", f(i1) + " → " + f(i2));
            out(root, "f", (i2 / i1).toFixed(2) + "×");
            out(root, "verdict", state.vg < vth2 ? "Subthreshold: a small shift makes a big relative change in current" : "Above threshold: a shift changes the current, but less dramatically");

            if (seen.lin && seen.log && Math.abs(state.dv) >= 0.1) {
                F.reward("fet-transfer", 10, "You slid a transfer curve in both views");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 275;
            const log = state.scale === "log";
            const X = function (v) { return L + v / 2.6 * (R - L); };
            const Y = log ?
                function (i) { return B - (Math.log10(Math.max(i, 1e-9)) + 8.5) / 9 * (B - T); } :
                function (i) { return B - i / 2.6 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 1, 2].forEach(function (v) { txt(ctx, v + " V", X(v), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "gate voltage →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, log ? "log drain current ↑" : "drain current ↑", L + 70, T + 4, 12, TEXT + ".75)");

            if (log) {

                for (let e = -8; e <= 0; e += 2) {

                    const y = Y(Math.pow(10, e));

                    ctx.strokeStyle = GREY + ".15)";
                    ctx.beginPath();
                    ctx.moveTo(L, y); ctx.lineTo(R, y);
                    ctx.stroke();
                    txt(ctx, "10" + H.sup(e), L - 24, y + 4, 11, TEXT + ".6)");
                }
            }

            function curve(vth, col, w, dash) {

                ctx.strokeStyle = col;
                ctx.lineWidth = w;
                ctx.setLineDash(dash || []);
                ctx.beginPath();

                let first = true;

                for (let v = 0; v <= 2.6; v += 0.02) {

                    const y = clamp(Y(cur(v, vth)), T, B);

                    if (first) { ctx.moveTo(X(v), y); first = false; } else { ctx.lineTo(X(v), y); }
                }

                ctx.stroke();
                ctx.setLineDash([]);
            }

            curve(VTH, GREY + ".65)", 2, [6, 5]);
            curve(VTH + state.dv, TEAL + ".98)", 3);

            // probe line
            ctx.strokeStyle = GOLD + ".6)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(X(state.vg), T); ctx.lineTo(X(state.vg), B);
            ctx.stroke();
            dot(ctx, X(state.vg), clamp(Y(cur(state.vg, VTH)), T, B), 6, GREY + ".95)");
            dot(ctx, X(state.vg), clamp(Y(cur(state.vg, VTH + state.dv)), T, B), 7, GOLD + "1)");

            txt(ctx, "dashed: before   solid: after the sensing event", 440, T + 16, 12, TEXT + ".7)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-subth"] = function (root) {

        const defaults = { n: 1.2, T: 300 };
        const state = { n: 1.2, T: 300 };
        let hit = false;

        root.innerHTML =
            head("Try it: the subthreshold swing") +
            art("0 0 340 200", "A line showing how many millivolts of gate voltage change the current tenfold, compared with the 60 millivolt per decade physical limit.") +
            '<div class="fd-stat-row">' + stat("Swing S", "s") + stat("Limit at this temperature", "lim") + stat("A 21 mV shift changes the current by", "f") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Ideality factor n (≥ 1)", key: "n", min: 1, max: 2.5, step: 0.05, value: 1.2 }) +
            slider({ label: "Temperature", key: "T", min: 250, max: 400, step: 5, value: 300 }) +
            "</div>" +
            '<p class="fd-sim-formula">S = n · (kT/q) · ln 10. It cannot be better than about 60 mV per decade at room temperature, since n ≥ 1. A 0.4 pH change with a 53 mV/pH sensor shifts the threshold by 21 mV, which at 70 mV per decade changes the current by 10<sup>21/70</sup> ≈ 2×.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const kt = 8.617e-5 * state.T;
            const s = state.n * kt * Math.LN10 * 1000;
            const lim = kt * Math.LN10 * 1000;

            setVal(root, "n", state.n.toFixed(2));
            setVal(root, "T", state.T + " K");
            out(root, "s", s.toFixed(0) + " mV/decade");
            out(root, "lim", lim.toFixed(0) + " mV/decade");
            out(root, "f", Math.pow(10, 21 / s).toFixed(2) + "×");
            out(root, "verdict", state.n < 1.1 ? "Close to the physical limit: about as sharp as a transistor can be" : s > 100 ? "A sloppy swing: much less current change per millivolt" : "A realistic device");

            const slope = 100 / Math.max(s, 40); // decades per 100 px
            const ideal = 100 / lim;

            let pts = "";
            let ptsI = "";

            for (let x = 0; x <= 260; x += 10) {

                pts += (40 + x) + "," + (170 - x * 0.6 * (60 / s)).toFixed(1) + " ";
                ptsI += (40 + x) + "," + (170 - x * 0.6 * (60 / lim)).toFixed(1) + " ";
            }

            svg.innerHTML =
                rect(40, 20, 260, 150, "rgba(6,10,24,.55)", "rgba(170,179,207,.35)") +
                '<polyline points="' + ptsI + '" style="fill:none;stroke:#aab3cf;stroke-width:1.2;stroke-dasharray:4 3"/>' +
                '<polyline points="' + pts + '" style="fill:none;stroke:#54e0c7;stroke-width:2"/>' +
                label(170, 190, "gate voltage →", 7, "middle", "var(--muted)") +
                label(44, 16, "log current ↑", 7, "start", "var(--muted)") +
                label(300, 40, "dashed: the limit", 7, "end", "var(--muted)") +
                label(300, 58, "solid: your device", 7, "end", "#54e0c7");

            slope; ideal;

            if (!hit && state.n <= 1.05 && state.T <= 270) {

                hit = true;
                F.reward("fet-subth", 10, "You got close to the swing limit");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 8: FROM MOSFET TO ISFET
    ====================================== */

    SIMS["fet-isfet"] = function (root) {

        const defaults = { kind: "mos" };
        const state = { kind: "mos" };
        const seen = {};
        const rand = mulberry(19);
        const ions = [];

        for (let i = 0; i < 26; i++) { ions.push({ x: rand(), y: rand(), v: 0.3 + rand(), pos: i % 2 === 0 }); }

        root.innerHTML =
            head("Try it: swap the metal gate for a liquid") +
            canvasFor(680, 360, "A transistor cross-section. With a metal gate the gate voltage is applied straight to the metal. In an ISFET the gate is a liquid: a reference electrode dips into the solution and passes the voltage through the electrolyte to the insulator surface.") +
            '<div class="fd-stat-row">' + stat("Gate is", "gate") + stat("Gate voltage goes to", "wire") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Transistor", "kind", [["mos", "MOSFET (metal gate)"], ["isfet", "ISFET (liquid gate)"]]) +
            '<p class="fd-sim-formula">Piet Bergveld introduced the idea in 1970. Source, drain and body are unchanged: the channel cannot tell whether its gate is metal or liquid, only what potential it sees.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function update() {

            const iso = state.kind === "isfet";

            seen[state.kind] = true;
            out(root, "gate", iso ? "electrolyte + insulator" : "metal on oxide");
            out(root, "wire", iso ? "the reference electrode" : "the metal gate");
            out(root, "verdict", iso ? "A liquid gate: the sensing insulator surface touches the solution" : "A metal gate: the voltage is applied directly");

            if (seen.mos && seen.isfet) {
                F.reward("fet-isfet", 10, "You swapped a metal gate for a liquid");
            }
        }

        function draw() {

            clear(ctx, 680, 360);

            const g = drawBody(ctx, { oxide: false });
            const iso = state.kind === "isfet";
            const top = g.top + 40;

            // the insulator layer above the channel
            ctx.fillStyle = BLUE + ".6)";
            ctx.fillRect(g.cx0 - 12, g.top - 12 + 40 - 40 + 0, g.cx1 - g.cx0 + 24, 12);

            // bracket: this part is the same in both
            ctx.strokeStyle = TEAL + ".6)";
            ctx.setLineDash([6, 5]);
            ctx.lineWidth = 2;
            ctx.strokeRect(g.x0 - 6, g.top - 4, g.x1 - g.x0 + 12, g.bot - g.top + 10);
            ctx.setLineDash([]);
            txt(ctx, "the same transistor in both", 340, g.bot + 28, 13, TEAL + "1)", "center", true);

            if (!iso) {

                ctx.fillStyle = GOLD + ".85)";
                ctx.fillRect(g.cx0 - 12, g.top - 62, g.cx1 - g.cx0 + 24, 50);
                txt(ctx, "metal gate", 340, g.top - 30, 15, "rgba(6,10,24,.95)", "center", true);
                ctx.strokeStyle = TEXT + ".7)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(340, g.top - 62); ctx.lineTo(340, 40); ctx.lineTo(430, 40);
                ctx.stroke();
                txt(ctx, "VG", 450, 45, 14, GOLD + "1)", "center", true);
            } else {

                // electrolyte
                ctx.fillStyle = BLUE + ".16)";
                ctx.fillRect(g.cx0 - 40, 50, g.cx1 - g.cx0 + 80, g.top - 62);
                txt(ctx, "electrolyte (water with ions)", 340, 120, 13, TEXT + ".8)");

                ions.forEach(function (ion) {

                    const x = g.cx0 - 30 + ion.x * (g.cx1 - g.cx0 + 60) + Math.sin(t * ion.v + ion.y * 6) * 5;
                    const y = 70 + ion.y * (g.top - 100) + Math.cos(t * ion.v + ion.x * 5) * 5;

                    dot(ctx, x, y, 4, (ion.pos ? ROSE : BLUE) + ".9)");
                });

                // reference electrode
                ctx.fillStyle = GREY + ".9)";
                ctx.fillRect(520, 20, 12, 120);
                txt(ctx, "reference electrode", 590, 28, 12, TEXT + ".9)");
                ctx.strokeStyle = TEXT + ".7)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(526, 20); ctx.lineTo(526, 10); ctx.lineTo(430, 10);
                ctx.stroke();
                txt(ctx, "VG", 410, 15, 14, GOLD + "1)", "center", true);

                txt(ctx, "sensing insulator surface (touches the liquid)", 340, g.top - 20, 12, BLUE + "1)", "center", true);
            }

            t += 0.016;
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


    SIMS["fet-isparts"] = quiz(
        "Game: the ISFET's new parts",
        ["Electrolyte", "Reference electrode", "Sensing insulator"],
        [
            { q: "Water with dissolved ions: it conducts, so it can carry the gate voltage.", a: "Electrolyte", why: "A liquid that conducts ions." },
            { q: "Holds the solution at a stable, known potential.", a: "Reference electrode", why: "It anchors the solution." },
            { q: "The oxide surface that touches the liquid and reacts with it.", a: "Sensing insulator", why: "This is where the sensing happens." },
            { q: "The gate voltage is applied to this.", a: "Reference electrode", why: "The solution passes it down to the insulator." },
            { q: "Its surface potential ψ₀ is the one term that responds to chemistry.", a: "Sensing insulator", why: "ψ₀ is the potential at the insulator surface in contact with the solution." }
        ],
        5,
        "fet-isparts-done",
        "You know the ISFET's new parts",
        "Everything you know about MOSFETs is now a tool for reading a solution.",
        "Electrolyte carries, reference anchors, insulator senses. Hit Reset to try again."
    );


    SIMS["fet-vthterms"] = function (root) {

        const defaults = { ph: 7, a: 1 };
        const state = { ph: 7, a: 1 };
        let hit = false;

        root.innerHTML =
            head("Try it: only one term responds to the solution") +
            art("0 0 340 200", "Four bars for the terms in the threshold voltage: the reference electrode, the silicon work function, oxide charge, and the surface potential. Only the surface potential bar changes when the pH changes.") +
            '<div class="fd-stat-row">' + stat("Surface potential ψ₀", "psi") + stat("Threshold shift vs. pH 7", "dv") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Solution pH", key: "ph", min: 3, max: 11, step: 0.1, value: 7 }) +
            slider({ label: "How completely the surface follows pH (α)", key: "a", min: 0.2, max: 1, step: 0.05, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">V<sub>th</sub> = constants − ψ₀. A threshold shift is therefore a direct reading of ψ₀: the transistor turns a surface potential into a current. (Higher pH gives a more negative surface and a higher NMOS threshold.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const psi = -0.0592 * state.a * (state.ph - 7);
            const dv = -psi;

            setVal(root, "ph", state.ph.toFixed(1));
            setVal(root, "a", state.a.toFixed(2));
            out(root, "psi", (psi >= 0 ? "+" : "") + (psi * 1000).toFixed(0) + " mV");
            out(root, "dv", (dv >= 0 ? "+" : "") + (dv * 1000).toFixed(0) + " mV");
            out(root, "verdict", Math.abs(state.ph - 7) < 0.05 ? "At pH 7 nothing has moved yet" : dv > 0 ? "Higher pH: a more negative surface, and a higher NMOS threshold" : "Lower pH: a more positive surface, and a lower NMOS threshold");

            const items = [["reference", 0.35, "rgba(170,179,207,.7)", false], ["work function", -0.55, "rgba(170,179,207,.7)", false], ["oxide charge", 0.1, "rgba(170,179,207,.7)", false], ["−ψ₀", dv, "rgba(255,214,102,.9)", true]];
            const zero = 120;
            const sc = 80;
            let s = '<line x1="20" y1="' + zero + '" x2="320" y2="' + zero + '" style="stroke:rgba(170,179,207,.5)"/>';

            items.forEach(function (it, i) {

                const x = 36 + i * 74;
                const h = it[1] * sc;

                s += rect(x, h >= 0 ? zero - h : zero, 50, Math.max(1, Math.abs(h)), it[2], it[3] ? "rgba(255,255,255,.8)" : "none");
                s += label(x + 25, 190, it[0], 7, "middle", it[3] ? "#ffd666" : "var(--muted)");
            });

            s += label(170, 14, it0(), 8, "middle", "var(--text)");

            svg.innerHTML = s;

            if (!hit && Math.abs(dv) > 0.15) {

                hit = true;
                F.reward("fet-vthterms", 10, "You saw that only ψ₀ responds to the solution");
            }

            function it0() { return "grey terms stay fixed; the gold term moves with pH"; }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 9: SURFACE CHARGE AND SITE BINDING
    ====================================== */

    SIMS["fet-sitebinding"] = function (root) {

        const defaults = { ph: 7, mat: "sio2" };
        const state = { ph: 7, mat: "sio2" };
        const mats = { sio2: { n: "SiO₂ (silica)", pKb: -2.9, pKa: 7.5 }, al2o3: { n: "Al₂O₃ (alumina)", pKb: 6, pKa: 11 } };
        const seen = {};
        const rand = mulberry(2);
        const prot = [];

        for (let i = 0; i < 40; i++) { prot.push({ x: rand(), y: rand(), v: 0.3 + rand() }); }

        root.innerHTML =
            head("Try it: an oxide in water") +
            canvasFor(680, 320, "A row of surface sites on an oxide in water. Each site is negative, neutral or positive depending on the pH. Hydrogen ions float above the surface; there are more of them at low pH.") +
            '<div class="fd-stat-row">' + stat("Negative sites (SiO⁻)", "neg") + stat("Neutral (SiOH)", "neu") + stat("Positive (SiOH₂⁺)", "pos") + stat("Net charge", "net") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Oxide", "mat", [["sio2", "SiO₂ (pzc ≈ pH 2–3)"], ["al2o3", "Al₂O₃ (pzc ≈ pH 8–9)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Solution pH", key: "ph", min: 1, max: 13, step: 0.1, value: 7 }) +
            "</div>" +
            '<p class="fd-sim-formula">SiOH ⇌ SiO⁻ + H⁺ and SiOH + H⁺ ⇌ SiOH₂⁺. More protons push sites positive; fewer push them negative. About 5 sites per nm² on silica, but only a fraction are charged at any pH. (Illustrative constants.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function fractions() {

            const m = mats[state.mat];
            const wp = Math.pow(10, m.pKb - state.ph);
            const wn = Math.pow(10, state.ph - m.pKa);
            const tot = 1 + wp + wn;

            return { pos: wp / tot, neu: 1 / tot, neg: wn / tot };
        }

        function update() {

            const f = fractions();
            const net = f.pos - f.neg;
            const m = mats[state.mat];
            const pzc = (m.pKb + m.pKa) / 2;

            seen[state.mat] = true;
            setVal(root, "ph", state.ph.toFixed(1));
            out(root, "neg", Math.round(f.neg * 100) + " %");
            out(root, "neu", Math.round(f.neu * 100) + " %");
            out(root, "pos", Math.round(f.pos * 100) + " %");
            out(root, "net", (net >= 0 ? "+" : "") + Math.round(net * 100) + " %");
            out(root, "verdict", Math.abs(state.ph - pzc) < 0.6 ? "Near the point of zero charge: the surface is almost neutral" : state.ph < pzc ? "Below the pzc: an acidic solution, a net positive surface" : "Above the pzc: a basic solution, a net negative surface");

            if (seen.sio2 && seen.al2o3) {
                F.reward("fet-sitebinding", 10, "You compared silica and alumina surfaces");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const f = fractions();
            const cols = 20;
            const rows = 2;
            const nPos = Math.round(f.pos * cols * rows);
            const nNeg = Math.round(f.neg * cols * rows);
            const base = 240;

            ctx.fillStyle = GREY + ".5)";
            ctx.fillRect(40, base, 600, 60);
            txt(ctx, "oxide (" + mats[state.mat].n + ")", 340, base + 40, 14, "rgba(6,10,24,.95)", "center", true);

            ctx.fillStyle = BLUE + ".1)";
            ctx.fillRect(40, 20, 600, base - 20);
            txt(ctx, "water", 80, 40, 13, TEXT + ".7)");

            // sites: assign states by order
            for (let i = 0; i < cols * rows; i++) {

                const c = i % cols;
                const r = Math.floor(i / cols);
                const x = 60 + c * 29.5;
                const y = base - 12 - r * 22;
                const idx = (i * 7) % (cols * rows);
                const state2 = idx < nPos ? "pos" : idx < nPos + nNeg ? "neg" : "neu";
                const col = state2 === "pos" ? ROSE : state2 === "neg" ? BLUE : GREY;

                dot(ctx, x, y, 8, col + ".95)");
                txt(ctx, state2 === "pos" ? "+" : state2 === "neg" ? "−" : "", x, y + 5, 14, "rgba(6,10,24,.95)", "center", true);
            }

            // protons above the surface: more at low pH (log scale)
            const n = Math.round(clamp((13 - state.ph) / 12, 0.03, 1) * prot.length);

            for (let i = 0; i < n; i++) {

                const p = prot[i];

                dot(ctx, 50 + p.x * 580 + Math.sin(t * p.v * 2 + i) * 6, 60 + p.y * 120 + Math.cos(t * p.v * 2 + i) * 6, 4, GOLD + ".95)");
            }

            txt(ctx, "● H⁺ ions (more at low pH)   ● positive site   ● negative site   ● neutral", 340, 306, 12, TEXT + ".65)");
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


    SIMS["fet-pzc"] = quiz(
        "Game: positive, negative or neutral?",
        ["Net positive", "Net negative", "Net neutral"],
        [
            { q: "Silica (pzc ≈ pH 2–3) in neutral water.", a: "Net negative", why: "Above its pzc, silica is negative." },
            { q: "Alumina (pzc ≈ pH 8–9) in neutral water.", a: "Net positive", why: "Below its pzc, alumina is positive." },
            { q: "Silica in a strongly acidic solution at pH 1.", a: "Net positive", why: "Below the pzc the surface is positive." },
            { q: "Alumina at pH 11.", a: "Net negative", why: "Above the pzc the surface is negative." },
            { q: "Any oxide exactly at its point of zero charge.", a: "Net neutral", why: "Positive and negative sites balance." },
            { q: "Silica at pH 10.", a: "Net negative", why: "Basic solutions give negative surfaces." }
        ],
        5,
        "fet-pzc-done",
        "You can predict a surface's charge",
        "In neutral water, silica is negative and alumina is positive.",
        "Compare the solution pH to the oxide's pzc. Hit Reset to try again."
    );


    SIMS["fet-surfph"] = function (root) {

        const defaults = { ph: 7, psi: -80 };
        const state = { ph: 7, psi: -80 };
        let hit = false;

        root.innerHTML =
            head("Try it: the surface has its own pH") +
            art("0 0 340 190", "Two pH scales, one for the bulk solution and one for the liquid right at the charged surface. A negative surface potential crowds protons near the surface and lowers the pH there.") +
            '<div class="fd-stat-row">' + stat("Bulk pH", "b") + stat("Surface pH", "s") + stat("Proton crowding", "x") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Bulk pH", key: "ph", min: 3, max: 11, step: 0.1, value: 7 }) +
            slider({ label: "Surface potential ψ₀ (mV)", key: "psi", min: -200, max: 200, step: 5, value: -80 }) +
            "</div>" +
            '<p class="fd-sim-formula">[H⁺]<sub>surface</sub> = [H⁺]<sub>bulk</sub> · e<sup>−qψ₀/kT</sup>. So pH<sub>surface</sub> = pH<sub>bulk</sub> + ψ₀ ÷ 59.2 mV. The surface pH can differ from the bulk by a unit or more.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const ps = state.ph + state.psi / 59.2;
            const ratio = Math.exp(-state.psi / 1000 / KT);

            setVal(root, "ph", state.ph.toFixed(1));
            setVal(root, "psi", (state.psi >= 0 ? "+" : "") + state.psi + " mV");
            out(root, "b", state.ph.toFixed(1));
            out(root, "s", ps.toFixed(1));
            out(root, "x", ratio >= 10 ? ratio.toFixed(0) + "× more H⁺" : ratio >= 1 ? ratio.toFixed(1) + "× more H⁺" : (1 / ratio).toFixed(1) + "× fewer H⁺");
            out(root, "verdict", Math.abs(ps - state.ph) < 0.2 ? "About the same at the surface and in the bulk" : ps < state.ph ? "A negative surface crowds protons: the surface is more acidic than the bulk" : "A positive surface repels protons: the surface is more basic than the bulk");

            const X = function (p) { return 30 + (p - 0) / 14 * 280; };
            let s = "";

            [[60, "bulk pH", state.ph], [130, "surface pH", ps]].forEach(function (r) {

                s += label(30, r[0] - 8, r[1], 8, "start", "var(--text)");
                s += rect(30, r[0], 280, 16, "rgba(170,179,207,.2)");

                for (let p = 0; p <= 14; p++) {

                    const c = "hsl(" + Math.round(p / 14 * 260) + ",70%,55%)";

                    s += '<rect x="' + (X(p) - 10) + '" y="' + r[0] + '" width="20" height="16" style="fill:' + c + ';opacity:.5"/>';
                }

                s += '<circle cx="' + X(clamp(r[2], 0, 14)) + '" cy="' + (r[0] + 8) + '" r="7" style="fill:#fff;stroke:#0b1020;stroke-width:1.5"/>';
                s += label(X(clamp(r[2], 0, 14)), r[0] + 34, r[2].toFixed(1), 8, "middle", "var(--text)");
            });

            svg.innerHTML = s;

            if (!hit && Math.abs(ps - state.ph) >= 1) {

                hit = true;
                F.reward("fet-surfph", 10, "You made the surface pH differ from the bulk by a unit");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    document.querySelectorAll('.fd-sim[data-sim^="fet-"]').forEach(F.mount);

})();
