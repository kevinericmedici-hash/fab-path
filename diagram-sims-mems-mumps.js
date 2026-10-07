/* ========================================
   MEMS & MICROFABRICATION: THE POLYMUMPS PROCESS

   Unit 13: sharing a wafer, which MUMPs process.
   Unit 14: dimples and anchors.
   Unit 15: the release.
   Unit 16: why the order cannot change, the whole stack.

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
    const legend = M.legend;
    const animate = M.animate;
    const quiz = M.quiz;
    const stepper = M.stepper;
    const orderGame = M.orderGame;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const COL = {
        si: "rgba(170,179,207,.45)",
        nit: "rgba(255,170,90,.7)",
        poly0: "rgba(200,205,225,.75)",
        psg: "rgba(255,105,120,.55)",
        poly1: "rgba(84,224,199,.75)",
        poly2: "rgba(120,180,255,.75)",
        metal: "rgba(255,214,102,.9)",
        bg: "rgba(11,16,32,1)"
    };


    /* ======================================
       UNIT 13: SHARING A WAFER
    ====================================== */

    SIMS["mems-tiles"] = function (root) {

        const defaults = { sold: 12, weeks: 0 };
        const state = { sold: 12, weeks: 0 };

        root.innerHTML =
            head("Try it: buy a tile on a shared wafer") +
            art("0 0 340 200", "A round wafer divided into one-centimeter tiles, one of them yours and others sold to other designers, beside the fifteen chips you receive after the run") +
            '<div class="fd-stat-row">' + stat("Designs on the run", "users") + stat("Your share of the run cost", "share") + stat("Status", "status") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Other designers sharing the wafer", key: "sold", min: 0, max: 40, step: 1, value: 12 }) +
            slider({ label: "Weeks since you submitted your design", key: "weeks", min: 0, max: 12, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">You reserve a 1 cm × 1 cm tile, submit a design that follows the foundry rules, wait 8 to 12 weeks, and receive 15 identical chips. You do not need your own fab.</p>';

        const svg = root.querySelector("svg");
        const rand = mulberry(8);

        // tiles inside the wafer circle, nearest the middle first
        const cells = [];
        const cs = 17;
        const cx = 100;
        const cy = 100;

        for (let r = -5; r <= 5; r++) {

            for (let c = -5; c <= 5; c++) {

                const x = cx + c * cs;
                const y = cy + r * cs;

                if (Math.hypot(c * cs, r * cs) < 80) {
                    cells.push({ x: x, y: y, d: Math.hypot(c, r) + rand() * 1.2, hue: Math.floor(rand() * 360) });
                }
            }
        }

        cells.sort(function (a, b) { return a.d - b.d; });

        const total = cells.length;

        function update() {

            const n = Math.min(state.sold, total - 1);
            const users = n + 1;

            let s = '<circle cx="' + cx + '" cy="' + cy + '" r="88" style="fill:rgba(170,179,207,.2);stroke:rgba(245,247,255,.5);stroke-width:1.5"/>';

            cells.forEach(function (c, i) {

                let fill = "rgba(245,247,255,.07)";
                let stroke = "rgba(245,247,255,.2)";

                if (i === 0) {

                    fill = "rgba(84,224,199,.9)";
                    stroke = "rgba(245,247,255,1)";

                } else if (i <= n) {

                    fill = "hsla(" + c.hue + ",70%,60%,.65)";
                    stroke = "rgba(245,247,255,.4)";
                }

                s += rect((c.x - cs / 2 + 1).toFixed(1), (c.y - cs / 2 + 1).toFixed(1), cs - 2, cs - 2, fill, stroke);
            });

            s += label(cx, 196, "your tile is the bright one in the middle", 6.5, "middle", "var(--muted)");

            // the chips you get
            const got = state.weeks >= 8 ? Math.round(15 * clamp((state.weeks - 8) / 4, 0, 1) + (state.weeks === 12 ? 0 : 0)) : 0;

            s += label(262, 30, "your chips", 7.5, "middle");

            for (let i = 0; i < 15; i++) {

                const x = 220 + (i % 5) * 18;
                const y = 44 + Math.floor(i / 5) * 18;
                const have = i < got;

                s += rect(x, y, 14, 14, have ? "rgba(84,224,199,.85)" : "rgba(245,247,255,.07)", have ? "rgba(245,247,255,.9)" : "rgba(245,247,255,.25)");
            }

            s += label(262, 112, got + " of 15", 8, "middle", got === 15 ? "rgba(84,224,199,1)" : "var(--muted)");

            svg.innerHTML = s;

            out(root, "users", users);
            out(root, "share", users === 1 ? "all of it" : "about 1 / " + users);
            setVal(root, "sold", n);
            setVal(root, "weeks", state.weeks + " wk");

            let status;

            if (state.weeks === 0) { status = "Design submitted"; }
            else if (state.weeks < 8) { status = "In the foundry"; }
            else if (state.weeks < 12) { status = "Run finishing"; }
            else { status = "Chips received"; }

            out(root, "status", status);

            out(root, "verdict", n >= 20 ? "Many designers share the cost, so prototyping stays affordable" : (n === 0 ? "Alone on the wafer, you would pay for the whole run" : "Sharing the wafer spreads the cost"));

            if (n >= 20 && state.weeks === 12) {
                F.reward("mems-tiles-done", 10, "You shared a wafer and got your chips");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 13: WHICH MUMPS PROCESS?
    ====================================== */

    SIMS["mems-family"] = quiz(
        "Game: which MUMPs process?",
        ["PolyMUMPs", "SOIMUMPs", "PiezoMUMPs", "MetalMUMPs"],
        [
            { q: "A three-layer polysilicon surface micromachining process, the most popular of the four.", a: "PolyMUMPs", why: "PolyMUMPs is the one most universities teach MEMS design with." },
            { q: "Built on a silicon-on-insulator wafer instead of deposited polysilicon layers.", a: "SOIMUMPs", why: "The structure comes from the wafer's own silicon device layer." },
            { q: "Adds a piezoelectric material for sensing and actuation.", a: "PiezoMUMPs", why: "A piezoelectric film turns force into signal, and signal into force." },
            { q: "Uses an electroplated metal structural layer instead of polysilicon.", a: "MetalMUMPs", why: "The mechanical structure is plated metal." },
            { q: "You need Poly0, Poly1, and Poly2 to build an electrostatic micromotor.", a: "PolyMUMPs", why: "Three polysilicon layers are exactly what PolyMUMPs provides." },
            { q: "A resonator that has to be driven and sensed with a piezoelectric film.", a: "PiezoMUMPs", why: "Piezoelectric sensing and actuation is that process's addition." }
        ],
        5,
        "mems-family-done",
        "You matched the MUMPs family",
        "You know the family: Poly for polysilicon, SOI for silicon-on-insulator, Piezo for piezoelectric, and Metal for plated metal.",
        "Each name tells you the extra ingredient: poly, SOI wafer, piezo film, or plated metal. Hit Reset to try again."
    );


    /* ======================================
       UNIT 14: DIMPLES AND ANCHORS
    ====================================== */

    SIMS["mems-anchor"] = function (root) {

        const defaults = { dimples: "yes", anchor: "yes", released: "no", push: 0 };
        const state = { dimples: "yes", anchor: "yes", released: "no", push: 0 };

        root.innerHTML =
            head("Try it: dimples and anchors") +
            art("0 0 340 200", "A cross-section of Poly 1 over the first sacrificial oxide, with optional anchor holes down to Poly 0 and small dimples, before and after the release") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("ANCHOR1 mask (holes down to Poly 0)", "anchor", [["yes", "Etched"], ["no", "Skipped"]]) +
            seg("DIMPLES mask (shallow standoffs)", "dimples", [["yes", "Etched"], ["no", "Skipped"]]) +
            seg("Release", "released", [["no", "Before release"], ["yes", "After release"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Push the free end down (after release)", key: "push", min: 0, max: 100, step: 2, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Everything about the oxide is temporary: it just holds the shape until release. Anchors are filled by Poly 1 to lock it to Poly 0, and dimples leave small standoffs so beams do not stick flat.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const anchor = state.anchor === "yes";
            const dimples = state.dimples === "yes";
            const released = state.released === "yes";
            const gap = 26;
            const dimpleDepth = 8;
            const drop = released ? state.push / 100 * gap : 0;
            const contactDrop = dimples ? gap - dimpleDepth : gap;
            const touching = released && anchor && drop >= contactDrop - 0.01;

            let s = rect(30, 172, 280, 20, COL.si, "none");

            // Poly 0 electrode
            s += rect(40, 164, 250, 8, COL.poly0, "none");

            if (!released) {

                // first oxide, with the anchor hole etched out
                const x0 = anchor ? 80 : 40;

                s += rect(x0, 138, 310 - x0, 26, COL.psg, "none");

                // poly 1 on top, filling the anchor and the dimples
                s += rect(anchor ? 50 : 40, 122, 260, 16, COL.poly1, "none");

                if (anchor) { s += rect(50, 138, 30, 26, COL.poly1, "none"); }

                if (dimples) {

                    s += rect(150, 138, 12, dimpleDepth, COL.poly1, "none");
                    s += rect(220, 138, 12, dimpleDepth, COL.poly1, "none");
                }

                s += label(200, 156, "first oxide (temporary)", 7, "middle", "rgba(255,105,120,1)");
                s += label(170, 114, "Poly 1", 7.5, "middle", "rgba(84,224,199,1)");

            } else if (anchor) {

                const px = 80;
                const py = 130;
                const ang = Math.atan2(drop, 220);
                const cs2 = Math.cos(ang);
                const sn2 = Math.sin(ang);

                function rot(x, y) {

                    const dx = x - px;
                    const dy = y - py;

                    return [px + dx * cs2 - dy * sn2, py + dx * sn2 + dy * cs2];
                }

                s += poly([rot(80, 122), rot(310, 122), rot(310, 138), rot(80, 138)], COL.poly1, "rgba(245,247,255,.7)");
                s += rect(50, 122, 30, 42, COL.poly1, "none");

                if (dimples) {

                    s += poly([rot(150, 138), rot(162, 138), rot(162, 138 + dimpleDepth), rot(150, 138 + dimpleDepth)], COL.poly1, "rgba(245,247,255,.7)");
                    s += poly([rot(220, 138), rot(232, 138), rot(232, 138 + dimpleDepth), rot(220, 138 + dimpleDepth)], COL.poly1, "rgba(245,247,255,.7)");
                }

                s += label(65, 114, "anchor", 7, "middle", "var(--muted)");

                if (touching) {

                    s += '<circle cx="' + (dimples ? 226 : 270) + '" cy="163" r="7" style="fill:none;stroke:rgba(255,214,102,1);stroke-width:2"/>';
                }

            } else {

                // no anchor: the beam has nothing holding it
                s += '<rect x="40" y="86" width="260" height="16" style="fill:rgba(84,224,199,.18);stroke:rgba(84,224,199,.7);stroke-dasharray:4 3"/>';
                s += label(170, 80, "Poly 1 washes away: nothing anchors it", 7.5, "middle", "rgba(255,105,120,1)");
            }

            s += label(160, 183, "Poly 0 (fixed electrode) on silicon", 6.5, "middle", "var(--muted)");

            svg.innerHTML = s;

            const chip = root.querySelector('[data-out="chip"]');

            if (!released) {

                out(root, "verdict", "The oxide holds everything in place");
                chip.textContent = "before release";
                chip.className = "fd-chip gold";
                out(root, "note", (anchor ? "Poly 1 fills the anchor hole and locks to Poly 0. " : "There is no anchor hole, so Poly 1 will not be held. ") + (dimples ? "The dimples leave small bumps on the underside of Poly 1." : "The underside of Poly 1 will be flat."));

            } else if (!anchor) {

                out(root, "verdict", "Released with no anchor: the structure is lost");
                chip.textContent = "✕ Washed away";
                chip.className = "fd-chip rose";
                out(root, "note", "An anchor mask is what ties a moving layer to the layers below it.");

            } else if (touching && !dimples) {

                out(root, "verdict", "The beam lies flat on Poly 0 and sticks");
                chip.textContent = "✕ Stiction";
                chip.className = "fd-chip rose";
                out(root, "note", "A large flat contact area makes it hard to pull the beam free again.");

            } else if (touching) {

                out(root, "verdict", "Only the dimples touch down, so it can pull free");
                chip.textContent = "✓ Small contact";
                chip.className = "fd-chip";
                out(root, "note", "Dimples are small standoffs so beams do not stick flat against Poly 0.");
                F.reward("mems-anchor-dimples", 10, "You saw dimples prevent sticking");

            } else {

                out(root, "verdict", "A free-standing beam, anchored at one end");
                chip.textContent = "✓ Released";
                chip.className = "fd-chip";
                out(root, "note", "Push the free end down to see what happens when it meets Poly 0.");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 15: THE RELEASE
    ====================================== */

    SIMS["mems-release"] = function (root) {

        const defaults = { hf: 1.75 };
        const state = { hf: 1.75, di: true, alc: true, bake: true };
        let t = 0;

        root.innerHTML =
            head("Try it: release a structure") +
            art("0 0 340 200", "A beam over a sacrificial oxide that dissolves in a hydrofluoric acid bath, then is rinsed and dried. Skipping a step can leave the beam stuck to the substrate") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play" data-steps></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Time in the HF bath (minutes)", key: "hf", min: 0, max: 4, step: 0.25, value: 1.75 }) +
            "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<p class="fd-sim-formula">Wafers ship unreleased, and the customer performs the release. The sacrificial oxide\'s whole job is to disappear at this step. Whatever is left afterward is your device.</p>';

        const svg = root.querySelector("svg");
        const stepsEl = root.querySelector("[data-steps]");

        const toggles = [
            { id: "di", name: "DI water rinse", note: "Several minutes in deionized water." },
            { id: "alc", name: "Alcohol rinse", note: "Reduces stiction: alcohol dries without pulling the beam down." },
            { id: "bake", name: "Oven bake", note: "100 °C for 10 minutes." }
        ];

        function outcome() {

            if (state.hf < 1.5) { return "partial"; }
            if (!state.di) { return "acid"; }
            if (!state.alc) { return "stuck"; }
            if (!state.bake) { return "wet"; }

            return "free";
        }

        function update() {

            const p = clamp(state.hf / 1.75, 0, 1);
            const res = outcome();

            stepsEl.innerHTML = '<span class="fd-seg-label" style="width:100%;font-size:.85rem;font-weight:700">After the HF bath, do these:</span>' + toggles.map(function (tg) {
                return '<button type="button" class="fd-sim-btn' + (state[tg.id] ? " on" : "") + '" data-tog="' + tg.id + '">' + (state[tg.id] ? "✓ " : "✕ ") + tg.name + "</button>";
            }).join("");

            stepsEl.querySelectorAll("[data-tog]").forEach(function (b) {

                b.addEventListener("click", function () {

                    state[b.dataset.tog] = !state[b.dataset.tog];
                    out(root, "note", toggles.filter(function (x) { return x.id === b.dataset.tog; })[0].note);
                    update();
                });
            });

            setVal(root, "hf", state.hf.toFixed(2) + " min");

            const chip = root.querySelector('[data-out="chip"]');

            if (res === "free") {

                out(root, "verdict", "Released: a free-standing structure");
                chip.textContent = "✓ Success";
                chip.className = "fd-chip";
                F.reward("mems-release-ok", 10, "You released a structure correctly");

            } else if (res === "partial") {

                out(root, "verdict", "Some oxide is still under the beam");
                chip.textContent = "✕ Not fully released";
                chip.className = "fd-chip rose";

            } else if (res === "acid") {

                out(root, "verdict", "Acid is left on the device");
                chip.textContent = "✕ Rinse it off";
                chip.className = "fd-chip rose";

            } else if (res === "stuck") {

                out(root, "verdict", "As the water dries, the beam is pulled down and stuck");
                chip.textContent = "✕ Stiction";
                chip.className = "fd-chip rose";

            } else {

                out(root, "verdict", "Nearly there: the device still needs drying");
                chip.textContent = "⚠ Bake it";
                chip.className = "fd-chip gold";
            }

            draw(p, res);
        }

        function draw(p, res) {

            let s = rect(30, 172, 280, 20, COL.si, "none");

            s += rect(40, 164, 250, 8, COL.poly0, "none");

            // remaining sacrificial oxide shrinks from the free end toward the anchor
            const xEnd = 300 - p * 220;

            if (p < 1) { s += rect(80, 138, Math.max(0, xEnd - 80), 26, COL.psg, "none"); }

            // the beam
            const drop = res === "stuck" ? 26 : (res === "free" ? Math.sin(t * 6) * 1.5 * Math.max(0, 1 - (t % 5) / 5) : 0);
            const px = 80;
            const py = 130;
            const ang = Math.atan2(drop, 220);
            const cs2 = Math.cos(ang);
            const sn2 = Math.sin(ang);

            function rot(x, y) {

                const dx = x - px;
                const dy = y - py;

                return [px + dx * cs2 - dy * sn2, py + dx * sn2 + dy * cs2];
            }

            s += poly([rot(80, 122), rot(310, 122), rot(310, 138), rot(80, 138)], COL.poly1, "rgba(245,247,255,.7)");
            s += rect(50, 122, 30, 42, COL.poly1, "none");

            if (p < 1) {

                s += '<line x1="' + xEnd + '" y1="110" x2="' + xEnd + '" y2="168" style="stroke:rgba(255,214,102,.95);stroke-dasharray:3 3"/>';
                s += label(xEnd, 104, "HF etch front", 7, "middle", "rgba(255,214,102,1)");
            }

            if (res === "stuck") { s += label(200, 190, "stuck to the substrate", 7.5, "middle", "rgba(255,105,120,1)"); }

            if (res === "acid") { s += label(200, 100, "HF residue", 7.5, "middle", "rgba(255,105,120,1)"); }

            svg.innerHTML = s + legend([["silicon", COL.si], ["Poly 0", COL.poly0], ["oxide", COL.psg], ["Poly 1", COL.poly1]], 198);
        }

        animate(root, function (dt) {

            t += dt;

            if (outcome() === "free") { update(); }
        });

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 16: WHY THE ORDER CANNOT CHANGE
    ====================================== */

    SIMS["mems-polyorder"] = orderGame(
        "Game: build a PolyMUMPs device in order",
        [
            { n: "Wafer and doping", d: "150 mm n-type, phosphorus-doped surface", why: "Every run starts from the same wafer, so every design shares the same starting point." },
            { n: "Nitride", d: "SiN isolation layer", why: "It insulates the polysilicon from the substrate." },
            { n: "Poly 0", d: "Patterned ground plane", why: "A fixed layer that wiring and fixed electrodes need, below everything that moves." },
            { n: "PSG1", d: "Dimples and ANCHOR1 etched", why: "The first sacrificial layer, with its holes and dimples etched before the layer that fills them." },
            { n: "Poly 1", d: "Anchored to Poly 0", why: "It is deposited over the dimples and into the anchor holes, so they must already exist." },
            { n: "PSG2", d: "VIA and ANCHOR2 etched", why: "The second sacrificial layer, which must survive every later masking step." },
            { n: "Poly 2", d: "Anchored and connected to Poly 1", why: "It fills the via and the anchor holes cut in the second oxide." },
            { n: "Metal", d: "Contacts, routing, mirrors", why: "The last layer, put on the finished stack by lift-off." },
            { n: "Release", d: "HF dissolves PSG1 and PSG2", why: "Both sacrificial layers disappear last, leaving the moving parts free." }
        ],
        "mems-polyorder-done",
        "You ordered a whole PolyMUMPs run",
        "Tap the nine steps in the order a PolyMUMPs run happens.",
        "In a fixed multi-mask process, sequence is not a suggestion: it is the design."
    );


    /* ======================================
       UNIT 16: THE WHOLE STACK, BUILT STEP BY STEP
    ====================================== */

    SIMS["mems-polystack"] = stepper({
        title: "Watch it: the full PolyMUMPs stack",
        aria: "A cross-section built in nine steps: wafer, nitride, Poly 0, first oxide, Poly 1, second oxide, Poly 2, metal, and the release that dissolves both oxides",
        viewBox: "0 0 340 200",
        interval: 3,
        formula: "Seven layers, eight masks. Illustrative thicknesses are to scale with each other: nitride 0.6 µm, Poly 0 0.5 µm, PSG1 2.0 µm, Poly 1 2.0 µm, PSG2 0.75 µm, Poly 2 1.5 µm, metal 0.5 µm.",
        rewardKey: "mems-polystack-done",
        rewardMsg: "You built a whole PolyMUMPs stack",
        steps: [
            { t: "1 · Wafer and doping", tool: "Diffusion", text: "A 150 mm n-type wafer, with a phosphorus-doped surface to reduce charge feed-through to the substrate." },
            { t: "2 · Silicon nitride, 0.6 µm", tool: "LPCVD", text: "A low-stress nitride layer provides electrical insulation." },
            { t: "3 · Poly 0, 0.5 µm", tool: "LPCVD + mask 1", text: "The fixed ground plane, used for wiring and stationary electrodes." },
            { t: "4 · First oxide (PSG1), 2.0 µm", tool: "LPCVD + masks 2 and 3", text: "The first sacrificial layer, with dimples and ANCHOR1 holes etched into it." },
            { t: "5 · Poly 1, 2.0 µm", tool: "LPCVD + mask 4", text: "The first moving layer. It fills the anchor holes and locks to Poly 0." },
            { t: "6 · Second oxide (PSG2), 0.75 µm", tool: "LPCVD + masks 5 and 6", text: "The second sacrificial layer, with a via to Poly 1 and ANCHOR2 cut through both oxides." },
            { t: "7 · Poly 2, 1.5 µm", tool: "LPCVD + mask 7", text: "The second moving layer, connected down through the via and anchor." },
            { t: "8 · Metal, 0.5 µm", tool: "Lift-off + mask 8", text: "Probing pads, wire bonding, routing, and reflective mirror surfaces." },
            { t: "9 · Release", tool: "HF bath", text: "Both sacrificial oxides dissolve, and the moving structures are free." }
        ],
        draw: function (step) {

            const k = 14;           // px per micrometer
            const base = 178;
            let s = rect(30, base, 280, 16, COL.si, "none");

            if (step >= 0) { s += rect(30, base, 280, 3, "rgba(84,224,199,.5)", "none"); }

            let y = base;

            function layer(h, x0, x1, fill) {

                y -= h * k;

                return rect(x0, y, x1 - x0, h * k, fill, "rgba(245,247,255,.35)");
            }

            const yNit0 = y;

            if (step >= 1) { s += layer(0.6, 40, 300, COL.nit); }

            const yP0 = y;

            if (step >= 2) { s += layer(0.5, 40, 280, COL.poly0); }

            const yP0top = y;
            const sacOn = step !== 8;

            let yPsg1Top = y;

            if (step >= 3) {

                yPsg1Top = y - 2 * k;

                if (sacOn) {
                    s += rect(40, yPsg1Top, 20, 2 * k, COL.psg, "rgba(245,247,255,.35)");
                    s += rect(80, yPsg1Top, (step >= 5 ? 270 : 300) - 80, 2 * k, COL.psg, "rgba(245,247,255,.35)");

                    if (step >= 5) { s += rect(290, yPsg1Top, 10, 2 * k, COL.psg, "rgba(245,247,255,.35)"); }
                }

                y = yPsg1Top;
            }

            const yPoly1Top = y - 2 * k;

            if (step >= 4) {

                s += rect(60, yPoly1Top, 200, 2 * k, COL.poly1, "rgba(245,247,255,.35)");
                s += rect(60, yPsg1Top, 20, yP0top - yPsg1Top, COL.poly1, "rgba(245,247,255,.35)");

                y = yPoly1Top;
            }

            const yPsg2Top = y - 0.75 * k;

            if (step >= 5) {

                if (sacOn) {
                    s += rect(40, yPsg2Top, 50, 0.75 * k, COL.psg, "rgba(245,247,255,.35)");
                    s += rect(110, yPsg2Top, 160, 0.75 * k, COL.psg, "rgba(245,247,255,.35)");
                    s += rect(290, yPsg2Top, 10, 0.75 * k, COL.psg, "rgba(245,247,255,.35)");
                }

                y = yPsg2Top;
            }

            const yPoly2Top = y - 1.5 * k;

            if (step >= 6) {

                s += rect(90, yPoly2Top, 200, 1.5 * k, COL.poly2, "rgba(245,247,255,.35)");
                s += rect(90, yPsg2Top + 0.75 * k - 0.75 * k, 20, 0.75 * k + 0, COL.poly2, "rgba(245,247,255,.35)");
                s += rect(270, yPsg2Top, 20, yP0top - yPsg2Top, COL.poly2, "rgba(245,247,255,.35)");

                y = yPoly2Top;
            }

            if (step >= 7) { s += rect(200, y - 0.5 * k, 50, 0.5 * k, COL.metal, "rgba(245,247,255,.35)"); }

            // masks used so far: layers 3..8 add masks 1, 2+3, 4, 5+6, 7, 8
            const masks = [0, 0, 1, 3, 4, 6, 7, 8, 8][step];

            s += label(14, 14, "Masks used: " + masks + " of 8", 8, "start", "rgba(255,214,102,1)");

            if (step === 8) { s += label(170, 40, "moving structures are now free", 8, "middle", "rgba(84,224,199,1)"); }

            void yNit0;
            void yP0;

            return s + legend([["Poly 0", COL.poly0], ["oxide", COL.psg], ["Poly 1", COL.poly1], ["Poly 2", COL.poly2], ["metal", COL.metal]], 198);
        }
    });


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="mems-"]').forEach(F.mount);

})();
