/* ========================================
   MEMS & MICROFABRICATION: PACKAGING

   Unit 29: why package, what makes it hard, the nine steps, wafer bonding.
   Unit 30: dicing and pick and place.
   Unit 31: wire bonding and flip-chip.
   Unit 32: encapsulation, an on-chip shell, testing.
   Unit 33: wafer-level packaging.

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
    const rect = M.rect;
    const label = M.label;
    const poly = M.poly;
    const pline = M.pline;
    const animate = M.animate;
    const quiz = M.quiz;
    const stepper = M.stepper;
    const orderGame = M.orderGame;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const C = {
        si: "rgba(170,179,207,.5)",
        glass: "rgba(120,180,255,.35)",
        gold: "rgba(255,214,102,.95)",
        poly: "rgba(84,224,199,.8)",
        sac: "rgba(255,105,120,.55)",
        nit: "rgba(255,170,90,.8)",
        polymer: "rgba(200,170,255,.6)",
        bg: "rgba(11,16,32,1)"
    };


    /* ======================================
       UNIT 29: PROTECT WHICH WAY?
    ====================================== */

    SIMS["mems-twojobs"] = quiz(
        "Game: protect the device, or the world?",
        ["Protect the device", "Protect the environment"],
        [
            { q: "Isolating the device from moisture and electrolytes.", a: "Protect the device", why: "Electrical and magnetic isolation keeps the world from interfering with the device." },
            { q: "Containing toxic products inside the package.", a: "Protect the environment", why: "Sometimes the world needs protecting from the device." },
            { q: "Mechanical protection from knocks and damage.", a: "Protect the device", why: "A shell keeps physical harm away from fragile structures." },
            { q: "Sterilizing a BioMEMS device.", a: "Protect the environment", why: "For BioMEMS, the package also protects whoever or whatever it touches." },
            { q: "Reducing host responses to an implanted device.", a: "Protect the environment", why: "The body should not react badly to the package." },
            { q: "Optical and thermal protection.", a: "Protect the device", why: "The package shields the device from light and heat it cannot take." },
            { q: "Chemical isolation from the surroundings.", a: "Protect the device", why: "Aggressive chemicals can attack a device, so the package keeps them out." }
        ],
        6,
        "mems-twojobs-done",
        "You sorted the two jobs of a package",
        "Packaging is not just a shield: sometimes the device needs protecting, and sometimes the world does.",
        "Ask who is being protected from whom. Hit Reset to try again."
    );


    /* ======================================
       UNIT 29: WHAT MAKES IT HARD
    ====================================== */

    SIMS["mems-hardmatch"] = quiz(
        "Game: which requirement is this?",
        ["Hermetic sealing", "Cost and size", "Electrical interconnection", "Mechanical interconnection", "Precision alignment"],
        [
            { q: "An accelerometer or resonator needs a vacuum or a compatible medium around it.", a: "Hermetic sealing", why: "Vacuum or media compatibility is what a hermetic seal provides." },
            { q: "The package must be cheap and have a small footprint.", a: "Cost and size", why: "Both must be low for a commercial product." },
            { q: "Low voltage drop, little cross-talk, and little capacitive loading on the signals.", a: "Electrical interconnection", why: "The connections have to carry signals cleanly." },
            { q: "Mount the die without adding undue stress to it.", a: "Mechanical interconnection", why: "A stressed die behaves differently from the one that was designed." },
            { q: "Optical parts must sit exactly where they are meant to be.", a: "Precision alignment", why: "Precision alignment is especially critical for optical MEMS." },
            { q: "Keep a sealed vacuum reference around a pressure sensor.", a: "Hermetic sealing", why: "Sealing is what holds the reference in place for the device's life." }
        ],
        5,
        "mems-hardmatch-done",
        "You matched the packaging requirements",
        "A great package satisfies all of these at once, and none of them are optional.",
        "There are five requirements, and they all have to be met at the same time. Hit Reset to try again."
    );


    /* ======================================
       UNIT 29: NINE STEPS FROM DIE TO SHIPPED CHIP
    ====================================== */

    SIMS["mems-pkgorder"] = orderGame(
        "Game: from die to shipped chip",
        [
            { n: "Wafer bonding", d: "Seal at the wafer level", why: "Sealing is done before the wafer is even diced." },
            { n: "Wafer sawing", d: "Dice the wafer", why: "The wafer is cut into individual die." },
            { n: "Pick and place", d: "Move each die", why: "Each die is lifted from the wafer and placed where it goes." },
            { n: "Die attach", d: "Fix the die to its substrate", why: "The die has to be held firmly before any wire touches it." },
            { n: "Wire bonding", d: "Connect the pads", why: "Wires can only be bonded to a die that is held in place." },
            { n: "Encapsulation", d: "Seal it in", why: "The connected die is protected from corrosion and damage." },
            { n: "Overmolding", d: "Mold the body", why: "The finished body is formed around the protected die." },
            { n: "Trimming", d: "Cut the leads free", why: "The leads are separated into their final shape." },
            { n: "Final testing", d: "Verify it works", why: "Only a finished, packaged chip is tested before it ships." }
        ],
        "mems-pkgorder-done",
        "You ordered all nine packaging steps",
        "Tap the nine steps in the order a die becomes a shipped chip.",
        "Every one of these steps happens after the silicon fabrication is complete."
    );


    /* ======================================
       UNIT 29: WAFER BONDING
    ====================================== */

    SIMS["mems-bonding"] = function (root) {

        const defaults = { mode: "anodic", temp: 300, volt: 600 };
        const state = { mode: "anodic", temp: 300, volt: 600 };

        root.innerHTML =
            head("Try it: bond two wafers") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="Two wafers coming together: direct bonding with heat alone, or anodic bonding of silicon to glass with heat and a high voltage, with ions in the glass drifting away from the interface"></canvas>' +
            '<div class="fd-stat-row">' + stat("Needed for this method", "need") + stat("Gap between wafers", "gap") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            seg("Method", "mode", [["direct", "Direct wafer bonding"], ["anodic", "Anodic bonding (silicon to glass)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Temperature (°C)", key: "temp", min: 100, max: 1300, step: 10, value: 300 }) +
            slider({ label: "Voltage (volts, anodic only)", key: "volt", min: 0, max: 1100, step: 50, value: 600 }) +
            "</div>" +
            '<p class="fd-sim-formula">Direct: polished wafers touch and form a stable bond at 800 to 1200 °C. Anodic: silicon to glass at 180 to 500 °C with 200 to 1000 volts applied. This is how absolute pressure sensors get their sealed vacuum reference, before the wafer is even diced.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(5);
        const ions = [];

        for (let i = 0; i < 26; i++) { ions.push({ x: 60 + rand() * 560, y: 190 + rand() * 60 }); }

        let p = 0;
        let t = 0;

        function status() {

            const direct = state.mode === "direct";

            if (direct) {

                if (state.temp < 800) { return { ok: false, msg: "Too cold: direct bonding needs 800 to 1200 °C" }; }
                if (state.temp > 1200) { return { ok: false, msg: "Hotter than the 800 to 1200 °C window" }; }

                return { ok: true, msg: "Silicon atoms form a stable bond across the interface" };
            }

            if (state.temp < 180) { return { ok: false, msg: "Too cold: anodic bonding needs 180 to 500 °C" }; }
            if (state.temp > 500) { return { ok: false, msg: "Too hot for anodic bonding (above 500 °C)" }; }
            if (state.volt < 200) { return { ok: false, msg: "Needs more voltage: 200 to 1000 V" }; }
            if (state.volt > 1000) { return { ok: false, msg: "More than the usual 1000 V" }; }

            return { ok: true, msg: "Ions leave the glass surface and pull the wafers tight" };
        }

        function update() {

            const s = status();
            const direct = state.mode === "direct";

            out(root, "need", direct ? "800 to 1200 °C" : "180 to 500 °C, 200 to 1000 V");
            setVal(root, "temp", state.temp + " °C");
            setVal(root, "volt", direct ? "not used" : state.volt + " V");

            const chip = root.querySelector('[data-out="chip"]');

            out(root, "verdict", s.msg);
            chip.textContent = s.ok ? "✓ Bonding" : "✕ Not bonding";
            chip.className = "fd-chip " + (s.ok ? "" : "rose");
        }

        function draw() {

            const s = status();
            const direct = state.mode === "direct";
            const gap = 26 * (1 - p);

            ctx.clearRect(0, 0, 680, 300);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 300);

            // top wafer (silicon)
            ctx.fillStyle = "rgba(170,179,207,.6)";
            ctx.fillRect(60, 70 + 26 - gap, 560, 40);
            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("polished silicon wafer", 340, 90 + 26 - gap);

            // bottom wafer
            ctx.fillStyle = direct ? "rgba(170,179,207,.6)" : "rgba(120,180,255,.4)";
            ctx.fillRect(60, 166, 560, 80);
            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.fillText(direct ? "polished silicon wafer" : "glass wafer", 340, 262);

            if (!direct) {

                // positive ions in the glass drift away from the interface when the field is on
                ctx.fillStyle = "rgba(255,214,102,.95)";

                ions.forEach(function (ion) {

                    const drift = s.ok ? Math.min(1, t * 0.5) : 0;
                    const y = 176 + ((ion.y - 190) * (1 - drift) + drift * 62) % 70;

                    ctx.beginPath();
                    ctx.arc(ion.x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                });

                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.textAlign = "left";
                ctx.fillText(s.ok ? "positive ions drift down, away from the interface" : "ions stay put without the right heat and voltage", 70, 290);

                // voltage
                ctx.textAlign = "center";
                ctx.fillStyle = "rgba(255,105,120,1)";
                ctx.fillText("+" + state.volt + " V", 340, 52);
                ctx.fillStyle = "rgba(84,224,199,1)";
                ctx.fillText("−", 340, 280);

            } else {

                ctx.fillStyle = "rgba(255,170,90,.95)";
                ctx.fillText("heat only: " + state.temp + " °C", 340, 52);
            }

            // bonds across the interface once closed
            if (p > 0.92) {

                ctx.strokeStyle = "rgba(84,224,199,.95)";
                ctx.lineWidth = 3;

                for (let x = 90; x < 620; x += 40) {

                    ctx.beginPath();
                    ctx.moveTo(x, 160);
                    ctx.lineTo(x, 172);
                    ctx.stroke();
                }
            }

            // the gap
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.textAlign = "right";
            ctx.fillText(gap < 1 ? "bonded" : "gap", 56, 160);

            out(root, "gap", gap < 1 ? "closed" : Math.round(gap) + " px");

            if (s.ok && p > 0.97) {
                F.reward("mems-bonding-" + state.mode, 10, "You bonded two wafers");
            }
        }

        animate(root, function (dt) {

            t += dt;

            const s = status();

            p += ((s.ok ? 1 : 0) - p) * Math.min(1, dt * 0.9);
            draw();
        });

        wire(root, state, defaults, function () {

            t = 0;
            update();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 30: DICING
    ====================================== */

    SIMS["mems-dicing"] = function (root) {

        const defaults = { grip: 5 };
        const state = { grip: 5 };
        const N = 8;

        root.innerHTML =
            head("Game: how sticky should the film be?") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="A row of die on a mylar film being cut by a diamond saw and then picked up. If the adhesive is too weak, die fly off during sawing. If it is too strong, they will not release and get damaged when picked"></canvas>' +
            '<div class="fd-stat-row">' + stat("Flew off while sawing", "lost") + stat("Damaged while picking", "dam") + stat("Picked cleanly", "good") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-run>✂️ Saw, then pick</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Adhesive strength on the mylar film", key: "grip", min: 1, max: 10, step: 1, value: 5 }) +
            "</div>" +
            '<p class="fd-sim-formula">The adhesive has to do two jobs: hold the die firmly during cutting, but stay mild enough to allow pick-and-place later. Laser cutting and diamond wire cutting are newer alternatives to traditional diamond sawing.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(17);
        const order = [];

        for (let i = 0; i < N; i++) { order.push(i); }

        for (let i = N - 1; i > 0; i--) {

            const j = Math.floor(rand() * (i + 1));
            const tmp = order[i];

            order[i] = order[j];
            order[j] = tmp;
        }

        let phase = 0;       // 0 idle, 1 sawing, 2 picking, 3 done
        let tt = 0;
        let lostSet = {};
        let damSet = {};

        function plan() {

            const lost = Math.round(N * clamp((4 - state.grip) / 3, 0, 1));
            const dam = Math.round(N * clamp((state.grip - 7) / 3, 0, 1));

            lostSet = {};
            damSet = {};

            for (let i = 0; i < lost; i++) { lostSet[order[i]] = true; }

            for (let i = 0; i < dam; i++) { damSet[order[N - 1 - i]] = true; }

            return { lost: lost, dam: dam };
        }

        function update() {

            const r = plan();

            setVal(root, "grip", state.grip + " of 10");

            if (phase === 3 || phase === 0) {

                out(root, "lost", phase === 3 ? r.lost : "-");
                out(root, "dam", phase === 3 ? r.dam : "-");
                out(root, "good", phase === 3 ? N - r.lost - r.dam : "-");
            }

            if (phase === 3) {

                if (r.lost === 0 && r.dam === 0) {

                    out(root, "verdict", "Strong enough to cut, mild enough to release");
                    F.reward("mems-dicing-good", 10, "You found the right adhesive strength");

                } else if (r.lost > 0) {

                    out(root, "verdict", "Too weak: die came loose while the saw cut");

                } else {

                    out(root, "verdict", "Too strong: the die would not let go and cracked when picked");
                }

            } else if (phase === 0) {

                out(root, "verdict", "Pick an adhesive strength, then run the saw");
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 300);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 300);

            const x0 = 50;
            const dw = 62;
            const gap = 14;
            const y = 170;

            // mylar film
            ctx.fillStyle = "rgba(200,170,255,.35)";
            ctx.fillRect(30, y + 36, 620, 14);
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("mylar film with a light adhesive", 340, y + 72);

            const sawX = x0 + (tt / 3.2) * (N * (dw + gap));

            for (let i = 0; i < N; i++) {

                const dx = x0 + i * (dw + gap);
                const cut = phase >= 1 && sawX > dx + dw + gap / 2 || phase >= 2;
                let yy = y;
                let xx = dx;
                let col = "rgba(84,224,199,.85)";
                let flown = false;

                if (lostSet[i] && cut) {

                    const f = phase === 1 ? clamp((sawX - (dx + dw)) / 60, 0, 1) : 1;

                    yy = y - 120 * f;
                    xx = dx + (i % 2 ? 40 : -40) * f;
                    flown = true;
                }

                if (phase >= 2 && damSet[i] && !lostSet[i]) {

                    const pickIdx = tt - 3.4;

                    if (phase === 3 || pickIdx > i * 0.3) { col = "rgba(255,105,120,.9)"; }
                }

                if (phase >= 2 && !damSet[i] && !lostSet[i]) {

                    const pickIdx = tt - 3.4;

                    if (phase === 3 || pickIdx > i * 0.3) { yy = y - 90; col = "rgba(84,224,199,.45)"; }
                }

                ctx.fillStyle = col;
                ctx.strokeStyle = "rgba(245,247,255,.7)";
                ctx.fillRect(xx, yy, dw, 34);
                ctx.strokeRect(xx, yy, dw, 34);

                if (damSet[i] && !lostSet[i] && (phase === 3 || (phase === 2 && tt - 3.4 > i * 0.3))) {

                    ctx.strokeStyle = "rgba(6,10,24,1)";
                    ctx.beginPath();
                    ctx.moveTo(xx + 10, yy);
                    ctx.lineTo(xx + 30, yy + 18);
                    ctx.lineTo(xx + 22, yy + 34);
                    ctx.stroke();
                }

                void flown;
            }

            // the saw blade
            if (phase === 1) {

                ctx.fillStyle = "rgba(245,247,255,.95)";
                ctx.beginPath();
                ctx.arc(sawX, y + 18, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(6,10,24,1)";
                ctx.beginPath();
                ctx.arc(sawX, y + 18, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.textAlign = "left";
            ctx.fillText(phase === 1 ? "diamond saw cutting" : (phase === 2 ? "picking up each die" : (phase === 3 ? "done" : "eight die, ready to cut")), 40, 30);
        }

        animate(root, function (dt) {

            if (phase === 1 || phase === 2) {

                tt += dt * 1.5;

                if (phase === 1 && tt >= 3.2) { phase = 2; }

                if (phase === 2 && tt >= 3.4 + N * 0.3 + 0.6) {

                    phase = 3;
                    update();
                }
            }

            draw();
        });

        root.querySelector("[data-run]").addEventListener("click", function () {

            plan();
            phase = 1;
            tt = 0;
            out(root, "verdict", "Cutting…");
        });

        wire(root, state, defaults, function () {

            phase = 0;
            tt = 0;
            update();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 30: PICK AND PLACE
    ====================================== */

    SIMS["mems-pickplace"] = function (root) {

        const defaults = { tool: "collet", force: 50 };
        const state = { tool: "collet", force: 50 };

        root.innerHTML =
            head("Game: pick up a fragile die") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="A pickup tool grips a die with a released, delicate structure on top, lifts it, and places it in a package. Too little grip drops it, too much crushes the released structure"></canvas>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-go>🤖 Pick and place</button></div>' +
            seg("Tool", "tool", [["collet", "Vacuum pickup"], ["self", "Self-assembly (gentler)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Grip strength", key: "force", min: 0, max: 100, step: 5, value: 50 }) +
            "</div>" +
            '<p class="fd-sim-formula">Pick and place mounts individual dies onto a lead-frame or into a package. For delicate, already-released structures like surface-micromachined accelerometers, this step can cause real damage. Self-assembly techniques are being explored as a gentler alternative.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let tt = -1;
        let result = "idle";

        function window2() {

            return state.tool === "collet" ? [35, 65] : [20, 85];
        }

        function outcome() {

            const w = window2();

            if (state.force < w[0]) { return "drop"; }
            if (state.force > w[1]) { return "crush"; }

            return "ok";
        }

        function update() {

            const w = window2();

            setVal(root, "force", state.force);

            const chip = root.querySelector('[data-out="chip"]');

            if (result === "idle") {

                out(root, "verdict", "Pick a grip, then run the robot");
                chip.textContent = state.tool === "collet" ? "safe window: " + w[0] + " to " + w[1] : "safe window: " + w[0] + " to " + w[1] + " (wider)";
                chip.className = "fd-chip gold";

            } else if (result === "ok") {

                out(root, "verdict", "Placed safely");
                chip.textContent = "✓ Delivered";
                chip.className = "fd-chip";

            } else if (result === "drop") {

                out(root, "verdict", "The grip was too weak: the die fell");
                chip.textContent = "✕ Dropped";
                chip.className = "fd-chip rose";

            } else {

                out(root, "verdict", "The grip was too strong: the released structure was crushed");
                chip.textContent = "✕ Damaged";
                chip.className = "fd-chip rose";
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 300);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 300);

            // film with the die on the left, package on the right
            ctx.fillStyle = "rgba(200,170,255,.35)";
            ctx.fillRect(40, 230, 200, 12);
            ctx.fillStyle = "rgba(170,179,207,.55)";
            ctx.fillRect(430, 220, 200, 22);
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("wafer film", 140, 262);
            ctx.fillText("package", 530, 262);

            const r = result === "idle" ? outcome() : result;
            let x = 140;
            let y = 210;
            let toolY = 60;
            const t = tt < 0 ? 0 : tt;

            if (tt >= 0) {

                if (t < 1) { toolY = 60 + 90 * t; }
                else if (t < 1.4) { toolY = 150; }
                else if (t < 2.4) { toolY = 150 - 90 * (t - 1.4); }
                else if (t < 3.6) { toolY = 60; }

                const carry = t > 1.4;

                if (carry && r !== "drop") {

                    const lift = clamp((t - 1.4) / 1, 0, 1);
                    const move = clamp((t - 2.4) / 1.2, 0, 1);

                    x = 140 + move * (530 - 140);
                    y = 210 - 90 * lift + move * 90;
                    toolY = 150 - 90 * lift + move * 90;
                } else if (carry && r === "drop") {

                    const fall = clamp((t - 1.5) / 0.8, 0, 1);

                    y = 210 - 30 * (1 - fall) + 40 * fall;
                    x = 140 + 30 * fall;
                    toolY = 150 - 90 * clamp((t - 1.4) / 1, 0, 1);
                }
            }

            // tool
            const toolX = tt >= 0 && t > 2.4 && r !== "drop" ? x : (tt >= 0 && t > 1.4 && r === "drop" ? 140 : 140);

            ctx.fillStyle = "rgba(170,179,207,.9)";
            ctx.fillRect(toolX - 6, 20, 12, toolY - 20);
            ctx.fillRect(toolX - 28, toolY - 4, 56, 8);

            // the die with its released beam on top
            ctx.fillStyle = "rgba(84,224,199,.85)";
            ctx.strokeStyle = "rgba(245,247,255,.8)";
            ctx.fillRect(x - 36, y, 72, 22);
            ctx.strokeRect(x - 36, y, 72, 22);

            ctx.fillStyle = r === "crush" && t > 1.0 ? "rgba(255,105,120,1)" : "rgba(255,214,102,.95)";

            if (r === "crush" && t > 1.0) {

                ctx.fillRect(x - 22, y - 6, 18, 6);
                ctx.fillRect(x + 4, y - 3, 18, 3);

            } else {

                ctx.fillRect(x - 24, y - 10, 48, 4);
                ctx.fillRect(x - 24, y - 6, 6, 6);
                ctx.fillRect(x + 18, y - 6, 6, 6);
            }

            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.font = "11px sans-serif";
            ctx.fillText("released beam on top", x, y - 16);
        }

        animate(root, function (dt) {

            if (tt >= 0) {

                tt += dt;

                if (tt > 4.2) {

                    tt = -1;
                    result = outcome();
                    update();

                    if (result === "ok") { F.reward("mems-pickplace-ok", 10, "You delivered a fragile die safely"); }
                }
            }

            draw();
        });

        root.querySelector("[data-go]").addEventListener("click", function () {

            result = "idle";
            tt = 0;
            update();
        });

        wire(root, state, defaults, function () {

            result = "idle";
            tt = -1;
            update();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 31: BALL-WEDGE WIRE BONDING
    ====================================== */

    SIMS["mems-wirebond"] = stepper({
        title: "Watch it: a wire bond, one step at a time",
        aria: "A fine gold wire bonded to a die pad as a ball, looped across, stitched onto a lead-frame post, and cut",
        viewBox: "0 0 340 190",
        interval: 2.8,
        formula: "Heat and pressure alone form a solid metal-to-metal bond, with no solder required. The most common method is thermocompression ball-wedge bonding, usually with gold wire.",
        rewardKey: "mems-wirebond-done",
        rewardMsg: "You watched a wire bond made",
        steps: [
            { t: "1 · Form the ball", tool: "Gold wire", text: "A ball is formed at the end of the wire, above the bond pad on the die." },
            { t: "2 · Press the ball onto the pad", tool: "Heat and pressure", text: "Heat and pressure bond the ball to the pad on the die, with no solder." },
            { t: "3 · Loop the wire", tool: "", text: "The bonding tool rises and moves across toward the lead-frame post, paying out the wire." },
            { t: "4 · Stitch onto the post", tool: "Heat and pressure", text: "The wire is pressed down onto the lead-frame post to make the second bond." },
            { t: "5 · Cut the wire", tool: "", text: "The wire is cut, and the tool is ready for the next pad." }
        ],
        draw: function (step) {

            const padX = 70;
            const padY = 120;
            const postX = 262;
            const postY = 128;

            let s = rect(30, 128, 120, 34, C.si, "rgba(245,247,255,.5)");

            s += rect(padX - 14, padY + 4, 28, 6, C.gold, "none");
            s += rect(210, postY + 6, 100, 24, "rgba(170,179,207,.7)", "rgba(245,247,255,.5)");
            s += label(padX, 178, "die and bond pad", 7, "middle", "var(--muted)");
            s += label(262, 178, "lead-frame post", 7, "middle", "var(--muted)");

            // tool position and wire per step
            let tx = padX;
            let ty = 80;

            if (step === 1) { ty = 104; }
            if (step === 2) { tx = 160; ty = 52; }
            if (step === 3) { tx = postX; ty = 112; }
            if (step === 4) { tx = postX + 20; ty = 60; }

            // the wire
            if (step === 0) {

                s += '<line x1="' + tx + '" y1="30" x2="' + tx + '" y2="' + (ty + 8) + '" style="stroke:rgba(255,214,102,.95);stroke-width:2"/>';
                s += '<circle cx="' + tx + '" cy="' + (ty + 14) + '" r="7" style="fill:rgba(255,214,102,1);stroke:rgba(6,10,24,.5)"/>';

            } else {

                const bx = padX;
                const by = padY + 2;

                s += '<ellipse cx="' + bx + '" cy="' + by + '" rx="11" ry="5" style="fill:rgba(255,214,102,1);stroke:rgba(6,10,24,.5)"/>';

                if (step === 1) {

                    s += '<line x1="' + tx + '" y1="30" x2="' + tx + '" y2="' + (ty + 6) + '" style="stroke:rgba(255,214,102,.95);stroke-width:2"/>';

                } else {

                    const ex = step === 2 ? tx : postX;
                    const ey = step === 2 ? ty + 8 : postY + 4;

                    s += '<path d="M' + bx + ',' + by + ' Q' + ((bx + ex) / 2) + ',38 ' + ex + ',' + ey + '" style="fill:none;stroke:rgba(255,214,102,.95);stroke-width:2"/>';

                    if (step < 4) { s += '<line x1="' + tx + '" y1="30" x2="' + tx + '" y2="' + (ty + 6) + '" style="stroke:rgba(255,214,102,.5);stroke-width:1.4;stroke-dasharray:3 3"/>'; }
                }
            }

            // the bonding tool
            s += poly([[tx - 7, 16], [tx + 7, 16], [tx + 3, ty], [tx - 3, ty]], "rgba(245,247,255,.9)", "rgba(6,10,24,.5)");

            if (step === 1 || step === 3) {

                s += '<path d="M' + (tx - 22) + ',' + (ty + 20) + ' l8,6 l-8,6" style="fill:none;stroke:rgba(255,105,120,1);stroke-width:2"/>';
                s += label(tx + 44, ty + 28, "heat + pressure", 7, "middle", "rgba(255,105,120,1)");
            }

            return s;
        }
    });


    /* ======================================
       UNIT 31: FLIP-CHIP ONTO GLASS
    ====================================== */

    SIMS["mems-flipsteps"] = stepper({
        title: "Watch it: flip-chip onto glass",
        aria: "A MEMS die with a movable plate is coated with photopolymer, flipped face down onto a glass substrate with matching bonding pads, bonded with solder bumps, and then released in an acid bath",
        viewBox: "0 0 340 190",
        interval: 3,
        formula: "No wires to route means less parasitic capacitance and less crosstalk. The photopolymer protects the moving structure right up until the final release step.",
        rewardKey: "mems-flipsteps-done",
        rewardMsg: "You watched a flip-chip bond",
        steps: [
            { t: "1 · Coat", tool: "Photopolymer", text: "A photopolymer is deposited on the movable polysilicon MEMS plate." },
            { t: "2 · Prepare the substrate", tool: "Matching pads", text: "A substrate is fabricated with bonding pads that match the die's bumps." },
            { t: "3 · Flip and bond", tool: "Solder reflow", text: "The MEMS device is flipped face down and bonded to the substrate through its solder bumps." },
            { t: "4 · Release", tool: "Acid bath", text: "The photopolymer is dissolved in an acid bath, freeing the movable plate." }
        ],
        draw: function (step) {

            let s = "";

            function die(y, flipped, polymer) {

                let d = rect(80, y, 180, 24, C.si, "rgba(245,247,255,.5)");
                const py = flipped ? y + 24 : y - 8;

                d += rect(130, py, 80, 8, C.poly, "none");

                if (polymer) { d += rect(124, flipped ? py : py - 8, 92, 16, C.polymer, "none"); }

                // solder bumps near the edges
                [96, 238].forEach(function (bx) {
                    d += '<circle cx="' + bx + '" cy="' + (flipped ? y + 28 : y - 4) + '" r="5" style="fill:rgba(255,214,102,.95);stroke:rgba(6,10,24,.5)"/>';
                });

                return d;
            }

            function substrate() {

                let b = rect(60, 140, 220, 20, C.glass, "rgba(245,247,255,.5)");

                [96, 238].forEach(function (bx) { b += rect(bx - 12, 134, 24, 6, C.gold, "none"); });

                return b;
            }

            if (step === 0) {

                s += die(96, false, true);
                s += label(170, 60, "the plate is coated to protect it", 7.5, "middle", "rgba(200,170,255,1)");
                s += label(170, 150, "movable plate under a polymer coat", 7, "middle", "var(--muted)");
            }

            if (step === 1) {

                s += substrate();
                s += label(170, 110, "matching bonding pads on the glass", 7.5, "middle", "rgba(255,214,102,1)");
            }

            if (step === 2) {

                s += substrate();
                s += die(88, true, true);
                s += '<path d="M150,60 l0,18 M170,60 l0,18 M190,60 l0,18" style="stroke:rgba(255,105,120,1);stroke-width:2"/>';
                s += label(170, 54, "locally heat to reflow the solder", 7.5, "middle", "rgba(255,105,120,1)");
            }

            if (step === 3) {

                s += substrate();
                s += die(88, true, false);
                s += label(170, 54, "acid bath dissolves the polymer", 7.5, "middle", "rgba(84,224,199,1)");
                s += label(170, 180, "the plate is free to move", 7, "middle", "var(--muted)");
            }

            return s;
        }
    });


    /* ======================================
       UNIT 32: THERMAL STRESS
    ====================================== */

    SIMS["mems-bimetal"] = function (root) {

        const defaults = { cte: 20, dt: 100 };
        const state = { cte: 20, dt: 100 };
        const DIE = 2.6;

        root.innerHTML =
            head("Try it: bonded materials that expand differently") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="A silicon die bonded to a molding material. When the temperature changes, the two expand by different amounts and the pair bends, building stress where they are joined"></canvas>' +
            '<div class="fd-stat-row">' + stat("Mismatch in expansion", "mis") + stat("Temperature change", "dt") + stat("Stress at the joint", "str") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Expansion of the encapsulant (ppm per °C). Silicon is 2.6", key: "cte", min: 2, max: 40, step: 1, value: 20 }) +
            slider({ label: "Temperature change (°C)", key: "dt", min: -100, max: 200, step: 10, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">Encapsulation and overmolding protect a device from corrosion and mechanical damage. The challenge is bimetallic action: thermal stress builds up when bonded materials have different coefficients of thermal expansion. Illustrative scale.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let bend = 0;

        function target() {

            return (state.cte - DIE) * state.dt * 0.00022;
        }

        function stress() {

            return Math.abs(state.cte - DIE) * Math.abs(state.dt);
        }

        function update() {

            const s = stress();

            out(root, "mis", Math.abs(state.cte - DIE).toFixed(1) + " ppm/°C");
            out(root, "dt", (state.dt >= 0 ? "+" : "") + state.dt + " °C");
            out(root, "str", s < 800 ? "low" : (s < 2400 ? "moderate" : "high"));
            setVal(root, "cte", state.cte + " ppm/°C");
            setVal(root, "dt", state.dt + " °C");

            const chip = root.querySelector('[data-out="chip"]');

            if (s < 800) {

                out(root, "verdict", "Well matched: the pair barely bends");
                chip.textContent = "✓ Low stress";
                chip.className = "fd-chip";
                F.reward("mems-bimetal-ok", 10, "You matched the expansion of two materials");

            } else if (s < 2400) {

                out(root, "verdict", "Noticeable bending builds stress at the joint");
                chip.textContent = "⚠ Moderate stress";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "A big mismatch and a big temperature swing: the joint is at risk");
                chip.textContent = "✕ Stress is high";
                chip.className = "fd-chip rose";
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 300);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 300);

            const L = 420;
            const x0 = 130;
            const baseY = 150;
            const th = 22;
            const kap = bend / L;

            function pt(u, off) {

                // a point a distance u along the strip, off to the side (positive is up)
                if (Math.abs(kap) < 1e-6) { return [x0 + u, baseY - off]; }

                const ph = kap * u;

                return [x0 + Math.sin(ph) / kap - off * Math.sin(ph), baseY - (1 - Math.cos(ph)) / kap - off * Math.cos(ph)];
            }

            function band(o0, o1, fill) {

                const pts = [];

                for (let i = 0; i <= 40; i++) { pts.push(pt(L * i / 40, o1)); }
                for (let i = 40; i >= 0; i--) { pts.push(pt(L * i / 40, o0)); }

                ctx.fillStyle = fill;
                ctx.strokeStyle = "rgba(245,247,255,.8)";
                ctx.lineWidth = 1.6;
                ctx.beginPath();

                pts.forEach(function (p, i) {

                    if (i === 0) { ctx.moveTo(p[0], p[1]); } else { ctx.lineTo(p[0], p[1]); }
                });

                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            band(0, th, "rgba(170,179,207,.75)");
            band(-th, 0, "rgba(255,170,90,.8)");

            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("silicon die (2.6 ppm/°C)", 40, 36);
            ctx.fillStyle = "rgba(255,170,90,1)";
            ctx.fillText("encapsulant (" + state.cte + " ppm/°C)", 40, 56);

            // stress marker at the joint
            const s = clamp(stress() / 3200, 0, 1);

            ctx.fillStyle = "rgba(255,105,120," + (0.2 + 0.8 * s).toFixed(2) + ")";
            ctx.fillRect(x0, 270, 420 * s, 10);
            ctx.strokeStyle = "rgba(245,247,255,.5)";
            ctx.strokeRect(x0, 270, 420, 10);
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.textAlign = "center";
            ctx.fillText("stress at the joint", 340, 296);
        }

        animate(root, function (dt) {

            bend += (clamp(target(), -0.6, 0.6) - bend) * Math.min(1, dt * 4);

            draw();
        });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    /* ======================================
       UNIT 32: AN ON-CHIP SHELL
    ====================================== */

    SIMS["mems-shell"] = stepper({
        title: "Watch it: grow a protective shell on the wafer",
        aria: "A cross-section built in five steps: a micromachined beam, a thick sacrificial layer over it, a thin sacrificial layer that defines etch channels, a nitride shell with etch holes, and then release and sealing",
        viewBox: "0 0 340 190",
        interval: 3,
        formula: "This builds a protective shell directly on the wafer, using the same deposition and release toolbox from earlier units.",
        rewardKey: "mems-shell-done",
        rewardMsg: "You built a shell on the wafer",
        steps: [
            { t: "1 · Base process", tool: "Surface micromachining", text: "A standard surface micromachined device, such as a beam, is built on the substrate." },
            { t: "2 · Thick PSG", tool: "LPCVD", text: "A thick sacrificial layer covers the device and defines the encapsulation region." },
            { t: "3 · Thin PSG", tool: "LPCVD", text: "A thin sacrificial layer extends outward and defines the etch channels." },
            { t: "4 · Nitride shell", tool: "LPCVD nitride", text: "A nitride shell is deposited over everything, with etch holes defined at the ends of the channels." },
            { t: "5 · Release and seal", tool: "HF, CO₂ dry, LPCVD", text: "The sacrificial PSG is removed, the wafer is dried with supercritical CO₂, and a global LPCVD layer seals the holes." }
        ],
        draw: function (step) {

            let s = rect(30, 150, 280, 24, C.si, "rgba(245,247,255,.4)");

            const dome = function (fill, stroke, inset) {

                return poly([[88 + inset, 150], [88 + inset, 100 + inset], [110 + inset, 84 + inset], [230 - inset, 84 + inset], [252 - inset, 100 + inset], [252 - inset, 150]], fill, stroke);
            };

            const beam = rect(128, 124, 84, 6, C.poly, "none") + rect(124, 124, 8, 26, C.poly, "none") + rect(208, 124, 8, 26, C.poly, "none");

            if (step === 0) {

                s += rect(100, 138, 140, 12, C.sac, "none");
                s += beam;
            }

            if (step >= 1 && step < 4) {

                s += dome(C.sac, "none", 0);
                s += beam;
            }

            if (step >= 2 && step < 4) {

                s += rect(252, 144, 56, 6, C.sac, "none");
                s += rect(32, 144, 56, 6, C.sac, "none");
            }

            if (step === 3) {

                s += dome("none", "rgba(255,170,90,1)", 0);
                s += poly([[84, 150], [84, 98], [108, 80], [232, 80], [256, 98], [256, 150], [248, 150], [248, 102], [228, 86], [112, 86], [92, 102], [92, 150]], C.nit, "none");
                s += rect(250, 138, 60, 6, C.nit, "none") + rect(30, 138, 60, 6, C.nit, "none");
                s += rect(250, 150, 60, 0, C.nit, "none");
                s += label(290, 128, "etch hole", 6.5, "middle", "var(--muted)");
            }

            if (step === 4) {

                s += poly([[84, 150], [84, 98], [108, 80], [232, 80], [256, 98], [256, 150], [248, 150], [248, 102], [228, 86], [112, 86], [92, 102], [92, 150]], C.nit, "none");
                s += beam;
                s += rect(250, 138, 60, 6, C.nit, "none") + rect(30, 138, 60, 6, C.nit, "none");
                s += '<circle cx="306" cy="141" r="5" style="fill:rgba(255,214,102,1)"/><circle cx="34" cy="141" r="5" style="fill:rgba(255,214,102,1)"/>';
                s += label(170, 112, "empty cavity: the beam is free", 7, "middle", "rgba(84,224,199,1)");
            }

            if (step === 3) { s += beam; }

            return s;
        }
    });


    /* ======================================
       UNIT 32: HOW IS EACH DEVICE TESTED?
    ====================================== */

    SIMS["mems-testmatch"] = quiz(
        "Game: how would you test it?",
        ["Pressure sensor", "Accelerometer", "Microfluidic device"],
        [
            { q: "A custom setup that controls voltage, temperature, and pressure.", a: "Pressure sensor", why: "Pressure sensors are tested with a setup controlling voltage, temperature, and pressure." },
            { q: "A shaker table with an AC stimulus, plus control samples.", a: "Accelerometer", why: "It is expensive, and control samples are required." },
            { q: "Usually tested at the component level, on valves and pumps, because full-system testing is too costly.", a: "Microfluidic device", why: "Testing the whole system is usually too expensive." },
            { q: "You have to shake it to prove it works.", a: "Accelerometer", why: "A shaker table gives it a known motion to respond to." },
            { q: "You change the pressure and watch the output.", a: "Pressure sensor", why: "Pressure is the stimulus it is built to sense." },
            { q: "You check the valves and the pumps one at a time.", a: "Microfluidic device", why: "Each device family needs its own custom way of proving the package did not break what the fabrication built." }
        ],
        6,
        "mems-testmatch-done",
        "You matched devices to their tests",
        "Every device family needs its own custom way of proving the package did not break what the fabrication built.",
        "Match the stimulus to the device: pressure, shaking, or flow. Hit Reset to try again."
    );


    /* ======================================
       UNIT 33: WAFER-LEVEL PACKAGING
    ====================================== */

    SIMS["mems-wlp"] = stepper({
        title: "Watch it: a package grown on the wafer",
        aria: "Four phases built on a wafer: a sacrificial layer forms a cavity over a moving part, a polymer cap covers it, heating decomposes the sacrificial layer to leave an air cavity, and a metal coating seals the package",
        viewBox: "0 0 340 190",
        interval: 3.4,
        extra: '<div class="fd-sim-controls">' + slider({ label: "Heating temperature in phase 3 (°C)", key: "temp", min: 100, max: 300, step: 5, value: 220 }) + "</div>",
        formula: "Instead of bonding a separate lid, this process grows the protective cavity right on top of the finished device. It was used to package the University of Michigan and Delphi polysilicon ring gyroscope.",
        rewardKey: "mems-wlp-done",
        rewardMsg: "You watched a wafer-level package form",
        steps: [
            { t: "Phase 1 · Cavity formation", tool: "Sacrificial layer, 1 to 100 µm", text: "A sacrificial layer forms a cavity over the MEMS device's moving parts. Nothing is free to move yet." },
            { t: "Phase 2 · Polymer cap", tool: "Photo-definable polymer", text: "A compliant polymer covers the device, and the bond pads are opened by patterning it." },
            { t: "Phase 3 · Decomposition", tool: "180 to 260 °C", text: "Heating decomposes the sacrificial polymer through the cap, leaving an air cavity. Try the temperature slider." },
            { t: "Phase 4 · Metallization", tool: "Conformal metal", text: "A conformal metal coating seals the package hermetically, with a thin insulator maintaining isolation." }
        ],
        wire: function (root, state, render) {

            state.temp = 220;

            root.querySelector('input[data-key="temp"]').addEventListener("input", function (e) {

                state.temp = parseFloat(e.target.value);
                state.playing = false;
                state.step = 2;

                const pb = root.querySelector("[data-play]");

                if (pb) { pb.textContent = "▶ Play"; }

                setVal(root, "temp", state.temp + " °C");
                render();
            });
        },
        draw: function (step, st) {

            const temp = st.temp == null ? 220 : st.temp;
            const prog = step >= 3 ? 1 : (step === 2 ? clamp((temp - 180) / 80, 0, 1) : 0);

            let s = rect(30, 150, 280, 24, C.si, "rgba(245,247,255,.4)");

            // the MEMS beam on posts
            const beam = rect(128, 124, 84, 6, C.poly, "none") + rect(124, 124, 8, 26, C.poly, "none") + rect(208, 124, 8, 26, C.poly, "none");

            // bond pads at the sides
            s += rect(40, 144, 30, 6, C.gold, "none") + rect(270, 144, 30, 6, C.gold, "none");

            const dome = function (fill, stroke) {

                return poly([[96, 150], [96, 104], [116, 86], [224, 86], [244, 104], [244, 150]], fill, stroke);
            };

            if (step === 0) { s += dome(C.sac, "none"); }

            if (step === 1) {

                s += dome(C.sac, "none");
                s += poly([[90, 150], [90, 100], [114, 76], [226, 76], [250, 100], [250, 150], [244, 150], [244, 104], [224, 86], [116, 86], [96, 104], [96, 150]], C.polymer, "none");
                s += label(170, 64, "pads opened by patterning the cap", 7, "middle", "var(--muted)");
            }

            if (step === 2) {

                if (prog < 1) { s += poly([[96, 150], [96, 104], [116, 86], [224, 86], [244, 104], [244, 150]], "rgba(255,105,120," + (0.55 * (1 - prog)).toFixed(2) + ")", "none"); }

                s += poly([[90, 150], [90, 100], [114, 76], [226, 76], [250, 100], [250, 150], [244, 150], [244, 104], [224, 86], [116, 86], [96, 104], [96, 150]], C.polymer, "none");

                s += label(170, 64, temp + " °C: " + (temp < 180 ? "too cool, the sacrificial polymer stays" : (temp > 260 ? "hotter than the usual range" : (prog >= 1 ? "the sacrificial layer is gone" : "decomposing"))), 7, "middle", temp < 180 ? "rgba(255,105,120,1)" : "rgba(255,214,102,1)");

            }

            if (step >= 3) {

                s += poly([[90, 150], [90, 100], [114, 76], [226, 76], [250, 100], [250, 150], [244, 150], [244, 104], [224, 86], [116, 86], [96, 104], [96, 150]], C.polymer, "none");
                s += poly([[86, 150], [86, 98], [112, 72], [228, 72], [254, 98], [254, 150], [250, 150], [250, 100], [226, 76], [114, 76], [90, 100], [90, 150]], "rgba(255,214,102,.9)", "none");
                s += label(170, 60, "metal seals the package: hermetic", 7, "middle", "rgba(255,214,102,1)");
            }

            s += beam;

            if (step >= 2 && prog >= 1) { s += label(170, 112, "air cavity", 7, "middle", "rgba(84,224,199,1)"); }

            return s;
        }
    });


    /* ======================================
       UNIT 33: FROM WAFER TO SHIPPED DEVICE
    ====================================== */

    SIMS["mems-order33"] = orderGame(
        "Game: from wafer to shipped device",
        [
            { n: "Fabricate", d: "Build the MEMS structure", why: "The device has to exist before it can be packaged." },
            { n: "Seal or bond", d: "Wafer-bond a cap, or build a package on the wafer", why: "Sealing happens at the wafer level, before dicing." },
            { n: "Dice", d: "Cut individual dies apart", why: "The sealed wafer is cut into die." },
            { n: "Attach", d: "Pick, place, and attach the die", why: "The die is placed on its substrate and fixed there." },
            { n: "Interconnect", d: "Wire-bond or flip-chip bond", why: "Electrical connections are made to a die that is held firmly." },
            { n: "Encapsulate", d: "Seal it against corrosion and damage", why: "The connected die is protected." },
            { n: "Test", d: "Verify it survived the entire process", why: "Only a finished package can prove it survived everything." }
        ],
        "mems-order33-done",
        "You shipped a device",
        "Tap the seven steps in the order a MEMS device goes from wafer to shipment.",
        "Fabrication builds the device once. Packaging is what has to work every single time it ships."
    );


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="mems-"]').forEach(F.mount);

})();
