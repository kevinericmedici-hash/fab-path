/* ========================================
   MEMS & MICROFABRICATION: THE FABRICATION TOOLBOX

   Unit 7: doping silicon.
   Unit 8: the process toolbox, why silicon.
   Unit 9: bulk versus surface micromachining.
   Unit 10: oxidation, thin-film deposition.
   Unit 11: the lithography loop, etch profiles.
   Unit 12: planarization, a free-standing structure.

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
    const pline = M.pline;
    const poly = M.poly;
    const legend = M.legend;
    const animate = M.animate;
    const bindPause = M.bindPause;
    const quiz = M.quiz;
    const SIMS = F.SIMS;
    const slider = F.slider;

    function sup(n) {

        const map = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

        return String(n).split("").map(function (c) { return map[c] || c; }).join("");
    }

    function sci(v) {

        if (!isFinite(v) || v <= 0) {
            return "0";
        }

        const e = Math.floor(Math.log10(v));
        const m = v / Math.pow(10, e);

        return m.toFixed(1) + " × 10" + sup(e);
    }

    const COL = {
        si: "rgba(170,179,207,.45)",
        ox: "rgba(120,180,255,.6)",
        poly: "rgba(200,205,225,.6)",
        sac: "rgba(255,105,120,.6)",
        struct: "rgba(84,224,199,.7)",
        mask: "rgba(255,214,102,.8)",
        bg: "rgba(11,16,32,1)"
    };


    /* ======================================
       UNIT 7: DOPING SILICON
    ====================================== */

    SIMS["mems-doping"] = function (root) {

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
                    F.reward("mems-doping-both", 10, "You tried both n-type and p-type");
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
       UNIT 8: THE PROCESS TOOLBOX
    ====================================== */

    SIMS["mems-toolbox"] = quiz(
        "Game: what does each process do?",
        ["Form an oxide layer", "Define patterns", "Remove selected material", "Deposit thin films", "Introduce dopants"],
        [
            { q: "Oxidation", a: "Form an oxide layer", why: "Heating silicon in oxygen grows a layer of silicon dioxide." },
            { q: "Photolithography", a: "Define patterns", why: "It transfers a mask pattern into photoresist, marking where later steps act." },
            { q: "Etching", a: "Remove selected material", why: "Material is removed wherever the resist does not protect it." },
            { q: "CVD (chemical vapor deposition)", a: "Deposit thin films", why: "Gases react at the wafer surface to build up a film, such as polysilicon." },
            { q: "Diffusion", a: "Introduce dopants", why: "Heat drives dopant atoms into the silicon." },
            { q: "Ion implantation", a: "Introduce dopants", why: "A beam of ions places dopant atoms into the silicon." },
            { q: "Evaporation", a: "Deposit thin films", why: "Material is heated until it evaporates and then coats the wafer." },
            { q: "Sputtering", a: "Deposit thin films", why: "Atoms are knocked off a target and land on the wafer as a film." }
        ],
        6,
        "mems-toolbox-done",
        "You matched the toolbox",
        "You know the toolbox: grow, pattern, remove, deposit, and dope.",
        "Think of the five jobs: grow an oxide, define patterns, remove material, deposit films, and add dopants. Hit Reset to try again."
    );


    /* ======================================
       UNIT 8: WHY SILICON
    ====================================== */

    SIMS["mems-silicon"] = function (root) {

        const defaults = { prop: "E" };
        const state = { prop: "E" };

        const mats = [
            { n: "Silicon", E: 170, Y: 7, D: 2.33, c: "rgba(84,224,199,.8)" },
            { n: "Steel", E: 200, Y: 1, D: 7.85, c: "rgba(170,179,207,.8)" },
            { n: "Aluminum", E: 70, Y: 0.3, D: 2.7, c: "rgba(255,214,102,.8)" }
        ];

        const props = {
            E: { name: "Stiffness (elastic modulus, GPa)", fmt: function (m) { return m.E; }, note: "Silicon is about as stiff as steel." },
            Y: { name: "Strength (yield strength, GPa)", fmt: function (m) { return m.Y; }, note: "Silicon's yield strength is higher than steel's." },
            D: { name: "Density (g/cm³)", fmt: function (m) { return m.D; }, note: "Silicon is light, so a tiny mass responds quickly." },
            S: { name: "Stiffness for its weight (GPa per g/cm³)", fmt: function (m) { return m.E / m.D; }, note: "Per gram, silicon is far stiffer than steel." }
        };

        root.innerHTML =
            head("Try it: silicon against steel and aluminum") +
            art("0 0 340 170", "Bars comparing silicon, steel, and aluminum for stiffness, strength, density, and stiffness per weight") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Compare", "prop", [["E", "Stiffness"], ["Y", "Strength"], ["D", "Density"], ["S", "Stiffness per weight"]]) +
            '<p class="fd-sim-formula">Typical rounded values for comparison only. Silicon combines useful electrical properties with strong mechanical properties and an established fabrication infrastructure.</p>';

        const svg = root.querySelector("svg");
        const seen = {};

        function update() {

            const p = props[state.prop];
            const vals = mats.map(function (m) { return p.fmt(m); });
            const mx = Math.max.apply(null, vals);

            let s = label(14, 16, p.name, 7.5, "start");

            mats.forEach(function (m, i) {

                const y = 32 + i * 40;
                const w = vals[i] / mx * 190;

                s += label(84, y + 16, m.n, 8, "end");
                s += rect(92, y, Math.max(3, w), 26, m.c, "rgba(245,247,255,.6)");
                s += label(92 + Math.max(3, w) + 5, y + 17, (vals[i] >= 10 ? Math.round(vals[i]) : vals[i].toFixed(vals[i] < 1 ? 1 : 2)).toString(), 8, "start");
            });

            svg.innerHTML = s;

            out(root, "verdict", p.note);

            seen[state.prop] = true;

            if (seen.E && seen.Y && seen.D && seen.S) {
                F.reward("mems-silicon-all", 10, "You compared every property");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 9: BULK VERSUS SURFACE MICROMACHINING
    ====================================== */

    SIMS["mems-micromach"] = function (root) {

        const sets = {
            bulk: [
                { t: "1 · Mask the back of the wafer", text: "A patterned mask protects the silicon except where the cavity should go." },
                { t: "2 · Etch the cavity", text: "The etch removes silicon through the opening, cutting a cavity with sloped walls and leaving a thin layer on top." },
                { t: "3 · A membrane remains", text: "The substrate itself has become the mechanical geometry: a thin silicon membrane over an empty cavity." },
                { t: "4 · The membrane flexes", text: "Pressure pushes the membrane, and the motion can be sensed. Bulk micromachining shapes the substrate." }
            ],
            surface: [
                { t: "1 · Start with the substrate", text: "The wafer is just the base. Nothing mechanical is made from it." },
                { t: "2 · Deposit a sacrificial layer", text: "A layer is added that is meant to be removed later." },
                { t: "3 · Add and pattern the structural layer", text: "The structural layer stays in the device. It anchors to the substrate where the sacrificial layer was opened." },
                { t: "4 · Remove the sacrificial layer", text: "Etching away the sacrificial layer leaves a free-standing structure. Surface micromachining builds above the substrate." }
            ]
        };

        const defaults = { kind: "bulk" };
        const state = { kind: "bulk", step: 0, playing: true, t: 0, anim: 0 };

        root.innerHTML =
            head("Watch it: shape the wafer, or build on it") +
            art("0 0 340 190", "A cross-section built up step by step, either etching a cavity into the silicon or building a beam over a sacrificial layer and then removing that layer") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-play>⏸ Pause</button>' +
            [0, 1, 2, 3].map(function (i) { return '<button type="button" class="fd-sim-btn" data-stepbtn="' + i + '">' + (i + 1) + "</button>"; }).join("") +
            "</div>" +
            seg("Strategy", "kind", [["bulk", "Bulk: etch into the silicon"], ["surface", "Surface: build on top"]]) +
            '<p class="fd-sim-formula">Bulk: shape the substrate. Surface: build structures above the substrate.</p>';

        const svg = root.querySelector("svg");
        const playBtn = root.querySelector("[data-play]");
        const seenKinds = {};

        function drawBulk() {

            const st = state.step;
            const wob = st === 3 ? Math.sin(state.anim * 3) * 5 : 0;

            let s = "";

            // wafer drawn with its back at the bottom
            const depth = st === 0 ? 0 : (st === 1 ? clamp(state.t / 2, 0, 1) * 62 : 62);

            s += rect(30, 50, 280, 80, COL.si, "rgba(245,247,255,.5)");

            if (depth > 0) {

                const run = depth / 1.414;
                const x0 = 110;
                const x1 = 230;

                s += poly([[x0, 130], [x1, 130], [x1 - run, 130 - depth], [x0 + run, 130 - depth]], COL.bg, "none");

                if (st >= 3) {

                    // membrane flexes between its edges
                    const top = 130 - depth;
                    const pts = [];

                    for (let i = 0; i <= 20; i++) {

                        const fx = x0 + run + (x1 - run - (x0 + run)) * i / 20;
                        const dy = wob * (1 - Math.pow(2 * i / 20 - 1, 2));

                        pts.push([fx, top - 2 + dy]);
                    }

                    s += pline(pts, "rgba(84,224,199,1)", 4);
                    s += '<polygon points="170,22 164,34 176,34" style="fill:rgba(255,214,102,.95)"/><polygon points="130,22 124,34 136,34" style="fill:rgba(255,214,102,.95)"/><polygon points="210,22 204,34 216,34" style="fill:rgba(255,214,102,.95)"/>';
                    s += label(170, 18, "pressure", 7, "middle", "rgba(255,214,102,.95)");
                }
            }

            if (st === 0 || st === 1) {

                s += rect(30, 130, 80, 6, COL.mask, "none") + rect(230, 130, 80, 6, COL.mask, "none");
                s += label(70, 150, "mask", 7, "middle", "var(--muted)") + label(270, 150, "mask", 7, "middle", "var(--muted)");
            }

            if (st >= 2) { s += label(170, 104, "membrane", 7.5, "middle", "rgba(84,224,199,1)"); }
            if (depth > 20) { s += label(170, 122, "empty cavity", 7, "middle", "var(--muted)"); }

            return s + legend([["silicon", COL.si], ["mask", COL.mask]], 178);
        }

        function drawSurface() {

            const st = state.step;
            let s = rect(30, 140, 280, 34, COL.si, "rgba(245,247,255,.5)");

            if (st >= 1 && st < 3) { s += rect(82, 128, 208, 12, COL.sac, "none"); }
            if (st === 2) { s += rect(60, 116, 190, 12, COL.struct, "none") + rect(60, 128, 22, 12, COL.struct, "none"); }

            if (st === 1) { s += label(186, 122, "sacrificial layer", 7, "middle", "rgba(255,105,120,1)"); }

            if (st === 3) {

                // released cantilever wiggles
                const a = Math.sin(state.anim * 6) * 0.05;
                const cs = Math.cos(a);
                const sn = Math.sin(a);
                const px = 60;
                const py = 122;

                function rot(x, y) {

                    const dx = x - px;
                    const dy = y - py;

                    return [px + dx * cs - dy * sn, py + dx * sn + dy * cs];
                }

                s += poly([rot(60, 116), rot(250, 116), rot(250, 128), rot(60, 128)], COL.struct, "rgba(245,247,255,.7)");
                s += rect(60, 128, 22, 12, COL.struct, "none");
                s += label(160, 160, "free-standing beam over an empty gap", 7, "middle", "var(--muted)");
            }

            if (st >= 2) { s += label(70, 108, "anchor", 7, "middle", "var(--muted)"); }
            if (st === 2) { s += label(186, 110, "structural layer", 7, "middle", "rgba(84,224,199,1)"); }

            return s + legend([["silicon", COL.si], ["sacrificial", COL.sac], ["structural", COL.struct]], 186);
        }

        function render() {

            svg.innerHTML = state.kind === "bulk" ? drawBulk() : drawSurface();

            const st = sets[state.kind][state.step];

            out(root, "title", st.t);
            out(root, "text", st.text);

            root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {
                b.classList.toggle("on", parseInt(b.dataset.stepbtn, 10) === state.step);
            });

            if (state.step === 3) {

                seenKinds[state.kind] = true;

                if (seenKinds.bulk && seenKinds.surface) {
                    F.reward("mems-micromach-both", 10, "You watched both micromachining strategies");
                }
            }
        }

        animate(root, function (dt) {

            state.anim += dt;
            state.t += dt;

            if (state.playing && state.t > 3.6 && state.step < 3) {

                state.step++;
                state.t = 0;
            } else if (state.playing && state.t > 6 && state.step === 3) {

                state.step = 0;
                state.t = 0;
            }

            render();
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
                state.t = state.step === 1 ? 0 : 2;

                render();
            });
        });

        wire(root, state, defaults, function () {

            state.step = 0;
            state.t = 0;
            render();
        });

        render();
    };


    /* ======================================
       UNIT 10: GROWING AN OXIDE
    ====================================== */

    SIMS["mems-oxide"] = function (root) {

        const KB = 8.617e-5;
        const consts = {
            dry: { b0: 772, eb: 1.23, c: 3.71e6, ec: 2.0 },
            wet: { b0: 386, eb: 0.78, c: 9.7e7, ec: 2.05 }
        };

        const defaults = { mode: "dry", temp: 1000, logt: 0 };
        const state = { mode: "dry", temp: 1000, logt: 0 };

        function thicknessNm(mode, tempC, hours) {

            const k = consts[mode];
            const tk = tempC + 273.15;
            const B = k.b0 * Math.exp(-k.eb / (KB * tk));
            const BA = k.c * Math.exp(-k.ec / (KB * tk));
            const A = B / BA;

            return (A / 2) * (Math.sqrt(1 + 4 * B * hours / (A * A)) - 1) * 1000;
        }

        root.innerHTML =
            head("Try it: grow an oxide on silicon") +
            art("0 0 340 190", "Left: a silicon cross-section with oxide growing up and down from the original surface. Right: oxide thickness against time for dry and wet oxidation") +
            '<div class="fd-stat-row">' + stat("Oxide thickness", "x") + stat("Silicon used up", "cons") + stat("Grows above the old surface", "above") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Atmosphere", "mode", [["dry", "Dry (oxygen)"], ["wet", "Wet (steam)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Furnace temperature (°C)", key: "temp", min: 800, max: 1200, step: 10, value: 1000 }) +
            slider({ label: "Time in the furnace (log scale)", key: "logt", min: -1.3, max: 1, step: 0.02, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">A simplified Deal–Grove model with typical constants, so the numbers are approximate. The oxide consumes some of the wafer itself.</p>';

        const svg = root.querySelector("svg");

        function fmtNm(nm) {

            return nm >= 1000 ? (nm / 1000).toFixed(2) + " µm" : (nm >= 100 ? Math.round(nm) : nm.toFixed(1)) + " nm";
        }

        function update() {

            const hours = Math.pow(10, state.logt);
            const x = thicknessNm(state.mode, state.temp, hours);

            setVal(root, "temp", state.temp + " °C");
            setVal(root, "logt", hours < 1 ? Math.round(hours * 60) + " min" : hours.toFixed(1) + " h");

            out(root, "x", fmtNm(x));
            out(root, "cons", fmtNm(x * 0.44));
            out(root, "above", fmtNm(x * 0.56));
            out(root, "note", state.mode === "dry"
                ? "Dry oxide is slow but dense, the quality choice for thin oxides."
                : "Wet oxide grows much faster, so it suits thick oxide layers.");

            const surf = 96;
            const px = function (nm) { return 5 + 52 * Math.sqrt(nm / 3000); };
            const up = px(x) * 0.56;
            const down = px(x) * 0.44;

            let s = "";

            s += rect(14, surf + down, 130, 90 - down, "rgba(170,179,207,.16)", "rgba(170,179,207,.55)");
            s += rect(14, surf - up, 130, up + down, "rgba(255,214,102,.3)", "rgba(255,214,102,.9)");
            s += '<line x1="10" y1="' + surf + '" x2="148" y2="' + surf + '" style="stroke:rgba(245,247,255,.8);stroke-dasharray:4 3"/>';
            s += label(79, surf + down + 24, "silicon", 7.5);
            s += label(79, surf - up - 8, "SiO₂", 7.5, "middle", "rgba(255,214,102,1)");
            s += label(152, surf + 3, "original", 6.5, "start") + label(152, surf + 11, "surface", 6.5, "start");
            s += label(79, 20, "schematic, not to scale", 6.5);

            // chart
            const gx0 = 196;
            const gx1 = 330;
            const gy0 = 160;
            const gy1 = 28;
            const ymax = Math.max(thicknessNm("dry", state.temp, 10), thicknessNm("wet", state.temp, 10), 50);

            function gx(h) { return gx0 + h / 10 * (gx1 - gx0); }
            function gy(v) { return gy0 - v / ymax * (gy0 - gy1); }

            function curve(mode) {

                const pts = [];

                for (let h = 0; h <= 10.001; h += 0.25) {
                    pts.push([gx(h), gy(thicknessNm(mode, state.temp, Math.max(h, 0.0001)))]);
                }

                return pts;
            }

            s += '<line x1="' + gx0 + '" y1="' + gy0 + '" x2="' + gx1 + '" y2="' + gy0 + '" style="stroke:var(--muted)"/><line x1="' + gx0 + '" y1="' + gy0 + '" x2="' + gx0 + '" y2="' + (gy1 - 4) + '" style="stroke:var(--muted)"/>';

            [0, 5, 10].forEach(function (h) { s += label(gx(h), gy0 + 11, h + " h", 6.5); });

            s += label(gx0 - 4, gy1 + 2, fmtNm(ymax), 6, "end") + label(gx0 - 4, gy0 + 2, "0", 6, "end");
            s += pline(curve("dry"), "rgba(84,224,199,1)", state.mode === "dry" ? 2.4 : 1.2);
            s += pline(curve("wet"), "rgba(255,214,102,1)", state.mode === "wet" ? 2.4 : 1.2);
            s += label(gx1, gy(thicknessNm("dry", state.temp, 10)) - 4, "dry", 6.5, "end", "rgba(84,224,199,1)");
            s += label(gx1, gy(thicknessNm("wet", state.temp, 10)) - 4, "wet", 6.5, "end", "rgba(255,214,102,1)");
            s += '<circle cx="' + gx(Math.min(hours, 10)).toFixed(1) + '" cy="' + gy(x).toFixed(1) + '" r="4.4" style="fill:rgba(255,214,102,1);stroke:var(--bg)"/>';

            svg.innerHTML = s;

            if (x >= 500) {
                F.reward("mems-oxide-thick", 5, "You grew a thick oxide");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 10: THIN-FILM COVERAGE
    ====================================== */

    SIMS["mems-depo"] = function (root) {

        const defaults = { method: "cvd", ar: 1.2, t: 12 };
        const state = { method: "cvd", ar: 1.2, t: 12 };

        root.innerHTML =
            head("Try it: how does the film coat a trench?") +
            art("0 0 340 200", "A trench in silicon coated by a film from chemical vapor deposition, which coats all surfaces evenly, or from evaporation, which only coats surfaces it can see") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Deposition method", "method", [["cvd", "CVD"], ["evap", "Evaporation"], ["sputter", "Sputtering"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Trench depth compared with its width", key: "ar", min: 0.3, max: 3, step: 0.1, value: 1.2 }) +
            slider({ label: "Film thickness (% of the trench width)", key: "t", min: 4, max: 40, step: 1, value: 12 }) +
            "</div>" +
            '<p class="fd-sim-formula">Microfabrication alternates between adding material and removing material. How a film reaches the walls of a trench decides whether it covers them.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const W = 60;
            const D = clamp(W * state.ar, 20, 170);
            const top = 40;
            const x0 = 140;
            const x1 = x0 + W;
            const t = W * state.t / 100;

            const cov = { cvd: { side: 1, bottom: 1, over: 0 }, evap: { side: 0.04, bottom: 1, over: 0.45 }, sputter: { side: 0.35, bottom: 0.7, over: 0.3 } }[state.method];

            let s = "";

            // silicon with the trench cut out
            s += rect(20, top, x0 - 20, 160 - top, COL.si, "none") + rect(x1, top, 300 - x1 + 20, 160 - top, COL.si, "none") + rect(x0, top + D, W, 160 - top - D, COL.si, "none");

            const film = "rgba(255,214,102,.9)";
            const overhang = t * cov.over;
            const opening = W - 2 * overhang;
            const closed = opening <= 2 || (state.method === "cvd" && 2 * t >= W - 2);

            // top surfaces
            s += rect(20, top - t, x0 - 20, t, film, "none") + rect(x1, top - t, 300 - x1 + 20, t, film, "none");

            // overhangs at the trench mouth
            if (overhang > 0.5) {
                s += poly([[x0, top - t], [x0 + overhang, top - t], [x0, top + overhang * 1.4]], film, "none");
                s += poly([[x1, top - t], [x1 - overhang, top - t], [x1, top + overhang * 1.4]], film, "none");
            }

            if (state.method === "cvd" && closed) {

                s += rect(x0, top - t, W, t * 1.4, film, "none");
                s += rect(x0 + 5, top + t * 1.4 + 4, W - 10, Math.max(8, D - t * 2 - 12), COL.bg, "rgba(255,105,120,.9)");
                s += label(x0 + W / 2, top + D / 2 + 4, "void", 7, "middle", "rgba(255,105,120,1)");

            } else {

                s += rect(x0, top, Math.max(0.5, t * cov.side), D, film, "none") + rect(x1 - t * cov.side, top, Math.max(0.5, t * cov.side), D, film, "none");

                if (!closed) {
                    s += rect(x0 + t * cov.side, top + D - t * cov.bottom, W - 2 * t * cov.side, Math.max(0.5, t * cov.bottom), film, "none");
                }
            }

            s += label(170, 188, state.method === "cvd" ? "gas reaches every surface" : "atoms travel in straight lines from above", 7.5, "middle", "var(--muted)");
            s += label(60, 28, "film", 7, "middle", "rgba(255,214,102,1)");

            svg.innerHTML = s;

            const chip = root.querySelector('[data-out="chip"]');

            if (state.method === "cvd") {

                if (closed) {
                    out(root, "verdict", "The film pinches off the mouth and leaves a void");
                    chip.textContent = "⚠ Void";
                    chip.className = "fd-chip gold";
                } else {
                    out(root, "verdict", "Even coverage on the top, walls, and bottom");
                    chip.textContent = "✓ Conformal";
                    chip.className = "fd-chip";
                }

                out(root, "note", "CVD and LPCVD build a film from gases reacting at the surface, so even steep walls get covered.");

            } else if (state.method === "evap") {

                out(root, "verdict", closed ? "The mouth closes before the bottom is coated" : "The walls are almost bare");
                chip.textContent = "✕ Poor wall coverage";
                chip.className = "fd-chip rose";
                out(root, "note", "Evaporation sends material in a straight line, so surfaces it cannot see stay uncoated.");

            } else {

                out(root, "verdict", "Partial wall coverage");
                chip.textContent = "⚠ In between";
                chip.className = "fd-chip gold";
                out(root, "note", "Sputtering is another thin-film method, with coverage between the other two.");
            }

            setVal(root, "ar", state.ar.toFixed(1) + "×");
            setVal(root, "t", state.t + "%");

            if (state.method === "cvd" && !closed && state.ar >= 2) {
                F.reward("mems-depo-deep", 5, "You coated a deep trench evenly");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 11: THE LITHOGRAPHY LOOP
    ====================================== */

    SIMS["mems-litholoop"] = function (root) {

        const steps = [
            { title: "1 · Coat", text: "The wafer is spun with a thin coat of photoresist, a polymer that reacts to light." },
            { title: "2 · Expose", text: "Light shines through the reticle, a stencil drawn 4× larger than the pattern. The lens shrinks the image onto the resist, and the resist changes wherever the light lands." },
            { title: "3 · Develop", text: "A developer washes away part of the resist. Positive resist loses the exposed parts. Negative resist keeps them." },
            { title: "4 · Etch", text: "Plasma removes the film wherever the resist does not protect it." },
            { title: "5 · Strip", text: "The resist is stripped, leaving the pattern in the film. The wafer then heads to the next layer: the loop repeats." }
        ];

        const defaults = { tone: "pos" };
        const state = { tone: "pos", step: 0, auto: true };

        root.innerHTML =
            head("Watch it: the litho loop") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="440" role="img" aria-label="An animated lithography loop: a reticle is lit from above, a lens shrinks its image onto photoresist on a wafer, the resist is developed, the film is etched, and the resist is stripped"></canvas>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div><span class="fd-chip" data-out="tone"></span></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button>' +
            steps.map(function (s, i) { return '<button type="button" class="fd-sim-btn" data-stepbtn="' + i + '">' + (i + 1) + "</button>"; }).join("") +
            "</div>" +
            seg("Resist tone", "tone", [["pos", "Positive resist"], ["neg", "Negative resist"]]) +
            '<p class="fd-sim-formula">Coat, expose, develop, etch, strip. Same light, opposite result: positive resist loses the exposed parts, negative resist keeps them. The reticle must be drawn as the opposite pattern depending on the tone.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const W = canvas.width;

        const CX = W / 2;
        const SUB_Y = 392;      // top of the substrate
        const FILM_T = 22;
        const RES_T = 26;
        const FILM_Y = SUB_Y - FILM_T;
        const WAF_X0 = 70;
        const WAF_X1 = 610;

        // printed features: [centre offset, width] on the wafer; the reticle draws them 4x larger and 4x farther apart
        const feats = [[-50, 12], [0, 20], [50, 12]];
        const STEP_LEN = 3.6;

        let t = 0;
        let stepT = 0;

        function drawReticleAndOptics(expose, tt) {

            // lamp
            ctx.fillStyle = "rgba(255,214,102,.9)";
            ctx.beginPath();
            ctx.arc(CX, 26, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(245,247,255,.85)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("UV light", CX + 18, 30);

            // reticle plate
            const rY = 70;

            ctx.fillStyle = "rgba(120,180,255,.18)";
            ctx.fillRect(CX - 250, rY, 500, 12);
            ctx.strokeStyle = "rgba(120,180,255,.7)";
            ctx.strokeRect(CX - 250, rY, 500, 12);

            // chrome blocks everywhere except the openings (reticle features are 4x the wafer features)
            ctx.fillStyle = "rgba(20,24,40,.95)";

            let x = CX - 250;

            const opens = feats.map(function (f) { return [CX + f[0] * 4 - f[1] * 2, CX + f[0] * 4 + f[1] * 2]; });

            opens.forEach(function (o) {

                ctx.fillRect(x, rY, Math.max(0, o[0] - x), 12);
                x = o[1];
            });

            ctx.fillRect(x, rY, CX + 250 - x, 12);

            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("reticle: pattern drawn 4× larger", CX - 250, rY - 8);

            // lens
            ctx.strokeStyle = "rgba(245,247,255,.85)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(CX, 190, 90, 14, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.fillText("lens shrinks the image 4×", CX + 98, 194);

            // rays
            if (expose > 0) {

                ctx.strokeStyle = "rgba(255,214,102," + (0.35 + 0.35 * Math.sin(tt * 8)).toFixed(2) + ")";
                ctx.lineWidth = 2;

                feats.forEach(function (f) {

                    const rx0 = CX + f[0] * 4 - f[1] * 2;
                    const rx1 = CX + f[0] * 4 + f[1] * 2;
                    const wx0 = CX + f[0] - f[1] / 2;
                    const wx1 = CX + f[0] + f[1] / 2;
                    const resTop = FILM_Y - RES_T;

                    ctx.beginPath();
                    ctx.moveTo(rx0, rY + 12);
                    ctx.lineTo(CX + (rx0 - CX) * 0.55, 190);
                    ctx.lineTo(wx0, resTop);
                    ctx.moveTo(rx1, rY + 12);
                    ctx.lineTo(CX + (rx1 - CX) * 0.55, 190);
                    ctx.lineTo(wx1, resTop);
                    ctx.stroke();

                    ctx.fillStyle = "rgba(255,214,102,.14)";
                    ctx.beginPath();
                    ctx.moveTo(rx0, rY + 12);
                    ctx.lineTo(rx1, rY + 12);
                    ctx.lineTo(wx1, resTop);
                    ctx.lineTo(wx0, resTop);
                    ctx.closePath();
                    ctx.fill();
                });
            }
        }

        function filmBlocks() {

            // returns the x-ranges (on the wafer) of the film left at the end
            const e = feats.map(function (f) { return [CX + f[0] - f[1] / 2, CX + f[0] + f[1] / 2]; });

            if (state.tone === "pos") {

                // film stays everywhere except under the exposed openings
                const blocks = [];
                let x = WAF_X0;

                e.forEach(function (r) {
                    blocks.push([x, r[0]]);
                    x = r[1];
                });

                blocks.push([x, WAF_X1]);

                return blocks;
            }

            return e;
        }

        function draw() {

            ctx.clearRect(0, 0, W, canvas.height);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, W, canvas.height);

            const s = state.step;
            const frac = clamp(stepT / STEP_LEN, 0, 1);

            // substrate
            ctx.fillStyle = "rgba(170,179,207,.4)";
            ctx.fillRect(WAF_X0, SUB_Y, WAF_X1 - WAF_X0, 36);
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("wafer", WAF_X0 + 6, SUB_Y + 24);

            const exposedRanges = feats.map(function (f) { return [CX + f[0] - f[1] / 2, CX + f[0] + f[1] / 2]; });
            const blocks = filmBlocks();

            // film layer
            if (s < 3) {

                ctx.fillStyle = "rgba(255,214,102,.55)";
                ctx.fillRect(WAF_X0, FILM_Y, WAF_X1 - WAF_X0, FILM_T);

            } else if (s === 3) {

                // etch eats the unprotected film progressively
                ctx.fillStyle = "rgba(255,214,102,.55)";
                ctx.fillRect(WAF_X0, FILM_Y, WAF_X1 - WAF_X0, FILM_T);

                // carve away film where it is unprotected
                const clearAreas = state.tone === "pos" ? exposedRanges : complementRanges(exposedRanges);

                clearAreas.forEach(function (r) {

                    ctx.fillStyle = "rgba(6,10,24,1)";
                    ctx.fillRect(r[0], FILM_Y, r[1] - r[0], FILM_T * frac);
                });

            } else {

                blocks.forEach(function (b) {

                    ctx.fillStyle = "rgba(255,214,102,.55)";
                    ctx.fillRect(b[0], FILM_Y, b[1] - b[0], FILM_T);
                });
            }

            // resist layer
            const resTop = FILM_Y - RES_T;
            const resFill = "rgba(255,105,120,.55)";

            if (s === 0) {

                // coating spreads from the centre outwards
                const half = (WAF_X1 - WAF_X0) / 2 * frac;

                ctx.fillStyle = resFill;
                ctx.fillRect(CX - half, resTop, half * 2, RES_T);

                // spinning drops
                ctx.fillStyle = "rgba(255,105,120,.9)";

                for (let k = 0; k < 5; k++) {
                    ctx.beginPath();
                    ctx.arc(CX - 40 + ((t * 120 + k * 40) % 80), resTop - 20 - (k % 3) * 6, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

            } else if (s === 1) {

                ctx.fillStyle = resFill;
                ctx.fillRect(WAF_X0, resTop, WAF_X1 - WAF_X0, RES_T);

                // exposed regions glow as the light lands
                exposedRanges.forEach(function (r) {

                    ctx.fillStyle = "rgba(255,214,102," + (0.2 + 0.7 * frac).toFixed(2) + ")";
                    ctx.fillRect(r[0], resTop, r[1] - r[0], RES_T);
                });

            } else if (s === 2) {

                const keep = state.tone === "pos" ? complementRanges(exposedRanges) : exposedRanges;
                const gone = state.tone === "pos" ? exposedRanges : complementRanges(exposedRanges);

                keep.forEach(function (r) {

                    ctx.fillStyle = resFill;
                    ctx.fillRect(r[0], resTop, r[1] - r[0], RES_T);
                });

                gone.forEach(function (r) {

                    // the dissolving part shrinks away
                    ctx.fillStyle = "rgba(255,105,120," + (0.55 * (1 - frac)).toFixed(2) + ")";
                    ctx.fillRect(r[0], resTop, r[1] - r[0], RES_T * (1 - frac));
                });

            } else if (s === 3) {

                const keep = state.tone === "pos" ? complementRanges(exposedRanges) : exposedRanges;

                keep.forEach(function (r) {

                    ctx.fillStyle = resFill;
                    ctx.fillRect(r[0], resTop, r[1] - r[0], RES_T);
                });

                // etch ions
                ctx.fillStyle = "rgba(255,255,255,.9)";

                for (let k = 0; k < 24; k++) {

                    const x = WAF_X0 + ((k * 53 + t * 40) % (WAF_X1 - WAF_X0));
                    const y = 110 + ((t * 140 + k * 17) % 190);

                    ctx.beginPath();
                    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = "rgba(245,247,255,.85)";
                ctx.font = "12px sans-serif";
                ctx.fillText("plasma etch", 74, 130);

            } else {

                // strip: leftover resist fades out
                const keep = state.tone === "pos" ? complementRanges(exposedRanges) : exposedRanges;

                keep.forEach(function (r) {

                    ctx.fillStyle = "rgba(255,105,120," + (0.55 * (1 - frac)).toFixed(2) + ")";
                    ctx.fillRect(r[0], resTop + RES_T * frac, r[1] - r[0], RES_T * (1 - frac));
                });

                if (frac > 0.6) {

                    ctx.fillStyle = "rgba(84,224,199,.95)";
                    ctx.font = "bold 14px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("✓ the pattern is now in the film", CX, 360);
                }
            }

            // optics only during expose (and a faint outline otherwise)
            drawReticleAndOptics(s === 1 ? 1 : 0, t);

            // labels
            ctx.fillStyle = "rgba(245,247,255,.85)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("photoresist", WAF_X1 - 70, resTop - 6);
            ctx.fillText("film", WAF_X1 - 40, FILM_Y + 15);
        }

        function complementRanges(ranges) {

            const res = [];
            let x = WAF_X0;

            ranges.forEach(function (r) {
                res.push([x, r[0]]);
                x = r[1];
            });

            res.push([x, WAF_X1]);

            return res;
        }

        function showStep() {

            const st = steps[state.step];

            out(root, "title", st.title);
            out(root, "text", st.text);

            root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {
                b.classList.toggle("on", parseInt(b.dataset.stepbtn, 10) === state.step);
            });

            const chip = root.querySelector('[data-out="tone"]');

            chip.textContent = state.tone === "pos" ? "positive resist" : "negative resist";
            chip.className = "fd-chip " + (state.tone === "pos" ? "" : "gold");
        }

        function frame(dt) {

            t += dt;
            stepT += dt;

            if (state.auto && stepT >= STEP_LEN) {

                stepT = 0;
                state.step = (state.step + 1) % steps.length;

                showStep();

                if (state.step === 0) {
                    F.reward("mems-litholoop-cycle", 5, "You watched a full litho loop");
                }
            }

            draw();
        }

        root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.auto = false;
                state.step = parseInt(b.dataset.stepbtn, 10);
                stepT = 0;

                showStep();
                draw();
            });
        });

        root.querySelectorAll("button[data-set]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.tone = b.dataset.set.split(":")[1];

                root.querySelectorAll("button[data-set]").forEach(function (x) {
                    x.classList.toggle("on", x.dataset.set === "tone:" + state.tone);
                });

                state.auto = true;
                state.step = 0;
                stepT = 0;

                showStep();
                draw();
            });
        });

        const anim = animate(root, frame);

        bindPause(root, anim);

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.tone = "pos";
            state.auto = true;
            state.step = 0;
            stepT = 0;

            root.querySelectorAll("button[data-set]").forEach(function (x) {
                x.classList.toggle("on", x.dataset.set === "tone:pos");
            });

            showStep();
            draw();
        });

        root.querySelectorAll("button[data-set]").forEach(function (x) {
            x.classList.toggle("on", x.dataset.set === "tone:" + state.tone);
        });

        showStep();
        draw();
    };


    /* ======================================
       UNIT 11: ETCH PROFILES
    ====================================== */

    SIMS["mems-etchprofile"] = function (root) {

        const defaults = { kind: "iso", w: 60, time: 40 };
        const state = { kind: "iso", w: 60, time: 40 };

        root.innerHTML =
            head("Try it: three ways to remove silicon") +
            art("0 0 340 200", "A cross-section of silicon under a patterned mask, showing the shape cut by an etch that eats in every direction, by a plasma that cuts straight down, and by a wet etch that follows crystal planes") +
            '<div class="fd-stat-row">' + stat("Depth", "depth") + stat("Undercut under the mask", "under") + stat("Width at the bottom", "bot") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Etch", "kind", [["iso", "Wet, all directions"], ["dry", "Dry plasma"], ["kohlike", "Wet, follows crystal planes"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Opening in the mask (µm)", key: "w", min: 20, max: 100, step: 5, value: 60 }) +
            slider({ label: "Etch time", key: "time", min: 0, max: 100, step: 2, value: 40 }) +
            "</div>" +
            '<p class="fd-sim-formula">Wet etching uses liquid chemistry, and dry etching uses gas or plasma. Choosing how material is removed affects the shape that is left.</p>';

        const svg = root.querySelector("svg");
        const seen = {};

        function update() {

            const top = 80;
            const cx = 170;
            const w = state.w * 1.2;
            const x0 = cx - w / 2;
            const x1 = cx + w / 2;
            const dFull = state.time * 0.8;

            let d = dFull;
            let pts;
            let under = 0;
            let bottom = w;

            if (state.kind === "iso") {

                under = d;
                bottom = w;
                pts = [[x0 - d, top]];

                for (let i = 0; i <= 12; i++) {

                    const a = Math.PI / 2 * i / 12;

                    pts.push([x0 - d * Math.cos(a), top + d * Math.sin(a)]);
                }

                for (let i = 12; i >= 0; i--) {

                    const a = Math.PI / 2 * i / 12;

                    pts.push([x1 + d * Math.cos(a), top + d * Math.sin(a)]);
                }

                pts.push([x1 + d, top]);

            } else if (state.kind === "dry") {

                under = 0;
                bottom = w;
                pts = [[x0, top], [x0, top + d], [x1, top + d], [x1, top]];

            } else {

                const dMax = w / 2 * 1.414;

                d = Math.min(d, dMax);
                const run = d / 1.414;

                bottom = Math.max(0, w - 2 * run);
                pts = [[x0, top], [x0 + run, top + d], [x1 - run, top + d], [x1, top]];
            }

            let s = rect(20, top, 300, 110, COL.si, "none");

            if (d > 0.5) { s += poly(pts, COL.bg, "none"); }

            // mask
            s += rect(20, top - 8, x0 - 20, 8, COL.mask, "none") + rect(x1, top - 8, 320 - x1, 8, COL.mask, "none");
            s += label(60, top - 14, "mask", 7, "middle", "rgba(255,214,102,1)");
            s += label(170, 196, state.kind === "iso" ? "undercuts the mask by as much as it is deep" : (state.kind === "dry" ? "cuts almost straight down" : "slopes at the crystal plane angle and can come to a point"), 7, "middle", "var(--muted)");

            svg.innerHTML = s;

            out(root, "depth", (d / 1.2).toFixed(0) + " µm");
            out(root, "under", under ? (under / 1.2).toFixed(0) + " µm each side" : "none");
            out(root, "bot", (bottom / 1.2).toFixed(0) + " µm");
            setVal(root, "w", state.w + " µm");
            setVal(root, "time", state.time + "%");

            out(root, "verdict", state.kind === "iso" ? "Rounded cavity that eats under the mask" : (state.kind === "dry" ? "Straight walls that match the mask" : "Sloped walls, set by the crystal"));

            seen[state.kind] = true;

            if (seen.iso && seen.dry && seen.kohlike) {
                F.reward("mems-etchprofile-all", 10, "You compared all three etch shapes");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 12: PLANARIZATION
    ====================================== */

    SIMS["mems-planar"] = function (root) {

        const defaults = { n: 3, cmp: "no" };
        const state = { n: 3, cmp: "no" };

        root.innerHTML =
            head("Try it: stack layers, flat or not") +
            art("0 0 340 200", "Layers stacked over a wafer. Without planarization every layer follows the bumps of the ones below it; with planarization each layer starts flat") +
            '<div class="fd-stat-row">' + stat("Layers", "n") + stat("Surface bumpiness", "bump") + stat("Limit for sharp patterns", "dof") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            seg("Flatten after each layer?", "cmp", [["no", "No"], ["yes", "Yes: planarize"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Number of layers", key: "n", min: 1, max: 6, step: 1, value: 3 }) +
            "</div>" +
            '<p class="fd-sim-formula">Multi-layer fabrication must manage the surface geometry produced by earlier steps. Each layer changes the starting condition for the next. Illustrative: each patterned layer adds about 0.5 µm of height variation.</p>';

        const svg = root.querySelector("svg");
        const colors = ["rgba(120,180,255,.55)", "rgba(84,224,199,.55)", "rgba(255,214,102,.55)", "rgba(255,105,120,.5)", "rgba(200,170,255,.55)", "rgba(255,170,90,.55)"];

        function update() {

            const n = state.n;
            const flat = state.cmp === "yes";
            const base = 170;
            const thick = 14;
            const step = 7;

            let s = rect(20, base, 300, 22, COL.si, "none");

            // bump positions per layer (each layer has its own raised feature)
            const bumps = [[70, 120], [110, 170], [150, 210], [190, 250], [230, 280], [60, 100]];

            function surface(k, x) {

                // height of the top surface after k layers at position x, in px above the base
                let h = k * thick;

                if (!flat) {

                    for (let i = 0; i < k; i++) {

                        if (x >= bumps[i][0] && x <= bumps[i][1]) { h += step; }
                    }
                }

                return h;
            }

            for (let k = 1; k <= n; k++) {

                const top = [];
                const bottom = [];

                for (let x = 20; x <= 320; x += 5) {

                    top.push([x, base - surface(k, x)]);
                    bottom.push([x, base - (k === 1 ? 0 : surface(k - 1, x))]);
                }

                s += poly(top.concat(bottom.reverse()), colors[k - 1], "rgba(245,247,255,.4)");
            }

            svg.innerHTML = s + label(170, 196, flat ? "each layer starts on a flat surface" : "every layer follows the bumps beneath it", 7, "middle", "var(--muted)");

            const bump = flat ? 0.05 : n * 0.5;
            const limit = 1.5;

            out(root, "n", n);
            out(root, "bump", bump.toFixed(2) + " µm");
            out(root, "dof", "about " + limit.toFixed(1) + " µm");
            setVal(root, "n", n);

            const chip = root.querySelector('[data-out="chip"]');

            if (bump > limit) {

                out(root, "verdict", "Too bumpy: the pattern cannot be focused everywhere");
                chip.textContent = "✕ Out of focus";
                chip.className = "fd-chip rose";

            } else if (flat) {

                out(root, "verdict", "Flat: every layer patterns cleanly");
                chip.textContent = "✓ Planarized";
                chip.className = "fd-chip";

                if (n >= 5) {
                    F.reward("mems-planar-stack", 10, "You stacked many layers with planarization");
                }

            } else {

                out(root, "verdict", "The bumps are adding up");
                chip.textContent = "⚠ Growing";
                chip.className = "fd-chip gold";
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 12: A FREE-STANDING STRUCTURE
    ====================================== */

    SIMS["mems-sacrificial"] = function (root) {

        const steps = [
            { t: "1 · Start with a silicon substrate", text: "Everything is built on the wafer." },
            { t: "2 · Deposit a process layer", text: "A thin layer is added over the substrate." },
            { t: "3 · Add sacrificial material", text: "A layer that will be removed later, opened where the structure should anchor." },
            { t: "4 · Add and pattern the structural layer", text: "The structural layer is deposited and patterned. It touches the substrate at the anchor." },
            { t: "5 · Remove the sacrificial material", text: "The release etch eats the sacrificial layer from the free end inward, leaving a free-standing mechanical structure." }
        ];

        const state = { step: 0, playing: true, t: 0, p: 0, anim: 0 };

        root.innerHTML =
            head("Watch it: build a free-standing beam") +
            art("0 0 340 190", "A cross-section built in five steps: substrate, process layer, sacrificial layer, structural beam with an anchor, and a release etch that leaves the beam free") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-play>⏸ Pause</button>' +
            steps.map(function (s, i) { return '<button type="button" class="fd-sim-btn" data-stepbtn="' + i + '">' + (i + 1) + "</button>"; }).join("") +
            "</div>" +
            '<div class="fd-sim-controls">' +
            slider({ label: "Release etch time (step 5)", key: "p", min: 0, max: 100, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Surface micromachining logic: add material, pattern it, and remove the sacrificial layer. You are using processes together to manufacture a device.</p>';

        const svg = root.querySelector("svg");
        const playBtn = root.querySelector("[data-play]");

        function draw() {

            const st = state.step;
            const p = st === 4 ? state.p / 100 : 0;

            let s = rect(30, 146, 280, 30, COL.si, "rgba(245,247,255,.4)");

            if (st >= 1) { s += rect(30, 140, 280, 6, "rgba(255,214,102,.55)", "none"); }

            // sacrificial layer shrinks from the free end during the release
            if (st >= 2) {

                const xEnd = 290 - p * (290 - 82);

                if (xEnd > 82) { s += rect(82, 128, xEnd - 82, 12, COL.sac, "none"); }
            }

            if (st === 2) { s += label(190, 122, "sacrificial layer", 7, "middle", "rgba(255,105,120,1)"); }

            if (st >= 3) {

                let beam;

                if (st === 4 && p >= 1) {

                    const a = Math.sin(state.anim * 6) * 0.045 * Math.max(0, 1 - (state.anim % 6) / 6) - 0.01;
                    const cs = Math.cos(a);
                    const sn = Math.sin(a);
                    const px = 60;
                    const py = 122;

                    function rot(x, y) {

                        const dx = x - px;
                        const dy = y - py;

                        return [px + dx * cs - dy * sn, py + dx * sn + dy * cs];
                    }

                    beam = poly([rot(60, 116), rot(250, 116), rot(250, 128), rot(60, 128)], COL.struct, "rgba(245,247,255,.7)");

                } else {

                    beam = rect(60, 116, 190, 12, COL.struct, "rgba(245,247,255,.5)");
                }

                s += beam + rect(60, 128, 22, 12, COL.struct, "none");
                s += label(70, 108, "anchor", 7, "middle", "var(--muted)");
            }

            if (st === 4 && p > 0 && p < 1) {

                const xf = 290 - p * (290 - 82);

                s += '<line x1="' + xf + '" y1="106" x2="' + xf + '" y2="144" style="stroke:rgba(255,214,102,.95);stroke-dasharray:3 3"/>';
                s += label(xf, 100, "etch front", 7, "middle", "rgba(255,214,102,1)");
            }

            if (st === 4 && p >= 1) { s += label(170, 100, "free-standing structure", 7.5, "middle", "rgba(84,224,199,1)"); }

            svg.innerHTML = s + legend([["substrate", COL.si], ["process layer", "rgba(255,214,102,.55)"], ["sacrificial", COL.sac], ["structural", COL.struct]], 186);
        }

        function render() {

            out(root, "title", steps[state.step].t);
            out(root, "text", steps[state.step].text);

            root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {
                b.classList.toggle("on", parseInt(b.dataset.stepbtn, 10) === state.step);
            });

            setVal(root, "p", state.p + "%");

            const inp = root.querySelector('input[data-key="p"]');

            if (inp && document.activeElement !== inp) {
                inp.value = state.p;
            }

            draw();

            if (state.step === 4 && state.p >= 100) {
                F.reward("mems-sacrificial-free", 10, "You released a free-standing structure");
            }
        }

        animate(root, function (dt) {

            state.anim += dt;
            state.t += dt;

            if (state.playing) {

                if (state.step < 4 && state.t > 2.4) {

                    state.step++;
                    state.t = 0;
                    state.p = 0;

                } else if (state.step === 4 && state.p < 100) {

                    state.p = Math.min(100, state.p + dt * 22);

                } else if (state.step === 4 && state.t > 9) {

                    state.step = 0;
                    state.t = 0;
                    state.p = 0;
                }
            }

            render();
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
                state.p = 0;

                render();
            });
        });

        root.querySelector('input[data-key="p"]').addEventListener("input", function (e) {

            state.playing = false;
            playBtn.textContent = "▶ Play";
            state.step = 4;
            state.p = parseFloat(e.target.value);

            render();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.step = 0;
            state.p = 0;
            state.t = 0;
            state.playing = true;
            playBtn.textContent = "⏸ Pause";

            render();
        });

        render();
    };


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="mems-"]').forEach(F.mount);

})();
