/* ========================================
   BIOFETS & MOSFETS: INTERACTIVE SIMULATORS, PART 4

   Unit 18: binding affinity and kinetics.
   Unit 19: verifying the layer.
   Unit 20: Debye screening and charge detection.
   Unit 21: protein detection.
   Unit 22: DNA hybridization sensing.
   Unit 23: limit of detection and noise.
   Unit 24: nanowires, graphene, arrays, DNA sequencing.
   Unit 25: real samples and reliability.

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
    const canvasFor = H.canvasFor;
    const clear = H.clear;
    const txt = H.txt;
    const dot = H.dot;
    const sup = H.sup;

    function debye(mM) { return 0.304 / Math.sqrt(mM / 1000); }

    function fmtConc(nM) {

        if (nM >= 1000) { return (nM / 1000).toFixed(1) + " µM"; }
        if (nM >= 1) { return nM.toFixed(nM >= 10 ? 0 : 1) + " nM"; }
        if (nM >= 0.001) { return (nM * 1000).toFixed(nM >= 0.01 ? 0 : 1) + " pM"; }

        return (nM * 1e6).toFixed(0) + " fM";
    }


    /* ======================================
       UNIT 18: BINDING AFFINITY AND KINETICS
    ====================================== */

    SIMS["fet-kdquiz"] = quiz(
        "Game: strong or weak binding?",
        ["Tighter binding", "Weaker binding"],
        [
            { q: "A smaller KD.", a: "Tighter binding", why: "Less target is needed to half-fill the receptors." },
            { q: "A larger KD.", a: "Weaker binding", why: "It takes more target to half-fill the receptors." },
            { q: "A faster off rate, with the same on rate.", a: "Weaker binding", why: "KD = koff ÷ kon, so it grows." },
            { q: "A faster on rate, with the same off rate.", a: "Tighter binding", why: "KD shrinks." },
            { q: "Antibody–antigen pairs with a KD in the nanomolar range.", a: "Tighter binding", why: "Small KD, strong binding." }
        ],
        4,
        "fet-kdquiz-done",
        "You know what KD means",
        "Small KD, strong binding.",
        "KD = koff ÷ kon: the concentration at which half the receptors hold a target. Hit Reset to try again."
    );


    SIMS["fet-langmuir"] = function (root) {

        const defaults = { lc: 0.7, lk: 0, dmax: 60 };
        const state = { lc: 0.7, lk: 0, dmax: 60 };
        const seen = {};

        root.innerHTML =
            head("Try it: fraction bound versus concentration") +
            canvasFor(680, 330, "A binding curve of the fraction of receptors occupied against target concentration on a log axis. The curve is an S shape: steep near the dissociation constant and flat at very high concentration. A dot shows the chosen concentration and the threshold shift it produces.") +
            '<div class="fd-stat-row">' + stat("Concentration", "c") + stat("Fraction bound θ", "t") + stat("Threshold shift", "dv") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Target concentration (log, in nM)", key: "lc", min: -3, max: 3, step: 0.05, value: 0.7 }) +
            slider({ label: "Dissociation constant KD (log, in nM)", key: "lk", min: -2, max: 2, step: 0.1, value: 0 }) +
            slider({ label: "Shift with every receptor occupied (ΔVmax)", key: "dmax", min: 20, max: 100, step: 5, value: 60 }) +
            "</div>" +
            '<p class="fd-sim-formula">θ = c ÷ (c + K<sub>D</sub>). At c = K<sub>D</sub>, half are bound. At 10 K<sub>D</sub>, about 91 %. At K<sub>D</sub>/10, about 9 %. Worked example: c = 5 nM, K<sub>D</sub> = 1 nM gives θ ≈ 0.83, so a 60 mV full-layer shift becomes about 50 mV. The sensor works best near its K<sub>D</sub>.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function vals() {

            const c = Math.pow(10, state.lc);
            const kd = Math.pow(10, state.lk);

            return { c: c, kd: kd, th: c / (c + kd) };
        }

        function update() {

            const v = vals();
            const r = v.c / v.kd;

            setVal(root, "lc", fmtConc(v.c));
            setVal(root, "lk", fmtConc(v.kd));
            setVal(root, "dmax", state.dmax + " mV");
            out(root, "c", fmtConc(v.c));
            out(root, "t", Math.round(v.th * 100) + " %");
            out(root, "dv", (v.th * state.dmax).toFixed(0) + " mV");
            out(root, "verdict", r < 0.1 ? "Far below KD: too little signal" : r > 10 ? "Far above KD: the receptors are nearly full" : "In the useful range: about 0.1 to 10 times KD");

            seen[r < 0.1 ? "lo" : r > 10 ? "hi" : "mid"] = true;

            if (seen.lo && seen.mid && seen.hi) {
                F.reward("fet-langmuir", 10, "You mapped the whole binding curve");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 275;
            const X = function (lc) { return L + (lc + 3) / 6 * (R - L); };
            const Y = function (th) { return B - th * (B - T); };
            const kd = Math.pow(10, state.lk);

            // useful range shading
            ctx.fillStyle = TEAL + ".1)";
            ctx.fillRect(X(state.lk - 1), T, X(state.lk + 1) - X(state.lk - 1), B - T);
            txt(ctx, "useful: 0.1 to 10 × KD", (X(state.lk - 1) + X(state.lk + 1)) / 2, T + 16, 12, TEAL + "1)");

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 0.5, 1].forEach(function (v) { txt(ctx, Math.round(v * 100) + " %", L - 28, Y(v) + 4, 12, TEXT + ".7)"); });
            [-3, -2, -1, 0, 1, 2, 3].forEach(function (e) { txt(ctx, "10" + sup(e), X(e), B + 18, 11, TEXT + ".65)"); });
            txt(ctx, "concentration (nM, log) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let lc = -3; lc <= 3.001; lc += 0.05) {

                const c = Math.pow(10, lc);
                const y = Y(c / (c + kd));

                if (lc === -3) { ctx.moveTo(X(lc), y); } else { ctx.lineTo(X(lc), y); }
            }

            ctx.stroke();

            const v = vals();

            ctx.strokeStyle = GOLD + ".6)";
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(X(state.lc), B); ctx.lineTo(X(state.lc), Y(v.th)); ctx.lineTo(L, Y(v.th));
            ctx.stroke();
            ctx.setLineDash([]);
            dot(ctx, X(state.lc), Y(v.th), 8, "rgba(255,255,255,1)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-usefulrange"] = quiz(
        "Game: is the concentration in the useful range?",
        ["Too little signal", "Useful range", "Receptors nearly full"],
        [
            { q: "c = KD ÷ 100.", a: "Too little signal", why: "Only about 1 % of the receptors are bound." },
            { q: "c = KD.", a: "Useful range", why: "Half the receptors are bound." },
            { q: "c = 100 × KD.", a: "Receptors nearly full", why: "About 99 % are bound: the signal barely changes with concentration." },
            { q: "c = 5 × KD.", a: "Useful range", why: "Between 0.1 and 10 times KD." },
            { q: "c = KD ÷ 20.", a: "Too little signal", why: "Below 0.1 × KD." }
        ],
        4,
        "fet-usefulrange-done",
        "You know where a sensor works best",
        "The sensor works best near its KD.",
        "Between 0.1 and 10 times KD. Hit Reset to try again."
    );


    SIMS["fet-kinetics"] = function (root) {

        const defaults = { lc: 0, lon: 6, loff: -3 };
        const state = { lc: 0, lon: 6, loff: -3 };
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: how fast does the signal settle?") +
            canvasFor(680, 320, "A curve showing the fraction of receptors bound rising with time after the sample is added, approaching equilibrium exponentially. A moving dot traces it.") +
            '<div class="fd-stat-row">' + stat("Time constant τ", "tau") + stat("Time to 95 % of final", "t95") + stat("KD = koff ÷ kon", "kd") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Target concentration (log, in nM)", key: "lc", min: -2, max: 3, step: 0.1, value: 0 }) +
            slider({ label: "On rate kon (log, in M⁻¹s⁻¹)", key: "lon", min: 4, max: 7, step: 0.1, value: 6 }) +
            slider({ label: "Off rate koff (log, in s⁻¹)", key: "loff", min: -5, max: -1, step: 0.1, value: -3 }) +
            "</div>" +
            '<p class="fd-sim-formula">τ = 1 ÷ (k<sub>on</sub>·c + k<sub>off</sub>). At low concentration τ is roughly 1 ÷ k<sub>off</sub>, which can be minutes or hours for tight binders. Measuring very small concentrations takes patience.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function calc() {

            const c = Math.pow(10, state.lc) * 1e-9;
            const kon = Math.pow(10, state.lon);
            const koff = Math.pow(10, state.loff);
            const tau = 1 / (kon * c + koff);

            return { c: c, kon: kon, koff: koff, tau: tau, kd: koff / kon, theq: kon * c / (kon * c + koff) };
        }

        function fmtT(s) { return s < 90 ? s.toFixed(0) + " s" : s < 5400 ? (s / 60).toFixed(0) + " min" : (s / 3600).toFixed(1) + " h"; }

        function update() {

            const k = calc();

            setVal(root, "lc", fmtConc(Math.pow(10, state.lc)));
            setVal(root, "lon", "10" + sup(state.lon.toFixed(1)));
            setVal(root, "loff", "10" + sup(state.loff.toFixed(1)));
            out(root, "tau", fmtT(k.tau));
            out(root, "t95", fmtT(3 * k.tau));
            out(root, "kd", fmtConc(k.kd * 1e9));
            out(root, "verdict", k.tau > 1800 ? "A very slow settle: low concentration means a slow response" : k.tau < 30 ? "Quick: the signal settles in seconds" : "Settles in minutes");
            t = 0;

            if (!hit && k.tau > 1800) {

                hit = true;
                F.reward("fet-kinetics", 10, "You found out why low concentrations take patience");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const k = calc();
            const L = 80;
            const R = 650;
            const T = 20;
            const B = 265;
            const tmax = 5 * k.tau;
            const X = function (s) { return L + s / tmax * (R - L); };
            const Y = function (th) { return B - th * (B - T) / Math.max(k.theq, 0.05) * Math.min(k.theq, 1) * 1.0; };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 1, 2, 3, 4, 5].forEach(function (n) { txt(ctx, fmtT(n * k.tau), X(n * k.tau), B + 18, 11, TEXT + ".65)"); });
            txt(ctx, "time after adding the sample →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "fraction bound ↑", L + 70, T + 4, 12, TEXT + ".75)");

            const top = function (frac) { return B - frac * (B - T); };

            // equilibrium level
            ctx.strokeStyle = GOLD + ".6)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(L, top(k.theq)); ctx.lineTo(R, top(k.theq));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "equilibrium: " + Math.round(k.theq * 100) + " %", R - 90, top(k.theq) - 8, 12, GOLD + "1)");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let s = 0; s <= tmax; s += tmax / 120) {

                const th = k.theq * (1 - Math.exp(-s / k.tau));

                if (s === 0) { ctx.moveTo(X(s), top(th)); } else { ctx.lineTo(X(s), top(th)); }
            }

            ctx.stroke();

            const s = (t % 1) * tmax;

            dot(ctx, X(s), top(k.theq * (1 - Math.exp(-s / k.tau))), 7, "rgba(255,255,255,1)");

            Y;
        }

        animate(root, function (dt) {

            t += dt * 0.2;
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
       UNIT 19: VERIFYING THE LAYER
    ====================================== */

    SIMS["fet-surftech"] = quiz(
        "Game: which characterization tool?",
        ["Contact angle", "Ellipsometry", "AFM", "XPS", "Fluorescence"],
        [
            { q: "How water-loving the surface is: under about 10° for a clean oxide, 50–70° for APTES.", a: "Contact angle", why: "A drop of water tells you a lot." },
            { q: "Layer thickness to a fraction of a nanometer.", a: "Ellipsometry", why: "Light reflection measures thin films." },
            { q: "Roughness and clumps on the nanometer scale.", a: "AFM", why: "A tiny probe feels the surface." },
            { q: "Which elements are present, such as nitrogen from APTES.", a: "XPS", why: "X-ray photoelectron spectroscopy." },
            { q: "A label on the receptor lights up wherever molecules are attached.", a: "Fluorescence", why: "It shows coverage and uniformity." },
            { q: "Used to check the chemistry, not in the final sensor.", a: "Fluorescence", why: "The label can change how the molecule binds." }
        ],
        5,
        "fet-surftech-done",
        "You know the surface tools",
        "Each technique answers a different question.",
        "Angle, thickness, roughness, elements, glow. Hit Reset to try again."
    );


    SIMS["fet-stepvth"] = function (root) {

        const defaults = { fail: "no" };
        const state = { fail: "no" };
        const stages = [
            { n: "Bare oxide", dv: 0 },
            { n: "APTES amine layer", dv: -90 },
            { n: "Receptor (DNA probe)", dv: 70 },
            { n: "Blocked", dv: 12 }
        ];
        const seen = {};
        let step = 0;
        let anim = 1;

        root.innerHTML =
            head("Try it: log the threshold at every step") +
            canvasFor(680, 320, "A staircase of threshold voltage after each surface preparation step. Each layer changes the surface charge, so each step moves the threshold. A step that leaves the threshold unchanged is a red flag.") +
            '<div class="fd-stat-row">' + stat("Stage", "st") + stat("Threshold vs. bare", "v") + stat("Change at this step", "d") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-next>Next step →</button></div>' +
            seg("Does the receptor step work?", "fail", [["no", "Yes, it works"], ["yes", "No: it silently failed"]]) +
            '<p class="fd-sim-formula">Measuring the transfer curve after each step shows a threshold shift at every stage, because each layer changes the surface charge. A step that leaves V<sub>th</sub> unchanged is a red flag. The same device is both the product and the test instrument. (Shift sizes illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function dvOf(i) { return i === 2 && state.fail === "yes" ? 0 : stages[i].dv; }

        function cum(i) {

            let s = 0;

            for (let k = 0; k <= i; k++) { s += dvOf(k); }

            return s;
        }

        function update() {

            const d = step === 0 ? 0 : dvOf(step);
            const flag = step > 0 && Math.abs(d) < 5 && step === 2;

            out(root, "st", stages[step].n);
            out(root, "v", (cum(step) >= 0 ? "+" : "") + cum(step) + " mV");
            out(root, "d", step === 0 ? "—" : (d >= 0 ? "+" : "") + d + " mV");
            out(root, "verdict", flag ? "🚩 No shift: the receptor step did not happen" : step === 0 ? "Start: log the bare threshold" : step === 1 ? "The amine is protonated (–NH₃⁺): positive charge lowers the threshold" : step === 2 ? "Negative DNA probes raise the threshold" : "Blocking changes the surface a little more: now ready to measure");

            if (step === 3) { seen[state.fail] = true; }

            if (seen.no && seen.yes) {
                F.reward("fet-stepvth", 10, "You used the transistor to test its own chemistry");
            }

            anim = 0;
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 30;
            const B = 270;
            const sc = 0.9;
            const zero = 160;
            const bw = 100;

            ctx.strokeStyle = GREY + ".4)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(L, zero); ctx.lineTo(R, zero);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "bare threshold", L + 40, zero - 6, 11, TEXT + ".6)");

            for (let i = 0; i <= step; i++) {

                const x = L + 20 + i * 138;
                const y = zero - cum(i) * sc;
                const prevY = i === 0 ? zero : zero - cum(i - 1) * sc;
                const f = i === step ? anim : 1;
                const yy = prevY + (y - prevY) * f;
                const bad = i === 2 && state.fail === "yes";

                ctx.fillStyle = (bad ? ROSE : i === 0 ? GREY : TEAL) + ".75)";
                ctx.fillRect(x, Math.min(yy, zero) , bw, Math.abs(zero - yy) + 4);

                ctx.strokeStyle = TEXT + ".5)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, yy); ctx.lineTo(x + bw, yy);
                ctx.stroke();

                txt(ctx, stages[i].n, x + bw / 2, B + 14, 11, TEXT + ".8)");

                if (i > 0) { txt(ctx, (dvOf(i) >= 0 ? "+" : "") + dvOf(i) + " mV", x + bw / 2, yy - 8, 12, bad ? ROSE + "1)" : GOLD + "1)", "center", true); }
            }

            if (step >= 2 && state.fail === "yes") { txt(ctx, "🚩 no shift: red flag", L + 20 + 2 * 138 + 50, 60, 14, ROSE + "1)", "center", true); }
        }

        animate(root, function (dt) {

            anim = Math.min(1, anim + dt * 2.5);
            draw();
        });

        root.querySelector("[data-next]").addEventListener("click", function () {

            step = (step + 1) % stages.length;
            update();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () { step = 0; update(); });

        update();
        draw();
    };


    SIMS["fet-passfail"] = quiz(
        "Game: ready to measure?",
        ["Pass", "Fail"],
        [
            { q: "Contact angle after cleaning is about 5°.", a: "Pass", why: "A clean oxide is under about 10°." },
            { q: "Contact angle after silanizing is still under 10°.", a: "Fail", why: "An APTES layer should be roughly 50–70°." },
            { q: "The silane layer measures about 1 nm thick.", a: "Pass", why: "Right for a monolayer." },
            { q: "The threshold did not move after attaching the receptors.", a: "Fail", why: "A step that leaves Vth unchanged is a red flag." },
            { q: "A blank sample gives almost no shift.", a: "Pass", why: "The surface is blocked." },
            { q: "A blank sample gives a big shift.", a: "Fail", why: "Non-specific binding is not under control." }
        ],
        5,
        "fet-passfail-done",
        "You can run the checklist",
        "Only a surface that passes every check moves on to sensing.",
        "Clean, silane, receptor, blocked. Hit Reset to try again."
    );


    /* ======================================
       UNIT 20: DEBYE SCREENING
    ====================================== */

    SIMS["fet-screen"] = function (root) {

        const defaults = { c: 150, d: 5 };
        const state = { c: 150, d: 5 };
        const rand = mulberry(52);
        const ions = [];
        const seen = {};

        for (let i = 0; i < 60; i++) { ions.push({ x: rand(), y: rand(), ph: rand() * 6 }); }

        root.innerHTML =
            head("Try it: ions hide the charge you want to see") +
            canvasFor(680, 340, "A sensing surface with a bound molecule carrying charge at a chosen height. Mobile ions in the solution cluster around the charge and screen it. The higher the charge sits relative to the Debye length, the weaker the signal.") +
            '<div class="fd-stat-row">' + stat("Debye length λD", "ld") + stat("Charge height d", "d") + stat("Signal that survives (e^(−d/λD))", "sig") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Salt concentration", key: "c", min: 1, max: 150, step: 1, value: 150 }) +
            slider({ label: "Height of the bound charge above the surface", key: "d", min: 0, max: 15, step: 0.5, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">In 150 mM saline λD ≈ 0.8 nm, so a charge 5 nm up keeps only about 0.2 % of its effect. In 10 mM, λD ≈ 3 nm and the same charge keeps about 19 %. Diluting 150 mM to 1 mM stretches λD to about 10 nm, and a charge at 8 nm keeps about 43 %.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function update() {

            const ld = debye(state.c);
            const sig = Math.exp(-state.d / ld);

            seen[state.c <= 5 ? "dil" : state.c >= 100 ? "salt" : "mid"] = true;
            setVal(root, "c", state.c + " mM");
            setVal(root, "d", state.d.toFixed(1) + " nm");
            out(root, "ld", ld.toFixed(1) + " nm");
            out(root, "d", state.d.toFixed(1) + " nm");
            out(root, "sig", sig >= 0.1 ? Math.round(sig * 100) + " %" : sig >= 0.001 ? (sig * 100).toFixed(1) + " %" : "<0.1 %");
            out(root, "verdict", sig > 0.4 ? "The gate feels most of the charge" : sig > 0.05 ? "Partly screened" : "Almost invisible: the ions have hidden it");

            if (seen.dil && seen.salt) {
                F.reward("fet-screen", 10, "You saw dilution revive the signal");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const base = 300;
            const sc = 20; // px per nm
            const x0 = 340;

            ctx.fillStyle = GREY + ".55)";
            ctx.fillRect(60, base, 560, 30);
            txt(ctx, "sensing surface", 160, base + 20, 13, "rgba(6,10,24,.95)", "center", true);

            // receptor stalk and bound charge
            const cy = base - state.d * sc - 6;

            ctx.strokeStyle = TEAL + ".9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x0, base); ctx.lineTo(x0, cy + 10);
            ctx.stroke();
            dot(ctx, x0, cy, 12, BLUE + ".95)");
            txt(ctx, "−", x0, cy + 6, 18, "rgba(6,10,24,.95)", "center", true);

            // Debye length marker
            const ld = debye(state.c);

            ctx.strokeStyle = GOLD + ".9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x0 + 50, base); ctx.lineTo(x0 + 50, base - ld * sc);
            ctx.stroke();
            txt(ctx, "λD = " + ld.toFixed(1) + " nm", x0 + 60, base - ld * sc / 2, 13, GOLD + "1)", "start", true);

            // screening cloud of positive ions around the charge, tighter at high salt
            ions.forEach(function (ion) {

                const ang = ion.ph;
                const rad = (10 + ion.x * 6 * Math.max(0.6, Math.min(ld, 8) * 3)) ;
                const x = x0 + Math.cos(ang + t * 0.4) * rad;
                const y = cy + Math.sin(ang + t * 0.4) * rad * 0.8;

                if (y < base - 4) { dot(ctx, x, y, 3.8, ROSE + ".85)"); }
            });

            // strength bar
            const sig = Math.exp(-state.d / ld);

            ctx.fillStyle = GREY + ".2)";
            ctx.fillRect(560, 40, 24, 140);
            ctx.fillStyle = TEAL + ".95)";
            ctx.fillRect(560, 180 - 140 * sig, 24, 140 * sig);
            txt(ctx, "signal", 572, 30, 12, TEXT + ".8)");
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


    SIMS["fet-sizes"] = function (root) {

        const defaults = { c: "150" };
        const state = { c: "150" };
        const recs = [
            { n: "Antibody", h: 10 },
            { n: "Fab fragment", h: 5 },
            { n: "Nanobody", h: 3 },
            { n: "Aptamer or DNA probe", h: 3 }
        ];
        const seen = {};

        root.innerHTML =
            head("Try it: is the receptor taller than the reach?") +
            art("0 0 340 220", "Bars for the height of an antibody, a Fab fragment, a nanobody and an aptamer, with a vertical line marking the Debye length for the chosen salt. Receptors shorter than the line keep their bound charge inside the sensing range.") +
            '<div class="fd-stat-row">' + stat("Debye length", "ld") + stat("Receptors inside the reach", "in") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Sample salt", "c", [["150", "Saline (150 mM)"], ["10", "Diluted (10 mM)"], ["1", "Very dilute (1 mM)"]]) +
            '<p class="fd-sim-formula">Smaller receptors keep the target inside the Debye length: antibody about 10 nm, Fab about 5 nm, nanobody about 2–4 nm, aptamer or DNA probe a few nm. Heights are approximate.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const ld = debye(parseFloat(state.c));
            const inside = recs.filter(function (r) { return r.h <= 2 * ld; });

            seen[state.c] = true;
            out(root, "ld", ld.toFixed(1) + " nm");
            out(root, "in", inside.length ? inside.map(function (r) { return r.n; }).join(", ") : "none");
            out(root, "verdict", inside.length === 4 ? "Everything is inside the reach: the signal is strong for all four" : inside.length === 0 ? "Even the smallest receptors sit beyond the reach" : "Smaller receptors keep the target inside the Debye length");

            const X = function (nm) { return 100 + nm / 12 * 220; };
            let s = "";

            recs.forEach(function (r, i) {

                const y = 30 + i * 40;
                const keep = Math.exp(-r.h / ld);

                s += label(14, y + 14, r.n.split(" or ")[0], 7.5, "start", "var(--text)");
                s += rect(100, y, X(r.h) - 100, 20, "rgba(120,180,255,.7)");
                s += label(X(r.h) + 6, y + 14, r.h + " nm  (keeps " + (keep >= 0.01 ? Math.round(keep * 100) + " %" : "<1 %") + ")", 7, "start", "var(--muted)");
            });

            s += '<line x1="' + X(ld) + '" y1="20" x2="' + X(ld) + '" y2="196" style="stroke:#ffd666;stroke-width:2;stroke-dasharray:4 3"/>';
            s += label(X(ld), 212, "λD = " + ld.toFixed(1) + " nm", 7.5, "middle", "#ffd666");

            svg.innerHTML = s;

            if (Object.keys(seen).length >= 3) {
                F.reward("fet-sizes", 10, "You compared receptor sizes in three salt levels");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-workaround"] = quiz(
        "Game: beat the screening",
        ["Dilute the sample", "Use small receptors", "High-frequency readout", "Add a polymer layer"],
        [
            { q: "Lower the salt so λD grows, as long as the receptor still binds.", a: "Dilute the sample", why: "A longer reach, but the chemistry changes." },
            { q: "Fab fragments, nanobodies or aptamers keep the target close.", a: "Use small receptors", why: "The charge sits within the Debye length." },
            { q: "Measure fast, where ions cannot follow, so charge farther out is less screened.", a: "High-frequency readout", why: "Ions cannot keep up with fast changes." },
            { q: "A PEG brush can stretch the effective sensing distance.", a: "Add a polymer layer", why: "It changes the local environment of the surface." },
            { q: "Which fix changes the chemistry of the sample itself?", a: "Dilute the sample", why: "Binding may be weaker at low salt." }
        ],
        4,
        "fet-workaround-done",
        "You know the workarounds",
        "Each fix attacks the problem from a different side.",
        "Dilute, shrink, speed up, or add a polymer. Hit Reset to try again."
    );


    /* ======================================
       UNIT 21: PROTEIN DETECTION
    ====================================== */

    SIMS["fet-pi"] = function (root) {

        const defaults = { ph: 7.4, prot: "strep" };
        const state = { ph: 7.4, prot: "strep" };
        const prots = { alb: { n: "Albumin", pI: 4.7 }, strep: { n: "Streptavidin", pI: 5.5 }, lys: { n: "Lysozyme", pI: 11 } };
        const seen = {};

        root.innerHTML =
            head("Try it: a protein's charge depends on pH") +
            canvasFor(680, 320, "A titration curve of a protein's net charge against pH. The charge is positive below its isoelectric point and negative above it. A dot shows the chosen buffer pH.") +
            '<div class="fd-stat-row">' + stat("Net charge", "z") + stat("Effect when it binds (NMOS)", "eff") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Target protein", "prot", Object.keys(prots).map(function (k) { return [k, prots[k].n + " (pI " + prots[k].pI + ")"]; })) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Buffer pH", key: "ph", min: 2, max: 12, step: 0.1, value: 7.4 }) +
            "</div>" +
            '<p class="fd-sim-formula">Above the isoelectric point (pI) a protein carries net negative charge, below it net positive. A protein with pI 5 is negative in pH 7.4 buffer, which raises an NMOS threshold when it binds. The sign and size of the signal come from pI versus pH.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function z(ph) { return 14 * Math.tanh((prots[state.prot].pI - ph) / 1.6); }

        function update() {

            const charge = z(state.ph);
            const near = Math.abs(charge) < 2;

            seen[near ? "zero" : charge < 0 ? "neg" : "pos"] = true;
            setVal(root, "ph", state.ph.toFixed(1));
            out(root, "z", (charge >= 0 ? "+" : "") + charge.toFixed(1) + " e");
            out(root, "eff", near ? "almost no signal" : charge < 0 ? "threshold rises" : "threshold falls");
            out(root, "verdict", near ? "pH near the pI: almost no net charge, so almost no signal" : charge < 0 ? "pH above the pI: net negative, the NMOS threshold rises on binding" : "pH below the pI: net positive, the NMOS threshold falls on binding");

            if (seen.neg && seen.pos && seen.zero) {
                F.reward("fet-pi", 10, "You found the positive, negative and zero-signal pH");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (p) { return L + (p - 2) / 10 * (R - L); };
            const Y = function (v) { return (T + B) / 2 - v / 16 * ((B - T) / 2); };
            const pI = prots[state.prot].pI;

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            ctx.strokeStyle = GREY + ".3)";
            ctx.beginPath();
            ctx.moveTo(L, Y(0)); ctx.lineTo(R, Y(0));
            ctx.stroke();

            for (let p = 2; p <= 12; p += 2) { txt(ctx, "pH " + p, X(p), B + 18, 12, TEXT + ".7)"); }

            txt(ctx, "buffer pH →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "net charge ↑", L + 50, T + 4, 12, TEXT + ".75)");

            ctx.fillStyle = ROSE + ".08)";
            ctx.fillRect(L, T, X(pI) - L, (B - T) / 2);
            ctx.fillStyle = BLUE + ".08)";
            ctx.fillRect(X(pI), (T + B) / 2, R - X(pI), (B - T) / 2);

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let p = 2; p <= 12.001; p += 0.1) {

                const y = Y(14 * Math.tanh((pI - p) / 1.6));

                if (p === 2) { ctx.moveTo(X(p), y); } else { ctx.lineTo(X(p), y); }
            }

            ctx.stroke();

            ctx.strokeStyle = GOLD + ".8)";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(X(pI), T); ctx.lineTo(X(pI), B);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "pI = " + pI, X(pI) + 6, T + 14, 13, GOLD + "1)", "start", true);

            dot(ctx, X(state.ph), Y(z(state.ph)), 8, "rgba(255,255,255,1)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-pickph"] = quiz(
        "Game: which way does the threshold move?",
        ["NMOS threshold rises", "NMOS threshold falls", "Almost no signal"],
        [
            { q: "A target with pI 5 binds in pH 7.4 buffer.", a: "NMOS threshold rises", why: "pH above the pI: net negative charge." },
            { q: "A target with pI 9 binds in pH 7.4 buffer.", a: "NMOS threshold falls", why: "pH below the pI: net positive charge." },
            { q: "A target with pI 7.4 binds in pH 7.4 buffer.", a: "Almost no signal", why: "Almost no net charge." },
            { q: "Streptavidin (pI about 5 to 6) binds a biotin-coated gate in neutral buffer.", a: "NMOS threshold rises", why: "It adds negative charge." },
            { q: "Lysozyme (pI about 11) binds in neutral buffer.", a: "NMOS threshold falls", why: "It is positively charged there." }
        ],
        4,
        "fet-pickph-done",
        "You can predict the sign of the signal",
        "Both the sign and the size of the signal come from pI versus pH.",
        "Above the pI the protein is negative; below it, positive. Hit Reset to try again."
    );


    SIMS["fet-dose"] = function (root) {

        const defaults = { lk: 0, dmax: 60, dv: 30 };
        const state = { lk: 0, dmax: 60, dv: 30 };
        let hit = false;

        root.innerHTML =
            head("Try it: read an unknown sample from a calibration curve") +
            canvasFor(680, 330, "A dose-response calibration curve: threshold shift against concentration on a log axis. A horizontal line marks the shift you measured, and a vertical line drops from where it meets the curve to read the concentration.") +
            '<div class="fd-stat-row">' + stat("Measured shift", "dv") + stat("Concentration of the unknown", "c") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Shift you measured on the unknown", key: "dv", min: 1, max: 59, step: 1, value: 30 }) +
            slider({ label: "Calibration: dissociation constant KD (log, in nM)", key: "lk", min: -2, max: 2, step: 0.1, value: 0 }) +
            slider({ label: "Calibration: shift with every receptor occupied (ΔVmax)", key: "dmax", min: 20, max: 100, step: 5, value: 60 }) +
            "</div>" +
            '<p class="fd-sim-formula">ΔV<sub>th</sub> = ΔV<sub>max</sub> · c ÷ (c + K<sub>D</sub>). Invert it to read an unknown: c = K<sub>D</sub> · ΔV ÷ (ΔV<sub>max</sub> − ΔV). A calibration curve turns millivolts into concentration.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const kd = Math.pow(10, state.lk);
            const dv = Math.min(state.dv, state.dmax - 1);
            const c = kd * dv / (state.dmax - dv);

            setVal(root, "dv", state.dv + " mV");
            setVal(root, "lk", fmtConc(kd));
            setVal(root, "dmax", state.dmax + " mV");
            out(root, "dv", dv + " mV");
            out(root, "c", fmtConc(c));
            out(root, "verdict", dv / state.dmax > 0.9 ? "Close to saturation: the reading is almost insensitive to concentration" : dv / state.dmax < 0.05 ? "A tiny shift: easily lost in the noise" : "In the working part of the curve");

            if (!hit && Math.abs(state.dv - 30) < 0.5 && Math.abs(state.dmax - 60) < 0.5 && state.lk === 0) {

                hit = true;
                F.reward("fet-dose", 10, "You read a concentration off a calibration curve");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 275;
            const kd = Math.pow(10, state.lk);
            const dv = Math.min(state.dv, state.dmax - 1);
            const c = kd * dv / (state.dmax - dv);
            const X = function (lc) { return L + (lc + 3) / 6 * (R - L); };
            const Y = function (v) { return B - v / 100 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 25, 50, 75, 100].forEach(function (v) { txt(ctx, v + " mV", L - 30, Y(v) + 4, 11, TEXT + ".65)"); });
            [-3, -2, -1, 0, 1, 2, 3].forEach(function (e) { txt(ctx, "10" + sup(e), X(e), B + 18, 11, TEXT + ".65)"); });
            txt(ctx, "concentration (nM, log) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let lc = -3; lc <= 3.001; lc += 0.05) {

                const cc = Math.pow(10, lc);
                const y = Y(state.dmax * cc / (cc + kd));

                if (lc === -3) { ctx.moveTo(X(lc), y); } else { ctx.lineTo(X(lc), y); }
            }

            ctx.stroke();

            ctx.strokeStyle = GOLD + ".9)";
            ctx.setLineDash([5, 4]);
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(L, Y(dv)); ctx.lineTo(X(Math.log10(c)), Y(dv)); ctx.lineTo(X(Math.log10(c)), B);
            ctx.stroke();
            ctx.setLineDash([]);
            dot(ctx, X(Math.log10(c)), Y(dv), 8, "rgba(255,255,255,1)");
            txt(ctx, fmtConc(c), X(Math.log10(c)), B - 10, 13, GOLD + "1)", "center", true);
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-claims"] = quiz(
        "Game: read the claim carefully",
        ["Fair claim", "Needs a caveat"],
        [
            { q: "'Detected at 10 femtomolar' in diluted low-salt buffer, with no serum test.", a: "Needs a caveat", why: "Low-salt results may not carry over to blood or serum." },
            { q: "'Detected at 1 nM' in undiluted serum, with a no-receptor control.", a: "Fair claim", why: "A real matrix, with a control." },
            { q: "'Works across several decades of concentration' with a calibration curve and error bars.", a: "Fair claim", why: "Backed by data." },
            { q: "'Ultra-sensitive' with no mention of the sample or salt.", a: "Needs a caveat", why: "Always ask what sample the claimed limit was measured in." },
            { q: "A single measurement on one device.", a: "Needs a caveat", why: "Reproducibility is unknown." }
        ],
        4,
        "fet-claims-done",
        "You read performance claims critically",
        "Always ask what sample the claimed limit was measured in.",
        "Check the sample, the controls and the replicates. Hit Reset to try again."
    );


    /* ======================================
       UNIT 22: DNA HYBRIDIZATION SENSING
    ====================================== */

    SIMS["fet-pairing"] = function (root) {

        const probe = ["A", "T", "G", "C", "C", "A", "T", "G"];
        const comp = { A: "T", T: "A", G: "C", C: "G" };
        const state = { i: 0, miss: 0, done: false };

        root.innerHTML =
            head("Game: pair the target strand") +
            '<div class="fd-stat-row">' + stat("Bases paired", "n") + stat("Mistakes", "m") + stat("Charge added", "q") + "</div>" +
            canvasFor(680, 260, "A DNA probe strand on the gate with the target strand being built base by base opposite it, A with T and G with C. When the strand is complete, its negative charge sits next to the surface.") +
            '<p class="fd-sim-note">The probe is fixed on the gate. Tap the base that pairs with each highlighted base: A with T, and G with C.</p>' +
            '<div class="fd-q-options" data-pick style="grid-template-columns:repeat(4,1fr)"></div>' +
            '<p class="fd-q-feedback" data-out="fb"></p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const pick = root.querySelector("[data-pick]");
        const built = [];

        pick.innerHTML = ["A", "T", "G", "C"].map(function (b) { return '<button type="button" data-b="' + b + '">' + b + "</button>"; }).join("");

        function draw() {

            clear(ctx, 680, 260);

            ctx.fillStyle = GREY + ".55)";
            ctx.fillRect(40, 220, 600, 26);
            txt(ctx, "gate surface", 340, 238, 12, "rgba(6,10,24,.95)", "center", true);

            const col = { A: GOLD, T: ROSE, G: TEAL, C: BLUE };

            probe.forEach(function (b, i) {

                const x = 80 + i * 70;

                ctx.strokeStyle = GREY + ".7)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x, 220); ctx.lineTo(x, 175);
                ctx.stroke();

                ctx.fillStyle = col[b] + ".95)";
                ctx.fillRect(x - 22, 135, 44, 38);
                txt(ctx, b, x, 163, 22, "rgba(6,10,24,.95)", "center", true);

                if (i === state.i && !state.done) {

                    ctx.strokeStyle = "rgba(255,255,255,.95)";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x - 25, 132, 50, 44);
                    txt(ctx, "?", x, 100, 28, "rgba(255,255,255,.95)", "center", true);
                }

                if (i < built.length) {

                    const c = built[i];

                    ctx.fillStyle = col[c] + ".95)";
                    ctx.fillRect(x - 22, 70, 44, 38);
                    txt(ctx, c, x, 98, 22, "rgba(6,10,24,.95)", "center", true);

                    ctx.strokeStyle = TEXT + ".6)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x, 108); ctx.lineTo(x, 135);
                    ctx.stroke();

                    txt(ctx, "−", x, 56, 20, BLUE + "1)", "center", true);
                }
            });

            txt(ctx, "target strand (builds as you pair)", 340, 24, 13, TEXT + ".75)");
            txt(ctx, "probe strand", 340, 205, 12, TEXT + ".7)");
        }

        function update() {

            out(root, "n", built.length + " of " + probe.length);
            out(root, "m", state.miss);
            out(root, "q", "−" + built.length + " e");
            draw();
        }

        pick.querySelectorAll("button").forEach(function (b) {

            b.addEventListener("click", function () {

                if (state.done) { return; }

                if (b.dataset.b === comp[probe[state.i]]) {

                    built.push(b.dataset.b);
                    state.i++;
                    out(root, "fb", "✅ " + probe[state.i - 1] + " pairs with " + b.dataset.b + ".");

                    if (state.i === probe.length) {

                        state.done = true;
                        out(root, "fb", "✅ Duplex complete: each nucleotide adds about one negative charge next to the gate." + (state.miss === 0 ? " No mistakes!" : ""));
                        F.reward("fet-pairing", state.miss === 0 ? 15 : 10, "You hybridized a DNA strand");
                    }

                } else {

                    state.miss++;
                    out(root, "fb", "❌ " + b.dataset.b + " does not pair with " + probe[state.i] + ": A goes with T, and G goes with C.");
                    b.classList.add("shake");
                    setTimeout(function () { b.classList.remove("shake"); }, 400);
                }

                update();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            built.length = 0;
            state.i = 0;
            state.miss = 0;
            state.done = false;
            out(root, "fb", "");
            update();
        });

        update();
    };


    SIMS["fet-dnashift"] = function (root) {

        const defaults = { ld: 11, len: 20, c: 150 };
        const state = { ld: 11, len: 20, c: 150 };
        let hit = false;

        root.innerHTML =
            head("Try it: volts on paper, millivolts in practice") +
            art("0 0 340 190", "Two bars: the threshold shift if every charge of every captured DNA strand were seen by the gate, and the much smaller shift after ions in the sample screen most of it.") +
            '<div class="fd-stat-row">' + stat("Charge captured", "q") + stat("Shift if unscreened", "u") + stat("Shift after screening", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Probes per cm² (log)", key: "ld", min: 9, max: 12, step: 0.1, value: 11 }) +
            slider({ label: "Target length (nucleotides)", key: "len", min: 10, max: 40, step: 1, value: 20 }) +
            slider({ label: "Salt concentration", key: "c", min: 1, max: 150, step: 1, value: 150 }) +
            "</div>" +
            '<p class="fd-sim-formula">About one negative charge per nucleotide. 10¹¹ probes per cm² each capturing a 20-nucleotide target give 2×10¹² elementary charges per cm²; with C<sub>ox</sub> = 0.345 µF/cm², ΔV<sub>th</sub> ≈ −Q/C<sub>ox</sub> is near 0.9 V. Real signals are tens of millivolts, because ions screen most of the charge. (The screening factor is averaged over a 10 nm height.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const n = Math.pow(10, state.ld);
            const q = n * state.len;
            const u = q * 1.602e-19 / 0.345e-6;
            const ld = debye(state.c);
            const h = 10;
            const f = ld / h * (1 - Math.exp(-h / ld));
            const s = u * Math.min(1, f);

            setVal(root, "ld", "10" + sup(state.ld.toFixed(1)));
            setVal(root, "len", state.len + " nt");
            setVal(root, "c", state.c + " mM");
            out(root, "q", sciN(q) + " e/cm²");
            out(root, "u", u >= 1 ? u.toFixed(2) + " V" : (u * 1000).toFixed(0) + " mV");
            out(root, "s", s >= 1 ? s.toFixed(2) + " V" : (s * 1000).toFixed(0) + " mV");
            out(root, "verdict", f < 0.2 ? "Screening turns volts into millivolts" : f > 0.6 ? "Little salt: most of the charge reaches the gate" : "Partly screened");

            svg.innerHTML =
                label(14, 22, "unscreened: " + (u >= 1 ? u.toFixed(2) + " V" : (u * 1000).toFixed(0) + " mV"), 8.5, "start", "var(--text)") +
                rect(14, 30, 280 * Math.min(1, u / 2), 16, "rgba(255,214,102,.9)") +
                label(14, 84, "after screening: " + (s >= 1 ? s.toFixed(2) + " V" : (s * 1000).toFixed(0) + " mV"), 8.5, "start", "var(--text)") +
                rect(14, 92, Math.max(2, 280 * Math.min(1, s / 2)), 16, "rgba(84,224,199,.9)") +
                label(14, 150, "bars share one scale: up to 2 V", 7, "start", "var(--muted)");

            if (!hit && state.c >= 100 && s < 0.2 && u > 0.5) {

                hit = true;
                F.reward("fet-dnashift", 10, "You saw screening turn volts into millivolts");
            }
        }

        function sciN(v) {

            const e = Math.floor(Math.log10(v));

            return (v / Math.pow(10, e)).toFixed(1) + "×10" + sup(e);
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["fet-stringency"] = function (root) {

        const defaults = { T: 40, s: 100 };
        const state = { T: 40, s: 100 };
        let hit = false;

        root.innerHTML =
            head("Try it: telling a match from a near-miss") +
            canvasFor(680, 320, "Two curves of the fraction of probes holding a target as temperature rises: one for a perfectly matching target and one with a single mismatched base. The mismatched duplex melts at a lower temperature, so there is a window where only perfect matches stay bound.") +
            '<div class="fd-stat-row">' + stat("Perfect match bound", "m") + stat("One mismatch bound", "x") + stat("Discrimination", "d") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Temperature (°C)", key: "T", min: 20, max: 80, step: 1, value: 40 }) +
            slider({ label: "Salt concentration (mM)", key: "s", min: 10, max: 500, step: 10, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">One wrong base weakens the duplex. Warming a little melts loosely paired strands and keeps perfect matches. Lower salt weakens all pairing, which raises stringency. Stringency, meaning temperature and salt, is the knob for specificity. (Melting temperatures illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function tm(mis) { return (mis ? 44 : 56) + 12 * Math.log10(state.s / 100); }

        function bound(T, mis) { return 1 / (1 + Math.exp((T - tm(mis)) / 2.5)); }

        function update() {

            const m = bound(state.T, false);
            const x = bound(state.T, true);

            setVal(root, "T", state.T + " °C");
            setVal(root, "s", state.s + " mM");
            out(root, "m", Math.round(m * 100) + " %");
            out(root, "x", Math.round(x * 100) + " %");
            out(root, "d", Math.round((m - x) * 100) + " points");
            out(root, "verdict", m - x > 0.7 ? "A sharp window: perfect matches stay, mismatches melt away" : m < 0.2 ? "Too stringent: even the match has melted" : x > 0.7 ? "Not stringent enough: the mismatch binds too" : "Some discrimination: tune the temperature or salt");

            if (!hit && m - x > 0.75) {

                hit = true;
                F.reward("fet-stringency", 10, "You found the stringency sweet spot");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (t) { return L + (t - 20) / 60 * (R - L); };
            const Y = function (f) { return B - f * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 50, 100].forEach(function (v) { txt(ctx, v + " %", L - 26, Y(v / 100) + 4, 12, TEXT + ".7)"); });
            [20, 40, 60, 80].forEach(function (t) { txt(ctx, t + " °C", X(t), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "temperature →", (L + R) / 2, B + 40, 13, TEXT + ".85)");

            [[false, TEAL, "perfect match"], [true, ROSE, "one mismatch"]].forEach(function (c) {

                ctx.strokeStyle = c[1] + ".98)";
                ctx.lineWidth = 3;
                ctx.beginPath();

                for (let t = 20; t <= 80; t += 1) {

                    const y = Y(bound(t, c[0]));

                    if (t === 20) { ctx.moveTo(X(t), y); } else { ctx.lineTo(X(t), y); }
                }

                ctx.stroke();
                txt(ctx, c[2], X(c[0] ? tm(true) - 12 : tm(false) + 12), c[0] ? Y(0.7) : Y(0.3), 13, c[1] + "1)", "center", true);
            });

            ctx.strokeStyle = GOLD + ".8)";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(X(state.T), T); ctx.lineTo(X(state.T), B);
            ctx.stroke();
            dot(ctx, X(state.T), Y(bound(state.T, false)), 7, "rgba(255,255,255,1)");
            dot(ctx, X(state.T), Y(bound(state.T, true)), 7, "rgba(255,255,255,1)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-pna"] = quiz(
        "Game: DNA probe or PNA probe?",
        ["DNA probe", "PNA probe"],
        [
            { q: "The backbone carries a negative charge on every phosphate.", a: "DNA probe", why: "Each nucleotide has one phosphate." },
            { q: "An uncharged backbone: peptide nucleic acid.", a: "PNA probe", why: "No charge on the probe itself." },
            { q: "Hybridizes well in low salt because nothing on the probe repels the target.", a: "PNA probe", why: "No charge-charge repulsion." },
            { q: "A target hybridizing to this probe adds charge from both the target and the probe.", a: "DNA probe", why: "The probe's own charge muddies the reading." },
            { q: "All the added charge comes from the target.", a: "PNA probe", why: "A cleaner signal." }
        ],
        4,
        "fet-pna-done",
        "You know why a neutral probe helps",
        "A neutral probe helps both binding and interpretation.",
        "PNA has no backbone charge. Hit Reset to try again."
    );


    /* ======================================
       UNIT 23: LIMIT OF DETECTION
    ====================================== */

    SIMS["fet-lod"] = function (root) {

        const defaults = { sg: 0.5, lk: 0, dmax: 60 };
        const state = { sg: 0.5, lk: 0, dmax: 60 };
        let hit = false;

        root.innerHTML =
            head("Try it: where does the curve meet the noise?") +
            canvasFor(680, 330, "A binding curve of threshold shift against concentration on a log axis, with a dashed line at three times the noise. The concentration where the curve crosses the dashed line is the limit of detection; everything to its left is lost in the noise.") +
            '<div class="fd-stat-row">' + stat("3σ noise level", "n3") + stat("Limit of detection", "lod") + stat("In units of KD", "kd") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Noise σ of a blank measurement", key: "sg", min: 0.1, max: 5, step: 0.1, value: 0.5 }) +
            slider({ label: "KD (log, in nM)", key: "lk", min: -2, max: 2, step: 0.1, value: 0 }) +
            slider({ label: "Shift with every receptor occupied (ΔVmax)", key: "dmax", min: 20, max: 100, step: 5, value: 60 }) +
            "</div>" +
            '<p class="fd-sim-formula">LOD: signal = 3σ. θ = 3σ ÷ ΔV<sub>max</sub>, then c = K<sub>D</sub>·θ ÷ (1 − θ). Worked example: ΔV<sub>max</sub> = 60 mV and σ = 0.5 mV give θ = 0.025 and c ≈ 0.026 K<sub>D</sub>; with K<sub>D</sub> = 1 nM that is about 26 pM. A tight binder and a quiet transistor reach low concentrations.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function lod() {

            const th = Math.min(0.99, 3 * state.sg / state.dmax);
            const kd = Math.pow(10, state.lk);

            return { th: th, c: kd * th / (1 - th), kd: kd };
        }

        function update() {

            const l = lod();

            setVal(root, "sg", state.sg.toFixed(1) + " mV");
            setVal(root, "lk", fmtConc(l.kd));
            setVal(root, "dmax", state.dmax + " mV");
            out(root, "n3", (3 * state.sg).toFixed(1) + " mV");
            out(root, "lod", fmtConc(l.c));
            out(root, "kd", (l.c / l.kd).toFixed(3) + " × KD");
            out(root, "verdict", l.c < 0.03 ? "A very low limit: tight binding and low noise" : l.c > 10 ? "A high limit: too much noise or too weak a signal" : "A moderate limit of detection");

            if (!hit && l.c < 0.01) {

                hit = true;
                F.reward("fet-lod", 10, "You pushed the limit of detection below 10 pM");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 275;
            const l = lod();
            const X = function (lc) { return L + (lc + 3) / 6 * (R - L); };
            const Y = function (v) { return B - v / 100 * (B - T); };

            ctx.fillStyle = ROSE + ".1)";
            ctx.fillRect(L, T, X(Math.log10(l.c)) - L, B - T);
            txt(ctx, "lost in the noise", (L + X(Math.log10(l.c))) / 2, T + 18, 12, ROSE + "1)");

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 25, 50, 75, 100].forEach(function (v) { txt(ctx, v + " mV", L - 30, Y(v) + 4, 11, TEXT + ".65)"); });
            [-3, -2, -1, 0, 1, 2, 3].forEach(function (e) { txt(ctx, "10" + sup(e), X(e), B + 18, 11, TEXT + ".65)"); });
            txt(ctx, "concentration (nM, log) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let lc = -3; lc <= 3.001; lc += 0.05) {

                const c = Math.pow(10, lc);
                const y = Y(state.dmax * c / (c + l.kd));

                if (lc === -3) { ctx.moveTo(X(lc), y); } else { ctx.lineTo(X(lc), y); }
            }

            ctx.stroke();

            ctx.strokeStyle = GOLD + ".95)";
            ctx.setLineDash([6, 5]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(L, Y(3 * state.sg)); ctx.lineTo(R, Y(3 * state.sg));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "3σ", R - 20, Y(3 * state.sg) - 8, 13, GOLD + "1)", "center", true);

            dot(ctx, X(Math.log10(l.c)), Y(3 * state.sg), 8, "rgba(255,255,255,1)");
            txt(ctx, "LOD " + fmtConc(l.c), X(Math.log10(l.c)) + 10, Y(3 * state.sg) - 14, 13, "rgba(255,255,255,.95)", "start", true);
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["fet-noisesrc"] = quiz(
        "Game: where does the noise come from?",
        ["Flicker noise", "Thermal noise", "Drift", "Gate area"],
        [
            { q: "1/f noise from charge traps at the oxide; it grows at low frequency.", a: "Flicker noise", why: "Usually the main source in these sensors." },
            { q: "Random motion of charges in the channel and contacts.", a: "Thermal noise", why: "Always present at room temperature." },
            { q: "Slow changes that look like signal, as seen with ISFETs.", a: "Drift", why: "It mimics a real shift." },
            { q: "Flicker noise falls as this grows.", a: "Gate area", why: "A bigger gate averages over more traps." },
            { q: "Traps at the oxide surface are usually the main source of which noise?", a: "Flicker noise", why: "Charge trapping and release." }
        ],
        4,
        "fet-noisesrc-done",
        "You know the noise sources",
        "Traps at the oxide surface are usually the main source of noise.",
        "Flicker from traps, thermal from motion, drift from hydration, area helps. Hit Reset to try again."
    );


    SIMS["fet-tradeoffs"] = quiz(
        "Game: gains and costs",
        ["Bigger gate", "Nanowire", "Subthreshold readout", "Averaging"],
        [
            { q: "Lower flicker noise, but the targets spread over more surface.", a: "Bigger gate", why: "Signal per unit area falls." },
            { q: "Tiny area, so each bound charge matters more, but the noise is higher.", a: "Nanowire", why: "High sensitivity per molecule, with more noise." },
            { q: "Current changes about 10× per 60 to 100 mV, so a small shift is easy to read.", a: "Subthreshold readout", why: "Exponential gain." },
            { q: "Repeated readings cut random noise, at the cost of time.", a: "Averaging", why: "Noise falls with the square root of the number of readings." },
            { q: "Gains in one place usually cost something in another. Which option costs time?", a: "Averaging", why: "More readings take longer." }
        ],
        4,
        "fet-tradeoffs-done",
        "You can weigh the trade-offs",
        "Gains in one place usually cost something in another.",
        "Big gate, nanowire, subthreshold, averaging. Hit Reset to try again."
    );


    /* ======================================
       UNIT 24: NANOWIRES, GRAPHENE, ARRAYS
    ====================================== */

    SIMS["fet-nanograph"] = quiz(
        "Game: nanowire or graphene?",
        ["Nanowire FET", "Graphene FET"],
        [
            { q: "A channel tens of nanometers across, with nearly all of it close to the surface.", a: "Nanowire FET", why: "Surface charge controls all of it." },
            { q: "A channel one atom thick: it has nowhere for charge to hide.", a: "Graphene FET", why: "The channel is entirely surface." },
            { q: "Conducts both electrons and holes, with a minimum at the Dirac point.", a: "Graphene FET", why: "Ambipolar." },
            { q: "Binding shifts the Dirac point, much as it shifts Vth.", a: "Graphene FET", why: "Graphene's version of a threshold shift." },
            { q: "Detected proteins and DNA at very low concentrations in the early 2000s.", a: "Nanowire FET", why: "An early landmark." }
        ],
        4,
        "fet-nanograph-done",
        "You know nanowires and graphene",
        "A thin channel is a sensitive channel.",
        "Nanowire: tens of nm across. Graphene: one atom. Hit Reset to try again."
    );


    SIMS["fet-ionseq"] = function (root) {

        const template = ["A", "T", "T", "C", "G", "G", "G", "A", "T", "C", "C"]; // the strand being copied
        const comp = { A: "T", T: "A", C: "G", G: "C" };
        const target = template.map(function (b) { return comp[b]; }); // bases to be added
        const order = ["T", "A", "C", "G"];
        const state = { pos: 0, flow: 0, read: [], signals: [] };
        let anim = 1;

        root.innerHTML =
            head("Try it: read DNA with hydrogen ions") +
            canvasFor(680, 340, "A well containing a DNA template with a polymerase building a complementary strand. Nucleotides are flowed in one kind at a time. When one is added, it releases a hydrogen ion that an ISFET under the well reads as a pH change; a run of identical bases gives a bigger signal.") +
            '<div class="fd-stat-row">' + stat("Flows so far", "f") + stat("Bases read", "n") + stat("Sequence read", "seq") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-flow>💧 Flow the next nucleotide</button></div>' +
            '<p class="fd-sim-formula">Semiconductor DNA sequencers: when a nucleotide joins a growing strand, it releases a hydrogen ion, and an ISFET under each well reads the pH change. The ISFET pH sensor became a genome-reading tool.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const col = { A: GOLD, T: ROSE, G: TEAL, C: BLUE };
        let done = false;

        function flow() {

            if (state.pos >= target.length) { return; }

            const nuc = order[state.flow % 4];
            let n = 0;

            while (state.pos + n < target.length && target[state.pos + n] === nuc) { n++; }

            state.signals.push({ nuc: nuc, n: n });

            for (let i = 0; i < n; i++) { state.read.push(nuc); }

            state.pos += n;
            state.flow++;
            anim = 0;
            update();
        }

        function update() {

            out(root, "f", state.flow);
            out(root, "n", state.read.length + " of " + target.length);
            out(root, "seq", state.read.join("") || "—");

            const last = state.signals[state.signals.length - 1];

            out(root, "verdict", !last ? "Press the button to flow the first nucleotide" : last.n === 0 ? "Flow " + last.nuc + ": no match, so no signal" : "Flow " + last.nuc + ": " + last.n + " incorporated, signal " + last.n + "×");

            if (state.pos >= target.length && !done) {

                done = true;
                F.reward("fet-ionseq", 10, "You read a DNA strand with an ISFET");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            // the well
            ctx.fillStyle = BLUE + ".1)";
            ctx.fillRect(60, 40, 560, 150);
            ctx.fillStyle = GREY + ".5)";
            ctx.fillRect(40, 190, 600, 24);
            txt(ctx, "ISFET under the well", 340, 207, 12, "rgba(6,10,24,.95)", "center", true);

            // template strand
            template.forEach(function (b, i) {

                const x = 90 + i * 46;

                ctx.fillStyle = col[b] + ".75)";
                ctx.fillRect(x - 17, 150, 34, 30);
                txt(ctx, b, x, 172, 17, "rgba(6,10,24,.95)", "center", true);

                if (i < state.pos) {

                    const c = target[i];

                    ctx.fillStyle = col[c] + ".95)";
                    ctx.fillRect(x - 17, 108, 34, 30);
                    txt(ctx, c, x, 130, 17, "rgba(6,10,24,.95)", "center", true);
                }
            });

            txt(ctx, "template (being copied)", 340, 200 + 24, 12, TEXT + ".7)");
            txt(ctx, "new strand", 340, 98, 12, TEXT + ".7)");

            // the last flow: a flash and H+ ions
            const last = state.signals[state.signals.length - 1];

            if (last && last.n > 0 && anim < 1) {

                for (let i = 0; i < last.n * 3; i++) {

                    const x = 120 + i * 14;
                    const y = 150 - anim * 90 - (i % 3) * 8;

                    dot(ctx, x % 540 + 60, y + 60, 4, GOLD + (1 - anim) + ")");
                }
            }

            // signal bars per flow
            const base = 330;

            state.signals.slice(-12).forEach(function (s, i) {

                const x = 80 + i * 46;

                ctx.fillStyle = (s.n > 0 ? col[s.nuc] : GREY) + ".9)";
                ctx.fillRect(x, base - Math.max(2, s.n * 22), 30, Math.max(2, s.n * 22));
                txt(ctx, s.nuc, x + 15, base + 0, 11, TEXT + ".85)");
            });

            txt(ctx, "ISFET signal per flow", 580, 250, 12, TEXT + ".6)", "end");
        }

        animate(root, function (dt) {

            anim = Math.min(1, anim + dt * 1.2);
            draw();
        });

        root.querySelector("[data-flow]").addEventListener("click", flow);

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.pos = 0;
            state.flow = 0;
            state.read = [];
            state.signals = [];
            done = false;
            update();
        });

        update();
        draw();
    };


    SIMS["fet-formats"] = quiz(
        "Game: choose a format",
        ["Planar FET", "Nanowire", "Graphene", "Extended gate", "CMOS array"],
        [
            { q: "Well understood and easy to make in a fab.", a: "Planar FET", why: "The familiar workhorse." },
            { q: "Highest charge sensitivity per molecule.", a: "Nanowire", why: "Tiny cross-section." },
            { q: "An atomically thin channel, with a different fabrication path.", a: "Graphene", why: "Not made like silicon." },
            { q: "A cheap, replaceable sensing pad wired to a dry transistor.", a: "Extended gate", why: "The transistor stays away from the liquid." },
            { q: "Thousands to millions of sensors read in parallel.", a: "CMOS array", why: "Standard CMOS lets millions share a chip." },
            { q: "You need a throwaway sensor that can be swapped without touching the transistor.", a: "Extended gate", why: "Replace only the pad." }
        ],
        5,
        "fet-formats-done",
        "You can choose a format",
        "There is no single best format: the application decides.",
        "Match each format to its strength. Hit Reset to try again."
    );


    /* ======================================
       UNIT 25: REAL SAMPLES AND RELIABILITY
    ====================================== */

    SIMS["fet-hurdles"] = quiz(
        "Game: which real-sample hurdle?",
        ["Complex matrix", "High salt", "Fouling"],
        [
            { q: "Blood, saliva or food add proteins, salts and particles.", a: "Complex matrix", why: "Much more than the target is in there." },
            { q: "Physiological salt shortens the Debye length.", a: "High salt", why: "Charge is screened more." },
            { q: "Non-specific binding builds up over minutes.", a: "Fouling", why: "The surface slowly gets coated." },
            { q: "A drift in the reading as the surface gets coated.", a: "Fouling", why: "Fouling looks like a changing signal." },
            { q: "Why is a bound antibody hard to detect in saline?", a: "High salt", why: "The Debye length is under a nanometer." }
        ],
        4,
        "fet-hurdles-done",
        "You know the real-sample hurdles",
        "Every earlier limit gets harder in a real sample.",
        "Matrix, salt, fouling. Hit Reset to try again."
    );


    SIMS["fet-prepquiz"] = quiz(
        "Game: which sample prep step?",
        ["Filter", "Dilute", "Desalt", "Concentrate"],
        [
            { q: "Removes cells and particles.", a: "Filter", why: "Clears out the big stuff." },
            { q: "Lowers salt and background proteins together.", a: "Dilute", why: "Simple, but it also dilutes the target." },
            { q: "Swaps the buffer for a low-salt one before measurement.", a: "Desalt", why: "A longer Debye length without diluting the target." },
            { q: "Raises a scarce target's concentration before it reaches the sensor.", a: "Concentrate", why: "More target per volume." },
            { q: "Prep steps trade convenience for a cleaner signal. Which one removes particles?", a: "Filter", why: "Cells and particles are removed." }
        ],
        4,
        "fet-prepquiz-done",
        "You know the sample-prep steps",
        "Prep steps trade convenience for a cleaner signal.",
        "Filter, dilute, desalt, concentrate. Hit Reset to try again."
    );


    SIMS["fet-variation"] = function (root) {

        const defaults = { sp: 25, cal: "off" };
        const state = { sp: 25, cal: "off" };
        const rand = mulberry(Date.now() % 100000);
        let gains = [];
        let hit = false;

        root.innerHTML =
            head("Try it: no two sensors are the same") +
            art("0 0 340 210", "Eight nominally identical sensors measuring the same sample, shown as bars of different heights. After calibrating each device against a known standard, the bars line up.") +
            '<div class="fd-stat-row">' + stat("Mean response", "mean") + stat("Spread between devices", "spread") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Calibrate each device?", "cal", [["off", "No"], ["on", "Yes, per device"]]) +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-new>🎲 Make a new batch</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Device-to-device variation", key: "sp", min: 0, max: 50, step: 1, value: 25 }) +
            "</div>" +
            '<p class="fd-sim-formula">Threshold voltages, receptor densities and noise all vary between devices. Reliable results need calibration per device or per batch, replicates, and reference sensors on the same chip.</p>';

        const svg = root.querySelector("svg");

        function newBatch() {

            gains = [];

            for (let i = 0; i < 8; i++) { gains.push((rand() + rand() + rand() - 1.5) * 2); }
        }

        function update() {

            setVal(root, "sp", state.sp + " %");

            const vals = gains.map(function (g) {

                return state.cal === "on" ? 50 * (1 + g * state.sp / 100 * 0.08) : 50 * (1 + g * state.sp / 100);
            });
            const mean = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
            const sd = Math.sqrt(vals.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / vals.length);

            out(root, "mean", mean.toFixed(1) + " mV");
            out(root, "spread", (sd / mean * 100).toFixed(1) + " % (std. dev.)");
            out(root, "verdict", sd / mean < 0.03 ? "The devices agree: a reliable measurement" : sd / mean > 0.15 ? "The devices disagree: one reading means little" : "Some scatter: calibrate and replicate");

            let s = "";

            vals.forEach(function (v, i) {

                const h = clamp(v, 0, 100) / 100 * 140;

                s += rect(24 + i * 38, 160 - h, 26, h, state.cal === "on" ? "rgba(84,224,199,.85)" : "rgba(255,214,102,.85)");
                s += label(37 + i * 38, 176, "#" + (i + 1), 7, "middle", "var(--muted)");
            });

            s += '<line x1="20" y1="' + (160 - mean / 100 * 140) + '" x2="326" y2="' + (160 - mean / 100 * 140) + '" style="stroke:#fff;stroke-width:1;stroke-dasharray:4 3"/>';
            s += label(170, 198, "same sample, eight devices", 7.5, "middle", "var(--muted)");

            svg.innerHTML = s;

            if (!hit && state.cal === "on" && state.sp >= 30 && sd / mean < 0.05) {

                hit = true;
                F.reward("fet-variation", 10, "You tamed a big device-to-device spread by calibrating");
            }
        }

        wire(root, state, defaults, update);

        root.querySelector("[data-new]").addEventListener("click", function () {

            newBatch();
            update();
        });

        newBatch();
        update();
    };


    SIMS["fet-assured"] = quiz(
        "Game: point-of-care needs",
        ["Affordable", "Rapid and robust", "User-friendly", "Deliverable"],
        [
            { q: "A low cost per test.", a: "Affordable", why: "Tests have to be cheap to be used widely." },
            { q: "A fast answer that tolerates rough handling.", a: "Rapid and robust", why: "Speed and toughness." },
            { q: "Little or no training required.", a: "User-friendly", why: "Anyone can run it." },
            { q: "Usable where the patient is, without lab infrastructure.", a: "Deliverable", why: "No lab needed." },
            { q: "These are four of the seven ASSURED criteria. Which means 'works without a lab'?", a: "Deliverable", why: "The test goes to the patient." }
        ],
        4,
        "fet-assured-done",
        "You know the point-of-care needs",
        "A test has to be cheap, fast, easy and portable.",
        "Affordable, rapid, user-friendly, deliverable. Hit Reset to try again."
    );


    SIMS["fet-validate"] = quiz(
        "Game: which check proves it?",
        ["Calibration curve", "Selectivity", "Reproducibility", "Real sample"],
        [
            { q: "Known concentrations, fitted, with error bars.", a: "Calibration curve", why: "It turns millivolts into concentration." },
            { q: "Blanks and wrong targets give no response.", a: "Selectivity", why: "The surface ignores everything else." },
            { q: "Several devices and batches agree.", a: "Reproducibility", why: "One good device is not enough." },
            { q: "The same response in a spiked real matrix, not just in buffer.", a: "Real sample", why: "Buffer results may not carry over." }
        ],
        4,
        "fet-validate-done",
        "You know the validation checklist",
        "A result is only as strong as its weakest control.",
        "Calibration, selectivity, reproducibility, real sample. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="fet-"]').forEach(F.mount);

})();
