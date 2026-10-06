/* ========================================
   SAND TO CHIP: DEPOSITION SIMULATORS (UNITS 8 AND 9)

   Animated and interactive pieces for chemical vapor
   deposition (APCVD, LPCVD, PECVD), step coverage,
   evaporation versus sputtering, copper plating, and
   atomic layer deposition. Registers on window.FabInteract
   and is loaded by diagram-sims-chip.js.

   Teaching models: numbers are typical or illustrative.
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
    const art = H.art;
    const stat = H.stat;
    const rectS = H.rectS;
    const circ = H.circ;
    const line = H.line;
    const slider = F.slider;
    const text = F.text;

    const ACCENT = F.colors.accent;
    const GOLD = F.colors.gold;
    const ROSE = F.colors.rose;
    const TEXT = F.colors.text;
    const BLUE = H.BLUE;
    const SIMS = F.SIMS;

    (function injectStyles() {

        if (document.getElementById("fabChipLayerStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "fabChipLayerStyles";

        style.textContent = `
.fd-sim canvas.fd-wide {
    max-width: 600px;
}

.fd-sim .fd-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    align-items: start;
}

.fd-sim .fd-split canvas {
    max-width: 100%;
}

.fd-sim .fd-bar {
    height: 12px;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    background: rgba(255, 255, 255, .08);
    margin: 4px 0 2px;
}

.fd-sim .fd-bar i {
    display: block;
    height: 100%;
}

.fd-sim .fd-bar-legend {
    display: flex;
    justify-content: space-between;
    font-size: .78rem;
    color: var(--muted);
}

.fd-sim .fd-play {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 6px 0;
}

@media (max-width: 600px) {

    .fd-sim .fd-split {
        grid-template-columns: 1fr;
    }
}
`;

        document.head.appendChild(style);

    })();


    /* ---------- helpers ---------- */

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

    // Runs frame(dt) on every animation frame while the sim is on screen.
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
            isPaused: function () { return paused; },
            kick: kick
        };
    }

    function playButtons(label) {

        return '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button>' +
            (label || "") + "</div>";
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

    function waferMap(canvas, kind) {

        const c = canvas.getContext("2d");
        const n = 26;
        const cell = canvas.width / n;
        const rand = mulberry(kind === "ap" ? 5 : kind === "pe" ? 9 : 3);
        const amp = kind === "ap" ? 6 : kind === "pe" ? 4 : 2;

        c.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {

                const x = (i + 0.5) / n * 2 - 1;
                const y = (j + 0.5) / n * 2 - 1;
                const r = Math.hypot(x, y);

                if (r > 0.97) {
                    continue;
                }

                let d;

                if (kind === "lp") {
                    d = (0.25 - r * r * 0.5) * amp * 0.6 + (rand() - 0.5) * amp * 0.5;
                } else if (kind === "pe") {
                    d = (0.5 - r * r) * amp * 0.9 + (rand() - 0.5) * amp * 0.4;
                } else {
                    d = Math.sin(x * 4.2 + 1) * amp * 0.5 + x * amp * 0.4 + (rand() - 0.5) * amp * 0.5;
                }

                d = clamp(d / amp, -1, 1);

                const hue = 220 - (d + 1) * 110;

                c.fillStyle = "hsl(" + hue + ",70%,52%)";
                c.fillRect(i * cell, j * cell, cell + 0.5, cell + 0.5);
            }
        }

        c.beginPath();
        c.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.485, 0, Math.PI * 2);
        c.strokeStyle = "rgba(245,247,255,.7)";
        c.lineWidth = 2;
        c.stroke();
    }


    /* ======================================
       CVD FLAVORS: APCVD vs LPCVD vs PECVD
    ====================================== */

    SIMS["chip-cvd"] = function (root) {

        const info = {
            ap: {
                name: "APCVD", full: "Atmospheric-pressure CVD",
                temp: "a few hundred °C (varies)", pressure: "atmospheric (about 760 torr)",
                wafers: "continuous, on a belt", vari: "about ±6%",
                pros: "Simple and fast.", cons: "The film is less uniform.",
                energy: "heat"
            },
            lp: {
                name: "LPCVD", full: "Low-pressure CVD",
                temp: "600 to 800 °C", pressure: "about 0.1 to 1 torr",
                wafers: "a whole boat at once", vari: "about ±2%",
                pros: "Excellent uniformity, and a whole boat of wafers coats at once.", cons: "Too hot for anything with metal already on it.",
                energy: "heat"
            },
            pe: {
                name: "PECVD", full: "Plasma-enhanced CVD",
                temp: "200 to 400 °C", pressure: "about 0.5 to 5 torr",
                wafers: "usually one wafer at a time", vari: "about ±4%",
                pros: "A plasma supplies the reaction energy, so it runs cool enough for finished metal wiring.", cons: "The film is usually less dense and holds more hydrogen than a hot film.",
                energy: "plasma"
            }
        };

        const defaults = { method: "lp", metal: 0, power: 60 };
        const state = { method: defaults.method, metal: defaults.metal, power: defaults.power };

        root.innerHTML =
            head("Try it: compare the CVD flavors") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="An animated cross-section of a CVD reactor: a heated tube with a boat of wafers for LPCVD, a plasma between two electrodes for PECVD, or a belt of wafers under a gas injector for APCVD"></canvas>' +
            playButtons() +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="name"></div><span class="fd-chip" data-out="verdict"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Method", "method", [["ap", "APCVD"], ["lp", "LPCVD"], ["pe", "PECVD"]]) +
            seg("What is already on the wafer?", "metal", [[0, "Bare silicon and transistors"], [1, "Finished metal wiring"]]) +
            '<div data-powerbox><div class="fd-sim-controls">' +
            slider({ label: "Plasma power", key: "power", min: 0, max: 100, step: 1, value: defaults.power }) +
            "</div></div>" +
            '<div class="fd-stat-row">' + stat("Temperature", "temp") + stat("Pressure", "press") + stat("Wafers per run", "wafers") + "</div>" +
            '<p class="fd-sim-note"><b>Where the reaction energy comes from</b></p>' +
            '<div class="fd-bar"><i data-bar-heat style="background:rgba(255,170,90,.8)"></i><i data-bar-plasma style="background:rgba(255,105,200,.8)"></i></div>' +
            '<div class="fd-bar-legend"><span data-out="heatpct"></span><span data-out="plasmapct"></span></div>' +
            '<div class="fd-split"><div><p class="fd-sim-note"><b>Film thickness across the wafer</b> <span data-out="vari"></span> (illustrative)</p><canvas class="fd-sim-canvas" data-map width="260" height="260" aria-label="A wafer map colored by film thickness: uniform for LPCVD, centre-thick for PECVD, streaky for APCVD"></canvas></div>' +
            '<div><p class="fd-sim-note"><b>The trade</b></p><p class="fd-sim-note" data-out="pros"></p><p class="fd-sim-note" data-out="cons"></p></div></div>' +
            '<p class="fd-sim-formula">Hotter usually means better film quality, but only if everything already on the wafer can survive the heat. What is on the wafer sets the temperature limit, and the limit picks the method.</p>';

        const canvas = root.querySelector("canvas.fd-wide");
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const HT = canvas.height;
        const mapCanvas = root.querySelector("canvas[data-map]");
        const rand = mulberry(21);

        let t = 0;

        // particles
        function mk(n, fx) {

            const a = [];

            for (let i = 0; i < n; i++) {
                a.push(fx(i));
            }

            return a;
        }

        const lpGas = mk(70, function () { return { x: 60 + rand() * 560, y: 100 + rand() * 130, vx: 40 + rand() * 40, vy: (rand() - 0.5) * 30 }; });
        const apGas = mk(120, function () { return { x: 250 + rand() * 180, y: 70 + rand() * 150, vx: (rand() - 0.5) * 20, vy: 50 + rand() * 40 }; });
        const peGas = mk(40, function () { return { x: 230 + rand() * 220, y: 70 + rand() * 140, vx: (rand() - 0.5) * 20, vy: 20 + rand() * 25 }; });
        const peIons = mk(26, function () { return { x: 240 + rand() * 200, y: 90 + rand() * 120, vy: 140 + rand() * 80 }; });
        const peRad = mk(30, function () { return { x: 240 + rand() * 200, y: 170 + rand() * 50, vx: (rand() - 0.5) * 40, vy: (rand() - 0.5) * 40 }; });
        const belt = [0, 1, 2, 3].map(function (i) { return { x: 60 + i * 160, film: 0 }; });

        function drawLP(dt) {

            // heater coils
            for (let x = 70; x <= 610; x += 45) {

                ctx.fillStyle = "rgba(255,120,60,.85)";
                ctx.fillRect(x, 82, 5, 14);
                ctx.fillRect(x, 238, 5, 14);
            }

            ctx.strokeStyle = "rgba(255,170,90,.6)";
            ctx.lineWidth = 2;
            ctx.strokeRect(40, 96, 600, 142);
            ctx.fillStyle = "rgba(255,120,60,.08)";
            ctx.fillRect(40, 96, 600, 142);

            // wafer boat with film
            const thk = (t * 0.2) % 1;

            for (let i = 0; i < 10; i++) {

                const x = 200 + i * 28;

                ctx.fillStyle = "rgba(170,179,207,.7)";
                ctx.fillRect(x, 110, 6, 112);
                ctx.fillStyle = "rgba(84,224,199,.75)";
                ctx.fillRect(x - thk * 4, 110, thk * 4, 112);
                ctx.fillRect(x + 6, 110, thk * 4, 112);
            }

            ctx.fillStyle = "rgba(245,247,255,.5)";
            ctx.fillRect(190, 224, 290, 5);

            // gas
            ctx.fillStyle = "rgba(120,180,255,.85)";

            lpGas.forEach(function (p) {

                p.x += p.vx * dt;
                p.y += p.vy * dt;

                if (p.y < 102 || p.y > 232) { p.vy = -p.vy; }
                if (p.x > 628) { p.x = 46; p.y = 102 + rand() * 128; }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
                ctx.fill();
            });

            label("gas in", 8, 170, "left");
            label("to pump", W - 8, 170, "right");
            arrow(8, 180, 40, 180);
            arrow(W - 40, 180, W - 8, 180);
            label("heated tube, 600 to 800 °C", W / 2, 66, "center");
            label("a boat of wafers", 335, 258, "center");
        }

        function drawPE(dt) {

            const power = state.power / 100;

            ctx.strokeStyle = "rgba(170,179,207,.55)";
            ctx.lineWidth = 2;
            ctx.strokeRect(150, 30, 380, 250);

            // showerhead and chuck
            ctx.fillStyle = "rgba(245,247,255,.5)";
            ctx.fillRect(220, 62, 240, 8);
            ctx.fillStyle = "rgba(10,16,34,.9)";

            for (let x = 228; x < 460; x += 16) {
                ctx.fillRect(x, 63, 5, 6);
            }

            ctx.fillStyle = "rgba(255,170,90,.55)";
            ctx.fillRect(230, 232, 220, 10);
            ctx.fillStyle = "rgba(170,179,207,.75)";
            ctx.fillRect(255, 224, 170, 8);

            // film growing on the wafer
            const thk = (t * 0.25) % 1;

            ctx.fillStyle = "rgba(84,224,199,.85)";
            ctx.fillRect(255, 224 - thk * 6, 170, thk * 6);

            // plasma glow
            const glow = (0.22 + 0.2 * Math.sin(t * 7)) * (0.3 + power * 0.9);
            const g = ctx.createRadialGradient(340, 150, 10, 340, 150, 120);

            g.addColorStop(0, "rgba(255,105,200," + glow.toFixed(3) + ")");
            g.addColorStop(1, "rgba(150,110,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(220, 74, 240, 150);

            // RF label
            label("RF power", 340, 20, "center");
            ctx.strokeStyle = "rgba(255,105,200,.9)";
            ctx.beginPath();
            ctx.moveTo(340, 24);
            ctx.lineTo(340, 62);
            ctx.stroke();

            // neutral gas
            ctx.fillStyle = "rgba(120,180,255,.85)";

            peGas.forEach(function (p) {

                p.x += p.vx * dt;
                p.y += p.vy * dt;

                if (p.y > 216) { p.y = 72; p.x = 230 + rand() * 220; }
                if (p.x < 225 || p.x > 455) { p.vx = -p.vx; }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
                ctx.fill();
            });

            // ions and radicals (more with higher power)
            const nIons = Math.round(peIons.length * power);

            ctx.fillStyle = "rgba(255,255,255,.95)";

            for (let i = 0; i < nIons; i++) {

                const p = peIons[i];

                p.y += p.vy * dt;

                if (p.y > 222) { p.y = 76; p.x = 240 + rand() * 200; }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            const nRad = Math.round(peRad.length * (0.3 + power * 0.7));

            ctx.fillStyle = "rgba(255,214,102,.95)";

            for (let i = 0; i < nRad; i++) {

                const p = peRad[i];

                p.x += p.vx * dt;
                p.y += p.vy * dt;

                if (p.y < 160 || p.y > 218) { p.vy = -p.vy; }
                if (p.x < 232 || p.x > 448) { p.vx = -p.vx; }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }

            label("gas from the showerhead", 340, 56, "center");
            label("hot ions and reactive radicals", 340, 214 - 120, "center");
            label("heated chuck, 200 to 400 °C", 340, 262, "center");
            label("one wafer", 535, 232, "left");
        }

        function drawAP(dt) {

            // injector
            ctx.fillStyle = "rgba(245,247,255,.5)";
            ctx.fillRect(250, 36, 180, 24);
            label("gas injector", 340, 30, "center");

            // belt
            ctx.fillStyle = "rgba(255,170,90,.5)";
            ctx.fillRect(40, 232, 600, 8);

            for (let x = -((t * 40) % 40); x < 640; x += 40) {
                ctx.fillStyle = "rgba(10,16,34,.7)";
                ctx.fillRect(40 + x, 234, 20, 4);
            }

            belt.forEach(function (w) {

                w.x += 38 * dt;

                const under = w.x > 260 && w.x < 420;

                if (under) { w.film = Math.min(1, w.film + dt * 0.35); }

                if (w.x > 650) { w.x = -90; w.film = 0; }

                ctx.fillStyle = "rgba(170,179,207,.8)";
                ctx.fillRect(w.x, 218, 90, 14);
                ctx.fillStyle = "rgba(84,224,199,.85)";
                ctx.fillRect(w.x, 218 - w.film * 6, 90, w.film * 6);
            });

            ctx.fillStyle = "rgba(120,180,255,.8)";

            apGas.forEach(function (p) {

                p.x += p.vx * dt;
                p.y += p.vy * dt;

                if (p.y > 214) { p.y = 62; p.x = 252 + rand() * 176; p.vx = (rand() - 0.5) * 60; }

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
            });

            label("gas, at atmospheric pressure", 340, 100 + 120, "center");
            label("wafers ride a belt under the injector", 340, 268, "center");
        }

        function label(str, x, y, align) {

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = align || "left";
            ctx.fillText(str, x, y);
        }

        function arrow(x1, y1, x2, y2) {

            ctx.strokeStyle = "rgba(245,247,255,.8)";
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - 8, y2 - 5);
            ctx.lineTo(x2 - 8, y2 + 5);
            ctx.closePath();
            ctx.fill();
        }

        function frame(dt) {

            t += dt;

            ctx.clearRect(0, 0, W, HT);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, W, HT);

            if (state.method === "lp") { drawLP(dt); }
            else if (state.method === "pe") { drawPE(dt); }
            else { drawAP(dt); }
        }

        function update() {

            const m = info[state.method];

            setVal(root, "power", state.power + "%");

            root.querySelector("[data-powerbox]").style.display = state.method === "pe" ? "" : "none";

            out(root, "name", m.name + ": " + m.full);
            out(root, "temp", m.temp);
            out(root, "press", m.pressure);
            out(root, "wafers", m.wafers);
            out(root, "vari", m.vari);
            out(root, "pros", "✅ " + m.pros);
            out(root, "cons", "⚠️ " + m.cons);

            let verdict = "";
            let tone = "";

            if (state.metal === 1) {

                if (state.method === "lp") { verdict = "✕ Too hot: it would damage the wiring"; tone = "rose"; }
                else if (state.method === "pe") { verdict = "✓ Cool enough for metal wiring"; tone = ""; }
                else { verdict = "⚠ Depends on the chemistry"; tone = "gold"; }

                out(root, "note", state.method === "pe"
                    ? "This is the PECVD sweet spot: finished metal limits the wafer to roughly 400 °C, and the plasma lets the reaction run that cool."
                    : state.method === "lp"
                        ? "Metal wiring cannot survive 600 to 800 °C, so LPCVD is only used before the metal goes on."
                        : "Atmospheric CVD can sometimes run cool enough, but it gives the least uniform film.");

            } else {

                verdict = state.method === "lp" ? "★ Best uniformity" : "✓ Allowed";
                tone = state.method === "lp" ? "gold" : "";

                out(root, "note", state.method === "lp"
                    ? "With only silicon and transistors on the wafer, heat is no problem, so LPCVD's uniformity and batch size win."
                    : state.method === "pe"
                        ? "Plasma lets this run cool, which you do not need here, so you give up some film quality for nothing."
                        : "Fast and simple, but you pay in uniformity.");
            }

            const chip = root.querySelector('[data-out="verdict"]');

            chip.textContent = verdict;
            chip.className = "fd-chip " + tone;

            const plasma = m.energy === "plasma" ? 0.35 + 0.55 * state.power / 100 : 0;

            root.querySelector("[data-bar-heat]").style.width = ((1 - plasma) * 100).toFixed(0) + "%";
            root.querySelector("[data-bar-plasma]").style.width = (plasma * 100).toFixed(0) + "%";
            out(root, "heatpct", "heat " + Math.round((1 - plasma) * 100) + "%");
            out(root, "plasmapct", plasma ? "plasma " + Math.round(plasma * 100) + "%" : "");

            waferMap(mapCanvas, state.method);
            frame(0);

            if (state.method === "pe") {
                F.reward("chip-cvd-plasma", 5, "You turned on the plasma");
            }
        }

        const anim = animate(root, frame);

        bindPause(root, anim);
        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       WATCH CVD HAPPEN (animated walkthrough)
    ====================================== */

    SIMS["chip-cvdflow"] = function (root) {

        const steps = [
            { id: "gas", title: "1 · Gas flows in", text: "Precursor gases, here silane (SiH₄), flow over a heated wafer. The gases choose the material, not the wafer." },
            { id: "surface", title: "2 · It reaches the hot surface", text: "Molecules drift down and meet the hot wafer surface." },
            { id: "react", title: "3 · It reacts", text: "On the hot surface the molecules break apart. Silicon atoms stay behind, and hydrogen is released." },
            { id: "film", title: "4 · A solid film builds", text: "The silicon atoms pile up, layer by layer, into a solid film." },
            { id: "pump", title: "5 · Waste is pumped away", text: "Volatile by-products, here hydrogen gas, float away and are pumped out of the chamber." }
        ];

        const defaults = { step: 0 };
        const state = { step: 0, auto: true };

        root.innerHTML =
            head("Watch it: how CVD builds a film") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="330" role="img" aria-label="An animated side view of CVD: gas molecules fall onto a hot wafer, break apart, leave silicon atoms that build a film, and hydrogen floats away to the pump"></canvas>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button>' +
            steps.map(function (s, i) { return '<button type="button" class="fd-sim-btn" data-step="' + i + '">' + (i + 1) + "</button>"; }).join("") +
            "</div>" +
            '<p class="fd-sim-formula">SiH₄ (gas) on a hot surface → Si (solid film) + 2 H₂ (gas, pumped away). Gas in, solid film out, waste pumped away.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const HT = canvas.height;
        const rand = mulberry(5);
        const WAFER_Y = 262;

        let t = 0;
        let stepTimer = 0;
        let film = 0;
        const mols = [];
        const waste = [];
        const atoms = [];

        function spawn() {

            mols.push({ x: 80 + rand() * 440, y: 40, vy: 40 + rand() * 30, vx: (rand() - 0.5) * 14 });
        }

        function frame(dt) {

            t += dt;

            // auto-advance the highlighted step
            if (state.auto) {

                stepTimer += dt;

                if (stepTimer > 3.2) {

                    stepTimer = 0;
                    state.step = (state.step + 1) % steps.length;

                    showStep();
                }
            }

            if (rand() < dt * 5) { spawn(); }

            ctx.clearRect(0, 0, W, HT);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, W, HT);

            // chamber
            ctx.strokeStyle = "rgba(170,179,207,.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(30, 20, 620, 280);

            // gas inlet and pump arrows
            ctx.fillStyle = state.step === 0 ? "rgba(255,214,102,.95)" : "rgba(245,247,255,.5)";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("gas in ↓", 60, 16);
            ctx.fillStyle = state.step === 4 ? "rgba(255,214,102,.95)" : "rgba(245,247,255,.5)";
            ctx.textAlign = "right";
            ctx.fillText("to the pump →", 650, 16);

            // heated wafer
            const hot = ctx.createLinearGradient(0, WAFER_Y, 0, WAFER_Y + 34);

            hot.addColorStop(0, "rgba(255,120,60,.85)");
            hot.addColorStop(1, "rgba(255,120,60,.25)");
            ctx.fillStyle = hot;
            ctx.fillRect(60, WAFER_Y, 560, 34);
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.textAlign = "center";
            ctx.fillText("hot wafer", 340, WAFER_Y + 54);

            // film
            const fh = film;

            ctx.fillStyle = "rgba(84,224,199,.8)";
            ctx.fillRect(60, WAFER_Y - fh, 560, fh);

            if (fh > 12) { film = 0; }

            // molecules
            for (let i = mols.length - 1; i >= 0; i--) {

                const m = mols[i];

                m.y += m.vy * dt;
                m.x += m.vx * dt;

                if (m.y >= WAFER_Y - fh - 4) {

                    // react: the silicon atom sticks, hydrogen floats off
                    film += 0.18;

                    for (let k = 0; k < 2; k++) {
                        waste.push({ x: m.x + (k ? 5 : -5), y: WAFER_Y - fh - 6, vx: 30 + rand() * 40, vy: -30 - rand() * 30 });
                    }

                    atoms.push({ x: m.x, y: WAFER_Y - fh - 2, life: 0.8 });
                    mols.splice(i, 1);

                    continue;
                }

                // a SiH4 molecule: a big blue atom with four small hydrogen dots
                ctx.fillStyle = state.step <= 1 ? "rgba(255,214,102,.95)" : "rgba(120,180,255,.9)";
                ctx.beginPath();
                ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(245,247,255,.8)";

                [[-7, 0], [7, 0], [0, -7], [0, 7]].forEach(function (o) {
                    ctx.beginPath();
                    ctx.arc(m.x + o[0], m.y + o[1], 2, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            // reaction flashes
            ctx.fillStyle = state.step === 2 ? "rgba(255,214,102,.9)" : "rgba(255,214,102,.5)";

            for (let i = atoms.length - 1; i >= 0; i--) {

                const a = atoms[i];

                a.life -= dt;

                if (a.life <= 0) { atoms.splice(i, 1); continue; }

                ctx.beginPath();
                ctx.arc(a.x, a.y, 9 * a.life, 0, Math.PI * 2);
                ctx.fill();
            }

            // waste hydrogen, pumped away
            ctx.fillStyle = state.step === 4 ? "rgba(255,105,120,.95)" : "rgba(255,105,120,.6)";

            for (let i = waste.length - 1; i >= 0; i--) {

                const w = waste[i];

                w.x += w.vx * dt;
                w.y += w.vy * dt;
                w.vy += 12 * dt;

                if (w.x > 650 || w.y < 24) { waste.splice(i, 1); continue; }

                ctx.beginPath();
                ctx.arc(w.x, w.y, 2.6, 0, Math.PI * 2);
                ctx.fill();
            }

            // legend
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("● SiH₄ molecule", 46, 52);
            ctx.fillStyle = "rgba(255,105,120,.9)";
            ctx.fillText("● hydrogen by-product", 46, 70);
            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.fillText("▮ silicon film", 46, 88);
        }

        function showStep() {

            const s = steps[state.step];

            out(root, "title", s.title);
            out(root, "text", s.text);

            root.querySelectorAll("button[data-step]").forEach(function (b) {
                b.classList.toggle("on", parseInt(b.dataset.step, 10) === state.step);
            });
        }

        root.querySelectorAll("button[data-step]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.auto = false;
                state.step = parseInt(b.dataset.step, 10);

                showStep();
            });
        });

        const anim = animate(root, frame);

        bindPause(root, anim);

        const reset = root.querySelector("[data-reset]");

        if (reset) {
            reset.addEventListener("click", function () { state.auto = true; stepTimer = 0; state.step = 0; showStep(); });
        }

        showStep();
        frame(0);
    };


    /* ======================================
       STEP COVERAGE AND VOIDS
    ====================================== */

    SIMS["chip-stepcov"] = function (root) {

        const defaults = { ar: 2, c: 20, p: 60 };
        const state = { ar: defaults.ar, c: defaults.c, p: defaults.p };

        root.innerHTML =
            head("Try it: fill a trench") +
            art("0 0 340 230", "A cross-section of a trench with a film depositing on it: a conformal film coats the walls and floor evenly and fills the trench, while a line-of-sight film piles up at the top, pinches the opening shut, and leaves a hidden void") +
            '<div class="fd-sim-readout"><div class="fd-sim-big">Step coverage <span data-out="cov"></span></div><span class="fd-chip" data-out="verdict"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-seg"><span class="fd-seg-label">Presets</span>' +
            '<button type="button" class="fd-sim-btn" data-c="15">Sputtering-like</button>' +
            '<button type="button" class="fd-sim-btn" data-c="55">PECVD-like</button>' +
            '<button type="button" class="fd-sim-btn" data-c="90">LPCVD-like</button>' +
            '<button type="button" class="fd-sim-btn" data-c="100">ALD-like</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "How conformal is the film?", key: "c", min: 5, max: 100, step: 1, value: defaults.c }) +
            slider({ label: "Trench depth to width (aspect ratio)", key: "ar", min: 0.5, max: 3.5, step: 0.1, value: defaults.ar }) +
            slider({ label: "Deposition progress", key: "p", min: 0, max: 100, step: 1, value: defaults.p }) +
            "</div>" +
            '<p class="fd-sim-formula">Step coverage compares film thickness on the walls and floor with the thickness on top. A line-of-sight film piles up at the top and can pinch the opening shut, leaving a hidden void.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function update() {

            const c = state.c / 100;
            const Wp = 46;
            const D = Math.min(160, Wp * state.ar);
            const surf = 44;
            const xl = 147;
            const xr = xl + Wp;
            const x = state.p / 100 * Wp * 0.9;

            setVal(root, "c", state.c + "%");
            setVal(root, "ar", state.ar.toFixed(1) + " : 1");
            setVal(root, "p", state.p + "%");

            const tAt = function (y) { return x * (c + (1 - c) * 0.6 * Math.exp(-y / Wp)); };
            const t0 = tAt(0);
            const tD = tAt(D) * (1 - 0.08 * (state.ar - 0.5) * (1 - c));
            const cover = x > 0 ? clamp(tD / x, 0, 1) : 1;

            let s = "";

            // substrate with trench
            s += rectS(20, surf, xl - 20, 190 - surf, "rgba(170,179,207,.25)", "rgba(170,179,207,.6)", 0);
            s += rectS(xr, surf, 320 - xr, 190 - surf, "rgba(170,179,207,.25)", "rgba(170,179,207,.6)", 0);
            s += rectS(xl, surf + D, Wp, 190 - surf - D, "rgba(170,179,207,.25)", "rgba(170,179,207,.6)", 0);

            // film: fill the trench and the top band, then carve out what is left empty
            const filmFill = "rgba(84,224,199,.55)";
            const filmEdge = ACCENT;

            s += rectS(xl, surf, Wp, D, filmFill, "none", 0);
            s += rectS(20, surf - x, xl - 20 + t0, x, filmFill, filmEdge, 0);
            s += rectS(xr - t0, surf - x, 320 - xr + t0, x, filmFill, filmEdge, 0);

            const w0 = Wp - 2 * t0;
            const pts = [];
            let startY = -1;

            for (let y = 0; y <= D; y += 2) {

                const wy = Wp - 2 * (y === D ? tD : tAt(y));

                if (wy > 0.8) {

                    if (startY < 0) { startY = y; }

                    pts.push([y, wy]);
                }
            }

            const closed = w0 <= 0.8;
            const hasVoid = closed && pts.length > 2;

            if (pts.length > 2) {

                const left = pts.map(function (p) { return (xl + (Wp - p[1]) / 2).toFixed(1) + "," + (surf + p[0]).toFixed(1); });
                const right = pts.slice().reverse().map(function (p) { return (xr - (Wp - p[1]) / 2).toFixed(1) + "," + (surf + p[0]).toFixed(1); });

                s += '<polygon points="' + left.concat(right).join(" ") + '" style="fill:var(--bg);stroke:' + (hasVoid ? ROSE : "none") + ';stroke-width:1.4;' + (hasVoid ? "stroke-dasharray:4 3" : "") + '"/>';

                if (hasVoid) {
                    s += text(xl + Wp / 2, surf + startY + (D - startY) / 2 + 3, "void", 8, "middle", ROSE);
                }
            }

            if (closed) {
                s += rectS(xl, surf - x, Wp, x + 2, filmFill, filmEdge, 0);
            }

            s += text(170, 30, "film on top: " + (x > 0.5 ? Math.round(x / Wp * 100) / 100 : 0) + " of the trench width", 6.5, "middle", "var(--muted)");
            s += text(xl - 6, surf + D / 2, "walls and floor thinner", 6.5, "end", "var(--muted)");
            s += text(170, 208, "thickness on the floor is " + Math.round(cover * 100) + "% of the top", 7, "middle", ACCENT);

            svg.innerHTML = s;

            out(root, "cov", Math.round(cover * 100) + "%");

            const chip = root.querySelector('[data-out="verdict"]');

            if (hasVoid) {
                chip.textContent = "Void trapped";
                chip.className = "fd-chip rose";
            } else if (closed) {
                chip.textContent = "Filled, with a seam";
                chip.className = "fd-chip";
            } else if (state.p > 70) {
                chip.textContent = "Opening still clear";
                chip.className = "fd-chip gold";
            } else {
                chip.textContent = "Coating";
                chip.className = "fd-chip";
            }

            out(root, "note", hasVoid
                ? "The film piled up at the top and shut the opening before the trench filled, trapping a hidden void."
                : c > 0.8
                    ? "A conformal film coats the walls and floor as thickly as the top, so the trench fills from every side."
                    : "A line-of-sight film coats the top much more than the floor. Keep depositing and watch the opening pinch shut.");

            if (hasVoid && state.c <= 30) {
                F.reward("chip-stepcov-void", 5, "You trapped a void");
            }
        }

        root.querySelectorAll("button[data-c]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.c = parseFloat(b.dataset.c);
                root.querySelector('input[data-key="c"]').value = state.c;

                update();
            });
        });

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       EVAPORATION vs SPUTTERING (animated)
    ====================================== */

    SIMS["chip-pvd"] = function (root) {

        const defaults = { heat: 60, gas: 40 };
        const state = { heat: defaults.heat, gas: defaults.gas };

        root.innerHTML =
            head("Watch it: evaporation vs sputtering") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="380" role="img" aria-label="Two animated vacuum chambers side by side: on the left a heated source evaporates metal atoms straight up onto a wafer; on the right argon ions strike a target and knock metal atoms out in all directions onto the wafer"></canvas>' +
            playButtons() +
            '<div class="fd-stat-row"><div class="fd-stat"><b data-out="ev">Heat the source</b><span>Evaporation: atoms leave gently, travel straight</span></div><div class="fd-stat"><b data-out="sp">Hit it with ions</b><span>Sputtering: atoms are knocked out, with more energy</span></div></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Evaporation: source heat", key: "heat", min: 10, max: 100, step: 1, value: defaults.heat }) +
            slider({ label: "Sputtering: argon pressure", key: "gas", min: 10, max: 100, step: 1, value: defaults.gas }) +
            "</div>" +
            '<p class="fd-sim-formula">Both are line-of-sight: atoms that reach the trench wall stick where they land, so deep, narrow trenches get coated unevenly. Sputtered atoms arrive with more energy, which helps adhesion.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const HT = canvas.height;
        const rand = mulberry(77);

        const WAFER_Y = 92;        // underside of the wafer
        const TR_W = 30;
        const TR_D = 34;

        function makePanel(cx) {

            return {
                cx: cx,
                atoms: [],
                ions: [],
                top: new Float32Array(220),
                wallL: new Float32Array(TR_D),
                wallR: new Float32Array(TR_D),
                floor: new Float32Array(TR_W),
                count: 0,
                acc: 0
            };
        }

        const ev = makePanel(170);
        const sp = makePanel(510);

        function film(p) {

            p.count++;

            if (p.count > 650) {

                p.top.fill(0);
                p.wallL.fill(0);
                p.wallR.fill(0);
                p.floor.fill(0);
                p.count = 0;
            }
        }

        function step(p, mode, dt) {

            // emit
            const rate = mode === "ev" ? state.heat * 0.9 : 40 + (100 - state.gas) * 0.35;

            p.acc += rate * dt;

            while (p.acc >= 1) {

                p.acc -= 1;

                if (mode === "ev") {

                    const ang = (rand() + rand() + rand() - 1.5) * 0.34;

                    p.atoms.push({ x: p.cx + (rand() - 0.5) * 16, y: HT - 70, vx: Math.sin(ang) * 130, vy: -Math.cos(ang) * 130 });

                } else {

                    const ang = Math.asin(rand() * 2 - 1);

                    p.atoms.push({ x: p.cx + (rand() - 0.5) * 120, y: HT - 70, vx: Math.sin(ang) * 110, vy: -Math.cos(ang) * 110 });
                }
            }

            // argon ions (sputtering only)
            if (mode === "sp") {

                if (rand() < dt * 8) {
                    p.ions.push({ x: p.cx + (rand() - 0.5) * 140, y: HT - 140, vy: 150 });
                }

                for (let i = p.ions.length - 1; i >= 0; i--) {

                    const io = p.ions[i];

                    io.y += io.vy * dt;

                    if (io.y >= HT - 70) { p.ions.splice(i, 1); }
                }
            }

            // move atoms
            for (let i = p.atoms.length - 1; i >= 0; i--) {

                const a = p.atoms[i];

                const px = a.x;
                const py = a.y;

                a.x += a.vx * dt;
                a.y += a.vy * dt;

                if (mode === "sp" && rand() < (state.gas / 100) * dt * 3.2) {

                    const ang = rand() * Math.PI * 2;
                    const spd = 70;

                    a.vx = Math.cos(ang) * spd;
                    a.vy = Math.sin(ang) * spd;
                }

                if (a.y > HT - 66 || a.x < p.cx - 160 || a.x > p.cx + 160) {

                    if (a.y > HT - 66) { p.atoms.splice(i, 1); continue; }
                    if (a.x < p.cx - 160 || a.x > p.cx + 160) { p.atoms.splice(i, 1); continue; }
                }

                if (a.y <= WAFER_Y) {

                    const lx = a.x - p.cx;
                    const inTrench = Math.abs(lx) <= TR_W / 2;

                    // just crossed the wafer's surface, outside the trench: lands on the top
                    if (py > WAFER_Y && !inTrench) {

                        p.top[clamp(Math.floor(a.x - p.cx + 110), 0, 219)] += 1;

                        film(p);
                        p.atoms.splice(i, 1);

                        continue;
                    }

                    if (a.y > WAFER_Y - TR_D) {

                        // inside the trench's height: did it cross a wall?
                        const wasIn = Math.abs(px - p.cx) <= TR_W / 2;

                        if (!inTrench && wasIn) {

                            const idx = clamp(Math.floor(WAFER_Y - a.y), 0, TR_D - 1);

                            if (lx < 0) { p.wallL[idx] += 1; } else { p.wallR[idx] += 1; }

                            film(p);
                            p.atoms.splice(i, 1);
                        }

                        continue;
                    }

                    // reached the trench floor (or wandered into the wafer body)
                    if (inTrench) {

                        p.floor[clamp(Math.floor(lx + TR_W / 2), 0, TR_W - 1)] += 1;

                        film(p);
                    }

                    p.atoms.splice(i, 1);
                }
            }
        }


        function drawPanel(p, mode) {

            const cx = p.cx;

            // chamber
            ctx.strokeStyle = "rgba(170,179,207,.45)";
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - 162, 14, 324, HT - 24);

            // wafer with a trench notch (wafer faces downward)
            ctx.fillStyle = "rgba(170,179,207,.6)";
            ctx.fillRect(cx - 120, WAFER_Y - 50, 240, 50);
            ctx.fillStyle = "rgba(6,10,24,1)";
            ctx.fillRect(cx - TR_W / 2, WAFER_Y - TR_D, TR_W, TR_D);

            // film on wafer
            ctx.fillStyle = "rgba(84,224,199,.9)";

            for (let i = 0; i < 220; i++) {

                if (p.top[i] > 0) {

                    const x = cx - 110 + i;

                    if (Math.abs(x - cx) > TR_W / 2) {
                        ctx.fillRect(x, WAFER_Y, 1.2, Math.min(10, p.top[i] * 1.5));
                    }
                }
            }

            for (let i = 0; i < TR_D; i++) {

                ctx.fillRect(cx - TR_W / 2, WAFER_Y - 1 - i, Math.min(6, p.wallL[i] * 1.6), 1.2);
                ctx.fillRect(cx + TR_W / 2 - Math.min(6, p.wallR[i] * 1.6), WAFER_Y - 1 - i, Math.min(6, p.wallR[i] * 1.6), 1.2);
            }

            for (let i = 0; i < TR_W; i++) {
                ctx.fillRect(cx - TR_W / 2 + i, WAFER_Y - TR_D, 1.2, Math.min(8, p.floor[i] * 1.6));
            }

            // source
            if (mode === "ev") {

                const g = ctx.createRadialGradient(cx, HT - 56, 4, cx, HT - 56, 40);

                g.addColorStop(0, "rgba(255,160,60," + (0.35 + state.heat / 160).toFixed(2) + ")");
                g.addColorStop(1, "rgba(255,160,60,0)");
                ctx.fillStyle = g;
                ctx.fillRect(cx - 50, HT - 100, 100, 60);
                ctx.fillStyle = "rgba(170,179,207,.7)";
                ctx.beginPath();
                ctx.moveTo(cx - 28, HT - 40);
                ctx.lineTo(cx + 28, HT - 40);
                ctx.lineTo(cx + 18, HT - 62);
                ctx.lineTo(cx - 18, HT - 62);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "rgba(255,170,90,.95)";
                ctx.fillRect(cx - 14, HT - 66, 28, 6);

            } else {

                const g = ctx.createLinearGradient(0, HT - 190, 0, HT - 66);

                g.addColorStop(0, "rgba(150,110,255,0)");
                g.addColorStop(1, "rgba(150,110,255," + (0.18 + 0.12 * Math.sin(performance.now() / 120)).toFixed(2) + ")");
                ctx.fillStyle = g;
                ctx.fillRect(cx - 150, HT - 190, 300, 124);
                ctx.fillStyle = "rgba(255,170,90,.75)";
                ctx.fillRect(cx - 80, HT - 64, 160, 10);
                ctx.fillStyle = "rgba(245,247,255,.9)";
                ctx.font = "12px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("metal target", cx, HT - 38);
            }

            // ions
            ctx.fillStyle = "rgba(120,180,255,.95)";

            p.ions.forEach(function (io) {
                ctx.beginPath();
                ctx.arc(io.x, io.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            // atoms
            ctx.fillStyle = "rgba(255,214,102,.95)";

            p.atoms.forEach(function (a) {
                ctx.beginPath();
                ctx.arc(a.x, a.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.fillStyle = "rgba(245,247,255,.92)";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(mode === "ev" ? "Evaporation" : "Sputtering", cx, 32);
        }

        function frame(dt) {

            ctx.clearRect(0, 0, W, HT);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, W, HT);

            step(ev, "ev", dt);
            step(sp, "sp", dt);
            drawPanel(ev, "ev");
            drawPanel(sp, "sp");

            ctx.strokeStyle = "rgba(245,247,255,.2)";
            ctx.beginPath();
            ctx.moveTo(W / 2, 14);
            ctx.lineTo(W / 2, HT - 10);
            ctx.stroke();
        }

        function update() {

            setVal(root, "heat", state.heat + "%");
            setVal(root, "gas", state.gas + "%");

            out(root, "ev", state.heat > 70 ? "Very hot source" : "Gently heated source");
            out(root, "sp", state.gas > 70 ? "Crowded argon: lots of scattering" : "Thin argon: atoms fly freely");
            out(root, "note", state.gas > 70
                ? "More gas means more collisions, so sputtered atoms scatter and arrive from more angles, which helps coat sidewalls but slows deposition."
                : "Left: a narrow beam goes straight up, so almost nothing reaches the trench walls. Right: atoms leave at wide angles and a few more reach the walls.");
        }

        const anim = animate(root, frame);

        bindPause(root, anim);
        wire(root, state, defaults, update);
        update();
        frame(0);
    };


    /* ======================================
       COPPER PLATING: bottom-up fill
    ====================================== */

    SIMS["chip-plate"] = function (root) {

        const defaults = { add: 1, p: 45 };
        const state = { add: defaults.add, p: defaults.p };

        root.innerHTML =
            head("Try it: plate a copper wire") +
            art("0 0 340 230", "A trench lined with a thin copper seed being filled with electroplated copper: with chemical additives it fills from the bottom up with no void, and without additives it grows from the walls, pinches the top shut, and traps a void") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="head"></div><span class="fd-chip" data-out="verdict"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Plating bath", "add", [[1, "With additives"], [0, "Without additives"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Plating time", key: "p", min: 0, max: 100, step: 1, value: defaults.p }) +
            "</div>" +
            '<p class="fd-sim-formula">Cu²⁺ + 2e⁻ → Cu. A sputtered copper seed layer carries the current, and copper ions plate onto it. Additives make the fill start at the bottom of each trench and climb upward.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function update() {

            const Wp = 46;
            const D = 118;
            const surf = 56;
            const xl = 147;
            const xr = xl + Wp;
            const p = state.p / 100;
            const copperFill = "rgba(255,170,90,.7)";
            const copperEdge = "rgba(255,170,90,.95)";

            setVal(root, "p", state.p + "%");

            let s = "";

            s += rectS(20, surf, xl - 20, 180 - surf, "rgba(170,179,207,.25)", "rgba(170,179,207,.6)", 0);
            s += rectS(xr, surf, 320 - xr, 180 - surf, "rgba(170,179,207,.25)", "rgba(170,179,207,.6)", 0);
            s += rectS(xl, surf + D, Wp, 180 - surf - D, "rgba(170,179,207,.25)", "rgba(170,179,207,.6)", 0);

            // seed layer
            s += '<path d="M' + xl + "," + surf + " L" + xl + "," + (surf + D) + " L" + xr + "," + (surf + D) + " L" + xr + "," + surf + '" style="fill:none;stroke:' + copperEdge + ';stroke-width:2"/>';

            let voidShown = false;
            let overburden = 0;
            let filled = false;

            if (state.add === 1) {

                // bottom-up superfill
                const h = Math.min(D, p * D * 1.15);

                s += rectS(xl, surf + D - h, Wp, h, copperFill, "none", 0);

                if (p * 1.15 > 1) {

                    overburden = (p * 1.15 - 1) * 90;
                    filled = true;

                    s += rectS(xl - 6 - overburden * 0.3, surf - overburden * 0.25, Wp + 12 + overburden * 0.6, overburden * 0.25 + 1, copperFill, copperEdge, 3);
                }

            } else {

                // wall growth only: pinches at the top
                const x = p * Wp * 0.62;
                const t0 = x * 0.9;
                const tD = x * 0.45;
                const closed = Wp - 2 * t0 <= 0.8;

                s += rectS(xl, surf, Wp, D, copperFill, "none", 0);
                s += rectS(20, surf - x * 0.6, xl - 20 + t0, x * 0.6, copperFill, copperEdge, 0);
                s += rectS(xr - t0, surf - x * 0.6, 320 - xr + t0, x * 0.6, copperFill, copperEdge, 0);

                const pts = [];

                for (let y = 0; y <= D; y += 2) {

                    const t = x * (0.45 + 0.45 * Math.exp(-y / 40));
                    const wy = Wp - 2 * t;

                    if (wy > 0.8) { pts.push([y, wy]); }
                }

                if (pts.length > 2) {

                    const left = pts.map(function (q) { return (xl + (Wp - q[1]) / 2).toFixed(1) + "," + (surf + q[0]).toFixed(1); });
                    const right = pts.slice().reverse().map(function (q) { return (xr - (Wp - q[1]) / 2).toFixed(1) + "," + (surf + q[0]).toFixed(1); });

                    s += '<polygon points="' + left.concat(right).join(" ") + '" style="fill:var(--bg);stroke:' + (closed ? ROSE : "none") + ';stroke-width:1.4;' + (closed ? "stroke-dasharray:4 3" : "") + '"/>';
                    voidShown = closed;

                    if (closed) {
                        s += text(170, surf + D / 2 + 3, "void", 8, "middle", ROSE);
                    }
                }

                if (closed) {
                    s += rectS(xl, surf - x * 0.6, Wp, x * 0.6 + 2, copperFill, copperEdge, 0);
                }
            }

            s += text(170, 28, state.add === 1 ? "copper climbs from the bottom" : "copper grows in from the walls", 7.5, "middle", TEXT);
            s += text(170, 204, "a thin copper seed layer carries the plating current", 7, "middle", "var(--muted)");

            svg.innerHTML = s;

            out(root, "head", state.add === 1 ? "Bottom-up fill" : "Wall-first growth");

            const chip = root.querySelector('[data-out="verdict"]');

            if (voidShown) {
                chip.textContent = "Void trapped";
                chip.className = "fd-chip rose";
            } else if (filled) {
                chip.textContent = "Full, with overburden to polish off";
                chip.className = "fd-chip";
            } else {
                chip.textContent = "Filling";
                chip.className = "fd-chip gold";
            }

            out(root, "note", state.add === 1
                ? "Additives speed plating at the bottom and slow it at the top, so the wire fills without voids. The extra copper on top is polished away next."
                : "With no additives copper grows evenly everywhere, so the top pinches shut before the bottom fills, trapping a void.");

            if (voidShown) {
                F.reward("chip-plate-void", 5, "You made a void, now fix it with additives");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       ATOMIC LAYER DEPOSITION (animated)
    ====================================== */

    SIMS["chip-ald"] = function (root) {

        const defaults = { pulse: 1.4, speed: 1 };
        const state = { pulse: defaults.pulse, speed: defaults.speed };

        root.innerHTML =
            head("Watch it: one atomic layer at a time") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="340" role="img" aria-label="An animated ALD cycle: precursor A molecules land on surface sites until every site is used, a purge removes the extras, precursor B reacts to form one layer, and another purge finishes the cycle"></canvas>' +
            playButtons() +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="phase"></div><span class="fd-chip" data-out="cycles"></span></div>' +
            '<div class="fd-stat-row">' + stat("Film so far", "thick") + stat("Sites filled this pulse", "cov") + stat("Added each cycle", "grow") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Animation speed", "speed", [[1, "×1"], [4, "×4"], [12, "×12"]]) +
            '<div class="fd-split"><div><p class="fd-sim-note"><b>Does a longer pulse add more?</b></p><svg class="fd-sim-art" data-chart viewBox="0 0 340 190" role="img" aria-label="Growth per cycle against pulse time: ALD levels off because the reaction is self-limiting, while CVD keeps growing"></svg></div>' +
            '<div><p class="fd-sim-note"><b>The same trench</b></p><svg class="fd-sim-art" data-trench viewBox="0 0 340 190" role="img" aria-label="A trench coated evenly all around by ALD"></svg></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Precursor pulse time", key: "pulse", min: 0.2, max: 3, step: 0.1, value: defaults.pulse }) +
            "</div>" +
            '<p class="fd-sim-formula">Each cycle adds about 0.1 nm, so roughly 20 cycles make a 2 nm film. Once every site is used, the reaction stops by itself: that is what self-limiting means.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const HT = canvas.height;
        const rand = mulberry(9);

        const SURF_Y = 270;
        const SITES = 14;
        const siteX = [];

        for (let i = 0; i < SITES; i++) {
            siteX.push(70 + i * (540 / (SITES - 1)));
        }

        const PHASES = ["Pulse A", "Purge", "Pulse B", "Purge"];

        let phase = 0;
        let pt = 0;
        let cycles = 0;
        let thicknessNm = 0;
        let filled = new Array(SITES).fill(false);
        let reacted = new Array(SITES).fill(false);
        let layers = 0;
        let mols = [];

        const PHASE_LEN = [2.6, 1.3, 2.6, 1.3];

        function coverage() {

            return 1 - Math.exp(-state.pulse / 0.55);
        }

        function reset() {

            phase = 0;
            pt = 0;
            cycles = 0;
            thicknessNm = 0;
            filled = new Array(SITES).fill(false);
            reacted = new Array(SITES).fill(false);
            layers = 0;
            mols = [];
        }

        function nextPhase() {

            if (phase === 0) {

                // pulse A ends: the sites filled by then stay filled
                const target = Math.round(coverage() * SITES);
                let n = filled.filter(Boolean).length;

                for (let i = 0; i < SITES && n < target; i++) {

                    if (!filled[i]) {
                        filled[i] = true;
                        n++;
                    }
                }
            }

            if (phase === 2) {

                // pulse B reacts with every filled site and makes one layer
                const n = filled.filter(Boolean).length;

                for (let i = 0; i < SITES; i++) {
                    reacted[i] = reacted[i] || filled[i];
                }

                thicknessNm += 0.1 * (n / SITES);
                cycles++;
                layers = Math.min(6, layers + (n / SITES > 0.5 ? 1 : 0));
            }

            phase = (phase + 1) % 4;
            pt = 0;
            mols = [];

            if (phase === 0) {
                filled = new Array(SITES).fill(false);
            }

            if (cycles === 20) {
                F.reward("chip-ald-20", 10, "Twenty cycles: a 2 nm film, one atomic layer at a time");
            }
        }

        function frame(dt) {

            dt = dt * state.speed;

            pt += dt;

            const len = PHASE_LEN[phase] * (phase === 0 || phase === 2 ? clamp(state.pulse / 1.4, 0.45, 2) : 1);

            if (pt >= len) {
                nextPhase();
            }

            // spawn molecules during the pulses
            if ((phase === 0 || phase === 2) && rand() < dt * 18) {
                mols.push({ x: 60 + rand() * 560, y: 30, vy: 90 + rand() * 40, kind: phase === 0 ? "A" : "B", free: true, vx: 0 });
            }

            ctx.clearRect(0, 0, W, HT);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, W, HT);

            // substrate
            ctx.fillStyle = "rgba(170,179,207,.35)";
            ctx.fillRect(40, SURF_Y + 40, 600, 30);

            // grown layers
            ctx.fillStyle = "rgba(84,224,199,.7)";

            for (let l = 0; l < layers; l++) {
                ctx.fillRect(40, SURF_Y + 40 - (l + 1) * 6 - l, 600, 6);
            }

            const baseY = SURF_Y + 40 - layers * 7;

            // surface sites
            siteX.forEach(function (x, i) {

                if (reacted[i] && phase !== 0) {

                    // the film cell made this cycle
                    ctx.fillStyle = "rgba(84,224,199,.85)";
                    ctx.fillRect(x - 17, baseY - 8, 34, 8);

                } else {

                    ctx.strokeStyle = "rgba(245,247,255,.6)";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x - 9, baseY - 4, 18, 4);
                }

                if (filled[i] && (phase === 0 || phase === 1 || phase === 2)) {

                    ctx.fillStyle = "rgba(120,180,255,.95)";
                    ctx.beginPath();
                    ctx.arc(x, baseY - 12, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // molecules
            for (let i = mols.length - 1; i >= 0; i--) {

                const m = mols[i];

                if (phase === 1 || phase === 3) {

                    m.vx = (m.vx || 20) + 220 * dt;
                    m.x += m.vx * dt;
                    m.y -= 20 * dt;

                    if (m.x > W + 20) { mols.splice(i, 1); continue; }

                } else {

                    m.y += m.vy * dt;

                    // reaction at a site
                    if (m.free && m.y > baseY - 20) {

                        let idx = -1;
                        let best = 22;

                        siteX.forEach(function (x, k) {

                            const d = Math.abs(x - m.x);

                            if (d < best && ((m.kind === "A" && !filled[k]) || (m.kind === "B" && filled[k] && !reacted[k]))) {
                                best = d;
                                idx = k;
                            }
                        });

                        if (idx >= 0 && m.kind === "A" && rand() < coverage() * 0.9 + 0.1) {

                            filled[idx] = true;
                            mols.splice(i, 1);

                            continue;
                        }

                        if (idx >= 0 && m.kind === "B") {

                            reacted[idx] = true;
                            mols.splice(i, 1);

                            continue;
                        }

                        // no free site: bounce away
                        m.free = false;
                        m.vy = -50;
                        m.vx = (rand() - 0.5) * 120;
                    }

                    if (!m.free) {
                        m.x += m.vx * dt;
                    }

                    if (m.y < 20) { mols.splice(i, 1); continue; }
                }

                ctx.fillStyle = m.kind === "A" ? "rgba(120,180,255,.95)" : "rgba(255,214,102,.95)";
                ctx.beginPath();
                ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            // phase banner
            ctx.fillStyle = "rgba(245,247,255,.92)";
            ctx.font = "bold 15px sans-serif";
            ctx.textAlign = "left";

            const names = ["Pulse A: precursor 1 (blue)", "Purge: sweep out the extra", "Pulse B: precursor 2 (gold)", "Purge: sweep out the by-products"];

            ctx.fillText(names[phase], 46, 28);
            ctx.font = "12px sans-serif";
            ctx.fillStyle = "rgba(245,247,255,.7)";
            ctx.fillText("cycle " + (cycles + 1), 46, 48);
            ctx.fillText("surface sites", 46, SURF_Y + 86);

            out(root, "phase", PHASES[phase]);
            out(root, "cycles", "cycle " + cycles);
            out(root, "thick", thicknessNm.toFixed(2) + " nm");
            out(root, "cov", Math.round(coverage() * 100) + "%");
            out(root, "grow", (0.1 * coverage()).toFixed(3) + " nm");
        }

        function drawCharts() {

            const chart = root.querySelector("svg[data-chart]");
            const x0 = 40, x1 = 326, y0 = 160, y1 = 24;
            const gx = function (t) { return x0 + t / 3 * (x1 - x0); };
            const gy = function (v) { return y0 - v * (y0 - y1); };

            let s = "";

            s += line(x0, y0, x1, y0, "var(--muted)", 1) + line(x0, y0, x0, y1 - 4, "var(--muted)", 1);
            s += text(x1, y0 + 14, "pulse time", 6.5, "end", "var(--muted)");
            s += text(x0 + 4, y1 - 8, "film added per cycle", 6.5, "start", "var(--muted)");

            const ald = [];
            const cvd = [];

            for (let t = 0; t <= 3.001; t += 0.1) {

                ald.push(gx(t).toFixed(1) + "," + gy(1 - Math.exp(-t / 0.55)).toFixed(1));
                cvd.push(gx(t).toFixed(1) + "," + gy(Math.min(1.05, t / 2.9)).toFixed(1));
            }

            s += '<polyline points="' + cvd.join(" ") + '" style="fill:none;stroke:' + ROSE + ';stroke-width:1.6;stroke-dasharray:4 3"/>';
            s += '<polyline points="' + ald.join(" ") + '" style="fill:none;stroke:' + ACCENT + ';stroke-width:2.4"/>';
            s += text(x1 - 4, gy(1) + 14, "ALD levels off: self-limiting", 6.5, "end", ACCENT);
            s += text(x1 - 4, gy(1.05) - 2, "CVD keeps growing", 6.5, "end", ROSE);
            s += line(gx(state.pulse), y0, gx(state.pulse), gy(1 - Math.exp(-state.pulse / 0.55)), GOLD, 1.2, "3 3");
            s += circ(gx(state.pulse).toFixed(1), gy(1 - Math.exp(-state.pulse / 0.55)).toFixed(1), 4.4, GOLD, "var(--bg)");

            chart.innerHTML = s;

            const tr = root.querySelector("svg[data-trench]");
            let t2 = "";

            t2 += rectS(30, 60, 100, 110, "rgba(170,179,207,.25)", "rgba(170,179,207,.6)", 0);
            t2 += rectS(210, 60, 100, 110, "rgba(170,179,207,.25)", "rgba(170,179,207,.6)", 0);
            t2 += rectS(130, 150, 80, 20, "rgba(170,179,207,.25)", "rgba(170,179,207,.6)", 0);
            t2 += '<path d="M130,60 L130,150 L210,150 L210,60" style="fill:none;stroke:' + ACCENT + ';stroke-width:4"/>';
            t2 += '<path d="M30,60 L130,60 M210,60 L310,60" style="fill:none;stroke:' + ACCENT + ';stroke-width:4"/>';
            t2 += text(170, 108, "an even coat all the way down", 7, "middle", TEXT);
            t2 += text(170, 30, "ALD coats the walls and floor equally", 7, "middle", ACCENT);
            t2 += text(170, 186, "good enough for 3D fin transistors", 6.5, "middle", "var(--muted)");

            tr.innerHTML = t2;
        }

        function update() {

            setVal(root, "pulse", state.pulse.toFixed(1) + " s");

            out(root, "note", coverage() < 0.8
                ? "Too short a pulse: not every surface site gets used, so each cycle adds less than a full layer."
                : "Long enough: every site is used, so each cycle adds one full, uniform layer. A longer pulse would add nothing more.");

            drawCharts();
        }

        const anim = animate(root, frame);

        bindPause(root, anim);
        wire(root, state, defaults, update);

        const reset2 = root.querySelector("[data-reset]");

        if (reset2) {
            reset2.addEventListener("click", reset);
        }

        update();
        frame(0);
    };


    // Mount any layer sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="chip-"]').forEach(F.mount);

})();
