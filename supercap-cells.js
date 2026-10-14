/* ========================================
   SUPERCAPACITOR CELL FORMATS

   The planar lab builds a micro-supercapacitor: both electrodes sit side
   by side on one chip. Commercial and lab test cells are built the other
   way: two electrode sheets face each other across a thin separator.

   Formats:
     planar  interdigitated chip (handled by lab-engine.js)
     coin    two punched discs in a CR2032 case
     pouch   a stack of double-coated sheets in a laminate bag
     jelly   two long strips wound into a cylinder (jelly roll)

   For the stacked formats the drawing is ONE electrode sheet (the coated
   film, plus the foil it is coated on). The cell uses two identical sheets,
   so the device is symmetric.

   Equations (lengths in m, areas in m2 unless noted):
     facing area      A_f = A_sheet x n_faces
     capacitance      C = c_spec x m_electrode x quality / 2   (two electrodes in series)
     separator        R_sep = rho x N_M x t_sep / A_f           (MacMullin number N_M = tortuosity^2 / porosity)
     pores            R_pore = 2 x rho x N_film x t_film / A_f  (enters the ESR as R_pore / 3, de Levie)
     through film     R_film = 2 x t_film / (sigma_film x A_f)
     foil to tab      R_col = R_sheet x (path / width) / 3 per electrode (uniform pickup along the sheet)
     wound diameter   D = sqrt(D_mandrel^2 + 4 x L x t_turn / pi)

   Needs window.SCLab and window.LabGeom. Exposes window.SCCells.
======================================== */

