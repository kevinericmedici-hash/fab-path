/* ========================================
   FAB VALLEY ADVENTURE: FROSTBIT
   The last town, reached by the Spark Line
   from Carbon City once you hold the Carbon
   City certificate. Dr. Flux builds a
   superconducting transmon qubit, and the
   work is split across three bays:
     Clean & Metal Bay - HF-dip a high-
       resistivity silicon wafer, sputter the
       superconductor, pattern the circuit and
       size the readout resonator
     Junction Bay - e-beam a Dolan bridge in
       bilayer resist, double-angle shadow
       evaporation with an oxidation in
       between, lift-off
     Cryo Lab - junction resistance and the
       predicted frequency, shielded package,
       dilution fridge cooldown, spectroscopy
       and a T1 measurement
   Boss: The Decoherence Wraith.

   Facts follow the Quantum Computing Chips
   course (units 10, 11, 14: 4–8 GHz, about
   10 mK, T1 of hundreds of µs, 37% left
   after one T1). The fab details (bilayer
   MMA/PMMA, ±20° evaporation, Ic·Rn ≈ 280 µV
   for aluminum, EJ/h ≈ 497 GHz per µA,
   EC ≈ 250 MHz, the oxidation model and the
   T1 penalties) are teaching values.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const TILE = api.TILE;
        const rect = api.rect;
        const ui = api.ui;
        const $ = (id) => document.getElementById(id);

        api.TYPES.quantum = { label: "Qubits", icon: "❄️" };

        const BAYS = {
            metal: "Clean & Metal Bay",
            junction: "Junction Bay",
            cryo: "Cryo Lab"
        };


        /* ---------- Recipe ---------- */

        const PHASES = {
            circuit: "The circuit (Clean & Metal Bay)",
            junction: "The Josephson junction (Junction Bay)",
            cryo: "Cold and quantum (Cryo Lab)"
        };

        const STEPS = [
            {
                id: "clean", phase: "circuit", tool: "bench", bay: "metal", short: "Substrate", where: "substrate bench",
                name: "Pick a high-resistivity silicon wafer and strip its oxide in an HF dip",
                card: ["Use <strong>high-resistivity silicon</strong> (over 10,000 Ω·cm). Ordinary doped silicon is full of free charges that soak up the qubit's energy.",
                    "Dip it in <strong>HF</strong> for about a minute to strip the native oxide. Oxides are full of tiny defects that steal energy from qubits and shorten T₁."]
            },
            {
                id: "base", phase: "circuit", tool: "sputter", bay: "metal", short: "Superconductor", where: "sputter tool",
                name: "Sputter about 150 nm of a superconductor: niobium or aluminum",
                card: ["Metal: <strong>niobium</strong> (superconducts below 9.2 K) or <strong>aluminum</strong> (below 1.2 K). Copper and gold never superconduct.",
                    "Thickness: about <strong>150 nm</strong> (100–200 nm)."]
            },
            {
                id: "pattern", phase: "circuit", tool: "litho", bay: "metal", short: "Pattern the circuit", where: "litho & etch station",
                name: "Pattern the capacitor pads, feedline and a 7 GHz readout resonator",
                card: ["Each qubit has a <strong>readout resonator</strong>: a strip of superconductor a quarter of a wavelength long.",
                    "Its frequency is f = c ÷ (4 L √ε<sub>eff</sub>). On silicon, √ε<sub>eff</sub> ≈ 2.52.",
                    "Aim for about <strong>7 GHz</strong>, well away from the qubit's 4–6 GHz, so reading the qubit doesn't disturb it. That works out to about <strong>4.3 mm</strong>."]
            },
            {
                id: "ebeam", phase: "junction", tool: "ebeam", bay: "junction", short: "E-beam the junction", where: "e-beam writer",
                name: "Write the junction with e-beam lithography in a bilayer resist, about 200 nm wide",
                card: ["Resist: a <strong>bilayer of MMA under PMMA</strong>. The bottom layer develops wider, leaving a free-standing resist bridge (a Dolan bridge) over a gap.",
                    "Light can't print features this small; an electron beam can.",
                    "Junction width: about <strong>200 nm</strong>. Its area sets how much current the junction carries, and that sets the qubit's frequency."]
            },
            {
                id: "shadow", phase: "junction", tool: "evap", bay: "junction", short: "Shadow evaporation", where: "shadow evaporator",
                name: "Evaporate aluminum at −20°, oxidize for about 20 min, then evaporate again at +20°",
                card: ["Aluminum arrives from two angles, <strong>about ±20°</strong>, so the bridge casts two shadows, and the two aluminum strips overlap only in a tiny patch under it: the junction.",
                    "In between, let in pure oxygen for about <strong>20 minutes</strong>. It grows a tunnel barrier of aluminum oxide just 1–2 nm thick.",
                    "Longer oxidation means a thicker barrier, a higher resistance and a lower qubit frequency."]
            },
            {
                id: "liftoff", phase: "junction", tool: "liftoff", bay: "junction", short: "Lift-off", where: "lift-off bench",
                name: "Lift off the extra aluminum in warm NMP-based remover",
                card: ["Soak in warm <strong>NMP-based remover</strong> until the resist dissolves and the extra aluminum floats away.",
                    "Never use ultrasound here: it can snap the junction."]
            },
            {
                id: "rn", phase: "cryo", tool: "probe", bay: "cryo", short: "Junction resistance", where: "room-temperature probe",
                name: "Measure the junction resistance and predict the qubit frequency",
                card: ["At room temperature, measure the junction's resistance R<sub>n</sub>.",
                    "For aluminum, I<sub>c</sub> · R<sub>n</sub> ≈ 280 µV, so the critical current is I<sub>c</sub> ≈ 280 µV ÷ R<sub>n</sub>.",
                    "Then E<sub>J</sub>/h ≈ 497 GHz per µA of I<sub>c</sub>, and the qubit frequency is about f ≈ √(8 E<sub>J</sub> E<sub>C</sub>) − E<sub>C</sub>, with E<sub>C</sub> ≈ 0.25 GHz. Aim for <strong>4–6 GHz</strong>."]
            },
            {
                id: "package", phase: "cryo", tool: "pack", bay: "cryo", short: "Package", where: "packaging bench",
                name: "Wirebond the chip into a light-tight, shielded sample box",
                card: ["Bond the chip into a metal sample box with a <strong>light-tight lid</strong> and a <strong>magnetic shield</strong>.",
                    "A single stray infrared photon can break the qubit's paired electrons (Cooper pairs) apart, and stray magnetic fields trap flux in the metal. Both shorten T₁."]
            },
            {
                id: "fridge", phase: "cryo", tool: "fridge", bay: "cryo", short: "Cool down", where: "dilution refrigerator",
                name: "Cool the chip to about 10 mK in the dilution refrigerator",
                card: ["A 5 GHz qubit's energy matches heat at only about <strong>0.24 kelvin</strong>. To keep it in its ground state, it must sit far colder than that.",
                    "A <strong>dilution refrigerator</strong> reaches about <strong>10 mK</strong>, colder than outer space."]
            },
            {
                id: "measure", phase: "cryo", tool: "measure", bay: "cryo", short: "Find the qubit", where: "measurement rack",
                name: "Find the qubit with spectroscopy, then measure its T₁",
                card: ["<strong>Spectroscopy</strong>: sweep a microwave tone and watch the readout resonator; it shifts when the tone hits the qubit's frequency.",
                    "<strong>T₁</strong>: excite the qubit, wait, measure, and repeat for longer waits. After one T₁, about <strong>37%</strong> of the excitation is left. Good transmons reach hundreds of µs."]
            }
        ];

        // Materials each step takes from the bag (once per run).
        const USES = {
            clean: [["wafer", 1]],
            base: [["nbtarget", 1]],
            pattern: [["s1813", 1]],
            ebeam: [["pmma", 1]],
            shadow: [["alpellets", 1]]
        };

        function qs() {
            const s = api.save();
            if (!s.quantum) {
                s.quantum = { recipe: false, step: 0, defects: {}, data: {}, stepXp: {}, runs: 0, best: 0, boss: false, bossUp: false };
            }
            return s.quantum;
        }

        function current() {
            return STEPS[qs().step];
        }

        function isCurrentTool(tool) {
            const s = qs();
            return s.recipe && STEPS[s.step] && STEPS[s.step].tool === tool;
        }

        function defect(sev, cause) {
            return { sev: sev, cause: cause };
        }

        function allDefects() {
            const s = qs();
            return STEPS.reduce((l, st) => l.concat(s.defects[st.id] || []), []);
        }

        function cardHtml(st) {
            st = st || current();
            return st && st.card
                ? `<div class="adv-card"><p class="adv-card-title">📋 Dr. Flux's card</p><ul>${st.card.map((x) => `<li>${x}</li>`).join("")}</ul></div>`
                : "";
        }

        function open(title, lead, body) {
            return api.openModal(`
                ${api.head("quantum", title)}
                <p class="adv-round">Recipe step ${qs().step + 1} of ${STEPS.length} · ${BAYS[current().bay]}</p>
                <p class="adv-lead">${lead}</p>
                ${cardHtml()}
                ${body}`);
        }

        function completeStep(defs, summary, then) {
            const s = qs();
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
            if (then) {
                then();
                return;
            }
            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">STEP ${s.step} OF ${STEPS.length} DONE</p>
                    <h2>✓ ${st.short}</h2>
                    ${phaseDone ? `<p class="adv-bonus">Phase complete: ${PHASES[st.phase]}</p>` : ""}
                    <div class="adv-takeaway">${summary}</div>
                    ${next ? `<p class="adv-lead">Next: <strong>${next.name}</strong> at the ${next.where} in the <strong>${BAYS[next.bay]}</strong>.</p>` : ""}
                    <button type="button" class="adv-btn" data-close>Back to work</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
        }

        function resetRun() {
            const s = qs();
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


        /* ---------- The qubit, as the measurements see it ---------- */

        // oxidation minutes → specific resistance R·A (Ω·µm²)
        function raOf(min) {
            return 60 * Math.pow(Math.max(0.5, min), 0.6);
        }

        function model() {
            const d = qs().data;
            const w = d.w || 0.2;                     // junction width, µm
            const area = w * w;
            const rn = d.rn || raOf(20) / area;       // Ω
            const ic = 280e-6 / rn * 1e6;             // µA
            const ej = 497 * ic;                      // GHz
            const ec = 0.25;
            const f01 = Math.sqrt(8 * ej * ec) - ec;
            let t1 = 150;
            const notes = [];
            if (d.substrate === "doped") {
                t1 *= 0.15;
            }
            if (d.substrate === "glass") {
                t1 *= 0.3;
            }
            if (!d.hf) {
                t1 *= 0.55;
            }
            if (d.metal === "al") {
                t1 *= 0.9;
            }
            if (d.shield === "open") {
                t1 *= 0.35;
            }
            if (d.lift === "sonic") {
                t1 *= 0.7;
            }
            const dead = !!(d.noSC || d.shorted || d.noJunction || d.openJ || d.warm);
            return { w: w, rn: rn, ic: ic, ej: ej, ec: ec, f01: f01, t1: Math.max(1, Math.round(t1)), dead: dead, notes: notes };
        }


        /* ---------- Clean & Metal Bay: substrate bench ---------- */

        function openBench() {
            let sub = null;
            let busy = false;
            const m = open("Substrate Bench", "A qubit is only as quiet as what it sits on. Pick the wafer, then decide whether to strip its oxide.", `
                ${canvasBlock("sbCv")}
                <p class="adv-round">Wafer</p>
                ${ui.chips("sub", [{ id: "hires", label: "High-resistivity silicon (>10 kΩ·cm)" }, { id: "doped", label: "Ordinary doped silicon (~10 Ω·cm)" }, { id: "glass", label: "A glass slide" }], null)}
                <label class="adv-check"><input type="checkbox" id="sbHf"> HF dip for 1 minute, then rinse</label>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="sbGo" data-autofocus>Prepare the wafer</button></div>
                <p class="adv-result" id="sbRes" aria-live="polite"></p>`);
            const c = $("sbCv").getContext("2d");
            ui.wireChips("sub", (v) => { sub = v; });

            function draw(k, now, hf, kind) {
                bg(c);
                // close-up: wafer surface with an oxide skin holding little defects
                rect(c, 30, 140, 400, 60, kind === "glass" ? "#a9d6e5" : "#5d6f8f");
                label(c, kind === "glass" ? "glass" : kind === "doped" ? "doped silicon: full of free charges" : "high-resistivity silicon", 40, 190, "#e3e9f2");
                const ox = 14 * (1 - (hf ? k : 0));
                if (ox > 0.5) {
                    rect(c, 30, 140 - ox, 400, ox, "#cfe8ff");
                    for (let i = 0; i < 12; i++) {
                        const x = 50 + i * 32;
                        const blink = Math.sin(now / 200 + i) > 0;
                        dot(c, x, 140 - ox / 2, 2.5, blink ? "#ff6b7d" : "#ffb84a");
                    }
                    label(c, "native oxide, dotted with defects that flip back and forth", 40, 120 - ox, "#ffb84a");
                }
                if (kind === "doped") {
                    for (let i = 0; i < 20; i++) {
                        dot(c, 40 + ((i * 47 + now / 10) % 380), 150 + (i % 4) * 10, 2, "#7fb2ff");
                    }
                }
                if (hf && k > 0) {
                    c.fillStyle = `rgba(200, 255, 200, ${0.25 * Math.sin(Math.PI * k)})`;
                    c.fillRect(30, 60, 400, 80);
                    label(c, "HF dissolves the oxide", 230, 52, "#5be38a", "center");
                }
            }
            draw(0, 0, false, "hires");

            $("sbGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!sub) {
                    ui.result("sbRes", "Choose a wafer first.", false);
                    return;
                }
                busy = true;
                const hf = $("sbHf").checked;
                runStages(m, "sbCvCap", [
                    { caption: sub === "hires" ? "A high-resistivity wafer: almost no free charges to absorb the qubit's energy." : sub === "doped" ? "Doped silicon conducts. Its free charges would soak up the qubit's microwave energy." : "Glass is an insulator, but it's amorphous and full of defects that absorb energy.", dur: 3500, draw: (k, now) => draw(0, now, false, sub) },
                    { caption: hf ? "The HF dip strips the native oxide and the defects living in it." : "No HF dip: the oxide and its defects stay under the circuit.", dur: 4500, draw: (k, now) => draw(k, now, hf, sub) }
                ], () => {
                    const defs = [];
                    const d = qs().data;
                    d.substrate = sub;
                    d.hf = hf;
                    if (sub === "doped") {
                        defs.push(defect("major", "Doped silicon's free charges absorb the qubit's energy: T₁ will be very short."));
                    } else if (sub === "glass") {
                        defs.push(defect("major", "Glass is full of defects that absorb microwave energy, cutting T₁ badly."));
                    }
                    if (!hf) {
                        defs.push(defect("minor", "Without the HF dip, defects in the native oxide steal energy from the qubit."));
                    }
                    completeStep(defs, `<p>Prepared ${sub === "hires" ? "a high-resistivity silicon" : sub === "doped" ? "a doped silicon" : "a glass"} substrate${hf ? " and stripped its oxide in HF" : ""}.</p>`);
                });
            });
        }


        /* ---------- Clean & Metal Bay: sputter tool ---------- */

        function openSputter() {
            let metal = null;
            let busy = false;
            const m = open("Sputter Tool", "Argon ions knock atoms off a metal target and coat the wafer. This film becomes the ground plane, the capacitor pads and the resonator.", `
                ${canvasBlock("spCv")}
                ${ui.chips("met", [{ id: "nb", label: "Niobium (Tc 9.2 K)" }, { id: "al", label: "Aluminum (Tc 1.2 K)" }, { id: "cu", label: "Copper" }, { id: "au", label: "Gold" }], null)}
                ${ui.slider("spNm", "Thickness", "nm", 20, 400, 10, 20)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="spGo" data-autofocus>Sputter</button></div>
                <p class="adv-result" id="spRes" aria-live="polite"></p>`);
            const c = $("spCv").getContext("2d");
            ui.wireChips("met", (v) => { metal = v; });
            const tEl = ui.wireSlider("spNm");
            const col = { nb: "#b8c0cf", al: "#d9dde6", cu: "#e08a5a", au: "#ffd84a" };

            function draw(k, now, kind, nm) {
                bg(c);
                rect(c, 140, 10, 180, 16, col[kind || "nb"]);
                label(c, "target", 230, 40, "#a9b2d0", "center");
                for (let i = 0; i < 20; i++) {
                    const x = 150 + ((i * 41) % 160);
                    const y = 30 + ((now / 4 + i * 23) % 120);
                    dot(c, x + (y - 30) * ((i % 3) - 1) * 0.4, y, 2, col[kind || "nb"]);
                }
                rect(c, 40, 170, 380, 40, "#5d6f8f");
                const h = Math.min(20, nm / 12) * k;
                rect(c, 40, 170 - h, 380, h, col[kind || "nb"]);
                label(c, `${Math.round(nm * k)} nm`, 430, 165 - h, "#f5f7ff", "right", true);
            }
            draw(0, 0, "nb", 0);

            $("spGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!metal) {
                    ui.result("spRes", "Choose a metal first.", false);
                    return;
                }
                busy = true;
                const nm = Number(tEl.value);
                const sc = metal === "nb" || metal === "al";
                runStages(m, "spCvCap", [
                    { caption: `Argon plasma sputters ${metal === "nb" ? "niobium" : metal === "al" ? "aluminum" : metal === "cu" ? "copper" : "gold"} atoms onto the wafer, building a ${nm} nm film.`, dur: 5000, draw: (k, now) => draw(k, now, metal, nm) },
                    { caption: sc ? "Cooled down later, this film will carry current with zero resistance." : "Copper and gold conduct well at room temperature, but they never become superconductors, however cold they get.", dur: 3000, draw: (k, now) => draw(1, now, metal, nm) }
                ], () => {
                    const defs = [];
                    const d = qs().data;
                    d.metal = metal;
                    if (!sc) {
                        d.noSC = true;
                        defs.push(defect("major", `${metal === "cu" ? "Copper" : "Gold"} never superconducts, so the circuit has resistance and the qubit can't hold a quantum state.`));
                    }
                    if (nm < 80) {
                        defs.push(defect("minor", `${nm} nm is thin: the film is patchy and the resonator's frequency drifts.`));
                    } else if (nm > 250) {
                        defs.push(defect("minor", `${nm} nm is thicker than needed and harder to etch cleanly.`));
                    }
                    completeStep(defs, `<p>Sputtered ${nm} nm of ${metal === "nb" ? "niobium" : metal === "al" ? "aluminum" : metal === "cu" ? "copper" : "gold"}.</p>`);
                });
            });
        }


        /* ---------- Clean & Metal Bay: litho & etch (resonator) ---------- */

        function resFreq(mm) {
            return 3e8 / (4 * mm * 1e-3 * 2.52) / 1e9;
        }

        function openLitho() {
            let busy = false;
            const m = open("Litho & Etch Station", "Optical lithography and an etch turn the metal film into the circuit: two capacitor pads, a feedline, and a meandering readout resonator.", `
                ${canvasBlock("lgCv")}
                ${ui.slider("lgL", "Resonator length", "mm", 2, 8, 0.1, 2)}
                <p class="adv-keys" style="text-align:left">Resonator frequency: <strong id="lgF">–</strong></p>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="lgGo" data-autofocus>Expose and etch</button></div>
                <p class="adv-result" id="lgRes" aria-live="polite"></p>`);
            const c = $("lgCv").getContext("2d");
            let lEl = null;
            lEl = ui.wireSlider("lgL", (v) => v.toFixed(1), (v) => {
                $("lgF").textContent = `${resFreq(v).toFixed(2)} GHz`;
                if (!busy && lEl) {
                    draw(1, 0, v, 0);
                }
            });
            const metalCol = qs().data.metal === "al" ? "#d9dde6" : "#b8c0cf";

            function draw(k, now, mm, etch) {
                bg(c);
                rect(c, 20, 20, 420, 190, "#5d6f8f");
                // metal everywhere, then etched away except the circuit
                c.globalAlpha = 1 - etch;
                rect(c, 20, 20, 420, 190, metalCol);
                c.globalAlpha = 1;
                // feedline
                rect(c, 20, 40, 420 * k, 6, metalCol);
                // meander resonator, length shown by number of turns
                const turns = Math.max(2, Math.round(mm * 1.4));
                c.strokeStyle = metalCol;
                c.lineWidth = 4;
                c.beginPath();
                c.moveTo(120, 52);
                for (let i = 0; i < turns * k; i++) {
                    const y = 62 + i * 10;
                    c.lineTo(i % 2 ? 120 : 240, y);
                    c.lineTo(i % 2 ? 240 : 120, y);
                }
                c.stroke();
                // qubit pads and junction
                rect(c, 290, 110, 50, 70, metalCol);
                rect(c, 360, 110, 50, 70, metalCol);
                rect(c, 340, 143, 20, 4, "#ffd84a");
                label(c, "qubit pads", 350, 196, "#f5f7ff", "center");
                label(c, "readout resonator", 180, 214, "#f5f7ff", "center");
                label(c, "feedline", 30, 34, "#f5f7ff");
            }
            draw(1, 0, 2, 0);

            $("lgGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const mm = Number(lEl.value);
                const f = resFreq(mm);
                runStages(m, "lgCvCap", [
                    { caption: "Spin S1813 resist and expose the circuit pattern through a mask.", dur: 3500, draw: (k) => draw(k, 0, mm, 0) },
                    { caption: `Etching away the uncovered metal. What's left is the circuit, with a ${mm.toFixed(1)} mm resonator ringing at about ${f.toFixed(2)} GHz.`, dur: 4500, draw: (k) => draw(1, 0, mm, k) }
                ], () => {
                    const defs = [];
                    qs().data.res = f;
                    if (f < 6) {
                        defs.push(defect("major", `A ${f.toFixed(1)} GHz resonator sits right among the qubit frequencies (4–6 GHz). Reading the qubit would disturb it.`));
                    } else if (Math.abs(f - 7) > 0.8) {
                        defs.push(defect("minor", `${f.toFixed(1)} GHz works, but it's off the 7 GHz plan, outside the band the readout amplifiers are tuned for.`));
                    }
                    completeStep(defs, `<p>Patterned the circuit with a ${mm.toFixed(1)} mm resonator at ${f.toFixed(2)} GHz.</p>`);
                });
            });
        }


        /* ---------- Junction Bay: e-beam writer ---------- */

        function openEbeam() {
            let resist = null;
            let busy = false;
            const m = open("E-beam Writer", "A focused electron beam draws the junction's outline into resist, with features far smaller than light can print.", `
                ${canvasBlock("ebCv")}
                <p class="adv-round">Resist</p>
                ${ui.chips("rs", [{ id: "bilayer", label: "Bilayer: MMA under PMMA" }, { id: "single", label: "Single layer of PMMA" }, { id: "s1813", label: "S1813 photoresist" }], null)}
                ${ui.slider("ebW", "Junction width", "nm", 60, 400, 10, 60)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="ebGo" data-autofocus>Write and develop</button></div>
                <p class="adv-result" id="ebRes" aria-live="polite"></p>`);
            const c = $("ebCv").getContext("2d");
            ui.wireChips("rs", (v) => { resist = v; });
            const wEl = ui.wireSlider("ebW");

            function draw(k, now, kind, stage) {
                bg(c);
                rect(c, 30, 180, 400, 20, "#5d6f8f");
                // two resist layers; bilayer develops with an undercut under a bridge
                const under = kind === "bilayer";
                if (stage === 0) {
                    rect(c, 30, 150, 400, 30, under ? "#c97fe0" : "#e87ad8");
                    rect(c, 30, 130, 400, 20, "#e87ad8");
                    // the beam writing
                    const x = 60 + 340 * k;
                    c.fillStyle = "rgba(127, 230, 255, 0.7)";
                    c.beginPath();
                    c.moveTo(x - 10, 10);
                    c.lineTo(x + 10, 10);
                    c.lineTo(x + 1, 130);
                    c.lineTo(x - 1, 130);
                    c.fill();
                } else {
                    // developed: openings with a bridge in the middle
                    rect(c, 30, under ? 150 : 130, 120, under ? 30 : 50, under ? "#c97fe0" : "#e87ad8");
                    rect(c, 310, under ? 150 : 130, 120, under ? 30 : 50, under ? "#c97fe0" : "#e87ad8");
                    rect(c, 30, 130, 140, 20, "#e87ad8");
                    rect(c, 290, 130, 140, 20, "#e87ad8");
                    if (under) {
                        rect(c, 210, 130, 40, 20, "#e87ad8");
                        label(c, "free-standing bridge", 230, 122, "#ffd84a", "center");
                        label(c, "undercut", 175, 172, "#a9b2d0", "center");
                    } else if (kind === "single") {
                        label(c, "no undercut: the bridge collapses", 230, 122, "#ff9aa6", "center");
                    }
                    if (kind === "s1813") {
                        c.fillStyle = "rgba(232, 122, 216, 0.6)";
                        c.fillRect(170, 130, 120, 50);
                        label(c, "photoresist: blurry, features far too small to resolve", 230, 122, "#ff9aa6", "center");
                    }
                }
            }
            draw(0, 0, "bilayer", 0);

            $("ebGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!resist) {
                    ui.result("ebRes", "Choose a resist first.", false);
                    return;
                }
                busy = true;
                const wnm = Number(wEl.value);
                runStages(m, "ebCvCap", [
                    { caption: `The electron beam traces the junction pattern, ${wnm} nm wide.`, dur: 4000, draw: (k, now) => draw(k, now, resist, 0) },
                    { caption: resist === "bilayer" ? "Developing: the soft MMA underneath dissolves farther back than the PMMA on top, leaving a free-standing bridge over a gap." : resist === "single" ? "Developing a single layer gives straight walls: no undercut, so no bridge." : "Photoresist isn't meant for electron beams at this scale. The pattern comes out blurry.", dur: 4500, draw: (k, now) => draw(1, now, resist, 1) }
                ], () => {
                    const defs = [];
                    const d = qs().data;
                    d.w = wnm / 1000;
                    if (resist !== "bilayer") {
                        d.noJunction = true;
                        defs.push(defect("major", resist === "single" ? "Without an undercut there's no bridge to cast shadows, so shadow evaporation can't form a junction." : "Photoresist can't resolve a junction this small: there's no usable pattern."));
                    }
                    if (wnm < 100) {
                        defs.push(defect("minor", `${wnm} nm is tiny: small variations change the junction a lot, so its frequency is hard to hit.`));
                    }
                    completeStep(defs, `<p>Wrote a ${wnm} nm junction in ${resist === "bilayer" ? "MMA/PMMA bilayer resist" : resist === "single" ? "single-layer PMMA" : "photoresist"}.</p>`);
                });
            });
        }


        /* ---------- Junction Bay: shadow evaporator ---------- */

        function openEvap() {
            let busy = false;
            const m = open("Shadow Evaporator", "Aluminum vapor streams up through the gap from two directions. The bridge's two shadows overlap in one tiny patch: that's the Josephson junction.", `
                ${canvasBlock("evCv")}
                ${ui.slider("evA", "Evaporation angle (±)", "°", 0, 45, 1, 0)}
                ${ui.slider("evOx", "Oxidation time", "min", 0, 60, 1, 0)}
                <p class="adv-keys" style="text-align:left">Predicted junction resistance: <strong id="evRn">–</strong></p>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="evGo" data-autofocus>Evaporate, oxidize, evaporate</button></div>
                <p class="adv-result" id="evRes" aria-live="polite"></p>`);
            const c = $("evCv").getContext("2d");
            const area = Math.pow(qs().data.w || 0.2, 2);
            let aEl = null;
            let oEl = null;
            const pred = () => {
                if (aEl && oEl) {
                    const ox = Number(oEl.value);
                    $("evRn").textContent = ox < 2 ? "shorted (no barrier)" : `${(raOf(ox) / area / 1000).toFixed(1)} kΩ`;
                }
            };
            aEl = ui.wireSlider("evA", null, pred);
            oEl = ui.wireSlider("evOx", null, pred);

            function draw(k, now, ang, phase) {
                bg(c);
                rect(c, 30, 190, 400, 20, "#5d6f8f");
                // resist with a bridge
                rect(c, 30, 140, 140, 50, "#e87ad8");
                rect(c, 290, 140, 140, 50, "#e87ad8");
                rect(c, 210, 140, 40, 18, "#e87ad8");
                // The opening runs from x 170 to 290 with the bridge over 210–250.
                // Each evaporation lands shifted sideways by the angle, and the
                // bridge's shadow splits it into two strips.
                const off = ang * 1.4;
                const strips = (shift) => [[170 + shift, 210 + shift], [250 + shift, 290 + shift]];
                const s1 = strips(-off);
                const s2 = strips(off);
                if (phase >= 0) {
                    const k1 = phase === 0 ? k : 1;
                    s1.forEach(([a, b]) => rect(c, a, 190 - 6 * k1, b - a, 6 * k1, "#d9dde6"));
                }
                if (phase >= 1) {
                    const kk = phase === 1 ? k : 1;
                    s1.forEach(([a, b]) => rect(c, a, 183, b - a, 1.5 * kk, "#7fb2ff"));
                    if (phase === 1) {
                        for (let i = 0; i < 10; i++) {
                            dot(c, 180 + ((i * 13 + now / 15) % 100), 120 + (i % 3) * 6, 2, "#ff8a8a");
                        }
                    }
                }
                if (phase >= 2) {
                    const k2 = phase === 2 ? k : 1;
                    s2.forEach(([a, b]) => rect(c, a, 183 - 6 * k2, b - a, 6 * k2, "#a9c4ff"));
                }
                if (phase === 3 && ang >= 8 && ang <= 35) {
                    // the junction: first layer's right strip under the second layer's left strip
                    const a = Math.max(s1[1][0], s2[0][0]);
                    const b = Math.min(s1[1][1], s2[0][1]);
                    if (b > a) {
                        c.strokeStyle = "#ffd84a";
                        c.lineWidth = 2;
                        c.strokeRect(a - 1, 175, b - a + 2, 17);
                        label(c, "junction", (a + b) / 2, 172, "#ffd84a", "center", true);
                    }
                }
                // incoming vapor direction
                const dir = phase === 2 ? 1 : -1;
                if (phase !== 1) {
                    for (let i = 0; i < 8; i++) {
                        const t2 = ((now / 600) + i / 8) % 1;
                        dot(c, 230 + dir * (1 - t2) * ang * 3 + (i - 4) * 10, 20 + t2 * 120, 2, "#d9dde6");
                    }
                }
                if (phase === 3) {
                    if (ang < 8) {
                        label(c, "shadows don't separate: the strips merge into a short", 230, 40, "#ff9aa6", "center", true);
                    } else if (ang > 35) {
                        label(c, "shadows too far apart: the strips never overlap", 230, 40, "#ff9aa6", "center", true);
                    } else {
                        label(c, "overlap under the bridge = the junction", 230, 40, "#5be38a", "center", true);
                    }
                }
            }
            draw(0, 0, 20, -1);

            $("evGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const ang = Number(aEl.value);
                const ox = Number(oEl.value);
                runStages(m, "evCvCap", [
                    { caption: `First aluminum layer, arriving from −${ang}°.`, dur: 3500, draw: (k, now) => draw(k, now, ang, 0) },
                    { caption: ox < 2 ? "Skipping the oxidation: no barrier grows." : `Pure oxygen for ${ox} minutes grows a 1–2 nm aluminum oxide skin: the tunnel barrier.`, dur: 3500, draw: (k, now) => draw(k, now, ang, 1) },
                    { caption: `Second aluminum layer from +${ang}°, landing partly on top of the first.`, dur: 3500, draw: (k, now) => draw(k, now, ang, 2) },
                    { caption: "The result under the microscope.", dur: 3000, draw: (k, now) => draw(1, now, ang, 3) }
                ], () => {
                    const defs = [];
                    const d = qs().data;
                    d.ox = ox;
                    d.rn = raOf(ox) / area;
                    if (ox < 2) {
                        d.shorted = true;
                        defs.push(defect("major", "With no oxide barrier, the two aluminum layers simply touch: a short, not a Josephson junction."));
                    }
                    if (ang < 8) {
                        d.shorted = true;
                        defs.push(defect("major", `At ±${ang}° the two shadows barely shift, so the strips merge into one big wire.`));
                    } else if (ang > 35) {
                        d.openJ = true;
                        defs.push(defect("major", `At ±${ang}° the shadows land too far apart and the strips never overlap: an open circuit.`));
                    }
                    completeStep(defs, `<p>Evaporated at ±${ang}° with ${ox} min of oxidation.${ox >= 2 ? ` Predicted R<sub>n</sub>: ${(d.rn / 1000).toFixed(1)} kΩ.` : ""}</p>`);
                });
            });
        }


        /* ---------- Junction Bay: lift-off ---------- */

        function openLiftoff() {
            let how = null;
            let busy = false;
            const m = open("Lift-off Bench", "The resist is now coated in aluminum everywhere. Dissolve the resist, and the aluminum on top of it floats away.", `
                ${canvasBlock("loCv")}
                ${ui.chips("lo", [{ id: "nmp", label: "Warm NMP-based remover, gentle" }, { id: "sonic", label: "NMP with the ultrasonic bath" }, { id: "water", label: "Warm water" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="loGo" data-autofocus>Lift off</button></div>
                <p class="adv-result" id="loRes" aria-live="polite"></p>`);
            const c = $("loCv").getContext("2d");
            ui.wireChips("lo", (v) => { how = v; });

            function draw(k, now, kind) {
                bg(c);
                rect(c, 30, 190, 400, 20, "#5d6f8f");
                const gone = kind === "water" ? 0 : k;
                c.globalAlpha = 1 - gone;
                rect(c, 30, 140, 140, 50, "#e87ad8");
                rect(c, 290, 140, 140, 50, "#e87ad8");
                rect(c, 30, 136, 140, 4, "#d9dde6");
                rect(c, 290, 136, 140, 4, "#d9dde6");
                c.globalAlpha = 1;
                for (let i = 0; i < 6 * gone; i++) {
                    rect(c, 40 + i * 70, 120 - ((now / 20 + i * 20) % 80), 30, 3, "#d9dde6");
                }
                rect(c, 175, 186, 110, 4, "#d9dde6");
                rect(c, 220, 182, 20, 4, "#7fb2ff");
                label(c, "junction", 230, 176, "#ffd84a", "center");
                if (kind === "sonic" && k > 0.6) {
                    c.strokeStyle = "#ff6b7d";
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(226, 178);
                    c.lineTo(232, 190);
                    c.stroke();
                }
            }
            draw(0, 0, "nmp");

            $("loGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!how) {
                    ui.result("loRes", "Choose how to lift off.", false);
                    return;
                }
                busy = true;
                runStages(m, "loCvCap", [
                    { caption: how === "water" ? "Water doesn't dissolve PMMA. Nothing happens." : how === "sonic" ? "Ultrasound speeds things up, and shakes the delicate junctions hard." : "Warm remover slowly dissolves the resist; sheets of aluminum float away.", dur: 6000, draw: (k, now) => draw(k, now, how) }
                ], () => {
                    const defs = [];
                    const d = qs().data;
                    d.lift = how;
                    if (how === "water") {
                        d.noJunction = true;
                        defs.push(defect("major", "The resist never dissolved, so aluminum still covers everything and shorts the circuit."));
                    } else if (how === "sonic") {
                        defs.push(defect("minor", "Ultrasound damaged some junctions and left debris, adding loss."));
                    }
                    completeStep(defs, `<p>Lift-off in ${how === "water" ? "water (it didn't work)" : how === "sonic" ? "NMP with ultrasound" : "warm NMP-based remover"}.</p>`);
                });
            });
        }


        /* ---------- Cryo Lab: room-temperature probe ---------- */

        function openProbe() {
            const md = model();
            const d = qs().data;
            const m = open("Room-Temperature Probe", "Two needle probes touch the junction's pads. At room temperature, the junction is just a tiny resistor, and that resistance predicts the qubit's frequency once it's cold.", `
                ${canvasBlock("prCv")}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="prGo" data-autofocus>Measure</button></div>
                <div id="prQ"></div>`);
            const c = $("prCv").getContext("2d");
            const dead = d.shorted || d.openJ || d.noJunction;
            const shown = d.shorted ? 12 : d.openJ || d.noJunction ? Infinity : md.rn;

            function draw(k) {
                bg(c);
                rect(c, 150, 120, 60, 60, "#b8c0cf");
                rect(c, 250, 120, 60, 60, "#b8c0cf");
                rect(c, 210, 148, 40, 4, "#7fb2ff");
                rect(c, 175, 40, 4, 80 * k, "#d9dde6");
                rect(c, 281, 40, 4, 80 * k, "#d9dde6");
                rect(c, 40, 20, 140, 40, "#1a2033");
                label(c, k < 1 ? "…" : shown === Infinity ? "OPEN" : shown < 100 ? `${shown} Ω` : `${(shown / 1000).toFixed(2)} kΩ`, 110, 46, "#5be38a", "center", true);
            }
            draw(0);

            $("prGo").addEventListener("click", () => {
                $("prGo").disabled = true;
                $("prCvCap").innerHTML = "Lowering the probes onto the pads…";
                ui.animate(m, 6500, (k) => draw(Math.min(1, k * 1.3)), () => {
                    if (dead) {
                        $("prCvCap").innerHTML = shown === Infinity ? "Open circuit: there's no junction connecting the pads." : "About 12 Ω: a dead short, not a junction.";
                        $("prQ").innerHTML = '<div class="adv-button-row"><button type="button" class="adv-btn" id="prDone">Log it</button></div>';
                        $("prDone").addEventListener("click", () => completeStep([defect("major", "The junction is broken, so there's no qubit to measure.")], "<p>The junction is broken.</p>"));
                        return;
                    }
                    $("prCvCap").innerHTML = `R<sub>n</sub> = ${(md.rn / 1000).toFixed(2)} kΩ.`;
                    const f = md.f01;
                    const opts = (window.SCGames ? window.SCGames.shuffle : (x) => x)([
                        { v: f, ok: true }, { v: f * 1.6 }, { v: f * 0.55 }, { v: md.ej }
                    ]);
                    $("prQ").innerHTML = `
                        <div class="adv-takeaway">
                            <p>I<sub>c</sub> ≈ 280 µV ÷ ${(md.rn / 1000).toFixed(2)} kΩ = <strong>${(md.ic * 1000).toFixed(1)} nA</strong>, so E<sub>J</sub>/h ≈ 497 × ${md.ic.toFixed(4)} µA = <strong>${md.ej.toFixed(1)} GHz</strong>.</p>
                            <p><strong>With E<sub>C</sub> ≈ 0.25 GHz, what qubit frequency do you predict?</strong> (f ≈ √(8 E<sub>J</sub> E<sub>C</sub>) − E<sub>C</sub>)</p>
                            <div class="adv-chips">${opts.map((o, i) => `<button type="button" class="adv-chip" data-fq="${i}">${o.v.toFixed(2)} GHz</button>`).join("")}</div>
                            <p class="adv-result" id="fqRes"></p>
                        </div>
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="prDone" hidden>Log it</button></div>`;
                    let answered = false;
                    api.modalBody().querySelectorAll("[data-fq]").forEach((b) => b.addEventListener("click", () => {
                        if (answered) {
                            return;
                        }
                        answered = true;
                        b.classList.add("on");
                        const ok = opts[Number(b.dataset.fq)].ok;
                        ui.result("fqRes", `${ok ? "✓" : "✗"} √(8 × ${md.ej.toFixed(1)} × 0.25) − 0.25 ≈ <strong>${f.toFixed(2)} GHz</strong>. ${f >= 4 && f <= 6 ? "Right in the 4–6 GHz sweet spot." : f < 4 ? "That's low: the barrier is thick or the junction is small." : "That's high: the barrier is thin or the junction is big."}`, !!ok);
                        $("prDone").hidden = false;
                        $("prDone").focus();
                    }));
                    $("prDone").addEventListener("click", () => {
                        const defs = [];
                        if (f < 4 || f > 6) {
                            defs.push(defect("minor", `A ${f.toFixed(2)} GHz qubit is outside the 4–6 GHz plan, closer to the resonator or to thermal noise.`));
                        }
                        if (Math.abs(f - qs().data.res) < 1) {
                            defs.push(defect("major", "The qubit and its readout resonator are within 1 GHz of each other, so reading one disturbs the other."));
                        }
                        qs().data.f01 = f;
                        completeStep(defs, `<p>R<sub>n</sub> = ${(md.rn / 1000).toFixed(2)} kΩ, predicting a <strong>${f.toFixed(2)} GHz</strong> qubit.</p>`);
                    });
                });
            });
        }


        /* ---------- Cryo Lab: packaging ---------- */

        function openPack() {
            let box = null;
            let busy = false;
            const m = open("Packaging Bench", "The chip is diced and wire-bonded into a sample box with microwave connectors.", `
                ${canvasBlock("pkCv")}
                ${ui.chips("box", [{ id: "shielded", label: "Light-tight box inside a magnetic shield" }, { id: "open", label: "Open mount, no lid" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="pkGo" data-autofocus>Bond and close up</button></div>
                <p class="adv-result" id="pkRes" aria-live="polite"></p>`);
            const c = $("pkCv").getContext("2d");
            ui.wireChips("box", (v) => { box = v; });

            function draw(k, now, kind) {
                bg(c);
                rect(c, 130, 80, 200, 110, "#b87333");
                rect(c, 190, 110, 80, 50, "#5d6f8f");
                for (let i = 0; i < 6; i++) {
                    c.strokeStyle = "#ffd84a";
                    c.lineWidth = 1;
                    c.beginPath();
                    c.moveTo(150 + i * 32, 100);
                    c.quadraticCurveTo(170 + i * 20, 90 - 10 * k, 195 + i * 14, 112);
                    c.stroke();
                }
                if (kind === "shielded" && k > 0.5) {
                    rect(c, 120, 70, 220, 20 * Math.min(1, (k - 0.5) * 2), "#8f98aa");
                    c.strokeStyle = "#7fb2ff";
                    c.lineWidth = 3;
                    c.strokeRect(105, 55, 250, 150);
                    label(c, "magnetic shield", 230, 220, "#7fb2ff", "center");
                }
                if (kind === "open") {
                    for (let i = 0; i < 8; i++) {
                        const ph = ((now / 700) + i / 8) % 1;
                        dot(c, 40 + i * 50, 20 + ph * 100, 2.5, "#ff6b7d");
                    }
                    label(c, "stray infrared photons getting in", 230, 30, "#ff9aa6", "center");
                }
            }
            draw(0, 0, "shielded");

            $("pkGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!box) {
                    ui.result("pkRes", "Choose how to mount the chip.", false);
                    return;
                }
                busy = true;
                runStages(m, "pkCvCap", [
                    { caption: "Thin aluminum wire bonds connect the chip's pads to the box's microwave lines.", dur: 3500, draw: (k, now) => draw(k * 0.5, now, box) },
                    { caption: box === "shielded" ? "A light-tight lid and a magnetic shield keep stray photons and fields away." : "No lid: stray infrared light will reach the chip and break Cooper pairs.", dur: 4000, draw: (k, now) => draw(0.5 + k * 0.5, now, box) }
                ], () => {
                    const defs = [];
                    qs().data.shield = box;
                    if (box === "open") {
                        defs.push(defect("major", "Stray light breaks Cooper pairs into quasiparticles that sap the qubit's energy, cutting T₁ to a fraction."));
                    }
                    completeStep(defs, `<p>Packaged the chip ${box === "shielded" ? "in a shielded, light-tight box" : "on an open mount"}.</p>`);
                });
            });
        }


        /* ---------- Cryo Lab: dilution refrigerator ---------- */

        const STAGES_K = [
            { t: 300, name: "Room temperature (300 K)" },
            { t: 50, name: "50 K plate" },
            { t: 4, name: "4 K plate" },
            { t: 1, name: "1 K (still)" },
            { t: 0.1, name: "100 mK" },
            { t: 0.01, name: "10 mK (mixing chamber)" }
        ];

        function openFridge() {
            let busy = false;
            const m = open("Dilution Refrigerator", "A dilution fridge is a stack of ever-colder gold-plated plates, the famous chandelier. The chip hangs at the very bottom.", `
                ${canvasBlock("frCv")}
                ${ui.slider("frT", "Stop cooling at", "", 0, STAGES_K.length - 1, 1, 2)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="frGo" data-autofocus>Cool down</button></div>
                <p class="adv-result" id="frRes" aria-live="polite"></p>`);
            const c = $("frCv").getContext("2d");
            const tEl = ui.wireSlider("frT", (v) => STAGES_K[v].name);

            function draw(k, now, stop) {
                bg(c);
                // chandelier: plates getting smaller and colder going down
                for (let i = 0; i < 5; i++) {
                    const y = 20 + i * 38;
                    const w = 220 - i * 30;
                    const cold = Math.min(1, k * 5 - i);
                    rect(c, 120 - w / 2 + 80, y, w, 8, `rgb(${Math.round(220 - 120 * Math.max(0, cold))}, ${Math.round(180 + 20 * Math.max(0, cold))}, ${Math.round(80 + 170 * Math.max(0, cold))})`);
                    if (i < 4) {
                        rect(c, 190, y + 8, 4, 30, "#b8964a");
                        rect(c, 210, y + 8, 4, 30, "#b8964a");
                    }
                }
                rect(c, 190, 180, 24, 20, "#b87333");
                label(c, "chip", 202, 215, "#f5f7ff", "center");
                const reached = Math.floor(k * stop + 0.001);
                const temp = STAGES_K[Math.min(stop, reached)];
                rect(c, 320, 40, 120, 60, "#1a2033");
                label(c, temp.t >= 1 ? `${temp.t} K` : `${Math.round(temp.t * 1000)} mK`, 380, 76, "#7fb2ff", "center", true);
                label(c, "chip temperature", 380, 112, "#a9b2d0", "center");
                const frost = Math.max(0, Math.min(1, k * 1.2));
                c.fillStyle = `rgba(200, 230, 255, ${0.15 * frost * Math.abs(Math.sin(now / 600))})`;
                c.fillRect(0, 0, 460, 230);
            }
            draw(0, 0, 2);

            $("frGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const stop = Number(tEl.value);
                const T = STAGES_K[stop].t;
                runStages(m, "frCvCap", [
                    { caption: "Pumping down and pre-cooling with pulse tubes: each plate gets colder, top to bottom. A real cooldown takes about a day.", dur: 5000, draw: (k, now) => draw(Math.min(k, 0.6) / 0.6 * Math.min(stop, 2) / stop || 0, now, stop) },
                    { caption: T <= 0.01 ? "Helium-3 dissolving into helium-4 in the mixing chamber pulls the last heat away: about 10 mK." : `Holding at ${STAGES_K[stop].name}.`, dur: 5000, draw: (k, now) => draw(k, now, stop) }
                ], () => {
                    const defs = [];
                    const d = qs().data;
                    d.T = T;
                    if (T > 1.2) {
                        d.warm = true;
                        defs.push(defect("major", `At ${STAGES_K[stop].name} the junction's aluminum isn't superconducting yet (it needs below 1.2 K), so there's no qubit at all.`));
                    } else if (T > 0.05) {
                        d.warm = true;
                        defs.push(defect("major", `${STAGES_K[stop].name} is warmer than the qubit's 0.24 K energy scale, so heat keeps kicking it out of its ground state. It's useless as a qubit.`));
                    }
                    completeStep(defs, `<p>Cooled to ${STAGES_K[stop].name}.</p>`);
                });
            });
        }


        /* ---------- Cryo Lab: spectroscopy and T1 ---------- */

        function openMeasure() {
            const md = model();
            const m = open("Measurement Rack", "Microwave generators, amplifiers and a fast digitizer: everything needed to talk to one qubit at 10 mK.", `
                ${canvasBlock("msCv")}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="msGo" data-autofocus>Run spectroscopy, then T₁</button></div>
                <div id="msQ"></div>`);
            const c = $("msCv").getContext("2d");
            const f = md.f01;
            const lo = Math.max(1, f - 1.5);
            const hi = f + 1.5;

            function spec(k) {
                const pts = [];
                for (let i = 0; i <= 160 * k; i++) {
                    const x = lo + (hi - lo) * i / 160;
                    const y = md.dead ? 0.02 * Math.random() : 0.9 / (1 + Math.pow((x - f) / 0.02, 2)) + 0.03 * Math.random();
                    pts.push([x, y]);
                }
                ui.plot(c, 460, 230, [{ pts: pts, color: "#7fe6ff" }], {
                    x0: lo, x1: hi, y0: 0, y1: 1,
                    xLabel: "drive frequency (GHz)", yLabel: "resonator shift",
                    xTicks: [lo, (lo + hi) / 2, hi].map((v) => +v.toFixed(1)), fmtX: (v) => v.toFixed(1),
                    yTicks: [0, 0.5, 1]
                }, 1);
            }

            function t1curve(k) {
                const tMax = md.t1 * 4;
                const pts = [];
                for (let i = 0; i <= 120 * k; i++) {
                    const t = tMax * i / 120;
                    pts.push([t, Math.exp(-t / md.t1) + 0.02 * (Math.random() - 0.5)]);
                }
                ui.plot(c, 460, 230, [{ pts: pts, color: "#ffd84a" }], {
                    x0: 0, x1: tMax, y0: 0, y1: 1,
                    xLabel: "wait time (µs)", yLabel: "chance still excited",
                    xTicks: [0, Math.round(tMax / 4), Math.round(tMax / 2), Math.round(3 * tMax / 4), Math.round(tMax)],
                    yTicks: [0, 0.37, 1]
                }, 1);
            }
            spec(0);

            $("msGo").addEventListener("click", () => {
                $("msGo").disabled = true;
                $("msCvCap").innerHTML = "Sweeping a microwave tone and watching the readout resonator…";
                ui.animate(m, 6500, (k) => spec(k), () => {
                    if (md.dead) {
                        $("msCvCap").innerHTML = "Flat: nothing responds. There's no working qubit on this chip.";
                        $("msQ").innerHTML = '<div class="adv-button-row"><button type="button" class="adv-btn" id="msDone">Log it</button></div>';
                        $("msDone").addEventListener("click", () => completeStep([defect("major", "No qubit responded.")], "", () => finishBatch(md)));
                        return;
                    }
                    $("msCvCap").innerHTML = `A sharp peak at <strong>${f.toFixed(2)} GHz</strong>: that's the qubit! Now the T₁ measurement: excite it, wait, read it out, repeat…`;
                    setTimeout(() => {
                        if (m.dead) {
                            return;
                        }
                        ui.animate(m, 6500, (k) => t1curve(k), () => {
                            const opts = (window.SCGames ? window.SCGames.shuffle : (x) => x)([
                                { v: md.t1, ok: true }, { v: Math.round(md.t1 * 2.5) }, { v: Math.round(md.t1 / 3) }, { v: Math.round(md.t1 * 0.63) }
                            ]);
                            $("msCvCap").innerHTML = "Find the wait time where the curve has fallen to 37% (the 0.37 mark on the left axis).";
                            $("msQ").innerHTML = `
                                <div class="adv-takeaway">
                                    <p><strong>What's this qubit's T₁?</strong></p>
                                    <div class="adv-chips">${opts.map((o, i) => `<button type="button" class="adv-chip" data-tq="${i}">${o.v} µs</button>`).join("")}</div>
                                    <p class="adv-result" id="tqRes"></p>
                                </div>
                                <div class="adv-button-row"><button type="button" class="adv-btn" id="msDone" hidden>See the report</button></div>`;
                            let answered = false;
                            api.modalBody().querySelectorAll("[data-tq]").forEach((b) => b.addEventListener("click", () => {
                                if (answered) {
                                    return;
                                }
                                answered = true;
                                b.classList.add("on");
                                const ok = opts[Number(b.dataset.tq)].ok;
                                ui.result("tqRes", `${ok ? "✓" : "✗"} T₁ ≈ <strong>${md.t1} µs</strong>: after that long, about 37% of the excitation is left. ${md.t1 >= 100 ? "Excellent: hundreds of microseconds is what good transmons reach." : md.t1 >= 40 ? "Decent, but the losses in the report are holding it back." : "Short: check the report to see what's stealing its energy."}`, !!ok);
                                $("msDone").hidden = false;
                                $("msDone").focus();
                            }));
                            $("msDone").addEventListener("click", () => {
                                const defs = [];
                                if (md.t1 < 40) {
                                    defs.push(defect("minor", `A T₁ of ${md.t1} µs is short; good transmons reach hundreds of µs.`));
                                }
                                qs().data.t1 = md.t1;
                                completeStep(defs, "", () => finishBatch(md));
                            });
                        });
                    }, 1200);
                });
            });
        }

        function finishBatch(md) {
            const s = qs();
            const defs = allDefects();
            const majors = defs.filter((d) => d.sev === "major").length;
            const stars = !defs.length ? 3 : !majors ? 2 : 1;
            const first = !s.best;
            const xp = first ? 250 + stars * 25 : stars > s.best ? (stars - s.best) * 25 : 0;
            s.best = Math.max(s.best, stars);
            s.bossUp = true;
            api.writeSave();
            if (xp) {
                api.gainXP(xp);
            }
            api.awardSiteXP("quantumbatch", 250);
            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">QUBIT REPORT</p>
                    <h2>❄️ Transmon Qubit</h2>
                    <p class="adv-stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
                    ${xp ? `<p class="adv-xp-big">+${xp} XP</p>` : ""}
                    <ul class="adv-stats" style="justify-content:center">
                        <li>Qubit <strong>${md.dead ? "–" : md.f01.toFixed(2) + " GHz"}</strong></li>
                        <li>R<sub>n</sub> <strong>${md.dead ? "–" : (md.rn / 1000).toFixed(2) + " kΩ"}</strong></li>
                        <li>T₁ <strong>${md.dead ? "–" : md.t1 + " µs"}</strong></li>
                    </ul>
                    <div class="adv-takeaway">
                        ${defs.length ? defs.map((d) => `<p>${d.sev === "major" ? "⚠️" : "•"} ${d.cause}</p>`).join("") : "<p>A flawless qubit, from wafer to 10 mK!</p>"}
                    </div>
                    <p class="adv-calib">👻 <strong>${s.boss ? "Rematch!" : "Boss unlocked!"}</strong> Something is rising out of the fridge sculpture in the plaza…</p>
                    <button type="button" class="adv-btn" data-close>Back to the lab</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
            api.afterModal(() => api.say([
                md.dead ? "No qubit this time, but the report shows exactly what to fix." : "A working qubit! Every quantum computer is built from chips like this one.",
                "But… the fridge sculpture in the plaza is flickering. Something is stealing quantum states. It's The Decoherence Wraith!"
            ], "Dr. Flux"));
        }


        /* ---------- Boss: The Decoherence Wraith ---------- */

        function drawWraith(c, ox, oy, s, t) {
            const bob = Math.sin(t / 380) * 2;
            c.fillStyle = "rgba(0,0,0,0.25)";
            c.fillRect(ox + 6 * s, oy + 30 * s, 20 * s, 2 * s);
            // a shimmering ghost made of a fading Bloch sphere
            for (let r = 12; r > 3; r -= 3) {
                c.strokeStyle = `rgba(127, 230, 255, ${0.15 + (12 - r) * 0.06})`;
                c.lineWidth = 1.2 * s;
                c.beginPath();
                c.ellipse(ox + 16 * s, oy + (14 + bob) * s, r * s, r * 0.9 * s, Math.sin(t / 900) * 0.4, 0, Math.PI * 2);
                c.stroke();
            }
            c.fillStyle = "rgba(190, 240, 255, 0.55)";
            c.beginPath();
            c.moveTo(ox + 6 * s, oy + (28 + bob) * s);
            c.quadraticCurveTo(ox + 16 * s, oy + (2 + bob) * s, ox + 26 * s, oy + (28 + bob) * s);
            c.fill();
            c.fillStyle = "#1a2033";
            c.fillRect(ox + 11 * s, oy + (12 + bob) * s, 3 * s, 3 * s);
            c.fillRect(ox + 18 * s, oy + (12 + bob) * s, 3 * s, 3 * s);
            c.fillRect(ox + 13 * s, oy + (19 + bob) * s, 6 * s, 1.5 * s);
            // the state arrow drifting away
            const a = t / 700;
            c.strokeStyle = "#ffd84a";
            c.lineWidth = 1.5 * s;
            c.beginPath();
            c.moveTo(ox + 16 * s, oy + (14 + bob) * s);
            c.lineTo(ox + (16 + Math.cos(a) * 9) * s, oy + (14 + bob + Math.sin(a) * 9) * s);
            c.stroke();
        }

        const WRAITH_QS = {
            fab: [
                { q: "Why build qubits on high-resistivity silicon?", a: ["It has almost no free charges to absorb the qubit's energy", "It conducts better", "It's cheaper", "It glows"], why: "Free charges are a loss channel." },
                { q: "Why dip the wafer in HF first?", a: ["To strip the native oxide and its energy-stealing defects", "To make it shiny", "To add oxygen", "To dope it"], why: "Defects in oxides flip and absorb energy." },
                { q: "Which of these can be a superconducting qubit's metal?", a: ["Aluminum or niobium", "Copper", "Gold", "Iron"], why: "Copper and gold never superconduct." },
                { q: "Why is the readout resonator set near 7 GHz?", a: ["To sit well away from the qubit's 4–6 GHz", "Because Wi-Fi is there", "It's the only possible length", "To heat the chip"], why: "Reading the qubit shouldn't disturb it." }
            ],
            junction: [
                { q: "A Josephson junction is…", a: ["Two superconductors separated by a 1–2 nm insulating barrier", "A solder joint", "A diode", "A capacitor plate"], why: "Electron pairs tunnel through the barrier." },
                { q: "Why does shadow evaporation need a bilayer resist?", a: ["The undercut leaves a free-standing bridge that casts two shadows", "It's cheaper", "It conducts", "It's easier to see"], why: "The two shadows overlap to form the junction." },
                { q: "What grows the tunnel barrier?", a: ["Oxidizing the first aluminum layer in pure oxygen", "Sputtering gold", "Etching with HF", "Baking in air at 1000 °C"], why: "It makes a 1–2 nm aluminum oxide skin." },
                { q: "Longer oxidation makes the junction resistance…", a: ["Higher, and the qubit frequency lower", "Lower", "Zero", "Unchanged"], why: "A thicker barrier lets less current tunnel." }
            ],
            cold: [
                { q: "About how cold does a dilution refrigerator get?", a: ["About 10 mK", "About 4 K", "About 77 K", "About 0 °C"], why: "Colder than outer space." },
                { q: "Why so cold for a 5 GHz qubit?", a: ["Its energy matches heat at only about 0.24 K", "To freeze the air", "So the chip shrinks", "To stop vibrations"], why: "Heat would kick it out of its ground state." },
                { q: "Why put the chip in a light-tight box?", a: ["Stray photons break Cooper pairs and sap T₁", "To keep it dark for photos", "For decoration", "To keep it warm"], why: "Broken pairs become quasiparticles." },
                { q: "Superconducting qubits usually run at…", a: ["About 4–8 GHz", "About 50 Hz", "About 1 THz", "About 1 kHz"], why: "Microwave frequencies, near Wi-Fi." }
            ],
            coherence: [
                { q: "What does T₁ measure?", a: ["How long the qubit holds its excited state", "Its temperature", "Its size", "Its color"], why: "Energy relaxation time." },
                { q: "After one T₁, about how much excitation is left?", a: ["About 37%", "About 90%", "About 1%", "Exactly half"], why: "That's 1/e." },
                { q: "T₂ can never be longer than…", a: ["2 × T₁", "T₁ ÷ 10", "1 second", "T₁²"], why: "Losing energy also destroys phase." },
                { q: "Good transmons reach T₁ of about…", a: ["Hundreds of microseconds", "Hours", "Nanoseconds", "Years"], why: "Set largely by how lossy the materials are." }
            ]
        };

        function wraithBattle() {
            const rematch = qs().boss;
            return {
                foeName: "The Decoherence Wraith",
                foeTag: "Lost quantum state · Lv 32",
                foeSize: 32,
                fieldClass: "adv-field-quantum",
                drawFoe: (c, t) => drawWraith(c, 0, 0, 1, t),
                foeMax: 315,
                foePower: 1.0,
                meMax: 140,
                moves: [
                    { type: "cold", name: "Deep Freeze", mult: 1.75, label: "Cryogenics", icon: "❄️", special: "dep", cls: "dep", effect: "Direct hit! At 10 mK there's no heat left for it to feed on." },
                    { type: "junction", name: "Josephson Junction", mult: 1.5, label: "Junctions", icon: "⚡", special: "etch", cls: "etch", effect: "A perfect barrier pins it in place." },
                    { type: "fab", name: "Clean Substrate", mult: 1, label: "Materials", icon: "💿", special: "litho", cls: "litho", effect: "Fewer defects, less for it to hide in." },
                    { type: "coherence", name: "Measure T₁", mult: 0.5, focus: true, label: "Coherence", icon: "📈", special: "inspect", cls: "inspect", effect: "You've timed its decay. Your next hit does 1.5× damage!" }
                ],
                questions: WRAITH_QS,
                attacks: [
                    { name: "Thermal Flip", text: "A burst of heat flipped your qubit!" },
                    { name: "Quasiparticle Swarm", text: "Broken Cooper pairs drained your energy!" },
                    { name: "Dephase", text: "Your state's phase smeared away!" }
                ],
                intro: [
                    "The fridge sculpture flickers… It's <strong>The Decoherence Wraith</strong>!",
                    "It steals quantum states the moment anything warm or lossy gets near. Answer qubit questions to banish it!"
                ],
                runText: "You backed off. The Decoherence Wraith keeps flickering…",
                loseTitle: "The Decoherence Wraith dephased you",
                loseTip: "Tip: The Decoherence Wraith is weak to <strong>Deep Freeze</strong> and <strong>Josephson Junction</strong>. <strong>Measure T₁</strong> first makes your next hit 1.5× stronger.",
                winLines: rematch ? ["The Decoherence Wraith fades again!", "Coherence restored. Rematch won!"] : ["The Decoherence Wraith fades into the cold!", "📜 Dr. Flux hands you the Frostbit Certificate of Completion!"],
                onWin: () => {
                    const s = qs();
                    const first = !s.boss;
                    s.boss = true;
                    s.bossUp = false;
                    api.save().badges.quantum = true;
                    api.writeSave();
                    api.updateHud();
                    api.gainXP(first ? 200 : 25);
                    if (first) {
                        api.awardSiteXP("quantumboss", 200);
                    }
                    api.afterModal(() => api.say(first ? [
                        "Coherence restored! Every superconducting quantum computer fights that wraith: clean materials, good junctions, shielding and cold.",
                        "Here's your Frostbit Certificate of Completion. You've built everything from sand to a qubit!"
                    ] : ["Banished again! Build another qubit and it'll be back."], "Dr. Flux"));
                    return `
                        <div class="adv-complete">
                            <p class="eyebrow">COHERENCE RESTORED</p>
                            <h2>${first ? "📜 Certificate of Completion" : "❄️ Rematch Won"}</h2>${first ? api.certificate("quantum") : ""}
                            <p class="adv-xp-big">+${first ? 200 : 25} XP</p>
                            <div class="adv-takeaway">
                                <p><strong>Decoherence</strong> is a qubit losing its quantum state to its surroundings: heat, stray light, lossy materials and noise.</p>
                                <p>Engineers fight it with clean substrates, careful junctions, shielding, filtering and millikelvin temperatures, then check with T₁ and T₂ measurements.</p>
                            </div>
                            <button type="button" class="adv-btn" data-close>Back to the plaza</button>
                        </div>`;
                }
            };
        }


        /* ---------- Recipe card ---------- */

        function openRecipe() {
            const s = qs();
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
                        <span><strong>${st.name}</strong><small>${st.where.charAt(0).toUpperCase() + st.where.slice(1)} · ${BAYS[st.bay]}</small></span>
                    </li>`;
            });
            html += "</ol>";
            api.openModal(`
                ${api.head("quantum", "Dr. Flux's Recipe")}
                <p class="adv-lead">A superconducting transmon qubit, built across three bays. Bring a wafer (Silicon Beach) and S1813 (Foundry); the niobium target, e-beam resist and aluminum pellets are in the Clean & Metal Bay stockroom.${s.best ? ` Best qubit: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}` : ""}</p>
                <div class="adv-button-row" style="margin-bottom:8px"><button type="button" class="adv-btn secondary" data-close>Close</button></div>
                ${html}`);
        }

        api.registerRecipe({
            id: "quantum",
            scenes: ["frostbit", "qumetal", "qujunction", "qucryo"],
            available: () => qs().recipe,
            open: openRecipe,
            label: "Dr. Flux's transmon qubit (10 steps)",
            progress: () => qs().step,
            total: STEPS.length,
            restart: resetRun
        });


        /* ---------- Tools ---------- */

        const TOOLS = {
            bench: { name: "Substrate Bench", open: openBench },
            sputter: { name: "Sputter Tool", open: openSputter },
            litho: { name: "Litho & Etch Station", open: openLitho },
            ebeam: { name: "E-beam Writer", open: openEbeam },
            evap: { name: "Shadow Evaporator", open: openEvap },
            liftoff: { name: "Lift-off Bench", open: openLiftoff },
            probe: { name: "Room-Temperature Probe", open: openProbe },
            pack: { name: "Packaging Bench", open: openPack },
            fridge: { name: "Dilution Refrigerator", open: openFridge },
            measure: { name: "Measurement Rack", open: openMeasure }
        };

        function useTool(tool) {
            const s = qs();
            if (!s.recipe) {
                api.say([`The ${TOOLS[tool].name}.`, "Dr. Flux runs Frostbit's labs. Talk to Dr. Flux in the plaza for the recipe."]);
                return;
            }
            const st = STEPS[s.step];
            if (!st) {
                api.say([`The ${TOOLS[tool].name}.`, "This qubit is done. Talk to Dr. Flux to build another."]);
                return;
            }
            if (st.tool !== tool) {
                api.say([`The ${TOOLS[tool].name}.`, `Your recipe says the next step is: ${st.name}.`, `That happens at the ${st.where} in the ${BAYS[st.bay]}. Press R to read the recipe.`]);
                return;
            }
            if (!api.bag.pay(s, st.id, USES[st.id])) {
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

        function tool(id, label2, x, y, w, h, drawFn) {
            return {
                kind: "qu-" + id,
                x: x, y: y, w: w, h: h,
                label: label2,
                draw: (c, X, Y, W, H, t) => {
                    drawFn(c, X, Y, W, H, t);
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
            bench(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 6, Y + 5, 12, 6, "rgba(200, 255, 200, 0.7)");
                dot(c, X + 30, Y + 8, 5, "#5d6f8f");
            },
            sputter(c, X, Y, W, H, t) {
                api.box(X + 2, Y, W - 4, H, "#8f98aa");
                rect(c, X + 8, Y + 6, W - 16, 10, `rgba(180, 140, 255, ${0.4 + 0.3 * Math.sin(t / 200)})`);
            },
            litho(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + W / 2 - 3, Y - 6, 6, 12, "#3b4458");
                rect(c, X + 6, Y + 7, W - 12, 3, "#e87ad8");
            },
            ebeam(c, X, Y, W, H, t) {
                api.box(X + 4, Y + 4, W - 8, H - 4, "#3b4458");
                rect(c, X + W / 2 - 4, Y - 8, 8, 16, "#8f98aa");
                rect(c, X + W / 2 - 1, Y + 8, 2, 8, `rgba(127, 230, 255, ${0.5 + 0.4 * Math.sin(t / 120)})`);
            },
            evap(c, X, Y, W, H) {
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 14, W / 2 - 2, 14, 0, Math.PI, 0);
                c.fill();
                c.fillStyle = "rgba(220, 235, 255, 0.5)";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 14, W / 2 - 3, 13, 0, Math.PI, 0);
                c.fill();
                api.box(X + 2, Y + 14, W - 4, H - 15, "#5d6577");
            },
            liftoff(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 8, Y + 4, W - 16, 8, "rgba(127, 178, 255, 0.6)");
            },
            probe(c, X, Y, W, H) {
                api.box(X + 2, Y + 6, W - 4, H - 6, "#3b4458");
                rect(c, X + 6, Y + 2, 2, 12, "#d9dde6");
                rect(c, X + W - 8, Y + 2, 2, 12, "#d9dde6");
            },
            pack(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 10, Y + 4, 16, 8, "#b87333");
            },
            fridge(c, X, Y, W, H, t) {
                drawChandelier(c, X, Y, W, H, t);
            },
            measure(c, X, Y, W, H, t) {
                api.box(X + 2, Y, W - 4, H, "#3b4458");
                for (let i = 0; i < 3; i++) {
                    rect(c, X + 6, Y + 4 + i * 9, W - 12, 6, "#141a2e");
                    rect(c, X + 8 + ((t / 30 + i * 7) % (W - 18)), Y + 6 + i * 9, 2, 2, "#7fe6ff");
                }
            }
        };

        // the gold "chandelier" of a dilution refrigerator
        function drawChandelier(c, X, Y, W, H, t) {
            const cx = X + W / 2;
            for (let i = 0; i < 4; i++) {
                const w = W - 6 - i * 6;
                const y = Y + 2 + i * (H - 6) / 4;
                rect(c, cx - w / 2, y, w, 3, i === 3 ? "#b87333" : "#e2b34a");
                if (i < 3) {
                    rect(c, cx - w / 2 + 3, y + 3, 1.5, (H - 6) / 4 - 3, "#c9952b");
                    rect(c, cx + w / 2 - 4.5, y + 3, 1.5, (H - 6) / 4 - 3, "#c9952b");
                }
            }
            const k = (Math.sin(t / 500) + 1) / 2;
            c.fillStyle = `rgba(127, 230, 255, ${0.2 + 0.25 * k})`;
            c.beginPath();
            c.arc(cx, Y + H - 3, 4, 0, Math.PI * 2);
            c.fill();
        }

        function drawCooperPair(c, X, Y, t) {
            const bob = Math.round(Math.sin(t / 260 + X) * 1);
            rect(c, X + 1, Y + 14, 14, 2, "rgba(0,0,0,0.22)");
            [[X + 5, "#7fb2ff"], [X + 11, "#7fe6ff"]].forEach(([x, col], i) => {
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.arc(x, Y + 8 + bob + (i ? 0 : 1), 4.5, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = col;
                c.beginPath();
                c.arc(x, Y + 8 + bob + (i ? 0 : 1), 3.6, 0, Math.PI * 2);
                c.fill();
                rect(c, x - 1, Y + 7 + bob, 1, 1, "#1a2033");
            });
            rect(c, X + 7, Y + 10 + bob, 2, 1, "#1a2033");
        }

        function drawQuasi(c, X, Y, t) {
            const jit = Math.round(Math.sin(t / 90 + X) * 1.5);
            rect(c, X + 4, Y + 14, 8, 2, "rgba(0,0,0,0.22)");
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.arc(X + 8 + jit, Y + 8, 4.5, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#ff8aa8";
            c.beginPath();
            c.arc(X + 8 + jit, Y + 8, 3.6, 0, Math.PI * 2);
            c.fill();
            rect(c, X + 6 + jit, Y + 7, 1, 1, "#1a2033");
            rect(c, X + 9 + jit, Y + 7, 1, 1, "#1a2033");
        }

        function drawBloch(c, X, Y, W, H, t) {
            const cx = X + W / 2;
            const cy = Y + H / 2 - 2;
            rect(c, cx - 6, Y + H - 4, 12, 4, "#8f98aa");
            c.strokeStyle = "#cfe8ff";
            c.lineWidth = 1.2;
            c.beginPath();
            c.arc(cx, cy, 7, 0, Math.PI * 2);
            c.stroke();
            c.beginPath();
            c.ellipse(cx, cy, 7, 2.5, 0, 0, Math.PI * 2);
            c.stroke();
            const a = t / 900;
            c.strokeStyle = "#ffd84a";
            c.beginPath();
            c.moveTo(cx, cy);
            c.lineTo(cx + Math.cos(a) * 6, cy - 5 + Math.sin(a) * 2);
            c.stroke();
        }

        function snowTile(c, x, y, ch, t) {
            const X = x * TILE;
            const Y = y * TILE;
            const r = api.hash(x, y);
            if (ch === "T") {
                rect(c, X, Y, TILE, TILE, "#e8f0f8");
                rect(c, X + 7, Y + 11, 2, 5, "#6b4a2f");
                c.fillStyle = "#2e5a46";
                c.beginPath();
                c.moveTo(X + 8, Y + 1);
                c.lineTo(X + 14, Y + 12);
                c.lineTo(X + 2, Y + 12);
                c.closePath();
                c.fill();
                c.fillStyle = "#f5f9ff";
                c.beginPath();
                c.moveTo(X + 8, Y + 1);
                c.lineTo(X + 11, Y + 6);
                c.lineTo(X + 5, Y + 6);
                c.closePath();
                c.fill();
                return;
            }
            if (ch === "p") {
                rect(c, X, Y, TILE, TILE, "#d4dde8");
                if (r < 30) {
                    rect(c, X + (r % 12) + 1, Y + (r % 9) + 3, 2, 1, "#bcc7d6");
                }
                return;
            }
            if (ch === "h") {
                rect(c, X, Y, TILE, TILE, "#bfe3f5");
                rect(c, X, Y, TILE, 1, "#a6d4ea");
                rect(c, X, Y, 1, TILE, "#a6d4ea");
                if ((x * 3 + y * 7) % 5 === 0) {
                    rect(c, X + 3, Y + 4, 6, 1, "rgba(255,255,255,0.8)");
                }
                return;
            }
            if (ch === "r") {
                rect(c, X, Y, TILE, TILE, "#e8f0f8");
                rect(c, X, Y + 2, TILE, 12, "#b9a68a");
                for (let i = 0; i < 4; i++) {
                    rect(c, X + i * 4 + 1, Y + 3, 2, 10, "#6b4a2f");
                }
                rect(c, X, Y + 5, TILE, 2, "#8f98aa");
                rect(c, X, Y + 10, TILE, 2, "#8f98aa");
                return;
            }
            if (ch === "B" || ch === "D") {
                api.drawWorldTile(x, y, ch, t);
                return;
            }
            // fresh snow, with a sparkle now and then
            rect(c, X, Y, TILE, TILE, "#eef4fa");
            if (r < 26) {
                const tw = Math.sin(t / 400 + r) > 0.6;
                rect(c, X + (r % 13) + 1, Y + ((r * 3) % 13) + 1, 1, 1, tw ? "#ffffff" : "#c9d8ea");
            }
        }

        function drawTram(c, X, Y, W) {
            rect(c, X, Y - 10, W, 24, "#1a2033");
            rect(c, X + 1, Y - 9, W - 2, 22, "#ffb84a");
            for (let i = 0; i < 4; i++) {
                rect(c, X + 5 + i * 15, Y - 6, 10, 7, "#ffe9a8");
            }
            rect(c, X + W / 2 - 1, Y - 18, 2, 8, "#1a2033");
            rect(c, X + 4, Y + 9, W - 8, 3, "#54e0c7");
            dot(c, X + 10, Y + 14, 3, "#1a2033");
            dot(c, X + W - 10, Y + 14, 3, "#1a2033");
        }

        function decor(kind, x, y, w, h, drawFn, lines) {
            return { kind: kind, x: x, y: y, w: w, h: h, draw: drawFn, lines: lines, prompt: "A: Look" };
        }


        /* ---------- Scenes ---------- */

        api.SCENES.frostbit = {
            id: "frostbit",
            label: "Frostbit",
            outdoor: true,
            grid: [
                "TTTTTTTTTTTTTTTTTTTT",
                "T..................T",
                "T.BBBBB.BBBBBB.BBBBT",
                "T.BBBBB.BBBBBB.BBBBT",
                "T.BBBBB.BBBBBB.BBBBT",
                "T.BBDBB.BBBDBB.BBDBT",
                "T...p......p....p..T",
                "T.ppppppppppppppp..T",
                "T.........p........T",
                "T..hhhhhhhhhhhhhh..T",
                "T..hhhhhhhhhhhhhh..T",
                "T..hhhhhhhhhhhhhh..T",
                "T..................T",
                "TrrrrrrrrrrrrrrrrrrT",
                "TTTTTTTTTTTTTTTTTTTT"
            ],
            drawTile: snowTile,
            edges: {},
            buildings: [
                { id: "qumetal", sign: "CLEAN & METAL", x: 2, y: 2, w: 5, h: 4, door: { x: 4, y: 5 }, wall: "#eef4fa", roof: "#5d8fd6", locked: () => false },
                { id: "qujunction", sign: "JUNCTION BAY", x: 8, y: 2, w: 6, h: 4, door: { x: 11, y: 5 }, wall: "#f0eefa", roof: "#8a6fd6", locked: () => false },
                { id: "qucryo", sign: "CRYO LAB", x: 15, y: 2, w: 4, h: 4, door: { x: 17, y: 5 }, wall: "#e8f6fa", roof: "#2ebfa5", locked: () => false }
            ],
            npcs: [
                {
                    id: "drflux", name: "Dr. Flux", x: 9, y: 8, dir: "down",
                    look: { suit: "#eef4fa", accent: "#7fe6ff", visor: "#5d8fd6" },
                    talk: fluxTalk
                },
                {
                    id: "cooper", name: "Cooper the Pair", x: 5, y: 11, dir: "down",
                    draw: (c, X, Y, t) => drawCooperPair(c, X, Y, t),
                    talk: () => ["We're a Cooper pair: two electrons holding hands! Below a superconductor's critical temperature, electrons pair up like us.", "Pairs glide through the metal with zero resistance, and we can even tunnel through a Josephson junction's thin barrier together."]
                },
                {
                    id: "quinn", name: "Quinn the Quasiparticle", x: 14, y: 11, dir: "down",
                    draw: (c, X, Y, t) => drawQuasi(c, X, Y, t),
                    talk: () => ["Heh. I'm a quasiparticle: what's left when a stray photon or a bit of heat breaks a Cooper pair apart.", "I bump into qubits and steal their energy. That's why Dr. Flux shields the chips and keeps them at 10 mK. Spoilsport."]
                },
                {
                    id: "kelvina", name: "Frost Tech Tess", x: 15, y: 8, dir: "down",
                    look: { suit: "#e8f6fa", accent: "#2ebfa5", visor: "#ffd84a" },
                    talk: () => ["The dilution fridge in the Cryo Lab takes about a day to cool down, and about a day to warm up again.", "It mixes two kinds of helium, helium-3 and helium-4, to pull out the last bit of heat. It gets colder than outer space!"]
                }
            ],
            objects: [
                api.bag.pickup({ id: "frost-pmma", item: "pmma", x: 18, y: 8, text: "Half-buried in the snow: a sealed bottle of e-beam resist!" }),
                {
                    kind: "chandelier", x: 9, y: 10, w: 2, h: 2, draw: drawChandelier, label: "Fridge sculpture", prompt: "A: Look",
                    active: () => !qs().bossUp,
                    lines: ["A sculpture of a dilution refrigerator's insides: gold-plated plates, each one colder than the one above, down to about 10 mK at the bottom.", "Real ones hang inside a big metal can, and the whole thing is called the chandelier."]
                },
                {
                    kind: "wraith", x: 9, y: 10, w: 2, h: 2,
                    active: () => !!qs().bossUp,
                    draw: (c, X, Y, W, H, t) => {
                        drawChandelier(c, X, Y, W, H, t);
                        drawWraith(c, X, Y - 20, 1, t);
                        const bob = Math.round(Math.sin(t / 250) * 2);
                        rect(c, X + 28, Y - 28 + bob, 9, 11, "#1a2033");
                        rect(c, X + 29, Y - 27 + bob, 7, 9, "#ffd84a");
                        c.fillStyle = "#1a2033";
                        c.font = "bold 8px sans-serif";
                        c.textAlign = "center";
                        c.textBaseline = "middle";
                        c.fillText("!", X + 32.5, Y - 22 + bob);
                    },
                    prompt: "A: Battle The Decoherence Wraith",
                    use: () => api.say(["The fridge sculpture flickers, and a cold, shimmering shape drifts out…", "Get ready to battle!"], "", () => api.openBattle(wraithBattle()))
                },
                decor("bloch", 5, 9, 1, 1, drawBloch, [
                    "A Bloch sphere statue. A qubit's state is an arrow pointing somewhere on this sphere: up is 0, down is 1, and everywhere else is a superposition."
                ]),
                decor("bloch", 14, 9, 1, 1, drawBloch, [
                    "Another Bloch sphere. Decoherence makes the arrow shrink and drift until the qubit forgets its state."
                ]),
                {
                    kind: "tram", x: 14, y: 13, w: 4, h: 1, label: "Spark Line",
                    draw: (c, X, Y, W) => drawTram(c, X, Y, W),
                    prompt: "A: Ride the Spark Line to Carbon City",
                    use: () => api.carbonCity.rideTram("carboncity", "Carbon City", 11, 12)
                }
            ]
        };

        function bay(id, label2, floor, exitX, objects, npcs) {
            return {
                id: id,
                label: `Frostbit · ${label2}`,
                grid: api.interiorRows(),
                floor: floor,
                exitTo: { scene: "frostbit", x: exitX, y: 6 },
                objects: objects,
                npcs: npcs || []
            };
        }

        api.SCENES.qumetal = bay("qumetal", BAYS.metal, "#e8eef6", 4, [
            tool("bench", "Substrate bench", 2, 3, 3, 1, D.bench),
            tool("sputter", "Sputter tool", 8, 2, 3, 2, D.sputter),
            tool("litho", "Litho & etch", 14, 3, 3, 1, D.litho),
            api.bag.stockroom({ label: "Frostbit stockroom", items: ["nbtarget", "pmma", "alpellets"], x: 8, y: 8 })
        ], [
            { id: "fluxlab", name: "Dr. Flux", x: 4, y: 9, dir: "down", look: { suit: "#eef4fa", accent: "#7fe6ff", visor: "#5d8fd6" }, talk: fluxTalk }
        ]);

        api.SCENES.qujunction = bay("qujunction", BAYS.junction, "#ece8f6", 11, [
            tool("ebeam", "E-beam writer", 3, 2, 3, 2, D.ebeam),
            tool("evap", "Shadow evaporator", 9, 2, 2, 2, D.evap),
            tool("liftoff", "Lift-off bench", 14, 3, 3, 1, D.liftoff)
        ], [
            { id: "jtech", name: "E-beam Tech Eli", x: 9, y: 9, dir: "down", look: { suit: "#f0eefa", accent: "#8a6fd6", visor: "#7fe6ff" }, talk: () => ["Junctions are the trickiest part of a qubit. They're only a couple hundred nanometers across, and the barrier is just a few atoms thick.", "Shadow evaporation is clever: one pattern, two angles, and the junction forms itself where the shadows overlap."] }
        ]);

        api.SCENES.qucryo = bay("qucryo", BAYS.cryo, "#e6f2f6", 17, [
            tool("probe", "Room-temp probe", 2, 3, 3, 1, D.probe),
            tool("pack", "Packaging bench", 6, 3, 3, 1, D.pack),
            tool("fridge", "Dilution fridge", 11, 2, 2, 3, D.fridge),
            tool("measure", "Measurement rack", 15, 2, 3, 2, D.measure)
        ]);

        function fluxTalk() {
            const s = qs();
            const name = api.currentChar() ? api.currentChar().name : "engineer";
            if (!s.recipe) {
                return {
                    lines: [
                        `${name}! Welcome to Frostbit, the coldest town around. I'm Dr. Flux.`,
                        "We build qubits here: superconducting circuits that follow the rules of quantum physics. Most of the quantum computers being built today run on chips like these.",
                        "It takes three bays: the Clean & Metal Bay for the circuit, the Junction Bay for the Josephson junction, and the Cryo Lab, where we cool it to 10 mK and talk to it with microwaves.",
                        "Bring a wafer from Silicon Beach and S1813 from the Foundry. The rest is in our stockroom.",
                        "📋 Recipe added! Press R or tap Recipe any time. Each step says which bay it's in."
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
                    return ["The Decoherence Wraith is haunting the fridge sculpture in the plaza! Go!"];
                }
                return {
                    lines: [`Your best qubit: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}. Want to build another?`, "I'll reset the bays for you."],
                    done: () => {
                        resetRun();
                        api.toast("Fresh qubit: back to step 1");
                    }
                };
            }
            const st = STEPS[s.step];
            return [`Next step: ${st.name}.`, `That's at the ${st.where} in the ${BAYS[st.bay]}. My card there has the settings.`];
        }
    });

})();
