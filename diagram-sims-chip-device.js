/* ========================================
   SAND TO CHIP: DOPING, ANNEALING, CONTACTS, WIRING, AND DESIGN RULES

   Unit 19: dopant atoms and carriers, the p-n junction.
   Unit 22: anneal temperature and time trade-off.
   Unit 26: self-aligned silicide and contact resistance.
   Unit 27: wire delay by metal layer, and a routing game.
   Unit 29: design rule check, and what a mask set costs.

   Registers on window.FabInteract; loaded by diagram-sims-chip.js.
   Teaching models: numbers and shapes are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.chipHelpers) {
        return;
    }

    const H = F.chipHelpers;
    const seg = H.seg;
    const wire = H.wire;
    const head = H.head;
    const setVal = H.setVal;
    const out = H.out;
    const stat = H.stat;
    const art = H.art;
    const sci = H.sci;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

    function mulberry(seedValue) {

        let a = seedValue >>> 0;

        return function () {

            a += 0x6D2B79F5;

            let t = a;

            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function animate(root, frame) {

        let raf = 0;
        let last = 0;
        let paused = false;
        let visible = true;

        function tick(now) {

            raf = 0;

            if (!root.isConnected || paused || !visible) {
                return;
            }

            const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;

            last = now;

            frame(dt);

            raf = requestAnimationFrame(tick);
        }

        function kick() {

            if (!raf && !paused && visible) {

                last = 0;
                raf = requestAnimationFrame(tick);
            }
        }

        if ("IntersectionObserver" in window) {

            new IntersectionObserver(function (entries) {

                visible = entries[0].isIntersecting;

                if (visible) {
                    kick();
                }
            }).observe(root);
        }

        kick();

        return {
            toggle: function () {

                paused = !paused;

                if (!paused) {
                    kick();
                }

                return paused;
            },
            kick: kick
        };
    }

    function bindPause(root, anim) {

        const b = root.querySelector("[data-pause]");

        if (b) {

            b.addEventListener("click", function () {

                const paused = anim.toggle();

                b.textContent = paused ? "▶ Play" : "⏸ Pause";
            });
        }
    }

    function rect(x, y, w, h, fill, stroke) {

        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:' + fill + ";stroke:" + (stroke || "none") + ';stroke-width:1"/>';
    }

    function label(x, y, text, size, anchor, fill) {

        return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" style="font-size:' + (size || 7) + "px;fill:" + (fill || "var(--text)") + '">' + text + "</text>";
    }

    function pline(points, color, width) {

        return '<polyline points="' + points.map(function (p) { return p[0] + "," + p[1]; }).join(" ") + '" style="fill:none;stroke:' + color + ";stroke-width:" + (width || 1) + ';stroke-linejoin:round"/>';
    }

    function legend(items, y) {

        let s = "";
        let x = 14;

        items.forEach(function (it) {

            s += rect(x, y - 6, 8, 8, it[1], "none") + label(x + 12, y + 1, it[0], 7, "start", "var(--muted)");

            x += 22 + it[0].length * 3.9;
        });

        return s;
    }

    function fmtTime(s) {

        if (s < 1) { return Math.round(s * 1000) + " ms"; }
        if (s < 60) { return (s < 10 ? s.toFixed(1) : Math.round(s)) + " s"; }
        if (s < 3600) { return Math.round(s / 60) + " min"; }

        return (s / 3600).toFixed(1) + " hr";
    }

    const COL = {
        si: "rgba(170,179,207,.45)",
        ox: "rgba(120,180,255,.6)",
        poly: "rgba(200,205,225,.6)",
        metal: "rgba(255,214,102,.95)",
        silicide: "rgba(180,140,255,.85)",
        nplus: "rgba(84,224,199,.35)",
        pside: "rgba(255,105,120,.16)",
        nside: "rgba(84,224,199,.16)"
    };


    /* ======================================
       UNIT 19: DOPANT ATOMS AND CARRIERS
    ====================================== */

    SIMS["chip-doping"] = function (root) {

        const defaults = { type: "n", amt: 10 };
        const state = { type: "n", amt: 10 };
        const seen = {};

        root.innerHTML =
            head("Try it: add dopant atoms") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="360" role="img" aria-label="A grid of silicon atoms with a few dopant atoms, each of which releases a free carrier that wanders through the crystal"></canvas>' +
            '<div class="fd-stat-row">' + stat("Free carriers", "carr") + stat("Conducts better than pure silicon by", "gain") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            seg("Dopant", "type", [["n", "n-type (phosphorus)"], ["p", "p-type (boron)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Dopant atoms per 100,000 silicon atoms", key: "amt", min: 0, max: 100, step: 1, value: 10 }) +
            "</div>" +
            '<p class="fd-sim-formula">Drawn much bigger than life: really there is only about one dopant atom among 10,000 to 100,000 silicon atoms.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const COLS = 34;
        const ROWS = 17;
        const SP = 19;
        const GX = (680 - (COLS - 1) * SP) / 2;
        const GY = 40;

        const rand = mulberry(11);
        const order = [];

        for (let i = 0; i < COLS * ROWS; i++) { order.push(i); }

        for (let i = order.length - 1; i > 0; i--) {

            const j = Math.floor(rand() * (i + 1));
            const tmp = order[i];

            order[i] = order[j];
            order[j] = tmp;
        }

        let carriers = [];

        function shown() {

            return state.amt === 0 ? 0 : Math.max(1, Math.round(state.amt * 0.4));
        }

        function syncCarriers() {

            const k = shown();

            while (carriers.length < k) {

                const idx = order[carriers.length];

                carriers.push({
                    x: GX + (idx % COLS) * SP + 6,
                    y: GY + Math.floor(idx / COLS) * SP + 6,
                    vx: (rand() - 0.5) * 70,
                    vy: (rand() - 0.5) * 70
                });
            }

            carriers.length = k;
        }

        function update() {

            const N = state.amt * 5e17;

            out(root, "carr", state.amt === 0 ? "almost none" : sci(N) + " per cm³");
            out(root, "gain", state.amt === 0 ? "1× (pure)" : sci(N / 1e10) + "×");
            setVal(root, "amt", state.amt);

            const chip = root.querySelector('[data-out="chip"]');

            if (state.amt === 0) {

                out(root, "verdict", "Pure silicon barely conducts");
                chip.textContent = "no free carriers";
                chip.className = "fd-chip gold";

            } else if (state.type === "n") {

                out(root, "verdict", "Each phosphorus atom frees an electron");
                chip.textContent = "n-type: electrons carry the current";
                chip.className = "fd-chip";

            } else {

                out(root, "verdict", "Each boron atom leaves a mobile hole");
                chip.textContent = "p-type: holes carry the current";
                chip.className = "fd-chip rose";
            }

            if (state.amt > 0) {

                seen[state.type] = true;

                if (seen.n && seen.p) {
                    F.reward("chip-doping-both", 10, "You tried both n-type and p-type");
                }
            }

            syncCarriers();

            const inp = root.querySelector('input[data-key="amt"]');

            if (inp && document.activeElement !== inp) {
                inp.value = state.amt;
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 360);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 360);

            const k = shown();
            const isDopant = {};

            for (let i = 0; i < k; i++) { isDopant[order[i]] = true; }

            const n = state.type === "n";

            for (let r = 0; r < ROWS; r++) {

                for (let c = 0; c < COLS; c++) {

                    const idx = r * COLS + c;
                    const x = GX + c * SP;
                    const y = GY + r * SP;

                    if (isDopant[idx]) {

                        ctx.fillStyle = n ? "rgba(255,214,102,.95)" : "rgba(255,105,120,.95)";
                        ctx.beginPath();
                        ctx.arc(x, y, 8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "rgba(6,10,24,.95)";
                        ctx.font = "bold 10px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText(n ? "P" : "B", x, y + 3.5);

                    } else {

                        ctx.fillStyle = "rgba(170,179,207,.5)";
                        ctx.beginPath();
                        ctx.arc(x, y, 4.4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            carriers.forEach(function (cr) {

                if (n) {

                    ctx.fillStyle = "rgba(84,224,199,1)";
                    ctx.beginPath();
                    ctx.arc(cr.x, cr.y, 3.8, 0, Math.PI * 2);
                    ctx.fill();

                } else {

                    ctx.strokeStyle = "rgba(255,255,255,1)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(cr.x, cr.y, 4.6, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.fillText("grey: silicon atoms", GX, 330);

            ctx.fillStyle = n ? "rgba(255,214,102,.95)" : "rgba(255,105,120,.95)";
            ctx.fillText(n ? "P: phosphorus dopant" : "B: boron dopant", GX + 150, 330);

            ctx.fillStyle = n ? "rgba(84,224,199,1)" : "rgba(255,255,255,1)";
            ctx.fillText(n ? "● free electron" : "○ mobile hole", GX + 320, 330);
        }

        function frame(dt) {

            carriers.forEach(function (cr) {

                cr.vx += (rand() - 0.5) * 220 * dt;
                cr.vy += (rand() - 0.5) * 220 * dt;
                cr.vx = clamp(cr.vx, -70, 70);
                cr.vy = clamp(cr.vy, -70, 70);
                cr.x += cr.vx * dt;
                cr.y += cr.vy * dt;

                if (cr.x < GX - 6 || cr.x > GX + (COLS - 1) * SP + 6) { cr.vx *= -1; cr.x = clamp(cr.x, GX - 6, GX + (COLS - 1) * SP + 6); }
                if (cr.y < GY - 6 || cr.y > GY + (ROWS - 1) * SP + 6) { cr.vy *= -1; cr.y = clamp(cr.y, GY - 6, GY + (ROWS - 1) * SP + 6); }
            });

            draw();
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        animate(root, frame);

        update();
        draw();
    };


    /* ======================================
       UNIT 19: THE P-N JUNCTION
    ====================================== */

    SIMS["chip-pn"] = function (root) {

        const defaults = { v: 0 };
        const state = { v: 0 };

        root.innerHTML =
            head("Try it: bias a p-n junction") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="360" role="img" aria-label="A p-type region on the left and an n-type region on the right with a depletion region between them that widens under reverse bias and shrinks under forward bias, letting carriers cross"></canvas>' +
            '<div class="fd-stat-row">' + stat("Depletion region", "dep") + stat("Current", "cur") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            seg("Quick settings", "v", [["-2", "Reverse"], ["0", "No bias"], ["0.7", "Forward"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Voltage across the junction (V)", key: "v", min: -3, max: 0.8, step: 0.05, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">A p-n junction blocks current one way and passes it the other: a one-way valve built into the crystal.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const X0 = 60;
        const X1 = 620;
        const XJ = 340;
        const YT = 70;
        const YB = 250;

        const rand = mulberry(3);
        const els = [];
        const holes = [];

        for (let i = 0; i < 34; i++) {

            els.push({ x: XJ + 20 + rand() * (X1 - XJ - 30), y: YT + 10 + rand() * (YB - YT - 20) });
            holes.push({ x: X0 + 10 + rand() * (XJ - X0 - 30), y: YT + 10 + rand() * (YB - YT - 20) });
        }

        function depW() {

            return 100 * Math.sqrt(clamp((0.7 - state.v) / 0.7, 0.04, 6));
        }

        function current() {

            return 1e-12 * (Math.exp(state.v / 0.039) - 1);
        }

        function fmtI(i) {

            const a = Math.abs(i);

            if (state.v < 0) { return "−1 pA (leakage)"; }
            if (a < 1e-9) { return (a * 1e12).toFixed(a < 1e-11 ? 1 : 0) + " pA"; }
            if (a < 1e-6) { return (a * 1e9).toFixed(0) + " nA"; }
            if (a < 1e-3) { return (a * 1e6).toFixed(0) + " µA"; }

            return (a * 1e3).toFixed(1) + " mA";
        }

        function update() {

            out(root, "dep", Math.round(depW() * 2) + " nm");
            out(root, "cur", state.v === 0 ? "0" : fmtI(current()));
            setVal(root, "v", state.v.toFixed(2) + " V");

            const chip = root.querySelector('[data-out="chip"]');
            const v = state.v;

            if (v < -0.01) {

                out(root, "verdict", "Reverse bias: the depletion region widens");
                chip.textContent = "✕ Blocks current";
                chip.className = "fd-chip rose";

            } else if (v < 0.01) {

                out(root, "verdict", "No bias: carriers balance out");
                chip.textContent = "no current";
                chip.className = "fd-chip gold";

            } else if (v < 0.45) {

                out(root, "verdict", "Forward bias, but the barrier is still high");
                chip.textContent = "almost no current";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Forward bias: carriers pour across");
                chip.textContent = "✓ Conducts";
                chip.className = "fd-chip";

                F.reward("chip-pn-forward", 10, "You turned the junction on");
            }

            if (v < -1.5) {
                F.reward("chip-pn-reverse", 5, "You saw the depletion region widen");
            }

            const inp = root.querySelector('input[data-key="v"]');

            if (inp && document.activeElement !== inp) {
                inp.value = state.v;
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 360);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 360);

            const hw = depW() / 2;

            ctx.fillStyle = "rgba(255,105,120,.16)";
            ctx.fillRect(X0, YT, XJ - X0, YB - YT);
            ctx.fillStyle = "rgba(84,224,199,.16)";
            ctx.fillRect(XJ, YT, X1 - XJ, YB - YT);

            // depletion region
            ctx.fillStyle = "rgba(255,214,102,.22)";
            ctx.fillRect(XJ - hw, YT, hw * 2, YB - YT);
            ctx.strokeStyle = "rgba(255,214,102,.8)";
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(XJ - hw, YT, hw * 2, YB - YT);
            ctx.setLineDash([]);

            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(255,105,120,.95)";
            ctx.fillText("p-type (holes)", (X0 + XJ - hw) / 2, YT - 10);
            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.fillText("n-type (electrons)", (X1 + XJ + hw) / 2, YT - 10);
            ctx.fillStyle = "rgba(255,214,102,.95)";
            ctx.font = "12px sans-serif";
            ctx.fillText("depletion region", XJ, YB + 18);
            ctx.fillText("(almost no free carriers)", XJ, YB + 33);

            // carriers
            ctx.fillStyle = "rgba(84,224,199,1)";

            els.forEach(function (p) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3.6, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.strokeStyle = "rgba(255,255,255,1)";
            ctx.lineWidth = 1.8;

            holes.forEach(function (p) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2);
                ctx.stroke();
            });

            // applied voltage
            ctx.font = "bold 15px sans-serif";
            ctx.fillStyle = "rgba(245,247,255,.95)";

            if (state.v > 0.01) {
                ctx.fillText("+", X0 - 22, (YT + YB) / 2 + 5);
                ctx.fillText("−", X1 + 22, (YT + YB) / 2 + 5);
            } else if (state.v < -0.01) {
                ctx.fillText("−", X0 - 22, (YT + YB) / 2 + 5);
                ctx.fillText("+", X1 + 22, (YT + YB) / 2 + 5);
            }

            // current meter, log scale from 1 pA to 10 mA
            const I = Math.max(1e-12, current());
            const lvl = clamp(Math.log10(I / 1e-12) / 10, 0.02, 1);

            ctx.fillStyle = "rgba(170,179,207,.25)";
            ctx.fillRect(X0, 312, X1 - X0, 14);
            ctx.fillStyle = "rgba(84,224,199,.9)";
            ctx.fillRect(X0, 312, (X1 - X0) * lvl, 14);
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("current (1 pA to 10 mA, log scale)", X0, 346);
        }

        function frame(dt) {

            const forward = state.v >= 0.45;
            const hw = depW() / 2;
            const flow = 40 + (state.v - 0.45) * 500;

            els.forEach(function (p) {

                p.y = clamp(p.y + (rand() - 0.5) * 60 * dt, YT + 6, YB - 6);

                if (forward) {

                    p.x -= flow * dt;

                    if (p.x < X0 - 5) {
                        p.x = X1 - 4;
                        p.y = YT + 10 + rand() * (YB - YT - 20);
                    }

                } else {

                    p.x += (rand() - 0.5) * 60 * dt;
                    p.x = clamp(p.x, XJ + hw + 5, X1 - 5);
                }
            });

            holes.forEach(function (p) {

                p.y = clamp(p.y + (rand() - 0.5) * 60 * dt, YT + 6, YB - 6);

                if (forward) {

                    p.x += flow * dt;

                    if (p.x > X1 + 5) {
                        p.x = X0 + 4;
                        p.y = YT + 10 + rand() * (YB - YT - 20);
                    }

                } else {

                    p.x += (rand() - 0.5) * 60 * dt;
                    p.x = clamp(p.x, X0 + 5, XJ - hw - 5);
                }
            });

            draw();
        }

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        const anim = animate(root, frame);

        bindPause(root, anim);

        update();
        draw();
    };


    /* ======================================
       UNIT 22: THE ANNEAL TRADE-OFF
    ====================================== */

    SIMS["chip-anneal"] = function (root) {

        const defaults = { temp: 1050, logt: 0 };
        const state = { temp: 1050, logt: 0 };

        const presets = [
            { name: "Furnace", temp: 900, logt: Math.log10(1800) },
            { name: "Spike", temp: 1050, logt: 0 },
            { name: "Flash", temp: 1350, logt: Math.log10(0.003) },
            { name: "Too cool", temp: 700, logt: 0 }
        ];

        root.innerHTML =
            head("Try it: repair and activate, but do not spread") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="360" role="img" aria-label="Left: the dopant depth profile before and after the anneal, with the active part shaded. Right: a chart of activation against how far the dopant spreads, with presets marked"></canvas>' +
            '<div class="fd-stat-row">' + stat("Dopant activated", "act") + stat("Dopant spreads by", "spr") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-seg"><span class="fd-seg-label">Presets</span>' +
            presets.map(function (p, i) { return '<button type="button" class="fd-sim-btn" data-preset="' + i + '">' + p.name + "</button>"; }).join("") +
            "</div>" +
            '<div class="fd-sim-controls">' +
            slider({ label: "Peak temperature (°C)", key: "temp", min: 600, max: 1400, step: 25, value: 1050 }) +
            slider({ label: "Time at temperature (log scale)", key: "logt", min: -3, max: 3.5, step: 0.1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Heat repairs the crystal and activates the dopant, but it also lets the dopant diffuse. High temperature for a very short time gets the first without the second.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function model(temp, logt) {

            const kT = 8.617e-5 * (temp + 273.15);
            const t = Math.pow(10, logt);
            const D = 0.76 * Math.exp(-3.46 / kT);
            const spread = Math.sqrt(2 * D * t) * 1e7;
            const ka = 1e13 * Math.exp(-3.3 / kT);
            const act = 1 - Math.exp(-ka * t);

            return { t: t, spread: spread, act: act };
        }

        const SX0 = 410;
        const SX1 = 650;
        const SY0 = 40;
        const SY1 = 290;

        function sx(spread) { return SX0 + clamp(spread / 30, 0, 1) * (SX1 - SX0); }
        function sy(act) { return SY1 - clamp(act, 0, 1) * (SY1 - SY0); }

        function update() {

            const m = model(state.temp, state.logt);

            out(root, "act", Math.round(m.act * 100) + "%");
            out(root, "spr", (m.spread < 10 ? m.spread.toFixed(1) : Math.round(m.spread)) + " nm");
            setVal(root, "temp", state.temp + " °C");
            setVal(root, "logt", fmtTime(m.t));

            const chip = root.querySelector('[data-out="chip"]');

            if (m.act >= 0.8 && m.spread <= 6) {

                out(root, "verdict", "Active and still sharp");
                chip.textContent = "✓ Good anneal";
                chip.className = "fd-chip";
                F.reward("chip-anneal-good", 10, "You found a good anneal");

            } else if (m.act < 0.6) {

                out(root, "verdict", "Most dopant is still inactive");
                chip.textContent = "✕ Not enough heat";
                chip.className = "fd-chip rose";

            } else if (m.spread > 12) {

                out(root, "verdict", "Activated, but the dopant has spread");
                chip.textContent = "✕ Too much diffusion";
                chip.className = "fd-chip rose";

            } else {

                out(root, "verdict", "Partly active, a little spread");
                chip.textContent = "⚠ Trade-off";
                chip.className = "fd-chip gold";
            }

            ["temp", "logt"].forEach(function (k) {

                const inp = root.querySelector('input[data-key="' + k + '"]');

                if (inp && document.activeElement !== inp) {
                    inp.value = state[k];
                }
            });

            draw(m);
        }

        function draw(m) {

            ctx.clearRect(0, 0, 680, 360);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 360);

            // profile chart
            const px0 = 40;
            const px1 = 360;
            const py0 = 40;
            const py1 = 290;
            const sig0 = 9;
            const sig1 = Math.sqrt(sig0 * sig0 + m.spread * m.spread);
            const Rp = 28;

            function X(depth) { return px0 + depth / 80 * (px1 - px0); }
            function Y(c) { return py1 - c * (py1 - py0 - 10); }

            ctx.strokeStyle = "rgba(170,179,207,.6)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px0, py0);
            ctx.lineTo(px0, py1);
            ctx.lineTo(px1, py1);
            ctx.stroke();

            // inactive (full) profile
            ctx.fillStyle = "rgba(170,179,207,.35)";
            ctx.beginPath();
            ctx.moveTo(X(0), py1);

            for (let d = 0; d <= 80; d += 1) {
                ctx.lineTo(X(d), Y((sig0 / sig1) * Math.exp(-Math.pow(d - Rp, 2) / (2 * sig1 * sig1))));
            }

            ctx.lineTo(X(80), py1);
            ctx.closePath();
            ctx.fill();

            // active part
            ctx.fillStyle = "rgba(84,224,199,.75)";
            ctx.beginPath();
            ctx.moveTo(X(0), py1);

            for (let d = 0; d <= 80; d += 1) {
                ctx.lineTo(X(d), Y(m.act * (sig0 / sig1) * Math.exp(-Math.pow(d - Rp, 2) / (2 * sig1 * sig1))));
            }

            ctx.lineTo(X(80), py1);
            ctx.closePath();
            ctx.fill();

            // original profile
            ctx.strokeStyle = "rgba(255,214,102,.95)";
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.6;
            ctx.beginPath();

            for (let d = 0; d <= 80; d += 1) {

                const y = Y(Math.exp(-Math.pow(d - Rp, 2) / (2 * sig0 * sig0)));

                if (d === 0) { ctx.moveTo(X(d), y); } else { ctx.lineTo(X(d), y); }
            }

            ctx.stroke();
            ctx.setLineDash([]);

            ctx.font = "12px sans-serif";
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.textAlign = "left";
            ctx.fillText("dopant concentration", px0, py0 - 14);
            ctx.textAlign = "center";
            ctx.fillText("depth into the silicon (nm)", (px0 + px1) / 2, py1 + 22);
            ctx.fillStyle = "rgba(255,214,102,.95)";
            ctx.fillText("- - right after implant", px0 + 190, py0 + 20);
            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.fillText("■ active", px0 + 232, py0 + 38);
            ctx.fillStyle = "rgba(170,179,207,.9)";
            ctx.fillText("■ inactive", px0 + 238, py0 + 56);

            // scatter chart
            ctx.strokeStyle = "rgba(170,179,207,.6)";
            ctx.beginPath();
            ctx.moveTo(SX0, SY0);
            ctx.lineTo(SX0, SY1);
            ctx.lineTo(SX1, SY1);
            ctx.stroke();

            ctx.fillStyle = "rgba(84,224,199,.12)";
            ctx.fillRect(SX0, SY0, sx(6) - SX0, sy(0.8) - SY0);

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.textAlign = "center";
            ctx.fillText("how far the dopant spreads (nm)", (SX0 + SX1) / 2, SY1 + 22);
            ctx.fillText("0", SX0, SY1 + 12);
            ctx.fillText("30", SX1, SY1 + 12);
            ctx.textAlign = "left";
            ctx.fillText("activation", SX0 - 6, SY0 - 14);
            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.fillText("◀ goal zone", sx(6) + 6, SY0 + 14);

            presets.forEach(function (p) {

                const pm = model(p.temp, p.logt);

                ctx.fillStyle = "rgba(170,179,207,.9)";
                ctx.beginPath();
                ctx.arc(sx(pm.spread), sy(pm.act), 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.textAlign = sx(pm.spread) > SX1 - 50 ? "right" : "left";
                ctx.fillText(p.name, sx(pm.spread) + (ctx.textAlign === "left" ? 8 : -8), sy(pm.act) + 4);
            });

            ctx.fillStyle = "rgba(255,214,102,1)";
            ctx.beginPath();
            ctx.arc(sx(m.spread), sy(m.act), 7, 0, Math.PI * 2);
            ctx.fill();
        }

        root.querySelectorAll("button[data-preset]").forEach(function (b) {

            b.addEventListener("click", function () {

                const p = presets[parseInt(b.dataset.preset, 10)];

                state.temp = p.temp;
                state.logt = Math.round(p.logt * 10) / 10;

                update();
            });
        });

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 26: SELF-ALIGNED SILICIDE
    ====================================== */

    SIMS["chip-silicide"] = function (root) {

        const steps = [
            { t: "1 · Transistor ready", text: "Source, drain, and gate silicon are exposed. Oxide covers everything else." },
            { t: "2 · Deposit metal", text: "A thin metal film, often titanium, cobalt, or nickel, coats the whole wafer." },
            { t: "3 · Heat to react", text: "The metal reacts only where it touches silicon, forming a low-resistance silicide. On oxide, nothing reacts." },
            { t: "4 · Etch the leftover metal", text: "A selective etch removes the unreacted metal and leaves silicide on the source, drain, and gate." }
        ];

        const defaults = { contact: "bare", n: 1000 };
        const state = { contact: "bare", n: 1000, step: 0, playing: true, t: 0, seen: false };

        root.innerHTML =
            head("Watch it: silicide forms only on silicon") +
            art("0 0 340 200", "A transistor cross-section where a metal film is deposited, heated so it reacts only with exposed silicon, and then the unreacted metal is etched away") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-play>⏸ Pause</button>' +
            steps.map(function (s, i) { return '<button type="button" class="fd-sim-btn" data-stepbtn="' + i + '">' + (i + 1) + "</button>"; }).join("") +
            "</div>" +
            '<div class="fd-stat-row">' + stat("Resistance per contact", "res") + stat("Power lost in contacts", "pow") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            seg("Contact made on", "contact", [["bare", "Bare silicon"], ["sil", "Silicide"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Contacts on the chip (millions)", key: "n", min: 100, max: 5000, step: 100, value: 1000 }) +
            "</div>" +
            '<p class="fd-sim-formula">Power lost = contacts × (current)² × resistance. Here each contact carries an average of 2 µA. A small loss multiplied by billions becomes real heat.</p>';

        const svg = root.querySelector("svg");
        const playBtn = root.querySelector("[data-play]");

        function draw(p) {

            const step = state.step;
            let s = rect(20, 120, 300, 55, COL.si);

            s += rect(20, 108, 35, 67, COL.ox) + rect(285, 108, 35, 67, COL.ox);
            s += rect(55, 120, 85, 12, COL.nplus) + rect(200, 120, 85, 12, COL.nplus);
            s += rect(140, 115, 60, 5, COL.ox) + rect(150, 88, 40, 27, COL.poly);
            s += rect(140, 100, 10, 20, COL.ox) + rect(190, 100, 10, 20, COL.ox);

            // metal over oxide stays until the etch
            const overOxide = [
                [[20, 108], [55, 108], [55, 120]],
                [[285, 120], [285, 108], [320, 108]],
                [[140, 120], [140, 100], [150, 100], [150, 88]],
                [[190, 88], [190, 100], [200, 100], [200, 120]]
            ];

            const overSi = [[[55, 120], [140, 120]], [[150, 88], [190, 88]], [[200, 120], [285, 120]]];

            if (step >= 1 && step <= 2) {

                overOxide.forEach(function (l) { s += pline(l, COL.metal, 4); });
            }

            if (step === 1) {

                overSi.forEach(function (l) { s += pline(l, COL.metal, 4); });
            }

            if (step === 2) {

                overSi.forEach(function (l) {
                    s += pline(l, COL.metal, Math.max(0.4, 4 * (1 - p)));
                });
            }

            if (step >= 2) {

                const h = step === 2 ? 8 * p : 8;

                s += rect(55, 120, 85, h, COL.silicide) + rect(200, 120, 85, h, COL.silicide) + rect(150, 88, 40, h, COL.silicide);
            }

            s += label(97, 152, "source", 7, "middle", "var(--muted)") + label(243, 152, "drain", 7, "middle", "var(--muted)");
            s += label(170, 80, "gate (polysilicon)", 7, "middle", "var(--muted)");

            if (step === 2) {
                s += label(170, 60, "metal reacts with silicon, not with oxide", 7, "middle", "rgba(255,214,102,.95)");
            }

            if (step === 3) {
                s += label(170, 60, "self-aligned: no mask needed", 7, "middle", "rgba(84,224,199,.95)");
            }

            svg.innerHTML = s + legend([["silicon", COL.si], ["oxide", COL.ox], ["metal", COL.metal], ["silicide", COL.silicide]], 194);
        }

        function updateMeter() {

            const bare = state.contact === "bare";
            const R = bare ? 1000 : 50;
            const W = state.n * 1e6 * Math.pow(2e-6, 2) * R;

            out(root, "res", R + " Ω");
            out(root, "pow", W >= 10 ? Math.round(W) + " W" : (W >= 1 ? W.toFixed(1) : W.toFixed(2)) + " W");
            setVal(root, "n", state.n.toLocaleString() + " million");

            const chip = root.querySelector('[data-out="chip"]');

            if (bare) {

                out(root, "verdict", "Too much resistance: wasted heat");
                chip.textContent = "✕ Bare silicon";
                chip.className = "fd-chip rose";

            } else {

                out(root, "verdict", "Low resistance, little heat");
                chip.textContent = "✓ Silicide";
                chip.className = "fd-chip";

                F.reward("chip-silicide-compare", 10, "You saw what silicide saves");
            }
        }

        function render() {

            out(root, "title", steps[state.step].t);
            out(root, "text", steps[state.step].text);

            root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {
                b.classList.toggle("on", parseInt(b.dataset.stepbtn, 10) === state.step);
            });

            draw(state.step === 2 ? clamp(state.t / 1.6, 0, 1) : (state.step > 2 ? 1 : 0));
        }

        animate(root, function (dt) {

            if (state.step === 2 && state.t < 1.7) {

                state.t += dt;
                draw(clamp(state.t / 1.6, 0, 1));
            }

            if (!state.playing) {
                return;
            }

            state.auto = (state.auto || 0) + dt;

            if (state.auto > 2.8) {

                state.auto = 0;
                state.step = (state.step + 1) % 4;
                state.t = 0;

                render();
            }
        });

        playBtn.addEventListener("click", function () {

            state.playing = !state.playing;
            playBtn.textContent = state.playing ? "⏸ Pause" : "▶ Play";
        });

        root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.playing = false;
                playBtn.textContent = "▶ Play";
                state.step = parseInt(b.dataset.stepbtn, 10);
                state.t = 0;

                render();
            });
        });

        wire(root, state, defaults, updateMeter);

        updateMeter();
        render();
    };


    /* ======================================
       UNIT 27: WIRE DELAY BY LAYER
    ====================================== */

    const TIERS = [
        { id: "local", name: "Local (thin)", r: 400, color: "rgba(255,105,120,.85)" },
        { id: "mid", name: "Intermediate", r: 25, color: "rgba(255,214,102,.85)" },
        { id: "global", name: "Global (thick)", r: 4, color: "rgba(84,224,199,.85)" }
    ];

    // Elmore delay of a distributed wire in ps: 0.38 · R' · C' · L², with R' in Ω/µm and C' in fF/µm.
    function wireDelay(r, c, lengthUm) {

        return 0.38 * r * c * lengthUm * lengthUm * 1e-3;
    }

    function fmtPs(ps) {

        if (ps < 1) { return ps.toFixed(2) + " ps"; }
        if (ps < 1000) { return Math.round(ps) + " ps"; }
        if (ps < 1e6) { return (ps / 1000).toFixed(ps < 1e4 ? 1 : 0) + " ns"; }

        return (ps / 1e6).toFixed(1) + " µs";
    }

    SIMS["chip-rcdelay"] = function (root) {

        const BUDGET = 500;
        const defaults = { logl: 2, k: 3 };
        const state = { logl: 2, k: 3 };

        root.innerHTML =
            head("Try it: which layer should carry this wire?") +
            art("0 0 340 190", "Bars showing signal delay on a thin local layer, an intermediate layer, and a thick global layer for the chosen wire length; bars inside the 500 picosecond budget are green") +
            '<div class="fd-stat-row">' + stat("Wire length", "len") + stat("Insulator constant k", "kv") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Wire length (log scale)", key: "logl", min: 0, max: 4, step: 0.1, value: 2 }) +
            slider({ label: "Insulator constant k (oxide is 4.0)", key: "k", min: 2, max: 4.2, step: 0.1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">Delay grows as resistance × capacitance × length². A thicker wire cuts resistance, and a low-k insulator cuts capacitance. The signal must arrive within a 500 ps slice of the clock.</p>';

        const svg = root.querySelector("svg");

        function lengthUm() { return Math.pow(10, state.logl); }

        function fmtLen(um) {

            return um < 1000 ? (um < 10 ? um.toFixed(1) : Math.round(um)) + " µm" : (um / 1000).toFixed(um < 10000 ? 1 : 0) + " mm";
        }

        function update() {

            const L = lengthUm();
            const c = 0.2 * state.k / 3;
            const x0 = 90;
            const x1 = 320;

            function X(ps) {

                return x0 + (clamp(Math.log10(ps), -1, 6) + 1) / 7 * (x1 - x0);
            }

            let s = "";
            let best = null;

            TIERS.forEach(function (t, i) {

                const d = wireDelay(t.r, c, L);
                const ok = d <= BUDGET;
                const y = 34 + i * 38;

                if (ok && !best) { best = t; }

                s += label(x0 - 6, y + 12, t.name, 7, "end", "var(--text)");
                s += rect(x0, y, Math.max(2, X(d) - x0), 20, ok ? "rgba(84,224,199,.7)" : "rgba(255,105,120,.55)", ok ? "rgba(84,224,199,1)" : "rgba(255,105,120,1)");
                s += label(Math.min(X(d) + 4, x1 - 2), y + 13, fmtPs(d), 7, X(d) > x1 - 40 ? "end" : "start", X(d) > x1 - 40 ? "var(--text)" : "var(--text)");
            });

            const bx = X(BUDGET);

            s += '<line x1="' + bx + '" y1="22" x2="' + bx + '" y2="152" style="stroke:rgba(255,214,102,.95);stroke-dasharray:3 3;stroke-width:1.4"/>';
            s += label(bx, 16, "500 ps budget", 7, "middle", "rgba(255,214,102,.95)");
            s += label(x0, 170, "0.1 ps", 6.5, "middle", "var(--muted)") + label(x1, 170, "1 µs", 6.5, "middle", "var(--muted)");
            s += label((x0 + x1) / 2, 182, "signal delay (log scale)", 7, "middle", "var(--muted)");

            svg.innerHTML = s;

            out(root, "len", fmtLen(L));
            out(root, "kv", state.k.toFixed(1));
            setVal(root, "logl", fmtLen(L));
            setVal(root, "k", state.k.toFixed(1));

            const chip = root.querySelector('[data-out="chip"]');

            if (best) {

                out(root, "verdict", "Thinnest layer that is fast enough: " + best.name.toLowerCase());
                chip.textContent = best.id === "local" ? "✓ Dense and fast" : "✓ Needs a thicker layer";
                chip.className = "fd-chip";

                if (best.id === "global") {
                    F.reward("chip-rc-global", 5, "You found a wire that needs the top layers");
                }

            } else {

                out(root, "verdict", "Even the thickest layer is too slow");
                chip.textContent = "✕ Needs repeaters";
                chip.className = "fd-chip rose";
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 27: ROUTING GAME
    ====================================== */

    SIMS["chip-route"] = function (root) {

        const sigs = [
            { name: "Neighbor gate", len: 3 },
            { name: "Next flip-flop", len: 20 },
            { name: "Across a small block", len: 100 },
            { name: "Memory to core", len: 400 },
            { name: "Power to a big block", len: 600 },
            { name: "Clock to the far corner", len: 1200 }
        ];

        const CAP = { local: 6, mid: 3, global: 2 };
        const BUDGET = 500;
        const state = { pick: sigs.map(function () { return "local"; }), checked: false };

        function fmtLen(um) { return um < 1000 ? um + " µm" : (um / 1000).toFixed(1) + " mm"; }

        root.innerHTML =
            head("Game: route every signal") +
            '<div class="fd-stat-row">' + stat("Intermediate tracks used", "mid") + stat("Global tracks used", "glob") + "</div>" +
            '<p class="fd-sim-note">Pick a metal layer for each signal. Each one must arrive within 500 ps. Thick layers are fast but only a few tracks are free.</p>' +
            '<div class="fd-route" data-rows></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-check>Check my routing</button></div>' +
            '<p class="fd-sim-note" data-out="fb"></p>';

        const style = document.getElementById("fabChipRouteStyles");

        if (!style) {

            const el = document.createElement("style");

            el.id = "fabChipRouteStyles";
            el.textContent = `
.fd-route { display: grid; gap: 8px; margin: 8px 0 12px; }
.fd-route-row { display: grid; grid-template-columns: 1fr auto; gap: 6px 10px; align-items: center; padding: 8px 10px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,.04); }
.fd-route-row b { display: block; }
.fd-route-row small { color: var(--muted); }
.fd-route-row.bad { border-color: #ff6978; }
.fd-route-row.good { border-color: var(--accent); }
.fd-route-tiers { display: flex; gap: 4px; flex-wrap: wrap; }
.fd-route-tiers button { padding: 6px 10px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,.05); color: var(--text); font: inherit; font-size: .85rem; cursor: pointer; }
.fd-route-tiers button.on { border-color: var(--accent); background: rgba(84,224,199,.22); font-weight: 700; }
@media (max-width: 520px) { .fd-route-row { grid-template-columns: 1fr; } }
`;
            document.head.appendChild(el);
        }

        const rows = root.querySelector("[data-rows]");

        function used(tier) {

            return state.pick.filter(function (p) { return p === tier; }).length;
        }

        function render(results) {

            rows.innerHTML = sigs.map(function (s, i) {

                const cls = results ? (results[i] ? "good" : "bad") : "";

                return '<div class="fd-route-row ' + cls + '"><div><b>' + s.name + "</b><small>" + fmtLen(s.len) + " long</small></div>" +
                    '<div class="fd-route-tiers">' +
                    TIERS.map(function (t) {
                        return '<button type="button" data-i="' + i + '" data-tier="' + t.id + '" class="' + (state.pick[i] === t.id ? "on" : "") + '">' + t.name + "</button>";
                    }).join("") + "</div></div>";
            }).join("");

            out(root, "mid", used("mid") + " of " + CAP.mid);
            out(root, "glob", used("global") + " of " + CAP.global);

            rows.querySelectorAll("button[data-tier]").forEach(function (b) {

                b.addEventListener("click", function () {

                    state.pick[parseInt(b.dataset.i, 10)] = b.dataset.tier;
                    out(root, "fb", "");
                    render();
                });
            });
        }

        function check() {

            const results = [];
            const lines = [];

            sigs.forEach(function (s, i) {

                const tier = TIERS.filter(function (t) { return t.id === state.pick[i]; })[0];
                const d = wireDelay(tier.r, 0.2, s.len);
                const ok = d <= BUDGET;

                results.push(ok);

                if (!ok) {
                    lines.push(s.name + " takes " + fmtPs(d) + " on the " + tier.name.toLowerCase() + " layer, which is too slow.");
                }
            });

            const over = [];

            ["mid", "global"].forEach(function (id) {

                if (used(id) > CAP[id]) { over.push(id === "mid" ? "intermediate" : "global"); }
            });

            if (over.length) {
                lines.push("Too many signals on the " + over.join(" and ") + " layers: there are not enough free tracks.");
            }

            render(results);

            if (!lines.length) {

                out(root, "fb", "✅ Everything arrives on time, and every track is available. Short wires stay thin and local, and only the long ones use the thick layers.");
                F.reward("chip-route-solved", 15, "You routed every signal");

            } else {

                out(root, "fb", "❌ " + lines.join(" "));
            }
        }

        root.querySelector("[data-check]").addEventListener("click", check);

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.pick = sigs.map(function () { return "local"; });
            out(root, "fb", "");
            render();
        });

        render();
    };


    /* ======================================
       UNIT 29: DESIGN RULE CHECK
    ====================================== */

    SIMS["chip-drc"] = function (root) {

        const defaults = { node: 40, view: "layout", w: 28, s: 28 };
        const state = { node: 40, view: "layout", w: 28, s: 28 };

        root.innerHTML =
            head("Try it: run a design rule check") +
            art("0 0 340 210", "Three parallel wires from a layout. In the layout view, wires or gaps that break the rule are marked red. In the print view, narrow gaps bridge and narrow wires break") +
            '<div class="fd-stat-row">' + stat("Wire width", "w") + stat("Spacing", "s") + stat("Rule: at least", "rule") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            seg("Fab rules", "node", [["40", "Older process (40 nm)"], ["20", "Advanced process (20 nm)"]]) +
            seg("View", "view", [["layout", "Layout"], ["print", "What prints"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Wire width (nm)", key: "w", min: 10, max: 50, step: 1, value: 28 }) +
            slider({ label: "Spacing (nm)", key: "s", min: 10, max: 50, step: 1, value: 28 }) +
            "</div>" +
            '<p class="fd-sim-formula">Design rules turn the fab\'s real limits, minimum width and minimum spacing, into checks the layout must pass before anything goes to a mask.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const w = state.w;
            const sp = state.s;
            const rule = state.node;
            const badW = w < rule;
            const badS = sp < rule;
            const sc = 1.15;
            const total = (3 * w + 2 * sp) * sc;
            const x0 = (340 - total) / 2;
            const yT = 34;
            const yB = 170;
            const print = state.view === "print";

            let s = "";

            for (let i = 0; i < 3; i++) {

                const x = x0 + i * (w + sp) * sc;
                const ww = w * sc;

                const fill = print ? "rgba(84,224,199,.7)" : (badW ? "rgba(255,105,120,.6)" : "rgba(84,224,199,.55)");
                const stroke = print ? "rgba(84,224,199,1)" : (badW ? "rgba(255,105,120,1)" : "rgba(84,224,199,1)");

                s += rect(x.toFixed(1), yT, ww.toFixed(1), yB - yT, fill, stroke);

                if (print && badW) {

                    [70, 118].forEach(function (y) {
                        s += rect((x - 1).toFixed(1), y, (ww + 2).toFixed(1), 9, "rgba(13,20,41,1)");
                    });
                }

                if (i < 2) {

                    const gx = x + ww;
                    const gw = sp * sc;

                    if (!print && badS) {
                        s += rect(gx.toFixed(1), yT, gw.toFixed(1), yB - yT, "rgba(255,105,120,.28)", "rgba(255,105,120,.9)");
                    }

                    if (print && badS) {

                        [52, 96, 140].forEach(function (y) {
                            s += rect((gx - 1).toFixed(1), y, (gw + 2).toFixed(1), 11, "rgba(255,105,120,.85)");
                        });
                    }
                }
            }

            // dimension markers
            const mx = x0;

            s += '<line x1="' + mx + '" y1="' + (yB + 12) + '" x2="' + (mx + w * sc) + '" y2="' + (yB + 12) + '" style="stroke:rgba(245,247,255,.8)"/>';
            s += label(mx + w * sc / 2, yB + 24, w + " nm", 7);
            s += '<line x1="' + (mx + w * sc) + '" y1="' + (yB + 12) + '" x2="' + (mx + (w + sp) * sc) + '" y2="' + (yB + 12) + '" style="stroke:rgba(255,214,102,.9)"/>';
            s += label(mx + (w + sp / 2) * sc, yB + 24, sp + " nm", 7, "middle", "rgba(255,214,102,.95)");

            if (print && badS) {
                s += label(170, 22, "narrow gaps bridge: a short circuit", 8, "middle", "rgba(255,105,120,1)");
            }

            if (print && badW) {
                s += label(170, 12, "narrow wires break: an open circuit", 8, "middle", "rgba(255,105,120,1)");
            }

            svg.innerHTML = s;

            out(root, "w", w + " nm");
            out(root, "s", sp + " nm");
            out(root, "rule", rule + " nm");
            setVal(root, "w", w + " nm");
            setVal(root, "s", sp + " nm");

            const chip = root.querySelector('[data-out="chip"]');
            const n = (badW ? 1 : 0) + (badS ? 1 : 0);

            if (n === 0) {

                out(root, "verdict", "Passes the design rule check");
                chip.textContent = "✓ 0 violations";
                chip.className = "fd-chip";
                F.reward("chip-drc-clean", 5, "You made a clean layout");

            } else {

                out(root, "verdict", (badW && badS ? "Width and spacing both break the rules" : badW ? "Wires are too narrow" : "Wires are too close"));
                chip.textContent = "✕ " + n + (n === 1 ? " violation" : " violations");
                chip.className = "fd-chip rose";

                if (print) {
                    F.reward("chip-drc-print", 5, "You saw what a violation prints");
                }
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 29: MASK SET COST
    ====================================== */

    SIMS["chip-maskcost"] = function (root) {

        const defaults = { masks: 60, euv: 10, logv: 6 };
        const state = { masks: 60, euv: 10, logv: 6 };

        root.innerHTML =
            head("Try it: what does a mask set cost?") +
            art("0 0 340 130", "A grid of squares, one for each mask in the set, with the expensive EUV masks in gold") +
            '<div class="fd-stat-row">' + stat("Mask set", "set") + stat("Chips made", "vol") + stat("Mask cost per chip", "per") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Number of masks", key: "masks", min: 20, max: 90, step: 1, value: 60 }) +
            slider({ label: "Of those, EUV masks", key: "euv", min: 0, max: 30, step: 1, value: 10 }) +
            slider({ label: "Chips made (log scale)", key: "logv", min: 3, max: 8, step: 0.25, value: 6 }) +
            "</div>" +
            '<p class="fd-sim-formula">Illustrative averages: about $0.3 million per deep-UV mask and $0.5 million per EUV mask. The set is a fixed cost, so the more chips share it, the less each one carries.</p>';

        const svg = root.querySelector("svg");

        function fmtMoney(v) {

            if (v >= 1e6) { return "$" + (v / 1e6).toFixed(1) + " million"; }
            if (v >= 1000) { return "$" + Math.round(v / 1000).toLocaleString() + ",000"; }
            if (v >= 1) { return "$" + v.toFixed(v < 10 ? 2 : 0); }

            return "$" + v.toFixed(2);
        }

        function fmtCount(n) {

            if (n >= 1e6) { return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + " million"; }

            return Math.round(n).toLocaleString();
        }

        function update() {

            const euv = Math.min(state.euv, state.masks);
            const duv = state.masks - euv;
            const total = (duv * 0.3 + euv * 0.5) * 1e6;
            const vol = Math.pow(10, state.logv);
            const per = total / vol;

            let s = "";
            const cols = 15;

            for (let i = 0; i < 90; i++) {

                const c = i % cols;
                const r = Math.floor(i / cols);
                const x = 14 + c * 21.5;
                const y = 8 + r * 19;

                let fill = "rgba(170,179,207,.12)";
                let stroke = "rgba(170,179,207,.25)";

                if (i < euv) {

                    fill = "rgba(255,214,102,.75)";
                    stroke = "rgba(255,214,102,1)";

                } else if (i < state.masks) {

                    fill = "rgba(120,180,255,.6)";
                    stroke = "rgba(120,180,255,.95)";
                }

                s += rect(x, y, 17, 14, fill, stroke);
            }

            svg.innerHTML = s + legend([["deep-UV mask", "rgba(120,180,255,.6)"], ["EUV mask", "rgba(255,214,102,.75)"]], 124);

            out(root, "set", fmtMoney(total));
            out(root, "vol", fmtCount(vol));
            out(root, "per", fmtMoney(per));
            setVal(root, "masks", state.masks);
            setVal(root, "euv", euv);
            setVal(root, "logv", fmtCount(vol));

            const chip = root.querySelector('[data-out="chip"]');

            if (per >= 100) {

                out(root, "verdict", "A prototype run: each chip carries a huge share");
                chip.textContent = "✕ Masks dominate";
                chip.className = "fd-chip rose";

            } else if (per >= 1) {

                out(root, "verdict", "A noticeable share of each chip's price");
                chip.textContent = "⚠ Worth planning for";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Spread thin across millions of chips");
                chip.textContent = "✓ A rounding error";
                chip.className = "fd-chip";
                F.reward("chip-maskcost-volume", 10, "You saw volume pay for the masks");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="chip-"]').forEach(F.mount);

})();
