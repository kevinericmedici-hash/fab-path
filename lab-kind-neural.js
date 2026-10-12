/* ========================================
   LAB KIND: NEURAL PROBE

   Tests, charts, comparison metrics and layer notes for the "neural"
   kind: a thin probe with numbered recording and sensing sites. Tests:
   continuity, impedance, cyclic voltammetry, dopamine, glutamate, spike
   recording, a month in warm saline and insertion into tissue.

   Needs window.LabNeural (lab-neural-model.js) and window.LabKinds.env.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;
    const D = root.SCLabDraw;
    const E = root.LabEngine;
    const N = root.LabNeural;

    const K = root.LabKinds = root.LabKinds || {};

    function env() { return K.env; }


    const TESTS = [
        { id: "dmm", name: "Continuity and isolation", blurb: "Does every channel connect its site to its pad, and how big are the trace resistance and the capacitance to the tissue?" },
        { id: "eis", name: "Impedance spectrum", blurb: "The impedance of each site from 1 Hz to 100 kHz in salt solution. Low impedance at 1 kHz means low noise for recording." },
        { id: "cv", name: "Cyclic voltammetry (charge storage)", blurb: "Sweep the potential and measure the current. The charge a site can store sets how well it can stimulate without splitting water." },
        { id: "da", name: "Dopamine sensing", blurb: "A calibration with dopamine using fast-scan voltammetry or constant-potential amperometry, plus ascorbic acid as an interferent." },
        { id: "glu", name: "Glutamate sensing", blurb: "Add glutamate and ascorbate to an enzyme site and a bare sentinel site. The sentinel lets you subtract what is not glutamate." },
        { id: "rec", name: "Recording spikes", blurb: "Three simulated neurons fire near the probe. See how well each site picks them out of the noise." },
        { id: "soak", name: "A month in warm saline", blurb: "Soak the probe at body temperature and read the impedance daily: coatings peel, insulation lifts and traces corrode." },
        { id: "insert", name: "Insertion and tissue", blurb: "Can the probe push into brain without bending, and how much of a scar will its stiffness and size cause?" }
    ];

    const SCANS = [0.05, 0.1, 0.2, 0.5, 1];
    const DISTS = [15, 25, 40, 70, 100];
    const WEEKS = [0, 2, 4, 8];


    function choice(v, list, def) { return list.indexOf(v) >= 0 ? v : def; }

    function nearest(list, v) {

        let best = list[0];

        list.forEach(function (x) { if (Math.abs(x - v) < Math.abs(best - v)) { best = x; } });

        return best;
    }

    function median(a) {

        const s = a.filter(isFinite).slice().sort(function (x, y) { return x - y; });

        return s.length ? s[Math.floor(s.length / 2)] : NaN;
    }

    // Mean and spread, without a spread that is only rounding noise.
    function pmq(values, d) {

        const v = env();
        const clean = values.filter(isFinite);
        const m = v.mean(clean);

        return clean.length > 1 && v.sd(clean) < 0.002 * Math.abs(m) ? v.sig(m, d) : v.pm(values, d);
    }

    function fmtOhm(x) {

        const sig = env().sig;

        if (!isFinite(x)) { return "open"; }
        if (x >= 1e6) { return sig(x / 1e6) + " MΩ"; }
        if (x >= 1e3) { return sig(x / 1e3) + " kΩ"; }

        return sig(x) + " Ω";
    }

    function fmtF(f) {

        if (!isFinite(f)) { return "n/a"; }
        if (f >= 1e-12) { return (f * 1e12).toFixed(f >= 1e-11 ? 1 : 2) + " pF"; }

        return (f * 1e15).toFixed(0) + " fF";
    }

    function bodeMag(re, im) { return re.map(function (r, k) { return Math.hypot(r, im[k]); }); }

    function bodePhase(re, im) { return re.map(function (r, k) { return Math.atan2(-im[k], r) * 180 / Math.PI; }); }


    const impl = {

        id: "neural",

        testLead: "A potentiostat and an impedance analyser measure each numbered site, like in a real electrochemistry lab. Start with the continuity check, then take an impedance spectrum. After that try the sensing and recording tests that fit your design. Each test runs on every probe in the batch.",

        tests: function () { return TESTS; },
        defaultTest: "dmm",

        cleanParams: function (q, num) {

            q = q || {};

            return {
                sol: choice(q.sol, Object.keys(N.SOLUTIONS), "pbs"),
                scan: nearest(SCANS, num(q.scan, 0.05, 1, 0.1)),
                wide: q.wide === true || q.wide === "wide",
                tech: choice(q.tech, ["fscv", "amp"], "fscv"),
                dist: nearest(DISTS, num(q.dist, 15, 100, 40)),
                weeks: nearest(WEEKS, num(q.weeks, 0, 8, 0))
            };
        },

        defaultParams: function () { return { sol: "pbs", scan: 0.1, wide: false, tech: "fscv", dist: 40, weeks: 0 }; },

        describeParams: function (t) {

            const p = t.params;

            switch (t.type) {
                case "eis": return (N.SOLUTIONS[p.sol] || {}).name;
                case "cv": return (N.SOLUTIONS[p.sol] || {}).name.split(" (")[0] + ", " + p.scan + " V/s" + (p.wide ? ", wide window" : "");
                case "da": return p.tech === "fscv" ? "fast-scan voltammetry" : "amperometry at +0.6 V";
                case "rec": return "neurons " + p.dist + " µm away" + (p.weeks ? ", " + p.weeks + " weeks after implant" : ", acute");
                default: return "standard settings";
            }
        },

        paramControls: function (type, params) {

            const v = env();
            const out = [];

            const solOptions = Object.keys(N.SOLUTIONS).map(function (k) { return { value: k, label: N.SOLUTIONS[k].name }; });

            if (type === "eis" || type === "cv") {

                out.push(v.selectChoice("Solution", solOptions, params.sol, function (x) { params.sol = x; v.refreshParams(); }, (N.SOLUTIONS[params.sol] || {}).blurb));
            }

            if (type === "cv") {

                out.push(v.selectField("Scan rate", SCANS, params.scan, "V/s", function (x) { params.scan = x; },
                    "Faster scans give more charging current but less time for slow processes. Peak current in ferrocyanide grows with the square root of the scan rate."));

                out.push(v.selectChoice("Potential window", [
                    { value: "safe", label: "−0.6 to +0.8 V (inside the water window)" },
                    { value: "wide", label: "−0.9 to +1.1 V (splits water)" }
                ], params.wide ? "wide" : "safe", function (x) { params.wide = x === "wide"; },
                "Outside about −0.7 to +1.0 V water is split into hydrogen and oxygen gas. That is not storage: it is damage."));
            }

            if (type === "da") {

                out.push(v.selectChoice("Technique", [
                    { value: "fscv", label: "Fast-scan cyclic voltammetry (400 V/s, 10 Hz)" },
                    { value: "amp", label: "Constant-potential amperometry (+0.6 V)" }
                ], params.tech, function (x) { params.tech = x; },
                "Voltammetry gives a fingerprint of the molecule and rejects ascorbate. Amperometry is simple and quiet but cannot tell dopamine from anything else that oxidises at +0.6 V."));
            }

            if (type === "rec") {

                out.push(v.selectField("Distance from the neurons to the nearest site", DISTS, params.dist, "µm", function (x) { params.dist = x; },
                    "Spikes fall off quickly with distance. Neurons within about 50 µm are well recorded."));

                out.push(v.selectField("Time since implantation", WEEKS, params.weeks, "weeks", function (x) { params.weeks = x; },
                    "The tissue reacts to the probe and builds a scar that pushes the neurons away. Stiffer, bigger probes make a thicker scar."));
            }

            return out;
        },

        measure: function (type, dev, p) {

            switch (type) {

                case "dmm": return N.check(dev);
                case "eis": return N.eis(dev, { sol: p.sol });
                case "cv": return N.cv(dev, { sol: p.sol, scan: p.scan, wide: p.wide });
                case "da": return N.dopamine(dev, { tech: p.tech });
                case "glu": return N.glutamate(dev, {});
                case "rec": return N.recording(dev, { dist: p.dist, weeks: p.weeks });
                case "soak": return N.soak(dev, {});
                default: return N.insertion(dev);
            }
        },

        view: function (container, r, theme) {

            const v = env();
            const h = v.h;
            const sig = v.sig;
            const pm = pmq;
            const type = r.test.type;
            const reps = r.reps;
            const p = r.test.params;
            const devs = v.devicesOf(r.batch);

            const chColor = function (k) { return D.color(k, theme); };

            const bad = devs.filter(function (d) { return !N.working(d); }).length;

            const warnBad = function () {

                if (bad) { container.appendChild(h("p", { className: "lab-note warn", text: bad + " of " + devs.length + " probes have no working channel, so there is nothing to measure on them. Open the failure analysis to see why." })); }
            };

            if (type === "dmm") {

                const rows = [];

                reps.forEach(function (x, k) {

                    x.ch.forEach(function (c) {

                        const label = { ok: "Connected", short: "Shorted to another channel", open: "Open", blind: "No exposed site" }[c.status] || c.status;

                        rows.push(["Probe " + (k + 1) + ", channel " + c.d, label, c.z1k ? fmtOhm(c.z1k) : "n/a", c.z1k ? fmtOhm(c.rTrace) : "n/a",
                            c.z1k ? v.fmtArea(c.area) : "n/a", c.z1k ? fmtF(c.cPar) : "n/a", c.z1k ? (c.xtalk * 100).toFixed(3) + " %" : "n/a"]);
                    });
                });

                container.appendChild(v.table(["Channel", "Result", "|Z| at 1 kHz in salt", "Trace resistance", "Open site area", "Trace to tissue capacitance", "Worst crosstalk"], rows));

                const faults = reps.reduce(function (s, x) { return s + x.ch.filter(function (c) { return c.status !== "ok"; }).length; }, 0);

                container.appendChild(h("p", {
                    className: "lab-note " + (faults ? "warn" : "ok"),
                    text: faults ? faults + " channel" + (faults > 1 ? "s" : "") + " failed the check. Open the failure analysis below for the cause." :
                        "Every channel connects its site to its pad. Resistance and capacitance of the trace are small next to the electrode, which is what you want."
                }));

                container.appendChild(h("p", { className: "lab-hint", text: "The trace resistance should be a tiny part of the site impedance. The capacitance to the tissue shorts high frequencies to ground, and the crosstalk is how much of a neighbouring channel's signal leaks into this one." }));

                return;
            }

            const good = reps.filter(function (x) { return x.ok; });

            if (!good.length) {

                container.appendChild(h("p", { className: "lab-note warn", text: "No working probe in this batch." }));
                warnBad();

                return;
            }

            if (type === "eis") {

                const a = good[0];

                const mag = h("canvas", { role: "img" });
                const ph = h("canvas", { role: "img" });
                const nyq = h("canvas", { role: "img" });

                D.line(mag, {
                    theme: theme, xLabel: "Frequency (Hz)", yLabel: "|Z| (Ω)", xLog: true, yLog: true, title: "Bode plot: magnitude (probe 1)",
                    series: a.ch.map(function (c, k) { return { label: "Channel " + c.d, color: chColor(k), width: 2, x: a.f, y: bodeMag(c.re, c.im) }; })
                });

                D.line(ph, {
                    theme: theme, xLabel: "Frequency (Hz)", yLabel: "Phase angle (°)", xLog: true, yMin: -95, yMax: 5, title: "Bode plot: phase (probe 1)",
                    series: a.ch.map(function (c, k) { return { label: "Channel " + c.d, color: chColor(k), width: 2, x: a.f, y: bodePhase(c.re, c.im) }; })
                });

                container.appendChild(h("div", { className: "lab-charts" }, [mag, ph]));

                container.appendChild(h("p", { className: "lab-hint", text: "A flat magnitude at high frequency is the solution's spreading resistance around the site. The slope below it is the electrode's capacitance: a straight line of slope −1 on this plot would be an ideal capacitor, and real electrodes are a little shallower. A coating with a large area lifts the whole curve down. The phase near −90° means mostly capacitive; near 0° means resistive." }));

                const zmax = Math.max.apply(null, a.ch.map(function (c) { return c.re[c.re.length - 1] + c.re[0]; }));

                D.line(nyq, {
                    theme: theme, xLabel: "Z′, real (Ω)", yLabel: "−Z″, imaginary (Ω)", title: "Nyquist plot (probe 1)", equal: true, xMin: 0, yMin: 0,
                    xMax: 4 * Math.max.apply(null, a.ch.map(function (c) { return c.rs; })),
                    series: a.ch.map(function (c, k) { return { label: "Channel " + c.d, color: chColor(k), width: 2, dots: false, x: c.re, y: c.im }; })
                });

                container.appendChild(nyq);

                if (p.sol === "ferro") { container.appendChild(h("p", { className: "lab-hint", text: "With the redox couple a semicircle appears: its width is the charge-transfer resistance. A clean, fast surface gives a small one. A film that blocks the surface (an enzyme layer, Nafion, a fouled metal) makes it large." })); }
                else { container.appendChild(h("p", { className: "lab-hint", text: "The view is zoomed on the high-frequency end. In plain salt there is no redox couple, so the electrode behaves like a leaky capacitor and the curve climbs steeply." })); }

                container.appendChild(v.table(["Metric (per probe: typical channel)", "Mean ± spread"], [
                    ["|Z| at 1 kHz (kΩ)", pm(good.map(function (x) { return median(x.ch.map(function (c) { return c.z1k / 1000; })); }))],
                    ["Spreading resistance of the site (kΩ)", pm(good.map(function (x) { return median(x.ch.map(function (c) { return c.rs / 1000; })); }))],
                    ["Capacitance density of the surface (µF/cm²)", pm(good.map(function (x) { return median(x.ch.map(function (c) { return c.it.q; })); }), 0)],
                    ["Open site area (µm²)", pm(good.map(function (x) { return median(x.ch.map(function (c) { return c.area; })); }), 0)]
                ]));

                container.appendChild(h("p", { className: "lab-hint", text: "For recording, aim for under about 1 MΩ at 1 kHz (thermal noise grows with impedance). A bigger site or a high-area coating lowers it, but a bigger site also averages away the small, local spikes." }));

                warnBad();

                return;
            }

            if (type === "cv") {

                const a = good[0];
                const cvs = h("canvas", { role: "img" });

                D.line(cvs, {
                    theme: theme, xLabel: "Potential (V versus Ag/AgCl)", yLabel: "Current (nA)", title: (N.SOLUTIONS[p.sol] || {}).name.split(" (")[0] + " at " + p.scan + " V/s (probe 1)",
                    series: a.ch.map(function (c, k) { return { label: "Channel " + c.d, color: chColor(k), width: 2, x: c.e, y: c.i.map(function (i) { return i * 1e9; }) }; })
                });

                container.appendChild(cvs);

                if (p.sol === "pbs") {

                    container.appendChild(h("p", { className: "lab-hint", text: "In plain salt the current is the charging of the electrode: a wider box means more capacitance and more charge storage. Bumps are surface reactions (hydrogen on platinum, redox of iridium oxide). The charge storage capacity is the area of the cathodic half of the loop divided by the site area." }));

                    container.appendChild(v.table(["Metric (per probe: typical channel)", "Mean ± spread"], [
                        ["Cathodic charge storage capacity (mC/cm²)", pm(good.map(function (x) { return median(x.ch.map(function (c) { return c.csc; })); }))],
                        ["Charge stored per site (nC)", pm(good.map(function (x) { return median(x.ch.map(function (c) { return c.qm * 1e9; })); }))]
                    ]));

                    container.appendChild(h("p", { className: "lab-hint", text: "Flat platinum stores only a few tenths of a mC/cm². A conducting polymer or iridium oxide coating stores tens to hundreds of times more, which is why they are used on stimulating electrodes." }));

                    if (p.wide) { container.appendChild(h("p", { className: "lab-note warn", text: "In the wide window the current shoots up at both ends: that is water splitting, producing gas bubbles at the site. Stay inside the water window for a real device." })); }

                } else {

                    container.appendChild(h("p", { className: "lab-hint", text: "A fast one-electron couple gives a peak on the way up and one on the way down about 59 mV apart. A slower surface or the iR drop along a resistive trace pulls the peaks further apart and lowers them." }));

                    container.appendChild(v.table(["Metric (per probe: typical channel)", "Mean ± spread"], [
                        ["Peak current (nA)", pm(good.map(function (x) { return median(x.ch.map(function (c) { return c.ip * 1e9; })); }))],
                        ["Peak separation (mV)", pm(good.map(function (x) { return median(x.ch.map(function (c) { return c.dEp * 1000; })); }), 0)],
                        ["Resistance in series (kΩ)", pm(good.map(function (x) { return median(x.ch.map(function (c) { return c.rsTot / 1000; })); }))]
                    ]));
                }

                warnBad();

                return;
            }

            if (type === "da") {

                const a = good[0];

                const cal = h("canvas", { role: "img" });

                D.line(cal, {
                    theme: theme, xLabel: "Dopamine (µM)", yLabel: "Current (nA)", xLog: true, title: "Calibration (probe 1)",
                    series: a.ch.map(function (c, k) { return { label: "Channel " + c.d, color: chColor(k), width: 2, dots: true, x: c.conc, y: c.cal }; })
                });

                container.appendChild(cal);

                let top = a.ch[0];

                a.ch.forEach(function (c) { if (c.slope > top.slope) { top = c; } });

                if (a.tech === "fscv") {

                    const vg = h("canvas", { role: "img" });
                    const rl = h("canvas", { role: "img" });

                    D.line(vg, {
                        theme: theme, xLabel: "Potential (V)", yLabel: "Current after background subtraction (nA)", title: "Voltammogram of 1 µM dopamine (channel " + top.d + ")",
                        series: [{ color: chColor(a.ch.indexOf(top)), width: 2, x: top.e, y: top.i }]
                    });

                    D.line(rl, {
                        theme: theme, xLabel: "Time (s)", yLabel: "Dopamine (µM)", title: "A release event measured at 10 Hz (channel " + top.d + ")",
                        series: [
                            { label: "True", color: "#888888", alpha: 0.6, width: 1.4, dash: [5, 4], x: top.rel.t, y: top.rel.true_ },
                            { label: "Measured", color: chColor(a.ch.indexOf(top)), width: 2, x: top.rel.t, y: top.rel.meas }
                        ]
                    });

                    container.appendChild(h("div", { className: "lab-charts" }, [vg, rl]));
                }

                container.appendChild(h("p", { className: "lab-hint", text: a.tech === "fscv" ?
                    "The voltammogram is the fingerprint: dopamine oxidises near +0.6 V and its product is reduced near −0.2 V. A resistive trace shifts the peak to a higher potential. The release trace shows how noise blurs a real event: a site that is too insensitive cannot resolve it." :
                    "At a constant +0.6 V anything that oxidises there adds current: dopamine, ascorbate, DOPAC and others. Amperometry is quiet, but it cannot tell them apart. The steady current of a small disk is tiny, so the site is much less sensitive than with fast-scan voltammetry." }));

                container.appendChild(v.table(["Probe 1", "Sensitivity (nA/µM)", "Detection limit (µM)", "Noise (pA)", "Background (nA)", "Apparent dopamine from 200 µM ascorbate (µM)"], a.ch.map(function (c) {

                    return ["Channel " + c.d, sig(c.slope), sig(c.lod), sig(c.sigma), sig(c.iBg), sig(c.aaApparent)];
                })));

                container.appendChild(v.table(["Metric (per probe: best channel)", "Mean ± spread"], [
                    ["Sensitivity (nA/µM)", pm(good.map(function (x) { return Math.max.apply(null, x.ch.map(function (c) { return c.slope; })); }))],
                    ["Detection limit (µM)", pm(good.map(function (x) { return Math.min.apply(null, x.ch.map(function (c) { return c.lod; })); }), 2)]
                ]));

                container.appendChild(h("p", { className: "lab-hint", text: "Brain tissue holds about 200 µM of ascorbate and dopamine is a few tens of nM to a µM. A site that reads 2 µM of dopamine from ascorbate alone is useless. A Nafion film turns it away; so does fast-scan voltammetry, which only partly does." }));

                warnBad();

                return;
            }

            if (type === "glu") {

                const withEnz = good.filter(function (x) { return x.nEnz > 0; });

                if (!withEnz.length) {

                    container.appendChild(h("p", { className: "lab-note warn", text: "No site has a glutamate oxidase enzyme layer. Draw a coating layer with the enzyme over a platinum site, and leave a second platinum site bare to act as the sentinel." }));
                    warnBad();

                    return;
                }

                const a = withEnz[0];
                const c0 = a.ch[0];

                const cv1 = h("canvas", { role: "img" });

                const series = [
                    { label: "Enzyme site " + c0.d + " (raw)", color: chColor(0), width: 1.6, alpha: 0.7, x: a.t, y: c0.raw }
                ];

                if (c0.hasSentinel) {

                    series.push({ label: "Sentinel " + c0.sentinel, color: "#888888", width: 1.4, dash: [5, 4], alpha: 0.8, x: a.t, y: c0.sen });
                    series.push({ label: "Subtracted", color: chColor(2), width: 2.4, x: a.t, y: c0.sub });
                }

                D.line(cv1, { theme: theme, xLabel: "Time (s)", yLabel: "Current (nA)", title: "Glutamate additions at 100, 200, 300 and 400 s, ascorbate at 500 s (probe 1)", series: series });

                container.appendChild(cv1);

                container.appendChild(h("p", { className: "lab-hint", text: "Glutamate oxidase turns glutamate and oxygen into hydrogen peroxide, which the platinum underneath oxidises. Each addition gives a step in current. At 500 s ascorbate is added: it oxidises on any bare platinum and gives a step of its own, even without glutamate. The sentinel site has no enzyme, so it sees the ascorbate but not the glutamate, and subtracting it removes the false signal." }));

                container.appendChild(v.table(["Probe 1: enzyme sites", "Sensitivity (nA/µM)", "Detection limit (µM)", "Response time constant (s)", "Ascorbate read as glutamate, raw (µM)", "Same after subtracting the sentinel (µM)", "Sentinel"], a.ch.map(function (c) {

                    return ["Channel " + c.d, sig(c.slope), sig(c.lod), sig(c.tau, 0), sig(c.aaRaw), c.hasSentinel ? sig(c.aaApparent) : "no sentinel", c.hasSentinel ? "channel " + c.sentinel : "none"];
                })));

                container.appendChild(v.table(["Metric (per probe: first enzyme site)", "Mean ± spread"], [
                    ["Sensitivity (nA/µM)", pm(withEnz.map(function (x) { return x.ch[0].slope; }))],
                    ["Detection limit (µM)", pm(withEnz.map(function (x) { return x.ch[0].lod; }), 2)]
                ]));

                container.appendChild(h("p", { className: "lab-hint", text: "A good sentinel matches the enzyme site in metal, size and any other coating, so it responds to everything except glutamate. If the two respond differently to ascorbate (a Nafion film on one, say), the subtraction over- or under-corrects. Check the last column: it should be close to zero." }));

                warnBad();

                return;
            }

            if (type === "rec") {

                const a = good[0];
                const tr = a.tr;

                const cv1 = h("canvas", { role: "img" });

                if (tr) {

                    D.line(cv1, {
                        theme: theme, xLabel: "Time (ms)", yLabel: "Voltage (µV)", title: "Channel " + tr.d + ", the best channel on probe 1 (neurons " + sig(a.dist, 0) + " µm away)",
                        series: [
                            { color: chColor(0), width: 1.1, x: tr.t, y: tr.v },
                            { label: "Detection threshold", color: "#e07070", alpha: 0.8, width: 1.2, dash: [5, 4], x: [tr.t[0], tr.t[tr.t.length - 1]], y: [-tr.thr, -tr.thr] }
                        ]
                    });

                    container.appendChild(cv1);
                }

                container.appendChild(h("p", { className: "lab-hint", text: "Each downward spike is a neuron firing near the site. The dashed line is the detection threshold, 4.5 times the noise. A spike that stays above it is lost in the noise. Noise comes from the electrode's thermal (Johnson) noise, the amplifier and the background activity of far-away neurons, which you cannot remove." }));

                container.appendChild(v.table(["Probe 1", "Noise (µV rms)", "Of which the electrode (µV)", "Biggest spike (µV peak to peak)", "Signal to noise", "Spikes found", "False spikes per s"], a.ch.map(function (c) {

                    return ["Channel " + c.d, sig(c.sigma), sig(c.vTh), sig(c.best), sig(c.snr), isFinite(c.sens) ? Math.round(c.sens * 100) + " %" : "none loud enough", sig(c.falsePos, 1)];
                })));

                container.appendChild(v.table(["Metric (per probe: best channel)", "Mean ± spread"], [
                    ["Signal to noise", pm(good.map(function (x) { return Math.max.apply(null, x.ch.map(function (c) { return c.snr; })); }))],
                    ["Noise (µV rms)", pm(good.map(function (x) { return Math.min.apply(null, x.ch.map(function (c) { return c.sigma; })); }))]
                ]));

                container.appendChild(h("p", { className: "lab-note " + (a.scar > 20 ? "warn" : "ok"), text: "Scar between the probe and the neurons: " + sig(a.scar, 0) + " µm (it adds to the distance you chose). Time in tissue and a stiff, large probe both thicken it." }));

                container.appendChild(h("p", { className: "lab-hint", text: "A spike is called usable when its signal to noise is above about 3 to 4. Big sites average the field over a larger area and lose amplitude, and a very high impedance adds noise and loses signal into the amplifier's input capacitance." }));

                warnBad();

                return;
            }

            if (type === "soak") {

                const a = good[0];
                const cv1 = h("canvas", { role: "img" });

                D.line(cv1, {
                    theme: theme, xLabel: "Days in warm saline", yLabel: "|Z| at 1 kHz (Ω)", yLog: true, title: "Impedance over a month (probe 1)",
                    series: a.ch.map(function (c, k) { return { label: "Channel " + c.d, color: chColor(k), width: 2, x: a.days, y: c.z }; })
                });

                container.appendChild(cv1);

                container.appendChild(h("p", { className: "lab-hint", text: "A coating that peels sends the impedance up to the bare metal's value. Insulation that lifts exposes the trace, so the impedance falls and the noise rises. A base metal trace can corrode through and go open. A slow, smooth drift is normal." }));

                container.appendChild(v.table(["Probe 1", "State at day 28", "First change (day)", "Impedance at start", "Impedance at day 28"], a.ch.map(function (c) {

                    return ["Channel " + c.d, c.state === "ok" ? "Stable" : c.state, c.firstFail === null ? "none" : String(c.firstFail), fmtOhm(c.z0), fmtOhm(c.zEnd)];
                })));

                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["Channels still working after 28 days (%)", pm(good.map(function (x) { return x.yield * 100; }), 0)]
                ]));

                warnBad();

                return;
            }

            // insertion
            const withBody = good.filter(function (x) { return !x.noBody; });

            if (!withBody.length) {

                container.appendChild(h("p", { className: "lab-note warn", text: "These probes have no body layer. Add a substrate layer under the metal and draw the probe outline on it." }));
                warnBad();

                return;
            }

            const a = withBody[0];

            const bk = h("canvas", { role: "img" });
            const sc = h("canvas", { role: "img" });

            D.line(bk, {
                theme: theme, xLabel: "Free length of the probe (mm)", yLabel: "Load it can take before bending (mN)", xLog: true, yLog: true, title: "Buckling load (probe 1)",
                series: [
                    { label: "Buckling load", color: chColor(0), width: 2.2, x: a.curve.L, y: a.curve.p },
                    { label: "Force to enter the brain", color: "#e07070", width: 1.4, dash: [5, 4], x: [a.curve.L[0], a.curve.L[a.curve.L.length - 1]], y: [a.fIns, a.fIns] },
                    { label: "Your probe", color: chColor(2), width: 0, dots: true, x: [a.L / 1000], y: [a.pcr] }
                ]
            });

            D.line(sc, {
                theme: theme, xLabel: "Weeks in the brain", yLabel: "Scar thickness (µm)", title: "Tissue reaction (probe 1)",
                series: withBody.map(function (x, k) { return { color: chColor(0), alpha: k === 0 ? 1 : 0.4, width: k === 0 ? 2.2 : 1.2, x: x.scar.w, y: x.scar.t }; })
            });

            container.appendChild(h("div", { className: "lab-charts" }, [bk, sc]));

            container.appendChild(h("p", { className: "lab-hint", text: "A thin probe is a slender column: a load that is too high makes it buckle like a drinking straw instead of going in. The load it can take falls with the square of its length and rises with the cube of its thickness. If the buckling load is under the insertion force, the probe needs a stiff shuttle or stiffener. The scar grows with the probe's size and stiffness, so a soft thin probe causes less." }));

            container.appendChild(v.table(["Metric", "Mean ± spread"], [
                ["Shank width (µm)", pm(withBody.map(function (x) { return x.sub.w; }), 0)],
                ["Body thickness (µm)", pm(withBody.map(function (x) { return x.sub.t; }), 1)],
                ["Length that goes into tissue (mm)", pm(withBody.map(function (x) { return x.L / 1000; }))],
                ["Buckling load (mN)", pm(withBody.map(function (x) { return x.pcr; }))],
                ["Force to enter the brain (mN)", pm(withBody.map(function (x) { return x.fIns; }))],
                ["Safety margin (buckling load ÷ insertion force)", pm(withBody.map(function (x) { return x.margin; }))],
                ["Stiffness compared with brain (times)", sig(a.mismatch, 0)],
                ["Scar thickness after 8 weeks (µm)", pm(withBody.map(function (x) { return x.scar8; }), 0)]
            ]));

            container.appendChild(h("p", { className: "lab-note " + (a.buckles ? "warn" : "ok"), text: a.buckles ?
                "Probe 1 would buckle before it enters the brain (margin " + sig(a.margin) + "). Make it thicker, shorter or stiffer, or plan to insert it on a stiff shuttle." :
                "Probe 1 is stiff enough to push straight in (margin " + sig(a.margin) + ")." }));

            warnBad();
        },

        headline: function (batch) {

            const v = env();
            const out = { z1k: null, snr: null, da: null, lod: null, yield: null, margin: null, scar: null };

            const devs = v.devicesOf(batch);

            out.z1k = devs.map(function (d) {

                const cs = N.okChans(d);

                return cs.length ? median(cs.map(function (c) { return N.zMag(N.zChannel(d, c, 1000, "pbs", 0)) / 1000; })) : NaN;
            });

            out.margin = devs.map(function (d) { const r = N.insertion(d); return r.margin !== undefined ? r.margin : NaN; });
            out.scar = devs.map(function (d) { const r = N.insertion(d); return r.scar8 !== undefined ? r.scar8 : NaN; });

            const recT = v.lastTest(batch.id, "rec");
            const daT = v.lastTest(batch.id, "da");
            const soT = v.lastTest(batch.id, "soak");

            if (recT) { out.snr = v.measureTest(recT).reps.map(function (x) { return x.ok && x.ch.length ? Math.max.apply(null, x.ch.map(function (c) { return c.snr; })) : NaN; }); }

            if (daT) {

                const rs = v.measureTest(daT).reps;

                out.da = rs.map(function (x) { return x.ok && x.ch.length ? Math.max.apply(null, x.ch.map(function (c) { return c.slope; })) : NaN; });
                out.lod = rs.map(function (x) { return x.ok && x.ch.length ? Math.min.apply(null, x.ch.map(function (c) { return c.lod; })) : NaN; });
            }

            if (soT) { out.yield = v.measureTest(soT).reps.map(function (x) { return x.ok ? x.yield * 100 : NaN; }); }

            return out;
        },

        tableHead: ["|Z| at 1 kHz (kΩ)", "Spike SNR", "Dopamine (nA/µM)", "Still working at day 28 (%)", "Buckling margin", "Scar at 8 weeks (µm)"],

        tableRow: function (hd) {

            return [
                hd.z1k ? pmq(hd.z1k, 0) : "n/a",
                hd.snr ? pmq(hd.snr, 1) : "not tested",
                hd.da ? pmq(hd.da, 2) : "not tested",
                hd.yield ? pmq(hd.yield, 0) : "not tested",
                hd.margin ? pmq(hd.margin, 1) : "n/a",
                hd.scar ? pmq(hd.scar, 0) : "n/a"
            ];
        },

        ranks: [
            { key: "z1k", label: "impedance at 1 kHz", unit: "kΩ", higher: false, digits: 0 },
            { key: "snr", label: "spike signal to noise", unit: "", higher: true, digits: 1 },
            { key: "da", label: "dopamine sensitivity", unit: "nA/µM", higher: true },
            { key: "lod", label: "dopamine detection limit", unit: "µM", higher: false, digits: 2 },
            { key: "yield", label: "channels surviving a month", unit: "%", higher: true, digits: 0 },
            { key: "margin", label: "buckling margin", unit: "×", higher: true, digits: 1 },
            { key: "scar", label: "scar thickness at 8 weeks", unit: "µm", higher: false, digits: 0 }
        ],

        charts: function (container, batches, theme, colors) {

            const v = env();
            const h = v.h;

            const mk = function (cfg, fn) { const c = h("canvas", { role: "img" }); fn(c, cfg); container.appendChild(c); };

            const bodeS = [];
            const soakS = [];
            const calS = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "eis");

                if (t) {

                    const r = v.measureTest(t).reps.filter(function (x) { return x.ok && x.ch.length; })[0];

                    if (r) { bodeS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, x: r.f, y: bodeMag(r.ch[0].re, r.ch[0].im) }); }
                }

                const s = v.lastTest(b.id, "soak");

                if (s) {

                    const r = v.measureTest(s).reps.filter(function (x) { return x.ok && x.ch.length; })[0];

                    if (r) { soakS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, x: r.days, y: r.ch[0].z }); }
                }

                const d = v.lastTest(b.id, "da");

                if (d) {

                    const r = v.measureTest(d).reps.filter(function (x) { return x.ok && x.ch.length; })[0];

                    if (r) {

                        let top = r.ch[0];

                        r.ch.forEach(function (c) { if (c.slope > top.slope) { top = c; } });

                        calS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, dots: true, x: top.conc, y: top.cal });
                    }
                }
            });

            if (bodeS.length) { mk({ theme: theme, xLabel: "Frequency (Hz)", yLabel: "|Z| (Ω)", xLog: true, yLog: true, title: "Impedance of channel 1 (probe 1)", series: bodeS }, D.line); }
            if (calS.length) { mk({ theme: theme, xLabel: "Dopamine (µM)", yLabel: "Current (nA)", xLog: true, title: "Dopamine calibration of the best channel (probe 1)", series: calS }, D.line); }
            if (soakS.length) { mk({ theme: theme, xLabel: "Days in warm saline", yLabel: "|Z| at 1 kHz (Ω)", yLog: true, title: "Impedance over a month, channel 1 (probe 1)", series: soakS }, D.line); }

            return [
                { key: "z1k", title: "Impedance at 1 kHz (typical channel, mean ± SD)", yLabel: "kΩ" },
                { key: "snr", title: "Spike signal to noise (best channel, mean ± SD)", yLabel: "ratio" },
                { key: "da", title: "Dopamine sensitivity (best channel, mean ± SD)", yLabel: "nA/µM" },
                { key: "yield", title: "Channels working after a month (mean ± SD)", yLabel: "%" },
                { key: "margin", title: "Buckling margin (mean ± SD)", yLabel: "buckling load ÷ force" },
                { key: "scar", title: "Scar thickness after 8 weeks (mean ± SD)", yLabel: "µm" }
            ];
        },

        analysis: function (dv, inf) {

            const v = env();
            const out = [];

            const chans = dv.ch || [];

            if (chans.length) {

                out.push(v.table(["Channel", "Result", "Open site", "Metal and coating", "Trace resistance", "Capacitance to tissue", "Chance of a pinhole"], chans.map(function (c) {

                    const coats = (c.coats || []).map(function (x) { return (E.NEURAL_COATINGS[x.mat] || {}).name.split(" (")[0] + " (" + Math.round(x.cover * 100) + "% covered)"; });

                    return ["Channel " + c.d, c.status === "ok" ? "working" : c.status, c.areaUm2 ? v.fmtArea(c.areaUm2) : "none",
                        ((E.METALS[c.metal] || {}).name || c.metal).split(" (")[0] + (coats.length ? " + " + coats.join(", ") : ""),
                        isFinite(c.rTrace) ? fmtOhm(c.rTrace) : "n/a", fmtF(c.cPar), Math.round(c.pPin * 1000) / 10 + " %"];
                })));
            }

            if (dv.sub) {

                out.push(v.table(["Probe body", "Value"], [
                    ["Material and thickness", (E.NEURAL_SUBSTRATES[dv.sub.material] || {}).name + ", " + v.sig(dv.sub.t) + " µm"],
                    ["Width of the shank / width at the tip", v.fmtLen(dv.sub.w) + " / " + v.fmtLen(dv.sub.tipW)],
                    ["Length that goes into tissue", v.fmtLen(dv.sub.L)],
                    ["Young's modulus", v.sig(dv.sub.E) + " GPa (brain is about 0.000003 GPa)"]
                ]));
            }

            if (dv.ins) {

                out.push(v.table(["Insulation", "Value"], [
                    ["Material and thickness", (E.INSULATORS[dv.ins.material] || {}).name + ", " + v.sig(dv.ins.t) + " µm"],
                    ["Pattern quality / adhesion", Math.round(dv.ins.quality * 100) + "% / " + Math.round(dv.ins.adhesion * 100) + "%"]
                ]));
            }

            return out;
        },

        processExtras: function (panel, d) {

            const v = env();
            const h = v.h;

            panel.appendChild(h("p", { className: "lab-hint", text: "A probe is built from the bottom up: the body first, then the metal sites and traces, the insulation with its windows, and finally the coatings that make a site low-impedance or selective. The materials and thicknesses of each are chosen in the layer cards below." }));
        },

        designRows: function (d) {

            const pads = E.padsOf(d).filter(function (p) { return /^[1-8]$/.test(p.label); });
            const sub = d.layers.filter(function (l) { return l.role === "substrate" && l.shapes.length; })[0];
            const coats = d.layers.filter(function (l) { return l.role === "coating" && l.shapes.length; });

            return [
                ["Channels (numbered pads)", String(new Set(pads.map(function (p) { return p.label; })).size)],
                ["Probe body", sub ? E.NEURAL_SUBSTRATES[sub.material].name.split(" (")[0] + ", " + sub.thickness + " µm" : "none yet"],
                ["Coatings", coats.length ? coats.map(function (l) { return E.NEURAL_COATINGS[l.material].name.split(" (")[0]; }).join(", ") : "none"]
            ];
        },

        batchInfo: function (snap) {

            const sub = snap.layers.filter(function (l) { return l.role === "substrate"; })[0];
            const coats = snap.layers.filter(function (l) { return l.role === "coating" && l.shapes.length; });

            return (sub ? E.NEURAL_SUBSTRATES[sub.material].name.split(" (")[0].toLowerCase() : "no body") + ", " + (coats.length ? coats.length + " coating" + (coats.length > 1 ? "s" : "") : "bare metal sites");
        },

        layerExtras: function (layer, body) {

            const v = env();
            const h = v.h;

            if (layer.role === "substrate") {

                const m = E.NEURAL_SUBSTRATES[layer.material];

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb + " Young's modulus " + v.sig(m.E) + " GPa." }));
                body.appendChild(h("p", { className: "lab-hint", text: "A thicker body is stiffer (stiffness goes with the cube of the thickness) so it is easier to insert, but it makes a bigger scar." }));

                return true;
            }

            if (layer.role === "coating") {

                const m = E.NEURAL_COATINGS[layer.material];
                const ph = N.COAT[layer.material];

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb }));

                if (ph.qPerUm > 0) { body.appendChild(h("p", { className: "lab-hint", text: "Adds about " + v.sig(ph.qPerUm) + " µF/cm² of capacitance per µm of thickness, up to " + ph.tSat + " µm. Thicker layers store more charge but take longer to deposit and peel sooner." })); }
                else { body.appendChild(h("p", { className: "lab-hint", text: ph.enzyme ? "Needs about 1 µm or more of enzyme to catch the glutamate. It slows the response and loses activity with time." : "Thicker films reject more of the unwanted molecules and slow down the wanted one." })); }

                return true;
            }

            if (layer.role === "collector") {

                const m = E.METALS[layer.material];
                const ph = N.METAL[layer.material] || {};

                body.appendChild(h("p", { className: "lab-muted", text: m.name + (ph.q ? " · bare capacitance about " + ph.q + " µF/cm² · charge storage about " + ph.csc + " mC/cm²" : "") + (ph.corr > 0.5 ? " · corrodes in tissue" : "") }));

                return true;
            }

            return false;
        },

        thicknessRange: function (layer) {

            if (layer.role === "substrate") { return { min: 3, max: 50, step: 1 }; }
            if (layer.role === "coating") { return { min: 0.05, max: 5, step: 0.05 }; }
            if (layer.role === "collector") { return { min: 0.05, max: 1, step: 0.01 }; }
            if (layer.role === "insulation") { return { min: 0.2, max: 10, step: 0.1 }; }

            return null;
        }
    };

    K.neural = impl;

}(typeof window !== "undefined" ? window : globalThis));
