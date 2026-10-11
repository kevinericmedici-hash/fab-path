/* ========================================
   BLOOD-BRAIN BARRIER ON A CHIP: INTERACTIVE SIMULATORS, PART 1

   Unit 1: the barrier's wall, the scale of the vessels, its jobs.
   Unit 2: the neurovascular unit.
   Unit 3: tight junctions.
   Unit 4: five routes across the barrier.
   Unit 5: the drug delivery problem.

   Registers on window.FabInteract; shares the helpers from
   diagram-sims-mems.js. Chains diagram-sims-bbb-b.js and -c.js.
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
    const RED = "rgba(235,80,90,";

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

    // A "set your priorities" explorer: sliders weight the properties and bars rank the options.
    function priority(cfg) {

        return function (root) {

            const defaults = {};

            cfg.props.forEach(function (p) { defaults[p.k] = 1; });

            const state = Object.assign({}, defaults);
            const winners = {};

            root.innerHTML =
                head(cfg.title) +
                art("0 0 340 " + (30 + cfg.fam.length * 36), cfg.aria) +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
                '<p class="fd-sim-note" data-out="why"></p>' +
                '<div class="fd-sim-controls">' +
                cfg.props.map(function (p) { return slider({ label: p.n + " matters", key: p.k, min: 0, max: 3, step: 1, value: 1 }); }).join("") +
                "</div>" +
                '<p class="fd-sim-formula">' + cfg.foot + "</p>";

            const svg = root.querySelector("svg");

            function update() {

                const words = ["not at all", "a little", "quite a lot", "essential"];

                cfg.props.forEach(function (p) { setVal(root, p.k, words[state[p.k]]); });

                const total = cfg.props.reduce(function (a, p) { return a + state[p.k]; }, 0);
                const scores = cfg.fam.map(function (f) {

                    return total ? cfg.props.reduce(function (a, p) { return a + state[p.k] * f.r[p.k]; }, 0) / (total * 5) : 0;
                });

                let best = 0;

                scores.forEach(function (s, i) { if (s > scores[best]) { best = i; } });

                let s = label(14, 14, "How well each option fits your priorities", 8, "start", "var(--muted)");

                cfg.fam.forEach(function (f, i) {

                    const y = 28 + i * 36;

                    s += label(14, y + 4, f.n, 8.5, "start", "var(--text)");
                    s += rect(14, y + 9, 230, 15, "rgba(170,179,207,.2)");
                    s += rect(14, y + 9, 230 * scores[i], 15, f.c + (i === best && total ? ".95)" : ".45)"));
                    s += label(250, y + 21, Math.round(scores[i] * 100) + "%", 9, "start", "var(--text)");
                });

                svg.innerHTML = s;

                if (!total) {

                    out(root, "verdict", "Raise a priority above");
                    out(root, "why", "Slide at least one property up to see which option fits.");

                    return;
                }

                const weak = cfg.props.filter(function (p) { return cfg.fam[best].r[p.k] <= 2 && state[p.k] > 0; });

                out(root, "verdict", cfg.fam[best].n + " fits best");
                out(root, "why", weak.length ? "But it is weak on: " + weak.map(function (p) { return p.n.toLowerCase(); }).join(", ") + "." : "And it does not give up anything you asked for.");

                winners[best] = true;

                if (Object.keys(winners).length >= Math.min(3, cfg.fam.length)) {
                    F.reward(cfg.key, 10, "You found priorities that favor different options");
                }
            }

            wire(root, state, defaults, update);
            update();
        };
    }

    F.bbbHelpers = {
        TEAL: TEAL, GOLD: GOLD, ROSE: ROSE, BLUE: BLUE, GREY: GREY, TEXT: TEXT, RED: RED,
        canvasFor: canvasFor, clear: clear, txt: txt, dot: dot, priority: priority
    };


    /* ======================================
       UNIT 1: WHY THE BRAIN NEEDS A BARRIER
    ====================================== */

    SIMS["bbb-demanding"] = quiz(
        "Game: why is the brain so demanding?",
        ["Hungry", "Sensitive", "Densely supplied"],
        [
            { q: "About 2% of body weight, but roughly 20% of the body's energy.", a: "Hungry", why: "A small organ with a big appetite." },
            { q: "Neurons fire on tiny changes in ions and signaling molecules.", a: "Sensitive", why: "Stray chemicals cause trouble." },
            { q: "Capillaries thread through the tissue, so almost every neuron sits close to one.", a: "Densely supplied", why: "A generous supply." },
            { q: "This is why the brain needs a filtered supply, not just a generous one.", a: "Sensitive", why: "Sensitive cells need a controlled environment." },
            { q: "It uses far more energy than its share of body weight.", a: "Hungry", why: "Ten times its weight share." }
        ],
        4,
        "bbb-demanding-done",
        "You know why the brain needs a barrier",
        "The brain needs a generous supply, but a filtered one.",
        "Hungry, sensitive, densely supplied. Hit Reset to try again."
    );


    SIMS["bbb-wall"] = function (root) {

        const defaults = { kind: "other" };
        const state = { kind: "other" };
        const seen = {};
        const rand = mulberry(Date.now() % 9999);
        let mols = [];
        let reached = 0;
        let tried = 0;

        root.innerHTML =
            head("Try it: a leaky wall and a sealed one") +
            canvasFor(680, 330, "A capillary wall between blood above and tissue below. In most organs there are gaps between the wall's cells, and small molecules slip through. In the brain the cells are sealed together, and only molecules with a dedicated transporter get through.") +
            '<div class="fd-stat-row">' + stat("Molecules that tried", "t") + stat("Reached the tissue", "r") + stat("Share that got through", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Capillary wall", "kind", [["other", "Most organs (gaps)"], ["brain", "Brain (sealed + transporters)"]]) +
            '<p class="fd-sim-formula">In the brain, the cells lining the capillaries are sealed together and tightly control what crosses. The blood-brain barrier is not a separate wall: it is the living lining of the brain\'s blood vessels. It is a selective gate, not a solid wall.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const WALL = 160;
        const cells = [];

        for (let i = 0; i < 6; i++) { cells.push(70 + i * 95); }

        function gapAt(x) {

            // gaps between cells: at the boundaries between them
            for (let i = 0; i < cells.length - 1; i++) {

                const g = (cells[i] + cells[i + 1]) / 2 + 47.5 - 47.5;

                if (Math.abs(x - g) < 6) { return true; }
            }

            return false;
        }

        function doorAt(x) { return Math.abs(x - 300) < 9 || Math.abs(x - 490) < 9; }

        function spawn() {

            const t = rand();

            return { x: 60 + rand() * 560, y: 30 + rand() * 30, vy: 30 + rand() * 25, vx: (rand() - 0.5) * 30, type: t < 0.25 ? "glu" : t < 0.6 ? "small" : "big", done: false };
        }

        function reset() {

            mols = [];

            for (let i = 0; i < 22; i++) { mols.push(spawn()); }

            reached = 0;
            tried = 0;
        }

        function update() {

            seen[state.kind] = true;
            out(root, "t", tried);
            out(root, "r", reached);
            out(root, "s", tried ? Math.round(reached / tried * 100) + " %" : "—");
            out(root, "verdict", state.kind === "other" ? "Gaps between cells let small molecules slip through" : "Sealed: only nutrients with a transporter get in");

            if (seen.other && seen.brain && tried > 20) {
                F.reward("bbb-wall", 10, "You compared a leaky wall with a sealed one");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const brain = state.kind === "brain";

            ctx.fillStyle = RED + ".12)";
            ctx.fillRect(0, 0, 680, WALL - 20);
            ctx.fillStyle = BLUE + ".08)";
            ctx.fillRect(0, WALL + 20, 680, 150);
            txt(ctx, "blood", 50, 22, 13, RED + "1)", "center", true);
            txt(ctx, brain ? "brain tissue" : "tissue", 62, 318, 13, TEXT + ".8)", "center", true);

            // the wall: a row of cells with gaps between them
            cells.forEach(function (cx, i) {

                ctx.fillStyle = TEAL + ".6)";
                ctx.fillRect(cx - 40, WALL - 20, 80, 40);
                ctx.strokeStyle = TEXT + ".7)";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(cx - 40, WALL - 20, 80, 40);
                dot(ctx, cx, WALL, 8, "rgba(6,10,24,.5)");
                i;
            });

            if (brain) {

                // tight junctions fill the gaps
                for (let i = 0; i < cells.length - 1; i++) {

                    const g = (cells[i] + cells[i + 1]) / 2;

                    ctx.fillStyle = GOLD + ".95)";
                    ctx.fillRect(g - 6, WALL - 20, 12, 40);
                }

                // two transporter doors
                [300, 490].forEach(function (x) {

                    ctx.fillStyle = GOLD + ".95)";
                    ctx.fillRect(x - 9, WALL - 22, 18, 44);
                    txt(ctx, "GLUT1", x, WALL + 38, 11, GOLD + "1)");
                });

                txt(ctx, "tight junctions (gold) seal the gaps", 340, WALL - 34, 12, GOLD + "1)");
            } else {

                txt(ctx, "gaps between the cells", 340, WALL - 34, 12, TEXT + ".7)");
            }

            mols.forEach(function (m) {

                const col = m.type === "glu" ? GOLD : m.type === "small" ? GREY : ROSE;
                const r = m.type === "big" ? 7 : m.type === "glu" ? 5 : 4;

                dot(ctx, m.x, m.y, r, col + ".95)");
            });

            txt(ctx, "● glucose   ● small molecule   ● large molecule", 340, 14, 11, TEXT + ".6)");
        }

        animate(root, function (dt) {

            const brain = state.kind === "brain";

            mols.forEach(function (m, i) {

                m.x += m.vx * dt;
                m.y += m.vy * dt;

                if (m.x < 20 || m.x > 660) { m.vx *= -1; }

                // hit the wall from above
                if (m.y > WALL - 26 && m.y < WALL - 10 && m.vy > 0) {

                    let pass = false;

                    if (!brain) {

                        pass = (m.type !== "big" || false) && gapAt(m.x) || (m.type === "big" && false);

                        // in most organs even fairly large molecules can slip through the gaps; the biggest cannot
                        if (m.type === "big" && gapAt(m.x) && rand() < 0.35) { pass = true; }

                    } else {

                        pass = m.type === "glu" && doorAt(m.x);
                    }

                    tried++;
                    update();

                    if (pass) {

                        m.y = WALL + 24;
                        m.done = true;

                    } else {

                        m.vy = -Math.abs(m.vy);
                        m.y = WALL - 28;
                    }
                }

                if (m.done && m.y > 300) {

                    reached++;
                    mols[i] = spawn();
                    update();
                }

                if (m.y < 20) { m.vy = Math.abs(m.vy); }
            });

            draw();
        });

        wire(root, state, defaults, function () {

            reset();
            update();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            reset();
            update();
        });

        reset();
        update();
        draw();
    };


    SIMS["bbb-scale"] = function (root) {

        const defaults = { d: 7, len: 600 };
        const state = { d: 7, len: 600 };
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: a huge barrier made of tiny pipes") +
            canvasFor(680, 300, "A brain capillary with red blood cells squeezing through in single file. The width of the capillary follows the slider. A readout shows the total exchange area for a chosen total length of vessel.") +
            '<div class="fd-stat-row">' + stat("Red cells pass", "rbc") + stat("Exchange area (π · d · L)", "area") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Capillary width", key: "d", min: 3, max: 20, step: 0.5, value: 7 }) +
            slider({ label: "Total length of brain vessels", key: "len", min: 100, max: 700, step: 10, value: 600 }) +
            "</div>" +
            '<p class="fd-sim-formula">Brain capillaries are only about 5 to 10 µm across, so red blood cells (about 7–8 µm) squeeze through in single file. Laid end to end the vessels stretch for hundreds of kilometers, and the exchange surface is often estimated at 10 to 20 m². A barrier this long has to be built from cells.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const area = Math.PI * state.d * 1e-6 * state.len * 1e3;

            setVal(root, "d", state.d.toFixed(1) + " µm");
            setVal(root, "len", state.len + " km");
            out(root, "rbc", state.d < 6 ? "squeezed hard (may jam)" : state.d <= 10 ? "in single file" : "easily, side by side");
            out(root, "area", area.toFixed(1) + " m²  (about " + (area / 12).toFixed(1) + " small bedrooms)");
            out(root, "verdict", area >= 10 && area <= 20 ? "In the 10 to 20 m² range often quoted for the brain" : area < 10 ? "A smaller surface than the brain's estimate" : "More surface than the usual estimate");

            if (!hit && area >= 10 && area <= 20 && state.d >= 5 && state.d <= 10) {

                hit = true;
                F.reward("bbb-scale", 10, "You sized a brain-like vascular network");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const sc = 11; // px per µm
            const h = state.d * sc;
            const cy = 130;

            ctx.fillStyle = GREY + ".2)";
            ctx.fillRect(0, cy - h / 2 - 12, 680, 12);
            ctx.fillRect(0, cy + h / 2, 680, 12);
            ctx.fillStyle = RED + ".1)";
            ctx.fillRect(0, cy - h / 2, 680, h);
            txt(ctx, "capillary wall", 80, cy - h / 2 - 18, 12, TEXT + ".6)");

            // red cells about 7.5 µm across
            const rd = 7.5 * sc;
            const squeeze = state.d < 8.5;
            const length = squeeze ? rd * clamp(7.5 / Math.max(state.d, 3.5), 1, 2.2) : rd;
            const thick = squeeze ? Math.min(rd, h - 6) : rd;
            const n = squeeze ? 4 : 3;

            for (let i = 0; i < n; i++) {

                const spacing = 680 / n;
                const x = ((t * 60 + i * spacing) % (680 + 160)) - 80;
                const yy = state.d >= 8.5 ? cy + Math.sin(i * 2.1) * (h / 2 - rd / 2 - 3) * (state.d > 12 ? 1 : 0.2) : cy;

                ctx.fillStyle = RED + ".9)";
                ctx.beginPath();
                ctx.ellipse(x, yy, length / 2, thick / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(120,20,30,.6)";
                ctx.beginPath();
                ctx.ellipse(x, yy, length / 5, thick / 5, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // width marker
            ctx.strokeStyle = GOLD + ".9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(620, cy - h / 2); ctx.lineTo(620, cy + h / 2);
            ctx.stroke();
            txt(ctx, state.d.toFixed(1) + " µm", 640, cy + 4, 13, GOLD + "1)", "center", true);

            // network sketch below: a long line wound up
            txt(ctx, "stretched end to end, these vessels would run " + state.len + " km", 340, 262, 13, TEXT + ".75)");
            ctx.strokeStyle = TEAL + ".7)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let i = 0; i < 40; i++) {

                const x = 60 + i * 14;
                const y = 285 + Math.sin(i * 0.9) * 5;

                if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }

            ctx.stroke();
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


    SIMS["bbb-jobs"] = quiz(
        "Game: what does the barrier do?",
        ["Blocks", "Delivers", "Removes", "Stabilizes"],
        [
            { q: "Keeps out most germs, toxins, large proteins and circulating blood cells.", a: "Blocks", why: "The sealed wall." },
            { q: "Moves in glucose and amino acids through dedicated transporters.", a: "Delivers", why: "Selective doors for nutrients." },
            { q: "Pumps waste and unwanted molecules back out into the blood.", a: "Removes", why: "Efflux pumps." },
            { q: "Keeps the chemical surroundings of neurons steady.", a: "Stabilizes", why: "Neurons need a stable environment." },
            { q: "Glucose arriving through GLUT1.", a: "Delivers", why: "A transporter does the delivery." },
            { q: "Why can't it simply be a solid wall?", a: "Delivers", why: "The brain still needs a supply of nutrients." }
        ],
        5,
        "bbb-jobs-done",
        "You know the barrier's four jobs",
        "It is a selective gate, not a solid wall.",
        "Block, deliver, remove, stabilize. Hit Reset to try again."
    );


    /* ======================================
       UNIT 2: THE NEUROVASCULAR UNIT
    ====================================== */

    SIMS["bbb-cast"] = quiz(
        "Game: who is who?",
        ["Endothelial cells", "Pericytes", "Astrocytes", "Microglia", "Basement membrane"],
        [
            { q: "Line the inside of the vessel and form the barrier itself.", a: "Endothelial cells", why: "They are the barrier." },
            { q: "Wrap around the capillary, helping regulate blood flow and keeping the barrier tight.", a: "Pericytes", why: "Small cells that grip the vessel." },
            { q: "Star-shaped support cells whose end-feet cover most of the vessel's outside.", a: "Astrocytes", why: "Their end-feet surround the vessel." },
            { q: "The brain's resident immune cells.", a: "Microglia", why: "They respond to injury and infection." },
            { q: "A thin sheet of collagen IV and laminin that anchors the cells.", a: "Basement membrane", why: "A protein sheet around the endothelium." },
            { q: "In mice lacking these, the barrier becomes leakier.", a: "Pericytes", why: "They help maintain the seal." }
        ],
        5,
        "bbb-cast-done",
        "You know the cast of the neurovascular unit",
        "Together they are called the neurovascular unit.",
        "Endothelium lines, pericytes wrap, astrocytes surround. Hit Reset to try again."
    );


    SIMS["bbb-nvu"] = function (root) {

        const targets = [
            { id: "lumen", q: "the open channel where blood flows (lumen)" },
            { id: "endo", q: "the endothelial cells that form the ring" },
            { id: "bm", q: "the thin basement membrane" },
            { id: "peri", q: "a pericyte" },
            { id: "astro", q: "the astrocyte end-feet on the outside" }
        ];
        const peri = [0.7, 2.7, 5.0]; // angles in radians
        const state = { i: 0, score: 0, answered: false, list: [] };
        const rand = mulberry(Date.now() % 99999);

        root.innerHTML =
            head("Game: find it on the cross-section") +
            '<div class="fd-stat-row">' + stat("Round", "round") + stat("Score", "score") + "</div>" +
            '<p class="fd-q-prompt" data-out="prompt"></p>' +
            canvasFor(680, 340, "A cross-section looking down a brain capillary: an open channel in the middle, a ring of endothelial cells, a thin basement membrane, pericytes sitting in it, and astrocyte end-feet around the outside. Tap the part you are asked to find.") +
            '<p class="fd-q-feedback" data-out="fb"></p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-next style="display:none">Next →</button></div>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const nextBtn = root.querySelector("[data-next]");
        const CX = 340;
        const CY = 175;

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

            const dx = x - CX;
            const dy = y - CY;
            const r = Math.hypot(dx, dy);
            const a = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);

            if (r < 62) { return "lumen"; }
            if (r < 92) { return "endo"; }
            if (r < 100) {

                const near = peri.some(function (p) { return Math.abs(Math.atan2(Math.sin(a - p), Math.cos(a - p))) < 0.2; });

                return near ? "peri" : "bm";
            }

            if (r < 116) {

                const near = peri.some(function (p) { return Math.abs(Math.atan2(Math.sin(a - p), Math.cos(a - p))) < 0.22; });

                return near ? "peri" : "astro";
            }

            if (r < 150) { return "astro"; }

            return "none";
        }

        function draw(hilite) {

            clear(ctx, 680, 340);

            // astrocyte end-feet (a ring of pads)
            for (let i = 0; i < 14; i++) {

                const a = i / 14 * Math.PI * 2;

                ctx.fillStyle = (hilite === "astro" ? GOLD : ROSE) + ".45)";
                ctx.beginPath();
                ctx.arc(CX + Math.cos(a) * 128, CY + Math.sin(a) * 128, 22, 0, Math.PI * 2);
                ctx.fill();
            }

            // basement membrane
            ctx.strokeStyle = (hilite === "bm" ? GOLD : BLUE) + ".95)";
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.arc(CX, CY, 96, 0, Math.PI * 2);
            ctx.stroke();

            // endothelial ring
            ctx.strokeStyle = (hilite === "endo" ? GOLD : TEAL) + ".85)";
            ctx.lineWidth = 28;
            ctx.beginPath();
            ctx.arc(CX, CY, 77, 0, Math.PI * 2);
            ctx.stroke();

            // nuclei
            [1.4, 3.9, 5.7].forEach(function (a) { dot(ctx, CX + Math.cos(a) * 77, CY + Math.sin(a) * 77, 9, "rgba(6,10,24,.55)"); });

            // pericytes
            peri.forEach(function (a) {

                ctx.fillStyle = (hilite === "peri" ? GOLD : "rgba(190,150,255,") + ".95)";
                ctx.beginPath();
                ctx.ellipse(CX + Math.cos(a) * 106, CY + Math.sin(a) * 106, 15, 9, a + Math.PI / 2, 0, Math.PI * 2);
                ctx.fill();
            });

            // lumen with red cells
            ctx.fillStyle = (hilite === "lumen" ? GOLD + ".25)" : RED + ".18)");
            ctx.beginPath();
            ctx.arc(CX, CY, 62, 0, Math.PI * 2);
            ctx.fill();
            dot(ctx, CX - 14, CY + 4, 16, RED + ".85)");
            dot(ctx, CX + 20, CY - 12, 15, RED + ".85)");
        }

        function show() {

            const n = state.list.length;

            if (state.i >= n) {

                out(root, "prompt", "Done! You got " + state.score + " of " + n + ".");
                nextBtn.style.display = "none";
                out(root, "round", "done");
                out(root, "score", state.score + " / " + n);
                F.reward("bbb-nvu", 15, "You found every part of the neurovascular unit");
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
            const y = (e.clientY - r.top) * 340 / r.height;
            const hit = classify(x, y);
            const want = state.list[state.i].id;

            state.answered = true;

            if (hit === want) {

                state.score++;
                out(root, "fb", "✅ Right.");

            } else {

                out(root, "fb", "❌ Not quite: that was the " + (hit === "none" ? "outside" : hit === "peri" ? "pericyte" : hit === "bm" ? "basement membrane" : hit === "astro" ? "astrocyte feet" : hit === "endo" ? "endothelium" : "lumen") + ". Here is the right spot, in gold.");
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


    SIMS["bbb-tighten"] = function (root) {

        const defaults = { peri: 0, astro: 0 };
        const state = { peri: 0, astro: 0 };
        const rand = mulberry(31);
        let mols = [];
        const seen = {};

        root.innerHTML =
            head("Try it: the neighbors tighten the barrier") +
            canvasFor(680, 320, "Two endothelial cells with a junction between them. Adding pericytes and astrocytes sends signals that tighten the junction and narrow the gap, so fewer molecules slip between the cells.") +
            '<div class="fd-stat-row">' + stat("Junction gap", "gap") + stat("Barrier tightness", "tt") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Pericytes nearby", "peri", [[0, "Absent"], [1, "Present"]]) +
            seg("Astrocytes nearby", "astro", [[0, "Absent"], [1, "Present"]]) +
            '<p class="fd-sim-formula">Astrocytes and pericytes send chemical signals that tighten endothelial junctions. In mice lacking pericytes the barrier becomes leakier. A tight barrier is maintained by conversation, not built once and left alone. (Illustrative tightness values.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let leaked = 0;

        function tight() { return 0.3 + 0.25 * state.peri + 0.25 * state.astro + 0.18 * state.peri * state.astro; }

        function update() {

            const tt = tight();

            seen[state.peri + "" + state.astro] = true;
            out(root, "gap", (1 - tt).toFixed(2) + " (relative)");
            out(root, "tt", Math.round(tt * 100) + " %");
            out(root, "verdict", state.peri && state.astro ? "The whole neighborhood: the tightest barrier" : state.peri || state.astro ? "One helper cell type: a tighter barrier than endothelium alone" : "Endothelium alone: a weaker, leakier barrier");

            if (Object.keys(seen).length >= 4) {
                F.reward("bbb-tighten", 10, "You rebuilt the neighborhood piece by piece");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const tt = tight();
            const gap = (1 - tt) * 44 + 3;
            const cx = 340;

            // blood side (top), brain side (bottom)
            ctx.fillStyle = RED + ".1)";
            ctx.fillRect(0, 0, 680, 110);
            ctx.fillStyle = BLUE + ".07)";
            ctx.fillRect(0, 210, 680, 110);
            txt(ctx, "blood", 40, 22, 13, RED + "1)", "center", true);
            txt(ctx, "brain", 40, 308, 13, TEXT + ".8)", "center", true);

            ctx.fillStyle = TEAL + ".6)";
            ctx.fillRect(40, 110, cx - gap / 2 - 40, 100);
            ctx.fillRect(cx + gap / 2, 110, 640 - cx - gap / 2, 100);
            txt(ctx, "endothelial cell", 190, 165, 13, "rgba(6,10,24,.95)", "center", true);
            txt(ctx, "endothelial cell", 490, 165, 13, "rgba(6,10,24,.95)", "center", true);

            // tight junction
            ctx.fillStyle = GOLD + ".95)";
            ctx.fillRect(cx - gap / 2 - 5, 110, 5, 100);
            ctx.fillRect(cx + gap / 2, 110, 5, 100);

            if (state.peri) {

                ctx.fillStyle = "rgba(190,150,255,.95)";
                ctx.beginPath();
                ctx.ellipse(130, 230, 40, 14, 0, 0, Math.PI * 2);
                ctx.fill();
                txt(ctx, "pericyte", 130, 258, 12, "rgba(190,150,255,1)");
            }

            if (state.astro) {

                for (let i = 0; i < 3; i++) {

                    ctx.fillStyle = ROSE + ".6)";
                    ctx.beginPath();
                    ctx.arc(480 + i * 52, 232, 22, 0, Math.PI * 2);
                    ctx.fill();
                }

                txt(ctx, "astrocyte end-feet", 530, 275, 12, ROSE + "1)");
            }

            // signals
            if (state.peri || state.astro) {

                ctx.strokeStyle = GOLD + ".8)";
                ctx.setLineDash([4, 4]);
                ctx.lineWidth = 2;
                ctx.beginPath();

                if (state.peri) { ctx.moveTo(150, 216); ctx.lineTo(cx - 20, 190); }
                if (state.astro) { ctx.moveTo(500, 216); ctx.lineTo(cx + 20, 190); }

                ctx.stroke();
                ctx.setLineDash([]);
                txt(ctx, "tightening signals", cx, 240, 12, GOLD + "1)");
            }

            mols.forEach(function (m) { dot(ctx, m.x, m.y, 4.5, GREY + ".95)"); });
            txt(ctx, "leaked through: " + leaked, 600, 22, 13, TEXT + ".8)", "center", true);
        }

        animate(root, function (dt) {

            const tt = tight();
            const gap = (1 - tt) * 44 + 3;

            if (rand() < 0.12) { mols.push({ x: 340 + (rand() - 0.5) * 140, y: 20, vy: 70, vx: (rand() - 0.5) * 20 }); }

            mols.forEach(function (m) {

                m.y += m.vy * dt;
                m.x += m.vx * dt;

                if (m.y > 98 && m.y < 112 && m.vy > 0) {

                    if (Math.abs(m.x - 340) < gap / 2 - 2) {

                        m.y += 14;
                        m.lk = true;

                    } else {

                        m.vy = -Math.abs(m.vy);
                    }
                }

                if (m.y < 10) { m.vy = Math.abs(m.vy); }

                if (m.lk && m.y > 215 && !m.counted) {

                    m.counted = true;
                    leaked++;
                }
            });

            mols = mols.filter(function (m) { return m.y < 300 && m.y > -20; });

            draw();
        });

        wire(root, state, defaults, function () {

            leaked = 0;
            mols = [];
            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["bbb-modelcells"] = quiz(
        "Game: build the model's neighborhood",
        ["Endothelial cells only", "Add astrocytes", "Add pericytes", "Add both"],
        [
            { q: "Usually makes a weaker barrier than the one in the body.", a: "Endothelial cells only", why: "The neighbors are missing." },
            { q: "Astrocyte signals tighten the barrier and keep it mature.", a: "Add astrocytes", why: "Co-culture helps." },
            { q: "Pericytes add stability and signals along the vessel wall.", a: "Add pericytes", why: "They help maintain tightness." },
            { q: "The best models try to recreate the whole neighborhood.", a: "Add both", why: "A good model rebuilds the neighborhood, not just the wall." },
            { q: "The simplest model: fast to build, but a leakier barrier.", a: "Endothelial cells only", why: "Endothelium alone is not enough." }
        ],
        4,
        "bbb-modelcells-done",
        "You know why models add cell types",
        "A good model rebuilds the neighborhood, not just the wall.",
        "Endothelium alone is weak; neighbors tighten it. Hit Reset to try again."
    );


    /* ======================================
       UNIT 3: TIGHT JUNCTIONS
    ====================================== */

    SIMS["bbb-paratrans"] = quiz(
        "Game: between or through?",
        ["Paracellular", "Transcellular"],
        [
            { q: "Between neighboring cells, through the narrow gap that joins them.", a: "Paracellular", why: "Around the cells." },
            { q: "Through a cell, across its membrane or inside carriers and vesicles.", a: "Transcellular", why: "Right through the cell." },
            { q: "Tight junctions shut this route in the brain.", a: "Paracellular", why: "Protein seals close the gap." },
            { q: "GLUT1 carrying glucose.", a: "Transcellular", why: "Through the cell, via a carrier." },
            { q: "A molecule slipping through a leaky junction.", a: "Paracellular", why: "Between the cells." }
        ],
        4,
        "bbb-paratrans-done",
        "You know the two paths",
        "In the brain, protein seals shut the paracellular route.",
        "Para: between. Trans: through. Hit Reset to try again."
    );


    SIMS["bbb-zipper"] = function (root) {

        const defaults = { n: 3 };
        const state = { n: 3 };
        const rand = mulberry(77);
        let mols = [];
        let leaked = 0;
        let tried = 0;
        const seen = {};

        root.innerHTML =
            head("Try it: zip the gap shut") +
            canvasFor(680, 330, "Two cells side by side with a gap between them. Proteins on each cell reach across and lock together like a zipper. With few strands the gap stays open and molecules slip through; with many, the gap is sealed.") +
            '<div class="fd-stat-row">' + stat("Strands zipped", "n") + stat("Molecules that slipped through", "l") + stat("Share that got through", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Tight-junction strands (claudin-5 and partners)", key: "n", min: 0, max: 12, step: 1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">Proteins on each cell reach across the gap and bind their partners on the neighboring cell, forming strands that act like a zipper. Zip the gap shut, and nothing slips between cells. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function pass() { return clamp(1 - state.n / 9, 0, 1); }

        function update() {

            seen[state.n === 0 ? "open" : state.n >= 10 ? "shut" : "mid"] = true;
            setVal(root, "n", state.n);
            out(root, "n", state.n + " of 12");
            out(root, "l", leaked);
            out(root, "s", tried ? Math.round(leaked / tried * 100) + " %" : "—");
            out(root, "verdict", state.n >= 10 ? "Zipped shut: nothing gets between the cells" : state.n <= 2 ? "Mostly open: the paracellular route is a highway" : "Partly sealed: some molecules still find a gap");

            if (seen.open && seen.shut && tried > 15) {
                F.reward("bbb-zipper", 10, "You zipped a junction from open to sealed");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            ctx.fillStyle = RED + ".1)";
            ctx.fillRect(0, 0, 680, 100);
            ctx.fillStyle = BLUE + ".07)";
            ctx.fillRect(0, 230, 680, 100);
            txt(ctx, "blood", 40, 22, 13, RED + "1)", "center", true);
            txt(ctx, "brain", 40, 318, 13, TEXT + ".8)", "center", true);

            ctx.fillStyle = TEAL + ".55)";
            ctx.fillRect(100, 100, 220, 130);
            ctx.fillRect(360, 100, 220, 130);
            txt(ctx, "cell", 210, 170, 14, "rgba(6,10,24,.95)", "center", true);
            txt(ctx, "cell", 470, 170, 14, "rgba(6,10,24,.95)", "center", true);

            // zipper strands across the 40 px gap
            for (let i = 0; i < 12; i++) {

                const y = 106 + i * 10.5;
                const on = i < state.n;

                if (!on) { continue; }

                ctx.strokeStyle = GOLD + ".95)";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(320, y); ctx.lineTo(360, y);
                ctx.stroke();
            }

            txt(ctx, "tight junction", 340, 250, 12, GOLD + "1)");

            mols.forEach(function (m) { dot(ctx, m.x, m.y, 4.5, GREY + ".95)"); });
        }

        animate(root, function (dt) {

            if (rand() < 0.15) { mols.push({ x: 322 + rand() * 36, y: 20, vy: 70, vx: 0, lk: false, c: false }); }

            mols.forEach(function (m) {

                m.y += m.vy * dt;

                if (m.y > 92 && m.y < 106 && m.vy > 0 && !m.chk) {

                    m.chk = true;
                    tried++;

                    if (rand() < pass()) { m.lk = true; } else { m.vy = -Math.abs(m.vy); }
                }

                if (m.lk && m.y > 235 && !m.c) {

                    m.c = true;
                    leaked++;
                    update();
                }

                if (m.y < 8) { m.vy = Math.abs(m.vy); m.chk = false; }
            });

            mols = mols.filter(function (m) { return m.y < 300; });

            draw();
        });

        wire(root, state, defaults, function () {

            mols = [];
            leaked = 0;
            tried = 0;
            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["bbb-jparts"] = quiz(
        "Game: the parts list",
        ["Claudin-5", "Occludin", "ZO-1", "VE-cadherin"],
        [
            { q: "The key sealing protein in brain endothelium.", a: "Claudin-5", why: "It pairs with partners on the neighboring cell." },
            { q: "A junction protein that helps stabilize and tune the seal.", a: "Occludin", why: "It fine-tunes the seal." },
            { q: "A scaffold inside the cell that links the junction to the cell's internal skeleton.", a: "ZO-1", why: "A scaffold protein." },
            { q: "Part of the neighboring adherens junction, which holds the cells mechanically together.", a: "VE-cadherin", why: "The mechanical anchor." },
            { q: "Scientists stain for this one and ZO-1 to check a model's junctions.", a: "Claudin-5", why: "A continuous outline is a good sign." }
        ],
        4,
        "bbb-jparts-done",
        "You know the junction proteins",
        "Seal proteins plus scaffolds plus anchors make one strong junction.",
        "Claudin seals, occludin tunes, ZO-1 scaffolds, VE-cadherin anchors. Hit Reset to try again."
    );


    SIMS["bbb-stain"] = function (root) {

        const state = { i: 0, score: 0, answered: false, list: [] };
        const rand = mulberry(Date.now() % 99999);

        root.innerHTML =
            head("Game: is this a good barrier?") +
            '<div class="fd-stat-row">' + stat("Round", "round") + stat("Score", "score") + "</div>" +
            canvasFor(680, 300, "A fluorescence image of cell outlines stained for a junction protein. A good barrier shows a continuous bright outline around every cell; a leaky one has broken, patchy outlines.") +
            '<p class="fd-q-prompt">Is this a good barrier?</p>' +
            '<div class="fd-q-options" data-opts></div>' +
            '<p class="fd-q-feedback" data-out="fb"></p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-next style="display:none">Next →</button></div>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const optsEl = root.querySelector("[data-opts]");
        const nextBtn = root.querySelector("[data-next]");
        const options = ["Continuous outlines: a good barrier", "Broken outlines: a leaky barrier"];

        function pick() {

            const levels = [0.98, 0.96, 0.99, 0.5, 0.35, 0.6];

            for (let i = levels.length - 1; i > 0; i--) {

                const j = Math.floor(rand() * (i + 1));
                const t = levels[i];

                levels[i] = levels[j];
                levels[j] = t;
            }

            state.list = levels;
        }

        function drawImage(p) {

            clear(ctx, 680, 300);
            ctx.fillStyle = "rgba(3,6,14,1)";
            ctx.fillRect(0, 0, 680, 300);

            const r = mulberry(Math.floor(p * 1000) + state.i * 17);
            const R = 40;
            const hh = R * Math.sqrt(3);

            ctx.lineWidth = 3;
            ctx.lineCap = "round";

            for (let row = -1; row < 6; row++) {

                for (let col = -1; col < 9; col++) {

                    const cx = col * R * 1.5 + 40;
                    const cy = row * hh + (col % 2 ? hh / 2 : 0) + 20;

                    for (let k = 0; k < 6; k++) {

                        const a1 = k * Math.PI / 3;
                        const a2 = (k + 1) * Math.PI / 3;

                        if (r() > p) { continue; }

                        ctx.strokeStyle = "rgba(120,255,160,.9)";
                        ctx.beginPath();
                        ctx.moveTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R);
                        ctx.lineTo(cx + Math.cos(a2) * R, cy + Math.sin(a2) * R);
                        ctx.stroke();
                    }
                }
            }
        }

        function show() {

            const n = state.list.length;

            if (state.i >= n) {

                ctx.clearRect(0, 0, 680, 300);
                optsEl.innerHTML = "";
                out(root, "fb", "Done! You got " + state.score + " of " + n + ". " + (state.score >= n - 1 ? "You can read a junction stain." : "Look for continuous bright outlines. Hit Reset to try again."));
                nextBtn.style.display = "none";
                out(root, "round", "done");
                out(root, "score", state.score + " / " + n);
                F.reward("bbb-stain", 15, "You can read a junction stain");

                return;
            }

            const p = state.list[state.i];

            state.answered = false;
            drawImage(p);
            out(root, "round", (state.i + 1) + " of " + n);
            out(root, "score", state.score + " / " + n);
            out(root, "fb", "Pick the best answer.");
            nextBtn.style.display = "none";

            optsEl.innerHTML = options.map(function (o) { return '<button type="button" data-opt="' + o + '">' + o + "</button>"; }).join("");

            optsEl.querySelectorAll("button").forEach(function (b) {

                b.addEventListener("click", function () {

                    if (state.answered) { return; }

                    state.answered = true;

                    const good = p >= 0.9;
                    const ok = (b.dataset.opt === options[0]) === good;

                    if (ok) { state.score++; }

                    optsEl.querySelectorAll("button").forEach(function (x) {

                        x.disabled = true;

                        if ((x.dataset.opt === options[0]) === good) { x.classList.add("right"); } else if (x === b) { x.classList.add("wrong"); }
                    });

                    out(root, "fb", (ok ? "✅ Right. " : "❌ Not quite. ") + (good ? "Every cell has an unbroken bright outline: the junctions are intact." : "Gaps in the outline mean gaps in the seal."));
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


    /* ======================================
       UNIT 4: HOW THINGS CROSS
    ====================================== */

    SIMS["bbb-fiveroutes"] = quiz(
        "Game: which route?",
        ["Passive diffusion", "Carrier", "Receptor-mediated transcytosis", "Efflux", "Blocked at the gap"],
        [
            { q: "Oxygen, carbon dioxide and caffeine slip through the membrane.", a: "Passive diffusion", why: "Small and oily." },
            { q: "GLUT1 brings in glucose.", a: "Carrier", why: "A dedicated transporter." },
            { q: "The cell wraps a transferrin-bound cargo in a vesicle and carries it across.", a: "Receptor-mediated transcytosis", why: "Vesicles carry big cargo." },
            { q: "P-glycoprotein uses ATP to push a drug back into the blood.", a: "Efflux", why: "A pump on the blood-facing side." },
            { q: "A polar molecule tries to squeeze between the cells.", a: "Blocked at the gap", why: "Tight junctions shut the paracellular route." },
            { q: "Levodopa borrows LAT1.", a: "Carrier", why: "It looks like an amino acid." },
            { q: "A small, oily drug gets in and is then ejected.", a: "Efflux", why: "A drug can be small and oily and still fail." }
        ],
        6,
        "bbb-fiveroutes-done",
        "You know the five routes",
        "Each route has its own rules, so each drug has its own fate.",
        "Diffuse, carry, vesicle, pump, blocked. Hit Reset to try again."
    );


    SIMS["bbb-passive"] = function (root) {

        const defaults = { mw: 300, logp: 2, hbd: 1 };
        const state = { mw: 300, logp: 2, hbd: 1 };
        const presets = {
            diaz: { n: "A small, oily drug", mw: 285, logp: 2.8, hbd: 0 },
            caff: { n: "Caffeine", mw: 194, logp: -0.1, hbd: 0 },
            gluc: { n: "Glucose", mw: 180, logp: -3, hbd: 5 },
            insu: { n: "A large protein", mw: 1000, logp: -2, hbd: 8 }
        };
        const seen = {};

        root.innerHTML =
            head("Try it: will it slip through the membrane?") +
            art("0 0 340 190", "A bar showing how easily a molecule with the chosen size, fat-solubility and hydrogen bonding can diffuse through the brain endothelial cell membrane.") +
            '<div class="fd-stat-row">' + stat("Chance of passive crossing", "p") + stat("Size", "s") + stat("Fat-loving?", "l") + stat("Clings to water?", "h") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-seg"><span class="fd-seg-label">Try a molecule</span>' + Object.keys(presets).map(function (k) { return '<button type="button" class="fd-sim-btn" data-preset="' + k + '">' + presets[k].n + "</button>"; }).join("") + "</div>" +
            '<div class="fd-sim-controls">' +
            slider({ label: "Molecular weight (daltons, up to 1000+)", key: "mw", min: 30, max: 1000, step: 10, value: 300 }) +
            slider({ label: "Fat-solubility (log P)", key: "logp", min: -4, max: 5, step: 0.1, value: 2 }) +
            slider({ label: "Hydrogen-bond donors", key: "hbd", min: 0, max: 8, step: 1, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">Passive diffusion works best below roughly 400 to 500 daltons, for lipid-soluble molecules with few hydrogen bonds. Glucose is small but clings to water, so it needs the GLUT1 carrier. (A rough rule-of-thumb score, not a prediction for a real drug.)</p>';

        const svg = root.querySelector("svg");

        function score() {

            const sz = 1 / (1 + Math.pow(state.mw / 450, 6));
            const lip = 1 / (1 + Math.exp(-(state.logp + 0.5) / 0.7));
            const hb = state.hbd <= 3 ? 1 : Math.max(0.03, 1 - (state.hbd - 3) * 0.3);

            return sz * lip * hb;
        }

        function update() {

            const p = score();

            setVal(root, "mw", state.mw >= 1000 ? "1000+ Da" : state.mw + " Da");
            setVal(root, "logp", state.logp.toFixed(1));
            setVal(root, "hbd", state.hbd);
            out(root, "p", p > 0.6 ? "high" : p > 0.2 ? "moderate" : "very low");
            out(root, "s", state.mw < 450 ? "small enough" : "too big");
            out(root, "l", state.logp > 1 ? "yes" : state.logp > -0.5 ? "a little" : "no");
            out(root, "h", state.hbd > 3 ? "yes, a lot" : "not much");
            out(root, "verdict", p > 0.6 ? "Likely to diffuse across on its own" : p > 0.2 ? "Might cross, but not easily" : "Passive diffusion will not get this across: it needs another route");

            svg.innerHTML =
                label(14, 22, "chance of passive crossing", 8, "start", "var(--muted)") +
                rect(14, 30, 280, 22, "rgba(170,179,207,.18)") +
                rect(14, 30, 280 * p, 22, p > 0.6 ? "rgba(84,224,199,.9)" : p > 0.2 ? "rgba(255,214,102,.85)" : "rgba(255,105,120,.85)") +
                label(14, 84, "size:  " + (state.mw >= 1000 ? "1000+" : state.mw) + " Da   (line at about 450)", 8, "start", "var(--text)") +
                rect(14, 92, 280, 8, "rgba(170,179,207,.18)") +
                rect(14, 92, 280 * Math.min(1, state.mw / 1000), 8, "rgba(120,180,255,.85)") +
                '<line x1="' + (14 + 280 * 0.45) + '" y1="86" x2="' + (14 + 280 * 0.45) + '" y2="106" style="stroke:#ffd666;stroke-width:1.5"/>' +
                label(14, 130, "fat-solubility (log P): " + state.logp.toFixed(1), 8, "start", "var(--text)") +
                label(14, 160, "hydrogen-bond donors: " + state.hbd, 8, "start", "var(--text)");

            if (Object.keys(seen).length >= 4) {
                F.reward("bbb-passive", 10, "You tried small, oily, watery and big molecules");
            }
        }

        wire(root, state, defaults, update);

        root.querySelectorAll("[data-preset]").forEach(function (b) {

            b.addEventListener("click", function () {

                const p = presets[b.dataset.preset];

                seen[b.dataset.preset] = true;
                state.mw = p.mw;
                state.logp = p.logp;
                state.hbd = p.hbd;
                root.querySelectorAll("input[type=range]").forEach(function (i) { i.value = state[i.dataset.key]; });
                update();
            });
        });

        update();
    };


    SIMS["bbb-carriers"] = quiz(
        "Game: which carrier opens the door?",
        ["GLUT1", "LAT1", "MCT1", "No carrier"],
        [
            { q: "Glucose, the brain's main fuel.", a: "GLUT1", why: "Very abundant in brain endothelial cells." },
            { q: "Levodopa, the Parkinson's drug that looks like an amino acid.", a: "LAT1", why: "It rides the large-neutral-amino-acid carrier." },
            { q: "Lactate and ketone bodies.", a: "MCT1", why: "The monocarboxylate carrier." },
            { q: "Large neutral amino acids.", a: "LAT1", why: "That is what LAT1 carries." },
            { q: "A big, plain antibody with nothing nutrient-like about it.", a: "No carrier", why: "Nothing recognizes it." }
        ],
        5,
        "bbb-carriers-done",
        "You know which carrier carries what",
        "A drug that looks like a nutrient can borrow a nutrient's door.",
        "GLUT1: glucose. LAT1: amino acids and levodopa. MCT1: lactate. Hit Reset to try again."
    );


    SIMS["bbb-rmt"] = function (root) {

        const defaults = { cargo: "alone" };
        const state = { cargo: "alone" };
        const rand = mulberry(8);
        const seen = {};
        let agents = [];
        let delivered = 0;
        let t = 0;

        root.innerHTML =
            head("Try it: ride a vesicle across") +
            canvasFor(680, 320, "A cell layer between blood on the left and brain on the right. A drug on its own bounces off the cell. A drug attached to an antibody that binds a receptor, such as the transferrin receptor, is wrapped in a vesicle, carried across and released on the brain side.") +
            '<div class="fd-stat-row">' + stat("Delivered to the brain side", "d") + stat("Time elapsed", "t") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Drug", "cargo", [["alone", "Drug on its own"], ["shuttle", "Drug + antibody shuttle"]]) +
            '<p class="fd-sim-formula">Receptors such as the transferrin receptor and the insulin receptor bind their cargo. The cell wraps it in a vesicle, carries it across, and releases it on the brain side: receptor-mediated transcytosis. Drug designers attach a drug to an antibody or ligand that binds one of these receptors, turning a barrier route into a delivery route.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function spawn() {

            return { x: 40, y: 60 + rand() * 200, ph: 0, t: 0, vy: (rand() - 0.5) * 30 };
        }

        function update() {

            seen[state.cargo] = true;
            out(root, "d", delivered);
            out(root, "t", Math.round(t) + " s");
            out(root, "verdict", state.cargo === "alone" ? "The drug alone cannot cross: nothing carries it" : "The shuttle binds a receptor and the vesicle carries the drug across");

            if (seen.alone && seen.shuttle && delivered >= 4) {
                F.reward("bbb-rmt", 10, "You turned a barrier route into a delivery route");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            ctx.fillStyle = RED + ".1)";
            ctx.fillRect(0, 0, 200, 320);
            ctx.fillStyle = BLUE + ".07)";
            ctx.fillRect(480, 0, 200, 320);
            ctx.fillStyle = TEAL + ".4)";
            ctx.fillRect(200, 0, 280, 320);
            txt(ctx, "blood", 100, 24, 14, RED + "1)", "center", true);
            txt(ctx, "brain", 580, 24, 14, TEXT + ".85)", "center", true);
            txt(ctx, "endothelial cell", 340, 24, 14, "rgba(6,10,24,.9)", "center", true);

            // receptors on the blood-facing membrane
            for (let i = 0; i < 6; i++) {

                const y = 60 + i * 42;

                ctx.strokeStyle = GOLD + ".95)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(200, y); ctx.lineTo(188, y - 8);
                ctx.moveTo(200, y); ctx.lineTo(188, y + 8);
                ctx.stroke();
            }

            txt(ctx, "receptors", 168, 306, 11, GOLD + "1)");

            agents.forEach(function (a) {

                const shuttle = state.cargo === "shuttle";

                if (a.ph === 2) {

                    // inside a vesicle
                    ctx.strokeStyle = TEXT + ".85)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(a.x, a.y, 15, 0, Math.PI * 2);
                    ctx.stroke();
                }

                dot(ctx, a.x, a.y, 7, ROSE + ".95)");

                if (shuttle) {

                    ctx.strokeStyle = BLUE + ".95)";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(a.x - 7, a.y); ctx.lineTo(a.x - 17, a.y - 7);
                    ctx.moveTo(a.x - 7, a.y); ctx.lineTo(a.x - 17, a.y + 7);
                    ctx.stroke();
                }
            });
        }

        animate(root, function (dt) {

            t += dt;

            if (rand() < 0.03 && agents.length < 8) { agents.push(spawn()); }

            const shuttle = state.cargo === "shuttle";

            agents.forEach(function (a) {

                if (a.ph === 0) {

                    a.x += 55 * dt;
                    a.y += a.vy * dt;

                    if (a.x > 178) {

                        if (shuttle) { a.ph = 1; a.t = 0; } else { a.ph = 3; a.vy = -a.vy; }
                    }

                } else if (a.ph === 1) {

                    a.t += dt;
                    a.x = 200 + a.t * 20;

                    if (a.t > 0.8) { a.ph = 2; }

                } else if (a.ph === 2) {

                    a.x += 70 * dt;

                    if (a.x > 478) {

                        a.ph = 4;
                        delivered++;
                        update();
                    }

                } else if (a.ph === 3) {

                    a.x -= 70 * dt;

                    if (a.x < 20) { a.dead = true; }

                } else if (a.ph === 4) {

                    a.x += 40 * dt;

                    if (a.x > 660) { a.dead = true; }
                }
            });

            agents = agents.filter(function (a) { return !a.dead; });

            draw();
        });

        wire(root, state, defaults, function () {

            agents = [];
            delivered = 0;
            t = 0;
            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["bbb-efflux"] = function (root) {

        const defaults = { pump: 60 };
        const state = { pump: 60 };
        const rand = mulberry(Date.now() % 9999);
        let mols = [];
        let spawned = 0;
        let reached = 0;
        let ejected = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: a small, oily drug meets a pump") +
            canvasFor(680, 320, "A small oily drug diffusing from the blood on the left into an endothelial cell. Efflux pumps on the blood-facing side use ATP to throw drug molecules back into the blood, so fewer reach the brain on the right.") +
            '<div class="fd-stat-row">' + stat("Molecules sent in", "n") + stat("Thrown back out by pumps", "e") + stat("Reached the brain", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-inhibit>🚫 Block the pumps</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Efflux pump activity (P-gp, BCRP)", key: "pump", min: 0, max: 100, step: 5, value: 60 }) +
            "</div>" +
            '<p class="fd-sim-formula">Efflux pumps such as P-glycoprotein sit on the blood-facing side of the endothelial cell. They use ATP to push many drug molecules back into the blood even after the drug has entered the cell. A drug can be small and oily and still fail because a pump ejects it.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            setVal(root, "pump", state.pump + " %");
            out(root, "n", spawned);
            out(root, "e", ejected);
            out(root, "r", reached + (spawned ? "  (" + Math.round(reached / spawned * 100) + " %)" : ""));
            out(root, "verdict", state.pump >= 70 ? "Strong pumps: most of the drug is thrown back" : state.pump <= 10 ? "Pumps blocked: the drug gets through" : "Some of the drug is pumped out");

            if (!hit && spawned > 30 && state.pump === 0 && reached / spawned > 0.5) {

                hit = true;
                F.reward("bbb-efflux", 10, "You saw how blocking pumps raises brain uptake");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            ctx.fillStyle = RED + ".1)";
            ctx.fillRect(0, 0, 180, 320);
            ctx.fillStyle = BLUE + ".07)";
            ctx.fillRect(500, 0, 180, 320);
            ctx.fillStyle = TEAL + ".35)";
            ctx.fillRect(180, 0, 320, 320);
            txt(ctx, "blood", 90, 24, 14, RED + "1)", "center", true);
            txt(ctx, "brain", 590, 24, 14, TEXT + ".85)", "center", true);
            txt(ctx, "endothelial cell", 340, 24, 13, "rgba(6,10,24,.9)", "center", true);

            // pumps on the blood-facing membrane
            for (let i = 0; i < 5; i++) {

                const y = 60 + i * 55;
                const on = state.pump / 100;

                ctx.fillStyle = (on > 0 ? GOLD : GREY) + (0.25 + 0.7 * on) + ")";
                ctx.fillRect(180, y, 22, 36);
                txt(ctx, "P-gp", 170, y + 22, 10, TEXT + ".7)", "end");
            }

            mols.forEach(function (m) { dot(ctx, m.x, m.y, 5, ROSE + ".95)"); });
        }

        animate(root, function (dt) {

            if (rand() < 0.08) {

                mols.push({ x: 20, y: 40 + rand() * 250, in: false });
                spawned++;
            }

            mols.forEach(function (m) {

                const vx = m.in ? 40 : 50;

                m.x += (vx + (rand() - 0.5) * 60) * dt * (m.back ? -1.4 : 1);
                m.y += (rand() - 0.5) * 80 * dt;
                m.y = clamp(m.y, 40, 300);

                if (!m.in && m.x > 190) { m.in = true; }

                // pump zone just inside the blood-facing membrane
                if (m.in && !m.back && m.x > 190 && m.x < 240 && rand() < state.pump / 100 * 0.06) {

                    m.back = true;
                    ejected++;
                    update();
                }

                if (m.back && m.x < 160) { m.dead = true; }

                if (m.x > 500 && !m.back && !m.counted) {

                    m.counted = true;
                    reached++;
                    m.dead = true;
                    update();
                }
            });

            mols = mols.filter(function (m) { return !m.dead && m.x < 700; });

            draw();
        });

        root.querySelector("[data-inhibit]").addEventListener("click", function () {

            state.pump = 0;
            root.querySelector('input[data-key="pump"]').value = 0;
            update();
        });

        wire(root, state, defaults, function () {

            mols = [];
            spawned = 0;
            reached = 0;
            ejected = 0;
            update();
        });

        update();
        draw();
    };


    SIMS["bbb-whichroute"] = quiz(
        "Game: what is this drug's fate?",
        ["Crosses by diffusion", "Borrows a carrier", "Rides a receptor vesicle", "Pumped back out", "Blocked at the gap"],
        [
            { q: "Small, oily, with few hydrogen bonds.", a: "Crosses by diffusion", why: "It dissolves through the cell membrane." },
            { q: "It looks like an amino acid and fits LAT1.", a: "Borrows a carrier", why: "A drug that looks like a nutrient borrows its door." },
            { q: "A large antibody carrying a transferrin-receptor binding arm.", a: "Rides a receptor vesicle", why: "Receptor-mediated transcytosis." },
            { q: "Small and oily, but P-gp recognizes it.", a: "Pumped back out", why: "Even a drug that enters the cell can be ejected." },
            { q: "Polar and too big to diffuse, and it tries to slip between cells.", a: "Blocked at the gap", why: "Tight junctions shut the gap." },
            { q: "A plain antibody with no shuttle.", a: "Blocked at the gap", why: "Nearly all plain antibodies are blocked." }
        ],
        5,
        "bbb-whichroute-done",
        "You can predict a drug's fate",
        "To reach the brain, a drug has to get past all of the controls.",
        "Check size, oiliness, resemblance to a nutrient, and pump recognition. Hit Reset to try again."
    );


    /* ======================================
       UNIT 5: THE DRUG DELIVERY PROBLEM
    ====================================== */

    SIMS["bbb-crossorblocked"] = quiz(
        "Game: crosses or blocked?",
        ["Crosses in useful amounts", "Blocked"],
        [
            { q: "A small, oily epilepsy drug.", a: "Crosses in useful amounts", why: "A few small, oily drugs do cross." },
            { q: "A plain antibody drug.", a: "Blocked", why: "Nearly all antibodies are blocked." },
            { q: "A gene therapy.", a: "Blocked", why: "Large molecules are blocked." },
            { q: "A small, oily antidepressant.", a: "Crosses in useful amounts", why: "Many drugs for depression cross." },
            { q: "A typical large protein drug.", a: "Blocked", why: "Proteins are too big and polar." },
            { q: "Most small-molecule drugs, taken together.", a: "Blocked", why: "It is often quoted that more than 98 % fail to cross in useful amounts." }
        ],
        5,
        "bbb-crossorblocked-done",
        "You know who gets in",
        "Crossing the barrier is the exception, not the rule.",
        "Small and oily gets in; big or watery does not. Hit Reset to try again."
    );


    SIMS["bbb-sizeline"] = function (root) {

        const defaults = { lm: 2.3 };
        const state = { lm: 2.3 };
        const marks = [
            { n: "caffeine", mw: 194 },
            { n: "a small oily drug", mw: 300 },
            { n: "a chemo drug", mw: 544 },
            { n: "insulin", mw: 5808 },
            { n: "an antibody", mw: 150000 }
        ];
        const seen = {};

        root.innerHTML =
            head("Try it: slide along the size limit") +
            canvasFor(680, 300, "A curve of the chance of passive crossing against molecular weight on a log axis. The curve falls steeply around 400 to 500 daltons. Markers show where some well-known molecules sit.") +
            '<div class="fd-stat-row">' + stat("Molecular weight", "mw") + stat("Chance to diffuse across", "p") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Molecular weight (log scale)", key: "lm", min: 1.5, max: 5.5, step: 0.05, value: 2.3 }) +
            "</div>" +
            '<p class="fd-sim-formula">Passive diffusion works best below roughly 400 to 500 daltons. Many modern drugs, and every antibody, are far larger. Biology\'s favorite drug targets are often on the wrong side of the line. (Curve illustrative; sizes approximate.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function p(mw) { return 1 / (1 + Math.pow(mw / 450, 5)); }

        function update() {

            const mw = Math.pow(10, state.lm);
            const pr = p(mw);

            seen[pr > 0.6 ? "hi" : pr < 0.1 ? "lo" : "mid"] = true;
            setVal(root, "lm", Math.round(mw).toLocaleString() + " Da");
            out(root, "mw", Math.round(mw).toLocaleString() + " Da");
            out(root, "p", pr > 0.6 ? "good" : pr > 0.15 ? "poor" : "almost none");
            out(root, "verdict", pr > 0.6 ? "Small enough to diffuse" : pr > 0.15 ? "Right at the size limit" : "Too big: needs a shuttle or another way in");

            if (seen.hi && seen.mid && seen.lo) {
                F.reward("bbb-sizeline", 10, "You crossed the size line");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 240;
            const X = function (lm) { return L + (lm - 1.5) / 4 * (R - L); };
            const Y = function (v) { return B - v * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [2, 3, 4, 5].forEach(function (e) { txt(ctx, Math.pow(10, e).toLocaleString(), X(e), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "molecular weight (daltons, log scale) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "chance to cross ↑", L + 60, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = GOLD + ".7)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(X(Math.log10(450)), T); ctx.lineTo(X(Math.log10(450)), B);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "about 450 Da", X(Math.log10(450)) + 8, T + 14, 12, GOLD + "1)", "start");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let lm = 1.5; lm <= 5.5; lm += 0.05) {

                const y = Y(p(Math.pow(10, lm)));

                if (lm === 1.5) { ctx.moveTo(X(lm), y); } else { ctx.lineTo(X(lm), y); }
            }

            ctx.stroke();

            marks.forEach(function (m, i) {

                const x = X(Math.log10(m.mw));

                dot(ctx, x, Y(p(m.mw)), 5, ROSE + ".95)");
                txt(ctx, m.n, x, i % 2 ? Y(p(m.mw)) - 12 : Y(p(m.mw)) - 12, 11, TEXT + ".8)");
            });

            dot(ctx, X(state.lm), Y(p(Math.pow(10, state.lm))), 9, "rgba(255,255,255,1)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["bbb-affected"] = quiz(
        "Game: which condition?",
        ["Brain tumors", "Alzheimer's disease", "Brain infections"],
        [
            { q: "Chemotherapy often struggles to reach tumor cells behind an intact barrier.", a: "Brain tumors", why: "The barrier protects tumor cells too." },
            { q: "Only a small fraction of an injected antibody reaches the brain, often under 1 %.", a: "Alzheimer's disease", why: "Antibodies barely cross." },
            { q: "Some antibiotics and antivirals enter the brain poorly.", a: "Brain infections", why: "Germ-killing drugs are blocked too." },
            { q: "The more precise the drug, the more it needs…", a: "Alzheimer's disease", why: "…a way across the barrier." }
        ],
        4,
        "bbb-affected-done",
        "You know who is affected",
        "The more precise the drug, the more it needs a way across.",
        "Tumors, Alzheimer's, infections. Hit Reset to try again."
    );


    SIMS["bbb-failearly"] = function (root) {

        const defaults = { s: 1 };
        const state = { s: 1 };
        const stages = [
            { n: "Binds its target in a dish", c: 1 },
            { n: "Works in cells", c: 3 },
            { n: "Animal studies", c: 12 },
            { n: "Human trials", c: 100 }
        ];
        let hit = false;

        root.innerHTML =
            head("Try it: when do you find out it never reaches the brain?") +
            art("0 0 340 210", "Four stages of drug development with their relative cost. A bar shows how much has already been spent when a failure to cross the barrier is discovered at the stage you choose.") +
            '<div class="fd-stat-row">' + stat("You test crossing at", "st") + stat("Spent before you find out (relative)", "sp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Stage where barrier crossing is first tested", key: "s", min: 1, max: 4, step: 1, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">A compound can bind its target perfectly in a lab test and still fail because it never reaches the brain. Learning that late wastes years and money, so early tests of barrier crossing are valuable. (Relative costs are illustrative.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const spent = stages.slice(0, state.s - 1).reduce(function (a, s) { return a + s.c; }, 0) + stages[state.s - 1].c * 0.2;

            setVal(root, "s", stages[state.s - 1].n.toLowerCase());
            out(root, "st", stages[state.s - 1].n);
            out(root, "sp", spent.toFixed(1) + " units");
            out(root, "verdict", state.s <= 2 ? "Found out early: cheap to drop the compound" : state.s === 3 ? "Found out in animals: a lot already spent" : "Found out in people: the most expensive way to learn");

            let s = "";
            const total = stages.reduce(function (a, st) { return a + st.c; }, 0);
            let x = 14;

            stages.forEach(function (st, i) {

                const w = Math.max(24, 300 * st.c / total);
                const spentHere = i < state.s - 1;

                s += rect(x, 40, w - 4, 40, spentHere ? "rgba(255,105,120,.8)" : i === state.s - 1 ? "rgba(255,214,102,.8)" : "rgba(170,179,207,.25)");
                s += label(x + 2, 100 + (i % 2) * 14, st.n, 6.5, "start", "var(--text)");
                x += w;
            });

            s += label(14, 24, "development stages (width = relative cost)", 7, "start", "var(--muted)");
            s += label(14, 160, "red: already spent    gold: the stage where you find out", 7, "start", "var(--muted)");

            svg.innerHTML = s;

            if (!hit && state.s === 1) { hit = true; F.reward("bbb-failearly", 10, "You tested barrier crossing early"); }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["bbb-ways"] = quiz(
        "Game: a way around the barrier",
        ["Shuttles", "Open briefly", "Bypass", "Redesign"],
        [
            { q: "Attach the drug to something that binds a transport receptor and rides across.", a: "Shuttles", why: "Use the cell's own delivery route." },
            { q: "Focused ultrasound with microbubbles loosens the barrier for a short time.", a: "Open briefly", why: "A temporary opening." },
            { q: "Inject directly into the brain or the fluid around it.", a: "Bypass", why: "Skip the barrier." },
            { q: "Make the drug smaller or more fat-soluble.", a: "Redesign", why: "Change the molecule to fit the rules." }
        ],
        4,
        "bbb-ways-done",
        "You know the four strategies",
        "Every strategy needs a way to measure whether it actually worked.",
        "Shuttle, open, bypass, redesign. Hit Reset to try again."
    );


    // Parts 2 and 3 of the blood-brain barrier simulators.
    [
        ["fabBbbScriptB", "diagram-sims-bbb-b.js"],
        ["fabBbbScriptC", "diagram-sims-bbb-c.js"]
    ].concat(document.querySelector('.fd-sim[data-sim^="bbb-3d-"]') ? [["fabBbb3dScript", "diagram-sims-bbb-3d.js"]] : []).forEach(function (f) {

        if (document.getElementById(f[0])) {
            return;
        }

        const more = document.createElement("script");

        more.id = f[0];
        more.src = f[1];

        document.head.appendChild(more);
    });

    document.querySelectorAll('.fd-sim[data-sim^="bbb-"]').forEach(F.mount);

})();
