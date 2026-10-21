/* ========================================
   LAB KIND: TRANSMON QUBIT CHIP (QUANTUM FOUNDRY)

   Tests, charts, comparison metrics, process settings and layer notes for
   the "qubit" kind. Tests: room-temperature junction probing, feedline
   transmission through the readout resonators, qubit spectroscopy, Rabi,
   T1 with its loss budget, Ramsey and echo, and a map of the chip with
   every qubit's numbers and frequency collisions.

   Needs window.LabQubit (lab-qubit-model.js), LabEngine.qubitKit and
   window.LabKinds.env.
======================================== */

(function (root) {

    "use strict";

    const D = root.SCLabDraw;
    const E = root.LabEngine;
    const Q = root.LabQubit;
    const QK = E.qubitKit;

    const K = root.LabKinds = root.LabKinds || {};

    function env() { return K.env; }


    const TESTS = [
        { id: "probe", name: "Probe the junctions (room temperature)", blurb: "Touch two needles to each junction's leads and read its resistance. The Ambegaokar–Baratoff relation turns it into the qubit frequency you should find once the chip is cold." },
        { id: "res", name: "Resonator spectroscopy", blurb: "Cool the chip to 10 mK and sweep a weak tone through the feedline. Each readout resonator makes a dip; its position shifts when its qubit is in 1." },
        { id: "spec", name: "Qubit spectroscopy", blurb: "Sweep a second tone near the qubit and watch the readout: the qubit frequency and, at high power, the anharmonicity." },
        { id: "rabi", name: "Rabi oscillations", blurb: "Drive the qubit for longer and longer pulses: the population swings between 0 and 1. The first peak is the π pulse, the X gate." },
        { id: "t1", name: "T₁ and the loss budget", blurb: "Flip the qubit to 1 and wait: how long does it keep its energy, and where does the energy go?" },
        { id: "ramsey", name: "Ramsey and echo (T₂)", blurb: "Two π/2 pulses with a wait between: the fringes fade as the qubit loses its phase. An echo pulse in the middle undoes slow noise." },
        { id: "map", name: "Chip map and collisions", blurb: "The fabricated chip, with each qubit's frequency, anharmonicity and lifetimes, and any pairs of coupled qubits whose frequencies collide." }
    ];

    const QLABELS = ["Q1", "Q2", "Q3", "Q4"];


    function fmtGHz(g) { return isFinite(g) ? g.toFixed(3) + " GHz" : "n/a"; }

    function fmtUs(us) { return !isFinite(us) ? "n/a" : us >= 1000 ? (us / 1000).toFixed(2) + " ms" : us >= 10 ? Math.round(us) + " µs" : us.toFixed(1) + " µs"; }

    function fmtOhm(x) {

        const sig = env().sig;

        if (!isFinite(x)) { return "open"; }
        if (x === 0) { return "short"; }
        if (x >= 1e3) { return sig(x / 1e3) + " kΩ"; }

        return sig(x) + " Ω";
    }

    function fmtBig(x) { return !isFinite(x) ? "n/a" : x >= 1e6 ? (x / 1e6).toFixed(2) + " million" : Math.round(x).toLocaleString("en-US"); }

    function pmq(values, d) {

        const v = env();
        const clean = values.filter(isFinite);
        const m = v.mean(clean);

        return clean.length > 1 && v.sd(clean) < 0.002 * Math.abs(m) ? v.sig(m, d) : v.pm(values, d);
    }

    const PART_NAMES = {
        surface: "Surface oxides and interfaces (TLS)",
        substrate: "The substrate (bulk dielectric loss)",
        purcell: "Purcell decay through the readout resonator",
        feedline: "Direct leakage into the feedline",
        qp: "Quasiparticles and stray infrared light",
        islands: "Stray modes of floating ground islands"
    };

    const TPHI_NAMES = { photons: "Thermal photons in the resonator", flux: "Flux noise (two junctions in a loop)" };


    /* ------------------------------------------------
       THE CHIP MAP
    ------------------------------------------------ */

    function chipMap(dev, opt) {

        const h = env().h;
        const canvas = h("canvas", { role: "img", "aria-label": "The fabricated chip seen from above, with each qubit's frequency." });
        const W = 760;
        const H = 520;
        const dpr = Math.min(root.devicePixelRatio || 1, 2);

        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = "100%";
        canvas.style.maxWidth = W + "px";
        canvas.style.aspectRatio = W + " / " + H;
        canvas.style.height = "auto";

        const ctx = canvas.getContext("2d");

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#0b1020";
        ctx.fillRect(0, 0, W, H);

        const dr = dev.draw;

        if (!dr || !dr.box) { return canvas; }

        const b = dr.box;
        const s = Math.min((W - 40) / (b.x1 - b.x0), (H - 70) / (b.y1 - b.y0));
        const ox = (W - (b.x1 - b.x0) * s) / 2 - b.x0 * s;
        const oy = 20 - b.y0 * s;
        const X = function (x) { return ox + x * s; };
        const Y = function (y) { return oy + y * s; };

        // ground plane, then the openings, then the circuit metal
        ctx.fillStyle = "#8fa3c8";
        ctx.fillRect(X(b.x0), Y(b.y0), (b.x1 - b.x0) * s, (b.y1 - b.y0) * s);
        ctx.fillStyle = "#1b2440";
        (dr.openings || []).forEach(function (r) { if (r.t === "r") { ctx.fillRect(X(r.x), Y(r.y), Math.max(0.6, r.w * s), Math.max(0.6, r.h * s)); } });

        ctx.fillStyle = "#ffd27a";
        (dr.metal || []).forEach(function (r) { if (r.t === "r") { ctx.fillRect(X(r.x), Y(r.y), Math.max(0.6, r.w * s), Math.max(0.6, r.h * s)); } });

        (dr.junctions || []).forEach(function (j) {

            ctx.fillStyle = j.ok ? "#ff7ad9" : "#ff3b3b";
            ctx.beginPath();
            ctx.arc(X(j.x), Y(j.y), 3.5, 0, Math.PI * 2);
            ctx.fill();
        });

        (dev.bridges || []).forEach(function (br) {

            ctx.strokeStyle = br.ok ? "#7dffb0" : "#ff3b3b";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(X(br.x), Y(br.y), 4, Math.PI, 0);
            ctx.stroke();
        });

        // a label on a dark backing so it reads over the metal
        const tag = function (text, x, y, col) {

            ctx.font = "bold 11px Inter, Arial, sans-serif";

            const w = ctx.measureText(text).width + 10;

            ctx.fillStyle = "rgba(11,16,32,.88)";
            ctx.fillRect(x - w / 2, y - 12, w, 17);
            ctx.fillStyle = col;
            ctx.textAlign = "center";
            ctx.fillText(text, x, y);
        };

        // couplings and collisions
        const byLabel = {};

        dev.qubits.forEach(function (q) { byLabel[q.label] = q; });

        (dev.pairs || []).forEach(function (p) {

            const a = byLabel[p.a];
            const c = byLabel[p.b];

            if (!a || !c) { return; }

            ctx.strokeStyle = p.collide ? "#ff4d6d" : "rgba(84,224,199,.8)";
            ctx.lineWidth = p.collide ? 4 : 2;
            ctx.setLineDash(p.collide ? [] : [5, 4]);
            ctx.beginPath();
            ctx.moveTo(X(a.x), Y(a.y) - 26);
            ctx.lineTo(X(c.x), Y(c.y) - 26);
            ctx.stroke();
            ctx.setLineDash([]);
            tag("J ≈ " + Math.round(p.J * 1000) + " MHz" + (p.collide ? " · collision" : ""), (X(a.x) + X(c.x)) / 2, Y(a.y) - 34, p.collide ? "#ff4d6d" : "#54e0c7");
        });

        dev.qubits.forEach(function (q) {

            if (!q.x) { return; }

            const x = X(q.x);
            const y = Y(q.y);

            ctx.fillStyle = "rgba(11,16,32,.85)";
            ctx.fillRect(x - 46, y + 14, 92, q.ok ? 46 : 22);
            ctx.strokeStyle = q.ok ? "#54e0c7" : "#ff4d6d";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x - 46, y + 14, 92, q.ok ? 46 : 22);
            ctx.textAlign = "center";
            ctx.fillStyle = "#f5f7ff";
            ctx.font = "bold 12px Inter, Arial, sans-serif";
            ctx.fillText(q.label + (q.ok ? " · " + q.f01.toFixed(3) + " GHz" : " · broken"), x, y + 29);

            if (q.ok) {

                ctx.font = "11px Inter, Arial, sans-serif";
                ctx.fillStyle = "#aab3cf";
                ctx.fillText("α " + Math.round(q.alpha * 1000) + " MHz", x, y + 43);
                ctx.fillText("T₁ " + fmtUs(q.T1) + " · T₂* " + fmtUs(q.T2s), x, y + 56);
            }
        });

        (dev.resonators || []).forEach(function (r) {

            if (!r.x) { return; }

            tag("resonator " + r.fr.toFixed(3) + " GHz", X(r.x), Y(b.y0) + 0.42 * (b.y1 - b.y0) * s, "#ffd27a");
        });

        ctx.fillStyle = "#aab3cf";
        ctx.font = "11px Inter, Arial, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("grey: ground plane · dark: etched openings · gold: circuit metal · pink: junctions · green arcs: airbridges", 12, H - 26);
        ctx.fillText("chip " + (dev.chip.w / 1000).toFixed(2) + " × " + (dev.chip.h / 1000).toFixed(2) + " mm · lowest box mode about " + Math.round(dev.boxMode) + " GHz", 12, H - 10);

        return canvas;
    }


    /* ------------------------------------------------
       THE KIND
    ------------------------------------------------ */

    const impl = {

        id: "qubit",

        testLead: "Start at room temperature: probe each junction to predict the qubit frequencies. Then cool the chip to 10 mK and find the readout resonators on the feedline, find each qubit with spectroscopy, calibrate a π pulse with Rabi, and measure T₁ and T₂. The chip map shows the whole chip, its couplings and any frequency collisions. Each test runs on every chip in the batch.",

        tests: function () { return TESTS; },
        defaultTest: "probe",

        cleanParams: function (q, num) {

            q = q || {};

            return {
                q: QLABELS.indexOf(q.q) >= 0 ? q.q : "Q1",
                power: q.power === "high" ? "high" : "low",
                amp: num(q.amp, 5, 100, 50),
                det: [20, 50, 100, 200].indexOf(Number(q.det)) >= 0 ? Number(q.det) : 50
            };
        },

        defaultParams: function () { return { q: "Q1", power: "low", amp: 50, det: 50 }; },

        describeParams: function (t) {

            const p = t.params;

            switch (t.type) {
                case "res": return "zoom on " + p.q;
                case "spec": return p.q + ", " + p.power + " drive power";
                case "rabi": return p.q + ", drive amplitude " + p.amp + "%";
                case "t1": return p.q;
                case "ramsey": return p.q + ", detuned " + p.det + " kHz";
                default: return "standard settings";
            }
        },

        paramControls: function (type, params) {

            const v = env();
            const out = [];

            if (type === "res" || type === "spec" || type === "rabi" || type === "t1" || type === "ramsey") {

                out.push(v.selectChoice("Qubit", QLABELS.map(function (l) { return { value: l, label: l }; }), params.q, function (x) { params.q = x; },
                    type === "res" ? "Which qubit's resonator to zoom in on." : "Which qubit to measure. If the chip has no qubit with this label, the first working one is used."));
            }

            if (type === "spec") {

                out.push(v.selectChoice("Drive power", [{ value: "low", label: "Low: a narrow line at the qubit frequency" }, { value: "high", label: "High: also shows the two-photon line (half of 0→2)" }], params.power, function (x) { params.power = x; },
                    "At high power the qubit can absorb two photons at once to jump from 0 to 2. That line sits half an anharmonicity below the main one."));
            }

            if (type === "rabi") {

                out.push(v.slider({ label: "Drive amplitude", min: 5, max: 100, step: 5, value: params.amp, unit: "%", hint: "A stronger drive turns the qubit faster: a shorter π pulse. Too short and the pulse is spread wide in frequency, so it also drives the 1→2 transition (leakage).", onChange: function (x) { params.amp = x; } }));
            }

            if (type === "ramsey") {

                out.push(v.selectField("Detuning from the qubit", [20, 50, 100, 200], params.det, "kHz", function (x) { params.det = x; }, "The drive is set a little off the qubit frequency on purpose, so the fringes oscillate at the detuning. Their decay is T₂*."));
            }

            return out;
        },

        measure: function (type, dev, p) {

            if (!dev || dev.status !== "ok") { return { ok: false, dev: dev }; }

            switch (type) {
                case "probe": return Q.probe(dev);
                case "res": return Q.resonators(dev, p);
                case "spec": return Q.spectroscopy(dev, p);
                case "rabi": return Q.rabi(dev, p);
                case "t1": return Q.t1(dev, p);
                case "ramsey": return Q.ramsey(dev, p);
                default: return { ok: true, dev: dev };
            }
        },

        view: function (container, r, theme) {

            const v = env();
            const h = v.h;
            const sig = v.sig;
            const type = r.test.type;
            const reps = r.reps;
            const devs = v.devicesOf(r.batch);
            const color = function (k) { return D.color(k, theme); };

            const bad = devs.filter(function (d) { return d.status !== "ok"; }).length;

            const warnBad = function () {

                if (bad) { container.appendChild(h("p", { className: "lab-note warn", text: bad + " of " + devs.length + " chips don't work (no readable qubit, or a broken feedline). Open the failure analysis in the Build step to see why." })); }
            };

            const firstOk = function () { return reps.filter(function (x) { return x && x.ok; })[0]; };

            const chart = function (cfg) { const c = h("canvas", { role: "img" }); D.line(c, Object.assign({ theme: theme }, cfg)); return c; };

            if (type === "probe") {

                const rows = [];

                reps.forEach(function (x, k) {

                    (x.rows || []).forEach(function (j) {

                        rows.push(["Chip " + (k + 1) + ", junction " + j.k + " (" + j.qubit + ")", j.ok ? "ok" : j.why, fmtOhm(j.rn), j.area ? sig(j.area * 1e6, 3) + " nm²" : "n/a",
                            j.ic ? sig(j.ic * 1e9, 3) + " nA" : "n/a", j.ej ? sig(j.ej, 3) + " GHz" : "n/a", j.pred ? fmtGHz(j.pred) : "n/a"]);
                    });
                });

                if (!rows.length) { container.appendChild(h("p", { className: "lab-note warn", text: "There are no junctions to probe." })); warnBad(); return; }

                container.appendChild(v.table(["Junction", "Result", "Resistance at 300 K", "Area", "Critical current (cold)", "Josephson energy", "Predicted qubit frequency"], rows));

                // spread of predicted frequencies across the batch
                const byQ = {};

                reps.forEach(function (x) { (x.rows || []).forEach(function (j) { if (j.pred) { (byQ[j.qubit] = byQ[j.qubit] || []).push(j.pred); } }); });

                const keys = Object.keys(byQ).sort();

                if (keys.length) {

                    container.appendChild(v.table(["Qubit", "Predicted frequency across the batch", "Spread"], keys.map(function (k) {

                        const xs = byQ[k];

                        return [k, v.pm(xs, 3) + " GHz", xs.length > 1 ? "± " + Math.round(v.sd(xs) * 1000) + " MHz" : "one chip"];
                    })));
                }

                container.appendChild(h("p", { className: "lab-hint", text: "A junction's critical current follows from its resistance: critical current = πΔ / (2e × resistance), with the resistance about 12% higher once cold. The charging energy comes from the design, so the resistance predicts the frequency before the chip is ever cooled. Junction-to-junction spread comes from the random wobble of the lead edges; batch-to-batch shifts come from the oxidation." }));

                warnBad();

                return;
            }

            if (type === "map") {

                const d0 = devs.filter(function (d) { return d.status === "ok"; })[0] || devs[0];

                container.appendChild(h("p", { className: "lab-muted", text: "Chip 1" + (d0 === devs[0] ? "" : " (the first working one)") + ", as fabricated:" }));
                container.appendChild(chipMap(d0));

                const qs = (d0.qubits || []);

                container.appendChild(v.table(["Qubit", "Frequency", "Anharmonicity", "Josephson ÷ charging energy", "g to resonator", "Detuning from resonator", "T₁", "T₂*", "Note"], qs.map(function (q) {

                    return q.ok ? [q.label, fmtGHz(q.f01), Math.round(q.alpha * 1000) + " MHz", String(Math.round(q.ratio)), q.g ? Math.round(q.g * 1000) + " MHz" : "n/a", isFinite(q.delta) ? sig(q.delta, 3) + " GHz" : "n/a", fmtUs(q.T1), fmtUs(q.T2s), q.warn || ""]
                        : [q.label, "broken", "", "", "", "", "", "", q.problem];
                })));

                if (d0.pairs && d0.pairs.length) {

                    container.appendChild(v.table(["Coupled pair", "Coupling J", "Detuning", "Collision?"], d0.pairs.map(function (p) {

                        return [p.a + "–" + p.b, Math.round(p.J * 1000) + " MHz", Math.round(p.detune * 1000) + " MHz", p.collide || "no"];
                    })));
                }

                // frequency spread across the batch and collision-free yield
                const series = [];
                const okDevs = devs.filter(function (d) { return d.status === "ok"; });

                QLABELS.forEach(function (lab, k) {

                    const xs = [];
                    const ys = [];

                    okDevs.forEach(function (d, i) {

                        const q = (d.qubits || []).filter(function (x) { return x.label === lab && x.ok; })[0];

                        if (q) { xs.push(i + 1); ys.push(q.f01); }
                    });

                    if (xs.length) { series.push({ label: lab, color: color(k), width: 0, dots: true, x: xs, y: ys }); }
                });

                if (series.length) {

                    container.appendChild(h("div", { className: "lab-charts" }, [chart({ xLabel: "Chip", yLabel: "Qubit frequency (GHz)", title: "Every qubit on every chip in the batch", series: series })]));
                }

                const free = okDevs.filter(function (d) { return !d.collisions; }).length;

                container.appendChild(h("p", { className: "lab-note " + (free === okDevs.length ? "ok" : "warn"), text: free + " of " + okDevs.length + " working chips have no frequency collisions." }));
                container.appendChild(h("p", { className: "lab-hint", text: "Coupled neighbours should sit a few hundred MHz apart, and one qubit's 0→1 frequency must not match its neighbour's 1→2 frequency. Fixed-frequency qubits can't be tuned afterwards, so the spread of the junctions decides how many chips are usable. Wider junctions and a stable oxidation narrow the spread." }));

                warnBad();

                return;
            }

            const a = firstOk();

            if (!a) { container.appendChild(h("p", { className: "lab-note warn", text: "No working chip in this batch." })); warnBad(); return; }

            if (type === "res") {

                const wide = chart({ xLabel: "Frequency (GHz)", yLabel: "Transmission |S21| (dB)", title: "Feedline transmission, chip 1", series: [{ label: "Qubits in 0", color: color(0), width: 1.4, x: a.wide.f, y: a.wide.s }] });
                const zoom = chart({
                    xLabel: "Frequency (GHz)", yLabel: "|S21| (dB)", title: "Zoom on the resonator of " + (a.zoom.label || "the first qubit"),
                    series: [{ label: "Qubit in 0", color: color(0), width: 2, x: a.zoom.f, y: a.zoom.s0 }, { label: "Qubit in 1", color: color(1), width: 2, x: a.zoom.f, y: a.zoom.s1 }]
                });

                container.appendChild(h("div", { className: "lab-charts" }, [wide, zoom]));

                const rows = [];

                reps.forEach(function (x, k) {

                    (x.list || []).forEach(function (rr) {

                        rows.push(["Chip " + (k + 1) + ", " + (rr.qubit !== "none" ? "resonator of " + rr.qubit : "resonator with no qubit"), fmtGHz(rr.fr), fmtBig(rr.qc), fmtBig(rr.qi), sig(rr.lw * 1000, 3) + " kHz", isFinite(rr.chi) ? sig(rr.chi * 1000, 3) + " kHz" : "n/a"]);
                    });
                });

                container.appendChild(v.table(["Resonator", "Frequency", "Coupling Q", "Internal Q", "Linewidth", "Dispersive shift χ"], rows));
                container.appendChild(h("p", { className: "lab-hint", text: "Each half-wave resonator rings where its length is half a wavelength. The coupling Q is set by how strongly it couples to the feedline; the internal Q tells you how lossy the materials are, which is why fabs measure resonators first. When the qubit is in 1 the dip moves by 2χ: that shift is the readout. A shift about as big as the linewidth reads best." }));

                warnBad();

                return;
            }

            if (type === "spec") {

                const c1 = chart({ xLabel: "Drive frequency (GHz)", yLabel: "Excited population", title: "Qubit spectroscopy, " + a.q + " (chip 1, " + (a.high ? "high power, wide scan" : "low power, zoomed in") + ")", yMin: 0, series: [{ label: "", color: color(0), width: 1.6, x: a.f, y: a.p }] });

                container.appendChild(h("div", { className: "lab-charts" }, [c1]));

                container.appendChild(v.table(["Chip", "Qubit frequency", "Linewidth", a.high ? "Two-photon line (½ of 0→2)" : "Anharmonicity (from the design)"], reps.map(function (x, k) {

                    return x.ok ? ["Chip " + (k + 1), fmtGHz(x.f01), sig(x.lw * 1000, 3) + " kHz", a.high ? fmtGHz(x.f02half) : Math.round(x.alpha * 1000) + " MHz"] : ["Chip " + (k + 1), "no qubit", "", ""];
                })));

                if (a.split > 1) { container.appendChild(h("p", { className: "lab-note warn", text: "The line is split in two by about " + Math.round(a.split) + " kHz: stray charge on the island jumps between two values. The Josephson energy is too small for the charging energy." })); }

                container.appendChild(h("p", { className: "lab-hint", text: "Compare this with the frequency predicted from the room-temperature resistance. At high power the two-photon line appears half an anharmonicity below: the gap between the lines measures how uneven the qubit's energy ladder is." }));

                warnBad();

                return;
            }

            if (type === "rabi") {

                const c1 = chart({ xLabel: "Pulse length (ns)", yLabel: "Excited population", title: "Rabi oscillations, " + a.q + " (chip 1)", yMin: 0, series: [{ label: "", color: color(0), width: 1.6, dots: false, x: a.t, y: a.p }] });

                container.appendChild(h("div", { className: "lab-charts" }, [c1]));

                container.appendChild(v.table(["Chip", "Rabi frequency", "π pulse (X gate)", "Visibility"], reps.map(function (x, k) {

                    return x.ok ? ["Chip " + (k + 1), sig(x.om, 3) + " MHz", sig(x.tpi, 3) + " ns", Math.round(x.c * 100) + "%"] : ["Chip " + (k + 1), "no qubit", "", ""];
                })));

                if (a.leak > 0.05) { container.appendChild(h("p", { className: "lab-note warn", text: "The π pulse is only " + sig(a.tpi, 2) + " ns long: so short that it also drives the 1→2 transition. Some population leaks out of the qubit, so the oscillation never reaches full height. Use a weaker drive (longer pulse) or a shaped (DRAG) pulse." })); }

                container.appendChild(h("p", { className: "lab-hint", text: "The first peak is the π pulse that flips 0 to 1: the X gate. Typical transmon gates are 20 to 50 ns. Visibility below 100% comes from readout: how far apart the 0 and 1 readout signals are compared with the resonator's linewidth." }));

                warnBad();

                return;
            }

            if (type === "t1") {

                const c1 = chart({ xLabel: "Wait after the π pulse (µs)", yLabel: "Excited population", title: "Energy relaxation, " + a.q + " (chip 1)", yMin: 0, series: [{ label: "", color: color(0), width: 0, dots: true, x: a.t, y: a.p }] });

                const parts = Object.keys(a.parts || {});
                const bars = h("canvas", { role: "img" });

                const SHORT = { surface: "surfaces", substrate: "substrate", purcell: "Purcell", feedline: "feedline", qp: "quasiparticles", islands: "islands" };

                D.bars(bars, {
                    theme: theme, title: "Where the energy goes", yLabel: "Share of the decay (%)",
                    bars: parts.map(function (k, i) { return { label: SHORT[k] || k, value: Math.round(a.T1 / a.parts[k] * 1000) / 10, color: color(i + 1) }; })
                });

                container.appendChild(h("div", { className: "lab-charts" }, [c1, bars]));

                container.appendChild(v.table(["Loss channel", "T₁ it alone would allow", "Share of the decay"], parts.map(function (k) {

                    return [PART_NAMES[k] || k, fmtUs(a.parts[k]), Math.round(a.T1 / a.parts[k] * 100) + "%"];
                }).concat([["All together", fmtUs(a.T1), "100%"]])));

                container.appendChild(v.table(["Chip", "T₁", "Quality factor (2πf T₁)"], reps.map(function (x, k) {

                    return x.ok ? ["Chip " + (k + 1), fmtUs(x.T1), fmtBig(2 * Math.PI * x.f01 * 1e9 * x.T1 * 1e-6)] : ["Chip " + (k + 1), "no qubit", ""];
                })));

                container.appendChild(h("p", { className: "lab-hint", text: "The decay rates of the channels add up. Surface loss falls with wider gaps and cleaner, low-loss films such as tantalum. Substrate loss depends on silicon versus sapphire. Purcell decay grows as the qubit moves closer to its resonator or couples to it harder. Stray infrared light makes quasiparticles unless the chip is well shielded." }));

                warnBad();

                return;
            }

            if (type === "ramsey") {

                const c1 = chart({ xLabel: "Wait between the π/2 pulses (µs)", yLabel: "Excited population", title: "Ramsey fringes, " + a.q + " (chip 1)", yMin: 0, series: [{ label: "", color: color(0), width: 1.3, x: a.t, y: a.p }] });
                const c2 = chart({ xLabel: "Total wait with an echo pulse (µs)", yLabel: "Excited population", title: "Spin echo, " + a.q + " (chip 1)", yMin: 0, series: [{ label: "", color: color(2), width: 0, dots: true, x: a.te, y: a.pecho }] });

                container.appendChild(h("div", { className: "lab-charts" }, [c1, c2]));

                container.appendChild(v.table(["Chip", "T₂* (Ramsey)", "T₂ (echo)", "2T₁ (the upper limit)"], reps.map(function (x, k) {

                    return x.ok ? ["Chip " + (k + 1), fmtUs(x.T2s), fmtUs(x.T2E), fmtUs(2 * x.T1)] : ["Chip " + (k + 1), "no qubit", "", ""];
                })));

                const tp = a.tphi || {};
                const rows = Object.keys(tp).map(function (k) { return [TPHI_NAMES[k] || k, fmtUs(tp[k])]; });

                rows.push(["Slow noise (removed by the echo)", "about 250 µs"]);
                container.appendChild(v.table(["Dephasing source", "Pure-dephasing time it alone allows"], rows));

                if (a.eps > 0.002) { container.appendChild(h("p", { className: "lab-note warn", text: "The fringes beat at about " + sig(a.eps * 1000, 2) + " kHz: stray charge makes the qubit hop between two frequencies (charge dispersion). A larger ratio of Josephson to charging energy (a bigger capacitor or junction) removes it." })); }

                container.appendChild(h("p", { className: "lab-hint", text: "T₂ can never beat 2T₁. Thermal photons left in the readout resonator shift the qubit frequency at random; better filtering and attenuation on the lines reduce them. The echo refocuses slow drifts, so T₂ (echo) is longer than T₂*." }));

                warnBad();
            }
        },

        headline: function (batch) {

            const v = env();
            const devs = v.devicesOf(batch);
            const q1 = function (d) { return d.status === "ok" ? Q.qubitOf(d, "Q1") : null; };
            const num = function (fn) { return devs.map(function (d) { const q = q1(d); return q ? fn(q, d) : NaN; }); };

            return {
                f01: num(function (q) { return q.f01; }),
                alpha: num(function (q) { return Math.abs(q.alpha) * 1000; }),
                t1: num(function (q) { return q.T1; }),
                t2: num(function (q) { return q.T2s; }),
                fr: num(function (q) { return q.res ? q.res.fr : NaN; }),
                chi: num(function (q) { return isFinite(q.chi) ? Math.abs(q.chi) * 1000 : NaN; }),
                qi: num(function (q) { return q.res ? q.res.qi : NaN; }),
                free: devs.map(function (d) { return d.status === "ok" ? (d.collisions ? 0 : 100) : NaN; })
            };
        },

        tableHead: ["Q1 frequency (GHz)", "Anharmonicity (MHz)", "T₁ (µs)", "T₂* (µs)", "Resonator (GHz)", "Dispersive shift χ (MHz)", "Resonator internal Q", "Collision-free chips (%)"],

        tableRow: function (hd) {

            return [
                pmq(hd.f01, 3), pmq(hd.alpha, 0), pmq(hd.t1, 0), pmq(hd.t2, 0), pmq(hd.fr, 3), pmq(hd.chi, 2),
                hd.qi.some(isFinite) ? fmtBig(env().mean(hd.qi.filter(isFinite))) : "n/a",
                hd.free.some(isFinite) ? Math.round(env().mean(hd.free.filter(isFinite))) + "%" : "n/a"
            ];
        },

        ranks: [
            { key: "t1", label: "T₁", unit: "µs", higher: true, digits: 0 },
            { key: "t2", label: "T₂*", unit: "µs", higher: true, digits: 0 },
            { key: "qi", label: "resonator internal Q", unit: "", higher: true, digits: 0 },
            { key: "chi", label: "dispersive shift", unit: "MHz", higher: true, digits: 2 },
            { key: "free", label: "collision-free chips", unit: "%", higher: true, digits: 0 }
        ],

        charts: function (container, batches, theme, colors) {

            const v = env();
            const h = v.h;

            const t1S = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "t1");

                if (!t) { return; }

                const a = v.measureTest(t).reps.filter(function (x) { return x && x.ok; })[0];

                if (a) { t1S.push({ label: v.shortName(b), color: colors[b.id], width: 0, dots: true, x: a.t, y: a.p }); }
            });

            if (t1S.length) {

                const c = h("canvas", { role: "img" });

                D.line(c, { theme: theme, xLabel: "Wait (µs)", yLabel: "Excited population", title: "T₁ decay (chip 1)", yMin: 0, series: t1S });
                container.appendChild(c);
            }

            return [
                { key: "f01", title: "Q1 frequency (mean ± SD)", yLabel: "GHz" },
                { key: "t1", title: "T₁ (mean ± SD)", yLabel: "µs" },
                { key: "t2", title: "T₂* (mean ± SD)", yLabel: "µs" },
                { key: "qi", title: "Resonator internal Q (mean ± SD)", yLabel: "internal Q" },
                { key: "chi", title: "Dispersive shift χ (mean ± SD)", yLabel: "MHz" },
                { key: "free", title: "Chips with no frequency collision", yLabel: "%" }
            ];
        },

        analysis: function (dv) {

            const v = env();
            const out = [];
            const sig = v.sig;

            if (dv.qubits && dv.qubits.length) {

                out.push(v.table(["Qubit", "Kind", "Total capacitance", "Charging energy", "Josephson energy", "Frequency", "Coupling g", "T₁", "Problem"], dv.qubits.map(function (q) {

                    return q.ok ? [q.label, (q.grounded ? "grounded" : "floating") + (q.tunable ? ", tunable (SQUID)" : ""), sig(q.csum, 3) + " fF", Math.round(q.ec * 1000) + " MHz", sig(q.ej, 3) + " GHz", fmtGHz(q.f01), q.g ? Math.round(q.g * 1000) + " MHz" : "none", fmtUs(q.T1), q.warn || ""]
                        : [q.label, "", "", "", "", "", "", "", q.problem];
                })));
            }

            if (dv.resonators && dv.resonators.length) {

                out.push(v.table(["Resonator", "Length", "Frequency", "Coupling to the feedline", "Coupling Q", "Internal Q"], dv.resonators.map(function (r) {

                    return [r.qubit ? "for " + r.qubit : "unassigned", v.fmtLen(r.len), fmtGHz(r.fr), sig(r.ck, 3) + " fF", fmtBig(r.qc), fmtBig(r.qi)];
                })));
            }

            if (dv.junctions && dv.junctions.length) {

                out.push(v.table(["Junction", "Width", "Overlap", "Area", "Resistance (300 K)", "Result"], dv.junctions.map(function (j, k) {

                    return [String(k + 1), sig(j.w * 1000, 3) + " nm", j.overlap > 0 ? sig(j.overlap * 1000, 3) + " nm" : "none", j.area ? sig(j.area * 1e6, 3) + " nm²" : "0", fmtOhm(j.rnRoom), j.ok ? "ok" : j.why];
                })));
            }

            (dv.problems || []).forEach(function (t) { out.push(v.h("p", { className: "lab-note warn", text: t })); });

            return out;
        },

        processExtras: function (panel, d, save) {

            const v = env();
            const h = v.h;

            d.culture = QK.cleanCulture(d.culture);

            const c = d.culture;
            const live = h("div", { className: "lab-report", "aria-live": "polite" });

            const update = function () {

                const ov = QK.shadowOverlap(c);
                const ra = QK.barrierRA(c);
                const area = 0.24 * Math.max(ov, 0);
                const rn = area > 0 ? ra / area : Infinity;

                live.innerHTML = "";
                live.appendChild(h("h2", { text: "What these settings give" }));
                live.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Shadow overlap under the bridge (Dolan)" }), h("strong", { text: ov > 0 ? Math.round(ov * 1000) + " nm" : "none: the junction is open" })]));
                live.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Oxygen exposure" }), h("strong", { text: Math.round(c.p * c.t * 60).toLocaleString("en-US") + " mbar·s" })]));
                live.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Barrier resistance × area" }), h("strong", { text: Math.round(ra) + " Ω·µm²" })]));
                live.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "A 0.24 µm-wide Dolan junction would read" }), h("strong", { text: isFinite(rn) ? (rn / 1000).toFixed(2) + " kΩ, Josephson energy ≈ " + QK.ejOf(rn * QK.COLD_RISE).toFixed(1) + " GHz" : "open" })]));
            };

            const set = function (k, x) { c[k] = x; save(); update(); };

            panel.appendChild(h("p", { className: "lab-hint", text: "A transmon chip is made in a few steps: clean the wafer, deposit the superconducting film and etch the ground plane and circuit into it, write the junctions with an electron beam and make them by shadow evaporation, then add the airbridges. Choose the wafer, the surface preparation and the junction recipe here; the films and patterning are set in the layer cards below." }));

            panel.appendChild(v.selectChoice("Substrate", [{ value: "si", label: "High-resistivity silicon" }, { value: "sapphire", label: "Sapphire" }], c.sub, function (x) { set("sub", x); },
                "Sapphire has slightly lower dielectric loss; silicon suits standard fabs. The substrate's permittivity also sets the resonator and qubit capacitances."));

            panel.appendChild(v.selectChoice("HF dip before the film is deposited", [{ value: "1", label: "Yes: strip the native oxide" }, { value: "0", label: "No" }], String(c.hf), function (x) { set("hf", Number(x)); },
                "Removing the silicon's native oxide just before deposition leaves a cleaner metal–substrate interface with fewer lossy defects."));

            panel.appendChild(h("h2", { className: "lab-h2", text: "Junction recipe (shadow evaporation)" }));

            panel.appendChild(v.slider({ label: "Resist height under the bridge", min: 0.1, max: 1.2, step: 0.01, value: c.h, unit: "µm", onChange: function (x) { set("h", x); } }));
            panel.appendChild(v.slider({ label: "Evaporation angle (each side)", min: 0, max: 45, step: 0.5, value: c.ang, unit: "°", onChange: function (x) { set("ang", x); } }));
            panel.appendChild(v.slider({ label: "Bridge width", min: 0.05, max: 0.4, step: 0.01, value: c.b, unit: "µm", hint: "Overlap = 2 × height × tan(angle) − bridge width. Manhattan junctions ignore these three: their overlap is the line width.", onChange: function (x) { set("b", x); } }));
            panel.appendChild(v.slider({ label: "Oxygen pressure", min: 0.1, max: 100, step: 0.1, value: c.p, unit: "mbar", onChange: function (x) { set("p", x); } }));
            panel.appendChild(v.slider({ label: "Oxidation time", min: 1, max: 60, step: 0.5, value: c.t, unit: "min", hint: "More exposure grows a slightly thicker barrier: the resistance × area rises roughly as the exposure to the power 0.4 (an illustrative calibration).", onChange: function (x) { set("t", x); } }));

            panel.appendChild(live);

            panel.appendChild(h("h2", { className: "lab-h2", text: "Packaging and the fridge" }));

            panel.appendChild(v.selectChoice("Infrared shielding", [{ value: "1", label: "Light-tight shields and IR filters" }, { value: "0", label: "None" }], String(c.shield), function (x) { set("shield", Number(x)); },
                "Stray infrared light breaks Cooper pairs; the quasiparticles it makes steal qubit energy."));

            panel.appendChild(v.selectChoice("Filtering on the lines", [{ value: "std", label: "Standard attenuation" }, { value: "extra", label: "Extra attenuation and filters" }], c.filter, function (x) { set("filter", x); },
                "Thermal photons left in the readout resonator randomly shift the qubit's frequency and shorten T₂."));

            update();
        },

        cleanCulture: function (raw, num) { return QK.cleanCulture(raw, num); },

        designRows: function (d) {

            const c = QK.cleanCulture(d.culture);
            const pads = E.padsOf(d).filter(function (p) { return /^Q\d$/.test(p.label); });
            const nj = d.layers.filter(function (l) { return l.role === "junction"; }).reduce(function (s, l) { return s + l.shapes.length; }, 0);
            const film = d.layers.filter(function (l) { return l.role === "circuit" && l.shapes.length; })[0];

            return [
                ["Qubits (labelled islands)", pads.length ? pads.map(function (p) { return p.label; }).sort().join(", ") : "none yet"],
                ["Josephson junctions", String(nj)],
                ["Film and substrate", (film ? QK.FILMS[film.material].name.split(" (")[0] : "no circuit film") + " on " + QK.SUBSTRATES[c.sub].name.toLowerCase()]
            ];
        },

        batchInfo: function (snap) {

            const c = QK.cleanCulture(snap.culture);
            const film = snap.layers.filter(function (l) { return l.role === "circuit" && l.shapes.length; })[0];

            return (film ? QK.FILMS[film.material].name.split(" (")[0].toLowerCase() : "no film") + " on " + (c.sub === "si" ? "silicon" : "sapphire") + ", oxidised " + c.p + " mbar × " + c.t + " min";
        },

        layerExtras: function (layer, body) {

            const v = env();
            const h = v.h;

            if (layer.role === "groundplane" || layer.role === "circuit") {

                const m = QK.FILMS[layer.material];

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb + " Critical temperature " + m.tc + " K." }));
                body.appendChild(h("p", { className: "lab-hint", text: layer.role === "groundplane" ? "The shapes on this layer are the openings etched into the ground plane. Each line or pad on the circuit layer sits inside an opening, with a gap of bare substrate around it." : "Lines are usually 10 µm wide with 6 µm gaps (50 Ω). Wider gaps put less of the field in the lossy surfaces but take more space." }));

                return true;
            }

            if (layer.role === "junction") {

                const m = QK.JUNCTIONS[layer.material];

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb }));

                return true;
            }

            if (layer.role === "airbridge") {

                body.appendChild(h("p", { className: "lab-muted", text: "Aluminium airbridges, about 3 µm high." }));

                return true;
            }

            return false;
        },

        thicknessRange: function (layer) {

            if (layer.role === "groundplane" || layer.role === "circuit") { return { min: 0.05, max: 0.4, step: 0.01 }; }

            return null;
        }
    };

    K.qubit = impl;

}(typeof window !== "undefined" ? window : globalThis));
