/* ========================================
   LAB KIND: FET AND BIOFET

   Tests, charts, comparison metrics and process extras for the
   "fet" (MOSFET / thin-film transistor) and "biofet" (liquid-gated
   sensor) kinds. One implementation serves both; the BioFET also has
   the sensing and redox tests and a choice of solution.

   Needs window.LabFET (lab-fet-model.js) and window.LabKinds.env.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;
    const D = root.SCLabDraw;
    const E = root.LabEngine;
    const F = root.LabFET;

    const K = root.LabKinds = root.LabKinds || {};

    function env() { return K.env; }


    const TESTS_FET = [
        { id: "dmm", name: "Continuity check", blurb: "Is source-to-drain resistance sensible, and is the gate leaking?" },
        { id: "transfer", name: "Transfer curve (Iᴅ vs Vɢ)", blurb: "Sweep the gate and read the drain current. Gives threshold, mobility, subthreshold swing and on/off ratio." },
        { id: "output", name: "Output curves (Iᴅ vs Vᴅ)", blurb: "Sweep the drain at several gate voltages: the linear region and where the current saturates." },
        { id: "stress", name: "Stability (bias stress)", blurb: "Hold the gate on and watch the threshold drift as charge gets trapped." }
    ];

    const TESTS_BIO = [
        TESTS_FET[0],
        TESTS_FET[1],
        TESTS_FET[2],
        { id: "sense", name: "Sensing titration", blurb: "Add more and more analyte and track the shift of the transfer curve. Shows sensitivity, noise, detection limit and Debye screening." },
        { id: "stress", name: "Stability (drift in solution)", blurb: "Leave the device in the solution and watch the baseline drift." },
        { id: "redox", name: "Redox voltammetry (exposed metal)", blurb: "A voltammogram of the ferri/ferrocyanide couple at any metal the solution can touch." }
    ];


    function sigOf(dev) { return dev.type === "p" ? -1 : 1; }

    function fmtOhm(v) {

        const sig = env().sig;

        if (!isFinite(v)) { return "open"; }
        if (v >= 1e9) { return sig(v / 1e9) + " GΩ"; }
        if (v >= 1e6) { return sig(v / 1e6) + " MΩ"; }
        if (v >= 1e3) { return sig(v / 1e3) + " kΩ"; }

        return sig(v) + " Ω";
    }


    function numOr(q, key, lo, hi, def, num) { return num(q[key], lo, hi, def); }

    function choice(v, list, def) { return list.indexOf(v) >= 0 ? v : def; }


    const impl = {

        id: "fet",

        testLead: "A parameter analyser sets voltages on the gate and drain and measures the currents, like the bench instruments in a real lab. Start with the continuity check, then take a transfer curve to read off threshold, mobility and on/off ratio. Each test runs on every device in the batch.",

        tests: function (kind) { return kind === "biofet" ? TESTS_BIO : TESTS_FET; },
        defaultTest: "dmm",

        cleanParams: function (q, num) {

            q = q || {};

            return {
                mode: choice(q.mode, ["solid", "liquid"], "solid"),
                sol: choice(q.sol, Object.keys(F.SOLUTIONS), "pbs"),
                vd: numOr(q, "vd", 0.01, 5, 0.1, num),
                span: numOr(q, "span", 0.1, 30, 5, num),
                vdMax: numOr(q, "vdMax", 0.1, 10, 3, num),
                vov: numOr(q, "vov", 0.05, 10, 2, num),
                analyte: choice(q.analyte, Object.keys(F.ANALYTES), "ph"),
                scan: numOr(q, "scan", 1, 2000, 100, num),
                stressV: numOr(q, "stressV", 0, 30, 5, num)
            };
        },

        defaultParams: function (batch, devs) {

            const bio = batch.kind === "biofet";

            return {
                mode: bio ? "liquid" : "solid", sol: "pbs", vd: 0.1, span: bio ? 0.6 : 5, vdMax: bio ? 0.5 : 3, vov: bio ? 0.3 : 2,
                analyte: "ph", scan: 100, stressV: 5
            };
        },

        describeParams: function (t) {

            const p = t.params;
            const solName = (F.SOLUTIONS[p.sol] || {}).name || p.sol;

            switch (t.type) {
                case "transfer": return (p.mode === "liquid" ? "liquid gate, " + solName : "dry") + ", Vᴅ = " + p.vd + " V, ±" + p.span + " V";
                case "output": return (p.mode === "liquid" ? "liquid gate, " + solName : "dry") + ", to " + p.vdMax + " V";
                case "sense": return (F.ANALYTES[p.analyte] || {}).name + " in " + solName;
                case "stress": return p.mode === "liquid" ? "in " + solName : "stress at " + p.stressV + " V";
                case "redox": return p.scan + " mV/s in " + solName;
                default: return "standard settings";
            }
        },

        paramControls: function (type, params, devs, kind) {

            const v = env();
            const out = [];
            const bio = kind === "biofet";

            const solOptions = Object.keys(F.SOLUTIONS).map(function (k) { return { value: k, label: F.SOLUTIONS[k].name }; });

            const modeControl = function () {

                if (!bio) { params.mode = "solid"; return; }

                out.push(v.selectChoice("Gate", [
                    { value: "liquid", label: F.GATE_MODES.liquid.name },
                    { value: "solid", label: F.GATE_MODES.solid.name }
                ], params.mode, function (x) { params.mode = x; v.refreshParams(); },
                "Liquid gating uses the solution and a reference electrode, so it works at a fraction of a volt. Dry (solid) gating needs a drawn gate under a dielectric."));

                if (params.mode === "liquid") {

                    out.push(v.selectChoice("Solution", solOptions, params.sol, function (x) { params.sol = x; },
                        (F.SOLUTIONS[params.sol] || {}).blurb));
                }
            };

            if (type === "transfer") {

                modeControl();

                out.push(v.selectField("Drain voltage", [0.05, 0.1, 0.5, 1, 2], params.vd, "V", function (x) { params.vd = x; },
                    "A small drain voltage (linear regime) is the right place to read mobility. A larger one shows saturation. (The sign flips automatically for p-type channels.)"));

                const spans = params.mode === "liquid" ? [0.3, 0.5, 0.6, 0.8, 1, 1.3] : [1, 2, 3, 5, 8, 12, 20];

                if (spans.indexOf(params.span) < 0) { params.span = spans[Math.floor(spans.length / 2)]; }

                out.push(v.selectField("Gate sweep range", spans, params.span, "V (±)", function (x) { params.span = x; },
                    params.mode === "liquid" ? "Beyond about ±1.1 V water starts to split and the gate current explodes." :
                        "Too far and the dielectric breaks down. Its breakdown field is in the failure analysis."));
            }

            if (type === "output") {

                modeControl();

                out.push(v.selectField("Largest drain voltage", params.mode === "liquid" ? [0.1, 0.2, 0.3, 0.5, 0.8] : [0.5, 1, 2, 3, 5, 8], params.vdMax, "V", function (x) { params.vdMax = x; }, ""));
                out.push(v.selectField("Gate overdrive (top curve)", params.mode === "liquid" ? [0.1, 0.2, 0.3, 0.5, 0.8] : [0.5, 1, 2, 3, 5], params.vov, "V", function (x) { params.vov = x; },
                    "The curves step from the threshold up to this much beyond it."));
            }

            if (type === "sense") {

                if (!bio) { return out; }

                out.push(v.selectChoice("Analyte", Object.keys(F.ANALYTES).map(function (k) { return { value: k, label: F.ANALYTES[k].name }; }), params.analyte,
                    function (x) { params.analyte = x; v.refreshParams(); }, (F.ANALYTES[params.analyte] || {}).blurb));

                out.push(v.selectChoice("Solution", solOptions, params.sol, function (x) { params.sol = x; v.refreshParams(); },
                    (F.SOLUTIONS[params.sol] || {}).blurb));
            }

            if (type === "stress") {

                modeControl();

                if (params.mode === "solid") {

                    out.push(v.selectField("Gate stress", [2, 4, 6, 8, 10], params.stressV, "V", function (x) { params.stressV = x; },
                        "Charge trapping grows with the electric field across the dielectric."));
                }
            }

            if (type === "redox") {

                out.push(v.selectChoice("Solution", solOptions, params.sol, function (x) { params.sol = x; },
                    "Only the ferri/ferrocyanide solution has a redox couple to measure. In plain PBS you only see charging current."));
                out.push(v.selectField("Scan rate", [10, 50, 100, 500, 1000], params.scan, "mV/s", function (x) { params.scan = x; }, "Peak current grows with the square root of the scan rate."));
            }

            return out;
        },

        measure: function (type, dev, p) {

            const sgn = sigOf(dev);

            switch (type) {

                case "dmm": return F.continuity(dev);

                case "transfer": {

                    const t = F.transfer(dev, { mode: p.mode, sol: p.sol, vd: sgn * p.vd, vMin: -p.span, vMax: p.span });
                    const back = dev.status === "ok" ? F.extract(dev, t.vg, t.idB, sgn * p.vd, t.ctx) : { vt: NaN };

                    return { t: t, ex: t.extract, hys: isFinite(back.vt) && isFinite(t.extract.vt) ? Math.abs(back.vt - t.extract.vt) * 1000 : NaN };
                }

                case "output": {

                    let vgs = [1, 2, 3, 4, 5];

                    if (dev.status === "ok") {

                        const c = F.context(dev, p.mode, p.sol);
                        const dir = dev.type === "p" ? -1 : 1;

                        vgs = [1, 2, 3, 4, 5].map(function (k) { return c.vt + dir * k * p.vov / 5; });
                    }

                    const o = F.output(dev, { mode: p.mode, sol: p.sol, vdMax: p.vdMax, vgs: vgs });

                    return { o: o, imax: o.curves.map(function (c) { return c.id[c.id.length - 1]; }) };
                }

                case "sense": return { s: F.sense(dev, { analyte: p.analyte, sol: p.sol }) };

                case "stress": return { st: F.stress(dev, { mode: p.mode, sol: p.sol, stressV: p.stressV }) };

                default: return { cv: F.redoxCV(dev, { scan: p.scan, sol: p.sol }) };
            }
        },

        view: function (container, r, theme, colorIndex) {

            const v = env();
            const h = v.h;
            const pm = v.pm;
            const col = D.color(colorIndex, theme);
            const type = r.test.type;
            const reps = r.reps;
            const p = r.test.params;
            const alpha = function (k) { return k === 0 ? 1 : 0.45; };
            const devs = v.devicesOf(r.batch);

            const bad = devs.filter(function (d) { return d.status !== "ok"; }).length;

            const warnBad = function () {

                if (bad) { container.appendChild(h("p", { className: "lab-note warn", text: bad + " of " + devs.length + " devices do not work (short, open or broken). Their curves are not real transistor curves. Open the failure analysis to see why." })); }
            };

            if (type === "dmm") {

                container.appendChild(v.table(["Device", "Source to drain at Vɢ = 0, 0.1 V", "Gate to channel"], reps.map(function (x, k) {

                    return ["Device " + (k + 1),
                        x.kind === "short" ? fmtOhm(x.rsd) + " (short circuit)" : x.kind === "open" ? "Open circuit (nothing connects)" : isFinite(x.rsd) ? fmtOhm(x.rsd) + " with the gate at 0 V" : "n/a",
                        x.kind === "gateleak" ? fmtOhm(x.rg) + " (the gate leaks)" : "insulating"];
                })));

                container.appendChild(h("p", {
                    className: "lab-note " + (reps.some(function (x) { return x.kind === "short" || x.kind === "open" || x.kind === "gateleak"; }) ? "warn" : "ok"),
                    text: reps.some(function (x) { return x.kind !== "ok"; }) ? "At least one device has a fault. Open the failure analysis below for the cause." :
                        "Source to drain is high resistance with the gate at zero (a transistor that is mostly off), and the gate is insulated. That is what you want to see."
                }));

                return;
            }

            if (type === "transfer") {

                const lin = h("canvas", { role: "img" });
                const lg = h("canvas", { role: "img" });

                const abs = function (a) { return a.map(function (x) { return Math.abs(x); }); };

                D.line(lin, {
                    theme: theme, xLabel: "Gate voltage (V)", yLabel: "|Drain current| (µA)", title: "Transfer curve, linear",
                    series: [].concat.apply([], reps.map(function (x, k) {

                        return [
                            { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.3, x: x.t.vg, y: abs(x.t.idF).map(function (i) { return i * 1e6; }) },
                            { color: col, alpha: alpha(k) * 0.7, width: 1.3, dash: [5, 4], x: x.t.vg, y: abs(x.t.idB).map(function (i) { return i * 1e6; }) }
                        ];
                    }))
                });

                D.line(lg, {
                    theme: theme, xLabel: "Gate voltage (V)", yLabel: "Current (A)", yLog: true, title: "Transfer curve, log scale (dotted: gate current)",
                    series: [].concat.apply([], reps.map(function (x, k) {

                        return [
                            { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.3, x: x.t.vg, y: abs(x.t.idF).map(function (i) { return Math.max(i, 1e-16); }) },
                            { color: col, alpha: alpha(k) * 0.55, width: 1.2, dash: [2, 3], x: x.t.vg, y: abs(x.t.ig).map(function (i) { return Math.max(i, 1e-16); }) }
                        ];
                    }))
                });

                container.appendChild(h("div", { className: "lab-charts" }, [lin, lg]));

                const gsol = reps[0].t.mode === "liquid" ? " The device was measured with the solution as the gate; the Debye layer is the gate capacitor (about " + v.sig(F.cdl(reps[0].t.sol) * 100) + " µF/cm²)." : "";

                container.appendChild(h("p", { className: "lab-hint", text: "Solid line: gate sweeping up. Dashed: sweeping back. The gap between them is hysteresis from trapped charge. The log plot shows the off-state, where the gate current (dotted) must stay far below the drain current." + gsol }));

                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["Threshold voltage, linear extrapolation (V)", pm(reps.map(function (x) { return x.ex.vt; }))],
                    ["Field-effect mobility (cm²/V·s)", pm(reps.map(function (x) { return x.ex.mu; }))],
                    ["Subthreshold swing (mV/decade)", pm(reps.map(function (x) { return x.ex.ss; }), 0)],
                    ["On/off ratio", pm(reps.map(function (x) { return x.ex.onoff; }), 0)],
                    ["On current (µA)", pm(reps.map(function (x) { return x.ex.ion * 1e6; }))],
                    ["Off current (pA)", pm(reps.map(function (x) { return x.ex.ioff * 1e12; }))],
                    ["Peak transconductance (µS)", pm(reps.map(function (x) { return x.ex.gm * 1e6; }))],
                    ["Hysteresis, forward vs back (mV)", pm(reps.map(function (x) { return x.hys; }), 0)]
                ]));

                warnBad();

                return;
            }

            if (type === "output") {

                const cv = h("canvas", { role: "img" });
                const o0 = reps[0].o;

                D.line(cv, {
                    theme: theme, xLabel: "Drain voltage magnitude (V)", yLabel: "|Drain current| (µA)", title: "Output curves (device 1)",
                    series: o0.curves.map(function (c, k) {

                        return { label: "Vɢ = " + c.vg.toFixed(2) + " V", color: D.color(k, theme), width: 2, x: o0.vd, y: c.id.map(function (i) { return Math.abs(i) * 1e6; }) };
                    })
                });

                container.appendChild(cv);
                container.appendChild(h("p", { className: "lab-hint", text: "At small drain voltage the current rises in a straight line (a gated resistor). Then the channel pinches off and the current flattens: saturation. Series resistance in the contacts bends the first part of each curve." }));
                container.appendChild(v.table(["Gate voltage (V)", "Current at the largest Vᴅ (µA)"], o0.curves.map(function (c, k) {

                    return [c.vg.toFixed(2), pm(reps.map(function (x) { return Math.abs(x.imax[k]) * 1e6; }))];
                })));

                warnBad();

                return;
            }

            if (type === "sense") {

                const cv = h("canvas", { role: "img" });
                const s0 = reps[0].s;
                const an = s0.an;

                D.line(cv, {
                    theme: theme, xLabel: an.log ? "Concentration (" + an.unit + ")" : "pH", yLabel: "Threshold shift (mV)", xLog: an.log, title: "Sensing response to " + an.name,
                    series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, dots: true, x: x.s.x, y: x.s.dvt }; })
                });

                container.appendChild(cv);

                container.appendChild(h("p", { className: "lab-hint", text: "Each point is the shift of the transfer curve at that concentration, as read from the device. The scatter is the device noise: any signal below about three times the noise cannot be told apart from nothing." }));

                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["Sensitivity (mV per " + (an.log ? "decade" : "pH unit") + ")", pm(reps.map(function (x) { return x.s.sensitivity || 0; }))],
                    ["Noise (mV)", pm(reps.map(function (x) { return x.s.sigmaMv; }))],
                    ["Detection limit (" + an.unit + ")", reps.map(function (x) { return x.s.lod; }).some(function (x) { return x !== null && x !== undefined; }) ?
                        pm(reps.map(function (x) { return x.s.lod; }).filter(function (x) { return x !== null && x !== undefined; }), 2) : "no signal above noise"],
                    ["Debye length in this solution (nm)", v.sig(s0.lam || 0)],
                    ["How much of the charge is felt (receptor height screening)", s0.screen !== undefined ? Math.round(s0.screen * 1000) / 10 + " %" : "n/a"]
                ]));

                s0.notes.forEach(function (n) { container.appendChild(h("p", { className: "lab-note warn", text: n })); });

                container.appendChild(h("p", { className: "lab-hint", text: "Try the same titration in 0.01× PBS and in 1× PBS. Salt screens charge beyond the Debye length, so a tall receptor in strong salt hears almost nothing." }));

                warnBad();

                return;
            }

            if (type === "stress") {

                const cv = h("canvas", { role: "img" });

                D.line(cv, {
                    theme: theme, xLabel: "Time (s)", yLabel: "Threshold shift (mV)", xLog: true, title: p.mode === "liquid" ? "Baseline drift in solution" : "Bias-stress threshold shift",
                    series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.st.t, y: x.st.dvt }; })
                });

                container.appendChild(cv);

                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["Shift after 10 000 s (mV)", pm(reps.map(function (x) { return x.st.dvt[x.st.dvt.length - 1]; }))]
                ]));

                container.appendChild(h("p", { className: "lab-hint", text: p.mode === "liquid" ?
                    "In solution, ions and water slowly move into the surface. A stable dielectric or a water-stable channel drifts less. Drift looks like a signal, so a sensor needs it far smaller than the signal it measures." :
                    "Charge trapped in the dielectric or at its interface shifts the threshold. Higher fields and more trap states shift it more." }));

                return;
            }

            // redox voltammetry
            const cv = h("canvas", { role: "img" });

            D.line(cv, {
                theme: theme, xLabel: "Potential (V, versus the reference)", yLabel: "Current (nA)", title: "Cyclic voltammogram on the exposed metal, " + p.scan + " mV/s",
                series: reps.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.cv.e, y: x.cv.i.map(function (i) { return i * 1e9; }) }; })
            });

            container.appendChild(cv);

            const peaks = reps.map(function (x) {

                const ip = Math.max.apply(null, x.cv.i);
                const ic = Math.min.apply(null, x.cv.i);

                return { ip: ip * 1e9, ic: ic * 1e9, de: (x.cv.e[x.cv.i.indexOf(ip)] - x.cv.e[x.cv.i.indexOf(ic)]) * 1000, area: x.cv.area * 1e8 };
            });

            container.appendChild(v.table(["Metric", "Mean ± spread"], [
                ["Anodic peak current (nA)", pm(peaks.map(function (x) { return x.ip; }))],
                ["Peak separation (mV)", pm(peaks.map(function (x) { return x.de; }), 0)],
                ["Exposed metal area (µm²)", pm(peaks.map(function (x) { return x.area; }), 0)]
            ]));

            container.appendChild(h("p", { className: "lab-hint", text: "A reversible one-electron couple shows peaks about 59 mV apart, and the peak current scales with the exposed metal area. More exposed metal means a bigger signal here but also more leakage and noise for the transistor. In plain PBS there is no redox couple, so you only see charging current." }));

            if (!(F.SOLUTIONS[p.sol] || {}).redox) { container.appendChild(h("p", { className: "lab-note warn", text: "This solution has no redox couple, so there are no peaks. Choose the ferri/ferrocyanide solution." })); }

            warnBad();
        },

        headline: function (batch) {

            const v = env();
            const out = { vt: null, mu: null, ss: null, lonoff: null, ion: null, sens: null };

            const trT = v.lastTest(batch.id, "transfer");
            const seT = v.lastTest(batch.id, "sense");

            if (trT) {

                const r = v.measureTest(trT);

                out.vt = r.reps.map(function (x) { return x.ex.vt; });
                out.mu = r.reps.map(function (x) { return x.ex.mu; });
                out.ss = r.reps.map(function (x) { return x.ex.ss; });
                out.lonoff = r.reps.map(function (x) { return Math.log10(x.ex.onoff); });
                out.ion = r.reps.map(function (x) { return x.ex.ion * 1e6; });
            }

            if (seT) { out.sens = v.measureTest(seT).reps.map(function (x) { return x.s.sensitivity; }); }

            return out;
        },

        tableHead: ["Vt (V)", "Mobility (cm²/Vs)", "SS (mV/dec)", "log₁₀ on/off", "Ion (µA)", "Sensitivity (mV/dec)"],

        tableRow: function (hd) {

            const pm = env().pm;

            return [
                hd.vt ? pm(hd.vt) : "not tested",
                hd.mu ? pm(hd.mu) : "not tested",
                hd.ss ? pm(hd.ss, 0) : "not tested",
                hd.lonoff ? pm(hd.lonoff, 1) : "not tested",
                hd.ion ? pm(hd.ion) : "not tested",
                hd.sens ? pm(hd.sens) : "not tested"
            ];
        },

        ranks: [
            { key: "mu", label: "field-effect mobility", unit: "cm²/Vs", higher: true },
            { key: "ss", label: "subthreshold swing", unit: "mV/dec", higher: false, digits: 0 },
            { key: "lonoff", label: "on/off ratio (log₁₀)", unit: "", higher: true, digits: 1 },
            { key: "ion", label: "on current", unit: "µA", higher: true },
            { key: "sens", label: "sensing sensitivity", unit: "mV/dec", higher: true }
        ],

        charts: function (container, batches, theme, colors) {

            const v = env();
            const h = v.h;

            const mk = function (cfg, fn) { const c = h("canvas", { role: "img" }); fn(c, cfg); container.appendChild(c); };

            const logS = [];
            const linS = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "transfer");

                if (!t) { return; }

                const r = v.measureTest(t);
                const x = r.reps[0].t;

                logS.push({ label: v.shortName(b), color: colors[b.id], x: x.vg, y: x.idF.map(function (i) { return Math.max(Math.abs(i), 1e-16); }), width: 2.2 });
                linS.push({ label: v.shortName(b), color: colors[b.id], x: x.vg, y: x.idF.map(function (i) { return Math.abs(i) * 1e6; }), width: 2.2 });
            });

            if (logS.length) {

                mk({ theme: theme, xLabel: "Gate voltage (V)", yLabel: "|Drain current| (A)", yLog: true, title: "Transfer curves, log scale (device 1)", series: logS }, D.line);
                mk({ theme: theme, xLabel: "Gate voltage (V)", yLabel: "|Drain current| (µA)", title: "Transfer curves, linear (device 1)", series: linS }, D.line);
            }

            const senseS = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "sense");

                if (!t) { return; }

                const s = v.measureTest(t).reps[0].s;

                senseS.push({ label: v.shortName(b) + ": " + s.an.name.split(" (")[0], color: colors[b.id], x: s.x, y: s.dvt, dots: true, width: 2, log: s.an.log });
            });

            if (senseS.length) {

                const allLog = senseS.every(function (s) { return s.log; });

                mk({ theme: theme, xLabel: allLog ? "Concentration or ratio" : "Analyte value", yLabel: "Threshold shift (mV)", xLog: allLog, title: "Sensing responses (device 1)", series: senseS }, D.line);
            }

            return [
                { key: "mu", title: "Field-effect mobility (mean ± SD)", yLabel: "cm²/Vs" },
                { key: "vt", title: "Threshold voltage (mean ± SD)", yLabel: "V" },
                { key: "ss", title: "Subthreshold swing (mean ± SD)", yLabel: "mV/dec" },
                { key: "lonoff", title: "On/off ratio (log₁₀, mean ± SD)", yLabel: "decades" },
                { key: "sens", title: "Sensitivity (mean ± SD)", yLabel: "mV per decade" }
            ];
        },

        analysis: function (dv, inf) {

            const v = env();
            const out = [];

            if (inf.parts) {

                const p = inf.parts;

                out.push(v.table(["What decides the transistor", "Value"], [
                    ["Channel length / width (drawn) / squares", v.fmtLen(p.L) + " / " + v.fmtLen(p.W) + " / " + v.sig(p.gAllSq)],
                    ["Source / drain contact resistance", v.sig(p.rs) + " / " + v.sig(p.rd) + " Ω"],
                    ["Contact barrier height (source / drain)", v.sig(p.phiS) + " / " + v.sig(p.phiD) + " eV"],
                    ["Gate covers this share of the channel", Math.round(p.gateCoverage * 100) + "%"],
                    ["Gate capacitance (dielectric)", p.cox > 0 ? v.sig(p.cox * 1e3) + " mF/m²" : "none"],
                    ["Gate breakdown voltage", dv.vbd > 0 ? v.sig(dv.vbd) + " V" : "none"],
                    ["Channel open to solution", Math.round((dv.exposedFrac || 0) * 100) + "%"],
                    ["Metal touching the solution", v.fmtArea(p.aMetalExposed)],
                    ["Gate overlap on source / drain", v.fmtArea(p.aGs) + " / " + v.fmtArea(p.aGd)],
                    ["Chance of a gate pinhole / of a short", Math.round((inf.pPinhole || 0) * 100) + "% / " + Math.round((inf.pShort || 0) * 100) + "%"]
                ]));
            }

            return out;
        },

        processExtras: function (panel, d, save, kind) {

            const v = env();
            const h = v.h;

            if (kind !== "biofet") {

                panel.appendChild(h("p", { className: "lab-hint", text: "A MOSFET is measured dry: the gate dielectric is the gate capacitor. Choose the gate dielectric and contact metals in the layers below." }));

                return;
            }

            panel.appendChild(h("h2", { className: "lab-h2", text: "Surface chemistry (receptor)" }));

            panel.appendChild(h("p", { className: "lab-hint", text: "The receptor on the open channel decides what the sensor can recognise. The solution is chosen at the test bench." }));

            panel.appendChild(v.cards({
                label: "Receptor",
                items: Object.keys(F.RECEPTORS).map(function (k) { return { id: k, title: F.RECEPTORS[k].name, body: F.RECEPTORS[k].blurb }; }),
                value: d.receptor || "none",
                onChange: function (id) { d.receptor = id; save(); }
            }));
        },

        layerExtras: function (layer, body, d, refresh) {

            const v = env();
            const h = v.h;

            if (layer.role === "semiconductor") {

                const sc = E.SEMICONDUCTORS[layer.material];

                body.appendChild(h("p", { className: "lab-muted", text: sc.name + " · " + sc.blurb }));

                body.appendChild(h("div", { className: "lab-notes" }, [
                    h("div", { className: "lab-row" }, [h("span", { text: "Carrier type" }), h("strong", { text: sc.type === "n" ? "n-type (electrons)" : sc.type === "p" ? "p-type (holes)" : "ambipolar" })]),
                    h("div", { className: "lab-row" }, [h("span", { text: "Mobility" }), h("strong", { text: v.sig(sc.mu) + " cm²/V·s" })]),
                    h("div", { className: "lab-row" }, [h("span", { text: "Threshold / Dirac voltage" }), h("strong", { text: v.sig(sc.vt) + " V" })]),
                    h("div", { className: "lab-row" }, [h("span", { text: "Interface trap density" }), h("strong", { text: sc.dit.toExponential(0) + " per cm² per eV" })]),
                    h("div", { className: "lab-row" }, [h("span", { text: "Stability in water" }), h("strong", { text: sc.water >= 0.9 ? "stable" : sc.water >= 0.6 ? "moderate" : "poor" })])
                ]));

                return true;
            }

            if (layer.role === "collector") {

                const m = E.METALS[layer.material];
                const wf = E.WORKFUNCTION[layer.material];

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · work function " + wf + " eV. Low work function metals (Ti, Al) make ohmic contacts to n-type channels, high ones (Au, Pt) to p-type. Metal in your gate or contacts is also what touches the solution if you leave it open." }));

                return true;
            }

            if (layer.role === "insulation") {

                const m = E.INSULATORS[layer.material];
                const cox = 8.854e-12 * m.eps / (layer.thickness * 1e-6);

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · permittivity " + m.eps + ", breakdown field " + m.ebd + " MV/cm. As a " + v.sig(layer.thickness * 1000) + " nm gate dielectric it gives " + v.sig(cox * 1e3) + " mF/m² and breaks down near " + v.sig(m.ebd * layer.thickness * 100) + " V. High-k materials give more capacitance at the same thickness." }));

                return true;
            }

            return false;
        },

        thicknessRange: function (layer) {

            if (layer.role === "semiconductor") { return { min: 0.0003, max: 0.2, step: 0.0003 }; }
            if (layer.role === "insulation") { return { min: 0.003, max: 10, step: 0.003 }; }
            if (layer.role === "collector") { return { min: 0.02, max: 1, step: 0.01 }; }

            return null;
        }
    };

    K.fet = impl;
    K.biofet = impl;

}(typeof window !== "undefined" ? window : globalThis));
