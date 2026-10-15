/* ========================================
   NEURAL PROBE: DEVICE ANALYSIS

   Registers the "neural" kind with LabEngine. From the drawn layers it
   finds each numbered channel (a net with a contact pad "1" to "8"), the
   open recording site on that net (metal with no insulation over it),
   the coating on the site, the series resistance of the trace, the
   capacitance of the covered trace, coupling to the other channels and
   the size and stiffness of the probe body. The electrochemistry and the
   measurements live in lab-neural-model.js.

   Needs window.LabEngine, window.LabGeom and window.SCLab.
======================================== */

(function (root) {

    "use strict";

    const E = root.LabEngine;
    const G = root.LabGeom;

    const METALS = E.METALS;
    const EPS0 = 8.854e-12;


    /* ------------------------------------------------
       TEMPLATES (all lengths in um)
    ------------------------------------------------ */

    function r(x, y, w, h, pad) {

        const s = { t: "r", x: x, y: y, w: w, h: h };

        if (pad) { s.pad = pad; }

        return s;
    }

    function trace(w, pts) { return { t: "t", w: w, pts: pts }; }

    function geometry(p) {

        const N = p.n;
        const W = p.W;
        const L = p.L;

        const pitch = 400;
        const padSize = 300;
        const x0 = 500;
        const spacing = Math.min(250, (L - x0 - 400) / Math.max(N, 1));

        const lane = function (k) { return W * (k + 0.5) / N; };

        const yc = W / 2;
        const yPad = function (k) { return yc + (k - (N - 1) / 2) * pitch; };

        const sites = [];
        const traces = [];
        const pads = [];
        const windows = [];
        const coats = [];

        for (let k = 0; k < N; k++) {

            const xs = x0 + k * spacing;
            const ys = lane(k);

            sites.push(r(xs - p.s / 2, ys - p.s / 2, p.s, p.s));
            windows.push(r(xs - p.s / 2, ys - p.s / 2, p.s, p.s));
            coats.push(r(xs - p.s / 2 - 10, ys - p.s / 2 - 10, p.s + 20, p.s + 20));

            traces.push(trace(p.tw, [[xs, ys], [L + 100, ys], [L + 700, yPad(k)], [L + 1000, yPad(k)]]));

            pads.push(r(L + 1000, yPad(k) - padSize / 2, padSize, padSize, String(k + 1)));
            windows.push(r(L + 1020, yPad(k) - padSize / 2 + 20, padSize - 40, padSize - 40));
        }

        const headH = N * pitch + 200;

        const tip = { t: "p", pts: [[0, W / 2], [400, 0], [L, 0], [L, W], [400, W]] };
        const head = r(L - 50, yc - headH / 2, 1700, headH);

        return { N: N, sites: sites, traces: traces, pads: pads, windows: windows, coats: coats, body: [tip, head], lane: lane, spacing: spacing, x0: x0 };
    }


    function buildTemplate(kind, name, params) {

        const base = { n: 4, L: 4000, W: 200, s: 30, tw: 10 };

        if (name === "probe-chem") { base.L = 3000; }
        if (name === "probe-si") { base.L = 5000; base.W = 120; base.s = 18; base.tw = 6; }

        const p = Object.assign(base, params || {});

        if (name === "blank") {

            const l = E.newLayer("collector", { name: "Glassy carbon (sites, traces, pads)", material: "gc", thickness: 1 });

            return { id: E.uid("D"), name: "", kind: kind, electrolyte: "pbs", grid: 5, layers: [l] };
        }

        const g = geometry(p);

        const layers = [];

        const mk = function (role, opts, shapes, chrome) {

            const l = E.newLayer(role, opts);

            l.shapes = shapes;

            if (chrome) { l.mask.type = "chrome"; }

            E.syncLayer(l);

            layers.push(l);

            return l;
        };

        const all = function (list) { return list.slice(); };

        if (name === "probe-si") {

            mk("substrate", { name: "Probe body", material: "si", thickness: 15 }, g.body);
            mk("collector", { name: "Glassy carbon sites and traces", material: "gc", thickness: 1 }, all(g.sites).concat(g.traces, g.pads), true);
            mk("insulation", { name: "Passivation (windows over sites and pads)", material: "si3n4", thickness: 0.5, mode: "cut" }, g.windows, true);

        } else if (name === "probe-chem") {

            mk("substrate", { name: "Probe body", material: "pi", thickness: 10 }, g.body);
            mk("collector", { name: "Platinum sites and traces", material: "pt", thickness: 0.15 }, all(g.sites).concat(g.traces, g.pads), true);
            mk("insulation", { name: "Passivation (windows over sites and pads)", material: "parylene", thickness: 2, mode: "cut" }, g.windows, true);
            mk("coating", { name: "Enzyme layer (site 1)", material: "gluox", thickness: 2 }, [g.coats[0]]);
            mk("coating", { name: "Carbon nanotubes (sites 3 and 4)", material: "cnt", thickness: 0.5 }, [g.coats[2], g.coats[3]]);
            mk("coating", { name: "Nafion (site 3)", material: "nafion", thickness: 0.3 }, [g.coats[2]]);

        } else {

            mk("substrate", { name: "Probe body", material: "pi", thickness: 10 }, g.body);
            mk("collector", { name: "Glassy carbon sites and traces", material: "gc", thickness: 1 }, all(g.sites).concat(g.traces, g.pads), true);
            mk("insulation", { name: "Passivation (windows over sites and pads)", material: "parylene", thickness: 2, mode: "cut" }, g.windows, true);
            mk("coating", { name: "PEDOT:PSS on the sites", material: "pedot", thickness: 0.5 }, g.coats.slice());
        }

        return { id: E.uid("D"), name: "", kind: kind, electrolyte: "pbs", grid: 5, layers: layers };
    }


    const TEMPLATES = [
        { id: "probe-flex", name: "Flexible 4-channel recording probe", blurb: "Polyimide body, glassy carbon sites and traces, parylene passivation with windows, and PEDOT:PSS on every site." },
        { id: "probe-chem", name: "Neurochemical probe", blurb: "Platinum sites (the glutamate enzyme makes peroxide, which needs platinum): one with a glutamate enzyme layer, one bare reference (sentinel) and two carbon-nanotube dopamine sites, one with Nafion." },
        { id: "probe-si", name: "Rigid silicon probe", blurb: "A stiff silicon shank with glassy carbon sites and a nitride passivation. Small sites, no coating." },
        { id: "blank", name: "Blank (draw everything yourself)", blurb: "One empty metal layer." }
    ];


    /* ------------------------------------------------
       DIJKSTRA FOR THE TRACE RESISTANCE
    ------------------------------------------------ */

    function heapPush(h, key, val) {

        h.k.push(key);
        h.v.push(val);

        let i = h.k.length - 1;

        while (i > 0) {

            const p = (i - 1) >> 1;

            if (h.k[p] <= h.k[i]) { break; }

            const tk = h.k[p]; h.k[p] = h.k[i]; h.k[i] = tk;
            const tv = h.v[p]; h.v[p] = h.v[i]; h.v[i] = tv;

            i = p;
        }
    }

    function heapPop(h) {

        const key = h.k[0];
        const val = h.v[0];
        const lk = h.k.pop();
        const lv = h.v.pop();

        if (h.k.length) {

            h.k[0] = lk;
            h.v[0] = lv;

            let i = 0;
            const n = h.k.length;

            for (;;) {

                const a = 2 * i + 1;
                const b = a + 1;

                let m = i;

                if (a < n && h.k[a] < h.k[m]) { m = a; }
                if (b < n && h.k[b] < h.k[m]) { m = b; }

                if (m === i) { break; }

                const tk = h.k[m]; h.k[m] = h.k[i]; h.k[i] = tk;
                const tv = h.v[m]; h.v[m] = h.v[i]; h.v[i] = tv;

                i = m;
            }
        }

        return { key: key, val: val };
    }

    // Lowest-resistance path from the site to a pad, in ohms. cost[i] is the resistance of one square at pixel i.
    function pathResistance(net, sq, wpx, sites, pads, w, h) {

        const n = w * h;
        const dist = new Float64Array(n).fill(Infinity);
        const heap = { k: [], v: [] };

        for (let i = 0; i < n; i++) { if (sites[i]) { dist[i] = 0; heapPush(heap, 0, i); } }

        const steps = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [-1, 1, 1.4142], [1, -1, 1.4142], [-1, -1, 1.4142]];

        while (heap.k.length) {

            const top = heapPop(heap);
            const i = top.val;

            if (top.key > dist[i]) { continue; }

            if (pads[i]) { return top.key; }

            const x = i % w;
            const y = (i - x) / w;

            for (let s = 0; s < 8; s++) {

                const nx = x + steps[s][0];
                const ny = y + steps[s][1];

                if (nx < 0 || ny < 0 || nx >= w || ny >= h) { continue; }

                const j = ny * w + nx;

                if (!net[j]) { continue; }

                const wd = Math.max(1, 0.5 * (wpx[i] + wpx[j]));
                const c = top.key + steps[s][2] / wd * 0.5 * (sq[i] + sq[j]);

                if (c < dist[j]) { dist[j] = c; heapPush(heap, c, j); }
            }
        }

        return Infinity;
    }


    /* ------------------------------------------------
       ANALYSIS
    ------------------------------------------------ */

    // One analysis serves every "numbered electrodes on a thin strip" device. cfg: kind id, label pattern, where the pads are named.
    function analyzeWith(cfg, ctx) {

        const design = ctx.design;
        const per = ctx.per;
        const P = ctx.P;
        const frame = ctx.frame;
        const n = ctx.n;
        const px = ctx.px;
        const notes = ctx.notes;
        const info = ctx.info;
        const finish = ctx.finish;
        const rand = ctx.rand;
        const conductive = ctx.conductive;
        const nodeAt = ctx.nodeAt;
        const coveredAbove = ctx.coveredAbove;
        const netLabel = ctx.netLabel;
        const padMask = ctx.padMask;

        const nl = per.length;
        const pxM = px * 1e-6;

        const fail = function (reason, status) {

            return finish({ kind: cfg.kind, status: status || "lost", reason: reason, quality: 0, ch: [], sub: null, ins: null, coats: [], seedRoll: rand() });
        };

        const cIdx = [];
        const insIdx = [];
        const subIdx = [];
        const coatIdx = [];

        per.forEach(function (q, k) {

            const role = q.layer.role;

            if (conductive[k]) { cIdx.push(k); }
            if (role === "insulation") { insIdx.push(k); }
            if (role === "substrate") { subIdx.push(k); }
            if (role === "coating") { coatIdx.push(k); }
        });

        if (!cIdx.length) { notes.push("There is no metal layer, so there is nothing to connect."); return fail("No metal layer"); }

        // Channels: each numbered pad names a net.
        const chOfRoot = {};
        const shortWith = {};
        const digits = {};

        Object.keys(netLabel).forEach(function (root) {

            const labs = Object.keys(netLabel[root]).filter(function (l) { return cfg.label.test(l); });

            labs.forEach(function (l) { digits[l] = true; });

            if (!labs.length) { return; }

            chOfRoot[root] = labs;

            if (labs.length > 1) { labs.forEach(function (l) { shortWith[l] = labs.filter(function (x) { return x !== l; }); }); }
        });

        const padAny = new Uint8Array(n);

        Object.keys(padMask).forEach(function (lab) {

            const m = padMask[lab];

            for (let i = 0; i < n; i++) { if (m[i]) { padAny[i] = 1; } }
        });

        const labelsDrawn = {};

        per.forEach(function (q, k) { ctx.shapesOf[k].forEach(function (s) { if (s.pad && cfg.label.test(s.pad)) { labelsDrawn[s.pad] = true; } }); });

        const chList = Object.keys(labelsDrawn).sort();

        if (!chList.length) { notes.push(cfg.noPad); return fail("No contact pad"); }

        const cd = {};

        chList.forEach(function (d) {

            cd[d] = { d: d, net: new Uint8Array(n), site: new Uint8Array(n), padPx: 0, sitePx: 0, trCovPx: 0, mat: {}, sx: 0, sy: 0, x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
        });

        const gSheet = new Float32Array(n);
        const sqRes = new Float32Array(n);

        const metalUnion = new Uint8Array(n);

        let anyIns = false;

        insIdx.forEach(function (k) { if (ctx.shapesOf[k].length) { anyIns = true; } });

        for (let i = 0; i < n; i++) {

            let occl = false;
            let ins = false;
            let g = 0;

            for (let k = nl - 1; k >= 0; k--) {

                const role = per[k].layer.role;

                if (role === "insulation" && P[k][i]) { ins = true; }

                if (!conductive[k] || !P[k][i]) { continue; }

                metalUnion[i] = 1;

                const sigma = E.metalSigma(per[k].layer);

                g += sigma * per[k].layer.thickness * 1e-6;

                const root = nodeAt(k, i);
                const labs = chOfRoot[root];

                if (!labs) { occl = true; continue; }

                labs.forEach(function (d) {

                    const c = cd[d];

                    if (!c) { return; }

                    c.net[i] = 1;

                    if (padAny[i]) { c.padPx += 1; return; }

                    if (!ins && !occl) {

                        c.site[i] = 1;
                        c.sitePx += 1;

                        const mat = per[k].layer.material;

                        c.mat[mat] = (c.mat[mat] || 0) + 1;

                        const x = frame.x0 + ((i % frame.w) + 0.5) * px;
                        const y = frame.y0 + (Math.floor(i / frame.w) + 0.5) * px;

                        c.sx += x;
                        c.sy += y;
                        c.x0 = Math.min(c.x0, x);
                        c.x1 = Math.max(c.x1, x);
                        c.y0 = Math.min(c.y0, y);
                        c.y1 = Math.max(c.y1, y);

                    } else if (ins) {

                        c.trCovPx += 1;
                    }
                });

                occl = true;
            }

            gSheet[i] = g;
            sqRes[i] = g > 0 ? 1 / g : 1e6;
        }

        ctx.mark("probe sites");

        // Local width of the metal, from the distance to the nearest empty pixel.
        const bg = new Uint8Array(n);

        for (let i = 0; i < n; i++) { bg[i] = metalUnion[i] ? 0 : 1; }

        const wd = G.edt(bg, frame.w, frame.h);
        const wpx = new Float32Array(n);

        for (let i = 0; i < n; i++) { wpx[i] = Math.max(1, 2 * wd[i] - 1); }

        // Insulation: the first layer that has shapes.
        let ins = null;

        if (insIdx.length) {

            const k = insIdx.filter(function (kk) { return ctx.shapesOf[kk].length; })[0];

            if (k !== undefined) {

                const l = per[k].layer;
                const m = E.INSULATORS[l.material] || E.INSULATORS.parylene;

                ins = {
                    material: l.material, t: l.thickness, eps: m.eps, dpin: m.dpin, quality: per[k].p.quality, adhesion: per[k].p.adhesion,
                    leak: per[k].p.status !== "ok"
                };
            }
        }

        if (!ins) { notes.push("There is no insulation layer: the traces are as bare to the " + cfg.medium + " as the sites. Add an insulation layer with windows over the sites and pads."); }

        // Coatings.
        const coats = coatIdx.map(function (k) {

            const l = per[k].layer;

            return { idx: k, mat: l.material, t: l.thickness, quality: per[k].p.quality, adhesion: per[k].p.adhesion, status: per[k].p.status };
        });

        // Probe body.
        let sub = null;

        if (subIdx.length) {

            const k = subIdx.filter(function (kk) { return ctx.shapesOf[kk].length; })[0];

            if (k !== undefined) {

                const l = per[k].layer;
                const m = E.NEURAL_SUBSTRATES[l.material] || E.NEURAL_SUBSTRATES.pi;

                let x0 = Infinity;
                let x1 = -Infinity;
                let y0 = Infinity;
                let y1 = -Infinity;
                let cnt = 0;

                for (let i = 0; i < n; i++) {

                    if (!P[k][i]) { continue; }

                    const x = i % frame.w;
                    const y = (i - x) / frame.w;

                    cnt += 1;
                    x0 = Math.min(x0, x); x1 = Math.max(x1, x);
                    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
                }

                if (cnt) {

                    const horiz = (x1 - x0) >= (y1 - y0);
                    const len = (horiz ? x1 - x0 : y1 - y0) + 1;
                    const prof = new Float32Array(len);

                    let padMean = 0;
                    let padN = 0;

                    for (let i = 0; i < n; i++) {

                        const x = i % frame.w;
                        const y = (i - x) / frame.w;
                        const a = horiz ? x - x0 : y - y0;

                        if (P[k][i] && a >= 0 && a < len) { prof[a] += 1; }

                        if (padAny[i]) { padMean += a; padN += 1; }
                    }

                    // The tip is the end away from the pads.
                    const tipLow = padN ? (padMean / padN) > len / 2 : true;

                    const at = function (a) { return tipLow ? a : len - 1 - a; };

                    // Insertion length: from the tip to the first pad.
                    let minPad = len;

                    for (let i = 0; i < n; i++) {

                        if (!padAny[i]) { continue; }

                        const x = i % frame.w;
                        const y = (i - x) / frame.w;
                        const a = horiz ? x - x0 : y - y0;
                        const dd = tipLow ? a : len - 1 - a;

                        if (dd >= 0 && dd < minPad) { minPad = dd; }
                    }

                    const lIns = Math.max(minPad, 1) * px;

                    const widths = [];

                    for (let a = Math.floor(0.12 * minPad); a < minPad; a++) { widths.push(prof[at(a)] * px); }

                    widths.sort(function (u, v) { return u - v; });

                    const w = widths.length ? widths[Math.floor(widths.length / 2)] : 0;

                    const aTip = Math.min(len - 1, Math.max(1, Math.round(30 / px)));
                    const tipW = Math.max(prof[at(aTip)], prof[at(Math.max(0, aTip - 1))], prof[at(Math.min(len - 1, aTip + 1))]) * px;

                    sub = { material: l.material, E: m.E, t: l.thickness, w: w, tipW: tipW, L: lIns, area: w * l.thickness, quality: per[k].p.quality, status: per[k].p.status };
                }
            }
        }

        if (!sub) { notes.push("There is no " + cfg.body + " (substrate layer), so the film would have nothing to hold it together. Add a substrate layer and draw the outline."); }

        // Channels.
        const chans = [];

        const fAll = chList.filter(function (d) { return cd[d]; });

        // Coupling between channels (area over gap, along the parallel run).
        const dists = {};

        if (fAll.length > 1) {

            fAll.forEach(function (d) { dists[d] = G.edt(cd[d].net, frame.w, frame.h); });
        }

        const epsEff = 3.5;

        const dens = ins ? ins.dpin * Math.pow(0.03 / Math.max(ins.t, 0.001), 1.5) : 0;

        fAll.forEach(function (d) {

            const c = cd[d];

            const ch = { d: d, status: "ok", reason: "" };

            const area = c.sitePx * px * px;                                         // um2

            ch.areaUm2 = area;
            ch.area = area * 1e-8;                                                   // cm2
            ch.rEq = Math.sqrt(area / Math.PI);                                       // um
            ch.cx = c.sitePx ? c.sx / c.sitePx : NaN;
            ch.cy = c.sitePx ? c.sy / c.sitePx : NaN;
            ch.bw = c.sitePx ? c.x1 - c.x0 + px : 0;
            ch.bh = c.sitePx ? c.y1 - c.y0 + px : 0;

            let best = "";
            let bestN = -1;

            Object.keys(c.mat).forEach(function (m) { if (c.mat[m] > bestN) { bestN = c.mat[m]; best = m; } });

            ch.metal = best || "au";
            ch.metalShare = {};

            Object.keys(c.mat).forEach(function (m) { ch.metalShare[m] = c.mat[m] / Math.max(c.sitePx, 1); });

            // Coatings that actually reach the site.
            ch.coats = [];

            coats.forEach(function (ct) {

                let hit = 0;

                for (let i = 0; i < n; i++) { if (c.site[i] && P[ct.idx][i]) { hit += 1; } }

                if (hit > 0) { ch.coats.push({ mat: ct.mat, t: ct.t, cover: hit / Math.max(c.sitePx, 1), quality: ct.quality, adhesion: ct.adhesion }); }
            });

            // Trace: resistance of the lowest-resistance path from the site to a pad, and the covered trace area.
            const padM = padMask[d];

            ch.rTrace = NaN;

            if (c.sitePx > 0 && padM) { ch.rTrace = pathResistance(c.net, sqRes, wpx, c.site, padM, frame.w, frame.h); }

            const trArea = c.trCovPx * px * px * 1e-12;                              // m2 of trace under insulation

            ch.trAreaM2 = trArea;

            const tIns = ins ? ins.t * 1e-6 : 1e-6;
            const eIns = ins ? ins.eps : 3;

            ch.cPar = EPS0 * eIns * trArea / tIns;
            ch.cSub = sub ? EPS0 * (E.INSULATORS.pi.eps) * trArea / Math.max(sub.t * 1e-6, 1e-7) : 0;

            // The covered trace is also a tiny capacitor to the tissue on the other side.
            ch.cPar += ch.cSub;

            ch.pPin = 1 - Math.exp(-dens * trArea * 1e4);

            // Coupling to the other channels.
            ch.xt = {};

            if (fAll.length > 1) {

                fAll.forEach(function (o) {

                    if (o === d) { return; }

                    let sum = 0;
                    const near = Math.round(60 / px);

                    const net = cd[o].net;
                    const dd = dists[d];

                    for (let i = 0; i < n; i++) {

                        if (net[i] && !padAny[i] && dd[i] <= near) { sum += px * px / Math.max(dd[i] * px, px); }
                    }

                    ch.xt[o] = 0.35 * EPS0 * epsEff * sum * 1e-6;                      // F (sum is in um)
                });
            }

            if (shortWith[d]) { ch.status = "short"; ch.reason = "Channel " + d + " is joined to channel " + shortWith[d].join(", ") + " by metal."; }
            else if (!c.padPx) { ch.status = "open"; ch.reason = "The pad for channel " + d + " is missing, not printed or covered by insulation."; }
            else if (!c.sitePx) { ch.status = "blind"; ch.reason = "Channel " + d + " has no exposed site: insulation covers all of its metal."; }
            else if (!isFinite(ch.rTrace)) { ch.status = "open"; ch.reason = "Channel " + d + " has no continuous trace from its site to its pad."; }

            if (ch.status !== "ok") { notes.push(ch.reason); }

            chans.push(ch);
        });

        const nOk = chans.filter(function (x) { return x.status === "ok"; }).length;

        if (!nOk) { return finish({ kind: cfg.kind, status: chans.some(function (x) { return x.status === "short"; }) ? "short" : "lost", reason: chans[0].reason, quality: 0, ch: chans, sub: sub, ins: ins, coats: coats, seedRoll: rand() }); }

        // Exposed metal that is not part of any numbered channel (floating) is harmless here.
        const q = per.reduce(function (s, x) { return s + x.p.quality; }, 0) / per.length;

        info.parts = { nCh: chans.length, nOk: nOk, sub: sub, ins: ins };
        info.areaPlus = chans[0].areaUm2;
        info.areaMinus = 0;
        info.resolutionUm = px;

        // Site positions are needed by the recording test, in the probe frame.
        return finish({
            kind: cfg.kind, status: "ok", reason: "", quality: q, ch: chans, sub: sub, ins: ins, coats: coats,
            seedRoll: rand(), life: 1, vMax: 1, rShort: 50
        });
    }


    function checkWith(cfg, design, out, labels) {

        const used = design.layers.filter(function (l) { return l.shapes.length; });

        if (!used.some(function (l) { return l.role === "substrate"; })) {

            out.push({ level: "warn", text: "There is no " + cfg.body + ". Add a substrate layer under the metal and draw the outline on it." });
        }

        if (!used.some(function (l) { return l.role === "insulation"; })) {

            out.push({ level: "warn", text: "There is no insulation layer, so the traces will touch the " + cfg.medium + " as well as the sites." });
        }

        Object.keys(labels).forEach(function (lab) {

            if (!cfg.label.test(lab) && lab) { out.push({ level: "warn", text: "Pad label " + lab + " " + cfg.badLabel }); }
        });
    }


    const NEURAL_CFG = {
        kind: "neural", label: /^[1-8]$/, body: "probe body", medium: "tissue",
        noPad: "No contact pad with a number from 1 to 8 was found.",
        badLabel: "is not a channel number. Probe pads are numbered 1 to 8."
    };

    function analyze(ctx) { return analyzeWith(NEURAL_CFG, ctx); }

    function check(design, out, labels) { checkWith(NEURAL_CFG, design, out, labels); }

    E.registerKind("neural", { analyze: analyze, buildTemplate: buildTemplate, check: check, templates: TEMPLATES, cells: 900000, featDiv: 5 });

    // Shared with the glucose sensor kind (lab-cgm-engine.js).
    E.electrodeKit = { analyzeWith: analyzeWith, checkWith: checkWith };

    E.neuralGeometry = geometry;

}(typeof window !== "undefined" ? window : globalThis));
