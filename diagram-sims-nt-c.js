/* ========================================
   NEURAL INTERFACE CHIP: INTERACTIVE SIMULATORS, PART 3

   Unit 13: adding up signals.
   Unit 14: why measuring is hard.
   Unit 15: microdialysis.
   Unit 16: fast-scan cyclic voltammetry.
   Unit 17: light, transistors, and what's next.

   Registers on window.FabInteract; loaded by diagram-sims-nt.js.
   Teaching models: numbers and shapes are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers || !F.ntHelpers) {
        return;
    }

    const M = F.memsHelpers;
    const H = F.ntHelpers;
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
    const PURPLE = H.PURPLE;
    const canvasFor = H.canvasFor;
    const clear = H.clear;
    const txt = H.txt;
    const dot = H.dot;


    /* ======================================
       UNIT 13: ADDING UP SIGNALS
    ====================================== */

    SIMS["nt-epsp"] = function (root) {

        const defaults = {};
        const state = {};
        const REST = -70;
        const THR = -55;
        const hist = [];
        let v = REST;
        let t = 0;
        let spikeT = -9;
        let spikes = 0;
        let recent = [];
        let vetoed = false;
        let hit = false;

        root.innerHTML =
            head("Try it: tap inputs and watch the sum") +
            canvasFor(680, 300, "The voltage of a neuron over the last few seconds. Each excitatory input nudges the voltage up by a few millivolts and each inhibitory input nudges it down. The voltage drifts back to rest, but if several excitatory inputs arrive close together the sum crosses the threshold at minus 55 millivolts and the neuron fires a spike.") +
            '<div class="fd-stat-row">' + stat("Membrane voltage", "v") + stat("Distance to threshold", "d") + stat("Spikes fired", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-e>⬆️ Excitatory input (EPSP)</button><button type="button" class="fd-sim-btn" data-i>⬇️ Inhibitory input (IPSP)</button></div>' +
            '<p class="fd-sim-formula">An EPSP (excitatory postsynaptic potential) nudges the voltage toward threshold, and an IPSP nudges it away. One input is rarely enough, but inputs that arrive close together in time add up before they fade. The neuron is a tiny calculator. (Illustrative: +8 mV and −6 mV per input, decaying in about half a second.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function tap(d) {

            if (t - spikeT < 0.15) { return; }

            if (d < 0 && v > THR - 5) { vetoed = true; }

            v += d;
            recent.push({ t: t, d: d });
        }

        function fire() {

            spikes++;
            spikeT = t;
            v = REST - 4;
        }

        function update() {

            out(root, "v", Math.round(v) + " mV");
            out(root, "d", v >= THR ? "at threshold" : Math.round(THR - v) + " mV to go");
            out(root, "s", spikes);
            out(root, "verdict", t - spikeT < 0.4 ? "Threshold reached: the neuron fires a spike" : v > THR - 4 ? "Close to threshold: one more input could do it" : v < REST - 1 ? (t - spikeT < 2 ? "Just after a spike: briefly below rest while the cell recovers" : "Pulled below rest by inhibition") : v > REST + 2 ? "Depolarized, but not enough yet: the inputs are fading" : "At rest");

            if (!hit && spikes >= 1 && vetoed) {

                hit = true;
                F.reward("nt-epsp", 10, "You made a neuron fire, and saw inhibition hold it back");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 260;
            const Y = function (mv) { return B - (mv + 80) / 60 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [-70, -55, -20].forEach(function (mv) { txt(ctx, mv + "", L - 22, Y(mv) + 4, 11, TEXT + ".7)"); });

            ctx.strokeStyle = ROSE + ".7)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y(THR)); ctx.lineTo(R, Y(THR));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "threshold", R - 40, Y(THR) - 6, 12, ROSE + "1)", "center", true);
            txt(ctx, "rest", R - 20, Y(REST) + 16, 12, TEXT + ".7)", "center");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            hist.forEach(function (p, i) {

                const x = L + (p.t - (t - 6)) / 6 * (R - L);
                const y = Y(p.v);

                if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            });

            ctx.stroke();

            // markers for recent inputs
            recent.forEach(function (r) {

                const x = L + (r.t - (t - 6)) / 6 * (R - L);

                if (x > L) { txt(ctx, r.d > 0 ? "▲" : "▼", x, B + 18, 12, (r.d > 0 ? TEAL : ROSE) + "1)", "center", true); }
            });

            txt(ctx, "last 6 seconds →", (L + R) / 2, 292, 12, TEXT + ".75)");
        }

        animate(root, function (dt) {

            t += dt;

            const spiking = t - spikeT < 0.0;

            v = REST + (v - REST) * Math.exp(-dt / 0.55);

            if (v >= THR && t - spikeT > 0.15) { fire(); }

            const spikeV = t - spikeT < 0.12 ? 20 - (t - spikeT) * 300 : null;

            hist.push({ t: t, v: spikeV !== null ? spikeV : v });

            while (hist.length && hist[0].t < t - 6.2) { hist.shift(); }
            while (recent.length && recent[0].t < t - 6.2) { recent.shift(); }

            update();
            draw();
        });

        root.querySelector("[data-e]").addEventListener("click", function () { tap(8); });
        root.querySelector("[data-i]").addEventListener("click", function () { tap(-6); });

        wire(root, state, defaults, function () { update(); });

        update();
        draw();
    };


    SIMS["nt-summation"] = quiz(
        "Game: adding up in time and in space",
        ["Temporal summation", "Spatial summation"],
        [
            { q: "Inputs that arrive close together in time add up before they fade.", a: "Temporal summation", why: "Timing matters." },
            { q: "Inputs at different places on the cell add up at the cell body.", a: "Spatial summation", why: "Location matters." },
            { q: "One synapse fires three times in 10 milliseconds.", a: "Temporal summation", why: "Same place, close in time." },
            { q: "Three different synapses on different branches each fire once.", a: "Spatial summation", why: "Different places." }
        ],
        4,
        "nt-summation-done",
        "You can tell the two kinds of summation apart",
        "Real neurons use a mix of both.",
        "Time or place. Hit Reset to try again."
    );


    SIMS["nt-trigger"] = quiz(
        "Game: where does the spike start?",
        ["Axon initial segment", "Many synapses", "Voltage-gated sodium channels"],
        [
            { q: "A typical neuron receives thousands of these.", a: "Many synapses", why: "A lot of inputs." },
            { q: "Where the combined effect is read out: the first stretch of the axon.", a: "Axon initial segment", why: "The trigger point." },
            { q: "Packed densely there, so a spike starts if the sum reaches threshold.", a: "Voltage-gated sodium channels", why: "They open and make the spike." }
        ],
        3,
        "nt-trigger-done",
        "You know the trigger point",
        "The axon's first stretch is the trigger point.",
        "Many inputs, one trigger zone. Hit Reset to try again."
    );


    SIMS["nt-ltp"] = function (root) {

        const defaults = { reps: 0 };
        const state = { reps: 0 };
        let hit = false;
        let t = 0;

        root.innerHTML =
            head("Try it: practice strengthens a connection") +
            canvasFor(680, 300, "Two views of one synapse. On the left, a sending terminal and a receiving cell with a number of glutamate receptors. On the right, the size of the receiving cell's response to a single standard input. After many repeated bursts of activity, more receptors are in place and the response is larger.") +
            '<div class="fd-stat-row">' + stat("Receptors on the receiving cell", "r") + stat("Response to the same input", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Repeated bursts of activity", key: "reps", min: 0, max: 100, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Synapses are not fixed. Repeated activity can strengthen them, a process called long-term potentiation (LTP), and glutamate receptors are central to it. This is one cellular basis of learning and memory. The strength of each connection is itself a kind of memory. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function strength() { return 1 + 1.4 * (1 - Math.exp(-state.reps / 25)); }

        function update() {

            const s = strength();

            setVal(root, "reps", state.reps);
            out(root, "r", Math.round(4 * s));
            out(root, "s", "× " + s.toFixed(2));
            out(root, "verdict", state.reps < 5 ? "Naive synapse: a small response" : state.reps < 40 ? "Strengthening: more receptors, bigger response" : "Potentiated: the same input now gives a much bigger response");

            if (!hit && state.reps >= 60) {

                hit = true;
                F.reward("nt-ltp", 10, "You potentiated a synapse");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const s = strength();

            ctx.fillStyle = TEAL + ".5)";
            ctx.fillRect(40, 30, 280, 60);
            txt(ctx, "sending terminal", 180, 62, 13, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = PURPLE + ".5)";
            ctx.fillRect(40, 190, 280, 60);
            txt(ctx, "receiving cell", 180, 226, 13, "rgba(6,10,24,.95)", "center", true);

            const n = Math.round(4 * s);

            for (let i = 0; i < n; i++) {

                ctx.fillStyle = BLUE + ".95)";
                ctx.fillRect(56 + i * 28, 178, 18, 12);
            }

            for (let i = 0; i < 6; i++) { dot(ctx, 70 + i * 40 + Math.sin(t * 2 + i) * 4, 105 + (i % 3) * 18, 4.4, ROSE + ".95)"); }

            // response bars
            const x0 = 420;

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x0, 40); ctx.lineTo(x0, 250); ctx.lineTo(650, 250);
            ctx.stroke();

            ctx.fillStyle = GREY + ".6)";
            ctx.fillRect(x0 + 40, 250 - 60, 60, 60);
            ctx.fillStyle = TEAL + ".9)";
            ctx.fillRect(x0 + 140, 250 - 60 * s, 60, 60 * s);
            txt(ctx, "before", x0 + 70, 270, 12, TEXT + ".8)");
            txt(ctx, "now", x0 + 170, 270, 12, TEXT + ".8)");
            txt(ctx, "response to one input", x0 + 110, 30, 12, TEXT + ".85)");
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    /* ======================================
       UNIT 14: WHY MEASURING IS HARD
    ====================================== */

    SIMS["nt-challenge"] = quiz(
        "Game: what makes it hard?",
        ["Fast", "Small", "Dilute", "Crowded"],
        [
            { q: "A release event lasts about a millisecond.", a: "Fast", why: "Clearance takes milliseconds to seconds." },
            { q: "The cleft is tens of nanometers wide.", a: "Small", why: "And terminals are about a micrometer." },
            { q: "Baseline levels are often in the nanomolar range.", a: "Dilute", why: "Very little of it is there." },
            { q: "Many similar molecules are present at much higher levels.", a: "Crowded", why: "Selectivity is the problem." }
        ],
        4,
        "nt-challenge-done",
        "You know the four challenges",
        "A sensor must be fast, tiny, sensitive, and selective at once.",
        "Fast, small, dilute, crowded. Hit Reset to try again."
    );


    SIMS["nt-timescales"] = function (root) {

        const defaults = { ev: 0 };
        const state = { ev: 0 };
        const seen = {};
        let hit = false;

        const METHODS = [
            { n: "Fluorescent protein sensor", res: 0.01, c: TEAL },
            { n: "Voltammetry (FSCV)", res: 0.1, c: GOLD },
            { n: "Transistor (BioFET)", res: 0.1, c: BLUE },
            { n: "Microdialysis", res: 60, c: ROSE }
        ];

        root.innerHTML =
            head("Try it: can the tool keep up with the event?") +
            canvasFor(680, 320, "A log time axis from one millisecond to one hour. Four measuring tools are shown as bars starting at their time resolution, and a marker shows the duration of the chosen event. A tool can follow an event only if its resolution is shorter than the event, so tools to the right of the marker are too slow.") +
            '<div class="fd-stat-row">' + stat("Event lasts", "e") + stat("Tools that can follow it", "n") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How long the event lasts (log scale)", key: "ev", min: -3, max: 3.5, step: 0.05, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Different methods follow changes at very different speeds, and the slower ones average over many events. A tool resolves an event only if its time resolution is shorter than the event. A release event lasts about a millisecond, a burst about a second, and a baseline drift minutes. The method you choose sets the speed you can see. (Typical, approximate time resolutions.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function dur() { return Math.pow(10, state.ev); }

        function fmt(s) { return s < 0.1 ? Math.round(s * 1000) + " ms" : s < 1 ? Math.round(s * 1000) + " ms" : s < 60 ? s.toFixed(1) + " s" : s < 3600 ? (s / 60).toFixed(1) + " min" : (s / 3600).toFixed(1) + " h"; }

        function update() {

            const d = dur();
            const ok = METHODS.filter(function (m) { return m.res <= d; });

            seen[ok.length] = true;
            setVal(root, "ev", fmt(d));
            out(root, "e", fmt(d));
            out(root, "n", ok.length + " of 4");
            out(root, "verdict", ok.length === 0 ? "Too fast: none of these tools can follow it" : ok.length === 4 ? "Slow enough that every tool can follow it" : ok.length === 1 ? "Only the fastest tool can follow this" : "The slower tools average over it and miss it");

            if (!hit && seen[0] && seen[1] && seen[4]) {

                hit = true;
                F.reward("nt-timescales", 10, "You matched the tool to the timescale");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 190;
            const R = 650;
            const X = function (s) { return L + (Math.log10(s) + 3) / 6.5 * (R - L); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, 40); ctx.lineTo(L, 260); ctx.lineTo(R, 260);
            ctx.stroke();

            [[0.001, "1 ms"], [0.1, "0.1 s"], [1, "1 s"], [60, "1 min"], [3600, "1 h"]].forEach(function (g) {

                txt(ctx, g[1], X(g[0]), 280, 11, TEXT + ".7)");
                ctx.strokeStyle = GREY + ".18)";
                ctx.beginPath();
                ctx.moveTo(X(g[0]), 40); ctx.lineTo(X(g[0]), 260);
                ctx.stroke();
            });

            const d = dur();

            METHODS.forEach(function (m, i) {

                const y = 56 + i * 52;
                const can = m.res <= d;

                ctx.fillStyle = m.c + (can ? ".85)" : ".25)");
                ctx.fillRect(X(m.res), y, R - X(m.res), 26);
                txt(ctx, m.n, L - 8, y + 18, 12, TEXT + (can ? ".95)" : ".6)"), "end");
                txt(ctx, can ? "✓" : "✗", X(m.res) + 12, y + 19, 14, "rgba(6,10,24,.95)", "center", true);
            });

            ctx.strokeStyle = "rgba(255,255,255,.95)";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(X(d), 36); ctx.lineTo(X(d), 262);
            ctx.stroke();
            txt(ctx, "event", X(d), 30, 12, "rgba(255,255,255,1)", "center", true);
            txt(ctx, "time resolution (log scale) →", (L + R) / 2, 308, 12, TEXT + ".8)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-tonicphasic"] = function (root) {

        const defaults = { tool: "fast" };
        const state = { tool: "fast" };
        const seen = {};
        const rand = mulberry(21);
        const N = 240;
        const data = [];
        let hit = false;

        for (let i = 0; i < N; i++) {

            const x = i / N * 120;
            let y = 0.35 + 0.15 * Math.sin(x / 38) + (rand() - 0.5) * 0.02;

            [[30, 0.5], [68, 0.7], [97, 0.55]].forEach(function (b) {

                const dx = x - b[0];

                if (dx > 0) { y += b[1] * Math.exp(-dx / 1.1) * (1 - Math.exp(-dx / 0.12)); }
            });

            data.push(y);
        }

        root.innerHTML =
            head("Try it: the baseline or the bursts?") +
            canvasFor(680, 300, "A two-minute trace of a neurotransmitter level. The true signal has a slow drifting baseline, which is the tonic level, plus three fast bursts lasting about a second, which are the phasic events. A fast tool follows the bursts; a slow tool that averages over a minute shows only the drifting baseline.") +
            '<div class="fd-stat-row">' + stat("Tonic baseline visible", "t") + stat("Phasic bursts visible", "p") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Measuring with", "tool", [["fast", "A fast tool (0.1 s)"], ["slow", "A slow tool (1-minute samples)"]]) +
            '<p class="fd-sim-formula">Tonic levels are slow background levels that drift over minutes. Phasic signals are fast bursts lasting about a second or less, often tied to a stimulus or reward. A good experiment may need to see both. Some methods see the baseline well, others see the bursts. (Illustrative trace.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            seen[state.tool] = true;
            out(root, "t", "yes");
            out(root, "p", state.tool === "fast" ? "yes: three bursts" : "no: averaged away");
            out(root, "verdict", state.tool === "fast" ? "A fast tool follows the bursts, and the baseline" : "A slow tool shows the baseline, but the bursts vanish into the average");

            if (!hit && seen.fast && seen.slow) {

                hit = true;
                F.reward("nt-tonicphasic", 10, "You saw what each tool misses");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 60;
            const R = 650;
            const T = 20;
            const B = 250;
            const X = function (s) { return L + s / 120 * (R - L); };
            const Y = function (v) { return B - clamp(v, 0, 1.2) / 1.2 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 60, 120].forEach(function (s) { txt(ctx, s + " s", X(s), B + 18, 11, TEXT + ".7)"); });
            txt(ctx, "time →", (L + R) / 2, B + 38, 12, TEXT + ".8)");

            if (state.tool === "fast") {

                ctx.strokeStyle = TEAL + ".98)";
                ctx.lineWidth = 2.6;
                ctx.beginPath();

                data.forEach(function (v, i) {

                    const x = X(i / N * 120);

                    if (i === 0) { ctx.moveTo(x, Y(v)); } else { ctx.lineTo(x, Y(v)); }
                });

                ctx.stroke();

            } else {

                // 1-minute averages as stepped bars
                for (let k = 0; k < 2; k++) {

                    let s = 0;

                    for (let i = k * 120; i < (k + 1) * 120; i++) { s += data[i]; }

                    const avg = s / 120;

                    ctx.fillStyle = GOLD + ".7)";
                    ctx.fillRect(X(k * 60) + 4, Y(avg), X(60) - L - 8, B - Y(avg));
                    txt(ctx, "one sample", X(k * 60 + 30), Y(avg) - 8, 12, GOLD + "1)", "center", true);
                }

                ctx.strokeStyle = GREY + ".35)";
                ctx.lineWidth = 1.2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();

                data.forEach(function (v, i) {

                    const x = X(i / N * 120);

                    if (i === 0) { ctx.moveTo(x, Y(v)); } else { ctx.lineTo(x, Y(v)); }
                });

                ctx.stroke();
                ctx.setLineDash([]);
                txt(ctx, "(dashed: what really happened)", X(60), 14, 11, TEXT + ".6)", "center");
            }
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-lookalike"] = function (root) {

        const defaults = { asc: 200, sel: 3 };
        const state = { asc: 200, sel: 3 };
        const DA = 50;
        let hit = false;

        root.innerHTML =
            head("Try it: pick one molecule out of a crowd") +
            canvasFor(680, 300, "Two bars compare what the electrode reports with the true dopamine level of 50 nanomolar. The electrode also responds to ascorbic acid, which is present at hundreds of micromolar. How much of the ascorbic acid leaks into the reading depends on the electrode's selectivity.") +
            '<div class="fd-stat-row">' + stat("True dopamine", "t") + stat("Electrode reports", "r") + stat("Error", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Ascorbic acid in the fluid (µM)", key: "asc", min: 0, max: 500, step: 10, value: 200 }) +
            slider({ label: "Selectivity for dopamine over ascorbic acid (log, in ×)", key: "sel", min: 0, max: 6, step: 0.1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">Vitamin C (ascorbic acid) is present at hundreds of micromolar, thousands of times more than dopamine, and can also be oxidized at an electrode. Metabolites like DOPAC and close cousins such as norepinephrine and serotonin respond at similar voltages. Reading = dopamine + ascorbate ÷ selectivity. A sensor has to pick one molecule out of a crowd. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function fmtN(nM) { return nM >= 1000 ? (nM / 1000).toFixed(nM >= 10000 ? 0 : 1) + " µM" : Math.round(nM) + " nM"; }

        function reading() { return DA + state.asc * 1000 / Math.pow(10, state.sel); }

        function update() {

            const r = reading();
            const err = (r - DA) / DA;

            setVal(root, "asc", state.asc + " µM");
            setVal(root, "sel", "×" + Math.pow(10, state.sel).toLocaleString("en-US", { maximumFractionDigits: 0 }));
            out(root, "t", DA + " nM");
            out(root, "r", fmtN(r));
            out(root, "e", err < 0.005 ? "none" : "+" + Math.round(err * 100).toLocaleString("en-US") + " %");
            out(root, "verdict", err > 5 ? "Swamped: the look-alike makes the reading meaningless" : err > 0.2 ? "Still contaminated by the look-alike" : "Selective enough: the reading is close to the truth");

            if (!hit && state.asc >= 200 && err < 0.2) {

                hit = true;
                F.reward("nt-lookalike", 10, "You made a selective sensor");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const r = reading();
            const max = Math.max(r, DA * 2);
            const L = 150;
            const W = 480;

            txt(ctx, "true dopamine", L - 10, 88, 13, TEXT + ".9)", "end");
            ctx.fillStyle = TEAL + ".9)";
            ctx.fillRect(L, 66, Math.max(3, DA / max * W), 34);

            txt(ctx, "electrode reports", L - 10, 168, 13, TEXT + ".9)", "end");

            const dw = Math.max(3, DA / max * W);
            const aw = Math.max(0, (r - DA) / max * W);

            ctx.fillStyle = TEAL + ".9)";
            ctx.fillRect(L, 146, dw, 34);
            ctx.fillStyle = ROSE + ".9)";
            ctx.fillRect(L + dw, 146, aw, 34);

            if (aw > 40) { txt(ctx, "from ascorbic acid", L + dw + aw / 2, 168, 12, "rgba(6,10,24,.95)", "center", true); }

            txt(ctx, "teal: dopamine  ·  rose: look-alike leaking in", L + W / 2, 230, 12, TEXT + ".75)", "center");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-toolboxes"] = quiz(
        "Game: which toolbox?",
        ["Sample it", "Oxidize it", "Light or charge"],
        [
            { q: "Collect fluid and analyze it, as in microdialysis.", a: "Sample it", why: "Take a sample out." },
            { q: "Detect the current when the molecule reacts at an electrode, as in voltammetry.", a: "Oxidize it", why: "Electrons from a reaction." },
            { q: "Use fluorescent proteins or transistors that respond to binding.", a: "Light or charge", why: "Binding changes light or charge." },
            { q: "Fast-scan cyclic voltammetry.", a: "Oxidize it", why: "A swept voltage on an electrode." },
            { q: "A genetically encoded glutamate sensor.", a: "Light or charge", why: "It glows when it binds." },
            { q: "Pumping fluid through a probe, then running it through HPLC.", a: "Sample it", why: "The measuring happens elsewhere." }
        ],
        5,
        "nt-toolboxes-done",
        "You can sort the three toolboxes",
        "Each toolbox trades speed, selectivity, and convenience.",
        "Sample, oxidize, light or charge. Hit Reset to try again."
    );


    /* ======================================
       UNIT 15: MICRODIALYSIS
    ====================================== */

    SIMS["nt-dialysisorder"] = orderGame(
        "Game: follow the sample",
        [
            { n: "Pump", d: "pushes fluid slowly through the probe", why: "It sets the flow rate." },
            { n: "Probe membrane", d: "small molecules diffuse into the fluid", why: "Diffusion does the sampling." },
            { n: "Collection vial", d: "holds each timed sample", why: "One vial per interval." },
            { n: "HPLC analyzer", d: "separates and measures each molecule", why: "A separate instrument measures." }
        ],
        "nt-dialysisorder-done",
        "You followed the sample through the setup",
        "Tap the four parts in the order the fluid passes through them.",
        "The fluid leaves the probe carrying a sample, then is analyzed elsewhere."
    );


    SIMS["nt-microdialysis"] = function (root) {

        const defaults = { flow: 1, mins: 5 };
        const state = { flow: 1, mins: 5 };
        const rand = mulberry(4);
        const TISSUE = 10;
        let mols = [];
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: slower flow, better recovery, slower answers") +
            canvasFor(680, 300, "A microdialysis probe seen from the side. Fluid enters at the left, passes the porous membrane at the tip, and leaves at the right. Small molecules from the tissue diffuse through the membrane into the fluid. When the fluid moves slowly the molecules have more time to cross, so more of the true concentration ends up in the sample.") +
            '<div class="fd-stat-row">' + stat("Relative recovery", "r") + stat("Concentration in the sample", "c") + stat("Each sample covers", "s") + stat("Sample volume", "v") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Flow rate (µL per minute)", key: "flow", min: 0.2, max: 4, step: 0.1, value: 1 }) +
            slider({ label: "Minutes collected per sample", key: "mins", min: 1, max: 20, step: 1, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Only a fraction of the true concentration ends up in the collected fluid, called the relative recovery. Slower flow gives molecules more time to cross, so recovery is higher. Experimenters calibrate recovery to estimate the true level in the tissue. Typical flow rates are about 0.5 to 2 µL/min. In this model the tissue holds 10 nM, and recovery = 1 − e<sup>−0.36 ÷ flow</sup>. The sample is a diluted copy of the tissue.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function rec() { return 1 - Math.exp(-0.36 / state.flow); }

        function update() {

            const r = rec();

            setVal(root, "flow", state.flow.toFixed(1) + " µL/min");
            setVal(root, "mins", state.mins + " min");
            out(root, "r", Math.round(r * 100) + " %");
            out(root, "c", (TISSUE * r).toFixed(1) + " nM (true: " + TISSUE + " nM)");
            out(root, "s", state.mins + " min");
            out(root, "v", (state.flow * state.mins).toFixed(1) + " µL");
            out(root, "verdict", r > 0.5 ? "Slow flow: good recovery, but each sample needs time to fill" : r < 0.2 ? "Fast flow: little crosses the membrane, so the sample is very dilute" : "A middle setting: moderate recovery");

            if (!hit && r > 0.45 && state.mins <= 3) {

                hit = true;
                F.reward("nt-microdialysis", 10, "You balanced recovery against time resolution");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            // tissue
            ctx.fillStyle = PURPLE + ".18)";
            ctx.fillRect(0, 120, 680, 180);
            txt(ctx, "tissue (10 nM)", 540, 285, 12, TEXT + ".75)", "center");

            // tube
            ctx.fillStyle = GREY + ".5)";
            ctx.fillRect(30, 96, 380, 48);
            ctx.fillStyle = "rgba(6,10,24,.9)";
            ctx.fillRect(30, 104, 380, 32);

            // membrane tip
            ctx.fillStyle = GOLD + ".55)";
            ctx.fillRect(210, 96, 200, 48);
            ctx.fillStyle = "rgba(6,10,24,.9)";
            ctx.fillRect(210, 104, 200, 32);

            for (let i = 0; i < 11; i++) { dot(ctx, 220 + i * 18, 96, 2, GOLD + "1)"); dot(ctx, 220 + i * 18, 144, 2, GOLD + "1)"); }

            txt(ctx, "porous membrane", 310, 82, 12, GOLD + "1)", "center", true);
            txt(ctx, "fluid in →", 80, 90, 12, TEXT + ".8)", "center");
            txt(ctx, "→ to vial", 440, 120, 12, TEXT + ".8)", "start");

            mols.forEach(function (m) { dot(ctx, m.x, m.y, 4, m.in ? ROSE + ".98)" : ROSE + ".6)"); });
        }

        animate(root, function (dt) {

            t += dt;

            const v = 40 + state.flow * 60;
            const r = rec();

            if (rand() < dt * 3.5) { mols.push({ x: 40, y: 120 + (rand() - 0.5) * 14, in: false, k: 0 }); }

            // tissue molecules diffusing toward the membrane
            if (rand() < dt * 6) { mols.push({ x: 215 + rand() * 190, y: 170 + rand() * 80, in: false, t: true }); }

            mols.forEach(function (m) {

                if (m.t) {

                    m.x += (rand() - 0.5) * 30 * dt;
                    m.y -= 40 * dt * (0.4 + rand());

                    if (m.y <= 146) {

                        if (rand() < r + 0.1) { m.t = false; m.in = true; m.y = 120 + (rand() - 0.5) * 12; } else { m.gone = true; }
                    }

                } else {

                    m.x += v * dt;
                    m.y = clamp(m.y + (rand() - 0.5) * 20 * dt, 108, 132);
                }

                if (m.x > 420) { m.gone = true; }
            });

            mols = mols.filter(function (m) { return !m.gone; });

            if (mols.length > 150) { mols.splice(0, mols.length - 150); }

            draw();
        });

        wire(root, state, defaults, function () { update(); });

        update();
        draw();
    };


    SIMS["nt-dialysisqs"] = quiz(
        "Game: strength or limit?",
        ["Strength", "Limit"],
        [
            { q: "Measures many molecules from one sample, including glutamate and GABA.", a: "Strength", why: "A broad toolbox." },
            { q: "Samples usually cover one to several minutes.", a: "Limit", why: "Far slower than release events." },
            { q: "Works in living animals.", a: "Strength", why: "Samples around cells without removing tissue." },
            { q: "Probes are hundreds of micrometers across and disturb the tissue.", a: "Limit", why: "Bigger than a microelectrode." },
            { q: "Only a fraction of the true concentration reaches the vial.", a: "Limit", why: "Recovery is not 100 %." }
        ],
        5,
        "nt-dialysisqs-done",
        "You know the trade-offs",
        "It sees the baseline well, but not the bursts.",
        "Broad, but slow. Hit Reset to try again."
    );


    /* ======================================
       UNIT 16: FAST-SCAN CYCLIC VOLTAMMETRY
    ====================================== */

    SIMS["nt-cfmsize"] = quiz(
        "Game: the carbon fiber probe",
        ["About 5 to 7 µm", "A silver/silver chloride electrode", "Little damage"],
        [
            { q: "The width of a carbon-fiber microelectrode, roughly a tenth of a human hair.", a: "About 5 to 7 µm", why: "Micrometers, not millimeters." },
            { q: "What completes the circuit.", a: "A silver/silver chloride electrode", why: "The reference electrode." },
            { q: "Why a small probe is good for the tissue.", a: "Little damage", why: "Small probes disturb the tissue less." }
        ],
        3,
        "nt-cfmsize-done",
        "You know the probe",
        "Small probes disturb the tissue less.",
        "Tiny, with a reference electrode. Hit Reset to try again."
    );


    SIMS["nt-fscv"] = function (root) {

        const defaults = { da: 500, bg: "raw" };
        const state = { da: 500, bg: "raw" };
        const seen = {};
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: sweep the voltage, read the current") +
            canvasFor(680, 340, "Top: the voltage applied to the electrode, a triangle that ramps from minus 0.4 volts up to plus 1.3 volts and back. Bottom: the current against voltage. Without background subtraction the large charging current of the electrode hides the dopamine. With the background subtracted, a peak appears near plus 0.6 volts that grows with the dopamine concentration.") +
            '<div class="fd-stat-row">' + stat("Dopamine", "d") + stat("Peak current", "p") + stat("Peak at", "v") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Show", "bg", [["raw", "Raw current"], ["sub", "After subtracting the background"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Dopamine at the electrode (nM)", key: "da", min: 0, max: 1000, step: 10, value: 500 }) +
            "</div>" +
            '<p class="fd-sim-formula">Dopamine → dopamine-o-quinone + 2 e<sup>−</sup>. As the voltage passes about +0.6 V, dopamine at the surface is oxidized and releases two electrons; the current is proportional to how much dopamine is there. Charging the electrode\'s surface produces a much larger current, so it is subtracted. The shape of the remaining current against voltage is a fingerprint. (Illustrative: about 10 nA per µM.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function volt(f) { return f < 0.5 ? -0.4 + f * 2 * 1.7 : 1.3 - (f - 0.5) * 2 * 1.7; }

        function peakNA() { return state.da / 1000 * 10; }

        function cur(f, sub) {

            const v = volt(f);
            const up = f < 0.5;
            const bgc = (up ? 1 : -1) * 120 + (Math.random() - 0.5) * 0;
            const base = bgc + (sub ? 0 : 0);
            const dac = peakNA() * (up ? Math.exp(-Math.pow((v - 0.6) / 0.14, 2)) : -0.6 * Math.exp(-Math.pow((v + 0.1) / 0.16, 2)));

            return sub ? dac : base + dac;
        }

        function update() {

            seen[state.bg] = true;
            setVal(root, "da", state.da + " nM");
            out(root, "d", state.da + " nM");
            out(root, "p", peakNA().toFixed(1) + " nA");
            out(root, "v", "+0.6 V");
            out(root, "verdict", state.bg === "raw" ? "The electrode's own charging current is far bigger than the dopamine signal" : state.da === 0 ? "Nothing left after subtraction: no dopamine" : "With the background subtracted, the dopamine peak stands out");

            if (!hit && seen.raw && seen.sub && state.da >= 300) {

                hit = true;
                F.reward("nt-fscv", 10, "You subtracted the background to find the peak");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const sub = state.bg === "sub";
            const L = 80;
            const R = 650;

            // voltage waveform
            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, 20); ctx.lineTo(L, 100); ctx.lineTo(R, 100);
            ctx.stroke();
            txt(ctx, "voltage", 38, 56, 11, TEXT + ".75)", "center");
            txt(ctx, "~9 ms", (L + R) / 2, 118, 11, TEXT + ".7)");

            ctx.strokeStyle = GOLD + ".95)";
            ctx.lineWidth = 2.6;
            ctx.beginPath();

            for (let i = 0; i <= 100; i++) {

                const f = i / 100;
                const x = L + f * (R - L);
                const y = 90 - (volt(f) + 0.4) / 1.7 * 60;

                if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }

            ctx.stroke();

            const f0 = (t * 0.35) % 1;

            dot(ctx, L + f0 * (R - L), 90 - (volt(f0) + 0.4) / 1.7 * 60, 6, "rgba(255,255,255,1)");

            // current vs voltage
            const T2 = 150;
            const B2 = 320;
            const mid = (T2 + B2) / 2;
            const scale = sub ? 8 : 0.65;
            const X2 = function (v) { return L + (v + 0.4) / 1.7 * (R - L); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T2); ctx.lineTo(L, B2);
            ctx.stroke();
            ctx.strokeStyle = GREY + ".3)";
            ctx.beginPath();
            ctx.moveTo(L, mid); ctx.lineTo(R, mid);
            ctx.stroke();
            [-0.4, 0, 0.6, 1.3].forEach(function (v) { txt(ctx, (v > 0 ? "+" : "") + v.toFixed(1) + " V", X2(v), B2 + 14, 11, TEXT + ".7)"); });
            txt(ctx, sub ? "current after subtraction" : "raw current", L + 60, T2 - 6, 11, TEXT + ".85)");

            ctx.strokeStyle = (sub ? TEAL : ROSE) + ".98)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let i = 0; i <= 200; i++) {

                const f = i / 200;
                const y = clamp(mid - cur(f, sub) * scale, T2, B2);

                if (i === 0) { ctx.moveTo(X2(volt(f)), y); } else { ctx.lineTo(X2(volt(f)), y); }
            }

            ctx.stroke();

            if (sub && state.da > 0) { txt(ctx, "dopamine", X2(0.6), mid - peakNA() * scale - 8, 12, TEAL + "1)", "center", true); }
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-dacal"] = function (root) {

        const defaults = { i: 6, cond: "fresh" };
        const state = { i: 6, cond: "fresh" };
        const seen = {};
        let hit = false;

        root.innerHTML =
            head("Try it: a calibration converts current to concentration") +
            canvasFor(680, 300, "A calibration line of peak current against dopamine concentration, measured before the electrode was used. A point shows the current you measured. If the electrode has become fouled, its sensitivity has dropped, so reading the old line gives a concentration that is too low.") +
            '<div class="fd-stat-row">' + stat("Reading the old calibration says", "r") + stat("Truth", "t") + stat("Error", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("The electrode", "cond", [["fresh", "Fresh"], ["fouled", "Fouled (sensitivity down 40 %)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Measured peak current (nA)", key: "i", min: 0, max: 20, step: 0.5, value: 6 }) +
            "</div>" +
            '<p class="fd-sim-formula">A calibration converts current to concentration: concentration = current ÷ sensitivity (here 10 nA per µM, measured before use). Surfaces can foul, so results are best for changes rather than absolute baseline levels. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const fouled = state.cond === "fouled";
            const read = state.i / 10 * 1000;
            const truth = state.i / (fouled ? 6 : 10) * 1000;
            const err = truth > 0 ? (read - truth) / truth : 0;

            seen[state.cond] = true;
            setVal(root, "i", state.i.toFixed(1) + " nA");
            out(root, "r", Math.round(read) + " nM");
            out(root, "t", Math.round(truth) + " nM");
            out(root, "e", fouled && state.i > 0 ? Math.round(err * 100) + " %" : "none");
            out(root, "verdict", fouled ? "Fouled: the old calibration under-reports the true level" : "Fresh electrode: the calibration holds");

            if (!hit && seen.fresh && seen.fouled && fouled && state.i >= 3) {

                hit = true;
                F.reward("nt-dacal", 10, "You saw why calibrations drift");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 250;
            const X = function (nm) { return L + nm / 2000 * (R - L); };
            const Y = function (na) { return B - na / 20 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 500, 1000, 1500, 2000].forEach(function (c) { txt(ctx, c + "", X(c), B + 16, 11, TEXT + ".7)"); });
            [0, 10, 20].forEach(function (c) { txt(ctx, c + "", L - 16, Y(c) + 4, 11, TEXT + ".7)"); });
            txt(ctx, "dopamine (nM) →", (L + R) / 2, B + 36, 12, TEXT + ".8)");
            txt(ctx, "peak current (nA) ↑", L + 70, T + 2, 12, TEXT + ".8)");

            ctx.strokeStyle = TEAL + ".9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(2000), Y(20));
            ctx.stroke();
            txt(ctx, "calibration (before use)", X(1500), Y(15) + 28, 12, TEAL + "1)", "center", true);

            if (state.cond === "fouled") {

                ctx.strokeStyle = ROSE + ".8)";
                ctx.setLineDash([6, 5]);
                ctx.beginPath();
                ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(2000), Y(12));
                ctx.stroke();
                ctx.setLineDash([]);
                txt(ctx, "fouled electrode, true response", X(1500), Y(9.5) + 24, 12, ROSE + "1)", "center", true);
            }

            const read = state.i / 10 * 1000;

            ctx.strokeStyle = GOLD + ".6)";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(L, Y(state.i)); ctx.lineTo(X(read), Y(state.i)); ctx.lineTo(X(read), B);
            ctx.stroke();
            ctx.setLineDash([]);
            dot(ctx, X(read), Y(state.i), 8, GOLD + "1)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-fscvqs"] = quiz(
        "Game: what can FSCV see?",
        ["Detected", "Not detected"],
        [
            { q: "Dopamine.", a: "Detected", why: "It oxidizes at the electrode." },
            { q: "Glutamate.", a: "Not detected", why: "It does not react at the electrode." },
            { q: "Serotonin.", a: "Detected", why: "It oxidizes too." },
            { q: "GABA.", a: "Not detected", why: "Only molecules that react are seen." },
            { q: "Norepinephrine.", a: "Detected", why: "Another molecule that oxidizes." }
        ],
        5,
        "nt-fscvqs-done",
        "You know what voltammetry can see",
        "It is the fastest electrochemical tool, for molecules that oxidize.",
        "Only molecules that react at the electrode. Hit Reset to try again."
    );


    /* ======================================
       UNIT 17: LIGHT, TRANSISTORS, AND WHAT'S NEXT
    ====================================== */

    SIMS["nt-fluorsensor"] = function (root) {

        const defaults = {};
        const state = {};
        const cells = [];
        const blobs = [];
        const rand = mulberry(77);
        let t = 0;
        let clicks = 0;
        let hit = false;

        for (let i = 0; i < 9; i++) { cells.push({ x: 90 + (i % 3) * 190 + (rand() - 0.5) * 50, y: 70 + Math.floor(i / 3) * 80 + (rand() - 0.5) * 20 }); }

        root.innerHTML =
            head("Try it: tap the tissue to release glutamate") +
            canvasFor(680, 300, "A microscope view of nine neurons that carry a genetically encoded glutamate sensor. When glutamate is released near a cell, that cell glows brighter. The glow shows where the release happened and fades over a fraction of a second.") +
            '<div class="fd-stat-row">' + stat("Releases so far", "n") + stat("Brightness change (ΔF/F)", "f") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<p class="fd-sim-formula">Genetically encoded sensors are proteins built into neurons that brighten when they bind a specific transmitter: iGluSnFR detects glutamate, and sensors such as dLight and GRAB-DA detect dopamine. A microscope reads the glow, with speeds of milliseconds to seconds and cell-level detail. The catch is that the cells must carry the sensor gene, so this is mainly a research tool. Light is selective, fast, and sees where the molecule is.</p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-reset>↺ Reset</button></div>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function level() {

            let m = 0;

            blobs.forEach(function (b) { m = Math.max(m, b.a); });

            return m;
        }

        function update() {

            out(root, "n", clicks);
            out(root, "f", "+" + Math.round(level() * 300) + " %");
            out(root, "verdict", clicks === 0 ? "Tap the tissue to release glutamate" : level() > 0.1 ? "The nearby cells light up: you see where it happened" : "The glow has faded: the tool is fast enough to follow it");

            if (!hit && clicks >= 5) {

                hit = true;
                F.reward("nt-fluorsensor", 10, "You watched glutamate release as light");
            }
        }

        canvas.addEventListener("click", function (e) {

            const r = canvas.getBoundingClientRect();

            blobs.push({ x: (e.clientX - r.left) * 680 / r.width, y: (e.clientY - r.top) * 300 / r.height, a: 1 });
            clicks++;
        });

        function draw() {

            clear(ctx, 680, 300);

            cells.forEach(function (c) {

                let g = 0;

                blobs.forEach(function (b) {

                    const d = Math.hypot(b.x - c.x, b.y - c.y);

                    g = Math.max(g, b.a * Math.exp(-d / 70));
                });

                dot(ctx, c.x, c.y, 26, "rgba(60,90,70," + (0.55 + 0.1) + ")");

                if (g > 0.02) {

                    const grd = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, 44);

                    grd.addColorStop(0, "rgba(120,255,160," + Math.min(0.95, g) + ")");
                    grd.addColorStop(1, "rgba(120,255,160,0)");
                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.arc(c.x, c.y, 44, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            blobs.forEach(function (b) { if (b.a > 0.1) { dot(ctx, b.x, b.y, 3 + (1 - b.a) * 14, "rgba(255,255,255," + b.a * 0.6 + ")"); } });
        }

        animate(root, function (dt) {

            t += dt;

            blobs.forEach(function (b) { b.a *= Math.exp(-dt / 0.4); });

            while (blobs.length && blobs[0].a < 0.01) { blobs.shift(); }

            update();
            draw();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            blobs.length = 0;
            clicks = 0;
            update();
        });

        update();
        draw();
    };


    SIMS["nt-fetsense"] = function (root) {

        const defaults = { salt: 100, h: 3 };
        const state = { salt: 100, h: 3 };
        let hit = false;

        root.innerHTML =
            head("Try it: the salt hides the charge") +
            canvasFor(680, 320, "A transistor gate surface with a receptor sticking up from it and a charged molecule bound at its tip. Salt ions in the fluid form a cloud around the charge that screens it, and the screening distance is the Debye length. The farther the bound charge is from the surface compared with the Debye length, the weaker the signal at the gate.") +
            '<div class="fd-stat-row">' + stat("Debye length", "l") + stat("Receptor height", "h") + stat("Signal at the gate", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Salt concentration (mM; the body is about 150)", key: "salt", min: 1, max: 150, step: 1, value: 100 }) +
            slider({ label: "Height of the bound charge above the surface (nm)", key: "h", min: 0.5, max: 10, step: 0.1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">Debye length λ ≈ 0.304 ÷ √(salt in mol/L) nm, and the signal falls roughly as e<sup>−h/λ</sup>. In body-like salt, λ is under about a nanometer, so charge farther from the surface is screened. Fixes include short receptors such as aptamers, polymer layers, and organic electrochemical transistors. Sensing a small charge in a salty fluid takes clever engineering. (Simplified.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function lam() { return 0.304 / Math.sqrt(state.salt / 1000); }
        function sig() { return Math.exp(-state.h / lam()); }

        function update() {

            const s = sig();

            setVal(root, "salt", state.salt + " mM");
            setVal(root, "h", state.h.toFixed(1) + " nm");
            out(root, "l", lam().toFixed(2) + " nm");
            out(root, "h", state.h.toFixed(1) + " nm");
            out(root, "s", s < 0.01 ? "under 1 %" : Math.round(s * 100) + " %");
            out(root, "verdict", s > 0.5 ? "Strong signal: the charge sits within the Debye length" : s > 0.2 ? "Weakened, but usable" : "Screened: the salt cloud hides the charge from the gate");

            if (!hit && state.salt >= 100 && s >= 0.2) {

                hit = true;
                F.reward("nt-fetsense", 10, "You got a signal through body-like salt");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const px = 6;                       // pixels per nm
            const surf = 270;

            ctx.fillStyle = GREY + ".55)";
            ctx.fillRect(40, surf, 600, 30);
            txt(ctx, "transistor gate", 340, surf + 21, 12, "rgba(6,10,24,.95)", "center", true);

            const hh = state.h * px * 4.5 / 4.5 * 3;

            // receptor stalk
            ctx.strokeStyle = BLUE + ".95)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(340, surf); ctx.lineTo(340, surf - hh);
            ctx.stroke();
            dot(ctx, 340, surf - hh, 9, ROSE + ".98)");
            txt(ctx, "−", 340, surf - hh + 4, 14, "rgba(6,10,24,1)", "center", true);

            // Debye layer
            const dl = lam() * px * 3;

            ctx.fillStyle = GOLD + ".22)";
            ctx.fillRect(40, surf - dl, 600, dl);
            ctx.strokeStyle = GOLD + ".9)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(40, surf - dl); ctx.lineTo(640, surf - dl);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "Debye length", 130, surf - dl - 6, 12, GOLD + "1)", "center", true);

            // salt ions crowding toward the surface
            const rand = mulberry(5);
            const n = Math.round(10 + state.salt / 5);

            for (let i = 0; i < n; i++) {

                const x = 60 + rand() * 560;
                const y = surf - 6 - Math.pow(rand(), 1.6) * (dl * 1.6 + 30);

                dot(ctx, x, y, 3, (i % 2 ? BLUE : GOLD) + ".75)");
            }

            // signal bar
            const s = sig();

            ctx.fillStyle = GREY + ".2)";
            ctx.fillRect(560, 40, 24, 150);
            ctx.fillStyle = (s > 0.5 ? TEAL : s > 0.2 ? GOLD : ROSE) + ".9)";
            ctx.fillRect(560, 190 - 150 * s, 24, 150 * s);
            txt(ctx, "signal", 572, 30, 12, TEXT + ".8)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-closedloop"] = function (root) {

        const defaults = { sp: 40, loop: "off" };
        const state = { sp: 40, loop: "off" };
        const rand = mulberry(15);
        const hist = [];
        let L = 0.5;
        let t = 0;
        let last = -9;
        let pulses = 0;
        let inBand = 0;
        let total = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: a sensor that reads, and acts") +
            canvasFor(680, 300, "A neurotransmitter level over time. The level keeps leaking away. With the loop off, nothing corrects it and it falls toward zero. With the loop on, a sensor reads the level, and whenever it falls below the target a stimulation pulse boosts it again, so the level stays near the target.") +
            '<div class="fd-stat-row">' + stat("Level now", "l") + stat("Stimulation pulses", "p") + stat("Time near the target", "b") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Loop", "loop", [["off", "Open loop (no feedback)"], ["on", "Closed loop (sensor triggers stimulation)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Target level (% of normal)", key: "sp", min: 20, max: 80, step: 5, value: 40 }) +
            "</div>" +
            '<p class="fd-sim-formula">Closed loop means sensors that read a neurotransmitter and trigger stimulation or drug release. Flexible probes with many sensors, and combined electrical, chemical, and optical recording, point the field toward watching many messengers at once, in real time. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            setVal(root, "sp", state.sp + " %");
            out(root, "l", Math.round(L * 100) + " %");
            out(root, "p", pulses);
            out(root, "b", total > 0 ? Math.round(inBand / total * 100) + " %" : "-");
            out(root, "verdict", state.loop === "off" ? (L < 0.1 ? "No feedback: the level has drained away" : "No feedback: the level is drifting down") : L >= state.sp / 100 - 0.08 ? "The loop is holding the level near the target" : "The sensor sees a dip and triggers a pulse");

            if (!hit && state.loop === "on" && total > 8 && inBand / total > 0.8 && pulses >= 3) {

                hit = true;
                F.reward("nt-closedloop", 10, "You closed the loop");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const Lx = 60;
            const R = 650;
            const T = 20;
            const B = 250;
            const Y = function (v) { return B - v * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(Lx, T); ctx.lineTo(Lx, B); ctx.lineTo(R, B);
            ctx.stroke();

            ctx.strokeStyle = GOLD + ".8)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(Lx, Y(state.sp / 100)); ctx.lineTo(R, Y(state.sp / 100));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "target", R - 30, Y(state.sp / 100) - 6, 12, GOLD + "1)", "center", true);

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            hist.forEach(function (p, i) {

                const x = Lx + (p.t - (t - 20)) / 20 * (R - Lx);

                if (i === 0) { ctx.moveTo(x, Y(p.v)); } else { ctx.lineTo(x, Y(p.v)); }
            });

            ctx.stroke();

            hist.forEach(function (p) {

                if (p.pulse) { txt(ctx, "⚡", Lx + (p.t - (t - 20)) / 20 * (R - Lx), B + 20, 14, GOLD + "1)", "center"); }
            });

            txt(ctx, "last 20 seconds →", (Lx + R) / 2, 290, 12, TEXT + ".75)");
        }

        animate(root, function (dt) {

            t += dt;
            L += (rand() - 0.5) * 0.02 * dt * 10;
            L *= Math.exp(-0.12 * dt);

            let pulse = false;

            if (state.loop === "on" && L < state.sp / 100 && t - last > 1.2) {

                L = Math.min(1, L + 0.22);
                last = t;
                pulses++;
                pulse = true;
            }

            L = clamp(L, 0, 1);

            if (t > 3) {

                total++;
                if (Math.abs(L - state.sp / 100) < 0.15) { inBand++; }
            }

            hist.push({ t: t, v: L, pulse: pulse });

            while (hist.length && hist[0].t < t - 20.2) { hist.shift(); }

            update();
            draw();
        });

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-whatsnext"] = quiz(
        "Game: where the field is heading",
        ["Arrays", "Closed loop", "Multimodal"],
        [
            { q: "Flexible probes with many sensors measure several molecules and places at once.", a: "Arrays", why: "Many sensors on one probe." },
            { q: "Sensors that read a neurotransmitter and trigger stimulation or drug release.", a: "Closed loop", why: "Read, then act." },
            { q: "Combining electrical, chemical, and optical recording.", a: "Multimodal", why: "Several kinds of signal together." }
        ],
        3,
        "nt-whatsnext-done",
        "You know where the field is heading",
        "The goal is to watch many messengers at once, in real time.",
        "Arrays, closed loop, multimodal. Hit Reset to try again."
    );


    SIMS["nt-claims"] = quiz(
        "Game: judging a sensor claim",
        ["Which molecule?", "How fast?", "Where?", "How calibrated?"],
        [
            { q: "Is it distinguished from look-alikes such as ascorbic acid and metabolites?", a: "Which molecule?", why: "Selectivity." },
            { q: "Does the time resolution match the event of interest?", a: "How fast?", why: "Speed." },
            { q: "Was it measured in a dish, or in a living brain?", a: "Where?", why: "The setting matters." },
            { q: "Are the numbers absolute or relative?", a: "How calibrated?", why: "Calibration." }
        ],
        4,
        "nt-claims-done",
        "You can question a sensor claim",
        "A measurement is only as good as its selectivity, speed, and calibration.",
        "Which molecule, how fast, where, how calibrated. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="nt-"]').forEach(F.mount);

})();
