/* ========================================
   MEMS DEVICES: THE MECHANICS SOLVER

   Turns the pieces of a fabricated MEMS layout (lab-mems-engine.js) into a
   small frame model and solves it:

   - blocks that touch are one rigid cluster (a proof mass, a mirror plate,
     an anchor pad); thin beams between clusters are elastic beams;
   - thin pieces that stick out of one cluster with a free end (comb
     fingers) are treated as rigid and add their mass to it;
   - anything fixed by an anchor, or still held to the substrate by oxide,
     cannot move;
   - each beam is a three-dimensional Euler-Bernoulli element with
     stretching, torsion and bending in both planes, clamped to the
     clusters at its ends through rigid offsets.

   From this come the stiffness, natural frequencies and mode shapes, the
   static response to an acceleration, and the stress in every beam.

   All lengths in the pieces are micrometres; the solver works in SI.
======================================== */

(function (root) {

    "use strict";

    const UM = 1e-6;
    const LC = 1e-4;                     // length that scales rotations to the size of translations


    /* ------------------------------------------------
       SMALL DENSE LINEAR ALGEBRA
    ------------------------------------------------ */

    function luFactor(A, n) {

        const a = new Float64Array(A);
        const piv = new Int32Array(n);

        let scale = 0;

        for (let i = 0; i < n * n; i++) { const v = Math.abs(a[i]); if (v > scale) { scale = v; } }

        for (let k = 0; k < n; k++) {

            let p = k;
            let best = Math.abs(a[k * n + k]);

            for (let i = k + 1; i < n; i++) { const v = Math.abs(a[i * n + k]); if (v > best) { best = v; p = i; } }

            piv[k] = p;

            if (best < 1e-13 * scale) { return null; }

            if (p !== k) { for (let j = 0; j < n; j++) { const t = a[k * n + j]; a[k * n + j] = a[p * n + j]; a[p * n + j] = t; } }

            const d = a[k * n + k];

            for (let i = k + 1; i < n; i++) {

                const f = a[i * n + k] / d;

                if (f === 0) { continue; }

                a[i * n + k] = f;

                for (let j = k + 1; j < n; j++) { a[i * n + j] -= f * a[k * n + j]; }
            }
        }

        return { a: a, piv: piv, n: n };
    }

    function luSolve(lu, b) {

        const n = lu.n;
        const x = new Float64Array(b);

        // Apply every row interchange first, then eliminate with the unit lower factor.
        for (let k = 0; k < n; k++) {

            const p = lu.piv[k];

            if (p !== k) { const t = x[k]; x[k] = x[p]; x[p] = t; }
        }

        for (let k = 0; k < n; k++) {

            for (let i = k + 1; i < n; i++) { x[i] -= lu.a[i * n + k] * x[k]; }
        }

        for (let k = n - 1; k >= 0; k--) {

            let s = x[k];

            for (let j = k + 1; j < n; j++) { s -= lu.a[k * n + j] * x[j]; }

            x[k] = s / lu.a[k * n + k];
        }

        return x;
    }

    // Eigenvalues and vectors of a symmetric matrix by cyclic Jacobi rotations.
    function jacobi(A, n) {

        const a = new Float64Array(A);
        const v = new Float64Array(n * n);

        for (let i = 0; i < n; i++) { v[i * n + i] = 1; }

        for (let sweep = 0; sweep < 60; sweep++) {

            let off = 0;

            for (let i = 0; i < n; i++) { for (let j = i + 1; j < n; j++) { off += a[i * n + j] * a[i * n + j]; } }

            let diag = 0;

            for (let i = 0; i < n; i++) { diag += a[i * n + i] * a[i * n + i]; }

            if (off <= 1e-26 * Math.max(diag, 1e-300)) { break; }

            for (let p = 0; p < n - 1; p++) {

                for (let q = p + 1; q < n; q++) {

                    const apq = a[p * n + q];

                    if (Math.abs(apq) < 1e-300) { continue; }

                    const theta = (a[q * n + q] - a[p * n + p]) / (2 * apq);
                    const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
                    const c = 1 / Math.sqrt(t * t + 1);
                    const s = t * c;

                    for (let k = 0; k < n; k++) {

                        const akp = a[k * n + p];
                        const akq = a[k * n + q];

                        a[k * n + p] = c * akp - s * akq;
                        a[k * n + q] = s * akp + c * akq;
                    }

                    for (let k = 0; k < n; k++) {

                        const apk = a[p * n + k];
                        const aqk = a[q * n + k];

                        a[p * n + k] = c * apk - s * aqk;
                        a[q * n + k] = s * apk + c * aqk;
                    }

                    for (let k = 0; k < n; k++) {

                        const vkp = v[k * n + p];
                        const vkq = v[k * n + q];

                        v[k * n + p] = c * vkp - s * vkq;
                        v[k * n + q] = s * vkp + c * vkq;
                    }
                }
            }
        }

        const vals = new Float64Array(n);

        for (let i = 0; i < n; i++) { vals[i] = a[i * n + i]; }

        return { vals: vals, vecs: v };
    }


    /* ------------------------------------------------
       BEAM ELEMENT
    ------------------------------------------------ */

    // 12 by 12 stiffness of a straight beam in its own axes: x along the beam, y in the plane, z up.
    function beamLocal(L, EA, GJ, EIz, EIy) {

        const k = new Float64Array(144);
        const set = function (i, j, v) { k[i * 12 + j] = v; };

        // axial
        set(0, 0, EA / L); set(0, 6, -EA / L); set(6, 0, -EA / L); set(6, 6, EA / L);

        // torsion
        set(3, 3, GJ / L); set(3, 9, -GJ / L); set(9, 3, -GJ / L); set(9, 9, GJ / L);

        // bending in the plane (v, thetaZ)
        const a = EIz / (L * L * L);

        const bz = [[12, 6 * L, -12, 6 * L], [6 * L, 4 * L * L, -6 * L, 2 * L * L], [-12, -6 * L, 12, -6 * L], [6 * L, 2 * L * L, -6 * L, 4 * L * L]];
        const iz = [1, 5, 7, 11];

        for (let i = 0; i < 4; i++) { for (let j = 0; j < 4; j++) { set(iz[i], iz[j], a * bz[i][j]); } }

        // bending out of the plane (w, thetaY)
        const c = EIy / (L * L * L);

        const by = [[12, -6 * L, -12, -6 * L], [-6 * L, 4 * L * L, 6 * L, 2 * L * L], [-12, 6 * L, 12, 6 * L], [-6 * L, 2 * L * L, 6 * L, 4 * L * L]];
        const iy = [2, 4, 8, 10];

        for (let i = 0; i < 4; i++) { for (let j = 0; j < 4; j++) { set(iy[i], iy[j], c * by[i][j]); } }

        return k;
    }

    function rotation12(cs, sn) {

        // Maps local to global for the four 3-vectors of a beam (rotation about z).
        const L = new Float64Array(144);

        for (let b = 0; b < 4; b++) {

            const o = b * 3;

            L[(o) * 12 + o] = cs; L[(o) * 12 + o + 1] = -sn;
            L[(o + 1) * 12 + o] = sn; L[(o + 1) * 12 + o + 1] = cs;
            L[(o + 2) * 12 + o + 2] = 1;
        }

        return L;
    }

    function matMul12(A, B) {

        const C = new Float64Array(144);

        for (let i = 0; i < 12; i++) {

            for (let k = 0; k < 12; k++) {

                const a = A[i * 12 + k];

                if (a === 0) { continue; }

                for (let j = 0; j < 12; j++) { C[i * 12 + j] += a * B[k * 12 + j]; }
            }
        }

        return C;
    }

    function transpose12(A) {

        const T = new Float64Array(144);

        for (let i = 0; i < 12; i++) { for (let j = 0; j < 12; j++) { T[j * 12 + i] = A[i * 12 + j]; } }

        return T;
    }

    // Rigid offset: end displacements from the reference node's displacements, for an offset r (metres).
    function offsetMatrix(r) {

        const T = new Float64Array(36);

        for (let i = 0; i < 6; i++) { T[i * 6 + i] = 1; }

        T[0 * 6 + 4] = r[2]; T[0 * 6 + 5] = -r[1];
        T[1 * 6 + 3] = -r[2]; T[1 * 6 + 5] = r[0];
        T[2 * 6 + 3] = r[1]; T[2 * 6 + 4] = -r[0];

        return T;
    }


    /* ------------------------------------------------
       BUILDING THE FRAME
    ------------------------------------------------ */

    function pointInBlock(pc, x, y, tol) {

        if (pc.rect) {

            const r = pc.rect;

            return x >= r.x0 - tol && x <= r.x1 + tol && y >= r.y0 - tol && y <= r.y1 + tol;
        }

        return false;
    }

    function distToPoly(poly, x, y, G) {

        if (G.pointInPoly(x, y, poly)) { return 0; }

        let best = Infinity;

        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {

            const d = G.pointSegDist2(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);

            if (d < best) { best = d; }
        }

        return Math.sqrt(best);
    }

    function buildFrame(dev, G) {

        const M = dev.mems;
        const frame = { ok: false, problems: [], notes: [], clusters: [], beams: [], pieceCluster: {}, ndof: 0 };

        if (!M) { frame.problems.push("The layout did not print."); return frame; }

        const L = {};

        M.layers.forEach(function (l) { L[l.k] = l; });

        const sp = M.pieces.filter(function (p) { return p.role === "structure"; });
        const byId = {};

        M.pieces.forEach(function (p) { byId[p.id] = p; });

        // A piece is fixed if it sits on the nitride, has an anchor under it, or is still held by oxide.
        const fixed = {};
        const why = {};

        sp.forEach(function (p) {

            const li = L[p.layer];

            if (li.fixedBase) { fixed[p.id] = true; why[p.id] = "base"; return; }

            if (p.unreleased >= Math.max(4, 0.05 * p.area)) { fixed[p.id] = true; why[p.id] = "stuck"; }

            const anchored = p.anchored >= Math.max(2, 0.02 * p.area) || (p.type === "beam" && p.anchored >= 0.5 * p.w * p.w);

            if (anchored) { fixed[p.id] = true; if (why[p.id] !== "stuck") { why[p.id] = "anchor"; } }
        });

        // Pieces joined by a via through the oxide move together (or are fixed together).
        const uf = {};

        sp.forEach(function (p) { uf[p.id] = p.id; });

        const find = function (a) { while (uf[a] !== a) { uf[a] = uf[uf[a]]; a = uf[a]; } return a; };
        const join = function (a, b) { const x = find(a); const y = find(b); if (x !== y) { uf[Math.max(x, y)] = Math.min(x, y); } };

        const isBlock = function (p) { return p.type !== "beam"; };

        M.touch.forEach(function (t) {

            const a = byId[t[0]];
            const b = byId[t[1]];

            if (!a || !b || a.role !== "structure" || b.role !== "structure") { return; }
            if (isBlock(a) && isBlock(b)) { join(a.id, b.id); }
        });

        Object.keys(M.vias).forEach(function (key) {

            const parts = key.split("_");
            const a = byId[Number(parts[0])];
            const b = byId[Number(parts[1])];

            if (!a || !b || a.role !== "structure" || b.role !== "structure") { return; }

            if (M.vias[key] * M.px * M.px < 2) { return; }

            if (isBlock(a) && isBlock(b)) { join(a.id, b.id); }
            else if (fixed[b.id]) { fixed[a.id] = true; if (!why[a.id]) { why[a.id] = "anchor"; } }
        });

        // Clusters of blocks.
        const cl = {};

        sp.forEach(function (p) {

            if (!isBlock(p)) { return; }
            if (L[p.layer].fixedBase) { return; }

            const r = find(p.id);

            (cl[r] = cl[r] || { id: r, pieces: [], fixed: false, why: "" }).pieces.push(p);
        });

        const clusters = Object.keys(cl).map(function (k) { return cl[k]; });

        clusters.forEach(function (c) {

            c.pieces.forEach(function (p) { if (fixed[p.id]) { c.fixed = true; c.why = c.why || why[p.id]; if (why[p.id] === "stuck") { c.why = "stuck"; } } });

            c.pieces.forEach(function (p) { frame.pieceCluster[p.id] = c; });
        });

        // Anchors from the first layer or beams fixed outright are handled as fixed nodes below.
        const nodes = [];

        clusters.forEach(function (c) {

            // Reference point: area-weighted centre, at the mid-plane of the layers.
            let a = 0;
            let x = 0;
            let y = 0;
            let z = 0;

            c.pieces.forEach(function (p) {

                const li = L[p.layer];

                a += p.area;
                x += p.area * p.cx;
                y += p.area * p.cy;
                z += p.area * 0.5 * (li.z0 + li.z1);
            });

            c.ref = [x / Math.max(a, 1e-9), y / Math.max(a, 1e-9), z / Math.max(a, 1e-9)];
            c.node = { kind: "cluster", cl: c, ref: c.ref, fixed: c.fixed, mass: 0, jxx: 0, jyy: 0, jzz: 0, deg: 0, id: nodes.length };

            nodes.push(c.node);
        });

        // Beams: attach their ends.
        const beams = sp.filter(function (p) { return p.type === "beam" && !L[p.layer].fixedBase; });
        const blocksOf = function (layer) { return clusters.reduce(function (acc, c) { c.pieces.forEach(function (p) { if (p.layer === layer) { acc.push({ p: p, c: c }); } }); return acc; }, []); };

        const blocksByLayer = {};

        beams.forEach(function (b) { if (!blocksByLayer[b.layer]) { blocksByLayer[b.layer] = blocksOf(b.layer); } });

        const joints = [];

        const jointAt = function (x, y, layer, w) {

            const tol = 0.8 * w + 0.5;

            for (let i = 0; i < joints.length; i++) {

                const j = joints[i];

                if (j.layer === layer && Math.hypot(j.ref[0] - x, j.ref[1] - y) <= tol) { return j; }
            }

            const li = L[layer];
            const nd = { kind: "joint", ref: [x, y, 0.5 * (li.z0 + li.z1)], layer: layer, fixed: false, mass: 0, jxx: 0, jyy: 0, jzz: 0, deg: 0, id: nodes.length };

            joints.push(nd);
            nodes.push(nd);

            return nd;
        };

        const elems = [];

        beams.forEach(function (b) {

            const dx = b.p2[0] - b.p1[0];
            const dy = b.p2[1] - b.p1[1];
            const len = Math.hypot(dx, dy);
            const ux = dx / len;
            const uy = dy / len;
            const tolAttach = 0.6 + 0.5 * b.w;

            const bl = blocksByLayer[b.layer] || [];

            // Where does the beam leave the blocks at each end?
            const ends = [0, 1].map(function (e) {

                const x0 = e === 0 ? b.p1[0] : b.p2[0];
                const y0 = e === 0 ? b.p1[1] : b.p2[1];
                const sgn = e === 0 ? 1 : -1;

                let hit = null;
                let best = Infinity;

                bl.forEach(function (q) {

                    const d = distToPoly(q.p.poly, x0, y0, G);

                    if (d < best) { best = d; hit = q; }
                });

                if (!hit || best > tolAttach) { return { cluster: null, inside: 0, x: x0, y: y0 }; }

                // Walk inwards until the beam leaves every attached block.
                let inside = 0;

                for (let s = 0; s <= len; s += 0.25) {

                    const x = x0 + sgn * ux * s;
                    const y = y0 + sgn * uy * s;

                    let inAny = false;

                    for (let m = 0; m < bl.length; m++) { if (bl[m].c === hit.c && distToPoly(bl[m].p.poly, x, y, G) <= 0.05) { inAny = true; break; } }

                    if (!inAny) { break; }

                    inside = s;
                }

                return { cluster: hit.c, inside: inside, x: x0 + sgn * ux * inside, y: y0 + sgn * uy * inside };
            });

            const Leff = len - ends[0].inside - ends[1].inside;
            const li = L[b.layer];
            const zmid = 0.5 * (li.z0 + li.z1);

            const mass = li.rho * b.t * b.w * len * 1e-18 * (1 + 0.0);

            const metal = M.metal;
            const mMass = metal && b.metalFrac > 0 ? 19300 * metal.t * b.w * len * b.metalFrac * 1e-18 : 0;

            const rec = { piece: b, layer: b.layer, w: b.w, t: b.t, len: len, Leff: Leff, mass: mass + mMass, ends: ends, zmid: zmid, ux: ux, uy: uy, li: li, fixed: !!fixed[b.id] };

            // Rigid, fixed or too short to matter.
            elems.push(rec);
        });

        // Decide node for each beam end.
        elems.forEach(function (e) {

            e.nodes = [0, 1].map(function (k) {

                const end = e.ends[k];

                if (end.cluster) { return end.cluster.node; }

                return jointAt(end.x, end.y, e.layer, e.w);
            });
        });

        elems.forEach(function (e) {

            if (e.fixed) {

                // A fixed beam is rigid and fixed: its end nodes cannot move.
                e.nodes.forEach(function (nd) { nd.fixed = true; });
                e.dead = true;
                e.lump = null;

                return;
            }

            if (e.nodes[0] === e.nodes[1] || e.Leff < 0.5 * e.w) {

                // Both ends in the same rigid cluster, or too short to bend.
                if (e.nodes[0] !== e.nodes[1] && e.Leff < 0.5 * e.w) {

                    // Merge the two nodes into one by treating the beam as a rigid link: lump and tie.
                    e.rigid = true;
                }

                if (e.nodes[0] === e.nodes[1]) { e.dead = true; e.lump = e.nodes[0]; }
            }
        });

        // Rigid links: merge their nodes.
        const nodeRoot = {};

        nodes.forEach(function (nd) { nodeRoot[nd.id] = nd.id; });

        const nfind = function (a) { while (nodeRoot[a] !== a) { nodeRoot[a] = nodeRoot[nodeRoot[a]]; a = nodeRoot[a]; } return a; };

        elems.forEach(function (e) { if (e.rigid && !e.dead) { const a = nfind(e.nodes[0].id); const b = nfind(e.nodes[1].id); if (a !== b) { nodeRoot[Math.max(a, b)] = Math.min(a, b); } e.dead = true; e.lump = e.nodes[0]; } });

        const canon = function (nd) { return nodes[nfind(nd.id)]; };

        elems.forEach(function (e) { e.nodes = [canon(e.nodes[0]), canon(e.nodes[1])]; });

        nodes.forEach(function (nd) { const r = canon(nd); if (r !== nd) { if (nd.fixed) { r.fixed = true; } } });

        // Degree of every node and pruning of stubs (comb fingers and the like).
        const live = function () { return elems.filter(function (e) { return !e.dead; }); };

        const degree = function (nd) { return live().filter(function (e) { return e.nodes[0] === nd || e.nodes[1] === nd; }).length; };

        let changed = true;

        while (changed) {

            changed = false;

            live().forEach(function (e) {

                if (e.dead) { return; }

                [0, 1].forEach(function (k) {

                    const nd = e.nodes[k];
                    const other = e.nodes[1 - k];

                    if (e.dead) { return; }

                    if (nd.kind === "joint" && !nd.fixed && degree(nd) === 1) {

                        // A dangling end: the beam is a cantilever stub stuck on the other node, so lump it there.
                        e.dead = true;
                        e.lump = other;
                        e.stubOf = other;
                        changed = true;
                    }
                });
            });
        }

        // Masses and inertias.
        nodes.forEach(function (nd) { if (nd.kind === "cluster") { nd.cl.pieces.forEach(function (p) { addPieceMass(nd, p, L, M); }); } });

        // Pieces of a merged node still add their mass to the surviving node.
        nodes.forEach(function (nd) {

            const r = canon(nd);

            if (r !== nd && nd.kind === "cluster") { r.mass += nd.mass; r.jxx += nd.jxx; r.jyy += nd.jyy; r.jzz += nd.jzz; nd.mass = 0; nd.jxx = 0; nd.jyy = 0; nd.jzz = 0; }
        });

        elems.forEach(function (e) {

            if (e.dead) {

                const target = e.lump || e.nodes[0];

                if (target && !target.fixed) {

                    const mid = [(e.ends[0].x + e.ends[1].x) / 2, (e.ends[0].y + e.ends[1].y) / 2];
                    const dxm = (mid[0] - target.ref[0]) * UM;
                    const dym = (mid[1] - target.ref[1]) * UM;

                    target.mass += e.mass;
                    target.jzz += e.mass * (dxm * dxm + dym * dym) + e.mass * Math.pow(e.len * UM, 2) / 12;
                    target.jxx += e.mass * dym * dym;
                    target.jyy += e.mass * dxm * dxm;
                }

                if (e.lump) { frame.pieceCluster[e.piece.id] = e.lump.cl || e.lump; }

                return;
            }

            // Half of the mass at each end.
            e.nodes.forEach(function (nd) { if (!nd.fixed) { nd.mass += e.mass / 2; } });
        });

        const alive = elems.filter(function (e) { return !e.dead; });

        // Components: a piece of the structure with nothing fixed is loose and gone.
        const adj = {};

        const used = {};

        alive.forEach(function (e) { used[e.nodes[0].id] = true; used[e.nodes[1].id] = true; });

        nodes.forEach(function (nd) { if (canon(nd) === nd && (nd.kind === "cluster" || used[nd.id])) { adj[nd.id] = []; } });

        alive.forEach(function (e) { adj[e.nodes[0].id].push(e.nodes[1].id); adj[e.nodes[1].id].push(e.nodes[0].id); });

        const seen = {};
        const keep = {};
        const loose = [];

        Object.keys(adj).forEach(function (k) {

            if (seen[k]) { return; }

            const stack = [Number(k)];
            const comp = [];
            let grounded = false;

            seen[k] = true;

            while (stack.length) {

                const u = stack.pop();

                comp.push(u);

                if (nodes[u].fixed) { grounded = true; }

                adj[u].forEach(function (v) { if (!seen[v]) { seen[v] = true; stack.push(v); } });
            }

            comp.forEach(function (u) { keep[u] = grounded; });

            if (!grounded) { loose.push(comp); }
        });

        const freeNodes = Object.keys(keep).filter(function (k) { return keep[k] && !nodes[Number(k)].fixed; }).map(function (k) { return nodes[Number(k)]; });

        freeNodes.forEach(function (nd, i) { nd.index = i; });

        const n = freeNodes.length * 6;

        frame.nodes = nodes;
        frame.free = freeNodes;
        frame.ndof = n;
        frame.loose = loose.map(function (comp) { return comp.map(function (u) { return nodes[u]; }); });
        frame.elems = alive.filter(function (e) { return keep[e.nodes[0].id] && keep[e.nodes[1].id]; });
        frame.dead = elems.filter(function (e) { return e.dead; });
        frame.clusters = clusters;

        frame.clusters.forEach(function (c) { c.node = canon(c.node); });

        // Assemble K.
        const K = new Float64Array(n * n);

        frame.elems.forEach(function (e) {

            const A = e.w * e.t * UM * UM;
            const Eb = e.li.E * 1e9;
            const nu = e.li.nu || 0.22;
            const Gb = Eb / (2 * (1 + nu));
            const w = e.w * UM;
            const t = e.t * UM;
            const Lm = e.Leff * UM;

            const f = e.piece.metalFrac || 0;
            const Em = 79e9;
            const tm = M.metal ? M.metal.t * UM : 0;

            let EA = Eb * A;
            let EIz = Eb * t * w * w * w / 12;
            let EIy = Eb * w * t * t * t / 12;

            if (f > 0 && tm > 0) {

                EA += f * Em * w * tm;
                EIz += f * Em * tm * w * w * w / 12;

                const comp = w * (Eb * t * t * t / 12 + Em * tm * tm * tm / 12 + (Eb * t * Em * tm / (Eb * t + Em * tm)) * Math.pow(t + tm, 2) / 4);

                EIy = (1 - f) * EIy + f * comp;
            }

            const a = Math.max(w, t);
            const b = Math.min(w, t);
            const J = a * b * b * b / 3 * (1 - 0.63 * b / a);

            e.EA = EA; e.EIz = EIz; e.EIy = EIy; e.GJ = Gb * J;

            const Kl = beamLocal(Lm, EA, Gb * J, EIz, EIy);
            const Lam = rotation12(e.ux, e.uy);
            const Kg = matMul12(matMul12(Lam, Kl), transpose12(Lam));

            e.Kg = Kg;

            // Rigid offsets from each node's reference to the end of the beam.
            e.T = [0, 1].map(function (k) {

                const nd = e.nodes[k];
                const ex = e.ends[k].x + (k === 0 ? e.ux : -e.ux) * 0;
                const ey = e.ends[k].y;

                // Attach points sit where the beam leaves the block.
                const px = k === 0 ? e.ends[0].x : e.ends[1].x;
                const py = k === 0 ? e.ends[0].y : e.ends[1].y;

                return offsetMatrix([(px - nd.ref[0]) * UM, (py - nd.ref[1]) * UM, (e.zmid - nd.ref[2]) * UM]);
            });

            // Index map for the two end nodes.
            const idx = e.nodes.map(function (nd) { return nd.fixed || nd.index === undefined ? -1 : nd.index * 6; });

            e.idx = idx;

            for (let a1 = 0; a1 < 2; a1++) {

                if (idx[a1] < 0) { continue; }

                for (let b1 = 0; b1 < 2; b1++) {

                    if (idx[b1] < 0) { continue; }

                    // Block (a1, b1) of Kg is rows 6*a1.., cols 6*b1..; K += T_a^T Kg_ab T_b
                    const T1 = e.T[a1];
                    const T2 = e.T[b1];

                    const tmp = new Float64Array(36);

                    for (let i = 0; i < 6; i++) { for (let j = 0; j < 6; j++) { let s = 0; for (let q = 0; q < 6; q++) { s += Kg[(6 * a1 + i) * 12 + 6 * b1 + q] * T2[q * 6 + j]; } tmp[i * 6 + j] = s; } }

                    for (let i = 0; i < 6; i++) {

                        for (let j = 0; j < 6; j++) {

                            let s = 0;

                            for (let q = 0; q < 6; q++) { s += T1[q * 6 + i] * tmp[q * 6 + j]; }

                            K[(idx[a1] + i) * n + idx[b1] + j] += s;
                        }
                    }
                }
            }
        });

        // Mass matrix (diagonal).
        const Md = new Float64Array(n);

        freeNodes.forEach(function (nd) {

            const o = nd.index * 6;

            Md[o] = nd.mass; Md[o + 1] = nd.mass; Md[o + 2] = nd.mass;
            Md[o + 3] = nd.jxx; Md[o + 4] = nd.jyy; Md[o + 5] = nd.jzz;
        });

        frame.K = K;
        frame.Md = Md;

        // Problems.
        sp.forEach(function (p) {

            if (why[p.id] === "stuck" && !L[p.layer].fixedBase && p.area > 50) { frame.problems.push("A " + (isBlock(p) ? "block" : "beam") + " of " + Math.round(p.area) + " µm² near (" + Math.round(p.cx) + ", " + Math.round(p.cy) + ") is still held to the substrate by oxide: it was not released. Add release holes or etch longer."); }
        });

        const stuckMsg = {};

        frame.problems = frame.problems.filter(function (t) { if (stuckMsg[t]) { return false; } stuckMsg[t] = 1; return true; });

        if (frame.loose.length) { frame.problems.push(frame.loose.length + " loose piece" + (frame.loose.length > 1 ? "s are" : " is") + " not connected to any anchor and would wash away in the release."); }

        frame.ok = n > 0;

        if (!frame.ok) { frame.problems.push("Nothing in the structure is free to move: everything is fixed to the substrate, or no piece is tied to an anchor."); }

        frame.fixedWhy = why;

        return frame;
    }

    function addPieceMass(nd, p, L, M) {

        const li = L[p.layer];
        const rho = li.rho;
        const m = rho * p.area * p.t * 1e-18;
        const mm = M.metal && p.metalFrac > 0 ? 19300 * p.metalFrac * p.area * M.metal.t * 1e-18 : 0;
        const tot = m + mm;

        const dx = (p.cx - nd.ref[0]) * UM;
        const dy = (p.cy - nd.ref[1]) * UM;
        const rhoA = tot / Math.max(p.area, 1e-9);                  // kg per um2

        // Inertia from the piece's own spread plus its distance from the reference.
        const ixx = (p.ixx || 0) * rhoA * 1e-12;                    // sum (y - cy)^2 dA, um4 -> m2 * kg/um2 ... (um2 -> 1e-12 m2)
        const iyy = (p.iyy || 0) * rhoA * 1e-12;

        nd.mass += tot;
        nd.jzz += ixx + iyy + tot * (dx * dx + dy * dy);
        nd.jxx += ixx + tot * dy * dy + tot * Math.pow(p.t * UM, 2) / 12;
        nd.jyy += iyy + tot * dx * dx + tot * Math.pow(p.t * UM, 2) / 12;
    }


    /* ------------------------------------------------
       SOLVING
    ------------------------------------------------ */

    function scaleOf(n) {

        const s = new Float64Array(n);

        for (let i = 0; i < n; i++) { s[i] = i % 6 >= 3 ? 1 / LC : 1; }

        return s;
    }

    // Static displacement under a uniform acceleration (m/s2): returns a Float64Array of dofs (m and rad).
    function accelerate(frame, ax, ay, az) {

        const n = frame.ndof;

        if (!n) { return null; }

        if (!frame.lu) {

            const s = scaleOf(n);
            const A = new Float64Array(n * n);

            for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) { A[i * n + j] = frame.K[i * n + j] * s[i] * s[j]; } }

            frame.lu = luFactor(A, n);
            frame.sc = s;
        }

        if (!frame.lu) { return null; }

        const f = new Float64Array(n);

        for (let i = 0; i < frame.free.length; i++) {

            const nd = frame.free[i];

            f[i * 6] = -nd.mass * ax;
            f[i * 6 + 1] = -nd.mass * ay;
            f[i * 6 + 2] = -nd.mass * az;
        }

        // Scaled system: (S K S) q = S f with u = S q.
        const b = new Float64Array(n);

        for (let i = 0; i < n; i++) { b[i] = f[i] * frame.sc[i]; }

        const q = luSolve(frame.lu, b);
        const u = new Float64Array(n);

        for (let i = 0; i < n; i++) { u[i] = q[i] * frame.sc[i]; }

        return u;
    }

    // Static displacement for forces given at the free nodes: loads[nodeIndex] = [fx, fy, fz, mx, my, mz].
    function solveLoads(frame, loads) {

        const n = frame.ndof;

        if (!n) { return null; }

        accelerate(frame, 0, 0, 0);

        if (!frame.lu) { return null; }

        const b = new Float64Array(n);

        Object.keys(loads).forEach(function (k) {

            const i = Number(k);

            for (let d = 0; d < 6; d++) { b[i * 6 + d] = (loads[k][d] || 0) * frame.sc[i * 6 + d]; }
        });

        const q = luSolve(frame.lu, b);
        const u = new Float64Array(n);

        for (let i = 0; i < n; i++) { u[i] = q[i] * frame.sc[i]; }

        return u;
    }

    // Natural frequencies and mode shapes, lowest first. Massless freedoms are condensed out.
    function modes(frame, count) {

        if (frame.modesCache && frame.modesCache.count >= count) { return frame.modesCache.list.slice(0, count); }

        const n = frame.ndof;

        if (!n) { return []; }

        const s = scaleOf(n);

        const mass = [];
        const rest = [];

        for (let i = 0; i < n; i++) { (frame.Md[i] * s[i] * s[i] > 1e-30 ? mass : rest).push(i); }

        // Work in the scaled coordinates: K' = S K S, M' = S^-1 M S^-1.
        const Ks = function (i, j) { return frame.K[i * n + j] * s[i] * s[j]; };
        const Ms = function (i) { return frame.Md[i] * s[i] * s[i]; };

        const na = mass.length;
        const nb = rest.length;

        const Kaa = new Float64Array(na * na);

        for (let i = 0; i < na; i++) { for (let j = 0; j < na; j++) { Kaa[i * na + j] = Ks(mass[i], mass[j]); } }

        let Kred = Kaa;
        let Tback = null;

        if (nb) {

            const Kbb = new Float64Array(nb * nb);
            const Kba = new Float64Array(nb * na);

            for (let i = 0; i < nb; i++) {

                for (let j = 0; j < nb; j++) { Kbb[i * nb + j] = Ks(rest[i], rest[j]); }
                for (let j = 0; j < na; j++) { Kba[i * na + j] = Ks(rest[i], mass[j]); }
            }

            const lu = luFactor(Kbb, nb);

            if (!lu) { return []; }

            // X = Kbb^-1 Kba
            const X = new Float64Array(nb * na);

            for (let j = 0; j < na; j++) {

                const col = new Float64Array(nb);

                for (let i = 0; i < nb; i++) { col[i] = Kba[i * na + j]; }

                const sol = luSolve(lu, col);

                for (let i = 0; i < nb; i++) { X[i * na + j] = sol[i]; }
            }

            Kred = new Float64Array(na * na);

            for (let i = 0; i < na; i++) {

                for (let j = 0; j < na; j++) {

                    let sum = Kaa[i * na + j];

                    for (let q = 0; q < nb; q++) { sum -= Kba[q * na + i] * X[q * na + j]; }

                    Kred[i * na + j] = sum;
                }
            }

            Tback = X;
        }

        // Mass-normalise.
        const A = new Float64Array(na * na);
        const sm = new Float64Array(na);

        for (let i = 0; i < na; i++) { sm[i] = 1 / Math.sqrt(Ms(mass[i])); }

        for (let i = 0; i < na; i++) { for (let j = 0; j < na; j++) { A[i * na + j] = 0.5 * (Kred[i * na + j] + Kred[j * na + i]) * sm[i] * sm[j]; } }

        const eig = jacobi(A, na);

        const order = [];

        for (let i = 0; i < na; i++) { order.push(i); }

        order.sort(function (a, b) { return eig.vals[a] - eig.vals[b]; });

        const list = [];

        for (let q = 0; q < order.length && list.length < count + 12; q++) {

            const k = order[q];
            const lam = eig.vals[k];

            if (!(lam > 0)) { continue; }

            // Shape in scaled coordinates, then back to dofs.
            const qa = new Float64Array(na);

            for (let i = 0; i < na; i++) { qa[i] = eig.vecs[i * na + k] * sm[i]; }

            const qs = new Float64Array(n);

            for (let i = 0; i < na; i++) { qs[mass[i]] = qa[i]; }

            if (Tback) {

                for (let i = 0; i < nb; i++) {

                    let sum = 0;

                    for (let j = 0; j < na; j++) { sum -= Tback[i * na + j] * qa[j]; }

                    qs[rest[i]] = sum;
                }
            }

            const phi = new Float64Array(n);

            for (let i = 0; i < n; i++) { phi[i] = qs[i] * s[i]; }

            // Effective mass along x, y, z (translations only).
            const eff = [0, 0, 0];
            let mtot = 0;

            for (let i = 0; i < frame.free.length; i++) {

                const nd = frame.free[i];

                mtot += nd.mass;

                for (let d = 0; d < 3; d++) { eff[d] += nd.mass * phi[i * 6 + d]; }
            }

            // Share of the kinetic energy in each of the six motions of the nodes.
            const ke = [0, 0, 0, 0, 0, 0];
            let keTot = 0;

            for (let i = 0; i < n; i++) {

                const e = 0.5 * frame.Md[i] * phi[i] * phi[i];

                ke[i % 6] += e;
                keTot += e;
            }

            list.push({ f: Math.sqrt(lam) / (2 * Math.PI), lam: lam, phi: phi, eff: eff.map(function (v) { return v * v; }), mtot: mtot, ke: ke.map(function (v) { return keTot ? v / keTot : 0; }) });
        }

        // Rotational participation for tilting modes, computed on request by the caller.
        frame.modesCache = { count: count, list: list };

        return list.slice(0, count);
    }

    // Displacement of a point rigidly carried by a node: dofs u (from accelerate or modes), node, local offset (um).
    function pointMotion(frame, u, node, xUm, yUm, zUm) {

        if (!node || node.fixed || node.index === undefined) { return [0, 0, 0]; }

        const o = node.index * 6;
        const rx = (xUm - node.ref[0]) * UM;
        const ry = (yUm - node.ref[1]) * UM;
        const rz = ((zUm === undefined ? node.ref[2] : zUm) - node.ref[2]) * UM;

        return [
            u[o] + u[o + 4] * rz - u[o + 5] * ry,
            u[o + 1] + u[o + 5] * rx - u[o + 3] * rz,
            u[o + 2] + u[o + 3] * ry - u[o + 4] * rx
        ];
    }

    // Peak stress (Pa) in every beam for a displacement field u.
    function stresses(frame, u) {

        const out = [];

        frame.elems.forEach(function (e) {

            const d = new Float64Array(12);

            e.nodes.forEach(function (nd, k) {

                if (nd.fixed || nd.index === undefined) { return; }

                const o = nd.index * 6;
                const T = e.T[k];

                for (let i = 0; i < 6; i++) {

                    let s = 0;

                    for (let j = 0; j < 6; j++) { s += T[i * 6 + j] * u[o + j]; }

                    d[6 * k + i] = s;
                }
            });

            const f = new Float64Array(12);

            for (let i = 0; i < 12; i++) { let s = 0; for (let j = 0; j < 12; j++) { s += e.Kg[i * 12 + j] * d[j]; } f[i] = s; }

            // Back to local axes: f_local = Lam^T f. Rotation about z only.
            const cs = e.ux;
            const sn = e.uy;
            const fl = new Float64Array(12);

            for (let b = 0; b < 4; b++) {

                const o = b * 3;

                fl[o] = cs * f[o] + sn * f[o + 1];
                fl[o + 1] = -sn * f[o] + cs * f[o + 1];
                fl[o + 2] = f[o + 2];
            }

            const w = e.w * UM;
            const t = e.t * UM;
            const A = w * t;
            const Iz = t * w * w * w / 12;
            const Iy = w * t * t * t / 12;

            let worst = 0;

            [0, 6].forEach(function (o) {

                const N = fl[o];
                const Mz = fl[o + 5];
                const My = fl[o + 4];
                const Tq = fl[o + 3];

                const s = Math.abs(N) / A + Math.abs(Mz) * (w / 2) / Iz + Math.abs(My) * (t / 2) / Iy + Math.abs(Tq) * 1.5 / (Math.max(w, t) * Math.min(w, t) * Math.min(w, t));

                if (s > worst) { worst = s; }
            });

            out.push({ id: e.piece.id, stress: worst, x: (e.ends[0].x + e.ends[1].x) / 2, y: (e.ends[0].y + e.ends[1].y) / 2, len: e.len, w: e.w });
        });

        return out;
    }


    root.LabMemsSolver = {

        buildFrame: buildFrame, accelerate: accelerate, solveLoads: solveLoads, modes: modes, pointMotion: pointMotion, stresses: stresses,
        luFactor: luFactor, luSolve: luSolve, jacobi: jacobi, beamLocal: beamLocal, LC: LC
    };

    if (typeof module !== "undefined" && module.exports) { module.exports = root.LabMemsSolver; }

}(typeof window !== "undefined" ? window : globalThis));
