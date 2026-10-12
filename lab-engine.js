/* ========================================
   LAB ENGINE

   Turns a layer stack drawn by the learner into numbers:
     - catalogs of layer roles, metals and insulators
     - per-layer patterning (mask, exposure, bake) quality
     - design checks (missing pads, buried contacts, ...)
     - fabricate(): perturb the layers like a real run (misalignment,
       feature bias), work out which conductors connect through which
       layers, then derive capacitance, resistance, shorts and life
       from the actual geometry.

   Needs window.SCLab (supercap-lab-model.js) and window.LabGeom.
   Lives on window.LabEngine.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab || require("./supercap-lab-model.js");
    const G = root.LabGeom || require("./lab-geometry.js");

    // Photoresists: SU-8 can be thin too in this lab.
    SC.RESISTS.su8.tMin = 1;


    /* ------------------------------------------------
       CATALOGS
    ------------------------------------------------ */

    const ROLES = {

        electrode: { name: "Electrode (active material)", conductive: true, color: "#54e0c7" },
        collector: { name: "Metal (collector, contact, gate)", conductive: true, color: "#ffb86b" },
        insulation: { name: "Insulation (dielectric, passivation)", conductive: false, color: "#8aa4ff" },
        semiconductor: { name: "Semiconductor (channel)", conductive: false, color: "#c792ff" },
        channel: { name: "Fluidic channel layer", conductive: false, color: "#4dd0ff" },
        membrane: { name: "Porous membrane", conductive: false, color: "#ff7a90" },
        substrate: { name: "Probe body (substrate)", conductive: false, color: "#9aa7c0" },
        coating: { name: "Coating on the sites", conductive: false, color: "#d68cff" }
    };

    const METALS = {

        au: { name: "Gold (Ti/Au)", sigma: 4.1e7, noble: true, cost: 3, hours: 3, adh: 0.9, thick: 0.1 },
        pt: { name: "Platinum", sigma: 9.4e6, noble: true, cost: 4, hours: 3, adh: 0.85, thick: 0.1 },
        cu: { name: "Copper", sigma: 5.9e7, noble: false, cost: 1, hours: 3, adh: 0.7, thick: 0.2 },
        al: { name: "Aluminium", sigma: 3.5e7, noble: false, cost: 1, hours: 3, adh: 0.8, thick: 0.2 },
        ti: { name: "Titanium", sigma: 2.4e6, noble: true, cost: 2, hours: 3, adh: 0.95, thick: 0.1 },
        ito: { name: "ITO (transparent)", sigma: 1e6, noble: true, cost: 3, hours: 4, adh: 0.8, thick: 0.15 },
        agcl: { name: "Ag/AgCl (reference-grade)", sigma: 5e7, noble: false, cost: 3, hours: 4, adh: 0.7, thick: 0.2 }
    };

    // How harmful the metal is to cells in contact with it (0 = harmless, 1 = kills them).
    const TOXIC = { au: 0, pt: 0, ti: 0, ito: 0, agcl: 0.15, al: 0.4, cu: 1 };

    // Fluidic channel films. absorb: how strongly the wall soaks up small hydrophobic molecules.
    const CHANNEL_MATERIALS = {

        su8: { name: "SU-8 channel walls", blurb: "Rigid, no drug absorption. Bonded to a lid.", photo: true, absorb: 0, cost: 3, hours: 4, adh: 1.0, thick: 100 },
        pdms: { name: "PDMS (cast from an SU-8 master)", blurb: "The soft-lithography standard: flexible and gas permeable, but it soaks up hydrophobic drugs.", photo: true, absorb: 1, cost: 2, hours: 6, adh: 0.8, thick: 100 },
        dryfilm: { name: "Dry-film resist channels", blurb: "Quick and cheap laminated channels. Coarser and a little fragile.", photo: true, absorb: 0.1, cost: 1, hours: 3, adh: 0.6, thick: 50 }
    };

    // Porous membranes. t: thickness um, poreD: pore diameter um, porosity: open area fraction.
    const MEMBRANES = {

        pet: { name: "PET track-etched (12 \u00B5m)", blurb: "The usual Transwell membrane: clear, flat, 0.4 \u00B5m pores.", t: 12, poreD: 0.4, porosity: 0.126, cost: 2, hours: 1, adh: 1.0, thick: 12 },
        pc: { name: "Polycarbonate track-etched (10 \u00B5m)", blurb: "Similar to PET but cloudier to image through.", t: 10, poreD: 0.4, porosity: 0.1, cost: 2, hours: 1, adh: 1.0, thick: 10 },
        pdms: { name: "Thin porous PDMS (10 \u00B5m)", blurb: "Soft and bondable, but with big pores and some drug absorption.", t: 10, poreD: 3, porosity: 0.15, cost: 3, hours: 3, adh: 0.8, thick: 10 },
        parylene: { name: "Parylene-C microporous (1 \u00B5m)", blurb: "Very thin, so molecules cross it quickly. Fragile.", t: 1, poreD: 1, porosity: 0.1, cost: 4, hours: 5, adh: 0.7, thick: 1 },
        sin: { name: "Silicon nitride nanoporous (0.5 \u00B5m)", blurb: "Ultra-thin and clear with tiny pores. Expensive.", t: 0.5, poreD: 0.1, porosity: 0.05, cost: 5, hours: 6, adh: 0.9, thick: 0.5 }
    };

    // Probe bodies. E: Young's modulus in GPa (brain tissue is about 0.000003 GPa).
    const NEURAL_SUBSTRATES = {

        pi: { name: "Polyimide (flexible)", blurb: "The usual flexible probe body: tough, thin and about as stiff as a plastic film.", E: 2.5, cost: 3, hours: 5, adh: 0.9, thick: 10 },
        parylene: { name: "Parylene-C (flexible)", blurb: "Very conformal, biocompatible and flexible. Softer to process than polyimide.", E: 2.8, cost: 3, hours: 4, adh: 0.7, thick: 10 },
        su8: { name: "SU-8 (stiffer polymer)", blurb: "Easy to pattern thick, a little brittle.", E: 3, cost: 2, hours: 3, adh: 0.85, thick: 15 },
        si: { name: "Silicon (rigid)", blurb: "Stays straight and goes into tissue easily, but it is 60,000 times stiffer than polyimide.", E: 170, cost: 4, hours: 6, adh: 0.95, thick: 15 }
    };

    // Coatings applied to the metal sites. Their physics (capacitance, charge storage, chemistry) is in lab-neural-model.js.
    const NEURAL_COATINGS = {

        pedot: { name: "PEDOT:PSS (conducting polymer)", blurb: "Soft, hydrated and very capacitive: cuts impedance and noise. Can peel off in time.", cost: 2, hours: 3, adh: 0.6, thick: 0.5 },
        ptblack: { name: "Platinum black", blurb: "A fuzzy, high-area platinum deposit. Low impedance, but fragile.", cost: 2, hours: 2, adh: 0.4, thick: 1 },
        irox: { name: "Iridium oxide", blurb: "Stores a lot of charge by redox, the standard for stimulating electrodes.", cost: 3, hours: 4, adh: 0.6, thick: 0.3 },
        tin: { name: "Titanium nitride", blurb: "Hard, porous and stable. A good all-round recording and stimulation coating.", cost: 3, hours: 4, adh: 0.85, thick: 0.3 },
        cnt: { name: "Carbon nanotubes", blurb: "A mat of nanotubes: huge area and fast electron transfer, the best for detecting dopamine.", cost: 3, hours: 3, adh: 0.5, thick: 0.5 },
        nafion: { name: "Nafion (ion-exchange film)", blurb: "Negatively charged, so it keeps out ascorbic acid and other anions while letting dopamine through.", cost: 1, hours: 1, adh: 0.8, thick: 0.3 },
        gluox: { name: "Glutamate oxidase enzyme layer", blurb: "Turns glutamate into hydrogen peroxide, which the platinum underneath detects. The enzyme slowly dies.", cost: 4, hours: 3, adh: 0.5, thick: 2 }
    };

    // Layers that are bought, cut or dropped on rather than patterned with a photomask. limit: smallest piece in um.
    const SHEET_ROLES = {

        membrane: {
            table: MEMBRANES, limit: 50,
            lost: "Membranes are cut with a laser or die cutter, not photolithography. Pieces smaller than about 50 \u00B5m cannot be cut.",
            hint: "A membrane is bought as a sheet and cut to shape with a laser or a die cutter, so there is no resist, exposure or bake. Its pores and thickness come with the material."
        },
        substrate: {
            table: NEURAL_SUBSTRATES, limit: 20,
            lost: "The probe outline is cut with a laser or etched through. Pieces smaller than about 20 \u00B5m cannot be cut.",
            hint: "The probe body is a film that is released and cut to the outline you draw (laser or deep etch). There is no resist, exposure or bake for this layer."
        },
        coating: {
            table: NEURAL_COATINGS, limit: 10,
            lost: "Coatings are electroplated or dropped onto bare metal, not defined with a mask. Areas smaller than about 10 \u00B5m cannot be placed.",
            hint: "A coating is electroplated or dropped onto the bare metal inside the area you draw. It only sticks to exposed metal, and it can miss a site if the area is misplaced. There is no resist, exposure or bake."
        }
    };

    // eps: relative permittivity, ebd: breakdown field (MV/cm), dpin: pinhole density at 30 nm (per cm2),
    // beta: pH response of the surface (1 = Nernstian), dvt: threshold shift from fixed charge (V).
    const INSULATORS = {

        su8: { name: "SU-8 (photodefinable)", eps: 3.2, ebd: 0.5, dpin: 2e4, beta: 0.1, dvt: -0.4, d0: 15, photo: true, cost: 2, hours: 3, adh: 1.0, thick: 2 },
        pi: { name: "Polyimide (photodefinable)", eps: 3.4, ebd: 3, dpin: 1e4, beta: 0.1, dvt: -0.3, d0: 20, photo: true, cost: 3, hours: 5, adh: 0.9, thick: 2 },
        parylene: { name: "Parylene-C (etched)", eps: 3.1, ebd: 2, dpin: 3e3, beta: 0, dvt: 0, d0: 5, photo: false, cost: 3, hours: 4, adh: 0.7, thick: 1 },
        sio2: { name: "SiO\u2082 (PECVD, etched)", eps: 3.9, ebd: 10, dpin: 5e3, beta: 0.4, dvt: 0.1, d0: 30, photo: false, cost: 3, hours: 4, adh: 0.9, thick: 0.5 },
        al2o3: { name: "Al\u2082O\u2083 (ALD, etched)", eps: 9, ebd: 6, dpin: 1e3, beta: 0.9, dvt: -0.3, d0: 2, photo: false, cost: 4, hours: 5, adh: 0.9, thick: 0.1 },
        hfo2: { name: "HfO\u2082 (ALD, etched)", eps: 20, ebd: 5, dpin: 3e3, beta: 0.85, dvt: 0.2, d0: 4, photo: false, cost: 5, hours: 5, adh: 0.9, thick: 0.03 },
        si3n4: { name: "Si\u2083N\u2084 (PECVD, etched)", eps: 7.5, ebd: 8, dpin: 3e3, beta: 0.8, dvt: 0.05, d0: 10, photo: false, cost: 3, hours: 4, adh: 0.9, thick: 0.1 }
    };

    // Channel materials. mu: mobility cm2/Vs, vt: threshold (or Dirac point) V, n0: sheet carriers with no gate (cm-2),
    // dit: interface trap density (cm-2/eV), chi: electron affinity (n) or ionisation energy (p) in eV, eg: band gap eV,
    // beta: pH response when the bare channel touches water, water: stability in water (1 = stable).
    const SEMICONDUCTORS = {

        mos2: { name: "MoS\u2082 (few-layer)", blurb: "n-type, solid mobility and a clean off-state. Stable in water.", type: "n", mu: 30, vt: 1.0, n0: 2e10, dit: 3e11, chi: 4.2, eg: 1.8, beta: 0.1, water: 1, cost: 4, hours: 6, adh: 0.8, thick: 0.01 },
        igzo: { name: "IGZO (oxide)", blurb: "n-type amorphous oxide: uniform and very low leakage.", type: "n", mu: 10, vt: 1.5, n0: 1e10, dit: 1e12, chi: 4.2, eg: 3.2, beta: 0.4, water: 0.8, cost: 3, hours: 5, adh: 0.9, thick: 0.03 },
        si: { name: "Silicon (thin film)", blurb: "n-type thin silicon: the textbook MOSFET channel. Dissolves slowly in water.", type: "n", mu: 250, vt: 0.5, n0: 5e10, dit: 5e10, chi: 4.05, eg: 1.12, beta: 0.4, water: 0.5, cost: 3, hours: 6, adh: 0.95, thick: 0.05 },
        in2o3: { name: "In\u2082O\u2083 nanoribbons", blurb: "n-type metal-oxide channel often used for biosensors.", type: "n", mu: 30, vt: 0.3, n0: 5e10, dit: 5e11, chi: 4.3, eg: 3.6, beta: 0.5, water: 0.9, cost: 3, hours: 5, adh: 0.8, thick: 0.01 },
        graphene: { name: "Graphene", blurb: "Ambipolar, very high mobility and no real off-state. Very sensitive but never fully off.", type: "ambi", mu: 2000, vt: 0.3, n0: 5e11, dit: 2e11, chi: 4.5, eg: 0, beta: 0.05, water: 1, cost: 4, hours: 6, adh: 0.6, thick: 0.0004 },
        cnt: { name: "Carbon nanotube network", blurb: "p-type network with good mobility and solution stability.", type: "p", mu: 60, vt: -0.8, n0: 5e10, dit: 5e11, chi: 4.8, eg: 0.7, beta: 0.2, water: 1, cost: 3, hours: 5, adh: 0.7, thick: 0.005 },
        p3ht: { name: "P3HT (organic)", blurb: "p-type organic semiconductor: soft and cheap, low mobility.", type: "p", mu: 0.05, vt: -1.0, n0: 1e10, dit: 3e11, chi: 5.0, eg: 2.0, beta: 0.1, water: 0.4, cost: 1, hours: 3, adh: 0.8, thick: 0.05 }
    };

    // Metal work functions (eV) set the contact barrier to the semiconductor.
    const WORKFUNCTION = { au: 5.1, pt: 5.65, cu: 4.65, al: 4.1, ti: 4.3, ito: 4.7 };

    const MATERIAL_TABLE = { electrode: SC.MATERIALS, collector: METALS, insulation: INSULATORS, semiconductor: SEMICONDUCTORS, channel: CHANNEL_MATERIALS, membrane: MEMBRANES, substrate: NEURAL_SUBSTRATES, coating: NEURAL_COATINGS };

    const DEFAULT_MATERIAL = { electrode: "rgo", collector: "au", insulation: "su8", semiconductor: "mos2", channel: "su8", membrane: "pet", substrate: "pi", coating: "pedot" };

    // roles: layer types offered. pads: contact-pad labels. need: labels that must exist for the device to work.
    const KINDS = {

        supercap: { name: "Supercapacitor", ready: true, blurb: "Micro-supercapacitor with two electrodes and an electrolyte.", roles: ["electrode", "collector", "insulation"], pads: ["+", "\u2212"], need: ["+", "\u2212"] },
        fet: { name: "MOSFET / thin-film transistor", ready: true, blurb: "Source, drain and gate over a semiconductor channel, measured dry.", roles: ["semiconductor", "collector", "insulation"], pads: ["S", "D", "G"], need: ["S", "D", "G"] },
        biofet: { name: "BioFET (liquid-gated sensor)", ready: true, blurb: "A transistor whose channel is open to a solution, used to sense pH, charge and redox species.", roles: ["semiconductor", "collector", "insulation"], pads: ["S", "D", "G"], need: ["S", "D"] },
        bbb: { name: "Blood-brain barrier chip", ready: true, blurb: "A two-channel chip with a porous membrane, endothelial cells and electrodes to measure the barrier (TEER) and what crosses it.", roles: ["collector", "channel", "membrane", "insulation"], pads: ["A", "B", "I", "O"], need: ["A", "B", "I", "O"], padRoles: ["channel"], portPads: ["I", "O"], padNames: { A: "blood-side electrode", B: "brain-side electrode", I: "inlet", O: "outlet" }, padText: "Draw a pad labelled A on the electrode in the blood-side (apical) channel and B on the electrode in the brain-side (basolateral) channel, using the Pad tool on a metal layer. Each channel layer also needs an inlet pad (I) and an outlet pad (O): draw them on that channel layer, overlapping the channel. Fluid in different channel layers only joins where no membrane or insulation separates them." },
        neural: { name: "Neural probe (electrode array)", ready: true, blurb: "A thin probe with recording and sensing sites: measure impedance, neural spikes, dopamine and glutamate, and see how it survives in tissue.", roles: ["collector", "insulation", "substrate", "coating"], pads: ["1", "2", "3", "4", "5", "6", "7", "8"], need: ["1"], padText: "Each channel is one electrode site connected by a trace to a numbered contact pad (1 to 8). Draw the pad with the Pad tool on a metal layer and pick its number. The insulation layer is a film with windows: open a window over each site and over each pad, and leave the traces covered. Draw the probe outline on the substrate layer, and the coating over the sites that need one." },
    };

    // Kind handlers register their own analysis and templates here.
    const HANDLERS = {};

    function defaultMaterial(role) { return DEFAULT_MATERIAL[role]; }

    // Whether the shapes drawn on a layer are windows cut through a film ("cut") or the material itself ("add").
    function defaultMode(role, material) {

        if (role === "insulation") { return "cut"; }

        if (role === "channel") { return material === "pdms" ? "add" : "cut"; }

        return "add";
    }


    function roleOf(layer) { return ROLES[layer.role]; }

    function materialOf(layer) { return (MATERIAL_TABLE[layer.role] || {})[layer.material]; }

    function isPhoto(layer) {

        if (layer.role === "channel") { return !!(CHANNEL_MATERIALS[layer.material] || {}).photo; }

        return layer.role === "insulation" && !!(INSULATORS[layer.material] || {}).photo;
    }


    /* ------------------------------------------------
       LAYERS
    ------------------------------------------------ */

    let idCounter = 0;

    function uid(prefix) {

        idCounter += 1;

        return prefix + Date.now().toString(36).slice(-4) + idCounter.toString(36);
    }


    // The mask polarity that gives the layer's drawn shapes as material.
    function requiredField(tone, method) {

        return (tone === "positive") !== (method === "etch") ? "dark" : "clear";
    }


    function defaultPatterning(layer) {

        const t = layer.thickness;

        let method = "liftoff";
        let resist = "az";
        let tResist = 3;

        if (layer.role === "insulation") {

            method = "etch";

            if (isPhoto(layer)) { resist = "su8"; tResist = Math.max(1, Math.min(100, t)); }
        }

        if (layer.role === "semiconductor") { method = "etch"; }

        if (layer.role === "channel") { method = "etch"; resist = "su8"; tResist = Math.max(1, Math.min(100, t)); }

        if (layer.role === "electrode") {

            if (1.6 * t + 1 > 12) {

                resist = "su8";
                tResist = Math.max(20, Math.min(100, Math.ceil(1.6 * t)));

            } else {

                tResist = Math.max(3, Math.ceil(1.6 * t + 1));
            }
        }

        if (layer.role === "collector") { tResist = Math.max(2, Math.min(12, Math.ceil(1.6 * t + 2))); }

        const rs = SC.RESISTS[resist];

        tResist = Math.max(rs.tMin, Math.min(rs.tMax, tResist));

        return {
            mask: { type: "film", field: (layer.mode === "cut") === (requiredField(rs.tone, method) === "dark") ? "clear" : "dark" },
            litho: {
                method: method, resist: resist, tResist: tResist,
                dose: Math.round(rs.dose(tResist)), dev: Math.round(rs.dev(tResist)),
                bakeT: rs.bakeT, bakeMin: rs.bakeMin
            }
        };
    }


    function newLayer(role, opts) {

        opts = opts || {};

        const mat = opts.material || DEFAULT_MATERIAL[role];
        const table = MATERIAL_TABLE[role];

        const layer = {
            id: uid("L"),
            name: opts.name || ROLES[role].name.split(" (")[0].split(" /")[0],
            role: role,
            material: mat,
            treat: role === "electrode" ? (opts.treat || "none") : "none",
            thickness: opts.thickness || (role === "electrode" ? 10 : (table[mat] || {}).thick || 1),
            mode: (role === "insulation" || role === "channel") && opts.mode ? opts.mode : defaultMode(role, mat),
            shapes: opts.shapes || [],
            visible: true
        };

        const p = defaultPatterning(layer);

        layer.mask = p.mask;
        layer.litho = p.litho;

        return layer;
    }


    // Keep photodefined insulators consistent: the resist IS the film.
    function syncLayer(layer) {

        if (isPhoto(layer)) {

            layer.litho.resist = "su8";
            layer.litho.tResist = Math.max(1, Math.min(100, layer.thickness));
            layer.litho.method = "etch";
        }

        return layer;
    }


    /* ------------------------------------------------
       LAYER MEASUREMENTS
    ------------------------------------------------ */

    const metricsCache = {};

    function pxFor(box, minFeat) {

        const span = Math.max(box.x1 - box.x0, box.y1 - box.y0, 1);

        const px = Math.max(minFeat / 5, span / 700, 0.25);

        return px;
    }


    // What the layer looks like to the process: its drawn shapes are material,
    // unless the layer is a "cut" film where the shapes are windows.
    function layerMetrics(layer) {

        const key = layer.id + JSON.stringify(layer.shapes) + layer.mode;

        if (metricsCache[key]) { return metricsCache[key]; }

        const shapes = layer.shapes;

        const out = {
            count: shapes.length, area: 0, perimeter: 0, bbox: null,
            minFeature: Infinity, minGap: Infinity, pieces: 0
        };

        if (shapes.length) {

            out.bbox = G.bboxOf(shapes);

            shapes.forEach(function (s) { out.minFeature = Math.min(out.minFeature, G.minDimOf(s)); });

            out.minGap = shapes.length > 400 ? Infinity : G.minGapOf(shapes);
            out.pieces = shapes.length > 400 ? 0 : G.pieces(shapes).count;

            const u = G.unionArea(shapes, out.bbox, pxFor(out.bbox, out.minFeature));

            out.area = u.area;
            out.perimeter = u.perimeter;
        }

        // In a cut film the windows are the drawn shapes; the walls between them are the features.
        out.featureMin = layer.mode === "cut" ? out.minGap : out.minFeature;
        out.gapMin = layer.mode === "cut" ? out.minFeature : out.minGap;

        const keys = Object.keys(metricsCache);

        if (keys.length > 80) { delete metricsCache[keys[0]]; }

        metricsCache[key] = out;

        return out;
    }


    /* ------------------------------------------------
       PATTERNING ONE LAYER
    ------------------------------------------------ */

    function patterning(layer, metrics) {

        if (SHEET_ROLES[layer.role]) {

            const sh = SHEET_ROLES[layer.role];
            const mm = sh.table[layer.material] || {};
            const small = Math.min(metrics.featureMin, metrics.gapMin);
            const lost = metrics.count > 0 && isFinite(small) && small < sh.limit;

            return {
                quality: lost ? 0 : (isFinite(small) && small < 2 * sh.limit ? 0.6 : 0.95), bias: 0, status: lost ? "lost" : "ok", residue: 0, shortProb: 0,
                adhesion: mm.adh || 0.8, need: 0, devOpt: 0, limit: sh.limit, want: layer.mask.field, parts: {},
                notes: lost ? [sh.lost] : [],
                cost: (mm.cost || 2) + 1, hours: (mm.hours || 2) + 1
            };
        }

        const lt = layer.litho;
        const rs = SC.RESISTS[lt.resist];
        const mk = SC.MASK_TYPES[layer.mask.type];

        const notes = [];
        const tr = lt.tResist;

        const need = rs.dose(tr);
        const r = lt.dose / need;

        const fDose = SC.bell ? SC.bell(r, 0.5) : Math.exp(-Math.pow(Math.log(Math.max(r, 1e-6)) / 0.5, 2));

        if (r < 0.75) {
            notes.push("Dose is " + Math.round(r * 100) + "% of the ~" + Math.round(need) + " mJ/cm² this resist needs: under-exposed.");
        } else if (r > 1.35) {
            notes.push("Dose is " + Math.round(r * 100) + "% of the ~" + Math.round(need) + " mJ/cm² this resist needs: over-exposed, features bleed.");
        }

        const devOpt = rs.dev(tr);
        const rd = lt.dev / devOpt;

        const bellOf = function (ratio, width) {

            const x = Math.log(Math.max(ratio, 1e-6)) / width;

            return Math.exp(-x * x);
        };

        const fDev = bellOf(rd, 0.6);

        const residue = Math.max(0, Math.min(1, 1 - rd));
        const undercut = Math.max(0, Math.min(1.5, rd - 1));

        if (rd < 0.75) { notes.push("Developed for " + Math.round(rd * 100) + "% of the ideal time: residue is left behind."); }
        else if (rd > 1.5) { notes.push("Over-developed (" + Math.round(rd * 100) + "% of the ideal time): features are undercut."); }

        const minFeat = isFinite(metrics.featureMin) ? metrics.featureMin : (isFinite(metrics.gapMin) ? metrics.gapMin : 100);
        const minGap = isFinite(metrics.gapMin) ? metrics.gapMin : minFeat;

        const smallest = Math.min(minFeat, minGap);

        // Material width change: openings grow with positive resist and over-exposure.
        const sign = rs.tone === "positive" ? 1 : -1;

        let open = sign * 0.12 * tr * (r - 1) - 0.35 * residue * Math.min(smallest, 40) + 0.08 * tr * undercut;

        // lift-off: material sits in the openings. etch / photodefined: material is what the resist leaves.
        let bias = lt.method === "liftoff" ? open : -open;

        bias = Math.max(-0.45 * minFeat, Math.min(0.45 * (isFinite(minGap) ? minGap : minFeat), bias));

        const limit = Math.max(mk.res, rs.res(tr));

        const fRes = Math.max(0, Math.min(1, (smallest - 0.8 * limit) / (1.2 * limit)));

        if (metrics.count && fRes < 0.5) {

            notes.push("Smallest feature (" + sig(smallest) + " µm) is near this process's limit of ~" + limit.toFixed(1) + " µm. " +
                (mk.res >= rs.res(tr) ? "The mask is the bottleneck." : "The resist thickness is the bottleneck."));
        }

        const wall = lt.method === "liftoff" ? minGap : minFeat;
        const ar = tr / Math.max(wall, 0.5);
        const fAr = ar <= rs.arMax ? 1 : Math.exp(-1.5 * (ar / rs.arMax - 1));

        if (metrics.count && fAr < 0.8) { notes.push("Resist walls are " + ar.toFixed(1) + "× taller than wide: they lean and collapse."); }

        let fLift = 1;

        if (lt.method === "liftoff" && !isPhoto(layer) && 1.5 * layer.thickness > tr) {

            fLift = Math.exp(-2 * (1.5 * layer.thickness / tr - 1));

            notes.push("Resist (" + tr + " µm) is too thin for a " + layer.thickness + " µm film to lift off cleanly: use a resist at least 1.5× thicker than the film.");
        }

        const dT = (lt.bakeT - rs.bakeT) / rs.bakeSigma;
        const fBakeT = Math.exp(-dT * dT / 2);
        const fBakeTime = 1 - Math.exp(-lt.bakeMin / (0.5 * rs.bakeMin));

        let fBake = Math.pow(fBakeT, 0.7) * fBakeTime;

        if (lt.bakeT > rs.tooHot) {

            fBake *= 0.6;
            notes.push("Baked at " + lt.bakeT + " °C, hotter than the resist tolerates: it cracks or flows.");

        } else if (dT < -1.3) {

            notes.push("Bake at " + lt.bakeT + " °C is too cool to fully harden the resist.");

        } else if (dT > 1.3) {

            notes.push("Bake at " + lt.bakeT + " °C is hotter than ideal: edges round off.");
        }

        if (fBakeTime < 0.7) { notes.push("Bake time is too short to finish hardening."); }

        const quality = Math.max(0, Math.min(1, fDose * fDev * fRes * fAr * fLift * Math.sqrt(fBake)));

        // Drawn shapes are windows in a "cut" film, so the polarity that prints them is the opposite one.
        const want0 = requiredField(rs.tone, lt.method);
        const want = layer.mode === "cut" ? (want0 === "dark" ? "clear" : "dark") : want0;

        const inverted = layer.mask.field !== want;

        if (inverted) {

            notes.push("This mask polarity is wrong for " + (rs.tone === "positive" ? "positive" : "negative") + " resist with " +
                (lt.method === "liftoff" ? "lift-off" : "etch / photodefined") + " patterning: use a " + want +
                "-field mask. As set, the layer prints inverted.");
        }

        const lost = metrics.count > 0 && (fRes <= 0.02 || fDose < 0.05 || fBake < 0.05);

        if (lost) { notes.push("The pattern does not survive this process: little or nothing is left."); }

        const shortProb = Math.max(0, Math.min(0.98,
            0.6 * residue + 0.35 * Math.pow(1 - quality, 1.5) + (layer.mask.type === "film" ? 0.04 : 0.01)));

        let status = "ok";

        if (inverted) { status = "inverted"; } else if (lost) { status = "lost"; }

        const rsAdh = rs.adh * (0.4 + 0.6 * fBakeT);

        const hours = mk.hours + 4;

        const mat = materialOf(layer) || {};

        return {
            quality: quality, bias: bias, status: status, residue: residue, shortProb: shortProb,
            adhesion: Math.max(0.1, Math.min(1, rsAdh * (mat.adh || 1))),
            notes: notes, need: need, devOpt: devOpt, limit: limit, want: want,
            cost: rs.cost + mk.cost + (mat.cost || 1),
            hours: hours + (mat.hours || 2),
            parts: { dose: fDose, develop: fDev, resolution: fRes, aspect: fAr, bake: fBake, liftoff: fLift }
        };
    }


    function sig(x) {

        if (!isFinite(x)) { return "n/a"; }

        return x >= 100 ? String(Math.round(x)) : x >= 10 ? x.toFixed(1) : x.toFixed(2);
    }


    /* ------------------------------------------------
       DESIGN CHECKS (no fabrication needed)
    ------------------------------------------------ */

    function padsOf(design) {

        const out = [];

        design.layers.forEach(function (l, li) {

            if (!ROLES[l.role].conductive && ((KINDS[design.kind] || {}).padRoles || []).indexOf(l.role) < 0) { return; }

            l.shapes.forEach(function (s, si) {

                if (s.t === "r" && s.pad) { out.push({ layer: li, index: si, label: s.pad, shape: s }); }
            });
        });

        return out;
    }


    function checkDesign(design) {

        const out = [];

        const pads = padsOf(design);
        const labels = {};

        pads.forEach(function (p) { labels[p.label] = (labels[p.label] || 0) + 1; });

        if (!design.layers.length) {

            out.push({ level: "error", text: "Add a layer to start drawing." });

            return out;
        }

        if (design.layers.every(function (l) { return !l.shapes.length; })) {

            out.push({ level: "info", text: "Nothing is drawn yet. Pick a tool and draw on the canvas, or add a template." });

            return out;
        }

        const kind = KINDS[design.kind] || KINDS.supercap;

        const missing = (kind.need || []).filter(function (lab) { return !labels[lab]; });

        if (missing.length) {

            out.push({
                level: "error",
                text: kind.name + " needs a contact pad labelled " + missing.join(", ") +
                    ". Draw each one with the Pad tool on a metal layer, then pick its label."
            });
        }

        if (design.kind === "supercap") {

            const hasEl = design.layers.some(function (l) { return l.role === "electrode" && l.shapes.length; });

            if (!hasEl) { out.push({ level: "error", text: "No electrode layer has any shapes. The active material has to be drawn somewhere." }); }

        } else if (design.kind === "fet" || design.kind === "biofet") {

            const hasSem = design.layers.some(function (l) { return l.role === "semiconductor" && l.shapes.length; });

            if (!hasSem) { out.push({ level: "error", text: "No semiconductor layer has any shapes. The channel has to be drawn on a semiconductor layer." }); }
        }

        if (HANDLERS[design.kind] && HANDLERS[design.kind].check) { HANDLERS[design.kind].check(design, out, labels); }

        design.layers.forEach(function (l) {

            const m = layerMetrics(l);

            if (!l.shapes.length) { out.push({ level: "info", text: "Layer “" + l.name + "” is empty." }); return; }

            const pt = patterning(l, m);

            pt.notes.forEach(function (n) { out.push({ level: pt.status === "ok" ? "warn" : "error", text: l.name + ": " + n }); });
        });

        return out;
    }


    function summarize(design) {

        const all = [];

        design.layers.forEach(function (l) { l.shapes.forEach(function (s) { all.push(s); }); });

        const box = G.bboxOf(all);

        let cost = 0;
        let hours = 0;

        design.layers.forEach(function (l) {

            if (!l.shapes.length) { return; }

            const p = patterning(l, layerMetrics(l));

            cost += p.cost;
            hours += p.hours;
        });

        return {
            bbox: box,
            width: box ? box.x1 - box.x0 : 0,
            height: box ? box.y1 - box.y0 : 0,
            footprintUm2: box ? (box.x1 - box.x0) * (box.y1 - box.y0) : 0,
            layers: design.layers.filter(function (l) { return l.shapes.length; }).length,
            cost: cost + 1,
            hours: hours + 2
        };
    }


    /* ------------------------------------------------
       TEMPLATES
    ------------------------------------------------ */

    function rect(x, y, w, h, pad) {

        const s = { t: "r", x: x, y: y, w: w, h: h };

        if (pad) { s.pad = pad; }

        return s;
    }


    // Interdigitated comb geometry in um. Returns pieces to place on layers.
    function ideGeometry(p) {

        const N = p.N;
        const w = p.w;
        const g = p.g;
        const L = p.L;

        const W = N * w + (N - 1) * g;
        const hb = Math.max(100, w);

        const bus = [rect(0, 0, W, hb), rect(0, hb + g + L, W, hb)];

        const plus = [];
        const minus = [];

        for (let k = 0; k < N; k++) {

            const x = k * (w + g);

            if (k % 2 === 0) { plus.push({ x: x, y: hb - 10, w: w, h: L + 10 }); }
            else { minus.push({ x: x, y: hb + g, w: w, h: L + 10 }); }
        }

        const pad = 400;

        return {
            W: W, hb: hb, bus: bus, plus: plus, minus: minus, pad: pad,
            padPlus: rect(0, -pad + 10, pad, pad, "+"),
            padMinus: rect(0, hb + g + L + hb - 10, pad, pad, "−"),
            top: 0, bottom: hb + g + L + hb
        };
    }


    function buildTemplate(kind, name, p) {

        if (HANDLERS[kind] && HANDLERS[kind].buildTemplate) { return HANDLERS[kind].buildTemplate(kind, name, p); }

        return buildSupercapTemplate(kind, name, p);
    }


    function buildSupercapTemplate(kind, name, p) {

        p = Object.assign({ N: 12, w: 100, g: 60, L: 3000 }, p || {});

        const ide = ideGeometry(p);

        const fingers = ide.plus.concat(ide.minus);

        const layers = [];
        const margin = Math.max(1, Math.min(8, Math.floor(p.g / 5)));

        if (name === "ide-electrodes" || name === "ide-stack" || name === "ide-collector") {

            if (name !== "ide-electrodes") {

                const col = newLayer("collector", { name: "Au current collector", material: "au" });

                col.shapes = ide.bus.concat(fingers.map(function (f) { return rect(f.x, f.y, f.w, f.h); }), [ide.padPlus, ide.padMinus]);

                layers.push(col);
            }

            const el = newLayer("electrode", { name: "Electrode film", material: "rgo", treat: "reduce", thickness: 10 });

            if (name === "ide-electrodes") {

                // No collector: the film carries the current, so it also forms the bus bars and pads.
                el.shapes = ide.bus.concat(fingers.map(function (f) { return rect(f.x, f.y, f.w, f.h); }), [ide.padPlus, ide.padMinus]);

            } else {

                el.shapes = fingers.map(function (f) {

                    return rect(f.x - margin, f.y + 10, f.w + 2 * margin, f.h - 10 + margin);
                });
            }

            layers.push(el);

            if (name === "ide-stack") {

                const pas = newLayer("insulation", { name: "Passivation", material: "su8", thickness: 2, mode: "cut" });

                pas.shapes = [
                    rect(-20, ide.hb + 12, ide.W + 40, p.L + p.g - 24),
                    rect(ide.padPlus.x + 40, ide.padPlus.y + 40, ide.pad - 80, ide.pad - 80),
                    rect(ide.padMinus.x + 40, ide.padMinus.y + 40, ide.pad - 80, ide.pad - 80)
                ];

                layers.push(pas);
            }
        }

        const design = {
            id: uid("D"), name: "", kind: kind, electrolyte: "acid", grid: 10, layers: layers
        };

        layers.forEach(syncLayer);

        return design;
    }


    const TEMPLATES = {

        supercap: [
            { id: "ide-stack", name: "Collector + electrodes + passivation", blurb: "Gold collector under the film, and an SU-8 window that defines the active area." },
            { id: "ide-collector", name: "Collector + electrodes", blurb: "Gold collector and an electrode film, no passivation." },
            { id: "ide-electrodes", name: "Electrodes only", blurb: "A single layer: the film forms fingers, bus bars and pads." },
            { id: "blank", name: "Blank (draw everything yourself)", blurb: "One empty electrode layer." }
        ]
    };


    function blankDesign(kind) {

        if ((kind === "bbb" || kind === "neural") && HANDLERS[kind]) { return HANDLERS[kind].buildTemplate(kind, "blank"); }

        const role = (KINDS[kind] || KINDS.supercap).roles[0];

        const l = newLayer(role, { name: role === "semiconductor" ? "Channel" : "Electrode film" });

        return { id: uid("D"), name: "", kind: kind, electrolyte: "acid", grid: 10, layers: [l] };
    }


    /* ------------------------------------------------
       FABRICATION
    ------------------------------------------------ */

    function fabricate(design, seed, opt) {

        opt = opt || {};

        const rand = SC.rng(seed);
        const gauss = function () {

            let u = 0;
            let v = 0;

            while (u === 0) { u = rand(); }
            while (v === 0) { v = rand(); }

            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        };

        const vary = function (sd) { return 1 + sd * gauss(); };

        const el = SC.ELECTROLYTES[design.electrolyte];
        const layers = design.layers.filter(function (l) { return l.shapes.length; });

        const notes = [];
        const info = { notes: notes, nets: {}, layers: [], timing: [] };
        const mark = function (name) { info.timing.push([name, Date.now()]); };

        mark("start");

        const fail = function (reason, extra) {

            return Object.assign({
                status: "lost", reason: reason, footprint: 1e-4, cell: 1e-9, esr: 100, fPseudo: 0, rPore: 1, vMax: el.vMax,
                life: 1000, seed: seed, quality: 0, tauSD: 3000, rShort: 50, electrolyte: design.electrolyte, cost: 1, hours: 1
            }, extra || {});
        };

        if (!layers.length) { return { dev: fail("Nothing is drawn."), info: info }; }

        // Nominal footprint and costs.
        const all = [];

        layers.forEach(function (l) { l.shapes.forEach(function (s) { all.push(s); }); });

        const nomBox = G.bboxOf(all);
        const footprint = (nomBox.x1 - nomBox.x0) * (nomBox.y1 - nomBox.y0) * 1e-8;        // cm2

        let cost = 1;
        let hours = 2;

        const result = { raster: null };

        const finish = function (dev) {

            dev.cost = cost;
            dev.hours = hours;
            dev.footprint = footprint;
            dev.seed = seed;
            dev.electrolyte = design.electrolyte;

            const out = { dev: dev, info: info };

            if (opt.keepRasters && result.raster) { out.raster = result.raster; }

            return out;
        };

        // Per-layer process.
        const per = layers.map(function (l, k) {

            const m = layerMetrics(l);
            const p = patterning(l, m);

            cost += p.cost;
            hours += p.hours;

            const sd = l.mask.type === "film" ? 3 : 0.7;

            const dx = k === 0 ? 0 : gauss() * sd;
            const dy = k === 0 ? 0 : gauss() * sd;

            return { layer: l, m: m, p: p, dx: dx, dy: dy, bias: p.bias * vary(0.1) };
        });

        info.layers = per.map(function (q) {

            return { name: q.layer.name, quality: q.p.quality, status: q.p.status, bias: q.bias, dx: q.dx, dy: q.dy, notes: q.p.notes };
        });

        // Perturbed shapes.
        const shapesOf = per.map(function (q) {

            if (q.p.status === "lost") { return []; }

            const out = [];

            q.layer.shapes.forEach(function (s) {

                let c = G.growShape(s, q.bias / 2);

                if (!c) { return; }

                c = G.moveShape(c, q.dx, q.dy);

                if (s.pad) { c.pad = s.pad; }

                out.push(c);
            });

            return out;
        });

        // Raster frame.
        let box = { x0: nomBox.x0, y0: nomBox.y0, x1: nomBox.x1, y1: nomBox.y1 };

        shapesOf.forEach(function (list) {

            const b = G.bboxOf(list);

            if (!b) { return; }

            box.x0 = Math.min(box.x0, b.x0);
            box.y0 = Math.min(box.y0, b.y0);
            box.x1 = Math.max(box.x1, b.x1);
            box.y1 = Math.max(box.y1, b.y1);
        });

        let minFeatAll = Infinity;

        per.forEach(function (q) {

            [q.m.featureMin, q.m.gapMin].forEach(function (v) { if (isFinite(v) && v > 0) { minFeatAll = Math.min(minFeatAll, v); } });
        });

        if (!isFinite(minFeatAll)) { minFeatAll = 50; }

        const handler = HANDLERS[design.kind];
        const cellCap = handler && handler.cells ? handler.cells : 450000;
        const featDiv = handler && handler.featDiv ? handler.featDiv : 4;

        const px = Math.max(minFeatAll / featDiv, Math.sqrt((box.x1 - box.x0) * (box.y1 - box.y0) / cellCap), 0.25);

        const frame = G.makeFrame(box, px, px * 2);
        const n = frame.w * frame.h;

        mark("shapes");

        // Layer presence maps.
        const P = per.map(function (q, k) {

            let m = G.raster(shapesOf[k], frame);

            if (q.layer.mode === "cut" && q.p.status !== "lost") {

                for (let i = 0; i < n; i++) { m[i] = m[i] ? 0 : 1; }

                // The film only exists inside the working area.
                const fb = box;

                for (let j = 0; j < frame.h; j++) {

                    const y = frame.y0 + (j + 0.5) * frame.px;

                    for (let i = 0; i < frame.w; i++) {

                        const x = frame.x0 + (i + 0.5) * frame.px;

                        if (x < fb.x0 || x > fb.x1 || y < fb.y0 || y > fb.y1) { m[j * frame.w + i] = 0; }
                    }
                }

            } else if (q.layer.mode === "cut" && q.p.status === "lost") {

                m = new Uint8Array(n);
            }

            if (q.p.status === "inverted") {

                const inv = new Uint8Array(n);

                for (let i = 0; i < n; i++) { inv[i] = m[i] ? 0 : 1; }

                m = inv;
            }

            return m;
        });

        mark("raster");

        const conductive = per.map(function (q) { return ROLES[q.layer.role].conductive; });
        const isElectrode = per.map(function (q) { return q.layer.role === "electrode"; });
        const isInsul = per.map(function (q) { return q.layer.role === "insulation"; });

        // Connected pieces within each conductive layer.
        const lab = per.map(function (q, k) { return conductive[k] ? G.label(P[k], frame.w, frame.h) : null; });

        const base = [];
        let nodes = 1;

        per.forEach(function (q, k) {

            base.push(nodes);

            if (lab[k]) { nodes += lab[k].n; }
        });

        const parent = new Int32Array(nodes);

        for (let i = 0; i < nodes; i++) { parent[i] = i; }

        const find = function (a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
        const join = function (a, b) { const x = find(a); const y = find(b); if (x !== y) { parent[Math.max(x, y)] = Math.min(x, y); } };

        mark("label");

        // Layers connect where they overlap with no insulator between them.
        for (let i = 0; i < n; i++) {

            let last = -1;
            let blocked = false;

            for (let k = 0; k < per.length; k++) {

                if (!P[k][i]) { continue; }

                if (!conductive[k]) { blocked = true; continue; }

                if (last >= 0 && !blocked) { join(base[last] + lab[last].labels[i] - 1 + 0, base[k] + lab[k].labels[i] - 1 + 0); }

                last = k;
                blocked = false;
            }
        }

        const nodeAt = function (k, i) { return find(base[k] + lab[k].labels[i] - 1); };

        // Is something insulating above layer k at pixel i?
        const coveredAbove = function (k, i) {

            for (let m = k + 1; m < per.length; m++) { if (isInsul[m] && P[m][i]) { return true; } }

            return false;
        };

        mark("connect");

        // Pads give each net its name.
        const netLabel = {};

        const pads = [];

        per.forEach(function (q, k) {

            if (!conductive[k]) { return; }

            shapesOf[k].forEach(function (s) {

                if (!s.pad) { return; }

                const f = G.makeFrame(G.bboxOf([s]), px, 0);

                pads.push({ k: k, shape: s });
            });
        });

        const padMask = {};

        pads.forEach(function (pd) {

            const s = pd.shape;
            const cx = Math.floor((s.x + s.w / 2 - frame.x0) / px);
            const cy = Math.floor((s.y + s.h / 2 - frame.y0) / px);

            if (cx < 0 || cy < 0 || cx >= frame.w || cy >= frame.h) { return; }

            const i = cy * frame.w + cx;

            if (!P[pd.k][i]) { notes.push("Pad “" + s.pad + "” on layer “" + per[pd.k].layer.name + "” was not printed."); return; }

            if (coveredAbove(pd.k, i)) { notes.push("Pad “" + s.pad + "” is covered by insulation, so nothing can touch it. Open a window over it."); return; }

            const root = nodeAt(pd.k, i);

            netLabel[root] = netLabel[root] || {};
            netLabel[root][s.pad] = true;

            const m = padMask[s.pad] || (padMask[s.pad] = new Uint8Array(n));
            const rm = G.raster([s], frame);

            for (let q = 0; q < n; q++) {

                if (rm[q] && P[pd.k][q] && !coveredAbove(pd.k, q)) { m[q] = 1; }
            }
        });

        const rootsFor = function (lbl) {

            return Object.keys(netLabel).filter(function (r) { return netLabel[r][lbl]; }).map(Number);
        };

        const plusRoots = rootsFor("+");
        const minusRoots = rootsFor("−");

        const merged = Object.keys(netLabel).some(function (r) { return Object.keys(netLabel[r]).length > 1; });

        result.raster = { frame: frame, P: P, per: per, shapes: shapesOf, nodeAt: nodeAt, conductive: conductive };

        if (handler && handler.analyze) {

            return handler.analyze({
                design: design, seed: seed, opt: opt, rand: rand, gauss: gauss, vary: vary, per: per, shapesOf: shapesOf,
                frame: frame, px: px, n: n, P: P, conductive: conductive, isInsul: isInsul, nodeAt: nodeAt,
                coveredAbove: coveredAbove, netLabel: netLabel, padMask: padMask, notes: notes, info: info,
                finish: finish, footprint: footprint, nomBox: nomBox, box: box, mark: mark, result: result
            });
        }

        if (!plusRoots.length || !minusRoots.length) {

            notes.push(!plusRoots.length ? "No working “+” contact pad was found." : "No working “−” contact pad was found.");

            const bad = per.filter(function (q) { return q.p.status !== "ok"; })[0];

            return finish(fail(bad ? "Layer “" + bad.layer.name + "” did not print correctly" : "A contact pad is missing, buried or not on the net"));
        }

        const plusRoot = plusRoots[0];
        const minusRoot = minusRoots[0];

        if (merged || plusRoot === minusRoot) {

            notes.push("The + and − pads are joined by a conductor (a layer bridges them, or the electrodes touch).");

            return finish(Object.assign(fail("The + and − electrodes are connected"), { status: "short" }));
        }

        // Electrode material.
        const elecIdx = [];

        per.forEach(function (q, k) { if (isElectrode[k]) { elecIdx.push(k); } });

        if (!elecIdx.length) { notes.push("There is no electrode layer."); return finish(fail("No electrode layer")); }

        const matInfo = {};

        elecIdx.forEach(function (k) {

            const l = per[k].layer;

            const mat = SC.processMaterial({ mat: l.material, treat: l.treat, collector: false, tFilm: l.thickness }, el);

            const access = 1 - mat.micro * el.ion * 0.9;

            matInfo[k] = {
                mat: mat,
                cEdl: mat.ssa * mat.util * el.cArea * access * vary(0.03),
                cPs: mat.pseudo * vary(0.04),
                sigma: mat.sigma * vary(0.05),
                q: 0.6 + 0.4 * per[k].p.quality
            };

            matInfo[k].cSpec = matInfo[k].cEdl + matInfo[k].cPs;

            mat.notes.forEach(function (t) { if (notes.indexOf(t) < 0) { notes.push(t); } });

            cost += 0;
        });

        mark("pads");

        // Walk the pixels once: exposed electrode, sheet conductance per net, exposed conductor.
        const gPlus = new Float32Array(n);
        const gMinus = new Float32Array(n);
        const sinkPlus = new Float32Array(n);
        const sinkMinus = new Float32Array(n);
        const expPlus = new Uint8Array(n);
        const expMinus = new Uint8Array(n);

        const stats = {
            "+": { mass: 0, cSum: 0, cpSum: 0, area: 0, tArea: 0, perim: 0 },
            "−": { mass: 0, cSum: 0, cpSum: 0, area: 0, tArea: 0, perim: 0 }
        };

        const pxArea = px * px;

        let exposedCollector = 0;
        let anyElectrodeInNet = false;

        const labelPixel = new Uint8Array(n);          // 1 plus, 2 minus, 3 other net, 0 none (for pinhole overlap)

        for (let i = 0; i < n; i++) {

            for (let k = 0; k < per.length; k++) {

                if (!P[k][i] || !conductive[k]) { continue; }

                const root = nodeAt(k, i);

                const isP = root === plusRoot;
                const isM = root === minusRoot;

                if (!isP && !isM) { continue; }

                const l = per[k].layer;

                let sheet;

                if (isElectrode[k]) { sheet = matInfo[k].sigma * matInfo[k].q * l.thickness * 1e-6; }
                else { sheet = METALS[l.material].sigma * (0.6 + 0.4 * per[k].p.quality) * l.thickness * 1e-6; }

                if (isP) { gPlus[i] += sheet; } else { gMinus[i] += sheet; }

                const covered = coveredAbove(k, i);

                if (isElectrode[k] && !covered) {

                    anyElectrodeInNet = true;

                    const st = stats[isP ? "+" : "−"];
                    const mi = matInfo[k];
                    const vol = pxArea * l.thickness * 1e-12;                 // cm3
                    const m = mi.mat.density * vol;                            // g

                    st.mass += m * mi.q;
                    st.cSum += mi.cSpec * m * mi.q;
                    st.cpSum += mi.cPs * m * mi.q;
                    st.area += pxArea;
                    st.tArea += pxArea * l.thickness;

                    if (isP) { sinkPlus[i] = 1; expPlus[i] = 1; } else { sinkMinus[i] = 1; expMinus[i] = 1; }
                }

                if (!isElectrode[k] && !covered) {

                    // Exposed metal counts as exposed conductor for the facing-gap analysis.
                    if (isP) { expPlus[i] = expPlus[i] || 2; } else { expMinus[i] = expMinus[i] || 2; }

                    let overElectrode = false;

                    for (let m = k + 1; m < per.length; m++) { if (isElectrode[m] && P[m][i]) { overElectrode = true; } }

                    const onPad = (padMask["+"] && padMask["+"][i]) || (padMask["−"] && padMask["−"][i]);

                    if (!overElectrode && !onPad) { exposedCollector += pxArea; }
                }

                labelPixel[i] = isP ? (labelPixel[i] === 2 ? 3 : 1) : (labelPixel[i] === 1 ? 3 : 2);
            }
        }

        mark("walk");

        // Layers present on the net but nothing exposed.
        if (stats["+"].area <= 0 || stats["−"].area <= 0) {

            notes.push("One electrode has no exposed active material, so it cannot store charge. Check the passivation windows and which layers touch the pads.");

            return finish(fail("No exposed electrode area"));
        }

        // Capacitance.
        const nm = per.filter(function (q, k) { return isElectrode[k]; }).length;

        const cPlus = stats["+"].cSum;
        const cMinus = stats["−"].cSum;

        const cNet = Math.max(cPlus * cMinus / (cPlus + cMinus), 1e-12);

        const fPseudo = (stats["+"].cpSum + stats["−"].cpSum) / Math.max(stats["+"].cSum + stats["−"].cSum, 1e-12);

        // Electronic resistance: current-flow solve on a coarser grid.
        const factor = Math.max(1, Math.ceil(Math.sqrt(n / (opt.solveCells || 15000))));
        const cw = Math.ceil(frame.w / factor);
        const chh = Math.ceil(frame.h / factor);

        const coarse = function (src, mode) {

            const out = new Float32Array(cw * chh);

            for (let j = 0; j < frame.h; j++) {

                const cj = Math.floor(j / factor);

                for (let i = 0; i < frame.w; i++) {

                    const v = src[j * frame.w + i];

                    if (!v) { continue; }

                    const o = cj * cw + Math.floor(i / factor);

                    if (mode === "max") { out[o] = 1; } else { out[o] += v; }
                }
            }

            if (mode === "mean") {

                const inv = 1 / (factor * factor);

                for (let q = 0; q < out.length; q++) { out[q] *= inv; }
            }

            return out;
        };

        const solveNet = function (g, sink, label) {

            const mask = padMask[label];

            if (!mask) { return { R: Infinity, lost: 1 }; }

            return G.solveSheet(coarse(g, "mean"), coarse(mask, "max"), coarse(sink, "sum"), cw, chh);
        };

        mark("coarse");

        const sp = solveNet(gPlus, sinkPlus, "+");
        const sm = solveNet(gMinus, sinkMinus, "−");

        if (!isFinite(sp.R) || !isFinite(sm.R)) {

            notes.push("An electrode is not connected to its contact pad, so no current can reach it.");

            return finish(fail("Electrode not connected to a pad"));
        }

        mark("solve");

        const lostP = sp.lost;
        const lostM = sm.lost;

        if (lostP > 0.05) { notes.push(Math.round(lostP * 100) + "% of the + electrode is cut off from its pad and does nothing."); }
        if (lostM > 0.05) { notes.push(Math.round(lostM * 100) + "% of the − electrode is cut off from its pad and does nothing."); }

        const cEff = cNet * (1 - 0.5 * (lostP + lostM));

        // Ion path between the two electrodes: parallel conduction across every facing edge.
        const dtMinus = G.edt(expMinus.map(function (v) { return v ? 1 : 0; }), frame.w, frame.h);

        const rho = 1 / el.kappa;

        let tAvg = 0;
        let tW = 0;

        elecIdx.forEach(function (k) { tAvg += per[k].layer.thickness; tW += 1; });

        tAvg = tAvg / Math.max(tW, 1);

        const tc = (tAvg + 20) * 1e-6;

        let gGap = 0;
        let dMin = Infinity;
        const facing = [];

        for (let j = 1; j < frame.h - 1; j++) {

            for (let i = 1; i < frame.w - 1; i++) {

                const k = j * frame.w + i;

                if (!expPlus[k]) { continue; }

                if (expPlus[k - 1] && expPlus[k + 1] && expPlus[k - frame.w] && expPlus[k + frame.w]) { continue; }

                const d = Math.max(dtMinus[k] * px - px, px / 2);

                facing.push(d);

                if (d < dMin) { dMin = d; }
            }
        }

        const dCut = Math.min(Math.max(dMin * 10, 20), 1500);

        // Defect model: small particles and residue follow a 1/d^3 size law.
        const maskType = per.reduce(function (s, q) { return q.layer.mask.type === "film" ? "film" : s; }, "chrome");
        const D0 = maskType === "film" ? 30 : 6;
        const d0 = maskType === "film" ? 4 : 1;

        let lambda = 0;

        facing.forEach(function (d) {

            if (d <= dCut) { gGap += el.kappa * tc * (px * 1e-6) / (d * 1e-6); }

            const dd = Math.max(d, 0.1);

            const f = dd >= d0 ? D0 * d0 * d0 / dd : 2 * D0 * d0 - D0 * dd;

            lambda += px * f * 1e-8;
        });

        const pCrit = 1 - Math.exp(-lambda);

        const rGap = gGap > 0 ? 1 / gGap : 1e6;

        mark("gap");

        // Hydraulic width and ion access into the film.
        const aTop = stats["+"].area + stats["−"].area;

        let perimUm = 0;

        for (let j = 1; j < frame.h - 1; j++) {

            for (let i = 1; i < frame.w - 1; i++) {

                const k = j * frame.w + i;

                if (expPlus[k] !== 1 && expMinus[k] !== 1) { continue; }

                const same = function (q) { return (expPlus[k] === 1 && expPlus[q] === 1) || (expMinus[k] === 1 && expMinus[q] === 1); };

                if (!same(k - 1)) { perimUm += px; }
                if (!same(k + 1)) { perimUm += px; }
                if (!same(k - frame.w)) { perimUm += px; }
                if (!same(k + frame.w)) { perimUm += px; }
            }
        }

        const wHyd = perimUm > 0 ? 2 * aTop / perimUm : 100;
        const path = Math.min(tAvg, wHyd / 2) * 1e-6;
        const aAcc = (aTop + 0.5 * perimUm * tAvg) * 1e-12;

        const rPore = 6 * rho * path / Math.max(aAcc, 1e-12);

        const hasCollector = per.some(function (q, k) { return q.layer.role === "collector" && shapesOf[k].length; });

        const rContact = hasCollector ? 1 : 3;

        const esr = rContact + sp.R + sm.R + rGap + rPore / 3;

        mark("perim");

        // Pinholes in insulation between + and − conductors.
        let pPin = 1;

        per.forEach(function (q, k) {

            if (!isInsul[k]) { return; }

            let ov = 0;

            for (let i = 0; i < n; i++) {

                if (!P[k][i]) { continue; }

                let below = 0;
                let above = 0;

                for (let m = 0; m < per.length; m++) {

                    if (!conductive[m] || !P[m][i]) { continue; }

                    const root = nodeAt(m, i);
                    const tag = root === plusRoot ? 1 : root === minusRoot ? 2 : 0;

                    if (!tag) { continue; }

                    if (m < k) { below = below | tag; } else { above = above | tag; }
                }

                if ((below === 1 && above === 2) || (below === 2 && above === 1)) { ov += pxArea; }
            }

            if (ov > 0) {

                const d0p = INSULATORS[q.layer.material].d0;
                const lam = d0p * Math.exp(-q.layer.thickness / 0.5) * ov * 1e-8;

                pPin *= Math.exp(-lam);

                info.pinholeArea = (info.pinholeArea || 0) + ov;
            }
        });

        const pPinhole = 1 - pPin;

        // Lithography residue and bridging probability from the layers that carry both nets.
        let pLitho = 0;

        per.forEach(function (q, k) {

            if (conductive[k] && isFinite(q.m.minGap) && q.m.pieces >= 2) { pLitho = Math.max(pLitho, q.p.shortProb); }
        });

        const pShort = 1 - (1 - pCrit) * (1 - pPinhole) * (1 - pLitho);

        info.pShort = pShort;
        info.pCrit = pCrit;
        info.pPinhole = pPinhole;
        info.pLitho = pLitho;

        mark("pinholes");

        // Window and life.
        let vMax = el.vMax;

        if (el.aqueous) {

            elecIdx.forEach(function (k) { vMax = Math.min(vMax, SC.MATERIALS[per[k].layer.material].vAq); });
        }

        let life = Infinity;

        elecIdx.forEach(function (k) { life = Math.min(life, matInfo[k].mat.life); });

        life *= el.life;

        let thick = 1;

        if (tAvg > 15) { thick = Math.exp(-(tAvg - 15) / 30); }

        let adh = 1;

        per.forEach(function (q) { adh = Math.min(adh, q.p.adhesion); });

        life *= thick * Math.max(0.1, adh) * vary(0.1);

        // Corroding metal in contact with electrolyte.
        let corrodes = 1;

        if (exposedCollector > 0) {

            per.forEach(function (q, k) {

                if (q.layer.role === "collector" && !METALS[q.layer.material].noble) {

                    const frac = Math.min(1, exposedCollector / Math.max(aTop, 1));

                    corrodes = Math.min(corrodes, Math.exp(-4 * frac * (el.acidic ? 2 : 1)) * (el.acidic ? 0.5 : 0.8));

                    notes.push("Exposed " + METALS[q.layer.material].name.toLowerCase() + " corrodes in this electrolyte. Cover it with insulation.");
                }
            });
        }

        life *= corrodes;

        info.exposedCollector = exposedCollector;
        info.parts = { rContact: rContact, rPlus: sp.R, rMinus: sm.R, rGap: rGap, rPore: rPore };
        info.areaPlus = stats["+"].area;
        info.areaMinus = stats["−"].area;
        info.cPlus = cPlus;
        info.cMinus = cMinus;
        info.gapMin = dMin;
        info.resolutionUm = px;

        let status = "ok";
        let reason = "";

        if (merged) {

            status = "short";
            reason = "The + and − pads are on the same connected conductor.";

        } else if (rand() < pShort) {

            status = "short";
            reason = pLitho >= Math.max(pCrit, pPinhole) ? "Resist residue or bridging joined the electrodes." :
                pPinhole >= pCrit ? "A pinhole in the insulation joined conductors." : "A defect bridged the gap between electrodes.";
        }

        if (merged && !reason) { reason = "Shorted."; }

        return finish({
            status: status, reason: reason,
            cell: Math.max(cEff, 1e-12),
            fPseudo: fPseudo,
            esr: esr, rElec: sp.R + sm.R, rGap: rGap, rPore: rPore, rContact: rContact,
            vMax: vMax, life: Math.max(life, 1),
            quality: per.reduce(function (s, q) { return s + q.p.quality; }, 0) / per.length,
            tauSD: el.tauSD || 3000, rShort: 5 + 195 * rand(),
            areaPlus: stats["+"].area, areaMinus: stats["−"].area,
            thickness: tAvg, mass: stats["+"].mass + stats["−"].mass
        });
    }


    const API = {

        ROLES: ROLES, METALS: METALS, TOXIC: TOXIC, CHANNEL_MATERIALS: CHANNEL_MATERIALS, MEMBRANES: MEMBRANES, NEURAL_SUBSTRATES: NEURAL_SUBSTRATES, NEURAL_COATINGS: NEURAL_COATINGS, SHEET_ROLES: SHEET_ROLES, defaultMode: defaultMode, INSULATORS: INSULATORS, SEMICONDUCTORS: SEMICONDUCTORS, WORKFUNCTION: WORKFUNCTION,
        MATERIAL_TABLE: MATERIAL_TABLE, HANDLERS: HANDLERS, defaultMaterial: defaultMaterial,
        registerKind: function (id, h) { HANDLERS[id] = h; if (h.templates) { TEMPLATES[id] = h.templates; } },
        KINDS: KINDS, TEMPLATES: TEMPLATES,

        roleOf: roleOf, materialOf: materialOf, isPhoto: isPhoto, requiredField: requiredField,
        defaultPatterning: defaultPatterning, newLayer: newLayer, syncLayer: syncLayer,
        layerMetrics: layerMetrics, patterning: patterning,
        checkDesign: checkDesign, summarize: summarize, padsOf: padsOf,
        buildTemplate: buildTemplate, blankDesign: blankDesign, ideGeometry: ideGeometry,
        fabricate: fabricate, uid: uid
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = API;
    }

    root.LabEngine = API;

}(typeof window !== "undefined" ? window : globalThis));
