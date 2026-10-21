/* ========================================
   FAB VALLEY ADVENTURE: GREY MATTER
   East of Glucose Grove. Doctors at the
   Neuro Hospital want to measure brain
   chemicals (neurotransmitters) for four
   patients: Parkinson's disease, a
   traumatic brain injury, epilepsy and a
   depression study. Dr. Axon's NeuroFab
   builds a carbon-fiber microelectrode for
   dopamine and serotonin (FSCV) and a
   platinum glutamate biosensor, calibrates
   them in a flow cell, and sterilizes them.
   Boss: The Glial Scar.

   Facts follow the Neurotransmitters course
   (units 14, 16, 17): 5–7 µm carbon fibers;
   FSCV holds −0.4 V, sweeps to +1.3 V at
   400 V/s, ten times a second; dopamine
   oxidizes near +0.6 V; ascorbic acid is
   the main look-alike; glutamate and GABA
   aren't electroactive, so they need
   enzymes. Serotonin uses the Jackson
   waveform (+0.2 → +1.0 → −0.1 V at
   1000 V/s). Signal sizes are teaching
   values.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const TILE = api.TILE;
        const rect = api.rect;
        const ui = api.ui;
        const $ = (id) => document.getElementById(id);

        api.TYPES.neuro = { label: "Neural sensors", icon: "🧠" };


        /* ---------- Recipe ---------- */

        const PHASES = {
            fiber: "Carbon-fiber microelectrode",
            glu: "Glutamate biosensor",
            bench: "Flow-cell calibration",
            ship: "Sterilizing",
            ward: "Neuro Hospital"
        };

        const STEPS = [
            {
                id: "fiber", phase: "fiber", tool: "fiber", short: "Load the fiber", where: "fiber bench in the NeuroFab",
                name: "Thread a 7 µm carbon fiber into a borosilicate glass capillary",
                card: ["Fiber: <strong>7 µm carbon fiber</strong>, about a tenth the width of a hair. Small probes damage less tissue and sense a tiny region.",
                    "Capillary: <strong>borosilicate glass</strong>, which softens and stretches cleanly in the puller."]
            },
            {
                id: "pull", phase: "fiber", tool: "puller", short: "Pull the capillary", where: "pipette puller in the NeuroFab",
                name: "Pull the capillary to a fine tip around the fiber (heat 65%, medium pull)",
                card: ["Heat: <strong>65%</strong> (60–70% works). Too cool and the glass won't taper; too hot and it snaps.",
                    "Pull strength: <strong>medium</strong>.",
                    "The glass stretches into a long, thin taper that hugs the carbon fiber."]
            },
            {
                id: "epoxy", phase: "fiber", tool: "epoxy", short: "Seal with epoxy", where: "epoxy station in the NeuroFab",
                name: "Seal the glass–fiber joint: dip in epoxy for 30 s, cure at 100 °C for 8 h",
                card: ["Dip: <strong>30 seconds</strong> (20–60 s) in low-viscosity epoxy. It wicks into the tip and seals the gap between glass and fiber.",
                    "Cure: <strong>100 °C</strong> (80–120 °C) for <strong>8 hours</strong> or more.",
                    "A leaky seal lets solution creep inside, giving a huge, noisy background."]
            },
            {
                id: "cut", phase: "fiber", tool: "scope", short: "Trim the fiber", where: "cutting microscope in the NeuroFab",
                name: "Trim the exposed carbon fiber to 100 µm under the microscope",
                card: ["Exposed length: <strong>100 µm</strong> (50–150 µm works).",
                    "Shorter means a smaller signal. Longer means more area and noise, and a fragile tip that can bend or snap."]
            },
            {
                id: "nafion", phase: "fiber", tool: "nafion", short: "Nafion coat", where: "Nafion station in the NeuroFab",
                name: "Dip-coat the fiber with Nafion (5% for 30 s, dry at 70 °C for 10 min)",
                card: ["Coating: <strong>Nafion</strong>, a polymer with negative charges.",
                    "Why: it repels negatively charged look-alikes such as ascorbic acid (vitamin C) and DOPAC, and attracts positively charged dopamine and serotonin.",
                    "Dip <strong>30 s</strong>, then dry at <strong>70 °C</strong> for about 10 minutes."]
            },
            {
                id: "condition", phase: "fiber", tool: "fscv", short: "Condition", where: "FSCV rig in the NeuroFab",
                name: "Condition the electrode: run the scan at 60 Hz for 15 min",
                card: ["Run the FSCV waveform at <strong>60 Hz for 15 minutes</strong> (10 minutes or more).",
                    "It cleans and stabilizes the carbon surface, so the background stops drifting."]
            },
            {
                id: "mpd", phase: "glu", tool: "pt", short: "Exclusion layer", where: "platinum array bench in the Sensor Test Lab",
                name: "Electroplate an mPD exclusion layer on the platinum sites (20 min)",
                card: ["Layer: <strong>mPD</strong> (poly-m-phenylenediamine), grown on the platinum by cycling the voltage in mPD solution.",
                    "It lets tiny H₂O₂ molecules through but blocks ascorbic acid and dopamine.",
                    "Time: <strong>20 minutes</strong> (15–30)."]
            },
            {
                id: "enzyme", phase: "glu", tool: "enzyme", short: "Enzyme and sentinel", where: "enzyme spotter in the Sensor Test Lab",
                name: "Coat site 1 with glutamate oxidase; coat site 2 (the sentinel) with BSA only",
                card: ["Site 1: <strong>glutamate oxidase</strong> (GluOx) + BSA + glutaraldehyde. It turns glutamate into H₂O₂, which platinum can read.",
                    "Site 2, the <strong>sentinel</strong>: BSA + glutaraldehyde with <strong>no enzyme</strong>. It feels everything except glutamate.",
                    "Subtracting site 2 from site 1 leaves only the glutamate signal (self-referencing)."]
            },
            {
                id: "fscvcal", phase: "bench", tool: "flowcell", short: "FSCV calibration", where: "flow cell in the Sensor Test Lab",
                name: "Set the FSCV scan, inject dopamine, and identify unknowns by their fingerprint",
                card: ["Dopamine scan: hold <strong>−0.4 V</strong>, sweep to <strong>+1.3 V</strong> and back at <strong>400 V/s</strong>, <strong>10 times a second</strong> (all vs Ag/AgCl).",
                    "Dopamine fingerprint: oxidation peak near <strong>+0.6 V</strong>, reduction peak near <strong>−0.2 V</strong>.",
                    "Serotonin peaks a bit higher, ascorbic acid has no return peak, and a pH change makes a wavy shape at both ends."]
            },
            {
                id: "glucal", phase: "bench", tool: "glucal", short: "Glutamate calibration", where: "glutamate flow cell in the Sensor Test Lab",
                name: "Calibrate the glutamate sensor at +0.7 V and check it ignores ascorbic acid and dopamine",
                card: ["Hold the platinum at <strong>+0.7 V</strong> vs Ag/AgCl.",
                    "Add glutamate in <strong>20 µM steps</strong>, then the interferents: ascorbic acid (250 µM) and dopamine (2 µM).",
                    "Look at site 1 minus the sentinel: it should step up with glutamate and stay flat for the interferents."]
            },
            {
                id: "steril", phase: "ship", tool: "eto", short: "Sterilize", where: "sterilizer in the Sensor Test Lab",
                name: "Sterilize the probes with ethylene oxide gas",
                card: ["Method: <strong>ethylene oxide (EtO)</strong> gas, a low-temperature sterilant.",
                    "Never steam autoclave: the heat kills the enzyme and cracks the epoxy seal.",
                    "Alcohol wipes only disinfect; they don't sterilize."]
            },
            {
                id: "ward", phase: "ward", tool: "patients", short: "Help the patients", where: "Neuro Hospital",
                name: "At the Neuro Hospital, pick the right measurement for each of four patients",
                card: ["<strong>Dopamine</strong>: FSCV, standard −0.4 / +1.3 V scan.",
                    "<strong>Serotonin</strong>: FSCV with the serotonin (Jackson) scan, +0.2 → +1.0 → −0.1 V at 1000 V/s.",
                    "<strong>Glutamate</strong>: the platinum enzyme biosensor at +0.7 V. FSCV can't see glutamate."]
            }
        ];

        function ns() {
            const s = api.save();
            if (!s.neuro) {
                s.neuro = { recipe: false, step: 0, defects: {}, data: {}, stepXp: {}, runs: 0, best: 0, helped: {}, boss: false, bossUp: false };
            }
            return s.neuro;
        }

        function current() {
            return STEPS[ns().step];
        }

        function isCurrentTool(tool) {
            const s = ns();
            return s.recipe && STEPS[s.step] && STEPS[s.step].tool === tool;
        }

        function defect(sev, cause) {
            return { sev: sev, cause: cause };
        }

        function allDefects() {
            const s = ns();
            return STEPS.reduce((l, st) => l.concat(s.defects[st.id] || []), []);
        }

        function cardHtml(st) {
            st = st || current();
            return st && st.card
                ? `<div class="adv-card"><p class="adv-card-title">📋 Dr. Axon's card</p><ul>${st.card.map((x) => `<li>${x}</li>`).join("")}</ul></div>`
                : "";
        }

        function open(title, lead, body, opts) {
            return api.openModal(`
                ${api.head("neuro", title)}
                <p class="adv-round">Recipe step ${ns().step + 1} of ${STEPS.length}</p>
                <p class="adv-lead">${lead}</p>
                ${cardHtml()}
                ${body}`, opts);
        }

        function completeStep(defs, summary) {
            const s = ns();
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
                    ${next ? `<p class="adv-lead">Next: <strong>${next.name}</strong>${next.tool === "patients" ? "." : ` at the ${next.where}.`}</p>` : ""}
                    <button type="button" class="adv-btn" data-close>Back to work</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
        }

        function resetRun() {
            const s = ns();
            s.step = 0;
            s.defects = {};
            s.data = {};
            s.helped = {};
            s.runs++;
            api.writeSave();
        }

        function noise(a) {
            return (Math.random() - 0.5) * 2 * a;
        }


        /* ---------- The probes, as the test gear sees them ---------- */

        function model() {
            const d = ns().data;
            const m = {
                daSens: 25,          // nA per µM dopamine, a 100 µm fiber
                aaLeak: 0.02,        // ascorbic acid signal relative to dopamine's, per µM
                noise: 0.6,
                drift: 0,
                gluSens: 0.3,        // nA per µM glutamate on site 1
                gluInterf: 0,        // fraction of interferent current left after subtraction
                gluDead: false,
                sentinel: true,
                fibDead: false,
                damage: 0
            };
            const fiber = d.fiber || "c7";
            if (fiber === "c33") {
                m.damage = 1;
            } else if (fiber === "pt") {
                m.daSens *= 0.3;
                m.damage = 2;
            } else if (fiber === "cu") {
                m.fibDead = true;
            }
            if (d.pull === "thick") {
                m.damage += 1;
            }
            if (d.seal === "leak") {
                m.noise *= 6;
            }
            const len = d.len || 100;
            m.daSens *= len / 100;
            m.noise *= Math.sqrt(len / 100);
            if (!d.nafion) {
                m.aaLeak = 0.35;
            }
            if (!d.conditioned) {
                m.drift = 1;
            }
            if (d.mpd === "none") {
                m.gluInterf = 0.5;
            } else if (d.mpd === "thin") {
                m.gluInterf = 0.15;
            } else if (d.mpd === "nafion") {
                m.gluInterf = 0.25;
            }
            if (d.enz === "gox" || d.enz === "none") {
                m.gluDead = true;
            }
            if (d.sentinel !== "bsa") {
                m.sentinel = false;
            }
            if (d.steril === "steam") {
                m.gluDead = true;
                m.noise *= 4;
            }
            if (m.fibDead) {
                m.daSens = 0;
            }
            return m;
        }


        /* ---------- Station: fiber bench ---------- */

        function openFiber() {
            let fiber = null;
            let cap = null;
            open("Fiber Bench", "A carbon-fiber microelectrode starts as a single carbon fiber threaded into a glass tube. A tiny bit of fiber will poke out of the tip to touch the brain fluid. The glass insulates everything else.", `
                <p class="adv-round">Sensing fiber</p>
                ${ui.chips("fib", [{ id: "c7", label: "Carbon fiber, 7 µm" }, { id: "c33", label: "Carbon fiber, 33 µm" }, { id: "pt", label: "Platinum wire, 125 µm" }, { id: "cu", label: "Copper wire, 50 µm" }], null)}
                <p class="adv-round">Capillary</p>
                ${ui.chips("cap", [{ id: "glass", label: "Borosilicate glass" }, { id: "plastic", label: "Plastic tubing" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="fbGo" data-autofocus>Thread the fiber</button></div>
                <p class="adv-result" id="fbRes" aria-live="polite"></p>`);
            ui.wireChips("fib", (v) => { fiber = v; });
            ui.wireChips("cap", (v) => { cap = v; });
            $("fbGo").addEventListener("click", () => {
                if (!fiber || !cap) {
                    ui.result("fbRes", "Choose a fiber and a capillary first.", false);
                    return;
                }
                if (cap === "plastic") {
                    ui.result("fbRes", "Plastic tubing can't be heated and pulled to a fine tip, and it doesn't seal around the fiber. Use borosilicate glass.", false);
                    return;
                }
                const defs = [];
                if (fiber === "c33") {
                    defs.push(defect("minor", "A 33 µm fiber is almost five times wider than needed. A bigger probe damages more tissue and triggers more scarring."));
                } else if (fiber === "pt") {
                    defs.push(defect("major", "A 125 µm platinum wire is huge for brain tissue, and platinum fouls quickly with dopamine. Carbon is the standard for FSCV."));
                } else if (fiber === "cu") {
                    defs.push(defect("major", "Copper corrodes in salty brain fluid and is toxic to neurons. The probe won't give a usable signal."));
                }
                ns().data.fiber = fiber;
                completeStep(defs, `<p>Threaded a ${{ c7: "7 µm carbon fiber", c33: "33 µm carbon fiber", pt: "125 µm platinum wire", cu: "50 µm copper wire" }[fiber]} into a borosilicate capillary by suction.</p>`);
            });
        }


        /* ---------- Station: pipette puller ---------- */

        function openPuller() {
            let pull = null;
            let busy = false;
            const m = open("Pipette Puller", "A heating coil softens the middle of the glass capillary while weights pull both ends apart. The glass stretches into a long taper that hugs the fiber, then separates into two electrodes.", `
                <div class="adv-machine">
                    <canvas id="ppCv" width="220" height="200"></canvas>
                    <div>
                        ${ui.slider("ppHeat", "Heater", "%", 30, 100, 5, 40)}
                        <p class="adv-round">Pull strength</p>
                        ${ui.chips("pull", [{ id: "light", label: "Light" }, { id: "medium", label: "Medium" }, { id: "hard", label: "Hard" }], null)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="ppGo" data-autofocus>Pull</button></div>
                        <p class="adv-result" id="ppRes" aria-live="polite"></p>
                    </div>
                </div>`);
            const c = $("ppCv").getContext("2d");
            const hEl = ui.wireSlider("ppHeat");
            ui.wireChips("pull", (v) => { pull = v; });

            function draw(k, heat, snap) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 200);
                const gap = k * 50;
                const neck = Math.max(1, 8 - k * 7);
                c.fillStyle = "rgba(220, 235, 255, 0.8)";
                c.beginPath();
                c.moveTo(10, 92);
                c.lineTo(100 - gap / 2, 92);
                c.lineTo(110 - gap / 4, 100 - neck / 2);
                c.lineTo(110 - gap / 4, 100 + neck / 2);
                c.lineTo(100 - gap / 2, 108);
                c.lineTo(10, 108);
                c.fill();
                c.beginPath();
                c.moveTo(210, 92);
                c.lineTo(120 + gap / 2, 92);
                c.lineTo(110 + gap / 4, 100 - neck / 2);
                c.lineTo(110 + gap / 4, 100 + neck / 2);
                c.lineTo(120 + gap / 2, 108);
                c.lineTo(210, 108);
                c.fill();
                rect(c, 10, 99, 200, 1, "#1a2033");
                c.strokeStyle = `rgba(255, ${140 - heat}, 60, ${0.3 + heat / 150})`;
                c.lineWidth = 3;
                for (let i = 0; i < 4; i++) {
                    c.beginPath();
                    c.ellipse(110, 100, 16, 22, 0, 0, Math.PI * 2);
                    c.stroke();
                }
                if (snap) {
                    c.fillStyle = "#ff6b7d";
                    c.font = "bold 13px sans-serif";
                    c.textAlign = "center";
                    c.fillText("SNAP!", 110, 160);
                }
            }

            draw(0, 0);
            $("ppGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!pull) {
                    ui.result("ppRes", "Choose a pull strength first.", false);
                    return;
                }
                busy = true;
                const H = Number(hEl.value);
                const snaps = H > 80 && pull === "hard";
                ui.animate(m, 3000, (k) => draw(H < 50 ? k * 0.4 : k, H, snaps && k > 0.6), () => {
                    busy = false;
                    if (snaps) {
                        ui.result("ppRes", `At ${H}% with a hard pull the glass went runny and snapped before it could wrap the fiber. Turn the heat down.`, false);
                        draw(0, 0);
                        return;
                    }
                    if (H < 50) {
                        ui.result("ppRes", `At ${H}% the glass barely softened and didn't separate. Turn the heat up.`, false);
                        draw(0, 0);
                        return;
                    }
                    const defs = [];
                    let shape = "good";
                    if (H < 60 || pull === "light") {
                        shape = "thick";
                        defs.push(defect("minor", "The glass tapered too little, leaving a thick, blunt tip that pushes more tissue aside going in."));
                    } else if (H > 75 || pull === "hard") {
                        shape = "thin";
                        defs.push(defect("minor", "The taper came out very long and whisker-thin. The tip is fragile and wobbles as it goes in."));
                    }
                    ns().data.pull = shape;
                    completeStep(defs, `<p>Pulled at ${H}% heat with a ${pull} pull. The capillary separated into two electrodes, each with the glass tapered snugly around the fiber.</p>`);
                });
            });
        }


        /* ---------- Stage player for the step-by-step animations ---------- */

        // Plays [{ caption, dur, draw(k, now) }] in order, numbering each caption.
        function runStages(m, capId, stages, done) {
            let i = 0;
            const next = () => {
                if (i >= stages.length) {
                    done();
                    return;
                }
                const st = stages[i++];
                $(capId).innerHTML = `<strong>Step ${i} of ${stages.length}:</strong> ${st.caption}`;
                ui.animate(m, st.dur, st.draw, next);
            };
            next();
        }

        function label(c, text, x, y, color, align) {
            c.fillStyle = color || "#a9b2d0";
            c.font = "11px sans-serif";
            c.textAlign = align || "left";
            c.fillText(text, x, y);
        }

        function particle(c, x, y, r, fill, sign) {
            c.fillStyle = fill;
            c.beginPath();
            c.arc(x, y, r, 0, Math.PI * 2);
            c.fill();
            if (sign) {
                c.fillStyle = "#1a2033";
                c.font = `bold ${Math.round(r * 1.6)}px sans-serif`;
                c.textAlign = "center";
                c.textBaseline = "middle";
                c.fillText(sign, x, y + 0.5);
                c.textBaseline = "alphabetic";
            }
        }


        /* ---------- Station: epoxy ---------- */

        function openEpoxy() {
            let busy = false;
            const m = open("Epoxy Station & Oven", "The pulled glass hugs the fiber, but there's still a microscopic gap. A dip in thin epoxy wicks into the gap, and baking hardens it into a watertight seal.", `
                <canvas id="epCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="epCap">The tip of your electrode, with a close-up of where the glass meets the fiber.</p>
                ${ui.slider("epDip", "Dip time", "s", 0, 120, 5, 5)}
                ${ui.slider("epT", "Cure temperature", "°C", 25, 200, 5, 160)}
                ${ui.slider("epH", "Cure time", "h", 1, 24, 1, 2)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="epGo" data-autofocus>Dip and cure</button></div>
                <p class="adv-result" id="epRes" aria-live="polite"></p>`);
            const c = $("epCv").getContext("2d");
            const dEl = ui.wireSlider("epDip");
            const tEl = ui.wireSlider("epT");
            const hEl = ui.wireSlider("epH");

            // s: { tipY, fill, coat, cure, oven, ovenT, hours, leak, crack, now }
            function draw(s) {
                c.clearRect(0, 0, 460, 230);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 230);

                if (s.oven) {
                    rect(c, 20, 20, 270, 190, "#3a4256");
                    rect(c, 30, 30, 250, 170, `rgba(255, ${150 - s.ovenGlow * 60}, 60, ${0.15 + s.ovenGlow * 0.35})`);
                    label(c, `Oven ${Math.round(s.ovenT)} °C · ${s.hours.toFixed(1)} h`, 40, 50, "#f5f7ff");
                }

                // epoxy cup
                if (s.cup) {
                    rect(c, 190, 150, 90, 60, "#d9e2f0");
                    rect(c, 194, 158, 82, 48, "rgba(242, 216, 120, 0.9)");
                    label(c, "liquid epoxy", 235, 222, "#a9b2d0", "center");
                }

                // electrode: glass taper with the carbon fiber inside
                const y = 100 + s.tipY;
                c.fillStyle = "rgba(220, 235, 255, 0.55)";
                c.beginPath();
                c.moveTo(10, y - 26);
                c.lineTo(230, y - 4);
                c.lineTo(230, y + 4);
                c.lineTo(10, y + 26);
                c.fill();
                rect(c, 10, y - 1.5, 260, 3, "#c8ceda");
                // epoxy that crept onto the exposed fiber
                if (s.coat > 0) {
                    rect(c, 230, y - 3, 40 * s.coat, 6, `rgba(242, 216, 120, ${0.4 + 0.5 * s.cure})`);
                }
                label(c, "glass", 40, y - 30);
                label(c, "carbon fiber", 200, y + 22);

                // magnified view of the glass–fiber gap
                const mx = 392;
                const my = 66;
                c.save();
                c.beginPath();
                c.arc(mx, my, 62, 0, Math.PI * 2);
                c.clip();
                rect(c, mx - 62, my - 62, 124, 124, "#141a2e");
                rect(c, mx - 62, my - 40, 124, 22, "rgba(220, 235, 255, 0.6)");
                rect(c, mx - 62, my + 18, 124, 22, "rgba(220, 235, 255, 0.6)");
                rect(c, mx - 62, my - 6, 124, 12, "#c8ceda");
                // the gaps, filling with epoxy from the tip (right side) inward
                const gapFill = 124 * s.fill;
                const ep = s.cure > 0.5 ? `rgba(214, 150, 50, 0.95)` : `rgba(242, 216, 120, 0.9)`;
                rect(c, mx + 62 - gapFill, my - 18, gapFill, 12, ep);
                rect(c, mx + 62 - gapFill, my + 6, gapFill, 12, ep);
                if (s.leak) {
                    for (let i = 0; i < 4; i++) {
                        const x = mx + 60 - ((s.now / 12 + i * 30) % 120);
                        particle(c, x, my - 12, 3, "#7fb2ff");
                        particle(c, x - 15, my + 12, 3, "#7fb2ff");
                    }
                }
                if (s.crack) {
                    c.strokeStyle = "#ff6b7d";
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(mx - 10, my - 18);
                    c.lineTo(mx - 4, my - 12);
                    c.lineTo(mx - 9, my - 7);
                    c.moveTo(mx + 20, my + 6);
                    c.lineTo(mx + 26, my + 12);
                    c.lineTo(mx + 21, my + 18);
                    c.stroke();
                }
                c.restore();
                c.strokeStyle = "#a9b2d0";
                c.lineWidth = 2;
                c.beginPath();
                c.arc(mx, my, 62, 0, Math.PI * 2);
                c.stroke();
                label(c, "close-up of the seal", mx, my + 78, "#a9b2d0", "center");
                if (s.verdict) {
                    c.font = "bold 13px sans-serif";
                    c.fillStyle = s.verdictColor;
                    c.textAlign = "center";
                    c.fillText(s.verdict, mx, my + 98);
                }
            }

            const base = { tipY: 0, fill: 0, coat: 0, cure: 0, oven: false, ovenT: 25, ovenGlow: 0, hours: 0, leak: false, crack: false, now: 0, cup: true };
            draw(base);

            $("epGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const dip = Number(dEl.value);
                const T = Number(tEl.value);
                const H = Number(hEl.value);
                const fillTo = Math.min(1, dip / 20);
                const coatTo = dip > 60 ? Math.min(1, (dip - 60) / 40) : 0;
                const cureTo = T < 80 || H < 4 ? 0.35 : 1;
                const leak = dip < 20 || T < 80 || H < 4;
                const crack = T > 150;
                const s = Object.assign({}, base);

                runStages(m, "epCap", [
                    {
                        caption: "The pulled glass is snug around the fiber, but the close-up shows a tiny gap on each side. Brain fluid could seep in there.",
                        dur: 3000,
                        draw: () => draw(s)
                    },
                    {
                        caption: `Dipping the tip into thin epoxy for ${dip} s. Capillary action pulls the epoxy into the gap, filling it from the tip inward.${dip > 60 ? " Left in too long, it also climbs onto the exposed fiber." : ""}`,
                        dur: 4000,
                        draw: (k) => {
                            s.tipY = k < 0.25 ? k / 0.25 * 70 : k > 0.8 ? (1 - (k - 0.8) / 0.2) * 70 : 70;
                            s.fill = fillTo * Math.min(1, Math.max(0, (k - 0.2) / 0.6));
                            s.coat = coatTo * Math.min(1, Math.max(0, (k - 0.4) / 0.4));
                            draw(s);
                        }
                    },
                    {
                        caption: `Baking at ${T} °C for ${H} h. Heat makes the epoxy molecules link up and harden (cure); it darkens from pale yellow to amber.`,
                        dur: 4000,
                        draw: (k) => {
                            s.cup = false;
                            s.tipY = 0;
                            s.oven = true;
                            s.ovenT = 25 + (T - 25) * Math.min(1, k * 2);
                            s.ovenGlow = Math.min(1, (T - 25) / 150) * Math.min(1, k * 2);
                            s.hours = H * k;
                            s.cure = cureTo * k;
                            draw(s);
                        }
                    },
                    {
                        caption: leak
                            ? "Testing in solution: the seal is incomplete or soft, and fluid (blue) creeps into the gap. That leak shows up as a huge, noisy background current."
                            : crack
                                ? "Testing in solution: the seal is hard, but baking that hot made the epoxy brittle, and it cracked."
                                : "Testing in solution: the gap is filled with hard amber epoxy. Nothing gets in, so only the exposed fiber touches the fluid.",
                        dur: 3500,
                        draw: (k, now) => {
                            s.oven = false;
                            s.leak = leak;
                            s.crack = crack;
                            s.now = now;
                            s.verdict = leak ? "✗ Leaky seal" : crack ? "⚠ Cracked" : "✓ Sealed";
                            s.verdictColor = leak ? "#ff9aa6" : crack ? "#ffd84a" : "#5be38a";
                            draw(s);
                        }
                    }
                ], () => {
                    const defs = [];
                    let seal = "good";
                    if (dip < 20) {
                        seal = "leak";
                        defs.push(defect("major", `A ${dip} s dip didn't let the epoxy wick into the gap. Solution will creep up inside the glass and swamp the signal with noise.`));
                    } else if (dip > 60) {
                        defs.push(defect("minor", `A ${dip} s dip let epoxy climb onto the fiber itself, covering part of the sensing surface.`));
                    }
                    if (T < 80 || H < 4) {
                        seal = "leak";
                        defs.push(defect("major", `${T} °C for ${H} h didn't fully harden the epoxy, so the seal is soft and leaks.`));
                    } else if (T > 150) {
                        defs.push(defect("minor", `${T} °C made the epoxy brittle, and it cracked at the tip.`));
                    }
                    ns().data.seal = seal;
                    completeStep(defs, `<p>Dipped ${dip} s, cured at ${T} °C for ${H} h.</p>`);
                });
            });
        }


        /* ---------- Station: cutting microscope ---------- */

        function openScope() {
            const m = open("Cutting Microscope", "Under the microscope, a scalpel trims the carbon fiber sticking out of the glass. The exposed length is the sensing surface.", `
                <canvas id="csCv" width="460" height="200" class="adv-wide-canvas"></canvas>
                ${ui.slider("csLen", "Cut at", "µm from the glass", 10, 300, 10, 250)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="csGo" data-autofocus>Cut</button></div>
                <p class="adv-result" id="csRes" aria-live="polite"></p>`);
            const c = $("csCv").getContext("2d");
            const lEl = ui.wireSlider("csLen", null, (v) => draw(v, false));

            function draw(len, cut) {
                c.clearRect(0, 0, 460, 200);
                c.fillStyle = "#1a2a2a";
                c.fillRect(0, 0, 460, 200);
                // glass taper
                c.fillStyle = "rgba(220, 235, 255, 0.55)";
                c.beginPath();
                c.moveTo(0, 60);
                c.lineTo(110, 92);
                c.lineTo(110, 108);
                c.lineTo(0, 140);
                c.fill();
                // fiber: full 300 µm until cut
                const px = (um) => 110 + um * 1.1;
                // the fiber, drawn lighter than it really is so it shows on the dark field
                rect(c, 110, 97, (cut ? px(len) : px(300)) - 110, 5, "#c8ceda");
                rect(c, 110, 97, (cut ? px(len) : px(300)) - 110, 1, "#ffffff");
                // ruler
                c.strokeStyle = "#a9b2d0";
                c.fillStyle = "#a9b2d0";
                c.font = "10px sans-serif";
                c.textAlign = "center";
                for (let u = 0; u <= 300; u += 50) {
                    c.beginPath();
                    c.moveTo(px(u), 150);
                    c.lineTo(px(u), u % 100 ? 156 : 160);
                    c.stroke();
                    c.fillText(u + " µm", px(u), 172);
                }
                // scalpel
                if (!cut) {
                    c.fillStyle = "#c8ceda";
                    c.beginPath();
                    c.moveTo(px(len) - 2, 40);
                    c.lineTo(px(len) + 8, 40);
                    c.lineTo(px(len) + 1, 96);
                    c.fill();
                }
            }
            draw(250, false);

            $("csGo").addEventListener("click", () => {
                const len = Number(lEl.value);
                draw(len, true);
                const defs = [];
                if (len < 50) {
                    defs.push(defect("minor", `Only ${len} µm of fiber is exposed, so the sensing area and the signal are small.`));
                } else if (len > 150) {
                    defs.push(defect("minor", `${len} µm of exposed fiber is long and fragile, and its larger area picks up more noise.`));
                }
                ns().data.len = len;
                setTimeout(() => completeStep(defs, `<p>Trimmed the fiber to <strong>${len} µm</strong> past the glass.</p>`), 900);
            });
        }


        /* ---------- Station: Nafion ---------- */

        function openNafion() {
            let coat = null;
            let busy = false;
            const m = open("Nafion Station", "Brain fluid holds ascorbic acid (vitamin C) at hundreds of micromolar, far more than dopamine, and it also oxidizes at carbon. A charged polymer coat helps the electrode ignore it.", `
                <canvas id="nfCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="nfCap">Your electrode tip, and a beaker of 5% Nafion solution.</p>
                <p class="adv-round">Coating</p>
                ${ui.chips("coat", [{ id: "nafion", label: "Nafion (negatively charged)" }, { id: "none", label: "No coating" }], null)}
                ${ui.slider("nfDip", "Dip time", "s", 5, 120, 5, 5)}
                ${ui.slider("nfT", "Dry at", "°C", 25, 150, 5, 25)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="nfGo" data-autofocus>Coat</button></div>
                <p class="adv-result" id="nfRes" aria-live="polite"></p>`);
            ui.wireChips("coat", (v) => { coat = v; });
            const dEl = ui.wireSlider("nfDip");
            const tEl = ui.wireSlider("nfT");
            const c = $("nfCv").getContext("2d");

            function tipView(tipY, film, heat, beaker) {
                c.clearRect(0, 0, 460, 230);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 230);
                if (beaker) {
                    rect(c, 250, 140, 110, 70, "#d9e2f0");
                    rect(c, 254, 150, 102, 56, "rgba(127, 178, 255, 0.7)");
                    label(c, "5% Nafion solution", 305, 224, "#a9b2d0", "center");
                }
                if (heat > 0) {
                    rect(c, 230, 190, 150, 14, `rgb(${120 + heat * 130}, ${90 + heat * 40}, 70)`);
                    label(c, "drying on the hotplate", 305, 224, "#a9b2d0", "center");
                }
                const y = 90 + tipY;
                c.fillStyle = "rgba(220, 235, 255, 0.55)";
                c.beginPath();
                c.moveTo(10, y - 26);
                c.lineTo(260, y - 4);
                c.lineTo(260, y + 4);
                c.lineTo(10, y + 26);
                c.fill();
                rect(c, 10, y - 1.5, 330, 3, "#c8ceda");
                if (film > 0) {
                    c.strokeStyle = `rgba(127, 178, 255, ${0.3 + film * 0.6})`;
                    c.lineWidth = 1 + film * 3;
                    c.strokeRect(258, y - 3 - film * 2, 84, 6 + film * 4);
                }
                label(c, "carbon fiber", 270, y - 14);
            }

            // close-up of the fiber surface with molecules arriving
            function surfaceView(k, coated, now) {
                c.clearRect(0, 0, 460, 230);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 230);
                rect(c, 0, 190, 460, 40, "#5d6577");
                label(c, "carbon fiber surface", 10, 222, "#f5f7ff");
                const filmTop = coated ? 150 : 190;
                if (coated) {
                    rect(c, 0, 150, 460, 40, "rgba(127, 178, 255, 0.35)");
                    for (let x = 14; x < 460; x += 28) {
                        particle(c, x, 170, 5, "rgba(127, 178, 255, 0.9)", "−");
                    }
                    label(c, "Nafion film (fixed − charges)", 300, 144, "#7fb2ff");
                }
                // dopamine (+) passes through; ascorbate (−) is pushed back by the film
                for (let i = 0; i < 7; i++) {
                    const ph = ((now / 2600) + i / 7) % 1;
                    const x = 30 + i * 62;
                    const yd = 20 + ph * 170;
                    particle(c, x, Math.min(yd, 184), 7, "#ffd84a", "+");
                    if (yd >= 182) {
                        label(c, "e⁻", x + 9, 186, "#ffd84a");
                    }
                    const ya0 = 20 + ((ph + 0.5) % 1) * 170;
                    let ya = ya0;
                    if (coated && ya0 > filmTop - 10) {
                        ya = 2 * (filmTop - 10) - ya0;
                    }
                    particle(c, x + 28, Math.min(ya, 184), 7, "#ff8a5c", "−");
                }
                label(c, "+ dopamine", 10, 16, "#ffd84a");
                label(c, "− ascorbate (vitamin C)", 110, 16, "#ff8a5c");
                label(c, coated ? "Ascorbate bounces off; dopamine reaches the carbon." : "With no film, both reach the carbon and both make current.", 10, 34, coated ? "#5be38a" : "#ff9aa6");
            }

            tipView(0, 0, 0, true);

            $("nfGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!coat) {
                    ui.result("nfRes", "Choose a coating first.", false);
                    return;
                }
                busy = true;
                const dip = Number(dEl.value);
                const T = Number(tEl.value);
                const coated = coat === "nafion";
                const filmTo = coated ? Math.min(1, dip / 30) : 0;
                const stages = coated ? [
                    {
                        caption: `Dipping the tip into Nafion for ${dip} s. A thin liquid film clings to the fiber as it comes out.`,
                        dur: 3500,
                        draw: (k) => tipView(k < 0.3 ? k / 0.3 * 70 : k > 0.75 ? (1 - (k - 0.75) / 0.25) * 70 : 70, filmTo * Math.max(0, (k - 0.3) / 0.45), 0, true)
                    },
                    {
                        caption: `Drying at ${T} °C. The solvent evaporates, leaving a solid Nafion skin (blue) wrapped around the fiber.`,
                        dur: 3500,
                        draw: (k) => tipView(0, filmTo, Math.min(1, (T - 25) / 100) * Math.min(1, k * 2), false)
                    },
                    {
                        caption: "Up close: Nafion is full of fixed negative charges. Positively charged dopamine slips through to the carbon, while negatively charged ascorbate (vitamin C) is pushed back.",
                        dur: 6000,
                        draw: (k, now) => surfaceView(k, true, now)
                    }
                ] : [
                    {
                        caption: "No coating: the carbon fiber stays bare.",
                        dur: 2500,
                        draw: () => tipView(0, 0, 0, false)
                    },
                    {
                        caption: "Up close: with no film, ascorbate (vitamin C) reaches the carbon along with dopamine. There's far more ascorbate in brain fluid, so its current buries the dopamine signal.",
                        dur: 6000,
                        draw: (k, now) => surfaceView(k, false, now)
                    }
                ];
                runStages(m, "nfCap", stages, () => {
                    const defs = [];
                    if (!coated) {
                        defs.push(defect("major", "Without Nafion, ascorbic acid reaches the carbon and oxidizes, burying the dopamine signal."));
                    } else {
                        if (dip < 15) {
                            defs.push(defect("minor", `A ${dip} s dip left a thin, patchy Nafion film with gaps.`));
                        } else if (dip > 60) {
                            defs.push(defect("minor", `A ${dip} s dip built a thick film that slows the response.`));
                        }
                        if (T < 50) {
                            defs.push(defect("minor", `Drying at ${T} °C left the Nafion soft, so it swells and peels in solution.`));
                        } else if (T > 120) {
                            defs.push(defect("minor", `${T} °C cracked the Nafion film.`));
                        }
                    }
                    ns().data.nafion = coated;
                    completeStep(defs, `<p>${coated ? `Dipped in 5% Nafion for ${dip} s and dried at ${T} °C.` : "Left the fiber bare."}</p>`);
                });
            });
        }


        /* ---------- Station: FSCV rig (conditioning) ---------- */

        function openFSCV() {
            let hz = null;
            let busy = false;
            const m = open("FSCV Rig: Conditioning", "FSCV (fast-scan cyclic voltammetry) sweeps the electrode's voltage up and back in under 10 ms. Before measuring, the scan is run fast for a while: it cleans the carbon and lets the large background current settle down.", `
                <canvas id="fcCv" width="460" height="200" class="adv-wide-canvas"></canvas>
                <p class="adv-round">Scan frequency</p>
                ${ui.chips("hz", [{ id: "10", label: "10 Hz" }, { id: "60", label: "60 Hz" }], null)}
                ${ui.slider("fcMin", "Time", "min", 0, 30, 1, 2)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="fcGo" data-autofocus>Condition</button></div>
                <p class="adv-result" id="fcRes" aria-live="polite"></p>`);
            const c = $("fcCv").getContext("2d");
            ui.wireChips("hz", (v) => { hz = Number(v); });
            const mEl = ui.wireSlider("fcMin");
            const opts = { x0: 0, x1: 30, y0: 0, y1: 100, xLabel: "Minutes of scanning", yLabel: "Background drift", xTicks: [0, 10, 20, 30], yTicks: [0, 50, 100] };
            ui.plot(c, 460, 200, [], opts);
            $("fcGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!hz) {
                    ui.result("fcRes", "Choose a scan frequency first.", false);
                    return;
                }
                busy = true;
                const t = Number(mEl.value);
                const tau = hz === 60 ? 4 : 12;
                const pts = [];
                for (let x = 0; x <= Math.max(1, t); x += 0.2) {
                    pts.push([x, 90 * Math.exp(-x / tau) + 4 + noise(1.5)]);
                }
                ui.animate(m, 3500, (k) => ui.plot(c, 460, 200, [{ pts: pts, color: "#54e0c7" }], opts, k), () => {
                    const settled = 90 * Math.exp(-t / tau) < 15;
                    const defs = [];
                    if (!settled) {
                        defs.push(defect("minor", `${t} min at ${hz} Hz wasn't enough for the background to settle. Measurements will drift.`));
                    }
                    ns().data.conditioned = settled;
                    completeStep(defs, `<p>Scanned at ${hz} Hz for ${t} min. ${settled ? "The background settled to a steady level." : "The background was still drifting."}</p>`);
                });
            });
        }


        /* ---------- Station: platinum array bench (mPD) ---------- */

        // The ceramic shank with its two platinum sites, seen from the side.
        function drawShank(c, opts) {
            const y = opts.y || 40;
            rect(c, 40, y, 360, 26, "#e3d2b4");
            rect(c, 40, y, 360, 4, "#f2e8d5");
            const sites = [[180, "Site 1"], [300, "Sentinel"]];
            sites.forEach(([x, name], i) => {
                rect(c, x - 22, y + 20, 44, 6, "#e3e7ef");
                const col = opts.coat ? opts.coat[i] : null;
                if (col) {
                    rect(c, x - 22, y + 26, 44, opts.coatH ? opts.coatH[i] : 5, col);
                }
                label(c, name, x, y - 6, "#a9b2d0", "center");
            });
        }

        function openPt() {
            let layer = null;
            let busy = false;
            const m = open("Platinum Array Bench", "The glutamate sensor is built on two platinum sites on a ceramic shank. Glutamate can't be oxidized directly, so an enzyme will turn it into H₂O₂, which platinum reads easily. First, an exclusion layer keeps out molecules that would also react at platinum.", `
                <canvas id="ptCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="ptCap">The ceramic shank with its two platinum sites.</p>
                <p class="adv-round">Exclusion layer</p>
                ${ui.chips("lay", [{ id: "mpd", label: "mPD (poly-m-phenylenediamine)" }, { id: "nafion", label: "Nafion" }, { id: "none", label: "None" }], null)}
                ${ui.slider("ptMin", "Electroplating time", "min", 0, 40, 5, 5)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="ptGo" data-autofocus>Electroplate</button></div>
                <p class="adv-result" id="ptRes" aria-live="polite"></p>`);
            ui.wireChips("lay", (v) => { layer = v; });
            const tEl = ui.wireSlider("ptMin");
            const c = $("ptCv").getContext("2d");

            function bg() {
                c.clearRect(0, 0, 460, 230);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 230);
            }

            function plateView(k, now, layerKind) {
                bg();
                // beaker of monomer solution around the sites
                rect(c, 120, 96, 240, 114, "#d9e2f0");
                rect(c, 124, 104, 232, 102, layerKind === "nafion" ? "rgba(127, 178, 255, 0.35)" : "rgba(255, 180, 200, 0.35)");
                label(c, layerKind === "nafion" ? "Nafion solution" : "mPD solution", 240, 222, "#a9b2d0", "center");
                drawShank(c, { y: 40 + 40 * Math.min(1, k * 3), coat: ["rgba(200, 140, 220, 0.9)", "rgba(200, 140, 220, 0.9)"], coatH: [2 + 6 * k, 2 + 6 * k] });
                // voltage cycling trace
                c.strokeStyle = "#ffd84a";
                c.lineWidth = 1.5;
                c.beginPath();
                for (let i = 0; i < 100; i++) {
                    const ph = ((i / 25) + now / 800) % 1;
                    const v = ph < 0.5 ? ph * 2 : 2 - ph * 2;
                    const x = 350 + i;
                    const yv = 30 - v * 20;
                    i ? c.lineTo(x, yv) : c.moveTo(x, yv);
                }
                c.stroke();
                label(c, "voltage cycling", 400, 46, "#ffd84a", "center");
            }

            // close-up of one platinum site with molecules arriving
            function selectView(k, now, thick, holes) {
                bg();
                rect(c, 0, 190, 460, 40, "#e3e7ef");
                label(c, "platinum", 10, 222, "#1a2033");
                const top = 190 - thick * 40;
                if (thick > 0) {
                    rect(c, 0, top, 460, 190 - top, "rgba(200, 140, 220, 0.55)");
                    for (let x = 8; x < 460; x += 16) {
                        const gap = holes && (x % 96 === 8);
                        if (!gap) {
                            rect(c, x, top + 4, 10, 3, "rgba(120, 60, 150, 0.7)");
                        }
                    }
                    label(c, "mPD film: a tight mesh", 450, top - 6, "#c8a0e0", "right");
                }
                const kinds = [
                    { r: 3, col: "#7fb2ff", name: "H₂O₂", small: true },
                    { r: 8, col: "#ff8a5c", name: "ascorbate" },
                    { r: 8, col: "#ffd84a", name: "dopamine" }
                ];
                for (let i = 0; i < 9; i++) {
                    const kd = kinds[i % 3];
                    const ph = ((now / 2400) + i / 9) % 1;
                    const x = 30 + i * 48;
                    let y = 20 + ph * 170;
                    const through = kd.small || thick === 0 || (holes && i % 3 === 1 && x % 96 < 60);
                    if (!through && y > top - kd.r) {
                        y = 2 * (top - kd.r) - y;
                    }
                    particle(c, x, Math.min(y, 186), kd.r, kd.col);
                    if (y >= 184) {
                        label(c, "e⁻", x + 6, 186, "#ffd84a");
                    }
                }
                label(c, "● H₂O₂ (tiny)", 10, 16, "#7fb2ff");
                label(c, "● ascorbate", 110, 16, "#ff8a5c");
                label(c, "● dopamine", 200, 16, "#ffd84a");
            }

            bg();
            drawShank(c, { y: 60 });

            $("ptGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!layer) {
                    ui.result("ptRes", "Choose a layer first.", false);
                    return;
                }
                busy = true;
                const t = Number(tEl.value);
                const none = layer === "none" || t === 0;
                const thin = !none && layer === "mpd" && t < 15;
                const thick = none ? 0 : layer === "nafion" ? 0.5 : t > 30 ? 1.4 : thin ? 0.4 : 1;
                const stages = none ? [
                    {
                        caption: "No exclusion layer: the platinum stays bare.",
                        dur: 2500,
                        draw: () => {
                            bg();
                            drawShank(c, { y: 60 });
                        }
                    },
                    {
                        caption: "Up close: everything that touches bare platinum reacts. Ascorbate and dopamine make current too, and it looks like glutamate signal.",
                        dur: 6000,
                        draw: (k, now) => selectView(k, now, 0, false)
                    }
                ] : [
                    {
                        caption: `The sites sit in ${layer === "mpd" ? "mPD (m-phenylenediamine) monomer" : "Nafion"} solution while the voltage cycles up and down for ${t} min. Each cycle grows a little more film on the platinum.`,
                        dur: 4500,
                        draw: (k, now) => plateView(k, now, layer)
                    },
                    {
                        caption: layer === "mpd"
                            ? `Up close: the mPD film is a tight polymer mesh. Tiny H₂O₂ molecules squeeze through to the platinum, but bigger ascorbate and dopamine bounce off.${thin ? " This film is thin, so some slip through its holes." : ""}`
                            : "Up close: Nafion's negative charge pushes back negative ascorbate, but positively charged dopamine passes through to the platinum.",
                        dur: 6000,
                        draw: (k, now) => selectView(k, now, thick, thin || layer === "nafion")
                    }
                ];
                runStages(m, "ptCap", stages, () => {
                    const defs = [];
                    let mpd = "good";
                    if (none) {
                        mpd = "none";
                        defs.push(defect("major", "With no exclusion layer, ascorbic acid and dopamine oxidize at the platinum and add false glutamate signal."));
                    } else if (layer === "nafion") {
                        mpd = "nafion";
                        defs.push(defect("minor", "Nafion blocks negatively charged ascorbic acid but lets positively charged dopamine through to the platinum."));
                    } else if (t < 15) {
                        mpd = "thin";
                        defs.push(defect("minor", `${t} min left a thin mPD layer with pinholes.`));
                    } else if (t > 30) {
                        defs.push(defect("minor", `${t} min made the mPD layer so thick that even H₂O₂ is slowed, shrinking the signal.`));
                    }
                    ns().data.mpd = mpd;
                    completeStep(defs, `<p>Electroplated ${none ? "nothing" : layer === "mpd" ? "mPD" : "Nafion"} for ${t} min on both platinum sites.</p>`);
                });
            });
        }


        /* ---------- Station: enzyme spotter ---------- */

        function openEnzyme() {
            let enz = null;
            let sen = null;
            let busy = false;
            const m = open("Enzyme Spotter", "Site 1 gets the enzyme that recognizes glutamate. Site 2 is the sentinel: identical, but without the enzyme. Anything both sites feel is not glutamate, so subtracting them cancels it.", `
                <canvas id="enCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="enCap">The two platinum sites, already coated with the exclusion layer.</p>
                <p class="adv-round">Site 1</p>
                ${ui.chips("e1", [{ id: "gluox", label: "Glutamate oxidase + BSA + glutaraldehyde" }, { id: "gox", label: "Glucose oxidase + BSA + glutaraldehyde" }, { id: "none", label: "Nothing" }], null)}
                <p class="adv-round">Site 2 (sentinel)</p>
                ${ui.chips("e2", [{ id: "bsa", label: "BSA + glutaraldehyde, no enzyme" }, { id: "same", label: "Same as site 1" }, { id: "none", label: "Nothing" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="enGo" data-autofocus>Spot both sites</button></div>
                <p class="adv-result" id="enRes" aria-live="polite"></p>`);
            ui.wireChips("e1", (v) => { enz = v; });
            ui.wireChips("e2", (v) => { sen = v; });
            const c = $("enCv").getContext("2d");

            const SITE_X = [130, 330];

            function bg() {
                c.clearRect(0, 0, 460, 230);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 230);
                rect(c, 20, 170, 420, 20, "#e3d2b4");
                SITE_X.forEach((x, i) => {
                    rect(c, x - 70, 164, 140, 6, "#e3e7ef");
                    label(c, i ? "Site 2 (sentinel)" : "Site 1", x, 206, "#a9b2d0", "center");
                });
            }

            // what each site is coated with: "enz" (enzyme blobs + BSA), "bsa", or ""
            function blobs(kinds, k, links) {
                kinds.forEach((kind, i) => {
                    if (!kind) {
                        return;
                    }
                    const x0 = SITE_X[i] - 60;
                    const n = Math.floor(8 * k);
                    for (let j = 0; j < n; j++) {
                        const x = x0 + j * 16 + 4;
                        const isEnz = kind !== "bsa" && j % 2 === 0;
                        if (isEnz) {
                            // an enzyme with a pocket the right molecule fits into
                            c.fillStyle = kind === "gox" ? "#5be38a" : "#ffd84a";
                            c.beginPath();
                            c.arc(x, 155, 7, 0.5, Math.PI * 2 - 0.5);
                            c.lineTo(x, 155);
                            c.fill();
                        } else {
                            particle(c, x, 157, 5, "#c8ceda");
                        }
                        if (links && j > 0) {
                            c.strokeStyle = "rgba(255, 255, 255, 0.5)";
                            c.lineWidth = 1;
                            c.beginPath();
                            c.moveTo(x - 16, 150);
                            c.lineTo(x, 150);
                            c.stroke();
                        }
                    }
                });
            }

            function meters(s1, s2) {
                const items = [["Site 1", s1, "#ffd84a"], ["Sentinel", s2, "#a9b2d0"], ["Site 1 − sentinel", Math.max(0, s1 - s2), "#54e0c7"]];
                items.forEach(([name, v, col], i) => {
                    const x = 30 + i * 140;
                    rect(c, x, 14, 110, 8, "#1b2340");
                    rect(c, x, 14, 110 * Math.min(1, v), 8, col);
                    label(c, name, x, 36, col);
                });
            }

            bg();

            $("enGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!enz || !sen) {
                    ui.result("enRes", "Choose what goes on both sites first.", false);
                    return;
                }
                busy = true;
                const k1 = enz === "none" ? "" : enz;
                const k2 = sen === "none" ? "" : sen === "same" ? enz === "none" ? "" : enz : "bsa";
                const reacts = [k1 === "gluox", k2 === "gluox"];

                runStages(m, "enCap", [
                    {
                        caption: `A fine nozzle places droplets on each site: ${{ gluox: "glutamate oxidase (yellow) mixed with BSA (gray)", gox: "glucose oxidase (green) mixed with BSA (gray)", none: "nothing" }[enz]} on site 1, and ${{ bsa: "BSA only, no enzyme", same: "the same enzyme mix", none: "nothing" }[sen]} on the sentinel.`,
                        dur: 4000,
                        draw: (k, now) => {
                            bg();
                            const onFirst = k < 0.5;
                            const nx = onFirst ? SITE_X[0] : SITE_X[1];
                            rect(c, nx - 6, 40, 12, 30, "#5d6577");
                            const dropY = 70 + ((now / 6) % 80);
                            const kind = onFirst ? k1 : k2;
                            if (kind) {
                                particle(c, nx, dropY, 3, kind === "gox" ? "#5be38a" : kind === "bsa" ? "#c8ceda" : "#ffd84a");
                            }
                            blobs([k1, ""], Math.min(1, k * 2), false);
                            if (k > 0.5) {
                                blobs(["", k2], Math.min(1, (k - 0.5) * 2), false);
                            }
                        }
                    },
                    {
                        caption: "Glutaraldehyde crosslinks everything (white links) into a mesh, so the enzyme stays put instead of washing away. BSA is a filler protein that helps the mesh form.",
                        dur: 3500,
                        draw: (k) => {
                            bg();
                            blobs([k1, k2], 1, k > 0.3);
                        }
                    },
                    {
                        caption: enz !== "gluox"
                            ? (enz === "gox" ? "Glutamate (orange) arrives, but glucose oxidase only fits glucose, so nothing happens. This sensor can't see glutamate." : "Glutamate (orange) arrives, but with no enzyme nothing turns it into H₂O₂. No glutamate signal.")
                            : sen === "same"
                                ? "Glutamate (orange) makes H₂O₂ (blue) on both sites, since both have the enzyme. Subtracting the sentinel cancels the glutamate signal too."
                                : "Glutamate (orange) and an interferent (gray) arrive. On site 1 the enzyme turns glutamate into H₂O₂ (blue), which gives electrons at the platinum. Both sites feel the interferent equally, so site 1 minus the sentinel leaves just the glutamate.",
                        dur: 7000,
                        draw: (k, now) => {
                            bg();
                            blobs([k1, k2], 1, true);
                            let s1 = 0.15;
                            let s2 = 0.15;
                            SITE_X.forEach((sx, i) => {
                                for (let j = 0; j < 4; j++) {
                                    const ph = ((now / 2600) + j / 4) % 1;
                                    const x = sx - 50 + j * 32;
                                    const y = 50 + ph * 100;
                                    if (j % 2 === 0) {
                                        // glutamate
                                        if (reacts[i] && y > 135) {
                                            particle(c, x, 140 + (y - 135) * 0.8, 3, "#7fb2ff");
                                            if (y > 145) {
                                                label(c, "e⁻", x + 5, 172, "#ffd84a");
                                            }
                                        } else {
                                            particle(c, x, Math.min(y, 140), 5, "#ff8a5c");
                                        }
                                    } else {
                                        // interferent: reaches both sites alike
                                        particle(c, x, Math.min(y, 160), 4, "#8f98aa");
                                    }
                                }
                                if (reacts[i]) {
                                    if (i === 0) {
                                        s1 = 0.85;
                                    } else {
                                        s2 = 0.85;
                                    }
                                }
                            });
                            meters(s1 * Math.min(1, k * 2), s2 * Math.min(1, k * 2));
                        }
                    }
                ], () => {
                    const defs = [];
                    if (enz === "gox") {
                        defs.push(defect("major", "Glucose oxidase reacts with glucose, not glutamate. This sensor would read blood sugar, not brain glutamate."));
                    } else if (enz === "none") {
                        defs.push(defect("major", "With no enzyme, nothing turns glutamate into H₂O₂, so the sensor can't see it."));
                    }
                    if (sen === "same") {
                        defs.push(defect("major", "If the sentinel has the enzyme too, subtracting it cancels the glutamate signal along with the noise."));
                    } else if (sen === "none") {
                        defs.push(defect("minor", "A bare sentinel doesn't match site 1's coating, so the subtraction doesn't cancel interferents cleanly."));
                    }
                    Object.assign(ns().data, { enz: enz, sentinel: sen === "bsa" ? "bsa" : sen });
                    completeStep(defs, `<p>Site 1: ${{ gluox: "glutamate oxidase", gox: "glucose oxidase", none: "nothing" }[enz]}. Site 2: ${{ bsa: "BSA only (a proper sentinel)", same: "the same enzyme mix", none: "bare platinum" }[sen]}.</p>`);
                });
            });
        }


        /* ---------- Station: FSCV flow cell ---------- */

        const SHAPES = {
            da: { label: "Dopamine", ox: 0.6, red: -0.2, a: 1, b: 0.7 },
            ht: { label: "Serotonin", ox: 0.72, red: 0.02, a: 0.9, b: 0.45 },
            aa: { label: "Ascorbic acid", ox: 0.35, red: null, a: 0.6, b: 0, wide: 0.22 },
            ph: { label: "pH change", ph: true }
        };

        // background-subtracted cyclic voltammogram: forward and reverse sweeps
        function cv(kind, scale, nz) {
            const sh = SHAPES[kind];
            const fwd = [];
            const rev = [];
            const g = (E, c, w) => Math.exp(-Math.pow((E - c) / w, 2));
            for (let i = 0; i <= 120; i++) {
                const E = -0.4 + 1.7 * i / 120;
                let f;
                let r;
                if (sh.ph) {
                    f = 0.35 * g(E, 0.3, 0.12) - 0.5 * g(E, 1.15, 0.12);
                    r = -0.35 * g(E, -0.1, 0.12) + 0.4 * g(E, 1.0, 0.15);
                } else {
                    f = sh.a * g(E, sh.ox, sh.wide || 0.11);
                    r = sh.red === null ? 0.1 * sh.a * g(E, sh.ox, 0.3) : -sh.b * g(E, sh.red, 0.11);
                }
                fwd.push([E, f * scale + noise(nz)]);
                rev.push([E, r * scale + noise(nz)]);
            }
            return [{ pts: fwd, color: "#ffd84a" }, { pts: rev, color: "#7fb2ff" }];
        }

        function openFlow() {

            const md = model();
            let busy = false;
            let calibrated = false;
            let quizI = 0;
            let right = 0;
            const unknowns = (window.SCGames ? window.SCGames.shuffle(["da", "ht", "aa", "ph"]) : ["da", "ht", "aa", "ph"]).slice(0, 3);

            const m = open("Flow Cell: FSCV Calibration", "The probe sits in a stream of artificial brain fluid. Inject a known amount of a molecule and the scan records a background-subtracted cyclic voltammogram: current plotted against voltage. Its shape is the molecule's fingerprint, and its height tells you how much is there.", `
                <div class="adv-furnace-grid">
                    <div>
                        ${ui.slider("wHold", "Holding potential", "V", -0.8, 0.4, 0.1, 0)}
                        ${ui.slider("wSwitch", "Switching potential", "V", 0.6, 1.6, 0.1, 1)}
                    </div>
                    <div>
                        <p class="adv-round">Scan rate</p>
                        ${ui.chips("rate", [{ id: "40", label: "40 V/s" }, { id: "400", label: "400 V/s" }, { id: "4000", label: "4000 V/s" }], null)}
                        <p class="adv-round">Repeat</p>
                        ${ui.chips("rep", [{ id: "1", label: "1 Hz" }, { id: "10", label: "10 Hz" }, { id: "100", label: "100 Hz" }], null)}
                    </div>
                </div>
                <canvas id="flCv" width="460" height="240" class="adv-wide-canvas"></canvas>
                <p class="adv-keys"><span style="color:#ffd84a">■</span> forward sweep (up) <span style="color:#7fb2ff">■</span> return sweep (down)</p>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="flGo" data-autofocus>Inject 1 µM dopamine</button></div>
                <p class="adv-result" id="flRes" aria-live="polite"></p>
                <div id="flQuiz"></div>`);

            const c = $("flCv").getContext("2d");
            const hEl = ui.wireSlider("wHold", (v) => (v > 0 ? "+" : "") + v.toFixed(1));
            const sEl = ui.wireSlider("wSwitch", (v) => "+" + v.toFixed(1));
            let rate = null;
            let rep = null;
            ui.wireChips("rate", (v) => { rate = Number(v); });
            ui.wireChips("rep", (v) => { rep = Number(v); });
            const opts = (y) => ({ x0: -0.4, x1: 1.3, y0: -y, y1: y, xLabel: "Electrode potential (V vs Ag/AgCl)", yLabel: "Current (nA)", xTicks: [-0.4, 0, 0.6, 1.3], fmtX: (x) => (x > 0 ? "+" : "") + x.toFixed(1), yTicks: [-y, 0, y] });
            ui.plot(c, 460, 240, [], opts(30));

            $("flGo").addEventListener("click", () => {
                if (busy || calibrated) {
                    return;
                }
                if (!rate || !rep) {
                    ui.result("flRes", "Choose the scan rate and how often it repeats.", false);
                    return;
                }
                busy = true;
                const hold = Number(hEl.value);
                const sw = Number(sEl.value);
                const defs = [];
                let scale = md.daSens;
                const notes = [];
                if (Math.abs(hold + 0.4) > 0.05) {
                    scale *= hold > -0.4 ? 0.5 : 0.8;
                    defs.push(defect("minor", `Holding at ${hold.toFixed(1)} V instead of −0.4 V changes how much dopamine sticks to the carbon between scans, so the signal is smaller and less stable.`));
                }
                if (sw < 1.0) {
                    scale *= 0.6;
                    defs.push(defect("minor", `Switching at +${sw.toFixed(1)} V doesn't refresh the carbon surface, so it fouls over time. The standard +1.3 V keeps it clean.`));
                } else if (sw > 1.4) {
                    defs.push(defect("minor", `+${sw.toFixed(1)} V etches the carbon fiber away bit by bit.`));
                }
                if (rate !== 400) {
                    defs.push(defect("minor", rate < 400 ? "40 V/s is too slow: each scan takes so long the measurement can't keep up with release events." : "4000 V/s makes the background current enormous and the peaks smear out."));
                    scale *= 0.6;
                }
                if (rep !== 10) {
                    defs.push(defect("minor", rep < 10 ? "1 Hz misses events that come and go within a second." : "100 Hz leaves too little time at the holding potential, so less dopamine collects on the carbon between scans."));
                    scale *= 0.7;
                }
                if (md.fibDead) {
                    notes.push("The trace is flat: the probe doesn't respond to dopamine at all.");
                }
                const series = cv("da", scale, md.noise);
                const peak = Math.max(1, Math.ceil(scale * 1.3 / 10) * 10);
                ui.animate(m, 3000, (k) => ui.plot(c, 460, 240, series, opts(peak), k), () => {
                    busy = false;
                    calibrated = true;
                    ns().data.fscvDefs = defs;
                    ns().data.daCal = scale;
                    ui.result("flRes", md.fibDead ? notes[0] : `Dopamine fingerprint: oxidation peak near <strong>+0.6 V</strong> on the way up, reduction near <strong>−0.2 V</strong> on the way down. Sensitivity: <strong>${scale.toFixed(1)} nA per µM</strong>.`, !md.fibDead);
                    askNext();
                });

                // let the player study each trace before the next sample goes in
                function askNext() {
                    if (quizI >= unknowns.length) {
                        nextUnknown();
                        return;
                    }
                    $("flQuiz").innerHTML = `<div class="adv-button-row"><button type="button" class="adv-btn" id="ukInject">Inject mystery sample ${quizI + 1} of ${unknowns.length}</button></div>`;
                    $("ukInject").addEventListener("click", nextUnknown);
                }

                function nextUnknown() {
                    if (quizI >= unknowns.length) {
                        const sum = `<p>Calibrated: ${scale.toFixed(1)} nA per µM dopamine. You identified ${right} of ${unknowns.length} unknowns by their fingerprint.</p>`;
                        $("flQuiz").innerHTML = `<div class="adv-button-row"><button type="button" class="adv-btn" id="flDone">Continue</button></div>`;
                        $("flDone").addEventListener("click", () => completeStep(defs, sum));
                        return;
                    }
                    const kind = unknowns[quizI];
                    $("flQuiz").innerHTML = `
                        <div class="adv-takeaway">
                            <p><strong>Unknown ${quizI + 1} of ${unknowns.length}:</strong> the lab tech injects a mystery sample. What is it?</p>
                            <div class="adv-chips">${Object.keys(SHAPES).map((k) => `<button type="button" class="adv-chip" data-uk="${k}">${SHAPES[k].label}</button>`).join("")}</div>
                            <p class="adv-result" id="ukRes"></p>
                        </div>`;
                    const aa = kind === "aa" ? (md.aaLeak > 0.1 ? 1.6 : 0.35) : 1;
                    const s2 = cv(kind, (md.daSens || 5) * 0.8 * aa, md.noise);
                    ui.animate(m, 2000, (k) => ui.plot(c, 460, 240, s2, opts(peak), k));
                    let done = false;
                    api.modalBody().querySelectorAll("[data-uk]").forEach((b) => b.addEventListener("click", () => {
                        if (done) {
                            return;
                        }
                        done = true;
                        b.classList.add("on");
                        const ok = b.dataset.uk === kind;
                        if (ok) {
                            right++;
                        }
                        const why = {
                            da: "Dopamine: oxidation near +0.6 V and a return reduction peak near −0.2 V.",
                            ht: "Serotonin: oxidation a little higher (about +0.7 V) and a smaller return peak near 0 V.",
                            aa: `Ascorbic acid: a broad oxidation hump around +0.3–0.4 V with no return peak, because the reaction doesn't reverse.${md.aaLeak > 0.1 ? " It's big here because there's no Nafion to repel it." : " Nafion keeps it small."}`,
                            ph: "A pH change: no single peak, just a wavy shift at both ends of the scan as the carbon surface's own chemistry changes."
                        }[kind];
                        ui.result("ukRes", `${ok ? "✓" : "✗"} ${why}`, ok);
                        quizI++;
                        const nx = document.createElement("div");
                        nx.className = "adv-button-row";
                        nx.innerHTML = '<button type="button" class="adv-btn" id="ukNext">Next</button>';
                        $("flQuiz").appendChild(nx);
                        $("ukNext").addEventListener("click", askNext);
                    }));
                }
            });
        }


        /* ---------- Station: glutamate flow cell ---------- */

        function openGluCal() {
            const md = model();
            let busy = false;
            const m = open("Glutamate Flow Cell", "Amperometry: the platinum sites are held at a steady voltage and the current is recorded continuously. Glutamate oxidase makes H₂O₂ from glutamate, and each H₂O₂ gives two electrons at the platinum.", `
                ${ui.slider("gV", "Platinum potential", "V vs Ag/AgCl", 0, 1, 0.1, 0.3)}
                <canvas id="gcCv" width="460" height="240" class="adv-wide-canvas"></canvas>
                <p class="adv-keys"><span style="color:#ffd84a">■</span> site 1 (enzyme) <span style="color:#a9b2d0">■</span> sentinel <span style="color:#54e0c7">■</span> site 1 minus sentinel</p>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="gcGo" data-autofocus>Run the calibration</button></div>
                <p class="adv-result" id="gcRes" aria-live="polite"></p>
                <div id="gcQuiz"></div>`);
            const c = $("gcCv").getContext("2d");
            const vEl = ui.wireSlider("gV", (v) => "+" + v.toFixed(1));
            const opts = { x0: 0, x1: 10, y0: -2, y1: 30, xLabel: "Time (min): glutamate 20 → 40 → 60 µM, then AA, then DA", yLabel: "Current (nA)", xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 15, 30] };
            ui.plot(c, 460, 240, [], opts);

            $("gcGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const V = Number(vEl.value);
                const vf = V < 0.5 ? 0.2 : V < 0.6 ? 0.6 : 1;
                const S = md.gluDead ? 0 : md.gluSens * vf;
                const site1 = [];
                const sent = [];
                const diff = [];
                for (let t = 0; t <= 10; t += 0.05) {
                    const glu = t > 1 ? (t > 2.5 ? (t > 4 ? 60 : 40) : 20) : 0;
                    const aa = t > 6 ? 1 : 0;
                    const da = t > 8 ? 1 : 0;
                    const interf = (aa * 4 + da * 2.5) * (0.15 + md.gluInterf) * vf;
                    const s1 = 1 + S * glu + interf + noise(0.25);
                    const sn = 1 + (md.sentinel ? interf : interf * 0.4) + noise(0.25);
                    site1.push([t, s1]);
                    sent.push([t, sn]);
                    diff.push([t, s1 - sn]);
                }
                ui.animate(m, 4500, (k) => ui.plot(c, 460, 240, [{ pts: site1, color: "#ffd84a" }, { pts: sent, color: "#a9b2d0" }, { pts: diff, color: "#54e0c7" }], opts, k), () => {
                    busy = false;
                    const defs = [];
                    if (V < 0.6) {
                        defs.push(defect("minor", `At +${V.toFixed(1)} V the platinum oxidizes only part of the H₂O₂. The card says +0.7 V.`));
                    } else if (V > 0.8) {
                        defs.push(defect("minor", `At +${V.toFixed(1)} V more interferents react at the platinum.`));
                    }
                    const lastDiff = diff[diff.length - 1][1];
                    const beforeAA = diff[Math.floor(5.9 / 0.05)][1];
                    const leak = Math.max(0, lastDiff - beforeAA);
                    ns().data.gluCal = { S: S, V: V };
                    if (md.gluDead) {
                        ui.result("gcRes", "Site 1 never responds to glutamate. Check the enzyme and the sterilization.", false);
                    } else {
                        ui.result("gcRes", `The difference trace climbs in even steps with glutamate${leak > 2 ? ", but <strong>it also jumps when ascorbic acid and dopamine go in</strong>: interferents are getting through." : " and stays flat for ascorbic acid and dopamine. Selective!"}`, leak <= 2);
                    }
                    const step = S * 20;
                    const opts2 = [S, step, S * 2, 20 / Math.max(step, 0.01)].map((v, i) => ({ v: v, ok: i === 0 }));
                    const sh = window.SCGames ? window.SCGames.shuffle(opts2) : opts2;
                    $("gcQuiz").innerHTML = md.gluDead ? '<div class="adv-button-row"><button type="button" class="adv-btn" id="gcNext">Continue</button></div>' : `
                        <div class="adv-takeaway">
                            <p>Each 20 µM glutamate step raised the difference trace by <strong>${step.toFixed(1)} nA</strong>. What's the sensitivity?</p>
                            <div class="adv-chips">${sh.map((o, i) => `<button type="button" class="adv-chip" data-gq="${i}">${o.v.toFixed(2)} nA per µM</button>`).join("")}</div>
                            <p class="adv-result" id="gqRes"></p>
                        </div>`;
                    const finish = () => completeStep(defs, `<p>Glutamate sensitivity: <strong>${S.toFixed(2)} nA per µM</strong> at +${V.toFixed(1)} V.</p>`);
                    if (md.gluDead) {
                        $("gcNext").addEventListener("click", finish);
                        return;
                    }
                    let ans = false;
                    api.modalBody().querySelectorAll("[data-gq]").forEach((b) => b.addEventListener("click", () => {
                        if (ans) {
                            return;
                        }
                        ans = true;
                        b.classList.add("on");
                        const o = sh[Number(b.dataset.gq)];
                        ui.result("gqRes", `${o.ok ? "✓" : "✗"} Sensitivity = ${step.toFixed(1)} nA ÷ 20 µM = <strong>${S.toFixed(2)} nA per µM</strong>.`, o.ok);
                        const nx = document.createElement("div");
                        nx.className = "adv-button-row";
                        nx.innerHTML = '<button type="button" class="adv-btn" id="gcNext">Continue</button>';
                        $("gcQuiz").appendChild(nx);
                        $("gcNext").addEventListener("click", finish);
                    }));
                });
            });
        }


        /* ---------- Station: sterilizer ---------- */

        function openEtO() {
            let how = null;
            open("Sterilizer", "Anything going into a patient's brain must be sterile, but the glutamate enzyme and the epoxy seal can't take heat.", `
                ${ui.chips("eto", [{ id: "eto", label: "Ethylene oxide gas (low temperature)" }, { id: "steam", label: "Steam autoclave, 121 °C" }, { id: "alcohol", label: "Alcohol wipe" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="etGo" data-autofocus>Sterilize</button></div>
                <p class="adv-result" id="etRes" aria-live="polite"></p>`);
            ui.wireChips("eto", (v) => { how = v; });
            $("etGo").addEventListener("click", () => {
                if (!how) {
                    ui.result("etRes", "Choose a method first.", false);
                    return;
                }
                if (how === "alcohol") {
                    ui.result("etRes", "Alcohol disinfects a surface but doesn't sterilize it: spores survive. Brain implants need a validated sterilization method.", false);
                    return;
                }
                const defs = [];
                if (how === "steam") {
                    defs.push(defect("major", "Steam at 121 °C killed the glutamate oxidase and cracked the epoxy seals."));
                }
                ns().data.steril = how;
                completeStep(defs, `<p>Sterilized with ${how === "eto" ? "ethylene oxide gas, then aired out so no gas remains" : "steam"}. The probes are sealed and ready for the hospital.</p>`);
            });
        }


        /* ---------- Patients ---------- */

        const MODES = [
            { id: "da", label: "Dopamine: FSCV, standard scan" },
            { id: "ht", label: "Serotonin: FSCV, Jackson scan" },
            { id: "glu", label: "Glutamate: platinum enzyme sensor" }
        ];

        const PATIENTS = [
            {
                id: "alvarez", name: "Mr. Alvarez", want: "da", x: 3, y: 5, look: { suit: "#e3ebff", accent: "#3d6fd8", visor: "#33405c" },
                story: [
                    "Hello. I have Parkinson's disease. The neurons that make dopamine for movement are slowly dying, so my hands shake and walking is hard.",
                    "Tomorrow I'm getting deep brain stimulation (DBS): an electrode that sends gentle pulses into my brain. My surgeons want to measure my dopamine during the surgery to help place it."
                ],
                trace: (t) => 20 + (t > 5 && t < 25 ? 180 * (1 - Math.exp(-(t - 5) / 3)) * Math.exp(-Math.max(0, t - 12) / 6) : 0),
                yLabel: "Dopamine (nM)", y1: 250,
                event: "When the stimulator switches on at 5 s, dopamine release climbs within seconds.",
                thanks: "They saw my dopamine respond when the stimulator switched on, and used it to fine-tune the electrode. Thank you!"
            },
            {
                id: "jordan", name: "Jordan", want: "glu", x: 8, y: 5, look: { suit: "#ffd1dc", accent: "#ff6b9d", visor: "#5ad1ff" },
                story: [
                    "Hey… I'm Jordan. I crashed my bike and hit my head pretty hard: a traumatic brain injury.",
                    "My doctors say an injured brain can release too much glutamate, which can damage more cells over the next few days. They want to watch it."
                ],
                trace: (t) => 3 + (t > 12 && t < 22 ? 22 * Math.sin((t - 12) / 10 * Math.PI) : 0),
                yLabel: "Glutamate (µM)", y1: 30,
                event: "At 12 h a glutamate surge shows up, so the ICU team acts early.",
                thanks: "The sensor caught a glutamate surge overnight and the team adjusted my care right away. Thank you!"
            },
            {
                id: "kim", name: "Ms. Kim", want: "glu", x: 13, y: 5, look: { suit: "#e6defa", accent: "#b46bff", visor: "#5be38a" },
                story: [
                    "Hi, I'm Ms. Kim. I have epilepsy, and medicines haven't stopped my seizures.",
                    "My doctors are recording from my brain to find where the seizures start. Studies have seen glutamate rise in that area around a seizure."
                ],
                trace: (t) => 2 + (t > 14 && t < 20 ? 30 * Math.exp(-Math.pow((t - 17) / 1.6, 2)) : 0),
                yLabel: "Glutamate (µM)", y1: 40,
                event: "Glutamate rises in one spot around a seizure, pointing to where it starts.",
                thanks: "The glutamate rise lined up with where my seizures start. It's helping my surgeons plan. Thank you!"
            },
            {
                id: "okoye", name: "Mr. Okoye", want: "ht", x: 16, y: 9, look: { suit: "#d6ffd9", accent: "#2ebfa5", visor: "#ffd84a" },
                story: [
                    "Good day. I live with depression, and for me the usual treatments haven't worked.",
                    "I've joined a research study of deep brain stimulation. The scientists want to learn how serotonin changes in my brain when the stimulator is on."
                ],
                trace: (t) => 15 + (t > 6 ? 40 * (1 - Math.exp(-(t - 6) / 5)) : 0),
                yLabel: "Serotonin (nM)", y1: 80,
                event: "Serotonin rises slowly after stimulation starts at 6 s.",
                thanks: "Researchers saw my serotonin respond to the stimulator. It's early science, but it might help others like me. Thank you!"
            }
        ];

        function allHelped() {
            return PATIENTS.every((p) => ns().helped[p.id]);
        }

        function patientTalk(p) {
            const s = ns();
            if (s.helped[p.id]) {
                return [p.thanks];
            }
            if (s.recipe && current() && current().id === "ward") {
                return { lines: p.story.concat(["The doctors are ready if you are."]), done: () => openPatient(p) };
            }
            return p.story.concat([s.recipe ? "I hear Dr. Axon at NeuroFab is building the sensors. I hope they're ready soon!" : "Someone said Dr. Axon at NeuroFab needs help building brain sensors…"]);
        }

        function openPatient(p) {
            let mode = null;
            let busy = false;
            const md = model();
            const m = api.openModal(`
                ${api.head("neuro", "Measure: " + p.name)}
                ${cardHtml(STEPS[STEPS.length - 1])}
                <p class="adv-lead">${p.story[1]}</p>
                <p class="adv-round">Which sensor and method?</p>
                ${ui.chips("mode", MODES, null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="ptGo" data-autofocus>Start measuring</button></div>
                <p class="adv-result" id="ptRes" aria-live="polite"></p>
                <canvas id="paCv" width="460" height="230" class="adv-wide-canvas" hidden></canvas>
                <div id="paDone"></div>`);
            ui.wireChips("mode", (v) => { mode = v; });
            $("ptGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!mode) {
                    ui.result("ptRes", "Choose a method first.", false);
                    return;
                }
                if (mode !== p.want) {
                    const why = {
                        da: p.want === "glu" ? "FSCV can't see glutamate: it doesn't oxidize at the electrode. Use the enzyme sensor." : "Serotonin needs the serotonin (Jackson) scan: the standard dopamine scan lets serotonin's breakdown products foul the carbon.",
                        ht: p.want === "glu" ? "FSCV can't see glutamate, whichever scan you use. Use the enzyme sensor." : "The doctors want dopamine here, and the standard −0.4 / +1.3 V scan is the one tuned for it.",
                        glu: "The enzyme sensor only measures glutamate. This patient's doctors need " + (p.want === "da" ? "dopamine" : "serotonin") + ", which FSCV measures."
                    }[mode];
                    ui.result("ptRes", "✗ " + why, false);
                    return;
                }
                busy = true;
                $("ptGo").disabled = true;
                ui.result("ptRes", "Sterile probe in place. Recording…");
                const cnv = $("paCv");
                cnv.hidden = false;
                const c = cnv.getContext("2d");
                const dead = (mode === "glu" && md.gluDead) || (mode !== "glu" && md.fibDead);
                const nz = (mode === "glu" ? 0.6 + md.gluInterf * 6 : md.noise * 6 + md.aaLeak * 40) * (p.y1 / 100);
                const pts = [];
                let e = 0;
                const tmax = mode === "glu" ? 30 : 30;
                for (let t = 0; t <= tmax; t += 0.15) {
                    e = 0.8 * e + 0.2 * noise(nz * 2);
                    pts.push([t, dead ? 0 : p.trace(t) + e + md.drift * t * 0.4]);
                }
                const opts = { x0: 0, x1: tmax, y0: 0, y1: p.y1, xLabel: mode === "glu" ? "Time (hours)" : "Time (seconds)", yLabel: p.yLabel, xTicks: [0, 10, 20, 30], yTicks: [0, p.y1 / 2, p.y1] };
                ui.animate(m, 6000, (k) => ui.plot(c, 460, 230, [{ pts: pts, color: "#54e0c7" }], opts, k), () => {
                    ns().helped[p.id] = true;
                    api.writeSave();
                    const left = PATIENTS.filter((x) => !ns().helped[x.id]).length;
                    $("paDone").innerHTML = `
                        <div class="adv-takeaway">
                            <p>${dead ? "<strong>The trace is flat.</strong> The probe isn't responding. Check the defects in the final report." : `<strong>${p.event}</strong>`}</p>
                            <p>${p.name}: "${p.thanks}"</p>
                            <p>${left ? `${left} patient${left === 1 ? "" : "s"} still waiting.` : "That's every patient!"}</p>
                        </div>
                        <button type="button" class="adv-btn" id="paNext">${left ? "Back to the ward" : "See the report"}</button>`;
                    $("paNext").addEventListener("click", () => (left ? api.closeModal() : finishBatch()));
                    $("paNext").focus();
                });
            });
        }

        function finishBatch() {
            const s = ns();
            const defs = allDefects();
            const majors = defs.filter((d) => d.sev === "major").length;
            const stars = !defs.length ? 3 : !majors ? 2 : 1;
            const first = !s.best;
            const xp = first ? 200 + stars * 25 : stars > s.best ? (stars - s.best) * 25 : 0;
            s.best = Math.max(s.best, stars);
            s.step = STEPS.length;
            s.bossUp = true;
            api.writeSave();
            if (xp) {
                api.gainXP(xp);
            }
            api.awardSiteXP("neurobatch", 200);
            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">PROBE REPORT</p>
                    <h2>🧠 Neurochemical Probes</h2>
                    <p class="adv-stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
                    ${xp ? `<p class="adv-xp-big">+${xp} XP</p>` : ""}
                    <ul class="adv-stats" style="justify-content:center">
                        <li>Dopamine <strong>${(s.data.daCal || 0).toFixed(1)} nA/µM</strong></li>
                        <li>Glutamate <strong>${s.data.gluCal ? s.data.gluCal.S.toFixed(2) : "—"} nA/µM</strong></li>
                        <li>Patients helped <strong>4 / 4</strong></li>
                    </ul>
                    <div class="adv-takeaway">
                        ${defs.length ? defs.map((d) => `<p>${d.sev === "major" ? "⚠️" : "•"} ${d.cause}</p>`).join("") : "<p>Flawless probes, from fiber to bedside!</p>"}
                    </div>
                    <p class="adv-calib">🧠 <strong>${s.boss ? "Rematch!" : "Boss unlocked!"}</strong> Something is growing around the giant neuron statue in the plaza…</p>
                    <button type="button" class="adv-btn" data-close>Back to the ward</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
            api.afterModal(() => api.say([
                "Every patient has been measured! The doctors are thrilled.",
                "But… the giant neuron statue in the plaza is being smothered by star-shaped cells. It's The Glial Scar! It walls off anything we implant in the brain. Go!"
            ], "Dr. Axon"));
        }


        /* ---------- Boss: The Glial Scar ---------- */

        function drawScar(c, ox, oy, s, t) {
            const px = (x, y, w, h, col) => rect(c, ox + x * s, oy + y * s, w * s, h * s, col);
            const bob = Math.round(Math.sin(t / 450));
            px(4, 30, 24, 2, "rgba(0,0,0,0.25)");
            // a wall of star-shaped astrocytes
            const stars = [[8, 10], [16, 6], [24, 11], [11, 19], [21, 20], [16, 14]];
            stars.forEach(([x, y], i) => {
                const w = Math.round(Math.sin(t / 300 + i) * 1);
                c.strokeStyle = "#c97fe0";
                c.lineWidth = 1.5 * s;
                for (let a = 0; a < 6; a++) {
                    const ang = a * Math.PI / 3 + i;
                    c.beginPath();
                    c.moveTo(ox + x * s, oy + (y + bob) * s);
                    c.lineTo(ox + (x + Math.cos(ang) * (5 + w)) * s, oy + (y + bob + Math.sin(ang) * (5 + w)) * s);
                    c.stroke();
                }
                px(x - 2, y - 2 + bob, 4, 4, "#7d4fb8");
            });
            // the angry core
            px(10, 11 + bob, 12, 10, "#2a1440");
            px(11, 12 + bob, 10, 8, "#b46bff");
            px(12, 14 + bob, 3, 3, "#ffffff");
            px(17, 14 + bob, 3, 3, "#ffffff");
            px(13, 15 + bob, 1, 1, "#e0233c");
            px(18, 15 + bob, 1, 1, "#e0233c");
            px(13, 18 + bob, 6, 1, "#2a1440");
        }

        const SCAR_QS = {
            messengers: [
                { q: "Which neurotransmitter do the neurons lost in Parkinson's disease release?", a: ["Dopamine", "Serotonin", "Glutamate", "GABA"], why: "Dopamine neurons in the substantia nigra die off, which affects movement." },
                { q: "What is the brain's main excitatory neurotransmitter?", a: ["Glutamate", "GABA", "Serotonin", "Insulin"], why: "Glutamate excites neurons. Too much of it, as after an injury, can damage them." },
                { q: "What is the brain's main inhibitory neurotransmitter?", a: ["GABA", "Glutamate", "Dopamine", "Glucose"], why: "GABA calms neurons down." },
                { q: "Why does brain fluid make dopamine hard to measure?", a: ["Dopamine is at nanomolar levels while look-alikes like ascorbic acid are far higher", "Dopamine is purple", "Dopamine only exists at night", "There's no fluid in the brain"], why: "Baseline dopamine is dilute and surrounded by molecules that react at similar voltages." }
            ],
            fscv: [
                { q: "How wide is a typical carbon-fiber microelectrode?", a: ["About 5 to 7 micrometers", "About 5 to 7 millimeters", "About 5 to 7 nanometers", "About 1 centimeter"], why: "Roughly a tenth of a human hair, so it disturbs little tissue." },
                { q: "Near what voltage does dopamine oxidize in FSCV?", a: ["About +0.6 V", "About −2 V", "About +5 V", "Exactly 0 V"], why: "On the way back down, a reduction peak appears near −0.2 V." },
                { q: "Why is the background current subtracted in FSCV?", a: ["The electrode's charging current is far larger than the dopamine signal", "To save memory", "Because dopamine has negative current", "It isn't, ever"], why: "What's left after subtraction is the molecule's fingerprint." },
                { q: "How often does a standard FSCV scan repeat?", a: ["About 10 times a second", "Once a minute", "A million times a second", "Once a day"], why: "Fast enough to follow release events lasting under a second." }
            ],
            selective: [
                { q: "Why coat carbon fibers with Nafion?", a: ["Its negative charge repels ascorbic acid and attracts dopamine", "It makes them glow", "It conducts electricity better than carbon", "It feeds the neurons"], why: "Dopamine and serotonin carry positive charge in the body, ascorbate is negative." },
                { q: "Why can't FSCV measure glutamate directly?", a: ["Glutamate doesn't oxidize at the electrode", "Glutamate moves too fast", "There's no glutamate in the brain", "Glutamate is too big"], why: "That's why glutamate sensors use glutamate oxidase to make H₂O₂." },
                { q: "What does a sentinel site do in a glutamate sensor?", a: ["It has no enzyme, so subtracting it cancels everything that isn't glutamate", "It measures temperature", "It stores extra enzyme", "It powers the sensor"], why: "That's called self-referencing." },
                { q: "What does the mPD layer on platinum do?", a: ["Lets small H₂O₂ through but blocks ascorbic acid and dopamine", "Makes the platinum magnetic", "Stores glutamate", "Sterilizes the sensor"], why: "It's a size-exclusion layer grown right on the electrode." }
            ],
            implant: [
                { q: "What does a glial scar do to an implanted sensor?", a: ["Walls it off, so fewer molecules reach it and the signal fades", "Makes it more sensitive", "Charges its battery", "Nothing at all"], why: "Astrocytes and microglia wrap foreign objects in the brain." },
                { q: "Why do smaller, flexible probes help?", a: ["They cause less damage and inflammation", "They're easier to lose", "They're shinier", "They need no electricity"], why: "Less damage means a weaker immune response and a thinner scar." },
                { q: "Why sterilize neural probes with ethylene oxide instead of an autoclave?", a: ["Steam heat would kill the enzyme and crack the epoxy", "Ethylene oxide is free", "Autoclaves are illegal", "Steam makes them radioactive"], why: "EtO works at low temperature." },
                { q: "What is a closed-loop neural device?", a: ["One that reads a brain signal and adjusts stimulation or drug delivery automatically", "A device shaped like a loop", "A device with no wires", "A device that only records"], why: "Neurochemical sensors could one day steer DBS this way." }
            ]
        };

        function scarBattle() {
            const rematch = ns().boss;
            return {
                foeName: "The Glial Scar",
                foeTag: "Foreign body response · Lv 20",
                foeSize: 32,
                fieldClass: "adv-field-neuro",
                drawFoe: (c, t) => drawScar(c, 0, 0, 1, t),
                foeMax: 255,
                foePower: 0.95,
                meMax: 140,
                moves: [
                    { type: "messengers", name: "Neuro Know-how", mult: 1, label: "Brain chemistry", icon: "🧪", special: "litho", cls: "litho", effect: "Knowing your messengers keeps the signal clear." },
                    { type: "fscv", name: "Fast Scan", mult: 1.75, label: "FSCV", icon: "⚡", special: "etch", cls: "etch", effect: "Direct hit! The +1.3 V sweep scrubs the carbon surface clean." },
                    { type: "selective", name: "Nafion Shield", mult: 1.5, label: "Selectivity", icon: "🛡️", special: "dep", cls: "dep", effect: "It's effective! Only the molecules you want get through." },
                    { type: "implant", name: "Flex Probe", mult: 0.5, focus: true, label: "Implants", icon: "🪡", special: "inspect", cls: "inspect", effect: "A tiny, flexible probe slips past the scar's defenses. Your next hit does 1.5× damage!" }
                ],
                questions: SCAR_QS,
                attacks: [
                    { name: "Astrocyte Wall", text: "Star-shaped glia surrounded your probe, and the signal dropped!" },
                    { name: "Microglia Swarm", text: "Immune cells swarmed the implant site!" },
                    { name: "Fouling Film", text: "Proteins coated the carbon fiber!" }
                ],
                intro: [
                    "Star-shaped cells pile up around the neuron statue… It's <strong>The Glial Scar</strong>!",
                    "It walls off anything implanted in the brain. Answer neuro-sensing questions to break through!"
                ],
                runText: "You backed off. The Glial Scar keeps growing around the statue…",
                loseTitle: "The Glial Scar walled you off",
                loseTip: "Tip: The Glial Scar is weak to <strong>Fast Scan</strong> and <strong>Nafion Shield</strong>. <strong>Flex Probe</strong> first makes your next hit 1.5× stronger.",
                winLines: rematch ? ["The Glial Scar breaks apart again!", "The statue is clear. Rematch won!"] : ["The Glial Scar breaks apart, and the statue glows again!", "📜 Dr. Axon hands you the Grey Matter Certificate of Completion!"],
                onWin: () => {
                    const s = ns();
                    const first = !s.boss;
                    s.boss = true;
                    s.bossUp = false;
                    api.save().badges.neuro = true;
                    api.writeSave();
                    api.updateHud();
                    api.gainXP(first ? 150 : 25);
                    if (first) {
                        api.awardSiteXP("neuroboss", 150);
                    }
                    api.afterModal(() => api.say(first ? [
                        "You broke through The Glial Scar! The statue's synapses are firing again.",
                        "Measuring the brain's chemistry is one of the hardest problems in sensing: tiny, fast, dilute and crowded. Here's your Grey Matter Certificate of Completion!",
                        "Head east to PDMS City next. They build tiny organs on chips there, and some patients badly need them."
                    ] : ["Scar cleared again! Build another batch and it'll be back for more."], "Dr. Axon"));
                    return `
                        <div class="adv-complete">
                            <p class="eyebrow">SIGNAL RESTORED</p>
                            <h2>${first ? "📜 Certificate of Completion" : "🧠 Rematch Won"}</h2>${first ? api.certificate("neuro") : ""}
                            <p class="adv-xp-big">+${first ? 150 : 25} XP</p>
                            <div class="adv-takeaway">
                                <p>When anything is implanted in the brain, support cells called glia (astrocytes and microglia) gather around it and form a scar. Over weeks the scar thickens, so fewer molecules reach the sensor and its signal fades.</p>
                                <p>Engineers fight back with smaller, softer, more flexible probes, coatings that calm the immune response, and careful insertion.</p>
                            </div>
                            <button type="button" class="adv-btn" data-close>Back to the plaza</button>
                        </div>`;
                }
            };
        }


        /* ---------- Recipe card ---------- */

        function openRecipe() {
            const s = ns();
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
                ${api.head("neuro", "Dr. Axon's Recipe")}
                <p class="adv-lead">Two brain sensors: a carbon-fiber microelectrode for dopamine and serotonin, and a platinum enzyme sensor for glutamate. Each station shows Dr. Axon's card with the settings.${s.best ? ` Best batch: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}` : ""}</p>
                <div class="adv-button-row" style="margin-bottom:8px"><button type="button" class="adv-btn secondary" data-close>Close</button></div>
                ${html}`);
        }

        api.registerRecipe({
            id: "neuro",
            scenes: ["neuro", "neurofab", "neurohospital"],
            available: () => ns().recipe,
            open: openRecipe,
            label: "Dr. Axon's neural probes (12 steps)",
            progress: () => ns().step,
            total: STEPS.length,
            restart: resetRun
        });


        /* ---------- Tools ---------- */

        const TOOLS = {
            fiber: { name: "Fiber Bench", open: openFiber },
            puller: { name: "Pipette Puller", open: openPuller },
            epoxy: { name: "Epoxy Station", open: openEpoxy },
            scope: { name: "Cutting Microscope", open: openScope },
            nafion: { name: "Nafion Station", open: openNafion },
            fscv: { name: "FSCV (Fast-Scan Cyclic Voltammetry) Rig", open: openFSCV },
            pt: { name: "Platinum Array Bench", open: openPt },
            enzyme: { name: "Enzyme Spotter", open: openEnzyme },
            flowcell: { name: "FSCV Flow Cell", open: openFlow },
            glucal: { name: "Glutamate Flow Cell", open: openGluCal },
            eto: { name: "Sterilizer", open: openEtO }
        };

        // Materials each step takes from the bag (once per run).
        const USES = { fiber: [["fiber", 1]], nafion: [["nafion", 1]], mpd: [["wafer", 1]] };

        function useTool(tool) {
            const s = ns();
            if (!s.recipe) {
                api.say([`The ${TOOLS[tool].name}.`, "Dr. Axon runs NeuroFab. Talk to Dr. Axon for the recipe."]);
                return;
            }
            const st = STEPS[s.step];
            if (!st) {
                api.say([`The ${TOOLS[tool].name}.`, "This batch is done. Talk to Dr. Axon to build another."]);
                return;
            }
            if (st.tool !== tool) {
                api.say([`The ${TOOLS[tool].name}.`, `Your recipe says the next step is: ${st.name}.`, st.tool === "patients" ? "That happens at the Neuro Hospital. Press R to read the recipe." : `That happens at the ${st.where}. Press R to read the recipe.`]);
                return;
            }
            if (!api.bag.pay(ns(), st.id, USES[st.id])) {
                return;
            }
            TOOLS[tool].open();
        }


        /* ---------- Drawing ---------- */

        function tool(id, label, x, y, w, h, draw) {
            return {
                kind: "nr-" + id,
                x: x, y: y, w: w, h: h,
                label: label,
                draw: (c, X, Y, W, H, t) => {
                    draw(c, X, Y, W, H, t);
                    if (isCurrentTool(id)) {
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
                prompt: "A: Use " + TOOLS[id].name,
                use: () => useTool(id)
            };
        }

        const D = {
            bench(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 6, Y + 7, W - 12, 1, "#2b2f3a");
                rect(c, X + 4, Y + 5, W - 8, 1, "rgba(220,235,255,0.8)");
                rect(c, X + 4, Y + 9, W - 8, 1, "rgba(220,235,255,0.8)");
            },
            puller(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 2, W - 4, H - 3, "#aab3c4");
                rect(c, X + 6, Y + 12, W - 12, 2, "rgba(220,235,255,0.9)");
                c.strokeStyle = `rgba(255, 140, 60, ${0.5 + 0.4 * Math.sin(t / 250)})`;
                c.lineWidth = 2;
                c.beginPath();
                c.ellipse(X + W / 2, Y + 13, 4, 6, 0, 0, Math.PI * 2);
                c.stroke();
            },
            epoxy(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                rect(c, X + 4, Y + 4, 10, 8, "#f2e8b8");
                rect(c, X + 22, Y + 3, 18, 10, "#5d6577");
                rect(c, X + 24, Y + 5, 14, 6, "rgba(255, 170, 90, 0.6)");
            },
            scope(c, X, Y, W, H) {
                api.box(X, Y + 4, W, H - 4, "#c9cfdb");
                rect(c, X + 12, Y - 10, 4, 16, "#3b4458");
                rect(c, X + 8, Y - 12, 8, 4, "#1a2033");
            },
            nafion(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                rect(c, X + 6, Y + 4, 10, 9, "#d9e2f0");
                rect(c, X + 7, Y + 7, 8, 5, "#cfe8ff");
                rect(c, X + 24, Y + 4, 16, 8, "#5d6577");
            },
            fscv(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 2, W - 4, H - 2, "#3b4458");
                rect(c, X + 6, Y + 4, W - 12, 8, "#0b1020");
                c.strokeStyle = "#ffd84a";
                c.lineWidth = 1;
                c.beginPath();
                for (let i = 0; i < W - 14; i++) {
                    const ph = ((i + t / 40) % 12) / 12;
                    const y = Y + 11 - (ph < 0.5 ? ph : 1 - ph) * 12;
                    i ? c.lineTo(X + 7 + i, y) : c.moveTo(X + 7 + i, y);
                }
                c.stroke();
            },
            pt(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 8, Y + 5, W - 16, 4, "#e3d2b4");
                rect(c, X + 12, Y + 6, 3, 2, "#e3e7ef");
                rect(c, X + 22, Y + 6, 3, 2, "#e3e7ef");
            },
            enzyme(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 2, W - 4, H - 2, "#c9cfdb");
                rect(c, X + W / 2 - 4, Y - 6, 8, 10, "#3b4458");
                const k = (t / 300) % 1;
                rect(c, X + W / 2 - 1, Y + 4 + k * 6, 2, 2, "#ffd84a");
            },
            flow(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                rect(c, X + 3, Y + 7, W - 6, 3, "#cfe8ff");
                for (let i = 0; i < 4; i++) {
                    rect(c, X + 4 + ((t / 20 + i * 10) % (W - 10)), Y + 8, 2, 1, "#7fb2ff");
                }
            },
            eto(c, X, Y, W, H) {
                api.box(X + 2, Y + 2, W - 4, H - 3, "#aab3c4");
                rect(c, X + 6, Y + 6, W - 12, 14, "#2a3448");
                rect(c, X + 8, Y + 22, 6, 4, "#ffd84a");
            },
            bed(c, X, Y, W, H) {
                api.box(X + 1, Y + 2, W - 2, H - 3, "#e3e7ef");
                rect(c, X + 3, Y + 4, 8, 6, "#ffffff");
                rect(c, X + 12, Y + 5, W - 15, 8, "#9fd6ff");
            },
            monitor(c, X, Y, W, H, t) {
                api.box(X + 3, Y - 2, W - 6, 12, "#3b4458");
                c.strokeStyle = "#5be38a";
                c.lineWidth = 1;
                c.beginPath();
                for (let i = 0; i < W - 10; i++) {
                    const ph = (i + t / 30) % 14;
                    const y = Y + 5 - (ph > 6 && ph < 8 ? 4 : 0);
                    i ? c.lineTo(X + 5 + i, y) : c.moveTo(X + 5 + i, y);
                }
                c.stroke();
            }
        };

        function drawNeuron(c, X, Y, W, H, t) {
            // a giant neuron statue: dendrites, cell body, myelinated axon
            api.box(X + 4, Y + 24, W - 8, 7, "#aab2c3");
            const cx = X + 14;
            const cy = Y + 12;
            c.strokeStyle = "#7d4fb8";
            c.lineWidth = 2;
            [[-10, -10], [-12, 2], [-6, -13], [2, -14], [-11, 10]].forEach(([dx, dy]) => {
                c.beginPath();
                c.moveTo(cx, cy);
                c.lineTo(cx + dx, cy + dy);
                c.lineTo(cx + dx * 1.2 - 2, cy + dy * 1.2);
                c.stroke();
            });
            c.fillStyle = "#b46bff";
            c.beginPath();
            c.arc(cx, cy, 6, 0, Math.PI * 2);
            c.fill();
            rect(c, cx - 1, cy - 1, 3, 3, "#ffd84a");
            // axon with myelin
            rect(c, cx + 5, cy, W - 24, 2, "#7d4fb8");
            for (let i = 0; i < 3; i++) {
                rect(c, cx + 8 + i * 9, cy - 1, 6, 4, "#f2e8d5");
            }
            // a spark travels down the axon
            const k = (t / 900) % 1;
            c.fillStyle = "#ffd84a";
            c.beginPath();
            c.arc(cx + 6 + k * (W - 26), cy + 1, 2, 0, Math.PI * 2);
            c.fill();
            rect(c, X + W - 8, cy - 3, 3, 8, "#7d4fb8");
        }

        function drawMolecule(c, X, Y, t, color, ring) {
            const bob = Math.round(Math.sin(t / 300 + X) * 1);
            const cx = X + 8;
            const cy = Y + 8 + bob;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.22)");
            c.strokeStyle = "#1a2033";
            c.lineWidth = 2;
            c.beginPath();
            for (let i = 0; i <= 6; i++) {
                const a = Math.PI / 6 + i * Math.PI / 3;
                const x = cx + Math.cos(a) * 6;
                const y = cy + Math.sin(a) * 6;
                i ? c.lineTo(x, y) : c.moveTo(x, y);
            }
            c.stroke();
            c.fillStyle = color;
            c.fill();
            if (ring) {
                c.beginPath();
                c.moveTo(cx + 6, cy);
                c.lineTo(cx + 10, cy - 4);
                c.lineTo(cx + 13, cy - 1);
                c.stroke();
            }
            rect(c, cx - 3, cy - 1, 2, 2, "#ffffff");
            rect(c, cx + 1, cy - 1, 2, 2, "#ffffff");
            rect(c, cx - 2, cy, 1, 1, "#1a2033");
            rect(c, cx + 2, cy, 1, 1, "#1a2033");
            rect(c, cx - 1, cy + 3, 3, 1, "#1a2033");
        }

        function plazaTile(c, x, y) {
            const X = x * TILE;
            const Y = y * TILE;
            rect(c, X, Y, TILE, TILE, "#d9cff0");
            rect(c, X, Y, TILE, 1, "#c4b6e6");
            rect(c, X, Y, 1, TILE, "#c4b6e6");
            if ((x + y) % 3 === 0) {
                rect(c, X + 6, Y + 6, 4, 4, "#e9e2fa");
            }
        }


        /* ---------- Scenes ---------- */

        api.SCENES.neuro = {
            id: "neuro",
            label: "Grey Matter",
            outdoor: true,
            grid: [
                "TTTTTTTTTTTTTTTTTTTT",
                "T.f......f.......f.T",
                "T.BBBBBB...BBBBBBB.T",
                "T.BBBBBB...BBBBBBB.T",
                "T.BBBBBB...BBBBBBB.T",
                "T.BBBDBB...BBBDBBB.T",
                "T....p........p....T",
                "pppppppppppppppppppp",
                "T.........p........T",
                "T.........p........T",
                "T....hhhhhhhhhhh...T",
                "T....hhhhhhhhhhh...T",
                "T....hhhhhhhhhhh...T",
                "T.f...........f....T",
                "TTTTTTTTTTTTTTTTTTTT"
            ],
            drawTile: (c, x, y, ch, t) => {
                if (ch === "h") {
                    plazaTile(c, x, y);
                } else {
                    api.drawWorldTile(x, y, ch, t);
                }
            },
            edges: {
                left: { scene: "glucose", x: 19, y: 7 },
                right: {
                    scene: "pdms", x: 0, y: 7,
                    locked: () => !api.save().badges.neuro,
                    lockedText: [
                        "The road east leads to PDMS City, home of the organ-on-a-chip labs.",
                        "A sign says: \"Grey Matter Certificate holders only.\" Help the patients and beat The Glial Scar first."
                    ]
                }
            },
            buildings: [
                { id: "neurofab", sign: "NEUROFAB", x: 2, y: 2, w: 6, h: 4, door: { x: 5, y: 5 }, wall: "#ece6fa", roof: "#7d4fb8", locked: () => false },
                { id: "neurohospital", sign: "NEURO HOSPITAL", x: 11, y: 2, w: 7, h: 4, door: { x: 14, y: 5 }, wall: "#f2f8ff", roof: "#3d6fd8", locked: () => false }
            ],
            npcs: [
                {
                    id: "axon", name: "Dr. Axon", x: 7, y: 6, dir: "down",
                    look: { suit: "#f4f0ff", accent: "#7d4fb8", visor: "#ffd84a" },
                    talk: axonTalk
                },
                {
                    id: "dopa", name: "Dopa", x: 6, y: 11, dir: "down",
                    draw: (c, X, Y, t) => drawMolecule(c, X, Y, t, "#ffd84a", true),
                    talk: () => ["Hi! I'm a dopamine molecule. Neurons release me for movement, motivation and learning from rewards.", "In Parkinson's disease, the neurons that make me for movement are lost, which is why movement gets hard."]
                },
                {
                    id: "sero", name: "Sero", x: 13, y: 12, dir: "down",
                    draw: (c, X, Y, t) => drawMolecule(c, X, Y, t, "#7fb2ff", false),
                    talk: () => ["Hello! I'm serotonin. I help regulate mood, sleep and appetite.", "Fun fact: most of the body's serotonin is actually made in the gut, not the brain!"]
                },
                {
                    id: "glu", name: "Glu", x: 15, y: 10, dir: "down",
                    draw: (c, X, Y, t) => drawMolecule(c, X, Y, t, "#ff8a5c", false),
                    talk: () => ["Yo! I'm glutamate, the brain's main \"go\" signal. I excite neurons.", "Too much of me after an injury can overexcite cells and damage them. That's why doctors want to measure me."]
                },
                {
                    id: "gaba", name: "Gabby (GABA)", x: 8, y: 12, dir: "down",
                    draw: (c, X, Y, t) => drawMolecule(c, X, Y, t, "#5be38a", false),
                    talk: () => ["Shhh… I'm GABA, the brain's main \"calm down\" signal.", "Like glutamate, I don't react at electrodes, so sensors need enzymes or other tricks to see me."]
                }
            ],
            objects: [
                api.bag.pickup({ id: "neuro-nafion", item: "nafion", x: 17, y: 9, text: "A bottle sparkles by the path: Nafion solution!" }),
                {
                    kind: "neuron", x: 9, y: 10, w: 3, h: 2, draw: drawNeuron, prompt: "A: Look",
                    active: () => !(ns().bossUp),
                    lines: ["A giant neuron statue: branching dendrites collect signals, the cell body adds them up, and the myelin-wrapped axon carries the spike away.", "The brain has about 86 billion of these."]
                },
                {
                    kind: "scar", x: 9, y: 10, w: 3, h: 2,
                    active: () => !!ns().bossUp,
                    draw: (c, X, Y, W, H, t) => {
                        drawNeuron(c, X, Y, W, H, t);
                        drawScar(c, X + 8, Y - 10, 1, t);
                        const bob = Math.round(Math.sin(t / 250) * 2);
                        rect(c, X + 20, Y - 24 + bob, 9, 11, "#1a2033");
                        rect(c, X + 21, Y - 23 + bob, 7, 9, "#ffd84a");
                        c.fillStyle = "#1a2033";
                        c.font = "bold 8px sans-serif";
                        c.textAlign = "center";
                        c.textBaseline = "middle";
                        c.fillText("!", X + 24.5, Y - 18 + bob);
                    },
                    prompt: "A: Battle The Glial Scar",
                    use: () => api.say(["Star-shaped cells are smothering the neuron statue…", "Get ready to battle!"], "", () => api.openBattle(scarBattle()))
                }
            ]
        };

        api.SCENES.neurofab = {
            id: "neurofab",
            label: "NeuroFab",
            grid: api.interiorRows(),
            floor: "#e6e2f2",
            exitTo: { scene: "neuro", x: 5, y: 6 },
            objects: [
                api.bag.stockroom({ label: "NeuroFab stockroom", items: ["fiber", "nafion"], x: 5, y: 10 }),
                tool("fiber", "Fiber bench", 1, 2, 3, 1, D.bench),
                tool("puller", "Puller", 5, 2, 2, 2, D.puller),
                tool("epoxy", "Epoxy & oven", 8, 2, 3, 1, D.epoxy),
                tool("scope", "Cutting scope", 12, 2, 2, 1, D.scope),
                tool("nafion", "Nafion", 15, 2, 3, 1, D.nafion),
                tool("fscv", "FSCV rig", 1, 7, 3, 1, D.fscv),
                tool("pt", "Pt array", 5, 7, 3, 1, D.pt),
                tool("enzyme", "Enzyme spotter", 9, 7, 3, 1, D.enzyme),
                tool("flowcell", "FSCV flow cell", 13, 7, 3, 1, D.flow),
                tool("glucal", "Glutamate cell", 1, 10, 3, 1, D.flow),
                tool("eto", "Sterilizer", 15, 10, 2, 2, D.eto)
            ],
            npcs: [
                { id: "axonlab", name: "Dr. Axon", x: 9, y: 10, dir: "down", look: { suit: "#f4f0ff", accent: "#7d4fb8", visor: "#ffd84a" }, talk: axonTalk }
            ]
        };

        api.SCENES.neurohospital = {
            id: "neurohospital",
            label: "Neuro Hospital",
            grid: api.interiorRows(),
            floor: "#eef3fb",
            exitTo: { scene: "neuro", x: 14, y: 6 },
            objects: [
                { kind: "bed", x: 2, y: 3, w: 3, h: 1, draw: D.bed, prompt: "A: Look", lines: ["A hospital bed with a neuro monitor."] },
                { kind: "bed", x: 7, y: 3, w: 3, h: 1, draw: D.bed, prompt: "A: Look", lines: ["An ICU bed. A small probe here could watch brain chemistry for days."] },
                { kind: "bed", x: 12, y: 3, w: 3, h: 1, draw: D.bed, prompt: "A: Look", lines: ["The epilepsy monitoring unit's bed."] },
                { kind: "bed", x: 15, y: 8, w: 3, h: 1, draw: D.bed, prompt: "A: Look", lines: ["A research bay for the deep brain stimulation study."] },
                { kind: "monitor", x: 2, y: 9, w: 3, h: 1, label: "Brain monitor", draw: D.monitor, prompt: "A: Look", lines: ["A monitor showing brain waves. Electrical recordings show when neurons fire; chemical sensors show which messengers they release."] }
            ],
            npcs: PATIENTS.map((p) => ({
                id: p.id,
                name: p.name,
                x: p.x,
                y: p.y,
                dir: "down",
                draw: (c, X, Y, t) => {
                    api.drawPerson(c, X, Y - 2, p.look, "down", 0);
                    if (!ns().helped[p.id]) {
                        const bob = Math.round(Math.sin(t / 300) * 1.5);
                        rect(c, X + 4, Y - 16 + bob, 9, 10, "#1a2033");
                        rect(c, X + 5, Y - 15 + bob, 7, 8, "#ffffff");
                        c.fillStyle = "#1a2033";
                        c.font = "bold 8px sans-serif";
                        c.textAlign = "center";
                        c.textBaseline = "middle";
                        c.fillText("?", X + 8.5, Y - 10.5 + bob);
                    }
                },
                talk: () => patientTalk(p)
            })).concat([{
                id: "cortex", name: "Dr. Cortex", x: 9, y: 9, dir: "down",
                look: { suit: "#e6f7ff", accent: "#3d6fd8", visor: "#54e0c7" },
                talk: () => {
                    const s = ns();
                    if (s.recipe && current() && current().id === "ward") {
                        return ["Your probes are here! Talk to each patient with a ? and choose the right measurement for what their doctors need.", "Remember: FSCV for dopamine and serotonin, the enzyme sensor for glutamate."];
                    }
                    return ["I'm Dr. Cortex, the neurologist here. Our patients' care could improve if we could measure their brain chemistry directly.", "Dr. Axon at NeuroFab is working on the probes."];
                }
            }])
        };

        function axonTalk() {
            const s = ns();
            const name = api.currentChar() ? api.currentChar().name : "engineer";
            if (!s.recipe) {
                return {
                    lines: [
                        `${name}! I'm Dr. Axon. Welcome to Grey Matter.`,
                        "Our hospital treats people with Parkinson's disease, brain injuries, epilepsy and depression. Their doctors want to measure the brain's chemical messengers, the neurotransmitters, as they change.",
                        "That's hard: the signals are tiny, fast, dilute and surrounded by look-alikes. We'll build two sensors: a carbon-fiber probe for dopamine and serotonin, and a platinum enzyme sensor for glutamate.",
                        "Here's my recipe. Every station has my card with the settings.",
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
                    return ["The Glial Scar is smothering the neuron statue in the plaza! Go!"];
                }
                return {
                    lines: [`Your best batch: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}. Want to build another?`, "I'll reset the bench for you."],
                    done: () => {
                        resetRun();
                        api.toast("Fresh batch: back to step 1");
                    }
                };
            }
            const st = STEPS[s.step];
            return [`Next step: ${st.name}.`, st.tool === "patients" ? "The patients are at the Neuro Hospital, across the path." : `It's at the ${st.where}. My card there has the settings.`];
        }

        // Split the lab into bays: these stations get their own building.
        api.addBay({
            outdoor: "neuro", from: "neurofab",
            id: "neurotest", sign: "TESTING", label: "Grey Matter · Sensor Test Lab",
            kinds: ["nr-pt", "nr-enzyme", "nr-flowcell", "nr-glucal", "nr-eto"],
            x: 1, y: 9, w: 3, h: 2, door: { x: 2, y: 10 },
            wall: "#f4f0ff", roof: "#7d4fb8",
            currentKind: () => {
                const st = STEPS[ns().step];
                return ns().recipe && st ? "nr-" + st.tool : null;
            }
        });


        // Microscopes: the carbon-fiber electrode and the glutamate probe.
        function nrView(n) {
            const id = STEPS[n - 1].id;
            const has = (sid) => STEPS.slice(0, n).some((s) => s.id === sid);
            const CAP = {
                fiber: "A 7 µm carbon fiber threaded through a glass capillary. The fiber is about a tenth the width of a hair.",
                pull: "The puller melted and stretched the glass into a fine taper that grips the fiber.",
                epoxy: "Epoxy seals the joint where the fiber leaves the glass, so liquid can't creep inside.",
                cut: "Trimmed to 100 µm of bare fiber. Only this tip touches the brain and measures.",
                nafion: "A thin Nafion coat. Its negative charge pushes away ascorbate and lets dopamine (positive) through.",
                condition: "Conditioning roughened and activated the carbon surface, so the signal is steady.",
                mpd: "The platinum probe: an mPD layer now covers both sites to block interferents.",
                enzyme: "Site 1 has glutamate oxidase. Site 2 (the sentinel) has only BSA, so it shows the background to subtract.",
                fscvcal: "Same probes. The carbon fiber's FSCV scans gave each chemical's fingerprint.",
                glucal: "Same probes. The glutamate sensor is calibrated and ignores ascorbate and dopamine.",
                steril: "Sterilized with ethylene oxide gas, which is gentle enough for the enzyme and the Nafion.",
                ward: "The finished probes, ready for the Neuro Hospital's patients."
            };
            return {
                scale: "side view",
                caption: CAP[id],
                draw: (c, Wd, H) => {
                    const two = n >= 7;
                    const y = two ? 70 : H / 2;
                    const tipX = has("pull") ? Wd * 0.55 : Wd * 0.8;
                    const fiberEnd = has("cut") ? tipX + 40 : Wd - 30;
                    c.strokeStyle = "rgba(200,225,255,0.85)";
                    c.fillStyle = "rgba(170,210,255,0.18)";
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(20, y - 26);
                    if (has("pull")) {
                        c.lineTo(Wd * 0.3, y - 26);
                        c.lineTo(tipX, y - 3);
                        c.lineTo(tipX, y + 3);
                        c.lineTo(Wd * 0.3, y + 26);
                    } else {
                        c.lineTo(tipX, y - 26);
                        c.lineTo(tipX, y + 26);
                    }
                    c.lineTo(20, y + 26);
                    c.fill();
                    c.stroke();
                    c.fillStyle = "#8d93a3";
                    c.fillRect(20, y - 2, fiberEnd - 20, 4);
                    if (has("nafion")) {
                        c.fillStyle = "rgba(120,170,255,0.7)";
                        c.fillRect(tipX, y - 4.5, fiberEnd - tipX + 2, 9);
                        c.fillStyle = "#8d93a3";
                        c.fillRect(tipX, y - 2, fiberEnd - tipX, 4);
                    }
                    if (has("epoxy")) {
                        c.fillStyle = "rgba(230,170,60,0.85)";
                        c.beginPath();
                        c.ellipse(tipX, y, 7, 6, 0, 0, Math.PI * 2);
                        c.fill();
                    }
                    if (two) {
                        const yb = H - 80;
                        c.fillStyle = "#d9dde6";
                        c.beginPath();
                        c.moveTo(20, yb - 22);
                        c.lineTo(Wd - 90, yb - 22);
                        c.lineTo(Wd - 30, yb);
                        c.lineTo(Wd - 90, yb + 22);
                        c.lineTo(20, yb + 22);
                        c.fill();
                        [[Wd * 0.45, has("enzyme") ? "#f2a65a" : null], [Wd * 0.65, has("enzyme") ? "#f4f0d8" : null]].forEach(([x, coat]) => {
                            c.fillStyle = "#b8bcc6";
                            c.fillRect(x - 18, yb - 9, 36, 18);
                            c.fillStyle = "rgba(90,100,120,0.75)";
                            c.fillRect(x - 20, yb - 11, 40, 22);
                            c.fillStyle = "#c9ced8";
                            c.fillRect(x - 16, yb - 7, 32, 14);
                            if (coat) {
                                c.fillStyle = coat;
                                c.globalAlpha = 0.8;
                                c.fillRect(x - 20, yb - 11, 40, 22);
                                c.globalAlpha = 1;
                            }
                        });
                        c.fillStyle = "rgba(245,247,255,0.8)";
                        c.font = "11px sans-serif";
                        c.textAlign = "center";
                        c.fillText("site 1", Wd * 0.45, yb + 36);
                        c.fillText("site 2 (sentinel)", Wd * 0.65, yb + 36);
                        c.textAlign = "left";
                        c.fillText("carbon-fiber electrode", 24, 30);
                        c.fillText("platinum glutamate probe", 24, yb - 30);
                    }
                }
            };
        }

        api.addScope({
            type: "neuro", title: "Dr. Axon's Microscope",
            places: [["neurofab", 17, 1], ["neurotest", 17, 1]],
            steps: STEPS, state: ns, view: nrView
        });

    });

})();
