/* ========================================
   QUANTUM FOUNDRY: MEASUREMENTS

   Simulated instruments for a fabricated transmon chip (the device
   object from lab-qubit-engine.js):
     probe    room-temperature junction resistance on a probe station,
              and the qubit frequency it predicts (Ambegaokar-Baratoff)
     res      feedline transmission (S21) through the readout resonators,
              with the qubit in 0 and in 1 (dispersive shift)
     spec     two-tone qubit spectroscopy
     rabi     Rabi oscillations against pulse length
     t1       energy relaxation, with the loss budget
     ramsey   Ramsey fringes (T2*) and the spin-echo T2

   Every curve gets a little measurement noise, seeded by the device so
   the same test always reads the same. Teaching models: illustrative.

   Needs window.SCLab (for the random generator) and LabEngine.qubitKit.
======================================== */

(function (root) {

    "use strict";

    const SC = root.SCLab;
    const K = root.LabEngine.qubitKit;

    function rngFor(dev, salt) {

        const r = SC.rng((dev.seed || 1) * 31 + salt * 7919);

        return {
            u: r,
            g: function () {

                let a = 0;
                let b = 0;

                while (a === 0) { a = r(); }
                while (b === 0) { b = r(); }

                return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
            }
        };
    }

    function working(dev) { return dev && dev.qubits && dev.qubits.some(function (q) { return q.ok && q.res; }); }

    function qubitOf(dev, label) {

        const ok = (dev.qubits || []).filter(function (q) { return q.ok; });

        return ok.filter(function (q) { return q.label === label; })[0] || ok[0] || null;
    }

    function range(a, b, n) {

        const out = [];

        for (let k = 0; k < n; k++) { out.push(a + (b - a) * k / (n - 1)); }

        return out;
    }

    // Readout contrast: how well 0 and 1 can be told apart, from the dispersive shift and linewidth.
    function contrast(q) {

        if (!q.res || !isFinite(q.chi)) { return 0.3; }

        const x = 2 * Math.abs(q.chi) * 1e3 / Math.max(q.res.lw, 0.05);

        return 0.55 + 0.4 * Math.min(1, x / (1 + 0.15 * x * x) * 1.2);
    }


    /* ------------------------------------------------
       PROBE STATION
    ------------------------------------------------ */

    function probe(dev) {

        const R = rngFor(dev, 1);
        const rows = [];

        (dev.junctions || []).forEach(function (j, k) {

            const owner = (dev.qubits || []).filter(function (q) { return q.junctions && q.junctions.indexOf(j) >= 0; })[0];
            const meas = isFinite(j.rnRoom) ? j.rnRoom * (1 + 0.003 * R.g()) : Infinity;
            const row = { k: k + 1, qubit: owner ? owner.label : "none", ok: j.ok, why: j.why, rn: j.ok ? meas : (j.why.indexOf("shorted") >= 0 ? 0 : Infinity), area: j.area, w: j.w };

            if (j.ok && owner && owner.ok) {

                const par = owner.junctions.filter(function (x) { return x.ok; }).length;
                const ej = K.ejOf(meas * K.COLD_RISE) * (par > 1 ? par : 1);
                const tr = K.transmon(ej, owner.ec);

                row.ic = K.icOf(meas * K.COLD_RISE);
                row.ej = ej;
                row.pred = tr.f01;
                row.ec = owner.ec;
            }

            rows.push(row);
        });

        return { ok: rows.length > 0, rows: rows };
    }


    /* ------------------------------------------------
       RESONATOR SPECTROSCOPY (feedline S21)
    ------------------------------------------------ */

    function s21At(f, res, shift) {

        const fr = res.fr + shift;
        const x = 2 * res.q * (f - fr) / fr;
        const a = res.q / res.qc;

        // |1 - a / (1 + i x)|
        const re = 1 - a / (1 + x * x);
        const im = a * x / (1 + x * x);

        return 20 * Math.log10(Math.max(1e-6, Math.hypot(re, im)));
    }

    function resonators(dev, p) {

        const R = rngFor(dev, 2);
        const list = (dev.resonators || []).filter(function (r) { return r.qc < 1e8; });
        const out = { ok: list.length > 0, list: [], wide: null, zoom: null };

        if (!list.length) { return out; }

        const shiftOf = function (res, state) {

            const q = (dev.qubits || []).filter(function (x) { return x.ok && x.res === res; })[0];

            return q && isFinite(q.chi) ? (state ? -1 : 1) * q.chi : 0;
        };

        list.forEach(function (res) {

            const q = (dev.qubits || []).filter(function (x) { return x.ok && x.res === res; })[0];

            out.list.push({
                fr: res.fr * (1 + 2e-6 * R.g()), qc: res.qc * (1 + 0.03 * R.g()), qi: res.qi * (1 + 0.08 * R.g()), lw: res.lw,
                chi: q && isFinite(q.chi) ? q.chi * 1e3 : NaN, qubit: q ? q.label : "none", len: res.len
            });
        });

        // the whole band
        const lo = Math.min.apply(null, list.map(function (r) { return r.fr; })) - 0.05;
        const hi = Math.max.apply(null, list.map(function (r) { return r.fr; })) + 0.05;
        const fw = range(lo, hi, 4000);

        out.wide = { f: fw, s: fw.map(function (f) { let s = 0; list.forEach(function (r) { s += s21At(f, r, shiftOf(r, 0)); }); return s + 0.05 * R.g(); }) };

        // zoom on the resonator of the chosen qubit
        const q = qubitOf(dev, p.q);
        const res = q && q.res && q.res.qc < 1e8 ? q.res : list[0];
        const span = Math.max(4 * res.lw * 1e-3, 6 * Math.abs(shiftOf(res, 0)));
        const fz = range(res.fr - span, res.fr + span, 400);

        out.zoom = {
            label: q && q.res === res ? q.label : "",
            f: fz,
            s0: fz.map(function (f) { return s21At(f, res, shiftOf(res, 0)) + 0.08 * R.g(); }),
            s1: fz.map(function (f) { return s21At(f, res, shiftOf(res, 1)) + 0.08 * R.g(); })
        };

        return out;
    }


    /* ------------------------------------------------
       QUBIT SPECTROSCOPY
    ------------------------------------------------ */

    function lorentz(f, f0, hw) { return 1 / (1 + Math.pow((f - f0) / hw, 2)); }

    function spectroscopy(dev, p) {

        const q = qubitOf(dev, p.q);

        if (!q) { return { ok: false }; }

        const R = rngFor(dev, 3);
        const high = p.power === "high";
        const t2 = q.T2s * 1e-6;
        const hw0 = 1 / (2 * Math.PI * t2) / 1e9;                     // GHz
        const drive = high ? 0.008 : 0.00004;                          // Rabi rate in GHz
        const hw = Math.sqrt(hw0 * hw0 + 2 * drive * drive);
        const sat = high ? 0.5 : 0.5 * drive * drive / (drive * drive + hw0 * hw0 * 0.5);
        const span = high ? Math.max(0.3, Math.abs(q.alpha) * 1.6) : Math.max(0.0015, 8 * hw, 3 * q.disp);
        const f = high ? range(q.f01 - span, q.f01 + span * 0.4, 900) : range(q.f01 - span, q.f01 + span, 600);
        const split = q.disp > hw ? q.disp / 2 : 0;
        const c = contrast(q);

        const pe = f.map(function (x) {

            let y = split ? 0.5 * (lorentz(x, q.f01 + split, hw) + lorentz(x, q.f01 - split, hw)) : lorentz(x, q.f01, hw);

            y *= sat;

            if (high) {

                y += 0.35 * lorentz(x, q.f01 + q.alpha / 2, hw * 0.5);          // two-photon 0 -> 2
                y += 0.18 * lorentz(x, q.f01 + q.alpha, hw);                    // 1 -> 2 from thermal and driven population
            }

            return Math.min(1, y) * c + 0.01 * R.g();
        });

        return { ok: true, q: q.label, f: f, p: pe, f01: q.f01 * (1 + 1e-6 * R.g()), f02half: q.f01 + q.alpha / 2, alpha: q.alpha, lw: 2 * hw * 1e3, split: split * 2e6, high: high };
    }


    /* ------------------------------------------------
       RABI
    ------------------------------------------------ */

    function rabi(dev, p) {

        const q = qubitOf(dev, p.q);

        if (!q) { return { ok: false }; }

        const R = rngFor(dev, 4);
        const om = 0.05 * p.amp / 100 * (1 + 0.04 * R.g());            // Rabi frequency in GHz at full amplitude: about 50 MHz (line attenuation varies)
        const tpi = 1 / (2 * om);                                       // ns
        const c = contrast(q);
        const tDecay = 1 / (0.5 / q.T1 + 0.5 / q.T2s) * 1e3;             // ns

        // short pulses spread out in frequency and leak into the second excited state
        const leak = Math.exp(-Math.pow(Math.abs(q.alpha) * tpi * 2.2, 2));

        const t = range(0, Math.min(600, 8 * tpi), 241);

        const pe = t.map(function (x) {

            const env = Math.exp(-x / tDecay);
            const y = 0.5 * (1 - Math.cos(2 * Math.PI * om * x) * env) * (1 - leak * 0.8);

            return y * c + 0.012 * R.g();
        });

        return { ok: true, q: q.label, t: t, p: pe, tpi: tpi, om: om * 1e3, leak: leak, c: c };
    }


    /* ------------------------------------------------
       T1
    ------------------------------------------------ */

    function t1(dev, p) {

        const q = qubitOf(dev, p.q);

        if (!q) { return { ok: false }; }

        const R = rngFor(dev, 5);
        const c = contrast(q);
        const t = range(0, 5 * q.T1, 81);
        const pe = t.map(function (x) { return c * Math.exp(-x / q.T1) + 0.012 * R.g(); });
        const fit = q.T1 * (1 + 0.03 * R.g());

        return { ok: true, q: q.label, t: t, p: pe, T1: fit, parts: q.T1parts, f01: q.f01 };
    }


    /* ------------------------------------------------
       RAMSEY AND ECHO
    ------------------------------------------------ */

    function ramsey(dev, p) {

        const q = qubitOf(dev, p.q);

        if (!q) { return { ok: false }; }

        const R = rngFor(dev, 6);
        const c = contrast(q);
        const det = p.det / 1000;                                       // MHz (set in kHz)
        const eps = q.disp * 1e3;                                       // MHz, charge-parity splitting
        const tmax = Math.min(4 * q.T2s, 400);
        const t = range(0, tmax, 401);

        const pe = t.map(function (x) {

            const env = Math.exp(-x / q.T2s);

            return c * (0.5 - 0.5 * Math.cos(2 * Math.PI * det * x) * Math.cos(Math.PI * eps * x) * env) + 0.012 * R.g();
        });

        const te = range(0, Math.min(4 * q.T2E, 600), 61);
        const pecho = te.map(function (x) { return c * (0.5 + 0.5 * Math.exp(-x / q.T2E)) + 0.012 * R.g(); });

        return { ok: true, q: q.label, t: t, p: pe, te: te, pecho: pecho, T2s: q.T2s * (1 + 0.04 * R.g()), T2E: q.T2E * (1 + 0.04 * R.g()), det: det, eps: eps, tphi: q.Tphi, T1: q.T1 };
    }


    root.LabQubit = {
        working: working, qubitOf: qubitOf, contrast: contrast,
        probe: probe, resonators: resonators, spectroscopy: spectroscopy, rabi: rabi, t1: t1, ramsey: ramsey
    };

}(typeof window !== "undefined" ? window : globalThis));
