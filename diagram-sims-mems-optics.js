/* ========================================
   MEMS & MICROFABRICATION: OPTICAL MEMS

   Unit 21: three ways to build a MEMS display.
   Unit 22: how a DMD pixel works, and how long it lasts.
   Unit 23: pull-in, and three ways to modulate light.
   Unit 24: optical switches.

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
    const stat = M.stat;
    const animate = M.animate;
    const quiz = M.quiz;
    const SIMS = F.SIMS;
    const slider = F.slider;


    /* ======================================
       UNIT 21: WHICH DISPLAY APPROACH?
    ====================================== */

    SIMS["mems-dispquiz"] = quiz(
        "Game: which kind of MEMS display?",
        ["Reflective", "Diffractive", "Interferometric"],
        [
            { q: "Texas Instruments' Digital Micromirror Device, with tiny tilting mirrors.", a: "Reflective", why: "Each mirror tilts toward or away from the projection lens." },
            { q: "The Grating Light Valve, with moving diffraction-grating ribbons.", a: "Diffractive", why: "Moving ribbons change how light is diffracted." },
            { q: "Qualcomm's mirasol, a resonant optical cavity.", a: "Interferometric", why: "A membrane changes the gap of the cavity, which changes the color reflected." },
            { q: "A pixel that changes color by changing the size of a thin gap.", a: "Interferometric", why: "The gap sets which wavelength reinforces itself." },
            { q: "Over a million mirrors, each flipped toward or away from the lens.", a: "Reflective", why: "This is a mirror that simply sends light somewhere else." },
            { q: "Ribbons that move only about a quarter of a wavelength.", a: "Diffractive", why: "A quarter-wavelength step is enough to switch the diffracted light." }
        ],
        5,
        "mems-dispquiz-done",
        "You matched the display approaches",
        "You can tell the three apart: tilt a mirror, move a grating, or change a cavity.",
        "Remember: mirrors reflect, gratings diffract, and cavities interfere. Hit Reset to try again."
    );


    /* ======================================
       UNIT 22: HOW A DMD PIXEL WORKS
    ====================================== */

    SIMS["mems-dmd"] = function (root) {

        const defaults = { g: 128, img: "ramp" };
        const state = { g: 128, img: "ramp" };

        root.innerHTML =
            head("Watch it: brightness from on and off") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="340" role="img" aria-label="Left: one mirror flipping between its two positions. Middle: an array of mirrors flipping for the picture. Right: the picture you see, with brightness set by how long each mirror stays on"></canvas>' +
            '<div class="fd-stat-row">' + stat("Mirror on for", "on") + stat("Tilt", "tilt") + stat("What you see", "see") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            seg("Picture", "img", [["ramp", "Gradient"], ["disc", "Disc"], ["checker", "Checkerboard"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Brightness of the single mirror's pixel", key: "g", min: 0, max: 255, step: 1, value: 128 }) +
            "</div>" +
            '<p class="fd-sim-formula">Each mirror has exactly two stable positions. A DMD is fundamentally a binary switch: brightness comes from how long a mirror stays on within a frame, not from tilting to in-between angles. Here a frame is slowed down to a couple of seconds.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const COLS = 28;
        const ROWS = 14;
        const T = 2.4;       // visual frame time
        const BITS = 8;

        let tt = 0;
        let anim = null;

        function pix(img, c, r) {

            if (img === "ramp") { return Math.round(c / (COLS - 1) * 255); }

            if (img === "disc") {

                const d = Math.hypot((c - (COLS - 1) / 2) / 1.0, (r - (ROWS - 1) / 2) * 1.3);

                return d < 5.5 ? 255 : (d < 7 ? 120 : 20);
            }

            return (c + r) % 2 ? 230 : 40;
        }

        // which bit-plane is showing now, most significant first
        function plane(t) {

            let acc = 0;

            for (let b = BITS - 1; b >= 0; b--) {

                const d = Math.pow(2, b) / 255 * T;

                if (t < acc + d) { return b; }

                acc += d;
            }

            return 0;
        }

        function isOn(g, b) { return ((g >> b) & 1) === 1; }

        function update() {

            out(root, "on", Math.round(state.g / 255 * 100) + "% of the frame");
            out(root, "tilt", "±12°");
            out(root, "see", state.g === 0 ? "black" : (state.g === 255 ? "full bright" : "gray " + Math.round(state.g / 255 * 100) + "%"));
            setVal(root, "g", state.g);

            out(root, "verdict", "Brightness is how long the mirror stays on in a frame");

            if (state.g > 0 && state.g < 255) {
                F.reward("mems-dmd-gray", 5, "You made gray from on and off");
            }
        }

        function draw() {

            const b = plane(tt % T);

            ctx.clearRect(0, 0, 680, 340);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 340);

            // single mirror
            const on = isOn(state.g, b);
            const ang = (on ? -12 : 12) * Math.PI / 180;
            const px = 110;
            const py = 210;

            ctx.strokeStyle = "rgba(170,179,207,.8)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(40, py + 18);
            ctx.lineTo(180, py + 18);
            ctx.stroke();
            ctx.fillStyle = "rgba(170,179,207,.6)";
            ctx.fillRect(100, py, 20, 18);

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(ang);
            ctx.fillStyle = "rgba(84,224,199,.9)";
            ctx.strokeStyle = "rgba(245,247,255,.95)";
            ctx.lineWidth = 2;
            ctx.fillRect(-62, -4, 124, 8);
            ctx.strokeRect(-62, -4, 124, 8);
            ctx.restore();

            // incoming light and the two possible outputs
            ctx.strokeStyle = "rgba(255,214,102,.95)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(10, 100);
            ctx.lineTo(px - 10, py - 12);
            ctx.stroke();

            ctx.strokeStyle = on ? "rgba(255,214,102,1)" : "rgba(255,105,120,.9)";
            ctx.beginPath();
            ctx.moveTo(px - 10, py - 12);
            ctx.lineTo(on ? 205 : 40, on ? 60 : 300);
            ctx.stroke();

            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = on ? "rgba(255,214,102,1)" : "rgba(255,105,120,1)";
            ctx.fillText(on ? "ON: toward the lens" : "OFF: away from the lens", 110, 330);
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.fillText("one mirror", 110, 18);

            // on-time timeline
            let x = 20;

            for (let bb = BITS - 1; bb >= 0; bb--) {

                const w = Math.pow(2, bb) / 255 * 180;

                ctx.fillStyle = isOn(state.g, bb) ? "rgba(255,214,102,.9)" : "rgba(170,179,207,.2)";
                ctx.fillRect(x, 262, w - 0.5, 10);
                x += w;
            }

            const playhead = 20 + (tt % T) / T * 180;

            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.fillRect(playhead - 1, 256, 2, 22);
            ctx.fillStyle = "rgba(245,247,255,.75)";
            ctx.font = "11px sans-serif";
            ctx.fillText("one frame: yellow is when this mirror is on", 110, 292);

            // the array
            const cell = 10;
            const ax = 215;
            const ay = 100;

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.fillText("an array of mirrors", ax + COLS * cell / 2, 82);

            for (let r = 0; r < ROWS; r++) {

                for (let c = 0; c < COLS; c++) {

                    const g = pix(state.img, c, r);
                    const m = isOn(g, b);

                    ctx.fillStyle = m ? "rgba(255,214,102,.95)" : "rgba(30,38,70,1)";
                    ctx.fillRect(ax + c * cell + 1, ay + r * cell + 1, cell - 2, cell - 2);
                }
            }

            ctx.fillStyle = "rgba(245,247,255,.75)";
            ctx.font = "11px sans-serif";
            ctx.fillText("bit-plane " + (BITS - b) + " of " + BITS + " (the longest first)", ax + COLS * cell / 2, ay + ROWS * cell + 22);

            // what you see: the time average of each mirror
            const sx = 540;
            const sc = 5;

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.fillText("what you see", sx + COLS * sc / 2, 82);

            for (let r = 0; r < ROWS; r++) {

                for (let c = 0; c < COLS; c++) {

                    const g = pix(state.img, c, r);

                    ctx.fillStyle = "rgb(" + g + "," + g + "," + g + ")";
                    ctx.fillRect(sx + c * sc, 100 + r * sc, sc, sc);
                }
            }

            // the brightness patch for the single mirror
            ctx.fillStyle = "rgb(" + state.g + "," + state.g + "," + state.g + ")";
            ctx.fillRect(sx, 200, 70, 40);
            ctx.strokeStyle = "rgba(245,247,255,.6)";
            ctx.strokeRect(sx, 200, 70, 40);
            ctx.fillStyle = "rgba(245,247,255,.75)";
            ctx.fillText("single mirror", sx + 35, 260);
        }

        anim = animate(root, function (dt) {

            tt += dt;
            draw();
        });

        M.bindPause(root, anim);

        wire(root, state, defaults, function () {

            update();
            draw();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 22: THE LIFETIME OF A MIRROR
    ====================================== */

    SIMS["mems-dmdlife"] = function (root) {

        const defaults = { rate: 5000, hours: 8 };
        const state = { rate: 5000, hours: 8 };

        root.innerHTML =
            head("Try it: 450 billion landings") +
            '<div class="fd-stat-row">' + stat("Landings per day", "perday") + stat("Time to reach 450 billion", "life") + "</div>" +
            '<div class="fd-bar" aria-hidden="true"><i data-bar style="width:0%;background:linear-gradient(90deg,rgba(84,224,199,.9),rgba(255,214,102,.9))"></i></div>' +
            '<div class="fd-bar-legend"><span>new</span><span data-out="years"></span><span>450 billion landings</span></div>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Landings per second for one mirror", key: "rate", min: 500, max: 20000, step: 500, value: 5000 }) +
            slider({ label: "Hours of use each day", key: "hours", min: 1, max: 24, step: 1, value: 8 }) +
            "</div>" +
            '<p class="fd-sim-formula">The requirement is 450 billion contacts per moving part, with every mirror made of aluminum and addressed by 5-volt CMOS. Illustrative: the landing rate depends on the picture being shown.</p>';

        const bar = root.querySelector("[data-bar]");

        function update() {

            const perDay = state.rate * 3600 * state.hours;
            const years = 450e9 / perDay / 365;

            out(root, "perday", perDay >= 1e9 ? (perDay / 1e9).toFixed(2) + " billion" : (perDay / 1e6).toFixed(0) + " million");
            out(root, "life", years >= 1 ? years.toFixed(1) + " years" : (years * 12).toFixed(1) + " months");
            out(root, "years", "");
            setVal(root, "rate", state.rate.toLocaleString());
            setVal(root, "hours", state.hours + " h");

            bar.style.width = clamp(1 / Math.max(years, 0.02) * 12, 4, 100) + "%";

            out(root, "verdict", years >= 10 ? "Decades of ordinary use: it was built to last" : (years >= 3 ? "Several years of heavy daily use" : "A very heavy duty cycle wears it out sooner"));

            if (years >= 10) {
                F.reward("mems-dmdlife-long", 5, "You saw how long a mirror lasts");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 23: PULL-IN
    ====================================== */

    SIMS["mems-torque"] = function (root) {

        const defaults = { v: 0 };
        const state = { v: 0 };
        const A = 3.674;      // so the pull-in voltage is about 6 V
        const TH0 = 18;
        const LAND = 12;

        root.innerHTML =
            head("Try it: pull in a mirror") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="340" role="img" aria-label="Left: a mirror tilting as a voltage rises, then snapping to its landing position. Right: electrostatic torque and mechanical restoring torque against angle, which stop crossing past the pull-in voltage"></canvas>' +
            '<div class="fd-stat-row">' + stat("Voltage", "volt") + stat("Mirror angle", "angle") + stat("Pull-in voltage", "pi") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Voltage on the electrode (V)", key: "v", min: 0, max: 8, step: 0.1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">The mirror settles where electrostatic torque equals the mechanical restoring torque. Past a critical voltage the balance fails and the mirror snaps to its landing position. To let go again, the voltage has to fall well below the pull-in value.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let theta = 0;
        let landed = false;

        const VPI = A * Math.sqrt(TH0 / 3) * (2 / 3);

        function vOf(th) { return A * Math.sqrt(th) * (1 - th / TH0); }

        function equilibrium(v) {

            // stable solution on the rising branch of V(theta), up to the pull-in angle
            let lo = 0;
            let hi = TH0 / 3;

            if (v >= VPI) { return null; }

            for (let i = 0; i < 40; i++) {

                const mid = (lo + hi) / 2;

                if (vOf(mid) < v) { lo = mid; } else { hi = mid; }
            }

            return (lo + hi) / 2;
        }

        function update() {

            const chip = root.querySelector('[data-out="chip"]');

            out(root, "volt", state.v.toFixed(1) + " V");
            out(root, "pi", "about " + VPI.toFixed(0) + " V");
            out(root, "angle", theta.toFixed(1) + "°");
            setVal(root, "v", state.v.toFixed(1) + " V");

            if (landed) {

                out(root, "verdict", "Snapped to the landing position and held there");
                chip.textContent = "landed";
                chip.className = "fd-chip rose";

            } else if (state.v === 0) {

                out(root, "verdict", "No voltage: the torsion beam keeps the mirror flat");
                chip.textContent = "flat";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "The two torques balance, and the mirror tilts a little");
                chip.textContent = "balanced";
                chip.className = "fd-chip";
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 340);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 340);

            // mirror
            const px = 150;
            const py = 190;

            ctx.fillStyle = "rgba(170,179,207,.5)";
            ctx.fillRect(40, py + 40, 220, 14);
            ctx.fillStyle = "rgba(255,214,102,.9)";
            ctx.fillRect(60, py + 34, 70, 6);
            ctx.fillRect(170, py + 34, 70, 6);
            ctx.fillStyle = "rgba(170,179,207,.8)";
            ctx.fillRect(px - 6, py, 12, 40);

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(-theta * Math.PI / 180);
            ctx.fillStyle = "rgba(84,224,199,.9)";
            ctx.strokeStyle = "rgba(245,247,255,.95)";
            ctx.lineWidth = 2;
            ctx.fillRect(-100, -6, 200, 10);
            ctx.strokeRect(-100, -6, 200, 10);
            ctx.restore();

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("mirror", px, py - 40);
            ctx.fillText("electrode", px, py + 74);
            ctx.fillText("torsion beam", px + 60, py + 20);

            // torques versus angle
            const x0 = 340;
            const x1 = 650;
            const y0 = 40;
            const y1 = 290;

            function X(th) { return x0 + th / 14 * (x1 - x0); }
            function Y(t) { return y1 - clamp(t, 0, 22) / 22 * (y1 - y0); }

            ctx.strokeStyle = "rgba(170,179,207,.6)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0, y1);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            ctx.fillStyle = "rgba(170,179,207,.9)";
            ctx.font = "11px sans-serif";
            ctx.fillText("mirror angle (degrees)", (x0 + x1) / 2, y1 + 30);

            [0, 4, 8, 12].forEach(function (th) { ctx.fillText(th + "°", X(th), y1 + 15); });

            ctx.textAlign = "left";
            ctx.fillText("torque", x0 + 4, y0 - 8);

            // landing angle
            ctx.strokeStyle = "rgba(255,105,120,.7)";
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(X(LAND), y0);
            ctx.lineTo(X(LAND), y1);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(255,105,120,1)";
            ctx.fillText("landing", X(LAND) + 4, y0 + 10);

            // restoring torque (a straight line)
            ctx.strokeStyle = "rgba(255,214,102,1)";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(X(0), Y(0));
            ctx.lineTo(X(14), Y(14));
            ctx.stroke();

            // electrostatic torque for this voltage
            ctx.strokeStyle = "rgba(84,224,199,1)";
            ctx.beginPath();

            for (let i = 0; i <= 60; i++) {

                const th = i / 60 * 14;
                const t = state.v * state.v / (A * A) / Math.pow(1 - th / TH0, 2);

                if (i === 0) { ctx.moveTo(X(th), Y(t)); } else { ctx.lineTo(X(th), Y(t)); }
            }

            ctx.stroke();

            ctx.font = "12px sans-serif";
            ctx.fillStyle = "rgba(255,214,102,1)";
            ctx.fillText("restoring torque", X(8.2), Y(8.2) + 18);
            ctx.fillStyle = "rgba(84,224,199,1)";
            ctx.fillText("electrostatic torque", X(0.4), y0 + 22);

            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.beginPath();
            ctx.arc(X(theta), Y(theta), 6, 0, Math.PI * 2);
            ctx.fill();
        }

        animate(root, function (dt) {

            const eq = equilibrium(state.v);

            if (landed) {

                if (state.v < 2) { landed = false; }

            } else if (eq === null) {

                landed = true;
            }

            const target = landed ? LAND : (eq === null ? LAND : eq);
            const rate = landed && theta < LAND - 0.2 ? 16 : 7;

            theta += (target - theta) * Math.min(1, dt * rate);

            if (landed && theta > LAND - 0.05) {
                F.reward("mems-torque-pullin", 10, "You pulled a mirror in");
            }

            update();
            draw();
        });

        wire(root, state, defaults, update);

        root.querySelector("[data-reset]").addEventListener("click", function () {

            landed = false;
            theta = 0;
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 23: THREE WAYS TO MODULATE LIGHT
    ====================================== */

    function wavelengthColor(nm) {

        let r = 0;
        let g = 0;
        let b = 0;

        if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
        else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
        else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
        else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
        else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
        else if (nm <= 700) { r = 1; }
        else { return [20, 20, 28]; }

        if (nm < 380) { return [20, 20, 28]; }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    SIMS["mems-modulate"] = function (root) {

        const defaults = { mode: "mirror", tilt: 12, ribbon: 0, gap: 250 };
        const state = { mode: "mirror", tilt: 12, ribbon: 0, gap: 250 };
        const seen = {};
        let built = "";

        root.innerHTML =
            head("Try it: mirror, grating, or cavity") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="Three ways to control light: a tilting mirror sends it toward or away from the lens, grating ribbons that move a quarter wavelength diffract it, and a cavity whose gap changes the color it reflects"></canvas>' +
            '<div class="fd-stat-row">' + stat("What moves", "what") + stat("How far", "far") + stat("Light output", "light") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Approach", "mode", [["mirror", "Reflection (mirror)"], ["grating", "Diffraction (grating)"], ["cavity", "Interference (cavity)"]]) +
            '<div class="fd-sim-controls" data-controls></div>' +
            '<p class="fd-sim-formula">The grating moves a thousand times less distance than the mirror, and switches a thousand times faster. A mirror is broadband, a grating depends on wavelength, and a cavity changes which color is reflected.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const controls = root.querySelector("[data-controls]");

        function build() {

            if (built === state.mode) { return; }

            built = state.mode;

            controls.innerHTML = state.mode === "mirror"
                ? slider({ label: "Mirror tilt (degrees)", key: "tilt", min: -12, max: 12, step: 1, value: state.tilt })
                : (state.mode === "grating" ? slider({ label: "Ribbon movement (nanometers)", key: "ribbon", min: 0, max: 275, step: 5, value: state.ribbon })
                    : slider({ label: "Cavity gap (nanometers)", key: "gap", min: 100, max: 400, step: 5, value: state.gap }));

            controls.querySelectorAll("input[type=range]").forEach(function (input) {

                input.addEventListener("input", function () {

                    state[input.dataset.key] = parseFloat(input.value);
                    update();
                });
            });
        }

        function update() {

            build();

            seen[state.mode] = true;

            if (state.mode === "mirror") {

                const on = state.tilt >= 6;

                out(root, "what", "a whole mirror");
                out(root, "far", state.tilt + "° tilt");
                out(root, "light", on ? "to the lens" : (state.tilt <= -6 ? "dumped" : "partly"));
                setVal(root, "tilt", state.tilt + "°");
                out(root, "verdict", on ? "Tilted toward the lens: the pixel is on" : (state.tilt <= -6 ? "Tilted away: the pixel is off" : "In between: but a DMD never stays here"));

            } else if (state.mode === "grating") {

                const I = Math.pow(Math.sin(2 * Math.PI * state.ribbon / 550), 2);

                out(root, "what", "alternate ribbons");
                out(root, "far", state.ribbon + " nm");
                out(root, "light", Math.round(I * 100) + "% diffracted");
                setVal(root, "ribbon", state.ribbon + " nm");
                out(root, "verdict", I > 0.95 ? "A quarter wavelength: the most light is diffracted toward the viewer" : "Moving the ribbons changes how much light is diffracted");

            } else {

                const nm = 2 * state.gap;
                const rgb = wavelengthColor(nm);

                out(root, "what", "a membrane");
                out(root, "far", state.gap + " nm gap");
                out(root, "light", nm >= 400 && nm <= 700 ? "color at " + nm + " nm" : "dark");
                setVal(root, "gap", state.gap + " nm");
                out(root, "verdict", nm >= 400 && nm <= 700 ? "The gap decides which color the cavity reflects" : "Outside visible light: the pixel looks dark");

                void rgb;
            }

            if (seen.mirror && seen.grating && seen.cavity) {
                F.reward("mems-modulate-all", 10, "You tried all three ways to modulate light");
            }

            draw();
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 300);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 300);

            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";

            if (state.mode === "mirror") {

                const px = 280;
                const py = 190;

                ctx.fillStyle = "rgba(170,179,207,.5)";
                ctx.fillRect(150, py + 14, 260, 12);
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(-state.tilt * Math.PI / 180);
                ctx.fillStyle = "rgba(84,224,199,.9)";
                ctx.strokeStyle = "rgba(245,247,255,.95)";
                ctx.lineWidth = 2;
                ctx.fillRect(-90, -5, 180, 10);
                ctx.strokeRect(-90, -5, 180, 10);
                ctx.restore();

                ctx.strokeStyle = "rgba(255,214,102,1)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(40, 40);
                ctx.lineTo(px, py - 8);
                ctx.stroke();

                // reflected ray: angle doubles with the tilt
                const ang = (-45 + 2 * state.tilt) * Math.PI / 180;
                const ex = px + Math.cos(ang) * 230;
                const ey = py - 8 + Math.sin(ang) * 230;
                const on = state.tilt >= 6;

                ctx.strokeStyle = on ? "rgba(255,214,102,1)" : "rgba(255,105,120,.9)";
                ctx.beginPath();
                ctx.moveTo(px, py - 8);
                ctx.lineTo(ex, ey);
                ctx.stroke();

                // lens and dump
                ctx.strokeStyle = "rgba(245,247,255,.9)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(540, 60, 10, 38, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.fillText("projection lens", 540, 112);
                ctx.fillStyle = "rgba(255,105,120,.9)";
                ctx.fillRect(520, 232, 80, 30);
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.fillText("light dump", 560, 280);

            } else if (state.mode === "grating") {

                const d = state.ribbon / 275 * 24;

                for (let i = 0; i < 6; i++) {

                    const moving = i % 2 === 1;
                    const x = 160 + i * 52;

                    ctx.fillStyle = moving ? "rgba(255,105,120,.9)" : "rgba(84,224,199,.9)";
                    ctx.fillRect(x, 180 + (moving ? d : 0), 44, 10);
                }

                ctx.fillStyle = "rgba(170,179,207,.5)";
                ctx.fillRect(150, 218, 340, 10);

                const I = Math.pow(Math.sin(2 * Math.PI * state.ribbon / 550), 2);

                ctx.lineWidth = 3;

                // incoming light
                ctx.strokeStyle = "rgba(255,214,102,1)";
                ctx.beginPath();
                ctx.moveTo(320, 30);
                ctx.lineTo(320, 170);
                ctx.stroke();

                // straight back and diffracted rays
                ctx.strokeStyle = "rgba(255,214,102," + (1 - I).toFixed(2) + ")";
                ctx.beginPath();
                ctx.moveTo(300, 170);
                ctx.lineTo(300, 40);
                ctx.stroke();

                [[-1, 0], [1, 0]].forEach(function (o) {

                    ctx.strokeStyle = "rgba(84,224,199," + I.toFixed(2) + ")";
                    ctx.beginPath();
                    ctx.moveTo(320, 170);
                    ctx.lineTo(320 + o[0] * 130, 60);
                    ctx.stroke();
                });

                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.fillText("ribbons: alternate ones move down", 320, 262);
                ctx.fillStyle = "rgba(84,224,199,.95)";
                ctx.fillText("diffracted light", 500, 70);

            } else {

                const nm = 2 * state.gap;
                const rgb = wavelengthColor(nm);
                const gp = state.gap / 400 * 70;

                // membrane above a thin-film mirror
                ctx.fillStyle = "rgba(245,247,255,.7)";
                ctx.fillRect(160, 120, 300, 8);
                ctx.fillStyle = "rgba(170,179,207,.6)";
                ctx.fillRect(160, 128 + gp, 300, 14);
                ctx.fillStyle = "rgba(255,255,255,.12)";
                ctx.fillRect(160, 128, 300, gp);

                ctx.strokeStyle = "rgba(255,214,102,1)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(300, 30);
                ctx.lineTo(300, 120);
                ctx.stroke();

                ctx.strokeStyle = "rgb(" + rgb.join(",") + ")";
                ctx.beginPath();
                ctx.moveTo(320, 120);
                ctx.lineTo(320, 30);
                ctx.stroke();

                // gap marker
                ctx.strokeStyle = "rgba(245,247,255,.85)";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(480, 128);
                ctx.lineTo(480, 128 + gp);
                ctx.stroke();
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.textAlign = "left";
                ctx.fillText("gap " + state.gap + " nm", 490, 128 + gp / 2 + 4);

                // the pixel as the eye sees it
                ctx.fillStyle = "rgb(" + rgb.join(",") + ")";
                ctx.fillRect(540, 190, 90, 60);
                ctx.strokeStyle = "rgba(245,247,255,.6)";
                ctx.strokeRect(540, 190, 90, 60);
                ctx.textAlign = "center";
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.fillText("the pixel", 585, 270);
                ctx.fillText("membrane over a thin-film mirror", 310, 210);
            }
        }

        wire(root, state, defaults, function () {

            built = "";
            update();
        });

        update();
    };


    /* ======================================
       UNIT 24: AN OPTICAL SWITCH
    ====================================== */

    SIMS["mems-switch"] = function (root) {

        const N = 4;
        const letters = ["A", "B", "C", "D"];
        const rand = mulberry(Date.now() % 100000);
        const state = { mirrors: [-1, -1, -1, -1], target: [], solved: false };

        root.innerHTML =
            head("Game: route the light") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="340" role="img" aria-label="A four by four grid of tiny mirrors. Light comes in from the left on four fibers, and a raised mirror turns a beam up toward one of four output fibers at the top"></canvas>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="goal"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<p class="fd-sim-note" data-out="note">Tap a square to raise a mirror there. A beam turns upward at the first raised mirror it meets.</p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-new>🎲 New puzzle</button></div>' +
            '<p class="fd-sim-formula">Optical switches redirect light itself, without ever converting it to electricity. This is a simple 2D switch: each mirror pops up into one beam path.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const GX = 190;
        const GY = 70;
        const CS = 62;

        function newPuzzle() {

            const a = [0, 1, 2, 3];

            for (let i = a.length - 1; i > 0; i--) {

                const j = Math.floor(rand() * (i + 1));
                const t = a[i];

                a[i] = a[j];
                a[j] = t;
            }

            state.target = a;
            state.mirrors = [-1, -1, -1, -1];
            state.solved = false;
        }

        function status() {

            const used = {};
            let clash = false;

            state.mirrors.forEach(function (c) {

                if (c >= 0) {

                    if (used[c]) { clash = true; }

                    used[c] = true;
                }
            });

            const ok = state.mirrors.every(function (c, r) { return c === state.target[r]; });

            return { clash: clash, ok: ok };
        }

        function update() {

            const st = status();

            out(root, "goal", state.target.map(function (c, r) { return "in " + (r + 1) + " → out " + letters[c]; }).join("   "));

            const chip = root.querySelector('[data-out="chip"]');

            if (st.ok) {

                chip.textContent = "✓ All routed";
                chip.className = "fd-chip";

                if (!state.solved) {

                    state.solved = true;
                    F.reward("mems-switch-solved", 15, "You routed every beam");
                }

            } else if (st.clash) {

                chip.textContent = "✕ Two beams for one output";
                chip.className = "fd-chip rose";

            } else {

                chip.textContent = state.mirrors.filter(function (c) { return c >= 0; }).length + " of 4 mirrors raised";
                chip.className = "fd-chip gold";
            }

            draw();
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 340);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 340);

            const target = state.target;
            const colUsed = {};

            // grid
            for (let r = 0; r < N; r++) {

                for (let c = 0; c < N; c++) {

                    ctx.fillStyle = "rgba(170,179,207,.12)";
                    ctx.strokeStyle = "rgba(170,179,207,.35)";
                    ctx.lineWidth = 1;
                    ctx.fillRect(GX + c * CS + 2, GY + r * CS + 2, CS - 4, CS - 4);
                    ctx.strokeRect(GX + c * CS + 2, GY + r * CS + 2, CS - 4, CS - 4);
                }
            }

            // beams
            state.mirrors.forEach(function (c, r) {

                const y = GY + r * CS + CS / 2;
                const hit = c >= 0;
                const ok = hit && c === target[r];

                ctx.strokeStyle = ok ? "rgba(84,224,199,1)" : "rgba(255,214,102,1)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(60, y);
                ctx.lineTo(hit ? GX + c * CS + CS / 2 : GX + N * CS + 60, y);

                if (hit) { ctx.lineTo(GX + c * CS + CS / 2, 40); }

                ctx.stroke();

                if (hit) { colUsed[c] = (colUsed[c] || 0) + 1; }
            });

            // mirrors
            state.mirrors.forEach(function (c, r) {

                if (c < 0) { return; }

                const cx = GX + c * CS + CS / 2;
                const cy = GY + r * CS + CS / 2;

                ctx.strokeStyle = "rgba(245,247,255,1)";
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(cx - 16, cy + 16);
                ctx.lineTo(cx + 16, cy - 16);
                ctx.stroke();
            });

            // labels
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "right";
            ctx.fillStyle = "rgba(245,247,255,.9)";

            for (let r = 0; r < N; r++) { ctx.fillText("in " + (r + 1), 54, GY + r * CS + CS / 2 + 4); }

            ctx.textAlign = "center";

            for (let c = 0; c < N; c++) {

                ctx.fillStyle = colUsed[c] > 1 ? "rgba(255,105,120,1)" : "rgba(245,247,255,.9)";
                ctx.fillText("out " + letters[c], GX + c * CS + CS / 2, 30);
            }

            ctx.fillStyle = "rgba(245,247,255,.7)";
            ctx.font = "11px sans-serif";
            ctx.fillText("a beam with no mirror in its row passes straight through and is lost", GX + N * CS / 2, 336);
        }

        canvas.addEventListener("click", function (e) {

            const rc = canvas.getBoundingClientRect();
            const px = (e.clientX - rc.left) * 680 / rc.width;
            const py = (e.clientY - rc.top) * 340 / rc.height;
            const c = Math.floor((px - GX) / CS);
            const r = Math.floor((py - GY) / CS);

            if (c < 0 || c >= N || r < 0 || r >= N) { return; }

            state.mirrors[r] = state.mirrors[r] === c ? -1 : c;
            update();
        });

        root.querySelector("[data-new]").addEventListener("click", function () {

            newPuzzle();
            update();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.mirrors = [-1, -1, -1, -1];
            state.solved = false;
            update();
        });

        newPuzzle();
        update();
    };


    /* ======================================
       UNIT 22: BUILDING A DMD PIXEL
    ====================================== */

    SIMS["mems-dmdfab"] = M.stepper({
        title: "Watch it: how a DMD pixel is built",
        aria: "A cross-section of one micromirror pixel built in layers on top of a CMOS memory wafer: address electrodes, a first sacrificial spacer, the hinge and support layer, a second spacer, the mirror layer, a dry-etch release, a wafer-level test, die separation, and an optical hermetic package",
        viewBox: "20 46 300 138",
        interval: 3.4,
        formula: "The same deposit-pattern-release sequence you know from earlier units, built on aluminum instead of polysilicon. Sputtering at low temperature matters because the CMOS memory is already underneath. Layer details are simplified.",
        rewardKey: "mems-dmdfab-done",
        rewardMsg: "You followed a DMD pixel from wafer to package",
        steps: [
            { t: "1 · Start with the CMOS memory", tool: "Standard CMOS", text: "Each mirror sits on top of a memory cell. The address electrodes and the landing pads are on the surface. Everything mechanical is built above the electronics." },
            { t: "2 · First sacrificial layer", tool: "Organic spacer", text: "An organic spacer is laid over the electrodes. A hole is patterned in it where the hinge will be anchored to the substrate." },
            { t: "3 · Hinge and support layer", tool: "Low-temperature sputter + plasma etch", text: "Aluminum is sputtered at low temperature, which the CMOS underneath can survive, then patterned with a plasma etch into the torsion beam and the H-shaped support." },
            { t: "4 · Second sacrificial layer", tool: "Organic spacer", text: "A second spacer is added over the support. A hole opens at its center where the central post will stand." },
            { t: "5 · Mirror layer", tool: "Low-temperature sputter + plasma etch", text: "Aluminum fills the hole to make the central post and covers the spacer as the mirror plate, which is then patterned." },
            { t: "6 · Release", tool: "Dry etch, at the wafer level", text: "The organic spacers are dry-etched away. The mirror is now suspended on its post and hinge, free to tilt, and still on the wafer." },
            { t: "7 · Test on the wafer", tool: "High-speed electro-optical", text: "Every mirror is flipped and checked optically before the wafer is cut. A voltage on one address electrode pulls the mirror until its tip lands." },
            { t: "8 · Die separation", tool: "After the spacers are gone", text: "Only now is the wafer cut into individual die. The delicate released mirrors are not exposed to the saw until they are protected in a package." },
            { t: "9 · Package", tool: "Optical, hermetic, thermal vias", text: "The die goes into a sealed package with a window for light, and thermal vias carry heat away from the mirrors." }
        ],
        draw: function (step, st) {

            const AL = "rgba(190,210,255,.95)";
            const SP = "rgba(255,105,120,.5)";
            const SUB = "rgba(170,179,207,.5)";
            const CM = "rgba(84,224,199,.55)";
            const GOLD = "rgba(255,214,102,.95)";

            function r(x, y, w, h, f, s2) {

                return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:' + f + ";stroke:" + (s2 || "none") + ';stroke-width:1"/>';
            }

            function t(x, y, text, size, fill) {

                return '<text x="' + x + '" y="' + y + '" text-anchor="middle" style="font-size:' + (size || 7) + "px;fill:" + (fill || "var(--muted)") + '">' + text + "</text>";
            }

            // one pixel, drawn at a given tilt about the hinge
            function pixel(layersUpTo, tilt, withSpacers, spacerFade) {

                let g = "";
                const px = 170;
                const py = 127;

                if (withSpacers) {

                    g += r(40, 130, 220, 14, "rgba(255,105,120," + (0.5 * spacerFade).toFixed(2) + ")", "none");

                    if (layersUpTo >= 4) { g += r(70, 90, 200 - 20, 34, "rgba(255,105,120," + (0.5 * spacerFade).toFixed(2) + ")", "none"); }
                }

                g += '<g transform="rotate(' + tilt + " " + px + " " + py + ')">';

                if (layersUpTo >= 3) { g += r(100, 124, 140, 6, AL, "none"); }
                if (layersUpTo >= 5) { g += r(165, 90, 10, 34, AL, "none") + r(70, 84, 200, 6, AL, "rgba(6,10,24,.4)"); }

                g += "</g>";

                // hinge post that stays on the substrate
                if (layersUpTo >= 3) { g += r(166, 127, 8, 23, AL, "none"); }

                return g;
            }

            let s = "";

            // the CMOS memory wafer
            function wafer() {

                let w = r(30, 150, 280, 26, SUB, "rgba(245,247,255,.4)");

                w += r(84, 158, 36, 12, CM, "rgba(245,247,255,.4)") + r(220, 158, 36, 12, CM, "rgba(245,247,255,.4)");
                w += t(102, 168, "memory", 6, "rgba(6,10,24,.85)") + t(238, 168, "memory", 6, "rgba(6,10,24,.85)");

                // address electrodes and landing pads
                w += r(112, 144, 38, 6, GOLD, "none") + r(190, 144, 38, 6, GOLD, "none");
                w += r(98, 144, 12, 6, "rgba(245,247,255,.8)", "none") + r(230, 144, 12, 6, "rgba(245,247,255,.8)", "none");

                return w;
            }

            if (step <= 6) {

                s += wafer();
            }

            if (step === 0) {

                s += t(130, 138, "address electrode", 6.5, GOLD);
                s += t(170, 118, "everything mechanical will be built above the electronics", 7.5, "rgba(84,224,199,1)");
                s += t(104, 183, "landing pad", 6, "var(--muted)");
            }

            if (step === 1) {

                s += r(40, 130, 126, 14, SP, "none") + r(174, 130, 86, 14, SP, "none");
                s += t(170, 118, "organic spacer, with a hole for the hinge post", 7.5, "rgba(255,105,120,1)");
            }

            if (step >= 2 && step <= 5) {

                const lyr = step === 2 ? 3 : (step === 3 ? 3 : 5);
                const l2 = step >= 3;

                s += r(40, 130, 220, 14, SP, "none");

                if (l2) {
                    s += r(100, 90, 140, 34, SP, "none");
                }

                if (step === 3) { s += r(165, 90, 10, 34, "rgba(11,16,32,1)", "none"); }

                s += pixel(step >= 4 ? 5 : 3, 0, false, 1);

                if (step === 2) { s += t(170, 114, "torsion beam and H-shaped support, patterned by plasma etch", 7.5, "rgba(190,210,255,1)"); }
                if (step === 3) { s += t(170, 74, "hole for the central post", 7.5, "rgba(255,105,120,1)"); }
                if (step === 4) { s += t(170, 74, "mirror layer: central post and mirror plate", 7.5, "rgba(190,210,255,1)"); }
            }

            if (step === 2) {

                // the support layer only; no second spacer yet
                s = s.replace("", "");
            }

            if (step === 5) {

                const p = clamp(st.t / 2.4, 0, 1);

                // spacers fade as the dry etch consumes them
                s = wafer();
                s += r(40, 130, 220, 14, "rgba(255,105,120," + (0.5 * (1 - p)).toFixed(2) + ")", "none");
                s += r(100, 90, 140, 34, "rgba(255,105,120," + (0.5 * (1 - p)).toFixed(2) + ")", "none");
                s += pixel(5, 0, false, 1);

                for (let k = 0; k < 14; k++) {

                    const dx = 50 + (k * 37 + st.anim * 60) % 220;
                    const dy = 60 + (k * 23 + st.anim * 40) % 70;

                    s += '<circle cx="' + dx.toFixed(1) + '" cy="' + dy.toFixed(1) + '" r="1.6" style="fill:rgba(255,214,102,' + (0.8 * (1 - p)).toFixed(2) + ')"/>';
                }

                s += t(170, 56, p < 1 ? "dry etch removes the organic spacers" : "released: free to tilt", 7.5, p < 1 ? "rgba(255,214,102,1)" : "rgba(84,224,199,1)");
            }

            if (step === 6) {

                const tilt = Math.sin(st.anim * 3) >= 0 ? 12 : -12;
                const side = tilt > 0;

                s = wafer();
                s += r(side ? 190 : 112, 144, 38, 6, "rgba(255,105,120,1)", "none");
                s += pixel(5, tilt, false, 1);
                s += t(170, 56, "flipping at high speed, tip landing each time", 7.5, "rgba(84,224,199,1)");
                s += '<line x1="40" y1="30" x2="40" y2="130" style="stroke:rgba(255,214,102,.9);stroke-width:2"/><circle cx="40" cy="132" r="3" style="fill:rgba(255,214,102,1)"/>';
                s += t(60, 28, "probe", 7, "rgba(255,214,102,1)");
            }

            if (step === 7) {

                // a strip of released die on the wafer, cut apart by a saw
                const kerf = [110, 200];

                s += r(30, 140, 280, 30, SUB, "rgba(245,247,255,.4)");

                [[40, 110], [120, 200], [210, 300]].forEach(function (d) {

                    s += r(d[0], 130, d[1] - d[0] - 8, 10, "rgba(84,224,199,.7)", "none");
                    s += r(d[0] + 8, 110, d[1] - d[0] - 24, 4, AL, "none");
                    s += r(d[0] + (d[1] - d[0]) / 2 - 8, 114, 4, 16, AL, "none");
                });

                kerf.forEach(function (k, i) {

                    const down = Math.min(1, st.t / 2.6) * 30;

                    s += r(k - 5, 118 + down * 0, 10, 52, "rgba(6,10,24,.9)", "none");
                    s += '<circle cx="' + k + '" cy="' + (140 - 22 + down * 0.4) + '" r="16" style="fill:rgba(245,247,255,.9);stroke:rgba(6,10,24,.6)"/>';
                });

                s += t(170, 56, "the wafer is cut into individual die", 7.5, "rgba(245,247,255,1)");
                s += t(170, 181, "mirrors are already released, so they are cut last", 7, "var(--muted)");
            }

            if (step === 8) {

                // a sealed package: ceramic body, die, window, thermal vias
                s += r(70, 130, 200, 30, "rgba(170,179,207,.6)", "rgba(245,247,255,.5)");
                s += r(70, 90, 8, 40, "rgba(170,179,207,.6)", "none") + r(262, 90, 8, 40, "rgba(170,179,207,.6)", "none");
                s += r(120, 124, 100, 8, "rgba(84,224,199,.75)", "none");
                s += r(135, 114, 70, 3, AL, "none");
                s += r(66, 84, 208, 8, "rgba(120,180,255,.35)", "rgba(245,247,255,.8)");
                s += t(170, 74, "glass window lets the light in and out", 7.5, "rgba(190,210,255,1)");

                [100, 140, 180, 220, 245].forEach(function (x) {
                    s += '<line x1="' + x + '" y1="132" x2="' + x + '" y2="172" style="stroke:rgba(255,214,102,.95);stroke-width:2.4"/>';
                });

                s += t(170, 181, "thermal vias carry heat away", 7, "rgba(255,214,102,1)");
                s += t(170, 104, "sealed: hermetic", 7, "var(--muted)");
            }

            return s;
        }
    });


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="mems-"]').forEach(F.mount);

})();
