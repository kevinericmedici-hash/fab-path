/* ========================================
   SUPERCAPACITORS: INTERACTIVE SIMULATORS, PART 4

   Unit 25: instruments, three-electrode cells, the factor of four.
   Unit 26: reading CV curves, capacitance from a loop, scan rate, b-value.
   Unit 27: charge-discharge curves.
   Unit 28: Nyquist plots and the knee frequency.
   Unit 29: units, normalization, building a Ragone plot.
   Unit 30: cycle life, self-discharge, honest reporting.

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

    // A CV current at voltage V (0 to 1 V), sweeping up (dir 1) or down (dir -1).
    // p: k (capacitive current, mA), hump, tau (resistance lag, in volts), brk (breakdown at the ends)
    function cvCurrent(V, dir, p) {

        const prog = dir > 0 ? V : 1 - V;
        let i = p.k * (1 - Math.exp(-prog / Math.max(0.02, p.tau)));

        if (p.hump) {

            const c = dir > 0 ? 0.55 : 0.45;

            i += p.hump * p.k * Math.exp(-Math.pow((V - c) / 0.2, 2));
        }

        if (p.brk) {

            const edge = dir > 0 ? Math.max(0, V - 0.86) : Math.max(0, 0.14 - V);

            i += p.brk * p.k * (Math.exp(edge / 0.03) - 1) * 0.35;
        }

        return dir > 0 ? i : -i;
    }

    function drawCvAxes(ctx, L, R, T, B, ymax) {

        ctx.strokeStyle = GREY + ".5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
        ctx.stroke();
        ctx.strokeStyle = GREY + ".25)";
        ctx.beginPath();
        ctx.moveTo(L, (T + B) / 2); ctx.lineTo(R, (T + B) / 2);
        ctx.stroke();

        for (let t = 0; t <= 1.001; t += 0.25) {
            txt(ctx, t.toFixed(2) + " V", L + t * (R - L), B + 18, 12, TEXT + ".7)");
        }

        ymax;
    }


    /* ======================================
       UNIT 25: HOW SUPERCAPACITORS GET TESTED
    ====================================== */

    SIMS["supercap-instruments"] = quiz(
        "Game: which test is it?",
        ["Cyclic voltammetry", "Charge-discharge (GCD)", "Impedance spectroscopy (EIS)"],
        [
            { q: "A potentiostat sweeps the voltage and measures the current.", a: "Cyclic voltammetry", why: "Voltage in, current out." },
            { q: "A galvanostat holds the current and measures the voltage.", a: "Charge-discharge (GCD)", why: "Constant current, watch the voltage." },
            { q: "A tiny AC signal sweeps across frequencies and the response is recorded.", a: "Impedance spectroscopy (EIS)", why: "Small signals, many timescales." },
            { q: "Gives a loop whose area is related to the stored charge.", a: "Cyclic voltammetry", why: "The area inside the loop is charge." },
            { q: "The test closest to how a real device is used.", a: "Charge-discharge (GCD)", why: "It is the workhorse test for device performance." },
            { q: "Fast processes show up at high frequency, slow ones at low.", a: "Impedance spectroscopy (EIS)", why: "Sorted by timescale." }
        ],
        5,
        "supercap-instruments-done",
        "You can name the three tests",
        "CV, GCD and EIS: sweep, hold, ping.",
        "Sweep the voltage (CV), hold the current (GCD), ping with AC (EIS). Hit Reset to try again."
    );


    SIMS["supercap-threeelec"] = quiz(
        "Game: which electrode is it?",
        ["Working electrode", "Reference electrode", "Counter electrode", "Two-electrode cell"],
        [
            { q: "The material under test; its potential is what you control.", a: "Working electrode", why: "It is the one being studied." },
            { q: "Holds a steady, known potential to measure against.", a: "Reference electrode", why: "A fixed yardstick." },
            { q: "Completes the circuit and carries the current, with a larger area.", a: "Counter electrode", why: "It lets current flow without limiting the test." },
            { q: "The full device voltage applied across both electrodes, with no reference.", a: "Two-electrode cell", why: "This is the device itself." },
            { q: "Where device claims should come from.", a: "Two-electrode cell", why: "It includes the separator, electrolyte and contacts." },
            { q: "Tells you about a material, not about a finished device.", a: "Working electrode", why: "Three-electrode tests measure materials." }
        ],
        5,
        "supercap-threeelec-done",
        "You know the cell types",
        "Materials: three-electrode. Devices: two-electrode.",
        "Working studies, reference measures, counter carries current. Hit Reset to try again."
    );


    SIMS["supercap-factor4"] = function (root) {

        const defaults = { c: 200, basis: "electrode" };
        const state = { c: 200, basis: "electrode" };
        const seen = {};

        root.innerHTML =
            head("Try it: why one carbon gives two numbers") +
            art("0 0 340 190", "Two electrodes of equal mass wired in series. The pair has half the capacitance of one electrode and twice the mass, so per total mass the value is one quarter of the single-electrode value.") +
            '<div class="fd-stat-row">' + stat("One electrode", "e") + stat("The full cell, per gram of both electrodes", "d") + stat("Quoted as", "q") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Normalize to", "basis", [["electrode", "One electrode"], ["device", "The whole device"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Specific capacitance of the carbon (one electrode)", key: "c", min: 50, max: 400, step: 10, value: 200 }) +
            "</div>" +
            '<p class="fd-sim-formula">C<sub>cell</sub> = ½ C<sub>electrode</sub>, and the cell carries the mass of both electrodes, so per total mass the cell is ¼ of the single-electrode value.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const c = state.c;

            seen[state.basis] = true;
            setVal(root, "c", c + " F/g");
            out(root, "e", c + " F/g");
            out(root, "d", (c / 4).toFixed(0) + " F/g");
            out(root, "q", state.basis === "electrode" ? c + " F/g" : (c / 4).toFixed(0) + " F/g");
            out(root, "verdict", state.basis === "electrode" ? "Looks great: but it describes one electrode, not a device" : "The honest device number: one quarter as big");

            svg.innerHTML =
                rect(40, 40, 70, 50, "rgba(84,224,199,.7)", "rgba(245,247,255,.7)") +
                rect(230, 40, 70, 50, "rgba(84,224,199,.7)", "rgba(245,247,255,.7)") +
                '<line x1="110" y1="65" x2="230" y2="65" style="stroke:rgba(245,247,255,.7);stroke-width:2"/>' +
                label(75, 68, "1 g", 9, "middle", "#04201b") +
                label(265, 68, "1 g", 9, "middle", "#04201b") +
                label(75, 108, c + " F", 8.5, "middle", "var(--text)") +
                label(265, 108, c + " F", 8.5, "middle", "var(--text)") +
                label(170, 58, "in series", 8, "middle", "var(--muted)") +
                label(170, 150, "cell: " + (c / 2) + " F  on  2 g  =  " + (c / 4) + " F/g", 10, "middle", "var(--accent)") +
                label(170, 172, "(each electrode alone: " + c + " F on 1 g)", 8, "middle", "var(--muted)");

            if (seen.electrode && seen.device) {
                F.reward("supercap-factor4", 10, "You saw the factor of four");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 26: CYCLIC VOLTAMMETRY IN DEPTH
    ====================================== */

    SIMS["supercap-cvgame"] = function (root) {

        const shapes = {
            "Ideal double layer": { k: 4, tau: 0.05, hump: 0, brk: 0, why: "A near-perfect rectangle: ideal double-layer behavior." },
            "Pseudocapacitive": { k: 3, tau: 0.05, hump: 0.9, brk: 0, why: "A rectangle with broad humps: redox reactions are contributing." },
            "High resistance": { k: 4, tau: 0.45, hump: 0, brk: 0, why: "A tilted, leaf-like shape: series resistance slows the charging." },
            "Electrolyte breakdown": { k: 3, tau: 0.05, hump: 0, brk: 1, why: "A sharp current rise at the ends: the electrolyte is breaking down." }
        };
        const names = Object.keys(shapes);
        const rand = mulberry(Date.now() % 100000);
        const state = { i: 0, score: 0, answered: false, list: [] };

        root.innerHTML =
            head("Game: read the shape of the CV") +
            '<div class="fd-stat-row">' + stat("Round", "round") + stat("Score", "score") + "</div>" +
            canvasFor(root, 680, 280, "A cyclic voltammogram whose outline you must identify.") +
            '<p class="fd-q-prompt">What is this CV telling you?</p>' +
            '<div class="fd-q-options" data-opts></div>' +
            '<p class="fd-q-feedback" data-out="fb"></p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-next style="display:none">Next →</button></div>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const optsEl = root.querySelector("[data-opts]");
        const nextBtn = root.querySelector("[data-next]");

        function pick() {

            const pool = [];

            for (let r = 0; r < 2; r++) { names.forEach(function (n) { pool.push(n); }); }

            for (let i = pool.length - 1; i > 0; i--) {

                const j = Math.floor(rand() * (i + 1));
                const t = pool[i];

                pool[i] = pool[j];
                pool[j] = t;
            }

            state.list = pool.slice(0, 6);
        }

        function drawShape(name) {

            clear(ctx, 680, 280);

            const L = 70;
            const R = 640;
            const T = 20;
            const B = 230;
            const p = shapes[name];
            const Y = function (i) { return (T + B) / 2 - i / 9 * ((B - T) / 2); };
            const X = function (V) { return L + V * (R - L); };

            drawCvAxes(ctx, L, R, T, B);
            txt(ctx, "voltage →", (L + R) / 2, B + 38, 13, TEXT + ".85)");
            ctx.save();
            ctx.translate(20, (T + B) / 2);
            ctx.rotate(-Math.PI / 2);
            txt(ctx, "current →", 0, 0, 13, TEXT + ".85)");
            ctx.restore();

            ctx.fillStyle = TEAL + ".13)";
            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let i = 0; i <= 100; i++) {

                const y = Y(clamp(cvCurrent(i / 100, 1, p), -9, 9));

                if (i === 0) { ctx.moveTo(X(0), y); } else { ctx.lineTo(X(i / 100), y); }
            }

            for (let i = 100; i >= 0; i--) {
                ctx.lineTo(X(i / 100), Y(clamp(cvCurrent(i / 100, -1, p), -9, 9)));
            }

            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        function show() {

            const n = state.list.length;

            if (state.i >= n) {

                ctx.clearRect(0, 0, 680, 280);
                optsEl.innerHTML = "";
                out(root, "fb", "Done! You got " + state.score + " of " + n + ". " + (state.score >= n - 1 ? "You can read a CV at a glance." : "Shape is the fastest diagnostic, so keep practising. Hit Reset to try again."));
                nextBtn.style.display = "none";
                out(root, "round", "done");
                out(root, "score", state.score + " / " + n);

                F.reward("supercap-cvgame-done", 15, "You can read CV shapes");

                return;
            }

            const name = state.list[state.i];

            state.answered = false;
            drawShape(name);
            out(root, "round", (state.i + 1) + " of " + n);
            out(root, "score", state.score + " / " + n);
            out(root, "fb", "Pick the best answer.");
            nextBtn.style.display = "none";

            optsEl.innerHTML = names.map(function (o) { return '<button type="button" data-opt="' + o + '">' + o + "</button>"; }).join("");

            optsEl.querySelectorAll("button").forEach(function (b) {

                b.addEventListener("click", function () {

                    if (state.answered) { return; }

                    state.answered = true;

                    const ok = b.dataset.opt === name;

                    if (ok) { state.score++; }

                    optsEl.querySelectorAll("button").forEach(function (x) {

                        x.disabled = true;

                        if (x.dataset.opt === name) { x.classList.add("right"); } else if (x === b) { x.classList.add("wrong"); }
                    });

                    out(root, "fb", (ok ? "✅ Right. " : "❌ It's " + name + ". ") + shapes[name].why);
                    out(root, "score", state.score + " / " + n);
                    nextBtn.style.display = "";
                    nextBtn.textContent = state.i === n - 1 ? "See my score →" : "Next →";
                });
            });
        }

        nextBtn.addEventListener("click", function () { state.i++; show(); });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.i = 0;
            state.score = 0;
            pick();
            show();
        });

        pick();
        show();
    };


    SIMS["supercap-cvarea"] = function (root) {

        const defaults = { v: 50, hump: 0 };
        const state = { v: 50, hump: 0 };
        let phase = 0;
        let Q = 0;
        let done = null;
        let rewarded = false;

        root.innerHTML =
            head("Try it: turn a loop into farads") +
            canvasFor(root, 680, 320, "A cyclic voltammogram being traced by a moving dot. The area under the current is added up as the dot goes round, and at the end of the loop it is turned into a capacitance.") +
            '<div class="fd-stat-row">' + stat("Charge counted so far", "q") + stat("Capacitance from the loop", "c") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Scan rate", key: "v", min: 10, max: 200, step: 10, value: 50 }) +
            slider({ label: "Redox humps (pseudocapacitance)", key: "hump", min: 0, max: 1.5, step: 0.1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">C = ∮|I| dV ÷ (2 · v · ΔV): integrate around the whole loop, divide by two (a charging half and a discharging half), then by the scan rate and the window width.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const L = 70;
        const R = 640;
        const T = 20;
        const B = 268;
        const X = function (V) { return L + V * (R - L); };
        const Y = function (i) { return (T + B) / 2 - i / 14 * ((B - T) / 2); };

        function params() {

            return { k: 100 * (state.v / 1000), tau: 0.06, hump: state.hump, brk: 0 };
        }

        function trueC() {

            // numerical loop integral
            const p = params();
            let a = 0;

            for (let i = 0; i < 1000; i++) {

                const V = (i + 0.5) / 1000;

                a += Math.abs(cvCurrent(V, 1, p)) * 0.001 + Math.abs(cvCurrent(V, -1, p)) * 0.001;
            }

            return a / (2 * (state.v / 1000) * 1);
        }

        function update() {

            setVal(root, "v", state.v + " mV/s");
            setVal(root, "hump", state.hump.toFixed(1));
            phase = 0;
            Q = 0;
            done = null;
        }

        function draw() {

            clear(ctx, 680, 320);
            drawCvAxes(ctx, L, R, T, B);
            txt(ctx, "voltage →", (L + R) / 2, B + 38, 13, TEXT + ".85)");

            const p = params();
            const u = Math.min(phase, 2);
            const up = u < 1;
            const V = up ? u : 2 - u;

            // outline
            ctx.strokeStyle = TEAL + ".5)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let i = 0; i <= 100; i++) {

                const y = Y(clamp(cvCurrent(i / 100, 1, p), -14, 14));

                if (i === 0) { ctx.moveTo(X(0), y); } else { ctx.lineTo(X(i / 100), y); }
            }

            for (let i = 100; i >= 0; i--) {
                ctx.lineTo(X(i / 100), Y(clamp(cvCurrent(i / 100, -1, p), -14, 14)));
            }

            ctx.stroke();

            // shaded area up to the dot
            ctx.fillStyle = GOLD + ".3)";
            ctx.beginPath();
            ctx.moveTo(X(0), Y(0));

            for (let i = 0; i <= Math.min(u, 1) * 100; i++) {
                ctx.lineTo(X(i / 100), Y(clamp(cvCurrent(i / 100, 1, p), -14, 14)));
            }

            ctx.lineTo(X(Math.min(u, 1)), Y(0));
            ctx.closePath();
            ctx.fill();

            if (u > 1) {

                ctx.beginPath();
                ctx.moveTo(X(1), Y(0));

                for (let i = 100; i >= (2 - u) * 100; i--) {
                    ctx.lineTo(X(i / 100), Y(clamp(cvCurrent(i / 100, -1, p), -14, 14)));
                }

                ctx.lineTo(X(2 - u), Y(0));
                ctx.closePath();
                ctx.fill();
            }

            if (phase < 2) { dot(ctx, X(V), Y(clamp(cvCurrent(V, up ? 1 : -1, p), -14, 14)), 7, "rgba(255,255,255,1)"); }

            out(root, "q", (Q / (state.v / 1000)).toFixed(0) + " mC");
            out(root, "c", done === null ? "counting…" : done.toFixed(0) + " mF");
            out(root, "verdict", done === null ? "Adding up the area as the dot goes round" : "One loop, one capacitance: but only at " + state.v + " mV/s");
        }

        animate(root, function (dt) {

            if (phase < 2) {

                const step = dt * 0.35;
                const p = params();
                const u0 = phase;

                phase = Math.min(2, phase + step);

                // integrate |I| dV over the step
                const n = 8;

                for (let k = 0; k < n; k++) {

                    const u = u0 + (phase - u0) * (k + 0.5) / n;
                    const up = u < 1;
                    const V = up ? u : 2 - u;

                    Q += Math.abs(cvCurrent(V, up ? 1 : -1, p)) * Math.abs(phase - u0) / n;
                }

                if (phase >= 2) {

                    done = trueC();

                    if (!rewarded) {

                        rewarded = true;
                        F.reward("supercap-cvarea", 10, "You turned a CV loop into a capacitance");
                    }
                }
            }

            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-cvrate"] = function (root) {

        const defaults = { v: 20 };
        const state = { v: 20 };
        const C0 = 100; // mF at a very slow scan
        const seenFast = {};

        root.innerHTML =
            head("Try it: capacitance depends on how fast you sweep") +
            canvasFor(root, 680, 340, "A cutaway of a porous electrode. At a slow scan rate ions reach deep into the pores; at a fast scan rate only the outer surface responds. A chart shows capacitance falling as the scan rate rises.") +
            '<div class="fd-stat-row">' + stat("Scan rate", "v") + stat("Capacitance you would report", "c") + stat("Kept vs. slowest scan", "keep") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Scan rate (mV/s)", key: "v", min: 1, max: 500, step: 1, value: 20 }) +
            "</div>" +
            '<p class="fd-sim-formula">A capacitance quoted without its scan rate is incomplete. Good papers show capacitance across a range of scan rates (rate capability).</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(6);
        const ions = [];

        for (let i = 0; i < 26; i++) { ions.push({ x: rand(), y: rand(), v: 0.3 + rand() * 0.7 }); }

        function C(v) { return C0 * (0.35 + 0.65 / (1 + Math.pow(v / 60, 1.15))); }

        function update() {

            setVal(root, "v", state.v + " mV/s");
            out(root, "v", state.v + " mV/s");
            out(root, "c", C(state.v).toFixed(0) + " mF");
            out(root, "keep", Math.round(C(state.v) / C(1) * 100) + " %");
            out(root, "verdict", state.v < 20 ? "Slow scan: ions have time to reach deep pores" : state.v < 100 ? "Medium: the deepest pores start to lag" : "Fast scan: only outer surfaces respond");

            seenFast[state.v < 10 ? "slow" : state.v > 300 ? "fast" : "mid"] = true;

            if (seenFast.slow && seenFast.fast) {
                F.reward("supercap-cvrate", 10, "You compared slow and fast scans");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            // electrode cutaway on the left
            const x0 = 30;
            const w0 = 300;
            const top = 40;
            const depth = 220;
            const reach = C(state.v) / C(1);

            ctx.fillStyle = GREY + ".5)";
            ctx.fillRect(x0, top, w0, depth);

            const pores = 5;

            for (let p = 0; p < pores; p++) {

                const px = x0 + 20 + p * 56;

                ctx.fillStyle = "rgba(14,22,48,1)";
                ctx.fillRect(px, top, 26, depth - 20);

                // ions fill from the top as far as the reach allows
                const fill = (depth - 20) * reach;

                ctx.fillStyle = ROSE + ".85)";

                for (let k = 0; k < fill / 16; k++) {
                    dot(ctx, px + 13, top + 10 + k * 16, 5, ROSE + ".9)");
                }
            }

            txt(ctx, "porous electrode", x0 + w0 / 2, top - 14, 13, TEXT + ".8)");
            txt(ctx, "ions reach " + Math.round(reach * 100) + " % of the depth", x0 + w0 / 2, top + depth + 24, 13, ROSE + "1)");

            // chart on the right
            const cx0 = 390;
            const cy0 = 40;
            const cw = 260;
            const ch = 220;

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx0, cy0); ctx.lineTo(cx0, cy0 + ch); ctx.lineTo(cx0 + cw, cy0 + ch);
            ctx.stroke();

            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            const lx = function (v) { return cx0 + Math.log10(v) / Math.log10(500) * cw; };
            const ly = function (c) { return cy0 + ch - (c / C0) * ch; };

            for (let i = 0; i <= 60; i++) {

                const v = Math.pow(500, i / 60);

                if (i === 0) { ctx.moveTo(lx(v), ly(C(v))); } else { ctx.lineTo(lx(v), ly(C(v))); }
            }

            ctx.stroke();

            dot(ctx, lx(state.v), ly(C(state.v)), 7, GOLD + "1)");
            txt(ctx, "scan rate (log) →", cx0 + cw / 2, cy0 + ch + 28, 12, TEXT + ".75)");
            txt(ctx, "capacitance", cx0 + 40, cy0 - 12, 12, TEXT + ".75)");
            [1, 10, 100].forEach(function (v) { txt(ctx, v, lx(v), cy0 + ch + 14, 11, TEXT + ".6)"); });

            ions.forEach(function (i) { i; });
        }

        animate(root, function () { draw(); });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-bvalue"] = function (root) {

        const defaults = { kind: "dl" };
        const state = { kind: "dl" };
        const bs = { dl: 1.0, ps: 0.8, bt: 0.5 };
        const seen = {};
        const rates = [1, 2, 5, 10, 20, 50, 100];

        root.innerHTML =
            head("Try it: the b-value fingerprint") +
            art("0 0 340 210", "A log-log plot of peak current against scan rate. Points for a capacitive material lie on a line of slope one, a diffusion-limited material on a line of slope one half.") +
            '<div class="fd-stat-row">' + stat("Fitted b", "b") + stat("What it means", "mean") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Material", "kind", [["dl", "Double-layer carbon"], ["ps", "Pseudocapacitive oxide"], ["bt", "Battery-like material"]]) +
            '<p class="fd-sim-formula">i = a · v<sup>b</sup>. On log–log axes the slope is b: near 1 means capacitive, near 0.5 means diffusion-limited, in between means a mix.</p>';

        const svg = root.querySelector("svg");
        const rand = mulberry(12);
        const noise = rates.map(function () { return 1 + (rand() - 0.5) * 0.12; });

        function update() {

            const b = bs[state.kind];

            seen[state.kind] = true;

            const pts = rates.map(function (v, i) { return [Math.log10(v), Math.log10(2 * Math.pow(v, b) * noise[i])]; });

            // least squares slope
            const n = pts.length;
            const sx = pts.reduce(function (a, p) { return a + p[0]; }, 0);
            const sy = pts.reduce(function (a, p) { return a + p[1]; }, 0);
            const sxx = pts.reduce(function (a, p) { return a + p[0] * p[0]; }, 0);
            const sxy = pts.reduce(function (a, p) { return a + p[0] * p[1]; }, 0);
            const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
            const icpt = (sy - slope * sx) / n;

            const X = function (lv) { return 40 + lv / 2 * 260; };
            const Y = function (li) { return 180 - (li + 0.2) / 2.8 * 150; };

            let s = rect(40, 30, 260, 150, "rgba(6,10,24,.55)", "rgba(170,179,207,.35)");

            [0, 1, 2].forEach(function (e) {

                s += label(X(e), 192, "10" + (e === 0 ? "⁰" : e === 1 ? "¹" : "²"), 7, "middle", "var(--muted)");
            });

            s += label(170, 204, "scan rate v (log) →", 7, "middle", "var(--muted)");
            s += label(40, 22, "peak current i (log)", 7, "start", "var(--muted)");

            s += '<line x1="' + X(0) + '" y1="' + Y(icpt) + '" x2="' + X(2) + '" y2="' + Y(icpt + slope * 2) + '" style="stroke:#54e0c7;stroke-width:1.5"/>';

            pts.forEach(function (p) { s += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="3.2" style="fill:#ffd666"/>'; });

            svg.innerHTML = s;

            out(root, "b", slope.toFixed(2));
            out(root, "mean", slope > 0.9 ? "capacitive, surface-controlled" : slope > 0.65 ? "a mix of surface and diffusion" : "diffusion-limited, battery-like");
            out(root, "verdict", slope > 0.9 ? "Slope near 1: the current scales with v" : slope > 0.65 ? "Slope in between: partly surface, partly bulk" : "Slope near 0.5: the √v of the Randles-Ševčík equation");

            if (seen.dl && seen.ps && seen.bt) {
                F.reward("supercap-bvalue", 10, "You read all three b-value fingerprints");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 27: CHARGE-DISCHARGE CURVES
    ====================================== */

    SIMS["supercap-gcd"] = function (root) {

        const defaults = { i: 1, c: 2, esr: 0.2, eff: 100 };
        const state = { i: 1, c: 2, esr: 0.2, eff: 100 };
        const VMAX = 2.7;
        let trace = [];
        let phase = 0;
        let rewarded = false;

        root.innerHTML =
            head("Try it: a constant-current charge and discharge") +
            canvasFor(root, 680, 320, "A voltage-versus-time triangle for constant-current cycling. A resistance gives a sudden drop at the start of discharge, and charge losses make discharge shorter than charge.") +
            '<div class="fd-stat-row">' + stat("Capacitance (I·Δt/ΔV)", "c") + stat("ESR (drop ÷ 2I)", "r") + stat("Coulombic efficiency", "eta") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Current", key: "i", min: 0.2, max: 2, step: 0.1, value: 1 }) +
            slider({ label: "Capacitance", key: "c", min: 0.5, max: 5, step: 0.5, value: 2 }) +
            slider({ label: "Series resistance (ESR)", key: "esr", min: 0, max: 0.5, step: 0.05, value: 0.2 }) +
            slider({ label: "Charge that comes back (side reactions steal the rest)", key: "eff", min: 80, max: 100, step: 1, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">C = I·Δt ÷ ΔV on discharge, leaving out the initial drop. ESR ≈ ΔV<sub>drop</sub> ÷ (2I). Coulombic efficiency η = t<sub>discharge</sub> ÷ t<sub>charge</sub>.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const L = 60;
        const R = 650;
        const T = 20;
        const B = 270;

        let m = { c: 0, esr: 0, eta: 0 };

        function simulate() {

            trace = [];

            let vc = 0;
            let t = 0;
            const dt = (state.c * VMAX / state.i) / 500;
            let mode = "charge";
            let tc = 0;
            let td = 0;
            let cycles = 0;
            let dropSeen = 0;
            let vTop = 0;
            let vEnd = 0;
            let tcLast = 0;
            let tdLast = 0;

            while (cycles < 3 && t < 3000) {

                const eff = state.eff / 100;

                if (mode === "charge") {

                    vc += (state.i * eff / state.c) * dt;

                    const vt = vc + state.i * state.esr;

                    trace.push([t, vt, "c"]);
                    tc += dt;

                    if (vt >= VMAX) {

                        mode = "discharge";
                        tcLast = tc;
                        tc = 0;
                        td = 0;
                        vTop = vt;
                    }

                } else {

                    vc -= (state.i / state.c) * dt;

                    const vt = vc - state.i * state.esr;

                    trace.push([t, Math.max(0, vt), "d"]);
                    td += dt;

                    if (vt <= 0 || vc <= 0) {

                        mode = "charge";
                        tdLast = td;
                        vEnd = Math.max(0, vt);
                        cycles++;
                        vc = Math.max(0, vc);
                    }
                }

                t += dt;
            }

            const drop = 2 * state.i * state.esr;
            const dV = VMAX - state.i * state.esr * 2;

            m.esr = state.esr;
            m.c = state.i * tdLast / Math.max(0.01, vTop - 2 * state.i * state.esr);
            m.eta = tcLast ? tdLast / tcLast : 1;

            dropSeen;
            drop;
            dV;
            vEnd;
        }

        function update() {

            setVal(root, "i", state.i.toFixed(1) + " A");
            setVal(root, "c", state.c.toFixed(1) + " F");
            setVal(root, "esr", state.esr.toFixed(2) + " Ω");
            setVal(root, "eff", state.eff + " %");
            phase = 0;
            simulate();

            out(root, "c", m.c.toFixed(1) + " F");
            out(root, "r", (m.esr).toFixed(2) + " Ω");
            out(root, "eta", Math.round(m.eta * 100) + " %");
            out(root, "verdict", state.eff < 96 ? "Discharge is shorter than charge: charge is being lost" :
                state.esr > 0.3 ? "A big sudden drop at the start of discharge: resistance" :
                    "A clean, symmetric triangle: ideal double-layer behavior");

            if (!rewarded && state.esr >= 0.4 && state.eff <= 90) {

                rewarded = true;
                F.reward("supercap-gcd", 10, "You made a lossy, resistive curve and read it");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            const tEnd = trace.length ? trace[trace.length - 1][0] : 1;
            const X = function (t) { return L + t / tEnd * (R - L); };
            const Y = function (v) { return B - v / 3 * (B - T); };

            [0, 1, 2, 3].forEach(function (v) { txt(ctx, v + " V", L - 22, Y(v) + 4, 12, TEXT + ".7)"); });
            txt(ctx, "time →", (L + R) / 2, B + 36, 13, TEXT + ".8)");

            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            trace.forEach(function (p, i) { if (i === 0) { ctx.moveTo(X(p[0]), Y(p[1])); } else { ctx.lineTo(X(p[0]), Y(p[1])); } });

            ctx.stroke();

            // the dot
            if (trace.length) {

                const k = Math.min(trace.length - 1, Math.floor(phase * (trace.length - 1)));
                const p = trace[k];

                dot(ctx, X(p[0]), Y(p[1]), 7, GOLD + "1)");
                txt(ctx, p[2] === "c" ? "charging at constant current" : "discharging at constant current", (L + R) / 2, T + 14, 13, GOLD + "1)", "center", true);
            }
        }

        animate(root, function (dt) {

            phase = (phase + dt * 0.18) % 1;
            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-gcdread"] = quiz(
        "Game: what does that feature mean?",
        ["Ideal double layer", "Series resistance (IR drop)", "Redox reactions", "Charge being lost"],
        [
            { q: "A straight, symmetric triangle.", a: "Ideal double layer", why: "Voltage ramps linearly at constant current." },
            { q: "A sudden drop as discharge begins.", a: "Series resistance (IR drop)", why: "ESR ≈ voltage drop ÷ 2I." },
            { q: "Curved or plateau sections.", a: "Redox reactions", why: "Pseudocapacitive or battery-like reactions." },
            { q: "Discharge is shorter than charge.", a: "Charge being lost", why: "Coulombic efficiency is below 100 %." },
            { q: "Dividing the drop by twice the current gives the resistance.", a: "Series resistance (IR drop)", why: "That is how ESR is read directly." },
            { q: "The curve bends or flattens instead of being a straight line.", a: "Redox reactions", why: "A straight line means purely capacitive." },
            { q: "Side reactions or leakage are eating the charge.", a: "Charge being lost", why: "Efficiency drops below 100 %." }
        ],
        6,
        "supercap-gcdread-done",
        "You can read a GCD curve",
        "Triangle, drop, plateau, shortfall: you can read them all.",
        "Straight triangle means capacitor; drop means resistance; plateau means redox; shortfall means lost charge. Hit Reset to try again."
    );


    /* ======================================
       UNIT 28: IMPEDANCE
    ====================================== */

    SIMS["supercap-nyquist"] = function (root) {

        const defaults = { rs: 1, rct: 6, sig: 3 };
        const state = { rs: 1, rct: 6, sig: 3 };
        const CL = 0.1;
        const CDL = 20e-6;
        let phase = 0;
        let pts = [];
        let rewarded = false;

        root.innerHTML =
            head("Try it: build a Nyquist plot") +
            canvasFor(root, 680, 340, "A Nyquist plot with real impedance across and imaginary impedance up. At high frequency there is an intercept on the axis, then a semicircle, a 45 degree diffusion line, and finally a near-vertical capacitive line.") +
            '<div class="fd-stat-row">' + stat("ESR (high-frequency intercept)", "esr") + stat("Time constant τ ≈ R·C", "tau") + stat("Knee frequency", "knee") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Series resistance (shifts the plot sideways)", key: "rs", min: 0.1, max: 5, step: 0.1, value: 1 }) +
            slider({ label: "Charge-transfer resistance (semicircle size)", key: "rct", min: 0, max: 10, step: 0.5, value: 6 }) +
            slider({ label: "Diffusion (length of the 45° line)", key: "sig", min: 0, max: 6, step: 0.5, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">Each frequency is one point (here 100 kHz to 50 mHz). Resistance moves the plot sideways; capacitance lifts it upward. τ ≈ R·C sets the knee: below it the device acts like a capacitor.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function impedance(f) {

            const w = 2 * Math.PI * f;
            const sq = Math.sqrt(w);
            // Warburg element
            let zr = state.rct + state.sig / sq;
            let zi = -state.sig / sq;
            // parallel with the double-layer capacitance: 1 / (jwC + 1 / Z)
            const mag = zr * zr + zi * zi || 1e-12;
            let yr = zr / mag;
            let yi = -zi / mag + w * CDL;
            const ym = yr * yr + yi * yi;
            const ar = yr / ym;
            const ai = -yi / ym;
            // series with Rs and the big capacitance
            const re = state.rs + ar;
            const im = ai - 1 / (w * CL);

            return [re, -im];
        }

        function compute() {

            pts = [];

            for (let i = 0; i <= 120; i++) {

                const f = 1e5 * Math.pow(5e-7, i / 120);
                const z = impedance(f);

                pts.push([f, z[0], z[1]]);
            }
        }

        function update() {

            setVal(root, "rs", state.rs.toFixed(1) + " Ω");
            setVal(root, "rct", state.rct.toFixed(1) + " Ω");
            setVal(root, "sig", state.sig.toFixed(1));
            compute();

            const R = state.rs + state.rct;
            const tau = Math.max(R, 0.05) * CL;
            const knee = 1 / (2 * Math.PI * tau);

            out(root, "esr", state.rs.toFixed(1) + " Ω");
            out(root, "tau", tau.toFixed(2) + " s");
            out(root, "knee", knee >= 1 ? knee.toFixed(2) + " Hz" : (knee * 1000).toFixed(0) + " mHz");
            out(root, "verdict", "Low resistance: a small τ, so it keeps up with fast loads. High resistance: a slow knee.");

            if (!rewarded && state.rs <= 0.3 && state.rct <= 1) {

                rewarded = true;
                F.reward("supercap-nyquist", 10, "You built a fast, low-resistance Nyquist plot");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const L = 70;
            const T = 20;
            const B = 290;
            const maxIm = 40;
            const sc = (B - T) / maxIm;

            const X = function (re) { return L + re * sc; };
            const Y = function (im) { return B - im * sc; };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(650, B);
            ctx.stroke();

            for (let v = 0; v <= 30; v += 10) {

                txt(ctx, v, L - 16, Y(v) + 4, 11, TEXT + ".65)");
                txt(ctx, v, X(v), B + 16, 11, TEXT + ".65)");
            }

            txt(ctx, "Z′ (Ω) →", 360, B + 34, 13, TEXT + ".85)");
            ctx.save();
            ctx.translate(20, (T + B) / 2);
            ctx.rotate(-Math.PI / 2);
            txt(ctx, "−Z″ (Ω) →", 0, 0, 13, TEXT + ".85)");
            ctx.restore();

            ctx.lineWidth = 3;
            ctx.beginPath();

            pts.forEach(function (p, i) {

                if (i === 0) { ctx.moveTo(X(p[1]), Y(p[2])); } else { ctx.lineTo(X(p[1]), Y(p[2])); }
            });

            ctx.strokeStyle = TEAL + ".95)";
            ctx.stroke();

            // the scanning dot
            const k = Math.min(pts.length - 1, Math.floor(phase * (pts.length - 1)));
            const p = pts[k];

            dot(ctx, X(p[1]), Y(p[2]), 7, GOLD + "1)");

            const f = p[0];

            txt(ctx, (f >= 1000 ? (f / 1000).toFixed(0) + " kHz" : f >= 1 ? f.toFixed(0) + " Hz" : (f * 1000).toFixed(0) + " mHz"), X(p[1]) + 50, Y(p[2]) - 10, 13, GOLD + "1)", "center", true);

            // zone labels
            txt(ctx, "ESR", X(state.rs), B - 14, 12, ROSE + "1)", "center", true);

            const zone = f > 3000 ? "resistance" : f > 30 ? "charge transfer" : f > 0.4 ? "ions diffusing" : "capacitor";

            txt(ctx, "now: " + zone, 520, T + 20, 14, GOLD + "1)", "center", true);
        }

        animate(root, function (dt) {

            phase = (phase + dt * 0.12) % 1;
            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-nyquistparts"] = quiz(
        "Game: read the Nyquist plot",
        ["High-frequency intercept (ESR)", "Semicircle (charge transfer)", "45° line (diffusion)", "Near-vertical line (capacitive)"],
        [
            { q: "Series resistance from the electrolyte, contacts and electrodes.", a: "High-frequency intercept (ESR)", why: "It is where the plot meets the real axis." },
            { q: "The resistance of charge crossing the electrode interface.", a: "Semicircle (charge transfer)", why: "It is the diameter of the semicircle." },
            { q: "Ions diffusing into pores or the bulk.", a: "45° line (diffusion)", why: "This is the Warburg region." },
            { q: "Ideal capacitor behavior at low frequency.", a: "Near-vertical line (capacitive)", why: "An ideal capacitor is a vertical line." },
            { q: "Adding series resistance slides the whole plot sideways. Which feature moves most obviously?", a: "High-frequency intercept (ESR)", why: "The intercept shifts to the right." },
            { q: "Where the 45° region turns into the vertical line gives the knee frequency.", a: "Near-vertical line (capacitive)", why: "Below the knee the device acts like a capacitor." }
        ],
        5,
        "supercap-nyquistparts-done",
        "You can read a Nyquist plot",
        "Intercept, semicircle, diffusion line, vertical line: all identified.",
        "Read left to right: ESR, charge transfer, diffusion, capacitor. Hit Reset to try again."
    );


    /* ======================================
       UNIT 29: ENERGY, POWER, NORMALIZATION
    ====================================== */

    SIMS["supercap-denominator"] = quiz(
        "Game: pick the denominator",
        ["Gravimetric (per gram)", "Volumetric (per cm³)", "Areal (per cm²)"],
        [
            { q: "Common for bulk cells and material studies: F/g, Wh/kg.", a: "Gravimetric (per gram)", why: "Mass is the usual yardstick for bulk cells." },
            { q: "Matters when space is tight: F/cm³, Wh/L.", a: "Volumetric (per cm³)", why: "Volume counts when the box is fixed." },
            { q: "The right measure for an on-chip micro device: mF/cm², µWh/cm².", a: "Areal (per cm²)", why: "The footprint is what you pay for." },
            { q: "A tiny sensor must fit a fixed footprint on a circuit board.", a: "Areal (per cm²)", why: "Footprint is the constraint." },
            { q: "A pack must fit inside a cramped compartment.", a: "Volumetric (per cm³)", why: "Space is the constraint." },
            { q: "A vehicle is limited by how much weight it can carry.", a: "Gravimetric (per gram)", why: "Mass is the constraint." }
        ],
        5,
        "supercap-denominator-done",
        "You pick the right denominator",
        "Match the denominator to the constraint of the application.",
        "Per gram for weight limits, per cm³ for space limits, per cm² for footprint limits. Hit Reset to try again."
    );


    SIMS["supercap-traps"] = quiz(
        "Game: spot the inflated number",
        ["Fair", "Inflated"],
        [
            { q: "A paper quotes F/g using only the active material's mass, ignoring collectors, separator, electrolyte and packaging.", a: "Inflated", why: "A real device weighs much more." },
            { q: "A device is reported per area, with the scan rate and normalization stated.", a: "Fair", why: "Method, rate and denominator are all there." },
            { q: "A thin film with tiny active mass is quoted in F/g.", a: "Inflated", why: "A tiny mass makes per-gram values look huge." },
            { q: "A single-electrode value from a three-electrode cell is presented as the device's.", a: "Inflated", why: "A symmetric full cell may deliver about a quarter of it." },
            { q: "Capacitance is shown at several scan rates, with the full range reported.", a: "Fair", why: "Rate capability gives the whole picture." },
            { q: "F/g, mF/cm² and F/cm³ numbers are ranked in one table.", a: "Inflated", why: "Different denominators cannot be compared." }
        ],
        5,
        "supercap-traps-done",
        "You can spot inflated claims",
        "A number without its denominator is not a result.",
        "Check the mass counted, the cell type, the rate and the units. Hit Reset to try again."
    );


    SIMS["supercap-ragonebuild"] = function (root) {

        const defaults = { i: 1 };
        const state = { i: 1 };
        const C = 10;
        const V = 2.7;
        const ESR = 0.1;
        const MASS = 5; // g
        let points = [];
        let rewarded = false;

        root.innerHTML =
            head("Try it: build your own Ragone plot") +
            art("0 0 340 220", "A log-log Ragone plot being built from charge-discharge runs at different currents. Higher current gives higher power but lower energy, so the points slope downward to the right.") +
            '<div class="fd-stat-row">' + stat("This run: energy density", "e") + stat("This run: power density", "p") + stat("Runs plotted", "n") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-run>▶ Run charge–discharge at this current</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Discharge current", key: "i", min: 0.1, max: 10, step: 0.1, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">Test device: 10 F, 2.7 V, 0.1 Ω, 5 g (illustrative). Run GCD at several currents; at each one compute energy and power; plot energy against power on log-log axes.</p>';

        const svg = root.querySelector("svg");

        function calc(I) {

            const Vd = I * ESR;
            const E = 0.5 * C * (V - Vd) * Math.max(0, V - 2 * Vd);
            const P = I * (V - Vd) / 2;

            return { e: E / 3600 / MASS * 1000, p: P / MASS * 1000 };
        }

        function render() {

            const cur = calc(state.i);

            setVal(root, "i", state.i.toFixed(1) + " A");
            out(root, "e", cur.e.toFixed(2) + " Wh/kg");
            out(root, "p", Math.round(cur.p) + " W/kg");
            out(root, "n", points.length);

            const X = function (p) { return 44 + (Math.log10(p) - 1) / 3.5 * 270; };
            const Y = function (e) { return 190 - (Math.log10(e) + 1.7) / 2.2 * 160; };

            let s = rect(44, 30, 270, 160, "rgba(6,10,24,.55)", "rgba(170,179,207,.35)");

            [1, 2, 3, 4].forEach(function (k) { s += label(X(Math.pow(10, k)), 202, "10" + (k === 1 ? "¹" : k === 2 ? "²" : k === 3 ? "³" : "⁴"), 7, "middle", "var(--muted)"); });
            [-1, 0, 1].forEach(function (k) { s += label(40, Y(Math.pow(10, k)) + 2.5, "10" + (k === -1 ? "⁻¹" : k === 0 ? "⁰" : "¹"), 7, "end", "var(--muted)"); });

            s += label(179, 214, "power density (W/kg) →", 7, "middle", "var(--muted)");
            s += label(44, 22, "energy density (Wh/kg)", 7, "start", "var(--muted)");

            const sorted = points.slice().sort(function (a, b) { return a.p - b.p; });

            if (sorted.length > 1) {

                s += '<polyline points="' + sorted.map(function (q) { return X(q.p).toFixed(1) + "," + Y(q.e).toFixed(1); }).join(" ") + '" style="fill:none;stroke:#54e0c7;stroke-width:1.4"/>';
            }

            sorted.forEach(function (q) { s += '<circle cx="' + X(q.p) + '" cy="' + Y(q.e) + '" r="3.6" style="fill:#ffd666"/>'; });
            s += '<circle cx="' + X(cur.p) + '" cy="' + Y(cur.e) + '" r="4.6" style="fill:none;stroke:#fff;stroke-width:1.4"/>';

            svg.innerHTML = s;

            out(root, "verdict", points.length < 3 ? "Run a few different currents to trace the curve" : "Higher power, lower energy: the trade-off of your own device");

            if (points.length >= 5 && !rewarded) {

                rewarded = true;
                F.reward("supercap-ragonebuild", 10, "You built a Ragone plot from your own runs");
            }
        }

        wire(root, state, defaults, render);

        root.querySelector("[data-run]").addEventListener("click", function () {

            const c = calc(state.i);

            if (!points.some(function (q) { return Math.abs(q.p - c.p) < 0.5; })) { points.push(c); }

            render();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () { points = []; });

        render();
    };


    /* ======================================
       UNIT 30: STABILITY AND HONEST REPORTING
    ====================================== */

    SIMS["supercap-cyclelife"] = function (root) {

        const defaults = { kind: "edlc" };
        const state = { kind: "edlc" };
        const tried = {};
        let cycles = 0;

        const tau = { edlc: 4e6, pseudo: 8000, hybrid: 60000 };
        const names = { edlc: "Double-layer carbon", pseudo: "Polymer pseudocapacitor", hybrid: "Hybrid" };

        root.innerHTML =
            head("Try it: when does a device reach end of life?") +
            canvasFor(root, 680, 320, "A capacitance retention curve falling with the number of cycles, with an end-of-life line at 80 percent of the starting capacitance.") +
            '<div class="fd-stat-row">' + stat("Cycles run", "n") + stat("Capacitance left", "ret") + stat("Status", "st") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Device", "kind", [["edlc", "Double-layer carbon"], ["pseudo", "Polymer pseudocapacitor"], ["hybrid", "Hybrid"]]) +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-ff="1000">⏩ +1,000 cycles</button><button type="button" class="fd-sim-btn" data-ff="10000">⏩ +10,000</button><button type="button" class="fd-sim-btn" data-ff="100000">⏩ +100,000</button></div>' +
            '<p class="fd-sim-formula">A common end of life is a 20 % loss of capacitance or a doubling of ESR. Long-life claims need thousands of cycles, not a few hundred. (Illustrative curves.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function ret(n) { return Math.exp(-n / tau[state.kind]); }

        function update() {

            const r = ret(cycles);

            out(root, "n", cycles.toLocaleString());
            out(root, "ret", Math.round(r * 100) + " %");
            out(root, "st", r > 0.8 ? "healthy" : "end of life");
            out(root, "verdict", r > 0.8 ? names[state.kind] + ": still above the 80 % line" : names[state.kind] + " passed its end-of-life line");

            if (r <= 0.8) { tried[state.kind] = true; }
            if (cycles >= 1e5 && state.kind === "edlc" && ret(cycles) > 0.8) { tried.edlc = true; }

            if (tried.edlc && tried.pseudo) {
                F.reward("supercap-cyclelife", 10, "You compared cycle life across devices");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 270;
            const maxN = Math.max(1000, Math.pow(10, Math.ceil(Math.log10(Math.max(cycles, 1000)))));
            const X = function (n) { return L + Math.log10(Math.max(n, 1)) / Math.log10(maxN) * (R - L); };
            const Y = function (r) { return B - (r - 0.4) / 0.6 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0.5, 0.8, 1].forEach(function (r) { txt(ctx, Math.round(r * 100) + " %", L - 24, Y(r) + 4, 12, TEXT + ".7)"); });

            for (let k = 1; Math.pow(10, k) <= maxN; k++) {
                txt(ctx, "10" + String(k).split("").map(function (c) { return "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]; }).join(""), X(Math.pow(10, k)), B + 18, 12, TEXT + ".7)");
            }

            txt(ctx, "cycles (log scale) →", (L + R) / 2, B + 38, 13, TEXT + ".85)");

            ctx.strokeStyle = ROSE + ".8)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y(0.8)); ctx.lineTo(R, Y(0.8));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "end of life (80 %)", R - 70, Y(0.8) - 8, 12, ROSE + "1)");

            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 2.8;
            ctx.beginPath();

            for (let i = 0; i <= 80; i++) {

                const n = Math.pow(maxN, i / 80);

                if (i === 0) { ctx.moveTo(X(n), Y(ret(n))); } else { ctx.lineTo(X(n), Y(ret(n))); }
            }

            ctx.stroke();

            dot(ctx, X(cycles), Y(ret(cycles)), 7, GOLD + "1)");
        }

        root.querySelectorAll("[data-ff]").forEach(function (b) {

            b.addEventListener("click", function () {

                cycles += parseInt(b.dataset.ff, 10);
                update();
                draw();
            });
        });

        wire(root, state, defaults, function () {

            cycles = 0;
            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-selfdis"] = function (root) {

        const defaults = { ohm: 0, far: 0, red: 1, t: 12 };
        const state = { ohm: 0, far: 0, red: 1, t: 12 };
        const V0 = 2.7;
        const WAKE = 1.8;
        let rewarded = false;

        root.innerHTML =
            head("Try it: how fast does a charged device sag?") +
            canvasFor(root, 680, 320, "The open-circuit voltage of a charged supercapacitor falling over hours. Each leakage mechanism you switch on makes the decline faster. A line marks the voltage below which a sensor node would fail to wake.") +
            '<div class="fd-stat-row">' + stat("Voltage after the chosen time", "v") + stat("Time until it drops below the wake-up voltage", "tw") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Ohmic leakage (through the separator)", "ohm", [[0, "off"], [1, "on"]]) +
            seg("Faradaic leakage (impurities, redox species)", "far", [[0, "off"], [1, "on"]]) +
            seg("Charge redistribution into deep pores", "red", [[0, "off"], [1, "on"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Time at rest", key: "t", min: 1, max: 72, step: 1, value: 12 }) +
            "</div>" +
            '<p class="fd-sim-formula">Redox-active electrolytes and very high voltages tend to speed up self-discharge. Fast delivery is only half the story: holding the charge matters too. (Illustrative decay.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function volt(t) {

            let v = V0;

            if (state.red) { v -= 0.2 * (1 - Math.exp(-t / 1.2)); }
            if (state.ohm) { v *= Math.exp(-t / 120); }
            if (state.far) { v -= 0.035 * t + 0.2 * (1 - Math.exp(-t / 5)); }

            return Math.max(0, v);
        }

        function update() {

            setVal(root, "t", state.t + " h");

            const v = volt(state.t);
            let tw = null;

            for (let t = 0; t <= 200; t += 0.25) {

                if (volt(t) < WAKE) { tw = t; break; }
            }

            out(root, "v", v.toFixed(2) + " V");
            out(root, "tw", tw === null ? "more than 200 h" : tw.toFixed(0) + " h");
            out(root, "verdict", tw === null ? "Holds its charge for a long time" : tw < 24 ? "Dies within a day: too leaky for a sensor that wakes once a day" : "Lasts days: fine for many sensor nodes");

            if (!rewarded && state.ohm && state.far) {

                rewarded = true;
                F.reward("supercap-selfdis", 10, "You saw how leakage drains a supercapacitor");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (t) { return L + t / 72 * (R - L); };
            const Y = function (v) { return B - v / 3 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 1, 2, 3].forEach(function (v) { txt(ctx, v + " V", L - 24, Y(v) + 4, 12, TEXT + ".7)"); });
            [0, 24, 48, 72].forEach(function (t) { txt(ctx, t + " h", X(t), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "time at open circuit →", (L + R) / 2, B + 38, 13, TEXT + ".85)");

            ctx.strokeStyle = ROSE + ".8)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y(WAKE)); ctx.lineTo(R, Y(WAKE));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "sensor wake-up limit (1.8 V)", R - 110, Y(WAKE) + 18, 12, ROSE + "1)");

            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 2.8;
            ctx.beginPath();

            for (let t = 0; t <= 72; t += 0.5) {

                if (t === 0) { ctx.moveTo(X(t), Y(volt(t))); } else { ctx.lineTo(X(t), Y(volt(t))); }
            }

            ctx.stroke();

            dot(ctx, X(state.t), Y(volt(state.t)), 7, GOLD + "1)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-redflags"] = quiz(
        "Game: which test backs the claim?",
        ["Two-electrode cell", "GCD at several currents", "Thousands of cycles", "Open-circuit rest", "Nyquist intercept and IR drop"],
        [
            { q: "A claim about a finished device's performance.", a: "Two-electrode cell", why: "Device claims need a device-level test." },
            { q: "Energy and power across the operating range, on a Ragone plot.", a: "GCD at several currents", why: "One point is not a range." },
            { q: "A lifetime claim.", a: "Thousands of cycles", why: "Retention and coulombic efficiency over thousands of cycles." },
            { q: "How long the device holds a charge.", a: "Open-circuit rest", why: "Self-discharge is measured at open circuit." },
            { q: "How much resistance the device has.", a: "Nyquist intercept and IR drop", why: "Two ways to read ESR." },
            { q: "A paper only shows the slowest scan rate. What should you ask for?", a: "GCD at several currents", why: "Rate capability across rates or currents." }
        ],
        5,
        "supercap-redflags-done",
        "You can match claims to tests",
        "Good results show the method, the rate, and the denominator.",
        "Match each claim to the test that would prove it. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="supercap-"]').forEach(F.mount);

})();
