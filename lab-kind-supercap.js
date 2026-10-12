/* ========================================
   LAB KIND: SUPERCAPACITOR

   Everything the lab app needs to know about supercapacitors: which tests
   exist, how a test runs on a fabricated device, how results are drawn,
   what headline numbers feed the comparison, and the process-step extras
   (electrolyte). The app calls these through window.LabKinds.supercap.

   env (window.LabKinds.env) is set by the app and carries shared helpers.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;
    const D = root.SCLabDraw;
    const E = root.LabEngine;

    const K = root.LabKinds = root.LabKinds || {};

    function env() { return K.env; }


    const TESTS = [
        { id: "dmm", name: "Continuity check", blurb: "A multimeter check: is the device shorted, open, or a capacitor?" },
        { id: "cv", name: "Cyclic voltammetry (CV)", blurb: "Sweep the voltage up and down and record the current. A good supercapacitor gives a box shape." },
        { id: "gcd", name: "Charge / discharge (GCD)", blurb: "Push a fixed current in and out. The slope gives capacitance, the jump gives resistance." },
        { id: "eis", name: "Impedance (EIS)", blurb: "Probe with small AC signals from 100 kHz down to 10 mHz. Shows resistance and ion transport." },
        { id: "rate", name: "Rate sweep", blurb: "Repeat CV at faster and faster scan rates to see how capacitance holds up." },
        { id: "ragone", name: "Ragone sweep", blurb: "Charge and discharge at many currents to map energy against power." },
        { id: "cycling", name: "Cycling life", blurb: "Fast-forward thousands of cycles and track how much capacitance is left." }
    ];


    function bodeMag(z) { return z.f.map(function (f, k) { return Math.hypot(z.re[k], z.im[k]); }); }

    function bodePhase(z) { return z.f.map(function (f, k) { return Math.atan2(-z.im[k], z.re[k]) * 180 / Math.PI; }); }

    function nyquistKnee(re, im) {

        let knee = 0;

        for (let k = 0; k < re.length; k++) { if (im[k] <= 1.5 * re[k]) { knee = Math.max(knee, re[k]); } }

        return Math.max(knee, 5);
    }

    function median(a) {

        const s = a.slice().sort(function (x, y) { return x - y; });

        return s.length ? s[Math.floor(s.length / 2)] : 0;
    }


    const impl = {

        id: "supercap",
        tests: function () { return TESTS; },
        defaultTest: "dmm",

        cleanParams: function (q, num) {

            q = q || {};

            return { vMax: num(q.vMax, 0.1, 5, 1), scan: num(q.scan, 1, 1000, 20), j: num(q.j, 0.01, 500, 0.1), cycles: num(q.cycles, 10, 100000, 10000) };
        },

        defaultParams: function (batch, devs) {

            const dev = devs[0];

            return { vMax: Math.round(dev.vMax * 0.9 / 0.05) * 0.05, scan: 20, j: 0.1, cycles: 10000 };
        },

        describeParams: function (t) {

            const p = t.params;

            switch (t.type) {
                case "cv": return p.vMax.toFixed(2) + " V, " + p.scan + " mV/s";
                case "gcd": return p.vMax.toFixed(2) + " V, " + p.j + " mA/cm²";
                case "rate": case "ragone": return p.vMax.toFixed(2) + " V";
                case "cycling": return p.vMax.toFixed(2) + " V, " + p.cycles + " cycles";
                default: return "standard settings";
            }
        },

        paramControls: function (type, params, devs) {

            const v = env();
            const out = [];
            const dev = devs[0];

            if (["cv", "gcd", "rate", "ragone", "cycling"].indexOf(type) >= 0) {

                const vmax = devs.reduce(function (m, x) { return Math.max(m, x.vMax); }, 0.5);

                out.push(v.slider({
                    label: "Operating voltage", min: 0.2, max: Math.round(vmax * 1.2 / 0.05) * 0.05, step: 0.05, value: params.vMax, unit: "V",
                    format: function (x) { return x.toFixed(2); },
                    hint: "This device's stable window is about " + dev.vMax.toFixed(2) + " V. Beyond it the electrolyte or electrode breaks down and the cycle life collapses.",
                    onChange: function (x) { params.vMax = x; }
                }));
            }

            if (type === "cv") { out.push(v.selectField("Scan rate", SC.GRID.scan, params.scan, "mV/s", function (x) { params.scan = x; }, "Slow scans show the true capacitance. Fast scans reveal resistance: the box rounds off and shrinks.")); }
            if (type === "gcd") { out.push(v.selectField("Current density", SC.GRID.current, params.j, "mA/cm²", function (x) { params.j = x; }, "Higher current means a bigger resistive voltage jump at each switch.")); }
            if (type === "cycling") { out.push(v.selectField("Number of cycles", [1000, 5000, 10000, 50000], params.cycles, "cycles", function (x) { params.cycles = x; }, "The simulator fast-forwards. Staying near the top of the voltage window ages the device faster.")); }

            return out;
        },

        measure: function (type, dev, p) {

            switch (type) {

                case "dmm": {

                    let kind = "capacitor";
                    let r = Infinity;

                    if (dev.status === "short") { kind = "short"; r = dev.rShort; }
                    else if (dev.status === "lost") { kind = "open"; }

                    return { kind: kind, r: r, reason: dev.reason };
                }

                case "cv": {

                    const loop = SC.cv(dev, { vMax: p.vMax, scan: p.scan });
                    const c = dev.status === "ok" ? SC.cvCapacitance(loop) : 0;

                    return { loop: loop, C: c, arealC: c / dev.footprint * 1000 };
                }

                case "gcd": {

                    const run = SC.gcd(dev, { vMax: p.vMax, current: p.j * dev.footprint * 1e-3 });

                    return { run: run, m: SC.metricsFromGcd(dev, run) };
                }

                case "eis": {

                    const z = SC.eis(dev, {});

                    let k1 = 0;
                    let best = Infinity;

                    z.f.forEach(function (f, k) { const dd = Math.abs(Math.log10(f) - 3); if (dd < best) { best = dd; k1 = k; } });

                    const last = z.f.length - 1;
                    const cLf = dev.status === "ok" ? 1 / (2 * Math.PI * z.f[last] * z.im[last]) : 0;

                    return { z: z, esr: z.re[k1], cLf: cLf, arealC: cLf / dev.footprint * 1000 };
                }

                case "rate": {

                    const sw = SC.rateSweep(dev, { vMax: p.vMax });
                    const first = sw[0].C;
                    const last = sw[sw.length - 1].C;

                    return { sw: sw, ret: first > 0 ? last / first * 100 : 0, arealC: first / dev.footprint * 1000 };
                }

                case "ragone": {

                    const pts = SC.ragone(dev, { vMax: p.vMax });

                    return { pts: pts, eMax: pts.length ? pts[0].e : 0, pMax: pts.length ? Math.max.apply(null, pts.map(function (q) { return q.p; })) : 0 };
                }

                default: {

                    const cy = SC.cycling(dev, { vMax: p.vMax, cycles: p.cycles });

                    return { cy: cy, ret: cy.retention[cy.retention.length - 1] };
                }
            }
        },

        view: function (container, r, theme, colorIndex) {

            const v = env();
            const h = v.h;
            const col = D.color(colorIndex, theme);
            const type = r.test.type;
            const canvas = h("canvas", { role: "img" });
            const reps = r.reps;
            const alpha = function (k) { return k === 0 ? 1 : 0.45; };
            const pm = v.pm;

            if (type === "dmm") {

                container.appendChild(v.table(["Device", "Reading between the + and − pads"], reps.map(function (x, k) {

                    return ["Device " + (k + 1),
                        x.kind === "short" ? v.sig(x.r) + " Ω (short circuit)" : x.kind === "open" ? "Open circuit (nothing connects)" : "Reads open, charges like a capacitor"];
                })));

                const bad = reps.filter(function (x) { return x.kind !== "capacitor"; }).length;

                container.appendChild(h("p", {
                    className: "lab-note " + (bad ? "warn" : "ok"),
                    text: bad ? bad + " of " + reps.length + " devices failed the check. Open the failure analysis below to see why. A failed device gives garbage in every other test."
                        : "All devices behave like capacitors. That does not prove they are good, only that they are not shorted or open."
                }));

                return;
            }

            if (type === "cv") {

                D.line(canvas, {
                    theme: theme, xLabel: "Voltage (V)", yLabel: "Current (µA)", title: "Cyclic voltammogram at " + r.test.params.scan + " mV/s",
                    series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.loop.v, y: x.loop.i.map(function (i) { return i * 1e6; }) }; })
                });

                container.appendChild(canvas);
                container.appendChild(h("p", { className: "lab-hint", text: "A near-rectangular box means capacitive behaviour. Bumps mean redox (pseudocapacitance). A tilted line means resistance. A thin diagonal line means a short." }));
                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["Capacitance (mF)", pm(reps.map(function (x) { return x.C * 1000; }))],
                    ["Areal capacitance (mF/cm²)", pm(reps.map(function (x) { return x.arealC; }))]
                ]));

                return;
            }

            if (type === "gcd") {

                D.line(canvas, {
                    theme: theme, xLabel: "Time (s)", yLabel: "Voltage (V)", title: "Charge / discharge at " + r.test.params.j + " mA/cm²",
                    series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.run.t, y: x.run.v }; })
                });

                container.appendChild(canvas);
                container.appendChild(h("p", { className: "lab-hint", html: "Capacitance C = I × Δt / ΔV from the discharge slope. The sudden drop when current reverses is the resistance: ESR = V<sub>drop</sub> / 2I." }));
                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["Capacitance (mF)", pm(reps.map(function (x) { return x.m.C * 1000; }))],
                    ["Areal capacitance (mF/cm²)", pm(reps.map(function (x) { return x.m.arealC; }))],
                    ["Series resistance, ESR (Ω)", pm(reps.map(function (x) { return x.m.esr; }))],
                    ["Coulombic efficiency", pm(reps.map(function (x) { return x.m.eff * 100; }), 1) + " %"],
                    ["Energy (µWh/cm²)", pm(reps.map(function (x) { return x.m.energyAreal; }))],
                    ["Max power (mW/cm²)", pm(reps.map(function (x) { return x.m.powerAreal; }))]
                ]));

                if (reps.some(function (x) { return x.run.failed; })) { container.appendChild(h("p", { className: "lab-note warn", text: "At least one device did not charge properly. Run the continuity check to see why." })); }

                return;
            }

            if (type === "eis") {

                const xMax = 2.5 * median(reps.map(function (x) { return nyquistKnee(x.z.re, x.z.im); }));

                D.line(canvas, {
                    theme: theme, xLabel: "Z′, real (Ω)", yLabel: "−Z″, imaginary (Ω)", title: "Nyquist plot, 100 kHz to 10 mHz",
                    equal: true, xMin: 0, yMin: 0, xMax: xMax,
                    series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2 : 1.2, dots: k === 0, x: x.z.re, y: x.z.im }; })
                });

                container.appendChild(canvas);
                container.appendChild(h("p", { className: "lab-hint", text: "Left intercept: series resistance. A semicircle: charge transfer. The 45° slope: ions diffusing into pores. The steep rise: ideal capacitor. The view is zoomed on the high-frequency end." }));

                const bodeA = h("canvas", { role: "img" });
                const bodeB = h("canvas", { role: "img" });

                D.line(bodeA, {
                    theme: theme, xLabel: "Frequency (Hz)", yLabel: "|Z|, impedance magnitude (Ω)", xLog: true, yLog: true, title: "Bode plot: magnitude",
                    series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.z.f, y: bodeMag(x.z) }; })
                });

                D.line(bodeB, {
                    theme: theme, xLabel: "Frequency (Hz)", yLabel: "Phase angle (°)", xLog: true, yMin: -95, yMax: 5, title: "Bode plot: phase",
                    series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.z.f, y: bodePhase(x.z) }; })
                });

                container.appendChild(h("div", { className: "lab-charts" }, [bodeA, bodeB]));
                container.appendChild(h("p", { className: "lab-hint", text: "Bode plots show the same data against frequency. The magnitude is flat at the series resistance, then rises as frequency falls. The phase goes from 0° (a resistor) toward −90° (an ideal capacitor). The frequency where the phase crosses −45° is the knee: the device acts like a capacitor below it and like a resistor above it." }));

                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["Resistance at 1 kHz (Ω)", pm(reps.map(function (x) { return x.esr; }))],
                    ["Capacitance at 10 mHz (mF)", pm(reps.map(function (x) { return x.cLf * 1000; }))]
                ]));

                return;
            }

            if (type === "rate") {

                D.line(canvas, {
                    theme: theme, xLabel: "Scan rate (mV/s)", yLabel: "Capacitance (mF)", xLog: true, yMin: 0, title: "Rate capability",
                    series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, dots: k === 0, x: x.sw.map(function (q) { return q.scan; }), y: x.sw.map(function (q) { return q.C * 1000; }) }; })
                });

                container.appendChild(canvas);
                container.appendChild(v.table(["Metric", "Mean ± spread"], [["Capacitance kept at 1000 mV/s vs 1 mV/s", pm(reps.map(function (x) { return x.ret; }), 0) + " %"]]));
                container.appendChild(h("p", { className: "lab-hint", text: "If the curve drops at fast scans, resistance (in the electrodes, the collectors or the gaps) is stopping the device charging in time." }));

                return;
            }

            if (type === "ragone") {

                D.line(canvas, {
                    theme: theme, xLabel: "Power density (mW/cm²)", yLabel: "Energy density (µWh/cm²)", xLog: true, yLog: true, title: "Ragone plot",
                    series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, dots: k === 0, x: x.pts.map(function (q) { return q.p; }), y: x.pts.map(function (q) { return q.e; }) }; })
                });

                container.appendChild(canvas);
                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["Energy at low power (µWh/cm²)", pm(reps.map(function (x) { return x.eMax; }))],
                    ["Highest power reached (mW/cm²)", pm(reps.map(function (x) { return x.pMax; }))]
                ]));
                container.appendChild(h("p", { className: "lab-hint", text: "Up and to the right is better: more energy and more power. Good designs hold their energy as power rises." }));

                return;
            }

            D.line(canvas, {
                theme: theme, xLabel: "Cycles", yLabel: "Capacitance retained (%)", xLog: true, yMin: 0, yMax: 105, title: "Cycling stability",
                series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.cy.n.slice(1), y: x.cy.retention.slice(1) }; })
            });

            container.appendChild(canvas);
            container.appendChild(v.table(["Metric", "Mean ± spread"], [["Capacitance retained after " + r.test.params.cycles + " cycles (%)", pm(reps.map(function (x) { return x.ret; }), 0)]]));

            if (r.test.params.vMax > v.devicesOf(r.batch)[0].vMax) { container.appendChild(h("p", { className: "lab-note warn", text: "You ran above the stable voltage window, which breaks things down quickly." })); }
        },

        headline: function (batch) {

            const v = env();
            const out = { arealC: null, esr: null, ret: null, eMax: null, pMax: null, rate: null };

            const gcdT = v.lastTest(batch.id, "gcd");
            const cvT = v.lastTest(batch.id, "cv");
            const eisT = v.lastTest(batch.id, "eis");
            const cyT = v.lastTest(batch.id, "cycling");
            const raT = v.lastTest(batch.id, "ragone");
            const rtT = v.lastTest(batch.id, "rate");

            if (gcdT) { out.arealC = v.measureTest(gcdT).reps.map(function (x) { return x.m.arealC; }); }
            else if (cvT) { out.arealC = v.measureTest(cvT).reps.map(function (x) { return x.arealC; }); }
            else if (eisT) { out.arealC = v.measureTest(eisT).reps.map(function (x) { return x.arealC; }); }

            if (eisT) { out.esr = v.measureTest(eisT).reps.map(function (x) { return x.esr; }); }
            else if (gcdT) { out.esr = v.measureTest(gcdT).reps.map(function (x) { return x.m.esr; }); }

            if (cyT) { out.ret = v.measureTest(cyT).reps.map(function (x) { return x.ret; }); }
            if (rtT) { out.rate = v.measureTest(rtT).reps.map(function (x) { return x.ret; }); }

            if (raT) {

                const r = v.measureTest(raT);

                out.eMax = r.reps.map(function (x) { return x.eMax; });
                out.pMax = r.reps.map(function (x) { return x.pMax; });
            }

            return out;
        },

        tableHead: ["Areal C (mF/cm²)", "ESR (Ω)", "Energy (µWh/cm²)", "Power (mW/cm²)", "Retention (%)"],

        tableRow: function (hd) {

            const pm = env().pm;

            return [
                hd.arealC ? pm(hd.arealC) : "not tested",
                hd.esr ? pm(hd.esr) : "not tested",
                hd.eMax ? pm(hd.eMax) : "not tested",
                hd.pMax ? pm(hd.pMax) : "not tested",
                hd.ret ? pm(hd.ret, 0) : "not tested"
            ];
        },

        ranks: [
            { key: "arealC", label: "areal capacitance", unit: "mF/cm²", higher: true },
            { key: "esr", label: "series resistance", unit: "Ω", higher: false },
            { key: "eMax", label: "energy density", unit: "µWh/cm²", higher: true },
            { key: "pMax", label: "peak power", unit: "mW/cm²", higher: true },
            { key: "ret", label: "capacity retention", unit: "%", higher: true, digits: 0 }
        ],

        charts: function (container, batches, theme, colors) {

            const v = env();
            const h = v.h;
            const mean = v.mean;

            const mk = function (cfg, fn) { const c = h("canvas", { role: "img" }); fn(c, cfg); container.appendChild(c); };

            const cvSeries = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "cv");

                if (!t) { return; }

                const r = v.measureTest(t);
                const n = Math.min.apply(null, r.reps.map(function (x) { return x.loop.i.length; }));
                const i = [];

                for (let k = 0; k < n; k++) { i.push(mean(r.reps.map(function (x) { return x.loop.i[k]; })) * 1e6); }

                cvSeries.push({ label: v.shortName(b), color: colors[b.id], x: r.reps[0].loop.v.slice(0, n), y: i, width: 2.2 });
            });

            if (cvSeries.length) { mk({ theme: theme, xLabel: "Voltage (V)", yLabel: "Current (µA)", title: "Cyclic voltammetry (mean of devices)", series: cvSeries }, D.line); }

            const zSeries = [];
            const knees = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "eis");

                if (!t) { return; }

                const r = v.measureTest(t);
                const n = r.reps[0].z.f.length;
                const re = [];
                const im = [];

                for (let k = 0; k < n; k++) { re.push(mean(r.reps.map(function (x) { return x.z.re[k]; }))); im.push(mean(r.reps.map(function (x) { return x.z.im[k]; }))); }

                knees.push(nyquistKnee(re, im));
                zSeries.push({ label: v.shortName(b), color: colors[b.id], x: re, y: im, width: 2 });
            });

            if (zSeries.length) {

                mk({ theme: theme, xLabel: "Z′, real (Ω)", yLabel: "−Z″, imaginary (Ω)", title: "Nyquist plot (mean of devices)", equal: true, xMin: 0, yMin: 0, xMax: 2.5 * median(knees), series: zSeries }, D.line);
            }

            const bmSeries = [];
            const bpSeries = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "eis");

                if (!t) { return; }

                const r = v.measureTest(t);
                const n = r.reps[0].z.f.length;
                const mag = [];
                const ph = [];

                for (let k = 0; k < n; k++) {

                    mag.push(mean(r.reps.map(function (x) { return Math.hypot(x.z.re[k], x.z.im[k]); })));
                    ph.push(mean(r.reps.map(function (x) { return Math.atan2(-x.z.im[k], x.z.re[k]) * 180 / Math.PI; })));
                }

                bmSeries.push({ label: v.shortName(b), color: colors[b.id], x: r.reps[0].z.f, y: mag, width: 2 });
                bpSeries.push({ label: v.shortName(b), color: colors[b.id], x: r.reps[0].z.f, y: ph, width: 2 });
            });

            if (bmSeries.length) {

                mk({ theme: theme, xLabel: "Frequency (Hz)", yLabel: "|Z| (Ω)", xLog: true, yLog: true, title: "Bode plot: magnitude (mean of devices)", series: bmSeries }, D.line);
                mk({ theme: theme, xLabel: "Frequency (Hz)", yLabel: "Phase angle (°)", xLog: true, yMin: -95, yMax: 5, title: "Bode plot: phase (mean of devices)", series: bpSeries }, D.line);
            }

            const rgSeries = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "ragone");

                if (!t) { return; }

                const r = v.measureTest(t);
                const n = Math.min.apply(null, r.reps.map(function (x) { return x.pts.length; }));

                if (!n) { return; }

                const px = [];
                const py = [];

                for (let k = 0; k < n; k++) { px.push(mean(r.reps.map(function (x) { return x.pts[k].p; }))); py.push(mean(r.reps.map(function (x) { return x.pts[k].e; }))); }

                rgSeries.push({ label: v.shortName(b), color: colors[b.id], x: px, y: py, dots: true, width: 2 });
            });

            if (rgSeries.length) { mk({ theme: theme, xLabel: "Power density (mW/cm²)", yLabel: "Energy density (µWh/cm²)", xLog: true, yLog: true, title: "Ragone plot (mean of devices)", series: rgSeries }, D.line); }

            const cySeries = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "cycling");

                if (!t) { return; }

                const r = v.measureTest(t);
                const y = [];

                for (let k = 1; k < r.reps[0].cy.n.length; k++) { y.push(mean(r.reps.map(function (x) { return x.cy.retention[k]; }))); }

                cySeries.push({ label: v.shortName(b), color: colors[b.id], x: r.reps[0].cy.n.slice(1), y: y, width: 2 });
            });

            if (cySeries.length) { mk({ theme: theme, xLabel: "Cycles", yLabel: "Capacitance retained (%)", xLog: true, yMin: 0, yMax: 105, title: "Cycling stability (mean of devices)", series: cySeries }, D.line); }

            return [
                { key: "arealC", title: "Areal capacitance (mean ± SD)", yLabel: "mF/cm²" },
                { key: "esr", title: "Series resistance (mean ± SD)", yLabel: "Ω" },
                { key: "ret", title: "Capacitance kept after cycling (mean ± SD)", yLabel: "%" },
                { key: "eMax", title: "Energy density (mean ± SD)", yLabel: "µWh/cm²" }
            ];
        },

        analysis: function (dv, inf) {

            const v = env();
            const out = [];

            if (inf.parts) {

                const p = inf.parts;

                out.push(v.table(["What limits it", "Value"], [
                    ["Contact resistance", v.sig(p.rContact) + " Ω"],
                    ["Current-collecting resistance, + electrode", v.sig(p.rPlus) + " Ω"],
                    ["Current-collecting resistance, − electrode", v.sig(p.rMinus) + " Ω"],
                    ["Ion path across the gap", v.sig(p.rGap) + " Ω"],
                    ["Ions moving into the film", v.sig(p.rPore / 3) + " Ω"],
                    ["Exposed + / − electrode area", v.fmtArea(inf.areaPlus) + " / " + v.fmtArea(inf.areaMinus)],
                    ["Narrowest electrode gap", v.fmtLen(inf.gapMin)],
                    ["Chance of a short (defects, residue, pinholes)", Math.round(inf.pShort * 100) + "%"]
                ]));
            }

            return out;
        },

        // Process step: the electrolyte lives with the design.
        processExtras: function (panel, d, save) {

            const v = env();

            panel.appendChild(v.h("h2", { className: "lab-h2", text: "Electrolyte" }));

            panel.appendChild(v.cards({
                label: "Electrolyte",
                items: Object.keys(SC.ELECTROLYTES).map(function (id) {

                    const e = SC.ELECTROLYTES[id];

                    return { id: id, title: e.name, body: e.blurb, meta: "Voltage window up to " + e.vMax + " V" };
                }),
                value: d.electrolyte,
                onChange: function (id) { d.electrolyte = id; save(); }
            }));
        },

        // Extra rows in the layer card (material information).
        layerExtras: function (layer, body, d, refresh) {

            const v = env();
            const h = v.h;

            if (layer.role !== "electrode") { return false; }

            body.appendChild(h("p", { className: "lab-muted", text: SC.MATERIALS[layer.material].name + " · " + SC.MATERIALS[layer.material].blurb }));

            const tr = h("select", { className: "lab-select", "aria-label": "Treatment for " + layer.name, onchange: function (e) { layer.treat = e.target.value; refresh(); } },
                Object.keys(SC.TREATMENTS).map(function (id) { return h("option", { value: id, text: SC.TREATMENTS[id].name }); }));

            tr.value = layer.treat;

            body.appendChild(h("label", { className: "lab-label block", text: "Make it conductive" }));
            body.appendChild(tr);

            const info = h("div", { className: "lab-notes" });

            const showMat = function () {

                info.innerHTML = "";

                const r = SC.processMaterial({ mat: layer.material, treat: layer.treat, collector: false, tFilm: layer.thickness }, SC.ELECTROLYTES[d.electrolyte]);

                info.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Film conductivity" }), h("strong", { text: r.sigma >= 1000 ? v.sig(r.sigma / 1000) + " kS/m" : v.sig(r.sigma) + " S/m" })]));
                info.appendChild(h("div", { className: "lab-row" }, [h("span", { text: "Pseudocapacitance" }), h("strong", { text: r.pseudo > 0 ? v.sig(r.pseudo) + " F/g" : "none" })]));

                r.notes.forEach(function (n) { info.appendChild(h("p", { className: "lab-note warn", text: n })); });
            };

            tr.addEventListener("change", showMat);
            showMat();

            body.appendChild(info);

            return true;
        },

        sampleVoltage: true
    };

    K.supercap = impl;

}(typeof window !== "undefined" ? window : globalThis));
