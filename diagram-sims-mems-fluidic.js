/* ========================================
   MEMS & MICROFABRICATION: MICROFLUIDICS AND ACOUSTIC SORTING

   Unit 25: six ways to move a cell, and how a standing surface
   acoustic wave forms and sorts particles.

   Registers on window.FabInteract; loaded by diagram-sims-mems.js.
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
    const stat = M.stat;
    const animate = M.animate;
    const bindPause = M.bindPause;
    const SIMS = F.SIMS;
    const slider = F.slider;


    /* ======================================
       SIX WAYS TO MOVE A CELL
    ====================================== */

    SIMS["mems-sixways"] = function (root) {

        const modes = {
            eo: {
                name: "Electroosmosis",
                tag: "Fluid flow driven by an electric field",
                label: "Electric field strength",
                what: "the whole fluid, carrying every cell with it",
                note: "The channel wall carries a charge, and a layer of ions next to it is dragged along by the field. That layer pulls the rest of the liquid, so all the cells ride the flow together, whatever their charge."
            },
            ep: {
                name: "Electrophoresis",
                tag: "Charged particles driven by an electric field",
                label: "Electric field strength",
                what: "charged cells, through a still liquid",
                note: "Each cell moves because of its own charge. Negative cells head for the positive electrode, positive cells go the other way, and neutral cells stay put."
            },
            dep: {
                name: "Dielectrophoresis",
                tag: "Particles polarized and moved by a non-uniform field",
                label: "Electric field strength",
                what: "polarized cells, even with no net charge",
                note: "A non-uniform field polarizes a cell and then pulls on it unevenly. Cells can be drawn toward the strongest field (positive) or pushed away from it (negative)."
            },
            aco: {
                name: "Acoustophoresis",
                tag: "Particles moved by acoustic waves",
                label: "Acoustic power",
                what: "cells, pushed to the pressure nodes of a sound wave",
                note: "A standing sound wave creates pressure nodes and antinodes. Cells with a positive contrast factor are pushed to the nodes, with no charge and no chemicals involved."
            },
            cap: {
                name: "Capillary action",
                tag: "Fluid drawn through channels by surface tension",
                label: "Channel width",
                what: "the fluid itself, drawn along by its own surface tension",
                note: "No pump and no power: a liquid that wets the walls pulls itself into a narrow channel, carrying the cells with it. A liquid that does not wet the walls will not enter."
            },
            em: {
                name: "Electromagnetics",
                tag: "Particles moved by magnetic or electromagnetic fields",
                label: "Coil current",
                what: "cells tagged with magnetic beads",
                note: "Cells carrying magnetic beads are pulled toward an electromagnet while untagged cells flow past. Switching the current off lets the captured cells go."
            }
        };

        const order = ["eo", "ep", "dep", "aco", "cap", "em"];
        const defaults = { mode: "eo", c: 60, dep: "pos", cap: "phil" };
        const state = { mode: "eo", c: 60, dep: "pos", cap: "phil" };
        const seen = {};

        root.innerHTML =
            head("Try it: six ways to move a cell") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="320" role="img" aria-label="A microchannel with cells in it. Choose one of six methods and watch how the cells move: electroosmosis, electrophoresis, dielectrophoresis, acoustophoresis, capillary action, or electromagnetics"></canvas>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="name"></div><span class="fd-chip" data-out="tag"></span></div>' +
            '<div class="fd-stat-row">' + stat("What moves", "what") + stat("Result", "result") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Method", "mode", order.map(function (k) { return [k, modes[k].name]; })) +
            '<div data-sub></div>' +
            '<div class="fd-sim-controls" data-controls></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button><button type="button" class="fd-sim-btn" data-again>↺ New cells</button></div>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const controls = root.querySelector("[data-controls]");
        const sub = root.querySelector("[data-sub]");
        const rand = mulberry(Date.now() % 100000);

        const CH = { x0: 40, x1: 640, y0: 80, y1: 240 };

        let cells = [];
        let tracers = [];
        let t = 0;
        let built = "";
        let front = 70;
        let captured = 0;

        function makeCells() {

            cells = [];
            tracers = [];
            captured = 0;
            front = 70;

            const m = state.mode;

            for (let i = 0; i < 14; i++) {

                const cell = {
                    x: CH.x0 + 30 + rand() * (CH.x1 - CH.x0 - 60),
                    y: CH.y0 + 18 + rand() * (CH.y1 - CH.y0 - 36),
                    kind: "n",
                    stuck: false,
                    lag: 14 + i * 22
                };

                if (m === "ep") { cell.kind = i % 3 === 0 ? "pos" : (i % 3 === 1 ? "neg" : "n"); }
                if (m === "em") { cell.kind = i % 2 === 0 ? "tag" : "n"; }
                if (m === "cap") { cell.x = CH.x0 + 8 + rand() * 50; }

                cells.push(cell);
            }

            for (let i = 0; i < 46; i++) {
                tracers.push({ x: CH.x0 + rand() * (CH.x1 - CH.x0), y: CH.y0 + 6 + rand() * (CH.y1 - CH.y0 - 12) });
            }
        }

        function buildControls() {

            const key = state.mode;

            if (built === key) { return; }

            built = key;

            let sliderHtml;

            if (key === "cap") {
                sliderHtml = slider({ label: modes[key].label + " (micrometers)", key: "c", min: 5, max: 100, step: 5, value: state.c });
            } else {
                sliderHtml = slider({ label: modes[key].label, key: "c", min: 0, max: 100, step: 5, value: state.c });
            }

            controls.innerHTML = sliderHtml;

            controls.querySelectorAll("input[type=range]").forEach(function (input) {

                input.addEventListener("input", function () {

                    state.c = parseFloat(input.value);
                    update();
                });
            });

            if (key === "dep") {
                sub.innerHTML = seg("Type of dielectrophoresis", "dep", [["pos", "Positive: toward strong field"], ["neg", "Negative: away from it"]]);
            } else if (key === "cap") {
                sub.innerHTML = seg("Channel walls", "cap", [["phil", "Wetted by the liquid"], ["phob", "Repel the liquid"]]);
            } else {
                sub.innerHTML = "";
            }

            sub.querySelectorAll("button[data-set]").forEach(function (b) {

                b.addEventListener("click", function () {

                    const p = b.dataset.set.split(":");

                    state[p[0]] = p[1];
                    front = 70;

                    sub.querySelectorAll("button[data-set]").forEach(function (x) {
                        x.classList.toggle("on", x.dataset.set === p[0] + ":" + state[p[0]]);
                    });

                    update();
                });
            });

            sub.querySelectorAll("button[data-set]").forEach(function (x) {
                x.classList.toggle("on", x.dataset.set === x.dataset.set.split(":")[0] + ":" + state[x.dataset.set.split(":")[0]]);
            });
        }

        function update() {

            const m = modes[state.mode];

            buildControls();

            out(root, "name", m.name);
            out(root, "tag", m.tag);
            out(root, "what", m.what);
            out(root, "note", m.note);
            setVal(root, "c", state.mode === "cap" ? state.c + " µm" : Math.round(state.c) + "%");

            let result;

            if (state.mode === "eo") { result = "everything flows the same way"; }
            else if (state.mode === "ep") { result = "opposite charges separate"; }
            else if (state.mode === "dep") { result = state.dep === "pos" ? "cells gather at the tip" : "cells are pushed away"; }
            else if (state.mode === "aco") { result = "cells line up at the node"; }
            else if (state.mode === "cap") { result = state.cap === "phil" ? "the liquid fills the channel" : "the liquid stays out"; }
            else { result = captured + " tagged cells captured"; }

            out(root, "result", result);

            seen[state.mode] = true;

            if (order.every(function (k) { return seen[k]; })) {
                F.reward("mems-sixways-all", 15, "You tried all six ways to move a cell");
            }
        }

        function wrap(c) {

            if (c.x > CH.x1 - 8) { c.x = CH.x0 + 8; c.y = CH.y0 + 18 + rand() * (CH.y1 - CH.y0 - 36); }
        }

        function step(dt) {

            const m = state.mode;
            const k = state.c / 100;

            if (m === "eo") {

                const u = 10 + k * 90;

                cells.forEach(function (c) { c.x += u * dt; wrap(c); });
                tracers.forEach(function (p) { p.x += u * dt; if (p.x > CH.x1) { p.x = CH.x0; } });

            } else if (m === "ep") {

                cells.forEach(function (c) {

                    const v = (c.kind === "neg" ? 1 : (c.kind === "pos" ? -1 : 0)) * (10 + k * 90) * (c.kind === "neg" ? 1 : 0.7);

                    c.x = clamp(c.x + v * dt, CH.x0 + 12, CH.x1 - 12);
                    c.y += (rand() - 0.5) * 8 * dt;
                    c.y = clamp(c.y, CH.y0 + 12, CH.y1 - 12);
                });

            } else if (m === "dep") {

                const tipX = 340;
                const tipY = CH.y0 + 14;

                cells.forEach(function (c) {

                    const dx = tipX - c.x;
                    const dy = tipY - c.y;
                    const d = Math.max(20, Math.hypot(dx, dy));
                    const f = (4000 * k) / d;
                    const sign = state.dep === "pos" ? 1 : -1;

                    c.x += sign * dx / d * f * dt;
                    c.y += sign * dy / d * f * dt;
                    c.x = clamp(c.x, CH.x0 + 12, CH.x1 - 12);
                    c.y = clamp(c.y, CH.y0 + 12, CH.y1 - 12);

                    if (state.dep === "pos" && d < 24) { c.y = tipY + 16 + (c.x % 7); }
                });

            } else if (m === "aco") {

                const node = (CH.y0 + CH.y1) / 2;

                cells.forEach(function (c) {

                    c.y += (node - c.y) * Math.min(1, dt * 2.2 * k);
                    c.x += (rand() - 0.5) * 6 * dt;
                });

            } else if (m === "cap") {

                const wide = 0.3 + state.c / 100 * 1.7;
                const phil = state.cap === "phil";

                const prev = front;

                if (phil) {

                    front += (30 * Math.sqrt(wide) / Math.max(1, Math.sqrt((front - 40) / 3))) * dt * 3;

                    if (front > CH.x1 - 6) { front = 70; makeCells(); }

                } else {

                    front = Math.min(front, 74);
                }

                const v = (front - prev) / Math.max(dt, 0.001);

                cells.forEach(function (c) {

                    if (c.x < front - c.lag) { c.x += v * dt * 0.95; }
                });

                tracers.forEach(function (p) { if (p.x < front - 4) { p.x += v * dt * 0.95; if (p.x > front - 4) { p.x = CH.x0 + 4; } } });

            } else if (m === "em") {

                const coilX = 340;

                cells.forEach(function (c) {

                    if (c.stuck) { return; }

                    c.x += 26 * dt;

                    if (c.kind === "tag" && k > 0.05) {

                        const dxc = coilX - c.x;
                        const near = Math.exp(-Math.pow(dxc / 150, 2));

                        c.y -= (8 + k * 70) * near * dt;

                        if (c.y <= CH.y0 + 14 && Math.abs(dxc) < 70) { c.stuck = true; captured++; c.y = CH.y0 + 12; }
                    }

                    wrap(c);
                });

                if (k <= 0.05) {

                    cells.forEach(function (c) { c.stuck = false; });
                }
            }
        }

        function drawCell(c) {

            let col = "rgba(255,170,170,.95)";

            if (c.kind === "neg") { col = "rgba(84,224,199,.95)"; }
            if (c.kind === "pos") { col = "rgba(255,105,120,.95)"; }
            if (c.kind === "tag") { col = "rgba(255,170,170,.95)"; }

            ctx.fillStyle = col;
            ctx.strokeStyle = "rgba(6,10,24,.85)";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "rgba(6,10,24,.35)";
            ctx.beginPath();
            ctx.arc(c.x, c.y, 3.6, 0, Math.PI * 2);
            ctx.fill();

            if (c.kind === "tag") {

                ctx.fillStyle = "rgba(255,214,102,1)";
                ctx.beginPath();
                ctx.arc(c.x + 8, c.y - 6, 3.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function draw() {

            const m = state.mode;
            const k = state.c / 100;

            ctx.clearRect(0, 0, 680, 320);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 320);

            // channel
            ctx.fillStyle = "rgba(120,180,255,.10)";
            ctx.fillRect(CH.x0, CH.y0, CH.x1 - CH.x0, CH.y1 - CH.y0);

            if (m === "cap") {

                ctx.fillStyle = "rgba(120,180,255,.30)";
                ctx.fillRect(CH.x0, CH.y0, Math.max(0, front - CH.x0), CH.y1 - CH.y0);

                // meniscus: curves forward when the liquid wets the wall, backward when it does not
                const bulge = state.cap === "phil" ? -14 : 14;

                ctx.strokeStyle = "rgba(170,230,255,1)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(front, CH.y0);
                ctx.quadraticCurveTo(front + bulge, (CH.y0 + CH.y1) / 2, front, CH.y1);
                ctx.stroke();

                // channel width shown as walls squeezing in
                const sq = (1 - state.c / 100) * 40;

                ctx.fillStyle = "rgba(170,179,207,.6)";
                ctx.fillRect(CH.x0, CH.y0 - 10, CH.x1 - CH.x0, 10 + sq * 0.6);
                ctx.fillRect(CH.x0, CH.y1 - sq * 0.6, CH.x1 - CH.x0, 10 + sq * 0.6);

            } else {

                ctx.fillStyle = "rgba(170,179,207,.6)";
                ctx.fillRect(CH.x0, CH.y0 - 10, CH.x1 - CH.x0, 10);
                ctx.fillRect(CH.x0, CH.y1, CH.x1 - CH.x0, 10);
            }

            // method-specific scenery
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";

            if (m === "eo") {

                ctx.fillStyle = "rgba(255,105,120,.95)";

                for (let x = CH.x0 + 20; x < CH.x1; x += 60) {

                    ctx.fillText("−", x, CH.y0 + 14 - 12);
                    ctx.fillText("−", x, CH.y1 + 8);
                }

                // ion layer next to the walls, moving with the flow
                ctx.fillStyle = "rgba(255,214,102,.95)";

                for (let x = CH.x0 + ((t * (10 + k * 90)) % 40); x < CH.x1; x += 40) {

                    ctx.fillText("+", x, CH.y0 + 14);
                    ctx.fillText("+", x, CH.y1 - 5);
                }

                ctx.fillStyle = "rgba(245,247,255,.9)";
                ctx.fillText("field →", 340, 40);

                ctx.fillStyle = "rgba(170,230,255,.7)";

                tracers.forEach(function (p) { ctx.fillRect(p.x, p.y, 2.4, 2.4); });

                ctx.strokeStyle = "rgba(245,247,255,.6)";
                ctx.lineWidth = 2;

                for (let y = CH.y0 + 30; y < CH.y1; y += 50) {

                    ctx.beginPath();
                    ctx.moveTo(300, y);
                    ctx.lineTo(300 + 20 + k * 60, y);
                    ctx.stroke();
                }

                ctx.fillStyle = "rgba(245,247,255,.8)";
                ctx.fillText("the whole liquid moves as one plug", 340, 280);

            } else if (m === "ep") {

                ctx.fillStyle = "rgba(255,105,120,.9)";
                ctx.fillRect(CH.x0 - 14, CH.y0, 10, CH.y1 - CH.y0);
                ctx.fillStyle = "rgba(84,224,199,.9)";
                ctx.fillRect(CH.x1 + 4, CH.y0, 10, CH.y1 - CH.y0);
                ctx.fillStyle = "rgba(245,247,255,.95)";
                ctx.font = "bold 14px sans-serif";
                ctx.fillText("−", CH.x0 - 9, CH.y0 - 14);
                ctx.fillText("+", CH.x1 + 9, CH.y0 - 14);
                ctx.font = "12px sans-serif";
                ctx.fillStyle = "rgba(245,247,255,.8)";
                ctx.fillText("teal cells carry negative charge, red carry positive, pink are neutral", 340, 280);

            } else if (m === "dep") {

                // electrodes: a sharp tip above, a flat plate below
                ctx.fillStyle = "rgba(255,214,102,.95)";
                ctx.beginPath();
                ctx.moveTo(320, CH.y0 - 10);
                ctx.lineTo(360, CH.y0 - 10);
                ctx.lineTo(340, CH.y0 + 8);
                ctx.closePath();
                ctx.fill();
                ctx.fillRect(CH.x0, CH.y1, CH.x1 - CH.x0, 6);

                // field lines bunch up at the tip
                ctx.strokeStyle = "rgba(255,214,102," + (0.25 + 0.5 * k).toFixed(2) + ")";
                ctx.lineWidth = 1.2;

                for (let i = -5; i <= 5; i++) {

                    ctx.beginPath();
                    ctx.moveTo(340, CH.y0 + 8);
                    ctx.quadraticCurveTo(340 + i * 22, CH.y0 + 60, 340 + i * 52, CH.y1);
                    ctx.stroke();
                }

                ctx.fillStyle = "rgba(245,247,255,.85)";
                ctx.fillText("strong field at the tip, weak field far away", 340, 280);

            } else if (m === "aco") {

                const node = (CH.y0 + CH.y1) / 2;

                for (let y = CH.y0; y < CH.y1; y += 3) {

                    const a = Math.abs(Math.sin((y - node) / (CH.y1 - CH.y0) * Math.PI * 2 * 0.5 * 2)) * (0.1 + 0.3 * k);

                    ctx.fillStyle = "rgba(255,105,120," + a.toFixed(3) + ")";
                    ctx.fillRect(CH.x0, y, CH.x1 - CH.x0, 3);
                }

                ctx.strokeStyle = "rgba(84,224,199,.95)";
                ctx.setLineDash([6, 4]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(CH.x0, node);
                ctx.lineTo(CH.x1, node);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = "rgba(84,224,199,1)";
                ctx.textAlign = "left";
                ctx.fillText("pressure node", CH.x0 + 6, node - 8);
                ctx.fillStyle = "rgba(255,105,120,1)";
                ctx.fillText("antinode", CH.x0 + 6, CH.y0 + 14);
                ctx.fillText("antinode", CH.x0 + 6, CH.y1 - 6);

            } else if (m === "cap") {

                ctx.fillStyle = "rgba(245,247,255,.85)";
                ctx.fillText(state.cap === "phil" ? "no pump: surface tension pulls the liquid in" : "the liquid will not enter: the walls repel it", 340, 280);

                ctx.fillStyle = "rgba(170,230,255,.7)";
                tracers.forEach(function (p) { if (p.x < front - 4) { ctx.fillRect(p.x, p.y, 2.4, 2.4); } });

            } else if (m === "em") {

                // electromagnet above the channel
                ctx.fillStyle = "rgba(170,179,207,.85)";
                ctx.fillRect(300, CH.y0 - 44, 80, 34);

                ctx.strokeStyle = "rgba(255,170,90,.95)";
                ctx.lineWidth = 3;

                for (let i = 0; i < 6; i++) {

                    ctx.beginPath();
                    ctx.moveTo(306 + i * 13, CH.y0 - 42);
                    ctx.lineTo(310 + i * 13, CH.y0 - 12);
                    ctx.stroke();
                }

                ctx.fillStyle = "rgba(245,247,255,.85)";
                ctx.fillText("electromagnet", 340, CH.y0 - 54);

                if (k > 0.05) {

                    ctx.strokeStyle = "rgba(255,214,102," + (0.2 + 0.5 * k).toFixed(2) + ")";
                    ctx.lineWidth = 1.2;

                    for (let i = 1; i <= 3; i++) {

                        ctx.beginPath();
                        ctx.ellipse(340, CH.y0 + 20, 40 + i * 36, 30 + i * 20, 0, 0, Math.PI);
                        ctx.stroke();
                    }
                }

                ctx.fillStyle = "rgba(245,247,255,.8)";
                ctx.fillText("gold dots are magnetic beads on the tagged cells", 340, 280);
            }

            cells.forEach(drawCell);

            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(245,247,255,.7)";
            ctx.font = "11px sans-serif";
            ctx.fillText(modes[m].name.toLowerCase(), 340, 304);
        }

        const anim = animate(root, function (dt) {

            t += dt;
            step(dt);

            if (state.mode === "em") { out(root, "result", captured + " tagged cells captured"); }

            draw();
        });

        bindPause(root, anim);

        root.querySelector("[data-again]").addEventListener("click", function () {

            makeCells();
            update();
        });

        wire(root, state, defaults, function () {

            makeCells();
            built = "";
            update();
        });

        makeCells();
        update();
        draw();
    };


    /* ======================================
       HOW A STANDING SURFACE ACOUSTIC WAVE FORMS
    ====================================== */

    SIMS["mems-ssaw"] = function (root) {

        const defaults = { waves: "two", contrast: "pos", power: 70, lam: 100 };
        const state = { waves: "two", contrast: "pos", power: 70, lam: 100 };

        root.innerHTML =
            head("Watch it: two waves make a standing wave") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="440" role="img" aria-label="Two comb-shaped transducers send surface acoustic waves toward each other across a piezoelectric substrate. The two waves add up to a standing wave with pressure nodes and antinodes, and particles in a channel below are pushed to the nodes, larger ones faster"></canvas>' +
            '<div class="fd-stat-row">' + stat("Large particles at a node", "big") + stat("Small particles at a node", "small") + stat("Node spacing", "space") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            seg("Waves on the substrate", "waves", [["two", "Two waves, toward each other"], ["one", "One wave only"]]) +
            seg("Particle type", "contrast", [["pos", "Positive contrast factor"], ["neg", "Negative contrast factor"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Wave power", key: "power", min: 0, max: 100, step: 5, value: 70 }) +
            slider({ label: "Wavelength (picture scale)", key: "lam", min: 60, max: 200, step: 10, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">Two surface acoustic waves traveling toward each other across a piezoelectric substrate combine into a standing surface acoustic wave: alternating pressure nodes and antinodes. Larger particles are funneled into the pressure node at the center of the channel faster than smaller ones.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(Date.now() % 100000);

        const X0 = 150;
        const X1 = 530;
        const CX = 340;

        let t = 0;
        let particles = [];
        let spawn = 0;

        function k() { return 2 * Math.PI / state.lam; }

        function update() {

            const nodeGap = state.lam / 2;
            const standing = state.waves === "two";

            out(root, "space", standing ? "half a wavelength" : "none");
            setVal(root, "power", state.power + "%");
            setVal(root, "lam", state.lam);

            const chip = root.querySelector('[data-out="chip"]');

            if (!standing) {

                out(root, "verdict", "One traveling wave has no nodes: it only pushes particles along");
                chip.textContent = "no standing wave";
                chip.className = "fd-chip rose";

            } else if (state.contrast === "pos") {

                out(root, "verdict", "Particles are funneled into the pressure nodes, large ones first");
                chip.textContent = "✓ Sorting by size";
                chip.className = "fd-chip";

            } else {

                out(root, "verdict", "With a negative contrast factor, particles go to the antinodes instead");
                chip.textContent = "direction flipped";
                chip.className = "fd-chip gold";
            }

            void nodeGap;
        }

        function nearNode(x) {

            const half = state.lam / 2;
            const d = Math.abs(((x - CX) % half + half) % half);
            const dist = Math.min(d, half - d);

            return state.contrast === "pos" ? dist : Math.abs(half / 2 - dist);
        }

        function draw() {

            const A = state.power / 100;
            const kk = k();
            const w = 3.2;
            const standing = state.waves === "two";

            ctx.clearRect(0, 0, 680, 440);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 440);

            // piezoelectric substrate with an IDT at each end
            ctx.fillStyle = "rgba(170,179,207,.35)";
            ctx.fillRect(30, 190, 620, 14);
            ctx.fillStyle = "rgba(245,247,255,.85)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("piezoelectric substrate", 340, 220);

            [[50, 1], [630, -1]].forEach(function (idt) {

                for (let i = 0; i < 6; i++) {

                    ctx.fillStyle = i % 2 ? "rgba(255,105,120,.95)" : "rgba(255,214,102,.95)";
                    ctx.fillRect(idt[0] + i * idt[1] * 9 - (idt[1] < 0 ? 5 : 0), 160, 5, 30);
                }
            });

            ctx.fillText("IDT", 76, 150);
            ctx.fillText("IDT", 604, 150);

            // wave arrows
            ctx.fillStyle = "rgba(84,224,199,1)";
            ctx.fillText("➜", 118, 201);

            if (standing) {

                ctx.fillStyle = "rgba(255,214,102,1)";
                ctx.fillText("⬅", 562, 201);
            }

            // the rows of waves
            const rows = [
                { y: 40, name: "wave from the left", col: "rgba(84,224,199,1)" },
                { y: 92, name: standing ? "wave from the right" : "(the right IDT is off)", col: "rgba(255,214,102,1)" },
                { y: 144, name: standing ? "added together" : "what the substrate feels", col: "rgba(245,247,255,1)" }
            ];

            ctx.textAlign = "left";
            ctx.font = "11px sans-serif";

            rows.forEach(function (r) {

                ctx.fillStyle = r.col;
                ctx.fillText(r.name, 44, r.y - 20);
            });

            function trace(y, fn, col, lw) {

                ctx.strokeStyle = col;
                ctx.lineWidth = lw;
                ctx.beginPath();

                for (let x = X0; x <= X1; x += 3) {

                    const v = fn(x - CX) * 17 * (A * 1.0);

                    if (x === X0) { ctx.moveTo(x, y - v); } else { ctx.lineTo(x, y - v); }
                }

                ctx.stroke();
            }

            // wave A travels right: sin(kx - wt). Wave B travels left: sin(kx + wt).
            trace(rows[0].y, function (x) { return 0.5 * Math.sin(kk * x - w * t); }, "rgba(84,224,199,1)", 2.2);

            if (standing) {
                trace(rows[1].y, function (x) { return 0.5 * Math.sin(kk * x + w * t); }, "rgba(255,214,102,1)", 2.2);
                trace(rows[2].y, function (x) { return 0.5 * (Math.sin(kk * x - w * t) + Math.sin(kk * x + w * t)); }, "rgba(245,247,255,1)", 3);
            } else {
                trace(rows[2].y, function (x) { return 0.5 * Math.sin(kk * x - w * t); }, "rgba(245,247,255,1)", 3);
            }

            // node and antinode markers on the sum row, with guides down to the channel
            if (standing) {

                const half = state.lam / 2;

                for (let n = -6; n <= 6; n++) {

                    const nx = CX + n * half;
                    const ax = nx + half / 2;

                    if (nx > X0 && nx < X1) {

                        ctx.strokeStyle = "rgba(84,224,199,.45)";
                        ctx.setLineDash([3, 4]);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(nx, rows[2].y + 20);
                        ctx.lineTo(nx, 420);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        ctx.fillStyle = "rgba(84,224,199,1)";
                        ctx.beginPath();
                        ctx.arc(nx, rows[2].y, 4.5, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    if (ax > X0 && ax < X1) {

                        ctx.strokeStyle = "rgba(255,105,120,.35)";
                        ctx.setLineDash([3, 4]);
                        ctx.beginPath();
                        ctx.moveTo(ax, rows[2].y + 20);
                        ctx.lineTo(ax, 420);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        ctx.fillStyle = "rgba(255,105,120,1)";
                        ctx.beginPath();
                        ctx.arc(ax, rows[2].y, 4.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.fillStyle = "rgba(84,224,199,1)";
                ctx.textAlign = "center";
                ctx.fillText("● node: no pressure swing", 250, 176);
                ctx.fillStyle = "rgba(255,105,120,1)";
                ctx.fillText("● antinode: biggest swing", 430, 176);
            }

            // channel below, seen from above, with particles flowing down
            const CY0 = 246;
            const CY1 = 416;

            ctx.fillStyle = "rgba(120,180,255,.10)";
            ctx.fillRect(X0 - 10, CY0, X1 - X0 + 20, CY1 - CY0);
            ctx.strokeStyle = "rgba(170,179,207,.6)";
            ctx.lineWidth = 2;
            ctx.strokeRect(X0 - 10, CY0, X1 - X0 + 20, CY1 - CY0);

            // pressure pattern shading in the channel
            if (standing) {

                for (let x = X0 - 10; x < X1 + 10; x += 2) {

                    const a = Math.abs(Math.sin(kk * (x - CX))) * 0.32 * A;

                    ctx.fillStyle = "rgba(255,105,120," + a.toFixed(3) + ")";
                    ctx.fillRect(x, CY0 + 1, 2, CY1 - CY0 - 2);
                }
            }

            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.textAlign = "center";
            ctx.font = "12px sans-serif";
            ctx.fillText("microchannel from above: cells flow downward", 340, 436);

            particles.forEach(function (p) {

                ctx.fillStyle = p.big ? "rgba(84,224,199,.95)" : "rgba(255,214,102,.95)";
                ctx.strokeStyle = "rgba(6,10,24,.8)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });

            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.fillText("● large", 556, 300);
            ctx.fillStyle = "rgba(255,214,102,.95)";
            ctx.fillText("● small", 556, 320);
        }

        function frame(dt) {

            const A = state.power / 100;
            const kk = k();
            const standing = state.waves === "two";

            spawn += dt * 7;

            while (spawn >= 1) {

                spawn -= 1;

                const big = rand() < 0.5;

                particles.push({ x: X0 + rand() * (X1 - X0), y: 252, r: big ? 7 : 3.6, big: big });
            }

            particles.forEach(function (p) {

                p.y += 36 * dt;

                const r2 = p.r * p.r;

                if (standing) {

                    const dir = state.contrast === "pos" ? -1 : 1;

                    p.x += dir * 0.19 * r2 * A * A * Math.sin(2 * kk * (p.x - CX)) * dt * 5.2;

                } else {

                    p.x += 6 * (r2 / 49) * A * A * dt;
                }

                p.x = clamp(p.x, X0 - 6, X1 + 6);
            });

            particles = particles.filter(function (p) { return p.y < 412; });

            // how many have reached the node (or antinode, for the other contrast) in the lower half
            let nb = 0;
            let tb = 0;
            let ns = 0;
            let ts = 0;

            particles.forEach(function (p) {

                if (p.y < 330) { return; }

                const ok = nearNode(p.x) < state.lam * 0.1;

                if (p.big) { tb++; if (ok) { nb++; } } else { ts++; if (ok) { ns++; } }
            });

            if (standing) {

                out(root, "big", tb ? Math.round(nb / tb * 100) + "%" : "-");
                out(root, "small", ts ? Math.round(ns / ts * 100) + "%" : "-");

                if (tb > 6 && nb / tb > 0.8 && ts > 6 && ns / ts < 0.6 && state.power >= 50) {
                    F.reward("mems-ssaw-sorted", 15, "You saw large particles sorted from small ones");
                }

            } else {

                out(root, "big", "-");
                out(root, "small", "-");
            }

            t += dt;
            draw();
        }

        const anim = animate(root, frame);

        bindPause(root, anim);

        wire(root, state, defaults, function () {

            particles = [];
            update();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 25: HOW BIG IS A CELL, REALLY?
    ====================================== */

    SIMS["mems-cellscale"] = function (root) {

        const defaults = { w: 40 };
        const state = { w: 40 };

        const things = [
            { n: "platelet", um: 3, col: "rgba(255,214,102,.9)" },
            { n: "red blood cell", um: 7, col: "rgba(255,105,120,.95)" },
            { n: "white blood cell", um: 12, col: "rgba(200,170,255,.95)" },
            { n: "neuron cell body", um: 25, col: "rgba(84,224,199,.9)" },
            { n: "microelectrode", um: 100, col: "rgba(170,179,207,.9)" }
        ];

        root.innerHTML =
            head("Try it: what fits through the channel?") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="280" role="img" aria-label="Cells and a microelectrode drawn to scale next to a microchannel whose width you can change, marking which ones fit across it"></canvas>' +
            '<div class="fd-stat-row">' + stat("Channel width", "w") + stat("Red blood cells across", "rbc") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Channel width (micrometers)", key: "w", min: 5, max: 150, step: 5, value: 40 }) +
            "</div>" +
            '<p class="fd-sim-formula">Because MEMS devices sit at the same scale as cells, they are a natural fit for interfacing with them, with minimal damage. Blood cells are 6 to 8 µm, neurons 4 to 100 µm, and a typical microelectrode about 100 µm.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            out(root, "w", state.w + " µm");
            out(root, "rbc", Math.floor(state.w / 7));
            setVal(root, "w", state.w + " µm");

            const fits = things.filter(function (t) { return t.um < state.w; }).map(function (t) { return t.n; });

            out(root, "verdict", fits.length === things.length ? "Everything shown fits" : (fits.length ? "Fits: " + fits.join(", ") : "Nothing here fits"));

            if (state.w >= 10 && state.w <= 12) {
                F.reward("mems-cellscale-single", 5, "You sized a channel for single cells");
            }

            const sc = 2.2;

            ctx.clearRect(0, 0, 680, 280);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 280);

            // the channel, drawn across the page
            const cw = state.w * sc;
            const cy = 60;

            ctx.fillStyle = "rgba(120,180,255,.2)";
            ctx.fillRect(40, cy, cw, 150);
            ctx.fillStyle = "rgba(170,179,207,.7)";
            ctx.fillRect(34, cy, 6, 150);
            ctx.fillRect(40 + cw, cy, 6, 150);

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("channel: " + state.w + " µm wide", 40 + cw / 2, cy - 10);

            // each thing as a bar of its true width, with the channel width as a line across them
            const bx = 330;

            things.forEach(function (t, i) {

                const y = 52 + i * 42;
                const d = t.um * sc;
                const fit = t.um < state.w;

                ctx.fillStyle = t.col;
                ctx.globalAlpha = fit ? 1 : 0.4;
                ctx.fillRect(bx, y, Math.max(4, d), 16);
                ctx.globalAlpha = 1;

                ctx.fillStyle = fit ? "rgba(84,224,199,1)" : "rgba(255,105,120,1)";
                ctx.font = "11px sans-serif";
                ctx.textAlign = "left";
                ctx.fillText(t.n + " · " + t.um + " µm · " + (fit ? "fits" : "too wide"), bx, y - 5);
            });

            ctx.strokeStyle = "rgba(255,214,102,.95)";
            ctx.setLineDash([5, 4]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bx + state.w * sc, 30);
            ctx.lineTo(bx + state.w * sc, 262);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(255,214,102,1)";
            ctx.textAlign = "center";
            ctx.fillText("channel width", Math.min(bx + state.w * sc, 610), 24);

            // a row of red blood cells packed across the channel
            for (let i = 0; i < Math.floor(state.w / 7); i++) {

                ctx.fillStyle = "rgba(255,105,120,.95)";
                ctx.beginPath();
                ctx.arc(40 + (i + 0.5) * 7 * sc, cy + 75, 3.5 * sc, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 26: HOW AN IDT LAUNCHES A WAVE
    ====================================== */

    SIMS["mems-idt"] = function (root) {

        const defaults = { lam: 240 };
        const state = { lam: 240 };

        root.innerHTML =
            head("Watch it: fingers that alternate") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="Two interlocking combs of metal fingers driven with alternating positive and negative voltage, launching a traveling acoustic wave across the substrate"></canvas>' +
            '<div class="fd-stat-row">' + stat("Wavelength", "lam") + stat("Finger width", "fw") + stat("Frequency", "f") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Wavelength of the IDT (micrometers)", key: "lam", min: 120, max: 800, step: 20, value: 240 }) +
            "</div>" +
            '<p class="fd-sim-formula">f = v ÷ λ, with a Rayleigh wave speed of about 3980 m/s for lithium niobate. The period of the fingers is set by a quarter of the wavelength. Shrink the wavelength and the operating frequency goes up.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let t = 0;

        function update() {

            const f = 3980 / (state.lam * 1e-6) / 1e6;

            out(root, "lam", state.lam + " µm");
            out(root, "fw", (state.lam / 4) + " µm");
            out(root, "f", f.toFixed(1) + " MHz");
            setVal(root, "lam", state.lam + " µm");

            const chip = root.querySelector('[data-out="chip"]');

            if (state.lam < 240) {

                out(root, "verdict", "Shorter than the practical limit");
                chip.textContent = "⚠ Below the 240 µm floor";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", state.lam === 240 ? "The practical minimum: about 16.6 MHz" : "A longer wavelength gives a lower frequency");
                chip.textContent = "✓ Within the limits";
                chip.className = "fd-chip";
            }

            if (state.lam === 240) { F.reward("mems-idt-240", 5, "You set the IDT to the standard wavelength"); }
        }

        function draw() {

            const px = 0.5;                // pixels per micrometer
            const lam = state.lam * px;
            const fw = lam / 4;
            const cx = 340;
            const w = 3.4;

            ctx.clearRect(0, 0, 680, 300);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 300);

            // alternating voltage: the two combs swap polarity every half cycle
            const phase = Math.sin(t * w);
            const plus = phase >= 0;

            // the IDT: bus bars and interleaved fingers, centered
            const n = Math.min(14, Math.floor(300 / (fw * 2)));
            const totalW = n * fw * 2;
            const x0 = cx - totalW / 2;

            ctx.fillStyle = "rgba(170,179,207,.35)";
            ctx.fillRect(40, 80, 600, 100);

            ctx.fillStyle = plus ? "rgba(255,214,102,.95)" : "rgba(255,105,120,.95)";
            ctx.fillRect(x0 - 8, 64, totalW + 16, 12);
            ctx.fillStyle = plus ? "rgba(255,105,120,.95)" : "rgba(255,214,102,.95)";
            ctx.fillRect(x0 - 8, 184, totalW + 16, 12);

            for (let i = 0; i < n * 2; i++) {

                const top = i % 2 === 0;

                ctx.fillStyle = (top === plus) ? "rgba(255,214,102,.95)" : "rgba(255,105,120,.95)";

                if (top) {
                    ctx.fillRect(x0 + i * fw, 76, Math.max(2, fw - 1), 74);
                } else {
                    ctx.fillRect(x0 + i * fw, 110, Math.max(2, fw - 1), 74);
                }
            }

            ctx.fillStyle = "rgba(245,247,255,.95)";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(plus ? "+" : "−", x0 - 22, 76);
            ctx.fillText(plus ? "−" : "+", x0 - 22, 196);

            // the wave traveling out on both sides
            ctx.strokeStyle = "rgba(84,224,199,1)";
            ctx.lineWidth = 2.6;

            [[-1, x0], [1, x0 + totalW]].forEach(function (side) {

                ctx.beginPath();

                for (let i = 0; i <= 140; i++) {

                    const d = i * 2;
                    const x = side[1] + side[0] * (d + 6);
                    const a = 22 * Math.exp(-d / 260);
                    const y = 130 + a * Math.sin(2 * Math.PI * d / lam - w * t);

                    if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
                }

                ctx.stroke();
            });

            // wavelength marker
            ctx.strokeStyle = "rgba(245,247,255,.85)";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(x0, 236);
            ctx.lineTo(x0 + lam, 236);
            ctx.stroke();
            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.font = "12px sans-serif";
            ctx.fillText("wavelength = " + state.lam + " µm", x0 + lam / 2, 254);

            ctx.strokeStyle = "rgba(255,214,102,.9)";
            ctx.beginPath();
            ctx.moveTo(x0, 214);
            ctx.lineTo(x0 + fw, 214);
            ctx.stroke();
            ctx.fillStyle = "rgba(255,214,102,1)";
            ctx.fillText("¼", x0 + fw / 2, 230);

            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.fillText("lithium niobate substrate", 340, 290);
        }

        const anim = animate(root, function (dt) {

            t += dt;
            draw();
        });

        bindPause(root, anim);

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 26: ACOUSTIC CONTRAST FACTOR
    ====================================== */

    SIMS["mems-contrast"] = function (root) {

        const presets = {
            ps: { name: "Polystyrene bead", rho: 1050, beta: 0.37 },
            rbc: { name: "Red blood cell", rho: 1100, beta: 0.76 },
            oil: { name: "Lipid droplet", rho: 920, beta: 1.5 },
            air: { name: "Air bubble", rho: 1, beta: 5 }
        };

        const defaults = { rho: 1050, beta: 0.37 };
        const state = { rho: 1050, beta: 0.37 };
        const seen = {};

        root.innerHTML =
            head("Try it: which way does a particle go?") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="280" role="img" aria-label="A channel with pressure nodes and antinodes. Particles with a positive acoustic contrast factor drift to the nodes and particles with a negative factor drift to the antinodes"></canvas>' +
            '<div class="fd-stat-row">' + stat("Contrast factor", "phi") + stat("Moves toward", "dir") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-seg"><span class="fd-seg-label">Try a real particle</span>' +
            Object.keys(presets).map(function (k) { return '<button type="button" class="fd-sim-btn" data-preset="' + k + '">' + presets[k].name + "</button>"; }).join("") + "</div>" +
            '<div class="fd-sim-controls">' +
            slider({ label: "Density of the particle (kg per cubic meter)", key: "rho", min: 1, max: 1500, step: 1, value: 1050 }) +
            slider({ label: "Compressibility compared with water", key: "beta", min: 0.1, max: 5, step: 0.05, value: 0.37 }) +
            "</div>" +
            '<p class="fd-sim-formula">Φ = (5ρp − 2ρ₀) ÷ (2ρp + ρ₀) − βp ÷ β₀, with water at ρ₀ = 1000. Positive: the force points from antinodes toward pressure nodes (center). Negative: the direction flips, toward the antinodes.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(41);
        const ps = [];

        for (let i = 0; i < 9; i++) { ps.push({ x: 60 + rand() * 560, y: 60 + rand() * 160 }); }

        function phi() {

            return (5 * state.rho - 2 * 1000) / (2 * state.rho + 1000) - state.beta;
        }

        function update() {

            const f = phi();

            out(root, "phi", (f >= 0 ? "+" : "") + f.toFixed(2));
            out(root, "dir", f > 0.02 ? "pressure nodes" : (f < -0.02 ? "antinodes" : "neither"));
            setVal(root, "rho", state.rho);
            setVal(root, "beta", state.beta.toFixed(2) + "×");

            const chip = root.querySelector('[data-out="chip"]');

            if (f > 0.02) {

                out(root, "verdict", "A positive factor: particles gather at the center node");
                chip.textContent = "→ nodes";
                chip.className = "fd-chip";

            } else if (f < -0.02) {

                out(root, "verdict", "A negative factor: the direction flips toward the antinodes");
                chip.textContent = "→ antinodes";
                chip.className = "fd-chip rose";

            } else {

                out(root, "verdict", "Almost no contrast with the water: the particle barely moves");
                chip.textContent = "no push";
                chip.className = "fd-chip gold";
            }

            seen[f > 0 ? "pos" : "neg"] = true;

            if (seen.pos && seen.neg) {
                F.reward("mems-contrast-both", 10, "You found both signs of the contrast factor");
            }
        }

        function draw() {

            const f = phi();
            const lam = 200;
            const k = 2 * Math.PI / lam;

            ctx.clearRect(0, 0, 680, 280);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 280);

            for (let x = 20; x < 660; x += 2) {

                ctx.fillStyle = "rgba(255,105,120," + (Math.abs(Math.sin(k * (x - 340))) * 0.34).toFixed(3) + ")";
                ctx.fillRect(x, 30, 2, 220);
            }

            ctx.strokeStyle = "rgba(84,224,199,.7)";
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.4;

            for (let n = -3; n <= 3; n++) {

                ctx.beginPath();
                ctx.moveTo(340 + n * lam / 2, 30);
                ctx.lineTo(340 + n * lam / 2, 250);
                ctx.stroke();
            }

            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(84,224,199,1)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("node", 340, 22);
            ctx.fillStyle = "rgba(255,105,120,1)";
            ctx.fillText("antinode", 340 + lam / 4, 22);
            ctx.fillText("antinode", 340 - lam / 4, 22);

            ps.forEach(function (p) {

                ctx.fillStyle = f > 0.02 ? "rgba(84,224,199,.95)" : (f < -0.02 ? "rgba(255,170,90,.95)" : "rgba(170,179,207,.95)");
                ctx.strokeStyle = "rgba(6,10,24,.85)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
        }

        animate(root, function (dt) {

            const f = phi();
            const k = 2 * Math.PI / 200;

            ps.forEach(function (p) {

                p.x += -f * Math.sin(2 * k * (p.x - 340)) * 60 * dt;
                p.x = clamp(p.x, 24, 656);
            });

            draw();
        });

        root.querySelectorAll("[data-preset]").forEach(function (b) {

            b.addEventListener("click", function () {

                const p = presets[b.dataset.preset];

                state.rho = p.rho;
                state.beta = p.beta;

                root.querySelectorAll("input[type=range]").forEach(function (inp) { inp.value = state[inp.dataset.key]; });

                update();

                // spread the particles out again so the move is visible
                ps.forEach(function (q) { q.x = 60 + rand() * 560; });
            });
        });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    /* ======================================
       UNIT 26: THE RACE TO THE NODE
    ====================================== */

    SIMS["mems-race"] = function (root) {

        const defaults = { r1: 2, r2: 4, eta: 1 };
        const state = { r1: 2, r2: 4, eta: 1 };

        root.innerHTML =
            head("Game: which particle reaches the node first?") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="260" role="img" aria-label="Two particles of different sizes start the same distance from a pressure node and race to it, held back by viscous drag"></canvas>' +
            '<div class="fd-stat-row">' + stat("Small particle arrives", "t1") + stat("Large particle arrives", "t2") + stat("Speed ratio", "ratio") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-go>🏁 Start the race</button></div>' +
            seg("Liquid", "eta", [["1", "Water"], ["4", "Thicker liquid (4× the viscosity)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Radius of the small particle (µm)", key: "r1", min: 1, max: 6, step: 0.5, value: 2 }) +
            slider({ label: "Radius of the large particle (µm)", key: "r2", min: 1, max: 10, step: 0.5, value: 4 }) +
            "</div>" +
            '<p class="fd-sim-formula">The acoustic force grows with particle volume (radius cubed). Viscous drag grows only with radius. So the speed grows as radius squared ÷ viscosity: a particle twice as wide arrives about four times sooner.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let run = 0;
        let go = false;
        let done1 = 0;
        let done2 = 0;

        function rate(r) { return 0.13 * r * r / state.eta; }

        function arrive(r) { return Math.log(120 / 3) / rate(r); }

        function update() {

            const a1 = arrive(state.r1);
            const a2 = arrive(state.r2);

            out(root, "t1", a1.toFixed(1) + " s");
            out(root, "t2", a2.toFixed(1) + " s");
            out(root, "ratio", (a1 / a2).toFixed(1) + "×");
            setVal(root, "r1", state.r1 + " µm");
            setVal(root, "r2", state.r2 + " µm");

            out(root, "verdict", "Speed grows as radius squared: the larger particle wins by " + (a1 / a2).toFixed(1) + "×");
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 260);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 260);

            // the node in the middle
            ctx.strokeStyle = "rgba(84,224,199,.9)";
            ctx.setLineDash([5, 4]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(340, 20);
            ctx.lineTo(340, 240);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = "rgba(84,224,199,1)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("pressure node", 340, 14);

            const lanes = [{ y: 90, r: state.r1, col: "rgba(255,214,102,.95)", name: "small", t: arrive(state.r1) }, { y: 175, r: state.r2, col: "rgba(84,224,199,.95)", name: "large", t: arrive(state.r2) }];

            lanes.forEach(function (ln) {

                const d = 120 * Math.exp(-rate(ln.r) * run);
                const x = 340 - d;
                const finished = d <= 3.2;

                ctx.fillStyle = ln.col;
                ctx.strokeStyle = "rgba(6,10,24,.85)";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(x, ln.y, ln.r * 3.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.textAlign = "left";
                ctx.fillText(ln.name + " particle, radius " + ln.r + " µm", 30, ln.y + 40);

                if (finished) {

                    ctx.fillStyle = "rgba(84,224,199,1)";
                    ctx.fillText("✓ arrived", 450, ln.y + 4);
                }
            });

            ctx.fillStyle = "rgba(245,247,255,.7)";
            ctx.textAlign = "right";
            ctx.fillText("time: " + run.toFixed(1) + " s", 660, 246);

            void done1;
            void done2;
        }

        animate(root, function (dt) {

            if (go) { run += dt * 1.6; }

            if (go && run > Math.max(arrive(state.r1), arrive(state.r2)) + 0.6) {

                go = false;
                F.reward("mems-race-done", 10, "You ran the particle race");
            }

            draw();
        });

        root.querySelector("[data-go]").addEventListener("click", function () {

            run = 0;
            go = true;
        });

        wire(root, state, defaults, function () {

            run = 0;
            go = false;
            update();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 27: WHY THE LAYOUT IS SYMMETRIC
    ====================================== */

    SIMS["mems-symmetry"] = function (root) {

        const defaults = { al: 100, ar: 100, off: 0 };
        const state = { al: 100, ar: 100, off: 0 };

        root.innerHTML =
            head("Try it: break the symmetry") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="320" role="img" aria-label="A channel positioned over a standing wave. If the two transducers differ in strength or the channel is off center, the pressure node moves away from the channel center and the sorting becomes unbalanced"></canvas>' +
            '<div class="fd-stat-row">' + stat("Node is off the channel center by", "gap") + stat("Large particles to the center outlet", "center") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Left transducer strength (%)", key: "al", min: 40, max: 100, step: 5, value: 100 }) +
            slider({ label: "Right transducer strength (%)", key: "ar", min: 40, max: 100, step: 5, value: 100 }) +
            slider({ label: "Channel shifted sideways (µm)", key: "off", min: -100, max: 100, step: 5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Symmetry is not cosmetic: it keeps the standing wave centered and the particle sorting balanced. Illustrative model: unequal waves slide the nodes toward the weaker side.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let t = 0;

        function nodeShift() {

            // pixels: the stronger wave pushes the node toward the weaker transducer
            return (state.al - state.ar) / (state.al + state.ar) * 60;
        }

        function update() {

            const shift = nodeShift();
            const gap = Math.abs(shift - state.off * 0.6);
            const share = Math.exp(-Math.pow(gap / 28, 2));

            out(root, "gap", (gap / 0.6).toFixed(0) + " µm");
            out(root, "center", Math.round(share * 100) + "%");
            setVal(root, "al", state.al + "%");
            setVal(root, "ar", state.ar + "%");
            setVal(root, "off", state.off + " µm");

            const chip = root.querySelector('[data-out="chip"]');

            if (gap < 6) {

                out(root, "verdict", "The node sits at the channel center: balanced sorting");
                chip.textContent = "✓ Symmetric";
                chip.className = "fd-chip";

                if (state.al !== 100 || state.ar !== 100 || state.off !== 0) {
                    F.reward("mems-symmetry-fix", 10, "You re-centered the node");
                }

            } else if (gap < 25) {

                out(root, "verdict", "The node has drifted off center");
                chip.textContent = "⚠ Unbalanced";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Most particles miss the center outlet");
                chip.textContent = "✕ Sorting fails";
                chip.className = "fd-chip rose";
            }
        }

        function draw() {

            const shift = nodeShift();
            const lam = 120;
            const k = 2 * Math.PI / lam;
            const centerX = 340 + state.off * 0.6;

            ctx.clearRect(0, 0, 680, 320);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 320);

            // pressure pattern
            for (let x = 30; x < 650; x += 2) {

                const a = Math.abs(Math.sin(k * (x - 340 - shift))) * (0.12 + 0.22 * Math.abs(Math.cos(t * 3)) * 0 + 0.2);

                ctx.fillStyle = "rgba(255,105,120," + a.toFixed(3) + ")";
                ctx.fillRect(x, 60, 2, 180);
            }

            ctx.strokeStyle = "rgba(84,224,199,.8)";
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.4;

            for (let n = -5; n <= 5; n++) {

                const x = 340 + shift + n * lam / 2;

                ctx.beginPath();
                ctx.moveTo(x, 60);
                ctx.lineTo(x, 240);
                ctx.stroke();
            }

            ctx.setLineDash([]);

            // the channel with three outlets
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.lineWidth = 3;
            ctx.strokeRect(centerX - 70, 70, 140, 160);

            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("channel", centerX, 60);

            ctx.strokeStyle = "rgba(255,214,102,.9)";
            ctx.beginPath();
            ctx.moveTo(centerX, 70);
            ctx.lineTo(centerX, 230);
            ctx.stroke();

            // the transducers on both sides, scaled by their strength
            ctx.fillStyle = "rgba(255,105,120," + (0.3 + 0.7 * state.al / 100).toFixed(2) + ")";
            ctx.fillRect(14, 100, 12, 100);
            ctx.fillStyle = "rgba(255,105,120," + (0.3 + 0.7 * state.ar / 100).toFixed(2) + ")";
            ctx.fillRect(654, 100, 12, 100);

            ctx.fillStyle = "rgba(245,247,255,.85)";
            ctx.fillText("left", 20, 214);
            ctx.fillText("right", 660, 214);

            // outlet bars
            const gap = Math.abs(shift - state.off * 0.6);
            const share = Math.exp(-Math.pow(gap / 28, 2));

            ctx.fillStyle = "rgba(170,179,207,.2)";
            ctx.fillRect(centerX - 70, 262, 140, 12);
            ctx.fillStyle = "rgba(84,224,199,.9)";
            ctx.fillRect(centerX - 70, 262, 140 * share, 12);
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.fillText("share of large particles reaching the center outlet", centerX, 296);
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
       UNIT 27: BOUNDARY CONDITIONS
    ====================================== */

    SIMS["mems-bcquiz"] = M.quiz(
        "Game: set the boundary conditions",
        ["Fixed constraint", "Free surface", "Periodic boundary", "+10 V drive", "Ground", "Zero charge"],
        [
            { q: "Solid mechanics: the bottom of the substrate, held in place.", a: "Fixed constraint", why: "Something has to anchor the model so it does not simply move away." },
            { q: "Solid mechanics: the top surface, where the acoustic wave travels.", a: "Free surface", why: "The surface wave needs a surface that is free to move." },
            { q: "Solid mechanics: the left and right edges, so one group of fingers stands for the whole repeating pattern.", a: "Periodic boundary", why: "A periodic boundary repeats the modeled section on both sides." },
            { q: "Electrostatics: the driven electrode.", a: "+10 V drive", why: "The simulation applies the drive voltage here." },
            { q: "Electrostatics: the other electrode.", a: "Ground", why: "A voltage needs a reference at zero." },
            { q: "Electrostatics: everywhere else.", a: "Zero charge", why: "No charge builds up on the remaining boundaries." }
        ],
        6,
        "mems-bcquiz-done",
        "You set the simulation up correctly",
        "Every simulation is only as good as its boundary conditions, and you set them all correctly.",
        "Get these wrong and the results mean nothing. Mechanics needs anchors and a free surface, electrostatics needs a drive and a ground. Hit Reset to try again."
    );


    /* ======================================
       UNIT 27: FIND THE RESONANCE
    ====================================== */

    SIMS["mems-resonance"] = function (root) {

        const defaults = { f: 12 };
        const state = { f: 12 };
        const PEAK = 16.473;
        let revealed = false;
        let found = false;
        let t = 0;

        root.innerHTML =
            head("Game: find the modal frequency") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="320" role="img" aria-label="A substrate surface that moves only slightly at most drive frequencies but swings strongly at its resonance, with a meter showing how strongly it responds"></canvas>' +
            '<div class="fd-stat-row">' + stat("Drive frequency", "f") + stat("Wave amplitude", "amp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-reveal>👀 Show the curve</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Drive frequency (MHz)", key: "f", min: 10, max: 24, step: 0.05, value: 12 }) +
            "</div>" +
            '<p class="fd-sim-formula">The simulation found a modal frequency of 16.473 MHz, where the displacement field shows the acoustic wave propagating. Sweep the drive frequency until the surface swings as hard as it can.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function resp(f) { return 1 / (1 + Math.pow((f - PEAK) / 0.35, 2)); }

        function update() {

            const r = resp(state.f);

            out(root, "f", state.f.toFixed(2) + " MHz");
            out(root, "amp", Math.round(r * 100) + "%");
            setVal(root, "f", state.f.toFixed(2) + " MHz");

            const chip = root.querySelector('[data-out="chip"]');

            if (r > 0.92) {

                out(root, "verdict", "That is the resonance: the wave propagates strongly");
                chip.textContent = "🎯 Found it";
                chip.className = "fd-chip";

                if (!found) {

                    found = true;
                    F.reward("mems-resonance-found", 15, "You found the resonance");
                }

            } else if (r > 0.4) {

                out(root, "verdict", "Hot: you are very close");
                chip.textContent = "🔥 Hot";
                chip.className = "fd-chip gold";

            } else if (r > 0.1) {

                out(root, "verdict", "Getting warmer");
                chip.textContent = "warm";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Cold: the surface barely moves");
                chip.textContent = "🧊 Cold";
                chip.className = "fd-chip rose";
            }
        }

        function draw() {

            const r = resp(state.f);

            ctx.clearRect(0, 0, 680, 320);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 320);

            // the vibrating surface
            ctx.strokeStyle = "rgba(84,224,199,1)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let x = 30; x <= 650; x += 3) {

                const y = 90 + 40 * r * Math.sin((x - 30) / 620 * Math.PI * 10 - t * 6);

                if (x === 30) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }

            ctx.stroke();

            ctx.fillStyle = "rgba(170,179,207,.35)";
            ctx.fillRect(30, 136, 620, 18);
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("substrate surface", 340, 170);

            // response meter
            ctx.fillStyle = "rgba(170,179,207,.2)";
            ctx.fillRect(30, 196, 620, 18);
            ctx.fillStyle = r > 0.92 ? "rgba(84,224,199,.95)" : "rgba(255,214,102,.9)";
            ctx.fillRect(30, 196, 620 * r, 18);
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.fillText("how strongly the surface responds", 340, 232);

            // the hidden curve, once revealed
            if (revealed || found) {

                const x0 = 30;
                const x1 = 650;

                ctx.strokeStyle = "rgba(255,214,102,.9)";
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let i = 0; i <= 200; i++) {

                    const f = 10 + i / 200 * 14;
                    const x = x0 + (f - 10) / 14 * (x1 - x0);
                    const y = 300 - resp(f) * 52;

                    if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
                }

                ctx.stroke();

                const px = x0 + (state.f - 10) / 14 * (x1 - x0);

                ctx.fillStyle = "rgba(255,255,255,1)";
                ctx.beginPath();
                ctx.arc(px, 300 - r * 52, 5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "rgba(255,214,102,1)";
                ctx.fillText("16.473 MHz", x0 + (PEAK - 10) / 14 * (x1 - x0), 244);
            }
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        root.querySelector("[data-reveal]").addEventListener("click", function () {

            revealed = true;
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            revealed = false;
            found = false;
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 28: METAL LIFT-OFF
    ====================================== */

    SIMS["mems-liftoff"] = M.stepper({
        title: "Watch it: lift-off builds the electrodes",
        aria: "A cross-section on lithium niobate: photoresist is patterned, chromium and gold are deposited over everything, and then the photoresist and the metal on top of it are removed, leaving only the electrode fingers",
        viewBox: "0 0 340 190",
        interval: 3,
        formula: "Lift-off is the same idea you saw for metal layers in earlier units: deposit everywhere, then remove what you do not want.",
        rewardKey: "mems-liftoff-done",
        rewardMsg: "You watched lift-off make an IDT",
        steps: [
            { t: "1 · Photolithography", tool: "Futurrex resist, light-field mask", text: "Photoresist on lithium niobate is exposed and developed so that gaps open exactly where the electrodes will go." },
            { t: "2 · Metal deposition", tool: "Cr / Au", text: "Chromium and gold are deposited over the whole surface: on the resist, and in the gaps." },
            { t: "3 · Lift-off", tool: "Resist removal", text: "The photoresist dissolves, and the metal sitting on top of it floats away with it." },
            { t: "4 · Only the IDT is left", tool: "", text: "Only the metal that touched the substrate remains: the IDT pattern." }
        ],
        draw: function (step, st) {

            const sub = "rgba(170,179,207,.45)";
            const resist = "rgba(255,105,120,.6)";
            const metal = "rgba(255,214,102,.95)";
            const gaps = [[70, 92], [128, 150], [186, 208], [244, 266]];

            let s = rect(30, 140, 280, 34, sub, "rgba(245,247,255,.4)");

            function rect(x, y, w, h, f, strokeC) {

                return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:' + f + ";stroke:" + (strokeC || "none") + ';stroke-width:1"/>';
            }

            // resist blocks between the gaps
            const blocks = [[30, 70], [92, 128], [150, 186], [208, 244], [266, 310]];

            if (step <= 2) {

                const lift = step === 2 ? Math.min(60, st.t * 40) : 0;

                blocks.forEach(function (b) {

                    s += rect(b[0], 120 - lift, b[1] - b[0], 20, resist, "none");

                    if (step >= 1) { s += rect(b[0], 112 - lift, b[1] - b[0], 8, metal, "none"); }
                });

                if (step >= 1) {

                    gaps.forEach(function (g) { s += rect(g[0], 132, g[1] - g[0], 8, metal, "none"); });
                }

                if (step === 2) { s += '<text x="170" y="40" text-anchor="middle" style="font-size:8px;fill:rgba(255,214,102,1)">the resist and the metal on it float away</text>'; }
            }

            if (step === 3) {

                gaps.forEach(function (g) { s += rect(g[0], 132, g[1] - g[0], 8, metal, "none"); });
                s += '<text x="170" y="40" text-anchor="middle" style="font-size:8px;fill:rgba(84,224,199,1)">interdigitated electrodes on the substrate</text>';
            }

            s += '<text x="170" y="188" text-anchor="middle" style="font-size:7px;fill:rgba(245,247,255,.6)">lithium niobate substrate</text>';

            return s;
        }
    });


    /* ======================================
       UNIT 28: ALIGNING THE CHANNEL
    ====================================== */

    SIMS["mems-align"] = function (root) {

        const defaults = { x: 0, a: 0 };
        const state = { x: 0, a: 0 };

        root.innerHTML =
            head("Game: bond the channel in the right place") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="320" role="img" aria-label="A chip seen from above with two transducer sets and a standing wave between them. A microchannel can be moved and rotated, and sorting works only when it crosses the standing wave region squarely and at the center"></canvas>' +
            '<div class="fd-stat-row">' + stat("Sideways offset", "ox") + stat("Angle", "ang") + stat("Standing wave coverage", "cov") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Slide the channel sideways (µm)", key: "x", min: -400, max: 400, step: 10, value: 0 }) +
            slider({ label: "Rotate the channel (degrees)", key: "a", min: -6, max: 6, step: 0.5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Once the electrodes are patterned, the PDMS channel is bonded on top, aligned with the SSAW region between the two IDT sets. Two separately fabricated pieces become one working chip.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const off = Math.abs(state.x);
            const ang = Math.abs(state.a);
            const cov = clamp(1 - off / 400, 0, 1) * clamp(1 - ang / 6, 0, 1);

            out(root, "ox", state.x + " µm");
            out(root, "ang", state.a.toFixed(1) + "°");
            out(root, "cov", Math.round(cov * 100) + "%");
            setVal(root, "x", state.x + " µm");
            setVal(root, "a", state.a.toFixed(1) + "°");

            const chip = root.querySelector('[data-out="chip"]');

            if (off <= 40 && ang <= 0.5) {

                out(root, "verdict", "Aligned: the channel crosses the standing wave at its center");
                chip.textContent = "✓ Bonded in position";
                chip.className = "fd-chip";
                F.reward("mems-align-ok", 10, "You aligned the channel");

            } else if (off <= 150 && ang <= 2) {

                out(root, "verdict", "Close, but the sorting would be unbalanced");
                chip.textContent = "⚠ Slightly off";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Misaligned: the channel misses the pressure nodes it needs");
                chip.textContent = "✕ Off target";
                chip.className = "fd-chip rose";
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 320);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 320);

            // chip and the two IDT sets
            ctx.fillStyle = "rgba(170,179,207,.25)";
            ctx.fillRect(30, 30, 620, 260);

            [[50, 1], [630, -1]].forEach(function (idt) {

                for (let i = 0; i < 6; i++) {

                    ctx.fillStyle = i % 2 ? "rgba(255,105,120,.95)" : "rgba(255,214,102,.95)";
                    ctx.fillRect(idt[0] + i * idt[1] * 10 - (idt[1] < 0 ? 5 : 0), 80, 5, 160);
                }
            });

            // the standing wave region between them
            for (let x = 130; x < 550; x += 2) {

                ctx.fillStyle = "rgba(255,105,120," + (Math.abs(Math.sin((x - 340) * 2 * Math.PI / 80)) * 0.3).toFixed(3) + ")";
                ctx.fillRect(x, 60, 2, 200);
            }

            ctx.fillStyle = "rgba(245,247,255,.85)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("standing wave region", 340, 52);

            // the PDMS channel
            ctx.save();
            ctx.translate(340 + state.x * 0.45, 160);
            ctx.rotate(state.a * Math.PI / 180);
            ctx.fillStyle = "rgba(120,180,255,.35)";
            ctx.strokeStyle = "rgba(245,247,255,.95)";
            ctx.lineWidth = 3;
            ctx.fillRect(-26, -130, 52, 260);
            ctx.strokeRect(-26, -130, 52, 260);
            ctx.strokeStyle = "rgba(255,214,102,.95)";
            ctx.lineWidth = 1.4;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(0, -130);
            ctx.lineTo(0, 130);
            ctx.stroke();
            ctx.restore();

            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(245,247,255,.85)";
            ctx.fillText("PDMS channel", 340 + state.x * 0.45, 300);

            // target line
            ctx.strokeStyle = "rgba(84,224,199,.85)";
            ctx.setLineDash([2, 5]);
            ctx.beginPath();
            ctx.moveTo(340, 40);
            ctx.lineTo(340, 280);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 28: FROM DESIGN TO A WORKING CHIP
    ====================================== */

    SIMS["mems-order28"] = M.orderGame(
        "Game: from design to a working chip",
        [
            { n: "Design by rule", d: "Set IDT and channel dimensions from known design rules", why: "The starting dimensions come from known design rules." },
            { n: "Design by analysis", d: "Simulate the wave and confirm frequency and displacement", why: "The simulation confirms the design works before a single wafer is touched." },
            { n: "Fabricate", d: "Pattern the IDT electrodes with metal lift-off", why: "Only a design that has been checked is worth fabricating." },
            { n: "Bond", d: "Attach the PDMS microchannel over the SSAW region", why: "The channel can only be aligned once the electrodes exist." },
            { n: "Test", d: "Verify particle focusing and separation", why: "The finished chip is tested against the standing wave's pressure nodes inside the channel." }
        ],
        "mems-order28-done",
        "You ordered a design-to-chip run",
        "Tap the five steps in the order a working chip is made.",
        "Every step exists to control one thing precisely: where the standing wave's pressure nodes fall inside the channel."
    );


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="mems-"]').forEach(F.mount);

})();
