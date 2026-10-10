/* ========================================
   NEURAL INTERFACE CHIP: INTERACTIVE SIMULATORS, PART 2

   Unit 7: dopamine: synthesis, reward, Parkinson's.
   Unit 8: serotonin: SSRIs, delay, fouling.
   Unit 9: acetylcholine at the muscle.
   Unit 10: receptor families.
   Unit 11: binding and occupancy.
   Unit 12: drugs at the synapse.

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
    const PURPLE = H.PURPLE;
    const canvasFor = H.canvasFor;
    const clear = H.clear;
    const txt = H.txt;
    const dot = H.dot;
    const arrow = H.arrow;


    /* ======================================
       UNIT 7: DOPAMINE
    ====================================== */

    SIMS["nt-dopasynth"] = orderGame(
        "Game: the dopamine assembly line",
        [
            { n: "Tyrosine", d: "an amino acid from the diet", why: "The starting material." },
            { n: "L-DOPA", d: "made by tyrosine hydroxylase, the slow step", why: "One step before dopamine." },
            { n: "Dopamine", d: "L-DOPA is converted to it", why: "The messenger." },
            { n: "Norepinephrine", d: "one more chemical step later", why: "Dopamine can be turned into it." }
        ],
        "nt-dopasynth-done",
        "You ran the assembly line in order",
        "Tap the four molecules in the order they are made.",
        "L-DOPA sits one step before dopamine."
    );


    SIMS["nt-dajobs"] = quiz(
        "Game: what does dopamine do?",
        ["Reward learning", "Motivation", "Movement"],
        [
            { q: "Dopamine neurons fire more when an outcome is better than expected, and less when it is worse.", a: "Reward learning", why: "It signals better than expected." },
            { q: "Helps drive effort toward a goal.", a: "Motivation", why: "More about wanting than pleasure." },
            { q: "Dopamine in the striatum helps start and smooth the actions of the body.", a: "Movement", why: "Lose it and movement slows." },
            { q: "Dopamine is more about wanting and learning than about this.", a: "Reward learning", why: "Pleasure is not the main job." }
        ],
        4,
        "nt-dajobs-done",
        "You know dopamine's jobs",
        "One molecule, several jobs.",
        "Learning, motivation, movement. Hit Reset to try again."
    );


    SIMS["nt-rpe"] = function (root) {

        const defaults = { d: 0 };
        const state = { d: 0 };
        const rand = mulberry(12);
        const r = [];
        const seen = {};
        let t = 0;

        for (let i = 0; i < 60; i++) { r.push(rand()); }

        root.innerHTML =
            head("Try it: better or worse than expected?") +
            canvasFor(680, 300, "A row of spikes from a dopamine neuron over one second around the moment an outcome arrives. When the outcome is better than expected there is a burst of spikes; when it is as expected the rate stays at baseline; when it is worse the neuron pauses.") +
            '<div class="fd-stat-row">' + stat("Outcome compared with expectation", "o") + stat("Dopamine neuron firing", "f") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How the outcome compares with what was expected", key: "d", min: -100, max: 100, step: 5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Dopamine neurons fire more when an outcome is better than expected, and less when it is worse. Dopamine is more about wanting and learning than about pleasure. (Illustrative firing rates.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function rate(tt) {

            if (tt < 0) { return 5; }

            const x = state.d / 100;

            return clamp(5 + (x > 0 ? 40 * x * Math.exp(-tt / 0.15) : 5 * x * (tt < 0.4 ? 1 : 0)), 0, 60);
        }

        function update() {

            seen[state.d > 20 ? "better" : state.d < -20 ? "worse" : "same"] = true;
            setVal(root, "d", (state.d >= 0 ? "+" : "") + state.d + " %");
            out(root, "o", state.d > 20 ? "better than expected" : state.d < -20 ? "worse than expected" : "as expected");
            out(root, "f", state.d > 20 ? "a burst" : state.d < -20 ? "a pause" : "baseline");
            out(root, "verdict", state.d > 20 ? "Better than expected: the neurons burst: this is the teaching signal" : state.d < -20 ? "Worse than expected: the neurons fall silent" : "As expected: nothing to learn, so no change");

            if (Object.keys(seen).length >= 3) {
                F.reward("nt-rpe", 10, "You saw a burst, a pause and no change");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 60;
            const R = 640;
            const mid = 360;

            ctx.strokeStyle = GREY + ".4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(L, 190); ctx.lineTo(R, 190);
            ctx.stroke();

            ctx.strokeStyle = GOLD + ".8)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(mid, 60); ctx.lineTo(mid, 240);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "outcome", mid, 52, 12, GOLD + "1)", "center", true);

            // spikes: place by thinning a baseline
            for (let i = 0; i < 60; i++) {

                const x = L + i / 59 * (R - L);
                const tt = (x - mid) / 300;
                const p = rate(tt) / 5 * 0.12;

                if (r[(i * 7 + Math.floor(state.d / 5 + 20)) % 60] < p) {

                    ctx.strokeStyle = TEAL + ".98)";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(x, 190); ctx.lineTo(x, 130);
                    ctx.stroke();
                }
            }

            // a few extra ticks for bursts
            if (state.d > 0) {

                for (let i = 0; i < Math.round(state.d / 100 * 10); i++) {

                    const x = mid + 10 + i * 9;

                    ctx.strokeStyle = TEAL + ".98)";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(x, 190); ctx.lineTo(x, 130);
                    ctx.stroke();
                }
            }

            txt(ctx, "one second of dopamine-neuron spikes →", (L + R) / 2, 270, 12, TEXT + ".75)");
            M.ylab(ctx, "dopamine neuron spikes", 160);
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-parkinson"] = function (root) {

        const defaults = { loss: 40, ldopa: "off" };
        const state = { loss: 40, ldopa: "off" };
        const seen = {};
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: when the source cells die") +
            canvasFor(680, 320, "Dopamine neurons of the substantia nigra send fibers to the striatum. As the neurons are lost, striatal dopamine falls and movement slows. L-DOPA given as a drug crosses the blood-brain barrier on the LAT1 carrier and is converted to dopamine, partly restoring the level. Dopamine itself cannot cross.") +
            '<div class="fd-stat-row">' + stat("Dopamine neurons left", "n") + stat("Dopamine in the striatum", "d") + stat("Movement", "m") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Treatment", "ldopa", [["off", "None"], ["on", "L-DOPA"], ["da", "Dopamine itself"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Dopamine neurons lost", key: "loss", min: 0, max: 100, step: 5, value: 40 }) +
            "</div>" +
            '<p class="fd-sim-formula">In Parkinson\'s disease, dopamine neurons in the substantia nigra die off. Dopamine in the striatum falls, causing tremor, stiffness and slowed movement. L-DOPA crosses the blood-brain barrier on the LAT1 carrier and is then converted to dopamine. Dopamine itself cannot cross the barrier, but its precursor can. (Illustrative levels.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function da() {

            const base = 1 - state.loss / 100;
            const boost = state.ldopa === "on" ? Math.min(0.55, (1 - base) * 0.85) * (state.loss < 95 ? 1 : 0.5) : 0;

            return Math.min(1, base + boost);
        }

        function update() {

            const d = da();

            seen[state.ldopa] = true;
            setVal(root, "loss", state.loss + " %");
            out(root, "n", (100 - state.loss) + " %");
            out(root, "d", Math.round(d * 100) + " % of normal");
            out(root, "m", d > 0.7 ? "normal" : d > 0.4 ? "slowed, some tremor" : "very slowed and stiff");
            out(root, "verdict", state.ldopa === "da" ? "Dopamine itself cannot cross the barrier, so taking it does not help the brain" : state.ldopa === "on" ? "L-DOPA gets across and is converted to dopamine: movement improves" : d > 0.7 ? "Enough dopamine left: movement is normal" : "Dopamine has fallen: tremor, stiffness and slowed movement");

            if (!hit && seen.off && seen.on && seen.da && state.loss >= 60) {

                hit = true;
                F.reward("nt-parkinson", 10, "You treated Parkinson's with the right molecule");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const d = da();

            // substantia nigra (source) and striatum (target)
            ctx.fillStyle = TEAL + ".3)";
            ctx.fillRect(40, 30, 170, 90);
            txt(ctx, "substantia nigra", 125, 24, 12, TEXT + ".8)");
            txt(ctx, "dopamine neurons", 125, 130, 11, TEXT + ".7)");

            for (let i = 0; i < 10; i++) {

                const alive = i / 10 >= state.loss / 100;

                dot(ctx, 65 + (i % 5) * 30, 55 + Math.floor(i / 5) * 40, 10, alive ? TEAL + ".95)" : GREY + ".25)");
            }

            ctx.fillStyle = PURPLE + ".3)";
            ctx.fillRect(470, 30, 170, 90);
            txt(ctx, "striatum", 555, 24, 12, TEXT + ".8)");

            const n = Math.round(d * 14);

            for (let i = 0; i < n; i++) { dot(ctx, 490 + (i % 7) * 20, 55 + Math.floor(i / 7) * 36, 6, ROSE + ".95)"); }

            // the fibers between them
            arrow(ctx, 215, 75, 465, 75, TEAL + (0.2 + 0.7 * (1 - state.loss / 100)) + ")", 3);

            // the barrier
            ctx.fillStyle = GOLD + ".35)";
            ctx.fillRect(40, 190, 600, 14);
            txt(ctx, "blood-brain barrier", 340, 220, 12, GOLD + "1)");
            txt(ctx, "blood", 70, 180, 12, TEXT + ".7)");
            txt(ctx, "brain", 70, 244, 12, TEXT + ".7)");

            if (state.ldopa !== "off") {

                const isL = state.ldopa === "on";
                const p = (t * 0.3) % 1;
                const x = 200 + p * 40;
                const y = 150 + p * 130;

                if (isL || p < 0.32) { dot(ctx, x, y, 8, (isL ? TEAL : ROSE) + ".98)"); }

                txt(ctx, isL ? "L-DOPA rides the LAT1 carrier ✓" : "dopamine cannot cross ✗", 340, 280, 13, isL ? TEAL + "1)" : ROSE + "1)", "center", true);

                if (!isL) { txt(ctx, "✖", 232, 196, 22, ROSE + "1)", "center", true); }
            }

            // movement gauge
            ctx.fillStyle = GREY + ".2)";
            ctx.fillRect(470, 260, 170, 14);
            ctx.fillStyle = (d > 0.7 ? TEAL : d > 0.4 ? GOLD : ROSE) + ".9)";
            ctx.fillRect(470, 260, 170 * d, 14);
            txt(ctx, "movement", 555, 296, 12, TEXT + ".8)");
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-dalinks"] = quiz(
        "Game: dopamine and the clinic",
        ["Blocks the dopamine transporter", "Promotes dopamine release", "Blocks D2 receptors"],
        [
            { q: "Cocaine.", a: "Blocks the dopamine transporter", why: "So dopamine lingers." },
            { q: "Amphetamine.", a: "Promotes dopamine release", why: "It pushes dopamine out." },
            { q: "Many antipsychotic drugs.", a: "Blocks D2 receptors", why: "Dopamine D2 receptors." },
            { q: "Both cocaine and amphetamine raise dopamine in this region of the brain.", a: "Blocks the dopamine transporter", why: "The nucleus accumbens." }
        ],
        4,
        "nt-dalinks-done",
        "You can link drugs to dopamine",
        "Too little dopamine and too much dopamine cause different problems.",
        "Cocaine blocks cleanup, amphetamine releases, antipsychotics block D2. Hit Reset to try again."
    );


    /* ======================================
       UNIT 8: SEROTONIN
    ====================================== */

    SIMS["nt-seroquiz"] = quiz(
        "Game: serotonin facts",
        ["Made from tryptophan", "Mostly made in the gut", "Raphe nuclei", "Mood, sleep, appetite"],
        [
            { q: "The amino acid it starts from.", a: "Made from tryptophan", why: "From the diet." },
            { q: "Where most of the body's serotonin is made.", a: "Mostly made in the gut", why: "Only a small share is in the brain." },
            { q: "The brainstem region whose neurons send serotonin fibers across the brain.", a: "Raphe nuclei", why: "The source in the brain." },
            { q: "Linked to depression and anxiety, regulates sleep cycles and influences hunger.", a: "Mood, sleep, appetite", why: "A broad modulator." }
        ],
        4,
        "nt-seroquiz-done",
        "You know the serotonin basics",
        "Serotonin is a gut molecule as much as a brain molecule.",
        "Tryptophan, gut, raphe nuclei, broad roles. Hit Reset to try again."
    );


    SIMS["nt-ssri"] = function (root) {

        const defaults = { dose: "off" };
        const state = { dose: "off" };
        const rand = mulberry(33);
        let mols = [];
        let t = 0;
        let rel = 0;
        const seen = {};

        root.innerHTML =
            head("Try it: block the cleanup") +
            canvasFor(680, 330, "A synapse releasing serotonin. Transporters on the sending terminal pump serotonin back. With an SSRI, the transporters are blocked, so serotonin lingers in the cleft and keeps binding receptors on the receiving cell.") +
            '<div class="fd-stat-row">' + stat("Serotonin in the cleft", "c") + stat("Receptors bound", "b") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Treatment", "dose", [["off", "No drug"], ["on", "SSRI (blocks the transporter)"]]) +
            '<p class="fd-sim-formula">Selective serotonin reuptake inhibitors (SSRIs) block the serotonin transporter, so serotonin lingers in the cleft. A drug that blocks the off switch lengthens the message.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            seen[state.dose] = true;
            out(root, "c", mols.length + " molecules");
            out(root, "b", mols.filter(function (m) { return m.bound; }).length);
            out(root, "verdict", state.dose === "on" ? "The transporters are blocked: serotonin lingers and keeps signaling" : "Transporters pump serotonin back: the message is short");

            if (seen.on && seen.off && mols.length > 20) {
                F.reward("nt-ssri", 10, "You saw an SSRI make serotonin linger");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            ctx.fillStyle = TEAL + ".45)";
            ctx.fillRect(100, 30, 480, 60);
            txt(ctx, "serotonin terminal", 340, 54, 13, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = PURPLE + ".45)";
            ctx.fillRect(100, 250, 480, 60);
            txt(ctx, "receiving cell", 340, 290, 13, "rgba(6,10,24,.95)", "center", true);

            const on = state.dose === "on";

            for (let i = 0; i < 6; i++) {

                ctx.fillStyle = (on ? ROSE : GOLD) + ".95)";
                ctx.fillRect(130 + i * 78, 88, 20, 16);

                if (on) { txt(ctx, "✖", 140 + i * 78, 118, 14, ROSE + "1)", "center", true); }
            }

            txt(ctx, on ? "transporters blocked" : "transporters (SERT)", 340, 130, 12, (on ? ROSE : GOLD) + "1)");

            for (let i = 0; i < 6; i++) { ctx.fillStyle = BLUE + ".95)"; ctx.fillRect(130 + i * 78, 238, 20, 12); }

            mols.forEach(function (m) { dot(ctx, m.x, m.y, 4.6, m.bound ? GOLD + ".95)" : ROSE + ".95)"); });
        }

        animate(root, function (dt) {

            t += dt;

            if (t - rel > 3) {

                rel = t;

                for (let i = 0; i < 14; i++) { mols.push({ x: 140 + rand() * 400, y: 110 + rand() * 10, vx: (rand() - 0.5) * 20, bound: false }); }
            }

            mols.forEach(function (m) {

                if (!m.bound) {

                    m.x += (m.vx + (rand() - 0.5) * 60) * dt;
                    m.y += (rand() - 0.5) * 60 * dt + 4 * dt;
                    m.y = clamp(m.y, 108, 244);
                    m.x = clamp(m.x, 110, 570);

                    if (m.y > 238 && rand() < 0.5 * dt * 3) { m.bound = true; m.t = 0; }

                    // reuptake, unless blocked
                    if (state.dose === "off" && m.y < 114 && rand() < dt * 2.5) { m.gone = true; }

                } else {

                    m.t += dt;

                    if (m.t > (state.dose === "on" ? 6 : 1.2)) { m.bound = false; m.y = 230; }
                }

                if (state.dose === "off" && m.y < 112 && rand() < dt * 0.8) { m.gone = true; }
            });

            mols = mols.filter(function (m) { return !m.gone; });

            if (mols.length > 120) { mols.splice(0, mols.length - 120); }

            update();
            draw();
        });

        wire(root, state, defaults, function () { mols = []; rel = t; update(); });

        update();
        draw();
    };


    SIMS["nt-ssridelay"] = function (root) {

        const defaults = { wk: 0 };
        const state = { wk: 0 };
        let hit = false;

        root.innerHTML =
            head("Try it: not instant, not simple") +
            canvasFor(680, 300, "Two curves over eight weeks of taking an SSRI. Serotonin levels in the synapse rise within hours, but the benefit to mood builds only over weeks, which shows that slower adaptation is involved.") +
            '<div class="fd-stat-row">' + stat("Serotonin in the synapse", "s") + stat("Mood benefit", "m") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Time since starting the drug", key: "wk", min: 0, max: 8, step: 0.1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">SSRIs raise serotonin within hours, but benefits for mood often take weeks. That delay shows the effect involves slower adaptation, not just higher levels. Serotonin acts on more than a dozen receptor subtypes, so drugs differ in effects. The picture is more complicated than a simple chemical imbalance. (Illustrative curves.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function s(w) { return 1 - Math.exp(-w / 0.03); }
        function m(w) { return 1 / (1 + Math.exp(-(w - 3.5) / 0.9)); }

        function update() {

            setVal(root, "wk", state.wk < 1 ? Math.round(state.wk * 7 * 24) + " hours" : state.wk.toFixed(1) + " weeks");
            out(root, "s", Math.round(s(state.wk) * 100) + " % of its full rise");
            out(root, "m", Math.round(m(state.wk) * 100) + " % of the eventual benefit");
            out(root, "verdict", state.wk < 0.3 ? "Hours in: serotonin is up, but mood has not changed yet" : state.wk < 3 ? "Weeks in: the benefit is still building" : "Several weeks in: the mood benefit has appeared");

            if (!hit && state.wk >= 6) {

                hit = true;
                F.reward("nt-ssridelay", 10, "You waited out the SSRI delay");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 250;
            const X = function (w) { return L + w / 8 * (R - L); };
            const Y = function (v) { return B - v * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 2, 4, 6, 8].forEach(function (w) { txt(ctx, w + " wk", X(w), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "weeks since starting →", (L + R) / 2, B + 38, 13, TEXT + ".8)");
            M.ylab(ctx, "fraction of full effect", (T + B) / 2);
            [0, 0.5, 1].forEach(function (v) { txt(ctx, v, L - 20, Y(v) + 4, 12, TEXT + ".7)"); });

            [[s, ROSE, "serotonin in the synapse"], [m, TEAL, "mood benefit"]].forEach(function (c) {

                ctx.strokeStyle = c[1] + ".98)";
                ctx.lineWidth = 3.2;
                ctx.beginPath();

                for (let w = 0; w <= 8; w += 0.05) {

                    if (w === 0) { ctx.moveTo(X(w), Y(c[0](w))); } else { ctx.lineTo(X(w), Y(c[0](w))); }
                }

                ctx.stroke();
                txt(ctx, c[2], c[1] === ROSE ? X(3) : X(5.4), c[1] === ROSE ? Y(1) - 8 : Y(0.5) + 24, 12, c[1] + "1)", "center", true);
            });

            ctx.strokeStyle = GOLD + ".8)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(X(state.wk), T); ctx.lineTo(X(state.wk), B);
            ctx.stroke();
            dot(ctx, X(state.wk), Y(s(state.wk)), 7, ROSE + "1)");
            dot(ctx, X(state.wk), Y(m(state.wk)), 7, TEAL + "1)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-fouling"] = function (root) {

        const defaults = { n: 0, coat: "bare" };
        const state = { n: 0, coat: "bare" };
        const seen = {};
        let hit = false;

        root.innerHTML =
            head("Try it: a sensor has to resist sticking") +
            canvasFor(680, 300, "A plot of an electrode's sensitivity as it makes more and more measurements of serotonin. A bare surface gets fouled as serotonin's reaction products stick to it and the sensitivity falls. A special coating slows the fouling.") +
            '<div class="fd-stat-row">' + stat("Measurements so far", "n") + stat("Sensitivity left", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrode surface", "coat", [["bare", "Bare carbon"], ["coat", "With an antifouling coating or waveform"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Number of measurements", key: "n", min: 0, max: 200, step: 5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Serotonin is present at very low levels and tends to stick to electrodes and foul them, which makes it one of the harder neurotransmitters to measure in real time. Engineers use special coatings and waveforms to cope. A sensor has to be selective and also resist sticking. (Illustrative decay.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function sens(n, c) { return Math.exp(-n / (c === "coat" ? 400 : 60)); }

        function update() {

            seen[state.coat] = true;
            setVal(root, "n", state.n);
            out(root, "n", state.n);
            out(root, "s", Math.round(sens(state.n, state.coat) * 100) + " %");
            out(root, "verdict", sens(state.n, state.coat) < 0.3 ? "Fouled: the electrode has lost most of its sensitivity" : state.coat === "coat" ? "The coating keeps the surface clean for much longer" : "Still sensitive, but fouling is building up");

            if (!hit && seen.bare && seen.coat && state.n >= 150) {

                hit = true;
                F.reward("nt-fouling", 10, "You compared a fouled and a protected electrode");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 250;
            const X = function (n) { return L + n / 200 * (R - L); };
            const Y = function (v) { return B - v * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            txt(ctx, "measurements →", (L + R) / 2, B + 34, 13, TEXT + ".8)");
            txt(ctx, "sensitivity ↑", L + 50, T + 4, 12, TEXT + ".75)");

            [["bare", ROSE], ["coat", TEAL]].forEach(function (c) {

                ctx.strokeStyle = c[1] + (state.coat === c[0] ? ".98)" : ".35)");
                ctx.lineWidth = state.coat === c[0] ? 3.4 : 2;
                ctx.beginPath();

                for (let n = 0; n <= 200; n += 4) {

                    if (n === 0) { ctx.moveTo(X(n), Y(sens(n, c[0]))); } else { ctx.lineTo(X(n), Y(sens(n, c[0]))); }
                }

                ctx.stroke();
            });

            dot(ctx, X(state.n), Y(sens(state.n, state.coat)), 8, GOLD + "1)");

            // blobs sticking to a schematic electrode
            ctx.fillStyle = GREY + ".7)";
            ctx.fillRect(540, 60, 90, 22);
            const k = Math.round((1 - sens(state.n, state.coat)) * 14);

            for (let i = 0; i < k; i++) { dot(ctx, 548 + (i % 7) * 12, 50 - Math.floor(i / 7) * 10, 4, ROSE + ".9)"); }

            txt(ctx, "electrode surface", 585, 100, 11, TEXT + ".7)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    /* ======================================
       UNIT 9: ACETYLCHOLINE AND OTHERS
    ====================================== */

    SIMS["nt-achjob"] = quiz(
        "Game: acetylcholine at the muscle",
        ["Nicotinic receptors", "Motor neuron", "Contraction"],
        [
            { q: "At the neuromuscular junction acetylcholine binds these on the muscle.", a: "Nicotinic receptors", why: "Receptors on the muscle fiber." },
            { q: "The cell that releases acetylcholine onto the muscle.", a: "Motor neuron", why: "The sender." },
            { q: "What happens in the muscle after the handoff.", a: "Contraction", why: "Every voluntary movement depends on this one handoff." }
        ],
        3,
        "nt-achjob-done",
        "You know the neuromuscular junction",
        "Every voluntary movement depends on this one handoff.",
        "Motor neuron, nicotinic receptors, contraction. Hit Reset to try again."
    );


    SIMS["nt-nmj"] = function (root) {

        const defaults = { who: "normal" };
        const state = { who: "normal" };
        const seen = {};
        let t = 0;
        let ach = 0;
        let tension = 0;
        let hit = false;

        root.innerHTML =
            head("Watch: the neuromuscular junction") +
            canvasFor(680, 330, "A motor neuron terminal above a muscle fiber. Every second or so the neuron releases a puff of acetylcholine, which binds receptors on the muscle and makes it contract. Normally acetylcholinesterase clears it within about a millisecond. With a nerve agent the enzyme is blocked, so acetylcholine floods the synapse and the muscle seizes. In myasthenia gravis the receptors are attacked, so the muscle is weak.") +
            '<div class="fd-stat-row">' + stat("Acetylcholine in the cleft", "a") + stat("Muscle tension", "t") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Condition", "who", [["normal", "Normal"], ["agent", "Nerve agent (AChE blocked)"], ["mg", "Myasthenia gravis (fewer receptors)"]]) +
            '<p class="fd-sim-formula">Acetylcholinesterase (AChE) breaks acetylcholine down within about a millisecond. Nerve agents block AChE, so acetylcholine floods the synapse and muscles seize. In myasthenia gravis the immune system attacks the muscle\'s receptors, causing weakness. When cleanup fails, the message never stops. (Time is stretched so you can see it.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            seen[state.who] = true;
            out(root, "a", ach < 0.15 ? "cleared" : ach > 1.2 ? "flooding" : "puff present");
            out(root, "t", Math.round(tension * 100) + " %");
            out(root, "verdict", state.who === "normal" ? "Release, contract, clean up: a crisp pulse each time" : state.who === "agent" ? "Cleanup blocked: acetylcholine piles up and the muscle seizes" : "Too few receptors: even a normal puff gives a weak contraction");

            if (!hit && seen.normal && seen.agent && seen.mg) {

                hit = true;
                F.reward("nt-nmj", 10, "You saw three versions of the neuromuscular junction");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            ctx.fillStyle = TEAL + ".5)";
            ctx.fillRect(120, 20, 440, 50);
            txt(ctx, "motor neuron terminal", 340, 50, 13, "rgba(6,10,24,.95)", "center", true);

            // acetylcholine molecules in the cleft
            const n = Math.round(clamp(ach, 0, 3) * 14);

            for (let i = 0; i < n; i++) { dot(ctx, 140 + (i * 53) % 400 + Math.sin(t * 2 + i) * 6, 90 + (i * 17) % 60, 4.6, ROSE + ".95)"); }

            // receptors, fewer in myasthenia
            const nr = state.who === "mg" ? 3 : 8;

            for (let i = 0; i < nr; i++) { ctx.fillStyle = BLUE + ".95)"; ctx.fillRect(140 + i * (state.who === "mg" ? 130 : 52), 160, 22, 12); }

            txt(ctx, state.who === "mg" ? "few receptors" : "nicotinic receptors", 80, 172, 11, TEXT + ".75)", "center");

            // the muscle, thicker when contracted
            const th = 70 + tension * 50;

            ctx.fillStyle = ROSE + ".55)";
            ctx.beginPath();
            ctx.moveTo(100, 180);
            ctx.quadraticCurveTo(340, 180 - tension * 8, 580, 180);
            ctx.lineTo(580, 180 + th);
            ctx.quadraticCurveTo(340, 180 + th + tension * 24, 100, 180 + th);
            ctx.closePath();
            ctx.fill();
            txt(ctx, "muscle fiber", 340, 180 + th / 2 + 4, 14, "rgba(6,10,24,.9)", "center", true);

            // enzyme
            if (state.who === "agent") { txt(ctx, "✖ AChE blocked", 600, 120, 13, ROSE + "1)", "center", true); } else { txt(ctx, "✂️ AChE clears it", 600, 120, 12, TEXT + ".8)", "center"); }

            // tension bar
            ctx.fillStyle = GREY + ".2)";
            ctx.fillRect(120, 300, 440, 12);
            ctx.fillStyle = (tension > 0.8 ? ROSE : TEAL) + ".9)";
            ctx.fillRect(120, 300, 440 * tension, 12);
        }

        animate(root, function (dt) {

            t += dt;

            if (Math.floor(t / 1.6) !== Math.floor((t - dt) / 1.6)) { ach += 1.4; }

            const clear2 = state.who === "agent" ? 0.03 : 4.5;

            ach *= Math.exp(-clear2 * dt);

            const rec = state.who === "mg" ? 0.3 : 1;
            const target = clamp(ach * rec * 0.8, 0, 1);

            tension += (target - tension) * Math.min(1, dt * 6);

            update();
            draw();
        });

        wire(root, state, defaults, function () { ach = 0; tension = 0; update(); });

        update();
        draw();
    };


    SIMS["nt-achbrain"] = quiz(
        "Game: acetylcholine in the brain",
        ["Attention and memory", "Lost in Alzheimer's disease", "Donepezil"],
        [
            { q: "What acetylcholine in the brain supports, along with learning.", a: "Attention and memory", why: "A cognitive messenger." },
            { q: "Cholinergic neurons are these.", a: "Lost in Alzheimer's disease", why: "The cells that make acetylcholine die." },
            { q: "Inhibits acetylcholinesterase, so the remaining acetylcholine acts longer.", a: "Donepezil", why: "Blocking an enzyme can make a weak signal stronger." }
        ],
        3,
        "nt-achbrain-done",
        "You know acetylcholine in the brain",
        "Blocking an enzyme can make a weak signal stronger.",
        "Attention, loss, donepezil. Hit Reset to try again."
    );


    SIMS["nt-ne"] = quiz(
        "Game: norepinephrine",
        ["Made from dopamine", "Alert and ready", "A drug target"],
        [
            { q: "One more chemical step from dopamine makes it.", a: "Made from dopamine", why: "The chemical cousin of adrenaline." },
            { q: "Raises arousal and attention, and is part of the fight-or-flight response.", a: "Alert and ready", why: "The alertness molecule." },
            { q: "Some ADHD and antidepressant drugs raise it.", a: "A drug target", why: "A lever to pull." }
        ],
        3,
        "nt-ne-done",
        "You know norepinephrine",
        "It's the chemical cousin of adrenaline.",
        "Made from dopamine, makes you alert, drug target. Hit Reset to try again."
    );


    SIMS["nt-slowmsgs"] = quiz(
        "Game: fast small messengers or slow big ones?",
        ["Classic small transmitters", "Neuropeptides and gases"],
        [
            { q: "Chains of amino acids, much larger than the classic transmitters, such as the endorphins.", a: "Neuropeptides and gases", why: "Larger and slower." },
            { q: "Glutamate, GABA and dopamine.", a: "Classic small transmitters", why: "Fast and local." },
            { q: "Diffuse farther, and act more slowly and for longer.", a: "Neuropeptides and gases", why: "Not all messages are fast and local." },
            { q: "Nitric oxide.", a: "Neuropeptides and gases", why: "A small gas that acts as a messenger." }
        ],
        4,
        "nt-slowmsgs-done",
        "You know the slower messengers",
        "Not all messages are fast and local.",
        "Small and fast, or big and slow. Hit Reset to try again."
    );


    /* ======================================
       UNIT 10: IONOTROPIC AND METABOTROPIC RECEPTORS
    ====================================== */

    SIMS["nt-twofamilies"] = quiz(
        "Game: door or doorbell?",
        ["Ionotropic (a door)", "Metabotropic (a doorbell)"],
        [
            { q: "A receptor that is also an ion channel: binding opens it directly.", a: "Ionotropic (a door)", why: "No middleman." },
            { q: "A receptor that activates a G protein, starting a signaling cascade inside the cell.", a: "Metabotropic (a doorbell)", why: "It rings something inside." },
            { q: "Responses start within a millisecond.", a: "Ionotropic (a door)", why: "Fast and direct." },
            { q: "One bound receptor can trigger many downstream molecules.", a: "Metabotropic (a doorbell)", why: "Amplified." }
        ],
        4,
        "nt-twofamilies-done",
        "You know the two receptor families",
        "One is a door, the other is a doorbell.",
        "Ionotropic: fast, direct. Metabotropic: slow, amplified. Hit Reset to try again."
    );


    SIMS["nt-receptorrace"] = function (root) {

        const defaults = { kind: "both", gain: 20 };
        const state = { kind: "both", gain: 20 };
        const seen = {};
        let t = 0;

        root.innerHTML =
            head("Try it: fast and direct, or slow and amplified?") +
            canvasFor(680, 320, "The size of a cell's response over time after a transmitter arrives, on a logarithmic time axis from one millisecond to ten seconds. The ionotropic response starts at once, within a millisecond, and fades quickly. The metabotropic response starts later, builds through a signaling cascade, is amplified, and lasts much longer.") +
            '<div class="fd-stat-row">' + stat("Ionotropic starts after", "i") + stat("Metabotropic starts after", "m") + stat("Metabotropic lasts", "l") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Show", "kind", [["both", "Both"], ["io", "Ionotropic"], ["meta", "Metabotropic"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Amplification of the metabotropic cascade", key: "gain", min: 1, max: 100, step: 1, value: 20 }) +
            "</div>" +
            '<p class="fd-sim-formula">Ionotropic responses start within a millisecond (AMPA and NMDA glutamate, GABA-A, nicotinic acetylcholine, glycine). Metabotropic effects take tens of milliseconds to seconds, and can last longer (dopamine D1 to D5, most serotonin receptors, mGluRs, GABA-B, muscarinic acetylcholine). One bound receptor triggers many downstream molecules. (Illustrative curves.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function io(ms) { return ms < 0 ? 0 : Math.min(1, ms / 0.5) * Math.exp(-ms / 15) * 0.6; }
        function meta(ms) { return ms < 30 ? 0 : (1 - Math.exp(-(ms - 30) / 400)) * Math.exp(-(ms - 30) / 4000) * Math.min(1, state.gain / 30) * 1.4; }

        function update() {

            seen[state.kind] = true;
            setVal(root, "gain", state.gain + "×");
            out(root, "i", "under 1 ms");
            out(root, "m", "tens of ms");
            out(root, "l", "seconds");
            out(root, "verdict", "Speed is the key difference: the door is instant, the doorbell takes a moment but can be amplified and lasts");

            if (Object.keys(seen).length >= 3 && state.gain >= 50) {
                F.reward("nt-receptorrace", 10, "You compared the door and the doorbell");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (ms) { return L + (Math.log10(Math.max(ms, 0.5)) + 0.3) / 4.3 * (R - L); };
            const Y = function (v) { return B - clamp(v, 0, 1) * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [[1, "1 ms"], [10, "10 ms"], [100, "100 ms"], [1000, "1 s"], [10000, "10 s"]].forEach(function (g) { txt(ctx, g[1], X(g[0]), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "time after the transmitter arrives (log scale) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "response ↑", L + 36, T + 4, 12, TEXT + ".75)");

            [["io", TEAL, io, "ionotropic"], ["meta", GOLD, meta, "metabotropic"]].forEach(function (c) {

                if (state.kind !== "both" && state.kind !== c[0]) { return; }

                ctx.strokeStyle = c[1] + ".98)";
                ctx.lineWidth = 3.4;
                ctx.beginPath();

                for (let lm = -0.3; lm <= 4; lm += 0.03) {

                    const ms = Math.pow(10, lm);

                    if (lm === -0.3) { ctx.moveTo(X(ms), Y(c[2](ms))); } else { ctx.lineTo(X(ms), Y(c[2](ms))); }
                }

                ctx.stroke();
            });

            txt(ctx, "door: ionotropic", X(4), Y(0.5), 12, TEAL + "1)", "start", true);
            txt(ctx, "doorbell: metabotropic", X(900), Y(0.78), 12, GOLD + "1)", "center", true);

            // the moving marker
            const ms = Math.pow(10, -0.3 + (t * 0.25 % 1) * 4.3);

            ctx.strokeStyle = TEXT + ".4)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(X(ms), T); ctx.lineTo(X(ms), B);
            ctx.stroke();
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-ionometa"] = quiz(
        "Game: ionotropic or metabotropic?",
        ["Ionotropic", "Metabotropic"],
        [
            { q: "Nicotinic acetylcholine receptors.", a: "Ionotropic", why: "Fast and direct." },
            { q: "Dopamine D1 to D5.", a: "Metabotropic", why: "Slower, via G proteins." },
            { q: "AMPA and NMDA glutamate receptors.", a: "Ionotropic", why: "Ion channels." },
            { q: "Most serotonin receptors.", a: "Metabotropic", why: "Though one family is an ion channel." },
            { q: "GABA-A.", a: "Ionotropic", why: "A chloride channel." },
            { q: "GABA-B.", a: "Metabotropic", why: "Slower, longer-lasting inhibition." }
        ],
        5,
        "nt-ionometa-done",
        "You can sort receptors into families",
        "Ionotropic receptors carry the fast signals; metabotropic receptors tune and shape activity.",
        "Door or doorbell. Hit Reset to try again."
    );


    SIMS["nt-subtypes"] = quiz(
        "Game: many receptors, one molecule",
        ["Many subtypes", "Selective drugs", "Different jobs"],
        [
            { q: "Serotonin alone has more than a dozen of these.", a: "Many subtypes", why: "Mostly metabotropic, plus one ion-channel family." },
            { q: "These aim at one receptor subtype.", a: "Selective drugs", why: "So only one job is targeted." },
            { q: "A single molecule can do these in different places.", a: "Different jobs", why: "Because the receptors differ." }
        ],
        3,
        "nt-subtypes-done",
        "You know why subtypes matter",
        "Selective drugs aim at one subtype.",
        "Many subtypes allow different jobs and selective drugs. Hit Reset to try again."
    );


    /* ======================================
       UNIT 11: BINDING AND AFFINITY
    ====================================== */

    SIMS["nt-bindquiz"] = quiz(
        "Game: reading the binding curve",
        ["More occupied", "Half occupied", "Nearly full"],
        [
            { q: "More ligand means this fraction of receptors, up to a limit.", a: "More occupied", why: "Occupancy rises with concentration." },
            { q: "At [L] = Kd.", a: "Half occupied", why: "That is the definition of Kd." },
            { q: "At 100 × Kd.", a: "Nearly full", why: "About 99 % occupied." },
            { q: "A weaker binder needs this to reach the same occupancy.", a: "More occupied", why: "More ligand: tighter binders reach 50 % at lower concentrations." }
        ],
        4,
        "nt-bindquiz-done",
        "You can read a binding curve",
        "Kd is the concentration for half occupancy.",
        "Occupancy rises, then flattens. Hit Reset to try again."
    );


    SIMS["nt-occupancy"] = function (root) {

        const defaults = { lc: 1, lk: 1 };
        const state = { lc: 1, lk: 1 };
        const seen = {};

        root.innerHTML =
            head("Try it: occupancy = [L] ÷ ([L] + Kd)") +
            canvasFor(680, 320, "A binding curve of receptor occupancy against ligand concentration on a log axis. It rises, then flattens as the receptors fill. A dot shows the chosen concentration and the Kd, where half the receptors are occupied.") +
            '<div class="fd-stat-row">' + stat("Ligand [L]", "l") + stat("Kd", "k") + stat("Occupied", "o") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Ligand concentration (log, in nM)", key: "lc", min: -1, max: 4, step: 0.05, value: 1 }) +
            slider({ label: "Kd (log, in nM): smaller means tighter binding", key: "lk", min: 0, max: 3, step: 0.1, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">[L] is the free ligand concentration, and Kd is the dissociation constant, the concentration at which half the receptors are occupied. A worked example with Kd = 10 nM: at 1 nM about 9 %, at 10 nM 50 %, at 100 nM about 91 %. A tenfold change in concentration moves occupancy from about 9 % to about 91 %.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function fmt(nM) { return nM >= 1000 ? (nM / 1000).toFixed(1) + " µM" : nM >= 10 ? Math.round(nM) + " nM" : nM.toFixed(1) + " nM"; }

        function update() {

            const L = Math.pow(10, state.lc);
            const K = Math.pow(10, state.lk);
            const o = L / (L + K);

            seen[o < 0.15 ? "lo" : o > 0.85 ? "hi" : "mid"] = true;
            setVal(root, "lc", fmt(L));
            setVal(root, "lk", fmt(K));
            out(root, "l", fmt(L));
            out(root, "k", fmt(K));
            out(root, "o", Math.round(o * 100) + " %");
            out(root, "verdict", Math.abs(o - 0.5) < 0.03 ? "At Kd: half the receptors are occupied" : o < 0.15 ? "Mostly empty: far below Kd" : o > 0.85 ? "Nearly full: far above Kd" : "In the steep, useful part of the curve");

            if (Object.keys(seen).length >= 3) {
                F.reward("nt-occupancy", 10, "You swept the whole binding curve");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L0 = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (lc) { return L0 + (lc + 1) / 5 * (R - L0); };
            const Y = function (o) { return B - o * (B - T); };
            const K = Math.pow(10, state.lk);

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L0, T); ctx.lineTo(L0, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 0.5, 1].forEach(function (v) { txt(ctx, Math.round(v * 100) + " %", L0 - 28, Y(v) + 4, 12, TEXT + ".7)"); });
            [-1, 0, 1, 2, 3, 4].forEach(function (e) { txt(ctx, Math.pow(10, e) + " nM", X(e), B + 18, 11, TEXT + ".65)"); });
            txt(ctx, "ligand concentration (log) →", (L0 + R) / 2, B + 40, 13, TEXT + ".85)");
            M.ylab(ctx, "receptors occupied (%)", (T + B) / 2);

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let lc = -1; lc <= 4.001; lc += 0.05) {

                const L = Math.pow(10, lc);

                if (lc === -1) { ctx.moveTo(X(lc), Y(L / (L + K))); } else { ctx.lineTo(X(lc), Y(L / (L + K))); }
            }

            ctx.stroke();

            ctx.strokeStyle = GOLD + ".7)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(L0, Y(0.5)); ctx.lineTo(X(state.lk), Y(0.5)); ctx.lineTo(X(state.lk), B);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "Kd", X(state.lk), B - 8, 12, GOLD + "1)", "center", true);

            const Lc = Math.pow(10, state.lc);

            dot(ctx, X(state.lc), Y(Lc / (Lc + K)), 9, "rgba(255,255,255,1)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-compete"] = function (root) {

        const defaults = { a: 10, b: 0 };
        const state = { a: 10, b: 0 };
        const KA = 10;
        const KB = 5;
        let hit = false;

        root.innerHTML =
            head("Try it: an agonist and an antagonist compete") +
            art("0 0 340 200", "A row of receptors, each occupied by the agonist, by the antagonist, or empty. The more antagonist is present, the fewer receptors the agonist can activate.") +
            '<div class="fd-stat-row">' + stat("Activated by the agonist", "a") + stat("Blocked by the antagonist", "b") + stat("Empty", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Agonist concentration (nM; Kd 10 nM)", key: "a", min: 0, max: 300, step: 5, value: 10 }) +
            slider({ label: "Antagonist concentration (nM; Kd 5 nM)", key: "b", min: 0, max: 300, step: 5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">An agonist binds and activates the receptor. An antagonist binds and blocks activation, without activating it. Both compete for the same receptors, so occupancy by the agonist is [A]/Kd<sub>A</sub> ÷ (1 + [A]/Kd<sub>A</sub> + [B]/Kd<sub>B</sub>). Affinity is how tightly it binds; efficacy is what it does once bound. (Simplified competition model.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const a = state.a / KA;
            const b = state.b / KB;
            const d = 1 + a + b;
            const fa = a / d;
            const fb = b / d;

            setVal(root, "a", state.a + " nM");
            setVal(root, "b", state.b + " nM");
            out(root, "a", Math.round(fa * 100) + " %");
            out(root, "b", Math.round(fb * 100) + " %");
            out(root, "e", Math.round(100 / d) + " %");
            out(root, "verdict", fb > 0.5 ? "The antagonist has taken over the receptors: the agonist can do little" : state.b === 0 ? "No antagonist: the agonist works freely" : "The antagonist is competing: fewer receptors are activated");

            const n = 20;
            const na = Math.round(fa * n);
            const nb = Math.round(fb * n);
            let s = "";

            for (let i = 0; i < n; i++) {

                const col = i < na ? "rgba(84,224,199,.95)" : i < na + nb ? "rgba(255,105,120,.95)" : "rgba(170,179,207,.3)";

                s += rect(14 + (i % 10) * 31, 40 + Math.floor(i / 10) * 44, 24, 30, col, "rgba(255,255,255,.4)");
            }

            s += label(170, 24, "20 receptors", 7.5, "middle", "var(--muted)");
            s += label(170, 150, "teal: agonist  ·  rose: antagonist  ·  grey: empty", 7, "middle", "var(--muted)");

            svg.innerHTML = s;

            if (!hit && state.a >= 100 && state.b >= 100 && fb > 0.5) {

                hit = true;
                F.reward("nt-compete", 10, "You let an antagonist win the receptors");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["nt-agonist"] = quiz(
        "Game: agonist, antagonist or partial?",
        ["Agonist", "Antagonist", "Partial agonist"],
        [
            { q: "Binds and activates the receptor.", a: "Agonist", why: "It does something once bound." },
            { q: "Binds and blocks activation, without activating it.", a: "Antagonist", why: "It sits in the way." },
            { q: "Binds and activates only weakly.", a: "Partial agonist", why: "Less efficacy." },
            { q: "Affinity is how tightly it binds. This is what it does once bound.", a: "Agonist", why: "Efficacy." }
        ],
        4,
        "nt-agonist-done",
        "You can tell them apart",
        "Affinity is how tightly it binds. Efficacy is what it does once bound.",
        "Activate, block, partly activate. Hit Reset to try again."
    );


    /* ======================================
       UNIT 12: DRUGS AT THE SYNAPSE
    ====================================== */

    SIMS["nt-levers"] = function (root) {

        const defaults = { drug: "none" };
        const state = { drug: "none" };
        const rand = mulberry(8);
        const seen = {};
        let mols = [];
        let t = 0;

        root.innerHTML =
            head("Try it: pull one of four levers") +
            canvasFor(680, 330, "A synapse with transmitter molecules in the cleft and receptors on the receiving cell. Choosing a drug changes the cleft or the receptors: an agonist activates receptors directly, an antagonist blocks them, a reuptake blocker and an enzyme inhibitor both raise the amount of transmitter. A gauge shows the receiving cell's response.") +
            '<div class="fd-stat-row">' + stat("Transmitter in the cleft", "c") + stat("Response of the receiving cell", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Drug", "drug", [["none", "No drug"], ["ago", "Agonist"], ["ant", "Antagonist"], ["reu", "Reuptake blocker"], ["enz", "Enzyme inhibitor"]]) +
            '<p class="fd-sim-formula">Almost every drug that acts on neurotransmission works at one of a few places: an agonist (nicotine, pramipexole), an antagonist (haloperidol, curare), a reuptake blocker (fluoxetine, cocaine, methylphenidate), or an enzyme inhibitor (donepezil, selegiline). The mechanism often hides in the drug\'s name or class. (Illustrative response values.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function model() {

            const T = state.drug === "reu" || state.drug === "enz" ? 4 : 1;
            let resp = T / (T + 1);

            if (state.drug === "ago") { resp = 0.9; }
            if (state.drug === "ant") { resp = 0.1; }

            return { T: T, resp: resp };
        }

        function update() {

            const m = model();

            seen[state.drug] = true;
            out(root, "c", m.T === 4 ? "high (more lingers)" : "normal");
            out(root, "r", Math.round(m.resp * 100) + " %");
            out(root, "verdict", { none: "Normal: a moderate response", ago: "Agonist: activates the receptors directly", ant: "Antagonist: blocks the receptors, so the response is shut down", reu: "Reuptake blocker: the transmitter lingers and its effect grows", enz: "Enzyme inhibitor: breakdown is blocked, so the transmitter lingers" }[state.drug]);

            if (Object.keys(seen).length >= 5) {
                F.reward("nt-levers", 10, "You pulled all four levers");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const m = model();

            ctx.fillStyle = TEAL + ".45)";
            ctx.fillRect(100, 20, 380, 60);
            txt(ctx, "sending terminal", 290, 52, 13, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = PURPLE + ".45)";
            ctx.fillRect(100, 240, 380, 60);
            txt(ctx, "receiving cell", 290, 280, 13, "rgba(6,10,24,.95)", "center", true);

            // transporters
            for (let i = 0; i < 4; i++) {

                ctx.fillStyle = (state.drug === "reu" ? ROSE : GOLD) + ".95)";
                ctx.fillRect(130 + i * 88, 78, 18, 14);

                if (state.drug === "reu") { txt(ctx, "✖", 139 + i * 88, 108, 13, ROSE + "1)", "center", true); }
            }

            // receptors
            for (let i = 0; i < 4; i++) {

                const blocked = state.drug === "ant";
                const on = state.drug === "ago" || (!blocked && m.resp > 0.4);

                ctx.fillStyle = (blocked ? ROSE : on ? TEAL : BLUE) + ".95)";
                ctx.fillRect(130 + i * 88, 228, 24, 12);

                if (state.drug === "ago") { txt(ctx, "💊", 142 + i * 88, 222, 14, TEXT + ".95)"); }
            }

            if (state.drug === "enz") { txt(ctx, "✖ enzyme blocked", 540, 150, 13, ROSE + "1)", "center", true); }

            mols.forEach(function (mo) { dot(ctx, mo.x, mo.y, 4.6, ROSE + ".95)"); });

            // the response gauge
            ctx.fillStyle = GREY + ".2)";
            ctx.fillRect(560, 60, 24, 220);
            ctx.fillStyle = (m.resp > 0.7 ? GOLD : m.resp < 0.2 ? ROSE : TEAL) + ".9)";
            ctx.fillRect(560, 280 - 220 * m.resp, 24, 220 * m.resp);
            txt(ctx, "response", 572, 50, 12, TEXT + ".8)");
        }

        animate(root, function (dt) {

            t += dt;

            const m = model();
            const want = m.T * 9;

            if (mols.length < want && rand() < dt * 6) { mols.push({ x: 120 + rand() * 340, y: 95, vx: 0 }); }
            if (mols.length > want && rand() < dt * 6) { mols.shift(); }

            mols.forEach(function (mo) {

                mo.x += (rand() - 0.5) * 70 * dt;
                mo.y += (rand() - 0.5) * 70 * dt;
                mo.x = clamp(mo.x, 110, 470);
                mo.y = clamp(mo.y, 100, 225);
            });

            draw();
        });

        wire(root, state, defaults, function () { mols = []; update(); });

        update();
        draw();
    };


    SIMS["nt-drugmatch"] = quiz(
        "Game: which lever does it pull?",
        ["Agonist", "Antagonist", "Reuptake blocker", "Enzyme inhibitor"],
        [
            { q: "Nicotine, which activates nicotinic receptors.", a: "Agonist", why: "It activates directly." },
            { q: "Haloperidol, which blocks D2 receptors.", a: "Antagonist", why: "It blocks." },
            { q: "Fluoxetine, which blocks SERT.", a: "Reuptake blocker", why: "An SSRI." },
            { q: "Donepezil, which inhibits acetylcholinesterase.", a: "Enzyme inhibitor", why: "It blocks the cleanup enzyme." },
            { q: "Curare, which blocks nicotinic receptors at the muscle.", a: "Antagonist", why: "It blocks." },
            { q: "Cocaine and methylphenidate, which block the dopamine transporter.", a: "Reuptake blocker", why: "They block cleanup." },
            { q: "Selegiline, which inhibits MAO-B.", a: "Enzyme inhibitor", why: "It blocks breakdown." },
            { q: "Pramipexole, which activates D2 and D3 receptors.", a: "Agonist", why: "It activates directly." }
        ],
        6,
        "nt-drugmatch-done",
        "You can read a drug's mechanism",
        "The mechanism often hides in the drug's name or class.",
        "Activate, block, block the pump, block the enzyme. Hit Reset to try again."
    );


    SIMS["nt-supply"] = quiz(
        "Game: more transmitter, two ways",
        ["Increases supply", "Releases more"],
        [
            { q: "L-DOPA is converted to dopamine.", a: "Increases supply", why: "A precursor." },
            { q: "Amphetamine pushes dopamine out of terminals by reversing the transporter.", a: "Releases more", why: "A releaser." },
            { q: "A drug can add transmitter, not just stop its removal.", a: "Increases supply", why: "Two more levers." },
            { q: "Reverses the transporter.", a: "Releases more", why: "Amphetamine." }
        ],
        4,
        "nt-supply-done",
        "You know the supply levers",
        "A drug can add transmitter, not just stop its removal.",
        "Precursors add supply; releasers push it out. Hit Reset to try again."
    );


    SIMS["nt-allosteric"] = function (root) {

        const defaults = { lg: 0, pam: "off" };
        const state = { lg: 0, pam: "off" };
        const seen = {};

        root.innerHTML =
            head("Try it: turn up the volume without being the signal") +
            canvasFor(680, 320, "Two curves of the GABA-A receptor's response against GABA concentration. A benzodiazepine, a positive allosteric modulator, makes the same GABA produce a bigger response, shifting the curve to the left. At zero GABA the drug does nothing on its own.") +
            '<div class="fd-stat-row">' + stat("GABA", "g") + stat("Response without the drug", "a") + stat("Response with the drug", "b") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Benzodiazepine", "pam", [["off", "Not present"], ["on", "Present"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "GABA concentration (log scale, relative)", key: "lg", min: -2, max: 2, step: 0.05, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Benzodiazepines bind to a separate site on the GABA-A receptor. They do not open it themselves, but they make GABA\'s own effect stronger: positive allosteric modulation. A drug can turn up the volume without being the signal. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function resp(g, pam) { return g / (g + (pam ? 0.3 : 1)); }

        function update() {

            const g = Math.pow(10, state.lg);

            seen[state.pam] = true;
            setVal(root, "lg", g.toFixed(g < 1 ? 2 : 1));
            out(root, "g", g.toFixed(g < 1 ? 2 : 1) + " (relative)");
            out(root, "a", Math.round(resp(g, false) * 100) + " %");
            out(root, "b", Math.round(resp(g, true) * 100) + " %");
            out(root, "verdict", g < 0.03 ? "With almost no GABA, even the drug does nothing: it cannot open the channel itself" : "The same GABA now gives a bigger response with the drug present");

            if (seen.on && seen.off && g >= 0.2 && g <= 3) {
                F.reward("nt-allosteric", 10, "You saw a modulator turn up the volume");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (lg) { return L + (lg + 2) / 4 * (R - L); };
            const Y = function (v) { return B - v * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [-2, -1, 0, 1, 2].forEach(function (e) { txt(ctx, e === 0 ? "1" : "10" + (e < 0 ? "⁻" : "") + String(Math.abs(e)).replace("1", "¹").replace("2", "²"), X(e), B + 18, 11, TEXT + ".7)"); });
            txt(ctx, "GABA (log scale) →", (L + R) / 2, B + 38, 13, TEXT + ".85)");
            txt(ctx, "response ↑", L + 36, T + 4, 12, TEXT + ".75)");

            [[false, GREY, "GABA alone"], [true, TEAL, "GABA + benzodiazepine"]].forEach(function (c) {

                ctx.strokeStyle = c[1] + (state.pam === "on" || !c[0] ? ".98)" : ".25)");
                ctx.lineWidth = c[0] ? 3.4 : 2.4;
                ctx.beginPath();

                for (let lg = -2; lg <= 2.001; lg += 0.05) {

                    const y = Y(resp(Math.pow(10, lg), c[0]));

                    if (lg === -2) { ctx.moveTo(X(lg), y); } else { ctx.lineTo(X(lg), y); }
                }

                ctx.stroke();
            });

            const g = Math.pow(10, state.lg);

            dot(ctx, X(state.lg), Y(resp(g, state.pam === "on")), 8, GOLD + "1)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["nt-drugcatch"] = quiz(
        "Game: the catch with drugs",
        ["Selectivity", "Side effects", "Reaching the brain"],
        [
            { q: "A drug may touch several receptors or transporters.", a: "Selectivity", why: "Rarely perfectly selective." },
            { q: "The result of a drug acting at more than the intended place.", a: "Side effects", why: "Off-target effects." },
            { q: "It has to cross the blood-brain barrier.", a: "Reaching the brain", why: "Both problems are why researchers want better models and sensors." }
        ],
        3,
        "nt-drugcatch-done",
        "You know the catches",
        "A drug has to be effective, selective, and able to get there.",
        "Selectivity, side effects, access. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="nt-"]').forEach(F.mount);

})();
