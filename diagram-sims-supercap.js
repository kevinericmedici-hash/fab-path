/* ========================================
   SUPERCAPACITORS: INTERACTIVE SIMULATORS, PART 1

   Unit 1: Ragone plot, battery or capacitor game.
   Unit 2: charging and discharging a capacitor.
   Unit 3: what sets capacitance, energy and voltage, levers game.
   Unit 4: the cyclic voltammogram, peak current.
   Unit 5: a supercapacitor charging, sorting game.
   Unit 6: the electric double layer on a porous surface.
   Unit 7: double layer versus pseudocapacitance, mechanism game.
   Unit 8: redox amplification.

   Registers on window.FabInteract; shares the helpers from
   diagram-sims-mems.js. Chains diagram-sims-supercap-b.js to -e.js.
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
    const pline = M.pline;
    const animate = M.animate;
    const bindPause = M.bindPause;
    const quiz = M.quiz;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const TEAL = "rgba(84,224,199,";
    const GOLD = "rgba(255,214,102,";
    const ROSE = "rgba(255,105,120,";
    const BLUE = "rgba(120,180,255,";
    const GREY = "rgba(170,179,207,";
    const TEXT = "rgba(245,247,255,";

    // Share the colours and a few drawing helpers with the other supercapacitor files.
    F.scHelpers = F.scHelpers || {};

    function sup(n) {

        const map = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

        return String(n).split("").map(function (c) { return map[c] || c; }).join("");
    }

    // Capacitance with a sensible unit.
    function fmtC(c) {

        const units = [[1e3, "kF"], [1, "F"], [1e-3, "mF"], [1e-6, "µF"], [1e-9, "nF"], [1e-12, "pF"]];

        for (let i = 0; i < units.length; i++) {

            if (c >= units[i][0] * 0.9995) {

                const v = c / units[i][0];

                return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + " " + units[i][1];
            }
        }

        return (c / 1e-12).toFixed(2) + " pF";
    }

    function canvasFor(root, w, h, aria) {

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

    F.scHelpers.sup = sup;
    F.scHelpers.fmtC = fmtC;
    F.scHelpers.canvasFor = canvasFor;
    F.scHelpers.clear = clear;
    F.scHelpers.txt = txt;
    F.scHelpers.dot = dot;


    /* ======================================
       UNIT 1: THE RAGONE PLOT
    ====================================== */

    SIMS["supercap-ragone"] = function (root) {

        const defaults = { job: "none" };
        const state = { job: "none" };
        const found = {};

        const X0 = 46;
        const X1 = 326;
        const Y0 = 14;
        const Y1 = 186;

        const px = function (lp) { return X0 + (lp / 6) * (X1 - X0); };
        const py = function (le) { return Y1 - ((le + 3) / 6) * (Y1 - Y0); };

        const devices = [
            { id: "cap", n: "Capacitor", c: [5.2, -1.8], r: [0.9, 0.9], col: BLUE },
            { id: "sc", n: "Supercapacitor", c: [4.0, 0.7], r: [1.0, 0.8], col: TEAL },
            { id: "bat", n: "Battery", c: [2.3, 2.0], r: [1.0, 0.5], col: ROSE },
            { id: "fc", n: "Fuel cell", c: [1.2, 2.72], r: [0.9, 0.3], col: GOLD }
        ];

        const jobs = {
            flash: { t: "A camera flash", p: [5.0, -1.3], need: "a huge burst of power for a split second" },
            brake: { t: "Catching a braking bus's energy", p: [3.8, 0.6], need: "fast charging in seconds, again and again" },
            phone: { t: "A phone all day", p: [2.4, 2.1], need: "lots of energy, drawn slowly" },
            drive: { t: "A long road trip", p: [1.2, 2.72], need: "the most energy per kilogram, drawn slowly" },
            truck: { t: "A heavy truck that launches hard AND goes far", p: [4.0, 2.0], need: "lots of energy and big bursts of power" }
        };

        root.innerHTML =
            head("Try it: pick a job on the Ragone plot") +
            art("0 0 340 232", "A Ragone plot with power density across the bottom and energy density up the side. Capacitors sit at high power and low energy, batteries and fuel cells at high energy and lower power, and supercapacitors in the middle.") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<p class="fd-sim-note" data-out="why"></p>' +
            '<div class="fd-seg"><span class="fd-seg-label">What does the device need to do?</span>' +
            Object.keys(jobs).map(function (k) {
                return '<button type="button" class="fd-sim-btn" data-set="job:' + k + '">' + jobs[k].t + "</button>";
            }).join("") + "</div>" +
            '<p class="fd-sim-formula">Positions are rough and drawn on log scales: each gridline is ten times the one before.</p>';

        const svg = root.querySelector("svg");

        function inside(d, p) {

            const a = (p[0] - d.c[0]) / d.r[0];
            const b = (p[1] - d.c[1]) / d.r[1];

            return a * a + b * b <= 1;
        }

        function draw() {

            let s = rect(X0, Y0, X1 - X0, Y1 - Y0, "rgba(6,10,24,.55)", "rgba(170,179,207,.35)");

            for (let i = 0; i <= 6; i++) {

                s += '<line x1="' + px(i) + '" y1="' + Y0 + '" x2="' + px(i) + '" y2="' + Y1 + '" style="stroke:rgba(170,179,207,.18);stroke-width:.6"/>';
                s += '<line x1="' + X0 + '" y1="' + py(i - 3) + '" x2="' + X1 + '" y2="' + py(i - 3) + '" style="stroke:rgba(170,179,207,.18);stroke-width:.6"/>';
                s += label(px(i), Y1 + 11, "10" + sup(i), 7, "middle", "var(--muted)");
                s += label(X0 - 5, py(i - 3) + 2.5, "10" + sup(i - 3), 7, "end", "var(--muted)");
            }

            s += label((X0 + X1) / 2, Y1 + 24, "Power density (W/kg): how fast it can deliver", 7.5, "middle", "var(--text)");
            s += '<text transform="translate(9 ' + ((Y0 + Y1) / 2) + ') rotate(-90)" text-anchor="middle" style="font-size:7.5px;fill:var(--text)">Energy density (Wh/kg)</text>';

            const job = jobs[state.job];

            devices.forEach(function (d) {

                const hit = job && inside(d, job.p);
                const dim = job && !hit;

                s += '<ellipse cx="' + px(d.c[0]) + '" cy="' + py(d.c[1]) + '" rx="' + (d.r[0] / 6 * (X1 - X0)) + '" ry="' + (d.r[1] / 6 * (Y1 - Y0)) +
                    '" style="fill:' + d.col + (hit ? ".55" : dim ? ".1" : ".28") + ");stroke:" + d.col + (dim ? ".35" : "1") + ");stroke-width:" + (hit ? 2 : 1) + '"/>';
                s += label(px(d.c[0]), py(d.c[1]) + 2.5, d.n, 7.5, "middle", dim ? "var(--muted)" : "var(--text)");
            });

            if (job) {

                const cx = px(job.p[0]);
                const cy = py(job.p[1]);

                s += '<circle cx="' + cx + '" cy="' + cy + '" r="3" style="fill:#fff"/>';
                s += '<circle cx="' + cx + '" cy="' + cy + '" r="4" style="fill:none;stroke:#fff;stroke-width:1.4"><animate attributeName="r" values="4;13;4" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite"/></circle>';
            }

            svg.innerHTML = s;

            if (!job) {

                out(root, "verdict", "Pick a job below");
                out(root, "why", "Each blob is a kind of energy storage. The white dot will show where your job sits.");

                return;
            }

            const fits = devices.filter(function (d) { return inside(d, job.p); });

            if (fits.length) {

                out(root, "verdict", fits.map(function (d) { return d.n; }).join(" or ") + " fits");
                out(root, "why", job.t + " needs " + job.need + ".");

            } else {

                out(root, "verdict", "No single device covers this");
                out(root, "why", job.t + " needs " + job.need + ". The answer is a team: a battery for the energy, a supercapacitor for the bursts.");
            }

            found[state.job] = true;

            if (Object.keys(found).length >= 4) {
                F.reward("supercap-ragone", 10, "You matched jobs to devices on the Ragone plot");
            }
        }

        wire(root, state, defaults, draw);
        draw();
    };


    SIMS["supercap-tradeoff"] = quiz(
        "Game: battery, capacitor or supercapacitor?",
        ["Battery", "Conventional capacitor", "Supercapacitor"],
        [
            { q: "Stores the most energy, but wears out after a limited number of cycles.", a: "Battery", why: "Its chemical reactions slowly use up the electrodes." },
            { q: "Charges in a flash but holds only a tiny amount of energy.", a: "Conventional capacitor", why: "Little electrode area means little charge to separate." },
            { q: "Fast power and a million cycles, with far more energy than an ordinary capacitor.", a: "Supercapacitor", why: "That is the middle ground it was invented for." },
            { q: "Its energy is stored in chemical reactions throughout the electrode.", a: "Battery", why: "Bulk reactions give high energy but slow delivery." },
            { q: "Perfect for a camera flash: a short, huge burst.", a: "Conventional capacitor", why: "It releases its small store almost instantly." },
            { q: "Ideal for catching braking energy again and again for years.", a: "Supercapacitor", why: "Quick charging plus a very long cycle life." },
            { q: "Sits in the high-power, low-energy corner of the Ragone plot.", a: "Conventional capacitor", why: "High power, low energy: the corner opposite the batteries." },
            { q: "Sits in the middle of the Ragone plot, between the other two.", a: "Supercapacitor", why: "More energy than a capacitor, more power than a battery." }
        ],
        6,
        "supercap-tradeoff-done",
        "You can tell the three devices apart",
        "You can place all three devices on the Ragone plot.",
        "Remember: batteries win on energy, capacitors win on speed, supercapacitors sit between. Hit Reset to try again."
    );


    /* ======================================
       UNIT 2: CHARGE AND DISCHARGE
    ====================================== */

    SIMS["supercap-plates"] = function (root) {

        const defaults = { mode: "charge", res: 3 };
        const state = { mode: "charge", res: 3 };
        const did = {};

        root.innerHTML =
            head("Try it: charge a capacitor, then run a lamp from it") +
            canvasFor(root, 680, 320, "Two parallel plates with a gap between them. In charge mode a battery pushes positive charge onto the top plate and negative onto the bottom plate. In discharge mode the stored charge runs through a lamp.") +
            '<div class="fd-stat-row">' + stat("Voltage across it", "volt") + stat("Charge stored", "q") + stat("Current now", "cur") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Connect it to", "mode", [["charge", "🔋 The battery"], ["discharge", "💡 The lamp"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Internal resistance (higher means slower)", key: "res", min: 1, max: 10, step: 1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">No current ever crosses the gap. Charge piles up on one plate and leaves the other, and that separation is the stored energy.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let q = 0;
        let rate = 0;
        let phase = 0;

        function update() {

            setVal(root, "res", state.res);
        }

        function wireLine(pts, hot) {

            ctx.strokeStyle = hot ? GOLD + ".95)" : GREY + ".3)";
            ctx.lineWidth = hot ? 3 : 2;
            ctx.setLineDash(hot ? [] : [6, 6]);
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);

            for (let i = 1; i < pts.length; i++) {
                ctx.lineTo(pts[i][0], pts[i][1]);
            }

            ctx.stroke();
            ctx.setLineDash([]);
        }

        function draw() {

            clear(ctx, 680, 320);

            const charging = state.mode === "charge";
            const cx = 340;
            const topY = 130;
            const botY = 200;

            // circuit rails
            const railTop = [[cx, topY], [cx, 70]];
            const railBot = [[cx, botY], [cx, 250]];

            wireLine([[cx, 70], [90, 70], [90, 110]], charging);
            wireLine([[cx, 250], [90, 250], [90, 210]], charging);
            wireLine([[cx, 70], [590, 70], [590, 118]], !charging);
            wireLine([[cx, 250], [590, 250], [590, 202]], !charging);
            wireLine(railTop, true);
            wireLine(railBot, true);

            // battery
            ctx.strokeStyle = TEXT + ".9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(70, 110); ctx.lineTo(110, 110);
            ctx.stroke();
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(78, 125); ctx.lineTo(102, 125);
            ctx.stroke();
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(70, 140); ctx.lineTo(110, 140);
            ctx.stroke();
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(78, 155); ctx.lineTo(102, 155);
            ctx.stroke();
            txt(ctx, "battery", 90, 290, 14, TEXT + ".85)");
            txt(ctx, "+", 126, 118, 16, ROSE + "1)", "center", true);
            txt(ctx, "−", 126, 224, 18, BLUE + "1)", "center", true);
            wireLine([[90, 155], [90, 210]], charging);

            // lamp
            const glow = !charging ? clamp(q, 0, 1) : 0;

            if (glow > 0.02) {

                const g = ctx.createRadialGradient(590, 160, 4, 590, 160, 70);

                g.addColorStop(0, GOLD + (0.85 * glow) + ")");
                g.addColorStop(1, GOLD + "0)");
                ctx.fillStyle = g;
                ctx.fillRect(510, 80, 160, 160);
            }

            ctx.strokeStyle = TEXT + ".9)";
            ctx.lineWidth = 3;
            ctx.fillStyle = GOLD + (0.15 + 0.7 * glow) + ")";
            ctx.beginPath();
            ctx.arc(590, 160, 32, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(576, 174); ctx.lineTo(586, 150); ctx.lineTo(594, 170); ctx.lineTo(604, 146);
            ctx.stroke();
            txt(ctx, "lamp", 590, 290, 14, TEXT + ".85)");

            // plates and dielectric
            ctx.fillStyle = BLUE + ".16)";
            ctx.fillRect(cx - 120, topY + 8, 240, botY - topY - 16);
            ctx.fillStyle = GREY + ".95)";
            ctx.fillRect(cx - 120, topY - 8, 240, 10);
            ctx.fillRect(cx - 120, botY - 2, 240, 10);
            txt(ctx, "insulating gap (dielectric)", cx, (topY + botY) / 2 + 5, 13, TEXT + ".75)");

            // stored charges
            const n = Math.round(q * 9);

            for (let i = 0; i < n; i++) {

                const x = cx - 105 + i * (210 / 8);

                txt(ctx, "+", x, topY + 24, 17, ROSE + "1)", "center", true);
                txt(ctx, "−", x, botY - 10, 19, BLUE + "1)", "center", true);
            }

            // field lines
            if (q > 0.05) {

                ctx.strokeStyle = GOLD + (0.15 + 0.5 * q) + ")";
                ctx.lineWidth = 1.6;

                for (let i = 0; i < 5; i++) {

                    const x = cx - 90 + i * 45;

                    ctx.beginPath();
                    ctx.moveTo(x, topY + 30); ctx.lineTo(x, botY - 26);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x - 4, botY - 33); ctx.lineTo(x, botY - 25); ctx.lineTo(x + 4, botY - 33);
                    ctx.stroke();
                }
            }

            // electrons drifting along the live wire
            const flow = Math.abs(rate);

            if (flow > 0.02) {

                const path = charging ?
                    [[90, 110], [90, 70], [cx, 70], [cx, topY]] :
                    [[cx, topY], [cx, 70], [590, 70], [590, 118]];
                let len = 0;
                const segs = [];

                for (let i = 1; i < path.length; i++) {

                    const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);

                    segs.push(l);
                    len += l;
                }

                for (let k = 0; k < 6; k++) {

                    let d = ((phase * 0.6 + k / 6) % 1) * len;

                    for (let i = 0; i < segs.length; i++) {

                        if (d <= segs[i]) {

                            const u = d / segs[i];

                            dot(ctx, path[i][0] + (path[i + 1][0] - path[i][0]) * u, path[i][1] + (path[i + 1][1] - path[i][1]) * u, 4, GOLD + clamp(flow * 1.4, 0.3, 1) + ")");

                            break;
                        }

                        d -= segs[i];
                    }
                }
            }

            out(root, "volt", (q * 5).toFixed(2) + " V");
            out(root, "q", Math.round(q * 100) + " %");
            out(root, "cur", Math.round(flow * 100) + " %");

            if (charging) {
                out(root, "verdict", q > 0.97 ? "Full: charge separated, no more current" : "Charging: charge separates across the gap");
            } else {
                out(root, "verdict", q < 0.03 ? "Empty: the stored energy is spent" : "Discharging: the stored energy runs the lamp");
            }
        }

        animate(root, function (dt) {

            const tau = 0.12 * state.res;
            const target = state.mode === "charge" ? 1 : 0;
            const before = q;

            q += (target - q) * (1 - Math.exp(-dt / tau));
            rate = (q - before) / dt / 2.5;
            phase += dt * clamp(Math.abs(rate) * 2, 0.2, 2);

            if (q > 0.9) { did.c = true; }
            if (did.c && q < 0.3 && state.mode === "discharge") { did.d = true; }
            if (did.c && did.d) { F.reward("supercap-plates", 10, "You charged and discharged a capacitor"); }

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
       UNIT 3: CAPACITANCE, ENERGY, LEVERS
    ====================================== */

    SIMS["supercap-capeq"] = function (root) {

        const defaults = { la: -4, ld: -4, er: 3 };
        const state = { la: -4, ld: -4, er: 3 };
        const EPS0 = 8.854e-12;

        root.innerHTML =
            head("Try it: C = ε × A ÷ d") +
            canvasFor(root, 680, 300, "Two plates whose size and gap follow the sliders, with a meter that shows the resulting capacitance on a scale from picofarads to thousands of farads.") +
            '<div class="fd-stat-row">' + stat("Capacitance", "c") + stat("Area", "a") + stat("Gap", "d") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-preset="plain">🔌 Ordinary capacitor</button><button type="button" class="fd-sim-btn" data-preset="super">⚡ Supercapacitor-style</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Electrode area", key: "la", min: -4, max: 3, step: 0.25, value: -4 }) +
            slider({ label: "Gap between the charges", key: "ld", min: -9, max: -3, step: 0.25, value: -4 }) +
            slider({ label: "Dielectric (relative permittivity ε)", key: "er", min: 1, max: 80, step: 1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">C = ε₀ε<sub>r</sub> · A ÷ d. A supercapacitor wins by making A enormous (porous carbon) and d tiny (ions only a nanometer from the surface).</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function fmtLen(m) {

            if (m >= 1) { return m.toFixed(0) + " m"; }
            if (m >= 1e-3) { return (m * 1e3).toFixed(m >= 0.01 ? 0 : 1) + " mm"; }
            if (m >= 1e-6) { return (m * 1e6).toFixed(m >= 1e-5 ? 0 : 1) + " µm"; }

            return (m * 1e9).toFixed(m >= 1e-8 ? 0 : 1) + " nm";
        }

        function fmtArea(a) {

            if (a >= 1) { return a.toFixed(a >= 10 ? 0 : 1) + " m²"; }

            return (a * 1e4).toFixed(a >= 1e-3 ? 0 : 2) + " cm²";
        }

        function compute() {

            const A = Math.pow(10, state.la);
            const d = Math.pow(10, state.ld);

            return { A: A, d: d, C: EPS0 * state.er * A / d };
        }

        function update() {

            const r = compute();

            setVal(root, "la", fmtArea(r.A));
            setVal(root, "ld", fmtLen(r.d));
            setVal(root, "er", state.er);
            out(root, "c", fmtC(r.C));
            out(root, "a", fmtArea(r.A));
            out(root, "d", fmtLen(r.d));

            const verdict = r.C >= 1 ? "Supercapacitor territory: farads of capacitance" :
                r.C >= 1e-3 ? "Millifarads: a big electrolytic capacitor" :
                    r.C >= 1e-6 ? "Microfarads: a typical electronics capacitor" : "Picofarads to nanofarads: a tiny ordinary capacitor";

            out(root, "verdict", verdict);

            if (r.C >= 1) {
                F.reward("supercap-capeq", 10, "You pushed capacitance past one farad");
            }
        }

        function draw() {

            clear(ctx, 680, 300);

            const r = compute();
            const wPlate = 40 + (state.la + 4) / 7 * 200;
            const gap = 8 + (state.ld + 9) / 6 * 70;
            const cx = 340;
            const cy = 120;

            ctx.fillStyle = BLUE + (0.12 + Math.min(0.4, state.er / 200)) + ")";
            ctx.fillRect(cx - wPlate / 2, cy - gap / 2, wPlate, gap);
            ctx.fillStyle = GREY + ".95)";
            ctx.fillRect(cx - wPlate / 2, cy - gap / 2 - 10, wPlate, 10);
            ctx.fillRect(cx - wPlate / 2, cy + gap / 2, wPlate, 10);

            ctx.strokeStyle = GOLD + ".9)";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(cx + wPlate / 2 + 14, cy - gap / 2);
            ctx.lineTo(cx + wPlate / 2 + 14, cy + gap / 2);
            ctx.stroke();
            txt(ctx, "d", cx + wPlate / 2 + 28, cy + 5, 14, GOLD + "1)", "center", true);
            txt(ctx, "A", cx, cy - gap / 2 - 20, 14, TEAL + "1)", "center", true);
            txt(ctx, "ε = " + state.er, cx, cy + 4, 13, TEXT + ".85)");

            // log meter from 1 pF to 1000 F
            const mx0 = 50;
            const mx1 = 630;
            const my = 232;
            const lc = Math.log10(Math.max(r.C, 1e-12));
            const frac = clamp((lc + 12) / 15, 0, 1);

            ctx.fillStyle = GREY + ".22)";
            ctx.fillRect(mx0, my, mx1 - mx0, 16);
            ctx.fillStyle = (r.C >= 1 ? TEAL : GOLD) + ".9)";
            ctx.fillRect(mx0, my, (mx1 - mx0) * frac, 16);

            const ticks = [[-12, "1 pF"], [-9, "1 nF"], [-6, "1 µF"], [-3, "1 mF"], [0, "1 F"], [3, "1 kF"]];

            ticks.forEach(function (t) {

                const x = mx0 + (t[0] + 12) / 15 * (mx1 - mx0);

                ctx.fillStyle = TEXT + ".6)";
                ctx.fillRect(x - 0.5, my + 16, 1, 6);
                txt(ctx, t[1], x, my + 38, 12, TEXT + ".8)");
            });

            txt(ctx, "ceramic cap", mx0 + (-10.5 + 12) / 15 * (mx1 - mx0), my - 8, 12, BLUE + "1)");
            txt(ctx, "electrolytic", mx0 + (-4 + 12) / 15 * (mx1 - mx0), my - 8, 12, BLUE + "1)");
            txt(ctx, "supercapacitor", mx0 + (1.5 + 12) / 15 * (mx1 - mx0), my - 8, 12, TEAL + "1)");
            txt(ctx, "capacitance, ten times more at every tick", 340, 292, 12, TEXT + ".6)");
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        root.querySelectorAll("[data-preset]").forEach(function (b) {

            b.addEventListener("click", function () {

                if (b.dataset.preset === "plain") {

                    state.la = -4; state.ld = -4; state.er = 3;

                } else {

                    state.la = 3; state.ld = -9; state.er = 10;
                }

                root.querySelectorAll("input[type=range]").forEach(function (i) { i.value = state[i.dataset.key]; });

                update();
                draw();
            });
        });

        update();
        draw();
    };


    SIMS["supercap-energy"] = function (root) {

        const defaults = { c: 100, v: 2 };
        const state = { c: 100, v: 2 };

        root.innerHTML =
            head("Try it: E = ½ × C × V²") +
            art("0 0 340 190", "Two bars: the energy a supercapacitor stores at the chosen voltage, next to a faint bar for what it would store at half that voltage.") +
            '<div class="fd-stat-row">' + stat("Energy stored", "j") + stat("In watt-hours", "wh") + stat("At half the voltage", "half") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-act="c">Double the capacitance</button><button type="button" class="fd-sim-btn" data-act="v">Double the voltage</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Capacitance C", key: "c", min: 10, max: 3000, step: 10, value: 100 }) +
            slider({ label: "Voltage V", key: "v", min: 0.5, max: 3, step: 0.1, value: 2 }) +
            "</div>" +
            '<p class="fd-sim-formula">Double C and you double the energy. Double V and you get four times the energy: the voltage is squared.</p>';

        const svg = root.querySelector("svg");
        let last = "";

        function joules(c, v) { return 0.5 * c * v * v; }

        function update() {

            const e = joules(state.c, state.v);

            setVal(root, "c", state.c + " F");
            setVal(root, "v", state.v.toFixed(1) + " V");
            out(root, "j", e >= 1000 ? (e / 1000).toFixed(2) + " kJ" : e.toFixed(1) + " J");
            out(root, "wh", (e / 3600).toFixed(3) + " Wh");
            out(root, "half", (joules(state.c, state.v / 2)).toFixed(1) + " J");
            out(root, "verdict", last || "Move a slider, or press a button to double something");

            const max = joules(state.c, 3);
            const e0 = joules(state.c, state.v);
            const e1 = joules(state.c, state.v / 2);
            const h0 = Math.max(1, 130 * e0 / max);
            const h1 = Math.max(1, 130 * e1 / max);

            svg.innerHTML =
                rect(60, 175 - h0, 80, h0, "rgba(84,224,199,.8)", "rgba(84,224,199,1)") +
                rect(200, 175 - h1, 80, h1, "rgba(255,214,102,.5)", "rgba(255,214,102,.9)") +
                '<line x1="40" y1="175" x2="300" y2="175" style="stroke:rgba(170,179,207,.6);stroke-width:1"/>' +
                label(100, 186, "at " + state.v.toFixed(1) + " V", 8, "middle", "var(--text)") +
                label(240, 186, "at " + (state.v / 2).toFixed(2) + " V", 8, "middle", "var(--text)") +
                label(100, 168 - h0, "E", 9, "middle", "var(--accent)") +
                label(240, 168 - h1, "¼ of E", 9, "middle", "var(--text)") +
                label(170, 14, "bar height is the energy, at the capacitance you chose (full height is 3 V)", 6.5, "middle", "var(--muted)");

            if (state.v >= 2.9 && state.c >= 2900) {
                F.reward("supercap-energy", 10, "You maxed out a supercapacitor");
            }
        }

        wire(root, state, defaults, update);

        root.querySelectorAll("[data-act]").forEach(function (b) {

            b.addEventListener("click", function () {

                const before = joules(state.c, state.v);

                if (b.dataset.act === "c") {
                    state.c = Math.min(3000, state.c * 2);
                } else {
                    state.v = Math.min(3, Math.round(state.v * 2 * 10) / 10);
                }

                const after = joules(state.c, state.v);

                last = after > before ? "Energy went up " + (after / before).toFixed(1) + "×" + (b.dataset.act === "v" ? ": voltage is squared" : "") : "Already at the top of the slider";

                root.querySelectorAll("input[type=range]").forEach(function (i) { i.value = state[i.dataset.key]; });

                update();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () { last = ""; });

        update();
    };


    SIMS["supercap-levers"] = quiz(
        "Game: which lever was pulled?",
        ["More surface area", "Less spacing", "Better electrolyte transport", "Reversible redox reactions"],
        [
            { q: "Swapping a flat electrode for porous, three-dimensional carbon.", a: "More surface area", why: "More surface means more places for charge to sit." },
            { q: "Moving the interdigitated fingers closer together.", a: "Less spacing", why: "A smaller distance d raises capacitance." },
            { q: "Coating the carbon with manganese oxide.", a: "Reversible redox reactions", why: "Faradaic charge storage adds to the electrostatic storage." },
            { q: "Switching to an electrolyte whose ions move more freely.", a: "Better electrolyte transport", why: "Ions reach the surface faster, so more of it is used." },
            { q: "Growing taller electrodes on the same footprint.", a: "More surface area", why: "Taller walls add area without using more chip space." },
            { q: "Making the insulating gap between plates thinner.", a: "Less spacing", why: "C goes up as d goes down." },
            { q: "Adding a polymer that stores charge by doping and dedoping.", a: "Reversible redox reactions", why: "Reversible reactions store extra charge." },
            { q: "Opening up larger pores so ions can flow in easily.", a: "Better electrolyte transport", why: "Ions only store charge if they can get there." }
        ],
        6,
        "supercap-levers-done",
        "You can name the four levers",
        "Four levers: area, spacing, ion transport and redox reactions.",
        "The four levers: more area, less spacing, better ion transport, and reversible redox. Hit Reset to try again."
    );


    /* ======================================
       UNIT 4: CYCLIC VOLTAMMETRY
    ====================================== */

    SIMS["supercap-cv"] = function (root) {

        const defaults = { kind: "cap", v: 50 };
        const state = { kind: "cap", v: 50 };
        const seen = {};

        root.innerHTML =
            head("Try it: sweep the voltage and watch the current") +
            canvasFor(root, 680, 340, "A cyclic voltammogram: current plotted against voltage as the voltage sweeps up and back down. A capacitor gives a rectangle, a pseudocapacitor adds broad humps and a battery-like material gives sharp peaks.") +
            '<div class="fd-stat-row">' + stat("Voltage now", "vnow") + stat("Current now", "inow") + stat("Biggest current", "imax") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrode", "kind", [["cap", "Double layer (rectangle)"], ["pseudo", "Pseudocapacitor (humps)"], ["batt", "Battery-like (sharp peaks)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Scan rate", key: "v", min: 10, max: 200, step: 10, value: 50 }) +
            "</div>" +
            '<p class="fd-sim-formula">The area inside the loop is the charge stored. A capacitor\'s current grows in proportion to the scan rate; a diffusion-limited peak grows only with its square root.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const L = 70;
        const R = 650;
        const T = 24;
        const B = 296;
        const YMAX = 4.2;

        let phase = 0;

        function current(V, dir) {

            const v = state.v / 1000;
            const k = 10 * v; // C of 10 mF times scan rate, in mA
            const lead = 1 - Math.exp(-(dir > 0 ? V : 1 - V) / 0.07);
            let i = k * lead;

            if (state.kind === "pseudo") {

                const hump = dir > 0 ? 0.55 : 0.45;

                i += 0.55 * k * Math.exp(-Math.pow((V - hump) / 0.2, 2)) * 1.2;
            }

            if (state.kind === "batt") {

                const pk = dir > 0 ? 0.62 : 0.38;

                i = 0.18 * k * lead + 1.4 * Math.sqrt(v / 0.05) * Math.exp(-Math.pow((V - pk) / 0.045, 2));
            }

            return dir > 0 ? i : -i;
        }

        const X = function (V) { return L + V * (R - L); };
        const Y = function (i) { return (T + B) / 2 - (i / YMAX) * ((B - T) / 2); };

        function update() {

            setVal(root, "v", state.v + " mV/s");
            seen[state.kind] = true;

            if (seen.cap && seen.pseudo && seen.batt) {
                F.reward("supercap-cv", 10, "You compared all three CV shapes");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            // axes
            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B);
            ctx.stroke();
            ctx.strokeStyle = GREY + ".25)";
            ctx.beginPath();
            ctx.moveTo(L, Y(0)); ctx.lineTo(R, Y(0));
            ctx.stroke();

            for (let t = 0; t <= 1.001; t += 0.25) {

                txt(ctx, (t).toFixed(2) + " V", X(t), B + 20, 12, TEXT + ".7)");
            }

            txt(ctx, "voltage →", (L + R) / 2, B + 40, 13, TEXT + ".85)");
            ctx.save();
            ctx.translate(18, (T + B) / 2);
            ctx.rotate(-Math.PI / 2);
            txt(ctx, "current (mA) →", 0, 0, 13, TEXT + ".85)");
            ctx.restore();

            // the loop
            const pts = [];
            let imax = 0;

            for (let i = 0; i <= 100; i++) {
                pts.push([i / 100, current(i / 100, 1)]);
            }

            for (let i = 100; i >= 0; i--) {
                pts.push([i / 100, current(i / 100, -1)]);
            }

            pts.forEach(function (p) { imax = Math.max(imax, Math.abs(p[1])); });

            ctx.fillStyle = TEAL + ".13)";
            ctx.strokeStyle = TEAL + ".9)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            pts.forEach(function (p, i) {

                const x = X(p[0]);
                const y = Y(clamp(p[1], -YMAX, YMAX));

                if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            });

            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // moving dot
            const u = (phase % 2);
            const up = u < 1;
            const V = up ? u : 2 - u;
            const iNow = current(V, up ? 1 : -1);

            dot(ctx, X(V), Y(clamp(iNow, -YMAX, YMAX)), 7, GOLD + "1)");
            ctx.strokeStyle = GOLD + ".4)";
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(X(V), Y(clamp(iNow, -YMAX, YMAX))); ctx.lineTo(X(V), B);
            ctx.stroke();
            ctx.setLineDash([]);

            txt(ctx, up ? "sweeping up →" : "← sweeping down", (L + R) / 2, T + 14, 13, GOLD + "1)", "center", true);

            out(root, "vnow", V.toFixed(2) + " V");
            out(root, "inow", iNow.toFixed(2) + " mA");
            out(root, "imax", imax.toFixed(2) + " mA");
            out(root, "verdict", state.kind === "cap" ? "Flat plateau: the current just tracks the scan rate" :
                state.kind === "pseudo" ? "Humps: fast surface redox on top of double-layer storage" :
                    "Sharp peaks: bulk-style reactions, controlled by diffusion");
        }

        animate(root, function (dt) {

            phase += dt * (0.12 + state.v / 500);

            draw();
        });

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    SIMS["supercap-peak"] = function (root) {

        const defaults = { n: 1, a: 0.07, c: 5, v: 100 };
        const state = { n: 1, a: 0.07, c: 5, v: 100 };
        const D = 7.6e-6; // cm²/s for ferricyanide

        root.innerHTML =
            head("Try it: what sets the peak current?") +
            art("0 0 340 190", "A bar for the peak current, and a small chart showing how the peak current grows with the square root of the scan rate.") +
            '<div class="fd-stat-row">' + stat("Peak current", "ip") + stat("Compared with the start", "rel") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrons per molecule (n)", "n", [["1", "n = 1"], ["2", "n = 2"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Electrode area A", key: "a", min: 0.01, max: 0.2, step: 0.01, value: 0.07 }) +
            slider({ label: "Concentration C", key: "c", min: 1, max: 10, step: 1, value: 5 }) +
            slider({ label: "Scan rate v", key: "v", min: 10, max: 400, step: 10, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">i<sub>p</sub> = 2.69×10⁵ · n<sup>3/2</sup> · A · D<sup>1/2</sup> · C · v<sup>1/2</sup> &nbsp;(D for ferricyanide, about 7.6×10⁻⁶ cm²/s)</p>';

        const svg = root.querySelector("svg");

        function ip(s) {

            return 2.69e5 * Math.pow(s.n, 1.5) * s.a * Math.sqrt(D) * (s.c * 1e-6) * Math.sqrt(s.v / 1000) * 1e6; // µA
        }

        const base = ip(defaults);

        function update() {

            const i = ip(state);

            setVal(root, "a", state.a.toFixed(2) + " cm²");
            setVal(root, "c", state.c + " mM");
            setVal(root, "v", state.v + " mV/s");
            out(root, "ip", i.toFixed(0) + " µA");
            out(root, "rel", (i / base).toFixed(2) + "×");
            out(root, "verdict", i > base * 1.02 ? "Higher than the start: " + (i / base).toFixed(1) + "×" : i < base * 0.98 ? "Lower than the start: " + (i / base).toFixed(2) + "×" : "Same as the starting setup");

            // bar
            const maxI = ip({ n: 2, a: 0.2, c: 10, v: 400 });
            const w = 150 * Math.sqrt(i / maxI);

            let s = label(20, 18, "Peak current", 8, "start", "var(--muted)") +
                rect(20, 24, 150, 16, "rgba(170,179,207,.2)") +
                rect(20, 24, w, 16, "rgba(84,224,199,.85)") +
                label(20, 54, i.toFixed(0) + " µA", 10, "start", "var(--text)");

            // i_p versus sqrt(v)
            const gx = 195;
            const gy = 30;
            const gw = 125;
            const gh = 120;

            s += rect(gx, gy, gw, gh, "rgba(6,10,24,.55)", "rgba(170,179,207,.35)");

            const top = ip({ n: state.n, a: state.a, c: state.c, v: 400 });
            const pts = [];

            for (let v = 0; v <= 400; v += 20) {
                pts.push([gx + (v / 400) * gw, gy + gh - (ip({ n: state.n, a: state.a, c: state.c, v: v }) / top) * (gh - 8)]);
            }

            s += pline(pts, "rgba(84,224,199,1)", 1.6);

            const dx = gx + (state.v / 400) * gw;
            const dy = gy + gh - (i / top) * (gh - 8);

            s += '<circle cx="' + dx + '" cy="' + dy + '" r="4" style="fill:#ffd666"/>';
            s += label(gx + gw / 2, gy + gh + 12, "scan rate v →", 7, "middle", "var(--muted)");
            s += '<text transform="translate(' + (gx - 8) + " " + (gy + gh / 2) + ') rotate(-90)" text-anchor="middle" style="font-size:7px;fill:var(--muted)">peak current</text>';
            s += label(gx + gw / 2, gy - 6, "peak current grows as √v", 7, "middle", "var(--text)");

            // multipliers
            const ml = [["n", Math.pow(state.n, 1.5)], ["A", state.a / defaults.a], ["C", state.c / defaults.c], ["v", Math.sqrt(state.v / defaults.v)]];

            ml.forEach(function (m, k) {

                s += rect(20 + k * 42, 74, 38, 30, "rgba(255,255,255,.05)", "rgba(170,179,207,.35)");
                s += label(39 + k * 42, 85, m[0] === "n" ? "n^1.5".replace("^1.5", "¹·⁵") : m[0] === "v" ? "√v" : m[0], 8, "middle", "var(--muted)");
                s += label(39 + k * 42, 99, m[1].toFixed(2) + "×", 8.5, "middle", "var(--text)");
            });

            s += label(20, 122, "each factor, compared with the start", 7, "start", "var(--muted)");

            svg.innerHTML = s;

            if (state.v >= 390 && state.n === 2) {
                F.reward("supercap-peak", 10, "You explored the Randles-Ševčík equation");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 5: A SUPERCAPACITOR CHARGING
    ====================================== */

    SIMS["supercap-ioncharge"] = function (root) {

        const defaults = { mode: "charge" };
        const state = { mode: "charge" };
        const did = {};

        root.innerHTML =
            head("Try it: charge and discharge a supercapacitor") +
            canvasFor(root, 680, 330, "A supercapacitor cell with a negative electrode on the left and a positive electrode on the right, ions in the electrolyte between them, and an external circuit. When charging, electrons flow through the wire and ions move to the oppositely charged surfaces.") +
            '<div class="fd-stat-row">' + stat("Charge stored", "q") + stat("Ions at surfaces", "ions") + stat("Wire current", "cur") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Circuit", "mode", [["charge", "⚡ Charge it"], ["discharge", "💡 Discharge it"], ["hold", "⏸ Hold"]]) +
            '<p class="fd-sim-formula">Electrons are pushed out of one electrode and into the other. Ions in the electrolyte answer by moving to the oppositely charged surfaces to keep everything neutral.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(7);

        const LX = 150; // left electrode surface
        const RX = 530; // right electrode surface
        const TOP = 100;
        const BOT = 270;

        const ions = [];

        for (let i = 0; i < 30; i++) {

            ions.push({
                sign: i % 2 ? 1 : -1,
                x: LX + 30 + rand() * (RX - LX - 60),
                y: TOP + 12 + rand() * (BOT - TOP - 24),
                vx: (rand() - 0.5) * 30,
                vy: (rand() - 0.5) * 30,
                slot: Math.floor(i / 2)
            });
        }

        let q = 0;
        let rate = 0;
        let phase = 0;

        function surfaceTarget(ion) {

            // positive ions go to the negative (left) electrode; negative ions to the right
            const idx = ion.slot % 15;
            const row = idx % 5;
            const col = Math.floor(idx / 5);
            const y = TOP + 22 + row * ((BOT - TOP - 44) / 4);

            return ion.sign > 0 ? [LX + 14 + col * 2, y + (col ? 8 : 0)] : [RX - 14 - col * 2, y + (col ? 8 : 0)];
        }

        function draw() {

            clear(ctx, 680, 330);

            // electrolyte and electrodes
            ctx.fillStyle = BLUE + ".1)";
            ctx.fillRect(LX, TOP, RX - LX, BOT - TOP);

            const shade = clamp(q, 0, 1);

            ctx.fillStyle = GREY + ".45)";
            ctx.fillRect(LX - 46, TOP, 46, BOT - TOP);
            ctx.fillRect(RX, TOP, 46, BOT - TOP);

            // charge on electrodes
            const n = Math.round(shade * 6);

            for (let i = 0; i < n; i++) {

                const y = TOP + 20 + i * ((BOT - TOP - 40) / 5);

                txt(ctx, "−", LX - 24, y + 6, 22, BLUE + "1)", "center", true);
                txt(ctx, "+", RX + 24, y + 6, 20, ROSE + "1)", "center", true);
            }

            txt(ctx, "negative electrode", LX - 24, BOT + 24, 13, TEXT + ".85)");
            txt(ctx, "positive electrode", RX + 24, BOT + 24, 13, TEXT + ".85)");
            txt(ctx, "electrolyte with free ions", (LX + RX) / 2, BOT + 24, 13, TEXT + ".85)");

            // wires
            const charging = state.mode === "charge";
            const discharging = state.mode === "discharge";
            const live = charging || discharging;

            ctx.strokeStyle = live ? GOLD + ".95)" : GREY + ".4)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(LX - 24, TOP); ctx.lineTo(LX - 24, 40); ctx.lineTo(RX + 24, 40); ctx.lineTo(RX + 24, TOP);
            ctx.stroke();

            // source or load in the wire
            ctx.fillStyle = "rgba(11,16,32,1)";
            ctx.fillRect(310, 22, 60, 36);
            ctx.strokeStyle = TEXT + ".9)";
            ctx.lineWidth = 2;
            ctx.strokeRect(310, 22, 60, 36);
            txt(ctx, charging ? "🔋" : discharging ? "💡" : "open", 340, 47, charging || discharging ? 22 : 14, TEXT + ".9)");

            // electrons
            if (Math.abs(rate) > 0.02) {

                const path = charging ?
                    [[RX + 24, TOP], [RX + 24, 40], [340, 40], [LX - 24, 40], [LX - 24, TOP]] :
                    [[LX - 24, TOP], [LX - 24, 40], [340, 40], [RX + 24, 40], [RX + 24, TOP]];

                // electrons leave the positive electrode and arrive at the negative while charging
                let len = 0;
                const segs = [];

                for (let i = 1; i < path.length; i++) {

                    const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);

                    segs.push(l);
                    len += l;
                }

                for (let k = 0; k < 7; k++) {

                    let d = ((phase * 0.6 + k / 7) % 1) * len;

                    for (let i = 0; i < segs.length; i++) {

                        if (d <= segs[i]) {

                            const u = d / segs[i];

                            dot(ctx, path[i][0] + (path[i + 1][0] - path[i][0]) * u, path[i][1] + (path[i + 1][1] - path[i][1]) * u, 4, BLUE + "1)");
                            break;
                        }

                        d -= segs[i];
                    }
                }

                txt(ctx, "e⁻ flow", 340, 14, 12, BLUE + "1)", "center", true);
            }

            // ions
            let atSurface = 0;

            ions.forEach(function (ion) {

                const pos = ion.sign > 0 ? ROSE : BLUE;

                dot(ctx, ion.x, ion.y, 8, pos + ".95)");
                txt(ctx, ion.sign > 0 ? "+" : "−", ion.x, ion.y + 4, 13, "rgba(6,10,24,.95)", "center", true);

                if (Math.abs(ion.x - (ion.sign > 0 ? LX : RX)) < 26) { atSurface++; }
            });

            out(root, "q", Math.round(q * 100) + " %");
            out(root, "ions", atSurface + " of " + ions.length);
            out(root, "cur", Math.round(Math.abs(rate) * 100) + " %");
            out(root, "verdict", charging ? (q > 0.97 ? "Full: ions packed against the surfaces" : "Electrons out of one electrode, ions in toward the surfaces") :
                discharging ? (q < 0.03 ? "Empty: ions have drifted back into the liquid" : "Ions drift back into the liquid and electrons run the load") :
                    "Holding: the charge stays where it is");
        }

        animate(root, function (dt) {

            const before = q;
            const target = state.mode === "charge" ? 1 : state.mode === "discharge" ? 0 : q;

            q += (target - q) * (1 - Math.exp(-dt / 0.9));
            rate = (q - before) / dt / 1.2;
            phase += dt * clamp(Math.abs(rate) * 2, 0.2, 2);

            ions.forEach(function (ion) {

                // wander in the bulk
                ion.vx += (rand() - 0.5) * 140 * dt;
                ion.vy += (rand() - 0.5) * 140 * dt;
                ion.vx = clamp(ion.vx, -26, 26);
                ion.vy = clamp(ion.vy, -26, 26);

                const t = surfaceTarget(ion);
                const pull = clamp(q * 1.3 - ((ion.slot % 15) / 15) * 0.55, 0, 1);

                ion.x += ion.vx * dt * (1 - pull);
                ion.y += ion.vy * dt * (1 - pull);

                ion.x += (t[0] - ion.x) * pull * Math.min(1, dt * 5);
                ion.y += (t[1] - ion.y) * pull * Math.min(1, dt * 5);

                if (ion.x < LX + 12) { ion.x = LX + 12; ion.vx = Math.abs(ion.vx); }
                if (ion.x > RX - 12) { ion.x = RX - 12; ion.vx = -Math.abs(ion.vx); }
                if (ion.y < TOP + 12) { ion.y = TOP + 12; ion.vy = Math.abs(ion.vy); }
                if (ion.y > BOT - 12) { ion.y = BOT - 12; ion.vy = -Math.abs(ion.vy); }
            });

            if (q > 0.9) { did.c = true; }
            if (did.c && q < 0.2) { did.d = true; }
            if (did.c && did.d) { F.reward("supercap-ioncharge", 10, "You charged and discharged a supercapacitor"); }

            draw();
        });

        wire(root, state, defaults, draw);
        draw();
    };


    SIMS["supercap-sort"] = quiz(
        "Game: which kind of supercapacitor?",
        ["EDLC", "Pseudocapacitor", "Hybrid"],
        [
            { q: "Ions line up at the electrode surface and no electrons cross the interface.", a: "EDLC", why: "That is electrostatic storage in the double layer." },
            { q: "Fast, reversible redox reactions at the surface store the charge.", a: "Pseudocapacitor", why: "Electrons really do cross the interface here." },
            { q: "One device that uses both storage mechanisms together.", a: "Hybrid", why: "It combines double-layer and faradaic storage." },
            { q: "Porous activated carbon electrodes that last millions of cycles.", a: "EDLC", why: "Carbon is the double-layer workhorse." },
            { q: "A ruthenium oxide or manganese oxide electrode.", a: "Pseudocapacitor", why: "Metal oxides store charge through redox." },
            { q: "A carbon electrode paired with a redox-active electrode.", a: "Hybrid", why: "One side stores by double layer, the other by redox." },
            { q: "Higher capacitance, but cycling stability takes a hit.", a: "Pseudocapacitor", why: "Repeated redox reactions slowly wear the material." },
            { q: "Best on power and on cycle life, with lower capacitance.", a: "EDLC", why: "No chemistry means almost no wear." }
        ],
        6,
        "supercap-sort-done",
        "You sorted the three kinds",
        "You can sort EDLCs, pseudocapacitors and hybrids.",
        "EDLC: ions line up. Pseudo: surface redox. Hybrid: both. Hit Reset to try again."
    );


    /* ======================================
       UNIT 6: THE ELECTRIC DOUBLE LAYER
    ====================================== */

    SIMS["supercap-edl"] = function (root) {

        const defaults = { rough: 0, volt: 1.5, sign: "pos" };
        const state = { rough: 0, volt: 1.5, sign: "pos" };

        root.innerHTML =
            head("Try it: more surface, more ions, more charge") +
            canvasFor(root, 680, 340, "The surface of an electrode seen from the side, with ions of the liquid lining up along it. A flat surface has little room; a rough, porous surface has far more, so many more ions line up.") +
            '<div class="fd-stat-row">' + stat("Surface length", "len") + stat("Ions lined up", "n") + stat("Capacitance vs. flat", "rel") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Electrode charge", "sign", [["pos", "Positive (anions come)"], ["neg", "Negative (cations come)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Porosity (how rough the surface is)", key: "rough", min: 0, max: 1, step: 0.05, value: 0 }) +
            slider({ label: "Voltage", key: "volt", min: 0, max: 2.5, step: 0.1, value: 1.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Same footprint, more surface: the ions form a thin, dense layer along every nook of the surface. That is the double layer.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(21);

        const N = 260;
        const BASE = 255;
        const L = 40;
        const R = 640;

        const ions = [];

        for (let i = 0; i < N; i++) {

            ions.push({ x: L + rand() * (R - L), y: 40 + rand() * 160, vx: (rand() - 0.5) * 20, vy: (rand() - 0.5) * 20, tx: 0, ty: 0, on: false });
        }

        let path = [];
        let total = 0;

        function profile(x) {

            const A = state.rough * 90;
            const s = Math.sin(2 * Math.PI * (x - L) / 44);

            return BASE - A * (Math.tanh(3 * s) + 1) / 2;
        }

        function build() {

            path = [];
            total = 0;

            let prev = null;

            for (let x = L; x <= R; x += 1) {

                const y = profile(x);

                if (prev) { total += Math.hypot(x - prev[0], y - prev[1]); }

                path.push({ x: x, y: y, s: total });
                prev = [x, y];
            }
        }

        function sites() {

            const list = [];
            const gap = 13;
            let want = 6;

            for (let k = 0; ; k++) {

                const s = want + k * gap;

                if (s > total - 6) { break; }

                // find the path point at arclength s
                let lo = 0;
                let hi = path.length - 1;

                while (lo < hi) {

                    const mid = (lo + hi) >> 1;

                    if (path[mid].s < s) { lo = mid + 1; } else { hi = mid; }
                }

                const p = path[lo];
                const p2 = path[Math.min(path.length - 1, lo + 2)];
                const p1 = path[Math.max(0, lo - 2)];
                const tx = p2.x - p1.x;
                const ty = p2.y - p1.y;
                const len = Math.hypot(tx, ty) || 1;

                list.push([p.x + (ty / len) * 8, p.y - (tx / len) * 8]);
            }

            return list;
        }

        let siteList = [];
        let flatSites = 1;

        function refresh() {

            build();
            siteList = sites();
        }

        // how many sites a flat surface has, for comparison
        (function () {

            const keep = state.rough;

            state.rough = 0;
            build();
            flatSites = sites().length;
            state.rough = keep;
            refresh();
        })();

        function update() {

            setVal(root, "rough", Math.round(state.rough * 100) + " %");
            setVal(root, "volt", state.volt.toFixed(1) + " V");
            refresh();

            const cov = state.volt / 2.5;
            const holds = Math.min(N, Math.round(siteList.length * cov));

            out(root, "len", Math.round(total / (R - L) * 100) + " % of flat");
            out(root, "n", holds);
            out(root, "rel", (siteList.length / flatSites).toFixed(1) + "×");
            out(root, "verdict", state.rough < 0.1 ? "Flat: only a thin row of ions fits" : state.rough < 0.6 ? "Rougher: ions line up in every groove" : "Very porous: a huge surface for ions to reach");

            if (state.rough >= 0.9 && state.volt >= 2) {
                F.reward("supercap-edl", 10, "You saw why porous carbon stores more");
            }
        }

        function draw() {

            clear(ctx, 680, 340);

            const pos = state.sign === "pos";
            const holds = Math.min(N, Math.round(siteList.length * (state.volt / 2.5)));

            // electrolyte backdrop and electrode body
            ctx.fillStyle = BLUE + ".08)";
            ctx.fillRect(L, 20, R - L, BASE - 20);

            ctx.fillStyle = GREY + ".5)";
            ctx.beginPath();
            ctx.moveTo(L, 330);

            path.forEach(function (p) { ctx.lineTo(p.x, p.y); });

            ctx.lineTo(R, 330);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = TEXT + ".8)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            path.forEach(function (p, i) { if (i === 0) { ctx.moveTo(p.x, p.y); } else { ctx.lineTo(p.x, p.y); } });

            ctx.stroke();

            // charge on the electrode surface
            const mark = pos ? "+" : "−";
            const markCol = pos ? ROSE : BLUE;

            for (let k = 0; k < path.length; k += 22) {

                const p = path[k];

                if (state.volt > 0.2) {
                    txt(ctx, mark, p.x, p.y + 14, 13, markCol + (0.35 + state.volt / 4) + ")", "center", true);
                }
            }

            // ions: first `holds` are at the surface
            const ionCol = pos ? BLUE : ROSE;
            const ionMark = pos ? "−" : "+";

            ions.forEach(function (ion, i) {

                ion.on = i < holds;

                if (ion.on) {

                    ion.tx = siteList[i % siteList.length][0];
                    ion.ty = siteList[i % siteList.length][1];
                }

                dot(ctx, ion.x, ion.y, 6, ionCol + ".95)");
                txt(ctx, ionMark, ion.x, ion.y + 4, 11, "rgba(6,10,24,.95)", "center", true);
            });

            txt(ctx, "electrolyte", 120, 40, 13, TEXT + ".7)");
            txt(ctx, "electrode (solid carbon)", 120, 322, 13, TEXT + ".8)");
        }

        animate(root, function (dt) {

            ions.forEach(function (ion) {

                if (ion.on) {

                    ion.x += (ion.tx - ion.x) * Math.min(1, dt * 6);
                    ion.y += (ion.ty - ion.y) * Math.min(1, dt * 6);

                } else {

                    ion.vx += (rand() - 0.5) * 120 * dt;
                    ion.vy += (rand() - 0.5) * 120 * dt;
                    ion.vx = clamp(ion.vx, -22, 22);
                    ion.vy = clamp(ion.vy, -22, 22);
                    ion.x += ion.vx * dt;
                    ion.y += ion.vy * dt;

                    const floor = Math.min(BASE - state.rough * 90 - 14, 200);

                    if (ion.x < L + 6) { ion.x = L + 6; ion.vx = Math.abs(ion.vx); }
                    if (ion.x > R - 6) { ion.x = R - 6; ion.vx = -Math.abs(ion.vx); }
                    if (ion.y < 28) { ion.y = 28; ion.vy = Math.abs(ion.vy); }
                    if (ion.y > floor) { ion.y = floor; ion.vy = -Math.abs(ion.vy); }
                }
            });

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
       UNIT 7: PSEUDOCAPACITANCE
    ====================================== */

    SIMS["supercap-faradaic"] = function (root) {

        const defaults = { kind: "edlc" };
        const state = { kind: "edlc" };
        const seen = {};

        root.innerHTML =
            head("Try it: ions that stay put, or electrons that cross?") +
            canvasFor(root, 680, 320, "A close-up of an electrode surface as the voltage sweeps up and down. In a double-layer capacitor ions only line up. In a pseudocapacitor, electrons hop across the surface and change the surface atoms.") +
            '<div class="fd-stat-row">' + stat("Voltage now", "v") + stat("Electrons that crossed", "e") + stat("Charge stored (relative)", "q") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Mechanism", "kind", [["edlc", "🧲 Double layer"], ["pseudo", "⚗️ Pseudocapacitance"]]) +
            '<p class="fd-sim-formula">Same ions, same surface. The difference is whether electrons cross: faradaic means real, reversible electron transfer.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(33);

        const SX0 = 80;
        const SX1 = 600;
        const SY = 196;
        const NS = 12;

        const sites = [];

        for (let i = 0; i < NS; i++) {
            sites.push({ x: SX0 + 20 + i * ((SX1 - SX0 - 40) / (NS - 1)), th: 0.1 + (i / NS) * 0.8, ox: 0, hop: 0 });
        }

        const ions = [];

        for (let i = 0; i < NS; i++) {
            ions.push({ x: sites[i].x, y: 80 + rand() * 40, vx: (rand() - 0.5) * 20, vy: (rand() - 0.5) * 20, ph: rand() * 6 });
        }

        let t = 0;
        let crossed = 0;

        function volt() {

            const u = (t * 0.25) % 2;

            return u < 1 ? u : 2 - u;
        }

        function draw() {

            clear(ctx, 680, 320);

            const V = volt();
            const pseudo = state.kind === "pseudo";

            // electrode
            ctx.fillStyle = GREY + ".5)";
            ctx.fillRect(SX0 - 20, SY + 22, SX1 - SX0 + 40, 70);
            txt(ctx, "electrode", 340, SY + 66, 14, TEXT + ".85)");

            // surface atoms
            let stored = 0;

            sites.forEach(function (s, i) {

                const want = pseudo && V > s.th ? 1 : 0;
                const before = s.ox;

                s.ox += (want - s.ox) * 0.12;

                if (pseudo && Math.abs(want - before) > 0.5 && Math.abs(s.ox - want) > 0.45 && s.hop <= 0) {

                    s.hop = 1;
                    crossed++;
                }

                const col = pseudo ? "rgba(" + Math.round(170 + 85 * s.ox) + "," + Math.round(179 + 35 * s.ox) + "," + Math.round(207 - 105 * s.ox) + ",1)" : GREY + ".9)";

                dot(ctx, s.x, SY + 12, 10, col);

                // hop animation: electron leaves the surface atom for the electrode body
                if (s.hop > 0) {

                    const u = 1 - s.hop;

                    dot(ctx, s.x, SY + 12 + u * 40, 4, BLUE + (1 - u * 0.5) + ")");
                    s.hop -= 0.04;
                }

                stored += pseudo ? s.ox * 1.0 : 0;
            });

            // ions hover or sit above their sites
            ions.forEach(function (ion, i) {

                const s = sites[i];
                const cov = pseudo ? clamp(s.ox, 0, 1) * 0.55 + clamp(V, 0, 1) * 0.45 : clamp(V * 1.4 - (i / NS) * 0.5, 0, 1);
                const ty = 80 + (SY - 14 - 80) * cov;

                ion.x += (s.x - ion.x) * 0.04 + ion.vx * 0.002;
                ion.y += (ty - ion.y) * 0.08 + Math.sin(t * 2 + ion.ph) * 0.35;

                dot(ctx, ion.x, ion.y, 8, ROSE + ".95)");
                txt(ctx, "+", ion.x, ion.y + 4, 12, "rgba(6,10,24,.95)", "center", true);
            });

            // voltage meter
            ctx.fillStyle = GREY + ".25)";
            ctx.fillRect(20, 30, 14, 150);
            ctx.fillStyle = GOLD + ".9)";
            ctx.fillRect(20, 180 - V * 150, 14, V * 150);
            txt(ctx, "V", 27, 20, 13, GOLD + "1)", "center", true);

            const dl = V * 0.45 * 12;
            const qrel = pseudo ? dl + stored * 1.1 : dl;

            out(root, "v", V.toFixed(2) + " V");
            out(root, "e", pseudo ? crossed : 0);
            out(root, "q", (qrel / 5).toFixed(1) + "×");
            out(root, "verdict", pseudo ? "Surface atoms change state as electrons hop across: extra charge stored" : "Ions line up, but no electrons cross the interface");

            seen[state.kind] = true;

            if (seen.edlc && seen.pseudo && crossed > 10) {
                F.reward("supercap-faradaic", 10, "You compared double-layer and faradaic storage");
            }
        }

        animate(root, function (dt) {

            t += dt;

            const V = volt();

            // reset the crossing counter at each new sweep so it counts reversible cycles
            if (V < 0.02 && crossed > 200) { crossed = 0; }

            draw();
        });

        wire(root, state, defaults, draw);
        draw();
    };


    SIMS["supercap-mechanism"] = quiz(
        "Game: which storage mechanism?",
        ["Double layer", "Pseudocapacitance", "Redox amplification"],
        [
            { q: "Ions stick to the surface; no electrons cross.", a: "Double layer", why: "It is purely electrostatic." },
            { q: "Ruthenium oxide stores charge by quick, reversible redox at its surface.", a: "Pseudocapacitance", why: "Electrons transfer, but only near the surface, so it stays fast." },
            { q: "One molecule shuttles between neighboring electrodes and gives current again and again.", a: "Redox amplification", why: "Each trip is another electron-transfer reaction." },
            { q: "Polyaniline stores charge as it is doped and dedoped.", a: "Pseudocapacitance", why: "That is a reversible faradaic reaction." },
            { q: "Activated carbon charges in seconds and lasts millions of cycles.", a: "Double layer", why: "Nothing is used up, so there is almost no wear." },
            { q: "Moving interdigitated fingers closer boosts the current from a redox couple.", a: "Redox amplification", why: "Shorter distances mean more trips before the molecule escapes." },
            { q: "Ions slip into the near-surface material.", a: "Pseudocapacitance", why: "Intercalation is one of the pseudocapacitive routes." },
            { q: "A generator electrode and a collector electrode regenerate each other's species.", a: "Redox amplification", why: "That generator and collector pair is the amplifier." }
        ],
        6,
        "supercap-mechanism-done",
        "You can tell the three mechanisms apart",
        "Double layer, pseudocapacitance, redox amplification: you have all three.",
        "Double layer: ions line up. Pseudo: surface redox. Amplification: shuttle between electrodes. Hit Reset to try again."
    );


    /* ======================================
       UNIT 8: REDOX AMPLIFICATION
    ====================================== */

    SIMS["supercap-shuttle"] = function (root) {

        const defaults = { gap: 90 };
        const state = { gap: 90 };

        root.innerHTML =
            head("Try it: a molecule shuttling between two electrodes") +
            canvasFor(root, 680, 360, "A generator electrode on the left and a collector electrode on the right with redox molecules bouncing between them. Each time a molecule touches an electrode it swaps an electron, and the counter shows how many trips each molecule makes before it escapes.") +
            '<div class="fd-stat-row">' + stat("Electron transfers", "tr") + stat("Molecules escaped", "esc") + stat("Trips per molecule (amplification)", "amp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Gap between the electrodes", key: "gap", min: 40, max: 220, step: 10, value: 90 }) +
            "</div>" +
            '<p class="fd-sim-formula">Left electrode (generator): reduced molecules give up an electron. Right electrode (collector): oxidized molecules take one back. One molecule, many electrons.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(Date.now() % 9999);

        const TOP = 70;
        const BOT = 300;
        const CX = 340;

        let mols = [];
        let transfers = 0;
        let escaped = 0;
        let escTrips = 0;
        const flashes = [];

        function bounds() {

            return [CX - state.gap / 2, CX + state.gap / 2];
        }

        function spawn() {

            const b = bounds();

            return { x: b[0] + 10 + rand() * (b[1] - b[0] - 20), y: TOP + 20 + rand() * (BOT - TOP - 40), ox: false, trips: 0 };
        }

        function reset() {

            mols = [];

            for (let i = 0; i < 14; i++) { mols.push(spawn()); }

            transfers = 0;
            escaped = 0;
            escTrips = 0;
        }

        function update() {

            setVal(root, "gap", state.gap + " units");
        }

        function draw() {

            clear(ctx, 680, 360);

            const b = bounds();

            // electrodes
            ctx.fillStyle = GOLD + ".55)";
            ctx.fillRect(b[0] - 110, TOP, 110, BOT - TOP);
            ctx.fillStyle = TEAL + ".5)";
            ctx.fillRect(b[1], TOP, 110, BOT - TOP);
            txt(ctx, "generator", b[0] - 55, BOT + 26, 14, GOLD + "1)", "center", true);
            txt(ctx, "collector", b[1] + 55, BOT + 26, 14, TEAL + "1)", "center", true);

            // substrate
            ctx.fillStyle = GREY + ".35)";
            ctx.fillRect(b[0] - 110, BOT, b[1] - b[0] + 220, 10);

            // escape arrow
            txt(ctx, "escapes to the bulk ↑", CX, TOP - 18, 13, TEXT + ".7)");

            // flashes
            flashes.forEach(function (f) {

                ctx.strokeStyle = (f.col) + (f.life) + ")";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(f.x, f.y, 6 + (1 - f.life) * 14, 0, Math.PI * 2);
                ctx.stroke();
            });

            mols.forEach(function (m) {

                dot(ctx, m.x, m.y, 8, m.ox ? ROSE + ".95)" : BLUE + ".95)");
                txt(ctx, m.ox ? "O" : "R", m.x, m.y + 4, 11, "rgba(6,10,24,.95)", "center", true);
            });

            txt(ctx, "R = reduced (blue)   O = oxidized (rose)", CX, 352, 12, TEXT + ".7)");

            out(root, "tr", transfers);
            out(root, "esc", escaped);

            const amp = escaped >= 3 ? escTrips / escaped : null;

            out(root, "amp", amp === null ? "measuring…" : amp.toFixed(1) + "×");
            out(root, "verdict", state.gap <= 70 ? "Tight gap: many trips before a molecule escapes" : state.gap >= 160 ? "Wide gap: molecules mostly escape before returning" : "Medium gap: a few trips each");

            if (amp !== null && amp > 3) {
                F.reward("supercap-shuttle", 10, "You watched redox amplification at work");
            }
        }

        const anim = animate(root, function (dt) {

            const b = bounds();
            const D = 2600;
            const sd = Math.sqrt(2 * D * dt);

            mols.forEach(function (m, i) {

                m.x += (rand() - 0.5) * 2 * sd * 1.15;
                m.y += (rand() - 0.5) * 2 * sd * 1.15;

                if (m.x <= b[0] + 8) {

                    m.x = b[0] + 8 + (b[0] + 8 - m.x);

                    if (!m.ox) {

                        m.ox = true;
                        m.trips++;
                        transfers++;
                        flashes.push({ x: b[0], y: m.y, life: 1, col: GOLD });
                    }
                }

                if (m.x >= b[1] - 8) {

                    m.x = b[1] - 8 - (m.x - (b[1] - 8));

                    if (m.ox) {

                        m.ox = false;
                        m.trips++;
                        transfers++;
                        flashes.push({ x: b[1], y: m.y, life: 1, col: TEAL });
                    }
                }

                m.x = clamp(m.x, b[0] + 8, b[1] - 8);

                if (m.y > BOT - 8) { m.y = BOT - 8 - (m.y - (BOT - 8)); }

                if (m.y < TOP) {

                    escaped++;
                    escTrips += m.trips;
                    mols[i] = spawn();
                    mols[i].y = BOT - 30;
                    mols[i].ox = rand() < 0.5;
                }
            });

            for (let i = flashes.length - 1; i >= 0; i--) {

                flashes[i].life -= dt * 2.2;

                if (flashes[i].life <= 0) { flashes.splice(i, 1); }
            }

            draw();
        });

        bindPause(root, anim);

        wire(root, state, defaults, function () {

            update();

            // keep molecules inside the new gap
            const b = bounds();

            mols.forEach(function (m) { m.x = clamp(m.x, b[0] + 8, b[1] - 8); });

            escaped = 0;
            escTrips = 0;
            transfers = 0;
            draw();
        });

        root.querySelector("[data-reset]").addEventListener("click", reset);

        reset();
        update();
        draw();
    };


    SIMS["supercap-redoxheight"] = function (root) {

        const defaults = { h: 0.22 };
        const state = { h: 0.22 };
        const hit = {};

        root.innerHTML =
            head("Try it: grow the electrodes taller") +
            art("0 0 340 200", "A pair of interdigitated electrode fingers whose height follows the slider, next to a gauge showing the redox amplification factor, which rises from about 9 at 0.22 micrometers to about 37 at 1.1 micrometers.") +
            '<div class="fd-stat-row">' + stat("Electrode height", "h") + stat("Redox amplification", "amp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-set="h:0.22">Study: 0.22 µm</button><button type="button" class="fd-sim-btn" data-set="h:1.1">Study: 1.1 µm</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Electrode height", key: "h", min: 0.1, max: 1.3, step: 0.02, value: 0.22 }) +
            "</div>" +
            '<p class="fd-sim-formula">Between the two measured points the curve is a straight-line guide, not data. The study found ≈9× at 0.22 µm and ≈37× at 1.1 µm: a 5× taller electrode for ≈4× the amplification.</p>';

        const svg = root.querySelector("svg");

        function amp(h) { return Math.max(1, 1.6 + 32.2 * h); }

        function update() {

            const a = amp(state.h);

            setVal(root, "h", state.h.toFixed(2) + " µm");
            out(root, "h", state.h.toFixed(2) + " µm");
            out(root, "amp", "≈ " + a.toFixed(0) + "×");
            out(root, "verdict", Math.abs(state.h - 0.22) < 0.03 ? "The short electrodes from the study: about 9×" : Math.abs(state.h - 1.1) < 0.03 ? "The tall electrodes from the study: about 37×" : "Taller walls mean more electron-transfer chances");

            const base = 170;
            const hh = 20 + state.h * 100;
            let s = rect(10, base, 150, 10, "rgba(170,179,207,.4)");

            for (let k = 0; k < 4; k++) {

                const x = 24 + k * 34;

                s += rect(x, base - hh, 18, hh, k % 2 ? "rgba(84,224,199,.75)" : "rgba(255,214,102,.75)", "rgba(245,247,255,.5)");
            }

            // shuttle arrows between fingers
            s += '<path d="M42 ' + (base - hh / 2) + ' h16" style="stroke:rgba(245,247,255,.85);stroke-width:1.4;fill:none"><animate attributeName="stroke-dasharray" values="0 16;16 0" dur="1.2s" repeatCount="indefinite"/></path>';
            s += label(85, base + 22, "electrode fingers, side view", 7, "middle", "var(--muted)");

            // gauge
            const gx = 210;
            const gy = 24;
            const gh = 150;
            const frac = clamp(amp(state.h) / 45, 0, 1);

            s += rect(gx, gy, 34, gh, "rgba(170,179,207,.2)", "rgba(170,179,207,.4)");
            s += rect(gx, gy + gh * (1 - frac), 34, gh * frac, "rgba(84,224,199,.85)");

            [[9, "≈ 9× (0.22 µm)"], [37, "≈ 37× (1.1 µm)"]].forEach(function (m) {

                const y = gy + gh * (1 - m[0] / 45);

                s += '<line x1="' + (gx - 4) + '" y1="' + y + '" x2="' + (gx + 38) + '" y2="' + y + '" style="stroke:#ffd666;stroke-width:1;stroke-dasharray:3 2"/>';
                s += label(gx + 42, y + 2.5, m[1], 7, "start", "var(--text)");
            });

            s += label(gx + 17, gy - 6, "amplification", 7, "middle", "var(--muted)");

            svg.innerHTML = s;

            hit[Math.round(state.h * 100)] = true;

            if (Math.abs(state.h - 0.22) < 0.03) { hit.lo = true; }
            if (Math.abs(state.h - 1.1) < 0.03) { hit.hi = true; }

            if (hit.lo && hit.hi) {
                F.reward("supercap-redoxheight", 10, "You compared the two electrode heights from the study");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    // Parts 2 to 5 of the supercapacitor simulators.
    [
        ["fabSupercapScriptB", "diagram-sims-supercap-b.js"],
        ["fabSupercapScriptC", "diagram-sims-supercap-c.js"],
        ["fabSupercapScriptD", "diagram-sims-supercap-d.js"],
        ["fabSupercapScriptE", "diagram-sims-supercap-e.js"]
    ].concat(document.querySelector('.fd-sim[data-sim="supercap-3d"]') ? [["fabSupercapScript3d", "diagram-sims-supercap-3d.js"]] : []).concat(document.querySelector('.fd-sim[data-sim^="supercap-3d-"]') ? [["fabSupercapScript3dB", "diagram-sims-supercap-3d-b.js"], ["fabSupercapScript3dC", "diagram-sims-supercap-3d-c.js"]] : []).forEach(function (f) {

        if (document.getElementById(f[0])) {
            return;
        }

        const more = document.createElement("script");

        more.id = f[0];
        more.src = f[1];

        document.head.appendChild(more);
    });

    document.querySelectorAll('.fd-sim[data-sim^="supercap-"]').forEach(F.mount);

})();
