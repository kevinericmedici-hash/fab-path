/* ========================================
   SAND TO CHIP: THE VIRTUAL FOUNDRY MODEL

   Pure functions that follow a batch of sand through the whole chain:
   sorting and cleaning the sand, the arc furnace, purification to
   polysilicon, crystal growth, wafering, the transistor process, the
   product and its yield, packaging and final test. Each stage takes the
   previous stage's result, so a choice made at the sand pile shows up in
   the cost and yield of the finished chip.

   All numbers are rounded textbook-scale approximations for teaching.
======================================== */

(function (root) {

    "use strict";


    /* ------------------------------------------------
       SMALL HELPERS
    ------------------------------------------------ */

    function rng(seed) {

        let a = (seed >>> 0) || 1;

        return function () {

            a = (a + 0x6D2B79F5) >>> 0;

            let t = a;

            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function gauss(rand) {

        let u = 0;
        let v = 0;

        while (u === 0) { u = rand(); }
        while (v === 0) { v = rand(); }

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

    function num(x, lo, hi, def) { const n = Number(x); return isFinite(n) ? clamp(n, lo, hi) : def; }

    function pick(v, table, def) { return typeof v === "string" && Object.prototype.hasOwnProperty.call(table, v) ? v : def; }

    const Q = 1.602e-19;
    const KB_EV = 8.617e-5;


    /* ------------------------------------------------
       1. SAND
    ------------------------------------------------ */

    // What a grain is made of, as mass fractions. Quartz grains get their own impurity level from the site.
    const GRAINS = {

        quartz: { name: "Clear quartz", color: "#e6e3d6", edge: "#bdb9a8", note: "Glassy and colourless: this is what you want.", sio2: 0.999, fe: 0, al: 0, ti: 0, ca: 0 },
        iron: { name: "Iron-stained grain", color: "#cf7b3c", edge: "#8f4c1f", note: "Quartz with a rusty coat of iron oxide.", sio2: 0.93, fe: 0.04, al: 0.01, ti: 0.001, ca: 0 },
        magnetite: { name: "Magnetite (black)", color: "#2c2c33", edge: "#0f0f14", note: "Black, magnetic iron oxide. Pure iron contamination.", sio2: 0, fe: 0.72, al: 0, ti: 0.01, ca: 0 },
        ilmenite: { name: "Ilmenite (dark violet)", color: "#4a3a58", edge: "#2a2036", note: "A dark iron-titanium mineral.", sio2: 0, fe: 0.37, al: 0, ti: 0.32, ca: 0 },
        feldspar: { name: "Feldspar (pink-white)", color: "#efd2c8", edge: "#c59d90", note: "A pale aluminium-rich mineral, easy to confuse with quartz.", sio2: 0.66, fe: 0, al: 0.1, ti: 0.0002, ca: 0 },
        shell: { name: "Shell fragment", color: "#fbf0d4", edge: "#d8c796", note: "Calcium carbonate: chalky and creamy.", sio2: 0, fe: 0, al: 0, ti: 0, ca: 0.4 },
        clay: { name: "Clay and silt", color: "#b9a888", edge: "#8d7e62", note: "Fine tan dust with aluminium and iron.", sio2: 0.46, fe: 0.03, al: 0.21, ti: 0.01, ca: 0 },
        garnet: { name: "Garnet (red)", color: "#a52233", edge: "#5f0f1b", note: "Heavy red mineral rich in iron and aluminium.", sio2: 0.37, fe: 0.2, al: 0.11, ti: 0, ca: 0 }
    };

    // Impurities in the quartz itself, in ppm of the grain (boron and phosphorus matter most for chips).
    const SITES = {

        beach: {
            name: "Beach sand", blurb: "Easy to scoop, but full of shell, dark heavy minerals and a mix of other rocks.",
            mix: { quartz: 0.78, iron: 0.07, magnetite: 0.03, feldspar: 0.06, shell: 0.04, ilmenite: 0.02 },
            quartz: { fe: 60, al: 300, ti: 40, b: 0.5, p: 1.0 }, cost: 0.02
        },
        desert: {
            name: "Desert dune sand", blurb: "Rounded, wind-polished grains with a rusty stain, but mostly quartz.",
            mix: { quartz: 0.88, iron: 0.08, feldspar: 0.03, magnetite: 0.01 },
            quartz: { fe: 80, al: 200, ti: 30, b: 0.4, p: 0.8 }, cost: 0.03
        },
        river: {
            name: "River sand", blurb: "Washed by the river, so it carries silt, feldspar and heavy minerals.",
            mix: { quartz: 0.72, feldspar: 0.12, iron: 0.06, clay: 0.05, garnet: 0.03, magnetite: 0.02 },
            quartz: { fe: 50, al: 250, ti: 35, b: 0.5, p: 1.0 }, cost: 0.03
        },
        sandstone: {
            name: "Quarried sandstone", blurb: "A glass-making quarry: sorted, washed and already about 98% quartz.",
            mix: { quartz: 0.965, feldspar: 0.02, iron: 0.01, clay: 0.005 },
            quartz: { fe: 20, al: 100, ti: 15, b: 0.2, p: 0.3 }, cost: 0.08
        },
        vein: {
            name: "High-purity vein quartz", blurb: "Mined from rare, very clean quartz veins. Expensive, but nearly spotless.",
            mix: { quartz: 0.995, feldspar: 0.003, iron: 0.002 },
            quartz: { fe: 3, al: 20, ti: 1.5, b: 0.03, p: 0.05 }, cost: 1.2
        }
    };

    // Cleaning stages applied to the whole pile. rem: share of each grain type that is taken out. conv: grains changed in place.
    const TREATMENTS = {

        magnet: { name: "Magnetic separation", blurb: "Pulls out magnetite and some other heavy minerals. Cheap.", rem: { magnetite: 0.95, ilmenite: 0.6, garnet: 0.4, iron: 0.1 }, loss: 0.01, cost: 0.01, kwh: 0.3 },
        wash: { name: "Washing and de-sliming", blurb: "Water takes away clay, silt and some shell.", rem: { clay: 0.9, shell: 0.3 }, loss: 0.02, cost: 0.01, kwh: 0.1 },
        flotation: { name: "Froth flotation", blurb: "Floats the feldspar and clay away from the quartz with a chemical foam.", rem: { feldspar: 0.85, clay: 0.5, garnet: 0.2 }, loss: 0.03, cost: 0.06, kwh: 0.8 },
        leach: { name: "Hot acid leach", blurb: "Hot hydrochloric and hydrofluoric acid strip rust and dissolve shell. Strong, but costly and hazardous.", rem: { shell: 0.95, feldspar: 0.15, clay: 0.3 }, conv: { iron: 0.88 }, loss: 0.04, cost: 0.2, kwh: 1.2 }
    };

    const N_GRAINS = 520;

    function normMix(mix) {

        let s = 0;

        Object.keys(mix).forEach(function (k) { s += mix[k]; });

        return s;
    }

    // The pile on the table: a fixed random arrangement of grains for a given site and seed.
    function makeGrains(siteId, seed) {

        const site = SITES[siteId] || SITES.beach;
        const rand = rng(seed * 7919 + siteId.length * 131 + 17);
        const types = Object.keys(site.mix);
        const total = normMix(site.mix);

        const out = [];

        for (let i = 0; i < N_GRAINS; i++) {

            let r = rand() * total;
            let t = types[0];

            for (let k = 0; k < types.length; k++) {

                r -= site.mix[types[k]];

                if (r <= 0) { t = types[k]; break; }
            }

            out.push({ id: i, type: t, x: rand(), y: rand(), r: 0.6 + 0.8 * rand(), rot: rand() * 6.28 });
        }

        return out;
    }

    // Composition of the pile after hand-picking and the chosen cleaning stages.
    function sandResult(siteId, grains, removed, treat, feedKg) {

        const site = SITES[siteId] || SITES.beach;
        const gone = {};

        (removed || []).forEach(function (id) { gone[id] = true; });

        const counts = {};

        grains.forEach(function (g) { if (!gone[g.id]) { counts[g.type] = (counts[g.type] || 0) + 1; } });

        const start = grains.length;
        let cost = site.cost * feedKg;
        let kwh = 0;

        const leached = { iron: 0 };

        Object.keys(TREATMENTS).forEach(function (id) {

            if (!(treat && treat[id])) { return; }

            const tr = TREATMENTS[id];

            Object.keys(tr.rem || {}).forEach(function (t) { if (counts[t]) { counts[t] *= 1 - tr.rem[t]; } });

            Object.keys(tr.conv || {}).forEach(function (t) {

                if (counts[t]) {

                    const moved = counts[t] * tr.conv[t];

                    counts[t] -= moved;
                    leached[t] += moved;
                }
            });

            Object.keys(counts).forEach(function (t) { counts[t] *= 1 - tr.loss; });
            Object.keys(leached).forEach(function (t) { leached[t] *= 1 - tr.loss; });

            cost += tr.cost * feedKg;
            kwh += tr.kwh * feedKg / 1000;
        });

        let n = 0;
        const sum = { sio2: 0, fe: 0, al: 0, ti: 0, ca: 0, b: 0, p: 0 };

        Object.keys(counts).forEach(function (t) {

            const g = GRAINS[t];
            const c = counts[t];

            n += c;

            sum.sio2 += c * g.sio2;
            sum.fe += c * g.fe;
            sum.al += c * g.al;
            sum.ti += c * g.ti;
            sum.ca += c * g.ca;

            if (t === "quartz") {

                sum.fe += c * site.quartz.fe * 1e-6;
                sum.al += c * site.quartz.al * 1e-6;
                sum.ti += c * site.quartz.ti * 1e-6;
                sum.b += c * site.quartz.b * 1e-6;
                sum.p += c * site.quartz.p * 1e-6;
            }
        });

        // Leached grains: the rust is gone, only a trace stays.
        const lc = leached.iron;

        if (lc > 0) {

            n += lc;

            sum.sio2 += lc * 0.995;
            sum.fe += lc * (0.04 * 0.12);
            sum.al += lc * 0.004;
            sum.ti += lc * 0.0003;
            sum.b += lc * site.quartz.b * 1e-6;
            sum.p += lc * site.quartz.p * 1e-6;
        }

        const retained = n / start;
        const nn = Math.max(n, 1e-9);

        return {
            sio2: sum.sio2 / nn, fe: sum.fe / nn * 1e6, al: sum.al / nn * 1e6, ti: sum.ti / nn * 1e6, ca: sum.ca / nn * 1e6, b: sum.b / nn * 1e6, p: sum.p / nn * 1e6,
            retained: retained, kg: feedKg * retained, feedKg: feedKg, cost: cost, kwh: kwh, counts: counts, leached: lc
        };
    }


    /* ------------------------------------------------
       2. ARC FURNACE: SAND TO METALLURGICAL SILICON
    ------------------------------------------------ */

    // ash: fraction of the carbon that is ash. b, p: ppm in the carbon. cost: dollars per kg.
    const CARBON = {

        coke: { name: "Coal coke", blurb: "The usual choice: cheap, but carries some ash, boron and phosphorus.", ash: 0.09, b: 4, p: 60, cost: 0.3, co2: 1 },
        charcoal: { name: "Charcoal", blurb: "Very low in ash and boron, but more expensive. Made from wood.", ash: 0.03, b: 1, p: 40, cost: 0.8, co2: 0.25 },
        coal: { name: "Plain coal", blurb: "The cheapest, with a lot of ash and impurities.", ash: 0.12, b: 10, p: 100, cost: 0.12, co2: 1 },
        petcoke: { name: "Petroleum coke", blurb: "Very low ash from oil refining, with a trace of boron.", ash: 0.01, b: 0.5, p: 5, cost: 0.5, co2: 1.1 }
    };

    function furnace(sand, o) {

        const carbon = CARBON[o.carbon] || CARBON.coke;
        const cPer100 = o.carbonPer100;                          // kg of carbon per 100 kg silica (the chemistry needs 40)
        const T = o.temp;

        const kgSand = sand.kg;
        const kgSilica = kgSand * sand.sio2;
        const kgC = kgSilica * cPer100 / 100;

        const etaC = Math.exp(-Math.pow((cPer100 - 42) / 11, 2));
        const etaT = 1 / (1 + Math.exp(-(T - 1900) / 45));
        const lossSiO = 1 - 0.2 * Math.pow(Math.max(0, (T - 2050) / 250), 2);

        const rho = Math.max(0, 0.9 * etaC * etaT * lossSiO);

        const kgSi = kgSilica * 28.086 / 60.084 * rho;

        // Impurities: what came with the sand and with the carbon, and how much of each ends up in the silicon.
        const part = { fe: 0.85, al: 0.6, ti: 0.8, ca: 0.25, b: 0.9, p: 0.6 };

        const mass = {
            fe: kgSand * sand.fe * 1e-6 + kgC * carbon.ash * 0.04,
            al: kgSand * sand.al * 1e-6 + kgC * carbon.ash * 0.22,
            ti: kgSand * sand.ti * 1e-6 + kgC * carbon.ash * 0.01,
            ca: kgSand * sand.ca * 1e-6 + kgC * carbon.ash * 0.06,
            b: kgSand * sand.b * 1e-6 + kgC * carbon.b * 1e-6,
            p: kgSand * sand.p * 1e-6 + kgC * carbon.p * 1e-6
        };

        const ppm = {};

        Object.keys(part).forEach(function (k) { ppm[k] = kgSi > 0 ? mass[k] * part[k] / kgSi * 1e6 : 0; });

        const totalPpm = ppm.fe + ppm.al + ppm.ti + ppm.ca + ppm.b + ppm.p;
        const purity = 100 - totalPpm / 1e4 - 0.35;

        const kwhPerKg = (11.5 + 0.012 * (T - 1900)) * Math.pow(0.9 / Math.max(rho, 0.05), 0.8);
        const kwh = kgSi * kwhPerKg;

        const cost = sand.cost + kgC * carbon.cost + kwh * 0.06 + kgSi * 0.4;
        const co2 = kwh * 0.4 + kgC * 3.67 * carbon.co2;

        return {
            kgSand: kgSand, kgSilica: kgSilica, kgC: kgC, kgSi: kgSi, rho: rho, etaC: etaC, etaT: etaT, lossSiO: lossSiO, ppm: ppm, purity: purity,
            kwh: kwh, kwhPerKg: kwhPerKg, cost: cost, co2: co2, T: T
        };
    }


    /* ------------------------------------------------
       3. PURIFICATION: SIEMENS PROCESS
    ------------------------------------------------ */

    function purify(mg, o) {

        const n = o.stages;
        const T = o.rodT;
        const rate = o.rate;                                // mm per hour of rod radius growth

        // Per stage of distillation of trichlorosilane, metals leave easily, boron and phosphorus barely.
        const metalFloor = 0.05;
        const dopantFloor = 0.02;

        // A heavily loaded feed overwhelms each stage, so it removes less.
        const load = mg.ppm.fe + mg.ppm.al + mg.ppm.ti + mg.ppm.ca;
        const fMetal = 60 / (1 + load / 1e4);
        const fDop = 10 / (1 + load / 4e4);

        const ppb = {
            fe: Math.max(mg.ppm.fe * 1000 / Math.pow(fMetal, n), metalFloor),
            al: Math.max(mg.ppm.al * 1000 / Math.pow(fMetal, n), metalFloor),
            ti: Math.max(mg.ppm.ti * 1000 / Math.pow(fMetal, n), metalFloor),
            ca: Math.max(mg.ppm.ca * 1000 / Math.pow(fMetal, n), metalFloor),
            b: Math.max(mg.ppm.b * 1000 / Math.pow(fDop, n), dopantFloor),
            p: Math.max(mg.ppm.p * 1000 / Math.pow(fDop, n), dopantFloor)
        };

        const q = Math.exp(-Math.pow((T - 1080) / 40, 2)) * Math.exp(-Math.pow(Math.max(0, rate - 0.9) / 0.5, 2));

        // Rough deposits (popcorn) trap more metal on the rods.
        const dirt = 1 + 1.5 * (1 - q);

        ppb.fe *= dirt;
        ppb.al *= dirt;

        const total = ppb.fe + ppb.al + ppb.ti + ppb.ca + ppb.b + ppb.p;
        const nines = -Math.log10(total * 1e-9);

        const kgPoly = mg.kgSi * 0.75 * (0.85 + 0.15 * q);
        const kwhPerKg = 45 + 30 / Math.max(rate, 0.1) + 8 * n;
        const kwh = kgPoly * kwhPerKg;
        const hours = 70 / rate;
        const cost = mg.cost * (mg.kgSi > 0 ? 1 : 0) + kgPoly * (4 + 1.2 * n) + kwh * 0.06;

        return {
            kgPoly: kgPoly, ppb: ppb, total: total, nines: nines, q: q, kwh: kwh, kwhPerKg: kwhPerKg, hours: hours, cost: cost, co2: mg.co2 + kwh * 0.4,
            bAtoms: ppb.b * 5e13, pAtoms: ppb.p * 5e13
        };
    }


    /* ------------------------------------------------
       4. CRYSTAL GROWTH: CZOCHRALSKI
    ------------------------------------------------ */

    const SIZES = {

        150: { name: "150 mm (6 inch)", d: 150, charge: 120, G: 3.6, vmax: 1.2, thick: 675, kw: 35, crucible: 300, node: 350 },
        200: { name: "200 mm (8 inch)", d: 200, charge: 150, G: 3.2, vmax: 1.0, thick: 725, kw: 60, crucible: 800, node: 90 },
        300: { name: "300 mm (12 inch)", d: 300, charge: 300, G: 2.8, vmax: 0.8, thick: 775, kw: 120, crucible: 4000, node: 7 }
    };

    const HOTZONES = {

        std: { name: "Standard hot zone", blurb: "The common furnace insulation and heat shield.", gMult: 1, cost: 1 },
        adv: { name: "Advanced hot zone (shaped shield)", blurb: "A shield that steepens the temperature gradient so you can pull faster and still stay defect-free. Costs more.", gMult: 1.25, cost: 1.5 }
    };

    // Mobility (cm2/Vs) of electrons and holes in silicon at a dopant density N.
    function mobility(type, N) {

        if (type === "n") { return 90 + 1250 / (1 + Math.pow(N / 8.5e16, 0.72)); }

        return 50 + 420 / (1 + Math.pow(N / 1.6e17, 0.7));
    }

    function resistivity(type, N) { return 1 / (Q * mobility(type, Math.max(N, 1e10)) * Math.max(N, 1e10)); }

    function dopantFor(type, rho) {

        let lo = 1e10;
        let hi = 1e21;

        for (let i = 0; i < 80; i++) {

            const mid = Math.sqrt(lo * hi);

            if (resistivity(type, mid) > rho) { lo = mid; } else { hi = mid; }
        }

        return Math.sqrt(lo * hi);
    }

    function grow(poly, o) {

        const size = SIZES[o.size] || SIZES[200];
        const hz = HOTZONES[o.hotzone] || HOTZONES.std;

        const v = o.pull;
        const vcrit = 0.13 * size.G * hz.gMult;
        const x = v / vcrit;
        const lnx = Math.log(x);

        // The ratio of pull speed to temperature gradient decides which point defect wins.
        const dCr = 0.01 + 1.5 * Math.pow(Math.max(0, lnx - 0.08), 1.5) + 2.5 * Math.pow(Math.max(0, -lnx - 0.08), 1.5);
        const regime = lnx > 0.08 ? "vacancy" : lnx < -0.08 ? "interstitial" : "perfect";

        const oxygen = 6 + 10 * Math.sqrt(Math.max(o.crucibleRot, 0) / 10);

        // Oxygen gets in from the crucible: a little helps trap metals, a lot makes precipitates.
        const getter = oxygen < 12 ? 1 + (12 - oxygen) * 0.15 : 1;
        const dOx = oxygen > 17 ? 0.05 * (oxygen - 17) : 0;

        // Dislocations when pulling too fast for the diameter.
        const fy = Math.exp(-Math.pow(v / size.vmax, 4)) * (0.6 + 0.4 * poly.q);

        // Doping and how evenly it spreads along the ingot.
        const type = o.dopant === "n" ? "n" : "p";
        const kSeg = type === "p" ? 0.8 : 0.35;
        const nTarget = dopantFor(type, o.rho);
        const bg = poly.bAtoms - poly.pAtoms;
        const bgNet = type === "p" ? bg : -bg;                                          // background in the wanted direction
        const nAdded = nTarget - bgNet;
        const bgError = Math.abs(bg) / nTarget;

        const usable = nAdded > 0 && bgError < 0.3 ? 1 - Math.pow(1.25, 1 / (kSeg - 1)) : 0;

        const rhoActual = resistivity(type, Math.max(nTarget, 1e10));

        const runs = Math.max(1, Math.ceil(poly.kgPoly / size.charge));
        const kgIn = poly.kgPoly;

        const kgCrystal = kgIn * 0.88 * fy;
        const kgUsable = kgCrystal * usable;

        const area = Math.PI * Math.pow(size.d / 20, 2);                                // cm2
        const lengthCm = kgCrystal * 1000 / (2.33 * area);
        const usableCm = kgUsable * 1000 / (2.33 * area);

        const hours = lengthCm * 10 / v / 60 + runs * 12;                                // pull time plus melt-down and cool-down
        const kwh = hours * size.kw * (hz.cost > 1 ? 1.05 : 1);
        const cost = poly.cost + kwh * 0.06 + runs * (size.crucible + 400) + hours * 18 * (size.d / 200) + kgIn * 2 * hz.cost;

        return {
            size: size, vcrit: vcrit, x: x, regime: regime, dCr: dCr, oxygen: oxygen, getter: getter, dOx: dOx, fy: fy,
            type: type, nTarget: nTarget, nAdded: nAdded, bgError: bgError, usable: usable, rho: rhoActual, kSeg: kSeg, bgOk: nAdded > 0 && bgError < 0.3,
            runs: runs, kgIn: kgIn, kgCrystal: kgCrystal, kgUsable: kgUsable, lengthCm: lengthCm, usableCm: usableCm, hours: hours, kwh: kwh, cost: cost,
            co2: poly.co2 + kwh * 0.4, poly: poly, vmax: size.vmax
        };
    }


    /* ------------------------------------------------
       5. WAFERING
    ------------------------------------------------ */

    const WIRES = {

        100: { name: "100 µm wire", wire: 100, kerf: 120, brk: 0.05, cost: 1.3 },
        140: { name: "140 µm wire", wire: 140, kerf: 160, brk: 0.025, cost: 1.0 },
        180: { name: "180 µm wire", wire: 180, kerf: 200, brk: 0.015, cost: 0.9 }
    };

    function wafering(cr, o) {

        const wire = WIRES[o.wire] || WIRES[140];
        const size = cr.size;

        const t = o.thick;
        const polish = o.polish;
        const lap = 40;

        const pitch = t + polish + lap + wire.kerf;                                        // um of crystal per wafer

        const cropped = cr.usableCm * 10 * 1000 * 0.94;                                     // um after cutting off the ends
        const sliced = Math.floor(cropped / pitch);

        const tBase = size.thick;
        const thin = Math.max(0, (0.85 * tBase - t) / (0.3 * tBase));
        const brk = clamp(wire.brk + 0.02 + 0.2 * thin * thin, 0, 0.9);

        const wafers = Math.floor(sliced * (1 - brk));

        // Flatness and particles left by polishing.
        const flat = 600 / (1 + polish / 10);
        const kerfLoss = wire.kerf / pitch;
        const dSurf = 0.01 + 0.04 * Math.exp(-polish / 25);

        const kwh = wafers * 1.2 + cr.kgUsable * 2;
        const cost = cr.cost + sliced * (1.2 * wire.cost + 0.8) + wafers * (6 + polish * 0.1) + kwh * 0.06;

        return {
            wire: wire, t: t, polish: polish, pitch: pitch, sliced: sliced, brk: brk, wafers: wafers, flat: flat, kerfLoss: kerfLoss, dSurf: dSurf,
            kwh: cr.kwh + kwh, cost: cost, costPerWafer: wafers > 0 ? cost / wafers : 0, co2: cr.co2 + kwh * 0.4, cr: cr, d: size.d
        };
    }


    /* ------------------------------------------------
       6. THE FAB: TRANSISTOR PROCESS
    ------------------------------------------------ */

    // lg: gate length (nm). vdd: supply (V). eot: target equivalent oxide thickness (nm). vt: target threshold (V).
    // dens: million transistors per mm2. cost: dollars per processed 300 mm wafer. kwh: per wafer. masks: lithography layers.
    const NODES = {

        1000: { nm: 1000, name: "1 µm", lg: 1000, vdd: 5, eot: 20, vt: 0.8, dens: 0.02, cost: 250, kwh: 120, masks: 12, wire: 0.05, minSize: 150 },
        350: { nm: 350, name: "350 nm", lg: 300, vdd: 3.3, eot: 7, vt: 0.6, dens: 0.15, cost: 450, kwh: 220, masks: 20, wire: 0.1, minSize: 150 },
        180: { nm: 180, name: "180 nm", lg: 130, vdd: 1.8, eot: 3.5, vt: 0.45, dens: 0.5, cost: 700, kwh: 330, masks: 28, wire: 0.2, minSize: 200 },
        90: { nm: 90, name: "90 nm", lg: 60, vdd: 1.2, eot: 2, vt: 0.35, dens: 2.5, cost: 1200, kwh: 480, masks: 35, wire: 0.35, minSize: 200 },
        45: { nm: 45, name: "45 nm", lg: 35, vdd: 1.0, eot: 1.2, vt: 0.3, dens: 9, cost: 2300, kwh: 700, masks: 45, wire: 0.5, minSize: 300 },
        22: { nm: 22, name: "22 nm", lg: 20, vdd: 0.9, eot: 0.9, vt: 0.28, dens: 28, cost: 4200, kwh: 950, masks: 55, wire: 0.6, minSize: 300 },
        7: { nm: 7, name: "7 nm", lg: 15, vdd: 0.75, eot: 0.8, vt: 0.25, dens: 90, cost: 9500, kwh: 1500, masks: 70, wire: 0.7, minSize: 300 }
    };

    // The smallest node each exposure tool can print, and its cost per mask layer per wafer.
    const TOOLS = {

        iline: { res: 350, lambda: 365, name: "i-line stepper (365 nm)", nodes: [1000, 350], cost: 8, note: "The old workhorse." },
        krf: { res: 130, lambda: 248, name: "KrF scanner (248 nm)", nodes: [1000, 350, 180], cost: 20, note: "Deep ultraviolet." },
        arf: { res: 83, lambda: 193, name: "ArF dry scanner (193 nm)", nodes: [180, 90], cost: 40, note: "Shorter wavelength, bigger lens." },
        arfi: { res: 43, lambda: 193, name: "ArF immersion (193 nm, water)", nodes: [90, 45], cost: 70, note: "Water under the lens bends the light more." },
        arfdp: { res: 21, lambda: 193, name: "Immersion with double patterning", nodes: [45, 22], cost: 150, note: "Each critical layer is printed twice." },
        euv: { res: 18, lambda: 13.5, name: "EUV scanner (13.5 nm)", nodes: [22, 7], cost: 200, note: "Mirrors in vacuum. The most expensive tool." }
    };

    const CLEANROOMS = {

        iso7: { name: "ISO 7 (a basic cleanroom)", d0: 0.8, mult: 1.0 },
        iso6: { name: "ISO 6", d0: 0.4, mult: 1.15 },
        iso5: { name: "ISO 5", d0: 0.15, mult: 1.4 },
        iso4: { name: "ISO 4", d0: 0.06, mult: 1.8 },
        iso3: { name: "ISO 3 (a leading-edge fab)", d0: 0.025, mult: 2.5 }
    };

    const ILD = {

        sio2: { name: "Silicon dioxide (k = 3.9)", k: 3.9, cost: 0 },
        fsg: { name: "Fluorinated glass (k = 3.5)", k: 3.5, cost: 30 },
        sicoh: { name: "Porous carbon-doped oxide (k = 2.7)", k: 2.7, cost: 110 },
        air: { name: "Air gaps (k = 2.2)", k: 2.2, cost: 250 }
    };

    // Dry oxidation by the Deal-Grove model. T in C, minutes. Returns nanometres.
    function oxideNm(T, minutes) {

        const kT = KB_EV * (T + 273.15);
        const B = 7.72e2 * Math.exp(-1.23 / kT);                                // um2/h
        const BA = 6.23e6 * Math.exp(-2.0 / kT);                                // um/h
        const A = B / BA;
        const t = minutes / 60;

        const x = (-A + Math.sqrt(A * A + 4 * B * t)) / 2;                      // um

        return x * 1000;
    }

    // As diffusion in silicon, cm2/s.
    function diffusivity(T) { return 22.9 * Math.exp(-4.1 / (KB_EV * (T + 273.15))); }

    function processFab(o) {

        const node = NODES[o.node] || NODES[90];

        // Gate stack.
        let eot;
        let tPhys;

        if (o.dielectric === "hfo2") {

            tPhys = o.hfNm + 0.5;
            eot = 0.5 + o.hfNm * 3.9 / 25;

        } else {

            tPhys = oxideNm(o.oxT, o.oxMin);
            eot = tPhys;
        }

        const cox = 3.9 * 8.854e-14 / (eot * 1e-7);                              // F/cm2

        // Source and drain.
        const rp = 0.75 * o.implE;                                              // nm
        const drp = 0.35 * rp + 2;
        const cp0 = o.implDose / (Math.sqrt(2 * Math.PI) * drp * 1e-7);
        const D = diffusivity(o.annT);
        const sigma2 = drp * drp + 2 * D * o.annSec * 1e14;
        const sigma = Math.sqrt(sigma2);
        const cp = o.implDose / (Math.sqrt(2 * Math.PI) * sigma * 1e-7);
        const nb = 5e17;
        const xj = cp > nb ? rp + sigma * Math.sqrt(2 * Math.log(cp / nb)) : rp;

        const cmax = 2e20 * clamp((o.annT - 750) / 300, 0.15, 1.2);
        const tau = 3000 * Math.exp(-(o.annT - 800) / 30);
        const fAct = 1 - Math.exp(-o.annSec / tau);
        const cAct = Math.min(cp, cmax) * fAct;

        const xjCm = xj * 1e-7;
        const rsh = cAct > 0 ? 1 / (Q * 70 * cAct * xjCm) : 1e5;

        // Threshold from the channel implant.
        const dVt = Q * o.chDose / cox;
        const vt0 = 0.1 + dVt;

        // Short-channel effects: deep junctions and thick oxides spoil gate control.
        const lam = Math.sqrt(3 * Math.max(eot, 0.5) * Math.max(xj, 5) / 3);
        const dibl = 0.8 * node.vdd * Math.exp(-node.lg / (2 * lam));
        const vtEff = vt0 - dibl;

        const ss = 70 + 400 * dibl;                                              // mV/decade

        // Drive current in microamps per micrometre of width.
        const mu = 200 * (o.dielectric === "hfo2" ? 0.85 : 1);
        const ec = 2 * 1e7 / mu;
        const vov = Math.max(node.vdd - vtEff, 0.02);
        const ionPerCm = cox * 1e7 * vov * vov / (vov + ec * node.lg * 1e-7);            // A per cm of width
        let ion = ionPerCm / 1e4 * 1e6;                                                // uA/um

        const rsd = 0.15 * rsh + 100;                                                // ohm um
        ion = ion / (1 + ion * 1e-6 * rsd / vov);

        // Leakage.
        const ioffPerUm = 0.1 * Math.pow(10, -Math.max(vtEff, -0.3) / (ss / 1000));       // uA/um
        const jg0 = 1e6 * Math.exp(-tPhys / 0.16);                                   // A/cm2
        const jg = o.dielectric === "hfo2" ? jg0 * 1e-4 * Math.exp(-(o.hfNm - 1) * 0.5) + 1e-6 : jg0;
        const w = 4 * node.lg * 1e-3;                                                // um
        const gateLeak = jg * (w * 1e-4) * (node.lg * 1e-7);                          // A per gate (area in cm2)

        // Delay of a gate driving three more, then the wires.
        const cg = cox * (w * 1e-4) * (node.lg * 1e-7);                              // F
        const cLoad = cg * 3 * 2;
        const ionA = ion * 1e-6 * w;
        const tauGate = cLoad * node.vdd / Math.max(ionA, 1e-12);                    // s

        return {
            node: node, eot: eot, tPhys: tPhys, cox: cox, rp: rp, drp: drp, cp: cp, cpMax: cmax, cAct: cAct, fAct: fAct, xj: xj, rsh: rsh, sigma: sigma, D: D,
            vt: vtEff, vt0: vt0, dibl: dibl, ss: ss, ion: ion, ioff: ioffPerUm * 1000, jg: jg, gateLeak: gateLeak, cg: cg, tauGate: tauGate, w: w, vov: vov, rsd: rsd
        };
    }

    // Concentration profile (cm-3) against depth for the chart.
    function implantProfile(f, o) {

        const depth = [];
        const asImp = [];
        const annealed = [];

        const nmax = Math.max(120, f.xj * 1.8);

        for (let k = 0; k <= 80; k++) {

            const z = nmax * k / 80;

            depth.push(z);

            const g1 = Math.exp(-Math.pow(z - f.rp, 2) / (2 * f.drp * f.drp));
            const g2 = Math.exp(-Math.pow(z - f.rp, 2) / (2 * f.sigma * f.sigma));

            asImp.push(Math.max(o.implDose / (Math.sqrt(2 * Math.PI) * f.drp * 1e-7) * g1, 1e14));
            annealed.push(Math.max(o.implDose / (Math.sqrt(2 * Math.PI) * f.sigma * 1e-7) * g2, 1e14));
        }

        return { z: depth, asImp: asImp, annealed: annealed };
    }


    /* ------------------------------------------------
       7. THE PRODUCT AND ITS YIELD
    ------------------------------------------------ */

    const PRODUCTS = {

        sensor: { name: "Sensor interface chip", blurb: "A small, slow analog and logic chip for a sensor. It sells for pennies.", n: 3e5, fGHz: 0.02, pMax: 0.05, price: 0.3 },
        mcu: { name: "Microcontroller", blurb: "The tiny computer inside a toy, thermostat or car part.", n: 5e6, fGHz: 0.1, pMax: 0.5, price: 1.5 },
        laptop: { name: "Laptop processor", blurb: "A big, fast chip. Needs a lot of transistors and a fast clock.", n: 2e9, fGHz: 2.5, pMax: 35, price: 180 },
        phone: { name: "Smartphone processor", blurb: "Billions of transistors under a tight battery power limit.", n: 6e9, fGHz: 2.0, pMax: 5, price: 120 }
    };

    const RETICLE = 800;                                                            // mm2, the biggest die a scanner can print

    function metalsNeeded(n) { return clamp(Math.round(2 + 1.1 * Math.log10(Math.max(n, 1e5) / 1e5)), 3, 14); }

    // Dies that fit on a round wafer, after 3 mm of unused edge.
    function diesPerWafer(dWafer, area) {

        const d = dWafer - 6;
        const a = area;

        return Math.max(0, Math.floor(Math.PI * d * d / (4 * a) - Math.PI * d / Math.sqrt(2 * a)));
    }

    function chip(fab, wf, o) {

        const prod = PRODUCTS[o.product] || PRODUCTS.mcu;
        const node = fab.node;
        const cr = wf.cr;
        const clean = CLEANROOMS[o.clean] || CLEANROOMS.iso5;
        const ild = ILD[o.ild] || ILD.sio2;
        const lowK = ild.k;

        const sizeOk = cr.size.d >= node.minSize;
        const tool = TOOLS[o.tool] || TOOLS.arf;
        const toolOk = tool.nodes.indexOf(node.nm) >= 0;

        const mReq = metalsNeeded(prod.n);
        const mHave = o.metals;
        const congest = mHave < mReq ? 1 + 0.35 * (mReq - mHave) : 1;

        const areaMm2 = prod.n / (node.dens * 1e6) * 1.25 * congest;
        const dies = diesPerWafer(cr.size.d, areaMm2);
        const reticleOk = areaMm2 <= RETICLE;

        // Defect density in killer defects per cm2, from every source.
        const nodeScale = Math.pow(1000 / node.nm, 0.45);
        const dClean = clean.d0 * nodeScale;
        const dCrystal = (cr.dCr + cr.dOx) * Math.pow(1000 / node.nm, 0.2);
        const feEq = cr.poly.ppb.fe + 0.5 * cr.poly.ppb.al + 0.7 * cr.poly.ppb.ti;
        const dMetal = 0.12 * feEq * cr.getter * Math.pow(1000 / node.nm, 0.3);
        const dSurface = wf.dSurf * nodeScale;
        const d0 = dClean + dCrystal + dMetal + dSurface;

        // Focus: the wafer must be flatter than the depth of focus.
        const dof = { iline: 800, krf: 500, arf: 300, arfi: 150, arfdp: 120, euv: 100 }[o.tool] || 300;
        const flatFactor = clamp(1 - 0.5 * Math.max(0, wf.flat / dof - 1), 0.1, 1);

        const aCm2 = areaMm2 / 100;
        const alpha = 2;

        // Wafer map with the edge of the wafer dirtier than the middle.
        const grid = dieGrid(cr.size.d, areaMm2);

        let ySum = 0;

        grid.forEach(function (d) {

            const edge = 1 + 1.6 * Math.pow(d.r / (cr.size.d / 2), 4);

            d.dLocal = d0 * edge;
            d.yield = Math.pow(1 + aCm2 * d.dLocal / alpha, -alpha);
            ySum += d.yield;
        });

        const yDefect = grid.length ? ySum / grid.length : 0;

        // Performance, scaled up from the single transistor to the chip.
        const wireBase = node.wire * (lowK / 3.9) * (o.metal === "al" ? 1.5 : 1);
        const wireShare = clamp(wireBase * (mHave > mReq + 1 ? 0.9 : 1) * congest, 0.02, 0.85);

        const tauLogic = fab.tauGate / (1 - wireShare);
        const depth = 25;
        const fHz = 1 / (depth * tauLogic * 1.6);

        const cPerTr = fab.cg * 2 * (1 + wireShare);
        const alphaAct = 0.05 * Math.pow(1e6 / prod.n, 0.25);

        // The chip runs at the speed it is sold at, not flat out.
        const fOp = Math.min(fHz, prod.fGHz * 1e9);
        const pDyn = alphaAct * prod.n * cPerTr * node.vdd * node.vdd * fOp;
        const pLeak = prod.n * (fab.ioff * 1e-9 * fab.w * node.vdd * 0.5 + fab.gateLeak * node.vdd);

        return {
            prod: prod, node: node, areaMm2: areaMm2, dies: dies, reticleOk: reticleOk, sizeOk: sizeOk, toolOk: toolOk, tool: tool, mReq: mReq, mHave: mHave, congest: congest,
            d0: d0, parts: { clean: dClean, crystal: dCrystal, metal: dMetal, surface: dSurface }, yDefect: yDefect, flatFactor: flatFactor, dof: dof, grid: grid,
            fHz: fHz, fGHz: fHz / 1e9, fOp: fOp, pDyn: pDyn, pLeak: pLeak, pTotal: pDyn + pLeak, wireShare: wireShare, tauLogic: tauLogic, clean: clean, ild: ild
        };
    }

    // Dies laid out on the wafer, centre of each in millimetres from the wafer centre.
    function dieGrid(dWafer, area) {

        const side = Math.sqrt(area);
        const out = [];
        const R = dWafer / 2 - 3;

        const nx = Math.ceil(dWafer / side) + 1;

        for (let j = -nx; j <= nx; j++) {

            for (let i = -nx; i <= nx; i++) {

                const x0 = i * side - side / 2;
                const y0 = j * side - side / 2;

                const corners = [[x0, y0], [x0 + side, y0], [x0, y0 + side], [x0 + side, y0 + side]];

                if (corners.every(function (c) { return Math.hypot(c[0], c[1]) <= R; })) {

                    out.push({ i: i, j: j, x: i * side, y: j * side, r: Math.hypot(i * side, j * side), side: side });
                }
            }
        }

        return out;
    }

    // Speed and leakage sorting of the dies that have no killer defect.
    function binning(fab, ch, rand, samples) {

        const sigmaVt = 0.02 * Math.sqrt(45 / fab.node.lg) * Math.sqrt(2 / Math.max(fab.eot, 0.5)) * 0.8 + 0.008;
        const target = ch.prod.fGHz * 1e9;
        const bins = { fast: 0, pass: 0, slow: 0, fail: 0 };

        // The process window: oxide thickness and junction depth have to land near what the node needs.
        const reasons = [];
        const eotDev = Math.abs(fab.eot / fab.node.eot - 1);
        const eotF = Math.exp(-Math.pow(Math.max(0, eotDev - 0.25) / 0.35, 2));

        if (eotF < 0.9) { reasons.push("The gate stack is " + (fab.eot > fab.node.eot ? "much thicker" : "much thinner") + " than the " + fab.node.name + " node wants (" + fab.eot.toFixed(1) + " nm against about " + fab.node.eot + " nm)."); }

        const xjRatio = fab.xj / fab.node.lg;
        const xjF = xjRatio <= 0.6 ? 1 : Math.exp(-Math.pow((xjRatio - 0.6) / 0.5, 2));

        if (xjF < 0.9) { reasons.push("The source and drain are too deep (" + fab.xj.toFixed(0) + " nm for a " + fab.node.lg + " nm gate): the channel is shorted through the silicon."); }

        const wnd = eotF * xjF;

        const ss = fab.ss / 1000;
        const leakLimit = ch.prod.pMax * 0.35;

        for (let s = 0; s < samples; s++) {

            const dv = gauss(rand) * sigmaVt;
            const f = ch.fHz * Math.pow(Math.max(0.05, (fab.node.vdd - (fab.vt + dv))) / Math.max(0.05, (fab.node.vdd - fab.vt)), 1.3);
            const leak = ch.pLeak * Math.pow(10, -dv / ss);

            let bin;

            if (Math.abs(fab.vt + dv - fab.node.vt) > 0.15) { bin = "fail"; }
            else if (leak > leakLimit) { bin = "fail"; }
            else if (f >= 1.1 * target) { bin = "fast"; }
            else if (f >= target) { bin = "pass"; }
            else if (f >= 0.8 * target) { bin = "slow"; }
            else { bin = "fail"; }

            bins[bin] += 1;
        }

        Object.keys(bins).forEach(function (k) { bins[k] /= samples; });

        // Dies outside the process window fail whatever their speed.
        bins.fast *= wnd;
        bins.pass *= wnd;
        bins.slow *= wnd;
        bins.fail = 1 - bins.fast - bins.pass - bins.slow;

        const vtOff = Math.abs(fab.vt - fab.node.vt);

        if (vtOff > 0.1) { reasons.push("The threshold voltage is " + fab.vt.toFixed(2) + " V where the " + fab.node.name + " node wants about " + fab.node.vt + " V. Adjust the channel implant."); }

        return { bins: bins, sigmaVt: sigmaVt, window: wnd, reasons: reasons };
    }

    // One simulated wafer: which dies are good, slow or dead.
    function waferMap(ch, bins, seed) {

        const rand = rng(seed);
        // A few dirty patches on the wafer.
        const blobs = [];
        const nb = 1 + Math.floor(rand() * 3);

        const dW = ch.grid.reduce(function (m, d) { return Math.max(m, Math.hypot(d.x, d.y)); }, 1);

        for (let k = 0; k < nb; k++) {

            const a = rand() * 6.28;
            const rr = rand() * 0.7 * dW;

            blobs.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, r: (0.12 + 0.15 * rand()) * dW });
        }

        return ch.grid.map(function (d) {

            let py = d.yield;

            blobs.forEach(function (b) { if (Math.hypot(d.x - b.x, d.y - b.y) < b.r) { py *= 0.35; } });

            let state;

            if (rand() > py) { state = "dead"; }
            else {

                const u = rand();

                state = u < bins.fast ? "fast" : u < bins.fast + bins.pass ? "pass" : u < bins.fast + bins.pass + bins.slow ? "slow" : "fail";
            }

            return { x: d.x, y: d.y, side: d.side, state: state };
        });
    }


    /* ------------------------------------------------
       8. PACKAGING AND FINAL TEST
    ------------------------------------------------ */

    const PACKAGES = {

        qfn: { name: "Plastic leadframe (QFN)", blurb: "Wire bonds and a plastic body. Cheap and simple, but it sheds heat poorly.", base: 0.05, perMm2: 0.0006, theta: 40, yield: 0.995 },
        bga: { name: "Ball grid array (BGA)", blurb: "A small circuit board under the chip with a grid of solder balls. Handles more pins.", base: 0.35, perMm2: 0.002, theta: 22, yield: 0.99 },
        flip: { name: "Flip-chip with heat spreader", blurb: "The chip is flipped onto the substrate and a metal lid carries heat away. The best for hot chips.", base: 1.2, perMm2: 0.006, theta: 10, yield: 0.98 },
        wlcsp: { name: "Wafer-level package", blurb: "Solder balls go on the wafer before it is cut. Tiny and cheap, but only for small, cool chips.", base: 0.08, perMm2: 0.001, theta: 60, yield: 0.985 }
    };

    function finish(wf, fab, ch, bins, o) {

        const pkg = PACKAGES[o.pkg] || PACKAGES.qfn;
        const prod = ch.prod;

        const thetaTotal = pkg.theta;
        const tj = 25 + ch.pTotal * thetaTotal;
        const tjMax = 105;

        // A chip that would get too hot is slowed down to stay inside its limit.
        const throttle = tj > tjMax ? clamp((tjMax - 25) / Math.max(ch.pTotal * thetaTotal, 1e-9), 0.05, 1) : 1;
        const fFinal = ch.fGHz * throttle;

        const feasible = fab.node && ch.sizeOk && ch.toolOk && ch.reticleOk;

        const dies = ch.dies;
        const yDef = ch.yDefect * ch.flatFactor;
        const yParam = bins.bins.fast + bins.bins.pass;

        const goodDies = dies * wf.wafers * yDef * yParam;
        const slowDies = dies * wf.wafers * yDef * bins.bins.slow;

        const yPkg = pkg.yield;
        const yFinal = 0.98;

        const goodChips = feasible ? Math.floor(goodDies * yPkg * yFinal) : 0;

        // Cost: sand to wafer, the fab, then packaging and test.
        const waferFabCost = fab.node.cost * Math.pow(wf.d / 300, 1.5) * (ch.clean.mult) + ch.tool.cost * fab.node.masks * 0.5 +
            (o.dielectric === "hfo2" ? 150 : 0) + ch.ild.cost + (o.metal === "cu" ? 80 : 0) + Math.max(0, ch.mHave - 4) * 60;

        const fabTotal = waferFabCost * wf.wafers;
        const probeTotal = wf.wafers * 18;
        const pkgPer = pkg.base + pkg.perMm2 * ch.areaMm2;
        const pkgTotal = goodDies * pkgPer;
        const testTotal = goodDies * yPkg * (0.04 + 0.01 * Math.log10(prod.n / 1e5));

        const total = wf.cost + fabTotal + probeTotal + pkgTotal + testTotal;
        const costPerChip = goodChips > 0 ? total / goodChips : Infinity;

        const fabKwh = fab.node.kwh * Math.pow(wf.d / 300, 1.5) * wf.wafers;
        const kwh = wf.kwh + fabKwh + goodDies * 0.01;
        const co2 = wf.co2 + fabKwh * 0.4;

        return {
            pkg: pkg, tj: tj, throttle: throttle, fFinal: fFinal, meetsF: fFinal >= prod.fGHz, meetsP: ch.pTotal <= prod.pMax, feasible: feasible,
            goodDies: goodDies, slowDies: slowDies, goodChips: goodChips, yDef: yDef, yParam: yParam, yPkg: yPkg, yFinal: yFinal, yTotal: ch.dies * wf.wafers > 0 ? goodChips / (ch.dies * wf.wafers) : 0,
            costs: { upstream: wf.cost, fab: fabTotal, probe: probeTotal, pkg: pkgTotal, test: testTotal }, total: total, costPerChip: costPerChip, waferFabCost: waferFabCost,
            kwh: kwh, co2: co2, kwhPerChip: goodChips > 0 ? kwh / goodChips : Infinity, co2PerChip: goodChips > 0 ? co2 / goodChips : Infinity,
            revenue: goodChips * prod.price, bins: bins.bins
        };
    }


    /* ------------------------------------------------
       THE WHOLE CHAIN
    ------------------------------------------------ */

    const DEFAULTS = {

        sand: { site: "sandstone", kg: 1000, removed: [], treat: { magnet: 1, wash: 1, flotation: 0, leach: 0 } },
        furnace: { carbon: "petcoke", carbonPer100: 42, temp: 1950 },
        poly: { stages: 5, rodT: 1080, rate: 0.7 },
        crystal: { size: 200, hotzone: "std", pull: 0.4, crucibleRot: 8, dopant: "p", rho: 10 },
        wafer: { wire: 140, thick: 725, polish: 40 },
        fab: { node: 90, tool: "arf", dielectric: "sio2", oxT: 900, oxMin: 20, hfNm: 2.5, implDose: 3e15, implE: 30, annT: 1000, annSec: 10, chDose: 2.5e12, metals: 5, metal: "cu", ild: "fsg", clean: "iso5" },
        chip: { product: "mcu" },
        pkg: { pkg: "qfn" }
    };

    function sanitize(raw) {

        raw = raw && typeof raw === "object" ? raw : {};

        const d = DEFAULTS;
        const sa = raw.sand || {};
        const fu = raw.furnace || {};
        const po = raw.poly || {};
        const cr = raw.crystal || {};
        const wa = raw.wafer || {};
        const fa = raw.fab || {};
        const ch = raw.chip || {};
        const pk = raw.pkg || {};

        const treat = {};

        Object.keys(TREATMENTS).forEach(function (k) { treat[k] = sa.treat && sa.treat[k] ? 1 : 0; });

        const removed = [];

        (Array.isArray(sa.removed) ? sa.removed : []).slice(0, N_GRAINS).forEach(function (id) {

            const n = Math.round(Number(id));

            if (isFinite(n) && n >= 0 && n < N_GRAINS && removed.indexOf(n) < 0) { removed.push(n); }
        });

        const size = pick(String(cr.size), SIZES, "200");

        return {
            seed: Math.round(num(raw.seed, 1, 4294967295, 1)),
            sand: { site: pick(sa.site, SITES, d.sand.site), kg: Math.round(num(sa.kg, 50, 20000, d.sand.kg)), removed: removed, treat: treat },
            furnace: { carbon: pick(fu.carbon, CARBON, d.furnace.carbon), carbonPer100: num(fu.carbonPer100, 25, 60, d.furnace.carbonPer100), temp: Math.round(num(fu.temp, 1700, 2300, d.furnace.temp)) },
            poly: { stages: Math.round(num(po.stages, 1, 10, d.poly.stages)), rodT: Math.round(num(po.rodT, 950, 1200, d.poly.rodT)), rate: num(po.rate, 0.2, 2, d.poly.rate) },
            crystal: {
                size: Number(size), hotzone: pick(cr.hotzone, HOTZONES, d.crystal.hotzone), pull: num(cr.pull, 0.1, 1.6, d.crystal.pull), crucibleRot: num(cr.crucibleRot, 0, 16, d.crystal.crucibleRot),
                dopant: cr.dopant === "n" ? "n" : "p", rho: num(cr.rho, 0.01, 100, d.crystal.rho)
            },
            wafer: { wire: Number(pick(String(wa.wire), WIRES, "140")), thick: Math.round(num(wa.thick, 300, 1100, SIZES[size].thick)), polish: Math.round(num(wa.polish, 10, 80, d.wafer.polish)) },
            fab: {
                node: Number(pick(String(fa.node), NODES, "90")), tool: pick(fa.tool, TOOLS, d.fab.tool), dielectric: fa.dielectric === "hfo2" ? "hfo2" : "sio2",
                oxT: Math.round(num(fa.oxT, 700, 1100, d.fab.oxT)), oxMin: Math.round(num(fa.oxMin, 1, 600, d.fab.oxMin)), hfNm: num(fa.hfNm, 1, 6, d.fab.hfNm),
                implDose: num(fa.implDose, 1e14, 1e16, d.fab.implDose), implE: Math.round(num(fa.implE, 1, 100, d.fab.implE)),
                annT: Math.round(num(fa.annT, 800, 1100, d.fab.annT)), annSec: num(fa.annSec, 0.1, 3600, d.fab.annSec), chDose: num(fa.chDose, 1e11, 1e14, d.fab.chDose),
                metals: Math.round(num(fa.metals, 2, 12, d.fab.metals)), metal: fa.metal === "al" ? "al" : "cu", ild: pick(fa.ild, ILD, d.fab.ild), clean: pick(fa.clean, CLEANROOMS, d.fab.clean)
            },
            chip: { product: pick(ch.product, PRODUCTS, d.chip.product) },
            pkg: { pkg: pick(pk.pkg, PACKAGES, d.pkg.pkg) }
        };
    }

    // Run the chain, from the first choice to the finished chip.
    function runAll(raw) {

        const c = sanitize(raw);

        const grains = makeGrains(c.sand.site, c.seed);
        const sand = sandResult(c.sand.site, grains, c.sand.removed, c.sand.treat, c.sand.kg);
        const mg = furnace(sand, c.furnace);
        const poly = purify(mg, c.poly);
        const cr = grow(poly, c.crystal);
        const wf = wafering(cr, c.wafer);

        const fab = processFab(c.fab);

        const fabOpts = Object.assign({}, c.fab, c.chip);
        const ch = chip(fab, wf, fabOpts);

        const bins = binning(fab, ch, rng(c.seed * 31 + 5), 3000);

        const fin = finish(wf, fab, ch, bins, Object.assign({}, c.fab, c.pkg));

        return { c: c, grains: grains, sand: sand, mg: mg, poly: poly, cr: cr, wf: wf, fab: fab, chip: ch, bins: bins, fin: fin };
    }


    // A set of fab choices that lands on the node's targets, found by a small search. Used by the "recommended recipe" buttons.
    function recommendFab(nodeId, base) {

        const node = NODES[nodeId] || NODES[90];
        const out = Object.assign({}, base || {}, { node: node.nm });

        out.dielectric = node.nm <= 45 ? "hfo2" : "sio2";

        if (out.dielectric === "hfo2") {

            out.hfNm = clamp(Math.round((node.eot - 0.5) * 25 / 3.9 * 10) / 10, 1, 6);

        } else {

            let found = false;

            [700, 750, 800, 850, 900, 950, 1000, 1050, 1100].forEach(function (T) {

                if (found) { return; }

                for (let m = 5; m <= 240; m++) {

                    if (oxideNm(T, m) >= node.eot) { out.oxT = T; out.oxMin = m; found = true; return; }
                }
            });

            if (!found) { out.oxT = 1100; out.oxMin = 600; }
        }

        // Source and drain: a shallow, well-activated junction, about a third of the gate length deep.
        let best = null;

        [1e14, 2e14, 3e14, 1e15, 2e15, 5e15].forEach(function (dose) {

            [1, 2, 3, 5, 8, 12, 20, 30, 50].forEach(function (E) {

                [800, 900, 950, 1000, 1050, 1100].forEach(function (T) {

                    [0.1, 0.3, 1, 3, 10, 30, 100, 600].forEach(function (t) {

                        const f = processFab(Object.assign({}, out, { implDose: dose, implE: E, annT: T, annSec: t, chDose: 3e12 }));

                        const pen = Math.pow(Math.max(0, f.xj - 0.4 * node.lg) / node.lg, 2) * 10 + Math.abs(f.xj - 0.3 * node.lg) / node.lg + f.rsh / 1500 + (f.fAct < 0.85 ? 3 : 0);

                        if (!best || pen < best.pen) { best = { pen: pen, dose: dose, E: E, T: T, t: t }; }
                    });
                });
            });
        });

        out.oxT = out.oxT || 900;
        out.oxMin = out.oxMin || 20;

        out.implDose = best.dose;
        out.implE = best.E;
        out.annT = best.T;
        out.annSec = best.t;

        // Channel implant: set the threshold, allowing for the drain-induced lowering.
        let lo = 1e11;
        let hi = 1e14;

        for (let i = 0; i < 40; i++) {

            const mid = Math.sqrt(lo * hi);
            const f = processFab(Object.assign({}, out, { chDose: mid }));

            if (f.vt < node.vt) { lo = mid; } else { hi = mid; }
        }

        out.chDose = Math.sqrt(lo * hi);

        out.metals = node.nm <= 22 ? 9 : node.nm <= 90 ? 6 : 4;
        out.metal = node.nm <= 180 ? "cu" : "al";
        out.ild = node.nm <= 22 ? "sicoh" : node.nm <= 90 ? "fsg" : "sio2";

        const tool = Object.keys(TOOLS).filter(function (k) { return TOOLS[k].nodes.indexOf(node.nm) >= 0; }).sort(function (a, b) { return TOOLS[a].cost - TOOLS[b].cost; })[0];

        out.tool = tool;

        return out;
    }

    // The starting fab recipe is the recommended one for the 90 nm node.
    DEFAULTS.fab = recommendFab(90, DEFAULTS.fab);

    root.ChipLab = {

        GRAINS: GRAINS, SITES: SITES, TREATMENTS: TREATMENTS, CARBON: CARBON, SIZES: SIZES, HOTZONES: HOTZONES, WIRES: WIRES, NODES: NODES, TOOLS: TOOLS,
        CLEANROOMS: CLEANROOMS, ILD: ILD, PRODUCTS: PRODUCTS, PACKAGES: PACKAGES, DEFAULTS: DEFAULTS, N_GRAINS: N_GRAINS, RETICLE: RETICLE,
        makeGrains: makeGrains, sandResult: sandResult, furnace: furnace, purify: purify, grow: grow, wafering: wafering, processFab: processFab, chip: chip,
        binning: binning, waferMap: waferMap, recommendFab: recommendFab, finish: finish, runAll: runAll, sanitize: sanitize, oxideNm: oxideNm, implantProfile: implantProfile,
        resistivity: resistivity, dopantFor: dopantFor, metalsNeeded: metalsNeeded, diesPerWafer: diesPerWafer, rng: rng
    };

    if (typeof module !== "undefined" && module.exports) { module.exports = root.ChipLab; }

}(typeof window !== "undefined" ? window : globalThis));
