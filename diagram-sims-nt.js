/* ========================================
   NEURAL INTERFACE CHIP: INTERACTIVE SIMULATORS, PART 1

   Unit 1: the neuron, the network.
   Unit 2: the action potential, rate coding, myelin.
   Unit 3: the synapse and why distance matters to a sensor.
   Unit 4: release, the four fates, the off switch.
   Unit 5: the messengers: size, charge, the receiver.
   Unit 6: glutamate and GABA.

   Registers on window.FabInteract; shares the helpers from
   diagram-sims-mems.js. Chains diagram-sims-nt-b.js and -c.js.
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
    const stepper = M.stepper;
    const orderGame = M.orderGame;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const TEAL = "rgba(84,224,199,";
    const GOLD = "rgba(255,214,102,";
    const ROSE = "rgba(255,105,120,";
    const BLUE = "rgba(120,180,255,";
    const GREY = "rgba(170,179,207,";
    const TEXT = "rgba(245,247,255,";
    const PURPLE = "rgba(190,150,255,";

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

    function bump(x) { return x > 0 ? x * Math.exp(1 - x) : 0; }

    // The shape of an action potential, in millivolts, ts milliseconds after threshold.
    function spikeShape(ts) {

        if (ts < 0.4) { return -55 + 95 * Math.sin(ts / 0.4 * Math.PI / 2); }
        if (ts < 1.3) { return 40 - 120 * Math.sin((ts - 0.4) / 0.9 * Math.PI / 2); }
        if (ts < 3.2) { return -80 + 10 * (ts - 1.3) / 1.9; }

        return -70;
    }

    F.ntHelpers = {
        TEAL: TEAL, GOLD: GOLD, ROSE: ROSE, BLUE: BLUE, GREY: GREY, TEXT: TEXT, PURPLE: PURPLE,
        canvasFor: canvasFor, clear: clear, txt: txt, dot: dot, arrow: arrow, bump: bump, spikeShape: spikeShape
    };


    /* ======================================
       UNIT 1: HOW NEURONS SIGNAL
    ====================================== */

    SIMS["nt-neuron"] = function (root) {

        const targets = [
            { id: "dend", q: "the dendrites, which receive signals" },
            { id: "soma", q: "the cell body, which adds up the incoming signals" },
            { id: "axon", q: "the axon, the long fiber that carries the signal away" },
            { id: "term", q: "the terminals, which pass the signal to the next cell" }
        ];
        const state = { i: 0, score: 0, answered: false, list: [] };
        const rand = mulberry(Date.now() % 99999);

        root.innerHTML =
            head("Game: find the part of the neuron") +
            '<div class="fd-stat-row">' + stat("Round", "round") + stat("Score", "score") + "</div>" +
            '<p class="fd-q-prompt" data-out="prompt"></p>' +
            canvasFor(680, 300, "A neuron drawn from left to right: branching dendrites, a round cell body, a long axon wrapped in myelin segments, and branching terminals. Tap the part you are asked to find.") +
            '<p class="fd-q-feedback" data-out="fb"></p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-next style="display:none">Next →</button></div>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const nextBtn = root.querySelector("[data-next]");

        function pick() {

            const pool = targets.slice();

            for (let i = pool.length - 1; i > 0; i--) {

                const j = Math.floor(rand() * (i + 1));
                const t = pool[i];

                pool[i] = pool[j];
                pool[j] = t;
            }

            state.list = pool;
        }

        function classify(x, y) {

            if (Math.hypot(x - 250, y - 150) < 46) { return "soma"; }
            if (x < 205) { return "dend"; }
            if (x > 490) { return "term"; }
            if (x >= 205 && x <= 490 && Math.abs(y - 150) < 26) { return "axon"; }

            return "none";
        }

        function draw(h) {

            clear(ctx, 680, 300);

            const col = function (id) { return h === id ? GOLD + ".98)" : null; };

            // dendrites
            ctx.strokeStyle = col("dend") || TEAL + ".85)";
            ctx.lineWidth = 4;

            [[60, 60, 215, 130], [50, 110, 210, 140], [55, 190, 210, 160], [70, 250, 220, 175], [100, 20, 210, 125]].forEach(function (d) {

                ctx.beginPath();
                ctx.moveTo(d[0], d[1]); ctx.quadraticCurveTo((d[0] + d[2]) / 2, (d[1] + d[3]) / 2 + 12, d[2], d[3]);
                ctx.stroke();
            });

            // axon with myelin
            ctx.strokeStyle = col("axon") || TEAL + ".85)";
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(290, 150); ctx.lineTo(500, 150);
            ctx.stroke();

            for (let i = 0; i < 4; i++) {

                ctx.fillStyle = (h === "axon" ? GOLD : PURPLE) + ".7)";
                ctx.fillRect(305 + i * 48, 138, 38, 24);
            }

            // terminals
            ctx.strokeStyle = col("term") || TEAL + ".85)";
            ctx.lineWidth = 4;

            [[500, 150, 620, 80], [500, 150, 630, 130], [500, 150, 630, 175], [500, 150, 610, 235]].forEach(function (d) {

                ctx.beginPath();
                ctx.moveTo(d[0], d[1]); ctx.lineTo(d[2], d[3]);
                ctx.stroke();
                dot(ctx, d[2], d[3], 9, col("term") || TEAL + ".95)");
            });

            // soma
            dot(ctx, 250, 150, 44, col("soma") || TEAL + ".85)");
            dot(ctx, 250, 150, 16, "rgba(6,10,24,.6)");

            txt(ctx, "signals in →", 80, 285, 12, TEXT + ".6)");
            txt(ctx, "→ signal out", 560, 285, 12, TEXT + ".6)");
        }

        function show() {

            const n = state.list.length;

            if (state.i >= n) {

                out(root, "prompt", "Done! You got " + state.score + " of " + n + ".");
                nextBtn.style.display = "none";
                out(root, "round", "done");
                out(root, "score", state.score + " / " + n);
                F.reward("nt-neuron", 15, "You found every part of a neuron");
                draw();

                return;
            }

            state.answered = false;
            draw();
            out(root, "round", (state.i + 1) + " of " + n);
            out(root, "score", state.score + " / " + n);
            out(root, "prompt", "Tap " + state.list[state.i].q + ".");
            out(root, "fb", "");
            nextBtn.style.display = "none";
        }

        canvas.addEventListener("click", function (e) {

            if (state.answered || state.i >= state.list.length) { return; }

            const r = canvas.getBoundingClientRect();
            const x = (e.clientX - r.left) * 680 / r.width;
            const y = (e.clientY - r.top) * 300 / r.height;
            const hit = classify(x, y);
            const want = state.list[state.i].id;

            state.answered = true;

            if (hit === want) {

                state.score++;
                out(root, "fb", "✅ Right. Inputs in on one side, output at the other.");

            } else {

                out(root, "fb", "❌ Not quite. The right part is shown in gold.");
            }

            draw(want);
            out(root, "score", state.score + " / " + state.list.length);
            nextBtn.style.display = "";
            nextBtn.textContent = state.i === state.list.length - 1 ? "See my score →" : "Next →";
        });

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


    SIMS["nt-languages"] = quiz(
        "Game: electrical or chemical?",
        ["Electrical (inside a neuron)", "Chemical (between neurons)"],
        [
            { q: "A brief pulse called an action potential travels along the axon.", a: "Electrical (inside a neuron)", why: "Fast over long distances." },
            { q: "Neurotransmitters cross a tiny gap at most connections.", a: "Chemical (between neurons)", why: "Chemistry allows many kinds of messages and fine adjustment." },
            { q: "The synapse is where electricity turns into this.", a: "Chemical (between neurons)", why: "A chemical handoff." },
            { q: "The signal that travels the length of a myelinated axon.", a: "Electrical (inside a neuron)", why: "The spike." }
        ],
        4,
        "nt-languages-done",
        "You know the two languages",
        "The synapse is where electricity turns into chemistry.",
        "Electrical inside, chemical between. Hit Reset to try again."
    );


    SIMS["nt-network"] = function (root) {

        const defaults = { syn: 3000 };
        const state = { syn: 3000 };
        const N = 86e9;

        root.innerHTML =
            head("Try it: how big is the network?") +
            art("0 0 340 160", "A bar on a log scale showing the total number of synapses in the human brain for the chosen number of synapses per neuron.") +
            '<div class="fd-stat-row">' + stat("Neurons", "n") + stat("Synapses per neuron", "s") + stat("Synapses in total", "t") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Synapses received by each neuron", key: "syn", min: 1000, max: 10000, step: 500, value: 3000 }) +
            "</div>" +
            '<p class="fd-sim-formula">A human brain has roughly 86 billion neurons, and each can receive thousands of synapses. Signals in the fastest myelinated axons reach about 100 meters per second. Trillions of chemical handoffs happen every second. (Round numbers; estimates vary.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const tot = N * state.syn;

            setVal(root, "syn", state.syn.toLocaleString());
            out(root, "n", "about 86 billion");
            out(root, "s", state.syn.toLocaleString());
            out(root, "t", (tot / 1e12).toFixed(0) + " trillion");
            out(root, "verdict", "Hundreds of trillions of connections: the whole network is built from tiny chemical switches");

            const w = 300 * (Math.log10(tot) - 13) / 3;

            svg.innerHTML =
                label(14, 30, "total synapses (log scale)", 8, "start", "var(--muted)") +
                rect(14, 40, 300, 22, "rgba(170,179,207,.18)") +
                rect(14, 40, Math.max(4, w), 22, "rgba(84,224,199,.9)") +
                [13, 14, 15, 16].map(function (e) { return label(14 + (e - 13) / 3 * 300, 80, "10" + ["¹³", "¹⁴", "¹⁵", "¹⁶"][e - 13], 7, "middle", "var(--muted)"); }).join("") +
                label(14, 120, (tot / 1e12).toFixed(0) + " trillion", 12, "start", "var(--accent)");
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 2: THE ACTION POTENTIAL
    ====================================== */

    SIMS["nt-spike"] = function (root) {

        const defaults = { drive: 22 };
        const state = { drive: 22 };
        const hist = [];
        let V = -70;
        let ts = -1; // time since the spike began, or -1
        let simT = 0;
        let acc = 0;
        let spikes = [];
        let hit = false;
        const seen = {};

        root.innerHTML =
            head("Try it: push a neuron over threshold") +
            canvasFor(680, 330, "A voltage trace of a neuron over about a hundred milliseconds. A steady input pushes the voltage up toward a threshold of minus 55 millivolts. When it crosses, a full spike fires, then the voltage resets. A weak input never reaches threshold. A panel shows which ion channels are open.") +
            '<div class="fd-stat-row">' + stat("Membrane voltage", "v") + stat("Spikes per second", "r") + stat("Channels", "ch") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Input pushing the voltage up", key: "drive", min: 0, max: 45, step: 1, value: 22 }) +
            "</div>" +
            '<p class="fd-sim-formula">At rest the inside of a neuron is about 70 mV negative. If input pushes it to about −55 mV, voltage-gated sodium channels open: Na⁺ rushes in and the inside swings positive, to about +40 mV. Then sodium channels close and potassium channels open, so K⁺ flows out. The pump and leak channels restore the balance. (Time is slowed down about 50 times.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function step() {

            const dt = 0.1; // ms

            simT += dt;

            if (ts >= 0) {

                ts += dt;
                V = spikeShape(ts);

                if (ts >= 3.2) { ts = -1; V = -70; }

            } else {

                V += (-70 + state.drive - V) / 10 * dt;

                if (V >= -55) {

                    ts = 0;
                    spikes.push(simT);
                }
            }

            return V;
        }

        function update() {

            setVal(root, "drive", state.drive);
            seen[state.drive < 15 ? "weak" : "strong"] = true;

            const now = spikes.filter(function (s) { return simT - s < 100; }).length * 10;

            out(root, "v", Math.round(V) + " mV");
            out(root, "r", now + " /s");
            out(root, "ch", ts < 0 ? "resting (leak)" : ts < 0.4 ? "sodium channels open" : ts < 1.3 ? "K⁺ channels open, Na⁺ closed" : "pump restoring the balance");
            out(root, "verdict", state.drive < 15 ? "Below threshold: the input never reaches −55 mV, so there is no spike at all" : "Above threshold: a full spike fires, again and again");

            if (!hit && seen.weak && seen.strong && spikes.length >= 3) {

                hit = true;
                F.reward("nt-spike", 10, "You saw a spike fire only above threshold");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 220;
            const Y = function (v) { return B - (v + 90) / 140 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [-70, -55, 0, 40].forEach(function (v) { txt(ctx, v, L - 24, Y(v) + 4, 11, TEXT + ".7)"); });

            ctx.strokeStyle = ROSE + ".8)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y(-55)); ctx.lineTo(R, Y(-55));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "threshold −55 mV", R - 70, Y(-55) - 6, 12, ROSE + "1)");
            txt(ctx, "time (about 100 ms) →", R, B + 18, 12, TEXT + ".75)", "end");
            M.ylab(ctx, "membrane voltage (mV)", (T + B) / 2);

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 2.4;
            ctx.beginPath();

            hist.forEach(function (v, i) {

                const x = L + i / 199 * (R - L);

                if (i === 0) { ctx.moveTo(x, Y(v)); } else { ctx.lineTo(x, Y(v)); }
            });

            ctx.stroke();

            // the channel panel
            const na = ts >= 0 && ts < 0.4;
            const k = ts >= 0.4 && ts < 1.3;

            [["Na⁺ channel", na, 160], ["K⁺ channel", k, 340]].forEach(function (c) {

                ctx.fillStyle = (c[1] ? TEAL : GREY) + (c[1] ? ".9)" : ".35)");
                ctx.fillRect(c[2], 250, 50, 50);
                ctx.fillStyle = "rgba(6,10,24,.9)";
                ctx.fillRect(c[2] + 18, 250, c[1] ? 14 : 4, 50);
                txt(ctx, c[0], c[2] + 25, 318, 12, TEXT + ".85)");
                txt(ctx, c[1] ? "open" : "closed", c[2] + 25, 242, 12, c[1] ? TEAL + "1)" : TEXT + ".6)", "center", true);
            });

            txt(ctx, na ? "Na⁺ rushes in →" : k ? "← K⁺ flows out" : "resting", 540, 280, 14, GOLD + "1)", "center", true);
        }

        animate(root, function (dt) {

            acc += dt * 50;

            while (acc >= 0.1) {

                acc -= 0.1;
                step();

                if (Math.round(simT * 10) % 5 === 0) {

                    hist.push(V);

                    if (hist.length > 200) { hist.shift(); }
                }
            }

            spikes = spikes.filter(function (s) { return simT - s < 200; });

            if (Math.round(simT * 10) % 20 === 0) { update(); }

            draw();
        });

        wire(root, state, defaults, update);

        update();
    };


    SIMS["nt-ratecode"] = function (root) {

        const defaults = { s: "med" };
        const state = { s: "med" };
        const drives = { weak: 18, med: 28, strong: 45 };
        const seen = {};

        root.innerHTML =
            head("Try it: strength is a count, not a size") +
            canvasFor(680, 280, "Three spike trains over 200 milliseconds from a neuron given a weak, medium or strong input. Every spike has the same height; the stronger input only makes more of them.") +
            '<div class="fd-stat-row">' + stat("Spikes in 200 ms", "n") + stat("Rate", "r") + stat("Spike height", "h") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Stimulus", "s", [["weak", "Weak"], ["med", "Medium"], ["strong", "Strong"]]) +
            '<p class="fd-sim-formula">A neuron fires a full spike or none at all (all or none). A stronger stimulus makes more spikes per second, not bigger spikes (rate coding). After a spike the neuron briefly cannot fire again (the refractory period), so the signal moves one way. Information is carried in the timing and rate of identical spikes.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function times(drive) {

            const t = [];
            const isi = 10 * Math.log(drive / (drive - 15)) + 3.2;

            for (let x = isi * 0.6; x < 200; x += isi) { t.push(x); }

            return t;
        }

        function update() {

            const n = times(drives[state.s]).length;

            seen[state.s] = true;
            out(root, "n", n);
            out(root, "r", n * 5 + " spikes per second");
            out(root, "h", "+40 mV: always the same");
            out(root, "verdict", "A stronger stimulus gives more spikes, not taller ones");

            if (Object.keys(seen).length >= 3) {
                F.reward("nt-ratecode", 10, "You saw rate coding in all three strengths");
            }
        }

        function draw() {

            clear(ctx, 680, 280);

            [["weak", "Weak"], ["med", "Medium"], ["strong", "Strong"]].forEach(function (r, i) {

                const y = 75 + i * 72;
                const t = times(drives[r[0]]);
                const on = state.s === r[0];

                ctx.strokeStyle = GREY + (on ? ".6)" : ".25)");
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(70, y); ctx.lineTo(650, y);
                ctx.stroke();
                txt(ctx, r[1], 14, y + 4, 12, on ? GOLD + "1)" : TEXT + ".6)", "start", on);

                t.forEach(function (x) {

                    const px = 70 + x / 200 * 580;

                    ctx.strokeStyle = (on ? TEAL : GREY) + (on ? ".98)" : ".5)");
                    ctx.lineWidth = on ? 3 : 2;
                    ctx.beginPath();
                    ctx.moveTo(px, y); ctx.lineTo(px, y - 46);
                    ctx.stroke();
                });
            });

            txt(ctx, "200 ms →", 610, 270, 12, TEXT + ".6)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-myelinspeed"] = function (root) {

        const defaults = { len: 50 };
        const state = { len: 50 };
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Watch: a race, with and without myelin") +
            canvasFor(680, 300, "Two identical axons. A spike travels along each at the same moment. In the myelinated axon it jumps from node to node and is about a hundred times faster. By the time it reaches the end, the unmyelinated spike has barely begun.") +
            '<div class="fd-stat-row">' + stat("Myelinated: time to arrive", "m") + stat("Unmyelinated: time to arrive", "u") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Axon length", key: "len", min: 5, max: 100, step: 5, value: 50 }) +
            "</div>" +
            '<p class="fd-sim-formula">Myelin insulates the axon, and the spike is regenerated only at small gaps called nodes of Ranvier, so it appears to jump from node to node. This lets signals travel at up to about 100 meters per second; the unmyelinated speed here (about 1 m/s) is illustrative. Diseases such as multiple sclerosis damage myelin and slow the signal. (The race is slowed so you can see it.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const L = state.len / 100; // metres

            setVal(root, "len", state.len + " cm");
            out(root, "m", (L / 100 * 1000).toFixed(L / 100 * 1000 < 10 ? 1 : 0) + " ms");
            out(root, "u", (L / 1 * 1000).toFixed(0) + " ms");
            out(root, "verdict", "Insulation turns a slow crawl into a sprint");

            if (!hit && state.len >= 90) {

                hit = true;
                F.reward("nt-myelinspeed", 10, "You raced a long axon");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 60;
            const R = 620;
            const cycle = 6;
            const tt = t % cycle;
            const fast = Math.min(1, tt / 3);
            const slow = Math.min(1, tt / 3 / 100);

            [["Myelinated (about 100 m/s)", 90, true, fast], ["Unmyelinated (about 1 m/s, illustrative)", 200, false, slow]].forEach(function (a) {

                const y = a[1];

                ctx.strokeStyle = TEAL + ".6)";
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(L, y); ctx.lineTo(R, y);
                ctx.stroke();

                if (a[2]) {

                    for (let i = 0; i < 8; i++) {

                        ctx.fillStyle = PURPLE + ".7)";
                        ctx.fillRect(L + 12 + i * 69, y - 14, 52, 28);
                    }

                    // nodes flash as the spike passes
                    for (let i = 0; i < 8; i++) {

                        const nx = L + 6 + i * 69;

                        if (Math.abs(nx - (L + a[3] * (R - L))) < 24) { dot(ctx, nx, y, 12, GOLD + ".95)"); }
                    }
                }

                const px = L + a[3] * (R - L);

                dot(ctx, px, y, a[2] ? 9 : 11, GOLD + ".98)");
                txt(ctx, a[0], L, y - 34, 13, TEXT + ".85)", "start", true);
            });

            txt(ctx, "start", L, 270, 12, TEXT + ".6)");
            txt(ctx, "end of the axon", R - 20, 270, 12, TEXT + ".6)");
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
       UNIT 3: THE SYNAPSE
    ====================================== */

    SIMS["nt-synparts"] = quiz(
        "Game: the parts of a chemical synapse",
        ["Presynaptic terminal", "Cleft", "Postsynaptic membrane", "Astrocyte"],
        [
            { q: "Holds vesicles, small bubbles filled with neurotransmitter.", a: "Presynaptic terminal", why: "The sender." },
            { q: "A fluid-filled gap about 20 to 40 nanometers wide.", a: "Cleft", why: "The gap the message crosses." },
            { q: "Studded with receptors that bind the neurotransmitter.", a: "Postsynaptic membrane", why: "The receiver." },
            { q: "Wraps many synapses and helps clear the transmitter.", a: "Astrocyte", why: "A helper cell." }
        ],
        4,
        "nt-synparts-done",
        "You know the parts of a synapse",
        "A synapse is a tiny, precisely organized machine.",
        "Sender, gap, receiver, helper. Hit Reset to try again."
    );


    SIMS["nt-diffusion"] = function (root) {

        const defaults = { ld: -7.5 };
        const state = { ld: -7.5 };
        const D = 4e-10; // m²/s, a small molecule in tissue
        const marks = [
            { n: "synaptic cleft", x: 3e-8 },
            { n: "a terminal", x: 1e-6 },
            { n: "carbon-fiber electrode radius", x: 3.5e-6 },
            { n: "a thin microdialysis probe", x: 1e-4 }
        ];
        const seen = {};

        root.innerHTML =
            head("Try it: how long does a molecule take to arrive?") +
            canvasFor(680, 320, "A log-scale chart of diffusion time against distance, from tens of nanometers to a tenth of a millimeter. Markers show the synaptic cleft, a terminal, a carbon-fiber electrode and a microdialysis probe. A line marks one millisecond, the length of a release event.") +
            '<div class="fd-stat-row">' + stat("Distance", "x") + stat("Diffusion time", "t") + stat("Compared with a 1 ms event", "c") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Distance between the release site and the sensor (log scale)", key: "ld", min: -8, max: -3.5, step: 0.05, value: -7.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">t ≈ x² ÷ 2D, with D about 4 × 10⁻¹⁰ m²/s for a small molecule in tissue. Molecules only need to diffuse tens of nanometers across the cleft, so the handoff is fast. But the time grows with the square of the distance: a sensor a few micrometers away sees a release event only after many milliseconds. For a chip, that is a reason to put sensors very close to the source.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function fmtT(s) {

            if (s < 1e-3) { return (s * 1e6).toFixed(s < 1e-5 ? 1 : 0) + " µs"; }
            if (s < 1) { return (s * 1e3).toFixed(s < 0.01 ? 1 : 0) + " ms"; }

            return s.toFixed(1) + " s";
        }

        function fmtX(x) { return x < 1e-6 ? Math.round(x * 1e9) + " nm" : x < 1e-3 ? (x * 1e6).toFixed(x < 1e-5 ? 1 : 0) + " µm" : (x * 1e3).toFixed(1) + " mm"; }

        function update() {

            const x = Math.pow(10, state.ld);
            const t = x * x / (2 * D);

            seen[t < 1e-4 ? "fast" : t > 0.05 ? "slow" : "mid"] = true;
            setVal(root, "ld", fmtX(x));
            out(root, "x", fmtX(x));
            out(root, "t", fmtT(t));
            out(root, "c", t < 1e-3 ? (1e-3 / t).toFixed(0) + "× faster than the event" : (t / 1e-3).toFixed(0) + "× slower than the event");
            out(root, "verdict", t < 1e-4 ? "Across the cleft: practically instant" : t < 1e-3 ? "Fast enough to follow a release event" : "Too slow: the event is over before the molecules arrive");

            if (Object.keys(seen).length >= 3) {
                F.reward("nt-diffusion", 10, "You compared the cleft with a sensor far away");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (lx) { return L + (lx + 8) / 4.5 * (R - L); };
            const Y = function (t) { return B - (Math.log10(t) + 7) / 9 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [[-8, "10 nm"], [-7, "100 nm"], [-6, "1 µm"], [-5, "10 µm"], [-4, "100 µm"]].forEach(function (g) { txt(ctx, g[1], X(g[0]), B + 18, 11, TEXT + ".7)"); });
            [[-6, "1 µs"], [-3, "1 ms"], [0, "1 s"]].forEach(function (g) { txt(ctx, g[1], L - 28, Y(Math.pow(10, g[0])) + 4, 11, TEXT + ".7)"); });
            txt(ctx, "distance (log scale) →", (L + R) / 2, B + 38, 13, TEXT + ".85)");
            txt(ctx, "time ↑", L + 24, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = GOLD + ".8)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y(1e-3)); ctx.lineTo(R, Y(1e-3));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "1 ms: a release event", R - 80, Y(1e-3) - 6, 12, GOLD + "1)");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let lx = -8; lx <= -3.5; lx += 0.05) {

                const x = Math.pow(10, lx);
                const t = x * x / (2 * D);

                if (lx === -8) { ctx.moveTo(X(lx), Y(t)); } else { ctx.lineTo(X(lx), Y(t)); }
            }

            ctx.stroke();

            marks.forEach(function (m, i) {

                const lx = Math.log10(m.x);
                const t = m.x * m.x / (2 * D);

                dot(ctx, X(lx), Y(t), 5, ROSE + ".95)");
                txt(ctx, m.n, X(lx) + (i < 2 ? 8 : -8), Y(t) + (i < 2 ? 18 : -10), 11, ROSE + "1)", i < 2 ? "start" : "end");
            });

            const x = Math.pow(10, state.ld);

            dot(ctx, X(state.ld), Y(x * x / (2 * D)), 9, "rgba(255,255,255,1)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-synkinds"] = quiz(
        "Game: chemical or electrical synapse?",
        ["Chemical synapse", "Electrical synapse"],
        [
            { q: "The two cells are separated by a gap and the message crosses as molecules.", a: "Chemical synapse", why: "Most synapses in the human brain." },
            { q: "Tiny channels join the cells directly.", a: "Electrical synapse", why: "The cells are linked, not separated." },
            { q: "Where neurotransmitters act.", a: "Chemical synapse", why: "Where there is a transmitter, there is a chemical synapse." }
        ],
        3,
        "nt-synkinds-done",
        "You know the two kinds",
        "This course focuses on chemical synapses.",
        "Chemical: a gap and molecules. Electrical: direct channels. Hit Reset to try again."
    );


    /* ======================================
       UNIT 4: RELEASE AND CLEANUP
    ====================================== */

    SIMS["nt-release"] = stepper({
        title: "Watch: from spike to transmitter",
        aria: "A presynaptic terminal above a cleft. A spike arrives and opens calcium channels, calcium flows in, vesicles fuse with the membrane, and the neurotransmitter spills into the cleft and diffuses toward the postsynaptic cell.",
        viewBox: "0 0 340 190",
        interval: 3,
        rewardKey: "nt-release",
        rewardMsg: "You followed a release event from start to finish",
        steps: [
            { t: "1. A spike arrives", tool: "voltage-gated Ca²⁺ channels", text: "A spike reaches the terminal and opens voltage-gated calcium channels." },
            { t: "2. Calcium flows in", tool: "Ca²⁺", text: "Calcium (Ca²⁺) flows into the terminal." },
            { t: "3. Vesicles fuse", tool: "exocytosis", text: "Calcium triggers vesicles to fuse with the membrane, which is called exocytosis." },
            { t: "4. Transmitter crosses", tool: "diffusion across the cleft", text: "The neurotransmitter spills into the cleft and diffuses across to the receptors." }
        ],
        draw: function (step, st) {

            const a = st.anim || 0;
            let s = rect(40, 20, 260, 56, "rgba(84,224,199,.45)", "rgba(84,224,199,.9)");

            s += label(170, 14, "presynaptic terminal", 7, "middle", "var(--muted)");
            s += rect(40, 128, 260, 36, "rgba(190,150,255,.4)", "rgba(190,150,255,.9)");
            s += label(170, 178, "postsynaptic cell, with receptors", 7, "middle", "var(--muted)");

            // channels in the terminal membrane
            [90, 170, 250].forEach(function (x) { s += rect(x - 6, 72, 12, 12, step >= 0 ? "rgba(255,214,102,.95)" : "rgba(255,214,102,.3)"); });

            // vesicles
            [80, 130, 180, 230].forEach(function (x, i) {

                const fused = step >= 2;
                const y = fused ? 70 : 46;

                s += '<circle cx="' + x + '" cy="' + y + '" r="' + (fused ? 8 : 9) + '" style="fill:rgba(255,105,120,.85)"/>';
            });

            if (step === 0) { s += '<path d="M 30 48 L ' + (50 + (a % 3) * 18) + ' 48" style="stroke:#ffd666;stroke-width:3"/>' + label(30, 40, "spike", 7, "start", "#ffd666"); }

            if (step >= 1 && step < 3) {

                for (let i = 0; i < 6; i++) { s += '<circle cx="' + (90 + (i % 3) * 80) + '" cy="' + (96 - ((a * 12 + i * 8) % 30)) + '" r="3" style="fill:#ffd666"/>'; }
            }

            if (step >= 3) {

                for (let i = 0; i < 12; i++) {

                    const x = 70 + (i % 6) * 40 + Math.sin(a * 2 + i) * 4;
                    const y = 84 + ((a * 20 + i * 11) % 40);

                    s += '<circle cx="' + x + '" cy="' + y + '" r="3.2" style="fill:#ff6978"/>';
                }

                s += label(170, 122, "diffusing to the receptors", 7, "middle", "var(--text)");
            }

            return s;
        }
    });


    SIMS["nt-fates"] = function (root) {

        const defaults = { which: "da" };
        const state = { which: "da", re: 80, en: 5 };
        const rand = mulberry(Date.now() % 99999);
        let mols = [];
        let counts = { bind: 0, reup: 0, break: 0, drift: 0 };
        const seen = {};

        root.innerHTML =
            head("Try it: four fates for a transmitter") +
            canvasFor(680, 330, "A synaptic cleft after release. Neurotransmitter molecules can bind a receptor on the lower cell, be pumped back by a transporter on the upper terminal, be chopped up by an enzyme, or drift away. The counters show where the molecules end up for the chosen transmitter.") +
            '<div class="fd-stat-row">' + stat("Bound a receptor", "b") + stat("Pumped back (reuptake)", "u") + stat("Broken down", "d") + stat("Drifted away", "f") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Transmitter", "which", [["da", "Dopamine or serotonin"], ["ach", "Acetylcholine"], ["glu", "Glutamate"]]) +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-release>💥 Release</button></div>' +
            '<p class="fd-sim-formula">Released molecules do not stay long: they bind a receptor, get pumped back (reuptake), get broken down by an enzyme, or drift away. The message ends because the molecules are removed. Dopamine and serotonin: mainly reuptake. Acetylcholine: broken down very quickly by acetylcholinesterase. Glutamate: taken up mostly by astrocytes. (Rates illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const rates = { da: [0.9, 0.0], ach: [0.0, 0.9], glu: [0.55, 0.0] };

        function release() {

            for (let i = 0; i < 40; i++) {

                mols.push({ x: 240 + rand() * 200, y: 100 + rand() * 12, vx: (rand() - 0.5) * 30, vy: 20 + rand() * 20, st: "free" });
            }
        }

        function update() {

            seen[state.which] = true;
            out(root, "b", counts.bind);
            out(root, "u", counts.reup);
            out(root, "d", counts["break"]);
            out(root, "f", counts.drift);
            out(root, "verdict", state.which === "da" ? "Dopamine and serotonin are mostly cleared by reuptake through their transporters" : state.which === "ach" ? "Acetylcholine is chopped up almost at once by acetylcholinesterase" : "Glutamate is taken up mostly by astrocytes");

            if (Object.keys(seen).length >= 3 && counts.reup + counts.bind + counts["break"] > 40) {
                F.reward("nt-fates", 10, "You compared how three transmitters are cleared");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            ctx.fillStyle = TEAL + ".45)";
            ctx.fillRect(160, 30, 360, 60);
            txt(ctx, "presynaptic terminal", 340, 54, 13, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = PURPLE + ".45)";
            ctx.fillRect(160, 250, 360, 60);
            txt(ctx, "postsynaptic cell", 340, 290, 13, "rgba(6,10,24,.95)", "center", true);

            // transporters on the terminal membrane
            const r = rates[state.which];

            for (let i = 0; i < 6; i++) {

                ctx.fillStyle = (r[0] > 0 ? GOLD : GREY) + (r[0] > 0 ? ".95)" : ".35)");
                ctx.fillRect(180 + i * 56, 88, 16, 14);
            }

            txt(ctx, r[0] > 0 ? "transporters" : "(no transporters here)", 120, 100, 11, TEXT + ".7)");

            // receptors
            for (let i = 0; i < 6; i++) { ctx.fillStyle = BLUE + ".95)"; ctx.fillRect(180 + i * 56, 238, 16, 14); }

            txt(ctx, "receptors", 120, 248, 11, TEXT + ".7)");

            // enzyme scissors
            if (r[1] > 0) {

                txt(ctx, "✂️ acetylcholinesterase", 600, 164, 13, ROSE + "1)", "center");
                txt(ctx, "in the cleft", 600, 182, 13, ROSE + "1)", "center");
            }
            if (state.which === "glu") {

                txt(ctx, "astrocyte transporters", 600, 114, 12, ROSE + "1)", "center");
                txt(ctx, "at the edges", 600, 130, 12, ROSE + "1)", "center");
            }

            mols.forEach(function (m) {

                dot(ctx, m.x, m.y, 4.4, m.st === "broken" ? GREY + ".45)" : ROSE + ".95)");
            });
        }

        animate(root, function (dt) {

            const r = rates[state.which];

            mols.forEach(function (m) {

                if (m.done) { return; }

                if (m.st === "free") {

                    m.x += (m.vx + (rand() - 0.5) * 80) * dt;
                    m.y += (m.vy * 0.3 + (rand() - 0.5) * 80) * dt;

                    if (state.which === "ach" && rand() < r[1] * dt * 3) { m.st = "broken"; counts["break"]++; m.done = true; m.t = 1; update(); return; }

                    if (m.y < 100 && rand() < r[0] * dt * 2.2 * (state.which === "glu" ? 0.7 : 1)) { counts.reup++; m.done = true; m.t = 0; update(); return; }

                    if (m.y > 244 && rand() < 0.5) { counts.bind++; m.done = true; m.t = 0; update(); return; }

                    if (m.x < 140 || m.x > 540) { counts.drift++; m.done = true; m.t = 0; update(); return; }

                    m.y = clamp(m.y, 96, 246);
                }
            });

            mols = mols.filter(function (m) { return !m.done; });

            draw();
        });

        root.querySelector("[data-release]").addEventListener("click", release);

        wire(root, state, defaults, function () {

            mols = [];
            counts = { bind: 0, reup: 0, "break": 0, drift: 0 };
            update();
        });

        update();
        draw();
    };


    SIMS["nt-cleanup"] = quiz(
        "Game: who clears which transmitter?",
        ["Reuptake through DAT and SERT", "Broken down by acetylcholinesterase", "Taken up by astrocytes", "GABA transporters"],
        [
            { q: "Dopamine and serotonin.", a: "Reuptake through DAT and SERT", why: "Mainly cleared by reuptake through their transporters." },
            { q: "Acetylcholine.", a: "Broken down by acetylcholinesterase", why: "Very quickly, by an enzyme." },
            { q: "Glutamate.", a: "Taken up by astrocytes", why: "Mostly, using transporters." },
            { q: "GABA.", a: "GABA transporters", why: "Taken up by its own transporters." }
        ],
        4,
        "nt-cleanup-done",
        "You know who clears what",
        "Cleanup machinery is a common drug target.",
        "Each transmitter has a favorite. Hit Reset to try again."
    );


    SIMS["nt-offswitch"] = function (root) {

        const defaults = { block: 0 };
        const state = { block: 0 };
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: block the off switch") +
            canvasFor(680, 300, "The concentration of a neurotransmitter in the cleft after a release, decaying over time. Blocking the cleanup machinery makes the curve decay more slowly, so the message lingers and its effect grows.") +
            '<div class="fd-stat-row">' + stat("Time above half its peak", "t") + stat("Total effect (area)", "a") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How much of the cleanup is blocked (a drug)", key: "block", min: 0, max: 90, step: 5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Fast cleanup keeps each signal short and crisp. Blocking cleanup makes the transmitter linger and strengthens its effect. Cleanup is also why transmitter levels change in milliseconds to seconds, which is a big reason they are so hard to measure. The off switch is as important as the on switch. (Illustrative curve.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function tau() { return 10 / (1 - state.block / 100); }

        function update() {

            setVal(root, "block", state.block + " %");
            out(root, "t", (tau() * Math.LN2).toFixed(1) + " ms (illustrative)");
            out(root, "a", (tau() / 10).toFixed(1) + "× the normal effect");
            out(root, "verdict", state.block === 0 ? "Normal cleanup: a short, crisp message" : state.block >= 60 ? "Cleanup mostly blocked: the transmitter lingers and the effect is much stronger" : "Slower cleanup: the message lasts longer");

            if (!hit && state.block >= 80) {

                hit = true;
                F.reward("nt-offswitch", 10, "You switched off the off switch");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 250;
            const X = function (ms) { return L + ms / 100 * (R - L); };
            const Y = function (c) { return B - c * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            txt(ctx, "time after release (ms) →", (L + R) / 2, B + 30, 13, TEXT + ".8)");
            txt(ctx, "transmitter in the cleft ↑", L + 90, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = GREY + ".7)";
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let ms = 0; ms <= 100; ms += 1) {

                const c = Math.exp(-ms / 10);

                if (ms === 0) { ctx.moveTo(X(ms), Y(c)); } else { ctx.lineTo(X(ms), Y(c)); }
            }

            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = TEAL + ".18)";
            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(X(0), Y(0));

            for (let ms = 0; ms <= 100; ms += 1) { ctx.lineTo(X(ms), Y(Math.exp(-ms / tau()))); }

            ctx.lineTo(X(100), Y(0));
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();

            for (let ms = 0; ms <= 100; ms += 1) {

                if (ms === 0) { ctx.moveTo(X(ms), Y(Math.exp(-ms / tau()))); } else { ctx.lineTo(X(ms), Y(Math.exp(-ms / tau()))); }
            }

            ctx.stroke();

            const ms = (t * 20) % 100;

            dot(ctx, X(ms), Y(Math.exp(-ms / tau())), 7, GOLD + "1)");
            txt(ctx, "dashed: normal cleanup", R - 90, T + 20, 12, TEXT + ".7)");
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
       UNIT 5: MEET THE MESSENGERS
    ====================================== */

    SIMS["nt-messengers"] = quiz(
        "Game: who does what?",
        ["Glutamate", "GABA", "Dopamine", "Serotonin", "Acetylcholine", "Norepinephrine"],
        [
            { q: "The main excitatory transmitter.", a: "Glutamate", why: "The brain's go signal." },
            { q: "The main inhibitory transmitter.", a: "GABA", why: "The brain's brake." },
            { q: "Reward, motivation and movement.", a: "Dopamine", why: "More about wanting and learning than pleasure." },
            { q: "Mood, sleep and appetite.", a: "Serotonin", why: "A broad modulator." },
            { q: "Muscle control, attention and memory.", a: "Acetylcholine", why: "The messenger at the muscle." },
            { q: "Alertness and the stress response.", a: "Norepinephrine", why: "The alertness molecule." }
        ],
        6,
        "nt-messengers-done",
        "You know the six big names",
        "A handful of molecules carry a huge share of the brain's messages.",
        "Glutamate, GABA, dopamine, serotonin, acetylcholine, norepinephrine. Hit Reset to try again."
    );


    SIMS["nt-size"] = function (root) {

        const defaults = { mol: "dopamine" };
        const state = { mol: "dopamine" };
        const mols = {
            gaba: { n: "GABA", m: 103 },
            ach: { n: "Acetylcholine", m: 146 },
            glu: { n: "Glutamate", m: 147 },
            dopamine: { n: "Dopamine", m: 153 },
            ne: { n: "Norepinephrine", m: 169 },
            ser: { n: "Serotonin", m: 176 }
        };
        const seen = {};

        root.innerHTML =
            head("Try it: all small molecules") +
            art("0 0 340 190", "A log-scale bar chart comparing the molecular weight of six neurotransmitters, all under 200 daltons, with an antibody at 150,000 daltons.") +
            '<div class="fd-stat-row">' + stat("This molecule", "n") + stat("Weight", "w") + stat("An antibody is", "a") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Pick a messenger", "mol", Object.keys(mols).map(function (k) { return [k, mols[k].n]; })) +
            '<p class="fd-sim-formula">All are under 200 daltons, tiny compared with a protein: an antibody is about 150,000 daltons. For a sensor, that means very little mass and very little charge to detect. (Molecular weights are approximate.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const m = mols[state.mol];

            seen[state.mol] = true;
            out(root, "n", m.n);
            out(root, "w", m.m + " Da");
            out(root, "a", Math.round(150000 / m.m).toLocaleString() + "× heavier");
            out(root, "verdict", m.n + " weighs about " + m.m + " daltons: tiny next to a protein");

            const X = function (v) { return 90 + (Math.log10(v) - 1.5) / 4 * 230; };
            let s = "";

            Object.keys(mols).concat(["ab"]).forEach(function (k, i) {

                const y = 14 + i * 24;
                const mm = k === "ab" ? { n: "Antibody", m: 150000 } : mols[k];
                const on = k === state.mol;

                s += label(84, y + 11, mm.n, 7.5, "end", on ? "#ffd666" : "var(--text)");
                s += rect(90, y, Math.max(2, X(mm.m) - 90), 16, k === "ab" ? "rgba(255,105,120,.85)" : on ? "rgba(255,214,102,.95)" : "rgba(84,224,199,.75)");
                s += label(X(mm.m) + 4, y + 12, mm.m.toLocaleString(), 7, "start", "var(--muted)");
            });

            svg.innerHTML = s;

            if (Object.keys(seen).length >= 6) {
                F.reward("nt-size", 10, "You compared all six messengers");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["nt-charge"] = quiz(
        "Game: what charge at body pH?",
        ["Positive", "Negative", "Roughly neutral overall"],
        [
            { q: "Dopamine.", a: "Positive", why: "A positive charge at body pH." },
            { q: "Glutamate.", a: "Negative", why: "A net negative charge." },
            { q: "GABA: both a positive and a negative group.", a: "Roughly neutral overall", why: "The two groups cancel." },
            { q: "Serotonin.", a: "Positive", why: "Like the other monoamines." },
            { q: "Acetylcholine: permanently charged.", a: "Positive", why: "Always positive." },
            { q: "Why do sensors care?", a: "Positive", why: "Many sense charge, so a transmitter's sign and size matter." }
        ],
        5,
        "nt-charge-done",
        "You know the charges",
        "Charge matters for sensors, because many sense charge.",
        "Monoamines and ACh positive; glutamate negative; GABA neutral. Hit Reset to try again."
    );


    SIMS["nt-receiver"] = function (root) {

        const defaults = { rec: "ex" };
        const state = { rec: "ex" };
        const seen = {};
        let t = 0;

        root.innerHTML =
            head("Try it: the receptor decides the meaning") +
            canvasFor(680, 300, "The same neurotransmitter molecules landing on two different cells. On a cell with excitatory receptors the voltage rises toward threshold. On a cell with inhibitory receptors it falls away from threshold.") +
            '<div class="fd-stat-row">' + stat("The molecule", "m") + stat("The receiver", "r") + stat("Effect on the cell", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("The receiving cell has", "rec", [["ex", "Excitatory receptors"], ["in", "Inhibitory receptors"]]) +
            '<p class="fd-sim-formula">The same neurotransmitter can excite one cell and inhibit another, depending on which receptors that cell has. Many neurons also release more than one messenger at once. A transmitter is a word, and the receiver decides what it means.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            seen[state.rec] = true;
            out(root, "m", "the same transmitter");
            out(root, "r", state.rec === "ex" ? "excitatory receptors" : "inhibitory receptors");
            out(root, "e", state.rec === "ex" ? "pushed toward firing" : "pushed away from firing");
            out(root, "verdict", state.rec === "ex" ? "Here the molecule means: go" : "Here the same molecule means: stop");

            if (seen.ex && seen.in) {
                F.reward("nt-receiver", 10, "You saw one molecule mean two things");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const ex = state.rec === "ex";

            // sender
            ctx.fillStyle = TEAL + ".5)";
            ctx.fillRect(40, 20, 600, 50);
            txt(ctx, "sending terminal", 340, 50, 13, "rgba(6,10,24,.95)", "center", true);

            // molecules drifting down
            for (let i = 0; i < 8; i++) {

                const y = 80 + ((t * 40 + i * 20) % 110);

                dot(ctx, 120 + i * 62, y, 5.5, ROSE + ".95)");
            }

            // receiving cell
            ctx.fillStyle = (ex ? GOLD : BLUE) + ".35)";
            ctx.fillRect(40, 195, 600, 40);

            for (let i = 0; i < 8; i++) { ctx.fillStyle = (ex ? GOLD : BLUE) + ".95)"; ctx.fillRect(105 + i * 62, 188, 30, 10); }

            txt(ctx, ex ? "excitatory receptors" : "inhibitory receptors", 340, 220, 13, "rgba(6,10,24,.95)", "center", true);

            // a voltage gauge
            const v = ex ? -70 + 20 * (1 - Math.exp(-(t % 4) / 1.2)) : -70 - 8 * (1 - Math.exp(-(t % 4) / 1.2));

            ctx.fillStyle = GREY + ".18)";
            ctx.fillRect(120, 262, 440, 10);
            const X = function (vv) { return 120 + (vv + 85) / 40 * 440; };

            ctx.strokeStyle = ROSE + ".9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(X(-55), 256); ctx.lineTo(X(-55), 278);
            ctx.stroke();
            txt(ctx, "threshold", X(-55), 292, 11, ROSE + "1)");
            dot(ctx, X(v), 267, 8, "rgba(255,255,255,1)");
            txt(ctx, "membrane voltage", 120, 256, 11, TEXT + ".7)", "start");
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
       UNIT 6: GLUTAMATE AND GABA
    ====================================== */

    SIMS["nt-glutgaba"] = quiz(
        "Game: glutamate or GABA?",
        ["Glutamate", "GABA"],
        [
            { q: "The main excitatory transmitter: the brain's go signal.", a: "Glutamate", why: "Fast signaling and learning." },
            { q: "The main inhibitory transmitter: the brain's brake.", a: "GABA", why: "Quiets cells." },
            { q: "Made from glutamate, using the enzyme GAD.", a: "GABA", why: "The brake is made from the accelerator's raw material." },
            { q: "Its receptors include AMPA, NMDA and kainate.", a: "Glutamate", why: "Ionotropic glutamate receptors." },
            { q: "GABA-A lets chloride flow in and quiets the cell: whose receptor is it?", a: "GABA", why: "The main inhibitory transmitter." }
        ],
        5,
        "nt-glutgaba-done",
        "You know the two big opposites",
        "Neural circuits depend on a steady balance between excitation and inhibition.",
        "Glutamate goes, GABA brakes. Hit Reset to try again."
    );


    SIMS["nt-balance"] = function (root) {

        const defaults = { e: 5, i: 5 };
        const state = { e: 5, i: 5 };
        const seen = {};
        let angle = 0;

        root.innerHTML =
            head("Try it: balance excitation and inhibition") +
            canvasFor(680, 300, "A seesaw with glutamate, the excitatory force, on one side and GABA, the inhibitory force, on the other. When excitation outweighs inhibition the circuit is overactive and can seize. When inhibition outweighs excitation the circuit is quiet and the person is sedated.") +
            '<div class="fd-stat-row">' + stat("Net activity", "a") + stat("State", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-bz>💊 Add a benzodiazepine (boosts GABA-A)</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Excitation (glutamate)", key: "e", min: 0, max: 10, step: 0.5, value: 5 }) +
            slider({ label: "Inhibition (GABA)", key: "i", min: 0, max: 10, step: 0.5, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Too much excitation can cause seizures; in stroke, glutamate overload damages neurons (excitotoxicity). Too much inhibition causes sedation: benzodiazepines and alcohol enhance GABA-A activity. Many drugs work by tilting this balance. Activity is a balance, not a quantity.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function state2() {

            const net = state.e - state.i;

            return net > 2.5 ? "overactive: seizure risk" : net < -2.5 ? "sedated" : "balanced";
        }

        function update() {

            const net = state.e - state.i;

            setVal(root, "e", state.e.toFixed(1));
            setVal(root, "i", state.i.toFixed(1));
            seen[state2()] = true;
            out(root, "a", (net >= 0 ? "+" : "") + net.toFixed(1));
            out(root, "s", state2());
            out(root, "verdict", net > 2.5 ? "Excitation wins: too much firing, which can cause seizures" : net < -2.5 ? "Inhibition wins: the circuit is quieted: sedation" : "In balance: activity stays in a healthy range");

            if (Object.keys(seen).length >= 3) {
                F.reward("nt-balance", 10, "You tipped the balance both ways");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const net = state.e - state.i;
            const target = clamp(net / 10, -1, 1) * -0.35;

            angle += (target - angle) * 0.15;

            const cx = 340;
            const cy = 190;
            const len = 230;

            ctx.fillStyle = GREY + ".7)";
            ctx.beginPath();
            ctx.moveTo(cx, cy); ctx.lineTo(cx - 24, cy + 70); ctx.lineTo(cx + 24, cy + 70);
            ctx.closePath();
            ctx.fill();

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.fillStyle = TEXT + ".85)";
            ctx.fillRect(-len, -6, len * 2, 12);

            // the weights
            ctx.fillStyle = ROSE + ".9)";
            ctx.fillRect(-len - 20, -30 - state.e * 4, 80, 24 + state.e * 4);
            txt(ctx, "glutamate", -len + 20, -38 - state.e * 4, 12, ROSE + "1)", "center", true);
            ctx.fillStyle = BLUE + ".9)";
            ctx.fillRect(len - 60, -30 - state.i * 4, 80, 24 + state.i * 4);
            txt(ctx, "GABA", len - 20, -38 - state.i * 4, 12, BLUE + "1)", "center", true);
            ctx.restore();

            txt(ctx, state2(), 340, 30, 18, (state2() === "balanced" ? TEAL : GOLD) + "1)", "center", true);
        }

        animate(root, function () { draw(); });

        root.querySelector("[data-bz]").addEventListener("click", function () {

            state.i = Math.min(10, state.i + 2);
            root.querySelector('input[data-key="i"]').value = state.i;
            update();
        });

        wire(root, state, defaults, function () { update(); });

        update();
    };


    SIMS["nt-gabamade"] = quiz(
        "Game: GABA's receptors and origin",
        ["GAD", "GABA-A", "GABA-B", "Benzodiazepine"],
        [
            { q: "The enzyme that turns glutamate into GABA.", a: "GAD", why: "Glutamate decarboxylase." },
            { q: "An ionotropic receptor that lets chloride flow in and quiets the cell.", a: "GABA-A", why: "Fast inhibition." },
            { q: "A metabotropic receptor with slower, longer-lasting inhibition.", a: "GABA-B", why: "Slower and longer." },
            { q: "Enhances GABA-A activity and causes sedation.", a: "Benzodiazepine", why: "It turns up the brake." }
        ],
        4,
        "nt-gabamade-done",
        "You know GABA's machinery",
        "The brain makes its brake from the same raw material as its accelerator.",
        "GAD makes it, GABA-A is fast, GABA-B is slow. Hit Reset to try again."
    );


    SIMS["nt-slips"] = quiz(
        "Game: when the balance slips",
        ["Too much excitation", "Too much inhibition"],
        [
            { q: "Can cause seizures.", a: "Too much excitation", why: "Overactive circuits." },
            { q: "In stroke, glutamate overload damages neurons (excitotoxicity).", a: "Too much excitation", why: "Too much glutamate." },
            { q: "Causes sedation.", a: "Too much inhibition", why: "The brake is on too hard." },
            { q: "Benzodiazepines and alcohol enhance GABA-A activity.", a: "Too much inhibition", why: "They tilt the balance toward inhibition." }
        ],
        4,
        "nt-slips-done",
        "You know what goes wrong at each extreme",
        "Many drugs work by tilting this balance.",
        "Too much glutamate: seizures. Too much GABA: sedation. Hit Reset to try again."
    );


    SIMS["nt-whichsensor"] = quiz(
        "Game: which sensor can see it?",
        ["Oxidize it at an electrode", "An enzyme-based electrode", "A fluorescent protein sensor"],
        [
            { q: "Dopamine: easily oxidized at an electrode.", a: "Oxidize it at an electrode", why: "It gives up electrons at a carbon fiber." },
            { q: "Glutamate: not easily oxidized, so an enzyme can turn it into something an electrode can detect.", a: "An enzyme-based electrode", why: "Chemistry decides which sensor can see a molecule." },
            { q: "Glutamate or GABA, seen by a microscope as a glow in cells that carry a gene.", a: "A fluorescent protein sensor", why: "Light is selective and fast." },
            { q: "Serotonin, dopamine or norepinephrine at an electrode.", a: "Oxidize it at an electrode", why: "These monoamines react at similar voltages." }
        ],
        4,
        "nt-whichsensor-done",
        "You know which tool sees which molecule",
        "Chemistry decides which sensor can see a molecule.",
        "Oxidizable: electrode. Not oxidizable: enzyme or fluorescence. Hit Reset to try again."
    );


    // Parts 2 and 3 of the neural interface chip simulators.
    [
        ["fabNtScriptB", "diagram-sims-nt-b.js"],
        ["fabNtScriptC", "diagram-sims-nt-c.js"]
    ].forEach(function (f) {

        if (document.getElementById(f[0])) {
            return;
        }

        const more = document.createElement("script");

        more.id = f[0];
        more.src = f[1];

        document.head.appendChild(more);
    });

    document.querySelectorAll('.fd-sim[data-sim^="nt-"]').forEach(F.mount);

})();
