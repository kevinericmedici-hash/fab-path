/* ========================================
   LAB GEOMETRY ENGINE

   Everything the layout editor and the device analysis need to know
   about shapes drawn on a mask layer: outlines, areas, smallest feature,
   smallest gap, rasters, connected pieces and a sheet-resistance solver.

   Units are micrometres (um) unless a name says otherwise.
   Shapes (plain objects, y grows downward like a screen):
     { t: "r", x, y, w, h, pad? }   rectangle (optional contact-pad label)
     { t: "c", x, y, r }            circle
     { t: "p", pts: [[x, y], ...] } polygon
     { t: "t", w, pts }             trace: a line with a width
   Any shape can carry cut: true. A cut shape removes material from the
   other shapes on its layer (a hole or notch) instead of adding any.

   Lives on window.LabGeom. No DOM, so it also runs in Node.
   Exact cut-outs use ClipperLib (clipper.js) when it is loaded.
======================================== */

(function (root) {

    "use strict";

    const CIRCLE_SIDES = 40;


    /* ------------------------------------------------
       SHAPES TO POLYGONS
    ------------------------------------------------ */

    function circlePoly(cx, cy, r) {

        const out = [];

        for (let k = 0; k < CIRCLE_SIDES; k++) {

            const a = (k / CIRCLE_SIDES) * Math.PI * 2;

            out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
        }

        return out;
    }


    function segmentPoly(a, b, w) {

        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;

        const nx = -dy / len * w / 2;
        const ny = dx / len * w / 2;

        return [
            [a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny],
            [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]
        ];
    }


    function polysOf(s) {

        switch (s.t) {

            case "r":
                return [[[s.x, s.y], [s.x + s.w, s.y], [s.x + s.w, s.y + s.h], [s.x, s.y + s.h]]];

            case "c":
                return [circlePoly(s.x, s.y, s.r)];

            case "p":
                return s.pts.length >= 3 ? [s.pts] : [];

            case "t": {

                const out = [];

                for (let k = 0; k + 1 < s.pts.length; k++) {
                    out.push(segmentPoly(s.pts[k], s.pts[k + 1], s.w));
                }

                // Round joints, so bends stay solid.
                for (let k = 1; k + 1 < s.pts.length; k++) {
                    out.push(circlePoly(s.pts[k][0], s.pts[k][1], s.w / 2));
                }

                return out;
            }

            default:
                return [];
        }
    }


    function polyArea(p) {

        let a = 0;

        for (let k = 0, j = p.length - 1; k < p.length; j = k++) {
            a += (p[j][0] + p[k][0]) * (p[j][1] - p[k][1]);
        }

        return Math.abs(a) / 2;
    }


    function polyBox(p) {

        let x0 = Infinity;
        let y0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;

        p.forEach(function (q) {

            if (q[0] < x0) { x0 = q[0]; }
            if (q[0] > x1) { x1 = q[0]; }
            if (q[1] < y0) { y0 = q[1]; }
            if (q[1] > y1) { y1 = q[1]; }
        });

        return { x0: x0, y0: y0, x1: x1, y1: y1 };
    }


    function bboxOf(shapes) {

        let b = null;

        shapes.forEach(function (s) {

            polysOf(s).forEach(function (p) {

                const q = polyBox(p);

                if (!b) { b = q; return; }

                b.x0 = Math.min(b.x0, q.x0);
                b.y0 = Math.min(b.y0, q.y0);
                b.x1 = Math.max(b.x1, q.x1);
                b.y1 = Math.max(b.y1, q.y1);
            });
        });

        return b;
    }


    function moveShape(s, dx, dy) {

        const c = JSON.parse(JSON.stringify(s));

        if (c.t === "r" || c.t === "c") { c.x += dx; c.y += dy; }
        else { c.pts = c.pts.map(function (q) { return [q[0] + dx, q[1] + dy]; }); }

        return c;
    }


    // Grow (b > 0) or shrink (b < 0) a shape by b on every side. Null if it vanishes.
    function growShape(s, b) {

        if (!b) { return s; }

        if (s.t === "r") {

            const w = s.w + 2 * b;
            const h = s.h + 2 * b;

            if (w <= 0.01 || h <= 0.01) { return null; }

            return Object.assign({}, s, { x: s.x - b, y: s.y - b, w: w, h: h });
        }

        if (s.t === "c") {

            return s.r + b <= 0.01 ? null : Object.assign({}, s, { r: s.r + b });
        }

        if (s.t === "t") {

            return s.w + 2 * b <= 0.01 ? null : Object.assign({}, s, { w: s.w + 2 * b });
        }

        // Polygon: push each corner along its bisector.
        const n = s.pts.length;

        let sgn = 0;

        for (let k = 0, j = n - 1; k < n; j = k++) {
            sgn += (s.pts[j][0] * s.pts[k][1]) - (s.pts[k][0] * s.pts[j][1]);
        }

        sgn = sgn > 0 ? 1 : -1;

        const out = [];

        for (let k = 0; k < n; k++) {

            const p0 = s.pts[(k + n - 1) % n];
            const p1 = s.pts[k];
            const p2 = s.pts[(k + 1) % n];

            const e1 = [p1[0] - p0[0], p1[1] - p0[1]];
            const e2 = [p2[0] - p1[0], p2[1] - p1[1]];

            const l1 = Math.hypot(e1[0], e1[1]) || 1;
            const l2 = Math.hypot(e2[0], e2[1]) || 1;

            // Outward normals (for counter-clockwise screen order they point to the right of travel).
            const n1 = [sgn * e1[1] / l1, -sgn * e1[0] / l1];
            const n2 = [sgn * e2[1] / l2, -sgn * e2[0] / l2];

            let bx = n1[0] + n2[0];
            let by = n1[1] + n2[1];

            const bl = Math.hypot(bx, by);

            if (bl < 1e-6) { out.push([p1[0] + n1[0] * b, p1[1] + n1[1] * b]); continue; }

            bx /= bl;
            by /= bl;

            const cos = bx * n1[0] + by * n1[1];
            const k2 = Math.min(1 / Math.max(cos, 0.3), 3);

            out.push([p1[0] + bx * b * k2, p1[1] + by * b * k2]);
        }

        return Object.assign({}, s, { pts: out });
    }


    /* ------------------------------------------------
       SEGMENT AND POLYGON DISTANCES
    ------------------------------------------------ */

    function pointSegDist2(px, py, ax, ay, bx, by) {

        const dx = bx - ax;
        const dy = by - ay;
        const l2 = dx * dx + dy * dy;

        let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;

        t = t < 0 ? 0 : t > 1 ? 1 : t;

        const cx = ax + t * dx - px;
        const cy = ay + t * dy - py;

        return cx * cx + cy * cy;
    }


    function segsCross(a, b, c, d) {

        const o = function (p, q, r) { return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); };

        const o1 = o(a, b, c);
        const o2 = o(a, b, d);
        const o3 = o(c, d, a);
        const o4 = o(c, d, b);

        return ((o1 > 0) !== (o2 > 0)) && ((o3 > 0) !== (o4 > 0));
    }


    function pointInPoly(x, y, p) {

        let inside = false;

        for (let k = 0, j = p.length - 1; k < p.length; j = k++) {

            const yi = p[k][1];
            const yj = p[j][1];

            if ((yi > y) !== (yj > y) && x < (p[j][0] - p[k][0]) * (y - yi) / (yj - yi) + p[k][0]) {
                inside = !inside;
            }
        }

        return inside;
    }


    // Distance between two polygons: 0 if they touch, overlap or one contains the other.
    function polyDist(a, b, ba, bb) {

        ba = ba || polyBox(a);
        bb = bb || polyBox(b);

        const gx = Math.max(ba.x0 - bb.x1, bb.x0 - ba.x1, 0);
        const gy = Math.max(ba.y0 - bb.y1, bb.y0 - ba.y1, 0);

        if (gx === 0 && gy === 0) {

            if (pointInPoly(a[0][0], a[0][1], b) || pointInPoly(b[0][0], b[0][1], a)) { return 0; }

            for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
                for (let k = 0, m = b.length - 1; k < b.length; m = k++) {
                    if (segsCross(a[j], a[i], b[m], b[k])) { return 0; }
                }
            }
        }

        let best = Infinity;

        for (let i = 0, j = a.length - 1; i < a.length; j = i++) {

            for (let k = 0, m = b.length - 1; k < b.length; m = k++) {

                const d = Math.min(
                    pointSegDist2(a[i][0], a[i][1], b[m][0], b[m][1], b[k][0], b[k][1]),
                    pointSegDist2(b[k][0], b[k][1], a[j][0], a[j][1], a[i][0], a[i][1]),
                    pointSegDist2(a[j][0], a[j][1], b[m][0], b[m][1], b[k][0], b[k][1]),
                    pointSegDist2(b[m][0], b[m][1], a[j][0], a[j][1], a[i][0], a[i][1])
                );

                if (d < best) { best = d; }
            }
        }

        return Math.sqrt(best);
    }


    /* ------------------------------------------------
       PER-SHAPE AND PER-LAYER MEASUREMENTS
    ------------------------------------------------ */

    // Thinnest part of one polygon: the smallest distance from a corner to a non-neighbouring edge.
    function polyThickness(p) {

        let best = Infinity;
        const n = p.length;

        for (let k = 0; k < n; k++) {

            for (let e = 0; e < n; e++) {

                const e2 = (e + 1) % n;

                if (e === k || e2 === k) { continue; }

                const d = Math.sqrt(pointSegDist2(p[k][0], p[k][1], p[e][0], p[e][1], p[e2][0], p[e2][1]));

                if (d < best) { best = d; }
            }
        }

        return best;
    }


    function shapeInfo(s) {

        if (s.t === "r") {

            return {
                area: s.w * s.h, perimeter: 2 * (s.w + s.h), w: s.w, h: s.h,
                minDim: Math.min(s.w, s.h), x: s.x, y: s.y
            };
        }

        if (s.t === "c") {

            return {
                area: Math.PI * s.r * s.r, perimeter: 2 * Math.PI * s.r, w: 2 * s.r, h: 2 * s.r,
                minDim: 2 * s.r, x: s.x - s.r, y: s.y - s.r
            };
        }

        if (s.t === "t") {

            let len = 0;

            for (let k = 0; k + 1 < s.pts.length; k++) {
                len += Math.hypot(s.pts[k + 1][0] - s.pts[k][0], s.pts[k + 1][1] - s.pts[k][1]);
            }

            const b = bboxOf([s]);

            return {
                area: len * s.w, perimeter: 2 * len + 2 * s.w, w: b.x1 - b.x0, h: b.y1 - b.y0,
                minDim: s.w, length: len, x: b.x0, y: b.y0
            };
        }

        const b = polyBox(s.pts);

        return {
            area: polyArea(s.pts),
            perimeter: s.pts.reduce(function (sum, q, k) {

                const o = s.pts[(k + 1) % s.pts.length];

                return sum + Math.hypot(o[0] - q[0], o[1] - q[1]);
            }, 0),
            w: b.x1 - b.x0, h: b.y1 - b.y0,
            minDim: polyThickness(s.pts), x: b.x0, y: b.y0
        };
    }


    function minDimOf(s) {

        return shapeInfo(s).minDim;
    }


    // Pieces of a layer that touch form one piece. Returns { count, comp: [id per shape] }.
    function pieces(shapes) {

        const n = shapes.length;
        const parent = shapes.map(function (_, k) { return k; });

        const find = function (a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };

        const polys = shapes.map(polysOf);
        const boxes = polys.map(function (ps) { return ps.map(polyBox); });

        const near = function (i, j, limit) {

            let best = Infinity;

            for (let a = 0; a < polys[i].length; a++) {

                for (let b = 0; b < polys[j].length; b++) {

                    const d = polyDist(polys[i][a], polys[j][b], boxes[i][a], boxes[j][b]);

                    if (d < best) { best = d; }

                    if (best <= limit) { return best; }
                }
            }

            return best;
        };

        for (let i = 0; i < n; i++) {

            for (let j = i + 1; j < n; j++) {

                if (find(i) === find(j)) { continue; }

                if (near(i, j, 1e-6) <= 1e-6) { parent[find(i)] = find(j); }
            }
        }

        const ids = {};
        let count = 0;

        const comp = shapes.map(function (_, k) {

            const r = find(k);

            if (ids[r] === undefined) { ids[r] = count++; }

            return ids[r];
        });

        return { count: count, comp: comp, near: near };
    }


    // Smallest gap between two different pieces of one layer.
    function minGapOf(shapes) {

        if (shapes.length < 2) { return Infinity; }

        const pc = pieces(shapes);

        if (pc.count < 2) { return Infinity; }

        let best = Infinity;

        for (let i = 0; i < shapes.length; i++) {

            for (let j = i + 1; j < shapes.length; j++) {

                if (pc.comp[i] === pc.comp[j]) { continue; }

                const d = pc.near(i, j, 0);

                if (d < best) { best = d; }
            }
        }

        return best;
    }


    /* ------------------------------------------------
       RASTERS
    ------------------------------------------------ */

    function makeFrame(box, px, margin) {

        const m = margin === undefined ? px * 2 : margin;

        const x0 = box.x0 - m;
        const y0 = box.y0 - m;

        return {
            x0: x0, y0: y0, px: px,
            w: Math.max(1, Math.ceil((box.x1 - box.x0 + 2 * m) / px)),
            h: Math.max(1, Math.ceil((box.y1 - box.y0 + 2 * m) / px))
        };
    }


    function fillPoly(mask, frame, p, value) {

        const box = polyBox(p);

        const j0 = Math.max(0, Math.floor((box.y0 - frame.y0) / frame.px - 0.5));
        const j1 = Math.min(frame.h - 1, Math.ceil((box.y1 - frame.y0) / frame.px - 0.5));

        const xs = [];

        for (let j = j0; j <= j1; j++) {

            const y = frame.y0 + (j + 0.5) * frame.px;

            xs.length = 0;

            for (let k = 0, m = p.length - 1; k < p.length; m = k++) {

                const ya = p[m][1];
                const yb = p[k][1];

                if ((ya <= y && yb > y) || (yb <= y && ya > y)) {
                    xs.push(p[m][0] + (y - ya) / (yb - ya) * (p[k][0] - p[m][0]));
                }
            }

            xs.sort(function (a, b) { return a - b; });

            for (let k = 0; k + 1 < xs.length; k += 2) {

                const i0 = Math.max(0, Math.ceil((xs[k] - frame.x0) / frame.px - 0.5));
                const i1 = Math.min(frame.w - 1, Math.ceil((xs[k + 1] - frame.x0) / frame.px - 0.5) - 1);

                for (let i = i0; i <= i1; i++) { mask[j * frame.w + i] = value; }
            }
        }
    }


    function raster(shapes, frame) {

        const mask = new Uint8Array(frame.w * frame.h);

        shapes.forEach(function (s) {
            if (!s.cut) { polysOf(s).forEach(function (p) { fillPoly(mask, frame, p, 1); }); }
        });

        // Cut shapes clear whatever the other shapes put down.
        shapes.forEach(function (s) {
            if (s.cut) { polysOf(s).forEach(function (p) { fillPoly(mask, frame, p, 0); }); }
        });

        return mask;
    }


    /* ------------------------------------------------
       CUT SHAPES (holes and notches)
    ------------------------------------------------ */

    const CLIP_SCALE = 1000;   // Clipper works on integers: 1 nm steps

    function clipper() { return root.ClipperLib || null; }

    function hasCuts(shapes) { return shapes.some(function (s) { return s.cut; }); }

    function boxesTouch(a, b) { return a && b && a.x0 <= b.x1 && b.x0 <= a.x1 && a.y0 <= b.y1 && b.y0 <= a.y1; }

    // All rings wind the same way, so overlapping pieces of one shape (a trace's segments and
    // joints) add up instead of cancelling under the non-zero fill rule.
    function toPath(p) {

        const path = p.map(function (q) { return { X: Math.round(q[0] * CLIP_SCALE), Y: Math.round(q[1] * CLIP_SCALE) }; });

        if (!root.ClipperLib.Clipper.Orientation(path)) { path.reverse(); }

        return path;
    }

    function fromPath(path) { return path.map(function (q) { return [q.X / CLIP_SCALE, q.Y / CLIP_SCALE]; }); }

    // One shape minus the cuts, as polygons with holes: [{ outer: [[x, y]...], holes: [[[x, y]...]...] }].
    // ringsOf turns a shape into polygons (lets export use finer circles).
    function cutRegions(s, cuts, ringsOf) {

        const CL = clipper();

        ringsOf = ringsOf || polysOf;

        if (!CL) { return null; }

        const c = new CL.Clipper();

        ringsOf(s).forEach(function (p) { if (p.length >= 3) { c.AddPath(toPath(p), CL.PolyType.ptSubject, true); } });
        cuts.forEach(function (k) { ringsOf(k).forEach(function (p) { if (p.length >= 3) { c.AddPath(toPath(p), CL.PolyType.ptClip, true); } }); });

        const tree = new CL.PolyTree();

        c.Execute(CL.ClipType.ctDifference, tree, CL.PolyFillType.pftNonZero, CL.PolyFillType.pftNonZero);

        const out = [];

        (function walk(node) {

            node.Childs().forEach(function (outer) {

                out.push({ outer: fromPath(outer.Contour()), holes: outer.Childs().map(function (hole) { return fromPath(hole.Contour()); }) });

                // Islands inside holes are outers again.
                outer.Childs().forEach(walk);
            });

        }(tree));

        return out;
    }

    // A polygon with holes split into hole-free pieces by vertical cuts through each hole
    // (formats such as GDSII and CIF can't store holes). The pieces only share edges.
    function sliceRegion(region) {

        const CL = clipper();

        if (!region.holes.length || !CL) { return [region.outer]; }

        const xs = region.holes.map(function (hp) {

            const b = polyBox(hp);

            return (b.x0 + b.x1) / 2;
        });

        const ob = polyBox(region.outer);
        const cutsX = [ob.x0 - 1].concat(xs.sort(function (a, b) { return a - b; }), [ob.x1 + 1]);
        const out = [];

        for (let k = 0; k + 1 < cutsX.length; k++) {

            if (cutsX[k + 1] - cutsX[k] < 1e-6) { continue; }

            const strip = [[cutsX[k], ob.y0 - 1], [cutsX[k + 1], ob.y0 - 1], [cutsX[k + 1], ob.y1 + 1], [cutsX[k], ob.y1 + 1]];
            const c = new CL.Clipper();

            c.AddPath(toPath(region.outer), CL.PolyType.ptSubject, true);
            region.holes.forEach(function (hp) { c.AddPath(toPath(hp), CL.PolyType.ptSubject, true); });
            c.AddPath(toPath(strip), CL.PolyType.ptClip, true);

            const sol = new CL.Paths();

            c.Execute(CL.ClipType.ctIntersection, sol, CL.PolyFillType.pftEvenOdd, CL.PolyFillType.pftNonZero);

            sol.forEach(function (path) { if (path.length >= 3) { out.push(fromPath(path)); } });
        }

        return out;
    }

    // The shapes of one layer with the cuts applied. Shapes that no cut touches come back
    // unchanged (so analysis that looks for rectangles still finds them); touched shapes become
    // hole-free polygons; cut shapes and anything cut away completely disappear. Pads are kept whole.
    // Without ClipperLib the cut shapes are passed through for the raster to handle.
    function applyCuts(shapes) {

        if (!hasCuts(shapes)) { return shapes; }

        const cuts = shapes.filter(function (s) { return s.cut; });

        if (!clipper()) { return shapes; }

        const cutBoxes = cuts.map(function (k) { return bboxOf([k]); });
        const out = [];

        shapes.forEach(function (s) {

            if (s.cut) { return; }

            const b = bboxOf([s]);
            const near = cuts.filter(function (_, i) { return boxesTouch(b, cutBoxes[i]); });

            if (!near.length || s.pad) { out.push(s); return; }

            cutRegions(s, near).forEach(function (region) {

                sliceRegion(region).forEach(function (p) { out.push({ t: "p", pts: p }); });
            });
        });

        return out;
    }


    // Union of a layer's shapes: area in um2 and perimeter in um (from the raster).
    function unionArea(shapes, box, px) {

        if (!shapes.length || !box) { return { area: 0, perimeter: 0 }; }

        const f = makeFrame(box, px, px);
        const m = raster(shapes, f);

        let n = 0;
        let edge = 0;

        for (let j = 0; j < f.h; j++) {

            for (let i = 0; i < f.w; i++) {

                if (!m[j * f.w + i]) { continue; }

                n++;

                if (i === 0 || !m[j * f.w + i - 1]) { edge++; }
                if (i === f.w - 1 || !m[j * f.w + i + 1]) { edge++; }
                if (j === 0 || !m[(j - 1) * f.w + i]) { edge++; }
                if (j === f.h - 1 || !m[(j + 1) * f.w + i]) { edge++; }
            }
        }

        return { area: n * px * px, perimeter: edge * px };
    }


    // Euclidean distance (in pixels) from every cell to the nearest cell where mask[i] === 1.
    function edt(mask, w, h) {

        const INF = 1e20;
        const f = new Float32Array(w * h);

        for (let k = 0; k < w * h; k++) { f[k] = mask[k] ? 0 : INF; }

        const v = new Int32Array(Math.max(w, h));
        const z = new Float32Array(Math.max(w, h) + 1);
        const d = new Float32Array(Math.max(w, h));

        const pass = function (n, get, set) {

            let k = 0;

            v[0] = 0;
            z[0] = -INF;
            z[1] = INF;

            for (let q = 1; q < n; q++) {

                const fq = get(q) + q * q;

                let s = (fq - (get(v[k]) + v[k] * v[k])) / (2 * q - 2 * v[k]);

                while (s <= z[k]) {

                    k--;
                    s = (fq - (get(v[k]) + v[k] * v[k])) / (2 * q - 2 * v[k]);
                }

                k++;
                v[k] = q;
                z[k] = s;
                z[k + 1] = INF;
            }

            k = 0;

            for (let q = 0; q < n; q++) {

                while (z[k + 1] < q) { k++; }

                d[q] = (q - v[k]) * (q - v[k]) + get(v[k]);
            }

            for (let q = 0; q < n; q++) { set(q, d[q]); }
        };

        for (let i = 0; i < w; i++) {

            pass(h, function (j) { return f[j * w + i]; }, function (j, val) { f[j * w + i] = val; });
        }

        for (let j = 0; j < h; j++) {

            pass(w, function (i) { return f[j * w + i]; }, function (i, val) { f[j * w + i] = val; });
        }

        for (let k = 0; k < w * h; k++) { f[k] = Math.sqrt(f[k]); }

        return f;
    }


    // Label 4-connected pieces of a mask. Returns { labels, n } with labels 1..n (0 = empty).
    function label(mask, w, h) {

        const labels = new Int32Array(w * h);
        const parent = [0];

        const find = function (a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };

        let n = 0;

        for (let j = 0; j < h; j++) {

            for (let i = 0; i < w; i++) {

                const k = j * w + i;

                if (!mask[k]) { continue; }

                const left = i > 0 ? labels[k - 1] : 0;
                const up = j > 0 ? labels[k - w] : 0;

                if (!left && !up) {

                    n++;
                    parent.push(n);
                    labels[k] = n;

                } else if (left && up) {

                    labels[k] = Math.min(left, up);

                    const a = find(left);
                    const b = find(up);

                    if (a !== b) { parent[Math.max(a, b)] = Math.min(a, b); }

                } else {

                    labels[k] = left || up;
                }
            }
        }

        const remap = new Int32Array(n + 1);
        let m = 0;

        for (let r = 1; r <= n; r++) {

            const root = find(r);

            if (!remap[root]) { remap[root] = ++m; }

            remap[r] = remap[root];
        }

        for (let k = 0; k < w * h; k++) { if (labels[k]) { labels[k] = remap[labels[k]]; } }

        return { labels: labels, n: m };
    }


    /* ------------------------------------------------
       SHEET RESISTANCE SOLVER
       g: sheet conductance (siemens, square cells) per cell, 0 = no material
       ground: 1 where the contact pad touches
       sink: current drawn per cell (any positive units)
       Returns the effective series resistance for charging every sink cell
       from the ground cells, and the fraction of sink that cannot be reached.
    ------------------------------------------------ */

    function solveSheet(g0, ground, sink, w, h) {

        const n = w * h;

        // Cells reachable from ground through material.
        const reach = new Uint8Array(n);
        const stack = new Int32Array(n);

        let sp = 0;

        for (let k = 0; k < n; k++) {
            if (ground[k] && g0[k] > 0) { reach[k] = 1; stack[sp++] = k; }
        }

        while (sp) {

            const k = stack[--sp];
            const i = k % w;

            if (i > 0 && !reach[k - 1] && g0[k - 1] > 0) { reach[k - 1] = 1; stack[sp++] = k - 1; }
            if (i < w - 1 && !reach[k + 1] && g0[k + 1] > 0) { reach[k + 1] = 1; stack[sp++] = k + 1; }
            if (k >= w && !reach[k - w] && g0[k - w] > 0) { reach[k - w] = 1; stack[sp++] = k - w; }
            if (k + w < n && !reach[k + w] && g0[k + w] > 0) { reach[k + w] = 1; stack[sp++] = k + w; }
        }

        let totalSink = 0;
        let lostSink = 0;

        for (let k = 0; k < n; k++) {

            if (sink[k] > 0) {

                totalSink += sink[k];

                if (!reach[k]) { lostSink += sink[k]; }
            }
        }

        const reachedSink = totalSink - lostSink;

        if (reachedSink <= 0) { return { R: Infinity, lost: 1 }; }

        // Conductance between each cell and its right / lower neighbour.
        const cr = new Float64Array(n);
        const cd = new Float64Array(n);
        const diag = new Float64Array(n);

        for (let k = 0; k < n; k++) {

            if (!reach[k]) { continue; }

            const i = k % w;

            if (i < w - 1 && reach[k + 1]) {

                const c = 2 * g0[k] * g0[k + 1] / (g0[k] + g0[k + 1]);

                cr[k] = c;
                diag[k] += c;
                diag[k + 1] += c;
            }

            if (k + w < n && reach[k + w]) {

                const c = 2 * g0[k] * g0[k + w] / (g0[k] + g0[k + w]);

                cd[k] = c;
                diag[k] += c;
                diag[k + w] += c;
            }
        }

        const free = new Uint8Array(n);

        let m = 0;

        for (let k = 0; k < n; k++) {
            if (reach[k] && !ground[k]) { free[k] = 1; m++; }
        }

        if (!m) { return { R: 0, lost: lostSink / totalSink }; }

        const b = new Float64Array(n);
        const x = new Float64Array(n);
        const r = new Float64Array(n);
        const z = new Float64Array(n);
        const p = new Float64Array(n);
        const Ap = new Float64Array(n);

        let bnorm = 0;
        let rz = 0;

        for (let k = 0; k < n; k++) {

            if (!free[k]) { continue; }

            b[k] = sink[k] > 0 ? sink[k] : 0;
            r[k] = b[k];
            z[k] = r[k] / diag[k];
            p[k] = z[k];
            rz += r[k] * z[k];
            bnorm += b[k] * b[k];
        }

        bnorm = Math.sqrt(bnorm) || 1;

        for (let it = 0; it < 1500; it++) {

            let pAp = 0;

            for (let k = 0; k < n; k++) {

                if (!free[k]) { continue; }

                const i = k % w;

                let s = diag[k] * p[k];

                if (i > 0) { s -= cr[k - 1] * p[k - 1]; }
                if (i < w - 1) { s -= cr[k] * p[k + 1]; }
                if (k >= w) { s -= cd[k - w] * p[k - w]; }
                if (k + w < n) { s -= cd[k] * p[k + w]; }

                Ap[k] = s;
                pAp += p[k] * s;
            }

            if (pAp <= 0) { break; }

            const alpha = rz / pAp;

            let rn = 0;
            let rzNew = 0;

            for (let k = 0; k < n; k++) {

                if (!free[k]) { continue; }

                x[k] += alpha * p[k];
                r[k] -= alpha * Ap[k];
                rn += r[k] * r[k];
                z[k] = r[k] / diag[k];
                rzNew += r[k] * z[k];
            }

            if (Math.sqrt(rn) < 1e-4 * bnorm) { break; }

            const beta = rzNew / rz;

            rz = rzNew;

            for (let k = 0; k < n; k++) {
                if (free[k]) { p[k] = z[k] + beta * p[k]; }
            }
        }

        let power = 0;

        for (let k = 0; k < n; k++) { if (free[k]) { power += b[k] * x[k]; } }

        return { R: power / (reachedSink * reachedSink), lost: lostSink / totalSink };
    }


    /* ------------------------------------------------
       TWO-TERMINAL SOLVER
       g: sheet conductance per cell (0 = no material). Cells in A are held at 0 V,
       cells in B at 1 V. Returns the conductance between them (siemens, with square
       cells this is also the number of squares), and whether they are connected.
    ------------------------------------------------ */

    function solveTwoTerminal(g0, A, B, w, h) {

        const n = w * h;

        const reach = new Uint8Array(n);
        const stack = new Int32Array(n);

        let sp = 0;

        for (let k = 0; k < n; k++) {
            if (A[k]) { reach[k] = 1; stack[sp++] = k; }
        }

        const conduct = function (k) { return A[k] || B[k] || g0[k] > 0; };

        while (sp) {

            const k = stack[--sp];
            const i = k % w;

            if (i > 0 && !reach[k - 1] && conduct(k - 1)) { reach[k - 1] = 1; stack[sp++] = k - 1; }
            if (i < w - 1 && !reach[k + 1] && conduct(k + 1)) { reach[k + 1] = 1; stack[sp++] = k + 1; }
            if (k >= w && !reach[k - w] && conduct(k - w)) { reach[k - w] = 1; stack[sp++] = k - w; }
            if (k + w < n && !reach[k + w] && conduct(k + w)) { reach[k + w] = 1; stack[sp++] = k + w; }
        }

        let connected = false;

        for (let k = 0; k < n && !connected; k++) { if (B[k] && reach[k]) { connected = true; } }

        if (!connected) { return { G: 0, connected: false }; }

        const gOf = function (k) { return A[k] || B[k] ? 1e3 : g0[k]; };

        const cr = new Float64Array(n);
        const cd = new Float64Array(n);
        const diag = new Float64Array(n);
        const rhs = new Float64Array(n);
        const free = new Uint8Array(n);

        for (let k = 0; k < n; k++) {

            if (reach[k] && !A[k] && !B[k]) { free[k] = 1; }
        }

        const edge = function (a, b) {

            const c = 2 * gOf(a) * gOf(b) / (gOf(a) + gOf(b));

            if (free[a]) { diag[a] += c; }
            if (free[b]) { diag[b] += c; }

            if (free[a] && free[b]) { return c; }

            // One side is a terminal: a drain neighbour pushes its 1 V into the free cell.
            if (free[a] && B[b]) { rhs[a] += c; }
            if (free[b] && B[a]) { rhs[b] += c; }

            return 0;
        };

        for (let k = 0; k < n; k++) {

            if (!reach[k]) { continue; }

            const i = k % w;

            if (i < w - 1 && reach[k + 1]) { cr[k] = edge(k, k + 1); }
            if (k + w < n && reach[k + w]) { cd[k] = edge(k, k + w); }
        }

        const x = new Float64Array(n);
        const r = new Float64Array(n);
        const z = new Float64Array(n);
        const p = new Float64Array(n);
        const Ap = new Float64Array(n);

        let bnorm = 0;
        let rz = 0;

        for (let k = 0; k < n; k++) {

            if (!free[k]) { continue; }

            r[k] = rhs[k];
            z[k] = r[k] / diag[k];
            p[k] = z[k];
            rz += r[k] * z[k];
            bnorm += rhs[k] * rhs[k];
        }

        bnorm = Math.sqrt(bnorm) || 1;

        for (let it = 0; it < 4000; it++) {

            let pAp = 0;

            for (let k = 0; k < n; k++) {

                if (!free[k]) { continue; }

                const i = k % w;

                let s2 = diag[k] * p[k];

                if (i > 0) { s2 -= cr[k - 1] * p[k - 1]; }
                if (i < w - 1) { s2 -= cr[k] * p[k + 1]; }
                if (k >= w) { s2 -= cd[k - w] * p[k - w]; }
                if (k + w < n) { s2 -= cd[k] * p[k + w]; }

                Ap[k] = s2;
                pAp += p[k] * s2;
            }

            if (pAp <= 0) { break; }

            const alpha = rz / pAp;

            let rn = 0;
            let rzNew = 0;

            for (let k = 0; k < n; k++) {

                if (!free[k]) { continue; }

                x[k] += alpha * p[k];
                r[k] -= alpha * Ap[k];
                rn += r[k] * r[k];
                z[k] = r[k] / diag[k];
                rzNew += r[k] * z[k];
            }

            if (Math.sqrt(rn) < 1e-6 * bnorm) { break; }

            const beta = rzNew / rz;

            rz = rzNew;

            for (let k = 0; k < n; k++) { if (free[k]) { p[k] = z[k] + beta * p[k]; } }
        }

        // Current into the drain cells.
        let I = 0;

        const volt = function (k) { return B[k] ? 1 : A[k] ? 0 : x[k]; };

        for (let k = 0; k < n; k++) {

            if (!B[k]) { continue; }

            const i = k % w;

            const pairs = [];

            if (i > 0) { pairs.push(k - 1); }
            if (i < w - 1) { pairs.push(k + 1); }
            if (k >= w) { pairs.push(k - w); }
            if (k + w < n) { pairs.push(k + w); }

            pairs.forEach(function (q) {

                if (!reach[q] || B[q]) { return; }

                const c = 2 * gOf(k) * gOf(q) / (gOf(k) + gOf(q));

                I += c * (1 - volt(q));
            });
        }

        return { G: I, connected: true };
    }


    const API = {

        polysOf: polysOf,
        polyArea: polyArea,
        polyBox: polyBox,
        bboxOf: bboxOf,
        moveShape: moveShape,
        growShape: growShape,
        polyDist: polyDist,
        pointInPoly: pointInPoly,
        pointSegDist2: pointSegDist2,
        shapeInfo: shapeInfo,
        minDimOf: minDimOf,
        pieces: pieces,
        minGapOf: minGapOf,

        hasCuts: hasCuts,
        applyCuts: applyCuts,
        cutRegions: cutRegions,
        sliceRegion: sliceRegion,

        makeFrame: makeFrame,
        raster: raster,
        unionArea: unionArea,
        edt: edt,
        label: label,
        solveSheet: solveSheet,
        solveTwoTerminal: solveTwoTerminal
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = API;
    }

    root.LabGeom = API;

}(typeof window !== "undefined" ? window : globalThis));
