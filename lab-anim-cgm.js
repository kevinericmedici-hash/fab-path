/* ========================================
   VIRTUAL FAB LAB: GLUCOSE SENSOR ANIMATIONS

   "Inside the device" movies for the cgm kind: glucose and oxygen crawling
   through the films into the enzyme layer, peroxide reaching the electrode,
   interferents turned away by a permselective film, a sensor ageing in
   tissue, a day of readings, and a filament being pushed through skin.
   Registered as LabAnim.extra.cgm and called from LabAnim.insideBox.

   Needs lab-anim.js, lab-anim-kinds.js and lab-cgm-model.js.
======================================== */

(function (root) {

    "use strict";

    const A = root.LabAnim;
    const U = A.util;
    const C = root.LabCGM;

    const clamp = U.clamp;
    const lerp = U.lerp;
    const hash = U.hash;
    const text = U.text;

    function sig(x, d) {

        if (!isFinite(x)) { return "n/a"; }

        const a = Math.abs(x);

        if (a === 0) { return "0"; }
        if (a >= 1000) { return Math.round(x).toLocaleString("en-US"); }
        if (a >= 100) { return x.toFixed(0); }
        if (a >= 10) { return x.toFixed(d === undefined ? 1 : d); }
        if (a >= 1) { return x.toFixed(d === undefined ? 2 : d); }
        if (a >= 0.01) { return x.toFixed(3); }

        return x.toExponential(1);
    }

    function at(arr, u) { const f = clamp(u, 0, 1) * (arr.length - 1); const i = Math.floor(f); const j = Math.min(arr.length - 1, i + 1); return lerp(arr[i], arr[j], f - i); }

    const COL = { gox: "#f0a860", osgox: "#d9743a", mpd: "#7bd0c0", nafion: "#5ec8a0", pu: "#8f9bff", hydrogel: "#9ad0f0" };
    const NAME = { gox: "enzyme", osgox: "wired enzyme", mpd: "permselective film", nafion: "Nafion", pu: "limiting membrane", hydrogel: "hydrogel" };
    const METALCOL = { pt: "#c8d0dc", au: "#e8c06a", c: "#555d6e", ti: "#9aa0b0", agcl: "#b8b8c8", gc: "#3c414d" };

    const GLU = "#ffb347";
    const OXY = "#6aa8ff";
    const PER = "#ff6b6b";
    const ELE = "#ffe070";


    // Layers of the working electrode from the metal outwards, laid out for drawing (y grows downwards).
    function layout(dev, H) {

        const W = C.chan(dev, "W");
        const stack = W ? C.stackOf(W) : [];
        const yE = H - 52;
        const out = { W: W, stack: stack, yE: yE, layers: [], ei: C.enzymeIndex(stack), metal: W ? W.metal : "pt" };

        let y = yE;

        stack.forEach(function (f) {

            const hgt = clamp(12 + Math.sqrt(f.t) * 11, 12, 48);

            y -= hgt;

            out.layers.push({ mat: f.mat, y0: y, y1: y + hgt, f: f });
        });

        out.top = y;

        return out;
    }

    function speedIn(L, y, kind) {

        for (let k = 0; k < L.layers.length; k++) {

            const ly = L.layers[k];

            if (y >= ly.y0 && y < ly.y1) {

                const D = kind === "O" ? ly.f.ph.Do : ly.f.ph.Dg;

                return kind === "O" ? clamp(20 + 60 * (Math.log10(D) + 10), 18, 70) : clamp(6 + 9 * (Math.log10(D) + 12.5), 3.5, 45);
            }
        }

        return 42;
    }


    // The sensor surface with particles. Call .draw each frame; it returns what it shows.
    function scene(dev, o) {

        const parts = { g: [], o: [], p: [], e: [] };
        const sparks = [];
        let lastT = 0;
        let acc = { g: 0, o: 0 };
        let flow = 0;

        function step(ctx, t, dt, W, H, s) {

            const L = layout(dev, H);

            ctx.fillStyle = "#17202f";
            ctx.fillRect(0, 0, W, H);

            // Tissue fluid above, the films in the middle, the metal at the bottom.
            ctx.fillStyle = "rgba(120,160,220,0.08)";
            ctx.fillRect(0, 0, W, L.top);

            L.layers.forEach(function (ly, k) {

                ctx.fillStyle = COL[ly.mat] || "#aaaaaa";
                ctx.globalAlpha = 0.45;
                ctx.fillRect(70, ly.y0, W - 90, ly.y1 - ly.y0);
                ctx.globalAlpha = 1;
                ctx.strokeStyle = "rgba(255,255,255,0.18)";
                ctx.strokeRect(70, ly.y0, W - 90, ly.y1 - ly.y0);
                text(ctx, NAME[ly.mat] || ly.mat, 8, (ly.y0 + ly.y1) / 2 + 3, "#cbd2e3", 9);

                if (k === L.ei) {

                    // Enzyme molecules sit in the layer.
                    for (let q = 0; q < 14; q++) {

                        ctx.fillStyle = "rgba(255,255,255," + (0.18 + 0.2 * s.act) + ")";
                        ctx.beginPath();
                        ctx.arc(80 + hash(q + 5) * (W - 110), lerp(ly.y0 + 4, ly.y1 - 4, hash(q + 40)), 3.2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });

            ctx.fillStyle = METALCOL[L.metal] || "#c8d0dc";
            ctx.fillRect(70, L.yE, W - 90, 12);
            text(ctx, (L.metal === "agcl" ? "Ag/AgCl" : L.metal) + " electrode", 8, L.yE + 10, "#cbd2e3", 9);

            // The wire carries electrons to the potentiostat.
            ctx.strokeStyle = "rgba(255,255,255,0.35)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(70, L.yE + 6);
            ctx.lineTo(70, L.yE + 30);
            ctx.lineTo(W - 20, L.yE + 30);
            ctx.stroke();

            // Spawn glucose and oxygen at the top.
            acc.g += dt * clamp(s.g / 25, 0, 16);
            acc.o += dt * 5 * clamp(s.o / 0.06, 0.2, 4);

            while (acc.g >= 1 && parts.g.length < 90) { acc.g -= 1; parts.g.push({ x: 90 + Math.random() * (W - 130), y: 6 + Math.random() * 20, age: 0 }); }
            while (acc.o >= 1 && parts.o.length < 70) { acc.o -= 1; parts.o.push({ x: 90 + Math.random() * (W - 130), y: 6 + Math.random() * 20, age: 0 }); }

            acc.g = Math.min(acc.g, 3);
            acc.o = Math.min(acc.o, 3);

            const ezone = L.ei >= 0 ? L.layers[L.ei] : null;

            const inEnz = function (p) { return ezone && p.y >= ezone.y0 && p.y < ezone.y1; };

            // Glucose and oxygen move in; where both meet in the enzyme layer they react.
            const gHere = [];
            const oHere = [];

            parts.g.forEach(function (p) { if (inEnz(p)) { gHere.push(p); } });
            parts.o.forEach(function (p) { if (inEnz(p)) { oHere.push(p); } });

            const react = L.ei < 0 ? 0 : (s.mediator ? 1 : 1) * clamp(s.rateFrac, 0, 1);
            let made = 0;

            gHere.forEach(function (g) {

                if (!ezone || g.dead) { return; }

                const needO = !s.mediator;
                const ox = needO ? oHere.filter(function (q) { return !q.dead; })[0] : null;

                if ((!needO || ox) && Math.random() < dt * 3.2 * react) {

                    g.dead = true;

                    if (ox) { ox.dead = true; }

                    parts.p.push({ x: g.x, y: g.y, age: 0 });
                    made += 1;
                }
            });

            const move = function (arr, kind) {

                for (let q = arr.length - 1; q >= 0; q--) {

                    const p = arr[q];

                    p.age += dt;

                    if (p.dead) { arr.splice(q, 1); continue; }

                    const v = speedIn(L, p.y, kind);

                    // Particles queue up on the far side of a slow film.
                    p.y += v * dt * (0.6 + 0.4 * hash(q + Math.floor(p.age * 3)));
                    p.x += Math.sin(t * 3 + q * 1.7) * 0.5 + (hash(q * 3 + Math.floor(t * 4)) - 0.5) * 1.4;
                    p.x = clamp(p.x, 76, W - 24);

                    const floor = ezone && kind === "O" ? ezone.y1 - 3 : (L.layers.length ? L.yE - 4 : L.yE - 4);

                    if (kind === "G" && ezone && p.y > ezone.y1 - 3) { p.y = ezone.y1 - 3; }
                    if (p.y > floor) { p.y = floor; }

                    if (p.age > (kind === "G" ? 16 : 8)) { arr.splice(q, 1); continue; }

                    ctx.fillStyle = kind === "G" ? GLU : OXY;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, kind === "G" ? 3.6 : 2.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            };

            move(parts.g, "G");
            move(parts.o, "O");

            // Peroxide (or mediator) drifts to the electrode and gives up electrons.
            for (let q = parts.p.length - 1; q >= 0; q--) {

                const p = parts.p[q];

                p.y += 38 * dt;

                if (p.y >= L.yE) {

                    parts.p.splice(q, 1);

                    if (s.collect > 0.15) { sparks.push({ x: p.x, y: L.yE, a: 0 }); parts.e.push({ x: 70, k: 0 }); flow += 1; }

                    continue;
                }

                ctx.fillStyle = PER;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let q = sparks.length - 1; q >= 0; q--) {

                const sp = sparks[q];

                sp.a += dt * 2.2;
                ctx.fillStyle = "rgba(255,224,112," + (1 - sp.a) + ")";
                ctx.beginPath();
                ctx.arc(sp.x, sp.y + 4 + sp.a * 8, 4, 0, Math.PI * 2);
                ctx.fill();

                if (sp.a >= 1) { sparks.splice(q, 1); }
            }

            for (let q = parts.e.length - 1; q >= 0; q--) {

                const e = parts.e[q];

                e.k += dt * 0.45;

                if (e.k >= 1) { parts.e.splice(q, 1); continue; }

                const x = 70 + e.k * (W - 90);

                ctx.fillStyle = ELE;
                ctx.beginPath();
                ctx.arc(x, L.yE + 30, 2.6, 0, Math.PI * 2);
                ctx.fill();
            }

            lastT = t;

            return { L: L, made: made };
        }

        return { step: step };
    }

    function legend(ctx, W, H, items) {

        let x = 10;

        items.forEach(function (it) {

            ctx.fillStyle = it[0];
            ctx.beginPath();
            ctx.arc(x + 4, H - 10, 3.4, 0, Math.PI * 2);
            ctx.fill();
            text(ctx, it[1], x + 11, H - 6, "#8791ab", 9);
            x += 11 + it[1].length * 5 + 14;
        });
    }

    // Model numbers for one glucose level.
    function sample(dev, g, o2, E, state) {

        const s = C.signal(dev, { G: g, O: o2, E: E, state: state });
        const R = s.R || {};

        return {
            s: s, nA: s.iW * 1e9, oxFrac: R.Oe !== undefined && o2 > 0 ? clamp(R.Oe / (o2 * state.O2f), 0, 1) : 1,
            rateFrac: R.rate && R.Pg ? clamp(R.rate / Math.max(R.Pg * mmol(g), 1e-12), 0, 1) : 0.4,
            mediator: !!(R.enz && R.enz.ph.med), collect: 1
        };
    }

    function mmol(g) { return g / C.MGDL; }


    /* ------------------------------------------------
       CALIBRATION AND OXYGEN
    ------------------------------------------------ */

    function calibration(r, devs) {

        const rep = r.reps[0];
        const dev = devs[0];

        if (!dev || !rep || !rep.ok || !rep.t) { return null; }

        const st0 = C.stateAt(dev, 0);
        const sc = scene(dev, {});
        const E = rep.E;
        const o2 = rep.o2;

        const box = A.playbox({
            title: "Inside the sensor: glucose steps in the beaker",
            dur: 22, ratio: 0.5,
            series: [{ x: rep.t, y: rep.i, color: "#54e0c7", width: 1.6 }],
            xLabel: "Time (s)", yLabel: "Current (nA)",
            caption: "Glucose (orange) and oxygen (blue) diffuse in through the films. The enzyme turns each pair into hydrogen peroxide (red), the electrode takes electrons from it (yellow) and the potentiostat reads that current. The limiting membrane slows glucose a lot and oxygen only a little.",
            readout: function (i) { return sig(rep.t[i], 0) + " s: " + sig(rep.gTrue[i], 3) + " mg/dL"; },
            onInfo: function (where) { return where === "mech" ? "Watch the orange glucose crawl through the limiting membrane while the blue oxygen slips through. With too little membrane the enzyme runs out of oxygen and glucose piles up unused." : "Drag along the current curve to jump to a glucose level."; },
            draw: function (ctx, u, t, dt, W, H) {

                const i = clamp(Math.round(u * (rep.t.length - 1)), 0, rep.t.length - 1);
                const g = rep.gTrue[i];
                const m = sample(dev, g, o2, E, st0);

                const res = sc.step(ctx, t, dt, W, H, { g: g, o: o2, act: 1, mediator: m.mediator, rateFrac: m.rateFrac, collect: m.s.iGlu > 1e-12 ? 1 : 0 });

                text(ctx, "glucose " + sig(g, 3) + " mg/dL", W - 10, 18, GLU, 11, "right");
                text(ctx, "current " + sig(rep.i[i]) + " nA", W - 10, 34, "#54e0c7", 11, "right");

                if (!m.mediator) { text(ctx, "oxygen left at the enzyme: " + Math.round(m.oxFrac * 100) + "%", W - 10, 50, m.oxFrac < 0.3 ? "#f2b84b" : OXY, 10, "right"); }

                legend(ctx, W, H, [[GLU, "glucose"], [OXY, "oxygen"], [PER, "peroxide"], [ELE, "electrons to the potentiostat"]]);

                return res;
            }
        });

        return box;
    }

    function oxygen(r, devs) {

        const rep = r.reps[0];
        const dev = devs[0];

        if (!dev || !rep || !rep.ok || !rep.curves) { return null; }

        const st0 = C.stateAt(dev, 0);
        const sc = scene(dev, {});
        const lvls = [0.2, 0.06, 0.03];
        const colors = ["#6aa8ff", "#54e0c7", "#f2b84b"];

        const box = A.playbox({
            title: "Inside the sensor: running short of oxygen",
            dur: 24, ratio: 0.5,
            series: rep.curves.map(function (c, k) { return { x: rep.G, y: c.I, color: colors[k], width: k === 0 ? 1.4 : 2, dash: k === 0 ? [5, 4] : [] }; }),
            xLabel: "Glucose (mg/dL)", yLabel: "Current (nA)",
            caption: "The playhead raises glucose while the oxygen supply stays low (tissue level). An enzyme sensor makes one peroxide per oxygen, so when the oxygen runs out the current stops rising, however much glucose there is. A limiting membrane or a wired enzyme avoids this.",
            readout: function (i) { return sig(rep.G[i], 3) + " mg/dL"; },
            onInfo: function (where) { return where === "mech" ? "Dashed blue is air-saturated, teal is typical tissue, amber is low-oxygen tissue. The picture here uses typical tissue." : "Drag along the curves to raise or lower the glucose."; },
            draw: function (ctx, u, t, dt, W, H) {

                const g = at(rep.G, u);
                const m = sample(dev, g, lvls[1], rep.E, st0);

                sc.step(ctx, t, dt, W, H, { g: g, o: lvls[1], act: 1, mediator: m.mediator, rateFrac: m.rateFrac, collect: 1 });

                text(ctx, "glucose " + sig(g, 3) + " mg/dL", W - 10, 18, GLU, 11, "right");
                text(ctx, "current " + sig(m.nA) + " nA", W - 10, 34, "#54e0c7", 11, "right");

                if (!m.mediator) {

                    // An oxygen gauge.
                    ctx.fillStyle = "rgba(255,255,255,0.08)";
                    ctx.fillRect(W - 120, 42, 110, 8);
                    ctx.fillStyle = m.oxFrac < 0.3 ? "#f2b84b" : OXY;
                    ctx.fillRect(W - 120, 42, 110 * m.oxFrac, 8);
                    text(ctx, "oxygen at the enzyme", W - 10, 62, "#8791ab", 9, "right");

                } else {

                    text(ctx, "mediator: no oxygen needed", W - 10, 52, "#7be0b0", 10, "right");
                }

                legend(ctx, W, H, [[GLU, "glucose"], [OXY, "oxygen"], [PER, "peroxide"], [ELE, "electrons to the potentiostat"]]);
            }
        });

        return box;
    }


    /* ------------------------------------------------
       INTERFERENTS
    ------------------------------------------------ */

    function interferents(r, devs) {

        const rep = r.reps[0];
        const dev = devs[0];

        if (!dev || !rep || !rep.ok || !rep.t) { return null; }

        const W = C.chan(dev, "W");
        const stack = W ? C.stackOf(W) : [];
        const colors = { apap: "#7be0b0", aa: "#c792ff", ua: "#e0d070" };
        const labels = { apap: "acetaminophen", aa: "vitamin C", ua: "uric acid" };
        const pass = {};

        rep.species.forEach(function (s) { pass[s.id] = clamp(Math.abs(s.raw) / 35, 0.04, 1); });

        const mols = [];

        for (let i = 0; i < 54; i++) { mols.push({ x: 80 + hash(i) * 280, y: hash(i + 80) * 90, id: ["apap", "aa", "ua"][i % 3], k: i }); }

        const series = [{ x: rep.t, y: rep.raw, color: "#54e0c7", width: 1.8 }];

        if (rep.hasS) { series.push({ x: rep.t, y: rep.subtracted, color: "#f2b84b", width: 2 }); }

        series.push({ x: rep.t, y: rep.truth, color: "#888888", dash: [5, 4], width: 1.3 });

        const sparks = [];

        const box = A.playbox({
            title: "Inside the sensor: interferents at the electrode",
            dur: 26, ratio: 0.5, series: series,
            xLabel: "Time (s)", yLabel: "Apparent glucose (mg/dL)",
            caption: "Interferents are molecules other than glucose that also give up electrons at the electrode. A permselective film holds the larger or charged ones back. The teal curve is the working electrode alone; the amber one has the sentinel subtracted. The grey dashed line is the true glucose.",
            readout: function (i) { return sig(rep.t[i], 0) + " s: reads " + sig(rep.raw[i], 3) + " mg/dL"; },
            onInfo: function (where) { return where === "mech" ? "Green: acetaminophen (at 100 s). Purple: vitamin C (200 s). Yellow: uric acid (300 s). The fewer that reach the electrode, the smaller the false reading." : "Drag along the curve to jump."; },
            draw: function (ctx, u, t, dt, Wd, H) {

                const secs = u * 420;
                const L = layout(dev, H);

                ctx.fillStyle = "#17202f";
                ctx.fillRect(0, 0, Wd, H);
                ctx.fillStyle = "rgba(120,160,220,0.08)";
                ctx.fillRect(0, 0, Wd, L.top);

                L.layers.forEach(function (ly) {

                    ctx.fillStyle = COL[ly.mat] || "#aaaaaa";
                    ctx.globalAlpha = 0.45;
                    ctx.fillRect(70, ly.y0, Wd - 90, ly.y1 - ly.y0);
                    ctx.globalAlpha = 1;
                    ctx.strokeStyle = "rgba(255,255,255,0.18)";
                    ctx.strokeRect(70, ly.y0, Wd - 90, ly.y1 - ly.y0);
                    text(ctx, NAME[ly.mat] || ly.mat, 8, (ly.y0 + ly.y1) / 2 + 3, "#cbd2e3", 9);
                });

                ctx.fillStyle = METALCOL[L.metal] || "#c8d0dc";
                ctx.fillRect(70, L.yE, Wd - 90, 12);
                text(ctx, "electrode", 8, L.yE + 10, "#cbd2e3", 9);

                const onAt = { apap: 100, aa: 200, ua: 300 };
                const barrier = L.top;
                const filmed = stack.some(function (f) { return f.mat === "mpd" || f.mat === "nafion"; });

                mols.forEach(function (m) {

                    if (secs < onAt[m.id]) { return; }

                    m.y += 26 * dt * (0.5 + hash(m.k + Math.floor(t * 2)));
                    m.x += (hash(m.k * 5 + Math.floor(t * 4)) - 0.5) * 1.6;
                    m.x = clamp(m.x, 76, Wd - 24);

                    // A molecule that gets through the films is oxidised at the electrode; the rest are turned back.
                    if (m.y >= barrier + 4 && !m.entered) {

                        m.entered = true;
                        m.through = hash(m.k * 11 + Math.floor(t)) < pass[m.id];

                        if (!m.through) { m.y = 4 + hash(m.k) * 40; m.entered = false; m.bounce = 1; }
                    }

                    if (m.entered && m.through) {

                        m.y += 40 * dt;

                        if (m.y >= L.yE) { sparks.push({ x: m.x, y: L.yE, a: 0, id: m.id }); m.y = 4 + hash(m.k + t) * 40; m.entered = false; }
                    }

                    ctx.fillStyle = colors[m.id];
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, 3.3, 0, Math.PI * 2);
                    ctx.fill();
                });

                for (let q = sparks.length - 1; q >= 0; q--) {

                    const sp = sparks[q];

                    sp.a += dt * 2.2;
                    ctx.fillStyle = "rgba(255,224,112," + (1 - sp.a) + ")";
                    ctx.beginPath();
                    ctx.arc(sp.x, sp.y + 4 + sp.a * 8, 4, 0, Math.PI * 2);
                    ctx.fill();

                    if (sp.a >= 1) { sparks.splice(q, 1); }
                }

                text(ctx, filmed ? "a permselective film is turning molecules away" : "nothing stops them: bare films let them through", Wd - 10, 16, filmed ? "#7be0b0" : "#f2b84b", 10, "right");
                text(ctx, "reads " + sig(at(rep.raw, u), 3) + " mg/dL (true 100)", Wd - 10, 32, "#54e0c7", 11, "right");

                legend(ctx, Wd, H, [["#7be0b0", "acetaminophen"], ["#c792ff", "vitamin C"], ["#e0d070", "uric acid"]]);
            }
        });

        return box;
    }


    /* ------------------------------------------------
       WEAR: TEN DAYS IN TISSUE
    ------------------------------------------------ */

    function wear(r, devs) {

        const rep = r.reps[0];
        const dev = devs[0];

        if (!dev || !rep || !rep.ok || !rep.days) { return null; }

        const W = C.chan(dev, "W");
        const stack = W ? C.stackOf(W) : [];
        const flakes = [];
        const seen = {};

        const box = A.playbox({
            title: "Inside the sensor: two weeks in tissue",
            dur: 24, ratio: 0.5,
            series: [{ x: rep.days, y: rep.rel, color: "#54e0c7", width: 2 }, { x: [0, 14], y: [70, 70], color: "#e07070", dash: [5, 4], width: 1.2 }],
            xLabel: "Days of wear", yLabel: "Sensitivity (% of day 0)",
            caption: "Tissue builds a capsule around the sensor, oxygen near it dips and recovers, the enzyme slowly loses activity and films can peel. The curve is the sensitivity that results.",
            readout: function (i) { return "day " + sig(rep.days[i], 3) + ": " + sig(rep.rel[i], 3) + "% of day 0"; },
            onInfo: function (where) { return where === "mech" ? "Pink cells and fibres are the capsule. The yellow dots are active enzyme. A film that peels flakes off." : "Drag along the curve to jump to a day."; },
            draw: function (ctx, u, t, dt, Wd, H) {

                const day = u * 14;
                const st = C.stateAt(dev, day);

                ctx.fillStyle = "#1b1f2f";
                ctx.fillRect(0, 0, Wd, H);

                // Tissue with capillaries.
                for (let q = 0; q < 70; q++) {

                    ctx.fillStyle = "rgba(200,140,160,0.10)";
                    ctx.beginPath();
                    ctx.arc(hash(q) * Wd, hash(q + 70) * H, 5 + hash(q + 30) * 5, 0, Math.PI * 2);
                    ctx.fill();
                }

                const sx = Wd / 2 - 24;
                const sw = 48;
                const cap = clamp(st.capsule / 28, 0, 1.4) * 46;

                // The capsule around the sensor.
                ctx.fillStyle = "rgba(230,130,170," + (0.2 + 0.35 * Math.min(cap / 40, 1)) + ")";
                ctx.fillRect(sx - cap, 40, sw + 2 * cap, H - 56);

                for (let q = 0; q < 30; q++) {

                    const side = q % 2 ? 1 : -1;
                    const off = hash(q + 9) * cap;

                    ctx.fillStyle = "rgba(255,170,200,0.55)";
                    ctx.beginPath();
                    ctx.arc(side > 0 ? sx + sw + off : sx - off, 50 + hash(q + 3) * (H - 90), 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                // The sensor with its films peeling or staying on.
                ctx.fillStyle = "#c8d0dc";
                ctx.fillRect(sx + 14, 40, sw - 28, H - 56);

                stack.slice().reverse().forEach(function (f, k) {

                    const peeled = st.peeled[f.ph.enzyme ? "enzyme" : f.mat] !== undefined;
                    const wd = 6;
                    const off = k * wd;

                    ctx.fillStyle = peeled ? "rgba(255,255,255,0.05)" : (COL[f.mat] || "#aaaaaa");
                    ctx.globalAlpha = peeled ? 1 : 0.55;
                    ctx.fillRect(sx + sw - 14 + off, 40, wd, H - 56);
                    ctx.globalAlpha = 1;

                    if (peeled && !seen[f.mat]) {

                        seen[f.mat] = 1;

                        for (let q = 0; q < 14; q++) { flakes.push({ x: sx + sw + off + wd / 2, y: 60 + q * 14, vx: 10 + hash(q) * 20, vy: -4 - hash(q + 3) * 6, a: 1, c: COL[f.mat] || "#aaa" }); }
                    }
                });

                if (u < 0.02) { Object.keys(seen).forEach(function (k) { delete seen[k]; }); }

                for (let q = flakes.length - 1; q >= 0; q--) {

                    const f = flakes[q];

                    f.x += f.vx * dt;
                    f.y += f.vy * dt;
                    f.a -= dt * 0.25;

                    ctx.fillStyle = f.c;
                    ctx.globalAlpha = Math.max(f.a, 0);
                    ctx.fillRect(f.x, f.y, 5, 3);
                    ctx.globalAlpha = 1;

                    if (f.a <= 0) { flakes.splice(q, 1); }
                }

                // Enzyme dots fade as it loses activity.
                for (let q = 0; q < 14; q++) {

                    if (hash(q + 77) > st.act) { continue; }

                    ctx.fillStyle = "#ffe070";
                    ctx.beginPath();
                    ctx.arc(sx + sw - 14 + 3, 54 + q * ((H - 90) / 14), 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Oxygen dots near the sensor: fewer when the tissue is short of oxygen.
                const nO = Math.round(26 * st.O2f);

                for (let q = 0; q < nO; q++) {

                    const ox = (sx - 90 + hash(q + 21) * (sw + 180));
                    const oy = 50 + ((hash(q + 61) * (H - 90) + t * 6) % (H - 90));

                    ctx.fillStyle = "rgba(106,168,255,0.7)";
                    ctx.beginPath();
                    ctx.arc(ox, oy, 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                text(ctx, "day " + sig(day, 2), 12, 20, "#e8edf8", 14);
                text(ctx, "capsule " + sig(st.capsule, 2) + " µm", 12, 38, "#f0a0c0", 10);
                text(ctx, "enzyme " + Math.round(st.act * 100) + "% active", Wd - 12, 20, "#ffe070", 10, "right");
                text(ctx, "oxygen " + Math.round(st.O2f * 100) + "%", Wd - 12, 36, "#6aa8ff", 10, "right");

                const ev = rep.events.filter(function (e) { return e.day <= day; });

                if (ev.length) { text(ctx, ev[ev.length - 1].text, Wd / 2, H - 8, "#e0a070", 10, "center"); }
            }
        });

        return box;
    }


    /* ------------------------------------------------
       A DAY OF READINGS
    ------------------------------------------------ */

    function day(r, devs) {

        const rep = r.reps[0];
        const dev = devs[0];

        if (!dev || !rep || !rep.ok || !rep.t) { return null; }

        const drops = [];

        const box = A.playbox({
            title: "A day on the arm",
            dur: 30, ratio: 0.5,
            series: [
                { x: rep.t, y: rep.meas, color: "#54e0c7", width: 2 },
                { x: rep.t, y: rep.blood, color: "#888888", dash: [5, 4], width: 1.4 },
                { x: [0, 24], y: [70, 70], color: "#e07070", dash: [4, 4], width: 1 }
            ],
            xLabel: "Hour of the day", yLabel: "Glucose (mg/dL)",
            caption: "Glucose in the blood vessel (red) crosses into the fluid between cells a few minutes later, where the sensor sits. The grey dashed line is the blood glucose, the teal line is what the sensor reports.",
            readout: function (i) { const h = rep.t[i]; return String(Math.floor(h)).padStart(2, "0") + ":" + String(Math.round((h % 1) * 60)).padStart(2, "0") + ": " + sig(rep.meas[i], 3) + " mg/dL"; },
            onInfo: function (where) { return where === "mech" ? "The reading trails the blood value because glucose takes a few minutes to cross into the tissue fluid." : "Drag along the curve to jump to a time of day."; },
            draw: function (ctx, u, t, dt, W, H) {

                const hr = u * 24;
                const gb = at(rep.blood, u);
                const gi = at(rep.isf, u);
                const gm = at(rep.meas, u);

                ctx.fillStyle = "#1b1f2f";
                ctx.fillRect(0, 0, W, H);

                // Skin layers.
                ctx.fillStyle = "rgba(240,190,150,0.25)";
                ctx.fillRect(0, 40, W, 28);
                ctx.fillStyle = "rgba(230,150,170,0.14)";
                ctx.fillRect(0, 68, W, H - 68);

                // A blood vessel along the bottom, with glucose in it.
                ctx.fillStyle = "rgba(190,40,60,0.7)";
                ctx.fillRect(20, H - 64, W - 40, 26);
                text(ctx, "blood vessel", 28, H - 46, "#ffd0d0", 10);

                const nb = Math.round(clamp(gb / 8, 4, 40));

                for (let q = 0; q < nb; q++) {

                    const x = 26 + ((hash(q * 7) * (W - 52) + t * 14 * (0.5 + hash(q))) % (W - 52));

                    ctx.fillStyle = GLU;
                    ctx.beginPath();
                    ctx.arc(x, H - 60 + hash(q + 40) * 18, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Glucose seeping out to the fluid around the sensor.
                if (Math.random() < dt * 6) { drops.push({ x: 60 + Math.random() * (W - 120), y: H - 64, a: 0 }); }

                const ni = Math.round(clamp(gi / 8, 4, 40));

                for (let q = 0; q < ni; q++) {

                    const x = 120 + hash(q * 5) * (W - 240) + Math.sin(t * 1.4 + q) * 6;
                    const y = 90 + hash(q + 11) * (H - 190) + Math.cos(t * 1.1 + q) * 5;

                    ctx.fillStyle = "rgba(255,179,71,0.75)";
                    ctx.beginPath();
                    ctx.arc(x, y, 2.8, 0, Math.PI * 2);
                    ctx.fill();
                }

                for (let q = drops.length - 1; q >= 0; q--) {

                    const d = drops[q];

                    d.a += dt * 0.35;
                    d.y -= 22 * dt;

                    ctx.fillStyle = "rgba(255,179,71," + (1 - d.a) + ")";
                    ctx.beginPath();
                    ctx.arc(d.x, d.y, 2.6, 0, Math.PI * 2);
                    ctx.fill();

                    if (d.a >= 1 || d.y < 80) { drops.splice(q, 1); }
                }

                // The sensor filament, going in through the skin.
                ctx.fillStyle = "#cbd2e3";
                ctx.fillRect(W / 2 - 4, 20, 8, H - 120);
                ctx.fillStyle = "#e8c06a";
                ctx.fillRect(W / 2 - 4, H - 150, 8, 28);
                text(ctx, "sensor", W / 2 + 12, H - 134, "#cbd2e3", 9);

                // The reader: a big number and a time.
                ctx.fillStyle = "#0e1220";
                ctx.fillRect(W - 128, 10, 118, 52);
                ctx.strokeStyle = "rgba(255,255,255,0.3)";
                ctx.strokeRect(W - 128, 10, 118, 52);
                text(ctx, isFinite(gm) ? String(Math.round(gm)) : "--", W - 104, 46, gm < 70 ? "#ff7a7a" : gm > 180 ? "#f2b84b" : "#54e0c7", 26, "center");
                text(ctx, "mg/dL", W - 54, 46, "#8791ab", 10);

                const h = Math.floor(hr);
                const m = Math.floor((hr % 1) * 60);

                text(ctx, String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"), 12, 22, "#e8edf8", 14);
                text(ctx, "blood " + sig(gb, 3) + " · tissue " + sig(gi, 3), 12, 36, "#8791ab", 10);
            }
        });

        return box;
    }


    /* ------------------------------------------------
       INSERTION
    ------------------------------------------------ */

    function insertion(r, devs) {

        const rep = r.reps.filter(function (x) { return x.ok && !x.noBody; })[0];

        if (!rep) { return null; }

        const box = A.playbox({
            title: "Putting the sensor in",
            dur: 16, ratio: 0.5,
            series: [{ x: rep.capsule.d, y: rep.capsule.t, color: "#f0a0c0", width: 2 }],
            xLabel: "Days under the skin", yLabel: "Capsule (µm)",
            caption: "A thin filament cannot push through skin on its own, so a needle carries it in and is withdrawn. Over the next days the body wraps the sensor in a capsule of scar tissue, which slows glucose and oxygen.",
            readout: function (i) { return "day " + sig(rep.capsule.d[i], 3) + ": " + sig(rep.capsule.t[i], 3) + " µm"; },
            onInfo: function (where) { return where === "mech" ? (rep.buckles ? "Without a needle this filament would crumple against the skin (margin " + sig(rep.margin) + ")." : "This filament is stiff enough to go in alone (margin " + sig(rep.margin) + ").") : "Drag along the curve to see the capsule grow."; },
            draw: function (ctx, u, t, dt, W, H) {

                ctx.fillStyle = "#1b1f2f";
                ctx.fillRect(0, 0, W, H);

                const skin = 110;

                ctx.fillStyle = "rgba(240,190,150,0.3)";
                ctx.fillRect(0, skin, W, 26);
                ctx.fillStyle = "rgba(230,150,170,0.16)";
                ctx.fillRect(0, skin + 26, W, H - skin - 26);

                const cx = W / 2;
                const phase = u < 0.3 ? u / 0.3 : 1;

                // Needle goes in, then comes out, while the filament stays.
                const needleDown = u < 0.3 ? phase : u < 0.45 ? 1 - (u - 0.3) / 0.15 : 0;
                const depth = 120;

                const filTop = 40 + (u < 0.3 ? phase * depth : depth);

                // Filament.
                ctx.strokeStyle = "#cbd2e3";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(cx, filTop - 70);
                ctx.lineTo(cx, filTop);
                ctx.stroke();

                ctx.fillStyle = "#e8c06a";
                ctx.fillRect(cx - 3, filTop - 22, 6, 18);

                // Needle: a hollow tube around it.
                if (needleDown > 0) {

                    ctx.strokeStyle = "rgba(200,210,230,0.85)";
                    ctx.lineWidth = 2;

                    const ny = filTop - 4;

                    ctx.strokeRect(cx - 9, ny - 80 - (1 - needleDown) * 40, 18, 84 + (1 - needleDown) * 40);
                    text(ctx, "introducer needle", cx + 16, ny - 40, "#cbd2e3", 10);
                }

                // The capsule grows after insertion.
                const dd = clamp((u - 0.45) / 0.55, 0, 1);
                const cap = at(rep.capsule.t, dd) / Math.max(rep.cap14, 1) * 34 * Math.min(1, rep.cap14 / 10 + 0.3);

                if (u > 0.45) {

                    ctx.fillStyle = "rgba(255,150,190," + (0.2 + 0.3 * dd) + ")";
                    ctx.fillRect(cx - 3 - cap, skin + 20, 6 + 2 * cap, depth - 40);

                    for (let q = 0; q < 18; q++) {

                        ctx.fillStyle = "rgba(255,190,215,0.7)";
                        ctx.beginPath();
                        ctx.arc(cx + (q % 2 ? 1 : -1) * (6 + hash(q) * cap), skin + 30 + hash(q + 20) * (depth - 60), 2.2, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    text(ctx, "day " + sig(dd * 14, 2) + ": capsule " + sig(at(rep.capsule.t, dd), 2) + " µm", W - 10, 20, "#f0a0c0", 11, "right");

                } else {

                    text(ctx, u < 0.3 ? "needle carries the filament in" : "needle is withdrawn", W - 10, 20, "#cbd2e3", 11, "right");
                }

                text(ctx, "skin", 10, skin + 16, "#e8c9a8", 10);
                text(ctx, "needle about " + sig(rep.needle, 3) + " µm wide", 10, H - 8, "#8791ab", 10);
            }
        });

        return box;
    }


    A.extra = A.extra || {};

    A.extra.cgm = function (r, devs) {

        const type = r.test.type;

        if (type === "cal") { return calibration(r, devs); }
        if (type === "o2") { return oxygen(r, devs); }
        if (type === "interf") { return interferents(r, devs); }
        if (type === "wear") { return wear(r, devs); }
        if (type === "cgm") { return day(r, devs); }
        if (type === "insert") { return insertion(r, devs); }

        return null;
    };

}(typeof window !== "undefined" ? window : globalThis));
