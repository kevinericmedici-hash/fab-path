/* ========================================
   BLOOD-BRAIN BARRIER CHIP: CELLS AND MEASUREMENTS

   Pure functions of a fabricated chip ("dev", from lab-bbb-engine.js).
   Biology: how well each cell type seals, what co-culture, coating and
   flow do to it. Measurements: TEER at one frequency over time, impedance
   spectra (Nyquist and Bode), tracer permeability, flow and shear, and
   challenges that open the barrier.

   Needs window.SCLab (for its seeded random numbers).
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;


    /* ------------------------------------------------
       TABLES
    ------------------------------------------------ */

    // teer: best TEER in ohm cm2 on a good membrane. tConf: days to cover the membrane.
    // tj: days for the tight junctions to mature. tDecay/tauDecay: when and how fast the layer degrades.
    // shearGain: how much physiological shear tightens it. coSens: how much it responds to astrocytes and pericytes.
    // pgp: efflux transporter activity. cv: chip-to-chip variability.
    const CELLS = {

        hcmec: {
            name: "hCMEC/D3 (human, immortalised)", blurb: "Easy to grow and the most used human line, but leaky: TEER stays in the tens of Ω·cm².",
            teer: 40, tConf: 2, tj: 3, tDecay: 99, tauDecay: 1, shearGain: 0.6, coSens: 1.0, pgp: 0.5, cv: 0.2, cost: 1
        },
        bend3: {
            name: "bEnd.3 (mouse, immortalised)", blurb: "A tougher line from mouse. Tighter than hCMEC/D3 but not human.",
            teer: 90, tConf: 2, tj: 3, tDecay: 99, tauDecay: 1, shearGain: 0.5, coSens: 0.8, pgp: 0.4, cv: 0.2, cost: 1
        },
        prim: {
            name: "Primary rodent brain endothelial cells", blurb: "Closer to the real thing and tight when fresh, but they lose their properties after about a week and vary between preps.",
            teer: 280, tConf: 3, tj: 3, tDecay: 7, tauDecay: 5, shearGain: 0.8, coSens: 1.3, pgp: 1.0, cv: 0.35, cost: 3
        },
        ipsc: {
            name: "iPSC-derived brain endothelial cells", blurb: "Human cells that reach very high TEER, with a long, expensive differentiation. Sensitive to coating and membrane.",
            teer: 2500, tConf: 3, tj: 4, tDecay: 12, tauDecay: 8, shearGain: 0.8, coSens: 0.5, pgp: 0.8, cv: 0.4, cost: 5
        },
        mdck: {
            name: "MDCK (kidney epithelial control)", blurb: "Not brain at all, but a robust sealing control: tight junctions, no BBB transporters.",
            teer: 200, tConf: 2, tj: 2, tDecay: 99, tauDecay: 1, shearGain: 0.2, coSens: 0, pgp: 0.1, cv: 0.12, cost: 1
        }
    };

    const COCULTURE = {

        none: { name: "None (endothelial cells alone)", gain: 1.0, cost: 0 },
        astro: { name: "Astrocytes on the brain side", gain: 1.5, cost: 2 },
        peri: { name: "Pericytes on the brain side", gain: 1.25, cost: 2 },
        tri: { name: "Astrocytes and pericytes", gain: 1.9, cost: 3 }
    };

    const COATINGS = {

        col4: { name: "Collagen IV and fibronectin", attach: 1.0 },
        fn: { name: "Fibronectin only", attach: 0.9 },
        col1: { name: "Collagen I", attach: 0.8 },
        pll: { name: "Poly-L-lysine", attach: 0.6 },
        none: { name: "No coating", attach: 0.25 }
    };

    // d: diffusion coefficient (cm2/s). p0: permeability of a leaky 30 ohm cm2 monolayer (cm/s).
    // paracell: how strongly the paracellular route (set by TEER) controls it. pgp: pumped out by P-glycoprotein.
    // sticky: loss to PDMS and plastic. mw in Da.
    const TRACERS = {

        caffeine: { name: "Caffeine (small, crosses cells)", mw: 194, d: 7e-6, p0: 3e-5, paracell: 0.15, pgp: 0, sticky: 0.05, unit: "µM" },
        fluor: { name: "Sodium fluorescein (376 Da)", mw: 376, d: 4.3e-6, p0: 4e-5, paracell: 1.0, pgp: 0, sticky: 0.05, unit: "µM" },
        ly: { name: "Lucifer yellow (457 Da)", mw: 457, d: 4.0e-6, p0: 3e-5, paracell: 1.0, pgp: 0, sticky: 0.03, unit: "µM" },
        dex4: { name: "FITC-dextran 4 kDa", mw: 4000, d: 1.3e-6, p0: 8e-6, paracell: 1.0, pgp: 0, sticky: 0.05, unit: "µg/mL" },
        dex40: { name: "FITC-dextran 40 kDa", mw: 40000, d: 4e-7, p0: 1.2e-6, paracell: 1.0, pgp: 0, sticky: 0.08, unit: "µg/mL" },
        propranolol: { name: "Propranolol (lipophilic drug)", mw: 259, d: 6e-6, p0: 4e-5, paracell: 0.1, pgp: 0, sticky: 0.7, unit: "µM" },
        rho123: { name: "Rhodamine 123 (P-gp substrate)", mw: 380, d: 4e-6, p0: 2.5e-5, paracell: 0.6, pgp: 1, sticky: 0.3, unit: "µM" }
    };

    // Metal electrodes in medium: constant phase element Q (microfarad s^(a-1) per cm2) and exponent a.
    const ELECTRODE = {

        pt: { q: 40, a: 0.88, note: "Platinum" },
        au: { q: 25, a: 0.9, note: "Gold" },
        ti: { q: 10, a: 0.85, note: "Titanium" },
        ito: { q: 15, a: 0.88, note: "ITO" },
        agcl: { q: 4000, a: 0.98, note: "Ag/AgCl" },
        al: { q: 8, a: 0.85, note: "Aluminium" },
        cu: { q: 20, a: 0.85, note: "Copper" },
        gc: { q: 30, a: 0.9, note: "Glassy carbon" }
    };

    const CHALLENGES = {

        control: { name: "Medium only (control)", blurb: "Nothing added. Shows the natural drift." },
        tnf: { name: "TNF-α (inflammation), 10 ng/mL", blurb: "Inflammatory cytokine: the junctions loosen over many hours and partly recover." },
        mannitol: { name: "Hyperosmotic mannitol, 1.4 M for 30 min", blurb: "Shrinks the cells and pulls the junctions apart briefly. Used to open the barrier for drug delivery." },
        ogd: { name: "Oxygen and glucose deprivation (stroke model)", blurb: "Starves the cells for a few hours, then returns them to normal medium." },
        triton: { name: "Triton X-100 (kills the cells)", blurb: "Dissolves the cells. Gives the reading with no barrier at all." }
    };

    const OPEN_R = 1.5;                 // ohm cm2 of a cell-free membrane plus a little medium
    const CAP_CELL = 1.5;               // microfarad per cm2 of cell layer

    const MU = 0.78e-3;
    const RHO = 66.7;                   // ohm cm, medium


    function rngFor(dev, tag) { return SC.rng((dev.seed * 2654435761 + tag * 40503) >>> 0); }

    function gaussFrom(rand) {

        let u = 0;
        let v = 0;

        while (u === 0) { u = rand(); }
        while (v === 0) { v = rand(); }

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function cultureOf(dev) {

        const c = dev.culture || {};

        return {
            cells: CELLS[c.cells] ? c.cells : "hcmec",
            co: COCULTURE[c.co] ? c.co : "none",
            coat: COATINGS[c.coat] ? c.coat : "col4",
            days: isFinite(c.days) ? Math.min(21, Math.max(1, c.days)) : 7,
            flow: isFinite(c.flow) ? Math.min(500, Math.max(0, c.flow)) : 5,
            flowB: isFinite(c.flowB) ? Math.min(500, Math.max(0, c.flowB)) : 1
        };
    }

    function working(dev) { return dev.status === "ok" || dev.status === "leaky"; }


    /* ------------------------------------------------
       FLOW AND SHEAR
    ------------------------------------------------ */

    // Wall shear stress (dyn/cm2) in a wide, shallow channel: 6 mu Q / (w h^2).
    function shear(q, w, h) {

        if (!(w > 0) || !(h > 0)) { return 0; }

        const Q = q * 1e-9 / 60;                                          // m3/s
        const tau = 6 * MU * Q / ((w * 1e-6) * (h * 1e-6) * (h * 1e-6));   // Pa

        return tau * 10;
    }

    function flowStats(dev, q, qB) {

        const a = dev.apical;
        const b = dev.baso;

        const Q = q * 1e-9 / 60;
        const QB = qB * 1e-9 / 60;

        const dpA = a.rHyd * Q;
        const dpB = b.rHyd * QB;

        const area = a.wEff * a.h * 1e-12;
        const vel = area > 0 ? Q / area : 0;                              // m/s

        const dh = a.wEff > 0 ? 2 * a.wEff * a.h / (a.wEff + a.h) * 1e-6 : 1e-4;
        const re = 1000 * vel * dh / MU;

        return {
            tau: shear(q, a.wEff, a.h), tauPeak: shear(q, Math.max(a.wMin, 1), a.h), tauB: shear(qB, b.wEff, b.h),
            dpA: dpA, dpB: dpB, vel: vel * 1000, re: re, res: q > 0 ? a.volume * 1e-3 / (q / 60) : Infinity,
            dpMem: Math.abs(dpA - dpB) / 2
        };
    }


    /* ------------------------------------------------
       THE CELL LAYER
    ------------------------------------------------ */

    function shearFactor(tau, gain) {

        if (tau < 0.01) { return 1; }

        const l = Math.log(tau / 10);
        let f = 1 + gain * Math.exp(-l * l / (2 * 0.9 * 0.9));

        if (tau > 40) { f *= Math.exp(-(tau - 40) / 40); }

        return f;
    }

    function memFactor(dev, c) {

        let f = 1;
        const notes = [];

        // Big pores let the cells crawl through to the other side and the layer comes apart.
        if (dev.poreD >= 3) { f *= 0.45; notes.push("The pores are large enough for cells to migrate through."); }
        else if (dev.poreD >= 1.5) { f *= 0.8; }

        // A PDMS membrane is hydrophobic and cells attach poorly unless it is treated.
        if (dev.membrane === "pdms") { f *= 0.75; }

        // Thick membranes keep the astrocyte and pericyte signals from reaching the endothelium.
        const reach = Math.min(1.3, Math.sqrt(Math.max(dev.porosity, 0.01) / 0.126) / (1 + dev.tMem / 25));

        return { f: f, reach: reach, notes: notes };
    }

    // Everything about how well the cell layer seals, before the chip and the assay add their own errors.
    function biology(dev) {

        const cu = cultureOf(dev);
        const c = CELLS[cu.cells];
        const co = COCULTURE[cu.co];
        const coat = COATINGS[cu.coat];

        const m = memFactor(dev, c);

        const fs = flowStats(dev, cu.flow, cu.flowB);

        const attach = coat.attach * (dev.membrane === "pdms" ? 0.9 : 1);

        // Co-culture needs room on the brain side to hold the cells.
        const crowd = dev.baso.h < 40 && cu.co !== "none" ? 0.8 : 1;

        const coGain = 1 + (co.gain - 1) * c.coSens * Math.min(1, m.reach) * crowd;

        const shearF = shearFactor(fs.tau, c.shearGain);

        const tight = c.teer * m.f * coGain * shearF * Math.pow(attach, 0.5) * dev.viability;

        const pocketFrac = dev.apical.area > 0 ? Math.min(1, dev.pocketArea / dev.apical.area) : 0;
        const covMax = Math.max(0, 0.9995 - 0.01 * (1 - attach) - 2 * pocketFrac * 0.05);

        let detach = 1;

        if (fs.tauPeak > 40) { detach = 1 - Math.min(0.5, (fs.tauPeak - 40) / 200); }

        return {
            cu: cu, c: c, tight: tight, attach: attach, covMax: covMax, detach: detach, fs: fs,
            shearF: shearF, coGain: coGain, mem: m, tConf: c.tConf / Math.pow(attach, 0.8)
        };
    }

    // True barrier resistance (ohm cm2 of the whole membrane) on a given day, with the chip's own scatter.
    function teerOn(dev, t, bio) {

        bio = bio || biology(dev);

        const c = bio.c;

        if (!working(dev)) { return OPEN_R; }

        const conf = 1 / (1 + Math.exp(-(t - bio.tConf) / 0.55));
        const tj = 1 - Math.exp(-Math.max(0, t - bio.tConf * 0.7) / c.tj);
        const dec = t > c.tDecay ? Math.exp(-(t - c.tDecay) / c.tauDecay) : 1;

        // This chip's own luck: seeding density, passage, bubbles, and a contamination that may strike on some day.
        const rand = rngFor(dev, 3);
        const chip = Math.exp(c.cv * gaussFrom(rand));
        const hit = rand() < dev.bubbleRisk ? 0.4 + 0.4 * rand() : 1;

        const kr = rngFor(dev, 9);
        const lam = 0.007 + (dev.pocketArea > 0 ? 0.006 : 0);
        const tKill = -Math.log(1 - kr()) / lam;
        const dead = t > tKill ? Math.exp(-(t - tKill) / 1.2) : 1;

        const cov = Math.min(0.9999, bio.covMax * conf * bio.detach * hit * (0.5 + 0.5 * dead));

        // A small day-to-day wobble in the cells' own resistance.
        const wobble = 1 + 0.05 * Math.sin(t * 1.7 + (dev.seed % 7));
        const T = bio.tight * tj * dec * chip * wobble * dead;

        // Cells (high resistance) and bare membrane (low resistance) side by side.
        const g = cov / Math.max(T, OPEN_R) + (1 - cov) / OPEN_R;

        let teer = 1 / g;

        // A leaky bond lets medium go around the cells.
        if (dev.status === "leaky") { teer = 1 / (1 / teer + 1 / 8); }

        return Math.max(teer, OPEN_R * 0.5);
    }


    /* ------------------------------------------------
       IMPEDANCE
    ------------------------------------------------ */

    function cpe(w, q, a) {

        // Z = 1 / (Q (jw)^a)
        const mag = 1 / (q * Math.pow(w, a));
        const ph = -a * Math.PI / 2;

        return { re: mag * Math.cos(ph), im: mag * Math.sin(ph) };
    }

    function parts(dev, teer) {

        const aEff = Math.max(dev.aB * dev.fGeo, 1e-6);                // cm2 over which the electrodes drive current

        // Series resistance: medium in both channels, the pores, and the leads.
        const rMem = RHO * dev.tMem * 1e-4 / Math.max(dev.porosity, 0.01) / aEff;
        const rs = dev.rSolA + dev.rSolB + rMem;

        const rb = teer / aEff;
        const cb = CAP_CELL * 1e-6 * aEff;

        const eA = ELECTRODE[dev.eAMetal] || ELECTRODE.pt;
        const eB = ELECTRODE[dev.eBMetal] || ELECTRODE.pt;

        return {
            aEff: aEff, rs: rs, rb: rb, cb: cb, rMem: rMem,
            qA: eA.q * 1e-6 * Math.max(dev.eAArea, 1e-7), aA: eA.a,
            qB: eB.q * 1e-6 * Math.max(dev.eBArea, 1e-7), aB: eB.a
        };
    }

    function zAt(p, f, withCells) {

        const w = 2 * Math.PI * f;

        let re = p.rs;
        let im = 0;

        const a = cpe(w, p.qA, p.aA);
        const b = cpe(w, p.qB, p.aB);

        re += a.re + b.re;
        im += a.im + b.im;

        if (withCells) {

            // Rb in parallel with Cb.
            const den = 1 + Math.pow(w * p.rb * p.cb, 2);

            re += p.rb / den;
            im += -w * p.rb * p.rb * p.cb / den;
        }

        return { re: re, im: im };
    }

    function logspace(a, b, n) {

        const out = [];

        for (let k = 0; k < n; k++) { out.push(Math.pow(10, a + (b - a) * k / (n - 1))); }

        return out;
    }

    // Noise of an impedance meter: a small fraction of the whole reading, so high-impedance electrodes read worse.
    function noiseFrac(z, zCells) {

        const tot = Math.hypot(z.re, z.im);

        return 0.004 + 0.04 * Math.min(1, Math.max(0, (tot - zCells) / Math.max(tot, 1)));
    }


    /* ------------------------------------------------
       TEST: CONTINUITY AND LEAK CHECK
    ------------------------------------------------ */

    function check(dev) {

        const out = { kind: dev.status, reason: dev.reason || "" };

        if (!working(dev)) { return out; }

        const teer = OPEN_R;
        const p = parts(dev, teer);

        const z = zAt(p, 1000, false);

        out.z1k = Math.hypot(z.re, z.im);
        out.rs = p.rs;
        out.sameSide = dev.sideA === dev.sideB;
        out.noSide = dev.sideA === "none" || dev.sideB === "none";
        out.rHydA = dev.apical.rHyd;
        out.rHydB = dev.baso.rHyd;
        out.volA = dev.apical.volume;
        out.volB = dev.baso.volume;
        out.aB = dev.aB;
        out.bubble = dev.bubbleRisk;
        out.leaky = dev.status === "leaky";

        return out;
    }


    /* ------------------------------------------------
       TEST: FLOW AND SHEAR
    ------------------------------------------------ */

    function flowTest(dev, opts) {

        const qs = logspace(-1, 2.7, 40);

        const out = { q: qs, tau: [], tauB: [], dp: [], q0: opts.q, ok: working(dev) };

        if (!out.ok) { return out; }

        qs.forEach(function (q) {

            const s = flowStats(dev, q, q);

            out.tau.push(s.tau);
            out.tauB.push(s.tauB);
            out.dp.push(s.dpA);
        });

        out.at = flowStats(dev, opts.q, opts.qB);
        out.lp = (dev.porosity * Math.pow(dev.poreD * 0.5e-6, 2)) / (8 * MU * Math.max(dev.tMem, 0.1) * 1e-6);
        out.atWall = out.at.tau > 40 ? "Above about 40 dyn/cm² the cells start to peel off and the layer is damaged." :
            (out.at.tau >= 4 && out.at.tau <= 20 ? "In the physiological range (about 4 to 20 dyn/cm²) where brain endothelium tightens and aligns." :
                "Below the physiological range, so the cells feel little shear.");

        return out;
    }


    /* ------------------------------------------------
       TEST: TEER OVER TIME (one frequency)
    ------------------------------------------------ */

    function teerSeries(dev, opts) {

        const bio = biology(dev);
        const days = [];
        const teer = [];
        const truth = [];
        const raw = [];

        const rand = rngFor(dev, 11);

        const f = opts.freq;

        const out = { days: days, teer: teer, truth: truth, raw: raw, freq: f, ok: working(dev), cu: bio.cu, fs: bio.fs };

        if (!out.ok) { return out; }

        const p0 = parts(dev, OPEN_R);
        const zBlank = zAt(p0, f, false);

        for (let d = 0; d <= 21; d += 1) {

            const T = teerOn(dev, d, bio);
            const p = parts(dev, T);
            const z = zAt(p, f, true);

            // Blank-subtracted real part, scaled to the whole membrane.
            const rReal = z.re - zBlank.re;
            const nz = noiseFrac(z, p.rb);
            const meas = (rReal * (1 + nz * gaussFrom(rand)) + Math.abs(zBlank.re) * nz * gaussFrom(rand) * 0.5) * dev.aB;

            days.push(d);
            truth.push(T);
            raw.push(Math.hypot(z.re, z.im));
            teer.push(Math.max(meas, 0));
        }

        out.day = Math.round(bio.cu.days);
        out.atDay = teer[out.day];
        out.peak = Math.max.apply(null, teer);
        out.peakDay = days[teer.indexOf(out.peak)];
        out.noise = noiseFrac(zAt(parts(dev, truth[out.day]), f, true), parts(dev, truth[out.day]).rb);
        const ea = cpe(2 * Math.PI * f, p0.qA, p0.aA);
        const eb = cpe(2 * Math.PI * f, p0.qB, p0.aB);

        out.zEl = Math.hypot(ea.re + eb.re, ea.im + eb.im);
        out.rbAt = parts(dev, truth[out.day]).rb;
        out.geoLoss = dev.fGeo;

        return out;
    }


    /* ------------------------------------------------
       TEST: IMPEDANCE SPECTRUM
    ------------------------------------------------ */

    function eis(dev, opts) {

        const bio = biology(dev);
        const out = { f: [], re: [], im: [], bre: [], bim: [], ok: working(dev), cu: bio.cu };

        if (!out.ok) { return out; }

        const day = Math.round(bio.cu.days);
        const T = teerOn(dev, day, bio);
        const p = parts(dev, T);
        const rand = rngFor(dev, 21);

        const fs = logspace(Math.log10(opts.fmin), 6, 50);

        fs.forEach(function (f) {

            const z = zAt(p, f, true);
            const zb = zAt(parts(dev, OPEN_R), f, false);
            const nz = noiseFrac(z, p.rb);

            out.f.push(f);
            out.re.push(z.re * (1 + nz * gaussFrom(rand)));
            out.im.push(-z.im * (1 + nz * gaussFrom(rand)));
            out.bre.push(zb.re);
            out.bim.push(-zb.im);
        });

        out.truth = { teer: T, rb: p.rb, cb: p.cb, rs: p.rs, aEff: p.aEff };
        out.day = day;
        out.fit = fitSpectrum(out, dev, p);

        return out;
    }

    // Fit Rs, Rb, Cb and the electrode capacitance Q to the data with a simple simplex search.
    function fitSpectrum(sp, dev, p) {

        const model = function (x, f) {

            const q = { rs: Math.exp(x[0]), rb: Math.exp(x[1]), cb: Math.exp(x[2]), qA: Math.exp(x[3]), aA: 0.9, qB: 1e9, aB: 1 };

            return zAt(q, f, true);
        };

        const cost = function (x) {

            let s = 0;

            for (let k = 0; k < sp.f.length; k++) {

                const z = model(x, sp.f[k]);
                const mag = Math.hypot(sp.re[k], sp.im[k]);

                s += (Math.pow(z.re - sp.re[k], 2) + Math.pow(-z.im - sp.im[k], 2)) / (mag * mag);
            }

            return s;
        };

        const high = sp.re[sp.re.length - 1];

        const starts = [10, 100, 1000, 10000].map(function (rb0) {

            return [Math.log(Math.max(high, 1)), Math.log(rb0), Math.log(Math.max(p.cb, 1e-9)), Math.log(Math.max(p.qA / 2, 1e-9))];
        });

        let bestFit = null;

        starts.forEach(function (x0) {

            const r = simplexFit(cost, x0);

            if (!bestFit || r.val < bestFit.val) { bestFit = r; }
        });

        const rs = Math.exp(bestFit.x[0]);
        const rb = Math.exp(bestFit.x[1]);
        const cb = Math.exp(bestFit.x[2]);

        return { rs: rs, rb: rb, cb: cb, teer: rb * dev.aB, cPerArea: cb / p.aEff * 1e6, err: Math.sqrt(bestFit.val / sp.f.length) };
    }

    // Nelder-Mead minimiser.
    function simplexFit(cost, x0) {

        const n = x0.length;
        let simplex = [x0.slice()];

        for (let k = 0; k < n; k++) { const y = x0.slice(); y[k] += 0.4; simplex.push(y); }

        let vals = simplex.map(cost);

        for (let it = 0; it < 220; it++) {

            const idx = vals.map(function (v, k) { return k; }).sort(function (a, b) { return vals[a] - vals[b]; });

            simplex = idx.map(function (k) { return simplex[k]; });
            vals = idx.map(function (k) { return vals[k]; });

            const cen = new Array(n).fill(0);

            for (let k = 0; k < n; k++) { for (let j = 0; j < n; j++) { cen[j] += simplex[k][j] / n; } }

            const xr = cen.map(function (c, j) { return c + (c - simplex[n][j]); });
            const fr = cost(xr);

            if (fr < vals[0]) {

                const xe = cen.map(function (c, j) { return c + 2 * (c - simplex[n][j]); });
                const fe = cost(xe);

                if (fe < fr) { simplex[n] = xe; vals[n] = fe; } else { simplex[n] = xr; vals[n] = fr; }

            } else if (fr < vals[n - 1]) {

                simplex[n] = xr; vals[n] = fr;

            } else {

                const xc = cen.map(function (c, j) { return c + 0.5 * (simplex[n][j] - c); });
                const fc = cost(xc);

                if (fc < vals[n]) { simplex[n] = xc; vals[n] = fc; }
                else {

                    for (let k = 1; k <= n; k++) { simplex[k] = simplex[k].map(function (v, j) { return simplex[0][j] + 0.5 * (v - simplex[0][j]); }); vals[k] = cost(simplex[k]); }
                }
            }
        }

        let bi = 0;

        vals.forEach(function (v, k) { if (v < vals[bi]) { bi = k; } });

        return { x: simplex[bi], val: vals[bi] };
    }


    /* ------------------------------------------------
       TEST: TRACER PERMEABILITY
    ------------------------------------------------ */

    function permeability(dev, opts) {

        const tr = TRACERS[opts.tracer] || TRACERS.fluor;
        const bio = biology(dev);

        const out = { tr: tr, t: [], c: [], ok: working(dev), cu: bio.cu };

        if (!out.ok) { return out; }

        const day = Math.round(bio.cu.days);
        const T = teerOn(dev, day, bio);
        const rand = rngFor(dev, 31);

        // In series: unstirred water, membrane pores (Renkin restriction), cell layer.
        const dUbl = 30e-4;                                          // cm of unstirred water
        const pUbl = tr.d / dUbl;

        const rs = 4.14e-21 / (6 * Math.PI * MU * tr.d * 1e-4);      // Stokes radius, m
        const lam = Math.min(0.95, rs / (dev.poreD * 0.5e-6));
        const phi = Math.max(0.02, Math.pow(1 - lam, 2) * (1 - 2.104 * lam + 2.09 * Math.pow(lam, 3) - 0.95 * Math.pow(lam, 5)));
        const pMem = tr.d * dev.porosity * phi / Math.max(dev.tMem * 1e-4, 1e-6);

        // The cell layer: the paracellular route follows 1/TEER, the transcellular route does not.
        const x = tr.paracell;
        const pPara = tr.p0 * (30 / Math.max(T, 1)) * (tr.mw > 3000 ? 0.7 : 1);
        const pCell = pPara * x + tr.p0 * (1 - x) * 0.3;

        // The efflux pump pushes its substrates back out, so net transport to the brain side is lower.
        const pg = tr.pgp ? 1 / (1 + 2.5 * bio.c.pgp) : 1;

        // A pressure imbalance pushes fluid through the pores, carrying solute with it.
        const lp = (dev.porosity * Math.pow(dev.poreD * 0.5e-6, 2)) / (8 * MU * Math.max(dev.tMem, 0.1) * 1e-6);       // m/(Pa s)
        const lpEff = lp / (1 + T / 5);
        const fs = bio.fs;
        const jConv = lpEff * fs.dpMem;                                                                                 // m/s
        const pConv = jConv * 100 * 0.9;                                                                                // cm/s

        const pTot = 1 / (1 / pUbl + 1 / pMem + 1 / Math.max(pCell * pg, 1e-10)) + pConv;

        const area = dev.aB;                                         // cm2
        const vol = Math.max(dev.baso.volume * 1e-3, 1e-6);          // cm3 of the receiving channel
        const Q = Math.max(opts.qB, 0) * 1e-3 / 60;                  // cm3/s through the receiving channel
        const pa = pTot * area;                                      // cm3/s

        const rec = 1 - tr.sticky * Math.min(1, 0.2 + dev.absorb);

        const c0 = 100;
        const times = [];
        const conc = [];

        for (let m = 0; m <= 120; m += 5) { times.push(m); }

        times.forEach(function (m) {

            const rate = (pa + Q) / vol;
            const cv = c0 * pa / (pa + Q) * (1 - Math.exp(-rate * m * 60)) * rec;

            conc.push(Math.max(0, cv * (1 + 0.03 * gaussFrom(rand)) + 0.05 * gaussFrom(rand)));
        });

        out.t = times;
        out.c = conc;

        // How the lab would work it out: steady state if there is flow, early slope if the channel is static.
        let papp;

        if (Q > 0) {

            const ss = conc.slice(-4);
            const co = Math.min(ss.reduce(function (a, v) { return a + v; }, 0) / ss.length / c0, 0.98);

            papp = Q * co / (area * (1 - co));

        } else {

            const k = 4;
            let sx = 0;
            let sy = 0;
            let sxy = 0;
            let sxx = 0;

            for (let i = 0; i <= k; i++) { sx += times[i] * 60; sy += conc[i]; sxy += times[i] * 60 * conc[i]; sxx += Math.pow(times[i] * 60, 2); }

            const slope = (sxy - sx * sy / (k + 1)) / (sxx - sx * sx / (k + 1));

            papp = slope * vol / (area * c0);
        }

        out.papp = Math.max(1e-9, papp);
        out.parts = { pUbl: pUbl, pMem: pMem, pCell: pCell * pg, pConv: pConv, pTot: pTot };
        out.truePapp = pTot;
        out.teer = T;
        out.recovery = rec;
        out.dpMem = fs.dpMem;
        out.qB = opts.qB;
        out.tEq = vol / (pa + Q) / 60;                                // minutes for the receiver to approach equilibrium
        out.sink = out.tEq > 25;

        return out;
    }


    /* ------------------------------------------------
       TEST: CHALLENGE
    ------------------------------------------------ */

    function challenge(dev, opts) {

        const bio = biology(dev);
        const out = { h: [], teer: [], ok: working(dev), cu: bio.cu, agent: opts.agent };

        if (!out.ok) { return out; }

        const day = Math.round(bio.cu.days);
        const T0 = teerOn(dev, day, bio);
        const rand = rngFor(dev, 41);

        // Fraction of the barrier left (1 = untouched).
        const f = function (h) {

            if (opts.agent === "control") { return 1 + 0.01 * Math.sin(h / 3); }

            if (opts.agent === "tnf") {

                const f28 = 1 - 0.55 * (1 - Math.exp(-28 / 8));

                if (h < 28) { return 1 - 0.55 * (1 - Math.exp(-h / 8)); }

                return 1 - (1 - f28) * (0.3 + 0.7 * Math.exp(-(h - 28) / 20));
            }

            if (opts.agent === "mannitol") {

                if (h < 1) { return 1; }
                if (h < 1.5) { return 1 - 0.7 * (h - 1) / 0.5; }

                return 1 - 0.7 * Math.exp(-(h - 1.5) / 3);
            }

            if (opts.agent === "ogd") {

                if (h < 4) { return 1 - 0.6 * (1 - Math.exp(-h / 1.5)); }

                const d = 1 - Math.exp(-(h - 4) / 12);

                return 1 - 0.6 * (1 - Math.exp(-4 / 1.5)) * (1 - d) - 0.05 * d;
            }

            return h < 1 ? 1 : OPEN_R / T0 + (1 - OPEN_R / T0) * Math.exp(-(h - 1) / 0.5);
        };

        for (let h = 0; h <= 48; h += 1) {

            const base = Math.max(OPEN_R, T0 * f(h));
            const p = parts(dev, base);
            const z = zAt(p, 12.5, true);
            const z0 = zAt(parts(dev, OPEN_R), 12.5, false);
            const nz = noiseFrac(z, p.rb);

            out.h.push(h);
            out.teer.push(Math.max(0, (z.re - z0.re) * (1 + nz * gaussFrom(rand)) * dev.aB));
        }

        out.base = out.teer[0];
        out.min = Math.min.apply(null, out.teer);
        out.minH = out.h[out.teer.indexOf(out.min)];
        out.end = out.teer[out.teer.length - 1];
        out.recoverPct = out.base > 0 ? (out.end - out.min) / Math.max(out.base - out.min, 1e-9) * 100 : 0;

        return out;
    }


    root.LabBBB = {

        CELLS: CELLS, COCULTURE: COCULTURE, COATINGS: COATINGS, TRACERS: TRACERS, ELECTRODE: ELECTRODE, CHALLENGES: CHALLENGES,
        OPEN_R: OPEN_R, shear: shear, flowStats: flowStats, biology: biology, teerOn: teerOn, parts: parts, zAt: zAt,
        check: check, flowTest: flowTest, teerSeries: teerSeries, eis: eis, permeability: permeability, challenge: challenge,
        cultureOf: cultureOf, working: working
    };

    if (typeof module !== "undefined" && module.exports) { module.exports = root.LabBBB; }

}(typeof window !== "undefined" ? window : globalThis));
