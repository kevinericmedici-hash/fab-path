/* ========================================
   SUPERCAPACITORS: INTERACTIVE SIMULATORS, PART 2

   Unit 9: the electrode wish list, material families game.
   Unit 10: oxides and polymers, the swelling problem.
   Unit 11: pores and ions, the carbon family game.
   Unit 12: pyrolysis of SU-8, glassy carbon properties game.
   Unit 13: form factors, the jelly roll, series and parallel.
   Unit 14: sandwich versus in-plane.

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
    const bindPause = M.bindPause;
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


    /* ======================================
       UNIT 9: THE ELECTRODE WISH LIST
    ====================================== */

    SIMS["supercap-wishlist"] = function (root) {

        const props = [
            { k: "cap", n: "High capacitance" },
            { k: "cond", n: "Conductivity" },
            { k: "area", n: "Surface area" },
            { k: "stab", n: "Chemical stability" },
            { k: "dur", n: "Mechanical durability" },
            { k: "cost", n: "Low cost" }
        ];

        const fam = [
            { n: "Metal oxides", c: TEAL, r: { cap: 5, cond: 2, area: 3, stab: 2, dur: 2, cost: 2 } },
            { n: "Conducting polymers", c: GOLD, r: { cap: 4, cond: 3, area: 3, stab: 2, dur: 1, cost: 4 } },
            { n: "Carbon", c: BLUE, r: { cap: 2, cond: 4, area: 5, stab: 5, dur: 4, cost: 4 } }
        ];

        const defaults = { cap: 1, cond: 1, area: 1, stab: 1, dur: 1, cost: 1 };
        const state = Object.assign({}, defaults);
        const winners = {};

        root.innerHTML =
            head("Try it: what matters most for your device?") +
            art("0 0 340 190", "Three bars showing how well metal oxides, conducting polymers and carbon score once you set how much each property matters to you.") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<p class="fd-sim-note" data-out="why"></p>' +
            '<div class="fd-sim-controls">' +
            props.map(function (p) { return slider({ label: p.n + " matters", key: p.k, min: 0, max: 3, step: 1, value: 1 }); }).join("") +
            "</div>" +
            '<p class="fd-sim-formula">Ratings are rough and relative (1 to 5), based on the trends in this unit. No material maximizes all of them: picking one means choosing what to sacrifice.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const labels = ["not at all", "a little", "quite a lot", "essential"];

            props.forEach(function (p) { setVal(root, p.k, labels[state[p.k]]); });

            const total = props.reduce(function (a, p) { return a + state[p.k]; }, 0);
            const scores = fam.map(function (f) {

                return total ? props.reduce(function (a, p) { return a + state[p.k] * f.r[p.k]; }, 0) / (total * 5) : 0;
            });

            let best = 0;

            scores.forEach(function (s, i) { if (s > scores[best]) { best = i; } });

            let s = "";

            fam.forEach(function (f, i) {

                const y = 30 + i * 50;

                s += label(14, y + 4, f.n, 8.5, "start", "var(--text)");
                s += rect(14, y + 10, 230, 16, "rgba(170,179,207,.2)");
                s += rect(14, y + 10, 230 * scores[i], 16, f.c + (i === best && total ? ".95)" : ".45)"));
                s += label(250, y + 22, Math.round(scores[i] * 100) + "%", 9, "start", "var(--text)");
            });

            s += label(14, 14, "How well each family fits your priorities", 8, "start", "var(--muted)");

            svg.innerHTML = s;

            if (!total) {

                out(root, "verdict", "Raise a priority above");
                out(root, "why", "Slide at least one property up to see which material family fits.");

                return;
            }

            const weak = props.filter(function (p) { return fam[best].r[p.k] <= 2 && state[p.k] > 0; });

            out(root, "verdict", fam[best].n + " fits best");
            out(root, "why", weak.length ? "But it is weak on: " + weak.map(function (p) { return p.n.toLowerCase(); }).join(", ") + "." : "And it does not give up anything you asked for.");

            winners[best] = true;

            if (Object.keys(winners).length >= 3) {
                F.reward("supercap-wishlist", 10, "You found a priority set for every material family");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["supercap-families"] = quiz(
        "Game: which material family?",
        ["Metal oxide", "Conducting polymer", "Carbon"],
        [
            { q: "Stores charge mainly as an electric double layer.", a: "Carbon", why: "Carbon is the workhorse of double-layer storage." },
            { q: "Stores charge through fast, reversible redox reactions.", a: "Metal oxide", why: "Oxides are pseudocapacitive." },
            { q: "Stores charge through reversible doping and dedoping.", a: "Conducting polymer", why: "Doping and dedoping is the polymer's redox." },
            { q: "Ruthenium oxide, the high-performance benchmark.", a: "Metal oxide", why: "Excellent conductivity and capacitance, but costly and scarce." },
            { q: "Polyaniline, polypyrrole and PEDOT.", a: "Conducting polymer", why: "Those are the three classic conducting polymers." },
            { q: "Activated carbon, graphene and nanotubes.", a: "Carbon", why: "All carbon nanostructures." },
            { q: "Swells and shrinks as it charges, so it cracks over time.", a: "Conducting polymer", why: "Volume change limits its cycle life." },
            { q: "Manganese oxide, nickel oxide and cobalt oxide.", a: "Metal oxide", why: "Cheaper oxides, but with lower conductivity." }
        ],
        6,
        "supercap-families-done",
        "You can tell the material families apart",
        "Oxides, polymers and carbon: you know which is which.",
        "Oxides and polymers do redox; carbon does the double layer. Hit Reset to try again."
    );


    /* ======================================
       UNIT 10: THE SWELLING PROBLEM
    ====================================== */

    SIMS["supercap-swell"] = function (root) {

        const defaults = { mat: "poly" };
        const state = { mat: "poly" };
        const tried = {};

        root.innerHTML =
            head("Try it: cycle a polymer electrode, again and again") +
            canvasFor(root, 680, 320, "An electrode film on a current collector that swells and shrinks with every charge and discharge. A polymer film slowly cracks, a polymer mixed with carbon cracks far more slowly, and a plain carbon film barely changes.") +
            '<div class="fd-stat-row">' + stat("Cycles so far", "n") + stat("Capacity left", "ret") + stat("Cracks", "cr") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrode", "mat", [["poly", "Polymer alone"], ["comp", "Polymer + carbon"], ["carbon", "Carbon"]]) +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-ff="1000">⏩ Fast-forward 1,000 cycles</button><button type="button" class="fd-sim-btn" data-ff="5000">⏩ 5,000 cycles</button></div>' +
            '<p class="fd-sim-formula">Illustrative numbers: the polymer\'s volume change wears it out in thousands of cycles; carbon is hardly changed after a million.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(5);
        const crackSeed = [];

        for (let i = 0; i < 16; i++) { crackSeed.push([rand(), rand(), rand()]); }

        let cycles = 0;
        let t = 0;

        function tau() { return state.mat === "poly" ? 1800 : state.mat === "comp" ? 9000 : 5e6; }

        function ret() { return Math.exp(-cycles / tau()); }

        function draw() {

            clear(ctx, 680, 320);

            const r = ret();
            const swell = state.mat === "carbon" ? 0.015 : state.mat === "comp" ? 0.08 : 0.2;
            const f = 1 + swell * Math.sin(t * 3.2);
            const w = 420;
            const h = 90 * f;
            const x0 = 130;
            const base = 250;

            // current collector
            ctx.fillStyle = GREY + ".8)";
            ctx.fillRect(x0 - 20, base, w + 40, 14);
            txt(ctx, "current collector", 340, base + 34, 13, TEXT + ".8)");

            // film
            const col = state.mat === "poly" ? GOLD : state.mat === "comp" ? TEAL : BLUE;

            ctx.fillStyle = col + (0.35 + 0.4 * r) + ")";
            ctx.fillRect(x0, base - h, w, h);
            ctx.strokeStyle = col + "1)";
            ctx.lineWidth = 2;
            ctx.strokeRect(x0, base - h, w, h);

            // filler texture
            if (state.mat === "comp") {

                for (let i = 0; i < 30; i++) {
                    dot(ctx, x0 + 20 + ((i * 53) % (w - 40)), base - 12 - ((i * 29) % Math.max(10, h - 24)), 4, BLUE + ".7)");
                }
            }

            // cracks
            const n = Math.floor((1 - r) * 14);

            ctx.strokeStyle = "rgba(6,10,24,.95)";
            ctx.lineWidth = 2.2;

            for (let i = 0; i < n; i++) {

                const s = crackSeed[i];
                const x = x0 + 14 + s[0] * (w - 28);
                const len = 20 + s[1] * (h - 24);

                ctx.beginPath();
                ctx.moveTo(x, base - h);
                ctx.lineTo(x + (s[2] - 0.5) * 16, base - h + len * 0.5);
                ctx.lineTo(x + (s[2] - 0.5) * 6, base - h + len);
                ctx.stroke();
            }

            // ghost outline of the original height
            ctx.setLineDash([6, 5]);
            ctx.strokeStyle = TEXT + ".35)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x0, base - 90, w, 90);
            ctx.setLineDash([]);

            txt(ctx, "dashed line: the original thickness", 340, 36, 13, TEXT + ".65)");
            txt(ctx, f > 1.01 ? "swelling ↑" : f < 0.99 ? "shrinking ↓" : "steady", 340, 62, 15, GOLD + "1)", "center", true);

            out(root, "n", cycles.toLocaleString());
            out(root, "ret", Math.round(r * 100) + " %");
            out(root, "cr", n);
            out(root, "verdict", state.mat === "poly" ? (r < 0.5 ? "The film is cracking and losing capacity" : "Breathing in and out with every cycle") :
                state.mat === "comp" ? "Carbon holds the polymer together: it lasts much longer" :
                    "Carbon barely changes: that is why it lasts so many cycles");
        }

        animate(root, function (dt) {

            t += dt;
            cycles += Math.round(dt * 60);

            draw();
        });

        root.querySelectorAll("[data-ff]").forEach(function (b) {

            b.addEventListener("click", function () {

                cycles += parseInt(b.dataset.ff, 10);

                tried[state.mat] = true;

                if (tried.poly && tried.comp && tried.carbon) {
                    F.reward("supercap-swell", 10, "You compared polymer, composite and carbon cycling");
                }

                draw();
            });
        });

        wire(root, state, defaults, function () {

            cycles = 0;
            draw();
        });

        draw();
    };


    SIMS["supercap-pseudomat"] = quiz(
        "Game: oxide or polymer?",
        ["RuO₂", "Cheaper oxides", "Conducting polymers"],
        [
            { q: "Excellent conductivity and capacitance, but costly and scarce.", a: "RuO₂", why: "Hard to beat on performance, hard to afford." },
            { q: "MnO₂, NiO and Co₃O₄ with generally lower conductivity.", a: "Cheaper oxides", why: "Often mixed with conductive additives." },
            { q: "Flexible, low density and low cost, but they swell and crack.", a: "Conducting polymers", why: "Volume change shortens their cycle life." },
            { q: "The benchmark pseudocapacitive material.", a: "RuO₂", why: "It is the standard others are measured against." },
            { q: "Often paired with carbon for better stability.", a: "Conducting polymers", why: "Carbon helps hold the polymer together and carry charge." },
            { q: "Repeated redox reactions can degrade the structure.", a: "Cheaper oxides", why: "Durability is the main limit." },
            { q: "Environmental concerns keep this one from widespread use.", a: "RuO₂", why: "Cost, scarcity and environmental concerns." },
            { q: "Attractive for flexible electronics and wearables.", a: "Conducting polymers", why: "They are flexible and easy to fabricate." }
        ],
        6,
        "supercap-pseudomat-done",
        "You know your pseudocapacitive materials",
        "Oxides give capacitance, polymers give flexibility, and each has a catch.",
        "RuO₂ is excellent but pricey; other oxides are cheaper but less conductive; polymers are flexible but swell. Hit Reset to try again."
    );


    /* ======================================
       UNIT 11: PORES AND IONS
    ====================================== */

    SIMS["supercap-pores"] = function (root) {

        const defaults = { w: 1.6 };
        const state = { w: 1.6 };
        const ION = 0.7; // nm, illustrative
        const SC = 40; // px per nm

        root.innerHTML =
            head("Try it: how wide should the pores be?") +
            canvasFor(root, 680, 340, "A carbon surface full of narrow pores with ions in the liquid above. Pores narrower than the ions block them, so their surface is wasted; wider pores let the ions in but there is less surface.") +
            '<div class="fd-stat-row">' + stat("Total pore surface", "tot") + stat("Surface ions can reach", "use") + stat("How easily ions move in", "ease") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Pore width", key: "w", min: 0.4, max: 4, step: 0.1, value: 1.6 }) +
            "</div>" +
            '<p class="fd-sim-formula">Ions here are drawn at 0.7 nm across (illustrative). Tiny pores mean lots of surface, but if the ions cannot fit, that surface is unused.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(77);

        const PY = 168;
        const DEPTH = 150;

        let ions = [];
        let t = 0;
        let hit = false;

        function pores() {

            const wpx = state.w * SC;
            const pitch = wpx + 20;
            const n = Math.max(2, Math.floor(600 / pitch));
            const total = n * pitch;
            const x0 = 340 - total / 2 + 10;
            const list = [];

            for (let i = 0; i < n; i++) { list.push({ x: x0 + i * pitch, w: wpx, fill: 0 }); }

            return list;
        }

        let pl = pores();

        function spawnIons() {

            ions = [];

            for (let i = 0; i < 26; i++) {
                ions.push({ x: 60 + rand() * 560, y: 30 + rand() * 90, vx: (rand() - 0.5) * 30, vy: 10 + rand() * 20, in: -1 });
            }

            pl = pores();
            pl.forEach(function (p) { p.fill = 0; });
        }

        function metrics() {

            const w = state.w;
            const area = 1 / w;
            const access = clamp((w - ION) / (ION * 0.9), 0, 1);

            return { area: area, access: access, use: area * access };
        }

        function update() {

            const m = metrics();
            const best = (function () {

                let b = 0;

                for (let w = 0.4; w <= 4; w += 0.1) {

                    const a = (1 / w) * clamp((w - ION) / (ION * 0.9), 0, 1);

                    if (a > b) { b = a; }
                }

                return b;
            })();

            setVal(root, "w", state.w.toFixed(1) + " nm");
            out(root, "tot", Math.round(m.area / (1 / 0.4) * 100) + " %");
            out(root, "use", Math.round(m.use / best * 100) + " % of the best");
            out(root, "ease", m.access <= 0 ? "blocked" : m.access < 0.6 ? "slow, squeezing in" : m.access < 1 ? "getting easier" : "freely");
            out(root, "verdict", state.w < ION ? "Too narrow: ions cannot enter, so the surface is wasted" :
                state.w < 1.5 * ION ? "Near the sweet spot: lots of surface the ions can still reach" :
                    state.w < 2.5 ? "Ions flow freely, but the surface area is shrinking" : "Wide open: easy for ions, but much less surface");

            if (m.use / best > 0.85 && state.w > ION) {

                hit = true;
                F.reward("supercap-pores", 10, "You found the sweet spot for pore width");
            }

            spawnIons();
        }

        function draw() {

            clear(ctx, 680, 340);

            // electrolyte, carbon
            ctx.fillStyle = BLUE + ".07)";
            ctx.fillRect(20, 10, 640, PY - 10);

            ctx.fillStyle = GREY + ".5)";
            ctx.beginPath();
            ctx.rect(20, PY, 640, DEPTH + 20);
            ctx.fill();

            // pores
            ctx.fillStyle = "rgba(14,22,48,1)";

            pl.forEach(function (p) { ctx.fillRect(p.x, PY, p.w, DEPTH); });

            // tiny pores are marked
            if (state.w < ION) {
                txt(ctx, "ions are wider than the pores", 340, PY + DEPTH / 2 + 4, 15, ROSE + "1)", "center", true);
            }

            const r = ION * SC / 2;

            ions.forEach(function (ion) {
                dot(ctx, ion.x, ion.y, r, ROSE + ".95)");
            });

            txt(ctx, "electrolyte", 90, 28, 13, TEXT + ".7)");
            txt(ctx, "porous carbon", 100, PY + DEPTH + 14, 13, TEXT + ".85)");
        }

        animate(root, function (dt) {

            t += dt;

            const m = metrics();
            let allDone = true;

            ions.forEach(function (ion) {

                if (ion.in >= 0) {

                    const p = pl[ion.in];

                    ion.y = Math.min(ion.y + 45 * dt * clamp(m.access, 0.2, 1), PY + DEPTH - 14 - p.fill * 28);

                    if (ion.y >= PY + DEPTH - 14 - p.fill * 28 - 0.5 && !ion.settled) {

                        ion.settled = true;
                        p.fill++;
                    }

                    return;
                }

                allDone = false;

                ion.vx += (rand() - 0.5) * 120 * dt;
                ion.vx = clamp(ion.vx, -30, 30);
                ion.x += ion.vx * dt;
                ion.y += (ion.vy + 6) * dt;

                if (ion.x < 30) { ion.x = 30; ion.vx = Math.abs(ion.vx); }
                if (ion.x > 650) { ion.x = 650; ion.vx = -Math.abs(ion.vx); }

                const rr = ION * SC / 2;

                if (ion.y > PY - rr) {

                    // is the ion above a pore it fits into?
                    const slot = pl.findIndex(function (p, idx) {

                        return ion.x - rr >= p.x - 1 && ion.x + rr <= p.x + p.w + 1 && p.fill < 5;
                    });

                    if (slot >= 0 && state.w >= ION) {

                        ion.in = slot;
                        ion.x = pl[slot].x + pl[slot].w / 2;
                        ion.settled = false;

                    } else {

                        ion.y = PY - rr;
                        ion.vy = -Math.abs(ion.vy) * 0.5 - 8;
                    }
                }

                if (ion.y < 20) { ion.y = 20; ion.vy = Math.abs(ion.vy); }
            });

            if (allDone || t > 14) {

                t = 0;
                spawnIons();
            }

            draw();
        });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    SIMS["supercap-carbons"] = quiz(
        "Game: name that carbon",
        ["Activated carbon", "Graphene", "Carbon nanotubes", "Aerogels, fibers and cloth", "Glassy carbon"],
        [
            { q: "1,000 to 3,000 m² per gram, made cheaply from coconut shells or wood.", a: "Activated carbon", why: "The commercial standard." },
            { q: "One atom thick; its sheets restack through van der Waals forces.", a: "Graphene", why: "Restacking shrinks the surface ions can reach." },
            { q: "Conductive highways that tend to bundle, and expensive to make.", a: "Carbon nanotubes", why: "Great 1D conductors with lower surface area." },
            { q: "Flexible and mechanically tough: attractive for wearables.", a: "Aerogels, fibers and cloth", why: "They combine porosity, flexibility and conductivity." },
            { q: "Can be patterned with standard photolithography.", a: "Glassy carbon", why: "It is baked from a patterned polymer." },
            { q: "Theoretical surface area of about 2,630 m² per gram.", a: "Graphene", why: "That number is for a fully exposed sheet." },
            { q: "Tiny pores can restrict ion transport at fast charging rates.", a: "Activated carbon", why: "Some of its surface goes unused." },
            { q: "Inert, hard, and biocompatible in physiological solutions.", a: "Glassy carbon", why: "Great for biological environments such as PBS." }
        ],
        6,
        "supercap-carbons-done",
        "You can name the carbons",
        "You know the carbon family and what each one trades away.",
        "Each carbon gives up something. Remember the catch for each. Hit Reset to try again."
    );


    /* ======================================
       UNIT 12: PYROLYSIS
    ====================================== */

    SIMS["supercap-pyrolysis"] = function (root) {

        const defaults = { T: 25 };
        const state = { T: 25 };
        const rand = mulberry(15);

        root.innerHTML =
            head("Try it: bake a polymer into glassy carbon") +
            canvasFor(root, 680, 320, "A tall pillar of SU-8 polymer on a wafer. As the temperature slider rises, hydrogen, oxygen and nitrogen leave as gas, the pillar shrinks evenly, and it turns from a clear polymer into dark glassy carbon.") +
            '<div class="fd-stat-row">' + stat("Temperature", "t") + stat("Stage", "stage") + stat("Size vs. before", "size") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-bake>🔥 Bake automatically</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Temperature (inert atmosphere)", key: "T", min: 25, max: 1000, step: 25, value: 25 }) +
            "</div>" +
            '<p class="fd-sim-formula">The shrinkage is the same in every direction (isotropic), so the shape is kept but smaller. The size change shown here is illustrative.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let gas = [];
        let auto = false;
        let reached = false;

        function prog() { return clamp((state.T - 250) / 650, 0, 1); }

        function update() {

            const p = prog();

            setVal(root, "T", state.T + " °C");
            out(root, "t", state.T + " °C");
            out(root, "stage", p <= 0 ? "polymer" : p < 0.35 ? "starting to break down" : p < 0.9 ? "gas leaving" : "glassy carbon");
            out(root, "size", Math.round((1 - 0.4 * p) * 100) + " %");
            out(root, "verdict", p <= 0 ? "Epoxy-based SU-8: carbon, hydrogen, oxygen, nitrogen" :
                p < 0.9 ? "Hydrogen, oxygen and nitrogen are driven off as gas" :
                    "Only a connected network of carbon atoms is left");

            if (p >= 0.95 && !reached) {

                reached = true;
                F.reward("supercap-pyrolysis", 10, "You baked SU-8 into glassy carbon");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const p = prog();
            const s = 1 - 0.4 * p;
            const base = 270;

            // wafer
            ctx.fillStyle = GREY + ".7)";
            ctx.fillRect(40, base, 600, 22);
            txt(ctx, "wafer", 90, base + 40, 13, TEXT + ".8)");

            // pillars (three of them)
            const xs = [190, 340, 490];

            xs.forEach(function (cx) {

                // ghost original
                ctx.setLineDash([5, 4]);
                ctx.strokeStyle = TEXT + ".35)";
                ctx.lineWidth = 1;
                ctx.strokeRect(cx - 40, base - 190, 80, 190);
                ctx.setLineDash([]);

                const w = 80 * s;
                const h = 190 * s;
                const r = Math.round(200 - 175 * p);
                const g = Math.round(205 - 175 * p);
                const b = Math.round(225 - 175 * p);

                ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ",.95)";
                ctx.fillRect(cx - w / 2, base - h, w, h);
                ctx.strokeStyle = TEXT + ".6)";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(cx - w / 2, base - h, w, h);

                if (p >= 0.9) {

                    ctx.strokeStyle = TEAL + ".8)";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(cx - w / 2, base - h, w, h);
                }
            });

            txt(ctx, "dashed: original size", 340, 20, 13, TEXT + ".65)");

            // gas
            gas.forEach(function (g) {

                dot(ctx, g.x, g.y, 5, g.col + clamp(g.life, 0, 0.9) + ")");
                txt(ctx, g.l, g.x, g.y + 3.5, 8, "rgba(6,10,24,.9)");
            });

            if (p > 0 && p < 0.95) {
                txt(ctx, "H, O, N leaving as gas ↑", 340, 44, 14, GOLD + "1)", "center", true);
            }
        }

        function burst(dt) {

            const p = prog();

            if (p <= 0 || p >= 0.97) { return; }

            const rate = 70 * dt * (0.3 + p);
            let count = rate;

            while (count > 0) {

                if (rand() < count) {

                    const cx = [190, 340, 490][Math.floor(rand() * 3)];
                    const kind = Math.floor(rand() * 3);

                    gas.push({
                        x: cx + (rand() - 0.5) * 60,
                        y: 270 - 190 * (1 - 0.4 * p) + rand() * 160 * (1 - 0.4 * p),
                        vx: (rand() - 0.5) * 20,
                        vy: -30 - rand() * 40,
                        life: 1,
                        l: ["H", "O", "N"][kind],
                        col: [BLUE, ROSE, GOLD][kind]
                    });
                }

                count -= 1;
            }
        }

        animate(root, function (dt) {

            if (auto) {

                state.T = Math.min(1000, state.T + dt * 140);

                root.querySelector('input[data-key="T"]').value = Math.round(state.T / 25) * 25;

                if (state.T >= 1000) { auto = false; }

                update();
            }

            burst(dt);

            gas.forEach(function (g) {

                g.x += g.vx * dt;
                g.y += g.vy * dt;
                g.life -= dt * 0.45;
            });

            gas = gas.filter(function (g) { return g.life > 0 && g.y > 30; });

            draw();
        });

        root.querySelector("[data-bake]").addEventListener("click", function () {

            state.T = 25;
            auto = true;
            reached = reached;
        });

        wire(root, state, defaults, function () {

            auto = false;
            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-gcprops"] = quiz(
        "Game: why glassy carbon?",
        ["Chemically inert", "Patternable", "Biocompatible", "Conductive enough"],
        [
            { q: "It resists acids and alkalis with minimal corrosion.", a: "Chemically inert", why: "A stable surface, even in harsh electrolytes." },
            { q: "It is made by baking SU-8 that was shaped by UV lithography.", a: "Patternable", why: "The shape of the photoresist becomes the shape of the electrode." },
            { q: "It shows minimal cytotoxicity and resists biofouling in PBS.", a: "Biocompatible", why: "Safe near tissue and body fluids." },
            { q: "It is lower than graphite but fine for fast electron transfer.", a: "Conductive enough", why: "Good enough for the job." },
            { q: "It shows slow hydrogen and oxygen evolution.", a: "Chemically inert", why: "That gives it a wide potential window." },
            { q: "It keeps its geometry after pyrolysis, apart from predictable shrinkage.", a: "Patternable", why: "The shape is reproducible, so designers can plan for it." }
        ],
        5,
        "supercap-gcprops-done",
        "You know why glassy carbon fits this device",
        "Inert, patternable, biocompatible and conductive enough: that is glassy carbon.",
        "Think about the four reasons: inert, patternable, biocompatible, conductive. Hit Reset to try again."
    );


    /* ======================================
       UNIT 13: FORM FACTORS
    ====================================== */

    SIMS["supercap-jellyroll"] = function (root) {

        const defaults = { turns: 8, tabs: "one" };
        const state = { turns: 8, tabs: "one" };

        root.innerHTML =
            head("Try it: roll up a huge electrode") +
            canvasFor(root, 680, 340, "A jelly roll cell seen end-on as a tight spiral of two electrode strips with a separator between, next to the same strip unrolled flat, with tabs marked on it.") +
            '<div class="fd-stat-row">' + stat("Roll diameter", "dia") + stat("Strip length when unrolled", "len") + stat("Longest path to a tab", "path") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Current collection", "tabs", [["one", "One tab"], ["many", "Many tabs"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Turns in the roll", key: "turns", min: 2, max: 14, step: 1, value: 8 }) +
            "</div>" +
            '<p class="fd-sim-formula">A big electrode area packed into a small can. With a single tab, current must run along the whole foil; extra tabs shorten that path.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const R0 = 16;
        const P = 9;
        let t = 0;

        function spiralLength(n) {

            let len = 0;

            for (let th = 0; th < n * 2 * Math.PI; th += 0.05) {
                len += (R0 + P * th / (2 * Math.PI)) * 0.05;
            }

            return len;
        }

        function update() {

            const L = spiralLength(state.turns);
            const dia = 2 * (R0 + P * state.turns);
            const k = state.tabs === "one" ? 1 : 5;
            const worst = k === 1 ? 1 : 1 / (2 * (k - 1));

            setVal(root, "turns", state.turns);
            out(root, "dia", Math.round(dia / 4) + " mm");
            out(root, "len", (L / 4 / 10).toFixed(1) + " cm of strip");
            out(root, "path", Math.round(worst * 100) + " % of the strip");
            out(root, "verdict", state.tabs === "one" ? "One tab: current runs the whole length, adding resistance" : "Many tabs: the current path is short, so the resistance is low");

            if (state.turns >= 12 && state.tabs === "many") {
                F.reward("supercap-jellyroll", 10, "You built a big, low-resistance jelly roll");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const cx = 170;
            const cy = 170;
            const n = state.turns;
            const steps = Math.floor(n * 2 * Math.PI / 0.04);

            function spiral(offset, col, lw) {

                ctx.strokeStyle = col;
                ctx.lineWidth = lw;
                ctx.lineCap = "round";
                ctx.beginPath();

                for (let i = 0; i <= steps; i++) {

                    const th = i * 0.04;
                    const r = R0 + offset + P * th / (2 * Math.PI);
                    const a = th + t * 0.25;
                    const x = cx + r * Math.cos(a);
                    const y = cy + r * Math.sin(a);

                    if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
                }

                ctx.stroke();
            }

            spiral(0, TEAL + ".95)", 3.2);
            spiral(P / 2, GOLD + ".95)", 3.2);
            spiral(P / 4, TEXT + ".35)", 1);
            spiral(P * 0.75, TEXT + ".35)", 1);

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, R0 + P * n + 12, 0, Math.PI * 2);
            ctx.stroke();
            txt(ctx, "metal can", cx, Math.min(334, cy + R0 + P * n + 34), 13, TEXT + ".8)");

            // unrolled strip
            const L = spiralLength(n);
            const sx = 380;
            const sw = 260;
            const sy = 150;
            const stripLen = clamp(L / 7100, 0.05, 1) * sw;

            ctx.fillStyle = TEAL + ".55)";
            ctx.fillRect(sx, sy, stripLen, 22);
            ctx.fillStyle = GOLD + ".55)";
            ctx.fillRect(sx, sy + 26, stripLen, 22);
            txt(ctx, "the same electrodes, unrolled", sx + sw / 2, sy - 30, 14, TEXT + ".85)");

            const tabs = state.tabs === "one" ? [0] : [0, 0.25, 0.5, 0.75, 1];

            tabs.forEach(function (f) {

                const x = sx + f * stripLen;

                ctx.fillStyle = GREY + ".95)";
                ctx.fillRect(x - 5, sy - 14, 10, 14);
                ctx.fillRect(x - 5, sy + 48, 10, 14);
            });

            // current runs from the farthest point along the foil to the nearest tab
            const fx = state.tabs === "one" ? sx + stripLen : sx + stripLen / 8;

            ctx.strokeStyle = BLUE + ".95)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(fx, sy + 11);
            ctx.lineTo(sx, sy + 11);
            ctx.stroke();

            ctx.fillStyle = BLUE + ".95)";
            ctx.beginPath();
            ctx.moveTo(sx, sy + 11); ctx.lineTo(sx + 9, sy + 6); ctx.lineTo(sx + 9, sy + 16);
            ctx.fill();

            txt(ctx, "longest path to a tab", sx + sw / 2, sy + 90, 13, BLUE + "1)");
            txt(ctx, "tabs at the top and bottom edges", sx + sw / 2, sy + 110, 12, TEXT + ".65)");
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


    SIMS["supercap-formfactor"] = quiz(
        "Game: which cell shape?",
        ["Cylindrical (jelly roll)", "Coin / button", "Pouch / prismatic"],
        [
            { q: "Two long strips wound into a spiral inside a metal can.", a: "Cylindrical (jelly roll)", why: "A big area rolled into a compact, rugged cylinder." },
            { q: "The everyday test vehicle for new electrode materials.", a: "Coin / button", why: "Tiny, cheap and easy to assemble." },
            { q: "Flat plates stacked or folded in a heat-sealed foil bag.", a: "Pouch / prismatic", why: "Thin, light, and many plates work in parallel." },
            { q: "Used for memory backup, with modest power.", a: "Coin / button", why: "Small capacity and fairly high resistance." },
            { q: "Round cans leave gaps when packed into modules.", a: "Cylindrical (jelly roll)", why: "That is its main catch." },
            { q: "Can swell if gas forms, so it needs good seals and gentle compression.", a: "Pouch / prismatic", why: "Pouches are flexible, so gas makes them bulge." },
            { q: "Borrows mature winding machinery from batteries.", a: "Cylindrical (jelly roll)", why: "Winding is a well-developed process." },
            { q: "Best fit for rectangular, thin and light products.", a: "Pouch / prismatic", why: "Flat shapes pack neatly." }
        ],
        6,
        "supercap-formfactor-done",
        "You can match shape to use",
        "Roll, coin, pouch: you know when to use each.",
        "Rolls are rugged, coins are tiny, pouches are flat. Hit Reset to try again."
    );


    SIMS["supercap-stack"] = function (root) {

        const defaults = { s: 1, p: 1 };
        const state = { s: 1, p: 1 };
        const CELL_C = 10;
        const CELL_V = 2.7;
        let won = false;

        root.innerHTML =
            head("Challenge: build a module from 2.7 V, 10 F cells") +
            art("0 0 340 190", "A grid of identical supercapacitor cells. Cells joined in a row are in series and add their voltage; rows side by side are in parallel and add their capacitance.") +
            '<div class="fd-stat-row">' + stat("Module voltage", "v") + stat("Module capacitance", "c") + stat("Cells used", "n") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<p class="fd-sim-note">Goal: at least 12 V and at least 5 F, using as few cells as you can.</p>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Cells in series (along the row)", key: "s", min: 1, max: 8, step: 1, value: 1 }) +
            slider({ label: "Rows in parallel", key: "p", min: 1, max: 6, step: 1, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">Series: voltages add, capacitance divides by the number of cells. Parallel: capacitance adds, voltage stays the same. Series strings also need balancing so no cell passes its rating.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const V = state.s * CELL_V;
            const C = CELL_C * state.p / state.s;
            const n = state.s * state.p;

            setVal(root, "s", state.s);
            setVal(root, "p", state.p);
            out(root, "v", V.toFixed(1) + " V");
            out(root, "c", C.toFixed(1) + " F");
            out(root, "n", n);

            const ok = V >= 12 && C >= 5;

            out(root, "verdict", ok ? (n <= 15 ? "Goal met with the fewest cells (" + n + ")! 🎉" : "Goal met, but with " + n + " cells. Can you do it with fewer?") :
                V < 12 ? "Not enough voltage yet: add cells in series" : "Not enough capacitance yet: add parallel rows");

            if (ok && n <= 15 && !won) {

                won = true;
                F.reward("supercap-stack", 15, "You built a 12 V module with the fewest cells");
            }

            const cw = Math.min(30, 300 / state.s - 4);
            const ch = Math.min(24, 150 / state.p - 4);
            const x0 = 170 - state.s * (cw + 4) / 2;
            const y0 = 95 - state.p * (ch + 4) / 2;
            let s = "";

            for (let r = 0; r < state.p; r++) {

                for (let c = 0; c < state.s; c++) {

                    const x = x0 + c * (cw + 4);
                    const y = y0 + r * (ch + 4);

                    s += rect(x, y, cw, ch, "rgba(84,224,199,.55)", "rgba(245,247,255,.7)");
                    s += rect(x + cw, y + ch / 2 - 2, 4, 4, "rgba(245,247,255,.9)");
                }
            }

            s += '<line x1="' + (x0 - 12) + '" y1="' + (y0 + 2) + '" x2="' + (x0 - 12) + '" y2="' + (y0 + state.p * (ch + 4) - 6) + '" style="stroke:rgba(255,214,102,.9);stroke-width:2"/>';
            s += '<line x1="' + (x0 + state.s * (cw + 4) + 8) + '" y1="' + (y0 + 2) + '" x2="' + (x0 + state.s * (cw + 4) + 8) + '" y2="' + (y0 + state.p * (ch + 4) - 6) + '" style="stroke:rgba(255,105,120,.9);stroke-width:2"/>';
            s += label(x0 - 12, y0 - 4, "−", 9, "middle", "#ffd666");
            s += label(x0 + state.s * (cw + 4) + 8, y0 - 4, "+", 9, "middle", "#ff6978");
            s += label(170, 182, state.s + " in series × " + state.p + " in parallel", 8, "middle", "var(--muted)");

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        root.querySelector("[data-reset]").addEventListener("click", function () { won = false; });

        update();
    };


    /* ======================================
       UNIT 14: SANDWICH VERSUS IN-PLANE
    ====================================== */

    SIMS["supercap-iontrip"] = function (root) {

        const defaults = { arch: "sandwich", d: 40, e: 40 };
        const state = { arch: "sandwich", d: 40, e: 40 };
        const seen = {};

        root.innerHTML =
            head("Try it: how far do the ions have to travel?") +
            canvasFor(root, 680, 320, "A sandwich device with electrodes stacked above and below a separator, and an in-plane device with two electrodes side by side separated by a gap, with ions crossing between them.") +
            '<div class="fd-stat-row">' + stat("Ion trip", "trip") + stat("Relative trip time", "time") + stat("Active material per footprint", "mat") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Architecture", "arch", [["sandwich", "🥪 Sandwich"], ["inplane", "↔ In-plane"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Separator thickness or lateral gap", key: "d", min: 5, max: 100, step: 5, value: 40 }) +
            slider({ label: "Electrode thickness or height", key: "e", min: 5, max: 100, step: 5, value: 40 }) +
            "</div>" +
            '<p class="fd-sim-formula">Diffusion time grows with the square of the distance, so halving the trip makes it four times quicker. A thin in-plane device holds little material per footprint unless its electrodes grow tall.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(3);

        const ions = [];

        for (let i = 0; i < 12; i++) { ions.push({ u: rand(), dir: i % 2 ? 1 : -1, sp: 0.6 + rand() * 0.6, off: rand() }); }

        let t = 0;

        function metrics() {

            const sand = state.arch === "sandwich";
            const trip = sand ? state.d : state.d;
            const finger = 20;
            const mat = sand ? 2 * state.e / 100 : state.e / 100 * finger / (finger + state.d) * 2;

            return { trip: trip, time: trip * trip / 1600, mat: mat };
        }

        function update() {

            const m = metrics();

            seen[state.arch] = true;

            out(root, "trip", m.trip + " µm");
            out(root, "time", m.time.toFixed(1) + "×");
            out(root, "mat", (m.mat * 100).toFixed(0) + " %");
            setVal(root, "d", state.d + " µm");
            setVal(root, "e", state.e + " µm");
            out(root, "verdict", state.arch === "sandwich" ? "Ions cross the separator: stack layers to add capacity" : "Ions cross the lateral gap: pattern both electrodes in one step");

            if (seen.sandwich && seen.inplane) {
                F.reward("supercap-iontrip", 10, "You compared sandwich and in-plane devices");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const sand = state.arch === "sandwich";
            const d = state.d * (sand ? 1.2 : 2);
            const e = state.e * 1.2;

            if (sand) {

                const cx = 340;
                const cy = 160;

                // electrode (top), separator, electrode (bottom)
                ctx.fillStyle = TEAL + ".6)";
                ctx.fillRect(cx - 200, cy - d / 2 - e, 400, e);
                ctx.fillStyle = GOLD + ".6)";
                ctx.fillRect(cx - 200, cy + d / 2, 400, e);
                ctx.fillStyle = BLUE + ".25)";
                ctx.fillRect(cx - 200, cy - d / 2, 400, d);
                ctx.strokeStyle = TEXT + ".4)";
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(cx - 200, cy - d / 2, 400, d);
                ctx.setLineDash([]);

                txt(ctx, "electrode", cx - 150, cy - d / 2 - e / 2 + 5, 13, "rgba(6,10,24,.9)", "center", true);
                txt(ctx, "electrode", cx - 150, cy + d / 2 + e / 2 + 5, 13, "rgba(6,10,24,.9)", "center", true);
                txt(ctx, "separator soaked in electrolyte", cx, cy + 5, 13, TEXT + ".85)");

                ions.forEach(function (ion) {

                    const u = ((t * ion.sp * 0.35 + ion.off) % 1);
                    const y = ion.dir > 0 ? cy - d / 2 + u * d : cy + d / 2 - u * d;
                    const x = cx - 170 + (ion.off * 340);

                    dot(ctx, x, y, 5, (ion.dir > 0 ? ROSE : BLUE) + ".95)");
                });

            } else {

                const baseY = 250;
                const fw = 130;
                const gx = 340;
                const hh = e * 2;

                ctx.fillStyle = GREY + ".5)";
                ctx.fillRect(100, baseY, 480, 14);

                ctx.fillStyle = TEAL + ".6)";
                ctx.fillRect(gx - d / 2 - fw, baseY - hh, fw, hh);
                ctx.fillStyle = GOLD + ".6)";
                ctx.fillRect(gx + d / 2, baseY - hh, fw, hh);

                ctx.fillStyle = BLUE + ".25)";
                ctx.fillRect(gx - d / 2, baseY - hh, d, hh);

                txt(ctx, "electrode", gx - d / 2 - fw / 2, baseY - hh / 2 + 5, 13, "rgba(6,10,24,.9)", "center", true);
                txt(ctx, "electrode", gx + d / 2 + fw / 2, baseY - hh / 2 + 5, 13, "rgba(6,10,24,.9)", "center", true);
                txt(ctx, "gap with electrolyte (no separator)", gx, baseY + 40, 13, TEXT + ".85)");

                ions.forEach(function (ion) {

                    const u = ((t * ion.sp * 0.35 + ion.off) % 1);
                    const x = ion.dir > 0 ? gx - d / 2 + u * d : gx + d / 2 - u * d;
                    const y = baseY - 10 - ion.off * (hh - 20);

                    dot(ctx, x, y, 5, (ion.dir > 0 ? ROSE : BLUE) + ".95)");
                });
            }
        }

        animate(root, function (dt) {

            t += dt / Math.max(0.5, state.d / 40);

            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-arch"] = quiz(
        "Game: sandwich or in-plane?",
        ["Sandwich", "In-plane"],
        [
            { q: "Electrodes face each other across a thin porous separator.", a: "Sandwich", why: "Ions cross the layer thickness." },
            { q: "Both electrodes sit on the same surface with a small gap between them.", a: "In-plane", why: "Also called coplanar." },
            { q: "Needs no separator: the lateral gap is filled with electrolyte.", a: "In-plane", why: "The gap replaces the separator." },
            { q: "You add capacity by stacking more layers.", a: "Sandwich", why: "It scales upward." },
            { q: "Both electrodes can be patterned in a single step.", a: "In-plane", why: "That is why it suits microchips and printing." },
            { q: "The usual choice for cells and modules.", a: "Sandwich", why: "Assembled and stacked layers." },
            { q: "You add capacity with more fingers or taller electrodes.", a: "In-plane", why: "It scales sideways and upward." },
            { q: "Best for flexible films and microchips.", a: "In-plane", why: "Thin, flat and easy to pattern." }
        ],
        6,
        "supercap-arch-done",
        "You can tell the two architectures apart",
        "Sandwich for cells, in-plane for microchips.",
        "Sandwich: face-to-face with a separator. In-plane: side by side with a gap. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="supercap-"]').forEach(F.mount);

})();
