/* ========================================
   FAB VALLEY ADVENTURE: GLUCOSE GROVE
   A town east of Fab Valley where five
   residents living with diabetes need
   continuous glucose monitors (CGMs).
   Dr. Dex's SensorWorks builds a
   first-generation glucose oxidase sensor:
   platinum electrode, interference layer,
   enzyme, glucose-limiting membrane,
   biocompatible coat, cure, bench tests,
   package and sterilize. The clinic runs a
   MARD accuracy study, then you fit the
   residents. Boss: The Sugar Spike.

   Facts follow the Glucose Sensors course:
   GOx makes H₂O₂, read at about +0.6 V on
   platinum (2 electrons each); 70–180 mg/dL
   target range; MARD of leading systems
   about 8–10%; sterilization must not
   destroy the enzyme; ISO 7–8 assembly
   rooms. Sensor currents are teaching
   values in the nanoamp range.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const TILE = api.TILE;
        const rect = api.rect;
        const ui = api.ui;
        const $ = (id) => document.getElementById(id);

        api.TYPES.glucose = { label: "Glucose sensors", icon: "🩸" };


        /* ---------- Recipe ---------- */

        const PHASES = {
            build: "Building the sensor",
            finish: "Curing and setup",
            bench: "Bench testing",
            ship: "Packaging and sterilizing",
            clinic: "Clinic and patients"
        };

        const STEPS = [
            {
                id: "electrode", phase: "build", tool: "electrode", short: "Electrodes", where: "electrode bench in the SensorWorks",
                name: "Choose the electrode materials: platinum working, Ag/AgCl reference",
                card: ["Working electrode: <strong>platinum</strong>, the best catalyst for oxidizing hydrogen peroxide (H₂O₂).",
                    "Reference electrode: <strong>Ag/AgCl</strong> (silver / silver chloride), a steady voltage standard."]
            },
            {
                id: "inner", phase: "build", tool: "dip", short: "Interference layer", where: "dip coater in the SensorWorks",
                name: "Dip-coat the inner interference-blocking layer (cellulose acetate, 3 dips)",
                card: ["Material: <strong>cellulose acetate</strong>. Its tiny pores let small H₂O₂ through but block bigger molecules like acetaminophen.",
                    "Dips: <strong>3</strong> (2–4 works). Too few lets interferents through; too many slows the signal."],
                dip: { title: "Dip Coater: Interference Layer", options: [{ id: "ca", label: "Cellulose acetate" }, { id: "nafion", label: "Nafion" }, { id: "none", label: "No coating" }], correct: "ca", min: 2, max: 4, key: "inner" }
            },
            {
                id: "enzyme", phase: "build", tool: "spot", short: "Enzyme layer", where: "enzyme spotter in the SensorWorks",
                name: "Spot the glucose oxidase enzyme layer (GOx + BSA + glutaraldehyde, 5 drops)",
                card: ["Enzyme: <strong>GOx</strong> (glucose oxidase). It turns glucose + O₂ into gluconolactone + H₂O₂.",
                    "Crosslinker: <strong>glutaraldehyde with BSA</strong> (bovine serum albumin). It locks the enzyme in place so it can't wash off.",
                    "Drops: <strong>5</strong> (4–6 works). Keep the enzyme cool: heat unfolds the protein."]
            },
            {
                id: "outer", phase: "build", tool: "dip", short: "Glucose-limiting membrane", where: "dip coater in the SensorWorks",
                name: "Dip-coat the glucose-limiting membrane (polyurethane, 5 dips)",
                card: ["Material: <strong>polyurethane</strong>. It lets oxygen in much more easily than glucose.",
                    "Why: at 90 mg/dL glucose is about 5 mM but tissue oxygen is only about 0.05–0.1 mM. Without this layer the enzyme runs out of oxygen and the signal stops tracking glucose.",
                    "Dips: <strong>5</strong> (4–6 works)."],
                dip: { title: "Dip Coater: Glucose-Limiting Membrane", options: [{ id: "pu", label: "Polyurethane" }, { id: "ca", label: "Cellulose acetate" }, { id: "none", label: "No coating" }], correct: "pu", min: 4, max: 6, key: "outer" }
            },
            {
                id: "bio", phase: "build", tool: "dip", short: "Biocompatible coat", where: "dip coater in the SensorWorks",
                name: "Add the biocompatible outer coat (PEG-based hydrogel, 1–2 dips)",
                card: ["Material: <strong>PEG-based hydrogel</strong> (polyethylene glycol). Its water-loving surface keeps proteins from sticking (biofouling).",
                    "Dips: <strong>1–2</strong>."],
                dip: { title: "Dip Coater: Biocompatible Coat", options: [{ id: "peg", label: "PEG hydrogel" }, { id: "none", label: "No coating" }], correct: "peg", min: 1, max: 2, key: "bio" }
            },
            {
                id: "cure", phase: "finish", tool: "oven", short: "Cure", where: "cure oven in the SensorWorks",
                name: "Cure the layers gently: 25 °C for 24 hours",
                card: ["Temperature: <strong>25 °C</strong> (room temperature; 20–40 °C works).",
                    "Time: <strong>24 hours</strong> (12 hours or more).",
                    "Never go above about 50 °C: glucose oxidase unfolds and stops working."]
            },
            {
                id: "potential", phase: "finish", tool: "pstat", short: "Set the potential", where: "potentiostat in the Test & Pack Lab",
                name: "Hold the working electrode at +0.6 V vs Ag/AgCl and let it settle",
                card: ["Potential: <strong>+0.6 V</strong> versus the Ag/AgCl reference. That's where H₂O₂ is oxidized at platinum: H₂O₂ → O₂ + 2H⁺ + 2e⁻.",
                    "Too low: little peroxide reacts. Too high: other molecules react too, adding noise."]
            },
            {
                id: "calib", phase: "bench", tool: "bath", short: "Calibration curve", where: "calibration bath in the Test & Pack Lab",
                name: "Measure glucose standards at 37 °C and build the calibration curve",
                card: ["Bath: <strong>37 °C</strong> (body temperature), in <strong>PBS</strong> (phosphate-buffered saline).",
                    "Run at least <strong>4 standards from 0 to 400 mg/dL</strong> (for example 0, 100, 200, 300, 400).",
                    "Sensitivity = slope of the line (nA per mg/dL). Glucose = (current − intercept) ÷ sensitivity."]
            },
            {
                id: "interf", phase: "bench", tool: "interf", short: "Interference test", where: "interference bench in the Test & Pack Lab",
                name: "Spike a 100 mg/dL sample with acetaminophen and check the reading barely moves",
                card: ["Test: add <strong>acetaminophen</strong> (a common pain reliever) at 2 mg/dL, the high end of a normal dose, to a 100 mg/dL glucose sample.",
                    "Pass: the reading changes by <strong>less than 10%</strong>.",
                    "You can also try vitamin C (ascorbic acid) and uric acid."]
            },
            {
                id: "pack", phase: "ship", tool: "pack", short: "Package and sterilize", where: "packaging line in the Test & Pack Lab",
                name: "Seal each sensor in its applicator, then sterilize with an electron beam",
                card: ["Sterilization: <strong>e-beam</strong> (electron-beam radiation) or <strong>ethylene oxide gas</strong>. Both work at low temperature.",
                    "Never steam autoclave (121 °C): the heat destroys the enzyme.",
                    "Sensors are assembled in ISO 7–8 cleanrooms and sterilized sealed, so they stay sterile until opened."]
            },
            {
                id: "mard", phase: "clinic", tool: "study", short: "Accuracy study", where: "clinic",
                name: "Run the clinical study at the clinic: compare sensor and fingerstick readings and compute the MARD",
                card: ["ARD = |CGM − reference| ÷ reference × 100%, for each pair.",
                    "MARD (mean absolute relative difference) = the average of the ARDs.",
                    "Target: <strong>under 10%</strong>, like today's leading systems (about 8–10%)."]
            },
            {
                id: "fit", phase: "clinic", tool: "residents", short: "Fit the residents", where: "around town",
                name: "Fit a sensor on each of the five residents around town",
                card: ["Site: <strong>back of the upper arm</strong> (or the abdomen, for some systems).",
                    "Clean the skin with an alcohol wipe, press the applicator, then wait for the warm-up while the tissue settles.",
                    "Talk to each resident with a <strong>?</strong> over their head."]
            }
        ];

        function gs() {
            const s = api.save();
            if (!s.glucose) {
                s.glucose = { recipe: false, step: 0, defects: {}, data: {}, stepXp: {}, runs: 0, best: 0, fitted: {}, batch: null, boss: false };
            }
            return s.glucose;
        }

        function current() {
            return STEPS[gs().step];
        }

        function isCurrentTool(tool) {
            const s = gs();
            return s.recipe && STEPS[s.step] && STEPS[s.step].tool === tool;
        }

        function defect(sev, cause) {
            return { sev: sev, cause: cause };
        }

        function allDefects() {
            const s = gs();
            return STEPS.reduce((l, st) => l.concat(s.defects[st.id] || []), []);
        }

        function cardHtml(st) {
            st = st || current();
            return st && st.card
                ? `<div class="adv-card"><p class="adv-card-title">📋 Dr. Dex's card</p><ul>${st.card.map((x) => `<li>${x}</li>`).join("")}</ul></div>`
                : "";
        }

        function open(title, lead, body, opts) {
            return api.openModal(`
                ${api.head("glucose", title)}
                <p class="adv-round">Recipe step ${gs().step + 1} of ${STEPS.length}</p>
                <p class="adv-lead">${lead}</p>
                ${cardHtml()}
                ${body}`, opts);
        }

        function completeStep(defs, summary) {

            const s = gs();
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
                    ${next ? `<p class="adv-lead">Next: <strong>${next.name}</strong>${next.tool === "residents" ? "." : ` at the ${next.where}.`}</p>` : ""}
                    <button type="button" class="adv-btn" data-close>Back to work</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
        }

        function resetRun() {
            const s = gs();
            s.step = 0;
            s.defects = {};
            s.data = {};
            s.fitted = {};
            s.runs++;
            api.writeSave();
        }


        /* ---------- The sensor, as the test gear sees it ---------- */

        function model() {
            const d = gs().data;
            let S = 0.04; // nA per mg/dL
            let gsat = 2000;
            let interf = 0.03;
            let noise = 0.02;
            let drift = 0;

            const we = d.we || "pt";
            S *= { pt: 1, au: 0.25, c: 0.4, cu: 0 }[we];
            if (d.re && d.re !== "agcl") {
                drift += 0.06;
            }

            const inner = d.inner || { mat: "ca", dips: 3 };
            if (inner.mat === "none" || inner.dips === 0) {
                interf = 0.6;
            } else if (inner.mat === "nafion") {
                interf = 0.15;
            } else if (inner.dips < 2) {
                interf = 0.25;
            } else if (inner.dips > 4) {
                S *= 0.7;
            }

            const enz = d.enzyme || { enz: "gox", xl: true, drops: 5 };
            S *= { gox: 1, gdh: 0.05, cat: 0 }[enz.enz];
            if (!enz.xl) {
                drift += 0.08;
            }
            if (enz.drops < 4) {
                S *= 0.55;
            }

            const outer = d.outer || { mat: "pu", dips: 5 };
            if (outer.mat === "none" || outer.dips === 0) {
                gsat = 60;
                S *= 1.6;
            } else if (outer.mat === "ca") {
                gsat = 220;
            } else if (outer.dips < 2) {
                gsat = 110;
            } else if (outer.dips < 4) {
                gsat = 260;
            } else if (outer.dips > 6) {
                S *= 0.45;
            }

            const bio = d.bio || { mat: "peg", dips: 1 };
            if (bio.mat === "none" || bio.dips === 0) {
                drift += 0.05;
            }

            const cureT = d.cureT || 25;
            if (cureT > 50) {
                S *= cureT > 80 ? 0.05 : 0.3;
            } else if (cureT < 15) {
                drift += 0.03;
            }

            const V = d.V === undefined ? 0.6 : d.V;
            if (V < 0.4) {
                S *= 0.25;
            } else if (V < 0.5) {
                S *= 0.65;
            } else if (V > 0.8) {
                noise += 0.08;
                interf += 0.2;
            } else if (V > 0.7) {
                interf += 0.06;
                noise += 0.02;
            }

            if (d.steril === "steam") {
                S *= 0.04;
            }

            return { S: S, gsat: gsat, interf: interf, noise: noise, drift: drift, dead: S < 0.004, bg: 0.4 + interf * 2 };
        }

        // current (nA) at glucose G (mg/dL), with saturation from oxygen limits
        function current_nA(m, G, extra) {
            return m.bg + m.S * G / (1 + G / m.gsat) + (extra || 0);
        }

        function noise(a) {
            return (Math.random() - 0.5) * 2 * a;
        }


        /* ---------- Station: electrode bench ---------- */

        function openElectrode() {

            let we = null;
            let re = null;

            open("Electrode Bench", "A CGM (continuous glucose monitor) sensor is a fine wire, thinner than a hair, with a working electrode where the reaction is read and a reference electrode that holds a steady voltage. A potentiostat in the transmitter controls them.", `
                <p class="adv-round">Working electrode</p>
                ${ui.chips("we", [{ id: "pt", label: "Platinum" }, { id: "au", label: "Gold" }, { id: "c", label: "Carbon" }, { id: "cu", label: "Copper" }], null)}
                <p class="adv-round">Reference electrode</p>
                ${ui.chips("re", [{ id: "agcl", label: "Ag/AgCl" }, { id: "pt", label: "Bare platinum" }, { id: "cu", label: "Copper" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="elGo" data-autofocus>Build the wire</button></div>
                <p class="adv-result" id="elRes" aria-live="polite"></p>`);

            ui.wireChips("we", (v) => { we = v; });
            ui.wireChips("re", (v) => { re = v; });

            $("elGo").addEventListener("click", () => {
                if (!we || !re) {
                    ui.result("elRes", "Choose both electrodes first.", false);
                    return;
                }
                const defs = [];
                if (we === "cu") {
                    defs.push(defect("major", "Copper corrodes in body fluid and doesn't catalyze peroxide oxidation. The sensor gives no glucose signal."));
                } else if (we === "au") {
                    defs.push(defect("major", "Gold oxidizes hydrogen peroxide poorly at +0.6 V, so the signal is weak. Platinum is the catalyst of choice."));
                } else if (we === "c") {
                    defs.push(defect("minor", "Carbon is cheap and printable, but it oxidizes peroxide less efficiently than platinum at +0.6 V, so the signal is weaker."));
                }
                if (re !== "agcl") {
                    defs.push(defect("major", `A ${re === "pt" ? "bare platinum" : "copper"} reference doesn't hold a steady potential, so the sensor's operating voltage wanders and the readings drift.`));
                }
                Object.assign(gs().data, { we: we, re: re });
                completeStep(defs, `<p>Built the sensor wire: ${{ pt: "platinum", au: "gold", c: "carbon", cu: "copper" }[we]} working electrode, ${{ agcl: "Ag/AgCl", pt: "bare platinum", cu: "copper" }[re]} reference.</p>`);
            });
        }


        /* ---------- Station: dip coater (three layers) ---------- */

        function openDip() {

            const st = current();
            const cfg = st.dip;
            let mat = null;
            let busy = false;

            const m = open(cfg.title, "The wire is dipped into a polymer solution, pulled out at a steady speed and dried. Each dip adds a thin, even film, and the number of dips sets the thickness. Thickness controls how fast molecules get through.", `
                <div class="adv-machine">
                    <canvas id="dpCv" width="220" height="200"></canvas>
                    <div>
                        <p class="adv-round">Coating solution</p>
                        ${ui.chips("dmat", cfg.options, null)}
                        ${ui.slider("dpN", "Number of dips", "", 0, 10, 1, 1)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="dpGo" data-autofocus>Start dipping</button></div>
                        <p class="adv-result" id="dpRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("dpCv").getContext("2d");
            const nEl = ui.wireSlider("dpN");
            ui.wireChips("dmat", (v) => { mat = v; });

            function draw(dip, coats) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 200);
                rect(c, 60, 120, 100, 70, "#d9e2f0");
                rect(c, 64, 130, 92, 56, "#cfe8ff");
                const y = 30 + dip * 80;
                rect(c, 108, y - 30, 4, 120, "#c8ceda");
                rect(c, 106, y + 70, 8 + Math.min(10, coats), 20, `rgba(150, 220, 200, ${0.3 + Math.min(0.6, coats * 0.08)})`);
                rect(c, 100, y - 34, 20, 6, "#5d6577");
            }

            draw(0, 0);

            $("dpGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!mat) {
                    ui.result("dpRes", "Choose a coating solution first.", false);
                    return;
                }
                busy = true;
                const n = Number(nEl.value);
                const reps = mat === "none" ? 0 : n;
                let done = 0;
                const one = () => {
                    if (done >= reps) {
                        finish(n);
                        return;
                    }
                    ui.animate(m, 900, (k) => draw(Math.sin(k * Math.PI), done + k), () => {
                        done++;
                        one();
                    });
                };
                ui.result("dpRes", reps ? "Dipping…" : "");
                one();
            });

            function finish(n) {
                const defs = [];
                const none = mat === "none" || n === 0;
                if (cfg.key === "inner") {
                    if (none) {
                        defs.push(defect("major", "With no interference layer, acetaminophen, vitamin C and uric acid reach the platinum and add false current."));
                    } else if (mat === "nafion") {
                        defs.push(defect("minor", "Nafion blocks negatively charged interferents like vitamin C and uric acid well, but acetaminophen has no charge and slips through more easily."));
                    } else if (n < cfg.min) {
                        defs.push(defect("minor", `${n} dip${n === 1 ? "" : "s"} left the layer thin and patchy, so some interferents get through.`));
                    } else if (n > cfg.max) {
                        defs.push(defect("minor", `${n} dips made the layer thick enough to slow the peroxide too, weakening the signal.`));
                    }
                } else if (cfg.key === "outer") {
                    if (none) {
                        defs.push(defect("major", "With no glucose-limiting membrane, glucose floods the enzyme, oxygen runs out, and the signal flattens above about 60 mg/dL."));
                    } else if (mat === "ca") {
                        defs.push(defect("major", "Cellulose acetate doesn't favor oxygen over glucose the way polyurethane does, so the sensor saturates in the high range."));
                    } else if (n < cfg.min) {
                        defs.push(defect(n < 2 ? "major" : "minor", `${n} dip${n === 1 ? "" : "s"} made the membrane too thin. Too much glucose gets in, oxygen runs short, and the sensor saturates at high glucose.`));
                    } else if (n > cfg.max) {
                        defs.push(defect("minor", `${n} dips made the membrane so thick that very little glucose gets through. The signal is small and slow.`));
                    }
                } else if (none) {
                    defs.push(defect("minor", "Without a biocompatible coat, proteins stick to the sensor in the body (biofouling), and its readings drift over the days."));
                } else if (n > 3) {
                    defs.push(defect("minor", "A thick hydrogel coat slowed the sensor's response."));
                }
                gs().data[cfg.key] = { mat: none ? "none" : mat, dips: none ? 0 : n };
                const label = cfg.options.find((o) => o.id === mat).label;
                completeStep(defs, `<p>${none ? "Skipped this coating." : `Applied ${n} dip${n === 1 ? "" : "s"} of ${label.toLowerCase()}.`}</p>`);
            }
        }


        /* ---------- Station: enzyme spotter ---------- */

        function openSpot() {

            let enz = null;
            let xl = null;
            let busy = false;

            const m = open("Enzyme Spotter", "An inkjet-style nozzle places tiny droplets of enzyme solution precisely on the working electrode. This is the heart of the sensor: the enzyme is what makes it respond to glucose and almost nothing else.", `
                <div class="adv-machine">
                    <canvas id="spCv" width="220" height="200"></canvas>
                    <div>
                        <p class="adv-round">Enzyme</p>
                        ${ui.chips("enz", [{ id: "gox", label: "Glucose oxidase (GOx)" }, { id: "gdh", label: "Glucose dehydrogenase (GDH)" }, { id: "cat", label: "Catalase" }], null)}
                        <p class="adv-round">Mixed with</p>
                        ${ui.chips("xl", [{ id: "yes", label: "BSA + glutaraldehyde" }, { id: "no", label: "Water only" }], null)}
                        ${ui.slider("spN", "Droplets", "", 1, 10, 1, 2)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="spGo" data-autofocus>Spot the enzyme</button></div>
                        <p class="adv-result" id="spRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("spCv").getContext("2d");
            const nEl = ui.wireSlider("spN");
            ui.wireChips("enz", (v) => { enz = v; });
            ui.wireChips("xl", (v) => { xl = v === "yes"; });

            function draw(k, n) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 200);
                rect(c, 20, 140, 180, 6, "#c8ceda");
                rect(c, 100, 20, 20, 40, "#5d6577");
                rect(c, 106, 60, 8, 8, "#3b4458");
                const drops = Math.floor(k * n);
                for (let i = 0; i < drops; i++) {
                    c.fillStyle = "rgba(255, 216, 74, 0.8)";
                    c.beginPath();
                    c.ellipse(70 + i * 9, 138, 5, 3, 0, 0, Math.PI * 2);
                    c.fill();
                }
                if (k < 1) {
                    const y = 70 + ((k * n) % 1) * 66;
                    c.fillStyle = "#ffd84a";
                    c.beginPath();
                    c.arc(110, y, 3, 0, Math.PI * 2);
                    c.fill();
                }
            }

            draw(0, 0);

            $("spGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!enz || xl === null) {
                    ui.result("spRes", "Choose the enzyme and what it's mixed with.", false);
                    return;
                }
                busy = true;
                const n = Number(nEl.value);
                ui.animate(m, 400 * n + 600, (k) => draw(k, n), () => {
                    const defs = [];
                    if (enz === "cat") {
                        defs.push(defect("major", "Catalase destroys hydrogen peroxide. It's the opposite of what you want: no peroxide reaches the electrode, so there's no signal."));
                    } else if (enz === "gdh") {
                        defs.push(defect("major", "Glucose dehydrogenase doesn't use oxygen, so it makes no hydrogen peroxide for this platinum electrode to read. It's used in test strips with a different chemistry."));
                    }
                    if (!xl) {
                        defs.push(defect("major", "Without a crosslinker, the enzyme slowly washes out of the sensor, and the signal fades day by day."));
                    }
                    if (n < 4) {
                        defs.push(defect("minor", `${n} droplet${n === 1 ? "" : "s"} put down too little enzyme, so the signal is weak.`));
                    } else if (n > 6) {
                        defs.push(defect("minor", `${n} droplets made a thick enzyme layer that slows the response.`));
                    }
                    gs().data.enzyme = { enz: enz, xl: xl, drops: n };
                    completeStep(defs, `<p>Spotted ${n} droplets of ${{ gox: "glucose oxidase", gdh: "glucose dehydrogenase", cat: "catalase" }[enz]}${xl ? " with BSA and glutaraldehyde crosslinker" : " in plain water"}.</p>`);
                });
            });
        }


        /* ---------- Station: cure oven ---------- */

        function openOven() {

            let busy = false;

            const m = open("Cure Oven", "The membranes need time for their solvents to evaporate and their polymers to set. The catch: glucose oxidase is a protein, and heat unfolds proteins for good.", `
                <div class="adv-machine">
                    <canvas id="ovCv" width="220" height="200"></canvas>
                    <div>
                        <div class="adv-lcd"><span id="ovT">25</span> °C</div>
                        ${ui.slider("ovSet", "Temperature", "°C", 4, 150, 1, 120)}
                        ${ui.slider("ovH", "Time", "h", 1, 48, 1, 2)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="ovGo" data-autofocus>Cure</button></div>
                        <p class="adv-result" id="ovRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("ovCv").getContext("2d");
            const tEl = ui.wireSlider("ovSet");
            const hEl = ui.wireSlider("ovH");

            function draw(T) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 200);
                rect(c, 30, 30, 160, 150, "#aab3c4");
                const h = Math.max(0, Math.min(1, (T - 20) / 120));
                rect(c, 44, 44, 132, 110, `rgb(${40 + h * 200}, ${48 + h * 60}, ${70 - h * 40})`);
                for (let i = 0; i < 6; i++) {
                    rect(c, 60 + i * 18, 100, 2, 40, "#e3e7ef");
                }
            }

            draw(25);

            $("ovGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                const H = Number(hEl.value);
                ui.animate(m, 3000, (k) => {
                    const t = 25 + (T - 25) * Math.min(1, k * 2);
                    $("ovT").textContent = Math.round(t);
                    draw(t);
                }, () => {
                    const defs = [];
                    if (T > 50) {
                        defs.push(defect("major", `At ${T} °C the glucose oxidase unfolded (denatured). Most of the enzyme is dead, so the sensor barely responds.`));
                    } else if (T < 15) {
                        defs.push(defect("minor", `At ${T} °C the membranes never fully set, so they stay soft and the readings drift.`));
                    }
                    if (H < 12 && T <= 50) {
                        defs.push(defect("minor", `${H} hours wasn't long enough for the membranes to set fully.`));
                    }
                    gs().data.cureT = T;
                    completeStep(defs, `<p>Cured at ${T} °C for ${H} hours.</p>`);
                });
            });
        }


        /* ---------- Station: potentiostat ---------- */

        function openPstat() {

            let busy = false;

            const m = open("Potentiostat", "The potentiostat holds the platinum working electrode at a fixed voltage against the Ag/AgCl reference. At the right voltage, every H₂O₂ molecule that reaches the platinum gives up two electrons, and that current is the glucose signal. This is called amperometry.", `
                <canvas id="psCv" width="460" height="220" class="adv-wide-canvas"></canvas>
                ${ui.slider("psV", "Working electrode potential", "V vs Ag/AgCl", 0, 1, 0.05, 0.2)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="psGo" data-autofocus>Apply and let it settle</button></div>
                <p class="adv-result" id="psRes" aria-live="polite"></p>`);

            const c = $("psCv").getContext("2d");
            const vEl = ui.wireSlider("psV", (v) => "+" + v.toFixed(2));
            const opts = { x0: 0, x1: 30, y0: 0, y1: 12, xLabel: "Time (min) in 100 mg/dL glucose", yLabel: "Current (nA)", xTicks: [0, 10, 20, 30], yTicks: [0, 6, 12] };
            ui.plot(c, 460, 220, [], opts);

            $("psGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const V = Number(vEl.value);
                gs().data.V = V;
                const md = model();
                const steady = current_nA(md, 100);
                const pts = [];
                for (let t = 0; t <= 30; t += 0.25) {
                    const settle = 1 + 2.5 * Math.exp(-t / 3);
                    pts.push([t, steady * settle + noise(md.noise * 30)]);
                }
                ui.animate(m, 3500, (k) => ui.plot(c, 460, 220, [{ pts: pts, color: "#54e0c7" }], opts, k), () => {
                    const defs = [];
                    if (V < 0.4) {
                        defs.push(defect("major", `At +${V.toFixed(2)} V, very little peroxide is oxidized, so the current is tiny.`));
                    } else if (V < 0.5) {
                        defs.push(defect("minor", `At +${V.toFixed(2)} V only part of the peroxide reacts. The signal is weaker than it should be.`));
                    } else if (V > 0.8) {
                        defs.push(defect("major", `At +${V.toFixed(2)} V, interferents and even water start reacting, making the signal noisy and less selective.`));
                    } else if (V > 0.7) {
                        defs.push(defect("minor", `+${V.toFixed(2)} V is a bit high: more interferents react at the platinum.`));
                    }
                    completeStep(defs, `<p>Held the electrode at +${V.toFixed(2)} V. After a big start-up spike (charging the electrode surface), the current settled to about <strong>${steady.toFixed(1)} nA</strong> in 100 mg/dL glucose.</p><p>That settling is why real CGMs have a warm-up period after insertion.</p>`);
                });
            });
        }


        /* ---------- Station: calibration bath ---------- */

        const STANDARDS = [0, 50, 100, 200, 300, 400];

        function openBath() {

            let temp = null;
            let buf = null;
            let busy = false;

            const m = open("Calibration Bath", "Dip sensors from the batch into glucose standards of known concentration and record the steady current for each. The straight line through those points is the calibration: it turns nanoamps into mg/dL. When every sensor in a batch behaves alike, this factory calibration means users never need fingersticks to calibrate.", `
                <div class="adv-furnace-grid">
                    <div>
                        <p class="adv-round">Bath temperature</p>
                        ${ui.chips("btemp", [{ id: "25", label: "25 °C" }, { id: "37", label: "37 °C" }], null)}
                        <p class="adv-round">Solution</p>
                        ${ui.chips("buf", [{ id: "pbs", label: "PBS" }, { id: "di", label: "DI water" }], null)}
                    </div>
                    <div>
                        <p class="adv-round">Glucose standards to run (mg/dL)</p>
                        <div class="adv-chips">${STANDARDS.map((g) => `<label class="adv-chip"><input type="checkbox" value="${g}" class="cbStd"> ${g}</label>`).join("")}</div>
                    </div>
                </div>
                <canvas id="cbCv" width="460" height="240" class="adv-wide-canvas"></canvas>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="cbGo" data-autofocus>Run the standards</button></div>
                <p class="adv-result" id="cbRes" aria-live="polite"></p>
                <div id="cbQuiz"></div>`);

            const c = $("cbCv").getContext("2d");
            ui.wireChips("btemp", (v) => { temp = Number(v); });
            ui.wireChips("buf", (v) => { buf = v; });
            const opts = { x0: 0, x1: 400, y0: 0, y1: 20, xLabel: "Glucose (mg/dL)", yLabel: "Current (nA)", xTicks: [0, 100, 200, 300, 400], yTicks: [0, 10, 20] };
            ui.plot(c, 460, 240, [], opts);

            $("cbGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                const picked = [...api.modalBody().querySelectorAll(".cbStd:checked")].map((x) => Number(x.value)).sort((a, b) => a - b);
                if (!temp || !buf) {
                    ui.result("cbRes", "Choose the bath temperature and solution first.", false);
                    return;
                }
                if (picked.length < 2) {
                    ui.result("cbRes", "Pick at least two standards. The card says at least four, from 0 to 400 mg/dL.", false);
                    return;
                }
                if (buf === "di") {
                    ui.result("cbRes", "The current is erratic: DI water has almost no ions, so the electrodes can't pass current properly. Use PBS (phosphate-buffered saline), which is salty like body fluid.", false);
                    return;
                }
                busy = true;
                const md = model();
                // enzymes run slower when cool: a 25 °C calibration overestimates in the body
                const tf = temp === 37 ? 1 : 0.75;
                const pts = picked.map((g) => [g, current_nA(md, g) * tf + noise(0.08)]);
                const n = pts.length;
                const mx = pts.reduce((a, p) => a + p[0], 0) / n;
                const my = pts.reduce((a, p) => a + p[1], 0) / n;
                const slope = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((a, p) => a + (p[0] - mx) * (p[0] - mx), 0);
                const icpt = my - slope * mx;
                const line = [[0, icpt], [400, icpt + slope * 400]];
                opts.y1 = Math.max(5, Math.ceil(Math.max(...pts.map((p) => p[1]), line[1][1]) / 5) * 5);
                opts.yTicks = [0, opts.y1 / 2, opts.y1];

                ui.animate(m, 2500, (k) => ui.plot(c, 460, 240, [{ pts: line, color: "#54607f" }, { pts: pts, color: "#54e0c7", dots: true }], opts, k), () => {
                    busy = false;
                    // how straight is it? compare the top point with the line
                    const top = pts[pts.length - 1];
                    const linear = md.gsat > 1000;
                    const range = picked[picked.length - 1] - picked[0];
                    const defs = [];
                    if (md.dead) {
                        ui.result("cbRes", "The current hardly changes with glucose. Something upstream killed the response: the enzyme, the electrode or the sterilization plan.", false);
                    } else {
                        ui.result("cbRes", `Sensitivity (slope) = <strong>${(slope).toFixed(3)} nA per mg/dL</strong>. Intercept = <strong>${icpt.toFixed(2)} nA</strong>.${linear ? " The points sit on a straight line all the way up." : " <strong>The points bend over at high glucose</strong>: the sensor is saturating because the glucose-limiting membrane is too thin."}`, linear);
                    }
                    if (temp !== 37) {
                        defs.push(defect("minor", "Calibrating at 25 °C instead of body temperature (37 °C) means the factory calibration will be off once the sensor is in the body."));
                    }
                    if (picked.length < 4 || range < 300) {
                        defs.push(defect("minor", `Only ${picked.length} standard${picked.length === 1 ? "" : "s"} spanning ${range} mg/dL: too few to check that the sensor stays linear over the whole range.`));
                    }
                    gs().data.cal = { slope: slope, icpt: icpt, temp: temp };

                    const reading = 150 + Math.round(Math.random() * 100);
                    const I = icpt + slope * reading;
                    const opts2 = [reading, Math.round(I / slope), Math.round(I * 18), Math.round((I - icpt) * slope * 100)].map((v, i) => ({ v: v, ok: i === 0 }));
                    const shuffled = window.SCGames ? window.SCGames.shuffle(opts2) : opts2;
                    $("cbQuiz").innerHTML = md.dead ? `<button type="button" class="adv-btn" id="cbNext">Continue anyway</button>` : `
                        <div class="adv-takeaway">
                            <p><strong>Use your calibration.</strong> A sensor from this batch reads <strong>${I.toFixed(2)} nA</strong>. What glucose is that?</p>
                            <div class="adv-chips">${shuffled.map((o, i) => `<button type="button" class="adv-chip" data-cq="${i}">${o.v} mg/dL</button>`).join("")}</div>
                            <p class="adv-result" id="cbQRes"></p>
                        </div>`;
                    if (md.dead) {
                        $("cbNext").addEventListener("click", () => completeStep(defs, "<p>Calibration attempted, but the batch barely responds to glucose.</p>"));
                        return;
                    }
                    let answered = false;
                    api.modalBody().querySelectorAll("[data-cq]").forEach((b) => b.addEventListener("click", () => {
                        if (answered) {
                            return;
                        }
                        answered = true;
                        const o = shuffled[Number(b.dataset.cq)];
                        b.classList.add("on");
                        ui.result("cbQRes", `${o.ok ? "✓" : "✗"} Glucose = (current − intercept) ÷ slope = (${I.toFixed(2)} − ${icpt.toFixed(2)}) ÷ ${slope.toFixed(3)} ≈ <strong>${reading} mg/dL</strong>.`, o.ok);
                        const nx = document.createElement("div");
                        nx.className = "adv-button-row";
                        nx.innerHTML = '<button type="button" class="adv-btn" id="cbNext">Continue</button>';
                        $("cbQuiz").appendChild(nx);
                        $("cbNext").addEventListener("click", () => completeStep(defs, `<p>Calibration: <strong>${slope.toFixed(3)} nA per mg/dL</strong>, intercept ${icpt.toFixed(2)} nA, measured at ${temp} °C.</p>`));
                    }));
                });
            });
        }


        /* ---------- Station: interference bench ---------- */

        const INTERFERENTS = [
            { id: "apap", label: "Acetaminophen (2 mg/dL)", w: 1 },
            { id: "asc", label: "Vitamin C (ascorbic acid)", w: 0.7 },
            { id: "uric", label: "Uric acid", w: 0.5 }
        ];

        function openInterf() {

            const md = model();
            const tested = {};
            let busy = false;

            const m = open("Interference Bench", "Some molecules in the body can react at the electrode and add false current, making the sensor read too high. The inner layer is supposed to block them. Prove it: add each one to a 100 mg/dL glucose sample and watch the reading.", `
                <div class="adv-chips">${INTERFERENTS.map((x) => `<button type="button" class="adv-chip" data-in="${x.id}">Add ${x.label}</button>`).join("")}</div>
                <canvas id="inCv" width="460" height="200" class="adv-wide-canvas"></canvas>
                <p class="adv-result" id="inRes" aria-live="polite"></p>
                <div id="inJudge"></div>`);

            const c = $("inCv").getContext("2d");
            const opts = { x0: 0, x1: 20, y0: 0, y1: 200, xLabel: "Time (min)", yLabel: "Reading (mg/dL)", xTicks: [0, 10, 20], yTicks: [0, 100, 200] };
            ui.plot(c, 460, 200, [], opts);

            api.modalBody().querySelectorAll("[data-in]").forEach((b) => b.addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const x = INTERFERENTS.find((i) => i.id === b.dataset.in);
                const jump = md.dead ? 0 : md.interf * x.w;
                const pts = [];
                for (let t = 0; t <= 20; t += 0.2) {
                    const r = md.dead ? 3 : 100 * (1 + (t > 8 ? jump * (1 - Math.exp(-(t - 8) / 1.2)) : 0)) + noise(2);
                    pts.push([t, r]);
                }
                ui.animate(m, 3000, (k) => ui.plot(c, 460, 200, [{ pts: pts, color: "#ffd84a" }], opts, k), () => {
                    busy = false;
                    const pct = Math.round(jump * 100);
                    tested[x.id] = pct;
                    ui.result("inRes", `${x.label}: the reading ${md.dead ? "never responded to glucose in the first place" : `rose by <strong>${pct}%</strong>`}.`, md.dead ? false : pct < 10);
                    if ("apap" in tested && !$("inYes")) {
                        $("inJudge").innerHTML = `
                            <p class="adv-round">Does the batch pass the acetaminophen test (less than 10% change)?</p>
                            <div class="adv-button-row">
                                <button type="button" class="adv-btn" id="inYes">✓ Pass</button>
                                <button type="button" class="adv-btn secondary" id="inNo">✗ Fail</button>
                            </div>`;
                        const decide = (says) => {
                            const truth = !md.dead && tested.apap < 10;
                            const defs = [];
                            if (!truth) {
                                defs.push(defect(tested.apap >= 25 ? "major" : "minor", `Acetaminophen raised the reading by ${tested.apap}%. People taking it would see falsely high glucose.`));
                            }
                            completeStep(defs, `<p>${says === truth ? "✓ Right call." : "✗ Not quite."} Acetaminophen changed the reading by ${tested.apap}%, so the batch ${truth ? "passes" : "fails"} the 10% limit.</p><p>Real CGM labels list substances that can affect readings, so users know what to watch for.</p>`);
                        };
                        $("inYes").addEventListener("click", () => decide(true));
                        $("inNo").addEventListener("click", () => decide(false));
                    }
                });
            }));
        }


        /* ---------- Station: packaging and sterilizing ---------- */

        function openPack() {

            let how = null;
            let busy = false;

            const m = open("Packaging & Sterilization Line", "Each sensor is loaded into its spring-loaded applicator, sealed in a pouch, and then sterilized, because it will sit under someone's skin for days. The sterilization has to kill every microbe without killing the enzyme.", `
                <div class="adv-machine">
                    <canvas id="pkCv" width="220" height="200"></canvas>
                    <div>
                        <p class="adv-round">Sterilization method</p>
                        ${ui.chips("ster", [{ id: "ebeam", label: "Electron beam (e-beam)" }, { id: "eto", label: "Ethylene oxide gas" }, { id: "steam", label: "Steam autoclave, 121 °C" }, { id: "none", label: "Skip it" }], null)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="pkGo" data-autofocus>Pack and sterilize</button></div>
                        <p class="adv-result" id="pkRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("pkCv").getContext("2d");
            ui.wireChips("ster", (v) => { how = v; });

            function draw(k) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 200);
                rect(c, 10, 140, 200, 8, "#5d6577");
                for (let i = 0; i < 4; i++) {
                    const x = ((k * 200 + i * 55) % 220) - 20;
                    rect(c, x, 110, 36, 30, "#f5f7ff");
                    rect(c, x + 8, 116, 20, 18, "#c8ceda");
                }
                rect(c, 90, 40, 40, 60, "#3b4458");
                c.fillStyle = `rgba(127, 178, 255, ${0.3 + 0.3 * Math.sin(k * 40)})`;
                c.fillRect(96, 100, 28, 12);
            }

            draw(0);

            $("pkGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!how) {
                    ui.result("pkRes", "Choose a sterilization method first.", false);
                    return;
                }
                if (how === "none") {
                    ui.result("pkRes", "Not allowed! Anything that goes under the skin must be sterile. Medical device rules require a validated sterilization step.", false);
                    return;
                }
                busy = true;
                ui.animate(m, 3500, (k) => draw(k), () => {
                    const defs = [];
                    if (how === "steam") {
                        defs.push(defect("major", "Steam at 121 °C sterilized the sensors, and cooked the glucose oxidase. The whole batch is dead."));
                    }
                    gs().data.steril = how;
                    completeStep(defs, `<p>Sealed every sensor in its applicator and sterilized the batch with ${{ ebeam: "an electron beam", eto: "ethylene oxide gas", steam: "steam" }[how]}.</p>`);
                });
            });
        }


        /* ---------- Station: clinical accuracy study (MARD) ---------- */

        function openStudy() {

            const md = model();
            const d = gs().data;
            const calOff = d.cal && d.cal.temp === 25 ? 1.25 : 1;
            const refs = [64, 118, 172, 246];
            const pairs = refs.map((r) => {
                if (md.dead) {
                    return [r, null];
                }
                // saturation reads low at the top, interference and drift add error
                const sat = md.gsat >= 1000 ? 1 : 1 / (1 + r / md.gsat) * (1 + 100 / md.gsat);
                const err = (md.noise * 2 + md.drift * 1.5 + md.interf * 0.3) * (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.6);
                const base = 0.03 + Math.random() * 0.05;
                const cgm = r * sat * calOff * (1 + (Math.random() < 0.5 ? -base : base) + err);
                return [r, Math.round(cgm)];
            });
            const ards = pairs.map(([r, g]) => (g === null ? null : Math.abs(g - r) / r * 100));
            const mard = md.dead ? null : ards.reduce((a, b) => a + b, 0) / ards.length;

            open("Clinical Accuracy Study", "Volunteers wear the new sensors while the clinic takes reference blood readings. Every sensor reading is paired with the reference taken at the same moment. The average percent error across all pairs is the MARD (mean absolute relative difference).", `
                <table class="adv-mini-table">
                    <thead><tr><th>Pair</th><th>Reference (mg/dL)</th><th>Sensor (mg/dL)</th><th>ARD</th></tr></thead>
                    <tbody>${pairs.map(([r, g], i) => `<tr><td>${i + 1}</td><td>${r}</td><td>${g === null ? "--- (no signal)" : g}</td><td>${g === null ? "—" : `|${g} − ${r}| ÷ ${r} = ${ards[i].toFixed(1)}%`}</td></tr>`).join("")}</tbody>
                </table>
                <div id="stQuiz"></div>`);

            if (md.dead) {
                $("stQuiz").innerHTML = `
                    <div class="adv-takeaway"><p>The sensors show "---": they aren't responding to glucose at all. A dead batch can't go to patients.</p></div>
                    <button type="button" class="adv-btn" id="stRestart">Scrap the batch and start over</button>`;
                $("stRestart").addEventListener("click", () => {
                    resetRun();
                    api.closeModal();
                    api.say(["The batch is scrapped. Back to the electrode bench for a fresh start.", "Check Dr. Dex's card at every station. It has the settings."], "Nurse Mira");
                });
                return;
            }

            const wrongs = [mard * 0.5, mard * 1.6, mard + 5].map((v) => Math.max(0.5, v));
            const opts = [mard].concat(wrongs).map((v, i) => ({ v: v, ok: i === 0 }));
            const shuffled = window.SCGames ? window.SCGames.shuffle(opts) : opts;

            $("stQuiz").innerHTML = `
                <div class="adv-takeaway">
                    <p><strong>Your turn:</strong> what is the MARD of this study?</p>
                    <div class="adv-chips">${shuffled.map((o, i) => `<button type="button" class="adv-chip" data-mq="${i}">${o.v.toFixed(1)}%</button>`).join("")}</div>
                    <p class="adv-result" id="stRes"></p>
                </div>`;

            let answered = false;
            api.modalBody().querySelectorAll("[data-mq]").forEach((b) => b.addEventListener("click", () => {
                if (answered) {
                    return;
                }
                answered = true;
                b.classList.add("on");
                const o = shuffled[Number(b.dataset.mq)];
                const pass = mard <= 10;
                ui.result("stRes", `${o.ok ? "✓" : "✗"} MARD = (${ards.map((a) => a.toFixed(1)).join(" + ")}) ÷ 4 = <strong>${mard.toFixed(1)}%</strong>. ${pass ? "Under 10%: as good as today's leading systems." : mard <= 15 ? "Over 10%: usable, but not up to today's best." : "Well over 10%: too inaccurate for people to make treatment decisions."}`, o.ok);
                const defs = [];
                if (mard > 15) {
                    defs.push(defect("major", `The clinical MARD was ${mard.toFixed(1)}%. Readings that far off could lead to wrong treatment decisions.`));
                } else if (mard > 10) {
                    defs.push(defect("minor", `The clinical MARD was ${mard.toFixed(1)}%, above the 10% that leading systems reach.`));
                }
                gs().data.mard = mard;
                const nx = document.createElement("div");
                nx.className = "adv-button-row";
                nx.innerHTML = '<button type="button" class="adv-btn" id="stNext">Continue</button>';
                $("stQuiz").appendChild(nx);
                $("stNext").addEventListener("click", () => {
                    gs().batch = { mard: mard, made: Date.now() };
                    completeStep(defs, `<p>Study MARD: <strong>${mard.toFixed(1)}%</strong>.</p><p>The sensors are cleared for the residents. Head out into town and find everyone with a <strong>?</strong> over their head.</p>`);
                });
            }));
        }


        /* ---------- Residents ---------- */

        const RESIDENTS = [
            {
                id: "maya", name: "Maya", x: 5, y: 8, look: { suit: "#ffd1dc", accent: "#ff6b9d", visor: "#5ad1ff" },
                story: [
                    "Hi! I'm Maya. I've had type 1 diabetes since I was nine. My pancreas doesn't make insulin, so I give it myself and count the carbs in everything I eat.",
                    "I check my blood with fingersticks eight times a day. What scares me most is going low at night while I'm asleep."
                ],
                day: (t) => 130 + 60 * Math.sin((t - 7) / 3) * (t > 7 && t < 22 ? 1 : 0.2) - (t > 1 && t < 5 ? 55 * Math.sin((t - 1) / 4 * Math.PI) : 0),
                event: { t: 3, text: "3 AM: low alarm at 62 mg/dL" },
                thanks: "It buzzed at 3 AM when I dropped low, so I had some juice before it got bad. I actually slept through the night for once. Thank you!"
            },
            {
                id: "okafor", name: "Mr. Okafor", x: 13, y: 13, look: { suit: "#c9d6ff", accent: "#3d6fd8", visor: "#33405c" },
                story: [
                    "Good afternoon. I have type 2 diabetes. My body doesn't respond to insulin as well as it used to.",
                    "My morning fingerstick looks fine, but my doctor says my glucose runs high after meals. I'd like to see what's really happening."
                ],
                day: (t) => 115 + (t > 19 && t < 22.5 ? 95 * Math.sin((t - 19) / 3.5 * Math.PI) : 0) + (t > 12.5 && t < 15 ? 55 * Math.sin((t - 12.5) / 2.5 * Math.PI) : 0),
                event: { t: 20.5, text: "After dinner: up to 210 mg/dL" },
                thanks: "Now I can see my glucose climb after dinner. My doctor and I are adjusting my plan, and a short walk after eating helps flatten the curve. Thank you!"
            },
            {
                id: "reyes", name: "Coach Reyes", x: 17, y: 6, look: { suit: "#d6ffd9", accent: "#2ebfa5", visor: "#ffd84a" },
                story: [
                    "Hey there! I coach the Grove running club, and I've got type 1 diabetes.",
                    "Long runs make my glucose fall fast, and by the time I feel it, I'm already low. I need a heads-up before it happens."
                ],
                day: (t) => 140 - (t > 7 && t < 9.5 ? 70 * Math.sin((t - 7) / 2.5 * Math.PI) : 0) + 20 * Math.sin(t / 3),
                event: { t: 8, text: "Morning run: trend arrow ↓↓, warning before a low" },
                thanks: "The trend arrow warned me I was dropping fast halfway through my run, so I grabbed a sports drink and finished strong. Thank you!"
            },
            {
                id: "priya", name: "Priya", x: 9, y: 13, look: { suit: "#ffe9c2", accent: "#ff8a5c", visor: "#7fb2ff" },
                story: [
                    "Hello! I developed gestational diabetes during my pregnancy. It's a kind of diabetes that can appear while you're pregnant.",
                    "My care team wants my glucose in a tight range for the baby's health, and pricking my finger after every meal is wearing me out."
                ],
                day: (t) => 100 + 25 * Math.sin((t - 8) / 2.2) * (t > 7 && t < 21 ? 1 : 0.3),
                event: { t: 13, text: "Steady after lunch: in range" },
                thanks: "I can glance at my phone and see I'm in range, and my care team can see my numbers too. It's such a relief. Thank you!"
            },
            {
                id: "sam", name: "Sam & Dad", x: 16, y: 13, look: { suit: "#e6defa", accent: "#b46bff", visor: "#5be38a" },
                story: [
                    "I'm Sam's dad. Sam is seven and was diagnosed with type 1 diabetes last month.",
                    "We're checking every few hours, even in the middle of the night. I just want to know Sam is okay while sleeping."
                ],
                day: (t) => 150 + 50 * Math.sin((t - 6) / 2.6) - (t > 0 && t < 4 ? 25 : 0),
                event: { t: 2, text: "Shared to Dad's phone overnight" },
                thanks: "Sam's readings show up on my phone now, so I can check without waking anyone. We both got a full night's sleep! Thank you!"
            }
        ];

        function allFitted() {
            const s = gs();
            return RESIDENTS.every((r) => s.fitted[r.id]);
        }

        function residentTalk(r) {
            const s = gs();
            if (s.fitted[r.id]) {
                return [r.thanks];
            }
            if (s.recipe && current() && current().id === "fit") {
                return { lines: r.story.concat(["You have sensors for us? Yes please!"]), done: () => openFit(r) };
            }
            return r.story.concat([s.recipe ? "I hear Dr. Dex is making sensors at SensorWorks. I hope they're ready soon!" : "Someone said Dr. Dex at SensorWorks needs help making glucose sensors…"]);
        }

        const SITES = [
            { id: "arm", label: "Back of the upper arm" },
            { id: "belly", label: "Abdomen" },
            { id: "wrist", label: "Wrist" },
            { id: "finger", label: "Fingertip" }
        ];

        function openFit(r) {

            let site = null;
            let busy = false;
            const md = model();
            const mard = gs().data.mard || 9;

            const m = api.openModal(`
                ${api.head("glucose", "Fit a Sensor: " + r.name)}
                ${cardHtml(STEPS[STEPS.length - 1])}
                <p class="adv-round">Insertion site</p>
                ${ui.chips("site", SITES, null)}
                <label class="adv-check"><input type="checkbox" id="ftWipe"> Clean the skin with an alcohol wipe</label>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="ftGo" data-autofocus>Apply the sensor</button></div>
                <p class="adv-result" id="ftRes" aria-live="polite"></p>
                <canvas id="ftCv" width="460" height="240" class="adv-wide-canvas" hidden></canvas>
                <div id="ftDone"></div>`);

            ui.wireChips("site", (v) => { site = v; });

            $("ftGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!site) {
                    ui.result("ftRes", "Choose where the sensor goes first.", false);
                    return;
                }
                if (site === "wrist" || site === "finger") {
                    ui.result("ftRes", `The ${site === "wrist" ? "wrist" : "fingertip"} isn't an approved site: it moves and bumps constantly and there's too little fatty tissue. Use the back of the upper arm or the abdomen.`, false);
                    return;
                }
                if (!$("ftWipe").checked) {
                    ui.result("ftRes", "Clean the skin with an alcohol wipe first, to lower the chance of infection.", false);
                    return;
                }
                busy = true;
                $("ftGo").disabled = true;
                ui.result("ftRes", "Click! The applicator slips the thin filament under the skin. Warming up while the tissue settles…");
                const c = $("ftCv").getContext("2d");
                $("ftCv").hidden = false;
                const truth = [];
                const cgm = [];
                const err = (mard / 100) * 1.2;
                let e = 0;
                for (let t = 0; t <= 24; t += 0.1) {
                    const g = Math.max(45, r.day(t));
                    // sensor error wanders smoothly rather than jumping every reading
                    e = 0.85 * e + 0.15 * noise(err * 2.5);
                    truth.push([t, g]);
                    cgm.push([t, md.dead ? 40 : g * (1 + e) * (1 + md.drift * t / 24)]);
                }
                const opts = {
                    x0: 0, x1: 24, y0: 40, y1: 260,
                    xLabel: "Time of day (hours)", yLabel: "Glucose (mg/dL)",
                    xTicks: [0, 6, 12, 18, 24], yTicks: [70, 180, 250],
                    bands: [{ lo: 70, hi: 180, color: "rgba(91, 227, 138, 0.12)" }, { lo: 40, hi: 70, color: "rgba(255, 107, 125, 0.15)" }]
                };
                ui.animate(m, 6000, (k) => ui.plot(c, 460, 240, [{ pts: cgm, color: "#54e0c7" }], opts, k), () => {
                    gs().fitted[r.id] = true;
                    api.writeSave();
                    const left = RESIDENTS.filter((x) => !gs().fitted[x.id]).length;
                    $("ftDone").innerHTML = `
                        <div class="adv-takeaway">
                            <p><strong>${r.event.text}.</strong> The green band is the 70–180 mg/dL target range. The red band is low.</p>
                            <p>${r.name}: "${r.thanks}"</p>
                            <p>${left ? `${left} resident${left === 1 ? "" : "s"} still need${left === 1 ? "s" : ""} a sensor.` : "That's everyone!"}</p>
                        </div>
                        <button type="button" class="adv-btn" id="ftNext">${left ? "Back to town" : "See the batch report"}</button>`;
                    $("ftNext").addEventListener("click", () => {
                        if (left) {
                            api.closeModal();
                        } else {
                            finishBatch();
                        }
                    });
                    $("ftNext").focus();
                });
            });
        }

        function finishBatch() {

            const s = gs();
            const defs = allDefects();
            const majors = defs.filter((d) => d.sev === "major").length;
            const stars = !defs.length ? 3 : !majors ? 2 : 1;
            const first = !s.best;
            let xp = first ? 200 + stars * 25 : stars > s.best ? (stars - s.best) * 25 : 0;
            const mard = s.data.mard;

            s.best = Math.max(s.best, stars);
            s.defects.fit = [];
            s.step = STEPS.length;
            api.writeSave();
            if (xp) {
                api.gainXP(xp);
            }
            api.awardSiteXP("glucosebatch", 200);

            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">BATCH REPORT</p>
                    <h2>🩸 Glucose Sensor Batch</h2>
                    <p class="adv-stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
                    ${xp ? `<p class="adv-xp-big">+${xp} XP</p>` : ""}
                    <ul class="adv-stats" style="justify-content:center">
                        <li>Clinical MARD <strong>${mard ? mard.toFixed(1) + "%" : "—"}</strong></li>
                        <li>Residents fitted <strong>5 / 5</strong></li>
                    </ul>
                    <div class="adv-takeaway">
                        ${defs.length ? defs.map((d) => `<p>${d.sev === "major" ? "⚠️" : "•"} ${d.cause}</p>`).join("") : "<p>A flawless batch from wire to patient!</p>"}
                    </div>
                    <button type="button" class="adv-btn" data-close>Back to town</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();

            api.afterModal(() => api.say(s.boss ? ["Another batch, and everyone's still in range. Wonderful work!"] : [
                "Every resident has a sensor! The whole town is watching their numbers.",
                "Wait… what's that in the park? Something sweet and spiky is rising out of the fountain…",
                "It's The Sugar Spike! Go!"
            ], "Dr. Dex"));
        }


        /* ---------- Boss: The Sugar Spike ---------- */

        function drawSpike(c, ox, oy, s, t) {
            const px = (x, y, w, h, col) => rect(c, ox + x * s, oy + y * s, w * s, h * s, col);
            const bob = Math.round(Math.sin(t / 420) * 1);
            // a jagged glucose-graph crown of sugar crystals
            const peaks = [[2, 14], [7, 4], [12, 10], [16, 0], [21, 9], [25, 3], [29, 12]];
            peaks.forEach(([x, y]) => {
                for (let yy = y; yy < 18; yy++) {
                    const w = Math.max(1, Math.round((yy - y) * 0.6) + 1);
                    px(x - Math.floor(w / 2), yy + bob, w, 1, yy % 3 ? "#fbe9f0" : "#ffffff");
                }
                px(x, y + bob, 1, 1, "#ff9ab0");
            });
            // sugar-cube body
            px(4, 16 + bob, 24, 14, "#3a1f30");
            px(5, 17 + bob, 22, 12, "#fff3f7");
            for (let i = 0; i < 4; i++) {
                px(7 + i * 5, 19 + bob, 2, 2, "#f2c3d2");
                px(9 + i * 5, 24 + bob, 2, 2, "#f2c3d2");
            }
            // face
            px(10, 20 + bob, 4, 4, "#1a2033");
            px(18, 20 + bob, 4, 4, "#1a2033");
            px(11, 21 + bob, 1, 1, "#ff4d6d");
            px(19, 21 + bob, 1, 1, "#ff4d6d");
            px(13, 26 + bob, 6, 1, "#1a2033");
            px(12, 25 + bob, 1, 1, "#1a2033");
            px(19, 25 + bob, 1, 1, "#1a2033");
            px(6, 30, 6, 2, "rgba(0,0,0,0.2)");
            px(20, 30, 6, 2, "rgba(0,0,0,0.2)");
        }

        const SPIKE_QS = {
            body: [
                { q: "What does insulin do?", a: ["Helps cells take in glucose, which lowers blood glucose", "Raises blood glucose", "Turns glucose into oxygen", "Makes glucose sensors work"], why: "Insulin lets cells take up glucose. In type 1 diabetes the body stops making it." },
                { q: "What range do most CGM users aim to stay in?", a: ["70 to 180 mg/dL", "0 to 70 mg/dL", "180 to 300 mg/dL", "300 to 400 mg/dL"], why: "Time in range is the share of the day spent between 70 and 180 mg/dL." },
                { q: "Why are lows the more urgent danger?", a: ["Below 70 mg/dL can cause confusion or seizures within hours", "Lows only matter after years", "Lows are never dangerous", "Lows make sensors break"], why: "Highs do damage over years; lows can become an emergency quickly." },
                { q: "How do you convert mg/dL to mmol/L?", a: ["Divide by about 18", "Multiply by 18", "Divide by 100", "They're the same"], why: "For example, 90 mg/dL ÷ 18 ≈ 5 mmol/L." }
            ],
            enzyme: [
                { q: "What does glucose oxidase turn glucose and oxygen into?", a: ["Gluconolactone and hydrogen peroxide", "Insulin and water", "Carbon dioxide and sugar", "Salt and acid"], why: "The H₂O₂ is what the platinum electrode reads." },
                { q: "Why is glucose oxidase so selective?", a: ["Its shape fits glucose like a lock fits a key", "It's very hot", "It only works in the dark", "It's made of platinum"], why: "Enzymes bind molecules that fit their active site." },
                { q: "Why can't glucose sensors be steam-sterilized?", a: ["The heat would destroy the enzyme", "Steam is too expensive", "Steam makes them magnetic", "It would make them too sterile"], why: "Low-temperature methods like e-beam or ethylene oxide keep the enzyme alive." },
                { q: "Which enzyme works without oxygen?", a: ["Glucose dehydrogenase", "Glucose oxidase", "Catalase", "Insulin"], why: "GDH passes electrons another way, which is why it's common in test strips." }
            ],
            membrane: [
                { q: "Why should the outer membrane let oxygen through more easily than glucose?", a: ["Tissue has far less oxygen than glucose, so glucose must be the limiting ingredient", "Oxygen is toxic", "Glucose is too small", "So the sensor glows"], why: "If oxygen ran out first, the signal would stop tracking glucose." },
                { q: "What does the inner interference layer block?", a: ["Molecules like acetaminophen, vitamin C and uric acid", "Glucose", "Hydrogen peroxide", "Electricity"], why: "They can react at the electrode and add false current." },
                { q: "At about what voltage is H₂O₂ oxidized at platinum?", a: ["About +0.6 V", "About +6 V", "About −1.5 V", "Exactly 0 V"], why: "The potentiostat holds the working electrode there versus Ag/AgCl." },
                { q: "How many electrons does each H₂O₂ give up at the electrode?", a: ["Two", "One", "Four", "None"], why: "H₂O₂ → O₂ + 2H⁺ + 2e⁻." }
            ],
            accuracy: [
                { q: "What does MARD stand for?", a: ["Mean absolute relative difference", "Maximum allowed reading deviation", "Medical accuracy rating device", "Mean amperometric response delay"], why: "It's the average percent error against reference readings." },
                { q: "Reference reads 100 mg/dL and the CGM reads 110. What's the ARD?", a: ["10%", "1%", "110%", "0.1%"], why: "|110 − 100| ÷ 100 × 100% = 10%." },
                { q: "What MARD do today's leading CGMs report?", a: ["Roughly 8 to 10 percent", "About 50 percent", "Exactly 0 percent", "About 1 percent"], why: "Lower is better, and the best systems are near 8–10%." },
                { q: "What is a compression low?", a: ["A false low reading from pressure on the sensor, like lying on it", "A real low after exercise", "A low battery warning", "A broken sensor"], why: "Squeezed tissue gets less fluid flow, so the sensor reads low." }
            ]
        };

        function spikeBattle() {
            return {
                foeName: "The Sugar Spike",
                foeTag: "Glucose excursion · Lv 17",
                foeSize: 32,
                fieldClass: "adv-field-sugar",
                drawFoe: (c, t) => drawSpike(c, 0, 0, 1, t),
                foeMax: 240,
                foePower: 0.92,
                meMax: 140,
                moves: [
                    { type: "body", name: "Time in Range", mult: 1, label: "Glucose & the body", icon: "📈", special: "litho", cls: "litho", effect: "The whole graph settles back into the green band!" },
                    { type: "enzyme", name: "Enzyme Lock", mult: 1.75, label: "Enzyme chemistry", icon: "🧬", special: "dep", cls: "dep", effect: "Direct hit! Glucose oxidase grabs every sugar molecule it can reach." },
                    { type: "membrane", name: "Membrane Shield", mult: 1.5, label: "Membranes & electrodes", icon: "🛡️", special: "etch", cls: "etch", effect: "It's effective! The membrane meters the glucose so the spike can't overwhelm you." },
                    { type: "accuracy", name: "Calibrate", mult: 0.5, focus: true, label: "Accuracy", icon: "🎯", special: "inspect", cls: "inspect", effect: "You calibrated against a reference. Your next hit does 1.5× damage!" }
                ],
                questions: SPIKE_QS,
                attacks: [
                    { name: "Sugar Rush", text: "The readings rocketed past 250 mg/dL!" },
                    { name: "Compression Low", text: "Someone rolled onto their sensor, and a false low alarm went off!" },
                    { name: "Signal Drift", text: "Your calibration slid off the line!" }
                ],
                intro: [
                    "A towering pile of sugar crystals rises from the park… It's <strong>The Sugar Spike</strong>!",
                    "It sends glucose readings soaring and crashing. Answer sensor questions to bring it back into range!"
                ],
                runText: "You backed away. The Sugar Spike is still looming over the park…",
                loseTitle: "The Sugar Spike sent you off the chart",
                loseTip: "Tip: The Sugar Spike is weak to <strong>Enzyme Lock</strong> and <strong>Membrane Shield</strong>. <strong>Calibrate</strong> first to make your next hit 1.5× stronger.",
                winLines: [
                    "The Sugar Spike melts back into a gentle, in-range line!",
                    "📜 Dr. Dex hands you the Glucose Grove Certificate of Completion!"
                ],
                onWin: () => {
                    const s = gs();
                    const first = !s.boss;
                    s.boss = true;
                    api.save().badges.glucose = true;
                    api.writeSave();
                    api.updateHud();
                    if (first) {
                        api.gainXP(150);
                        api.awardSiteXP("glucoseboss", 150);
                    }
                    api.afterModal(() => api.say([
                        "You flattened The Sugar Spike! Everyone in Glucose Grove is back in range.",
                        "Sensors don't cure diabetes, but they give people the information to manage it, day and night. Here's your Glucose Grove Certificate of Completion!",
                        "Grey Matter, just east of here, could use someone like you. Their doctors want sensors that read brain chemicals."
                    ], "Dr. Dex"));
                    return `
                        <div class="adv-complete">
                            <p class="eyebrow">BACK IN RANGE</p>
                            <h2>${first ? "📜 Certificate of Completion" : "🩸 Rematch Won"}</h2>${first ? api.certificate("glucose") : ""}
                            ${first ? '<p class="adv-xp-big">+150 XP</p>' : ""}
                            <div class="adv-takeaway">
                                <p>A CGM is a tiny electrochemical lab under the skin: a platinum electrode, glucose oxidase, and a stack of membranes, read every few minutes by a potentiostat in the transmitter.</p>
                                <p>Its value is the trend. Seeing a spike or a drop coming lets people act early, and connecting a CGM to an insulin pump (closed loop) can automate some of those decisions.</p>
                            </div>
                            <button type="button" class="adv-btn" data-close>Back to the park</button>
                        </div>`;
                }
            };
        }


        /* ---------- Recipe card ---------- */

        function openRecipe() {
            const s = gs();
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
                ${api.head("glucose", "Dr. Dex's Recipe")}
                <p class="adv-lead">A first-generation CGM sensor: glucose oxidase on platinum, wrapped in membranes. Each station shows Dr. Dex's card with the settings to use.${s.best ? ` Best batch: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}` : ""}</p>
                <div class="adv-button-row" style="margin-bottom:8px">
                    ${s.step > 0 ? '<button type="button" class="adv-btn secondary" id="grScrap">Scrap batch and restart</button>' : ""}
                    <button type="button" class="adv-btn secondary" data-close>Close</button>
                </div>
                ${html}`);
            const scrap = $("grScrap");
            if (scrap) {
                scrap.addEventListener("click", () => {
                    if (window.confirm("Scrap this batch and start over at the electrode bench?")) {
                        resetRun();
                        api.closeModal();
                        api.toast("Fresh batch: back to step 1");
                    }
                });
            }
        }

        api.registerRecipe({
            id: "glucose",
            scenes: ["glucose", "sensorworks", "clinic"],
            available: () => gs().recipe,
            open: openRecipe,
            label: "Dr. Dex's glucose sensor batch (12 steps)",
            progress: () => gs().step,
            total: STEPS.length,
            restart: resetRun
        });


        /* ---------- Using a tool ---------- */

        const TOOLS = {
            electrode: { name: "Electrode Bench", open: openElectrode },
            dip: { name: "Dip Coater", open: openDip },
            spot: { name: "Enzyme Spotter", open: openSpot },
            oven: { name: "Cure Oven", open: openOven },
            pstat: { name: "Potentiostat", open: openPstat },
            bath: { name: "Calibration Bath", open: openBath },
            interf: { name: "Interference Bench", open: openInterf },
            pack: { name: "Packaging & Sterilizer", open: openPack },
            study: { name: "Clinical Study Table", open: openStudy }
        };

        // Materials each step takes from the bag (once per run).
        const USES = { electrode: [["pt", 1]], enzyme: [["gox", 1]] };

        function useTool(tool) {
            const s = gs();
            if (!s.recipe) {
                api.say([`The ${TOOLS[tool].name}.`, "Dr. Dex runs this place. Talk to Dr. Dex for the recipe."]);
                return;
            }
            const st = STEPS[s.step];
            if (!st) {
                api.say([`The ${TOOLS[tool].name}.`, "Your batch is finished. Talk to Dr. Dex to make another."]);
                return;
            }
            if (st.tool !== tool) {
                api.say([`The ${TOOLS[tool].name}.`, `Your recipe says the next step is: ${st.name}.`, st.tool === "residents" ? "That happens around town. Press R to read the recipe." : `That happens at the ${st.where}. Press R to read the recipe.`]);
                return;
            }
            if (!api.bag.pay(gs(), st.id, USES[st.id])) {
                return;
            }
            TOOLS[tool].open();
        }


        /* ---------- Drawing ---------- */

        function arrowIf(c, tool, X, Y, W, t) {
            if (!isCurrentTool(tool)) {
                return;
            }
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

        function tool(toolId, label, x, y, w, h, draw) {
            return {
                kind: "glu-" + toolId,
                x: x, y: y, w: w, h: h,
                label: label,
                draw: (c, X, Y, W, H, t) => {
                    draw(c, X, Y, W, H, t);
                    arrowIf(c, toolId, X, Y, W, t);
                },
                prompt: "A: Use " + TOOLS[toolId].name,
                use: () => useTool(toolId)
            };
        }

        const D = {
            electrode(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 6, Y + 7, W - 12, 1, "#e3e7ef");
                rect(c, X + 6, Y + 9, W - 12, 1, "#c8ceda");
                rect(c, X + 30, Y + 4, 10, 8, "#2a3448");
            },
            dip(c, X, Y, W, H, t) {
                api.box(X + 4, Y + 8, W - 8, H - 9, "#b8c2d2");
                rect(c, X + 10, Y + 12, W - 20, 10, "#cfe8ff");
                const y = Y - 6 + Math.round(Math.sin(t / 500) * 6);
                rect(c, X + W / 2 - 1, y, 2, 20, "#c8ceda");
                rect(c, X + W / 2 - 8, Y - 10, 16, 4, "#5d6577");
            },
            spot(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 6, W - 4, H - 7, "#c9cfdb");
                rect(c, X + W / 2 - 6, Y - 8, 12, 14, "#3b4458");
                const k = (t / 300) % 1;
                c.fillStyle = "#ffd84a";
                c.beginPath();
                c.arc(X + W / 2, Y + 6 + k * 12, 1.5, 0, Math.PI * 2);
                c.fill();
                rect(c, X + 8, Y + 20, W - 16, 3, "#e3e7ef");
            },
            oven(c, X, Y, W, H) {
                api.box(X + 1, Y + 2, W - 2, H - 3, "#aab3c4");
                rect(c, X + 5, Y + 6, W - 10, 16, "#2a3448");
                rect(c, X + 6, Y + 7, W - 12, 14, "rgba(255, 200, 120, 0.25)");
            },
            pack(c, X, Y, W, H) {
                api.box(X + 1, Y + 2, W - 2, H - 3, "#c9cfdb");
                rect(c, X + 5, Y + 8, 10, 12, "#f5f7ff");
                rect(c, X + 18, Y + 8, 10, 12, "#f5f7ff");
                rect(c, X + 6, Y + 4, W - 12, 3, "#7fb2ff");
            },
            pstat(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 2, W - 4, H - 2, "#3b4458");
                rect(c, X + 6, Y + 4, W - 20, 8, "#0b1020");
                c.strokeStyle = "#54e0c7";
                c.beginPath();
                for (let i = 0; i < W - 22; i++) {
                    const y = Y + 9 - Math.exp(-i / 6) * 4 + Math.sin(i / 2 + t / 200) * 0.5;
                    i ? c.lineTo(X + 7 + i, y) : c.moveTo(X + 7 + i, y);
                }
                c.stroke();
            },
            bath(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                [0, 1, 2, 3, 4].forEach((i) => {
                    rect(c, X + 4 + i * 12, Y + 4, 9, 9, "#d9e2f0");
                    rect(c, X + 5 + i * 12, Y + 7, 7, 5, `rgba(255, 216, 74, ${0.15 + i * 0.18})`);
                });
            },
            interf(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                rect(c, X + 6, Y + 4, 8, 9, "#ffffff");
                rect(c, X + 18, Y + 4, 8, 9, "#ffb84a");
                rect(c, X + 30, Y + 4, 8, 9, "#e3e7ef");
            },
            study(c, X, Y, W, H) {
                api.box(X + 2, Y + 8, W - 4, H - 9, "#e3d2b4");
                rect(c, X + 10, Y + 12, 12, 8, "#2a3448");
                rect(c, X + 12, Y + 14, 8, 4, "#54e0c7");
                rect(c, X + W - 22, Y + 12, 10, 10, "#f5f7ff");
                rect(c, X + W - 19, Y + 15, 4, 4, "#ff6b7d");
            }
        };

        function drawResident(r) {
            return (c, X, Y, t) => {
                const npc = api.SCENES.glucose.npcs.find((n) => n.id === r.id);
                api.drawPerson(c, X, Y - 2, r.look, npc ? npc.dir : "down", 0);
                if (r.id === "sam") {
                    api.drawPerson(c, X + 7, Y + 5, { suit: "#ffe9c2", accent: "#ff8a5c", visor: "#5be38a" }, "down", 0, 0.6);
                }
                if (!gs().fitted[r.id]) {
                    const bob = Math.round(Math.sin(t / 300) * 1.5);
                    rect(c, X + 4, Y - 16 + bob, 9, 10, "#1a2033");
                    rect(c, X + 5, Y - 15 + bob, 7, 8, "#ffffff");
                    c.fillStyle = "#1a2033";
                    c.font = "bold 8px sans-serif";
                    c.textAlign = "center";
                    c.textBaseline = "middle";
                    c.fillText("?", X + 8.5, Y - 10.5 + bob);
                }
            };
        }

        function drawGlucoseRing(c, X, Y, W, H, t) {
            // glucose as a six-membered ring: five carbons and one oxygen
            api.box(X + 7, Y + 23, 18, 8, "#aab2c3");
            const cx = X + 16;
            const cy = Y + 11;
            const pts = [];
            for (let i = 0; i < 6; i++) {
                const a = Math.PI / 6 + i * Math.PI / 3;
                pts.push([cx + Math.cos(a) * 10, cy + Math.sin(a) * 8]);
            }
            c.strokeStyle = "#2b2f3a";
            c.lineWidth = 2;
            c.beginPath();
            pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
            c.closePath();
            c.stroke();
            pts.forEach(([x, y], i) => {
                c.fillStyle = i === 4 ? "#ff6b7d" : "#2b2f3a";
                c.beginPath();
                c.arc(x, y, 2.6, 0, Math.PI * 2);
                c.fill();
                if (i !== 4) {
                    rect(c, x - 0.5, y - 6, 1, 3, "#ff9ab0");
                }
            });
            const g = 0.5 + 0.5 * Math.sin(t / 600);
            c.fillStyle = `rgba(255, 216, 74, ${0.15 + g * 0.15})`;
            c.beginPath();
            c.arc(cx, cy, 13, 0, Math.PI * 2);
            c.fill();
        }

        function drawAppleTree(c, X, Y) {
            rect(c, X + 6, Y + 10, 4, 6, "#6b4a2f");
            rect(c, X + 1, Y - 2, 14, 13, "#1f6b34");
            rect(c, X + 3, Y - 4, 10, 16, "#1f6b34");
            rect(c, X + 3, Y - 1, 8, 6, "#2e8a45");
            [[4, 2], [10, 0], [8, 6], [12, 5]].forEach(([dx, dy]) => rect(c, X + dx, Y + dy, 2, 2, "#e0233c"));
        }

        function drawJuice(c, X, Y, W, H, t) {
            api.box(X + 1, Y + 6, W - 2, 10, "#f2c230");
            rect(c, X + 1, Y + 2, W - 2, 4, "#ff6b4a");
            for (let i = 0; i < 3; i++) {
                rect(c, X + 4 + i * 8, Y + 8, 5, 7, ["#ff9a3a", "#c94a2f", "#5be38a"][i]);
                rect(c, X + 6 + i * 8, Y + 5, 1, 3, "#f5f7ff");
            }
        }

        function drawBench(c, X, Y) {
            rect(c, X + 1, Y + 6, 14, 3, "#a8774a");
            rect(c, X + 1, Y + 2, 14, 2, "#a8774a");
            rect(c, X + 2, Y + 9, 2, 5, "#6b4a2f");
            rect(c, X + 12, Y + 9, 2, 5, "#6b4a2f");
        }


        /* ---------- Scenes ---------- */

        api.SCENES.glucose = {
            id: "glucose",
            label: "Glucose Grove",
            outdoor: true,
            grid: [
                "TTTTTTTTTTTTTTTTTTTT",
                "T..f.....f.......f.T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBDBB..BBBDBB..T",
                "T.....p.......p....T",
                "pppppppppppppppppppp",
                "T.......p..........T",
                "T.......p..........T",
                "T.BBB...p.BBB..BBB.T",
                "T.BDB...p.BDB..BDB.T",
                "T.pppppppppppppppppT",
                "T..f....f.....f....T",
                "TTTTTTTTTTTTTTTTTTTT"
            ],
            edges: {
                left: { scene: "world", x: 19, y: 7 },
                right: {
                    scene: "neuro", x: 0, y: 7,
                    locked: () => !api.save().badges.glucose,
                    lockedText: [
                        "The road east leads to Grey Matter.",
                        "A sign says: \"Glucose Grove Certificate holders only.\" Help the residents and beat The Sugar Spike first."
                    ]
                }
            },
            buildings: [
                { id: "sensorworks", sign: "SENSORWORKS", x: 2, y: 2, w: 7, h: 4, door: { x: 6, y: 5 }, wall: "#e9eef6", roof: "#ff6b7d", locked: () => false },
                { id: "clinic", sign: "♥ CLINIC", x: 11, y: 2, w: 6, h: 4, door: { x: 14, y: 5 }, wall: "#f4fbf7", roof: "#2ebfa5", locked: () => false },
                { id: "house1", sign: "MAYA", x: 2, y: 10, w: 3, h: 2, door: { x: 3, y: 11 }, wall: "#ffe3ec", roof: "#c94a6d", locked: () => true, lockedText: ["Maya's house. Nobody's home: Maya is out in town."] },
                { id: "house2", sign: "OKAFOR", x: 10, y: 10, w: 3, h: 2, door: { x: 11, y: 11 }, wall: "#e3ebff", roof: "#3d6fd8", locked: () => true, lockedText: ["The Okafors' house. Mr. Okafor is out for his evening walk."] },
                { id: "house3", sign: "REYES", x: 15, y: 10, w: 3, h: 2, door: { x: 16, y: 11 }, wall: "#e6fbe8", roof: "#2e8a45", locked: () => true, lockedText: ["Coach Reyes's house. There's a pile of running shoes on the porch."] }
            ],
            npcs: RESIDENTS.map((r) => ({
                id: r.id,
                name: r.name,
                x: r.x,
                y: r.y,
                dir: "down",
                draw: drawResident(r),
                talk: () => residentTalk(r)
            })).concat([{
                id: "gox",
                name: "Dr. Dex",
                x: 7, y: 6,
                dir: "down",
                look: { suit: "#ffffff", accent: "#ff6b7d", visor: "#54e0c7" },
                talk: goxTalk
            }]),
            objects: [
                api.bag.pickup({ id: "glucose-gox", item: "gox", x: 18, y: 9, text: "Under a bush, a chilled vial: glucose oxidase enzyme!" }),
                {
                    kind: "ring", x: 12, y: 8, w: 2, h: 2, draw: drawGlucoseRing, prompt: "A: Look",
                    lines: [
                        "The Glucose Ring fountain: glucose drawn as the six-membered ring it forms in water, five carbons and one oxygen (the red one).",
                        "It looks a lot like Ion City's benzene rings, but with an oxygen in the ring and OH groups sticking out."
                    ]
                },
                {
                    kind: "juice", x: 3, y: 8, w: 2, h: 1, draw: drawJuice, prompt: "A: Look",
                    lines: [
                        "The Grove Juice Stand. A sign says: \"For a low: about 15 grams of fast-acting carbs, like half a cup (120 mL) of juice, then recheck in 15 minutes.\"",
                        "That's the common \"15-15 rule.\" People follow their own care team's plan."
                    ]
                },
                { kind: "apple", x: 18, y: 8, w: 1, h: 1, draw: drawAppleTree, prompt: "A: Look", lines: ["An apple tree. Fruit has natural sugars, along with fiber that slows how fast they reach the blood."] },
                { kind: "apple", x: 16, y: 9, w: 1, h: 1, draw: drawAppleTree, prompt: "A: Look", lines: ["Another apple tree, heavy with fruit."] },
                { kind: "bench", x: 10, y: 9, w: 1, h: 1, draw: drawBench, prompt: "A: Look", lines: ["A park bench. A plaque reads: \"In honor of everyone who checks their numbers, day and night.\""] }
            ]
        };

        api.SCENES.sensorworks = {
            id: "sensorworks",
            label: "SensorWorks · ISO 7 cleanroom",
            grid: api.interiorRows(),
            floor: "#e3e8f0",
            exitTo: { scene: "glucose", x: 6, y: 6 },
            objects: [
                api.bag.stockroom({ label: "SensorWorks stockroom", items: ["pt", "gox"], x: 15, y: 7 }),
                tool("electrode", "Electrodes", 1, 2, 3, 1, D.electrode),
                tool("dip", "Dip coater", 5, 2, 3, 2, D.dip),
                tool("spot", "Enzyme spotter", 9, 2, 3, 2, D.spot),
                tool("oven", "Cure oven", 13, 2, 2, 2, D.oven),
                tool("pack", "Pack & sterilize", 16, 2, 2, 2, D.pack),
                tool("pstat", "Potentiostat", 1, 7, 3, 1, D.pstat),
                tool("bath", "Calibration bath", 5, 7, 4, 1, D.bath),
                tool("interf", "Interference", 10, 7, 3, 1, D.interf)
            ],
            npcs: [
                {
                    id: "goxlab",
                    name: "Dr. Dex",
                    x: 10, y: 10,
                    dir: "down",
                    look: { suit: "#ffffff", accent: "#ff6b7d", visor: "#54e0c7" },
                    talk: goxTalk
                }
            ]
        };

        api.SCENES.clinic = {
            id: "clinic",
            label: "Glucose Grove Clinic",
            grid: api.interiorRows(),
            floor: "#eef6f2",
            exitTo: { scene: "glucose", x: 14, y: 6 },
            objects: [
                tool("study", "Clinical study", 7, 3, 4, 2, D.study),
                {
                    kind: "poster", x: 14, y: 2, w: 3, h: 1, label: "Glucose zones",
                    draw: (c, X, Y, W) => {
                        api.box(X + 1, Y - 4, W - 2, 14, "#f7f4ea");
                        rect(c, X + 4, Y - 1, W - 8, 2, "#ff8a5c");
                        rect(c, X + 4, Y + 2, W - 8, 3, "#5be38a");
                        rect(c, X + 4, Y + 6, W - 8, 2, "#ff6b7d");
                    },
                    prompt: "A: Look",
                    lines: [
                        "A poster of glucose zones: below 54 mg/dL urgent low, below 70 low, 70–180 in range, above 180 high, above 250 very high.",
                        "\"Time in range\" is the share of the day spent in the green band."
                    ]
                },
                {
                    kind: "meter", x: 2, y: 3, w: 2, h: 1, label: "Reference analyzer",
                    draw: (c, X, Y) => {
                        api.box(X + 2, Y + 2, 26, 12, "#c9cfdb");
                        rect(c, X + 5, Y + 4, 12, 7, "#0b1020");
                        rect(c, X + 6, Y + 6, 10, 3, "#54e0c7");
                    },
                    prompt: "A: Look",
                    lines: ["A lab glucose analyzer. Its blood readings are the \"reference\" that CGM readings are judged against."]
                }
            ],
            npcs: [
                {
                    id: "mira",
                    name: "Nurse Mira",
                    x: 9, y: 8,
                    dir: "down",
                    look: { suit: "#e6f7ff", accent: "#2ebfa5", visor: "#ffd84a" },
                    talk: () => {
                        const s = gs();
                        if (s.recipe && current() && current().id === "mard") {
                            return ["The volunteers are ready! Use the clinical study table to compare your sensors with our reference readings."];
                        }
                        return [
                            "Hi, I'm Nurse Mira. A lot of folks in the Grove live with diabetes, and they've been asking about continuous glucose monitors.",
                            "Once Dr. Dex's sensors pass their bench tests, we'll run a clinical accuracy study here before anyone wears one."
                        ];
                    }
                }
            ]
        };

        function goxTalk() {

            const s = gs();
            const name = api.currentChar() ? api.currentChar().name : "engineer";

            if (!s.recipe) {
                return {
                    lines: [
                        `Oh, thank goodness, ${name}! I'm Dr. Dex, short for glucose oxidase, my favorite enzyme.`,
                        "Lots of people in Glucose Grove live with diabetes. Without a sensor, they prick their fingers many times a day, and still miss what happens in between.",
                        "We're going to build them continuous glucose monitors: a tiny platinum wire, an enzyme layer and three membranes, read every few minutes.",
                        "Here's my recipe. Every station has my card with the settings, so you won't be guessing.",
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
                if (!s.boss) {
                    return ["The Sugar Spike is in the park! Go!"];
                }
                return {
                    lines: [`Your best batch: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}. Want to make a fresh batch?`, "I'll reset the line for you."],
                    done: () => {
                        resetRun();
                        api.toast("Fresh batch: back to step 1");
                    }
                };
            }

            const st = STEPS[s.step];
            return [`Next step: ${st.name}.`, st.tool === "residents" ? "Find the residents with a ? over their heads around town." : st.tool === "study" ? "That one's at the clinic across the path." : `It's at the ${st.where}. My card there has the settings.`];
        }

        api.SCENES.glucose.objects.push({
            kind: "spike", x: 12, y: 8, w: 2, h: 2,
            active: () => gs().step >= STEPS.length && allFitted() && !gs().boss,
            draw: (c, X, Y, W, H, t) => drawSpike(c, X, Y - 6, 1, t),
            prompt: "A: Battle The Sugar Spike",
            use: () => api.say(["The fountain bubbles over with sugar crystals, piling higher and higher…", "Get ready to battle!"], "", () => api.openBattle(spikeBattle()))
        });

        // the fountain hides while the boss stands on it
        const ring = api.SCENES.glucose.objects.find((o) => o.kind === "ring");
        ring.active = () => !(gs().step >= STEPS.length && allFitted() && !gs().boss);

        // Split the lab into bays: these stations get their own building.
        api.addBay({
            outdoor: "glucose", from: "sensorworks",
            id: "glutest", sign: "TESTING", label: "Glucose Grove · Test & Pack Lab",
            kinds: ["glu-pstat", "glu-bath", "glu-interf", "glu-pack"],
            x: 5, y: 10, w: 3, h: 2, door: { x: 6, y: 11 },
            wall: "#ffffff", roof: "#ff6b7d",
            currentKind: () => {
                const st = STEPS[gs().step];
                return gs().recipe && st ? "glu-" + st.tool : null;
            }
        });

    });

})();
