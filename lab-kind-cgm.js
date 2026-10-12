/* ========================================
   LAB KIND: GLUCOSE SENSOR (CGM FILAMENT)

   Tests, charts, comparison metrics and layer notes for the "cgm" kind: a
   thin strip with a working, sentinel, reference and counter electrode.
   Tests: continuity, glucose calibration, interferents, oxygen, ten days of
   wear, a simulated day against blood glucose, and insertion.

   Needs window.LabCGM (lab-cgm-model.js) and window.LabKinds.env.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;
    const D = root.SCLabDraw;
    const E = root.LabEngine;
    const C = root.LabCGM;

    const K = root.LabKinds = root.LabKinds || {};

    function env() { return K.env; }


    const TESTS = [
        { id: "dmm", name: "Continuity and films", blurb: "Does every electrode connect to its pad, and which films reach each one? Checks the stack for common mistakes." },
        { id: "cal", name: "Glucose calibration", blurb: "Step the glucose in a beaker at body temperature and read the current: sensitivity, linear range, response time and noise." },
        { id: "interf", name: "Interferents", blurb: "Add acetaminophen, vitamin C and uric acid to 100 mg/dL of glucose. How much false glucose does each one cause, and does the sentinel cancel it?" },
        { id: "o2", name: "Oxygen dependence", blurb: "Repeat the calibration at three oxygen levels. Enzyme sensors need oxygen; tissue has very little." },
        { id: "wear", name: "Ten days of wear", blurb: "Sensitivity, background and reference drift over two weeks in tissue: enzyme loss, fouling, the first-day dip, peeling films." },
        { id: "cgm", name: "A simulated day", blurb: "Wear the sensor for 24 hours against a simulated blood glucose curve and score it: MARD, how often it is within 20%, and whether it catches low glucose." },
        { id: "insert", name: "Insertion and tissue", blurb: "Can the filament push through skin on its own, how wide must the introducer needle be, and how big a capsule will the body build around it?" }
    ];

    const DAYS = [1, 3, 7, 10, 14];
    const POTS = ["auto", "0.1", "0.2", "0.4", "0.6", "0.7"];


    function choice(v, list, def) { return list.indexOf(v) >= 0 ? v : def; }

    function nearest(list, v) {

        let best = list[0];

        list.forEach(function (x) { if (Math.abs(x - v) < Math.abs(best - v)) { best = x; } });

        return best;
    }

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

    const ELEC = { W: "W working", S: "S sentinel", R: "R reference", C: "C counter" };
    const FILMNAME = { gox: "glucose oxidase", osgox: "wired enzyme", mpd: "permselective film", nafion: "Nafion", pu: "limiting membrane", hydrogel: "hydrogel" };
    const METALNAME = { pt: "platinum", au: "gold", c: "carbon", ti: "titanium", agcl: "Ag/AgCl" };

    function filmText(films) {

        return films.length ? films.map(function (f) { return (FILMNAME[f.mat] || f.mat) + " " + env().sig(f.t) + " µm" + (f.cov < 0.95 ? " (" + Math.round(f.cov * 100) + "%)" : ""); }).join(" → ") : "bare metal";
    }

    function potText(p) { return p === "auto" ? "automatic" : "+" + p + " V"; }


    const impl = {

        id: "cgm",

        testLead: "A potentiostat holds the working electrode at a fixed potential against the reference and reads the current in nanoamps, like in a real sensor lab. Start with the continuity check, then calibrate with glucose. After that test interferents and oxygen, wear it for ten days, and run a simulated day. Each test runs on every sensor in the batch.",

        tests: function () { return TESTS; },
        defaultTest: "dmm",

        cleanParams: function (q, num) {

            q = q || {};

            return {
                o2: choice(q.o2, ["air", "tissue", "low"], "tissue"),
                temp: q.temp === 25 || q.temp === "25" ? 25 : 37,
                pot: choice(String(q.pot), POTS, "auto"),
                scenario: choice(q.scenario, Object.keys(C.SCENARIOS), "typical"),
                cal: choice(q.cal, ["factory", "finger"], "factory"),
                day: nearest(DAYS, num(q.day, 1, 14, 3)),
                apap: q.apap === true || q.apap === "yes",
                sub: !(q.sub === false || q.sub === "no")
            };
        },

        defaultParams: function () { return { o2: "tissue", temp: 37, pot: "auto", scenario: "typical", cal: "factory", day: 3, apap: false, sub: true }; },

        describeParams: function (t) {

            const p = t.params;

            switch (t.type) {
                case "cal": return { air: "air-saturated", tissue: "tissue oxygen", low: "low oxygen" }[p.o2] + ", " + p.temp + " °C, " + potText(p.pot);
                case "interf": return potText(p.pot);
                case "o2": return potText(p.pot);
                case "cgm": return C.SCENARIOS[p.scenario].name + ", day " + p.day + ", " + (p.cal === "finger" ? "two fingersticks" : "factory calibration") + (p.apap ? ", acetaminophen dose" : "") + (p.sub ? "" : ", no sentinel subtraction");
                default: return "standard settings";
            }
        },

        paramControls: function (type, params) {

            const v = env();
            const out = [];

            const potOptions = POTS.map(function (x) { return { value: x, label: x === "auto" ? "Automatic (suits the enzyme on W)" : "+" + x + " V versus the reference" }; });

            const potHint = "Hydrogen peroxide only oxidises on platinum above about +0.35 V. An osmium-wired enzyme works near +0.2 V. A higher potential also oxidises more interferents, and a lower one may switch the signal off.";

            if (type === "cal") {

                out.push(v.selectChoice("Oxygen in the solution", [
                    { value: "air", label: "Air-saturated (0.2 mM)" },
                    { value: "tissue", label: "Typical tissue (0.06 mM)" },
                    { value: "low", label: "Low-oxygen tissue (0.03 mM)" }
                ], params.o2, function (x) { params.o2 = x; }, "A glucose oxidase sensor needs one oxygen molecule for every glucose. Body tissue holds far less oxygen than a beaker."));

                out.push(v.selectChoice("Temperature", [
                    { value: "37", label: "37 °C (body)" },
                    { value: "25", label: "25 °C (room)" }
                ], String(params.temp), function (x) { params.temp = Number(x); }, "Enzymes and diffusion slow down by about a factor of two for every 10 °C."));

                out.push(v.selectChoice("Applied potential", potOptions, params.pot, function (x) { params.pot = x; }, potHint));
            }

            if (type === "interf" || type === "o2") {

                out.push(v.selectChoice("Applied potential", potOptions, params.pot, function (x) { params.pot = x; }, potHint));
            }

            if (type === "cgm") {

                out.push(v.selectChoice("Blood glucose scenario", Object.keys(C.SCENARIOS).map(function (k) { return { value: k, label: C.SCENARIOS[k].name }; }), params.scenario, function (x) { params.scenario = x; },
                    "The blood glucose curve is the truth the sensor is scored against."));

                out.push(v.selectField("Day of wear", DAYS, params.day, "", function (x) { params.day = x; },
                    "Sensitivity changes through the wear period, so the same sensor reads differently on day 1 and day 10."));

                out.push(v.selectChoice("Calibration", [
                    { value: "factory", label: "Factory calibrated (no fingersticks)" },
                    { value: "finger", label: "Two fingersticks (2 h and 12 h)" }
                ], params.cal, function (x) { params.cal = x; },
                "A factory-calibrated sensor trusts the sensitivity it was made with. Fingersticks correct for how this particular sensor turned out, but a meter is only about 5% accurate."));

                out.push(v.selectChoice("Take 1 g of acetaminophen at 08:00?", [
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" }
                ], params.apap ? "yes" : "no", function (x) { params.apap = x === "yes"; }, "Acetaminophen is oxidised at the electrode and looks like glucose."));

                out.push(v.selectChoice("Subtract the sentinel electrode", [
                    { value: "yes", label: "Yes, if there is one" },
                    { value: "no", label: "No" }
                ], params.sub ? "yes" : "no", function (x) { params.sub = x === "yes"; }, "The sentinel carries the interferents and background without the glucose signal."));
            }

            return out;
        },

        measure: function (type, dev, p) {

            switch (type) {

                case "dmm": return C.check(dev);
                case "cal": return C.calibration(dev, { o2: p.o2, temp: p.temp, E: p.pot });
                case "interf": return C.interferents(dev, { E: p.pot });
                case "o2": return C.oxygen(dev, { E: p.pot });
                case "wear": return C.wear(dev, {});
                case "cgm": return C.dayRun(dev, { scenario: p.scenario, cal: p.cal, day: p.day, apap: p.apap, subtract: p.sub });
                default: return C.insertion(dev);
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

            const color = function (k) { return D.color(k, theme); };

            const bad = devs.filter(function (d) { return !C.working(d); }).length;

            const warnBad = function () {

                if (bad) { container.appendChild(h("p", { className: "lab-note warn", text: bad + " of " + devs.length + " sensors have no working electrode, so there is nothing to measure on them. Open the failure analysis to see why." })); }
            };

            const problemNotes = function (a) {

                (a.problems || []).forEach(function (t) { container.appendChild(h("p", { className: "lab-note warn", text: t })); });
            };

            if (type === "dmm") {

                const rows = [];

                reps.forEach(function (x, k) {

                    (x.ch || []).forEach(function (c) {

                        const label = { ok: "Connected", short: "Shorted to another electrode", open: "Open", blind: "No exposed electrode" }[c.status] || c.status;

                        rows.push(["Sensor " + (k + 1) + ", " + (ELEC[c.d] || c.d), label, c.areaUm2 ? v.fmtArea(c.areaUm2) : "none", METALNAME[c.metal] || c.metal, isFinite(c.rTrace) ? fmtOhm(c.rTrace) : "n/a", filmText(c.films || [])]);
                    });
                });

                container.appendChild(v.table(["Electrode", "Result", "Open area", "Metal", "Trace resistance", "Films, from the metal outwards"], rows));

                const first = reps[0];

                if (first && first.problems && first.problems.length) {

                    first.problems.forEach(function (t) { container.appendChild(h("p", { className: "lab-note warn", text: "Sensor 1: " + t })); });

                } else if (first && first.ok) {

                    container.appendChild(h("p", { className: "lab-note ok", text: "Sensor 1 looks like a working glucose sensor: an enzyme over W, a counter and a reference." }));
                }

                container.appendChild(h("p", { className: "lab-hint", text: "A sensor needs a working electrode with an enzyme, a counter electrode to carry the current and a stable reference. The sentinel is optional but very useful. Films should be stacked from the electrode outwards: a permselective film, the enzyme, then the glucose-limiting membrane and an outer hydrogel." }));

                warnBad();

                return;
            }

            const good = reps.filter(function (x) { return x.ok; });

            if (!good.length) {

                container.appendChild(h("p", { className: "lab-note warn", text: "No working sensor in this batch." }));
                warnBad();

                return;
            }

            if (type === "cal") {

                const a = good[0];

                const stepC = h("canvas", { role: "img" });
                const calC = h("canvas", { role: "img" });

                D.line(stepC, {
                    theme: theme, xLabel: "Time (s)", yLabel: "Working electrode current (nA)", title: "Glucose steps: 0, 100, 200, 400, 100, 0 mg/dL (sensor 1)",
                    series: [{ label: "Current", color: color(0), width: 1.6, x: a.t, y: a.i }]
                });

                const lin = a.G.map(function (g) { return a.bg + (a.I[5] - a.bg) * g / 100; });

                D.line(calC, {
                    theme: theme, xLabel: "Glucose (mg/dL)", yLabel: "Current (nA)", title: "Calibration curve (sensor 1)",
                    series: [
                        { label: "Straight line through 100 mg/dL", color: "#888888", dash: [5, 4], alpha: 0.8, width: 1.3, x: a.G, y: lin },
                        { label: "Measured", color: color(0), width: 2, dots: true, x: a.G, y: a.I }
                    ]
                });

                container.appendChild(h("div", { className: "lab-charts" }, [stepC, calC]));

                problemNotes(a);

                container.appendChild(h("p", { className: "lab-hint", text: "The current should climb in steps with the glucose. The calibration curve should be a straight line: a sensor whose line bends over at high glucose is running out of oxygen or enzyme there and would read low. A thicker limiting membrane lowers the signal and slows the response, but keeps the line straight to higher glucose." }));

                container.appendChild(v.table(["Metric (sensor 1)", "Value"], [
                    ["Applied potential", "+" + sig(a.E) + " V"],
                    ["Sensitivity at 100 mg/dL (nA per mg/dL)", sig(a.slope)],
                    ["Current density sensitivity (µA per mM per cm²)", sig(a.jdens)],
                    ["Linear up to (mg/dL)", a.linMax >= 800 ? "above 800" : String(a.linMax)],
                    ["Background at zero glucose (nA)", sig(a.bg)],
                    ["Noise (pA rms)", sig(a.noise, 2)],
                    ["Detection limit (mg/dL)", sig(a.lod)],
                    ["Response time, 90% (seconds)", sig(a.t90, 2)]
                ]));

                container.appendChild(v.table(["Metric (per sensor)", "Mean ± spread"], [
                    ["Sensitivity (nA per mg/dL)", pm(good.map(function (x) { return x.slope; }))],
                    ["Linear up to (mg/dL)", pm(good.map(function (x) { return x.linMax; }), 0)],
                    ["Response time, 90% (s)", pm(good.map(function (x) { return x.t90; }), 2)]
                ]));

                container.appendChild(h("p", { className: "lab-hint", text: "A real sensor reads about 40 to 400 mg/dL, so it needs to stay linear to at least 400. The delay inside the sensor (the response time) is separate from the delay between blood and tissue fluid, which is about 5 to 10 minutes." }));

                warnBad();

                return;
            }

            if (type === "interf") {

                const a = good[0];

                if (!a.hasEnz) {

                    container.appendChild(h("p", { className: "lab-note warn", text: "There is no enzyme layer on the working electrode, so there is no glucose signal to be fooled. Draw a glucose oxidase layer over W." }));
                }

                const tr = h("canvas", { role: "img" });

                const series = [
                    { label: "True glucose", color: "#888888", dash: [5, 4], alpha: 0.8, width: 1.3, x: a.t, y: a.truth },
                    { label: "Working electrode alone", color: color(0), width: 1.8, x: a.t, y: a.raw }
                ];

                if (a.hasS) { series.push({ label: "After subtracting the sentinel", color: color(2), width: 2.2, x: a.t, y: a.subtracted }); }

                D.line(tr, {
                    theme: theme, xLabel: "Time (s)", yLabel: "Apparent glucose (mg/dL)", title: "Acetaminophen at 100 s, vitamin C at 200 s, uric acid at 300 s (sensor 1)",
                    series: series
                });

                container.appendChild(tr);

                problemNotes(a);

                container.appendChild(h("p", { className: "lab-hint", text: "The true glucose stays at 100 mg/dL. Any rise in the apparent value is a molecule other than glucose being oxidised at the electrode. A permselective film (mPD or Nafion) turns interferents away, a low potential avoids oxidising them at all, and the sentinel measures them directly so they can be subtracted." }));

                container.appendChild(v.table(["Sensor 1", "Level in body fluid (mM)", "False glucose on W alone (mg/dL)", "After sentinel subtraction (mg/dL)"], a.species.map(function (s) {

                    return [s.name, sig(s.conc), sig(s.raw), a.hasS ? sig(s.sub) : "no sentinel"];
                })));

                container.appendChild(v.table(["Metric (per sensor)", "Mean ± spread"], [
                    ["Acetaminophen reading as glucose (mg/dL)", pm(good.map(function (x) { return x.species[0].raw; }), 2)],
                    ["Vitamin C reading as glucose (mg/dL)", pm(good.map(function (x) { return x.species[1].raw; }), 2)],
                    ["Uric acid reading as glucose (mg/dL)", pm(good.map(function (x) { return x.species[2].raw; }), 2)]
                ]));

                container.appendChild(h("p", { className: "lab-hint", text: "The subtraction only works if the sentinel is a fair copy of the working electrode: the same metal, the same size and the same films except the enzyme. If the enzyme layer slows an interferent down on W but S is bare, the sentinel sees more of it and the subtraction overcorrects, giving a negative number." }));

                warnBad();

                return;
            }

            if (type === "o2") {

                const a = good[0];

                if (!a.hasEnz) { container.appendChild(h("p", { className: "lab-note warn", text: "There is no enzyme layer on the working electrode. Draw a glucose oxidase layer over W." })); }

                const cv = h("canvas", { role: "img" });

                D.line(cv, {
                    theme: theme, xLabel: "Glucose (mg/dL)", yLabel: "Glucose current (nA)", title: "Signal at three oxygen levels (sensor 1)",
                    series: a.curves.map(function (c, k) { return { label: c.name, color: color(k), width: 2, dots: true, x: a.G, y: c.I }; })
                });

                container.appendChild(cv);

                problemNotes(a);

                container.appendChild(h("p", { className: "lab-hint", text: "A glucose oxidase sensor makes one hydrogen peroxide for each oxygen it uses. Tissue holds about 100 times less oxygen than glucose, so without a limiting membrane the enzyme runs out of oxygen long before the glucose is measured: the curves flatten and sink as oxygen falls. The membrane holds the glucose back while letting oxygen through. A mediator-wired enzyme does not need oxygen at all, so its curves lie on top of each other." }));

                container.appendChild(v.table(["Sensor 1", "Sensitivity at 100 mg/dL (nA per mg/dL)"], a.curves.map(function (c) { return [c.name, sig(c.slope)]; })));

                container.appendChild(v.table(["Metric (per sensor)", "Mean ± spread"], [
                    ["Signal at 300 mg/dL kept when oxygen falls from air to 0.03 mM (%)", pm(good.map(function (x) { return x.retain300; }), 0)],
                    ["Sensitivity kept at low oxygen (%)", pm(good.map(function (x) { return x.retainSlope; }), 0)],
                    ["Share of the membrane's oxygen supply used at 400 mg/dL (%)", pm(good.map(function (x) { return x.use * 100; }), 0)]
                ]));

                warnBad();

                return;
            }

            if (type === "wear") {

                const a = good[0];

                const sc = h("canvas", { role: "img" });
                const dr = h("canvas", { role: "img" });

                D.line(sc, {
                    theme: theme, xLabel: "Days of wear", yLabel: "Sensitivity (% of day 0)", title: "Sensitivity over two weeks",
                    series: good.map(function (x, k) { return { label: k === 0 ? "Sensor 1" : undefined, color: color(0), alpha: k === 0 ? 1 : 0.35, width: k === 0 ? 2.2 : 1.2, x: x.days, y: x.rel }; })
                        .concat([{ label: "70% limit", color: "#e07070", alpha: 0.8, width: 1.2, dash: [5, 4], x: [0, 14], y: [70, 70] }])
                });

                D.line(dr, {
                    theme: theme, xLabel: "Days of wear", yLabel: "Percent or millivolts", title: "What is going on (sensor 1)",
                    series: [
                        { label: "Enzyme activity (%)", color: color(1), width: 2, x: a.days, y: a.act },
                        { label: "Oxygen near the sensor (%)", color: color(3), width: 2, x: a.days, y: a.o2f },
                        { label: "Reference drift (mV)", color: color(2), width: 2, x: a.days, y: a.ref }
                    ]
                });

                container.appendChild(h("div", { className: "lab-charts" }, [sc, dr]));

                const wm = h("canvas", { role: "img" });

                D.line(wm, {
                    theme: theme, xLabel: "Hours after switching on", yLabel: "Background current (nA)", title: "Warm-up (sensor 1)",
                    series: [{ color: color(0), width: 1.6, x: a.warm.h, y: a.warm.i }]
                });

                container.appendChild(wm);

                problemNotes(a);

                container.appendChild(h("p", { className: "lab-hint", text: "On day 1 the tissue is inflamed and short of oxygen around the new sensor, so the signal dips (the early sensitivity dip) before recovering. Over the next days the enzyme slowly loses activity, proteins and cells foul the surface, and a capsule of scar tissue thickens. Films can peel and the Ag/AgCl reference gets used up. The hydrogel slows the fouling and the tissue reaction. Warm-up is the first hour or two, while the electrode's background current settles." }));

                container.appendChild(v.table(["Sensor 1: events", "Day"], a.events.length ? a.events.map(function (e) { return [e.text, sig(e.day, 2)]; }) : [["Nothing broke in 14 days", "none"]]));

                container.appendChild(v.table(["Metric (per sensor)", "Mean ± spread"], [
                    ["Useful life (days until sensitivity leaves 70 to 130%)", pm(good.map(function (x) { return x.life; }), 0)],
                    ["Lowest sensitivity in the first days (% of day 0)", pm(good.map(function (x) { return x.dip; }), 0)],
                    ["Sensitivity on day 14 (% of day 0)", pm(good.map(function (x) { return x.end; }), 0)],
                    ["Warm-up (hours until the extra background is under 2 mg/dL)", pm(good.map(function (x) { return x.warmHours; }), 2)]
                ]));

                warnBad();

                return;
            }

            if (type === "cgm") {

                const a = good[0];

                const tr = h("canvas", { role: "img" });

                D.line(tr, {
                    theme: theme, xLabel: "Time of day (hours)", yLabel: "Glucose (mg/dL)", title: a.scenario + ", day " + p.day + (a.useS ? ", sentinel subtracted" : "") + " (sensor 1)",
                    series: [
                        { label: "Blood glucose (truth)", color: "#888888", width: 1.6, x: a.t, y: a.blood },
                        { label: "Tissue fluid", color: color(3), width: 1.2, dash: [4, 3], alpha: 0.8, x: a.t, y: a.isf },
                        { label: "Sensor reading", color: color(0), width: 2.2, x: a.t, y: a.meas },
                        { label: "Low limit (70)", color: "#e07070", alpha: 0.7, width: 1, dash: [5, 4], x: [0, 24], y: [70, 70] }
                    ].concat(a.calPoints ? [{ label: "Fingersticks", color: color(2), width: 0, dots: true, x: a.calPoints.map(function (c) { return c.h; }), y: a.calPoints.map(function (c) { return c.g; }) }] : [])
                });

                container.appendChild(tr);

                problemNotes(a);

                container.appendChild(h("p", { className: "lab-hint", text: "The sensor measures the fluid between cells, not blood. Glucose gets there a few minutes late, so the reading trails the blood curve, most visibly after meals. MARD is the mean absolute relative difference from the blood value: lower is better, and about 10% is a good modern sensor. “Within 20/20” counts the readings inside 20 mg/dL (when under 100) or 20% (when over 100)." }));

                container.appendChild(v.table(["Metric", "Sensor 1"], [
                    ["MARD (%)", sig(a.mard)],
                    ["Readings within 15 mg/dL or 15%", sig(a.in15, 3) + " %"],
                    ["Readings within 20 mg/dL or 20%", sig(a.in20, 3) + " %"],
                    ["Time in tissue lag (minutes)", sig(a.lagMin, 2)],
                    ["Low glucose caught (blood under 70)", a.lowN ? sig(a.lowCaught, 3) + " %" : "no lows in this scenario"],
                    ["False low alarms (blood over 85)", sig(a.falseLow, 2) + " %"],
                    ["This sensor's sensitivity compared with the factory value", (a.nominalError >= 0 ? "+" : "") + sig(a.nominalError, 2) + " %"]
                ]));

                container.appendChild(v.table(["Metric (per sensor)", "Mean ± spread"], [
                    ["MARD (%)", pm(good.map(function (x) { return x.mard; }))],
                    ["Within 20/20 (%)", pm(good.map(function (x) { return x.in20; }), 0)]
                ]));

                container.appendChild(h("p", { className: "lab-hint", text: "A factory-calibrated sensor assumes every sensor in the batch is the same, so a sensor that came out 10% more sensitive reads 10% high all day. Two fingersticks fix that, but only if the two values differ enough and the meter is accurate. Switch calibration or turn on the acetaminophen dose and run it again." }));

                warnBad();

                return;
            }

            // insertion
            const withBody = good.filter(function (x) { return !x.noBody; });

            if (!withBody.length) {

                container.appendChild(h("p", { className: "lab-note warn", text: "These sensors have no body layer. Add a substrate layer under the metal and draw the sensor outline on it." }));
                warnBad();

                return;
            }

            const a = withBody[0];

            const bk = h("canvas", { role: "img" });
            const cp = h("canvas", { role: "img" });

            D.line(bk, {
                theme: theme, xLabel: "Free length of the filament (mm)", yLabel: "Load it can take before bending (mN)", xLog: true, yLog: true, title: "Buckling load (sensor 1)",
                series: [
                    { label: "Buckling load", color: color(0), width: 2.2, x: a.curve.L, y: a.curve.p },
                    { label: "Force to push through skin", color: "#e07070", width: 1.4, dash: [5, 4], x: [a.curve.L[0], a.curve.L[a.curve.L.length - 1]], y: [a.fIns, a.fIns] },
                    { label: "Your sensor", color: color(2), width: 0, dots: true, x: [a.L / 1000], y: [a.pcr] }
                ]
            });

            D.line(cp, {
                theme: theme, xLabel: "Days under the skin", yLabel: "Capsule thickness (µm)", title: "Tissue reaction (sensor 1)",
                series: withBody.map(function (x, k) { return { color: color(0), alpha: k === 0 ? 1 : 0.4, width: k === 0 ? 2.2 : 1.2, x: x.capsule.d, y: x.capsule.t }; })
            });

            container.appendChild(h("div", { className: "lab-charts" }, [bk, cp]));

            container.appendChild(h("p", { className: "lab-hint", text: "A thin film is a slender column: it bends under a load far smaller than the skin needs to be pierced, so almost every filament is carried in by a hollow needle or a grooved introducer that is withdrawn afterwards. A thinner, narrower filament lets the needle be smaller and hurts less, and it provokes a thinner capsule. A capsule of scar tissue slows glucose and oxygen reaching the sensor." }));

            container.appendChild(v.table(["Metric", "Mean ± spread"], [
                ["Filament width (µm)", pm(withBody.map(function (x) { return x.sub.w; }), 0)],
                ["Body thickness (µm)", pm(withBody.map(function (x) { return x.sub.t; }), 1)],
                ["Length under the skin (mm)", pm(withBody.map(function (x) { return x.L / 1000; }))],
                ["Buckling load (mN)", pm(withBody.map(function (x) { return x.pcr; }))],
                ["Force to push through skin (mN)", pm(withBody.map(function (x) { return x.fIns; }))],
                ["Safety margin (buckling load ÷ force)", pm(withBody.map(function (x) { return x.margin; }))],
                ["Introducer needle width needed (µm)", pm(withBody.map(function (x) { return x.needle; }), 0)],
                ["Capsule thickness after 14 days (µm)", pm(withBody.map(function (x) { return x.cap14; }))]
            ]));

            container.appendChild(h("p", { className: "lab-note " + (a.buckles ? "warn" : "ok"), text: a.buckles ?
                "Sensor 1 would buckle before it pierced the skin (margin " + sig(a.margin) + "). It needs an introducer needle about " + sig(a.needle, 2) + " µm wide, which is about " + sig(a.pain, 2) + " out of 10 on a rough discomfort scale." :
                "Sensor 1 is stiff enough to push through skin by itself (margin " + sig(a.margin) + ")." }));

            warnBad();
        },

        headline: function (batch) {

            const v = env();
            const out = { sens: null, lin: null, apap: null, o2: null, life: null, mard: null, in20: null, margin: null, cap: null };

            const devs = v.devicesOf(batch);

            const num = function (fn) { return devs.map(function (d) { return C.working(d) ? fn(d) : NaN; }); };

            out.sens = num(function (d) { return C.calibration(d, { o2: "tissue", temp: 37, E: "auto" }).slope; });
            out.lin = num(function (d) { return Math.min(C.calibration(d, { o2: "tissue", temp: 37, E: "auto" }).linMax, 800); });
            out.apap = num(function (d) { return C.interferents(d, { E: "auto" }).species[0].raw; });
            out.o2 = num(function (d) { return C.oxygen(d, { E: "auto" }).retain300; });
            out.life = num(function (d) { return C.wear(d, {}).life; });
            out.mard = num(function (d) { return C.dayRun(d, { scenario: "typical", cal: "factory", day: 3 }).mard; });
            out.in20 = num(function (d) { return C.dayRun(d, { scenario: "typical", cal: "factory", day: 3 }).in20; });
            out.margin = devs.map(function (d) { const r = C.insertion(d); return r.margin !== undefined ? r.margin : NaN; });
            out.cap = devs.map(function (d) { const r = C.insertion(d); return r.cap14 !== undefined ? r.cap14 : NaN; });

            return out;
        },

        tableHead: ["Sensitivity (nA per mg/dL)", "Linear up to (mg/dL)", "False glucose from acetaminophen (mg/dL)", "Signal kept at low oxygen (%)", "Useful life (days)", "MARD (%)", "Within 20/20 (%)", "Buckling margin"],

        tableRow: function (hd) {

            return [
                hd.sens ? pmq(hd.sens, 2) : "n/a",
                hd.lin ? pmq(hd.lin, 0) : "n/a",
                hd.apap ? pmq(hd.apap, 2) : "n/a",
                hd.o2 ? pmq(hd.o2, 0) : "n/a",
                hd.life ? pmq(hd.life, 0) : "n/a",
                hd.mard ? pmq(hd.mard, 2) : "n/a",
                hd.in20 ? pmq(hd.in20, 0) : "n/a",
                hd.margin ? pmq(hd.margin, 1) : "n/a"
            ];
        },

        ranks: [
            { key: "sens", label: "sensitivity", unit: "nA per mg/dL", higher: true, digits: 2 },
            { key: "lin", label: "linear range", unit: "mg/dL", higher: true, digits: 0 },
            { key: "apap", label: "false glucose from acetaminophen", unit: "mg/dL", higher: false, digits: 1 },
            { key: "o2", label: "signal kept at low oxygen", unit: "%", higher: true, digits: 0 },
            { key: "life", label: "useful life", unit: "days", higher: true, digits: 0 },
            { key: "mard", label: "MARD", unit: "%", higher: false, digits: 1 },
            { key: "in20", label: "readings within 20/20", unit: "%", higher: true, digits: 0 },
            { key: "margin", label: "buckling margin", unit: "×", higher: true, digits: 2 },
            { key: "cap", label: "capsule after 14 days", unit: "µm", higher: false, digits: 1 }
        ],

        charts: function (container, batches, theme, colors) {

            const v = env();
            const h = v.h;

            const mk = function (cfg, fn) { const c = h("canvas", { role: "img" }); fn(c, cfg); container.appendChild(c); };

            const calS = [];
            const o2S = [];
            const wearS = [];
            const dayS = [];

            batches.forEach(function (b) {

                const first = function (type, test) {

                    const t = v.lastTest(b.id, type);

                    if (!t) { return null; }

                    return v.measureTest(t).reps.filter(function (x) { return x.ok && (test ? test(x) : true); })[0] || null;
                };

                const c = first("cal");

                if (c) { calS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, dots: true, x: c.G, y: c.I }); }

                const o = first("o2");

                if (o) { o2S.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, dots: true, x: o.G, y: o.curves[2].I }); }

                const w = first("wear");

                if (w) { wearS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, x: w.days, y: w.rel }); }

                const d = first("cgm");

                if (d) { dayS.push({ label: v.shortName(b), color: colors[b.id], width: 2, x: d.t, y: d.meas }); }
            });

            if (calS.length) { mk({ theme: theme, xLabel: "Glucose (mg/dL)", yLabel: "Current (nA)", title: "Glucose calibration (sensor 1)", series: calS }, D.line); }
            if (o2S.length) { mk({ theme: theme, xLabel: "Glucose (mg/dL)", yLabel: "Current (nA)", title: "Signal at low oxygen, 0.03 mM (sensor 1)", series: o2S }, D.line); }
            if (wearS.length) { mk({ theme: theme, xLabel: "Days of wear", yLabel: "Sensitivity (% of day 0)", title: "Sensitivity over two weeks (sensor 1)", series: wearS }, D.line); }

            if (dayS.length) {

                const t = v.lastTest(batches[0].id, "cgm") || v.lastTest(batches[batches.length - 1].id, "cgm");
                const ref = t ? v.measureTest(t).reps.filter(function (x) { return x.ok; })[0] : null;

                if (ref) { dayS.unshift({ label: "Blood glucose", color: "#888888", width: 1.4, dash: [5, 4], x: ref.t, y: ref.blood }); }

                mk({ theme: theme, xLabel: "Time of day (hours)", yLabel: "Glucose (mg/dL)", title: "A simulated day (sensor 1)", series: dayS }, D.line);
            }

            return [
                { key: "sens", title: "Sensitivity (mean ± SD)", yLabel: "nA per mg/dL" },
                { key: "lin", title: "Linear range (mean ± SD)", yLabel: "mg/dL" },
                { key: "apap", title: "False glucose from acetaminophen (mean ± SD)", yLabel: "mg/dL" },
                { key: "o2", title: "Signal kept at low oxygen (mean ± SD)", yLabel: "%" },
                { key: "life", title: "Useful life (mean ± SD)", yLabel: "days" },
                { key: "mard", title: "MARD against blood glucose (mean ± SD)", yLabel: "%" },
                { key: "in20", title: "Readings within 20/20 (mean ± SD)", yLabel: "%" },
                { key: "margin", title: "Buckling margin (mean ± SD)", yLabel: "buckling load ÷ force" }
            ];
        },

        analysis: function (dv, inf) {

            const v = env();
            const out = [];

            const chans = dv.ch || [];

            if (chans.length) {

                out.push(v.table(["Electrode", "Result", "Open area", "Metal and films", "Trace resistance", "Chance of a pinhole"], chans.map(function (c) {

                    const films = (c.coats || []).map(function (x) { return (FILMNAME[x.mat] || x.mat) + " (" + Math.round(x.cover * 100) + "% covered)"; });

                    return [ELEC[c.d] || c.d, c.status === "ok" ? "working" : c.status, c.areaUm2 ? v.fmtArea(c.areaUm2) : "none",
                        (METALNAME[c.metal] || c.metal) + (films.length ? " + " + films.join(", ") : ""),
                        isFinite(c.rTrace) ? fmtOhm(c.rTrace) : "n/a", Math.round(c.pPin * 1000) / 10 + " %"];
                })));
            }

            if (dv.sub) {

                out.push(v.table(["Sensor body", "Value"], [
                    ["Material and thickness", (E.NEURAL_SUBSTRATES[dv.sub.material] || {}).name + ", " + v.sig(dv.sub.t) + " µm"],
                    ["Width of the filament / width at the tip", v.fmtLen(dv.sub.w) + " / " + v.fmtLen(dv.sub.tipW)],
                    ["Length under the skin", v.fmtLen(dv.sub.L)]
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

        processExtras: function (panel) {

            const v = env();
            const h = v.h;

            panel.appendChild(h("p", { className: "lab-hint", text: "A sensor is built from the bottom up: the film body first, then the metal electrodes, traces and pads, the insulation with its windows, and finally the chemistry. The chemistry goes on from the inside out: a permselective film on the electrode, the enzyme, the glucose-limiting membrane and an outer hydrogel. The order of the coating layers in your stack is the order they sit on the electrode. Thicknesses and materials are chosen in the layer cards below." }));
        },

        designRows: function (d) {

            const pads = E.padsOf(d).filter(function (p) { return /^[WSRC]$/.test(p.label); });
            const sub = d.layers.filter(function (l) { return l.role === "substrate" && l.shapes.length; })[0];
            const coats = d.layers.filter(function (l) { return l.role === "coating" && l.shapes.length; });

            return [
                ["Electrodes (named pads)", Array.from(new Set(pads.map(function (p) { return p.label; }))).sort().join(", ") || "none yet"],
                ["Sensor body", sub ? E.NEURAL_SUBSTRATES[sub.material].name.split(" (")[0] + ", " + sub.thickness + " µm" : "none yet"],
                ["Films, inside to outside", coats.length ? coats.map(function (l) { return (FILMNAME[l.material] || l.material); }).join(" → ") : "none"]
            ];
        },

        batchInfo: function (snap) {

            const coats = snap.layers.filter(function (l) { return l.role === "coating" && l.shapes.length; });
            const enz = coats.filter(function (l) { return l.material === "gox" || l.material === "osgox"; })[0];

            return (enz ? (enz.material === "osgox" ? "wired enzyme" : "glucose oxidase") : "no enzyme") + ", " + (coats.length ? coats.length + " film" + (coats.length > 1 ? "s" : "") : "no films");
        },

        layerExtras: function (layer, body) {

            const v = env();
            const h = v.h;

            if (layer.role === "substrate") {

                const m = E.NEURAL_SUBSTRATES[layer.material];

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb + " Young's modulus " + v.sig(m.E) + " GPa." }));
                body.appendChild(h("p", { className: "lab-hint", text: "A thicker body is stiffer, which helps with insertion, but it makes a bigger wound and a thicker capsule." }));

                return true;
            }

            if (layer.role === "coating") {

                const m = E.NEURAL_COATINGS[layer.material];
                const ph = C.FILM[layer.material];

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb }));

                const tips = {
                    gox: "Needs oxygen and a high potential (about +0.6 V on platinum). More enzyme means more capacity, but beyond a few micrometres it only slows the response.",
                    osgox: "Works at about +0.2 V on gold, platinum or carbon, so oxygen and interferents matter much less. Osmium can slowly leach out.",
                    mpd: "A very thin film: a few tens of nanometres is enough. Put it directly on the metal, under the enzyme.",
                    nafion: "Keeps out negative ions such as ascorbate and urate but lets neutral acetaminophen through.",
                    pu: "Put it above the enzyme. Thicker means a lower, slower, straighter response and less oxygen trouble. Under the enzyme it does nothing useful.",
                    hydrogel: "Put it on the outside. It cuts fouling and the tissue reaction and barely slows the sensor."
                };

                if (ph && tips[layer.material]) { body.appendChild(h("p", { className: "lab-hint", text: tips[layer.material] })); }

                return true;
            }

            if (layer.role === "collector") {

                const m = E.METALS[layer.material];
                const ph = C.METAL[layer.material] || {};

                body.appendChild(h("p", { className: "lab-muted", text: m.name + (ph.h2o2 !== undefined ? " · oxidises hydrogen peroxide " + (ph.h2o2 >= 1 ? "very well" : ph.h2o2 >= 0.25 ? "moderately" : "poorly") : "") + (layer.material === "agcl" ? " · use it for the reference electrode (pad R)" : "") + (layer.material === "c" ? " · carbon traces are resistive: keep them short and wide" : "") }));

                return true;
            }

            return false;
        },

        thicknessRange: function (layer) {

            if (layer.role === "substrate") { return { min: 10, max: 150, step: 1 }; }
            if (layer.role === "coating") { return { min: 0.01, max: 30, step: 0.01 }; }
            if (layer.role === "collector") { return layer.material === "c" ? { min: 1, max: 30, step: 0.5 } : { min: 0.05, max: 1, step: 0.01 }; }
            if (layer.role === "insulation") { return { min: 0.2, max: 10, step: 0.1 }; }

            return null;
        }
    };

    K.cgm = impl;

}(typeof window !== "undefined" ? window : globalThis));
