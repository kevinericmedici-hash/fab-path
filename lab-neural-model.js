/* ========================================
   NEURAL PROBE: ELECTROCHEMISTRY AND MEASUREMENTS

   Pure functions of a fabricated probe ("dev", from lab-neural-engine.js).
   Each recording site is an electrode in a salt solution: a spreading
   resistance in series with a constant-phase interface, behind a trace with
   its own resistance and capacitance. On top of that sit the tests: impedance,
   cyclic voltammetry, dopamine (fast-scan voltammetry and amperometry),
   glutamate (enzyme sensor with a sentinel), extracellular spikes, a month
   in warm saline, and the mechanics of pushing the probe into tissue.

   Needs window.SCLab (for its seeded random numbers). All numbers are
   rounded textbook-scale approximations for teaching.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;


    /* ------------------------------------------------
       TABLES
    ------------------------------------------------ */

    // Bare metals. q: constant-phase capacitance (uF s^(a-1) per cm2). a: exponent. csc: charge storage (mC/cm2).
    // h2o2: how well it oxidises hydrogen peroxide. da: dopamine signal in fast-scan voltammetry (uA per uM per cm2).
    // k0: electron transfer rate for ferrocyanide (cm/s). rough: true area over drawn area.
    const METAL = {

        au: { q: 20, a: 0.92, csc: 0.08, h2o2: 0.25, da: 55, k0: 0.03, rough: 1.4, corr: 0 },
        pt: { q: 25, a: 0.9, csc: 0.2, h2o2: 1, da: 90, k0: 0.05, rough: 1.5, corr: 0 },
        ti: { q: 12, a: 0.85, csc: 0.05, h2o2: 0.03, da: 10, k0: 0.001, rough: 1.2, corr: 0 },
        ito: { q: 8, a: 0.9, csc: 0.05, h2o2: 0.1, da: 30, k0: 0.005, rough: 1.2, corr: 0 },
        al: { q: 10, a: 0.85, csc: 0.03, h2o2: 0.02, da: 5, k0: 0.0005, rough: 1.2, corr: 1 },
        cu: { q: 20, a: 0.85, csc: 0.05, h2o2: 0.1, da: 20, k0: 0.01, rough: 1.3, corr: 1 },
        agcl: { q: 3000, a: 0.98, csc: 1, h2o2: 0.1, da: 20, k0: 0.1, rough: 1.5, corr: 0.2 },
        gc: { q: 30, a: 0.9, csc: 0.8, h2o2: 0.1, da: 120, k0: 0.02, rough: 1.3, corr: 0 }
    };

    // Coatings. qPerUm: capacitance per um of thickness (uF/cm2), tSat: thickness where it stops growing (um).
    // cscPerUm: charge storage (mC/cm2 per um). da: dopamine signal of the coating itself (uA/uM/cm2), 0 = no effect.
    // mult: multiplier on the dopamine signal from a film that blocks or slows diffusion. aa: ascorbate (anion) passing factor.
    // enzyme: turns glutamate into peroxide. k0m: slows electron transfer. delam: chance of peeling per day.
    const COAT = {

        pedot: { qPerUm: 4000, tSat: 3, a: 0.88, cscPerUm: 70, da: 2000, mult: 1, aa: 1, k0m: 1, delam: 0.01, rough: 1 },
        ptblack: { qPerUm: 6000, tSat: 3, a: 0.92, cscPerUm: 10, da: 1800, mult: 1, aa: 1, k0m: 1, delam: 0.015, rough: 1 },
        irox: { qPerUm: 3000, tSat: 0.5, a: 0.85, cscPerUm: 90, da: 300, mult: 1, aa: 1, k0m: 0.8, delam: 0.004, rough: 1 },
        tin: { qPerUm: 2500, tSat: 0.5, a: 0.88, cscPerUm: 12, da: 250, mult: 1, aa: 1, k0m: 1, delam: 0.0005, rough: 1 },
        cnt: { qPerUm: 4000, tSat: 2, a: 0.9, cscPerUm: 12, da: 5000, mult: 1, aa: 1, k0m: 1.5, delam: 0.01, rough: 40 },
        nafion: { qPerUm: 0, tSat: 1, a: 0, cscPerUm: 0, da: 0, mult: 0.75, aa: 0.04, k0m: 0.6, delam: 0.001, rough: 1, qm: 0.8 },
        gluox: { qPerUm: 0, tSat: 1, a: 0, cscPerUm: 0, da: 0, mult: 0.35, aa: 0.6, k0m: 0.2, delam: 0.005, rough: 1, enzyme: true, qm: 0.6 }
    };

    const SOLUTIONS = {

        pbs: { name: "PBS (phosphate buffered saline)", blurb: "Plain salt solution: no redox couple, so you see only charging of the electrode.", rho: 0.65, redox: false },
        ferro: { name: "5 mM ferri/ferrocyanide in PBS", blurb: "A fast, reversible redox couple. The peaks and the impedance tell you how open the electrode surface is.", rho: 0.65, redox: true }
    };

    const EPS0 = 8.854e-12;
    const KB = 1.380649e-23;
    const T = 310;
    const F = 96485;

    const RHO_TISSUE = 3.5;            // ohm m, brain tissue
    const C_AMP = 25e-12;              // amplifier input plus cable, farads
    const R_AMP = 1e9;                 // amplifier input resistance


    function rngFor(dev, tag) { return SC.rng((dev.seed * 2654435761 + tag * 40503) >>> 0); }

    function gaussFrom(rand) {

        let u = 0;
        let v = 0;

        while (u === 0) { u = rand(); }
        while (v === 0) { v = rand(); }

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function working(dev) { return dev.status === "ok"; }

    function okChans(dev) { return (dev.ch || []).filter(function (c) { return c.status === "ok"; }); }

    function logspace(a, b, n) {

        const out = [];

        for (let k = 0; k < n; k++) { out.push(Math.pow(10, a + (b - a) * k / (n - 1))); }

        return out;
    }

    function mc(m) { return METAL[m] || METAL.au; }

    // How much of this channel's coating is still there on a given day (1 = all of it).
    function coatsOf(dev, ch, day) {

        const out = [];

        (ch.coats || []).forEach(function (c, k) {

            const ph = COAT[c.mat];

            if (!ph) { return; }

            let alive = 1;

            if (day > 0) {

                const r = rngFor(dev, 500 + 17 * Number(ch.d) + k);
                const hazard = Math.max(1e-4, ph.delam * (1.35 - Math.min(c.adhesion, 1) * Math.min(c.quality, 1)));
                const tDel = -Math.log(1 - r()) / hazard;

                alive = day > tDel ? 0 : 1;

                if (ph.enzyme) { alive = Math.pow(0.5, day / 14) * (alive ? 1 : 0.1); }
            }

            out.push({ mat: c.mat, t: c.t, cover: c.cover * alive, ph: ph, alive: alive });
        });

        return out;
    }

    // Local luck: how well this site's coating took.
    function siteLuck(dev, ch) {

        const r = rngFor(dev, 40 + Number(ch.d));
        const cq = (ch.coats || []).length ? Math.min.apply(null, ch.coats.map(function (c) { return c.quality; })) : 1;

        return Math.exp((0.12 + 0.3 * (1 - cq)) * gaussFrom(r));
    }


    /* ------------------------------------------------
       THE ELECTRODE-TISSUE INTERFACE
    ------------------------------------------------ */

    // Interface parameters of one site on a given day, in a given solution.
    function interface_(dev, ch, sol, day) {

        const m = mc(ch.metal);
        const coats = coatsOf(dev, ch, day || 0);
        const luck = siteLuck(dev, ch);

        let cmax = 0;

        coats.forEach(function (c) { if (c.ph.qPerUm > 0) { cmax = Math.max(cmax, c.cover); } });

        const A = ch.area;                                         // cm2

        // Capacitance density (uF per cm2): bare metal where there is no coating, plus the coatings.
        let q = m.q * m.rough * (1 - cmax);
        let a = m.a * (1 - cmax);
        let w = 1 - cmax;
        let csc = m.csc * (1 - cmax);
        let da = m.da * (1 - cmax);
        let rough = m.rough * (1 - cmax);
        let k0m = 1;
        let mult = 1;
        let aaPass = 1;
        let enzyme = 0;
        let h2 = m.h2o2;

        coats.forEach(function (c) {

            const ph = c.ph;
            const te = Math.min(c.t, ph.tSat);

            if (ph.qPerUm > 0) {

                const qc = ph.qPerUm * te * c.cover;

                q += qc * luck;
                a += ph.a * c.cover;
                w += c.cover;
                csc += ph.cscPerUm * te * c.cover * luck;
                rough += ph.rough * c.cover;
            }

            if (ph.da > 0) { da += ph.da * c.cover; }

            if (ph.qm) { q *= 1 - c.cover * (1 - ph.qm); }

            k0m *= 1 - c.cover * (1 - ph.k0m);
            mult *= 1 - c.cover * (1 - ph.mult);
            aaPass *= 1 - c.cover * (1 - ph.aa);

            if (ph.enzyme) { enzyme += c.cover * Math.min(1, c.t / 1.2) * (c.alive || 0); }
        });

        const alpha = w > 0 ? Math.min(0.98, Math.max(0.7, a / Math.max(w, 1e-6))) : m.a;

        return {
            A: A, q: Math.max(q, 0.5), alpha: alpha, csc: csc, da: da, mult: mult, aaPass: aaPass, enzyme: enzyme, h2: h2,
            k0: m.k0 * k0m * (cmax > 0 ? 1 : 1), rough: Math.max(rough, 1), coats: coats, metal: ch.metal,
            rho: (SOLUTIONS[sol] || SOLUTIONS.pbs).rho, redox: !!(SOLUTIONS[sol] || SOLUTIONS.pbs).redox, luck: luck
        };
    }

    // Spreading resistance of a small disk in a conductor: rho / (4 r).
    function rSpread(ch, rho) { return rho / (4 * Math.max(ch.rEq, 0.5) * 1e-6); }

    // Complex impedance of a channel as seen at its pad, at one frequency.
    function zChannel(dev, ch, f, sol, day, rho) {

        const it = interface_(dev, ch, sol, day);

        const w = 2 * Math.PI * f;

        // Constant-phase element: Y = Q A (jw)^a.
        const Q = it.q * 1e-6 * it.A;
        const mag = Q * Math.pow(w, it.alpha);
        const ph = it.alpha * Math.PI / 2;

        let yRe = mag * Math.cos(ph);
        let yIm = mag * Math.sin(ph);

        // Charge transfer in parallel (only with a redox couple, otherwise a very large leak).
        let rct = 1e12;

        if (it.redox) { rct = 1 / (F * F / (8.314 * T) * it.k0 * 5e-6 * Math.max(it.A * it.rough, 1e-12)) / 4; }
        else { rct = 5e6 / Math.max(it.A, 1e-12); }

        yRe += 1 / rct;

        const yMag2 = yRe * yRe + yIm * yIm;

        let zRe = yRe / yMag2;
        let zIm = -yIm / yMag2;

        const rs = rSpread(ch, rho === undefined ? it.rho : rho);

        zRe += rs + (isFinite(ch.rTrace) ? ch.rTrace : 0);

        // The covered trace shunts to the tissue through its parasitic capacitance (more of it as the insulation takes up water).
        const soak = 1 + 0.02 * day;
        const cp = ch.cPar * soak;

        const aRe = zRe;
        const aIm = zIm;
        const den = (1 - w * cp * aIm) * (1 - w * cp * aIm) + (w * cp * aRe) * (w * cp * aRe);

        // 1 / (1/Z + jwC)  =  Z / (1 + jwC Z)
        const nRe = aRe * (1 - w * cp * aIm) + aIm * (w * cp * aRe);
        const nIm = aIm * (1 - w * cp * aIm) - aRe * (w * cp * aRe);

        return { re: nRe / den, im: nIm / den, it: it, rs: rs };
    }

    function zMag(z) { return Math.hypot(z.re, z.im); }


    /* ------------------------------------------------
       TEST: CONTINUITY AND ISOLATION
    ------------------------------------------------ */

    function check(dev) {

        const out = { status: dev.status, reason: dev.reason || "", ch: [] };

        (dev.ch || []).forEach(function (ch) {

            const row = { d: ch.d, status: ch.status, reason: ch.reason };

            if (ch.status === "ok") {

                const z = zChannel(dev, ch, 1000, "pbs", 0);

                row.z1k = zMag(z);
                row.rTrace = ch.rTrace;
                row.area = ch.areaUm2;
                row.cPar = ch.cPar;
                row.pPin = ch.pPin;

                let worst = 0;

                Object.keys(ch.xt || {}).forEach(function (o) { worst = Math.max(worst, ch.xt[o] / (ch.xt[o] + C_AMP + ch.cPar)); });

                row.xtalk = worst;
            }

            out.ch.push(row);
        });

        return out;
    }


    /* ------------------------------------------------
       TEST: IMPEDANCE SPECTRUM
    ------------------------------------------------ */

    function eis(dev, opts) {

        const out = { f: logspace(0, 5, 41), ch: [], sol: opts.sol, ok: working(dev) };

        if (!out.ok) { return out; }

        const rand = rngFor(dev, 21);

        okChans(dev).forEach(function (ch) {

            const re = [];
            const im = [];

            out.f.forEach(function (f) {

                const z = zChannel(dev, ch, f, opts.sol, 0);
                const nz = 0.01 + (f < 10 ? 0.03 : 0);

                re.push(z.re * (1 + nz * gaussFrom(rand)));
                im.push(-z.im * (1 + nz * gaussFrom(rand)));
            });

            const z1 = zChannel(dev, ch, 1000, opts.sol, 0);

            out.ch.push({ d: ch.d, re: re, im: im, z1k: zMag(z1), rs: z1.rs, it: z1.it, area: ch.areaUm2 });
        });

        return out;
    }


    /* ------------------------------------------------
       TEST: CYCLIC VOLTAMMETRY
    ------------------------------------------------ */

    function gaussPeak(e, e0, w) { return Math.exp(-Math.pow((e - e0) / w, 2)); }

    // Redox of ferri/ferrocyanide on one electrode by finite differences. Two cycles are run and the second is returned,
    // so the start-up transient is gone. Currents in amperes, oxidation positive.
    function redoxLoop(it, ch, vlo, vhi, scan, rsTotal) {

        const D = 7e-6;
        const C0 = 5e-6;                           // mol/cm3 of each form
        const A = Math.max(it.A * Math.min(it.rough, 3), 1e-12);
        const E0 = 0.22;
        const k0 = it.k0;
        const f = F / (8.314 * T);

        const tCycle = 2 * (vhi - vlo) / scan;
        const tTotal = 2 * tCycle;
        const N = 70;
        const dx = 6 * Math.sqrt(D * tTotal) / N;
        const dt = Math.min(0.4 * dx * dx / D, tTotal / 320);
        const steps = Math.ceil(tTotal / dt);

        let cO = new Float64Array(N).fill(C0);
        let cR = new Float64Array(N).fill(C0);

        const e = [];
        const i = [];

        let lastI = 0;

        for (let s = 0; s <= steps; s++) {

            const t = s * dt;
            const tc = t % tCycle;
            const half = tCycle / 2;
            const eApp = tc < half ? vhi - scan * tc : vlo + scan * (tc - half);

            // The potential across the interface loses the iR drop of the previous current.
            const eInt = eApp - lastI * rsTotal;

            const kf = k0 * Math.exp(-0.5 * f * (eInt - E0));        // reduction (O to R)
            const kb = k0 * Math.exp(0.5 * f * (eInt - E0));         // oxidation (R to O)

            const jNet = (kb * cR[0] - kf * cO[0]) / (1 + (kb + kf) * dx / D * 0.5);

            const nO = new Float64Array(N);
            const nR = new Float64Array(N);

            for (let x = 1; x < N - 1; x++) {

                nO[x] = cO[x] + D * dt / (dx * dx) * (cO[x + 1] - 2 * cO[x] + cO[x - 1]);
                nR[x] = cR[x] + D * dt / (dx * dx) * (cR[x + 1] - 2 * cR[x] + cR[x - 1]);
            }

            nO[0] = cO[0] + D * dt / (dx * dx) * (cO[1] - cO[0]) + jNet * dt / dx;
            nR[0] = cR[0] + D * dt / (dx * dx) * (cR[1] - cR[0]) - jNet * dt / dx;
            nO[N - 1] = C0;
            nR[N - 1] = C0;

            for (let x = 0; x < N; x++) { nO[x] = Math.max(nO[x], 0); nR[x] = Math.max(nR[x], 0); }

            cO = nO;
            cR = nR;

            lastI = F * A * jNet;

            if (t >= tCycle) { e.push(eApp); i.push(lastI); }
        }

        return { e: e, i: i };
    }

    function cv(dev, opts) {

        const out = { ch: [], sol: opts.sol, ok: working(dev), wide: opts.wide, scan: opts.scan };

        if (!out.ok) { return out; }

        const vlo = opts.wide ? -0.9 : -0.6;
        const vhi = opts.wide ? 1.1 : 0.8;
        const rand = rngFor(dev, 31);

        okChans(dev).forEach(function (ch) {

            const it = interface_(dev, ch, opts.sol, 0);

            const rsTot = rSpread(ch, it.rho) + (isFinite(ch.rTrace) ? ch.rTrace : 0);

            const E = [];
            const I = [];

            // Charging current: C(nu) nu, with C from the constant-phase element at the scan's own frequency.
            const wEq = 2 * Math.PI * opts.scan / (2 * (vhi - vlo));
            const cEff = it.q * 1e-6 * it.A * Math.pow(wEq, it.alpha - 1);

            let faradaic = null;

            if (it.redox) { faradaic = redoxLoop(it, ch, vlo, vhi, opts.scan, rsTot); }

            const nPts = 240;
            const half = nPts / 2;

            const m = mc(ch.metal);
            const cs = it.csc * 1e-3 * it.A;                                         // coulombs of storage
            const cscMetal = m.csc * 1e-3 * it.A;
            const bare = it.coats.reduce(function (acc, c) { return Math.max(acc, c.cover); }, 0);

            for (let s = 0; s < nPts; s++) {

                // The sweep starts at the top, goes down to the bottom, and comes back up.
                const up = s >= half;
                const frac = up ? (s - half) / half : s / half;
                const e = up ? vlo + (vhi - vlo) * frac : vhi - (vhi - vlo) * frac;
                const dir = up ? 1 : -1;

                // Charging current: C nu, anodic on the way up.
                let i = cEff * opts.scan * dir;

                // Redox of the coatings and hydrogen and oxide features of bare noble metal.
                it.coats.forEach(function (c) {

                    if (c.mat === "irox") { i += dir * cs * opts.scan * 0.7 * gaussPeak(e, 0.25, 0.3) * c.cover; }
                });

                if (ch.metal === "pt" || ch.metal === "au") {

                    const feat = cscMetal * opts.scan * 0.6 * (1 - bare);
                    const k = ch.metal === "pt" ? 1 : 0.2;

                    i += (up ? 1 : -1) * feat * k * gaussPeak(e, -0.2, 0.1);
                    i += (up ? 1 : 0) * feat * 0.5 * gaussPeak(e, 0.7, 0.12);
                    i += (up ? 0 : -1) * feat * 0.7 * gaussPeak(e, 0.45, 0.12);
                }

                // Splitting water outside the stable window.
                const ev = it.A * 2e-7;

                if (e < -0.7) { i -= ev * Math.exp((-0.7 - e) / 0.1); }
                if (e > 1.0) { i += ev * Math.exp((e - 1.0) / 0.1); }

                E.push(e);
                I.push(i);
            }

            if (faradaic) {

                // Interpolate the finite-difference loop onto the same potential grid.
                const fe = faradaic.e;
                const fi = faradaic.i;

                for (let s = 0; s < nPts; s++) {

                    const up = s >= half;
                    let best = 0;
                    let bd = Infinity;

                    const lo = up ? Math.floor(fe.length / 2) : 0;
                    const hi = up ? fe.length : Math.floor(fe.length / 2);

                    for (let k = lo; k < hi; k++) {

                        const dd = Math.abs(fe[k] - E[s]);

                        if (dd < bd) { bd = dd; best = k; }
                    }

                    I[s] += fi[best];
                }
            }

            const noise = 0.003 * Math.max.apply(null, I.map(Math.abs)) + 2e-11;

            for (let s = 0; s < nPts; s++) { I[s] += noise * gaussFrom(rand); }

            // Cathodic charge storage capacity over one cycle.
            let q = 0;
            const dE = Math.abs(E[1] - E[0]);

            for (let s = 0; s < nPts; s++) { if (I[s] < 0) { q += -I[s] * dE / opts.scan; } }

            const cscMeas = q / Math.max(it.A, 1e-12) * 1e3;                  // mC/cm2

            let ip = -Infinity;
            let ic = Infinity;
            let ep = 0;
            let ecv = 0;

            I.forEach(function (v, s) { if (v > ip) { ip = v; ep = E[s]; } if (v < ic) { ic = v; ecv = E[s]; } });

            out.ch.push({ d: ch.d, e: E, i: I, csc: cscMeas, ip: ip, ic: ic, dEp: ep - ecv, it: it, rsTot: rsTot, qm: q });
        });

        return out;
    }


    /* ------------------------------------------------
       TEST: DOPAMINE
    ------------------------------------------------ */

    // Signal of one site to dopamine, in nA per uM, for a technique.
    function daSens(dev, ch, tech, day) {

        const it = interface_(dev, ch, "pbs", day || 0);

        const rEff = ch.rEq * 1e-4 * Math.sqrt(Math.min(it.rough, 40));              // cm

        if (tech === "amp") {

            // Steady current of a disk: 4 n F D r C.
            const s = 4 * 2 * F * 6e-6 * rEff * 1e-9 * 1e9;                         // nA per uM

            return { s: s * it.mult * (0.5 + 0.5 * Math.min(it.da / 90, 5)), it: it };
        }

        // Fast-scan: signal grows with area and adsorption.
        const s = it.da * it.A * 1e3 * it.mult * (it.rough > 1.8 ? 1 : 1);          // uA/uM/cm2 x cm2 = uA/uM; times 1000 = nA

        return { s: s, it: it };
    }

    function dopamine(dev, opts) {

        const out = { ch: [], tech: opts.tech, ok: working(dev) };

        if (!out.ok) { return out; }

        const rand = rngFor(dev, 51);
        const conc = [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5];

        okChans(dev).forEach(function (ch) {

            const ds = daSens(dev, ch, opts.tech, 0);
            const it = ds.it;
            const S = Math.max(ds.s, 1e-6);

            // Background charging current of the scan, and the noise that rides on it.
            let iBg;
            let sigma;

            if (opts.tech === "fscv") {

                const fScan = 400 / (2 * 1.7);
                const c = it.q * 1e-6 * it.A * Math.pow(2 * Math.PI * fScan, it.alpha - 1);

                iBg = c * 400;
                sigma = Math.sqrt(Math.pow(100e-12, 2) + Math.pow(0.0006 * iBg, 2));

            } else {

                iBg = 0;
                sigma = Math.sqrt(Math.pow(1e-12, 2) + Math.pow(2e-13 * Math.sqrt(1 + it.A * 1e6), 2));
            }

            const cal = conc.map(function (c) {

                const ideal = S * c / (1 + c / 25) * 1e-9;

                return ideal + sigma * gaussFrom(rand);
            });

            // Linear fit through the low concentrations.
            let sx = 0;
            let sy = 0;
            let sxy = 0;
            let sxx = 0;
            const nf = 5;

            for (let k = 0; k < nf; k++) { sx += conc[k]; sy += cal[k]; sxy += conc[k] * cal[k]; sxx += conc[k] * conc[k]; }

            const slope = (nf * sxy - sx * sy) / (nf * sxx - sx * sx);               // A per uM

            const lod = 3 * sigma / Math.max(Math.abs(slope), 1e-18);

            // Interferents at brain-like levels.
            const aaRel = (opts.tech === "fscv" ? 0.01 : 0.8) * it.aaPass;
            const aaApparent = 200 * aaRel;                                          // dopamine-equivalent uM
            const dopacApparent = 20 * (opts.tech === "fscv" ? 0.01 : 0.6) * it.aaPass;

            // The voltammogram of 1 uM dopamine, with the potential shifted by the iR drop.
            const iPeak = S * 1;
            const rsTot = rSpread(ch, it.rho) + (isFinite(ch.rTrace) ? ch.rTrace : 0);
            const shift = iPeak * 1e-9 * rsTot;

            const eAxis = [];
            const iAxis = [];

            for (let s = 0; s < 120; s++) {

                const e = -0.4 + 1.7 * s / 119;

                eAxis.push(e);
                iAxis.push(iPeak * (gaussPeak(e, 0.6 + shift, 0.1) - 0.45 * gaussPeak(e, -0.2 - shift * 0.3, 0.14)) + sigma * 1e9 * gaussFrom(rand));
            }

            // A release event: dopamine appears at 1 s, and uptake clears it.
            const ts = [];
            const conTrue = [];
            const conMeas = [];

            let cd = 0;
            const dt = 0.1;

            for (let s = 0; s < 60; s++) {

                const t = s * dt;

                if (Math.abs(t - 1) < dt / 2) { cd += 0.8; }

                cd += -dt * 4 * cd / (0.2 + cd);
                cd = Math.max(cd, 0);

                ts.push(t);
                conTrue.push(cd);
                conMeas.push((S * cd * 1e-9 + sigma * gaussFrom(rand)) / (S * 1e-9));
            }

            out.ch.push({
                d: ch.d, conc: conc, cal: cal.map(function (v) { return v * 1e9; }), slope: slope * 1e9, lod: lod, sigma: sigma * 1e12, iBg: iBg * 1e9,
                aaApparent: aaApparent, dopacApparent: dopacApparent, e: eAxis, i: iAxis, rel: { t: ts, true_: conTrue, meas: conMeas },
                it: it, shift: shift * 1000, S: S
            });
        });

        return out;
    }


    /* ------------------------------------------------
       TEST: GLUTAMATE
    ------------------------------------------------ */

    function glutamate(dev, opts) {

        const out = { ch: [], ok: working(dev), sentinel: null, t: [] };

        if (!out.ok) { return out; }

        const rand = rngFor(dev, 61);
        const chans = okChans(dev);

        const info = chans.map(function (ch) {

            const it = interface_(dev, ch, "pbs", 0);

            // Peroxide at +0.7 V: signal per uM of glutamate, and the response to ascorbate that does not need the enzyme.
            const sGlu = 3 * it.A * 1e3 * it.h2 * it.enzyme * (it.rough > 1.8 ? Math.sqrt(it.rough) / 2 : 1);                // nA/uM
            const rEff = ch.rEq * 1e-4;
            const sAA = 4 * 2 * F * 5e-6 * rEff * 1e-9 * 1e9 * Math.min(it.rough, 40) * 0.4 * it.aaPass * (it.h2 > 0.3 ? 1 : 0.5);

            return { ch: ch, it: it, sGlu: sGlu, sAA: sAA };
        });

        const enz = info.filter(function (x) { return x.it.enzyme > 0.05; });
        const bare = info.filter(function (x) { return x.it.enzyme <= 0.05; });

        // The sentinel is the bare channel whose area is closest to the enzyme channel's.
        const pickSentinel = function (e) {

            let best = null;

            bare.forEach(function (b) {

                if (!best || Math.abs(Math.log(b.ch.area / e.ch.area)) < Math.abs(Math.log(best.ch.area / e.ch.area))) { best = b; }
            });

            return best;
        };

        // Additions: cumulative glutamate in uM at each step, and ascorbate at the end.
        const steps = [{ t: 100, glu: 5 }, { t: 200, glu: 10 }, { t: 300, glu: 20 }, { t: 400, glu: 50 }];
        const tAA = 500;
        const aa = 200;

        const t = [];

        for (let s = 0; s <= 600; s += 5) { t.push(s); }

        out.t = t;

        const levelAt = function (tt) {

            let g = 0;

            steps.forEach(function (st) { if (tt >= st.t) { g = st.glu; } });

            return g;
        };

        const respond = function (x, e, tt, withEnzyme) {

            const g = levelAt(tt);
            const a = tt >= tAA ? aa : 0;

            // The enzyme layer slows the response by the diffusion time through it.
            const tau = 3 + 20 * (x.it.coats.filter(function (c) { return c.ph.enzyme; }).reduce(function (s, c) { return s + c.t; }, 0));

            let gDel = 0;

            steps.forEach(function (st) { if (tt >= st.t) { gDel = st.glu; } });

            let gSm = 0;
            let tPrev = 0;
            let gPrev = 0;

            steps.forEach(function (st) {

                if (tt >= st.t) {

                    const dt = tt - st.t;

                    gSm += (st.glu - gPrev) * (1 - Math.exp(-dt / tau));
                    gPrev = st.glu;
                    tPrev = st.t;
                }
            });

            const aaS = a > 0 ? x.sAA * a * (1 - Math.exp(-(tt - tAA) / 4)) : 0;

            return (withEnzyme ? x.sGlu * gSm : 0) + aaS;
        };

        enz.forEach(function (x) {

            const sentinelInfo = pickSentinel(x);

            const raw = [];
            const sen = [];
            const sub = [];
            const drift = 0.0005 * (rand() - 0.5);

            const sigma = 0.002 + 0.0003 * Math.sqrt(1 + x.ch.area * 1e6);

            t.forEach(function (tt) {

                const nz = sigma * gaussFrom(rand);
                const base = 0.02 + drift * tt / 60;

                const iRaw = respond(x, 0, tt, true) + base + nz;

                raw.push(iRaw);

                if (sentinelInfo) {

                    const iS = respond(sentinelInfo, 0, tt, false) + base + sigma * gaussFrom(rand);

                    sen.push(iS);
                    sub.push(iRaw - iS);

                } else {

                    sen.push(NaN);
                    sub.push(iRaw);
                }
            });

            // Sensitivity from the plateaus of the subtracted trace.
            const level = function (arr, t0) {

                const sel = [];

                t.forEach(function (tt, k) { if (tt >= t0 - 30 && tt < t0 - 5) { sel.push(arr[k]); } });

                return sel.reduce(function (s, v) { return s + v; }, 0) / Math.max(sel.length, 1);
            };

            const lv = [level(sub, 100)].concat(steps.map(function (st, k) { return level(sub, k < steps.length - 1 ? steps[k + 1].t : 500); }));
            const gl = [0].concat(steps.map(function (st) { return st.glu; }));

            let sx = 0;
            let sy = 0;
            let sxy = 0;
            let sxx = 0;

            gl.forEach(function (g, k) { sx += g; sy += lv[k]; sxy += g * lv[k]; sxx += g * g; });

            const nn = gl.length;
            const slope = (nn * sxy - sx * sy) / (nn * sxx - sx * sx);               // nA per uM
            const lod = 3 * sigma / Math.max(Math.abs(slope), 1e-9);

            // Ascorbate: what the trace claims after the interferent is added.
            const aaPlateau = level(sub, 600);
            const aaApparent = (aaPlateau - level(sub, 500)) / Math.max(slope, 1e-9);

            const aaRaw = (level(raw, 600) - level(raw, 500)) / Math.max(slope, 1e-9);

            out.ch.push({
                d: x.ch.d, raw: raw, sen: sen, sub: sub, hasSentinel: !!sentinelInfo, sentinel: sentinelInfo ? sentinelInfo.ch.d : null,
                slope: slope, lod: lod, sigma: sigma, aaApparent: aaApparent, aaRaw: aaRaw, tau: 3 + 20 * x.it.coats.filter(function (c) { return c.ph.enzyme; }).reduce(function (s, c) { return s + c.t; }, 0),
                sGlu: x.sGlu, act: x.it.enzyme
            });
        });

        out.steps = steps;
        out.tAA = tAA;
        out.nEnz = enz.length;
        out.nBare = bare.length;

        return out;
    }


    /* ------------------------------------------------
       TEST: RECORDING SPIKES
    ------------------------------------------------ */

    function scarMicrons(dev, weeks) {

        const s = dev.sub;

        if (!s) { return 20 * (1 - Math.exp(-weeks / 2)); }

        const stiff = Math.max(0.1, 0.35 + 0.15 * Math.log10(Math.max(s.E, 0.01)));
        const size = Math.sqrt(Math.max(s.area, 100) / 2000);

        return (8 + 45 * stiff * Math.sqrt(size)) * (1 - Math.exp(-weeks / 2.2));
    }

    function spikeAmp(d) { return 400 / (1 + d / 12); }                       // peak-to-peak microvolts at distance d (um)

    function recording(dev, opts) {

        const out = { ch: [], ok: working(dev), scar: scarMicrons(dev, opts.weeks), tr: null };

        if (!out.ok) { return out; }

        const rand = rngFor(dev, 71);
        const chans = okChans(dev);

        if (!chans.length) { return out; }

        const fs = 10000;
        const nS = 5000;                                                         // 0.5 s

        // Three neurons, each at the chosen distance from a randomly picked site (plus the scar between).
        const dEff = opts.dist + out.scar;

        const neurons = [];

        for (let k = 0; k < 3; k++) {

            const host = chans[Math.floor(rand() * chans.length)];
            const phi = rand() * 2 * Math.PI;
            const cth = rand() * 2 - 1;
            const sth = Math.sqrt(1 - cth * cth);

            neurons.push({
                x: host.cx + dEff * sth * Math.cos(phi), y: host.cy + dEff * sth * Math.sin(phi), z: dEff * cth,
                rate: 12 + 20 * rand(), times: []
            });
        }

        // Spike times (Poisson with a 2 ms dead time).
        neurons.forEach(function (nr) {

            let t = rand() / nr.rate;

            while (t < nS / fs) {

                nr.times.push(t);
                t += 0.002 + -Math.log(1 - rand()) / nr.rate;
            }
        });

        const shape = function (dt) {

            const a = Math.exp(-Math.pow(dt / 0.00014, 2) / 2);
            const b = Math.exp(-Math.pow((dt - 0.00032) / 0.00032, 2) / 2);

            return -(a - 0.35 * b);
        };

        const hAmp = function (ch, f) {

            // Divider between the source (trace plus electrode) and the amplifier input.
            const z = zChannel(dev, ch, f, "pbs", 0, RHO_TISSUE);
            const w = 2 * Math.PI * f;
            const cin = C_AMP + ch.cPar;
            const yRe = 1 / R_AMP;
            const yIm = w * cin;
            const den = yRe * yRe + yIm * yIm;
            const zinRe = yRe / den;
            const zinIm = -yIm / den;

            const sRe = zinRe + z.re;
            const sIm = zinIm + z.im;

            return Math.hypot(zinRe, zinIm) / Math.hypot(sRe, sIm);
        };

        // Thermal noise of the electrode in tissue, integrated over the spike band.
        const fBand = logspace(Math.log10(300), Math.log10(6000), 24);

        const results = chans.map(function (ch) {

            let vn2 = 0;

            fBand.forEach(function (f, k) {

                const z = zChannel(dev, ch, f, "pbs", 0, RHO_TISSUE);
                const df = k < fBand.length - 1 ? fBand[k + 1] - f : f - fBand[k - 1];

                vn2 += 4 * KB * T * Math.max(z.re, 0) * df;
            });

            const vTh = Math.sqrt(vn2) * 1e6;                                                // uV rms
            const vTotal = Math.sqrt(vTh * vTh + 3 * 3 + 9 * 9);

            const atten = hAmp(ch, 1500);

            // Amplitude of each neuron at this site: distance and averaging over a large site.
            const amps = neurons.map(function (nr) {

                const dx = nr.x - ch.cx;
                const dy = nr.y - ch.cy;
                const d = Math.sqrt(dx * dx + dy * dy + nr.z * nr.z);
                const avg = 1 / (1 + Math.pow(ch.rEq / (d + 10), 2));

                return spikeAmp(d) * avg * atten;
            });

            return { ch: ch, vTh: vTh, vTotal: vTotal, atten: atten, amps: amps };
        });

        // Crosstalk adds a fraction of the neighbours' spikes.
        const xt = {};

        results.forEach(function (r) {

            xt[r.ch.d] = {};

            Object.keys(r.ch.xt || {}).forEach(function (o) { xt[r.ch.d][o] = r.ch.xt[o] / (r.ch.xt[o] + C_AMP + r.ch.cPar); });
        });

        // Build the traces and detect spikes with a 4.5 sigma threshold.
        const trace = {};

        results.forEach(function (r) {

            const x = new Float32Array(nS);

            for (let s = 0; s < nS; s++) { x[s] = r.vTotal * gaussFrom(rand); }

            neurons.forEach(function (nr, k) {

                nr.times.forEach(function (t0) {

                    const i0 = Math.floor(t0 * fs);

                    for (let q = 0; q < 24; q++) {

                        const i = i0 + q;

                        if (i < nS) { x[i] += r.amps[k] / 1.35 * shape(q / fs - 0.0002); }
                    }
                });
            });

            trace[r.ch.d] = x;
        });

        // Crosstalk copies.
        results.forEach(function (r) {

            const x = trace[r.ch.d];
            const frac = xt[r.ch.d];

            Object.keys(frac).forEach(function (o) {

                const y = trace[o];

                if (!y || frac[o] < 1e-4) { return; }

                const other = results.filter(function (z) { return z.ch.d === o; })[0];

                neurons.forEach(function (nr, k) {

                    nr.times.forEach(function (t0) {

                        const i0 = Math.floor(t0 * fs);

                        for (let q = 0; q < 24; q++) {

                            const i = i0 + q;

                            if (i < nS) { x[i] += other.amps[k] / 1.35 * shape(q / fs - 0.0002) * frac[o]; }
                        }
                    });
                });
            });
        });

        results.forEach(function (r) {

            const x = trace[r.ch.d];

            // Robust noise estimate and 4.5 sigma threshold.
            const abs = Array.prototype.map.call(x, Math.abs).sort(function (a, b) { return a - b; });
            const sig = abs[Math.floor(abs.length / 2)] / 0.6745;
            const thr = 4.5 * sig;

            const det = [];
            let last = -100;

            for (let s = 0; s < nS; s++) {

                if (x[s] < -thr && s - last > 12) { det.push(s); last = s; }
            }

            // True spikes that belong to a neuron this channel can see at all.
            const trueTimes = [];

            neurons.forEach(function (nr, k) { if (r.amps[k] / 1.35 > thr) { nr.times.forEach(function (t0) { trueTimes.push(Math.floor(t0 * fs) + 2); }); } });

            let hits = 0;

            trueTimes.forEach(function (tt) { if (det.some(function (d) { return Math.abs(d - tt) <= 8; })) { hits += 1; } });

            const falsePos = det.filter(function (d) { return !trueTimes.some(function (tt) { return Math.abs(d - tt) <= 8; }); }).length;

            const best = Math.max.apply(null, r.amps);

            r.sigma = sig;
            r.thr = thr;
            r.det = det;
            r.sensitivity = trueTimes.length ? hits / trueTimes.length : NaN;
            r.falsePos = falsePos / (nS / fs);
            r.best = best;
            r.snr = best / (2 * Math.max(sig, 1e-9));
            r.nTrue = trueTimes.length;
        });

        // Keep the trace of the channel with the best signal to noise ratio, down-sampled to the sampling rate for the plot.
        let bestR = results[0];

        results.forEach(function (r) { if (r.snr > bestR.snr) { bestR = r; } });

        const show = [];
        const timeAxis = [];

        for (let s = 0; s < 2000; s += 1) { show.push(trace[bestR.ch.d][s]); timeAxis.push(s / fs * 1000); }

        out.tr = { t: timeAxis, v: show, d: bestR.ch.d, det: bestR.det.filter(function (s) { return s < 2000; }).map(function (s) { return s / fs * 1000; }), thr: bestR.thr };
        out.ch = results.map(function (r) {

            return {
                d: r.ch.d, vTh: r.vTh, vTotal: r.vTotal, atten: r.atten, best: r.best, snr: r.snr, sigma: r.sigma, sens: r.sensitivity, falsePos: r.falsePos,
                z1k: zMag(zChannel(dev, r.ch, 1000, "pbs", 0, RHO_TISSUE)), rEq: r.ch.rEq
            };
        });

        out.dist = dEff;
        out.nNeurons = neurons.length;

        return out;
    }


    /* ------------------------------------------------
       TEST: A MONTH IN WARM SALINE
    ------------------------------------------------ */

    function soak(dev, opts) {

        const out = { days: [], ch: [], ok: working(dev) };

        if (!out.ok) { return out; }

        for (let d = 0; d <= 28; d += 1) { out.days.push(d); }

        okChans(dev).forEach(function (ch) {

            const rand = rngFor(dev, 91 + Number(ch.d));

            // Insulation failure: water gets under the film and it lifts, exposing the trace.
            const ins = dev.ins;
            let tIns = Infinity;

            if (ins) {

                const hz = Math.max(1e-4, 0.006 * (1.4 - Math.min(ins.adhesion, 1) * Math.min(ins.quality, 1)) / Math.sqrt(Math.max(ins.t, 0.2)) * (1 + 4 * ch.pPin));

                tIns = -Math.log(1 - rand()) / hz;
            }

            // Corrosion of a base metal at a pinhole.
            const corrodes = mc(ch.metal).corr > 0.5 && rand() < Math.max(0.3, ch.pPin * 20 + 0.4);
            const tCorr = corrodes ? 2 + 15 * rand() : Infinity;

            const z = [];
            const z0 = zMag(zChannel(dev, ch, 1000, "pbs", 0));

            let state = "ok";
            let firstFail = null;

            out.days.forEach(function (d) {

                let zi = zMag(zChannel(dev, ch, 1000, "pbs", d));

                if (d >= tIns) {

                    // The exposed trace adds a large area in parallel: the impedance falls and the noise grows.
                    zi = zi / (1 + 3 * (d - tIns + 1) / 3);
                    if (state === "ok") { state = "insulation lifted"; firstFail = d; }
                }

                if (d >= tCorr) {

                    zi = zi * 30;
                    if (state === "ok") { state = "trace corroded open"; firstFail = d; }
                }

                zi *= 1 + 0.03 * gaussFrom(rand);

                z.push(zi);
            });

            const coats = coatsOf(dev, ch, 28);
            const lost = coats.filter(function (c) { return c.alive < 0.5 && !c.ph.enzyme; }).length;

            if (lost && state === "ok") {

                state = "coating peeled";

                for (let d = 0; d <= 28; d++) { if (coatsOf(dev, ch, d).some(function (c) { return c.alive < 0.5 && !c.ph.enzyme; })) { firstFail = d; break; } }
            }

            const zEnd = z[z.length - 1];
            const alive = zEnd > 0.3 * z0 && zEnd < 4 * z0 && state !== "trace corroded open";

            out.ch.push({ d: ch.d, z: z, z0: z0, zEnd: zEnd, state: state, firstFail: firstFail, alive: alive });
        });

        out.yield = out.ch.length ? out.ch.filter(function (c) { return c.alive; }).length / out.ch.length : 0;

        return out;
    }


    /* ------------------------------------------------
       TEST: PUSHING THE PROBE INTO TISSUE
    ------------------------------------------------ */

    function insertion(dev) {

        const s = dev.sub;
        const out = { ok: working(dev), sub: s };

        if (!out.ok || !s) { out.noBody = !s; return out; }

        const E = s.E * 1e9;                                                // Pa
        const w = s.w * 1e-6;
        const t = s.t * 1e-6;
        const L = s.L * 1e-6;

        const I = w * t * t * t / 12;
        const EI = E * I;

        // Pinned at the tissue surface and clamped at the holder: effective length factor about 0.7 to 2.
        const pcr = Math.PI * Math.PI * EI / Math.pow(1.0 * L, 2);

        // Force to puncture the surface of the brain grows with the tip's cross-section.
        const aTip = Math.max(s.tipW, 5) * 1e-6 * t;
        const fIns = 5e5 * aTip + 3e-5;                                         // newtons

        const lens = logspace(Math.log10(0.5), Math.log10(30), 30);

        out.curve = { L: lens, p: lens.map(function (mm) { return Math.PI * Math.PI * EI / Math.pow(mm * 1e-3, 2) * 1000; }) };

        out.pcr = pcr * 1000;                                                   // mN
        out.fIns = fIns * 1000;                                                 // mN
        out.margin = pcr / fIns;
        out.buckles = pcr < fIns;
        out.EI = EI;
        out.cross = s.w * s.t;                                                  // um2
        out.mismatch = s.E / 3e-6;                                              // brain is about 3 kPa
        out.L = s.L;

        const weeks = [];
        const scar = [];

        for (let k = 0; k <= 16; k++) { weeks.push(k * 0.5); scar.push(scarMicrons(dev, k * 0.5)); }

        out.scar = { w: weeks, t: scar };
        out.scar8 = scarMicrons(dev, 8);

        return out;
    }


    root.LabNeural = {

        METAL: METAL, COAT: COAT, SOLUTIONS: SOLUTIONS, RHO_TISSUE: RHO_TISSUE,
        working: working, okChans: okChans, interface_: interface_, zChannel: zChannel, zMag: zMag, rSpread: rSpread,
        check: check, eis: eis, cv: cv, dopamine: dopamine, glutamate: glutamate, recording: recording, soak: soak, insertion: insertion,
        daSens: daSens, scarMicrons: scarMicrons, spikeAmp: spikeAmp, coatsOf: coatsOf
    };

    if (typeof module !== "undefined" && module.exports) { module.exports = root.LabNeural; }

}(typeof window !== "undefined" ? window : globalThis));
