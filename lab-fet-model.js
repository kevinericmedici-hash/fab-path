/* ========================================
   FET / BIOFET COMPACT MODEL

   Pure functions that turn a fabricated device (from lab-fet-engine.js)
   into measurements: transfer and output curves, parameter extraction,
   solution-gated sensing with Debye screening, bias stress, and a redox
   voltammogram on the exposed metal.

   Teaching-grade physics: right trends and trade-offs, not predictions.
   Lives on window.LabFET. No DOM, so it also runs in Node.
======================================== */

(function (root) {

    "use strict";

    const G = root.LabGeom || require("./lab-geometry.js");
    const SC = root.SCLab || require("./supercap-lab-model.js");

    const Q = 1.602e-19;
    const PHI_T = 0.02585;
    const EPS0 = 8.854e-12;
    const EPS_W = 78;
    const C_STERN = 0.2;                          // F/m2


    /* ------------------------------------------------
       SOLUTIONS AND SENSING CATALOG
    ------------------------------------------------ */

    const SOLUTIONS = {

        pbs001: { name: "0.01× PBS (1.5 mM salt)", I: 0.0015, ph: 7.4, redox: false, blurb: "Very dilute buffer: the Debye length is long (about 8 nm), so charged biomolecules are felt." },
        pbs01: { name: "0.1× PBS (15 mM salt)", I: 0.015, ph: 7.4, redox: false, blurb: "Diluted buffer: a compromise between sensing range and a stable biological environment." },
        pbs: { name: "1× PBS (150 mM salt)", I: 0.15, ph: 7.4, redox: false, blurb: "Physiological buffer. The Debye length is under 1 nm, so most proteins are screened out." },
        ferro: { name: "5 mM ferri/ferrocyanide in 1× PBS", I: 0.17, ph: 7.4, redox: true, blurb: "PBS with the [Fe(CN)₆]³⁻/⁴⁻ redox couple, a standard probe of exposed metal and of solution potential." }
    };

    const RECEPTORS = {

        none: { name: "No receptor (bare surface)", height: 0, gamma: 0, blurb: "Only non-specific effects and pH." },
        antibody: { name: "Antibody (about 8 nm tall)", height: 8, gamma: 3e15, blurb: "Binds a protein target tightly, but sits far from the surface." },
        aptamer: { name: "DNA aptamer (about 3 nm tall)", height: 3, gamma: 1e16, blurb: "Short and dense: sits close to the surface, so it is less screened." }
    };

    const ANALYTES = {

        ph: { name: "pH", unit: "pH", log: false, lo: 4, hi: 10, steps: 13, blurb: "Surface hydroxyl groups respond to pH. No receptor needed." },
        proteinPos: { name: "Positively charged protein (z = +6)", unit: "M", log: true, lo: 1e-12, hi: 1e-6, steps: 13, z: 6, kd: 1e-9, receptor: "antibody", blurb: "Needs an antibody receptor. Binding adds positive charge near the channel." },
        proteinNeg: { name: "Negatively charged protein (z = −8)", unit: "M", log: true, lo: 1e-12, hi: 1e-6, steps: 13, z: -8, kd: 3e-9, receptor: "antibody", blurb: "Needs an antibody receptor. Binding adds negative charge near the channel." },
        dna: { name: "DNA target (z = −20)", unit: "M", log: true, lo: 1e-13, hi: 1e-6, steps: 14, z: -20, kd: 1e-8, receptor: "aptamer", blurb: "Needs a complementary DNA aptamer. A strongly charged target." },
        redox: { name: "Redox ratio [ox]/[red]", unit: "ratio", log: true, lo: 0.01, hi: 100, steps: 13, blurb: "Needs the ferri/ferrocyanide solution. The solution potential follows the Nernst equation." }
    };

    const GATE_MODES = {

        liquid: { name: "Liquid gate (reference electrode in the solution)" },
        solid: { name: "Solid gate (dry, through the gate dielectric)" }
    };


    function debyeNm(I) { return 0.304 / Math.sqrt(I); }

    // Series of the Stern layer and the diffuse layer.
    function cdl(sol) {

        const lam = debyeNm(sol.I) * 1e-9;
        const cDiff = EPS0 * EPS_W / lam;

        return 1 / (1 / C_STERN + 1 / cDiff);
    }


    function softplus(x) { return x > 30 ? x : Math.log(1 + Math.exp(x)); }


    /* ------------------------------------------------
       GATE CONTEXT AND CONDUCTANCE TABLES
    ------------------------------------------------ */

    const RHOS = [1e-3, 1e-2, 0.1, 1, 10, 100, 1e3, 1e4, 1e5];

    function unitU(dev, x) {

        const off = 1e-3;

        return dev.type === "ambi" ? Math.sqrt(off * off + x * x) : off + x;
    }


    function makeTable(dev, f) {

        const g = dev.grid;
        const n = g.w * g.h;

        // Uniform gating over the whole channel: the answer is analytic.
        let wsum = 0;
        let fmin = Infinity;
        let fmax = 0;

        for (let c = 0; c < n; c++) {

            if (g.chan[c] <= 0.05) { continue; }

            wsum += g.chan[c];

            if (f[c] < fmin) { fmin = f[c]; }
            if (f[c] > fmax) { fmax = f[c]; }
        }

        if (wsum > 0 && fmin >= 0.97 && fmax <= 1.03) {

            return { fn: function (rho) { return dev.gAllSq * unitU(dev, rho); }, uniform: true };
        }

        const build = function (rho, allOne) {

            const arr = new Float32Array(n);

            for (let c = 0; c < n; c++) {

                if (g.S[c] || g.D[c] || g.chan[c] <= 0) { continue; }

                const fc = f[c];
                const gate = allOne ? 1 : (1 - fc) + fc * unitU(dev, rho);

                arr[c] = g.chan[c] * gate;
            }

            return arr;
        };

        const base = G.solveTwoTerminal(build(0, true), g.S, g.D, g.w, g.h);

        const scale = base.connected && base.G > 0 ? dev.gAllSq / base.G : 1;

        const pts = [];

        pts.push([0, G.solveTwoTerminal(build(0, false), g.S, g.D, g.w, g.h).G * scale]);

        RHOS.forEach(function (rho) {

            pts.push([rho, G.solveTwoTerminal(build(rho, false), g.S, g.D, g.w, g.h).G * scale]);
        });

        const fn = function (rho) {

            if (rho <= 0) { return pts[0][1]; }

            if (rho < RHOS[0]) { return pts[0][1] + (pts[1][1] - pts[0][1]) * rho / RHOS[0]; }

            if (rho >= RHOS[RHOS.length - 1]) {

                const a = pts[pts.length - 2];
                const b = pts[pts.length - 1];

                const slope = Math.max(0, Math.min(1, Math.log(Math.max(b[1], 1e-30) / Math.max(a[1], 1e-30)) / Math.log(b[0] / a[0])));

                return b[1] * Math.pow(rho / b[0], slope);
            }

            for (let k = 1; k < pts.length - 1; k++) {

                if (rho <= pts[k + 1][0]) {

                    const a = pts[k];
                    const b = pts[k + 1];
                    const t = Math.log(rho / a[0]) / Math.log(b[0] / a[0]);

                    return Math.exp(Math.log(Math.max(a[1], 1e-30)) * (1 - t) + Math.log(Math.max(b[1], 1e-30)) * t);
                }
            }

            return pts[pts.length - 1][1];
        };

        return { fn: fn, uniform: false };
    }


    // Everything a measurement needs for one device in one gating mode.
    function context(dev, mode, solKey) {

        const key = mode + ":" + (solKey || "");

        dev._ctx = dev._ctx || {};

        if (dev._ctx[key]) { return dev._ctx[key]; }

        let cgRef;
        let f;
        let vt = dev.vt;
        const g = dev.grid;
        const n = g.w * g.h;

        f = new Float32Array(n);

        if (mode === "liquid") {

            const sol = SOLUTIONS[solKey] || SOLUTIONS.pbs;

            cgRef = cdl(sol);

            for (let c = 0; c < n; c++) {

                if (g.chan[c] <= 0) { continue; }

                const top = g.top[c];                                    // um of t/eps over the channel
                const cg = 1 / (top * 1e-6 / EPS0 + 1 / cgRef);

                f[c] = Math.min(1, g.exposed[c] * cg / cgRef);
            }

            // More gate capacitance means a smaller threshold: the oxide fixed charge matters less.
            vt = dev.vt * 0.3;

        } else {

            cgRef = dev.cox > 0 ? dev.cox : 1e-6;

            for (let c = 0; c < n; c++) { f[c] = g.chan[c] > 0 ? Math.min(1, g.gate[c]) : 0; }
        }

        const cIt = Q * dev.dit * 1e4;

        const out = {
            mode: mode, sol: SOLUTIONS[solKey] || null, cg: cgRef, vt: vt,
            nss: 1 + cIt / cgRef, tab: makeTable(dev, f), key: key
        };

        dev._ctx[key] = out;

        return out;
    }


    /* ------------------------------------------------
       DRAIN CURRENT
    ------------------------------------------------ */

    function channelId(dev, c, vg, vd) {

        const sd = vd >= 0 ? 1 : -1;
        const vda = Math.abs(vd);

        let vgd;

        if (dev.type === "n") { vgd = vg - c.vt; }
        else if (dev.type === "p") { vgd = c.vt - vg; }
        else { vgd = Math.abs(vg - c.vt); }

        const nphi = c.nss * PHI_T;

        const vov = dev.type === "ambi" ? Math.abs(vgd) : nphi * softplus(vgd / nphi);

        const muEff = dev.mu0 * 1e-4 / (1 + 0.1 * vov);

        const rho = muEff * c.cg * vov / dev.gu;

        const gch = dev.gu * c.tab.fn(rho);

        const vsat = Math.max(vov, 4 * PHI_T);
        const lam = 0.02 * Math.min(2, 5 / Math.max(dev.L, 0.5));

        return sd * gch * (vsat / 2) * Math.tanh(2 * vda / vsat) * (1 + lam * vda);
    }


    // Drain current including source and drain series resistance.
    function id(dev, c, vg, vd) {

        const sd = vd >= 0 ? 1 : -1;

        let cur = 0;

        for (let it = 0; it < 30; it++) {

            const vgInt = vg - cur * dev.rs;
            const vdRaw = vd - cur * (dev.rs + dev.rd);
            const vdInt = sd > 0 ? Math.max(vdRaw, 0) : Math.min(vdRaw, 0);

            const next = channelId(dev, c, vgInt, vdInt);

            cur = cur + 0.6 * (next - cur);
        }

        return cur;
    }


    // Gate current (A).
    function gateCurrent(dev, mode, vg, sol) {

        if (!dev.hasGate && mode === "solid") { return 0; }

        if (mode === "liquid") {

            // Background and redox current at the exposed metal and channel.
            const area = (dev.aMetalExposed + dev.exposedArea * 0.2) * 1e-8;                // cm2
            const jBg = 5e-9 * Math.sign(vg) * (1 + Math.abs(vg));

            let j = jBg;

            if (sol && sol.redox) { j += 3e-4 * (1 / (1 + Math.exp(-(vg - 0.2) / 0.03)) - 0.5); }

            return area * j;
        }

        const area = dev.aGate * 1e-8;
        const tOx = Math.max(dev.tOx, 1e-4);
        const field = Math.abs(vg) / (tOx * 100);                                           // MV/cm

        let ig = area * 1e-9 * Math.exp(Math.min(field, 20) / 0.6) * Math.sign(vg);

        if (dev.gateShort) { ig += vg / (dev.gateDirect ? 5e3 : 2e5); }

        if (dev.vbd > 0 && Math.abs(vg) > dev.vbd) { ig = Math.sign(vg) * Math.max(Math.abs(ig), 1e-3); }

        return ig;
    }


    function rngFor(dev, tag) { return SC.rng((dev.seed * 2654435761 + tag) >>> 0); }

    function gaussFrom(rand) {

        let u = 0;
        let v = 0;

        while (u === 0) { u = rand(); }
        while (v === 0) { v = rand(); }

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }


    /* ------------------------------------------------
       TEST: TRANSFER CURVE
       opts: { mode, sol, vd, vMin, vMax }
    ------------------------------------------------ */

    function transfer(dev, opts) {

        const n = 81;
        const mode = opts.mode === "liquid" ? "liquid" : "solid";
        const sol = SOLUTIONS[opts.sol] || SOLUTIONS.pbs;

        const noise = rngFor(dev, 7);

        const vg = [];
        const fwd = [];
        const bwd = [];
        const ig = [];

        const failed = dev.status !== "ok";

        let c = null;

        if (!failed) { c = context(dev, mode, opts.sol); }

        // Hysteresis from slow traps (and ion drift in liquid).
        const dVh = c ? (Q * 0.15 * dev.dit * 1e4 / c.cg + (mode === "liquid" ? 0.02 : 0)) : 0;

        const sweepN = function (v, dir) {

            if (failed) {

                if (dev.status === "short") { return opts.vd / dev.rShort * (1 + 0.003 * gaussFrom(noise)); }

                return 1e-13 * (1 + 0.5 * gaussFrom(noise));
            }

            const saved = c.vt;

            c.vt = saved + dir * dVh / 2;

            const i = id(dev, c, v, opts.vd);

            c.vt = saved;

            return i * (1 + 0.01 * gaussFrom(noise)) + 2e-14 * gaussFrom(noise);
        };

        for (let k = 0; k < n; k++) {

            const v = opts.vMin + (opts.vMax - opts.vMin) * k / (n - 1);

            vg.push(v);
            fwd.push(sweepN(v, +1));
            bwd.push(sweepN(v, -1));
            ig.push(failed && dev.status === "lost" ? 1e-13 : gateCurrent(dev, mode, v, c ? c.sol : null) * (1 + 0.02 * gaussFrom(noise)) + 1e-14 * gaussFrom(noise));
        }

        return { vg: vg, idF: fwd, idB: bwd, ig: ig, vd: opts.vd, mode: mode, sol: sol, ctx: c, extract: extract(dev, vg, fwd, opts.vd, c) };
    }


    // Read the parameters off the curve like a lab would.
    function extract(dev, vg, idc, vd, c) {

        const out = { vt: NaN, mu: NaN, ss: NaN, onoff: NaN, ion: NaN, ioff: NaN, gm: NaN };

        if (dev.status !== "ok" || !c) { return out; }

        const a = idc.map(Math.abs);

        let imax = 0;
        let imin = Infinity;

        a.forEach(function (v) { if (v > imax) { imax = v; } if (v < imin && v > 0) { imin = v; } });

        out.ion = imax;
        out.ioff = imin;
        out.onoff = imin > 0 ? imax / imin : NaN;

        // Peak transconductance and a linear extrapolation to threshold.
        let gmax = 0;
        let kg = -1;

        for (let k = 1; k < vg.length - 1; k++) {

            const gm = Math.abs((idc[k + 1] - idc[k - 1]) / (vg[k + 1] - vg[k - 1]));

            if (gm > gmax) { gmax = gm; kg = k; }
        }

        if (kg > 0 && gmax > 0) {

            out.gm = gmax;

            out.vt = vg[kg] - idc[kg] / ((idc[kg + 1] - idc[kg - 1]) / (vg[kg + 1] - vg[kg - 1]));

            // Field-effect mobility from the drawn geometry (what a student would use).
            const wl = dev.gAllSq;

            out.mu = gmax * 1 / (wl * c.cg * Math.abs(vd)) * 1e4;
        }

        // Subthreshold swing: the steepest rise of log10(I).
        let best = Infinity;

        for (let k = 1; k < vg.length - 1; k++) {

            const i0 = Math.abs(idc[k - 1]);
            const i1 = Math.abs(idc[k + 1]);

            if (i0 <= 0 || i1 <= 0) { continue; }

            const lo = Math.min(i0, i1);
            const hi = Math.max(i0, i1);

            if (hi <= lo * 1.0001) { continue; }
            if (Math.abs(idc[k]) > 0.1 * imax) { continue; }

            const ss = Math.abs(vg[k + 1] - vg[k - 1]) / Math.log10(hi / lo);

            if (ss < best && ss > 0.01) { best = ss; }
        }

        out.ss = isFinite(best) ? best * 1000 : NaN;              // mV/dec

        return out;
    }


    /* ------------------------------------------------
       TEST: OUTPUT CURVES
       opts: { mode, sol, vdMax, vgs: [..] }
    ------------------------------------------------ */

    function output(dev, opts) {

        const mode = opts.mode === "liquid" ? "liquid" : "solid";
        const failed = dev.status !== "ok";
        const c = failed ? null : context(dev, mode, opts.sol);
        const noise = rngFor(dev, 13);

        const n = 61;
        const vd = [];

        for (let k = 0; k < n; k++) { vd.push(opts.vdMax * k / (n - 1)); }

        const sgn = dev.type === "p" ? -1 : 1;

        const curves = opts.vgs.map(function (vg) {

            const ys = vd.map(function (v) {

                if (failed) { return dev.status === "short" ? sgn * v / dev.rShort : 1e-13 * gaussFrom(noise); }

                return id(dev, c, vg, sgn * v) * (1 + 0.01 * gaussFrom(noise)) + 2e-14 * gaussFrom(noise);
            });

            return { vg: vg, id: ys };
        });

        return { vd: vd, curves: curves, mode: mode, sign: sgn };
    }


    /* ------------------------------------------------
       TEST: SENSING
       opts: { analyte, sol, vgBias }
       Returns the shift of the transfer curve for each concentration.
    ------------------------------------------------ */

    function sense(dev, opts) {

        const an = ANALYTES[opts.analyte] || ANALYTES.ph;
        const sol = SOLUTIONS[opts.sol] || SOLUTIONS.pbs;
        const rec = RECEPTORS[dev.receptor] || RECEPTORS.none;
        const noise = rngFor(dev, 29);

        const out = { x: [], dvt: [], ratio: [], sigmaMv: 0, notes: [], an: an, sol: sol, valid: dev.status === "ok" };

        const xs = [];

        for (let k = 0; k < an.steps; k++) {

            const t = k / (an.steps - 1);

            xs.push(an.log ? an.lo * Math.pow(an.hi / an.lo, t) : an.lo + (an.hi - an.lo) * t);
        }

        const lam = debyeNm(sol.I);
        const cd = cdl(sol);

        // Is the channel actually open to the solution?
        const exposed = dev.exposedFrac;

        const w = Math.max(dev.W, 1);
        const l = Math.max(dev.L, 0.5);

        // Noise from traps scales like 1 / sqrt(area); drift adds a floor in unstable channels.
        const sigma = dev.noiseA / Math.sqrt(w * l) * (1 + 1.5 * (1 - dev.water)) + 0.15;

        out.sigmaMv = sigma;

        if (dev.status !== "ok") {

            out.notes.push("This device does not work, so there is nothing to measure.");

            xs.forEach(function (x) { out.x.push(x); out.dvt.push(gaussFrom(noise) * 0.3); out.ratio.push(0); });

            return out;
        }

        if (exposed < 0.05) { out.notes.push("The channel is covered (by passivation or metal), so the solution cannot reach it. Open a sensing window in the layout."); }

        if (an.id === "redox" || opts.analyte === "redox") {

            if (!sol.redox) { out.notes.push("The redox ratio needs the ferri/ferrocyanide solution."); }
        }

        if (an.receptor && dev.receptor !== an.receptor) {

            out.notes.push("This target needs a " + RECEPTORS[an.receptor].name.toLowerCase() + ". Without it only a small non-specific signal appears.");
        }

        const screen = rec.height ? Math.exp(-rec.height / lam) : 1;

        const matched = an.receptor && dev.receptor === an.receptor;

        xs.forEach(function (x) {

            let dv = 0;                                    // threshold shift, volts

            if (opts.analyte === "ph") {

                dv = 0.0592 * dev.beta * (x - 7.4);

            } else if (opts.analyte === "redox") {

                dv = sol.redox ? -0.9 * 0.0592 * Math.log10(x) : 0;

            } else {

                const gMax = matched ? rec.gamma * 0.6 : rec.gamma * 0.01;
                const gam = gMax * x / (an.kd + x);

                dv = -(Q * an.z * gam / cd) * (matched ? screen : 1);
            }

            dv *= exposed >= 0.05 ? Math.min(1, 0.4 + exposed) : 0;

            // Measured value includes noise.
            const meas = dv + sigma * 1e-3 * gaussFrom(noise);

            out.x.push(x);
            out.dvt.push(meas * 1000);
            out.ratio.push(0);
        });

        // Sensitivity: the steepest change per decade (or per pH unit).
        let best = 0;

        for (let k = 1; k < out.x.length; k++) {

            const dx = an.log ? Math.log10(out.x[k] / out.x[k - 1]) : out.x[k] - out.x[k - 1];

            const s = Math.abs(out.dvt[k] - out.dvt[k - 1]) / dx;

            if (s > best) { best = s; }
        }

        out.sensitivity = best;                                    // mV per decade (or per pH)

        // Detection limit: the first concentration whose shift beats 3 sigma.
        let lod = null;

        for (let k = 0; k < out.x.length; k++) {

            if (Math.abs(out.dvt[k] - out.dvt[0]) > 3 * sigma && lod === null) { lod = out.x[k]; }
        }

        out.lod = lod;
        out.lam = lam;
        out.cdl = cd;
        out.screen = screen;

        return out;
    }


    /* ------------------------------------------------
       TEST: STABILITY (bias stress or drift in solution)
       opts: { mode, sol, stressV }
    ------------------------------------------------ */

    function stress(dev, opts) {

        const mode = opts.mode === "liquid" ? "liquid" : "solid";
        const failed = dev.status !== "ok";
        const noise = rngFor(dev, 43);

        const t = [];

        for (let k = 0; k <= 30; k++) { t.push(Math.pow(10, k / 30 * 4)); }          // 1 s to 10 ks

        if (failed) { return { t: t, dvt: t.map(function () { return 0; }), mode: mode, valid: false }; }

        const c = context(dev, mode, opts.sol);

        let a;

        if (mode === "liquid") {

            // Ion uptake and surface reactions: the dielectric and channel stability decide the drift.
            const diel = dev.topSurface ? 0.5 : 1;

            a = 8 * (1.3 - 0.9 * dev.water) * diel * (1 + (opts.sol === "ferro" ? 0.3 : 0));

            return {
                t: t, mode: mode, valid: true,
                dvt: t.map(function (ti) { return a * Math.log10(1 + ti / 5) + 0.3 * gaussFrom(noise); })
            };
        }

        // Charge trapping, grows with the stress field and with trap density, saturates with time.
        const field = Math.abs(opts.stressV) / Math.max(dev.tOx * 100, 0.01);                  // MV/cm
        const nSlow = 0.5 * dev.dit * 1e4;
        const dMax = Q * nSlow / c.cg * Math.min(1, field / 2);

        return {
            t: t, mode: mode, valid: true,
            dvt: t.map(function (ti) {

                return 1000 * dMax * (1 - Math.exp(-Math.pow(ti / 800, 0.4))) + 0.3 * gaussFrom(noise);
            })
        };
    }


    /* ------------------------------------------------
       TEST: REDOX VOLTAMMETRY ON THE EXPOSED METAL
       opts: { scan (mV/s), sol }
    ------------------------------------------------ */

    function redoxCV(dev, opts) {

        const sol = SOLUTIONS[opts.sol] || SOLUTIONS.pbs;
        const noise = rngFor(dev, 61);

        const e1 = -0.2;
        const e2 = 0.7;
        const e0 = 0.22;

        const v = opts.scan / 1000;                                  // V/s
        const area = Math.max(dev.aMetalExposed, 0) * 1e-8;          // cm2 (um2 to cm2)

        const dE = 0.001;
        const nStep = Math.round((e2 - e1) / dE);
        const dt = dE / v;

        const D = 7.6e-6;
        const c0 = 5e-6;                                             // mol/cm3
        const dm = 0.45;
        const dx = Math.sqrt(D * dt / dm);

        const total = 2 * nStep * dt;
        const nx = Math.min(Math.ceil(6 * Math.sqrt(D * total) / dx) + 5, 600);

        const cO = new Float64Array(nx).fill(sol.redox ? c0 : 0);
        const cR = new Float64Array(nx).fill(sol.redox ? c0 : 0);

        const F = 96485;
        const f = Q / (1.381e-23 * 298.15);

        const out = { e: [], i: [] };

        const cdlArea = 0.1 * area * 1e-4;                          // F (0.1 F/m2 on the exposed metal; cm2 to m2)

        // Hold at the start potential first, so the initial transient has died away.
        const pre = Math.min(500, Math.ceil(2 / dt));

        for (let step = -pre; step < 2 * nStep; step++) {

            const e = step < 0 ? e1 : (step < nStep ? e1 + step * dE : e2 - (step - nStep) * dE);
            const sgn = step < 0 ? 0 : (step < nStep ? 1 : -1);

            // Diffuse.
            for (let x = 1; x < nx - 1; x++) {

                const dO = cO[x] + dm * (cO[x - 1] - 2 * cO[x] + cO[x + 1]);
                const dR = cR[x] + dm * (cR[x - 1] - 2 * cR[x] + cR[x + 1]);

                cO[x] = dO;
                cR[x] = dR;
            }

            // Surface equilibrium (Nernst) with conserved flux.
            const th = Math.exp(f * (e - e0));
            const sum = cO[1] + cR[1];

            const newR = sum / (1 + th);
            const newO = sum - newR;

            const jO = (cO[1] - newO) / dx;                         // positive when O is consumed at the surface

            cO[0] = newO;
            cR[0] = newR;

            // Oxidation (R to O) is anodic, positive.
            const iF = sol.redox ? -F * area * D * jO : 0;

            const iC = cdlArea * v * sgn;

            const leak = (e - 0.1) * 2e-9 * (area > 0 ? Math.min(1, area / 1e-6) : 0);

            if (step >= 0) {

                out.e.push(e);
                out.i.push(iF + iC + leak + 0.02 * Math.abs(iF) * gaussFrom(noise) * 0.2);
            }
        }

        out.area = area;

        return out;
    }


    /* ------------------------------------------------
       TEST: CONTINUITY
    ------------------------------------------------ */

    function continuity(dev) {

        if (dev.status === "short") { return { rsd: dev.rShort, kind: "short", rg: dev.hasGate ? Infinity : NaN }; }
        if (dev.status === "lost") { return { rsd: Infinity, kind: "open", rg: NaN }; }

        let rsd = Infinity;

        let rg = Infinity;

        if (dev.hasGate || dev.kind === "biofet") {

            const c = context(dev, "solid", "");

            const i = Math.abs(id(dev, c, 0, 0.1));

            rsd = i > 0 ? 0.1 / i : Infinity;

            if (dev.gateShort) { rg = dev.gateDirect ? 5e3 : 2e5; }
        }

        return { rsd: rsd, kind: dev.gateShort ? "gateleak" : "ok", rg: rg };
    }


    root.LabFET = {

        SOLUTIONS: SOLUTIONS, RECEPTORS: RECEPTORS, ANALYTES: ANALYTES, GATE_MODES: GATE_MODES,
        debyeNm: debyeNm, cdl: cdl,
        context: context, id: id, gateCurrent: gateCurrent,
        transfer: transfer, output: output, sense: sense, stress: stress, redoxCV: redoxCV, continuity: continuity,
        extract: extract
    };

    if (typeof module !== "undefined" && module.exports) { module.exports = root.LabFET; }

}(typeof window !== "undefined" ? window : globalThis));
