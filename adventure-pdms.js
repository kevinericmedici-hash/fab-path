/* ========================================
   FAB VALLEY ADVENTURE: PDMS CITY
   East of Grey Matter. Organ-on-a-chip
   town. Dr. Silox's Soft Litho Lab molds
   two-channel PDMS chips (SU-8 master,
   silane, 10:1 PDMS, degas, cure, punch,
   plasma bond with a porous membrane, ECM
   coat). In the Organ Lab each patient's
   own cells go into a chip to test their
   treatment: a blood-brain barrier chip
   (shear, TEER, drug permeability), a lung
   chip (air on one side, breathing
   stretch), a kidney chip and a liver chip.
   Boss: The Bubble Beast.

   Facts follow the Blood-Brain Barrier on
   a Chip course (units 8, 9, 11, 12, 14):
   τ = 6μQ/(wh²), brain-like shear about
   1–2 Pa (≈140 µL/min for 1 mm × 0.1 mm),
   TEER = (R cells − R blank) × A, collagen
   IV + fibronectin coating, iPSC versus
   immortalized cells, Wyss lung chip
   (2010). Sylgard 184 is mixed 10:1.
   Drug results are teaching values.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const TILE = api.TILE;
        const rect = api.rect;
        const ui = api.ui;
        const $ = (id) => document.getElementById(id);

        api.TYPES.pdms = { label: "Organ chips", icon: "🧫" };


        /* ---------- Recipe ---------- */

        const PHASES = {
            master: "The mold (master)",
            cast: "Casting PDMS",
            bond: "Assembling the chip",
            lab: "Organ Lab"
        };

        const STEPS = [
            {
                id: "master", phase: "master", tool: "master", short: "SU-8 master", where: "SU-8 master bench in the Soft Litho Lab",
                name: "Make the master: SU-8 ridges 100 µm tall (SU-8 2100 at 3000 rpm)",
                card: ["Resist: <strong>SU-8 2100</strong>, spun at <strong>3000 rpm</strong>, gives ridges about <strong>100 µm</strong> tall.",
                    "The ridges are the channels' negative: their height becomes the channel height, and channel height sets the shear stress on the cells.",
                    "Each master can mold hundreds of chips."]
            },
            {
                id: "silane", phase: "master", tool: "silane", short: "Silanize", where: "silane desiccator in the Soft Litho Lab",
                name: "Silanize the master with trichlorosilane vapor for 1 hour",
                card: ["Treatment: <strong>trichlorosilane vapor</strong> in a sealed desiccator for <strong>1 hour</strong> (30 min or more).",
                    "It coats the master with a non-stick layer, so cured PDMS peels off cleanly instead of tearing the ridges."]
            },
            {
                id: "mix", phase: "cast", tool: "mix", short: "Mix PDMS", where: "PDMS mixer in the Soft Litho Lab",
                name: "Mix Sylgard 184 PDMS: 10 parts base to 1 part curing agent",
                card: ["PDMS (polydimethylsiloxane) is a clear, flexible silicone rubber.",
                    "Ratio: <strong>10 : 1</strong> base to curing agent, by weight. More curing agent makes it stiffer; less leaves it soft and sticky.",
                    "Stir for 2–3 minutes. It will be full of bubbles."]
            },
            {
                id: "degas", phase: "cast", tool: "degas", short: "Degas", where: "vacuum degasser in the Soft Litho Lab",
                name: "Degas the PDMS under vacuum for 30 minutes",
                card: ["Vacuum: <strong>30 minutes</strong> (20 or more), until no bubbles are left.",
                    "Trapped bubbles would leave holes in the channel walls and dead zones where cells starve."]
            },
            {
                id: "cure", phase: "cast", tool: "oven", short: "Pour and cure", where: "cure oven in the Soft Litho Lab",
                name: "Pour the PDMS over the master and cure at 65 °C for 2 hours",
                card: ["Cure: <strong>65 °C for 2 hours</strong>. (80 °C needs about 1 hour; room temperature takes about 2 days.)",
                    "Under-cured PDMS stays tacky and leaches uncured chemicals into the cell medium."]
            },
            {
                id: "punch", phase: "bond", tool: "punch", short: "Peel and punch", where: "peel & punch bench in the Bonding Bay",
                name: "Peel the PDMS off the master and punch 1.5 mm inlet and outlet holes",
                card: ["Peel the slab off gently. The channels are now molded into its bottom face.",
                    "Punch inlets and outlets with a <strong>1.5 mm</strong> biopsy punch, so tubing fits snugly."]
            },
            {
                id: "plasma", phase: "bond", tool: "plasma", short: "Plasma bond", where: "plasma bonder in the Bonding Bay",
                name: "Plasma-bond top layer, porous membrane and bottom layer (30 s, press within a minute)",
                card: ["Membrane: <strong>porous, 0.4 µm pores</strong>. It separates the two channels but lets cells signal across.",
                    "Oxygen plasma: <strong>30 seconds</strong>. It activates the PDMS surface.",
                    "Press the layers together <strong>right away</strong> (within a minute). The activated surface relaxes back within minutes and stops bonding."]
            },
            {
                id: "coat", phase: "bond", tool: "coat", short: "ECM coating", where: "coating station in the Bonding Bay",
                name: "Coat the channels with collagen IV and fibronectin for 1 hour at 37 °C",
                card: ["Coating: <strong>collagen IV + fibronectin</strong>, proteins from the matrix cells normally sit on (ECM, extracellular matrix).",
                    "Incubate <strong>1 hour at 37 °C</strong>. Cells won't attach to bare PDMS."]
            },
            {
                id: "lab", phase: "lab", tool: "patients", short: "Organ chips", where: "Organ Lab",
                name: "In the Organ Lab, build each patient's organ chip with their cells and test their treatment",
                card: ["Each patient's chip uses <strong>their own cells</strong> (grown from stem cells), so the test predicts how <em>their</em> body responds.",
                    "Brain chip: brain endothelial cells + astrocytes + pericytes, flow for <strong>1–2 Pa</strong> of shear.",
                    "Lung chip: air on the top side and a gentle <strong>10% breathing stretch</strong>.",
                    "Talk to each patient with a <strong>?</strong>."]
            }
        ];

        function ps() {
            const s = api.save();
            if (!s.pdms) {
                s.pdms = { recipe: false, step: 0, defects: {}, data: {}, stepXp: {}, runs: 0, best: 0, helped: {}, boss: false, bossUp: false };
            }
            return s.pdms;
        }

        function current() {
            return STEPS[ps().step];
        }

        function isCurrentTool(tool) {
            const s = ps();
            return s.recipe && STEPS[s.step] && STEPS[s.step].tool === tool;
        }

        function defect(sev, cause) {
            return { sev: sev, cause: cause };
        }

        function allDefects() {
            const s = ps();
            return STEPS.reduce((l, st) => l.concat(s.defects[st.id] || []), []);
        }

        function cardHtml(st) {
            st = st || current();
            return st && st.card
                ? `<div class="adv-card"><p class="adv-card-title">📋 Dr. Silox's card</p><ul>${st.card.map((x) => `<li>${x}</li>`).join("")}</ul></div>`
                : "";
        }

        function open(title, lead, body, opts) {
            return api.openModal(`
                ${api.head("pdms", title)}
                <p class="adv-round">Recipe step ${ps().step + 1} of ${STEPS.length}</p>
                <p class="adv-lead">${lead}</p>
                ${cardHtml()}
                ${body}`, opts);
        }

        function completeStep(defs, summary) {
            const s = ps();
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
            const s = ps();
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

        // side view of the master: a wafer with SU-8 ridges of height h (µm)
        function drawMaster(c, x, y, w, ridgeH, opts) {
            opts = opts || {};
            rect(c, x, y, w, 10, "#9aa6bb");
            const px = Math.min(60, ridgeH * 0.4);
            [0.22, 0.62].forEach((f) => {
                rect(c, x + w * f, y - px, w * 0.16, px, opts.silane ? "#c9b8f0" : "#b7c96a");
            });
            if (opts.silane) {
                rect(c, x, y - 1, w, 1, "#c9b8f0");
            }
        }


        /* ---------- The chips, as the lab sees them ---------- */

        function model() {
            const d = ps().data;
            return {
                h: d.h || 100,               // channel height, µm
                torn: !!d.torn,
                stiff: d.ratio > 13 ? "soft" : d.ratio < 8 ? "stiff" : "ok",
                bubbles: !!d.bubbles,
                uncured: !!d.uncured,
                leak: !!d.leak,
                coat: d.coat || "ecm",
                badPunch: !!d.badPunch
            };
        }


        /* ---------- Station: SU-8 master ---------- */

        const GRADES = [
            { id: "2005", label: "SU-8 2005", t3000: 5 },
            { id: "2050", label: "SU-8 2050", t3000: 50 },
            { id: "2100", label: "SU-8 2100", t3000: 100 }
        ];

        function openMaster() {
            let grade = null;
            let busy = false;
            const m = open("SU-8 Master Bench", "The master is a mold made with the same photolithography as microchips: spin on SU-8, expose it through a mask with the channel pattern, and develop. Raised SU-8 ridges stay behind where the channels will be.", `
                ${canvasBlock("maCv")}
                <p class="adv-round">Resist</p>
                ${ui.chips("grade", GRADES.map((g) => ({ id: g.id, label: g.label })), null)}
                ${ui.slider("maRpm", "Spin speed", "rpm", 500, 6000, 100, 1000)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="maGo" data-autofocus>Spin, expose and develop</button></div>
                <p class="adv-result" id="maRes" aria-live="polite"></p>`);
            const c = $("maCv").getContext("2d");
            const rEl = ui.wireSlider("maRpm");
            ui.wireChips("grade", (v) => { grade = v; });
            bg(c);
            rect(c, 60, 170, 340, 10, "#9aa6bb");
            label(c, "silicon wafer", 230, 200, "#a9b2d0", "center");

            $("maGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!grade) {
                    ui.result("maRes", "Choose a resist first.", false);
                    return;
                }
                busy = true;
                const g = GRADES.find((x) => x.id === grade);
                const rpm = Number(rEl.value);
                const h = Math.round(g.t3000 * Math.sqrt(3000 / rpm));
                const px = Math.min(60, h * 0.4);
                runStages(m, "maCvCap", [
                    {
                        caption: `Spinning ${g.label} at ${rpm} rpm. The thick, honey-like resist spreads into an even layer about ${h} µm thick.`,
                        dur: 3000,
                        draw: (k) => {
                            bg(c);
                            rect(c, 60, 170, 340, 10, "#9aa6bb");
                            rect(c, 60, 170 - px * Math.min(1, k * 1.5), 340, px * Math.min(1, k * 1.5), "rgba(183, 201, 106, 0.8)");
                            label(c, `SU-8 layer: ${h} µm`, 230, 200, "#b7c96a", "center");
                        }
                    },
                    {
                        caption: "UV light shines through a mask. The clear parts of the mask are the channel shapes; under them the SU-8 crosslinks and hardens.",
                        dur: 3000,
                        draw: (k) => {
                            bg(c);
                            rect(c, 60, 170, 340, 10, "#9aa6bb");
                            rect(c, 60, 170 - px, 340, px, "rgba(183, 201, 106, 0.8)");
                            rect(c, 50, 60, 360, 10, "#3b4458");
                            rect(c, 60 + 340 * 0.22, 60, 340 * 0.16, 10, "#f5f7ff");
                            rect(c, 60 + 340 * 0.62, 60, 340 * 0.16, 10, "#f5f7ff");
                            c.fillStyle = `rgba(180, 120, 255, ${0.3 + 0.4 * Math.sin(k * Math.PI)})`;
                            c.fillRect(60 + 340 * 0.22, 70, 340 * 0.16, 100);
                            c.fillRect(60 + 340 * 0.62, 70, 340 * 0.16, 100);
                            label(c, "mask", 30, 68, "#a9b2d0");
                        }
                    },
                    {
                        caption: `Developing washes away the unexposed SU-8. Two ridges ${h} µm tall remain: the mold for the two channels.`,
                        dur: 3000,
                        draw: (k) => {
                            bg(c);
                            rect(c, 60, 170, 340, 10, "#9aa6bb");
                            if (k < 1) {
                                c.globalAlpha = 1 - k;
                                rect(c, 60, 170 - px, 340, px, "rgba(183, 201, 106, 0.8)");
                                c.globalAlpha = 1;
                            }
                            drawMaster(c, 60, 170, 340, h);
                            label(c, `ridges: ${h} µm tall`, 230, 200, "#b7c96a", "center");
                        }
                    }
                ], () => {
                    const defs = [];
                    if (Math.abs(h - 100) > 15) {
                        defs.push(defect(Math.abs(h - 100) > 40 ? "major" : "minor", `The ridges came out ${h} µm instead of ~100 µm, so the channels are ${h < 100 ? "shallower" : "deeper"}. Since shear goes with 1/h², the flow you'd set for brain-like shear will be off.`));
                    }
                    ps().data.h = h;
                    completeStep(defs, `<p>Made a master with <strong>${h} µm</strong> ridges using ${g.label} at ${rpm} rpm.</p>`);
                });
            });
        }


        /* ---------- Station: silane desiccator ---------- */

        function openSilane() {
            let how = null;
            let busy = false;
            const m = open("Silane Desiccator", "PDMS sticks stubbornly to SU-8 and silicon. A few drops of silane in a sealed desiccator leave a one-molecule-thick, non-stick coating on the master.", `
                ${canvasBlock("siCv")}
                ${ui.chips("sil", [{ id: "silane", label: "Trichlorosilane vapor" }, { id: "skip", label: "Skip it" }], null)}
                ${ui.slider("siMin", "Time", "min", 10, 120, 10, 10)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="siGo" data-autofocus>Treat the master</button></div>
                <p class="adv-result" id="siRes" aria-live="polite"></p>`);
            const c = $("siCv").getContext("2d");
            const tEl = ui.wireSlider("siMin");
            ui.wireChips("sil", (v) => { how = v; });
            const h = ps().data.h || 100;

            function draw(k, now, coat) {
                bg(c);
                c.strokeStyle = "rgba(220,235,255,0.6)";
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(80, 200);
                c.lineTo(80, 70);
                c.quadraticCurveTo(230, 0, 380, 70);
                c.lineTo(380, 200);
                c.stroke();
                rect(c, 70, 200, 320, 8, "#5d6577");
                drawMaster(c, 140, 180, 180, h, { silane: coat });
                for (let i = 0; i < 18 * k; i++) {
                    const ph = ((now / 3000) + i / 18) % 1;
                    const x = 100 + ((i * 53) % 260);
                    const y = 190 - ph * 150;
                    c.fillStyle = "rgba(201, 184, 240, 0.6)";
                    c.beginPath();
                    c.arc(x, y, 2.5, 0, Math.PI * 2);
                    c.fill();
                }
                rect(c, 340, 186, 14, 10, "#c8ceda");
                label(c, "silane drop", 347, 222, "#a9b2d0", "center");
            }
            draw(0, 0, false);

            $("siGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!how) {
                    ui.result("siRes", "Choose a treatment first.", false);
                    return;
                }
                busy = true;
                const t = Number(tEl.value);
                const ok = how === "silane" && t >= 30;
                runStages(m, "siCvCap", how === "skip" ? [
                    { caption: "Skipped. The bare SU-8 and silicon will grab onto the PDMS.", dur: 2500, draw: (k, now) => draw(0, now, false) }
                ] : [
                    { caption: `The desiccator is pumped down and the silane evaporates, filling the chamber with vapor for ${t} min.`, dur: 4000, draw: (k, now) => draw(k, now, false) },
                    { caption: ok ? "Silane molecules bond to the surface, leaving a non-stick layer (purple) one molecule thick." : `${t} min left only a patchy coating.`, dur: 3000, draw: (k, now) => draw(1, now, true) }
                ], () => {
                    const defs = [];
                    if (how === "skip") {
                        ps().data.torn = true;
                        defs.push(defect("major", "Without silane, the cured PDMS stuck to the master and tore as you peeled it, ripping channel walls and pulling ridges off the master."));
                    } else if (t < 30) {
                        ps().data.torn = true;
                        defs.push(defect("minor", `${t} min of silane left patchy spots where the PDMS stuck and tore a little.`));
                    }
                    completeStep(defs, `<p>${how === "skip" ? "Skipped silanizing." : `Silanized the master for ${t} min.`}</p>`);
                });
            });
        }


        /* ---------- Station: PDMS mixer ---------- */

        function openMix() {
            let busy = false;
            const m = open("PDMS Mixer", "Sylgard 184 comes as two liquids: a thick base and a curing agent that links the base's chains together when heated.", `
                ${canvasBlock("mxCv")}
                ${ui.slider("mxRatio", "Base : curing agent", ": 1", 3, 25, 1, 5)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="mxGo" data-autofocus>Weigh and stir</button></div>
                <p class="adv-result" id="mxRes" aria-live="polite"></p>`);
            const c = $("mxCv").getContext("2d");
            const rEl = ui.wireSlider("mxRatio");

            function draw(k, now, ratio) {
                bg(c);
                rect(c, 150, 60, 160, 140, "#d9e2f0");
                const base = 120 * (ratio / (ratio + 1));
                const agent = 120 - base;
                rect(c, 156, 194 - base, 148, base, "rgba(230, 240, 250, 0.85)");
                rect(c, 156, 194 - base - agent * (1 - k), 148, agent * (1 - k), "rgba(255, 220, 140, 0.8)");
                // stirring swirls and trapped bubbles
                for (let i = 0; i < 30 * k; i++) {
                    const a = now / 400 + i;
                    const r = 20 + (i * 7) % 50;
                    c.fillStyle = "rgba(255,255,255,0.8)";
                    c.beginPath();
                    c.arc(230 + Math.cos(a) * r, 150 + Math.sin(a) * r * 0.5, 2, 0, Math.PI * 2);
                    c.fill();
                }
                rect(c, 228, 30, 4, 120, "#8f98aa");
                label(c, `base ${ratio} : 1 curing agent`, 230, 222, "#a9b2d0", "center");
                label(c, "base", 320, 180, "#e3eef8");
                if (k < 0.5) {
                    label(c, "curing agent", 320, 194 - base - 4, "#ffd884");
                }
            }
            draw(0, 0, 10);
            rEl.addEventListener("input", () => draw(0, 0, Number(rEl.value)));

            $("mxGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const r = Number(rEl.value);
                runStages(m, "mxCvCap", [
                    { caption: `Weighing out ${r} parts base (clear) to 1 part curing agent (yellow).`, dur: 2500, draw: (k, now) => draw(0, now, r) },
                    { caption: "Stirring blends them evenly, and whips in lots of tiny air bubbles (white). Those have to come out next.", dur: 4000, draw: (k, now) => draw(k, now, r) }
                ], () => {
                    const defs = [];
                    if (r < 8) {
                        defs.push(defect("minor", `${r}:1 has extra curing agent, making the PDMS stiff and brittle. The breathing stretch in a lung chip could crack it.`));
                    } else if (r > 13) {
                        defs.push(defect("minor", `${r}:1 has too little curing agent. The PDMS stays soft and tacky, and uncured chains can leach into the cell medium.`));
                    }
                    ps().data.ratio = r;
                    completeStep(defs, `<p>Mixed PDMS at <strong>${r} : 1</strong>.</p>`);
                });
            });
        }


        /* ---------- Station: vacuum degasser ---------- */

        function openDegas() {
            let busy = false;
            const m = open("Vacuum Degasser", "Under vacuum, the trapped air bubbles swell, rise and pop. Without this step, they'd freeze into the cured chip.", `
                ${canvasBlock("dgCv")}
                ${ui.slider("dgMin", "Time under vacuum", "min", 0, 60, 5, 5)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="dgGo" data-autofocus>Pump down</button></div>
                <p class="adv-result" id="dgRes" aria-live="polite"></p>`);
            const c = $("dgCv").getContext("2d");
            const tEl = ui.wireSlider("dgMin");
            const seeds = Array.from({ length: 40 }, (_, i) => [(i * 37) % 140, (i * 59) % 100, 1.5 + (i % 4)]);

            function draw(left, now, vac) {
                bg(c);
                c.strokeStyle = "rgba(220,235,255,0.6)";
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(110, 210);
                c.lineTo(110, 60);
                c.quadraticCurveTo(230, 0, 350, 60);
                c.lineTo(350, 210);
                c.stroke();
                rect(c, 160, 100, 140, 105, "#d9e2f0");
                rect(c, 164, 110, 132, 92, "rgba(230, 240, 250, 0.85)");
                const n = Math.round(seeds.length * left);
                for (let i = 0; i < n; i++) {
                    const [sx, sy, r] = seeds[i];
                    const rise = vac ? ((now / 25 + sx) % 100) : 0;
                    c.strokeStyle = "rgba(120, 140, 170, 0.8)";
                    c.lineWidth = 1;
                    c.beginPath();
                    c.arc(166 + (sx % 128), 196 - ((sy + rise) % 88), r * (vac ? 1.6 : 1), 0, Math.PI * 2);
                    c.stroke();
                }
                label(c, vac ? "vacuum on: bubbles swell, rise and pop" : "", 230, 226, "#a9b2d0", "center");
            }
            draw(1, 0, false);

            $("dgGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const t = Number(tEl.value);
                const left = Math.max(0, 1 - t / 25);
                runStages(m, "dgCvCap", [
                    { caption: `Pumping down for ${t} min. Lower pressure makes each bubble expand, rise to the surface and burst.`, dur: 5000, draw: (k, now) => draw(1 - (1 - left) * k, now, t > 0) },
                    { caption: left > 0.05 ? `Vacuum off. ${Math.round(left * 100)}% of the bubbles are still trapped.` : "Vacuum off. The PDMS is perfectly clear: not a bubble left.", dur: 2500, draw: (k, now) => draw(left, now, false) }
                ], () => {
                    const defs = [];
                    if (left > 0.3) {
                        ps().data.bubbles = true;
                        defs.push(defect("major", `${t} min wasn't enough to remove the bubbles. They froze into the chip as holes and voids, and some sit right in the channels.`));
                    } else if (left > 0.05) {
                        defs.push(defect("minor", `A few bubbles survived ${t} min of degassing and left tiny voids.`));
                    }
                    completeStep(defs, `<p>Degassed for ${t} min.</p>`);
                });
            });
        }


        /* ---------- Station: pour and cure ---------- */

        function openOven() {
            let busy = false;
            const m = open("Cure Oven", "Pour the clear PDMS over the master, then heat it. The curing agent links the polymer chains into a soft, solid rubber that copies every detail of the ridges.", `
                ${canvasBlock("ovCv")}
                ${ui.slider("ovT", "Oven temperature", "°C", 25, 150, 5, 40)}
                ${ui.slider("ovH", "Time", "h", 0.5, 48, 0.5, 0.5)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="ovGo" data-autofocus>Pour and cure</button></div>
                <p class="adv-result" id="ovRes" aria-live="polite"></p>`);
            const c = $("ovCv").getContext("2d");
            const tEl = ui.wireSlider("ovT");
            const hEl = ui.wireSlider("ovH", (v) => v.toFixed(1));
            const h = ps().data.h || 100;

            function draw(pour, oven, cure, T) {
                bg(c);
                if (oven > 0) {
                    rect(c, 50, 20, 360, 200, "#3a4256");
                    rect(c, 60, 30, 340, 180, `rgba(255, 150, 60, ${0.1 + 0.3 * oven})`);
                    label(c, `${T} °C`, 70, 50, "#f5f7ff", "left", true);
                }
                drawMaster(c, 100, 180, 260, h, { silane: true });
                const level = 180 - 70 * pour;
                c.fillStyle = cure > 0.9 ? "rgba(200, 230, 240, 0.55)" : "rgba(230, 240, 250, 0.4)";
                c.fillRect(100, level, 260, 180 - level);
                if (pour > 0 && pour < 1) {
                    rect(c, 226, 30, 8, level - 30, "rgba(230, 240, 250, 0.6)");
                }
                label(c, cure > 0.9 ? "cured: solid rubber" : pour > 0 ? "liquid PDMS" : "", 230, 205, "#a9b2d0", "center");
            }
            draw(0, 0, 0, 25);

            $("ovGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                const H = Number(hEl.value);
                const need = T >= 80 ? 1 : T >= 60 ? 2 : T >= 40 ? 8 : 48;
                const cured = H >= need;
                runStages(m, "ovCvCap", [
                    { caption: "Pouring the PDMS over the master. It flows around the ridges and fills every corner.", dur: 3000, draw: (k) => draw(k, 0, 0, T) },
                    { caption: `Curing at ${T} °C for ${H} h. ${cured ? "The chains link up into a solid, flexible rubber." : `At ${T} °C it needs about ${need} h, so it's still tacky in places.`}`, dur: 3500, draw: (k) => draw(1, Math.min(1, (T - 25) / 100), cured ? k : k * 0.6, T) }
                ], () => {
                    const defs = [];
                    if (!cured) {
                        ps().data.uncured = true;
                        defs.push(defect("major", `${H} h at ${T} °C didn't fully cure the PDMS (it needs about ${need} h at that temperature). It's tacky, deforms, and leaches uncured chemicals onto the cells.`));
                    } else if (T > 120) {
                        defs.push(defect("minor", `${T} °C cured it fast, but the heat warped the master and stressed the PDMS.`));
                    }
                    completeStep(defs, `<p>Cured at ${T} °C for ${H} h.</p>`);
                });
            });
        }


        /* ---------- Station: peel and punch ---------- */

        function openPunch() {
            let size = null;
            let busy = false;
            const m = open("Peel & Punch Bench", "Peel the cured slab off the master: the channels are now molded into its bottom face. Then punch holes where the tubing will plug in.", `
                ${canvasBlock("pnCv")}
                <p class="adv-round">Biopsy punch</p>
                ${ui.chips("pun", [{ id: "0.5", label: "0.5 mm" }, { id: "1.5", label: "1.5 mm" }, { id: "5", label: "5 mm" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="pnGo" data-autofocus>Peel and punch</button></div>
                <p class="adv-result" id="pnRes" aria-live="polite"></p>`);
            const c = $("pnCv").getContext("2d");
            ui.wireChips("pun", (v) => { size = v; });
            const d = ps().data;
            const h = d.h || 100;

            function draw(peel, holes, sz) {
                bg(c);
                drawMaster(c, 100, 200, 260, h, { silane: true });
                c.save();
                c.translate(100, 200);
                c.rotate(-peel * 0.5);
                c.fillStyle = "rgba(200, 230, 240, 0.55)";
                c.fillRect(0, -70, 260, 70);
                // channel grooves on the underside
                const gh = Math.min(60, h * 0.4);
                c.fillStyle = "#0b1020";
                c.fillRect(260 * 0.22, -gh, 260 * 0.16, gh);
                c.fillRect(260 * 0.62, -gh, 260 * 0.16, gh);
                if (d.torn && peel > 0.5) {
                    c.fillStyle = "#ff6b7d";
                    c.fillRect(260 * 0.62, -gh - 6, 260 * 0.16, 4);
                }
                if (holes > 0) {
                    const w = Math.min(40, Number(sz) * 6);
                    [[0.27, 0.32], [0.67, 0.72]].forEach(([a]) => {
                        rect(c, 260 * a, -70, w, 70 - gh, "#0b1020");
                    });
                }
                c.restore();
                if (peel > 0.9) {
                    label(c, "channels molded into the underside", 230, 222, "#a9b2d0", "center");
                }
            }
            draw(0, 0, 1.5);

            $("pnGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!size) {
                    ui.result("pnRes", "Choose a punch size first.", false);
                    return;
                }
                busy = true;
                runStages(m, "pnCvCap", [
                    { caption: d.torn ? "Peeling… it sticks and tears in spots (red), because the master wasn't silanized well." : "Peeling the slab off. Thanks to the silane it releases cleanly, with the channels molded into its underside.", dur: 3500, draw: (k) => draw(k, 0, size) },
                    { caption: `Punching inlet and outlet holes with a ${size} mm punch, straight through to each channel.`, dur: 2500, draw: (k) => draw(1, k, size) }
                ], () => {
                    const defs = [];
                    if (size === "0.5") {
                        ps().data.badPunch = true;
                        defs.push(defect("minor", "0.5 mm holes are too small for standard tubing, so connections leak or pop out."));
                    } else if (size === "5") {
                        ps().data.badPunch = true;
                        defs.push(defect("major", "A 5 mm punch is wider than the channel and cut through its walls. The ports leak."));
                    }
                    completeStep(defs, `<p>Peeled the slab and punched ${size} mm ports.</p>`);
                });
            });
        }


        /* ---------- Station: plasma bonder ---------- */

        function openPlasma() {
            let mem = null;
            let wait = null;
            let busy = false;
            const m = open("Plasma Bonder", "A two-channel organ chip is a sandwich: a top PDMS layer with one channel, a thin porous membrane, and a bottom layer with the other channel. Oxygen plasma makes the PDMS surfaces bond permanently, with no glue.", `
                ${canvasBlock("plCv")}
                <p class="adv-round">Membrane</p>
                ${ui.chips("mem", [{ id: "0.4", label: "Porous, 0.4 µm pores" }, { id: "solid", label: "Solid film, no pores" }, { id: "none", label: "No membrane" }], null)}
                ${ui.slider("plSec", "Plasma time", "s", 0, 300, 10, 0)}
                <p class="adv-round">Press layers together</p>
                ${ui.chips("wait", [{ id: "now", label: "Right away" }, { id: "late", label: "After 30 minutes" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="plGo" data-autofocus>Bond</button></div>
                <p class="adv-result" id="plRes" aria-live="polite"></p>`);
            const c = $("plCv").getContext("2d");
            const sEl = ui.wireSlider("plSec");
            ui.wireChips("mem", (v) => { mem = v; });
            ui.wireChips("wait", (v) => { wait = v; });

            function draw(glow, close, memKind, sealed, leakDrops, now) {
                bg(c);
                const gap = 40 * (1 - close);
                // bottom layer, membrane, top layer
                rect(c, 80, 150 + gap, 300, 50, "rgba(200, 230, 240, 0.55)");
                rect(c, 150, 150 + gap, 60, 16, "#0b1020");
                if (memKind !== "none") {
                    rect(c, 80, 140, 300, 6, memKind === "solid" ? "#c8ceda" : "#f5f7ff");
                    if (memKind === "0.4") {
                        for (let x = 84; x < 380; x += 8) {
                            rect(c, x, 141, 2, 4, "#0b1020");
                        }
                    }
                }
                rect(c, 80, 80 - gap, 300, 54, "rgba(200, 230, 240, 0.55)");
                rect(c, 150, 118 - gap, 60, 16, "#0b1020");
                if (glow > 0) {
                    c.fillStyle = `rgba(180, 140, 255, ${glow})`;
                    c.fillRect(80, 134 - gap, 300, 4);
                    c.fillRect(80, 146 + gap, 300, 4);
                }
                label(c, "top layer (blood or air channel)", 230, 72 - gap, "#a9b2d0", "center");
                label(c, "bottom layer (tissue channel)", 230, 222, "#a9b2d0", "center");
                if (leakDrops) {
                    for (let i = 0; i < 6; i++) {
                        const x = 210 + ((now / 10 + i * 30) % 160);
                        c.fillStyle = "#ff6b7d";
                        c.beginPath();
                        c.arc(x, 143, 3, 0, Math.PI * 2);
                        c.fill();
                    }
                }
                if (sealed !== null) {
                    c.font = "bold 13px sans-serif";
                    c.textAlign = "right";
                    c.fillStyle = sealed ? "#5be38a" : "#ff9aa6";
                    c.fillText(sealed ? "✓ Bonded" : "✗ Leaks", 440, 30);
                }
            }
            draw(0, 0, "0.4", null, false, 0);

            $("plGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!mem || !wait) {
                    ui.result("plRes", "Choose a membrane and when to press the layers.", false);
                    return;
                }
                busy = true;
                const sec = Number(sEl.value);
                const bonded = sec >= 10 && sec <= 120 && wait === "now";
                runStages(m, "plCvCap", [
                    { caption: sec > 0 ? `Oxygen plasma for ${sec} s. The purple glow strips the surface's methyl groups and leaves reactive silanol groups behind.` : "No plasma: the surfaces stay inert.", dur: 3000, draw: (k, now) => draw(sec > 0 ? 0.4 + 0.4 * Math.sin(now / 80) * 0.5 : 0, 0, mem, null, false, now) },
                    { caption: wait === "now" ? "Pressing the layers together right away, while the surfaces are still activated." : "Waiting 30 minutes… the surfaces relax back to their non-stick state before you press them together.", dur: 3000, draw: (k, now) => draw(wait === "now" && sec > 0 ? 0.5 * (1 - k) : 0, k, mem, null, false, now) },
                    { caption: bonded ? "Leak test: dyed fluid stays inside the channels. The layers are fused into one permanent block." : "Leak test: dyed fluid (red) seeps out between the layers. The bond failed.", dur: 3000, draw: (k, now) => draw(0, 1, mem, bonded, !bonded, now) }
                ], () => {
                    const defs = [];
                    if (!bonded) {
                        ps().data.leak = true;
                        defs.push(defect("major", sec < 10 ? "Without plasma the layers just rest on each other and leak." : sec > 120 ? `${sec} s of plasma over-treated the surface, which cracked and bonded poorly.` : "Waiting 30 minutes let the activated surfaces recover, so the layers didn't bond and the chip leaks."));
                    }
                    if (mem === "solid") {
                        defs.push(defect("major", "A solid membrane blocks everything. Cells on either side can't signal each other, and drugs can't cross, so there's no barrier to test."));
                    } else if (mem === "none") {
                        defs.push(defect("major", "With no membrane the two channels become one. There's no barrier between 'blood' and 'tissue' to study."));
                    }
                    ps().data.mem = mem;
                    completeStep(defs, `<p>Bonded with ${sec} s of plasma, pressed ${wait === "now" ? "right away" : "after 30 minutes"}, ${mem === "0.4" ? "with a 0.4 µm porous membrane" : mem === "solid" ? "with a solid film" : "with no membrane"}.</p>`);
                });
            });
        }


        /* ---------- Station: ECM coating ---------- */

        function openCoat() {
            let what = null;
            let busy = false;
            const m = open("Coating Station", "Cells in the body sit on a mat of proteins called the extracellular matrix (ECM). Coating the channels with the right proteins gives cells something to grab.", `
                ${canvasBlock("ctCv")}
                ${ui.chips("ecm", [{ id: "ecm", label: "Collagen IV + fibronectin" }, { id: "bsa", label: "BSA (albumin)" }, { id: "none", label: "Nothing" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="ctGo" data-autofocus>Coat and incubate 1 h at 37 °C</button></div>
                <p class="adv-result" id="ctRes" aria-live="polite"></p>`);
            const c = $("ctCv").getContext("2d");
            ui.wireChips("ecm", (v) => { what = v; });

            function draw(coatK, kind, cellsK, now) {
                bg(c);
                rect(c, 40, 160, 380, 40, "rgba(200, 230, 240, 0.55)");
                label(c, "channel floor (PDMS)", 230, 222, "#a9b2d0", "center");
                if (kind === "ecm") {
                    for (let x = 44; x < 44 + 372 * coatK; x += 12) {
                        c.strokeStyle = "#ff8aa8";
                        c.lineWidth = 2;
                        c.beginPath();
                        c.moveTo(x, 158);
                        c.quadraticCurveTo(x + 6, 150, x + 12, 158);
                        c.stroke();
                    }
                } else if (kind === "bsa") {
                    for (let x = 48; x < 44 + 372 * coatK; x += 10) {
                        c.fillStyle = "#c8ceda";
                        c.beginPath();
                        c.arc(x, 155, 4, 0, Math.PI * 2);
                        c.fill();
                    }
                }
                // a cell test: do cells spread out and stick?
                if (cellsK > 0) {
                    const stick = kind === "ecm";
                    for (let i = 0; i < 6; i++) {
                        const x = 70 + i * 60;
                        const y = stick ? 70 + 72 * Math.min(1, cellsK * 1.5) : 70 + 50 * Math.sin(Math.min(1, cellsK) * Math.PI) + 20 * Math.sin(now / 300 + i);
                        const flat = stick ? Math.min(1, Math.max(0, cellsK * 2 - 0.8)) : 0;
                        c.fillStyle = "#5be38a";
                        c.beginPath();
                        c.ellipse(x, y, 10 + 12 * flat, 10 - 5 * flat, 0, 0, Math.PI * 2);
                        c.fill();
                        rect(c, x - 2, y - 2, 4, 4, "#2e8a45");
                    }
                    label(c, stick ? "cells spread out and stick" : "cells float around and wash away", 230, 40, stick ? "#5be38a" : "#ff9aa6", "center");
                }
            }
            draw(0, "none", 0, 0);

            $("ctGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!what) {
                    ui.result("ctRes", "Choose a coating first.", false);
                    return;
                }
                busy = true;
                runStages(m, "ctCvCap", [
                    { caption: what === "ecm" ? "Collagen IV and fibronectin (pink) settle onto the PDMS and form a thin protein mat." : what === "bsa" ? "BSA (gray) sticks to the PDMS, but it's the protein labs use to stop cells from sticking." : "Leaving the PDMS bare.", dur: 3500, draw: (k) => draw(k, what, 0, 0) },
                    { caption: "A quick test with a few cells: do they grab on and spread out?", dur: 4000, draw: (k, now) => draw(1, what, k, now) }
                ], () => {
                    const defs = [];
                    if (what !== "ecm") {
                        defs.push(defect("major", what === "bsa" ? "BSA blocks cell attachment. Cells won't form a layer, so there's no barrier." : "Cells barely stick to bare PDMS. They won't form a proper layer."));
                    }
                    ps().data.coat = what;
                    completeStep(defs, `<p>Coated with ${what === "ecm" ? "collagen IV and fibronectin" : what === "bsa" ? "BSA" : "nothing"}. The chips are ready for cells.</p>`);
                });
            });
        }


        /* ---------- Patients ---------- */

        const PATIENTS = [
            {
                id: "elena", name: "Elena", organ: "brain", x: 3, y: 5, look: { suit: "#ffd1dc", accent: "#ff6b9d", visor: "#5ad1ff" },
                story: [
                    "Hi, I'm Elena. I have a brain tumor.",
                    "The blood-brain barrier keeps most drugs out of my brain, including most cancer drugs. My doctors need to know which drug can actually get through."
                ],
                thanks: "My chip showed which drug can cross my barrier. My doctors are planning treatment around it. Thank you!"
            },
            {
                id: "haddad", name: "Mr. Haddad", organ: "lung", x: 8, y: 5, look: { suit: "#e3ebff", accent: "#3d6fd8", visor: "#33405c" },
                story: [
                    "Hello… I'm short of breath. A bad pneumonia damaged my lungs, and fluid keeps leaking into the tiny air sacs.",
                    "That fluid stops oxygen from reaching my blood. My doctors want to test which drug best stops the leaking."
                ],
                thanks: "My lung chip found the drug that stops the leaking. I'm already breathing a little easier. Thank you!"
            },
            {
                id: "nakamura", name: "Mrs. Nakamura", organ: "kidney", x: 13, y: 5, look: { suit: "#e6defa", accent: "#b46bff", visor: "#5be38a" },
                story: [
                    "Good afternoon. My kidneys are failing, and now I have an infection that needs an antibiotic.",
                    "Some antibiotics are hard on the kidneys. My doctors need one that won't damage what kidney function I have left."
                ],
                thanks: "The kidney chip showed which antibiotic is gentle on my kidneys. Thank you!"
            },
            {
                id: "adeyemi", name: "Mr. Adeyemi", organ: "liver", x: 16, y: 11, look: { suit: "#d6ffd9", accent: "#2ebfa5", visor: "#ffd84a" },
                story: [
                    "Hey there. My liver is failing, and I'm in a lot of pain after surgery.",
                    "Acetaminophen, a common pain reliever, is broken down by the liver and can harm it at high doses. My doctors want to know how much is safe for my liver."
                ],
                thanks: "The liver chip helped my doctors find a dose my liver can handle. Thank you!"
            }
        ];

        const CELLS = {
            brain: [
                { id: "good", label: "Brain endothelial cells + astrocytes + pericytes (from Elena's stem cells)" },
                { id: "line", label: "Immortalized brain endothelial line (hCMEC/D3) alone" },
                { id: "skin", label: "Skin fibroblasts" }
            ],
            lung: [
                { id: "good", label: "Alveolar epithelial cells (air side) + lung capillary endothelial cells (blood side)" },
                { id: "liver", label: "Liver cells on both sides" },
                { id: "skin", label: "Skin cells (air side) only" }
            ],
            kidney: [
                { id: "good", label: "Kidney proximal tubule cells + endothelial cells" },
                { id: "lung", label: "Lung cells" },
                { id: "skin", label: "Skin fibroblasts" }
            ],
            liver: [
                { id: "good", label: "Hepatocytes (liver cells) + liver endothelial cells" },
                { id: "kidney", label: "Kidney cells" },
                { id: "skin", label: "Skin fibroblasts" }
            ]
        };

        function allHelped() {
            return PATIENTS.every((p) => ps().helped[p.id]);
        }

        function patientTalk(p) {
            const s = ps();
            if (s.helped[p.id]) {
                return [p.thanks];
            }
            if (s.recipe && current() && current().id === "lab") {
                return { lines: p.story.concat(["The lab says my chip is ready to build. Let's do it!"]), done: () => openPatient(p) };
            }
            return p.story.concat([s.recipe ? "Dr. Silox at the Soft Litho Lab is making the chips. I hope they're ready soon!" : "Someone said Dr. Silox at the Soft Litho Lab needs help making organ chips…"]);
        }

        // How healthy any chip from this batch is, 0..1.
        function chipQuality() {
            const md = model();
            let q = 1;
            if (md.leak) {
                q -= 0.5;
            }
            if (md.bubbles) {
                q -= 0.3;
            }
            if (md.uncured) {
                q -= 0.25;
            }
            if (md.coat !== "ecm") {
                q -= 0.5;
            }
            if (md.torn || md.badPunch) {
                q -= 0.15;
            }
            if (ps().data.mem !== "0.4") {
                q -= 0.6;
            }
            return Math.max(0, q);
        }

        function openPatient(p) {
            const md = model();
            const q = chipQuality();
            let cells = null;
            const parts = {
                brain: `
                    ${ui.slider("bQ", "Pump flow rate Q", "µL/min", 0, 400, 10, 20)}
                    <p class="adv-keys" style="text-align:left">Shear on the cells: τ = 6μQ ÷ (w h²) = <strong id="bTau">0</strong> Pa (μ = 0.7 mPa·s, w = 1 mm, h = ${md.h} µm). Target: 1–2 Pa.</p>`,
                lung: `
                    <label class="adv-check"><input type="checkbox" id="lAir"> Air in the top channel (air–liquid interface)</label>
                    ${ui.slider("lStr", "Breathing stretch", "%", 0, 30, 1, 0)}
                    ${ui.slider("lHz", "Breaths per minute", "", 0, 30, 1, 0)}`,
                kidney: `<label class="adv-check"><input type="checkbox" id="kFlow"> Flow through the tubule channel</label>`,
                liver: `<label class="adv-check"><input type="checkbox" id="vFlow"> Flow through the blood channel</label>`
            }[p.organ];

            const m = api.openModal(`
                ${api.head("pdms", `${p.name}'s ${p.organ} chip`)}
                ${cardHtml(STEPS[STEPS.length - 1])}
                <p class="adv-lead">${p.story[1]}</p>
                <p class="adv-round">Cells to seed</p>
                ${ui.chips("cells", CELLS[p.organ], null)}
                ${parts}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="pgGo" data-autofocus>Seed and grow for 5 days</button></div>
                <p class="adv-result" id="pgRes" aria-live="polite"></p>
                <canvas id="pgCv" width="460" height="230" class="adv-wide-canvas" hidden></canvas>
                <div id="pgTest"></div>`);
            ui.wireChips("cells", (v) => { cells = v; });

            let tau = 0;
            if (p.organ === "brain") {
                ui.wireSlider("bQ", null, (Q) => {
                    tau = 6 * 0.7e-3 * (Q * 1e-9 / 60) / (1e-3 * Math.pow(md.h * 1e-6, 2));
                    $("bTau").textContent = tau.toFixed(2);
                });
            } else if (p.organ === "lung") {
                ui.wireSlider("lStr");
                ui.wireSlider("lHz");
            }

            $("pgGo").addEventListener("click", () => {
                if (!cells) {
                    ui.result("pgRes", "Choose which cells to seed first.", false);
                    return;
                }
                if (cells !== "good") {
                    ui.result("pgRes", `✗ ${p.organ === "brain" && cells === "line" ? "Immortalized lines are easy to grow but form a leaky barrier (TEER usually under about 50 Ω·cm²). Elena's own stem-cell-derived brain cells, with astrocytes and pericytes, make a far tighter one." : "Those aren't the right cells for this organ. The chip only predicts this patient's response if it's built from the same kind of tissue."}`, false);
                    return;
                }
                $("pgGo").disabled = true;
                // how good the tissue gets depends on the chip and on the conditions
                let cond = 1;
                const notes = [];
                if (p.organ === "brain") {
                    if (tau < 0.5) {
                        cond = 0.5;
                        notes.push(`At ${tau.toFixed(2)} Pa there's too little shear. Brain endothelial cells need flow to line up and tighten their junctions.`);
                    } else if (tau > 3) {
                        cond = 0.6;
                        notes.push(`${tau.toFixed(1)} Pa is too much drag. Cells start peeling off.`);
                    } else if (tau < 0.9 || tau > 2.2) {
                        cond = 0.8;
                        notes.push(`${tau.toFixed(2)} Pa is close, but brain capillaries are usually modeled at 1–2 Pa.`);
                    }
                } else if (p.organ === "lung") {
                    const air = $("lAir").checked;
                    const st = Number($("lStr").value);
                    const hz = Number($("lHz").value);
                    if (!air) {
                        cond -= 0.4;
                        notes.push("Without air in the top channel, the alveolar cells sit under liquid and don't mature into a real air sac lining.");
                    }
                    if (st < 5 || hz < 6) {
                        cond -= 0.2;
                        notes.push("With little or no breathing motion, the lung cells don't behave like a living, breathing lung.");
                    } else if (st > 20) {
                        cond -= 0.3;
                        notes.push(`${st}% stretch is far more than normal breathing, and it tears the cell layer.`);
                    }
                    if (ps().data.ratio < 8 && st > 0) {
                        cond -= 0.2;
                        notes.push("The stiff PDMS (too much curing agent) cracked under the breathing stretch.");
                    }
                } else {
                    const flow = $(p.organ === "kidney" ? "kFlow" : "vFlow").checked;
                    if (!flow) {
                        cond = 0.6;
                        notes.push(p.organ === "kidney" ? "Kidney tubule cells need fluid flowing over them, like urine through a real tubule, to work normally." : "Without flow, nutrients and oxygen run low and the liver cells lose their function.");
                    }
                }
                const health = Math.max(0, q * Math.max(0.2, cond));
                runGrow(m, p, health, notes);
            });
        }

        function runGrow(m, p, health, notes) {
            const cnv = $("pgCv");
            cnv.hidden = false;
            const c = cnv.getContext("2d");
            ui.result("pgRes", "Seeding the cells and perfusing medium…");
            ui.animate(m, 7000, (k, now) => {
                bg(c);
                // the chip in cross-section: top channel, membrane, bottom channel
                rect(c, 40, 50, 380, 50, "rgba(200, 230, 240, 0.35)");
                rect(c, 40, 104, 380, 6, "#f5f7ff");
                rect(c, 40, 114, 380, 50, "rgba(200, 230, 240, 0.35)");
                const n = Math.floor(30 * Math.min(1, k * 1.3) * Math.max(0.15, health));
                for (let i = 0; i < n; i++) {
                    const x = 46 + i * 12.6;
                    c.fillStyle = "#5be38a";
                    c.beginPath();
                    c.ellipse(x, 98, 6, 4, 0, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = p.organ === "brain" ? "#c97fe0" : "#ffb84a";
                    c.beginPath();
                    c.ellipse(x + 4, 118, 5, 3, 0, 0, Math.PI * 2);
                    c.fill();
                }
                for (let i = 0; i < 8; i++) {
                    const x = 40 + ((now / 6 + i * 50) % 380);
                    rect(c, x, 70, 6, 1, "rgba(127, 178, 255, 0.7)");
                }
                label(c, p.organ === "lung" ? "air channel" : "blood channel (top)", 46, 44);
                label(c, `${p.organ} tissue channel (bottom)`, 46, 180);
                label(c, `Day ${Math.min(5, Math.floor(k * 5) + 1)} of 5`, 414, 44, "#f5f7ff", "right", true);
            }, () => testPhase(m, p, health, notes, c));
        }

        function testPhase(m, p, health, notes, c) {
            const leaky = health < 0.55;
            const intro = notes.length ? notes.map((n) => `<p>⚠️ ${n}</p>`).join("") : "<p>The tissue grew into a healthy, connected layer.</p>";
            if (p.organ === "brain") {
                const teer = Math.round(80 + 1500 * health * health);
                const rBlank = 100;
                const area = 0.1;
                const rCells = Math.round(rBlank + teer / area);
                const opts = [teer, Math.round(rCells * area), Math.round((rCells - rBlank) / area), Math.round(rCells - rBlank)].map((v, i) => ({ v: v, ok: i === 0 }));
                const sh = window.SCGames ? window.SCGames.shuffle(opts) : opts;
                $("pgTest").innerHTML = `
                    <div class="adv-takeaway">${intro}
                        <p><strong>TEER check.</strong> R<sub>cells</sub> = ${rCells} Ω, R<sub>blank</sub> = ${rBlank} Ω, membrane area A = ${area} cm². What's the TEER?</p>
                        <div class="adv-chips">${sh.map((o, i) => `<button type="button" class="adv-chip" data-tq="${i}">${o.v} Ω·cm²</button>`).join("")}</div>
                        <p class="adv-result" id="tqRes"></p>
                    </div>
                    <div id="pgDrug"></div>`;
                let done = false;
                api.modalBody().querySelectorAll("[data-tq]").forEach((b) => b.addEventListener("click", () => {
                    if (done) {
                        return;
                    }
                    done = true;
                    b.classList.add("on");
                    const o = sh[Number(b.dataset.tq)];
                    ui.result("tqRes", `${o.ok ? "✓" : "✗"} TEER = (${rCells} − ${rBlank}) × ${area} = <strong>${teer} Ω·cm²</strong>. ${teer > 800 ? "A tight, brain-like barrier." : teer > 200 ? "A fair barrier, but leakier than the brain." : "Very leaky: drug results from this chip can't be trusted."}`, o.ok);
                    drugTest(m, p, c, leaky, [
                        { id: "ab", label: "Drug A: an antibody (large protein)", papp: 0.05 },
                        { id: "small", label: "Drug B: a small, fat-soluble molecule", papp: 6 },
                        { id: "pgp", label: "Drug C: small, but pumped back out by P-gp", papp: 0.6 }
                    ], "small", "Brain-side concentration", "Drug B crosses best. Small, fat-soluble molecules slip through cell membranes. Antibodies are huge (well under 1% crosses), and P-gp pumps on the endothelial cells throw Drug C right back into the blood.");
                }));
                return;
            }
            const cfg = {
                lung: {
                    drugs: [
                        { id: "none", label: "No drug", papp: 5 },
                        { id: "l", label: "Drug L: tightens the blood-vessel lining", papp: 1 },
                        { id: "mm", label: "Drug M: a cough suppressant", papp: 4.8 }
                    ],
                    best: "l", y: "Fluid leaked into the air sacs", why: "Drug L tightens the vessel lining, so far less fluid leaks into the air sacs and oxygen can get through. Studies with real lung chips found drugs like this for this kind of leak."
                },
                kidney: {
                    drugs: [
                        { id: "gent", label: "Gentamicin", papp: 5 },
                        { id: "k", label: "Antibiotic K", papp: 0.8 },
                        { id: "none", label: "No antibiotic", papp: 0.5 }
                    ],
                    best: "k", y: "Kidney injury marker (KIM-1)", why: "Antibiotic K barely raises the kidney-injury marker. Gentamicin is known to damage the kidney's tubule cells. Skipping the antibiotic isn't an option with an infection."
                },
                liver: {
                    drugs: [
                        { id: "low", label: "Acetaminophen, 1 g a day", papp: 0.7 },
                        { id: "mid", label: "Acetaminophen, 2 g a day", papp: 1.5 },
                        { id: "high", label: "Acetaminophen, 4 g a day", papp: 5.5 }
                    ],
                    best: "mid", y: "Liver damage marker (ALT release)", why: "Up to 2 g a day the liver cells keep working. At 4 g their damage marker shoots up. Doctors use results like this, with the patient's own care plan, to pick the highest safe dose."
                }
            }[p.organ];
            $("pgTest").innerHTML = `<div class="adv-takeaway">${intro}</div><div id="pgDrug"></div>`;
            drugTest(m, p, c, leaky, cfg.drugs, cfg.best, cfg.y, cfg.why);
        }

        function drugTest(m, p, c, leaky, drugs, best, yLabel, why) {
            $("pgDrug").innerHTML = `<div class="adv-button-row"><button type="button" class="adv-btn" id="dgRun">Run the ${p.organ === "brain" ? "drug crossing" : "drug"} test</button></div>`;
            $("dgRun").addEventListener("click", () => {
                $("dgRun").disabled = true;
                const vals = drugs.map((d) => (leaky ? 3 + noise(1) : d.papp + noise(d.papp * 0.08)));
                const maxV = Math.max(...vals) * 1.15;
                ui.animate(m, 6000, (k) => {
                    bg(c);
                    label(c, yLabel, 20, 20, "#f5f7ff", "left", true);
                    vals.forEach((v, i) => {
                        const x = 50 + i * 130;
                        const hgt = 150 * (v / maxV) * k;
                        rect(c, x, 200 - hgt, 80, hgt, ["#54e0c7", "#ffd84a", "#ff8a5c"][i]);
                        c.fillStyle = "#a9b2d0";
                        c.font = "10px sans-serif";
                        c.textAlign = "center";
                        const words = drugs[i].label.split(":")[0];
                        c.fillText(words, x + 40, 216);
                    });
                }, () => {
                    $("pgDrug").innerHTML += `
                        <div class="adv-takeaway">
                            <p><strong>${p.organ === "brain" ? "Which drug reaches Elena's tumor best?" : p.organ === "lung" ? "Which treatment works best for Mr. Haddad?" : p.organ === "kidney" ? "Which antibiotic should Mrs. Nakamura get?" : "What's the highest safe dose for Mr. Adeyemi?"}</strong></p>
                            <div class="adv-chips">${drugs.map((d) => `<button type="button" class="adv-chip" data-dq="${d.id}">${d.label}</button>`).join("")}</div>
                            <p class="adv-result" id="dqRes"></p>
                        </div>`;
                    let answered = false;
                    api.modalBody().querySelectorAll("[data-dq]").forEach((b) => b.addEventListener("click", () => {
                        if (answered) {
                            return;
                        }
                        answered = true;
                        b.classList.add("on");
                        const ok = b.dataset.dq === best;
                        ui.result("dqRes", leaky
                            ? "⚠️ The bars all look alike: this chip's barrier is so leaky that everything gets through, so it can't tell the treatments apart. Check the defects in the report. " + why
                            : `${ok ? "✓" : "✗"} ${why}`, ok && !leaky);
                        ps().helped[p.id] = true;
                        api.writeSave();
                        const left = PATIENTS.filter((x) => !ps().helped[x.id]).length;
                        const box = document.createElement("div");
                        box.innerHTML = `
                            <div class="adv-takeaway"><p>${p.name}: "${p.thanks}"</p><p>${left ? `${left} patient${left === 1 ? "" : "s"} still waiting.` : "That's every patient!"}</p></div>
                            <div class="adv-button-row"><button type="button" class="adv-btn" id="pgNext">${left ? "Back to the lab" : "See the report"}</button></div>`;
                        $("pgDrug").appendChild(box);
                        $("pgNext").addEventListener("click", () => (left ? api.closeModal() : finishBatch()));
                        $("pgNext").focus();
                    }));
                });
            });
        }

        function finishBatch() {
            const s = ps();
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
            api.awardSiteXP("pdmsbatch", 200);
            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">CHIP REPORT</p>
                    <h2>🧫 Organ-on-a-Chip Batch</h2>
                    <p class="adv-stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
                    ${xp ? `<p class="adv-xp-big">+${xp} XP</p>` : ""}
                    <ul class="adv-stats" style="justify-content:center">
                        <li>Channel height <strong>${model().h} µm</strong></li>
                        <li>Patients helped <strong>4 / 4</strong></li>
                    </ul>
                    <div class="adv-takeaway">
                        ${defs.length ? defs.map((d) => `<p>${d.sev === "major" ? "⚠️" : "•"} ${d.cause}</p>`).join("") : "<p>Flawless chips, from master to patient!</p>"}
                    </div>
                    <p class="adv-calib">🫧 <strong>${s.boss ? "Rematch!" : "Boss unlocked!"}</strong> Something is bubbling out of the giant chip sculpture in the plaza…</p>
                    <button type="button" class="adv-btn" data-close>Back to the lab</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
            api.afterModal(() => api.say([
                "Every patient's chip is running, and their doctors have answers!",
                "But… the giant chip sculpture in the plaza is foaming over. It's The Bubble Beast, the curse of every microfluidics lab! Go!"
            ], "Dr. Silox"));
        }


        /* ---------- Boss: The Bubble Beast ---------- */

        function drawBeast(c, ox, oy, s, t) {
            const px = (x, y, w, h, col) => rect(c, ox + x * s, oy + y * s, w * s, h * s, col);
            const bob = Math.sin(t / 380) * 1.5;
            px(4, 30, 24, 2, "rgba(0,0,0,0.25)");
            const bubbles = [[16, 16, 11], [7, 22, 6], [25, 21, 6], [10, 8, 4], [23, 9, 4], [16, 3, 3]];
            bubbles.forEach(([x, y, r], i) => {
                const w = Math.sin(t / 300 + i) * 0.6;
                c.fillStyle = "rgba(127, 200, 255, 0.35)";
                c.strokeStyle = "#7fb2ff";
                c.lineWidth = 1.2 * s;
                c.beginPath();
                c.arc(ox + x * s, oy + (y + bob) * s, (r + w) * s, 0, Math.PI * 2);
                c.fill();
                c.stroke();
                c.fillStyle = "rgba(255,255,255,0.8)";
                c.beginPath();
                c.arc(ox + (x - r * 0.4) * s, oy + (y + bob - r * 0.4) * s, r * 0.25 * s, 0, Math.PI * 2);
                c.fill();
            });
            px(11, 14 + bob, 3, 3, "#1a2033");
            px(18, 14 + bob, 3, 3, "#1a2033");
            px(12, 15 + bob, 1, 1, "#ffffff");
            px(19, 15 + bob, 1, 1, "#ffffff");
            px(13, 21 + bob, 6, 2, "#1a2033");
        }

        const BEAST_QS = {
            litho: [
                { q: "What's the usual Sylgard 184 PDMS mix ratio?", a: ["10 parts base to 1 part curing agent", "1 to 1", "100 to 1", "1 part base to 10 parts curing agent"], why: "More curing agent makes it stiffer; less leaves it soft and tacky." },
                { q: "Why degas PDMS before curing?", a: ["To pull out air bubbles that would leave holes and voids", "To cool it down", "To make it blue", "To add oxygen for the cells"], why: "Vacuum makes bubbles swell, rise and pop." },
                { q: "Why silanize the SU-8 master?", a: ["So the cured PDMS peels off without sticking or tearing", "To make the ridges taller", "To sterilize it", "To make it conduct"], why: "Silane leaves a non-stick layer one molecule thick." },
                { q: "What sets the height of a PDMS chip's channels?", a: ["The height of the SU-8 ridges on the master", "The cure temperature", "The punch size", "The plasma time"], why: "The PDMS copies the master exactly, ridge for channel." }
            ],
            bond: [
                { q: "What does oxygen plasma do to PDMS before bonding?", a: ["Activates the surface so it bonds permanently", "Melts it", "Colors it", "Makes it stiffer"], why: "It swaps surface methyl groups for reactive silanol groups." },
                { q: "Why press the layers together right after plasma?", a: ["The surface recovers within minutes and stops bonding", "Plasma is radioactive", "The PDMS shrinks", "To save electricity"], why: "PDMS 'recovers' its non-stick surface over time." },
                { q: "Why is PDMS popular for organ chips?", a: ["It's clear, flexible and lets oxygen through to the cells", "It's the cheapest metal", "It conducts electricity", "It dissolves in water"], why: "You can watch the cells under a microscope while they breathe." },
                { q: "What's PDMS's main drawback for drug testing?", a: ["It can absorb small, fat-soluble drugs", "It's opaque", "It's magnetic", "It's too stiff"], why: "Some drugs soak into the PDMS, lowering their dose. Plastics like COC avoid this." }
            ],
            flow: [
                { q: "Shear stress in a wide, shallow channel is…", a: ["τ = 6μQ ÷ (w h²)", "τ = Q × h", "τ = w ÷ Q", "τ = μ + Q"], why: "Viscosity μ, flow Q, width w, height h." },
                { q: "Halve the channel height at the same flow. The shear becomes…", a: ["Four times higher", "Half as much", "The same", "Twice as high"], why: "Height is squared in the formula." },
                { q: "Why do brain endothelial cells need flow?", a: ["Shear stress lines them up and tightens their junctions", "Flow keeps them warm", "To wash away the membrane", "They don't"], why: "Shear is a signal, not just a push." },
                { q: "About what shear is used for brain capillaries on a chip?", a: ["About 1 to 2 Pa", "About 1000 Pa", "Zero", "About 0.0001 Pa"], why: "That's roughly what blood exerts in small brain vessels." }
            ],
            barrier: [
                { q: "How is TEER calculated?", a: ["(R cells − R blank) × membrane area", "R cells + R blank", "R cells ÷ area", "Voltage × current"], why: "Multiplying by area makes results comparable across chips." },
                { q: "What does a higher TEER mean?", a: ["Tighter junctions and a better barrier", "More bubbles", "Dead cells", "A bigger chip"], why: "Ions have a harder time slipping between the cells." },
                { q: "Roughly how much of an antibody crosses the blood-brain barrier?", a: ["Under 1%", "About half", "All of it", "Exactly 10%"], why: "Large molecules are almost completely shut out." },
                { q: "What is P-gp?", a: ["A pump that throws drugs back out of the barrier cells", "A type of PDMS", "A glue", "A neurotransmitter"], why: "Efflux pumps are why some small drugs still can't reach the brain." }
            ]
        };

        function beastBattle() {
            const rematch = ps().boss;
            return {
                foeName: "The Bubble Beast",
                foeTag: "Microfluidic menace · Lv 23",
                foeSize: 32,
                fieldClass: "adv-field-pdms",
                drawFoe: (c, t) => drawBeast(c, 0, 0, 1, t),
                foeMax: 270,
                foePower: 0.97,
                meMax: 140,
                moves: [
                    { type: "litho", name: "Degas", mult: 1.75, label: "Soft lithography", icon: "🫙", special: "dep", cls: "dep", effect: "Direct hit! The vacuum pops its bubbles one after another." },
                    { type: "bond", name: "Plasma Bond", mult: 1.5, label: "Bonding", icon: "⚡", special: "etch", cls: "etch", effect: "It's effective! A sealed chip leaves it nowhere to sneak in." },
                    { type: "flow", name: "Shear Flow", mult: 1, label: "Microfluidics", icon: "🌊", special: "litho", cls: "litho", effect: "A strong, steady flow flushes bubbles downstream." },
                    { type: "barrier", name: "TEER Probe", mult: 0.5, focus: true, label: "Barriers", icon: "🔌", special: "inspect", cls: "inspect", effect: "You measured exactly where it's leaking. Your next hit does 1.5× damage!" }
                ],
                questions: BEAST_QS,
                attacks: [
                    { name: "Bubble Block", text: "A bubble lodged in the channel and stopped the flow!" },
                    { name: "Leak", text: "Fluid seeped out between the layers!" },
                    { name: "Drug Soak", text: "The PDMS soaked up your test drug!" }
                ],
                intro: [
                    "The chip sculpture foams over… It's <strong>The Bubble Beast</strong>!",
                    "Bubbles block channels, kill cells and ruin experiments. Answer organ-chip questions to pop it!"
                ],
                runText: "You backed off. The Bubble Beast keeps foaming…",
                loseTitle: "The Bubble Beast clogged your chip",
                loseTip: "Tip: The Bubble Beast is weak to <strong>Degas</strong> and <strong>Plasma Bond</strong>. <strong>TEER Probe</strong> first makes your next hit 1.5× stronger.",
                winLines: rematch ? ["The Bubble Beast pops again!", "Clear channels. Rematch won!"] : ["The Bubble Beast pops into a fine mist!", "📜 Dr. Silox hands you the PDMS City Certificate of Completion!"],
                onWin: () => {
                    const s = ps();
                    const first = !s.boss;
                    s.boss = true;
                    s.bossUp = false;
                    api.save().badges.pdms = true;
                    api.writeSave();
                    api.updateHud();
                    api.gainXP(first ? 150 : 25);
                    if (first) {
                        api.awardSiteXP("pdmsboss", 150);
                    }
                    api.afterModal(() => api.say(first ? [
                        "Pop! The channels are clear and every patient's chip is flowing.",
                        "Organ chips can't replace a doctor, but built from a patient's own cells they can show which treatment fits that person. Here's your PDMS City Certificate of Completion!",
                        "One more thing: Ampfield, down the road east, has run out of power. Dr. Charge could use an engineer like you."
                    ] : ["Bubbles cleared again! Mold another batch and it'll be back."], "Dr. Silox"));
                    return `
                        <div class="adv-complete">
                            <p class="eyebrow">CHANNELS CLEAR</p>
                            <h2>${first ? "📜 Certificate of Completion" : "🫧 Rematch Won"}</h2>${first ? api.certificate("pdms") : ""}
                            <p class="adv-xp-big">+${first ? 150 : 25} XP</p>
                            <div class="adv-takeaway">
                                <p>Bubbles are the classic microfluidics problem: one bubble can block a channel, starve cells or tear them off with its surface tension.</p>
                                <p>Labs fight them by degassing PDMS and media, priming channels carefully, and adding bubble traps to their chips.</p>
                            </div>
                            <button type="button" class="adv-btn" data-close>Back to the plaza</button>
                        </div>`;
                }
            };
        }


        /* ---------- Recipe card ---------- */

        function openRecipe() {
            const s = ps();
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
                ${api.head("pdms", "Dr. Silox's Recipe")}
                <p class="adv-lead">Two-channel organ-on-a-chip devices molded in PDMS, then built into each patient's organ with their own cells. Each station shows Dr. Silox's card.${s.best ? ` Best batch: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}` : ""}</p>
                <div class="adv-button-row" style="margin-bottom:8px"><button type="button" class="adv-btn secondary" data-close>Close</button></div>
                ${html}`);
        }

        api.registerRecipe({
            id: "pdms",
            scenes: ["pdms", "softlitho", "organlab"],
            available: () => ps().recipe,
            open: openRecipe,
            label: "Dr. Silox's organ chips (9 steps)",
            progress: () => ps().step,
            total: STEPS.length,
            restart: resetRun
        });


        /* ---------- Tools ---------- */

        const TOOLS = {
            master: { name: "SU-8 Master Bench", open: openMaster },
            silane: { name: "Silane Desiccator", open: openSilane },
            mix: { name: "PDMS Mixer", open: openMix },
            degas: { name: "Vacuum Degasser", open: openDegas },
            oven: { name: "Cure Oven", open: openOven },
            punch: { name: "Peel & Punch Bench", open: openPunch },
            plasma: { name: "Plasma Bonder", open: openPlasma },
            coat: { name: "Coating Station", open: openCoat }
        };

        // Materials each step takes from the bag (once per run).
        const USES = { master: [["wafer", 1], ["su8", 1]], mix: [["pdmskit", 1]] };

        function useTool(tool) {
            const s = ps();
            if (!s.recipe) {
                api.say([`The ${TOOLS[tool].name}.`, "Dr. Silox runs the Soft Litho Lab. Talk to Dr. Silox for the recipe."]);
                return;
            }
            const st = STEPS[s.step];
            if (!st) {
                api.say([`The ${TOOLS[tool].name}.`, "This batch is done. Talk to Dr. Silox to mold another."]);
                return;
            }
            if (st.tool !== tool) {
                api.say([`The ${TOOLS[tool].name}.`, `Your recipe says the next step is: ${st.name}.`, st.tool === "patients" ? "That happens at the Organ Lab. Press R to read the recipe." : `That happens at the ${st.where}. Press R to read the recipe.`]);
                return;
            }
            if (!api.bag.pay(ps(), st.id, USES[st.id])) {
                return;
            }
            TOOLS[tool].open();
        }


        /* ---------- Drawing ---------- */

        function tool(id, label2, x, y, w, h, draw) {
            return {
                kind: "pd-" + id,
                x: x, y: y, w: w, h: h,
                label: label2,
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
            master(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 6, Y + 6, W - 12, 4, "#9aa6bb");
                rect(c, X + 12, Y + 3, 6, 3, "#b7c96a");
                rect(c, X + 28, Y + 3, 6, 3, "#b7c96a");
            },
            silane(c, X, Y, W, H) {
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 12, W / 2 - 3, 13, 0, Math.PI, 0);
                c.fill();
                c.fillStyle = "rgba(220, 235, 255, 0.6)";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 12, W / 2 - 4, 12, 0, Math.PI, 0);
                c.fill();
                api.box(X + 2, Y + 12, W - 4, H - 13, "#8f98aa");
            },
            mix(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                rect(c, X + 16, Y + 2, 14, 10, "#d9e2f0");
                rect(c, X + 22 + Math.sin(t / 150) * 3, Y - 6, 2, 12, "#5d6577");
            },
            degas(c, X, Y, W, H, t) {
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 14, W / 2 - 2, 14, 0, Math.PI, 0);
                c.fill();
                c.fillStyle = "rgba(220, 235, 255, 0.55)";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 14, W / 2 - 3, 13, 0, Math.PI, 0);
                c.fill();
                const k = (t / 600) % 1;
                c.strokeStyle = "rgba(90, 110, 140, 0.9)";
                c.beginPath();
                c.arc(X + W / 2, Y + 12 - k * 8, 2, 0, Math.PI * 2);
                c.stroke();
                api.box(X + 2, Y + 14, W - 4, H - 15, "#5d6577");
            },
            oven(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#aab3c4");
                rect(c, X + 6, Y + 4, W - 12, 8, "rgba(255, 170, 90, 0.5)");
            },
            punch(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 8, Y + 5, 20, 7, "rgba(200, 230, 240, 0.8)");
                rect(c, X + 34, Y - 4, 3, 12, "#5d6577");
            },
            plasma(c, X, Y, W, H, t) {
                api.box(X + 2, Y, W - 4, H, "#aab3c4");
                rect(c, X + 8, Y + 3, W - 16, 9, "#1a2033");
                rect(c, X + 9, Y + 4, W - 18, 7, `rgba(180, 140, 255, ${0.5 + 0.3 * Math.sin(t / 200)})`);
            },
            coat(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                rect(c, X + 6, Y + 5, 10, 7, "#ffd1dc");
                rect(c, X + 22, Y + 6, 18, 5, "rgba(200, 230, 240, 0.8)");
            }
        };

        function drawChipSculpture(c, X, Y, W, H, t) {
            api.box(X + 2, Y + 6, W - 4, H - 10, "rgba(220, 240, 250, 0.85)");
            // red and blue channels with the membrane between them
            rect(c, X + 8, Y + 12, W - 16, 4, "#ff6b7d");
            rect(c, X + 8, Y + 17, W - 16, 1, "#f5f7ff");
            rect(c, X + 8, Y + 19, W - 16, 4, "#7fb2ff");
            for (let i = 0; i < 4; i++) {
                const x = X + 8 + ((t / 15 + i * 16) % (W - 16));
                rect(c, x, Y + 13, 3, 2, "#ffd1dc");
                rect(c, x, Y + 20, 3, 2, "#d9ecff");
            }
            rect(c, X + 4, Y + 12, 4, 4, "#5d6577");
            rect(c, X + W - 8, Y + 19, 4, 4, "#5d6577");
        }

        function drawOrgan(c, X, Y, t, kind) {
            const bob = Math.round(Math.sin(t / 320 + X) * 1);
            const cx = X + 8;
            const cy = Y + 8 + bob;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.22)");
            c.fillStyle = "#1a2033";
            if (kind === "lung") {
                c.beginPath();
                c.ellipse(cx - 3, cy, 4.5, 6.5, 0, 0, Math.PI * 2);
                c.ellipse(cx + 3, cy, 4.5, 6.5, 0, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = "#ff9ab0";
                c.beginPath();
                c.ellipse(cx - 3, cy, 3.5, 5.5, 0, 0, Math.PI * 2);
                c.ellipse(cx + 3, cy, 3.5, 5.5, 0, 0, Math.PI * 2);
                c.fill();
            } else if (kind === "kidney") {
                c.beginPath();
                c.ellipse(cx, cy, 5.5, 7, 0, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = "#c94a6d";
                c.beginPath();
                c.ellipse(cx, cy, 4.5, 6, 0, 0, Math.PI * 2);
                c.fill();
                rect(c, cx + 2, cy - 1, 3, 3, "#1a2033");
            } else {
                c.beginPath();
                c.ellipse(cx, cy, 7.5, 5, 0, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = "#a8552f";
                c.beginPath();
                c.ellipse(cx, cy, 6.5, 4, 0, 0, Math.PI * 2);
                c.fill();
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
            rect(c, X, Y, TILE, TILE, "#cfeef0");
            rect(c, X, Y, TILE, 1, "#b4e0e3");
            rect(c, X, Y, 1, TILE, "#b4e0e3");
            if ((x * 7 + y * 3) % 5 === 0) {
                c.strokeStyle = "rgba(255,255,255,0.8)";
                c.lineWidth = 1;
                c.beginPath();
                c.arc(X + 8, Y + 8, 2.5, 0, Math.PI * 2);
                c.stroke();
            }
        }


        /* ---------- Scenes ---------- */

        api.SCENES.pdms = {
            id: "pdms",
            label: "PDMS City",
            outdoor: true,
            grid: [
                "TTTTTTTTTTTTTTTTTTTT",
                "T.f.....f........f.T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBDBB..BBBDBB..T",
                "T.....p.......p....T",
                "pppppppppppppppppppp",
                "T.......p..........T",
                "T.......p..........T",
                "T..hhhhhhhhhhhhh...T",
                "T..hhhhhhhhhhhhh...T",
                "T..hhhhhhhhhhhhh...T",
                "T.f..........f.....T",
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
                left: { scene: "neuro", x: 19, y: 7 },
                right: {
                    scene: "energy", x: 0, y: 7,
                    locked: () => !api.save().badges.pdms,
                    lockedText: ["The road east leads to Ampfield, where the trams have stopped running.", "A sign says: \"PDMS City Certificate holders only.\" Help the patients and beat The Bubble Beast first."]
                }
            },
            buildings: [
                { id: "softlitho", sign: "SOFT LITHO LAB", x: 2, y: 2, w: 7, h: 4, door: { x: 6, y: 5 }, wall: "#eaf7f8", roof: "#2ebfa5", locked: () => false },
                { id: "organlab", sign: "ORGAN LAB", x: 11, y: 2, w: 6, h: 4, door: { x: 14, y: 5 }, wall: "#fff2f4", roof: "#ff6b7d", locked: () => false }
            ],
            npcs: [
                {
                    id: "silox", name: "Dr. Silox", x: 8, y: 6, dir: "down",
                    look: { suit: "#eaf7f8", accent: "#2ebfa5", visor: "#7fb2ff" },
                    talk: siloxTalk
                },
                {
                    id: "lungy", name: "Lungy", x: 4, y: 11, dir: "down",
                    draw: (c, X, Y, t) => drawOrgan(c, X, Y, t, "lung"),
                    talk: () => ["Hi! I'm a lung. Inside me are about 300 million tiny air sacs, where oxygen crosses into the blood.", "The first lung-on-a-chip, from Harvard's Wyss Institute in 2010, even 'breathed' by stretching its membrane in and out!"]
                },
                {
                    id: "kidney", name: "Kidney Kid", x: 12, y: 12, dir: "down",
                    draw: (c, X, Y, t) => drawOrgan(c, X, Y, t, "kidney"),
                    talk: () => ["Hey! I'm a kidney. I filter your whole blood supply many times a day.", "My tubule cells pull back the good stuff, which is why some drugs that pass through me can hurt them."]
                },
                {
                    id: "livvy", name: "Livvy", x: 14, y: 10, dir: "down",
                    draw: (c, X, Y, t) => drawOrgan(c, X, Y, t, "liver"),
                    talk: () => ["Hello! I'm a liver. I break down most medicines so your body can get rid of them.", "Too much of some drugs, like acetaminophen, can overwhelm me. That's why drug safety tests often start with liver cells."]
                }
            ],
            objects: [
                api.bag.pickup({ id: "pdms-kit", item: "pdmskit", x: 17, y: 8, text: "A sealed box glints in the grass: a Sylgard 184 PDMS kit!" }),
                {
                    kind: "sculpture", x: 7, y: 10, w: 4, h: 2, draw: drawChipSculpture, prompt: "A: Look",
                    active: () => !ps().bossUp,
                    lines: ["A giant organ-on-a-chip sculpture: a red 'blood' channel on top, a blue 'tissue' channel below, and a thin porous membrane in between.", "Real ones are about the size of a USB stick."]
                },
                {
                    kind: "beast", x: 7, y: 10, w: 4, h: 2,
                    active: () => !!ps().bossUp,
                    draw: (c, X, Y, W, H, t) => {
                        drawChipSculpture(c, X, Y, W, H, t);
                        drawBeast(c, X + 16, Y - 14, 1, t);
                        const bob = Math.round(Math.sin(t / 250) * 2);
                        rect(c, X + 28, Y - 28 + bob, 9, 11, "#1a2033");
                        rect(c, X + 29, Y - 27 + bob, 7, 9, "#ffd84a");
                        c.fillStyle = "#1a2033";
                        c.font = "bold 8px sans-serif";
                        c.textAlign = "center";
                        c.textBaseline = "middle";
                        c.fillText("!", X + 32.5, Y - 22 + bob);
                    },
                    prompt: "A: Battle The Bubble Beast",
                    use: () => api.say(["The chip sculpture is foaming over with bubbles…", "Get ready to battle!"], "", () => api.openBattle(beastBattle()))
                }
            ]
        };

        api.SCENES.softlitho = {
            id: "softlitho",
            label: "Soft Litho Lab",
            grid: api.interiorRows(),
            floor: "#e3f2f2",
            tint: "rgba(255, 200, 40, 0.06)",
            exitTo: { scene: "pdms", x: 6, y: 6 },
            objects: [
                api.bag.stockroom({ label: "Soft Litho stockroom", items: ["pdmskit"], x: 15, y: 7 }),
                tool("master", "SU-8 master", 1, 2, 3, 1, D.master),
                tool("silane", "Silane", 5, 2, 2, 2, D.silane),
                tool("mix", "PDMS mixer", 8, 2, 3, 1, D.mix),
                tool("degas", "Degasser", 12, 2, 2, 2, D.degas),
                tool("oven", "Cure oven", 15, 2, 3, 1, D.oven),
                tool("punch", "Peel & punch", 1, 7, 3, 1, D.punch),
                tool("plasma", "Plasma bonder", 6, 7, 3, 1, D.plasma),
                tool("coat", "ECM coating", 11, 7, 3, 1, D.coat)
            ],
            npcs: [
                { id: "siloxlab", name: "Dr. Silox", x: 9, y: 10, dir: "down", look: { suit: "#eaf7f8", accent: "#2ebfa5", visor: "#7fb2ff" }, talk: siloxTalk }
            ]
        };

        api.SCENES.organlab = {
            id: "organlab",
            label: "Organ Lab",
            grid: api.interiorRows(),
            floor: "#f3f6fb",
            exitTo: { scene: "pdms", x: 14, y: 6 },
            objects: [
                { kind: "incubator", x: 2, y: 2, w: 3, h: 2, label: "Incubator", prompt: "A: Look", draw: (c, X, Y, W, H) => { api.box(X + 2, Y, W - 4, H, "#c9cfdb"); rect(c, X + 6, Y + 4, W - 12, H - 8, "#e3f6ff"); }, lines: ["A cell incubator at 37 °C with 5% CO₂: body conditions for the chips' cells."] },
                { kind: "pump", x: 7, y: 2, w: 3, h: 2, label: "Syringe pumps", prompt: "A: Look", draw: (c, X, Y, W) => { api.box(X + 2, Y + 4, W - 4, 20, "#3b4458"); rect(c, X + 6, Y + 8, W - 12, 4, "#f5f7ff"); }, lines: ["Syringe pumps push medium through the chips at precise flow rates, setting the shear stress on the cells."] },
                { kind: "scope", x: 12, y: 2, w: 3, h: 2, label: "Microscope", prompt: "A: Look", draw: (c, X, Y, W) => { api.box(X + 4, Y + 10, W - 8, 16, "#c9cfdb"); rect(c, X + W / 2 - 2, Y - 6, 4, 18, "#3b4458"); }, lines: ["PDMS is clear, so the cells can be watched under the microscope while they grow."] },
                { kind: "bench", x: 15, y: 8, w: 3, h: 1, prompt: "A: Look", draw: (c, X, Y, W, H) => { api.box(X, Y + 2, W, H - 2, "#b8c2d2"); }, lines: ["A bench with each patient's chip plugged into its own pump."] }
            ],
            npcs: PATIENTS.map((p) => ({
                id: p.id,
                name: p.name,
                x: p.x,
                y: p.y,
                dir: "down",
                draw: (c, X, Y, t) => {
                    api.drawPerson(c, X, Y - 2, p.look, "down", 0);
                    if (!ps().helped[p.id]) {
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
                id: "techora", name: "Dr. Ora", x: 9, y: 9, dir: "down",
                look: { suit: "#fff2f4", accent: "#ff6b7d", visor: "#54e0c7" },
                talk: () => {
                    const s = ps();
                    if (s.recipe && current() && current().id === "lab") {
                        return ["The chips from Dr. Silox are here! Talk to each patient with a ? to build and test their chip.", "Remember: their own cells, the right conditions for the organ, then the test."];
                    }
                    return ["I'm Dr. Ora. I grow organs-on-chips from patients' own stem cells to test treatments before they try them.", "First we need chips from the Soft Litho Lab next door."];
                }
            }])
        };

        function siloxTalk() {
            const s = ps();
            const name = api.currentChar() ? api.currentChar().name : "engineer";
            if (!s.recipe) {
                return {
                    lines: [
                        `${name}! I'm Dr. Silox, as in polydimethylsiloxane. Everyone calls it PDMS.`,
                        "Some patients here are in trouble: a brain tumor that drugs can't reach past the blood-brain barrier, lungs leaking fluid so oxygen can't get through, and failing kidneys and liver.",
                        "We can't put a chip in a patient. But we can grow a tiny copy of their organ on a chip, from their own cells, and test their treatment on it first.",
                        "Here's my recipe for the chips. Every station has my card with the settings.",
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
                    return ["The Bubble Beast is foaming out of the sculpture in the plaza! Go!"];
                }
                return {
                    lines: [`Your best batch: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}. Want to mold another?`, "I'll reset the bench for you."],
                    done: () => {
                        resetRun();
                        api.toast("Fresh batch: back to step 1");
                    }
                };
            }
            const st = STEPS[s.step];
            return [`Next step: ${st.name}.`, st.tool === "patients" ? "The patients are at the Organ Lab, across the path." : `It's at the ${st.where}. My card there has the settings.`];
        }

        // Split the lab into bays: these stations get their own building.
        api.addBay({
            outdoor: "pdms", from: "softlitho",
            id: "pdmsbond", sign: "BONDING", label: "PDMS City · Bonding Bay",
            kinds: ["pd-punch", "pd-plasma", "pd-coat"],
            x: 16, y: 9, w: 3, h: 2, door: { x: 17, y: 10 },
            wall: "#eaf7f8", roof: "#2ebfa5",
            currentKind: () => {
                const st = STEPS[ps().step];
                return ps().recipe && st ? "pd-" + st.tool : null;
            }
        });


        // Microscopes: the master mold, then the bonded organ chip.
        function pdView(n) {
            const id = STEPS[n - 1].id;
            const CAP = {
                master: "The master mold: SU-8 ridges 100 µm tall on a silicon wafer. Each ridge will become a channel.",
                silane: "A one-molecule-thick silane layer (yellow) keeps the PDMS from sticking to the master.",
                mix: "Sylgard 184 mixed 10:1 base to curing agent. Stirring folded in lots of air bubbles.",
                degas: "Under vacuum the bubbles swelled, rose and popped. The PDMS is clear now.",
                cure: "PDMS poured over the master and cured. It fills every gap around the ridges.",
                punch: "Peeled off and flipped: the ridges left channels in the PDMS. A 1.5 mm hole punched down to the channel is the inlet.",
                plasma: "Plasma-bonded: top channel, porous membrane, bottom channel. Cells on either side can signal through the pores.",
                coat: "Collagen IV and fibronectin (pink) coat the channel so cells can grip it.",
                lab: "The finished organ chip, with cells growing on the membrane."
            };
            if (id === "mix" || id === "degas") {
                const bubbles = id === "mix" ? 70 : 3;
                return {
                    scale: "×5 side view of the cup",
                    caption: CAP[id],
                    draw: (c, W, H) => {
                        c.fillStyle = "rgba(200,235,245,0.35)";
                        c.fillRect(W / 2 - 120, 40, 240, H - 80);
                        c.strokeStyle = "rgba(220,235,255,0.8)";
                        c.lineWidth = 3;
                        c.strokeRect(W / 2 - 120, 30, 240, H - 70);
                        for (let i = 0; i < bubbles; i++) {
                            const r = Math.sin(i * 12.9898) * 43758.5453;
                            const f = r - Math.floor(r);
                            const g = Math.sin(i * 78.233) * 43758.5453;
                            const f2 = g - Math.floor(g);
                            c.strokeStyle = "rgba(255,255,255,0.8)";
                            c.lineWidth = 1.5;
                            c.beginPath();
                            c.arc(W / 2 - 110 + f * 220, 50 + f2 * (H - 110), 2 + f * 5, 0, Math.PI * 2);
                            c.stroke();
                        }
                    }
                };
            }
            const ch = [[0.36, 0.64]];
            const off = [[0, 0.36], [0.64, 1]];
            const air = "#0f1626";
            if (n <= 5) {
                const layers = [
                    { name: "Silicon wafer", color: "#6f7890", h: 50 },
                    { name: "SU-8 ridge", color: "#7fbf68", h: 50, seg: ch }
                ];
                if (n >= 2) {
                    layers.push({ name: "Silane (non-stick)", color: "#ffe066", h: 2 });
                }
                if (n >= 5) {
                    layers.push({ name: "Cured PDMS", color: "#bfe3ee", h: 40, seg: ch });
                    layers.push({ name: "Cured PDMS", color: "#bfe3ee", h: 90, seg: off });
                }
                return { layers: layers, caption: CAP[id] };
            }
            if (id === "punch") {
                return {
                    caption: CAP[id],
                    layers: [
                        { color: air, h: 50, seg: ch },
                        { name: "PDMS", color: "#bfe3ee", h: 50, seg: off },
                        { name: "PDMS", color: "#bfe3ee", h: 60, seg: [[0, 0.46], [0.54, 1]] }
                    ]
                };
            }
            // pores and membrane share one height so the layers above stay level
            const membrane = [];
            const pores = [];
            for (let i = 0; i < 1; i += 0.04) {
                membrane.push([i, i + 0.03]);
                pores.push([i + 0.03, i + 0.04]);
            }
            const layers = [
                { name: "PDMS", color: "#bfe3ee", h: 26 },
                { color: air, h: 36, seg: ch },
                { name: "PDMS", color: "#bfe3ee", h: 36, seg: off },
                { name: "Porous membrane (0.4 µm pores)", color: "#f4f4f4", h: 4, seg: membrane },
                { color: air, h: 4, seg: pores }
            ];
            const coat = n >= 8;
            const cells = n >= 9;
            if (coat) {
                layers.push({ name: "Collagen IV + fibronectin", color: "#f39cc0", h: 3, seg: ch });
            }
            if (cells) {
                layers.push({ name: "Cells", color: "#ff7d6b", h: 8, seg: ch });
            }
            layers.push({ color: air, h: 36 - (coat ? 3 : 0) - (cells ? 8 : 0), seg: ch });
            layers.push({ name: "PDMS", color: "#bfe3ee", h: 36, seg: off });
            layers.push({ name: "PDMS", color: "#bfe3ee", h: 40, seg: [[0, 0.46], [0.54, 1]] });
            return { layers: layers, caption: CAP[id] };
        }

        api.addScope({
            type: "pdms", title: "Dr. Silox's Microscope",
            places: [["softlitho", 17, 1], ["pdmsbond", 17, 1]],
            steps: STEPS, state: ps, view: pdView
        });

    });

})();
