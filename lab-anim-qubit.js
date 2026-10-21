/* ========================================
   QUANTUM FOUNDRY: "INSIDE THE CHIP" ANIMATIONS

   One slow movie per test, each tied to the measured curve on the right:
     probe    needles on a junction and the resistance meter
     res      a microwave tone sweeping along the feedline; each resonator
              lights up and swallows the signal at its frequency
     spec     the qubit's energy ladder: the drive climbs it only at f01
     rabi     the Bloch vector turning about the x axis
     t1       an excited qubit leaking its energy into its loss channels
     ramsey   arrows on the equator fanning out as the phase is lost
   Registered as LabAnim.extra.qubit and called from LabAnim.insideBox.

   Needs lab-anim.js and lab-qubit-model.js.
======================================== */

(function (root) {

    "use strict";

    const A = root.LabAnim;

    if (!A) { return; }

    const U = A.util;
    const clamp = U.clamp;
    const lerp = U.lerp;
    const text = U.text;
    const hash = U.hash;

    function sig(x, d) {

        if (!isFinite(x)) { return "n/a"; }

        const a = Math.abs(x);

        if (a >= 1000) { return Math.round(x).toLocaleString("en-US"); }
        if (a >= 100) { return x.toFixed(0); }
        if (a >= 10) { return x.toFixed(d === undefined ? 1 : d); }

        return x.toFixed(d === undefined ? 2 : d);
    }

    function at(arr, u) { const f = clamp(u, 0, 1) * (arr.length - 1); const i = Math.floor(f); const j = Math.min(arr.length - 1, i + 1); return lerp(arr[i], arr[j], f - i); }

    function bg(ctx, W, H) {

        ctx.fillStyle = "#141a2c";
        ctx.fillRect(0, 0, W, H);
    }

    // A Bloch sphere seen from the side (x to the right, z up), with an optional state arrow.
    function bloch(ctx, cx, cy, R, theta, phi, col) {

        ctx.strokeStyle = "rgba(170,190,230,.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy, R, R * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();

        text(ctx, "|0⟩", cx, cy - R - 8, "#54e0c7", 12, "center");
        text(ctx, "|1⟩", cx, cy + R + 16, "#ffd666", 12, "center");

        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.sin(theta) * Math.sin(phi);
        const z = Math.cos(theta);
        const px = cx + R * (x * 0.95 + y * 0.3);
        const py = cy - R * (z * 0.95 - y * 0.18);

        ctx.strokeStyle = col || "#be96ff";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.fillStyle = col || "#be96ff";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
    }


    /* ---------------- probe station ---------------- */

    function probe(r) {

        const rows = [];

        r.reps.forEach(function (x, k) { (x.rows || []).forEach(function (j) { if (j.ok) { rows.push({ chip: k + 1, j: j }); } }); });

        if (!rows.length) { return null; }

        return A.playbox({
            title: "Inside the probe station: reading each junction at room temperature",
            dur: 6 * rows.length, ratio: 0.5,
            series: [{ x: rows.map(function (q, i) { return i + 1; }), y: rows.map(function (q) { return q.j.rn / 1000; }), color: "#54e0c7", width: 2 }],
            xLabel: "Junction (across the batch)", yLabel: "Resistance (kΩ)",
            caption: "Two needles touch the junction's leads and pass a tiny current. The junction's resistance at room temperature predicts its critical current, and so the qubit's frequency, long before the chip is cooled.",
            readout: function (i) { const q = rows[i]; return "chip " + q.chip + ", junction " + q.j.k + ": " + sig(q.j.rn / 1000, 2) + " kΩ"; },
            draw: function (ctx, u, t, dt, W, H) {

                bg(ctx, W, H);

                const q = rows[clamp(Math.floor(u * rows.length), 0, rows.length - 1)];
                const k = (u * rows.length) % 1;
                const down = k < 0.25 ? k / 0.25 : k > 0.85 ? (1 - k) / 0.15 : 1;

                // two pads and the junction between them
                ctx.fillStyle = "#4a5266";
                ctx.fillRect(20, H - 70, W - 40, 40);
                ctx.fillStyle = "#c9d3e6";
                ctx.fillRect(50, H - 82, 120, 12);
                ctx.fillRect(W - 170, H - 82, 120, 12);
                ctx.fillStyle = "#ff7ad9";
                ctx.fillRect(170, H - 78, W - 340, 4);
                text(ctx, "Al/AlOₓ/Al junction", W / 2, H - 88, "#ff7ad9", 11, "center");

                [110, W - 110].forEach(function (x, s) {

                    const tip = H - 82 - (1 - down) * 50;

                    ctx.strokeStyle = "#cbd2e3";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(x + (s ? 60 : -60), 30);
                    ctx.lineTo(x, tip);
                    ctx.stroke();
                });

                if (down > 0.95) {

                    for (let i = 0; i < 6; i++) {

                        const p = (t * 0.35 + i / 6) % 1;

                        ctx.fillStyle = "rgba(255,214,102,.9)";
                        ctx.beginPath();
                        ctx.arc(lerp(110, W - 110, p), H - 76, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.fillStyle = "rgba(6,10,24,.9)";
                ctx.fillRect(W / 2 - 80, 22, 160, 46);
                ctx.strokeStyle = "#54e0c7";
                ctx.strokeRect(W / 2 - 80, 22, 160, 46);
                text(ctx, down > 0.95 ? sig(q.j.rn / 1000, 2) + " kΩ" : "— — —", W / 2, 52, "#54e0c7", 20, "center");
                text(ctx, "chip " + q.chip + " · " + q.j.qubit + (q.j.pred ? " · predicts " + sig(q.j.pred, 3) + " GHz" : ""), W / 2, 90, "#cbd2e3", 11, "center");
            }
        });
    }


    /* ---------------- resonator spectroscopy ---------------- */

    function resonators(r, devs) {

        const rep = r.reps[0];
        const dev = devs[0];

        if (!rep || !rep.ok || !rep.wide) { return null; }

        const list = rep.list;
        const f = rep.wide.f;
        const s = rep.wide.s;

        return A.playbox({
            title: "Inside the fridge: a tone sweeping along the feedline",
            dur: 30, ratio: 0.5,
            series: [{ x: f, y: s, color: "#54e0c7", width: 1.6 }],
            xLabel: "Frequency (GHz)", yLabel: "|S21| (dB)",
            caption: "A weak microwave tone travels along the feedline. Away from the resonators it passes straight through. When its frequency matches a resonator, the resonator rings up and sends the energy back, so less signal reaches the output: a dip.",
            readout: function (i) { return sig(f[i], 4) + " GHz: " + sig(s[i], 2) + " dB"; },
            draw: function (ctx, u, t, dt, W, H) {

                bg(ctx, W, H);

                const fq = at(f, u);
                const sd = at(s, u);
                const amp = Math.pow(10, sd / 20);
                const fy = 54;

                ctx.fillStyle = "#c9d3e6";
                ctx.fillRect(10, fy - 3, W - 20, 6);
                text(ctx, "in", 14, fy - 10, "#cbd2e3", 10);
                text(ctx, "out", W - 14, fy - 10, "#cbd2e3", 10, "right");

                // wave along the feedline: full before the resonators, reduced after them
                ctx.strokeStyle = "#ffd666";
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let x = 10; x <= W - 10; x += 2) {

                    const a = x < W * 0.25 ? 1 : lerp(1, amp, clamp((x - W * 0.25) / (W * 0.5), 0, 1));
                    const y = fy - 18 - a * 10 * Math.sin(x * 0.12 - t * 3);

                    if (x === 10) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
                }

                ctx.stroke();

                // resonators hanging off the feedline
                const n = Math.max(1, list.length);

                list.forEach(function (res, i) {

                    const x = W * (0.2 + 0.6 * (i + 0.5) / n);
                    const lw = Math.max(res.lw * 1e-3, 1e-4);
                    const glow = 1 / (1 + Math.pow((fq - res.fr) / (lw * 3), 2));

                    for (let j = 0; j < 8; j++) {

                        ctx.strokeStyle = "rgba(255,214,102," + (0.25 + 0.75 * glow) + ")";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(x - 22, fy + 22 + j * 12);
                        ctx.lineTo(x + 22, fy + 22 + j * 12);
                        ctx.stroke();
                    }

                    if (glow > 0.2) {

                        ctx.fillStyle = "rgba(255,214,102," + glow * 0.25 + ")";
                        ctx.beginPath();
                        ctx.arc(x, fy + 64, 40, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    text(ctx, sig(res.fr, 4) + " GHz", x, fy + 132, "#cbd2e3", 10, "center");
                    text(ctx, res.qubit !== "none" ? "→ " + res.qubit : "", x, fy + 146, "#be96ff", 10, "center");
                });

                text(ctx, "tone: " + sig(fq, 4) + " GHz", W / 2, H - 12, "#ffd666", 12, "center");
            }
        });
    }


    /* ---------------- qubit spectroscopy ---------------- */

    function spectroscopy(r) {

        const rep = r.reps[0];

        if (!rep || !rep.ok) { return null; }

        return A.playbox({
            title: "Inside the qubit: climbing its energy ladder",
            dur: 24, ratio: 0.5,
            series: [{ x: rep.f, y: rep.p, color: "#54e0c7", width: 1.6 }],
            xLabel: "Drive frequency (GHz)", yLabel: "Excited population",
            caption: "The drive tone only lifts the qubit from 0 to 1 when its photons have exactly the energy of that step. The next step up is smaller by the anharmonicity, so it is left alone.",
            readout: function (i) { return sig(rep.f[i], 4) + " GHz: " + sig(rep.p[i], 2); },
            draw: function (ctx, u, t, dt, W, H) {

                bg(ctx, W, H);

                const fq = at(rep.f, u);
                const pop = clamp(at(rep.p, u) / 0.5, 0, 1);
                const y0 = H - 40;
                const y1 = H - 40 - 110;
                const y2 = y1 - 110 * (1 + rep.alpha / rep.f01);

                [[y0, "|0⟩", "#54e0c7"], [y1, "|1⟩", "#ffd666"], [y2, "|2⟩", "#8791ab"]].forEach(function (l) {

                    ctx.strokeStyle = l[2];
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(90, l[0]);
                    ctx.lineTo(250, l[0]);
                    ctx.stroke();
                    text(ctx, l[1], 80, l[0] + 4, l[2], 13, "right");
                });

                // the drive photon, its height = its energy
                const hDrive = 110 * fq / rep.f01;

                ctx.strokeStyle = "#ff7ad9";
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let k = 0; k <= 40; k++) { ctx.lineTo(290 + Math.sin(k * 0.8 + t * 6) * 5, y0 - k / 40 * hDrive); }

                ctx.stroke();
                text(ctx, "drive " + sig(fq, 4) + " GHz", 300, y0 - hDrive - 8, "#ff7ad9", 11, "center");

                const y = lerp(y0, y1, pop * (0.5 + 0.5 * Math.sin(t * 2)));

                ctx.fillStyle = "#be96ff";
                ctx.beginPath();
                ctx.arc(170, y - 8, 8, 0, Math.PI * 2);
                ctx.fill();

                text(ctx, pop > 0.3 ? "on resonance: the qubit is driven up" : "off resonance: nothing happens", W / 2, 22, "#cbd2e3", 12, "center");
            }
        });
    }


    /* ---------------- Rabi ---------------- */

    function rabi(r) {

        const rep = r.reps[0];

        if (!rep || !rep.ok) { return null; }

        return A.playbox({
            title: "Inside the qubit: the drive turns the state around the sphere",
            dur: 30, ratio: 0.5,
            series: [{ x: rep.t, y: rep.p, color: "#54e0c7", width: 1.6 }],
            xLabel: "Pulse length (ns)", yLabel: "Excited population",
            caption: "A resonant microwave pulse rotates the qubit's state about the x axis of the Bloch sphere. Half a turn (the π pulse) takes 0 to 1: that is the X gate. Keep driving and it comes back round.",
            readout: function (i) { return sig(rep.t[i], 1) + " ns: " + sig(rep.p[i], 2); },
            draw: function (ctx, u, t, dt, W, H) {

                bg(ctx, W, H);

                const tt = at(rep.t, u);
                const theta = 2 * Math.PI * (rep.om / 1000) * tt;

                bloch(ctx, W / 2 - 40, H / 2 + 6, 82, theta, -Math.PI / 2, "#be96ff");

                // the pulse envelope so far
                const pw = Math.min(1, tt / rep.t[rep.t.length - 1]);

                ctx.fillStyle = "rgba(255,122,217,.35)";
                ctx.fillRect(W - 120, 40, 100 * pw, 18);
                ctx.strokeStyle = "#ff7ad9";
                ctx.strokeRect(W - 120, 40, 100, 18);
                text(ctx, "pulse " + sig(tt, 1) + " ns", W - 70, 34, "#ff7ad9", 11, "center");
                text(ctx, "π pulse ≈ " + sig(rep.tpi, 1) + " ns", W - 70, 80, "#cbd2e3", 11, "center");
            }
        });
    }


    /* ---------------- T1 ---------------- */

    const PART_COL = { surface: "#ff7a90", substrate: "#7aa2ff", purcell: "#ffd666", feedline: "#4dd0ff", qp: "#c792ff", islands: "#9be15d" };
    const PART_TXT = { surface: "surfaces", substrate: "substrate", purcell: "via the resonator", feedline: "into the feedline", qp: "quasiparticles", islands: "ground islands" };

    function t1(r) {

        const rep = r.reps[0];

        if (!rep || !rep.ok) { return null; }

        const parts = Object.keys(rep.parts || {});
        const share = parts.map(function (k) { return rep.T1 / rep.parts[k]; });

        return A.playbox({
            title: "Inside the qubit: where the energy leaks away",
            dur: 30, ratio: 0.5,
            series: [{ x: rep.t, y: rep.p, color: "#54e0c7", width: 1.6 }],
            xLabel: "Wait (µs)", yLabel: "Excited population",
            caption: "After a π pulse the qubit holds one photon of energy. Sooner or later it gives it away: to defects in the surface oxides, to the substrate, out through its resonator, or to broken Cooper pairs. Each dot is a quantum of energy leaving by one route; the colours follow the loss budget.",
            readout: function (i) { return sig(rep.t[i], 1) + " µs: " + sig(rep.p[i], 2); },
            draw: function (ctx, u, t, dt, W, H) {

                bg(ctx, W, H);

                const tt = at(rep.t, u);
                const pop = Math.exp(-tt / rep.T1);
                const cx = 110;
                const cy = H / 2 + 6;

                bloch(ctx, cx, cy, 64, Math.PI * pop, 0, "#ffd666");

                // energy quanta flying off to the channels
                parts.forEach(function (k, i) {

                    const tx = 250 + (i % 2) * 90;
                    const ty = 50 + Math.floor(i / 2) * 60;

                    ctx.fillStyle = PART_COL[k] || "#cbd2e3";
                    ctx.fillRect(tx - 6, ty - 6, 12, 12);
                    text(ctx, PART_TXT[k] || k, tx + 10, ty + 4, PART_COL[k] || "#cbd2e3", 10);
                    text(ctx, Math.round(share[i] * 100) + "%", tx + 10, ty + 17, "#8791ab", 10);

                    const nq = Math.round(share[i] * 8 * (1 - pop) + 0.3);

                    for (let q = 0; q < nq; q++) {

                        const p = (t * 0.3 + hash(q + i * 13)) % 1;

                        ctx.fillStyle = PART_COL[k] || "#cbd2e3";
                        ctx.beginPath();
                        ctx.arc(lerp(cx, tx - 8, p), lerp(cy, ty, p) + Math.sin(p * 9 + q) * 6, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });

                text(ctx, "T₁ = " + sig(rep.T1, 0) + " µs", cx, H - 12, "#ffd666", 12, "center");
            }
        });
    }


    /* ---------------- Ramsey ---------------- */

    function ramsey(r) {

        const rep = r.reps[0];

        if (!rep || !rep.ok) { return null; }

        return A.playbox({
            title: "Inside the qubit: the phase spreads out",
            dur: 30, ratio: 0.5,
            series: [{ x: rep.t, y: rep.p, color: "#54e0c7", width: 1.4 }],
            xLabel: "Wait (µs)", yLabel: "Excited population",
            caption: "Seen from above, the first π/2 pulse puts the state on the equator. It turns at the detuning. Small random frequency shifts make each repetition turn at a slightly different rate, so the arrows fan out and the fringes fade: that is dephasing, measured as T₂*.",
            readout: function (i) { return sig(rep.t[i], 1) + " µs: " + sig(rep.p[i], 2); },
            draw: function (ctx, u, t, dt, W, H) {

                bg(ctx, W, H);

                const tt = at(rep.t, u);
                const cx = W / 2 - 30;
                const cy = H / 2 + 6;
                const R = 92;

                ctx.strokeStyle = "rgba(170,190,230,.5)";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(cx, cy, R, 0, Math.PI * 2);
                ctx.stroke();
                text(ctx, "the equator, seen from above", cx, cy + R + 20, "#8791ab", 10, "center");

                const spread = tt / Math.max(rep.T2s, 1) * 1.6;
                const base = 2 * Math.PI * (rep.det / 1000) * tt;

                for (let k = 0; k < 14; k++) {

                    const a = base + (hash(k) - 0.5) * 2 * spread;
                    const len = R * Math.exp(-tt / (2 * rep.T1));

                    ctx.strokeStyle = "rgba(190,150,255," + (k ? 0.35 : 1) + ")";
                    ctx.lineWidth = k ? 1.5 : 3;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx + len * Math.cos(a), cy - len * Math.sin(a));
                    ctx.stroke();
                }

                text(ctx, "wait " + sig(tt, 1) + " µs · T₂* ≈ " + sig(rep.T2s, 0) + " µs", W / 2, 22, "#cbd2e3", 12, "center");
            }
        });
    }


    A.extra = A.extra || {};

    A.extra.qubit = function (r, devs) {

        const type = r.test.type;

        if (type === "probe") { return probe(r, devs); }
        if (type === "res") { return resonators(r, devs); }
        if (type === "spec") { return spectroscopy(r, devs); }
        if (type === "rabi") { return rabi(r, devs); }
        if (type === "t1") { return t1(r, devs); }
        if (type === "ramsey") { return ramsey(r, devs); }

        return null;
    };

}(typeof window !== "undefined" ? window : globalThis));
