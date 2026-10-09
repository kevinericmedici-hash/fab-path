/* ========================================
   SUPERCAPACITORS: INTERACTIVE SIMULATORS, PART 5

   Unit 31: slurries, binders, coating, electrode loading.
   Unit 32: photolithography flow, shrinkage.
   Unit 33: lift-off, etch profiles, deposition game.
   Unit 34: printing game, laser scribing.
   Unit 35: electrodeposition, growth routes, electrospinning.
   Unit 36: choosing a fabrication route.
   Unit 37: duty cycle, cost per cycle, scorecard.
   Unit 38: regenerative braking, hybrid packs, the grid.
   Unit 39: pulse loads, energy harvesting.
   Unit 40: sizing a supercapacitor.

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
    const poly = M.poly;
    const animate = M.animate;
    const quiz = M.quiz;
    const stepper = M.stepper;
    const orderGame = M.orderGame;
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
    const PURPLE = "rgba(190,150,255,";
    const TEXT = "rgba(245,247,255,";

    function priority(cfg) {

        return function (root) {

            const defaults = {};

            cfg.props.forEach(function (p) { defaults[p.k] = 1; });

            const state = Object.assign({}, defaults);
            const winners = {};

            root.innerHTML =
                head(cfg.title) +
                art("0 0 340 " + (30 + cfg.fam.length * 34), cfg.aria) +
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

                let s = label(14, 14, "How well each option fits your goals", 8, "start", "var(--muted)");

                cfg.fam.forEach(function (f, i) {

                    const y = 28 + i * 34;

                    s += label(14, y + 4, f.n, 8, "start", "var(--text)");
                    s += rect(14, y + 8, 220, 14, "rgba(170,179,207,.2)");
                    s += rect(14, y + 8, 220 * scores[i], 14, f.c + (i === best && total ? ".95)" : ".45)"));
                    s += label(240, y + 19, Math.round(scores[i] * 100) + "%", 9, "start", "var(--text)");
                });

                svg.innerHTML = s;

                if (!total) {

                    out(root, "verdict", "Raise a goal above");
                    out(root, "why", "Slide at least one goal up to see which route fits.");

                    return;
                }

                const weak = cfg.props.filter(function (p) { return cfg.fam[best].r[p.k] <= 2 && state[p.k] > 0; });

                out(root, "verdict", cfg.fam[best].n + " fits best");
                out(root, "why", weak.length ? "But it is weak on: " + weak.map(function (p) { return p.n.toLowerCase(); }).join(", ") + "." : "And it does not give up anything you asked for.");

                winners[best] = true;

                if (Object.keys(winners).length >= 4) {
                    F.reward(cfg.key, 10, "You found goals that favor four different routes");
                }
            }

            wire(root, state, defaults, update);
            update();
        };
    }


    /* ======================================
       UNIT 31: SLURRIES
    ====================================== */

    SIMS["supercap-philosophy"] = quiz(
        "Game: which way to make an electrode?",
        ["Bulk and additive", "Top-down microfabrication", "Growth and assembly", "Direct writing"],
        [
            { q: "Mix powders, cast or print them, and dry: cheap and scalable.", a: "Bulk and additive", why: "Less precise, but easy to scale." },
            { q: "Pattern with light, then etch or bake the shapes.", a: "Top-down microfabrication", why: "Precise and small, but slower and costlier." },
            { q: "Let material plate, grow or spin into shape on a scaffold.", a: "Growth and assembly", why: "The material builds itself where you want it." },
            { q: "Draw features with a nozzle or a laser, no mask needed.", a: "Direct writing", why: "The design lives in software." },
            { q: "Photolithography belongs to which family?", a: "Top-down microfabrication", why: "Light draws the pattern." },
            { q: "Slurry casting belongs to which family?", a: "Bulk and additive", why: "It is the standard battery-style route." }
        ],
        5,
        "supercap-philosophy-done",
        "You know the four families",
        "Most real devices combine two or more of these.",
        "Bulk, top-down, growth, direct writing. Hit Reset to try again."
    );


    SIMS["supercap-slurryparts"] = quiz(
        "Game: what is in the slurry?",
        ["Active material", "Conductive additive", "Binder", "Solvent"],
        [
            { q: "The carbon or oxide that actually stores the charge.", a: "Active material", why: "It is the point of the electrode." },
            { q: "Carbon black or similar, forming electron paths between particles.", a: "Conductive additive", why: "It connects the particles electrically." },
            { q: "PVDF, PTFE or CMC, gluing particles together and to the collector.", a: "Binder", why: "Without it the film cracks or peels." },
            { q: "What turns the powders into a smooth paste, and is dried off later.", a: "Solvent", why: "It is removed in the drying step." },
            { q: "An electrical insulator that can block pores.", a: "Binder", why: "Too much binder adds resistance and dead weight." }
        ],
        5,
        "supercap-slurryparts-done",
        "You know the slurry recipe",
        "Active material, conductive additive, binder and solvent.",
        "Active stores, additive conducts, binder glues, solvent carries. Hit Reset to try again."
    );


    SIMS["supercap-castflow"] = orderGame(
        "Game: from slurry to electrode",
        [
            { n: "Mix", d: "blend powder, additive, binder and solvent", why: "A uniform paste is the starting point." },
            { n: "Cast", d: "spread a film onto metal foil", why: "A doctor blade or coater sets the thickness." },
            { n: "Dry", d: "drive off the solvent", why: "Often done in an oven." },
            { n: "Press", d: "roll the film to densify it", why: "Better contact between particles and foil." },
            { n: "Cut", d: "punch out discs or strips", why: "Ready for assembly." }
        ],
        "supercap-castflow-done",
        "You ordered the slurry-to-electrode flow",
        "Tap the five steps in the order they happen.",
        "Simple, roll-friendly steps are what make this route so easy to scale."
    );


    SIMS["supercap-binder"] = function (root) {

        const defaults = { b: 8 };
        const state = { b: 8 };
        const rand = mulberry(9);
        const parts = [];

        for (let i = 0; i < 70; i++) { parts.push({ x: rand(), y: rand(), r: 7 + rand() * 4, d: rand() }); }

        let hit = false;

        root.innerHTML =
            head("Try it: how much binder is enough?") +
            canvasFor(root, 680, 320, "A film of carbon particles on a foil. With little binder the film cracks and peels, with the right amount it holds together, and with too much the particles are coated with insulating polymer.") +
            '<div class="fd-stat-row">' + stat("Holds together", "hold") + stat("Conducts and lets ions in", "cond") + stat("Overall", "all") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Binder (percent of the film)", key: "b", min: 0, max: 30, step: 1, value: 8 }) +
            "</div>" +
            '<p class="fd-sim-formula">The best binder is the smallest amount that still holds the film together. Binder-free electrodes avoid the trade altogether. (Illustrative curves.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function m() {

            const hold = 1 - Math.exp(-state.b / 3.5);
            const cond = Math.exp(-state.b / 14);

            return { hold: hold, cond: cond, all: hold * cond };
        }

        function update() {

            const k = m();

            setVal(root, "b", state.b + " %");
            out(root, "hold", Math.round(k.hold * 100) + " %");
            out(root, "cond", Math.round(k.cond * 100) + " %");
            out(root, "all", Math.round(k.all * 100) + " %");
            out(root, "verdict", state.b < 3 ? "Too little binder: the film cracks and peels" : state.b > 16 ? "Too much binder: pores are blocked, resistance rises" : "A workable balance");

            if (!hit && k.all > 0.55) {

                hit = true;
                F.reward("supercap-binder", 10, "You found a good binder level");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const k = m();
            const x0 = 60;
            const y0 = 90;
            const w = 560;
            const h = 150;

            ctx.fillStyle = GREY + ".85)";
            ctx.fillRect(x0 - 10, y0 + h, w + 20, 12);
            txt(ctx, "metal foil", 340, y0 + h + 34, 13, TEXT + ".8)");

            // cracks when the film does not hold
            const gap = (1 - k.hold) * 40;

            parts.forEach(function (p, i) {

                const cx = x0 + p.x * w + (p.x < 0.5 ? -gap : gap) * (1 - k.hold) * 0.8;
                const cy = y0 + 14 + p.y * (h - 28) + (1 - k.hold) * p.d * 30;

                // binder halo
                if (state.b > 0) {

                    ctx.fillStyle = "rgba(210,215,235," + (0.12 + Math.min(0.5, state.b / 40)) + ")";
                    ctx.beginPath();
                    ctx.arc(cx, cy, p.r + state.b * 0.35, 0, Math.PI * 2);
                    ctx.fill();
                }

                dot(ctx, cx, cy, p.r, "rgba(40,48,70,.98)");
                ctx.strokeStyle = TEAL + ".8)";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
                ctx.stroke();

                i;
            });

            if (k.hold < 0.5) { txt(ctx, "cracks, peeling", 340, 70, 15, ROSE + "1)", "center", true); }
            if (k.cond < 0.5) { txt(ctx, "pores blocked by insulating binder", 340, 70, 15, GOLD + "1)", "center", true); }
            if (k.all > 0.55) { txt(ctx, "holds together and still conducts", 340, 70, 15, TEAL + "1)", "center", true); }

            // gauge bars
            [["holds", k.hold, TEAL], ["conducts", k.cond, GOLD]].forEach(function (g, i) {

                ctx.fillStyle = GREY + ".18)";
                ctx.fillRect(60, 22 + i * 18, 200, 10);
                ctx.fillStyle = g[2] + ".9)";
                ctx.fillRect(60, 22 + i * 18, 200 * g[1], 10);
                txt(ctx, g[0], 300, 31 + i * 18, 12, TEXT + ".7)", "start");
            });
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-loading"] = function (root) {

        const defaults = { t: 80 };
        const state = { t: 80 };
        let hit = false;

        root.innerHTML =
            head("Try it: how thick can you go?") +
            canvasFor(root, 680, 320, "A cross-section of an electrode film on a current collector. A thicker film holds more material but ions have to travel deeper and the film may crack.") +
            '<div class="fd-stat-row">' + stat("Energy per footprint", "e") + stat("Speed (rate capability)", "s") + stat("Cracking risk", "c") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Film thickness", key: "t", min: 10, max: 400, step: 10, value: 80 }) +
            "</div>" +
            '<p class="fd-sim-formula">Loading is a dial between energy and speed. A thicker film means more active material per footprint but longer ion paths and a higher risk of cracking. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function m() {

            return { e: state.t / 80, s: Math.exp(-state.t / 160), c: clamp((state.t - 220) / 180, 0, 1) };
        }

        function update() {

            const k = m();

            setVal(root, "t", state.t + " µm");
            out(root, "e", k.e.toFixed(1) + "×");
            out(root, "s", Math.round(k.s * 100) + " %");
            out(root, "c", k.c < 0.05 ? "low" : k.c < 0.5 ? "growing" : "high");
            out(root, "verdict", state.t < 60 ? "Thin: fast, but little energy per footprint" : state.t > 250 ? "Thick: lots of material, but slow and prone to cracking" : "A middle ground between energy and speed");

            if (!hit && state.t <= 60 && false) { hit = true; }
        }

        function draw() {

            clear(ctx, 680, 320);

            const h = state.t / 400 * 190;
            const cx = 340;
            const w = 460;
            const base = 270;
            const k = m();

            ctx.fillStyle = GREY + ".85)";
            ctx.fillRect(cx - w / 2 - 10, base, w + 20, 12);
            ctx.fillStyle = TEAL + ".6)";
            ctx.fillRect(cx - w / 2, base - h, w, h);

            // ion arrows going down; they fade with depth
            for (let i = 0; i < 9; i++) {

                const x = cx - w / 2 + 30 + i * (w - 60) / 8;
                const prog = ((t * 0.6 + i * 0.13) % 1);
                const y = base - h - 10 + prog * (h + 8) * Math.min(1, k.s * 1.1 + 0.15);
                const fade = 1 - prog * (1 - k.s);

                dot(ctx, x, y, 5, ROSE + clamp(fade, 0.15, 1) + ")");
            }

            // cracks
            if (k.c > 0.05) {

                ctx.strokeStyle = "rgba(6,10,24,.95)";
                ctx.lineWidth = 2.4;

                for (let i = 0; i < Math.round(k.c * 7); i++) {

                    const x = cx - w / 2 + 40 + i * 60;

                    ctx.beginPath();
                    ctx.moveTo(x, base - h);
                    ctx.lineTo(x + 8, base - h + h * 0.5);
                    ctx.lineTo(x - 4, base - 6);
                    ctx.stroke();
                }
            }

            txt(ctx, "current collector", cx, base + 34, 13, TEXT + ".8)");
            txt(ctx, "ions enter from the top", cx, 40, 13, ROSE + "1)");
            txt(ctx, state.t + " µm", cx + w / 2 + 50, base - h / 2, 13, TEXT + ".8)");
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
       UNIT 32: PHOTOLITHOGRAPHY AND PYROLYSIS
    ====================================== */

    SIMS["supercap-resist"] = quiz(
        "Game: which resist?",
        ["Positive resist", "Negative resist", "SU-8"],
        [
            { q: "Exposed areas dissolve in the developer.", a: "Positive resist", why: "Light removes what it touches." },
            { q: "Exposed areas cross-link and stay behind.", a: "Negative resist", why: "Light makes what it touches stay." },
            { q: "An epoxy-based negative resist that forms thick, tall, steep-walled structures.", a: "SU-8", why: "A common starting point for tall polymer structures." },
            { q: "Which one is baked into glassy carbon in this course?", a: "SU-8", why: "Pyrolysis turns it into carbon." },
            { q: "Which one is used for tall pillars and combs that add surface area?", a: "SU-8", why: "Tall walls add area without a bigger footprint." },
            { q: "A mask lets light through where you want the resist to stay.", a: "Negative resist", why: "Exposed negative resist stays after developing." }
        ],
        5,
        "supercap-resist-done",
        "You know your photoresists",
        "Positive dissolves, negative stays, and SU-8 goes tall.",
        "Positive: exposed dissolves. Negative: exposed stays. SU-8: thick and tall. Hit Reset to try again."
    );


    SIMS["supercap-lithoflow"] = orderGame(
        "Game: from wafer to glassy carbon",
        [
            { n: "Clean", d: "prepare the substrate", why: "Silicon or oxidized silicon, free of contamination." },
            { n: "Spin", d: "coat the resist to a set thickness", why: "Spin speed controls thickness." },
            { n: "Soft bake", d: "drive off the solvent", why: "Prepares the resist for exposure." },
            { n: "Expose", d: "shine UV through the mask", why: "Light draws the pattern." },
            { n: "Develop", d: "bake after exposure, then wash away unwanted resist", why: "Only the cross-linked resist remains." },
            { n: "Pyrolyze", d: "heat in an inert gas", why: "The polymer structure becomes glassy carbon." }
        ],
        "supercap-lithoflow-done",
        "You ordered the whole lithography-to-carbon flow",
        "Tap the six steps in the order they happen.",
        "Steps 1 to 5 make a polymer structure. Step 6 turns it into carbon."
    );


    SIMS["supercap-shrink"] = function (root) {

        const defaults = { s: 50, mask: 20 };
        const state = { s: 50, mask: 20 };
        const TARGET = 20;
        let hit = false;

        root.innerHTML =
            head("Challenge: design for the shrink") +
            art("0 0 340 190", "Two finger outlines: the width drawn on the mask, and the smaller width after pyrolysis. The goal is a final finger width of 20 micrometers.") +
            '<div class="fd-stat-row">' + stat("Width on the mask", "m") + stat("Width after pyrolysis", "f") + stat("Target", "t") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-auto>🪄 Compensate for me</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Shrinkage during pyrolysis (set by the process)", key: "s", min: 30, max: 70, step: 5, value: 50 }) +
            slider({ label: "Finger width drawn on the mask", key: "mask", min: 10, max: 100, step: 1, value: 20 }) +
            "</div>" +
            '<p class="fd-sim-formula">Shrinkage is fairly uniform, so the mask can be drawn larger to compensate: mask width = target ÷ (1 − shrinkage). Shrinkage is a design input, not a surprise. (Values illustrative.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const f = state.mask * (1 - state.s / 100);

            setVal(root, "s", state.s + " %");
            setVal(root, "mask", state.mask + " µm");
            out(root, "m", state.mask + " µm");
            out(root, "f", f.toFixed(1) + " µm");
            out(root, "t", TARGET + " µm");
            out(root, "verdict", Math.abs(f - TARGET) <= 0.8 ? "On target! The mask compensates for the shrink 🎯" : f < TARGET ? "Too thin after the bake: draw the mask wider" : "Too wide after the bake: draw the mask narrower");

            if (!hit && Math.abs(f - TARGET) <= 0.8 && state.s !== 0 && state.mask > TARGET + 4) {

                hit = true;
                F.reward("supercap-shrink", 10, "You compensated for pyrolysis shrinkage");
            }

            const k = 1.6;
            const hh = 90;

            let s = rect(40, 140, 260, 8, "rgba(170,179,207,.5)");

            s += rect(90 - state.mask * k / 2, 140 - hh, state.mask * k, hh, "rgba(190,200,230,.35)", "rgba(245,247,255,.7)");
            s += label(90, 160, "mask: " + state.mask + " µm", 8, "middle", "var(--text)");

            s += rect(250 - f * k / 2, 140 - hh * (1 - state.s / 100), f * k, hh * (1 - state.s / 100), "rgba(40,48,70,.98)", "rgba(84,224,199,.9)");
            s += label(250, 160, "after: " + f.toFixed(1) + " µm", 8, "middle", "var(--text)");

            s += '<line x1="' + (250 - TARGET * k / 2) + '" y1="150" x2="' + (250 + TARGET * k / 2) + '" y2="150" style="stroke:#ffd666;stroke-width:2"/>';
            s += label(250, 178, "target 20 µm", 7, "middle", "#ffd666");
            s += label(170, 60, "→ bake →", 9, "middle", "var(--muted)");

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);

        root.querySelector("[data-auto]").addEventListener("click", function () {

            state.mask = Math.min(100, Math.round(TARGET / (1 - state.s / 100)));
            root.querySelector('input[data-key="mask"]').value = state.mask;
            update();
        });

        update();
    };


    /* ======================================
       UNIT 33: DEPOSITION, ETCHING, TEMPLATES
    ====================================== */

    SIMS["supercap-depo"] = quiz(
        "Game: which deposition method?",
        ["Sputtering or evaporation", "CVD", "ALD"],
        [
            { q: "Metal current collectors and thin oxide or nitride films.", a: "Sputtering or evaporation", why: "Line-of-sight methods that suit metals." },
            { q: "Graphene, nanotube forests and diamond-like films.", a: "CVD", why: "Films grown from reacting gases." },
            { q: "Ultra-thin, even coatings on 3D structures, even inside pores.", a: "ALD", why: "One atomic layer per cycle." },
            { q: "Adds one atomic layer per cycle.", a: "ALD", why: "That is what atomic layer deposition means." },
            { q: "Material released from a source onto the substrate.", a: "Sputtering or evaporation", why: "Atoms leave a source and land on the wafer." },
            { q: "Can coat 3D scaffolds where line-of-sight methods cannot.", a: "ALD", why: "Gas reaches into every nook." }
        ],
        5,
        "supercap-depo-done",
        "You know the deposition tools",
        "Sputtering for metals, CVD for carbon, ALD for conformal coatings.",
        "Line of sight for metals; CVD grows carbon; ALD coats everything. Hit Reset to try again."
    );


    SIMS["supercap-liftoff"] = stepper({
        title: "Watch: lift-off patterning",
        aria: "Side view of a wafer. Resist is patterned, metal is deposited over everything, the resist is dissolved and carries away the metal on top of it, leaving metal only where it touched the substrate.",
        viewBox: "0 0 340 190",
        interval: 3,
        rewardKey: "supercap-liftoff",
        rewardMsg: "You followed the lift-off process",
        steps: [
            { t: "1. Pattern the resist", tool: "photolithography", text: "Resist is left behind everywhere you do not want metal. The openings are where the fingers will be." },
            { t: "2. Deposit metal over everything", tool: "sputter or evaporate", text: "Metal covers the resist and also reaches the substrate through the openings." },
            { t: "3. Dissolve the resist", tool: "solvent", text: "The resist dissolves, and the metal sitting on top of it lifts away." },
            { t: "4. Only the touching metal remains", tool: "result", text: "Interleaved metal fingers remain, such as current collectors for a micro supercapacitor." }
        ],
        draw: function (step, st) {

            let s = rect(20, 140, 300, 16, "rgba(170,179,207,.55)");
            const open = [[70, 100], [150, 180], [230, 260]];
            const res = [[20, 70], [100, 150], [180, 230], [260, 320]];

            if (step < 2) {

                res.forEach(function (r) { s += rect(r[0], 100, r[1] - r[0], 40, "rgba(255,214,102,.45)", "rgba(255,214,102,.9)"); });

            } else if (step === 2) {

                const fade = 0.45 - Math.min(0.45, (st.t || 0) / 3);

                res.forEach(function (r) {
                    s += rect(r[0], 100, r[1] - r[0], 40, "rgba(255,214,102," + fade + ")", "rgba(255,214,102,.5)");
                });
            }

            if (step === 1) {

                res.forEach(function (r) { s += rect(r[0], 94, r[1] - r[0], 6, "rgba(84,224,199,.85)"); });
                open.forEach(function (o) { s += rect(o[0], 134, o[1] - o[0], 6, "rgba(84,224,199,.85)"); });
            }

            if (step === 2) {

                const lift = Math.min(40, (st.t || 0) * 18);

                res.forEach(function (r) { s += rect(r[0], 94 - lift, r[1] - r[0], 6, "rgba(84,224,199," + (0.85 - lift / 60) + ")"); });
                open.forEach(function (o) { s += rect(o[0], 134, o[1] - o[0], 6, "rgba(84,224,199,.85)"); });
            }

            if (step === 3) {

                open.forEach(function (o) { s += rect(o[0], 134, o[1] - o[0], 6, "rgba(84,224,199,.95)", "rgba(245,247,255,.7)"); });
            }

            s += label(170, 18, step === 0 ? "resist pattern (yellow)" : step === 1 ? "metal everywhere (teal)" : step === 2 ? "the resist carries its metal away" : "metal fingers left on the substrate", 9, "middle", "var(--text)");

            return s;
        }
    });


    SIMS["supercap-etchprofile"] = function (root) {

        const defaults = { kind: "wet", d: 40 };
        const state = { kind: "wet", d: 40 };
        const seen = {};

        root.innerHTML =
            head("Try it: three ways to carve silicon") +
            canvasFor(root, 680, 320, "A silicon wafer with a mask opening, being etched. Wet etching cuts sideways as well as down and leaves a rounded cavity. Plasma etching is more vertical. Deep reactive ion etching cuts tall, near-vertical trenches.") +
            '<div class="fd-stat-row">' + stat("Depth", "dep") + stat("Width at the top", "wid") + stat("Depth ÷ width", "ar") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Etch", "kind", [["wet", "🧪 Wet etch"], ["rie", "⚡ Plasma (RIE)"], ["drie", "🏛️ Deep RIE (DRIE)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Etch time", key: "d", min: 0, max: 100, step: 5, value: 40 }) +
            "</div>" +
            '<p class="fd-sim-formula">Etching can turn flat silicon into towers, trenches or pores, which are then coated with storage material. (Profiles are schematic.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function geom() {

            const k = state.kind;
            const open = 50;
            const depth = state.d * (k === "drie" ? 2.0 : 1.0) * 1.0;
            const side = k === "wet" ? depth * 0.95 : k === "rie" ? depth * 0.12 : depth * 0.015;

            return { depth: depth, half: open / 2 + side, open: open, side: side };
        }

        function update() {

            const g = geom();

            setVal(root, "d", state.d);
            seen[state.kind] = true;
            out(root, "dep", Math.round(g.depth / 2) + " µm");
            out(root, "wid", Math.round(g.half * 2 / 2) + " µm");
            out(root, "ar", (g.depth / (g.half * 2)).toFixed(1) + " : 1");
            out(root, "verdict", state.kind === "wet" ? "Cheap and simple, but it cuts sideways too" : state.kind === "rie" ? "More directional: a steeper wall" : "Tall, near-vertical trenches and pillars");

            if (seen.wet && seen.rie && seen.drie) {
                F.reward("supercap-etchprofile", 10, "You compared all three etching methods");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const g = geom();
            const cx = 340;
            const top = 90;
            const scale = 1.1;

            ctx.fillStyle = "rgba(150,160,190,.7)";
            ctx.fillRect(60, top, 560, 200);

            // carved cavity
            ctx.fillStyle = "rgba(11,16,32,1)";
            ctx.beginPath();

            const half = g.half * scale;
            const depth = Math.min(g.depth * scale, 195);

            if (state.kind === "wet") {

                ctx.moveTo(cx - half, top);
                ctx.quadraticCurveTo(cx - half, top + depth, cx, top + depth);
                ctx.quadraticCurveTo(cx + half, top + depth, cx + half, top);

            } else if (state.kind === "rie") {

                ctx.moveTo(cx - half, top);
                ctx.lineTo(cx - g.open / 2 * scale - 1, top + depth);
                ctx.lineTo(cx + g.open / 2 * scale + 1, top + depth);
                ctx.lineTo(cx + half, top);

            } else {

                const w = g.open / 2 * scale;

                ctx.moveTo(cx - w, top);

                for (let y = 0; y < depth; y += 8) {

                    ctx.lineTo(cx - w - ((y / 8) % 2 ? 1.6 : 0), top + y);
                    ctx.lineTo(cx - w - ((y / 8) % 2 ? 0 : 1.6), top + y + 4);
                }

                ctx.lineTo(cx - w, top + depth);
                ctx.lineTo(cx + w, top + depth);

                for (let y = depth; y > 0; y -= 8) {

                    ctx.lineTo(cx + w + ((y / 8) % 2 ? 1.6 : 0), top + y);
                    ctx.lineTo(cx + w + ((y / 8) % 2 ? 0 : 1.6), top + y - 4);
                }

                ctx.lineTo(cx + w, top);
            }

            ctx.closePath();
            ctx.fill();

            // mask
            ctx.fillStyle = GOLD + ".9)";
            ctx.fillRect(60, top - 12, cx - g.open / 2 * scale - 60, 12);
            ctx.fillRect(cx + g.open / 2 * scale, top - 12, 620 - (cx + g.open / 2 * scale), 12);

            txt(ctx, "mask", 120, top - 20, 13, GOLD + "1)");
            txt(ctx, "silicon", 120, top + 40, 13, "rgba(6,10,24,.9)", "center", true);
            txt(ctx, state.kind === "drie" ? "scalloped, nearly vertical walls" : state.kind === "wet" ? "undercut: sideways as well as down" : "steeper walls", 340, 40, 14, TEXT + ".85)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-templates"] = quiz(
        "Game: which etch or template?",
        ["Wet etching", "Plasma etching (RIE)", "DRIE", "Anodized aluminum or titanium"],
        [
            { q: "A chemical bath: cheap and simple, but it usually cuts sideways too.", a: "Wet etching", why: "It is not very directional." },
            { q: "Ions and reactive gas remove material with much more directional control.", a: "Plasma etching (RIE)", why: "Plasma gives steeper walls." },
            { q: "Cuts tall, near-vertical trenches and pillars deep into silicon.", a: "DRIE", why: "Deep reactive ion etching." },
            { q: "Grows a honeycomb of nanopores or nanotubes without lithography.", a: "Anodized aluminum or titanium", why: "The template sets the geometry." },
            { q: "Best for towers and trenches with a tall aspect ratio.", a: "DRIE", why: "It keeps the walls vertical as it goes deep." },
            { q: "Anodic aluminum oxide with regular nanoscale pores.", a: "Anodized aluminum or titanium", why: "Pores are then filled with carbon or a conductor." }
        ],
        5,
        "supercap-templates-done",
        "You know your etches and templates",
        "Wet cuts sideways, plasma is steeper, DRIE goes deep, templates grow ordered pores.",
        "Pick by direction and depth. Hit Reset to try again."
    );


    /* ======================================
       UNIT 34: PRINTING AND LASER WRITING
    ====================================== */

    SIMS["supercap-printing"] = quiz(
        "Game: which printing method?",
        ["Screen printing", "Inkjet printing", "Direct ink writing", "Roll-to-roll"],
        [
            { q: "A squeegee pushes thick ink through a patterned mesh.", a: "Screen printing", why: "Fast and simple, features of roughly 100 µm." },
            { q: "Tiny droplets from a nozzle: fine detail, but the ink must be runny.", a: "Inkjet printing", why: "Thin layers and fine detail." },
            { q: "A paste is extruded layer by layer, even into tall electrodes.", a: "Direct ink writing", why: "It builds thick or tall structures." },
            { q: "A long flexible sheet runs past printing and drying stations.", a: "Roll-to-roll", why: "High volume." },
            { q: "Which needs the thickest paste?", a: "Direct ink writing", why: "The paste must hold its shape after extrusion." },
            { q: "Which is best for mass production on flexible film?", a: "Roll-to-roll", why: "Continuous production." }
        ],
        5,
        "supercap-printing-done",
        "You know the printing family",
        "Pick the method by feature size, layer thickness and volume.",
        "Screen: thick ink. Inkjet: fine and runny. Direct writing: pastes. Roll-to-roll: volume. Hit Reset to try again."
    );


    SIMS["supercap-laser"] = function (root) {

        const defaults = { p: 50 };
        const state = { p: 50 };
        const seen = {};

        root.innerHTML =
            head("Try it: write graphene with a laser") +
            canvasFor(root, 680, 320, "An infrared laser spot tracing a comb pattern on a polyimide film. At low power the film is hardly changed, at the right power it turns into black porous graphene, and at too high power it burns through.") +
            '<div class="fd-stat-row">' + stat("Result", "res") + stat("Line width", "w") + stat("Time to draw", "t") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-replay>↻ Draw it again</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Laser power", key: "p", min: 10, max: 100, step: 5, value: 50 }) +
            "</div>" +
            '<p class="fd-sim-formula">A focused laser heats the polymer film and converts its surface into porous graphene in one step, with no mask or furnace. Reproducibility depends on tight control of laser power and speed. (Thresholds illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        // the comb path: spine and fingers for two interleaved combs
        const path = [];

        (function build() {

            const x0 = 90;
            const x1 = 590;

            path.push([x0, 70], [x1, 70]);

            for (let i = 0; i < 6; i++) {

                const x = x0 + 20 + i * 90;

                path.push([x, 70], [x, 200], [x, 70]);
            }

            path.push([x0, 250], [x1, 250]);

            for (let i = 0; i < 5; i++) {

                const x = x0 + 65 + i * 90;

                path.push([x, 250], [x, 120], [x, 250]);
            }
        })();

        let progress = 0;
        let done = false;
        const segLen = [];
        let total = 0;

        for (let i = 1; i < path.length; i++) {

            const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);

            segLen.push(l);
            total += l;
        }

        function mode() { return state.p < 30 ? "faint" : state.p <= 70 ? "lig" : "burn"; }

        function update() {

            const m = mode();

            seen[m] = true;
            setVal(root, "p", state.p + " %");
            out(root, "res", m === "faint" ? "film barely changed" : m === "lig" ? "laser-induced graphene" : "burned through");
            out(root, "w", Math.round(60 + state.p * 1.2) + " µm");
            out(root, "t", "minutes");
            out(root, "verdict", m === "faint" ? "Too little power: not enough heat to make graphene" : m === "lig" ? "Just right: conductive porous carbon, written in one step" : "Too much power: the film is cut through, not converted");

            if (seen.faint && seen.lig && seen.burn) {
                F.reward("supercap-laser", 10, "You found the laser-power sweet spot");
            }

            progress = 0;
            done = false;
        }

        function pointAt(d) {

            let rem = d;

            for (let i = 0; i < segLen.length; i++) {

                if (rem <= segLen[i]) {

                    const u = rem / segLen[i];

                    return [path[i][0] + (path[i + 1][0] - path[i][0]) * u, path[i][1] + (path[i + 1][1] - path[i][1]) * u, i];
                }

                rem -= segLen[i];
            }

            return [path[path.length - 1][0], path[path.length - 1][1], segLen.length - 1];
        }

        function draw() {

            clear(ctx, 680, 320);

            ctx.fillStyle = "rgba(214,150,60,.55)";
            ctx.fillRect(50, 30, 580, 260);
            txt(ctx, "polyimide film", 130, 50, 13, "rgba(6,10,24,.8)", "center", true);

            const m = mode();
            const w = 4 + state.p / 14;
            const reach = progress * total;

            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = w;
            ctx.strokeStyle = m === "faint" ? "rgba(120,70,30,.55)" : m === "lig" ? "rgba(15,18,28,.98)" : "rgba(6,10,24,1)";

            if (m === "burn") { ctx.setLineDash([2, 0]); ctx.lineWidth = w + 3; }

            ctx.beginPath();
            ctx.moveTo(path[0][0], path[0][1]);

            let used = 0;

            for (let i = 0; i < segLen.length; i++) {

                if (used + segLen[i] <= reach) {

                    ctx.lineTo(path[i + 1][0], path[i + 1][1]);
                    used += segLen[i];

                } else {

                    const u = (reach - used) / segLen[i];

                    ctx.lineTo(path[i][0] + (path[i + 1][0] - path[i][0]) * u, path[i][1] + (path[i + 1][1] - path[i][1]) * u);

                    break;
                }
            }

            ctx.stroke();
            ctx.setLineDash([]);

            if (m === "lig") {

                ctx.strokeStyle = TEAL + ".35)";
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }

            if (!done) {

                const p = pointAt(reach);

                const g = ctx.createRadialGradient(p[0], p[1], 2, p[0], p[1], 26);

                g.addColorStop(0, "rgba(255,80,80,1)");
                g.addColorStop(1, "rgba(255,80,80,0)");
                ctx.fillStyle = g;
                ctx.fillRect(p[0] - 26, p[1] - 26, 52, 52);
                dot(ctx, p[0], p[1], 4, "rgba(255,255,255,1)");
            } else {

                txt(ctx, m === "lig" ? "interleaved graphene electrodes, in minutes" : m === "faint" ? "nothing useful written" : "the pattern is cut apart", 340, 308, 13, GOLD + "1)", "center", true);
            }
        }

        animate(root, function (dt) {

            if (!done) {

                progress = Math.min(1, progress + dt * 0.12);

                if (progress >= 1) { done = true; }
            }

            draw();
        });

        root.querySelector("[data-replay]").addEventListener("click", function () {

            progress = 0;
            done = false;
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 35: GROWING, PLATING, SPINNING
    ====================================== */

    SIMS["supercap-plating"] = function (root) {

        const defaults = { q: 20, kind: "oxide" };
        const state = { q: 20, kind: "oxide" };
        const rand = mulberry(77);
        const parts = [];

        for (let i = 0; i < 50; i++) { parts.push({ x: rand(), y: rand(), v: 0.4 + rand() * 0.6 }); }

        let hit = false;
        let t = 0;

        root.innerHTML =
            head("Try it: plate the active material") +
            canvasFor(root, 680, 320, "A bath containing dissolved precursor ions above a substrate with conductive fingers. When a voltage is applied, a film grows only on the conductive fingers, and the more charge is passed the thicker it gets.") +
            '<div class="fd-stat-row">' + stat("Charge passed", "q") + stat("Film thickness", "th") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Material", "kind", [["oxide", "MnO₂ (oxide)"], ["polymer", "Polyaniline or PEDOT (polymer)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Charge passed", key: "q", min: 0, max: 100, step: 5, value: 20 }) +
            "</div>" +
            '<p class="fd-sim-formula">The film grows only on the conductive surface, and its thickness tracks the charge passed. Metal oxides plate from solution; conducting polymers form by electropolymerization of monomers.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            setVal(root, "q", state.q + " mC/cm²");
            out(root, "q", state.q + " mC/cm²");
            out(root, "th", (state.q * 0.012).toFixed(2) + " µm (illustrative)");
            out(root, "verdict", state.q === 0 ? "Nothing yet: no charge, no film" : "Grows only where the pattern conducts, thicker with more charge");

            if (!hit && state.q >= 80) {

                hit = true;
                F.reward("supercap-plating", 10, "You grew a thick film by passing more charge");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            ctx.fillStyle = BLUE + ".1)";
            ctx.fillRect(40, 20, 600, 190);
            txt(ctx, "bath with dissolved precursor", 160, 44, 13, TEXT + ".7)");

            ctx.fillStyle = GREY + ".45)";
            ctx.fillRect(40, 250, 600, 20);
            txt(ctx, "insulating substrate", 340, 304, 13, TEXT + ".75)");

            const fingers = [110, 250, 390, 530];
            const hh = state.q * 0.45;
            const col = state.kind === "oxide" ? "rgba(150,110,80," : "rgba(90,80,170,";

            fingers.forEach(function (x) {

                ctx.fillStyle = GOLD + ".95)";
                ctx.fillRect(x - 20, 238, 40, 12);

                if (state.q > 0) {

                    ctx.fillStyle = col + ".95)";
                    ctx.fillRect(x - 20 - hh * 0.12, 238 - hh, 40 + hh * 0.24, hh);
                }
            });

            txt(ctx, "gold pattern", 110, 288, 12, GOLD + "1)");

            parts.forEach(function (p) {

                const x = 60 + p.x * 560;
                const base = 30 + ((p.y * 190 + t * 24 * p.v) % 190);

                ctx.fillStyle = (state.kind === "oxide" ? ROSE : PURPLE) + ".85)";
                ctx.beginPath();
                ctx.arc(x, Math.min(base, 230), 3.4, 0, Math.PI * 2);
                ctx.fill();
            });
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


    SIMS["supercap-growroutes"] = quiz(
        "Game: which growth route?",
        ["Hydrothermal", "Chemical bath deposition", "CVD growth", "Filtration or layer-by-layer", "Electrospinning", "Wet spinning"],
        [
            { q: "Heat a solution in a sealed vessel so nanostructures grow on a substrate.", a: "Hydrothermal", why: "Hot, pressurized solution chemistry." },
            { q: "Films precipitate onto a substrate from solution at mild temperature.", a: "Chemical bath deposition", why: "No vacuum, no furnace." },
            { q: "Nanotube forests or graphene grown directly on the current collector.", a: "CVD growth", why: "Direct growth gives binder-free electrodes." },
            { q: "Flakes stack up on a membrane, or alternately charged layers build up by dipping.", a: "Filtration or layer-by-layer", why: "Layers assembled one at a time." },
            { q: "A high-voltage jet turns a polymer solution into a mat of nanofibers.", a: "Electrospinning", why: "Baked afterward to make carbon nanofibers." },
            { q: "A graphene or nanotube dispersion is injected into a bath and solidifies into a fiber.", a: "Wet spinning", why: "A continuous process for continuous devices." }
        ],
        5,
        "supercap-growroutes-done",
        "You know the growth routes",
        "Direct growth gives binder-free electrodes with good contact.",
        "Match each to how the material is built. Hit Reset to try again."
    );


    SIMS["supercap-electrospin"] = stepper({
        title: "Watch: from polymer jet to carbon nanofibers",
        aria: "A high-voltage jet pulls a polymer solution into fibers that collect as a mat. The mat is heated in air and then in inert gas, turning it into a mat of carbon nanofibers.",
        viewBox: "0 0 340 190",
        interval: 3.2,
        rewardKey: "supercap-electrospin",
        rewardMsg: "You followed electrospinning to carbon",
        steps: [
            { t: "1. Spin the polymer", tool: "high voltage", text: "A high voltage pulls a polymer solution into a fine jet that dries into a mat of nanofibers, tens to hundreds of nanometers across." },
            { t: "2. Heat in air", tool: "furnace, air", text: "Heating the mat in stages begins by stabilizing the polymer fibers." },
            { t: "3. Heat in inert gas", tool: "furnace, nitrogen", text: "Further heating in inert gas converts the polymer into carbon." },
            { t: "4. A self-standing electrode", tool: "carbon nanofiber mat", text: "The carbon nanofiber mat can serve as a binder-free, self-standing electrode." }
        ],
        draw: function (step, st) {

            let s = "";
            const a = st.anim || 0;

            if (step === 0) {

                s += rect(30, 20, 30, 40, "rgba(170,179,207,.6)", "rgba(245,247,255,.6)");
                s += label(45, 14, "syringe", 7, "middle", "var(--muted)");
                s += rect(250, 130, 70, 8, "rgba(170,179,207,.7)");
                s += label(285, 150, "collector", 7, "middle", "var(--muted)");

                let d = "M 60 40";

                for (let i = 1; i <= 14; i++) {

                    const x = 60 + i * 14.5;
                    const y = 40 + i * 6.4 + Math.sin(a * 6 + i) * (i * 1.3);

                    d += " L " + x.toFixed(1) + " " + y.toFixed(1);
                }

                s += '<path d="' + d + '" style="fill:none;stroke:#ffd666;stroke-width:1.4"/>';
                s += rect(240, 118, 90, 12, "rgba(255,214,102,.45)");
                s += label(170, 180, "fibers pile up as a mat", 8, "middle", "var(--text)");

            } else {

                const col = step === 1 ? "rgba(214,160,70,.8)" : step === 2 ? "rgba(70,60,60,.95)" : "rgba(25,28,40,1)";

                s += rect(70, 90, 200, 24, col, "rgba(245,247,255,.5)");

                for (let i = 0; i < 12; i++) {

                    const x = 76 + i * 16;

                    s += '<path d="M ' + x + ' 94 q 6 8 0 16" style="fill:none;stroke:rgba(245,247,255,.35);stroke-width:1"/>';
                }

                if (step === 1) { s += label(170, 70, "air, a few hundred °C", 8, "middle", "var(--text)"); }
                if (step === 2) { s += label(170, 70, "inert gas, much hotter: polymer becomes carbon", 8, "middle", "var(--text)"); }
                if (step === 3) { s += label(170, 70, "carbon nanofiber mat", 8, "middle", "var(--accent)"); }
            }

            return s;
        }
    });


    /* ======================================
       UNIT 36: CHOOSING A METHOD
    ====================================== */

    SIMS["supercap-routes"] = priority({
        title: "Try it: which fabrication route fits your goal?",
        aria: "Bars showing how well six fabrication routes fit the goals you set.",
        key: "supercap-routes",
        props: [
            { k: "scale", n: "Low cost at large scale" },
            { k: "prec", n: "Micron precision" },
            { k: "flex", n: "Flexible substrates" },
            { k: "tall", n: "Tall 3D electrodes" },
            { k: "fast", n: "Fast prototyping" }
        ],
        fam: [
            { n: "Slurry casting", c: BLUE, r: { scale: 5, prec: 1, flex: 3, tall: 2, fast: 3 } },
            { n: "Photolithography + pyrolysis", c: TEAL, r: { scale: 2, prec: 5, flex: 1, tall: 5, fast: 1 } },
            { n: "Deposition and etching", c: GOLD, r: { scale: 1, prec: 5, flex: 2, tall: 4, fast: 1 } },
            { n: "Printing", c: ROSE, r: { scale: 4, prec: 2, flex: 5, tall: 3, fast: 5 } },
            { n: "Laser writing", c: GREY, r: { scale: 3, prec: 2, flex: 5, tall: 1, fast: 5 } },
            { n: "Growth and spinning", c: PURPLE, r: { scale: 2, prec: 3, flex: 3, tall: 3, fast: 2 } }
        ],
        foot: "Ratings are rough and relative (1 to 5). No single method wins on everything: the best is the one that produces the geometry you need at a cost you can afford."
    });


    SIMS["supercap-methodpick"] = quiz(
        "Game: pick the method for the goal",
        ["Slurry casting and roll-to-roll", "Photolithography with pyrolysis", "Inkjet, screen printing or laser scribing", "Direct ink writing or 3D lithography", "Wet spinning and dip coating", "Direct growth or electrospinning"],
        [
            { q: "Cheap, large-format cells.", a: "Slurry casting and roll-to-roll", why: "Simple, roll-friendly steps scale easily." },
            { q: "Small, precise, on-chip devices.", a: "Photolithography with pyrolysis", why: "Mask-defined micron features." },
            { q: "Rapid, flexible prototypes.", a: "Inkjet, screen printing or laser scribing", why: "The design lives in software." },
            { q: "Tall electrodes in a small footprint.", a: "Direct ink writing or 3D lithography", why: "Both can build tall features." },
            { q: "Fibers and textiles.", a: "Wet spinning and dip coating", why: "Made the way fibers are made: continuously." },
            { q: "Binder-free electrodes with high area.", a: "Direct growth or electrospinning", why: "The active material grows on the collector." }
        ],
        5,
        "supercap-methodpick-done",
        "You can pick a method for each goal",
        "The best method is the one that produces the geometry you need.",
        "Think about scale, precision, substrate and shape. Hit Reset to try again."
    );


    /* ======================================
       UNIT 37: WHERE SUPERCAPACITORS WIN
    ====================================== */

    SIMS["supercap-vsbattery"] = quiz(
        "Game: supercapacitor or lithium-ion?",
        ["Supercapacitor", "Lithium-ion battery"],
        [
            { q: "Roughly 100 to 250 Wh/kg of energy.", a: "Lithium-ion battery", why: "A supercapacitor is around 5 Wh/kg." },
            { q: "Hundreds of thousands to millions of cycles.", a: "Supercapacitor", why: "A battery manages about a thousand to a few thousand." },
            { q: "Charges in seconds to minutes.", a: "Supercapacitor", why: "A battery takes around an hour." },
            { q: "A charged cell drifts down over days to weeks.", a: "Supercapacitor", why: "Self-discharge is faster." },
            { q: "Power is often ten times higher, or more.", a: "Supercapacitor", why: "Very high power is its strength." },
            { q: "Better for hours of runtime from one charge.", a: "Lithium-ion battery", why: "It stores far more energy per kilogram." }
        ],
        5,
        "supercap-vsbattery-done",
        "You know the scorecard",
        "Batteries win on energy; supercapacitors win on power and lifetime.",
        "Batteries win on energy; supercapacitors win on power, cycles and charge time. Hit Reset to try again."
    );


    SIMS["supercap-duty"] = function (root) {

        const defaults = { le: -1, lp: 1 };
        const state = { le: -1, lp: 1 };
        const seen = {};

        root.innerHTML =
            head("Try it: read the load, not the label") +
            canvasFor(root, 680, 340, "A chart of energy against power with diagonal lines for how long the energy lasts. Short, powerful jobs fall in the supercapacitor zone, long gentle jobs in the battery zone, and the middle calls for a hybrid.") +
            '<div class="fd-stat-row">' + stat("Energy needed", "e") + stat("Power needed", "p") + stat("Runs for", "t") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Energy per event (log scale)", key: "le", min: -3, max: 3, step: 0.25, value: -1 }) +
            slider({ label: "Power while it runs (log scale)", key: "lp", min: -2, max: 5, step: 0.25, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">Ask two questions: how much energy in total, and how fast must it move? Run time = energy ÷ power. Total energy points to batteries; fast, repeated bursts point to supercapacitors.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const L = 70;
        const R = 650;
        const T = 20;
        const B = 285;
        const X = function (lp) { return L + (lp + 2) / 7 * (R - L); };
        const Y = function (le) { return B - (le + 3) / 6 * (B - T); };

        function fmtE(wh) { return wh >= 1000 ? (wh / 1000).toFixed(1) + " kWh" : wh >= 1 ? wh.toFixed(1) + " Wh" : (wh * 1000).toFixed(1) + " mWh"; }
        function fmtP(w) { return w >= 1000 ? (w / 1000).toFixed(1) + " kW" : w >= 1 ? w.toFixed(1) + " W" : (w * 1000).toFixed(1) + " mW"; }

        function info() {

            const E = Math.pow(10, state.le);
            const P = Math.pow(10, state.lp);
            const hours = E / P;

            return { E: E, P: P, h: hours, kind: hours < 1 / 60 ? "sc" : hours > 0.5 ? "bat" : "hyb" };
        }

        function update() {

            const i = info();

            seen[i.kind] = true;
            setVal(root, "le", fmtE(i.E));
            setVal(root, "lp", fmtP(i.P));
            out(root, "e", fmtE(i.E));
            out(root, "p", fmtP(i.P));
            out(root, "t", i.h * 3600 < 60 ? (i.h * 3600).toFixed(1) + " s" : i.h < 1 ? (i.h * 60).toFixed(1) + " min" : i.h.toFixed(1) + " h");
            out(root, "verdict", i.kind === "sc" ? "Short, powerful bursts: a supercapacitor" : i.kind === "bat" ? "Long, gentle draw: a battery" : "In between: a battery with a supercapacitor beside it");

            if (seen.sc && seen.bat && seen.hyb) {
                F.reward("supercap-duty", 10, "You found a job for each storage type");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            // zones: time = E / P  (hours)
            ctx.save();
            ctx.beginPath();
            ctx.rect(L, T, R - L, B - T);
            ctx.clip();

            for (let gx = 0; gx < R - L; gx += 8) {

                for (let gy = 0; gy < B - T; gy += 8) {

                    const lp = (gx / (R - L)) * 7 - 2;
                    const le = ((B - T - gy) / (B - T)) * 6 - 3;
                    const h = Math.pow(10, le - lp);
                    const col = h < 1 / 60 ? TEAL + ".13)" : h > 0.5 ? ROSE + ".13)" : GOLD + ".13)";

                    ctx.fillStyle = col;
                    ctx.fillRect(L + gx, T + gy, 8, 8);
                }
            }

            ctx.restore();

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            txt(ctx, "power (log) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            ctx.save();
            ctx.translate(18, (T + B) / 2);
            ctx.rotate(-Math.PI / 2);
            txt(ctx, "energy (log) →", 0, 0, 13, TEXT + ".85)");
            ctx.restore();

            txt(ctx, "supercapacitor zone", X(3.8), Y(-2.2), 13, TEAL + "1)", "center", true);
            txt(ctx, "battery zone", X(-0.4), Y(2.4), 13, ROSE + "1)", "center", true);
            txt(ctx, "hybrid", X(1.9), Y(0.1), 13, GOLD + "1)", "center", true);

            const i = info();

            dot(ctx, X(state.lp), Y(state.le), 9, "rgba(255,255,255,1)");
            i;
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-cyclecost"] = function (root) {

        const defaults = { c: 5 };
        const state = { c: 5 };
        const BAT_LIFE = 1500;
        const SC_LIFE = 1000000;
        const BAT_PRICE = 1;
        const SC_PRICE = 8;
        const seen = {};

        root.innerHTML =
            head("Try it: cost per cycle, not per kWh") +
            art("0 0 340 190", "Two bars comparing the ten-year cost of keeping a battery and a supercapacitor going for a given number of cycles per day.") +
            '<div class="fd-stat-row">' + stat("Cycles over ten years", "n") + stat("Battery packs needed", "bp") + stat("Supercapacitor packs needed", "sp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Cycles per day", key: "c", min: 1, max: 2000, step: 1, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Illustrative: a battery lasts about 1,500 cycles and costs 1 unit per pack; a supercapacitor pack costs 8 units but lasts about a million cycles. For frequent cycling, lifetime cost beats sticker price.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const total = state.c * 365 * 10;
            const bp = Math.ceil(total / BAT_LIFE);
            const sp = Math.ceil(total / SC_LIFE);
            const bc = bp * BAT_PRICE;
            const sc = sp * SC_PRICE;

            setVal(root, "c", state.c + " per day");
            out(root, "n", total.toLocaleString());
            out(root, "bp", bp.toLocaleString());
            out(root, "sp", sp.toLocaleString());

            seen[bc > sc ? "sc" : "bat"] = true;

            out(root, "verdict", bc > sc ? "Supercapacitor wins: " + bc.toLocaleString() + " vs. " + sc + " units over ten years" : "The battery is cheaper here: " + bc + " vs. " + sc + " units");

            const mx = Math.max(bc, sc, 1);

            svg.innerHTML =
                label(14, 20, "Ten-year cost (units)", 8, "start", "var(--muted)") +
                rect(14, 32, 280, 22, "rgba(170,179,207,.15)") +
                rect(14, 32, Math.max(2, 280 * bc / mx), 22, "rgba(255,105,120,.85)") +
                label(14, 70, "Battery: " + bc.toLocaleString(), 9, "start", "var(--text)") +
                rect(14, 90, 280, 22, "rgba(170,179,207,.15)") +
                rect(14, 90, Math.max(2, 280 * sc / mx), 22, "rgba(84,224,199,.85)") +
                label(14, 128, "Supercapacitor: " + sc.toLocaleString(), 9, "start", "var(--text)") +
                label(14, 170, "the tipping point is a few cycles per day", 7, "start", "var(--muted)");

            if (seen.sc && seen.bat) {
                F.reward("supercap-cyclecost", 10, "You found where lifetime cost flips");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["supercap-winlose"] = quiz(
        "Game: who wins this job?",
        ["Supercapacitor", "Battery", "Both together"],
        [
            { q: "Hours of runtime from a single charge.", a: "Battery", why: "A supercapacitor cannot offer that energy density." },
            { q: "A crane lowering a load: a burst of power for seconds, again and again.", a: "Supercapacitor", why: "Fast, repeated bursts." },
            { q: "A device that sits idle for months between uses.", a: "Battery", why: "Self-discharge leaks a supercapacitor's charge away." },
            { q: "A vehicle that needs lots of range and hard launches.", a: "Both together", why: "A hybrid pack: battery for the miles, supercap for the moments." },
            { q: "Electronics that need a steady voltage as the charge falls.", a: "Battery", why: "A supercapacitor's voltage falls with its charge." },
            { q: "A million charge-discharge cycles over the equipment's life.", a: "Supercapacitor", why: "Cycle life is its strength." }
        ],
        5,
        "supercap-winlose-done",
        "You know when they win and lose",
        "These limits are why hybrids exist.",
        "Supercaps win on bursts and cycles; batteries win on energy and idle time. Hit Reset to try again."
    );


    /* ======================================
       UNIT 38: VEHICLES AND THE GRID
    ====================================== */

    SIMS["supercap-regen"] = function (root) {

        const defaults = { };
        const state = {};
        let t = 0;
        let stops = 0;
        let lastPhase = "";
        let kj = 0;

        root.innerHTML =
            head("Watch: a bus recycling its braking energy") +
            canvasFor(root, 680, 320, "A bus that accelerates, cruises and brakes at a stop. While braking, its energy flows into a supercapacitor bar. While accelerating, the bar empties to help the bus speed up.") +
            '<div class="fd-stat-row">' + stat("Bus speed", "sp") + stat("Stops so far", "st") + stat("Energy recycled", "kj") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            '<p class="fd-sim-formula">When a bus, tram, crane or elevator slows down, its motor can act as a generator. The energy arrives in seconds, too fast and too frequent for many batteries, so a supercapacitor absorbs it and gives it back, stop after stop.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function profile(u) {

            // returns [speed 0..1, phase, charge 0..1]
            if (u < 2.5) { return [u / 2.5, "accelerating", 1 - u / 2.5]; }
            if (u < 6) { return [1, "cruising", 0]; }
            if (u < 8.5) { return [1 - (u - 6) / 2.5, "braking", (u - 6) / 2.5]; }

            return [0, "stopped", 1];
        }

        function draw() {

            clear(ctx, 680, 320);

            const u = t % 10;
            const p = profile(u);

            // road
            ctx.fillStyle = "rgba(60,66,90,.9)";
            ctx.fillRect(0, 210, 680, 40);

            ctx.fillStyle = TEXT + ".6)";

            const off = (t * 220 * p[0]) % 80;

            for (let x = -80; x < 700; x += 80) { ctx.fillRect(x - off + (u > 6 && u < 10 ? 0 : 0), 228, 44, 4); }

            // bus
            const bx = 240;

            ctx.fillStyle = GOLD + ".95)";
            ctx.fillRect(bx, 140, 190, 70);
            ctx.fillStyle = "rgba(11,16,32,.9)";

            for (let k = 0; k < 4; k++) { ctx.fillRect(bx + 14 + k * 44, 152, 32, 22); }

            dot(ctx, bx + 36, 214, 14, "rgba(20,24,38,1)");
            dot(ctx, bx + 152, 214, 14, "rgba(20,24,38,1)");

            // supercapacitor on the roof
            ctx.fillStyle = "rgba(20,24,38,.9)";
            ctx.fillRect(bx + 50, 112, 90, 26);
            ctx.fillStyle = TEAL + ".95)";
            ctx.fillRect(bx + 54, 116, 82 * p[2], 18);
            txt(ctx, "supercapacitor", bx + 95, 104, 12, TEXT + ".8)");

            // energy arrows
            if (p[1] === "braking") {

                ctx.strokeStyle = TEAL + ".95)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(bx + 36, 190); ctx.lineTo(bx + 60, 150); ctx.lineTo(bx + 80, 142);
                ctx.stroke();
                txt(ctx, "energy in ↑", bx + 30, 86, 14, TEAL + "1)", "center", true);

            } else if (p[1] === "accelerating") {

                ctx.strokeStyle = GOLD + ".95)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(bx + 80, 142); ctx.lineTo(bx + 60, 160); ctx.lineTo(bx + 36, 195);
                ctx.stroke();
                txt(ctx, "energy out ↓", bx + 30, 86, 14, GOLD + "1)", "center", true);
            }

            // stop sign
            if (u > 8 || u < 0.3) { txt(ctx, "STOP", 600, 190, 16, ROSE + "1)", "center", true); }

            out(root, "sp", Math.round(p[0] * 50) + " km/h");
            out(root, "st", stops);
            out(root, "kj", kj.toFixed(0) + " kJ");
            out(root, "verdict", p[1] === "braking" ? "Braking: the motor is a generator, charging the supercapacitor" :
                p[1] === "accelerating" ? "Pulling away: the supercapacitor gives the energy back" :
                    p[1] === "cruising" ? "Cruising at steady speed" : "Stopped: charged and ready");

            if (lastPhase === "braking" && p[1] === "stopped") {

                stops++;
                kj += 300;

                if (stops >= 3) { F.reward("supercap-regen", 10, "You watched energy recycled stop after stop"); }
            }

            lastPhase = p[1];
        }

        const anim = animate(root, function (dt) {

            t += dt;
            draw();
        });

        M.bindPause(root, anim);

        root.querySelector("[data-reset]").addEventListener("click", function () {

            t = 0;
            stops = 0;
            kj = 0;
        });

        defaults;
        state;

        draw();
    };


    SIMS["supercap-transport"] = quiz(
        "Game: where would you find one?",
        ["Buses and trams", "Cranes and port equipment", "Elevators", "Start-stop engines", "Motorsport hybrids"],
        [
            { q: "Some vehicles recharge in seconds at stops.", a: "Buses and trams", why: "Short stops are enough for a quick top-up." },
            { q: "Capture energy from lowered loads and smooth engine peaks.", a: "Cranes and port equipment", why: "Lowered loads return energy." },
            { q: "Recover energy on the way down and help starts.", a: "Elevators", why: "Down trips give energy back." },
            { q: "Help crank the engine, especially in cold weather, sparing the battery.", a: "Start-stop engines", why: "A short, strong burst of current." },
            { q: "Deliver short power boosts on demand.", a: "Motorsport hybrids", why: "Quick bursts for overtaking." },
            { q: "Which pattern is always the same?", a: "Buses and trams", why: "Frequent, short, powerful events." }
        ],
        5,
        "supercap-transport-done",
        "You know where they ride",
        "Frequent, short, powerful events.",
        "Anything that stops and starts often. Hit Reset to try again."
    );


    SIMS["supercap-hybridpack"] = function (root) {

        const defaults = { tau: 2 };
        const state = { tau: 2 };
        let t = 0;
        let bat = 15;
        let acc = 0;
        let hit = false;
        const N = 150;
        const bufL = [];
        const bufB = [];

        root.innerHTML =
            head("Try it: let the supercapacitor take the peaks") +
            canvasFor(root, 680, 340, "A scrolling chart of a spiky load. The battery supplies only the smooth average, and the supercapacitor supplies the sharp peaks above and below it.") +
            '<div class="fd-stat-row">' + stat("Peak load", "pl") + stat("Peak the battery sees", "pb") + stat("Battery peak reduced by", "red") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Supercapacitor size (bigger smooths more)", key: "tau", min: 0, max: 10, step: 0.5, value: 2 }) +
            "</div>" +
            '<p class="fd-sim-formula">In a hybrid energy storage system the battery supplies steady energy and the supercapacitor takes the sharp peaks. That shields the battery from harsh current spikes, which can extend its life.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function load(time) {

            const k = time % 4;
            const base = 15 + 6 * Math.sin(time * 0.9);
            const pk = k < 0.5 ? 85 : (k > 2 && k < 2.3) ? 60 : 0;

            return base + pk;
        }

        function update() {

            setVal(root, "tau", state.tau === 0 ? "none" : state.tau.toFixed(1));

            let pl = 0;
            let pb = 0;

            bufL.forEach(function (v) { pl = Math.max(pl, v); });
            bufB.forEach(function (v) { pb = Math.max(pb, v); });

            out(root, "pl", Math.round(pl) + " A");
            out(root, "pb", Math.round(pb) + " A");
            out(root, "red", pl ? Math.round((1 - pb / pl) * 100) + " %" : "0 %");
            out(root, "verdict", state.tau === 0 ? "No supercapacitor: the battery takes every spike" : "The supercapacitor shields the battery from the peaks");

            if (!hit && pl > 50 && pb < pl * 0.45) {

                hit = true;
                F.reward("supercap-hybridpack", 10, "You shielded a battery from current spikes");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const L = 50;
            const R = 650;
            const T = 24;
            const B = 290;
            const X = function (i) { return L + i / (N - 1) * (R - L); };
            const Y = function (v) { return B - v / 110 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            txt(ctx, "current (A)", 66, T - 6, 12, TEXT + ".7)", "start");
            txt(ctx, "time →", (L + R) / 2, B + 32, 13, TEXT + ".8)");

            function line(buf, col, w) {

                ctx.strokeStyle = col;
                ctx.lineWidth = w;
                ctx.beginPath();

                buf.forEach(function (v, i) { if (i === 0) { ctx.moveTo(X(i), Y(v)); } else { ctx.lineTo(X(i), Y(v)); } });

                ctx.stroke();
            }

            // supercapacitor share (load minus battery) as a filled area
            ctx.fillStyle = ROSE + ".25)";
            ctx.beginPath();

            bufL.forEach(function (v, i) { if (i === 0) { ctx.moveTo(X(i), Y(v)); } else { ctx.lineTo(X(i), Y(v)); } });

            for (let i = bufB.length - 1; i >= 0; i--) { ctx.lineTo(X(i), Y(bufB[i])); }

            ctx.closePath();
            ctx.fill();

            line(bufL, GOLD + ".95)", 2);
            line(bufB, TEAL + ".98)", 3);

            txt(ctx, "load", R - 40, Y(bufL[bufL.length - 1] || 0) - 10, 13, GOLD + "1)", "center", true);
            txt(ctx, "battery supplies", 150, B - 30, 13, TEAL + "1)", "center", true);
            txt(ctx, "supercapacitor supplies the shaded part", 400, T + 14, 13, ROSE + "1)", "center", true);
        }

        animate(root, function (dt) {

            acc += dt;

            while (acc >= 0.05) {

                acc -= 0.05;
                t += 0.05;

                const l = load(t);
                const a = state.tau === 0 ? 1 : 1 - Math.exp(-0.05 / state.tau);

                bat += (l - bat) * a;

                bufL.push(l);
                bufB.push(bat);

                if (bufL.length > N) { bufL.shift(); bufB.shift(); }
            }

            update();
            draw();
        });

        wire(root, state, defaults, function () {

            update();
        });

        update();
    };


    SIMS["supercap-gridquiz"] = quiz(
        "Game: which grid job?",
        ["Frequency regulation", "Ride-through", "Uninterruptible power", "Wind turbine blade pitch", "Renewable smoothing"],
        [
            { q: "Absorb or inject power in seconds to keep the grid steady.", a: "Frequency regulation", why: "Fast power in both directions." },
            { q: "Cover a brief voltage sag so equipment does not reset.", a: "Ride-through", why: "A short bridge over the dip." },
            { q: "Bridge the seconds between an outage and a generator starting.", a: "Uninterruptible power", why: "Just long enough for the generator." },
            { q: "Power the systems that turn blades to safety in a fault.", a: "Wind turbine blade pitch", why: "Reliable power for a critical moment." },
            { q: "Even out sudden drops and surges from solar or wind.", a: "Renewable smoothing", why: "Many small jobs, quickly, forever." }
        ],
        5,
        "supercap-gridquiz-done",
        "You know the grid jobs",
        "In every case, storage does many small jobs, quickly, forever.",
        "Think about what happens in the seconds that matter. Hit Reset to try again."
    );


    /* ======================================
       UNIT 39: ELECTRONICS, IOT, HARVESTING
    ====================================== */

    SIMS["supercap-pulse"] = function (root) {

        const defaults = { c: 0 };
        const state = { c: 0 };
        const VB = 3.0;
        const RB = 20;
        const ILOAD = 0.03;
        const ISLEEP = 0.00005;
        const LIMIT = 2.5;
        let t = 0;
        let vc = 3.0;
        const buf = [];
        let minV = 3;
        let hit = false;
        let acc = 0;
        const N = 200;

        root.innerHTML =
            head("Try it: a pulse load on a small cell") +
            canvasFor(root, 680, 340, "The voltage seen by a wireless sensor as it sends a pulse every second or so. Without a supercapacitor, the coin cell's resistance makes the voltage dip below the reset limit during each pulse; with one, the dips are small.") +
            '<div class="fd-stat-row">' + stat("Lowest voltage", "min") + stat("Battery current peak", "ib") + stat("Does the sensor reset?", "rs") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Supercapacitor across the battery", key: "c", min: 0, max: 0.2, step: 0.01, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Peak power comes from the supercapacitor; average power comes from the battery. (Coin cell: 3 V behind 20 Ω; pulses of 30 mA. Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function load(time) { return (time % 1.5) < 0.3 ? ILOAD : ISLEEP; }

        function stepSim(dt) {

            const I = load(t);
            let v;
            let ib;

            if (state.c < 0.005) {

                ib = I;
                v = VB - I * RB;
                vc = v;

            } else {

                ib = (VB - vc) / RB;
                vc += (ib - I) / state.c * dt;
                v = vc;
            }

            t += dt;

            return [v, ib];
        }

        let ibPeak = 0;

        function update() {

            setVal(root, "c", state.c < 0.005 ? "none" : state.c.toFixed(2) + " F");

            minV = 3;
            ibPeak = 0;
            buf.forEach(function (b) { minV = Math.min(minV, b[0]); ibPeak = Math.max(ibPeak, b[1]); });

            const reset = minV < LIMIT;

            out(root, "min", minV.toFixed(2) + " V");
            out(root, "ib", (ibPeak * 1000).toFixed(0) + " mA");
            out(root, "rs", reset ? "yes: below " + LIMIT + " V" : "no");
            out(root, "verdict", reset ? "The cell cannot hold up under the pulse" : "The supercapacitor supplies the burst; the cell sees a gentle average");

            if (!hit && state.c >= 0.05 && !reset && buf.length > 80) {

                hit = true;
                F.reward("supercap-pulse", 10, "You kept a pulse-loaded sensor alive");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 290;
            const Y = function (v) { return B - (v - 2) / 1.2 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [2, 2.5, 3].forEach(function (v) { txt(ctx, v.toFixed(1) + " V", L - 26, Y(v) + 4, 12, TEXT + ".7)"); });
            txt(ctx, "time →", (L + R) / 2, B + 34, 13, TEXT + ".8)");

            ctx.strokeStyle = ROSE + ".8)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y(LIMIT)); ctx.lineTo(R, Y(LIMIT));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "sensor resets below this", R - 90, Y(LIMIT) + 18, 12, ROSE + "1)");

            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 2.6;
            ctx.beginPath();

            buf.forEach(function (b, i) {

                const x = L + i / (N - 1) * (R - L);
                const y = Y(clamp(b[0], 2, 3.2));

                if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            });

            ctx.stroke();
        }

        animate(root, function (dt) {

            acc += dt;

            while (acc >= 0.02) {

                acc -= 0.02;
                buf.push(stepSim(0.02));

                if (buf.length > N) { buf.shift(); }
            }

            update();
            draw();
        });

        wire(root, state, defaults, function () {

            vc = VB;
            buf.length = 0;
            update();
        });

        update();
    };


    SIMS["supercap-everyday"] = quiz(
        "Game: which gadget job?",
        ["Memory and clock backup", "Power-loss protection", "Camera flash and LED bursts", "Smart meters and trackers", "Power tools and toys"],
        [
            { q: "Keep settings alive through a short power loss.", a: "Memory and clock backup", why: "A tiny, long-lasting store." },
            { q: "Give drives and servers a moment to finish writing data.", a: "Power-loss protection", why: "Just enough time to save safely." },
            { q: "Dump charge quickly into a bright pulse.", a: "Camera flash and LED bursts", why: "A fast, big burst." },
            { q: "Supply radio bursts while a small cell trickles in energy.", a: "Smart meters and trackers", why: "The supercapacitor handles the bursts." },
            { q: "Recharge in seconds for a short burst of use.", a: "Power tools and toys", why: "Quick recharge, short use." }
        ],
        5,
        "supercap-everyday-done",
        "You know the everyday uses",
        "Whenever a device needs a quick burst, a supercapacitor is a candidate.",
        "Think about the burst each one needs. Hit Reset to try again."
    );


    SIMS["supercap-harvest"] = function (root) {

        const defaults = { p: 100, leak: 5 };
        const state = { p: 100, leak: 5 };
        const C = 0.01; // F
        const VLO = 2.2;
        const VHI = 3.0;
        const SPEED = 40;
        let v = VLO;
        let t = 0;
        let sends = 0;
        let lastSend = 0;
        let gap = null;
        const buf = [];
        const N = 220;
        let acc = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: a sensor that lives on a trickle") +
            canvasFor(root, 680, 340, "The voltage across a supercapacitor charged by a small energy harvester. When it reaches the upper voltage the sensor node wakes, sends a burst and the voltage drops back, then it charges again. Leakage slows it down.") +
            '<div class="fd-stat-row">' + stat("Messages sent", "n") + stat("Time between messages", "gap") + stat("Net power into storage", "net") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Harvested power", key: "p", min: 5, max: 500, step: 5, value: 100 }) +
            slider({ label: "Leakage current of the supercapacitor", key: "leak", min: 0, max: 80, step: 1, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">A 10 mF supercapacitor swings between 2.2 V and 3.0 V, and each burst uses about 20 mJ. For harvesters, leakage matters as much as capacitance. (Time is sped up 40×; values illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function netW(volt) { return (state.p - state.leak * volt) * 1e-6; }

        function update() {

            setVal(root, "p", state.p + " µW");
            setVal(root, "leak", state.leak + " µA");

            const net = netW(2.6) * 1e6;

            out(root, "n", sends);
            out(root, "gap", gap === null ? (net > 0 ? "measuring…" : "never") : (gap / 60).toFixed(1) + " min");
            out(root, "net", net.toFixed(0) + " µW");
            out(root, "verdict", net <= 0 ? "Leakage eats the whole harvest: the node never wakes" : net < 30 ? "A slow trickle: long waits between messages" : "A healthy trickle: regular messages");

            if (!hit && sends >= 4 && net > 0) {

                hit = true;
                F.reward("supercap-harvest", 10, "You kept a sensor node alive on harvested energy");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 290;
            const Y = function (x) { return B - (x - 2) / 1.2 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [2.2, 2.6, 3].forEach(function (x) { txt(ctx, x.toFixed(1) + " V", L - 26, Y(x) + 4, 12, TEXT + ".7)"); });
            txt(ctx, "time →", (L + R) / 2, B + 34, 13, TEXT + ".8)");

            ctx.strokeStyle = GOLD + ".7)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y(VHI)); ctx.lineTo(R, Y(VHI));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "wake and send at 3.0 V", R - 90, Y(VHI) + 16, 12, GOLD + "1)");

            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 2.6;
            ctx.beginPath();

            buf.forEach(function (b, i) {

                const x = L + i / (N - 1) * (R - L);

                if (i === 0) { ctx.moveTo(x, Y(b[0])); } else { ctx.lineTo(x, Y(b[0])); }
            });

            ctx.stroke();

            buf.forEach(function (b, i) {

                if (b[1]) {

                    const x = L + i / (N - 1) * (R - L);

                    txt(ctx, "📡", x, Y(VHI) - 8, 16, TEXT + ".95)");
                }
            });
        }

        animate(root, function (dt) {

            acc += dt;

            while (acc >= 0.05) {

                acc -= 0.05;

                const h = 0.05 * SPEED;
                let sent = 0;

                const e0 = 0.5 * C * v * v + netW(v) * h;

                v = Math.sqrt(Math.max(0, 2 * e0 / C));

                if (v >= VHI) {

                    v = VLO;
                    sends++;
                    sent = 1;
                    gap = (t - lastSend) || null;
                    lastSend = t;
                }

                t += h;

                buf.push([v, sent]);

                if (buf.length > N) { buf.shift(); }
            }

            update();
            draw();
        });

        wire(root, state, defaults, function () {

            v = VLO;
            sends = 0;
            gap = null;
            buf.length = 0;
            lastSend = t;
            update();
        });

        update();
    };


    SIMS["supercap-onchip"] = quiz(
        "Game: harvesting and on-chip power",
        ["Low leakage", "Cold start", "Right voltage", "Small footprint"],
        [
            { q: "A tiny harvest is easily lost to self-discharge.", a: "Low leakage", why: "Leakage matters as much as capacitance." },
            { q: "It must fill up from empty when the source returns.", a: "Cold start", why: "The node has to restart from nothing." },
            { q: "A range wide enough for the electronics, or a converter to step it.", a: "Right voltage", why: "Voltage falls with the charge." },
            { q: "Micro-supercapacitors can sit on the same chip as the harvester and sensor.", a: "Small footprint", why: "On-chip storage saves space." }
        ],
        4,
        "supercap-onchip-done",
        "You know what harvesters demand of storage",
        "Leakage, cold start, voltage range and footprint.",
        "Four demands for harvesting storage. Hit Reset to try again."
    );


    /* ======================================
       UNIT 40: SIZING
    ====================================== */

    SIMS["supercap-sizecalc"] = function (root) {

        const defaults = { e: 6, v1: 3.3, v2: 2.0, m: 0 };
        const state = { e: 6, v1: 3.3, v2: 2.0, m: 0 };
        let hit = false;

        root.innerHTML =
            head("Try it: C = 2E ÷ (V₁² − V₂²)") +
            art("0 0 340 190", "A tank whose upper part between the cutoff voltage and the full voltage is the usable energy, and whose lower part below the cutoff is energy you cannot use.") +
            '<div class="fd-stat-row">' + stat("Capacitance needed", "c") + stat("Energy still stuck below the cutoff", "stuck") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Margin for aging and leakage", "m", [[0, "None"], [20, "+20 %"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Energy the burst needs", key: "e", min: 1, max: 50, step: 1, value: 6 }) +
            slider({ label: "Full voltage V₁", key: "v1", min: 2, max: 5.5, step: 0.1, value: 3.3 }) +
            slider({ label: "Lowest usable voltage V₂", key: "v2", min: 0.5, max: 4, step: 0.1, value: 2.0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Example from the lesson: 6 mJ, from 3.3 V down to 2.0 V, needs 0.012 ÷ 6.89 ≈ 1.7 mF. Real designs add margin, since end of life is often a 20 % capacitance loss.</p>';

        const svg = root.querySelector("svg");

        function update() {

            setVal(root, "e", state.e + " mJ");
            setVal(root, "v1", state.v1.toFixed(1) + " V");
            setVal(root, "v2", state.v2.toFixed(1) + " V");

            if (state.v2 >= state.v1 - 0.2) {

                out(root, "c", "n/a");
                out(root, "stuck", "n/a");
                out(root, "verdict", "V₂ must be lower than V₁");
                svg.innerHTML = "";

                return;
            }

            const c = 2 * state.e / 1000 / (state.v1 * state.v1 - state.v2 * state.v2) * (1 + state.m / 100);
            const stuck = state.v2 * state.v2 / (state.v1 * state.v1);

            out(root, "c", c >= 1 ? c.toFixed(2) + " F" : (c * 1000).toFixed(2) + " mF");
            out(root, "stuck", Math.round(stuck * 100) + " % of the total");
            out(root, "verdict", state.m ? "Includes 20 % margin for aging and leakage" : "The bare minimum: add margin before choosing a part");

            const y2 = 170 - stuck * 140;

            svg.innerHTML =
                rect(110, 30, 120, 140, "rgba(170,179,207,.12)", "rgba(170,179,207,.45)") +
                rect(110, 30, 120, y2 - 30, "rgba(84,224,199,.7)") +
                rect(110, y2, 120, 170 - y2, "rgba(255,105,120,.35)") +
                label(170, 24, "full: " + state.v1.toFixed(1) + " V", 8, "middle", "var(--text)") +
                label(170, 100 - (140 - stuck * 140) / 2 + 40 * 0, "usable", 9, "middle", "#04201b") +
                label(170, (y2 + 170) / 2 + 3, "stuck below cutoff", 7.5, "middle", "var(--text)") +
                label(240, y2 + 3, "cutoff " + state.v2.toFixed(1) + " V", 7.5, "start", "var(--muted)");

            if (!hit && Math.abs(state.e - 6) < 0.5 && Math.abs(state.v1 - 3.3) < 0.05 && Math.abs(state.v2 - 2.0) < 0.05) {

                hit = true;
                F.reward("supercap-sizecalc", 10, "You reproduced the lesson's sizing example");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["supercap-holdup"] = function (root) {

        const defaults = { c: 1, i: 0.5, v1: 5, v2: 3, kind: "cc" };
        const state = { c: 1, i: 0.5, v1: 5, v2: 3, kind: "cc" };
        let hit = false;

        root.innerHTML =
            head("Try it: how long can it carry a load?") +
            art("0 0 340 190", "A chart of voltage falling over time as a supercapacitor supplies a load, either as a straight line for constant current or curving down faster for constant power.") +
            '<div class="fd-stat-row">' + stat("Hold-up time", "t") + stat("The lesson's example (1 F, 0.5 A, 5 V to 3 V)", "ex") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Load", "kind", [["cc", "Constant current"], ["cp", "Constant power"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Capacitance", key: "c", min: 0.1, max: 5, step: 0.1, value: 1 }) +
            slider({ label: "Load current (at the start)", key: "i", min: 0.1, max: 2, step: 0.1, value: 0.5 }) +
            slider({ label: "Full voltage V₁", key: "v1", min: 3, max: 5.5, step: 0.1, value: 5 }) +
            slider({ label: "Cutoff voltage V₂", key: "v2", min: 1, max: 4, step: 0.1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">Constant current: t = C(V₁ − V₂) ÷ I, a straight-line fall. A constant-power load draws more current as the voltage falls, so it drains faster.</p>';

        const svg = root.querySelector("svg");

        function hold(s) {

            if (s.kind === "cc") { return s.c * (s.v1 - s.v2) / s.i; }

            const P = s.i * s.v1;

            return s.c * (s.v1 * s.v1 - s.v2 * s.v2) / (2 * P);
        }

        function update() {

            if (state.v2 >= state.v1 - 0.2) {

                out(root, "t", "n/a");
                out(root, "ex", "4 s (constant current)");
                out(root, "verdict", "V₂ must be lower than V₁");
                svg.innerHTML = "";

                return;
            }

            setVal(root, "c", state.c.toFixed(1) + " F");
            setVal(root, "i", state.i.toFixed(1) + " A");
            setVal(root, "v1", state.v1.toFixed(1) + " V");
            setVal(root, "v2", state.v2.toFixed(1) + " V");

            const t = hold(state);

            out(root, "t", t.toFixed(1) + " s");
            out(root, "ex", "4 s (constant current)");
            out(root, "verdict", state.kind === "cc" ? "Straight-line fall: " + t.toFixed(1) + " s until the cutoff" : "Constant power: shorter than constant current at the same start");

            const pts = [];
            const n = 40;

            for (let k = 0; k <= n; k++) {

                const tt = t * k / n;
                let v;

                if (state.kind === "cc") {

                    v = state.v1 - state.i * tt / state.c;

                } else {

                    const P = state.i * state.v1;

                    v = Math.sqrt(Math.max(state.v2 * state.v2, state.v1 * state.v1 - 2 * P * tt / state.c));
                }

                pts.push([40 + k / n * 260, 40 + (state.v1 - v) / Math.max(0.5, state.v1 - 0) * 120 * 0.9]);
            }

            svg.innerHTML =
                rect(40, 30, 260, 130, "rgba(6,10,24,.55)", "rgba(170,179,207,.35)") +
                '<polyline points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" style="fill:none;stroke:#54e0c7;stroke-width:2"/>' +
                label(40, 22, state.v1.toFixed(1) + " V at the start", 7, "start", "var(--muted)") +
                label(300, 176, "time → " + t.toFixed(1) + " s", 7.5, "end", "var(--text)") +
                label(46, 28 + 150 * 0, "", 7, "start", "var(--muted)");

            if (!hit && state.kind === "cc" && Math.abs(t - 4) < 0.05 && state.c === 1 && state.i === 0.5) {

                hit = true;
                F.reward("supercap-holdup", 10, "You reproduced the 4-second hold-up example");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["supercap-esrdrop"] = function (root) {

        const defaults = { i: 2, esr: 0.1, v1: 3.0, cut: 2.7 };
        const state = { i: 2, esr: 0.1, v1: 3.0, cut: 2.7 };
        const seen = {};

        root.innerHTML =
            head("Try it: the drop that happens instantly") +
            art("0 0 340 190", "A bar for the full voltage with a slice cut off by the instant ESR drop, and a line marking the cutoff voltage. If the drop takes the voltage below the cutoff, the load trips.") +
            '<div class="fd-stat-row">' + stat("Instant drop (I × ESR)", "d") + stat("Heat wasted (I² × ESR)", "h") + stat("Voltage right after switch-on", "vn") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Pulse current", key: "i", min: 0.1, max: 5, step: 0.1, value: 2 }) +
            slider({ label: "ESR", key: "esr", min: 0.01, max: 0.5, step: 0.01, value: 0.1 }) +
            slider({ label: "Cutoff voltage of the load", key: "cut", min: 1.5, max: 3, step: 0.1, value: 2.7 }) +
            "</div>" +
            '<p class="fd-sim-formula">When a load switches on, the voltage drops at once by I × ESR, before the capacitance has even begun to discharge. Example: a 2 A pulse through 0.1 Ω drops 0.2 V and wastes 0.4 W as heat.</p>';

        const svg = root.querySelector("svg");

        function update() {

            setVal(root, "i", state.i.toFixed(1) + " A");
            setVal(root, "esr", state.esr.toFixed(2) + " Ω");
            setVal(root, "cut", state.cut.toFixed(1) + " V");

            const drop = state.i * state.esr;
            const heat = state.i * state.i * state.esr;
            const vn = state.v1 - drop;
            const trips = vn < state.cut;

            seen[trips ? "trip" : "ok"] = true;

            out(root, "d", drop.toFixed(2) + " V");
            out(root, "h", heat.toFixed(2) + " W");
            out(root, "vn", vn.toFixed(2) + " V");
            out(root, "verdict", trips ? "The drop alone takes the voltage below the cutoff: the load trips" : "The drop is survivable: the voltage stays above the cutoff");

            const Y = function (v) { return 170 - (v - 1) / 2.5 * 140; };

            svg.innerHTML =
                rect(60, Y(state.v1), 70, Y(vn) - Y(state.v1) + 0.0001, "rgba(255,105,120,.6)", "rgba(255,105,120,.95)") +
                rect(60, Y(vn), 70, 170 - Y(vn), "rgba(84,224,199,.7)") +
                label(95, Y(state.v1) - 5, state.v1.toFixed(1) + " V", 8, "middle", "var(--text)") +
                label(150, (Y(state.v1) + Y(vn)) / 2 + 3, "drop " + drop.toFixed(2) + " V", 8, "start", "#ff6978") +
                '<line x1="40" y1="' + Y(state.cut) + '" x2="300" y2="' + Y(state.cut) + '" style="stroke:#ffd666;stroke-width:1.4;stroke-dasharray:5 4"/>' +
                label(300, Y(state.cut) - 4, "cutoff " + state.cut.toFixed(1) + " V", 7.5, "end", "#ffd666");

            if (seen.trip && seen.ok) {
                F.reward("supercap-esrdrop", 10, "You found both a safe and a tripping ESR drop");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["supercap-sizecheck"] = quiz(
        "Game: which check catches it?",
        ["Voltage range", "Load profile", "Usable energy plus margin", "ESR drop and heating", "Life and temperature", "Series stacks"],
        [
            { q: "The highest safe voltage and the lowest voltage the electronics can use.", a: "Voltage range", why: "These set the usable swing." },
            { q: "Peak current, how long it lasts, and constant current or constant power.", a: "Load profile", why: "The load decides hold-up and drop." },
            { q: "½C(V₁² − V₂²), plus allowance for aging and leakage.", a: "Usable energy plus margin", why: "Sizing is arithmetic plus margin." },
            { q: "A pulse that instantly pulls the voltage close to the cutoff.", a: "ESR drop and heating", why: "The drop is I × ESR, and heat is I² × ESR." },
            { q: "Capacitance falling over years in a hot environment.", a: "Life and temperature", why: "Derate for aging and the real environment." },
            { q: "Cells in a string must be balanced so none exceeds its rated voltage.", a: "Series stacks", why: "Otherwise one cell can be pushed past its limit." }
        ],
        5,
        "supercap-sizecheck-done",
        "You know the sizing checklist",
        "Sizing is arithmetic plus margin.",
        "Check the voltage range, the load, the energy, the ESR, the life and the stack. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="supercap-"]').forEach(F.mount);

})();
