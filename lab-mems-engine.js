/* ========================================
   MEMS DEVICES: LAYOUT ANALYSIS

   Registers the "accel", "gyro" and "mirror" kinds with LabEngine. The
   layers follow a surface-micromachining process like PolyMUMPs:
   structural films (polysilicon), blanket sacrificial oxide films whose
   drawn shapes are anchor openings, optional dimples, release holes and a
   metal layer. From the fabricated layers this file finds:

   - the pieces of every structural layer (rigid blocks, thin beams, pads)
     with their area, centre of mass and how much of each is anchored or
     still held down by oxide after the HF release
   - which pieces touch, which are tied together by anchors and which
     electrical net each one is on (named by the pads you drew)
   - the heights of the layers and the gaps between them

   The mechanics (springs, resonance, forces) are in lab-mems-solver.js and
   the device tests in lab-mems-model.js.

   Needs window.LabEngine and window.LabGeom.
======================================== */

(function (root) {

    "use strict";

    const E = root.LabEngine;
    const G = root.LabGeom;

    const BEAM_W = 8;                 // widest piece (um) that is treated as a flexible beam
    const BEAM_ASPECT = 4;            // and it must be at least this many times longer than wide
    const NITRIDE = 0.6;              // um, the insulating film under everything


    /* ------------------------------------------------
       DEFAULT RELEASE SETTINGS
    ------------------------------------------------ */

    const DRY = {

        air: { name: "Dry straight from water", gamma: 0.072, adhesion: 0.02, blurb: "Water has a high surface tension: its meniscus pulls released parts down to the substrate and they stay stuck." },
        ipa: { name: "Alcohol rinse, then bake", gamma: 0.022, adhesion: 0.02, blurb: "Alcohol has about a third of water's surface tension, so much less force, but parts can still collapse." },
        scco2: { name: "Supercritical CO2 drying", gamma: 0, adhesion: 0.002, blurb: "There is no liquid-gas interface to pull on the parts, so almost nothing sticks." },
        sam: { name: "Hydrophobic coating (SAM) after release", gamma: 0.022, adhesion: 0.00002, blurb: "A thin water-repellent coating means that even parts that touch do not stay stuck." }
    };

    function defaultRelease() { return { hf: 2, dry: "ipa" }; }

    function cleanRelease(raw, num) {

        raw = raw || {};

        return {
            hf: num(raw.hf, 0.5, 12, 2),
            dry: DRY[raw.dry] ? raw.dry : "ipa"
        };
    }


    /* ------------------------------------------------
       TEMPLATE HELPERS (all lengths in um)
    ------------------------------------------------ */

    function r(x0, y0, x1, y1, pad) {

        const s = { t: "r", x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) };

        if (pad) { s.pad = pad; }

        return s;
    }

    function tr(w, pts) { return { t: "t", w: w, pts: pts }; }

    function builder(kind) {

        const layers = [];

        const mk = function (role, name, material, thickness, shapes) {

            const l = E.newLayer(role, { name: name, material: material, thickness: thickness });

            l.shapes = shapes;
            l.mask.type = "chrome";

            E.syncLayer(l);

            layers.push(l);

            return l;
        };

        return { layers: layers, mk: mk, done: function () { return { id: E.uid("D"), name: "", kind: kind, electrolyte: "acid", grid: 1, layers: layers, culture: defaultRelease() }; } };
    }

    function holeGrid(xs, ys, size) {

        const out = [];

        xs.forEach(function (x) { ys.forEach(function (y) { out.push(r(x - size / 2, y - size / 2, x + size / 2, y + size / 2)); }); });

        return out;
    }

    function range(a, b, step) {

        const out = [];

        for (let v = a; v <= b + 1e-9; v += step) { out.push(v); }

        return out;
    }


    /* ------------------------------------------------
       TEMPLATES: ACCELEROMETER
    ------------------------------------------------ */

    // Proof mass with comb fingers on both sides. The left fingers sit just below stator fingers (net A),
    // the right fingers just above stator fingers (net B), so a move along y closes one gap and opens the other.
    // Fingers are 2 um wide, the near gap 2 um and the far gap 6 um.
    function accelParts(p) {

        const N = p.cells;
        const pitch = 12;
        const y0 = -pitch * N / 2;
        const yMax = Math.abs(y0) + 4;
        const L = p.springL;
        const FL = p.fingerL;
        const busX = 60 + FL + 6;                         // inner edge of the stator bus

        const shapes = [];
        const anchors = [];

        shapes.push(r(-60, -(yMax + 9), 60, yMax + 9));

        for (let i = 0; i < N; i++) {

            const yb = y0 + pitch * i;

            shapes.push(r(-60 - FL, yb + 4, -60, yb + 6));                   // movable finger, left
            shapes.push(r(-(busX + 6), yb + 8, -(busX - FL + 6 + 10), yb + 10));    // stator finger A, 2 um above it
            shapes.push(r(60, yb + 4, 60 + FL, yb + 6));                     // movable finger, right
            shapes.push(r(busX + 6, yb, busX - FL + 6 + 10, yb + 2));       // stator finger B, 2 um below it
        }

        const busY = yMax - 4;

        shapes.push(r(-(busX + 16), -busY, -busX, busY));
        shapes.push(r(busX, -busY, busX + 16, busY));

        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (q) {

            const cx = q[0] * (busX + 8);
            const cy = q[1] * (busY - 26);

            anchors.push(r(cx - 5, cy - 15, cx + 5, cy + 15));
        });

        // Four spring beams along x, one at each corner of the mass.
        const sy = yMax + 6;

        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) {

            const ax = q[0] * (60 + L);

            shapes.push(tr(p.springW, [[q[0] * 58, q[1] * sy], [ax, q[1] * sy]]));

            // Anchor block at the end of the beam, with the anchor opening inside it.
            shapes.push(r(ax - q[0] * 2, q[1] * sy - 25, ax + q[0] * 48, q[1] * sy + 25));
            anchors.push(r(ax + q[0] * 8, q[1] * sy - 15, ax + q[0] * 38, q[1] * sy + 15));
        });

        const holes = holeGrid(range(-50, 50, 20), range(-(yMax + 6), yMax + 6, 20), 4);

        const dimples = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(function (q) { return r(q[0] * 50 - 1.5, q[1] * (yMax + 1) - 1.5, q[0] * 50 + 1.5, q[1] * (yMax + 1) + 1.5); });

        const ax0 = 60 + L;

        const pads = [
            r(ax0 + 6, sy - 6, ax0 + 36, sy + 6, "M"),
            r(-(busX + 13), -10, -(busX + 3), 0, "A"),
            r(busX + 3, -10, busX + 13, 0, "B")
        ];

        return { shapes: shapes, anchors: anchors, holes: holes, dimples: dimples, pads: pads };
    }

    function buildAccel(kind, name, params) {

        if (name === "blank") {

            const b0 = builder(kind);

            b0.mk("structure", "Polysilicon (structure)", "poly", 2, []);

            return b0.done();
        }

        const p = Object.assign({ cells: 20, springL: 140, springW: 2.5, fingerL: 70 }, params || {});

        if (name === "accel-stiff") { p.springL = 100; p.springW = 3; }

        const g = accelParts(p);
        const b = builder(kind);

        b.mk("oxide", "Oxide (anchor openings)", "psg", 2, g.anchors);
        b.mk("dimple", "Dimples", "dimple", 0.75, g.dimples);
        b.mk("structure", "Polysilicon (structure)", "poly", 2, g.shapes);
        b.mk("hole", "Release holes", "hole", 1, g.holes);
        b.mk("collector", "Metal (pads)", "au", 0.5, g.pads);

        return b.done();
    }


    /* ------------------------------------------------
       TEMPLATES: GYROSCOPE
    ------------------------------------------------ */

    function gyroParts(p) {

        const shapes = [];
        const anchors = [];
        const FL = 70;
        const busX = 60 + FL + 6;

        shapes.push(r(-60, -64, 60, 64));

        // Drive comb on the left: stator fingers midway between the moving ones, gaps of 2 um, fingers along x.
        for (let i = 0; i < 12; i++) { const yc = -44 + 8 * i; shapes.push(r(-60 - FL, yc - 1, -60, yc + 1)); }
        for (let i = 0; i < 11; i++) { const yc = -40 + 8 * i; shapes.push(r(-(busX + 6), yc - 1, -(busX - FL + 6 + 10), yc + 1)); }

        shapes.push(r(-(busX + 16), -54, -busX, 54));
        anchors.push(r(-(busX + 11), -46, -(busX + 5), -16));
        anchors.push(r(-(busX + 11), 16, -(busX + 5), 46));

        // Sense comb on the right: a near gap of 2 um above each moving finger and a far gap of 6 um.
        for (let i = 0; i < 8; i++) {

            const yb = -48 + 12 * i;

            shapes.push(r(60, yb + 4, 60 + FL, yb + 6));
            shapes.push(r(busX + 6, yb + 8, busX - FL + 6 + 10, yb + 10));
        }

        shapes.push(r(busX, -54, busX + 16, 54));
        anchors.push(r(busX + 5, -46, busX + 11, -16));
        anchors.push(r(busX + 5, 16, busX + 11, 46));

        // Four L-shaped springs: along x (soft in y), then along y (soft in x).
        const Lx = p.lx;
        const Ly = p.ly;

        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) {

            const kx = q[0] * (58 + Lx);
            const cy = q[1] * (60 + Ly);

            shapes.push(tr(p.w, [[q[0] * 58, q[1] * 60], [kx, q[1] * 60], [kx, cy]]));

            const by = cy + q[1] * 8;

            shapes.push(r(kx - 25, by - 25, kx + 25, by + 25));
            anchors.push(r(kx - 15, by - 15, kx + 15, by + 15));
        });

        const holes = holeGrid(range(-50, 50, 20), range(-60, 60, 20), 4);
        const dimples = [r(-52, -52, -49, -49), r(49, -52, 52, -49), r(-52, 49, -49, 52), r(49, 49, 52, 52)];

        const px = 58 + Lx;
        const py = 60 + Ly + 8;

        const pads = [
            r(px - 12, py - 12, px + 12, py + 12, "M"),
            r(-(busX + 13), -10, -(busX + 3), 0, "D"),
            r(busX + 3, -10, busX + 13, 0, "S")
        ];

        return { shapes: shapes, anchors: anchors, holes: holes, dimples: dimples, pads: pads };
    }

    function buildGyro(kind, name, params) {

        if (name === "blank") {

            const b0 = builder(kind);

            b0.mk("structure", "Polysilicon (structure)", "poly", 2, []);

            return b0.done();
        }

        const p = Object.assign({ w: 2.5, lx: 120, ly: 134 }, params || {});

        const g = gyroParts(p);
        const b = builder(kind);

        b.mk("oxide", "Oxide (anchor openings)", "psg", 2, g.anchors);
        b.mk("dimple", "Dimples", "dimple", 0.75, g.dimples);
        b.mk("structure", "Polysilicon (structure)", "poly", 2, g.shapes);
        b.mk("hole", "Release holes", "hole", 1, g.holes);
        b.mk("collector", "Metal (pads)", "au", 0.5, g.pads);

        return b.done();
    }


    /* ------------------------------------------------
       TEMPLATES: MICROMIRROR
    ------------------------------------------------ */

    function buildMirror(kind, name, params) {

        if (name === "blank") {

            const b0 = builder(kind);

            b0.mk("structure", "Polysilicon 0 (electrodes)", "poly", 0.5, []);

            return b0.done();
        }

        const p = Object.assign({ size: 60, hingeL: 32, hingeW: 3, gap: 2 }, params || {});

        if (name === "mirror-wide") { p.size = 80; p.hingeL = 40; p.hingeW = 3; p.gap = 3; }

        const h = p.size / 2;
        const b = builder(kind);

        // Address electrodes in the base polysilicon, one under each half of the mirror.
        b.mk("structure", "Poly0 (address electrodes)", "poly", 0.5, [
            r(-(h - 2), 3, h - 2, h - 2), r(-(h - 2), -(h - 2), h - 2, -3),
            r(-8, 8, 8, 16, "A"), r(-8, -16, -8 + 16, -8, "B")
        ]);

        const ax0 = h + p.hingeL;

        b.mk("oxide", "Oxide (anchor openings)", "psg", p.gap, [r(ax0 + 6, -6, ax0 + 18, 6), r(-(ax0 + 18), -6, -(ax0 + 6), 6)]);

        const tip = h - 7;

        b.mk("dimple", "Dimples (landing tips)", "dimple", 0.75, [r(-21.5, tip - 1.5, -18.5, tip + 1.5), r(18.5, tip - 1.5, 21.5, tip + 1.5), r(-21.5, -tip - 1.5, -18.5, -tip + 1.5), r(18.5, -tip - 1.5, 21.5, -tip + 1.5)]);

        b.mk("structure", "Poly1 (mirror, hinges, posts)", "poly", 2, [
            r(-h, -h, h, h),
            tr(p.hingeW, [[h - 1, 0], [ax0 + 2, 0]]), tr(p.hingeW, [[-(h - 1), 0], [-(ax0 + 2), 0]]),
            r(ax0, -12, ax0 + 24, 12), r(-(ax0 + 24), -12, -ax0, 12)
        ]);

        b.mk("hole", "Release holes", "hole", 1, holeGrid([-20, 0, 20], [-20, 0, 20], 4));
        b.mk("collector", "Metal (mirror surface, pad)", "au", 0.5, [r(-(h - 3), -(h - 3), h - 3, h - 3), r(ax0 + 6, -6, ax0 + 18, 6, "M")]);

        return b.done();
    }


    function templatesFor(kind) {

        if (kind === "accel") {

            return [
                { id: "accel-comb", name: "Comb accelerometer (ADXL-style)", blurb: "A 120 by 270 micrometre proof mass on four 2.5 µm beams with 40 pairs of differential comb fingers (2 µm gaps), anchors, dimples, release holes and metal pads. Resonates near 25 kHz." },
                { id: "accel-stiff", name: "Comb accelerometer (stiff springs)", blurb: "The same sensor on shorter, wider beams: a higher resonance and bandwidth, but less sensitivity." },
                { id: "blank", name: "Blank (draw everything yourself)", blurb: "One empty polysilicon layer." }
            ];
        }

        if (kind === "gyro") {

            return [
                { id: "gyro-comb", name: "Vibratory gyroscope (comb drive and sense)", blurb: "A 120 by 128 micrometre mass on four L-shaped springs, a comb drive on the left and a comb sensor on the right. Drive and sense resonances start a few percent apart." },
                { id: "blank", name: "Blank (draw everything yourself)", blurb: "One empty polysilicon layer." }
            ];
        }

        return [
            { id: "mirror-torsion", name: "Torsion mirror pixel (60 µm)", blurb: "A 60 µm square mirror on two torsion hinges over two address electrodes, with landing dimples, release holes and a gold surface." },
            { id: "mirror-wide", name: "Torsion mirror pixel (80 µm, taller gap)", blurb: "A larger mirror with a 3 µm gap under it: more tilt, but it takes more voltage." },
            { id: "blank", name: "Blank (draw everything yourself)", blurb: "One empty polysilicon layer." }
        ];
    }

    function buildTemplate(kind, name, params) {

        if (kind === "accel") { return buildAccel(kind, name, params); }
        if (kind === "gyro") { return buildGyro(kind, name, params); }

        return buildMirror(kind, name, params);
    }


    /* ------------------------------------------------
       PIECES OF A STRUCTURAL LAYER
    ------------------------------------------------ */

    function pieceFromShape(s, layerK, kindOfLayer) {

        const out = [];

        if (s.cut) { return out; }   // a hole adds no material

        if (s.t === "t") {

            for (let k = 0; k + 1 < s.pts.length; k++) {

                const a = s.pts[k];
                const b = s.pts[k + 1];

                if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.2) { continue; }

                out.push({ layer: layerK, type: "beam", p1: [a[0], a[1]], p2: [b[0], b[1]], w: s.w, poly: G.polysOf({ t: "t", pts: [a, b], w: s.w })[0] });
            }

            return out;
        }

        if (s.t === "r") {

            const w = Math.min(s.w, s.h);
            const l = Math.max(s.w, s.h);

            if (!s.pad && w <= BEAM_W && l >= BEAM_ASPECT * w) {

                const horiz = s.w >= s.h;

                out.push({
                    layer: layerK, type: "beam", w: w,
                    p1: horiz ? [s.x, s.y + s.h / 2] : [s.x + s.w / 2, s.y],
                    p2: horiz ? [s.x + s.w, s.y + s.h / 2] : [s.x + s.w / 2, s.y + s.h],
                    poly: G.polysOf(s)[0]
                });

                return out;
            }

            out.push({ layer: layerK, type: s.pad ? "pad" : "block", poly: G.polysOf(s)[0], rect: { x0: s.x, y0: s.y, x1: s.x + s.w, y1: s.y + s.h }, pad: s.pad || "" });

            return out;
        }

        G.polysOf(s).forEach(function (p) { out.push({ layer: layerK, type: "block", poly: p }); });

        return out;
    }


    /* ------------------------------------------------
       ANALYSIS
    ------------------------------------------------ */

    function analyze(ctx) {

        const design = ctx.design;
        const kind = design.kind;
        const per = ctx.per;
        const P = ctx.P;
        const frame = ctx.frame;
        const n = ctx.n;
        const px = ctx.px;
        const notes = ctx.notes;
        const info = ctx.info;
        const finish = ctx.finish;
        const rand = ctx.rand;
        const vary = ctx.vary;
        const gauss = ctx.gauss;
        const W = frame.w;

        const rel = cleanRelease(design.culture, function (v, lo, hi, def) { return typeof v === "number" && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : def; });

        const fail = function (reason) {

            return finish({ kind: kind, status: "lost", reason: reason, quality: 0, release: rel, mems: null, seedRoll: rand() });
        };

        const nl = per.length;
        const px2 = px * px;

        const xOf = function (i) { return frame.x0 + (i + 0.5) * px; };
        const yOf = function (j) { return frame.y0 + (j + 0.5) * px; };

        // Heights, stack by stack, from the nitride upwards.
        const lay = [];
        let zTop = 0;
        let gapPending = null;
        let lastStruct = -1;

        per.forEach(function (q, k) {

            const l = q.layer;
            const info0 = { k: k, role: l.role, name: l.name, material: l.material, t: l.thickness, status: q.p.status, z0: zTop, z1: zTop };

            if (l.role === "structure") {

                const m = E.MEMS_STRUCTURE[l.material] || E.MEMS_STRUCTURE.poly;
                const t = l.thickness * vary(0.03);

                Object.assign(info0, { t: t, z0: zTop, z1: zTop + t, E: m.E, rho: m.rho, nu: m.nu, strength: m.strength, stress: m.stress, gapBelow: gapPending === null ? 0 : gapPending, oxideK: gapPending === null ? -1 : gapPending.k });

                info0.gapBelow = gapPending ? gapPending.t : 0;
                info0.oxideK = gapPending ? gapPending.k : -1;
                info0.lowerK = lastStruct;

                zTop = zTop + t;
                lastStruct = k;
                gapPending = null;

            } else if (l.role === "oxide") {

                const m = E.MEMS_OXIDES[l.material] || E.MEMS_OXIDES.psg;
                const t = l.thickness * vary(0.03);

                Object.assign(info0, { t: t, rate: m.rate * vary(0.05), z0: zTop, z1: zTop + t, below: lastStruct });

                gapPending = { k: k, t: t };

                // The oxide fills the space up to the top of what is under it, and the next film sits on it.
                info0.z1 = zTop + t;
                zTop = zTop + t;

            } else if (l.role === "collector") {

                info0.z0 = zTop;
                info0.z1 = zTop + l.thickness;
            }

            lay.push(info0);
        });

        const structK = [];

        lay.forEach(function (x) { if (x.role === "structure" && x.status !== "lost") { structK.push(x.k); } });

        if (!structK.length) { notes.push("There is no structural polysilicon layer with anything drawn on it."); return fail("No structural layer"); }

        // The oxide a structural layer sits on is the one just below it in the stack, if any.
        const oxideBelow = {};

        structK.forEach(function (k) { oxideBelow[k] = lay[k].oxideK >= 0 && per[lay[k].oxideK].p.status !== "lost" ? lay[k].oxideK : -1; });

        // Structure footprints, with release holes cut out.
        const holesOf = {};

        per.forEach(function (q, k) {

            if (q.layer.role !== "hole" || q.p.status === "lost") { return; }

            // A hole layer cuts the structural layer nearest below it.
            let target = -1;

            for (let m = k - 1; m >= 0; m--) { if (lay[m].role === "structure") { target = m; break; } }

            if (target < 0) { return; }

            const mask = G.raster(ctx.shapesOf[k], frame);

            holesOf[target] = holesOf[target] ? holesOf[target] : new Uint8Array(n);

            for (let i = 0; i < n; i++) { if (mask[i]) { holesOf[target][i] = 1; } }
        });

        const Es = {};

        structK.forEach(function (k) {

            const m = new Uint8Array(n);
            const h = holesOf[k];

            for (let i = 0; i < n; i++) { m[i] = P[k][i] && !(h && h[i]) ? 1 : 0; }

            Es[k] = m;
        });

        // Pieces and who owns which pixel.
        const pieces = [];
        const owner = {};

        const collect = function (k, E_, role) {

            const list = [];

            ctx.shapesOf[k].forEach(function (s) { pieceFromShape(s, k).forEach(function (pc) { pc.role = role; list.push(pc); }); });

            // Blocks first (largest first), then beams, then bare pads.
            const bbArea = function (pc) { const b = G.polyBox(pc.poly); return (b.x1 - b.x0) * (b.y1 - b.y0); };

            list.sort(function (a, b) {

                const o = { block: 0, beam: 1, pad: 2 };

                if (o[a.type] !== o[b.type]) { return o[a.type] - o[b.type]; }

                return bbArea(b) - bbArea(a);
            });

            const own = new Int32Array(n);

            list.forEach(function (pc) {

                pc.id = pieces.length + 1;
                pc.box = G.polyBox(pc.poly);
                pc.n = 0;

                const j0 = Math.max(0, Math.floor((pc.box.y0 - frame.y0) / px - 0.5));
                const j1 = Math.min(frame.h - 1, Math.ceil((pc.box.y1 - frame.y0) / px - 0.5));
                const i0 = Math.max(0, Math.floor((pc.box.x0 - frame.x0) / px - 0.5));
                const i1 = Math.min(W - 1, Math.ceil((pc.box.x1 - frame.x0) / px - 0.5));

                for (let j = j0; j <= j1; j++) {

                    const y = yOf(j);

                    for (let i = i0; i <= i1; i++) {

                        const idx = j * W + i;

                        if (own[idx] || !E_[idx]) { continue; }

                        const x = xOf(i);

                        if (pc.rect ? (x >= pc.rect.x0 && x <= pc.rect.x1 && y >= pc.rect.y0 && y <= pc.rect.y1) : G.pointInPoly(x, y, pc.poly)) {

                            own[idx] = pc.id;
                            pc.n += 1;
                        }
                    }
                }

                pieces.push(pc);
            });

            owner[k] = own;
        };

        structK.forEach(function (k) { collect(k, Es[k], "structure"); });

        // Metal layers: pieces too, for nets and for covering the structure.
        const metalK = [];

        lay.forEach(function (x) { if (x.role === "collector" && x.status !== "lost" && per[x.k].layer.shapes.length) { metalK.push(x.k); } });

        const metalMask = {};

        metalK.forEach(function (k) { metalMask[k] = P[k]; collect(k, P[k], "metal"); });

        // Anchors, dimples and the release.
        const rEtch = {};
        const needed = {};
        const unrel = {};
        const anchorMask = {};
        const dimpleMask = {};

        structK.forEach(function (k) {

            const ox = oxideBelow[k];
            const li = lay[k];

            anchorMask[k] = new Uint8Array(n);
            dimpleMask[k] = new Uint8Array(n);
            unrel[k] = new Uint8Array(n);

            if (ox < 0) {

                // Sits straight on the nitride: it never moves.
                li.fixedBase = true;

                for (let i = 0; i < n; i++) { if (Es[k][i]) { anchorMask[k][i] = 1; } }

                return;
            }

            const win = G.raster(ctx.shapesOf[ox], frame);

            for (let i = 0; i < n; i++) { if (Es[k][i] && win[i]) { anchorMask[k][i] = 1; } }

            // Dimple layers between the oxide and this structure.
            for (let m = ox + 1; m < k; m++) {

                if (lay[m].role !== "dimple" || per[m].p.status === "lost") { continue; }

                const dm = G.raster(ctx.shapesOf[m], frame);

                for (let i = 0; i < n; i++) { if (Es[k][i] && dm[i] && !anchorMask[k][i]) { dimpleMask[k][i] = 1; } }

                li.dimpleDepth = per[m].layer.thickness;
            }

            // HF eats sideways from every open edge for a limited time.
            const open = new Uint8Array(n);

            for (let i = 0; i < n; i++) { open[i] = Es[k][i] ? 0 : 1; }

            const dist = G.edt(open, W, frame.h);
            const reach = lay[ox].rate * rel.hf;

            rEtch[k] = reach;

            let need = 0;

            for (let i = 0; i < n; i++) {

                if (!Es[k][i] || anchorMask[k][i]) { continue; }

                const dd = dist[i] * px;

                if (dd > need) { need = dd; }
                if (dd > reach) { unrel[k][i] = 1; }
            }

            needed[k] = need;
        });

        // Per-piece statistics in one pass per layer.
        const nP = pieces.length + 1;
        const st = {
            n: new Float64Array(nP), sx: new Float64Array(nP), sy: new Float64Array(nP), sxx: new Float64Array(nP), syy: new Float64Array(nP),
            anch: new Float64Array(nP), unr: new Float64Array(nP), dimp: new Float64Array(nP), metal: new Float64Array(nP)
        };

        structK.forEach(function (k) {

            const own = owner[k];

            for (let j = 0; j < frame.h; j++) {

                const y = yOf(j);

                for (let i = 0; i < W; i++) {

                    const idx = j * W + i;
                    const id = own[idx];

                    if (!id) { continue; }

                    const x = xOf(i);

                    st.n[id] += 1;
                    st.sx[id] += x;
                    st.sy[id] += y;
                    st.sxx[id] += x * x;
                    st.syy[id] += y * y;

                    if (anchorMask[k][idx]) { st.anch[id] += 1; }
                    if (unrel[k][idx]) { st.unr[id] += 1; }
                    if (dimpleMask[k][idx]) { st.dimp[id] += 1; }

                    for (let q = 0; q < metalK.length; q++) { if (metalMask[metalK[q]][idx]) { st.metal[id] += 1; break; } }
                }
            }
        });

        const metalOf = metalK.length ? lay[metalK[0]] : null;

        // Metal pieces also need their own area.
        metalK.forEach(function (k) {

            const own = owner[k];

            for (let idx = 0; idx < n; idx++) {

                const id = own[idx];

                if (!id) { continue; }

                st.n[id] += 1;
                st.sx[id] += xOf(idx % W);
                st.sy[id] += yOf(Math.floor(idx / W));
            }
        });

        // Which structure piece is under which metal piece (pad nets and mass).
        const joinCount = {};

        const addJoin = function (a, b, w) {

            const key = a < b ? a + "_" + b : b + "_" + a;

            joinCount[key] = (joinCount[key] || 0) + w;
        };

        metalK.forEach(function (km) {

            const own = owner[km];

            for (let idx = 0; idx < n; idx++) {

                const id = own[idx];

                if (!id) { continue; }

                // The metal lands on the structural layer just under it in the stack.
                let under = -1;

                for (let q = structK.length - 1; q >= 0; q--) { if (structK[q] < km) { under = structK[q]; break; } }

                if (under < 0) { break; }

                const u = owner[under][idx];

                if (u) { addJoin(id, u, 1); }
            }
        });

        // Anchors tie a structure piece to the piece under it, or to the substrate.
        const viaJoins = {};
        const toSubstrate = {};

        structK.forEach(function (k) {

            if (oxideBelow[k] < 0) { return; }

            const own = owner[k];
            const lowerK = lay[k].lowerK;

            for (let idx = 0; idx < n; idx++) {

                if (!anchorMask[k][idx]) { continue; }

                const id = own[idx];

                if (!id) { continue; }

                const below = lowerK >= 0 && owner[lowerK] ? owner[lowerK][idx] : 0;

                if (below) {

                    const key = id + "_" + below;

                    viaJoins[key] = (viaJoins[key] || 0) + 1;

                } else {

                    toSubstrate[id] = (toSubstrate[id] || 0) + 1;
                }
            }
        });

        // Which pieces touch inside a layer.
        const touch = [];

        structK.concat(metalK).forEach(function (k) {

            const list = pieces.filter(function (pc) { return pc.layer === k; });

            for (let a = 0; a < list.length; a++) {

                for (let b = a + 1; b < list.length; b++) {

                    const A = list[a];
                    const B = list[b];

                    if (A.box.x1 + 0.05 < B.box.x0 || B.box.x1 + 0.05 < A.box.x0 || A.box.y1 + 0.05 < B.box.y0 || B.box.y1 + 0.05 < A.box.y0) { continue; }

                    if (G.polyDist(A.poly, B.poly, A.box, B.box) <= 0.05) { touch.push([A.id, B.id]); }
                }
            }
        });

        // Final piece records.
        const out = [];
        const byId = {};

        pieces.forEach(function (pc) {

            const c = st.n[pc.id];

            if (c < 1 && pc.type !== "pad") { return; }

            const area = c * px2;
            const li = lay[pc.layer];

            const rec = {
                id: pc.id, layer: pc.layer, role: pc.role, type: pc.type, label: pc.pad || "",
                area: area, cx: c ? st.sx[pc.id] / c : (pc.box.x0 + pc.box.x1) / 2, cy: c ? st.sy[pc.id] / c : (pc.box.y0 + pc.box.y1) / 2,
                anchored: st.anch[pc.id] * px2, unreleased: st.unr[pc.id] * px2, dimples: st.dimp[pc.id] * px2,
                metalFrac: pc.role === "structure" && c ? st.metal[pc.id] / c : 0
            };

            if (c) {

                const mx = rec.cx;
                const my = rec.cy;

                rec.ixx = (st.syy[pc.id] - 2 * my * st.sy[pc.id] + c * my * my) * px2;      // sum of (y - cy)^2 dA, um4
                rec.iyy = (st.sxx[pc.id] - 2 * mx * st.sx[pc.id] + c * mx * mx) * px2;
            }

            if (pc.type === "beam") {

                const wNoise = 0.015 * gauss();

                rec.p1 = pc.p1;
                rec.p2 = pc.p2;
                rec.w = Math.max(0.3, pc.w + wNoise);
                rec.len = Math.hypot(pc.p2[0] - pc.p1[0], pc.p2[1] - pc.p1[1]);

            } else {

                rec.rect = pc.rect || null;
                rec.poly = pc.poly.map(function (q) { return [Math.round(q[0] * 100) / 100, Math.round(q[1] * 100) / 100]; });
            }

            rec.t = li.t;
            out.push(rec);
            byId[rec.id] = rec;
        });

        // Electrical nets.
        const parent = {};

        out.forEach(function (rc) { parent[rc.id] = rc.id; });

        const find = function (a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
        const join = function (a, b) { if (!byId[a] || !byId[b]) { return; } const x = find(a); const y = find(b); if (x !== y) { parent[Math.max(x, y)] = Math.min(x, y); } };

        touch.forEach(function (t) { join(t[0], t[1]); });
        Object.keys(joinCount).forEach(function (key) { const p = key.split("_"); join(Number(p[0]), Number(p[1])); });
        Object.keys(viaJoins).forEach(function (key) { const p = key.split("_"); join(Number(p[0]), Number(p[1])); });

        const netLabel = {};

        const labelAt = function (k, s) {

            const cx = Math.floor((s.x + s.w / 2 - frame.x0) / px);
            const cy = Math.floor((s.y + s.h / 2 - frame.y0) / px);

            if (cx < 0 || cy < 0 || cx >= W || cy >= frame.h) { return 0; }

            return owner[k] ? owner[k][cy * W + cx] : 0;
        };

        const padsSeen = {};

        structK.concat(metalK).forEach(function (k) {

            ctx.shapesOf[k].forEach(function (s) {

                if (!s.pad) { return; }

                const id = labelAt(k, s);

                if (!id) { notes.push("Pad " + s.pad + " on layer “" + per[k].layer.name + "” does not sit on printed material."); return; }

                const root = find(id);

                netLabel[root] = netLabel[root] || {};
                netLabel[root][s.pad] = true;
                padsSeen[s.pad] = true;
            });
        });

        const nets = {};
        const shorts = [];

        Object.keys(netLabel).forEach(function (root) {

            const labs = Object.keys(netLabel[root]);

            labs.forEach(function (l) { nets[l] = Number(root); });

            if (labs.length > 1) { shorts.push(labs.join(" and ")); }
        });

        out.forEach(function (rc) { rc.net = find(rc.id); });

        const need = (E.KINDS[kind] || {}).need || [];
        const missing = need.filter(function (l) { return !padsSeen[l]; });

        if (missing.length) { notes.push("These pads are missing or not on printed material: " + missing.join(", ") + "."); }

        if (shorts.length) { notes.push("These electrodes are joined by touching material: " + shorts.join("; ") + "."); }

        // Layers that did not survive printing.
        per.forEach(function (q) { if (q.p.status === "lost" || q.p.status === "inverted") { notes.push("Layer “" + q.layer.name + "” did not print correctly."); } });

        const quality = per.reduce(function (s, x) { return s + x.p.quality; }, 0) / per.length;

        const layersOut = lay.map(function (x) {

            return {
                k: x.k, role: x.role, name: x.name, material: x.material, t: x.t, z0: x.z0, z1: x.z1, E: x.E, rho: x.rho, nu: x.nu, strength: x.strength, stress: x.stress,
                gapBelow: x.gapBelow, lowerK: x.lowerK, rate: x.rate, status: x.status, fixedBase: !!x.fixedBase, dimpleDepth: x.dimpleDepth || 0, reach: rEtch[x.k], needed: needed[x.k]
            };
        });

        // Dimple spots (landing tips), for the mirror.
        const dimples = [];

        structK.forEach(function (k) {

            if (!dimpleMask[k]) { return; }

            const lab = G.label(dimpleMask[k], W, frame.h);

            const acc = {};

            for (let idx = 0; idx < n; idx++) {

                const l = lab.labels[idx];

                if (!l) { continue; }

                const a = acc[l] || (acc[l] = { n: 0, x: 0, y: 0 });

                a.n += 1;
                a.x += xOf(idx % W);
                a.y += yOf(Math.floor(idx / W));
            }

            Object.keys(acc).slice(0, 80).forEach(function (l) { dimples.push({ layer: k, x: acc[l].x / acc[l].n, y: acc[l].y / acc[l].n, area: acc[l].n * px2 }); });
        });

        info.parts = { nPieces: out.length, nStruct: structK.length };
        info.areaPlus = 0;
        info.areaMinus = 0;
        info.resolutionUm = px;

        let bad = null;

        if (missing.length) { bad = "A required pad is missing: " + missing.join(", "); }

        return finish({
            kind: kind, status: bad ? "open" : "ok", reason: bad || "", quality: quality, release: rel,
            seedRoll: rand(), life: 1, vMax: 1, rShort: 50,
            mems: {
                px: px, pieces: out, touch: touch.filter(function (t) { return byId[t[0]] && byId[t[1]]; }), vias: viaJoins, toSubstrate: toSubstrate, layers: layersOut, structK: structK, metalK: metalK, nets: nets, shorts: shorts,
                dimples: dimples, rEtch: rEtch, nitride: NITRIDE, metal: metalOf ? { t: metalOf.t, material: metalOf.material } : null
            }
        });
    }


    function check(design, out, labels) {

        const used = design.layers.filter(function (l) { return l.shapes.length; });

        if (!used.some(function (l) { return l.role === "structure"; })) {

            out.push({ level: "error", text: "There is no structural polysilicon layer. Draw the mass, springs and fingers on a structure layer." });
        }

        if (used.filter(function (l) { return l.role === "structure"; }).length > 0 && !used.some(function (l) { return l.role === "oxide"; })) {

            out.push({ level: "warn", text: "There is no sacrificial oxide layer with anchor openings, so the structure is lying straight on the nitride and nothing can move." });
        }

        if (!used.some(function (l) { return l.role === "hole"; })) {

            out.push({ level: "info", text: "There are no release holes. A wide plate or mass needs them, or the HF cannot undercut its middle." });
        }
    }

    ["accel", "gyro", "mirror"].forEach(function (kind) {

        E.registerKind(kind, {
            analyze: analyze, buildTemplate: buildTemplate, check: check, templates: templatesFor(kind), cells: 900000, featDiv: 4
        });
    });

    E.memsRelease = { DRY: DRY, defaultRelease: defaultRelease, cleanRelease: cleanRelease };
    E.memsGeometry = { BEAM_W: BEAM_W };

}(typeof window !== "undefined" ? window : globalThis));
