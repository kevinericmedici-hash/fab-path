/* ========================================
   LAB KIND: BLOOD-BRAIN BARRIER CHIP

   Tests, charts, comparison metrics and process extras for the "bbb" kind:
   the leak and continuity check, flow and shear, TEER over time,
   impedance spectra (Nyquist and Bode), tracer permeability and barrier
   challenges. The cell culture is set in the Process step.

   Needs window.LabBBB (lab-bbb-model.js) and window.LabKinds.env.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;
    const D = root.SCLabDraw;
    const E = root.LabEngine;
    const B = root.LabBBB;

    const K = root.LabKinds = root.LabKinds || {};

    function env() { return K.env; }


    const TESTS = [
        { id: "dmm", name: "Leak and continuity check", blurb: "Before any cells: does fluid reach both channels, do the channels stay apart, and do the electrodes touch the medium?" },
        { id: "flow", name: "Flow and shear stress", blurb: "How much pressure and wall shear stress a flow rate makes in each channel. Brain endothelium likes about 4 to 20 dyn/cm²." },
        { id: "teer", name: "TEER over time", blurb: "Read the barrier resistance each day at one frequency, like a volt-ohm meter at the bench. Shows the barrier forming." },
        { id: "eis", name: "Impedance spectrum (Nyquist and Bode)", blurb: "Sweep the frequency to separate the medium, the cell layer and the electrodes. Gives TEER and the cell layer capacitance." },
        { id: "papp", name: "Permeability (tracer assay)", blurb: "Add a tracer to the blood side and measure how much reaches the brain side. Gives the apparent permeability Papp." },
        { id: "challenge", name: "Barrier challenge", blurb: "Open the barrier with an inflammatory signal, osmotic shock or oxygen starvation and watch TEER fall and recover." }
    ];

    const FLOWS = [0, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
    const FLOWS_B = [0, 0.5, 1, 2, 5, 10, 20, 50];


    function choice(v, list, def) { return list.indexOf(v) >= 0 ? v : def; }

    function numOr(q, key, lo, hi, def, num) { return num(q[key], lo, hi, def); }

    function nearest(list, v) {

        let best = list[0];

        list.forEach(function (x) { if (Math.abs(x - v) < Math.abs(best - v)) { best = x; } });

        return best;
    }

    function fmtOhm(v) {

        const sig = env().sig;

        if (!isFinite(v)) { return "open"; }
        if (v >= 1e6) { return sig(v / 1e6) + " MΩ"; }
        if (v >= 1e3) { return sig(v / 1e3) + " kΩ"; }

        return sig(v) + " Ω";
    }

    // Mean and spread, but without a spread that is only rounding noise (shear and pressure do not vary between chips).
    function pmq(values, d) {

        const v = env();
        const clean = values.filter(isFinite);
        const m = v.mean(clean);

        return clean.length > 1 && v.sd(clean) < 0.002 * Math.abs(m) ? v.sig(m, d) : v.pm(values, d);
    }

    function fmtVol(ul) { return ul < 0.1 ? env().sig(ul * 1000) + " nL" : env().sig(ul) + " µL"; }

    function fmtPressure(pa) { return pa >= 1000 ? env().sig(pa / 1000) + " kPa" : env().sig(pa) + " Pa"; }

    function median(a) {

        const s = a.filter(isFinite).slice().sort(function (x, y) { return x - y; });

        return s.length ? s[Math.floor(s.length / 2)] : NaN;
    }


    function bodeMag(z) { return z.f.map(function (f, k) { return Math.hypot(z.re[k], z.im[k]); }); }

    function bodePhase(z) { return z.f.map(function (f, k) { return Math.atan2(-z.im[k], z.re[k]) * 180 / Math.PI; }); }


    /* ------------------------------------------------
       CULTURE SETTINGS
    ------------------------------------------------ */

    function cleanCulture(raw, num) {

        raw = raw && typeof raw === "object" ? raw : {};

        return {
            cells: choice(raw.cells, Object.keys(B.CELLS), "hcmec"),
            co: choice(raw.co, Object.keys(B.COCULTURE), "none"),
            coat: choice(raw.coat, Object.keys(B.COATINGS), "col4"),
            days: Math.round(num(raw.days, 1, 21, 7)),
            flow: num(raw.flow, 0, 500, 5),
            flowB: num(raw.flowB, 0, 50, 1)
        };
    }

    function cultureOf(d) {

        if (!d.culture) { d.culture = cleanCulture({}, function (v, lo, hi, def) { return def; }); }

        return d.culture;
    }


    /* ------------------------------------------------
       THE KIND
    ------------------------------------------------ */

    const impl = {

        id: "bbb",

        testLead: "Cells are grown in the chip for the number of days set in the Process step, then you measure the barrier the way a lab would: electrical resistance (TEER), an impedance scan, a tracer that leaks through, and challenges that open it. Each test runs on every chip in the batch. Start with the leak check.",

        tests: function () { return TESTS; },
        defaultTest: "dmm",

        cleanCulture: cleanCulture,

        cleanParams: function (q, num) {

            q = q || {};

            return {
                freq: choice(Number(q.freq), [10, 12.5, 100, 1000], 12.5),
                fmin: choice(Number(q.fmin), [1, 10, 100], 1),
                q: nearest(FLOWS.slice(1), num(q.q, 0.1, 500, 20)),
                qB: nearest(FLOWS_B, num(q.qB, 0, 50, 0)),
                tracer: choice(q.tracer, Object.keys(B.TRACERS), "fluor"),
                agent: choice(q.agent, Object.keys(B.CHALLENGES), "tnf")
            };
        },

        defaultParams: function (batch, devs) {

            const cu = devs && devs[0] && devs[0].culture ? devs[0].culture : {};

            return { freq: 12.5, fmin: 1, q: cu.flow > 0 ? nearest(FLOWS.slice(1), cu.flow) : 20, qB: 0, tracer: "fluor", agent: "tnf" };
        },

        describeParams: function (t) {

            const p = t.params;

            switch (t.type) {
                case "flow": return "apical flow " + p.q + " µL/min";
                case "teer": return "read at " + p.freq + " Hz";
                case "eis": return p.fmin + " Hz to 1 MHz";
                case "papp": return (B.TRACERS[p.tracer] || {}).name + ", " + (p.qB > 0 ? "flow " + p.qB + " µL/min on the brain side" : "static brain side");
                case "challenge": return (B.CHALLENGES[p.agent] || {}).name;
                default: return "standard settings";
            }
        },

        paramControls: function (type, params) {

            const v = env();
            const out = [];

            if (type === "flow") {

                out.push(v.selectField("Flow in the blood-side channel", FLOWS.slice(1), params.q, "µL/min", function (x) { params.q = x; },
                    "The brain-side channel is run at the rate set in the Process step. Shear stress grows in proportion to the flow and falls with the square of the channel height."));
            }

            if (type === "teer") {

                out.push(v.selectChoice("Measurement frequency", [
                    { value: "10", label: "10 Hz" }, { value: "12.5", label: "12.5 Hz (standard handheld meter)" },
                    { value: "100", label: "100 Hz" }, { value: "1000", label: "1 kHz" }
                ], String(params.freq), function (x) { params.freq = Number(x); },
                "Too low and the electrodes' own impedance swamps the reading. Too high and the cell layer's capacitance short-circuits its resistance. Try 12.5 Hz and 1 kHz and compare."));
            }

            if (type === "eis") {

                out.push(v.selectChoice("Lowest frequency", [
                    { value: "1", label: "1 Hz" }, { value: "10", label: "10 Hz" }, { value: "100", label: "100 Hz" }
                ], String(params.fmin), function (x) { params.fmin = Number(x); },
                "A low start frequency shows the electrodes' behaviour. A higher one only sees the medium and the cell layer."));
            }

            if (type === "papp") {

                out.push(v.selectChoice("Tracer on the blood side", Object.keys(B.TRACERS).map(function (k) { return { value: k, label: B.TRACERS[k].name }; }), params.tracer,
                    function (x) { params.tracer = x; },
                    "Small molecules cross more easily than big ones. A lipophilic drug sticks to PDMS. Rhodamine 123 is pumped back out by P-glycoprotein."));

                out.push(v.selectField("Flow on the brain side during the assay", FLOWS_B, params.qB, "µL/min", function (x) { params.qB = x; },
                    "With no flow the brain channel slowly fills and the concentration climbs. With flow it settles at a steady value. A leaky barrier fills a tiny static channel within minutes, so the early slope underestimates it."));
            }

            if (type === "challenge") {

                out.push(v.selectChoice("Challenge", Object.keys(B.CHALLENGES).map(function (k) { return { value: k, label: B.CHALLENGES[k].name }; }), params.agent,
                    function (x) { params.agent = x; v.refreshParams(); }, (B.CHALLENGES[params.agent] || {}).blurb));
            }

            return out;
        },

        measure: function (type, dev, p) {

            switch (type) {

                case "dmm": return B.check(dev);
                case "flow": return B.flowTest(dev, { q: p.q, qB: B.cultureOf(dev).flowB });
                case "teer": return B.teerSeries(dev, { freq: p.freq });
                case "eis": return B.eis(dev, { fmin: p.fmin });
                case "papp": return B.permeability(dev, { tracer: p.tracer, qB: p.qB });
                default: return B.challenge(dev, { agent: p.agent });
            }
        },

        view: function (container, r, theme, colorIndex) {

            const v = env();
            const h = v.h;
            const sig = v.sig;
            const col = D.color(colorIndex, theme);

            const pm = pmq;
            const type = r.test.type;
            const reps = r.reps;
            const p = r.test.params;
            const alpha = function (k) { return k === 0 ? 1 : 0.45; };
            const devs = v.devicesOf(r.batch);

            const bad = devs.filter(function (d) { return !B.working(d); }).length;

            const warnBad = function () {

                if (bad) { container.appendChild(h("p", { className: "lab-note warn", text: bad + " of " + devs.length + " chips do not hold fluid or keep their channels apart, so there is nothing to measure on them. Open the failure analysis to see why." })); }
            };

            const good = reps.filter(function (x) { return x.ok; });

            if (type === "dmm") {

                const label = { ok: "Holds fluid", leaky: "Leaks", blocked: "Blocked", crosstalk: "Channels connected", lost: "Not printed" };

                container.appendChild(v.table(["Chip", "Result", "Medium and electrodes at 1 kHz, no cells", "Electrodes in", "Fluid volume (blood / brain side)"], reps.map(function (x, k) {

                    return ["Chip " + (k + 1), label[x.kind] || x.kind,
                        x.z1k ? fmtOhm(x.z1k) : "n/a",
                        x.z1k ? (x.noSide ? "no fluid" : x.sameSide ? "the same channel" : "different channels") : "n/a",
                        x.volA !== undefined ? fmtVol(x.volA) + " / " + fmtVol(x.volB) : "n/a"];
                })));

                reps.forEach(function (x, k) {

                    if (x.leaky) { container.appendChild(h("p", { className: "lab-note warn", text: "Chip " + (k + 1) + ": dye seeps out along the bond. A rough or poorly baked wall film lifts at the edges." })); }
                    if (x.sameSide) { container.appendChild(h("p", { className: "lab-note warn", text: "Chip " + (k + 1) + ": both electrodes sit in the same channel, so no current would cross the barrier." })); }
                    if (x.noSide) { container.appendChild(h("p", { className: "lab-note warn", text: "Chip " + (k + 1) + ": an electrode does not touch the medium (it is under a wall film or insulation)." })); }
                });

                container.appendChild(h("p", {
                    className: "lab-note " + (reps.every(function (x) { return x.kind === "ok" && !x.sameSide && !x.noSide; }) ? "ok" : "warn"),
                    text: reps.every(function (x) { return x.kind === "ok" && !x.sameSide && !x.noSide; }) ? "All chips hold fluid, keep the channels apart and have an electrode on each side. That is the minimum for a barrier chip." :
                        "At least one chip has a fault. Open the failure analysis below for the cause."
                }));

                return;
            }

            if (!good.length) {

                container.appendChild(h("p", { className: "lab-note warn", text: "No working chip in this batch." }));
                warnBad();

                return;
            }

            if (type === "flow") {

                const a = good[0];

                const cvA = h("canvas", { role: "img" });
                const cvB = h("canvas", { role: "img" });

                D.line(cvA, {
                    theme: theme, xLabel: "Flow (µL/min)", yLabel: "Wall shear stress (dyn/cm²)", xLog: true, yLog: true, title: "Shear stress vs flow (chip 1)",
                    series: [
                        { label: "Blood-side channel", color: col, width: 2.2, x: a.q, y: a.tau },
                        { label: "Brain-side channel", color: D.color(colorIndex + 2, theme), width: 2, dash: [5, 4], x: a.q, y: a.tauB }
                    ].concat([{ label: "Physiological 10", color: "#888888", alpha: 0.5, width: 1, dash: [2, 3], x: [a.q[0], a.q[a.q.length - 1]], y: [10, 10] }])
                });

                D.line(cvB, {
                    theme: theme, xLabel: "Flow (µL/min)", yLabel: "Pressure drop along the channel (Pa)", xLog: true, yLog: true, title: "Pressure vs flow (blood side, chip 1)",
                    series: good.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.q, y: x.dp }; })
                });

                container.appendChild(h("div", { className: "lab-charts" }, [cvA, cvB]));

                container.appendChild(h("p", { className: "lab-hint", text: "Both axes are logarithmic: shear stress is proportional to flow (a straight line at 45°). The dotted line is the 10 dyn/cm² that brain endothelium meets in vivo. A shallow, narrow channel reaches it at a far lower flow than a wide, deep one." }));

                container.appendChild(v.table(["At " + p.q + " µL/min", "Mean ± spread"], [
                    ["Mean shear stress, blood side (dyn/cm²)", pm(good.map(function (x) { return x.at.tau; }))],
                    ["Peak shear stress at the narrowest point (dyn/cm²)", pm(good.map(function (x) { return x.at.tauPeak; }))],
                    ["Shear stress, brain side at its set flow (dyn/cm²)", pm(good.map(function (x) { return x.at.tauB; }))],
                    ["Pressure drop, blood side (Pa)", pm(good.map(function (x) { return x.at.dpA; }))],
                    ["Pressure pushing fluid through the membrane (Pa)", pm(good.map(function (x) { return x.at.dpMem; }))],
                    ["Mean velocity (mm/s)", pm(good.map(function (x) { return x.at.vel; }))],
                    ["Reynolds number (laminar is below 2000)", pm(good.map(function (x) { return x.at.re; }))],
                    ["Time for fluid to cross the channel (s)", pm(good.map(function (x) { return x.at.res; }), 0)]
                ]));

                container.appendChild(h("p", { className: "lab-note " + (a.at.tau > 40 ? "warn" : "ok"), text: a.atWall }));

                warnBad();

                return;
            }

            if (type === "teer") {

                const cv = h("canvas", { role: "img" });

                D.line(cv, {
                    theme: theme, xLabel: "Days in culture", yLabel: "TEER (Ω·cm²)", title: "TEER at " + p.freq + " Hz",
                    series: good.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, dots: k === 0, x: x.days, y: x.teer }; })
                });

                container.appendChild(cv);

                container.appendChild(h("p", { className: "lab-hint", text: "A bare membrane reads a few ohm·cm². The cells cover it over a few days, then their tight junctions mature and TEER climbs. Primary cells fade after about a week. A chip can also lose its cells to a bubble or a contamination, which shows as a sudden collapse." }));

                const day = good[0].day;

                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["TEER on day " + day + " (Ω·cm²)", pm(good.map(function (x) { return x.atDay; }), 0)],
                    ["Highest TEER seen (Ω·cm²)", pm(good.map(function (x) { return x.peak; }), 0)],
                    ["Day of the highest TEER", pm(good.map(function (x) { return x.peakDay; }), 0)],
                    ["Reading noise on day " + day + " (%)", pm(good.map(function (x) { return x.noise * 100; }), 1)],
                    ["Electrode impedance at " + p.freq + " Hz (both together)", pm(good.map(function (x) { return x.zEl; }), 0) + " Ω"],
                    ["Wall shear stress on the cells (dyn/cm²)", pm(good.map(function (x) { return x.fs.tau; }))]
                ]));

                container.appendChild(h("p", { className: "lab-hint", text: "The TEER value is the resistance times the barrier area, as papers report it. The electrodes only cover part of the membrane in many layouts, so the number can read high. Check the share of the membrane the electrodes cover in the failure analysis." }));

                const hi = good.filter(function (x) { return x.zEl > 2 * x.rbAt; }).length;

                if (hi) { container.appendChild(h("p", { className: "lab-note warn", text: "On " + hi + " chip" + (hi > 1 ? "s" : "") + " the electrodes' own impedance at " + p.freq + " Hz is larger than the cell layer's resistance, so the reading is noisy. A non-polarising electrode (Ag/AgCl) or a larger one fixes this." })); }

                warnBad();

                return;
            }

            if (type === "eis") {

                const fitRs = median(good.map(function (x) { return x.fit.rs; }));
                const fitRb = median(good.map(function (x) { return x.fit.rb; }));

                const nyq = h("canvas", { role: "img" });

                D.line(nyq, {
                    theme: theme, xLabel: "Z′, real (Ω)", yLabel: "−Z″, imaginary (Ω)", title: "Nyquist plot, " + p.fmin + " Hz to 1 MHz",
                    equal: true, xMin: 0, yMin: 0, xMax: 1.6 * (fitRs + fitRb),
                    series: good.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2 : 1.2, dots: k === 0, x: x.re, y: x.im }; })
                });

                container.appendChild(nyq);

                container.appendChild(h("p", { className: "lab-hint", text: "The left intercept is the medium and membrane resistance. The semicircle is the cell layer: its width is the barrier resistance Rb and its top frequency is set by Rb and the capacitance. The tail climbing at low frequency is the electrodes charging up. The view is zoomed on the cell layer." }));

                const bodeA = h("canvas", { role: "img" });
                const bodeB = h("canvas", { role: "img" });

                D.line(bodeA, {
                    theme: theme, xLabel: "Frequency (Hz)", yLabel: "|Z|, impedance magnitude (Ω)", xLog: true, yLog: true, title: "Bode plot: magnitude (dashed: no cells)",
                    series: good.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.f, y: bodeMag(x) }; }).concat([{
                        label: "No cells", color: "#888888", alpha: 0.6, width: 1.4, dash: [5, 4], x: good[0].f, y: good[0].f.map(function (f, k) { return Math.hypot(good[0].bre[k], good[0].bim[k]); })
                    }])
                });

                D.line(bodeB, {
                    theme: theme, xLabel: "Frequency (Hz)", yLabel: "Phase angle (°)", xLog: true, yMin: -95, yMax: 5, title: "Bode plot: phase",
                    series: good.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.f, y: bodePhase(x) }; })
                });

                container.appendChild(h("div", { className: "lab-charts" }, [bodeA, bodeB]));

                container.appendChild(h("p", { className: "lab-hint", text: "In the Bode plot the cells lift the magnitude between about 10 Hz and 10 kHz compared with the empty chip (dashed). Above 100 kHz only the medium is seen. Phase swings toward −90° where a capacitor dominates: the cell membranes in the middle, the electrodes at the lowest frequencies." }));

                container.appendChild(v.table(["Fitted from the spectrum", "Mean ± spread"], [
                    ["Medium and membrane resistance Rs (Ω)", pm(good.map(function (x) { return x.fit.rs; }))],
                    ["Barrier resistance Rb (Ω)", pm(good.map(function (x) { return x.fit.rb; }), 0)],
                    ["TEER = Rb × membrane area (Ω·cm²)", pm(good.map(function (x) { return x.fit.teer; }), 0)],
                    ["TEER = Rb × the area the current really crosses (Ω·cm²)", pm(good.map(function (x, k) { return x.fit.rb * x.truth.aEff; }), 0)],
                    ["Cell layer capacitance (µF/cm²)", pm(good.map(function (x) { return x.fit.cPerArea; }))],
                    ["Fit error (relative)", pm(good.map(function (x) { return x.fit.err; }), 2)]
                ]));

                container.appendChild(h("p", { className: "lab-hint", text: "Real cell layers have capacitance of about 1 to 3 µF/cm². A much smaller value means patches without cells. The two TEER rows differ when the electrodes cover only part of the membrane: the second uses only the area that carries current." }));

                warnBad();

                return;
            }

            if (type === "papp") {

                const cv = h("canvas", { role: "img" });
                const tr = good[0].tr;

                D.line(cv, {
                    theme: theme, xLabel: "Time (min)", yLabel: "Tracer on the brain side (% of the blood-side value)", title: tr.name + ": brain-side concentration",
                    series: good.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, dots: k === 0, x: x.t, y: x.c }; })
                });

                container.appendChild(cv);

                container.appendChild(h("p", { className: "lab-hint", text: "The tracer crosses by the gaps between cells (set by TEER), through the cells, through the membrane pores and through a layer of still water on each side. The slowest of these sets the permeability. A pressure difference between the channels also pushes fluid through the pores." }));

                container.appendChild(v.table(["Metric", "Mean ± spread"], [
                    ["Apparent permeability Papp (10⁻⁶ cm/s)", pm(good.map(function (x) { return x.papp * 1e6; }), 2)],
                    ["TEER of the same chips (Ω·cm²)", pm(good.map(function (x) { return x.teer; }), 0)],
                    ["Tracer recovered (not lost to the walls)", pm(good.map(function (x) { return x.recovery * 100; }), 0) + " %"],
                    ["Time for the brain channel to fill (min)", pm(good.map(function (x) { return x.tEq; }), 0)],
                    ["Pressure difference across the membrane (Pa)", pm(good.map(function (x) { return x.dpMem; }))]
                ]));

                if (good.some(function (x) { return !x.sink && p.qB === 0 && x.tEq < 25; })) {

                    container.appendChild(h("p", { className: "lab-note warn", text: "The brain channel filled almost completely within about " + Math.round(median(good.map(function (x) { return x.tEq; }))) + " minutes, so the early slope no longer follows the true rate (the sink condition fails). Use a faster sampling schedule or put flow on the brain side." }));
                }

                if (good.some(function (x) { return x.recovery < 0.7; })) {

                    container.appendChild(h("p", { className: "lab-note warn", text: "Over 30% of the tracer is missing: it sticks to the channel walls (PDMS soaks up lipophilic drugs). The permeability reads too low." }));
                }

                if (good.some(function (x) { return x.c[x.c.length - 1] < 0.3; })) {

                    container.appendChild(h("p", { className: "lab-note warn", text: "On some chips the signal stays near the reader's noise, so the barrier is tighter than this assay can resolve. Use a brighter, smaller tracer or a longer assay." }));
                }

                container.appendChild(h("p", { className: "lab-hint", text: "Literature values for a leaky human line like hCMEC/D3 are around 10⁻⁵ cm/s for sodium fluorescein, and good stem-cell models reach 10⁻⁶ to 10⁻⁷ cm/s. They vary a lot between labs." }));

                warnBad();

                return;
            }

            // challenge
            const cv = h("canvas", { role: "img" });
            const g0 = good[0];

            D.line(cv, {
                theme: theme, xLabel: "Hours after adding the challenge", yLabel: "TEER (Ω·cm²)", title: (B.CHALLENGES[g0.agent] || {}).name,
                series: good.map(function (x, k) { return { color: col, alpha: alpha(k), width: k === 0 ? 2.2 : 1.4, x: x.h, y: x.teer }; })
            });

            container.appendChild(cv);

            container.appendChild(h("p", { className: "lab-hint", text: (B.CHALLENGES[g0.agent] || {}).blurb + " Compare the same challenge on chips made with different cells, co-culture or flow: a barrier that starts tighter is not always the one that recovers best." }));

            container.appendChild(v.table(["Metric", "Mean ± spread"], [
                ["TEER before the challenge (Ω·cm²)", pm(good.map(function (x) { return x.base; }), 0)],
                ["Lowest TEER (% of before)", pm(good.map(function (x) { return x.base > 0 ? x.min / x.base * 100 : NaN; }), 0)],
                ["Hours to the lowest point", pm(good.map(function (x) { return x.minH; }), 0)],
                ["TEER after 48 h (% of before)", pm(good.map(function (x) { return x.base > 0 ? x.end / x.base * 100 : NaN; }), 0)],
                ["Share of the lost TEER that came back (%)", pm(good.map(function (x) { return x.recoverPct; }), 0)]
            ]));

            warnBad();
        },

        headline: function (batch) {

            const v = env();
            const out = { teer: null, papp: null, shear: null, area: null, rhyd: null };

            const teT = v.lastTest(batch.id, "teer");
            const eiT = v.lastTest(batch.id, "eis");
            const paT = v.lastTest(batch.id, "papp");

            const devs = v.devicesOf(batch);

            if (teT) { out.teer = v.measureTest(teT).reps.map(function (x) { return x.ok ? x.atDay : NaN; }); }
            else if (eiT) { out.teer = v.measureTest(eiT).reps.map(function (x) { return x.ok ? x.fit.teer : NaN; }); }

            if (paT) { out.papp = v.measureTest(paT).reps.map(function (x) { return x.ok ? x.papp * 1e6 : NaN; }); }

            out.shear = devs.map(function (d) { return B.working(d) ? B.flowStats(d, B.cultureOf(d).flow, B.cultureOf(d).flowB).tau : NaN; });
            out.area = devs.map(function (d) { return B.working(d) ? d.aB * 100 : NaN; });
            out.rhyd = devs.map(function (d) { return B.working(d) ? d.apical.rHyd * 1e-11 * 1.6667 : NaN; });

            return out;
        },

        tableHead: ["TEER (Ω·cm²)", "Papp (10⁻⁶ cm/s)", "Shear (dyn/cm²)", "Barrier area (mm²)", "Flow resistance (Pa per µL/min)"],

        tableRow: function (hd) {

            const pm = pmq;

            return [
                hd.teer ? pm(hd.teer, 0) : "not tested",
                hd.papp ? pm(hd.papp, 2) : "not tested",
                hd.shear ? pm(hd.shear) : "n/a",
                hd.area ? pm(hd.area) : "n/a",
                hd.rhyd ? pm(hd.rhyd) : "n/a"
            ];
        },

        ranks: [
            { key: "teer", label: "TEER", unit: "Ω·cm²", higher: true, digits: 0 },
            { key: "papp", label: "tracer permeability", unit: "×10⁻⁶ cm/s", higher: false }
        ],

        charts: function (container, batches, theme, colors) {

            const v = env();
            const h = v.h;

            const mk = function (cfg, fn) { const c = h("canvas", { role: "img" }); fn(c, cfg); container.appendChild(c); };

            const teerS = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "teer");

                if (!t) { return; }

                const r = v.measureTest(t).reps.filter(function (x) { return x.ok; })[0];

                if (r) { teerS.push({ label: v.shortName(b), color: colors[b.id], x: r.days, y: r.teer, width: 2.2 }); }
            });

            if (teerS.length) { mk({ theme: theme, xLabel: "Days in culture", yLabel: "TEER (Ω·cm²)", title: "TEER over time (chip 1)", series: teerS }, D.line); }

            const nyqS = [];
            const bodeS = [];
            let reach = 0;

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "eis");

                if (!t) { return; }

                const r = v.measureTest(t).reps.filter(function (x) { return x.ok; })[0];

                if (!r) { return; }

                reach = Math.max(reach, r.fit.rs + r.fit.rb);

                nyqS.push({ label: v.shortName(b), color: colors[b.id], x: r.re, y: r.im, width: 2 });
                bodeS.push({ label: v.shortName(b), color: colors[b.id], x: r.f, y: bodeMag(r), width: 2.2 });
            });

            if (nyqS.length) {

                mk({ theme: theme, xLabel: "Z′, real (Ω)", yLabel: "−Z″, imaginary (Ω)", title: "Nyquist plot (chip 1)", equal: true, xMin: 0, yMin: 0, xMax: 1.6 * reach, series: nyqS }, D.line);
                mk({ theme: theme, xLabel: "Frequency (Hz)", yLabel: "|Z| (Ω)", xLog: true, yLog: true, title: "Bode plot: magnitude (chip 1)", series: bodeS }, D.line);
            }

            const paS = [];

            batches.forEach(function (b) {

                const t = v.lastTest(b.id, "papp");

                if (!t) { return; }

                const r = v.measureTest(t).reps.filter(function (x) { return x.ok; })[0];

                if (r) { paS.push({ label: v.shortName(b) + ": " + r.tr.name.split(" (")[0], color: colors[b.id], x: r.t, y: r.c, width: 2 }); }
            });

            if (paS.length) { mk({ theme: theme, xLabel: "Time (min)", yLabel: "Brain-side tracer (% of blood side)", title: "Tracer crossing the barrier (chip 1)", series: paS }, D.line); }

            return [
                { key: "teer", title: "TEER (mean ± SD)", yLabel: "Ω·cm²" },
                { key: "papp", title: "Tracer permeability (mean ± SD)", yLabel: "10⁻⁶ cm/s" },
                { key: "shear", title: "Wall shear stress at the set flow (mean ± SD)", yLabel: "dyn/cm²" },
                { key: "area", title: "Barrier area (mean ± SD)", yLabel: "mm²" },
                { key: "rhyd", title: "Hydraulic resistance, blood side (mean ± SD)", yLabel: "Pa per µL/min" }
            ];
        },

        analysis: function (dv, inf) {

            const v = env();
            const out = [];

            if (inf.parts && B.working(dv)) {

                const p = inf.parts;
                const bio = B.biology(dv);
                const day = Math.round(bio.cu.days);

                out.push(v.table(["What decides the chip", "Value"], [
                    ["Barrier area (channels facing over the membrane)", v.sig(dv.aB * 100) + " mm²"],
                    ["Blood-side channel (width × height × path)", v.fmtLen(p.apical.wEff) + " × " + v.fmtLen(p.apical.h) + " × " + v.fmtLen(p.apical.lPath)],
                    ["Brain-side channel (width × height × path)", v.fmtLen(p.baso.wEff) + " × " + v.fmtLen(p.baso.h) + " × " + v.fmtLen(p.baso.lPath)],
                    ["Fluid volume (blood / brain side)", fmtVol(p.apical.volume) + " / " + fmtVol(p.baso.volume)],
                    ["Flow resistance (blood / brain side, Pa per µL/min)", v.sig(p.apical.rHyd * 1.6667e-11) + " / " + v.sig(p.baso.rHyd * 1.6667e-11)],
                    ["Wall shear stress at the set flow (dyn/cm²)", v.sig(bio.fs.tau) + (bio.fs.tauPeak > bio.fs.tau * 1.2 ? " (peak " + v.sig(bio.fs.tauPeak) + " in the narrowest part)" : "")],
                    ["Electrodes cover this share of the barrier", Math.round(p.f0 * 100) + "%"],
                    ["Electrode areas in the medium (blood / brain side)", v.fmtArea(p.eAArea) + " / " + v.fmtArea(p.eBArea)],
                    ["Medium resistance to each electrode (Ω)", v.sig(p.rSolA) + " / " + v.sig(p.rSolB)],
                    ["Membrane (pore size, open area, thickness)", v.sig(p.poreD) + " µm, " + Math.round(p.porosity * 100) + "%, " + v.sig(p.tMem) + " µm"],
                    ["Metal in the medium keeps this share of the cells alive", Math.round(p.viability * 100) + "%"],
                    ["Dead-end pockets that trap bubbles", v.fmtArea(p.pocketArea)],
                    ["Chance the bond leaks / a bubble lodges", Math.round(p.pLeak * 100) + "% / " + Math.round(p.bubbleRisk * 100) + "%"]
                ]));

                out.push(v.table(["What the cells do", "Value"], [
                    ["Best TEER this cell type can reach (Ω·cm²)", v.sig(bio.c.teer)],
                    ["Gain from the co-culture (after the membrane lets the signals through)", "×" + v.sig(bio.coGain)],
                    ["Gain from the shear stress", "×" + v.sig(bio.shearF)],
                    ["Membrane effect on the cells", "×" + v.sig(bio.mem.f) + (bio.mem.notes.length ? " (" + bio.mem.notes[0] + ")" : "")],
                    ["Cell attachment on the coating", Math.round(bio.attach * 100) + "%"],
                    ["True barrier resistance on day " + day + " (Ω·cm²)", v.sig(B.teerOn(dv, day, bio))]
                ]));
            }

            return out;
        },

        processExtras: function (panel, d, save) {

            const v = env();
            const h = v.h;
            const cu = cultureOf(d);

            panel.appendChild(h("h2", { className: "lab-h2", text: "Cell culture" }));

            panel.appendChild(h("p", { className: "lab-hint", text: "The chip is only half the experiment. Pick the cells, whether to add brain support cells on the other side of the membrane, the coating they attach to, how long to grow them and the flow they are grown under." }));

            panel.appendChild(v.cards({
                label: "Endothelial cells",
                items: Object.keys(B.CELLS).map(function (k) { return { id: k, title: B.CELLS[k].name, body: B.CELLS[k].blurb }; }),
                value: cu.cells,
                onChange: function (id) { cu.cells = id; save(); }
            }));

            panel.appendChild(v.selectChoice("Co-culture on the brain side", Object.keys(B.COCULTURE).map(function (k) { return { value: k, label: B.COCULTURE[k].name }; }), cu.co,
                function (x) { cu.co = x; save(); },
                "Astrocytes and pericytes release signals that tighten the junctions. The signals have to pass the membrane, so a thick membrane with few pores helps less. They also need room: a brain channel under 40 µm tall is crowded."));

            panel.appendChild(v.selectChoice("Coating on the membrane", Object.keys(B.COATINGS).map(function (k) { return { value: k, label: B.COATINGS[k].name }; }), cu.coat,
                function (x) { cu.coat = x; save(); },
                "Cells need something to hold on to. A poor coating slows covering the membrane and leaves gaps."));

            panel.appendChild(v.slider({
                label: "Days in culture before the measurements", min: 1, max: 21, step: 1, value: cu.days, unit: "days",
                hint: "Barriers need time to form. Immortalised lines peak late and slowly; primary cells peak early and fade.",
                onChange: function (x) { cu.days = x; save(); }
            }));

            panel.appendChild(v.selectField("Flow in the blood-side channel", FLOWS, nearest(FLOWS, cu.flow), "µL/min", function (x) { cu.flow = x; save(); },
                "Flow gives the cells shear stress, which tightens the barrier and keeps them aligned. Too much peels them off. The flow test in the lab shows the shear stress your channel makes at each flow."));

            panel.appendChild(v.selectField("Flow in the brain-side channel", FLOWS_B, nearest(FLOWS_B, cu.flowB), "µL/min", function (x) { cu.flowB = x; save(); },
                "Keep it close to the blood-side pressure drop. A big pressure difference pushes fluid and tracer through the membrane pores."));
        },

        batchInfo: function (snap) {

            const cu = snap.culture || {};

            const co = cu.co && cu.co !== "none" ? B.COCULTURE[cu.co].name.toLowerCase().replace(" on the brain side", "") : "no co-culture";

            return (B.CELLS[cu.cells] || B.CELLS.hcmec).name.split(" (")[0] + ", " + co + ", " + (cu.days || 7) + " days";
        },

        designRows: function (d) {

            const cu = cultureOf(d);

            return [
                ["Cells", (B.CELLS[cu.cells] || {}).name || cu.cells],
                ["Co-culture / coating", ((B.COCULTURE[cu.co] || {}).name || cu.co).split(" (")[0] + " · " + ((B.COATINGS[cu.coat] || {}).name || cu.coat)],
                ["Culture time / flow", cu.days + " days · " + cu.flow + " / " + cu.flowB + " µL/min"]
            ];
        },

        layerExtras: function (layer, body, d, refresh) {

            const v = env();
            const h = v.h;

            if (layer.role === "channel") {

                const m = E.CHANNEL_MATERIALS[layer.material];

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb + (m.absorb > 0.5 ? " It absorbs hydrophobic drugs, so a lipophilic tracer will read low." : "") }));
                body.appendChild(h("p", { className: "lab-hint", text: "The shapes you draw on a channel layer are the fluid. Mark the inlet and outlet of each channel with I and O pads that overlap it." }));

                return true;
            }

            if (layer.role === "membrane") {

                const m = E.MEMBRANES[layer.material];
                const pore = layer.pore || m.poreD;
                const porosity = layer.porosity || m.porosity;

                body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb }));

                body.appendChild(v.selectField("Pore diameter", [0.1, 0.4, 1, 3, 8], nearest([0.1, 0.4, 1, 3, 8], pore), "µm", function (x) { layer.pore = x; refresh(); },
                    "Pores must let signals and molecules through but stop cells: from about 3 µm up, endothelial cells crawl through and the layer comes apart."));

                body.appendChild(v.slider({
                    label: "Open area (porosity)", min: 2, max: 30, step: 1, value: Math.round(porosity * 100), unit: "%",
                    hint: "More pores let molecules and signals through more easily but leave less surface for the cells to grip.",
                    onChange: function (x) { layer.porosity = x / 100; refresh(); }
                }));

                return true;
            }

            if (layer.role === "collector") {

                const m = E.METALS[layer.material];
                const e = B.ELECTRODE[layer.material] || {};
                const tox = E.TOXIC[layer.material] || 0;

                body.appendChild(h("p", { className: "lab-muted", text: m.name + (e.q ? " · electrode capacitance about " + e.q + " µF/cm²" : "") + (tox > 0.5 ? " · toxic to cells that touch it" : tox > 0 ? " · mildly harmful to cells" : "") + (layer.material === "agcl" ? " · non-polarising: the best choice for low-frequency TEER" : "") }));

                return true;
            }

            return false;
        },

        thicknessRange: function (layer) {

            if (layer.role === "channel") { return { min: 5, max: 100, step: 5 }; }
            if (layer.role === "collector") { return { min: 0.02, max: 1, step: 0.01 }; }
            if (layer.role === "insulation") { return { min: 0.5, max: 20, step: 0.5 }; }

            return null;
        }
    };

    K.bbb = impl;

}(typeof window !== "undefined" ? window : globalThis));
