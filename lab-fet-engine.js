/* ========================================
   FET / BIOFET DEVICE ANALYSIS

   Registers the "fet" (MOSFET / thin-film transistor) and "biofet"
   (liquid-gated sensor) kinds with LabEngine. From the drawn layers it
   finds the source, drain and gate nets, which channel cells are gated
   and through what dielectric, how exposed the channel is to a solution,
   the contact resistance and the odds of a gate pinhole or a source-drain
   short. The compact transistor model that turns this into curves lives
   in lab-fet-model.js.

   Needs window.LabEngine, window.LabGeom and window.SCLab.
======================================== */

(function (root) {

    "use strict";

    const E = root.LabEngine;
    const G = root.LabGeom;
    const SC = root.SCLab;

    const EPS0 = 8.854e-12;
    const Q = 1.602e-19;

    const METALS = E.METALS;
    const INSUL = E.INSULATORS;
    const SEMI = E.SEMICONDUCTORS;
    const WF = E.WORKFUNCTION;


    /* ------------------------------------------------
       TEMPLATES
    ------------------------------------------------ */

    function r(x, y, w, h, pad) {

        const s = { t: "r", x: x, y: y, w: w, h: h };

        if (pad) { s.pad = pad; }

        return s;
    }


    // Plain geometry for a horizontal channel. Source on the left, drain on the right,
    // gate pad above. All in um.
    function layout(p) {

        const L = p.L;
        const W = p.W;

        const sw = 30;                       // contact metal length
        const x0 = 0;
        const xs1 = x0 + sw;                 // channel starts
        const xd0 = xs1 + L;                 // channel ends
        const xd1 = xd0 + sw;

        const mid = W / 2;
        const padSize = 100;

        const out = {
            L: L, W: W, xs1: xs1, xd0: xd0, xd1: xd1,
            sMetal: r(x0, 0, sw, W),
            dMetal: r(xd0, 0, sw, W),
            sLead: r(x0 - 40, mid - 10, 50, 20),
            dLead: r(xd1 - 10, mid - 10, 50, 20),
            sPad: r(x0 - 40 - padSize + 5, mid - padSize / 2, padSize, padSize, "S"),
            dPad: r(xd1 + 40 - 5, mid - padSize / 2, padSize, padSize, "D"),
            sem: r(x0 + 10, -1, xd1 - x0 - 20, W + 2)
        };

        const gm = p.gateOverlap;
        const gx = xs1 - gm;
        const gw = L + 2 * gm;
        const gy = 4;

        out.gate = r(gx, -gy, gw, W + 2 * gy);
        const lw = Math.min(20, gw);

        out.gateLead = r(gx + gw / 2 - lw / 2, -gy - 70, lw, 80);
        out.gatePad = r(gx + gw / 2 - padSize / 2, -gy - 70 - padSize + 5, padSize, padSize, "G");
        out.dielectric = r(gx - 6, -gy - 6, gw + 12, W + 2 * gy + 12);

        return out;
    }


    function buildTemplate(kind, name, params) {

        const p = Object.assign({ L: 5, W: 30, gateOverlap: 4 }, params || {});

        const g = layout(p);

        const layers = [];

        const mk = function (role, opts, shapes) {

            const l = E.newLayer(role, opts);

            l.shapes = shapes;
            l.mask.type = "chrome";

            E.syncLayer(l);
            l.mask.field = E.requiredField(SC.RESISTS[l.litho.resist].tone, l.litho.method);

            layers.push(l);

            return l;
        };

        const contacts = [g.sMetal, g.dMetal, g.sLead, g.dLead, g.sPad, g.dPad];

        if (name === "fet-top") {

            mk("semiconductor", { name: "Channel", material: "mos2", thickness: 0.01 }, [g.sem]);
            mk("collector", { name: "Source / drain metal", material: "ti", thickness: 0.1 }, contacts.slice());
            mk("insulation", { name: "Gate dielectric", material: "al2o3", thickness: 0.03, mode: "add" }, [g.dielectric]);
            mk("collector", { name: "Gate metal", material: "au", thickness: 0.1 }, [g.gate, g.gateLead, g.gatePad]);

        } else if (name === "fet-back") {

            mk("collector", { name: "Gate metal", material: "au", thickness: 0.1 }, [g.gate, g.gateLead, g.gatePad]);
            mk("insulation", { name: "Gate dielectric", material: "al2o3", thickness: 0.03, mode: "add" }, [g.dielectric]);
            mk("semiconductor", { name: "Channel", material: "mos2", thickness: 0.01 }, [g.sem]);
            mk("collector", { name: "Source / drain metal", material: "ti", thickness: 0.1 }, contacts.slice());

        } else if (name === "biofet-window" || name === "biofet-backgate") {

            if (name === "biofet-backgate") {

                mk("collector", { name: "Back gate metal", material: "au", thickness: 0.1 }, [g.gate, g.gateLead, g.gatePad]);
                mk("insulation", { name: "Gate dielectric", material: "al2o3", thickness: 0.03, mode: "add" }, [g.dielectric]);
            }

            mk("semiconductor", { name: "Sensing channel", material: "in2o3", thickness: 0.01 }, [g.sem]);
            mk("collector", { name: "Source / drain metal", material: "ti", thickness: 0.1 }, contacts.slice());

            // SU-8 covers everything except the channel and the pads.
            mk("insulation", { name: "Passivation (sensing window)", material: "su8", thickness: 2, mode: "cut" }, [
                r(g.xs1, -2, p.L, p.W + 4),
                r(g.sPad.x + 10, g.sPad.y + 10, g.sPad.w - 20, g.sPad.h - 20),
                r(g.dPad.x + 10, g.dPad.y + 10, g.dPad.w - 20, g.dPad.h - 20)
            ].concat(name === "biofet-backgate" ? [r(g.gatePad.x + 10, g.gatePad.y + 10, g.gatePad.w - 20, g.gatePad.h - 20)] : []));
        }

        const design = { id: E.uid("D"), name: "", kind: kind, electrolyte: "acid", grid: 1, layers: layers, receptor: "none" };

        return design;
    }

    const TEMPLATES_FET = [
        { id: "fet-top", name: "Top-gate transistor", blurb: "Channel, source/drain, gate dielectric and a gate on top. Chrome masks." },
        { id: "fet-back", name: "Bottom-gate transistor", blurb: "Gate and dielectric under the channel, contacts on top." },
        { id: "blank", name: "Blank (draw everything yourself)", blurb: "One empty semiconductor layer." }
    ];

    const TEMPLATES_BIOFET = [
        { id: "biofet-window", name: "Liquid-gated BioFET", blurb: "Channel and contacts under SU-8, with a window over the channel. The solution is the gate." },
        { id: "biofet-backgate", name: "BioFET with back gate", blurb: "The same, plus a bottom gate you can use dry to check the transistor first." },
        { id: "blank", name: "Blank (draw everything yourself)", blurb: "One empty semiconductor layer." }
    ];


    /* ------------------------------------------------
       ANALYSIS
    ------------------------------------------------ */

    function barrier(sem, metalKey) {

        const wf = WF[metalKey] || 4.7;

        if (sem.type === "n") { return Math.max(0.03, 0.4 * (wf - sem.chi)); }
        if (sem.type === "p") { return Math.max(0.03, 0.4 * (sem.chi - wf)); }

        return 0.05 + 0.1 * Math.abs(wf - sem.chi);
    }


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

        const isFet = design.kind === "fet";

        const base = function (extra) {

            return Object.assign({
                kind: design.kind, status: "lost", reason: "", vMax: 1, life: 1, quality: 0, rShort: 50,
                rs: 1e3, rd: 1e3, cox: 1e-3, gateFrac: 0, hasGate: false, mu0: 1, vt: 0, gu: 1e-9, sc: "mos2", type: "n"
            }, extra || {});
        };

        const failDev = function (reason, status, extra) {

            info.notes = notes;

            return finish(base(Object.assign({ reason: reason, status: status || "lost" }, extra || {})));
        };

        // The semiconductor.
        const semIdxList = [];

        per.forEach(function (q, k) { if (q.layer.role === "semiconductor" && ctx.shapesOf[k].length) { semIdxList.push(k); } });

        if (!semIdxList.length) {

            const bad = per.filter(function (q) { return q.layer.role === "semiconductor" && q.p.status !== "ok"; })[0];

            notes.push("There is no semiconductor channel in this device.");

            return failDev(bad ? "The channel layer “" + bad.layer.name + "” did not print correctly" : "No semiconductor channel", "lost");
        }

        if (semIdxList.length > 1) { notes.push("Only the first semiconductor layer is used as the channel."); }

        const si = semIdxList[0];
        const semLayer = per[si].layer;
        const sc = SEMI[semLayer.material];
        const semP = P[si];

        // Nets from pads.
        const rootsFor = function (lbl) {

            return Object.keys(ctx.netLabel).filter(function (k) { return ctx.netLabel[k][lbl]; }).map(Number);
        };

        const sRoots = rootsFor("S");
        const dRoots = rootsFor("D");
        const gRoots = rootsFor("G");

        if (!sRoots.length || !dRoots.length) {

            notes.push(!sRoots.length ? "No working source (S) contact pad was found." : "No working drain (D) contact pad was found.");

            const bad = per.filter(function (q) { return q.p.status !== "ok"; })[0];

            return failDev(bad ? "Layer “" + bad.layer.name + "” did not print correctly" : "A contact pad is missing, buried or not connected", "lost");
        }

        if (isFet && !gRoots.length) {

            notes.push("A MOSFET needs a gate (G) pad.");

            return failDev("No gate pad", "lost");
        }

        const sRoot = sRoots[0];
        const dRoot = dRoots[0];
        const gRoot = gRoots.length ? gRoots[0] : -1;

        const labelsOf = function (root) { return ctx.netLabel[root] || {}; };

        if (sRoot === dRoot || labelsOf(sRoot).D) {

            notes.push("The source and drain pads are joined by a conductor (a metal layer bridges them).");

            return failDev("Source and drain are connected by metal", "short");
        }

        let gateToChannelShort = false;

        if (gRoot >= 0 && (gRoot === sRoot || gRoot === dRoot)) {

            notes.push("The gate is joined to the source or drain by metal, so it cannot control the channel independently.");

            return failDev("The gate is shorted to the source or drain", "short");
        }

        // Crop to the semiconductor.
        let i0 = frame.w;
        let i1 = -1;
        let j0 = frame.h;
        let j1 = -1;

        for (let j = 0; j < frame.h; j++) {

            for (let i = 0; i < frame.w; i++) {

                if (semP[j * frame.w + i]) {

                    if (i < i0) { i0 = i; }
                    if (i > i1) { i1 = i; }
                    if (j < j0) { j0 = j; }
                    if (j > j1) { j1 = j; }
                }
            }
        }

        if (i1 < 0) { return failDev("The channel did not print", "lost"); }

        const cw = i1 - i0 + 1;
        const ch = j1 - j0 + 1;
        const cn = cw * ch;

        const S = new Uint8Array(cn);
        const D = new Uint8Array(cn);
        const gated = new Uint8Array(cn);
        const semC = new Uint8Array(cn);
        const gateDiel = new Float32Array(cn);          // um of t/eps between gate and channel
        const topDiel = new Float32Array(cn);           // um of t/eps above the channel
        const metalAbove = new Uint8Array(cn);
        const gateDirect = new Uint8Array(cn);

        const nl = per.length;

        const contactMetal = { S: {}, D: {} };

        let aMetalExposed = 0;

        for (let j = 0; j < ch; j++) {

            for (let i = 0; i < cw; i++) {

                const gi = (j + j0) * frame.w + (i + i0);
                const ci = j * cw + i;

                if (!semP[gi]) { continue; }

                semC[ci] = 1;

                for (let m = 0; m < nl; m++) {

                    if (m === si || !P[m][gi]) { continue; }

                    const lo = Math.min(m, si);
                    const hi = Math.max(m, si);

                    if (!ctx.conductive[m]) {

                        // Insulation above the channel adds to the top dielectric.
                        if (m > si && per[m].layer.role === "insulation") {

                            topDiel[ci] += per[m].layer.thickness / INSUL[per[m].layer.material].eps;
                        }

                        continue;
                    }

                    if (m > si) { metalAbove[ci] = 1; }

                    const root = ctx.nodeAt(m, gi);

                    if (root !== sRoot && root !== dRoot && root !== gRoot) { continue; }

                    let blocked = false;
                    let diel = 0;
                    let hasIns = false;

                    for (let k = lo + 1; k < hi; k++) {

                        if (ctx.conductive[k] || !P[k][gi]) { continue; }

                        blocked = true;

                        if (per[k].layer.role === "insulation") {

                            hasIns = true;
                            diel += per[k].layer.thickness / INSUL[per[k].layer.material].eps;
                        }
                    }

                    if (root === sRoot && !blocked) {

                        S[ci] = 1;

                        const key = per[m].layer.material;

                        contactMetal.S[key] = (contactMetal.S[key] || 0) + 1;

                    } else if (root === dRoot && !blocked) {

                        D[ci] = 1;

                        const key = per[m].layer.material;

                        contactMetal.D[key] = (contactMetal.D[key] || 0) + 1;

                    } else if (root === gRoot) {

                        if (!blocked) { gateDirect[ci] = 1; }
                        else if (hasIns) { gated[ci] = 1; gateDiel[ci] = diel; }
                    }
                }
            }
        }

        // Metal exposed to the solution (no insulation above it).
        for (let m = 0; m < nl; m++) {

            if (!ctx.conductive[m]) { continue; }

            for (let q = 0; q < n; q++) {

                if (P[m][q] && !ctx.coveredAbove(m, q)) {

                    let over = false;

                    for (let k = m + 1; k < nl; k++) { if (ctx.conductive[k] && P[k][q]) { over = true; break; } }

                    if (!over) {

                        const root = ctx.nodeAt(m, q);

                        // Pads are outside the liquid.
                        if (!(ctx.padMask.S && ctx.padMask.S[q]) && !(ctx.padMask.D && ctx.padMask.D[q]) && !(ctx.padMask.G && ctx.padMask.G[q]) && (root === sRoot || root === dRoot || root === gRoot)) {

                            aMetalExposed += px * px;
                        }
                    }
                }
            }
        }

        // Channel cells are semiconductor not under a contact.
        let nChan = 0;
        let nGated = 0;
        let nDirect = 0;
        let nExposed = 0;

        for (let c = 0; c < cn; c++) {

            if (!semC[c]) { continue; }

            if (S[c] || D[c]) { continue; }

            nChan += 1;

            if (gated[c]) { nGated += 1; }
            if (gateDirect[c]) { nDirect += 1; }
            if (!metalAbove[c] && topDiel[c] < 0.01) { nExposed += 1; }
        }

        const sCount = S.reduce(function (a, v) { return a + v; }, 0);
        const dCount = D.reduce(function (a, v) { return a + v; }, 0);

        if (!sCount || !dCount) {

            notes.push("The source or drain metal does not touch the channel (or an insulating layer sits between them).");

            return failDev("Source or drain does not contact the channel", "lost");
        }

        if (!nChan) {

            notes.push("There is no channel between the source and drain contacts.");

            return failDev("No channel between source and drain", "short");
        }

        // Geometry: how many squares of channel connect source to drain.
        const gAll = new Float32Array(cn);

        for (let c = 0; c < cn; c++) { if (semC[c] && !S[c] && !D[c]) { gAll[c] = 1; } }

        const sol = G.solveTwoTerminal(gAll, S, D, cw, ch);

        if (!sol.connected || sol.G <= 0) {

            notes.push("The channel does not connect the source to the drain.");

            return failDev("No channel path from source to drain", "lost");
        }

        const gAllSq = sol.G;

        // Shortest source-to-drain distance (um).
        const dtS = G.edt(S, cw, ch);
        const dtD = G.edt(D, cw, ch);

        let lMin = Infinity;

        for (let c = 0; c < cn; c++) { if (D[c] && dtS[c] < lMin) { lMin = dtS[c]; } }

        const Lum = Math.max(lMin * px - px, px / 2);
        const Wum = gAllSq * Lum;

        // How much of the channel that carries current is under the gate?
        let nBetween = 0;
        let nBetweenGated = 0;

        for (let c = 0; c < cn; c++) {

            if (!semC[c] || S[c] || D[c]) { continue; }

            if (dtS[c] * px <= Lum * 1.3 + px && dtD[c] * px <= Lum * 1.3 + px) {

                nBetween += 1;

                if (gated[c]) { nBetweenGated += 1; }
            }
        }

        const gateCover = nBetween ? nBetweenGated / nBetween : 0;

        // Contact resistance from the metal on each side.
        const dominant = function (tab) {

            let best = "ti";
            let cnt = -1;

            Object.keys(tab).forEach(function (k) { if (tab[k] > cnt) { cnt = tab[k]; best = k; } });

            return best;
        };

        const mu0 = sc.mu * vary(0.08) * (0.6 + 0.4 * per[si].p.quality);
        const gu = Q * sc.n0 * mu0;

        const chanOnly = new Uint8Array(cn);

        for (let c = 0; c < cn; c++) { chanOnly[c] = semC[c] && !S[c] && !D[c] ? 1 : 0; }

        const dtChan = G.edt(chanOnly, cw, ch);

        // Under the contact the channel is on, so use the on-state sheet conductance for the transfer length.
        const gOn = Math.max(gu, sc.mu * 1e-4 * 2e-3 * 2);

        const contactR = function (mask, key) {

            const phi = barrier(sc, key);
            const rho = 800 * Math.exp(phi / 0.12) * vary(0.1);                 // ohm um2 (about 1 kohm um at the best contacts)
            const lt = Math.sqrt(rho * gOn);

            let a = 0;

            for (let c = 0; c < cn; c++) {

                if (mask[c] && dtChan[c] * px <= Math.max(lt, px)) { a += px * px; }
            }

            return { r: a > 0 ? rho / a : 1e9, phi: phi, lt: lt, rho: rho };
        };

        const sMetal = dominant(contactMetal.S);
        const dMetal = dominant(contactMetal.D);

        const rcS = contactR(S, sMetal);
        const rcD = contactR(D, dMetal);

        // Gate dielectric: capacitance, breakdown, pinholes.
        let cox = 0;
        let nCox = 0;

        for (let c = 0; c < cn; c++) {

            if (gated[c] && gateDiel[c] > 0) { cox += EPS0 / (gateDiel[c] * 1e-6); nCox += 1; }
        }

        cox = nCox ? cox / nCox : 0;

        const aGate = nGated * px * px;                                   // um2

        // Physical dielectric thickness between gate and channel (use the thinnest column).
        let tMin = Infinity;
        let ebdSum = 0;
        let pPin = 0;

        per.forEach(function (q, k) {

            if (q.layer.role !== "insulation") { return; }

            // Is this insulator between the gate and the channel?
            let between = 0;

            for (let c = 0; c < cn && between < 3; c++) {

                if (!gated[c]) { continue; }

                const gi = (Math.floor(c / cw) + j0) * frame.w + (c % cw + i0);

                if (P[k][gi]) { between += 1; }
            }

            if (!between) { return; }

            const mat = INSUL[q.layer.material];
            const t = q.layer.thickness;

            if (t < tMin) { tMin = t; }

            ebdSum += mat.ebd * t * 100;                                   // volts

            const lam = mat.dpin * Math.exp(-(t - 0.03) / 0.03) * aGate * 1e-8;

            pPin = 1 - (1 - pPin) * Math.exp(-lam);
        });

        const gateShort = gRoot >= 0 && (nDirect > 0 || rand() < pPin);

        if (nDirect > 0) { notes.push("The gate metal touches the channel directly (no dielectric between), so it leaks like a diode."); }
        else if (gateShort) { notes.push("A pinhole in the gate dielectric lets the gate leak into the channel."); }

        // Parasitic overlap of the gate with source and drain.
        let aGs = 0;
        let aGd = 0;

        if (gRoot >= 0) {

            for (let m = 0; m < nl; m++) {

                if (!ctx.conductive[m]) { continue; }

                for (let q = 0; q < n; q++) {

                    if (!P[m][q]) { continue; }

                    const root = ctx.nodeAt(m, q);

                    if (root !== gRoot) { continue; }

                    for (let k = 0; k < nl; k++) {

                        if (k === m || !ctx.conductive[k] || !P[k][q]) { continue; }

                        const r2 = ctx.nodeAt(k, q);

                        if (r2 === sRoot) { aGs += px * px; }
                        if (r2 === dRoot) { aGd += px * px; }
                    }
                }
            }
        }

        // Source-drain short from lithography residue or bridging.
        let pLitho = 0;

        per.forEach(function (q, k) {

            if (ctx.conductive[k] && isFinite(q.m.minGap) && q.m.pieces >= 2) { pLitho = Math.max(pLitho, q.p.shortProb * 0.5); }
        });

        info.pShort = pLitho;
        info.pPinhole = pPin;

        let status = "ok";
        let reason = "";

        if (rand() < pLitho) {

            status = "short";
            reason = "Resist residue or bridging joined the source and drain metal.";
        }

        // Which solution-facing dielectric sets the surface pH response?
        let betaSurface = sc.beta;
        let topName = "";

        for (let m = nl - 1; m > si; m--) {

            if (per[m].layer.role === "insulation") {

                // A thin dielectric directly over the channel (not a thick passivation film) is the sensing surface.
                if (per[m].layer.thickness < 0.3) { betaSurface = INSUL[per[m].layer.material].beta; topName = per[m].layer.name; }

                break;
            }
        }

        let matterHours = 0;

        info.parts = {
            L: Lum, W: Wum, gAllSq: gAllSq, rs: rcS.r, rd: rcD.r, phiS: rcS.phi, phiD: rcD.phi,
            sMetal: sMetal, dMetal: dMetal, gateCoverage: gateCover, exposedChannel: nExposed * px * px,
            cox: cox, aGs: aGs, aGd: aGd, aMetalExposed: aMetalExposed
        };

        info.areaPlus = 0;
        info.areaMinus = 0;
        info.gapMin = Lum;
        info.resolutionUm = px;

        // Coarse copies for the tables the compact model builds later.
        const target = 14000;
        const f = Math.max(1, Math.ceil(Math.sqrt(cn / target)));
        const kw = Math.ceil(cw / f);
        const kh = Math.ceil(ch / f);

        const coarse = {
            w: kw, h: kh,
            chan: new Float32Array(kw * kh),
            S: new Uint8Array(kw * kh),
            D: new Uint8Array(kw * kh),
            gate: new Float32Array(kw * kh),         // gated fraction x Cox weight (relative to cox)
            top: new Float32Array(kw * kh),          // mean top dielectric (um t/eps) over channel cells
            topCount: new Float32Array(kw * kh),
            exposed: new Float32Array(kw * kh)
        };

        for (let j = 0; j < ch; j++) {

            for (let i = 0; i < cw; i++) {

                const c = j * cw + i;

                if (!semC[c]) { continue; }

                const o = Math.floor(j / f) * kw + Math.floor(i / f);

                if (S[c]) { coarse.S[o] = 1; continue; }
                if (D[c]) { coarse.D[o] = 1; continue; }

                coarse.chan[o] += 1 / (f * f);

                if (gated[c] && gateDiel[c] > 0) { coarse.gate[o] += (EPS0 / (gateDiel[c] * 1e-6)) / (cox || 1) / (f * f); }

                coarse.top[o] += topDiel[c];
                coarse.topCount[o] += 1;

                if (!metalAbove[c]) { coarse.exposed[o] += 1 / (f * f); }
            }
        }

        for (let o = 0; o < coarse.top.length; o++) {

            if (coarse.topCount[o]) { coarse.top[o] /= coarse.topCount[o]; }

            // A coarse cell that holds contact is a terminal, not channel.
            if (coarse.S[o] || coarse.D[o]) { coarse.chan[o] = 0; coarse.gate[o] = 0; }
        }

        coarse.px = px * f;

        // Breakdown, drift and noise.
        const vt = sc.vt + vary(0.0) * 0 + (info.parts ? 0 : 0);

        let dvt = 0;

        // Fixed charge in the gate dielectric shifts the threshold.
        per.forEach(function (q) {

            if (q.layer.role !== "insulation") { return; }

            dvt += INSUL[q.layer.material].dvt * 0.5;
        });

        const dev = base({
            status: status, reason: reason,
            sc: semLayer.material, scName: sc.name, type: sc.type,
            mu0: mu0, gu: gu, vt: sc.vt + dvt + 0.06 * ctx.gauss(), dit: sc.dit, beta: betaSurface, topSurface: topName,
            water: sc.water,
            L: Lum, W: Wum, gAllSq: gAllSq, rs: rcS.r, rd: rcD.r,
            cox: cox, hasGate: gRoot >= 0 && nGated > 0, gateFrac: gateCover,
            gateShort: gateShort, gateDirect: nDirect > 0, vbd: ebdSum || 0, tOx: isFinite(tMin) ? tMin : 0,
            aGate: aGate, aGs: aGs, aGd: aGd, aMetalExposed: aMetalExposed,
            exposedFrac: nChan ? nExposed / nChan : 0, exposedArea: nExposed * px * px,
            chanArea: nChan * px * px,
            grid: coarse, quality: per[si].p.quality,
            rShort: 5 + 195 * rand(),
            receptor: design.receptor || "none",
            life: 1, vMax: 1
        });

        dev.noiseA = 3 * Math.sqrt(sc.dit / 1e11) * (1.2 - 0.4 * per[si].p.quality);          // mV um

        return finish(dev);
    }


    // Warnings that only apply to transistors.
    function check(design, out, labels) {

        const sem = design.layers.filter(function (l) { return l.role === "semiconductor" && l.shapes.length; })[0];

        if (!sem) { return; }

        const metals = design.layers.filter(function (l) { return l.role === "collector" && l.shapes.length; });

        if (!metals.length) { out.push({ level: "error", text: "A transistor needs metal layers for the source, drain and gate." }); }

        if (design.kind === "fet" && !design.layers.some(function (l) { return l.role === "insulation" && l.shapes.length; })) {

            out.push({ level: "warn", text: "There is no gate dielectric layer, so the gate cannot be insulated from the channel." });
        }
    }


    E.registerKind("fet", { analyze: analyze, buildTemplate: buildTemplate, check: check, templates: TEMPLATES_FET, cells: 900000, featDiv: 5 });
    E.registerKind("biofet", { analyze: analyze, buildTemplate: buildTemplate, check: check, templates: TEMPLATES_BIOFET, cells: 900000, featDiv: 5 });

    E.fetLayout = layout;

}(typeof window !== "undefined" ? window : globalThis));
