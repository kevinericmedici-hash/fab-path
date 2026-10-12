/* ========================================
   GLUCOSE SENSOR (CGM FILAMENT): DEVICE ANALYSIS

   Registers the "cgm" kind with LabEngine. A continuous glucose sensor is a
   thin strip with up to four electrodes: W (working, carries the enzyme),
   S (sentinel, the same stack without the enzyme), R (reference, Ag/AgCl)
   and C (counter). The shared electrode analysis in lab-neural-engine.js
   finds each electrode's open area, metal, coating stack (inside to
   outside), trace resistance and the shape of the strip. The chemistry
   and the tests live in lab-cgm-model.js.

   Needs window.LabEngine and lab-neural-engine.js (for E.electrodeKit).
======================================== */

(function (root) {

    "use strict";

    const E = root.LabEngine;

    const CFG = {
        kind: "cgm", label: /^[WSRC]$/, body: "sensor body", medium: "tissue fluid",
        noPad: "No contact pad named W, S, R or C was found.",
        badLabel: "is not an electrode name. Sensor pads are W (working), S (sentinel), R (reference) or C (counter)."
    };


    /* ------------------------------------------------
       TEMPLATES (all lengths in um)
    ------------------------------------------------ */

    function r(x, y, w, h, pad) {

        const s = { t: "r", x: x, y: y, w: w, h: h };

        if (pad) { s.pad = pad; }

        return s;
    }

    function trace(w, pts) { return { t: "t", w: w, pts: pts }; }

    // Lanes across the strip, from one edge to the other.
    const ORDER = ["R", "W", "S", "C"];

    function geometry(p) {

        const N = ORDER.length;
        const pitch = 400;
        const padSize = 300;
        const yc = p.W / 2;
        const lens = { W: p.lenW, S: p.lenS, R: p.lenR, C: p.lenC };

        const lane = function (k) { return p.W * (k + 0.5) / N; };
        const yPad = function (k) { return yc + (k - (N - 1) / 2) * pitch; };

        const g = { sites: {}, traces: {}, pads: {}, windows: [], coats: {}, order: ORDER };

        ORDER.forEach(function (d, k) {

            const ys = lane(k);
            const x0 = p.x0;
            const x1 = p.x0 + lens[d];

            g.sites[d] = r(x0, ys - p.sw / 2, lens[d], p.sw);
            g.windows.push(r(x0, ys - p.sw / 2, lens[d], p.sw));
            g.coats[d] = r(x0 - 12, ys - p.sw / 2 - 12, lens[d] + 24, p.sw + 24);

            g.traces[d] = trace(p.tw, [[x1 - 5, ys], [p.L + 100, ys], [p.L + 700, yPad(k)], [p.L + 1000, yPad(k)]]);
            g.pads[d] = r(p.L + 1000, yPad(k) - padSize / 2, padSize, padSize, d);

            g.windows.push(r(p.L + 1020, yPad(k) - padSize / 2 + 20, padSize - 40, padSize - 40));
        });

        const headH = N * pitch + 200;

        g.body = [
            { t: "p", pts: [[0, yc], [350, 0], [p.L, 0], [p.L, p.W], [350, p.W]] },
            r(p.L - 50, yc - headH / 2, 1700, headH)
        ];

        return g;
    }


    function buildTemplate(kind, name, params) {

        const p = Object.assign({ L: 7000, W: 500, sw: 90, tw: 30, x0: 500, lenW: 1600, lenS: 1600, lenR: 900, lenC: 1800 }, params || {});

        if (name === "blank") {

            const l = E.newLayer("collector", { name: "Metal (electrodes, traces, pads)", material: "pt", thickness: 0.15 });

            return { id: E.uid("D"), name: "", kind: kind, electrolyte: "pbs", grid: 5, layers: [l] };
        }

        const g = geometry(p);

        const layers = [];

        const mk = function (role, opts, shapes, chrome) {

            const l = E.newLayer(role, opts);

            l.shapes = shapes;

            if (chrome) { l.mask.type = "chrome"; }

            E.syncLayer(l);

            layers.push(l);

            return l;
        };

        const metalOf = function (list, metal, label) {

            const shapes = [];

            list.forEach(function (d) { shapes.push(g.sites[d], g.traces[d], g.pads[d]); });

            mk("collector", { name: label, material: metal, thickness: metal === "c" ? 5 : 0.15 }, shapes, true);
        };

        const wired = name === "cgm-wired";
        const metal = wired ? "au" : "pt";

        mk("substrate", { name: "Sensor body", material: "pi", thickness: 25 }, g.body);

        metalOf(["W", "S", "C"], metal, (wired ? "Gold" : "Platinum") + " electrodes (W, S, C)");
        metalOf(["R"], "agcl", "Ag/AgCl reference (R)");

        mk("insulation", { name: "Passivation (windows over electrodes and pads)", material: "parylene", thickness: 2, mode: "cut" }, g.windows, true);

        const both = [g.coats.W, g.coats.S];

        if (name === "cgm-gen1") {

            mk("coating", { name: "Permselective film (W, S)", material: "mpd", thickness: 0.05 }, both);
            mk("coating", { name: "Glucose oxidase (W only)", material: "gox", thickness: 1 }, [g.coats.W]);
            mk("coating", { name: "Glucose-limiting membrane (W, S)", material: "pu", thickness: 8 }, both);
            mk("coating", { name: "Hydrogel outer coat (W, S)", material: "hydrogel", thickness: 3 }, both);

        } else if (wired) {

            mk("coating", { name: "Wired enzyme (W only)", material: "osgox", thickness: 3 }, [g.coats.W]);
            mk("coating", { name: "Glucose-limiting membrane (W, S)", material: "pu", thickness: 5 }, both);
            mk("coating", { name: "Hydrogel outer coat (W, S)", material: "hydrogel", thickness: 3 }, both);

        } else {

            mk("coating", { name: "Glucose oxidase (W only)", material: "gox", thickness: 1 }, [g.coats.W]);
        }

        return { id: E.uid("D"), name: "", kind: kind, electrolyte: "pbs", grid: 5, layers: layers };
    }


    const TEMPLATES = [
        { id: "cgm-gen1", name: "First-generation sensor (GOx on platinum)", blurb: "Platinum electrodes with a permselective film, glucose oxidase on W only, a glucose-limiting membrane and a hydrogel. S has the same stack without the enzyme. Ag/AgCl reference." },
        { id: "cgm-wired", name: "Wired-enzyme sensor (osmium mediator on gold)", blurb: "Gold electrodes with an osmium-wired enzyme that works at a low potential, a thinner limiting membrane and a hydrogel. Little oxygen or interferent trouble." },
        { id: "cgm-simple", name: "Simple enzyme electrode (no membranes)", blurb: "Platinum with just a glucose oxidase layer on W. Cheap to make, and a good way to see what the membranes are for." },
        { id: "blank", name: "Blank (draw everything yourself)", blurb: "One empty metal layer." }
    ];


    function analyze(ctx) { return E.electrodeKit.analyzeWith(CFG, ctx); }

    function check(design, out, labels) { E.electrodeKit.checkWith(CFG, design, out, labels); }

    E.registerKind("cgm", { analyze: analyze, buildTemplate: buildTemplate, check: check, templates: TEMPLATES, cells: 900000, featDiv: 5 });

    E.cgmGeometry = geometry;

}(typeof window !== "undefined" ? window : globalThis));
