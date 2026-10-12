/* ========================================
   MEMS DEVICES: PHYSICS AND MEASUREMENTS

   Pure functions of a fabricated MEMS layout ("dev"). The mechanics come
   from lab-mems-solver.js (stiffness, modes, stress); this file adds the
   electrostatics (comb capacitance and force from the real finger
   geometry), air damping, stiction after release, and the tests of the
   three devices:

   accelerometer: modes, sensitivity and range, bandwidth and noise, shock
   gyroscope:     modes and matching, drive, rate response, noise, shock
   micromirror:   tilt against voltage, switching, optics, a display
                  array, and hinge life

   All numbers are rounded textbook-scale approximations for teaching.
   Needs window.SCLab, window.LabGeom, window.LabEngine, LabMemsSolver.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;
    const G = root.LabGeom;
    const E = root.LabEngine;
    const S = root.LabMemsSolver;

    const EPS0 = 8.854e-12;
    const MU0 = 1.81e-5;                   // Pa s, air at 1 atm
    const KB = 1.380649e-23;
    const TEMP = 300;
    const GRAV = 9.81;
    const UM = 1e-6;
    const FRINGE = 1.15;


    function rngFor(dev, tag) { return SC.rng((dev.seed * 2654435761 + tag * 40503) >>> 0); }

    function gaussFrom(rand) {

        let u = 0;
        let v = 0;

        while (u === 0) { u = rand(); }
        while (v === 0) { v = rand(); }

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

    function sigm(x) { return 1 / (1 + Math.exp(-x)); }


    /* ------------------------------------------------
       FRAME AND PIECES
    ------------------------------------------------ */

    function frameOf(dev) {

        if (!dev.mems) { return null; }

        if (!dev.__frame) { Object.defineProperty(dev, "__frame", { value: S.buildFrame(dev, G), enumerable: false, writable: true }); }

        return dev.__frame;
    }

    function layerOf(dev, k) { return dev.mems.layers.filter(function (l) { return l.k === k; })[0]; }

    function piecesOfNet(dev, label) {

        const root0 = dev.mems.nets[label];

        if (root0 === undefined) { return []; }

        return dev.mems.pieces.filter(function (p) { return p.role === "structure" && p.net === root0; });
    }

    // The free cluster that carries net M: the proof mass or the mirror plate.
    function mainNode(dev) {

        const fr = frameOf(dev);

        if (!fr || !fr.ok) { return null; }

        let best = null;

        piecesOfNet(dev, "M").forEach(function (p) {

            const c = fr.pieceCluster[p.id];

            if (!c) { return; }

            const nd = c.node || c;

            if (!nd || nd.fixed || nd.index === undefined || nd.kind !== "cluster") { return; }

            if (!best || nd.mass > best.mass) { best = nd; }
        });

        return best;
    }

    // Every piece that moves rigidly with a node.
    function carried(dev, node) {

        const fr = frameOf(dev);

        return dev.mems.pieces.filter(function (p) {

            if (p.role !== "structure") { return false; }

            const c = fr.pieceCluster[p.id];

            return c && (c.node || c) === node;
        });
    }

    function sumArea(list) { return list.reduce(function (s, p) { return s + p.area; }, 0); }


    /* ------------------------------------------------
       EDGES, CAPACITANCE AND FACING PAIRS
    ------------------------------------------------ */

    function edgesOf(poly) {

        let a = 0;

        for (let i = 0; i < poly.length; i++) { const j = (i + 1) % poly.length; a += poly[i][0] * poly[j][1] - poly[j][0] * poly[i][1]; }

        const ccw = a > 0;
        const out = [];

        for (let i = 0; i < poly.length; i++) {

            const p = poly[i];
            const q = poly[(i + 1) % poly.length];
            const dx = q[0] - p[0];
            const dy = q[1] - p[1];
            const len = Math.hypot(dx, dy);

            if (len < 0.05) { continue; }

            const ux = dx / len;
            const uy = dy / len;

            out.push({ ax: p[0], ay: p[1], ux: ux, uy: uy, len: len, nx: ccw ? uy : -uy, ny: ccw ? -ux : ux });
        }

        return out;
    }

    function moved(poly, xf) {

        if (!xf) { return poly; }

        const c = Math.cos(xf.th || 0);
        const s = Math.sin(xf.th || 0);

        return poly.map(function (q) {

            const x = q[0] - xf.cx;
            const y = q[1] - xf.cy;

            return [xf.cx + x * c - y * s + xf.dx, xf.cy + x * s + y * c + xf.dy];
        });
    }

    function boxOf(poly) {

        let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;

        poly.forEach(function (q) { if (q[0] < x0) { x0 = q[0]; } if (q[0] > x1) { x1 = q[0]; } if (q[1] < y0) { y0 = q[1]; } if (q[1] > y1) { y1 = q[1]; } });

        return { x0: x0, y0: y0, x1: x1, y1: y1 };
    }

    // Prepare a set of pieces for repeated evaluation: edges, boxes, layer, thickness.
    function prep(list, xf) {

        return list.map(function (p) {

            let base = p.poly;

            if (!base && p.p1) { base = G.polysOf({ t: "t", pts: [p.p1, p.p2], w: p.w })[0]; }

            const poly = moved(base || [[p.cx - 0.5, p.cy - 0.5], [p.cx + 0.5, p.cy - 0.5], [p.cx + 0.5, p.cy + 0.5], [p.cx - 0.5, p.cy + 0.5]], xf);

            return { id: p.id, layer: p.layer, t: p.t, poly: poly, box: boxOf(poly), edges: edgesOf(poly) };
        });
    }

    // Pairs of facing, nearly parallel edges between two groups, within gmax micrometres.
    function facing(A, B, gmax) {

        const out = [];

        A.forEach(function (a) {

            B.forEach(function (b) {

                if (a.layer !== b.layer) { return; }

                if (a.box.x1 + gmax < b.box.x0 || b.box.x1 + gmax < a.box.x0 || a.box.y1 + gmax < b.box.y0 || b.box.y1 + gmax < a.box.y0) { return; }

                a.edges.forEach(function (ea) {

                    b.edges.forEach(function (eb) {

                        const cross = ea.ux * eb.uy - ea.uy * eb.ux;

                        if (Math.abs(cross) > 0.05) { return; }
                        if (ea.nx * eb.nx + ea.ny * eb.ny > -0.9) { return; }

                        const dx = eb.ax - ea.ax;
                        const dy = eb.ay - ea.ay;
                        const gap = dx * ea.nx + dy * ea.ny;

                        if (gap < 0.05 || gap > gmax) { return; }

                        const t0 = dx * ea.ux + dy * ea.uy;
                        const t1 = t0 + eb.len * (eb.ux * ea.ux + eb.uy * ea.uy);
                        const lo = Math.max(0, Math.min(t0, t1));
                        const hi = Math.min(ea.len, Math.max(t0, t1));

                        if (hi - lo <= 0.05) { return; }

                        out.push({ len: hi - lo, gap: gap, nx: ea.nx, ny: ea.ny, t: a.t });
                    });
                });
            });
        });

        return out;
    }

    function capOf(pairs) {

        let c = 0;

        pairs.forEach(function (q) { c += EPS0 * (q.t * UM) * (q.len * UM) / (q.gap * UM) * FRINGE; });

        return c;
    }


    /* ------------------------------------------------
       DAMPING
    ------------------------------------------------ */

    const PRESSURES = { atm: 1, mbar100: 0.1, mbar1: 0.001, hv: 1e-5 };

    // Slip correction for gaps of a few micrometres.
    function slip(gUm) {

        const kn = 0.068 / Math.max(gUm, 0.1);

        return 1 / (1 + 9.638 * Math.pow(kn, 1.159));
    }

    function gapUnder(dev, node) {

        const list = carried(dev, node);

        let lowest = null;

        list.forEach(function (p) { const li = layerOf(dev, p.layer); if (!lowest || li.z0 < lowest.z0) { lowest = li; } });

        return lowest ? Math.max(lowest.gapBelow || lowest.z0, 0.3) : 2;
    }

    // Damping coefficient (N s/m) for motion along direction d = [dx, dy]. pairs: the combs facing the moving part.
    function damping(dev, node, d, pairs, prel) {

        const list = carried(dev, node);
        const area = sumArea(list) * 1e-12;
        const g = gapUnder(dev, node);
        const mu = MU0 * prel;

        let b = mu * slip(g) * area / (g * UM);

        pairs.forEach(function (q) {

            const along = Math.abs(q.nx * d[0] + q.ny * d[1]);
            const gm = q.gap * UM;
            const t = q.t * UM;
            const l = q.len * UM;
            const mus = mu * slip(q.gap);

            // Squeeze film for the part of the motion across the gap, Couette shear for the part along it.
            b += mus * l * Math.pow(Math.min(t, l), 3) / Math.pow(gm, 3) * along * along * 0.5;
            b += mus * l * t / gm * (1 - along * along);
        });

        return b;
    }


    /* ------------------------------------------------
       STICTION AFTER RELEASE
    ------------------------------------------------ */

    function stiction(dev) {

        if (dev.__stic) { return dev.__stic; }

        const out = { collapse: false, stuck: false, p: 0, ratio: 0, gamma: 0, kz: 0, gap: 0, area: 0, contact: 0 };
        const fr = frameOf(dev);
        const mn = mainNode(dev);

        Object.defineProperty(dev, "__stic", { value: out, enumerable: false, writable: true });

        if (!fr || !mn) { return out; }

        const dry = (E.memsRelease.DRY[(dev.release || {}).dry]) || E.memsRelease.DRY.ipa;
        const list = carried(dev, mn);
        const g = gapUnder(dev, mn) * UM;
        const A = sumArea(list) * 1e-12;

        // Out-of-plane stiffness of the proof mass or plate on its springs.
        const u = S.solveLoads(fr, { [mn.index]: [0, 0, 1, 0, 0, 0] });
        const kz = u ? 1 / Math.max(Math.abs(u[mn.index * 6 + 2]), 1e-30) : 1e9;

        const dimpleArea = list.reduce(function (s, p) { return s + (p.dimples || 0); }, 0) * 1e-12;
        const contact = dimpleArea > 0 ? dimpleArea : A;

        const Fcap = 2 * dry.gamma * A / g;
        const Fres = kz * g;

        out.gamma = dry.gamma;
        out.kz = kz;
        out.gap = g / UM;
        out.area = A / 1e-12;
        out.contact = contact / 1e-12;
        out.hasDimples = dimpleArea > 0;
        out.collapse = dry.gamma > 0 && Fcap > Fres;
        out.captRatio = Fres > 0 ? Fcap / Fres : 0;

        const W = dry.adhesion * contact;
        const U = 0.5 * kz * g * g;

        out.ratio = U > 0 ? W / U : 0;
        out.p = out.collapse ? sigm(Math.log(Math.max(out.ratio, 1e-12)) / 0.7) : 0.01 * (dry.adhesion > 0.01 ? 1 : 0);

        out.stuck = rngFor(dev, 7)() < out.p;

        return out;
    }

    // Is the device free to work? Gives the reasons if not.
    function usable(dev) {

        const out = { ok: false, reasons: [] };

        if (dev.status !== "ok") { out.reasons.push(dev.reason || "The layout did not print."); return out; }

        const fr = frameOf(dev);

        if (!fr) { out.reasons.push("The layout did not print."); return out; }

        fr.problems.forEach(function (t) { out.reasons.push(t); });

        const mn = mainNode(dev);

        if (!mn) {

            out.reasons.push("The moving part (net M) is not a free, springy piece: it is fixed to the substrate or not connected to any spring.");

            return out;
        }

        const st = stiction(dev);

        if (st.stuck) {

            out.reasons.push("After release the moving part collapsed onto the substrate and stuck (capillary force " + (st.captRatio).toFixed(1) + "× the spring's pull, " + (E.memsRelease.DRY[(dev.release || {}).dry] || {}).name + "). " +
                (st.hasDimples ? "Even the dimples did not free it." : "Add dimples, dry with alcohol or supercritical CO2, or use a water-repellent coating."));

            return out;
        }

        out.ok = out.reasons.length === 0 || true;
        out.problems = out.reasons.slice();
        out.reasons = [];

        return out;
    }

    function working(dev) { return usable(dev).ok; }


    /* ------------------------------------------------
       COMMON: CHECK AND MODES
    ------------------------------------------------ */

    function dirName(ke) {

        const names = ["x translation", "y translation", "z (up and down)", "rocking about x", "rocking about y", "twisting about z"];
        let best = 0;

        ke.forEach(function (v, i) { if (v > ke[best]) { best = i; } });

        return { id: best, name: names[best], share: ke[best] };
    }

    function modeList(dev, count) {

        const fr = frameOf(dev);

        if (!fr || !fr.ok) { return []; }

        return S.modes(fr, count).map(function (m) {

            const d = dirName(m.ke);

            return { f: m.f, ke: m.ke, dir: d.id, name: d.name, share: d.share, eff: m.eff, mtot: m.mtot, phi: m.phi };
        });
    }

    function summary(dev) {

        const fr = frameOf(dev);
        const mn = mainNode(dev);
        const out = { nets: [], mass: mn ? mn.mass : 0, springs: fr ? fr.elems.length : 0, fingers: 0 };

        Object.keys(dev.mems.nets).forEach(function (label) {

            const list = piecesOfNet(dev, label);

            out.nets.push({ label: label, pieces: list.length, area: sumArea(list) });
        });

        out.fingers = dev.mems.pieces.filter(function (p) { return p.type === "beam" && p.role === "structure" && fr && fr.pieceCluster[p.id]; }).length;

        return out;
    }

    function check(dev) {

        const out = { ok: false, problems: [], notes: [] };

        if (!dev.mems) { return out; }

        const u = usable(dev);

        out.ok = u.ok;
        out.problems = (u.problems || []).concat(u.reasons || []);
        out.sum = summary(dev);
        out.stiction = stiction(dev);
        out.shorts = dev.mems.shorts || [];
        out.release = dev.release;
        out.unreleased = dev.mems.pieces.filter(function (p) { return p.role === "structure" && p.unreleased >= 4; }).length;
        out.reach = dev.mems.rEtch;
        out.modes = modeList(dev, 6).map(function (m) { return { f: m.f, name: m.name, share: m.share }; });

        return out;
    }


    /* ------------------------------------------------
       READOUT SETTINGS
    ------------------------------------------------ */

    function pressureOf(p) { return PRESSURES[p] === undefined ? 1 : PRESSURES[p]; }

    function qOf(m, k, b) { return b > 0 ? Math.min(Math.sqrt(m * k) / b, 1e5) : 1e5; }


    /* ------------------------------------------------
       ACCELEROMETER
    ------------------------------------------------ */

    function accelSetup(dev) {

        if (dev.__acc) { return dev.__acc; }

        const fr = frameOf(dev);
        const mn = mainNode(dev);

        const out = { fr: fr, mn: mn, ok: false };

        Object.defineProperty(dev, "__acc", { value: out, enumerable: false, writable: true });

        if (!mn) { return out; }

        const mover = prep(carried(dev, mn).filter(function (p) { return p.net === dev.mems.nets.M; }));
        const A = prep(piecesOfNet(dev, "A").filter(function (p) { const c = fr.pieceCluster[p.id]; return !c || (c.node || c).fixed || (c.node || c) !== mn; }));
        const B = prep(piecesOfNet(dev, "B").filter(function (p) { const c = fr.pieceCluster[p.id]; return !c || (c.node || c).fixed || (c.node || c) !== mn; }));

        out.mover = mover;
        out.A = A;
        out.B = B;
        out.ref = mn.ref;

        // Capacitances for a rigid motion of the mover (micrometres, radians).
        out.caps = function (dx, dy, th) {

            const xf = { dx: dx, dy: dy, th: th || 0, cx: mn.ref[0], cy: mn.ref[1] };
            const pm = mover.map(function (m) { return Object.assign({}, m, { poly: moved(m.poly, xf) }); }).map(function (m) { m.box = boxOf(m.poly); m.edges = edgesOf(m.poly); return m; });

            return { A: capOf(facing(pm, A, 12)), B: capOf(facing(pm, B, 12)) };
        };

        out.pairsA = facing(mover, A, 12);
        out.pairsB = facing(mover, B, 12);
        out.ok = true;

        // The sense axis: the one along which the differential capacitance changes most.
        const d = 0.05;
        const px0 = out.caps(d, 0, 0);
        const px1 = out.caps(-d, 0, 0);
        const py0 = out.caps(0, d, 0);
        const py1 = out.caps(0, -d, 0);

        out.gradX = ((px0.A - px0.B) - (px1.A - px1.B)) / (2 * d * UM);
        out.gradY = ((py0.A - py0.B) - (py1.A - py1.B)) / (2 * d * UM);
        out.axis = Math.abs(out.gradY) >= Math.abs(out.gradX) ? 1 : 0;
        out.grad = out.axis === 1 ? out.gradY : out.gradX;
        out.c0 = out.caps(0, 0, 0);

        // Second derivative of the sum, for electrostatic spring softening.
        const e = 0.1;
        const cm = out.axis === 1 ? out.caps(0, e, 0) : out.caps(e, 0, 0);
        const cn = out.axis === 1 ? out.caps(0, -e, 0) : out.caps(-e, 0, 0);

        out.cpp = ((cm.A + cm.B) - 2 * (out.c0.A + out.c0.B) + (cn.A + cn.B)) / Math.pow(e * UM, 2);

        const gaps = out.pairsA.concat(out.pairsB).map(function (q) { return q.gap; });

        out.minGap = gaps.length ? Math.min.apply(null, gaps) : 2;

        return out;
    }

    function accelResponse(dev, g, axisDir) {

        const a = accelSetup(dev);
        const fr = a.fr;
        const dirs = axisDir === 2 ? [0, 0, 1] : (axisDir === 0 ? [1, 0, 0] : [0, 1, 0]);
        const u = S.accelerate(fr, dirs[0] * GRAV, dirs[1] * GRAV, dirs[2] * GRAV);
        const o = a.mn.index * 6;

        return { dx: u[o] * g / UM, dy: u[o + 1] * g / UM, dz: u[o + 2] * g / UM, th: u[o + 5] * g, u: u };
    }

    const READ = { vex: [0.5, 1, 2.5, 5], cf: [0.05, 0.1, 0.2, 0.5], dcn: [0.02, 0.05, 0.1, 0.3] };

    function accelModes(dev) {

        const out = { ok: usable(dev).ok, problems: usable(dev).problems || [] };

        if (!out.ok) { out.problems = out.problems.concat(usable(dev).reasons || []); return out; }

        const a = accelSetup(dev);

        out.modes = modeList(dev, 8);

        // The sense mode: the one with most of its motion along the sense axis.
        let sense = null;

        out.modes.forEach(function (m) { if (m.dir === a.axis && (!sense || m.share > sense.share)) { sense = m; } });

        out.sense = sense;
        out.axis = a.axis;
        out.mass = a.mn.mass;
        out.c0 = a.c0;
        out.grad = a.grad;

        if (sense) {

            const meff = sense.eff[a.axis];

            out.meff = meff;
            out.k = meff * Math.pow(2 * Math.PI * sense.f, 2);
        }

        return out;
    }

    function accelSensitivity(dev, opts) {

        const base = accelModes(dev);

        if (!base.ok || !base.sense) { return Object.assign({ ok: false }, base); }

        const a = accelSetup(dev);
        const out = { ok: true, problems: base.problems, f0: base.sense.f, k: base.k, meff: base.meff, axis: a.axis, grad: a.grad };

        const rd = { vex: opts.vex, cf: opts.cf, dcn: opts.dcn };
        const unit = accelResponse(dev, 1, a.axis);
        const x1 = (a.axis === 1 ? unit.dy : unit.dx);                       // um per g

        // Spring stiffening for large motion: the beams stretch as they bend.
        const w = (dev.mems.pieces.filter(function (p) { return p.role === "structure" && p.type === "beam"; }).sort(function (p, q) { return q.len - p.len; })[0] || { w: 3 }).w;
        const x0 = 1.2 * w;

        // Electrostatic softening by the sensing voltage.
        const kElec = rd.vex * rd.vex * a.cpp;                                 // N/m, negative stiffness
        const soften = clamp(1 - kElec / out.k, 0.2, 5);

        const gmax = opts.range;
        const gs = [];

        for (let i = -20; i <= 20; i++) { gs.push(gmax * i / 20); }

        out.g = gs;
        out.x = [];
        out.dC = [];
        out.v = [];

        gs.forEach(function (g) {

            let x = x1 * g * soften;

            for (let it = 0; it < 6; it++) { x = x1 * g * soften / (1 + Math.pow(x / x0, 2)); }

            const dx = a.axis === 0 ? x : 0;
            const dy = a.axis === 1 ? x : 0;
            const c = a.caps(dx, dy, 0);
            const dc = c.A - c.B - (a.c0.A - a.c0.B);

            out.x.push(x * 1000);                                              // nm
            out.dC.push(dc * 1e18);                                            // aF
            out.v.push(dc * rd.vex / (rd.cf * 1e-12) * 1000);                  // mV
        });

        const mid = 20;
        const step = out.dC[mid + 1] - out.dC[mid - 1];
        const dg = gs[mid + 1] - gs[mid - 1];

        out.sC = step / dg;                                                    // aF per g
        out.sV = (out.v[mid + 1] - out.v[mid - 1]) / dg;                       // mV per g
        out.sX = (out.x[mid + 1] - out.x[mid - 1]) / dg;                       // nm per g

        // Nonlinearity over the range.
        let worst = 0;
        const fs = out.dC[out.dC.length - 1] - out.dC[0];

        out.dC.forEach(function (v, i) { const line = out.dC[mid] + out.sC * gs[i]; worst = Math.max(worst, Math.abs(v - line)); });

        out.nonlin = fs !== 0 ? worst / Math.abs(fs) * 100 : 0;

        // Full scale: where the motion reaches a third of the narrowest gap.
        out.minGap = a.minGap;
        out.gFS = x1 !== 0 ? 0.3 * a.minGap / Math.abs(x1 * soften) : Infinity;
        out.soften = soften;
        out.vBias = rd.vex;

        // Cross-axis sensitivity.
        const other = a.axis === 1 ? 0 : 1;
        const cross = accelResponse(dev, 1, other);
        const xo = a.axis === 1 ? cross.dy : cross.dx;
        const cz = accelResponse(dev, 1, 2);

        const crossOf = function (dxu, dyu) { const c = a.caps(dxu, dyu, 0); return (c.A - c.B) - (a.c0.A - a.c0.B); };
        const cOther = a.axis === 1 ? crossOf(cross.dx, cross.dy) : crossOf(cross.dx, cross.dy);

        out.crossIn = out.sC !== 0 ? Math.abs(cOther * 1e18 / out.sC) * 100 : 0;
        out.crossZ = out.sC !== 0 ? Math.abs(crossOf(cz.dx, cz.dy) * 1e18 / out.sC) * 100 : 0;
        out.zShift = Math.abs(cz.dz) * 1000;                                  // nm per g

        out.c0 = a.c0;

        return out;
    }

    function accelBandwidth(dev, opts) {

        const sens = accelSensitivity(dev, { vex: opts.vex, cf: opts.cf, dcn: opts.dcn, range: 10 });

        if (!sens.ok) { return sens; }

        const a = accelSetup(dev);
        const prel = pressureOf(opts.pressure);
        const d = a.axis === 1 ? [0, 1] : [1, 0];
        const b = damping(dev, a.mn, d, a.pairsA.concat(a.pairsB), prel);
        const m = sens.meff;
        const k = sens.k;
        const Q = qOf(m, k, b);

        const out = { ok: true, problems: sens.problems, f0: sens.f0, Q: Q, b: b, m: m, k: k, sC: sens.sC, sV: sens.sV, pressure: opts.pressure };

        out.f = [];
        out.mag = [];
        out.phase = [];

        for (let i = 0; i <= 120; i++) {

            const f = Math.pow(10, 1 + (Math.log10(sens.f0 * 5) - 1) * i / 120);
            const r = f / sens.f0;
            const h = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(r / Q, 2));

            out.f.push(f);
            out.mag.push(20 * Math.log10(h));
            out.phase.push(-Math.atan2(r / Q, 1 - r * r) * 180 / Math.PI);
        }

        // The usable band: flat to within 3 dB of the low-frequency value.
        out.bw = sens.f0;

        for (let i = 0; i < out.mag.length; i++) { if (Math.abs(out.mag[i]) > 3) { out.bw = out.f[i]; break; } }

        out.peakDb = Math.max.apply(null, out.mag);

        // Noise: Brownian motion of the mass in the air, and the electronics.
        const tnea = Math.sqrt(4 * KB * TEMP * b) / m / GRAV;                   // g per root hertz
        const elec = sens.sC !== 0 ? opts.dcn / Math.abs(sens.sC) : Infinity;   // g per root hertz (dcn in aF per root hertz)

        out.tnea = tnea;
        out.elec = elec;
        out.noise = Math.hypot(tnea, elec);
        out.band = opts.band;
        out.resolution = out.noise * Math.sqrt(opts.band) * 1000;               // mg rms
        out.dyn = sens.gFS / Math.max(out.noise * Math.sqrt(opts.band), 1e-12);
        out.dynDb = 20 * Math.log10(Math.max(out.dyn, 1));
        out.gFS = sens.gFS;

        return out;
    }

    function accelShock(dev, opts) {

        const base = accelModes(dev);

        if (!base.ok) { return base; }

        const a = accelSetup(dev);
        const fr = a.fr;
        const out = { ok: true, problems: base.problems };
        const strength = (dev.mems.layers.filter(function (l) { return l.role === "structure"; })[0] || { strength: 1.2 }).strength * 1e9;

        out.axes = [0, 1, 2].map(function (ax) {

            const dirs = ax === 2 ? [0, 0, 1] : (ax === 0 ? [1, 0, 0] : [0, 1, 0]);
            const u = S.accelerate(fr, dirs[0] * GRAV, dirs[1] * GRAV, dirs[2] * GRAV);
            const st = S.stresses(fr, u);
            const o = a.mn.index * 6;
            const dispUm = Math.max(Math.abs(u[o + ax]), 0) / UM;

            let worst = { stress: 0 };

            st.forEach(function (s) { if (s.stress > worst.stress) { worst = s; } });

            const gFrac = worst.stress > 0 ? 0.8 * strength / worst.stress : Infinity;
            const room = ax === 2 ? gapUnder(dev, a.mn) : a.minGap;
            const gContact = dispUm > 0 ? 0.9 * room / dispUm : Infinity;

            return { axis: ["x", "y", "z"][ax], stress: worst.stress / 1e6, stressX: worst.x, stressY: worst.y, disp: dispUm, gFrac: gFrac, gContact: gContact, gFail: Math.min(gFrac, gContact), mode: gContact < gFrac ? "parts touch" : "a beam breaks" };
        });

        out.levels = opts.levels || [100, 1000, 5000, 10000, 20000];

        out.curves = out.axes.map(function (ax) { return out.levels.map(function (g) { return ax.stress * g; }); });
        out.strength = strength / 1e6;
        out.worst = Math.min.apply(null, out.axes.map(function (x) { return x.gFail; }));
        out.survives = out.worst > opts.target;
        out.target = opts.target;

        return out;
    }


    /* ------------------------------------------------
       GYROSCOPE
    ------------------------------------------------ */

    function gyroSetup(dev) {

        if (dev.__gyr) { return dev.__gyr; }

        const fr = frameOf(dev);
        const mn = mainNode(dev);
        const out = { fr: fr, mn: mn, ok: false };

        Object.defineProperty(dev, "__gyr", { value: out, enumerable: false, writable: true });

        if (!mn) { return out; }

        const fixedOf = function (label) { return prep(piecesOfNet(dev, label).filter(function (p) { const c = fr.pieceCluster[p.id]; return !c || (c.node || c).fixed || (c.node || c) !== mn; })); };

        out.mover = prep(carried(dev, mn).filter(function (p) { return p.net === dev.mems.nets.M; }));
        out.D = fixedOf("D");
        out.S = fixedOf("S");

        const capsOf = function (set) {

            return function (dx, dy, th) {

                const xf = { dx: dx, dy: dy, th: th || 0, cx: mn.ref[0], cy: mn.ref[1] };
                const pm = out.mover.map(function (m) { return Object.assign({}, m, { poly: moved(m.poly, xf) }); }).map(function (m) { m.box = boxOf(m.poly); m.edges = edgesOf(m.poly); return m; });

                return capOf(facing(pm, set, 12));
            };
        };

        out.capD = capsOf(out.D);
        out.capS = capsOf(out.S);
        out.pairsD = facing(out.mover, out.D, 12);
        out.pairsS = facing(out.mover, out.S, 12);

        const d = 0.05;

        out.dDx = (out.capD(d, 0, 0) - out.capD(-d, 0, 0)) / (2 * d * UM);
        out.dDy = (out.capD(0, d, 0) - out.capD(0, -d, 0)) / (2 * d * UM);
        out.dSy = (out.capS(0, d, 0) - out.capS(0, -d, 0)) / (2 * d * UM);
        out.dSx = (out.capS(d, 0, 0) - out.capS(-d, 0, 0)) / (2 * d * UM);

        const e = 0.1;

        out.cDyy = (out.capD(0, e, 0) - 2 * out.capD(0, 0, 0) + out.capD(0, -e, 0)) / Math.pow(e * UM, 2);
        out.cSyy = (out.capS(0, e, 0) - 2 * out.capS(0, 0, 0) + out.capS(0, -e, 0)) / Math.pow(e * UM, 2);
        out.cS0 = out.capS(0, 0, 0);
        out.cD0 = out.capD(0, 0, 0);

        const gaps = out.pairsD.concat(out.pairsS).map(function (q) { return q.gap; });

        out.minGap = gaps.length ? Math.min.apply(null, gaps) : 2;
        out.ok = true;

        // Overlap of the drive fingers along x: how far the mass can swing before the fingers leave each other.
        const along = out.pairsD.filter(function (q) { return Math.abs(q.ny) > 0.9; });

        out.overlap = along.length ? Math.min.apply(null, along.map(function (q) { return q.len; })) : 30;

        return out;
    }

    // Stiffness of the proof mass in x and y, and the cross term, from unit loads.
    function gyroStiffness(dev) {

        const g = gyroSetup(dev);
        const fr = g.fr;
        const i = g.mn.index;
        const ux = S.solveLoads(fr, { [i]: [1, 0, 0, 0, 0, 0] });
        const uy = S.solveLoads(fr, { [i]: [0, 1, 0, 0, 0, 0] });
        const o = i * 6;

        // Compliance matrix [[cxx, cxy], [cyx, cyy]] and its inverse.
        const cxx = ux[o]; const cyx = ux[o + 1]; const cxy = uy[o]; const cyy = uy[o + 1];
        const det = cxx * cyy - cxy * cyx;

        return { kxx: cyy / det, kyy: cxx / det, kxy: -cxy / det, cxx: cxx, cyy: cyy };
    }

    function gyroModes(dev) {

        const out = { ok: usable(dev).ok, problems: usable(dev).problems || [] };

        if (!out.ok) { out.problems = out.problems.concat(usable(dev).reasons || []); return out; }

        const g = gyroSetup(dev);

        out.modes = modeList(dev, 8);

        const pick = function (axis) {

            let best = null;

            out.modes.forEach(function (m) { if (m.dir === axis && (!best || m.share > best.share)) { best = m; } });

            return best;
        };

        out.drive = pick(0);
        out.sense = pick(1);
        out.mass = g.mn.mass;

        if (out.drive) { out.drive.meff = out.drive.eff[0]; out.drive.k = out.drive.meff * Math.pow(2 * Math.PI * out.drive.f, 2); }
        if (out.sense) { out.sense.meff = out.sense.eff[1]; out.sense.k = out.sense.meff * Math.pow(2 * Math.PI * out.sense.f, 2); }

        out.stiff = gyroStiffness(dev);

        if (out.drive && out.sense) { out.split = (out.sense.f - out.drive.f) / out.drive.f * 100; }

        out.dDx = g.dDx;
        out.dSy = g.dSy;

        return out;
    }

    // Quality factors of the two modes.
    function gyroQ(dev, prel) {

        const m = gyroModes(dev);

        if (!m.ok || !m.drive || !m.sense) { return Object.assign({ ok: false }, m); }

        const g = gyroSetup(dev);
        const all = g.pairsD.concat(g.pairsS);

        m.bx = damping(dev, g.mn, [1, 0], all, prel);
        m.by = damping(dev, g.mn, [0, 1], all, prel);
        m.Qx = qOf(m.drive.meff, m.drive.k, m.bx);
        m.Qy = qOf(m.sense.meff, m.sense.k, m.by);

        return m;
    }

    function gyroDrive(dev, opts) {

        const m = gyroQ(dev, pressureOf(opts.pressure));

        if (!m.ok || !m.drive) { return m; }

        const g = gyroSetup(dev);
        const out = { ok: true, problems: m.problems, fd: m.drive.f, Qx: m.Qx, k: m.drive.k, m: m.drive.meff, dDx: g.dDx, overlap: g.overlap };

        // Force from the comb: a DC bias plus an AC drive on the drive comb gives F = Vdc Vac dC/dx.
        const F = opts.vdc * opts.vac * g.dDx;

        out.force = F;
        out.f = [];
        out.amp = [];
        out.phase = [];

        const w0 = 2 * Math.PI * m.drive.f;

        for (let i = 0; i <= 160; i++) {

            const f = m.drive.f * (0.9 + 0.2 * i / 160);
            const w = 2 * Math.PI * f;
            const den = Math.hypot(m.drive.k - m.drive.meff * w * w, m.bx * w);

            out.f.push(f);
            out.amp.push(Math.abs(F) / den / UM);
            out.phase.push(-Math.atan2(m.bx * w, m.drive.k - m.drive.meff * w * w) * 180 / Math.PI);
        }

        const peak = Math.abs(F) * m.Qx / m.drive.k / UM;                                  // um at resonance

        out.peak = Math.min(peak, 0.8 * g.overlap);
        out.limited = peak > 0.8 * g.overlap;
        out.rawPeak = peak;

        // Voltage sweep at resonance.
        out.vs = [];
        out.vamp = [];

        for (let v = 0; v <= opts.vac * 3 + 1e-9; v += opts.vac * 3 / 30) { out.vs.push(v); out.vamp.push(Math.min(Math.abs(opts.vdc * v * g.dDx) * m.Qx / m.drive.k / UM, 0.8 * g.overlap)); }

        // Sideways pull-in of the drive fingers: negative stiffness grows with V^2.
        const kNeg = opts.vdc * opts.vdc * Math.abs(g.cDyy) * 0.5;

        out.kNeg = kNeg;
        out.vPull = g.cDyy ? Math.sqrt(m.sense.k / Math.max(Math.abs(g.cDyy) * 0.5, 1e-30)) : Infinity;
        out.vdc = opts.vdc;
        out.vac = opts.vac;
        out.safe = opts.vdc < 0.7 * out.vPull;
        out.vel = 2 * Math.PI * m.drive.f * out.peak * UM;
        out.ampOn = out.peak;

        return out;
    }

    function gyroRate(dev, opts) {

        const drive = gyroDrive(dev, opts);

        if (!drive.ok) { return drive; }

        const m = gyroQ(dev, pressureOf(opts.pressure));
        const g = gyroSetup(dev);
        const out = { ok: true, problems: drive.problems, fd: m.drive.f, fs: m.sense.f, split: m.split, Qy: m.Qy, Qx: m.Qx };

        // Electrostatic tuning of the sense mode with a voltage on the sense comb.
        const kTune = opts.tune * opts.tune * g.cSyy;                                   // N/m (negative stiffness)
        const ky = m.sense.k - kTune * 0.5;

        out.fsTuned = Math.sqrt(Math.max(ky, 1e-9) / m.sense.meff) / (2 * Math.PI);
        out.splitTuned = (out.fsTuned - m.drive.f) / m.drive.f * 100;

        const wd = 2 * Math.PI * m.drive.f;
        const A = drive.peak * UM;

        out.amp = drive.peak;

        // Coriolis force F = 2 m Omega vx acting on the sense mode, with the response of the sense resonator at the drive frequency.
        const resp = function (rate) {

            const Om = rate * Math.PI / 180;
            const F = 2 * m.sense.meff * Om * wd * A;
            const den = Math.hypot(ky - m.sense.meff * wd * wd, m.by * wd);

            return F / den;                                                           // metres
        };

        out.rates = [];
        out.y = [];
        out.dC = [];
        out.v = [];

        const rmax = opts.range;

        for (let i = -20; i <= 20; i++) {

            const r = rmax * i / 20;
            const y = Math.sign(r) * resp(Math.abs(r)) * 1;

            out.rates.push(r);
            out.y.push(y / UM * 1000);                                                 // nm

            const dC = g.dSy * y;

            out.dC.push(dC * 1e18);
            out.v.push(dC * opts.vex / (opts.cf * 1e-12) * 1000);
        }

        const mid = 20;

        out.sY = (out.y[mid + 1] - out.y[mid - 1]) / (out.rates[mid + 1] - out.rates[mid - 1]);        // nm per deg/s
        out.sC = (out.dC[mid + 1] - out.dC[mid - 1]) / (out.rates[mid + 1] - out.rates[mid - 1]);      // aF per deg/s
        out.sV = (out.v[mid + 1] - out.v[mid - 1]) / (out.rates[mid + 1] - out.rates[mid - 1]);        // mV per deg/s

        // Gain against a perfectly matched sense mode and against no resonance at all.
        const matched = 2 * m.sense.meff * wd * A / (m.by * wd) / UM * 1000 / (180 / Math.PI) ;
        const offRes = 2 * m.sense.meff * wd * A / Math.abs(ky - m.sense.meff * wd * wd) / UM * 1000 / (180 / Math.PI);

        out.sMatched = matched;
        out.gainVsMatched = out.sY !== 0 ? Math.abs(out.sY) / matched : 0;
        out.mismatchHz = Math.abs(out.fsTuned - m.drive.f);
        out.bw = m.drive.f / m.Qy;
        out.bwSense = m.drive.f / m.Qy;

        // Frequency response of the sense mode against the drive frequency (matching).
        out.mf = [];
        out.mgain = [];

        for (let i = 0; i <= 120; i++) {

            const f = m.drive.f * (0.85 + 0.3 * i / 120);
            const fsi = out.fsTuned;
            const r = f / fsi;
            const h = 1 / Math.hypot(1 - r * r, r / m.Qy);

            out.mf.push(f);
            out.mgain.push(h / m.Qy);
        }

        // Open-loop bandwidth of the rate measurement: the sense mode rings with a time constant 2 Q / w.
        out.tau = 2 * m.Qy / (2 * Math.PI * m.sense.f);
        out.mat = Math.abs(out.splitTuned);

        // Quadrature: the cross stiffness couples the drive motion into the sense axis without any rotation.
        const kxy = m.stiff.kxy;

        out.kxy = kxy;
        out.quad = Math.abs(kxy) * A / (2 * m.sense.meff * wd * A) * 180 / Math.PI;       // deg/s equivalent
        out.quadRate = out.quad;

        return out;
    }

    function gyroNoise(dev, opts) {

        const r = gyroRate(dev, opts);

        if (!r.ok) { return r; }

        const m = gyroQ(dev, pressureOf(opts.pressure));
        const g = gyroSetup(dev);
        const wd = 2 * Math.PI * m.drive.f;
        const A = r.amp * UM;

        const out = { ok: true, problems: r.problems, sV: r.sV, sC: r.sC };

        // Brownian noise of the sense mode, in rate: sqrt(4 k T b) / (2 m A w).
        const wsense = 2 * Math.PI * r.fsTuned;
        const brown = Math.sqrt(4 * KB * TEMP * m.by) / (2 * m.sense.meff * A * wd);

        const dcn = opts.dcn * 1e-18;
        const y0 = r.sC !== 0 ? dcn / Math.abs(r.sC * 1e-18) : Infinity;

        out.brown = brown * 180 / Math.PI;                                                 // deg/s per root Hz
        out.elec = y0;
        out.total = Math.hypot(out.brown, out.elec);
        out.arw = out.total * 60;                                                          // deg per root hour
        out.quad = r.quad;
        out.zro = r.quad * Math.sin(opts.phase * Math.PI / 180);
        out.biasInst = out.zro * 0.05;
        out.resolution = out.total * Math.sqrt(opts.band);
        out.amp = r.amp;
        out.Qy = m.Qy;
        out.Qx = m.Qx;
        out.band = opts.band;
        out.phase = opts.phase;

        // A spectrum shape: white noise with a 1/f rise from the electronics.
        out.f = [];
        out.psd = [];

        for (let i = 0; i <= 60; i++) {

            const f = Math.pow(10, -1 + 4 * i / 60);

            out.f.push(f);
            out.psd.push(Math.hypot(out.total, out.biasInst * Math.sqrt(1 / Math.max(f, 0.05)) * 0.3));
        }

        return out;
    }

    function gyroShock(dev, opts) {

        const m = gyroModes(dev);

        if (!m.ok) { return m; }

        const g = gyroSetup(dev);
        const fr = g.fr;
        const out = { ok: true, problems: m.problems };
        const strength = (dev.mems.layers.filter(function (l) { return l.role === "structure"; })[0] || { strength: 1.2 }).strength * 1e9;

        out.axes = [0, 1, 2].map(function (ax) {

            const dirs = ax === 2 ? [0, 0, 1] : (ax === 0 ? [1, 0, 0] : [0, 1, 0]);
            const u = S.accelerate(fr, dirs[0] * GRAV, dirs[1] * GRAV, dirs[2] * GRAV);
            const st = S.stresses(fr, u);
            const o = g.mn.index * 6;
            const dispUm = Math.abs(u[o + ax]) / UM;

            let worst = { stress: 0 };

            st.forEach(function (s) { if (s.stress > worst.stress) { worst = s; } });

            const gFrac = worst.stress > 0 ? 0.8 * strength / worst.stress : Infinity;
            const room = ax === 2 ? gapUnder(dev, g.mn) : g.minGap;
            const gContact = dispUm > 0 ? 0.9 * room / dispUm : Infinity;

            return { axis: ["x", "y", "z"][ax], stress: worst.stress / 1e6, disp: dispUm, gFrac: gFrac, gContact: gContact, gFail: Math.min(gFrac, gContact), mode: gContact < gFrac ? "parts touch" : "a beam breaks" };
        });

        out.levels = [100, 1000, 5000, 10000, 20000];
        out.curves = out.axes.map(function (ax) { return out.levels.map(function (gg) { return ax.stress * gg; }); });
        out.strength = strength / 1e6;
        out.worst = Math.min.apply(null, out.axes.map(function (x) { return x.gFail; }));
        out.survives = out.worst > opts.target;
        out.target = opts.target;

        return out;
    }


    /* ------------------------------------------------
       MICROMIRROR
    ------------------------------------------------ */

    const MIRROR_R = { au: 0.96, al: 0.9, pt: 0.7 };

    function mirrorSetup(dev) {

        if (dev.__mir) { return dev.__mir; }

        const fr = frameOf(dev);
        const mn = mainNode(dev);
        const out = { fr: fr, mn: mn, ok: false };

        Object.defineProperty(dev, "__mir", { value: out, enumerable: false, writable: true });

        if (!mn) { return out; }

        const list = carried(dev, mn);
        const blocks = list.filter(function (p) { return p.type !== "beam"; }).sort(function (a, b) { return b.area - a.area; });

        if (!blocks.length) { return out; }

        const plate = blocks[0];
        const li = layerOf(dev, plate.layer);

        out.plate = plate;
        out.layer = li;
        out.g0 = li.gapBelow || li.z0;
        out.t = plate.t;
        out.holeFrac = Math.max(0, 1 - plate.area / Math.max(G.polyArea(plate.poly), 1e-9));

        // Hinge axis: along the hinge beams where they leave the plate.
        let ax = 1; let ay = 0;
        let px = mn.ref[0]; let py = mn.ref[1];
        let hn = 0;

        fr.elems.forEach(function (e) {

            if (e.nodes[0] !== mn && e.nodes[1] !== mn) { return; }

            ax += 0; hn += 1;

            out.hinge = out.hinge || { w: e.w, L: e.Leff, t: e.t, n: 0 };
            out.hinge.n += 1;

            if (hn === 1) { ax = e.ux; ay = e.uy; }
        });

        const att = [];

        fr.elems.forEach(function (e) {

            [0, 1].forEach(function (k) { if (e.nodes[k] === mn) { att.push([e.ends[k].x, e.ends[k].y]); } });
        });

        if (att.length) {

            px = att.reduce(function (s, q) { return s + q[0]; }, 0) / att.length;
            py = att.reduce(function (s, q) { return s + q[1]; }, 0) / att.length;
        }

        const un = Math.hypot(ax, ay) || 1;

        out.u = [ax / un, ay / un];
        out.o = [px, py];

        // Signed distance from the hinge axis (positive on the left of the axis direction).
        out.s = function (x, y) { return (x - px) * (-out.u[1]) + (y - py) * out.u[0]; };

        // Electrodes: Poly0 pieces named A and B, and the plate outline.
        const electrodes = function (label) { return piecesOfNet(dev, label).filter(function (p) { return !(fr.pieceCluster[p.id]) && p.type !== "beam" || (layerOf(dev, p.layer) || {}).fixedBase; }); };

        out.A = electrodes("A");
        out.B = electrodes("B");

        // Cells over the plate, for integrating the electrostatics.
        const box = G.polyBox(plate.poly);
        const step = Math.max(0.75, Math.min(box.x1 - box.x0, box.y1 - box.y0) / 60);
        const cells = { A: [], B: [] };

        for (let y = box.y0 + step / 2; y < box.y1; y += step) {

            for (let x = box.x0 + step / 2; x < box.x1; x += step) {

                if (!G.pointInPoly(x, y, plate.poly)) { continue; }

                [["A", out.A], ["B", out.B]].forEach(function (pair) {

                    const inside = pair[1].some(function (e) { return G.pointInPoly(x, y, e.poly); });

                    if (inside) { cells[pair[0]].push({ s: out.s(x, y), a: step * step * (1 - out.holeFrac) }); }
                });
            }
        }

        out.cells = cells;
        out.step = step;

        const sOf = function (c) { return c.length ? c.reduce(function (s, q) { return s + q.s * q.a; }, 0) / c.reduce(function (s, q) { return s + q.a; }, 0) : 0; };

        out.sA = sOf(cells.A);
        out.sB = sOf(cells.B);

        // Torsion stiffness about the axis, and the inertia.
        const i = mn.index;
        const tq = S.solveLoads(fr, { [i]: [0, 0, 0, out.u[0], out.u[1], 0] });

        if (!tq) { return out; }

        const th = tq[i * 6 + 3] * out.u[0] + tq[i * 6 + 4] * out.u[1];

        out.ktheta = 1 / Math.max(Math.abs(th), 1e-30);

        const off = Math.hypot(mn.ref[0] - px, mn.ref[1] - py) * UM;
        const jx = mn.jxx;
        const jy = mn.jyy;

        out.J = jx * out.u[0] * out.u[0] + jy * out.u[1] * out.u[1] + mn.mass * off * off;
        out.mass = mn.mass;

        // Landing: the plate edge or a dimple tip, whichever touches first, on each side.
        const dimples = dev.mems.dimples.filter(function (d) { return d.layer === plate.layer; });
        const dd = li.dimpleDepth || 0;
        const sMax = { p: 0, n: 0 };

        plate.poly.forEach(function (q) { const s = out.s(q[0], q[1]); if (s > sMax.p) { sMax.p = s; } if (-s > sMax.n) { sMax.n = -s; } });

        const land = { p: out.g0 / Math.max(sMax.p, 0.1), n: out.g0 / Math.max(sMax.n, 0.1) };
        const tipArea = { p: 0, n: 0 };

        dimples.forEach(function (d) {

            const s = out.s(d.x, d.y);
            const side = s >= 0 ? "p" : "n";
            const gg = Math.max(out.g0 - dd, 0.2);

            land[side] = Math.min(land[side], gg / Math.max(Math.abs(s), 0.1));
            tipArea[side] += d.area;
        });

        out.landP = land.p;
        out.landN = land.n;
        out.tipArea = tipArea;
        out.sTip = { p: sMax.p * 0.8, n: sMax.n * 0.8 };
        out.dimples = dimples.length;
        out.ok = true;

        return out;
    }

    // Capacitance slope dC/dtheta and the torque from one electrode at tilt th (rad) and voltage v.
    function mirrorTorque(M, side, v, th) {

        const cells = M.cells[side];
        let sum = 0;

        for (let i = 0; i < cells.length; i++) {

            const c = cells[i];
            const g = M.g0 - c.s * th;

            if (g < 0.15) { return 1e9 * Math.sign(c.s); }

            sum += c.s * c.a / (g * g);
        }

        // dC/dtheta = eps * sum (um2 per um2 -> m); torque = 1/2 V^2 dC/dtheta
        return 0.5 * v * v * EPS0 * FRINGE * sum * UM * 1;
    }

    function mirrorAdhesion(dev, M) {

        const dry = E.memsRelease.DRY[(dev.release || {}).dry] || E.memsRelease.DRY.ipa;

        const area = { p: (M.tipArea.p || 0) > 0 ? M.tipArea.p : Math.max(M.plate.area * 0.2, 1), n: (M.tipArea.n || 0) > 0 ? M.tipArea.n : Math.max(M.plate.area * 0.2, 1) };

        return { p: dry.adhesion * area.p * 1e-12 / (M.g0 * UM) * (M.sTip.p * UM) * 0.5, n: dry.adhesion * area.n * 1e-12 / (M.g0 * UM) * (M.sTip.n * UM) * 0.5 };
    }

    // Stable equilibrium tilt for voltages (va on A, vb on B): the first crossing of the torque curve.
    function equilibrium(M, va, vb, from, thMin, thMax) {

        if (va === 0 && vb === 0) { return { th: thMin, landed: false }; }

        const n = 240;
        const tot = function (th) { return mirrorTorque(M, "A", va, th) + mirrorTorque(M, "B", vb, th) - M.ktheta * th; };

        const step = (thMax - thMin) / n;
        let prev = tot(thMin);

        for (let i = 1; i <= n; i++) {

            const th = thMin + step * i;
            const cur = tot(th);

            if (prev > 0 && cur <= 0 && (from === null || th >= from - 3 * step)) {

                // bisect
                let lo = th - step;
                let hi = th;

                for (let k = 0; k < 30; k++) { const mid = 0.5 * (lo + hi); if (tot(mid) > 0) { lo = mid; } else { hi = mid; } }

                return { th: 0.5 * (lo + hi), landed: false };
            }

            prev = cur;
        }

        return { th: thMax, landed: true };
    }

    function mirrorTilt(dev, opts) {

        const out = { ok: usable(dev).ok, problems: usable(dev).problems || [] };

        if (!out.ok) { out.problems = out.problems.concat(usable(dev).reasons || []); return out; }

        const M = mirrorSetup(dev);

        if (!M.ok || !M.ktheta) { out.ok = false; out.problems.push("The mirror plate and its hinges could not be analysed. Check that M, A and B are all present."); return out; }

        out.k = M.ktheta;
        out.J = M.J;
        out.g0 = M.g0;
        out.landP = M.landP;
        out.landN = M.landN;
        out.hinge = M.hinge;
        out.dimples = M.dimples;
        out.f0 = Math.sqrt(M.ktheta / M.J) / (2 * Math.PI);

        // Which side does electrode A pull? A sits on side sA. Positive tilt lowers the positive-s side.
        const signA = M.sA >= 0 ? 1 : -1;
        const land = signA > 0 ? M.landP : M.landN;

        out.land = land;
        out.landDeg = land * 180 / Math.PI;
        out.sA = M.sA;
        out.sB = M.sB;

        const adh = mirrorAdhesion(dev, M);
        const tauAdh = signA > 0 ? adh.p : adh.n;

        out.adhesion = tauAdh;

        // Sweep the voltage on A up and then down, remembering where the mirror was.
        const vmax = opts.vmax;
        const steps = 120;
        const sgn = signA;

        const evalA = function (v, from) { const r = equilibrium(M, v, 0, from, 0, land * sgn > 0 ? land : -land); return r; };

        out.vUp = []; out.thUp = []; out.vDn = []; out.thDn = [];

        let state = 0;
        let landed = false;
        let vPi = null;

        const asSigned = function (x) { return x * sgn; };

        // For simplicity the calculation is done in the frame where A pulls positive: flip the cells if A is on the negative side.
        const cellsA = M.cells.A.map(function (c) { return { s: c.s * sgn, a: c.a }; });
        const Mf = { cells: { A: cellsA, B: M.cells.B.map(function (c) { return { s: c.s * sgn, a: c.a }; }) }, g0: M.g0, ktheta: M.ktheta };

        for (let i = 0; i <= steps; i++) {

            const v = vmax * i / steps;

            if (!landed) {

                const r = equilibrium(Mf, v, 0, state, 0, land);

                if (r.landed) { landed = true; vPi = v; state = land; } else { state = r.th; }
            }

            out.vUp.push(v);
            out.thUp.push(state * 180 / Math.PI);
        }

        out.vPi = vPi;

        // Down sweep: stays landed until the spring (plus the stiction) wins.
        let vRel = null;

        if (landed) {

            let st = land;
            let still = true;

            for (let i = steps; i >= 0; i--) {

                const v = vmax * i / steps;

                if (still) {

                    const net = mirrorTorque(Mf, "A", v, land) - M.ktheta * land + tauAdh;

                    if (net < 0) { still = false; vRel = v; const r = equilibrium(Mf, v, 0, null, 0, land); st = r.landed ? land : r.th; }
                    else { st = land; }

                } else {

                    const r = equilibrium(Mf, v, 0, 0, 0, land);

                    st = r.landed ? land : r.th;
                }

                out.vDn.push(v);
                out.thDn.push(st * 180 / Math.PI);
            }

            if (still) { vRel = 0; out.stuck = true; }
        }

        out.vRel = vRel;
        out.hyst = vPi !== null && vRel !== null ? vPi - vRel : null;
        out.noLand = vPi === null;

        // Torque curve at a few voltages.
        out.tauTh = [];
        out.tauSets = [];

        const volts = vPi ? [0.5 * vPi, 0.8 * vPi, vPi, 1.2 * vPi] : [0.5 * vmax, 0.8 * vmax, vmax];

        for (let i = 0; i <= 80; i++) { out.tauTh.push(land * i / 80 * 180 / Math.PI); }

        volts.forEach(function (v) {

            out.tauSets.push({ v: v, y: out.tauTh.map(function (d) { return (mirrorTorque(Mf, "A", v, d * Math.PI / 180 / 1) * 1e9); }) });
        });

        out.spring = out.tauTh.map(function (d) { return M.ktheta * d * Math.PI / 180 * 1e9; });

        out.sgn = sgn;
        out.Mf = Mf;

        return out;
    }

    function mirrorSwitch(dev, opts) {

        const t = mirrorTilt(dev, { vmax: opts.v * 1.5 });

        if (!t.ok) { return t; }

        const M = mirrorSetup(dev);
        const Mf = t.Mf;
        const land = t.land;
        const out = { ok: true, problems: t.problems, vPi: t.vPi, v: opts.v, f0: t.f0, land: land, landDeg: t.landDeg };

        // Damping: squeeze film under a tilting plate, reduced by the holes.
        const w = (function () { const b = G.polyBox(M.plate.poly); return Math.hypot(b.x1 - b.x0, b.y1 - b.y0) / Math.SQRT2; })();
        const Wp = Math.min(...[(function () { const b = G.polyBox(M.plate.poly); return b.x1 - b.x0; })(), (function () { const b = G.polyBox(M.plate.poly); return b.y1 - b.y0; })()]) * UM;
        const Lp = Wp;
        const mu = MU0 * pressureOf(opts.pressure) * slip(M.g0);
        const c = mu * Lp * Math.pow(Wp, 5) / (60 * Math.pow(M.g0 * UM, 3)) * (1 - 0.8 * M.holeFrac);

        out.c = c;
        out.Q = Math.sqrt(M.ktheta * M.J) / c;

        const tauAdh = t.adhesion;

        // Integrate J th'' + c th' + k th = tau(V, th) with a hard stop at the landing angle.
        const dt = Math.min(2e-8, 0.02 / (2 * Math.PI * out.f0));
        const nT = Math.min(60000, Math.round(opts.tmax / dt));
        const run = function (v, th0, w0) {

            const ts = []; const ths = [];
            let th = th0; let om = w0;
            let landedAt = null;
            let leftAt = null;
            let hit = false;

            for (let i = 0; i < nT; i++) {

                const tau = mirrorTorque(Mf, "A", v, th) - M.ktheta * th - c * om;

                if (th >= land - 1e-12 && om >= 0 && tau + tauAdh * (v > 0 ? 0 : 1) > -1e-30 && v > 0) {

                    // pressed against the stop
                    th = land;
                    om = 0;

                    if (landedAt === null) { landedAt = i * dt; }

                } else if (th >= land - 1e-12 && v === 0 && (M.ktheta * land - tauAdh) <= 0) {

                    th = land;
                    om = 0;

                } else {

                    om += tau / M.J * dt;
                    th += om * dt;

                    if (th >= land) {

                        th = land;
                        om = -0.15 * Math.abs(om);
                        hit = true;

                        if (landedAt === null) { landedAt = i * dt; }
                    }

                    if (th < 0 && v === 0) { th = 0; om = Math.abs(om) * 0.2; }
                }

                if (i % Math.max(1, Math.round(nT / 400)) === 0) { ts.push(i * dt * 1e6); ths.push(th * 180 / Math.PI); }
            }

            return { t: ts, th: ths, landedAt: landedAt, hit: hit, end: th };
        };

        const on = run(opts.v, 0, 0);

        out.t = on.t;
        out.thOn = on.th;
        out.tOn = on.landedAt === null ? null : on.landedAt * 1e6;
        out.landed = on.landedAt !== null;

        // Release: voltage off, starting from the landed state.
        const off = out.landed ? run(0, land, 0) : { t: [], th: [], end: 0 };

        out.thOff = off.th;
        out.releaseFree = out.landed ? (M.ktheta * land > tauAdh) : true;

        // Time to return to within 10% of flat.
        let tOff = null;

        if (out.landed && out.releaseFree) {

            for (let i = 0; i < off.th.length; i++) { if (off.th[i] < 0.1 * out.landDeg) { tOff = off.t[i]; break; } }
        }

        out.tOff = tOff;

        // Settling: when the on-state stays within 2% of the landing angle.
        out.overshoot = 0;
        out.bits = out.tOn ? Math.max(0, Math.floor(Math.log2(opts.frame / (out.tOn * 1e-6) / 4))) : 0;
        out.frameRate = opts.frame;

        return out;
    }

    function mirrorOptics(dev, opts) {

        const t = mirrorTilt(dev, { vmax: 100 });

        const out = { ok: t.ok, problems: t.problems };

        if (!t.ok) { return out; }

        const M = mirrorSetup(dev);
        const box = G.polyBox(M.plate.poly);
        const wP = box.x1 - box.x0;
        const hP = box.y1 - box.y0;
        const metal = dev.mems.metal || { material: "au" };
        const R = MIRROR_R[metal.material] || 0.9;

        out.size = [wP, hP];
        out.pitch = Math.max(wP, hP) + opts.margin;
        out.holeFrac = M.holeFrac;
        out.metalFrac = M.plate.metalFrac;
        out.refl = M.plate.metalFrac * R + (1 - M.plate.metalFrac) * 0.3;
        out.fill = (wP * hP * (1 - M.holeFrac)) / (out.pitch * out.pitch);

        // Flatness: curl from the metal film stress (Stoney), and the stress gradient of the poly.
        const ts = M.t * UM;
        const tf = (dev.mems.metal ? dev.mems.metal.t : 0.5) * UM * M.plate.metalFrac;
        const sigF = ({ au: 80e6, al: 150e6, pt: 400e6 }[metal.material] || 100e6) * M.plate.metalFrac;
        const kappa = 6 * sigF * tf / (162e9 * ts * ts);
        const span = Math.max(wP, hP) * UM;

        out.sag = kappa * span * span / 8 * 1e9;                                   // nm
        out.rms = out.sag * 0.35;
        out.lambda = 550;
        out.strehl = Math.exp(-Math.pow(4 * Math.PI * out.rms / out.lambda, 2));
        out.curvature = kappa;
        out.spread = kappa * span * 180 / Math.PI;                                // degrees of angular spread of the reflected beam

        out.landDeg = t.landDeg;
        out.sep = 4 * t.land;                                                     // radians between the on and off beams

        // Contrast: overlap of the on and off light cones for the chosen optics.
        const alpha = Math.atan(1 / (2 * opts.fnum));
        const d = out.sep;
        const overlap = d >= 2 * alpha ? 0 : (2 * alpha * alpha * Math.acos(d / (2 * alpha)) - 0.5 * d * Math.sqrt(4 * alpha * alpha - d * d)) / (Math.PI * alpha * alpha);
        const floor = 0.002 + 0.002 * M.holeFrac * 5 + 1e-3 * (1 - out.fill);

        out.alpha = alpha * 180 / Math.PI;
        out.overlap = overlap;
        out.cr = 1 / (overlap + floor);
        out.fnum = opts.fnum;
        out.flat = 1 / (1 + Math.pow(out.spread / out.alpha, 2));
        out.efficiency = out.fill * out.refl * out.flat * (1 - 0.5 * overlap);
        out.floor = floor;

        // Diffraction: pixel pitch against the wavelength.
        out.diffAngle = (out.lambda * 1e-9) / (out.pitch * UM) * 180 / Math.PI;

        out.curve = { f: [], cr: [] };

        [1.5, 2, 2.4, 3, 4, 5, 6, 8, 10, 12, 16, 20].forEach(function (fn) {

            const a2 = Math.atan(1 / (2 * fn));
            const ov = d >= 2 * a2 ? 0 : (2 * a2 * a2 * Math.acos(d / (2 * a2)) - 0.5 * d * Math.sqrt(4 * a2 * a2 - d * d)) / (Math.PI * a2 * a2);

            out.curve.f.push(fn);
            out.curve.cr.push(1 / (ov + floor));
        });

        return out;
    }

    function mirrorDisplay(dev, opts) {

        const sw = mirrorSwitch(dev, { v: opts.v, tmax: 60e-6, frame: 1 / 60, pressure: opts.pressure });

        if (!sw.ok) { return sw; }

        const op = mirrorOptics(dev, { fnum: opts.fnum, margin: opts.margin });

        const st = stiction(dev);
        const out = { ok: true, problems: sw.problems, cols: opts.cols, rows: opts.rows, op: op, sw: sw };

        const rand = rngFor(dev, 91);
        const pStuck = clamp(0.004 + 0.4 * st.p + (sw.landed ? 0 : 0.6), 0, 1);

        out.pStuck = pStuck;
        out.on = [];
        out.state = [];
        out.bright = [];

        let nStuck = 0;
        let sum = 0;
        let sum2 = 0;
        let nOn = 0;

        for (let j = 0; j < opts.rows; j++) {

            for (let i = 0; i < opts.cols; i++) {

                const want = opts.pattern(i, j) ? 1 : 0;
                const stuck = rand() < pStuck;
                const state = stuck ? (rand() < 0.5 ? 1 : 0) : want;

                if (stuck) { nStuck += 1; }

                const vary = Math.exp(0.03 * gaussFrom(rand));
                const b = state ? op.efficiency * vary : op.efficiency / Math.max(op.cr, 1) * vary;

                out.on.push(want);
                out.state.push(state);
                out.bright.push(b);

                if (state) { sum += b; sum2 += b * b; nOn += 1; }
            }
        }

        out.nStuck = nStuck;
        out.stuckPct = nStuck / (opts.cols * opts.rows) * 100;
        out.mean = nOn ? sum / nOn : 0;
        out.uniform = nOn ? Math.sqrt(Math.max(sum2 / nOn - out.mean * out.mean, 0)) / Math.max(out.mean, 1e-9) * 100 : 0;
        out.bits = sw.bits;

        return out;
    }

    function mirrorLife(dev, opts) {

        const t = mirrorTilt(dev, { vmax: 100 });

        if (!t.ok) { return t; }

        const M = mirrorSetup(dev);
        const fr = M.fr;
        const out = { ok: true, problems: t.problems };
        const strength = (dev.mems.layers.filter(function (l) { return l.role === "structure"; })[0] || { strength: 1.2 }).strength * 1e9;

        // Hinge stress when the mirror is landed: rotate the plate by the landing angle.
        const tq = t.k * t.land;
        const u = S.solveLoads(fr, { [M.mn.index]: [0, 0, 0, M.u[0] * tq, M.u[1] * tq, 0] });
        const st = S.stresses(fr, u);

        let worst = { stress: 0 };

        st.forEach(function (s) { if (s.stress > worst.stress) { worst = s; } });

        out.hingeStress = worst.stress / 1e6;
        out.strength = strength / 1e6;
        out.ratio = worst.stress / strength;

        // Fatigue: cycles to failure falls steeply with the stress amplitude.
        out.cycles = 1e9 * Math.pow(0.5 / Math.max(out.ratio, 1e-3), 8);
        out.years = out.cycles / (60 * 2 * 3600 * 24 * 365) * 1;
        out.hours = out.cycles / (60 * 2 * 3600);

        // Shock along z and across the hinge.
        const shock = [100, 1000, 5000, 10000, 20000];

        out.levels = shock;
        out.axes = [0, 1, 2].map(function (ax) {

            const dirs = ax === 2 ? [0, 0, 1] : (ax === 0 ? [1, 0, 0] : [0, 1, 0]);
            const us = S.accelerate(fr, dirs[0] * GRAV, dirs[1] * GRAV, dirs[2] * GRAV);
            const ss = S.stresses(fr, us);
            let w2 = 0;

            ss.forEach(function (s) { if (s.stress > w2) { w2 = s.stress; } });

            const o = M.mn.index * 6;
            const disp = Math.abs(us[o + ax]) / UM;
            const room = ax === 2 ? M.g0 : 5;

            return { axis: ["x", "y", "z"][ax], stress: w2 / 1e6, gFrac: w2 > 0 ? 0.8 * strength / w2 : Infinity, gContact: disp > 0 ? 0.9 * room / disp : Infinity };
        });

        out.worst = Math.min.apply(null, out.axes.map(function (a) { return Math.min(a.gFrac, a.gContact); }));
        out.curves = out.axes.map(function (a) { return shock.map(function (g) { return a.stress * g; }); });
        out.stiction = stiction(dev);

        return out;
    }


    root.LabMems = {

        PRESSURES: PRESSURES, READ: READ, MIRROR_R: MIRROR_R,
        frameOf: frameOf, mainNode: mainNode, usable: usable, working: working, stiction: stiction, check: check, modeList: modeList,
        accelSetup: accelSetup, accelModes: accelModes, accelSensitivity: accelSensitivity, accelBandwidth: accelBandwidth, accelShock: accelShock,
        gyroSetup: gyroSetup, gyroModes: gyroModes, gyroQ: gyroQ, gyroDrive: gyroDrive, gyroRate: gyroRate, gyroNoise: gyroNoise, gyroShock: gyroShock,
        mirrorSetup: mirrorSetup, mirrorTilt: mirrorTilt, mirrorSwitch: mirrorSwitch, mirrorOptics: mirrorOptics, mirrorDisplay: mirrorDisplay, mirrorLife: mirrorLife,
        capOf: capOf, facing: facing, prep: prep, damping: damping, pressureOf: pressureOf, piecesOfNet: piecesOfNet, carried: carried, layerOf: layerOf, gapUnder: gapUnder
    };

    if (typeof module !== "undefined" && module.exports) { module.exports = root.LabMems; }

}(typeof window !== "undefined" ? window : globalThis));
