/* ========================================
   BLOOD-BRAIN BARRIER ON A CHIP: INTERACTIVE SIMULATORS, PART 2

   Unit 6: animal models and their limits, the ladder of models.
   Unit 7: Transwell models.
   Unit 8: TEER and permeability.
   Unit 9: what an organ-on-a-chip is.
   Unit 10: microfluidics basics.

   Registers on window.FabInteract; loaded by diagram-sims-bbb.js.
   Teaching models: numbers and shapes are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers || !F.bbbHelpers) {
        return;
    }

    const M = F.memsHelpers;
    const H = F.bbbHelpers;
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
    const RED = H.RED;
    const canvasFor = H.canvasFor;
    const clear = H.clear;
    const txt = H.txt;
    const dot = H.dot;
    const priority = H.priority;


    /* ======================================
       UNIT 6: ANIMAL MODELS AND THEIR LIMITS
    ====================================== */

    SIMS["bbb-limits"] = quiz(
        "Game: why look beyond animals?",
        ["Species differences", "Time and cost", "Hard to see inside", "Ethics"],
        [
            { q: "Transporters and efflux pumps differ between rodents and humans.", a: "Species differences", why: "In amount and in which drugs they recognize." },
            { q: "Studies take weeks to months and use many animals per compound.", a: "Time and cost", why: "Slow and expensive." },
            { q: "It is difficult to change one variable, such as flow or one cell type, and watch single cells.", a: "Hard to see inside", why: "A whole animal is hard to dissect." },
            { q: "Researchers aim to reduce, refine and replace animal use: the 3Rs.", a: "Ethics", why: "A guiding principle of animal research." },
            { q: "A drug works in rats but not in people because the pumps differ.", a: "Species differences", why: "A human barrier is not a rat barrier." }
        ],
        4,
        "bbb-limits-done",
        "You know the limits of animal models",
        "An animal is a whole system, which is also what makes it hard to dissect.",
        "Species, time and cost, visibility, ethics. Hit Reset to try again."
    );


    SIMS["bbb-modelneeds"] = priority({
        title: "Try it: what must a replacement model do?",
        aria: "Bars showing how well four kinds of model fit the priorities you set.",
        key: "bbb-modelneeds",
        props: [
            { k: "human", n: "Human cells" },
            { k: "ctrl", n: "Control of one variable at a time" },
            { k: "thru", n: "Throughput" },
            { k: "real", n: "Realism" }
        ],
        fam: [
            { n: "Rodent study", c: ROSE, r: { human: 1, ctrl: 2, thru: 1, real: 5 } },
            { n: "Cells in a dish", c: BLUE, r: { human: 4, ctrl: 4, thru: 5, real: 1 } },
            { n: "Transwell", c: GOLD, r: { human: 4, ctrl: 4, thru: 4, real: 2 } },
            { n: "Barrier chip", c: TEAL, r: { human: 4, ctrl: 5, thru: 3, real: 4 } }
        ],
        foot: "Ratings are rough and relative (1 to 5). Real, controllable, scalable: very few models manage all three."
    });


    SIMS["bbb-ladder"] = function (root) {

        const defaults = { need: 3, budget: 5 };
        const state = { need: 3, budget: 5 };
        const rungs = [
            { n: "Cells in a dish", real: 1, cost: 1, c: BLUE },
            { n: "Transwell", real: 2, cost: 2, c: GOLD },
            { n: "Barrier chip", real: 4, cost: 4, c: TEAL },
            { n: "Animal study", real: 5, cost: 10, c: ROSE }
        ];
        const seen = {};

        root.innerHTML =
            head("Try it: climb the ladder from dish to organism") +
            art("0 0 340 210", "A ladder with four rungs: cells in a dish, a Transwell, a barrier chip and an animal study. Each step up adds realism and cost. Rungs that meet your realism need within your effort budget are highlighted.") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How realistic must the model be?", key: "need", min: 1, max: 5, step: 1, value: 3 }) +
            slider({ label: "How much effort and cost can you afford?", key: "budget", min: 1, max: 10, step: 1, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Each step up the ladder adds realism and cost. Chips aim for a sweet spot: human cells, controlled flow, and far less effort than an animal study. A chip sits between a dish and a living body. (Scores illustrative.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            setVal(root, "need", ["", "any", "some", "good", "high", "the real thing"][state.need]);
            setVal(root, "budget", state.budget);

            const ok = rungs.filter(function (r) { return r.real >= state.need && r.cost <= state.budget; });
            const best = ok.length ? ok[0] : null;

            seen[best ? best.n : "none"] = true;
            out(root, "verdict", best ? best.n + " is the cheapest rung that is realistic enough" : "No rung meets that need within that budget");

            let s = "";

            rungs.forEach(function (r, i) {

                const y = 160 - i * 40;
                const fits = ok.indexOf(r) >= 0;

                s += rect(40, y, 80 + r.real * 30, 28, r.c + (fits ? ".9)" : ".25)"), fits ? "rgba(255,255,255,.9)" : "none");
                s += label(46, y + 18, r.n, 8.5, "start", fits ? "#04201b" : "var(--text)");
                s += label(300, y + 11, "realism " + r.real + " · cost " + r.cost, 7, "end", "var(--muted)");
            });

            s += label(170, 14, "↑ more realistic, more costly", 8, "middle", "var(--muted)");

            svg.innerHTML = s;

            if (Object.keys(seen).length >= 3) {
                F.reward("bbb-ladder", 10, "You found the right rung for different needs");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["bbb-policy"] = quiz(
        "Game: true or false?",
        ["True", "False"],
        [
            { q: "In 2022 the U.S. FDA Modernization Act 2.0 removed the requirement that new drugs be tested in animals first.", a: "True", why: "It allows cell-based assays, organ-chips and computer models to substitute where appropriate." },
            { q: "Alternatives can replace animal tests with no need to show they work.", a: "False", why: "Alternatives still have to be validated, which is why good measurements matter." },
            { q: "Organ-chips are among the methods the law allows to substitute where appropriate.", a: "True", why: "Along with cell-based assays and computer models." },
            { q: "Animal testing became illegal everywhere in 2022.", a: "False", why: "The change removed a requirement; it did not ban animal testing." }
        ],
        4,
        "bbb-policy-done",
        "You know the policy picture",
        "Alternatives still have to be validated, which is why good measurements matter.",
        "Check what the law changed and what it did not. Hit Reset to try again."
    );


    /* ======================================
       UNIT 7: TRANSWELL MODELS
    ====================================== */

    SIMS["bbb-transwellparts"] = quiz(
        "Game: name the Transwell part",
        ["Porous membrane", "Top (apical) compartment", "Bottom (basolateral) compartment", "Coating"],
        [
            { q: "A thin porous plastic such as PET or polycarbonate, with pores about 0.4 to 3 micrometers wide.", a: "Porous membrane", why: "The cells grow on it." },
            { q: "The compartment that stands in for the blood.", a: "Top (apical) compartment", why: "Apical means the blood side." },
            { q: "The compartment that stands in for the brain.", a: "Bottom (basolateral) compartment", why: "The brain side." },
            { q: "Collagen and fibronectin help the cells attach.", a: "Coating", why: "A protein layer for the cells to stick to." },
            { q: "Samples can be taken from either of these sides.", a: "Top (apical) compartment", why: "And from the bottom one too." }
        ],
        4,
        "bbb-transwellparts-done",
        "You know the Transwell parts",
        "Two compartments separated by one cell layer: the simplest barrier model.",
        "Membrane, apical (blood), basolateral (brain), coating. Hit Reset to try again."
    );


    SIMS["bbb-transwell"] = function (root) {

        const defaults = { cult: "mono" };
        const state = { cult: "mono" };
        const tight = { mono: 0.3, co: 0.58, tri: 0.78 };
        const teer = { mono: 30, co: 70, tri: 110 };
        const rand = mulberry(15);
        const seen = {};
        let mols = [];
        let crossed = 0;
        let spawned = 0;

        root.innerHTML =
            head("Try it: add the neighbors to a Transwell") +
            canvasFor(680, 340, "A Transwell insert: a cup whose porous floor carries a layer of brain endothelial cells, with the blood compartment above and the brain compartment below. Support cells on the well floor or on the underside of the membrane make the barrier tighter, so fewer tracer molecules cross.") +
            '<div class="fd-stat-row">' + stat("TEER (illustrative)", "teer") + stat("Tracer that crossed", "x") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Culture", "cult", [["mono", "Mono-culture (endothelium only)"], ["co", "Co-culture (+ astrocytes below)"], ["tri", "Triple culture (+ pericytes too)"]]) +
            '<p class="fd-sim-formula">Astrocytes or pericytes on the well floor send signals through the medium; cells on opposite sides of the membrane can also reach through the pores and touch. Support cells usually tighten the barrier. The TEER values here are made up to show the trend.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            seen[state.cult] = true;
            out(root, "teer", teer[state.cult] + " Ω·cm²");
            out(root, "x", crossed + " of " + spawned + (spawned ? "  (" + Math.round(crossed / spawned * 100) + " %)" : ""));
            out(root, "verdict", state.cult === "mono" ? "Endothelium alone: a leakier barrier" : state.cult === "co" ? "Astrocytes below tighten the barrier" : "The whole cast: the tightest barrier of the three");

            if (Object.keys(seen).length >= 3 && spawned > 25) {
                F.reward("bbb-transwell", 10, "You compared mono-, co- and triple cultures");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const cx = 340;

            // the well and the insert
            ctx.strokeStyle = TEXT + ".6)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(150, 30); ctx.lineTo(150, 310); ctx.lineTo(530, 310); ctx.lineTo(530, 30);
            ctx.stroke();

            ctx.fillStyle = RED + ".1)";
            ctx.fillRect(210, 40, 260, 140);
            ctx.fillStyle = BLUE + ".08)";
            ctx.fillRect(152, 192, 376, 116);
            ctx.strokeStyle = TEXT + ".7)";
            ctx.beginPath();
            ctx.moveTo(210, 30); ctx.lineTo(210, 182); ctx.lineTo(470, 182); ctx.lineTo(470, 30);
            ctx.stroke();

            txt(ctx, "top: stands for the blood", 340, 62, 12, RED + "1)");
            txt(ctx, "bottom: stands for the brain", 340, 296, 12, TEXT + ".85)");

            // the membrane and the endothelial layer
            ctx.fillStyle = GREY + ".7)";
            ctx.fillRect(210, 182, 260, 8);

            for (let i = 0; i < 12; i++) {

                ctx.clearRect(218 + i * 21, 182, 6, 8);
                ctx.fillStyle = "rgba(6,10,24,.55)";
                ctx.fillRect(218 + i * 21, 182, 6, 8);
            }

            ctx.fillStyle = TEAL + ".8)";
            ctx.fillRect(210, 170, 260, 12);
            txt(ctx, "endothelial cells on the membrane", 340, 160, 11, TEAL + "1)");

            // support cells
            if (state.cult !== "mono") {

                for (let i = 0; i < 4; i++) {

                    ctx.fillStyle = ROSE + ".7)";
                    ctx.beginPath();
                    ctx.arc(190 + i * 100, 300, 14, 0, Math.PI * 2);
                    ctx.fill();
                }

                txt(ctx, "astrocytes", 170, 326, 11, ROSE + "1)");
            }

            if (state.cult === "tri") {

                ctx.fillStyle = "rgba(190,150,255,.9)";

                for (let i = 0; i < 3; i++) {

                    ctx.beginPath();
                    ctx.ellipse(250 + i * 90, 198, 22, 7, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                txt(ctx, "pericytes under the membrane", 440, 222, 11, "rgba(190,150,255,1)");
            }

            mols.forEach(function (m) { dot(ctx, m.x, m.y, 4.4, GOLD + ".95)"); });
        }

        animate(root, function (dt) {

            if (rand() < 0.12) {

                mols.push({ x: 222 + rand() * 236, y: 52, vy: 60, vx: (rand() - 0.5) * 20, ph: 0 });
                spawned++;
            }

            mols.forEach(function (m) {

                m.x += m.vx * dt;
                m.y += m.vy * dt;
                m.x = clamp(m.x, 216, 464);

                if (m.ph === 0 && m.y > 160) {

                    m.ph = 1;

                    if (rand() < 1 - tight[state.cult]) {

                        m.ph = 2;

                    } else {

                        m.vy = -Math.abs(m.vy);
                    }
                }

                if (m.ph === 2 && m.y > 215 && !m.c) {

                    m.c = true;
                    crossed++;
                    update();
                }

                if (m.ph === 1 && m.y < 52) { m.ph = 0; m.vy = Math.abs(m.vy); }

                if (m.y > 290) { m.vy = 0; }
            });

            mols = mols.filter(function (m) { return m.y < 295 || (m.c && m.y < 300); });

            draw();
        });

        wire(root, state, defaults, function () {

            mols = [];
            crossed = 0;
            spawned = 0;
            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["bbb-flowcells"] = function (root) {

        const defaults = { kind: "static" };
        const state = { kind: "static" };
        const rand = mulberry(26);
        const cells = [];
        const seen = {};
        let t = 0;

        for (let i = 0; i < 24; i++) { cells.push({ x: rand(), y: rand(), a: rand() * Math.PI, w: 0.7 + rand() * 0.6 }); }

        root.innerHTML =
            head("Try it: what flow does to the cells") +
            canvasFor(680, 320, "A top view of a layer of endothelial cells. In a static Transwell the cells are roundish and point in random directions. Under flow, as in a chip, the cells elongate and line up with the flow, and the barrier tightens.") +
            '<div class="fd-stat-row">' + stat("Cell shape", "shape") + stat("TEER (illustrative)", "teer") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Setup", "kind", [["static", "Transwell: still fluid"], ["flow", "Chip: flowing fluid"]]) +
            '<p class="fd-sim-formula">Fluid sits still in a Transwell, so the cells never feel the shear force of flowing blood. Under flow, endothelial cells line up with it, tighten their junctions and change their genes. Flow is the missing ingredient, and that is where chips come in.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            seen[state.kind] = true;
            out(root, "shape", state.kind === "static" ? "rounded, random directions" : "elongated, lined up");
            out(root, "teer", state.kind === "static" ? "about 30 Ω·cm²" : "about 70 Ω·cm²");
            out(root, "verdict", state.kind === "static" ? "No flow: the cells never feel the force of blood" : "Flow is a signal, not just a push: cells align and tighten");

            if (seen.static && seen.flow) {
                F.reward("bbb-flowcells", 10, "You saw cells respond to flow");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const flow = state.kind === "flow";

            cells.forEach(function (c, i) {

                const x = 40 + ((c.x * 600 + (flow ? t * 30 * 0.0 : 0)) % 600);
                const y = 30 + c.y * 260;
                const ang = flow ? 0 + Math.sin(i) * 0.06 : c.a;
                const len = flow ? 46 * c.w : 26;
                const wid = flow ? 18 : 24 * c.w;

                ctx.fillStyle = TEAL + ".55)";
                ctx.strokeStyle = TEAL + ".95)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(x, y, len / 2, wid / 2, ang, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                dot(ctx, x, y, 4, "rgba(6,10,24,.55)");
            });

            if (flow) {

                ctx.strokeStyle = BLUE + ".9)";
                ctx.lineWidth = 2.5;

                for (let i = 0; i < 4; i++) {

                    const y = 50 + i * 70;
                    const x = ((t * 80 + i * 150) % 700) - 20;

                    ctx.beginPath();
                    ctx.moveTo(x, y); ctx.lineTo(x + 40, y);
                    ctx.moveTo(x + 40, y); ctx.lineTo(x + 32, y - 5);
                    ctx.moveTo(x + 40, y); ctx.lineTo(x + 32, y + 5);
                    ctx.stroke();
                }

                txt(ctx, "flow →", 620, 22, 14, BLUE + "1)", "center", true);
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


    /* ======================================
       UNIT 8: TEER AND PERMEABILITY
    ====================================== */

    SIMS["bbb-teercalc"] = function (root) {

        const defaults = { rc: 300, rb: 100, area: 1.12 };
        const state = { rc: 300, rb: 100, area: 1.12 };
        let hit = false;
        const seen = {};

        root.innerHTML =
            head("Try it: from ohms to ohm square centimeters") +
            canvasFor(680, 320, "A bar on a log scale showing the calculated TEER, with marks for typical immortalized cell lines, stem-cell-derived models and the living body.") +
            '<div class="fd-stat-row">' + stat("TEER", "teer") + stat("That is typical of", "kind") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Insert size (membrane area)", "area", [["0.33", "24-well (0.33 cm²)"], ["1.12", "12-well (1.12 cm²)"], ["4.67", "6-well (4.67 cm²)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Reading with cells (R cells)", key: "rc", min: 100, max: 3000, step: 10, value: 300 }) +
            slider({ label: "Reading of an empty insert (R blank)", key: "rb", min: 50, max: 200, step: 5, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">TEER = (R<sub>cells</sub> − R<sub>blank</sub>) × A. Example: a 300 Ω reading with a 100 Ω blank on a 1.12 cm² insert gives (300 − 100) × 1.12 ≈ 224 Ω·cm². Multiplying by area makes results comparable across insert sizes.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function teer() { return Math.max(0, (state.rc - state.rb) * state.area); }

        function update() {

            const t = teer();
            const kind = t < 50 ? "immortalized cell lines (such as hCMEC/D3)" : t < 200 ? "a modest barrier" : t < 1500 ? "stem-cell-derived models" : "the living body (rodent vessels)";

            setVal(root, "rc", state.rc + " Ω");
            setVal(root, "rb", state.rb + " Ω");
            seen[kind] = true;
            out(root, "teer", Math.round(t).toLocaleString() + " Ω·cm²");
            out(root, "kind", kind);
            out(root, "verdict", Math.abs(state.rc - 300) < 1 && state.rb === 100 && Math.abs(state.area - 1.12) < 0.01 ? "The lesson's example: about 224 Ω·cm²" : "Higher is better, but the exact number depends on the method and the lab");

            if (!hit && Object.keys(seen).length >= 4) {

                hit = true;
                F.reward("bbb-teercalc", 10, "You reached every TEER range");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 60;
            const R = 640;
            const X = function (v) { return L + (Math.log10(Math.max(v, 1)) / 4) * (R - L); };
            const y0 = 130;

            [10, 30, 100, 300, 1000, 3000, 10000].forEach(function (v) {

                ctx.strokeStyle = GREY + ".2)";
                ctx.beginPath();
                ctx.moveTo(X(v), 60); ctx.lineTo(X(v), 200);
                ctx.stroke();
                txt(ctx, v.toLocaleString(), X(v), 218, 11, TEXT + ".65)");
            });

            txt(ctx, "TEER (Ω·cm², log scale) →", 340, 244, 13, TEXT + ".85)");

            // reference bands
            ctx.fillStyle = ROSE + ".22)";
            ctx.fillRect(X(1), 60, X(50) - X(1), 140);
            txt(ctx, "immortalized", (X(1) + X(50)) / 2, 80, 12, ROSE + "1)");
            ctx.fillStyle = GOLD + ".16)";
            ctx.fillRect(X(200), 60, X(3000) - X(200), 60);
            txt(ctx, "stem-cell derived (varies by lab)", (X(200) + X(3000)) / 2, 80, 12, GOLD + "1)");
            ctx.fillStyle = TEAL + ".18)";
            ctx.fillRect(X(1500), 130, X(10000) - X(1500), 70);
            txt(ctx, "in the body (about 1,500 or more)", (X(1500) + X(10000)) / 2, 150, 12, TEAL + "1)");

            const t = teer();

            ctx.fillStyle = "rgba(255,255,255,.95)";
            ctx.fillRect(L, y0 + 30, Math.max(2, X(Math.max(t, 1)) - L), 22);
            dot(ctx, X(Math.max(t, 1)), y0 + 41, 9, GOLD + "1)");
            txt(ctx, Math.round(t).toLocaleString(), X(Math.max(t, 1)), y0 + 28, 14, GOLD + "1)", "center", true);
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["bbb-teerlevels"] = quiz(
        "Game: typical TEER values",
        ["Immortalized cell lines", "Stem-cell derived", "In the body"],
        [
            { q: "Usually stay below about 50 Ω·cm² (for example hCMEC/D3).", a: "Immortalized cell lines", why: "They tend to form leaky barriers." },
            { q: "Protocols report hundreds to a few thousand Ω·cm², and results vary widely between labs.", a: "Stem-cell derived", why: "Promising, but not yet standardized." },
            { q: "Rodent brain vessels have been measured at about 1,500 Ω·cm² or more.", a: "In the body", why: "The target a model aims for." },
            { q: "Easy and cheap to grow, but with a leaky barrier.", a: "Immortalized cell lines", why: "Convenience over realism." },
            { q: "Higher is better, but the exact number depends on the method and the lab. Which source varies most between labs?", a: "Stem-cell derived", why: "Protocols differ." }
        ],
        4,
        "bbb-teerlevels-done",
        "You know the TEER ranges",
        "Higher is better, but the exact number depends on the method and the lab.",
        "Under 50 immortalized; hundreds to thousands stem-cell; 1,500+ in the body. Hit Reset to try again."
    );


    SIMS["bbb-papp"] = function (root) {

        const defaults = { tight: 50, c0: 10 };
        const state = { tight: 50, c0: 10 };
        let t = 0;
        let hit = false;
        const seen = {};

        root.innerHTML =
            head("Try it: measure how fast a tracer leaks across") +
            canvasFor(680, 320, "A plot of the amount of tracer that has crossed into the bottom compartment against time. A tighter barrier gives a flatter line. The slope, divided by the area and the starting concentration, is the apparent permeability.") +
            '<div class="fd-stat-row">' + stat("Apparent permeability Papp", "p") + stat("Tracer crossed after one hour", "q") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How tight the barrier is", key: "tight", min: 0, max: 100, step: 5, value: 50 }) +
            slider({ label: "Starting tracer concentration on top (µM)", key: "c0", min: 1, max: 100, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">P<sub>app</sub> = (dQ/dt) ÷ (A × C₀). Add a tracer such as sodium fluorescein, Lucifer yellow or a fluorescent dextran to the top compartment and sample the bottom over time. The result is in cm/s, and a tight barrier gives a low number. (Illustrative values; A = 1.12 cm².)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const A = 1.12;

        function papp() { return Math.pow(10, -3 - 3 * state.tight / 100); }

        function rate() { return papp() * A * state.c0; } // nmol/s (µM = nmol/mL)

        function update() {

            const p = papp();

            seen[state.tight <= 10 ? "leaky" : state.tight >= 90 ? "tight" : "mid"] = true;
            setVal(root, "tight", state.tight + " %");
            setVal(root, "c0", state.c0 + " µM");
            out(root, "p", p.toExponential(1).replace("e-", " × 10⁻").replace("e", "") + " cm/s");
            out(root, "q", (rate() * 3600).toFixed(rate() * 3600 >= 1 ? 1 : 3) + " nmol");
            out(root, "verdict", state.tight >= 80 ? "A tight barrier: a low number" : state.tight <= 20 ? "A leaky barrier: the tracer pours across" : "A moderate barrier");

            if (!hit && seen.leaky && seen.tight) {

                hit = true;
                F.reward("bbb-papp", 10, "You measured a leaky and a tight barrier");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 90;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (s) { return L + s / 3600 * (R - L); };
            const maxQ = 0.001 * A * 100 * 3600; // upper bound on the axis
            const Y = function (q) { return B - Math.min(1, q / maxQ) * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [0, 15, 30, 45, 60].forEach(function (m) { txt(ctx, m + " min", X(m * 60), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "time after adding the tracer →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "amount crossed ↑", L + 70, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(3600), Y(rate() * 3600));
            ctx.stroke();

            const s = (t % 1) * 3600;

            dot(ctx, X(s), Y(rate() * s), 7, GOLD + "1)");
            txt(ctx, "slope = dQ/dt", X(2400), Y(rate() * 2400) - 14, 13, GOLD + "1)", "center", true);
        }

        animate(root, function (dt) {

            t += dt * 0.15;
            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["bbb-twoviews"] = quiz(
        "Game: read both measurements",
        ["A good barrier", "A leaky barrier", "The readings disagree: check the method"],
        [
            { q: "High TEER and a low tracer leak.", a: "A good barrier", why: "A good model has high TEER and low tracer leak." },
            { q: "Low TEER and a high tracer leak.", a: "A leaky barrier", why: "Both views agree it is leaky." },
            { q: "High TEER, but the tracer leaks as if nothing were there.", a: "The readings disagree: check the method", why: "Reliable models are checked from more than one angle." },
            { q: "TEER of about 20 Ω·cm² and a tracer that crosses in minutes.", a: "A leaky barrier", why: "Typical of a weak immortalized-line barrier." },
            { q: "TEER of a few hundred Ω·cm² and very little tracer crossing.", a: "A good barrier", why: "Both readings point the same way." }
        ],
        4,
        "bbb-twoviews-done",
        "You read both views of a barrier",
        "Reliable models are checked from more than one angle.",
        "TEER senses ion leak; permeability measures molecules. Hit Reset to try again."
    );


    /* ======================================
       UNIT 9: WHAT IS AN ORGAN-ON-A-CHIP?
    ====================================== */

    SIMS["bbb-history"] = orderGame(
        "Game: the short history",
        [
            { n: "2010", d: "a lung-on-a-chip from Donald Ingber's lab at Harvard's Wyss Institute", why: "It helped launch the field." },
            { n: "2012", d: "early microfluidic models of the blood-brain barrier appear", why: "Barriers soon followed." },
            { n: "Today", d: "chips model many organs, and companies sell platforms", why: "The field is young, and still rapidly changing." }
        ],
        "bbb-history-done",
        "You ordered the history of organ-chips",
        "Tap the three milestones in the order they happened.",
        "Companies such as Emulate and MIMETAS sell platforms."
    );


    SIMS["bbb-chipadds"] = quiz(
        "Game: what do chips add?",
        ["Flow", "Forces", "Interfaces", "Small volumes"],
        [
            { q: "Fluid moves past the cells, as blood does.", a: "Flow", why: "Dishes are still." },
            { q: "Cells feel shear stress, and some chips add stretch.", a: "Forces", why: "Mechanical signals matter." },
            { q: "Different tissues sit face to face across a thin barrier.", a: "Interfaces", why: "Like blood and brain." },
            { q: "Tiny amounts of cells, medium and drug are enough.", a: "Small volumes", why: "Cheaper and gentler on rare cells." },
        ],
        4,
        "bbb-chipadds-done",
        "You know what a chip adds",
        "A chip rebuilds a tissue's surroundings, not just its cells.",
        "Flow, forces, interfaces, small volumes. Hit Reset to try again."
    );


    SIMS["bbb-honest"] = quiz(
        "Game: fair claim or overclaim?",
        ["Fair claim", "Overclaim"],
        [
            { q: "'This chip reproduces selected features of the blood-brain barrier so they can be measured.'", a: "Fair claim", why: "A chip is a model of selected features." },
            { q: "'This chip is a tiny working brain.'", a: "Overclaim", why: "A chip is not a tiny brain." },
            { q: "'A chip replaces the need for any other test.'", a: "Overclaim", why: "Each model answers different questions." },
            { q: "'A model earns trust by being right about things we already know.'", a: "Fair claim", why: "That is validation." },
            { q: "'A barrier suits a chip because it is a thin layer between two fluids.'", a: "Fair claim", why: "Two channels and a membrane build exactly that." }
        ],
        4,
        "bbb-honest-done",
        "You can spot an overclaim",
        "A chip is a model, and every model has to earn trust.",
        "Chips reproduce selected features, not whole organs. Hit Reset to try again."
    );


    /* ======================================
       UNIT 10: MICROFLUIDICS BASICS
    ====================================== */

    function erf(x) { return Math.tanh(1.2 * x); }

    SIMS["bbb-laminar"] = function (root) {

        const defaults = { v: 1, w: 200 };
        const state = { v: 1, w: 200 };
        const D = 5e-10; // m²/s, a small molecule
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: two streams side by side") +
            canvasFor(680, 320, "A microchannel with a blue stream entering at the top and a gold stream entering at the bottom. In laminar flow they run side by side and mix only slowly, by diffusion across the boundary. The faster the flow, the less time for mixing.") +
            '<div class="fd-stat-row">' + stat("Time to travel the channel", "t") + stat("Blur of the boundary", "b") + stat("Mixed?", "m") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Flow speed", key: "v", min: 0.1, max: 10, step: 0.1, value: 1 }) +
            slider({ label: "Channel width", key: "w", min: 50, max: 500, step: 10, value: 200 }) +
            "</div>" +
            '<p class="fd-sim-formula">In a microchannel the fluid slides in smooth parallel layers with no eddies, so two streams can run side by side for a long distance without mixing. Mixing happens only by slow diffusion across the layers: a drug added to one stream spreads only gradually, so dosing needs planning. (Channel 10 mm long; diffusion of a small molecule.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function sigma(xFrac) {

            const time = (0.01 * xFrac) / (state.v * 1e-3);

            return Math.sqrt(2 * D * time) * 1e6; // µm
        }

        function update() {

            const time = 0.01 / (state.v * 1e-3);
            const s = sigma(1);

            setVal(root, "v", state.v.toFixed(1) + " mm/s");
            setVal(root, "w", state.w + " µm");
            out(root, "t", time.toFixed(1) + " s");
            out(root, "b", s.toFixed(0) + " µm");
            out(root, "m", s > state.w / 2 ? "largely mixed" : s > state.w / 6 ? "partly mixed" : "hardly at all");
            out(root, "verdict", s > state.w / 2 ? "Slow flow: diffusion has time to blend the streams" : s > state.w / 6 ? "The boundary is blurring: diffusion is working on the streams" : "Fast flow: the streams stay side by side");

            if (!hit && s < state.w / 8 && state.v >= 5) {

                hit = true;
                F.reward("bbb-laminar", 10, "You kept two streams apart");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const x0 = 40;
            const x1 = 640;
            const cy = 160;
            const h = Math.min(220, state.w * 0.6);
            const top = cy - h / 2;

            // walls
            ctx.fillStyle = GREY + ".5)";
            ctx.fillRect(x0, top - 10, x1 - x0, 10);
            ctx.fillRect(x0, top + h, x1 - x0, 10);

            // concentration field, column by column
            for (let x = x0; x < x1; x += 4) {

                const u = (x - x0) / (x1 - x0);
                const sg = Math.max(0.5, sigma(u)) / (state.w) * h;

                for (let y = 0; y < h; y += 4) {

                    const z = (y - h / 2) / (sg * 1.414);
                    const c = 0.5 * (1 + erf(z));

                    ctx.fillStyle = "rgb(" + Math.round(120 + c * 135) + "," + Math.round(180 + c * 34 - c * 0) + "," + Math.round(255 - c * 153) + ")";
                    ctx.globalAlpha = 0.85;
                    ctx.fillRect(x, top + y, 4, 4);
                }
            }

            ctx.globalAlpha = 1;

            // tracer particles moving to the right
            for (let i = 0; i < 18; i++) {

                const px = x0 + ((t * 80 * Math.min(state.v, 3) + i * 37) % (x1 - x0));
                const py = top + 10 + ((i * 53) % Math.max(10, h - 20));

                dot(ctx, px, py, 2.5, "rgba(255,255,255,.7)");
            }

            txt(ctx, "stream A in", 70, top - 16, 12, BLUE + "1)");
            txt(ctx, "stream B in", 70, top + h + 28, 12, GOLD + "1)");
            txt(ctx, "boundary blurs only by diffusion", 340, 300, 13, TEXT + ".75)");
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


    SIMS["bbb-reynolds"] = function (root) {

        const defaults = { lv: 0, ld: 2 };
        const state = { lv: 0, ld: 2 };
        let hit = false;

        root.innerHTML =
            head("Try it: the Reynolds number") +
            art("0 0 340 190", "A log scale for the Reynolds number from 0.001 to 10,000 with the turbulence threshold at about 2,000 and a marker for the chosen flow.") +
            '<div class="fd-stat-row">' + stat("Reynolds number", "re") + stat("Flow type", "type") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Speed of the fluid (log, in mm/s)", key: "lv", min: -1, max: 3, step: 0.1, value: 0 }) +
            slider({ label: "Channel size (log, in µm)", key: "ld", min: 1, max: 4, step: 0.1, value: 2 }) +
            "</div>" +
            '<p class="fd-sim-formula">Re = ρ v D<sub>h</sub> ÷ μ. Flow in pipes becomes turbulent above Re of about 2,000. For culture medium moving at 1 mm/s through a 100 µm channel, Re is about 0.1 (ρ = 1000 kg/m³, μ = 0.7 mPa·s). Chips live far below the turbulent range, so flow stays smooth.</p>';

        const svg = root.querySelector("svg");

        function re() {

            return 1000 * (Math.pow(10, state.lv) * 1e-3) * (Math.pow(10, state.ld) * 1e-6) / 0.7e-3;
        }

        function update() {

            const r = re();

            setVal(root, "lv", Math.pow(10, state.lv).toFixed(Math.pow(10, state.lv) < 10 ? 1 : 0) + " mm/s");
            setVal(root, "ld", Math.round(Math.pow(10, state.ld)).toLocaleString() + " µm");
            out(root, "re", r >= 100 ? Math.round(r).toLocaleString() : r.toPrecision(2));
            out(root, "type", r < 2000 ? "laminar: smooth layers" : "turbulent");
            out(root, "verdict", r < 1 ? "Far below the turbulent range: perfectly smooth" : r < 2000 ? "Still laminar, but getting closer to a pipe" : "Turbulent: a tap, not a chip");

            const X = function (lr) { return 30 + (lr + 3) / 7 * 280; };

            svg.innerHTML =
                rect(30, 80, 280, 20, "rgba(170,179,207,.2)") +
                rect(X(Math.log10(2000)), 80, 310 - X(Math.log10(2000)), 20, "rgba(255,105,120,.35)") +
                '<line x1="' + X(Math.log10(2000)) + '" y1="70" x2="' + X(Math.log10(2000)) + '" y2="110" style="stroke:#ff6978;stroke-width:1.6"/>' +
                label(X(Math.log10(2000)), 124, "turbulent above about 2,000", 7, "middle", "#ff6978") +
                [-3, -2, -1, 0, 1, 2, 3, 4].map(function (e) { return label(X(e), 70, e === 0 ? "1" : "10" + (e < 0 ? "⁻" : "") + String(Math.abs(e)).replace("1", "¹").replace("2", "²").replace("3", "³").replace("4", "⁴"), 6.5, "middle", "var(--muted)"); }).join("") +
                '<circle cx="' + X(clamp(Math.log10(r), -3, 4)) + '" cy="90" r="7" style="fill:#ffd666;stroke:#0b1020;stroke-width:1.5"/>' +
                label(170, 160, "chip flows sit far to the left", 8, "middle", "var(--muted)");

            if (!hit && r > 500) {

                hit = true;
                F.reward("bbb-reynolds", 10, "You pushed a channel toward turbulence");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["bbb-laminaruse"] = quiz(
        "Game: laminar flow, good or bad?",
        ["Predictable", "Side by side", "Slow mixing"],
        [
            { q: "Laminar flow is steady and easy to calculate, so shear can be set precisely.", a: "Predictable", why: "Smooth flow is a gift." },
            { q: "Two fluids can share a chip, which is how blood and brain compartments are built.", a: "Side by side", why: "No turbulence to mix them." },
            { q: "A drug added to one stream spreads only gradually, so dosing needs planning.", a: "Slow mixing", why: "Only diffusion mixes streams." },
            { q: "Why can engineers design the forces cells feel?", a: "Predictable", why: "The flow follows simple, calculable rules." }
        ],
        4,
        "bbb-laminaruse-done",
        "You know what laminar flow means for design",
        "Smooth flow is a gift: it lets engineers design the forces cells feel.",
        "Predictable, side by side, slow mixing. Hit Reset to try again."
    );


    SIMS["bbb-priming"] = orderGame(
        "Game: keep the bubbles out",
        [
            { n: "Degas the medium", d: "remove dissolved air first", why: "So bubbles do not form in the channel." },
            { n: "Wet the channels carefully", d: "fill them slowly", why: "Surface tension is strong at this scale." },
            { n: "Prime the tubing", d: "fill the tubes before connecting", why: "So no air goes in with the connection." },
            { n: "Connect and start flow", d: "join the tubing to the chip", why: "Now the cells can be perfused." }
        ],
        "bbb-priming-done",
        "You ordered the bubble-prevention steps",
        "Tap the four steps in the order they should happen.",
        "Most chip failures are mundane: air, leaks, and dirt."
    );


    document.querySelectorAll('.fd-sim[data-sim^="bbb-"]').forEach(F.mount);

})();
