/* ========================================
   FAB VALLEY ADVENTURE: METAL CITY
   North of Fab Valley. Dr. MOS is building
   a new computer and wants it to do the
   most work per watt. The player builds an
   n-channel MOSFET in the MOS Fab: RCA
   clean, dry gate oxide, LPCVD poly gate,
   gate lithography, plasma etch with an
   endpoint, self-aligned source/drain
   implant, RTA, aluminum contacts with a
   forming-gas sinter. In Dr. MOS's lab the
   transistor is probed (Id–Vg, Vth) and the
   computer's supply voltage is tuned for
   the best speed per watt.
   Boss: The Leakage Phantom.

   Facts follow the Sand to Chip course
   (units 7 oxide, 23 wells, 24 build a
   transistor, 26 contacts) and the FET
   course (unit 5, Vth 0.3–1 V). The oxide
   growth rate, the speed and power model
   and the benchmark target are teaching
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

        api.TYPES.metal = { label: "MOSFETs", icon: "🔩" };


        /* ---------- Recipe ---------- */

        const PHASES = {
            front: "Front end: the gate",
            dope: "Source, drain and metal",
            lab: "Dr. MOS's computer"
        };

        const STEPS = [
            {
                id: "clean", phase: "front", tool: "wet", short: "RCA clean", where: "wet bench in the MOS Fab",
                name: "RCA clean a p-type wafer",
                card: ["Start from a <strong>p-type</strong> wafer: the channel of an n-channel MOSFET forms in p-type silicon.",
                    "Clean: <strong>SC-1</strong> (particles and organics), <strong>HF dip</strong> (native oxide), <strong>SC-2</strong> (metal ions), then a DI water rinse.",
                    "The gate oxide will be only nanometers thick, so the surface must be spotless."]
            },
            {
                id: "oxide", phase: "front", tool: "furnace", short: "Gate oxide", where: "oxidation furnace in the MOS Fab",
                name: "Grow a 10 nm gate oxide in dry O₂ at 1000 °C for about 10 minutes",
                card: ["Use <strong>dry O₂</strong>: slower than steam, but the densest, cleanest oxide. That's why it's used for gates.",
                    "Target: about <strong>10 nm</strong>. In this furnace, <strong>1000 °C for ~10 min</strong> gets there (growth slows as the oxide thickens: twice as thick takes about four times as long).",
                    "Too thin and electrons tunnel straight through. Too thick and the gate loses its grip on the channel."]
            },
            {
                id: "poly", phase: "front", tool: "lpcvd", short: "Poly gate", where: "LPCVD furnace in the MOS Fab",
                name: "Deposit the polysilicon gate: silane (SiH₄) at about 620 °C",
                card: ["LPCVD (low-pressure chemical vapor deposition): <strong>silane gas, SiH₄</strong>, breaks apart on the hot wafer and leaves silicon behind.",
                    "At about <strong>620 °C</strong> it forms polysilicon: tiny silicon crystals. This becomes the gate electrode."]
            },
            {
                id: "litho", phase: "front", tool: "aligner", short: "Gate litho", where: "mask aligner in the MOS Fab",
                name: "Pattern the gate: spin S1813 resist and expose a 1 µm gate line",
                card: ["The gate length L is the distance current travels under the gate. Shorter gates switch faster.",
                    "This contact aligner can print lines down to about <strong>1 µm</strong>. Below that the light blurs and the line breaks up.",
                    "Pick the shortest gate length the tool can reliably print."]
            },
            {
                id: "etch", phase: "front", tool: "etcher", short: "Gate etch", where: "plasma etcher in the MOS Fab",
                name: "Plasma-etch the poly, stop at the endpoint, then over-etch about 20%",
                card: ["A chlorine plasma etches polysilicon fast and SiO₂ very slowly.",
                    "Watch the <strong>endpoint signal</strong>: when the poly is gone, the plasma's glow changes.",
                    "Add a short <strong>over-etch of about 20%</strong> to clear leftovers. Much more eats through the thin gate oxide."]
            },
            {
                id: "implant", phase: "dope", tool: "implanter", short: "Source/drain implant", where: "ion implanter in the Implant & Metal Bay",
                name: "Implant phosphorus for the source and drain (about 5×10¹⁵ ions/cm²)",
                card: ["Use an <strong>n-type</strong> dopant (phosphorus) to make n⁺ source and drain in the p-type wafer.",
                    "The gate itself blocks the ions, so the source and drain line up with its edges automatically: <strong>self-aligned</strong>, no extra mask.",
                    "Dose: about <strong>5×10¹⁵ ions/cm²</strong> for low-resistance n⁺ regions."]
            },
            {
                id: "anneal", phase: "dope", tool: "rta", short: "Anneal", where: "RTA in the Implant & Metal Bay",
                name: "Activate the implant with a rapid thermal anneal: 1000 °C for 10 s",
                card: ["Implanted atoms sit in the wrong places and the crystal is damaged. A quick, hot anneal moves them into the lattice so they can give up electrons.",
                    "<strong>1000 °C for about 10 seconds</strong>. Too long and they diffuse sideways under the gate."]
            },
            {
                id: "metal", phase: "dope", tool: "sputter", short: "Metal contacts", where: "sputter tool in the Implant & Metal Bay",
                name: "Sputter aluminum contacts, then sinter in forming gas at 425 °C",
                card: ["This is Metal City's specialty: <strong>aluminum</strong> wires to the source, drain and gate.",
                    "Gold and copper are great conductors, but both diffuse into silicon and leave traps that leak current (copper needs a barrier layer first).",
                    "Sinter in <strong>forming gas (H₂/N₂) at about 425 °C</strong> for 30 min: it makes a good contact and the hydrogen heals defects at the oxide. Above about 500 °C aluminum spikes into the silicon."]
            },
            {
                id: "test", phase: "lab", tool: "probe", short: "Probe test", where: "probe station in Dr. MOS's lab",
                name: "Probe the transistor: sweep the gate voltage and find the threshold voltage",
                card: ["Hold the drain at a small voltage, sweep the gate, and record the drain current I<sub>D</sub>.",
                    "Below the <strong>threshold voltage V<sub>th</sub></strong> the transistor is off. Above it a channel forms and current flows.",
                    "A good logic NMOS has V<sub>th</sub> around <strong>0.3–1 V</strong> and almost no current when off."]
            },
            {
                id: "computer", phase: "lab", tool: "computer", short: "Tune the computer", where: "computer in Dr. MOS's lab",
                name: "Build Dr. MOS's computer and set its supply voltage for the most work per watt",
                card: ["Switching power grows with <strong>V<sub>DD</sub>²</strong>, so a lower supply voltage saves a lot of energy.",
                    "But the transistors slow down as V<sub>DD</sub> gets close to V<sub>th</sub>.",
                    "The sweet spot: the <strong>lowest V<sub>DD</sub> that still meets the speed target</strong>."]
            }
        ];

        // Materials each step takes from the bag (once per run).
        const USES = {
            clean: [["wafer", 1], ["rca", 1]],
            poly: [["silane", 1]],
            litho: [["s1813", 1]],
            implant: [["dopant", 1]],
            metal: [["altarget", 1]]
        };

        function ms() {
            const s = api.save();
            if (!s.metal) {
                s.metal = { recipe: false, step: 0, defects: {}, data: {}, stepXp: {}, runs: 0, best: 0, boss: false, bossUp: false };
            }
            return s.metal;
        }

        function current() {
            return STEPS[ms().step];
        }

        function isCurrentTool(tool) {
            const s = ms();
            return s.recipe && STEPS[s.step] && STEPS[s.step].tool === tool;
        }

        function defect(sev, cause) {
            return { sev: sev, cause: cause };
        }

        function allDefects() {
            const s = ms();
            return STEPS.reduce((l, st) => l.concat(s.defects[st.id] || []), []);
        }

        function cardHtml(st) {
            st = st || current();
            return st && st.card
                ? `<div class="adv-card"><p class="adv-card-title">📋 Dr. MOS's card</p><ul>${st.card.map((x) => `<li>${x}</li>`).join("")}</ul></div>`
                : "";
        }

        function open(title, lead, body, opts) {
            return api.openModal(`
                ${api.head("metal", title)}
                <p class="adv-round">Recipe step ${ms().step + 1} of ${STEPS.length}</p>
                <p class="adv-lead">${lead}</p>
                ${cardHtml()}
                ${body}`, opts);
        }

        function completeStep(defs, summary, then) {
            const s = ms();
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
                    ${next ? `<p class="adv-lead">Next: <strong>${next.name}</strong> at the ${next.where}.</p>` : ""}
                    <button type="button" class="adv-btn" data-close>Back to work</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
        }

        function resetRun() {
            const s = ms();
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

        const COL = {
            si: "#5d6f8f",
            ox: "#cfe8ff",
            poly: "#d08a4a",
            resist: "#e87ad8",
            nplus: "#4a8cff",
            al: "#d9dde6"
        };

        /*
           Cross-section of the transistor. o: { ox (px), poly (0..1 height),
           gate (bool: patterned), resist, sd (0..1), spread (px), metal (0..1),
           spike, oxDamage }
        */
        function drawDevice(c, o) {
            const top = 120;
            rect(c, 30, top, 400, 90, COL.si);
            label(c, "p-type silicon", 40, 200, "#e3e9f2");
            const gx = 190;
            const gw = o.gw || 80;
            // source and drain
            if (o.sd > 0) {
                const sp = o.spread || 0;
                const d = 26 * o.sd;
                rect(c, 60, top, gx - 60 + sp, d, COL.nplus);
                rect(c, gx + gw - sp, top, 400 - gx - gw + sp, d, COL.nplus);
                if (o.sd > 0.9) {
                    label(c, "n⁺ source", 70, top + 40, "#cfe0ff");
                    label(c, "n⁺ drain", 345, top + 40, "#cfe0ff");
                }
            }
            // oxide
            const oxH = Math.max(0, o.ox || 0);
            if (oxH > 0) {
                if (o.gate) {
                    rect(c, gx, top - oxH, gw, oxH, COL.ox);
                    if (o.oxDamage) {
                        rect(c, gx - 4, top - oxH, 4, oxH, "#ff6b7d");
                    }
                } else {
                    rect(c, 30, top - oxH, 400, oxH, COL.ox);
                }
            }
            // poly
            if (o.poly > 0) {
                const ph = 34 * o.poly;
                if (o.gate) {
                    rect(c, gx, top - oxH - ph, gw, ph, COL.poly);
                    if (o.stringer) {
                        rect(c, gx - 18, top - oxH - 4, 18, 4, COL.poly);
                    }
                } else {
                    rect(c, 30, top - oxH - ph, 400 * (o.polyW || 1), ph, COL.poly);
                }
            }
            if (o.resist) {
                const ph = 34 * (o.poly || 0);
                rect(c, o.gate ? gx : gx, top - oxH - ph - 12, gw, 12, COL.resist);
            }
            if (o.metal > 0) {
                const ph = 34 * (o.poly || 0);
                [[85, top], [gx + gw / 2, top - oxH - ph], [355, top]].forEach(([x, y]) => {
                    const h = 40 * o.metal;
                    rect(c, x - 10, y - h, 20, h, COL.al);
                    rect(c, x - 16, y - h - 6, 32, 6, COL.al);
                });
                if (o.spike) {
                    c.fillStyle = COL.al;
                    [85, 355].forEach((x) => {
                        c.beginPath();
                        c.moveTo(x - 6, top);
                        c.lineTo(x, top + 40);
                        c.lineTo(x + 6, top);
                        c.fill();
                    });
                }
            }
        }


        /* ---------- The device, as the tests see it ---------- */

        function model() {
            const d = ms().data;
            const tox = d.tox || 10;
            const L = d.L || 1;
            let vth = 0.45 + (tox - 10) * 0.03 + (d.wet ? 0.15 : 0) + (d.contam ? -0.2 : 0);
            let leak = 1;           // relative off-current
            let alive = true;
            let kf = 1;             // drive strength factor
            if (tox < 5) {
                leak *= 200;
            } else if (tox < 7) {
                leak *= 20;
            }
            if (d.contam) {
                leak *= 50;
            }
            if (d.oxDamage) {
                leak *= 30;
            }
            if (d.diffused) {
                leak *= 10;
                vth -= 0.1;
            }
            if (d.wrongDopant || d.noSD || d.stringer || d.spike || d.badGate) {
                alive = false;
            }
            if (d.unactivated) {
                kf *= 0.3;
            }
            if (d.lowDose) {
                kf *= 0.6;
            }
            if (d.noSinter) {
                kf *= 0.6;
            }
            if (d.rough) {
                kf *= 0.8;
            }
            kf *= 10 / Math.max(4, tox) * (1 / Math.max(0.5, L));
            return { tox: tox, L: L, vth: Math.max(0.1, +vth.toFixed(2)), leak: leak, alive: alive, kf: kf };
        }


        /* ---------- Station: wet bench (RCA clean) ---------- */

        function openWet() {
            let busy = false;
            const m = open("Wet Bench", "Three baths and a dip, in the classic order worked out at RCA in the 1960s.", `
                ${canvasBlock("wtCv")}
                <p class="adv-round">Bath order</p>
                ${ui.chips("order", [{ id: "rca", label: "SC-1 → HF → SC-2 → rinse" }, { id: "rev", label: "SC-2 → SC-1 → rinse" }, { id: "water", label: "Just a water rinse" }], null)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="wtGo" data-autofocus>Clean the wafer</button></div>
                <p class="adv-result" id="wtRes" aria-live="polite"></p>`);
            const c = $("wtCv").getContext("2d");
            let order = null;
            ui.wireChips("order", (v) => { order = v; });
            const tanks = [["SC-1", "rgba(127, 178, 255, 0.6)"], ["HF", "rgba(200, 255, 200, 0.5)"], ["SC-2", "rgba(255, 216, 120, 0.6)"], ["DI water", "rgba(220, 235, 255, 0.4)"]];

            function draw(tank, dip, dirt) {
                bg(c);
                tanks.forEach(([name, col], i) => {
                    const x = 30 + i * 105;
                    rect(c, x, 120, 90, 80, "#3b4458");
                    rect(c, x + 4, 130, 82, 66, col);
                    label(c, name, x + 45, 218, "#a9b2d0", "center");
                });
                const x = 30 + tank * 105 + 45;
                const y = 40 + 100 * dip;
                rect(c, x - 2, 20, 4, y - 20, "#8f98aa");
                rect(c, x - 3, y, 6, 50, "#9aa6bb");
                for (let i = 0; i < Math.round(8 * dirt); i++) {
                    dot(c, x + (i % 2 ? 5 : -5), y + 6 + i * 5, 2, "#8a5a3b");
                }
            }
            draw(0, 0, 1);

            $("wtGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!order) {
                    ui.result("wtRes", "Choose a bath order first.", false);
                    return;
                }
                busy = true;
                const dipIn = (tank, from, to) => (k) => draw(tank, Math.sin(Math.PI * k), from + (to - from) * k);
                const stages = order === "rca" ? [
                    { caption: "SC-1 (ammonia + peroxide) lifts off particles and organic films.", dur: 3000, draw: dipIn(0, 1, 0.5) },
                    { caption: "A quick HF dip strips the thin native oxide.", dur: 3000, draw: dipIn(1, 0.5, 0.3) },
                    { caption: "SC-2 (hydrochloric acid + peroxide) dissolves metal ions like iron and sodium.", dur: 3000, draw: dipIn(2, 0.3, 0) },
                    { caption: "A DI water rinse, and the wafer is spotless.", dur: 3000, draw: dipIn(3, 0, 0) }
                ] : order === "rev" ? [
                    { caption: "SC-2 first removes metals…", dur: 3000, draw: dipIn(2, 1, 0.7) },
                    { caption: "…but SC-1 afterward leaves new metal traces behind, and the native oxide was never stripped.", dur: 3000, draw: dipIn(0, 0.7, 0.4) },
                    { caption: "Rinse.", dur: 2500, draw: dipIn(3, 0.4, 0.4) }
                ] : [
                    { caption: "Water alone rinses off loose dust, but organics, oxide and metal ions stay put.", dur: 4000, draw: dipIn(3, 1, 0.8) }
                ];
                runStages(m, "wtCvCap", stages, () => {
                    const defs = [];
                    if (order !== "rca") {
                        ms().data.dirty = true;
                        defs.push(defect(order === "water" ? "major" : "minor", "Leftover metal ions and organics end up trapped in the gate oxide, shifting the threshold voltage and adding leakage."));
                    }
                    completeStep(defs, `<p>Cleaned with ${order === "rca" ? "the full RCA sequence" : order === "rev" ? "SC-2 then SC-1" : "just water"}.</p>`);
                });
            });
        }


        /* ---------- Station: oxidation furnace ---------- */

        function oxideNm(T, min, wet) {
            const A = 3.2 * Math.exp((T - 1000) / 120) * (wet ? 6 : 1);
            return +(A * Math.sqrt(min)).toFixed(1);
        }

        function openFurnace() {
            let gas = null;
            let busy = false;
            const m = open("Oxidation Furnace", "Heat silicon in oxygen and it grows its own glass, silicon dioxide. Made from the wafer itself, the interface is nearly perfect.", `
                ${canvasBlock("oxCv")}
                ${ui.chips("gas", [{ id: "dry", label: "Dry O₂" }, { id: "wet", label: "Steam (H₂O)" }], null)}
                ${ui.slider("oxT", "Temperature", "°C", 800, 1200, 25, 800)}
                ${ui.slider("oxMin", "Time", "min", 1, 60, 1, 1)}
                <p class="adv-keys" style="text-align:left">Predicted oxide: <strong id="oxPred">–</strong></p>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="oxGo" data-autofocus>Oxidize</button></div>
                <p class="adv-result" id="oxRes" aria-live="polite"></p>`);
            const c = $("oxCv").getContext("2d");
            let tEl = null;
            let mEl = null;
            const pred = () => {
                if (tEl && mEl) {
                    $("oxPred").textContent = gas ? `${oxideNm(Number(tEl.value), Number(mEl.value), gas === "wet")} nm` : "choose a gas";
                }
            };
            tEl = ui.wireSlider("oxT", null, pred);
            mEl = ui.wireSlider("oxMin", null, pred);
            ui.wireChips("gas", (v) => { gas = v; pred(); });

            function draw(k, now, nm, T) {
                bg(c);
                // furnace tube with a boat of wafers
                rect(c, 20, 20, 420, 70, "#3a4256");
                rect(c, 26, 26, 408, 58, `rgba(255, 150, 60, ${0.1 + 0.35 * Math.min(1, (T - 700) / 500)})`);
                for (let i = 0; i < 12; i++) {
                    rect(c, 120 + i * 18, 34, 4, 42, "#9aa6bb");
                }
                for (let i = 0; i < 10; i++) {
                    const x = 30 + ((now / 8 + i * 45) % 400);
                    dot(c, x, 30 + (i % 4) * 14, 2, gas === "wet" ? "#a9d8ff" : "#ff8a8a");
                }
                label(c, `${T} °C · ${gas === "wet" ? "steam" : "O₂"}`, 30, 104, "#f5f7ff", "left", true);
                // close-up cross-section: oxide grows half above, half below
                const px = Math.min(50, nm * 1.6) * k;
                rect(c, 60, 160, 340, 60, COL.si);
                rect(c, 60, 160 - px * 0.56, 340, px, COL.ox);
                c.setLineDash([4, 4]);
                c.strokeStyle = "#ffd84a";
                c.beginPath();
                c.moveTo(60, 160);
                c.lineTo(400, 160);
                c.stroke();
                c.setLineDash([]);
                label(c, `oxide ${(nm * k).toFixed(1)} nm`, 410, 150, "#cfe8ff", "right", true);
                label(c, "dashed: original silicon surface (44% of the oxide grows below it)", 60, 228, "#a9b2d0");
            }
            draw(0, 0, 10, 1000);

            $("oxGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!gas) {
                    ui.result("oxRes", "Choose dry O₂ or steam first.", false);
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                const min = Number(mEl.value);
                const nm = oxideNm(T, min, gas === "wet");
                runStages(m, "oxCvCap", [
                    { caption: `Ramping the furnace to ${T} °C and flowing ${gas === "wet" ? "steam" : "dry oxygen"} over the wafers.`, dur: 3000, draw: (k, now) => draw(0, now, nm, T) },
                    { caption: `Oxygen diffuses through the oxide to reach fresh silicon, so growth slows as it thickens. After ${min} min: ${nm} nm.`, dur: 5000, draw: (k, now) => draw(Math.sqrt(k), now, nm, T) }
                ], () => {
                    const defs = [];
                    const d = ms().data;
                    d.tox = Math.min(60, nm);
                    d.wet = gas === "wet";
                    if (gas === "wet") {
                        defs.push(defect("minor", "Steam oxide grows fast but is less dense, with more trapped charge. Gate oxides are grown dry."));
                    }
                    if (nm < 5) {
                        defs.push(defect("major", `${nm} nm is so thin that electrons tunnel straight through the gate oxide. The gate leaks.`));
                    } else if (nm < 7) {
                        defs.push(defect("minor", `${nm} nm is thin enough for noticeable tunneling leakage.`));
                    } else if (nm > 30) {
                        defs.push(defect("major", `${nm} nm is far too thick. The gate barely controls the channel, so the transistor is weak and slow.`));
                    } else if (nm > 15) {
                        defs.push(defect("minor", `${nm} nm is thicker than the 10 nm target, raising V<sub>th</sub> and weakening the drive current.`));
                    }
                    completeStep(defs, `<p>Grew <strong>${nm} nm</strong> of ${gas === "wet" ? "wet" : "dry"} oxide at ${T} °C for ${min} min.</p>`);
                });
            });
        }


        /* ---------- Station: LPCVD (poly gate) ---------- */

        function openLpcvd() {
            let gas = null;
            let busy = false;
            const m = open("LPCVD Furnace", "Low-pressure chemical vapor deposition: a gas breaks apart on the hot wafers and leaves a solid film behind, evenly over every wafer in the tube.", `
                ${canvasBlock("lpCv")}
                ${ui.chips("lgas", [{ id: "sih4", label: "Silane (SiH₄)" }, { id: "o2", label: "Oxygen (O₂)" }, { id: "n2", label: "Nitrogen (N₂)" }], null)}
                ${ui.slider("lpT", "Temperature", "°C", 400, 900, 20, 400)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="lpGo" data-autofocus>Deposit</button></div>
                <p class="adv-result" id="lpRes" aria-live="polite"></p>`);
            const c = $("lpCv").getContext("2d");
            const tEl = ui.wireSlider("lpT");
            ui.wireChips("lgas", (v) => { gas = v; });
            const tox = ms().data.tox || 10;
            const oxPx = Math.max(3, Math.min(14, tox * 0.6));

            function draw(k, now, grow, T) {
                bg(c);
                drawDevice(c, { ox: oxPx, poly: grow });
                const n = gas === "sih4" ? 16 : 10;
                for (let i = 0; i < n * Math.min(1, k * 3); i++) {
                    const ph = ((now / 1600) + i / n) % 1;
                    const x = 40 + ((i * 59) % 380);
                    const y = 10 + ph * (110 - oxPx - 34 * grow - 10);
                    dot(c, x, y, 3, gas === "sih4" ? "#d08a4a" : gas === "o2" ? "#ff8a8a" : "#a9b2d0");
                    if (gas === "sih4") {
                        dot(c, x - 4, y - 3, 1.5, "#f5f7ff");
                        dot(c, x + 4, y - 3, 1.5, "#f5f7ff");
                    }
                }
                label(c, `${T} °C, low pressure`, 440, 20, "#f5f7ff", "right", true);
            }
            draw(0, 0, 0, 620);

            $("lpGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!gas) {
                    ui.result("lpRes", "Choose a gas first.", false);
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                const ok = gas === "sih4" && T >= 560 && T <= 700;
                const grows = gas === "sih4" && T >= 500;
                runStages(m, "lpCvCap", [
                    { caption: gas === "sih4" ? `Silane molecules (one Si, four H) drift onto the hot wafer at ${T} °C.` : gas === "o2" ? "Oxygen just thickens the oxide a little. Nothing conductive is deposited." : "Nitrogen is inert: nothing happens.", dur: 3500, draw: (k, now) => draw(k, now, 0, T) },
                    { caption: grows ? (T < 560 ? "They break apart slowly, leaving amorphous silicon with no crystal grains." : T > 700 ? "So hot the silane reacts in the gas, raining rough, bumpy silicon onto the wafer." : "Each SiH₄ breaks apart, the hydrogen leaves, and silicon atoms build up a polysilicon film: the gate electrode.") : "No film forms.", dur: 5000, draw: (k, now) => draw(1, now, grows ? k : 0, T) }
                ], () => {
                    const defs = [];
                    const d = ms().data;
                    if (!grows) {
                        d.badGate = true;
                        defs.push(defect("major", gas === "sih4" ? `${T} °C is too cold: no silicon deposited, so there's no gate electrode.` : "No silicon was deposited, so there's no gate electrode."));
                    } else if (!ok) {
                        d.rough = true;
                        defs.push(defect("minor", T < 560 ? "The film is amorphous silicon, with higher resistance than polysilicon." : "Gas-phase reactions left a rough, particle-filled film."));
                    }
                    completeStep(defs, `<p>${grows ? `Deposited a silicon gate film at ${T} °C.` : "Nothing was deposited."}</p>`);
                });
            });
        }


        /* ---------- Station: mask aligner (gate litho) ---------- */

        function openAligner() {
            let busy = false;
            const m = open("Mask Aligner", "The resist is spun on, then UV light shines through a mask with a single line. That line becomes the gate.", `
                ${canvasBlock("alCv")}
                ${ui.slider("alL", "Gate length L", "µm", 0.4, 5, 0.1, 5)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="alGo" data-autofocus>Spin, expose and develop</button></div>
                <p class="adv-result" id="alRes" aria-live="polite"></p>`);
            const c = $("alCv").getContext("2d");
            const lEl = ui.wireSlider("alL", (v) => v.toFixed(1));
            const tox = ms().data.tox || 10;
            const oxPx = Math.max(3, Math.min(14, tox * 0.6));

            function gwOf(L) {
                return Math.max(16, Math.min(160, L * 32));
            }

            function draw(k, stage, L) {
                bg(c);
                const gw = gwOf(L);
                drawDevice(c, { ox: oxPx, poly: 1 });
                const top = 120 - oxPx - 34;
                if (stage === 0) {
                    rect(c, 30, top - 12 * k, 400, 12 * k, COL.resist);
                } else if (stage === 1) {
                    rect(c, 30, top - 12, 400, 12, COL.resist);
                    rect(c, 20, 20, 420, 10, "#f5f7ff");
                    rect(c, 190, 20, gw, 10, "#1a2033");
                    c.fillStyle = `rgba(180, 120, 255, ${0.25 + 0.35 * Math.sin(k * Math.PI)})`;
                    c.fillRect(30, 30, 160, top - 42);
                    c.fillRect(190 + gw, 30, 240 - gw, top - 42);
                    label(c, "mask: one dark line = the gate", 230, 46, "#a9b2d0", "center");
                } else {
                    const blur = L < 1;
                    rect(c, 30, top - 12, 400, 12, `rgba(232, 122, 216, ${1 - k})`);
                    if (blur && k > 0.5) {
                        for (let i = 0; i < 4; i++) {
                            rect(c, 190 + i * gw / 4, top - 12, gw / 8, 12, COL.resist);
                        }
                        label(c, "the line broke up: too small for this aligner", 230, 40, "#ff9aa6", "center", true);
                    } else {
                        rect(c, 190, top - 12, gw, 12, COL.resist);
                        label(c, `resist line: L = ${L.toFixed(1)} µm`, 230, 40, "#e87ad8", "center", true);
                    }
                }
            }
            draw(0, 0, 5);
            lEl.addEventListener("input", () => { if (!busy) { draw(1, 2, Number(lEl.value)); } });

            $("alGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const L = Number(lEl.value);
                runStages(m, "alCvCap", [
                    { caption: "Spinning on S1813 photoresist (pink) over the polysilicon.", dur: 3000, draw: (k) => draw(k, 0, L) },
                    { caption: "UV light through the mask. The dark line shields the resist where the gate will be.", dur: 3500, draw: (k) => draw(k, 1, L) },
                    { caption: L < 1 ? `Developing… at ${L.toFixed(1)} µm the light diffracted around the line, and the resist line broke up.` : `Developing washes away the exposed resist, leaving a ${L.toFixed(1)} µm line protecting the gate.`, dur: 3500, draw: (k) => draw(k, 2, L) }
                ], () => {
                    const defs = [];
                    const d = ms().data;
                    d.L = L;
                    if (L < 1) {
                        d.badGate = true;
                        defs.push(defect("major", `A ${L.toFixed(1)} µm line is below this aligner's ~1 µm limit. The gate broke into pieces.`));
                    } else if (L > 2) {
                        defs.push(defect("minor", `A ${L.toFixed(1)} µm gate works, but current has farther to travel, so it switches more slowly than a 1 µm gate.`));
                    }
                    completeStep(defs, `<p>Printed a ${L.toFixed(1)} µm gate line in S1813.</p>`);
                });
            });
        }


        /* ---------- Station: plasma etcher ---------- */

        function openEtcher() {
            let busy = false;
            const m = open("Plasma Etcher", "A chlorine plasma etches away the polysilicon everywhere the resist doesn't cover it.", `
                ${canvasBlock("etCv")}
                ${ui.slider("etOver", "Over-etch past the endpoint", "%", 0, 150, 10, 0)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="etGo" data-autofocus>Etch</button></div>
                <p class="adv-result" id="etRes" aria-live="polite"></p>`);
            const c = $("etCv").getContext("2d");
            const oEl = ui.wireSlider("etOver");
            const d0 = ms().data;
            const tox = d0.tox || 10;
            const oxPx = Math.max(3, Math.min(14, tox * 0.6));
            const gw = Math.max(16, Math.min(160, (d0.L || 1) * 32));

            function draw(k, now, phase, over) {
                bg(c);
                // the cross-section fills the canvas; the endpoint trace is an inset, top right
                const polyLeft = phase === 0 ? 1 - k : 0;
                drawDevice(c, { ox: oxPx, poly: 1, gate: true, gw: gw, resist: true });
                if (polyLeft > 0) {
                    rect(c, 30, 120 - oxPx - 34 * polyLeft, 160, 34 * polyLeft, COL.poly);
                    rect(c, 190 + gw, 120 - oxPx - 34 * polyLeft, 240 - gw, 34 * polyLeft, COL.poly);
                }
                if (phase === 0 || phase === 1) {
                    rect(c, 30, 120 - oxPx, 160, oxPx, COL.ox);
                    rect(c, 190 + gw, 120 - oxPx, 240 - gw, oxPx, COL.ox);
                }
                if (phase === 1 && over > 60) {
                    rect(c, 30, 120 - oxPx, 160, oxPx * Math.max(0, 1 - k), COL.ox);
                    label(c, "oxide punched through!", 40, 100, "#ff9aa6", "left", true);
                }
                for (let i = 0; i < 14; i++) {
                    const x = 30 + ((now / 7 + i * 31) % 250);
                    dot(c, x, 14 + ((i * 17 + now / 20) % 44), 2, "#c97fe0");
                }
                // endpoint trace: high while poly etches, a sharp drop when it clears
                const ix = 310;
                const iy = 6;
                rect(c, ix, iy, 140, 58, "#141a2e");
                label(c, "endpoint signal", ix + 70, iy + 54, "#a9b2d0", "center");
                const hi = iy + 14;
                const lo = iy + 40;
                const endX = ix + 70;
                c.strokeStyle = "#ffd84a";
                c.lineWidth = 2;
                c.beginPath();
                c.moveTo(ix + 4, hi);
                if (phase === 0) {
                    c.lineTo(ix + 4 + (endX - ix - 4) * k, hi);
                } else {
                    c.lineTo(endX, hi);
                    c.lineTo(endX, lo);
                    c.lineTo(endX + 62 * Math.min(1, over / 100) * k, lo);
                }
                c.stroke();
                c.lineWidth = 1;
                if (phase >= 1) {
                    c.setLineDash([3, 3]);
                    c.strokeStyle = "#5be38a";
                    c.beginPath();
                    c.moveTo(endX, iy + 4);
                    c.lineTo(endX, iy + 46);
                    c.stroke();
                    c.setLineDash([]);
                    label(c, "endpoint", endX + 4, iy + 12, "#5be38a");
                }
            }
            draw(0, 0, 0, 0);

            $("etGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const over = Number(oEl.value);
                runStages(m, "etCvCap", [
                    { caption: "The plasma eats the exposed polysilicon. The signal stays high while poly is being etched…", dur: 4500, draw: (k, now) => draw(k, now, 0, over) },
                    { caption: `…and drops at the endpoint when the poly is gone. Then ${over}% over-etch${over < 10 ? ": too little to clear the leftovers in the corners." : over > 60 ? ": long enough to chew through the thin gate oxide." : ": just enough to clean up stringers."}`, dur: 4500, draw: (k, now) => draw(k, now, 1, over) }
                ], () => {
                    const defs = [];
                    const d = ms().data;
                    if (over < 10) {
                        d.stringer = true;
                        defs.push(defect("major", "Without over-etch, thin poly \"stringers\" were left along steps, shorting the gate to the source and drain."));
                    } else if (over > 60) {
                        d.oxDamage = true;
                        defs.push(defect("major", `${over}% over-etch broke through the thin oxide beside the gate and damaged the silicon, so the device leaks.`));
                    } else if (over > 35) {
                        defs.push(defect("minor", `${over}% over-etch thinned the oxide at the gate edges.`));
                    }
                    completeStep(defs, `<p>Etched the gate with ${over}% over-etch, then stripped the resist.</p>`);
                });
            });
        }


        /* ---------- Station: ion implanter ---------- */

        function openImplanter() {
            let sp = null;
            let busy = false;
            const m = open("Ion Implanter", "Dopant ions are fired into the wafer like tiny bullets. The gate is in the way in the middle, so the dopants land only on either side of it.", `
                ${canvasBlock("imCv")}
                ${ui.chips("sp", [{ id: "p", label: "Phosphorus (n-type)" }, { id: "b", label: "Boron (p-type)" }], null)}
                ${ui.slider("imDose", "Dose", "ions/cm²", 12, 16, 0.5, 12)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="imGo" data-autofocus>Implant</button></div>
                <p class="adv-result" id="imRes" aria-live="polite"></p>`);
            const c = $("imCv").getContext("2d");
            const dEl = ui.wireSlider("imDose", (v) => "10" + String(v).split("").map((ch) => (ch === "." ? "·" : "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(ch)])).join(""));
            ui.wireChips("sp", (v) => { sp = v; });
            const d0 = ms().data;
            const oxPx = Math.max(3, Math.min(14, (d0.tox || 10) * 0.6));
            const gw = Math.max(16, Math.min(160, (d0.L || 1) * 32));

            function draw(k, now, kind) {
                bg(c);
                const nsd = kind === "p" ? k : 0;
                drawDevice(c, { ox: oxPx, poly: 1, gate: true, gw: gw, sd: nsd });
                if (kind === "b" && k > 0) {
                    rect(c, 60, 120, 130, 20 * k, "#7a5d9f");
                    rect(c, 190 + gw, 120, 240 - gw - 30, 20 * k, "#7a5d9f");
                    label(c, "p⁺ (same type as the substrate: no junction!)", 230, 100, "#ff9aa6", "center", true);
                }
                for (let i = 0; i < 22; i++) {
                    const x = 34 + ((i * 53) % 392);
                    const y = ((now / 3 + i * 37) % 120);
                    const hitsGate = x > 190 && x < 190 + gw;
                    const stop = hitsGate ? 120 - oxPx - 34 : 126;
                    if (y < stop) {
                        dot(c, x, y, 2.5, kind === "b" ? "#c97fe0" : "#7fb2ff");
                    }
                }
            }
            draw(0, 0, "p");

            $("imGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!sp) {
                    ui.result("imRes", "Choose a dopant first.", false);
                    return;
                }
                busy = true;
                const dose = Number(dEl.value);
                runStages(m, "imCvCap", [
                    { caption: `${sp === "p" ? "Phosphorus" : "Boron"} ions rain down. The ones that hit the gate stop in the polysilicon; the rest bury themselves in the silicon beside it.`, dur: 4500, draw: (k, now) => draw(k * 0.4, now, sp) },
                    { caption: sp === "p" ? "Two n⁺ regions form, lined up exactly with the gate edges: self-aligned source and drain." : "Boron makes p-type regions in a p-type wafer: no p–n junctions, so no source or drain.", dur: 4500, draw: (k, now) => draw(0.4 + 0.6 * k, now, sp) }
                ], () => {
                    const defs = [];
                    const d = ms().data;
                    if (sp !== "p") {
                        d.wrongDopant = true;
                        defs.push(defect("major", "Boron is p-type, the same as the wafer, so there are no n⁺ source and drain. The transistor can't turn on."));
                    } else if (dose < 14) {
                        d.noSD = dose < 13;
                        d.lowDose = true;
                        defs.push(defect(dose < 13 ? "major" : "minor", `A dose of 10^${dose} is too light: the source and drain are barely doped and very resistive.`.replace(`10^${dose}`, `10<sup>${dose}</sup>`)));
                    } else if (dose > 15.5) {
                        defs.push(defect("minor", "That heavy a dose badly damages the crystal and takes a long time on the implanter."));
                    }
                    d.dose = dose;
                    completeStep(defs, `<p>Implanted ${sp === "p" ? "phosphorus" : "boron"} at 10<sup>${dose}</sup> ions/cm².</p>`);
                });
            });
        }


        /* ---------- Station: RTA ---------- */

        function openRta() {
            let busy = false;
            const m = open("Rapid Thermal Anneal", "Banks of bright lamps heat the wafer to about 1000 °C in seconds, then shut off.", `
                ${canvasBlock("rtCv")}
                ${ui.slider("rtT", "Temperature", "°C", 600, 1200, 25, 600)}
                ${ui.slider("rtS", "Time", "s", 1, 120, 1, 1)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="rtGo" data-autofocus>Anneal</button></div>
                <p class="adv-result" id="rtRes" aria-live="polite"></p>`);
            const c = $("rtCv").getContext("2d");
            const tEl = ui.wireSlider("rtT");
            const sEl = ui.wireSlider("rtS");
            const d0 = ms().data;
            const oxPx = Math.max(3, Math.min(14, (d0.tox || 10) * 0.6));
            const gw = Math.max(16, Math.min(160, (d0.L || 1) * 32));
            const sd = d0.wrongDopant ? 0 : 1;

            function draw(k, now, T, spread, active) {
                bg(c);
                for (let i = 0; i < 8; i++) {
                    rect(c, 30 + i * 52, 8, 40, 10, `rgba(255, 220, 140, ${0.3 + 0.6 * Math.min(1, (T - 500) / 600) * Math.sin(Math.PI * Math.min(1, k * 1.2))})`);
                }
                drawDevice(c, { ox: oxPx, poly: 1, gate: true, gw: gw, sd: sd, spread: spread });
                // dopants: scattered (inactive) → in lattice (active)
                for (let i = 0; i < 18; i++) {
                    const x = 70 + ((i * 41) % 110) + (i % 2 ? 0 : 190 + gw - 70);
                    const jit = (1 - active) * 5;
                    dot(c, x + Math.sin(now / 200 + i) * jit, 132 + (i % 3) * 5, 2, active > 0.5 ? "#ffd84a" : "#8f98aa");
                }
                label(c, `${T} °C`, 440, 40, "#f5f7ff", "right", true);
                label(c, active > 0.5 ? "dopants in the lattice: active (yellow)" : "dopants knocked loose: inactive (gray)", 30, 225, "#a9b2d0");
            }
            draw(0, 0, 1000, 0, 0);

            $("rtGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                const S = Number(sEl.value);
                const act = T >= 900 ? 1 : T >= 800 ? 0.5 : 0;
                const spread = T >= 950 && S > 30 ? 22 : T >= 1100 && S > 10 ? 18 : 0;
                runStages(m, "rtCvCap", [
                    { caption: `Lamps flash the wafer to ${T} °C for ${S} s.`, dur: 3500, draw: (k, now) => draw(k, now, T, 0, 0) },
                    { caption: act < 1 ? "Not hot enough: most dopants stay stuck between lattice sites and can't give up electrons." : spread ? "The dopants activate… but with that much heat they also creep sideways under the gate." : "The dopants snap into lattice sites and become active, and the damaged crystal heals.", dur: 4500, draw: (k, now) => draw(1, now, T, spread * k, act * k) }
                ], () => {
                    const defs = [];
                    const d = ms().data;
                    if (act < 1) {
                        d.unactivated = true;
                        defs.push(defect(act === 0 ? "major" : "minor", `${T} °C didn't activate the implant, so the source and drain stay highly resistive.`));
                    }
                    if (spread) {
                        d.diffused = true;
                        defs.push(defect("minor", `${S} s at ${T} °C let the source and drain diffuse under the gate, shortening the channel and adding leakage.`));
                    }
                    completeStep(defs, `<p>Annealed at ${T} °C for ${S} s.</p>`);
                });
            });
        }


        /* ---------- Station: sputter tool (metal) ---------- */

        function openSputter() {
            let metal = null;
            let busy = false;
            const m = open("Sputter Tool", "Argon ions slam into a metal target and knock atoms loose, which coat the wafer. Contact holes through an oxide layer let the metal touch the source, drain and gate.", `
                ${canvasBlock("spCv")}
                ${ui.chips("met", [{ id: "al", label: "Aluminum" }, { id: "au", label: "Gold" }, { id: "cu", label: "Copper (no barrier)" }], null)}
                ${ui.slider("spT", "Forming-gas sinter", "°C", 200, 600, 25, 200)}
                <div class="adv-button-row"><button type="button" class="adv-btn" id="spGo" data-autofocus>Sputter and sinter</button></div>
                <p class="adv-result" id="spRes" aria-live="polite"></p>`);
            const c = $("spCv").getContext("2d");
            const tEl = ui.wireSlider("spT");
            ui.wireChips("met", (v) => { metal = v; });
            const d0 = ms().data;
            const oxPx = Math.max(3, Math.min(14, (d0.tox || 10) * 0.6));
            const gw = Math.max(16, Math.min(160, (d0.L || 1) * 32));
            const sd = d0.wrongDopant ? 0 : 1;
            const mcol = { al: COL.al, au: "#ffd84a", cu: "#e08a5a" };

            function draw(k, now, kind, spike, poison) {
                bg(c);
                const saved = COL.al;
                COL.al = mcol[kind || "al"];
                drawDevice(c, { ox: oxPx, poly: 1, gate: true, gw: gw, sd: sd, metal: k, spike: spike });
                COL.al = saved;
                if (k < 1) {
                    for (let i = 0; i < 14; i++) {
                        const x = 40 + ((i * 47) % 380);
                        const y = ((now / 4 + i * 23) % 70);
                        dot(c, x, y, 2, mcol[kind || "al"]);
                    }
                }
                if (poison) {
                    for (let i = 0; i < 16; i++) {
                        const x = 60 + ((i * 61 + now / 15) % 340);
                        dot(c, x, 150 + (i % 4) * 14, 2, mcol[kind]);
                    }
                    label(c, `${kind === "au" ? "gold" : "copper"} atoms wandering into the silicon`, 230, 225, "#ff9aa6", "center", true);
                }
            }
            draw(0, 0, "al", false, false);

            $("spGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                if (!metal) {
                    ui.result("spRes", "Choose a metal first.", false);
                    return;
                }
                busy = true;
                const T = Number(tEl.value);
                const spike = metal === "al" && T > 500;
                const poison = metal !== "al";
                runStages(m, "spCvCap", [
                    { caption: `Sputtering ${metal === "al" ? "aluminum" : metal === "au" ? "gold" : "copper"} into the contact holes and over the wafer, then patterning it into wires.`, dur: 4500, draw: (k, now) => draw(k, now, metal, false, false) },
                    { caption: `Sintering at ${T} °C in forming gas. ${poison ? "The metal atoms diffuse into the silicon and act as traps that leak current." : spike ? "Too hot: silicon dissolves into the aluminum, and aluminum spikes down through the junctions." : T < 350 ? "Too cool: the metal never makes a good, low-resistance contact." : "The aluminum bonds to the silicon, and hydrogen heals defects at the oxide."}`, dur: 4500, draw: (k, now) => draw(1, now, metal, spike && k > 0.4, poison && k > 0.3) }
                ], () => {
                    const defs = [];
                    const d = ms().data;
                    if (poison) {
                        d.contam = true;
                        defs.push(defect("major", `${metal === "au" ? "Gold" : "Copper"} diffused into the silicon and created traps that leak current and shift V<sub>th</sub>.${metal === "cu" ? " Real copper wiring needs a barrier layer first." : ""}`));
                    }
                    if (spike) {
                        d.spike = true;
                        defs.push(defect("major", `At ${T} °C aluminum spiked through the shallow junctions, shorting the source and drain to the substrate.`));
                    } else if (T < 350) {
                        d.noSinter = true;
                        defs.push(defect("minor", `${T} °C was too cool to sinter: the contacts are resistive.`));
                    }
                    completeStep(defs, `<p>Sputtered ${metal === "al" ? "aluminum" : metal === "au" ? "gold" : "copper"} contacts and sintered at ${T} °C.</p>`);
                });
            });
        }


        /* ---------- Station: probe station ---------- */

        function idOf(md, vg) {
            const off = 1e-9 * md.leak;
            if (!md.alive) {
                return 1e-9;
            }
            if (vg <= md.vth) {
                return off;
            }
            return off + 0.25e-3 * md.kf * Math.pow(vg - md.vth, 2) / 2;
        }

        function openProbe() {
            const md = model();
            const m = open("Probe Station", "Four needle-thin probes land on the source, drain, gate and substrate. The analyzer sweeps the gate voltage and records the current.", `
                <canvas id="prCv" width="460" height="230" class="adv-wide-canvas"></canvas>
                <p class="adv-stage" id="prCap">Press the button to sweep V<sub>G</sub> from 0 to 3 V with V<sub>D</sub> = 0.1 V.</p>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="prGo" data-autofocus>Sweep the gate</button></div>
                <div id="prQ"></div>`);
            const c = $("prCv").getContext("2d");
            const maxI = Math.max(idOf(md, 3) * 1e3 * 1.1, 0.01);

            function draw(k) {
                const pts = [];
                for (let i = 0; i <= 120 * k; i++) {
                    const vg = 3 * i / 120;
                    pts.push([vg, idOf(md, vg) * 1e3]);
                }
                ui.plot(c, 460, 230, [{ pts: pts, color: "#ffd84a" }], {
                    x0: 0, x1: 3, y0: 0, y1: +maxI.toPrecision(2),
                    xLabel: "gate voltage V_G (V)".replace("V_G", "Vg"), yLabel: "drain current (mA)",
                    xTicks: [0, 0.5, 1, 1.5, 2, 2.5, 3],
                    yTicks: [0, +(maxI / 2).toPrecision(2), +maxI.toPrecision(2)]
                }, 1);
            }
            draw(0);

            $("prGo").addEventListener("click", () => {
                $("prGo").disabled = true;
                $("prCap").innerHTML = "Sweeping… the current stays near zero, then the channel forms and it climbs.";
                ui.animate(m, 6500, (k) => draw(k), () => {
                    if (!md.alive) {
                        $("prCap").innerHTML = "The current never rises: this transistor doesn't switch.";
                        $("prQ").innerHTML = `<div class="adv-takeaway"><p>⚠️ No channel ever forms (or the device is shorted). Check the report for which step went wrong.</p></div><div class="adv-button-row"><button type="button" class="adv-btn" id="prDone">Log it</button></div>`;
                        $("prDone").addEventListener("click", () => completeStep([defect("major", "The transistor doesn't switch at all.")], "<p>The transistor is dead.</p>"));
                        return;
                    }
                    $("prCap").innerHTML = "Read where the current takes off from zero: that's the threshold voltage.";
                    const v = md.vth;
                    const opts = (window.SCGames ? window.SCGames.shuffle : (x) => x)([
                        { v: v, ok: true }, { v: +(v + 0.6).toFixed(2) }, { v: +(v + 1.2).toFixed(2) }, { v: 0 }
                    ]);
                    $("prQ").innerHTML = `
                        <div class="adv-takeaway">
                            <p><strong>What's this transistor's threshold voltage V<sub>th</sub>?</strong></p>
                            <div class="adv-chips">${opts.map((o, i) => `<button type="button" class="adv-chip" data-vq="${i}">${o.v.toFixed(2)} V</button>`).join("")}</div>
                            <p class="adv-result" id="vqRes"></p>
                        </div>
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="prDone" hidden>Log the results</button></div>`;
                    let answered = false;
                    api.modalBody().querySelectorAll("[data-vq]").forEach((b) => b.addEventListener("click", () => {
                        if (answered) {
                            return;
                        }
                        answered = true;
                        b.classList.add("on");
                        const ok = opts[Number(b.dataset.vq)].ok;
                        const ioff = idOf(md, 0);
                        const ion = idOf(md, 3);
                        ui.result("vqRes", `${ok ? "✓" : "✗"} V<sub>th</sub> ≈ <strong>${v.toFixed(2)} V</strong>: below it the transistor is off, above it a channel forms. On/off current ratio: about ${Math.round(ion / ioff).toLocaleString()}×.`, !!ok);
                        $("prDone").hidden = false;
                        $("prDone").focus();
                    }));
                    $("prDone").addEventListener("click", () => {
                        const defs = [];
                        if (v < 0.3 || v > 1) {
                            defs.push(defect("minor", `V<sub>th</sub> = ${v.toFixed(2)} V is outside the 0.3–1 V a logic NMOS aims for.`));
                        }
                        if (md.leak > 25) {
                            defs.push(defect("minor", "The off-current is high: this transistor leaks even when it's off."));
                        }
                        ms().data.vth = v;
                        completeStep(defs, `<p>V<sub>th</sub> = <strong>${v.toFixed(2)} V</strong>. Next, these transistors go into Dr. MOS's computer.</p>`);
                    });
                });
            });
        }


        /* ---------- Station: Dr. MOS's computer ---------- */

        const SPEED_TARGET = 60;

        function perf(md, vdd) {
            if (!md.alive || vdd <= md.vth) {
                return { speed: 0, dyn: 0, leak: 0, power: 0, eff: 0 };
            }
            const speed = 100 * Math.pow(vdd - md.vth, 1.3) / vdd * md.kf;
            const dyn = 0.1 * vdd * vdd * speed;
            const leak = 0.4 * vdd * md.leak;
            const power = dyn + leak;
            return { speed: speed, dyn: dyn, leak: leak, power: power, eff: speed / power };
        }

        function bestVdd(md) {
            let best = null;
            for (let v = 0.5; v <= 3.3001; v += 0.1) {
                const p = perf(md, v);
                if (p.speed >= SPEED_TARGET && (!best || p.eff > best.eff)) {
                    best = { v: +v.toFixed(1), eff: p.eff };
                }
            }
            return best;
        }

        function openComputer() {
            const md = model();
            const best = bestVdd(md);
            let busy = false;
            const m = open("Dr. MOS's Computer", "Dr. MOS's chip is made from millions of your transistors. Set the supply voltage V<sub>DD</sub>, then run the benchmark.", `
                ${canvasBlock("pcCv")}
                ${ui.slider("pcV", "Supply voltage V<sub>DD</sub>", "V", 0.5, 3.3, 0.1, 3.3)}
                <ul class="adv-stats" id="pcStats"></ul>
                <div class="adv-button-row"><button type="button" class="adv-btn" id="pcGo" data-autofocus>Run the benchmark</button></div>
                <p class="adv-result" id="pcRes" aria-live="polite"></p>`);
            const c = $("pcCv").getContext("2d");
            let vEl = null;

            function stats() {
                if (!vEl) {
                    return;
                }
                const p = perf(md, Number(vEl.value));
                const g = (ok) => ok ? "style=\"color:#5be38a\"" : "style=\"color:#ff9aa6\"";
                $("pcStats").innerHTML = `
                    <li>Speed score <strong ${g(p.speed >= SPEED_TARGET)}>${p.speed.toFixed(0)}</strong> (need ${SPEED_TARGET})</li>
                    <li>Switching power <strong>${p.dyn.toFixed(1)} W</strong></li>
                    <li>Leakage power <strong>${p.leak.toFixed(1)} W</strong></li>
                    <li>Work per watt <strong>${p.eff.toFixed(2)}</strong></li>`;
                if (!busy) {
                    draw(0, 0, Number(vEl.value), p);
                }
            }

            function draw(k, now, vdd, p) {
                bg(c);
                // monitor and tower
                rect(c, 40, 30, 220, 140, "#1a2033");
                rect(c, 48, 38, 204, 116, "#0e1a2b");
                rect(c, 140, 170, 20, 20, "#3b4458");
                rect(c, 110, 190, 80, 8, "#3b4458");
                rect(c, 290, 40, 120, 160, "#3b4458");
                rect(c, 300, 60, 100, 60, "#141a2e");
                // CPU with a fan whose speed shows the clock
                rect(c, 330, 70, 40, 40, "#8f98aa");
                c.save();
                c.translate(350, 90);
                c.rotate((now / 1000) * (p.speed / 10));
                for (let i = 0; i < 4; i++) {
                    c.rotate(Math.PI / 2);
                    rect(c, -2, -16, 4, 14, "#d9dde6");
                }
                c.restore();
                // heat glow grows with power
                c.fillStyle = `rgba(255, 120, 60, ${Math.min(0.6, p.power / 60)})`;
                c.fillRect(296, 130, 108, 60);
                label(c, `${p.power.toFixed(1)} W`, 350, 165, "#f5f7ff", "center", true);
                // benchmark bars on screen
                const bars = Math.round(10 * k * Math.min(1.5, p.speed / SPEED_TARGET));
                for (let i = 0; i < bars; i++) {
                    rect(c, 58 + i * 18, 130 - i * 7, 12, 14 + i * 7, i < 10 ? "#54e0c7" : "#ffd84a");
                }
                label(c, `V_DD = ${vdd.toFixed(1)} V`.replace("V_DD", "VDD"), 58, 56, "#f5f7ff", "left", true);
                label(c, `speed ${p.speed.toFixed(0)} / need ${SPEED_TARGET}`, 58, 72, p.speed >= SPEED_TARGET ? "#5be38a" : "#ff9aa6");
            }
            vEl = ui.wireSlider("pcV", (v) => v.toFixed(1), () => stats());
            stats();

            $("pcGo").addEventListener("click", () => {
                if (busy) {
                    return;
                }
                busy = true;
                const vdd = Number(vEl.value);
                const p = perf(md, vdd);
                runStages(m, "pcCvCap", [
                    { caption: `Booting at V<sub>DD</sub> = ${vdd.toFixed(1)} V…`, dur: 3000, draw: (k, now) => draw(k * 0.2, now, vdd, p) },
                    { caption: !md.alive ? "The screen stays dark: the transistors don't switch." : p.speed < SPEED_TARGET ? "The benchmark crawls: the transistors are too slow at this voltage." : "Running the benchmark. Watch the fan and the heat: power rises with V<sub>DD</sub>².", dur: 6000, draw: (k, now) => draw(md.alive ? k : 0, now, vdd, p) }
                ], () => {
                    const defs = [];
                    if (!md.alive) {
                        defs.push(defect("major", "The computer won't boot: the transistors don't work."));
                    } else if (p.speed < SPEED_TARGET) {
                        defs.push(defect("major", `At ${vdd.toFixed(1)} V the computer misses its speed target (${p.speed.toFixed(0)} of ${SPEED_TARGET}).`));
                    } else if (best && vdd > best.v + 0.15) {
                        defs.push(defect("minor", `It meets the target, but ${vdd.toFixed(1)} V wastes power. Around ${best.v.toFixed(1)} V does the same job with ${Math.round((1 - p.eff / best.eff) * 100)}% less energy per task.`.replace("% less", "% less")));
                    }
                    ms().data.vdd = vdd;
                    ms().data.eff = p.eff;
                    completeStep(defs, "", () => finishBatch(md, vdd, p, best));
                });
            });
        }

        function finishBatch(md, vdd, p, best) {
            const s = ms();
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
            api.awardSiteXP("metalbatch", 200);
            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">COMPUTER REPORT</p>
                    <h2>🔩 Dr. MOS's Computer</h2>
                    <p class="adv-stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
                    ${xp ? `<p class="adv-xp-big">+${xp} XP</p>` : ""}
                    <ul class="adv-stats" style="justify-content:center">
                        <li>Gate oxide <strong>${md.tox} nm</strong></li>
                        <li>Gate length <strong>${md.L.toFixed(1)} µm</strong></li>
                        <li>V<sub>th</sub> <strong>${md.alive ? md.vth.toFixed(2) + " V" : "–"}</strong></li>
                        <li>V<sub>DD</sub> <strong>${vdd.toFixed(1)} V</strong></li>
                        <li>Work per watt <strong>${p.eff.toFixed(2)}</strong>${best ? ` (best ${best.eff.toFixed(2)} at ${best.v.toFixed(1)} V)` : ""}</li>
                    </ul>
                    <div class="adv-takeaway">
                        ${defs.length ? defs.map((d) => `<p>${d.sev === "major" ? "⚠️" : "•"} ${d.cause}</p>`).join("") : "<p>A flawless transistor, tuned to the sweet spot!</p>"}
                    </div>
                    <p class="adv-calib">👻 <strong>${s.boss ? "Rematch!" : "Boss unlocked!"}</strong> Something is draining power from the giant transistor statue in the plaza…</p>
                    <button type="button" class="adv-btn" data-close>Back to the city</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
            api.afterModal(() => api.say([
                md.alive && p.speed >= SPEED_TARGET ? "It boots! And it sips power. That's the efficiency I was after." : "Not quite there, but now we know what to fix in the next batch.",
                "Wait… the lights on the transistor statue are flickering. Something is stealing current even when everything's switched off. It's The Leakage Phantom!"
            ], "Dr. MOS"));
        }


        /* ---------- Boss: The Leakage Phantom ---------- */

        function drawPhantom(c, ox, oy, s, t) {
            const px = (x, y, w, h, col) => rect(c, ox + x * s, oy + y * s, w * s, h * s, col);
            const bob = Math.sin(t / 400) * 2;
            px(6, 30, 20, 2, "rgba(0,0,0,0.25)");
            c.fillStyle = "rgba(190, 220, 255, 0.85)";
            c.beginPath();
            c.moveTo(ox + 6 * s, oy + (28 + bob) * s);
            c.lineTo(ox + 6 * s, oy + (13 + bob) * s);
            c.arc(ox + 16 * s, oy + (13 + bob) * s, 10 * s, Math.PI, 0);
            c.lineTo(ox + 26 * s, oy + (28 + bob) * s);
            for (let i = 0; i < 5; i++) {
                const x = 26 - i * 5;
                c.lineTo(ox + (x - 2.5) * s, oy + (25 + bob + (i % 2) * 2) * s);
                c.lineTo(ox + (x - 5) * s, oy + (28 + bob) * s);
            }
            c.closePath();
            c.fill();
            px(11, 11 + bob, 3, 4, "#1a2033");
            px(18, 11 + bob, 3, 4, "#1a2033");
            px(13, 19 + bob, 6, 2, "#1a2033");
            // leaking electrons
            for (let i = 0; i < 4; i++) {
                const ph = ((t / 900) + i / 4) % 1;
                c.fillStyle = "#7fb2ff";
                c.beginPath();
                c.arc(ox + (8 + i * 5) * s, oy + (28 + ph * 6 + bob) * s, 1.4 * s, 0, Math.PI * 2);
                c.fill();
            }
        }

        const PHANTOM_QS = {
            oxide: [
                { q: "Why are gate oxides grown in dry O₂ instead of steam?", a: ["Dry oxide is denser with better electrical quality", "Dry oxide grows faster", "Steam can't oxidize silicon", "Dry oxide is a conductor"], why: "Steam is faster, so it's used for thick isolation oxide." },
                { q: "Thermal oxide growth slows down because…", a: ["Oxygen must diffuse through the oxide already grown", "The furnace cools off", "Silicon runs out", "Oxide reflects heat"], why: "Thickness grows roughly as √time once it's thick." },
                { q: "What happens if a gate oxide is too thin?", a: ["Electrons tunnel through it and the gate leaks", "The transistor gets slower", "It turns into metal", "Nothing at all"], why: "That's why modern chips switched to high-k dielectrics like HfO₂." },
                { q: "About what fraction of a thermal oxide lies below the original silicon surface?", a: ["About 44%", "0%", "100%", "About 10%"], why: "The oxide is made from the wafer's own silicon." }
            ],
            gate: [
                { q: "Why is the source/drain implant called self-aligned?", a: ["The gate itself blocks the ions, so S/D line up with its edges", "A robot aligns it", "It uses a second mask", "The ions are magnetic"], why: "The gate goes down first and masks its own channel." },
                { q: "What does an etch endpoint signal tell you?", a: ["The film being etched has cleared", "The plasma is off", "The wafer is cool", "The resist is gone"], why: "The plasma's glow changes when the etched material runs out." },
                { q: "Why not over-etch a gate for a long time?", a: ["It eats through the thin gate oxide", "It makes the gate taller", "It deposits metal", "It's always fine"], why: "Polysilicon etches fast, but oxide isn't infinitely resistant." },
                { q: "What does a shorter gate length do?", a: ["Makes the transistor switch faster", "Makes it slower", "Raises the supply voltage", "Nothing"], why: "Carriers have less distance to cross." }
            ],
            doping: [
                { q: "An n-channel MOSFET's source and drain are…", a: ["n⁺ regions in p-type silicon", "p⁺ regions in p-type silicon", "Metal pads", "Oxide"], why: "Opposite type to the well, forming p–n junctions." },
                { q: "Which dopant makes silicon n-type?", a: ["Phosphorus", "Boron", "Oxygen", "Aluminum"], why: "Phosphorus has one extra valence electron." },
                { q: "Why anneal after implanting?", a: ["To move dopants into lattice sites and heal damage", "To grow oxide", "To remove the gate", "To cool the wafer"], why: "Only dopants in lattice sites are electrically active." },
                { q: "Why use rapid thermal anneal instead of a long furnace bake?", a: ["Short heat activates dopants without letting them spread", "It's colder", "It adds dopants", "It's quieter"], why: "Spreading under the gate shortens the channel." }
            ],
            device: [
                { q: "What is the threshold voltage V_th?".replace("V_th", "Vth"), a: ["The gate voltage where a conducting channel forms", "The highest safe voltage", "The supply voltage", "The breakdown voltage"], why: "Below it the transistor is off." },
                { q: "Switching power in a chip grows with…", a: ["The square of the supply voltage", "The cube root of voltage", "Nothing: it's constant", "Only the temperature"], why: "P ≈ C·V²·f." },
                { q: "For the most work per watt, set the supply voltage…", a: ["As low as possible while still meeting the speed target", "As high as possible", "Below the threshold voltage", "Randomly"], why: "Lower V saves power, but too close to Vth is too slow." },
                { q: "Why avoid gold and copper touching bare silicon?", a: ["They diffuse in and create leaky traps", "They're too cheap", "They don't conduct", "They're magnetic"], why: "Copper wiring needs a barrier layer; gold is kept out of CMOS fabs." }
            ]
        };

        function phantomBattle() {
            const rematch = ms().boss;
            return {
                foeName: "The Leakage Phantom",
                foeTag: "Off-state current · Lv 11",
                foeSize: 32,
                fieldClass: "adv-field-metal",
                drawFoe: (c, t) => drawPhantom(c, 0, 0, 1, t),
                foeMax: 210,
                foePower: 0.86,
                meMax: 140,
                moves: [
                    { type: "oxide", name: "Dry Oxide", mult: 1.75, label: "Gate oxide", icon: "🔥", special: "dep", cls: "dep", effect: "Direct hit! A dense, clean oxide leaves it nowhere to tunnel." },
                    { type: "gate", name: "Self-Align", mult: 1.5, label: "Gate patterning", icon: "📐", special: "etch", cls: "etch", effect: "It's effective! A perfectly placed gate shuts the channel tight." },
                    { type: "doping", name: "Rapid Anneal", mult: 1, label: "Doping", icon: "💡", special: "litho", cls: "litho", effect: "Crisp junctions keep the current where it belongs." },
                    { type: "device", name: "Curve Tracer", mult: 0.5, focus: true, label: "Device physics", icon: "📈", special: "inspect", cls: "inspect", effect: "You found exactly where it leaks. Your next hit does 1.5× damage!" }
                ],
                questions: PHANTOM_QS,
                attacks: [
                    { name: "Tunnel Through", text: "Electrons tunneled through your gate!" },
                    { name: "Subthreshold Drain", text: "It sipped current while your transistor was off!" },
                    { name: "Hot Spot", text: "Wasted power turned into heat!" }
                ],
                intro: [
                    "The transistor statue flickers… It's <strong>The Leakage Phantom</strong>!",
                    "It drains power even when every switch is off. Answer MOSFET questions to seal it away!"
                ],
                runText: "You backed off. The Leakage Phantom keeps draining…",
                loseTitle: "The Leakage Phantom drained you",
                loseTip: "Tip: The Leakage Phantom is weak to <strong>Dry Oxide</strong> and <strong>Self-Align</strong>. <strong>Curve Tracer</strong> first makes your next hit 1.5× stronger.",
                winLines: rematch ? ["The Leakage Phantom fades again!", "Off means off. Rematch won!"] : ["The Leakage Phantom fades away!", "📜 Dr. MOS hands you the Metal City Certificate of Completion!"],
                onWin: () => {
                    const s = ms();
                    const first = !s.boss;
                    s.boss = true;
                    s.bossUp = false;
                    api.save().badges.metal = true;
                    api.writeSave();
                    api.updateHud();
                    api.gainXP(first ? 150 : 25);
                    if (first) {
                        api.awardSiteXP("metalboss", 150);
                    }
                    api.afterModal(() => api.say(first ? [
                        "Gone! Off finally means off.",
                        "Every phone and laptop fights that phantom: billions of transistors, each leaking a tiny bit. Good oxides, clean junctions and the right voltage keep it in check. Here's your Metal City Certificate of Completion!",
                        "Next stop: Ion City, down the road south of Fab Valley. Dr. Carbon builds sensors that feel ions."
                    ] : ["Faded again! Build another batch and it'll be back."], "Dr. MOS"));
                    return `
                        <div class="adv-complete">
                            <p class="eyebrow">LEAK SEALED</p>
                            <h2>${first ? "📜 Certificate of Completion" : "👻 Rematch Won"}</h2>${first ? api.certificate("metal") : ""}
                            <p class="adv-xp-big">+${first ? 150 : 25} XP</p>
                            <div class="adv-takeaway">
                                <p>Leakage current flows even when a transistor is off: through a too-thin gate oxide, under a not-quite-off channel, or across leaky junctions.</p>
                                <p>With billions of transistors per chip it adds up, which is why chips use high-k gate oxides, lower supply voltages and power gating.</p>
                            </div>
                            <button type="button" class="adv-btn" data-close>Back to the plaza</button>
                        </div>`;
                }
            };
        }


        /* ---------- Recipe card ---------- */

        function openRecipe() {
            const s = ms();
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
                ${api.head("metal", "Dr. MOS's Recipe")}
                <p class="adv-lead">An n-channel MOSFET, then Dr. MOS's computer tuned for the most work per watt. Each station shows Dr. MOS's card. Bring a wafer and RCA chemicals (Silicon Beach), S1813 (Foundry) and dopant (Silicon Beach); silane and aluminum are in the MOS Fab stockroom.${s.best ? ` Best batch: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}` : ""}</p>
                <div class="adv-button-row" style="margin-bottom:8px"><button type="button" class="adv-btn secondary" data-close>Close</button></div>
                ${html}`);
        }

        api.registerRecipe({
            id: "metal",
            scenes: ["metal", "mosfab", "moslab"],
            available: () => ms().recipe,
            open: openRecipe,
            label: "Dr. MOS's MOSFET computer (10 steps)",
            progress: () => ms().step,
            total: STEPS.length,
            restart: resetRun
        });


        /* ---------- Tools ---------- */

        const TOOLS = {
            wet: { name: "Wet Bench", open: openWet },
            furnace: { name: "Oxidation Furnace", open: openFurnace },
            lpcvd: { name: "LPCVD Furnace", open: openLpcvd },
            aligner: { name: "Mask Aligner", open: openAligner },
            etcher: { name: "Plasma Etcher", open: openEtcher },
            implanter: { name: "Ion Implanter", open: openImplanter },
            rta: { name: "Rapid Thermal Anneal", open: openRta },
            sputter: { name: "Sputter Tool", open: openSputter },
            probe: { name: "Probe Station", open: openProbe },
            computer: { name: "Dr. MOS's Computer", open: openComputer }
        };

        function useTool(tool) {
            const s = ms();
            if (!s.recipe) {
                api.say([`The ${TOOLS[tool].name}.`, "Dr. MOS runs things in Metal City. Talk to Dr. MOS for the recipe."]);
                return;
            }
            const st = STEPS[s.step];
            if (!st) {
                api.say([`The ${TOOLS[tool].name}.`, "This batch is done. Talk to Dr. MOS to build another."]);
                return;
            }
            if (st.tool !== tool) {
                api.say([`The ${TOOLS[tool].name}.`, `Your recipe says the next step is: ${st.name}.`, `That happens at the ${st.where}. Press R to read the recipe.`]);
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

        function tool(id, label2, x, y, w, h, draw) {
            return {
                kind: "mt-" + id,
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
            wet(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#c9cfdb");
                rect(c, X + 4, Y + 5, 10, 7, "rgba(127, 178, 255, 0.7)");
                rect(c, X + 18, Y + 5, 10, 7, "rgba(200, 255, 200, 0.6)");
                rect(c, X + 32, Y + 5, 10, 7, "rgba(255, 216, 120, 0.7)");
            },
            furnace(c, X, Y, W, H) {
                api.box(X + 2, Y, W - 4, H, "#5d6577");
                rect(c, X + 6, Y + 8, W - 12, 10, "rgba(255, 150, 60, 0.55)");
                rect(c, X + 8, Y + 22, W - 16, 3, "#a9b2d0");
            },
            lpcvd(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#aab3c4");
                rect(c, X + 4, Y + 5, W - 8, 6, "rgba(208, 138, 74, 0.7)");
            },
            aligner(c, X, Y, W, H) {
                api.box(X + 2, Y + 6, W - 4, H - 6, "#c9cfdb");
                rect(c, X + W / 2 - 3, Y - 4, 6, 14, "#3b4458");
                rect(c, X + 6, Y + 14, W - 12, 4, "#e87ad8");
            },
            etcher(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#3b4458");
                rect(c, X + 5, Y + 4, W - 10, 8, `rgba(201, 127, 224, ${0.5 + 0.3 * Math.sin(t / 180)})`);
            },
            implanter(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#8f98aa");
                rect(c, X + 4, Y + 6, W - 8, 3, "#1a2033");
                const x = X + 4 + ((t / 10) % (W - 8));
                rect(c, x, Y + 6, 3, 3, "#7fb2ff");
            },
            rta(c, X, Y, W, H, t) {
                api.box(X, Y + 2, W, H - 2, "#5d6577");
                rect(c, X + 4, Y + 5, W - 8, 6, `rgba(255, 220, 140, ${0.4 + 0.3 * Math.sin(t / 300)})`);
            },
            sputter(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#aab3c4");
                rect(c, X + 8, Y + 4, W - 16, 4, "#d9dde6");
                rect(c, X + 6, Y + 10, W - 12, 2, "#1a2033");
            },
            probe(c, X, Y, W, H) {
                api.box(X + 2, Y + 6, W - 4, H - 6, "#3b4458");
                dot(c, X + W / 2, Y + 16, 6, "#9aa6bb");
                rect(c, X + 6, Y + 2, 2, 12, "#d9dde6");
                rect(c, X + W - 8, Y + 2, 2, 12, "#d9dde6");
            },
            computer(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 2, W - 20, H - 10, "#1a2033");
                rect(c, X + 5, Y + 5, W - 26, H - 16, ms().boss ? "#0e3a3a" : "#0e1a2b");
                rect(c, X + 7, Y + 8, (W - 30) * ((t / 2000) % 1), 2, "#54e0c7");
                api.box(X + W - 14, Y + 2, 12, H - 4, "#3b4458");
            }
        };

        function drawTransistor(c, X, Y, W, H, t) {
            // a giant three-legged transistor statue: source, gate, drain
            rect(c, X + 4, Y + H - 4, W - 8, 4, "rgba(0,0,0,0.25)");
            api.box(X + 6, Y + 6, W - 12, 14, "#3b4458");
            rect(c, X + 9, Y + 9, W - 18, 3, "#cfe8ff");
            rect(c, X + W / 2 - 6, Y + 2, 12, 7, "#d08a4a");
            [X + 10, X + W / 2 - 1, X + W - 12].forEach((x) => rect(c, x, Y + 20, 3, H - 24, "#d9dde6"));
            const on = (Math.sin(t / 600) + 1) / 2 > 0.5;
            rect(c, X + 9, Y + 13, W - 18, 3, on ? "#4a8cff" : "#24365a");
            c.fillStyle = "#f5f7ff";
            c.font = "bold 6px sans-serif";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("S", X + 11, Y + H - 2);
            c.fillText("G", X + W / 2, Y + H - 2);
            c.fillText("D", X + W - 10, Y + H - 2);
        }

        function drawCarrier(c, X, Y, t, kind) {
            const bob = Math.round(Math.sin(t / 260 + X) * 1);
            const cx = X + 8;
            const cy = Y + 8 + bob;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.22)");
            dot(c, cx, cy, 6.5, "#1a2033");
            if (kind === "hole") {
                dot(c, cx, cy, 5.5, "#ffb84a");
                dot(c, cx, cy, 3, "#1a2033");
            } else if (kind === "al") {
                dot(c, cx, cy, 5.5, "#d9dde6");
            } else {
                dot(c, cx, cy, 5.5, "#7fb2ff");
            }
            rect(c, cx - 3, cy - 3, 2, 2, kind === "hole" ? "#ffffff" : "#1a2033");
            rect(c, cx + 1, cy - 3, 2, 2, kind === "hole" ? "#ffffff" : "#1a2033");
            c.fillStyle = "#1a2033";
            c.font = "bold 7px sans-serif";
            c.textAlign = "center";
            c.textBaseline = "middle";
            if (kind !== "hole") {
                c.fillText(kind === "al" ? "Al" : "e⁻", cx, cy + 3);
            }
        }

        function plateTile(c, x, y) {
            const X = x * TILE;
            const Y = y * TILE;
            rect(c, X, Y, TILE, TILE, "#b8c0cf");
            rect(c, X, Y, TILE, 1, "#9aa3b5");
            rect(c, X, Y, 1, TILE, "#9aa3b5");
            rect(c, X + 2, Y + 2, 1, 1, "#7d869a");
            rect(c, X + 13, Y + 2, 1, 1, "#7d869a");
            rect(c, X + 2, Y + 13, 1, 1, "#7d869a");
            rect(c, X + 13, Y + 13, 1, 1, "#7d869a");
            if ((x * 3 + y * 5) % 7 === 0) {
                // a little circuit trace
                rect(c, X + 4, Y + 8, 8, 1, "#d9a441");
                rect(c, X + 11, Y + 5, 1, 4, "#d9a441");
                rect(c, X + 10, Y + 4, 3, 2, "#d9a441");
            }
        }


        /* ---------- Scenes ---------- */

        api.SCENES.metal = {
            id: "metal",
            label: "Metal City",
            outdoor: true,
            grid: [
                "TTTTTTTTTTTTTTTTTTTT",
                "T..f.............f.T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBBBB..BBBBBB..T",
                "T.BBBBDBB..BBBDBB..T",
                "T.....p.......p....T",
                "T.ppppppppppppp....T",
                "T.........p........T",
                "T..mmmmmmmmmmmmmm..T",
                "T..mmmmmmmmmmmmmm..T",
                "T..mmmmmmmmmmmmmm..T",
                "T.........p......f.T",
                "T.f.......p........T",
                "TTTTTTTTTTpTTTTTTTTT"
            ],
            drawTile: (c, x, y, ch, t) => {
                if (ch === "m") {
                    plateTile(c, x, y);
                } else {
                    api.drawWorldTile(x, y, ch, t);
                }
            },
            edges: {
                down: { scene: "world", x: 10, y: 0 }
            },
            buildings: [
                { id: "mosfab", sign: "MOS FAB", x: 2, y: 2, w: 7, h: 4, door: { x: 6, y: 5 }, wall: "#e3e7ee", roof: "#5d6577", locked: () => false },
                { id: "moslab", sign: "DR. MOS LAB", x: 11, y: 2, w: 6, h: 4, door: { x: 14, y: 5 }, wall: "#e8f0ff", roof: "#3d6fd8", locked: () => false }
            ],
            npcs: [
                {
                    id: "drmos", name: "Dr. MOS", x: 8, y: 6, dir: "down",
                    look: { suit: "#e3e7ee", accent: "#d08a4a", visor: "#4a8cff" },
                    talk: mosTalk
                },
                {
                    id: "eddie", name: "Electron Eddie", x: 4, y: 11, dir: "down",
                    draw: (c, X, Y, t) => drawCarrier(c, X, Y, t, "e"),
                    talk: () => ["Zoom! I'm an electron. In an n-channel MOSFET, I'm the one carrying the current from source to drain.", "Put enough positive voltage on the gate and it pulls a thin layer of us up under the oxide. That layer is the channel!"]
                },
                {
                    id: "holly", name: "Hole Holly", x: 15, y: 10, dir: "down",
                    draw: (c, X, Y, t) => drawCarrier(c, X, Y, t, "hole"),
                    talk: () => ["I'm a hole: a missing electron that acts like a positive charge. p-type silicon is full of us.", "In a p-channel MOSFET I carry the current. CMOS chips pair n- and p-channel transistors so almost no current flows when they're idle."]
                },
                {
                    id: "al", name: "Al the Aluminum Atom", x: 12, y: 12, dir: "down",
                    draw: (c, X, Y, t) => drawCarrier(c, X, Y, t, "al"),
                    talk: () => ["Hi, I'm aluminum! For decades I was the wiring in every chip.", "Copper conducts better, so modern chips use it for most wires, but it needs a barrier layer so it doesn't wander into the silicon. I just need a gentle sinter."]
                }
            ],
            objects: [
                api.bag.pickup({ id: "metal-al", item: "altarget", x: 17, y: 8, text: "A heavy disc sparkles by the path: a spare aluminum sputter target!" }),
                {
                    kind: "transistor", x: 6, y: 9, w: 3, h: 2, draw: drawTransistor, prompt: "A: Look",
                    active: () => !ms().bossUp,
                    label: "Transistor statue",
                    lines: ["A giant MOSFET statue: three legs for the source, gate and drain. The blue stripe is the channel, flickering on and off.", "A modern chip holds billions of these, each far smaller than a bacterium."]
                },
                {
                    kind: "phantom", x: 6, y: 9, w: 3, h: 2,
                    active: () => !!ms().bossUp,
                    draw: (c, X, Y, W, H, t) => {
                        drawTransistor(c, X, Y, W, H, t);
                        drawPhantom(c, X + 8, Y - 20, 1, t);
                        const bob = Math.round(Math.sin(t / 250) * 2);
                        rect(c, X + 36, Y - 30 + bob, 9, 11, "#1a2033");
                        rect(c, X + 37, Y - 29 + bob, 7, 9, "#ffd84a");
                        c.fillStyle = "#1a2033";
                        c.font = "bold 8px sans-serif";
                        c.textAlign = "center";
                        c.textBaseline = "middle";
                        c.fillText("!", X + 40.5, Y - 24 + bob);
                    },
                    prompt: "A: Battle The Leakage Phantom",
                    use: () => api.say(["The transistor statue flickers, and a pale shape drifts out of its channel…", "Get ready to battle!"], "", () => api.openBattle(phantomBattle()))
                }
            ]
        };

        api.SCENES.mosfab = {
            id: "mosfab",
            label: "MOS Fab",
            grid: api.interiorRows(),
            floor: "#e6e9f0",
            tint: "rgba(255, 200, 40, 0.06)",
            exitTo: { scene: "metal", x: 6, y: 6 },
            objects: [
                tool("wet", "Wet bench", 1, 2, 3, 1, D.wet),
                tool("furnace", "Oxidation", 5, 2, 2, 2, D.furnace),
                tool("lpcvd", "LPCVD", 8, 2, 3, 1, D.lpcvd),
                tool("aligner", "Aligner", 12, 2, 2, 2, D.aligner),
                tool("etcher", "Plasma etch", 15, 2, 3, 1, D.etcher),
                tool("implanter", "Implanter", 1, 7, 3, 1, D.implanter),
                tool("rta", "RTA", 6, 7, 3, 1, D.rta),
                tool("sputter", "Sputter", 11, 7, 3, 1, D.sputter),
                api.bag.stockroom({ label: "MOS Fab stockroom", items: ["silane", "altarget"], x: 15, y: 7 })
            ],
            npcs: [
                { id: "mostech", name: "Tech Gatey", x: 9, y: 10, dir: "down", look: { suit: "#e3e7ee", accent: "#4a8cff", visor: "#ffd84a" }, talk: () => ["Welcome to the MOS Fab! Every station follows Dr. MOS's card.", "Bring a wafer and RCA chemicals from Silicon Beach, and S1813 from the Foundry. Silane and aluminum targets are on our shelf in the corner."] }
            ]
        };

        api.SCENES.moslab = {
            id: "moslab",
            label: "Dr. MOS's Lab",
            grid: api.interiorRows(),
            floor: "#e3e8f0",
            exitTo: { scene: "metal", x: 14, y: 6 },
            objects: [
                tool("probe", "Probe station", 4, 2, 3, 2, D.probe),
                tool("computer", "New computer", 11, 2, 4, 2, D.computer),
                {
                    kind: "oldpc", x: 2, y: 8, w: 3, h: 2, label: "Old computer", prompt: "A: Look",
                    draw: (c, X, Y, W, H) => { api.box(X + 2, Y + 2, W - 4, H - 4, "#8f98aa"); rect(c, X + 8, Y + 8, W - 16, 8, "#ff6b7d"); },
                    lines: ["Dr. MOS's old computer. It runs hot and loud, wasting most of its power as heat.", "\"Same work, a fraction of the watts. That's the goal,\" says a sticky note."]
                }
            ],
            npcs: [
                { id: "drmoslab", name: "Dr. MOS", x: 9, y: 9, dir: "down", look: { suit: "#e3e7ee", accent: "#d08a4a", visor: "#4a8cff" }, talk: mosTalk }
            ]
        };

        function mosTalk() {
            const s = ms();
            const name = api.currentChar() ? api.currentChar().name : "engineer";
            if (!s.recipe) {
                return {
                    lines: [
                        `${name}! Welcome to Metal City. I'm Dr. MOS, as in metal–oxide–semiconductor.`,
                        "I'm building a new computer, and I want it to do the most work for every watt. That starts with the transistor: the MOSFET.",
                        "A metal (or polysilicon) gate, a whisper-thin oxide, and the silicon underneath. Put voltage on the gate and a channel opens; take it away and the switch is off.",
                        "We'll build one in the MOS Fab, test it in my lab, then tune my computer's supply voltage. Every station has my card.",
                        "📋 Recipe added! Press R or tap Recipe any time. You'll need a wafer, RCA chemicals and dopant from Silicon Beach, and S1813 from the Foundry."
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
                    return ["The Leakage Phantom is haunting the transistor statue in the plaza! Go!"];
                }
                return {
                    lines: [`Your best batch: ${"★".repeat(s.best)}${"☆".repeat(3 - s.best)}. Want to build another?`, "I'll reset the line for you."],
                    done: () => {
                        resetRun();
                        api.toast("Fresh batch: back to step 1");
                    }
                };
            }
            const st = STEPS[s.step];
            return [`Next step: ${st.name}.`, `It's at the ${st.where}. My card there has the settings.`];
        }

        // Split the lab into bays: these stations get their own building.
        api.addBay({
            outdoor: "metal", from: "mosfab",
            id: "mosmetals", sign: "METALS", label: "Metal City · Implant & Metal Bay",
            kinds: ["mt-implanter", "mt-rta", "mt-sputter"],
            x: 16, y: 9, w: 3, h: 2, door: { x: 17, y: 10 },
            wall: "#e3e7ee", roof: "#8f98aa",
            currentKind: () => {
                const st = STEPS[ms().step];
                return ms().recipe && st ? "mt-" + st.tool : null;
            }
        });


        // Microscopes: a cross-section of the transistor as it's built.
        function mosView(n) {
            const id = STEPS[n - 1].id;
            const gate = [[0.4, 0.6]];
            const etched = n >= 5;
            const layers = [{ name: "p-type silicon", color: "#6f7890", h: 120 }];
            if (n >= 2) {
                layers.push({ name: "Gate oxide (SiO₂)", color: "#9fd3e8", h: 5, seg: etched ? gate : undefined });
            }
            if (n >= 3) {
                layers.push({ name: "Polysilicon", color: "#c98a4b", h: 24, seg: etched ? gate : undefined });
            }
            if (id === "litho") {
                layers.push({ name: "Photoresist", color: "#e05a8a", h: 16, seg: gate });
            }
            if (n >= 6) {
                layers.push(n >= 7
                    ? { name: "n⁺ source and drain (activated)", color: "#4fc3a1", h: 20, inset: true, seg: [[0.1, 0.4], [0.6, 0.9]] }
                    : { name: "Implanted phosphorus (crystal damaged)", color: "#b06fd8", h: 20, inset: true, seg: [[0.1, 0.4], [0.6, 0.9]] });
            }
            if (n >= 8) {
                layers.push({ name: "Aluminum contacts", color: "#d7dde6", h: 16, seg: [[0.16, 0.3], [0.44, 0.56], [0.7, 0.84]] });
            }
            const CAP = {
                clean: "A clean p-type silicon wafer. The transistor's channel will form right at this surface.",
                oxide: "A thin gate oxide, about 10 nm, grown on top. It's the insulator between the gate and the channel.",
                poly: "Polysilicon deposited over the oxide. It will become the gate electrode.",
                litho: "Photoresist patterned into a 1 µm line where the gate goes.",
                etch: "The plasma etch removed the poly and oxide wherever the resist didn't cover them. With the resist stripped, the gate stack stands alone.",
                implant: "Phosphorus implanted on both sides of the gate. The gate blocks the ions, so the source and drain line up with it on their own (self-aligned).",
                anneal: "The anneal activated the phosphorus: n⁺ source and drain on either side of the p-type channel under the gate.",
                metal: "Aluminum contacts on the source, gate and drain. It's a working n-channel MOSFET.",
                test: "The probe needles land on these three pads to measure the Id–Vg curve.",
                computer: "Your finished transistor, the building block of Dr. MOS's computer."
            };
            return { layers: layers, caption: CAP[id] };
        }

        api.addScope({
            type: "metal", title: "Dr. MOS's Microscope",
            places: [["mosfab", 17, 1], ["mosmetals", 17, 1], ["moslab", 17, 1]],
            steps: STEPS, state: ms, view: mosView
        });

    });

})();