(function (root) {

    "use strict";

    const FORMATS = {

        planar: {
            name: "Planar chip (interdigitated)",
            blurb: "Both electrodes side by side on one chip. Your drawing is the whole device, pads and all."
        },

        coin: {
            name: "Coin cell (CR2032)",
            blurb: "Two punched discs face each other across a separator, crimped in a 20 mm steel case. The standard lab test cell.",
            faces: function () { return 1; },
            contact: 0.4,
            sepD: 19000, caseD: 20000, caseH: 3200, caseMass: 2.6
        },

        pouch: {
            name: "Pouch cell (stacked sheets)",
            blurb: "Double-coated sheets stacked + − + − with separators between, tabs welded together, sealed in a foil laminate bag.",
            faces: function (d) { return 2 * sheetsOf(d) - 1; },
            contact: 0.01,
            seal: 5000, wall: 150, laminate: 0.025
        },

        jelly: {
            name: "Jelly roll (wound cylinder)",
            blurb: "Two long double-coated strips and two separators wound around a mandrel into a can, like an 18650 battery.",
            faces: function () { return 2; },
            contact: 0.01,
            mandrel: 3000, wall: 300, headroom: 8000
        }
    };


    // N_M: MacMullin number (how much the separator multiplies the electrolyte's resistance).
    // defects: weak spots per cm2 of facing area that can let the electrodes touch.
    const SEPARATORS = {

        cellulose: {
            name: "Cellulose paper (40 µm)",
            blurb: "The usual separator in commercial supercapacitors: cheap, wets easily, low resistance.",
            t: 40, NM: 4, defects: 0.00002, porosity: 0.6
        },

        pp: {
            name: "Polypropylene membrane (25 µm)",
            blurb: "A thin battery separator. Strong, but water-based electrolytes wet it poorly.",
            t: 25, NM: 8, defects: 0.00005, porosity: 0.4, hydrophobic: true
        },

        thin: {
            name: "Thin polyethylene (12 µm)",
            blurb: "Saves volume, but the electrodes can poke through it more easily.",
            t: 12, NM: 10, defects: 0.0005, porosity: 0.4, hydrophobic: true
        },

        glass: {
            name: "Glass fibre (260 µm)",
            blurb: "Thick and very open. It almost never shorts, so it is popular in coin cells, but it adds resistance and volume.",
            t: 260, NM: 2, defects: 0, porosity: 0.9
        }
    };


    function formatOf(design) {

        return design && FORMATS[design.format] ? design.format : "planar";
    }

    function isCell(design) {

        return !!design && design.kind === "supercap" && formatOf(design) !== "planar";
    }

    function sheetsOf(design) {

        const n = Math.round(Number(design && design.sheets));

        return n >= 1 && n <= 30 ? n : 10;
    }

    function separatorOf(design) {

        return design && SEPARATORS[design.separator] ? design.separator : "cellulose";
    }

    function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }


    /* ------------------------------------------------
       DESIGN CHECK
    ------------------------------------------------ */

    function check(design, out) {

        const fmt = formatOf(design);
        const F = FORMATS[fmt];

        const el = design.layers.filter(function (l) { return l.role === "electrode" && l.shapes.length; });
        const col = design.layers.filter(function (l) { return l.role === "collector" && l.shapes.length; });

        out.push({ level: "info", text: F.name + ": you draw one electrode sheet. The cell is built from two identical sheets facing each other across the separator." });

        if (!col.length) { out.push({ level: "warn", text: "No current collector foil. The film itself has to carry the current to the tab, which adds a lot of resistance in a big cell." }); }

        if (fmt === "coin" && el.length) {

            const box = root.LabGeom.bboxOf([].concat.apply([], el.map(function (l) { return l.shapes; })));
            const size = Math.max(box.x1 - box.x0, box.y1 - box.y0);

            if (size > F.caseD) { out.push({ level: "error", text: "The electrode is " + (size / 1000).toFixed(1) + " mm across. A CR2032 case only holds 20 mm." }); }
            else if (size > F.sepD) { out.push({ level: "error", text: "The electrode is wider than the 19 mm separator disc, so its edge touches the other electrode. Keep it under about 16 mm." }); }
        }

        if (design.layers.some(function (l) { return l.role === "insulation" && l.shapes.length; })) {

            out.push({ level: "info", text: "Insulation layers are ignored in a stacked cell. The separator keeps the electrodes apart." });
        }
    }


    /* ------------------------------------------------
       BUILD ONE CELL
       ctx comes from LabEngine.fabricate after lithography.
    ------------------------------------------------ */

    function analyze(ctx) {

        const SC = root.SCLab;
        const G = root.LabGeom;
        const E = root.LabEngine;

        const design = ctx.design;
        const per = ctx.per;
        const vary = ctx.vary;
        const rand = ctx.rand;
        const notes = ctx.notes;
        const info = ctx.info;

        const fmt = formatOf(design);
        const F = FORMATS[fmt];
        const sep = SEPARATORS[separatorOf(design)];
        const el = SC.ELECTROLYTES[design.electrolyte];

        const fail = function (reason) {

            return ctx.finish({
                status: "lost", reason: reason, cell: 1e-9, esr: 100, fPseudo: 0, rPore: 1, vMax: el.vMax,
                life: 1000, quality: 0, tauSD: 3000, rShort: 50
            });
        };

        const elecIdx = [];
        const colIdx = [];

        per.forEach(function (q, k) {

            if (q.p.status === "lost" || !ctx.shapesOf[k].length) { return; }

            if (q.layer.role === "electrode") { elecIdx.push(k); }
            if (q.layer.role === "collector") { colIdx.push(k); }
        });

        if (!elecIdx.length) { notes.push("There is no electrode film to coat."); return fail("No electrode layer"); }

        // Sheet geometry from the drawing, after cutting (holes are subtracted).
        const shapes = [];

        elecIdx.forEach(function (k) { ctx.shapesOf[k].forEach(function (s) { shapes.push(s); }); });

        const box = G.bboxOf(shapes);
        const pxA = Math.max(Math.sqrt((box.x1 - box.x0) * (box.y1 - box.y0) / 250000), 1);
        const areaUm2 = G.unionArea(shapes, box, pxA).area;

        if (areaUm2 <= 0) { notes.push("The electrode sheet has no area."); return fail("No electrode area"); }

        const bw = box.x1 - box.x0;
        const bh = box.y1 - box.y0;

        const nF = F.faces(design);
        const A = areaUm2 * 1e-12;                       // m2, one face of one sheet
        const Af = A * nF;                               // m2 facing the separator

        // Film: thickest electrode layer wins; each layer's material adds its mass.
        let mass = 0;
        let cSum = 0;
        let cpSum = 0;
        let tFilm = 0;
        let sigmaFilm = 0;
        let quality = 0;
        let micro = 0;
        let vMax = el.vMax;
        let life = Infinity;

        elecIdx.forEach(function (k) {

            const l = per[k].layer;
            const mat = SC.processMaterial({ mat: l.material, treat: l.treat, collector: colIdx.length > 0, tFilm: l.thickness }, el);
            const access = 1 - mat.micro * el.ion * 0.9;
            const cEdl = mat.ssa * mat.util * el.cArea * access * vary(0.03);
            const cPs = mat.pseudo * vary(0.04);
            const t = l.thickness * vary(0.03);
            const m = mat.density * (A * 1e4) * (t * 1e-4) * nF;          // g per electrode

            mass += m;
            cSum += (cEdl + cPs) * m;
            cpSum += cPs * m;
            tFilm = Math.max(tFilm, t);
            sigmaFilm += mat.sigma * vary(0.05) * t;
            micro = Math.max(micro, mat.micro);
            quality = Math.max(quality, per[k].p.quality);

            if (el.aqueous) { vMax = Math.min(vMax, SC.MATERIALS[l.material].vAq); }

            life = Math.min(life, mat.life);

            mat.notes.forEach(function (t2) { if (notes.indexOf(t2) < 0) { notes.push(t2); } });
        });

        sigmaFilm = sigmaFilm / Math.max(tFilm, 1e-9);

        const q = 0.85 + 0.15 * quality;
        const cell = cSum * q / 2;                                         // two equal electrodes in series
        const fPseudo = cSum > 0 ? cpSum / cSum : 0;

        // Resistances.
        const rho = 1 / el.kappa;
        const tF = tFilm * 1e-6;

        let NM = sep.NM;

        if (sep.hydrophobic && el.aqueous) {

            NM *= 2.5;
            notes.push(sep.name + " is hydrophobic, so the water-based electrolyte only partly fills its pores.");
        }

        const rSep = rho * NM * sep.t * 1e-6 / Af;
        const nFilm = 3 * (1 + 2 * micro * el.ion);
        const rPore = 2 * rho * nFilm * tF / Af;
        const rFilm = 2 * tF / (Math.max(sigmaFilm, 1e-6) * Af);

        // Sheet resistance carrying current to the tab.
        let rSheet;
        let foilT = 0;
        let foilName = "";
        let corrodes = false;

        if (colIdx.length) {

            let g = 0;

            colIdx.forEach(function (k) {

                const l = per[k].layer;
                const mt = E.METALS[l.material] || { sigma: 3.5e7 };

                g += mt.sigma * l.thickness * 1e-6 * (0.85 + 0.15 * per[k].p.quality);
                foilT += l.thickness;
                foilName = mt.name;

                if (!mt.noble && el.aqueous) { corrodes = true; }
            });

            rSheet = 1 / g;

        } else {

            rSheet = 1 / (Math.max(sigmaFilm, 1e-6) * tF);
        }

        let rCol = 0;
        let rContact = F.contact * vary(0.1);

        if (fmt === "coin") {

            // Current leaves straight through the disc into the case.
            if (!colIdx.length) { rContact += 0.6; }

        } else if (fmt === "pouch") {

            // Tab along the top edge; every sheet has its own tab, all welded together.
            rCol = 2 * rSheet * (bh / Math.max(bw, 1)) / 3 / sheetsOf(design);

        } else {

            // One tab at the end of each strip.
            rCol = 2 * rSheet * (Math.max(bw, bh) / Math.max(Math.min(bw, bh), 1)) / 3;
        }

        const esr = rContact + rCol + rFilm + rSep + rPore / 3;

        // Size and mass of the packaged cell (cm, g).
        const tf = tFilm * 1e-4;
        const ts = sep.t * 1e-4;
        const tc = foilT * 1e-4;

        let vol;
        let pack;
        let size;

        if (fmt === "coin") {

            vol = Math.PI * Math.pow(F.caseD * 1e-4 / 2, 2) * F.caseH * 1e-4;
            pack = F.caseMass;
            size = "20 mm × 3.2 mm coin";

            if (2 * (tf + tc) + ts > 0.25) { notes.push("The two electrodes and the separator are thicker than the 2.5 mm a CR2032 can hold."); }

        } else if (fmt === "pouch") {

            const n = sheetsOf(design);
            const stack = 2 * n * tc + 2 * nF * tf + nF * ts;
            const W = bw * 1e-4 + 2 * F.seal * 1e-4;
            const H = bh * 1e-4 + 2 * F.seal * 1e-4;
            const T = stack + 2 * F.wall * 1e-4;

            vol = W * H * T;
            pack = 2 * W * H * F.laminate;
            size = (W * 10).toFixed(0) + " × " + (H * 10).toFixed(0) + " × " + (T * 10).toFixed(1) + " mm pouch";

        } else {

            const L = Math.max(bw, bh) * 1e-4;
            const Wd = Math.min(bw, bh) * 1e-4;
            const turn = 2 * tc + 4 * tf + 2 * ts;
            const Dm = F.mandrel * 1e-4;
            const D = Math.sqrt(Dm * Dm + 4 * L * turn / Math.PI) + 2 * F.wall * 1e-4;
            const H = Wd + F.headroom * 1e-4;

            vol = Math.PI * D * D / 4 * H;
            pack = 7.9 * F.wall * 1e-4 * (Math.PI * D * H + Math.PI * D * D / 2);
            size = (D * 10).toFixed(1) + " mm × " + (H * 10).toFixed(0) + " mm can";
            info.cellDiameter = D * 10;
        }

        const filmVol = 2 * (A * 1e4) * tf * nF;
        const sepVol = (A * 1e4) * nF * ts * 1.05;
        const foilMass = colIdx.length ? 2.7 * (A * 1e4) * tc * (fmt === "pouch" ? 2 * sheetsOf(design) : 2) : 0;
        const electrolyteMass = 1.2 * (filmVol * 0.6 + sepVol * sep.porosity);
        const cellMass = 2 * mass + foilMass + electrolyteMass + 0.4 * sepVol + pack;

        // Shorts: weak spots in the separator, and electrodes that overhang it.
        let pShort = 1 - Math.exp(-sep.defects * Af * 1e4 * (1 + tFilm / 100));

        if (fmt === "coin" && Math.max(bw, bh) > F.sepD) { pShort = 1; }

        // Life.
        life *= el.life * vary(0.1);

        if (tFilm > 150) { life *= Math.exp(-(tFilm - 150) / 150); }

        if (corrodes) {

            life *= el.acidic ? 0.1 : 0.4;
            notes.push(foilName + " corrodes in a water-based electrolyte. Use a noble foil (gold, titanium or stainless steel) or an organic electrolyte.");
        }

        let status = "ok";
        let reason = "";

        // Its own random stream, so the short draw is not tied to the earlier process scatter.
        const uShort = SC.rng(((ctx.seed >>> 0) * 2654435761 + 71) >>> 0)();

        if (uShort < pShort) {

            status = "short";
            reason = pShort >= 1 ? "The electrode overhangs the separator and touches the other electrode." : "The electrodes touched through a weak spot in the separator.";
        }

        info.parts = { rContact: rContact, rCol: rCol, rFilm: rFilm, rSep: rSep, rPore: rPore };
        info.cell = {
            format: fmt, sheets: fmt === "pouch" ? sheetsOf(design) : 1, faces: nF, separator: sep.name,
            areaSheet: areaUm2, areaFacing: areaUm2 * nF, tFilm: tFilm, massActive: 2 * mass,
            volume: vol, cellMass: cellMass, size: size
        };
        info.pShort = pShort;
        info.areaPlus = areaUm2 * nF;
        info.areaMinus = areaUm2 * nF;

        return ctx.finish({
            status: status, reason: reason,
            cell: Math.max(cell, 1e-12),
            fPseudo: fPseudo,
            esr: esr, rElec: rCol + rFilm, rGap: rSep, rPore: rPore, rContact: rContact,
            vMax: vMax, life: Math.max(life, 1),
            quality: quality, tauSD: el.tauSD || 3000, rShort: 0.5 + 20 * rand(),
            areaPlus: areaUm2 * nF, areaMinus: areaUm2 * nF,
            thickness: tFilm, mass: 2 * mass,
            facing: Af * 1e4, volume: vol, cellMass: cellMass, format: fmt
        });
    }


    root.SCCells = {
        FORMATS: FORMATS, SEPARATORS: SEPARATORS,
        formatOf: formatOf, isCell: isCell, sheetsOf: sheetsOf, separatorOf: separatorOf,
        check: check, analyze: analyze, clamp: clamp
    };

}(typeof window !== "undefined" ? window : globalThis));
