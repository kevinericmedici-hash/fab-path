/* ========================================
   FAB VALLEY ADVENTURE: SILICON BEACH
   A beach town west of Fab Valley. Dr.
   Silica's recipe turns beach quartz into a
   doped, tested wafer: arc furnace,
   trichlorosilane, distillation, Siemens,
   Czochralski, saw, etch, CMP, RCA clean,
   ion implant, anneal, hot-point probe and
   four-point probe. Boss: the Impurity
   Kraken at the end of the pier.

   Numbers match the Sand to Chip course
   (chip-lab-model.js): Si melts at 1414 °C,
   SiHCl₃ boils at 31.8 °C, boron k = 0.8,
   phosphorus k = 0.35, 200 mm wafers are
   725 µm, and the same mobility model.
   Contamination sizes are exaggerated so
   their effects show up in the tests.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const TILE = api.TILE;
        const rect = api.rect;
        const ui = api.ui;
        const $ = (id) => document.getElementById(id);

        api.TYPES.silicon = { label: "Silicon", icon: "💠" };


        /* ---------- Physics (same as the Sand to Chip lab) ---------- */

        const Q = 1.602e-19;

        function mobility(type, N) {
            if (type === "n") {
                return 90 + 1250 / (1 + Math.pow(N / 8.5e16, 0.72));
            }
            return 50 + 420 / (1 + Math.pow(N / 1.6e17, 0.7));
        }

        function resistivity(type, N) {
            const n = Math.max(N, 1e10);
            return 1 / (Q * mobility(type, n) * n);
        }

        function sci(x) {
            const e = Math.floor(Math.log10(x));
            const m = x / Math.pow(10, e);
            return `${m.toFixed(m < 1.05 ? 0 : 1)}×10<sup>${e}</sup>`;
        }

        function fix(x) {
            return x >= 100 ? Math.round(x).toString() : x >= 10 ? x.toFixed(1) : x.toFixed(2);
        }


        /* ---------- Recipe ---------- */

        const PHASES = {
            sand: "Sand to pure silicon",
            crystal: "Growing the crystal",
            wafer: "Making the wafer",
            dope: "Doping",
            test: "Testing"
        };

        // card: Dr. Silica's target settings, shown in every station.
        const STEPS = [
            {
                id: "sand", phase: "sand", tool: "beach", short: "Collect sand", where: "beach",
                name: "Assay the beach sand with the XRF analyzer and collect the pure quartz",
                card: ["Walk up to each of the three sand piles on the beach and run the <strong>XRF</strong> (X-ray fluorescence) assay.",
                    "Collect the pile that is almost pure <strong>SiO₂</strong> (silicon dioxide, also called quartz or silica).",
                    "Skip piles that are mostly seashell (CaCO₃, calcium carbonate) or iron oxide."]
            },
            {
                id: "arc", phase: "sand", tool: "arc", short: "Arc furnace", where: "arc furnace",
                name: "Reduce the quartz to silicon in the arc furnace at about 2000 °C",
                card: ["Furnace temperature: <strong>2000 °C</strong> (1900–2100 °C works).",
                    "Carbon : SiO₂ ratio: <strong>2.0</strong>. The reaction SiO₂ + 2 C → Si + 2 CO needs two carbon atoms for every SiO₂."]
            },
            {
                id: "hcl", phase: "sand", tool: "hcl", short: "Make trichlorosilane", where: "HCl reactor",
                name: "React the silicon with HCl gas at 300 °C to make trichlorosilane",
                card: ["Gas: <strong>HCl</strong> (hydrogen chloride).",
                    "Bed temperature: <strong>300 °C</strong>. Hotter makes more SiCl₄ (silicon tetrachloride), which you don't want.",
                    "Product: SiHCl₃, trichlorosilane (TCS), a clear liquid."]
            },
            {
                id: "distill", phase: "sand", tool: "still", short: "Distill", where: "distillation column",
                name: "Distill out the trichlorosilane, which boils at 31.8 °C",
                card: ["Start collecting at about <strong>25 °C</strong>: above boron chloride (BCl₃, 12.5 °C).",
                    "Stop collecting at about <strong>40 °C</strong>: below silicon tetrachloride (SiCl₄, 57.6 °C) and phosphorus chloride (PCl₃, 76.1 °C).",
                    "Passes: <strong>3 or more</strong>."]
            },
            {
                id: "siemens", phase: "sand", tool: "siemens", short: "Siemens reactor", where: "Siemens reactor",
                name: "Deposit polysilicon on hot rods in the Siemens reactor at 1100 °C",
                card: ["Gas feed: <strong>SiHCl₃ + H₂</strong> (trichlorosilane plus hydrogen). Never air!",
                    "Rod temperature: <strong>1100 °C</strong> (1050–1150 °C works)."]
            },
            {
                id: "cz", phase: "crystal", tool: "cz", short: "Grow the crystal", where: "CZ puller",
                name: "Grow a 200 mm ⟨100⟩ p-type crystal of about 10 Ω·cm in the CZ (Czochralski) puller",
                card: ["Dopant: <strong>boron</strong> (makes p-type silicon).",
                    "Level: <strong>1.4×10<sup>15</sup> atoms/cm³</strong>. Check it: ρ = 1 / (1.6×10<sup>−19</sup> × 1.4×10<sup>15</sup> × 450) ≈ 10 Ω·cm.",
                    "Seed: <strong>⟨100⟩</strong>, the orientation used for CMOS chips.",
                    "Heater: <strong>1420 °C</strong>, just above silicon's 1414 °C melting point.",
                    "Pull a <strong>thin neck</strong> first. Then keep the diameter in the green band (200 ± 10 mm): if it grows too wide, pull <strong>faster</strong>; if it gets too thin, pull <strong>slower</strong>. Small nudges work best."]
            },
            {
                id: "saw", phase: "wafer", tool: "saw", short: "Slice", where: "wire saw",
                name: "Grind, notch and wire-saw the ingot into 725 µm wafers",
                card: ["Thickness: <strong>725 µm</strong>, the standard for 200 mm wafers.",
                    "Wire: <strong>diamond-coated</strong>.",
                    "Tick <strong>grind the orientation notch</strong>.",
                    "Feed rate: <strong>1.0 mm/min or slower</strong>."]
            },
            {
                id: "etch", phase: "wafer", tool: "etch", short: "Lap and etch", where: "etch bench",
                name: "Lap the wafer flat, then etch away about 30 µm of saw damage per side",
                card: ["Tick <strong>lap both sides flat first</strong>.",
                    "Etchant: <strong>KOH</strong> (potassium hydroxide), or <strong>HF + HNO₃ + acetic acid</strong> (hydrofluoric, nitric and acetic acids).",
                    "Remove: <strong>30 µm per side</strong> (20–40 µm works)."]
            },
            {
                id: "cmp", phase: "wafer", tool: "cmp", short: "Polish", where: "CMP polisher",
                name: "Polish to a mirror finish with CMP (chemical-mechanical polishing)",
                card: ["Slurry: <strong>colloidal silica</strong> (tiny SiO₂ particles in an alkaline liquid).",
                    "Pressure: <strong>3–5 psi</strong> (pounds per square inch).",
                    "Time: <strong>5–10 min</strong>."]
            },
            {
                id: "rca", phase: "wafer", tool: "rca", short: "RCA clean", where: "RCA clean bench",
                name: "Run the RCA clean: SC-1, HF dip, SC-2, with rinses between",
                card: ["Order: <strong>SC-1 → DI rinse → HF dip → DI rinse → SC-2 → DI rinse</strong>.",
                    "SC means Standard Clean. DI water is deionized (ultra-pure) water.",
                    "Always finish with a DI rinse."]
            },
            {
                id: "implant", phase: "dope", tool: "implant", short: "Ion implant", where: "ion implanter",
                name: "Implant phosphorus into the front: 10¹⁵ ions/cm², 50 keV, 7° tilt",
                card: ["Ion: <strong>P⁺</strong> (phosphorus, an n-type dopant). Your wafer is p-type, so this makes a p–n junction.",
                    "Dose: <strong>1×10<sup>15</sup> ions/cm²</strong>.",
                    "Energy: <strong>50 keV</strong> (kilo-electron-volts; 30–100 keV works).",
                    "Tilt: <strong>7°</strong>."]
            },
            {
                id: "rta", phase: "dope", tool: "rta", short: "Anneal", where: "RTA",
                name: "Anneal in the RTA (rapid thermal anneal) at 1000 °C for 10 s in nitrogen",
                card: ["Peak temperature: <strong>1000 °C</strong> (950–1075 °C works).",
                    "Time: <strong>10 s</strong> (5–30 s works).",
                    "Ambient gas: <strong>N₂</strong> (nitrogen)."]
            },
            {
                id: "hotprobe", phase: "test", tool: "hotprobe", short: "Hot-point probe", where: "hot-point probe",
                name: "Use the hot-point probe to find which side is n-type and which is p-type",
                card: ["A <strong>positive</strong> reading means <strong>n-type</strong>. A <strong>negative</strong> reading means <strong>p-type</strong>.",
                    "If everything went to plan: the back (boron substrate) is p-type and the front (phosphorus layer) is n-type."]
            },
            {
                id: "fourpp", phase: "test", tool: "fourpp", short: "Four-point probe", where: "four-point probe",
                name: "Use the four-point probe to measure resistivity and sheet resistance",
                card: ["Sheet resistance: <strong>R<sub>s</sub> = 4.532 × V / I</strong>, in Ω/□ (ohms per square).",
                    "Resistivity: <strong>ρ = R<sub>s</sub> × t</strong>, with the thickness t in centimeters (725 µm = 0.0725 cm). Units: Ω·cm.",
                    "Use V in volts and I in amps (1.00 mA = 0.001 A)."]
            }
        ];

        function cardHtml(st) {
            st = st || STEPS[ss().step];
            return st && st.card
                ? `<div class="adv-card"><p class="adv-card-title">📋 Dr. Silica's card</p><ul>${st.card.map((x) => `<li>${x}</li>`).join("")}</ul></div>`
                : "";
        }

        function ss() {
            const s = api.save();
            if (!s.silicon) {
                s.silicon = { recipe: false, step: 0, defects: {}, data: {}, stepXp: {}, runs: 0, best: 0, wafer: null, boss: false };
            }
            return s.silicon;
        }

        function current() {
            return STEPS[ss().step];
        }

        function isCurrentTool(tool) {
            const s = ss();
            return s.recipe && STEPS[s.step] && STEPS[s.step].tool === tool;
        }

        function allDefects() {
            const s = ss();
            return STEPS.reduce((l, st) => l.concat(s.defects[st.id] || []), []);
        }

        function defect(sev, cause) {
            return { sev: sev, cause: cause };
        }

        // Materials each step takes from the bag (once per wafer run).
        const USES = {
            hcl: [["hcl", 1]],
            rca: [["rca", 1]],
            implant: [["dopant", 1]]
        };

        function resetRun() {
            const s = ss();
            s.step = 0;
            s.defects = {};
            s.data = {};
            s.runs++;
            api.writeSave();
        }

        function stepBadge() {
            return `<p class="adv-round">Recipe step ${ss().step + 1} of ${STEPS.length}</p>`;
        }

        function open(title, lead, body, opts) {
            return api.openModal(`
                ${api.head("silicon", title)}
                ${stepBadge()}
                <p class="adv-lead">${lead}</p>
                ${cardHtml()}
                ${body}`, opts);
        }

        function completeStep(defs, summary) {

            const s = ss();
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
                    ${next ? `<p class="adv-lead">Next${phaseDone ? ` phase: <strong>${PHASES[next.phase]}</strong>. First` : ""}: <strong>${next.name}</strong> at the ${next.where}.</p>` : ""}
                    <button type="button" class="adv-btn" data-close>Back to work</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
        }

        // Simple machine picture: a box, a window and a glow.
        function machineCanvas(id, w, h) {
            return `<canvas id="${id}" width="${w || 220}" height="${h || 200}"></canvas>`;
        }

        function glowBox(c, W, H, color, k, label) {
            c.clearRect(0, 0, W, H);
            c.fillStyle = "#0b1020";
            c.fillRect(0, 0, W, H);
            c.fillStyle = "#aab3c4";
            c.fillRect(30, 30, W - 60, H - 50);
            c.fillStyle = "#1a2033";
            c.fillRect(50, 50, W - 100, H - 100);
            if (k > 0) {
                c.fillStyle = `rgba(${color}, ${0.25 + 0.6 * k})`;
                c.fillRect(50, 50, W - 100, H - 100);
            }
            if (label) {
                c.fillStyle = "#f5f7ff";
                c.font = "bold 12px sans-serif";
                c.textAlign = "center";
                c.fillText(label, W / 2, H - 6);
            }
        }


        /* ---------- Step 1: beach sand ---------- */

        const SANDS = {
            quartz: { name: "White quartz sand", assay: "SiO₂ 99.6% · Fe₂O₃ 0.02% · Al₂O₃ 0.2% · trace calcium", verdict: "Almost pure silicon dioxide. Just what the furnace needs." },
            iron: { name: "Black sand", assay: "SiO₂ 61% · magnetite (Fe₃O₄) 31% · other minerals 8%", verdict: "Full of iron oxide. Usable, but the iron must be removed later." },
            shell: { name: "Pink shell sand", assay: "CaCO₃ (seashell) 86% · SiO₂ 11% · organics 3%", verdict: "Mostly crushed seashells. There's barely any silicon in it." }
        };

        function openSand(kind) {

            const s = ss();
            const sand = SANDS[kind];

            if (!s.recipe || current().id !== "sand") {
                api.say([`${sand.name}.`, s.recipe ? "You've already collected sand for this run." : "Dr. Silica, on the beach by the boardwalk, decides which sand goes to the furnace."]);
                return;
            }

            let assayed = false;

            api.openModal(`
                ${api.head("silicon", "Sand Assay: " + sand.name)}
                ${stepBadge()}
                <p class="adv-lead">Silicon is the second most common element in Earth's crust, but most of it is locked up in minerals. Scoop a sample and run it through the handheld XRF (X-ray fluorescence) analyzer before you haul a ton of it to the furnace. XRF makes each element glow with its own X-ray "color," so it reads out what the sand is made of.</p>
                ${cardHtml(STEPS[0])}
                <div class="adv-button-row"><button type="button" class="adv-btn secondary" id="sdAssay" data-autofocus>Run XRF assay</button></div>
                <div class="adv-takeaway" id="sdOut" hidden></div>
                <div class="adv-button-row">
                    <button type="button" class="adv-btn" id="sdTake">Collect this sand</button>
                    <button type="button" class="adv-btn secondary" data-close>Leave it</button>
                </div>`);

            $("sdAssay").addEventListener("click", () => {
                assayed = true;
                $("sdOut").hidden = false;
                $("sdOut").innerHTML = `<p><strong>${sand.assay}</strong></p><p>${sand.verdict}</p>`;
            });

            $("sdTake").addEventListener("click", () => {
                const defs = [];
                if (!assayed) {
                    defs.push(defect("minor", "You collected sand without assaying it first. In a real plant every load is tested."));
                }
                ss().data.sand = kind;
                completeStep(defs, `<p>Collected a load of ${sand.name.toLowerCase()} for the furnace.</p><p>In real plants the arc furnace is fed fist-sized lumps of quartzite rather than fine sand, so the gas can flow through, but the chemistry is the same.</p>`);
            });
        }


        /* ---------- Step 2: arc furnace ---------- */

        function openArc() {

            const sand = ss().data.sand;
            let busy = false;

            const m = open("Arc Furnace", "Giant graphite electrodes strike an arc through a mix of quartz and carbon. At around 2000 °C the carbon pulls the oxygen off the silicon: SiO₂ + 2 C → Si + 2 CO. Liquid silicon is tapped from the bottom.", `
                <div class="adv-machine">
                    ${machineCanvas("arcCv")}
                    <div>
                        ${ui.slider("arcT", "Furnace temperature", "°C", 1200, 2400, 100, 1500)}
                        ${ui.slider("arcC", "Carbon : SiO₂ ratio (moles)", "", 1, 3, 0.1, 1.5)}
                        <p class="adv-hint">The carbon is a mix of coal, coke and wood chips.</p>
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="arcGo" data-autofocus>Strike the arc</button></div>
                        <p class="adv-result" id="arcRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("arcCv").getContext("2d");
            const tEl = ui.wireSlider("arcT");
            const cEl = ui.wireSlider("arcC", (v) => v.toFixed(1));

            function draw(k, now) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 200);
                rect(c, 40, 80, 140, 100, "#5d6577");
                rect(c, 50, 90, 120, 80, "#2a3448");
                const g = k * (0.6 + 0.4 * Math.sin((now || 0) / 60));
                rect(c, 50, 130, 120, 40, `rgba(255, ${140 + 60 * g}, 60, ${0.3 + 0.6 * g})`);
                [80, 110, 140].forEach((x) => rect(c, x - 6, 20, 12, 90, "#3a3f4b"));
                if (k > 0) {
                    c.strokeStyle = `rgba(200, 220, 255, ${g})`;
                    c.lineWidth = 2;
                    [80, 110, 140].forEach((x) => {
                        c.beginPath();
                        c.moveTo(x, 110);
                        c.lineTo(x + Math.sin((now || 0) / 30 + x) * 4, 125);
                        c.stroke();
                    });
                }
            }

            draw(0);

            $("arcGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                const r = Number(cEl.value);
                ui.result("arcRes", "Arc on…");
                ui.animate(m, 3500, (k, now) => draw(Math.sin(k * Math.PI) * 0.7 + 0.3, now), () => {
                    busy = false;
                    draw(0);
                    if (sand === "shell") {
                        resetRun();
                        api.modalBody().innerHTML = `
                            <div class="adv-complete">
                                <p class="eyebrow">RUN FAILED</p>
                                <h2>🐚 Mostly lime, hardly any silicon</h2>
                                <div class="adv-takeaway">
                                    <p>Seashells are calcium carbonate. In the furnace they turned into lime and slag, and only a trickle of silicon came out.</p>
                                    <p>Go back to the beach, assay the piles, and collect the pure quartz.</p>
                                </div>
                                <button type="button" class="adv-btn" data-close>Back to the beach</button>
                            </div>`;
                        api.focusFirst();
                        return;
                    }
                    if (T < 1800) {
                        ui.result("arcRes", `At ${T} °C only a little gas bubbles off. The reaction needs about 2000 °C before liquid silicon forms. Turn it up.`, false);
                        return;
                    }
                    const defs = [];
                    if (r < 1.8) {
                        defs.push(defect("minor", `With only ${r.toFixed(1)} moles of carbon per mole of SiO₂, quartz was left over in the slag and the yield dropped. The reaction needs 2.`));
                    } else if (r > 2.2) {
                        defs.push(defect("minor", `With ${r.toFixed(1)} moles of carbon, the extra carbon formed silicon carbide (SiC) in the furnace.`));
                    }
                    if (sand === "iron") {
                        defs.push(defect("minor", "The iron-rich sand made silicon full of iron (ferrosilicon). Distillation will have to work harder."));
                    }
                    ss().data.arcT = T;
                    completeStep(defs, `<p>Tapped glowing liquid silicon at ${T} °C and let it freeze into chunks.</p><p>This <strong>metallurgical-grade</strong> silicon is about 98–99% pure. Good enough for aluminum alloys, not even close for chips.</p>`);
                });
            });
        }


        /* ---------- Step 3: HCl reactor ---------- */

        function openHCl() {

            let gas = null;
            let temp = null;
            let busy = false;

            const m = open("HCl Reactor (Hydrogen Chloride)", "To purify silicon, first turn it into a liquid. Ground silicon tumbles in a hot fluidized bed with hydrogen chloride (HCl) gas blowing up through it: Si + 3 HCl → SiHCl₃ + H₂. The product, SiHCl₃, is trichlorosilane (TCS for short).", `
                <div class="adv-machine">
                    ${machineCanvas("hclCv")}
                    <div>
                        <p class="adv-round">Gas</p>
                        ${ui.chips("hgas", [{ id: "hcl", label: "Hydrogen chloride (HCl)" }, { id: "cl2", label: "Chlorine (Cl₂)" }, { id: "n2", label: "Nitrogen (N₂)" }], null)}
                        <p class="adv-round">Bed temperature</p>
                        ${ui.chips("htemp", [100, 300, 600, 1000].map((t) => ({ id: String(t), label: t + " °C" })), null)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="hclGo" data-autofocus>Run the reactor</button></div>
                        <p class="adv-result" id="hclRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("hclCv").getContext("2d");
            ui.wireChips("hgas", (v) => { gas = v; });
            ui.wireChips("htemp", (v) => { temp = Number(v); });

            function draw(k, now) {
                glowBox(c, 220, 200, "255, 170, 80", k * 0.6, "Fluidized bed");
                for (let i = 0; i < 30; i++) {
                    const y = 140 - ((((now || 0) / 12) + i * 23) % 80) * k;
                    rect(c, 60 + (i * 37) % 100, y, 4, 4, "#8f98aa");
                }
            }

            draw(0, 0);

            $("hclGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!gas || !temp) {
                    ui.result("hclRes", "Choose a gas and a temperature first.", false);
                    return;
                }
                busy = true;
                ui.result("hclRes", "Reacting…");
                ui.animate(m, 3000, (k, now) => draw(1, now), () => {
                    busy = false;
                    draw(0, 0);
                    if (gas === "n2") {
                        ui.result("hclRes", "Nothing happens. Nitrogen doesn't react with silicon here. You need a chlorine source.", false);
                        return;
                    }
                    if (temp === 100) {
                        ui.result("hclRes", "At 100 °C the reaction barely starts. Industry runs it near 300 °C.", false);
                        return;
                    }
                    const defs = [];
                    if (gas === "cl2") {
                        defs.push(defect("minor", "Chlorine gas makes mostly silicon tetrachloride (SiCl₄) instead of trichlorosilane, so the yield of the liquid you want dropped."));
                    } else if (temp > 300) {
                        defs.push(defect("minor", `At ${temp} °C the reaction shifts toward silicon tetrachloride (SiCl₄), lowering the trichlorosilane yield.`));
                    }
                    completeStep(defs, `<p>The outlet gas condenses into a clear liquid. It's mostly trichlorosilane (SiHCl₃), mixed with SiCl₄ and the chlorides of every impurity: boron, phosphorus, iron, aluminum.</p>`);
                });
            });
        }


        /* ---------- Step 4: distillation ---------- */

        const COMPONENTS = [
            { f: "BCl₃", bp: 12.5, what: "boron chloride" },
            { f: "SiHCl₃", bp: 31.8, what: "trichlorosilane (keep!)" },
            { f: "SiCl₄", bp: 57.6, what: "silicon tetrachloride" },
            { f: "PCl₃", bp: 76.1, what: "phosphorus chloride" },
            { f: "FeCl₃, AlCl₃", bp: 180, what: "metal chlorides, stay behind" }
        ];

        function openStill() {

            let busy = false;

            const m = open("Distillation Column", "Every chloride boils at a different temperature. Heat the mixture slowly and only collect what comes over in your temperature window.", `
                <div class="adv-machine">
                    ${machineCanvas("stCv", 220, 240)}
                    <div>
                        <table class="adv-mini-table">
                            <thead><tr><th>In the boiler</th><th>Boils at</th></tr></thead>
                            <tbody>${COMPONENTS.map((x) => `<tr><td>${x.f}<small> · ${x.what}</small></td><td>${x.bp >= 100 ? "> 100" : x.bp} °C</td></tr>`).join("")}</tbody>
                        </table>
                        ${ui.slider("stLo", "Start collecting at", "°C", 0, 100, 1, 5)}
                        ${ui.slider("stHi", "Stop collecting at", "°C", 0, 100, 1, 90)}
                        ${ui.slider("stN", "Distillation passes", "", 1, 5, 1, 1)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="stGo" data-autofocus>Distill</button></div>
                        <p class="adv-result" id="stRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("stCv").getContext("2d");
            const lo = ui.wireSlider("stLo");
            const hi = ui.wireSlider("stHi");
            const nEl = ui.wireSlider("stN");

            function draw(T) {
                c.clearRect(0, 0, 220, 240);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 240);
                rect(c, 70, 20, 40, 170, "#d9e2f0");
                for (let i = 0; i < 8; i++) {
                    rect(c, 72, 36 + i * 19, 36, 2, "#8f98aa");
                }
                c.fillStyle = "#cfe8ff";
                c.beginPath();
                c.ellipse(90, 205, 40, 22, 0, 0, Math.PI * 2);
                c.fill();
                rect(c, 110, 30, 60, 4, "#d9e2f0");
                rect(c, 166, 30, 4, 120, "#d9e2f0");
                const inWin = T >= Number(lo.value) && T <= Number(hi.value);
                rect(c, 150, 150, 40, 40, inWin ? "#5be38a" : "#5d6577");
                c.fillStyle = "#1a2033";
                c.font = "bold 13px sans-serif";
                c.textAlign = "center";
                c.fillText(`${Math.round(T)} °C`, 90, 210);
                c.fillStyle = "#f5f7ff";
                c.font = "10px sans-serif";
                c.fillText(inWin ? "collecting" : "to waste", 170, 205);
            }

            draw(20);
            lo.addEventListener("input", () => draw(20));
            hi.addEventListener("input", () => draw(20));

            $("stGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                const a = Number(lo.value);
                const b = Number(hi.value);
                const n = Number(nEl.value);
                if (b <= a) {
                    ui.result("stRes", "The stop temperature has to be above the start.", false);
                    return;
                }
                busy = true;
                ui.result("stRes", "Heating the boiler…");
                ui.animate(m, 5000, (k) => draw(5 + 95 * k), () => {
                    busy = false;
                    if (!(a <= 31.8 && b >= 31.8)) {
                        ui.result("stRes", "Your collection flask is nearly empty: the trichlorosilane boils at 31.8 °C, outside your window.", false);
                        return;
                    }
                    const d = ss().data;
                    const defs = [];
                    d.bContam = a <= 12.5;
                    d.pContam = b >= 76.1;
                    if (d.bContam) {
                        defs.push(defect("major", `Collecting from ${a} °C let boron chloride (bp 12.5 °C) into the product. Boron is a p-type dopant, so it will change your wafer's resistivity.`));
                    }
                    if (d.pContam) {
                        defs.push(defect("major", `Collecting up to ${b} °C let phosphorus chloride (bp 76.1 °C) through. Phosphorus is an n-type dopant and fights the boron you'll add later.`));
                    }
                    if (b >= 57.6 && !d.pContam) {
                        defs.push(defect("minor", "Silicon tetrachloride (bp 57.6 °C) came over too, diluting the trichlorosilane."));
                    }
                    if (n < 3) {
                        defs.push(defect(ss().data.sand === "iron" ? "major" : "minor", `${n} pass${n === 1 ? "" : "es"} isn't enough. Real plants distill over and over to reach parts-per-billion purity, and some metal stayed in.`));
                    }
                    completeStep(defs, `<p>Collected the fraction between ${a} and ${b} °C, ${n} time${n === 1 ? "" : "s"} over.</p>`);
                });
            });
        }


        /* ---------- Step 5: Siemens reactor ---------- */

        function openSiemens() {

            let feed = null;
            let busy = false;

            const m = open("Siemens Reactor", "Named after the company that developed it in the 1950s. Thin silicon rods inside a bell jar are heated red-hot by electric current. Purified trichlorosilane and hydrogen flow over them, and pure silicon deposits on the rods: SiHCl₃ + H₂ → Si + 3 HCl. Over days, the rods grow as thick as your arm.", `
                <div class="adv-machine">
                    ${machineCanvas("smCv", 220, 220)}
                    <div>
                        <p class="adv-round">Gas feed</p>
                        ${ui.chips("feed", [{ id: "tcsh2", label: "SiHCl₃ + H₂" }, { id: "tcs", label: "SiHCl₃ only" }, { id: "air", label: "SiHCl₃ + air" }], null)}
                        ${ui.slider("smT", "Rod temperature", "°C", 800, 1300, 25, 900)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="smGo" data-autofocus>Grow the rods</button></div>
                        <p class="adv-result" id="smRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("smCv").getContext("2d");
            const tEl = ui.wireSlider("smT");
            ui.wireChips("feed", (v) => { feed = v; });

            function draw(k, T) {
                c.clearRect(0, 0, 220, 220);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 220);
                c.strokeStyle = "rgba(220,235,255,0.6)";
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(30, 200);
                c.lineTo(30, 70);
                c.quadraticCurveTo(110, 0, 190, 70);
                c.lineTo(190, 200);
                c.stroke();
                const hot = Math.max(0, (T - 700) / 600);
                const w = 4 + 14 * k;
                [70, 150].forEach((x) => {
                    rect(c, x - w / 2, 60, w, 140, `rgb(${150 + 100 * hot}, ${110 + 60 * hot}, ${90})`);
                });
                rect(c, 70 - w / 2, 56, 80 + w, w, `rgb(${150 + 100 * hot}, ${110 + 60 * hot}, 90)`);
                rect(c, 20, 200, 180, 10, "#5d6577");
            }

            draw(0, 900);
            tEl.addEventListener("input", () => draw(0, Number(tEl.value)));

            $("smGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!feed) {
                    ui.result("smRes", "Choose the gas feed first.", false);
                    return;
                }
                if (feed === "air") {
                    ui.result("smRes", "Stop! Trichlorosilane reacts violently with the moisture and oxygen in air. The reactor must be sealed and filled with hydrogen.", false);
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                ui.result("smRes", "Growing… (days of real time)");
                ui.animate(m, 5000, (k) => draw(k, T), () => {
                    busy = false;
                    const defs = [];
                    if (feed === "tcs") {
                        defs.push(defect("minor", "Without hydrogen in the feed, the deposition was slow and inefficient. Hydrogen is a reactant."));
                    }
                    if (T < 1000) {
                        defs.push(defect("minor", `At ${T} °C the rods grew very slowly. Siemens reactors run near 1100 °C.`));
                    } else if (T > 1200) {
                        defs.push(defect("minor", `At ${T} °C the deposit grew rough and bumpy ("popcorn" rods) and trapped more contamination.`));
                    }
                    completeStep(defs, `<p>The rods grew thick at ${T} °C. They're broken into chunks of <strong>electronic-grade polysilicon</strong>, around 99.9999999% pure (nine or more nines).</p><p>It's still made of countless tiny crystals, though. Chips need one perfect crystal.</p>`);
                });
            });
        }


        /* ---------- Step 6: Czochralski crystal puller ---------- */

        const DOPANTS = [
            { id: "b", label: "Boron (p-type)" },
            { id: "p", label: "Phosphorus (n-type)" },
            { id: "none", label: "No dopant" }
        ];

        const LEVELS = [1e14, 1.4e15, 1e16, 1e17];

        function openCZ() {

            let dop = null;
            let level = null;
            let seed = null;
            let melt = null;
            let stage = "setup";
            let necked = false;
            let liveScore = null;
            const BAND = 10; // ± mm around 200 mm that counts as in spec

            const m = open("CZ Puller (Czochralski Crystal Puller)", "CZ stands for Czochralski, after Jan Czochralski, who discovered the method in 1916. Melt the polysilicon in a quartz crucible, add a pinch of dopant, then dip a seed crystal and pull it up slowly while rotating. The melt freezes onto the seed in the same crystal orientation, growing one giant single crystal: an ingot.", `
                <div id="czSetup">
                    <p class="adv-calib">Resistivity: ρ = 1 / (q · N · μ). q = 1.6×10<sup>−19</sup> C. For lightly doped p-type silicon, the hole mobility μ ≈ 450 cm²/V·s.</p>
                    <div class="adv-furnace-grid">
                        <div>
                            <p class="adv-round">Dopant added to the melt</p>
                            ${ui.chips("dop", DOPANTS, null)}
                            <p class="adv-round">Dopant level in the crystal (atoms/cm³)</p>
                            ${ui.chips("lvl", LEVELS.map((n) => ({ id: String(n), label: sci(n) })), null)}
                        </div>
                        <div>
                            <p class="adv-round">Seed crystal</p>
                            ${ui.chips("seed", [{ id: "100", label: "⟨100⟩ seed" }, { id: "111", label: "⟨111⟩ seed" }, { id: "none", label: "No seed" }], null)}
                            <p class="adv-round">Heater setpoint</p>
                            ${ui.chips("melt", [1350, 1420, 1500].map((t) => ({ id: String(t), label: t + " °C" })), null)}
                        </div>
                    </div>
                    <div class="adv-button-row"><button type="button" class="adv-btn" id="czMelt" data-autofocus>Melt and dip the seed</button></div>
                </div>
                <div id="czGrow" hidden>
                    <canvas id="czCv" width="460" height="240" class="adv-wide-canvas"></canvas>
                    <p class="adv-keys" id="czInfo"></p>
                    <div id="czControls"></div>
                </div>
                <p class="adv-result" id="czRes" aria-live="polite"></p>`, {
                onKey: (e) => {
                    const el = $("czPull");
                    if (!el) {
                        return;
                    }
                    if (e.code === "ArrowUp" || e.code === "ArrowDown") {
                        e.preventDefault();
                        el.value = Math.min(2, Math.max(0.4, Number(el.value) + (e.code === "ArrowUp" ? 0.05 : -0.05)));
                        el.dispatchEvent(new Event("input"));
                    }
                }
            });

            ui.wireChips("dop", (v) => { dop = v; });
            ui.wireChips("lvl", (v) => { level = Number(v); });
            ui.wireChips("seed", (v) => { seed = v; });
            ui.wireChips("melt", (v) => { melt = Number(v); });

            const c = $("czCv").getContext("2d");
            let diam = 30;
            let length = 0;
            let history = [];

            function draw(now) {
                c.clearRect(0, 0, 460, 240);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 240);
                // crucible and melt
                rect(c, 40, 170, 160, 50, "#c8ceda");
                rect(c, 46, 176, 148, 38, `rgba(255, ${150 + 30 * Math.sin((now || 0) / 300)}, 60, 0.9)`);
                // ingot: drawn from the history of diameters
                const top = 20;
                const scale = 130 / Math.max(130, history.length);
                history.forEach((d, i) => {
                    const y = 176 - (history.length - i) * scale;
                    const w = d * 0.55;
                    rect(c, 120 - w / 2, y, w, scale + 0.5, "#8f98aa");
                });
                rect(c, 118, top, 4, Math.max(0, 176 - history.length * scale - top), "#5d6577");
                // diameter gauge
                const gx = 260;
                c.strokeStyle = "#2c365a";
                c.strokeRect(gx, 30, 180, 150);
                const sy = (d) => 180 - (d - 140) / 120 * 150;
                c.fillStyle = "rgba(91, 227, 138, 0.15)";
                c.fillRect(gx, sy(200 + BAND), 180, sy(200 - BAND) - sy(200 + BAND));
                c.strokeStyle = "#54e0c7";
                c.lineWidth = 2;
                c.beginPath();
                const recent = history.slice(-180);
                recent.forEach((d, i) => {
                    const x = gx + i;
                    const y = Math.max(30, Math.min(180, sy(d)));
                    if (i) {
                        c.lineTo(x, y);
                    } else {
                        c.moveTo(x, y);
                    }
                });
                c.stroke();
                c.fillStyle = "#a9b2d0";
                c.font = "11px sans-serif";
                c.textAlign = "left";
                c.fillText("Diameter (mm): keep it in the green band", gx, 22);
                c.fillText("200", gx - 26, sy(200) + 4);
                c.fillStyle = "#f5f7ff";
                c.font = "bold 13px sans-serif";
                c.fillText(`${Math.round(diam)} mm`, gx + 120, 200);
                if (stage === "body" && liveScore !== null) {
                    const wide = diam > 200 + BAND;
                    const thin = diam < 200 - BAND;
                    c.fillStyle = wide || thin ? "#ff9aa6" : "#5be38a";
                    c.fillText(wide ? "Too wide: pull faster ↑" : thin ? "Too thin: pull slower ↓" : "In spec ✓", gx, 220);
                    c.fillStyle = "#a9b2d0";
                    c.font = "11px sans-serif";
                    c.fillText(`In spec so far: ${Math.round(liveScore * 100)}%`, gx, 236);
                }
            }

            $("czMelt").addEventListener("click", () => {
                if (!dop || (!level && dop !== "none") || !seed || !melt) {
                    ui.result("czRes", "Choose a dopant, a level, a seed and a heater setpoint first.", false);
                    return;
                }
                if (melt === 1350) {
                    ui.result("czRes", "The polysilicon just sits there glowing. Silicon melts at 1414 °C, so the heater has to be above that.", false);
                    return;
                }
                ui.result("czRes", "");
                $("czSetup").hidden = true;
                $("czGrow").hidden = false;
                stage = "neck";
                $("czInfo").textContent = "The seed touches the melt. First pull a thin neck quickly: dislocations from the thermal shock grow out to the surface of the narrow neck and stop.";
                $("czControls").innerHTML = `
                    <div class="adv-button-row" style="justify-content:center">
                        <button type="button" class="adv-btn" id="czNeck">Pull a thin neck</button>
                        <button type="button" class="adv-btn secondary" id="czSkip">Skip to the shoulder</button>
                    </div>`;
                draw(0);
                $("czNeck").addEventListener("click", () => {
                    necked = true;
                    neckThenGrow();
                });
                $("czSkip").addEventListener("click", () => {
                    necked = false;
                    startBody();
                });
            });

            function neckThenGrow() {
                $("czControls").innerHTML = "";
                ui.animate(m, 2000, (k, now) => {
                    history.push(3 + Math.random());
                    diam = 3;
                    draw(now);
                }, startBody);
            }

            function startBody() {
                stage = "body";
                $("czInfo").innerHTML = "Now the body: the diameter wanders as the melt temperature drifts. <strong>Pull faster to make it thinner, slower to make it fatter.</strong> Keep it within ±10 mm of 200 mm (the green band). The gauge tells you which way to steer. (↑ ↓ keys work too.)";
                $("czControls").innerHTML = `<div style="max-width:420px;margin:0 auto">${ui.slider("czPull", "Pull rate", "mm/min", 0.4, 2, 0.05, 1)}</div>`;
                const pullEl = ui.wireSlider("czPull", (v) => v.toFixed(2));
                $("czPull").focus();

                // shoulder out from the neck to full size
                let inBand = 0;
                let frames = 0;
                let drift = 0;
                let last = performance.now();
                const DURATION = 18000;

                ui.animate(m, DURATION, (k, now) => {
                    const dt = Math.min(0.05, (now - last) / 1000);
                    last = now;
                    if (k < 0.12) {
                        diam += (200 - diam) * dt * 2.2;
                    } else {
                        drift += (Math.random() - 0.5) * 0.012 + Math.sin(now / 2600) * 0.0015;
                        drift = Math.max(-0.25, Math.min(0.25, drift));
                        const equilibrium = 1 + drift;
                        // the puller's own diameter loop nudges it back toward 200 mm
                        diam += (equilibrium - Number(pullEl.value)) * 22 * dt + (200 - diam) * 0.25 * dt + (Math.random() - 0.5) * 0.3;
                        diam = Math.max(120, Math.min(280, diam));
                        frames++;
                        if (Math.abs(diam - 200) <= BAND) {
                            inBand++;
                        }
                        liveScore = inBand / frames;
                    }
                    history.push(diam);
                    draw(now);
                }, () => finish(frames ? inBand / frames : 0));
            }

            function finish(score) {

                const d = ss().data;
                const defs = [];
                const type0 = dop === "p" ? "n" : "p";
                const N0 = dop === "none" ? 0 : level;

                // net doping: what you added plus whatever got through distillation
                let net = (type0 === "p" ? N0 : -N0) + (d.bContam ? 3e15 : 0) - (d.pContam ? 5e15 : 0);
                if (dop === "none" && !d.bContam && !d.pContam) {
                    net = 2e13;
                }
                const type = net >= 0 ? "p" : "n";
                const N = Math.abs(net) || 1e13;
                const rho = resistivity(type, N);

                d.type = type;
                d.N = N;
                d.rho = rho;
                d.orient = seed;

                if (seed === "none") {
                    defs.push(defect("major", "With no seed, the melt froze into many crystals at once. You made a polycrystalline ingot, not a single crystal."));
                } else if (!necked) {
                    defs.push(defect("major", "Without a thin neck, dislocations from the seed's thermal shock ran into the crystal and spread through the ingot."));
                }
                if (seed === "111") {
                    defs.push(defect("minor", "⟨111⟩ crystals are used for some power and bipolar chips, but CMOS transistors are built on ⟨100⟩ wafers for a better gate interface."));
                }
                if (melt === 1500) {
                    defs.push(defect("minor", "At 1500 °C the melt ran too hot. The growth was harder to control and dissolved more oxygen from the crucible."));
                }
                if (dop === "p") {
                    defs.push(defect("major", "Phosphorus makes n-type silicon. The recipe asked for p-type (boron)."));
                } else if (dop === "none") {
                    defs.push(defect("major", "With no dopant added, the crystal's resistivity depends on whatever impurities slipped through. It's not usable as a 10 Ω·cm substrate."));
                }
                if (score < 0.35) {
                    defs.push(defect("major", `The diameter stayed within ±${BAND} mm of 200 mm only ${Math.round(score * 100)}% of the time. Most of the ingot is out of spec and gets ground off or scrapped.`));
                } else if (score < 0.6) {
                    defs.push(defect("minor", `The diameter was on target ${Math.round(score * 100)}% of the time. The wavy parts waste silicon when the ingot is ground round.`));
                }

                completeStep(defs, `
                    <p>Pulled a ${seed === "none" ? "polycrystalline" : "⟨" + seed + "⟩"} ingot. Diameter on target ${Math.round(score * 100)}% of the time.</p>
                    <p>Crystal: <strong>${type}-type, ${sci(N)} cm<sup>−3</sup></strong>. The resistivity is hidden until you measure it in the test phase.</p>
                    <p>Boron's segregation coefficient is about 0.8, so the crystal takes in a little less boron than the melt holds. As the melt shrinks it gets richer in boron, and the bottom of the ingot ends up slightly more heavily doped than the top. Phosphorus (k ≈ 0.35) varies much more along an ingot.</p>`);
            }
        }


        /* ---------- Step 7: wire saw ---------- */

        function openSaw() {

            let target = null;
            let wire = null;
            let busy = false;

            const m = open("Ingot Grinder & Wire Saw", "Grind the ingot perfectly round, cut a small notch that marks the crystal direction, then slice it with a web of wire running at high speed.", `
                <div class="adv-machine">
                    ${machineCanvas("swCv")}
                    <div>
                        <p class="adv-round">Final wafer thickness (200 mm)</p>
                        ${ui.chips("thk", [675, 725, 775].map((t) => ({ id: String(t), label: t + " µm" })), null)}
                        <p class="adv-round">Wire</p>
                        ${ui.chips("wire", [{ id: "diamond", label: "Diamond-coated wire" }, { id: "slurry", label: "Steel wire + SiC slurry" }], null)}
                        <label class="adv-check"><input type="checkbox" id="swNotch"> Grind the orientation notch</label>
                        ${ui.slider("swFeed", "Feed rate", "mm/min", 0.2, 2, 0.1, 1.5)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="swGo" data-autofocus>Slice</button></div>
                        <p class="adv-result" id="swRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("swCv").getContext("2d");
            const feed = ui.wireSlider("swFeed", (v) => v.toFixed(1));
            ui.wireChips("thk", (v) => { target = Number(v); });
            ui.wireChips("wire", (v) => { wire = v; });

            function draw(k, now) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 200);
                rect(c, 30, 60 + k * 50, 160, 70, "#8f98aa");
                for (let i = 0; i < 16; i++) {
                    const x = 36 + i * 10;
                    rect(c, x, 40, 1, 120, `rgba(220, 230, 255, ${0.5 + 0.3 * Math.sin((now || 0) / 40 + i)})`);
                }
                rect(c, 20, 30, 180, 8, "#5d6577");
                rect(c, 20, 160, 180, 8, "#5d6577");
            }

            draw(0, 0);

            $("swGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!target || !wire) {
                    ui.result("swRes", "Choose a thickness and a wire first.", false);
                    return;
                }
                busy = true;
                const f = Number(feed.value);
                ui.result("swRes", "Slicing…");
                ui.animate(m, 4000, (k, now) => draw(k, now), () => {
                    const defs = [];
                    if (target !== 725) {
                        defs.push(defect("minor", `${target} µm is the standard for ${target === 675 ? "150" : "300"} mm wafers. 200 mm wafers are 725 µm thick, and tools expect that.`));
                    }
                    if (!$("swNotch").checked) {
                        defs.push(defect("minor", "No notch was ground, so the fab's tools can't tell which way the crystal planes run."));
                    }
                    if (f > 1.2) {
                        defs.push(defect("minor", `A ${f.toFixed(1)} mm/min feed was fast: the wire bowed and left deep saw marks and wavy wafers.`));
                    }
                    ss().data.thick = target;
                    completeStep(defs, `<p>Sliced the ingot into hundreds of wafers, cut a little thicker than ${target} µm to leave room for lapping, etching and polishing.</p><p>${wire === "diamond" ? "Diamond wire cuts fast with a thin kerf (the silicon lost as sawdust)." : "Slurry sawing works, but it's slower and loses more silicon as kerf than diamond wire."}</p>`);
                });
            });
        }


        /* ---------- Step 8: lap and etch ---------- */

        function openEtch() {

            let etchant = null;
            let busy = false;

            const m = open("Lapping & Etch Bench", "Sawing leaves a crust of cracked, damaged silicon. Lap both faces flat, then dissolve the damaged layer chemically.", `
                <div class="adv-machine">
                    ${machineCanvas("etCv")}
                    <div>
                        <label class="adv-check"><input type="checkbox" id="etLap"> Lap both sides flat first</label>
                        <p class="adv-round">Etchant</p>
                        ${ui.chips("etch", [{ id: "koh", label: "KOH (alkaline)" }, { id: "acid", label: "HF + HNO₃ + acetic acid" }, { id: "hf", label: "HF only" }], null)}
                        ${ui.slider("etRm", "Remove per side", "µm", 5, 80, 5, 10)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="etGo" data-autofocus>Etch</button></div>
                        <p class="adv-result" id="etRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("etCv").getContext("2d");
            const rm = ui.wireSlider("etRm");
            ui.wireChips("etch", (v) => { etchant = v; });

            function draw(k) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 200);
                rect(c, 30, 80, 160, 80, "#cfe8ff");
                rect(c, 50, 112, 120, 16, "#8f98aa");
                for (let i = 0; i < 12; i++) {
                    const rough = (1 - k) * 4;
                    rect(c, 50 + i * 10, 110 - rough * ((i % 3) / 2), 10, 2, "#6b7488");
                }
                for (let i = 0; i < 10 * k; i++) {
                    rect(c, 60 + (i * 31) % 100, 150 - ((i * 47) % 40), 3, 3, "rgba(255,255,255,0.6)");
                }
            }

            draw(0);

            $("etGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!etchant) {
                    ui.result("etRes", "Choose an etchant first.", false);
                    return;
                }
                busy = true;
                const r = Number(rm.value);
                ui.animate(m, 3000, (k) => draw(etchant === "hf" ? 0 : k), () => {
                    busy = false;
                    if (etchant === "hf") {
                        ui.result("etRes", "Almost nothing happened. HF dissolves silicon dioxide, not silicon. To etch silicon you need an oxidizer (like nitric acid) with the HF, or a strong base like KOH.", false);
                        return;
                    }
                    const defs = [];
                    if (!$("etLap").checked) {
                        defs.push(defect("minor", "Without lapping, the saw's waviness stayed in the wafer, so it isn't flat enough."));
                    }
                    if (r < 15) {
                        defs.push(defect("minor", `${r} µm wasn't enough to remove all the saw damage. Hidden microcracks remain.`));
                    } else if (r > 60) {
                        defs.push(defect("minor", `Removing ${r} µm per side thinned the wafer below spec.`));
                    }
                    ss().data.removed = r;
                    completeStep(defs, `<p>Removed ${r} µm per side with ${etchant === "koh" ? "hot KOH" : "the HF/nitric/acetic mix"}. The surface is clean silicon now, but still matte, not mirror-smooth.</p>`);
                });
            });
        }


        /* ---------- Step 9: CMP ---------- */

        function openCMP() {

            let slurry = null;
            let busy = false;

            const m = open("CMP Polisher (Chemical-Mechanical Polishing)", "CMP stands for chemical-mechanical polishing: the wafer is pressed face-down onto a spinning pad soaked in slurry. The chemistry softens the surface and tiny abrasive particles wipe it away, leaving it flat to within nanometers.", `
                <canvas id="cmCv" width="460" height="250" class="adv-wide-canvas"></canvas>
                <div class="adv-furnace-grid">
                    <div>
                        <p class="adv-round">Slurry</p>
                        ${ui.chips("slurry", [{ id: "silica", label: "Colloidal silica (alkaline)" }, { id: "alumina", label: "Alumina" }, { id: "diamond", label: "Diamond paste" }], null)}
                    </div>
                    <div>
                        ${ui.slider("cmP", "Down pressure", "psi", 1, 10, 0.5, 8)}
                        ${ui.slider("cmT", "Polish time", "min", 1, 20, 1, 2)}
                    </div>
                </div>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="cmGo" data-autofocus>Polish</button></div>
                <p class="adv-result" id="cmRes" aria-live="polite"></p>`);

            const c = $("cmCv").getContext("2d");
            const pEl = ui.wireSlider("cmP", (v) => v.toFixed(1));
            const tEl = ui.wireSlider("cmT");
            ui.wireChips("slurry", (v) => { slurry = v; });

            // a fixed, bumpy starting surface (after etching, ~30 nm rough)
            const N = 90;
            const bumps = [];
            for (let i = 0; i < N; i++) {
                bumps.push(Math.sin(i * 0.7) * 0.5 + Math.sin(i * 2.3 + 1) * 0.35 + Math.sin(i * 5.1) * 0.15);
            }

            let padAng = 0;
            let carAng = 0;
            let drops = [];

            // k: how far polishing has got (0..1). run: animation running.
            function draw(k, run, opt) {
                opt = opt || {};
                c.clearRect(0, 0, 460, 250);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 250);

                // ---- top view: the polisher ----
                const px = 115;
                const py = 135;
                c.fillStyle = "#2a3448";
                c.beginPath();
                c.arc(px, py, 102, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = "#4a5470";
                c.beginPath();
                c.arc(px, py, 96, 0, Math.PI * 2);
                c.fill();
                // grooves and spokes rotate with the platen
                c.save();
                c.translate(px, py);
                c.rotate(padAng);
                c.strokeStyle = "rgba(255,255,255,0.10)";
                c.lineWidth = 1;
                for (let r = 14; r < 96; r += 12) {
                    c.beginPath();
                    c.arc(0, 0, r, 0, Math.PI * 2);
                    c.stroke();
                }
                for (let i = 0; i < 6; i++) {
                    c.rotate(Math.PI / 3);
                    c.beginPath();
                    c.moveTo(0, 0);
                    c.lineTo(94, 0);
                    c.stroke();
                }
                c.restore();
                // slurry film: a milky swirl that spreads as it runs
                if (run || k > 0) {
                    c.fillStyle = "rgba(220, 235, 255, 0.10)";
                    c.beginPath();
                    c.arc(px, py, 30 + 60 * Math.min(1, k * 3 + (run ? 0.2 : 0)), 0, Math.PI * 2);
                    c.fill();
                }
                // slurry arm and drops
                rect(c, px - 4, 20, 60, 6, "#8f98aa");
                rect(c, px - 6, 20, 6, 22, "#8f98aa");
                drops.forEach((d) => {
                    c.fillStyle = slurry === "diamond" ? "#d9e2f0" : slurry === "alumina" ? "#f2e8d5" : "#e8f4ff";
                    c.beginPath();
                    c.arc(px - 3, d, 2.2, 0, Math.PI * 2);
                    c.fill();
                });
                // pad conditioner: a small diamond disc sweeping back and forth
                const sweep = Math.sin(padAng * 0.6) * 0.5;
                const cx2 = px - 60 + Math.cos(sweep + 2.4) * 10;
                const cy2 = py + 55 + Math.sin(sweep) * 18;
                rect(c, 8, py + 52, cx2 - 8, 5, "#5d6577");
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.arc(cx2, cy2, 13, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = "#c8ceda";
                c.beginPath();
                c.arc(cx2, cy2, 11, 0, Math.PI * 2);
                c.fill();
                // carrier head holding the wafer face-down, spinning the other way
                const hx = px + 36;
                const hy = py - 18;
                c.fillStyle = "rgba(0,0,0,0.35)";
                c.beginPath();
                c.arc(hx + 3, hy + 4, 40, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.arc(hx, hy, 40, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = "#8f98aa";
                c.beginPath();
                c.arc(hx, hy, 37, 0, Math.PI * 2);
                c.fill();
                c.save();
                c.translate(hx, hy);
                c.rotate(carAng);
                c.fillStyle = "#5d6577";
                for (let i = 0; i < 4; i++) {
                    c.rotate(Math.PI / 2);
                    c.fillRect(12, -3, 20, 6);
                }
                c.fillStyle = "#3b4458";
                c.beginPath();
                c.arc(0, 0, 9, 0, Math.PI * 2);
                c.fill();
                c.restore();
                c.fillStyle = "#a9b2d0";
                c.font = "11px sans-serif";
                c.textAlign = "center";
                c.fillText("platen + pad", px - 40, 245);
                c.fillText("carrier (wafer face-down)", hx + 10, hy + 54);
                c.fillText("conditioner", cx2, cy2 + 26);

                // ---- cross-section: the wafer surface up close ----
                const sx0 = 250;
                const sw = 196;
                const base = 170;
                c.strokeStyle = "#2c365a";
                c.strokeRect(sx0 - 6, 30, sw + 12, 190);
                c.fillStyle = "#a9b2d0";
                c.textAlign = "left";
                c.fillText("Surface up close", sx0, 22);

                const rough = opt.rough === undefined ? 30 * (1 - k) + (opt.finalRa || 0.15) * k : opt.rough;
                const amp = Math.min(40, rough * 1.4);
                const stepW = sw / (N - 1);
                c.beginPath();
                c.moveTo(sx0, 214);
                for (let i = 0; i < N; i++) {
                    let h = bumps[i] * amp;
                    // edge roll-off from pressing too hard
                    if (opt.rolloff) {
                        const e = Math.min(i, N - 1 - i) / 12;
                        h -= e < 1 ? (1 - e) * 22 * k : 0;
                    }
                    // scratches from abrasives harder than silicon
                    if (opt.scratch && k > 0.2 && (i % 17 === 5 || i % 23 === 11)) {
                        h -= opt.scratch * Math.min(1, (k - 0.2) * 2);
                    }
                    c.lineTo(sx0 + i * stepW, base - h);
                }
                c.lineTo(sx0 + sw, 214);
                c.closePath();
                c.fillStyle = "#8f98aa";
                c.fill();
                c.strokeStyle = "#c8ceda";
                c.lineWidth = 1.5;
                c.beginPath();
                for (let i = 0; i < N; i++) {
                    let h = bumps[i] * amp;
                    if (opt.rolloff) {
                        const e = Math.min(i, N - 1 - i) / 12;
                        h -= e < 1 ? (1 - e) * 22 * k : 0;
                    }
                    if (opt.scratch && k > 0.2 && (i % 17 === 5 || i % 23 === 11)) {
                        h -= opt.scratch * Math.min(1, (k - 0.2) * 2);
                    }
                    if (i) {
                        c.lineTo(sx0 + i * stepW, base - h);
                    } else {
                        c.moveTo(sx0, base - h);
                    }
                }
                c.stroke();
                // the pad sliding over the top, dragging abrasive particles
                if (run) {
                    const padY = base - amp - 5;
                    rect(c, sx0 - 4, padY - 18, sw + 8, 14, "#4a5470");
                    for (let i = 0; i < 14; i++) {
                        const x = sx0 + ((padAng * 60 + i * 37) % sw);
                        c.fillStyle = slurry === "diamond" ? "#ffffff" : slurry === "alumina" ? "#f2e8d5" : "#cfe8ff";
                        c.beginPath();
                        c.arc(x, padY + 1, slurry === "diamond" ? 3.2 : 2, 0, Math.PI * 2);
                        c.fill();
                    }
                }
                c.fillStyle = "#f5f7ff";
                c.font = "bold 13px sans-serif";
                c.fillText(`Roughness ≈ ${rough < 1 ? rough.toFixed(2) : rough.toFixed(0)} nm`, sx0, 238);
            }

            draw(0, false);

            $("cmGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!slurry) {
                    ui.result("cmRes", "Choose a slurry first.", false);
                    return;
                }
                busy = true;
                const P = Number(pEl.value);
                const t = Number(tEl.value);

                let ra = 0.15;
                const opt = { rolloff: P > 7 };
                if (slurry === "diamond") {
                    ra = 4;
                    opt.scratch = 26;
                } else if (slurry === "alumina") {
                    ra = 1.2;
                    opt.scratch = 9;
                }
                const reach = Math.min(1, t / 5);
                if (t < 5) {
                    ra = Math.max(ra, 0.8);
                }
                opt.finalRa = ra;

                ui.result("cmRes", "Polishing…");
                let last = performance.now();
                ui.animate(m, 6000, (k, now) => {
                    const dt = (now - last) / 1000;
                    last = now;
                    padAng += dt * 2.4;
                    carAng -= dt * 3.1;
                    // slurry drips from the arm onto the pad
                    drops = drops.map((y) => y + dt * 90).filter((y) => y < 100);
                    if (Math.random() < 0.18) {
                        drops.push(42);
                    }
                    const kk = Math.min(1, k / 0.9) * reach;
                    opt.rough = 30 * (1 - kk) + ra * kk;
                    draw(kk, k < 1, opt);
                }, () => {
                    drops = [];
                    draw(reach, false, opt);
                    const defs = [];
                    if (slurry === "diamond") {
                        defs.push(defect("major", "Diamond is far harder than silicon. It gouged deep scratches into the surface."));
                    } else if (slurry === "alumina") {
                        defs.push(defect("minor", "Alumina slurries are used for polishing metals. On silicon they left fine scratches."));
                    }
                    if (P > 7) {
                        defs.push(defect("minor", `${P} psi pressed too hard: the edges rolled off and the wafer lost flatness.`));
                    }
                    if (t < 5) {
                        defs.push(defect("minor", `${t} min wasn't long enough to remove the haze from etching.`));
                    }
                    completeStep(defs, `<p>Polished with ${slurry === "silica" ? "colloidal silica" : slurry} at ${P} psi for ${t} min. Surface roughness: about <strong>${ra} nm</strong>. ${ra < 0.3 ? "A perfect mirror." : "Not quite a perfect mirror."}</p>`);
                });
            });
        }


        /* ---------- Step 10: RCA clean ---------- */

        const RCA = [
            { id: "sc1", label: "SC-1 (NH₄OH + H₂O₂ + H₂O, 75 °C)", short: "SC-1", sub: "75 °C", color: "rgba(160, 205, 255, 0.85)", hot: true },
            { id: "hf", label: "Dilute HF dip", short: "HF dip", sub: "room temp", color: "rgba(225, 235, 245, 0.85)" },
            { id: "sc2", label: "SC-2 (HCl + H₂O₂ + H₂O, 75 °C)", short: "SC-2", sub: "75 °C", color: "rgba(250, 232, 160, 0.85)", hot: true },
            { id: "di", label: "DI water rinse", short: "DI rinse", sub: "ultra-pure", color: "rgba(140, 225, 245, 0.75)" }
        ];

        // What sits on the wafer surface, and which bath removes it.
        function rcaSurface(seq) {
            const s = { organics: true, particles: true, metals: true, oxide: true, residue: false, hTerm: false, note: [] };
            seq.forEach((id) => {
                if (id === "sc1") {
                    s.organics = false;
                    s.particles = false;
                    s.oxide = true;
                    s.residue = true;
                } else if (id === "hf") {
                    s.oxide = false;
                    s.hTerm = true;
                    s.residue = true;
                } else if (id === "sc2") {
                    s.metals = false;
                    s.oxide = true;
                    s.residue = true;
                } else if (id === "di") {
                    s.residue = false;
                }
                if (s.oxide) {
                    s.hTerm = false;
                }
            });
            return s;
        }

        function openRCA() {

            let seq = [];
            let busy = false;

            const m = open("RCA Clean Bench", "RCA stands for Radio Corporation of America, where Werner Kern developed this clean in 1965. Fabs still use it today. SC-1 and SC-2 are \"Standard Clean 1\" and \"Standard Clean 2\": SC-1 (ammonia + hydrogen peroxide + water) lifts organics and particles, the HF (hydrofluoric acid) dip strips the thin oxide, and SC-2 (hydrochloric acid + hydrogen peroxide + water) removes metal ions. Build the bath sequence.", `
                <canvas id="rcCv" width="460" height="270" class="adv-wide-canvas"></canvas>
                <div class="adv-chips">${RCA.map((b) => `<button type="button" class="adv-chip" data-rca="${b.id}">${b.label}</button>`).join("")}</div>
                <p class="adv-round">Your sequence</p>
                <p class="adv-seq" id="rcSeq">Nothing yet</p>
                <div class="adv-button-row">
                    <button type="button" class="adv-btn secondary" id="rcUndo">Undo</button>
                    <button type="button" class="adv-btn" id="rcGo" data-autofocus>Run sequence + spin dry</button>
                </div>
                <p class="adv-result" id="rcRes" aria-live="polite"></p>`);

            const c = $("rcCv").getContext("2d");

            // stage: which bath the cassette is in (-1 before, seq.length = dryer), dip: 0..1 how far down
            function draw(stage, dip, now, surf) {
                c.clearRect(0, 0, 460, 270);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 270);

                // ---- surface close-up ----
                c.strokeStyle = "#2c365a";
                c.strokeRect(10, 24, 440, 92);
                c.fillStyle = "#a9b2d0";
                c.font = "11px sans-serif";
                c.textAlign = "left";
                c.fillText("Wafer surface up close", 12, 16);
                rect(c, 14, 84, 432, 28, "#8f98aa");
                if (surf.oxide) {
                    rect(c, 14, 78, 432, 6, "rgba(120, 170, 255, 0.75)");
                } else if (surf.hTerm) {
                    for (let x = 18; x < 446; x += 10) {
                        rect(c, x, 79, 1, 5, "#e8f4ff");
                        rect(c, x - 1, 77, 3, 2, "#e8f4ff");
                    }
                }
                const top = surf.oxide ? 78 : 84;
                if (surf.organics) {
                    [[40, 22], [150, 30], [290, 18], [390, 26]].forEach(([x, w]) => {
                        c.fillStyle = "#8a5a3b";
                        c.beginPath();
                        c.ellipse(x, top - 4, w / 2, 5, 0, Math.PI, 0);
                        c.fill();
                    });
                }
                if (surf.particles) {
                    [80, 205, 330, 420].forEach((x) => {
                        c.fillStyle = "#5d6577";
                        c.beginPath();
                        c.arc(x, top - 6, 6, 0, Math.PI * 2);
                        c.fill();
                    });
                }
                if (surf.metals) {
                    [[110, "Fe", "#ff8a5c"], [245, "Na", "#b48cff"], [360, "Cu", "#ffb84a"]].forEach(([x, t, col]) => {
                        c.fillStyle = col;
                        c.beginPath();
                        c.arc(x, top - 5, 5, 0, Math.PI * 2);
                        c.fill();
                        c.fillStyle = "#1a2033";
                        c.font = "bold 7px sans-serif";
                        c.textAlign = "center";
                        c.fillText(t, x, top - 3);
                    });
                }
                if (surf.residue) {
                    for (let x = 30; x < 440; x += 46) {
                        c.fillStyle = "rgba(255, 255, 255, 0.35)";
                        c.beginPath();
                        c.arc(x, top - 3, 3, 0, Math.PI * 2);
                        c.fill();
                    }
                }
                // legend
                c.font = "10px sans-serif";
                c.textAlign = "left";
                const legend = [
                    ["#8a5a3b", "organics"], ["#5d6577", "particles"], ["#ff8a5c", "metal ions"],
                    ["rgba(120, 170, 255, 0.9)", "oxide"], ["#e8f4ff", "H-terminated"], ["rgba(255,255,255,0.6)", "residue"]
                ];
                legend.forEach(([col, name], i) => {
                    const x = 16 + i * 74;
                    rect(c, x, 34, 8, 8, col);
                    c.fillStyle = "#a9b2d0";
                    c.fillText(name, x + 11, 42);
                });

                // ---- the bench: one tank per bath, then the spin dryer ----
                const n = seq.length;
                const slot = Math.min(80, 360 / Math.max(1, n));
                const x0 = 16;
                const tankY = 190;
                seq.forEach((id, i) => {
                    const b = RCA.find((r) => r.id === id);
                    const x = x0 + i * slot;
                    const w = slot - 10;
                    rect(c, x, tankY - 4, w, 60, "#d9e2f0");
                    rect(c, x + 3, tankY + 4, w - 6, 50, b.color);
                    if (b.hot && stage === i) {
                        for (let j = 0; j < 4; j++) {
                            const yy = tankY - 12 - (((now / 14) + j * 9) % 30);
                            c.fillStyle = "rgba(255,255,255,0.18)";
                            c.beginPath();
                            c.arc(x + 8 + j * (w / 4), yy, 4, 0, Math.PI * 2);
                            c.fill();
                        }
                    }
                    if (stage === i && dip > 0.6) {
                        for (let j = 0; j < 6; j++) {
                            const yy = tankY + 50 - (((now / 8) + j * 11) % 44);
                            c.fillStyle = "rgba(255,255,255,0.55)";
                            c.beginPath();
                            c.arc(x + 6 + ((j * 13) % (w - 10)), yy, 1.6, 0, Math.PI * 2);
                            c.fill();
                        }
                    }
                    c.fillStyle = stage === i ? "#ffd84a" : "#a9b2d0";
                    c.font = "bold 10px sans-serif";
                    c.textAlign = "center";
                    c.fillText(b.short, x + w / 2, tankY + 70);
                    c.font = "9px sans-serif";
                    c.fillText(b.sub, x + w / 2, tankY + 80);
                });
                // spin dryer
                const dx = x0 + n * slot + 10;
                c.fillStyle = "#3b4458";
                c.beginPath();
                c.arc(dx + 26, tankY + 24, 26, 0, Math.PI * 2);
                c.fill();
                if (stage === n) {
                    c.save();
                    c.translate(dx + 26, tankY + 24);
                    c.rotate(now / 60);
                    rect(c, -20, -2, 40, 4, "#c8ceda");
                    rect(c, -2, -20, 4, 40, "#c8ceda");
                    c.restore();
                }
                c.fillStyle = stage === n ? "#ffd84a" : "#a9b2d0";
                c.font = "bold 10px sans-serif";
                c.textAlign = "center";
                c.fillText("Spin dry", dx + 26, tankY + 70);

                // the cassette of wafers on the robot arm
                if (stage >= 0) {
                    const tx = stage < n ? x0 + stage * slot + (slot - 10) / 2 : dx + 26;
                    const ty = 128 + dip * (stage < n ? 70 : 52);
                    rect(c, tx - 1, 120, 2, ty - 120, "#5d6577");
                    rect(c, tx - 16, ty, 32, 22, "#c8ceda");
                    for (let j = 0; j < 6; j++) {
                        rect(c, tx - 13 + j * 5, ty + 2, 2, 18, "#8f98aa");
                    }
                }
            }

            const show = () => {
                $("rcSeq").textContent = seq.length ? seq.map((id) => RCA.find((b) => b.id === id).short).join("  →  ") : "Nothing yet";
                draw(-1, 0, 0, rcaSurface([]));
            };

            show();

            api.modalBody().querySelectorAll("[data-rca]").forEach((b) => b.addEventListener("click", () => {
                if (!busy && seq.length < 6) {
                    seq.push(b.dataset.rca);
                    show();
                }
            }));
            $("rcUndo").addEventListener("click", () => {
                if (!busy) {
                    seq.pop();
                    show();
                }
            });

            $("rcGo").addEventListener("click", () => {
                if (busy || !seq.length) {
                    return;
                }
                busy = true;
                const PER = 2200;
                const total = PER * (seq.length + 1);
                ui.result("rcRes", "Running the baths…");

                ui.animate(m, total, (k, now) => {
                    const tms = k * total;
                    const stage = Math.min(seq.length, Math.floor(tms / PER));
                    const f = (tms - stage * PER) / PER;
                    // lower, soak, raise
                    const dip = f < 0.25 ? f / 0.25 : f > 0.75 ? (1 - f) / 0.25 : 1;
                    // a bath does its job once the cassette has soaked for a bit
                    const done = seq.slice(0, stage + (f > 0.5 && stage < seq.length ? 1 : 0));
                    draw(stage, dip, now, rcaSurface(done));
                }, () => {
                    const final = rcaSurface(seq);
                    draw(seq.length, 0, 0, final);
                    const defs = [];
                    const i1 = seq.indexOf("sc1");
                    const i2 = seq.lastIndexOf("sc2");
                    if (i1 < 0) {
                        defs.push(defect("minor", "No SC-1: organic residue and particles stayed on the wafer."));
                    }
                    if (i2 < 0) {
                        defs.push(defect("major", "No SC-2: metal ions like iron and sodium stayed on the surface. They kill transistors."));
                    } else if (i1 > i2) {
                        defs.push(defect("minor", "SC-2 ran before SC-1, so metals stirred up by SC-1 were left behind. The classic order is SC-1, then SC-2."));
                    }
                    if (seq[seq.length - 1] !== "di") {
                        defs.push(defect("minor", "The last bath wasn't a DI water rinse, so chemical residue dried onto the wafer."));
                    }
                    const left = [final.organics && "organics", final.particles && "particles", final.metals && "metal ions", final.residue && "chemical residue"].filter(Boolean);
                    completeStep(defs, `<p>Ran: ${seq.map((id) => RCA.find((b) => b.id === id).short).join(" → ")}, then spin-dried.</p><p>${left.length ? `Still on the surface: <strong>${left.join(", ")}</strong>.` : "The surface is clean: no organics, particles, metals or residue."} SC-1 lifts organics and particles, the HF dip strips the thin oxide, and SC-2 pulls off metal ions (leaving a fresh, ultra-thin chemical oxide that protects the surface).</p>`);
                });
            });
        }


        /* ---------- Step 11: ion implanter ---------- */

        function openImplant() {

            let species = null;
            let dose = null;
            let tilt = null;
            let busy = false;

            const m = open("Ion Implanter", "Dopant atoms are ionized, accelerated through tens of thousands of volts (energy is measured in keV, kilo-electron-volts), and fired into the wafer like microscopic bullets. Here you'll make an n-type layer in the front of your p-type wafer: a p–n junction.", `
                <div class="adv-furnace-grid">
                    <div>
                        <p class="adv-round">Ion species</p>
                        ${ui.chips("ion", [{ id: "P", label: "P⁺ (phosphorus)" }, { id: "As", label: "As⁺ (arsenic)" }, { id: "B", label: "B⁺ (boron)" }, { id: "Ar", label: "Ar⁺ (argon)" }], null)}
                        <p class="adv-round">Dose (ions/cm²)</p>
                        ${ui.chips("dose", [1e13, 1e14, 1e15, 1e16].map((d) => ({ id: String(d), label: sci(d) })), null)}
                    </div>
                    <div>
                        ${ui.slider("imE", "Energy", "keV", 10, 200, 10, 150)}
                        <p class="adv-round">Wafer tilt</p>
                        ${ui.chips("tilt", [{ id: "0", label: "0°" }, { id: "7", label: "7°" }], null)}
                    </div>
                </div>
                <canvas id="imCv" width="460" height="140" class="adv-wide-canvas"></canvas>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="imGo" data-autofocus>Implant</button></div>
                <p class="adv-result" id="imRes" aria-live="polite"></p>`);

            const c = $("imCv").getContext("2d");
            const eEl = ui.wireSlider("imE");
            ui.wireChips("ion", (v) => { species = v; });
            ui.wireChips("dose", (v) => { dose = Number(v); });
            ui.wireChips("tilt", (v) => { tilt = Number(v); });

            function draw(k, now) {
                c.clearRect(0, 0, 460, 140);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 140);
                rect(c, 300, 20, 30, 100, "#8f98aa");
                for (let i = 0; i < 24 * k; i++) {
                    const x = ((now || 0) / 2 + i * 37) % 280;
                    rect(c, x, 30 + (i * 13) % 80, 6, 2, "#ffd84a");
                }
                c.fillStyle = "#a9b2d0";
                c.font = "11px sans-serif";
                c.fillText("ion beam →", 20, 132);
                c.fillText("wafer", 296, 132);
            }

            draw(0, 0);

            $("imGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!species || !dose || tilt === null) {
                    ui.result("imRes", "Choose the ion, dose and tilt first.", false);
                    return;
                }
                busy = true;
                const E = Number(eEl.value);
                ui.animate(m, 3000, (k, now) => draw(1, now), () => {
                    const defs = [];
                    if (species === "B") {
                        defs.push(defect("major", "Boron is p-type, the same as your wafer. A p layer on a p wafer makes no p–n junction."));
                    } else if (species === "Ar") {
                        defs.push(defect("major", "Argon isn't a dopant. It only damages the crystal, without adding any electrons or holes."));
                    }
                    if (tilt === 0) {
                        defs.push(defect("minor", "At 0° tilt, some ions slid straight down the open channels between crystal rows (channeling), so the layer has a deep tail."));
                    }
                    if (E > 150) {
                        defs.push(defect("minor", `${E} keV drove the ions deep, giving a deeper junction than needed.`));
                    }
                    Object.assign(ss().data, { species: species, dose: dose, energy: E, tilt: tilt });
                    completeStep(defs, `<p>Implanted ${sci(dose)} ${species}⁺ ions/cm² at ${E} keV and ${tilt}° tilt.</p><p>Right now the dopants are jammed in random spots and the crystal is battered. They don't conduct properly until you anneal.</p>`);
                });
            });
        }


        /* ---------- Step 12: rapid thermal anneal ---------- */

        function openRTA() {

            let gas = null;
            let busy = false;

            const m = open("RTA (Rapid Thermal Anneal)", "RTA stands for rapid thermal anneal. Banks of halogen lamps heat the wafer by hundreds of degrees per second. A short, hot anneal heals the implant damage and moves dopants onto real lattice sites (activation), without letting them spread too far.", `
                <div class="adv-machine">
                    ${machineCanvas("rtCv")}
                    <div>
                        ${ui.slider("rtT", "Peak temperature", "°C", 600, 1200, 25, 800)}
                        ${ui.slider("rtS", "Time at peak", "s", 1, 60, 1, 60)}
                        <p class="adv-round">Ambient</p>
                        ${ui.chips("rgas", [{ id: "n2", label: "N₂" }, { id: "o2", label: "O₂" }], null)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="rtGo" data-autofocus>Flash the lamps</button></div>
                        <p class="adv-result" id="rtRes" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("rtCv").getContext("2d");
            const tEl = ui.wireSlider("rtT");
            const sEl = ui.wireSlider("rtS");
            ui.wireChips("rgas", (v) => { gas = v; });

            function draw(k) {
                glowBox(c, 220, 200, "255, 220, 150", k, "Lamp-heated chamber");
                for (let i = 0; i < 8; i++) {
                    rect(c, 54 + i * 15, 54, 6, 10, k > 0 ? "#fff3c4" : "#5d6577");
                }
            }

            draw(0);

            $("rtGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!gas) {
                    ui.result("rtRes", "Choose the ambient gas first.", false);
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                const s = Number(sEl.value);
                ui.animate(m, 2500, (k) => draw(Math.sin(k * Math.PI)), () => {
                    const defs = [];
                    let act = 1;
                    if (T < 900) {
                        act = 0.08;
                        defs.push(defect("major", `${T} °C was too cool: most dopants are still sitting off the lattice sites, so they don't conduct.`));
                    } else if (T < 950) {
                        act = 0.6;
                        defs.push(defect("minor", `${T} °C only activated part of the implant.`));
                    }
                    if (T > 1100 || s > 45) {
                        defs.push(defect("minor", `${T} °C for ${s} s let the dopants diffuse deeper than needed.`));
                    }
                    if (gas === "o2") {
                        defs.push(defect("minor", "Oxygen grew a thin oxide on the surface during the anneal, eating a little of the doped layer."));
                    }
                    ss().data.act = act;
                    completeStep(defs, `<p>Annealed at ${T} °C for ${s} s in ${gas === "n2" ? "nitrogen" : "oxygen"}. The crystal is healed and the implanted atoms are locked into the lattice.</p>`);
                });
            });
        }


        /* ---------- The finished wafer, as the test gear sees it ---------- */

        function waferModel() {
            const d = ss().data;
            const subType = d.type || "p";
            const rho = d.rho || 10;
            const t = (d.thick || 725) - 2 * ((d.removed || 30) - 30);
            const layer = d.species === "P" || d.species === "As" ? "n" : d.species === "B" ? "p" : null;
            const junction = !!layer && layer !== subType;
            let rs;
            if (layer) {
                const Npk = (d.dose || 1e15) * 2e5;
                rs = 1 / (Q * mobility(layer, Npk) * (d.dose || 1e15) * (d.act || 1));
            } else {
                rs = rho / (t * 1e-4);
            }
            if (!junction && layer) {
                // the layer and substrate conduct in parallel
                const rsub = rho / (t * 1e-4);
                rs = 1 / (1 / rs + 1 / rsub);
            }
            return { subType: subType, front: layer || subType, rho: rho, t: t, rs: rs, junction: junction };
        }


        /* ---------- Step 13: hot-point probe ---------- */

        function openHotProbe() {

            const w = waferModel();
            const reads = {
                back: w.subType === "n" ? 0.4 + Math.random() : -(0.4 + Math.random()),
                front: w.front === "n" ? 0.6 + Math.random() : -(0.6 + Math.random())
            };
            const answers = {};

            api.openModal(`
                ${api.head("silicon", "Hot-Point Probe")}
                ${stepBadge()}
                ${cardHtml()}
                <p class="adv-lead">Touch a heated probe and a cold probe to the silicon, with a voltmeter between them (+ on the hot probe). Heat drives the majority carriers away from the hot tip. In n-type silicon the electrons leave, so the hot probe turns <strong>positive</strong>. In p-type the holes leave, so it turns <strong>negative</strong>.</p>
                ${["back", "front"].map((side) => `
                    <div class="adv-takeaway">
                        <p><strong>${side === "back" ? "Back side (the substrate)" : "Front side (the implanted layer)"}</strong>: the meter reads <strong>${reads[side] > 0 ? "+" : "−"}${Math.abs(reads[side]).toFixed(2)} mV</strong></p>
                        <div class="adv-button-row" data-side="${side}">
                            <button type="button" class="adv-btn secondary" data-type="n">n-type</button>
                            <button type="button" class="adv-btn secondary" data-type="p">p-type</button>
                        </div>
                        <p class="adv-result" id="hp-${side}"></p>
                    </div>`).join("")}
                <div id="hpDone"></div>`);

            api.modalBody().querySelectorAll("[data-side]").forEach((row) => {
                const side = row.dataset.side;
                row.querySelectorAll("[data-type]").forEach((b) => b.addEventListener("click", () => {
                    if (side in answers) {
                        return;
                    }
                    const truth = side === "back" ? w.subType : w.front;
                    answers[side] = b.dataset.type === truth;
                    ui.result("hp-" + side, answers[side] ? `✓ Right: ${truth}-type.` : `✗ It's ${truth}-type: a ${truth === "n" ? "positive" : "negative"} hot probe means ${truth}-type.`, answers[side]);
                    if ("back" in answers && "front" in answers) {
                        const msg = w.junction
                            ? "The two sides are opposite types, so there's a <strong>p–n junction</strong> between them: the heart of every diode and transistor."
                            : "Both sides are the same type, so there's <strong>no p–n junction</strong>. Something upstream went wrong: check the dopant in the crystal and the implant species.";
                        const defs = w.junction ? [] : [defect("major", "The wafer has no p–n junction: the front and back are the same type.")];
                        $("hpDone").innerHTML = `<div class="adv-takeaway"><p>${msg}</p></div><button type="button" class="adv-btn" id="hpNext">Continue</button>`;
                        $("hpNext").addEventListener("click", () => completeStep(defs, `<p>Back: ${w.subType}-type. Front: ${w.front}-type. ${w.junction ? "Junction confirmed." : "No junction."}</p>`));
                    }
                }));
            });
        }


        /* ---------- Step 14: four-point probe ---------- */

        function openFourPoint() {

            const w = waferModel();
            const I = 1e-3;
            const tcm = w.t * 1e-4;
            const vSub = I * w.rho / (4.532 * tcm);
            const vLay = I * w.rs / 4.532;
            const got = {};

            const optsRho = shuffle([
                { v: w.rho, ok: true },
                { v: 4.532 * vSub / I, ok: false },
                { v: 2 * Math.PI * 0.1 * vSub / I, ok: false },
                { v: 4.532 * w.t * vSub / I, ok: false }
            ]);
            const optsRs = shuffle([
                { v: w.rs, ok: true },
                { v: vLay / I, ok: false },
                { v: 2 * Math.PI * vLay / I, ok: false },
                { v: w.rs * 10, ok: false }
            ]);

            function shuffle(a) {
                return window.SCGames ? window.SCGames.shuffle(a) : a;
            }

            api.openModal(`
                ${api.head("silicon", "Four-Point Probe")}
                ${stepBadge()}
                <p class="adv-lead">Four needles in a row, 1 mm apart. Current I flows through the outer two, and the inner two measure the voltage V. Because no current flows through the voltage needles, contact resistance doesn't spoil the reading.</p>
                ${cardHtml()}
                <p class="adv-calib"><strong>About Ω/□ ("ohms per square"):</strong> sheet resistance is really just ohms. For a uniform thin film, any square of it, big or small, has the same resistance from one edge to the opposite edge. The □ is a reminder of that, not an area like cm². To get a material's <strong>resistivity</strong> (Ω·cm), multiply by the film's thickness.</p>
                <div class="adv-takeaway">
                    <p><strong>1. Back side, the substrate.</strong> I = 1.00 mA, V = <strong>${(vSub * 1000).toFixed(2)} mV</strong>, wafer thickness t = ${w.t} µm.</p>
                    <p>What is the substrate's resistivity ρ?</p>
                    <div class="adv-chips">${optsRho.map((o, i) => `<button type="button" class="adv-chip" data-q="rho" data-i="${i}">${fix(o.v)} Ω·cm</button>`).join("")}</div>
                    <p class="adv-result" id="fpRho"></p>
                </div>
                <div class="adv-takeaway">
                    <p><strong>2. Front side, the implanted layer.</strong> I = 1.00 mA, V = <strong>${(vLay * 1000).toFixed(2)} mV</strong>.</p>
                    <p>What is the layer's sheet resistance R<sub>s</sub>?</p>
                    <div class="adv-chips">${optsRs.map((o, i) => `<button type="button" class="adv-chip" data-q="rs" data-i="${i}">${fix(o.v)} Ω/□</button>`).join("")}</div>
                    <p class="adv-result" id="fpRs"></p>
                </div>
                <div id="fpDone"></div>`);

            api.modalBody().querySelectorAll("[data-q]").forEach((b) => b.addEventListener("click", () => {
                const q = b.dataset.q;
                if (q in got) {
                    return;
                }
                const list = q === "rho" ? optsRho : optsRs;
                const pick = list[Number(b.dataset.i)];
                const right = list.find((o) => o.ok);
                got[q] = pick.ok;
                b.classList.add("on");
                if (q === "rho") {
                    ui.result("fpRho", pick.ok
                        ? `✓ ρ = 4.532 × (V/I) × t = 4.532 × ${(vSub / I).toFixed(2)} Ω × ${tcm.toFixed(4)} cm = ${fix(right.v)} Ω·cm.`
                        : `✗ ρ = 4.532 × (V/I) × t, with t in centimeters (${tcm.toFixed(4)} cm). That gives ${fix(right.v)} Ω·cm.`, pick.ok);
                } else {
                    ui.result("fpRs", pick.ok
                        ? `✓ R<sub>s</sub> = 4.532 × ${(vLay / I).toFixed(2)} Ω = ${fix(right.v)} Ω/□.`
                        : `✗ R<sub>s</sub> = 4.532 × V/I = ${fix(right.v)} Ω/□.`, pick.ok);
                }
                if ("rho" in got && "rs" in got) {
                    $("fpDone").innerHTML = `<button type="button" class="adv-btn" id="fpNext">See the wafer report</button>`;
                    $("fpNext").addEventListener("click", () => finishWafer(got));
                }
            }));
        }

        function finishWafer(got) {

            const s = ss();
            const w = waferModel();
            const defs = allDefects();
            const rhoOk = w.subType === "p" && w.rho >= 7 && w.rho <= 13;
            const rsOk = w.junction && w.rs >= 30 && w.rs <= 150;
            if (!rhoOk) {
                defs.push(defect("major", `The substrate is ${w.subType}-type at ${fix(w.rho)} Ω·cm. The spec was p-type, 7–13 Ω·cm.`));
            }
            if (!rsOk && w.junction) {
                defs.push(defect("minor", `The layer measures ${fix(w.rs)} Ω/□, outside the 30–150 Ω/□ the recipe aims for.`));
            }
            const majors = defs.filter((d) => d.sev === "major").length;
            const stars = !defs.length ? 3 : !majors ? 2 : 1;
            const first = !s.wafer;
            let xp = 0;
            if (first) {
                xp = 200 + stars * 25;
            } else if (stars > s.best) {
                xp = (stars - s.best) * 25;
            }
            const quiz = Object.values(got).filter(Boolean).length;

            s.best = Math.max(s.best, stars);
            // every finished wafer brings the Kraken up (first fight or a rematch)
            s.krakenUp = true;
            s.wafer = { stars: stars, type: w.subType, rho: w.rho, rs: w.rs, junction: w.junction, made: Date.now() };
            resetRun();
            // one ingot slices into many wafers: 3 go in your bag
            api.bag.give("wafer", 3, true);
            if (xp) {
                api.gainXP(xp);
            }
            api.awardSiteXP("siliconwafer", 200);

            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">WAFER REPORT</p>
                    <h2>💠 200 mm Silicon Wafer</h2>
                    <p class="adv-stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
                    ${xp ? `<p class="adv-xp-big">+${xp} XP</p>` : ""}
                    <ul class="adv-stats" style="justify-content:center">
                        <li>Substrate <strong>${w.subType}-type, ${fix(w.rho)} Ω·cm</strong></li>
                        <li>Layer <strong>${fix(w.rs)} Ω/□</strong></li>
                        <li>Thickness <strong>${w.t} µm</strong></li>
                        <li>p–n junction <strong>${w.junction ? "yes" : "no"}</strong></li>
                        <li>Calculations <strong>${quiz}/2</strong></li>
                    </ul>
                    <p class="adv-bonus">🎒 +3 💿 silicon wafers in your bag (${api.bag.count("wafer")} now). Fabs in every town use them.</p>
                    <div class="adv-takeaway">
                        ${defs.length ? defs.map((d) => `<p>${d.sev === "major" ? "⚠️" : "•"} ${d.cause}</p>`).join("") : "<p>No defects from sand to test. A flawless wafer!</p>"}
                    </div>
                    <p class="adv-calib">🐙 <strong>${s.boss ? "Rematch!" : "Boss unlocked!"}</strong> The Impurity Kraken has surfaced at the end of the pier. Leave the fab, walk left along the wooden pier on the beach to its far end, face the water where the <strong>!</strong> is bouncing, and press A.</p>
                    <button type="button" class="adv-btn" data-close>Back to the fab</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();

            api.afterModal(() => api.say(s.boss ? [
                `${"★".repeat(stars)}${"☆".repeat(3 - stars)}! From beach sand to a tested wafer.`,
                "Uh oh, the impurities from this run have collected out at sea… The Impurity Kraken is back at the end of the pier for a rematch!"
            ] : [
                "From beach sand to a doped, tested wafer! You've done what whole industries do.",
                "But wait… the sea is churning. All the impurities we removed have collected out there…",
                "The Impurity Kraken has surfaced at the end of the pier! Go stop it!"
            ], "Dr. Silica"));
        }


        /* ---------- Recipe card and notes ---------- */

        function notesHtml() {
            return `
                <div class="adv-sheet">
                    <h3>Purification</h3>
                    <table><thead><tr><th>Compound</th><th>Boils at</th></tr></thead><tbody>
                        ${COMPONENTS.slice(0, 4).map((x) => `<tr><td>${x.f}</td><td>${x.bp} °C</td></tr>`).join("")}
                    </tbody></table>
                    <h3>Crystal growth</h3>
                    <p>Silicon melts at 1414 °C. Pull a thin neck first, then grow the body. Segregation coefficients: boron 0.8, phosphorus 0.35.</p>
                    <p>ρ = 1 / (q N μ), with q = 1.6×10<sup>−19</sup> C and μ ≈ 450 cm²/V·s for holes (lightly doped).</p>
                    <h3>Wafer standards</h3>
                    <table><thead><tr><th>Diameter</th><th>Thickness</th></tr></thead><tbody>
                        <tr><td>150 mm</td><td>675 µm</td></tr><tr><td>200 mm</td><td>725 µm</td></tr><tr><td>300 mm</td><td>775 µm</td></tr>
                    </tbody></table>
                    <h3>Testing</h3>
                    <p>Hot-point probe: hot tip positive → n-type; negative → p-type.</p>
                    <p>Four-point probe: R<sub>s</sub> = 4.532 V/I; ρ = R<sub>s</sub> × t.</p>
                </div>`;
        }

        function openRecipe() {
            const s = ss();
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
                ${api.head("silicon", "Dr. Silica's Recipe")}
                <p class="adv-lead">From beach sand to a doped, tested 200 mm wafer. Each station shows Dr. Silica's card with the settings to use. ${s.best ? `Best wafer: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}` : ""}</p>
                <div class="adv-button-row" style="margin-bottom:8px">
                    <button type="button" class="adv-btn" id="srNotes">📄 Dr. Silica's notes</button>
                    ${s.step > 0 ? '<button type="button" class="adv-btn secondary" id="srScrap">Scrap and restart</button>' : ""}
                    <button type="button" class="adv-btn secondary" data-close>Close</button>
                </div>
                ${html}`);

            $("srNotes").addEventListener("click", () => {
                api.closeModal();
                api.openModal(`${api.head("silicon", "Dr. Silica's Notes")}${notesHtml()}<div class="adv-button-row"><button type="button" class="adv-btn" data-close>Close</button></div>`);
            });
            const scrap = $("srScrap");
            if (scrap) {
                scrap.addEventListener("click", () => {
                    if (window.confirm("Scrap this run and start over from the beach?")) {
                        resetRun();
                        api.closeModal();
                        api.toast("Fresh start: back to the beach");
                    }
                });
            }
        }

        api.registerRecipe({
            id: "silicon",
            scenes: ["silicon", "waferfab"],
            available: () => ss().recipe,
            open: openRecipe,
            label: "Dr. Silica's sand-to-wafer run (14 steps)",
            progress: () => ss().step,
            total: STEPS.length,
            restart: resetRun
        });


        /* ---------- Using a fab tool ---------- */

        const TOOLS = {
            arc: { name: "Arc Furnace", open: openArc },
            hcl: { name: "HCl (Hydrogen Chloride) Reactor", open: openHCl },
            still: { name: "Distillation Column", open: openStill },
            siemens: { name: "Siemens Reactor", open: openSiemens },
            cz: { name: "CZ (Czochralski) Puller", open: openCZ },
            saw: { name: "Wire Saw", open: openSaw },
            etch: { name: "Etch Bench", open: openEtch },
            cmp: { name: "CMP (Chemical-Mechanical Polishing) Polisher", open: openCMP },
            rca: { name: "RCA Clean Bench", open: openRCA },
            implant: { name: "Ion Implanter", open: openImplant },
            rta: { name: "RTA (Rapid Thermal Anneal)", open: openRTA },
            hotprobe: { name: "Hot-Point Probe", open: openHotProbe },
            fourpp: { name: "Four-Point Probe", open: openFourPoint }
        };

        function useTool(tool) {
            const s = ss();
            if (!s.recipe) {
                api.say([`The ${TOOLS[tool].name}.`, "Dr. Silica, out on the beach, has the recipe for this fab."]);
                return;
            }
            const st = STEPS[s.step];
            if (st.tool !== tool) {
                api.say([`The ${TOOLS[tool].name}.`, `Your recipe says the next step is: ${st.name}.`, `That happens at the ${st.where}. Press R to read the recipe.`]);
                return;
            }
            if (!api.bag.pay(s, st.id, USES[st.id])) {
                return;
            }
            TOOLS[tool].open();
        }


        /* ---------- Drawing: the coast ---------- */

        function coastTile(c, x, y, ch, t) {
            const X = x * TILE;
            const Y = y * TILE;
            const r = api.hash(x, y);
            if (ch === "s") {
                rect(c, X, Y, TILE, TILE, "#ecd9a0");
                if (r < 60) {
                    rect(c, X + (r % 13) + 1, Y + (r % 11) + 2, 1, 1, "#cbb27a");
                    rect(c, X + ((r * 7) % 12) + 2, Y + ((r * 3) % 12) + 2, 1, 1, "#fff3cf");
                }
            } else if (ch === "v") {
                rect(c, X, Y, TILE, TILE, "#ecd9a0");
                const reach = 8 + Math.round(Math.sin(t / 700 + y * 0.6) * 4);
                rect(c, X, Y, reach, TILE, "#3a8ee0");
                rect(c, X + reach - 1, Y, 3, TILE, "#e8f6ff");
                rect(c, X + reach + 2, Y, 2, TILE, "#d9c890");
            } else if (ch === "k") {
                rect(c, X, Y, TILE, TILE, "#2f7fd6");
                rect(c, X, Y + 2, TILE, 12, "#a8774a");
                for (let i = 0; i < 4; i++) {
                    rect(c, X + i * 4, Y + 2, 1, 12, "#7d5634");
                }
                rect(c, X + 1, Y + 14, 2, 2, "#5a3d24");
                rect(c, X + 13, Y + 14, 2, 2, "#5a3d24");
            } else if (ch === "w") {
                rect(c, X, Y, TILE, TILE, "#2a6fc4");
                const off = Math.floor(t / 350 + x * 3 + y * 2) % 10;
                rect(c, X + off, Y + 4, 5, 1, "#6fb0f0");
                rect(c, X + ((off + 6) % 12), Y + 11, 4, 1, "#6fb0f0");
            } else {
                api.drawWorldTile(x, y, ch, t);
            }
        }

        function drawPalm(c, X, Y, W, H, t) {
            const sway = Math.sin(t / 900 + X) * 1.5;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.2)");
            for (let i = 0; i < 6; i++) {
                rect(c, X + 7 + Math.round(i * 0.4 + sway * (i / 6)), Y + 14 - i * 4, 3, 4, i % 2 ? "#8a5a3b" : "#a8774a");
            }
            const tx = X + 9 + sway;
            const ty = Y - 10;
            c.fillStyle = "#2e8a45";
            [[-12, 2], [12, 2], [-9, -5], [9, -5], [0, -9]].forEach(([dx, dy]) => {
                c.beginPath();
                c.moveTo(tx, ty);
                c.quadraticCurveTo(tx + dx * 0.6, ty + dy - 4, tx + dx, ty + dy + 4);
                c.quadraticCurveTo(tx + dx * 0.5, ty + dy, tx, ty + 2);
                c.fill();
            });
            rect(c, tx - 2, ty, 3, 3, "#6b4a2f");
            rect(c, tx + 1, ty + 1, 3, 3, "#6b4a2f");
        }

        function drawPile(color, speck) {
            return (c, X, Y) => {
                c.fillStyle = "rgba(0,0,0,0.18)";
                c.beginPath();
                c.ellipse(X + 8, Y + 13, 8, 3, 0, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = color;
                c.beginPath();
                c.moveTo(X, Y + 13);
                c.quadraticCurveTo(X + 8, Y - 4, X + 16, Y + 13);
                c.fill();
                for (let i = 0; i < 6; i++) {
                    rect(c, X + 4 + (i * 5) % 9, Y + 6 + (i * 3) % 6, 1, 1, speck);
                }
                rect(c, X + 11, Y + 2, 1, 9, "#6b4a2f");
                rect(c, X + 9, Y + 1, 5, 3, "#e0613f");
            };
        }

        function drawCastle(c, X, Y, W, H, t) {
            // a sand castle shaped like silicon's diamond-cubic lattice
            rect(c, X + 2, Y + 20, 28, 10, "#d9c07e");
            const pts = [[6, 18], [16, 12], [26, 18], [11, 6], [21, 6], [16, 0]];
            c.strokeStyle = "#b89c5e";
            c.lineWidth = 2;
            [[0, 1], [1, 2], [1, 3], [1, 4], [3, 5], [4, 5]].forEach(([a, b]) => {
                c.beginPath();
                c.moveTo(X + pts[a][0], Y + pts[a][1]);
                c.lineTo(X + pts[b][0], Y + pts[b][1]);
                c.stroke();
            });
            pts.forEach(([x, y]) => {
                c.fillStyle = "#ecd9a0";
                c.beginPath();
                c.arc(X + x, Y + y, 3, 0, Math.PI * 2);
                c.fill();
                rect(c, X + x - 1, Y + y - 2, 1, 1, "#fff3cf");
            });
            rect(c, X + 15, Y - 8, 1, 8, "#6b4a2f");
            rect(c, X + 16, Y - 8, 5, 3, Math.floor(t / 400) % 2 ? "#54e0c7" : "#7fb2ff");
        }

        function drawQuartz(c, X, Y) {
            rect(c, X + 2, Y + 12, 12, 3, "rgba(0,0,0,0.2)");
            [[3, 4, 4, 9], [7, 0, 4, 13], [11, 5, 3, 8]].forEach(([x, y, w, h]) => {
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.moveTo(X + x - 0.5, Y + y + h);
                c.lineTo(X + x - 0.5, Y + y + 2);
                c.lineTo(X + x + w / 2, Y + y - 1);
                c.lineTo(X + x + w + 0.5, Y + y + 2);
                c.lineTo(X + x + w + 0.5, Y + y + h);
                c.fill();
                c.fillStyle = "#e8f4ff";
                c.beginPath();
                c.moveTo(X + x, Y + y + h);
                c.lineTo(X + x, Y + y + 2);
                c.lineTo(X + x + w / 2, Y + y);
                c.lineTo(X + x + w, Y + y + 2);
                c.lineTo(X + x + w, Y + y + h);
                c.fill();
                rect(c, X + x + 1, Y + y + 3, 1, h - 4, "#ffffff");
            });
        }

        function drawSil(c, X, Y, t) {
            const bob = Math.round(Math.sin(t / 320 + X) * 1);
            const cx = X + 8;
            const cy = Y + 8 + bob;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.22)");
            c.strokeStyle = "#1a2033";
            c.lineWidth = 2;
            [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
                c.beginPath();
                c.moveTo(cx, cy);
                c.lineTo(cx + dx * 7, cy + dy * 6);
                c.stroke();
                rect(c, cx + dx * 7 - 1.5, cy + dy * 6 - 1.5, 3, 3, "#9fb3d9");
            });
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.arc(cx, cy, 6.5, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#8f9fc2";
            c.beginPath();
            c.arc(cx, cy, 5.5, 0, Math.PI * 2);
            c.fill();
            rect(c, cx - 3, cy - 4, 2, 1, "rgba(255,255,255,0.6)");
            rect(c, cx - 3, cy - 1, 2, 2, "#ffffff");
            rect(c, cx + 1, cy - 1, 2, 2, "#ffffff");
            rect(c, cx - 2, cy, 1, 1, "#1a2033");
            rect(c, cx + 2, cy, 1, 1, "#1a2033");
            rect(c, cx - 1, cy + 3, 3, 1, "#1a2033");
        }

        function drawCrab(c, X, Y, t) {
            const step = Math.round(Math.sin(t / 200) * 1.5);
            const cx = X + 8 + step;
            const cy = Y + 10;
            rect(c, cx - 6, cy + 4, 12, 2, "rgba(0,0,0,0.2)");
            rect(c, cx - 5, cy - 2, 10, 6, "#1a2033");
            rect(c, cx - 4, cy - 1, 8, 4, "#ff6b4a");
            rect(c, cx - 8, cy - 5, 3, 3, "#ff6b4a");
            rect(c, cx + 5, cy - 5, 3, 3, "#ff6b4a");
            rect(c, cx - 2, cy - 4, 1, 2, "#1a2033");
            rect(c, cx + 1, cy - 4, 1, 2, "#1a2033");
            [-5, -3, 3, 5].forEach((dx) => rect(c, cx + dx, cy + 3, 1, 2, "#c94a2f"));
        }

        function drawGull(c, X, Y, t) {
            const hop = Math.floor(t / 1500) % 3 === 0 ? -2 : 0;
            const cx = X + 8;
            const cy = Y + 9 + hop;
            rect(c, cx - 5, cy + 5 - hop, 10, 2, "rgba(0,0,0,0.18)");
            rect(c, cx - 4, cy - 1, 8, 5, "#f5f7ff");
            rect(c, cx - 4, cy - 1, 4, 2, "#a9b2d0");
            rect(c, cx + 2, cy - 4, 4, 4, "#f5f7ff");
            rect(c, cx + 5, cy - 3, 3, 1, "#ffb84a");
            rect(c, cx + 4, cy - 3, 1, 1, "#1a2033");
            rect(c, cx - 1, cy + 4, 1, 2, "#ffb84a");
            rect(c, cx + 2, cy + 4, 1, 2, "#ffb84a");
        }

        function drawKraken(c, ox, oy, s, t) {
            const px = (x, y, w, h, col) => rect(c, ox + x * s, oy + y * s, w * s, h * s, col);
            const bob = Math.round(Math.sin(t / 500) * 1);
            // tentacles
            for (let i = 0; i < 5; i++) {
                const sw = Math.round(Math.sin(t / 260 + i) * 2);
                for (let j = 0; j < 5; j++) {
                    px(3 + i * 6 + Math.round(sw * j / 4), 18 + j * 3 + bob, 3, 3, j % 2 ? "#6a3fa0" : "#7d4fb8");
                }
            }
            // head
            px(6, 2 + bob, 20, 18, "#2a1440");
            px(7, 3 + bob, 18, 16, "#7d4fb8");
            px(9, 4 + bob, 6, 3, "#a77fe0");
            // eyes
            px(10, 10 + bob, 5, 5, "#ffffff");
            px(18, 10 + bob, 5, 5, "#ffffff");
            px(12, 12 + bob, 2, 2, "#e0233c");
            px(20, 12 + bob, 2, 2, "#e0233c");
            px(10, 9 + bob, 5, 1, "#2a1440");
            px(18, 9 + bob, 5, 1, "#2a1440");
            // impurity tags stuck to it
            const tag = (x, y, col) => {
                px(x, y + bob, 4, 3, "#1a2033");
                px(x + 0.5, y + 0.5 + bob, 3, 2, col);
            };
            tag(1, 6, "#c8ceda");
            tag(27, 5, "#ffb84a");
            tag(24, 16, "#5be38a");
        }

        function toolObject(tool, label, x, y, w, h, draw) {
            return {
                kind: "si-" + tool,
                x: x, y: y, w: w, h: h,
                label: label,
                draw: (c, X, Y, W, H, t) => {
                    draw(c, X, Y, W, H, t);
                    if (isCurrentTool(tool)) {
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
                },
                prompt: "A: Use " + TOOLS[tool].name,
                use: () => useTool(tool)
            };
        }

        const D = {
            arc(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 6, W - 4, H - 7, "#5d6577");
                rect(c, X + 6, Y + 14, W - 12, 10, `rgba(255, ${150 + 50 * Math.sin(t / 200)}, 60, 0.9)`);
                [8, 20, 32].forEach((dx) => rect(c, X + dx, Y - 6, 4, 18, "#3a3f4b"));
            },
            hcl(c, X, Y, W, H) {
                api.box(X + 8, Y - 6, W - 16, H + 4, "#aab3c4");
                rect(c, X + 11, Y, W - 22, 14, "#2a3448");
                rect(c, X + 12, Y + 8, W - 24, 6, "#8f98aa");
                rect(c, X + 4, Y + 20, 6, 4, "#5be38a");
            },
            still(c, X, Y, W, H) {
                api.box(X + 11, Y - 14, 10, H + 12, "#d9e2f0");
                for (let i = 0; i < 6; i++) {
                    rect(c, X + 12, Y - 10 + i * 6, 8, 1, "#8f98aa");
                }
                rect(c, X + 21, Y - 12, 8, 2, "#d9e2f0");
                rect(c, X + 27, Y - 12, 2, 20, "#d9e2f0");
                rect(c, X + 24, Y + 8, 8, 8, "#cfe8ff");
            },
            siemens(c, X, Y, W, H, t) {
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 10, W / 2 - 4, 18, 0, Math.PI, 0);
                c.fill();
                c.fillStyle = "rgba(220,235,255,0.5)";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 10, W / 2 - 5, 17, 0, Math.PI, 0);
                c.fill();
                const g = 0.6 + 0.3 * Math.sin(t / 400);
                rect(c, X + 14, Y - 4, 4, 18, `rgba(255, 140, 70, ${g})`);
                rect(c, X + 30, Y - 4, 4, 18, `rgba(255, 140, 70, ${g})`);
                rect(c, X + 14, Y - 6, 20, 3, `rgba(255, 140, 70, ${g})`);
                api.box(X + 2, Y + 10, W - 4, H - 11, "#5d6577");
            },
            cz(c, X, Y, W, H, t) {
                api.box(X + 14, Y - 14, 20, 16, "#aab3c4");
                api.box(X + 4, Y + 2, W - 8, H - 3, "#c9cfdb");
                rect(c, X + 20, Y + 6, 8, 8, "#1a2033");
                rect(c, X + 22, Y + 8, 4, 4, `rgba(255, 160, 60, ${0.6 + 0.3 * Math.sin(t / 300)})`);
                rect(c, X + 23, Y - 20, 2, 8, "#5d6577");
            },
            saw(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                rect(c, X + 6, Y + 5, W - 12, 6, "#8f98aa");
                for (let i = 0; i < 8; i++) {
                    rect(c, X + 7 + i * 4, Y + 3, 1, 10, `rgba(220,230,255,${0.4 + 0.4 * Math.sin(t / 60 + i)})`);
                }
            },
            etch(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                ["#f2d58a", "#cfe8ff", "#e3f6ff"].forEach((col, i) => {
                    rect(c, X + 3 + i * 15, Y + 4, 12, 8, "#d9e2f0");
                    rect(c, X + 4 + i * 15, Y + 6, 10, 5, col);
                });
            },
            cmp(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                c.fillStyle = "#3a4256";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 8, 14, 5, 0, 0, Math.PI * 2);
                c.fill();
                const a = t / 150;
                rect(c, X + W / 2 + Math.cos(a) * 8 - 3, Y + 6 + Math.sin(a) * 2, 6, 3, "#e3e7ef");
            },
            rca(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                ["#cfe8ff", "#f5e8b8", "#e3f6ff"].forEach((col, i) => {
                    rect(c, X + 3 + i * 15, Y + 4, 12, 8, "#d9e2f0");
                    rect(c, X + 4 + i * 15, Y + 6, 10, 5, col);
                });
            },
            implant(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 4, W - 4, H - 5, "#aab3c4");
                rect(c, X + 6, Y + 12, W - 24, 6, "#5d6577");
                for (let i = 0; i < 5; i++) {
                    rect(c, X + 8 + ((t / 8 + i * 9) % (W - 30)), Y + 14, 3, 2, "#ffd84a");
                }
                api.box(X + W - 16, Y + 8, 10, 16, "#8f98aa");
            },
            rta(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 2, W - 4, H - 3, "#c9cfdb");
                rect(c, X + 6, Y + 5, W - 12, 6, `rgba(255, 230, 160, ${0.5 + 0.4 * Math.sin(t / 250)})`);
            },
            hotprobe(c, X, Y, W, H) {
                api.box(X + 1, Y + 4, W - 2, H - 4, "#c9cfdb");
                rect(c, X + 8, Y - 6, 2, 12, "#ff6b5a");
                rect(c, X + 20, Y - 6, 2, 12, "#7fb2ff");
                rect(c, X + 5, Y + 7, 22, 4, "#8f98aa");
            },
            fourpp(c, X, Y, W, H) {
                api.box(X + 1, Y + 4, W - 2, H - 4, "#c9cfdb");
                [14, 20, 26, 32].forEach((dx) => rect(c, X + dx, Y - 6, 2, 12, "#3b4458"));
                rect(c, X + 10, Y + 7, 28, 4, "#8f98aa");
                rect(c, X + 3, Y + 6, 6, 5, "#2a3448");
            }
        };

        function decor(kind, x, y, w, h, draw, lines) {
            return { kind: kind, x: x, y: y, w: w, h: h, draw: draw, lines: lines, prompt: "A: Look" };
        }


        /* ---------- Boss: the Impurity Kraken ---------- */

        const KRAKEN_QS = {
            purify: [
                { q: "What pulls the oxygen off quartz (SiO₂) in the arc furnace?", a: ["Carbon, at around 2000 °C", "Hydrogen at room temperature", "Electricity alone", "Sea water"], why: "SiO₂ + 2 C → Si + 2 CO. The carbon comes from coal, coke and wood chips." },
                { q: "Why is silicon turned into trichlorosilane (SiHCl₃) to purify it?", a: ["It's a liquid that can be distilled to separate the impurities", "It's easier to ship", "It's a better semiconductor", "It glows so impurities are visible"], why: "SiHCl₃ boils at 31.8 °C, so fractional distillation can separate it from other chlorides." },
                { q: "What flows over the hot rods in a Siemens reactor?", a: ["Trichlorosilane and hydrogen", "Liquid silicon", "Argon and oxygen", "Sand and water"], why: "SiHCl₃ + H₂ react on rods near 1100 °C, depositing ultra-pure polysilicon." },
                { q: "Electronic-grade polysilicon is about how pure?", a: ["Nine nines or better (99.9999999%+)", "About 90%", "About 99%", "Exactly 100%"], why: "Chips need impurities at parts-per-billion levels or below." }
            ],
            crystal: [
                { q: "At what temperature does silicon melt?", a: ["About 1414 °C", "About 414 °C", "About 2414 °C", "About 100 °C"], why: "The CZ heater keeps the melt just above 1414 °C." },
                { q: "Why pull a thin neck at the start of Czochralski growth?", a: ["So dislocations grow out to the surface and stop", "To save silicon", "To cool the seed", "To add more dopant"], why: "The narrow neck lets thermal-shock dislocations escape before the crystal widens (Dash necking)." },
                { q: "Boron's segregation coefficient in silicon is about 0.8. What does that mean?", a: ["The crystal takes in a bit less boron than the melt holds, so the melt slowly gets richer", "Boron evaporates from the melt", "80% of the boron sinks", "Boron can't dissolve in silicon"], why: "k = C(solid)/C(liquid) < 1, so dopant builds up in the shrinking melt and the ingot's end is more heavily doped." },
                { q: "Where does the oxygen in CZ silicon come from?", a: ["The quartz crucible slowly dissolving into the melt", "Air leaks", "The seed crystal", "The dopant"], why: "The fused-silica crucible releases oxygen into the melt, typically around 10¹⁸ atoms/cm³ in the crystal." }
            ],
            wafer: [
                { q: "How thick is a standard 200 mm wafer?", a: ["About 725 µm", "About 72.5 µm", "About 7.25 mm", "About 2 mm"], why: "150 mm: 675 µm, 200 mm: 725 µm, 300 mm: 775 µm." },
                { q: "What does SC-1 in an RCA clean mainly remove?", a: ["Organic residue and particles", "Metal ions", "The silicon itself", "Photoresist only"], why: "Ammonia and peroxide oxidize organics and lift particles. SC-2 handles metals." },
                { q: "What does SC-2 mainly remove?", a: ["Metal ions", "Particles", "Native oxide", "Water"], why: "The HCl and peroxide mix dissolves metal contamination like iron and sodium." },
                { q: "Why doesn't HF alone etch silicon?", a: ["HF only dissolves oxide; silicon must be oxidized first", "HF is too weak an acid", "Silicon is coated in gold", "It does etch it very fast"], why: "Mix in an oxidizer like nitric acid and the HF can dissolve the oxide as it forms." }
            ],
            dope: [
                { q: "Why tilt the wafer about 7° during ion implantation?", a: ["To keep ions from channeling deep along crystal rows", "To make the beam brighter", "To dry the wafer", "To save time"], why: "Open channels in the crystal let ions slip deep. Tilting blocks them." },
                { q: "Why anneal after implanting?", a: ["To repair crystal damage and put dopants on lattice sites", "To remove the dopants", "To grow a thick oxide", "To cool the wafer"], why: "Activation: dopants only donate carriers when they sit on lattice sites." },
                { q: "On a hot-point probe, n-type silicon makes the hot probe…", a: ["Positive", "Negative", "Zero", "Very hot only"], why: "Electrons diffuse away from the hot tip, leaving it positively charged." },
                { q: "A four-point probe gives sheet resistance as…", a: ["R<sub>s</sub> = 4.532 × V / I", "R<sub>s</sub> = V × I", "R<sub>s</sub> = I / V", "R<sub>s</sub> = 2 × V / I"], why: "4.532 = π / ln 2, the geometric factor for a thin, wide layer." }
            ]
        };

        function krakenBattle() {
            return {
                foeName: "The Impurity Kraken",
                foeTag: "Contamination · Lv 5",
                foeSize: 32,
                fieldClass: "adv-field-sea",
                drawFoe: (c, t) => drawKraken(c, 0, 0, 1, t),
                foeMax: 200,
                foePower: 0.8,
                meMax: 120,
                moves: [
                    { type: "purify", name: "Distill", mult: 1.75, label: "Purification", icon: "⚗️", special: "dep", cls: "dep", effect: "Direct hit! Fractional distillation boils its impurities right out." },
                    { type: "crystal", name: "Crystal Pull", mult: 1, label: "Crystal growth", icon: "💎", special: "litho", cls: "litho", effect: "A perfect single crystal leaves it nowhere to hide." },
                    { type: "wafer", name: "RCA Wash", mult: 1.5, label: "Wafering", icon: "🧼", special: "etch", cls: "etch", effect: "It's effective! SC-2 rips the metal ions off its tentacles." },
                    { type: "dope", name: "Probe Test", mult: 0.5, focus: true, label: "Doping & test", icon: "🔬", special: "inspect", cls: "inspect", effect: "You measured exactly where its impurities sit. Your next hit does 1.5× damage!" }
                ],
                questions: KRAKEN_QS,
                attacks: [
                    { name: "Iron Grip", text: "Iron atoms clamped onto your wafer, and carrier lifetime plummeted!" },
                    { name: "Boron Squirt", text: "A jet of boron ink shifted your resistivity!" },
                    { name: "Sodium Splash", text: "Salty sodium ions splashed onto your oxide!" }
                ],
                intro: [
                    "The sea churns… <strong>The Impurity Kraken</strong> rises at the end of the pier!",
                    "It's made of every impurity ever removed from silicon. Answer to fight it off!"
                ],
                runText: "You ran back down the pier. The Kraken sinks beneath the waves… for now.",
                loseTitle: "The Kraken dragged you under",
                loseTip: "Tip: the Kraken is weak to <strong>Distill</strong> and <strong>RCA Wash</strong>. A <strong>Probe Test</strong> first makes your next hit 1.5× stronger.",
                winLines: ss().boss ? [
                    "The Impurity Kraken dissolves into clean sea foam again!",
                    "The pier is safe. Rematch won!"
                ] : [
                    "The Impurity Kraken dissolves into clean sea foam!",
                    "📜 Dr. Silica hands you the Silicon Beach Certificate of Completion!"
                ],
                onWin: () => {
                    const s = ss();
                    const first = !s.boss;
                    s.boss = true;
                    s.krakenUp = false;
                    api.save().badges.silicon = true;
                    api.writeSave();
                    api.updateHud();
                    api.gainXP(first ? 150 : 25);
                    if (first) {
                        api.awardSiteXP("siliconboss", 150);
                    }
                    api.afterModal(() => api.say(!first ? ["Back into the deep it goes! Make another wafer and it'll surface again for another round."] : [
                        "You beat the Impurity Kraken! The beach has never been cleaner.",
                        "Every chip in the world starts the way yours did: sand, fire, distillation and one perfect crystal. Here's your Silicon Beach Certificate of Completion!",
                        "The road east to Fab Valley is open now. Take your wafers with you: the Foundry needs them. Come back whenever you run low."
                    ], "Dr. Silica"));
                    return `
                        <div class="adv-complete">
                            <p class="eyebrow">SEA CLEARED</p>
                            <h2>${first ? "📜 Certificate of Completion" : "🐙 Rematch Won"}</h2>${first ? api.certificate("silicon") : ""}
                            <p class="adv-xp-big">+${first ? 150 : 25} XP</p>
                            <div class="adv-takeaway">
                                <p>Silicon's enemy is contamination. A few iron atoms per billion can ruin transistors, and stray boron or phosphorus changes the doping.</p>
                                <p>That's why chipmaking spends so much effort on purification: distillation to nine-plus nines, single-crystal growth, RCA cleans, and cleanrooms with almost no particles.</p>
                            </div>
                            <button type="button" class="adv-btn" data-close>Back to the beach</button>
                        </div>`;
                }
            };
        }


        /* ---------- Scenes ---------- */

        api.SCENES.silicon = {
            id: "silicon",
            label: "Silicon Beach",
            outdoor: true,
            solid: "TwBSWv",
            grid: [
                "wwwvsssTTTTTTTTTTTTT",
                "wwwvsss.....f......T",
                "wwwvsss.BBBBBBBBB..T",
                "wwwvsss.BBBBBBBBB..T",
                "wwwvsss.BBBBBBBBB..T",
                "wwwvsss.BBBBDBBBB..T",
                "wwwvsss.....p......T",
                "kkkksssppppppppppppp",
                "wwwvsss......f.....T",
                "wwwvsss............T",
                "wwwvsss............T",
                "wwwvsss....f.......T",
                "wwwvsss............T",
                "wwwvsss.f......f...T",
                "wwwvsssTTTTTTTTTTTTT"
            ],
            drawTile: coastTile,
            edges: {
                right: {
                    scene: "world", x: 0, y: 7,
                    locked: () => !api.save().badges.silicon,
                    lockedText: [
                        "The road east climbs up to Fab Valley and its Foundry.",
                        "A sign says: \"Silicon Beach Certificate holders only.\" Make your first wafers and beat the Impurity Kraken first."
                    ]
                }
            },
            buildings: [
                {
                    id: "waferfab",
                    sign: "SILICON WAFER FAB",
                    x: 8, y: 2, w: 9, h: 4,
                    door: { x: 12, y: 5 },
                    wall: "#e3e9f2",
                    roof: "#4a6fa5",
                    locked: () => false
                }
            ],
            npcs: [
                {
                    id: "silica",
                    name: "Dr. Silica",
                    x: 8, y: 8,
                    dir: "down",
                    look: { suit: "#f3e3c3", accent: "#4a6fa5", visor: "#54e0c7" },
                    talk: silicaTalk
                },
                {
                    id: "sil",
                    name: "Sil the Silicon Atom",
                    x: 14, y: 9,
                    dir: "down",
                    draw: (c, X, Y, t) => drawSil(c, X, Y, t),
                    talk: () => [
                        "Hiya! I'm a silicon atom, carbon's cousin one row down the periodic table.",
                        "I have four valence electrons too, so in a crystal I bond to four neighbors in a diamond-shaped lattice. Swap one of us for a boron or phosphorus atom and you change how the crystal conducts!"
                    ]
                },
                {
                    id: "crab",
                    name: "Sandy the Crab",
                    x: 6, y: 9,
                    dir: "down",
                    draw: (c, X, Y, t) => drawCrab(c, X, Y, t),
                    talk: () => [
                        "*click click* This whole beach is sand, and sand is mostly quartz: silicon dioxide, SiO₂!",
                        "Not every pile is good quartz, though. Some of it is crushed seashells. Assay before you scoop!"
                    ]
                },
                {
                    id: "gull",
                    name: "Gale the Seagull",
                    x: 10, y: 12,
                    dir: "down",
                    draw: (c, X, Y, t) => drawGull(c, X, Y, t),
                    talk: () => [
                        "Squawk! Silicon Valley in California got its name from the silicon chips made there.",
                        "But every one of those chips started out as sand, and sand is what Silicon Beach has plenty of. Squawk!"
                    ]
                }
            ],
            objects: [
                api.bag.stockroom({ label: "Supply shed", items: ["hcl", "rca", "dopant"], x: 16, y: 10, w: 2, h: 2, outdoor: true }),
                api.bag.pickup({ id: "beach-wafer", item: "wafer", x: 5, y: 12, text: "Something glints in the sand… a stray silicon wafer, still shiny!" }),
                {
                    kind: "sand-quartz", x: 5, y: 3, w: 1, h: 1, draw: drawPile("#f4ead0", "#ffffff"),
                    prompt: "A: Assay the white sand", use: () => openSand("quartz")
                },
                {
                    kind: "sand-shell", x: 4, y: 10, w: 1, h: 1, draw: drawPile("#f2c3c0", "#ffffff"),
                    prompt: "A: Assay the pink sand", use: () => openSand("shell")
                },
                {
                    kind: "sand-iron", x: 6, y: 12, w: 1, h: 1, draw: drawPile("#3a3f4b", "#8f98aa"),
                    prompt: "A: Assay the black sand", use: () => openSand("iron")
                },
                decor("palm", 6, 1, 1, 1, drawPalm, ["A palm tree. Coconuts aren't made of silicon, sadly."]),
                decor("palm", 5, 13, 1, 1, drawPalm, ["A palm tree, swaying in the sea breeze."]),
                decor("palm", 18, 10, 1, 1, drawPalm, ["A palm tree. Its leaves rustle like a cleanroom air shower."]),
                decor("castle", 11, 10, 2, 2, drawCastle, [
                    "A sand castle built like silicon's crystal lattice: every atom bonded to four neighbors in a pyramid shape (a tetrahedron).",
                    "It's the same diamond-cubic structure diamond has."
                ]),
                decor("quartz", 16, 12, 1, 1, drawQuartz, [
                    "A cluster of quartz crystals: SiO₂ that grew slowly enough to form six-sided points.",
                    "Beach sand is mostly tiny worn-down bits of quartz like this."
                ]),
                {
                    kind: "kraken", x: 0, y: 5, w: 2, h: 2,
                    active: () => !!ss().krakenUp || (!!ss().wafer && !ss().boss),
                    draw: (c, X, Y, W, H, t) => {
                        drawKraken(c, X, Y, 1, t);
                        const bob = Math.round(Math.sin(t / 250) * 2);
                        rect(c, X + 12, Y - 16 + bob, 9, 11, "#1a2033");
                        rect(c, X + 13, Y - 15 + bob, 7, 9, "#ffd84a");
                        c.fillStyle = "#1a2033";
                        c.font = "bold 8px sans-serif";
                        c.textAlign = "center";
                        c.textBaseline = "middle";
                        c.fillText("!", X + 16.5, Y - 10 + bob);
                    },
                    prompt: "A: Battle the Impurity Kraken",
                    use: () => api.say(
                        ["The water at the end of the pier bubbles and froths…", "Get ready to battle!"],
                        "",
                        () => api.openBattle(krakenBattle())
                    )
                }
            ]
        };

        api.SCENES.waferfab = {
            id: "waferfab",
            label: "Silicon Wafer Fab",
            grid: api.interiorRows(),
            floor: "#dde3ec",
            exitTo: { scene: "silicon", x: 12, y: 6 },
            objects: [
                toolObject("arc", "Arc furnace", 1, 2, 3, 2, D.arc),
                toolObject("hcl", "HCl reactor", 5, 2, 2, 2, D.hcl),
                toolObject("still", "Distiller", 8, 2, 2, 2, D.still),
                toolObject("siemens", "Siemens", 11, 2, 3, 2, D.siemens),
                toolObject("cz", "CZ puller", 15, 2, 3, 2, D.cz),
                toolObject("saw", "Wire saw", 1, 6, 3, 1, D.saw),
                toolObject("etch", "Etch", 5, 6, 3, 1, D.etch),
                toolObject("cmp", "CMP", 9, 6, 3, 1, D.cmp),
                toolObject("rca", "RCA clean", 13, 6, 3, 1, D.rca),
                toolObject("implant", "Implanter", 1, 10, 4, 2, D.implant),
                toolObject("rta", "RTA", 7, 10, 3, 1, D.rta),
                toolObject("hotprobe", "Hot probe", 12, 10, 2, 1, D.hotprobe),
                toolObject("fourpp", "4-pt probe", 15, 10, 3, 1, D.fourpp)
            ],
            npcs: []
        };

        function silicaTalk() {

            const s = ss();
            const name = api.currentChar() ? api.currentChar().name : "engineer";

            if (!s.recipe) {
                return {
                    lines: [
                        `Welcome to Silicon Beach, ${name}! I'm Dr. Silica.`,
                        "Every computer chip on Earth starts as sand like this beach. Quartz sand is silicon dioxide, SiO₂.",
                        "In my wafer fab we turn it into pure silicon, grow one perfect crystal, slice it into wafers, dope it and test it.",
                        "Here's the recipe. Step one is right here: assay the sand piles and collect the good quartz.",
                        "📋 Recipe added! Press R or tap Recipe to read it."
                    ],
                    done: () => {
                        s.recipe = true;
                        api.writeSave();
                        api.refreshRecipe();
                    }
                };
            }

            if (s.krakenUp || (s.wafer && !s.boss)) {
                return ["The Impurity Kraken is out at the end of the pier! Go!"];
            }

            if (s.step === 0 && s.wafer) {
                return [
                    `Your best wafer: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}. Want to make another? Start with the sand piles.`
                ];
            }

            const st = STEPS[s.step];
            const tips = {
                sand: "Assay each pile with the XRF analyzer before you collect any.",
                arc: "About 2000 °C, and two moles of carbon for every mole of SiO₂.",
                hcl: "Hydrogen chloride at about 300 °C makes the most trichlorosilane.",
                distill: "Trichlorosilane boils at 31.8 °C. Keep your window tight around it, and distill more than once.",
                siemens: "Trichlorosilane plus hydrogen, rods near 1100 °C.",
                cz: "Work out the boron level from ρ = 1/(qNμ). And don't forget the neck!",
                saw: "200 mm wafers are 725 µm thick. Don't rush the wire.",
                etch: "Lap first, then etch about 30 µm per side. HF alone won't touch silicon.",
                cmp: "Colloidal silica, gentle pressure, and give it time.",
                rca: "SC-1, HF dip, SC-2, and always finish with a rinse.",
                implant: "Phosphorus makes an n-type layer on your p-type wafer. Tilt about 7°.",
                rta: "Around 1000 °C for about 10 seconds, in nitrogen.",
                hotprobe: "Hot probe positive means n-type.",
                fourpp: "Sheet resistance is 4.532 V/I. Multiply by the thickness for resistivity."
            };
            return [`Next step: ${st.name}.`, `${st.id === "sand" ? "The sand piles are on the beach." : "Head into the wafer fab."} ${tips[st.id]}`];
        }
    });

})();
