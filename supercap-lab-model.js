/* ========================================
   SUPERCAPACITOR THESIS LAB: PHYSICS MODEL

   A simplified, deterministic model of the whole workflow:
   material, conductivity treatment, photomask, lithography,
   bake, assembly and electrical testing (CV, GCD, EIS, cycling).

   The numbers are teaching-grade: they show the right trends and
   trade-offs, but they are not research-grade predictions.

   Everything lives on window.SCLab. No DOM here, so it can be
   tested in Node (module.exports at the bottom).
======================================== */

(function (root) {

    "use strict";


    /* ------------------------------------------------
       CATALOG
       Units: ssa m2/g, sigma S/m, density g/cm3,
       cArea F/m2, pseudo F/g, kappa S/m, lengths in um.
    ------------------------------------------------ */

    const MATERIALS = {

        ac: {
            name: "Activated carbon",
            blurb: "Cheap and very high surface area, but a poor conductor on its own.",
            ssa: 1500, sigma: 80, pseudo: 0, density: 0.5, micro: 0.7,
            wet: 0.55, life: 20000, cost: 1, vAq: 9
        },

        cnt: {
            name: "Carbon nanotube film",
            blurb: "Great conductor and strong mesh, moderate surface area.",
            ssa: 250, sigma: 25000, pseudo: 0, density: 0.55, micro: 0.1,
            wet: 0.8, life: 50000, cost: 3, vAq: 9
        },

        rgo: {
            name: "Reduced graphene oxide",
            blurb: "Sheets that restack: good conductivity, surface area limited by stacking.",
            ssa: 650, sigma: 3000, pseudo: 15, density: 0.6, micro: 0.2,
            wet: 0.6, life: 30000, cost: 2, vAq: 9
        },

        pedot: {
            name: "PEDOT:PSS polymer",
            blurb: "A conductive polymer that stores charge by surface redox. Heat-sensitive.",
            ssa: 60, sigma: 8000, pseudo: 90, density: 1.0, micro: 0.05,
            wet: 0.9, life: 2000, cost: 2, vAq: 0.8
        },

        mno2: {
            name: "MnO₂ (manganese oxide)",
            blurb: "Huge pseudocapacitance in neutral water, but almost an insulator.",
            ssa: 180, sigma: 5, pseudo: 220, density: 1.2, micro: 0.2,
            wet: 0.8, life: 1500, cost: 1, vAq: 0.9
        },

        mxene: {
            name: "Ti₃C₂ MXene",
            blurb: "Metallic conductivity plus fast pseudocapacitance. Expensive and oxidises.",
            ssa: 100, sigma: 200000, pseudo: 250, density: 2.0, micro: 0.05,
            wet: 0.9, life: 8000, cost: 5, vAq: 0.55
        }
    };


    // effects[materialId] overrides the default effect for that material.
    const TREATMENTS = {

        none: {
            name: "No treatment",
            blurb: "Use the material as it comes.",
            cost: 0, hours: 0,
            def: { sigma: 1, ssa: 1, wet: 1, pseudo: 0, pseudoMul: 1 },
            effects: {}
        },

        anneal400: {
            name: "Anneal at 400 °C in N₂",
            blurb: "Drives off binder and moisture; modest conductivity gain.",
            cost: 1, hours: 3,
            def: { sigma: 2, ssa: 0.95, wet: 1, pseudo: 0, pseudoMul: 1 },
            effects: {
                pedot: { sigma: 0.7, ssa: 0.9, wet: 1, pseudo: 0, pseudoMul: 0.8,
                    note: "PEDOT:PSS starts to degrade at 400 °C." },
                mno2: { sigma: 0.8, ssa: 0.85, wet: 1, pseudo: 0, pseudoMul: 0.8,
                    note: "The oxide crystallises and loses some active sites." },
                mxene: { sigma: 1.3, ssa: 1, wet: 1, pseudo: 0, pseudoMul: 1 }
            }
        },

        anneal800: {
            name: "Anneal at 800 °C in N₂",
            blurb: "Graphitises carbon for much better conductivity, but costs surface area and chemistry.",
            cost: 2, hours: 5,
            def: { sigma: 6, ssa: 0.85, wet: 0.9, pseudo: 0, pseudoMul: 1 },
            effects: {
                ac: { sigma: 4, ssa: 0.9, wet: 0.9, pseudo: 0, pseudoMul: 1 },
                rgo: { sigma: 10, ssa: 0.8, wet: 0.85, pseudo: 0, pseudoMul: 0.3,
                    note: "Oxygen groups are burnt off, so the pseudocapacitance drops." },
                pedot: { sigma: 0.01, ssa: 0.1, wet: 0.5, pseudo: 0, pseudoMul: 0,
                    note: "The polymer is destroyed at 800 °C." },
                mno2: { sigma: 1, ssa: 0.4, wet: 0.7, pseudo: 0, pseudoMul: 0.2,
                    note: "MnO₂ converts to an inactive oxide." },
                mxene: { sigma: 1.5, ssa: 0.7, wet: 0.85, pseudo: 0, pseudoMul: 0.6,
                    note: "Heat collapses the layers and starts to oxidise them." }
            }
        },

        reduce: {
            name: "Chemical reduction (ascorbic acid / hydrazine)",
            blurb: "Removes oxygen groups. Transforms graphene oxide, does little for the others.",
            cost: 1, hours: 2,
            def: { sigma: 1.2, ssa: 1, wet: 1, pseudo: 0, pseudoMul: 1 },
            effects: {
                rgo: { sigma: 8, ssa: 1, wet: 0.95, pseudo: 0, pseudoMul: 0.5 },
                ac: { sigma: 1.5, ssa: 1, wet: 0.95, pseudo: 0, pseudoMul: 1 }
            }
        },

        acid: {
            name: "Acid or solvent post-treatment (H₂SO₄ / DMSO)",
            blurb: "Strips insulating PSS from PEDOT and makes carbon wet more easily.",
            cost: 1, hours: 1,
            def: { sigma: 1, ssa: 1, wet: 1.2, pseudo: 0, pseudoMul: 1 },
            effects: {
                pedot: { sigma: 15, ssa: 1, wet: 1.05, pseudo: 0, pseudoMul: 1.1 },
                cnt: { sigma: 1.5, ssa: 1, wet: 1.2, pseudo: 0, pseudoMul: 1 },
                mno2: { sigma: 1, ssa: 0.6, wet: 1, pseudo: 0, pseudoMul: 0.8,
                    note: "Acid partly dissolves MnO₂." },
                mxene: { sigma: 0.9, ssa: 1, wet: 1, pseudo: 0, pseudoMul: 1 }
            }
        },

        ndope: {
            name: "Nitrogen doping (NH₃ at 700 °C)",
            blurb: "Puts nitrogen into the carbon lattice: better conductivity and wetting, a little pseudocapacitance.",
            cost: 2, hours: 4,
            def: { sigma: 2, ssa: 0.95, wet: 1.15, pseudo: 25, pseudoMul: 1 },
            effects: {
                rgo: { sigma: 3, ssa: 0.95, wet: 1.15, pseudo: 40, pseudoMul: 1 },
                cnt: { sigma: 1.2, ssa: 1, wet: 1.1, pseudo: 15, pseudoMul: 1 },
                pedot: { sigma: 0.01, ssa: 0.1, wet: 0.5, pseudo: 0, pseudoMul: 0,
                    note: "The polymer is destroyed at 700 °C." },
                mno2: { sigma: 1, ssa: 0.5, wet: 0.9, pseudo: 0, pseudoMul: 0.3,
                    note: "MnO₂ is reduced and loses its charge-storage sites." },
                mxene: { sigma: 1.1, ssa: 1, wet: 1, pseudo: 20, pseudoMul: 1 }
            }
        }
    };


    const MASK_TYPES = {

        film: {
            name: "Printed transparency film",
            blurb: "Quick and cheap. Printer resolution limits features to about 20 µm.",
            res: 20, cost: 1, hours: 2
        },

        chrome: {
            name: "Chrome-on-glass photomask",
            blurb: "Slow and costly, but resolves features of about 1 µm.",
            res: 1, cost: 4, hours: 24
        }
    };


    const RESISTS = {

        su8: {
            name: "SU-8 (negative, epoxy)",
            tone: "negative",
            blurb: "Thick, tough walls and tall features. UV exposure makes it harden.",
            tMin: 5, tMax: 100, tDefault: 20,
            dose: function (t) { return 100 + 5 * t; },
            res: function (t) { return 0.5 + 0.2 * t; },
            dev: function (t) { return 60 + 12 * t; },
            arMax: 10,
            bakeT: 150, bakeSigma: 28, bakeMin: 10, tooHot: 220,
            adh: 1.0, cost: 3
        },

        az: {
            name: "AZ-type positive photoresist",
            tone: "positive",
            blurb: "Thin and sharp. UV exposure makes it dissolve in developer.",
            tMin: 1, tMax: 12, tDefault: 3,
            dose: function (t) { return 60 + 15 * t; },
            res: function (t) { return 0.3 + 0.25 * t; },
            dev: function (t) { return 25 + 6 * t; },
            arMax: 3,
            bakeT: 115, bakeSigma: 12, bakeMin: 3, tooHot: 135,
            adh: 0.75, cost: 2
        },

        dry: {
            name: "Dry-film photopolymer (negative)",
            tone: "negative",
            blurb: "Laminated sheet: cheap and thick, but coarse and a little fragile.",
            tMin: 25, tMax: 75, tDefault: 40,
            dose: function (t) { return 80 + 1.5 * t; },
            res: function (t) { return 8 + 0.2 * t; },
            dev: function (t) { return 60 + 2 * t; },
            arMax: 1.5,
            bakeT: 100, bakeSigma: 18, bakeMin: 5, tooHot: 140,
            adh: 0.55, cost: 1
        }
    };


    const ELECTROLYTES = {

        acid: {
            name: "H₂SO₄ / PVA gel",
            blurb: "Acidic water gel: low voltage, small fast ions, great for pseudocapacitors.",
            kappa: 3.5, vMax: 1.0, cArea: 0.12, ion: 0.1,
            pseudoFactor: 1, aqueous: true, acidic: true, life: 1
        },

        neutral: {
            name: "1 M Na₂SO₄ (water)",
            blurb: "Neutral water: gentler on oxides and a wider window with carbon.",
            kappa: 8, vMax: 1.6, cArea: 0.10, ion: 0.15,
            pseudoFactor: 1, aqueous: true, acidic: false, life: 1
        },

        organic: {
            name: "1 M TEABF₄ in acetonitrile",
            blurb: "Organic: 2.7 V window, so far more energy, but bigger ions and no pseudocapacitance.",
            kappa: 5, vMax: 2.7, cArea: 0.08, ion: 0.55,
            pseudoFactor: 0.15, aqueous: false, acidic: false, life: 1.2
        },

        il: {
            name: "EMIM-BF₄ ionic liquid",
            blurb: "Widest window (3.5 V) but thick and slow, with large ions.",
            kappa: 1.4, vMax: 3.5, cArea: 0.07, ion: 0.8,
            pseudoFactor: 0.1, aqueous: false, acidic: false, life: 1.3
        },

        pbs: {
            name: "PBS (1× phosphate-buffered saline)",
            blurb: "The standard biological buffer: pH 7.4, 150 mM salt. Mild, but a modest conductor and a narrow window.",
            kappa: 1.6, vMax: 1.2, cArea: 0.10, ion: 0.15,
            pseudoFactor: 1, aqueous: true, acidic: false, life: 1,
            ionicStrength: 0.15, ph: 7.4
        },

        ferro: {
            name: "5 mM ferri/ferrocyanide in PBS",
            blurb: "PBS with the [Fe(CN)₆]³⁻/⁴⁻ redox couple. Adds a fast redox reaction at the electrodes (extra capacitance, but self-discharge through the shuttle).",
            kappa: 2.0, vMax: 1.0, cArea: 0.10, ion: 0.15,
            pseudoFactor: 1, aqueous: true, acidic: false, life: 0.9,
            ionicStrength: 0.17, ph: 7.4, redox: true, redoxPseudo: 0.05, tauSD: 150
        }
    };


    const QUESTIONS = [

        {
            id: "material",
            text: "Which electrode material gives the highest areal capacitance?",
            vary: "the electrode material (keep the mask and process the same)"
        },
        {
            id: "spacing",
            text: "How does finger spacing trade energy against power?",
            vary: "the finger width and gap in the mask"
        },
        {
            id: "treatment",
            text: "What treatment makes a low-cost carbon conductive enough to use?",
            vary: "the conductivity treatment, with and without a metal current collector"
        },
        {
            id: "electrolyte",
            text: "Which electrolyte gives the best energy density, and what does it cost in power?",
            vary: "the electrolyte only"
        },
        {
            id: "process",
            text: "How do exposure and bake settings affect device yield and quality?",
            vary: "the exposure dose, develop time or bake temperature"
        }
    ];


    // Test conditions the learner can pick from.
    const GRID = {
        scan: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000],       // mV/s
        current: [0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200]   // mA/cm2
    };


    /* ------------------------------------------------
       SMALL HELPERS
    ------------------------------------------------ */

    function clamp(x, lo, hi) {

        return Math.max(lo, Math.min(hi, x));
    }


    function rng(seed) {

        let s = (seed >>> 0) || 1;

        return function () {

            s = (s + 0x6D2B79F5) >>> 0;

            let t = s;

            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }


    function gauss(rand) {

        let u = 0;
        let v = 0;

        while (u === 0) { u = rand(); }
        while (v === 0) { v = rand(); }

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }


    function bell(ratio, width) {

        if (ratio <= 0) { return 0; }

        const x = Math.log(ratio) / width;

        return Math.exp(-x * x);
    }


    function pct(x) {

        return Math.round(x * 100) + "%";
    }


    /* ------------------------------------------------
       STAGE 1: MATERIAL RECIPE
       recipe: { mat, treat, collector (bool), tFilm (um) }
    ------------------------------------------------ */

    function processMaterial(recipe, el) {

        const m = MATERIALS[recipe.mat];
        const tr = TREATMENTS[recipe.treat] || TREATMENTS.none;
        const fx = tr.effects[recipe.mat] || tr.def;

        const notes = [];

        if (fx.note) { notes.push(fx.note); }

        const out = {

            sigma: m.sigma * fx.sigma,
            ssa: m.ssa * fx.ssa,
            util: clamp(m.wet * fx.wet, 0.05, 1),
            pseudo: (m.pseudo * fx.pseudoMul) + fx.pseudo,
            micro: m.micro,
            density: m.density,
            life: m.life,
            notes: notes
        };

        // Electrolyte compatibility.
        let lifeMul = 1;

        if (el) {

            if (recipe.mat === "mno2" && el.acidic) {

                out.ssa *= 0.5;
                lifeMul *= 0.1;
                notes.push("MnO₂ dissolves in acid, so this device will lose capacitance fast.");
            }

            if (recipe.mat === "mxene" && !el.acidic && el.aqueous) {

                lifeMul *= 0.5;
                notes.push("MXene oxidises faster in neutral water.");
            }

            if (recipe.mat === "pedot" && !el.aqueous) {

                lifeMul *= 0.7;
                notes.push("PEDOT:PSS swells and degrades in organic solvents.");
            }

            if (m.pseudo > 0 && el.pseudoFactor < 0.5) {

                notes.push("Pseudocapacitance needs water-based electrolyte. Here most of it is lost.");
            }

            out.pseudo *= el.pseudoFactor;

            // A dissolved redox couple adds fast surface redox capacity on any wetted area.
            if (el.redox) {

                out.pseudo += el.redoxPseudo * out.ssa * out.util * (1 - out.micro * el.ion * 0.9);

                notes.push("The ferri/ferrocyanide couple adds redox capacity but shuttles charge between the electrodes, so the device self-discharges quickly.");
            }
        }

        out.life *= lifeMul;

        out.cost = m.cost + tr.cost + (recipe.collector ? 3 : 0);
        out.hours = tr.hours + (recipe.collector ? 3 : 0);

        return out;
    }


    /* ------------------------------------------------
       STAGE 2: PHOTOMASK + LITHOGRAPHY
       mask:  { type, field: "dark"|"clear", N, w, g, L }
       litho: { resist, tResist, dose, dev, bakeT, bakeMin }
    ------------------------------------------------ */

    function lithography(mask, litho) {

        const rs = RESISTS[litho.resist];
        const mk = MASK_TYPES[mask.type];

        const notes = [];
        const tr = litho.tResist;

        const need = rs.dose(tr);
        const r = litho.dose / need;

        const fDose = bell(r, 0.5);

        if (r < 0.75) {
            notes.push("Exposure dose is only " + pct(r) + " of what this resist needs (about " +
                Math.round(need) + " mJ/cm²): the pattern is under-exposed.");
        } else if (r > 1.35) {
            notes.push("Exposure dose is " + pct(r) + " of the ideal (about " +
                Math.round(need) + " mJ/cm²): the pattern is over-exposed and features bleed.");
        }

        const devOpt = rs.dev(tr);
        const rd = litho.dev / devOpt;

        const fDev = bell(rd, 0.6);

        const residue = clamp(1 - rd, 0, 1);
        const undercut = clamp(rd - 1, 0, 1.5);

        if (rd < 0.75) {
            notes.push("Developed for " + pct(rd) + " of the ideal time: resist residue is left in the gaps.");
        } else if (rd > 1.5) {
            notes.push("Over-developed (" + pct(rd) + " of the ideal time): the features are undercut.");
        }

        // Feature bias: openings are where the electrodes will go.
        const sign = rs.tone === "positive" ? 1 : -1;

        let bias = sign * 0.12 * tr * (r - 1)
            - 0.35 * residue * Math.min(mask.w, 40)
            + 0.08 * tr * undercut;

        bias = clamp(bias, -0.45 * mask.w, 0.45 * mask.g);

        const wEff = mask.w + bias;
        const gEff = mask.g - bias;

        // Resolution.
        const minFeat = Math.min(mask.w, mask.g);
        const limit = Math.max(mk.res, rs.res(tr));

        const fRes = clamp((minFeat - 0.8 * limit) / (1.2 * limit), 0, 1);

        if (fRes < 0.5) {
            notes.push("The smallest feature (" + minFeat + " µm) is near this process's limit of about " +
                limit.toFixed(1) + " µm. " +
                (mk.res >= rs.res(tr) ? "The mask is the bottleneck." : "The resist thickness is the bottleneck."));
        }

        // Aspect ratio of the resist walls.
        const ar = tr / mask.g;
        const fAr = ar <= rs.arMax ? 1 : Math.exp(-1.5 * (ar / rs.arMax - 1));

        if (fAr < 0.8) {
            notes.push("The resist walls are " + ar.toFixed(1) + " times taller than they are wide: they lean and collapse.");
        }

        // Bake.
        const dT = (litho.bakeT - rs.bakeT) / rs.bakeSigma;

        const fBakeT = Math.exp(-dT * dT / 2);
        const fBakeTime = 1 - Math.exp(-litho.bakeMin / (0.5 * rs.bakeMin));

        let fBake = Math.pow(fBakeT, 0.7) * fBakeTime;

        let reflow = 0;

        if (litho.bakeT > rs.tooHot) {

            fBake *= 0.6;
            reflow = 1;

            notes.push("Baked at " + litho.bakeT + " °C, hotter than the resist tolerates: it cracks or flows.");

        } else if (dT < -1.3) {

            notes.push("Baking at " + litho.bakeT + " °C is too cool to fully harden the resist.");

        } else if (dT > 1.3) {

            notes.push("Baking at " + litho.bakeT + " °C is hotter than the ideal for this resist: edges round off.");
        }

        if (fBakeTime < 0.7) {
            notes.push("The bake time is too short to finish hardening the resist.");
        }

        if (litho.bakeMin > 3 * rs.bakeMin) {
            fBake *= 0.88;
            notes.push("A very long bake makes the resist brittle.");
        }

        const quality = clamp(fDose * fDev * fRes * fAr * Math.sqrt(fBake), 0, 1);

        // Polarity: the openings must be where the electrodes are.
        const inverted = (rs.tone === "positive") !== (mask.field === "dark");

        if (inverted) {
            notes.push(
                rs.tone === "positive" ?
                    "Positive resist dissolves where UV hits it, so it needs a dark-field mask (clear electrode pattern on a dark background). This mask prints the pattern inverted." :
                    "Negative resist hardens where UV hits it, so it needs a clear-field mask (dark electrode pattern on a clear background). This mask prints the pattern inverted."
            );
        }

        const bridged = gEff < 2;

        if (bridged) {
            notes.push("After exposure the gaps are almost closed. Neighbouring electrodes will touch.");
        }

        let shortProb = 0.6 * residue + (bridged ? 0.8 : 0) +
            0.35 * Math.pow(1 - quality, 1.5) + (mask.type === "film" ? 0.04 : 0.01);

        shortProb = clamp(shortProb, 0, 0.98);

        const lost = fRes <= 0.02 || fDose < 0.05 || fBake < 0.05;

        if (lost) {
            notes.push("The pattern does not survive this process. There is little or nothing left on the wafer.");
        }

        const adhesion = rs.adh * (0.4 + 0.6 * fBakeT);

        let status = "ok";

        if (inverted) { status = "inverted"; }
        else if (lost) { status = "lost"; }

        return {

            quality: quality,
            status: status,
            wEff: wEff,
            gEff: Math.max(gEff, 0.2),
            bias: bias,
            shortProb: shortProb,
            residue: residue,
            undercut: undercut,
            reflow: reflow,
            bridged: bridged,
            adhesion: adhesion,
            parts: {
                dose: fDose, develop: fDev, resolution: fRes,
                aspect: fAr, bake: fBake
            },
            need: need,
            devOpt: devOpt,
            limit: limit,
            notes: notes,
            cost: rs.cost + mk.cost,
            hours: mk.hours + 4
        };
    }


    /* ------------------------------------------------
       STAGE 3: BUILD ONE DEVICE
       spec = { recipe, mask, litho, electrolyte }
    ------------------------------------------------ */

    function describeBatch(spec) {

        const el = ELECTROLYTES[spec.electrolyte];

        const mat = processMaterial(spec.recipe, el);
        const lit = lithography(spec.mask, spec.litho);

        return { mat: mat, lit: lit, el: el };
    }


    function build(spec, seed) {

        const base = describeBatch(spec);

        const mat = base.mat;
        const lit = base.lit;
        const el = base.el;

        const rand = rng(seed);

        const vary = function (sd) { return 1 + sd * gauss(rand); };

        const N = spec.mask.N;
        const L = spec.mask.L;
        const t = spec.recipe.tFilm * vary(0.04);

        const w = lit.wEff * vary(0.02);
        const g = Math.max(lit.gEff * vary(0.02), 0.2);

        let status = lit.status;

        if (status === "ok" && rand() < lit.shortProb) {
            status = "short";
        }

        // Geometry in SI.
        const wM = w * 1e-6;
        const gM = g * 1e-6;
        const tM = t * 1e-6;
        const LM = L * 1e-3;

        const volumeCm3 = (N * w * 1e-4) * (t * 1e-4) * (L * 0.1);
        const mass = mat.density * volumeCm3;                         // g

        const footprintCm2 = ((N * w + (N - 1) * g) * 1e-4) * (L * 0.1);

        // Capacitance.
        const access = 1 - mat.micro * el.ion * 0.9;

        const cEdl = mat.ssa * mat.util * el.cArea * access * vary(0.03);   // F/g
        const cPs = mat.pseudo * vary(0.04);                                // F/g

        const qFactor = 0.6 + 0.4 * lit.quality;

        const cSpec = cEdl + cPs;
        const cell = cSpec * mass * qFactor / 4;                            // F

        // Resistance.
        const collectorSheet = spec.recipe.collector ? 4 : 0;               // S (about 100 nm Au)

        const sigmaEff = (mat.sigma * vary(0.05) + collectorSheet / tM) * qFactor;

        const rho = 1 / el.kappa;

        const rFinger = LM / (sigmaEff * wM * tM);
        const rElec = 4 * rFinger / (3 * N);

        const tc = tM + 20e-6;
        const rGap = rho * gM / (LM * tc * (N - 1));

        const pathM = Math.min(tM, wM / 2);
        const rPore = 6 * rho * pathM / (LM * N * (wM + tM));

        const rContact = spec.recipe.collector ? 1 : 3;

        const esr = rContact + rElec + rGap + rPore / 3;

        // Window.
        let vMax = el.vMax;

        if (el.aqueous) {
            vMax = Math.min(vMax, MATERIALS[spec.recipe.mat].vAq);
        }

        // Life.
        let thick = 1;

        if (t > 15) { thick = Math.exp(-(t - 15) / 30); }

        const life = mat.life * el.life * thick *
            clamp(lit.adhesion, 0.1, 1) * vary(0.1) * (spec.recipe.collector ? 0.9 : 1);

        return {

            status: status,
            N: N, w: w, g: g, L: L, t: t,
            footprint: footprintCm2,
            mass: mass,
            cell: Math.max(cell, 1e-12),
            fPseudo: cSpec > 0 ? cPs / cSpec : 0,
            esr: esr,
            rElec: rElec, rGap: rGap, rPore: rPore, rContact: rContact,
            vMax: vMax,
            life: life,
            seed: seed,
            quality: lit.quality,
            tauSD: 3000,
            rShort: 5 + 195 * rand(),
            electrolyte: spec.electrolyte,
            cost: mat.cost + lit.cost + 1,
            hours: mat.hours + lit.hours + 2
        };
    }


    /* ------------------------------------------------
       TESTS
    ------------------------------------------------ */

    function noiseFor(dev, tag) {

        return rng((dev.seed * 2654435761 + tag) >>> 0);
    }


    function capShape(dev, vop) {

        const fp = clamp(dev.fPseudo, 0, 1);
        const v0 = 0.5 * vop;
        const wd = 0.22 * vop;

        const raw = function (v) {

            const x = (v - v0) / wd;

            return (1 - fp) + fp * (0.35 + 2.2 * Math.exp(-x * x));
        };

        let sum = 0;

        for (let i = 0; i <= 50; i++) {
            sum += raw(vop * i / 50);
        }

        const mean = sum / 51;

        return function (v) { return dev.cell * raw(v) / mean; };
    }


    // Cyclic voltammetry. Returns the settled cycle as arrays v (V), i (A).
    function cv(dev, opt) {

        const vop = clamp(opt.vMax, 0.1, dev.vMax * 1.2);
        const rate = opt.scan / 1000;                             // V/s
        const noise = noiseFor(dev, 11);

        const half = vop / rate;
        const period = 2 * half;

        const pts = 360;
        const v = [];
        const i = [];

        if (dev.status === "short") {

            const r = dev.rShort;

            for (let k = 0; k <= pts; k++) {

                const ph = (k / pts) * period;
                const va = ph < half ? rate * ph : vop - rate * (ph - half);

                v.push(va);
                i.push(va / r + gauss(noise) * 0.004 * vop / r);
            }

            return { v: v, i: i, vop: vop, scan: opt.scan };
        }

        if (dev.status === "inverted" || dev.status === "lost") {

            for (let k = 0; k <= pts; k++) {

                const ph = (k / pts) * period;
                const va = ph < half ? rate * ph : vop - rate * (ph - half);

                v.push(va);
                i.push(gauss(noise) * 2e-9 + va * 1e-12 / 1e-3);
            }

            return { v: v, i: i, vop: vop, scan: opt.scan };
        }

        const cfun = capShape(dev, vop);
        const rLeak = dev.tauSD / dev.cell;

        const tau = dev.esr * dev.cell;
        const dtMax = Math.min(tau / 15, period / 3000);
        const dt = Math.max(dtMax, period / 12000);

        let vc = 0;
        let t = 0;

        const cycles = 2;
        const total = cycles * period;

        const outEvery = period / pts;
        let nextOut = period;                       // record second cycle

        while (t <= total) {

            const ph = t % period;
            const va = ph < half ? rate * ph : vop - rate * (ph - half);

            const c = cfun(clamp(vc, 0, vop));
            const a = 1 - Math.exp(-dt / (dev.esr * c));

            const before = vc;

            vc += (va - vc) * a;

            if (t >= nextOut - 1e-12 && v.length <= pts) {

                // Charge conservation, so the current stays right even when dt is large.
                const cur = c * (vc - before) / dt + vc / rLeak;

                v.push(va);
                i.push(cur);

                nextOut += outEvery;
            }

            t += dt;
        }

        const peak = Math.max.apply(null, i.map(Math.abs)) || 1e-9;

        for (let k = 0; k < i.length; k++) {
            i[k] += gauss(noise) * (0.004 * peak + 2e-9);
        }

        return { v: v, i: i, vop: vop, scan: opt.scan };
    }


    // Capacitance from a CV loop: C = (integral |i| dV) / (2 v dV).
    function cvCapacitance(loop) {

        let area = 0;

        for (let k = 1; k < loop.v.length; k++) {

            const dv = Math.abs(loop.v[k] - loop.v[k - 1]);

            area += 0.5 * (Math.abs(loop.i[k]) + Math.abs(loop.i[k - 1])) * dv;
        }

        return area / (2 * (loop.scan / 1000) * loop.vop);
    }


    // Galvanostatic charge-discharge at constant current (A).
    function gcd(dev, opt) {

        const vop = clamp(opt.vMax, 0.1, dev.vMax * 1.2);
        const cur = opt.current;
        const noise = noiseFor(dev, 23);

        const tt = [];
        const vv = [];

        if (dev.status === "short" || dev.status === "inverted" || dev.status === "lost") {

            const shorted = dev.status === "short";

            const level = shorted ? Math.min(cur * dev.rShort, vop * 0.3) : 4.5;

            for (let k = 0; k <= 200; k++) {

                tt.push(k);
                vv.push(level + gauss(noise) * 0.004);
            }

            return {
                t: tt, v: vv, vop: vop, current: cur,
                failed: true, cEst: 0, drop: 0, tCharge: 1, tDischarge: 0.01, energy: 0
            };
        }

        const cfun = capShape(dev, vop);

        let vc = 0;
        let time = 0;

        const cEst = dev.cell;

        // Three full cycles, with room to spare: big cells at low current take hours.
        const tCap = Math.max(5000, 12 * vop * cEst / Math.max(cur, 1e-15));
        const dt0 = Math.max(vop * cEst / cur / 1500, 1e-6);

        let phase = 0;                                  // 0 charging, 1 discharging
        let cycles = 0;

        const record = 2;

        let tCharge = 0;
        let tDischarge = 0;
        let eOut = 0;
        let eIn = 0;
        let drop = 0;

        let startRec = 0;
        let seg = 0;

        while (cycles < record + 1 && time < tCap && tt.length < 20000) {

            const sign = phase === 0 ? 1 : -1;
            const vTerm = vc + sign * cur * dev.esr;

            if (cycles >= record - 1 && cycles < record) {

                tt.push(time - startRec);
                vv.push(vTerm);
            }

            if (phase === 0 && vTerm >= vop) {

                if (cycles === record - 1) { tCharge = time - seg; }

                phase = 1;
                seg = time;
                drop = 2 * cur * dev.esr;

                continue;
            }

            if (phase === 1 && vTerm <= 0.001) {

                if (cycles === record - 1) { tDischarge = time - seg; }

                phase = 0;
                seg = time;
                cycles += 1;

                if (cycles === record - 1) { startRec = time; }

                continue;
            }

            const c = cfun(clamp(vc, 0, vop));

            vc += sign * cur * dt0 / c;

            if (cycles === record - 1) {

                const p = vTerm * cur * dt0;

                if (phase === 0) { eIn += p; } else { eOut += p; }
            }

            vc = Math.max(vc, 0);
            time += dt0;
        }

        const dvDis = Math.max(vop - drop, 1e-6);
        const cEstGcd = tDischarge > 0 ? cur * tDischarge / dvDis : 0;

        for (let k = 0; k < vv.length; k++) {
            vv[k] += gauss(noise) * 0.0015 * vop;
        }

        return {
            t: tt, v: vv, vop: vop, current: cur, failed: false,
            cEst: cEstGcd, drop: drop,
            tCharge: tCharge || 1, tDischarge: tDischarge,
            energy: eOut
        };
    }


    function cplx(re, im) { return { re: re, im: im }; }
    function cadd(a, b) { return cplx(a.re + b.re, a.im + b.im); }
    function cmul(a, b) { return cplx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }

    function cdiv(a, b) {

        const d = b.re * b.re + b.im * b.im;

        return cplx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
    }

    function csqrt(a) {

        const m = Math.hypot(a.re, a.im);

        return cplx(Math.sqrt((m + a.re) / 2), Math.sign(a.im || 1) * Math.sqrt((m - a.re) / 2));
    }

    function cexp(a) {

        const e = Math.exp(a.re);

        return cplx(e * Math.cos(a.im), e * Math.sin(a.im));
    }

    function ccoth(a) {

        const e2 = cexp(cplx(2 * a.re, 2 * a.im));

        return cdiv(cadd(e2, cplx(1, 0)), cadd(e2, cplx(-1, 0)));
    }


    // Electrochemical impedance spectroscopy. Returns f (Hz), re, im (ohm; im is -Z'').
    function eis(dev, opt) {

        const fMin = (opt && opt.fMin) || 0.01;
        const fMax = (opt && opt.fMax) || 100000;

        const noise = noiseFor(dev, 37);

        const f = [];
        const re = [];
        const imag = [];

        const n = 70;

        for (let k = 0; k < n; k++) {

            const fr = fMax * Math.pow(fMin / fMax, k / (n - 1));

            let z;

            if (dev.status === "short") {

                z = cplx(dev.rShort, 0);

            } else if (dev.status === "inverted" || dev.status === "lost") {

                const w0 = 2 * Math.PI * fr;

                z = cdiv(cplx(1, 0), cplx(1e-9, w0 * 2e-12));

            } else {

                const w = 2 * Math.PI * fr;
                const c = dev.cell;

                const rp = Math.max(dev.rPore, 1e-3);
                const rs = dev.esr - dev.rPore / 3;

                const x = cplx(0, w * rp * c);
                const sq = csqrt(x);

                const zTL = cmul(cdiv(cplx(rp, 0), sq), ccoth(sq));

                const rct = dev.fPseudo * 0.02 / c;
                const ci = 0.01 * c;

                const zCt = cdiv(cplx(rct, 0), cplx(1, w * rct * ci));

                z = cadd(cplx(rs, 0), cadd(zTL, zCt));
            }

            const s = 1 + 0.004 * gauss(noise);

            f.push(fr);
            re.push(z.re * s);
            imag.push(-z.im * s);
        }

        return { f: f, re: re, im: imag };
    }


    // Cycling stability.
    function cycling(dev, opt) {

        const noise = noiseFor(dev, 53);

        const vop = clamp(opt.vMax, 0.1, dev.vMax * 1.2);
        const frac = vop / dev.vMax;

        let vf = 1;

        if (frac > 0.9) { vf = Math.exp(-(frac - 0.9) * 8); }
        if (frac > 1.0) { vf *= 0.15; }

        const life = Math.max(dev.life * vf, 1);

        const marks = [];
        const ret = [];

        const total = opt.cycles;

        const failed = dev.status !== "ok";

        for (let k = 0; k <= 24; k++) {

            const n = k === 0 ? 0 : Math.round(Math.pow(10, Math.log10(Math.max(total, 10)) * k / 24));

            marks.push(n);

            const base = failed ? 0 : 100 * Math.exp(-n / life);

            ret.push(Math.max(base + gauss(noise) * 0.6, 0));
        }

        return { n: marks, retention: ret, life: life };
    }


    /* ------------------------------------------------
       DERIVED METRICS
    ------------------------------------------------ */

    function metricsFromGcd(dev, run) {

        const area = dev.footprint;

        const cell = run.cEst;
        const vTop = run.vop - run.drop / 2;

        const energy = 0.5 * cell * vTop * vTop;                       // J

        const esr = run.failed ? 0 : run.drop / (2 * run.current);

        const eff = run.tCharge > 0 ? run.tDischarge / run.tCharge : 0;

        return {
            C: cell,
            arealC: cell / area * 1000,                                // mF/cm2
            esr: esr,
            eff: eff,
            energyAreal: energy / 3600 * 1e6 / area,                   // uWh/cm2
            powerAreal: run.failed ? 0 : (vTop * vTop / (4 * Math.max(esr, 1e-3))) / area * 1000   // mW/cm2
        };
    }


    function ragone(dev, opt) {

        const pts = [];

        GRID.current.forEach(function (j) {

            const cur = j * dev.footprint * 1e-3;

            const run = gcd(dev, { vMax: opt.vMax, current: cur });

            if (run.failed || run.tDischarge <= 0) { return; }

            const avgP = (run.energy / run.tDischarge) / dev.footprint * 1000;      // mW/cm2
            const e = run.energy / 3600 * 1e6 / dev.footprint;                      // uWh/cm2

            pts.push({ j: j, e: e, p: avgP });
        });

        return pts;
    }


    function rateSweep(dev, opt) {

        const out = [];

        GRID.scan.forEach(function (s) {

            const loop = cv(dev, { vMax: opt.vMax, scan: s });

            out.push({ scan: s, C: dev.status === "ok" ? cvCapacitance(loop) : 0 });
        });

        return out;
    }


    const API = {

        MATERIALS: MATERIALS,
        TREATMENTS: TREATMENTS,
        MASK_TYPES: MASK_TYPES,
        RESISTS: RESISTS,
        ELECTROLYTES: ELECTROLYTES,
        QUESTIONS: QUESTIONS,
        GRID: GRID,

        processMaterial: processMaterial,
        lithography: lithography,
        describeBatch: describeBatch,
        build: build,

        cv: cv,
        cvCapacitance: cvCapacitance,
        gcd: gcd,
        eis: eis,
        cycling: cycling,
        ragone: ragone,
        rateSweep: rateSweep,
        metricsFromGcd: metricsFromGcd,

        rng: rng,
        clamp: clamp
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = API;
    }

    root.SCLab = API;

}(typeof window !== "undefined" ? window : globalThis));
