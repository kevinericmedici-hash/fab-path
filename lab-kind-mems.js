/* ========================================
   LAB KIND: MEMS ACCELEROMETER, GYROSCOPE AND MICROMIRROR

   Tests, charts, comparison metrics and layer notes for the three MEMS
   kinds. The device physics is in lab-mems-model.js.

   accel:  continuity and release, resonances, sensitivity and range,
           bandwidth and noise, shock
   gyro:   continuity and release, drive and sense modes, comb drive,
           rate response and mode matching, noise and bias, shock
   mirror: continuity and release, tilt against voltage, switching,
           optics and contrast, a small display, hinge life

   Needs window.LabMems (lab-mems-model.js) and window.LabKinds.env.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;
    const D = root.SCLabDraw;
    const E = root.LabEngine;
    const M = root.LabMems;

    const K = root.LabKinds = root.LabKinds || {};

    function env() { return K.env; }


    /* ------------------------------------------------
       TESTS AND SETTINGS
    ------------------------------------------------ */

    const TESTS = {

        accel: [
            { id: "dmm", name: "Release and continuity", blurb: "Is the mass free of the substrate, are the springs and combs connected, and did it survive drying? Lists the pieces, nets and the HF reach." },
            { id: "modes", name: "Resonances", blurb: "The natural frequencies and what moves in each: the sense mode, the out-of-plane mode and the rest." },
            { id: "sens", name: "Sensitivity and range", blurb: "Capacitance change per g from the real comb gaps, the output voltage, the largest acceleration it can read, and cross-axis pickup." },
            { id: "band", name: "Bandwidth and noise", blurb: "Frequency response with air damping, then the noise floor: Brownian motion of the mass against the electronics." },
            { id: "shock", name: "Shock survival", blurb: "Drop it: stress in the springs and motion of the mass at 100 g up to 20,000 g, along each axis." }
        ],

        gyro: [
            { id: "dmm", name: "Release and continuity", blurb: "Is the mass free, are the drive and sense combs connected, and did it survive drying?" },
            { id: "modes", name: "Drive and sense modes", blurb: "The resonances along x (drive) and y (sense), their quality factors and how far apart they are." },
            { id: "drive", name: "Comb drive", blurb: "How far the comb drive swings the mass at resonance, and the voltage where the fingers snap sideways." },
            { id: "rate", name: "Rate response and matching", blurb: "Spin the sensor and read the Coriolis signal. The closer the sense resonance is to the drive, the bigger the signal. Tune it with a voltage." },
            { id: "noise", name: "Noise and bias", blurb: "Angle random walk from Brownian motion and electronics, and the zero-rate error from quadrature." },
            { id: "shock", name: "Shock survival", blurb: "Stress in the springs and motion of the mass under shock, along each axis." }
        ],

        mirror: [
            { id: "dmm", name: "Release and continuity", blurb: "Is the mirror free of the substrate, are the electrodes connected and separate, and did it survive drying?" },
            { id: "tilt", name: "Tilt against voltage", blurb: "Raise and lower the voltage on one electrode: the tilt, the pull-in where the mirror snaps down to its landing, and the voltage to let go." },
            { id: "switch", name: "Switching time", blurb: "Apply a voltage step and watch the mirror swing to its stop and ring, then let go." },
            { id: "optics", name: "Optics and contrast", blurb: "Fill factor, reflectivity, flatness and the contrast ratio between on and off pixels for a chosen projector lens." },
            { id: "display", name: "A small display", blurb: "An array of your pixels shows a picture: stuck pixels, brightness and how many grey levels the switching speed allows." },
            { id: "life", name: "Hinge life and shock", blurb: "Hinge stress each time the mirror lands, how many switches until it fatigues, and shock survival." }
        ]
    };

    const RANGES = [1, 5, 20, 50, 100];
    const VEX = [0.5, 1, 2.5, 5];
    const CF = [0.005, 0.01, 0.05, 0.1];
    const DCN = [0.005, 0.02, 0.05, 0.2];
    const BANDS = [10, 50, 100, 400, 1000];
    const TARGETS = [100, 500, 1000, 5000, 10000];
    const VDC = [5, 10, 20, 30, 40];
    const VAC = [2, 5, 10, 20];
    const TUNES = [0, 5, 10, 15, 20, 30];
    const RATES = [50, 100, 300, 1000];
    const PHASES = [0.01, 0.1, 0.5, 1];
    const VMAX = [60, 100, 150, 200];
    const VFAC = [1.1, 1.3, 1.6, 2];
    const FNUMS = [1.5, 2.4, 4, 8, 16];
    const MARGINS = [1, 2, 4, 8];
    const SIZES = [[16, 8], [32, 12], [48, 16]];

    const PRESSURES = [
        { value: "atm", label: "1 atmosphere (sealed in air)" },
        { value: "mbar100", label: "100 mbar" },
        { value: "mbar1", label: "1 mbar (low vacuum)" },
        { value: "hv", label: "0.01 mbar (high vacuum)" }
    ];

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

    function release(d) {

        if (!d.culture) { d.culture = E.memsRelease.defaultRelease(); }

        return d.culture;
    }

    // Bitmap letters for the display test.
    const FONT = {
        M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
        E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
        S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"]
    };

    function pattern(cols, rows) {

        const text = "MEMS";
        const total = text.length * 6 - 1;
        const x0 = Math.floor((cols - total) / 2);
        const y0 = Math.floor((rows - 7) / 2);

        return function (i, j) {

            const k = Math.floor((i - x0) / 6);
            const cx = (i - x0) - k * 6;
            const cy = j - y0;

            if (k < 0 || k >= text.length || cx < 0 || cx > 4 || cy < 0 || cy > 6) { return 0; }

            return FONT[text[k]][cy][cx] === "1" ? 1 : 0;
        };
    }


    /* ------------------------------------------------
       SHARED VIEW PARTS
    ------------------------------------------------ */

    function problemNotes(container, a) {

        const h = env().h;

        (a.problems || []).forEach(function (t) { container.appendChild(h("p", { className: "lab-note warn", text: t })); });
    }

    function viewCheck(container, r, theme, what) {

        const v = env();
        const h = v.h;
        const reps = r.reps;

        const rows = reps.map(function (x, k) {

            const sum = x.sum || { nets: [], mass: 0, springs: 0, fingers: 0 };
            const mass = sum.mass ? v.sig(sum.mass * 1e9) + " µg" : "none";

            return ["Device " + (k + 1), x.ok ? "Free and working" : "Not working", mass, String(sum.springs), String(sum.fingers), x.unreleased ? x.unreleased + " pieces held down" : "all released", x.stiction && x.stiction.stuck ? "stuck after drying" : "free"];
        });

        container.appendChild(v.table(["Device", "Result", "Moving mass", "Springs", "Fingers or plates", "Release", "After drying"], rows));

        const a = reps.filter(function (x) { return x.sum; })[0];

        if (a) {

            container.appendChild(v.table(["Device 1: electrode", "Pieces", "Area (µm²)"], a.sum.nets.map(function (n) { return [n.label + " (" + ((E.KINDS[r.batch.kind].padNames || {})[n.label] || "") + ")", String(n.pieces), v.sig(n.area, 3)]; })));

            if (a.stiction) {

                container.appendChild(v.table(["Device 1: drying", "Value"], [
                    ["Gap under the moving part", v.sig(a.stiction.gap) + " µm"],
                    ["Capillary pull ÷ spring pull-back", a.stiction.gamma ? v.sig(a.stiction.captRatio, 2) + (a.stiction.collapse ? " (it collapses)" : " (it holds)") : "no liquid surface"],
                    ["Contact area if it touches down", v.sig(a.stiction.contact) + " µm²" + (a.stiction.hasDimples ? " (dimples)" : " (the whole plate)")],
                    ["Chance it stays stuck", v.sig(a.stiction.p * 100, 2) + " %"]
                ]));
            }
        }

        const first = reps[0];

        if (first && first.problems && first.problems.length) { first.problems.forEach(function (t) { container.appendChild(h("p", { className: "lab-note warn", text: "Device 1: " + t })); }); }
        else if (first && first.ok) { container.appendChild(h("p", { className: "lab-note ok", text: "Device 1 is released, anchored and electrically separate where it should be." })); }

        if (first && first.shorts && first.shorts.length) { container.appendChild(h("p", { className: "lab-note warn", text: "Device 1 has electrodes shorted together: " + first.shorts.join("; ") + "." })); }

        container.appendChild(h("p", { className: "lab-hint", text: "After HF removes the sacrificial oxide, a large plate or mass stays stuck wherever the etch could not reach: the HF eats only a limited distance in from each open edge or release hole. Anchors keep the oxide away so the structure stays fixed there. A released part can then be pulled down by the water meniscus while it dries, so the drying method and dimples matter." }));
    }

    function dirLabel(m) { return m.name; }

    function modeBars(container, r, theme, modes, title, colorFn) {

        const v = env();

        const c = v.h("canvas", { role: "img" });

        D.bars(c, {
            theme: theme, title: title, yLabel: "Frequency (kHz)",
            bars: modes.slice(0, 6).map(function (m, k) { return { label: m.name.split(" ")[0] + (m.name.indexOf("z (") === 0 ? " (z)" : ""), value: m.f / 1000, error: 0, color: colorFn(k) }; })
        });

        container.appendChild(c);
    }

    function shockView(container, r, theme, good, color) {

        const v = env();
        const h = v.h;
        const a = good[0];

        const c = h("canvas", { role: "img" });
        const names = ["x", "y", "z"];

        D.line(c, {
            theme: theme, xLabel: "Shock (g)", yLabel: "Peak stress in a beam (MPa)", xLog: true, yLog: true, title: "Stress against shock (device 1)",
            series: a.axes.map(function (ax, k) { return { label: "Along " + names[k], color: color(k), width: 2, dots: true, x: a.levels, y: a.curves[k] }; })
                .concat([{ label: "Fracture strength", color: "#e07070", width: 1.4, dash: [5, 4], x: [a.levels[0], a.levels[a.levels.length - 1]], y: [a.strength, a.strength] }])
        });

        container.appendChild(c);

        container.appendChild(h("p", { className: "lab-hint", text: "Stress grows in proportion to the shock. A device fails when a beam's stress reaches its fracture strength, or when the mass moves far enough to touch something: the comb fingers or the substrate. Stiffer springs and a lighter mass survive more, but a stiff spring costs sensitivity." }));

        container.appendChild(v.table(["Device 1: along", "Stress per g (kPa)", "Mass moves per g (nm)", "Breaks at (g)", "Touches at (g)", "Fails first by"], a.axes.map(function (ax) {

            return ["Axis " + ax.axis, v.sig(ax.stress * 1000), v.sig(ax.disp * 1000), isFinite(ax.gFrac) ? v.sig(ax.gFrac, 3) : "never", isFinite(ax.gContact) ? v.sig(ax.gContact, 3) : "never", ax.mode];
        })));

        container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
            ["Survives up to (g)", pmq(good.map(function (x) { return x.worst; }), 3)]
        ]));

        container.appendChild(h("p", { className: "lab-note " + (a.survives ? "ok" : "warn"), text: a.survives ? "Device 1 survives the " + a.target + " g target." : "Device 1 does not survive " + a.target + " g: it fails at about " + v.sig(a.worst, 3) + " g." }));
    }


    /* ------------------------------------------------
       THE KIND (SHARED)
    ------------------------------------------------ */

    function base(kind) {

        const list = TESTS[kind];

        return {

            id: kind,

            tests: function () { return list; },
            defaultTest: "dmm",

            cleanCulture: function (raw, num) { return E.memsRelease.cleanRelease(raw, num); },

            cleanParams: function (q, num) {

                q = q || {};

                return {
                    range: choice(Number(q.range), RANGES, 20),
                    vex: choice(Number(q.vex), VEX, 2.5),
                    cf: choice(Number(q.cf), CF, 0.01),
                    dcn: choice(Number(q.dcn), DCN, 0.02),
                    pressure: choice(q.pressure, ["atm", "mbar100", "mbar1", "hv"], "atm"),
                    band: choice(Number(q.band), BANDS, 100),
                    target: choice(Number(q.target), TARGETS, 1000),
                    vdc: choice(Number(q.vdc), VDC, 20),
                    vac: choice(Number(q.vac), VAC, 10),
                    tune: choice(Number(q.tune), TUNES, 0),
                    rate: choice(Number(q.rate), RATES, 300),
                    phase: choice(Number(q.phase), PHASES, 0.1),
                    vmax: choice(Number(q.vmax), VMAX, 150),
                    vfac: choice(Number(q.vfac), VFAC, 1.3),
                    fnum: choice(Number(q.fnum), FNUMS, 2.4),
                    margin: choice(Number(q.margin), MARGINS, 2),
                    size: choice(Number(q.size), [0, 1, 2], 1)
                };
            },

            defaultParams: function () {

                return { range: 20, vex: 2.5, cf: 0.01, dcn: 0.02, pressure: "atm", band: 100, target: 1000, vdc: 20, vac: 10, tune: 0, rate: 300, phase: 0.1, vmax: 150, vfac: 1.3, fnum: 2.4, margin: 2, size: 1 };
            },

            describeParams: function (t) {

                const p = t.params;
                const pr = { atm: "1 atm", mbar100: "100 mbar", mbar1: "1 mbar", hv: "0.01 mbar" }[p.pressure];

                switch (t.type) {

                    case "sens": return "±" + p.range + " g, " + p.vex + " V excitation, " + p.cf + " pF feedback";
                    case "band": return pr + ", " + p.band + " Hz band";
                    case "shock": return p.target + " g target";
                    case "drive": return p.vdc + " V DC + " + p.vac + " V AC, " + pr;
                    case "rate": return p.vdc + " V + " + p.vac + " V drive, " + p.tune + " V tuning, ±" + p.rate + " °/s";
                    case "noise": return pr + ", " + p.band + " Hz band, " + p.phase + "° phase error";
                    case "tilt": return "up to " + p.vmax + " V";
                    case "switch": return p.vfac + "× the pull-in voltage, " + pr;
                    case "optics": return "f/" + p.fnum + " lens, " + p.margin + " µm between mirrors";
                    case "display": return SIZES[p.size][0] + " by " + SIZES[p.size][1] + " pixels, f/" + p.fnum;
                    default: return "standard settings";
                }
            },

            paramControls: function (type, params) {

                const v = env();
                const out = [];

                const readout = function () {

                    out.push(v.selectField("Excitation voltage on the sense combs", VEX, params.vex, "V", function (x) { params.vex = x; },
                        "A bigger voltage gives a bigger signal but pulls the fingers together (electrostatic spring softening) and can snap them."));
                    out.push(v.selectField("Feedback capacitor of the amplifier", CF, params.cf, "pF", function (x) { params.cf = x; },
                        "A smaller feedback capacitor gives more output volts for the same capacitance change."));
                    out.push(v.selectField("Electronics noise (capacitance resolution)", DCN, params.dcn, "aF/√Hz", function (x) { params.dcn = x; },
                        "How small a change in capacitance the circuit can see. A good CMOS charge amplifier reaches a few hundredths of an attofarad."));
                };

                const pressure = function () {

                    out.push(v.selectChoice("Package pressure", PRESSURES, params.pressure, function (x) { params.pressure = x; },
                        "Air is the main source of damping: it sets the quality factor. A vacuum package raises Q, which lowers Brownian noise but makes the sensor ring."));
                };

                if (kind === "accel") {

                    if (type === "sens") {

                        out.push(v.selectField("Range to sweep", RANGES, params.range, "g", function (x) { params.range = x; }, "The sweep goes from minus to plus this acceleration."));
                        readout();
                    }

                    if (type === "band") {

                        pressure();
                        out.push(v.selectField("Measurement bandwidth", BANDS, params.band, "Hz", function (x) { params.band = x; }, "The noise you see is the noise density times the square root of this bandwidth."));
                        readout();
                    }

                    if (type === "shock") { out.push(v.selectField("Shock target", TARGETS, params.target, "g", function (x) { params.target = x; }, "A phone or a car crash sensor must survive thousands of g without being damaged.")); }
                }

                if (kind === "gyro") {

                    if (type === "drive" || type === "rate" || type === "noise") {

                        out.push(v.selectField("DC bias on the drive comb", VDC, params.vdc, "V", function (x) { params.vdc = x; }, "The force of the comb drive is the DC bias times the AC voltage times the capacitance gradient. Too much DC bias also pulls the fingers sideways."));
                        out.push(v.selectField("AC drive voltage", VAC, params.vac, "V", function (x) { params.vac = x; }, "Applied at the drive resonance."));
                        pressure();
                    }

                    if (type === "rate" || type === "noise") {

                        out.push(v.selectField("Tuning voltage on the sense comb", TUNES, params.tune, "V", function (x) { params.tune = x; }, "A voltage on the sense comb softens the sense spring electrostatically and lowers the sense resonance: use it to pull the sense mode onto the drive mode."));
                    }

                    if (type === "rate") {

                        out.push(v.selectField("Rate range", RATES, params.rate, "°/s", function (x) { params.rate = x; }, "The sweep goes from minus to plus this rotation rate."));
                        out.push(v.selectField("Excitation voltage on the sense combs", VEX, params.vex, "V", function (x) { params.vex = x; }, "Converts the sense capacitance change to a voltage."));
                        out.push(v.selectField("Feedback capacitor of the amplifier", CF, params.cf, "pF", function (x) { params.cf = x; }, "A smaller feedback capacitor gives more output volts."));
                    }

                    if (type === "noise") {

                        out.push(v.selectField("Electronics noise (capacitance resolution)", DCN, params.dcn, "aF/√Hz", function (x) { params.dcn = x; }, "How small a change in capacitance the circuit can see."));
                        out.push(v.selectField("Measurement bandwidth", BANDS, params.band, "Hz", function (x) { params.band = x; }, "The noise you see is the noise density times the square root of this bandwidth."));
                        out.push(v.selectField("Phase error of the demodulator", PHASES, params.phase, "°", function (x) { params.phase = x; }, "Quadrature motion is 90° out of phase with the rate signal. A small phase error leaks some of it into the output as a zero-rate offset."));
                    }

                    if (type === "shock") { out.push(v.selectField("Shock target", TARGETS, params.target, "g", function (x) { params.target = x; }, "Consumer gyros must survive thousands of g.")); }
                }

                if (kind === "mirror") {

                    if (type === "tilt") { out.push(v.selectField("Highest voltage to try", VMAX, params.vmax, "V", function (x) { params.vmax = x; }, "The voltage on electrode A is swept up to this value and back.")); }

                    if (type === "switch" || type === "display") {

                        out.push(v.selectChoice("Step voltage (times the pull-in voltage)", VFAC.map(function (x) { return { value: String(x), label: x + "× pull-in" }; }), String(params.vfac), function (x) { params.vfac = Number(x); },
                            "Above the pull-in voltage the mirror snaps to its stop. A bigger step is faster but slams harder."));
                        pressure();
                    }

                    if (type === "optics" || type === "display") {

                        out.push(v.selectChoice("Projector lens", FNUMS.map(function (x) { return { value: String(x), label: "f/" + x }; }), String(params.fnum), function (x) { params.fnum = Number(x); },
                            "A fast lens (small f-number) collects a wide cone of light, so the on and off beams overlap unless the mirror tilts a lot."));
                        out.push(v.selectField("Gap between neighbouring mirrors", MARGINS, params.margin, "µm", function (x) { params.margin = x; }, "Fill factor is the mirror area divided by the pixel area: the gaps waste light."));
                    }

                    if (type === "display") {

                        out.push(v.selectChoice("Array size", SIZES.map(function (s, k) { return { value: String(k), label: s[0] + " by " + s[1] + " pixels" }; }), String(params.size), function (x) { params.size = Number(x); }, "More pixels means more chances for a defective one."));
                    }
                }

                return out;
            },

            testLead: kind === "accel" ?
                "A signal analyser and a probe station test the sensor like in a real MEMS lab. Start with the release check: a mass held down by oxide or stuck after drying cannot move at all. Then look at the resonances and the sensitivity. Each test runs on every device in the batch." :
                kind === "gyro" ?
                    "A signal analyser and a rate table test the sensor. Start with the release check. Then find the drive and sense resonances, drive the mass, and see how much Coriolis signal comes out. Mode matching is the whole game. Each test runs on every device in the batch." :
                    "A probe station and a high-voltage supply test the mirror. Start with the release check. Then sweep the voltage to see where the mirror snaps down, time its switching and measure how well it makes a picture. Each test runs on every device in the batch."
        };
    }


    /* ------------------------------------------------
       ACCELEROMETER
    ------------------------------------------------ */

    const accel = base("accel");

    accel.measure = function (type, dev, p) {

        switch (type) {

            case "dmm": return M.check(dev);
            case "modes": return M.accelModes(dev);
            case "sens": return M.accelSensitivity(dev, { range: p.range, vex: p.vex, cf: p.cf, dcn: p.dcn });
            case "band": return M.accelBandwidth(dev, { pressure: p.pressure, band: p.band, vex: p.vex, cf: p.cf, dcn: p.dcn });
            default: return M.accelShock(dev, { target: p.target });
        }
    };

    accel.view = function (container, r, theme) {

        const v = env();
        const h = v.h;
        const sig = v.sig;
        const type = r.test.type;
        const reps = r.reps;
        const p = r.test.params;
        const color = function (k) { return D.color(k, theme); };

        if (type === "dmm") { viewCheck(container, r, theme, "accelerometer"); return; }

        const good = reps.filter(function (x) { return x.ok; });

        if (!good.length) {

            container.appendChild(h("p", { className: "lab-note warn", text: "No working accelerometer in this batch. Open the failure analysis, or run the release check, to see why." }));
            problemNotes(container, reps[0] || {});

            return;
        }

        const a = good[0];

        if (type === "modes") {

            problemNotes(container, a);

            modeBars(container, r, theme, a.modes, "Natural frequencies (device 1)", color);

            container.appendChild(v.table(["Mode", "Frequency (kHz)", "Moves mainly as", "Share of its energy"], a.modes.slice(0, 8).map(function (m, k) {

                const sense = a.sense && Math.abs(m.f - a.sense.f) < 1;

                return [(k + 1) + (sense ? " (the sense mode)" : ""), sig(m.f / 1000, 3), dirLabel(m), Math.round(m.share * 100) + " %"];
            })));

            if (a.sense) {

                container.appendChild(v.table(["Sense mode (device 1)", "Value"], [
                    ["Frequency", sig(a.sense.f / 1000, 3) + " kHz"],
                    ["Effective mass", sig(a.meff * 1e9, 3) + " µg"],
                    ["Spring constant", sig(a.k, 3) + " N/m"],
                    ["Sense axis", a.axis === 1 ? "y" : "x"],
                    ["Comb capacitance, set A / set B", sig(a.c0.A * 1e15) + " fF / " + sig(a.c0.B * 1e15) + " fF"],
                    ["Capacitance change per micrometre", sig(Math.abs(a.grad) * 1e9, 3) + " fF/µm"]
                ]));

                container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
                    ["Sense resonance (kHz)", pmq(good.map(function (x) { return x.sense ? x.sense.f / 1000 : NaN; }), 3)],
                    ["Spring constant (N/m)", pmq(good.map(function (x) { return x.k; }))]
                ]));
            }

            container.appendChild(h("p", { className: "lab-hint", text: "The resonance is √(k/m) / 2π. The sensor should work well below it: the signal is flat only at frequencies a few times lower. A spring that is soft in the sense direction is stiff in the others. The lowest mode is often the out-of-plane one, because the springs are about as thick as they are wide. Shifting it away from the sense mode keeps shake in the wrong direction from leaking into the reading." }));

            return;
        }

        if (type === "sens") {

            problemNotes(container, a);

            const cx = h("canvas", { role: "img" });
            const cv = h("canvas", { role: "img" });

            D.line(cx, {
                theme: theme, xLabel: "Acceleration (g)", yLabel: "Capacitance change (aF)", title: "Sense capacitance against acceleration (device 1)",
                series: good.map(function (x, k) { return { label: k === 0 ? "Differential capacitance" : undefined, color: color(0), alpha: k === 0 ? 1 : 0.35, width: k === 0 ? 2.2 : 1.2, x: x.g, y: x.dC }; })
            });

            D.line(cv, {
                theme: theme, xLabel: "Acceleration (g)", yLabel: "Mass displacement (nm)", title: "Motion of the proof mass (device 1)",
                series: [{ color: color(1), width: 2.2, x: a.g, y: a.x }]
            });

            container.appendChild(h("div", { className: "lab-charts" }, [cx, cv]));

            container.appendChild(h("p", { className: "lab-hint", text: "The mass moves by a/ω₀² (acceleration over the resonance frequency squared): a softer spring or a heavier mass moves more. The comb turns that motion into a capacitance change: each moving finger sits between a near and a far fixed finger, so one gap closes while the other opens. A smaller gap, longer fingers and more of them all multiply the signal." }));

            container.appendChild(v.table(["Metric (device 1)", "Value"], [
                ["Sensitivity", sig(Math.abs(a.sC), 3) + " aF per g"],
                ["Output at the amplifier", sig(Math.abs(a.sV), 3) + " mV per g"],
                ["Mass moves", sig(Math.abs(a.sX), 3) + " nm per g"],
                ["Largest acceleration it can read", isFinite(a.gFS) ? sig(a.gFS, 3) + " g" : "very large"],
                ["Nonlinearity over the sweep", sig(a.nonlin, 2) + " % of full scale"],
                ["Spring softening from the excitation voltage", sig((1 - a.soften) * 100, 2) + " %"],
                ["Cross-axis sensitivity (in-plane, up and down)", sig(a.crossIn, 2) + " % / " + sig(a.crossZ, 2) + " %"],
                ["Out-of-plane motion for 1 g (affects the gap)", sig(a.zShift, 2) + " nm"]
            ]));

            container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
                ["Sensitivity (aF per g)", pmq(good.map(function (x) { return Math.abs(x.sC); }), 3)],
                ["Output (mV per g)", pmq(good.map(function (x) { return Math.abs(x.sV); }), 3)],
                ["Full scale (g)", pmq(good.map(function (x) { return x.gFS; }), 3)]
            ]));

            container.appendChild(h("p", { className: "lab-hint", text: "Full scale is where the mass has moved a third of the narrowest gap: beyond that the capacitance is no longer a straight line and the fingers risk touching. Raising the excitation voltage gives more output, but it pulls the fingers together and softens the spring." }));

            return;
        }

        if (type === "band") {

            problemNotes(container, a);

            const fr = h("canvas", { role: "img" });
            const ns = h("canvas", { role: "img" });

            D.line(fr, {
                theme: theme, xLabel: "Frequency (Hz)", yLabel: "Response (dB)", xLog: true, title: "Frequency response (device 1)",
                series: good.map(function (x, k) { return { label: k === 0 ? "Q = " + sig(x.Q, 3) : undefined, color: color(0), alpha: k === 0 ? 1 : 0.35, width: k === 0 ? 2.2 : 1.2, x: x.f, y: x.mag }; })
            });

            D.bars(ns, {
                theme: theme, title: "Noise floor (device 1)", yLabel: "mg per √Hz",
                bars: [
                    { label: "Brownian (air)", value: a.tnea * 1000, error: 0, color: color(1) },
                    { label: "Electronics", value: a.elec * 1000, error: 0, color: color(2) },
                    { label: "Total", value: a.noise * 1000, error: 0, color: color(0) }
                ]
            });

            container.appendChild(h("div", { className: "lab-charts" }, [fr, ns]));

            container.appendChild(h("p", { className: "lab-hint", text: "Air squeezes in and out under the mass and between the fingers, which damps the motion. A low Q gives a flat, well-behaved response; a high Q gives a tall peak at resonance and long ringing. The thermal noise of that same damping is the mechanical noise floor: less damping, less noise. The other part is the electronics, which turns the smallest capacitance it can see into an acceleration." }));

            container.appendChild(v.table(["Metric (device 1)", "Value"], [
                ["Resonance", sig(a.f0 / 1000, 3) + " kHz"],
                ["Quality factor Q", sig(a.Q, 3)],
                ["Flat response to within 3 dB up to", sig(a.bw / 1000, 3) + " kHz"],
                ["Resonance peak", sig(a.peakDb, 2) + " dB"],
                ["Brownian noise (TNEA)", sig(a.tnea * 1e6, 3) + " µg/√Hz"],
                ["Electronics noise", sig(a.elec * 1000, 3) + " mg/√Hz"],
                ["Total noise", sig(a.noise * 1000, 3) + " mg/√Hz"],
                ["Resolution in " + a.band + " Hz", sig(a.resolution, 3) + " mg rms"],
                ["Dynamic range", sig(a.dynDb, 3) + " dB"]
            ]));

            container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
                ["Quality factor", pmq(good.map(function (x) { return x.Q; }), 3)],
                ["Noise (mg/√Hz)", pmq(good.map(function (x) { return x.noise * 1000; }), 3)]
            ]));

            container.appendChild(h("p", { className: "lab-hint", text: "A vacuum package makes the Brownian noise tiny but turns the response into a sharp resonance. In air, most low-noise accelerometers are limited by the electronics, which is why a bigger sensitivity (more fingers, smaller gaps) is worth more than lower damping." }));

            return;
        }

        shockView(container, r, theme, good, color);
    };

    accel.headline = function (batch) {

        const v = env();
        const devs = v.devicesOf(batch);
        const out = { f0: null, sens: null, noise: null, q: null, bw: null, fs: null, shock: null };
        const ro = { vex: 2.5, cf: 0.01, dcn: 0.02 };

        const num = function (fn) { return devs.map(function (d) { try { return M.working(d) ? fn(d) : NaN; } catch (e) { return NaN; } }); };

        out.f0 = num(function (d) { const m = M.accelModes(d); return m.sense ? m.sense.f / 1000 : NaN; });
        out.sens = num(function (d) { return Math.abs(M.accelSensitivity(d, { range: 20, vex: ro.vex, cf: ro.cf, dcn: ro.dcn }).sC); });
        out.fs = num(function (d) { return M.accelSensitivity(d, { range: 20, vex: ro.vex, cf: ro.cf, dcn: ro.dcn }).gFS; });

        const bw = devs.map(function (d) { return M.working(d) ? M.accelBandwidth(d, { pressure: "atm", band: 100, vex: ro.vex, cf: ro.cf, dcn: ro.dcn }) : null; });

        out.noise = bw.map(function (b) { return b && b.noise !== undefined ? b.noise * 1000 : NaN; });
        out.q = bw.map(function (b) { return b && b.Q !== undefined ? b.Q : NaN; });
        out.bw = bw.map(function (b) { return b && b.bw !== undefined ? b.bw / 1000 : NaN; });
        out.shock = num(function (d) { return M.accelShock(d, { target: 1000 }).worst; });

        return out;
    };

    accel.tableHead = ["Resonance (kHz)", "Sensitivity (aF/g)", "Full scale (g)", "Noise (mg/√Hz)", "Q in air", "Flat to (kHz)", "Survives (g)"];

    accel.tableRow = function (hd) {

        return [hd.f0 ? pmq(hd.f0, 3) : "n/a", hd.sens ? pmq(hd.sens, 2) : "n/a", hd.fs ? pmq(hd.fs, 3) : "n/a", hd.noise ? pmq(hd.noise, 2) : "n/a", hd.q ? pmq(hd.q, 3) : "n/a", hd.bw ? pmq(hd.bw, 2) : "n/a", hd.shock ? pmq(hd.shock, 3) : "n/a"];
    };

    accel.ranks = [
        { key: "sens", label: "sensitivity", unit: "aF/g", higher: true, digits: 2 },
        { key: "noise", label: "noise floor", unit: "mg/√Hz", higher: false, digits: 1 },
        { key: "bw", label: "flat bandwidth", unit: "kHz", higher: true, digits: 1 },
        { key: "fs", label: "full scale", unit: "g", higher: true, digits: 0 },
        { key: "shock", label: "shock survival", unit: "g", higher: true, digits: 0 }
    ];

    accel.charts = function (container, batches, theme, colors) {

        const v = env();
        const h = v.h;
        const ro = { vex: 2.5, cf: 0.01, dcn: 0.02 };

        const respS = [];
        const sensS = [];

        batches.forEach(function (b) {

            const d = v.devicesOf(b).filter(function (x) { try { return M.working(x); } catch (e) { return false; } })[0];

            if (!d) { return; }

            const bw = M.accelBandwidth(d, { pressure: "atm", band: 100, vex: ro.vex, cf: ro.cf, dcn: ro.dcn });
            const se = M.accelSensitivity(d, { range: 20, vex: ro.vex, cf: ro.cf, dcn: ro.dcn });

            if (bw.ok) { respS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, x: bw.f, y: bw.mag }); }
            if (se.ok) { sensS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, x: se.g, y: se.dC }); }
        });

        const mk = function (cfg) { const c = h("canvas", { role: "img" }); D.line(c, cfg); container.appendChild(c); };

        if (respS.length) { mk({ theme: theme, xLabel: "Frequency (Hz)", yLabel: "Response (dB)", xLog: true, title: "Frequency response in air (device 1)", series: respS }); }
        if (sensS.length) { mk({ theme: theme, xLabel: "Acceleration (g)", yLabel: "Capacitance change (aF)", title: "Sensitivity (device 1)", series: sensS }); }

        return [
            { key: "sens", title: "Sensitivity (mean ± SD)", yLabel: "aF per g" },
            { key: "noise", title: "Noise floor (mean ± SD)", yLabel: "mg/√Hz" },
            { key: "f0", title: "Sense resonance (mean ± SD)", yLabel: "kHz" },
            { key: "bw", title: "Flat bandwidth (mean ± SD)", yLabel: "kHz" },
            { key: "shock", title: "Shock survival (mean ± SD)", yLabel: "g" }
        ];
    };


    /* ------------------------------------------------
       GYROSCOPE
    ------------------------------------------------ */

    const gyro = base("gyro");

    gyro.measure = function (type, dev, p) {

        const drive = { vdc: p.vdc, vac: p.vac, pressure: p.pressure };

        switch (type) {

            case "dmm": return M.check(dev);
            case "modes": return M.gyroQ(dev, M.pressureOf("atm"));
            case "drive": return M.gyroDrive(dev, drive);
            case "rate": return M.gyroRate(dev, { vdc: p.vdc, vac: p.vac, pressure: p.pressure, tune: p.tune, range: p.rate, vex: p.vex, cf: p.cf });
            case "noise": return M.gyroNoise(dev, { vdc: p.vdc, vac: p.vac, pressure: p.pressure, tune: p.tune, range: 300, vex: p.vex, cf: p.cf, dcn: p.dcn, band: p.band, phase: p.phase });
            default: return M.gyroShock(dev, { target: p.target });
        }
    };

    gyro.view = function (container, r, theme) {

        const v = env();
        const h = v.h;
        const sig = v.sig;
        const type = r.test.type;
        const reps = r.reps;
        const p = r.test.params;
        const color = function (k) { return D.color(k, theme); };

        if (type === "dmm") { viewCheck(container, r, theme, "gyroscope"); return; }

        const good = reps.filter(function (x) { return x.ok; });

        if (!good.length) {

            container.appendChild(h("p", { className: "lab-note warn", text: "No working gyroscope in this batch. Open the failure analysis, or run the release check, to see why." }));
            problemNotes(container, reps[0] || {});

            return;
        }

        const a = good[0];

        if (type === "modes") {

            problemNotes(container, a);

            modeBars(container, r, theme, a.modes, "Natural frequencies (device 1)", color);

            if (a.drive && a.sense) {

                container.appendChild(v.table(["Device 1", "Drive mode (x)", "Sense mode (y)"], [
                    ["Resonance", sig(a.drive.f / 1000, 3) + " kHz", sig(a.sense.f / 1000, 3) + " kHz"],
                    ["Effective mass", sig(a.drive.meff * 1e9, 3) + " µg", sig(a.sense.meff * 1e9, 3) + " µg"],
                    ["Spring constant", sig(a.drive.k, 3) + " N/m", sig(a.sense.k, 3) + " N/m"],
                    ["Quality factor (air)", sig(a.Qx, 3), sig(a.Qy, 3)],
                    ["Bandwidth of the resonance (f ÷ Q)", sig(a.drive.f / a.Qx, 3) + " Hz", sig(a.sense.f / a.Qy, 3) + " Hz"]
                ]));

                container.appendChild(h("p", { className: "lab-note " + (Math.abs(a.split) < 1 ? "ok" : "warn"), text: "The sense mode is " + (a.split >= 0 ? "above" : "below") + " the drive mode by " + sig(Math.abs(a.split), 3) + " % (" + sig(Math.abs(a.sense.f - a.drive.f), 3) + " Hz). The resonance is only " + sig(a.drive.f / a.Qy, 3) + " Hz wide, so a split this size " + (Math.abs(a.sense.f - a.drive.f) > a.drive.f / a.Qy ? "puts the drive frequency outside it: most of the resonant gain is lost. Tune it with a voltage in the rate test, or change the spring lengths." : "keeps the drive frequency inside it.") }));

                container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
                    ["Drive resonance (kHz)", pmq(good.map(function (x) { return x.drive ? x.drive.f / 1000 : NaN; }), 3)],
                    ["Sense resonance (kHz)", pmq(good.map(function (x) { return x.sense ? x.sense.f / 1000 : NaN; }), 3)],
                    ["Split between them (%)", pmq(good.map(function (x) { return x.split; }), 2)]
                ]));
            }

            container.appendChild(h("p", { className: "lab-hint", text: "A vibratory gyroscope has two resonances: the drive mode that is kept vibrating, and the sense mode where the Coriolis force shows up. Springs that bend one way for x and another way for y set the two frequencies. Fabrication changes the width of the beams, and stiffness goes as the width cubed, so even a tenth of a micrometre moves the two modes apart." }));

            return;
        }

        if (type === "drive") {

            problemNotes(container, a);

            const fa = h("canvas", { role: "img" });
            const va = h("canvas", { role: "img" });

            D.line(fa, {
                theme: theme, xLabel: "Drive frequency (Hz)", yLabel: "Amplitude of the mass (µm)", title: "Drive resonance (device 1)",
                series: good.map(function (x, k) { return { label: k === 0 ? "Q = " + sig(x.Qx, 3) : undefined, color: color(0), alpha: k === 0 ? 1 : 0.35, width: k === 0 ? 2.2 : 1.2, x: x.f, y: x.amp }; })
            });

            D.line(va, {
                theme: theme, xLabel: "AC drive voltage (V)", yLabel: "Amplitude at resonance (µm)", title: "Amplitude against drive voltage (device 1)",
                series: [
                    { color: color(1), width: 2.2, x: a.vs, y: a.vamp },
                    { label: "Comb overlap limit", color: "#e07070", width: 1.2, dash: [5, 4], x: [a.vs[0], a.vs[a.vs.length - 1]], y: [0.8 * a.overlap, 0.8 * a.overlap] }
                ]
            });

            container.appendChild(h("div", { className: "lab-charts" }, [fa, va]));

            container.appendChild(h("p", { className: "lab-hint", text: "A comb drive pulls the mass along the fingers with a force that does not change as the overlap changes: F = V_dc × V_ac × dC/dx. Driven at the resonance, the amplitude is Q times the static displacement. The bigger the amplitude, the faster the mass moves, and the larger the Coriolis force." }));

            container.appendChild(v.table(["Metric (device 1)", "Value"], [
                ["Drive resonance", sig(a.fd / 1000, 3) + " kHz"],
                ["Comb force", sig(Math.abs(a.force) * 1e9, 3) + " nN"],
                ["Amplitude at resonance", sig(a.peak, 3) + " µm" + (a.limited ? " (limited: the fingers would leave each other)" : "")],
                ["Peak speed of the mass", sig(a.vel * 100, 3) + " cm/s"],
                ["Finger overlap along x", sig(a.overlap, 3) + " µm"],
                ["Sideways pull-in voltage (DC)", sig(a.vPull, 3) + " V"]
            ]));

            container.appendChild(h("p", { className: "lab-note " + (a.safe ? "ok" : "warn"), text: a.safe ? "The DC bias of " + a.vdc + " V is well under the " + sig(a.vPull, 3) + " V where the drive fingers would snap sideways." : "The DC bias of " + a.vdc + " V is close to or above the " + sig(a.vPull, 3) + " V where the drive fingers snap sideways to their neighbours. Lower it." }));

            return;
        }

        if (type === "rate") {

            problemNotes(container, a);

            const rc = h("canvas", { role: "img" });
            const mc = h("canvas", { role: "img" });

            D.line(rc, {
                theme: theme, xLabel: "Rotation rate (°/s)", yLabel: "Sense motion (nm)", title: "Coriolis response (device 1)",
                series: good.map(function (x, k) { return { label: k === 0 ? "Sense motion" : undefined, color: color(0), alpha: k === 0 ? 1 : 0.35, width: k === 0 ? 2.2 : 1.2, x: x.rates, y: x.y }; })
            });

            D.line(mc, {
                theme: theme, xLabel: "Frequency (Hz)", yLabel: "Sense response (relative)", title: "Where the drive sits on the sense resonance (device 1)",
                series: [
                    { label: "Sense resonance", color: color(1), width: 2.2, x: a.mf, y: a.mgain },
                    { label: "Drive frequency", color: color(2), width: 1.6, dash: [5, 4], x: [a.fd, a.fd], y: [0, 1] }
                ]
            });

            container.appendChild(h("div", { className: "lab-charts" }, [rc, mc]));

            container.appendChild(h("p", { className: "lab-hint", text: "The mass moves along x at speed v. When the sensor turns at rate Ω the Coriolis force 2mΩv pushes it along y, and the sense resonator answers. If the sense resonance sits right on the drive frequency the answer is multiplied by Q; the further off, the smaller the signal. Increase the tuning voltage to lower the sense mode onto the drive mode." }));

            container.appendChild(v.table(["Metric (device 1)", "Value"], [
                ["Drive amplitude", sig(a.amp, 3) + " µm"],
                ["Drive resonance / sense resonance", sig(a.fd / 1000, 3) + " kHz / " + sig(a.fs / 1000, 3) + " kHz"],
                ["Sense resonance after tuning", sig(a.fsTuned / 1000, 3) + " kHz (" + (a.splitTuned >= 0 ? "+" : "") + sig(a.splitTuned, 2) + " % from the drive)"],
                ["Sense motion per °/s", sig(Math.abs(a.sY), 3) + " nm"],
                ["Capacitance change per °/s", sig(Math.abs(a.sC), 3) + " aF"],
                ["Output per °/s", sig(Math.abs(a.sV), 3) + " mV"],
                ["Signal compared with a perfectly matched sensor", sig(Math.min(a.gainVsMatched, 1) * 100, 3) + " %"],
                ["Quadrature error (as an equivalent rate)", sig(a.quad, 3) + " °/s"]
            ]));

            container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
                ["Output (mV per °/s)", pmq(good.map(function (x) { return Math.abs(x.sV); }), 3)],
                ["Split after tuning (%)", pmq(good.map(function (x) { return x.splitTuned; }), 2)]
            ]));

            return;
        }

        if (type === "noise") {

            problemNotes(container, a);

            const nb = h("canvas", { role: "img" });

            D.bars(nb, {
                theme: theme, title: "Rate noise (device 1)", yLabel: "°/s per √Hz",
                bars: [
                    { label: "Brownian (air)", value: a.brown, error: 0, color: color(1) },
                    { label: "Electronics", value: a.elec, error: 0, color: color(2) },
                    { label: "Total", value: a.total, error: 0, color: color(0) }
                ]
            });

            container.appendChild(nb);

            container.appendChild(h("p", { className: "lab-hint", text: "Brownian motion of the sense mass in the damping air sets a floor. The electronics add to it: the smaller the signal per °/s, the more the electronics' capacitance noise counts. The result is the angle random walk, the standard figure of merit for gyroscopes, in degrees per √hour. Quadrature is motion of the sense mass that is caused by the cross stiffness of the springs rather than rotation; it is 90° out of phase with the signal but a small phase error leaks some of it into the output as a zero-rate offset." }));

            container.appendChild(v.table(["Metric (device 1)", "Value"], [
                ["Brownian noise", sig(a.brown, 3) + " °/s/√Hz"],
                ["Electronics noise", sig(a.elec, 3) + " °/s/√Hz"],
                ["Total", sig(a.total, 3) + " °/s/√Hz"],
                ["Angle random walk", sig(a.arw, 3) + " °/√h"],
                ["Resolution in " + a.band + " Hz", sig(a.resolution, 3) + " °/s rms"],
                ["Quadrature error", sig(a.quad, 3) + " °/s equivalent"],
                ["Zero-rate offset with a " + a.phase + "° phase error", sig(a.zro, 3) + " °/s"]
            ]));

            container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
                ["Angle random walk (°/√h)", pmq(good.map(function (x) { return x.arw; }), 3)],
                ["Zero-rate offset (°/s)", pmq(good.map(function (x) { return x.zro; }), 3)]
            ]));

            return;
        }

        shockView(container, r, theme, good, color);
    };

    gyro.headline = function (batch) {

        const v = env();
        const devs = v.devicesOf(batch);
        const out = { fd: null, split: null, sens: null, arw: null, amp: null, quad: null, shock: null };
        const po = { vdc: 20, vac: 10, pressure: "atm", tune: 0, range: 300, vex: 2.5, cf: 0.01, dcn: 0.02, band: 50, phase: 0.1 };

        const num = function (fn) { return devs.map(function (d) { try { return M.working(d) ? fn(d) : NaN; } catch (e) { return NaN; } }); };

        out.fd = num(function (d) { return M.gyroQ(d, 1).drive.f / 1000; });
        out.split = num(function (d) { return Math.abs(M.gyroQ(d, 1).split); });

        const rt = devs.map(function (d) { try { return M.working(d) ? M.gyroRate(d, po) : null; } catch (e) { return null; } });
        const nz = devs.map(function (d) { try { return M.working(d) ? M.gyroNoise(d, po) : null; } catch (e) { return null; } });

        out.sens = rt.map(function (x) { return x && x.sC !== undefined ? Math.abs(x.sC) : NaN; });
        out.amp = rt.map(function (x) { return x && x.amp !== undefined ? x.amp : NaN; });
        out.quad = rt.map(function (x) { return x && x.quad !== undefined ? x.quad : NaN; });
        out.arw = nz.map(function (x) { return x && x.arw !== undefined ? x.arw : NaN; });
        out.shock = num(function (d) { return M.gyroShock(d, { target: 1000 }).worst; });

        return out;
    };

    gyro.tableHead = ["Drive (kHz)", "Mode split (%)", "Drive amplitude (µm)", "Signal (aF per °/s)", "Angle random walk (°/√h)", "Quadrature (°/s)", "Survives (g)"];

    gyro.tableRow = function (hd) {

        return [hd.fd ? pmq(hd.fd, 3) : "n/a", hd.split ? pmq(hd.split, 2) : "n/a", hd.amp ? pmq(hd.amp, 2) : "n/a", hd.sens ? pmq(hd.sens, 2) : "n/a", hd.arw ? pmq(hd.arw, 2) : "n/a", hd.quad ? pmq(hd.quad, 2) : "n/a", hd.shock ? pmq(hd.shock, 3) : "n/a"];
    };

    gyro.ranks = [
        { key: "split", label: "mode split", unit: "%", higher: false, digits: 2 },
        { key: "sens", label: "signal per °/s", unit: "aF", higher: true, digits: 3 },
        { key: "arw", label: "angle random walk", unit: "°/√h", higher: false, digits: 1 },
        { key: "amp", label: "drive amplitude", unit: "µm", higher: true, digits: 2 },
        { key: "quad", label: "quadrature error", unit: "°/s", higher: false, digits: 0 },
        { key: "shock", label: "shock survival", unit: "g", higher: true, digits: 0 }
    ];

    gyro.charts = function (container, batches, theme, colors) {

        const v = env();
        const h = v.h;
        const po = { vdc: 20, vac: 10, pressure: "atm" };

        const driveS = [];
        const matchS = [];

        batches.forEach(function (b) {

            const d = v.devicesOf(b).filter(function (x) { try { return M.working(x); } catch (e) { return false; } })[0];

            if (!d) { return; }

            const dr = M.gyroDrive(d, po);
            const rt = M.gyroRate(d, { vdc: 20, vac: 10, pressure: "atm", tune: 0, range: 300, vex: 2.5, cf: 0.01 });

            if (dr.ok) { driveS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, x: dr.f.map(function (f) { return f / 1000; }), y: dr.amp }); }
            if (rt.ok) { matchS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, x: rt.mf.map(function (f) { return f / 1000; }), y: rt.mgain }); }
        });

        const mk = function (cfg) { const c = h("canvas", { role: "img" }); D.line(c, cfg); container.appendChild(c); };

        if (driveS.length) { mk({ theme: theme, xLabel: "Drive frequency (kHz)", yLabel: "Amplitude (µm)", title: "Drive resonance (device 1)", series: driveS }); }
        if (matchS.length) { mk({ theme: theme, xLabel: "Frequency (kHz)", yLabel: "Sense response (relative)", title: "Sense resonance (device 1)", series: matchS }); }

        return [
            { key: "split", title: "Mode split (mean ± SD)", yLabel: "%" },
            { key: "sens", title: "Signal per °/s (mean ± SD)", yLabel: "aF" },
            { key: "arw", title: "Angle random walk (mean ± SD)", yLabel: "°/√h" },
            { key: "amp", title: "Drive amplitude (mean ± SD)", yLabel: "µm" },
            { key: "shock", title: "Shock survival (mean ± SD)", yLabel: "g" }
        ];
    };


    /* ------------------------------------------------
       MICROMIRROR
    ------------------------------------------------ */

    const mirror = base("mirror");

    function mirrorFromTilt(dev, p) {

        const t = M.mirrorTilt(dev, { vmax: 200 });

        return t.ok && t.vPi ? t.vPi : 60;
    }

    mirror.measure = function (type, dev, p) {

        switch (type) {

            case "dmm": return M.check(dev);
            case "tilt": return M.mirrorTilt(dev, { vmax: p.vmax });
            case "switch": return M.mirrorSwitch(dev, { v: p.vfac * mirrorFromTilt(dev, p), tmax: 60e-6, frame: 1 / 60, pressure: p.pressure });
            case "optics": return M.mirrorOptics(dev, { fnum: p.fnum, margin: p.margin });
            case "display": return M.mirrorDisplay(dev, { v: p.vfac * mirrorFromTilt(dev, p), fnum: p.fnum, margin: p.margin, pressure: p.pressure, cols: SIZES[p.size][0], rows: SIZES[p.size][1], pattern: pattern(SIZES[p.size][0], SIZES[p.size][1]) });
            default: return M.mirrorLife(dev, {});
        }
    };

    mirror.view = function (container, r, theme) {

        const v = env();
        const h = v.h;
        const sig = v.sig;
        const type = r.test.type;
        const reps = r.reps;
        const p = r.test.params;
        const color = function (k) { return D.color(k, theme); };

        if (type === "dmm") { viewCheck(container, r, theme, "micromirror"); return; }

        const good = reps.filter(function (x) { return x.ok; });

        if (!good.length) {

            container.appendChild(h("p", { className: "lab-note warn", text: "No working micromirror in this batch. Open the failure analysis, or run the release check, to see why." }));
            problemNotes(container, reps[0] || {});

            return;
        }

        const a = good[0];

        if (type === "tilt") {

            problemNotes(container, a);

            const tc = h("canvas", { role: "img" });
            const sc = h("canvas", { role: "img" });

            const series = [{ label: "Voltage rising", color: color(0), width: 2.2, x: a.vUp, y: a.thUp }];

            if (a.vDn.length) { series.push({ label: "Voltage falling", color: color(2), width: 2, dash: [5, 4], x: a.vDn, y: a.thDn }); }

            D.line(tc, { theme: theme, xLabel: "Voltage on electrode A (V)", yLabel: "Mirror tilt (°)", title: "Tilt against voltage (device 1)", series: series });

            D.line(sc, {
                theme: theme, xLabel: "Tilt (°)", yLabel: "Torque (nN·m)", title: "Electrostatic torque against the hinge spring",
                series: [{ label: "Hinge spring", color: "#e8edf8", width: 2.4, dash: [6, 4], x: a.tauTh, y: a.spring }].concat(a.tauSets.map(function (s, k) { return { label: sig(s.v, 3) + " V", color: color(k), width: 1.8, x: a.tauTh, y: s.y }; }))
            });

            container.appendChild(h("div", { className: "lab-charts" }, [tc, sc]));

            container.appendChild(h("p", { className: "lab-hint", text: "The electrode pulls the nearer half of the mirror down; the hinge twists back. Up to about a third of the way to the landing the two balance. Past that the pull grows faster than the spring: the mirror snaps down to its stop (pull-in). To let go, the voltage has to fall well below the pull-in voltage, because the mirror is now much closer to the electrode (hysteresis)." }));

            container.appendChild(v.table(["Metric (device 1)", "Value"], [
                ["Pull-in voltage", a.vPi ? sig(a.vPi, 3) + " V" : "not reached below " + p.vmax + " V"],
                ["Release voltage", a.vRel !== null && a.vRel !== undefined ? sig(a.vRel, 3) + " V" + (a.stuck ? " (never lets go)" : "") : "n/a"],
                ["Hysteresis", a.hyst !== null && a.hyst !== undefined ? sig(a.hyst, 3) + " V" : "n/a"],
                ["Landing tilt", sig(a.landDeg, 3) + "° (light is turned by twice that)"],
                ["Gap under the mirror", sig(a.g0, 3) + " µm"],
                ["Hinge torsion stiffness", sig(a.k * 1e9, 3) + " nN·m/rad"],
                ["Hinges", a.hinge ? a.hinge.n + " of " + sig(a.hinge.w, 2) + " µm wide, " + sig(a.hinge.L, 3) + " µm long" : "n/a"],
                ["Resonance of the tilt mode", sig(a.f0 / 1000, 3) + " kHz"],
                ["Landing dimples", String(a.dimples)]
            ]));

            container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
                ["Pull-in voltage (V)", pmq(good.map(function (x) { return x.vPi || NaN; }), 3)],
                ["Landing tilt (°)", pmq(good.map(function (x) { return x.landDeg; }), 3)],
                ["Release voltage (V)", pmq(good.map(function (x) { return x.vRel === null ? NaN : x.vRel; }), 3)]
            ]));

            return;
        }

        if (type === "switch") {

            problemNotes(container, a);

            const tc = h("canvas", { role: "img" });

            const series = [{ label: "Voltage on", color: color(0), width: 2.2, x: a.t, y: a.thOn }];

            if (a.thOff && a.thOff.length) { series.push({ label: "Voltage off", color: color(2), width: 2, x: a.t, y: a.thOff }); }

            series.push({ label: "Landing angle", color: "#e07070", width: 1.2, dash: [5, 4], x: [a.t[0], a.t[a.t.length - 1]], y: [a.landDeg, a.landDeg] });

            D.line(tc, { theme: theme, xLabel: "Time (µs)", yLabel: "Mirror tilt (°)", title: "Switching at " + sig(a.v, 3) + " V (device 1)", series: series });

            container.appendChild(tc);

            container.appendChild(h("p", { className: "lab-hint", text: "The mirror is a torsion pendulum: it accelerates under the electrostatic torque, hits its landing stop and bounces a little. Air squeezed under the plate damps it; a low Q settles quickly. Letting go, the hinge spring has to fight the stiction of the landing tips. The faster it switches, the more grey levels a display can make by turning the mirror on for part of each frame." }));

            container.appendChild(v.table(["Metric (device 1)", "Value"], [
                ["Time to land", a.tOn === null ? "does not land at this voltage" : sig(a.tOn, 3) + " µs"],
                ["Time to flatten after letting go", a.tOff === null ? (a.landed ? "does not let go: stiction" : "n/a") : sig(a.tOff, 3) + " µs"],
                ["Quality factor of the tilt mode", sig(a.Q, 3)],
                ["Resonance of the tilt mode", sig(a.f0 / 1000, 3) + " kHz"],
                ["Grey levels at 60 frames per second", a.bits + " bits (" + Math.pow(2, a.bits) + " levels)"]
            ]));

            container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
                ["Time to land (µs)", pmq(good.map(function (x) { return x.tOn === null ? NaN : x.tOn; }), 3)],
                ["Quality factor", pmq(good.map(function (x) { return x.Q; }), 3)]
            ]));

            return;
        }

        if (type === "optics") {

            problemNotes(container, a);

            const cc = h("canvas", { role: "img" });

            D.line(cc, {
                theme: theme, xLabel: "Lens f-number", yLabel: "Contrast ratio (on ÷ off)", yLog: true, title: "Contrast against the projector lens (device 1)",
                series: good.map(function (x, k) { return { label: k === 0 ? "Your mirror" : undefined, color: color(0), alpha: k === 0 ? 1 : 0.35, width: k === 0 ? 2.2 : 1.2, dots: k === 0, x: x.curve.f, y: x.curve.cr }; })
            });

            container.appendChild(cc);

            container.appendChild(h("p", { className: "lab-hint", text: "A mirror tilted by θ turns the beam by 2θ, so the on and off beams are 4θ apart. The projection lens collects a cone of half-angle atan(1/2N). If the cones overlap, some off-state light still gets through and the contrast is poor. A bigger tilt, or a slower lens, separates them. Other losses are the gaps between mirrors (fill factor), the metal's reflectivity, the holes, and a curved mirror that spreads the beam." }));

            container.appendChild(v.table(["Metric (device 1)", "Value"], [
                ["Mirror size", sig(a.size[0], 3) + " × " + sig(a.size[1], 3) + " µm, pixel pitch " + sig(a.pitch, 3) + " µm"],
                ["Fill factor", sig(a.fill * 100, 3) + " %"],
                ["Reflectivity of the surface", sig(a.refl * 100, 3) + " %"],
                ["Curl of the mirror (sag over its width)", sig(a.sag, 3) + " nm, spreading the beam by " + sig(a.spread, 2) + "°"],
                ["Beam separation between on and off", sig(a.sep * 180 / Math.PI, 3) + "° (lens half-angle " + sig(a.alpha, 3) + "°)"],
                ["On and off cones overlap by", sig(a.overlap * 100, 3) + " %"],
                ["Contrast ratio at f/" + a.fnum, sig(a.cr, 3) + " : 1"],
                ["Light efficiency of an on pixel", sig(a.efficiency * 100, 3) + " %"]
            ]));

            container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
                ["Contrast ratio", pmq(good.map(function (x) { return x.cr; }), 3)],
                ["Efficiency (%)", pmq(good.map(function (x) { return x.efficiency * 100; }), 3)]
            ]));

            return;
        }

        if (type === "display") {

            problemNotes(container, a);

            const cv = h("canvas", { role: "img", className: "lab-display" });

            const cols = a.cols;
            const rows = a.rows;
            const cell = Math.max(6, Math.floor(480 / cols));

            cv.width = cols * cell;
            cv.height = rows * cell;
            cv.style.maxWidth = "100%";
            cv.style.imageRendering = "pixelated";
            cv.style.borderRadius = "8px";

            const ctx = cv.getContext("2d");
            const peak = Math.max(a.op.efficiency, 1e-6);

            ctx.fillStyle = "#06080f";
            ctx.fillRect(0, 0, cv.width, cv.height);

            for (let j = 0; j < rows; j++) {

                for (let i = 0; i < cols; i++) {

                    const b = clamp01(a.bright[j * cols + i] / peak);
                    const stuckOn = a.state[j * cols + i] === 1 && a.on[j * cols + i] === 0;
                    const stuckOff = a.state[j * cols + i] === 0 && a.on[j * cols + i] === 1;

                    ctx.fillStyle = "rgb(" + Math.round(40 + 215 * b) + "," + Math.round(60 + 195 * b) + "," + Math.round(90 + 150 * b) + ")";

                    if (b < 0.02) { ctx.fillStyle = "#0b1020"; }
                    if (stuckOn) { ctx.fillStyle = "#ff6b6b"; }
                    if (stuckOff) { ctx.fillStyle = "#4a2a3a"; }

                    ctx.fillRect(i * cell + 1, j * cell + 1, cell - 2, cell - 2);
                }
            }

            container.appendChild(cv);

            container.appendChild(h("p", { className: "lab-hint", text: "Each square is one of your mirrors. Bright squares are mirrors tilted toward the lens; dark ones are tilted away. Red squares are stuck on and dark red are stuck off: mirrors that stayed stuck after release or never landed at this voltage. A real projector shows greys by flipping each mirror on for a fraction of every frame." }));

            container.appendChild(v.table(["Metric (device 1's pixel, array of " + cols * rows + ")", "Value"], [
                ["Stuck pixels", a.nStuck + " (" + sig(a.stuckPct, 3) + " %)"],
                ["Chance that one pixel is stuck", sig(a.pStuck * 100, 3) + " %"],
                ["Brightness of an on pixel", sig(a.op.efficiency * 100, 3) + " % of the light"],
                ["Contrast ratio at f/" + a.op.fnum, sig(a.op.cr, 3) + " : 1"],
                ["Brightness variation between on pixels", sig(a.uniform, 3) + " %"],
                ["Grey levels at 60 frames per second", a.bits + " bits"]
            ]));

            return;
        }

        // life
        problemNotes(container, a);

        const sc = h("canvas", { role: "img" });

        D.line(sc, {
            theme: theme, xLabel: "Shock (g)", yLabel: "Peak stress in a hinge (MPa)", xLog: true, yLog: true, title: "Stress against shock (device 1)",
            series: a.axes.map(function (ax, k) { return { label: "Along " + ax.axis, color: color(k), width: 2, dots: true, x: a.levels, y: a.curves[k] }; })
                .concat([{ label: "Fracture strength", color: "#e07070", width: 1.4, dash: [5, 4], x: [a.levels[0], a.levels[a.levels.length - 1]], y: [a.strength, a.strength] }])
        });

        container.appendChild(sc);

        container.appendChild(h("p", { className: "lab-hint", text: "Every time the mirror lands, the hinge twists by the landing angle and stores a stress. Polysilicon fatigues: the lower the stress as a fraction of its strength, the longer it lasts, and the dependence is steep. A thinner or longer hinge is softer and lasts longer, but it is also weaker against shock and slower to let go of a sticky landing." }));

        container.appendChild(v.table(["Metric (device 1)", "Value"], [
            ["Hinge stress each time it lands", sig(a.hingeStress, 3) + " MPa (" + sig(a.ratio * 100, 3) + " % of the fracture strength)"],
            ["Switches until fatigue", a.cycles.toExponential(1)],
            ["Hours of video at 60 frames per second", a.hours > 1e6 ? "more than a million" : sig(a.hours, 3)],
            ["Survives shock up to", sig(a.worst, 3) + " g"]
        ]));

        container.appendChild(v.table(["Metric (per device)", "Mean ± spread"], [
            ["Hinge stress (MPa)", pmq(good.map(function (x) { return x.hingeStress; }), 3)],
            ["Survives shock up to (g)", pmq(good.map(function (x) { return x.worst; }), 3)]
        ]));
    };

    function clamp01(x) { return Math.max(0, Math.min(1, x)); }

    mirror.headline = function (batch) {

        const v = env();
        const devs = v.devicesOf(batch);
        const out = { vpi: null, land: null, ton: null, cr: null, eff: null, stuck: null, life: null };

        const num = function (fn) { return devs.map(function (d) { try { return M.working(d) ? fn(d) : NaN; } catch (e) { return NaN; } }); };

        const tilt = devs.map(function (d) { try { return M.working(d) ? M.mirrorTilt(d, { vmax: 200 }) : null; } catch (e) { return null; } });

        out.vpi = tilt.map(function (t) { return t && t.vPi ? t.vPi : NaN; });
        out.land = tilt.map(function (t) { return t && t.landDeg ? t.landDeg : NaN; });
        out.ton = devs.map(function (d, k) { try { const t = tilt[k]; if (!t || !t.vPi) { return NaN; } const s = M.mirrorSwitch(d, { v: 1.3 * t.vPi, tmax: 60e-6, frame: 1 / 60, pressure: "atm" }); return s.tOn === null ? NaN : s.tOn; } catch (e) { return NaN; } });
        out.cr = num(function (d) { return M.mirrorOptics(d, { fnum: 2.4, margin: 2 }).cr; });
        out.eff = num(function (d) { return M.mirrorOptics(d, { fnum: 2.4, margin: 2 }).efficiency * 100; });
        out.stuck = devs.map(function (d) { try { return M.stiction(d).p * 100; } catch (e) { return NaN; } });
        out.life = num(function (d) { return Math.log10(Math.max(M.mirrorLife(d, {}).cycles, 1)); });

        return out;
    };

    mirror.tableHead = ["Pull-in (V)", "Landing tilt (°)", "Switching (µs)", "Contrast at f/2.4", "Efficiency (%)", "Chance stuck (%)", "Life (log₁₀ switches)"];

    mirror.tableRow = function (hd) {

        return [hd.vpi ? pmq(hd.vpi, 3) : "n/a", hd.land ? pmq(hd.land, 3) : "n/a", hd.ton ? pmq(hd.ton, 2) : "n/a", hd.cr ? pmq(hd.cr, 3) : "n/a", hd.eff ? pmq(hd.eff, 3) : "n/a", hd.stuck ? pmq(hd.stuck, 2) : "n/a", hd.life ? pmq(hd.life, 3) : "n/a"];
    };

    mirror.ranks = [
        { key: "vpi", label: "pull-in voltage", unit: "V", higher: false, digits: 0 },
        { key: "land", label: "landing tilt", unit: "°", higher: true, digits: 1 },
        { key: "ton", label: "switching time", unit: "µs", higher: false, digits: 1 },
        { key: "cr", label: "contrast ratio", unit: ":1", higher: true, digits: 1 },
        { key: "eff", label: "light efficiency", unit: "%", higher: true, digits: 0 },
        { key: "stuck", label: "chance of sticking", unit: "%", higher: false, digits: 1 },
        { key: "life", label: "life", unit: "log10", higher: true, digits: 1 }
    ];

    mirror.charts = function (container, batches, theme, colors) {

        const v = env();
        const h = v.h;

        const tiltS = [];
        const contrastS = [];

        batches.forEach(function (b) {

            const d = v.devicesOf(b).filter(function (x) { try { return M.working(x); } catch (e) { return false; } })[0];

            if (!d) { return; }

            const t = M.mirrorTilt(d, { vmax: 200 });

            if (t.ok) { tiltS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, x: t.vUp, y: t.thUp }); }

            const op = M.mirrorOptics(d, { fnum: 2.4, margin: 2 });

            if (op.ok) { contrastS.push({ label: v.shortName(b), color: colors[b.id], width: 2.2, dots: true, x: op.curve.f, y: op.curve.cr }); }
        });

        const mk = function (cfg) { const c = h("canvas", { role: "img" }); D.line(c, cfg); container.appendChild(c); };

        if (tiltS.length) { mk({ theme: theme, xLabel: "Voltage (V)", yLabel: "Tilt (°)", title: "Tilt against voltage (device 1)", series: tiltS }); }
        if (contrastS.length) { mk({ theme: theme, xLabel: "Lens f-number", yLabel: "Contrast ratio", yLog: true, title: "Contrast against the lens (device 1)", series: contrastS }); }

        return [
            { key: "vpi", title: "Pull-in voltage (mean ± SD)", yLabel: "V" },
            { key: "land", title: "Landing tilt (mean ± SD)", yLabel: "°" },
            { key: "ton", title: "Switching time (mean ± SD)", yLabel: "µs" },
            { key: "cr", title: "Contrast ratio at f/2.4 (mean ± SD)", yLabel: ": 1" },
            { key: "eff", title: "Light efficiency (mean ± SD)", yLabel: "%" }
        ];
    };


    /* ------------------------------------------------
       FAILURE ANALYSIS, PROCESS NOTES AND LAYER CARDS
    ------------------------------------------------ */

    function analysisOf(dv) {

        const v = env();
        const out = [];

        if (!dv.mems) { return out; }

        const rows = [];

        dv.mems.layers.forEach(function (l) {

            if (l.role === "structure") {

                rows.push([l.name, (E.MEMS_STRUCTURE[l.material] || {}).name + ", " + v.sig(l.t, 3) + " µm", l.fixedBase ? "on the nitride: fixed" : "gap below " + v.sig(l.gapBelow, 3) + " µm", l.reach !== undefined ? "HF reaches " + v.sig(l.reach, 3) + " µm, farthest point " + v.sig(l.needed || 0, 3) + " µm" : "n/a"]);
            }
        });

        if (rows.length) { out.push(v.table(["Structure layer", "Film", "Height", "Release"], rows)); }

        const un = dv.mems.pieces.filter(function (p) { return p.role === "structure" && p.unreleased >= 4; });

        if (un.length) { out.push(v.table(["Still held to the substrate", "Area (µm²)", "Near (x, y)"], un.slice(0, 8).map(function (p) { return [p.type === "beam" ? "beam" : "plate or block", v.sig(p.unreleased, 3) + " of " + v.sig(p.area, 3), Math.round(p.cx) + ", " + Math.round(p.cy)]; }))); }

        return out;
    }

    function processExtras(panel, d, save, kind) {

        const v = env();
        const h = v.h;
        const rel = release(d);
        const ox = d.layers.filter(function (l) { return l.role === "oxide"; })[0];
        const rate = ox && E.MEMS_OXIDES[ox.material] ? E.MEMS_OXIDES[ox.material].rate : 9;

        panel.appendChild(h("h2", { className: "lab-h2", text: "Release and drying" }));

        panel.appendChild(h("p", { className: "lab-hint", text: "After the last layer is deposited the wafer is diced and the sacrificial oxide is dissolved in hydrofluoric acid. The acid eats sideways from every open edge and release hole at about " + v.sig(rate, 2) + " µm per minute for your oxide. A part is only freed if no point of it is farther than that from an opening: a big plate or mass needs holes. Then the water has to be dried off without pulling the freed part down." }));

        const reach = h("p", { className: "lab-note ok", text: "" });

        const update = function () { reach.textContent = "The HF will undercut about " + v.sig(rate * rel.hf, 3) + " µm in " + rel.hf + " minutes."; };

        panel.appendChild(v.slider({
            label: "Time in HF", min: 0.5, max: 12, step: 0.25, value: rel.hf, unit: "min",
            hint: "Longer reaches farther into big plates, but it also eats the oxide under the anchors and attacks other films. Too short leaves parts held down.",
            onChange: function (x) { rel.hf = x; update(); save(); }
        }));

        panel.appendChild(reach);

        update();

        panel.appendChild(v.cards({
            label: "Drying",
            items: Object.keys(E.memsRelease.DRY).map(function (k) { return { id: k, title: E.memsRelease.DRY[k].name, body: E.memsRelease.DRY[k].blurb }; }),
            value: rel.dry,
            onChange: function (id) { rel.dry = id; save(); }
        }));

        panel.appendChild(h("p", { className: "lab-hint", text: "The layers are made from the bottom up, like PolyMUMPs: structural polysilicon, a sacrificial oxide whose openings become the anchors, optional dimples, the next structural layer, release holes, and a metal layer for the pads and the mirror. The order of the layers in your stack is the order they are deposited." }));
    }

    function layerExtras(layer, body, d) {

        const v = env();
        const h = v.h;

        if (layer.role === "structure") {

            const m = E.MEMS_STRUCTURE[layer.material];

            body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb + " Young's modulus " + v.sig(m.E) + " GPa, fracture strength about " + v.sig(m.strength) + " GPa." }));
            body.appendChild(h("p", { className: "lab-hint", text: "A thin piece (under about 8 µm wide and several times longer than wide) is treated as a flexible beam. Wide pieces are rigid masses and plates. Beams that stick out of a mass with a free end are comb fingers. The first structural layer sits directly on the nitride and never moves: use it for fixed electrodes. Later layers sit on a sacrificial oxide and can be released." }));

            return true;
        }

        if (layer.role === "oxide") {

            const m = E.MEMS_OXIDES[layer.material];

            body.appendChild(h("p", { className: "lab-muted", text: m.name + " · " + m.blurb }));
            body.appendChild(h("p", { className: "lab-hint", text: "This is a blanket film: it covers everything. The shapes you draw here are anchor openings, where the oxide is removed so the structural layer above is fixed to the layer below (or to the nitride). The film's thickness is the gap between the layers." }));

            return true;
        }

        if (layer.role === "dimple") {

            body.appendChild(h("p", { className: "lab-muted", text: "Dimples · small pits etched part-way into the oxide." }));
            body.appendChild(h("p", { className: "lab-hint", text: "The structural layer above fills them and gets small bumps on its underside. If the part is pulled down it touches on a few points instead of all over, which makes it far easier to free. Put them under big plates and masses." }));

            return true;
        }

        if (layer.role === "hole") {

            body.appendChild(h("p", { className: "lab-muted", text: "Release holes · cut through the structural layer just below this one." }));
            body.appendChild(h("p", { className: "lab-hint", text: "The HF needs a way in. Space the holes so that no point of the plate is farther from a hole or an edge than the HF can reach in the release time. Holes make the plate lighter and let air out from underneath it, which lowers the damping." }));

            return true;
        }

        if (layer.role === "collector") {

            const m = E.METALS[layer.material];

            body.appendChild(h("p", { className: "lab-muted", text: m.name + (layer.material === "au" ? " · very reflective for a mirror, and good for pads" : layer.material === "al" ? " · reflective, and a standard mirror metal" : "") }));
            body.appendChild(h("p", { className: "lab-hint", text: "Metal is deposited on the structural layer under it. It makes pads for wire bonds and, over a plate, a mirror surface. A film with stress curls the plate it is on, and metal on a spring makes it stiffer." }));

            return true;
        }

        return false;
    }

    function thicknessRange(layer) {

        if (layer.role === "structure") { return layer.material === "soi" ? { min: 2, max: 40, step: 0.5 } : { min: 0.5, max: 6, step: 0.1 }; }
        if (layer.role === "oxide") { return { min: 0.5, max: 6, step: 0.1 }; }
        if (layer.role === "dimple") { return { min: 0.1, max: 1.5, step: 0.05 }; }
        if (layer.role === "hole") { return { min: 0.5, max: 2, step: 0.5 }; }
        if (layer.role === "collector") { return { min: 0.1, max: 1, step: 0.05 }; }

        return null;
    }

    function designRowsOf(label) {

        return function (d) {

            const pads = E.padsOf(d);
            const nets = Array.from(new Set(pads.map(function (p) { return p.label; }))).sort();
            const st = d.layers.filter(function (l) { return l.role === "structure" && l.shapes.length; });
            const rel = release(d);

            return [
                ["Electrodes (named pads)", nets.join(", ") || "none yet"],
                ["Structural layers", st.length ? st.map(function (l) { return l.name.split(" (")[0] + " " + l.thickness + " µm"; }).join(", ") : "none yet"],
                ["Release", rel.hf + " min HF, " + (E.memsRelease.DRY[rel.dry] || {}).name]
            ];
        };
    }

    function batchInfoOf(snap) {

        const rel = snap.culture || {};
        const st = snap.layers.filter(function (l) { return l.role === "structure" && l.shapes.length; });

        return st.length + " structural layer" + (st.length === 1 ? "" : "s") + ", " + (rel.hf || 2) + " min HF, " + ((E.memsRelease.DRY[rel.dry] || E.memsRelease.DRY.ipa).name.split(",")[0].toLowerCase());
    }

    [[accel, "accel"], [gyro, "gyro"], [mirror, "mirror"]].forEach(function (pair) {

        const impl = pair[0];

        impl.analysis = function (dv) { return analysisOf(dv); };
        impl.processExtras = processExtras;
        impl.designRows = designRowsOf(pair[1]);
        impl.batchInfo = batchInfoOf;
        impl.layerExtras = layerExtras;
        impl.thicknessRange = thicknessRange;

        K[pair[1]] = impl;
    });

}(typeof window !== "undefined" ? window : globalThis));
