/* ========================================
   FAB VALLEY ADVENTURE: AMPFIELD
   East of PDMS City. The city's Spark Line
   tram has stopped: its batteries wore out
   from the hard bursts of braking and
   pulling away at every stop, and the
   street lights went dark with it.
   Dr. Charge's Cell Works makes a
   supercapacitor the battery way (slurry,
   doctor blade, dry, calender, glove box,
   crimp) and tests it on a cycler. At the
   Tram Depot the player sizes a series
   bank, C = 2E / (V1² − V2²), and installs
   it on the tram. Boss: The Short Circuit.

   Facts follow the Supercapacitors course
   (units 31 slurries, 38 vehicles, 40
   sizing; electrolyte windows: water about
   1.23 V, organic about 2.5–2.7 V). The
   48 V tram, the 30 kJ hop and the cell
   ratings are teaching values.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const TILE = api.TILE;
        const rect = api.rect;
        const ui = api.ui;
        const $ = (id) => document.getElementById(id);

        api.TYPES.energy = { label: "Supercaps", icon: "⚡" };


        /* ---------- The tram's numbers ---------- */

        const BUS_V = 48;       // the bank charges to 48 V
        const CUT_V = 24;       // the motor drops out below 24 V
        const HOP_KJ = 30;      // energy for one stop-to-stop hop
        const MARGIN = 1.2;     // +20% for aging (end of life = 20% capacitance loss)
        const PEAK_A = 300;     // current when the tram pulls away

        const RATINGS = [
            { id: "350", C: 350, esr: 3.2, kg: 0.06 },
            { id: "650", C: 650, esr: 0.8, kg: 0.16 },
            { id: "1200", C: 1200, esr: 0.58, kg: 0.26 },
            { id: "3000", C: 3000, esr: 0.29, kg: 0.51 }
        ];


        /* ---------- Recipe ---------- */

        const PHASES = {
            electrode: "Making the electrodes",
            cell: "Building the cell",
            tram: "Fixing the tram"
        };

        const STEPS = [
            {
                id: "material", phase: "electrode", tool: "material", short: "Active material", where: "material shelf",
                name: "Pick the active material: activated carbon",
                card: ["Choose <strong>activated carbon</strong>. It's full of tiny pores, about <strong>1,000–3,000 m²</strong> of surface per gram.",
                    "A supercapacitor stores charge as ions packed against the carbon's surface (the double layer), so more surface means more capacitance."]
            },
            {
                id: "slurry", phase: "electrode", tool: "slurry", short: "Mix the slurry", where: "slurry mixer",
                name: "Mix the slurry: 80% carbon, 10% carbon black, 10% PVDF binder",
                card: ["A common lab recipe: <strong>80%</strong> activated carbon, <strong>10%</strong> carbon black, <strong>10%</strong> binder (PVDF), stirred with a solvent into a smooth paste.",
                    "Carbon black wires the particles together for electrons. The binder glues everything to the foil.",
                    "The binder is an insulator: use the smallest amount that still holds the film together."]
            },
            {
                id: "cast", phase: "electrode", tool: "cast", short: "Cast", where: "doctor-blade coater",
                name: "Cast the slurry onto aluminum foil with the doctor blade: 150 µm wet gap",
                card: ["Blade gap: <strong>150 µm</strong> (100–200 µm works).",
                    "Thicker films store more energy but ions must travel farther, so power drops, and thick films crack when they dry."]
            },
            {
                id: "dry", phase: "electrode", tool: "dry", short: "Dry", where: "vacuum oven",
                name: "Dry the electrode in the vacuum oven at 120 °C for 12 hours",
                card: ["Dry at <strong>120 °C</strong> under vacuum for <strong>12 hours</strong> (overnight).",
                    "Leftover solvent and water break down inside the cell. Above about 170 °C the PVDF binder melts."]
            },
            {
                id: "press", phase: "electrode", tool: "press", short: "Press and punch", where: "calender press",
                name: "Press the film to about 70% of its thickness, then punch out electrode discs",
                card: ["Roll it to about <strong>70%</strong> of its dried thickness (a 30% squeeze).",
                    "Pressing packs the particles into better contact, cutting resistance. Squeeze too hard and you crush the pores ions need."]
            },
            {
                id: "electrolyte", phase: "cell", tool: "glovebox", short: "Electrolyte", where: "glove box",
                name: "In the dry glove box, choose the electrolyte: 1 M TEABF₄ in acetonitrile (2.7 V)",
                card: ["The tram's cells need <strong>2.7 V</strong> each. Water splits at about 1.23 V, so water-based electrolytes stay near 1 V.",
                    "Organic electrolyte: <strong>1 M TEABF₄ in acetonitrile</strong> reaches about <strong>2.7 V</strong>.",
                    "Work in the <strong>argon glove box</strong>: a trace of water in an organic electrolyte breaks down and gasses at high voltage."]
            },
            {
                id: "assemble", phase: "cell", tool: "crimper", short: "Assemble", where: "cell crimper",
                name: "Stack electrode, porous separator, electrode; wet with electrolyte and crimp it shut",
                card: ["Stack: electrode, <strong>porous separator</strong>, electrode. The separator keeps the electrodes from touching but lets ions through.",
                    "Add enough electrolyte to soak every pore: about <strong>6 drops</strong> for this coin cell.",
                    "Then crimp the case shut."]
            },
            {
                id: "test", phase: "cell", tool: "cycler", short: "Test", where: "cell cycler",
                name: "Charge and discharge the cell at a constant current; measure C and ESR",
                card: ["Constant-current test: <strong>20 mA</strong> up to the cell's top voltage and back down.",
                    "The instant drop when discharge starts is <strong>ΔV = I × ESR</strong> (ESR: equivalent series resistance).",
                    "The steady slope after it gives the capacitance: <strong>C = I × Δt ÷ ΔV</strong>."]
            },
            {
                id: "size", phase: "tram", tool: "sizing", short: "Size the bank", where: "Tram Depot sizing bench",
                name: "At the Tram Depot, size a bank of big cells built from your recipe",
                card: ["The tram charges its bank to <strong>48 V</strong> and stops working below <strong>24 V</strong>. One hop between stops needs <strong>30 kJ</strong>.",
                    "Usable energy: <strong>E = ½ C (V<sub>1</sub>² − V<sub>2</sub>²)</strong>. Add <strong>20%</strong> for aging.",
                    "Cells in series add their voltages, but the bank's capacitance is one cell's C divided by the number of cells. No cell may go above its rating."]
            },
            {
                id: "install", phase: "tram", tool: "tram", short: "Install and ride", where: "tram stop in the city",
                name: "Install the bank on the Spark Tram and run the line",
                card: ["Braking: the motor runs as a generator and the bank soaks up the energy.",
                    "Pulling away: the bank gives it back in a burst.",
                    "At each stop the bank tops up from the charger in about 20 seconds."]
            }
        ];

        function es() {
            const s = api.save();
            if (!s.energy) {
                s.energy = { recipe: false, step: 0, defects: {}, data: {}, stepXp: {}, runs: 0, best: 0, powered: false, boss: false, bossUp: false };
            }
            return s.energy;
        }

        function current() {
            return STEPS[es().step];
        }

        function isCurrentTool(tool) {
            const s = es();
            return s.recipe && STEPS[s.step] && STEPS[s.step].tool === tool;
        }

        function defect(sev, cause) {
            return { sev: sev, cause: cause };
        }

        function allDefects() {
            const s = es();
            return STEPS.reduce((l, st) => l.concat(s.defects[st.id] || []), []);
        }

        function cardHtml(st) {
            st = st || current();
            return st && st.card
                ? `<div class="adv-card"><p class="adv-card-title">📋 Dr. Charge's card</p><ul>${st.card.map((x) => `<li>${x}</li>`).join("")}</ul></div>`
                : "";
        }

        function open(title, lead, body, opts) {
            return api.openModal(`
                ${api.head("energy", title)}
                <p class="adv-round">Recipe step ${es().step + 1} of ${STEPS.length}</p>
                <p class="adv-lead">${lead}</p>
                ${cardHtml()}
                ${body}`, opts);
        }

        function completeStep(defs, summary) {
            const s = es();
            const st = STEPS[s.step];
            s.defects[st.id] = defs || [];
            let xp = 0;
            if (!s.stepXp[st.id]) {
                s.stepXp[st.id] = true;
                xp = 5;
            }
            s.step++;
            const next = STEPS[s.step];
            const phaseDone = next && next.phase !== st.phase;
            if (phaseDone && !s.stepXp["phase-" + st.phase]) {
                s.stepXp["phase-" + st.phase] = true;
                xp += 15;
            }
            api.writeSave();
            if (xp) {
                api.gainXP(xp);
            }
            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">STEP ${s.step} OF ${STEPS.length} DONE</p>
                    <h2>✓ ${st.short}</h2>
                    ${phaseDone ? `<p class="adv-bonus">Phase complete: ${PHASES[st.phase]}</p>` : ""}
                    <div class="adv-takeaway">${summary}</div>
                    ${next ? `<p class="adv-lead">Next: <strong>${next.name}</strong> at the ${next.where}.</p>` : ""}
                    <button type="button" class="adv-btn" data-close>Back to work</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
        }

        function resetRun() {
            const s = es();
            s.step = 0;
            s.defects = {};
            s.data = {};
            s.runs++;
            api.writeSave();
        }

        function runStages(m, capId, stages, done) {
            let i = 0;
            const next = () => {
                if (i >= stages.length) {
                    done();
                    return;
                }
                const st = stages[i++];
                $(capId).innerHTML = `<strong>Step ${i} of ${stages.length}:</strong> ${st.caption}`;
                // ~6.5 s per stage so each one can be read and watched
                ui.animate(m, Math.max(6500, st.dur), st.draw, next);
            };
            next();
        }

        function label(c, text, x, y, color, align, bold) {
            c.fillStyle = color || "#a9b2d0";
            c.font = `${bold ? "bold " : ""}11px sans-serif`;
            c.textAlign = align || "left";
            c.fillText(text, x, y);
        }

        function bg(c) {
            c.clearRect(0, 0, 460, 230);
            c.fillStyle = "#0b1020";
            c.fillRect(0, 0, 460, 230);
        }

        function canvasBlock(id) {
            return `<canvas id="${id}" width="460" height="230" class="adv-wide-canvas"></canvas><p class="adv-stage" id="${id}Cap">Ready.</p>`;
        }

        function dot(c, x, y, r, col) {
            c.fillStyle = col;
            c.beginPath();
            c.arc(x, y, r, 0, Math.PI * 2);
            c.fill();
        }

        // side view of the coated foil: foil, then a film with carbon particles
        function drawFilm(c, x, y, w, filmH, opts) {
            opts = opts || {};
            rect(c, x, y, w, 6, "#c8ceda");
            if (filmH <= 0) {
                return;
            }
            rect(c, x, y - filmH, w, filmH, opts.wet ? "#555c6e" : "#474d5c");
            const n = Math.floor(w * filmH / (opts.dense ? 70 : 110));
            for (let i = 0; i < n; i++) {
                const px = x + ((i * 37) % w);
                const py = y - 2 - ((i * 53) % Math.max(1, filmH - 3));
                dot(c, px, py, opts.dense ? 3 : 2.6, "#7a8294");
            }
            if (opts.crack) {
                c.strokeStyle = "#ff6b7d";
                c.lineWidth = 2;
                [0.3, 0.7].forEach((f) => {
                    c.beginPath();
                    c.moveTo(x + w * f, y - filmH);
                    c.lineTo(x + w * f + 5, y - filmH / 2);
                    c.lineTo(x + w * f - 2, y);
                    c.stroke();
                });
            }
        }


        /* ---------- The cell, as the tests see it ---------- */

        function model() {
            const d = es().data;
            const mat = d.mat || "ac";
            const cb = d.cb === undefined ? 10 : d.cb;
            const binder = d.binder === undefined ? 10 : d.binder;
            const active = 100 - cb - binder;
            const wet = d.wet || 150;
            const press = d.press === undefined ? 30 : d.press;
            let capF = { ac: 1, graphite: 0.06, foil: 0.01 }[mat];
            let esrF = 1;
            capF *= active / 80;
            capF *= Math.min(1.5, Math.max(0.4, wet / 150));
            esrF *= Math.max(1, wet / 200);
            if (cb < 5) {
                esrF *= 3;
            }
            if (binder > 15) {
                esrF *= 1 + (binder - 15) / 8;
                capF *= 1 - Math.min(0.4, (binder - 15) / 30);
            }
            if (binder < 5) {
                esrF *= 1.5;
            }
            if (press < 10) {
                esrF *= 1.6;
            } else if (press > 50) {
                capF *= 0.8;
            }
            if (d.wetSolvent) {
                esrF *= 1.3;
                capF *= 0.9;
            }
            if (d.drops !== undefined && d.drops < 4) {
                capF *= 0.6;
                esrF *= 2;
            }
            let v = d.elyte === "org" ? 2.7 : d.elyte ? 1.0 : 2.7;
            if (d.elyte === "org" && d.air === "open") {
                v = 2.3;
            }
            if (d.elyte && d.elyte !== "org") {
                esrF *= 0.5;
            }
            return {
                capF: Math.max(0.005, capF),
                esrF: esrF,
                v: v,
                short: d.sep && d.sep !== "pp"
            };
        }


        /* ---------- Station: material shelf ---------- */

        const MATS = [
            { id: "ac", label: "Activated carbon (≈2,000 m²/g)" },
            { id: "graphite", label: "Graphite flakes (≈10 m²/g)" },
            { id: "foil", label: "Just the bare aluminum foil" }
        ];

        function openMaterial() {
            let mat = null;
            let busy = false;
            const m = open("Material Shelf", "A supercapacitor stores charge in the electric double layer: a sheet of ions from the electrolyte packed right against the electrode's surface. So the question is: which material has the most surface?", `
                ${canvasBlock("mtCv")}
                ${ui.chips("mat", MATS, null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="mtGo" data-autofocus>Zoom in and charge it</button></div>
                <p class="adv-result" id="mtRes" aria-live="polite"></p>`);
            const c = $("mtCv").getContext("2d");
            ui.wireChips("mat", (v) => { mat = v; });

            // close-up of the surface with + ions lining up against it
            function draw(kind, k, now) {
                bg(c);
                c.fillStyle = "#3a3f4c";
                c.beginPath();
                c.moveTo(20, 200);
                if (kind === "ac") {
                    for (let x = 20; x <= 440; x += 20) {
                        const deep = 50 + ((x * 7) % 40);
                        c.lineTo(x, 200 - deep);
                        c.lineTo(x + 6, 200 - deep);
                        c.lineTo(x + 6, 130);
                        c.lineTo(x + 14, 130);
                        c.lineTo(x + 14, 200 - deep + 10);
                        c.lineTo(x + 20, 200 - deep + 10);
                    }
                } else if (kind === "graphite") {
                    for (let x = 20; x <= 440; x += 70) {
                        c.lineTo(x, 135);
                        c.lineTo(x + 50, 135);
                        c.lineTo(x + 70, 140);
                    }
                } else {
                    c.lineTo(20, 150);
                    c.lineTo(440, 150);
                }
                c.lineTo(440, 200);
                c.closePath();
                c.fill();
                rect(c, 20, 200, 420, 10, "#c8ceda");
                // ions that find a spot on the surface (count ~ surface)
                const spots = kind === "ac" ? 60 : kind === "graphite" ? 12 : 6;
                const n = Math.floor(spots * k);
                for (let i = 0; i < n; i++) {
                    const x = 30 + ((i * 397) % 400);
                    const y = kind === "ac" ? 70 + ((i * 131) % 120) : kind === "graphite" ? 128 : 143;
                    dot(c, x, Math.min(y, 196), 5, "#ffd84a");
                    c.fillStyle = "#1a2033";
                    c.font = "bold 8px sans-serif";
                    c.textAlign = "center";
                    c.fillText("+", x, Math.min(y, 196) + 3);
                }
                for (let i = 0; i < 10; i++) {
                    const x = 30 + ((now / 20 + i * 47) % 400);
                    dot(c, x, 30 + (i % 3) * 10, 4, "rgba(255, 216, 74, 0.6)");
                }
                label(c, `${n} ions stored`, 440, 20, "#f5f7ff", "right", true);
                label(c, "electrolyte ions (+)", 20, 20, "#ffd84a");
            }
            draw("ac", 0, 0);

            $("mtGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!mat) {
                    ui.result("mtRes", "Choose a material first.", false);
                    return;
                }
                busy = true;
                runStages(m, "mtCvCap", [
                    { caption: mat === "ac" ? "Up close, activated carbon is a sponge of tiny pores, like a coral reef. One gram has the surface of a few tennis courts." : mat === "graphite" ? "Graphite flakes are smooth sheets with little surface to offer." : "Bare foil is flat and smooth: almost no surface at all.", dur: 4000, draw: (k, now) => draw(mat, 0, now) },
                    { caption: "Charging: ions from the electrolyte crowd against every bit of surface they can reach. More surface, more ions, more stored charge.", dur: 5000, draw: (k, now) => draw(mat, k, now) }
                ], () => {
                    const defs = [];
                    if (mat !== "ac") {
                        defs.push(defect("major", mat === "graphite" ? "Graphite has only about 10 m²/g of surface, so the cells store a small fraction of the charge activated carbon would." : "Bare foil has almost no surface. The cell stores next to nothing."));
                    }
                    es().data.mat = mat;
                    completeStep(defs, `<p>Picked ${MATS.find((x) => x.id === mat).label.toLowerCase()}.</p>`);
                });
            });
        }


        /* ---------- Station: slurry mixer ---------- */

        function openSlurry() {
            let busy = false;
            const m = open("Slurry Mixer", "Supercapacitor electrodes are made the same way as battery electrodes: powders stirred with a solvent into a paste called a slurry.", `
                ${canvasBlock("slCv")}
                ${ui.slider("slCb", "Carbon black", "%", 0, 30, 1, 0)}
                ${ui.slider("slBi", "PVDF binder", "%", 0, 30, 1, 0)}
                <p class="adv-keys" style="text-align:left">Activated carbon: <strong id="slAc">100</strong>%</p>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="slGo" data-autofocus>Mix</button></div>
                <p class="adv-result" id="slRes" aria-live="polite"></p>`);
            const c = $("slCv").getContext("2d");
            let cbEl = null;
            let biEl = null;
            cbEl = ui.wireSlider("slCb", null, () => upd());
            biEl = ui.wireSlider("slBi", null, () => upd());

            function upd() {
                if (!cbEl || !biEl) {
                    return;
                }
                $("slAc").textContent = 100 - Number(cbEl.value) - Number(biEl.value);
                if (!busy) {
                    draw(0, 0);
                }
            }

            function draw(k, now) {
                bg(c);
                const cb = Number(cbEl.value);
                const bi = Number(biEl.value);
                const ac = 100 - cb - bi;
                // three powder piles, then a swirling bowl
                const piles = [["activated carbon", ac, "#7a8294"], ["carbon black", cb, "#3a3e48"], ["PVDF binder", bi, "#f5f7ff"]];
                piles.forEach(([name, pct, col], i) => {
                    const x = 80 + i * 150;
                    const hgt = 90 * (pct / 100) * (1 - k);
                    c.fillStyle = col;
                    c.beginPath();
                    c.moveTo(x - 40, 110);
                    c.lineTo(x, 110 - hgt);
                    c.lineTo(x + 40, 110);
                    c.fill();
                    label(c, `${name} ${pct}%`, x, 128, "#a9b2d0", "center");
                });
                if (k > 0) {
                    rect(c, 150, 150, 160, 60, "#d9e2f0");
                    rect(c, 154, 154, 152, 52, "#555c6e");
                    for (let i = 0; i < 40 * k; i++) {
                        const a = now / 300 + i * 0.7;
                        const r = 10 + (i * 5) % 60;
                        const cols = ["#7a8294", "#3a3e48", "#f5f7ff"];
                        dot(c, 230 + Math.cos(a) * r, 180 + Math.sin(a) * r * 0.3, 2, cols[i % 3]);
                    }
                    label(c, "slurry (with solvent)", 230, 224, "#a9b2d0", "center");
                }
            }
            upd();

            $("slGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const cb = Number(cbEl.value);
                const bi = Number(biEl.value);
                runStages(m, "slCvCap", [
                    { caption: `Weighing out ${100 - cb - bi}% activated carbon, ${cb}% carbon black and ${bi}% PVDF binder.`, dur: 3000, draw: (k, now) => draw(0, now) },
                    { caption: "Stirring them with solvent into a smooth, ink-like slurry. The carbon black links particles for electrons; the binder will glue them to the foil.", dur: 4500, draw: (k, now) => draw(k, now) }
                ], () => {
                    const defs = [];
                    if (cb < 5) {
                        defs.push(defect("major", `With only ${cb}% carbon black, electrons can't hop easily between carbon particles, so the resistance (ESR) is high.`));
                    } else if (cb > 20) {
                        defs.push(defect("minor", `${cb}% carbon black takes the place of activated carbon, which does the storing.`));
                    }
                    if (bi < 5) {
                        defs.push(defect("major", `${bi}% binder isn't enough glue. The film will crack and flake off the foil.`));
                    } else if (bi > 15) {
                        defs.push(defect("minor", `${bi}% binder clogs pores and adds resistance. The binder is an insulator.`));
                    }
                    es().data.cb = cb;
                    es().data.binder = bi;
                    completeStep(defs, `<p>Mixed ${100 - cb - bi} : ${cb} : ${bi} (carbon : carbon black : binder).</p>`);
                });
            });
        }


        /* ---------- Station: doctor-blade coater ---------- */

        function openCast() {
            let busy = false;
            const m = open("Doctor-Blade Coater", "A doctor blade is a straight metal edge held a set height above the foil. Drag it across a pool of slurry and it leaves a wet film exactly as thick as the gap.", `
                ${canvasBlock("caCv")}
                ${ui.slider("caGap", "Blade gap", "µm", 25, 500, 25, 25)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="caGo" data-autofocus>Cast</button></div>
                <p class="adv-result" id="caRes" aria-live="polite"></p>`);
            const c = $("caCv").getContext("2d");
            const gEl = ui.wireSlider("caGap");

            function draw(k, gap) {
                bg(c);
                const fh = Math.min(70, gap * 0.16);
                rect(c, 20, 170, 420, 6, "#c8ceda");
                label(c, "aluminum foil (current collector)", 230, 200, "#a9b2d0", "center");
                const bx = 40 + 360 * k;
                rect(c, 20, 170 - fh, bx - 20, fh, "#555c6e");
                // pool of slurry ahead of the blade
                c.fillStyle = "#555c6e";
                c.beginPath();
                c.ellipse(bx + 18, 168, 20 * (1 - k * 0.7) + 4, 14, 0, Math.PI, 0);
                c.fill();
                rect(c, bx, 60, 8, 110 - fh, "#8f98aa");
                rect(c, bx - 10, 50, 28, 12, "#5d6577");
                label(c, `gap ${gap} µm`, bx + 14, 46, "#f5f7ff", "center");
            }
            draw(0, 25);
            gEl.addEventListener("input", () => { if (!busy) { draw(0, Number(gEl.value)); } });

            $("caGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const gap = Number(gEl.value);
                runStages(m, "caCvCap", [
                    { caption: "A pool of slurry is poured along one edge of the foil.", dur: 2500, draw: () => draw(0, gap) },
                    { caption: `Dragging the blade across. It smooths the slurry into a wet film ${gap} µm thick.`, dur: 5000, draw: (k) => draw(k, gap) }
                ], () => {
                    const defs = [];
                    if (gap < 75) {
                        defs.push(defect("minor", `A ${gap} µm film holds very little carbon, so each cell stores less energy.`));
                    } else if (gap > 300) {
                        defs.push(defect("major", `A ${gap} µm film is so thick that ions must travel far (slow) and it will crack as it dries.`));
                        es().data.thick = true;
                    } else if (gap > 200) {
                        defs.push(defect("minor", `${gap} µm is on the thick side: more energy, but slower and more resistance.`));
                    }
                    es().data.wet = gap;
                    completeStep(defs, `<p>Cast a ${gap} µm wet film onto aluminum foil.</p>`);
                });
            });
        }


        /* ---------- Station: vacuum oven ---------- */

        function openDry() {
            let busy = false;
            const m = open("Vacuum Oven", "The wet film is full of solvent. Heat drives it off, and the vacuum pulls out the last traces of solvent and water from deep in the pores.", `
                ${canvasBlock("drCv")}
                ${ui.slider("drT", "Temperature", "°C", 25, 250, 5, 25)}
                ${ui.slider("drH", "Time", "h", 1, 24, 1, 1)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="drGo" data-autofocus>Dry</button></div>
                <p class="adv-result" id="drRes" aria-live="polite"></p>`);
            const c = $("drCv").getContext("2d");
            const tEl = ui.wireSlider("drT");
            const hEl = ui.wireSlider("drH");
            const wet = es().data.wet || 150;
            const fh = Math.min(70, wet * 0.16);

            function draw(k, now, T, left, crack, melt) {
                bg(c);
                rect(c, 40, 20, 380, 190, "#3a4256");
                rect(c, 50, 30, 360, 170, `rgba(255, 150, 60, ${0.08 + 0.3 * Math.min(1, (T - 25) / 150) * Math.min(1, k * 3)})`);
                label(c, `${Math.round(25 + (T - 25) * Math.min(1, k * 3))} °C · vacuum`, 60, 50, "#f5f7ff", "left", true);
                const h = fh * (1 - 0.45 * (1 - left));
                drawFilm(c, 80, 170, 300, h, { wet: left > 0.3, crack: crack, dense: true });
                if (melt) {
                    rect(c, 80, 170 - h, 300, 4, "rgba(255, 255, 255, 0.5)");
                }
                // solvent vapor leaving
                const n = Math.floor(14 * left);
                for (let i = 0; i < n; i++) {
                    const ph = ((now / 1500) + i / n) % 1;
                    dot(c, 90 + ((i * 41) % 280), 160 - h - ph * 90, 2.5, "rgba(180, 220, 255, 0.6)");
                }
                label(c, left > 0.05 ? "solvent vapor rising" : "dry", 230, 200, "#a9b2d0", "center");
            }
            draw(0, 0, 25, 1, false, false);

            $("drGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                const H = Number(hEl.value);
                const rate = T < 60 ? 0.05 : T < 100 ? 0.08 : 0.12;
                const left = Math.max(0, 1 - rate * H * (T < 60 ? 1 : 1.2));
                const crack = !!es().data.thick || es().data.binder < 5;
                const melt = T > 170;
                runStages(m, "drCvCap", [
                    { caption: `Heating to ${T} °C under vacuum. The solvent boils off at a much lower temperature than it would in air.`, dur: 3500, draw: (k, now) => draw(k * 0.3, now, T, 1, false, false) },
                    { caption: `${H} h later… ${left > 0.15 ? "there's still solvent trapped in the pores." : "the film is dry and has shrunk down onto the foil."}${crack ? " The film cracked as it shrank." : ""}${melt ? " It's hot enough to melt the PVDF binder." : ""}`, dur: 4500, draw: (k, now) => draw(1, now, T, 1 - (1 - left) * k, crack && k > 0.6, melt && k > 0.5) }
                ], () => {
                    const defs = [];
                    if (left > 0.15) {
                        es().data.wetSolvent = true;
                        defs.push(defect(left > 0.5 ? "major" : "minor", `${H} h at ${T} °C left solvent in the pores. It will break down inside the cell, raising resistance and leaking current.`));
                    }
                    if (melt) {
                        defs.push(defect("major", `${T} °C is above PVDF's melting point (about 170 °C). The melted binder smeared over the carbon and coated its pores.`));
                        es().data.binder = 25;
                    }
                    if (crack) {
                        defs.push(defect("minor", "The film cracked while drying (too thick, or too little binder), breaking some electron paths."));
                    }
                    completeStep(defs, `<p>Dried at ${T} °C for ${H} h.</p>`);
                });
            });
        }


        /* ---------- Station: calender press ---------- */

        function openPress() {
            let busy = false;
            const m = open("Calender Press", "A calender is a pair of steel rollers. Rolling the dried film between them squeezes the particles into tight contact, then a punch cuts round electrodes for the coin cell.", `
                ${canvasBlock("prCv")}
                ${ui.slider("prPct", "Squeeze (thickness reduction)", "%", 0, 70, 5, 0)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="prGo" data-autofocus>Press and punch</button></div>
                <p class="adv-result" id="prRes" aria-live="polite"></p>`);
            const c = $("prCv").getContext("2d");
            const pEl = ui.wireSlider("prPct");

            function draw(k, pct, punch) {
                bg(c);
                const before = 50;
                const after = before * (1 - pct / 100);
                const rx = 60 + 340 * k;
                // film: thick ahead of the rollers, thin behind
                rect(c, 20, 150, 420, 5, "#c8ceda");
                drawFilm(c, 20, 150, Math.max(0, rx - 20), after, { dense: pct >= 10 });
                drawFilm(c, rx, 150, Math.max(0, 440 - rx), before, {});
                [[rx, 150 - after - 34], [rx, 189]].forEach(([x, y]) => {
                    dot(c, x, y, 34, "#8f98aa");
                    dot(c, x, y, 28, "#aab3c4");
                    c.strokeStyle = "#5d6577";
                    c.beginPath();
                    c.moveTo(x, y);
                    c.lineTo(x + Math.cos(k * 20) * 26, y + Math.sin(k * 20) * 26);
                    c.stroke();
                });
                if (pct > 50 && k > 0.2) {
                    label(c, "pores crushed!", 60, 120, "#ff9aa6");
                }
                if (punch > 0) {
                    bg(c);
                    for (let i = 0; i < 3; i++) {
                        const x = 100 + i * 130;
                        dot(c, x, 120, 34, "#c8ceda");
                        dot(c, x, 120, 30 * Math.min(1, punch * 1.5), "#555c6e");
                    }
                    label(c, "electrode discs, ready for the cell", 230, 200, "#a9b2d0", "center");
                }
            }
            draw(0, 0, 0);

            $("prGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const pct = Number(pEl.value);
                runStages(m, "prCvCap", [
                    { caption: pct > 0 ? `Rolling the film through the calender, squeezing it ${pct}% thinner.` : "Skipping the press: the film stays fluffy, with loose contacts between particles.", dur: 5000, draw: (k) => draw(pct > 0 ? k : 0, pct, 0) },
                    { caption: "Punching out round electrode discs.", dur: 3000, draw: (k) => draw(1, pct, k) }
                ], () => {
                    const defs = [];
                    if (pct < 10) {
                        defs.push(defect("minor", "Without pressing, the particles barely touch each other or the foil, so resistance is high."));
                    } else if (pct > 50) {
                        defs.push(defect("minor", `A ${pct}% squeeze crushed the pores ions use to reach the carbon's surface.`));
                    }
                    es().data.press = pct;
                    completeStep(defs, `<p>Pressed ${pct}% thinner and punched the electrodes.</p>`);
                });
            });
        }


        /* ---------- Station: glove box (electrolyte) ---------- */

        const ELYTES = [
            { id: "aq", label: "1 M H₂SO₄ in water" },
            { id: "koh", label: "6 M KOH in water" },
            { id: "org", label: "1 M TEABF₄ in acetonitrile" }
        ];

        function openGlovebox() {
            let el = null;
            let air = null;
            let busy = false;
            const m = open("Glove Box", "The electrolyte supplies the ions, and its stability sets the cell's top voltage. Since stored energy goes with V², voltage matters a lot.", `
                ${canvasBlock("gbCv")}
                <p class="adv-round">Electrolyte</p>
                ${ui.chips("ely", ELYTES, null)}
                <p class="adv-round">Where to work</p>
                ${ui.chips("air", [{ id: "box", label: "Inside the argon glove box" }, { id: "open", label: "On the open bench (humid air)" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="gbGo" data-autofocus>Fill and test the voltage window</button></div>
                <p class="adv-result" id="gbRes" aria-live="polite"></p>`);
            const c = $("gbCv").getContext("2d");
            ui.wireChips("ely", (v) => { el = v; });
            ui.wireChips("air", (v) => { air = v; });

            function draw(k, now, maxV, limit) {
                bg(c);
                // a voltage meter rising, with bubbles once past the limit
                const V = maxV * k;
                rect(c, 40, 30, 40, 170, "#1a2033");
                const fill = 160 * Math.min(1, V / 3.2);
                rect(c, 44, 196 - fill, 32, fill, V > limit ? "#ff6b7d" : "#5be38a");
                [1, 2, 3].forEach((v) => {
                    const y = 196 - 160 * v / 3.2;
                    rect(c, 80, y, 8, 1, "#a9b2d0");
                    label(c, `${v} V`, 92, y + 4);
                });
                const ly = 196 - 160 * limit / 3.2;
                rect(c, 40, ly, 60, 2, "#ffd84a");
                label(c, `safe limit ≈ ${limit.toFixed(1)} V`, 130, ly + 4, "#ffd84a");
                label(c, `${V.toFixed(2)} V`, 60, 22, "#f5f7ff", "center", true);
                // cell with electrolyte
                rect(c, 260, 90, 150, 100, "#d9e2f0");
                rect(c, 264, 100, 142, 86, el === "org" ? "rgba(255, 230, 160, 0.5)" : "rgba(127, 178, 255, 0.5)");
                rect(c, 280, 80, 10, 100, "#474d5c");
                rect(c, 380, 80, 10, 100, "#474d5c");
                if (V > limit) {
                    for (let i = 0; i < 12; i++) {
                        const ph = ((now / 900) + i / 12) % 1;
                        c.strokeStyle = "rgba(255,255,255,0.8)";
                        c.beginPath();
                        c.arc((i % 2 ? 296 : 374) + (i % 3) * 3, 180 - ph * 80, 3, 0, Math.PI * 2);
                        c.stroke();
                    }
                    label(c, el === "org" ? "water traces breaking down: gas!" : "water splitting: gas!", 335, 214, "#ff9aa6", "center");
                }
            }
            draw(0, 0, 2.7, 2.7);

            $("gbGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!el || !air) {
                    ui.result("gbRes", "Choose an electrolyte and where to work.", false);
                    return;
                }
                busy = true;
                const limit = el === "org" ? (air === "open" ? 2.3 : 2.7) : 1.0;
                runStages(m, "gbCvCap", [
                    { caption: `Filling a test cell with ${ELYTES.find((x) => x.id === el).label}${air === "box" ? " inside the argon-filled glove box, where there's almost no water or oxygen" : " on the open bench, where it soaks up moisture from the air"}.`, dur: 3000, draw: (k, now) => draw(0, now, 2.7, limit) },
                    { caption: `Raising the voltage toward the tram's 2.7 V per cell… ${limit >= 2.7 ? "it holds steady all the way." : `past about ${limit.toFixed(1)} V the electrolyte starts breaking down into gas.`}`, dur: 6000, draw: (k, now) => draw(k, now, 2.7, limit) }
                ], () => {
                    const defs = [];
                    if (el !== "org") {
                        defs.push(defect("major", "A water-based electrolyte is limited to about 1 V per cell (water splits at 1.23 V). Since energy goes with V², each cell stores about 7× less than at 2.7 V, and the tram needs far more cells."));
                    } else if (air === "open") {
                        defs.push(defect("major", "Moisture from the air got into the organic electrolyte. It breaks down above about 2.3 V, so the cells must run at lower voltage, and they swell over time."));
                    }
                    es().data.elyte = el;
                    es().data.air = air;
                    completeStep(defs, `<p>Chose ${ELYTES.find((x) => x.id === el).label}${air === "box" ? " in the glove box" : " on the open bench"}. Cell limit: about ${limit.toFixed(1)} V.</p>`);
                });
            });
        }


        /* ---------- Station: cell crimper ---------- */

        function openCrimper() {
            let sep = null;
            let busy = false;
            const m = open("Cell Crimper", "Time to build a coin cell, a button-sized test cell. Two electrodes face each other with electrolyte between, and something must keep them from touching.", `
                ${canvasBlock("crCv")}
                <p class="adv-round">Between the electrodes</p>
                ${ui.chips("sep", [{ id: "pp", label: "Porous separator" }, { id: "none", label: "Nothing" }, { id: "foil", label: "A sheet of aluminum foil" }], null)}
                ${ui.slider("crDrops", "Electrolyte", "drops", 0, 12, 1, 0)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="crGo" data-autofocus>Stack and crimp</button></div>
                <p class="adv-result" id="crRes" aria-live="polite"></p>`);
            const c = $("crCv").getContext("2d");
            ui.wireChips("sep", (v) => { sep = v; });
            const dEl = ui.wireSlider("crDrops");

            function draw(k, now, kind, drops, closed, spark) {
                bg(c);
                const gap = 30 * (1 - Math.min(1, k));
                const cx = 230;
                // can bottom, electrode, separator, electrode, cap
                rect(c, cx - 110, 170, 220, 14, "#aab3c4");
                rect(c, cx - 90, 158, 180, 12, "#555c6e");
                if (kind === "pp") {
                    rect(c, cx - 95, 150 - gap * 0.5, 190, 6, "#f5f7ff");
                    for (let x = cx - 92; x < cx + 92; x += 7) {
                        rect(c, x, 152 - gap * 0.5, 2, 2, "#5d6577");
                    }
                } else if (kind === "foil") {
                    rect(c, cx - 95, 150 - gap * 0.5, 190, 5, "#c8ceda");
                }
                rect(c, cx - 90, 138 - gap - (kind === "none" ? -8 : 0), 180, 12, "#555c6e");
                rect(c, cx - 110, 120 - gap * 2 - (closed ? 0 : 20), 220, 14, "#aab3c4");
                if (closed) {
                    rect(c, cx - 116, 120, 8, 64, "#8f98aa");
                    rect(c, cx + 108, 120, 8, 64, "#8f98aa");
                }
                for (let i = 0; i < drops; i++) {
                    const ph = Math.min(1, Math.max(0, k * 3 - i * 0.2));
                    if (ph < 1) {
                        dot(c, cx - 50 + i * 9, 40 + ph * 110, 4, "rgba(255, 230, 160, 0.8)");
                    }
                }
                if (spark) {
                    for (let i = 0; i < 6; i++) {
                        const x = cx - 80 + ((now / 4 + i * 37) % 160);
                        c.strokeStyle = "#ffd84a";
                        c.lineWidth = 2;
                        c.beginPath();
                        c.moveTo(x, 140);
                        c.lineTo(x + 5, 148);
                        c.lineTo(x - 3, 152);
                        c.lineTo(x + 4, 160);
                        c.stroke();
                    }
                    label(c, "SHORT CIRCUIT: the electrodes touch", cx, 30, "#ff9aa6", "center", true);
                }
                label(c, "coin cell (side view)", cx, 214, "#a9b2d0", "center");
            }
            draw(0, 0, "pp", 0, false, false);

            $("crGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!sep) {
                    ui.result("crRes", "Choose what goes between the electrodes.", false);
                    return;
                }
                busy = true;
                const drops = Number(dEl.value);
                const short = sep !== "pp";
                runStages(m, "crCvCap", [
                    { caption: `Stacking: electrode, ${sep === "pp" ? "porous separator" : sep === "foil" ? "aluminum foil" : "nothing"}, electrode, with ${drops} drop${drops === 1 ? "" : "s"} of electrolyte soaking in.`, dur: 4500, draw: (k, now) => draw(k, now, sep, drops, false, false) },
                    { caption: short ? (sep === "foil" ? "Crimped shut… but metal foil conducts electrons. It connects the two electrodes directly, and blocks the ions too." : "Crimped shut… and the electrodes squash together. Electrons rush straight across: a short circuit.") : "Crimped shut. The separator keeps the electrodes apart while ions pass through its pores.", dur: 4000, draw: (k, now) => draw(1, now, sep, 0, true, short) }
                ], () => {
                    const defs = [];
                    if (short) {
                        defs.push(defect("major", sep === "foil" ? "Metal foil between the electrodes is a direct short. The cell can't hold any charge." : "With no separator the electrodes touch. Short circuit: the cell can't hold any charge."));
                    }
                    if (drops < 4) {
                        defs.push(defect("major", `${drops} drops left parts of the electrodes dry. Dry pores store nothing and add resistance.`));
                    } else if (drops > 9) {
                        defs.push(defect("minor", `${drops} drops overflowed when crimping, so the seal may leak.`));
                    }
                    es().data.sep = sep;
                    es().data.drops = drops;
                    completeStep(defs, `<p>Built a coin cell with ${sep === "pp" ? "a porous separator" : sep === "foil" ? "foil between the electrodes" : "no separator"} and ${drops} drops of electrolyte.</p>`);
                });
            });
        }


        /* ---------- Station: cell cycler ---------- */

        function openCycler() {
            const md = model();
            const I = 0.02;
            const C = +(0.12 * md.capF).toFixed(3);
            const esr = +(10 * md.esrF).toFixed(1);
            const Vtop = md.short ? 0.02 : md.v;
            const ir = +(I * esr).toFixed(2);
            const dV = +(Math.max(0.01, Vtop - ir)).toFixed(2);
            const dt = +(C * dV / I).toFixed(1);
            const m = open("Cell Cycler", "The cycler pushes a constant current in to charge the cell, then pulls the same current out. For a supercapacitor the voltage climbs and falls in nearly straight lines.", `
                ${canvasBlock("cyCv")}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="cyGo" data-autofocus>Run a charge–discharge cycle at 20 mA</button></div>
                <div id="cyQ"></div>`);
            const c = $("cyCv").getContext("2d");
            $("cyCvCap").textContent = "Press the button to run one charge–discharge cycle.";
            const tCharge = md.short ? 2 : dt;

            function draw(k) {
                const pts = [];
                const total = tCharge + 2 + dt;
                const steps = 160;
                for (let i = 0; i <= steps * k; i++) {
                    const t = total * i / steps;
                    let v;
                    if (md.short) {
                        v = 0.01 * Math.random();
                    } else if (t <= tCharge) {
                        v = ir + (Vtop - ir) * (t / tCharge);
                    } else if (t <= tCharge + 2) {
                        v = Vtop;
                    } else {
                        v = (Vtop - ir) * (1 - (t - tCharge - 2) / dt);
                    }
                    pts.push([t, Math.max(0, v)]);
                }
                ui.plot(c, 460, 230, [{ pts: pts, color: "#ffd84a" }], {
                    x0: 0, x1: total, y0: 0, y1: 3,
                    xLabel: "time (s)", yLabel: "cell voltage (V)",
                    xTicks: [0, Math.round(total / 2), Math.round(total)],
                    yTicks: [0, 1, 2, 3]
                }, 1);
            }
            draw(0);

            $("cyGo").addEventListener("click", () => {
                $("cyGo").disabled = true;
                $("cyCvCap").innerHTML = "Charging at a constant 20 mA: the voltage climbs in a straight line. Then the current flips and the cell discharges.";
                ui.animate(m, 6500, (k) => draw(k), () => {
                    $("cyCvCap").innerHTML = md.short ? "The voltage never rose." : "Notice the small instant drop at the top when discharge begins: that's the ESR.";
                    if (md.short) {
                        $("cyQ").innerHTML = `<div class="adv-takeaway"><p>⚠️ The voltage won't rise at all. Current flows straight through the cell: it's shorted. There's nothing to measure.</p></div><div class="adv-button-row"><button type="button" class="adv-btn" id="cyDone">Log it</button></div>`;
                        $("cyDone").addEventListener("click", () => completeStep([defect("major", "The coin cell is shorted and stores no charge.")], "<p>The test cell is shorted.</p>"));
                        return;
                    }
                    const cOpts = SCG([
                        { v: `${C} F`, ok: true },
                        { v: `${(I * dV / dt).toFixed(4)} F` },
                        { v: `${(dt / (I * dV)).toFixed(0)} F` },
                        { v: `${(I * dt * dV).toFixed(3)} F` }
                    ]);
                    const rOpts = SCG([
                        { v: `${esr} Ω`, ok: true },
                        { v: `${(ir * I).toFixed(4)} Ω` },
                        { v: `${(ir + I).toFixed(2)} Ω` },
                        { v: `${(esr * 10).toFixed(0)} Ω` }
                    ]);
                    $("cyQ").innerHTML = `
                        <div class="adv-takeaway">
                            <p>When discharge starts, the voltage drops instantly by <strong>${ir} V</strong>. Then it falls steadily from <strong>${dV} V</strong> to 0 V in <strong>${dt} s</strong>, at I = <strong>20 mA</strong>.</p>
                            <p><strong>1. What's the capacitance?</strong> (C = I × Δt ÷ ΔV)</p>
                            <div class="adv-chips">${cOpts.map((o, i) => `<button type="button" class="adv-chip" data-cq="${i}">${o.v}</button>`).join("")}</div>
                            <p class="adv-result" id="cqRes"></p>
                            <p><strong>2. What's the ESR?</strong> (ΔV = I × ESR)</p>
                            <div class="adv-chips">${rOpts.map((o, i) => `<button type="button" class="adv-chip" data-rq="${i}">${o.v}</button>`).join("")}</div>
                            <p class="adv-result" id="rqRes"></p>
                        </div>
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="cyDone" hidden>Log the results</button></div>`;
                    let a1 = false;
                    let a2 = false;
                    const check = () => {
                        if (a1 && a2) {
                            $("cyDone").hidden = false;
                            $("cyDone").focus();
                        }
                    };
                    api.modalBody().querySelectorAll("[data-cq]").forEach((b) => b.addEventListener("click", () => {
                        if (a1) {
                            return;
                        }
                        a1 = true;
                        b.classList.add("on");
                        const ok = cOpts[Number(b.dataset.cq)].ok;
                        ui.result("cqRes", `${ok ? "✓" : "✗"} C = 0.020 A × ${dt} s ÷ ${dV} V = <strong>${C} F</strong>.`, !!ok);
                        check();
                    }));
                    api.modalBody().querySelectorAll("[data-rq]").forEach((b) => b.addEventListener("click", () => {
                        if (a2) {
                            return;
                        }
                        a2 = true;
                        b.classList.add("on");
                        const ok = rOpts[Number(b.dataset.rq)].ok;
                        ui.result("rqRes", `${ok ? "✓" : "✗"} ESR = ${ir} V ÷ 0.020 A = <strong>${esr} Ω</strong>.`, !!ok);
                        check();
                    }));
                    $("cyDone").addEventListener("click", () => {
                        const defs = [];
                        if (C < 0.06) {
                            defs.push(defect("major", `${C} F is well under the ~0.12 F a good cell of this size reaches. The big cells will come out weak too.`));
                        }
                        if (esr > 20) {
                            defs.push(defect("minor", `An ESR of ${esr} Ω is high (a good cell here is about 10 Ω). The tram will lose more voltage the instant it pulls away.`));
                        }
                        completeStep(defs, `<p>Test cell: <strong>${C} F</strong>, ESR <strong>${esr} Ω</strong>, up to ${md.v} V. Dr. Charge's factory will now roll your recipe into big jelly-roll cells for the tram.</p>`);
                    });
                });
            });
        }

        function SCG(list) {
            return window.SCGames ? window.SCGames.shuffle(list) : list;
        }


        /* ---------- Station: sizing bench (Tram Depot) ---------- */

        function cellsFromRecipe() {
            const md = model();
            const f = Math.min(1.1, md.capF);
            return RATINGS.map((r) => ({
                id: r.id,
                rated: r.C,
                C: Math.round(r.C * f),
                esr: +(r.esr * md.esrF).toFixed(2),
                kg: r.kg,
                v: md.v
            }));
        }

        function bankStats(cell, n) {
            const vPer = BUS_V / n;
            const Cb = cell.C / n;
            const E = 0.5 * Cb * (BUS_V * BUS_V - CUT_V * CUT_V) / 1000;
            const esrB = n * cell.esr / 1000;
            const drop = PEAK_A * esrB;
            return { vPer: vPer, Cb: Cb, E: E, drop: drop, kg: n * cell.kg, over: vPer > cell.v + 1e-9 };
        }

        function openSizing() {
            const cells = cellsFromRecipe();
            let pick = null;
            const m = open("Sizing Bench", "The factory rolled your recipe into big jelly-roll cells: long electrode strips wound up with separator, like a cinnamon roll in a can. Now build the tram's bank from them.", `
                <div class="adv-takeaway"><p>Cells made with your recipe (each up to <strong>${cells[0].v} V</strong>):</p></div>
                ${ui.chips("cell", cells.map((x) => ({ id: x.id, label: `${x.C} F` + (x.C !== x.rated ? ` (rated ${x.rated} F)` : "") })), null)}
                ${ui.slider("szN", "Cells in series", "", 1, 60, 1, 1)}
                <ul class="adv-stats" id="szStats"></ul>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="szGo" data-autofocus>Build the bank</button></div>
                <p class="adv-result" id="szRes" aria-live="polite"></p>`);
            let nEl = null;
            nEl = ui.wireSlider("szN", null, () => show());
            ui.wireChips("cell", (v) => { pick = v; show(); });

            function show() {
                const box = $("szStats");
                if (!box || !nEl) {
                    return;
                }
                if (!pick) {
                    box.innerHTML = "<li>Pick a cell size first</li>";
                    return;
                }
                const cell = cells.find((x) => x.id === pick);
                const b = bankStats(cell, Number(nEl.value));
                const good = (ok) => ok ? "style=\"color:#5be38a\"" : "style=\"color:#ff9aa6\"";
                box.innerHTML = `
                    <li>Volts per cell at 48 V <strong ${good(!b.over)}>${b.vPer.toFixed(2)} V</strong></li>
                    <li>Bank capacitance <strong>${b.Cb.toFixed(1)} F</strong></li>
                    <li>Usable energy, 48 → 24 V <strong ${good(b.E >= HOP_KJ * MARGIN)}>${b.E.toFixed(1)} kJ</strong></li>
                    <li>Instant drop at ${PEAK_A} A <strong ${good(b.drop <= 8)}>${b.drop.toFixed(1)} V</strong></li>
                    <li>Bank weight <strong>${b.kg.toFixed(1)} kg</strong></li>`;
            }
            show();

            $("szGo").addEventListener("click", () => {
                if (!pick) {
                    ui.result("szRes", "Pick a cell size first.", false);
                    return;
                }
                const cell = cells.find((x) => x.id === pick);
                const n = Number(nEl.value);
                const b = bankStats(cell, n);
                const defs = [];
                if (b.over) {
                    defs.push(defect("major", `${n} cells means ${b.vPer.toFixed(2)} V on each, above their ${cell.v} V limit. The electrolyte breaks down and the cells swell.`));
                }
                if (b.E < HOP_KJ) {
                    defs.push(defect("major", `The bank only holds ${b.E.toFixed(1)} kJ between 48 and 24 V, less than the ${HOP_KJ} kJ one hop needs. The tram stalls between stops.`));
                } else if (b.E < HOP_KJ * MARGIN) {
                    defs.push(defect("minor", `${b.E.toFixed(1)} kJ covers a hop today, but not after the cells age and lose 20% of their capacitance.`));
                } else if (b.E > HOP_KJ * MARGIN * 2.5) {
                    defs.push(defect("minor", `${b.E.toFixed(1)} kJ is far more than needed. The bank is heavier and costlier than it has to be (${b.kg.toFixed(1)} kg).`));
                }
                if (b.drop > 8) {
                    defs.push(defect("minor", `The bank's resistance drops ${b.drop.toFixed(1)} V the instant the tram pulls away at ${PEAK_A} A. Late in a hop that can dip under 24 V and make the tram stutter.`));
                }
                const d = es().data;
                d.bank = { cell: cell.id, C: cell.C, n: n, E: +b.E.toFixed(1), drop: +b.drop.toFixed(1), over: b.over };
                const minN = Math.ceil(BUS_V / cell.v);
                completeStep(defs, `
                    <p>Built a bank of ${n} × ${cell.C} F cells: ${b.Cb.toFixed(1)} F, ${b.E.toFixed(1)} kJ usable.</p>
                    <p>How it works out: ${cell.v} V cells need at least 48 ÷ ${cell.v} → <strong>${minN} in series</strong>. Then C<sub>bank</sub> = C<sub>cell</sub> ÷ n, and E = ½ C<sub>bank</sub> (48² − 24²) must reach ${HOP_KJ} kJ × 1.2 = ${HOP_KJ * MARGIN} kJ.</p>`);
            });
        }


        /* ---------- Station: the tram (install and ride) ---------- */

        function openTram() {
            const d = es().data;
            const bank = d.bank || { E: 0, n: 0, C: 0, drop: 0 };
            const md = model();
            const dead = md.short || bank.over || bank.E < HOP_KJ;
            const stutter = !dead && bank.drop > 8;
            const m = open("Spark Tram", "Bolt the supercapacitor bank under the tram, connect it to the motor, and take it out on the line.", `
                ${canvasBlock("trCv")}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="trGo" data-autofocus>Install and run the line</button></div>`);
            const c = $("trCv").getContext("2d");
            const stops = [60, 230, 400];
            const hopFrac = dead ? 0.55 : 1;

            // energy left in the bank (0..1 of what it holds above 24 V)
            function scene(tx, energy, status, now, sparks) {
                bg(c);
                rect(c, 20, 150, 420, 4, "#8f98aa");
                for (let x = 24; x < 440; x += 14) {
                    rect(c, x, 154, 8, 3, "#5d6577");
                }
                stops.forEach((x, i) => {
                    rect(c, x - 2, 110, 4, 40, "#5d6577");
                    rect(c, x - 14, 104, 28, 8, "#2ebfa5");
                    label(c, `Stop ${i + 1}`, x, 100, "#a9b2d0", "center");
                });
                // tram
                rect(c, tx - 34, 116, 68, 32, "#ffb84a");
                rect(c, tx - 30, 120, 60, 12, "#33405c");
                rect(c, tx - 2, 104, 4, 12, "#1a2033");
                dot(c, tx - 20, 148, 5, "#1a2033");
                dot(c, tx + 20, 148, 5, "#1a2033");
                rect(c, tx - 24, 140, 48, 6, "#54e0c7");
                if (sparks) {
                    for (let i = 0; i < 5; i++) {
                        const a = now / 60 + i;
                        dot(c, tx + Math.cos(a) * 30, 140 + Math.sin(a) * 10, 2, "#ffd84a");
                    }
                }
                // energy bar
                rect(c, 20, 20, 200, 16, "#1a2033");
                rect(c, 22, 22, 196 * Math.max(0, Math.min(1, energy)), 12, energy > 0.25 ? "#5be38a" : "#ff6b7d");
                label(c, "bank energy", 228, 32, "#a9b2d0");
                label(c, status, 20, 210, "#f5f7ff", "left", true);
            }
            scene(stops[0], 1, "Bank charged to 48 V at Stop 1.", 0, false);

            // one hop: pull away (drain fast), cruise (drain slow), brake (refill some)
            function hop(from, to, frac) {
                return (k, now) => {
                    const dist = (to - from) * frac;
                    const x = from + dist * (k < 0.3 ? (k / 0.3) * (k / 0.3) * 0.25 : k < 0.75 ? 0.25 + (k - 0.3) / 0.45 * 0.6 : 0.85 + (1 - Math.pow(1 - (k - 0.75) / 0.25, 2)) * 0.15);
                    let e;
                    let status;
                    if (k < 0.3) {
                        e = 1 - (k / 0.3) * 0.6;
                        status = stutter && k > 0.2 ? "Pulling away… the voltage dips and the tram stutters!" : "Pulling away: the bank delivers a burst of power.";
                    } else if (k < 0.75) {
                        e = 0.4 - ((k - 0.3) / 0.45) * 0.25;
                        status = "Cruising: a steady trickle of power.";
                    } else {
                        e = 0.15 + ((k - 0.75) / 0.25) * 0.2;
                        status = "Braking: the motor becomes a generator and refills the bank!";
                    }
                    if (dead && k > 0.5) {
                        e = Math.max(0, 0.2 - (k - 0.5));
                        status = "The bank is empty… the tram stalls between stops.";
                        scene(from + dist * Math.min(1, 0.6 + 0.4 * (k - 0.5)), e, status, now, false);
                        return;
                    }
                    scene(x, e, status, now, k > 0.75);
                };
            }

            function charge(at) {
                return (k, now) => {
                    scene(at, 0.35 + 0.65 * k, `Recharging at the stop: full again in about 20 seconds.`, now, true);
                };
            }

            $("trGo").addEventListener("click", () => {
                $("trGo").disabled = true;
                const stages = [
                    { caption: `Installing ${bank.n} cells under the floor and charging the bank to 48 V.`, dur: 3000, draw: (k, now) => scene(stops[0], k, "Charging…", now, true) },
                    { caption: "Hop 1: pull away from Stop 1, cruise, then brake into Stop 2.", dur: 7000, draw: hop(stops[0], stops[1], hopFrac) }
                ];
                if (!dead) {
                    stages.push(
                        { caption: "At Stop 2 the overhead charger tops the bank up while passengers board.", dur: 4000, draw: charge(stops[1]) },
                        { caption: "Hop 2: on to Stop 3. The same charge is recycled stop after stop, thousands of times a day.", dur: 7000, draw: hop(stops[1], stops[2], 1) }
                    );
                }
                runStages(m, "trCvCap", stages, () => {
                    const defs = [];
                    if (dead) {
                        defs.push(defect("major", md.short ? "The bank's cells were shorted and couldn't power the tram." : bank.over ? "Overvolted cells failed on the first run." : "The bank ran dry between stops."));
                    }
                    es().powered = true;
                    completeStep(defs, dead
                        ? "<p>The tram stalled, but the crew towed it in and wired a backup so the street lights could come back on. Check the report to see why.</p>"
                        : "<p>The Spark Tram is running again, and the depot's power is feeding the street lights!</p>");
                    finishBatch(dead);
                });
            });
        }

        function finishBatch(dead) {
            const s = es();
            const defs = allDefects();
            const majors = defs.filter((d) => d.sev === "major").length;
            const stars = !defs.length ? 3 : !majors ? 2 : 1;
            const first = !s.best;
            const xp = first ? 200 + stars * 25 : stars > s.best ? (stars - s.best) * 25 : 0;
            s.best = Math.max(s.best, stars);
            s.bossUp = true;
            api.writeSave();
            if (xp) {
                api.gainXP(xp);
            }
            api.awardSiteXP("energybatch", 200);
            const b = s.data.bank || {};
            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">TRAM REPORT</p>
                    <h2>⚡ Spark Line Supercap Bank</h2>
                    <p class="adv-stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
                    ${xp ? `<p class="adv-xp-big">+${xp} XP</p>` : ""}
                    <ul class="adv-stats" style="justify-content:center">
                        <li>Bank <strong>${b.n || 0} × ${b.C || 0} F</strong></li>
                        <li>Usable energy <strong>${b.E || 0} kJ</strong></li>
                        <li>Tram <strong>${dead ? "stalled" : "running"}</strong></li>
                    </ul>
                    <div class="adv-takeaway">
                        ${defs.length ? defs.map((d) => `<p>${d.sev === "major" ? "⚠️" : "•"} ${d.cause}</p>`).join("") : "<p>A flawless bank, from slurry to tram!</p>"}
                    </div>
                    <p class="adv-calib">⚡ <strong>${s.boss ? "Rematch!" : "Boss unlocked!"}</strong> Sparks are crackling around the Big Farad statue in the plaza…</p>
                    <button type="button" class="adv-btn" data-close>Back to the city</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
            api.afterModal(() => api.say([
                dead ? "Not quite this time, but we learned exactly what to fix. The lights are back on, at least!" : "Listen to that: the Spark Line is humming again, and the street lights are on!",
                "But… something is crackling around the Big Farad statue. It's The Short Circuit, the menace of every power system. Go!"
            ], "Dr. Charge"));
        }


        /* ---------- Boss: The Short Circuit ---------- */

        function drawShort(c, ox, oy, s, t) {
            const px = (x, y, w, h, col) => rect(c, ox + x * s, oy + y * s, w * s, h * s, col);
            const bob = Math.sin(t / 300) * 1.5;
            px(4, 30, 24, 2, "rgba(0,0,0,0.25)");
            // zigzag lightning body
            c.fillStyle = "#1a2033";
            c.beginPath();
            const pts = [[18, 1], [7, 15], [14, 15], [9, 29], [25, 12], [17, 12], [22, 1]];
            pts.forEach(([x, y], i) => (i ? c.lineTo : c.moveTo).call(c, ox + x * s, oy + (y + bob) * s));
            c.closePath();
            c.fill();
            c.fillStyle = "#ffd84a";
            c.beginPath();
            const inner = [[18.3, 2.5], [8.8, 14], [15.5, 14], [11.5, 25.5], [23, 13], [15.6, 13], [20.8, 2.5]];
            inner.forEach(([x, y], i) => (i ? c.lineTo : c.moveTo).call(c, ox + x * s, oy + (y + bob) * s));
            c.closePath();
            c.fill();
            px(14, 8 + bob, 2, 2, "#1a2033");
            px(18, 8 + bob, 2, 2, "#1a2033");
            px(15, 11 + bob, 4, 1, "#1a2033");
            // crackling arcs
            for (let i = 0; i < 3; i++) {
                const a = t / 120 + i * 2.1;
                c.strokeStyle = "#7fe6ff";
                c.lineWidth = 1 * s;
                c.beginPath();
                const cx = ox + (16 + Math.cos(a) * 14) * s;
                const cy = oy + (15 + Math.sin(a) * 12 + bob) * s;
                c.moveTo(cx, cy);
                c.lineTo(cx + 3 * s, cy + 2 * s);
                c.lineTo(cx + 1 * s, cy + 4 * s);
                c.stroke();
            }
        }

        const SHORT_QS = {
            build: [
                { q: "What does the separator in a supercapacitor do?", a: ["Keeps the electrodes apart while letting ions through", "Stores most of the charge", "Conducts electrons between the electrodes", "Seals the case"], why: "Without it the electrodes touch: a short circuit." },
                { q: "Why use activated carbon for electrodes?", a: ["Its huge surface area (≈1,000–3,000 m²/g) holds lots of ions", "It's magnetic", "It's transparent", "It reacts with the electrolyte"], why: "Double-layer charge sits on the surface, so more surface stores more." },
                { q: "What's the binder's downside?", a: ["It's an insulator that can block pores and add resistance", "It conducts too well", "It evaporates", "It's radioactive"], why: "Use the smallest amount that still holds the film together." },
                { q: "Why add carbon black to the slurry?", a: ["It forms electron paths between the particles", "It adds surface area for ions", "It's the glue", "It's the electrolyte"], why: "It cuts the electrode's resistance." }
            ],
            electrolyte: [
                { q: "About what voltage limits a water-based electrolyte?", a: ["About 1.23 V, where water splits", "About 12 V", "About 0.1 V", "There's no limit"], why: "Real aqueous cells stay near 1 V." },
                { q: "About how high can an organic electrolyte (TEABF₄ in acetonitrile) go?", a: ["About 2.5–2.7 V", "About 1 V", "About 48 V", "About 0.5 V"], why: "No water to split." },
                { q: "Raising a cell from 1 V to 2.7 V multiplies its energy by about…", a: ["7 times", "2.7 times", "The same", "100 times"], why: "E = ½CV², and 2.7² ≈ 7.3." },
                { q: "Why build organic cells in a dry glove box?", a: ["Traces of water break down and gas at high voltage", "To keep them warm", "Glove boxes are faster", "To add oxygen"], why: "Moisture lowers the safe voltage and swells cells." }
            ],
            testing: [
                { q: "In a constant-current test, C equals…", a: ["I × Δt ÷ ΔV", "ΔV ÷ I", "I × ΔV", "Δt ÷ I"], why: "Charge Q = I × t, and C = Q ÷ V." },
                { q: "The instant drop when a load switches on is…", a: ["I × ESR", "½CV²", "C ÷ I", "Zero, always"], why: "The ESR takes its cut before the capacitance starts discharging." },
                { q: "What does a near-straight charge–discharge line mean?", a: ["Capacitor-like storage", "A battery plateau", "A short circuit", "A broken cycler"], why: "V = Q ÷ C, so constant current makes a straight line." },
                { q: "How many cycles can a good supercapacitor survive?", a: ["Hundreds of thousands to millions", "About 10", "About 500", "Only one"], why: "Nothing reacts chemically, so the electrodes barely wear." }
            ],
            sizing: [
                { q: "Usable energy between V₁ and V₂ is…", a: ["½ C (V₁² − V₂²)", "C (V₁ − V₂)", "½ C V₁", "C ÷ (V₁ − V₂)"], why: "Electronics stop below V₂, so that energy can't be used." },
                { q: "Putting n equal cells in series makes the bank's capacitance…", a: ["One cell's C divided by n", "n times bigger", "The same", "n² times bigger"], why: "Voltages add, but capacitance divides." },
                { q: "Why add margin when sizing?", a: ["Cells lose capacitance as they age (often 20% at end of life)", "For decoration", "To raise the voltage", "It's not needed"], why: "Size for the end of life, not just day one." },
                { q: "Why do trams and buses use supercapacitors for braking energy?", a: ["Braking energy arrives in fast, frequent bursts batteries don't like", "They're cheaper per kWh than batteries", "They store more total energy", "They never need charging"], why: "Frequent, short, powerful events are a supercapacitor's job." }
            ]
        };

        function shortBattle() {
            const rematch = es().boss;
            return {
                foeName: "The Short Circuit",
                foeTag: "Runaway current · Lv 26",
                foeSize: 32,
                fieldClass: "adv-field-energy",
                drawFoe: (c, t) => drawShort(c, 0, 0, 1, t),
                foeMax: 340,
                foePower: 1.15,
                meMax: 120,
                moves: [
                    { type: "build", name: "Separator Shield", mult: 1.75, label: "Building cells", icon: "🛡️", special: "dep", cls: "dep", effect: "Direct hit! The separator splits its current path in two." },
                    { type: "electrolyte", name: "Voltage Window", mult: 1.5, label: "Electrolytes", icon: "🧪", special: "etch", cls: "etch", effect: "It's effective! You kept every cell inside its safe voltage." },
                    { type: "testing", name: "Galvanostat", mult: 1, label: "Testing", icon: "📈", special: "litho", cls: "litho", effect: "A steady current pins it down." },
                    { type: "sizing", name: "Size the Bank", mult: 0.5, focus: true, label: "Sizing", icon: "🧮", special: "inspect", cls: "inspect", effect: "You worked out exactly what it can handle. Your next hit does 1.5× damage!" }
                ],
                questions: SHORT_QS,
                attacks: [
                    { name: "Arc Flash", text: "A blinding spark jumped across your cell!" },
                    { name: "Overvolt", text: "It pushed your cells past their limit!" },
                    { name: "Leakage", text: "Your charge drained away while you weren't looking!" }
                ],
                intro: [
                    "The Big Farad statue crackles… It's <strong>The Short Circuit</strong>!",
                    "It makes current take the easy way and wastes every joule. Answer supercapacitor questions to break its circuit!"
                ],
                runText: "You backed off. The Short Circuit keeps crackling…",
                loseTitle: "The Short Circuit drained you",
                loseTip: "Tip: The Short Circuit is weak to <strong>Separator Shield</strong> and <strong>Voltage Window</strong>. <strong>Size the Bank</strong> first makes your next hit 1.5× stronger.",
                winLines: rematch ? ["The Short Circuit fizzles out again!", "Circuit broken. Rematch won!"] : ["The Short Circuit fizzles out with a pop!", "📜 Dr. Charge hands you the Ampfield Certificate of Completion!"],
                onWin: () => {
                    const s = es();
                    const first = !s.boss;
                    s.boss = true;
                    s.bossUp = false;
                    api.save().badges.energy = true;
                    api.writeSave();
                    api.updateHud();
                    api.gainXP(first ? 150 : 25);
                    if (first) {
                        api.awardSiteXP("energyboss", 150);
                    }
                    api.afterModal(() => api.say(first ? [
                        "The circuit's broken and the city is humming again!",
                        "Batteries for the miles, supercapacitors for the moments: that's how a city stays powered. Here's your Ampfield Certificate of Completion!",
                        "And the Spark Line runs all the way to Carbon City now. Hop aboard at the stop in the plaza!"
                    ] : ["Fizzled again! Build another bank and it'll be back."], "Dr. Charge"));
                    return `
                        <div class="adv-complete">
                            <p class="eyebrow">CIRCUIT BROKEN</p>
                            <h2>${first ? "📜 Certificate of Completion" : "⚡ Rematch Won"}</h2>${first ? api.certificate("energy") : ""}
                            <p class="adv-xp-big">+${first ? 150 : 25} XP</p>
                            <div class="adv-takeaway">
                                <p>A short circuit is current taking a path it shouldn't, like electrodes touching through a torn separator. All that energy turns into heat in an instant.</p>
                                <p>Real supercapacitor banks are protected with good separators, cell balancing so no cell is overvolted, fuses, and careful testing.</p>
                            </div>
                            <button type="button" class="adv-btn" data-close>Back to the plaza</button>
                        </div>`;
                }
            };
        }


        /* ---------- Recipe card ---------- */

        function openRecipe() {
            const s = es();
            let html = "";
            let phase = null;
            STEPS.forEach((st, i) => {
                if (st.phase !== phase) {
                    html += (phase ? "</ol>" : "") + `<h3 class="adv-recipe-phase">${PHASES[st.phase]}</h3><ol class="adv-recipe">`;
                    phase = st.phase;
                }
                html += `
                    <li class="${i < s.step ? "done" : i === s.step ? "now" : ""}">
                        <span class="adv-recipe-mark">${i < s.step ? "✓" : i === s.step ? "▶" : i + 1}</span>
                        <span><strong>${st.name}</strong><small>${st.where.charAt(0).toUpperCase() + st.where.slice(1)}</small></span>
                    </li>`;
            });
            html += "</ol>";
            api.openModal(`
                ${api.head("energy", "Dr. Charge's Recipe")}
                <p class="adv-lead">A supercapacitor bank for the Spark Line tram: electrodes, a test cell, then a bank sized for the tram. Each station shows Dr. Charge's card.${s.best ? ` Best bank: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}` : ""}</p>
                <div class="adv-button-row" style="margin-bottom:8px"><button type="button" class="adv-btn secondary" data-close>Close</button></div>
                ${html}`);
        }

        api.registerRecipe({
            id: "energy",
            scenes: ["energy", "cellworks", "depot"],
            available: () => es().recipe,
            open: openRecipe,
            label: "Dr. Charge's supercap bank (10 steps)",
            progress: () => es().step,
            total: STEPS.length,
            restart: resetRun
        });


        /* ---------- Tools ---------- */

        const TOOLS = {
            material: { name: "Material Shelf", open: openMaterial },
            slurry: { name: "Slurry Mixer", open: openSlurry },
            cast: { name: "Doctor-Blade Coater", open: openCast },
            dry: { name: "Vacuum Oven", open: openDry },
            press: { name: "Calender Press", open: openPress },
            glovebox: { name: "Glove Box", open: openGlovebox },
            crimper: { name: "Cell Crimper", open: openCrimper },
            cycler: { name: "Cell Cycler", open: openCycler },
            sizing: { name: "Sizing Bench", open: openSizing },
            tram: { name: "Spark Tram", open: openTram }
        };

        // Materials each step takes from the bag (once per run).
        const USES = { material: [["powder", 1]], electrolyte: [["elyte", 1]] };

        function useTool(tool) {
            const s = es();
            if (!s.recipe) {
                api.say([`The ${TOOLS[tool].name}.`, "Dr. Charge runs the Cell Works. Talk to Dr. Charge for the recipe."]);
                return;
            }
            const st = STEPS[s.step];
            if (!st) {
                api.say([`The ${TOOLS[tool].name}.`, "This bank is done. Talk to Dr. Charge to build another."]);
                return;
            }
            if (st.tool !== tool) {
                api.say([`The ${TOOLS[tool].name}.`, `Your recipe says the next step is: ${st.name}.`, `That happens at the ${st.where}. Press R to read the recipe.`]);
                return;
            }
            if (!api.bag.pay(es(), st.id, USES[st.id])) {
                return;
            }
            TOOLS[tool].open();
        }

        function arrow(c, X, Y, W, t) {
            const ay = Y - 32 + Math.round(Math.sin(t / 250) * 2);
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.moveTo(X + W / 2 - 5, ay - 1);
            c.lineTo(X + W / 2 + 5, ay - 1);
            c.lineTo(X + W / 2, ay + 6);
            c.fill();
            c.fillStyle = "#ffd84a";
            c.beginPath();
            c.moveTo(X + W / 2 - 3.5, ay);
            c.lineTo(X + W / 2 + 3.5, ay);
            c.lineTo(X + W / 2, ay + 4.5);
            c.fill();
        }

        function tool(id, label2, x, y, w, h, draw) {
            return {
                kind: "en-" + id,
                x: x, y: y, w: w, h: h,
                label: label2,
                draw: (c, X, Y, W, H, t) => {
                    draw(c, X, Y, W, H, t);
                    if (isCurrentTool(id)) {
                        arrow(c, X, Y, W, t);
                    }
                },
                prompt: "A: Use " + TOOLS[id].name,
                use: () => useTool(id)
            };
        }


        /* ---------- Drawing ---------- */

        const D = {
            material(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8946a");
                rect(c, X + 5, Y + 4, 8, 8, "#555c6e");
                rect(c, X + 18, Y + 4, 8, 8, "#8f98aa");
                rect(c, X + 31, Y + 4, 8, 8, "#c8ceda");
            },
            slurry(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 10, W - 4, H - 11, "#b8c2d2");
                rect(c, X + 8, Y + 4, W - 16, 10, "#d9e2f0");
                rect(c, X + 10, Y + 7, W - 20, 6, "#555c6e");
                rect(c, X + W / 2 - 1 + Math.sin(t / 120) * 3, Y - 4, 2, 12, "#5d6577");
            },
            cast(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 4, Y + 8, W - 8, 3, "#c8ceda");
                const bx = X + 6 + ((t / 40) % (W - 14));
                rect(c, X + 4, Y + 6, bx - X - 4, 2, "#555c6e");
                rect(c, bx, Y + 2, 3, 8, "#5d6577");
            },
            dry(c, X, Y, W, H) {
                api.box(X + 2, Y, W - 4, H, "#5d6577");
                rect(c, X + 7, Y + 6, W - 14, 12, "rgba(255, 170, 90, 0.5)");
                rect(c, X + 7, Y + 22, 6, 3, "#a9b2d0");
            },
            press(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#aab3c4");
                const a = t / 200;
                [[X + 18, Y + 3], [X + 18, Y + 11]].forEach(([x, y]) => {
                    c.fillStyle = "#8f98aa";
                    c.beginPath();
                    c.arc(x, y, 5, 0, Math.PI * 2);
                    c.fill();
                    rect(c, x + Math.cos(a) * 3 - 1, y + Math.sin(a) * 3 - 1, 2, 2, "#3b4458");
                });
                rect(c, X + 4, Y + 7, W - 8, 1, "#555c6e");
            },
            glovebox(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#8f98aa");
                rect(c, X + 4, Y + 4, W - 8, 8, "rgba(200, 230, 255, 0.7)");
                dot(c, X + 14, Y + 10, 3, "#1a2033");
                dot(c, X + W - 14, Y + 10, 3, "#1a2033");
            },
            crimper(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + W / 2 - 4, Y - 6, 8, 10, "#3b4458");
                dot(c, X + W / 2, Y + 8, 3, "#aab3c4");
            },
            cycler(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#3b4458");
                rect(c, X + 4, Y + 4, W - 8, 9, "#0b1020");
                c.strokeStyle = "#ffd84a";
                c.lineWidth = 1;
                c.beginPath();
                const ph = (t / 1000) % 1;
                for (let i = 0; i <= 20; i++) {
                    const u = (i / 20 + ph) % 1;
                    const v = u < 0.5 ? u * 2 : 2 - u * 2;
                    const px2 = X + 5 + i * (W - 10) / 20;
                    const py = Y + 12 - v * 7;
                    if (i) {
                        c.lineTo(px2, py);
                    } else {
                        c.moveTo(px2, py);
                    }
                }
                c.stroke();
            },
            sizing(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                for (let i = 0; i < 5; i++) {
                    rect(c, X + 5 + i * 8, Y - 2, 6, 10, "#2ebfa5");
                    rect(c, X + 6 + i * 8, Y - 4, 4, 2, "#c8ceda");
                }
            }
        };

        // a giant supercapacitor can, the "Big Farad" statue
        function drawFarad(c, X, Y, W, H, t) {
            const powered = es().powered;
            rect(c, X + 4, Y + H - 4, W - 8, 4, "rgba(0,0,0,0.25)");
            api.box(X + 6, Y + 2, W - 12, H - 6, "#2ebfa5");
            rect(c, X + 6, Y + 2, W - 12, 4, "#c8ceda");
            rect(c, X + 10, Y - 4, 3, 6, "#c8ceda");
            rect(c, X + W - 13, Y - 4, 3, 6, "#c8ceda");
            rect(c, X + 9, Y + 10, W - 18, 8, "#1a2033");
            c.fillStyle = powered ? "#ffd84a" : "#5d6577";
            c.font = "bold 7px sans-serif";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("3000 F", X + W / 2, Y + 14.5);
            if (powered) {
                const k = (Math.sin(t / 300) + 1) / 2;
                rect(c, X + 9, Y + 22, (W - 18) * (0.4 + 0.6 * k), 3, "#5be38a");
            }
        }

        function drawTramWorld(c, X, Y, W, H, t) {
            const powered = es().powered;
            rect(c, X, Y - 10, W, 24, "#1a2033");
            rect(c, X + 1, Y - 9, W - 2, 22, "#ffb84a");
            for (let i = 0; i < 4; i++) {
                rect(c, X + 5 + i * 15, Y - 6, 10, 7, powered ? "#ffe9a8" : "#33405c");
            }
            rect(c, X + W / 2 - 1, Y - 18, 2, 8, "#1a2033");
            rect(c, X + 4, Y + 9, W - 8, 3, "#54e0c7");
            dot(c, X + 10, Y + 14, 3, "#1a2033");
            dot(c, X + W - 10, Y + 14, 3, "#1a2033");
            if (!powered) {
                c.fillStyle = "#1a2033";
                c.font = "bold 7px sans-serif";
                c.textAlign = "center";
                c.textBaseline = "middle";
                c.fillText("OUT OF SERVICE", X + W / 2, Y + 5);
            }
            if (isCurrentTool("tram")) {
                arrow(c, X, Y - 6, W, t);
            }
        }

        function drawIon(c, X, Y, t, sign) {
            const bob = Math.round(Math.sin(t / 280 + X) * 1);
            const cx = X + 8;
            const cy = Y + 8 + bob;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.22)");
            dot(c, cx, cy, 6.5, "#1a2033");
            dot(c, cx, cy, 5.5, sign === "+" ? "#ffd84a" : "#7fb2ff");
            if (sign === "+") {
                // little cat ears for the cat-ion
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.moveTo(cx - 6, cy - 2);
                c.lineTo(cx - 5, cy - 9);
                c.lineTo(cx - 1, cy - 5);
                c.moveTo(cx + 6, cy - 2);
                c.lineTo(cx + 5, cy - 9);
                c.lineTo(cx + 1, cy - 5);
                c.fill();
            }
            rect(c, cx - 3, cy - 2, 2, 2, "#1a2033");
            rect(c, cx + 1, cy - 2, 2, 2, "#1a2033");
            c.fillStyle = "#1a2033";
            c.font = "bold 7px sans-serif";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(sign === "+" ? "+" : "−", cx, cy + 3);
        }

        function plazaTile(c, x, y) {
            const X = x * TILE;
            const Y = y * TILE;
            rect(c, X, Y, TILE, TILE, "#d8dde8");
            rect(c, X, Y, TILE, 1, "#bcc4d4");
            rect(c, X, Y, 1, TILE, "#bcc4d4");
            if ((x * 5 + y * 3) % 6 === 0) {
                // a little lightning-bolt tile
                c.fillStyle = "#ffd84a";
                c.beginPath();
                c.moveTo(X + 9, Y + 3);
                c.lineTo(X + 5, Y + 9);
                c.lineTo(X + 8, Y + 9);
                c.lineTo(X + 6, Y + 13);
                c.lineTo(X + 11, Y + 7);
                c.lineTo(X + 8, Y + 7);
                c.closePath();
                c.fill();
            }
        }

        function railTile(c, x, y, t) {
            api.drawWorldTile(x, y, ".", t);
            const X = x * TILE;
            const Y = y * TILE;
            rect(c, X, Y + 2, TILE, 12, "#b9a68a");
            for (let i = 0; i < 4; i++) {
                rect(c, X + i * 4 + 1, Y + 3, 2, 10, "#6b4a2f");
            }
            rect(c, X, Y + 5, TILE, 2, "#8f98aa");
            rect(c, X, Y + 10, TILE, 2, "#8f98aa");
        }

        function lampTile(c, x, y, t) {
            api.drawWorldTile(x, y, ".", t);
            const X = x * TILE;
            const Y = y * TILE;
            const on = es().powered;
            if (on) {
                c.fillStyle = "rgba(255, 230, 120, 0.25)";
                c.beginPath();
                c.arc(X + 8, Y + 4, 10 + Math.sin(t / 400) * 1, 0, Math.PI * 2);
                c.fill();
            }
            rect(c, X + 7, Y + 4, 2, 12, "#3b4458");
            rect(c, X + 4, Y + 1, 8, 4, "#1a2033");
            rect(c, X + 5, Y + 2, 6, 2, on ? "#ffe066" : "#5d6577");
        }


        /* ---------- Scenes ---------- */

        api.SCENES.energy = {
            id: "energy",
            label: "Ampfield",
            outdoor: true,
            solid: "TwBSWL",
            grid: [
                "TTTTTTTTTTTTTTTTTTTT",
                "T.L.....L......L...T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBDBB..BBBDBB..T",
                "T.....p.......p....T",
                "pppppppppppppppp...T",
                "T.........p.....L..T",
                "T..hhhhhhhhhhhh....T",
                "T..hhhhhhhhhhhh....T",
                "T.L.......p.....L..T",
                "TrrrrrrrrrrrrrrrrrrT",
                "T.f.....f.....f....T",
                "TTTTTTTTTTTTTTTTTTTT"
            ],
            get tint() {
                return es().powered ? null : "rgba(10, 18, 50, 0.3)";
            },
            drawTile: (c, x, y, ch, t) => {
                if (ch === "h") {
                    plazaTile(c, x, y);
                } else if (ch === "r") {
                    railTile(c, x, y, t);
                } else if (ch === "L") {
                    lampTile(c, x, y, t);
                } else {
                    api.drawWorldTile(x, y, ch, t);
                }
            },
            edges: {
                left: { scene: "pdms", x: 19, y: 7 }
            },
            buildings: [
                { id: "cellworks", sign: "CELL WORKS", x: 2, y: 2, w: 7, h: 4, door: { x: 6, y: 5 }, wall: "#fff8e1", roof: "#ffb84a", locked: () => false },
                { id: "depot", sign: "TRAM DEPOT", x: 11, y: 2, w: 6, h: 4, door: { x: 14, y: 5 }, wall: "#e8f2ff", roof: "#3d6fd8", locked: () => false }
            ],
            npcs: [
                {
                    id: "charge", name: "Dr. Charge", x: 8, y: 6, dir: "down",
                    look: { suit: "#fff8e1", accent: "#ffb84a", visor: "#ffd84a" },
                    talk: chargeTalk
                },
                {
                    id: "cation", name: "Cat-ion", x: 4, y: 10, dir: "down",
                    draw: (c, X, Y, t) => drawIon(c, X, Y, t, "+"),
                    talk: () => ["Mew! I'm a cat-ion, a positively charged ion. Get it?", "When a supercapacitor charges, I snuggle up against the negative electrode's surface. Billions of us make up the double layer!"]
                },
                {
                    id: "anion", name: "Ann Ion", x: 13, y: 9, dir: "down",
                    draw: (c, X, Y, t) => drawIon(c, X, Y, t, "−"),
                    talk: () => ["Hi! I'm an anion, a negative ion. I head for the positive electrode.", "In TEABF₄ electrolyte, I'm the BF₄⁻. My partner, TEA⁺, is the big cat-ion."]
                },
                {
                    id: "ohmma", name: "Grandma Ohm", x: 4, y: 13, dir: "up",
                    look: { suit: "#e6defa", accent: "#b46bff", visor: "#c8ceda" },
                    talk: () => es().powered
                        ? ["The tram's running again! I'm off to see my grandkids. Thank you, dear!"]
                        : ["I've been waiting at this stop all morning. The tram just… stopped.", "And the street lights went dark last night. Somebody please fix it!"]
                }
            ],
            objects: [
                api.bag.pickup({ id: "energy-elyte", item: "elyte", x: 18, y: 13, text: "Something sparkles by the tracks: a spare electrolyte set!" }),
                {
                    kind: "farad", x: 6, y: 9, w: 2, h: 2, draw: drawFarad, prompt: "A: Look",
                    active: () => !es().bossUp,
                    lines: ["The Big Farad statue: a giant supercapacitor can, lit up whenever the city has power.", "Real 3000 F cells are about the size of a soda can and charge in seconds."]
                },
                {
                    kind: "short", x: 6, y: 9, w: 2, h: 2,
                    active: () => !!es().bossUp,
                    draw: (c, X, Y, W, H, t) => {
                        drawFarad(c, X, Y, W, H, t);
                        drawShort(c, X, Y - 18, 1, t);
                        const bob = Math.round(Math.sin(t / 250) * 2);
                        rect(c, X + 22, Y - 30 + bob, 9, 11, "#1a2033");
                        rect(c, X + 23, Y - 29 + bob, 7, 9, "#ffd84a");
                        c.fillStyle = "#1a2033";
                        c.font = "bold 8px sans-serif";
                        c.textAlign = "center";
                        c.textBaseline = "middle";
                        c.fillText("!", X + 26.5, Y - 24 + bob);
                    },
                    prompt: "A: Battle The Short Circuit",
                    use: () => api.say(["Sparks crackle all over the Big Farad statue…", "Get ready to battle!"], "", () => api.openBattle(shortBattle()))
                },
                Object.assign(tool("tram", "Spark Tram", 11, 12, 4, 1, drawTramWorld), {
                    draw: drawTramWorld,
                    // once it's running, the tram is a ride to Carbon City
                    prompt: () => (es().powered && !isCurrentTool("tram") ? "A: Ride the Spark Line to Carbon City" : "A: Use Spark Tram"),
                    use: () => (es().powered && !isCurrentTool("tram") && api.carbonCity ? api.carbonCity.rideTram("carboncity", "Carbon City", 11, 12) : useTool("tram"))
                })
            ]
        };

        api.SCENES.cellworks = {
            id: "cellworks",
            label: "Cell Works",
            grid: api.interiorRows(),
            floor: "#f3eedf",
            tint: "rgba(255, 200, 40, 0.05)",
            exitTo: { scene: "energy", x: 6, y: 6 },
            objects: [
                api.bag.stockroom({ label: "Cell Works stockroom", items: ["powder", "elyte"], x: 15, y: 7 }),
                tool("material", "Materials", 1, 2, 3, 1, D.material),
                tool("slurry", "Slurry mixer", 5, 2, 2, 2, D.slurry),
                tool("cast", "Doctor blade", 8, 2, 3, 1, D.cast),
                tool("dry", "Vacuum oven", 12, 2, 2, 2, D.dry),
                tool("press", "Calender", 15, 2, 3, 1, D.press),
                tool("glovebox", "Glove box", 1, 7, 3, 1, D.glovebox),
                tool("crimper", "Crimper", 6, 7, 3, 1, D.crimper),
                tool("cycler", "Cycler", 11, 7, 3, 1, D.cycler)
            ],
            npcs: [
                { id: "chargelab", name: "Dr. Charge", x: 9, y: 10, dir: "down", look: { suit: "#fff8e1", accent: "#ffb84a", visor: "#ffd84a" }, talk: chargeTalk }
            ]
        };

        api.SCENES.depot = {
            id: "depot",
            label: "Tram Depot",
            grid: api.interiorRows(),
            floor: "#e3e8f0",
            exitTo: { scene: "energy", x: 14, y: 6 },
            objects: [
                tool("sizing", "Sizing bench", 8, 2, 3, 1, D.sizing),
                {
                    kind: "oldpack", x: 2, y: 2, w: 3, h: 2, label: "Old battery", prompt: "A: Look",
                    draw: (c, X, Y, W, H) => { api.box(X + 2, Y + 2, W - 4, H - 4, "#5d6577"); rect(c, X + 8, Y + 8, W - 16, 6, "#ff6b7d"); },
                    lines: ["The tram's old battery pack, worn out.", "Batteries store lots of energy, but hard bursts of charging and discharging at every stop wore this one out. That's a job for a supercapacitor."]
                },
                {
                    kind: "charger", x: 14, y: 2, w: 3, h: 2, label: "Stop charger", prompt: "A: Look",
                    draw: (c, X, Y, W, H) => { api.box(X + 4, Y, W - 8, H, "#3b4458"); rect(c, X + 10, Y + 6, W - 20, 6, es().powered ? "#5be38a" : "#ff6b7d"); },
                    lines: ["A fast charger like the ones at each tram stop. It can refill a supercapacitor bank in seconds while passengers board."]
                }
            ],
            npcs: [
                {
                    id: "volta", name: "Driver Volta", x: 5, y: 9, dir: "down",
                    look: { suit: "#3d6fd8", accent: "#ffd84a", visor: "#33405c" },
                    talk: () => {
                        const s = es();
                        if (s.powered) {
                            return ["The Spark Tram has never pulled away so smoothly! Braking even recharges it.", "And the line's open all the way to Carbon City now. Hop aboard at the stop in the plaza!"];
                        }
                        if (s.recipe && current() && current().tool === "sizing") {
                            return ["Your test cell looks great! Use the sizing bench to work out the bank: how many cells, and how big.", "Remember: 48 V full, 24 V empty, 30 kJ a hop, plus 20% for aging."];
                        }
                        return ["I'm Volta, driver of the Spark Line. Our tram's battery wore out from all the stopping and starting.", "Without the tram, the depot's power system went down, and so did the street lights. Dr. Charge says supercapacitors are the fix."];
                    }
                }
            ]
        };

        function chargeTalk() {
            const s = es();
            const name = api.currentChar() ? api.currentChar().name : "engineer";
            if (!s.recipe) {
                return {
                    lines: [
                        `${name}! Thank goodness. I'm Dr. Charge. Ampfield has run out of energy!`,
                        "Our Spark Line tram stopped: its battery wore out from the hard bursts of braking and pulling away at every stop. The depot's power went down with it, and now the street lights are dark too.",
                        "We need a supercapacitor bank. Supercaps charge in seconds, soak up braking energy, and survive millions of cycles.",
                        "We'll make the electrodes, build and test a cell, then size a bank for the tram. Every station has my card with the settings.",
                        "📋 Recipe added! Press R or tap Recipe any time."
                    ],
                    done: () => {
                        s.recipe = true;
                        api.writeSave();
                        api.refreshRecipe();
                    }
                };
            }
            if (s.step >= STEPS.length) {
                if (s.bossUp) {
                    return ["The Short Circuit is crackling around the Big Farad statue in the plaza! Go!"];
                }
                return {
                    lines: [`Your best bank: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}. Want to build another?`, "I'll reset the line for you."],
                    done: () => {
                        resetRun();
                        api.toast("Fresh bank: back to step 1");
                    }
                };
            }
            const st = STEPS[s.step];
            return [`Next step: ${st.name}.`, `It's at the ${st.where}. My card there has the settings.`];
        }
    });

})();
