/* ========================================
   BLOOD-BRAIN BARRIER ON A CHIP: INTERACTIVE SIMULATORS, PART 3

   Unit 11: shear stress.
   Unit 12: PDMS and soft lithography.
   Unit 13: chip layouts.
   Unit 14: cells for the chip.
   Unit 15: sensing on a chip.
   Unit 16: testing drugs and modeling disease.
   Unit 17: limits, validation, what's next.

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

    const MU = 0.7e-3; // Pa·s, culture medium


    /* ======================================
       UNIT 11: SHEAR STRESS
    ====================================== */

    function shear(Q, w, h) {

        // Q in µL/min, w in mm, h in µm: returns Pa
        const q = Q * 1e-9 / 60;

        return 6 * MU * q / ((w * 1e-3) * Math.pow(h * 1e-6, 2));
    }

    SIMS["bbb-profile"] = function (root) {

        const defaults = { v: 5 };
        const state = { v: 5 };
        let t = 0;

        root.innerHTML =
            head("Try it: fast in the middle, still at the wall") +
            canvasFor(680, 300, "A side view of a channel with a parabolic velocity profile: fluid at the wall is held still and speed rises toward the middle. Arrows show the speed at different heights. The steeper the change near the wall, the greater the shear stress.") +
            '<div class="fd-stat-row">' + stat("Speed in the middle", "mid") + stat("Speed at the wall", "wall") + stat("Wall shear stress (relative)", "tau") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Flow rate", key: "v", min: 1, max: 10, step: 1, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Fluid right at the wall is held still, and speed rises toward the middle. Shear stress comes from how steeply the flow speed changes near the wall. Endothelial cells sense it and respond by lining up with the flow and tightening their junctions: shear stress is a signal, not just a push.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            setVal(root, "v", state.v);
            out(root, "mid", (state.v * 0.3).toFixed(1) + " mm/s (illustrative)");
            out(root, "wall", "0: held still");
            out(root, "tau", state.v + " units");
            out(root, "verdict", state.v >= 8 ? "A steep change at the wall: a larger shear stress" : state.v <= 2 ? "A gentle change at the wall: a small shear stress" : "A moderate shear stress");
        }

        function draw() {

            clear(ctx, 680, 300);

            const top = 40;
            const bot = 250;
            const mid = (top + bot) / 2;
            const maxLen = 40 + state.v * 22;

            ctx.fillStyle = GREY + ".5)";
            ctx.fillRect(60, top - 14, 560, 14);
            ctx.fillRect(60, bot, 560, 14);
            ctx.fillStyle = TEAL + ".75)";

            // cells lining the lower wall
            for (let i = 0; i < 9; i++) {

                ctx.beginPath();
                ctx.ellipse(110 + i * 58, bot - 6, 24, 9, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = BLUE + ".08)";
            ctx.fillRect(60, top, 560, bot - top);

            // velocity arrows at several heights
            for (let k = 0; k <= 10; k++) {

                const yy = top + k / 10 * (bot - top);
                const u = 1 - Math.pow((yy - mid) / ((bot - top) / 2), 2);
                const len = Math.max(0, u) * maxLen;

                ctx.strokeStyle = BLUE + ".95)";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(100, yy); ctx.lineTo(100 + len, yy);
                ctx.stroke();

                if (len > 6) {

                    ctx.beginPath();
                    ctx.moveTo(100 + len, yy); ctx.lineTo(100 + len - 7, yy - 4);
                    ctx.moveTo(100 + len, yy); ctx.lineTo(100 + len - 7, yy + 4);
                    ctx.stroke();
                }
            }

            // the profile curve
            ctx.strokeStyle = GOLD + ".95)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let yy = top; yy <= bot; yy += 4) {

                const u = 1 - Math.pow((yy - mid) / ((bot - top) / 2), 2);
                const x = 100 + Math.max(0, u) * maxLen;

                if (yy === top) { ctx.moveTo(x, yy); } else { ctx.lineTo(x, yy); }
            }

            ctx.stroke();

            // drifting particles
            for (let i = 0; i < 12; i++) {

                const yy = top + 12 + ((i * 47) % (bot - top - 24));
                const u = 1 - Math.pow((yy - mid) / ((bot - top) / 2), 2);
                const x = 100 + maxLen + 20 + ((t * 80 * u + i * 53) % 400);

                dot(ctx, x, yy, 3, TEXT + ".8)");
            }

            txt(ctx, "wall: fluid held still", 560, bot + 30, 12, TEXT + ".75)");
            txt(ctx, "endothelial cells feel the drag", 340, 24, 13, TEAL + "1)");
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


    SIMS["bbb-shear"] = function (root) {

        const defaults = { q: 150, w: 1, h: 100 };
        const state = { q: 150, w: 1, h: 100 };
        const seen = {};
        let hit = false;

        root.innerHTML =
            head("Try it: set the force on the cells") +
            canvasFor(680, 300, "A bar on a log scale showing the wall shear stress in a channel for the chosen flow rate and channel size, with a band marking the 1 to 2 pascal range used to model brain capillaries.") +
            '<div class="fd-stat-row">' + stat("Wall shear stress", "pa") + stat("In older units", "dyn") + stat("Compared with a brain capillary", "cmp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Flow rate Q", key: "q", min: 1, max: 600, step: 1, value: 150 }) +
            slider({ label: "Channel width w", key: "w", min: 0.2, max: 3, step: 0.1, value: 1 }) +
            slider({ label: "Channel height h", key: "h", min: 20, max: 400, step: 5, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">τ = 6 μ Q ÷ (w h²) for a wide, shallow channel, with μ = 0.7 mPa·s. Brain capillaries are often modeled at about 1 to 2 pascals, or 10 to 20 dyn/cm². Set Q, w and h, and you set the force on the cells.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const tau = shear(state.q, state.w, state.h);

            seen[tau < 0.5 ? "lo" : tau > 2.5 ? "hi" : "ok"] = true;
            setVal(root, "q", state.q + " µL/min");
            setVal(root, "w", state.w.toFixed(1) + " mm");
            setVal(root, "h", state.h + " µm");
            out(root, "pa", tau.toFixed(2) + " Pa");
            out(root, "dyn", (tau * 10).toFixed(1) + " dyn/cm²");
            out(root, "cmp", tau < 0.9 ? "below the 1–2 Pa target" : tau <= 2.1 ? "in the brain-like range" : "above the target");
            out(root, "verdict", tau >= 0.9 && tau <= 2.1 ? "Brain-like shear: the cells will feel a real vessel" : tau < 0.9 ? "Too gentle: the cells will act as if the fluid were still" : "Too strong: more than a brain capillary");

            if (!hit && tau >= 0.9 && tau <= 2.1 && state.h >= 150) {

                hit = true;
                F.reward("bbb-shear", 10, "You found brain-like shear in a taller channel");
            }

            if (seen.lo && seen.ok && seen.hi) { F.reward("bbb-shear-all", 5, "You tried too little, just right and too much"); }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 70;
            const R = 650;
            const X = function (p) { return L + (Math.log10(Math.max(p, 0.001)) + 3) / 5 * (R - L); };
            const tau = shear(state.q, state.w, state.h);

            [0.001, 0.01, 0.1, 1, 10, 100].forEach(function (v) {

                ctx.strokeStyle = GREY + ".2)";
                ctx.beginPath();
                ctx.moveTo(X(v), 70); ctx.lineTo(X(v), 200);
                ctx.stroke();
                txt(ctx, v + " Pa", X(v), 218, 11, TEXT + ".65)");
            });

            ctx.fillStyle = TEAL + ".25)";
            ctx.fillRect(X(1), 70, X(2) - X(1), 130);
            txt(ctx, "brain-like: 1–2 Pa", (X(1) + X(2)) / 2, 62, 12, TEAL + "1)", "center", true);

            ctx.fillStyle = (tau >= 0.9 && tau <= 2.1 ? TEAL : GOLD) + ".9)";
            ctx.fillRect(L, 120, Math.max(2, X(tau) - L), 30);
            dot(ctx, X(tau), 135, 10, "rgba(255,255,255,1)");
            txt(ctx, tau.toFixed(2) + " Pa", X(tau), 112, 14, GOLD + "1)", "center", true);
            txt(ctx, "wall shear stress (log scale) →", 340, 250, 13, TEXT + ".85)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["bbb-pumpcalc"] = function (root) {

        const defaults = { tau: 1, w: 1, h: 100 };
        const state = { tau: 1, w: 1, h: 100 };
        let hit = false;

        root.innerHTML =
            head("Try it: how fast should the pump run?") +
            art("0 0 340 190", "A syringe pump flow-rate dial: the flow rate needed to give the cells the chosen shear stress in the chosen channel.") +
            '<div class="fd-stat-row">' + stat("Flow rate needed", "q") + stat("In µL per second", "qs") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Target shear stress τ", key: "tau", min: 0.1, max: 3, step: 0.1, value: 1 }) +
            slider({ label: "Channel width w", key: "w", min: 0.2, max: 3, step: 0.1, value: 1 }) +
            slider({ label: "Channel height h", key: "h", min: 20, max: 400, step: 5, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">Rearrange the shear formula: Q = τ w h² ÷ (6 μ). The lesson\'s example: μ = 0.7 mPa·s, w = 1 mm, h = 0.1 mm and τ = 1 Pa give Q ≈ 2.4 µL/s, or about 140 µL/min. A small syringe pump can deliver brain-like shear.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const q = state.tau * (state.w * 1e-3) * Math.pow(state.h * 1e-6, 2) / (6 * MU); // m³/s
            const ulmin = q * 1e9 * 60;

            setVal(root, "tau", state.tau.toFixed(1) + " Pa");
            setVal(root, "w", state.w.toFixed(1) + " mm");
            setVal(root, "h", state.h + " µm");
            out(root, "q", ulmin >= 10 ? Math.round(ulmin) + " µL/min" : ulmin.toFixed(2) + " µL/min");
            out(root, "qs", (ulmin / 60).toFixed(2) + " µL/s");
            out(root, "verdict", Math.abs(state.tau - 1) < 0.05 && state.w === 1 && state.h === 100 ? "The lesson's example: about 140 µL/min" : ulmin > 1000 ? "A big flow: this needs more than a small syringe pump" : "A flow a small syringe pump can deliver");

            const a = clamp(Math.log10(Math.max(ulmin, 0.1)) / 3.5, 0, 1) * Math.PI * 1.5 - Math.PI * 1.25;

            svg.innerHTML =
                '<path d="M 90 150 A 80 80 0 1 1 250 150" style="fill:none;stroke:rgba(170,179,207,.35);stroke-width:10;stroke-linecap:round"/>' +
                '<line x1="170" y1="110" x2="' + (170 + Math.cos(a) * 62) + '" y2="' + (110 + Math.sin(a) * 62) + '" style="stroke:#ffd666;stroke-width:4;stroke-linecap:round"/>' +
                '<circle cx="170" cy="110" r="7" style="fill:#ffd666"/>' +
                label(170, 175, "flow rate (log dial)", 7.5, "middle", "var(--muted)");

            if (!hit && Math.abs(ulmin - 143) < 6) {

                hit = true;
                F.reward("bbb-pumpcalc", 10, "You set the pump for brain-like shear");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["bbb-heightsq"] = function (root) {

        const defaults = { h: 100 };
        const state = { h: 100 };
        const Q = 140;
        const W = 1;
        const seen = {};

        root.innerHTML =
            head("Try it: the height is squared") +
            canvasFor(680, 300, "A channel cross-section whose height follows the slider, with a bar for the wall shear stress at a fixed flow rate. Halving the height makes the shear four times larger.") +
            '<div class="fd-stat-row">' + stat("Shear stress at 140 µL/min", "tau") + stat("Compared with a 100 µm channel", "rel") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-half>Halve the height</button><button type="button" class="fd-sim-btn" data-double>Double the height</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Channel height (flow fixed at 140 µL/min, width 1 mm)", key: "h", min: 25, max: 300, step: 5, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">Halve the channel height and the same flow gives four times the shear. Double the flow and the shear doubles. Small channel tolerances become big force differences, so precision in fabrication matters.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const tau = shear(Q, W, state.h);
            const rel = tau / shear(Q, W, 100);

            seen[rel > 3 ? "hi" : rel < 0.3 ? "lo" : "mid"] = true;
            setVal(root, "h", state.h + " µm");
            out(root, "tau", tau.toFixed(2) + " Pa");
            out(root, "rel", rel.toFixed(2) + "×");
            out(root, "verdict", rel > 3 ? "A much shallower channel: far more force on the cells" : rel < 0.3 ? "A taller channel: the cells barely feel the flow" : "Near the original: a small height change is still a big force change");

            if (seen.hi && seen.lo) { F.reward("bbb-heightsq", 10, "You saw the height-squared law"); }
        }

        function draw() {

            clear(ctx, 680, 300);

            const hh = state.h / 300 * 140;
            const cy = 100;

            ctx.fillStyle = GREY + ".5)";
            ctx.fillRect(60, cy - hh / 2 - 12, 330, 12);
            ctx.fillRect(60, cy + hh / 2, 330, 12);
            ctx.fillStyle = BLUE + ".15)";
            ctx.fillRect(60, cy - hh / 2, 330, hh);
            ctx.strokeStyle = GOLD + ".95)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(410, cy - hh / 2); ctx.lineTo(410, cy + hh / 2);
            ctx.stroke();
            txt(ctx, state.h + " µm", 440, cy + 4, 13, GOLD + "1)", "center", true);

            // shear bar
            const tau = shear(Q, W, state.h);
            const w = Math.min(560, tau * 90);

            ctx.fillStyle = GREY + ".18)";
            ctx.fillRect(60, 220, 560, 28);
            ctx.fillStyle = (tau >= 1 && tau <= 2 ? TEAL : GOLD) + ".9)";
            ctx.fillRect(60, 220, w, 28);
            txt(ctx, "wall shear stress: " + tau.toFixed(2) + " Pa", 340, 272, 13, TEXT + ".85)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        root.querySelector("[data-half]").addEventListener("click", function () {

            state.h = Math.max(25, Math.round(state.h / 2 / 5) * 5);
            root.querySelector('input[data-key="h"]').value = state.h;
            update();
            draw();
        });

        root.querySelector("[data-double]").addEventListener("click", function () {

            state.h = Math.min(300, state.h * 2);
            root.querySelector('input[data-key="h"]').value = state.h;
            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 12: BUILDING THE CHIP
    ====================================== */

    SIMS["bbb-softlitho"] = orderGame(
        "Game: cast, peel, bond",
        [
            { n: "Make the master", d: "photoresist on a silicon wafer, exposed through a mask", why: "Raised ridges carry the channel pattern." },
            { n: "Pour PDMS", d: "liquid polymer over the master", why: "It fills in around the ridges." },
            { n: "Cure", d: "let the PDMS set", why: "It turns into a flexible solid." },
            { n: "Peel", d: "lift the PDMS off the master", why: "The channels are now molded into it." },
            { n: "Punch the ports", d: "holes for tubing", why: "So fluid can get in and out." },
            { n: "Plasma-bond to glass", d: "seal it shut", why: "A brief oxygen plasma makes the bond permanent." }
        ],
        "bbb-softlitho-done",
        "You ordered the soft lithography flow",
        "Tap the six steps in the order they happen.",
        "One precise master can mold hundreds of chips."
    );


    SIMS["bbb-master"] = quiz(
        "Game: the master and the material",
        ["SU-8 photoresist", "PDMS", "Thermoplastics", "Oxygen plasma"],
        [
            { q: "Coated on a wafer and exposed through a mask: its ridge height sets the channel height.", a: "SU-8 photoresist", why: "The same lithography used for microchips." },
            { q: "Clear, flexible, easy to cast and permeable to oxygen, but it can absorb small hydrophobic molecules.", a: "PDMS", why: "Loved, with a catch." },
            { q: "Polystyrene, COC and PMMA avoid absorption and suit mass production.", a: "Thermoplastics", why: "An alternative to PDMS." },
            { q: "A brief burst activates the PDMS surface so it bonds permanently to glass.", a: "Oxygen plasma", why: "The same plasma tools used in chip fabs seal a biology chip." }
        ],
        4,
        "bbb-master-done",
        "You know the building materials",
        "The best material depends on the drug, and on the production volume.",
        "Resist for the master, PDMS for the mold, plasma for the seal. Hit Reset to try again."
    );


    SIMS["bbb-absorb"] = function (root) {

        const defaults = { logp: 3, mat: "pdms", hr: 6 };
        const state = { logp: 3, mat: "pdms", hr: 6 };
        const rand = mulberry(12);
        const parts = [];
        const seen = {};

        for (let i = 0; i < 40; i++) { parts.push({ x: rand(), y: rand(), ph: rand() * 6 }); }

        root.innerHTML =
            head("Try it: does the chip soak up the drug?") +
            canvasFor(680, 320, "A channel with drug molecules in the medium and walls made of PDMS or a thermoplastic. In PDMS, fat-loving molecules soak into the wall and disappear from the medium; a thermoplastic wall absorbs almost nothing.") +
            '<div class="fd-stat-row">' + stat("Drug left in the medium", "left") + stat("Absorbed by the wall", "abs") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Chip material", "mat", [["pdms", "PDMS"], ["plastic", "Thermoplastic (COC, PMMA)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "How fat-loving the drug is (log P)", key: "logp", min: -2, max: 6, step: 0.1, value: 3 }) +
            slider({ label: "Time in the chip", key: "hr", min: 0, max: 24, step: 1, value: 6 }) +
            "</div>" +
            '<p class="fd-sim-formula">PDMS can absorb small hydrophobic molecules, which can distort drug measurements. Alternatives such as thermoplastics or 3D printing avoid this and suit mass production. (Rough illustrative model of how much is lost.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function lost() {

            const k = state.mat === "pdms" ? Math.max(0, state.logp - 1) * 0.08 : 0.004;

            return 1 - Math.exp(-k * state.hr);
        }

        function update() {

            const l = lost();

            seen[state.mat] = true;
            setVal(root, "logp", state.logp.toFixed(1));
            setVal(root, "hr", state.hr + " h");
            out(root, "left", Math.round((1 - l) * 100) + " %");
            out(root, "abs", Math.round(l * 100) + " %");
            out(root, "verdict", state.mat === "plastic" ? "A thermoplastic wall hardly takes up any drug" : l > 0.5 ? "The wall has soaked up most of the drug: the cells see far less than you added" : l > 0.15 ? "A noticeable loss: it distorts the measurement" : "Little is lost: water-loving drugs stay in the medium");

            if (seen.pdms && seen.plastic && lost() < 0.05) {
                F.reward("bbb-absorb", 10, "You compared PDMS with a thermoplastic");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const l = lost();
            const top = 100;
            const bot = 220;

            ctx.fillStyle = state.mat === "pdms" ? "rgba(190,150,255,.4)" : GREY + ".4)";
            ctx.fillRect(40, top - 60, 600, 60);
            ctx.fillRect(40, bot, 600, 60);
            txt(ctx, state.mat === "pdms" ? "PDMS wall" : "thermoplastic wall", 340, top - 24, 13, TEXT + ".85)", "center", true);
            ctx.fillStyle = BLUE + ".12)";
            ctx.fillRect(40, top, 600, bot - top);

            const n = Math.round((1 - l) * parts.length);

            parts.forEach(function (p, i) {

                if (i < n) {

                    dot(ctx, 60 + p.x * 560 + Math.sin(t * 1.4 + p.ph) * 6, top + 10 + p.y * (bot - top - 20) + Math.cos(t * 1.2 + p.ph) * 4, 4.5, ROSE + ".95)");

                } else if (state.mat === "pdms") {

                    // absorbed: shown inside the wall
                    dot(ctx, 60 + p.x * 560, p.y < 0.5 ? top - 10 - p.y * 80 : bot + 10 + (p.y - 0.5) * 80, 3.4, ROSE + ".5)");
                }
            });

            txt(ctx, "● drug in the medium   faint ● drug absorbed into the wall", 340, 300, 12, TEXT + ".7)");
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


    SIMS["bbb-sealing"] = orderGame(
        "Game: seal the chip",
        [
            { n: "Punch the ports", d: "holes through the PDMS for tubing", why: "Easier before bonding." },
            { n: "Activate with oxygen plasma", d: "a brief burst on the surfaces", why: "It makes the PDMS surface bond-ready." },
            { n: "Press together", d: "to glass, or to another PDMS layer with a membrane between", why: "A permanent seal forms." },
            { n: "Connect tubing", d: "into the punched ports", why: "Now fluid can flow." }
        ],
        "bbb-sealing-done",
        "You sealed the chip in order",
        "Tap the four steps in the order they happen.",
        "The same plasma tools used in chip fabs seal a biology chip."
    );


    SIMS["bbb-lifein"] = orderGame(
        "Game: put life into the chip",
        [
            { n: "Coat", d: "fill the channels with collagen IV and fibronectin", why: "A matrix for the cells to stick to." },
            { n: "Seed", d: "inject endothelial cells, and flip the chip to seed the other side if needed", why: "Cells go in." },
            { n: "Attach", d: "wait for the cells to stick, then add medium", why: "Cells need time to settle." },
            { n: "Perfuse", d: "start a slow flow and let the barrier mature for days", why: "Flow helps the barrier tighten." }
        ],
        "bbb-lifein-done",
        "You brought the chip to life in order",
        "Tap the four steps in the order they happen.",
        "The fabrication is hours of work, and the biology is days."
    );


    /* ======================================
       UNIT 13: CHIP LAYOUTS
    ====================================== */

    SIMS["bbb-layouts"] = quiz(
        "Game: which layout?",
        ["Sandwich", "Hydrogel lanes", "3D tube"],
        [
            { q: "Two stacked channels with a thin porous membrane between them.", a: "Sandwich", why: "Like a Transwell, but with flow." },
            { q: "Side-by-side lanes where a gel holds cells and no plastic membrane is needed.", a: "Hydrogel lanes", why: "Pillars hold the gel in place." },
            { q: "A hollow vessel formed in a gel or grown into a network, perfused through.", a: "3D tube", why: "The most vessel-like shape." },
            { q: "Astrocytes can live inside the gel, in direct 3D contact.", a: "Hydrogel lanes", why: "No artificial membrane between them." },
            { q: "Easy imaging and electrical readings, but the membrane is artificial.", a: "Sandwich", why: "A familiar structure." }
        ],
        4,
        "bbb-layouts-done",
        "You know the three layouts",
        "Each layout answers the same question differently.",
        "Sandwich, hydrogel lanes, 3D tube. Hit Reset to try again."
    );


    SIMS["bbb-layoutwish"] = priority({
        title: "Try it: pick a layout for your question",
        aria: "Bars showing how well the sandwich, hydrogel lanes and 3D tube layouts fit the priorities you set.",
        key: "bbb-layoutwish",
        props: [
            { k: "read", n: "Standard readouts (TEER, imaging)" },
            { k: "self", n: "Cells that self-organize" },
            { k: "make", n: "Easy to manufacture in plastic" },
            { k: "vessel", n: "A vessel-like shape" }
        ],
        fam: [
            { n: "Sandwich", c: TEAL, r: { read: 5, self: 2, make: 4, vessel: 1 } },
            { n: "Hydrogel lanes", c: GOLD, r: { read: 3, self: 4, make: 2, vessel: 3 } },
            { n: "3D tube", c: ROSE, r: { read: 1, self: 5, make: 1, vessel: 5 } }
        ],
        foot: "Ratings are rough and relative (1 to 5). There is no best layout, only one that fits the question. Design begins with what you want to measure."
    });


    SIMS["bbb-chooselayout"] = quiz(
        "Game: match the layout to the question",
        ["Sandwich", "Hydrogel lanes or a tube", "A plastic-friendly layout"],
        [
            { q: "You need standard readouts: TEER and imaging.", a: "Sandwich", why: "They are easier to take." },
            { q: "You need cells to self-organize.", a: "Hydrogel lanes or a tube", why: "Gels give cells room to arrange." },
            { q: "You need many chips.", a: "A plastic-friendly layout", why: "Pick one that can be manufactured in plastic." },
            { q: "You want to put electrodes across the cell layer.", a: "Sandwich", why: "Hydrogel lanes make electrodes harder to place." }
        ],
        4,
        "bbb-chooselayout-done",
        "You can match layout to question",
        "Design begins with what you want to measure.",
        "Readouts, self-organization, manufacturing. Hit Reset to try again."
    );


    /* ======================================
       UNIT 14: CELLS FOR THE CHIP
    ====================================== */

    SIMS["bbb-sourcewish"] = priority({
        title: "Try it: choose your cell source",
        aria: "Bars showing how well primary cells, immortalized lines and stem-cell-derived cells fit the priorities you set.",
        key: "bbb-sourcewish",
        props: [
            { k: "real", n: "A realistic, tight barrier" },
            { k: "easy", n: "Easy and cheap to grow" },
            { k: "person", n: "A patient's own genetics" },
            { k: "supply", n: "Plentiful supply" }
        ],
        fam: [
            { n: "Primary cells", c: ROSE, r: { real: 4, easy: 2, person: 1, supply: 1 } },
            { n: "Immortalized line", c: GOLD, r: { real: 1, easy: 5, person: 1, supply: 5 } },
            { n: "Stem-cell derived (iPSC)", c: TEAL, r: { real: 4, easy: 3, person: 5, supply: 4 } }
        ],
        foot: "Ratings are rough and relative (1 to 5). Each source trades realism against convenience."
    });


    SIMS["bbb-ipsc"] = orderGame(
        "Game: from a skin cell to a barrier cell",
        [
            { n: "Take an adult cell", d: "for example, a skin cell", why: "The starting point." },
            { n: "Reprogram it", d: "into an induced pluripotent stem cell", why: "A discovery by Shinya Yamanaka." },
            { n: "Guide it with signals", d: "and growth factors", why: "To steer it toward the brain's blood-vessel cell type." },
            { n: "A brain-like endothelial cell", d: "ready for the chip", why: "A cell that behaves like a brain endothelial cell." }
        ],
        "bbb-ipsc-done",
        "You followed the iPSC route",
        "Tap the four stages in order.",
        "The same donor's cells can become endothelium, astrocytes, and neurons."
    );


    SIMS["bbb-ipscpro"] = quiz(
        "Game: why stem-cell derived cells?",
        ["Human", "Supply", "Personal", "Caution"],
        [
            { q: "They carry human transporters, receptors and pumps.", a: "Human", why: "Not a rodent's version." },
            { q: "One stem-cell line can supply many experiments.", a: "Supply", why: "Scalable." },
            { q: "Cells can come from a patient with a particular disease.", a: "Personal", why: "Models built from one person." },
            { q: "Protocols vary, and some resulting cells show mixed identity, so checking is essential.", a: "Caution", why: "Promising, but not yet standardized." }
        ],
        4,
        "bbb-ipscpro-done",
        "You know the pros and the caution",
        "Promising, but not yet standardized.",
        "Human, supply, personal: with a caution. Hit Reset to try again."
    );


    SIMS["bbb-castmore"] = quiz(
        "Game: add the supporting cast",
        ["Astrocytes", "Pericytes", "Neurons and microglia"],
        [
            { q: "Send signals that tighten the barrier and keep it mature.", a: "Astrocytes", why: "Co-culture helps." },
            { q: "Add stability and signals along the vessel wall.", a: "Pericytes", why: "They wrap the vessel." },
            { q: "Added in more advanced models to include activity and immune responses.", a: "Neurons and microglia", why: "A richer model." },
        ],
        4,
        "bbb-castmore-done",
        "You know the supporting cast",
        "More cell types means a richer model and a harder experiment.",
        "Astrocytes tighten, pericytes stabilize, neurons and microglia add activity. Hit Reset to try again."
    );


    SIMS["bbb-qc"] = quiz(
        "Game: prove the cells are what you think",
        ["Stain", "Measure", "Function"],
        [
            { q: "Look for claudin-5, ZO-1 and GLUT1 in the expected places.", a: "Stain", why: "Junction proteins and a transporter." },
            { q: "Track TEER and tracer leak, as in Unit 8.", a: "Measure", why: "Electrical and molecular views of the barrier." },
            { q: "Test transporters and efflux pumps with known substrates.", a: "Function", why: "Do they actually work?" },
        ],
        4,
        "bbb-qc-done",
        "You know the quality checks",
        "A barrier model is only as good as its checks.",
        "Stain, measure, function. Hit Reset to try again."
    );


    /* ======================================
       UNIT 15: SENSING ON A CHIP
    ====================================== */

    SIMS["bbb-fourpoint"] = function (root) {

        const defaults = { rc: 150, meth: "two" };
        const state = { rc: 150, meth: "two" };
        const TRUE = 200;
        const seen = {};

        root.innerHTML =
            head("Try it: why use four electrodes?") +
            art("0 0 340 190", "Two bars: the true resistance of the cell layer and the resistance a chosen electrode arrangement reports. With two electrodes the contact resistance adds to the reading; four electrodes separate the current path from the voltage sensing and avoid that error.") +
            '<div class="fd-stat-row">' + stat("True resistance of the layer", "t") + stat("What the electrodes read", "r") + stat("Error", "e") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrode arrangement", "meth", [["two", "Two electrodes"], ["four", "Four electrodes"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Contact resistance at each electrode", key: "rc", min: 0, max: 500, step: 10, value: 150 }) +
            "</div>" +
            '<p class="fd-sim-formula">A four-electrode setup separates the current path from the voltage sensing, which reduces contact errors. Electrode placement, channel shape and the area the current covers all change the reading, so a chip TEER value should not be compared with a Transwell one without care. (Illustrative numbers.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const read = state.meth === "two" ? TRUE + 2 * state.rc : TRUE;

            seen[state.meth] = true;
            setVal(root, "rc", state.rc + " Ω");
            out(root, "t", TRUE + " Ω");
            out(root, "r", read + " Ω");
            out(root, "e", (read - TRUE >= 0 ? "+" : "") + Math.round((read - TRUE) / TRUE * 100) + " %");
            out(root, "verdict", state.meth === "four" ? "Four electrodes: the reading is the layer's resistance, whatever the contacts" : state.rc === 0 ? "No contact resistance: both arrangements agree" : "Two electrodes: the contacts inflate the reading");

            svg.innerHTML =
                label(14, 22, "true: " + TRUE + " Ω", 8.5, "start", "var(--text)") +
                rect(14, 30, 280 * TRUE / 1300, 16, "rgba(84,224,199,.9)") +
                label(14, 84, "reads: " + read + " Ω", 8.5, "start", "var(--text)") +
                rect(14, 92, 280 * Math.min(1, read / 1300), 16, state.meth === "two" && read > TRUE ? "rgba(255,105,120,.85)" : "rgba(255,214,102,.9)") +
                label(14, 150, "the extra red is contact resistance, not the cells", 7, "start", "var(--muted)");

            if (seen.two && seen.four && state.rc >= 300) {
                F.reward("bbb-fourpoint", 10, "You saw four electrodes beat contact errors");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["bbb-chipteer"] = quiz(
        "Game: can you compare these TEER numbers?",
        ["Directly comparable", "Not directly comparable"],
        [
            { q: "The same cells measured in a chip and in a Transwell.", a: "Not directly comparable", why: "Electrode placement and area change the reading." },
            { q: "Two Transwell readings of the same cells, same insert size, same method.", a: "Directly comparable", why: "Same setup, same meaning." },
            { q: "A chip TEER quoted without saying how it was measured.", a: "Not directly comparable", why: "Report how it was measured along with the number." },
            { q: "Two chips with the same layout, electrodes and protocol.", a: "Directly comparable", why: "The setups match." }
        ],
        4,
        "bbb-chipteer-done",
        "You know when TEER numbers compare",
        "Report how it was measured along with the number.",
        "Compare like with like. Hit Reset to try again."
    );


    SIMS["bbb-readouts"] = quiz(
        "Game: which readout?",
        ["Tracer imaging", "Live cell imaging", "Outflow sampling"],
        [
            { q: "Fluorescent dye shows where and when leakage starts.", a: "Tracer imaging", why: "A glowing tracer." },
            { q: "Junction markers and cell shape can be watched over time.", a: "Live cell imaging", why: "Watch the cells themselves." },
            { q: "Fluid leaving the chip is collected and analyzed to measure how much drug crossed.", a: "Outflow sampling", why: "Chemistry on the effluent." },
            { q: "A transparent chip makes every one of these easier. Which one needs a microscope and a dye?", a: "Tracer imaging", why: "Imaging the tracer." }
        ],
        4,
        "bbb-readouts-done",
        "You know the optical and chemical readouts",
        "A transparent chip makes every readout easier.",
        "Tracer, cells, outflow. Hit Reset to try again."
    );


    SIMS["bbb-monitor"] = function (root) {

        const defaults = { dose: 60 };
        const state = { dose: 60 };
        let day = 0;
        let hit = false;
        let fired = false;

        root.innerHTML =
            head("Watch: a barrier matures, then meets a drug") +
            canvasFor(680, 320, "A TEER trace over ten days. It climbs as the barrier matures. On day 6 a drug or inflammatory signal is added and the TEER drops; then it recovers. A moving marker shows the current day.") +
            '<div class="fd-stat-row">' + stat("Day", "d") + stat("TEER now (illustrative)", "t") + stat("What is happening", "w") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-restart>↻ Run it again</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Strength of the drug or inflammatory signal added on day 6", key: "dose", min: 0, max: 100, step: 5, value: 60 }) +
            "</div>" +
            '<p class="fd-sim-formula">Built-in sensors give a time series instead of a single snapshot. You can watch a barrier mature for days, see the moment a drug or an inflammatory signal loosens it, and then see whether it recovers. The question shifts from "is it tight?" to "how does it change?"</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function teer(d) {

            const base = 110 * (1 - Math.exp(-d / 2.5));
            const hit2 = d >= 6 ? state.dose / 100 * 85 * Math.exp(-(d - 6) / 1.6) : 0;

            return Math.max(5, base - hit2);
        }

        function update() {

            setVal(root, "dose", state.dose + " %");

            const d = Math.min(day, 10);

            out(root, "d", d.toFixed(1));
            out(root, "t", Math.round(teer(d)) + " Ω·cm²");
            out(root, "w", d < 6 ? "maturing" : d < 7.5 ? "the signal loosens the barrier" : "recovering");
            out(root, "verdict", d < 6 ? "The barrier is tightening day by day" : state.dose === 0 ? "No signal added: it just keeps maturing" : d < 7.5 ? "The moment the signal hits: TEER falls" : "Recovery: the barrier tightens again");
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (d) { return L + d / 10 * (R - L); };
            const Y = function (v) { return B - v / 120 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            for (let d = 0; d <= 10; d += 2) { txt(ctx, "day " + d, X(d), B + 18, 12, TEXT + ".7)"); }

            txt(ctx, "TEER ↑", L + 30, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = ROSE + ".8)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(X(6), T); ctx.lineTo(X(6), B);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "drug added", X(6) + 6, T + 14, 12, ROSE + "1)", "start");

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let d = 0; d <= Math.min(day, 10); d += 0.05) {

                if (d === 0) { ctx.moveTo(X(d), Y(teer(d))); } else { ctx.lineTo(X(d), Y(teer(d))); }
            }

            ctx.stroke();

            const d = Math.min(day, 10);

            dot(ctx, X(d), Y(teer(d)), 8, "rgba(255,255,255,1)");
        }

        animate(root, function (dt) {

            day = Math.min(11, day + dt * 0.9);
            update();
            draw();

            if (day >= 10 && !hit && state.dose >= 40) {

                hit = true;
                F.reward("bbb-monitor", 10, "You watched a barrier break and recover");
            }
        });

        root.querySelector("[data-restart]").addEventListener("click", function () { day = 0; });

        wire(root, state, defaults, function () { day = 0; });

        fired;
        update();
        draw();
    };


    /* ======================================
       UNIT 16: TESTING DRUGS AND MODELING DISEASE
    ====================================== */

    SIMS["bbb-benchmarks"] = quiz(
        "Game: benchmark drugs",
        ["Known to cross", "Known to be held back or blocked"],
        [
            { q: "Caffeine.", a: "Known to cross", why: "It crosses easily." },
            { q: "Sodium fluorescein.", a: "Known to be held back or blocked", why: "A good model holds it back." },
            { q: "A plain antibody.", a: "Known to be held back or blocked", why: "Nearly all plain antibodies are blocked almost completely." },
        ],
        4,
        "bbb-benchmarks-done",
        "You know the benchmark logic",
        "If the ranking looks wrong, the model is not ready.",
        "Caffeine crosses; fluorescein and plain antibodies do not. Hit Reset to try again."
    );


    SIMS["bbb-ranking"] = function (root) {

        const defaults = { leak: 5 };
        const state = { leak: 5 };
        const drugs = [
            { n: "Caffeine", p: 3e-5, c: TEAL },
            { n: "Fluorescein", p: 2e-6, c: GOLD },
            { n: "Plain antibody", p: 2e-7, c: ROSE }
        ];
        const seen = {};

        root.innerHTML =
            head("Try it: does the model rank the drugs sensibly?") +
            art("0 0 340 200", "Bars on a log scale for the apparent permeability a model measures for caffeine, fluorescein and a plain antibody. A good model shows caffeine well above fluorescein and the antibody far below. A leaky model squashes them together.") +
            '<div class="fd-stat-row">' + stat("Caffeine ÷ antibody", "r") + stat("Ranking", "k") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How leaky the model's barrier is", key: "leak", min: 0, max: 100, step: 5, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">A good model lets caffeine cross easily, holds back fluorescein, and blocks a plain antibody almost completely. The chart is illustrative, not measured data. If the ranking looks wrong, the model is not ready.</p>';

        const svg = root.querySelector("svg");

        function vals() {

            return drugs.map(function (d) { return d.p * (1 - state.leak / 100) + 1e-5 * state.leak / 100; });
        }

        function update() {

            const v = vals();
            const ratio = v[0] / v[2];

            setVal(root, "leak", state.leak + " %");
            seen[ratio > 30 ? "good" : ratio < 3 ? "bad" : "mid"] = true;
            out(root, "r", ratio.toFixed(1) + "×");
            out(root, "k", ratio > 30 ? "sensible: wide separation" : ratio > 8 ? "right order, compressed" : "poor: hard to tell them apart");
            out(root, "verdict", ratio > 30 ? "A trustworthy ranking" : ratio > 8 ? "Right order, but the gaps are squashed" : "The model has lost the ability to tell the drugs apart");

            const X = function (p) { return 100 + (Math.log10(p) + 7) / 3 * 200; };
            let s = "";

            drugs.forEach(function (d, i) {

                const y = 40 + i * 50;

                s += label(14, y + 14, d.n, 8, "start", "var(--text)");
                s += rect(100, y, Math.max(2, X(v[i]) - 100), 22, d.c + ".85)");
                s += label(X(v[i]) + 4, y + 15, v[i].toExponential(0).replace("e-", "×10⁻"), 7, "start", "var(--muted)");
            });

            s += label(200, 20, "apparent permeability (log scale, cm/s)", 7.5, "middle", "var(--muted)");

            svg.innerHTML = s;

            if (seen.good && seen.bad) {
                F.reward("bbb-ranking", 10, "You saw a leaky model lose its ranking");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["bbb-strategies2"] = quiz(
        "Game: test a way across",
        ["Shuttles", "Nanoparticles", "Opening"],
        [
            { q: "An antibody that binds the transferrin receptor carries a drug across: chips test whether it really does.", a: "Shuttles", why: "A fair test compares the shuttle against the same drug without one." },
            { q: "Particles coated with ligands: chips show whether they cross intact.", a: "Nanoparticles", why: "Do they arrive whole?" },
            { q: "Chips model how ultrasound or other signals loosen the barrier, and how it recovers.", a: "Opening", why: "Temporary, and it recovers." },
        ],
        4,
        "bbb-strategies2-done",
        "You know how chips test delivery strategies",
        "A fair test compares the shuttle against the same drug without one.",
        "Shuttles, nanoparticles, opening. Hit Reset to try again."
    );


    SIMS["bbb-diseases"] = quiz(
        "Game: which disease model?",
        ["Neurodegeneration", "Stroke", "Genetic disorders"],
        [
            { q: "Chips explore how disease-linked proteins and inflammation affect barrier cells.", a: "Neurodegeneration", why: "Alzheimer's and related conditions." },
            { q: "Low oxygen and glucose can loosen junctions, and chips can mimic those conditions.", a: "Stroke", why: "Starving the vessel loosens the seal." },
            { q: "Cells carrying a patient's mutation can reveal barrier defects.", a: "Genetic disorders", why: "Patient-derived cells." },
        ],
        4,
        "bbb-diseases-done",
        "You know the disease models",
        "The barrier is not only a hurdle for drugs. It is itself a target.",
        "Neurodegeneration, stroke, genetic disorders. Hit Reset to try again."
    );


    SIMS["bbb-personal"] = orderGame(
        "Game: a chip from one person's cells",
        [
            { n: "Collect cells from a patient", d: "for example skin or blood", why: "They carry the patient's genetic background." },
            { n: "Make iPSCs", d: "reprogram them into stem cells", why: "Stem cells can become many types." },
            { n: "Differentiate", d: "into brain-like barrier cells", why: "Guided by signals and growth factors." },
            { n: "Build the chip", d: "seed the cells and let the barrier mature", why: "A chip with that person's genetic background." },
            { n: "Test", d: "look for barrier differences or try treatments", why: "Still research, not routine care." }
        ],
        "bbb-personal-done",
        "You built a personalized chip in order",
        "Tap the five steps in the order they happen.",
        "A chip could one day help match a treatment to a person."
    );


    /* ======================================
       UNIT 17: LIMITS, VALIDATION, WHAT'S NEXT
    ====================================== */

    SIMS["bbb-honestlimits"] = quiz(
        "Game: where chips fall short",
        ["Variability", "Maturity", "Missing parts", "Materials"],
        [
            { q: "Cell lines, protocols and labs differ, so results do not always match.", a: "Variability", why: "Results vary." },
            { q: "TEER in many models is still below that in the body.", a: "Maturity", why: "The barrier is not yet fully mature." },
            { q: "Many chips lack neurons, immune cells or the brain's own fluid dynamics.", a: "Missing parts", why: "Real tissue has more." },
            { q: "PDMS can absorb some drugs, which skews the numbers.", a: "Materials", why: "The chip itself can distort results." }
        ],
        4,
        "bbb-honestlimits-done",
        "You know the honest limits",
        "Knowing the limits is part of using the tool well.",
        "Variability, maturity, missing parts, materials. Hit Reset to try again."
    );


    SIMS["bbb-scorecard"] = priority({
        title: "Try it: which model answers your question?",
        aria: "Bars showing how well four kinds of model fit the priorities you set.",
        key: "bbb-scorecard",
        props: [
            { k: "human", n: "Human cells" },
            { k: "flow", n: "Flow and forces" },
            { k: "thru", n: "Throughput" },
            { k: "body", n: "Whole-body effects" },
            { k: "cost", n: "Low cost" }
        ],
        fam: [
            { n: "Rodent study", c: ROSE, r: { human: 1, flow: 5, thru: 1, body: 5, cost: 1 } },
            { n: "Cells in a dish", c: BLUE, r: { human: 4, flow: 1, thru: 5, body: 1, cost: 5 } },
            { n: "Transwell", c: GOLD, r: { human: 4, flow: 1, thru: 4, body: 1, cost: 4 } },
            { n: "Barrier chip", c: TEAL, r: { human: 4, flow: 5, thru: 3, body: 1, cost: 3 } }
        ],
        foot: "Ratings are rough and relative (1 to 5). Chips combine human cells and flow at moderate throughput. They do not capture whole-body effects, which only an animal or human can. Each model answers different questions, so they work best as a team."
    });


    SIMS["bbb-kpuu"] = function (root) {

        const defaults = { q: 70 };
        const state = { q: 70 };
        const refs = [-2.0, -1.6, -1.2, -0.8, -0.5, -0.2, 0.0, 0.3];
        const names = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const rand = mulberry(5);
        const noise = refs.map(function () { return (rand() + rand() + rand() - 1.5) * 1.6; });
        let hit = false;

        root.innerHTML =
            head("Try it: does the model predict reality?") +
            canvasFor(680, 320, "A scatter plot of what a chip predicts for eight benchmark drugs against the brain-to-plasma ratio of unbound drug (Kp,uu) known from animal or clinical data. A good model puts the points along the diagonal.") +
            '<div class="fd-stat-row">' + stat("Agreement with the known values (R²)", "r2") + stat("Verdict", "v") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How well-built and validated the model is", key: "q", min: 0, max: 100, step: 5, value: 70 }) +
            "</div>" +
            '<p class="fd-sim-formula">Validation: match results with brain-to-plasma ratios of unbound drug, K<sub>p,uu</sub>, from animal or clinical data. A model earns trust by being right about things we already know. (Eight made-up drugs; the scatter is illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function pts() {

            const k = 1 - state.q / 100;

            return refs.map(function (r, i) { return { x: r, y: r + noise[i] * k * 1.2 }; });
        }

        function r2(p) {

            const n = p.length;
            const mx = p.reduce(function (a, q) { return a + q.x; }, 0) / n;
            const my = p.reduce(function (a, q) { return a + q.y; }, 0) / n;
            let sxy = 0;
            let sxx = 0;
            let syy = 0;

            p.forEach(function (q) {

                sxy += (q.x - mx) * (q.y - my);
                sxx += (q.x - mx) * (q.x - mx);
                syy += (q.y - my) * (q.y - my);
            });

            return syy ? (sxy * sxy) / (sxx * syy) : 0;
        }

        function update() {

            const v = r2(pts());

            setVal(root, "q", state.q + " %");
            out(root, "r2", v.toFixed(2));
            out(root, "v", v > 0.85 ? "predicts well" : v > 0.5 ? "some predictive value" : "not predictive");
            out(root, "verdict", v > 0.85 ? "The chip gets known drugs right: it earns some trust" : v > 0.5 ? "Partly right: not yet reliable" : "The points are scattered: the model does not predict reality");

            if (!hit && v > 0.9) {

                hit = true;
                F.reward("bbb-kpuu", 10, "You built a model that predicts known drugs");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 90;
            const R = 620;
            const T = 20;
            const B = 270;
            const X = function (v) { return L + (v + 2.6) / 3.4 * (R - L); };
            const Y = function (v) { return B - (v + 2.6) / 3.4 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            ctx.strokeStyle = GOLD + ".6)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(X(-2.6), Y(-2.6)); ctx.lineTo(X(0.8), Y(0.8));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "perfect agreement", X(-0.3), Y(-0.1) - 14, 12, GOLD + "1)");

            txt(ctx, "known Kp,uu from animal or clinical data (log) →", (L + R) / 2, B + 34, 13, TEXT + ".85)");
            txt(ctx, "chip prediction ↑", L + 50, T + 4, 12, TEXT + ".75)");

            pts().forEach(function (p, i) {

                dot(ctx, X(clamp(p.x, -2.6, 0.8)), Y(clamp(p.y, -2.6, 0.8)), 8, TEAL + ".95)");
                txt(ctx, names[i], X(clamp(p.x, -2.6, 0.8)), Y(clamp(p.y, -2.6, 0.8)) + 4, 10, "rgba(6,10,24,.95)", "center", true);
            });
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["bbb-next"] = quiz(
        "Game: where is the field heading?",
        ["Multi-organ", "Automation", "Regulation"],
        [
            { q: "Linking a barrier chip to gut or liver chips to follow a drug through the body.", a: "Multi-organ", why: "Connected chips." },
            { q: "Higher throughput and standard formats that fit lab robots.", a: "Automation", why: "Scaling up." },
            { q: "In 2025 the U.S. FDA announced a plan to reduce animal testing and encourage new methods such as organ-chips.", a: "Regulation", why: "The standards are catching up." },
        ],
        4,
        "bbb-next-done",
        "You know where the field is going",
        "The tools are maturing, and the standards are catching up.",
        "Multi-organ, automation, regulation. Hit Reset to try again."
    );


    SIMS["bbb-claimcheck"] = quiz(
        "Game: should you believe this chip claim?",
        ["Reasonably supported", "Ask more questions"],
        [
            { q: "'Our chip is tight.' (No cell type, no numbers.)", a: "Ask more questions", why: "Which cells? What numbers?" },
            { q: "'Stem-cell-derived cells with support cells, TEER and tracer leak measured the same way as in a Transwell, three benchmark drugs ranked correctly across five batches in two labs.'", a: "Reasonably supported", why: "Cells, numbers, benchmarks and replication are all stated." },
            { q: "'TEER of 3,000 Ω·cm² in our chip, higher than any Transwell.' (Different method, no mention of how it was measured.)", a: "Ask more questions", why: "Chip TEER is not Transwell TEER." },
            { q: "'It predicts brain uptake of any drug.' (Tested on two compounds, once.)", a: "Ask more questions", why: "Which benchmarks? How often?" }
        ],
        4,
        "bbb-claimcheck-done",
        "You know the questions to ask of a chip claim",
        "A chip is only as good as its validation, and you now know the questions to ask.",
        "Which cells, what numbers, which benchmarks, how often. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="bbb-"]').forEach(F.mount);

})();
