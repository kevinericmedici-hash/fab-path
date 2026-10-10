/* ========================================
   GLUCOSE SENSORS: INTERACTIVE SIMULATORS, PART 1

   Unit 1: balance game, units, a day of glucose, fingerstick vs CGM.
   Unit 2: interstitial fluid, lag, trend arrows.
   Unit 3: test strips, milestones.
   Unit 4: selectivity, sensing families, fluorescence.
   Unit 5: the enzyme: lock and key, the reaction, lifetime.
   Unit 6: amperometry, voltage, Faraday's law, calibration.

   Registers on window.FabInteract; shares the helpers from
   diagram-sims-mems.js. Chains diagram-sims-glu-b.js and -c.js.
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
    const RED = "rgba(235,80,90,";
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

    function hexagon(ctx, x, y, r, fill, stroke) {

        ctx.beginPath();

        for (let i = 0; i < 6; i++) {

            const a = Math.PI / 3 * i + Math.PI / 6;

            if (i === 0) { ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a)); } else { ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); }
        }

        ctx.closePath();

        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
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

    // A made-up day of glucose in mg/dL: three meals and one low between lunch and dinner.
    function bump(x) { return x > 0 ? x * Math.exp(1 - x) : 0; }

    function daily(t) {

        return 95 + 85 * bump((t - 6.5) / 1) + 95 * bump((t - 11.5) / 1.2) - 48 * bump((t - 15.6) / 0.9) + 90 * bump((t - 18.2) / 1.1);
    }

    F.gluHelpers = {
        TEAL: TEAL, GOLD: GOLD, ROSE: ROSE, BLUE: BLUE, GREY: GREY, TEXT: TEXT, RED: RED, PURPLE: PURPLE,
        canvasFor: canvasFor, clear: clear, txt: txt, dot: dot, hexagon: hexagon, arrow: arrow, daily: daily, bump: bump
    };


    /* ======================================
       UNIT 1: WHY MEASURE GLUCOSE?
    ====================================== */

    SIMS["glu-balance"] = function (root) {

        const defaults = { who: "healthy" };
        const state = { who: "healthy" };
        const seen = {};
        let g = 100;
        let carbs = 0; // glucose still arriving from food
        let ins = 0; // insulin on board
        let time = 0;
        let inRange = 0;
        let total = 0;
        let hist = [];
        let score = null;

        root.innerHTML =
            head("Game: keep glucose in range") +
            canvasFor(680, 320, "A live glucose trace. Pressing Eat sends glucose up. Pressing Insulin brings it down. In a healthy body, insulin responds on its own. In type 1 diabetes it does not, and in type 2 it responds weakly.") +
            '<div class="fd-stat-row">' + stat("Glucose now", "g") + stat("Time in range (70–180)", "tir") + stat("Time left", "left") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Whose body is this?", "who", [["healthy", "Healthy"], ["t1", "Type 1 (no insulin)"], ["t2", "Type 2 (weak response)"]]) +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-eat>🍝 Eat</button><button type="button" class="fd-sim-btn" data-insulin>💉 Insulin</button><button type="button" class="fd-sim-btn" data-run>🏃 Exercise</button></div>' +
            '<p class="fd-sim-formula">Insulin helps cells take glucose in, which lowers blood glucose. In type 1 the body stops making insulin, so it has to be replaced. In type 2 cells respond poorly. The goal is to keep glucose between 70 and 180 mg/dL by balancing food, activity and medication. (A very simplified model.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function restart() {

            g = 100;
            carbs = 0;
            ins = 0;
            time = 0;
            inRange = 0;
            total = 0;
            hist = [];
            score = null;
        }

        function update() {

            out(root, "g", Math.round(g) + " mg/dL");
            out(root, "tir", total ? Math.round(inRange / total * 100) + " %" : "—");
            out(root, "left", Math.max(0, Math.ceil(60 - time)) + " s");
            out(root, "verdict", g < 70 ? "Too low: this is the urgent danger" : g > 180 ? "Too high: damage over the years" : "In range");
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 280;
            const Y = function (v) { return B - (v - 40) / 320 * (B - T); };

            ctx.fillStyle = TEAL + ".12)";
            ctx.fillRect(L, Y(180), R - L, Y(70) - Y(180));
            txt(ctx, "target range 70–180", R - 90, Y(180) + 16, 12, TEAL + "1)");

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [70, 180, 300].forEach(function (v) { txt(ctx, v, L - 20, Y(v) + 4, 12, TEXT + ".7)"); });
            txt(ctx, "time →", (L + R) / 2, B + 30, 13, TEXT + ".8)");
            M.ylab(ctx, "glucose (mg/dL)", (T + B) / 2);

            ctx.strokeStyle = (g < 70 ? ROSE : g > 180 ? GOLD : TEAL) + ".98)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            hist.forEach(function (p, i) {

                const x = L + p[0] / 60 * (R - L);

                if (i === 0) { ctx.moveTo(x, Y(clamp(p[1], 40, 360))); } else { ctx.lineTo(x, Y(clamp(p[1], 40, 360))); }
            });

            ctx.stroke();

            if (hist.length) {

                const p = hist[hist.length - 1];

                dot(ctx, L + p[0] / 60 * (R - L), Y(clamp(p[1], 40, 360)), 7, "rgba(255,255,255,1)");
            }

            if (score !== null) { txt(ctx, "Time in range: " + score + " %", 340, 150, 22, GOLD + "1)", "center", true); }
        }

        animate(root, function (dt) {

            if (time < 60) {

                time += dt;

                // glucose in from food and the liver, out through insulin
                const sens = state.who === "healthy" ? 1 : state.who === "t2" ? 0.35 : 0.0;
                const auto = state.who === "healthy" ? Math.max(0, g - 100) * 0.022 : state.who === "t2" ? Math.max(0, g - 100) * 0.005 : 0;

                g += (carbs * 9 + (state.who === "t1" ? 2.2 : 0.6) - ins * 22 * Math.max(sens, 0.6) - auto * 18) * dt * 1.0;
                carbs *= Math.exp(-dt * 0.7);
                ins *= Math.exp(-dt * 0.5);

                if (state.who === "healthy") { g += (100 - g) * 0.4 * dt; }

                g = clamp(g, 30, 400);

                hist.push([time, g]);

                total++;

                if (g >= 70 && g <= 180) { inRange++; }

                if (time >= 60) {

                    score = Math.round(inRange / total * 100);
                    seen[state.who] = true;

                    if (score >= 70) { F.reward("glu-balance", 10, "You kept glucose in range"); }
                }

                update();
            }

            draw();
        });

        root.querySelector("[data-eat]").addEventListener("click", function () { carbs += 1.3; });
        root.querySelector("[data-insulin]").addEventListener("click", function () { ins += 1.1; });
        root.querySelector("[data-run]").addEventListener("click", function () { g -= 8; });

        wire(root, state, defaults, function () { restart(); update(); });
        root.querySelector("[data-reset]").addEventListener("click", function () { restart(); update(); });

        restart();
        update();
        draw();
    };


    SIMS["glu-units"] = function (root) {

        const defaults = { g: 110 };
        const state = { g: 110 };
        const seen = {};

        root.innerHTML =
            head("Try it: mg/dL, mmol/L and the zones") +
            art("0 0 340 150", "A glucose scale from 40 to 360 milligrams per deciliter with the target zone from 70 to 180 and a marker at the chosen value.") +
            '<div class="fd-stat-row">' + stat("In mg/dL (U.S.)", "mg") + stat("In mmol/L (much of the world)", "mm") + stat("Zone", "z") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Glucose", key: "g", min: 40, max: 360, step: 1, value: 110 }) +
            "</div>" +
            '<p class="fd-sim-formula">Divide mg/dL by about 18 to get mmol/L. A typical fasting level without diabetes is roughly 70 to 99 mg/dL. Most CGM users aim to spend as much of the day as possible between 70 and 180 mg/dL.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const z = state.g < 54 ? "dangerously low" : state.g < 70 ? "low" : state.g <= 99 ? "typical fasting range" : state.g <= 180 ? "in the target range" : state.g <= 250 ? "high" : "very high";

            seen[state.g < 70 ? "lo" : state.g > 180 ? "hi" : "ok"] = true;
            setVal(root, "g", state.g + " mg/dL");
            out(root, "mg", state.g + " mg/dL");
            out(root, "mm", (state.g / 18).toFixed(1) + " mmol/L");
            out(root, "z", z);
            out(root, "verdict", state.g < 70 ? "Below 70: can cause shakiness and confusion; lows are the urgent danger" : state.g > 180 ? "Above 180: years of highs damage eyes, kidneys, nerves and heart" : "In the range most CGM users aim for");

            const X = function (v) { return 20 + (v - 40) / 320 * 300; };

            svg.innerHTML =
                rect(X(40), 50, X(70) - X(40), 24, "rgba(255,105,120,.55)") +
                rect(X(70), 50, X(180) - X(70), 24, "rgba(84,224,199,.55)") +
                rect(X(180), 50, X(360) - X(180), 24, "rgba(255,214,102,.5)") +
                label(X(55), 90, "low", 7.5, "middle", "#ff6978") +
                label(X(125), 90, "target range", 7.5, "middle", "#54e0c7") +
                label(X(270), 90, "high", 7.5, "middle", "#ffd666") +
                '<polygon points="' + X(state.g) + ",48 " + (X(state.g) - 6) + ",34 " + (X(state.g) + 6) + ',34" style="fill:#fff"/>' +
                label(X(state.g), 28, state.g + " mg/dL = " + (state.g / 18).toFixed(1) + " mmol/L", 8, "middle", "var(--text)") +
                label(170, 130, "÷ 18", 9, "middle", "var(--muted)");

            if (seen.lo && seen.hi && seen.ok) {
                F.reward("glu-units", 10, "You visited the low, target and high zones");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["glu-stakes"] = quiz(
        "Game: too low or too high?",
        ["Too low", "Too high"],
        [
            { q: "Below 70 mg/dL: shakiness and confusion, and severe cases can cause seizures.", a: "Too low", why: "Lows are the urgent danger." },
            { q: "Years of this damage the eyes, kidneys, nerves and heart.", a: "Too high", why: "Highs are the long-term danger." },
            { q: "Can cause loss of consciousness within hours.", a: "Too low", why: "It acts fast." },
            { q: "A slow danger that builds over years.", a: "Too high", why: "Slow, but real." },
            { q: "A glucose of 55 mg/dL.", a: "Too low", why: "Well below 70." }
        ],
        4,
        "glu-stakes-done",
        "You know which danger is fast and which is slow",
        "Lows are the urgent danger, and highs are the long-term one.",
        "Too low is fast; too high is slow. Hit Reset to try again."
    );


    SIMS["glu-snapshot"] = function (root) {

        const defaults = { n: 3 };
        const state = { n: 3 };
        let hit = false;

        root.innerHTML =
            head("Try it: a snapshot or a movie?") +
            canvasFor(680, 320, "A day of glucose. A continuous glucose monitor draws the whole curve. Fingersticks are single dots, and a low between them can slip by unnoticed.") +
            '<div class="fd-stat-row">' + stat("Fingersticks today", "n") + stat("Did a fingerstick catch the low?", "low") + stat("What a CGM sees", "cgm") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Fingersticks spread through the day", key: "n", min: 1, max: 12, step: 1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">A fingerstick gives one number at one moment. A CGM reads automatically every few minutes and shows the trend. Glucose moves all day with meals, exercise, stress and insulin, so a single reading can miss the story. (A made-up day.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function times() {

            const t = [];

            for (let i = 0; i < state.n; i++) { t.push(6 + (state.n === 1 ? 6 : i * 16 / (state.n - 1))); }

            return t;
        }

        function update() {

            const ts = times();
            const caught = ts.some(function (t) { return daily(t) < 70; });
            const caughtHigh = ts.some(function (t) { return daily(t) > 180; });

            setVal(root, "n", state.n);
            out(root, "n", state.n);
            out(root, "low", caught ? "yes" : "no: it was missed");
            out(root, "cgm", "every low and high, with the trend");
            out(root, "verdict", caught ? "A fingerstick happened to land in the low" : "The low between the dots was invisible to fingersticks, but a CGM would have seen it");

            if (!hit && !caught && state.n >= 4) {

                hit = true;
                F.reward("glu-snapshot", 10, "You saw a low slip between fingersticks");
            }

            caughtHigh;
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (t) { return L + t / 24 * (R - L); };
            const Y = function (v) { return B - (v - 40) / 180 * (B - T); };

            ctx.fillStyle = TEAL + ".1)";
            ctx.fillRect(L, Y(180), R - L, Y(70) - Y(180));
            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();

            [70, 180].forEach(function (v) { txt(ctx, v, L - 20, Y(v) + 4, 12, TEXT + ".7)"); });
            M.ylab(ctx, "glucose (mg/dL)", (T + B) / 2);
            [0, 6, 12, 18, 24].forEach(function (h) { txt(ctx, h + ":00", X(h), B + 18, 12, TEXT + ".7)"); });

            ctx.strokeStyle = TEAL + ".95)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            for (let t = 0; t <= 24; t += 0.08) {

                if (t === 0) { ctx.moveTo(X(t), Y(daily(t))); } else { ctx.lineTo(X(t), Y(daily(t))); }
            }

            ctx.stroke();
            txt(ctx, "CGM: the whole curve", X(21.3), Y(150), 12, TEAL + "1)");

            times().forEach(function (t) {

                dot(ctx, X(t), Y(daily(t)), 8, GOLD + "1)");
                ctx.strokeStyle = GOLD + ".35)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(X(t), Y(daily(t))); ctx.lineTo(X(t), B);
                ctx.stroke();
            });

            txt(ctx, "● fingersticks: single snapshots", 330, 304, 13, GOLD + "1)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 2: BLOOD VERSUS THE FLUID UNDER YOUR SKIN
    ====================================== */

    SIMS["glu-diffuse"] = function (root) {

        const defaults = { c: 120 };
        const state = { c: 120 };
        const rand = mulberry(7);
        let parts = [];
        let reached = 0;
        let hit = false;

        root.innerHTML =
            head("Watch: glucose's short trip to the sensor") +
            canvasFor(680, 320, "A capillary on the left full of glucose molecules. Molecules diffuse through the capillary wall into the interstitial fluid between cells, and some reach the sensor filament on the right. It takes time.") +
            '<div class="fd-stat-row">' + stat("Glucose in the blood", "b") + stat("Reached the sensor", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Blood glucose", key: "c", min: 40, max: 300, step: 10, value: 120 }) +
            "</div>" +
            '<p class="fd-sim-formula">A CGM filament sits in interstitial fluid, the thin layer of fluid that surrounds your cells, not in a blood vessel. Glucose leaves the capillaries and diffuses through their wall into that fluid. Diffusion is fast over tiny distances, but it still takes time.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            setVal(root, "c", state.c + " mg/dL");
            out(root, "b", state.c + " mg/dL");
            out(root, "r", reached);
            out(root, "verdict", "Tissue-fluid glucose follows blood glucose, but not instantly");
        }

        function draw() {

            clear(ctx, 680, 320);

            ctx.fillStyle = RED + ".16)";
            ctx.fillRect(40, 20, 170, 280);
            txt(ctx, "capillary (blood)", 125, 40, 13, RED + "1)", "center", true);
            ctx.fillStyle = BLUE + ".07)";
            ctx.fillRect(210, 20, 430, 280);
            txt(ctx, "interstitial fluid", 380, 40, 13, TEXT + ".8)", "center", true);

            // the capillary wall with pores
            ctx.fillStyle = TEAL + ".6)";

            for (let i = 0; i < 9; i++) {

                if (i % 2) { continue; }

                ctx.fillRect(204, 20 + i * 32, 12, 30);
            }

            // cells in the tissue
            [[330, 120], [420, 220], [350, 250], [470, 90]].forEach(function (c) {

                ctx.fillStyle = PURPLE + ".25)";
                ctx.beginPath();
                ctx.arc(c[0], c[1], 28, 0, Math.PI * 2);
                ctx.fill();
            });

            // the sensor filament
            ctx.fillStyle = GOLD + ".9)";
            ctx.fillRect(560, 60, 14, 220);
            txt(ctx, "sensor", 567, 54, 12, GOLD + "1)");

            parts.forEach(function (p) { dot(ctx, p.x, p.y, 3.8, GOLD + ".95)"); });
        }

        animate(root, function (dt) {

            const rate = state.c / 120 * 0.35;

            if (rand() < rate) { parts.push({ x: 60 + rand() * 130, y: 50 + rand() * 230 }); }

            parts.forEach(function (p) {

                const inBlood = p.x < 204;

                p.x += (rand() - 0.5) * 140 * dt + (inBlood ? 10 : 22) * dt;
                p.y += (rand() - 0.5) * 140 * dt;
                p.y = clamp(p.y, 50, 290);

                if (p.x < 50) { p.x = 50; }

                // pass the wall only through pores
                if (p.x > 200 && p.x < 216) {

                    const pore = Math.floor((p.y - 20) / 32) % 2 === 1;

                    if (!pore && rand() < 0.9) { p.x = 198; }
                }

                if (p.x >= 556 && !p.done) {

                    p.done = true;
                    reached++;
                    update();
                }
            });

            parts = parts.filter(function (p) { return !p.done && p.x < 640; });

            if (parts.length > 160) { parts.splice(0, parts.length - 160); }

            if (!hit && reached >= 30) {

                hit = true;
                F.reward("glu-diffuse", 10, "You watched glucose reach the sensor");
            }

            draw();
        });

        wire(root, state, defaults, function () { update(); });

        update();
        draw();
    };


    SIMS["glu-lag"] = function (root) {

        const defaults = { lag: 10 };
        const state = { lag: 10 };
        let t = 0;
        let hit = false;
        const seen = {};

        root.innerHTML =
            head("Try it: the CGM curve runs behind blood") +
            canvasFor(680, 320, "A glucose rise and fall after a meal. The blood glucose curve is drawn in red and the CGM tissue-fluid curve in teal, the same shape shifted later in time by the lag. A moving cursor compares the two.") +
            '<div class="fd-stat-row">' + stat("Blood glucose now", "b") + stat("CGM shows", "c") + stat("The gap", "d") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Total lag (physiology plus signal processing)", key: "lag", min: 0, max: 20, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">The physiological lag between blood and tissue fluid is commonly reported as roughly 5 to 15 minutes, and the sensor\'s own signal processing can add a little more. The CGM curve has the same shape as blood glucose, shifted later in time.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function blood(h) { return 100 + 100 * bump((h - 0.4) / 0.6); }
        function cgm(h) { return blood(h - state.lag / 60); }

        function update() {

            setVal(root, "lag", state.lag + " min");
            seen[state.lag] = true;
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (h) { return L + h / 3 * (R - L); };
            const Y = function (v) { return B - (v - 60) / 160 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 1, 2, 3].forEach(function (h) { txt(ctx, h + " h", X(h), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "after a meal →", (L + R) / 2, B + 38, 13, TEXT + ".8)");
            M.ylab(ctx, "glucose (mg/dL)", (T + B) / 2);
            [80, 120, 160, 200].forEach(function (v) { txt(ctx, v, L - 20, Y(v) + 4, 12, TEXT + ".7)"); });

            [["blood", RED, blood], ["CGM (tissue fluid)", TEAL, cgm]].forEach(function (c) {

                ctx.strokeStyle = c[1] + ".98)";
                ctx.lineWidth = 3;
                ctx.beginPath();

                for (let h = 0; h <= 3; h += 0.02) {

                    if (h === 0) { ctx.moveTo(X(h), Y(c[2](h))); } else { ctx.lineTo(X(h), Y(c[2](h))); }
                }

                ctx.stroke();
            });

            txt(ctx, "blood", X(0.95), Y(205), 13, RED + "1)", "center", true);
            txt(ctx, "CGM", X(1.35 + state.lag / 120), Y(205), 13, TEAL + "1)", "center", true);

            // moving cursor
            const h = (t % 3);
            const b = blood(h);
            const c = cgm(h);

            ctx.strokeStyle = GOLD + ".7)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(X(h), T); ctx.lineTo(X(h), B);
            ctx.stroke();
            dot(ctx, X(h), Y(b), 7, RED + "1)");
            dot(ctx, X(h), Y(c), 7, TEAL + "1)");

            out(root, "b", Math.round(b) + " mg/dL");
            out(root, "c", Math.round(c) + " mg/dL");
            out(root, "d", Math.round(Math.abs(b - c)) + " mg/dL");
            out(root, "verdict", Math.abs(b - c) > 15 ? "While glucose is changing fast, the CGM and blood differ most" : Math.abs(b - c) < 4 ? "While glucose is steady, the two agree closely" : "A modest gap");

            if (!hit && Math.abs(b - c) > 25) {

                hit = true;
                F.reward("glu-lag", 10, "You saw lag open a big gap");
            }
        }

        animate(root, function (dt) {

            t += dt * 0.35;
            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["glu-lagwhen"] = function (root) {

        const defaults = { rate: 2, lag: 10 };
        const state = { rate: 2, lag: 10 };
        let hit = false;

        root.innerHTML =
            head("Try it: when does lag matter?") +
            art("0 0 340 160", "A bar showing how far the CGM reading trails the true blood value for a chosen rate of change and lag. Steady glucose shows no gap.") +
            '<div class="fd-stat-row">' + stat("How fast glucose is changing", "rate") + stat("CGM trails blood by about", "gap") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Rate of change", key: "rate", min: 0, max: 3, step: 0.1, value: 2 }) +
            slider({ label: "Lag", key: "lag", min: 0, max: 20, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">gap ≈ rate × lag. After meals, exercise or insulin glucose moves quickly and the CGM and blood differ more. Overnight, when glucose is flat, the two agree closely. Lag matters most exactly when glucose is changing fastest.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const gap = state.rate * state.lag;

            setVal(root, "rate", state.rate.toFixed(1) + " mg/dL per min");
            setVal(root, "lag", state.lag + " min");
            out(root, "rate", state.rate.toFixed(1) + " mg/dL per min");
            out(root, "gap", Math.round(gap) + " mg/dL");
            out(root, "verdict", state.rate < 0.3 ? "Steady: the gap nearly vanishes" : gap > 25 ? "A big gap: a reading could mislead during a fast change" : "A noticeable gap");

            svg.innerHTML =
                label(14, 22, "gap between CGM and blood: " + Math.round(gap) + " mg/dL", 8.5, "start", "var(--text)") +
                rect(14, 32, 300, 20, "rgba(170,179,207,.18)") +
                rect(14, 32, Math.min(300, gap / 60 * 300), 20, gap > 25 ? "rgba(255,105,120,.85)" : "rgba(84,224,199,.85)") +
                label(14, 90, "overnight (flat): about 0 mg/dL", 7.5, "start", "var(--muted)") +
                label(14, 108, "after a meal (about 2 mg/dL/min, 10 min lag): about 20 mg/dL", 7.5, "start", "var(--muted)");

            if (!hit && gap >= 30) {

                hit = true;
                F.reward("glu-lagwhen", 10, "You opened a big lag gap");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["glu-arrows"] = quiz(
        "Game: which trend arrow?",
        ["Rising fast ⬆", "Rising ↗", "Steady →", "Falling ↘", "Falling fast ⬇"],
        [
            { q: "Glucose 100 mg/dL, changing by about +3 mg/dL every minute.", a: "Rising fast ⬆", why: "A fast rise: the same 100 means something very different from a steady 100." },
            { q: "Glucose 120 mg/dL, changing by about +1.5 mg/dL per minute.", a: "Rising ↗", why: "A moderate rise." },
            { q: "Glucose 100 mg/dL, hardly changing.", a: "Steady →", why: "A steady reading." },
            { q: "Glucose 110 mg/dL, falling by about 1.5 mg/dL per minute.", a: "Falling ↘", why: "A moderate fall." },
            { q: "Glucose 90 mg/dL, falling by about 3 mg/dL every minute.", a: "Falling fast ⬇", why: "A fast fall: low is coming soon." }
        ],
        5,
        "glu-arrows-done",
        "You can read a trend arrow",
        "A reading of 100 that is falling fast means something very different from 100 that is steady.",
        "The arrow shows direction and speed. (Cut-offs here are illustrative; each CGM defines its own.) Hit Reset to try again."
    );


    /* ======================================
       UNIT 3: FROM TEST STRIPS TO CGM
    ====================================== */

    SIMS["glu-strip"] = function (root) {

        const defaults = { g: 120 };
        const state = { g: 120 };
        let fill = 0;
        let filling = false;
        let hit = false;

        root.innerHTML =
            head("Try it: a test strip is a one-use enzyme electrode") +
            canvasFor(680, 320, "A test strip with a drop of blood being drawn in over an enzyme and two electrodes. The enzyme reacts with glucose, electrons flow, and the meter turns the current into a number.") +
            '<div class="fd-stat-row">' + stat("Current the meter reads", "i") + stat("Reading", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-drop>🩸 Add a drop of blood</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Glucose in the blood", key: "g", min: 40, max: 360, step: 5, value: 120 }) +
            "</div>" +
            '<p class="fd-sim-formula">Through the 1970s and 1980s, handheld meters and disposable strips let people measure their own blood glucose at home. A strip holds the enzyme and electrodes, and the meter reads the current from one drop of blood. A test strip is a single-use version of the same enzyme electrode.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let t = 0;

        function update() {

            setVal(root, "g", state.g + " mg/dL");

            const cur = state.g * 0.05; // µA, illustrative

            out(root, "i", fill > 0.95 ? cur.toFixed(1) + " µA (illustrative)" : "waiting for a drop");
            out(root, "r", fill > 0.95 ? state.g + " mg/dL" : "—");
            out(root, "verdict", fill > 0.95 ? "More glucose, more current: the meter converts it to a number" : "Press the button to add blood");
        }

        function draw() {

            clear(ctx, 680, 320);

            // the strip
            ctx.fillStyle = GREY + ".75)";
            ctx.fillRect(80, 120, 380, 80);
            ctx.fillStyle = GOLD + ".9)";
            ctx.fillRect(300, 138, 90, 44);
            txt(ctx, "enzyme + electrodes", 345, 164, 11, "rgba(6,10,24,.95)", "center", true);
            ctx.fillStyle = TEAL + ".9)";
            ctx.fillRect(300, 126, 90, 8);
            ctx.fillRect(300, 186, 90, 8);

            // blood channel filling from the right end
            ctx.fillStyle = RED + ".85)";
            ctx.fillRect(460 - 380 * fill * 0.45, 148, 380 * fill * 0.45, 24);

            // the drop
            if (filling && fill < 0.2) { dot(ctx, 480, 118 + fill * 200, 14, RED + ".95)"); }

            // the meter
            ctx.fillStyle = "rgba(20,28,52,1)";
            ctx.strokeStyle = TEXT + ".6)";
            ctx.lineWidth = 2;
            ctx.fillRect(500, 70, 150, 190);
            ctx.strokeRect(500, 70, 150, 190);
            ctx.fillStyle = "rgba(120,200,150,.35)";
            ctx.fillRect(516, 90, 118, 60);
            txt(ctx, fill > 0.95 ? String(state.g) : "---", 575, 134, 30, fill > 0.95 ? "rgba(180,255,200,1)" : TEXT + ".4)", "center", true);
            txt(ctx, "mg/dL", 575, 164, 12, TEXT + ".7)");
            txt(ctx, "meter", 575, 232, 13, TEXT + ".8)");

            // electrons flow when filled
            if (fill > 0.95) {

                for (let i = 0; i < 5; i++) {

                    const u = ((t * 0.5 * (0.4 + state.g / 360) + i / 5) % 1);

                    dot(ctx, 390 + u * 110, 122 + Math.sin(u * 6) * 4, 3.2, BLUE + ".95)");
                }

                txt(ctx, "electrons → meter", 440, 106, 11, BLUE + "1)");
            }
        }

        animate(root, function (dt) {

            t += dt;

            if (filling) { fill = Math.min(1, fill + dt * 0.7); }

            if (fill >= 1 && !hit) {

                hit = true;
                F.reward("glu-strip", 10, "You ran a test strip");
            }

            update();
            draw();
        });

        root.querySelector("[data-drop]").addEventListener("click", function () { fill = 0; filling = true; });

        wire(root, state, defaults, function () { fill = 0; filling = false; update(); });

        update();
        draw();
    };


    SIMS["glu-eras"] = quiz(
        "Game: which era?",
        ["Test strips and meters", "The first CGMs", "Calibration-free and implantable", "Over the counter"],
        [
            { q: "Handheld meters let people measure their own blood glucose at home, from one drop of blood.", a: "Test strips and meters", why: "The 1970s and 1980s." },
            { q: "The first FDA-approved one recorded data that was reviewed afterward, not live (1999).", a: "The first CGMs", why: "Not yet real-time." },
            { q: "Dexcom G6 was cleared without routine fingerstick calibration; Eversense became the first fully implantable CGM (2018).", a: "Calibration-free and implantable", why: "Factory calibration arrived." },
            { q: "Dexcom Stelo and Abbott Lingo (2024) for adults who do not use insulin.", a: "Over the counter", why: "A health tool for many." },
            { q: "Real-time CGMs with short wear times and frequent fingerstick calibration.", a: "The first CGMs", why: "Early CGMs were short-lived and needed regular calibration." }
        ],
        5,
        "glu-eras-done",
        "You know the eras",
        "Each step made sensors smaller, easier to wear, and less work.",
        "Strips, early CGMs, calibration-free, over the counter. Hit Reset to try again."
    );


    SIMS["glu-timeline"] = orderGame(
        "Game: put the milestones in order",
        [
            { n: "Enzyme electrode", d: "Leland Clark proposes it", why: "1962. The core idea of nearly every glucose sensor." },
            { n: "Home meters and strips", d: "handheld meters and disposable strips", why: "1970s–80s. Self-testing begins." },
            { n: "First approved CGM", d: "reviewed afterward, not live", why: "1999. Continuous, but not live." },
            { n: "Calibration-free CGM", d: "Dexcom G6 without routine calibration; Eversense implant", why: "2018. Calibration-free and implantable." },
            { n: "Sensor and transmitter combined", d: "Dexcom G7", why: "2022. Smaller and simpler." },
            { n: "Over-the-counter CGMs", d: "no prescription needed", why: "2024. Stelo and Lingo." }
        ],
        "glu-timeline-done",
        "You ordered the history of glucose sensing",
        "Tap the six milestones in the order they happened.",
        "The big idea is more than 60 years old. Everything since has been making it small, stable and wearable."
    );


    /* ======================================
       UNIT 4: WAYS TO SENSE GLUCOSE
    ====================================== */

    SIMS["glu-families"] = quiz(
        "Game: which family of sensing?",
        ["Electrochemical", "Optical", "Other fluids"],
        [
            { q: "A reaction with glucose produces electrons, which become a current.", a: "Electrochemical", why: "Almost every commercial CGM uses this or optical." },
            { q: "Glucose changes how a material absorbs, scatters or gives off light.", a: "Optical", why: "Light replaces electrons." },
            { q: "Sensing glucose in sweat, tears, saliva or breath instead of tissue fluid.", a: "Other fluids", why: "No needle, but a harder signal." },
            { q: "Used by most commercial CGMs today.", a: "Electrochemical", why: "Enzymatic and electrochemical." },
            { q: "A glucose-binding material changes how brightly it glows.", a: "Optical", why: "Fluorescence." }
        ],
        4,
        "glu-families-done",
        "You know the three families",
        "Almost every commercial CGM sold today uses the first two.",
        "Electrochemical, optical, other fluids. Hit Reset to try again."
    );


    SIMS["glu-selectivity"] = function (root) {

        const defaults = { kind: "enzyme" };
        const state = { kind: "enzyme" };
        const seen = {};
        const rand = mulberry(11);
        let mols = [];
        let counts = { glu: 0, other: 0 };

        root.innerHTML =
            head("Try it: picking one sugar out of a messy fluid") +
            canvasFor(680, 320, "A mixed fluid containing glucose and look-alike molecules such as other sugars, vitamin C and acetaminophen drifting toward an electrode. With an enzyme coating only glucose reacts. With a bare metal electrode the other molecules react too and add false current.") +
            '<div class="fd-stat-row">' + stat("Current from glucose", "g") + stat("False current from look-alikes", "o") + stat("How much of the signal is real", "s") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrode", "kind", [["enzyme", "Enzyme-coated (enzymatic)"], ["bare", "Bare metal (non-enzymatic)"]]) +
            '<p class="fd-sim-formula">A glucose sensor must pick out glucose from many other molecules, including other sugars, drugs and vitamins. An enzyme such as glucose oxidase reacts only with glucose, which gives excellent selectivity. A metal such as platinum, gold or nickel oxide catalyzes glucose directly, which is simpler but less selective: commercial CGMs use enzymes. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function reset() {

            mols = [];
            counts = { glu: 0, other: 0 };
        }

        function update() {

            seen[state.kind] = true;

            const real = counts.glu;
            const fake = state.kind === "bare" ? counts.other : 0;
            const tot = real + fake;

            out(root, "g", real);
            out(root, "o", fake);
            out(root, "s", tot ? Math.round(real / tot * 100) + " %" : "—");
            out(root, "verdict", state.kind === "enzyme" ? "The enzyme is what lets the sensor ignore everything that is not glucose" : "A bare electrode cannot tell glucose from its look-alikes");

            if (seen.enzyme && seen.bare && tot > 20) {
                F.reward("glu-selectivity", 10, "You saw why the enzyme gives selectivity");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            ctx.fillStyle = BLUE + ".07)";
            ctx.fillRect(40, 20, 480, 280);
            ctx.fillStyle = GOLD + ".9)";
            ctx.fillRect(520, 20, 30, 280);
            txt(ctx, "electrode", 535, 316, 12, GOLD + "1)");

            if (state.kind === "enzyme") {

                ctx.fillStyle = PURPLE + ".5)";
                ctx.fillRect(490, 20, 30, 280);
                txt(ctx, "enzyme", 505, 12, 11, PURPLE + "1)");
            }

            mols.forEach(function (m) {

                if (m.t === "glu") { hexagon(ctx, m.x, m.y, 9, TEAL + ".95)", null); } else { dot(ctx, m.x, m.y, 6, (m.t === "vitc" ? ROSE : GREY) + ".95)"); }
            });

            txt(ctx, "⬡ glucose    ● vitamin C, acetaminophen, other sugars", 280, 296, 12, TEXT + ".75)");
        }

        animate(root, function (dt) {

            if (rand() < 0.1) {

                const r = rand();

                mols.push({ x: 50, y: 30 + rand() * 260, t: r < 0.4 ? "glu" : r < 0.7 ? "vitc" : "oth" });
            }

            mols.forEach(function (m) {

                m.x += (60 + rand() * 40) * dt;
                m.y += (rand() - 0.5) * 60 * dt;

                const wall = state.kind === "enzyme" ? 490 : 520;

                if (m.x >= wall) {

                    if (m.t === "glu") { counts.glu++; } else { counts.other++; }

                    m.done = true;
                }
            });

            mols = mols.filter(function (m) { return !m.done; });

            if (Math.floor(performance.now() / 400) !== (animate.last || 0)) { animate.last = Math.floor(performance.now() / 400); update(); }

            draw();
        });

        wire(root, state, defaults, function () { reset(); update(); });

        reset();
        update();
        draw();
    };


    SIMS["glu-optical"] = function (root) {

        const defaults = { g: 120 };
        const state = { g: 120 };
        let t = 0;

        root.innerHTML =
            head("Try it: glucose changes the glow") +
            canvasFor(680, 300, "A glucose-indicating material lit by an LED. The more glucose binds, the brighter the material glows, and a photodiode measures the glow.") +
            '<div class="fd-stat-row">' + stat("Glow measured", "glow") + stat("Reading", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Glucose", key: "g", min: 40, max: 360, step: 5, value: 120 }) +
            "</div>" +
            '<p class="fd-sim-formula">Fluorescence: a glucose-binding material changes how brightly it glows, and implantable CGMs use it. Optical methods avoid consuming a reaction, but the glucose signal is often very weak. (Illustrative scale.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function glow() { return 0.15 + 0.85 * state.g / 360; }

        function update() {

            setVal(root, "g", state.g + " mg/dL");
            out(root, "glow", Math.round(glow() * 100) + " % brightness");
            out(root, "r", state.g + " mg/dL");
            out(root, "verdict", "Light replaces electrons as the signal");
        }

        function draw() {

            clear(ctx, 680, 300);

            // LED
            ctx.fillStyle = BLUE + ".9)";
            ctx.fillRect(80, 130, 60, 40);
            txt(ctx, "LED", 110, 190, 12, BLUE + "1)");
            ctx.strokeStyle = BLUE + ".6)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(140, 150); ctx.lineTo(240, 150);
            ctx.stroke();

            // glowing polymer
            const g = ctx.createRadialGradient(330, 150, 8, 330, 150, 90);

            g.addColorStop(0, "rgba(120,255,160," + glow() + ")");
            g.addColorStop(1, "rgba(120,255,160,0)");
            ctx.fillStyle = g;
            ctx.fillRect(220, 40, 220, 220);
            ctx.fillStyle = "rgba(120,255,160," + (0.3 + glow() * 0.6) + ")";
            ctx.fillRect(280, 110, 100, 80);
            txt(ctx, "glucose-indicating polymer", 330, 214, 12, TEXT + ".85)");

            // glucose molecules binding
            const n = Math.round(state.g / 360 * 14) + 1;

            for (let i = 0; i < n; i++) {

                const a = i / n * 6.283 + t * 0.4;

                hexagon(ctx, 330 + Math.cos(a) * 62, 150 + Math.sin(a) * 52, 6, TEAL + ".9)", null);
            }

            // photodiode
            ctx.fillStyle = GOLD + ".9)";
            ctx.fillRect(520, 130, 60, 40);
            txt(ctx, "photodiode", 550, 190, 12, GOLD + "1)");
            ctx.strokeStyle = "rgba(120,255,160,.5)";
            ctx.lineWidth = 3 * glow() + 1;
            ctx.beginPath();
            ctx.moveTo(440, 150); ctx.lineTo(520, 150);
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


    SIMS["glu-landscape"] = quiz(
        "Game: who uses what?",
        ["Enzymatic, electrochemical", "Fluorescence-based, implanted"],
        [
            { q: "Dexcom.", a: "Enzymatic, electrochemical", why: "Worn on the skin." },
            { q: "Abbott FreeStyle Libre.", a: "Enzymatic, electrochemical", why: "Worn on the skin." },
            { q: "Senseonics Eversense.", a: "Fluorescence-based, implanted", why: "Implanted under the skin." },
            { q: "Medtronic Guardian.", a: "Enzymatic, electrochemical", why: "Worn on the skin." }
        ],
        4,
        "glu-landscape-done",
        "You know who uses what",
        "The next units open up how each of these works.",
        "Three enzymatic, one fluorescent. Hit Reset to try again."
    );


    /* ======================================
       UNIT 5: THE ENZYME
    ====================================== */

    SIMS["glu-lockkey"] = function (root) {

        const defaults = {};
        const state = {};
        const tried = {};
        let phase = 0;
        let current = null;
        let t = 0;
        const mols = {
            glucose: { n: "Glucose", fits: true },
            fructose: { n: "Fructose", fits: false },
            vitc: { n: "Vitamin C", fits: false },
            apap: { n: "Acetaminophen", fits: false }
        };

        root.innerHTML =
            head("Try it: lock and key") +
            canvasFor(680, 300, "A glucose oxidase enzyme with a pocket shaped for glucose. Choose a molecule to send to the enzyme: glucose fits and reacts; other sugars and drugs do not.") +
            '<div class="fd-stat-row">' + stat("Molecules tried", "n") + stat("Result", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-seg"><span class="fd-seg-label">Send a molecule to the enzyme</span>' + Object.keys(mols).map(function (k) { return '<button type="button" class="fd-sim-btn" data-send="' + k + '">' + mols[k].n + "</button>"; }).join("") + "</div>" +
            '<p class="fd-sim-formula">Glucose oxidase (GOx) is a protein first found in fungi. It reacts with glucose and almost nothing else. Like all enzymes it is a catalyst, so one enzyme molecule can process many glucose molecules without being used up. GOx is selective because its shape fits glucose like a lock fits a key.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            out(root, "n", Object.keys(tried).length + " of 4");
            out(root, "r", current ? (mols[current].fits ? "fits and reacts" : "does not fit") : "—");
            out(root, "verdict", current ? (mols[current].fits ? "Glucose fits the pocket, so the enzyme reacts with it" : mols[current].n + " has the wrong shape: it bounces off") : "Pick a molecule");

            if (Object.keys(tried).length >= 4) {
                F.reward("glu-lockkey", 10, "You tested four molecules against the enzyme");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            // the enzyme with a pocket
            ctx.fillStyle = PURPLE + ".55)";
            ctx.beginPath();
            ctx.arc(480, 150, 105, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(6,10,24,.9)";
            hexagon(ctx, 410, 150, 28, "rgba(6,10,24,.9)", null);
            txt(ctx, "glucose oxidase", 500, 80, 14, "rgba(6,10,24,.9)", "center", true);
            txt(ctx, "pocket", 410, 195, 11, TEXT + ".8)");

            if (current) {

                const m = mols[current];
                const u = Math.min(1, phase);
                const x = 80 + u * (m.fits ? 330 : 270) - (m.fits ? 0 : Math.max(0, phase - 1) * 120);
                const y = 150;

                if (current === "glucose") { hexagon(ctx, x, y, 26, TEAL + ".95)", null); }
                else if (current === "fructose") { ctx.fillStyle = ROSE + ".95)"; ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x + 26, y - 6); ctx.lineTo(x + 16, y + 24); ctx.lineTo(x - 16, y + 24); ctx.lineTo(x - 26, y - 6); ctx.closePath(); ctx.fill(); }
                else if (current === "vitc") { ctx.fillStyle = GOLD + ".95)"; ctx.fillRect(x - 24, y - 20, 48, 40); }
                else { dot(ctx, x, y, 22, GREY + ".95)"); }

                txt(ctx, m.n, x, y + 48, 12, TEXT + ".85)");

                if (m.fits && phase >= 1) { txt(ctx, "✔ reacts", 410, 118, 14, TEAL + "1)", "center", true); }
                if (!m.fits && phase >= 1) { txt(ctx, "✖ no fit", 330, 110, 14, ROSE + "1)", "center", true); }
            }
        }

        animate(root, function (dt) {

            if (current) { phase += dt * 0.9; }

            t += dt;
            draw();
        });

        root.querySelectorAll("[data-send]").forEach(function (b) {

            b.addEventListener("click", function () {

                current = b.dataset.send;
                phase = 0;
                tried[current] = true;
                update();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            current = null;
            Object.keys(tried).forEach(function (k) { delete tried[k]; });
            update();
        });

        update();
        draw();
    };


    SIMS["glu-reaction"] = stepper({
        title: "Watch: the enzyme's two half-steps",
        aria: "Glucose oxidase with its FAD group. Glucose gives electrons to FAD and becomes gluconolactone. Oxygen then takes the electrons back and becomes hydrogen peroxide, resetting the enzyme.",
        viewBox: "0 0 340 190",
        interval: 3.4,
        rewardKey: "glu-reaction",
        rewardMsg: "You followed the whole enzyme cycle",
        steps: [
            { t: "1. Glucose binds", tool: "enzyme + glucose", text: "Glucose slips into the pocket of glucose oxidase, next to its built-in FAD group." },
            { t: "2. Glucose hands over electrons", tool: "FAD becomes FADH₂", text: "Glucose gives electrons to the FAD group and becomes gluconolactone, which leaves." },
            { t: "3. Oxygen takes the electrons", tool: "O₂ becomes H₂O₂", text: "Oxygen takes those electrons back from the enzyme, which makes hydrogen peroxide." },
            { t: "4. Ready for the next glucose", tool: "enzyme reset", text: "The enzyme is back to its starting state. The hydrogen peroxide is the product an electrode can detect." }
        ],
        draw: function (step, st) {

            const a = st.anim || 0;
            let s = '<circle cx="170" cy="95" r="62" style="fill:rgba(190,150,255,.5)"/>' + label(170, 52, "glucose oxidase", 8, "middle", "var(--text)");

            // FAD group
            const fadOn = step === 1 || step === 2;

            s += rect(150, 84, 40, 22, fadOn ? "rgba(255,214,102,.95)" : "rgba(255,214,102,.45)", "rgba(255,255,255,.7)");
            s += label(170, 99, fadOn ? "FADH₂" : "FAD", 8, "middle", "#04201b");

            if (step === 0) {

                const x = 60 + Math.min(1, (a % 3.4) / 1.5) * 60;

                s += '<polygon points="' + hex(x, 95, 14) + '" style="fill:rgba(84,224,199,.95)"/>' + label(x, 125, "glucose", 7, "middle", "var(--text)");
            }

            if (step === 1) {

                s += '<polygon points="' + hex(110, 95, 12) + '" style="fill:rgba(84,224,199,.5)"/>' + label(92, 125, "gluconolactone leaves", 7, "middle", "var(--muted)");
                s += '<circle cx="' + (120 + (a % 1.2) * 20) + '" cy="95" r="3" style="fill:#7eb6ff"/><circle cx="' + (118 + (a % 1.2) * 20) + '" cy="88" r="3" style="fill:#7eb6ff"/>';
            }

            if (step === 2) {

                const x = 285 - Math.min(1, (a % 3.4) / 1.5) * 65;

                s += '<circle cx="' + x + '" cy="95" r="12" style="fill:rgba(255,105,120,.95)"/>' + label(x, 99, "O₂", 8, "middle", "#04201b");
                s += '<circle cx="' + (205 - (a % 1.2) * 12) + '" cy="95" r="3" style="fill:#7eb6ff"/>';
            }

            if (step === 3) {

                s += '<circle cx="265" cy="95" r="14" style="fill:rgba(255,214,102,.95)"/>' + label(265, 99, "H₂O₂", 7.5, "middle", "#04201b");
                s += label(265, 125, "to the electrode →", 7, "middle", "var(--muted)");
                s += label(170, 170, "enzyme reset: ready again", 8, "middle", "var(--accent)");
            }

            return s;

            function hex(x, y, r) {

                let p = "";

                for (let i = 0; i < 6; i++) {

                    const ang = Math.PI / 3 * i + Math.PI / 6;

                    p += (x + r * Math.cos(ang)).toFixed(1) + "," + (y + r * Math.sin(ang)).toFixed(1) + " ";
                }

                return p;
            }
        }
    });


    SIMS["glu-halfsteps"] = quiz(
        "Game: which half-step?",
        ["Step 1", "Step 2"],
        [
            { q: "Glucose hands electrons to the enzyme's built-in FAD group, and becomes gluconolactone.", a: "Step 1", why: "The enzyme is reduced." },
            { q: "Oxygen takes those electrons back, which makes hydrogen peroxide.", a: "Step 2", why: "Oxygen is the natural electron acceptor." },
            { q: "The enzyme is back to its starting state and ready for the next glucose.", a: "Step 2", why: "The cycle is complete." },
            { q: "Gluconolactone is made.", a: "Step 1", why: "From the glucose." }
        ],
        4,
        "glu-halfsteps-done",
        "You know the two half-steps",
        "Oxygen acts as the natural electron acceptor in this reaction.",
        "Glucose gives, oxygen takes. Hit Reset to try again."
    );


    SIMS["glu-enzymes"] = quiz(
        "Game: oxidase or dehydrogenase?",
        ["Glucose oxidase", "Glucose dehydrogenase"],
        [
            { q: "Very selective for glucose and well studied, but its oxygen dependence has to be managed.", a: "Glucose oxidase", why: "Used in the commercial CGMs here." },
            { q: "Does not need oxygen. Common in test strips.", a: "Glucose dehydrogenase", why: "No oxygen needed." },
            { q: "Some versions also react with other sugars.", a: "Glucose dehydrogenase", why: "A selectivity catch." },
            { q: "Makes hydrogen peroxide as a product.", a: "Glucose oxidase", why: "Oxygen takes the electrons." }
        ],
        4,
        "glu-enzymes-done",
        "You can tell the enzymes apart",
        "The right enzyme depends on where the sensor will be used.",
        "Oxidase needs oxygen; dehydrogenase does not. Hit Reset to try again."
    );


    SIMS["glu-enzymelife"] = function (root) {

        const defaults = { T: 25, d: 7 };
        const state = { T: 25, d: 7 };
        let hit = false;

        root.innerHTML =
            head("Try it: enzymes do not last forever") +
            art("0 0 340 190", "A bar showing how much enzyme activity remains after the chosen storage temperature and time, and a line marking the point where a sensor would stop being reliable.") +
            '<div class="fd-stat-row">' + stat("Activity left", "a") + stat("Verdict", "v") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Temperature", key: "T", min: 4, max: 70, step: 1, value: 25 }) +
            slider({ label: "Time", key: "d", min: 0, max: 30, step: 1, value: 7 }) +
            "</div>" +
            '<p class="fd-sim-formula">High temperatures unfold the protein and destroy its shape. Over time enzymes slowly lose activity, which limits how long a sensor works. Layers around the enzyme and careful storage extend its life. Enzyme stability is one reason sensors are replaced every week or two. (Illustrative decay model.)</p>';

        const svg = root.querySelector("svg");

        function activity() {

            const k = 0.004 * Math.pow(1.22, (state.T - 25)) + (state.T > 50 ? (state.T - 50) * 0.15 : 0);

            return Math.exp(-k * state.d);
        }

        function update() {

            const a = activity();

            setVal(root, "T", state.T + " °C");
            setVal(root, "d", state.d + " days");
            out(root, "a", Math.round(a * 100) + " %");
            out(root, "v", a > 0.8 ? "healthy" : a > 0.5 ? "weakening" : "mostly lost");
            out(root, "verdict", state.T > 50 ? "High temperature unfolds the protein: it dies quickly" : a > 0.8 ? "Plenty of activity left" : a > 0.5 ? "Losing activity: shelf life is limited" : "Most of the enzyme has gone");

            svg.innerHTML =
                label(14, 22, "enzyme activity left", 8, "start", "var(--muted)") +
                rect(14, 30, 300, 26, "rgba(170,179,207,.18)") +
                rect(14, 30, 300 * a, 26, a > 0.8 ? "rgba(84,224,199,.9)" : a > 0.5 ? "rgba(255,214,102,.85)" : "rgba(255,105,120,.85)") +
                '<line x1="' + (14 + 300 * 0.6) + '" y1="26" x2="' + (14 + 300 * 0.6) + '" y2="62" style="stroke:#fff;stroke-width:1.4;stroke-dasharray:3 2"/>' +
                label(14 + 300 * 0.6, 76, "a sensor stops being reliable below about here", 6.5, "middle", "var(--muted)") +
                label(14, 130, Math.round(a * 100) + " % after " + state.d + " days at " + state.T + " °C", 9, "start", "var(--text)");

            if (!hit && state.T >= 60 && a < 0.2) {

                hit = true;
                F.reward("glu-enzymelife", 10, "You cooked an enzyme");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 6: MEASURING GLUCOSE WITH ELECTRICITY
    ====================================== */

    SIMS["glu-amperometry"] = function (root) {

        const defaults = { g: 120 };
        const state = { g: 120 };
        const rand = mulberry(3);
        let mols = [];
        let t = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: counting electrons") +
            canvasFor(680, 320, "Hydrogen peroxide molecules reaching a platinum electrode. Each one that reacts releases two electrons, which flow through a wire as a current. More glucose makes more peroxide, more electrons per second, and a bigger current.") +
            '<div class="fd-stat-row">' + stat("Glucose", "g") + stat("Electrons per second (relative)", "e") + stat("Current", "i") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Glucose", key: "g", min: 40, max: 360, step: 10, value: 120 }) +
            "</div>" +
            '<p class="fd-sim-formula">Each hydrogen peroxide molecule that reacts at the electrode releases a fixed number of electrons. A flow of electrons is a current. Measuring that current is called amperometry: it measures how fast glucose is being converted.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        let electrons = [];

        function update() {

            setVal(root, "g", state.g + " mg/dL");
            out(root, "g", state.g + " mg/dL");
            out(root, "e", Math.round(state.g / 120 * 100) + " %");
            out(root, "i", (state.g * 0.15).toFixed(0) + " nA (illustrative)");
            out(root, "verdict", "More glucose means more electrons per second, and a bigger current");
        }

        function draw() {

            clear(ctx, 680, 320);

            ctx.fillStyle = BLUE + ".07)";
            ctx.fillRect(40, 20, 430, 280);
            ctx.fillStyle = GREY + ".8)";
            ctx.fillRect(470, 20, 36, 280);
            txt(ctx, "platinum electrode", 488, 316, 12, TEXT + ".8)");
            txt(ctx, "tissue fluid", 160, 40, 13, TEXT + ".75)");

            mols.forEach(function (m) {

                dot(ctx, m.x, m.y, 7, GOLD + ".95)");
                txt(ctx, "H₂O₂", m.x, m.y + 3, 7, "rgba(6,10,24,.95)", "center", true);
            });

            // wire to the meter
            ctx.strokeStyle = TEXT + ".6)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(506, 80); ctx.lineTo(580, 80); ctx.lineTo(580, 240); ctx.lineTo(506, 240);
            ctx.stroke();
            ctx.fillStyle = "rgba(20,28,52,1)";
            ctx.fillRect(560, 140, 60, 40);
            ctx.strokeStyle = TEXT + ".6)";
            ctx.strokeRect(560, 140, 60, 40);
            txt(ctx, "meter", 590, 165, 11, TEXT + ".8)");

            electrons.forEach(function (e) {

                const u = e.u;
                let x;
                let y;

                if (u < 0.3) { x = 506 + (u / 0.3) * 74; y = 80; }
                else if (u < 0.7) { x = 580; y = 80 + ((u - 0.3) / 0.4) * 160; }
                else { x = 580 - ((u - 0.7) / 0.3) * 74; y = 240; }

                dot(ctx, x, y, 3.4, BLUE + ".98)");
            });

            txt(ctx, "e⁻ flow = current", 540, 120, 12, BLUE + "1)");
        }

        animate(root, function (dt) {

            t += dt;

            const rate = state.g / 120 * 0.07;

            if (rand() < rate) { mols.push({ x: 60 + rand() * 120, y: 50 + rand() * 230 }); }

            mols.forEach(function (m) {

                m.x += (70 + rand() * 30) * dt;
                m.y += (rand() - 0.5) * 60 * dt;

                if (m.x > 462) {

                    m.done = true;

                    electrons.push({ u: 0 });
                    electrons.push({ u: 0.05 });
                }
            });

            mols = mols.filter(function (m) { return !m.done; });

            electrons.forEach(function (e) { e.u += dt * 0.5; });
            electrons = electrons.filter(function (e) { return e.u < 1; });

            if (!hit && state.g >= 300) {

                hit = true;
                F.reward("glu-amperometry", 10, "You saw a bigger current from more glucose");
            }

            draw();
        });

        wire(root, state, defaults, update);

        update();
        draw();
    };


    SIMS["glu-electrodes"] = quiz(
        "Game: which electrode?",
        ["Working electrode", "Reference electrode", "Counter electrode", "Potentiostat"],
        [
            { q: "Where the reaction happens and the current is read.", a: "Working electrode", why: "The sensing electrode." },
            { q: "Often silver and silver chloride; provides a stable voltage standard.", a: "Reference electrode", why: "A fixed yardstick." },
            { q: "Completes the circuit.", a: "Counter electrode", why: "It lets current flow." },
            { q: "The small circuit that controls all three.", a: "Potentiostat", why: "It holds the voltage steady." }
        ],
        4,
        "glu-electrodes-done",
        "You know the three-electrode cell",
        "A small circuit called a potentiostat controls all three.",
        "Working, reference, counter, potentiostat. Hit Reset to try again."
    );


    SIMS["glu-voltage"] = function (root) {

        const defaults = { v: 0.6 };
        const state = { v: 0.6 };
        let hit = false;

        root.innerHTML =
            head("Try it: hold the voltage") +
            canvasFor(680, 300, "A curve of electrode current against applied voltage. Below about 0.4 volts hardly any hydrogen peroxide reacts; above about 0.6 volts the current reaches a plateau where it simply tracks the peroxide arriving, which is the glucose signal.") +
            '<div class="fd-stat-row">' + stat("Voltage on the electrode", "v") + stat("Current", "i") + stat("Where are we?", "w") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Voltage vs. the reference electrode", key: "v", min: 0, max: 1, step: 0.02, value: 0.6 }) +
            "</div>" +
            '<p class="fd-sim-formula">A potentiostat holds the working electrode at a fixed voltage relative to the reference. Oxidizing hydrogen peroxide at platinum takes about +0.6 V: H₂O₂ → O₂ + 2H⁺ + 2e⁻, so each molecule gives two electrons. Hold the voltage steady, and the current becomes the glucose signal. (Curve shape illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function i(v) { return 1 / (1 + Math.exp(-(v - 0.38) / 0.06)); }

        function update() {

            const cur = i(state.v);

            setVal(root, "v", "+" + state.v.toFixed(2) + " V");
            out(root, "v", "+" + state.v.toFixed(2) + " V");
            out(root, "i", Math.round(cur * 100) + " % of the maximum");
            out(root, "w", state.v < 0.4 ? "too low: peroxide barely reacts" : state.v < 0.55 ? "rising" : "the plateau");
            out(root, "verdict", state.v >= 0.55 ? "On the plateau: current is set by how much peroxide arrives, so it tracks glucose" : "Not yet on the plateau: the current depends on the voltage as well");

            if (!hit && state.v >= 0.58 && state.v <= 0.7) {

                hit = true;
                F.reward("glu-voltage", 10, "You parked the electrode on the plateau");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 240;
            const X = function (v) { return L + v * (R - L); };
            const Y = function (c) { return B - c * (B - T) * 0.9; };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function (v) { txt(ctx, "+" + v.toFixed(1), X(v), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "applied voltage (V) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "current ↑", L + 50, T + 4, 12, TEXT + ".75)");

            ctx.fillStyle = TEAL + ".12)";
            ctx.fillRect(X(0.55), T, R - X(0.55), B - T);
            txt(ctx, "plateau: hold here", (X(0.55) + R) / 2, T + 18, 13, TEAL + "1)", "center", true);

            ctx.strokeStyle = GOLD + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let v = 0; v <= 1.001; v += 0.01) {

                if (v === 0) { ctx.moveTo(X(v), Y(i(v))); } else { ctx.lineTo(X(v), Y(i(v))); }
            }

            ctx.stroke();
            dot(ctx, X(state.v), Y(i(state.v)), 8, "rgba(255,255,255,1)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-faraday"] = function (root) {

        const defaults = { a: 0.05, j: 200 };
        const state = { a: 0.05, j: 200 };
        const F96 = 96485;

        root.innerHTML =
            head("Try it: i = n · F · A · J") +
            art("0 0 340 150", "A bar showing the current produced by an electrode of the chosen area when molecules react at the chosen rate, two electrons per molecule.") +
            '<div class="fd-stat-row">' + stat("Electrons per molecule (n)", "n") + stat("Current", "i") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Electrode area A", key: "a", min: 0.01, max: 0.2, step: 0.01, value: 0.05 }) +
            slider({ label: "Flux J: how many molecules react per second per unit area", key: "j", min: 10, max: 500, step: 10, value: 200 }) +
            "</div>" +
            '<p class="fd-sim-formula">i = n · F · A · J. n is the electrons released per molecule (2 for hydrogen peroxide), F is the Faraday constant (about 96,485 coulombs per mole of electrons), A is the electrode area, and J is the flux. Current is proportional to the flux of reacting molecules. (A in mm²; J in pmol per second per cm²; illustrative.)</p>';

        const svg = root.querySelector("svg");

        function update() {

            const A = state.a * 1e-2; // mm² -> cm²
            const J = state.j * 1e-12; // mol per s per cm²
            const i = 2 * F96 * A * J; // amperes

            setVal(root, "a", state.a.toFixed(2) + " mm²");
            setVal(root, "j", state.j);
            out(root, "n", "2");
            out(root, "i", (i * 1e9).toFixed(1) + " nA");
            out(root, "verdict", "Double the area or the flux and the current doubles");

            const w = 300 * Math.min(1, i * 1e9 / 60);

            svg.innerHTML =
                label(14, 22, "current: " + (i * 1e9).toFixed(1) + " nA", 8.5, "start", "var(--text)") +
                rect(14, 30, 300, 22, "rgba(170,179,207,.18)") +
                rect(14, 30, Math.max(2, w), 22, "rgba(255,214,102,.9)") +
                label(14, 90, "nanoamps: sensor currents are tiny", 7.5, "start", "var(--muted)");
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["glu-calibration"] = function (root) {

        const defaults = { g: 120, sens: 100 };
        const state = { g: 120, sens: 100 };
        let hit = false;

        root.innerHTML =
            head("Try it: from nanoamps to mg/dL") +
            canvasFor(680, 320, "A calibration curve of sensor current against glucose. It rises in a straight line over the useful range and flattens at very high glucose. A dot shows the chosen glucose, and a dashed line shows what a straight-line calibration would report.") +
            '<div class="fd-stat-row">' + stat("True glucose", "t") + stat("Sensor current", "i") + stat("Reading from the straight line", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Glucose", key: "g", min: 40, max: 500, step: 5, value: 120 }) +
            "</div>" +
            '<p class="fd-sim-formula">Sensor currents are tiny, usually nanoamps. Over a useful range the current rises in a straight line with glucose. At very high glucose the enzyme or oxygen is used up and the line flattens. A calibration curve is the recipe for converting current into a glucose reading. (Illustrative curve.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function cur(g) { return 3 * g / (1 + g / 1500); } // nA, saturating
        function lin(i) { return i / 3 * 1.0 * 1 / (1 / 1) * 10 / 10; }

        function slope() { return 3; } // nA per 1 mg/dL... linear approximation near the origin: cur'(0)=3

        function update() {

            const i = cur(state.g);
            const reading = i / slope();

            setVal(root, "g", state.g + " mg/dL");
            out(root, "t", state.g + " mg/dL");
            out(root, "i", i.toFixed(0) + " nA");
            out(root, "r", Math.round(reading) + " mg/dL");
            out(root, "verdict", Math.abs(reading - state.g) / state.g < 0.1 ? "In the straight part: the calibration works" : "The line has flattened: the sensor reads too low");

            if (!hit && state.g >= 400 && reading < state.g * 0.8) {

                hit = true;
                F.reward("glu-calibration", 10, "You pushed past the linear range");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 80;
            const R = 650;
            const T = 20;
            const B = 270;
            const X = function (g) { return L + g / 500 * (R - L); };
            const Y = function (i) { return B - i / 1500 * (B - T); };

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 100, 200, 300, 400, 500].forEach(function (g) { txt(ctx, g, X(g), B + 18, 12, TEXT + ".7)"); });
            txt(ctx, "glucose (mg/dL) →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            txt(ctx, "current (nA) ↑", L + 50, T + 4, 12, TEXT + ".75)");

            ctx.strokeStyle = GREY + ".7)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(500), Y(slope() * 500));
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.2;
            ctx.beginPath();

            for (let g = 0; g <= 500; g += 5) {

                if (g === 0) { ctx.moveTo(X(g), Y(cur(g))); } else { ctx.lineTo(X(g), Y(cur(g))); }
            }

            ctx.stroke();
            dot(ctx, X(state.g), Y(cur(state.g)), 8, GOLD + "1)");
            txt(ctx, "dashed: the straight line the calibration assumes", 400, T + 20, 12, TEXT + ".7)");

            lin;
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    // Parts 2 and 3 of the glucose simulators.
    [
        ["fabGluScriptB", "diagram-sims-glu-b.js"],
        ["fabGluScriptC", "diagram-sims-glu-c.js"]
    ].forEach(function (f) {

        if (document.getElementById(f[0])) {
            return;
        }

        const more = document.createElement("script");

        more.id = f[0];
        more.src = f[1];

        document.head.appendChild(more);
    });

    document.querySelectorAll('.fd-sim[data-sim^="glu-"]').forEach(F.mount);

})();
