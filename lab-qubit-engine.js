/* ========================================
   QUANTUM FOUNDRY: DEVICE ANALYSIS

   Registers the "qubit" kind with LabEngine: a superconducting chip with
   transmon qubits, half-wave readout resonators and a feedline.

   Layers:
     groundplane  a superconducting film; the shapes drawn on it are the
                  OPENINGS etched into the ground plane (cut mode)
     circuit      the same kind of film drawn as metal: the feedline and its
                  launch pads, resonators, qubit pads and couplers
     junction     Josephson junctions: thin Al leads written by electron-beam
                  lithography and shadow evaporation (no photomask)

   From the fabricated geometry it finds the nets (ground, feedline, qubit
   islands, resonators), the capacitance between every pair of nets from
   the facing edges and their gaps, each junction's area and resistance,
   and from those the qubit frequencies, anharmonicity, couplings and the
   loss budget. The tests live in lab-qubit-model.js.

   Teaching models: the constants are illustrative, chosen to give
   realistic magnitudes, not product data.

   Needs window.LabEngine and window.LabGeom.
======================================== */

(function (root) {

    "use strict";

    const E = root.LabEngine;
    const G = root.LabGeom;

    const EPS0 = 8.854e-12;
    const C_LIGHT = 2.998e8;
    const Z0 = 50;
    const DELTA_AL = 0.18e-3;            // aluminium gap, in volts (eV / e)
    const COLD_RISE = 1.12;              // junction resistance rises ~12% on cooling


    /* ------------------------------------------------
       CATALOGS
    ------------------------------------------------ */

    // tc: critical temperature (K). gap: pair-breaking frequency (GHz).
    // tanS: loss tangent of the surface oxide and interfaces (illustrative).
    const FILMS = {
        al: { name: "Aluminium (evaporated)", blurb: "Easy to deposit and etch; its native oxide is moderately lossy.", tc: 1.2, gap: 90, tanS: 6e-4, cost: 2, hours: 3, adh: 0.9, thick: 0.15 },
        nb: { name: "Niobium (sputtered)", blurb: "Robust, with a high critical temperature, but its mixed oxides are lossy.", tc: 9.2, gap: 700, tanS: 1e-3, cost: 2, hours: 3, adh: 0.9, thick: 0.15 },
        ta: { name: "Tantalum (alpha phase, sputtered hot)", blurb: "A thin, benign oxide: the film behind record transmon lifetimes.", tc: 4.4, gap: 330, tanS: 1.5e-4, cost: 3, hours: 4, adh: 0.85, thick: 0.15 },
        tin: { name: "Titanium nitride (reactive sputter)", blurb: "Chemically stable, with very low surface loss.", tc: 4.5, gap: 330, tanS: 2e-4, cost: 3, hours: 4, adh: 0.85, thick: 0.1 }
    };

    // rough: random edge wobble of a junction lead (um).
    const JUNCTIONS = {
        dolan: { name: "Al/AlOx/Al, Dolan bridge", blurb: "Two angled evaporations under a suspended resist bridge. The bridge's shadow sets the overlap.", rough: 0.004, cost: 3, hours: 6, adh: 0.85, thick: 0.1 },
        manhattan: { name: "Al/AlOx/Al, Manhattan crossing", blurb: "Two crossing lines, each filled by one evaporation. The overlap is a square as wide as the lines.", rough: 0.003, cost: 3, hours: 6, adh: 0.9, thick: 0.1 }
    };

    const BRIDGES = {
        al: { name: "Aluminium airbridge", blurb: "A metal arch on a reflowed resist scaffold: it joins the metal under its two feet and jumps over whatever lies between.", cost: 2, hours: 5, adh: 0.85, thick: 0.3 }
    };

    // eps: relative permittivity. tan: bulk loss tangent (illustrative).
    const SUBSTRATES = {
        si: { name: "High-resistivity silicon", eps: 11.7, tan: 1.5e-7 },
        sapphire: { name: "Sapphire (c-plane)", eps: 10.4, tan: 5e-8 }
    };

    E.ROLES.groundplane = { name: "Ground plane (drawn shapes are the etched openings)", conductive: true, color: "#8fb3ff" };
    E.ROLES.circuit = { name: "Circuit metal (lines, resonators, qubit pads)", conductive: true, color: "#ffcf6b" };
    E.ROLES.junction = { name: "Josephson junctions (e-beam, shadow-evaporated Al)", conductive: false, color: "#ff7ad9" };
    E.ROLES.airbridge = { name: "Airbridges (each strip joins the metal under its two ends)", conductive: false, color: "#7dffb0" };

    E.MATERIAL_TABLE.groundplane = FILMS;
    E.MATERIAL_TABLE.circuit = FILMS;
    E.MATERIAL_TABLE.junction = JUNCTIONS;
    E.MATERIAL_TABLE.airbridge = BRIDGES;

    E.SHEET_ROLES.airbridge = {
        table: BRIDGES, limit: 2,
        lost: "Airbridges narrower than about 2 µm can't be built.",
        hint: "Each airbridge is an aluminium arch built over a reflowed resist scaffold (two lithography steps of their own). Draw each one as a strip: its two ends land on metal and join it, and the middle jumps over anything underneath without touching it. Use them to tie pieces of ground plane together across a line, or to let one line cross another."
    };

    E.SHEET_ROLES.junction = {
        table: JUNCTIONS, limit: 0.05,
        lost: "Electron-beam lithography can't write leads narrower than about 50 nm.",
        hint: "Junctions are written by electron-beam lithography in a two-layer resist and made by two angled aluminium evaporations with an oxidation in between, so there is no photomask, exposure or bake to set here. Each drawn strip is one junction: its narrow width and the shadow overlap set the junction area. The oxidation, bridge and angles are set at the top of this page."
    };

    E.KINDS.qubit = {
        name: "Transmon qubit chip", ready: true,
        blurb: "A superconducting chip with transmon qubits, readout resonators and a feedline: predict frequencies at room temperature, then cool it down and measure spectroscopy, Rabi, T₁ and Ramsey.",
        roles: ["groundplane", "circuit", "junction", "airbridge"],
        pads: ["I", "O", "Q1", "Q2", "Q3", "Q4"], need: ["I", "O", "Q1"],
        padNames: { I: "feedline input", O: "feedline output", Q1: "qubit 1 island", Q2: "qubit 2 island", Q3: "qubit 3 island", Q4: "qubit 4 island" },
        padText: "The ground plane layer is a film covering the whole chip: what you draw on it are the openings etched into it. Draw the metal (feedline, resonators, qubit pads) on the circuit layer, inside those openings, leaving a gap to the ground. Name the two ends of the feedline I and O with the Pad tool, and put a pad label Q1, Q2, ... on each qubit's island. Resonators are half-wave lines that float: they must not touch the ground. Draw each Josephson junction on the junction layer as a thin strip (about 0.2 µm wide) that bridges from the qubit island to the ground or to the qubit's other pad.",
        materials: { groundplane: ["al", "nb", "ta", "tin"], circuit: ["al", "nb", "ta", "tin"], junction: ["dolan", "manhattan"], airbridge: ["al"] },
        defaults: { groundplane: "nb", circuit: "nb", junction: "dolan", airbridge: "al" }
    };

    const CULTURE_DEFAULT = { sub: "si", hf: 1, h: 0.4, ang: 25, b: 0.15, p: 10, t: 20, shield: 1, filter: "std" };


    /* ------------------------------------------------
       TEMPLATES (um; y grows down the screen)
    ------------------------------------------------ */

    function r(x, y, w, h, pad) {

        const s = { t: "r", x: x, y: y, w: w, h: h };

        if (pad) { s.pad = pad; }

        return s;
    }

    const GAP = 6;          // CPW gap
    const QGAP = 24;        // gap around a qubit island

    // A line segment from (x0, y0) to (x1, y1), w wide, as a rect, plus its opening.
    function segment(out, x0, y0, x1, y1, w) {

        // a horizontal or vertical run, extended by half a width at each end so corners join
        const m = y0 === y1 ?
            r(Math.min(x0, x1) - w / 2, y0 - w / 2, Math.abs(x1 - x0) + w, w) :
            r(x0 - w / 2, Math.min(y0, y1) - w / 2, w, Math.abs(y1 - y0) + w);

        out.metal.push(m);
        out.open.push(r(m.x - GAP, m.y - GAP, m.w + 2 * GAP, m.h + 2 * GAP));
    }

    // Half-wave resonator: a coupling run beside the feedline, a meander, and a drop to a claw above the qubit.
    function resonator(out, xc, y0, yClaw, Lt, claw) {

        const P = 60;
        const lenCouple = 60;
        const hm = yClaw - y0;
        const n = Math.max(2, Math.floor((hm - 60) / P) - 1);
        const mw = Math.max(60, (Lt - lenCouple - hm) / (2 * (n + 1)));

        segment(out, xc - lenCouple, y0, xc + mw, y0, 10);

        // join the coupling run's opening to the feedline's, so no ground sits between them
        out.open.push(r(xc - lenCouple - GAP, y0 - 25, 2 * lenCouple + 2 * GAP, 25));

        let x = xc + mw;
        let y = y0;

        for (let j = 0; j < n; j++) {

            segment(out, x, y, x, y + P, 10);
            y += P;
            segment(out, x, y, -x + 2 * xc, y, 10);
            x = 2 * xc - x;
        }

        segment(out, x, y, x, y + P, 10);
        y += P;
        segment(out, x, y, xc, y, 10);
        segment(out, xc, y, xc, yClaw, 10);

        if (claw === "u") {

            // a U-shaped claw that wraps the end of the qubit's arm
            out.metal.push(r(xc - 30, yClaw, 60, 10), r(xc - 30, yClaw, 10, 28), r(xc + 20, yClaw, 10, 28));
            out.open.push(r(xc - 36, yClaw - GAP, 72, 52));

        } else {

            out.metal.push(r(xc - 60, yClaw, 120, 10));
            out.open.push(r(xc - 66, yClaw - GAP, 132, 10 + 2 * GAP + 4));
        }

        return mw;
    }

    function xmon(out, xc, yc, L, label, jw) {

        out.metal.push(r(xc - L, yc - 12, 2 * L, 24, label));
        out.metal.push(r(xc - 12, yc - L, 24, 2 * L));
        out.open.push(r(xc - L - QGAP, yc - 12 - QGAP, 2 * L + 2 * QGAP, 24 + 2 * QGAP));
        out.open.push(r(xc - 12 - QGAP, yc - L - QGAP, 24 + 2 * QGAP, 2 * L + 2 * QGAP));

        // junction from the bottom arm to the ground
        out.jj.push(r(xc - jw / 2, yc + L - 4, jw, QGAP + 8));
    }

    function doublePad(out, xc, yTop, label, jw) {

        const W = 360;
        const H = 110;
        const s = 30;

        out.metal.push(r(xc - W / 2, yTop, W, H, label));
        out.metal.push(r(xc - W / 2, yTop + H + s, W, H));
        out.open.push(r(xc - W / 2 - 50, yTop - 50, W + 100, 2 * H + s + 100));

        // junction across the gap between the two pads
        out.jj.push(r(xc - jw / 2, yTop + H - 4, jw, s + 8));
    }

    function geometry(p) {

        const N = p.N;
        const S = p.S;
        const x0 = 650;
        const W = 2 * x0 + (N - 1) * S;
        const FY = 300;
        const L = 150;
        const yClaw = 1650;
        const out = { metal: [], open: [], jj: [], br: [] };

        // feedline and launch pads
        out.metal.push(r(250, FY - 5, W - 500, 10));
        out.open.push(r(250, FY - 11, W - 500, 22));
        out.metal.push(r(60, FY - 100, 200, 200, "I"));
        out.open.push(r(20, FY - 140, 280, 280));
        out.metal.push(r(W - 260, FY - 100, 200, 200, "O"));
        out.open.push(r(W - 300, FY - 140, 280, 280));

        let H = 0;

        for (let k = 0; k < N; k++) {

            const xc = x0 + k * S;
            const Lt = p.L0 * (1 - 0.014 * k);
            const jw = p.jw[k % p.jw.length];

            resonator(out, xc, FY + 30, yClaw, Lt, p.style === "pads" ? "bar" : "u");

            if (p.style === "pads") {

                doublePad(out, xc, yClaw + 40, "Q" + (k + 1), jw);
                H = yClaw + 40 + 250 + 350;

            } else {

                const yc = yClaw + 18 + L;

                xmon(out, xc, yc, L, "Q" + (k + 1), jw);
                H = yc + L + 350;

                // a coupling line between neighbouring qubits' arms
                if (k < N - 1) {

                    const xa = xc + L;
                    const xb = xc + S - L;
                    const xm = (xa + xb) / 2;

                    out.metal.push(r(xa - 2, yc - 5, xm - 20 - xa + 2, 10));
                    out.metal.push(r(xm + 20, yc - 5, xb + 2 - xm - 20, 10));
                    out.open.push(r(xa, yc - 25, xb - xa, 50));

                    // airbridges tie the ground above the coupling line to the ground below it
                    out.br.push(r(xa + 40, yc - 40, 10, 80), r(xb - 50, yc - 40, 10, 80));
                }
            }
        }

        // the chip edge (part of the ground)
        out.metal.push(r(0, 0, W, 10), r(0, H - 10, W, 10), r(0, 0, 10, H), r(W - 10, 0, 10, H));

        return out;
    }

    const PRESETS = {
        "xmon-1": { N: 1, S: 0, style: "xmon", L0: 8500, jw: [0.24] },
        "xmon-4": { N: 4, S: 700, style: "xmon", L0: 8500, jw: [0.25, 0.34, 0.3, 0.31] },
        "pads-1": { N: 1, S: 0, style: "pads", L0: 8500, jw: [0.2] }
    };

    function film(role, name, material, shapes) {

        const l = E.newLayer(role, { name: name, material: material, shapes: shapes, thickness: role === "junction" ? 0.1 : role === "airbridge" ? 0.3 : 0.15 });

        l.mask.type = "chrome";

        if (role === "groundplane" || role === "circuit") {

            l.mask.type = "chrome";
            l.litho.method = "etch";
            l.litho.resist = "az";
            l.litho.tResist = 1.5;

            const want = E.requiredField("positive", "etch");
            const rs = root.SCLab.RESISTS.az;

            l.mask.field = l.mode === "cut" ? (want === "dark" ? "clear" : "dark") : want;
            l.litho.dose = Math.round(rs.dose(1.5));
            l.litho.dev = Math.round(rs.dev(1.5));
        }

        return l;
    }

    function buildTemplate(kind, name) {

        const culture = Object.assign({}, CULTURE_DEFAULT);

        if (name === "blank" || !PRESETS[name]) {

            return {
                id: E.uid("D"), name: "", kind: kind, electrolyte: "acid", grid: 5, culture: culture,
                layers: [film("groundplane", "Ground plane", "nb", []), film("circuit", "Circuit metal", "nb", []), film("junction", "Junctions", "dolan", [])]
            };
        }

        const g = geometry(PRESETS[name]);

        return {
            id: E.uid("D"), name: "", kind: kind, electrolyte: "acid", grid: 5, culture: culture,
            layers: [
                film("groundplane", "Ground plane", "nb", g.open),
                film("circuit", "Circuit metal", "nb", g.metal),
                film("junction", "Junctions", "dolan", g.jj)
            ].concat(g.br.length ? [film("airbridge", "Airbridges", "al", g.br)] : [])
        };
    }

    const TEMPLATES = [
        { id: "xmon-1", name: "One Xmon qubit", blurb: "A cross-shaped transmon grounded through one junction, a half-wave readout resonator and a feedline, on niobium." },
        { id: "xmon-4", name: "Four coupled Xmon qubits", blurb: "Four Xmons in a row, each with its own resonator, coupled to their neighbours by short lines. Junction widths alternate to stagger the frequencies." },
        { id: "pads-1", name: "One double-pad transmon", blurb: "A floating transmon: two large pads joined by one junction, with a readout resonator and a feedline." },
        { id: "blank", name: "Blank (draw everything yourself)", blurb: "An empty ground plane, circuit layer and junction layer." }
    ];


    /* ------------------------------------------------
       CHECKS (before fabrication)
    ------------------------------------------------ */

    function check(design, out, labels) {

        const jl = design.layers.filter(function (l) { return l.role === "junction"; });
        const nj = jl.reduce(function (s, l) { return s + l.shapes.length; }, 0);

        if (!nj) { out.push({ level: "error", text: "There are no Josephson junctions. Draw each one as a thin strip on a junction layer, bridging the qubit island to the ground or to its other pad." }); }

        if (!design.layers.some(function (l) { return l.role === "groundplane" && l.shapes.length; })) {

            out.push({ level: "warn", text: "No openings are drawn in the ground plane, so the whole chip is covered by one sheet of metal: every line would be shorted to the ground." });
        }

        jl.forEach(function (l) {

            l.shapes.forEach(function (s) {

                const info = G.shapeInfo(s);

                if (info.minDim > 1) { out.push({ level: "warn", text: l.name + ": a junction strip is " + info.minDim.toFixed(2) + " µm wide. Qubit junctions are about 0.1 to 0.3 µm wide; this one would have a huge critical current and a very high frequency." }); }
            });
        });

        const c = cleanCulture(design.culture);
        const ov = 2 * c.h * Math.tan(c.ang * Math.PI / 180) - c.b;

        if (jl.some(function (l) { return l.material === "dolan"; }) && ov <= 0) {

            out.push({ level: "error", text: "With this bridge height, angle and bridge width the two evaporations don't overlap under the bridge: every Dolan junction would be open. Raise the angle or the resist height, or narrow the bridge." });
        }

        Object.keys(labels).forEach(function (lab) {

            if (labels[lab] > 1) { out.push({ level: "error", text: "The pad label " + lab + " is used " + labels[lab] + " times. Each label names one net." }); }
        });
    }


    /* ------------------------------------------------
       PROCESS SETTINGS
    ------------------------------------------------ */

    function cleanCulture(raw, num) {

        raw = raw && typeof raw === "object" ? raw : {};

        const n = num || function (v, lo, hi, d) { const x = Number(v); return isFinite(x) ? Math.max(lo, Math.min(hi, x)) : d; };

        return {
            sub: SUBSTRATES[raw.sub] ? raw.sub : CULTURE_DEFAULT.sub,
            hf: raw.hf === 0 || raw.hf === false ? 0 : 1,
            h: n(raw.h, 0.1, 1.5, CULTURE_DEFAULT.h),
            ang: n(raw.ang, 0, 50, CULTURE_DEFAULT.ang),
            b: n(raw.b, 0.05, 0.5, CULTURE_DEFAULT.b),
            p: n(raw.p, 0.1, 100, CULTURE_DEFAULT.p),
            t: n(raw.t, 1, 60, CULTURE_DEFAULT.t),
            shield: raw.shield === 0 || raw.shield === false ? 0 : 1,
            filter: raw.filter === "extra" ? "extra" : "std"
        };
    }

    // Specific resistance of the barrier (ohm um^2) from the oxygen exposure (mbar s). Illustrative calibration.
    function barrierRA(c) { return 10 * Math.pow(c.p * c.t * 60, 0.4); }

    function shadowOverlap(c) { return 2 * c.h * Math.tan(c.ang * Math.PI / 180) - c.b; }


    /* ------------------------------------------------
       PHYSICS HELPERS
    ------------------------------------------------ */

    // Complete elliptic integral of the first kind (arithmetic-geometric mean).
    function ellipK(k) {

        let a = 1;
        let b = Math.sqrt(Math.max(0, 1 - k * k));

        for (let i = 0; i < 10; i++) { const an = (a + b) / 2; b = Math.sqrt(a * b); a = an; }

        return Math.PI / (2 * a);
    }

    // Capacitance per unit length across one gap g between coplanar conductors of width w (F/m):
    // half of a coplanar waveguide's 4 eps0 epsEff K(k)/K(k'), with k = w / (w + 2g).
    function edgeCap(gUm, wUm, epsEff) {

        const k = wUm / (wUm + 2 * Math.max(gUm, 0.3));

        return 2 * EPS0 * epsEff * ellipK(k) / ellipK(Math.sqrt(1 - k * k));
    }

    // Charging energy (GHz) from total capacitance (fF).
    function ecOf(cfF) { return 19.37 / Math.max(cfF, 0.1); }

    // Josephson energy (GHz) from the cold normal resistance (ohm), Ambegaokar-Baratoff.
    function ejOf(rn) { const ic = Math.PI * DELTA_AL / (2 * rn); return ic / (4 * Math.PI * 1.602e-19) / 1e9; }

    function icOf(rn) { return Math.PI * DELTA_AL / (2 * rn); }

    function transmon(ej, ec) {

        const ratio = ej / ec;

        if (ratio < 1) { return { f01: ej, alpha: 0, ratio: ratio }; }

        return { f01: Math.sqrt(8 * ej * ec) - ec, alpha: -ec, ratio: ratio };
    }

    // Koch et al. 2007: charge dispersion of the 0-1 transition (GHz).
    function chargeDispersion(ej, ec) {

        const r = ej / ec;
        const e = Math.exp(-Math.sqrt(8 * r));
        const c = Math.sqrt(2 / Math.PI);

        return Math.abs(512 * c * Math.pow(r / 2, 1.25) * e - 32 * c * Math.pow(r / 2, 0.75) * e) * ec;
    }


    // Exact area of a union of axis-aligned rectangles (sweep over x).
    function unionRectArea(rs) {

        const xs = [];

        rs.forEach(function (q) { xs.push(q.x, q.x + q.w); });
        xs.sort(function (a, b) { return a - b; });

        let area = 0;

        for (let k = 0; k + 1 < xs.length; k++) {

            const xa = xs[k];
            const xb = xs[k + 1];

            if (xb - xa <= 0) { continue; }

            const iv = rs.filter(function (q) { return q.x < xb && q.x + q.w > xa; }).map(function (q) { return [q.y, q.y + q.h]; }).sort(function (a, b) { return a[0] - b[0]; });

            let len = 0;
            let cur = null;

            iv.forEach(function (v) {

                if (!cur || v[0] > cur[1]) { if (cur) { len += cur[1] - cur[0]; } cur = [v[0], v[1]]; } else { cur[1] = Math.max(cur[1], v[1]); }
            });

            if (cur) { len += cur[1] - cur[0]; }

            area += len * (xb - xa);
        }

        return area;
    }


    /* ------------------------------------------------
       ANALYSIS
    ------------------------------------------------ */

    function analyze(ctx) {

        const design = ctx.design;
        const per = ctx.per;
        const P = ctx.P;
        const frame = ctx.frame;
        const px = ctx.px;
        const n = ctx.n;
        const W = frame.w;
        const H = frame.h;
        const notes = ctx.notes;
        const gauss = ctx.gauss;
        const culture = cleanCulture(design.culture);
        const sub = SUBSTRATES[culture.sub];
        const epsEff = (sub.eps + 1) / 2;

        ctx.mark("qubit-start");

        const dev = { status: "ok", reason: "", qubits: [], resonators: [], pairs: [], problems: [], culture: culture, substrate: culture.sub, epsEff: epsEff };

        // Net of every pixel (root id + 1, 0 = bare substrate).
        const net = new Int32Array(n);

        for (let i = 0; i < n; i++) {

            for (let k = per.length - 1; k >= 0; k--) {

                if (ctx.conductive[k] && P[k][i]) { net[i] = ctx.nodeAt(k, i) + 1; break; }
            }
        }

        // Airbridges join the metal under their two feet.
        const netAtUm = function (x, y) {

            const i = Math.floor((x - frame.x0) / px);
            const j = Math.floor((y - frame.y0) / px);

            for (let rr = 0; rr <= 1; rr++) {

                for (let dj = -rr; dj <= rr; dj++) {

                    for (let di = -rr; di <= rr; di++) {

                        const ii = i + di;
                        const jj = j + dj;

                        if (ii >= 0 && jj >= 0 && ii < W && jj < H && net[jj * W + ii]) { return net[jj * W + ii]; }
                    }
                }
            }

            return 0;
        };

        const parent = {};
        const findN = function (x) { while (parent[x] !== undefined && parent[x] !== x) { x = parent[x]; } return x; };
        const bridges = [];

        per.forEach(function (q, k) {

            if (q.layer.role !== "airbridge") { return; }

            if (q.p.status === "lost") { dev.problems.push("Airbridge layer “" + q.layer.name + "”: " + q.p.notes.join(" ")); return; }

            ctx.shapesOf[k].forEach(function (s) {

                const b = G.bboxOf([s]);
                const vertical = b.y1 - b.y0 >= b.x1 - b.x0;
                const inset = Math.min(3, Math.max(b.x1 - b.x0, b.y1 - b.y0) / 5);
                const e0 = vertical ? [(b.x0 + b.x1) / 2, b.y0 + inset] : [b.x0 + inset, (b.y0 + b.y1) / 2];
                const e1 = vertical ? [(b.x0 + b.x1) / 2, b.y1 - inset] : [b.x1 - inset, (b.y0 + b.y1) / 2];
                const na = findN(netAtUm(e0[0], e0[1]));
                const nc = findN(netAtUm(e1[0], e1[1]));
                const br = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, ok: !!(na && nc) };

                bridges.push(br);

                if (na && nc && na !== nc) { parent[Math.max(na, nc)] = Math.min(na, nc); }
            });
        });

        if (Object.keys(parent).length) { for (let i = 0; i < n; i++) { if (net[i]) { net[i] = findN(net[i]); } } }

        dev.bridges = bridges;

        if (bridges.some(function (x) { return !x.ok; })) { dev.problems.push("An airbridge has a foot on bare substrate, so it connects nothing."); }

        const count = {};

        for (let i = 0; i < n; i++) { if (net[i]) { count[net[i]] = (count[net[i]] || 0) + 1; } }

        const ids = Object.keys(count).map(Number).filter(function (id) { return count[id] >= 3; });

        if (!ids.length) {

            return finishFail(ctx, dev, "No superconducting metal survived the process.");
        }

        let ground = ids[0];

        ids.forEach(function (id) { if (count[id] > count[ground]) { ground = id; } });

        // Pad labels to nets.
        const labelNet = {};

        Object.keys(ctx.netLabel).forEach(function (rt) { Object.keys(ctx.netLabel[rt]).forEach(function (lab) { labelNet[lab] = findN(Number(rt) + 1); }); });

        // Which film is each net made of (for surface loss), and which layer printed worst.
        const filmOf = {};

        per.forEach(function (q, k) {

            if (!ctx.conductive[k]) { return; }

            for (let i = 0; i < n; i += 7) { if (P[k][i] && net[i] && !filmOf[net[i]]) { filmOf[net[i]] = { mat: q.layer.material, residue: q.p.residue, quality: q.p.quality }; } }
        });

        ctx.mark("nets");

        /* ---------- capacitance between nets ---------- */

        // Each edge pixel looks straight out, away from its own metal, to the first metal it faces.
        // The edge capacitance across that gap is shared half and half between the two edges.
        const Cpair = {};
        const gapSum = {};
        const gapLen = {};
        const maxSteps = Math.ceil(200 / px);
        const maxW = Math.ceil(300 / px);
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        const addC = function (a, b, c) {

            const key = a < b ? a + ":" + b : b + ":" + a;

            Cpair[key] = (Cpair[key] || 0) + c;
        };

        // extent of a net through pixel (i, j) along the direction (si, sj), both ways
        const span = function (i, j, si, sj, id) {

            let t = 1;

            for (let sgn = -1; sgn <= 1; sgn += 2) {

                let x = i + sgn * si;
                let y = j + sgn * sj;

                while (t < maxW && x >= 0 && y >= 0 && x < W && y < H && net[y * W + x] === id) { t++; x += sgn * si; y += sgn * sj; }
            }

            return t;
        };

        for (let j = 1; j < H - 1; j++) {

            for (let i = 1; i < W - 1; i++) {

                const q = j * W + i;
                const self = net[q];

                if (!self) { continue; }

                for (let d = 0; d < 4; d++) {

                    const di = dirs[d][0];
                    const dj = dirs[d][1];

                    if (net[q + dj * W + di]) { continue; }

                    let ii = i;
                    let jj = j;

                    for (let k = 1; k <= maxSteps; k++) {

                        ii += di;
                        jj += dj;

                        if (ii < 0 || jj < 0 || ii >= W || jj >= H) { break; }

                        const other = net[jj * W + ii];

                        if (!other) { continue; }

                        if (other !== self) {

                            const gapUm = Math.max(0.3 * px, (k - 1) * px);

                            // widths of the two conductors along the ray (the narrower one sets the field)
                            let ts = 1;
                            let to = 1;

                            while (ts < maxW && i - di * ts >= 0 && j - dj * ts >= 0 && i - di * ts < W && j - dj * ts < H && net[(j - dj * ts) * W + i - di * ts] === self) { ts++; }
                            while (to < maxW && ii + di * to >= 0 && jj + dj * to >= 0 && ii + di * to < W && jj + dj * to < H && net[(jj + dj * to) * W + ii + di * to] === other) { to++; }

                            // the end of a narrow line faces only its own width, however long the line is
                            const wd = Math.min(ts, to, span(i, j, -dj, di, self), span(ii, jj, -dj, di, other));

                            const c = 0.5 * px * 1e-6 * edgeCap(gapUm, wd * px, epsEff) * 1e15;          // fF

                            addC(self, other, c);
                            gapSum[self] = (gapSum[self] || 0) + gapUm * c;
                            gapLen[self] = (gapLen[self] || 0) + c;
                        }

                        break;
                    }
                }
            }
        }

        const C = function (a, b) {

            if (a === b) { return 0; }

            return Cpair[a < b ? a + ":" + b : b + ":" + a] || 0;
        };

        const Ctot = function (a, except) {

            let s = 0;

            ids.forEach(function (x) { if (x !== a && (!except || except.indexOf(x) < 0)) { s += C(a, x); } });

            return s;
        };

        const meanGap = function (id) { return gapLen[id] ? gapSum[id] / gapLen[id] : 20; };

        dev.caps = Cpair;
        dev.groundNet = ground;

        ctx.mark("capacitance");

        /* ---------- feedline ---------- */

        const feedI = labelNet.I;
        const feedO = labelNet.O;
        let feed = 0;

        if (!feedI || !feedO) {

            dev.problems.push("The feedline needs working pads at both ends, I and O.");

        } else if (feedI !== feedO) {

            dev.problems.push("The feedline is broken: pads I and O are not connected, so no signal gets through the chip.");

        } else if (feedI === ground) {

            dev.problems.push("The feedline touches the ground plane: it is shorted, so the readout signal never reaches the resonators.");

        } else {

            feed = feedI;
        }

        dev.feedNet = feed;

        /* ---------- junctions ---------- */

        const jjLayers = [];

        per.forEach(function (q, k) { if (q.layer.role === "junction") { jjLayers.push(k); } });

        const ov0 = shadowOverlap(culture);
        const RA = barrierRA(culture) * (1 + 0.02 * gauss());         // one oxidation per wafer
        const junctions = [];

        jjLayers.forEach(function (k) {

            const q = per[k];
            const jt = JUNCTIONS[q.layer.material] || JUNCTIONS.dolan;

            if (q.p.status === "lost") { dev.problems.push("Junction layer “" + q.layer.name + "”: " + q.p.notes.join(" ")); return; }

            ctx.shapesOf[k].forEach(function (s) {

                const b = G.bboxOf([s]);
                const w = b.x1 - b.x0;
                const h = b.y1 - b.y0;
                const vertical = h >= w;
                const wNom = Math.min(w, h);
                const inset = Math.min(1, Math.max(w, h) / 4);
                const ends = vertical ? [[(b.x0 + b.x1) / 2, b.y0 + inset], [(b.x0 + b.x1) / 2, b.y1 - inset]] : [[b.x0 + inset, (b.y0 + b.y1) / 2], [b.x1 - inset, (b.y0 + b.y1) / 2]];
                const a = netAtUm(ends[0][0], ends[0][1]);
                const c = netAtUm(ends[1][0], ends[1][1]);
                const wEff = Math.max(0.01, wNom + gauss() * jt.rough * Math.SQRT2);
                const ov = q.layer.material === "manhattan" ? Math.max(0.01, wNom + gauss() * jt.rough * Math.SQRT2) : ov0 + gauss() * 0.004;
                const area = ov > 0 ? wEff * ov : 0;
                const rn = area > 0 ? RA * (1 + 0.01 * gauss()) / area : Infinity;
                const jj = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, w: wEff, wNom: wNom, overlap: ov, area: area, rnRoom: rn, rnCold: rn * COLD_RISE, a: a, b: c, ok: true, why: "" };

                if (!a || !c) { jj.ok = false; jj.why = "a lead lands on bare substrate instead of metal"; }
                else if (a === c) { jj.ok = false; jj.why = "both leads land on the same piece of metal, so it is shorted"; }
                else if (area <= 0) { jj.ok = false; jj.why = "the two evaporations don't overlap under the bridge"; }

                junctions.push(jj);
            });
        });

        dev.junctions = junctions;

        /* ---------- qubits ---------- */

        const used = {};

        used[ground] = true;

        if (feed) { used[feed] = true; }

        const qLabels = ["Q1", "Q2", "Q3", "Q4"].filter(function (l) { return labelNet[l]; });

        if (!qLabels.length) { dev.problems.push("No qubit island is labelled. Put a pad label Q1 on the metal of each qubit."); }

        const surf = function (id, f) {

            const fm = filmOf[id] || { mat: "nb", residue: 0, quality: 1 };
            const tan = FILMS[fm.mat].tanS * (culture.hf ? 0.7 : 1) * (1 + 3 * fm.residue) * (fm.quality < 0.5 ? 1.3 : 1);
            const p = Math.min(0.02, 5e-4 * 20 / meanGap(id));

            return { p: p, tan: tan, Q: 1 / (p * tan), mat: fm.mat };
        };

        const surfaceT1 = function (s, f) { return s.Q / (2 * Math.PI * f * 1e9) * 1e6; };

        qLabels.forEach(function (lab) {

            const A = labelNet[lab];
            const qb = { label: lab, net: A, ok: false, problem: "", junctions: [] };

            dev.qubits.push(qb);

            if (A === ground) { qb.problem = "The island touches the ground plane, so the junction is shorted and there is no qubit."; return; }
            if (A === feed) { qb.problem = "The island is connected to the feedline."; return; }

            const mine = junctions.filter(function (j) { return j.ok && (j.a === A || j.b === A); });
            const bad = junctions.filter(function (j) { return !j.ok && (j.a === A || j.b === A); });

            qb.junctions = mine.concat(bad);

            if (!mine.length) {

                qb.problem = bad.length ? "Its junction failed: " + bad[0].why + "." : "No junction connects this island to anything: without one it is just a capacitor.";
                return;
            }

            const partner = mine[0].a === A ? mine[0].b : mine[0].a;
            const par = mine.filter(function (j) { return (j.a === A ? j.b : j.a) === partner; });

            qb.grounded = partner === ground;
            qb.partner = partner;
            qb.tunable = par.length >= 2;

            used[A] = true;
            used[partner] = true;

            // Junctions in parallel add their Josephson energies.
            let ej = 0;
            let rnRoom = 0;

            par.forEach(function (j) { ej += ejOf(j.rnCold); rnRoom += 1 / j.rnRoom; });

            qb.rnRoom = 1 / rnRoom;
            qb.ej = ej;

            // Capacitance and the effective coupling to every other net.
            const ceff = {};
            let csum;

            if (qb.grounded) {

                csum = Ctot(A);
                ids.forEach(function (x) { if (x !== A && x !== ground) { ceff[x] = C(A, x); } });

            } else {

                const B = partner;
                const cat = Ctot(A, [B]);
                const cbt = Ctot(B, [A]);

                csum = C(A, B) + (cat * cbt) / Math.max(cat + cbt, 1e-6);
                ids.forEach(function (x) {

                    if (x === A || x === B || x === ground) { return; }

                    ceff[x] = Math.abs(C(A, x) * cbt - C(B, x) * cat) / Math.max(cat + cbt, 1e-6);
                });
            }

            qb.csum = csum;
            qb.ceff = ceff;
            qb.ec = ecOf(csum);

            const tr = transmon(ej, qb.ec);

            qb.f01 = tr.f01;
            qb.alpha = tr.alpha;
            qb.ratio = tr.ratio;
            qb.disp = chargeDispersion(ej, qb.ec);
            qb.ok = tr.f01 > 0.5;

            if (!qb.ok) { qb.problem = "The Josephson energy is far too small for this capacitance: no usable qubit transition."; }

            // where the island is, for the chip map
            let sx = 0;
            let sy = 0;
            let sn = 0;

            for (let i = 0; i < n; i += 3) { if (net[i] === A) { sx += i % W; sy += Math.floor(i / W); sn++; } }

            qb.x = sn ? frame.x0 + (sx / sn + 0.5) * px : 0;
            qb.y = sn ? frame.y0 + (sy / sn + 0.5) * px : 0;
            qb.surf = surf(A);
            qb.mat = qb.surf.mat;
        });

        /* ---------- resonators ---------- */

        const circuitShapes = [];

        per.forEach(function (q, k) { if (q.layer.role === "circuit") { ctx.shapesOf[k].forEach(function (s) { circuitShapes.push(s); }); } });

        let islands = 0;
        const padded = {};

        Object.keys(labelNet).forEach(function (lab) { padded[labelNet[lab]] = true; });

        ids.forEach(function (id) {

            if (used[id] || padded[id]) { return; }

            // the rectangles that belong to this net: their exact union area and typical width
            const widths = [];
            const mine = [];
            let other = false;

            circuitShapes.forEach(function (s) {

                const b = G.bboxOf([s]);

                if (netAtUm((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2) !== id) { return; }

                if (s.t === "r") { widths.push(Math.min(s.w, s.h)); mine.push(s); } else { other = true; }
            });

            const area = mine.length && !other ? unionRectArea(mine) : count[id] * px * px;

            // a piece of the ground plane cut off from the rest: it floats
            if (!mine.length && !other) {

                if (count[id] * px * px > 400) { islands++; }

                return;
            }

            widths.sort(function (a, b) { return a - b; });

            const w = widths.length ? widths[Math.floor(widths.length / 2)] : 10;
            const len = area / w;

            if (len / w < 25) {

                if (area > 400) { dev.problems.push("A floating piece of metal (" + Math.round(area) + " µm²) is neither a qubit nor a resonator. Floating metal can ring at its own frequency and steal energy."); }

                return;
            }

            const cr = Ctot(id);
            const ck = feed ? C(id, feed) : 0;
            const f0 = C_LIGHT / (2 * len * 1e-6 * Math.sqrt(epsEff)) / 1e9;
            const s = surf(id);

            // the pocket of the resonator: field split between surface and substrate
            const qiInv = s.p * s.tan + 0.9 * sub.tan;

            let sx = 0;
            let sn = 0;

            for (let i = 0; i < n; i += 5) { if (net[i] === id) { sx += i % W; sn++; } }

            const res = { net: id, len: len, w: w, cr: cr, ck: ck, f0: f0, qi: 1 / qiInv, surf: s, x: sn ? frame.x0 + (sx / sn + 0.5) * px : 0 };

            dev.resonators.push(res);
        });

        if (islands) { dev.problems.push((islands === 1 ? "A piece" : islands + " pieces") + " of the ground plane " + (islands === 1 ? "is" : "are") + " cut off from the rest by lines and openings. A floating island of ground can ring like a stray resonator and steal energy: tie it to the main ground with airbridges."); }

        // Load each resonator with its couplings, then its coupling Q to the feedline.
        dev.resonators.forEach(function (res) {

            let cg = 0;

            dev.qubits.forEach(function (qb) { if (qb.ok) { cg += qb.ceff[res.net] || 0; } });

            res.fr = res.f0 * (1 - (res.ck + cg) / Math.max(res.cr, 1e-3));

            const wck = 2 * Math.PI * res.fr * 1e9 * res.ck * 1e-15 * Z0;

            res.qc = res.ck > 0.001 ? 2 * Math.PI / (wck * wck) : 1e9;
            res.q = 1 / (1 / res.qc + 1 / res.qi);
            res.kappa = res.fr * 1e3 / res.qc;                  // MHz, coupling part of the linewidth
            res.lw = res.fr * 1e3 / res.q;                      // MHz, full linewidth
        });

        /* ---------- coupling, readout and losses ---------- */

        const nth = culture.filter === "extra" ? 3e-4 : 2e-3;
        const tQP = culture.shield ? 3000 : 200;                 // us

        dev.qubits.forEach(function (qb) {

            if (!qb.ok) { return; }

            let best = null;

            dev.resonators.forEach(function (res) {

                const c = qb.ceff[res.net] || 0;

                if (!best || c > best.c) { best = { res: res, c: c }; }
            });

            const f = qb.f01;
            const parts = {};

            qb.Tsurf = surfaceT1(qb.surf, f);
            parts.surface = qb.Tsurf;
            parts.substrate = 1 / (0.9 * sub.tan) / (2 * Math.PI * f * 1e9) * 1e6;
            parts.qp = tQP;

            if (islands) { parts.islands = 400 / islands; }

            if (best && best.c > 0.01) {

                const res = best.res;
                const g = best.c / (2 * Math.sqrt(qb.csum * res.cr / 2)) * Math.sqrt(f * res.fr);
                const delta = f - res.fr;
                const al = qb.alpha;

                qb.res = res;
                qb.g = g;
                qb.delta = delta;
                qb.chi = Math.abs(delta) > 1e-3 && Math.abs(delta + al) > 1e-3 ? g * g * al / (delta * (delta + al)) : NaN;
                parts.purcell = Math.abs(delta) > 1e-3 ? 1 / (2 * Math.PI * res.kappa * 1e6 * (g / delta) * (g / delta)) * 1e6 : 1e-3;

                res.qubit = qb.label;

                if (Math.abs(delta) < 5 * g) { qb.warn = "The qubit is only " + Math.round(Math.abs(delta) * 1000) + " MHz from its resonator (g = " + Math.round(g * 1000) + " MHz): they mix strongly, readout is not dispersive and the qubit decays through the resonator."; }

            } else {

                qb.res = null;
                qb.warn = "No readout resonator is coupled to this qubit, so it can't be measured.";
            }

            // direct leakage into the feedline
            const cqf = feed ? (qb.ceff[feed] || 0) : 0;

            if (cqf > 0.001) {

                const w = 2 * Math.PI * f * 1e9;

                parts.feedline = (qb.csum * 1e-15) / (w * w * cqf * 1e-15 * cqf * 1e-15 * Z0 / 2) * 1e6;
            }

            let inv = 0;

            Object.keys(parts).forEach(function (k) { inv += 1 / parts[k]; });

            qb.T1parts = parts;
            qb.T1 = 1 / inv;

            // dephasing
            const tphiParts = {};

            if (qb.res && isFinite(qb.chi)) {

                const kap = 2 * Math.PI * qb.res.lw * 1e6;
                const chi2 = 2 * Math.PI * 2 * Math.abs(qb.chi) * 1e9;
                const rate = nth * kap * chi2 * chi2 / (kap * kap + chi2 * chi2);

                tphiParts.photons = rate > 0 ? 1e6 / rate : Infinity;
            }

            if (qb.tunable) { tphiParts.flux = 200; }

            const lf = 250;

            let pinv = 0;

            Object.keys(tphiParts).forEach(function (k) { pinv += 1 / tphiParts[k]; });

            qb.Tphi = tphiParts;
            qb.T2E = 1 / (1 / (2 * qb.T1) + pinv * 0.9);
            qb.T2s = 1 / (1 / (2 * qb.T1) + pinv + 1 / lf);

            if (qb.ratio < 20) { qb.warn = (qb.warn ? qb.warn + " " : "") + "The Josephson energy is only " + qb.ratio.toFixed(0) + " times the charging energy: the qubit is sensitive to stray charge (a Cooper-pair box rather than a transmon)."; }
        });

        /* ---------- qubit pairs and collisions ---------- */

        const good = dev.qubits.filter(function (q) { return q.ok; });

        for (let a = 0; a < good.length; a++) {

            for (let b = a + 1; b < good.length; b++) {

                const qa = good[a];
                const qbb = good[b];
                const c = Math.max(qa.ceff[qbb.net] || 0, qbb.ceff[qa.net] || 0, C(qa.net, qbb.net));

                if (c < 0.02) { continue; }

                const J = c / (2 * Math.sqrt(qa.csum * qbb.csum)) * Math.sqrt(qa.f01 * qbb.f01);
                const d = qa.f01 - qbb.f01;
                const pr = { a: qa.label, b: qbb.label, c: c, J: J, detune: d, collide: "" };

                if (Math.abs(d) < 0.017) { pr.collide = "same frequency (within 17 MHz)"; }
                else if (Math.abs(qa.f01 - (qbb.f01 + qbb.alpha)) < 0.02 || Math.abs(qbb.f01 - (qa.f01 + qa.alpha)) < 0.02) { pr.collide = "one qubit's 0→1 matches the other's 1→2"; }
                else if (Math.abs(d) < 3 * Math.abs(J)) { pr.collide = "detuning smaller than three times the coupling: the qubits hybridise"; }

                dev.pairs.push(pr);
            }
        }

        dev.collisions = dev.pairs.filter(function (p) { return p.collide; }).length;

        // resonators that overlap on the shared feedline
        const rs = dev.resonators.filter(function (x) { return x.qc < 1e8; }).slice().sort(function (a, b) { return a.fr - b.fr; });

        for (let k = 1; k < rs.length; k++) {

            if ((rs[k].fr - rs[k - 1].fr) * 1e3 < 3 * Math.max(rs[k].lw, rs[k - 1].lw, 1)) { dev.problems.push("Two readout resonators sit within a few linewidths of each other (" + rs[k - 1].fr.toFixed(3) + " and " + rs[k].fr.toFixed(3) + " GHz): their dips overlap on the feedline."); }
        }

        /* ---------- what the chip looks like (for the chip map) ---------- */

        const gpk = per.findIndex(function (q) { return q.layer.role === "groundplane"; });
        const cik = per.findIndex(function (q) { return q.layer.role === "circuit"; });

        dev.draw = {
            box: ctx.box,
            openings: gpk >= 0 ? ctx.shapesOf[gpk] : [],
            metal: cik >= 0 ? ctx.shapesOf[cik] : [],
            junctions: junctions.map(function (j) { return { x: j.x, y: j.y, ok: j.ok }; })
        };

        dev.chip = { w: ctx.box.x1 - ctx.box.x0, h: ctx.box.y1 - ctx.box.y0 };

        // box mode of the chip in its enclosure
        dev.boxMode = C_LIGHT / (2 * Math.sqrt((sub.eps + 1) / 2)) * Math.sqrt(1 / Math.pow(dev.chip.w * 1e-6, 2) + 1 / Math.pow(dev.chip.h * 1e-6, 2)) / 1e9;

        /* ---------- verdict ---------- */

        const working = good.filter(function (q) { return q.res; });

        if (!feed) {

            dev.status = feedI && feedO && feedI === ground ? "short" : "open";
            dev.reason = dev.problems[0] || "The feedline doesn't work.";

        } else if (!working.length) {

            dev.status = dev.qubits.some(function (q) { return /ground plane/.test(q.problem); }) ? "short" : "open";
            dev.reason = (dev.qubits.filter(function (q) { return q.problem; })[0] || {}).problem || dev.qubits.filter(function (q) { return q.warn; }).map(function (q) { return q.warn; })[0] || "No working, readable qubit on the chip.";
        }

        dev.problems.forEach(function (t) { notes.push(t); });

        ctx.mark("qubit-done");

        return ctx.finish(dev);
    }

    function finishFail(ctx, dev, why) {

        dev.status = "open";
        dev.reason = why;

        return ctx.finish(dev);
    }


    E.registerKind("qubit", { analyze: analyze, buildTemplate: buildTemplate, check: check, templates: TEMPLATES, cells: 1000000, featDiv: 4 });

    E.qubitKit = {
        FILMS: FILMS, JUNCTIONS: JUNCTIONS, SUBSTRATES: SUBSTRATES, CULTURE_DEFAULT: CULTURE_DEFAULT,
        cleanCulture: cleanCulture, barrierRA: barrierRA, shadowOverlap: shadowOverlap,
        ejOf: ejOf, icOf: icOf, ecOf: ecOf, transmon: transmon, COLD_RISE: COLD_RISE, geometry: geometry
    };

}(typeof window !== "undefined" ? window : globalThis));
