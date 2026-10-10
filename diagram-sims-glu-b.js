/* ========================================
   GLUCOSE SENSORS: INTERACTIVE SIMULATORS, PART 2

   Unit 7: three generations of sensors.
   Unit 8: membranes: the layer stack, oxygen, interference, fouling.
   Unit 9: drift, calibration, MARD, error grids.
   Unit 10: anatomy of a CGM: alerts and the signal chain.
   Unit 11: Dexcom chemistry, warm-up, the algorithm.
   Unit 12: Abbott FreeStyle Libre.

   Registers on window.FabInteract; loaded by diagram-sims-glu.js.
   Teaching models: numbers and shapes are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers || !F.gluHelpers) {
        return;
    }

    const M = F.memsHelpers;
    const H = F.gluHelpers;
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
    const PURPLE = H.PURPLE;
    const canvasFor = H.canvasFor;
    const clear = H.clear;
    const txt = H.txt;
    const dot = H.dot;
    const arrow = H.arrow;
    const daily = H.daily;
    const bump = H.bump;


    /* ======================================
       UNIT 7: THREE GENERATIONS OF SENSORS
    ====================================== */

    SIMS["glu-gens"] = function (root) {

        const defaults = { gen: 1 };
        const state = { gen: 1 };
        const seen = {};
        let t = 0;

        root.innerHTML =
            head("Try it: how do the electrons get out?") +
            canvasFor(680, 320, "An enzyme on the left and an electrode on the right. In a first-generation sensor oxygen takes the electrons and becomes hydrogen peroxide, which drifts to the electrode. In a second-generation sensor a mediator molecule shuttles the electrons across. In a third-generation sensor the electrons go straight to the electrode.") +
            '<div class="fd-stat-row">' + stat("Go-between", "gb") + stat("Voltage needed", "v") + stat("Depends on oxygen?", "o") + stat("Other molecules can interfere?", "i") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Generation", "gen", [[1, "1st: oxygen"], [2, "2nd: a mediator"], [3, "3rd: direct"]]) +
            '<p class="fd-sim-formula">The part of glucose oxidase that handles electrons is buried deep inside the protein, so electrons cannot simply hop to a nearby electrode. Every sensor design is an answer to the question: how do the electrons get out? Direct electron transfer is the long-term goal, not yet the commercial standard.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const info = {
            1: ["oxygen (makes H₂O₂)", "about +0.6 V (high)", "yes, strongly", "more", "Oxygen takes the electrons; the electrode oxidizes the peroxide"],
            2: ["a mediator (such as an osmium complex)", "low", "much less", "less", "A mediator shuttles the electrons: lower voltage, less oxygen dependence"],
            3: ["nothing: direct transfer", "low", "no", "less", "Elegant, but difficult with glucose oxidase: still research"]
        };

        function update() {

            const k = info[state.gen];

            seen[state.gen] = true;
            out(root, "gb", k[0]);
            out(root, "v", k[1]);
            out(root, "o", k[2]);
            out(root, "i", k[3]);
            out(root, "verdict", k[4]);

            if (Object.keys(seen).length >= 3) {
                F.reward("glu-gens", 10, "You compared all three generations");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            // enzyme and electrode
            ctx.fillStyle = PURPLE + ".5)";
            ctx.beginPath();
            ctx.arc(130, 160, 80, 0, Math.PI * 2);
            ctx.fill();
            txt(ctx, "enzyme", 130, 100, 13, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = GOLD + ".9)";
            ctx.fillRect(130 - 25, 150, 50, 24);
            txt(ctx, "FAD", 130, 167, 11, "rgba(6,10,24,.95)", "center", true);

            ctx.fillStyle = GREY + ".85)";
            ctx.fillRect(530, 60, 40, 200);
            txt(ctx, "electrode", 550, 280, 13, TEXT + ".85)");

            ctx.strokeStyle = TEXT + ".6)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(570, 90); ctx.lineTo(630, 90); ctx.lineTo(630, 230); ctx.lineTo(570, 230);
            ctx.stroke();
            txt(ctx, "current", 630, 164, 11, BLUE + "1)", "start");

            const u = (t * 0.28) % 1;

            if (state.gen === 1) {

                // oxygen picks up the electrons and becomes H2O2, which drifts to the electrode
                txt(ctx, "O₂ in", 215, 120, 12, ROSE + "1)");
                dot(ctx, 215 + u * 30, 150 - u * 20, 9, ROSE + ".95)");

                const x = 210 + Math.max(0, (u - 0.25) / 0.75) * 300;

                if (u > 0.25 && u < 1) {

                    dot(ctx, x, 160 + Math.sin(u * 10) * 10, 12, GOLD + ".98)");
                    txt(ctx, "H₂O₂", x, 164 + Math.sin(u * 10) * 10, 8, "rgba(6,10,24,.95)", "center", true);
                }

                if (u > 0.95) { ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fillRect(525, 60, 50, 200); }

                txt(ctx, "peroxide drifts across, and is oxidized at +0.6 V", 340, 40, 13, TEXT + ".8)");

            } else if (state.gen === 2) {

                // mediators carry electrons back and forth
                for (let i = 0; i < 3; i++) {

                    const p = ((t * 0.3 + i / 3) % 1);
                    const going = p < 0.5;
                    const x = going ? 215 + (p / 0.5) * 300 : 515 - ((p - 0.5) / 0.5) * 300;

                    dot(ctx, x, 140 + i * 22, 11, going ? TEAL + ".98)" : "rgba(170,179,207,.7)");
                    ctx.strokeStyle = going ? TEAL + ".98)" : "rgba(170,179,207,.7)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, 140 + i * 22, 11, 0, Math.PI * 2);
                    ctx.stroke();

                    if (going) { dot(ctx, x, 140 + i * 22, 4, BLUE + "1)"); }
                }

                txt(ctx, "mediators (e.g. osmium) shuttle electrons to the electrode", 340, 40, 13, TEXT + ".8)");
                txt(ctx, "● carrying an electron   ○ returning empty", 340, 300, 12, TEXT + ".7)");

            } else {

                // electrons jump straight across
                for (let i = 0; i < 5; i++) {

                    const p = ((t * 0.5 + i / 5) % 1);

                    dot(ctx, 210 + p * 320, 160 + Math.sin(p * 12 + i) * 5, 4.2, BLUE + ".98)");
                }

                ctx.strokeStyle = BLUE + ".4)";
                ctx.setLineDash([4, 5]);
                ctx.beginPath();
                ctx.moveTo(180, 162); ctx.lineTo(530, 162);
                ctx.stroke();
                ctx.setLineDash([]);

                txt(ctx, "no oxygen, no mediator: electrons go straight to the electrode", 340, 40, 13, TEXT + ".8)");
            }
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-gencompare"] = quiz(
        "Game: which generation?",
        ["First generation", "Second generation", "Third generation"],
        [
            { q: "Oxygen takes the electrons, making hydrogen peroxide, and the electrode oxidizes that peroxide.", a: "First generation", why: "Simple, but oxygen-dependent." },
            { q: "A small redox molecule such as an osmium complex shuttles electrons from the enzyme to the electrode.", a: "Second generation", why: "A mediator replaces oxygen." },
            { q: "The enzyme passes electrons straight to the electrode, with no oxygen and no mediator.", a: "Third generation", why: "Elegant, but hard with glucose oxidase." },
            { q: "Works at a lower voltage and depends much less on oxygen.", a: "Second generation", why: "Less interference too." },
            { q: "Dexcom: peroxide detected at platinum.", a: "First generation", why: "A first-generation, peroxide-detecting design." },
            { q: "An active area of research, often using nanomaterials.", a: "Third generation", why: "Not yet the commercial standard." }
        ],
        5,
        "glu-gencompare-done",
        "You know the three generations",
        "Each generation trades simplicity against oxygen independence and interference.",
        "First: oxygen. Second: mediator. Third: direct. Hit Reset to try again."
    );


    /* ======================================
       UNIT 8: MEMBRANES
    ====================================== */

    SIMS["glu-stack"] = function (root) {

        const layers = [
            { id: "bio", n: "Biocompatible outer coating", c: ROSE, job: "Soft and friendly to tissue: it reduces the body's reaction and the build-up of proteins." },
            { id: "lim", n: "Glucose-limiting membrane", c: BLUE, job: "Lets oxygen pass more easily than glucose, so glucose is the limiting reagent and the signal tracks glucose, not oxygen." },
            { id: "enz", n: "Enzyme layer", c: PURPLE, job: "Glucose oxidase: reacts with glucose and makes hydrogen peroxide." },
            { id: "int", n: "Selective inner layer", c: GOLD, job: "Blocks acetaminophen, vitamin C and uric acid while letting small signal molecules through." },
            { id: "ele", n: "Platinum electrode", c: GREY, job: "Oxidizes the hydrogen peroxide and carries the current to the electronics." }
        ];
        const state = { sel: null };
        const seen = {};

        root.innerHTML =
            head("Try it: tap a layer to see its job") +
            art("0 0 340 220", "A cross-section of a glucose sensor showing the stack of thin layers, from the outer biocompatible coating down to the platinum electrode. Tap a layer in the list to highlight it and read its job.") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="name"></div></div>' +
            '<p class="fd-sim-note" data-out="job"></p>' +
            '<div class="fd-q-options" data-list></div>' +
            '<p class="fd-sim-formula">A working sensor is not just an electrode with an enzyme on it. It is a stack of thin layers, each solving a different problem. Much of a sensor\'s performance comes from its membranes, not just its chemistry.</p>';

        const svg = root.querySelector("svg");
        const list = root.querySelector("[data-list]");

        list.innerHTML = layers.map(function (l) { return '<button type="button" data-l="' + l.id + '">' + l.n + "</button>"; }).join("");

        function update() {

            let s = label(170, 14, "tissue fluid (glucose, oxygen and others arrive from here)", 6.5, "middle", "var(--muted)");

            layers.forEach(function (l, i) {

                const y = 26 + i * 36;
                const on = state.sel === l.id;

                s += rect(40, y, 260, 32, l.c + (on ? ".95)" : ".35)"), on ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.2)");
                s += label(170, y + 20, l.n, 8, "middle", on ? "#04201b" : "var(--text)");
            });

            // arrows for molecules entering
            s += '<path d="M 20 30 L 20 200" style="stroke:rgba(255,214,102,.7);stroke-width:1.5;fill:none;stroke-dasharray:3 3"/>';
            s += label(14, 210, "signal travels inward", 6, "start", "var(--muted)");

            svg.innerHTML = s;

            const sel = layers.filter(function (l) { return l.id === state.sel; })[0];

            out(root, "name", sel ? sel.n : "Choose a layer");
            out(root, "job", sel ? sel.job : "Each layer solves a different problem.");

            if (Object.keys(seen).length >= layers.length) {
                F.reward("glu-stack", 10, "You looked at every layer of the stack");
            }
        }

        list.querySelectorAll("button").forEach(function (b) {

            b.addEventListener("click", function () {

                state.sel = b.dataset.l;
                seen[b.dataset.l] = true;
                update();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.sel = null;
            update();
        });

        update();
    };


    SIMS["glu-oxygen"] = function (root) {

        const defaults = { r: 150, g: 90 };
        const state = { r: 150, g: 90 };
        const O2 = 0.08; // mM
        let hit = false;

        root.innerHTML =
            head("Try it: too much glucose, too little oxygen") +
            canvasFor(680, 320, "A plot of sensor current against glucose for a sensor with no outer membrane and for one whose outer membrane lets oxygen through much more easily than glucose. Without the membrane the current stops tracking glucose; with it the response stays a straight line over a useful range.") +
            '<div class="fd-stat-row">' + stat("Glucose", "g") + stat("Oxygen in tissue", "o") + stat("The signal tracks glucose?", "t") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How much easier oxygen passes the outer membrane than glucose", key: "r", min: 1, max: 500, step: 1, value: 150 }) +
            slider({ label: "Glucose in the tissue", key: "g", min: 40, max: 450, step: 5, value: 90 }) +
            "</div>" +
            '<p class="fd-sim-formula">At 90 mg/dL, glucose is about 5 mM, but tissue oxygen is only around 0.05 to 0.1 mM. A first-generation sensor would run out of oxygen before glucose, and its signal would stop tracking glucose. An outer membrane that lets oxygen pass more easily than glucose makes glucose the limiting reagent. (Simplified model.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function cur(gmg, r) {

            const G = gmg / 18 / r;

            return G * O2 / (G + O2);
        }

        function update() {

            const Ge = state.g / 18 / state.r;

            setVal(root, "r", state.r + "×");
            setVal(root, "g", state.g + " mg/dL");
            out(root, "g", (state.g / 18).toFixed(1) + " mM");
            out(root, "o", O2 + " mM");
            out(root, "t", Ge < O2 * 0.3 ? "yes: glucose is the limit" : Ge < O2 * 1.2 ? "partly" : "no: oxygen is the limit");
            out(root, "verdict", Ge < O2 * 0.3 ? "The outer membrane makes sure the signal depends on glucose, not oxygen" : Ge < O2 * 1.2 ? "Starting to run short of oxygen" : "Oxygen has run out: the signal has stopped following glucose");

            if (!hit && state.r >= 100 && Ge < O2 * 0.3 && state.g >= 300) {

                hit = true;
                F.reward("glu-oxygen", 10, "You kept a sensor oxygen-proof at high glucose");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (g) { return L + (g - 40) / 410 * (R - L); };
            const Y = function (i) { return B - i / 0.085 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [100, 200, 300, 400].forEach(function (g) { txt(ctx, g, X(g), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "glucose (mg/dL) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "sensor current ↑", L + 70, T + 4, 12, TEXT + ".75)");

            [[1, GREY, "no outer membrane"], [state.r, TEAL, "with the outer membrane"]].forEach(function (c) {

                ctx.strokeStyle = c[1] + ".98)";
                ctx.lineWidth = c[0] === 1 ? 2.2 : 3.4;
                ctx.beginPath();

                for (let g = 40; g <= 450; g += 5) {

                    const y = Y(cur(g, c[0]));

                    if (g === 40) { ctx.moveTo(X(g), y); } else { ctx.lineTo(X(g), y); }
                }

                ctx.stroke();
            });

            txt(ctx, "no outer membrane: flat", X(300), Y(cur(300, 1)) - 12, 12, GREY + "1)", "center", true);
            txt(ctx, "with membrane", X(300), Y(cur(300, state.r)) + 22, 12, TEAL + "1)", "center", true);

            dot(ctx, X(state.g), Y(cur(state.g, state.r)), 8, GOLD + "1)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-interfere"] = function (root) {

        const defaults = { apap: 0, vitc: 0, urate: 0, layer: "off" };
        const state = { apap: 0, vitc: 0, urate: 0, layer: "off" };
        const seen = {};
        const TRUE = 100;

        root.innerHTML =
            head("Try it: other molecules can fool a sensor") +
            art("0 0 340 190", "A bar for the reading when the true glucose is 100 milligrams per deciliter. Acetaminophen, vitamin C and uric acid at the electrode add false current and push the reading up, unless a selective inner layer blocks them.") +
            '<div class="fd-stat-row">' + stat("True glucose", "t") + stat("The sensor reads", "r") + stat("Error", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Selective inner layer", "layer", [["off", "Without it"], ["on", "With it"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Acetaminophen in the body", key: "apap", min: 0, max: 10, step: 1, value: 0 }) +
            slider({ label: "Vitamin C", key: "vitc", min: 0, max: 10, step: 1, value: 0 }) +
            slider({ label: "Uric acid", key: "urate", min: 0, max: 10, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Acetaminophen, vitamin C and uric acid can also react at the electrode and add false current. A selective inner layer blocks them while letting small signal molecules through. Manufacturer labeling lists substances that can affect readings, so check it for each system. A reading is only as trustworthy as the sensor\'s interference rejection. (Illustrative sizes.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const pass = state.layer === "on" ? 0.04 : 1;
            const fake = (state.apap * 7 + state.vitc * 5 + state.urate * 3) * pass;
            const read = TRUE + fake;

            seen[state.layer] = true;
            setVal(root, "apap", state.apap);
            setVal(root, "vitc", state.vitc);
            setVal(root, "urate", state.urate);
            out(root, "t", TRUE + " mg/dL");
            out(root, "r", Math.round(read) + " mg/dL");
            out(root, "e", (fake >= 0 ? "+" : "") + Math.round(fake) + " mg/dL");
            out(root, "verdict", fake < 3 ? "The reading is honest" : "False current from other molecules inflates the reading");

            const w = 300 * Math.min(1, read / 260);

            svg.innerHTML =
                label(14, 22, "true: " + TRUE, 8.5, "start", "var(--text)") +
                rect(14, 30, 300 * TRUE / 260, 18, "rgba(84,224,199,.9)") +
                label(14, 84, "reads: " + Math.round(read), 8.5, "start", "var(--text)") +
                rect(14, 92, 300 * TRUE / 260, 18, "rgba(84,224,199,.5)") +
                rect(14 + 300 * TRUE / 260, 92, Math.max(0, w - 300 * TRUE / 260), 18, "rgba(255,105,120,.9)") +
                label(14, 150, "red: false current from interfering molecules", 7, "start", "var(--muted)");

            if (seen.on && seen.off && state.apap + state.vitc + state.urate >= 10) {
                F.reward("glu-interfere", 10, "You saw the selective layer reject interference");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["glu-fouling"] = function (root) {

        const defaults = { d: 0, coat: "plain" };
        const state = { d: 0, coat: "plain" };
        const rand = mulberry(17);
        const seen = {};
        let t = 0;
        let hit = false;
        const stuff = [];

        for (let i = 0; i < 50; i++) { stuff.push({ a: rand() * 6.28, r: 36 + rand() * 12, ph: rand() * 6 }); }

        root.innerHTML =
            head("Try it: the body notices the sensor") +
            canvasFor(680, 320, "A cross-section of a sensor filament in tissue. Over the first minutes proteins stick to its surface. Over days immune cells gather and a thin capsule forms. Glucose reaches the sensor more slowly and its sensitivity changes.") +
            '<div class="fd-stat-row">' + stat("Proteins on the surface", "p") + stat("Capsule thickness", "c") + stat("Sensitivity left", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Outer coating", "coat", [["plain", "Plain surface"], ["soft", "Soft biocompatible coating"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Days since insertion", key: "d", min: 0, max: 14, step: 0.5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Minutes: proteins stick to the surface (biofouling). Days: immune cells gather, and a thin capsule can form. The effect: glucose reaches the sensor more slowly and its sensitivity changes. Soft, biocompatible outer coatings reduce the reaction. The body\'s reaction is a major reason sensors last days to weeks, not months. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function model() {

            const k = state.coat === "soft" ? 0.4 : 1;
            const protein = (1 - Math.exp(-state.d / 0.6)) * k;
            const capsule = clamp((state.d - 1.5) / 12, 0, 1) * k;

            return { protein: protein, capsule: capsule, sens: 1 - 0.55 * capsule - 0.2 * protein };
        }

        function update() {

            const m = model();

            seen[state.coat] = true;
            setVal(root, "d", state.d.toFixed(1) + " d");
            out(root, "p", Math.round(m.protein * 100) + " %");
            out(root, "c", m.capsule < 0.05 ? "none yet" : (m.capsule * 60).toFixed(0) + " µm (illustrative)");
            out(root, "s", Math.round(m.sens * 100) + " %");
            out(root, "verdict", state.d < 0.3 ? "Day zero: a clean surface" : state.d < 2 ? "Proteins are sticking to the surface" : "A capsule is forming: glucose arrives more slowly");

            if (!hit && seen.plain && seen.soft && state.d >= 10) {

                hit = true;
                F.reward("glu-fouling", 10, "You compared a plain and a coated sensor over time");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const m = model();
            const cx = 340;
            const cy = 170;

            // tissue
            ctx.fillStyle = PURPLE + ".12)";
            ctx.fillRect(0, 0, 680, 320);

            // capsule
            if (m.capsule > 0.02) {

                ctx.fillStyle = ROSE + ".35)";
                ctx.beginPath();
                ctx.arc(cx, cy, 36 + m.capsule * 60, 0, Math.PI * 2);
                ctx.fill();
            }

            // the filament, seen end-on
            ctx.fillStyle = GOLD + ".95)";
            ctx.beginPath();
            ctx.arc(cx, cy, 30, 0, Math.PI * 2);
            ctx.fill();
            txt(ctx, "sensor", cx, cy + 5, 12, "rgba(6,10,24,.95)", "center", true);

            // proteins stuck on the surface
            const n = Math.round(m.protein * stuff.length);

            stuff.forEach(function (s, i) {

                if (i >= n) { return; }

                dot(ctx, cx + Math.cos(s.a) * (34 + Math.sin(t + s.ph) * 1.2), cy + Math.sin(s.a) * (34 + Math.sin(t + s.ph) * 1.2), 3.6, TEAL + ".95)");
            });

            // immune cells
            if (state.d > 1.2) {

                const k = Math.round(clamp((state.d - 1) / 2, 0, 1) * 8 * (state.coat === "soft" ? 0.4 : 1));

                for (let i = 0; i < k; i++) {

                    const a = i / 8 * 6.28 + t * 0.2;

                    ctx.fillStyle = "rgba(255,255,255,.7)";
                    ctx.beginPath();
                    ctx.arc(cx + Math.cos(a) * (60 + m.capsule * 50), cy + Math.sin(a) * (60 + m.capsule * 50), 9, 0, Math.PI * 2);
                    ctx.fill();
                }

                txt(ctx, "immune cells", 530, 60, 12, TEXT + ".8)");
            }

            // glucose arriving, fewer when the capsule is thick
            const flow = Math.max(0, m.sens);

            for (let i = 0; i < 12; i++) {

                if (i / 12 > flow) { continue; }

                const a = i / 12 * 6.28 + t * 0.5;
                const rr = 150 - ((t * 30 + i * 13) % 100);

                dot(ctx, cx + Math.cos(a) * (rr + 40), cy + Math.sin(a) * (rr + 40), 3, GOLD + ".8)");
            }

            txt(ctx, "● glucose arriving   ● proteins on the surface", 340, 306, 12, TEXT + ".7)");
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-thickness"] = function (root) {

        const defaults = { t: 2 };
        const state = { t: 2 };
        let hit = false;
        const seen = {};

        root.innerHTML =
            head("Try it: thick or thin membrane?") +
            canvasFor(680, 320, "Two response curves of sensor current against glucose. A thin membrane gives a steep response that flattens early. A thick membrane gives a gentler response that stays straight over a wider range of glucose.") +
            '<div class="fd-stat-row">' + stat("Sensitivity (signal per glucose)", "s") + stat("Straight over up to", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Membrane thickness (relative)", key: "t", min: 1, max: 5, step: 0.25, value: 2 }) +
            "</div>" +
            '<p class="fd-sim-formula">A thicker membrane gives less current, but the response stays straight over a wider glucose range. A thinner membrane gives more current and a stronger signal, but the response saturates earlier. Membrane thickness tunes sensitivity against range. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function sat(t) { return 120 * t * t; }
        function cur(g, t) { return (g / t) / (1 + g / sat(t)) ; }

        function update() {

            seen[state.t <= 1.5 ? "thin" : state.t >= 4 ? "thick" : "mid"] = true;
            setVal(root, "t", state.t.toFixed(2) + "×");
            out(root, "s", (100 / state.t).toFixed(0) + " % of the thinnest");
            out(root, "r", Math.round(sat(state.t) * 0.6) + " mg/dL (illustrative)");
            out(root, "verdict", state.t <= 1.5 ? "Thin: a strong signal, but it saturates early" : state.t >= 4 ? "Thick: a weak signal, but straight over a wide range" : "A middle ground");

            if (!hit && seen.thin && seen.thick) {

                hit = true;
                F.reward("glu-thickness", 10, "You traded sensitivity against range");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (g) { return L + g / 500 * (R - L); };
            const Y = function (i) { return B - i / 250 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 100, 200, 300, 400, 500].forEach(function (g) { txt(ctx, g, X(g), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "glucose (mg/dL) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "current ↑", L + 40, T + 4, 12, TEXT + ".75)");

            [[1, GREY, "thinnest"], [state.t, TEAL, "yours"]].forEach(function (c) {

                ctx.strokeStyle = c[1] + ".98)";
                ctx.lineWidth = c[0] === 1 ? 2 : 3.4;
                ctx.setLineDash(c[0] === 1 ? [5, 5] : []);
                ctx.beginPath();

                for (let g = 0; g <= 500; g += 5) {

                    if (g === 0) { ctx.moveTo(X(g), Y(cur(g, c[0]))); } else { ctx.lineTo(X(g), Y(cur(g, c[0]))); }
                }

                ctx.stroke();
                ctx.setLineDash([]);
            });

            txt(ctx, "dashed: the thinnest membrane", 480, T + 20, 12, TEXT + ".7)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    /* ======================================
       UNIT 9: DRIFT, CALIBRATION, ACCURACY
    ====================================== */

    SIMS["glu-driftcauses"] = quiz(
        "Game: why do numbers wander?",
        ["Biofouling", "Enzyme loss", "Local oxygen", "Pressure"],
        [
            { q: "Surface build-up slowly changes how much glucose reaches the enzyme.", a: "Biofouling", why: "Proteins and cells coat the sensor." },
            { q: "The enzyme gradually loses activity.", a: "Enzyme loss", why: "Enzymes do not last forever." },
            { q: "Tissue levels can vary from place to place.", a: "Local oxygen", why: "Oxygen affects the reaction." },
            { q: "Lying on a sensor can squeeze tissue and cause a false low, called a compression low.", a: "Pressure", why: "Squeezed tissue means less glucose arriving." }
        ],
        4,
        "glu-driftcauses-done",
        "You know why sensors drift",
        "Sensitivity is not constant, so the current-to-glucose conversion must be handled carefully.",
        "Fouling, enzyme loss, oxygen, pressure. Hit Reset to try again."
    );


    SIMS["glu-calib"] = function (root) {

        const defaults = { mode: "factory", drift: 4 };
        const state = { mode: "factory", drift: 4 };
        const seen = {};
        let hit = false;

        root.innerHTML =
            head("Try it: keeping the conversion honest") +
            canvasFor(680, 320, "The percent error of a CGM over ten days. As the sensor's sensitivity drifts, the error grows. With fingerstick calibration the user enters a blood value every couple of days, which resets the error to zero each time. With factory calibration only, the error keeps growing.") +
            '<div class="fd-stat-row">' + stat("Error on day 10", "e") + stat("Average error", "a") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Calibration", "mode", [["factory", "Factory only"], ["finger", "Fingerstick every 2 days"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "How fast the sensitivity drifts (% per day)", key: "drift", min: 0, max: 8, step: 0.5, value: 4 }) +
            "</div>" +
            '<p class="fd-sim-formula">With fingerstick calibration the user enters a blood glucose value and the system adjusts its conversion. Factory calibration means the maker calibrates each batch in advance, so users do not need to; it is convenient, but it requires very uniform manufacturing. (Illustrative drift.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function err(d) {

            const sinceCal = state.mode === "finger" ? d % 2 : d;

            return state.drift * sinceCal;
        }

        function update() {

            let sum = 0;

            for (let d = 0; d <= 10; d += 0.05) { sum += err(d); }

            seen[state.mode] = true;
            setVal(root, "drift", state.drift + " %/day");
            out(root, "e", err(10).toFixed(0) + " %");
            out(root, "a", (sum / 201).toFixed(1) + " %");
            out(root, "verdict", state.mode === "finger" ? "Each fingerstick pulls the conversion back into line" : state.drift === 0 ? "No drift: factory calibration is enough" : "Without recalibration the drift keeps adding up");

            if (!hit && seen.factory && seen.finger && state.drift >= 6) {

                hit = true;
                F.reward("glu-calib", 10, "You saw calibration tame a fast-drifting sensor");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (d) { return L + d / 10 * (R - L); };
            const Y = function (e) { return B - Math.min(e, 40) / 40 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 10, 20, 30, 40].forEach(function (e) { txt(ctx, e + " %", L - 26, Y(e) + 4, 12, TEXT + ".7)"); });
            [0, 2, 4, 6, 8, 10].forEach(function (d) { txt(ctx, "day " + d, X(d), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "error of the CGM reading ↑", L + 90, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = (state.mode === "finger" ? TEAL : GOLD) + ".98)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let d = 0; d <= 10; d += 0.05) {

                const prev = d - 0.05;

                if (d === 0) { ctx.moveTo(X(d), Y(err(d))); }
                else if (state.mode === "finger" && Math.floor(d / 2) !== Math.floor(prev / 2)) { ctx.lineTo(X(d), Y(err(prev))); ctx.moveTo(X(d), Y(err(d))); }
                else { ctx.lineTo(X(d), Y(err(d))); }
            }

            ctx.stroke();

            if (state.mode === "finger") {

                [0, 2, 4, 6, 8].forEach(function (d) { txt(ctx, "🩸", X(d), B - 6, 14, TEXT + ".95)"); });
            }
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-mard"] = function (root) {

        const defaults = { r1: 100, c1: 110, r2: 200, c2: 190, three: "off", r3: 80, c3: 100 };
        const state = { r1: 100, c1: 110, r2: 200, c2: 190, three: "off", r3: 80, c3: 100 };
        let hit = false;

        root.innerHTML =
            head("Try it: compute a MARD") +
            art("0 0 340 190", "Bars for the percentage error of each reading pair and a line for their average, the MARD.") +
            '<div class="fd-stat-row">' + stat("Pair 1 error", "e1") + stat("Pair 2 error", "e2") + stat("Pair 3 error", "e3") + stat("MARD", "m") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Add a third pair?", "three", [["off", "No"], ["on", "Yes"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Pair 1: reference", key: "r1", min: 40, max: 400, step: 5, value: 100 }) +
            slider({ label: "Pair 1: CGM", key: "c1", min: 40, max: 400, step: 5, value: 110 }) +
            slider({ label: "Pair 2: reference", key: "r2", min: 40, max: 400, step: 5, value: 200 }) +
            slider({ label: "Pair 2: CGM", key: "c2", min: 40, max: 400, step: 5, value: 190 }) +
            slider({ label: "Pair 3: reference", key: "r3", min: 40, max: 400, step: 5, value: 80 }) +
            slider({ label: "Pair 3: CGM", key: "c3", min: 40, max: 400, step: 5, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">ARD = |CGM − reference| ÷ reference × 100 %. MARD is the mean (average) of those percent errors across many paired readings. Lower is better; leading systems report roughly 8 to 10 percent. The lesson\'s example: 110 vs 100 is 10 %, 190 vs 200 is 5 %, so MARD is 7.5 %. The same absolute error counts for more at low glucose.</p>';

        const svg = root.querySelector("svg");

        function ard(r, c) { return Math.abs(c - r) / r * 100; }

        function update() {

            const e = [ard(state.r1, state.c1), ard(state.r2, state.c2)];

            if (state.three === "on") { e.push(ard(state.r3, state.c3)); }

            const mard = e.reduce(function (a, b) { return a + b; }, 0) / e.length;

            ["r1", "c1", "r2", "c2", "r3", "c3"].forEach(function (k) { setVal(root, k, state[k]); });
            out(root, "e1", e[0].toFixed(1) + " %");
            out(root, "e2", e[1].toFixed(1) + " %");
            out(root, "e3", e[2] === undefined ? "—" : e[2].toFixed(1) + " %");
            out(root, "m", mard.toFixed(1) + " %");
            out(root, "verdict", Math.abs(mard - 7.5) < 0.01 && e.length === 2 ? "The lesson's example: 7.5 %" : mard < 10 ? "In the range leading systems report" : "Above the roughly 8 to 10 % of leading systems");

            let s = "";

            e.forEach(function (v, i) {

                const y = 20 + i * 36;

                s += label(14, y + 12, "pair " + (i + 1) + ": " + v.toFixed(1) + " %", 8, "start", "var(--text)");
                s += rect(110, y, 200 * Math.min(1, v / 30), 18, "rgba(255,214,102,.85)");
            });

            const ym = 20 + e.length * 36 + 10;

            s += label(14, ym + 12, "MARD: " + mard.toFixed(1) + " %", 9, "start", "var(--accent)");
            s += rect(110, ym, 200 * Math.min(1, mard / 30), 18, "rgba(84,224,199,.9)");

            svg.innerHTML = s;

            if (!hit && e.length === 3 && mard < 8) {

                hit = true;
                F.reward("glu-mard", 10, "You built a low-MARD set of readings");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["glu-errorgrid"] = function (root) {

        const defaults = { bias: 0, noise: 10 };
        const state = { bias: 0, noise: 10 };
        const rand = mulberry(23);
        const base = [];
        let hit = false;

        for (let i = 0; i < 80; i++) { base.push({ r: 45 + rand() * 355, z: (rand() + rand() + rand() - 1.5) * 2 }); }

        root.innerHTML =
            head("Try it: averages can hide big misses") +
            canvasFor(680, 330, "A scatter plot of paired readings: the reference on the horizontal axis and the CGM on the vertical axis. Points inside the band around the diagonal are clinically accurate, called zone A in an error grid. Points outside it could lead to wrong treatment decisions.") +
            '<div class="fd-stat-row">' + stat("MARD", "m") + stat("In the accurate zone", "a") + stat("Worst miss", "w") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Systematic bias of the sensor", key: "bias", min: -30, max: 30, step: 1, value: 0 }) +
            slider({ label: "Random scatter (noise)", key: "noise", min: 0, max: 30, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">An error grid, such as the Clarke or consensus error grid, sorts each reading by how a wrong decision would affect the patient. Zone A readings are clinically accurate; the highest zones could lead to dangerous treatment errors. Look at the error grid as well as the MARD. (This simplified version only draws the ±20 % band for zone A.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function pts() {

            return base.map(function (b) {

                const c = Math.max(20, b.r * (1 + state.bias / 100 + b.z * state.noise / 100 * 0.6));

                return { r: b.r, c: c };
            });
        }

        function update() {

            const p = pts();
            let sum = 0;
            let inA = 0;
            let worst = 0;

            p.forEach(function (q) {

                const e = Math.abs(q.c - q.r) / q.r * 100;

                sum += e;

                if (e <= 20 || (q.r < 70 && q.c < 70)) { inA++; }
                if (e > worst) { worst = e; }
            });

            setVal(root, "bias", (state.bias >= 0 ? "+" : "") + state.bias + " %");
            setVal(root, "noise", state.noise + " %");
            out(root, "m", (sum / p.length).toFixed(1) + " %");
            out(root, "a", Math.round(inA / p.length * 100) + " %");
            out(root, "w", Math.round(worst) + " % off");
            out(root, "verdict", inA / p.length > 0.95 ? "Almost every reading is clinically accurate" : inA / p.length > 0.8 ? "Most readings are fine, but some misses are large" : "Many readings fall outside the accurate zone");

            if (!hit && sum / p.length < 12 && worst > 35) {

                hit = true;
                F.reward("glu-errorgrid", 10, "You found a decent average hiding a big miss");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 80;
            const R = 620;
            const T = 20;
            const B = 280;
            const X = function (v) { return L + (v - 20) / 400 * (R - L); };
            const Y = function (v) { return B - (v - 20) / 400 * (B - T); };

            // the zone A band
            ctx.fillStyle = TEAL + ".12)";
            ctx.beginPath();
            ctx.moveTo(X(70), Y(70 * 0.8)); ctx.lineTo(X(420), Y(420 * 0.8)); ctx.lineTo(X(420), Y(420 * 1.2)); ctx.lineTo(X(70), Y(70 * 1.2)); ctx.closePath();
            ctx.fill();
            txt(ctx, "zone A (within ±20 %)", X(330), Y(330 * 1.2) - 10, 12, TEAL + "1)");

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [100, 200, 300, 400].forEach(function (v) { txt(ctx, v, X(v), B + 18, 12, TEXT + ".7)"); txt(ctx, v, L - 20, Y(v) + 4, 12, TEXT + ".7)"); });
            txt(ctx, "reference glucose (mg/dL) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "CGM ↑", L + 30, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = GREY + ".6)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(X(20), Y(20)); ctx.lineTo(X(420), Y(420));
            ctx.stroke();
            ctx.setLineDash([]);

            pts().forEach(function (q) {

                const e = Math.abs(q.c - q.r) / q.r * 100;
                const ok = e <= 20 || (q.r < 70 && q.c < 70);

                dot(ctx, X(q.r), Y(Math.min(420, q.c)), 4.6, (ok ? TEAL : ROSE) + ".95)");
            });
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    /* ======================================
       UNIT 10: ANATOMY OF A CGM
    ====================================== */

    SIMS["glu-parts"] = quiz(
        "Game: sensor, transmitter or display?",
        ["Sensor", "Transmitter", "Display"],
        [
            { q: "A hair-thin filament with its coating, placed just under the skin.", a: "Sensor", why: "The part that senses." },
            { q: "Electronics that measure the sensor's current and send it wirelessly.", a: "Transmitter", why: "It measures and sends." },
            { q: "A smartphone app or a dedicated receiver shows the value and trend.", a: "Display", why: "Where you read it." },
            { q: "In Dexcom G7 this and the sensor are combined into one small disposable.", a: "Transmitter", why: "One integrated unit." }
        ],
        4,
        "glu-parts-done",
        "You know the three parts",
        "Sensor, transmitter, display.",
        "Sense, send, show. Hit Reset to try again."
    );


    SIMS["glu-applicator"] = orderGame(
        "Game: put the sensor on",
        [
            { n: "Press the applicator to the skin", d: "spring-loaded", why: "It positions everything." },
            { n: "The introducer needle carries the filament under the skin", d: "just under the surface", why: "The filament goes in." },
            { n: "The needle withdraws", d: "leaving the filament in place", why: "The needle does not stay in." },
            { n: "The adhesive patch holds it on", d: "the whole process takes seconds", why: "Ready to wear." }
        ],
        "glu-applicator-done",
        "You applied the sensor in order",
        "Tap the four steps in the order they happen.",
        "The filament is placed once, and the needle does not stay in."
    );


    SIMS["glu-readings"] = function (root) {

        const defaults = { int: 5, days: 10 };
        const state = { int: 5, days: 10 };

        root.innerHTML =
            head("Try it: how many readings is that?") +
            art("0 0 340 150", "A row of tick marks showing how often a reading arrives, with counts per day and over the whole wear.") +
            '<div class="fd-stat-row">' + stat("Readings per day", "d") + stat("Readings over the wear", "t") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Minutes between readings", key: "int", min: 1, max: 15, step: 1, value: 5 }) +
            slider({ label: "Days of wear", key: "days", min: 7, max: 15, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">A new glucose value about every 5 minutes is roughly 288 a day. Sensors last 10 days, and a newer G7 version lasts 15 days. A fresh sensor every 10 days is the routine, so the system makes this step quick.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const perDay = Math.round(1440 / state.int);

            setVal(root, "int", state.int + " min");
            setVal(root, "days", state.days + " days");
            out(root, "d", perDay);
            out(root, "t", (perDay * state.days).toLocaleString());
            out(root, "verdict", state.int === 5 ? "Every 5 minutes: about 288 a day" : state.int === 1 ? "About one a minute: 1,440 a day" : "A reading every " + state.int + " minutes");

            let s = "";
            const n = Math.min(60, Math.round(1440 / state.int / 4));

            for (let i = 0; i < n; i++) { s += rect(14 + i * (310 / n), 50, 2, 34, "rgba(84,224,199,.85)"); }

            s += label(14, 40, "6 hours of readings:", 7.5, "start", "var(--muted)") + label(14, 112, n + " ticks in this strip (one quarter of a day)", 7, "start", "var(--muted)");

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["glu-alerts"] = function (root) {

        const defaults = { low: 80, high: 200, rate: "on" };
        const state = { low: 80, high: 200, rate: "on" };
        const URGENT = 55;
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: the CGM watches so you don't have to") +
            canvasFor(680, 320, "An overnight glucose trace that falls toward a dangerous low and then recovers. Alert lines mark the low alert you set, the fixed urgent low alert at 55, and optional rate-of-change alerts. A moving cursor shows when each alert would sound.") +
            '<div class="fd-stat-row">' + stat("First alert sounds at", "first") + stat("Warning before the urgent low", "lead") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Falling-fast alert", "rate", [["on", "On"], ["off", "Off"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Your low alert", key: "low", min: 60, max: 100, step: 1, value: 80 }) +
            slider({ label: "Your high alert", key: "high", min: 150, max: 300, step: 5, value: 200 }) +
            "</div>" +
            '<p class="fd-sim-formula">An urgent low alert at 55 mg/dL is fixed and cannot be turned off. Low and high alerts are set by the user, and a rate-of-change alert warns when glucose is falling or rising fast. Alerts are a large part of the value, especially overnight.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function g(h) {

            if (h < 1) { return 140; }
            if (h < 3.2) { return 140 - 95 * (1 - Math.cos((h - 1) / 2.2 * Math.PI)) / 2; }
            if (h < 5) { return 45 + 75 * (1 - Math.cos((h - 3.2) / 1.8 * Math.PI)) / 2; }

            return 120;
        }

        function alerts() {

            let lowT = null;
            let rateT = null;
            let urgentT = null;

            for (let h = 0; h <= 6; h += 0.01) {

                const v = g(h);
                const slope = (g(h + 0.01) - v) / 0.6; // mg/dL per minute

                if (lowT === null && v <= state.low) { lowT = h; }
                if (state.rate === "on" && rateT === null && slope < -0.9) { rateT = h; }
                if (urgentT === null && v <= URGENT) { urgentT = h; }
            }

            const first = Math.min(lowT === null ? 99 : lowT, rateT === null ? 99 : rateT, urgentT === null ? 99 : urgentT);

            return { first: first === 99 ? null : first, urgent: urgentT, lowT: lowT, rateT: rateT };
        }

        function update() {

            const a = alerts();

            setVal(root, "low", state.low + " mg/dL");
            setVal(root, "high", state.high + " mg/dL");

            const lead = a.first !== null && a.urgent !== null ? Math.round((a.urgent - a.first) * 60) : 0;

            out(root, "first", a.first === null ? "none" : "hour " + a.first.toFixed(1));
            out(root, "lead", lead + " minutes");
            out(root, "verdict", lead >= 45 ? "A long early warning: time to act before the urgent low" : lead >= 15 ? "Some warning before the urgent low" : "Little or no warning: only the fixed urgent low sounds");

            if (!hit && lead >= 45) {

                hit = true;
                F.reward("glu-alerts", 10, "You set alerts that give a long early warning");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (h) { return L + h / 6 * (R - L); };
            const Y = function (v) { return B - (v - 30) / 190 * (B - T); };

            [[state.low, GOLD, "your low alert"], [URGENT, ROSE, "urgent low (fixed): 55"]].forEach(function (a) {

                ctx.strokeStyle = a[1] + ".8)";
                ctx.setLineDash([6, 5]);
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(L, Y(a[0])); ctx.lineTo(R, Y(a[0]));
                ctx.stroke();
                ctx.setLineDash([]);
                txt(ctx, a[2], R - 100, Y(a[0]) - 6, 12, a[1] + "1)");
            });

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 2, 4, 6].forEach(function (h) { txt(ctx, "hour " + h, X(h), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "overnight →", (L + R) / 2, B + 40, 13, TEXT + ".85)");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let h = 0; h <= 6; h += 0.02) {

                if (h === 0) { ctx.moveTo(X(h), Y(g(h))); } else { ctx.lineTo(X(h), Y(g(h))); }
            }

            ctx.stroke();

            const a = alerts();

            [[a.rateT, "falling fast", BLUE], [a.lowT, "low alert", GOLD], [a.urgent, "urgent low", ROSE]].forEach(function (x) {

                if (x[0] === null) { return; }

                dot(ctx, X(x[0]), Y(g(x[0])), 8, x[2] + "1)");
                txt(ctx, "🔔 " + x[1], X(x[0]), Y(g(x[0])) - 14, 12, x[2] + "1)", "center", true);
            });

            const h = (t * 0.5) % 6;

            dot(ctx, X(h), Y(g(h)), 6, "rgba(255,255,255,1)");
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-chain"] = function (root) {

        const defaults = { g: 120 };
        const state = { g: 120 };
        let t = 0;

        root.innerHTML =
            head("Watch: from skin to screen") +
            canvasFor(680, 300, "A signal chain: glucose in tissue fluid becomes a current at the electrode, which the transmitter digitizes, an algorithm filters and scales to a glucose value and trend, and a radio sends to the phone. A pulse travels along the chain and each stage shows its value.") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Glucose in the tissue", key: "g", min: 40, max: 360, step: 5, value: 120 }) +
            "</div>" +
            '<p class="fd-sim-formula">Each stage turns a messy electrochemical signal into something a person can act on. (Values at each stage are illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function stages() {

            const cur = state.g * 0.15;

            return [
                ["Tissue fluid", state.g + " mg/dL", GOLD],
                ["Electrode", cur.toFixed(0) + " nA", TEAL],
                ["Digitizer", Math.round(cur * 8) + " counts", BLUE],
                ["Algorithm", "filter, scale, trend", PURPLE],
                ["Radio", "Bluetooth packet", ROSE],
                ["Phone", state.g + " mg/dL →", GOLD]
            ];
        }

        function update() {

            setVal(root, "g", state.g + " mg/dL");
            out(root, "verdict", "Tissue glucose " + state.g + " mg/dL becomes about " + (state.g * 0.15).toFixed(0) + " nA, then a number on the screen");
        }

        function draw() {

            clear(ctx, 680, 300);

            const st = stages();
            const w = 96;

            st.forEach(function (s, i) {

                const x = 20 + i * 108;

                ctx.fillStyle = s[2] + ".25)";
                ctx.strokeStyle = s[2] + ".9)";
                ctx.lineWidth = 2;
                ctx.fillRect(x, 100, w, 90);
                ctx.strokeRect(x, 100, w, 90);
                txt(ctx, s[0], x + w / 2, 128, 13, TEXT + ".95)", "center", true);
                txt(ctx, s[1], x + w / 2, 160, 11, s[2] + "1)");

                if (i < st.length - 1) { arrow(ctx, x + w + 2, 145, x + 106, 145, TEXT + ".6)", 2); }
            });

            const p = (t * 0.3) % 1;
            const x = 20 + p * (5 * 108 + 96);

            dot(ctx, x, 145, 9, "rgba(255,255,255,.95)");
            txt(ctx, "skin", 70, 230, 12, TEXT + ".6)");
            txt(ctx, "screen", 618, 230, 12, TEXT + ".6)");
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
       UNIT 11: DEXCOM, THE SENSOR CHEMISTRY
    ====================================== */

    SIMS["glu-dexchem"] = quiz(
        "Game: Dexcom chemistry",
        ["Glucose oxidase", "Platinum electrode", "Hydrogen peroxide", "First generation"],
        [
            { q: "The enzyme that reacts with glucose in Dexcom's sensor.", a: "Glucose oxidase", why: "Its labeling describes a sensor coated with it." },
            { q: "Where the peroxide is oxidized, producing a small current.", a: "Platinum electrode", why: "The working electrode." },
            { q: "The product the electrode detects.", a: "Hydrogen peroxide", why: "More glucose, more peroxide." },
            { q: "In the terms of Unit 7, this design is…", a: "First generation", why: "A peroxide-detecting design." }
        ],
        4,
        "glu-dexchem-done",
        "You know Dexcom's chemistry",
        "It is the classic enzyme electrode, miniaturized and wrapped in membranes.",
        "Enzyme, platinum, peroxide, first generation. Hit Reset to try again."
    );


    SIMS["glu-convert"] = function (root) {

        const defaults = { i: 18, s: 15 };
        const state = { i: 18, s: 15 };

        root.innerHTML =
            head("Try it: scale a current into mg/dL") +
            art("0 0 340 160", "A reading produced by dividing the sensor's current by its sensitivity, the nanoamps per hundred milligrams per deciliter set by factory calibration.") +
            '<div class="fd-stat-row">' + stat("Current from the sensor", "i") + stat("Sensitivity (factory-set)", "s") + stat("Reading", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Sensor current", key: "i", min: 2, max: 60, step: 1, value: 18 }) +
            slider({ label: "Sensitivity (nA per 100 mg/dL)", key: "s", min: 8, max: 25, step: 1, value: 15 }) +
            "</div>" +
            '<p class="fd-sim-formula">The sensor\'s current is only nanoamps. In its working range, more glucose means more current. The transmitter digitizes the current, and the algorithm scales it to mg/dL. The conversion factor is set by factory calibration. (Illustrative numbers.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const r = state.i / state.s * 100;

            setVal(root, "i", state.i + " nA");
            setVal(root, "s", state.s + " nA");
            out(root, "i", state.i + " nA");
            out(root, "s", state.s + " nA per 100 mg/dL");
            out(root, "r", Math.round(r) + " mg/dL");
            out(root, "verdict", "Reading = current ÷ sensitivity: if the true sensitivity is different from the factory value, every reading is off by the same factor");

            svg.innerHTML =
                label(14, 24, state.i + " nA  ÷  " + state.s + " nA per 100 mg/dL  =", 8.5, "start", "var(--text)") +
                label(14, 70, Math.round(r) + " mg/dL", 20, "start", "var(--accent)") +
                rect(14, 100, 300 * Math.min(1, r / 400), 16, "rgba(84,224,199,.9)");
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["glu-interfere2"] = quiz(
        "Game: what fools the Dexcom sensor?",
        ["Acetaminophen", "Hydroxyurea", "Check the labeling"],
        [
            { q: "Labeling describes the sensor as blocking it at typical doses, using its selective layers.", a: "Acetaminophen", why: "Interference rejection is solved in the layers." },
            { q: "Labeling warns this drug can falsely raise readings.", a: "Hydroxyurea", why: "It can fool the sensor." },
            { q: "The rule for any substance you are unsure about.", a: "Check the labeling", why: "Always check the current labeling for substances that affect readings." }
        ],
        3,
        "glu-interfere2-done",
        "You know the interference rule",
        "Interference rejection is a chemistry problem solved in the layers.",
        "Acetaminophen is blocked; hydroxyurea is a warning; read the labeling. Hit Reset to try again."
    );


    SIMS["glu-warmup"] = function (root) {

        const defaults = { which: "g7", m: 0 };
        const state = { which: "g7", m: 0 };
        let hit = false;
        const seen = {};

        root.innerHTML =
            head("Try it: wait for the sensor to settle") +
            canvasFor(680, 300, "A reliability meter after a new sensor is inserted. The meter climbs as the tissue and sensor settle, reaching full trust after the warm-up: about 2 hours for the older G6 and about 30 minutes for the G7.") +
            '<div class="fd-stat-row">' + stat("Warm-up for this model", "w") + stat("Minutes since insertion", "m") + stat("Early readings are", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Which sensor?", "which", [["g6", "Dexcom G6"], ["g7", "Dexcom G7"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Time since insertion", key: "m", min: 0, max: 180, step: 5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">After insertion, the tissue around the sensor and the sensor itself need time to stabilize: about 2 hours for G6 and about 30 minutes for G7. On the first day early readings can be less accurate while the sensor settles in. A short wait after insertion makes the early signal more trustworthy.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function warm() { return state.which === "g6" ? 120 : 30; }

        function trust() { return clamp(state.m / warm(), 0, 1); }

        function update() {

            seen[state.which] = true;
            setVal(root, "m", state.m + " min");
            out(root, "w", warm() + " min");
            out(root, "m", state.m + " min");
            out(root, "s", trust() >= 1 ? "settled and trusted" : "less reliable");
            out(root, "verdict", trust() >= 1 ? "Warm-up complete: the reading can now be used" : "Still warming up: wait before relying on the number");

            if (!hit && seen.g6 && seen.g7 && trust() >= 1) {

                hit = true;
                F.reward("glu-warmup", 10, "You waited out both warm-ups");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 80;
            const R = 640;
            const T = 40;
            const B = 220;
            const X = function (m) { return L + m / 180 * (R - L); };
            const Y = function (v) { return B - v * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 30, 60, 90, 120, 150, 180].forEach(function (m) { txt(ctx, m, X(m), B + 18, 11, TEXT + ".7)"); });
            txt(ctx, "minutes since insertion →", (L + R) / 2, B + 38, 13, TEXT + ".85)");
            txt(ctx, "reliability ↑", L + 50, T - 10, 12, TEXT + ".75)");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let m = 0; m <= 180; m += 2) {

                const v = 1 - Math.exp(-3 * Math.min(1, m / warm())) * (m < warm() ? 1 : 0);

                const vv = m >= warm() ? 1 : 1 - Math.exp(-3 * m / warm());

                if (m === 0) { ctx.moveTo(X(m), Y(vv)); } else { ctx.lineTo(X(m), Y(vv)); }

                v;
            }

            ctx.stroke();

            ctx.strokeStyle = GOLD + ".7)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(X(warm()), T); ctx.lineTo(X(warm()), B);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "warm-up over", X(warm()) + 6, T + 14, 12, GOLD + "1)", "start");

            const vNow = state.m >= warm() ? 1 : 1 - Math.exp(-3 * state.m / warm());

            dot(ctx, X(state.m), Y(vNow), 8, "rgba(255,255,255,1)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-algo"] = function (root) {

        const defaults = { f: 0.4 };
        const state = { f: 0.4 };
        const rand = mulberry(41);
        const raw = [];
        const truth = [];
        const seen = {};
        let hit = false;

        for (let i = 0; i < 120; i++) {

            const h = i / 40;
            const v = 100 + 90 * bump((h - 0.6) / 0.7);

            truth.push(v);
            raw.push(v + (rand() - 0.5) * 36);
        }

        root.innerHTML =
            head("Try it: raw current in, smooth glucose out") +
            canvasFor(680, 320, "A noisy raw signal from the sensor, the true glucose rise and fall, and a filtered curve. Stronger filtering removes more noise but makes the filtered curve lag behind the truth.") +
            '<div class="fd-stat-row">' + stat("Noise left", "n") + stat("Delay added", "d") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Filtering strength", key: "f", min: 0, max: 0.95, step: 0.05, value: 0.4 }) +
            "</div>" +
            '<p class="fd-sim-formula">Filtering removes noise from the raw signal. Compensation corrects for temperature and sensitivity. Plausibility limits changes that would be physiologically impossible. A trend estimate gives direction and rate of change, and can warn of a coming low. Software is as important to accuracy as chemistry. (A trade-off: more smoothing means more delay.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function filtered() {

            const out2 = [];
            let y = raw[0];

            raw.forEach(function (r) {

                y = state.f * y + (1 - state.f) * r;
                out2.push(y);
            });

            return out2;
        }

        function update() {

            const f = filtered();
            let err = 0;

            f.forEach(function (v, i) { err += Math.abs(v - truth[i]); });

            const delay = state.f / (1 - state.f) * 1.2; // samples of 2 min? illustrative minutes

            setVal(root, "f", state.f.toFixed(2));
            seen[state.f <= 0.1 ? "low" : state.f >= 0.8 ? "high" : "mid"] = true;
            out(root, "n", (err / f.length).toFixed(1) + " mg/dL (average)");
            out(root, "d", Math.round(delay * 2) + " min (illustrative)");
            out(root, "verdict", state.f <= 0.1 ? "Barely filtered: noisy, but quick" : state.f >= 0.8 ? "Heavily filtered: smooth, but it lags the truth" : "A balance of smoothness and speed");

            if (!hit && seen.low && seen.high) {

                hit = true;
                F.reward("glu-algo", 10, "You traded noise against delay");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (i) { return L + i / 119 * (R - L); };
            const Y = function (v) { return B - (v - 60) / 160 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            txt(ctx, "three hours →", (L + R) / 2, B + 34, 13, TEXT + ".85)");

            function line(arr, col, w) {

                ctx.strokeStyle = col;
                ctx.lineWidth = w;
                ctx.beginPath();

                arr.forEach(function (v, i) { if (i === 0) { ctx.moveTo(X(i), Y(v)); } else { ctx.lineTo(X(i), Y(v)); } });

                ctx.stroke();
            }

            line(raw, GREY + ".55)", 1.4);
            line(truth, RED + ".9)", 2.4);
            line(filtered(), TEAL + ".98)", 3.2);

            txt(ctx, "grey: raw   red: true glucose   teal: after filtering", 340, 312, 12, TEXT + ".75)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    /* ======================================
       UNIT 12: ABBOTT FREESTYLE LIBRE
    ====================================== */

    SIMS["glu-libreparts"] = quiz(
        "Game: the Libre device",
        ["Where it is worn", "Filament length", "Wear time", "Calibration"],
        [
            { q: "The back of the upper arm.", a: "Where it is worn", why: "A small disc on the arm." },
            { q: "Around 5 mm: very short and thin.", a: "Filament length", why: "Short and thin." },
            { q: "14 days per sensor.", a: "Wear time", why: "Longer than the 10-day routine." },
            { q: "Factory calibrated, with no fingersticks needed for calibration.", a: "Calibration", why: "Like Dexcom." }
        ],
        4,
        "glu-libreparts-done",
        "You know the Libre basics",
        "The sensor and transmitter are one compact disposable, which keeps cost and size low.",
        "Arm, 5 mm, 14 days, factory calibrated. Hit Reset to try again."
    );


    SIMS["glu-twophil"] = function (root) {

        const defaults = {};
        const state = {};
        let t = 0;

        root.innerHTML =
            head("Watch: two answers to the same wiring problem") +
            canvasFor(680, 330, "Two panels side by side. On the left, Dexcom: the enzyme makes hydrogen peroxide, which is oxidized at a platinum electrode at a high voltage. On the right, FreeStyle Libre: the enzyme is wired to an osmium mediator that carries electrons to the electrode at a low voltage.") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<p class="fd-sim-formula">Abbott describes a wired enzyme design: the enzyme is linked to an osmium-based mediator that carries electrons to the electrode. In the terms of Unit 7, it is second-generation: it uses a mediator instead of depending on oxygen, and it works at a low voltage, which helps limit interference. Dexcom solves the same wiring problem with peroxide.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function panel(x0, title, col, mode) {

            ctx.strokeStyle = col + ".5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(x0, 20, 310, 280);
            txt(ctx, title, x0 + 155, 44, 14, col + "1)", "center", true);

            ctx.fillStyle = PURPLE + ".5)";
            ctx.beginPath();
            ctx.arc(x0 + 70, 170, 50, 0, Math.PI * 2);
            ctx.fill();
            txt(ctx, "enzyme", x0 + 70, 175, 12, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = GREY + ".85)";
            ctx.fillRect(x0 + 255, 90, 26, 160);

            const u = (t * 0.3) % 1;

            if (mode === "dex") {

                const x = x0 + 125 + u * 120;

                dot(ctx, x, 170 + Math.sin(u * 9) * 8, 11, GOLD + ".98)");
                txt(ctx, "H₂O₂", x, 174 + Math.sin(u * 9) * 8, 7.5, "rgba(6,10,24,.95)", "center", true);
                txt(ctx, "peroxide oxidized at platinum", x0 + 155, 290, 11, TEXT + ".75)");
                txt(ctx, "+0.6 V (high)", x0 + 155, 70, 12, TEXT + ".8)");
            } else {

                for (let i = 0; i < 3; i++) {

                    const p = ((t * 0.3 + i / 3) % 1);
                    const go = p < 0.5;
                    const x = go ? x0 + 125 + (p / 0.5) * 125 : x0 + 250 - ((p - 0.5) / 0.5) * 125;

                    dot(ctx, x, 140 + i * 25, 9, go ? TEAL + ".98)" : "rgba(170,179,207,.7)");
                }

                ctx.strokeStyle = TEXT + ".4)";
                ctx.lineWidth = 2;

                for (let i = 0; i < 3; i++) {

                    ctx.beginPath();
                    ctx.moveTo(x0 + 110, 150 + i * 14); ctx.lineTo(x0 + 130, 140 + i * 25);
                    ctx.stroke();
                }

                txt(ctx, "osmium mediators wired to the enzyme", x0 + 155, 290, 11, TEXT + ".75)");
                txt(ctx, "low voltage", x0 + 155, 70, 12, TEXT + ".8)");
            }
        }

        animate(root, function (dt) {

            t += dt;
            clear(ctx, 680, 330);
            panel(20, "Dexcom", GOLD, "dex");
            panel(350, "FreeStyle Libre", TEAL, "libre");
        });

        out(root, "verdict", "A different answer to the same wiring problem");

        root.querySelector("[data-reset]") && root.querySelector("[data-reset]").addEventListener("click", function () {});

        defaults;
        state;
    };


    SIMS["glu-libreversions"] = quiz(
        "Game: which Libre?",
        ["Libre 1", "Libre 2", "Libre 3"],
        [
            { q: "The user scans the sensor with a reader or phone to get a reading.", a: "Libre 1", why: "On-demand scanning." },
            { q: "Adds Bluetooth streaming with optional alarms.", a: "Libre 2", why: "Streaming and alarms." },
            { q: "Streams a new reading about every minute.", a: "Libre 3", why: "The fastest update rate." },
            { q: "Later versions moved from on-demand scanning to what?", a: "Libre 3", why: "Continuous streaming." }
        ],
        4,
        "glu-libreversions-done",
        "You know the Libre versions",
        "Later versions moved from on-demand scanning to continuous streaming.",
        "Scan, stream with alarms, stream every minute. Hit Reset to try again."
    );


    SIMS["glu-dexvslibre"] = quiz(
        "Game: Dexcom or FreeStyle Libre?",
        ["Dexcom", "FreeStyle Libre"],
        [
            { q: "Peroxide detection at platinum.", a: "Dexcom", why: "A first-generation design." },
            { q: "A wired enzyme with an osmium mediator, at low voltage.", a: "FreeStyle Libre", why: "A second-generation design." },
            { q: "A new reading about every 5 minutes, with a strong focus on alerts and integration.", a: "Dexcom", why: "Reading every 5 minutes." },
            { q: "A small integrated disc with up to one reading per minute.", a: "FreeStyle Libre", why: "Libre 3." },
            { q: "Earlier versions' labeling warns that large amounts of vitamin C can falsely raise readings.", a: "FreeStyle Libre", why: "Different chemistry, different interfering substances." }
        ],
        5,
        "glu-dexvslibre-done",
        "You can tell them apart",
        "Both are factory calibrated, and both use an enzyme electrode.",
        "Dexcom: peroxide. Libre: wired enzyme. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="glu-"]').forEach(F.mount);

})();
