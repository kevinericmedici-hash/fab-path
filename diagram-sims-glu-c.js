/* ========================================
   GLUCOSE SENSORS: INTERACTIVE SIMULATORS, PART 3

   Unit 13: fluorescence, implants, Medtronic.
   Unit 14: comparing CGMs.
   Unit 15: how sensors are made.
   Unit 16: microneedles, other fluids, light through skin.
   Unit 17: closed loop and what's next.

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
    const bump = H.bump;


    /* ======================================
       UNIT 13: IMPLANTS AND FLUORESCENCE
    ====================================== */

    SIMS["glu-noenzyme"] = quiz(
        "Game: what fluorescence avoids",
        ["No enzyme", "No oxygen limit", "No peroxide", "Reversible"],
        [
            { q: "Nothing to wear out in the way enzymes do.", a: "No enzyme", why: "A fluorescent polymer instead." },
            { q: "The signal does not depend on tissue oxygen.", a: "No oxygen limit", why: "Oxygen is not part of the reaction." },
            { q: "No reaction byproduct to manage.", a: "No peroxide", why: "Nothing is made or used up." },
            { q: "Binding lets the sensor follow glucose both up and down.", a: "Reversible", why: "Glucose binds and unbinds." }
        ],
        4,
        "glu-noenzyme-done",
        "You know what fluorescence avoids",
        "Different physics, different failure modes.",
        "No enzyme, no oxygen limit, no peroxide, reversible. Hit Reset to try again."
    );


    SIMS["glu-wearyear"] = function (root) {

        const defaults = { patch: 10, implant: 180 };
        const state = { patch: 10, implant: 180 };

        root.innerHTML =
            head("Try it: convenience per year") +
            art("0 0 340 190", "Two bars: how many times a year a wearer of a patch-type sensor must replace it, and how many times a year an implant wearer needs a clinic visit.") +
            '<div class="fd-stat-row">' + stat("Patch-type sensor changes per year", "p") + stat("Implant procedures per year", "i") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Wear time of a patch-type sensor", key: "patch", min: 7, max: 15, step: 1, value: 10 }) +
            slider({ label: "Wear time of an implant", key: "implant", min: 90, max: 365, step: 5, value: 180 }) +
            "</div>" +
            '<p class="fd-sim-formula">Versions of the implantable sensor last about 90 days, 180 days, and a one-year version approved in 2024. The upside is months of wear instead of days. The cost is a small procedure to insert and remove it, and a transmitter that must be worn. Convenience is shifted from every two weeks to a few visits a year.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const p = 365 / state.patch;
            const i = 365 / state.implant;

            setVal(root, "patch", state.patch + " days");
            setVal(root, "implant", state.implant + " days");
            out(root, "p", p.toFixed(0) + " quick changes");
            out(root, "i", i.toFixed(1) + " clinic visits");
            out(root, "verdict", "Convenience moves from every " + state.patch + " days to about " + i.toFixed(1) + " visits a year");

            svg.innerHTML =
                label(14, 22, "patch-type: " + p.toFixed(0) + " changes a year", 8.5, "start", "var(--text)") +
                rect(14, 30, 300 * Math.min(1, p / 52), 20, "rgba(255,214,102,.9)") +
                label(14, 84, "implant: " + i.toFixed(1) + " visits a year", 8.5, "start", "var(--text)") +
                rect(14, 92, Math.max(3, 300 * Math.min(1, i / 52)), 20, "rgba(84,224,199,.9)") +
                label(14, 150, "same scale: bars out of 52", 7, "start", "var(--muted)");
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["glu-medtronic"] = quiz(
        "Game: which sensor?",
        ["Medtronic Guardian", "Eversense", "Both"],
        [
            { q: "A glucose oxidase electrode like Dexcom's, with about 7 days of wear.", a: "Medtronic Guardian", why: "Short wear, built for pumps." },
            { q: "A fluorescent polymer implanted under the skin.", a: "Eversense", why: "Months of wear." },
            { q: "Designed to work as one component of an automated insulin delivery system.", a: "Medtronic Guardian", why: "The sensor is one part of a closed loop." },
            { q: "Can be worn day after day with a transmitter that can come off while the sensor stays in place.", a: "Eversense", why: "Removable transmitter." }
        ],
        4,
        "glu-medtronic-done",
        "You know the two designs",
        "Some sensors are designed as one component of a larger system.",
        "Guardian: enzyme, 7 days, pumps. Eversense: fluorescent, implanted. Hit Reset to try again."
    );


    /* ======================================
       UNIT 14: COMPARING CGMS
    ====================================== */

    SIMS["glu-chemmatch"] = quiz(
        "Game: match the sensor to its chemistry",
        ["Glucose oxidase, peroxide detected", "Wired enzyme with an osmium mediator", "A fluorescent polymer, no enzyme"],
        [
            { q: "Dexcom.", a: "Glucose oxidase, peroxide detected", why: "Peroxide detected at platinum." },
            { q: "FreeStyle Libre.", a: "Wired enzyme with an osmium mediator", why: "At low voltage." },
            { q: "Medtronic Guardian.", a: "Glucose oxidase, peroxide detected", why: "Peroxide detected at an electrode." },
            { q: "Eversense.", a: "A fluorescent polymer, no enzyme", why: "The only optical design among these." }
        ],
        4,
        "glu-chemmatch-done",
        "You can match each sensor to its chemistry",
        "Three enzyme designs and one optical design cover today's market.",
        "Match brand to chemistry. Hit Reset to try again."
    );


    SIMS["glu-wearbars"] = function (root) {

        const defaults = { want: 14 };
        const state = { want: 14 };
        const devs = [
            { n: "Medtronic Guardian", d: 7, c: ROSE },
            { n: "Dexcom", d: 10, c: GOLD },
            { n: "Dexcom (15-day version)", d: 15, c: GOLD },
            { n: "FreeStyle Libre", d: 14, c: BLUE },
            { n: "Eversense (newest)", d: 365, c: TEAL }
        ];
        let hit = false;

        root.innerHTML =
            head("Try it: who lasts long enough for you?") +
            art("0 0 340 220", "Horizontal bars on a log scale for the wear time of five sensors, from 7 days to about a year. A vertical line follows the wear time you want, and sensors that last at least that long are highlighted.") +
            '<div class="fd-stat-row">' + stat("You want at least", "w") + stat("Sensors that qualify", "q") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Wear time you want, at least (log scale)", key: "want", min: 7, max: 365, step: 1, value: 14 }) +
            "</div>" +
            '<p class="fd-sim-formula">Medtronic Guardian about 7 days; Dexcom 10 days, with a newer 15-day version; FreeStyle Libre 14 days; Eversense months, up to a year in the newest version. Values change with each product generation, so check the current specifications.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const ok = devs.filter(function (d) { return d.d >= state.want; });
            const X = function (d) { return 120 + (Math.log10(d) - Math.log10(5)) / (Math.log10(400) - Math.log10(5)) * 200; };

            setVal(root, "want", state.want + " days");
            out(root, "w", state.want + " days");
            out(root, "q", ok.length ? ok.length + " of " + devs.length : "none");
            out(root, "verdict", ok.length === devs.length ? "Every sensor here lasts at least this long" : ok.length === 1 && ok[0].d === 365 ? "Only the implant lasts this long" : ok.length ? ok.map(function (d) { return d.n.split(" (")[0]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(", ") + " qualify" : "No sensor here lasts that long");

            let s = "";

            devs.forEach(function (d, i) {

                const y = 20 + i * 38;
                const on = d.d >= state.want;

                s += label(14, y + 14, d.n, 7, "start", on ? "var(--text)" : "var(--muted)");
                s += rect(120, y, Math.max(2, X(d.d) - 120), 20, d.c + (on ? ".9)" : ".25)"));
                s += label(X(d.d) + 4, y + 14, d.d + " d", 7, "start", "var(--muted)");
            });

            s += '<line x1="' + X(state.want) + '" y1="12" x2="' + X(state.want) + '" y2="210" style="stroke:#fff;stroke-width:1.4;stroke-dasharray:4 3"/>';

            svg.innerHTML = s;

            if (!hit && state.want >= 200 && ok.length === 1) {

                hit = true;
                F.reward("glu-wearbars", 10, "You found the only sensor that lasts months");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    SIMS["glu-rate"] = function (root) {

        const defaults = { fall: 1.5, int: 5, lag: 10 };
        const state = { fall: 1.5, int: 5, lag: 10 };
        let hit = false;

        root.innerHTML =
            head("Try it: how soon will the CGM show the low?") +
            canvasFor(680, 330, "Glucose falls steadily toward 70. The true value is a straight line. The CGM draws a dot every few minutes, each of them showing the glucose from a little earlier because of lag. The first dot below 70 appears later than the true crossing.") +
            '<div class="fd-stat-row">' + stat("True glucose reaches 70 at", "t") + stat("CGM first shows below 70 at", "c") + stat("Late by about", "d") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How fast glucose is falling (mg/dL per minute)", key: "fall", min: 0.5, max: 3, step: 0.1, value: 1.5 }) +
            slider({ label: "Time between CGM readings", key: "int", min: 1, max: 15, step: 1, value: 5 }) +
            slider({ label: "Sensor lag", key: "lag", min: 0, max: 20, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">Dexcom, Libre 2 and Guardian give a reading about every 5 minutes; Libre 3 about every minute. A faster update rate shows changes sooner, but sensor lag still applies. The delay is roughly the lag plus part of the update interval.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function g(t) { return 120 - state.fall * t; }

        function calc() {

            const t70 = 50 / state.fall; // minutes
            let first = null;

            for (let k = 0; k < 200; k++) {

                const tk = k * state.int;

                if (g(tk - state.lag) < 70) { first = tk; break; }
            }

            return { t70: t70, first: first };
        }

        function update() {

            const c = calc();

            setVal(root, "fall", state.fall.toFixed(1) + " mg/dL per min");
            setVal(root, "int", state.int + " min");
            setVal(root, "lag", state.lag + " min");
            out(root, "t", Math.round(c.t70) + " min");
            out(root, "c", c.first === null ? "—" : c.first + " min");
            out(root, "d", c.first === null ? "—" : Math.round(c.first - c.t70) + " min");
            out(root, "verdict", c.first !== null && c.first - c.t70 > 12 ? "A long delay: lag plus a slow update rate leave less time to react" : "The low shows up fairly soon after it really happens");

            if (!hit && c.first !== null && c.first - c.t70 <= 3) {

                hit = true;
                F.reward("glu-rate", 10, "You found a setup that shows a low promptly");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 280;
            const maxT = 60;
            const X = function (t) { return L + t / maxT * (R - L); };
            const Y = function (v) { return B - (v - 40) / 90 * (B - T); };
            const c = calc();

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            txt(ctx, "minutes →", (L + R) / 2, B + 34, 13, TEXT + ".85)");
            [0, 15, 30, 45, 60].forEach(function (t) { txt(ctx, t, X(t), B + 16, 12, TEXT + ".7)"); });

            ctx.strokeStyle = ROSE + ".8)";
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y(70)); ctx.lineTo(R, Y(70));
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "70 mg/dL", R - 40, Y(70) - 6, 12, ROSE + "1)");

            ctx.strokeStyle = RED + ".9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(X(0), Y(g(0))); ctx.lineTo(X(maxT), Y(g(maxT)));
            ctx.stroke();
            txt(ctx, "true glucose", X(8), Y(g(8)) - 12, 12, RED + "1)");

            for (let k = 0; k * state.int <= maxT; k++) {

                const tk = k * state.int;
                const v = g(tk - state.lag);

                dot(ctx, X(tk), Y(clamp(v, 40, 130)), k * state.int === c.first ? 8 : 4.6, (v < 70 ? ROSE : TEAL) + ".98)");
            }

            ctx.strokeStyle = GOLD + ".8)";
            ctx.lineWidth = 1.5;

            if (c.first !== null && c.first <= maxT) {

                ctx.beginPath();
                ctx.moveTo(X(c.t70), B); ctx.lineTo(X(c.t70), Y(70));
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(X(c.first), B); ctx.lineTo(X(c.first), Y(70));
                ctx.stroke();
                txt(ctx, "late", (X(c.t70) + X(c.first)) / 2, B - 8, 12, GOLD + "1)", "center", true);
            }
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-formfactor"] = quiz(
        "Game: what do you actually wear?",
        ["Dexcom G7", "FreeStyle Libre 3", "Eversense", "Medtronic Guardian"],
        [
            { q: "One small disposable with the transmitter built in.", a: "Dexcom G7", why: "Sensor and transmitter combined." },
            { q: "A very small integrated disc.", a: "FreeStyle Libre 3", why: "Compact." },
            { q: "An implant plus a removable transmitter and adhesive.", a: "Eversense", why: "The sensor stays under the skin." },
            { q: "A sensor with a separate reusable transmitter, and a newer all-in-one version.", a: "Medtronic Guardian", why: "Smaller, integrated designs trade reusability for convenience." }
        ],
        4,
        "glu-formfactor-done",
        "You know what each one looks like",
        "Smaller, integrated designs trade reusability for convenience.",
        "Integrated, disc, implant, separate transmitter. Hit Reset to try again."
    );


    SIMS["glu-fit"] = quiz(
        "Game: what to weigh when choosing",
        ["Accuracy and alerts", "Ecosystem", "Cost and coverage"],
        [
            { q: "Published accuracy, alerts, and how readings reach your phone.", a: "Accuracy and alerts", why: "What the sensor does." },
            { q: "Which insulin pumps and apps the sensor works with.", a: "Ecosystem", why: "A sensor is part of a system." },
            { q: "Price, insurance, and wear time all matter in practice.", a: "Cost and coverage", why: "Real-world constraints." },
            { q: "Why is there no single best sensor?", a: "Ecosystem", why: "The best one is the one that fits a person's needs and devices." }
        ],
        4,
        "glu-fit-done",
        "You know how to compare sensors",
        "The best sensor is the one that fits a person's needs and devices.",
        "Accuracy, ecosystem, cost. Hit Reset to try again."
    );


    /* ======================================
       UNIT 15: HOW THE SENSORS ARE MADE
    ====================================== */

    SIMS["glu-3jobs"] = quiz(
        "Game: the three big jobs",
        ["Make the electrode", "Add the layers", "Package it"],
        [
            { q: "Form thin metal or carbon electrodes on a wire or film.", a: "Make the electrode", why: "The foundation." },
            { q: "Apply the enzyme and each membrane in a controlled thickness.", a: "Add the layers", why: "The chemistry." },
            { q: "Cure, sterilize, and assemble it into an applicator.", a: "Package it", why: "The finishing steps." }
        ],
        3,
        "glu-3jobs-done",
        "You know the three jobs",
        "The chemistry from earlier units has to be repeated millions of times, identically.",
        "Electrode, layers, package. Hit Reset to try again."
    );


    SIMS["glu-electrodemat"] = quiz(
        "Game: which electrode material?",
        ["Platinum", "Gold", "Carbon", "Silver/silver chloride"],
        [
            { q: "A very effective, stable catalyst for oxidizing hydrogen peroxide, but expensive.", a: "Platinum", why: "Effective, but costly." },
            { q: "Inert and easy to deposit as a thin film.", a: "Gold", why: "Easy to pattern." },
            { q: "Inexpensive, and can be printed from inks.", a: "Carbon", why: "Cheap and printable." },
            { q: "The standard reference electrode material.", a: "Silver/silver chloride", why: "A stable voltage standard." }
        ],
        4,
        "glu-electrodemat-done",
        "You know the electrode materials",
        "Material choice trades cost, catalytic activity, and stability.",
        "Platinum, gold, carbon, Ag/AgCl. Hit Reset to try again."
    );


    SIMS["glu-buildmethods"] = quiz(
        "Game: how are the layers put down?",
        ["Dip coating", "Screen printing", "Thin-film deposition", "Inkjet spotting"],
        [
            { q: "A wire is dipped repeatedly to build up thin layers.", a: "Dip coating", why: "Good for wires." },
            { q: "Inks printed through a mesh to form electrodes and layers on flat strips.", a: "Screen printing", why: "Flat strips." },
            { q: "Metals sputtered and patterned with photolithography, as in the MEMS course.", a: "Thin-film deposition", why: "The same microfabrication tools." },
            { q: "Tiny droplets place precise amounts of enzyme.", a: "Inkjet spotting", why: "Precise placement." }
        ],
        4,
        "glu-buildmethods-done",
        "You know how layers are made",
        "Layer thickness sets sensitivity, so it must be controlled very tightly.",
        "Dip, print, deposit, spot. Hit Reset to try again."
    );


    SIMS["glu-uniformity"] = function (root) {

        const defaults = { sd: 4 };
        const state = { sd: 4 };
        const rand = mulberry(Date.now() % 9999);
        const z = [];
        let hit = false;

        for (let i = 0; i < 30; i++) { z.push((rand() + rand() + rand() - 1.5) * 2); }

        root.innerHTML =
            head("Try it: calibration-free needs identical sensors") +
            canvasFor(680, 300, "Thirty sensors from one batch all measure the same true glucose of 120. Each shows a slightly different reading because its sensitivity differs from the factory value. A band marks readings within 15 percent of the truth.") +
            '<div class="fd-stat-row">' + stat("Sensors within ±15 %", "in") + stat("Worst sensor off by", "w") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-new>🎲 Make a new batch</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How much sensitivity varies from sensor to sensor", key: "sd", min: 0, max: 20, step: 0.5, value: 4 }) +
            "</div>" +
            '<p class="fd-sim-formula">Factory calibration only works if every sensor in a batch behaves alike. A very reproducible process is what makes calibration-free sensing possible. (Illustrative scatter; the ±15 % band is only a visual guide.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function readings() { return z.map(function (v) { return 120 * (1 + v * state.sd / 100); }); }

        function update() {

            const r = readings();
            const inside = r.filter(function (v) { return Math.abs(v - 120) <= 18; }).length;
            const worst = Math.max.apply(null, r.map(function (v) { return Math.abs(v - 120) / 120 * 100; }));

            setVal(root, "sd", state.sd + " %");
            out(root, "in", inside + " of " + r.length);
            out(root, "w", Math.round(worst) + " %");
            out(root, "verdict", inside >= 29 ? "A tight, reproducible batch: factory calibration is safe" : inside >= 22 ? "Mostly fine, but some sensors miss" : "Too much variation: factory calibration would mislead many users");

            if (!hit && state.sd <= 3 && inside === r.length) {

                hit = true;
                F.reward("glu-uniformity", 10, "You made a batch tight enough for factory calibration");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const L = 70;
            const R = 650;
            const Y0 = 150;
            const sc = 2;

            ctx.fillStyle = TEAL + ".12)";
            ctx.fillRect(L, Y0 - 18 * sc, R - L, 36 * sc);
            txt(ctx, "within ±15 %", R - 60, Y0 - 18 * sc - 4, 12, TEAL + "1)");
            ctx.strokeStyle = GOLD + ".8)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(L, Y0); ctx.lineTo(R, Y0);
            ctx.stroke();
            ctx.setLineDash([]);
            txt(ctx, "true: 120", L + 30, Y0 - 6, 12, GOLD + "1)");

            readings().forEach(function (v, i) {

                const x = L + 30 + i * ((R - L - 60) / 29);
                const ok = Math.abs(v - 120) <= 18;

                dot(ctx, x, Y0 - (v - 120) * sc, 6, (ok ? TEAL : ROSE) + ".98)");
            });

            txt(ctx, "each dot is one sensor's reading of the same glucose", 360, 285, 12, TEXT + ".75)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        root.querySelector("[data-new]").addEventListener("click", function () {

            for (let i = 0; i < z.length; i++) { z[i] = (rand() + rand() + rand() - 1.5) * 2; }

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["glu-process"] = orderGame(
        "Game: five steps to a sensor",
        [
            { n: "Form the electrode", d: "thin metal or carbon on a wire or film", why: "The foundation of the sensor." },
            { n: "Apply the enzyme layer", d: "controlled amount of glucose oxidase", why: "It makes the glucose signal." },
            { n: "Add the membranes", d: "each at a controlled thickness", why: "Thickness sets sensitivity." },
            { n: "Cure and sterilize", d: "without destroying the enzyme", why: "Sterilization must not kill the enzyme." },
            { n: "Assemble and package", d: "into the applicator", why: "Ready to ship." }
        ],
        "glu-process-done",
        "You ordered the manufacturing steps",
        "Tap the five steps in the order they happen.",
        "These are the same thin-film and coating tools you met in the microfabrication courses."
    );


    /* ======================================
       UNIT 16: NEEDLES, PATCHES, NON-INVASIVE DREAMS
    ====================================== */

    SIMS["glu-microneedle"] = function (root) {

        const defaults = { len: 500 };
        const state = { len: 500 };
        let hit = false;

        root.innerHTML =
            head("Try it: how long should a microneedle be?") +
            canvasFor(680, 330, "A cross-section of skin with a needle of adjustable length. The outer layers have no fluid worth sampling; the interstitial fluid is below them; deeper still are nerves and blood vessels. A microneedle should reach the fluid but stop short of most nerves.") +
            '<div class="fd-stat-row">' + stat("Needle length", "l") + stat("What it reaches", "r") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Needle length", key: "len", min: 0, max: 2000, step: 25, value: 500 }) +
            "</div>" +
            '<p class="fd-sim-formula">A microneedle is only hundreds of microns long, just enough to reach interstitial fluid in the upper skin, while staying short of most nerves. Some designs put sensing electrodes on solid needles, and others use hollow needles to draw fluid out. (Layer depths here are illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function where() {

            return state.len < 120 ? "outer skin only" : state.len < 800 ? "interstitial fluid" : "nerves and blood vessels";
        }

        function update() {

            setVal(root, "len", state.len + " µm");
            out(root, "l", state.len + " µm");
            out(root, "r", where());
            out(root, "verdict", state.len < 120 ? "Too short: it never reaches the fluid" : state.len < 800 ? "Just right: in the fluid, short of most nerves" : "Too long: this reaches the deeper tissue where nerves and vessels are");

            if (!hit && state.len >= 200 && state.len <= 700) {

                hit = true;
                F.reward("glu-microneedle", 10, "You found a microneedle length that reaches the fluid");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const top = 40;
            const sc = 0.14; // px per µm

            [[0, 120, "outer skin (no useful fluid)", "rgba(255,214,190,.55)"], [120, 800, "upper dermis: interstitial fluid", BLUE + ".25)"], [800, 2000, "deeper: nerves and blood vessels", ROSE + ".3)"]].forEach(function (l) {

                ctx.fillStyle = l[3];
                ctx.fillRect(60, top + l[0] * sc, 560, (l[1] - l[0]) * sc);
                txt(ctx, l[2], 340, top + (l[0] + l[1]) / 2 * sc + 4, 13, TEXT + ".85)");
            });

            // nerves and vessels deeper
            for (let i = 0; i < 6; i++) {

                ctx.strokeStyle = GOLD + ".9)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(100 + i * 90, top + 800 * sc + 20);
                ctx.lineTo(100 + i * 90 + 20, top + 2000 * sc - 6);
                ctx.stroke();
            }

            // the needle
            const tipY = top + state.len * sc;

            ctx.fillStyle = TEXT + ".92)";
            ctx.beginPath();
            ctx.moveTo(334, top - 30); ctx.lineTo(346, top - 30); ctx.lineTo(346, tipY - 8); ctx.lineTo(340, tipY); ctx.lineTo(334, tipY - 8);
            ctx.closePath();
            ctx.fill();
            dot(ctx, 340, tipY, 5, state.len < 120 ? GREY + ".9)" : state.len < 800 ? TEAL + "1)" : ROSE + "1)");
            txt(ctx, "microneedle", 400, top - 14, 12, TEXT + ".8)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-otherfluids"] = quiz(
        "Game: which body fluid?",
        ["Sweat", "Tears", "Saliva"],
        [
            { q: "Skin patches try to read glucose here.", a: "Sweat", why: "Sweat rate and skin contamination change the reading." },
            { q: "Smart contact lenses aim to read glucose here.", a: "Tears", why: "Mostly research." },
            { q: "Mouthguards aim to read glucose here.", a: "Saliva", why: "Mostly research." },
        ],
        3,
        "glu-otherfluids-done",
        "You know the other fluids",
        "The lag and variability are usually larger than for tissue-fluid sensors.",
        "Sweat for patches, tears for lenses, saliva for mouthguards. Hit Reset to try again."
    );


    SIMS["glu-snr"] = function (root) {

        const defaults = { noise: 8 };
        const state = { noise: 8 };
        const rand = mulberry(9);
        const n = [];
        let hit = false;
        const seen = {};

        for (let i = 0; i < 140; i++) { n.push((rand() + rand() + rand() - 1.5) * 2); }

        root.innerHTML =
            head("Try it: finding a tiny signal in the noise") +
            canvasFor(680, 320, "A small, slow glucose signal drawn in teal, plus the measured trace with noise added. When the noise is small the signal shows clearly. When the noise is large, as it is for light through skin, the signal is buried.") +
            '<div class="fd-stat-row">' + stat("Signal ÷ noise", "snr") + stat("Can you see the glucose change?", "see") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-seg"><span class="fd-seg-label">Try a method</span><button type="button" class="fd-sim-btn" data-pre="0.4">Enzyme electrode (CGM)</button><button type="button" class="fd-sim-btn" data-pre="5">A good optical method</button><button type="button" class="fd-sim-btn" data-pre="16">Light through skin, real world</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Noise (temperature, motion, skin differences)", key: "noise", min: 0, max: 20, step: 0.5, value: 8 }) +
            "</div>" +
            '<p class="fd-sim-formula">Near-infrared and mid-infrared absorption, Raman scattering and photoacoustics: glucose\'s optical fingerprint is tiny compared with water, skin and blood, and temperature, motion and skin differences swamp it. Decades of attempts, but no non-invasive method has matched invasive CGMs. The signal-to-noise problem is the hardest part. (Illustrative.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const SIG = 3; // size of the glucose signal

        function update() {

            const snr = state.noise === 0 ? 99 : SIG / state.noise;

            setVal(root, "noise", state.noise.toFixed(1));
            seen[snr > 3 ? "clear" : snr < 0.5 ? "buried" : "mid"] = true;
            out(root, "snr", snr >= 99 ? "no noise" : snr.toFixed(1));
            out(root, "see", snr > 3 ? "easily" : snr > 1 ? "with effort" : "no: it is buried");
            out(root, "verdict", snr > 3 ? "A clear signal: an enzyme electrode works this way" : snr > 1 ? "Barely visible: averaging and cleverness are needed" : "The noise swamps the glucose signal");

            if (!hit && seen.clear && seen.buried) {

                hit = true;
                F.reward("glu-snr", 10, "You saw a signal buried by noise");
            }
        }

        function draw() {

            clear(ctx, 680, 320);

            const L = 70;
            const R = 650;
            const cy = 160;

            ctx.strokeStyle = GREY + ".4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(L, cy); ctx.lineTo(R, cy);
            ctx.stroke();

            const sig = function (i) { return -SIG * 14 * Math.sin(i / 139 * Math.PI * 1.2) * 1.0; };

            ctx.strokeStyle = TEAL + ".98)";
            ctx.lineWidth = 3.4;
            ctx.beginPath();

            for (let i = 0; i < 140; i++) {

                const x = L + i / 139 * (R - L);

                if (i === 0) { ctx.moveTo(x, cy + sig(i)); } else { ctx.lineTo(x, cy + sig(i)); }
            }

            ctx.stroke();

            ctx.strokeStyle = GREY + ".8)";
            ctx.lineWidth = 1.6;
            ctx.beginPath();

            for (let i = 0; i < 140; i++) {

                const x = L + i / 139 * (R - L);
                const y = cy + sig(i) + n[i] * state.noise * 14;

                if (i === 0) { ctx.moveTo(x, clamp(y, 20, 300)); } else { ctx.lineTo(x, clamp(y, 20, 300)); }
            }

            ctx.stroke();

            txt(ctx, "teal: the true glucose signal   grey: what is measured", 360, 312, 12, TEXT + ".75)");
        }

        wire(root, state, defaults, function () { update(); draw(); });

        root.querySelectorAll("[data-pre]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.noise = parseFloat(b.dataset.pre);
                root.querySelector('input[data-key="noise"]').value = state.noise;
                update();
                draw();
            });
        });

        update();
        draw();
    };


    SIMS["glu-smartwatch"] = quiz(
        "Game: true or false?",
        ["True", "False"],
        [
            { q: "In 2024 the U.S. FDA warned people not to use smartwatches or smart rings that claim to measure blood glucose without piercing the skin.", a: "True", why: "No such device had been authorized." },
            { q: "A smartwatch can reliably measure your blood glucose through the skin today.", a: "False", why: "Inaccurate readings could lead to wrong treatment decisions." },
            { q: "Extraordinary claims about glucose sensing need extraordinary evidence.", a: "True", why: "The bar is very high." },
            { q: "Non-invasive methods have matched invasive CGMs in accuracy.", a: "False", why: "Decades of attempts have not done so." }
        ],
        4,
        "glu-smartwatch-done",
        "You can spot a risky claim",
        "Extraordinary claims need extraordinary evidence.",
        "Be skeptical of needle-free glucose claims. Hit Reset to try again."
    );


    SIMS["glu-hardbar"] = quiz(
        "Game: why is it so hard?",
        ["Selectivity", "Accuracy", "Lag", "Calibration"],
        [
            { q: "Glucose must be separated from many look-alike signals.", a: "Selectivity", why: "Many molecules look similar." },
            { q: "Clinical use needs errors that stay small across the whole range.", a: "Accuracy", why: "Not just on average." },
            { q: "A reading that arrives late can mislead during fast changes.", a: "Lag", why: "Timing matters." },
            { q: "The sensor must work across different people and conditions.", a: "Calibration", why: "Skin and tissue differ." }
        ],
        4,
        "glu-hardbar-done",
        "You know why the bar is so high",
        "Meeting all four at once is why the minimally invasive CGM won out.",
        "Selectivity, accuracy, lag, calibration. Hit Reset to try again."
    );


    /* ======================================
       UNIT 17: CLOSED LOOP AND WHAT'S NEXT
    ====================================== */

    SIMS["glu-closedloop"] = function (root) {

        const defaults = { mode: "fixed", meal: 1, ann: "on" };
        const state = { mode: "fixed", meal: 1, ann: "on" };
        const seen = {};
        let trace = [];
        let t = 0;
        let tir = 0;
        let hit = false;

        root.innerHTML =
            head("Try it: let the sensor drive the pump") +
            canvasFor(680, 330, "A simulated day of glucose with three meals. With a fixed insulin dose and no CGM, glucose spikes high after meals. With a closed-loop system the CGM readings steer the insulin dose and keep glucose in range. In a hybrid system the user also announces meals.") +
            '<div class="fd-stat-row">' + stat("Time in range (70–180)", "tir") + stat("Highest", "hi") + stat("Lowest", "lo") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Insulin delivery", "mode", [["fixed", "Fixed dose, no CGM"], ["closed", "CGM-driven (closed loop)"], ["hybrid", "Hybrid: CGM + announced meals"]]) +
            seg("Does the user announce the meals?", "ann", [["on", "Yes"], ["off", "No, forgot"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Meal size", key: "meal", min: 0.5, max: 2.5, step: 0.1, value: 1 }) +
            "</div>" +
            '<p class="fd-sim-formula">In automated insulin delivery, the CGM\'s readings feed an algorithm that adjusts how much insulin an insulin pump gives. In a hybrid closed loop the system adjusts background insulin and the user still announces meals. The CGM is the sense organ of an artificial pancreas. (A very simplified model of one day.)</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function simulate() {

            const meals = [[7, 1], [12.5, 1.2], [18.5, 1.3]];
            let G = 110;
            let E = 1.0;
            const out2 = [];
            let inR = 0;
            let mx = 0;
            let mn = 999;

            for (let m = 0; m < 1440; m++) {

                const h = m / 60;
                let meal = 0;
                let bolus = 0;

                meals.forEach(function (x) {

                    meal += 2.4 * state.meal * bump((h - x[0]) / x[1] / 0.9);

                    if (state.mode === "hybrid" && state.ann === "on") { bolus += 1.5 * state.meal * bump((h - x[0] - 0.05) / 1.1); }
                });

                let u = 1.0;

                if (state.mode !== "fixed") { u = Math.max(0, Math.min(4, 1.0 + 0.045 * (G - 110))); }

                E += (u + bolus - E) / 50;
                G += 1.0 + meal - E - 0.004 * (G - 100);
                G = Math.max(30, G);

                if (m % 6 === 0) { out2.push(G); }

                if (G >= 70 && G <= 180) { inR++; }

                if (G > mx) { mx = G; }
                if (G < mn) { mn = G; }
            }

            return { trace: out2, tir: Math.round(inR / 1440 * 100), hi: Math.round(mx), lo: Math.round(mn) };
        }

        function update() {

            const r = simulate();

            trace = r.trace;
            tir = r.tir;
            seen[state.mode + state.ann] = true;
            setVal(root, "meal", state.meal.toFixed(1) + "×");
            out(root, "tir", r.tir + " %");
            out(root, "hi", r.hi + " mg/dL");
            out(root, "lo", r.lo + " mg/dL");
            out(root, "verdict", state.mode === "fixed" ? "A fixed dose cannot follow the meals: long stretches high" : state.mode === "closed" ? "The CGM steers the insulin: a flatter day, though the meal peaks still show" : state.ann === "on" ? "Hybrid: the algorithm handles the background and the announced meals blunt the peaks" : "Hybrid, but a forgotten meal: the algorithm has to catch up on its own");
            t = 0;

            if (!hit && seen.fixedon && seen.closedon && seen.hybridon && tir >= 90) {

                hit = true;
                F.reward("glu-closedloop", 10, "You compared fixed, closed-loop and hybrid insulin delivery");
            }
        }

        function draw() {

            clear(ctx, 680, 330);

            const L = 70;
            const R = 650;
            const T = 20;
            const B = 280;
            const X = function (h) { return L + h / 24 * (R - L); };
            const Y = function (v) { return B - (clamp(v, 40, 450) - 40) / 410 * (B - T); };

            ctx.fillStyle = TEAL + ".1)";
            ctx.fillRect(L, Y(180), R - L, Y(70) - Y(180));
            txt(ctx, "70–180", L + 30, Y(180) + 14, 11, TEAL + "1)");
            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            [0, 6, 12, 18, 24].forEach(function (h) { txt(ctx, h + ":00", X(h), B + 18, 12, TEXT + ".7)"); });
            [100, 200, 300, 400].forEach(function (v) { txt(ctx, v, L - 22, Y(v) + 4, 12, TEXT + ".7)"); });

            [7, 12.5, 18.5].forEach(function (h) { txt(ctx, "🍝", X(h), B - 6, 16, TEXT + ".95)"); });

            ctx.strokeStyle = (state.mode === "fixed" ? GOLD : TEAL) + ".98)";
            ctx.lineWidth = 3;
            ctx.beginPath();

            const lim = Math.min(trace.length, Math.floor(t / 24 * trace.length) + 1);

            for (let i = 0; i < lim; i++) {

                const x = X(i / (trace.length - 1) * 24);

                if (i === 0) { ctx.moveTo(x, Y(trace[i])); } else { ctx.lineTo(x, Y(trace[i])); }
            }

            ctx.stroke();

            if (lim > 0) { dot(ctx, X((lim - 1) / (trace.length - 1) * 24), Y(trace[lim - 1]), 6, "rgba(255,255,255,1)"); }
        }

        animate(root, function (dt) {

            t = Math.min(24, t + dt * 2.2);
            draw();
        });

        wire(root, state, defaults, function () { update(); draw(); });

        update();
        draw();
    };


    SIMS["glu-aid"] = quiz(
        "Game: the parts of the loop",
        ["The CGM", "The insulin pump", "The algorithm", "The user"],
        [
            { q: "Senses glucose and sends readings.", a: "The CGM", why: "The sense organ of the artificial pancreas." },
            { q: "Delivers the insulin.", a: "The insulin pump", why: "The hands." },
            { q: "Decides how much insulin to give, from the readings.", a: "The algorithm", why: "The brain." },
            { q: "In a hybrid closed loop, still announces meals.", a: "The user", why: "Hybrid means the user keeps one job." }
        ],
        4,
        "glu-aid-done",
        "You know the parts of the loop",
        "When a sensor drives dosing, its accuracy and reliability matter even more.",
        "CGM senses, pump delivers, algorithm decides, user announces meals. Hit Reset to try again."
    );


    SIMS["glu-otc"] = quiz(
        "Game: prescription or over the counter?",
        ["Prescription CGM", "Over-the-counter CGM"],
        [
            { q: "Dexcom Stelo and Abbott Lingo, cleared in 2024.", a: "Over-the-counter CGM", why: "The first CGMs sold without a prescription." },
            { q: "Aimed at adults who do not use insulin, to see how food, sleep and exercise affect glucose.", a: "Over-the-counter CGM", why: "A wellness tool." },
            { q: "Used to dose insulin, often feeding an insulin pump.", a: "Prescription CGM", why: "Dosing needs a clinician." },
            { q: "A medical sensor becoming a consumer health product.", a: "Over-the-counter CGM", why: "That is the shift." }
        ],
        4,
        "glu-otc-done",
        "You know the two kinds",
        "A medical sensor is becoming a consumer health product.",
        "Prescription for dosing; over the counter for wellness. Hit Reset to try again."
    );


    SIMS["glu-next"] = quiz(
        "Game: where is the technology heading?",
        ["Longer wear", "Smaller and cheaper", "More analytes", "Better accuracy"],
        [
            { q: "From a week or two toward a month or even a year.", a: "Longer wear", why: "Fewer sensor changes." },
            { q: "More integrated, lower-cost sensors.", a: "Smaller and cheaper", why: "Easier for many people." },
            { q: "Multi-sensor designs that add ketones or lactate are in development.", a: "More analytes", why: "Beyond glucose alone." },
            { q: "Less drift and faster response.", a: "Better accuracy", why: "Better numbers." }
        ],
        4,
        "glu-next-done",
        "You know where it is going",
        "The same core idea is being pushed in every direction at once.",
        "Longer, smaller, more, better. Hit Reset to try again."
    );


    SIMS["glu-judge"] = quiz(
        "Game: how to judge a sensor claim",
        ["Accuracy", "Wear and warm-up", "Interference", "Calibration and lag", "Fit"],
        [
            { q: "What is the MARD, and how was it measured?", a: "Accuracy", why: "An average, so ask how it was measured." },
            { q: "How long does it last, and how long until readings are trustworthy?", a: "Wear and warm-up", why: "Both matter." },
            { q: "What substances can change the reading?", a: "Interference", why: "Check the labeling." },
            { q: "Is it factory calibrated, and how fast is the update rate?", a: "Calibration and lag", why: "Both shape the experience." },
            { q: "Does it work with the devices you use, and what does it cost?", a: "Fit", why: "A sensor is part of a system." }
        ],
        5,
        "glu-judge-done",
        "You know the questions to ask",
        "You now know enough to ask the right questions about any glucose sensor.",
        "Accuracy, wear, interference, calibration and lag, fit. Hit Reset to try again."
    );


    document.querySelectorAll('.fd-sim[data-sim^="glu-"]').forEach(F.mount);

})();
