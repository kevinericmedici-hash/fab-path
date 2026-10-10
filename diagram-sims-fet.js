/* ========================================
   BIOFETS & MOSFETS: INTERACTIVE SIMULATORS, PART 1

   Unit 1: a field-effect transistor you can switch, the FET family.
   Unit 2: mass action, the p-n junction.
   Unit 3: anatomy game, W/L, NMOS and PMOS.
   Unit 4: oxide capacitance, the three surface states, band bending.
   Unit 5: what sets the threshold, charge shifts the threshold.

   Registers on window.FabInteract; shares the helpers from
   diagram-sims-mems.js. Chains diagram-sims-fet-b.js and -c.js.
   Teaching models: numbers and shapes are illustrative.
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
    const art = M.art;
    const stat = M.stat;
    const rect = M.rect;
    const label = M.label;
    const animate = M.animate;
    const quiz = M.quiz;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const TEAL = "rgba(84,224,199,";
    const GOLD = "rgba(255,214,102,";
    const ROSE = "rgba(255,105,120,";
    const BLUE = "rgba(120,180,255,";
    const GREY = "rgba(170,179,207,";
    const TEXT = "rgba(245,247,255,";

    const KT = 0.02569; // kT/q at 25 °C, in volts
    const EPS0 = 8.854e-12;
    const Q = 1.602e-19;

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

    function sup(n) {

        const map = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

        return String(n).split("").map(function (c) { return map[c] || c; }).join("");
    }

    function sci(v) {

        if (!isFinite(v) || v <= 0) { return "0"; }

        const e = Math.floor(Math.log10(v) + 1e-9);
        const m = v / Math.pow(10, e);

        return m.toFixed(1) + " × 10" + sup(e);
    }

    // Drain current of an NMOS in saturation or triode, in mA (k in mA/V²).
    function idrain(vgs, vds, vth, k) {

        const vov = vgs - vth;

        if (vov <= 0) { return 0; }
        if (vds >= vov) { return 0.5 * k * vov * vov; }

        return k * (vov * vds - vds * vds / 2);
    }

    // Draw a cross-section of an n-channel transistor body. Returns the geometry.
    function drawBody(ctx, o) {

        const g = { x0: 70, x1: 610, top: 200, bot: 318, sx: 90, sw: 120, dx: 470, dw: 120, cx0: 210, cx1: 470 };

        ctx.fillStyle = GREY + ".42)";
        ctx.fillRect(g.x0, g.top, g.x1 - g.x0, g.bot - g.top);

        // source and drain
        ctx.fillStyle = TEAL + ".55)";
        ctx.fillRect(g.sx, g.top, g.sw, 46);
        ctx.fillRect(g.dx, g.top, g.dw, 46);
        txt(ctx, "n⁺ source", g.sx + g.sw / 2, g.top + 28, 13, "rgba(6,10,24,.95)", "center", true);
        txt(ctx, "n⁺ drain", g.dx + g.dw / 2, g.top + 28, 13, "rgba(6,10,24,.95)", "center", true);
        txt(ctx, "p-type body", 340, g.bot - 14, 13, TEXT + ".85)");

        if (o.oxide !== false) {

            ctx.fillStyle = BLUE + ".55)";
            ctx.fillRect(g.cx0 - 12, g.top - 12, g.cx1 - g.cx0 + 24, 12);
        }

        return g;
    }

    F.fetHelpers = {
        TEAL: TEAL, GOLD: GOLD, ROSE: ROSE, BLUE: BLUE, GREY: GREY, TEXT: TEXT, KT: KT, EPS0: EPS0, Q: Q,
        canvasFor: canvasFor, clear: clear, txt: txt, dot: dot, sup: sup, sci: sci, idrain: idrain, drawBody: drawBody
    };


    /* ======================================
       UNIT 1: TRANSISTORS
    ====================================== */

    SIMS["fet-terminals"] = quiz(
        "Game: name the terminal",
        ["Gate", "Source", "Drain", "Body"],
        [
            { q: "The control terminal: its voltage decides how much current can flow.", a: "Gate", why: "The gate is the control." },
            { q: "Where the current-carrying charges enter the channel.", a: "Source", why: "Charges start their trip here." },
            { q: "Where those charges leave the channel.", a: "Drain", why: "The drain collects them." },
            { q: "The substrate, usually tied to the source or to ground.", a: "Body", why: "The fourth connection." },
            { q: "Gate voltage is measured against this terminal.", a: "Source", why: "It is the reference end." },
            { q: "Usually held at a higher voltage than the source in an NMOS.", a: "Drain", why: "That pulls the electrons across." }
        ],
        5,
        "fet-terminals-done",
        "You know the four terminals",
        "Gate controls, source supplies, drain collects, body is the substrate.",
        "Gate, source, drain, body. Hit Reset to try again."
    );


    SIMS["fet-basic"] = function (root) {

        const defaults = { vg: 0.5, vd: 1.5, dv: 0 };
        const state = { vg: 0.5, vd: 1.5, dv: 0 };
        const VTH = 0.7;
        const K = 1.0;
        const rand = mulberry(3);
        const parts = [];
        let on = false;
        let swept = false;
        let sensed = false;

        for (let i = 0; i < 46; i++) { parts.push({ u: rand(), v: rand() }); }

        root.innerHTML =
            head("Try it: switch a field-effect transistor") +
            canvasFor(680, 340, "A cross-section of an n-channel MOSFET. When the gate voltage is above the threshold, electrons gather under the oxide and form a channel, and current flows from source to drain.") +
            '<div class="fd-stat-row">' + stat("Channel", "ch") + stat("Drain current", "id") + stat("Mode", "mode") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Gate voltage (VGS)", key: "vg", min: 0, max: 3, step: 0.05, value: 0.5 }) +
            slider({ label: "Drain voltage (VDS)", key: "vd", min: 0, max: 3, step: 0.05, value: 1.5 }) +
            slider({ label: "Sensor: charge at the gate, as equivalent volts", key: "dv", min: -0.5, max: 0.5, step: 0.05, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">The gate is insulated, so almost no current flows into it: its electric field controls how many charges sit in the channel. Anything that changes the gate\'s effective voltage changes the current. (Threshold 0.7 V.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function eff() { return state.vg + state.dv; }

        function update() {

            const vg = eff();
            const id = idrain(vg, state.vd, VTH, K);
            const vov = vg - VTH;

            setVal(root, "vg", state.vg.toFixed(2) + " V");
            setVal(root, "vd", state.vd.toFixed(2) + " V");
            setVal(root, "dv", (state.dv >= 0 ? "+" : "") + state.dv.toFixed(2) + " V");

            out(root, "ch", vov > 0 ? "formed (inversion)" : "none: off");
            out(root, "id", id >= 1 ? id.toFixed(2) + " mA" : (id * 1000).toFixed(0) + " µA");
            out(root, "mode", vov <= 0 ? "off" : state.vd >= vov ? "saturation (pinched off)" : "triode (like a resistor)");
            out(root, "verdict", vov <= 0 ? "Gate too low: no channel, no current" : "Gate above threshold: a channel of electrons carries current");

            if (vov > 0) { on = true; }
            if (on && vov <= 0) { swept = true; }

            if (state.dv !== 0) { sensed = true; }

            if (on && swept && sensed) {
                F.reward("fet-basic", 10, "You switched a transistor and nudged it with sensor charge");
            }
        }

        function draw(t) {

            clear(ctx, 680, 340);

            const g = drawBody(ctx, {});
            const vg = eff();
            const vov = vg - VTH;

            // gate
            ctx.fillStyle = GOLD + ".85)";
            ctx.fillRect(g.cx0 - 12, g.top - 52, g.cx1 - g.cx0 + 24, 40);
            txt(ctx, "gate", 340, g.top - 28, 14, "rgba(6,10,24,.95)", "center", true);
            txt(ctx, "oxide", 340, g.top - 3, 11, TEXT + ".7)");

            // wires and voltage tags
            ctx.strokeStyle = TEXT + ".6)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(340, g.top - 52); ctx.lineTo(340, 60);
            ctx.moveTo(g.sx + 60, g.top); ctx.lineTo(g.sx + 60, 120); ctx.lineTo(120, 120);
            ctx.moveTo(g.dx + 60, g.top); ctx.lineTo(g.dx + 60, 120); ctx.lineTo(560, 120);
            ctx.stroke();
            txt(ctx, "VGS = " + state.vg.toFixed(2) + " V", 340, 52, 14, GOLD + "1)", "center", true);
            txt(ctx, "source", 120, 110, 13, TEXT + ".85)");
            txt(ctx, "drain  " + state.vd.toFixed(2) + " V", 560, 110, 13, TEXT + ".85)");

            // depletion region
            const dep = clamp(Math.min(vg, VTH) / VTH, 0, 1) * 44;

            if (dep > 1) {

                ctx.fillStyle = ROSE + ".1)";
                ctx.fillRect(g.cx0, g.top, g.cx1 - g.cx0, dep);

                for (let i = 0; i < 9; i++) { txt(ctx, "−", g.cx0 + 20 + i * 30, g.top + dep - 8, 14, ROSE + ".8)", "center", true); }
            }

            // channel
            if (vov > 0) {

                const th = clamp(vov * 12, 3, 13);
                const frac = state.vd >= vov ? 1 : state.vd / vov;

                ctx.beginPath();
                ctx.moveTo(g.cx0, g.top);

                for (let x = g.cx0; x <= g.cx1; x += 10) {

                    const u = (x - g.cx0) / (g.cx1 - g.cx0);

                    ctx.lineTo(x, g.top + th * (1 - u * frac * (state.vd >= vov ? 1 : 0.5)));
                }

                ctx.lineTo(g.cx1, g.top);
                ctx.closePath();
                ctx.fillStyle = TEAL + ".85)";
                ctx.fill();

                // electrons move source to drain
                const id = idrain(vg, state.vd, VTH, K);
                const n = Math.round(clamp(id / 0.8, 0.06, 1) * parts.length);

                for (let i = 0; i < n; i++) {

                    const p = parts[i];
                    const u = (p.u + t * (0.15 + id * 0.6)) % 1;
                    const x = g.cx0 - 90 + u * (g.cx1 - g.cx0 + 180);
                    const yy = g.top + 3 + (p.v * th * 0.7);

                    dot(ctx, x, yy, 3.2, "rgba(255,255,255,.95)");
                }

                txt(ctx, "channel: a layer of electrons", 340, g.top + 76, 13, TEAL + "1)", "center", true);
            } else {

                txt(ctx, "no channel: the source and drain are isolated", 340, g.top + 76, 13, ROSE + "1)", "center", true);
            }

            // sensor charge near the gate
            if (state.dv !== 0) {

                const sgn = state.dv > 0 ? "+" : "−";

                for (let i = 0; i < Math.round(Math.abs(state.dv) * 12) + 1; i++) {
                    txt(ctx, sgn, 230 + i * 28, 36, 18, (state.dv > 0 ? ROSE : BLUE) + "1)", "center", true);
                }
            }
        }

        let t = 0;

        animate(root, function (dt) {

            t += dt;
            draw(t);
        });

        wire(root, state, defaults, function () {

            update();
            draw(t);
        });

        update();
        draw(0);
    };


    SIMS["fet-jobs"] = quiz(
        "Game: switch, amplifier or sensor?",
        ["Switch", "Amplifier", "Sensor"],
        [
            { q: "Gate high means on, gate low means off: the basis of digital logic.", a: "Switch", why: "Two states, on or off." },
            { q: "A small change in gate voltage makes a larger change in current.", a: "Amplifier", why: "That is gain." },
            { q: "Anything that changes the gate's effective voltage changes the current.", a: "Sensor", why: "This is the job this course is about." },
            { q: "A processor's billions of transistors mostly do this.", a: "Switch", why: "Logic is built from switches." },
            { q: "A transistor turns a weak microphone signal into a bigger one.", a: "Amplifier", why: "Same shape, bigger size." },
            { q: "A transistor whose gate is exposed to a liquid and reacts to what is dissolved in it.", a: "Sensor", why: "Charge near the gate shifts the current." }
        ],
        5,
        "fet-jobs-done",
        "You know the three jobs",
        "Switch, amplifier, sensor: one device, three jobs.",
        "Switch: on or off. Amplifier: small in, big out. Sensor: anything near the gate changes the current. Hit Reset to try again."
    );


    SIMS["fet-family"] = quiz(
        "Game: which transistor family?",
        ["MOSFET", "JFET", "MESFET or HEMT", "BJT"],
        [
            { q: "An oxide separates the gate from the channel.", a: "MOSFET", why: "MOSFET stands for metal-oxide-semiconductor field-effect transistor." },
            { q: "The gate is a reverse-biased p–n junction.", a: "JFET", why: "JFET stands for junction field-effect transistor: no oxide here." },
            { q: "Metal-semiconductor gates, used mostly in high-frequency circuits.", a: "MESFET or HEMT", why: "MESFET: metal-semiconductor FET. HEMT: high-electron-mobility transistor. High-speed specialists." },
            { q: "Not a FET at all: a small input current controls a larger one.", a: "BJT", why: "BJT stands for bipolar junction transistor: current-controlled rather than field-controlled." },
            { q: "The family this course builds sensors on, because its oxide surface can react with a solution.", a: "MOSFET", why: "The oxide is the sensing surface." }
        ],
        5,
        "fet-family-done",
        "You know the transistor family",
        "We focus on the MOSFET, because its oxide surface is what sensing builds on.",
        "MOSFET has an oxide gate. JFET has a junction gate. BJT is current-controlled. Hit Reset to try again."
    );


    /* ======================================
       UNIT 2: SEMICONDUCTOR REFRESHER
    ====================================== */

    SIMS["fet-carriers"] = quiz(
        "Game: electrons or holes?",
        ["n-type", "p-type", "Intrinsic (pure) silicon"],
        [
            { q: "Doped with phosphorus or arsenic: extra free electrons.", a: "n-type", why: "Donors give up electrons." },
            { q: "Doped with boron, leaving mobile holes behind.", a: "p-type", why: "Acceptors leave holes." },
            { q: "Pure silicon: barely conducts at room temperature.", a: "Intrinsic (pure) silicon", why: "Only about 10¹⁰ free electrons per cm³." },
            { q: "Electrons are the majority carrier.", a: "n-type", why: "Majority carriers dominate." },
            { q: "Holes are the majority carrier, electrons the minority.", a: "p-type", why: "The reverse of n-type." },
            { q: "The substrate of an n-channel MOSFET.", a: "p-type", why: "Electrons are the minority there, until the gate pulls them in." }
        ],
        5,
        "fet-carriers-done",
        "You know your carriers",
        "n-type: electrons. p-type: holes. Doping makes silicon useful.",
        "Donors make n-type, acceptors make p-type. Hit Reset to try again."
    );


    SIMS["fet-massaction"] = function (root) {

        const defaults = { ld: 16, kind: "p" };
        const state = { ld: 16, kind: "p" };
        const NI = 1e10;
        const seen = {};

        root.innerHTML =
            head("Try it: n × p = nᵢ²") +
            art("0 0 340 210", "Two bars on a log scale: the concentration of electrons and the concentration of holes in silicon. As doping raises one, the other falls so that their product stays at ni squared.") +
            '<div class="fd-stat-row">' + stat("Electrons per cm³", "n") + stat("Holes per cm³", "p") + stat("n × p", "np") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Doping", "kind", [["n", "n-type (donors)"], ["p", "p-type (acceptors)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Doping (atoms per cm³, log scale)", key: "ld", min: 10, max: 20, step: 0.5, value: 16 }) +
            "</div>" +
            '<p class="fd-sim-formula">With 10¹⁶ boron atoms per cm³, holes number about 10¹⁶, so electrons drop to (10¹⁰)² ÷ 10¹⁶ = 10⁴ per cm³. Minority carriers in the substrate are nearly absent, until a gate field pulls them in.</p>';

        const svg = root.querySelector("svg");

        function carriers() {

            const N = Math.pow(10, state.ld);
            const maj = N / 2 + Math.sqrt(N * N / 4 + NI * NI);
            const min = NI * NI / maj;

            return state.kind === "n" ? { n: maj, p: min } : { n: min, p: maj };
        }

        function update() {

            const c = carriers();

            seen[state.kind] = true;
            setVal(root, "ld", "10" + sup(state.ld % 1 ? state.ld.toFixed(1) : state.ld));
            out(root, "n", sci(c.n));
            out(root, "p", sci(c.p));
            out(root, "np", sci(c.n * c.p));
            out(root, "verdict", state.ld <= 10.5 ? "Barely doped: close to pure silicon" : state.kind === "n" ? "Electrons are the majority; holes are scarce" : "Holes are the majority; electrons are scarce");

            const Y = function (v) { return 170 - (Math.log10(Math.max(v, 1)) / 21) * 150; };

            let s = rect(40, 20, 270, 150, "rgba(6,10,24,.55)", "rgba(170,179,207,.35)");

            [0, 5, 10, 15, 20].forEach(function (e) {

                s += '<line x1="40" y1="' + Y(Math.pow(10, e)) + '" x2="310" y2="' + Y(Math.pow(10, e)) + '" style="stroke:rgba(170,179,207,.18);stroke-width:.6"/>';
                s += label(36, Y(Math.pow(10, e)) + 2.5, "10" + sup(e), 6.5, "end", "var(--muted)");
            });

            s += rect(80, Y(c.n), 70, 170 - Y(c.n), "rgba(84,224,199,.85)");
            s += rect(200, Y(c.p), 70, 170 - Y(c.p), "rgba(255,105,120,.85)");
            s += label(115, 186, "electrons", 8, "middle", "var(--text)");
            s += label(235, 186, "holes", 8, "middle", "var(--text)");
            s += label(115, Y(c.n) - 4, sci(c.n), 6.5, "middle", "var(--muted)");
            s += label(235, Y(c.p) - 4, sci(c.p), 6.5, "middle", "var(--muted)");
            s += label(175, 202, "concentration (per cm³)", 7, "middle", "var(--muted)");

            svg.innerHTML = s;

            if (seen.n && seen.p && state.ld >= 16) {
                F.reward("fet-massaction", 10, "You saw mass action in both n-type and p-type silicon");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-pnjunction"] = function (root) {

        const defaults = { v: 0 };
        const state = { v: 0 };
        const VBI = 0.7;
        const rand = mulberry(9);
        const parts = [];
        const seen = {};

        for (let i = 0; i < 30; i++) { parts.push({ x: rand(), y: rand(), side: i % 2, vx: (rand() - 0.5) * 20, vy: (rand() - 0.5) * 20 }); }

        root.innerHTML =
            head("Try it: bias a p–n junction") +
            canvasFor(680, 320, "An n-type region on the left and a p-type region on the right with a depletion region between them, containing fixed charged ions. Reverse bias widens the depletion region and blocks current; forward bias narrows it and lets current flow.") +
            '<div class="fd-stat-row">' + stat("Depletion width", "w") + stat("Current", "i") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Applied voltage (negative = reverse bias)", key: "v", min: -5, max: 0.65, step: 0.05, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Reverse bias widens the depletion region; forward bias narrows it. A reverse-biased junction blocks current, and that is how a MOSFET\'s source and drain stay isolated from the body.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function width() { return Math.sqrt(Math.max(0.02, VBI - state.v) / VBI); }

        function update() {

            const w = width();
            const cur = state.v > 0.4 ? Math.exp((state.v - 0.4) / 0.05) * 0.2 : 0.001;

            seen[state.v < -1 ? "rev" : state.v > 0.45 ? "fwd" : "mid"] = true;
            setVal(root, "v", (state.v >= 0 ? "+" : "") + state.v.toFixed(2) + " V");
            out(root, "w", w.toFixed(2) + "× the unbiased width");
            out(root, "i", state.v > 0.45 ? "flows freely" : "blocked (tiny leakage)");
            out(root, "verdict", state.v < -0.2 ? "Reverse bias: the depletion region widens and blocks current" : state.v > 0.45 ? "Forward bias: the barrier shrinks and current flows" : "Near zero bias: a thin depletion region with a built-in field");

            if (seen.rev && seen.fwd) {
                F.reward("fet-pnjunction", 10, "You biased a junction both ways");
            }

            cur;
        }

        function draw() {

            clear(ctx, 680, 320);

            const w = width() * 70;
            const cx = 340;
            const top = 70;
            const h = 180;

            ctx.fillStyle = TEAL + ".18)";
            ctx.fillRect(60, top, cx - w - 60, h);
            ctx.fillStyle = ROSE + ".18)";
            ctx.fillRect(cx + w, top, 620 - cx - w, h);
            ctx.fillStyle = GOLD + ".16)";
            ctx.fillRect(cx - w, top, 2 * w, h);

            txt(ctx, "n-type", 170, top + 24, 15, TEAL + "1)", "center", true);
            txt(ctx, "p-type", 510, top + 24, 15, ROSE + "1)", "center", true);

            // fixed ions in the depletion region
            for (let i = 0; i < 6; i++) {

                const y = top + 30 + i * 28;

                txt(ctx, "+", cx - w + w / 2, y + 10, 18, TEAL + "1)", "center", true);
                txt(ctx, "−", cx + w / 2, y + 10, 18, ROSE + "1)", "center", true);
            }

            txt(ctx, "depletion region", cx, top + h + 24, 13, GOLD + "1)");

            // built-in field arrow
            ctx.strokeStyle = GOLD + ".9)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx + w * 0.6, top - 12); ctx.lineTo(cx - w * 0.6, top - 12);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - w * 0.6, top - 12); ctx.lineTo(cx - w * 0.6 + 8, top - 18); ctx.lineTo(cx - w * 0.6 + 8, top - 6);
            ctx.fill();
            txt(ctx, "built-in field", cx, top - 22, 12, GOLD + "1)");

            // mobile carriers jiggle; they cross when forward-biased
            parts.forEach(function (p) {

                const left = p.side === 0;
                let x = left ? 60 + p.x * (cx - w - 70) : cx + w + 10 + p.x * (620 - cx - w - 20);
                const y = top + 40 + p.y * (h - 60);

                if (state.v > 0.45) {

                    const shift = (p.x * 160 + 40 * Math.sin(p.y * 6)) * (state.v - 0.4) * 2;

                    x += left ? shift : -shift;
                }

                dot(ctx, x, y, 4, left ? TEXT + ".95)" : "rgba(0,0,0,0)");

                if (!left) {

                    ctx.strokeStyle = TEXT + ".95)";
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.arc(x, y, 4.4, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            txt(ctx, "● electrons   ○ holes", 340, 306, 12, TEXT + ".7)");
        }

        animate(root, function (dt) {

            parts.forEach(function (p) {

                p.x += p.vx * dt * 0.004 * (state.v > 0.45 ? 1 : 0.4);
                p.x = (p.x + 1) % 1;
            });

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
       UNIT 3: ANATOMY OF A MOSFET
    ====================================== */

    SIMS["fet-anatomy"] = quiz(
        "Game: which part of the MOSFET?",
        ["Gate", "Gate oxide", "Channel", "Source and drain", "Body"],
        [
            { q: "Heavily doped polysilicon, or a metal in modern high-k metal gates.", a: "Gate", why: "It sets the field." },
            { q: "Thermally grown SiO₂, or a high-k dielectric such as HfO₂.", a: "Gate oxide", why: "The most carefully engineered layer in the device." },
            { q: "A very thin layer of silicon just under the oxide, where current flows when the gate is on.", a: "Channel", why: "It forms only when the gate is on." },
            { q: "Heavily doped n⁺ regions in an NMOS.", a: "Source and drain", why: "Heavily doped so charges can enter and leave." },
            { q: "A lightly doped silicon wafer.", a: "Body", why: "The p-type substrate in an NMOS." },
            { q: "The layer that gives the MOSFET the 'O' in its name.", a: "Gate oxide", why: "Metal-oxide-semiconductor." }
        ],
        5,
        "fet-anatomy-done",
        "You know the layers",
        "Gate, oxide, channel, source and drain, body.",
        "Metal on top, oxide in the middle, silicon below. Hit Reset to try again."
    );


    SIMS["fet-wl"] = function (root) {

        const defaults = { w: 10, l: 1, vov: 0.5 };
        const state = { w: 10, l: 1, vov: 0.5 };
        let hit = false;

        root.innerHTML =
            head("Try it: the W/L ratio") +
            canvasFor(680, 300, "A top view of a transistor channel. The width W runs across the current flow and the length L runs from source to drain. Wider and shorter channels carry more current.") +
            '<div class="fd-stat-row">' + stat("W/L", "wl") + stat("Saturation current", "id") + stat("vs. W/L = 1", "rel") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Channel width W", key: "w", min: 1, max: 50, step: 1, value: 10 }) +
            slider({ label: "Channel length L", key: "l", min: 0.1, max: 5, step: 0.1, value: 1 }) +
            slider({ label: "Gate overdrive (VGS − Vth)", key: "vov", min: 0.1, max: 1.5, step: 0.05, value: 0.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">I ∝ W ÷ L. A wider channel carries more current in parallel, and a shorter one adds less resistance. With μC<sub>ox</sub> = 100 µA/V², the current in saturation is ½ · μC<sub>ox</sub> · (W/L) · V<sub>ov</sub>².</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function id() { return 0.5 * 100 * (state.w / state.l) * state.vov * state.vov; }

        function update() {

            const cur = id();

            setVal(root, "w", state.w + " µm");
            setVal(root, "l", state.l.toFixed(1) + " µm");
            setVal(root, "vov", state.vov.toFixed(2) + " V");
            out(root, "wl", (state.w / state.l).toFixed(1));
            out(root, "id", cur >= 1000 ? (cur / 1000).toFixed(2) + " mA" : cur.toFixed(0) + " µA");
            out(root, "rel", (cur / (0.5 * 100 * state.vov * state.vov)).toFixed(0) + "×");
            out(root, "verdict", state.w / state.l > 30 ? "Wide and short: lots of current" : state.w / state.l < 3 ? "Narrow and long: little current" : "A moderate transistor");

            if (!hit && state.w / state.l >= 100) {

                hit = true;
                F.reward("fet-wl", 10, "You built a wide, short transistor");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const wpx = 40 + state.w / 50 * 160;
            const lpx = 60 + state.l / 5 * 280;
            const cx = 340;
            const cy = 150;

            ctx.fillStyle = TEAL + ".55)";
            ctx.fillRect(cx - lpx / 2 - 100, cy - wpx / 2 - 6, 100, wpx + 12);
            ctx.fillRect(cx + lpx / 2, cy - wpx / 2 - 6, 100, wpx + 12);
            ctx.fillStyle = GOLD + ".35)";
            ctx.fillRect(cx - lpx / 2, cy - wpx / 2 - 14, lpx, wpx + 28);
            ctx.strokeStyle = GOLD + ".9)";
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - lpx / 2, cy - wpx / 2 - 14, lpx, wpx + 28);
            txt(ctx, "gate", cx, cy - wpx / 2 - 22, 12, GOLD + "1)");
            txt(ctx, "source", cx - lpx / 2 - 50, cy + 5, 13, "rgba(6,10,24,.95)", "center", true);
            txt(ctx, "drain", cx + lpx / 2 + 50, cy + 5, 13, "rgba(6,10,24,.95)", "center", true);

            // length and width arrows
            ctx.strokeStyle = TEXT + ".8)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - lpx / 2, cy + wpx / 2 + 28); ctx.lineTo(cx + lpx / 2, cy + wpx / 2 + 28);
            ctx.moveTo(cx - lpx / 2 - 112, cy - wpx / 2); ctx.lineTo(cx - lpx / 2 - 112, cy + wpx / 2);
            ctx.stroke();
            txt(ctx, "L", cx, cy + wpx / 2 + 46, 14, TEXT + "1)", "center", true);
            txt(ctx, "W", cx - lpx / 2 - 124, cy + 5, 14, TEXT + "1)", "center", true);

            // current dots in parallel lanes
            const lanes = Math.max(2, Math.round(state.w / 4));
            const speed = 0.1 + id() / 2500;

            for (let i = 0; i < lanes; i++) {

                const y = cy - wpx / 2 + (i + 0.5) * (wpx / lanes);

                for (let k = 0; k < 3; k++) {

                    const u = ((t * speed * 3 + k / 3 + i * 0.13) % 1);

                    dot(ctx, cx - lpx / 2 - 80 + u * (lpx + 160), y, 3, "rgba(255,255,255,.95)");
                }
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


    SIMS["fet-nmospmos"] = quiz(
        "Game: NMOS, PMOS or CMOS?",
        ["NMOS", "PMOS", "CMOS"],
        [
            { q: "A p-type body with n⁺ source and drain and an electron channel.", a: "NMOS", why: "NMOS is the n-channel MOSFET: electrons carry the current." },
            { q: "An n-type body with p⁺ source and drain and a hole channel.", a: "PMOS", why: "PMOS is the p-channel MOSFET: holes carry the current." },
            { q: "Both kinds on one chip, so almost no current flows when idle.", a: "CMOS", why: "CMOS is complementary MOS: one of the pair is always off." },
            { q: "Turns on with a positive gate voltage.", a: "NMOS", why: "A positive gate attracts electrons." },
            { q: "Turns on with a negative gate voltage.", a: "PMOS", why: "A negative gate attracts holes." },
            { q: "Faster, because electrons move faster than holes.", a: "NMOS", why: "Electron mobility is higher." }
        ],
        5,
        "fet-nmospmos-done",
        "You can tell NMOS, PMOS and CMOS apart",
        "The PMOS mirrors the NMOS, with signs and carriers flipped.",
        "NMOS: electrons, positive gate. PMOS: holes, negative gate. CMOS: both. Hit Reset to try again."
    );


    /* ======================================
       UNIT 4: THE MOS CAPACITOR
    ====================================== */

    SIMS["fet-cox"] = function (root) {

        const defaults = { t: 10, k: 3.9 };
        const state = { t: 10, k: 3.9 };
        let hit = false;

        root.innerHTML =
            head("Try it: oxide capacitance, C = ε ÷ t") +
            art("0 0 340 190", "A gate, an oxide layer whose thickness follows the slider, and the silicon below, with a bar showing the oxide capacitance per unit area.") +
            '<div class="fd-stat-row">' + stat("Oxide capacitance", "c") + stat("vs. 10 nm SiO₂", "rel") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Insulator (relative permittivity)", "k", [["3.9", "SiO₂ (3.9)"], ["7.5", "Si₃N₄ (7.5)"], ["9", "Al₂O₃ (9)"], ["22", "HfO₂ (≈22)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Oxide thickness", key: "t", min: 1, max: 50, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">C<sub>ox</sub> = ε<sub>ox</sub> ÷ t<sub>ox</sub>, with ε<sub>ox</sub> = 3.9 ε₀ for SiO₂. A 10 nm oxide gives about 3.45 fF per µm². Thinner oxide means more capacitance, so the gate grips the channel harder.</p>';

        const svg = root.querySelector("svg");
        const base = 3.9 * EPS0 / 10e-9;

        function update() {

            const c = state.k * EPS0 / (state.t * 1e-9); // F/m²
            const ff = c * 1e-12 * 1e15; // fF/µm²

            setVal(root, "t", state.t + " nm");
            out(root, "c", ff.toFixed(2) + " fF/µm²  (" + (c * 100).toFixed(2) + " µF/cm²)");
            out(root, "rel", (c / base).toFixed(2) + "×");
            out(root, "verdict", ff > 15 ? "A very strong grip on the channel" : ff > 5 ? "Stronger than the 10 nm SiO₂ reference" : ff < 2 ? "A weak grip: a thick, low-permittivity oxide" : "A typical oxide");

            const hh = 8 + state.t / 50 * 52;
            let s = rect(70, 20, 140, 28, "rgba(255,214,102,.85)") + label(140, 38, "gate", 9, "middle", "#04201b");

            s += rect(70, 48, 140, hh, "rgba(120,180,255,.55)", "rgba(120,180,255,.95)") + label(140, 48 + hh / 2 + 3, state.t + " nm", 8, "middle", "var(--text)");
            s += rect(70, 48 + hh, 140, 100 - hh, "rgba(170,179,207,.42)") + label(140, 48 + hh + (100 - hh) / 2 + 3, "p-type silicon", 8, "middle", "var(--text)");

            const w = 80 * Math.min(1, ff / 25);

            s += label(240, 40, "capacitance", 7, "start", "var(--muted)");
            s += rect(240, 48, 80, 12, "rgba(170,179,207,.2)") + rect(240, 48, w, 12, "rgba(84,224,199,.9)");
            s += label(240, 78, ff.toFixed(1) + " fF/µm²", 8, "start", "var(--text)");

            svg.innerHTML = s;

            if (!hit && ff > 15) {

                hit = true;
                F.reward("fet-cox", 10, "You boosted the gate's grip with a thin, high-k oxide");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-mos3"] = function (root) {

        const defaults = { vg: 0 };
        const state = { vg: 0 };
        const VTH = 0.7;
        const rand = mulberry(11);
        const parts = [];
        const seen = {};

        for (let i = 0; i < 40; i++) { parts.push({ x: rand(), y: rand(), ph: rand() * 6.28 }); }

        root.innerHTML =
            head("Try it: walk the gate voltage") +
            canvasFor(680, 320, "A gate, oxide and p-type silicon. A negative gate pulls holes to the surface, a small positive gate pushes them away and uncovers fixed negative ions, and a larger positive gate pulls electrons to the surface to form an inversion layer.") +
            '<div class="fd-stat-row">' + stat("State", "state") + stat("At the surface", "surf") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Gate voltage VG", key: "vg", min: -2, max: 2.5, step: 0.05, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Inversion is the channel: an electron layer in p-type silicon. (Threshold 0.7 V; the boundaries shift slightly with the flat-band voltage.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function kind() { return state.vg < -0.05 ? "acc" : state.vg < VTH ? "dep" : "inv"; }

        function update() {

            const k = kind();

            seen[k] = true;
            setVal(root, "vg", (state.vg >= 0 ? "+" : "") + state.vg.toFixed(2) + " V");
            out(root, "state", k === "acc" ? "accumulation" : k === "dep" ? "depletion" : "inversion");
            out(root, "surf", k === "acc" ? "extra holes" : k === "dep" ? "fixed negative ions" : "a layer of electrons");
            out(root, "verdict", k === "acc" ? "VG < 0: holes gather, so the surface looks even more p-type" : k === "dep" ? "0 < VG < Vth: holes are pushed away, uncovering fixed ions" : "VG > Vth: electrons gather and form a conducting channel");

            if (seen.acc && seen.dep && seen.inv) {
                F.reward("fet-mos3", 10, "You walked through all three surface states");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const k = kind();
            const x0 = 120;
            const x1 = 560;
            const top = 130;
            const bot = 300;

            // gate and oxide
            ctx.fillStyle = GOLD + ".85)";
            ctx.fillRect(x0, 50, x1 - x0, 50);
            txt(ctx, "gate  (" + (state.vg >= 0 ? "+" : "") + state.vg.toFixed(2) + " V)", 340, 82, 15, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = BLUE + ".5)";
            ctx.fillRect(x0, 100, x1 - x0, 30);
            txt(ctx, "oxide", 340, 120, 12, TEXT + ".8)");

            // silicon
            ctx.fillStyle = GREY + ".4)";
            ctx.fillRect(x0, top, x1 - x0, bot - top);

            // charges on the gate
            const nq = Math.round(Math.abs(state.vg) * 5);

            for (let i = 0; i < nq; i++) {
                txt(ctx, state.vg > 0 ? "+" : "−", x0 + 20 + i * ((x1 - x0 - 40) / Math.max(nq, 1)), 70, 18, (state.vg > 0 ? ROSE : BLUE) + "1)", "center", true);
            }

            const depth = k === "acc" ? 0 : Math.sqrt(clamp(Math.min(state.vg, VTH) / VTH, 0, 1)) * 90;

            if (depth > 0) {

                ctx.fillStyle = ROSE + ".12)";
                ctx.fillRect(x0, top, x1 - x0, depth);
                txt(ctx, "depletion layer", x1 - 70, top + depth + 14, 12, ROSE + "1)");

                for (let i = 0; i < 10; i++) { txt(ctx, "−", x0 + 25 + i * 44, top + depth - 6, 16, ROSE + ".9)", "center", true); }
            }

            // mobile holes: far from the surface when pushed away
            parts.forEach(function (p, i) {

                const x = x0 + 10 + p.x * (x1 - x0 - 20) + Math.sin(t * 1.5 + p.ph) * 5;
                let y = top + 8 + p.y * (bot - top - 16);

                if (k === "acc") {

                    const pull = clamp(Math.abs(state.vg) / 2, 0, 1);

                    y = top + 10 + (y - top) * (1 - pull * 0.8);
                } else if (y < top + depth + 6) {

                    y = top + depth + 6 + (y - top) * 0.3;
                }

                y += Math.cos(t * 1.4 + p.ph) * 4;

                ctx.strokeStyle = TEXT + ".85)";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.arc(x, y, 4.4, 0, Math.PI * 2);
                ctx.stroke();

                i;
            });

            // inversion layer
            if (k === "inv") {

                const th = clamp((state.vg - VTH) * 10 + 4, 4, 14);

                ctx.fillStyle = TEAL + ".85)";
                ctx.fillRect(x0, top, x1 - x0, th);

                for (let i = 0; i < 22; i++) { dot(ctx, x0 + 12 + i * 20 + Math.sin(t * 2 + i) * 4, top + th / 2, 3, "rgba(255,255,255,.95)"); }

                txt(ctx, "inversion layer = the channel", 340, top + th + 22, 14, TEAL + "1)", "center", true);
            }

            txt(ctx, "p-type silicon", 130, bot - 12, 13, TEXT + ".85)", "start");
            txt(ctx, "○ holes", 560, bot - 12, 13, TEXT + ".85)", "end");
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


    SIMS["fet-fermi"] = function (root) {

        const defaults = { na: 16, phi: 0.2 };
        const state = { na: 16, phi: 0.2 };
        const NI = 1e10;
        const seen = {};

        root.innerHTML =
            head("Try it: how much band bending is enough?") +
            art("0 0 340 200", "An energy-band picture of p-type silicon under a gate. The bands bend downward toward the surface. When the surface bands have bent by twice the Fermi potential, the surface is strongly inverted.") +
            '<div class="fd-stat-row">' + stat("Fermi potential φF", "pf") + stat("Needed for strong inversion (2φF)", "p2") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Body doping (log of atoms per cm³)", key: "na", min: 14, max: 18, step: 0.25, value: 16 }) +
            slider({ label: "Band bending at the surface φs", key: "phi", min: 0, max: 1.4, step: 0.02, value: 0.2 }) +
            "</div>" +
            '<p class="fd-sim-formula">φF = (kT/q) ln(N<sub>A</sub>/nᵢ). For N<sub>A</sub> = 10¹⁶ cm⁻³, φF ≈ 0.36 V, so 2φF ≈ 0.71 V: the channel\'s electron density at the surface then matches the body\'s hole density.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const pf = KT * Math.log(Math.pow(10, state.na) / NI);
            const ph = state.phi;
            const stage = ph < pf ? "weak" : ph < 2 * pf ? "moderate" : "strong";

            seen[stage] = true;
            setVal(root, "na", "10" + sup(state.na % 1 ? state.na.toFixed(2) : state.na));
            setVal(root, "phi", ph.toFixed(2) + " V");
            out(root, "pf", pf.toFixed(2) + " V");
            out(root, "p2", (2 * pf).toFixed(2) + " V");
            out(root, "verdict", stage === "weak" ? "Weak: the surface is still p-type" : stage === "moderate" ? "Moderate: the surface is n-type, but not yet strongly inverted" : "Strong inversion: the surface has as many electrons as the body has holes");

            // bands: Ec, Ei, Ev, EF
            const x0 = 30;
            const x1 = 310;
            const sc = 70; // pixels per volt
            const yEi = 100;
            const Y = function (e, x) {

                // bend near the surface (x0) down by phi, decaying away
                const u = (x - x0) / (x1 - x0);
                const bend = ph * Math.pow(1 - u, 2);

                return yEi - e * sc + bend * sc;
            };
            const yEF = yEi + pf * sc;

            let s = rect(x0 - 10, 20, 10, 160, "rgba(255,214,102,.75)") + label(x0 - 5, 16, "gate", 7, "middle", "var(--text)");

            [[0.56, "Ec", "#7eb6ff"], [0, "Ei", "#aab3cf"], [-0.56, "Ev", "#ff6978"]].forEach(function (b) {

                let pts = "";

                for (let x = x0; x <= x1; x += 8) { pts += x + "," + Y(b[0], x).toFixed(1) + " "; }

                s += '<polyline points="' + pts + '" style="fill:none;stroke:' + b[2] + ';stroke-width:1.6"/>';
                s += label(x1 + 4, Y(b[0], x1) + 3, b[1], 7, "start", b[2]);
            });

            s += '<line x1="' + x0 + '" y1="' + yEF + '" x2="' + x1 + '" y2="' + yEF + '" style="stroke:#ffd666;stroke-width:1.3;stroke-dasharray:4 3"/>';
            s += label(x1 + 4, yEF + 3, "EF", 7, "start", "#ffd666");

            const surfEi = Y(0, x0 + 1);

            s += label(170, 194, "surface Ei is " + (surfEi < yEF ? "below" : "above") + " EF: " + (surfEi < yEF ? "n-type surface" : "still p-type"), 7.5, "middle", "var(--text)");

            svg.innerHTML = s;

            if (seen.weak && seen.moderate && seen.strong) {
                F.reward("fet-fermi", 10, "You bent the bands all the way to strong inversion");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-mosstates"] = quiz(
        "Game: which state is it?",
        ["Accumulation", "Depletion", "Inversion"],
        [
            { q: "A negative gate on a p-type body: holes gather at the surface.", a: "Accumulation", why: "The surface looks even more p-type." },
            { q: "A small positive gate: holes are repelled, uncovering fixed negative ions.", a: "Depletion", why: "No mobile carriers near the surface." },
            { q: "A larger positive gate: electrons gather at the surface.", a: "Inversion", why: "An n-type layer in p-type silicon." },
            { q: "Which state is the channel?", a: "Inversion", why: "Inversion is the channel." },
            { q: "VG > Vth.", a: "Inversion", why: "Above threshold, the surface inverts." },
            { q: "VG < 0 for an NMOS.", a: "Accumulation", why: "Holes are attracted by the negative gate." }
        ],
        5,
        "fet-mosstates-done",
        "You know the three surface states",
        "Accumulation, depletion, inversion: the channel appears in the last one.",
        "Negative: accumulation. Small positive: depletion. Above threshold: inversion. Hit Reset to try again."
    );


    /* ======================================
       UNIT 5: THRESHOLD VOLTAGE
    ====================================== */

    function vthParts(s) {

        const na = Math.pow(10, s.na) * 1e6; // per m³
        const ni = 1e16; // per m³
        const pf = KT * Math.log(na / ni);
        const cox = 3.9 * EPS0 / (s.t * 1e-9);
        const epsSi = 11.7 * EPS0;
        const qd = Math.sqrt(2 * Q * epsSi * na * 2 * pf);
        const vfb = s.gate === "n" ? -0.92 : s.gate === "m" ? -0.36 : 0.2;
        const dq = s.q * 1e12 * 1e4 * Q / cox; // positive oxide charge lowers Vth

        return { pf: pf, cox: cox, qd: qd, vfb: vfb, dq: dq, term: qd / cox, vth: vfb + 2 * pf + qd / cox - dq };
    }

    SIMS["fet-vth"] = function (root) {

        const defaults = { gate: "m", na: 16, t: 10, q: 0 };
        const state = { gate: "m", na: 16, t: 10, q: 0 };
        const seen = {};

        root.innerHTML =
            head("Try it: build the threshold voltage") +
            art("0 0 340 200", "Three stacked bars showing the three terms that add up to the threshold voltage: the flat-band voltage, twice the Fermi potential, and the depletion charge term, with a fourth bar for oxide charge.") +
            '<div class="fd-stat-row">' + stat("Threshold voltage", "vth") + stat("Max depletion depth", "wd") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Gate material", "gate", [["n", "n⁺ polysilicon"], ["m", "midgap metal"], ["p", "p⁺ polysilicon"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Body doping (log atoms per cm³)", key: "na", min: 15, max: 18, step: 0.25, value: 16 }) +
            slider({ label: "Oxide thickness", key: "t", min: 2, max: 40, step: 1, value: 10 }) +
            slider({ label: "Positive oxide charge (×10¹² charges per cm²)", key: "q", min: -2, max: 2, step: 0.1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">V<sub>th</sub> = V<sub>FB</sub> + 2φ<sub>F</sub> + Q<sub>d</sub>/C<sub>ox</sub>, and oxide charge shifts it by −Q/C<sub>ox</sub>. Every knob acts on one of these terms. (Flat-band values are textbook estimates.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const p = vthParts(state);
            const wd = Math.sqrt(2 * 11.7 * EPS0 * 2 * p.pf / (Q * Math.pow(10, state.na) * 1e6));

            seen[state.gate] = true;
            setVal(root, "na", "10" + sup(state.na % 1 ? state.na.toFixed(2) : state.na));
            setVal(root, "t", state.t + " nm");
            setVal(root, "q", (state.q >= 0 ? "+" : "") + state.q.toFixed(1));
            out(root, "vth", p.vth.toFixed(2) + " V");
            out(root, "wd", (wd * 1e6).toFixed(2) + " µm");
            out(root, "verdict", p.vth > 0.25 && p.vth < 1.2 ? "A useful enhancement-mode threshold" : p.vth <= 0 ? "Negative: a channel already exists at zero gate voltage (depletion mode)" : "A high threshold: heavier doping or a thick oxide");

            const sc = 55;
            const zero = 120;
            const items = [["VFB", p.vfb, "rgba(255,214,102,.85)"], ["2φF", 2 * p.pf, "rgba(84,224,199,.85)"], ["Qd/Cox", p.term, "rgba(120,180,255,.85)"], ["−Q/Cox", -p.dq, "rgba(255,105,120,.85)"]];
            let s = '<line x1="30" y1="' + zero + '" x2="320" y2="' + zero + '" style="stroke:rgba(170,179,207,.5);stroke-width:1"/>' + label(26, zero + 3, "0 V", 7, "end", "var(--muted)");

            items.forEach(function (it, i) {

                const x = 50 + i * 65;
                const h = it[1] * sc;

                s += rect(x, h >= 0 ? zero - h : zero, 44, Math.abs(h), it[2]);
                s += label(x + 22, 192, it[0], 7.5, "middle", "var(--text)");
                s += label(x + 22, (h >= 0 ? zero - h - 4 : zero - h + 10), (it[1] >= 0 ? "+" : "") + it[1].toFixed(2), 7.5, "middle", "var(--text)");
            });

            s += label(170, 14, "Vth = " + p.vth.toFixed(2) + " V", 10, "middle", "var(--accent)");

            svg.innerHTML = s;

            if (seen.n && seen.m && seen.p) {
                F.reward("fet-vth", 10, "You tried every gate material");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-charge"] = function (root) {

        const defaults = { q: 0, t: 10 };
        const state = { q: 0, t: 10 };
        const VTH = 0.7;
        let hit = false;

        root.innerHTML =
            head("Try it: the transistor as a charge detector") +
            canvasFor(680, 320, "Two drain-current versus gate-voltage curves: the original and the one shifted by charge at the oxide-silicon interface. Positive charge shifts the curve to the left, negative charge to the right.") +
            '<div class="fd-stat-row">' + stat("Threshold shift ΔVth", "dv") + stat("New threshold", "vt") + stat("Oxide capacitance", "c") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Charge at the interface (×10¹² elementary charges per cm², positive or negative)", key: "q", min: -2, max: 2, step: 0.1, value: 0 }) +
            slider({ label: "Oxide thickness", key: "t", min: 2, max: 40, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">ΔVth = −Q / C<sub>ox</sub>. Example: 10¹² charges per cm² on a 0.345 µF/cm² oxide moves Vth by about 0.46 V. Sensing with a FET means measuring how far a surface charge moves the threshold.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function dv() {

            const cox = 3.9 * EPS0 / (state.t * 1e-9);

            return -(state.q * 1e12 * 1e4 * Q) / cox;
        }

        function update() {

            const d = dv();
            const cox = 3.9 * EPS0 / (state.t * 1e-9);

            setVal(root, "q", (state.q >= 0 ? "+" : "") + state.q.toFixed(1));
            setVal(root, "t", state.t + " nm");
            out(root, "dv", (d >= 0 ? "+" : "") + (d * 1000).toFixed(0) + " mV");
            out(root, "vt", (VTH + d).toFixed(2) + " V");
            out(root, "c", (cox * 100).toFixed(3) + " µF/cm²");
            out(root, "verdict", Math.abs(state.q) < 0.05 ? "No charge, no shift" : state.q > 0 ? "Positive charge: the gate needs less voltage, so the curve moves left" : "Negative charge: the gate needs more voltage, so the curve moves right");

            if (!hit && Math.abs(d) > 0.4) {

                hit = true;
                F.reward("fet-charge", 10, "You shifted a threshold by charge");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (v) { return L + (v + 0.5) / 3.5 * (R - L); };
            const Y = function (i) { return B - i / 2.6 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 1, 2, 3].forEach(function (v) { txt(ctx, v + " V", X(v), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "gate voltage →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "drain current →", 100, T + 4, 12, TEXT + ".75)", "start");

            function curve(vth, col, w, dash) {

                ctx.strokeStyle = col;
                ctx.lineWidth = w;
                ctx.setLineDash(dash || []);
                ctx.beginPath();

                let first = true;

                for (let v = -0.5; v <= 3; v += 0.02) {

                    const y = Y(idrain(v, 3, vth, 1));

                    if (first) { ctx.moveTo(X(v), y); first = false; } else { ctx.lineTo(X(v), y); }
                }

                ctx.stroke();
                ctx.setLineDash([]);
            }

            curve(VTH, GREY + ".7)", 2, [6, 5]);

            const d = dv();

            curve(VTH + d, TEAL + ".98)", 3);

            // arrow showing the shift
            if (Math.abs(d) > 0.02) {

                const y = Y(0.3);

                ctx.strokeStyle = GOLD + ".95)";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(X(VTH + 0.6), y); ctx.lineTo(X(VTH + 0.6 + d), y);
                ctx.stroke();
                txt(ctx, "ΔVth = " + (d * 1000).toFixed(0) + " mV", Math.min(R - 60, Math.max(L + 60, X(VTH + 0.6 + d / 2))), y - 10, 13, GOLD + "1)", "center", true);
            }

            txt(ctx, "dashed: before   solid: after", 500, T + 14, 12, TEXT + ".7)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-modes"] = quiz(
        "Game: enhancement or depletion?",
        ["Enhancement mode", "Depletion mode"],
        [
            { q: "Normally off: an NMOS has Vth > 0 and needs gate voltage to form a channel.", a: "Enhancement mode", why: "No gate voltage, no channel." },
            { q: "Normally on: a channel exists at VGS = 0 and a gate voltage pinches it off.", a: "Depletion mode", why: "The gate removes the channel." },
            { q: "Used by logic circuits.", a: "Enhancement mode", why: "Normally-off switches save power." },
            { q: "Used by some sensors, like doped nanowires.", a: "Depletion mode", why: "They conduct without a gate voltage." },
            { q: "Both respond to charge in the same way. What happens to the threshold?", a: "Enhancement mode", why: "It shifts: both kinds slide their curves sideways." }
        ],
        4,
        "fet-modes-done",
        "You know the two modes",
        "Both respond to charge the same way: the threshold shifts.",
        "Enhancement: normally off. Depletion: normally on. Hit Reset to try again."
    );


    // Parts 2 and 3 of the BioFET and MOSFET simulators.
    [
        ["fabFetScriptB", "diagram-sims-fet-b.js"],
        ["fabFetScriptC", "diagram-sims-fet-c.js"],
        ["fabFetScriptD", "diagram-sims-fet-d.js"],
        ["fabFetScriptE", "diagram-sims-fet-e.js"]
    ].forEach(function (f) {

        if (document.getElementById(f[0])) {
            return;
        }

        const more = document.createElement("script");

        more.id = f[0];
        more.src = f[1];

        document.head.appendChild(more);
    });

    document.querySelectorAll('.fd-sim[data-sim^="fet-"]').forEach(F.mount);

})();
