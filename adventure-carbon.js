/* ========================================
   FAB VALLEY ADVENTURE: ION CITY (scene id "carbon")
   The second town, south of Fab Valley.
   Dr. Carbon's recipe for a glassy carbon
   ISFET gate: clean, dehydration bake, O2
   plasma, SU-8 spin, soft bake, expose,
   PEB, develop, inspect, pyrolyse.

   Process numbers follow the MicroChem
   SU-8 2000 (2000.5-2015) datasheet.
   Pyrolysis shrinkage and conductivity match
   the teaching values in lab-engine.js.

   Choices are recorded quietly at each tool;
   the defects they cause show up under the
   microscope, like in a real fab.
======================================== */

(function () {

    "use strict";

    window.FabAdventureExtensions = window.FabAdventureExtensions || [];

    window.FabAdventureExtensions.push(function (api) {

        const TILE = api.TILE;
        const rect = api.rect;
        const $ = (id) => document.getElementById(id);

        api.TYPES.carbon = { label: "Carbon MEMS", icon: "⬡" };


        /* ---------- Datasheet (SU-8 2000.5-2015) ---------- */

        // Product number is the film thickness in µm at about 3000 rpm.
        const GRADES = [
            { id: "2002", name: "SU-8 2002", t3000: 2 },
            { id: "2005", name: "SU-8 2005", t3000: 5 },
            { id: "2010", name: "SU-8 2010", t3000: 10 },
            { id: "2015", name: "SU-8 2015", t3000: 15 }
        ];

        // [up to thickness µm, min, max]; gaps in the datasheet's
        // ranges are rounded to the nearest row.
        const SOFT_BAKE = [[2.5, 1, 1], [5.5, 2, 2], [15.5, 2, 3], [25.5, 3, 4], [99, 4, 5]];
        const DOSE = [[2.5, 60, 80], [5.5, 90, 105], [15.5, 110, 140], [25.5, 140, 150], [99, 150, 160]];
        const PEB = [[2.5, 1, 2], [5.5, 2, 3], [15.5, 3, 4], [25.5, 4, 5], [99, 5, 6]];
        const DEVELOP = [[5.5, 1, 1], [15.5, 2, 3], [25.5, 3, 4], [99, 4, 5]];

        function lookup(table, th) {
            const row = table.find((r) => th <= r[0]) || table[table.length - 1];
            return { min: row[1], max: row[2] };
        }

        const LAMP = 10; // aligner lamp intensity, mW/cm²
        const TARGET_UM = 5;

        // share of SU-8 thickness kept, conductivity vs 1000 °C (lab-engine.js)
        const PYRO = {
            600: { keep: 0.35, sigma: 0.003 },
            700: { keep: 0.28, sigma: 0.03 },
            800: { keep: 0.24, sigma: 0.2 },
            900: { keep: 0.21, sigma: 0.55 },
            1000: { keep: 0.2, sigma: 1 },
            1100: { keep: 0.19, sigma: 1.3 }
        };


        /* ---------- Recipe ---------- */

        /*
           Five phases on one wafer. Glassy carbon follows the SU-8
           datasheet. The lift-off resist follows the AZ nLOF 2020
           datasheet (110 °C bakes, ~65 mJ/cm², AZ 300 MIF). The
           polyimide numbers are Dr. Carbon's lab card (teaching
           values, cured at 250 °C).
        */
        const PHASES = {
            gc: "Glassy carbon electrodes",
            pi1: "Polyimide insulation",
            metal: "Metal current collectors (lift-off)",
            pi2: "Polyimide passivation",
            release: "Release from the wafer"
        };

        const PI_SPIN = [
            { id: "pi", name: "Polyimide (photo-definable)", t3000: 5 },
            { id: "nlof", name: "AZ nLOF 2020", t3000: 2 }
        ];

        const LOR_SPIN = [
            { id: "nlof", name: "AZ nLOF 2020", t3000: 2 },
            { id: "s1813", name: "S1813 (positive resist)", t3000: 1.5 }
        ];

        function piSteps(n) {

            const tag = "pi" + n;
            const blocked = n === 1 ? "covered" : "pads";
            const opens = n === 1
                ? "the openings over the carbon electrodes and contact pads"
                : "the openings over the electrodes and the gold contact pads";

            return [
                {
                    id: tag + "spin", phase: tag, tool: "spin", short: "Spin polyimide",
                    name: "Spin photo-definable polyimide at 3000 rpm (~5 µm)", where: "spin coater in the Ion Lab",
                    cfg: {
                        title: "Spin Coater: Polyimide",
                        lead: n === 1
                            ? "Polyimide is a tough, flexible plastic. It will insulate the carbon traces and become the body of the finished device. Aim for about 5 µm at 3000 rpm."
                            : "A second polyimide layer seals the metal traces, so only the electrodes and contact pads touch the outside world. Aim for about 5 µm at 3000 rpm.",
                        options: PI_SPIN,
                        correct: "pi",
                        target: 5,
                        tol: 0.75,
                        wrong: () => defect("leak", "major", "AZ nLOF 2020 is a temporary lift-off resist, not a permanent insulator. It softens in solvents and lets electrolyte through."),
                        off: (th) => th < 5
                            ? defect("leak", "minor", `A ${th} µm polyimide film is thin enough for pinholes to go all the way through.`)
                            : defect(blocked, "minor", `A ${th} µm polyimide film is thick, so the small openings didn't fully clear.`)
                    }
                },
                {
                    id: tag + "bake", phase: tag, tool: "hot", short: "Soft bake",
                    name: "Soft bake polyimide at 90 °C for 3 min", where: "hotplate in the Ion Lab",
                    cfg: {
                        mode: "simple",
                        title: "Hotplate: Polyimide Soft Bake",
                        lead: "Dry the solvent out of the polyimide so it can touch the mask, without starting to cure it.",
                        T: 90, min: 3, max: 4,
                        under: (T, t) => defect("leak", "minor", `The polyimide soft bake (${t} min at ${T} °C) left solvent behind. The tacky film stuck to the mask and tore small holes.`),
                        over: (T, t) => defect(blocked, "major", `Baking the polyimide at ${T} °C for ${t} min started curing it, so the unexposed areas wouldn't dissolve in the developer.`)
                    }
                },
                {
                    id: tag + "expose", phase: tag, tool: "align", short: "Expose",
                    name: `Align to the ${n === 1 ? "carbon" : "metal"} and expose (~200 mJ/cm²)`, where: "mask aligner in the Ion Lab",
                    cfg: {
                        dose: [150, 250],
                        offset: 12,
                        rot: 4,
                        what: `This polyimide is negative tone: light crosslinks it, so the dark spots on the mask become ${opens}.`,
                        overlay: (sev) => defect("leak", sev, "The polyimide openings landed off-center and uncovered the edges of the traces next to them."),
                        under: (sev, dose) => defect("leak", sev, `${dose} mJ/cm² was too little light to crosslink the polyimide all the way through, so the developer thinned it and left pinholes.`),
                        over: (sev, dose) => defect(blocked, sev, `${dose} mJ/cm² was so much light that it scattered under the mask's dark spots and partly closed the openings.`)
                    }
                },
                {
                    id: tag + "dev", phase: tag, tool: "dev", short: "Develop",
                    name: "Develop in PA-401D for 2 min, rinse in PA-400R", where: "developer bench in the Ion Lab",
                    cfg: {
                        title: "Developer Bench: Polyimide",
                        lead: "Dissolve the unexposed polyimide to open the windows, then rinse in PA-400R and dry with N<sub>2</sub>.",
                        options: [
                            { id: "pa401", label: "PA-401D (polyimide developer)", ok: true },
                            { id: "mif", label: "AZ 300 MIF (TMAH)", nothing: "Nothing dissolved. This polyimide develops in a solvent developer, not a watery TMAH one." },
                            { id: "su8dev", label: "SU-8 developer", nothing: "Hardly anything dissolved. Use the developer made for this polyimide." },
                            { id: "acetone", label: "Acetone", damage: () => defect("leak", "major", "Acetone attacked the exposed polyimide too, leaving it thin and full of pinholes.") }
                        ],
                        min: 2,
                        max: 3,
                        rinse: "Rinsing in PA-400R…",
                        cue: "<strong>The openings still look cloudy after the rinse.</strong> There's undeveloped polyimide left in them.",
                        residue: () => defect(blocked, "minor", "Undeveloped polyimide was left in some of the openings.")
                    }
                },
                {
                    id: tag + "cure", phase: tag, tool: "furnace", short: "Cure",
                    name: "Cure (anneal) the polyimide at 250 °C in N₂ for 1 h", where: "tube furnace in the Furnace & Metal Bay",
                    cfg: { mode: "cure" }
                }
            ];
        }

        const STEPS = [
            { id: "clean", phase: "gc", tool: "wet", short: "Clean", name: "Clean the wafer", where: "wet bench in the Ion Lab" },
            { id: "dehydrate", phase: "gc", tool: "hot", short: "Dehydration bake", name: "Dehydration bake at 150 °C for 3 min", where: "hotplate in the Ion Lab" },
            { id: "plasma", phase: "gc", tool: "plasma", short: "O₂ plasma", name: "O₂ plasma for 1 min", where: "plasma asher in the Ion Lab" },
            { id: "spin", phase: "gc", tool: "spin", short: "Spin coat", name: "Spin coat SU-8 at 3000 rpm for a ~5 µm film (grade: datasheet)", where: "spin coater in the Ion Lab" },
            { id: "softbake", phase: "gc", tool: "hot", short: "Soft bake", name: "Soft bake at 95 °C (time: datasheet)", where: "hotplate in the Ion Lab" },
            { id: "expose", phase: "gc", tool: "align", short: "Expose", name: "Align to the wafer marks and expose (dose: datasheet)", where: "mask aligner in the Ion Lab" },
            { id: "peb", phase: "gc", tool: "hot", short: "Post-exposure bake", name: "Post-exposure bake at 95 °C (time: datasheet)", where: "hotplate in the Ion Lab" },
            { id: "develop", phase: "gc", tool: "dev", short: "Develop", name: "Develop in SU-8 developer (time: datasheet), rinse in IPA", where: "developer bench in the Ion Lab" },
            { id: "inspect", phase: "gc", tool: "scope", short: "Inspect", name: "Inspect the pattern under the microscope", where: "microscope in the Ion Lab" },
            { id: "pyro", phase: "gc", tool: "furnace", short: "Pyrolyse", name: "Pyrolyse into glassy carbon (inert gas, ≤5 °C/min, 900–1000 °C, 1 h hold)", where: "tube furnace in the Furnace & Metal Bay" }
        ].concat(piSteps(1), [
            {
                id: "lorspin", phase: "metal", tool: "spin", short: "Spin lift-off resist",
                name: "Spin AZ nLOF 2020 lift-off resist at 3000 rpm (~2 µm)", where: "spin coater in the Ion Lab",
                cfg: {
                    title: "Spin Coater: Lift-off Resist",
                    lead: "The metal traces are made by lift-off: pattern a sacrificial resist, coat metal over everything, then dissolve the resist so the metal on top of it lifts away. Aim for about 2 µm.",
                    options: LOR_SPIN,
                    correct: "nlof",
                    target: 2,
                    tol: 0.3,
                    wrong: () => defect("short", "major", "S1813 is a positive resist with sloped sidewalls. Lift-off needs the overhanging (undercut) edge that a negative lift-off resist like nLOF gives, so metal stayed bridged across the edges."),
                    off: (th) => defect("short", "minor", `A ${th} µm lift-off layer is off target. Too thin and the metal bridges the gaps; too thick and fine lines blur.`)
                }
            },
            {
                id: "lorbake", phase: "metal", tool: "hot", short: "Soft bake",
                name: "Soft bake the lift-off resist at 110 °C for 1 min", where: "hotplate in the Ion Lab",
                cfg: {
                    mode: "simple",
                    title: "Hotplate: Lift-off Resist Soft Bake",
                    lead: "Dry the lift-off resist before exposure. The nLOF datasheet uses 110 °C for 60 s.",
                    T: 110, min: 1, max: 1.5,
                    under: (T, t) => defect("short", "minor", `The lift-off resist was still soft after ${t} min at ${T} °C. It stuck to the mask and the trace edges smeared together.`),
                    over: (T, t) => defect("short", "minor", `Over-baking the lift-off resist (${t} min at ${T} °C) made it develop slowly, and it lost its undercut.`)
                }
            },
            {
                id: "lorexpose", phase: "metal", tool: "align", short: "Expose",
                name: "Align to the carbon and expose (~65 mJ/cm²)", where: "mask aligner in the Ion Lab",
                cfg: {
                    dose: [55, 80],
                    offset: 12,
                    rot: 4,
                    what: "nLOF is negative tone too: lit areas stay, and the dark trace shapes on the mask wash away to become the metal pattern.",
                    overlay: (sev) => defect("open", sev, "The metal traces landed off the carbon contact pads, so some electrodes aren't connected."),
                    under: (sev, dose) => defect("short", sev, `${dose} mJ/cm² underexposed the nLOF. The weakly crosslinked resist thinned in the developer, and metal landed where it shouldn't.`),
                    over: (sev, dose) => defect("short", sev, `${dose} mJ/cm² overexposed the nLOF and shrank its undercut, so the metal didn't break cleanly at the edges.`)
                }
            },
            {
                id: "lorpeb", phase: "metal", tool: "hot", short: "Post-exposure bake",
                name: "Post-exposure bake at 110 °C for 1 min", where: "hotplate in the Ion Lab",
                cfg: {
                    mode: "simple",
                    title: "Hotplate: nLOF Post-Exposure Bake",
                    lead: "For nLOF, this bake does the crosslinking. The datasheet says 110 °C for 60 s, right after exposure.",
                    T: 110, min: 1, max: 1.5,
                    under: (T, t) => defect("short", "major", `A ${t} min bake at ${T} °C didn't crosslink the exposed nLOF, so much of it washed away in the developer.`),
                    over: (T, t) => defect("short", "minor", `Over-baking the nLOF (${t} min at ${T} °C) crosslinked it so much that the undercut shrank.`)
                }
            },
            {
                id: "lordev", phase: "metal", tool: "dev", short: "Develop",
                name: "Develop in AZ 300 MIF for 1–2 min, rinse in DI water", where: "developer bench in the Ion Lab",
                cfg: {
                    title: "Developer Bench: Lift-off Resist",
                    lead: "Open up the trace pattern. A little extra time deepens the undercut that makes lift-off work.",
                    options: [
                        { id: "mif", label: "AZ 300 MIF (TMAH)", ok: true },
                        { id: "su8dev", label: "SU-8 developer", nothing: "Nothing dissolved. nLOF develops in watery TMAH developers like AZ 300 MIF." },
                        { id: "pa401", label: "PA-401D", nothing: "Nothing happened. That developer is for polyimide." },
                        { id: "acetone", label: "Acetone", damage: () => defect("short", "major", "Acetone stripped most of the lift-off resist, so the metal will coat everything.") }
                    ],
                    min: 1,
                    max: 2,
                    rinse: "Rinsing in DI water…",
                    cue: "<strong>There's still a scum of resist in the open areas.</strong> Metal won't stick well on that.",
                    residue: () => defect("peel", "minor", "Resist scum was left under the metal, so it stuck poorly.")
                }
            },
            {
                id: "metal", phase: "metal", tool: "metal", short: "Deposit metal",
                name: "E-beam evaporate 20 nm Ti + 200 nm Au at ~1 Å/s, below 5×10⁻⁶ Torr", where: "metal evaporator in the Furnace & Metal Bay"
            },
            {
                id: "liftoff", phase: "metal", tool: "wet", short: "Lift-off",
                name: "Lift off the extra metal in an NMP-based remover", where: "wet bench in the Ion Lab"
            }
        ], piSteps(2), [
            {
                id: "release", phase: "release", tool: "wet", short: "Release",
                name: "Soak in DI water, then peel the device off the wafer", where: "wet bench in the Ion Lab"
            }
        ]);

        const LOOKS = {
            particles: "Specks and pinholes in the film",
            lifting: "Pattern lifting or peeling at the edges",
            smear: "Smeared, distorted features",
            residue: "White residue between features",
            cracks: "Cracks running through the film",
            overlay: "Pattern shifted off the alignment marks",
            wide: "Features wider than drawn, rounded corners",
            thickness: "Film color is off (wrong thickness)",
            rough: "Hazy, roughened surface",
            streaks: "Streaks radiating from the wafer center"
        };

        // What later-phase problems do to the finished device.
        const EFFECTS = {
            leak: "Leaky insulation",
            covered: "Electrode openings not cleared",
            pads: "Contact pads not opened",
            short: "Shorted traces",
            open: "Broken connection",
            peel: "Metal peeling",
            highR: "High trace resistance",
            swell: "Under-cured polyimide",
            corrode: "Corrosion-prone metal",
            blister: "Blistered polyimide",
            resist: "Less conductive carbon"
        };

        function labelOf(d) {
            return LOOKS[d.look] || EFFECTS[d.look] || "";
        }

        function defect(look, sev, cause) {
            return { look: look, sev: sev, cause: cause };
        }

        function cs() {
            const s = api.save();
            if (!s.carbon) {
                s.carbon = { recipe: false, step: 0, defects: {}, data: {}, best: 0, stepXp: {}, runs: 0 };
            }
            return s.carbon;
        }

        function currentStep() {
            return STEPS[cs().step];
        }

        function isCurrentTool(tool) {
            const c = cs();
            return c.recipe && STEPS[c.step] && STEPS[c.step].tool === tool;
        }

        function allDefects() {
            const c = cs();
            return STEPS.reduce((list, st) => list.concat(c.defects[st.id] || []), []);
        }

        function resetRun() {
            const c = cs();
            c.step = 0;
            c.defects = {};
            c.data = {};
            c.runs++;
            api.writeSave();
        }

        function thickness() {
            return cs().data.thickness || TARGET_UM;
        }


        /* ---------- Shared station UI ---------- */

        function esc(s) {
            return String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
        }

        /*
           Dr. Carbon's notes: the settings for each step, shown at
           the top of every station. SU-8 values follow the datasheet
           for a ~5 µm film; the aligner lamp gives 10 mW/cm², so
           time (s) = dose ÷ 10.
        */
        function piNotes(n) {
            const what = n === 1 ? "insulation" : "passivation";
            return {
                spin: [`Photo-definable polyimide at <strong>3000 rpm</strong> gives about <strong>5 µm</strong>: the ${what} layer.`,
                    "Use the polyimide, not nLOF. A spread step at 500 rpm first helps it coat evenly."],
                bake: ["Soft bake at <strong>90 °C for 3 min</strong> to drive off the solvent.",
                    "Too long or too hot and it starts to crosslink before you've exposed it."],
                expose: [`Line the mask up with the ${n === 1 ? "glassy carbon" : "gold metal"} below, then expose about <strong>200 mJ/cm²</strong> (about <strong>20 s</strong> on this lamp).`,
                    "This polyimide is negative: exposed areas stay, so the openings over the electrodes and pads are dark on the mask."],
                dev: ["Develop in <strong>PA-401D for 2 min</strong>, then rinse in <strong>PA-400R</strong>.",
                    "Watery developers (TMAH) and SU-8 developer won't touch it; acetone attacks it."],
                cure: ["Cure in the tube furnace: <strong>N₂</strong>, ramp <strong>≤5 °C/min</strong>, <strong>250 °C</strong>, hold <strong>1 hour</strong>, cool slowly.",
                    `Curing (annealing) turns it into tough, fully imidized polyimide. Under-cured ${what} swells in water.`]
            };
        }

        const NOTES = {
            clean: ["Solvent clean: <strong>acetone → IPA → DI water</strong>, then blow dry with N₂. (Or piranha → DI water.)",
                "<strong>Never BOE</strong> here: buffered HF dissolves oxide, and this wafer's alignment marks are etched in its oxide."],
            dehydrate: ["Bake at <strong>150 °C for 3 min</strong> to drive off water stuck to the surface.",
                "SU-8 sticks poorly to a damp wafer."],
            plasma: ["Gas: <strong>O₂</strong>. Time: <strong>1 min</strong> (about 100 W).",
                "Oxygen plasma burns off the last organic film. CF₄ would etch the oxide, and argon only knocks dirt loose."],
            spin: ["Grade: <strong>SU-8 2005</strong>. The product number is the thickness in µm at about 3000 rpm.",
                "Spin at <strong>3000 rpm for 30 s</strong> for a ~<strong>5 µm</strong> film. A 500 rpm spread step first helps."],
            softbake: ["Soft bake at <strong>95 °C for 2 min</strong> (datasheet, 5 µm film).",
                "This drives off the solvent so the film doesn't stick to the mask."],
            expose: ["Line the mask marks up with the wafer marks first.",
                "Dose: <strong>90–105 mJ/cm²</strong> (datasheet, 5 µm). On this 10 mW/cm² lamp that's <strong>9–10.5 s</strong>.",
                "SU-8 is negative: exposed areas crosslink and stay."],
            peb: ["Post-exposure bake at <strong>95 °C for 2–3 min</strong> (datasheet, 5 µm).",
                "This finishes crosslinking the exposed areas. Skip it and the pattern washes away."],
            develop: ["Develop in <strong>SU-8 developer for about 1 min</strong> (datasheet, 5 µm), then rinse in <strong>IPA</strong>.",
                "A white haze in the IPA rinse means it's underdeveloped: put it back for a bit longer."],
            inspect: ["Look closely for specks, lifting edges, cracks, leftover film and misalignment.",
                "Name what you see honestly: defects carry through to the finished sensor."],
            pyro: ["Gas: <strong>inert</strong> (N₂, argon or forming gas), never air: oxygen would burn the carbon away.",
                "Ramp <strong>≤5 °C/min</strong> to <strong>900–1000 °C</strong>, hold <strong>1 hour</strong>, cool slowly.",
                "The SU-8 shrinks to about a fifth of its thickness and becomes conductive glassy carbon."],
            lorspin: ["Resist: <strong>AZ nLOF 2020</strong> at <strong>3000 rpm</strong> for about <strong>2 µm</strong>.",
                "nLOF is made for lift-off: it develops with an undercut, so the metal breaks cleanly at the edges."],
            lorbake: ["Soft bake at <strong>110 °C for 1 min</strong> (nLOF datasheet)."],
            lorexpose: ["Align to the glassy carbon, then expose about <strong>65 mJ/cm²</strong> (about <strong>6.5 s</strong> on this lamp).",
                "nLOF is negative: the metal traces and pads must be the dark areas of the mask."],
            lorpeb: ["Post-exposure bake at <strong>110 °C for 1 min</strong>. This step is what makes nLOF crosslink."],
            lordev: ["Develop in <strong>AZ 300 MIF for 1–2 min</strong>, then rinse in <strong>DI water</strong>.",
                "Not acetone: it strips the resist you need."],
            metal: ["E-beam evaporate <strong>20 nm Ti</strong> (it makes the gold stick), then <strong>200 nm Au</strong>.",
                "Rate about <strong>1 Å/s</strong>, after pumping below <strong>5×10⁻⁶ Torr</strong>."],
            liftoff: ["Soak in an <strong>NMP-based remover</strong>: at least <strong>20 min</strong>, or <strong>10 min</strong> with the ultrasonic bath.",
                "The resist dissolves and takes the extra gold with it. Acetone can't fully dissolve crosslinked nLOF."],
            release: ["Soak in <strong>DI water</strong> for at least <strong>15 min</strong>, then peel the device off slowly.",
                "Never peel dry and fast: glassy carbon is brittle. BOE would dissolve the Ti adhesion layer."]
        };
        [1, 2].forEach((n) => {
            const p = piNotes(n);
            Object.keys(p).forEach((k) => {
                NOTES["pi" + n + k] = p[k];
            });
        });

        function stepBadge() {
            const c = cs();
            const st = STEPS[c.step];
            const notes = st && NOTES[st.id];
            return `<p class="adv-round">Recipe step ${c.step + 1} of ${STEPS.length}</p>`
                + (notes ? `<div class="adv-card"><p class="adv-card-title">📋 Dr. Carbon's notes</p><ul>${notes.map((x) => `<li>${x}</li>`).join("")}</ul></div>` : "");
        }

        function chips(name, options, selected) {
            return `<div class="adv-chips" role="radiogroup" aria-label="${esc(name)}">` + options.map((o) => `
                <button type="button" class="adv-chip${o.id === selected ? " on" : ""}" role="radio"
                    aria-checked="${o.id === selected}" data-chip="${esc(name)}" data-val="${esc(o.id)}">${o.label}</button>`).join("") + "</div>";
        }

        function wireChips(name, onPick) {
            const btns = api.modalBody().querySelectorAll(`[data-chip="${name}"]`);
            btns.forEach((b) => {
                b.addEventListener("click", () => {
                    btns.forEach((x) => {
                        x.classList.toggle("on", x === b);
                        x.setAttribute("aria-checked", x === b);
                    });
                    onPick(b.dataset.val);
                });
            });
        }

        function slider(id, labelText, unit, min, max, step, value) {
            return `
                <label for="${id}">${labelText}: <strong id="${id}Out">${value}</strong> ${unit}</label>
                <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">`;
        }

        function wireSlider(id, fmt, onChange) {
            const el = $(id);
            const out = $(id + "Out");
            const update = () => {
                out.textContent = fmt ? fmt(Number(el.value)) : el.value;
                if (onChange) {
                    onChange(Number(el.value));
                }
            };
            el.addEventListener("input", update);
            update();
            return el;
        }

        function result(id, html, good) {
            const el = $(id);
            el.className = "adv-result" + (good === true ? " good" : good === false ? " bad" : "");
            el.innerHTML = html;
        }

        function animate(m, dur, frame, done) {
            const start = performance.now();
            const tick = (now) => {
                if (m.dead) {
                    return;
                }
                const k = Math.min(1, (now - start) / dur);
                frame(k, now);
                if (k < 1) {
                    requestAnimationFrame(tick);
                } else if (done) {
                    done();
                }
            };
            requestAnimationFrame(tick);
        }

        // Finish the current recipe step and show a neutral summary.
        function completeStep(defs, summary) {

            const c = cs();
            const st = STEPS[c.step];

            c.defects[st.id] = defs || [];

            let xp = 0;
            if (!c.stepXp[st.id]) {
                c.stepXp[st.id] = true;
                xp = 5;
            }

            c.step++;
            const next = STEPS[c.step];
            const phaseDone = next && next.phase !== st.phase;

            if (phaseDone && !c.stepXp["phase-" + st.phase]) {
                c.stepXp["phase-" + st.phase] = true;
                xp += 15;
            }

            api.writeSave();

            if (xp) {
                api.gainXP(xp);
            }

            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">STEP ${c.step} OF ${STEPS.length} DONE</p>
                    <h2>✓ ${st.short}</h2>
                    ${phaseDone ? `<p class="adv-bonus">Phase complete: ${PHASES[st.phase]}</p>` : ""}
                    <div class="adv-takeaway">${summary}</div>
                    ${next ? `<p class="adv-lead">Next${phaseDone ? ` phase: <strong>${PHASES[next.phase]}</strong>. First` : ""}: <strong>${next.name}</strong> at the ${next.where}.</p>` : ""}
                    <button type="button" class="adv-btn" data-close>Back to the lab</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();
        }

        // Wafer as seen from above, tinted by what's on it so far.
        function waferColor() {
            const s = cs().step;
            if (s >= 22) {
                return "#c98a3a";
            }
            if (s >= 21) {
                return "#d9b44a";
            }
            if (s >= 11) {
                return "#c98a3a";
            }
            if (s >= 10) {
                return "#3a3f4b";
            }
            if (s >= 3) {
                return "#b7c96a";
            }
            return "#9aa6bb";
        }

        function drawWafer(c, cx, cy, r, color) {
            c.save();
            c.beginPath();
            c.arc(cx, cy, r, 0.35 + Math.PI / 2, Math.PI / 2 - 0.35 + Math.PI * 2);
            c.closePath();
            c.fillStyle = "#9aa6bb";
            c.fill();
            c.clip();
            if (color && color !== "#9aa6bb") {
                c.fillStyle = color;
                c.globalAlpha = 0.75;
                c.fillRect(cx - r, cy - r, r * 2, r * 2);
                c.globalAlpha = 1;
            }
            c.fillStyle = "rgba(255,255,255,0.18)";
            c.fillRect(cx - r, cy - r * 0.55, r * 2, r * 0.12);
            c.restore();
        }


        /* ---------- Station 1: wet bench ---------- */

        const BATHS = [
            { id: "acetone", label: "Acetone", color: "#cfe8ff" },
            { id: "ipa", label: "IPA", color: "#e3f6ff" },
            { id: "di", label: "DI water", color: "#9fd6ff" },
            { id: "piranha", label: "Piranha (H₂SO₄ + H₂O₂)", color: "#f2d58a" },
            { id: "boe", label: "Buffered HF (BOE)", color: "#e6e6e6" }
        ];

        function openWetBench() {

            let seq = [];
            let busy = false;

            const m = api.openModal(`
                ${api.head("carbon", "Wet Bench")}
                ${stepBadge()}
                <p class="adv-lead">Every wafer arrives with dust, oils and organic film on it. Pick the baths in order, then rinse and blow dry with N<sub>2</sub>.</p>
                <p class="adv-calib">This wafer has an oxide layer with alignment marks etched into it from an earlier step. Don't destroy them!</p>
                <div class="adv-machine">
                    <canvas id="wetCanvas" width="220" height="200"></canvas>
                    <div>
                        <p class="adv-round">Add baths in order</p>
                        <div class="adv-chips" id="wetBaths">${BATHS.map((b) => `<button type="button" class="adv-chip" data-bath="${b.id}">${b.label}</button>`).join("")}</div>
                        <p class="adv-round" style="margin-top:12px">Your sequence</p>
                        <p class="adv-seq" id="wetSeq">Nothing yet</p>
                        <div class="adv-button-row">
                            <button type="button" class="adv-btn secondary" id="wetUndo">Undo</button>
                            <button type="button" class="adv-btn" id="wetGo" data-autofocus>Run baths + N<sub>2</sub> dry</button>
                        </div>
                        <p class="adv-hint">Safety: piranha is a hot, violent oxidizer. In a real lab it needs training, a face shield and an acid apron.</p>
                        <p class="adv-result" id="wetResult" aria-live="polite"></p>
                    </div>
                </div>`);

            const cv = $("wetCanvas");
            const c = cv.getContext("2d");

            function draw(active, dip) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#1b2340";
                c.fillRect(0, 140, 220, 60);
                const list = seq.length ? seq : [];
                const n = Math.max(1, list.length);
                list.forEach((id, i) => {
                    const b = BATHS.find((bb) => bb.id === id);
                    const x = 20 + i * (180 / n) + (180 / n - 34) / 2;
                    c.fillStyle = "#d9e2f0";
                    c.fillRect(x - 2, 100, 38, 48);
                    c.fillStyle = b.color;
                    c.fillRect(x, 112, 34, 34);
                    if (i === active) {
                        c.strokeStyle = "#ffd84a";
                        c.lineWidth = 2;
                        c.strokeRect(x - 3, 99, 40, 50);
                    }
                });
                // wafer held in tweezers
                const wx = active >= 0 ? 20 + active * (180 / n) + (180 / n) / 2 : 110;
                const wy = 50 + dip * 60;
                c.fillStyle = "#8f98aa";
                c.fillRect(wx - 1, wy - 40, 2, 40);
                c.fillStyle = "#9aa6bb";
                c.fillRect(wx - 16, wy, 32, 4);
            }

            function showSeq() {
                $("wetSeq").textContent = seq.length
                    ? seq.map((id) => BATHS.find((b) => b.id === id).label).join("  →  ")
                    : "Nothing yet";
                draw(-1, 0);
            }

            api.modalBody().querySelectorAll("[data-bath]").forEach((b) => {
                b.addEventListener("click", () => {
                    if (!busy && seq.length < 6) {
                        seq.push(b.dataset.bath);
                        showSeq();
                    }
                });
            });

            $("wetUndo").addEventListener("click", () => {
                if (!busy) {
                    seq.pop();
                    showSeq();
                }
            });

            $("wetGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }

                if (!seq.length) {
                    result("wetResult", "Add at least one bath first.", false);
                    return;
                }

                busy = true;
                result("wetResult", "Running the baths…");

                let i = 0;
                const next = () => {
                    if (i >= seq.length) {
                        finish();
                        return;
                    }
                    const idx = i++;
                    animate(m, 1300, (k) => draw(idx, Math.sin(k * Math.PI)), next);
                };
                next();
            });

            function finish() {

                const defs = [];
                const has = (id) => seq.includes(id);
                const last = (id) => seq.lastIndexOf(id);

                if (has("boe")) {
                    defs.push(defect("rough", "major", "The BOE (buffered HF) dip etched the oxide, roughening the surface and eating into the alignment marks. HF has no place in a pre-resist clean here."));
                }
                if (has("piranha") && last("di") < last("piranha")) {
                    defs.push(defect("particles", "major", "Piranha was never rinsed off with DI water, so acid residue dried onto the wafer."));
                }
                if (has("acetone") && last("ipa") < last("acetone")) {
                    defs.push(defect("particles", "minor", "Acetone dried on the wafer without an IPA rinse after it. Acetone evaporates fast and leaves residue behind, which is why IPA always follows it."));
                } else if (!has("piranha") && !(has("acetone") && has("ipa"))) {
                    defs.push(defect("particles", "minor", "The clean was too weak: use acetone → IPA → DI water, or piranha → DI water as the SU-8 datasheet suggests."));
                }

                const names = seq.map((id) => BATHS.find((b) => b.id === id).label).join(" → ");
                completeStep(defs, `<p>Ran ${esc(names)}, then blew the wafer dry with nitrogen.</p><p>Any problems will show up later, under the microscope.</p>`);
            }

            showSeq();
        }


        /* ---------- Station 2: hotplate (every bake) ---------- */

        function openHotplate() {

            const st = currentStep();
            const th = thickness();
            const simple = st.cfg && st.cfg.mode === "simple";
            const info = simple ? st.cfg : {
                dehydrate: {
                    title: "Hotplate: Dehydration Bake",
                    lead: "A thin film of water clings to every wafer, and resist won't stick well on top of it. Bake it off."
                },
                softbake: {
                    title: "Hotplate: Soft Bake",
                    lead: "Drive the solvent out of the SU-8 so the film is firm enough to touch the mask. The datasheet says to use a level hotplate, not an oven."
                },
                peb: {
                    title: "Hotplate: Post-Exposure Bake",
                    lead: "Exposure made acid in the lit areas. Heat lets that acid crosslink the epoxy so those areas survive the developer."
                }
            }[st.id];

            let busy = false;
            let baked = 0;
            let plateT = 25;

            const m = api.openModal(`
                ${api.head("carbon", info.title)}
                ${stepBadge()}
                <p class="adv-lead">${info.lead}</p>
                <div class="adv-machine">
                    <canvas id="hpCanvas" width="220" height="220"></canvas>
                    <div>
                        <div class="adv-lcd"><span id="hpTemp">25</span> °C <small id="hpClock">0:00</small></div>
                        ${slider("hpSet", "Setpoint", "°C", 25, 250, 5, 25)}
                        ${slider("hpMin", "Timer", "min", 0.5, 10, 0.5, 1)}
                        <div class="adv-button-row" id="hpButtons">
                            <button type="button" class="adv-btn" id="hpGo" data-autofocus>Bake</button>
                        </div>
                        <p class="adv-result" id="hpResult" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("hpCanvas").getContext("2d");
            const setEl = wireSlider("hpSet");
            const minEl = wireSlider("hpMin", (v) => v.toFixed(1));

            function draw(waferOn) {
                c.clearRect(0, 0, 220, 220);
                c.fillStyle = "#3a4256";
                c.fillRect(10, 10, 200, 200);
                const heat = Math.min(1, Math.max(0, (plateT - 25) / 200));
                c.fillStyle = `rgb(${200 + heat * 55}, ${200 - heat * 110}, ${200 - heat * 150})`;
                c.fillRect(22, 22, 176, 176);
                if (waferOn) {
                    drawWafer(c, 110, 110, 74, waferColor());
                }
            }

            function bake(T, minutes, done) {
                busy = true;
                $("hpGo").disabled = true;
                const startT = plateT;
                // ramp the plate, then run the timer: one second per minute
                animate(m, 1200, (k) => {
                    plateT = Math.round(startT + (T - startT) * k);
                    $("hpTemp").textContent = plateT;
                    draw(k > 0.6);
                }, () => {
                    animate(m, Math.min(8000, minutes * 1000), (k) => {
                        const secs = Math.round(k * minutes * 60);
                        $("hpClock").textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
                        draw(true);
                    }, () => {
                        busy = false;
                        $("hpGo").disabled = false;
                        baked += minutes;
                        done();
                    });
                });
            }

            draw(false);

            $("hpGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }

                const T = Number(setEl.value);
                const t = Number(minEl.value);

                if (T < 40) {
                    result("hpResult", "The plate is at room temperature. Set a temperature first.", false);
                    return;
                }

                result("hpResult", "Baking…");

                bake(T, t, () => {

                    if (simple) {
                        simpleCheck(T);
                        return;
                    }

                    if (st.id === "dehydrate") {
                        const defs = [];
                        if (T < 100) {
                            defs.push(defect("lifting", "major", `The dehydration bake at ${T} °C was below boiling, so the water film never left and the SU-8 couldn't grip the wafer.`));
                        } else if (T < 140 || baked < 2.5) {
                            defs.push(defect("lifting", "minor", `The dehydration bake (${T} °C for ${baked} min) fell short of the recipe's 150 °C for 3 min, leaving some moisture behind.`));
                        }
                        completeStep(defs, `<p>Baked at ${T} °C for ${baked} min, then cooled.</p>`);
                        return;
                    }

                    if (st.id === "softbake") {
                        softBakeCheck(T);
                        return;
                    }

                    pebCheck(T);
                });
            });

            // Lab-card bakes: one target temperature and a time window.
            function simpleCheck(T) {
                const cfg = st.cfg;
                const defs = [];
                if (T < cfg.T - 5 || baked < cfg.min) {
                    defs.push(cfg.under(T, baked));
                } else if (T > cfg.T + 10 || baked > cfg.max + 2) {
                    defs.push(cfg.over(T, baked));
                }
                completeStep(defs, `<p>Baked at ${T} °C for ${baked} min, then cooled.</p>`);
            }

            function softBakeCheck(T) {

                const req = lookup(SOFT_BAKE, th);

                if (T < 85 || baked < req.min) {
                    result("hpResult", "You cool the wafer and put it back, as the datasheet suggests: <strong>the film wrinkles</strong>. There's still solvent in it.", false);
                    $("hpButtons").innerHTML = `
                        <button type="button" class="adv-btn" id="hpMore">Bake 1 more minute</button>
                        <button type="button" class="adv-btn secondary" id="hpSkip">Move on anyway</button>`;
                    $("hpMore").addEventListener("click", () => {
                        $("hpButtons").innerHTML = '<button type="button" class="adv-btn" id="hpGo" disabled>Baking…</button>';
                        result("hpResult", "Baking…");
                        bake(T, 1, () => softBakeCheck(T));
                    });
                    $("hpSkip").addEventListener("click", () => {
                        completeStep([defect("smear", "major", `The soft bake left solvent in the film (${baked} min at ${T} °C; the datasheet says ${req.min === req.max ? req.min : req.min + "–" + req.max} min at 95 °C for ~${Math.round(th)} µm). The soft film stuck to the mask and smeared.`)],
                            `<p>Soft baked at ${T} °C for ${baked} min. The film still wrinkled when cooled.</p>`);
                    });
                    return;
                }

                const defs = [];
                if (T > 105) {
                    defs.push(defect("cracks", "minor", `Soft baking at ${T} °C (the datasheet says 95 °C) built up stress in the film.`));
                } else if (baked > req.max + 3) {
                    defs.push(defect("cracks", "minor", `A ${baked} min soft bake was far longer than the datasheet's ${req.max} min, leaving the film brittle.`));
                }
                completeStep(defs, `<p>Soft baked at ${T} °C for ${baked} min. You cool it and put it back: no wrinkles, so the solvent is out.</p>`);
            }

            function pebCheck(T) {

                const req = lookup(PEB, th);
                const d = cs().data;
                const latent = T >= 85 && (d.dose || 0) >= 75;
                const defs = [];

                if (T < 85 || baked < req.min) {
                    defs.push(defect("lifting", "major", `The post-exposure bake (${baked} min at ${T} °C) was too short or too cool to finish crosslinking. The datasheet says ${req.min}–${req.max} min at 95 °C for ~${Math.round(th)} µm, so the developer undercut the pattern.`));
                } else if (T > 105) {
                    defs.push(defect("cracks", "minor", `A ${T} °C post-exposure bake (the datasheet says 95 °C) built up stress, and the film cracked.`));
                } else if (baked > req.max + 3) {
                    defs.push(defect("cracks", "minor", `A ${baked} min post-exposure bake was much longer than the datasheet's ${req.max} min, which over-stressed the film.`));
                }

                completeStep(defs, latent
                    ? `<p>Baked at ${T} °C for ${baked} min. Within seconds a faint image of the mask appeared in the film: the exposed areas are crosslinking.</p>`
                    : `<p>Baked at ${T} °C for ${baked} min. <strong>No latent image appeared.</strong> The datasheet says that means too little exposure, too little heat, or both.</p>`);
            }
        }


        /* ---------- Station 3: plasma asher ---------- */

        const GASES = [
            { id: "o2", label: "O₂", glow: "180, 200, 255" },
            { id: "ar", label: "Ar", glow: "200, 120, 255" },
            { id: "sf6", label: "SF₆", glow: "220, 230, 255" },
            { id: "cf4", label: "CF₄", glow: "120, 160, 255" }
        ];

        function openPlasma() {

            let gas = null;
            let busy = false;

            const m = api.openModal(`
                ${api.head("carbon", "Plasma Asher")}
                ${stepBadge()}
                <p class="adv-lead">A short plasma burns off the last organic film and leaves the surface eager to bond with the resist. Pick the gas, power and time.</p>
                <div class="adv-machine">
                    <canvas id="plCanvas" width="220" height="200"></canvas>
                    <div>
                        <p class="adv-round">Process gas</p>
                        ${chips("gas", GASES, null)}
                        ${slider("plPow", "RF power", "W", 50, 300, 25, 100)}
                        ${slider("plMin", "Time", "min", 0.5, 5, 0.5, 0.5)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="plGo" data-autofocus>Strike plasma</button></div>
                        <p class="adv-result" id="plResult" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("plCanvas").getContext("2d");
            const powEl = wireSlider("plPow");
            const minEl = wireSlider("plMin", (v) => v.toFixed(1));
            wireChips("gas", (v) => { gas = v; });

            function draw(glow, color) {
                c.clearRect(0, 0, 220, 200);
                c.fillStyle = "#aab3c4";
                c.fillRect(20, 20, 180, 160);
                c.fillStyle = "#1a2033";
                c.fillRect(34, 34, 152, 132);
                if (glow > 0) {
                    c.fillStyle = `rgba(${color}, ${0.25 + 0.5 * glow})`;
                    c.fillRect(34, 34, 152, 132);
                }
                drawWafer(c, 110, 120, 50, waferColor());
                c.fillStyle = "#8f98aa";
                c.fillRect(40, 150, 140, 6);
            }

            draw(0);

            $("plGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                if (!gas) {
                    result("plResult", "Pick a process gas first.", false);
                    return;
                }

                busy = true;
                const g = GASES.find((x) => x.id === gas);
                const t = Number(minEl.value);
                const P = Number(powEl.value);

                result("plResult", "Plasma on…");

                animate(m, 3200, (k, now) => draw(0.5 + 0.5 * Math.sin(now / 90) * Math.sin(k * Math.PI), g.glow), () => {

                    draw(0);
                    const defs = [];

                    if (gas === "sf6" || gas === "cf4") {
                        defs.push(defect("rough", "major", `${g.label} is a fluorine etch gas, not a cleaning gas. It etched and roughened the oxide surface. O₂ burns off organics without etching oxide.`));
                    } else if (gas === "ar") {
                        defs.push(defect("lifting", "minor", "An argon plasma only knocks contamination loose physically. It doesn't burn off organic film the way oxygen does, so adhesion suffered."));
                    } else if (t < 1) {
                        defs.push(defect("lifting", "minor", `${t} min of O₂ plasma was shorter than the recipe's 1 min, so some organic film remained.`));
                    }

                    completeStep(defs, `<p>Ran ${g.label} plasma at ${P} W for ${t} min. The chamber vents and the wafer comes out looking just the same, as plasma-treated wafers always do.</p>`);
                });
            });
        }


        /* ---------- Station 4: spin coater ---------- */

        function openSpinner() {

            const st = currentStep();
            const su8 = !st.cfg;
            const cfg = st.cfg || {
                title: "SU-8 Spin Coater",
                lead: `Dr. Carbon wants about <strong>${TARGET_UM} µm</strong> of SU-8, spun at <strong>3000 rpm</strong>. Pick the grade from the datasheet and set up the spin program.`,
                options: GRADES,
                correct: null,
                target: TARGET_UM,
                tol: 0.5
            };

            let grade = null;
            let busy = false;
            let angle = 0;
            const film = su8 ? "rgba(190, 210, 110, 0.7)" : cfg.correct === "pi" ? "rgba(214, 140, 50, 0.75)" : "rgba(220, 120, 170, 0.6)";

            const m = api.openModal(`
                ${api.head("carbon", cfg.title)}
                ${stepBadge()}
                <p class="adv-lead">${cfg.lead}</p>
                <div class="adv-machine">
                    <canvas id="scCanvas" width="220" height="220"></canvas>
                    <div>
                        <p class="adv-round">Resist bottle</p>
                        ${chips("grade", cfg.options.map((g) => ({ id: g.id, label: g.name })), null)}
                        <label class="adv-check"><input type="checkbox" id="scSpread"> Spread step first: 500 rpm for 10 s (ramp 100 rpm/s)</label>
                        ${slider("scRpm", "Spin speed (30 s, ramp 300 rpm/s)", "rpm", 500, 6000, 100, 2000)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="scGo" data-autofocus>Dispense and spin</button></div>
                        <p class="adv-result" id="scResult" aria-live="polite"></p>
                        <div class="adv-button-row" id="scAfter"></div>
                    </div>
                </div>`);

            const c = $("scCanvas").getContext("2d");
            const rpmEl = wireSlider("scRpm");
            wireChips("grade", (v) => { grade = v; });

            function draw(spread) {
                c.clearRect(0, 0, 220, 220);
                c.fillStyle = "#1b2340";
                c.beginPath();
                c.arc(110, 110, 104, 0, Math.PI * 2);
                c.fill();
                c.save();
                c.translate(110, 110);
                c.rotate(angle);
                c.translate(-110, -110);
                drawWafer(c, 110, 110, 88, waferColor());
                if (spread > 0) {
                    c.fillStyle = film;
                    c.beginPath();
                    c.arc(110, 110, 88 * spread, 0, Math.PI * 2);
                    c.fill();
                }
                c.fillStyle = "rgba(255,255,255,0.25)";
                c.fillRect(22, 108, 176, 3);
                c.restore();
            }

            draw(0);

            $("scGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                if (!grade) {
                    result("scResult", "Pick a resist bottle first.", false);
                    return;
                }

                busy = true;
                $("scAfter").innerHTML = "";
                const g = cfg.options.find((x) => x.id === grade);
                const rpm = Number(rpmEl.value);
                const spread = $("scSpread").checked;
                const th = Math.round(g.t3000 * Math.sqrt(3000 / rpm) * 10) / 10;
                let last = performance.now();

                result("scResult", "Spinning…");

                animate(m, 3000, (k, now) => {
                    angle += (now - last) / 1000 * (rpm / 3000) * 14 * Math.sin(Math.min(1, k * 1.3) * Math.PI / 2) * (k > 0.88 ? (1 - k) / 0.12 : 1);
                    last = now;
                    draw(0.15 + 0.85 * Math.min(1, k * 1.5));
                }, () => {

                    busy = false;
                    const defs = [];
                    const off = Math.abs(th - cfg.target);
                    const wrong = cfg.correct && grade !== cfg.correct;

                    if (wrong) {
                        defs.push(cfg.wrong());
                    } else if (off > cfg.tol) {
                        defs.push(su8
                            ? defect("thickness", off > 1.5 ? "major" : "minor", `The film came out ${th} µm instead of ~${TARGET_UM} µm (${g.name} at ${rpm} rpm). The carbon will be the wrong thickness too.`)
                            : cfg.off(th));
                    }
                    if (!spread) {
                        defs.push(su8
                            ? defect("streaks", "minor", "Skipping the 500 rpm spread step meant the resist didn't wet the wafer evenly before the fast spin, leaving radial streaks.")
                            : defect(cfg.correct === "pi" ? "leak" : "short", "minor", `Skipping the spread step left the ${g.name} film uneven, with thin spots near the edge.`));
                    }

                    const keep = () => {
                        if (su8) {
                            cs().data.thickness = th;
                        }
                        completeStep(defs, `<p>Coated ${th} µm of ${g.name} at ${rpm} rpm${spread ? " after a 500 rpm spread step" : ""}.</p>`);
                    };

                    const msg = `Profilometer reading: <strong>${th} µm</strong> of ${g.name}.`;

                    if (off > cfg.tol && !wrong) {
                        result("scResult", msg + ` The recipe calls for about ${cfg.target} µm.`, false);
                        $("scAfter").innerHTML = `
                            <button type="button" class="adv-btn secondary" id="scRedo">Strip and recoat</button>
                            <button type="button" class="adv-btn" id="scKeep">Keep this film</button>`;
                        $("scRedo").addEventListener("click", () => {
                            $("scAfter").innerHTML = "";
                            angle = 0;
                            draw(0);
                            result("scResult", "Stripped. Pick again and recoat.");
                        });
                        $("scKeep").addEventListener("click", keep);
                        return;
                    }

                    result("scResult", msg + (wrong ? "" : " Right on target."), wrong ? undefined : true);
                    $("scAfter").innerHTML = '<button type="button" class="adv-btn" id="scNext">Continue</button>';
                    $("scNext").addEventListener("click", keep);
                    $("scNext").focus();
                });
            });
        }


        /* ---------- Station 5: precision mask aligner ---------- */

        function openAligner() {

            const st = currentStep();
            const th = thickness();
            const cfg = st.cfg || {};
            const req = cfg.dose ? { min: cfg.dose[0], max: cfg.dose[1] } : lookup(DOSE, th);
            const doseNote = cfg.dose
                ? `The recipe card says about ${Math.round((req.min + req.max) / 2)} mJ/cm².`
                : `Check the datasheet for the dose your ~${Math.round(th)} µm film needs.`;
            let zoom = 1; // 1 = 5x objective, 3 = 20x
            let fine = false;
            let busy = false;
            let flash = 0;

            const pick = (n, min) => {
                let v;
                do {
                    v = Math.floor(Math.random() * (2 * n + 1)) - n;
                } while (Math.abs(v) < min);
                return v;
            };
            const off = { x: pick(cfg.offset || 22, 4), y: pick(cfg.offset || 22, 4), r: pick(cfg.rot || 7, 2) };

            const m = api.openModal(`
                ${api.head("carbon", "Precision Mask Aligner")}
                ${stepBadge()}
                <p class="adv-lead">Center the <strong style="color:#ff8a9a">red mask square</strong> inside the <strong style="color:#6ff0d0">green box on the wafer</strong>, in both views. Rough it in at 5×, then switch to the 20× objective and the fine knob to finish.</p>
                ${cfg.what ? `<p class="adv-lead">${cfg.what}</p>` : ""}
                <p class="adv-calib">Lamp intensity: <strong>${LAMP} mW/cm²</strong> at 365 nm. Dose (mJ/cm²) = intensity × seconds. ${doseNote}</p>
                <div class="adv-aligner">
                    <canvas id="paCanvas" width="600" height="300"></canvas>
                    <div class="adv-align-row">
                        <div class="adv-align-pad">
                            <button type="button" data-a="ccw" aria-label="Rotate counterclockwise">⟲</button>
                            <button type="button" data-a="up" aria-label="Move mask up">↑</button>
                            <button type="button" data-a="cw" aria-label="Rotate clockwise">⟳</button>
                            <button type="button" data-a="left" aria-label="Move mask left">←</button>
                            <button type="button" data-a="down" aria-label="Move mask down">↓</button>
                            <button type="button" data-a="right" aria-label="Move mask right">→</button>
                        </div>
                        <div class="adv-button-row" style="flex-direction:column">
                            <button type="button" class="adv-btn secondary" id="paZoom">Objective: 5×</button>
                            <button type="button" class="adv-btn secondary" id="paFine">Knob: coarse</button>
                        </div>
                    </div>
                    <p class="adv-keys">Keyboard: arrows move · Q / E rotate · F fine knob · Z objective</p>
                    <div style="max-width:420px;margin:12px auto 0">
                        ${slider("paSec", "Exposure time", "s", 2, 30, 0.5, 5)}
                        <p class="adv-keys" style="margin-top:-6px">Dose: <strong id="paDose">50</strong> mJ/cm²</p>
                        <div class="adv-button-row" style="justify-content:center;margin-top:8px">
                            <button type="button" class="adv-btn" id="paGo" data-autofocus>Expose</button>
                        </div>
                    </div>
                </div>`, {
                onKey: (e) => {
                    const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", KeyQ: "ccw", KeyE: "cw" };
                    if (map[e.code]) {
                        e.preventDefault();
                        act(map[e.code]);
                    } else if (e.code === "KeyF") {
                        $("paFine").click();
                    } else if (e.code === "KeyZ") {
                        $("paZoom").click();
                    }
                }
            });

            const c = $("paCanvas").getContext("2d");
            const secEl = wireSlider("paSec", (v) => v.toFixed(1), (v) => {
                $("paDose").textContent = Math.round(v * LAMP);
            });

            function view(cx, cy, mx, my, title) {

                c.save();
                c.beginPath();
                c.arc(cx, cy, 120, 0, Math.PI * 2);
                c.clip();

                c.fillStyle = waferColor();
                c.fillRect(cx - 120, cy - 120, 240, 240);
                c.fillStyle = "rgba(60, 70, 140, 0.55)";
                c.fillRect(cx - 120, cy - 120, 240, 240);

                // alignment box already on the wafer
                const outer = 30 * zoom;
                const inner = 22 * zoom;
                c.fillStyle = "#6ff0d0";
                c.fillRect(cx - outer, cy - outer, outer * 2, outer * 2);
                c.fillStyle = "#3d4a86";
                c.fillRect(cx - inner, cy - inner, inner * 2, inner * 2);

                // mask square
                const half = 14 * zoom;
                c.fillStyle = "rgba(255, 90, 110, 0.45)";
                c.strokeStyle = "#ff5a6e";
                c.lineWidth = 2;
                c.fillRect(cx + mx - half, cy + my - half, half * 2, half * 2);
                c.strokeRect(cx + mx - half, cy + my - half, half * 2, half * 2);

                if (flash > 0) {
                    c.fillStyle = `rgba(170, 110, 255, ${flash})`;
                    c.fillRect(cx - 120, cy - 120, 240, 240);
                }
                c.restore();

                c.strokeStyle = "#0b1020";
                c.lineWidth = 6;
                c.beginPath();
                c.arc(cx, cy, 121, 0, Math.PI * 2);
                c.stroke();

                c.fillStyle = "#a9b2d0";
                c.font = "bold 15px sans-serif";
                c.textAlign = "center";
                c.fillText(title, cx, cy + 112);
            }

            function draw() {
                c.clearRect(0, 0, 600, 300);
                const s = zoom;
                view(150, 145, off.x * s, (off.y - off.r) * s, "LEFT MARK");
                view(450, 145, off.x * s, (off.y + off.r) * s, "RIGHT MARK");
            }

            function act(a) {
                if (busy) {
                    return;
                }
                const step = fine ? 1 : 5;
                if (a === "up") { off.y -= step; }
                if (a === "down") { off.y += step; }
                if (a === "left") { off.x -= step; }
                if (a === "right") { off.x += step; }
                if (a === "cw") { off.r += fine ? 1 : 3; }
                if (a === "ccw") { off.r -= fine ? 1 : 3; }
                draw();
            }

            api.modalBody().querySelectorAll("[data-a]").forEach((b) => {
                b.addEventListener("click", () => act(b.dataset.a));
            });

            $("paZoom").addEventListener("click", () => {
                zoom = zoom === 1 ? 3 : 1;
                $("paZoom").textContent = "Objective: " + (zoom === 1 ? "5×" : "20×");
                draw();
            });

            $("paFine").addEventListener("click", () => {
                fine = !fine;
                $("paFine").textContent = "Knob: " + (fine ? "fine" : "coarse");
            });

            $("paGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                busy = true;

                const secs = Number(secEl.value);
                const dose = Math.round(secs * LAMP);

                animate(m, 1500, (k) => {
                    flash = k < 0.3 ? k / 0.3 * 0.7 : 0.7 * (1 - (k - 0.3) / 0.7);
                    draw();
                }, () => {

                    flash = 0;
                    draw();

                    const defs = [];
                    const miss = Math.abs(off.x) + Math.abs(off.y) + Math.abs(off.r);

                    if (miss > 0) {
                        const sev = miss > 3 ? "major" : "minor";
                        defs.push(cfg.overlay
                            ? cfg.overlay(sev)
                            : defect("overlay", sev, `The mask was exposed ${miss > 3 ? "well " : "slightly "}out of alignment, so the pattern landed off the etched marks. Switching to the 20× objective shows offsets the 5× view hides.`));
                    }
                    if (dose < req.min) {
                        const sev = dose >= req.min * 0.8 ? "minor" : "major";
                        defs.push(cfg.under
                            ? cfg.under(sev, dose)
                            : defect("lifting", sev, `${dose} mJ/cm² underexposed the film (the datasheet says ${req.min}–${req.max} mJ/cm² for ~${Math.round(th)} µm on silicon). The bottom of the film never fully crosslinked, so the developer lifted it.`));
                    } else if (dose > req.max) {
                        const sev = dose <= req.max * 1.35 ? "minor" : "major";
                        defs.push(cfg.over
                            ? cfg.over(sev, dose)
                            : defect("wide", sev, `${dose} mJ/cm² overexposed the film (the datasheet says ${req.min}–${req.max} mJ/cm²). Scattered light crosslinked resist past the mask edges, so features grew wider.`));
                    }

                    if (!cfg.dose) {
                        cs().data.dose = dose;
                    }
                    completeStep(defs, `<p>Exposed for ${secs} s at ${LAMP} mW/cm²: <strong>${dose} mJ/cm²</strong>.</p><p>The pattern is invisible for now. Baking and developing bring it out.</p>`);
                });
            });

            draw();
        }


        /* ---------- Station 6: developer bench ---------- */

        function su8DevConfig() {
            const th = thickness();
            const req = lookup(DEVELOP, th);
            return {
                title: "Developer Bench",
                lead: "Dissolve away the SU-8 that was never exposed. Then spray fresh developer for 10 s, rinse with IPA for 10 s, and dry with N<sub>2</sub>.",
                options: [
                    { id: "su8dev", label: "SU-8 developer (PGMEA)", ok: true },
                    { id: "acetone", label: "Acetone", damage: () => defect("rough", "major", "Acetone isn't an SU-8 developer. It dissolved the unexposed resist but also swelled and clouded the crosslinked pattern.") },
                    { id: "tmah", label: "AZ 726 MIF (TMAH)", nothing: "Nothing dissolved. TMAH developers are watery bases made for positive resists like AZ. SU-8 needs a solvent developer." },
                    { id: "ipa", label: "IPA", nothing: "Nothing much happened, just a milky film. IPA is the rinse, not the developer." }
                ],
                min: req.min,
                max: req.max,
                rinse: "Spraying fresh developer, then IPA…",
                cue: "<strong>A white film appears during the IPA rinse.</strong> The datasheet says that's underdeveloped resist.",
                residue: () => defect("residue", "minor", `Underdeveloped resist was left between features. The datasheet says ~${req.min}${req.max !== req.min ? "–" + req.max : ""} min for ~${Math.round(th)} µm, and more developer clears the white film.`)
            };
        }

        function openDeveloper() {

            const cfg = currentStep().cfg || su8DevConfig();
            let dev = null;
            let busy = false;
            let total = 0;
            let damage = null;

            const m = api.openModal(`
                ${api.head("carbon", cfg.title)}
                ${stepBadge()}
                <p class="adv-lead">${cfg.lead}</p>
                <div class="adv-machine">
                    <canvas id="dvCanvas" width="220" height="180"></canvas>
                    <div>
                        <p class="adv-round">Developer</p>
                        ${chips("dev", cfg.options, null)}
                        ${slider("dvMin", "Immersion time", "min", 0.25, 5, 0.25, 0.5)}
                        <label class="adv-check"><input type="checkbox" id="dvAgit"> Gentle agitation</label>
                        <div class="adv-button-row" id="dvButtons"><button type="button" class="adv-btn" id="dvGo" data-autofocus>Develop</button></div>
                        <p class="adv-result" id="dvResult" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("dvCanvas").getContext("2d");
            const minEl = wireSlider("dvMin", (v) => v.toFixed(2));
            wireChips("dev", (v) => { dev = v; });

            function draw(tilt, liquid) {
                c.clearRect(0, 0, 220, 180);
                c.save();
                c.translate(110, 110);
                c.rotate(tilt);
                c.fillStyle = "#d9e2f0";
                c.fillRect(-90, -30, 180, 60);
                c.fillStyle = liquid || "#b9dcf5";
                c.fillRect(-84, -24, 168, 48);
                c.fillStyle = waferColor();
                c.fillRect(-60, 6, 120, 8);
                c.restore();
            }

            draw(0);

            function rinse() {

                result("dvResult", cfg.rinse);

                animate(m, 1800, (k) => draw(0, k < 0.5 ? "#b9dcf5" : "#e3f6ff"), () => {

                    if (total < cfg.min) {
                        result("dvResult", cfg.cue, false);
                        $("dvButtons").innerHTML = `
                            <button type="button" class="adv-btn" id="dvMore">Back in the developer (+30 s)</button>
                            <button type="button" class="adv-btn secondary" id="dvDry">Dry it anyway</button>`;
                        $("dvMore").addEventListener("click", () => {
                            $("dvButtons").innerHTML = "";
                            const agit = $("dvAgit").checked;
                            animate(m, 1500, (k) => draw(Math.sin(k * Math.PI * (agit ? 6 : 2)) * 0.08), () => {
                                total += 0.5 * (agit ? 1 : 0.75);
                                rinse();
                            });
                        });
                        $("dvDry").addEventListener("click", () => finish(true));
                        return;
                    }

                    finish(false);
                });
            }

            function finish(residue) {
                const defs = [];
                if (damage) {
                    defs.push(damage);
                }
                if (residue) {
                    defs.push(cfg.residue());
                }
                completeStep(defs, `<p>Developed for about ${(Math.round(total * 4) / 4).toFixed(2)} min, rinsed and dried with nitrogen.${residue ? " A faint haze is still there." : " The rinse ran clear."}</p>`);
            }

            $("dvGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                if (!dev) {
                    result("dvResult", "Pick a developer first.", false);
                    return;
                }

                busy = true;
                const agit = $("dvAgit").checked;
                const t = Number(minEl.value);
                const opt = cfg.options.find((o) => o.id === dev);

                result("dvResult", "Developing…");

                animate(m, 2500, (k) => draw(Math.sin(k * Math.PI * (agit ? 8 : 2)) * 0.08), () => {

                    busy = false;

                    if (opt.nothing) {
                        result("dvResult", opt.nothing, false);
                        return;
                    }
                    if (opt.damage) {
                        damage = opt.damage();
                    }

                    total += t * (agit ? 1 : 0.75);
                    $("dvButtons").innerHTML = "";
                    rinse();
                });
            });
        }


        /* ---------- Station 7: microscope ---------- */

        function seeded(seed) {
            let s = seed * 9301 + 49297;
            return () => {
                s = (s * 9301 + 49297) % 233280;
                return s / 233280;
            };
        }

        function drawMicro(c, W, H, looks, seed) {

            const rnd = seeded(seed);
            const has = (k) => looks.includes(k);

            // oxide background
            c.fillStyle = "#4b4fa0";
            c.fillRect(0, 0, W, H);
            if (has("rough")) {
                for (let i = 0; i < 2500; i++) {
                    c.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)";
                    c.fillRect(rnd() * W, rnd() * H, 2, 2);
                }
            }
            if (has("streaks")) {
                c.strokeStyle = "rgba(255,255,255,0.12)";
                c.lineWidth = 3;
                for (let i = 0; i < 14; i++) {
                    const a = -0.2 + i * 0.12;
                    c.beginPath();
                    c.moveTo(-60, -60);
                    c.lineTo(-60 + Math.cos(a) * 700, -60 + Math.sin(a) * 700);
                    c.stroke();
                }
            }

            // etched alignment boxes in the oxide
            [[60, 60], [W - 60, 60]].forEach(([x, y]) => {
                c.strokeStyle = "#2d3070";
                c.lineWidth = 6;
                c.strokeRect(x - 22, y - 22, 44, 44);
            });

            const dx = has("overlay") ? 13 : 0;
            const dy = has("overlay") ? 9 : 0;
            const grow = has("wide") ? 5 : 0;
            const film = has("thickness") ? "#d9a24a" : "#6fc7a8";

            const shapes = [
                [60, 60, 14, 14],
                [W - 60, 60, 14, 14],
                [W / 2, H * 0.42, W * 0.27, 9],
                [W / 2, H * 0.6, 6, H * 0.18],
                [W / 2, H * 0.8, 30, 24]
            ];

            function paintShapes(color, extra, ox, oy) {
                c.fillStyle = color;
                shapes.forEach(([x, y, hw, hh]) => {
                    const r = grow ? 6 : 1;
                    roundRect(x - hw - grow - extra + dx + ox, y - hh - grow - extra + dy + oy, (hw + grow + extra) * 2, (hh + grow + extra) * 2, r);
                    c.fill();
                });
            }

            function roundRect(x, y, w, h, r) {
                c.beginPath();
                c.moveTo(x + r, y);
                c.arcTo(x + w, y, x + w, y + h, r);
                c.arcTo(x + w, y + h, x, y + h, r);
                c.arcTo(x, y + h, x, y, r);
                c.arcTo(x, y, x + w, y, r);
                c.closePath();
            }

            if (has("smear")) {
                c.globalAlpha = 0.35;
                paintShapes(film, 0, 6, 4);
                c.globalAlpha = 1;
            }

            paintShapes("#2e7a62", 2, 0, 0);
            paintShapes(film, 0, 0, 0);

            if (has("lifting")) {
                // interference fringes where the film has come loose
                const [x, y, hw, hh] = shapes[4];
                ["#ffd84a", "#ff7aa2", "#7fb2ff", "#5be38a"].forEach((col, i) => {
                    c.strokeStyle = col;
                    c.lineWidth = 2;
                    c.beginPath();
                    c.arc(x + hw + dx, y + hh + dy, 6 + i * 4, Math.PI, Math.PI * 1.5);
                    c.stroke();
                    c.beginPath();
                    c.arc(x - hw + dx, y - hh + dy, 6 + i * 4, 0, Math.PI * 0.5);
                    c.stroke();
                });
                const [fx, fy, fw] = shapes[2];
                c.fillStyle = "rgba(255, 216, 74, 0.5)";
                c.fillRect(fx + fw - 26 + dx, fy - 11 + dy, 26, 4);
            }

            if (has("cracks")) {
                c.strokeStyle = "#1a2033";
                c.lineWidth = 1.5;
                for (let i = 0; i < 6; i++) {
                    const [x, y, hw, hh] = shapes[2 + (i % 3)];
                    let px = x - hw + rnd() * hw * 2 + dx;
                    let py = y - hh + dy;
                    c.beginPath();
                    c.moveTo(px, py);
                    for (let j = 0; j < 5; j++) {
                        px += (rnd() - 0.5) * 10;
                        py += (hh * 2) / 5;
                        c.lineTo(px, py);
                    }
                    c.stroke();
                }
            }

            if (has("residue")) {
                for (let i = 0; i < 8; i++) {
                    c.fillStyle = "rgba(245, 245, 255, 0.45)";
                    c.beginPath();
                    c.ellipse(W * 0.25 + rnd() * W * 0.5, H * 0.48 + rnd() * H * 0.25, 14 + rnd() * 16, 8 + rnd() * 8, rnd() * 3, 0, Math.PI * 2);
                    c.fill();
                }
            }

            if (has("particles")) {
                for (let i = 0; i < 26; i++) {
                    const x = rnd() * W;
                    const y = rnd() * H;
                    c.fillStyle = "rgba(255,255,255,0.35)";
                    c.beginPath();
                    c.arc(x, y, 3.5, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = "#14162e";
                    c.beginPath();
                    c.arc(x, y, 2, 0, Math.PI * 2);
                    c.fill();
                }
            }
        }

        function openMicroscope() {

            const c0 = cs();
            const defs = allDefects();
            const looks = [...new Set(defs.map((d) => d.look))];
            const target = 30 + Math.floor(Math.random() * 40);
            const W = 420;
            const H = 260;
            let checked = false;

            const options = Object.keys(LOOKS);

            const m = api.openModal(`
                ${api.head("carbon", "Inspection Microscope")}
                ${stepBadge()}
                <p class="adv-lead">Before the wafer goes into the furnace, check the SU-8 pattern. Focus first, then tick everything you see.</p>
                <div class="adv-scope">
                    <canvas id="msCanvas" width="${W}" height="${H}"></canvas>
                    ${slider("msFocus", "Focus knob", "", 0, 100, 1, 0)}
                    <p class="adv-keys" id="msFocusState">Out of focus</p>
                    <fieldset class="adv-checklist" id="msList" disabled>
                        <legend>What do you see?</legend>
                        ${options.map((k) => `<label class="adv-check"><input type="checkbox" value="${k}"> ${LOOKS[k]}</label>`).join("")}
                        <label class="adv-check"><input type="checkbox" value="clean"> Nothing wrong: a clean pattern</label>
                    </fieldset>
                    <div class="adv-button-row" id="msButtons"><button type="button" class="adv-btn" id="msGo" disabled>Record inspection</button></div>
                    <div id="msReport"></div>
                </div>`);

            const view = $("msCanvas").getContext("2d");
            const sharp = document.createElement("canvas");
            sharp.width = W;
            sharp.height = H;
            drawMicro(sharp.getContext("2d"), W, H, looks, c0.runs + 3);
            const small = document.createElement("canvas");

            function render(focus) {
                const blur = Math.abs(focus - target);
                view.imageSmoothingEnabled = true;
                if (blur <= 2) {
                    view.drawImage(sharp, 0, 0);
                } else {
                    // downscale then upscale: a cheap blur that works everywhere
                    const f = Math.max(2, Math.min(24, blur / 2));
                    small.width = Math.max(4, Math.round(W / f));
                    small.height = Math.max(4, Math.round(H / f));
                    const sc = small.getContext("2d");
                    sc.imageSmoothingEnabled = true;
                    sc.drawImage(sharp, 0, 0, small.width, small.height);
                    view.drawImage(small, 0, 0, W, H);
                }
                // eyepiece vignette and reticle
                const g = view.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
                g.addColorStop(0, "rgba(0,0,0,0)");
                g.addColorStop(1, "rgba(0,0,0,0.85)");
                view.fillStyle = g;
                view.fillRect(0, 0, W, H);
                view.strokeStyle = "rgba(255,255,255,0.25)";
                view.lineWidth = 1;
                view.beginPath();
                view.moveTo(W / 2, 10);
                view.lineTo(W / 2, H - 10);
                view.moveTo(10, H / 2);
                view.lineTo(W - 10, H / 2);
                view.stroke();

                const inFocus = blur <= 4;
                $("msFocusState").textContent = inFocus ? "In focus ✓" : blur <= 12 ? "Almost…" : "Out of focus";
                if (!checked) {
                    $("msList").disabled = !inFocus;
                    $("msGo").disabled = !inFocus;
                }
            }

            wireSlider("msFocus", (v) => v, render);

            $("msGo").addEventListener("click", () => {

                checked = true;
                $("msList").disabled = true;
                $("msGo").remove();

                const picked = [...$("msList").querySelectorAll("input:checked")].map((i) => i.value);
                const spotted = looks.filter((k) => picked.includes(k));
                const missed = looks.filter((k) => !picked.includes(k));
                const false_ = picked.filter((k) => k !== "clean" && !looks.includes(k));
                const perfect = !missed.length && !false_.length && (looks.length || picked.includes("clean"));

                let html = `<div class="adv-takeaway">`;

                if (!looks.length) {
                    html += `<p><strong>Clean pattern!</strong> Straight edges, right color, nothing lifting. ${picked.includes("clean") && !false_.length ? "Your inspection was spot on." : "Nothing was actually wrong here."}</p>`;
                } else {
                    html += `<p><strong>${perfect ? "Sharp eye! You caught everything." : `You spotted ${spotted.length} of ${looks.length} problems.`}</strong></p>`;
                    defs.forEach((d) => {
                        html += `<p>${spotted.includes(d.look) ? "✓" : "✗ Missed:"} <strong>${LOOKS[d.look]}</strong> (${d.sev}). ${d.cause}</p>`;
                    });
                }
                if (false_.length) {
                    html += `<p>Not actually there: ${false_.map((k) => LOOKS[k]).join(", ")}.</p>`;
                }
                html += "</div>";

                if (perfect && !c0.stepXp.inspectEye) {
                    c0.stepXp.inspectEye = true;
                    api.gainXP(10);
                }

                $("msReport").innerHTML = html + (looks.length ? `
                    <div class="adv-button-row">
                        <button type="button" class="adv-btn" id="msFurnace">Send it to the furnace anyway</button>
                        <button type="button" class="adv-btn secondary" id="msStrip">Strip and restart the run</button>
                    </div>` : `
                    <div class="adv-button-row"><button type="button" class="adv-btn" id="msFurnace">Ready for the furnace</button></div>`);

                $("msFurnace").addEventListener("click", () => {
                    completeStep([], looks.length
                        ? "<p>Inspection logged. The wafer goes on to pyrolysis, flaws and all.</p>"
                        : "<p>Inspection logged: clean pattern. On to pyrolysis!</p>");
                });

                const strip = $("msStrip");
                if (strip) {
                    strip.addEventListener("click", () => {
                        resetRun();
                        api.afterModal(() => api.say([
                            "You strip the SU-8 and start over with a fresh wafer.",
                            "Back to step 1: clean the wafer at the wet bench. Your recipe notes still have the datasheet."
                        ], "Dr. Carbon"));
                        api.closeModal();
                    });
                }

                $("msReport").scrollIntoView({ block: "nearest", behavior: "smooth" });
            });
        }


        /* ---------- Station 8: tube furnace (pyrolysis and cures) ---------- */

        const FURNACE_GASES = [
            { id: "n2", label: "N₂", ok: true },
            { id: "fg", label: "Forming gas (N₂ + 5% H₂)", ok: true },
            { id: "ar", label: "Argon", ok: true },
            { id: "air", label: "Air", ok: false }
        ];

        function openFurnace() {

            const st = currentStep();
            const cure = !!(st.cfg && st.cfg.mode === "cure");
            const th = thickness();
            const temps = cure ? [150, 200, 250, 300, 350] : Object.keys(PYRO).map(Number);
            const TMAX = cure ? 450 : 1150;
            let gas = null;
            let peak = cure ? 150 : 800;
            let busy = false;

            const m = api.openModal(`
                ${api.head("carbon", cure ? "Tube Furnace: Polyimide Cure" : "Tube Furnace")}
                ${stepBadge()}
                <p class="adv-lead">${cure
                    ? "Curing (annealing) finishes the polyimide: heat drives off the last solvent and closes its imide rings, turning the soft film into a tough, chemically resistant insulator."
                    : "Pyrolysis: heat the SU-8 without oxygen until only carbon is left behind. Everything else leaves as gas, and the film shrinks to a fraction of its thickness."}</p>
                <p class="adv-calib">${cure
                    ? "Dr. Carbon's card: N₂, ramp ≤ 5 °C/min, 250 °C, hold 1 hour, cool slowly."
                    : "Dr. Carbon's notes: inert gas, ramp ≤ 5 °C/min, peak 900–1000 °C, hold 1 hour, cool slowly."}</p>
                <canvas id="tfCanvas" width="460" height="230" class="adv-wide-canvas"></canvas>
                <div class="adv-furnace-grid">
                    <div>
                        <p class="adv-round">Gas flow</p>
                        ${chips("fgas", FURNACE_GASES, null)}
                        <p class="adv-round" style="margin-top:12px">Peak temperature</p>
                        ${chips("peak", temps.map((t) => ({ id: String(t), label: t + " °C" })), String(peak))}
                    </div>
                    <div>
                        ${slider("tfRamp", "Ramp rate", "°C/min", 1, 20, 1, 15)}
                        ${slider("tfHold", "Hold at peak", "min", 0, 120, 15, 30)}
                        <p class="adv-keys" style="text-align:left">Run time: <strong id="tfTotal"></strong></p>
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="tfGo" data-autofocus>Start the run</button></div>
                        <p class="adv-result" id="tfResult" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("tfCanvas").getContext("2d");

            function totals() {
                const ramp = Number($("tfRamp").value);
                const hold = Number($("tfHold").value);
                const up = (peak - 25) / ramp;
                const down = (peak - 25) / 5;
                return { ramp: ramp, hold: hold, up: up, down: down, all: up + hold + down };
            }

            function showTotal() {
                const t = totals();
                $("tfTotal").textContent = `${(t.all / 60).toFixed(1)} h (heat ${Math.round(t.up)} min, hold ${t.hold} min, cool ~${Math.round(t.down)} min)`;
                draw(-1);
            }

            wireSlider("tfRamp", null, showTotal);
            wireSlider("tfHold", null, showTotal);
            wireChips("fgas", (v) => { gas = v; });
            wireChips("peak", (v) => { peak = Number(v); showTotal(); });

            // profile graph + tube with the wafer
            function draw(k, burned) {

                const t = totals();
                c.clearRect(0, 0, 460, 230);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 460, 230);

                const gx = 40;
                const gy = 20;
                const gw = 400;
                const gh = 110;
                const tx = (min) => gx + (min / t.all) * gw;
                const ty = (T) => gy + gh - (T / TMAX) * gh;

                c.strokeStyle = "#2c365a";
                c.lineWidth = 1;
                c.strokeRect(gx, gy, gw, gh);
                c.fillStyle = "#a9b2d0";
                c.font = "10px sans-serif";
                c.textAlign = "right";
                (cure ? [0, 200, 400] : [0, 500, 1000]).forEach((T) => c.fillText(T + "°", gx - 4, ty(T) + 3));

                const pts = [[0, 25], [t.up, peak], [t.up + t.hold, peak], [t.all, 25]];
                c.setLineDash([4, 4]);
                c.strokeStyle = "#54607f";
                c.beginPath();
                pts.forEach(([mm, T], i) => (i ? c.lineTo(tx(mm), ty(T)) : c.moveTo(tx(mm), ty(T))));
                c.stroke();
                c.setLineDash([]);

                let T = 25;
                if (k >= 0) {
                    const now = k * t.all;
                    c.strokeStyle = "#ff8a5c";
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(tx(0), ty(25));
                    for (let i = 1; i < pts.length; i++) {
                        const [m0, T0] = pts[i - 1];
                        const [m1, T1] = pts[i];
                        if (now >= m1) {
                            c.lineTo(tx(m1), ty(T1));
                            T = T1;
                        } else {
                            T = T0 + (T1 - T0) * ((now - m0) / (m1 - m0 || 1));
                            c.lineTo(tx(now), ty(T));
                            break;
                        }
                    }
                    c.stroke();
                }

                // tube
                const hot = Math.min(1, (T - 25) / 1000);
                c.fillStyle = `rgb(${60 + hot * 180}, ${66 + hot * 60}, ${86 - hot * 40})`;
                c.fillRect(150, 150, 160, 60);
                c.fillStyle = "rgba(220, 235, 255, 0.25)";
                c.fillRect(20, 168, 420, 24);
                c.strokeStyle = "rgba(220, 235, 255, 0.5)";
                c.strokeRect(20, 168, 420, 24);
                c.fillStyle = "#9aa6bb";
                c.fillRect(200, 184, 60, 4);

                if (cure) {
                    // pale yellow precursor deepens to amber as it imidizes
                    const p = Math.max(0, Math.min(1, (T - 100) / 150));
                    c.fillStyle = `rgb(${Math.round(240 - p * 40)}, ${Math.round(215 - p * 85)}, ${Math.round(120 - p * 80)})`;
                    c.fillRect(206, 178, 48, 6);
                } else {
                    // the film darkens and thins as it carbonizes
                    const p = burned ? 0 : Math.max(0, Math.min(1, (T - 300) / 700));
                    const keepNow = 1 - (1 - PYRO[peak].keep) * p;
                    if (!(burned && T > 400)) {
                        const g = Math.round(200 - p * 170);
                        c.fillStyle = `rgb(${Math.round(185 - p * 155)}, ${g}, ${Math.round(110 - p * 80)})`;
                        const h = Math.max(1.5, 10 * keepNow);
                        c.fillRect(214, 184 - h, 32, h);
                    }
                }

                c.fillStyle = "#f5f7ff";
                c.font = "bold 12px sans-serif";
                c.textAlign = "left";
                c.fillText(`${Math.round(T)} °C`, 330, 186);
            }

            showTotal();

            $("tfGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                if (!gas) {
                    result("tfResult", "Choose the gas flowing through the tube first.", false);
                    return;
                }

                busy = true;
                $("tfGo").disabled = true;
                const g = FURNACE_GASES.find((x) => x.id === gas);
                const t = totals();

                result("tfResult", "Furnace running… (hours of real time, sped up)");

                animate(m, 7000, (k) => draw(k, !cure && !g.ok), () => {

                    if (cure) {
                        cureCheck(t, g);
                        return;
                    }

                    if (!g.ok) {
                        showBurned();
                        return;
                    }

                    const defs = [];
                    if (t.ramp > 10) {
                        defs.push(defect("cracks", "major", `Ramping at ${t.ramp} °C/min drove the gases out of the film too fast, and it cracked and peeled as it shrank. Dr. Carbon's notes say 5 °C/min or slower.`));
                    } else if (t.ramp > 5) {
                        defs.push(defect("cracks", "minor", `A ${t.ramp} °C/min ramp was a bit fast. A few corners cracked as the film shrank.`));
                    }
                    if (t.hold < 30) {
                        defs.push(defect("resist", "minor", `Holding for only ${t.hold} min at peak left the carbon not fully converted, so its resistance is higher.`));
                    }
                    if (peak < 900) {
                        defs.push(defect("resist", "minor", `${peak} °C makes a less conductive carbon (about ${Math.round(PYRO[peak].sigma * 100)}% of the 1000 °C value). Hotter pyrolysis gives a more graphitic carbon.`));
                    }

                    showReport(defs, t, g);
                });
            });

            function cureCheck(t, g) {
                const defs = [];
                if (!g.ok) {
                    defs.push(defect("leak", "minor", "Curing in air oxidized the polyimide surface and left a more brittle film with microcracks. Cure in nitrogen."));
                }
                if (peak < 200) {
                    defs.push(defect("swell", "major", `${peak} °C is too cool to cure (imidize) the polyimide. It will soak up water and swell in the electrolyte.`));
                } else if (peak < 250) {
                    defs.push(defect("swell", "minor", `${peak} °C only partly cured the polyimide. Dr. Carbon's card says 250 °C.`));
                }
                if (t.ramp > 10) {
                    defs.push(defect("blister", "minor", `Ramping at ${t.ramp} °C/min boiled the last solvent out too fast and raised small blisters.`));
                }
                if (t.hold < 30) {
                    defs.push(defect("swell", "minor", `A ${t.hold} min hold wasn't long enough to finish the cure.`));
                }
                completeStep(defs, `<p>Cured in ${esc(g.label)} at ${peak} °C (${t.ramp} °C/min, ${t.hold} min hold). The film turned from pale yellow to a deep amber.</p>`);
            }

            function showBurned() {
                resetRun();
                api.modalBody().innerHTML = `
                    <div class="adv-complete">
                        <p class="eyebrow">RUN FAILED</p>
                        <h2>🔥 The film burned away</h2>
                        <div class="adv-takeaway">
                            <p>With air in the tube, the hot carbon reacted with oxygen and left as CO<sub>2</sub>. The wafer came out bare.</p>
                            <p>Pyrolysis only works without oxygen: nitrogen, forming gas, argon or vacuum.</p>
                        </div>
                        <button type="button" class="adv-btn" data-close>Start a new run</button>
                    </div>`;
                api.focusFirst();
                api.afterModal(() => api.say(["Oh dear, a bare wafer. Happens to every carbon chemist once!", "Start again at the wet bench. And keep the oxygen out of my furnace!"], "Dr. Carbon"));
            }

            // End of the glassy carbon phase: grade it, then carry on.
            function showReport(furnaceDefs, t, g) {

                const c1 = cs();
                const defs = allDefects().concat(furnaceDefs);
                const majors = defs.filter((d) => d.sev === "major").length;
                const stars = !defs.length ? 3 : !majors ? 2 : 1;
                const carbonUm = Math.round(th * PYRO[peak].keep * 100) / 100;
                const sigma = Math.round(2e4 * PYRO[peak].sigma);
                const firstBadge = !api.save().badges.carbon;

                let xp = 0;
                if (firstBadge) {
                    xp = 150 + stars * 25;
                } else if (stars > c1.best) {
                    xp = (stars - c1.best) * 25;
                }

                c1.best = Math.max(c1.best, stars);
                c1.defects.pyro = furnaceDefs;
                c1.data.gcPeak = peak;
                c1.data.gcStars = stars;
                c1.step++;
                api.save().badges.carbon = true;
                api.writeSave();
                api.updateHud();

                if (xp) {
                    api.gainXP(xp);
                }
                api.awardSiteXP("carbon", 150);

                const lines = defs.length
                    ? defs.map((d) => `<p>${d.sev === "major" ? "⚠️" : "•"} ${labelOf(d) ? "<strong>" + labelOf(d) + ".</strong> " : ""}${d.cause}</p>`).join("")
                    : "<p>No defects at all. A textbook run!</p>";

                const next = STEPS[c1.step];

                api.modalBody().innerHTML = `
                    <div class="adv-complete">
                        <p class="eyebrow">PHASE 1 REPORT</p>
                        <h2>⬡ Glassy Carbon Electrodes</h2>
                        <p class="adv-stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
                        ${xp ? `<p class="adv-xp-big">+${xp} XP</p>` : ""}
                        ${firstBadge ? '<p class="adv-bonus">📜 Dr. Carbon signed your Ion City Certificate of Completion!</p>' + api.certificate("carbon") : ""}
                        <ul class="adv-stats" style="justify-content:center">
                            <li>SU-8 <strong>${th} µm</strong></li>
                            <li>Carbon <strong>${carbonUm} µm</strong></li>
                            <li>Kept <strong>${Math.round(PYRO[peak].keep * 100)}%</strong> of thickness</li>
                            <li>Conductivity <strong>~${sigma.toLocaleString()} S/m</strong></li>
                            <li>${esc(g.label)}, ${t.ramp} °C/min, ${peak} °C, ${t.hold} min hold</li>
                        </ul>
                        <div class="adv-takeaway">
                            ${lines}
                            <p>These carbon pads become the sensing gates of the ISFET. Next they need insulation, metal wiring and a second insulation layer before the device comes off the wafer.</p>
                        </div>
                        <p class="adv-lead">Next phase: <strong>${PHASES[next.phase]}</strong>. First step: ${next.name}.</p>
                        <button type="button" class="adv-btn" data-close>Back to the lab</button>
                    </div>`;
                api.modalBody().scrollTop = 0;
                api.focusFirst();

                api.afterModal(() => api.say([
                    stars === 3 ? "Three-star carbon! Lovely." : `${stars} star${stars === 1 ? "" : "s"} for the carbon. We'll keep going and see how the device turns out.`,
                    "Now we build the rest of the device on top: polyimide insulation, gold wiring by lift-off, a second polyimide layer, then we peel it off the wafer.",
                    "Next up: spin the polyimide."
                ], "Dr. Carbon"));
            }
        }


        /* ---------- Station 9: metal evaporator ---------- */

        const METHODS = [
            { id: "ebeam", label: "E-beam evaporation" },
            { id: "sputter", label: "Sputtering" }
        ];

        const ADHESION = [
            { id: "none", label: "None" },
            { id: "ti", label: "Titanium (Ti)" },
            { id: "cr", label: "Chromium (Cr)" }
        ];

        const METAL_CHOICES = [
            { id: "au", label: "Gold (Au)" },
            { id: "pt", label: "Platinum (Pt)" },
            { id: "al", label: "Aluminum (Al)" }
        ];

        function torr(p) {
            if (p >= 1) {
                return String(Math.round(p));
            }
            const e = Math.floor(Math.log10(p));
            const mant = (p / Math.pow(10, e)).toFixed(1);
            return `${mant}×10<sup>${e}</sup>`;
        }

        function openMetal() {

            let method = null;
            let adh = null;
            let metal = null;
            let pressure = 760;
            let pumping = false;
            let busy = false;
            let glow = 0;
            let qcm = 0;

            const m = api.openModal(`
                ${api.head("carbon", "Metal Evaporator")}
                ${stepBadge()}
                <p class="adv-lead">An electron beam melts metal in a crucible under high vacuum. The vapor flies in straight lines and coats the wafer hanging above. For lift-off that matters: metal lands on the resist tops and the floor but not in the shadowed undercut, so the two pieces stay separate.</p>
                <p class="adv-calib">Recipe card: 20 nm Ti adhesion layer, then 200 nm Au, at about 1 Å/s, after pumping below 5×10<sup>−6</sup> Torr.</p>
                <div class="adv-machine">
                    <canvas id="mtCanvas" width="220" height="240"></canvas>
                    <div>
                        <div class="adv-lcd"><span id="mtP">760</span> <small>Torr</small></div>
                        <div class="adv-button-row" style="margin-bottom:12px">
                            <button type="button" class="adv-btn secondary" id="mtPump">Pump down</button>
                        </div>
                        <p class="adv-round">Method</p>
                        ${chips("method", METHODS, null)}
                        <p class="adv-round">Adhesion layer</p>
                        ${chips("adh", ADHESION, null)}
                        ${slider("mtAdh", "Adhesion layer", "nm", 0, 50, 5, 0)}
                        <p class="adv-round">Main metal</p>
                        ${chips("metal", METAL_CHOICES, null)}
                        ${slider("mtThick", "Metal thickness", "nm", 50, 500, 25, 100)}
                        ${slider("mtRate", "Deposition rate", "Å/s", 0.5, 10, 0.5, 5)}
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="mtGo" data-autofocus>Deposit</button></div>
                        <p class="adv-result" id="mtResult" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("mtCanvas").getContext("2d");
            const adhEl = wireSlider("mtAdh");
            const thickEl = wireSlider("mtThick");
            const rateEl = wireSlider("mtRate", (v) => v.toFixed(1));
            wireChips("method", (v) => { method = v; });
            wireChips("adh", (v) => { adh = v; });
            wireChips("metal", (v) => { metal = v; });

            function draw(now) {
                c.clearRect(0, 0, 220, 240);
                c.fillStyle = "#0b1020";
                c.fillRect(0, 0, 220, 240);
                // bell jar
                c.strokeStyle = "#8f98aa";
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(25, 220);
                c.lineTo(25, 50);
                c.quadraticCurveTo(110, -10, 195, 50);
                c.lineTo(195, 220);
                c.stroke();
                rect(c, 15, 220, 190, 8, "#5d6577");
                // wafer hanging face down
                rect(c, 70, 52, 80, 4, waferColor());
                rect(c, 108, 40, 4, 12, "#8f98aa");
                // crucible
                rect(c, 90, 196, 40, 14, "#5d6577");
                c.fillStyle = glow > 0 ? `rgba(255, ${170 + glow * 60}, 80, ${0.5 + glow * 0.5})` : "#8f98aa";
                c.beginPath();
                c.ellipse(110, 196, 16, 5, 0, 0, Math.PI * 2);
                c.fill();
                // vapor travels in straight lines
                if (glow > 0) {
                    c.strokeStyle = `rgba(255, 220, 140, ${0.25 * glow})`;
                    c.lineWidth = 1;
                    for (let i = 0; i < 9; i++) {
                        const ph = ((now / 600) + i / 9) % 1;
                        const x = 110 + (i - 4) * 9 * ph;
                        const y = 190 - ph * 132;
                        c.beginPath();
                        c.moveTo(110 + (i - 4) * 9 * Math.max(0, ph - 0.08), 190 - Math.max(0, ph - 0.08) * 132);
                        c.lineTo(x, y);
                        c.stroke();
                    }
                }
                c.fillStyle = "#a9b2d0";
                c.font = "bold 11px sans-serif";
                c.textAlign = "left";
                c.fillText(`QCM: ${Math.round(qcm)} nm`, 34, 236 - 22);
            }

            draw(0);

            $("mtPump").addEventListener("click", () => {
                if (pumping || pressure < 1e-6) {
                    return;
                }
                pumping = true;
                $("mtPump").disabled = true;
                const start = Math.log10(pressure);
                animate(m, 9000, (k) => {
                    const lp = start - (start + 6.6) * (1 - Math.pow(1 - k, 2.2));
                    pressure = Math.pow(10, lp);
                    $("mtP").innerHTML = torr(pressure);
                }, () => {
                    pumping = false;
                });
            });

            $("mtGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                if (!method || !adh || !metal) {
                    result("mtResult", "Choose a method, an adhesion layer (or none) and a metal first.", false);
                    return;
                }
                if (pressure > 1e-3) {
                    result("mtResult", "The electron beam won't run until the chamber is under high vacuum. Pump down first.", false);
                    return;
                }

                busy = true;
                const adhT = adh === "none" ? 0 : Number(adhEl.value);
                const thick = Number(thickEl.value);
                const rate = Number(rateEl.value);
                const pAt = pressure;
                const total = adhT + thick;

                result("mtResult", `Depositing at ${torr(pAt)} Torr…`);

                animate(m, 4500, (k, now) => {
                    glow = Math.sin(k * Math.PI) * 0.6 + 0.4;
                    qcm = total * k;
                    draw(now);
                }, () => {

                    glow = 0;
                    draw(0);

                    const metalName = METAL_CHOICES.find((x) => x.id === metal).label;
                    const adhName = ADHESION.find((x) => x.id === adh).label;
                    const methodName = METHODS.find((x) => x.id === method).label;
                    const defs = [];

                    if (method === "sputter") {
                        defs.push(defect("short", "major", "Sputtered atoms arrive from every angle and coat the resist sidewalls too. The metal on top stayed joined to the metal below, so lift-off tore and left shorts."));
                    }
                    if (adh === "none") {
                        defs.push(defect("peel", "major", `${metalName} sticks poorly to polyimide and carbon on its own. Without a Ti or Cr adhesion layer, it peeled.`));
                    } else if (adhT < 5) {
                        defs.push(defect("peel", "minor", `${adhT} nm of ${adhName} is too thin to hold the film reliably.`));
                    }
                    if (metal === "al") {
                        defs.push(defect("corrode", "major", "Aluminum corrodes in salty electrolytes, especially with chloride around. Noble metals like gold or platinum survive."));
                    }
                    if (thick < 100) {
                        defs.push(defect("highR", "minor", `${thick} nm of metal is thin, so the traces have higher resistance.`));
                    }
                    if (pAt > 5e-6) {
                        const bad = pAt > 1e-4;
                        defs.push(defect(bad ? "peel" : "highR", bad ? "major" : "minor", `Depositing at ${torr(pAt)} Torr let leftover gas mix into the film (the card says below 5×10<sup>−6</sup> Torr). ${bad ? "It came out oxidized and poorly stuck." : "It came out slightly more resistive."}`));
                    }
                    if (rate > 5) {
                        defs.push(defect("highR", "minor", `At ${rate} Å/s the molten metal spat droplets, leaving a rough, grainy film.`));
                    }

                    cs().data.metal = { adh: adh, adhT: adhT, metal: metal, thick: thick };
                    completeStep(defs, `<p>Deposited ${adh === "none" ? "" : adhT + " nm " + adhName + " + "}${thick} nm ${metalName} by ${methodName} at ${rate} Å/s. The whole wafer is now coated in metal. Lift-off comes next.</p>`);
                });
            });
        }


        /* ---------- Wet bench: lift-off and release ---------- */

        const LIFT_SOLVENTS = [
            { id: "remover", label: "NMP-based remover, 80 °C" },
            { id: "acetone", label: "Acetone" },
            { id: "ipa", label: "IPA" },
            { id: "di", label: "DI water" }
        ];

        function openLiftoff() {

            let solvent = null;
            let busy = false;

            const m = api.openModal(`
                ${api.head("carbon", "Wet Bench: Lift-off")}
                ${stepBadge()}
                <p class="adv-lead">Dissolve the sacrificial nLOF underneath the metal. Metal sitting on resist floats away, and metal that landed on the open areas stays as your traces and pads.</p>
                <div class="adv-machine">
                    <canvas id="loCanvas" width="220" height="200"></canvas>
                    <div>
                        <p class="adv-round">Solvent</p>
                        ${chips("lsolv", LIFT_SOLVENTS, null)}
                        <label class="adv-check"><input type="checkbox" id="loSonic"> Ultrasonic bath</label>
                        ${slider("loMin", "Soak time", "min", 5, 60, 5, 5)}
                        <div class="adv-button-row" id="loButtons"><button type="button" class="adv-btn" id="loGo" data-autofocus>Start soak</button></div>
                        <p class="adv-result" id="loResult" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("loCanvas").getContext("2d");
            const minEl = wireSlider("loMin");
            wireChips("lsolv", (v) => { solvent = v; });

            function draw(k, lifting, now) {
                c.clearRect(0, 0, 220, 200);
                rect(c, 40, 50, 140, 130, "#d9e2f0");
                rect(c, 46, 70, 128, 104, "#cfe8ff");
                rect(c, 60, 150, 100, 6, "#c98a3a");
                for (let i = 0; i < 10; i++) {
                    const lift = lifting ? Math.min(1, k * 1.6 - i * 0.06) : 0;
                    const y = 146 - Math.max(0, lift) * (60 + (i % 3) * 12);
                    const x = 62 + i * 10 + Math.sin((now || 0) / 300 + i) * 3 * Math.max(0, lift);
                    rect(c, x, y, 6, 2, "#e8c34a");
                }
            }

            draw(0, false, 0);

            $("loGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                if (!solvent) {
                    result("loResult", "Pick a solvent first.", false);
                    return;
                }

                busy = true;
                const t = Number(minEl.value);
                const sonic = $("loSonic").checked;
                const works = solvent === "remover" || solvent === "acetone";

                result("loResult", "Soaking…");

                animate(m, 3500, (k, now) => draw(k, works, now), () => {

                    busy = false;

                    if (!works) {
                        result("loResult", `Nothing lifts. ${solvent === "ipa" ? "IPA" : "Water"} can't dissolve crosslinked nLOF, so the metal stays put.`, false);
                        return;
                    }

                    const defs = [];
                    const need = sonic ? 10 : 20;

                    if (solvent === "acetone") {
                        defs.push(defect("short", "minor", "Crosslinked nLOF doesn't fully dissolve in acetone. A few metal strips stayed bridged between traces. NMP-based removers do the job properly."));
                    } else if (t < need) {
                        defs.push(defect("short", "minor", `After ${t} min${sonic ? " with ultrasound" : ""}, a few metal strips were still bridging gaps. Give it longer${sonic ? "" : ", or use the ultrasonic bath"}.`));
                    }

                    completeStep(defs, `<p>Soaked ${t} min in ${LIFT_SOLVENTS.find((x) => x.id === solvent).label}${sonic ? " with ultrasound" : ""}. Gold flakes floated away, leaving the traces and pads behind. Rinsed in IPA and DI water, then dried with N<sub>2</sub>.</p>`);
                });
            });
        }

        const RELEASES = [
            { id: "soak", label: "Soak in DI water, then peel slowly" },
            { id: "dry", label: "Peel it off dry, quickly" },
            { id: "boe", label: "Dip in buffered HF to undercut the oxide" },
            { id: "acetone", label: "Soak in acetone" }
        ];

        function openRelease() {

            let how = null;
            let busy = false;

            const m = api.openModal(`
                ${api.head("carbon", "Wet Bench: Release")}
                ${stepBadge()}
                <p class="adv-lead">The polyimide body now holds the carbon electrodes and gold traces. Free the flexible device from the rigid silicon wafer without tearing it.</p>
                <div class="adv-machine">
                    <canvas id="rlCanvas" width="220" height="200"></canvas>
                    <div>
                        <p class="adv-round">Release method</p>
                        ${chips("rel", RELEASES, null)}
                        ${slider("rlMin", "Soak time", "min", 5, 60, 5, 5)}
                        <p class="adv-hint">Safety: HF is extremely dangerous even when it doesn't hurt at first. Real labs need special training and calcium gluconate gel on hand.</p>
                        <div class="adv-button-row"><button type="button" class="adv-btn" id="rlGo" data-autofocus>Release</button></div>
                        <p class="adv-result" id="rlResult" aria-live="polite"></p>
                    </div>
                </div>`);

            const c = $("rlCanvas").getContext("2d");
            const minEl = wireSlider("rlMin");
            wireChips("rel", (v) => { how = v; });

            function draw(k, torn) {
                c.clearRect(0, 0, 220, 200);
                rect(c, 20, 140, 180, 10, "#9aa6bb");
                // the film curls up off the wafer from the left
                c.strokeStyle = "#c98a3a";
                c.lineWidth = 5;
                c.beginPath();
                const lift = k * 80;
                c.moveTo(30, 136 - lift);
                c.quadraticCurveTo(30 + lift * 0.4, 136, 60 + lift, 136);
                c.lineTo(190, 136);
                c.stroke();
                rect(c, 26 + lift * 0.1, 130 - lift, 8, 4, "#3a3f4b");
                for (let i = 0; i < 4; i++) {
                    rect(c, 90 + i * 22, 133, 10, 3, "#e8c34a");
                }
                if (torn) {
                    c.strokeStyle = "#ff6b7d";
                    c.lineWidth = 2;
                    c.beginPath();
                    c.moveTo(70, 120);
                    c.lineTo(76, 128);
                    c.lineTo(72, 134);
                    c.stroke();
                }
            }

            draw(0, false);

            $("rlGo").addEventListener("click", () => {

                if (busy) {
                    return;
                }
                if (!how) {
                    result("rlResult", "Pick a release method first.", false);
                    return;
                }

                busy = true;
                const t = Number(minEl.value);
                const metal = cs().data.metal || {};
                const torn = how === "dry";

                result("rlResult", how === "dry" ? "Peeling…" : "Soaking…");

                animate(m, how === "acetone" ? 2500 : 3500, (k) => draw(how === "acetone" ? 0 : k, torn && k > 0.5), () => {

                    busy = false;

                    if (how === "acetone") {
                        draw(0, false);
                        result("rlResult", "Nothing happens. Cured polyimide shrugs off acetone, and it doesn't loosen the bond to the wafer either.", false);
                        return;
                    }

                    const defs = [];
                    let how2 = RELEASES.find((x) => x.id === how).label;

                    if (how === "dry") {
                        defs.push(defect("open", "major", "Peeling dry and fast bent the film sharply. The glassy carbon is brittle, so it cracked across a trace."));
                    } else if (how === "boe") {
                        if (metal.adh === "ti") {
                            defs.push(defect("peel", "major", "HF dissolves titanium. The BOE ate the Ti adhesion layer at the pad edges, and the gold lifted."));
                        }
                    } else if (t < 15) {
                        defs.push(defect("open", "minor", `After only ${t} min the film was still stuck in places, and one corner tore as you peeled.`));
                    }

                    finishDevice(defs, `<p>Released by: ${esc(how2)}${how === "soak" ? ` (${t} min)` : ""}.</p>`);
                });
            });
        }


        /* ---------- Finished device ---------- */

        function finishDevice(releaseDefs, summary) {

            const c = cs();
            c.defects.release = releaseDefs;

            const defs = allDefects();
            const majors = defs.filter((d) => d.sev === "major").length;
            const stars = !defs.length ? 3 : !majors ? 2 : 1;

            const effects = {};
            defs.forEach((d) => {
                if (effects[d.look] !== "major") {
                    effects[d.look] = d.sev;
                }
            });

            const first = !c.device;
            let xp = 0;
            if (first) {
                xp = 200 + stars * 25;
            } else if (stars > (c.deviceBest || 0)) {
                xp = (stars - (c.deviceBest || 0)) * 25;
            }

            const peak = c.data.gcPeak || 1000;
            c.device = {
                made: Date.now(),
                stars: stars,
                gcPeak: peak,
                gcStars: c.data.gcStars || 1,
                su8: c.data.thickness || TARGET_UM,
                metal: c.data.metal || null,
                effects: effects,
                tested: {}
            };
            c.deviceBest = Math.max(c.deviceBest || 0, stars);

            resetRun();
            api.updateHud();
            if (xp) {
                api.gainXP(xp);
            }
            api.awardSiteXP("carbondevice", 200);

            const lines = defs.length
                ? defs.map((d) => `<p>${d.sev === "major" ? "⚠️" : "•"} ${labelOf(d) ? "<strong>" + labelOf(d) + ".</strong> " : ""}${d.cause}</p>`).join("")
                : "<p>No defects anywhere in 28 steps. Dr. Carbon is speechless.</p>";

            const m = c.device.metal;
            const metalText = m ? `${m.adh === "none" ? "" : m.adhT + " nm " + m.adh.toUpperCase() + " / "}${m.thick} nm ${m.metal.toUpperCase()}` : "—";

            api.modalBody().innerHTML = `
                <div class="adv-complete">
                    <p class="eyebrow">DEVICE COMPLETE</p>
                    <h2>📟 Flexible Glassy Carbon ISFET</h2>
                    <p class="adv-stars" aria-label="${stars} of 3 stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p>
                    ${xp ? `<p class="adv-xp-big">+${xp} XP</p>` : ""}
                    <ul class="adv-stats" style="justify-content:center">
                        <li>Carbon <strong>${Math.round(c.device.su8 * PYRO[peak].keep * 100) / 100} µm</strong> (${peak} °C)</li>
                        <li>Wiring <strong>${metalText}</strong></li>
                        <li>Body <strong>2 × polyimide</strong></li>
                    </ul>
                    <div class="adv-takeaway">
                        ${summary}
                        ${lines}
                    </div>
                    <p class="adv-lead">Take it across town to the <strong>Echem Lab</strong> (head east from the plaza) to find out how well it works.</p>
                    <button type="button" class="adv-btn" data-close>Back to the lab</button>
                </div>`;
            api.modalBody().scrollTop = 0;
            api.focusFirst();

            api.afterModal(() => api.say([
                "It's off the wafer! A flexible device: carbon electrodes, gold wiring, wrapped in polyimide.",
                "Now we find out if it works. Take it east across town to the Echem Lab. Dr. Redox will help you test it."
            ], "Dr. Carbon"));
        }


        /* ---------- Recipe and datasheet ---------- */

        function datasheetHtml() {
            const row = (cells) => "<tr>" + cells.map((x) => `<td>${x}</td>`).join("") + "</tr>";
            return `
                <p class="adv-lead">From the MicroChem SU-8 2000 datasheet (SU-8 2000.5–2015). Values are starting points; real labs fine-tune them.</p>
                <div class="adv-sheet">
                    <h3>Film thickness at 3000 rpm</h3>
                    <p>Read off the spin curves: each product number is about its thickness in µm at 3000 rpm. Spin slower for a thicker film.</p>
                    <table><thead><tr><th>Product</th><th>≈ µm at 3000 rpm</th></tr></thead><tbody>
                        ${row(["SU-8 2002", "2"])}${row(["SU-8 2005", "5"])}${row(["SU-8 2010", "10"])}${row(["SU-8 2015", "15"])}
                    </tbody></table>
                    <h3>Spin program</h3>
                    <p>Dispense 1 ml per inch of wafer. Spread at 500 rpm for 5–10 s (100 rpm/s ramp), then spin 30 s at final speed (300 rpm/s ramp).</p>
                    <h3>Soft bake at 95 °C</h3>
                    <table><thead><tr><th>Thickness (µm)</th><th>Time (min)</th></tr></thead><tbody>
                        ${row(["0.5 – 2", "1"])}${row(["3 – 5", "2"])}${row(["6 – 15", "2 – 3"])}${row(["16 – 25", "3 – 4"])}
                    </tbody></table>
                    <p>Check: cool the wafer and put it back. If the film wrinkles, bake a few minutes more.</p>
                    <h3>Exposure energy (on silicon)</h3>
                    <table><thead><tr><th>Thickness (µm)</th><th>Dose (mJ/cm²)</th></tr></thead><tbody>
                        ${row(["0.5 – 2", "60 – 80"])}${row(["3 – 5", "90 – 105"])}${row(["6 – 15", "110 – 140"])}${row(["16 – 25", "140 – 150"])}
                    </tbody></table>
                    <p>Glass, Pyrex and ITO need about 1.5× this; metals 1.5–2×.</p>
                    <h3>Post-exposure bake at 95 °C</h3>
                    <table><thead><tr><th>Thickness (µm)</th><th>Time (min)</th></tr></thead><tbody>
                        ${row(["0.5 – 2", "1 – 2"])}${row(["3 – 5", "2 – 3"])}${row(["6 – 15", "3 – 4"])}${row(["16 – 25", "4 – 5"])}
                    </tbody></table>
                    <p>With the right dose, a latent image of the mask appears within seconds on the hotplate.</p>
                    <h3>Development in SU-8 developer</h3>
                    <table><thead><tr><th>Thickness (µm)</th><th>Time (min)</th></tr></thead><tbody>
                        ${row(["0.5 – 2", "1"])}${row(["3 – 5", "1"])}${row(["6 – 15", "2 – 3"])}${row(["16 – 25", "3 – 4"])}
                    </tbody></table>
                    <p>Rinse with fresh developer for ~10 s, then IPA for ~10 s, then dry with air or N<sub>2</sub>. <strong>A white film during the IPA rinse means underdevelopment</strong>: put it back in developer and rinse again.</p>
                    <h3>Substrate prep</h3>
                    <p>Start clean and dry. The datasheet suggests piranha then a DI rinse, or an oxygen plasma.</p>
                </div>`;
        }

        function openDatasheet(fromRecipe) {
            api.openModal(`
                ${api.head("carbon", "SU-8 2000 Datasheet")}
                ${datasheetHtml()}
                <div class="adv-button-row">
                    ${fromRecipe ? '<button type="button" class="adv-btn secondary" id="dsBack">← Back to recipe</button>' : ""}
                    <button type="button" class="adv-btn" data-close>Close</button>
                </div>`);
            const back = $("dsBack");
            if (back) {
                back.addEventListener("click", () => {
                    api.closeModal();
                    openRecipe();
                });
            }
        }

        function openRecipe() {

            const c = cs();
            let html = "";
            let phase = null;

            STEPS.forEach((st, i) => {
                if (st.phase !== phase) {
                    if (phase) {
                        html += "</ol>";
                    }
                    phase = st.phase;
                    html += `<h3 class="adv-recipe-phase">${PHASES[phase]}</h3><ol class="adv-recipe">`;
                }
                html += `
                    <li class="${i < c.step ? "done" : i === c.step ? "now" : ""}">
                        <span class="adv-recipe-mark">${i < c.step ? "✓" : i === c.step ? "▶" : i + 1}</span>
                        <span><strong>${st.name}</strong><small>${st.where.charAt(0).toUpperCase() + st.where.slice(1)}</small></span>
                    </li>`;
            });
            html += "</ol>";

            const best = [];
            if (c.best) {
                best.push(`Best carbon: ${"★".repeat(c.best)}${"☆".repeat(3 - c.best)}`);
            }
            if (c.deviceBest) {
                best.push(`Best device: ${"★".repeat(c.deviceBest)}${"☆".repeat(3 - c.deviceBest)}`);
            }

            api.openModal(`
                ${api.head("carbon", "Dr. Carbon's Recipe")}
                <p class="adv-lead">A flexible glassy carbon ISFET, built on an oxidized silicon wafer and then peeled off. ${best.join(" · ")}</p>
                <div class="adv-button-row" style="margin-bottom:8px">
                    <button type="button" class="adv-btn" id="rcSheet">📄 SU-8 datasheet</button>
                    ${c.step > 0 ? '<button type="button" class="adv-btn secondary" id="rcStrip">Scrap wafer and restart</button>' : ""}
                    <button type="button" class="adv-btn secondary" data-close>Close</button>
                </div>
                ${html}`);

            const now = api.modalBody().querySelector(".adv-recipe li.now");
            if (now) {
                now.scrollIntoView({ block: "center" });
            }

            $("rcSheet").addEventListener("click", () => {
                api.closeModal();
                openDatasheet(true);
            });

            const strip = $("rcStrip");
            if (strip) {
                strip.addEventListener("click", () => {
                    if (window.confirm("Scrap this wafer and start the recipe over from step 1?")) {
                        resetRun();
                        api.closeModal();
                        api.toast("Fresh wafer: back to step 1");
                    }
                });
            }
        }

        function updateRecipeButton() {
            api.refreshRecipe();
        }

        api.registerRecipe({
            id: "carbon",
            scenes: ["carbon", "carbonlab", "carboneast", "echemlab"],
            available: () => cs().recipe,
            open: openRecipe,
            label: "Dr. Carbon's glassy carbon ISFET (28 steps)",
            progress: () => cs().step,
            total: STEPS.length,
            restart: resetRun
        });

        api.carbon = {
            state: cs,
            labelOf: labelOf,
            PYRO: PYRO,
            hexTile: (c, x, y) => hexTile(c, x, y),
            drawAtom: (c, X, Y, t, tint) => drawAtom(c, X, Y, t, tint),
            draw: {
                bucky: (...a) => drawBucky(...a),
                benzene: (...a) => drawBenzene(...a),
                lamp: (...a) => drawLamp(...a),
                diamond: (...a) => drawDiamond(...a),
                pencil: (...a) => drawPencil(...a)
            }
        };


        /* ---------- Using a lab tool ---------- */

        const TOOLS = {
            wet: {
                name: "Wet Bench",
                open: () => {
                    const id = currentStep().id;
                    if (id === "liftoff") {
                        openLiftoff();
                    } else if (id === "release") {
                        openRelease();
                    } else {
                        openWetBench();
                    }
                },
                what: "Chemical baths for cleaning, lift-off and release."
            },
            hot: { name: "Hotplate", open: openHotplate, what: "A level hotplate for bakes." },
            plasma: { name: "Plasma Asher", open: openPlasma, what: "A plasma chamber for surface cleaning." },
            spin: { name: "Spin Coater", open: openSpinner, what: "Spins resist into an even film." },
            align: { name: "Mask Aligner", open: openAligner, what: "Lines a photomask up with the wafer and exposes it to UV." },
            dev: { name: "Developer Bench", open: openDeveloper, what: "Dishes of developer and rinse." },
            scope: { name: "Microscope", open: openMicroscope, what: "An inspection microscope." },
            furnace: { name: "Tube Furnace", open: openFurnace, what: "A quartz tube furnace that reaches 1100 °C." },
            metal: { name: "Metal Evaporator", open: openMetal, what: "An e-beam evaporator for thin metal films." }
        };

        // Materials each step takes from the bag (once per run).
        const USES = { clean: [["wafer", 1]], spin: [["su8", 1]], pi1spin: [["polyimide", 1]], pi2spin: [["polyimide", 1]], lorspin: [["nlof", 1]], metal: [["tiau", 1]] };

        function useTool(tool) {

            const c = cs();
            const t = TOOLS[tool];

            if (!c.recipe) {
                api.say([`${t.what}`, "The tools are locked out until Dr. Carbon assigns you a recipe."]);
                return;
            }

            const st = STEPS[c.step];

            if (st.tool !== tool) {
                api.say([
                    `${t.what}`,
                    `Your recipe says the next step is: ${st.name}.`,
                    `That happens at the ${st.where}. Press R to read the recipe.`
                ]);
                return;
            }

            if (!api.bag.pay(cs(), st.id, USES[st.id])) {
                return;
            }
            t.open();
        }


        /* ---------- Drawing: Ion City ---------- */

        function hexTile(c, x, y) {
            const X = x * TILE;
            const Y = y * TILE;
            rect(c, X, Y, TILE, TILE, "#cdd3df");
            c.strokeStyle = "#aab2c3";
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(X + 4, Y + 0.5);
            c.lineTo(X + 12, Y + 0.5);
            c.lineTo(X + 15.5, Y + 8);
            c.lineTo(X + 12, Y + 15.5);
            c.lineTo(X + 4, Y + 15.5);
            c.lineTo(X + 0.5, Y + 8);
            c.closePath();
            c.stroke();
            // a carbon atom at each corner of the honeycomb
            [[4, 0], [12, 0], [15, 8], [12, 15], [4, 15], [0, 8]].forEach(([dx, dy]) => {
                rect(c, X + dx - 0.5, Y + dy - 0.5, 1.5, 1.5, "#5d6577");
            });
        }

        function drawAtom(c, X, Y, t, tint) {
            const bob = Math.round(Math.sin(t / 300 + X) * 1);
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
                rect(c, cx + dx * 7 - 1.5, cy + dy * 6 - 1.5, 3, 3, tint);
            });
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.arc(cx, cy, 6, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#3a3f4b";
            c.beginPath();
            c.arc(cx, cy, 5, 0, Math.PI * 2);
            c.fill();
            rect(c, cx - 3, cy - 4, 2, 1, "rgba(255,255,255,0.55)");
            rect(c, cx - 3, cy - 1, 2, 2, "#ffffff");
            rect(c, cx + 1, cy - 1, 2, 2, "#ffffff");
            rect(c, cx - 2, cy, 1, 1, "#1a2033");
            rect(c, cx + 2, cy, 1, 1, "#1a2033");
            rect(c, cx - 5, cy + 2, 2, 1, "#ff8aa8");
            rect(c, cx + 3, cy + 2, 2, 1, "#ff8aa8");
        }

        function drawBenzene(c, X, Y, W, H, t) {
            api.box(X + 7, Y + 23, 18, 8, "#aab2c3");
            rect(c, X + 7, Y + 23, 18, 2, "#c8ceda");
            const cx = X + 16;
            const cy = Y + 11;
            const r = 10;
            const pts = [];
            for (let i = 0; i < 6; i++) {
                const a = Math.PI / 6 + i * Math.PI / 3 + Math.sin(t / 1600) * 0.05;
                pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
            }
            c.strokeStyle = "#2b2f3a";
            c.lineWidth = 2;
            c.beginPath();
            pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
            c.closePath();
            c.stroke();
            // alternating double bonds
            c.lineWidth = 1.5;
            for (let i = 0; i < 6; i += 2) {
                const [x1, y1] = pts[i];
                const [x2, y2] = pts[(i + 1) % 6];
                const k = 0.72;
                c.beginPath();
                c.moveTo(cx + (x1 - cx) * k + (x2 - x1) * 0.15, cy + (y1 - cy) * k + (y2 - y1) * 0.15);
                c.lineTo(cx + (x2 - cx) * k - (x2 - x1) * 0.15, cy + (y2 - cy) * k - (y2 - y1) * 0.15);
                c.stroke();
            }
            pts.forEach(([x, y]) => {
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.arc(x, y, 2.6, 0, Math.PI * 2);
                c.fill();
                rect(c, x - 1, y - 1.5, 1, 1, "rgba(255,255,255,0.6)");
            });
        }

        function drawBucky(c, X, Y, W, H, t) {
            const cx = X + 16;
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.ellipse(cx, Y + 25, 16, 6.5, 0, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#aab2c3";
            c.beginPath();
            c.ellipse(cx, Y + 25, 15, 5.5, 0, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#4aa3e8";
            c.beginPath();
            c.ellipse(cx, Y + 24.5, 12, 3.8, 0, 0, Math.PI * 2);
            c.fill();
            // water jets
            for (let i = 0; i < 6; i++) {
                const ph = ((t / 900) + i / 6) % 1;
                const a = i * Math.PI / 3;
                const x = cx + Math.cos(a) * 10 * ph;
                const y = Y + 12 - Math.sin(ph * Math.PI) * 6 + ph * 12;
                rect(c, x - 0.5, y, 1.5, 1.5, "#bfe3ff");
            }
            // the buckyball
            const by = Y + 10 + Math.round(Math.sin(t / 700));
            rect(c, cx - 1, by + 7, 2, 7, "#8f98aa");
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.arc(cx, by, 8, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#3a3f4b";
            c.beginPath();
            c.arc(cx, by, 7, 0, Math.PI * 2);
            c.fill();
            c.strokeStyle = "#7fd9c4";
            c.lineWidth = 1;
            c.beginPath();
            for (let i = 0; i < 5; i++) {
                const a = -Math.PI / 2 + i * 2 * Math.PI / 5 + t / 2000;
                const x = cx + Math.cos(a) * 3;
                const y = by + Math.sin(a) * 3;
                if (i) {
                    c.lineTo(x, y);
                } else {
                    c.moveTo(x, y);
                }
                c.moveTo(x, y);
                c.lineTo(cx + Math.cos(a) * 6.5, by + Math.sin(a) * 6.5);
                c.moveTo(x, y);
            }
            c.stroke();
            c.beginPath();
            for (let i = 0; i <= 5; i++) {
                const a = -Math.PI / 2 + i * 2 * Math.PI / 5 + t / 2000;
                const x = cx + Math.cos(a) * 3;
                const y = by + Math.sin(a) * 3;
                if (i) {
                    c.lineTo(x, y);
                } else {
                    c.moveTo(x, y);
                }
            }
            c.stroke();
            rect(c, cx - 4, by - 5, 2, 1, "rgba(255,255,255,0.6)");
        }

        function drawLamp(c, X, Y, W, H, t) {
            rect(c, X + 4, Y + 13, 8, 3, "#5d6577");
            rect(c, X + 5, Y - 10, 6, 24, "#1a2033");
            rect(c, X + 6, Y - 9, 4, 22, "#7fc9c0");
            for (let i = 0; i < 7; i++) {
                rect(c, X + 6 + (i % 2) * 2, Y - 8 + i * 3, 2, 1, "#3e8a80");
            }
            const glow = 0.25 + 0.15 * Math.sin(t / 500 + X);
            c.fillStyle = `rgba(255, 230, 128, ${glow})`;
            c.beginPath();
            c.arc(X + 8, Y - 12, 7, 0, Math.PI * 2);
            c.fill();
            rect(c, X + 5, Y - 15, 6, 5, "#ffe680");
            rect(c, X + 6, Y - 14, 2, 1, "#ffffff");
        }

        function drawDiamond(c, X, Y, W, H, t) {
            api.box(X + 3, Y + 10, 10, 5, "#aab2c3");
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.moveTo(X + 3, Y - 2);
            c.lineTo(X + 13, Y - 2);
            c.lineTo(X + 15, Y + 1);
            c.lineTo(X + 8, Y + 10);
            c.lineTo(X + 1, Y + 1);
            c.closePath();
            c.fill();
            c.fillStyle = "#a8f0ff";
            c.beginPath();
            c.moveTo(X + 4, Y - 1);
            c.lineTo(X + 12, Y - 1);
            c.lineTo(X + 13.5, Y + 1);
            c.lineTo(X + 8, Y + 8.5);
            c.lineTo(X + 2.5, Y + 1);
            c.closePath();
            c.fill();
            rect(c, X + 3, Y + 1, 10, 1, "#e8fbff");
            rect(c, X + 7, Y + 2, 2, 5, "#d4f7ff");
            if (Math.floor(t / 400 + X) % 5 === 0) {
                rect(c, X + 11, Y - 5, 1, 3, "#ffffff");
                rect(c, X + 10, Y - 4, 3, 1, "#ffffff");
            }
        }

        function drawPencil(c, X, Y, W, H, t) {
            rect(c, X + 4, Y + 13, 8, 3, "rgba(0,0,0,0.22)");
            rect(c, X + 4, Y + 10, 8, 4, "#ff9ab0");
            rect(c, X + 4, Y + 7, 8, 3, "#c8ceda");
            rect(c, X + 4, Y - 12, 8, 19, "#1a2033");
            rect(c, X + 5, Y - 11, 6, 18, "#ffd84a");
            rect(c, X + 7, Y - 11, 2, 18, "#f2c230");
            c.fillStyle = "#e8c79a";
            c.beginPath();
            c.moveTo(X + 4, Y - 12);
            c.lineTo(X + 12, Y - 12);
            c.lineTo(X + 8, Y - 19);
            c.closePath();
            c.fill();
            c.fillStyle = "#2b2f3a";
            c.beginPath();
            c.moveTo(X + 6.5, Y - 16.5);
            c.lineTo(X + 9.5, Y - 16.5);
            c.lineTo(X + 8, Y - 19.5);
            c.closePath();
            c.fill();
        }

        /* ---------- Drawing: Carbon Lab tools ---------- */

        function arrowIf(c, tool, X, Y, W, t) {
            if (!isCurrentTool(tool)) {
                return;
            }
            const y = Y - 32 + Math.round(Math.sin(t / 250) * 2);
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.moveTo(X + W / 2 - 5, y - 1);
            c.lineTo(X + W / 2 + 5, y - 1);
            c.lineTo(X + W / 2, y + 6);
            c.closePath();
            c.fill();
            c.fillStyle = "#ffd84a";
            c.beginPath();
            c.moveTo(X + W / 2 - 3.5, y);
            c.lineTo(X + W / 2 + 3.5, y);
            c.lineTo(X + W / 2, y + 4.5);
            c.closePath();
            c.fill();
        }

        const DRAW_TOOL = {
            wet(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                ["#cfe8ff", "#f2d58a", "#9fd6ff"].forEach((col, i) => {
                    rect(c, X + 4 + i * 15, Y + 4, 10, 8, "#d9e2f0");
                    rect(c, X + 5 + i * 15, Y + 6, 8, 5, col);
                });
            },
            hot(c, X, Y, W, H, t) {
                api.box(X + 1, Y + 2, W - 2, H - 3, "#c9cfdb");
                const on = 0.5 + 0.5 * Math.sin(t / 600);
                rect(c, X + 5, Y + 4, 16, 9, `rgb(${210 + on * 40}, ${150 - on * 30}, ${120 - on * 40})`);
                rect(c, X + 23, Y + 5, 7, 4, "#1a2033");
                rect(c, X + 24, Y + 6, 5, 2, "#ff6b5a");
            },
            plasma(c, X, Y, W, H, t) {
                api.box(X + 2, Y - 2, W - 4, H, "#aab3c4");
                c.fillStyle = "#1a2033";
                c.fillRect(X + 6, Y + 2, W - 12, 14);
                c.fillStyle = `rgba(180, 200, 255, ${0.4 + 0.3 * Math.sin(t / 300)})`;
                c.fillRect(X + 7, Y + 3, W - 14, 12);
                rect(c, X + 6, Y + H - 10, W - 12, 5, "#2a3448");
                rect(c, X + 8, Y + H - 9, 3, 2, "#5be38a");
            },
            spin(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 2, W - 4, H - 3, "#dfe4ee");
                const cx = X + W / 2;
                const cy = Y + 12;
                c.fillStyle = "#4b556b";
                c.beginPath();
                c.ellipse(cx, cy, 9, 5, 0, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = "#b7c96a";
                c.beginPath();
                c.ellipse(cx, cy, 6, 3, 0, 0, Math.PI * 2);
                c.fill();
                const a = t / 120;
                rect(c, cx + Math.cos(a) * 4 - 1, cy + Math.sin(a) * 2 - 1, 2, 2, "#ffffff");
                rect(c, X + 6, Y + H - 9, W - 12, 5, "#2a3448");
            },
            align(c, X, Y, W, H) {
                api.box(X + 2, Y + 4, W - 4, H - 5, "#c9cfdb");
                rect(c, X + 8, Y + 16, W - 16, 6, "#8f98aa");
                api.box(X + W / 2 - 8, Y - 4, 16, 10, "#3b4458");
                rect(c, X + W / 2 - 6, Y - 9, 3, 5, "#1a2033");
                rect(c, X + W / 2 + 3, Y - 9, 3, 5, "#1a2033");
                api.box(X + W - 16, Y - 2, 11, 9, "#5b4fa8");
            },
            dev(c, X, Y, W, H) {
                api.box(X, Y + 2, W, H - 2, "#b8c2d2");
                [0, 1, 2].forEach((i) => {
                    rect(c, X + 3 + i * 15, Y + 5, 12, 7, "#d9e2f0");
                    rect(c, X + 4 + i * 15, Y + 6, 10, 5, i === 2 ? "#e3f6ff" : "#b9dcf5");
                });
            },
            scope(c, X, Y, W, H) {
                api.box(X, Y + 4, W, H - 4, "#c9cfdb");
                rect(c, X + 12, Y - 10, 4, 16, "#3b4458");
                rect(c, X + 8, Y - 12, 8, 4, "#1a2033");
                rect(c, X + 10, Y + 4, 10, 3, "#8f98aa");
                rect(c, X + 20, Y - 2, 6, 8, "#5d6577");
            },
            furnace(c, X, Y, W, H, t) {
                rect(c, X, Y + 6, W, 5, "rgba(220,235,255,0.55)");
                api.box(X + W / 2 - 18, Y, 36, H - 1, "#5d6577");
                const g = 0.5 + 0.4 * Math.sin(t / 500);
                rect(c, X + W / 2 - 14, Y + 4, 28, 8, `rgba(255, ${110 + g * 60}, 60, ${0.6 + g * 0.3})`);
                rect(c, X + 2, Y - 8, 5, 14, "#3d6fd8");
                rect(c, X + 2, Y - 10, 5, 2, "#c8ceda");
                rect(c, X + W - 22, Y + 2, 10, 6, "#2a3448");
                rect(c, X + W - 20, Y + 4, 6, 2, "#ff8a5c");
            },
            metal(c, X, Y, W, H, t) {
                api.box(X + 2, Y + 8, W - 4, H - 9, "#aab3c4");
                c.fillStyle = "#1a2033";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 8, W / 2 - 4, 13, 0, Math.PI, 0);
                c.fill();
                c.fillStyle = "#c8d0de";
                c.beginPath();
                c.ellipse(X + W / 2, Y + 8, W / 2 - 5, 12, 0, Math.PI, 0);
                c.fill();
                c.fillStyle = `rgba(255, 200, 90, ${0.35 + 0.25 * Math.sin(t / 350)})`;
                c.beginPath();
                c.arc(X + W / 2, Y + 2, 4, 0, Math.PI * 2);
                c.fill();
                rect(c, X + 6, Y + H - 9, W - 12, 5, "#2a3448");
                rect(c, X + 8, Y + H - 8, 3, 2, "#5be38a");
                rect(c, X + W - 14, Y + H - 8, 6, 2, "#ffd84a");
            },
            sheet(c, X, Y, W, H) {
                rect(c, X + 4, Y + 10, 2, 6, "#5d6577");
                rect(c, X + W - 6, Y + 10, 2, 6, "#5d6577");
                api.box(X + 1, Y - 6, W - 2, 16, "#f7f4ea");
                for (let i = 0; i < 4; i++) {
                    rect(c, X + 5, Y - 3 + i * 3, W - 10 - (i % 2) * 6, 1, "#8f98aa");
                }
                rect(c, X + 5, Y - 4, 8, 1, "#3d6fd8");
            }
        };

        function toolObject(tool, label, x, y, w, h) {
            return {
                kind: "carbon-" + tool,
                x: x, y: y, w: w, h: h,
                label: label,
                draw: (c, X, Y, W, H, t) => {
                    DRAW_TOOL[tool](c, X, Y, W, H, t);
                    arrowIf(c, tool, X, Y, W, t);
                },
                prompt: () => "A: Use " + TOOLS[tool].name,
                use: () => useTool(tool)
            };
        }

        function decor(kind, x, y, w, h, draw, lines) {
            return { kind: kind, x: x, y: y, w: w, h: h, draw: draw, lines: lines, prompt: "A: Look" };
        }


        /* ---------- Scenes ---------- */

        api.SCENES.carbon = {
            id: "carbon",
            label: "Ion City",
            outdoor: true,
            grid: [
                "TTTTTTTTTTpTTTTTTTTT",
                "T.f.......p......f.T",
                "T.BBBBBB..p..BBBBB.T",
                "T.BBBBBB..p..BBBBB.T",
                "T.BBBBBB..p..BBBBB.T",
                "T.BBBBDB..p..BBDBB.T",
                "T.....p...p....p...T",
                "T.....pppppppppppppp",
                "T.........p........T",
                "T..hhhhhhhhhhhhhh..T",
                "T..hhhhhhhhhhhhhh..T",
                "T..hhhhhhhhhhhhhh..T",
                "T..hhhhhhhhhhhhhh..T",
                "T.f..............f.T",
                "TTTTTTTTTTTTTTTTTTTT"
            ],
            drawTile: (c, x, y, ch, t) => {
                if (ch === "h") {
                    phTile(c, x, y);
                } else {
                    api.drawWorldTile(x, y, ch, t);
                }
            },
            edges: {
                up: { scene: "world", x: 10, y: 14 },
                right: { scene: "carboneast", x: 0, y: 7 }
            },
            buildings: [
                {
                    id: "carbonlab",
                    sign: "ION LAB",
                    x: 2, y: 2, w: 6, h: 4,
                    door: { x: 6, y: 5 },
                    wall: "#cfd3dd",
                    roof: "#2b2f3a",
                    locked: () => false
                },
                {
                    id: "cafe",
                    sign: "ION CAFÉ",
                    x: 13, y: 2, w: 5, h: 4,
                    door: { x: 15, y: 5 },
                    wall: "#f3e3c3",
                    roof: "#8a5a3b",
                    locked: () => true,
                    lockedText: ["ION CAFÉ: \"Closed while we restock the electrolytes. Opening in a later update!\"", "The menu board lists sports drinks by their sodium and potassium ions."]
                }
            ],
            npcs: [
                {
                    id: "sal",
                    name: "Sal the Sodium Ion (Na⁺)",
                    x: 12, y: 8,
                    dir: "down",
                    draw: (c, X, Y, t) => drawIonFolk(c, X, Y, t, "#ffd84a", "Na⁺"),
                    talk: () => [
                        "Hiya! I'm Na⁺, a sodium atom that gave away one electron. Lose an electron, gain a plus sign!",
                        "Your blood is full of me, about 140 millimolar. Ion-selective sensors in hospitals measure me all day long."
                    ]
                },
                {
                    id: "chloe",
                    name: "Chloe Chloride (Cl⁻)",
                    x: 5, y: 12,
                    dir: "down",
                    draw: (c, X, Y, t) => drawIonFolk(c, X, Y, t, "#5be38a", "Cl⁻"),
                    talk: () => [
                        "I'm Cl⁻, chlorine with one extra electron. Sal and I make table salt together!",
                        "Drop salt in water and we drift apart into free ions. That's why salt water conducts electricity and pure water barely does."
                    ]
                },
                {
                    id: "kay",
                    name: "Kay Potassium (K⁺)",
                    x: 18, y: 12,
                    dir: "down",
                    draw: (c, X, Y, t) => drawIonFolk(c, X, Y, t, "#c97fe0", "K⁺"),
                    talk: () => [
                        "I'm K⁺. Inside your cells there's lots of me, outside there's lots of Na⁺.",
                        "Nerve signals are Na⁺ rushing in and K⁺ rushing out, over and over. Every thought you have is ions on the move!"
                    ]
                },
                {
                    id: "proton",
                    name: "Proton Pete (H⁺)",
                    x: 3, y: 8,
                    dir: "down",
                    draw: (c, X, Y, t) => drawIonFolk(c, X, Y, t, "#ffb84a", "H⁺"),
                    talk: () => [
                        "I'm H⁺, a hydrogen ion: just a lonely proton! The more of me in a liquid, the more acidic it is. That's what pH counts.",
                        "When I land on an ISFET's gate, I add positive charge there, and that shifts the current through the transistor. That's how it reads pH!"
                    ]
                },
                {
                    id: "hydroxide",
                    name: "Ollie Hydroxide (OH⁻)",
                    x: 18, y: 13,
                    dir: "down",
                    draw: (c, X, Y, t) => drawIonFolk(c, X, Y, t, "#7fb2ff", "OH⁻"),
                    talk: () => [
                        "I'm OH⁻, hydroxide. Where I outnumber H⁺, the liquid is basic, with a pH above 7.",
                        "Pure water at 25 °C has exactly as many of me as H⁺, so its pH is 7: neutral."
                    ]
                }
            ],
            objects: [
                api.bag.pickup({ id: "carbon-tiau", item: "tiau", x: 17, y: 8, text: "A sparkle by the path… a little jar of titanium and gold pellets!" }),
                decor("salt", 9, 10, 2, 2, drawSaltCrystal, [
                    "A salt crystal sculpture: Na⁺ (yellow) and Cl⁻ (green) alternating in a cube lattice, billions of times over in every grain of table salt.",
                    "Dissolve it in water and the ions float free. A liquid full of free ions is an electrolyte."
                ]),
                decor("phfountain", 4, 10, 2, 2, drawPhFountain, [
                    "The pH fountain! Each jet holds universal indicator at a different pH: red is acidic (lots of H⁺), green is neutral, purple is basic (lots of OH⁻).",
                    "Each step on the pH scale is ten times more H⁺. pH 3 is a thousand times more acidic than pH 6."
                ]),
                decor("calcium", 14, 10, 2, 2, (c, X, Y, W, H, t) => drawIonStatue(c, X, Y, W, H, t, "#f5f7ff", "Ca²⁺"), [
                    "A Ca²⁺ statue. Calcium lost two electrons, so it carries a double charge.",
                    "Calcium ions make muscles contract and tell neurons to release their messengers. Ion-selective electrodes measure them in blood tests."
                ]),
                decor("lamp", 9, 8, 1, 1, drawSodiumLamp, [
                    "A sodium-vapor streetlamp. Electricity excites sodium atoms, and they glow a warm yellow-orange at 589 nm."
                ]),
                decor("lamp", 11, 8, 1, 1, drawSodiumLamp, [
                    "Another sodium lamp. Every element glows its own colors: that's how astronomers know what stars are made of."
                ]),
                decor("lithium", 7, 12, 1, 1, (c, X, Y, W, H, t) => drawIonStatue(c, X, Y, W, H, t, "#ff8aa8", "Li⁺"), [
                    "A Li⁺ statue. In a lithium-ion battery, Li⁺ ions shuttle from one electrode to the other through the electrolyte as it charges and discharges."
                ]),
                decor("isfet", 12, 12, 1, 1, drawIsfetStatue, [
                    "A little ISFET statue, Ion City's pride: a transistor with no metal gate. A liquid and a reference electrode take its place.",
                    "Ions in the liquid charge the gate surface and change the current. Dr. Carbon builds them in the Ion Lab."
                ])
            ]
        };

        // Ion City's people are ions: a round body with their symbol on it.
        function drawIonFolk(c, X, Y, t, tint, symbol) {
            const bob = Math.round(Math.sin(t / 280 + X) * 1);
            const cx = X + 8;
            const cy = Y + 8 + bob;
            rect(c, X + 3, Y + 14, 10, 2, "rgba(0,0,0,0.22)");
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.arc(cx, cy, 7, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = tint;
            c.beginPath();
            c.arc(cx, cy, 6, 0, Math.PI * 2);
            c.fill();
            rect(c, cx - 3, cy - 3, 2, 2, "#1a2033");
            rect(c, cx + 1, cy - 3, 2, 2, "#1a2033");
            c.fillStyle = "#1a2033";
            c.font = "bold 5px sans-serif";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(symbol, cx, cy + 3);
        }

        function drawIonStatue(c, X, Y, W, H, t, tint, symbol) {
            const cx = X + W / 2;
            rect(c, X + 2, Y + H - 5, W - 4, 5, "#8f98aa");
            rect(c, X + 3, Y + H - 4, W - 6, 1, "#c8ceda");
            const r = Math.min(W, H) / 2 - 4;
            const cy = Y + H / 2 - 2;
            const glow = 0.25 + 0.15 * Math.sin(t / 400);
            c.fillStyle = `rgba(255, 255, 255, ${glow})`;
            c.beginPath();
            c.arc(cx, cy, r + 2, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#1a2033";
            c.beginPath();
            c.arc(cx, cy, r, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = tint;
            c.beginPath();
            c.arc(cx, cy, r - 1, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#1a2033";
            c.font = `bold ${Math.max(5, Math.round(r * 0.8))}px sans-serif`;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(symbol, cx, cy + 0.5);
        }

        function drawSaltCrystal(c, X, Y, W, H, t) {
            rect(c, X + 2, Y + H - 5, W - 4, 5, "#8f98aa");
            const n = 4;
            const s = (W - 8) / n;
            const wob = Math.sin(t / 900) * 0.5;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const na = (i + j) % 2 === 0;
                    c.fillStyle = "#1a2033";
                    c.beginPath();
                    c.arc(X + 4 + s * (i + 0.5) + wob, Y + 2 + s * (j + 0.5), na ? 2.4 : 3.2, 0, Math.PI * 2);
                    c.fill();
                    c.fillStyle = na ? "#ffd84a" : "#5be38a";
                    c.beginPath();
                    c.arc(X + 4 + s * (i + 0.5) + wob, Y + 2 + s * (j + 0.5), na ? 1.8 : 2.6, 0, Math.PI * 2);
                    c.fill();
                }
            }
        }

        // universal-indicator colors, pH 1 (red) to pH 14 (deep purple)
        const PH_COLORS = ["#e2263b", "#f05a28", "#f7941d", "#ffc20e", "#d7df23", "#8dc63f", "#39b54a", "#00a99d", "#0f75bc", "#2e3192", "#662d91", "#92278f", "#7a1f6e", "#5b1a5e"];

        function drawPhFountain(c, X, Y, W, H, t) {
            rect(c, X + 1, Y + H - 8, W - 2, 8, "#8f98aa");
            rect(c, X + 3, Y + H - 7, W - 6, 4, "#7fb2ff");
            const n = 5;
            for (let i = 0; i < n; i++) {
                const x = X + 4 + i * (W - 8) / (n - 1);
                const h = 10 + 4 * Math.sin(t / 250 + i);
                c.fillStyle = PH_COLORS[Math.round(i * (PH_COLORS.length - 1) / (n - 1))];
                c.fillRect(x - 1, Y + H - 8 - h, 2, h);
                c.beginPath();
                c.arc(x, Y + H - 8 - h, 1.8, 0, Math.PI * 2);
                c.fill();
            }
        }

        function drawSodiumLamp(c, X, Y, W, H, t) {
            const k = (Math.sin(t / 500) + 1) / 2;
            c.fillStyle = `rgba(255, 190, 70, ${0.18 + 0.12 * k})`;
            c.beginPath();
            c.arc(X + 8, Y - 2, 9, 0, Math.PI * 2);
            c.fill();
            rect(c, X + 7, Y - 2, 2, 17, "#3b4458");
            rect(c, X + 4, Y - 5, 8, 4, "#1a2033");
            rect(c, X + 5, Y - 4, 6, 2, "#ffb84a");
        }

        function drawIsfetStatue(c, X, Y, W, H, t) {
            rect(c, X + 1, Y + 11, 14, 5, "#3b4458");
            rect(c, X + 2, Y + 9, 12, 2, "#cfe8ff");
            const k = (Math.sin(t / 300) + 1) / 2;
            rect(c, X + 3, Y + 1, 10, 8, `rgba(127, 178, 255, ${0.5 + 0.3 * k})`);
            rect(c, X + 7, Y - 4, 2, 6, "#d9dde6");
            for (let i = 0; i < 3; i++) {
                c.fillStyle = "#ffb84a";
                c.beginPath();
                c.arc(X + 5 + i * 3, Y + 3 + ((t / 200 + i * 2) % 5), 0.9, 0, Math.PI * 2);
                c.fill();
            }
        }

        // a plaza paved in pH-colored stripes, acid on the left to base on the right
        function phTile(c, x, y) {
            const X = x * TILE;
            const Y = y * TILE;
            const col = PH_COLORS[Math.max(0, Math.min(PH_COLORS.length - 1, Math.round((x - 3) * (PH_COLORS.length - 1) / 13)))];
            rect(c, X, Y, TILE, TILE, "#d8dde8");
            rect(c, X + 1, Y + 1, TILE - 2, TILE - 2, col);
            c.globalAlpha = 0.55;
            rect(c, X + 1, Y + 1, TILE - 2, TILE - 2, "#f5f7ff");
            c.globalAlpha = 1;
            if (y === 9) {
                c.fillStyle = "#1a2033";
                c.font = "bold 6px sans-serif";
                c.textAlign = "center";
                c.textBaseline = "middle";
                c.fillText(String(Math.max(1, Math.min(14, x - 2))), X + 8, Y + 8);
            }
        }

        api.SCENES.carbonlab = {
            id: "carbonlab",
            label: "Ion Lab · Dr. Carbon",
            grid: api.interiorRows(),
            floor: "#d7dae3",
            tint: "rgba(255, 200, 40, 0.10)",
            exitTo: { scene: "carbon", x: 6, y: 6 },
            objects: [
                api.bag.stockroom({ label: "Ion Lab stockroom", items: ["polyimide", "tiau"], x: 5, y: 10 }),
                toolObject("wet", "Wet bench", 1, 2, 3, 1),
                toolObject("hot", "Hotplate", 5, 2, 2, 1),
                toolObject("plasma", "Plasma", 8, 2, 2, 2),
                toolObject("spin", "Spinner", 11, 2, 2, 2),
                toolObject("align", "Aligner", 15, 2, 3, 2),
                toolObject("dev", "Developer", 1, 7, 3, 1),
                toolObject("scope", "Microscope", 1, 10, 2, 1),
                toolObject("furnace", "Tube furnace", 13, 10, 5, 1),
                toolObject("metal", "Evaporator", 13, 6, 3, 2),
                {
                    kind: "sheet",
                    x: 6, y: 7, w: 2, h: 1,
                    label: "Datasheet",
                    draw: (c, X, Y, W, H) => DRAW_TOOL.sheet(c, X, Y, W, H),
                    prompt: "A: Read the SU-8 datasheet",
                    use: () => openDatasheet(false)
                }
            ],
            npcs: [
                {
                    id: "profcarbon",
                    name: "Dr. Carbon",
                    x: 10, y: 9,
                    dir: "down",
                    look: { suit: "#3a3f4b", accent: "#54e0c7", visor: "#ffd84a" },
                    talk: profCarbonTalk
                }
            ]
        };

        function profCarbonTalk() {

            const c = cs();
            const name = api.currentChar() ? api.currentChar().name : "engineer";

            if (!c.recipe) {
                return {
                    lines: [
                        `Welcome to Ion City, ${name}! I'm Dr. Carbon.`,
                        "Everyone in Ion City measures ions. Our specialty is the ISFET: an ion-sensitive field-effect transistor, a transistor whose gate feels the ions in a liquid, like the H⁺ that sets pH.",
                        "Here we turn plastic into carbon. We pattern SU-8 photoresist, then bake it in a furnace with no oxygen until only carbon is left.",
                        "That's glassy carbon: hard, conductive and nearly impossible to corrode. It makes a wonderful sensing gate for an ISFET, a transistor that measures pH.",
                        "Here's my recipe. Some of the numbers you'll have to look up in the SU-8 datasheet. It's on the board next to the developer bench.",
                        "📋 Recipe added! Press R or tap Recipe any time to read it."
                    ],
                    done: () => {
                        c.recipe = true;
                        api.writeSave();
                        updateRecipeButton();
                    }
                };
            }

            const st = STEPS[c.step];

            if (c.step === 0 && c.device) {
                return [
                    `Your last device scored ${"★".repeat(c.device.stars)}${"☆".repeat(3 - c.device.stars)}. Have you tested it in the Echem Lab, east across town?`,
                    "Any time you want to build another, start again at the wet bench."
                ];
            }

            if (c.step === 0 && c.best) {
                return [
                    `Back for another run? Your best carbon so far is ${"★".repeat(c.best)}${"☆".repeat(3 - c.best)}.`,
                    "Step 1 is cleaning the wafer at the wet bench. Follow the arrow!"
                ];
            }

            const tips = {
                clean: "A classic solvent clean is acetone, then IPA, then a DI water rinse.",
                dehydrate: "That bake drives off the water film so the SU-8 can grip.",
                plasma: "Oxygen plasma burns off the last organic film without etching anything.",
                spin: "Check the datasheet for which SU-8 grade gives ~5 µm at 3000 rpm.",
                softbake: "The datasheet lists soft bake times by film thickness. Use yours!",
                expose: "Dose is intensity times time. The datasheet tells you how much your film needs.",
                peb: "Bake right after exposure. Watch for the latent image!",
                develop: "If you see a white film in the IPA rinse, it needs more developer.",
                inspect: "Look closely. Anything wrong now gets baked in forever.",
                pyro: "Inert gas only, and go slowly. Carbon hates being rushed.",
                pi1spin: "Polyimide is the insulator and the body of the device. Spin it like any resist.",
                pi1bake: "Gently! Too hot and the polyimide starts curing before you've patterned it.",
                pi1expose: "Line the openings up over the carbon electrodes and pads.",
                pi1dev: "PA-401D develops this polyimide. PA-400R is the rinse.",
                pi1cure: "250 °C in nitrogen, nice and slow. That turns it into real polyimide.",
                lorspin: "This resist is only temporary. It's the stencil for the gold.",
                lorbake: "110 °C for a minute, straight from the nLOF datasheet.",
                lorexpose: "The trace pattern has to land on the carbon contact pads.",
                lorpeb: "For nLOF this bake is what crosslinks it. Don't skip it!",
                lordev: "Watery TMAH developer for nLOF. A little extra time deepens the undercut.",
                metal: "Pump down properly before you deposit, and don't forget the adhesion layer.",
                liftoff: "Crosslinked nLOF wants an NMP-based remover. Patience pays off.",
                pi2spin: "Second polyimide layer: this one seals the gold traces.",
                pi2bake: "Same gentle bake as the first polyimide layer.",
                pi2expose: "This time, open windows over the electrodes and the gold contact pads.",
                pi2dev: "PA-401D again, then the PA-400R rinse.",
                pi2cure: "Same cure as before: 250 °C in nitrogen.",
                release: "Let the water loosen it first, then peel slowly. Carbon is brittle!"
            };

            return [
                `Next step: ${st.name}.`,
                `Head to the ${st.where}. ${tips[st.id] || ""}`
            ];
        }

        // Split the lab into bays: these stations get their own building.
        api.addBay({
            outdoor: "carbon", from: "carbonlab",
            id: "ionfurnace", sign: "FURNACE", label: "Ion City · Furnace & Metal Bay",
            kinds: ["carbon-furnace", "carbon-metal"],
            x: 16, y: 9, w: 3, h: 2, door: { x: 17, y: 10 },
            wall: "#cfd3dd", roof: "#b0413e",
            currentKind: () => {
                const st = STEPS[cs().step];
                return cs().recipe && st ? "carbon-" + st.tool : null;
            }
        });

    });

})();
