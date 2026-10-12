/* ========================================
   VIRTUAL FAB LAB: "INSIDE THE DEVICE" ANIMATIONS

   One animation per measurement, shown above the results on the test
   bench. Each one plays the measured data as a movie of what is happening
   inside the device: ions in a supercapacitor, carriers in a transistor,
   tracer crossing a cell barrier, spikes reaching a neural probe. The curve
   beside it has a playhead you can drag.

   LabAnim.insideBox(kind, result, devices) returns an element, or null.

   Needs lab-anim.js (window.LabAnim).
======================================== */

(function (root) {

    "use strict";

    const A = root.LabAnim;
    const U = A.util;

    const clamp = U.clamp;
    const lerp = U.lerp;
    const hash = U.hash;
    const text = U.text;
    const rrect = U.rrect;

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


    /* ------------------------------------------------
       SUPERCAPACITOR: IONS IN THE ELECTROLYTE
    ------------------------------------------------ */

    function supercap(r, devs) {

        const type = r.test.type;
        const rep = r.reps[0];
        const dev = devs[0];

        if (!dev || dev.status !== "ok" || (type !== "cv" && type !== "gcd" && type !== "eis")) { return null; }

        const N = 36;
        const ions = [];

        for (let i = 0; i < N * 2; i++) { ions.push({ cat: i % 2 === 1, x: 80 + hash(i) * 220, y: 70 + hash(i + 90) * 160, rank: hash(i + 200), vx: 0, vy: 0 }); }

        const speed = clamp(1 / (1 + (dev.esr || 5) / 15), 0.2, 1);
        const pseudo = (dev.fPseudo || 0) > 0.05;

        let series;
        let dur = 10;
        let info;
        let vop = dev.vMax || 1;

        if (type === "cv") {

            vop = rep.loop.vop || vop;
            series = [{ x: rep.loop.v, y: rep.loop.i.map(function (i) { return i * 1e6; }), color: "#54e0c7" }];
            info = "Cyclic voltammetry: the voltage ramps up and down. Ions move to the electrode surfaces as it rises and leave as it falls.";

        } else if (type === "gcd") {

            vop = rep.run.vop || vop;
            series = [{ x: rep.run.t, y: rep.run.v, color: "#54e0c7" }];
            info = "Charge and discharge: a fixed current pushes charge in, so the voltage climbs, then drains it out. Ions pile up and disperse.";

        } else {

            series = [{ x: rep.z.re, y: rep.z.im, color: "#54e0c7" }];
            dur = 14;
            info = "Impedance: a small AC signal at falling frequency. At high frequency ions barely move and only reach the surface. At low frequency they have time to travel deep into the pores.";
        }

        const box = A.playbox({
            title: "Inside the supercapacitor",
            dur: dur, series: series, ratio: 0.5, caption: info,
            xLabel: type === "cv" ? "Voltage (V)" : type === "gcd" ? "Time (s)" : "Z′ (Ω)", yLabel: type === "cv" ? "Current (µA)" : type === "gcd" ? "Voltage (V)" : "−Z″ (Ω)",
            readout: function (i) {

                if (type === "eis") { return sig(rep.z.f[i]) + " Hz"; }
                if (type === "cv") { return sig(rep.loop.v[i], 2) + " V"; }

                return sig(rep.run.v[i], 2) + " V";
            },
            onInfo: function (where) { return where === "mech" ? info : "Drag along the curve to jump to a moment in the measurement."; },
            draw: function (ctx, u, t, dt, W, H) {

                const n = series[0].x.length;
                const i = clamp(Math.round(u * (n - 1)), 0, n - 1);
                let vN;
                let cur;
                let freq = 0;

                if (type === "cv") { vN = clamp(rep.loop.v[i] / vop, 0, 1); cur = rep.loop.i[i]; }
                else if (type === "gcd") {

                    vN = clamp(rep.run.v[i] / vop, 0, 1);
                    cur = (rep.run.v[Math.min(i + 1, n - 1)] - rep.run.v[Math.max(i - 1, 0)]) >= 0 ? 1 : -1;

                } else {

                    vN = 0;
                    freq = rep.z.f[i];
                    cur = Math.sin(t * 6);
                }

                // The electrodes with a porous look.
                const ex0 = 50;
                const ex1 = 330;
                const ey0 = 80;
                const ey1 = 250;

                [[ex0 - 22, "#3a4560", "+"], [ex1, "#3a4560", "−"]].forEach(function (e) {

                    ctx.fillStyle = e[1];
                    rrect(ctx, e[0], ey0, 22, ey1 - ey0, 4);
                    ctx.fill();

                    ctx.fillStyle = "rgba(255,255,255,0.18)";

                    for (let k = 0; k < 34; k++) { ctx.fillRect(e[0] + 3 + hash(k + (e[2] === "+" ? 0 : 50)) * 16, ey0 + 4 + hash(k * 2 + 7) * (ey1 - ey0 - 8), 2.4, 2.4); }

                    text(ctx, e[2], e[0] + 11, ey0 - 6, "#e8edf8", 13, "center");
                });

                // Surface glow when the electrode stores charge by redox as well.
                if (pseudo && Math.abs(cur) > 0) {

                    ctx.fillStyle = "rgba(255,210,90," + clamp(Math.abs(type === "gcd" ? 0.35 : cur / Math.max(Math.abs(series[0].y[Math.floor(n / 2)] * 1e-6) * 2, 1e-12)), 0, 0.55) + ")";
                    ctx.fillRect(ex0, ey0, 3, ey1 - ey0);
                    ctx.fillRect(ex1 - 3, ey0, 3, ey1 - ey0);
                }

                // The electrolyte.
                ctx.fillStyle = "rgba(90,160,255,0.08)";
                ctx.fillRect(ex0, ey0, ex1 - ex0, ey1 - ey0);
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = "rgba(255,255,255,0.2)";
                ctx.beginPath();
                ctx.moveTo((ex0 + ex1) / 2, ey0);
                ctx.lineTo((ex0 + ex1) / 2, ey1);
                ctx.stroke();
                ctx.setLineDash([]);

                // Ions: the ones with the lowest rank move to the surface first, as many as the voltage allows.
                const frac = clamp(vN, 0, 1);
                const depth = type === "eis" ? clamp((5 - Math.log10(Math.max(freq, 0.01))) / 7.2, 0.08, 1) : 1;
                const amp = type === "eis" ? 38 * (1 - 0.7 * (1 - depth)) : 0;

                ions.forEach(function (io, k) {

                    let tx;
                    let ty;

                    if (type === "eis") {

                        // Ions sway back and forth; at low frequency they can go far, at high frequency only a little.
                        const sw = Math.sin(t * (1.2 + (1 - depth) * 5) + io.rank * 6.28) * amp * (0.4 + io.rank * 0.6) * depth;

                        tx = (io.cat ? ex1 - 14 - io.rank * 100 * depth : ex0 + 14 + io.rank * 100 * depth) + sw * (io.cat ? 1 : -1) * 0.35;
                        ty = io.y;

                    } else if (io.rank < frac * 0.9) {

                        // Adsorbed: sitting in a layer against the electrode.
                        const row = Math.floor(io.rank / 0.9 * N / 3);

                        tx = io.cat ? ex1 - 6 - (row % 3) * 7 : ex0 + 6 + (row % 3) * 7;
                        ty = ey0 + 8 + ((row * 17 + (io.cat ? 5 : 0)) % (ey1 - ey0 - 16));

                    } else {

                        tx = io.x + Math.sin(t * 0.8 + k) * 12;
                        ty = io.y + Math.cos(t * 0.7 + k * 1.3) * 10;
                    }

                    const k2 = clamp(dt * 5 * speed, 0, 1);

                    io.x += (tx - io.x) * k2;
                    io.y += (ty - io.y) * k2;

                    ctx.fillStyle = io.cat ? "#ff7a6b" : "#6aa8ff";
                    ctx.beginPath();
                    ctx.arc(io.x, io.y, 4.6, 0, Math.PI * 2);
                    ctx.fill();
                    text(ctx, io.cat ? "+" : "−", io.x, io.y + 3, "#101526", 8, "center");
                });

                // The wire and the power source above the cell.
                ctx.strokeStyle = "#9aa3bb";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(ex0 - 11, ey0);
                ctx.lineTo(ex0 - 11, 40);
                ctx.lineTo(ex1 + 11, 40);
                ctx.lineTo(ex1 + 11, ey0);
                ctx.stroke();

                rrect(ctx, 150, 28, 80, 24, 6);
                ctx.fillStyle = "#2b3350";
                ctx.fill();
                text(ctx, type === "eis" ? sig(freq) + " Hz AC" : sig(vN * vop, 2) + " V", 190, 44, "#e8edf8", 11, "center");

                // Electrons flow in the wire: the direction and speed follow the current.
                const flow = type === "eis" ? Math.sin(t * 6) : clamp(cur / Math.max(Math.max.apply(null, (type === "cv" ? rep.loop.i : [1]).map(Math.abs)), 1e-12), -1, 1);

                for (let q = 0; q < 6; q++) {

                    const s = ((t * 0.5 * flow + q / 6) % 1 + 1) % 1;
                    const px = lerp(ex0 - 11, ex1 + 11, s);

                    ctx.fillStyle = "rgba(255,223,112,0.9)";
                    ctx.beginPath();
                    ctx.arc(px, 40, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                text(ctx, "ion size and electrode pores decide how fast it responds", 10, H - 8, "#8791ab", 10);
            }
        });

        return box;
    }


    /* ------------------------------------------------
       TRANSISTOR: CARRIERS IN THE CHANNEL
    ------------------------------------------------ */

    function fet(r, devs) {

        const type = r.test.type;
        const rep = r.reps[0];
        const dev = devs[0];

        if (!dev || dev.status !== "ok" || !rep || (type !== "transfer" && type !== "output" && type !== "sense")) { return null; }

        const carriers = [];

        for (let i = 0; i < 46; i++) { carriers.push({ x: 110 + hash(i) * 170, y: 168 + hash(i + 40) * 14, ph: hash(i + 80) }); }

        const liquid = type === "sense" || (rep.t && rep.t.mode === "liquid");
        const p = r.test.params;
        const ions = [];

        for (let i = 0; i < 40; i++) { ions.push({ cat: i % 2 === 0, x: 60 + hash(i + 300) * 260, y: 60 + hash(i + 340) * 90 }); }

        let series;
        let info;
        let dur = 12;
        let xLabel;
        let yLabel;
        let xLog = false;
        let yLog = false;
        let readout;

        if (type === "transfer") {

            const vg = rep.t.vg;
            const id = rep.t.idF.map(function (v) { return Math.max(Math.abs(v), 1e-16); });

            series = [{ x: vg, y: id, color: "#54e0c7" }, { x: vg, y: rep.t.idB.map(function (v) { return Math.max(Math.abs(v), 1e-16); }), color: "#e0a070", dash: [5, 4], width: 1.4 }];
            xLabel = "Gate voltage (V)";
            yLabel = "|Drain current| (A)";
            yLog = true;
            info = "Transfer curve: as the gate voltage sweeps up, the electric field pulls more carriers into the channel and the current rises by orders of magnitude.";
            readout = function (i) { return sig(vg[i], 2) + " V, " + sig(id[i]) + " A"; };

        } else if (type === "output") {

            const o = rep.o;
            const top = o.curves[o.curves.length - 1];

            series = [{ x: o.vd, y: top.id.map(Math.abs), color: "#54e0c7" }];
            xLabel = "Drain voltage (V)";
            yLabel = "|Drain current| (A)";
            info = "Output curve: the drain voltage pushes carriers along the channel. At first the current rises in a straight line. Then the channel pinches off at the drain end and the current flattens.";
            readout = function (i) { return sig(o.vd[i], 2) + " V, " + sig(Math.abs(top.id[i])) + " A"; };

        } else {

            const s = rep.s;

            series = [{ x: s.x, y: s.dvt, color: "#54e0c7", dots: true }];
            xLabel = s.an.log ? "Concentration (" + s.an.unit + ")" : "pH";
            yLabel = "Threshold shift (mV)";
            xLog = !!s.an.log;
            info = "Sensing: analyte molecules bind to receptors on the channel. Their charge changes the surface potential and shifts the transfer curve, but only charges inside the Debye layer (shaded) are felt.";
            dur = 10;
            readout = function (i) { return sig(s.x[i]) + " " + (s.an.unit || "") + ": " + sig(s.dvt[i]) + " mV"; };
        }

        const imin = type === "transfer" ? Math.min.apply(null, series[0].y) : 0;
        const imax = type === "transfer" ? Math.max.apply(null, series[0].y) : Math.max.apply(null, series[0].y);

        const box = A.playbox({
            title: "Inside the transistor",
            dur: dur, series: series, ratio: 0.5, caption: info, xLabel: xLabel, yLabel: yLabel, xLog: xLog, yLog: yLog, readout: readout,
            onInfo: function (where) { return where === "mech" ? info : "Drag along the curve to jump to a moment in the measurement."; },
            draw: function (ctx, u, t, dt, W, H) {

                const n = series[0].x.length;
                const i = clamp(Math.round(u * (n - 1)), 0, n - 1);
                const y = series[0].y[i];

                let level;
                let vgN = 0;
                let drift = 1;
                let pinch = 0;

                if (type === "transfer") {

                    level = clamp((Math.log10(y) - Math.log10(imin)) / Math.max(Math.log10(imax) - Math.log10(imin), 1e-9), 0, 1);
                    vgN = clamp(series[0].x[i] / Math.max(Math.abs(series[0].x[0]), 1e-9), -1, 1) * (rep.t.vg[n - 1] > 0 ? 1 : -1);
                    drift = 0.4 + level;

                } else if (type === "output") {

                    level = 0.65;
                    drift = clamp(rep.o.vd[i] / Math.max(rep.o.vd[n - 1], 1e-9), 0.1, 1.2) * 1.4;
                    vgN = 0.7;

                    const a = Math.max(0, i - 2);
                    const sl = (series[0].y[i] - series[0].y[a]) / Math.max(rep.o.vd[i] - rep.o.vd[a], 1e-12);
                    const sl0 = (series[0].y[Math.min(4, n - 1)] - series[0].y[0]) / Math.max(rep.o.vd[Math.min(4, n - 1)] - rep.o.vd[0], 1e-12);

                    pinch = clamp(1 - sl / Math.max(sl0, 1e-12), 0, 1);

                } else {

                    level = 0.55;
                    vgN = 0.1;
                }

                // Source, channel, drain.
                const cy0 = 160;
                const ch = 26;

                ctx.fillStyle = "#59627a";
                ctx.fillRect(40, cy0 - 6, 70, ch + 12);
                ctx.fillRect(280, cy0 - 6, 70, ch + 12);
                text(ctx, "source", 75, cy0 + ch + 28, "#aab3c7", 10, "center");
                text(ctx, "drain", 315, cy0 + ch + 28, "#aab3c7", 10, "center");

                // The channel narrows toward the drain when it pinches off.
                ctx.fillStyle = "rgba(191,150,255," + (0.25 + level * 0.5) + ")";
                ctx.beginPath();
                ctx.moveTo(110, cy0);
                ctx.lineTo(280, cy0 + pinch * ch * 0.6);
                ctx.lineTo(280, cy0 + ch - pinch * ch * 0.6);
                ctx.lineTo(110, cy0 + ch);
                ctx.closePath();
                ctx.fill();

                // The carriers: as many as the current needs, moving left to right.
                const count = Math.round(4 + level * 40);

                carriers.forEach(function (c, k) {

                    if (k >= count) { return; }

                    c.x += dt * 50 * drift;

                    if (c.x > 280) { c.x = 110; c.y = cy0 + 3 + hash(k + t) * (ch - 6); }

                    const squeeze = pinch * (c.x - 110) / 170 * ch * 0.5;
                    const yy = clamp(c.y, cy0 + 3 + squeeze, cy0 + ch - 3 - squeeze);

                    ctx.fillStyle = "#ffd36a";
                    ctx.beginPath();
                    ctx.arc(c.x, yy, 3, 0, Math.PI * 2);
                    ctx.fill();
                });

                // The gate: a back gate under a dielectric, or the solution above with a reference electrode.
                if (!liquid) {

                    ctx.fillStyle = "#8aa4ff";
                    ctx.globalAlpha = 0.55;
                    ctx.fillRect(110, cy0 + ch + 2, 170, 10);
                    ctx.globalAlpha = 1;

                    ctx.fillStyle = vgN >= 0 ? "rgba(255,110,90," + (0.25 + Math.abs(vgN) * 0.7) + ")" : "rgba(90,140,255," + (0.25 + Math.abs(vgN) * 0.7) + ")";
                    ctx.fillRect(110, cy0 + ch + 14, 170, 14);
                    text(ctx, "gate " + sig(type === "transfer" ? series[0].x[i] : 0.7 * (rep.o ? rep.o.curves[rep.o.curves.length - 1].vg : 1), 1) + " V", 195, cy0 + ch + 40, "#cbd2e3", 10, "center");

                    // Field lines between the gate and the channel.
                    ctx.strokeStyle = "rgba(255,255,255,0.45)";

                    for (let q = 0; q < 6; q++) {

                        const x = 126 + q * 28;
                        const a = Math.abs(vgN);

                        ctx.beginPath();
                        ctx.moveTo(x, cy0 + ch + 14);
                        ctx.lineTo(x, cy0 + ch + 14 - (6 + 12 * a) * Math.sign(vgN || 1) * -1);
                        ctx.stroke();
                    }

                } else {

                    ctx.fillStyle = "rgba(90,160,255,0.12)";
                    ctx.fillRect(40, 50, 310, cy0 - 56);

                    // The reference electrode dipping in.
                    ctx.fillStyle = "#9aa3bb";
                    ctx.fillRect(194, 20, 6, 96);
                    text(ctx, "reference (gate)", 197, 14, "#aab3c7", 10, "center");

                    // Ions of the salt; those next to the channel form the Debye layer.
                    const lam = rep.s ? (rep.s.lam || 3) : (rep.t && rep.t.sol ? 3 : 3);
                    const dl = clamp(lam * 4, 6, 70);

                    ctx.fillStyle = "rgba(255,200,100,0.1)";
                    ctx.fillRect(110, cy0 - dl, 170, dl);
                    text(ctx, "shaded: Debye layer ≈ " + sig(lam, 1) + " nm", 195, cy0 + ch + 34, "#e0c080", 10, "center");

                    ions.forEach(function (io, k) {

                        let tx = io.x + Math.sin(t + k) * 8;
                        let ty = io.y + Math.cos(t * 0.8 + k) * 6;

                        if (vgN > 0.05 && io.cat) { ty = cy0 - 4 - hash(k) * dl * vgN; }
                        if (vgN < -0.05 && !io.cat) { ty = cy0 - 4 - hash(k) * dl * -vgN; }

                        io.x += (tx - io.x) * clamp(dt * 3, 0, 1);
                        io.y += (ty - io.y) * clamp(dt * 3, 0, 1);

                        ctx.fillStyle = io.cat ? "#ff7a6b" : "#6aa8ff";
                        ctx.beginPath();
                        ctx.arc(io.x, io.y, 3.4, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    // Receptors on the channel, and analyte binding as the concentration rises.
                    if (type === "sense") {

                        const maxS = Math.max.apply(null, series[0].y.map(Math.abs)) || 1;
                        const bound = clamp(Math.abs(series[0].y[i]) / maxS, 0, 1);
                        const screen = rep.s.screen !== undefined ? rep.s.screen : 1;

                        for (let q = 0; q < 10; q++) {

                            const x = 126 + q * 16;
                            const on = q / 10 < bound;

                            ctx.strokeStyle = "#8ee0b8";
                            ctx.lineWidth = 1.6;
                            ctx.beginPath();
                            ctx.moveTo(x, cy0);
                            ctx.lineTo(x, cy0 - 14);
                            ctx.moveTo(x - 4, cy0 - 20);
                            ctx.lineTo(x, cy0 - 14);
                            ctx.lineTo(x + 4, cy0 - 20);
                            ctx.stroke();

                            if (on) {

                                ctx.fillStyle = "#ffb347";
                                ctx.beginPath();
                                ctx.arc(x, cy0 - 24, 5, 0, Math.PI * 2);
                                ctx.fill();
                                text(ctx, "+", x, cy0 - 21, "#101526", 9, "center");
                            }
                        }

                        text(ctx, "charges felt: " + Math.round(screen * 100) + "% (the rest is screened by the salt)", 195, 62, screen < 0.5 ? "#ff9a9a" : "#7be0b0", 10, "center");
                    }
                }

                text(ctx, type === "transfer" && !liquid ? "the gate field pulls carriers into the channel" : type === "output" ? "the drain voltage drags them along" : "the surface charge controls the channel", 10, H - 8, "#8791ab", 10);
            }
        });

        return box;
    }


    /* ------------------------------------------------
       BLOOD-BRAIN BARRIER CHIP: CELLS, TRACER AND CURRENT
    ------------------------------------------------ */

    function bbb(r, devs) {

        const type = r.test.type;
        const rep = r.reps[0];
        const dev = devs[0];

        if (!dev || !rep || !rep.ok || ["teer", "papp", "flow", "challenge", "eis"].indexOf(type) < 0) { return null; }

        const tracers = [];

        for (let i = 0; i < 70; i++) { tracers.push({ x: 40 + hash(i) * 300, y: 56 + hash(i + 50) * 46, side: 0, vx: 20 + hash(i + 120) * 30 }); }

        const cellsN = 11;
        let series;
        let info;
        let dur = 12;
        let xLabel;
        let yLabel;
        let xLog = false;
        let yLog = false;
        let readout;

        if (type === "teer") {

            series = [{ x: rep.days, y: rep.teer, color: "#54e0c7" }, { x: rep.days, y: rep.truth, color: "#888888", dash: [4, 4], width: 1.2 }];
            xLabel = "Day in culture";
            yLabel = "TEER (Ω·cm²)";
            info = "Over the days the cells divide to cover the membrane, then their tight junctions close the gaps between them. Fewer gaps means less current can pass: TEER rises.";
            readout = function (i) { return "day " + rep.days[i] + ": " + sig(rep.teer[i]) + " Ω·cm²"; };

        } else if (type === "papp") {

            series = [{ x: rep.t, y: rep.c, color: "#54e0c7" }];
            xLabel = "Time (min)";
            yLabel = "Brain side (% of blood side)";
            info = "A tracer is added to the blood side. Watch how fast it leaks through the gaps between the cells into the brain-side channel.";
            readout = function (i) { return rep.t[i] + " min: " + sig(rep.c[i]) + " %"; };

        } else if (type === "flow") {

            series = [{ x: rep.q, y: rep.tau, color: "#54e0c7" }];
            xLabel = "Flow (µL/min)";
            yLabel = "Shear stress (dyn/cm²)";
            xLog = true;
            yLog = true;
            info = "Flow drags on the cell layer. Shear stress tightens brain endothelium around 4 to 20 dyn/cm², and above about 40 it peels the cells off.";
            readout = function (i) { return sig(rep.q[i]) + " µL/min: " + sig(rep.tau[i]) + " dyn/cm²"; };

        } else if (type === "challenge") {

            series = [{ x: rep.h, y: rep.teer, color: "#54e0c7" }];
            xLabel = "Hours";
            yLabel = "TEER (Ω·cm²)";
            info = "A challenge loosens the tight junctions: the gaps between cells open and TEER falls. Then the cells recover, or they do not.";
            readout = function (i) { return rep.h[i] + " h: " + sig(rep.teer[i]) + " Ω·cm²"; };

        } else {

            series = [{ x: rep.re, y: rep.im, color: "#54e0c7" }];
            xLabel = "Z′ (Ω)";
            yLabel = "−Z″ (Ω)";
            dur = 14;
            info = "Impedance: at low frequency current must go through the gaps between cells. At high frequency it flows straight through the cell membranes, which act as capacitors.";
            readout = function (i) { return sig(rep.f[i]) + " Hz"; };
        }

        const baseTeer = type === "challenge" ? Math.max(rep.base || rep.teer[0], 1) : 1;

        const box = A.playbox({
            title: "Inside the barrier chip",
            dur: dur, series: series, ratio: 0.5, caption: info, xLabel: xLabel, yLabel: yLabel, xLog: xLog, yLog: yLog, readout: readout,
            onInfo: function (where) { return where === "mech" ? info : "Drag along the curve to jump to a moment in the measurement."; },
            draw: function (ctx, u, t, dt, W, H) {

                const n = series[0].x.length;
                const i = clamp(Math.round(u * (n - 1)), 0, n - 1);
                let cover = 1;
                let gap = 4;
                let flow = 0.5;
                let shear = 0;
                let freq = 0;
                let cross = 0;

                if (type === "teer") {

                    const d = rep.days[i];
                    const teer = rep.truth[i];

                    cover = clamp(1 - Math.exp(-d / 2.2), 0, 1);
                    gap = clamp(14 / (1 + teer / 40), 1, 14);
                    cross = 1 / (1 + teer / 80);

                } else if (type === "papp") {

                    gap = clamp(14 / (1 + (rep.teer || 40) / 40), 1, 14);
                    cross = clamp(rep.c[i] / 100, 0, 1);
                    flow = 0.4 + (rep.qB || 0) * 0.04;

                } else if (type === "flow") {

                    flow = clamp(Math.log10(rep.q[i] / 0.1) / 3.5, 0.05, 1.3);
                    shear = rep.tau[i];
                    gap = 4;
                    cover = shear > 40 ? 0.7 : 1;

                } else if (type === "challenge") {

                    const frac = clamp(rep.teer[i] / baseTeer, 0.02, 1.2);

                    gap = clamp(2 + (1 - frac) * 14, 1, 16);
                    cross = clamp(1 - frac, 0.05, 1);

                } else {

                    freq = rep.f[i];
                    gap = 4;
                    cross = 0.5;
                }

                const apT = 52;
                const memY = 120;
                const baT = 134;

                // Channels.
                ctx.fillStyle = "rgba(90,160,255,0.10)";
                ctx.fillRect(30, apT, 320, memY - apT - 6);
                ctx.fillRect(30, baT, 320, 72);
                text(ctx, "blood side channel", 36, apT + 12, "#8fb2e0", 10);
                text(ctx, "brain side channel", 36, baT + 14, "#8fb2e0", 10);

                // The membrane with pores.
                ctx.fillStyle = "#8a93aa";
                ctx.fillRect(30, memY - 2, 320, 8);
                ctx.fillStyle = "#1c2132";

                for (let k = 0; k < 40; k++) { ctx.fillRect(34 + k * 8, memY - 1, 3, 6); }

                // The cell layer: rounded cells with gaps between them that close as junctions form.
                const cw = 300 / cellsN;

                for (let c = 0; c < cellsN; c++) {

                    const present = hash(c * 3.1) < cover || cover >= 0.999;

                    if (!present) { continue; }

                    const x = 40 + c * cw;

                    ctx.fillStyle = shear > 40 && hash(c * 5) > 0.5 ? "rgba(255,120,120,0.5)" : "#e0a8c0";
                    rrect(ctx, x + gap / 2, memY - 20, cw - gap, 18, 6);
                    ctx.fill();

                    ctx.fillStyle = "#8a4e6c";
                    ctx.beginPath();
                    ctx.arc(x + cw / 2, memY - 11, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Shear: arrows along the cell layer, coloured by how hard it pulls.
                if (type === "flow") {

                    const col = shear > 40 ? "255,110,110" : shear >= 4 ? "100,224,160" : "140,170,230";

                    for (let q = 0; q < 9; q++) {

                        const x = 40 + ((q / 9 + t * 0.15 * flow) % 1) * 300;

                        ctx.strokeStyle = "rgba(" + col + ",0.9)";
                        ctx.lineWidth = 1 + Math.min(shear, 40) / 14;
                        ctx.beginPath();
                        ctx.moveTo(x, memY - 28);
                        ctx.lineTo(x + 18 * flow + 6, memY - 28);
                        ctx.stroke();
                    }

                    text(ctx, shear >= 4 && shear <= 20 ? "in the healthy range: cells tighten" : shear > 40 ? "too much: cells peel off" : "too little: cells feel almost nothing", 190, apT + 28, "#e8edf8", 10, "center");
                }

                // Flowing liquid specks in both channels.
                for (let q = 0; q < 14; q++) {

                    const x = 30 + ((q / 14 + t * 0.12 * flow) % 1) * 320;

                    ctx.fillStyle = "rgba(170,210,255,0.5)";
                    ctx.fillRect(x, apT + 18 + (q % 4) * 9, 2.2, 2.2);
                    ctx.fillRect(x, baT + 24 + (q % 4) * 12, 2.2, 2.2);
                }

                // Tracer molecules: they cross through the gaps, more of them as the barrier leaks.
                if (type === "papp") {

                    tracers.forEach(function (tr, k) {

                        if (tr.side === 0) {

                            tr.x += dt * tr.vx * (0.4 + flow);

                            if (tr.x > 350) { tr.x = 40; }

                            // Cross at a gap with a chance that grows with the leak.
                            if (hash(k + Math.floor(t * 2)) < cross * 0.02 && tr.y > 86) { tr.side = 1; tr.y = memY; tr.x = 40 + Math.floor(hash(k) * cellsN) * cw + cw; }

                            tr.y = clamp(tr.y + Math.sin(t * 2 + k) * 0.2, 56, 100);

                        } else {

                            tr.y += dt * 24;

                            if (tr.y > baT + 62) { tr.y = baT + 62; tr.x += dt * 10; }
                            if (tr.x > 350) { tr.side = 0; tr.y = 60; tr.x = 40; }
                        }

                        ctx.fillStyle = "#7be0b0";
                        ctx.beginPath();
                        ctx.arc(tr.x, tr.y, 2.6, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    text(ctx, "tracer found on the brain side: " + sig(rep.c[i]) + " %", 190, H - 28, "#7be0b0", 11, "center");
                }

                // The electrodes and the current between them.
                if (type === "teer" || type === "eis" || type === "challenge") {

                    ctx.fillStyle = "#e8c06a";
                    ctx.fillRect(60, apT - 10, 260, 5);
                    ctx.fillRect(60, baT + 76, 260, 5);
                    text(ctx, "electrode A", 330, apT - 4, "#aab3c7", 9);
                    text(ctx, "electrode B", 330, baT + 84, "#aab3c7", 9);

                    const lines = 14;

                    ctx.lineWidth = 1.4;

                    for (let q = 0; q < lines; q++) {

                        const x = 70 + q * (240 / (lines - 1));

                        // At high frequency the current goes through the cells themselves; otherwise it must find a gap.
                        const through = type === "eis" ? freq > 3000 || (freq > 300 && hash(q) < (Math.log10(freq) - 2.5) / 1) : false;
                        const cellIdx = clamp(Math.floor((x - 40) / cw), 0, cellsN - 1);
                        const gx = 40 + cellIdx * cw + (hash(cellIdx + 3) > 0.5 ? cw - gap / 2 : gap / 2);
                        const pass = through || hash(q * 1.7 + 0.3) < cross;

                        if (!pass) {

                            // The line stops at the cells.
                            ctx.strokeStyle = "rgba(255,223,112,0.18)";
                            ctx.beginPath();
                            ctx.moveTo(x, apT - 5);
                            ctx.lineTo(x, memY - 22);
                            ctx.stroke();

                            continue;
                        }

                        const ph = ((t * 0.8 + q * 0.13) % 1);

                        ctx.strokeStyle = "rgba(255,223,112,0.75)";
                        ctx.setLineDash([4, 4]);
                        ctx.lineDashOffset = -t * 30;
                        ctx.beginPath();
                        ctx.moveTo(x, apT - 5);

                        if (through) { ctx.lineTo(x, baT + 76); }
                        else { ctx.lineTo(x, memY - 24); ctx.lineTo(gx, memY - 14); ctx.lineTo(gx, memY + 8); ctx.lineTo(x, memY + 14); ctx.lineTo(x, baT + 76); }

                        ctx.stroke();
                        ctx.setLineDash([]);
                        ctx.lineDashOffset = 0;
                        void ph;
                    }

                    if (type === "eis") { text(ctx, sig(freq) + " Hz: current " + (freq > 3000 ? "goes straight through the cells" : freq > 300 ? "starts to cut through the cells" : "squeezes through the gaps"), 190, H - 28, "#e8edf8", 10, "center"); }
                    if (type === "teer") { text(ctx, "cells cover " + Math.round(cover * 100) + "% of the membrane, gaps " + sig(gap, 1) + " px wide", 190, H - 28, "#e8edf8", 10, "center"); }
                    if (type === "challenge") { text(ctx, (rep.agent || "") === "triton" ? "the cells are being dissolved" : "the junctions are opening: " + Math.round(cross * 100) + "% of the current leaks across", 190, H - 28, "#e8edf8", 10, "center"); }
                }
            }
        });

        return box;
    }


    /* ------------------------------------------------
       NEURAL PROBE: NEURONS, MOLECULES, TISSUE
    ------------------------------------------------ */

    function neuronShape(ctx, x, y, glow) {

        ctx.fillStyle = glow > 0.05 ? "rgba(255,230,140," + (0.5 + glow * 0.5) + ")" : "rgba(160,120,200,0.8)";
        ctx.strokeStyle = glow > 0.05 ? "rgba(255,230,140,0.7)" : "rgba(160,120,200,0.5)";
        ctx.lineWidth = 2;

        for (let k = 0; k < 4; k++) {

            const a = k * 1.6 + 0.5;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14, x + Math.cos(a + 0.3) * 28, y + Math.sin(a + 0.3) * 28);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    function neural(r, devs) {

        const type = r.test.type;
        const rep = r.reps[0];
        const dev = devs[0];

        if (!dev || !rep || !rep.ok) { return null; }

        // ---- spikes reaching the probe
        if (type === "rec" && rep.tr) {

            const tr = rep.tr;
            const dist = clamp(rep.dist || 40, 10, 140);
            const nPos = [[1, -0.55], [0.8, 0.35], [1.2, 0.8]];
            const hits = tr.det.map(function (ms, k) { return { ms: ms, n: Math.floor(hash(k * 3.7 + 1) * 3) }; });
            const rings = [];
            let lastU = 0;

            const box = A.playbox({
                title: "Inside the tissue",
                dur: 14, series: [{ x: tr.t, y: tr.v, color: "#54e0c7", width: 1.4 }, { x: [tr.t[0], tr.t[tr.t.length - 1]], y: [-tr.thr, -tr.thr], color: "#e07070", dash: [5, 4], width: 1.2 }],
                ratio: 0.5, caption: "Three neurons fire near the probe. Each spike spreads out and weakens with distance, then reaches the recording sites as a tiny voltage. Dragging the playhead along the trace replays the spikes.",
                xLabel: "Time (ms)", yLabel: "Voltage (µV)", readout: function (i) { return sig(tr.t[i]) + " ms, " + sig(tr.v[i]) + " µV"; },
                onInfo: function (where) { return where === "mech" ? "Neurons sit in tissue around the probe. Farther away means a smaller, noisier signal." : "Drag along the trace to jump."; },
                draw: function (ctx, u, t, dt, W, H) {

                    ctx.fillStyle = "rgba(120,80,150,0.08)";
                    ctx.fillRect(0, 0, W, H);

                    for (let q = 0; q < 70; q++) { ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(hash(q) * W, hash(q + 80) * H, 3, 3); }

                    // The probe, with four recording sites.
                    ctx.fillStyle = "#9aa3bb";
                    ctx.fillRect(40, 20, 16, H - 40);

                    for (let k = 0; k < 4; k++) { ctx.fillStyle = "#e8c06a"; ctx.beginPath(); ctx.arc(48, 70 + k * 46, 4.5, 0, Math.PI * 2); ctx.fill(); }

                    text(ctx, "probe", 48, 14, "#aab3c7", 10, "center");

                    // Neurons at a distance in proportion to the chosen distance.
                    const scale = 1.4;
                    const msNow = u * 200;
                    const pos = nPos.map(function (q) { return [48 + dist * scale * q[0] + 24, 70 + (q[1] + 0.55) * 120]; });

                    // Fire neurons at the detected spike times.
                    hits.forEach(function (hit) {

                        if (lastU * 200 <= hit.ms && msNow >= hit.ms || (u < lastU && hit.ms <= msNow)) { rings.push({ n: hit.n, t0: t }); }
                    });

                    lastU = u;

                    pos.forEach(function (p, k) {

                        let glow = 0;

                        rings.forEach(function (rg) { if (rg.n === k) { glow = Math.max(glow, clamp(1 - (t - rg.t0) * 3, 0, 1)); } });

                        neuronShape(ctx, p[0], p[1], glow);
                    });

                    for (let q = rings.length - 1; q >= 0; q--) {

                        const rg = rings[q];
                        const age = t - rg.t0;

                        if (age > 1.4) { rings.splice(q, 1); continue; }

                        const p = pos[rg.n];

                        ctx.strokeStyle = "rgba(255,230,140," + (1 - age / 1.4) * 0.7 + ")";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(p[0], p[1], 10 + age * 120, 0, Math.PI * 2);
                        ctx.stroke();
                    }

                    text(ctx, "neurons about " + sig(dist, 0) + " µm from the probe", 10, H - 8, "#8791ab", 10);
                }
            });

            return box;
        }

        // ---- dopamine at the electrode
        if (type === "da" && rep.ch && rep.ch.length) {

            let best = rep.ch[0];

            rep.ch.forEach(function (c) { if (c.slope > best.slope) { best = c; } });

            const chan = (dev.ch || []).filter(function (c) { return c.d === best.d; })[0];
            const nafion = !!(chan && chan.coats && chan.coats.some(function (c) { return c.mat === "nafion"; }));
            const mol = [];
            const asc = [];

            for (let i = 0; i < 70; i++) { mol.push({ x: 40 + hash(i) * 300, y: 60 + hash(i + 70) * 120, ox: 0 }); }
            for (let i = 0; i < 18; i++) { asc.push({ x: 40 + hash(i + 300) * 300, y: 50 + hash(i + 360) * 130 }); }

            const rel = best.rel;
            const sparks = [];

            const box = A.playbox({
                title: "Inside the dopamine sensor (channel " + best.d + ")",
                dur: 12, series: [{ x: rel.t, y: rel.meas, color: "#54e0c7", width: 1.6 }, { x: rel.t, y: rel.true_, color: "#888888", dash: [5, 4], width: 1.4 }],
                ratio: 0.5, caption: "Dopamine is released and then cleared. Molecules that touch the electrode give up electrons, and that tiny current is the signal. The grey dashed line is the truth, the teal line is what the sensor reports.",
                xLabel: "Time (s)", yLabel: "Dopamine (µM)", readout: function (i) { return sig(rel.t[i], 1) + " s: " + sig(rel.meas[i]) + " µM measured"; },
                onInfo: function (where) { return where === "mech" ? (nafion ? "A Nafion film is negatively charged, so it repels ascorbate (blue) while dopamine passes through." : "With no Nafion, ascorbate (blue) reaches the electrode too and adds to the signal.") : "Drag along the curve to jump."; },
                draw: function (ctx, u, t, dt, W, H) {

                    const conc = at(rel.true_, u);
                    const show = Math.round(clamp(conc / 0.8, 0, 1.2) * 60);

                    // The electrode at the bottom, with a Nafion layer on it if there is one.
                    ctx.fillStyle = "#e8c06a";
                    ctx.fillRect(30, H - 56, 320, 14);
                    text(ctx, "electrode", 190, H - 28, "#aab3c7", 10, "center");

                    if (nafion) { ctx.fillStyle = "rgba(90,200,140,0.5)"; ctx.fillRect(30, H - 76, 320, 20); text(ctx, "Nafion", 60, H - 62, "#c8f0d8", 10); }

                    const top = H - (nafion ? 76 : 56);

                    mol.forEach(function (m, k) {

                        if (k >= show) { return; }

                        m.y += (top - 4 - m.y) * dt * 0.5 * (m.ox ? 0 : 1);
                        m.x += Math.sin(t * 2 + k) * 0.3;

                        if (!m.ox && m.y > top - 8) { m.ox = 1; sparks.push({ x: m.x, y: top, a: 0 }); }
                        if (m.ox) { m.ox -= dt * 0.6; if (m.ox <= 0) { m.ox = 0; m.y = 50 + hash(k + t) * 100; m.x = 40 + hash(k * 2 + t) * 300; } }

                        ctx.fillStyle = m.ox ? "#ff6b6b" : "#ffa347";
                        ctx.beginPath();
                        ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    // Ascorbate: repelled by Nafion, but it oxidises on a bare electrode.
                    asc.forEach(function (a, k) {

                        const toward = nafion ? 0.02 : 0.25;

                        a.y += ((top - 4) - a.y) * dt * toward + Math.sin(t + k) * 0.2;

                        if (a.y > top - 6) { a.y = 50 + hash(k + t) * 100; if (!nafion) { sparks.push({ x: a.x, y: top, a: 0 }); } }

                        ctx.fillStyle = "#6aa8ff";
                        ctx.beginPath();
                        ctx.arc(a.x, a.y, 3.2, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    for (let q = sparks.length - 1; q >= 0; q--) {

                        const s = sparks[q];

                        s.a += dt * 2;
                        ctx.fillStyle = "rgba(255,223,112," + (1 - s.a) + ")";
                        ctx.beginPath();
                        ctx.arc(s.x, s.y + s.a * 20, 3, 0, Math.PI * 2);
                        ctx.fill();

                        if (s.a >= 1) { sparks.splice(q, 1); }
                    }

                    text(ctx, "orange: dopamine · red: just oxidised · blue: ascorbate", 10, H - 8, "#8791ab", 10);
                    text(ctx, "release at 1 s, then uptake clears it", 200, 22, "#cbd2e3", 11, "center");
                }
            });

            return box;
        }

        // ---- glutamate with an enzyme site and a sentinel
        if (type === "glu" && rep.ch && rep.ch.length) {

            const c = rep.ch[0];
            const levels = [[100, 5], [200, 10], [300, 20], [400, 50]];
            const gl = [];
            const aa = [];

            for (let i = 0; i < 60; i++) { gl.push({ x: 50 + hash(i) * 290, y: 50 + hash(i + 60) * 110, st: 0 }); }
            for (let i = 0; i < 16; i++) { aa.push({ x: 50 + hash(i + 200) * 290, y: 50 + hash(i + 260) * 110 }); }

            const sparks = [];

            const series = [{ x: rep.t, y: c.raw, color: "#54e0c7", width: 1.4 }];

            if (c.hasSentinel) { series.push({ x: rep.t, y: c.sen, color: "#888888", dash: [5, 4], width: 1.2 }); series.push({ x: rep.t, y: c.sub, color: "#f2b84b", width: 2.2 }); }

            const box = A.playbox({
                title: "Inside the glutamate sensor",
                dur: 14, series: series, ratio: 0.5,
                caption: "Left: platinum with an enzyme layer. Right: a bare platinum sentinel. Glutamate is added in steps. The enzyme turns it into hydrogen peroxide, which the platinum oxidises. At 500 s ascorbate is added, which oxidises on both.",
                xLabel: "Time (s)", yLabel: "Current (nA)", readout: function (i) { return sig(rep.t[i], 0) + " s"; },
                onInfo: function (where) { return where === "mech" ? "The sentinel has no enzyme, so it sees the ascorbate but not the glutamate. The yellow curve is the enzyme site minus the sentinel." : "Drag along the curve to jump."; },
                draw: function (ctx, u, t, dt, W, H) {

                    const sec = u * 600;
                    let level = 0;

                    levels.forEach(function (l) { if (sec >= l[0]) { level = l[1]; } });

                    const nG = Math.round(clamp(level / 50, 0, 1) * 55) + (level > 0 ? 4 : 0);
                    const ascOn = sec >= 500;

                    // Two electrodes.
                    const topY = H - 54;

                    ctx.fillStyle = "#d8dce6";
                    ctx.fillRect(40, topY, 140, 12);
                    ctx.fillRect(210, topY, 140, 12);
                    ctx.fillStyle = "rgba(190,110,230,0.75)";
                    ctx.fillRect(40, topY - 16, 140, 16);
                    text(ctx, "enzyme", 110, topY - 4, "#101526", 10, "center");
                    text(ctx, "Pt + enzyme layer", 110, H - 24, "#aab3c7", 10, "center");
                    text(ctx, "bare Pt (sentinel)", 280, H - 24, "#aab3c7", 10, "center");

                    gl.forEach(function (g, k) {

                        if (k >= nG) { return; }

                        const onEnz = g.x < 180;

                        if (!g.st) { g.y += (topY - 24 - g.y) * dt * 0.35; g.x += Math.sin(t + k) * 0.3; }

                        if (!g.st && onEnz && g.y > topY - 30) { g.st = 1; }
                        if (!g.st && !onEnz && g.y > topY - 12) { g.y = 50 + hash(k + t) * 90; }

                        if (g.st) {

                            // Converted to hydrogen peroxide, then oxidised at the platinum.
                            g.y += ((topY - 3) - g.y) * dt * 1.4;

                            if (g.y > topY - 6) { sparks.push({ x: g.x, y: topY, a: 0 }); g.st = 0; g.y = 50 + hash(k * 3 + t) * 90; g.x = 50 + hash(k + t * 2) * 130; }
                        }

                        ctx.fillStyle = g.st ? "#ff6b6b" : "#7be0b0";
                        ctx.beginPath();
                        ctx.arc(g.x, g.y, g.st ? 3 : 4, 0, Math.PI * 2);
                        ctx.fill();
                    });

                    if (ascOn) {

                        aa.forEach(function (a, k) {

                            a.y += ((topY - 4) - a.y) * dt * 0.5;

                            if (a.y > topY - 6) { a.y = 50 + hash(k + t) * 90; sparks.push({ x: a.x, y: topY, a: 0 }); }

                            ctx.fillStyle = "#6aa8ff";
                            ctx.beginPath();
                            ctx.arc(a.x, a.y, 3.4, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    }

                    for (let q = sparks.length - 1; q >= 0; q--) {

                        const s = sparks[q];

                        s.a += dt * 2;
                        ctx.fillStyle = "rgba(255,223,112," + (1 - s.a) + ")";
                        ctx.beginPath();
                        ctx.arc(s.x, s.y + s.a * 20, 3, 0, Math.PI * 2);
                        ctx.fill();

                        if (s.a >= 1) { sparks.splice(q, 1); }
                    }

                    text(ctx, ascOn ? "ascorbate (blue) added: it oxidises on both electrodes" : level ? "glutamate " + level + " µM (green)" : "buffer only", 190, 22, ascOn ? "#8fb2ff" : "#7be0b0", 12, "center");
                }
            });

            return box;
        }

        // ---- pushing the probe into tissue
        if (type === "insert" && rep.sub !== undefined && !rep.noBody) {

            const bendMax = rep.buckles ? 1 : 0;

            const box = A.playbox({
                title: "Inside the tissue: pushing the probe in",
                dur: 12, series: [{ x: rep.scar.w, y: rep.scar.t, color: "#54e0c7" }], ratio: 0.5,
                caption: "The probe is pressed against the brain. A thin, flexible probe can buckle before it breaks the surface. Once in, the tissue reacts to its size and stiffness and builds a scar around it.",
                xLabel: "Weeks in the brain", yLabel: "Scar thickness (µm)",
                readout: function (i) { return rep.scar.w[i] + " weeks: " + sig(rep.scar.t[i], 0) + " µm"; },
                onInfo: function (where) { return where === "mech" ? "Margin " + sig(rep.margin) + ": the buckling load divided by the force needed to enter the brain." : "Drag along the curve to see the scar grow."; },
                draw: function (ctx, u, t, dt, W, H) {

                    const surface = 150;

                    ctx.fillStyle = "rgba(160,110,160,0.35)";
                    ctx.fillRect(0, surface, W, H - surface);

                    for (let q = 0; q < 50; q++) { ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(hash(q) * W, surface + hash(q + 60) * (H - surface), 3, 3); }

                    // First half: pushing in. Second half: the scar grows.
                    const push = clamp(u / 0.5, 0, 1);
                    const weeks = clamp((u - 0.5) / 0.5, 0, 1);
                    const force = push * 1.5 * rep.fIns;
                    const press = clamp(force / rep.fIns, 0, 1);

                    const px = 190;
                    const lenFree = 120;

                    let tipY = 20 + push * 100;
                    let bow = 0;

                    if (rep.buckles) {

                        // The probe bows sideways once the load passes its buckling limit, and never gets in.
                        const over = clamp((force - rep.pcr) / Math.max(rep.pcr, 1e-9), 0, 3);

                        bow = clamp(over * 14 + Math.sin(t * 3) * 1.5 * (over > 0 ? 1 : 0), 0, 38);
                        tipY = surface - lenFree + (lenFree - 6) * clamp(push, 0, 0.55) + 0;
                        tipY = Math.min(tipY, surface - 6);
                    }

                    const wPx = clamp(rep.sub.w / 40, 6, 18);

                    ctx.strokeStyle = "#9aa3bb";
                    ctx.lineWidth = wPx;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.moveTo(px, 10);

                    if (rep.buckles) { ctx.quadraticCurveTo(px + bow * 2, (10 + tipY) / 2, px, tipY); }
                    else { ctx.lineTo(px, Math.min(tipY + (press >= 1 ? 40 * (push - 0.5) * 2 : 0), surface + 90)); }

                    ctx.stroke();
                    ctx.lineCap = "butt";

                    // The scar around the shank once it is in.
                    if (!rep.buckles && press >= 1) {

                        const scar = at(rep.scar.t, weeks);
                        const sx = clamp(scar / 3, 0, 28);

                        ctx.fillStyle = "rgba(255,150,120,0.35)";
                        ctx.fillRect(px - wPx / 2 - sx, surface, wPx + sx * 2, 90);
                        text(ctx, "scar " + sig(scar, 0) + " µm", px + 40, surface + 60, "#ffb09a", 11);
                    }

                    ctx.fillStyle = rep.buckles && press > 0.5 ? "#ff9a9a" : "#cbd2e3";
                    text(ctx, rep.buckles ? (force > rep.pcr ? "buckling! it bends instead of going in" : "pushing…") : (press >= 1 ? "it goes in" : "pushing…"), 190, H - 28, rep.buckles && force > rep.pcr ? "#ff9a9a" : "#cbd2e3", 12, "center");
                    text(ctx, "force " + sig(force, 2) + " mN · enters at " + sig(rep.fIns, 2) + " mN · buckles at " + sig(rep.pcr, 3) + " mN", 190, H - 10, "#8791ab", 10, "center");
                    void bendMax;
                }
            });

            return box;
        }

        // ---- a month in saline
        if (type === "soak" && rep.ch && rep.ch.length) {

            let pick = rep.ch[0];

            rep.ch.forEach(function (c) { if (c.firstFail !== null && (pick.firstFail === null || c.firstFail < pick.firstFail)) { pick = c; } });

            const flakes = [];

            const box = A.playbox({
                title: "Inside the soak test (channel " + pick.d + ")",
                dur: 14, series: [{ x: rep.days, y: pick.z, color: "#54e0c7" }], ratio: 0.5, yLog: true,
                caption: "Days in warm saline. Water slowly gets under the films. A coating can peel off, insulation can lift and expose the trace, and a base-metal trace can corrode through.",
                xLabel: "Days", yLabel: "|Z| at 1 kHz (Ω)", readout: function (i) { return "day " + rep.days[i] + ": " + sig(pick.z[i]) + " Ω"; },
                onInfo: function (where) { return where === "mech" ? "State at day 28: " + (pick.state === "ok" ? "stable" : pick.state) + "." : "Drag along the curve to jump."; },
                draw: function (ctx, u, t, dt, W, H) {

                    const day = u * 28;
                    const fail = pick.firstFail;
                    const failed = fail !== null && day >= fail;

                    // The probe surface and one electrode site, drawn large.
                    ctx.fillStyle = "rgba(90,160,255,0.12)";
                    ctx.fillRect(0, 0, W, 170);

                    ctx.fillStyle = "#6c7590";
                    ctx.fillRect(40, 170, 300, 90);

                    // Insulation with a window over the site.
                    const lifted = failed && pick.state.indexOf("insulation") >= 0;
                    const lift = lifted ? clamp((day - fail) / 4, 0, 1) * 22 : 0;

                    ctx.fillStyle = "#8aa4ff";
                    ctx.fillRect(40, 160 - lift, 120, 10);
                    ctx.fillRect(220, 160 - lift, 120, 10);

                    // The metal trace and site.
                    const corroded = failed && pick.state.indexOf("corroded") >= 0;

                    ctx.fillStyle = corroded ? "#4a3a30" : "#e8c06a";
                    ctx.fillRect(40, 170, 300, 7);

                    if (corroded) { ctx.fillStyle = "#1c2132"; ctx.fillRect(180 - 8, 170, 16, 7); text(ctx, "trace corroded open", 190, 200, "#e0a070", 11, "center"); }

                    // The coating on the site.
                    const peeled = failed && pick.state.indexOf("coating") >= 0;

                    if (!peeled) {

                        ctx.fillStyle = "rgba(190,110,230,0.8)";
                        rrect(ctx, 160, 140, 60, 30, 8);
                        ctx.fill();
                        text(ctx, "coating", 190, 158, "#101526", 10, "center");

                    } else {

                        if (Math.random() < dt * 8 && flakes.length < 40) { flakes.push({ x: 160 + Math.random() * 60, y: 150, vy: 10 + Math.random() * 20, vx: (Math.random() - 0.5) * 30 }); }

                        text(ctx, "coating peeled off", 190, 200, "#e0a070", 11, "center");
                    }

                    for (let q = flakes.length - 1; q >= 0; q--) {

                        const f = flakes[q];

                        f.x += f.vx * dt;
                        f.y -= f.vy * dt;
                        ctx.fillStyle = "rgba(190,110,230,0.7)";
                        ctx.fillRect(f.x, f.y, 5, 3);

                        if (f.y < 20) { flakes.splice(q, 1); }
                    }

                    // Water creeping in from the edges as days go by.
                    ctx.strokeStyle = "rgba(120,190,255,0.5)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(40, 166);
                    ctx.lineTo(40 + (day / 28) * 120, 166);
                    ctx.moveTo(340, 166);
                    ctx.lineTo(340 - (day / 28) * 120, 166);
                    ctx.stroke();

                    text(ctx, "day " + day.toFixed(0), 190, 28, "#e8edf8", 14, "center");
                    text(ctx, failed ? "first change on day " + fail : "so far so good", 190, 48, failed ? "#e0a070" : "#7be0b0", 11, "center");
                    text(ctx, "warm saline", 10, 14, "#8fb2e0", 10);
                }
            });

            return box;
        }

        return null;
    }


    /* ------------------------------------------------
       DISPATCH
    ------------------------------------------------ */

    function insideBox(kind, r, devs) {

        try {

            let b = null;

            if (kind === "supercap") { b = supercap(r, devs); }
            else if (kind === "fet" || kind === "biofet") { b = fet(r, devs); }
            else if (kind === "bbb") { b = bbb(r, devs); }
            else if (kind === "neural") { b = neural(r, devs); }
            else if (A.extra && A.extra[kind]) { b = A.extra[kind](r, devs); }

            return b ? b.box : null;

        } catch (e) { if (root.console) { root.console.warn("Animation skipped:", e); } return null; }
    }

    A.insideBox = insideBox;

}(typeof window !== "undefined" ? window : globalThis));
