/* ========================================
   VIRTUAL FAB LAB: MEMS ANIMATIONS

   "Inside the device" movies for the accelerometer, gyroscope and
   micromirror kinds. They draw your actual layout: the proof mass, fingers
   and springs moving through each resonance, the gaps opening and closing
   under acceleration, the Coriolis motion of a gyroscope, and a mirror
   tilting, snapping down and ringing. Registered as LabAnim.extra.accel,
   .gyro and .mirror and called from LabAnim.insideBox.

   Needs lab-anim.js, lab-anim-kinds.js and lab-mems-model.js.
======================================== */

(function (root) {

    "use strict";

    const A = root.LabAnim;
    const U = A.util;
    const M = root.LabMems;

    const clamp = U.clamp;
    const lerp = U.lerp;
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

    const UM = 1e-6;


    /* ------------------------------------------------
       DRAWING THE LAYOUT
    ------------------------------------------------ */

    function viewOf(dev, W, H) {

        let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;

        dev.mems.pieces.forEach(function (p) {

            if (p.role !== "structure") { return; }

            const poly = p.poly || [p.p1, p.p2];

            poly.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
        });

        const w = Math.max(x1 - x0, 1);
        const h = Math.max(y1 - y0, 1);
        const s = Math.min((W - 24) / w, (H - 40) / h);

        return { s: s, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, W: W, H: H, ox: W / 2, oy: H / 2 + 6 };
    }

    // Draw every structural piece. Pieces that ride on the proof mass are moved by (dx, dy) micrometres and a rotation th (radians) about the mass reference.
    function drawLayout(ctx, dev, view, mn, move, colors) {

        const fr = M.frameOf(dev);
        const ref = mn ? mn.ref : [0, 0];
        const cos = Math.cos(move.th || 0);
        const sin = Math.sin(move.th || 0);

        const pt = function (q, moving) {

            let x = q[0];
            let y = q[1];

            if (moving) {

                const px = x - ref[0];
                const py = y - ref[1];

                x = ref[0] + px * cos - py * sin + move.dx;
                y = ref[1] + px * sin + py * cos + move.dy;
            }

            return [view.ox + (x - view.cx) * view.s, view.oy - (y - view.cy) * view.s];
        };

        const nets = dev.mems.nets;

        const springs = {};

        fr.elems.forEach(function (e) { springs[e.piece.id] = e; });

        dev.mems.pieces.forEach(function (p) {

            if (p.role !== "structure") { return; }

            const c = fr.pieceCluster[p.id];
            const moving = !!(c && mn && (c.node || c) === mn);
            const spring = springs[p.id];

            let col = colors.fixed;

            if (moving) { col = colors.mass; }
            else if (p.net === nets.A) { col = colors.a; }
            else if (p.net === nets.B) { col = colors.b; }
            else if (p.net === nets.D) { col = colors.a; }
            else if (p.net === nets.S) { col = colors.b; }

            if (spring) { col = colors.spring; }

            ctx.fillStyle = col;
            ctx.strokeStyle = col;

            if (p.type === "beam") {

                let a = pt(p.p1, moving);
                let b = pt(p.p2, moving);

                if (spring) {

                    // A spring runs from where it is fixed to where it meets the mass, which has moved.
                    const e = spring;
                    const n0 = e.nodes[0];
                    const n1 = e.nodes[1];

                    a = pt(p.p1, !n0.fixed && n0 === mn);
                    b = pt(p.p2, !n1.fixed && n1 === mn);
                }

                ctx.lineWidth = Math.max(1, p.w * view.s);
                ctx.beginPath();
                ctx.moveTo(a[0], a[1]);
                ctx.lineTo(b[0], b[1]);
                ctx.stroke();

            } else {

                ctx.beginPath();

                p.poly.forEach(function (q, k) { const r = pt(q, moving); if (k === 0) { ctx.moveTo(r[0], r[1]); } else { ctx.lineTo(r[0], r[1]); } });

                ctx.closePath();
                ctx.fill();
            }
        });
    }

    const COLORS = { fixed: "#56607a", mass: "#54e0c7", a: "#6aa8ff", b: "#ffb347", spring: "#f2b84b" };

    function setup(dev) {

        const fr = M.frameOf(dev);
        const mn = M.mainNode(dev);

        return { fr: fr, mn: mn };
    }

    function nodeShape(m, mn) {

        const o = mn.index * 6;

        return [m.phi[o], m.phi[o + 1], m.phi[o + 2], m.phi[o + 3], m.phi[o + 4], m.phi[o + 5]];
    }


    /* ------------------------------------------------
       ACCELEROMETER
    ------------------------------------------------ */

    function accel(r, devs) {

        const type = r.test.type;
        const ix = Math.max(0, r.reps.findIndex(function (x) { return x && x.ok; }));
        const rep = r.reps[ix];
        const dev = devs[ix];

        if (!dev || !rep || !rep.ok || (type !== "modes" && type !== "sens" && type !== "band")) { return null; }

        const S0 = setup(dev);
        const mn = S0.mn;

        if (!mn) { return null; }

        const acc = M.accelSetup(dev);
        const axis = acc.axis;

        let series;
        let dur = 16;
        let info;
        let xLog = false;
        let xLabel;
        let yLabel;
        let readout;

        if (type === "modes") {

            const modes = rep.modes.slice(0, 6);

            series = [{ x: modes.map(function (m, k) { return k; }).concat([modes.length - 0.01]), y: modes.map(function (m) { return m.f / 1000; }).concat([modes[modes.length - 1].f / 1000]), color: "#54e0c7", width: 2 }];
            info = "Each resonance in turn, with the motion exaggerated. The teal parts move; the blue and orange comb fingers and the grey anchors stay fixed. The sense mode moves the mass along the sense axis, where the gaps open and close.";
            xLabel = "Mode number";
            yLabel = "Frequency (kHz)";
            dur = 28;

            readout = function (i) { return "mode " + (Math.min(i, modes.length - 1) + 1) + ": " + sig(modes[Math.min(i, modes.length - 1)].f / 1000, 3) + " kHz"; };

            const box = A.playbox({
                title: "Inside the accelerometer: its resonances",
                dur: dur, series: series, ratio: 0.5, caption: info, xLabel: xLabel, yLabel: yLabel,
                readout: function (i) { return readout(Math.floor(i / (series[0].x.length - 1) * (modes.length - 0.001))); },
                onInfo: function (where) { return where === "mech" ? "The sense mode is the one that moves the mass along the sense axis. A mode that moves the mass out of the page changes the gaps too, so shake in that direction leaks into the reading." : "Drag along the line to jump to a mode."; },
                draw: function (ctx, u, t, dt, W, H) {

                    const idx = clamp(Math.floor(u * modes.length), 0, modes.length - 1);
                    const m = modes[idx];
                    const view = viewOf(dev, W, H);
                    const sh = nodeShape(m, mn);
                    const R = 120 * UM;

                    const peak = Math.max(Math.abs(sh[0]), Math.abs(sh[1]), Math.abs(sh[5]) * R, Math.abs(sh[2]) * 0.6, Math.abs(sh[3]) * R, Math.abs(sh[4]) * R, 1e-30);
                    const ph = Math.sin(t * 5.5);
                    const unit = (14 / view.s) / (peak / UM) * ph;                        // drawing micrometres per micrometre of true motion

                    ctx.fillStyle = "#1b2030";
                    ctx.fillRect(0, 0, W, H);

                    drawLayout(ctx, dev, view, mn, { dx: sh[0] / UM * unit, dy: sh[1] / UM * unit, th: sh[5] * unit }, COLORS);

                    // Out-of-plane motion: shown as the mass brightening and dimming.
                    const z = (Math.abs(sh[2]) + Math.abs(sh[3]) * R + Math.abs(sh[4]) * R) / peak;

                    if (z > 0.25) {

                        ctx.fillStyle = "rgba(255,255,255," + 0.14 * Math.abs(ph) * z + ")";
                        ctx.fillRect(0, 0, W, H);
                        text(ctx, "moves up and down (out of the page)", W / 2, H - 10, "#cbd2e3", 10, "center");
                    }

                    text(ctx, "mode " + (idx + 1) + " · " + sig(m.f / 1000, 3) + " kHz", 10, 18, "#e8edf8", 12);
                    text(ctx, m.name, 10, 34, "#9fb2c8", 10);
                }
            });

            return box;
        }

        if (type === "sens") {

            series = [{ x: rep.g, y: rep.dC, color: "#54e0c7", width: 2 }];

            const box = A.playbox({
                title: "Inside the accelerometer: shaking it",
                dur: 18, series: series, ratio: 0.5,
                caption: "The mass lags behind when the package accelerates, so the comb gaps change. Fingers on one side close up while the other side opens, and the difference in capacitance is the signal. The motion here is exaggerated thousands of times.",
                xLabel: "Acceleration (g)", yLabel: "Capacitance change (aF)",
                readout: function (i) { return sig(rep.g[i], 3) + " g: " + sig(rep.dC[i], 3) + " aF"; },
                onInfo: function (where) { return where === "mech" ? "Blue and orange fixed fingers sense the teal moving mass. The bars show the two capacitances." : "Drag along the curve to change the acceleration."; },
                draw: function (ctx, u, t, dt, W, H) {

                    const g = at(rep.g, u);
                    const x = at(rep.x, u) / 1000;                                        // micrometres, real
                    const view = viewOf(dev, W, H);
                    const xmax = Math.max.apply(null, rep.x.map(Math.abs)) / 1000 || 1e-6;
                    const ex = (12 / view.s) / xmax;                                     // exaggeration so the largest motion is about 12 pixels

                    ctx.fillStyle = "#1b2030";
                    ctx.fillRect(0, 0, W, H);

                    drawLayout(ctx, dev, view, mn, { dx: axis === 0 ? x * ex : 0, dy: axis === 1 ? x * ex : 0, th: 0 }, COLORS);

                    // How the two capacitances changed, as a centred bar.
                    const cc = acc.caps(axis === 0 ? x : 0, axis === 1 ? x : 0, 0);
                    const c0 = acc.c0;
                    const dA = (cc.A - c0.A) * 1e18;
                    const dB = (cc.B - c0.B) * 1e18;
                    const dm = Math.max.apply(null, rep.dC.map(Math.abs)) || 1;

                    [["A", dA, COLORS.a, 72], ["B", dB, COLORS.b, 88]].forEach(function (row) {

                        ctx.fillStyle = "rgba(255,255,255,0.08)";
                        ctx.fillRect(34, row[3], 80, 9);
                        ctx.fillStyle = row[2];
                        ctx.fillRect(74, row[3], 40 * clamp(row[1] / dm, -1, 1), 9);
                        text(ctx, "C" + row[0], 30, row[3] + 8, row[2], 10, "right");
                    });

                    text(ctx, "change in each capacitance", 10, 66, "#8791ab", 9);

                    text(ctx, sig(g, 3) + " g", 10, 18, "#e8edf8", 14);
                    text(ctx, "mass moves " + sig(x * 1000, 2) + " nm", 10, 34, "#9fb2c8", 10);
                    text(ctx, "ΔC = " + sig((cc.A - cc.B - (c0.A - c0.B)) * 1e18, 3) + " aF", 10, 50, "#54e0c7", 11);

                    // The direction of the push.
                    if (Math.abs(g) > 0.01) {

                        const dirx = axis === 0 ? Math.sign(g) : 0;
                        const diry = axis === 1 ? Math.sign(g) : 0;

                        ctx.strokeStyle = "#ffdf70";
                        ctx.fillStyle = "#ffdf70";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(W - 30, 40);
                        ctx.lineTo(W - 30 + dirx * 24, 40 - diry * 24);
                        ctx.stroke();
                        text(ctx, "push", W - 30, 20, "#ffdf70", 10, "center");
                    }
                }
            });

            return box;
        }

        // band: frequency response
        const fresp = rep.f;
        const mag = rep.mag;

        series = [{ x: fresp, y: mag, color: "#54e0c7", width: 2 }];

        const box = A.playbox({
            title: "Inside the accelerometer: shaking at different frequencies",
            dur: 20, series: series, ratio: 0.5, xLog: true,
            caption: "Shaken slowly the mass follows the package. Near the resonance it swings far more than the shake itself, and well above it the mass stays still while the package moves. Air under the mass damps the peak. The motion is exaggerated.",
            xLabel: "Frequency (Hz)", yLabel: "Response (dB)",
            readout: function (i) { return sig(fresp[i], 3) + " Hz: " + sig(mag[i], 3) + " dB"; },
            onInfo: function (where) { return where === "mech" ? "Q is " + sig(rep.Q, 3) + ": the higher it is, the taller the peak." : "Drag along the curve to pick a frequency."; },
            draw: function (ctx, u, t, dt, W, H) {

                const i = clamp(Math.round(u * (fresp.length - 1)), 0, fresp.length - 1);
                const amp = Math.pow(10, mag[i] / 20);
                const view = viewOf(dev, W, H);
                const ph = Math.sin(t * 6);
                const pk = Math.min(amp, 6);

                ctx.fillStyle = "#1b2030";
                ctx.fillRect(0, 0, W, H);

                drawLayout(ctx, dev, view, mn, { dx: axis === 0 ? ph * pk * 1.5 : 0, dy: axis === 1 ? ph * pk * 1.5 : 0, th: 0 }, COLORS);

                text(ctx, sig(fresp[i], 3) + " Hz", 10, 18, "#e8edf8", 14);
                text(ctx, "response " + sig(mag[i], 3) + " dB", 10, 34, amp > 1.2 ? "#f2b84b" : "#9fb2c8", 11);
                text(ctx, "resonance " + sig(rep.f0 / 1000, 3) + " kHz", 10, 50, "#8791ab", 10);
            }
        });

        return box;
    }


    /* ------------------------------------------------
       GYROSCOPE
    ------------------------------------------------ */

    function gyro(r, devs) {

        const type = r.test.type;
        const ix = Math.max(0, r.reps.findIndex(function (x) { return x && x.ok; }));
        const rep = r.reps[ix];
        const dev = devs[ix];

        if (!dev || !rep || !rep.ok || (type !== "modes" && type !== "drive" && type !== "rate")) { return null; }

        const S0 = setup(dev);
        const mn = S0.mn;

        if (!mn) { return null; }

        if (type === "modes") {

            const modes = rep.modes.slice(0, 6);

            const series = [{ x: modes.map(function (m, k) { return k; }).concat([modes.length - 0.01]), y: modes.map(function (m) { return m.f / 1000; }).concat([modes[modes.length - 1].f / 1000]), color: "#54e0c7", width: 2 }];

            return A.playbox({
                title: "Inside the gyroscope: its resonances",
                dur: 28, series: series, ratio: 0.5,
                caption: "The drive mode swings the mass along x; the sense mode lets it swing along y. The two should be almost the same frequency. Teal is the moving mass and its comb fingers, blue is the fixed drive comb and orange the fixed sense comb. Motion is exaggerated.",
                xLabel: "Mode number", yLabel: "Frequency (kHz)",
                readout: function (i) { const k = Math.min(modes.length - 1, Math.floor(i / (series[0].x.length - 1) * (modes.length - 0.001))); return "mode " + (k + 1) + ": " + sig(modes[k].f / 1000, 3) + " kHz"; },
                onInfo: function (where) { return where === "mech" ? "Drive mode " + sig(rep.drive.f / 1000, 3) + " kHz, sense mode " + sig(rep.sense.f / 1000, 3) + " kHz: " + sig(Math.abs(rep.split), 3) + " % apart." : "Drag along the line to jump to a mode."; },
                draw: function (ctx, u, t, dt, W, H) {

                    const idx = clamp(Math.floor(u * modes.length), 0, modes.length - 1);
                    const m = modes[idx];
                    const view = viewOf(dev, W, H);
                    const sh = nodeShape(m, mn);
                    const R = 60 * UM;
                    const peak = Math.max(Math.abs(sh[0]), Math.abs(sh[1]), Math.abs(sh[5]) * R, Math.abs(sh[2]) * 0.6, Math.abs(sh[3]) * R, Math.abs(sh[4]) * R, 1e-30);
                    const ph = Math.sin(t * 5.5);
                    const unit = (12 / view.s) / (peak / UM) * ph;

                    ctx.fillStyle = "#1b2030";
                    ctx.fillRect(0, 0, W, H);

                    drawLayout(ctx, dev, view, mn, { dx: sh[0] / UM * unit, dy: sh[1] / UM * unit, th: sh[5] * unit }, COLORS);

                    text(ctx, "mode " + (idx + 1) + " · " + sig(m.f / 1000, 3) + " kHz", 10, 18, "#e8edf8", 12);
                    text(ctx, m.name, 10, 34, "#9fb2c8", 10);
                }
            });
        }

        if (type === "drive") {

            const g = M.gyroSetup(dev);

            return A.playbox({
                title: "Inside the gyroscope: the comb drive",
                dur: 18, series: [{ x: rep.f, y: rep.amp, color: "#54e0c7", width: 2 }], ratio: 0.5,
                caption: "An AC voltage on the drive comb pulls the mass along the fingers back and forth. Right at the resonance the swing is Q times larger. Slow-motion, with the amplitude exaggerated.",
                xLabel: "Drive frequency (Hz)", yLabel: "Amplitude (µm)",
                readout: function (i) { return sig(rep.f[i], 4) + " Hz: " + sig(rep.amp[i], 3) + " µm"; },
                onInfo: function (where) { return where === "mech" ? "The mass swings " + sig(rep.peak, 2) + " µm at resonance. The finger overlap along x is " + sig(rep.overlap, 3) + " µm." : "Drag along the curve to pick a frequency."; },
                draw: function (ctx, u, t, dt, W, H) {

                    const i = clamp(Math.round(u * (rep.f.length - 1)), 0, rep.f.length - 1);
                    const amp = rep.amp[i];
                    const view = viewOf(dev, W, H);
                    const ph = Math.sin(t * 6);
                    const ex = 14 / Math.max(rep.peak, 0.05);

                    ctx.fillStyle = "#1b2030";
                    ctx.fillRect(0, 0, W, H);

                    drawLayout(ctx, dev, view, mn, { dx: amp * ph * ex * 0.4, dy: 0, th: 0 }, COLORS);

                    text(ctx, sig(rep.f[i], 4) + " Hz", 10, 18, "#e8edf8", 14);
                    text(ctx, "amplitude " + sig(amp, 3) + " µm", 10, 34, amp > 0.5 * rep.peak ? "#54e0c7" : "#9fb2c8", 11);
                    text(ctx, "resonance " + sig(rep.fd, 4) + " Hz", 10, 50, "#8791ab", 10);
                }
            });
        }

        // rate: Coriolis response
        const g = M.gyroSetup(dev);

        return A.playbox({
            title: "Inside the gyroscope: the Coriolis signal",
            dur: 20, series: [{ x: rep.rates, y: rep.y, color: "#54e0c7", width: 2 }], ratio: 0.5,
            caption: "The mass is kept swinging along x. Turn the sensor and the Coriolis force pushes the swinging mass sideways, along y, in step with its speed. The sense comb measures that small sideways motion. Motion and the turn are exaggerated.",
            xLabel: "Rotation rate (°/s)", yLabel: "Sense motion (nm)",
            readout: function (i) { return sig(rep.rates[i], 3) + " °/s: " + sig(rep.y[i], 3) + " nm"; },
            onInfo: function (where) { return where === "mech" ? "The sense motion per °/s is " + sig(Math.abs(rep.sY), 3) + " nm. It is bigger when the sense mode sits closer to the drive frequency (now " + sig(Math.abs(rep.splitTuned), 3) + " % apart)." : "Drag along the curve to change the rotation rate."; },
            draw: function (ctx, u, t, dt, W, H) {

                const rate = at(rep.rates, u);
                const ysense = at(rep.y, u) / 1000;                                 // um real
                const view = viewOf(dev, W, H);
                const ph = Math.sin(t * 6);
                const ex = 14 / Math.max(rep.amp, 0.05);
                const ey = 14 / Math.max(Math.abs(rep.y[rep.y.length - 1]) / 1000, 1e-6);

                ctx.fillStyle = "#1b2030";
                ctx.fillRect(0, 0, W, H);

                // Rotation of the whole device, shown as a slow spin of the picture.
                ctx.save();
                ctx.translate(W / 2, H / 2 + 6);
                ctx.rotate(rate / (Math.max(Math.abs(rep.rates[0]), 1)) * 0.12 * Math.sin(t * 0.8));
                ctx.translate(-W / 2, -(H / 2 + 6));

                drawLayout(ctx, dev, view, mn, { dx: rep.amp * ph * ex * 0.4, dy: ysense * Math.cos(t * 6) * ey * 0.6, th: 0 }, COLORS);

                ctx.restore();

                text(ctx, sig(rate, 3) + " °/s", 10, 18, "#e8edf8", 14);
                text(ctx, "sense motion " + sig(ysense * 1000, 3) + " nm", 10, 34, "#54e0c7", 11);

                // A curved arrow for the rotation.
                if (Math.abs(rate) > 0.01) {

                    const dir = Math.sign(rate);

                    ctx.strokeStyle = "#ffdf70";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(W - 36, 36, 16, 0.3, 4.4 * (dir > 0 ? 1 : 0.7), dir < 0);
                    ctx.stroke();
                    text(ctx, "spin", W - 36, 66, "#ffdf70", 10, "center");
                }
            }
        });
    }


    /* ------------------------------------------------
       MICROMIRROR
    ------------------------------------------------ */

    // Side view of the mirror at tilt th (degrees): electrodes under it, the hinge post and the plate.
    function drawMirror(ctx, M0, W, H, th, volts, landDeg, landed) {

        const cx = W / 2;
        const baseY = H - 46;
        const half = 150;
        const plateW = 2 * half;
        const gap = 44;                                                    // drawn gap, exaggerated

        ctx.fillStyle = "#1b2030";
        ctx.fillRect(0, 0, W, H);

        // Substrate and electrodes.
        ctx.fillStyle = "#3a4258";
        ctx.fillRect(0, baseY + 8, W, 38);
        text(ctx, "substrate", 10, baseY + 34, "#8791ab", 10);

        const lit = Math.min(1, volts / 100);

        ctx.fillStyle = "rgba(106,168,255," + (0.35 + 0.65 * lit) + ")";
        ctx.fillRect(cx - half + 6, baseY, half - 12, 8);
        ctx.fillStyle = "rgba(255,179,71,0.5)";
        ctx.fillRect(cx + 6, baseY, half - 12, 8);
        text(ctx, "electrode A" + (volts > 0 ? " · " + sig(volts, 3) + " V" : ""), cx - half / 2, baseY + 24, "#cfe0ff", 10, "center");
        text(ctx, "B", cx + half / 2, baseY + 24, "#ffd9a8", 10, "center");

        // The hinge post.
        ctx.fillStyle = "#56607a";
        ctx.fillRect(cx - 5, baseY - gap, 10, gap);

        // The plate, rotated about the hinge axis. Positive tilt lowers the A side (left).
        const a = th * (Math.PI / 180) * 5.5;                              // exaggerated
        ctx.save();
        ctx.translate(cx, baseY - gap);
        ctx.rotate(-a);
        ctx.fillStyle = "#e8c06a";
        ctx.fillRect(-half, -7, plateW, 7);
        ctx.fillStyle = "#54e0c7";
        ctx.fillRect(-half, 0, plateW, 5);

        // Landing tips.
        ctx.fillStyle = "#cbd2e3";
        ctx.fillRect(-half + 14, 5, 5, 8);
        ctx.fillRect(half - 19, 5, 5, 8);
        ctx.restore();

        // Light: an incoming ray and the reflected one, bent by twice the tilt.
        const phi = 35 * Math.PI / 180;
        const px = cx;
        const py = baseY - gap - 3;
        const nx = -Math.sin(a);
        const ny = -Math.cos(a);
        const dx = Math.sin(phi);
        const dy = Math.cos(phi);
        const dot = dx * nx + dy * ny;
        const rx = dx - 2 * dot * nx;
        const ry = dy - 2 * dot * ny;

        ctx.strokeStyle = "rgba(255,240,150,0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - dx * 130, py - dy * 130);
        ctx.lineTo(px, py);
        ctx.lineTo(px + rx * 130, py + ry * 130);
        ctx.stroke();

        text(ctx, "tilt " + sig(th, 3) + "°" + (landed ? " (landed)" : ""), W - 10, 18, landed ? "#7be0b0" : "#e8edf8", 12, "right");
        text(ctx, "landing at " + sig(landDeg, 3) + "°", W - 10, 34, "#8791ab", 10, "right");
    }

    function mirror(r, devs) {

        const type = r.test.type;
        const ix = Math.max(0, r.reps.findIndex(function (x) { return x && x.ok; }));
        const rep = r.reps[ix];
        const dev = devs[ix];

        if (!dev || !rep || !rep.ok || (type !== "tilt" && type !== "switch")) { return null; }

        const M0 = M.mirrorSetup(dev);

        if (type === "tilt") {

            const up = rep.thUp;
            const landDeg = rep.landDeg;

            return A.playbox({
                title: "Inside the micromirror: tilting it",
                dur: 18, series: [{ x: rep.vUp, y: rep.thUp, color: "#54e0c7", width: 2.2 }].concat(rep.vDn.length ? [{ x: rep.vDn, y: rep.thDn, color: "#f2b84b", width: 1.8, dash: [5, 4] }] : []), ratio: 0.5,
                caption: "The voltage on electrode A pulls the left half of the mirror down against the hinge. Slowly at first, then, once the pull wins, it snaps all the way down to its landing tips. The tilt is exaggerated; the light is turned by twice the mirror's tilt.",
                xLabel: "Voltage on A (V)", yLabel: "Tilt (°)",
                readout: function (i) { return sig(rep.vUp[i], 3) + " V: " + sig(rep.thUp[i], 3) + "°"; },
                onInfo: function (where) { return where === "mech" ? (rep.vPi ? "The mirror snaps down at " + sig(rep.vPi, 3) + " V and lets go at " + sig(rep.vRel, 3) + " V." : "The mirror does not reach its stop below this voltage.") : "Drag along the curve to raise the voltage."; },
                draw: function (ctx, u, t, dt, W, H) {

                    const i = clamp(Math.round(u * (rep.vUp.length - 1)), 0, rep.vUp.length - 1);
                    const th = up[i];

                    drawMirror(ctx, M0, W, H, th, rep.vUp[i], landDeg, th >= landDeg * 0.995);
                }
            });
        }

        // switching
        const tOn = rep.t;
        const lastT = tOn[tOn.length - 1];

        const x = tOn.concat(rep.thOff.length ? rep.t.map(function (v) { return v + lastT; }) : []);
        const y = rep.thOn.concat(rep.thOff);
        const volt = x.map(function (v, i) { return i < tOn.length ? rep.v : 0; });

        return A.playbox({
            title: "Inside the micromirror: switching",
            dur: 16, series: [{ x: x, y: y, color: "#54e0c7", width: 2.2 }, { x: [lastT, lastT], y: [0, rep.landDeg], color: "rgba(255,255,255,0.4)", dash: [4, 4], width: 1 }], ratio: 0.5,
            caption: "A voltage step swings the mirror into its landing stop and it rings briefly. After the voltage is removed the hinge spring has to pull it off the stop. Time is stretched so you can watch it.",
            xLabel: "Time (µs)", yLabel: "Tilt (°)",
            readout: function (i) { return sig(x[i], 3) + " µs: " + sig(y[i], 3) + "°"; },
            onInfo: function (where) { return where === "mech" ? "The mirror lands in " + (rep.tOn === null ? "never" : sig(rep.tOn, 3) + " µs") + "." : "Drag along the curve to step through time."; },
            draw: function (ctx, u, t, dt, W, H) {

                const i = clamp(Math.round(u * (x.length - 1)), 0, x.length - 1);

                drawMirror(ctx, M0, W, H, y[i], volt[i], rep.landDeg, y[i] >= rep.landDeg * 0.995);
            }
        });
    }


    A.extra = A.extra || {};
    A.extra.accel = accel;
    A.extra.gyro = gyro;
    A.extra.mirror = mirror;

}(typeof window !== "undefined" ? window : globalThis));
