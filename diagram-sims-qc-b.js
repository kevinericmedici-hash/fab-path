/* ========================================
   QUANTUM COMPUTING CHIPS: INTERACTIVE SIMULATORS, PART 2

   Unit 9:  the recipe for a qubit (DiVincenzo's checklist, reset, lifetime vs gate time).
   Unit 10: energy levels (absorption, harmonic vs anharmonic, the microwave band, heat, Rabi).
   Unit 11: coherence (T1 decay, dephasing, spin echo, noise sources, platforms).
   Unit 12: gates (Bloch puzzle, two-qubit gates, fidelity, pulse shaping).
   Unit 13: error correction (repetition code, syndrome game, threshold, overhead).
   Unit 14: the qubit zoo (platform quiz and comparison).

   Loaded by diagram-sims-qc.js, which defines F.qcHelpers.
   Teaching models: numbers are illustrative unless a slide says otherwise.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers || !F.qcHelpers) {
        return;
    }

    const M = F.memsHelpers;
    const Q = F.qcHelpers;
    const clamp = M.clamp;
    const mulberry = M.mulberry;
    const seg = M.seg;
    const head = M.head;
    const out = M.out;
    const stat = M.stat;
    const quiz = M.quiz;
    const stepper = M.stepper;
    const SIMS = F.SIMS;

    const make = Q.make;
    const txt = Q.txt;
    const dot = Q.dot;
    const line = Q.line;
    const arrow = Q.arrow;
    const box = Q.box;
    const sup = Q.sup;
    const deg = Q.deg;
    const TEAL = Q.TEAL;
    const GOLD = Q.GOLD;
    const ROSE = Q.ROSE;
    const BLUE = Q.BLUE;
    const GREY = Q.GREY;
    const TEXT = Q.TEXT;
    const PURPLE = Q.PURPLE;

    const H_PLANCK = 6.626e-34;
    const K_B = 1.381e-23;


    /* ======================================
       UNIT 9: THE RECIPE FOR A QUBIT
    ====================================== */

    SIMS["qc-recipe"] = quiz(
        "Game: match the ingredient",
        ["Well-defined, scalable qubits", "Reset to a known state", "Long coherence", "A universal set of gates", "Measure each qubit"],
        [
            { q: "You can make many identical two-level systems and add more of them.", a: "Well-defined, scalable qubits", why: "Criterion 1: clear qubits you can scale up." },
            { q: "Every calculation must start from all qubits in 0.", a: "Reset to a known state", why: "Criterion 2: initialisation." },
            { q: "The qubit has to survive thousands of operations before it decoheres.", a: "Long coherence", why: "Criterion 3: lifetime much longer than a gate." },
            { q: "Single-qubit rotations plus one entangling two-qubit gate.", a: "A universal set of gates", why: "Criterion 4: that combination can build any quantum program." },
            { q: "At the end, you read out the answer from each qubit separately.", a: "Measure each qubit", why: "Criterion 5: qubit-specific measurement." },
            { q: "Cooling a superconducting chip to 10 millikelvin so every qubit relaxes to 0.", a: "Reset to a known state", why: "Cold means the qubits settle in the ground state." },
            { q: "A transmon's 1→2 transition is detuned from 0→1, so the qubit stays in two levels.", a: "Well-defined, scalable qubits", why: "A well-defined two-level system." }
        ],
        5,
        "qc-recipe-done",
        "You know DiVincenzo's recipe",
        "Every qubit platform is judged against these five ingredients.",
        "Qubits, reset, coherence, gates, measurement. Hit Reset to try again."
    );


    const CANDIDATES = {
        switch: { n: "A light switch", c: ["✗ Only 0 or 1, no blend", "✓ Easy to set", "✗ No quantum state to keep", "✗ No quantum gates", "✓ Easy to read"], v: "Not a qubit: it's a classical bit." },
        coin: { n: "A spinning coin", c: ["✗ Looks like a blend, but it is secretly heads or tails", "✓ Easy to set", "✗ Not quantum", "✗ No interference", "✓ Easy to read"], v: "Not a qubit: its 'blend' is just ignorance, and coins never interfere." },
        atom: { n: "Two energy levels of an atom", c: ["✓ Two sharp levels, identical in every atom", "✓ Optical pumping resets it", "✓ Can last seconds or more", "✓ Lasers drive gates", "✓ Fluorescence reveals the state"], v: "An excellent qubit: this is how trapped-ion and neutral-atom computers work." },
        spin: { n: "The spin of one electron in silicon", c: ["✓ Up or down in a magnetic field", "✓ Load a fresh electron", "✓ Long-lived in pure silicon-28", "✓ Microwave or electric pulses", "✓ Read with a nearby charge sensor"], v: "A good qubit: this is how silicon spin qubits work." },
        circuit: { n: "A superconducting circuit", c: ["✓ Two lowest energy levels of a nonlinear circuit", "✓ Cooling relaxes it to 0", "~ Hundreds of microseconds, limited by material defects", "✓ Fast microwave pulses", "✓ Read through a microwave resonator"], v: "A good qubit, and one you can design and fabricate like a chip." }
    };

    SIMS["qc-candidates"] = function (root) {

        const state = { pick: "switch" };

        root.innerHTML = head("Try it: is it a good qubit?") +
            seg("Candidate", "pick", Object.keys(CANDIDATES).map(function (k) { return [k, CANDIDATES[k].n]; })) +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div data-list style="display:grid;gap:6px;margin-top:8px"></div>' +
            '<p class="fd-sim-formula">A qubit needs a genuinely quantum two-level system, not just something with two positions. The test is DiVincenzo\'s checklist: well-defined qubits, reset, long coherence, gates and measurement.</p>';

        const list = root.querySelector("[data-list]");
        const names = ["Two-level system", "Reset", "Coherence", "Gates", "Measurement"];
        const seen = {};

        function render() {

            const c = CANDIDATES[state.pick];

            list.innerHTML = "";

            c.c.forEach(function (row, i) {

                const d = document.createElement("div");
                const good = row.charAt(0) === "✓";
                const mid = row.charAt(0) === "~";

                d.style.cssText = "padding:8px 12px;border-radius:10px;border:1px solid " + (good ? "rgba(84,224,199,.45)" : mid ? "rgba(255,214,102,.45)" : "rgba(255,105,120,.45)") + ";background:rgba(255,255,255,.03)";
                d.innerHTML = "<strong>" + names[i] + ":</strong> " + F.esc(row);
                list.appendChild(d);
            });

            out(root, "verdict", c.v);
            seen[state.pick] = true;

            if (Object.keys(seen).length >= 4) { F.reward("qc-candidates", 10, "You tested qubit candidates against the checklist"); }

            root.querySelectorAll("button[data-set]").forEach(function (b) { b.classList.toggle("on", b.dataset.set === "pick:" + state.pick); });
        }

        root.querySelectorAll("button[data-set]").forEach(function (b) {

            b.addEventListener("click", function () { state.pick = b.dataset.set.split(":")[1]; render(); });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () { state.pick = "switch"; render(); });

        render();
    };


    SIMS["qc-reset"] = stepper({
        title: "Explore: two ways to start every qubit at 0",
        viewBox: "0 0 340 150",
        aria: "A qubit drawn as a ball in a two-level well, relaxing to the bottom level or being measured and flipped.",
        interval: 6.5,
        steps: [
            { t: "Passive reset: wait", text: "In a cold chip, an excited qubit eventually gives its energy to the surroundings and drops to 0. But waiting takes several T₁ times, which wastes time." },
            { t: "It only works if it's cold", text: "If the chip were warm, heat would kick qubits back up to 1 at random. At about 10 millikelvin, almost every qubit settles in 0." },
            { t: "Active reset: measure", text: "Faster: measure the qubit right away. You learn whether it is 0 or 1." },
            { t: "…then flip if needed", text: "If it read 1, send a quick pulse that flips it to 0. Fast electronics do this within a microsecond, so the next calculation can start sooner." }
        ],
        rewardKey: "qc-reset",
        rewardMsg: "You learned how qubits are reset",
        draw: function (step, st) {

            let s = '<line x1="70" y1="40" x2="150" y2="40" style="stroke:#ffd666;stroke-width:2"/><text x="60" y="44" text-anchor="end" style="font-size:9px;fill:#ffd666">|1⟩</text>';

            s += '<line x1="70" y1="110" x2="150" y2="110" style="stroke:#54e0c7;stroke-width:2"/><text x="60" y="114" text-anchor="end" style="font-size:9px;fill:#54e0c7">|0⟩</text>';

            const k = (st.anim * 0.5) % 1;
            let y = 32;

            if (step === 0) { y = 32 + Math.min(1, k * 1.4) * 70; }
            if (step === 1) { y = 102 - (Math.sin(st.anim * 6) > 0.97 ? 20 : 0); }
            if (step === 2) { y = 32; }
            if (step === 3) { y = k < 0.4 ? 32 : 102; }

            s += '<circle cx="110" cy="' + y + '" r="7" style="fill:#be96ff"/>';

            if (step === 1) { s += '<text x="240" y="70" text-anchor="middle" style="font-size:9px;fill:#78b4ff">❄ about 10 mK</text>'; }
            if (step >= 2) { s += '<rect x="200" y="50" width="80" height="44" rx="6" style="fill:rgba(255,105,120,.15);stroke:#ff6978"/><text x="240" y="70" text-anchor="middle" style="font-size:8px;fill:#f5f7ff">measure</text><text x="240" y="84" text-anchor="middle" style="font-size:8px;fill:#f5f7ff">' + (step === 3 ? "read 1 → flip" : "read 1") + "</text>"; }

            return s;
        }
    });


    const PLATFORM_TIMES = [
        { n: "Superconducting", t2: 100, gate: 0.05, c: TEAL },
        { n: "Silicon spin", t2: 100, gate: 0.2, c: BLUE },
        { n: "Trapped ion", t2: 1e6, gate: 50, c: GOLD },
        { n: "Neutral atom", t2: 1e6, gate: 0.5, c: PURPLE }
    ];

    make("qc-ratio", {
        title: "Try it: how many gates before the qubit forgets?",
        w: 680, h: 230,
        aria: "A timeline compares how long a qubit stays coherent with how long one gate takes, and counts how many gates fit.",
        defaults: { t2: 2, gate: -1.3 },
        sliders: [["Coherence time T₂", "t2", -1, 6.5, 0.1, function (v) { return fmtTime(Math.pow(10, v)); }], ["Time for one gate", "gate", -2, 3, 0.1, function (v) { return fmtTime(Math.pow(10, v)); }]],
        stats: [["Gates per coherence time", "n"], ["Good enough?", "ok"]],
        formula: "What matters is the ratio: how many gates fit inside the coherence time. Superconducting qubits are short-lived but very fast; trapped ions live for seconds but their gates are slower. Rough typical values are marked; real chips vary a lot.",
        read: function (s) {

            const n = Math.pow(10, s.t2 - s.gate);

            return {
                n: n >= 1e4 ? "about 10" + sup(Math.round(Math.log10(n))) : Math.round(n).toLocaleString("en-US"),
                ok: n >= 1000 ? "Yes, useful" : n >= 100 ? "Marginal" : "No",
                verdict: n >= 1000 ? "Thousands of gates fit: enough to try error correction" : "Too few gates before the qubit decoheres"
            };
        },
        reward: { when: function (s) { return Math.pow(10, s.t2 - s.gate) >= 1000; }, msg: "You found a qubit that can run thousands of gates" },
        draw: function (ctx, s) {

            const L = 40;
            const R = 650;
            const X = function (lg) { return L + (R - L) * (lg + 2) / 8.5; };

            line(ctx, L, 180, R, 180, GREY + ".6)", 1);

            [-2, 0, 2, 4, 6].forEach(function (k) { line(ctx, X(k), 176, X(k), 184, GREY + ".8)", 1); txt(ctx, fmtTime(Math.pow(10, k)), X(k), 200, 11, GREY + ".9)"); });

            txt(ctx, "time (log scale)", (L + R) / 2, 220, 11, GREY + ".8)");

            PLATFORM_TIMES.forEach(function (p, i) {

                const y = 34 + i * 26;

                line(ctx, X(Math.log10(p.gate)), y, X(Math.log10(p.t2)), y, p.c + ".7)", 6);
                txt(ctx, p.n, X(Math.log10(p.gate)) - 6, y + 4, 11, p.c + "1)", "right", true);
            });

            line(ctx, X(s.gate), 140, X(s.t2), 140, GOLD + "1)", 8);
            dot(ctx, X(s.gate), 140, 5, ROSE + "1)");
            txt(ctx, "one gate", X(s.gate), 160, 11, ROSE + "1)");
            txt(ctx, "T₂", X(s.t2), 160, 12, GOLD + "1)", "center", true);
            txt(ctx, "typical ranges: gate time → coherence time", R, 18, 11, GREY + ".9)", "right");
        }
    });

    // Time in microseconds to a readable string.
    function fmtTime(us) {

        if (us < 1) { return Math.round(us * 1000) + " ns"; }
        if (us < 1000) { return (us < 10 ? us.toFixed(1) : Math.round(us)) + " µs"; }
        if (us < 1e6) { return (us < 1e4 ? (us / 1000).toFixed(1) : Math.round(us / 1000)) + " ms"; }

        return (us < 1e7 ? (us / 1e6).toFixed(1) : Math.round(us / 1e6)) + " s";
    }


    /* ======================================
       UNIT 10: ENERGY LEVELS
    ====================================== */

    make("qc-atomlevels", {
        title: "Try it: light is absorbed only at the right colour",
        w: 680, h: 250,
        aria: "An atom with three energy levels. Photons of the chosen energy fly in; they are absorbed only when their energy matches a gap between levels.",
        defaults: { e: 3 },
        sliders: [["Photon energy (arbitrary units)", "e", 1, 8, 0.1]],
        stats: [["Absorbed", "a"], ["Passed straight through", "p"]],
        animated: true,
        liveRead: true,
        formula: "Quantum systems only have certain energy levels. A photon with energy E = hf is absorbed only if E matches the gap between two levels. Here the gaps are 3 (bottom to middle), 2 (middle to top) and 5 (bottom to top). That selectivity is what lets us address one transition of a qubit and ignore the rest.",
        init: function (s, d) { d.ph = []; d.t = 0; d.a = 0; d.p = 0; d.lvl = 0; d.decay = 0; },
        onChange: function (s, d) { d.a = 0; d.p = 0; },
        step: function (dt, s, d) {

            d.t += dt;

            if (d.t > 0.7) { d.t = 0; d.ph.push({ x: 40 }); }

            d.ph.forEach(function (p) { p.x += dt * 260; });

            d.ph = d.ph.filter(function (p) {

                if (p.x >= 330 && !p.done) {

                    p.done = true;

                    const gaps = d.lvl === 0 ? [3, 5] : d.lvl === 1 ? [2] : [];
                    const hitGap = gaps.filter(function (g) { return Math.abs(s.e - g) < 0.15; })[0];

                    if (hitGap) { d.a++; d.lvl = d.lvl === 0 ? (hitGap === 3 ? 1 : 2) : 2; d.decay = 1.2; return false; }

                    d.p++;
                }

                return p.x < 680;
            });

            if (d.decay > 0) { d.decay -= dt; if (d.decay <= 0) { d.lvl = 0; } }
        },
        read: function (s, d) {

            const match = [3, 5, 2].filter(function (g) { return Math.abs(s.e - g) < 0.15; });

            return {
                a: String(d.a),
                p: String(d.p),
                verdict: match.length ? "Matches a gap: the atom absorbs it and jumps up" : "No matching gap: the photon passes through"
            };
        },
        reward: { when: function (s, d) { return d.a >= 3; }, msg: "You tuned light to an atomic transition" },
        draw: function (ctx, s, d) {

            const levels = [[0, 200, TEAL, "E₀"], [3, 120, GOLD, "E₁"], [5, 66, ROSE, "E₂"]];

            levels.forEach(function (l) {

                line(ctx, 300, l[1], 420, l[1], l[2] + "1)", 3);
                txt(ctx, l[3] + " = " + l[0], 430, l[1] + 4, 12, l[2] + "1)", "left", true);
            });

            dot(ctx, 360, levels[d.lvl][1] - 8, 7, PURPLE + "1)");

            const hue = clamp((s.e - 1) / 7, 0, 1);
            const col = "hsla(" + Math.round(10 + hue * 250) + ",90%,62%,";

            d.ph.forEach(function (p) {

                if (p.x > 330) { return; }

                ctx.strokeStyle = col + "1)";
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let k = -18; k <= 18; k += 2) { const yy = 140 + Math.sin(k * s.e * 0.35) * 6; if (k === -18) { ctx.moveTo(p.x + k, yy); } else { ctx.lineTo(p.x + k, yy); } }

                ctx.stroke();
            });

            txt(ctx, "photon energy " + s.e.toFixed(1), 120, 110, 13, col + "1)", "center", true);
            txt(ctx, "gaps: 3, 2 and 5", 360, 240, 12, GREY + ".9)");
        }
    });


    make("qc-levels", {
        title: "Try it: why a qubit needs uneven energy levels",
        w: 680, h: 270,
        aria: "Energy ladders for a plain circuit with equal spacing and for a transmon with shrinking spacing. Arrows light up where the drive frequency matches a step.",
        defaults: { kind: "harm", f: 5 },
        segs: [["Circuit", "kind", [["harm", "Plain LC circuit (even steps)"], ["trans", "Transmon (uneven steps)"]]]],
        sliders: [["Microwave drive frequency", "f", 4, 5.6, 0.01, function (v) { return v.toFixed(2) + " GHz"; }]],
        stats: [["Steps the drive excites", "hit"]],
        formula: "A plain capacitor-inductor circuit has evenly spaced levels, so a pulse that drives 0→1 also drives 1→2, 2→3 and so on: you can't keep it to two levels. The transmon's Josephson junction makes each step a little smaller (here 5.00, 4.75, 4.50 GHz). Drive at exactly 5.00 GHz and only 0↔1 responds: a clean qubit.",
        read: function (s) {

            const gaps = s.kind === "harm" ? [5, 5, 5] : [5, 4.75, 4.5];
            const hit = gaps.map(function (g, i) { return Math.abs(s.f - g) < 0.04 ? i : -1; }).filter(function (i) { return i >= 0; });

            return {
                hit: hit.length ? hit.map(function (i) { return i + "→" + (i + 1); }).join(", ") : "none",
                verdict: hit.length === 0 ? "Off resonance: nothing happens" : hit.length === 1 && hit[0] === 0 ? "Only 0↔1 responds: a working qubit" : hit.length > 1 ? "Every step responds: the circuit climbs the ladder, no qubit" : "You're driving a higher step, not the qubit"
            };
        },
        reward: { when: function (s) { return s.kind === "trans" && Math.abs(s.f - 5) < 0.04; }, msg: "You isolated a transmon's 0↔1 transition" },
        draw: function (ctx, s) {

            const gaps = s.kind === "harm" ? [5, 5, 5] : [5, 4.75, 4.5];
            const B = 235;
            const sc = 13;
            let y = B;
            const ys = [B];

            gaps.forEach(function (g) { y -= g * sc * 0.65 + 8; ys.push(y); });

            ys.forEach(function (yy, i) {

                line(ctx, 220, yy, 380, yy, (i === 0 ? TEAL : i === 1 ? GOLD : GREY) + "1)", 3);
                txt(ctx, "|" + i + "⟩", 210, yy + 4, 13, TEXT + ".9)", "right", true);
            });

            gaps.forEach(function (g, i) {

                const on = Math.abs(s.f - g) < 0.04;
                const x = 260 + i * 40;

                arrow(ctx, x, ys[i] - 2, x, ys[i + 1] + 4, on ? ROSE + "1)" : GREY + ".35)", on ? 3.5 : 2);
                txt(ctx, g.toFixed(2) + " GHz", 400, (ys[i] + ys[i + 1]) / 2 + 4, 12, on ? ROSE + "1)" : GREY + ".9)", "left", on);
            });

            txt(ctx, "drive: " + s.f.toFixed(2) + " GHz", 560, 60, 14, GOLD + "1)", "center", true);

            ctx.strokeStyle = GOLD + ".8)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let x = 500; x <= 620; x += 2) { const yy = 90 + Math.sin((x - 500) * s.f * 0.06) * 10; if (x === 500) { ctx.moveTo(x, yy); } else { ctx.lineTo(x, yy); } }

            ctx.stroke();
        }
    });


    const BANDS = [
        { lg: 9.39, n: "Wi-Fi (2.4 GHz)", c: GREY },
        { lg: 9.7, n: "Superconducting qubits (4–8 GHz)", c: TEAL },
        { lg: 10.1, n: "Ion qubit clock transition (12.6 GHz)", c: GOLD },
        { lg: 10.4, n: "Silicon spin qubits (10–40 GHz)", c: BLUE },
        { lg: 14.7, n: "Visible light / lasers for ions and atoms", c: ROSE }
    ];

    make("qc-spectrum", {
        title: "Try it: which frequencies do qubits use?",
        w: 680, h: 240,
        aria: "A logarithmic frequency ruler from radio waves to visible light, with the bands used by different qubits marked, and a cursor for the chosen frequency.",
        defaults: { lg: 9.7 },
        sliders: [["Frequency", "lg", 6, 15.5, 0.05, function (v) { return fmtFreq(Math.pow(10, v)); }]],
        stats: [["Photon energy", "e"], ["Equivalent temperature hf/k", "t"]],
        formula: "Superconducting and spin qubits are controlled with microwaves, the same band as Wi-Fi and phones, which is why chip-industry RF engineering matters so much. Each photon's energy is E = hf. Dividing by Boltzmann's constant gives the temperature at which heat would have the same energy: for a 5 GHz qubit only about 0.24 K, so the chip must be far colder than that.",
        read: function (s) {

            const f = Math.pow(10, s.lg);
            const E = H_PLANCK * f;
            const T = E / K_B;
            const near = BANDS.filter(function (b) { return Math.abs(b.lg - s.lg) < 0.25; })[0];

            return {
                e: (E / 1.602e-19 * 1e6).toPrecision(3) + " µeV",
                t: T < 1 ? (T * 1000).toPrecision(3) + " mK" : T.toPrecision(3) + " K",
                verdict: near ? near.n : "No qubit lives here"
            };
        },
        reward: { when: function (s) { return Math.abs(s.lg - 9.7) < 0.2; }, msg: "You found the superconducting qubit band" },
        draw: function (ctx, s) {

            const L = 30;
            const R = 650;
            const X = function (lg) { return L + (R - L) * (lg - 6) / 9.5; };
            const g = ctx.createLinearGradient(L, 0, R, 0);

            g.addColorStop(0, "rgba(120,180,255,.25)");
            g.addColorStop(0.8, "rgba(190,150,255,.35)");
            g.addColorStop(0.95, "rgba(255,120,120,.6)");
            g.addColorStop(1, "rgba(160,120,255,.6)");
            box(ctx, L, 150, R - L, 24, g);

            [6, 9, 12, 15].forEach(function (k) { txt(ctx, fmtFreq(Math.pow(10, k)), X(k), 196, 11, GREY + ".9)"); line(ctx, X(k), 174, X(k), 182, GREY + ".8)", 1); });

            txt(ctx, "radio", X(7), 164, 11, TEXT + ".8)");
            txt(ctx, "microwave", X(10), 164, 11, TEXT + ".8)");
            txt(ctx, "infrared", X(13), 164, 11, TEXT + ".8)");
            txt(ctx, "light", X(14.75), 214, 11, TEXT + ".8)");

            BANDS.forEach(function (b, i) {

                const x = X(b.lg);
                const y = 40 + (i % 3) * 30;

                line(ctx, x, y + 6, x, 150, b.c + ".8)", 1.5, [3, 3]);
                txt(ctx, b.n, x, y, 11, b.c + "1)", i === 4 ? "right" : "center", true);
            });

            line(ctx, X(s.lg), 140, X(s.lg), 184, GOLD + "1)", 3);
            dot(ctx, X(s.lg), 140, 6, GOLD + "1)");
        }
    });

    function fmtFreq(f) {

        const u = [[1e15, "PHz"], [1e12, "THz"], [1e9, "GHz"], [1e6, "MHz"], [1e3, "kHz"]];

        for (let i = 0; i < u.length; i++) { if (f >= u[i][0]) { const v = f / u[i][0]; return (v >= 100 ? Math.round(v) : v.toPrecision(2)) + " " + u[i][1]; } }

        return Math.round(f) + " Hz";
    }


    make("qc-thermal", {
        title: "Try it: how cold must a qubit be?",
        w: 680, h: 240,
        aria: "A thermometer from 1 millikelvin to room temperature, and a bar showing the chance heat has kicked the qubit into its excited state.",
        defaults: { lgT: 2.48, f: 5 },
        sliders: [["Temperature", "lgT", -2.3, 2.48, 0.02, function (v) { const T = Math.pow(10, v); return T < 1 ? (T * 1000).toPrecision(3) + " mK" : T.toPrecision(3) + " K"; }], ["Qubit frequency", "f", 1, 15, 0.5, function (v) { return v + " GHz"; }]],
        stats: [["Chance of a heat-flipped qubit", "p"], ["hf / kT", "x"]],
        formula: "Heat randomly excites a qubit with probability about e^(−hf/kT) / (1 + e^(−hf/kT)). At room temperature a 5 GHz qubit is almost 50/50, which is useless. At 10 millikelvin, in a dilution refrigerator, the chance is about 10⁻¹¹. That is why superconducting quantum computers live in fridges colder than outer space (2.7 K).",
        read: function (s) {

            const T = Math.pow(10, s.lgT);
            const x = H_PLANCK * s.f * 1e9 / (K_B * T);
            const p = Math.exp(-x) / (1 + Math.exp(-x));

            return {
                p: p < 1e-4 ? "about 10" + sup(Math.floor(Math.log10(Math.max(p, 1e-300)))) : (p * 100).toPrecision(3) + "%",
                x: x.toPrecision(3),
                verdict: p < 1e-3 ? "Cold enough: the qubit sits in 0" : p < 0.05 ? "Marginal: some qubits are flipped by heat" : "Far too warm: heat scrambles the qubit"
            };
        },
        reward: { when: function (s) { return Math.pow(10, s.lgT) <= 0.02; }, msg: "You cooled a qubit into the millikelvin range" },
        draw: function (ctx, s) {

            const T = Math.pow(10, s.lgT);
            const x = H_PLANCK * s.f * 1e9 / (K_B * T);
            const p = Math.exp(-x) / (1 + Math.exp(-x));
            const L = 60;
            const R = 420;
            const X = function (lg) { return L + (R - L) * (lg + 2.3) / 4.78; };

            box(ctx, L, 100, R - L, 18, "rgba(255,255,255,.06)", GREY + ".4)");
            box(ctx, L, 100, X(s.lgT) - L, 18, (p < 1e-3 ? BLUE : ROSE) + ".7)");

            [[-2, "10 mK (fridge)"], [0.43, "2.7 K (space)"], [1.89, "77 K (liquid N₂)"], [2.48, "300 K (room)"]].forEach(function (m) {

                line(ctx, X(m[0]), 92, X(m[0]), 126, GREY + ".8)", 1);
                txt(ctx, m[1], X(m[0]), 140, 10.5, GREY + "1)");
            });

            txt(ctx, "temperature (log)", (L + R) / 2, 80, 11, GREY + ".8)");

            const hb = clamp(p * 2, 0, 1) * 160;

            box(ctx, 520, 40, 60, 160, null, GREY + ".4)");
            box(ctx, 520, 200 - Math.max(hb, 1), 60, Math.max(hb, 1), ROSE + ".8)");
            txt(ctx, "excited by heat", 550, 220, 12, TEXT + ".9)");
            txt(ctx, "50%", 590, 46, 10, GREY + ".9)", "left");
        }
    });


    make("qc-rabi", {
        title: "Try it: drive a qubit and watch it oscillate",
        w: 680, h: 250,
        aria: "A graph of the probability of finding the qubit in 1 over time while a microwave drive is on, oscillating between 0 and 1.",
        defaults: { fr: 10, det: 0 },
        sliders: [["Drive strength (Rabi frequency)", "fr", 2, 40, 1, function (v) { return v + " MHz"; }], ["Detuning from the qubit", "det", -40, 40, 1, function (v) { return v + " MHz"; }]],
        stats: [["π-pulse length (0 → 1)", "pi"], ["Highest chance of 1", "max"]],
        animated: true,
        formula: "A resonant microwave drive rotates the qubit back and forth between 0 and 1: Rabi oscillations. A pulse that lasts half a cycle (a π pulse) flips 0 into 1; this is the quantum NOT gate. Drive off-resonance and the oscillation gets faster but never reaches 1, which is why every qubit's frequency must be measured precisely.",
        read: function (s) {

            const W = Math.hypot(s.fr, s.det);

            return {
                pi: Math.round(1000 / (2 * s.fr)) + " ns",
                max: Math.round(s.fr * s.fr / (W * W) * 100) + "%",
                verdict: Math.abs(s.det) < 1 ? "On resonance: full flips between 0 and 1" : "Detuned: the qubit never fully reaches 1"
            };
        },
        reward: { when: function (s) { return s.det === 0 && s.fr >= 20; }, msg: "You drove fast, full Rabi oscillations" },
        draw: function (ctx, s, d, t) {

            const L = 60;
            const R = 650;
            const B = 210;
            const T = 30;
            const tmax = 300;
            const W = Math.hypot(s.fr, s.det);
            const P = function (tn) { return s.fr * s.fr / (W * W) * Math.pow(Math.sin(Math.PI * W * 1e-3 * tn), 2); };

            line(ctx, L, B, R, B, GREY + ".6)", 1);
            line(ctx, L, B, L, T, GREY + ".6)", 1);
            txt(ctx, "P(1)", L - 8, T + 6, 11, GREY + ".9)", "right");
            txt(ctx, "1", L - 8, T + 4 + 10, 10, GREY + ".9)", "right");
            txt(ctx, "time (ns)", R, B + 22, 11, GREY + ".9)", "right");

            [0, 100, 200, 300].forEach(function (k) { txt(ctx, String(k), L + (R - L) * k / tmax, B + 14, 10, GREY + ".9)"); });

            ctx.strokeStyle = TEAL + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let x = L; x <= R; x += 2) { const tn = (x - L) / (R - L) * tmax; const y = B - (B - T) * P(tn); if (x === L) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } }

            ctx.stroke();

            const tn = (t * 60) % tmax;
            const xn = L + (R - L) * tn / tmax;

            dot(ctx, xn, B - (B - T) * P(tn), 6, GOLD + "1)");

            const xpi = L + (R - L) * (500 / s.fr) / tmax;

            if (xpi < R) { line(ctx, xpi, T, xpi, B, ROSE + ".8)", 1.5, [4, 4]); txt(ctx, "π pulse", xpi + 4, T + 12, 11, ROSE + "1)", "left", true); }
        }
    });


    /* ======================================
       UNIT 11: COHERENCE
    ====================================== */

    make("qc-t1", {
        title: "Try it: watch excited qubits decay (T₁)",
        w: 680, h: 250,
        aria: "A grid of 100 qubits, each either excited or relaxed, and a graph of the fraction still excited over time.",
        defaults: { t1: 100 },
        sliders: [["Energy lifetime T₁", "t1", 10, 400, 5, function (v) { return v + " µs"; }]],
        actions: [["go", "Excite all 100 and wait"]],
        stats: [["Still excited", "left"], ["Time elapsed", "time"]],
        animated: true,
        liveRead: true,
        formula: "An excited qubit gives its energy to the surroundings at random moments. Across many qubits (or many repeats) the fraction still excited falls as e^(−t/T₁): after one T₁, about 37% remain. Superconducting qubits today reach T₁ of hundreds of microseconds; the best materials push towards a millisecond.",
        init: function (s, d) { d.q = []; d.t = 0; d.run = false; d.hist = []; d.rand = mulberry(5); for (let i = 0; i < 100; i++) { d.q.push(0); } },
        act: function (id, s, d) { d.q = d.q.map(function () { return 1; }); d.t = 0; d.run = true; d.hist = [[0, 1]]; d.done = false; },
        onChange: function (s, d) { d.run = false; },
        step: function (dt, s, d) {

            if (!d.run) { return; }

            const us = dt * 120;

            d.t += us;
            d.q = d.q.map(function (v) { return v && d.rand() < us / s.t1 ? 0 : v; });

            const f = d.q.filter(Boolean).length / 100;

            d.hist.push([d.t, f]);

            if (d.t > s.t1 * 4) { d.run = false; d.done = true; }
        },
        read: function (s, d) {

            const n = d.q.filter(Boolean).length;

            return {
                left: n + " of 100",
                time: Math.round(d.t) + " µs",
                verdict: d.run ? "Decaying…" : d.done ? "After one T₁ (" + s.t1 + " µs) about 37 of 100 were left" : "Press the button to excite every qubit"
            };
        },
        reward: { when: function (s, d) { return d.done; }, msg: "You watched T₁ decay happen" },
        draw: function (ctx, s, d) {

            for (let i = 0; i < 100; i++) { dot(ctx, 40 + (i % 10) * 20, 40 + Math.floor(i / 10) * 20, 7, d.q[i] ? GOLD + ".95)" : TEAL + ".35)"); }

            txt(ctx, "gold: excited (1) · teal: relaxed (0)", 130, 245, 11, GREY + ".9)");

            const L = 290;
            const R = 660;
            const B = 210;
            const T = 30;
            const tmax = s.t1 * 4;

            line(ctx, L, B, R, B, GREY + ".6)", 1);
            line(ctx, L, B, L, T, GREY + ".6)", 1);

            ctx.strokeStyle = PURPLE + ".7)";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();

            for (let x = L; x <= R; x += 3) { const tt = (x - L) / (R - L) * tmax; const y = B - (B - T) * Math.exp(-tt / s.t1); if (x === L) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } }

            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            d.hist.forEach(function (h, i) { const x = L + (R - L) * h[0] / tmax; const y = B - (B - T) * h[1]; if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } });
            ctx.stroke();

            const x1 = L + (R - L) / 4;

            line(ctx, x1, T, x1, B, ROSE + ".7)", 1.5, [3, 3]);
            txt(ctx, "t = T₁ (37%)", x1 + 4, T + 12, 11, ROSE + "1)", "left");
            txt(ctx, "fraction still excited", L + 4, T - 8, 11, GREY + ".9)", "left");
            txt(ctx, "dashed: e^(−t/T₁)", R, B + 22, 11, PURPLE + "1)", "right");
        }
    });


    function spinArrows(ctx, cx, cy, R, angles, col) {

        ctx.strokeStyle = GREY + ".4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();

        angles.forEach(function (a) { line(ctx, cx, cy, cx + Math.cos(a) * R * 0.95, cy - Math.sin(a) * R * 0.95, col, 1.2); });

        let sx = 0;
        let sy = 0;

        angles.forEach(function (a) { sx += Math.cos(a); sy += Math.sin(a); });

        sx /= angles.length;
        sy /= angles.length;

        arrow(ctx, cx, cy, cx + sx * R, cy - sy * R, GOLD + "1)", 3.5);

        return Math.hypot(sx, sy);
    }

    make("qc-dephase", {
        title: "Try it: losing the phase (T₂)",
        w: 680, h: 250,
        aria: "Many thin arrows on a circle, one per repeat of the experiment, spread out because each runs at a slightly different frequency. A thick arrow shows their average.",
        defaults: { noise: 1 },
        sliders: [["Frequency jitter", "noise", 0, 3, 0.05, function (v) { return v.toFixed(2) + " MHz"; }]],
        actions: [["go", "Start: put the qubit on the equator"]],
        stats: [["Average arrow length", "len"], ["Time", "time"]],
        animated: true,
        liveRead: true,
        formula: "A qubit on the equator keeps a phase, like a clock hand. If its frequency jitters (stray magnetic fields, charge noise, temperature drifts), each repeat of the experiment ticks at a slightly different rate. The hands fan out and their average shrinks: the phase information is lost even though no energy was. That decay time is T₂, which can never be more than 2T₁.",
        init: function (s, d) { d.det = []; d.t = 0; d.run = false; d.rand = mulberry(11); d.hist = []; for (let i = 0; i < 40; i++) { const u = d.rand() + d.rand() + d.rand() - 1.5; d.det.push(u); } },
        act: function (id, s, d) { d.t = 0; d.run = true; d.hist = []; },
        step: function (dt, s, d) { if (d.run) { d.t += dt * 0.6; if (d.t > 3) { d.run = false; d.done = true; } } },
        read: function (s, d) {

            const L = Math.hypot(d.det.reduce(function (a, u) { return a + Math.cos(2 * Math.PI * u * s.noise * d.t); }, 0), d.det.reduce(function (a, u) { return a + Math.sin(2 * Math.PI * u * s.noise * d.t); }, 0)) / d.det.length;

            return {
                len: L.toFixed(2),
                time: d.t.toFixed(2) + " µs",
                verdict: L > 0.9 ? "The arrows stay together: phase kept" : L > 0.4 ? "Fanning out: phase fading" : "Spread all round: phase lost"
            };
        },
        reward: { when: function (s, d) { return d.done && s.noise >= 1; }, msg: "You watched a qubit dephase" },
        draw: function (ctx, s, d) {

            const angles = d.det.map(function (u) { return 2 * Math.PI * u * s.noise * d.t; });
            const len = spinArrows(ctx, 160, 125, 95, angles, PURPLE + ".55)");

            if (d.run || d.hist.length === 0 || d.hist[d.hist.length - 1][0] !== d.t) { d.hist.push([d.t, len]); }

            const L = 320;
            const R = 660;
            const B = 210;
            const T = 30;

            line(ctx, L, B, R, B, GREY + ".6)", 1);
            line(ctx, L, B, L, T, GREY + ".6)", 1);
            txt(ctx, "average arrow length", L + 4, T - 8, 11, GREY + ".9)", "left");
            txt(ctx, "time (µs)", R, B + 22, 11, GREY + ".9)", "right");

            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            d.hist.forEach(function (h, i) { const x = L + (R - L) * h[0] / 3; const y = B - (B - T) * h[1]; if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } });
            ctx.stroke();
        }
    });


    make("qc-echo", {
        title: "Try it: the spin echo trick",
        w: 680, h: 250,
        aria: "Arrows fan out on a circle; a flip pulse halfway through makes them run backwards and line up again.",
        defaults: { kind: "slow" },
        segs: [["Noise type", "kind", [["slow", "Slow drift (each repeat steady)"], ["fast", "Fast flicker (keeps changing)"]]]],
        actions: [["go", "Run without echo"], ["echo", "Run with an echo pulse halfway"]],
        stats: [["Average arrow length at the end", "len"]],
        animated: true,
        liveRead: true,
        formula: "Halfway through, a π pulse flips every arrow to the other side of the circle, so the fast ones are now behind and the slow ones ahead. They keep ticking at the same rates and meet again at the end: the echo. It cancels slow, steady noise completely, but not noise that changes during the experiment. Repeating the trick many times (dynamical decoupling) stretches coherence further.",
        init: function (s, d) { d.det = []; d.rand = mulberry(23); for (let i = 0; i < 40; i++) { d.det.push(d.rand() + d.rand() + d.rand() - 1.5); } d.ph = d.det.map(function () { return 0; }); d.t = 0; d.run = false; d.echo = false; d.flipped = false; d.endLen = null; },
        act: function (id, s, d) { d.ph = d.det.map(function () { return 0; }); d.t = 0; d.run = true; d.echo = id === "echo"; d.flipped = false; d.endLen = null; },
        onChange: function (s, d) { d.run = false; d.ph = d.det.map(function () { return 0; }); d.t = 0; d.endLen = null; },
        step: function (dt, s, d) {

            if (!d.run) { return; }

            const T = 2;

            d.t += dt * 0.5;
            d.ph = d.ph.map(function (p, i) {

                const rate = s.kind === "slow" ? d.det[i] : d.det[i] + (d.rand() - 0.5) * 6;

                return p + 2 * Math.PI * rate * 0.6 * dt * 0.5;
            });

            if (d.echo && !d.flipped && d.t >= T / 2) { d.ph = d.ph.map(function (p) { return Math.PI - p; }); d.flipped = true; }

            if (d.t >= T) {

                d.run = false;

                const sx = d.ph.reduce(function (a, p) { return a + Math.cos(p); }, 0) / d.ph.length;
                const sy = d.ph.reduce(function (a, p) { return a + Math.sin(p); }, 0) / d.ph.length;

                d.endLen = Math.hypot(sx, sy);

                if (d.echo && s.kind === "slow" && d.endLen > 0.9) { d.win = true; }
            }
        },
        read: function (s, d) {

            return {
                len: d.endLen === null ? "—" : d.endLen.toFixed(2),
                verdict: d.run ? (d.flipped ? "Echo pulse applied: the arrows are running back together" : "Fanning out…") : d.endLen === null ? "Run it with and without the echo" : d.endLen > 0.9 ? "Refocused: the echo recovered the phase" : "The phase was lost"
            };
        },
        reward: { when: function (s, d) { return d.win; }, msg: "You refocused a qubit with a spin echo" },
        draw: function (ctx, s, d) {

            spinArrows(ctx, 340, 125, 100, d.ph, PURPLE + ".55)");

            if (d.flipped) { txt(ctx, "π pulse applied at the halfway point", 340, 245, 12, ROSE + "1)", "center", true); }

            txt(ctx, "t = " + d.t.toFixed(2) + " (of 2.00)", 600, 40, 12, GREY + "1)");
        }
    });


    SIMS["qc-noise-quiz"] = quiz(
        "Game: what steals coherence, and how do we fight it?",
        ["Defects in materials", "Heat", "Stray magnetic fields", "Radiation and cosmic rays", "Noisy control electronics"],
        [
            { q: "Tiny flaws in the oxides on a chip's surfaces soak up the qubit's energy.", a: "Defects in materials", why: "Two-level-system defects: fought with better materials and cleaner fabrication." },
            { q: "Fixed by running the chip in a dilution refrigerator at 10 millikelvin.", a: "Heat", why: "Cold removes thermal excitations." },
            { q: "Fixed with mu-metal shields and, in silicon, by using pure silicon-28.", a: "Stray magnetic fields", why: "Magnetic noise jiggles spin and flux-sensitive qubits." },
            { q: "Can hit a chip and briefly spoil many qubits at once; some labs go underground.", a: "Radiation and cosmic rays", why: "High-energy particles break Cooper pairs across the chip." },
            { q: "Filters and attenuators on every wire stop room-temperature noise reaching the qubit.", a: "Noisy control electronics", why: "Every control line is a path for noise." },
            { q: "The reason tantalum films improved superconducting qubit lifetimes.", a: "Defects in materials", why: "Tantalum's surface oxide has fewer lossy defects." }
        ],
        5,
        "qc-noise-quiz-done",
        "You know the enemies of coherence",
        "Materials, heat, magnetic fields, radiation and wiring: each one is an engineering problem.",
        "Defects, heat, magnetism, radiation, wiring. Hit Reset to try again."
    );


    const PLAT = {
        sc: { n: "Superconducting", t2: [50, 300], g: [0.02, 0.3], note: "Fast gates; coherence limited by surface defects." },
        si: { n: "Silicon spin", t2: [10, 1000], g: [0.05, 1], note: "Long-lived in silicon-28 (the upper end uses echo pulses); gates take tens of ns to a µs." },
        ion: { n: "Trapped ion", t2: [1e5, 1e7], g: [10, 200], note: "Coherence of seconds or more; gates are microseconds or slower." },
        atom: { n: "Neutral atom", t2: [1e5, 1e6], g: [0.2, 1], note: "Long-lived atoms; fast Rydberg gates, but atoms can be lost." }
    };

    make("qc-coherence", {
        title: "Try it: coherence across platforms",
        w: 680, h: 230,
        aria: "Bars on a logarithmic time axis show the range of gate times and coherence times for the selected qubit platform.",
        defaults: { p: "sc" },
        segs: [["Platform", "p", Object.keys(PLAT).map(function (k) { return [k, PLAT[k].n]; })]],
        stats: [["Typical coherence", "t2"], ["Typical gate time", "g"], ["Gates per coherence time", "n"]],
        formula: "These are rough, typical ranges from the research literature; the best devices do better and many do worse. What matters is the ratio, not either number alone. Photonic qubits are left out: photons barely decohere, but they get lost in waveguides and detectors.",
        read: function (s) {

            const p = PLAT[s.p];
            const lo = p.t2[0] / p.g[1];
            const hi = p.t2[1] / p.g[0];

            return {
                t2: fmtTime(p.t2[0]) + " – " + fmtTime(p.t2[1]),
                g: fmtTime(p.g[0]) + " – " + fmtTime(p.g[1]),
                n: "10" + sup(Math.round(Math.log10(lo))) + " – 10" + sup(Math.round(Math.log10(hi))),
                verdict: p.note
            };
        },
        draw: function (ctx, s) {

            const L = 40;
            const R = 650;
            const X = function (lg) { return L + (R - L) * (lg + 2) / 9.2; };
            const p = PLAT[s.p];

            line(ctx, L, 180, R, 180, GREY + ".6)", 1);

            [-2, 0, 2, 4, 6].forEach(function (k) { line(ctx, X(k), 176, X(k), 184, GREY + ".8)", 1); txt(ctx, fmtTime(Math.pow(10, k)), X(k), 200, 11, GREY + ".9)"); });

            box(ctx, X(Math.log10(p.g[0])), 60, X(Math.log10(p.g[1])) - X(Math.log10(p.g[0])), 30, ROSE + ".45)", ROSE + "1)");
            txt(ctx, "gate time", X(Math.log10(p.g[0])), 52, 12, ROSE + "1)", "left", true);
            box(ctx, X(Math.log10(p.t2[0])), 110, X(Math.log10(p.t2[1])) - X(Math.log10(p.t2[0])), 30, TEAL + ".45)", TEAL + "1)");
            txt(ctx, "coherence time", X(Math.log10(p.t2[0])), 102, 12, TEAL + "1)", "left", true);
            txt(ctx, "time (log scale)", (L + R) / 2, 222, 11, GREY + ".8)");
        }
    });


    /* ======================================
       UNIT 12: GATES AND FIDELITY
    ====================================== */

    // The six cardinal Bloch states as integer vectors [x, y, z].
    const CARD = [["|0⟩", [0, 0, 1]], ["|1⟩", [0, 0, -1]], ["|+⟩", [1, 0, 0]], ["|−⟩", [-1, 0, 0]], ["|+i⟩", [0, 1, 0]], ["|−i⟩", [0, -1, 0]]];

    const GATES = {
        X: function (v) { return [v[0], -v[1], -v[2]]; },
        Y: function (v) { return [-v[0], v[1], -v[2]]; },
        Z: function (v) { return [-v[0], -v[1], v[2]]; },
        H: function (v) { return [v[2], -v[1], v[0]]; },
        S: function (v) { return [-v[1], v[0], v[2]]; }
    };

    function cardName(v) {

        const c = CARD.filter(function (c) { return c[1][0] === v[0] && c[1][1] === v[1] && c[1][2] === v[2]; })[0];

        return c ? c[0] : "?";
    }

    // Draw a small Bloch sphere in 2D with the state and an optional target.
    function bloch2d(ctx, cx, cy, R, v, target, col) {

        const P = function (p) { return [cx + p[1] * R * 0.95 - p[0] * R * 0.38, cy - p[2] * R * 0.95 + p[0] * R * 0.3]; };

        ctx.strokeStyle = GREY + ".45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy, R, R * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();

        CARD.forEach(function (c) {

            const p = P(c[1]);

            dot(ctx, p[0], p[1], 3, GREY + ".8)");
            txt(ctx, c[0], p[0] + (c[1][1] > 0 ? 12 : c[1][1] < 0 ? -12 : 0) + (c[1][0] > 0 ? -10 : c[1][0] < 0 ? 10 : 0), p[1] + (c[1][2] > 0 ? -8 : c[1][2] < 0 ? 16 : (c[1][0] > 0 ? 16 : -8)), 11, GREY + "1)");
        });

        if (target) { const t = P(target); line(ctx, cx, cy, t[0], t[1], ROSE + ".8)", 3, [5, 4]); dot(ctx, t[0], t[1], 7, ROSE + ".5)"); }

        const p = P(v);

        arrow(ctx, cx, cy, p[0], p[1], col || GOLD + "1)", 3.5);
    }

    SIMS["qc-gatepuzzle"] = function (root) {

        const LEVELS = [
            { from: [0, 0, 1], to: [0, 0, -1] },
            { from: [0, 0, 1], to: [1, 0, 0] },
            { from: [0, 0, 1], to: [-1, 0, 0] },
            { from: [0, 0, 1], to: [0, 1, 0] },
            { from: [1, 0, 0], to: [0, 0, -1] },
            { from: [0, 0, 1], to: [0, -1, 0] }
        ];
        const best = [1, 1, 2, 2, 2, 3];
        const st = { lvl: 0, v: LEVELS[0].from.slice(), moves: 0, won: 0, solved: false };

        root.innerHTML = head("Game: steer the qubit to the target") +
            Q.canvasFor(680, 260, "A Bloch sphere with the qubit's state as a gold arrow and the target as a dashed red arrow.") +
            '<div class="fd-stat-row">' + stat("Level", "lvl") + stat("Moves", "mv") + stat("Fewest possible", "best") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play">' + ["X", "Y", "Z", "H", "S"].map(function (g) { return '<button type="button" class="fd-sim-btn" data-g="' + g + '">' + g + "</button>"; }).join("") +
            '<button type="button" class="fd-sim-btn" data-undo>Start level again</button><button type="button" class="fd-sim-btn" data-next>Next level →</button></div>' +
            '<p class="fd-sim-formula">X flips the qubit over the X axis (0 ↔ 1). Z rotates it half a turn about the vertical axis (changes the phase). H swaps the vertical and X axes (0 → +). S turns it a quarter turn about the vertical axis (+ → +i). Every quantum program is built from rotations like these.</p>';

        const ctx = root.querySelector("canvas").getContext("2d");

        function render() {

            const L = LEVELS[st.lvl];

            Q.clear(ctx, 680, 260);
            bloch2d(ctx, 340, 130, 100, st.v, L.to);
            txt(ctx, "from " + cardName(L.from) + " to " + cardName(L.to), 110, 40, 15, TEXT + "1)", "center", true);
            txt(ctx, "now: " + cardName(st.v), 110, 66, 13, GOLD + "1)", "center", true);
            out(root, "lvl", (st.lvl + 1) + " of " + LEVELS.length);
            out(root, "mv", String(st.moves));
            out(root, "best", String(best[st.lvl]));
            out(root, "verdict", st.solved ? (st.moves <= best[st.lvl] ? "Perfect! Solved in the fewest moves." : "Solved! Can you do it in " + best[st.lvl] + "?") : "Press gates to rotate the gold arrow onto the red one");
        }

        root.querySelectorAll("[data-g]").forEach(function (b) {

            b.addEventListener("click", function () {

                if (st.solved) { return; }

                st.v = GATES[b.dataset.g](st.v);
                st.moves++;

                const t = LEVELS[st.lvl].to;

                if (st.v[0] === t[0] && st.v[1] === t[1] && st.v[2] === t[2]) {

                    st.solved = true;
                    st.won++;

                    if (st.won >= 4) { F.reward("qc-gatepuzzle", 15, "You steered qubits with quantum gates"); }
                }

                render();
            });
        });

        const restart = function () { st.v = LEVELS[st.lvl].from.slice(); st.moves = 0; st.solved = false; render(); };

        root.querySelector("[data-undo]").addEventListener("click", restart);
        root.querySelector("[data-next]").addEventListener("click", function () { st.lvl = (st.lvl + 1) % LEVELS.length; restart(); });
        root.querySelector("[data-reset]").addEventListener("click", function () { st.lvl = 0; st.won = 0; restart(); });

        render();
    };


    const R2 = Math.SQRT1_2;

    make("qc-cnot", {
        title: "Try it: two-qubit gates",
        w: 680, h: 240,
        aria: "A circuit diagram with the chosen two-qubit gate, the inputs on the left and the resulting state on the right.",
        defaults: { g: "CNOT", a: "0", b: "0" },
        segs: [["Gate", "g", [["CNOT", "CNOT"], ["CZ", "CZ"], ["SWAP", "SWAP"]]], ["Input A", "a", [["0", "0"], ["1", "1"], ["+", "+ (blend)"]]], ["Input B", "b", [["0", "0"], ["1", "1"]]]],
        stats: [["Output state", "o"], ["Entangled?", "e"]],
        formula: "CNOT flips qubit B when A is 1. CZ flips the sign of |11⟩. SWAP exchanges the two qubits. With plain 0/1 inputs they act like classical logic. Feed in a blend and CNOT creates entanglement: (|00⟩ + |11⟩)/√2. One entangling gate plus single-qubit rotations is enough to build any quantum program.",
        read: function (s) {

            const v = cn(s);
            const names = ["00", "01", "10", "11"];
            const terms = v.map(function (a, i) { return Math.abs(a) > 1e-6 ? (a < 0 ? "−" : "+") + (Math.abs(Math.abs(a) - 1) < 1e-6 ? "" : "0.71") + "|" + names[i] + "⟩" : ""; }).filter(Boolean).join(" ");
            const c = 2 * Math.abs(v[0] * v[3] - v[1] * v[2]);

            return {
                o: terms.replace(/^\+/, ""),
                e: c > 0.01 ? "Yes" : "No",
                verdict: c > 0.99 ? "Entangled: neither qubit has its own state" : s.a === "+" ? "No entanglement from this gate and input" : "Classical inputs in, classical outputs out"
            };
        },
        reward: { when: function (s) { const v = cn(s); return 2 * Math.abs(v[0] * v[3] - v[1] * v[2]) > 0.99; }, msg: "You entangled two qubits with a gate" },
        draw: function (ctx, s) {

            const yA = 80;
            const yB = 160;

            txt(ctx, "A = " + (s.a === "+" ? "+" : s.a), 60, yA + 5, 15, TEXT + "1)", "center", true);
            txt(ctx, "B = " + s.b, 60, yB + 5, 15, TEXT + "1)", "center", true);
            line(ctx, 100, yA, 560, yA, GREY + ".8)", 2);
            line(ctx, 100, yB, 560, yB, GREY + ".8)", 2);

            if (s.g === "CNOT") { dot(ctx, 330, yA, 7, GOLD + "1)"); line(ctx, 330, yA, 330, yB + 14, GOLD + "1)", 2); ctx.strokeStyle = GOLD + "1)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(330, yB, 14, 0, Math.PI * 2); ctx.stroke(); line(ctx, 316, yB, 344, yB, GOLD + "1)", 2); }
            if (s.g === "CZ") { dot(ctx, 330, yA, 7, GOLD + "1)"); dot(ctx, 330, yB, 7, GOLD + "1)"); line(ctx, 330, yA, 330, yB, GOLD + "1)", 2); }
            if (s.g === "SWAP") { [yA, yB].forEach(function (y) { line(ctx, 320, y - 9, 340, y + 9, GOLD + "1)", 3); line(ctx, 320, y + 9, 340, y - 9, GOLD + "1)", 3); }); line(ctx, 330, yA, 330, yB, GOLD + "1)", 2); }

            txt(ctx, s.g, 330, 40, 15, GOLD + "1)", "center", true);
        }
    });

    function cn(s) {

        const a = s.a === "+" ? [R2, R2] : s.a === "1" ? [0, 1] : [1, 0];
        const b = s.b === "1" ? [0, 1] : [1, 0];
        let v = [a[0] * b[0], a[0] * b[1], a[1] * b[0], a[1] * b[1]];

        if (s.g === "CNOT") { v = [v[0], v[1], v[3], v[2]]; }
        if (s.g === "CZ") { v = [v[0], v[1], v[2], -v[3]]; }
        if (s.g === "SWAP") { v = [v[0], v[2], v[1], v[3]]; }

        return v;
    }


    make("qc-fidelity", {
        title: "Try it: why 99.9% isn't good enough",
        w: 680, h: 240,
        aria: "A graph of the chance a whole calculation runs without error against the number of gates, for the chosen gate fidelity.",
        defaults: { f: 99.5, lgN: 3 },
        sliders: [["Gate fidelity", "f", 99, 99.99, 0.01, function (v) { return v.toFixed(2) + "%"; }], ["Number of gates", "lgN", 1, 6, 0.05, function (v) { return Math.round(Math.pow(10, v)).toLocaleString("en-US"); }]],
        stats: [["Chance of no error at all", "p"], ["Gates before odds drop to 50%", "half"]],
        formula: "If each gate works with fidelity F, a whole circuit of N gates runs cleanly with probability about Fᴺ. At 99.9%, a thousand gates leaves only about a 37% chance. Useful algorithms need millions or billions of operations, so no physical qubit is good enough on its own: that is why we need error correction.",
        read: function (s) {

            const F1 = s.f / 100;
            const N = Math.pow(10, s.lgN);
            const p = Math.pow(F1, N);

            return {
                p: p < 1e-4 ? "about 10" + sup(Math.floor(Math.log10(Math.max(p, 1e-300)))) : (p * 100).toPrecision(3) + "%",
                half: Math.round(Math.log(0.5) / Math.log(F1)).toLocaleString("en-US"),
                verdict: p > 0.9 ? "Likely to run cleanly" : p > 0.1 ? "A coin toss: errors are likely" : "Almost certainly ruined by errors"
            };
        },
        reward: { when: function (s) { return s.f >= 99.9 && s.lgN >= 3; }, msg: "You saw why even 99.9% fidelity needs error correction" },
        draw: function (ctx, s) {

            const L = 60;
            const R = 650;
            const B = 200;
            const T = 30;
            const F1 = s.f / 100;
            const X = function (lg) { return L + (R - L) * (lg - 1) / 5; };

            line(ctx, L, B, R, B, GREY + ".6)", 1);
            line(ctx, L, B, L, T, GREY + ".6)", 1);

            [1, 2, 3, 4, 5, 6].forEach(function (k) { txt(ctx, Math.pow(10, k).toLocaleString("en-US"), X(k), B + 16, 10, GREY + ".9)"); });

            txt(ctx, "number of gates (log)", R, B + 34, 11, GREY + ".9)", "right");
            txt(ctx, "chance of no error", L + 4, T - 10, 11, GREY + ".9)", "left");

            ctx.strokeStyle = TEAL + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let x = L; x <= R; x += 2) { const lg = 1 + (x - L) / (R - L) * 5; const y = B - (B - T) * Math.pow(F1, Math.pow(10, lg)); if (x === L) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } }

            ctx.stroke();

            const p = Math.pow(F1, Math.pow(10, s.lgN));

            dot(ctx, X(s.lgN), B - (B - T) * p, 7, GOLD + "1)");
            line(ctx, L, B - (B - T) * 0.5, R, B - (B - T) * 0.5, GREY + ".35)", 1, [4, 4]);
            txt(ctx, "50%", L + 4, B - (B - T) * 0.5 - 4, 10, GREY + ".9)", "left");
        }
    });


    make("qc-pulse", {
        title: "Try it: shaping a microwave pulse",
        w: 680, h: 250,
        aria: "On the left, the shape of the microwave pulse over time. On the right, its spectrum, with the qubit's 0→1 frequency and the unwanted 1→2 frequency marked.",
        defaults: { T: 10, shape: "square" },
        segs: [["Pulse shape", "shape", [["square", "Square (switched on and off)"], ["gauss", "Smooth (Gaussian)"]]]],
        sliders: [["Pulse length", "T", 4, 60, 1, function (v) { return v + " ns"; }]],
        stats: [["Drive strength at the 1→2 frequency", "leak"]],
        formula: "A transmon's 1→2 transition sits only about 250 MHz below its 0→1 transition. A short, sharp pulse spreads its energy over a wide range of frequencies and can kick the qubit out of its two levels (leakage). Smooth, slightly longer pulses keep their spectrum narrow. Real chips go further with pulse shapes like DRAG that cancel the leakage directly.",
        read: function (s) {

            const L = leak(s);

            return {
                leak: (L * 100).toPrecision(2) + "% of peak",
                verdict: L < 0.01 ? "Clean: almost no drive reaches the 1→2 transition" : L < 0.1 ? "Some leakage risk" : "Too sharp: the pulse also drives 1→2"
            };
        },
        reward: { when: function (s) { return s.shape === "gauss" && leak(s) < 0.01 && s.T <= 30; }, msg: "You shaped a fast pulse with little leakage" },
        draw: function (ctx, s) {

            const B = 200;

            line(ctx, 30, B, 300, B, GREY + ".6)", 1);
            txt(ctx, "pulse in time", 165, 30, 12, GREY + ".9)");

            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let x = 30; x <= 300; x += 1) {

                const t = (x - 165) / 135 * 60;
                const env = s.shape === "square" ? (Math.abs(t) <= s.T / 2 ? 1 : 0) : Math.exp(-Math.pow(t / (s.T / 4), 2) / 2);
                const y = B - 80 - 70 * env * Math.cos(t * 2.2);

                if (x === 30) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }

            ctx.stroke();

            const L = 360;
            const R = 660;

            line(ctx, L, B, R, B, GREY + ".6)", 1);
            txt(ctx, "spectrum (−600 to +200 MHz from 0→1)", (L + R) / 2, 30, 12, GREY + ".9)");

            const fx = function (df) { return L + (R - L) * (df + 600) / 800; };

            ctx.strokeStyle = TEAL + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let x = L; x <= R; x += 1) { const df = -600 + (x - L) / (R - L) * 800; const y = B - 150 * spec(s, df); if (x === L) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } }

            ctx.stroke();
            line(ctx, fx(0), 40, fx(0), B, GOLD + "1)", 1.5, [4, 3]);
            txt(ctx, "0→1", fx(0), 52, 11, GOLD + "1)", "center", true);
            line(ctx, fx(-250), 40, fx(-250), B, ROSE + "1)", 1.5, [4, 3]);
            txt(ctx, "1→2", fx(-250), 52, 11, ROSE + "1)", "center", true);
        }
    });

    // Normalised spectral magnitude of the pulse at a frequency offset df (MHz).
    function spec(s, df) {

        const T = s.T * 1e-3;

        if (s.shape === "square") { const x = Math.PI * df * T; return Math.abs(x) < 1e-9 ? 1 : Math.abs(Math.sin(x) / x); }

        const sig = T / 4;

        return Math.exp(-Math.pow(2 * Math.PI * df * sig, 2) / 2);
    }

    function leak(s) { return spec(s, -250); }


    /* ======================================
       UNIT 13: ERROR CORRECTION
    ====================================== */

    SIMS["qc-errortypes"] = stepper({
        title: "Explore: the ways a qubit can go wrong",
        viewBox: "0 0 340 150",
        aria: "A qubit arrow shown before and after each kind of error.",
        interval: 6.5,
        steps: [
            { t: "Bit flip", text: "The qubit's 0 and 1 swap, like a classical bit flip. Caused by energy leaking in or out, or a control mistake." },
            { t: "Phase flip", text: "The sign of the 1 part flips: |+⟩ becomes |−⟩. Classical bits have no such error, which makes quantum error correction harder." },
            { t: "Small rotations", text: "Most real errors are small, continuous over- or under-rotations. Measuring the error checks snaps them into either 'no error' or a full flip, which can then be fixed." },
            { t: "Leakage and measurement errors", text: "The qubit can escape to a third level (|2⟩), or the readout can simply report the wrong answer. Both need their own tricks." }
        ],
        rewardKey: "qc-errortypes",
        rewardMsg: "You know the kinds of qubit error",
        draw: function (step) {

            const before = [[0, -1], [0.87, -0.5], [0, -1], [0, -1]][step];
            const after = [[0, 1], [-0.87, -0.5], [0.3, -0.95], [0, -1]][step];
            let s = "";

            [[90, before, "before"], [250, after, "after"]].forEach(function (p) {

                s += '<circle cx="' + p[0] + '" cy="70" r="40" style="fill:none;stroke:rgba(170,179,207,.5)"/>';
                s += '<line x1="' + p[0] + '" y1="70" x2="' + (p[0] + p[1][0] * 38) + '" y2="' + (70 + p[1][1] * 38) + '" style="stroke:' + (p[2] === "after" ? "#ff6978" : "#54e0c7") + ';stroke-width:3"/>';
                s += '<text x="' + p[0] + '" y="130" text-anchor="middle" style="font-size:8px;fill:rgba(245,247,255,.85)">' + p[2] + "</text>";
            });

            if (step === 3) { s += '<line x1="215" y1="20" x2="285" y2="20" style="stroke:#ff6978;stroke-width:2"/><text x="250" y="14" text-anchor="middle" style="font-size:7px;fill:#ff6978">|2⟩</text><circle cx="250" cy="20" r="5" style="fill:#ff6978"/>'; }

            s += '<text x="170" y="74" text-anchor="middle" style="font-size:14px;fill:#ffd666">→</text>';

            return s;
        }
    });


    function binomTail(n, k0, p) {

        let tot = 0;
        let c = 1;

        for (let k = 0; k <= n; k++) {

            if (k > 0) { c = c * (n - k + 1) / k; }
            if (k >= k0) { tot += c * Math.pow(p, k) * Math.pow(1 - p, n - k); }
        }

        return tot;
    }

    make("qc-repetition", {
        title: "Try it: the repetition code",
        w: 680, h: 240,
        aria: "A graph of the logical error rate against the physical error rate for one qubit, three copies and five copies with majority voting.",
        defaults: { p: 0.1 },
        sliders: [["Chance each physical qubit flips", "p", 0.001, 0.5, 0.001, function (v) { return (v * 100).toFixed(1) + "%"; }]],
        stats: [["One qubit alone", "p1"], ["3 qubits, majority vote", "p3"], ["5 qubits, majority vote", "p5"]],
        formula: "You can't copy an unknown qubit, but you can spread its 0 or 1 across several qubits (|0⟩ → |000⟩) and use parity checks to spot a flip without reading the data. Majority voting fails only if more than half flip: for three copies, 3p² − 2p³. It helps whenever p is below 50%, and more copies help more. Real codes also have to catch phase flips.",
        read: function (s) {

            const p3 = binomTail(3, 2, s.p);
            const p5 = binomTail(5, 3, s.p);

            return {
                p1: (s.p * 100).toPrecision(3) + "%",
                p3: (p3 * 100).toPrecision(3) + "%",
                p5: (p5 * 100).toPrecision(3) + "%",
                verdict: p5 < s.p ? "Redundancy wins: errors are rarer with more copies" : "At 50% the copies are pure noise: no code can help"
            };
        },
        reward: { when: function (s) { return s.p <= 0.01; }, msg: "You saw redundancy crush the error rate" },
        draw: function (ctx, s) {

            const L = 60;
            const R = 650;
            const B = 200;
            const T = 30;

            line(ctx, L, B, R, B, GREY + ".6)", 1);
            line(ctx, L, B, L, T, GREY + ".6)", 1);
            txt(ctx, "physical error rate →", R, B + 22, 11, GREY + ".9)", "right");
            txt(ctx, "logical error rate", L + 4, T - 10, 11, GREY + ".9)", "left");

            [[1, 1, BLUE, "1 qubit"], [3, 2, GOLD, "3 copies"], [5, 3, TEAL, "5 copies"]].forEach(function (c) {

                ctx.strokeStyle = c[2] + "1)";
                ctx.lineWidth = 2.5;
                ctx.beginPath();

                for (let x = L; x <= R; x += 2) { const p = (x - L) / (R - L) * 0.5; const y = B - (B - T) * 2 * binomTail(c[0], c[1], p); if (x === L) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); } }

                ctx.stroke();
                txt(ctx, c[3], R - 4, B - (B - T) * 2 * binomTail(c[0], c[1], 0.42) - 6, 11, c[2] + "1)", "right", true);
            });

            const x = L + (R - L) * s.p / 0.5;

            line(ctx, x, T, x, B, TEXT + ".4)", 1, [4, 4]);
            txt(ctx, "50%", R, B + 14, 10, GREY + ".9)", "right");
        }
    });


    SIMS["qc-syndrome"] = function (root) {

        const st = { round: 0, score: 0, data: [0, 0, 0, 0, 0], flipped: -1, answered: false, rand: mulberry(Date.now() % 4321) };

        root.innerHTML = head("Game: find the flipped qubit from the parity checks") +
            '<div class="fd-stat-row">' + stat("Round", "r") + stat("Score", "s") + "</div>" +
            '<p class="fd-sim-note">Five data qubits store one logical 0 as 00000. Four parity checks compare neighbours. You can\'t look at the data, only at which checks light up. Click the qubit you think flipped.</p>' +
            '<div data-row style="display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap;margin:14px 0"></div>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-new>Next round →</button></div>' +
            '<p class="fd-sim-formula">Each check measures whether two neighbouring qubits agree, without revealing their values. A lit check means its two qubits disagree. The pattern of lit checks (the syndrome) points to the error: this is exactly how quantum error correction works, just in two dimensions on a real chip.</p>';

        const row = root.querySelector("[data-row]");

        function newRound() {

            st.data = [0, 0, 0, 0, 0];
            st.flipped = Math.floor(st.rand() * 5);
            st.data[st.flipped] = 1;
            st.answered = false;
            st.round++;
            render(null);
        }

        function render(pick) {

            row.innerHTML = "";

            for (let i = 0; i < 5; i++) {

                const b = document.createElement("button");

                b.type = "button";
                b.className = "fd-sim-btn";
                b.textContent = "Q" + (i + 1) + (st.answered ? " = " + st.data[i] : "");
                b.style.cssText = "min-width:62px;padding:12px 8px;font-weight:700;" + (st.answered && i === st.flipped ? "border-color:#ffd666;color:#ffd666" : "");
                b.addEventListener("click", function () { if (!st.answered) { answer(i); } });
                row.appendChild(b);

                if (i < 4) {

                    const lit = st.data[i] !== st.data[i + 1];
                    const c = document.createElement("span");

                    c.textContent = lit ? "●" : "○";
                    c.title = "parity check " + (i + 1);
                    c.style.cssText = "font-size:22px;color:" + (lit ? "#ff6978" : "rgba(170,179,207,.6)") + ";padding:0 4px";
                    row.appendChild(c);
                }
            }

            out(root, "r", st.round + " of 6");
            out(root, "s", String(st.score));

            if (pick === null) { out(root, "verdict", "Which qubit flipped? (red dots are checks that disagree)"); }
        }

        function answer(i) {

            st.answered = true;

            if (i === st.flipped) { st.score++; out(root, "verdict", "Correct! Flip Q" + (i + 1) + " back and the data is restored."); } else { out(root, "verdict", "Not quite: it was Q" + (st.flipped + 1) + ". Look for the qubit sitting between (or at the edge next to) the lit checks."); }

            if (st.round >= 6 && st.score >= 5) { F.reward("qc-syndrome", 15, "You decoded error syndromes like a quantum computer"); }

            render(i);
        }

        root.querySelector("[data-new]").addEventListener("click", function () { if (st.round >= 6) { st.round = 0; st.score = 0; } newRound(); });
        root.querySelector("[data-reset]").addEventListener("click", function () { st.round = 0; st.score = 0; newRound(); });

        newRound();
    };


    make("qc-threshold", {
        title: "Try it: the error-correction threshold",
        w: 680, h: 250,
        aria: "A graph of logical error rate against code size for the chosen physical error rate, falling when below the threshold and rising when above it.",
        defaults: { p: 0.3 },
        sliders: [["Physical error rate per operation", "p", 0.05, 2, 0.05, function (v) { return v.toFixed(2) + "%"; }]],
        stats: [["Distance 3", "d3"], ["Distance 7", "d7"], ["Distance 15", "d15"]],
        formula: "In the surface code, the logical error rate scales roughly as (p/p_th)^((d+1)/2), where d is the code distance (the grid's size) and p_th is the threshold, about 1%. Below threshold, every step up in size multiplies the protection. Above it, bigger codes make things worse. In 2024 Google showed its logical errors halving with each step up in distance on a real chip.",
        read: function (s) {

            const f = function (d) { return 0.1 * Math.pow(s.p / 1, (d + 1) / 2); };
            const fmt = function (v) { return v >= 1 ? "≥ 100%" : v < 1e-4 ? "about 10" + sup(Math.floor(Math.log10(v))) : (v * 100).toPrecision(2) + "%"; };

            return {
                d3: fmt(f(3)),
                d7: fmt(f(7)),
                d15: fmt(f(15)),
                verdict: s.p < 1 ? "Below threshold: bigger codes give fewer errors" : s.p > 1 ? "Above threshold: bigger codes give more errors" : "Right at threshold: size doesn't help"
            };
        },
        reward: { when: function (s) { return s.p <= 0.2; }, msg: "You pushed well below the error-correction threshold" },
        draw: function (ctx, s) {

            const L = 70;
            const R = 650;
            const B = 210;
            const T = 30;
            const ds = [3, 5, 7, 9, 11, 13, 15];
            const X = function (d) { return L + (R - L) * (d - 3) / 12; };
            const Y = function (v) { return B - (B - T) * (Math.log10(clamp(v, 1e-12, 1)) + 12) / 12; };

            line(ctx, L, B, R, B, GREY + ".6)", 1);
            line(ctx, L, B, L, T, GREY + ".6)", 1);

            [0, -3, -6, -9, -12].forEach(function (k) { txt(ctx, "10" + sup(k), L - 8, Y(Math.pow(10, k)) + 4, 10, GREY + ".9)", "right"); });

            ds.forEach(function (d) { txt(ctx, "d=" + d, X(d), B + 16, 10, GREY + ".9)"); });

            txt(ctx, "code distance (bigger grid →)", R, B + 34, 11, GREY + ".9)", "right");

            ctx.strokeStyle = (s.p < 1 ? TEAL : ROSE) + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ds.forEach(function (d, i) { const y = Y(0.1 * Math.pow(s.p, (d + 1) / 2)); if (i === 0) { ctx.moveTo(X(d), y); } else { ctx.lineTo(X(d), y); } });
            ctx.stroke();

            ds.forEach(function (d) { dot(ctx, X(d), Y(0.1 * Math.pow(s.p, (d + 1) / 2)), 4.5, (s.p < 1 ? TEAL : ROSE) + "1)"); });
        }
    });


    make("qc-overhead", {
        title: "Try it: how many physical qubits per logical qubit?",
        w: 680, h: 220,
        aria: "A grid of squares representing the physical qubits needed for one logical qubit at the code distance required.",
        defaults: { p: 0.2, tgt: 12, nl: 2 },
        sliders: [["Physical error rate", "p", 0.05, 0.9, 0.05, function (v) { return v.toFixed(2) + "%"; }], ["Target logical error rate", "tgt", 6, 15, 1, function (v) { return "10" + sup(-v); }], ["Logical qubits you need", "nl", 0, 3, 0.1, function (v) { return Math.round(Math.pow(10, v)).toLocaleString("en-US"); }]],
        stats: [["Code distance needed", "d"], ["Physical per logical", "per"], ["Total physical qubits", "tot"]],
        formula: "Using the rough surface-code rule above, find the smallest odd distance d with 0.1·(p/1%)^((d+1)/2) below your target, then count about 2d² physical qubits per logical qubit (data plus check qubits). Better physical qubits shrink the overhead dramatically. Real machines need extra qubits for special operations, so these are lower bounds.",
        read: function (s) {

            const r = need(s);

            return {
                d: r.d ? String(r.d) : "not reachable",
                per: r.d ? r.per.toLocaleString("en-US") : "—",
                tot: r.d ? Math.round(r.per * Math.pow(10, s.nl)).toLocaleString("en-US") : "—",
                verdict: !r.d ? "Too noisy for this target" : r.per < 300 ? "A manageable overhead" : "A big overhead: better qubits would shrink it fast"
            };
        },
        reward: { when: function (s) { const r = need(s); return r.d && r.per < 200 && s.tgt >= 10; }, msg: "You sized an efficient logical qubit" },
        draw: function (ctx, s) {

            const r = need(s);

            if (!r.d) { txt(ctx, "Below threshold needed", 340, 110, 16, ROSE + "1)", "center", true); return; }

            const n = 2 * r.d - 1;
            const cell = Math.min(180 / n, 14);
            const x0 = 340 - n * cell / 2;
            const y0 = 110 - n * cell / 2;

            for (let i = 0; i < n; i++) {

                for (let j = 0; j < n; j++) {

                    const data = (i + j) % 2 === 0;

                    box(ctx, x0 + i * cell + 1, y0 + j * cell + 1, cell - 2, cell - 2, (data ? GOLD : TEAL) + ".7)");
                }
            }

            txt(ctx, "gold: data qubits · teal: check qubits", 340, 212, 11, GREY + ".9)");
            txt(ctx, "one logical qubit, d = " + r.d, 340, 16, 12, TEXT + "1)", "center", true);
        }
    });

    function need(s) {

        if (s.p >= 1) { return { d: 0 }; }

        for (let d = 3; d <= 99; d += 2) {

            if (0.1 * Math.pow(s.p, (d + 1) / 2) <= Math.pow(10, -s.tgt)) { return { d: d, per: 2 * d * d - 1 }; }
        }

        return { d: 0 };
    }


    /* ======================================
       UNIT 14: THE QUBIT ZOO
    ====================================== */

    SIMS["qc-zoo-quiz"] = quiz(
        "Game: which platform is it?",
        ["Superconducting", "Silicon spin", "Trapped ion", "Neutral atom", "Photonic"],
        [
            { q: "Tiny aluminium circuits with Josephson junctions, cooled to 10 millikelvin.", a: "Superconducting", why: "The transmon family." },
            { q: "Single electrons trapped under nanoscale gates, made on 300 mm wafers.", a: "Silicon spin", why: "Quantum dots in silicon." },
            { q: "Charged atoms floating above a chip, held by radio-frequency fields.", a: "Trapped ion", why: "Surface-electrode ion traps." },
            { q: "Hundreds of atoms held in a grid of laser tweezers.", a: "Neutral atom", why: "Rydberg atom arrays." },
            { q: "Qubits are particles of light travelling through waveguides.", a: "Photonic", why: "Silicon or silicon nitride photonics." },
            { q: "Holds the record for the most accurate two-qubit gates, but the gates are slow.", a: "Trapped ion", why: "Identical atoms, slow laser gates." },
            { q: "Could reuse the chip industry's existing factories most directly.", a: "Silicon spin", why: "Built like transistors." },
            { q: "Needs superconducting nanowire detectors to see its qubits.", a: "Photonic", why: "Single-photon detectors." }
        ],
        6,
        "qc-zoo-quiz-done",
        "You can tell the qubit platforms apart",
        "Five very different physical systems, all racing to scale.",
        "Circuits, dots, ions, atoms, photons. Hit Reset to try again."
    );


    const SCORES = {
        sc: { n: "Superconducting", s: [5, 3, 4, 2, 3] },
        si: { n: "Silicon spin", s: [4, 2, 5, 3, 2] },
        ion: { n: "Trapped ion", s: [2, 5, 2, 4, 3] },
        atom: { n: "Neutral atom", s: [3, 4, 3, 4, 4] },
        ph: { n: "Photonic", s: [5, 2, 4, 5, 2] }
    };
    const AXES = ["Gate speed", "Gate accuracy", "Uses chip fabs", "Warmer operation", "Qubit count today"];

    make("qc-platforms", {
        title: "Try it: compare two platforms",
        w: 680, h: 260,
        aria: "Paired bars score two platforms from 1 to 5 on gate speed, gate accuracy, use of chip fabs, operating temperature and qubit count.",
        defaults: { a: "sc", b: "ion" },
        segs: [["Platform A", "a", Object.keys(SCORES).map(function (k) { return [k, SCORES[k].n]; })], ["Platform B", "b", Object.keys(SCORES).map(function (k) { return [k, SCORES[k].n]; })]],
        verdict: true,
        formula: "Scores are rough, qualitative judgements (1 = weak, 5 = strong) to show the trade-offs, not measurements, and they shift as the field moves. No platform wins on everything, which is why several are being developed at once.",
        read: function (s) {

            const a = SCORES[s.a];
            const b = SCORES[s.b];
            const wins = AXES.filter(function (x, i) { return a.s[i] > b.s[i]; });

            return { verdict: s.a === s.b ? "Pick two different platforms" : a.n + " leads on: " + (wins.length ? wins.join(", ").toLowerCase() : "nothing here") };
        },
        draw: function (ctx, s) {

            const a = SCORES[s.a];
            const b = SCORES[s.b];

            AXES.forEach(function (ax, i) {

                const y = 30 + i * 44;

                txt(ctx, ax, 190, y + 16, 13, TEXT + ".9)", "right", true);
                box(ctx, 210, y, a.s[i] * 80, 14, TEAL + ".8)");
                box(ctx, 210, y + 17, b.s[i] * 80, 14, GOLD + ".8)");
            });

            box(ctx, 230, 238, 12, 12, TEAL + ".8)");
            txt(ctx, a.n, 248, 248, 12, TEXT + ".9)", "left");
            box(ctx, 420, 238, 12, 12, GOLD + ".8)");
            txt(ctx, b.n, 438, 248, 12, TEXT + ".9)", "left");
        }
    });


    document.querySelectorAll('.fd-sim[data-sim^="qc-"]').forEach(F.mount);

})();
