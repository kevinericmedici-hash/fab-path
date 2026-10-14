/* ========================================
   BLOOD-BRAIN BARRIER CHIP: DEVICE ANALYSIS

   Registers the "bbb" kind with LabEngine. From the drawn layers it finds
   the fluid channels (and the inlet "I" / outlet "O" ports on them), joins
   channels in different layers only where nothing separates them, solves
   the flow for hydraulic resistance and shear stress, finds the barrier
   area where the apical and basolateral channels face each other across a
   porous membrane, and works out which electrode wets which channel and
   how much of the barrier it can actually see. The biology and the
   measurements live in lab-bbb-model.js.

   Needs window.LabEngine, window.LabGeom and window.SCLab.
======================================== */

(function (root) {

    "use strict";

    const E = root.LabEngine;
    const G = root.LabGeom;
    const SC = root.SCLab;

    const METALS = E.METALS;
    const MEMBRANES = E.MEMBRANES;
    const CHANNELS = E.CHANNEL_MATERIALS;

    const MU = 0.78e-3;                    // Pa s, culture medium at 37 C
    const KAPPA = 1.5;                     // S/m, culture medium


    /* ------------------------------------------------
       TEMPLATES (all lengths in um)
    ------------------------------------------------ */

    function r(x, y, w, h, pad) {

        const s = { t: "r", x: x, y: y, w: w, h: h };

        if (pad) { s.pad = pad; }

        return s;
    }


    function geometry(p) {

        const L = p.L;
        const W = p.W;

        const well = 1500;

        return {
            L: L, W: W,
            channel: r(0, 0, L, W),
            // Wells hang off opposite sides so the two channels never touch each other without the membrane between.
            baseIn: r(-700, -well + 50, well, well, "I"),
            baseOut: r(L - 800, -well + 50, well, well, "O"),
            topIn: r(-700, W - 50, well, well, "I"),
            topOut: r(L - 800, W - 50, well, well, "O"),
            membrane: r(-100, -100, L + 200, W + 200),
            elec: r(L * 0.05, W * 0.15, L * 0.9, W * 0.7),
            padB: r(L * 0.45, -4200, 1200, 1200, "B"),
            padA: r(L * 0.45, W + 3000, 1200, 1200, "A")
        };
    }


    function buildTemplate(kind, name, params) {

        const p = Object.assign({ L: 10000, W: 1000, H: 100 }, params || {});

        if (name === "bbb-narrow") { p.L = 6000; p.W = 400; p.H = 60; }

        const g = geometry(p);

        const layers = [];

        if (name === "blank") {

            const l = E.newLayer("collector", { name: "Glassy carbon electrode", material: "gc", thickness: 1 });

            return { id: E.uid("D"), name: "", kind: kind, electrolyte: "acid", grid: 50, layers: [l], culture: defaultCulture() };
        }

        const mk = function (role, opts, shapes) {

            const l = E.newLayer(role, opts);

            l.shapes = shapes;

            E.syncLayer(l);

            layers.push(l);

            return l;
        };

        const lead = function (x, y0, y1) { return r(x - 150, Math.min(y0, y1), 300, Math.abs(y1 - y0)); };

        // Bottom: electrode on the brain (basolateral) side.
        const eb = g.elec;

        mk("collector", { name: "Basolateral electrode", material: "gc", thickness: 1 },
            [eb, lead(g.padB.x + g.padB.w / 2, g.padB.y + g.padB.h - 10, eb.y + 10), g.padB]);

        mk("channel", { name: "Basolateral channel (brain side)", material: "su8", thickness: p.H },
            [g.channel, g.baseIn, g.baseOut]);

        mk("membrane", { name: "Porous membrane", material: "pet" }, [g.membrane]);

        mk("channel", { name: "Apical channel (blood side)", material: "su8", thickness: p.H },
            [g.channel, g.topIn, g.topOut]);

        mk("collector", { name: "Apical electrode", material: "gc", thickness: 1 },
            [eb, lead(g.padA.x + g.padA.w / 2, eb.y + eb.h - 10, g.padA.y + 10), g.padA]);

        const design = {
            id: E.uid("D"), name: "", kind: kind, electrolyte: "acid", grid: 50, layers: layers,
            culture: defaultCulture()
        };

        return design;
    }


    function defaultCulture() { return { cells: "hcmec", co: "none", coat: "col4", days: 7, flow: 5, flowB: 1 }; }


    const TEMPLATES = [
        { id: "bbb-sandwich", name: "Two-channel sandwich chip", blurb: "Parallel apical and basolateral channels over a PET membrane, with a glassy carbon electrode in each channel." },
        { id: "bbb-narrow", name: "Narrow, high-shear sandwich", blurb: "Smaller channels, so the same flow gives much more shear stress on the cells." },
        { id: "blank", name: "Blank (draw everything yourself)", blurb: "One empty metal layer." }
    ];


    /* ------------------------------------------------
       ANALYSIS
    ------------------------------------------------ */

    function analyze(ctx) {

        const design = ctx.design;
        const per = ctx.per;
        const P = ctx.P;
        const frame = ctx.frame;
        const n = ctx.n;
        const px = ctx.px;
        const notes = ctx.notes;
        const info = ctx.info;
        const finish = ctx.finish;
        const vary = ctx.vary;
        const rand = ctx.rand;

        const nl = per.length;
        const pxCm = px * 1e-4;                                  // um to cm

        const failDev = function (reason, status, extra) {

            return finish(Object.assign({ kind: "bbb", status: status || "lost", reason: reason, quality: 0, life: 1, vMax: 1 }, extra || {}));
        };

        const chIdx = [];
        const memIdx = [];

        per.forEach(function (q, k) {

            if (q.layer.role === "channel") { chIdx.push(k); }
            if (q.layer.role === "membrane") { memIdx.push(k); }
        });

        if (!chIdx.length) { notes.push("There is no fluidic channel layer."); return failDev("No channel layer"); }

        // Channel maps: drawn shapes are the fluid, the film around them is the wall.
        const CH = {};
        const WALL = {};

        const margin = 300;

        chIdx.forEach(function (k) {

            const shapes = ctx.shapesOf[k];
            const ok = per[k].p.status;

            const R = G.raster(shapes, frame);

            const b = G.bboxOf(shapes) || { x0: 0, y0: 0, x1: -1, y1: -1 };

            const ch = new Uint8Array(n);
            const wall = new Uint8Array(n);

            if (ok === "lost") { CH[k] = ch; WALL[k] = wall; return; }

            for (let j = 0; j < frame.h; j++) {

                const y = frame.y0 + (j + 0.5) * px;

                for (let i = 0; i < frame.w; i++) {

                    const x = frame.x0 + (i + 0.5) * px;
                    const inside = x >= b.x0 - margin && x <= b.x1 + margin && y >= b.y0 - margin && y <= b.y1 + margin;

                    const c = j * frame.w + i;
                    const drawn = R[c];

                    if (ok === "inverted") {

                        ch[c] = inside && !drawn ? 1 : 0;
                        wall[c] = drawn ? 1 : 0;

                    } else {

                        ch[c] = drawn ? 1 : 0;
                        wall[c] = inside && !drawn ? 1 : 0;
                    }
                }
            }

            CH[k] = ch;
            WALL[k] = wall;
        });

        // Does this layer block fluid between its neighbours at pixel c?
        const separates = function (m, c) {

            const role = per[m].layer.role;

            if (role === "channel") { return !CH[m][c] && WALL[m][c] === 1; }
            if (role === "membrane" || role === "insulation" || role === "semiconductor") { return P[m][c] === 1; }

            return false;
        };

        // Fluid pieces in each channel layer, joined across layers where nothing separates them.
        const lab = {};
        const base = {};

        let nodes = 1;

        chIdx.forEach(function (k) {

            lab[k] = G.label(CH[k], frame.w, frame.h);
            base[k] = nodes;
            nodes += lab[k].n;
        });

        const parent = new Int32Array(nodes);

        for (let i = 0; i < nodes; i++) { parent[i] = i; }

        const find = function (a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
        const join = function (a, b) { const x = find(a); const y = find(b); if (x !== y) { parent[Math.max(x, y)] = Math.min(x, y); } };

        const barrier = new Uint8Array(n);                         // membrane faces fluid on both sides
        const cellLayer = new Uint8Array(n);                       // membrane under the apical channel

        const memTop = memIdx.length ? memIdx[0] : -1;

        for (let c = 0; c < n; c++) {

            let last = -1;
            let sepMem = false;
            let sepOther = false;

            for (let m = 0; m < nl; m++) {

                const role = per[m].layer.role;

                if (role === "channel" && CH[m][c]) {

                    if (last >= 0) {

                        if (!sepMem && !sepOther) { join(base[last] + lab[last].labels[c] - 1, base[m] + lab[m].labels[c] - 1); }
                        else if (sepMem && !sepOther) { barrier[c] = 1; }
                    }

                    last = m;
                    sepMem = false;
                    sepOther = false;

                    continue;
                }

                if (!separates(m, c)) { continue; }

                if (role === "membrane") { sepMem = true; } else { sepOther = true; }
            }
        }

        const nodeAt = function (k, c) { return find(base[k] + lab[k].labels[c] - 1); };

        // Ports.
        const ports = [];

        chIdx.forEach(function (k) {

            ctx.shapesOf[k].forEach(function (s) {

                if (!s.pad || (s.pad !== "I" && s.pad !== "O") || s.t !== "r") { return; }

                const m = G.raster([s], frame);

                let hit = -1;

                for (let c = 0; c < n; c++) { if (m[c] && CH[k][c]) { hit = c; break; } }

                if (hit >= 0) { ports.push({ k: k, label: s.pad, mask: m, root: nodeAt(k, hit) }); }
            });
        });

        const side = function (k) { return memTop < 0 ? "none" : (k > memTop ? "apical" : "baso"); };

        // Networks that connect an inlet to an outlet.
        const rootInfo = {};

        ports.forEach(function (pt) {

            const o = rootInfo[pt.root] || (rootInfo[pt.root] = { root: pt.root, I: false, O: false, sides: {}, layers: {} });

            o[pt.label] = true;
            o.sides[side(pt.k)] = true;
        });

        chIdx.forEach(function (k) {

            for (let c = 0; c < n; c++) {

                if (!CH[k][c]) { continue; }

                const root = nodeAt(k, c);

                if (rootInfo[root]) { rootInfo[root].layers[k] = true; rootInfo[root].sides[side(k)] = true; }
            }
        });

        const roots = Object.keys(rootInfo).map(Number).filter(function (rt) { return rootInfo[rt].I && rootInfo[rt].O; });

        if (!roots.length) {

            notes.push("No channel connects an inlet port (I) to an outlet port (O).");

            return failDev("No path from an inlet to an outlet", "blocked");
        }

        let crosstalk = false;

        roots.forEach(function (rt) {

            const sides = Object.keys(rootInfo[rt].sides);

            if (sides.indexOf("apical") >= 0 && sides.indexOf("baso") >= 0) { crosstalk = true; }
        });

        // The two channels that face each other across the membrane.
        let apical = -1;
        let baso = -1;

        if (memTop >= 0) {

            chIdx.forEach(function (k) {

                if (k > memTop && (apical < 0 || k < apical)) { apical = k; }
                if (k < memTop && k > baso) { baso = k; }
            });
        }

        if (memTop < 0) { notes.push("There is no membrane layer, so there is no barrier for cells to grow on."); }

        const netOfLayer = function (k) {

            for (let a = 0; a < roots.length; a++) { if (rootInfo[roots[a]].layers[k]) { return roots[a]; } }

            return -1;
        };

        const apRoot = apical >= 0 ? netOfLayer(apical) : -1;
        const baRoot = baso >= 0 ? netOfLayer(baso) : -1;

        if (crosstalk) {

            notes.push("Fluid can pass between the two channels without crossing the membrane (channels overlap where the membrane is missing). Cells would be bypassed.");

            return failDev("The apical and basolateral channels are connected without a membrane", "crosstalk");
        }

        if (apRoot < 0 || baRoot < 0) {

            notes.push("The apical and the basolateral channel each need an inlet and an outlet.");

            return failDev("A channel next to the membrane has no working inlet and outlet", "blocked");
        }

        // Barrier area: membrane between the two channels.
        let nB = 0;
        let nCells = 0;

        for (let c = 0; c < n; c++) {

            if (barrier[c]) { nB += 1; }

            if (memTop >= 0 && P[memTop][c] && CH[apical][c]) { nCells += 1; cellLayer[c] = 1; }
        }

        const aB = nB * pxCm * pxCm;                      // cm2
        const aCells = nCells * pxCm * pxCm;

        if (aB <= 0) {

            notes.push("The two channels do not face each other across the membrane anywhere, so there is no barrier area.");

            return failDev("No barrier area (channels do not overlap over the membrane)", "blocked");
        }

        // Hydraulics for the apical and basolateral networks.
        const netSummary = function (k, root) {

            const h = per[k].layer.thickness;                                     // um

            const mask = new Uint8Array(n);
            const inlet = new Uint8Array(n);
            const outlet = new Uint8Array(n);

            let cnt = 0;

            for (let c = 0; c < n; c++) {

                if (CH[k][c] && nodeAt(k, c) === root) { mask[c] = 1; cnt += 1; }
            }

            ports.forEach(function (pt) {

                if (pt.k !== k || pt.root !== root) { return; }

                for (let c = 0; c < n; c++) { if (pt.mask[c] && mask[c]) { (pt.label === "I" ? inlet : outlet)[c] = 1; } }
            });

            // Squares of channel between inlet and outlet, with the plain 2D (Hele-Shaw) solve.
            const f = Math.max(1, Math.ceil(Math.sqrt(n / 40000)));
            const w2 = Math.ceil(frame.w / f);
            const h2 = Math.ceil(frame.h / f);

            const g = new Float32Array(w2 * h2);
            const A = new Uint8Array(w2 * h2);
            const B = new Uint8Array(w2 * h2);

            for (let j = 0; j < frame.h; j++) {

                for (let i = 0; i < frame.w; i++) {

                    const c = j * frame.w + i;
                    const o = Math.floor(j / f) * w2 + Math.floor(i / f);

                    if (mask[c]) { g[o] += 1 / (f * f); }
                    if (inlet[c]) { A[o] = 1; }
                    if (outlet[c]) { B[o] = 1; }
                }
            }

            for (let o = 0; o < g.length; o++) { if (g[o] > 0.2) { g[o] = 1; } else { g[o] = 0; } }

            const sol = G.solveTwoTerminal(g, A, B, w2, h2);

            const squares = sol.connected ? sol.G : 0;

            // Path length by breadth-first search from the inlet, and the width at each step along it.
            const dist = new Int32Array(n).fill(-1);
            const queue = [];

            for (let c = 0; c < n; c++) { if (inlet[c] && mask[c]) { dist[c] = 0; queue.push(c); } }

            let head = 0;

            while (head < queue.length) {

                const c = queue[head++];
                const i = c % frame.w;

                const nb = [];

                if (i > 0) { nb.push(c - 1); }
                if (i < frame.w - 1) { nb.push(c + 1); }
                if (c >= frame.w) { nb.push(c - frame.w); }
                if (c + frame.w < n) { nb.push(c + frame.w); }

                nb.forEach(function (q) { if (mask[q] && dist[q] < 0) { dist[q] = dist[c] + 1; queue.push(q); } });
            }

            let lPath = 0;

            for (let c = 0; c < n; c++) { if (outlet[c] && dist[c] > lPath) { lPath = dist[c]; } }

            // Trim the wells: use the distance between the port edges.
            let dIn = Infinity;

            for (let c = 0; c < n; c++) { if (outlet[c] && dist[c] >= 0 && dist[c] < dIn) { dIn = dist[c]; } }

            const lPathUm = Math.max((isFinite(dIn) ? dIn : lPath) * px, px);

            // Cross-section width along the path.
            const profile = {};

            for (let c = 0; c < n; c++) {

                if (dist[c] >= 0 && !inlet[c] && !outlet[c]) { profile[dist[c]] = (profile[dist[c]] || 0) + 1; }
            }

            const keys = Object.keys(profile).map(Number).sort(function (a, b) { return a - b; });

            const lo = Math.floor(keys.length * 0.15);
            const hi = Math.ceil(keys.length * 0.85);
            const mid = keys.slice(lo, hi).map(function (kx) { return profile[kx] * px; });

            const wMin = mid.length ? Math.min.apply(null, mid) : 0;
            const wMax = mid.length ? Math.max.apply(null, mid) : 0;

            const area = cnt * px * px;                                          // um2
            const wEff = squares > 0 ? Math.max(squares * lPathUm, 1) : area / lPathUm;

            // Rectangular-channel correction for the finite height.
            const corr = Math.max(0.2, 1 - 0.63 * Math.min(h / Math.max(wEff, 1), 1));

            const hm = h * 1e-6;
            const rHyd = squares > 0 ? 12 * MU / (hm * hm * hm * squares * corr) : Infinity;        // Pa s / m3

            return {
                k: k, h: h, area: area, volume: area * h * 1e-9 * 1e-3 * 1e3,                       // um3 -> uL (1 uL = 1e9 um3)
                squares: squares, wEff: wEff, lPath: lPathUm, rHyd: rHyd, wMin: wMin, wMax: wMax, connected: sol.connected
            };
        };

        const ap = netSummary(apical, apRoot);
        const ba = netSummary(baso, baRoot);

        ap.volume = ap.area * ap.h * 1e-9;
        ba.volume = ba.area * ba.h * 1e-9;

        if (!ap.connected || !ba.connected) {

            notes.push("A channel does not actually connect its inlet to its outlet through open fluid.");

            return failDev("A channel is blocked between its inlet and outlet", "blocked");
        }

        // Dead ends and pockets: fluid not on a functional network.
        let pocketArea = 0;

        chIdx.forEach(function (k) {

            for (let c = 0; c < n; c++) {

                if (CH[k][c] && roots.indexOf(nodeAt(k, c)) < 0) { pocketArea += px * px; }
            }
        });

        // Electrodes: which fluid does each one touch?
        const sRoots = function (lbl) {

            return Object.keys(ctx.netLabel).filter(function (kk) { return ctx.netLabel[kk][lbl]; }).map(Number);
        };

        const aRoots = sRoots("A");
        const bRoots = sRoots("B");

        const wetted = function (rootsList) {

            const out = { mask: new Uint8Array(n), area: 0, side: {}, metal: {}, count: 0 };

            if (!rootsList.length) { return out; }

            for (let m = 0; m < nl; m++) {

                if (!ctx.conductive[m]) { continue; }

                for (let c = 0; c < n; c++) {

                    if (!P[m][c] || rootsList.indexOf(ctx.nodeAt(m, c)) < 0) { continue; }

                    // Look both ways for the nearest channel that this metal touches directly.
                    let found = -1;

                    for (let dir = -1; dir <= 1 && found < 0; dir += 2) {

                        for (let q = m + dir; q >= 0 && q < nl; q += dir) {

                            const role = per[q].layer.role;

                            if (role === "channel" && CH[q][c]) { found = q; break; }

                            if (ctx.conductive[q]) { continue; }

                            if (separates(q, c)) { break; }
                        }
                    }

                    if (found >= 0) {

                        out.mask[c] = 1;
                        out.count += 1;
                        out.side[side(found)] = (out.side[side(found)] || 0) + 1;

                        const key = per[m].layer.material;

                        out.metal[key] = (out.metal[key] || 0) + 1;
                    }
                }
            }

            out.area = out.count * px * px;

            return out;
        };

        const eA = wetted(aRoots);
        const eB = wetted(bRoots);

        const dominant = function (tab) {

            let best = "";
            let cnt = -1;

            Object.keys(tab).forEach(function (kk) { if (tab[kk] > cnt) { cnt = tab[kk]; best = kk; } });

            return best;
        };

        const sideOf = function (e) { return dominant(e.side) || "none"; };

        const sA = sideOf(eA);
        const sB = sideOf(eB);

        if (!aRoots.length || !bRoots.length) {

            notes.push(!aRoots.length ? "No working electrode pad labelled A was found." : "No working electrode pad labelled B was found.");
        }

        // Toxic metal anywhere in the fluid.
        let toxicArea = 0;

        for (let m = 0; m < nl; m++) {

            if (!ctx.conductive[m]) { continue; }

            const tox = E.TOXIC[per[m].layer.material] || 0;

            if (!tox) { continue; }

            // Everything of this layer that touches fluid directly.
            for (let c = 0; c < n; c++) {

                if (!P[m][c]) { continue; }

                let touches = false;

                for (let dir = -1; dir <= 1 && !touches; dir += 2) {

                    for (let q = m + dir; q >= 0 && q < nl; q += dir) {

                        if (per[q].layer.role === "channel" && CH[q][c]) { touches = true; break; }

                        if (ctx.conductive[q]) { continue; }

                        if (separates(q, c)) { break; }
                    }
                }

                if (touches) { toxicArea += tox * px * px; }
            }
        }

        const viability = Math.exp(-1.5 * toxicArea * 1e-8 / Math.max(aB, 1e-6));

        if (toxicArea > 0 && viability < 0.9) { notes.push("Metal exposed to the culture medium is harming the cells."); }

        // How much of the barrier do both electrodes see?
        let nBoth = 0;

        let nElecA = 0;
        let nElecB = 0;

        for (let c = 0; c < n; c++) {

            if (eA.mask[c] && barrier[c] === 0) { /* electrode outside the barrier */ }

            if (barrier[c]) {

                if (eA.mask[c]) { nElecA += 1; }
                if (eB.mask[c]) { nElecB += 1; }
                if (eA.mask[c] && eB.mask[c]) { nBoth += 1; }
            }
        }

        const f0 = nB ? nBoth / nB : 0;
        const fGeo = Math.max(0.05, Math.min(1, f0 + 0.3 * (1 - f0)));

        // Medium resistance between the electrodes and the barrier, through the channel height and along it.
        const rho = 1 / KAPPA;                                                  // ohm m

        const across = function (h, aOverlapUm2, aElec) {

            const a = Math.max(aOverlapUm2, 0.05 * aElec, 1) * 1e-12;            // m2
            return rho * h * 1e-6 / a;
        };

        const aOvA = nElecA * px * px;
        const aOvB = nElecB * px * px;

        const rSolA = across(ap.h, aOvA, eA.area) + (aOvA > 0 ? 0 : rho * ap.lPath * 1e-6 / (ap.wEff * ap.h * 1e-12));
        const rSolB = across(ba.h, aOvB, eB.area) + (aOvB > 0 ? 0 : rho * ba.lPath * 1e-6 / (ba.wEff * ba.h * 1e-12));

        // Membrane.
        const mem = per[memTop].layer;
        const mm = MEMBRANES[mem.material] || MEMBRANES.pet;
        const poreD = mem.pore || mm.poreD;
        const porosity = mem.porosity || mm.porosity;

        // Process quality of the channel walls decides bonding and leaks.
        let qMin = 1;

        chIdx.forEach(function (k) { qMin = Math.min(qMin, per[k].p.quality); });

        const pLeak = Math.max(0, Math.min(0.9, 0.25 * Math.pow(1 - qMin, 1.5) + (per[apical].layer.material === "dryfilm" ? 0.05 : 0.01)));

        let status = "ok";
        let reason = "";

        if (rand() < pLeak) {

            status = "leaky";
            reason = "The channel bond failed and the chip leaks.";
        }

        // Hydrophobic drug loss into the walls.
        let absorb = 0;

        chIdx.forEach(function (k) { absorb = Math.max(absorb, (CHANNELS[per[k].layer.material] || {}).absorb || 0); });

        if (mm.cost !== undefined && memTop >= 0 && mem.material === "pdms") { absorb = Math.max(absorb, 0.6); }

        const bubbleRisk = Math.max(0, Math.min(0.5, 0.05 + 0.15 * Math.min(pocketArea > 0 ? 1 : 0, 1) + 0.1 * Math.max(0, (ap.wMax / Math.max(ap.wMin, 1)) - 1.5)));

        info.parts = {
            aB: aB, aCells: aCells, apical: ap, baso: ba, fGeo: fGeo, f0: f0, eAArea: eA.area, eBArea: eB.area,
            sideA: sA, sideB: sB, rSolA: rSolA, rSolB: rSolB, poreD: poreD, porosity: porosity, tMem: mem.thickness,
            pocketArea: pocketArea, viability: viability, pLeak: pLeak, absorb: absorb, bubbleRisk: bubbleRisk
        };

        info.areaPlus = eA.area;
        info.areaMinus = eB.area;
        info.pShort = pLeak;
        info.gapMin = Math.min(ap.wMin || Infinity, ba.wMin || Infinity);
        info.resolutionUm = px;

        if (sA === sB && aRoots.length && bRoots.length) {

            notes.push("Both electrodes sit in the same channel, so the TEER reading will not cross the barrier.");
        }

        if (sA === "none" || sB === "none") { notes.push("An electrode does not touch fluid, so it cannot measure anything. Put it in a channel (no insulation over it)."); }

        if (poreD >= 3) { notes.push("Pores of " + poreD + " µm or more let endothelial cells squeeze through to the other side."); }

        // Cell culture design.
        const culture = design.culture || { cells: "hcmec", co: "none", coat: "col4", days: 7, flow: 5, flowB: 1 };

        const dev = {
            kind: "bbb", status: status, reason: reason, quality: qMin, life: 1, vMax: 1,
            aB: aB, aCells: aCells, apical: ap, baso: ba, fGeo: fGeo, f0: f0,
            eAArea: eA.area * 1e-8, eBArea: eB.area * 1e-8,
            eAMetal: dominant(eA.metal) || "pt", eBMetal: dominant(eB.metal) || "pt",
            sideA: sA, sideB: sB, rSolA: rSolA, rSolB: rSolB,
            membrane: mem.material, poreD: poreD, porosity: porosity, tMem: mem.thickness,
            absorb: absorb, viability: viability, bubbleRisk: bubbleRisk, pocketArea: pocketArea,
            culture: culture, mu: MU, kappa: KAPPA,
            variation: vary(0.2), seedRoll: rand(), rShort: 50
        };

        return finish(dev);
    }


    function check(design, out, labels) {

        const layers = design.layers.filter(function (l) { return l.shapes.length; });

        if (!layers.some(function (l) { return l.role === "channel"; })) {

            out.push({ level: "error", text: "A BBB chip needs at least one fluidic channel layer. Add a channel layer and draw the channels." });
        }

        if (!layers.some(function (l) { return l.role === "membrane"; })) {

            out.push({ level: "warn", text: "There is no membrane layer. The barrier cells need a porous membrane to grow on." });
        }

        layers.forEach(function (l) {

            if (l.role !== "channel") { return; }

            const has = function (lbl) { return l.shapes.some(function (s) { return s.pad === lbl; }); };

            if (!has("I") || !has("O")) {

                out.push({ level: "warn", text: l.name + " needs an inlet (I) and an outlet (O) port. Draw each as a pad on this layer, overlapping the channel." });
            }
        });
    }


    E.registerKind("bbb", { analyze: analyze, buildTemplate: buildTemplate, check: check, templates: TEMPLATES, cells: 400000, featDiv: 15 });

    E.bbbGeometry = geometry;

}(typeof window !== "undefined" ? window : globalThis));
