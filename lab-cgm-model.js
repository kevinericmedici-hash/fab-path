/* ========================================
   GLUCOSE SENSOR (CGM FILAMENT): CHEMISTRY AND MEASUREMENTS

   Pure functions of a fabricated sensor ("dev", from lab-neural-engine.js
   through lab-cgm-engine.js). The working electrode (W) carries a stack of
   films, listed from the electrode outwards: a permselective film, the
   enzyme, a glucose-limiting membrane and an outer hydrogel. Glucose and
   oxygen diffuse in through the outer films, the enzyme turns them into
   hydrogen peroxide (or passes electrons to a mediator) and the electrode
   counts the electrons. Interferents (acetaminophen, ascorbate, urate)
   oxidise at the same electrode. A sentinel electrode (S) with the same
   films but no enzyme sees the interferents without the glucose.

   Tests: continuity, a glucose calibration, interferents, oxygen, ten days
   of wear, a simulated day against blood glucose, and insertion.

   Needs window.SCLab (seeded random numbers). All numbers are rounded
   textbook-scale approximations for teaching, not product data.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;

    const FARADAY = 96485;
    const MGDL = 18.016;                    // mg/dL per mM of glucose

    function mm(g) { return g / MGDL; }


    /* ------------------------------------------------
       TABLES
    ------------------------------------------------ */

    // Bare metals. h2o2: how well it oxidises hydrogen peroxide. eH: the potential where that switches on (V vs Ag/AgCl).
    // med: how well it takes electrons from a mediator. rough: true area over drawn area. act: activity for interferents.
    const METAL = {

        pt: { h2o2: 1, eH: 0.35, med: 1, rough: 1.5, act: 1 },
        au: { h2o2: 0.25, eH: 0.5, med: 1, rough: 1.3, act: 0.7 },
        c: { h2o2: 0.3, eH: 0.55, med: 0.9, rough: 3, act: 0.6 },
        ti: { h2o2: 0.03, eH: 0.7, med: 0.3, rough: 1.2, act: 0.2 },
        agcl: { h2o2: 0.05, eH: 0.6, med: 0.2, rough: 1.5, act: 0.3 }
    };

    // Films. Dg, Do: diffusion coefficients of glucose and oxygen in the film (m2/s). Di: of the three interferents.
    // vUm: enzyme capacity per um of thickness (mol/m2/s). Kg, Ko: Michaelis constants (mM). half: enzyme half-life (days).
    // rej: share of each interferent held back by a thick enough film (tref: thickness for 63% of that). delam: peeling hazard per day.
    const FILM = {

        gox: { enzyme: true, med: false, vUm: 1e-4, Kg: 20, Ko: 0.2, Dg: 3e-11, Do: 3e-10, Di: { apap: 5e-11, aa: 5e-11, ua: 3e-11 }, half: 25, delam: 0.004, h2o2: 1 },
        osgox: { enzyme: true, med: true, vUm: 6e-5, Kg: 15, Ko: 0.2, Dg: 2e-11, Do: 3e-10, Di: { apap: 5e-11, aa: 5e-11, ua: 3e-11 }, half: 50, delam: 0.006, h2o2: 1 },
        mpd: { Dg: 2e-13, Do: 5e-10, Di: { apap: 1e-10, aa: 1e-10, ua: 1e-10 }, rej: { apap: 0.9, aa: 0.97, ua: 0.97 }, tref: 0.03, delam: 0.002, h2o2: 0.85 },
        nafion: { Dg: 5e-12, Do: 5e-10, Di: { apap: 1e-10, aa: 1e-10, ua: 1e-10 }, rej: { apap: 0.12, aa: 0.95, ua: 0.94 }, tref: 0.15, delam: 0.001, h2o2: 0.95 },
        pu: { Dg: 1e-12, Do: 1e-9, Di: { apap: 2e-11, aa: 3e-12, ua: 3e-12 }, delam: 0.0015, h2o2: 0.3 },
        hydrogel: { Dg: 3e-10, Do: 2e-9, Di: { apap: 3e-10, aa: 2e-10, ua: 2e-10 }, delam: 0.003, h2o2: 0.9, foul: 0.3, fbr: 0.55 }
    };

    const INTERFERENTS = {

        apap: { name: "Acetaminophen (paracetamol)", c: 0.2, e0: 0.4, blurb: "A common painkiller. Small, neutral and easy to oxidise: the classic problem for first-generation sensors." },
        aa: { name: "Ascorbic acid (vitamin C)", c: 0.1, e0: 0.22, blurb: "A negatively charged molecule that oxidises at a low potential. Raised by vitamin C supplements." },
        ua: { name: "Uric acid", c: 0.45, e0: 0.33, blurb: "A negatively charged waste product, always present in body fluid." }
    };

    // Tissue and boundary conditions.
    const O2 = { air: 0.2, tissue: 0.06, low: 0.03 };
    const D_G_WATER = 6e-10;
    const D_O_WATER = 2.7e-9;
    const BL = 8e-6;                         // unstirred layer at the sensor surface (m)
    const J_C_MAX = 1.5;                      // current density a counter electrode can carry (A/m2)
    const J_BG = 0.004;                       // background current density (A/m2)
    const LAG_BODY = 6;                       // minutes: blood glucose to tissue fluid


    function rngFor(dev, tag) { return SC.rng((dev.seed * 2654435761 + tag * 40503) >>> 0); }

    function gaussFrom(rand) {

        let u = 0;
        let v = 0;

        while (u === 0) { u = rand(); }
        while (v === 0) { v = rand(); }

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

    function sigm(x) { return 1 / (1 + Math.exp(-x)); }

    function mc(m) { return METAL[m] || METAL.pt; }

    function chan(dev, d) { return (dev.ch || []).filter(function (c) { return c.d === d && c.status === "ok"; })[0] || null; }

    function working(dev) { return dev.status === "ok" && !!chan(dev, "W"); }

    function okChans(dev) { return (dev.ch || []).filter(function (c) { return c.status === "ok"; }); }

    function areaM2(ch) { return ch.areaUm2 * 1e-12; }


    /* ------------------------------------------------
       THE FILM STACK OF ONE ELECTRODE
    ------------------------------------------------ */

    // Films on an electrode in order from the metal outwards, with how much of the site each one covers.
    function stackOf(ch) {

        return (ch.coats || []).map(function (c) {

            const ph = FILM[c.mat];

            return ph ? { mat: c.mat, t: c.t, cov: clamp(c.cover, 0, 1), ph: ph, quality: c.quality, adhesion: c.adhesion } : null;
        }).filter(function (x) { return x; });
    }

    function enzymeIndex(stack) {

        for (let k = 0; k < stack.length; k++) { if (stack[k].ph.enzyme) { return k; } }

        return -1;
    }

    // Per-device luck in how well the enzyme layer took.
    function enzymeLuck(dev, ch) {

        const st = stackOf(ch);
        const e = st[enzymeIndex(st)];
        const q = e ? Math.min(e.quality, 1) : 1;
        const r = rngFor(dev, 41);

        return Math.exp((0.1 + 0.3 * (1 - q)) * gaussFrom(r));
    }


    /* ------------------------------------------------
       THE SENSOR OVER TIME (wear)
    ------------------------------------------------ */

    // Tissue reaction: thickness of the fibrous capsule (um) after a given number of days.
    function capsuleUm(dev, day) {

        const s = dev.sub;
        const cross = s ? Math.max(s.w * s.t, 2000) : 15000;                    // um2
        const stiff = s ? Math.pow(Math.max(s.E, 0.01) / 2.5, 0.15) : 1;
        const ch = chan(dev, "W");
        const hy = ch ? stackOf(ch).filter(function (f) { return f.mat === "hydrogel"; })[0] : null;
        const calm = hy ? 1 - hy.ph.fbr * hy.cov * Math.min(1, hy.t / 2) : 1;

        return 28 * Math.sqrt(cross / 12500) * stiff * calm * (1 - Math.exp(-day / 5));
    }

    // Everything that changes with the days of wear: enzyme activity, oxygen, capsule, fouling, reference drift.
    function stateAt(dev, day) {

        const W = chan(dev, "W");
        const R = chan(dev, "R");
        const out = { day: day, act: 1, capsule: 0, foul: 0, O2f: 1, refDrift: 0, peeled: {}, insLift: false, events: [] };

        if (!W) { return out; }

        const stack = stackOf(W);
        const k = enzymeIndex(stack);

        if (k >= 0) {

            const e = stack[k];
            const rand = rngFor(dev, 61);
            const hazard = Math.max(1e-4, e.ph.delam * (1.35 - Math.min(e.adhesion, 1) * Math.min(e.quality, 1)));
            const tDel = -Math.log(1 - rand()) / hazard;

            out.act = Math.pow(0.5, day / e.ph.half);

            if (e.ph.med) { out.act *= Math.exp(-0.01 * day); }               // slow loss of osmium

            if (day > tDel) { out.act *= 0.05; out.peeled.enzyme = tDel; }
        }

        stack.forEach(function (f, j) {

            if (f.ph.enzyme) { return; }

            const rand = rngFor(dev, 70 + j);
            const hazard = Math.max(1e-4, f.ph.delam * (1.35 - Math.min(f.adhesion, 1) * Math.min(f.quality, 1)));
            const tDel = -Math.log(1 - rand()) / hazard;

            if (day > tDel) { out.peeled[f.mat] = tDel; }
        });

        out.capsule = capsuleUm(dev, day);

        const hy = stack.filter(function (f) { return f.mat === "hydrogel" && !out.peeled.hydrogel; })[0];

        out.foul = 2 * (1 - Math.exp(-day / 3)) * (hy ? 1 - (1 - hy.ph.foul) * hy.cov : 1);

        // Oxygen near the sensor falls with the first-day inflammation and recovers a little later.
        out.O2f = 1 - 0.5 * Math.exp(-Math.pow(day - 1, 2) / 1.2) - 0.12 * (1 - Math.exp(-day / 6)) * (1 - 0.5 * out.capsule / 28);

        // Insulation lifting exposes the trace.
        if (dev.ins) {

            const rand = rngFor(dev, 81);
            const hz = Math.max(1e-4, 0.01 * (1.4 - Math.min(dev.ins.adhesion, 1) * Math.min(dev.ins.quality, 1)) / Math.sqrt(Math.max(dev.ins.t, 0.2)) * (1 + 4 * W.pPin));
            const tIns = -Math.log(1 - rand()) / hz;

            if (day > tIns) { out.insLift = true; out.insDay = tIns; }
        }

        // Reference electrode: Ag/AgCl is used up with time, a bare metal wanders from the start.
        const r2 = rngFor(dev, 91);

        out.refOffset = (R && R.metal === "agcl" ? 0.003 : (R ? 0.06 : 0.1)) * gaussFrom(r2);

        if (!R) {

            out.refDrift = 0.01 * day;

        } else if (R.metal !== "agcl") {

            out.refDrift = 0.005 * day;

        } else {

            const layer = Math.max((R.coats || []).length ? 1 : 1, 1);
            const life = 60 * (R.areaUm2 / 80000) * layer;                    // days: bigger reference lasts longer

            out.refLife = life;
            out.refDrift = day < 0.6 * life ? 0.0004 * day : 0.0004 * 0.6 * life + 0.12 * Math.min(1, (day - 0.6 * life) / (0.6 * life));
        }

        return out;
    }

    function stateEvents(dev, days) {

        const ev = [];
        const s = stateAt(dev, days);

        if (s.peeled.enzyme !== undefined) { ev.push({ day: s.peeled.enzyme, text: "The enzyme layer peeled off" }); }

        Object.keys(s.peeled).forEach(function (m) {

            if (m === "enzyme") { return; }

            const names = { mpd: "The permselective film", nafion: "The Nafion film", pu: "The glucose-limiting membrane", hydrogel: "The hydrogel" };

            ev.push({ day: s.peeled[m], text: (names[m] || "A film") + " peeled off" });
        });

        if (s.insLift) { ev.push({ day: s.insDay, text: "The insulation lifted and exposed the trace" }); }

        if (s.refLife && days > 0.6 * s.refLife) { ev.push({ day: 0.6 * s.refLife, text: "The Ag/AgCl reference was running out and its potential began to drift" }); }

        ev.sort(function (a, b) { return a.day - b.day; });

        return ev;
    }


    /* ------------------------------------------------
       THE WORKING ELECTRODE AT STEADY STATE
    ------------------------------------------------ */

    // Applied potential (V vs the reference) that suits the enzyme on W.
    function autoPotential(dev) {

        const W = chan(dev, "W");

        if (!W) { return 0.6; }

        const st = stackOf(W);
        const k = enzymeIndex(st);

        if (k >= 0 && st[k].ph.med) { return 0.2; }

        return Math.max(0.6, mc(W.metal).eH + 0.25);
    }

    // Resistance to diffusion (s/m) of a species through the films outside (or inside) position k, plus the surface layer and the capsule.
    function resistance(stack, from, to, key, st, dWater) {

        let r = 0;

        for (let k = from; k < to; k++) {

            const f = stack[k];

            if (st && st.peeled[f.mat] !== undefined) { continue; }

            r += f.cov * (f.t * 1e-6) / (f.ph[key] || 1e-9);
        }

        return r;
    }

    // Everything the enzyme layer sees, for a glucose concentration G (mM) and an oxygen concentration O (mM).
    function enzymeRate(dev, W, G, O, st) {

        const stack = stackOf(W);
        const k = enzymeIndex(stack);

        if (k < 0) { return { rate: 0, Ge: G, Oe: O, enz: null, fe: 0, tau: 0 }; }

        const e = stack[k];
        const peeledE = st.peeled.enzyme !== undefined;

        const rg = BL / D_G_WATER + resistance(stack, k + 1, stack.length, "Dg", st) + (st.capsule * 1e-6) / (0.5 * D_G_WATER) + (st.foul * 1e-6) / 5e-11 + 0.5 * (e.t * 1e-6) / e.ph.Dg;
        const ro = BL / D_O_WATER + resistance(stack, k + 1, stack.length, "Do", st) + (st.capsule * 1e-6) / (0.5 * D_O_WATER) + (st.foul * 1e-6) / 5e-10 + 0.5 * (e.t * 1e-6) / e.ph.Do;

        const Pg = 1 / rg;
        const Po = 1 / ro;

        const V = e.ph.vUm * Math.min(e.t, 6) * e.cov * st.act * (st.luck !== undefined ? st.luck : enzymeLuck(dev, W));
        const Oin = O * st.O2f;

        let rate = 0;
        let Ge = G;
        let Oe = Oin;

        if (V > 0 && G > 0) {

            const f = function (r) {

                const ge = Math.max(G - r / Pg, 0);

                if (e.ph.med) {

                    return V * ge / (e.ph.Kg + ge) * (1 - 0.25 * Oin / (Oin + 0.05)) - r;
                }

                const oe = Math.max(Oin - r / Po, 0);

                return V * ge / (e.ph.Kg + ge) * oe / (e.ph.Ko + oe) - r;
            };

            let lo = 0;
            let hi = e.ph.med ? Pg * G : Math.min(Pg * G, Po * Oin);

            for (let it = 0; it < 60; it++) {

                const mid = 0.5 * (lo + hi);

                if (f(mid) > 0) { lo = mid; } else { hi = mid; }
            }

            rate = 0.5 * (lo + hi);
            Ge = Math.max(G - rate / Pg, 0);
            Oe = e.ph.med ? Oin : Math.max(Oin - rate / Po, 0);
        }

        // Time constant of the diffusion through the films (seconds).
        let tau = 0;

        for (let j = k; j < stack.length; j++) { tau += stack[j].cov * Math.pow(stack[j].t * 1e-6, 2) / (2 * stack[j].ph.Dg); }

        tau += Math.pow(st.capsule * 1e-6, 2) / (2 * D_G_WATER * 0.5) + Math.pow(BL, 2) / (2 * D_G_WATER);

        return { rate: rate, Ge: Ge, Oe: Oe, enz: e, fe: e.cov, tau: tau, Pg: Pg, Po: Po, V: V, peeled: peeledE };
    }

    // Share of the peroxide (or mediator electrons) that the electrode collects.
    function collection(W, enz, E, st) {

        const m = mc(W.metal);
        const stack = stackOf(W);

        if (enz && enz.ph.med) { return 0.9 * m.med * sigm((E - 0.05) / 0.04); }

        let pass = 1;

        stack.forEach(function (f) { if (f.ph.h2o2 !== undefined && !f.ph.enzyme && st.peeled[f.mat] === undefined) { pass *= 1 - f.cov * (1 - f.ph.h2o2) * 0.5; } });

        return 0.95 * m.h2o2 * pass * sigm((E - m.eH) / 0.05);
    }

    // Pass-through of an interferent: how much of it reaches the electrode (0 to 1, relative to a bare electrode).
    function interferentCurrent(dev, ch, id, E, st, boost) {

        const stack = stackOf(ch);
        const ph = INTERFERENTS[id];
        const m = mc(ch.metal);

        let rej = 1;
        let r = BL / 6e-10;

        stack.forEach(function (f) {

            if (st.peeled[f.mat] !== undefined) { return; }

            r += f.cov * (f.t * 1e-6) / (f.ph.Di ? f.ph.Di[id] : 1e-10);

            if (f.ph.rej) { rej *= 1 - f.cov * f.ph.rej[id] * (1 - Math.exp(-f.t / f.ph.tref)); }
        });

        r += (st.capsule * 1e-6) / (0.5 * 6e-10) + (st.foul * 1e-6) / 5e-11;

        const k = 1 / (1 / 1e-3 + r);
        const gate = sigm((E - ph.e0) / 0.05);

        return 2 * FARADAY * areaM2(ch) * m.rough * m.act * k * ph.c * (boost || 0) * rej * gate;
    }


    // Everything the working electrode and the sentinel carry for a given glucose, oxygen and day. Currents in amps.
    function signal(dev, o) {

        const W = chan(dev, "W");
        const S = chan(dev, "S");
        const st = o.state || stateAt(dev, o.day || 0);
        const E = (o.E !== undefined ? o.E : autoPotential(dev)) + st.refOffset + st.refDrift;
        const O = o.O !== undefined ? o.O : O2.tissue;
        const G = mm(o.G || 0);
        const hot = o.interf || {};

        const out = { st: st, E: E, iW: 0, iGlu: 0, iS: 0, iInt: 0, iIntS: 0, tau: 0, enz: null, R: null };

        if (!W) { return out; }

        const R = enzymeRate(dev, W, G, O, st);
        const aW = areaM2(W);
        const eta = collection(W, R.enz, E, st);

        out.R = R;
        out.enz = R.enz;
        out.tau = R.tau;
        // Electrode-to-electrode variation in how much of the product is collected: the factory cannot see it.
        const vary = st.luck === 1 ? 1 : Math.exp(0.08 * gaussFrom(rngFor(dev, 43)));

        out.iGlu = 2 * FARADAY * aW * mc(W.metal).rough * R.rate * eta * vary;

        let iInt = 0;

        Object.keys(INTERFERENTS).forEach(function (id) { iInt += interferentCurrent(dev, W, id, E, st, hot[id] || 0); });

        const bgW = J_BG * aW * mc(W.metal).rough * (st.insLift ? 2.5 : 1);

        out.iBg = bgW;
        out.iInt = iInt;
        out.iW = out.iGlu + iInt + bgW;

        if (S) {

            let iS = 0;

            Object.keys(INTERFERENTS).forEach(function (id) { iS += interferentCurrent(dev, S, id, E, st, hot[id] || 0); });

            out.iIntS = iS;
            out.iS = iS + J_BG * areaM2(S) * mc(S.metal).rough * (st.insLift ? 2.5 : 1);
        }

        // The counter electrode has to carry the working current.
        const C = chan(dev, "C");
        const lim = C ? J_C_MAX * areaM2(C) * mc(C.metal).rough : 0;

        out.counterLimit = lim;

        if (C && out.iW > 0.5 * lim) { out.iW = lim * Math.tanh(out.iW / lim) * 1; out.saturated = true; }
        else if (!C) { out.iW = 0; out.noCounter = true; }

        return out;
    }

    function noiseOf(dev, i) {

        return Math.sqrt(Math.pow(20e-12, 2) + Math.pow(0.003 * Math.abs(i), 2));
    }

    function slopeAt(dev, o, g0) {

        const d = 10;
        const a = signal(dev, Object.assign({}, o, { G: Math.max(g0 - d, 0) }));
        const b = signal(dev, Object.assign({}, o, { G: g0 + d }));

        return (b.iGlu - a.iGlu) / (g0 + d - Math.max(g0 - d, 0));
    }


    /* ------------------------------------------------
       TEST: CONTINUITY AND ISOLATION
    ------------------------------------------------ */

    function problems(dev) {

        const out = [];
        const W = chan(dev, "W");

        if (!W) { out.push("The working electrode (pad W) is missing, shorted or open."); return out; }

        const st = stackOf(W);

        if (enzymeIndex(st) < 0) { out.push("No enzyme layer reaches the working electrode, so it cannot see glucose. Draw a coating layer with glucose oxidase over W."); }
        else if (st[enzymeIndex(st)].cov < 0.6) { out.push("The enzyme layer covers only " + Math.round(st[enzymeIndex(st)].cov * 100) + "% of the working electrode: part of it is bare and sees only interferents."); }

        if (!chan(dev, "C")) { out.push("There is no working counter electrode (pad C), so no current can flow."); }

        const R = chan(dev, "R");

        if (!R) { out.push("There is no reference electrode (pad R): the potential will drift."); }
        else if (R.metal !== "agcl") { out.push("The reference is " + (R.metal === "pt" ? "platinum" : R.metal) + ", not Ag/AgCl, so its potential is not fixed and will wander."); }

        if (!chan(dev, "S")) { out.push("There is no sentinel electrode (S), so interferents cannot be subtracted."); }

        const k = enzymeIndex(st);

        if (k >= 0 && st.slice(0, k).some(function (f) { return f.mat === "pu"; })) { out.push("The glucose-limiting membrane is under the enzyme, so it limits nothing: glucose reaches the enzyme untouched. Draw it above the enzyme layer."); }

        if (k >= 0 && !st.slice(k + 1).some(function (f) { return f.mat === "pu"; }) && !st[k].ph.med) { out.push("There is no glucose-limiting membrane over a first-generation enzyme, so oxygen will run short at higher glucose."); }

        return out;
    }

    function check(dev) {

        const out = { ok: working(dev) || dev.status === "ok", ch: [], problems: [] };

        if (dev.status !== "ok") { return out; }

        out.problems = problems(dev);

        (dev.ch || []).forEach(function (c) {

            const stack = stackOf(c);

            out.ch.push({
                d: c.d, status: c.status, area: c.area, areaUm2: c.areaUm2, metal: c.metal, rTrace: c.rTrace, cPar: c.cPar, pPin: c.pPin,
                films: stack.map(function (f) { return { mat: f.mat, t: f.t, cov: f.cov }; })
            });
        });

        return out;
    }


    /* ------------------------------------------------
       TEST: GLUCOSE CALIBRATION
    ------------------------------------------------ */

    const CAL_LEVELS = [0, 20, 40, 60, 80, 100, 150, 200, 250, 300, 400, 500, 600];

    function calibration(dev, opts) {

        const out = { ok: working(dev), problems: [] };

        if (!out.ok) { return out; }

        const O = O2[opts.o2] || O2.tissue;
        const temp = opts.temp === 25 ? 25 : 37;
        const k = Math.pow(2, (temp - 37) / 10);                                  // enzymes and diffusion slow when cooler
        const E = opts.E === "auto" || opts.E === undefined ? autoPotential(dev) : Number(opts.E);

        const st = stateAt(dev, 0);

        st.act *= Math.pow(k, 0.7);

        const base = { O: O, E: E, state: st };

        out.problems = problems(dev);
        out.E = E;
        out.o2 = O;
        out.temp = temp;
        out.G = CAL_LEVELS;
        out.I = CAL_LEVELS.map(function (g) { return signal(dev, Object.assign({ G: g }, base)).iW * 1e9; });

        const s0 = signal(dev, Object.assign({ G: 0 }, base));
        const s100 = signal(dev, Object.assign({ G: 100 }, base));

        out.hasEnz = !!s0.enz;
        out.bg = s0.iW * 1e9;
        out.slope = slopeAt(dev, base, 100) * 1e9;                                 // nA per mg/dL
        out.noise = noiseOf(dev, s100.iW) * 1e12;                                 // pA
        out.lod = out.slope > 0 ? 3 * out.noise * 1e-3 / out.slope : Infinity;    // mg/dL

        const W = chan(dev, "W");

        out.jdens = out.slope * MGDL * 1e-9 / (areaM2(W) * 1e4) * 1e6 / 1;        // uA per mM per cm2 (area in cm2)

        // Linear range: where the current falls 10% short of the line through the origin.
        const sLow = (signal(dev, Object.assign({ G: 40 }, base)).iGlu) / 40;

        out.linMax = 0;

        for (let g = 20; g <= 800; g += 10) {

            const i = signal(dev, Object.assign({ G: g }, base)).iGlu;

            if (sLow > 0 && i >= 0.9 * sLow * g) { out.linMax = g; } else { break; }
        }

        out.satur = out.linMax < 600;

        // The response to a staircase of glucose.
        const steps = [[0, 0], [60, 100], [180, 200], [300, 400], [420, 100], [540, 0]];
        const tau = Math.max(s100.tau, 0.5);
        const rand = rngFor(dev, 301);

        out.t = [];
        out.step = [];
        out.i = [];
        out.gTrue = [];

        let iNow = signal(dev, Object.assign({ G: 0 }, base)).iW;
        const dt = 3;

        for (let t = 0; t <= 600; t += dt) {

            let g = 0;

            steps.forEach(function (s) { if (t >= s[0]) { g = s[1]; } });

            const target = signal(dev, Object.assign({ G: g }, base)).iW;

            iNow += (target - iNow) * (1 - Math.exp(-dt / tau));

            out.t.push(t);
            out.gTrue.push(g);
            out.i.push((iNow + noiseOf(dev, iNow) * gaussFrom(rand)) * 1e9);
        }

        out.tau = tau;
        out.t90 = 2.3 * tau;
        out.saturated = signal(dev, Object.assign({ G: 400 }, base)).saturated === true;

        return out;
    }


    /* ------------------------------------------------
       TEST: INTERFERENTS
    ------------------------------------------------ */

    function interferents(dev, opts) {

        const out = { ok: working(dev), problems: [] };

        if (!out.ok) { return out; }

        const st = stateAt(dev, 0);
        const E = opts.E === "auto" || opts.E === undefined ? autoPotential(dev) : Number(opts.E);
        const base = { O: O2.tissue, E: E, state: st, G: 100 };

        out.E = E;
        out.problems = problems(dev);
        out.hasS = !!chan(dev, "S");

        const s0 = signal(dev, base);
        const slope = slopeAt(dev, base, 100);                                      // A per mg/dL

        out.slope = slope * 1e9;
        out.hasEnz = !!s0.enz;

        out.species = Object.keys(INTERFERENTS).map(function (id) {

            const hot = {};

            hot[id] = 1;

            const s = signal(dev, Object.assign({}, base, { interf: hot }));
            const dW = s.iW - s0.iW;
            const dS = s.iS - s0.iS;
            const raw = slope > 0 ? dW / slope : NaN;
            const sub = out.hasS && slope > 0 ? (dW - dS * (areaM2(chan(dev, "W")) / areaM2(chan(dev, "S")))) / slope : NaN;

            return { id: id, name: INTERFERENTS[id].name, conc: INTERFERENTS[id].c, iW: dW * 1e9, iS: dS * 1e9, raw: raw, sub: sub };
        });

        // One trace: glucose at 100 mg/dL, then each interferent is added in turn.
        const adds = [{ t: 100, id: "apap" }, { t: 200, id: "aa" }, { t: 300, id: "ua" }];
        const rand = rngFor(dev, 311);
        const tau = Math.max(s0.tau, 0.5);

        out.t = [];
        out.raw = [];
        out.subtracted = [];
        out.truth = [];

        let iW = s0.iW;
        let iS = s0.iS;
        const dt = 3;

        for (let t = 0; t <= 420; t += dt) {

            const hot = {};

            adds.forEach(function (a) { if (t >= a.t) { hot[a.id] = 1; } });

            const s = signal(dev, Object.assign({}, base, { interf: hot }));

            iW += (s.iW - iW) * (1 - Math.exp(-dt / tau));
            iS += (s.iS - iS) * (1 - Math.exp(-dt / 8));

            const nW = noiseOf(dev, iW) * gaussFrom(rand);
            const g = slope > 0 ? (iW + nW - s0.iW) / slope + 100 : 100;

            out.t.push(t);
            out.truth.push(100);
            out.raw.push(g);
            out.subtracted.push(out.hasS && slope > 0 ? g - (iS - s0.iS) * (areaM2(chan(dev, "W")) / areaM2(chan(dev, "S"))) / slope : NaN);
        }

        out.adds = adds;

        return out;
    }


    /* ------------------------------------------------
       TEST: OXYGEN
    ------------------------------------------------ */

    function oxygen(dev, opts) {

        const out = { ok: working(dev), problems: [] };

        if (!out.ok) { return out; }

        const st = stateAt(dev, 0);
        const E = opts.E === "auto" || opts.E === undefined ? autoPotential(dev) : Number(opts.E);

        out.problems = problems(dev);
        out.E = E;
        out.G = [0, 20, 40, 60, 80, 100, 150, 200, 250, 300, 400, 500, 600];
        out.levels = [{ id: "air", name: "Air-saturated (0.2 mM)" }, { id: "tissue", name: "Typical tissue (0.06 mM)" }, { id: "low", name: "Low-oxygen tissue (0.03 mM)" }];

        out.curves = out.levels.map(function (lv) {

            const base = { O: O2[lv.id], E: E, state: st };

            return { id: lv.id, name: lv.name, I: out.G.map(function (g) { return signal(dev, Object.assign({ G: g }, base)).iGlu * 1e9; }), slope: slopeAt(dev, base, 100) * 1e9 };
        });

        const at = function (curve, g) { return curve.I[out.G.indexOf(g)]; };

        out.retain300 = at(out.curves[0], 300) > 0 ? at(out.curves[2], 300) / at(out.curves[0], 300) * 100 : NaN;
        out.retainSlope = out.curves[0].slope > 0 ? out.curves[2].slope / out.curves[0].slope * 100 : NaN;
        out.hasEnz = !!signal(dev, { G: 100, state: st }).enz;
        out.mediator = !!(signal(dev, { G: 100, state: st }).enz || {}).ph && signal(dev, { G: 100, state: st }).enz.ph.med;

        // What fraction of the membrane's oxygen supply the enzyme uses at 400 mg/dL in typical tissue.
        const r = signal(dev, { G: 400, O: O2.tissue, E: E, state: st }).R;

        out.use = r && r.Po ? clamp(r.rate / (r.Po * O2.tissue), 0, 1) : NaN;

        return out;
    }


    /* ------------------------------------------------
       TEST: TEN DAYS OF WEAR
    ------------------------------------------------ */

    function wear(dev, opts) {

        const out = { ok: working(dev), problems: [] };

        if (!out.ok) { return out; }

        const E0 = autoPotential(dev);
        const W = chan(dev, "W");

        out.problems = problems(dev);
        out.days = [];
        out.sens = [];
        out.rel = [];
        out.bg = [];
        out.cap = [];
        out.act = [];
        out.ref = [];
        out.o2f = [];

        const nDays = 14;

        for (let d = 0; d <= nDays + 1e-9; d += 0.5) {

            const st = stateAt(dev, d);
            const base = { O: O2.tissue, E: E0, state: st };

            out.days.push(d);
            out.sens.push(slopeAt(dev, base, 100) * 1e9);
            out.bg.push(signal(dev, Object.assign({ G: 0 }, base)).iBg * 1e9);
            out.cap.push(st.capsule);
            out.act.push(st.act * 100);
            out.ref.push((st.refDrift + st.refOffset) * 1000);
            out.o2f.push(st.O2f * 100);
        }

        const s0 = out.sens[0] > 0 ? out.sens[0] : 1e-12;

        out.s0 = out.sens[0];
        out.rel = out.sens.map(function (s) { return s / s0 * 100; });
        out.events = stateEvents(dev, nDays);

        // Useful life: until the sensitivity leaves 70 to 130 percent of the day-0 value or something breaks (after the first day's dip).
        out.life = nDays;

        for (let k = 0; k < out.days.length; k++) {

            if (out.days[k] < 2) { continue; }

            if (out.rel[k] < 70 || out.rel[k] > 130) { out.life = out.days[k]; break; }
        }

        out.dip = Math.min.apply(null, out.rel.slice(0, 8));
        out.dipDay = out.days[out.rel.indexOf(out.dip)];
        out.end = out.rel[out.rel.length - 1];

        // Warm-up: the background current after the sensor is switched on, in the first hours.
        const rand = rngFor(dev, 321);
        const tauH = (0.25 + 0.5 * Math.min(areaM2(W) * 1e6 / 0.15, 3)) * (stackOf(W).some(function (f) { return f.mat === "mpd"; }) ? 0.8 : 1);
        const bg = signal(dev, { G: 0, state: stateAt(dev, 0), E: E0, O: O2.tissue }).iBg;

        out.warm = { h: [], i: [] };

        for (let h = 0; h <= 6.0001; h += 0.1) {

            out.warm.h.push(h);
            out.warm.i.push((bg * (1 + 25 * Math.exp(-h / tauH)) + 20e-12 * gaussFrom(rand)) * 1e9);
        }

        // Hours until the extra background falls below 2 mg/dL of glucose.
        const slope = out.s0 * 1e-9;

        out.warmHours = 6;

        for (let k = 0; k < out.warm.h.length; k++) {

            if (slope > 0 && (out.warm.i[k] * 1e-9 - bg) / slope < 2) { out.warmHours = out.warm.h[k]; break; }
        }

        out.tauWarm = tauH;

        return out;
    }


    /* ------------------------------------------------
       TEST: A SIMULATED DAY
    ------------------------------------------------ */

    const SCENARIOS = {

        typical: { name: "A typical day (no diabetes)", base: 92, meals: [[7.5, 55], [12.5, 65], [19, 70]], dip: null },
        meals: { name: "Big meals (type 2 diabetes)", base: 130, meals: [[7.5, 110], [12.5, 130], [19, 150]], dip: null },
        hypo: { name: "Low overnight (insulin-treated)", base: 120, meals: [[7.5, 90], [12.5, 80], [19, 85]], dip: { t: 3.5, depth: 75, w: 0.9 } }
    };

    function bloodGlucose(scn, h) {

        let g = scn.base;

        scn.meals.forEach(function (m) {

            const dt = h - m[0];

            if (dt > 0) { g += m[1] * (dt / 0.9) * Math.exp(1 - dt / 0.9); }
        });

        if (scn.dip) { g -= scn.dip.depth * Math.exp(-Math.pow((h - scn.dip.t) / scn.dip.w, 2)); }

        return Math.max(g, 40);
    }

    function nominalSlope(dev, E, day) {

        // What the factory sets as the sensitivity: the same design, but with no luck in how it was made.
        const st = stateAt(dev, 0);

        return slopeAt(dev, { O: O2.tissue, E: E, state: Object.assign({}, st, { act: 1, luck: 1 }) }, 100);
    }

    function dayRun(dev, opts) {

        const out = { ok: working(dev), problems: [] };

        if (!out.ok) { return out; }

        const scn = SCENARIOS[opts.scenario] || SCENARIOS.typical;
        const day = opts.day || 1;
        const E = autoPotential(dev);
        const st = stateAt(dev, day);
        const base = { O: O2.tissue, E: E, state: st };
        const hasS = !!chan(dev, "S");
        const useS = hasS && opts.subtract !== false;

        out.problems = problems(dev);
        out.scenario = scn.name;
        out.hasS = hasS;
        out.useS = useS;

        const sens = slopeAt(dev, base, 100);
        const s0 = signal(dev, Object.assign({ G: 0 }, base));
        const tauS = Math.max(signal(dev, Object.assign({ G: 100 }, base)).tau, 0.5);
        const lagMin = LAG_BODY * (1 + st.capsule / 30);

        out.lagMin = lagMin;
        out.tauS = tauS;

        const rand = rngFor(dev, 331 + day);
        const dtMin = 5;
        const n = 24 * 60 / dtMin;

        const t = [];
        const blood = [];
        const isf = [];
        const iRaw = [];
        const iSent = [];

        let gIsf = bloodGlucose(scn, 0);
        let iW = signal(dev, Object.assign({ G: gIsf }, base)).iW;
        let iS = hasS ? signal(dev, Object.assign({ G: gIsf }, base)).iS : 0;

        let bio = 0;

        const aRatio = hasS ? areaM2(chan(dev, "W")) / areaM2(chan(dev, "S")) : 1;

        for (let k = 0; k <= n; k++) {

            const h = k * dtMin / 60;
            const gb = bloodGlucose(scn, h);

            gIsf += (gb - gIsf) * (1 - Math.exp(-dtMin / lagMin));

            // Local tissue differs a little from blood and wanders slowly: calibration cannot remove that.
            bio = 0.9 * bio + 0.03 * gaussFrom(rand);

            // Acetaminophen from a 1 g dose at 08:00, falling with a half-life of about 3 hours.
            const dose = opts.apap && h >= 8 ? Math.pow(0.5, (h - 8) / 3) * 1 : 0;
            const hot = dose > 0 ? { apap: dose } : {};

            const sg = signal(dev, Object.assign({ G: gIsf * (1 + bio), interf: hot }, base));

            iW += (sg.iW - iW) * (1 - Math.exp(-dtMin * 60 / tauS));
            iS += (sg.iS - iS) * (1 - Math.exp(-dtMin * 60 / 8));

            t.push(h);
            blood.push(gb);
            isf.push(gIsf);
            iRaw.push(iW + noiseOf(dev, iW) * gaussFrom(rand));
            iSent.push(iS + noiseOf(dev, iS) * gaussFrom(rand));
        }

        // Turning current into glucose. The factory slope and baseline come from the design as it was on day 0.
        const nom = nominalSlope(dev, E, day);
        const st0 = stateAt(dev, 0);
        const b0 = signal(dev, { G: 0, O: O2.tissue, E: E, state: st0 });

        const net = function (k) { return iRaw[k] - (useS ? iSent[k] * aRatio : 0); };

        let slopeUse = nom;
        let offset = b0.iBg - (useS ? b0.iS * aRatio : 0);

        if (opts.cal === "finger") {

            // Two fingersticks (meter error about 5%), at 2 h and 12 h: a straight line through them.
            const meter = rngFor(dev, 341);
            const pick = function (h) { const k = Math.round(h * 60 / dtMin); return { g: blood[k] * (1 + 0.05 * gaussFrom(meter)), i: net(k) }; };
            const p1 = pick(2);
            const p2 = pick(12);

            let sl = (p2.i - p1.i) / (p2.g - p1.g);

            if (!isFinite(sl) || Math.abs(p2.g - p1.g) < 25) { sl = nom; }

            sl = clamp(sl, 0.5 * nom, 2 * nom);

            slopeUse = sl;
            offset = p1.i - sl * p1.g;
            out.calPoints = [{ h: 2, g: p1.g }, { h: 12, g: p2.g }];
        }

        out.nominalError = sens > 0 ? (sens / nom - 1) * 100 : NaN;
        out.slopeUsed = slopeUse * 1e9;

        const meas = iRaw.map(function (i, k) { return slopeUse > 0 ? (net(k) - offset) / slopeUse : NaN; });

        out.t = t;
        out.blood = blood;
        out.isf = isf;
        out.meas = meas;
        out.i = iRaw.map(function (x) { return x * 1e9; });

        // Accuracy against the blood reference.
        let sumRel = 0;
        let nRel = 0;
        let in15 = 0;
        let in20 = 0;

        meas.forEach(function (g, k) {

            if (!isFinite(g)) { return; }

            const gb = blood[k];
            const err = Math.abs(g - gb);

            sumRel += err / gb;
            nRel += 1;

            if (err <= (gb < 100 ? 15 : 0.15 * gb)) { in15 += 1; }
            if (err <= (gb < 100 ? 20 : 0.2 * gb)) { in20 += 1; }
        });

        out.mard = nRel ? sumRel / nRel * 100 : NaN;
        out.in15 = nRel ? in15 / nRel * 100 : NaN;
        out.in20 = nRel ? in20 / nRel * 100 : NaN;

        // Low glucose: how often is it caught.
        let lowN = 0;
        let lowHit = 0;
        let falseN = 0;
        let safeN = 0;

        meas.forEach(function (g, k) {

            if (blood[k] < 70) { lowN += 1; if (g < 70) { lowHit += 1; } }
            else if (blood[k] >= 85) { safeN += 1; if (g < 70) { falseN += 1; } }
        });

        out.lowN = lowN;
        out.lowCaught = lowN ? lowHit / lowN * 100 : NaN;
        out.falseLow = safeN ? falseN / safeN * 100 : 0;
        out.minBlood = Math.min.apply(null, blood);

        return out;
    }


    /* ------------------------------------------------
       TEST: INSERTION
    ------------------------------------------------ */

    function insertion(dev) {

        const s = dev.sub;
        const out = { ok: working(dev), sub: s };

        if (!out.ok || !s) { out.noBody = !s; return out; }

        const E = s.E * 1e9;
        const w = s.w * 1e-6;
        const t = s.t * 1e-6;
        const L = s.L * 1e-6;

        const I = w * t * t * t / 12;
        const EI = E * I;

        const pcr = Math.PI * Math.PI * EI / (L * L);

        // Pushing through skin takes a stress at the tip; a bare filament almost never manages it alone.
        const aTip = Math.max(s.tipW, 10) * 1e-6 * t;
        const fIns = 1e7 * aTip + 5e-3;

        out.curve = { L: [], p: [] };

        for (let k = 0; k < 30; k++) {

            const mm_ = Math.pow(10, Math.log10(1) + (Math.log10(15) - Math.log10(1)) * k / 29);

            out.curve.L.push(mm_);
            out.curve.p.push(Math.PI * Math.PI * EI / Math.pow(mm_ * 1e-3, 2) * 1000);
        }

        out.pcr = pcr * 1000;
        out.fIns = fIns * 1000;
        out.margin = pcr / fIns;
        out.buckles = pcr < fIns;
        out.L = s.L;
        out.cross = s.w * s.t;

        // The introducer needle: a groove or tube that carries the filament in. It must be wider than the sensor, and a wider needle hurts more.
        out.needle = Math.sqrt(Math.pow(s.w, 2) + Math.pow(s.t * 6, 2)) + 60;
        out.pain = clamp(out.needle / 800, 0, 1) * 10;

        const days = [];
        const cap = [];

        for (let k = 0; k <= 28; k++) { days.push(k * 0.5); cap.push(capsuleUm(dev, k * 0.5)); }

        out.capsule = { d: days, t: cap };
        out.cap14 = capsuleUm(dev, 14);

        return out;
    }


    root.LabCGM = {

        METAL: METAL, FILM: FILM, INTERFERENTS: INTERFERENTS, O2: O2, SCENARIOS: SCENARIOS, MGDL: MGDL,
        working: working, okChans: okChans, chan: chan, stackOf: stackOf, enzymeIndex: enzymeIndex, stateAt: stateAt, signal: signal, slopeAt: slopeAt,
        autoPotential: autoPotential, problems: problems, check: check, calibration: calibration, interferents: interferents, oxygen: oxygen,
        wear: wear, dayRun: dayRun, insertion: insertion, capsuleUm: capsuleUm, noiseOf: noiseOf, areaM2: areaM2, bloodGlucose: bloodGlucose
    };

    if (typeof module !== "undefined" && module.exports) { module.exports = root.LabCGM; }

}(typeof window !== "undefined" ? window : globalThis));
