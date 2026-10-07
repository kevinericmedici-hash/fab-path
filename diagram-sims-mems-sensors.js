/* ========================================
   MEMS & MICROFABRICATION: ACCELEROMETERS

   Unit 17: a phone that knows which way is up.
   Unit 18: the mass-spring-damper, and the noise floor.
   Unit 19: parallel plate versus comb capacitors.
   Unit 20: inside the ADXL150, and designing its springs.

   Registers on window.FabInteract; loaded by diagram-sims-mems.js.
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
    const poly = M.poly;
    const pline = M.pline;
    const animate = M.animate;
    const bindPause = M.bindPause;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const G = 9.81;


    /* ======================================
       UNIT 17: WHICH WAY IS UP?
    ====================================== */

    SIMS["mems-tilt"] = function (root) {

        const defaults = { roll: 0, pitch: 0 };
        const state = { roll: 0, pitch: 0 };
        const seen = {};

        root.innerHTML =
            head("Try it: tilt a phone") +
            art("0 0 340 200", "On the left, an end view of a phone tilting with gravity pointing down. On the right, the phone's screen turning to match how it is held") +
            '<div class="fd-stat-row">' + stat("Sideways (x)", "ax") + stat("Up the screen (y)", "ay") + stat("Out of the screen (z)", "az") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Tilt left or right (degrees)", key: "roll", min: -180, max: 180, step: 5, value: 0 }) +
            slider({ label: "Tilt forward or back (degrees)", key: "pitch", min: -90, max: 90, step: 5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">A resting accelerometer feels gravity: 1 g pointing down. How that 1 g splits across its three axes tells the phone how it is held.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const r = state.roll * Math.PI / 180;
            const p = state.pitch * Math.PI / 180;
            const ax = Math.sin(r) * Math.cos(p);
            const ay = Math.sin(p);
            const az = Math.cos(r) * Math.cos(p);

            out(root, "ax", ax.toFixed(2) + " g");
            out(root, "ay", ay.toFixed(2) + " g");
            out(root, "az", az.toFixed(2) + " g");
            setVal(root, "roll", state.roll + "°");
            setVal(root, "pitch", state.pitch + "°");

            let orient;
            let rot = 0;

            if (az > 0.75) {
                orient = "Lying flat, screen up";
            } else if (az < -0.75) {
                orient = "Lying flat, screen down";
            } else if (Math.abs(ay) >= Math.abs(ax)) {
                orient = ay >= 0 ? "Held upright (portrait)" : "Held upside down";
                rot = ay >= 0 ? 0 : 180;
            } else {
                orient = ax > 0 ? "Held sideways (landscape)" : "Held sideways the other way";
                rot = ax > 0 ? -90 : 90;
            }

            out(root, "verdict", orient + ": the screen turns to match");

            seen[orient] = true;

            if (Object.keys(seen).length >= 4) {
                F.reward("mems-tilt-orient", 10, "You turned the phone every way");
            }

            let s = "";

            // end view with gravity
            s += label(80, 20, "end view", 7.5, "middle", "var(--muted)");
            s += '<g transform="translate(80 100) rotate(' + state.roll + ')">' + rect(-36, -5, 72, 10, "rgba(84,224,199,.75)", "rgba(245,247,255,.9)") + "</g>";
            s += '<line x1="80" y1="100" x2="80" y2="170" style="stroke:rgba(255,214,102,.95);stroke-width:2.4"/>';
            s += '<polygon points="74,164 86,164 80,176" style="fill:rgba(255,214,102,.95)"/>';
            s += label(80, 190, "gravity", 7, "middle", "rgba(255,214,102,1)");

            // phone icon turning with the screen
            const pw = Math.abs(rot) === 90 ? 90 : 56;
            const ph = Math.abs(rot) === 90 ? 56 : 90;

            s += '<g transform="translate(250 100)">';
            s += rect(-pw / 2, -ph / 2, pw, ph, "rgba(20,30,60,.95)", "rgba(245,247,255,.9)");
            s += '<text x="0" y="6" text-anchor="middle" transform="rotate(' + (rot === 0 ? 0 : (rot === 180 ? 180 : (rot === -90 ? -90 : 90))) + ')" style="font-size:22px;font-weight:800;fill:rgba(84,224,199,1)">A</text>';
            s += "</g>";
            s += label(250, 170, az > 0.75 ? "screen up" : (az < -0.75 ? "screen down" : "what the screen shows"), 7, "middle", "var(--muted)");

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 18: THE MASS-SPRING-DAMPER
    ====================================== */

    SIMS["mems-massspring"] = function (root) {

        const defaults = { m: 0.23, k: 5.6, logq: 2.08, logf: 3 };
        const state = { m: 0.23, k: 5.6, logq: 2.08, logf: 3 };

        root.innerHTML =
            head("Try it: design the mass and spring") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="340" role="img" aria-label="Left: a proof mass on a spring that rings after a tap. Right: a frequency response chart showing the natural frequency, the signal frequency, and where the sensor stays accurate"></canvas>' +
            '<div class="fd-stat-row">' + stat("Natural frequency", "f0") + stat("Motion per g", "sens") + stat("Quality factor", "q") + stat("Signal read with error", "err") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-tap>👆 Tap it</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Proof mass (micrograms)", key: "m", min: 0.05, max: 2, step: 0.01, value: 0.23 }) +
            slider({ label: "Spring stiffness (N/m)", key: "k", min: 0.5, max: 30, step: 0.1, value: 5.6 }) +
            slider({ label: "Quality factor Q (log scale)", key: "logq", min: -0.3, max: 2.3, step: 0.05, value: 2.08 }) +
            slider({ label: "Frequency of the motion you want to measure (log scale)", key: "logf", min: 2, max: 5.3, step: 0.05, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">ω₀ = √(k ÷ m). Sensitivity is x ÷ a = m ÷ k = 1 ÷ ω₀². A softer spring or heavier mass moves more per g, but lowers the natural frequency and the usable bandwidth. Defaults are close to an ADXL150-style design.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let tt = 99;

        function calc() {

            const m = state.m * 1e-9;           // kg
            const w0 = Math.sqrt(state.k / m);
            const f0 = w0 / (2 * Math.PI);
            const Q = Math.pow(10, state.logq);
            const f = Math.pow(10, state.logf);
            const r = f / f0;
            const gain = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(r / Q, 2));
            const sens = G / (w0 * w0) * 1e9;    // nm per g

            return { f0: f0, Q: Q, f: f, r: r, gain: gain, sens: sens };
        }

        function fmtF(f) {

            return f >= 1e6 ? (f / 1e6).toFixed(2) + " MHz" : (f >= 1000 ? (f / 1000).toFixed(f >= 1e4 ? 1 : 2) + " kHz" : Math.round(f) + " Hz");
        }

        function update() {

            const c = calc();
            const errPct = Math.abs(c.gain - 1) * 100;

            out(root, "f0", fmtF(c.f0));
            out(root, "sens", c.sens >= 1000 ? (c.sens / 1000).toFixed(2) + " µm" : c.sens.toFixed(c.sens < 10 ? 2 : 0) + " nm");
            out(root, "q", c.Q < 10 ? c.Q.toFixed(1) : Math.round(c.Q));
            out(root, "err", errPct < 1000 ? errPct.toFixed(errPct < 10 ? 1 : 0) + "%" : "huge");
            setVal(root, "m", state.m.toFixed(2) + " µg");
            setVal(root, "k", state.k.toFixed(1) + " N/m");
            setVal(root, "logq", c.Q < 10 ? c.Q.toFixed(1) : Math.round(c.Q));
            setVal(root, "logf", fmtF(c.f));

            const chip = root.querySelector('[data-out="chip"]');

            if (errPct < 5) {

                out(root, "verdict", "The sensor follows the motion faithfully");
                chip.textContent = "✓ Stays above resonance";
                chip.className = "fd-chip";
                F.reward("mems-massspring-ok", 10, "You kept the resonance above the signal");

            } else if (c.r < 1.3) {

                out(root, "verdict", "Too close to resonance: the sensor's own ringing distorts the signal");
                chip.textContent = "✕ Distorted";
                chip.className = "fd-chip rose";

            } else {

                out(root, "verdict", "The signal is above the natural frequency, so the mass cannot follow");
                chip.textContent = "✕ Too fast for this sensor";
                chip.className = "fd-chip rose";
            }

            ["m", "k", "logq", "logf"].forEach(function (key) {

                const inp = root.querySelector('input[data-key="' + key + '"]');

                if (inp && document.activeElement !== inp) {
                    inp.value = state[key];
                }
            });
        }

        function draw() {

            const c = calc();

            ctx.clearRect(0, 0, 680, 340);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 340);

            // left: mass on a spring, ringing after a tap
            const cx = 150;
            const topY = 40;
            const decay = Math.exp(-tt / ((c.Q / Math.PI) / 3));
            const wv = 2 * Math.PI * 3;
            const under = c.Q > 0.6;
            const disp = (under ? Math.cos(wv * tt) : 1) * decay * 46;
            const my = 190 + (isFinite(disp) ? disp : 0);
            const mh = 30 + state.m * 18;

            ctx.fillStyle = "rgba(170,179,207,.6)";
            ctx.fillRect(cx - 60, topY - 12, 120, 12);

            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(cx, topY);

            const coils = Math.round(6 + state.k / 4);
            const sh = my - mh / 2 - topY;

            for (let i = 1; i <= coils; i++) {

                ctx.lineTo(cx + (i % 2 ? -16 : 16), topY + sh * i / (coils + 1));
            }

            ctx.lineTo(cx, my - mh / 2);
            ctx.stroke();

            ctx.fillStyle = "rgba(84,224,199,.8)";
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.fillRect(cx - 44, my - mh / 2, 88, mh);
            ctx.strokeRect(cx - 44, my - mh / 2, 88, mh);
            ctx.fillStyle = "rgba(6,10,24,.9)";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("mass", cx, my + 4);

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.fillText(c.Q > 0.6 ? "rings, then settles (higher Q rings longer)" : "heavily damped: it just settles", cx, 316);

            // right: frequency response on a log-log plot
            const x0 = 330;
            const x1 = 650;
            const y0 = 40;
            const y1 = 280;
            const fMin = 100;
            const fMax = 2e5;

            function X(f) { return x0 + (Math.log10(f) - Math.log10(fMin)) / (Math.log10(fMax) - Math.log10(fMin)) * (x1 - x0); }
            function Y(g) { return y1 - (Math.log10(clamp(g, 0.01, 1000)) + 2) / 5 * (y1 - y0); }

            ctx.strokeStyle = "rgba(170,179,207,.6)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0, y1);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            ctx.fillStyle = "rgba(170,179,207,.9)";
            ctx.font = "11px sans-serif";
            ctx.textAlign = "right";

            [0.01, 0.1, 1, 10, 100].forEach(function (g) {

                ctx.fillText(g, x0 - 5, Y(g) + 4);
                ctx.strokeStyle = g === 1 ? "rgba(255,214,102,.5)" : "rgba(170,179,207,.15)";
                ctx.beginPath();
                ctx.moveTo(x0, Y(g));
                ctx.lineTo(x1, Y(g));
                ctx.stroke();
            });

            ctx.textAlign = "center";

            [100, 1000, 10000, 100000].forEach(function (f) { ctx.fillText(f >= 1000 ? (f / 1000) + " kHz" : f + " Hz", X(f), y1 + 16); });

            ctx.fillText("frequency of the motion", (x0 + x1) / 2, y1 + 34);
            ctx.textAlign = "left";
            ctx.fillText("how much the mass responds", x0, y0 - 12);

            // safe zone: below one fifth of resonance
            ctx.fillStyle = "rgba(84,224,199,.12)";
            ctx.fillRect(x0, y0, clamp(X(c.f0 / 5), x0, x1) - x0, y1 - y0);

            ctx.strokeStyle = "rgba(84,224,199,1)";
            ctx.lineWidth = 2.6;
            ctx.beginPath();

            for (let i = 0; i <= 200; i++) {

                const f = Math.pow(10, Math.log10(fMin) + i / 200 * (Math.log10(fMax) - Math.log10(fMin)));
                const r = f / c.f0;
                const g = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(r / c.Q, 2));
                const x = X(f);
                const y = Y(g);

                if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }

            ctx.stroke();

            ctx.strokeStyle = "rgba(255,105,120,.95)";
            ctx.setLineDash([4, 3]);
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(clamp(X(c.f0), x0, x1), y0);
            ctx.lineTo(clamp(X(c.f0), x0, x1), y1);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(255,105,120,1)";
            ctx.textAlign = "center";
            ctx.fillText("natural frequency", clamp(X(c.f0), x0 + 50, x1 - 50), y0 + 12);

            ctx.fillStyle = "rgba(255,214,102,1)";
            ctx.beginPath();
            ctx.arc(X(c.f), Y(c.gain), 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText("your signal", clamp(X(c.f), x0 + 40, x1 - 40), Y(c.gain) - 12);
        }

        animate(root, function (dt) {

            tt += dt;

            if (tt > 8) { tt = 0; }

            draw();
        });

        root.querySelector("[data-tap]").addEventListener("click", function () {

            tt = 0;
            F.reward("mems-massspring-tap", 5, "You tapped the mass");
        });

        wire(root, state, defaults, function () {

            update();
            tt = 0;
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 18: THE NOISE FLOOR
    ====================================== */

    SIMS["mems-noise"] = function (root) {

        const defaults = { m: 0.23, logq: 2.08, logb: 2, loga: -0.5 };
        const state = { m: 0.23, logq: 2.08, logb: 2, loga: -0.5 };

        root.innerHTML =
            head("Try it: can you see the signal in the noise?") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="280" role="img" aria-label="A trace of random noise with a small steady vibration hidden in it. Heavier mass and higher quality factor reduce the noise"></canvas>' +
            '<div class="fd-stat-row">' + stat("Noise floor", "floor") + stat("Noise in your bandwidth", "rms") + stat("Signal size", "sig") + stat("Signal to noise", "snr") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Proof mass (micrograms)", key: "m", min: 0.05, max: 2, step: 0.01, value: 0.23 }) +
            slider({ label: "Quality factor Q (log scale)", key: "logq", min: 0.5, max: 2.5, step: 0.05, value: 2.08 }) +
            slider({ label: "Bandwidth you listen to (log scale)", key: "logb", min: 1.5, max: 3.5, step: 0.05, value: 2 }) +
            slider({ label: "Size of the signal (log scale)", key: "loga", min: -3.5, max: 0, step: 0.05, value: -0.5 }) +
            "</div>" +
            '<p class="fd-sim-formula">Air molecules randomly colliding with the proof mass set a noise floor. To lower it, increase the quality factor and increase the proof mass. Illustrative: scaled from an ADXL floor of 0.005 g/√Hz at 0.23 µg and Q = 120.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(Date.now() % 100000);
        const samples = [];

        let t = 0;

        function calc() {

            const Q = Math.pow(10, state.logq);
            const floor = 0.005 * Math.sqrt(0.23 * 120 / (state.m * Q));
            const B = Math.pow(10, state.logb);
            const rms = floor * Math.sqrt(B);
            const A = Math.pow(10, state.loga);

            return { Q: Q, floor: floor, B: B, rms: rms, A: A, snr: A / Math.SQRT2 / rms };
        }

        function fmtG(g) {

            if (g >= 1) { return g.toFixed(2) + " g"; }
            if (g >= 1e-3) { return (g * 1e3).toFixed(g * 1e3 < 10 ? 1 : 0) + " mg"; }

            return (g * 1e6).toFixed(0) + " µg";
        }

        function update() {

            const c = calc();

            out(root, "floor", (c.floor * 1000).toFixed(c.floor * 1000 < 10 ? 2 : 1) + " mg/√Hz");
            out(root, "rms", fmtG(c.rms));
            out(root, "sig", fmtG(c.A));
            out(root, "snr", c.snr >= 100 ? Math.round(c.snr) + "×" : c.snr.toFixed(1) + "×");
            setVal(root, "m", state.m.toFixed(2) + " µg");
            setVal(root, "logq", c.Q < 10 ? c.Q.toFixed(1) : Math.round(c.Q));
            setVal(root, "logb", Math.round(c.B) + " Hz");
            setVal(root, "loga", fmtG(c.A));

            const chip = root.querySelector('[data-out="chip"]');

            if (c.snr >= 10) {

                out(root, "verdict", "A clean, readable signal");
                chip.textContent = "✓ Clear";
                chip.className = "fd-chip";
                F.reward("mems-noise-clear", 10, "You pulled a signal out of the noise");

            } else if (c.snr >= 2) {

                out(root, "verdict", "You can see it, but it is noisy");
                chip.textContent = "⚠ Noisy";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "The signal is buried in the noise");
                chip.textContent = "✕ Lost";
                chip.className = "fd-chip rose";
            }

            ["m", "logq", "logb", "loga"].forEach(function (key) {

                const inp = root.querySelector('input[data-key="' + key + '"]');

                if (inp && document.activeElement !== inp) {
                    inp.value = state[key];
                }
            });
        }

        function gauss() {

            const u = Math.max(1e-9, rand());

            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
        }

        function draw() {

            const c = calc();

            ctx.clearRect(0, 0, 680, 280);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 280);

            const mid = 140;
            const span = Math.max(c.A * 1.2, c.rms * 3.2);
            const k = 120 / span;

            ctx.strokeStyle = "rgba(170,179,207,.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(20, mid);
            ctx.lineTo(660, mid);
            ctx.stroke();

            // the hidden signal
            ctx.strokeStyle = "rgba(255,214,102,.9)";
            ctx.lineWidth = 2.4;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();

            for (let x = 0; x <= 640; x += 4) {

                const y = mid - c.A * Math.sin((x / 640) * Math.PI * 6 - t * 3) * k;

                if (x === 0) { ctx.moveTo(20 + x, y); } else { ctx.lineTo(20 + x, y); }
            }

            ctx.stroke();
            ctx.setLineDash([]);

            // what you actually see
            ctx.strokeStyle = "rgba(84,224,199,.95)";
            ctx.lineWidth = 1.8;
            ctx.beginPath();

            samples.forEach(function (n, i) {

                const x = 20 + i * 4;
                const y = mid - (c.A * Math.sin((i * 4 / 640) * Math.PI * 6 - t * 3) + n * c.rms) * k;

                if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            });

            ctx.stroke();

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("teal: what the sensor reports   gold dashes: the real motion", 24, 22);
        }

        animate(root, function (dt) {

            t += dt;

            samples.push(gauss());

            while (samples.length > 161) { samples.shift(); }

            draw();
        });

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 19: PARALLEL PLATE VERSUS COMB
    ====================================== */

    SIMS["mems-capacitor"] = function (root) {

        const defaults = { shape: "plate", d: 0 };
        const state = { shape: "plate", d: 0 };

        root.innerHTML =
            head("Try it: two ways to sense position") +
            art("0 0 340 200", "On the left, a capacitor made of two plates or of interleaved fingers whose moving part slides. On the right, how the capacitance changes with movement for both shapes") +
            '<div class="fd-stat-row">' + stat("Capacitance now", "c") + stat("Change", "dc") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Shape", "shape", [["plate", "Parallel plate"], ["comb", "Interdigitated (comb)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Movement of the moving part", key: "d", min: -80, max: 80, step: 2, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Parallel plate: capacitance changes as the gap changes. Comb: capacitance changes as the fingers slide past each other. Comb structures are the shape in most real capacitive MEMS accelerometers, including the ADXL150.</p>';

        const svg = root.querySelector("svg");
        const seen = {};

        function cPlate(d) { return 1 / (1 - d / 100); }
        function cComb(d) { return 1 + d / 100; }

        function update() {

            const d = state.d;
            const plate = state.shape === "plate";
            const c = plate ? cPlate(d) : cComb(d);

            let s = "";

            if (plate) {

                const gap = 46 * (1 - d / 100);

                s += rect(30, 50, 10, 90, "rgba(255,214,102,.85)", "none");
                s += rect(40 + gap, 50, 10, 90, "rgba(84,224,199,.85)", "none");
                s += '<polyline points="45,100 45,100" style="stroke:none"/>';
                s += label(40 + gap / 2, 160, "gap", 7, "middle", "var(--muted)");
                s += '<line x1="40" y1="150" x2="' + (40 + gap) + '" y2="150" style="stroke:rgba(245,247,255,.8)"/>';
                s += label(80, 40, "two flat plates", 7.5, "middle");

            } else {

                const ov = 40 * (1 + d / 100);

                for (let i = 0; i < 4; i++) {

                    s += rect(28 + i * 22, 50, 8, 60, "rgba(255,214,102,.85)", "none");
                }

                s += rect(24, 46, 4 + 4 * 22 + 8, 6, "rgba(255,214,102,.85)", "none");

                for (let i = 0; i < 4; i++) {

                    s += rect(39 + i * 22, 140 - (ov), 8, ov + 0, "rgba(84,224,199,.85)", "none");
                }

                s += rect(35, 140, 4 * 22 + 8, 6, "rgba(84,224,199,.85)", "none");
                s += label(80, 40, "interleaved fingers", 7.5, "middle");
                s += label(80, 164, "overlap changes", 7, "middle", "var(--muted)");
            }

            // chart
            const cx0 = 190;
            const cx1 = 325;
            const cy0 = 160;
            const cy1 = 30;

            function X(dd) { return cx0 + (dd + 80) / 160 * (cx1 - cx0); }
            function Y(v) { return cy0 - clamp(v, 0, 5.2) / 5.2 * (cy0 - cy1); }

            s += '<line x1="' + cx0 + '" y1="' + cy0 + '" x2="' + cx1 + '" y2="' + cy0 + '" style="stroke:var(--muted)"/><line x1="' + cx0 + '" y1="' + cy0 + '" x2="' + cx0 + '" y2="' + cy1 + '" style="stroke:var(--muted)"/>';

            const pp = [];
            const cc = [];

            for (let dd = -80; dd <= 80; dd += 4) {

                pp.push([X(dd), Y(cPlate(dd))]);
                cc.push([X(dd), Y(cComb(dd))]);
            }

            s += pline(pp, "rgba(255,105,120,1)", plate ? 2.4 : 1.2);
            s += pline(cc, "rgba(84,224,199,1)", plate ? 1.2 : 2.4);
            s += label(cx1, Y(cPlate(80)) + 4, "plate", 6.5, "end", "rgba(255,105,120,1)");
            s += label(cx1 - 4, Y(cComb(80)) - 4, "comb", 6.5, "end", "rgba(84,224,199,1)");
            s += '<circle cx="' + X(d).toFixed(1) + '" cy="' + Y(c).toFixed(1) + '" r="4.4" style="fill:rgba(255,214,102,1);stroke:var(--bg)"/>';
            s += label((cx0 + cx1) / 2, 182, "movement", 6.5, "middle", "var(--muted)");
            s += label(cx0 - 4, cy1 + 4, "C", 7, "end");

            svg.innerHTML = s;

            out(root, "c", c.toFixed(2) + " × rest");
            out(root, "dc", (c - 1 >= 0 ? "+" : "") + ((c - 1) * 100).toFixed(0) + "%");
            setVal(root, "d", d + "%");

            out(root, "verdict", plate ? (d > 40 ? "Capacitance climbs steeply as the gap closes: nonlinear" : "The response curves upward as the gap closes") : "A straight-line response: capacitance tracks the overlap");

            seen[state.shape] = true;

            if (seen.plate && seen.comb) {
                F.reward("mems-capacitor-both", 10, "You compared both capacitor shapes");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 20: INSIDE THE ADXL150
    ====================================== */

    SIMS["mems-adxl"] = function (root) {

        const defaults = { a: 0 };
        const state = { a: 0 };

        root.innerHTML =
            head("Try it: an ADXL150-style sense cell") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="A comb-shaped proof mass whose moving fingers sit between two sets of fixed fingers. Acceleration moves the mass, one gap shrinks, the other grows, and the capacitance difference becomes the output voltage"></canvas>' +
            '<div class="fd-stat-row">' + stat("Acceleration", "acc") + stat("Mass moves", "mv") + stat("Output change", "outp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-self>🔧 Self-test</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Acceleration (g)", key: "a", min: -60, max: 60, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">From the spec sheet: 38 mV per g, ±50 g full scale, 24 kHz resonance, 400 to 1000 Hz bandwidth. A real mass moves well under a nanometer per g, so the motion drawn here is hugely exaggerated.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let x = 0;
        let selfT = 0;

        function update() {

            const a = clamp(state.a, -50, 50);

            out(root, "acc", state.a + " g");
            out(root, "mv", (Math.abs(a) * 0.41).toFixed(1) + " nm");
            out(root, "outp", (a * 38).toFixed(0) + " mV");
            setVal(root, "a", state.a + " g");

            out(root, "verdict", Math.abs(state.a) > 50 ? "Beyond ±50 g: the output is clipped at full scale" : (state.a === 0 ? "At rest: both gaps are equal" : "One gap shrinks, the other grows, and the difference is the output"));

            if (Math.abs(state.a) > 50) {
                F.reward("mems-adxl-clip", 5, "You pushed past full scale");
            }
        }

        function target() {

            const a = clamp(state.a, -50, 50);

            return -a * 0.22 + (selfT > 0 ? Math.sin(selfT * 18) * 9 * Math.min(1, selfT) : 0);
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 300);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 300);

            const cx = 340 + x;
            const cy = 150;

            // anchors
            ctx.fillStyle = "rgba(170,179,207,.7)";
            ctx.fillRect(40, cy - 20, 26, 40);
            ctx.fillRect(614, cy - 20, 26, 40);

            // folded springs
            ctx.strokeStyle = "rgba(245,247,255,.85)";
            ctx.lineWidth = 2.4;

            [[66, cx - 150], [cx + 150, 614]].forEach(function (p) {

                ctx.beginPath();
                ctx.moveTo(p[0], cy);

                for (let i = 1; i <= 8; i++) {
                    ctx.lineTo(p[0] + (p[1] - p[0]) * i / 8, cy + (i < 8 ? (i % 2 ? -10 : 10) : 0));
                }

                ctx.stroke();
            });

            // backbone of the moving mass
            ctx.fillStyle = "rgba(84,224,199,.8)";
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.lineWidth = 2;
            ctx.fillRect(cx - 150, cy - 7, 300, 14);
            ctx.strokeRect(cx - 150, cy - 7, 300, 14);

            // moving fingers hang up and down from the backbone; fixed fingers interleave
            let capL = 0;
            let capR = 0;

            for (let i = -4; i <= 4; i++) {

                const fx = cx + i * 30;
                const fxFixedL = 340 + i * 30 - 9;
                const fxFixedR = 340 + i * 30 + 9;

                ctx.fillStyle = "rgba(84,224,199,.9)";
                ctx.fillRect(fx - 3, cy - 82, 6, 76);
                ctx.fillRect(fx - 3, cy + 6, 6, 76);

                ctx.fillStyle = "rgba(255,214,102,.9)";
                ctx.fillRect(fxFixedL - 12 - 3, cy - 90, 6, 60);
                ctx.fillRect(fxFixedL - 12 - 3, cy + 30, 6, 60);

                ctx.fillStyle = "rgba(255,105,120,.9)";
                ctx.fillRect(fxFixedR + 12 - 3, cy - 90, 6, 60);
                ctx.fillRect(fxFixedR + 12 - 3, cy + 30, 6, 60);

                capL += 1 / Math.max(2, 9 + (fx - 340 - i * 30));
                capR += 1 / Math.max(2, 9 - (fx - 340 - i * 30));
            }

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("teal: moving fingers   gold and red: fixed fingers on each side", 340, 24);
            ctx.fillText(selfT > 0 ? "self-test: electrostatic force shakes the mass to prove it works" : "tap Self-test to shake the mass electrostatically", 340, 286);

            void capL;
            void capR;
        }

        animate(root, function (dt) {

            if (selfT > 0) { selfT -= dt * 0.6; }

            x += (target() - x) * Math.min(1, dt * 8);
            draw();
        });

        root.querySelector("[data-self]").addEventListener("click", function () {

            selfT = 1.4;
            F.reward("mems-adxl-self", 5, "You ran the self-test");
        });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    /* ======================================
       UNIT 20: DESIGNING THE SPRINGS
    ====================================== */

    SIMS["mems-springdesign"] = function (root) {

        const defaults = { L: 122, w: 2, m: 0.23 };
        const state = { L: 122, w: 2, m: 0.23 };
        const T = 2e-6;
        const E = 160e9;

        root.innerHTML =
            head("Try it: design the springs") +
            art("0 0 340 200", "A proof mass held by four thin beams whose length and width set the stiffness, with bars showing the stiffness and the natural frequency compared with the bandwidth") +
            '<div class="fd-stat-row">' + stat("Spring constant", "k") + stat("Natural frequency", "f0") + stat("Motion per g", "x") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Beam length (µm)", key: "L", min: 60, max: 200, step: 2, value: 122 }) +
            slider({ label: "Beam width (µm)", key: "w", min: 1, max: 4, step: 0.1, value: 2 }) +
            slider({ label: "Proof mass (micrograms)", key: "m", min: 0.05, max: 1, step: 0.01, value: 0.23 }) +
            "</div>" +
            '<p class="fd-sim-formula">With four beams of 2 µm polysilicon, k ≈ 4 · E · t · w³ ÷ L³ and f₀ = (1 ÷ 2π) √(k ÷ m). The ADXL150 has k ≈ 5.6 N/m and f₀ ≈ 24.7 kHz. Defaults are close to that design.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const L = state.L * 1e-6;
            const w = state.w * 1e-6;
            const m = state.m * 1e-9;
            const k = 4 * E * T * Math.pow(w, 3) / Math.pow(L, 3);
            const f0 = Math.sqrt(k / m) / (2 * Math.PI);
            const x = G / Math.pow(2 * Math.PI * f0, 2) * 1e9;

            let s = "";

            // the proof mass and four beams
            const mw = 30 + state.m * 40;

            s += rect(115 - mw / 2, 60, mw, mw * 0.7, "rgba(84,224,199,.8)", "rgba(245,247,255,.9)");

            const bl = state.L * 0.45;
            const bt = state.w * 2.2;

            [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (q) {

                const bx = 115 + q[0] * (mw / 2 + bl / 2);
                const by = 60 + mw * 0.35 + q[1] * 14;

                s += rect((bx - bl / 2).toFixed(1), (by - bt / 2).toFixed(1), bl.toFixed(1), bt.toFixed(1), "rgba(245,247,255,.85)", "none");
                s += rect((115 + q[0] * (mw / 2 + bl) - 4).toFixed(1), (by - 8).toFixed(1), 8, 16, "rgba(170,179,207,.8)", "none");
            });

            s += label(115, 56, "proof mass", 7, "middle");
            s += label(115, 150, "four beams hold the mass", 7, "middle", "var(--muted)");

            // bars
            function bar(y, name, v, vmax, color, text) {

                const w2 = clamp(v / vmax, 0, 1) * 98;

                return label(236, y - 4, name, 6.5, "start", "var(--muted)") + rect(236, y, 98, 12, "rgba(170,179,207,.18)", "none") + rect(236, y, Math.max(2, w2), 12, color, "none") + label(334, y + 24, text, 6.5, "end");
            }

            s += bar(32, "stiffness", k, 30, "rgba(255,214,102,.85)", k.toFixed(1) + " N/m");
            s += bar(84, "natural frequency", f0, 60000, f0 >= 10000 ? "rgba(84,224,199,.85)" : "rgba(255,105,120,.85)", (f0 / 1000).toFixed(1) + " kHz");
            s += bar(136, "motion per g", x, 5, "rgba(120,180,255,.85)", x.toFixed(2) + " nm");

            const bw = 1000;
            const bwx = 236 + clamp(bw / 60000, 0, 1) * 98;

            s += '<line x1="' + bwx + '" y1="76" x2="' + bwx + '" y2="108" style="stroke:rgba(255,214,102,1);stroke-width:1.6"/>';
            s += label(bwx + 3, 74, "1 kHz bandwidth", 6, "start", "rgba(255,214,102,1)");

            svg.innerHTML = s;

            out(root, "k", k.toFixed(1) + " N/m");
            out(root, "f0", (f0 / 1000).toFixed(1) + " kHz");
            out(root, "x", x.toFixed(2) + " nm");
            setVal(root, "L", state.L + " µm");
            setVal(root, "w", state.w.toFixed(1) + " µm");
            setVal(root, "m", state.m.toFixed(2) + " µg");

            const chip = root.querySelector('[data-out="chip"]');

            if (f0 >= 10000) {

                out(root, "verdict", "Resonance sits well above the bandwidth");
                chip.textContent = "✓ Follows the design rule";
                chip.className = "fd-chip";

                if (k >= 4 && k <= 8 && f0 >= 20000 && f0 <= 30000) {
                    F.reward("mems-springdesign-adxl", 15, "You matched the ADXL150 design");
                }

            } else if (f0 >= 5000) {

                out(root, "verdict", "Getting close to the signal frequencies");
                chip.textContent = "⚠ Little margin";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Too soft: resonance is too near the bandwidth");
                chip.textContent = "✕ Too close";
                chip.className = "fd-chip rose";
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 19: READING THE CAPACITOR
    ====================================== */

    SIMS["mems-readout"] = function (root) {

        const defaults = { exc: "dc", move: "osc", speed: 1, off: 0.3 };
        const state = { exc: "dc", move: "osc", speed: 1, off: 0.3 };

        const WIN = 3;          // seconds of history on screen
        const FC = 8;           // carrier frequency of the AC excitation, in Hz (slowed down to be visible)

        root.innerHTML =
            head("Watch it: what does the circuit actually measure?") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="450" role="img" aria-label="A circuit that applies an excitation voltage to a capacitor whose plate moves, with graphs of position, capacitance, excitation voltage, current, and output voltage over time"></canvas>' +
            '<div class="fd-readout-eq" data-eq></div>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<p class="fd-sim-note" data-out="changing"></p>' +
            seg("Excitation source", "exc", [["dc", "DC voltage + resistor feedback"], ["ac", "AC voltage + capacitor feedback"]]) +
            seg("How the plate moves", "move", [["still", "Held still"], ["ramp", "Steady speed back and forth"], ["osc", "Oscillating"]]) +
            '<div class="fd-sim-controls" data-controls></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            '<p class="fd-sim-formula"><b>Voltage or current?</b> You apply a voltage: the excitation source puts V across the capacitor. What you measure is the current that flows in response, and the amplifier turns that current into an output voltage. So it is both, in that order: voltage in, current through, voltage out.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const controls = root.querySelector("[data-controls]");
        const eqEl = root.querySelector("[data-eq]");

        if (!document.getElementById("fabMemsReadoutStyles")) {

            const el = document.createElement("style");

            el.id = "fabMemsReadoutStyles";
            el.textContent = ".fd-readout-eq { margin: 8px 0; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,.04); line-height: 1.9; font-size: .95rem; } .fd-readout-eq .hi { color: #54e0c7; font-weight: 800; } .fd-readout-eq .lo { color: var(--muted); }";
            document.head.appendChild(el);
        }

        const H = { x: [], c: [], cd: [], v: [], i: [], o: [], t: [] };

        let T = 0;
        let prev = null;
        let built = "";
        let dots = 0;
        let seenDC = false;
        let seenAC = false;
        let stillZero = false;

        function xAt(t) {

            if (state.move === "still") { return state.off; }

            if (state.move === "ramp") {

                const ph = (t * state.speed / 4) % 1;

                return -0.4 + 0.8 * (ph < 0.5 ? ph * 2 : 2 - 2 * ph);
            }

            return 0.4 * Math.sin(2 * Math.PI * 0.35 * state.speed * t);
        }

        function sample(t, h) {

            const x = xAt(t);
            const C = 1 + x;
            const ac = state.exc === "ac";
            const V = ac ? Math.sin(2 * Math.PI * FC * t) : 1;
            const Q = C * V;

            let i = 0;

            if (prev) { i = (Q - prev.Q) / h; }

            // the output: DC with a feedback resistor gives -R*i, AC with a feedback capacitor gives -(C/CF)*V
            const o = ac ? -C * V : -i;
            const iShow = ac ? i / (2 * Math.PI * FC) : i;

            prev = { Q: Q };

            return { x: x, c: C, v: V, i: iShow, o: o };
        }

        function buildControls() {

            if (built === state.move) { return; }

            built = state.move;

            controls.innerHTML = state.move === "still"
                ? slider({ label: "Where the plate sits (position)", key: "off", min: -0.4, max: 0.4, step: 0.05, value: state.off })
                : slider({ label: "How fast it moves", key: "speed", min: 0.4, max: 2, step: 0.1, value: state.speed });

            controls.querySelectorAll("input[type=range]").forEach(function (input) {

                input.addEventListener("input", function () {

                    state[input.dataset.key] = parseFloat(input.value);
                    update();
                });
            });
        }

        function update() {

            buildControls();

            const dc = state.exc === "dc";

            eqEl.innerHTML = dc
                ? 'Q = C(x) · V<br>' +
                  'i = dQ/dt = <span class="lo">C · dV/dt</span> + <span class="hi">V · dC/dt</span><br>' +
                  'DC source: dV/dt = 0, so i = V · dC/dt = V · (dC/dx) · <span class="hi">dx/dt</span><br>' +
                  'V<sub>o</sub> = −R<sub>F</sub> · i &nbsp;→&nbsp; <span class="hi">proportional to velocity</span>'
                : 'Q = C(x) · V<sub>ac</sub><br>' +
                  'Charge amplifier with a feedback capacitor C<sub>F</sub><br>' +
                  'V<sub>o</sub> = −(C(x) ÷ C<sub>F</sub>) · V<sub>ac</sub><br>' +
                  'Amplitude of V<sub>o</sub> ∝ <span class="hi">C(x)</span> &nbsp;→&nbsp; <span class="hi">proportional to position</span>';

            const chip = root.querySelector('[data-out="chip"]');

            if (dc) {

                seenDC = true;
                out(root, "changing", state.move === "still"
                    ? "V is fixed and the plate is not moving, so dC/dt = 0: no current flows, and the output is zero, even though the capacitance is not zero."
                    : "V is fixed, so the only thing that can change the charge is the capacitance changing. Current flows only while the plate is moving.");

                out(root, "verdict", state.move === "still" ? "Held still: no current, no output" : "The output follows how fast the plate moves");
                chip.textContent = "velocity";
                chip.className = "fd-chip gold";

            } else {

                seenAC = true;
                out(root, "changing", "V keeps alternating, so charge keeps moving even when the plate is still. The size of the response carries C(x): a bigger overlap gives a bigger output swing.");
                out(root, "verdict", "The output's amplitude follows where the plate is");
                chip.textContent = "position";
                chip.className = "fd-chip";
            }

            if (seenDC && seenAC) {
                F.reward("mems-readout-both", 15, "You compared DC and AC readout");
            }

            setVal(root, "off", state.off.toFixed(2));
            setVal(root, "speed", state.speed.toFixed(1) + "×");

            H.x = []; H.c = []; H.cd = []; H.v = []; H.i = []; H.o = []; H.t = [];
            prev = null;
        }

        function row(label, y, h, key, scale, color, fmt) {

            const x0 = 250;
            const x1 = 660;

            ctx.strokeStyle = "rgba(170,179,207,.25)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0, y + h / 2);
            ctx.lineTo(x1, y + h / 2);
            ctx.stroke();

            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.font = "11px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(label, x0, y - 3);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            let first = true;

            for (let k = 0; k < H.t.length; k++) {

                const px = x0 + (H.t[k] - (T - WIN)) / WIN * (x1 - x0);

                if (px < x0) { continue; }

                const py = y + h / 2 - clamp(H[key][k], -1.3, 1.3) * scale;

                if (first) { ctx.moveTo(px, py); first = false; } else { ctx.lineTo(px, py); }
            }

            ctx.stroke();

            void fmt;
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 450);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 450);

            const ac = state.exc === "ac";
            const last = H.x.length ? H.x[H.x.length - 1] : xAt(T);
            const lastI = H.i.length ? H.i[H.i.length - 1] : 0;

            // ---- the circuit ----
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";

            // source
            ctx.beginPath();
            ctx.arc(60, 60, 20, 0, Math.PI * 2);
            ctx.stroke();

            if (ac) {

                ctx.beginPath();

                for (let k = 0; k <= 20; k++) {

                    const px = 48 + k * 1.2;
                    const py = 60 - Math.sin(k / 20 * Math.PI * 2) * 8;

                    if (k === 0) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
                }

                ctx.stroke();

            } else {

                ctx.fillText("+", 60, 56);
                ctx.fillText("−", 60, 72);
            }

            ctx.fillStyle = "rgba(255,214,102,1)";
            ctx.fillText(ac ? "V (AC, 1 kHz or more)" : "V (DC)", 60, 30);

            // wire from the source down to the capacitor
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.beginPath();
            ctx.moveTo(60, 80);
            ctx.lineTo(60, 150);
            ctx.lineTo(120, 150);
            ctx.stroke();

            // the capacitor: a fixed plate and a plate that slides
            const f = (1 + last) / 1.5;

            ctx.strokeStyle = "rgba(255,214,102,1)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(60, 150);
            ctx.lineTo(60, 160);
            ctx.stroke();
            ctx.fillStyle = "rgba(255,214,102,.95)";
            ctx.fillRect(60, 156, 140, 5);

            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.fillRect(60 + 140 * (1 - f), 172, 140, 5);
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(60 + 140 * (1 - f) + 70, 177);
            ctx.lineTo(60 + 140 * (1 - f) + 70, 200);
            ctx.lineTo(60, 200);
            ctx.lineTo(60, 232);
            ctx.stroke();

            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.textAlign = "left";
            ctx.fillText("moving plate", 70, 192);
            ctx.fillText("C(x) = overlap", 70, 150);

            // the amplifier with its feedback element
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.beginPath();
            ctx.moveTo(60, 232);
            ctx.lineTo(60, 262);
            ctx.lineTo(100, 262);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(100, 242);
            ctx.lineTo(100, 322);
            ctx.lineTo(160, 282);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.fillText("−", 104, 265);
            ctx.fillText("+", 104, 306);

            ctx.beginPath();
            ctx.moveTo(100, 302);
            ctx.lineTo(80, 302);
            ctx.lineTo(80, 330);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(72, 330);
            ctx.lineTo(88, 330);
            ctx.moveTo(75, 334);
            ctx.lineTo(85, 334);
            ctx.stroke();

            // feedback from the output back to the input
            ctx.beginPath();
            ctx.moveTo(160, 282);
            ctx.lineTo(190, 282);
            ctx.moveTo(190, 282);
            ctx.lineTo(190, 240);
            ctx.lineTo(150, 240);
            ctx.moveTo(110, 240);
            ctx.lineTo(60, 240);
            ctx.stroke();

            if (ac) {

                ctx.fillStyle = "rgba(255,214,102,.95)";
                ctx.fillRect(110, 232, 4, 16);
                ctx.fillRect(146, 232, 4, 16);
                ctx.fillText("C", 124, 226);
                ctx.fillText("F", 136, 232);

            } else {

                ctx.beginPath();
                ctx.moveTo(110, 240);

                for (let k = 1; k <= 6; k++) {
                    ctx.lineTo(110 + k * 6.6, 240 + (k % 2 ? -7 : 7));
                }

                ctx.lineTo(150, 240);
                ctx.stroke();
                ctx.fillStyle = "rgba(255,214,102,.95)";
                ctx.fillText("R", 128, 226);
                ctx.fillText("F", 138, 232);
            }

            ctx.fillStyle = "rgba(255,105,120,1)";
            ctx.font = "bold 13px sans-serif";
            ctx.fillText("V", 200, 286);
            ctx.font = "9px sans-serif";
            ctx.fillText("o", 208, 289);

            // charge moving through the wire, faster and in the direction of the current
            const rate = lastI * 0.9;

            dots += rate * 0.02;

            ctx.fillStyle = "rgba(255,105,120,.95)";

            for (let k = 0; k < 6; k++) {

                const u = (((dots + k / 6) % 1) + 1) % 1;

                ctx.beginPath();
                ctx.arc(60, 90 + u * 56, 3.4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.font = "11px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(Math.abs(lastI) < 0.03 ? "current: none" : "current flowing", 10, 128);

            // ---- the graphs ----
            row("position of the plate, x(t)", 38, 62, "x", 50, "rgba(84,224,199,1)");
            row("capacitance, C(t) (relative to rest)", 120, 62, "cd", 50, "rgba(255,214,102,1)");
            row(ac ? "excitation voltage V(t) (alternating)" : "excitation voltage V(t) (constant)", 202, 62, "v", 24, "rgba(245,247,255,1)");
            row("current through the capacitor, i(t)", 284, 62, "i", ac ? 22 : 34, "rgba(255,105,120,1)");
            row(ac ? "output Vₒ(t): a carrier whose size follows position" : "output Vₒ(t): follows velocity", 366, 62, "o", ac ? 22 : 34, "rgba(170,230,255,1)");

            if (ac) {

                // the amplitude envelope of the output
                ctx.strokeStyle = "rgba(255,214,102,.9)";
                ctx.setLineDash([4, 3]);
                ctx.lineWidth = 1.4;

                [1, -1].forEach(function (sg) {

                    ctx.beginPath();

                    let first = true;

                    for (let k = 0; k < H.t.length; k++) {

                        const px = 250 + (H.t[k] - (T - WIN)) / WIN * 410;

                        if (px < 250) { continue; }

                        const py = 366 + 31 - sg * H.c[k] * 22;

                        if (first) { ctx.moveTo(px, py); first = false; } else { ctx.lineTo(px, py); }
                    }

                    ctx.stroke();
                });

                ctx.setLineDash([]);
            }

            ctx.fillStyle = "rgba(245,247,255,.7)";
            ctx.textAlign = "right";
            ctx.fillText("time →", 660, 440);
        }

        const anim = animate(root, function (dt) {

            const steps = 4;
            const h = dt / steps;

            for (let s = 0; s < steps; s++) {

                T += h;

                const p = sample(T, h);

                H.t.push(T);
                H.x.push(p.x);
                H.c.push(p.c);
                H.cd.push(p.c - 1);
                H.v.push(p.v);
                H.i.push(p.i);
                H.o.push(p.o);
            }

            while (H.t.length && H.t[0] < T - WIN - 0.2) {

                H.t.shift(); H.x.shift(); H.c.shift(); H.cd.shift(); H.v.shift(); H.i.shift(); H.o.shift();
            }

            if (state.exc === "dc" && state.move === "still" && T > 1.5 && !stillZero) {

                stillZero = true;
                F.reward("mems-readout-still", 5, "You saw why a still plate gives no DC output");
            }

            draw();
        });

        bindPause(root, anim);

        wire(root, state, defaults, function () {

            built = "";
            update();
        });

        update();
        draw();
    };


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="mems-"]').forEach(F.mount);

})();
