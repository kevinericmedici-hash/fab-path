/* ========================================
   QUANTUM COMPUTING CHIPS: INTERACTIVE SIMULATORS, PART 3

   Unit 15: superconductivity (resistance, persistent current, Meissner, metals, why so cold).
   Unit 16: Cooper pairs and the gap (pairing, condensate, gap, quasiparticles, flux quanta).
   Unit 17: the Josephson junction (tunnelling, I-V curve, nonlinear inductance, the SQUID).
   Unit 18: from LC circuit to transmon (LC, anharmonicity, charge noise, transmon formula, shapes).
   Unit 19: resonators and readout (CPW resonator, Q, dispersive shift, IQ blobs, amplifiers).
   Unit 20: the dilution refrigerator (cooldown, dilution, cooling power, attenuators).

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
    const TEAL = Q.TEAL;
    const GOLD = Q.GOLD;
    const ROSE = Q.ROSE;
    const BLUE = Q.BLUE;
    const GREY = Q.GREY;
    const TEXT = Q.TEXT;
    const PURPLE = Q.PURPLE;

    const H_PLANCK = 6.626e-34;
    const K_B = 1.381e-23;
    const E_CHARGE = 1.602e-19;
    const PHI0 = 2.068e-15;

    // Text with a subscript, e.g. subTxt(ctx, "T", "c", ...) draws T with a small c.
    function subTxt(ctx, base, sub, x, y, size, color, align, bold) {

        ctx.font = (bold ? "bold " : "") + size + "px sans-serif";

        const wb = ctx.measureText(base).width;

        ctx.font = (bold ? "bold " : "") + Math.round(size * 0.72) + "px sans-serif";

        const ws = ctx.measureText(sub).width;
        let x0 = x;

        if (align === "center") { x0 = x - (wb + ws) / 2; }
        if (align === "right") { x0 = x - wb - ws; }

        txt(ctx, base, x0, y, size, color, "left", bold);
        txt(ctx, sub, x0 + wb, y + size * 0.3, Math.round(size * 0.72), color, "left", bold);
    }

    // Small SVG helpers for the step-by-step animations.
    function sT(x, y, s, size, fill, anchor) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" style="font-size:' + (size || 9) + "px;fill:" + (fill || "#f5f7ff") + '">' + s + "</text>"; }
    function sR(x, y, w, h, fill, stroke, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" style="fill:' + (fill || "none") + ";stroke:" + (stroke || "none") + '"/>'; }
    function sC(x, y, r, fill, stroke) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="fill:' + (fill || "none") + ";stroke:" + (stroke || "none") + '"/>'; }
    function sL(x1, y1, x2, y2, stroke, w, dash) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" style="stroke:' + stroke + ";stroke-width:" + (w || 1.5) + (dash ? ";stroke-dasharray:" + dash : "") + '"/>'; }
    function sP(d, stroke, w, fill) { return '<path d="' + d + '" style="fill:' + (fill || "none") + ";stroke:" + (stroke || "none") + ";stroke-width:" + (w || 1.5) + '"/>'; }

    // Fraction of the way through the current step (0 to 1).
    function prog(st, interval) { return clamp(st.t / interval, 0, 1); }

    function ease(k) { return k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k); }

    function fmtGHz(g) { return g >= 1 ? g.toFixed(2) + " GHz" : Math.round(g * 1000) + " MHz"; }

    function fmtT(K) {

        if (K < 1) { return (K * 1000 < 10 ? (K * 1000).toFixed(1) : Math.round(K * 1000)) + " mK"; }

        return (K < 10 ? K.toFixed(2) : K.toFixed(0)) + " K";
    }

    function fmtUs(us) {

        if (us < 1) { return Math.round(us * 1000) + " ns"; }
        if (us < 1000) { return (us < 10 ? us.toFixed(1) : Math.round(us)) + " µs"; }

        return (us / 1000).toFixed(us < 1e4 ? 2 : 1) + " ms";
    }

    // Complementary error function (Abramowitz and Stegun 7.1.26).
    function erfc(x) {

        const z = Math.abs(x);
        const t = 1 / (1 + 0.3275911 * z);
        const y = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z);

        return x >= 0 ? y : 2 - y;
    }

    // Thermal photons in a mode of frequency f (GHz) at temperature T (kelvin).
    function nTh(fGHz, T) {

        const x = H_PLANCK * fGHz * 1e9 / (K_B * T);

        return x > 700 ? 0 : 1 / (Math.exp(x) - 1);
    }


    /* ======================================
       UNIT 15: SUPERCONDUCTIVITY
    ====================================== */

    const RT_METALS = {
        cu: { n: "Copper", tc: 0, c: ROSE },
        al: { n: "Aluminium", tc: 1.2, c: TEAL },
        ta: { n: "Tantalum", tc: 4.47, c: GOLD },
        nb: { n: "Niobium", tc: 9.25, c: BLUE }
    };

    function rOfT(m, T) {

        const normal = 0.22 + 0.78 * Math.pow(T / 12, 3);

        if (!m.tc) { return normal; }

        return normal / (1 + Math.exp(-(T - m.tc) / 0.03));
    }

    make("qc-rt", {
        title: "Try it: cool a metal wire",
        w: 680, h: 250,
        aria: "A graph of electrical resistance against temperature, with a wire whose electrons scatter or glide depending on the temperature.",
        defaults: { m: "al", T: 6 },
        segs: [["Metal", "m", [["cu", "Copper"], ["al", "Aluminium"], ["ta", "Tantalum"], ["nb", "Niobium"]]]],
        sliders: [["Temperature", "T", 0.05, 12, 0.05, function (v) { return fmtT(v); }]],
        stats: [["Resistance (vs 12 K)", "r"], ["State", "st"]],
        animated: true,
        formula: "In an ordinary metal, electrons bump into vibrating atoms and impurities, so the resistance never quite reaches zero, even near absolute zero. In a superconductor, the resistance drops to exactly zero below a <b>critical temperature</b> T<sub>c</sub>: about 1.2 K for aluminium, 4.5 K for tantalum and 9.3 K for niobium. Copper never superconducts. Heike Kamerlingh Onnes discovered the effect in mercury in 1911.",
        init: function (s, d) {

            const r = mulberry(15);

            d.e = [];

            for (let i = 0; i < 14; i++) { d.e.push({ x: r() * 200, y: r() * 40, vy: (r() - 0.5) * 30 }); }

            d.r = r;
        },
        step: function (dt, s, d) {

            const R = rOfT(RT_METALS[s.m], s.T);

            d.e.forEach(function (e, i) {

                e.x += dt * (R > 0.001 ? 22 : 40);

                if (R > 0.001) {

                    e.y += e.vy * dt;

                    if (d.r() < dt * 4 * (R + 0.2)) { e.vy = (d.r() - 0.5) * 70; }

                    if (e.y < 0 || e.y > 40) { e.vy = -e.vy; e.y = clamp(e.y, 0, 40); }

                } else {

                    e.y += ((i % 7) * 5.5 + 3 - e.y) * dt * 2;
                }

                if (e.x > 200) { e.x -= 200; }
            });
        },
        read: function (s) {

            const m = RT_METALS[s.m];
            const R = rOfT(m, s.T);
            const sc = R < 0.001;

            return {
                r: sc ? "0 (exactly)" : Math.round(R * 100) + "%",
                st: sc ? "Superconducting" : "Normal metal",
                verdict: sc ? m.n + " is superconducting: zero resistance" : !m.tc ? "Copper keeps some resistance however cold it gets" : "Above its critical temperature: still an ordinary metal"
            };
        },
        reward: { when: function (s) { return rOfT(RT_METALS[s.m], s.T) < 0.001; }, msg: "You made a wire superconduct" },
        draw: function (ctx, s, d) {

            const m = RT_METALS[s.m];
            const X = function (T) { return 60 + T / 12 * 360; };
            const Y = function (r) { return 210 - r * 170; };

            line(ctx, 60, 210, 425, 210, GREY + ".6)", 1);
            line(ctx, 60, 30, 60, 210, GREY + ".6)", 1);

            for (let T = 0; T <= 12; T += 2) { txt(ctx, T + " K", X(T), 228, 11, GREY + ".85)"); }

            txt(ctx, "resistance", 50, 24, 11, GREY + ".85)", "left");
            txt(ctx, "temperature", 240, 246, 11, GREY + ".85)");

            ctx.strokeStyle = m.c + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let i = 0; i <= 240; i++) {

                const T = i / 20;

                if (i === 0) { ctx.moveTo(X(T), Y(rOfT(m, T))); } else { ctx.lineTo(X(T), Y(rOfT(m, T))); }
            }

            ctx.stroke();

            if (m.tc) {

                line(ctx, X(m.tc), 30, X(m.tc), 210, m.c + ".5)", 1, [4, 4]);
                subTxt(ctx, "T", "c = " + m.tc + " K", X(m.tc) + 4, 44, 11, m.c + "1)", "left");
            }

            const R = rOfT(m, s.T);

            dot(ctx, X(s.T), Y(R), 7, TEXT + "1)");
            dot(ctx, X(s.T), Y(R), 4.5, m.c + "1)");

            // the wire
            const wx = 455, wy = 85;
            const sc = R < 0.001;

            box(ctx, wx, wy, 200, 50, sc ? "rgba(84,224,199,.12)" : "rgba(255,105,120," + (0.08 + R * 0.25) + ")", GREY + ".6)");
            txt(ctx, m.n + " wire", wx + 100, wy - 12, 12, TEXT + ".9)", "center", true);

            d.e.forEach(function (e, i) {

                if (sc && i % 2) {
                    line(ctx, wx + e.x, wy + 5 + e.y, wx + d.e[i - 1].x, wy + 5 + d.e[i - 1].y, GOLD + ".5)", 1);
                }

                dot(ctx, wx + e.x, wy + 5 + e.y, 3.5, sc ? GOLD + "1)" : BLUE + ".95)");
            });

            txt(ctx, sc ? "electrons glide in pairs: no collisions" : "electrons scatter: energy lost as heat", wx + 100, wy + 74, 11, sc ? TEAL + "1)" : ROSE + "1)");
        }
    });


    make("qc-persistent", {
        title: "Try it: a current that never stops",
        w: 680, h: 240,
        aria: "A ring of metal carrying a circulating current, with a graph of the current over time.",
        defaults: { m: "sc" },
        segs: [["Ring", "m", [["cu", "Copper ring"], ["sc", "Superconducting ring"]]]],
        actions: [["go", "⚡ Start a current"]],
        stats: [["Current left", "i"], ["Time", "t"]],
        animated: true,
        liveRead: true,
        formula: "Start a current in a ring and take the battery away. In copper, resistance turns the current's energy into heat and it fades away within a fraction of a second (slowed down here). In a superconducting ring the current keeps flowing with no measurable decay: experiments have watched such currents for years. Superconducting qubits are built on this: currents that slosh back and forth without losing energy.",
        init: function (s, d) { d.t = 0; d.on = false; d.hist = []; d.ph = 0; },
        onChange: function (s, d) { d.t = 0; d.on = false; d.hist = []; },
        act: function (id, s, d) { d.t = 0; d.on = true; d.hist = []; },
        step: function (dt, s, d) {

            if (!d.on) { return; }

            d.t += dt;

            const I = s.m === "sc" ? 1 : Math.exp(-d.t / 2.2);

            d.ph += dt * 1.6 * I;

            if (d.hist.length === 0 || d.t - d.hist[d.hist.length - 1][0] > 0.1) { d.hist.push([d.t, I]); }
        },
        read: function (s, d) {

            const I = !d.on ? 0 : s.m === "sc" ? 1 : Math.exp(-d.t / 2.2);

            return {
                i: d.on ? Math.round(I * 100) + "%" : "—",
                t: d.on ? d.t.toFixed(1) + " s" : "—",
                verdict: !d.on ? "Press Start to set a current going" : s.m === "sc" ? "Still 100%: nothing slows it down" : I < 0.05 ? "Gone: resistance turned it into heat" : "Fading as the ring heats up"
            };
        },
        reward: { when: function (s, d) { return d.on && s.m === "sc" && d.t > 8; }, msg: "You kept a supercurrent flowing" },
        draw: function (ctx, s, d) {

            const cx = 140, cy = 120;
            const I = !d.on ? 0 : s.m === "sc" ? 1 : Math.exp(-d.t / 2.2);
            const col = s.m === "sc" ? TEAL : GOLD;

            ctx.lineWidth = 16;
            ctx.strokeStyle = s.m === "sc" ? "rgba(170,190,220,.55)" : "rgba(200,131,79,.7)";
            ctx.beginPath();
            ctx.ellipse(cx, cy, 90, 70, 0, 0, Math.PI * 2);
            ctx.stroke();

            for (let k = 0; k < 16; k++) {

                const a = d.ph + k * Math.PI / 8;

                dot(ctx, cx + Math.cos(a) * 90, cy + Math.sin(a) * 70, 3.5, col + (0.25 + 0.75 * I) + ")");
            }

            if (s.m === "cu" && I > 0.05) {

                for (let k = 0; k < 5; k++) { txt(ctx, "〰", cx - 60 + k * 30, cy - 82 - (d.t * 20 + k * 9) % 20, 12, ROSE + (I * 0.8) + ")"); }
            }

            txt(ctx, s.m === "sc" ? "aluminium below 1.2 K" : "copper", cx, cy + 4, 12, TEXT + ".85)");

            // graph
            const gx = 300, gy = 40, gw = 350, gh = 160;

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);
            txt(ctx, "current", gx - 6, gy + 6, 11, GREY + ".85)", "right");
            txt(ctx, "time (s)", gx + gw / 2, gy + gh + 30, 11, GREY + ".85)");

            for (let t = 0; t <= 12; t += 3) { txt(ctx, String(t), gx + t / 12 * gw, gy + gh + 15, 11, GREY + ".8)"); }

            if (d.hist.length > 1) {

                ctx.strokeStyle = col + "1)";
                ctx.lineWidth = 2.5;
                ctx.beginPath();

                d.hist.forEach(function (p, i) {

                    const x = gx + Math.min(p[0], 12) / 12 * gw;
                    const y = gy + gh - p[1] * gh;

                    if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
                });

                ctx.stroke();
            }
        }
    });


    SIMS["qc-meissner"] = stepper({
        title: "Explore: the Meissner effect",
        viewBox: "0 0 340 190",
        aria: "Magnetic field lines passing through a metal block, then pushed out of it when it becomes superconducting, then a magnet floating above it.",
        interval: 6.5,
        steps: [
            { t: "Warm: field goes straight through", text: "Warm, the metal is ordinary. A magnetic field passes right through it, as if it weren't there." },
            { t: "Cool it down: the field is pushed out", text: "Below the critical temperature, currents flow on the surface and cancel the field inside. The superconductor expels the magnetic field. This is the Meissner effect (1933)." },
            { t: "A magnet floats", text: "Because the superconductor pushes the field away, a small magnet above it is repelled and can float." },
            { t: "Why chips care: trapped flux", text: "If a chip cools down inside a magnetic field, tiny whirlpools of field called vortices get trapped in the film. They move and absorb microwave energy, shortening qubit lifetimes. That is why quantum chips sit inside magnetic shields." }
        ],
        rewardKey: "qc-meissner",
        rewardMsg: "You saw a superconductor push out a magnetic field",
        draw: function (step, st) {

            const k = ease(prog(st, 6.5) * 1.6);
            let s = sR(110, 110, 120, 40, step === 0 ? "rgba(170,179,207,.35)" : "rgba(120,180,255,.3)", step === 0 ? "#aab3cf" : "#78b4ff", 4);
            const bend = step === 0 ? 0 : step === 1 ? k : 1;

            s += sT(170, 168, step === 0 ? "metal, warm" : "superconductor, cold", 9, "#aab3cf");

            if (step < 3) {

                for (let i = 0; i < 7; i++) {

                    const x = 100 + i * 23;
                    const inside = x > 105 && x < 235;
                    const push = inside ? (x < 170 ? -1 : 1) * (75 - Math.abs(x - 170)) * bend * (x < 170 ? (x - 100) / 70 : (240 - x) / 70) : 0;
                    const xm = x + push * 1.2 + (inside ? (x < 170 ? -1 : 1) * bend * 30 : 0);
                    let yTop = step === 2 ? 70 : 20;

                    if (step === 2) {
                        s += sP("M" + x + " " + yTop + " Q" + x + " 100 " + (x < 170 ? x - 25 : x + 25) + " 110", "#ffd666", 1.3);
                        continue;
                    }

                    s += sP("M" + x + " " + yTop + " C" + x + " 90 " + xm + " 100 " + xm + " 130 S" + x + " 170 " + x + " 186", "#ffd666", 1.3);
                }
            }

            if (step === 1) { s += sT(170, 16, "field lines bend around the block", 9, "#ffd666"); }

            if (step === 2) {

                const y = 52 + Math.sin(st.anim * 2) * 3;

                s += sR(150, y, 40, 16, "#ff6978", "#f5f7ff", 3) + sT(160, y + 11, "N", 9, "#fff") + sT(180, y + 11, "S", 9, "#fff");
                s += sT(260, 70, "magnet floats", 9, "#ffd666");
            }

            if (step === 3) {

                s += sR(70, 40, 200, 140, "none", "#aab3cf", 6) + sT(170, 34, "magnetic shield (mu-metal)", 9, "#aab3cf");

                [140, 200].forEach(function (x, i) {

                    const a = st.anim * (i ? -2 : 2);

                    s += sC(x, 130, 7, "rgba(255,105,120,.25)", "#ff6978") + sP("M" + (x + 7 * Math.cos(a)) + " " + (130 + 7 * Math.sin(a)) + " A7 7 0 1 1 " + (x + 7 * Math.cos(a + 2)) + " " + (130 + 7 * Math.sin(a + 2)), "#ff6978", 1.2);
                });

                s += sT(170, 100, "trapped vortices", 9, "#ff6978");
            }

            return s;
        }
    });


    const TC_LIST = [
        ["ti", "Titanium", 0.4, "Rarely used alone; part of the compound TiN."],
        ["al", "Aluminium", 1.2, "The workhorse. Its oxide makes the best Josephson junctions, so almost every superconducting qubit uses it."],
        ["in", "Indium", 3.4, "Soft and squishy: used for bump bonds that join chips together (Unit 27)."],
        ["ta", "Tantalum", 4.4, "Its clean, thin oxide gives some of the longest-lived transmons (Unit 22)."],
        ["tin", "TiN", 4.5, "Titanium nitride: very low-loss resonators; its critical temperature depends on the recipe (up to about 5.6 K)."],
        ["nb", "Niobium", 9.3, "The highest critical temperature of any pure element. Used for wiring, resonators and cavities."],
        ["nbn", "NbN", 16, "Niobium nitride: used for single-photon detectors and high-inductance wires."],
        ["ybco", "YBCO", 93, "A ceramic 'high-temperature' superconductor. Works in liquid nitrogen, but is too lossy and hard to pattern for qubits."]
    ];

    make("qc-tcchart", {
        title: "Explore: which metals superconduct, and how cold?",
        w: 680, h: 250,
        aria: "A logarithmic temperature scale with the critical temperatures of eight superconductors and reference temperatures for liquid helium, liquid nitrogen and the fridge.",
        defaults: { p: "al" },
        segs: [["Pick", "p", TC_LIST.slice(0, 4).map(function (m) { return [m[0], m[1]]; })], ["", "p", TC_LIST.slice(4).map(function (m) { return [m[0], m[1]]; })]],
        stats: [["Critical temperature", "tc"], ["Materials explored", "n"]],
        note: true,
        formula: "The scale is logarithmic: each step is ten times colder. A qubit chip sits at about 0.01 K (10 millikelvin), far below the critical temperature of every metal it uses. Aluminium is used for nearly every Josephson junction; niobium, tantalum and TiN often form the rest of the circuit.",
        init: function (s, d) { d.seen = {}; },
        read: function (s, d) {

            const m = TC_LIST.filter(function (x) { return x[0] === s.p; })[0];

            d.seen[s.p] = true;

            return {
                tc: m[2] + " K",
                n: Object.keys(d.seen).length + " of " + TC_LIST.length,
                note: m[1] + ": " + m[3],
                verdict: m[1] + " superconducts below " + m[2] + " K"
            };
        },
        reward: { when: function (s, d) { return Object.keys(d.seen).length >= 5; }, msg: "You explored the superconducting metals" },
        draw: function (ctx, s) {

            const X = function (T) { return 50 + (Math.log10(T) + 2.3) / 4.5 * 600; };

            line(ctx, 40, 190, 660, 190, GREY + ".6)", 1);

            [0.01, 0.1, 1, 10, 100].forEach(function (T) {

                line(ctx, X(T), 186, X(T), 194, GREY + ".6)", 1);
                txt(ctx, T + " K", X(T), 210, 11, GREY + ".85)");
            });

            [[0.01, "chip in the fridge", BLUE], [4.2, "liquid helium", PURPLE], [77, "liquid nitrogen", PURPLE], [300, "room", ROSE]].forEach(function (r, i) {

                if (r[0] > 200) { return; }

                line(ctx, X(r[0]), 40, X(r[0]), 190, r[2] + ".45)", 1, [3, 4]);
                txt(ctx, r[1], X(r[0]) + 4, 232 - (i % 2) * 0, 10, r[2] + ".95)", "left");
            });

            TC_LIST.forEach(function (m, i) {

                const on = m[0] === s.p;
                const y = 52 + (i % 4) * 32;

                line(ctx, X(m[2]), y + 6, X(m[2]), 190, (on ? GOLD : TEAL) + (on ? "1)" : ".35)"), on ? 2.5 : 1.2);
                dot(ctx, X(m[2]), y, on ? 7 : 5, (on ? GOLD : TEAL) + "1)");
                txt(ctx, m[1], X(m[2]) + (i === 3 ? -10 : 10), y + 4, on ? 13 : 11, on ? GOLD + "1)" : TEXT + ".8)", i === 3 ? "right" : "left", on);
            });
        }
    });


    make("qc-cold", {
        title: "Try it: why 10 millikelvin?",
        w: 680, h: 240,
        aria: "A grid of 100 qubits. At warmer temperatures, heat randomly kicks some of them into the 1 state.",
        defaults: { lt: -1.3, f: 5 },
        sliders: [["Temperature", "lt", -2, 0.6, 0.02, function (v) { return fmtT(Math.pow(10, v)); }], ["Qubit frequency", "f", 2, 10, 0.1, function (v) { return v.toFixed(1) + " GHz"; }]],
        stats: [["Qubits heated into 1", "p"], ["Qubit energy ÷ heat energy", "x"]],
        animated: true,
        formula: "Aluminium already superconducts at 1.2 K, so why go a hundred times colder? Because a 5 GHz qubit stores a tiny energy, hf. Heat jiggles things with energy around k<sub>B</sub>T. When k<sub>B</sub>T is not much smaller than hf, heat randomly flips qubits to 1. The excited fraction is about 1 / (1 + e<sup>hf/k<sub>B</sub>T</sup>). At 5 GHz, hf/k<sub>B</sub> is only 0.24 K, so the chip must be at 10 to 20 mK.",
        init: function (s, d) { d.r = mulberry(7); d.q = []; d.t = 9; },
        step: function (dt, s, d) {

            d.t += dt;

            if (d.t > 0.9) {

                d.t = 0;

                const T = Math.pow(10, s.lt);
                const p = 1 / (1 + Math.exp(H_PLANCK * s.f * 1e9 / (K_B * T)));

                d.q = [];

                for (let i = 0; i < 100; i++) { d.q.push(d.r() < p); }
            }
        },
        read: function (s) {

            const T = Math.pow(10, s.lt);
            const x = H_PLANCK * s.f * 1e9 / (K_B * T);
            const p = 1 / (1 + Math.exp(x));

            return {
                p: p < 1e-4 ? "under 0.01%" : (p * 100).toFixed(p < 0.01 ? 2 : 1) + "%",
                x: x.toFixed(1),
                verdict: p < 0.001 ? "Cold enough: virtually every qubit starts in 0" : p < 0.03 ? "Close, but a few qubits start in the wrong state" : "Too warm: heat scrambles the qubits"
            };
        },
        reward: { when: function (s) { return 1 / (1 + Math.exp(H_PLANCK * s.f * 1e9 / (K_B * Math.pow(10, s.lt)))) < 0.001; }, msg: "You found the temperature qubits need" },
        draw: function (ctx, s, d) {

            for (let i = 0; i < 100; i++) {

                const x = 60 + (i % 20) * 24;
                const y = 40 + Math.floor(i / 20) * 34;
                const one = d.q[i];

                dot(ctx, x, y, 9, one ? ROSE + ".9)" : TEAL + ".35)");
                txt(ctx, one ? "1" : "0", x, y + 4, 10, TEXT + ".95)", "center", true);
            }

            const T = Math.pow(10, s.lt);
            const th = 1 - (s.lt + 2) / 2.6;

            box(ctx, 560, 30, 24, 170, "rgba(255,255,255,.04)", GREY + ".5)");
            box(ctx, 563, 30 + 167 * th, 18, 167 * (1 - th), "rgba(255," + Math.round(105 + 150 * th) + "," + Math.round(120 + 120 * th) + ",.85)");
            txt(ctx, fmtT(T), 600, 40 + 160 * th, 12, TEXT + ".9)", "left", true);
            txt(ctx, "4 K", 590, 34, 10, GREY + ".8)", "left");
            txt(ctx, "10 mK", 590, 204, 10, GREY + ".8)", "left");
            txt(ctx, "red = heated into 1 by accident", 290, 222, 11, GREY + ".85)");
        }
    });


    /* ======================================
       UNIT 16: COOPER PAIRS AND THE GAP
    ====================================== */

    SIMS["qc-cooper"] = stepper({
        title: "Explore: how two electrons become a pair",
        viewBox: "0 0 340 190",
        aria: "A lattice of positive ions. A passing electron pulls the ions together, and a second electron is attracted to that positive region.",
        interval: 6.5,
        steps: [
            { t: "A metal: ions and electrons", text: "A metal is a lattice of positive ions in a sea of negative electrons. Electrons normally repel each other." },
            { t: "An electron pulls the ions in", text: "As an electron moves through, it attracts the nearby positive ions. They are heavy and slow, so they bunch together behind it, leaving a trail of extra positive charge." },
            { t: "A second electron follows", text: "A second electron is drawn to that positive trail. Through the lattice, the two electrons attract each other: a Cooper pair (Cooper, 1956)." },
            { t: "Paired up", text: "The two electrons have opposite spins and opposite momentum. They can be hundreds of atoms apart, yet act as one particle with charge 2e." },
            { t: "All pairs move as one", text: "Below the critical temperature, all the pairs share one quantum state and move in lockstep. Nothing can scatter one pair without disturbing all of them, so the current flows without resistance (the BCS theory, 1957)." }
        ],
        rewardKey: "qc-cooper",
        rewardMsg: "You learned how Cooper pairs form",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = "";
            const ex = 30 + k * 280;

            for (let r = 0; r < 3; r++) {

                for (let c = 0; c < 9; c++) {

                    const x0 = 30 + c * 35;
                    const y0 = 55 + r * 40;
                    let dx = 0, dy = 0;

                    if (step >= 1 && step <= 3) {

                        const lead = step === 1 ? ex : 30 + ((st.anim * 40) % 280);
                        const dist = x0 - lead;

                        if (dist < 0 && dist > -90) { dy = (r === 1 ? 0 : (r === 0 ? 1 : -1)) * 8 * (1 + dist / 90); dx = 0; }
                    }

                    s += sC(x0 + dx, y0 + dy, 7, "rgba(255,105,120,.3)", "#ff6978") + sT(x0 + dx, y0 + dy + 3, "+", 9, "#ff6978");
                }
            }

            if (step === 0) {

                for (let i = 0; i < 8; i++) {

                    const x = 30 + ((i * 47 + st.anim * 30 * (i % 2 ? 1 : -1)) % 300 + 300) % 300;

                    s += sC(x, 75 + (i % 3) * 20, 4, "#78b4ff");
                }
            }

            if (step === 1) { s += sC(ex, 95, 5, "#78b4ff") + sT(ex, 85, "e⁻", 9, "#78b4ff"); }

            if (step >= 2) {

                const lead = step === 2 ? ex : 30 + ((st.anim * 40) % 280);
                const gap = step === 2 ? Math.max(50, 120 - k * 70) : 50;

                if (step < 4) {

                    s += sC(lead, 95, 5, "#ffd666") + sC(lead - gap, 95, 5, "#ffd666");

                    if (step === 3) { s += sP("M" + (lead - gap) + " 95 Q" + (lead - gap / 2) + " 80 " + lead + " 95", "#ffd666", 1, "none") + sT(lead - gap / 2, 76, "↑↓ pair, charge 2e", 8, "#ffd666"); }

                } else {

                    for (let i = 0; i < 4; i++) {

                        const x = ((st.anim * 40 + i * 80) % 340);

                        s += sC(x, 75 + i % 2 * 40, 4.5, "#ffd666") + sC(x - 30, 75 + i % 2 * 40, 4.5, "#ffd666") + sL(x - 30, 75 + i % 2 * 40, x, 75 + i % 2 * 40, "#ffd666", 0.8, "2 2");
                    }

                    s += sT(170, 25, "every pair in the same quantum state", 9, "#54e0c7");
                }
            }

            return s;
        }
    });


    make("qc-condensate", {
        title: "Try it: one giant quantum wave",
        w: 680, h: 240,
        aria: "Sixty arrows show the quantum phase of electron pairs. Below the critical temperature they line up and turn together.",
        defaults: { t: 1.3 },
        sliders: [["Temperature ÷ critical temperature", "t", 0, 1.5, 0.01, function (v) { return v.toFixed(2); }]],
        stats: [["Pairs in step", "g"], ["Resistance", "r"]],
        animated: true,
        liveRead: true,
        formula: "Each Cooper pair has a quantum phase (the arrow). Above T<sub>c</sub> the electrons are unpaired and their phases are random. Cool below T<sub>c</sub> and more and more of them join one shared wave, all pointing the same way and turning together. This single <b>macroscopic quantum state</b>, spread across a whole piece of metal, is what lets a circuit you can see under a microscope behave like an atom.",
        init: function (s, d) {

            const r = mulberry(16);

            d.ph = [];
            d.w = [];

            for (let i = 0; i < 60; i++) { d.ph.push(r() * 6.28); d.w.push((r() - 0.5) * 3); }

            d.g = 0;
        },
        step: function (dt, s, d) {

            d.g = s.t >= 1 ? 0 : s.t <= 0.001 ? 1 : Math.tanh(1.74 * Math.sqrt(1 / s.t - 1));
            d.ph = d.ph.map(function (p, i) { return p + dt * d.w[i] * (1 - d.g); });
            d.common = (d.common || 0) + dt * 0.8;
        },
        read: function (s, d) {

            return {
                g: Math.round(d.g * 100) + "%",
                r: d.g > 0 ? "zero" : "normal",
                verdict: d.g > 0.9 ? "Almost every pair moves as one wave" : d.g > 0 ? "Some pairs have formed and joined the wave" : "Above the critical temperature: no pairs, random phases"
            };
        },
        reward: { when: function (s, d) { return d.g > 0.95; }, msg: "You formed a superconducting condensate" },
        draw: function (ctx, s, d) {

            for (let i = 0; i < 60; i++) {

                const x = 60 + (i % 15) * 40;
                const y = 40 + Math.floor(i / 15) * 45;
                const a = d.ph[i] * (1 - d.g) + (d.common || 0) * d.g;
                const paired = i / 60 < d.g;
                const col = paired ? GOLD : GREY;

                arrow(ctx, x - Math.cos(a) * 13, y - Math.sin(a) * 13, x + Math.cos(a) * 13, y + Math.sin(a) * 13, col + (paired ? "1)" : ".6)"), 2);
            }

            txt(ctx, "gold = paired and in step   grey = unpaired electron", 340, 228, 11, GREY + ".85)");
        }
    });


    const GAPS = { al: { n: "Aluminium", g: 90 }, ta: { n: "Tantalum", g: 330 }, nb: { n: "Niobium", g: 700 } };

    make("qc-gap", {
        title: "Try it: can a photon break a pair?",
        w: 680, h: 250,
        aria: "An energy diagram with Cooper pairs at the bottom, an energy gap, and broken-pair states above. A photon of chosen frequency arrives.",
        defaults: { m: "al", lf: 0.7 },
        segs: [["Metal", "m", [["al", "Aluminium"], ["ta", "Tantalum"], ["nb", "Niobium"]]]],
        sliders: [["Photon frequency", "lf", 0, 3, 0.01, function (v) { const f = Math.pow(10, v); return (f < 10 ? f.toFixed(1) : Math.round(f)) + " GHz"; }]],
        stats: [["Energy needed to break a pair", "gap"], ["Photon energy", "e"]],
        animated: true,
        formula: "Breaking a Cooper pair costs a fixed amount of energy, the <b>superconducting gap</b> 2Δ, which is about 3.5 k<sub>B</sub>T<sub>c</sub>. For aluminium that is a photon of about 90 GHz; for niobium, about 700 GHz. Qubit microwaves at 4 to 8 GHz are far too weak to break pairs, so they slosh around the circuit without being absorbed. That is the secret of low loss. (1 GHz of frequency is about 4.1 µeV of energy.)",
        init: function (s, d) { d.t = 0; d.broken = 0; },
        onChange: function (s, d) { d.t = 0; d.broken = 0; },
        step: function (dt, s, d) {

            d.t += dt;

            if (d.t > 4) {

                d.t = 0;

                if (Math.pow(10, s.lf) >= GAPS[s.m].g) { d.broken = Math.min(6, d.broken + 1); }
            }
        },
        read: function (s) {

            const f = Math.pow(10, s.lf);
            const g = GAPS[s.m].g;

            return {
                gap: g + " GHz (" + Math.round(g * 4.136) / 1000 + " meV)",
                e: (f * 4.136 < 1000 ? (f * 4.136).toFixed(f < 10 ? 1 : 0) + " µeV" : (f * 4.136 / 1000).toFixed(2) + " meV"),
                verdict: f >= g ? "Above the gap: the photon breaks a pair into two quasiparticles" : f >= 4 && f <= 8 ? "A qubit photon: far below the gap, it can't be absorbed" : "Below the gap: the pairs ignore it"
            };
        },
        reward: { when: function (s) { return Math.pow(10, s.lf) >= GAPS[s.m].g; }, msg: "You broke a Cooper pair" },
        draw: function (ctx, s, d) {

            const g = GAPS[s.m].g;
            const f = Math.pow(10, s.lf);
            const Y = function (fq) { return 205 - (Math.log10(Math.max(fq, 1))) / 3 * 165; };

            box(ctx, 200, Y(1) - 2, 300, 16, "rgba(255,214,102,.25)", GOLD + ".8)");
            txt(ctx, "Cooper pairs (ground state)", 350, Y(1) + 10, 11, GOLD + "1)", "center", true);
            box(ctx, 200, 30, 300, Y(g) - 30, "rgba(120,180,255,.12)", BLUE + ".6)");
            txt(ctx, "broken pairs: quasiparticles", 350, 46, 11, BLUE + "1)", "center", true);
            line(ctx, 200, Y(g), 500, Y(g), ROSE + "1)", 2);
            txt(ctx, "gap 2Δ ≈ " + g + " GHz", 510, Y(g) + 4, 12, ROSE + "1)", "left", true);
            box(ctx, 200, Y(8), 300, Y(4) - Y(8), "rgba(84,224,199,.18)");
            txt(ctx, "qubit band 4–8 GHz", 510, Y(5.5) + 4, 11, TEAL + "1)", "left");

            [1, 10, 100, 1000].forEach(function (v) { txt(ctx, v + " GHz", 190, Y(v) + 4, 10, GREY + ".85)", "right"); });

            const k = clamp(d.t / 3, 0, 1);
            const above = f >= g;
            const top = Y(f);
            const px = 120 + k * 230;

            if (k < 1) {

                arrow(ctx, 60, top + 40, 60, top, PURPLE + "1)", 3);
                ctx.strokeStyle = PURPLE + "1)";
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let x = 0; x <= 60; x++) { ctx.lineTo(px - 60 + x, top + Math.sin((x + d.t * 60) * 0.5) * 4); }

                ctx.stroke();
            }

            txt(ctx, "photon", 60, top + 56, 11, PURPLE + "1)");

            for (let i = 0; i < d.broken; i++) {

                dot(ctx, 240 + i * 40, 70 + (i % 2) * 18, 6, BLUE + "1)");
                dot(ctx, 255 + i * 40, 78 + (i % 2) * 18, 6, BLUE + "1)");
            }

            if (above && k >= 1) { txt(ctx, "pair broken!", 350, 110, 13, ROSE + "1)", "center", true); }
        }
    });


    SIMS["qc-qp"] = stepper({
        title: "Explore: quasiparticles, the broken pairs",
        viewBox: "0 0 340 190",
        aria: "A superconducting film with a Josephson junction. A stray photon breaks a pair, and a quasiparticle tunnels across the junction, taking energy from the qubit.",
        interval: 6.5,
        steps: [
            { t: "Something breaks a pair", text: "Pairs can still be broken by energy from outside: stray infrared light leaking into the fridge, heat, or even cosmic rays and natural radioactivity." },
            { t: "Quasiparticles roam the metal", text: "The two halves of a broken pair are called quasiparticles. They wander through the film, and at 10 mK they can take milliseconds to find each other and pair up again." },
            { t: "One crosses the junction", text: "When a quasiparticle tunnels across the Josephson junction, it can absorb the qubit's energy. The qubit drops from 1 to 0: an error." },
            { t: "Fighting back", text: "Light-tight shields, infrared filters on every cable and 'traps' (patches of normal metal or lower-gap metal that soak quasiparticles up) keep them away. More in Part 5." }
        ],
        rewardKey: "qc-qp",
        rewardMsg: "You learned why quasiparticles cause errors",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = sR(20, 100, 140, 30, "rgba(170,190,220,.4)", "#aab3cf", 3) + sR(180, 100, 140, 30, "rgba(170,190,220,.4)", "#aab3cf", 3);

            s += sR(160, 98, 20, 34, "rgba(190,150,255,.4)", "#be96ff") + sT(170, 148, "junction", 9, "#be96ff");
            s += sT(90, 92, "aluminium film", 9, "#aab3cf");

            if (step === 0) {

                const x = 20 + k * 80;

                s += sP("M" + x + " " + (30 + k * 60) + " l6 -6 l6 6 l6 -6 l6 6", "#ff6978", 1.5);
                s += sT(60, 30, "infrared photon or cosmic ray", 9, "#ff6978");
                s += sC(100, 115, 4, "#ffd666") + sC(112, 115, 4, "#ffd666");
            }

            if (step === 1) {

                s += sC(100 - k * 50, 112 + Math.sin(st.anim * 3) * 5, 4, "#78b4ff") + sC(112 + k * 35, 118 + Math.cos(st.anim * 3) * 5, 4, "#78b4ff");
                s += sT(90, 168, "two quasiparticles", 9, "#78b4ff");
            }

            if (step === 2) {

                const x = 147 + k * 50;

                s += sC(x, 115, 4, "#78b4ff");
                s += sT(260, 40, "qubit:", 9, "#f5f7ff") + sT(260, 56, k < 0.5 ? "|1⟩" : "|0⟩  error!", 11, k < 0.5 ? "#ffd666" : "#ff6978");
            }

            if (step === 3) {

                s += sR(10, 20, 320, 160, "none", "#54e0c7", 8) + sT(170, 16, "light-tight shield", 9, "#54e0c7");
                s += sR(40, 100, 30, 30, "rgba(255,214,102,.35)", "#ffd666") + sT(55, 92, "trap", 9, "#ffd666");
                s += sC(55 + Math.sin(st.anim) * 4, 115, 4, "#78b4ff");
            }

            return s;
        }
    });


    make("qc-fluxq", {
        title: "Try it: flux comes in packets",
        w: 680, h: 240,
        aria: "A superconducting ring cooled in a magnetic field traps a whole number of flux quanta, shown as a staircase graph.",
        defaults: { phi: 1.3 },
        sliders: [["Magnetic flux through the ring when it cools (in flux quanta)", "phi", 0, 4, 0.01, function (v) { return v.toFixed(2); }]],
        stats: [["Flux trapped in the ring", "n"], ["One flux quantum", "q"]],
        formula: "Because every Cooper pair shares one wave, the wave must join up with itself around a ring. That only works for whole numbers of wiggles, so the magnetic flux trapped in a ring comes in packets: the flux quantum Φ<sub>0</sub> = h/2e ≈ 2.07 × 10<sup>−15</sup> webers. The '2e' is the pair's charge: measuring Φ<sub>0</sub> in 1961 proved that the current is carried by pairs. Qubit chips use Φ<sub>0</sub> as their natural unit of flux.",
        read: function (s) {

            const n = Math.round(s.phi);

            return {
                n: n + " Φ₀",
                q: "2.07 × 10⁻¹⁵ Wb",
                verdict: Math.abs(s.phi - n) < 0.05 ? "Exactly " + n + " flux quanta fit" : "The ring snaps to the nearest whole number: " + n
            };
        },
        reward: { when: function (s) { return Math.round(s.phi) >= 3; }, msg: "You trapped flux quanta in a ring" },
        draw: function (ctx, s) {

            const n = Math.round(s.phi);
            const cx = 140, cy = 120;

            ctx.lineWidth = 14;
            ctx.strokeStyle = "rgba(170,190,220,.55)";
            ctx.beginPath();
            ctx.arc(cx, cy, 70, 0, Math.PI * 2);
            ctx.stroke();

            for (let i = 0; i < n; i++) {

                const a = i / Math.max(n, 1) * Math.PI * 2;
                const x = cx + (n > 1 ? Math.cos(a) * 26 : 0);
                const y = cy + (n > 1 ? Math.sin(a) * 26 : 0);

                dot(ctx, x, y, 11, GOLD + ".3)");
                txt(ctx, "Φ₀", x, y + 5, 13, GOLD + "1)", "center", true);
            }

            txt(ctx, n + " trapped", cx, cy + 105, 12, TEXT + ".9)");

            const gx = 330, gy = 30, gw = 320, gh = 170;

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);
            txt(ctx, "applied flux", gx + gw / 2, gy + gh + 30, 11, GREY + ".85)");
            txt(ctx, "trapped", gx + 6, gy + 10, 11, GREY + ".85)", "left");

            ctx.strokeStyle = TEAL + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let i = 0; i <= 400; i++) {

                const p = i / 100;
                const x = gx + p / 4 * gw;
                const y = gy + gh - Math.round(p) / 4 * gh;

                if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            }

            ctx.stroke();

            for (let i = 0; i <= 4; i++) { txt(ctx, String(i), gx + i / 4 * gw, gy + gh + 15, 11, GREY + ".8)"); }

            dot(ctx, gx + s.phi / 4 * gw, gy + gh - n / 4 * gh, 6, GOLD + "1)");
        }
    });


    /* ======================================
       UNIT 17: THE JOSEPHSON JUNCTION
    ====================================== */

    make("qc-tunnel", {
        title: "Try it: tunnelling through the barrier",
        w: 680, h: 240,
        aria: "A quantum wave travels through two aluminium electrodes separated by a thin oxide barrier. Inside the barrier the wave shrinks exponentially.",
        defaults: { d: 1.2 },
        sliders: [["Oxide thickness", "d", 0.6, 2.4, 0.02, function (v) { return v.toFixed(2) + " nm"; }]],
        stats: [["Wave left on the far side", "w"], ["Supercurrent (vs 1.2 nm)", "ic"]],
        animated: true,
        formula: "A Josephson junction is two superconductors separated by an insulating barrier: usually aluminium oxide only 1 to 2 nm thick, a few atoms. Classically nothing can cross an insulator, but quantum waves leak through: <b>tunnelling</b>. The pair wave shrinks exponentially inside the barrier, so a tenth of a nanometre more oxide cuts the current by about a factor of e. That's why junctions are so sensitive to fabrication.",
        read: function (s) {

            const amp = Math.exp(-(s.d) * 2.5);
            const ic = Math.exp(-(s.d - 1.2) * 10);

            return {
                w: (amp * 100).toFixed(amp < 0.1 ? 1 : 0) + "%",
                ic: ic >= 10 ? Math.round(ic) + "×" : ic >= 0.1 ? ic.toFixed(2) + "×" : "under 0.1×",
                verdict: s.d < 0.9 ? "Very thin: a big current, but pinholes are likely" : s.d > 2 ? "Too thick: almost no supercurrent gets through" : "A good qubit junction: a small, controlled supercurrent"
            };
        },
        reward: { when: function (s) { return s.d >= 1 && s.d <= 2; }, msg: "You tuned a tunnel barrier" },
        draw: function (ctx, s, d, time) {

            const bx = 300;
            const bw = s.d * 60;
            const amp = 60;
            const kappa = 2.5 / 60;

            box(ctx, 20, 60, bx - 20, 120, "rgba(170,190,220,.18)");
            box(ctx, bx + bw, 60, 640 - bx - bw, 120, "rgba(170,190,220,.18)");
            box(ctx, bx, 60, bw, 120, "rgba(190,150,255,.35)", PURPLE + ".8)");
            txt(ctx, "aluminium", 160, 196, 12, GREY + ".9)");
            txt(ctx, "aluminium", bx + bw + 160, 196, 12, GREY + ".9)");
            txt(ctx, "oxide " + s.d.toFixed(1) + " nm", bx + bw / 2, 52, 12, PURPLE + "1)", "center", true);

            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            const ph = time * 1.2;
            const tail = Math.exp(-kappa * bw);

            for (let x = 20; x <= 640; x += 2) {

                let y;

                if (x < bx) { y = amp * Math.cos((x - bx) * 0.08 - ph); }
                else if (x < bx + bw) { y = amp * Math.cos(-ph) * Math.exp(-kappa * (x - bx)); }
                else { y = amp * tail * Math.cos((x - bx - bw) * 0.08 - ph); }

                if (x === 20) { ctx.moveTo(x, 120 - y); } else { ctx.lineTo(x, 120 - y); }
            }

            ctx.stroke();
            txt(ctx, "pair wave", 60, 40, 12, GOLD + "1)", "left");
        }
    });


    make("qc-jjiv", {
        title: "Try it: current with no voltage",
        w: 680, h: 250,
        aria: "The current-voltage curve of a Josephson junction: a vertical line at zero voltage up to the critical current, then a jump to a voltage.",
        defaults: { i: 0.5 },
        sliders: [["Current you push through ÷ critical current", "i", 0, 2, 0.01, function (v) { return v.toFixed(2); }]],
        stats: [["Voltage across junction", "v"], ["Josephson oscillation", "f"]],
        animated: true,
        liveRead: true,
        formula: "Below a <b>critical current</b> I<sub>c</sub> (tens of nanoamps for a qubit junction), pairs tunnel through with <b>zero voltage</b>: the DC Josephson effect. Push more current and a voltage V appears; the junction then oscillates at f = 2eV/h, about 484 GHz per millivolt (the AC Josephson effect). Brian Josephson predicted both in 1962. Qubits always run below I<sub>c</sub>.",
        init: function (s, d) { d.t = 0; },
        step: function (dt, s, d) { d.t += dt; },
        read: function (s) {

            const v = s.i <= 1 ? 0 : Math.max(0.36, 0.28 * s.i);

            return {
                v: v === 0 ? "0 (exactly)" : v.toFixed(2) + " mV",
                f: v === 0 ? "none" : Math.round(v * 483.6) + " GHz",
                verdict: s.i <= 1 ? "Supercurrent: pairs tunnel with no voltage" : "Over the critical current: a voltage appears and the junction oscillates"
            };
        },
        reward: { when: function (s) { return s.i > 1.05; }, msg: "You pushed a junction past its critical current" },
        draw: function (ctx, s, d) {

            const gx = 60, gy = 30, gw = 300, gh = 180;
            const X = function (v) { return gx + v / 0.6 * gw; };
            const Y = function (i) { return gy + gh - i / 2 * gh; };

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);
            txt(ctx, "voltage (mV)", gx + gw / 2, gy + gh + 32, 11, GREY + ".85)");
            txt(ctx, "current ÷ critical current", gx + 4, gy - 10, 11, GREY + ".85)", "left");

            [0, 0.2, 0.4, 0.6].forEach(function (v) { txt(ctx, String(v), X(v), gy + gh + 15, 11, GREY + ".8)"); });
            [1, 2].forEach(function (i) { txt(ctx, String(i), gx - 6, Y(i) + 4, 11, GREY + ".8)", "right"); });

            line(ctx, X(0), Y(0), X(0), Y(1), TEAL + "1)", 3);
            line(ctx, X(0), Y(1), X(0.36), Y(1), GREY + ".6)", 1, [4, 4]);

            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(X(0.36), Y(1));
            ctx.lineTo(X(0.36), Y(1.29));
            ctx.lineTo(X(0.56), Y(2));
            ctx.stroke();

            const v = s.i <= 1 ? 0 : Math.max(0.36, 0.28 * s.i);

            dot(ctx, X(v), Y(s.i), 7, ROSE + "1)");

            // the junction picture
            const jx = 520, jy = 120;

            box(ctx, jx - 120, jy - 25, 100, 50, "rgba(170,190,220,.3)");
            box(ctx, jx + 20, jy - 25, 100, 50, "rgba(170,190,220,.3)");
            box(ctx, jx - 20, jy - 25, 40, 50, "rgba(190,150,255,.35)");

            const n = Math.round(s.i * 4);

            for (let k = 0; k < n; k++) {

                const x = jx - 120 + ((d.t * 50 + k * 240 / Math.max(n, 1)) % 240);

                dot(ctx, x, jy - 6 + (k % 2) * 12, 4, GOLD + "1)");
            }

            if (v > 0) {

                ctx.strokeStyle = ROSE + "1)";
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let x = 0; x <= 200; x++) { ctx.lineTo(jx - 100 + x, jy + 60 + Math.sin(x * 0.25 - d.t * 8) * 8); }

                ctx.stroke();
                txt(ctx, "oscillating at " + Math.round(v * 483.6) + " GHz", jx, jy + 90, 11, ROSE + "1)");
            } else {

                txt(ctx, "V = 0", jx, jy + 66, 14, TEAL + "1)", "center", true);
            }
        }
    });


    make("qc-lj", {
        title: "Try it: an inductor that changes with current",
        w: 680, h: 240,
        aria: "The inductance of a Josephson junction rises as more current flows through it, unlike an ordinary coil.",
        defaults: { i: 0.3 },
        sliders: [["Current ÷ critical current", "i", -0.95, 0.95, 0.01, function (v) { return v.toFixed(2); }]],
        stats: [["Junction phase", "ph"], ["Junction inductance", "l"], ["Ordinary coil", "c"]],
        formula: "Current through a junction sets the phase difference φ between the two pair waves: I = I<sub>c</sub> sin φ. A junction therefore acts as an inductor with L<sub>J</sub> = Φ<sub>0</sub> / (2π I<sub>c</sub> cos φ). Unlike a coil, its inductance <b>depends on the current</b>. This nonlinearity, with no resistance at all, is the one ingredient that turns a plain circuit into a qubit. (Here I<sub>c</sub> = 30 nA.)",
        read: function (s) {

            const ph = Math.asin(s.i);
            const L0 = PHI0 / (2 * Math.PI * 30e-9) * 1e9;
            const L = L0 / Math.cos(ph);

            return {
                ph: Math.round(ph * 180 / Math.PI) + "°",
                l: L.toFixed(1) + " nH",
                c: L0.toFixed(1) + " nH (always)",
                verdict: Math.abs(s.i) > 0.7 ? "High current: the junction's inductance has grown a lot" : "Small current: almost like an ordinary coil"
            };
        },
        reward: { when: function (s) { return Math.abs(s.i) > 0.8; }, msg: "You saw the junction's nonlinear inductance" },
        draw: function (ctx, s) {

            const gx = 60, gy = 30, gw = 260, gh = 170;
            const L0 = PHI0 / (2 * Math.PI * 30e-9) * 1e9;
            const X = function (i) { return gx + (i + 1) / 2 * gw; };
            const Y = function (L) { return gy + gh - (L / 40) * gh; };

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);
            txt(ctx, "current ÷ critical current", gx + gw / 2, gy + gh + 30, 11, GREY + ".85)");
            txt(ctx, "inductance (nH)", gx + 4, gy - 10, 11, GREY + ".85)", "left");

            [-1, 0, 1].forEach(function (i) { txt(ctx, String(i), X(i), gy + gh + 15, 11, GREY + ".8)"); });
            [0, 20, 40].forEach(function (L) { txt(ctx, String(L), gx - 6, Y(L) + 4, 11, GREY + ".8)", "right"); });

            line(ctx, gx, Y(L0), gx + gw, Y(L0), BLUE + ".9)", 2, [5, 4]);
            txt(ctx, "coil", gx + gw + 6, Y(L0) + 4, 11, BLUE + "1)", "left");

            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let k = -95; k <= 95; k++) {

                const i = k / 100;
                const L = Math.min(40, L0 / Math.cos(Math.asin(i)));

                if (k === -95) { ctx.moveTo(X(i), Y(L)); } else { ctx.lineTo(X(i), Y(L)); }
            }

            ctx.stroke();
            txt(ctx, "junction", X(0.6), Y(L0 / Math.cos(Math.asin(0.6))) - 10, 11, GOLD + "1)");

            dot(ctx, X(s.i), Y(Math.min(40, L0 / Math.cos(Math.asin(s.i)))), 7, ROSE + "1)");

            // the potential well: -cos (junction) vs parabola (coil)
            const px = 400, py = 60, pw = 250, ph = 140;
            const P = function (phi) { return px + (phi / Math.PI + 1) / 2 * pw; };

            txt(ctx, "energy vs phase", px + pw / 2, py - 18, 12, TEXT + ".9)", "center", true);

            ctx.strokeStyle = BLUE + ".9)";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();

            for (let k = -100; k <= 100; k++) {

                const phi = k / 100 * Math.PI;

                if (k === -100) { ctx.moveTo(P(phi), py + ph - phi * phi / 2 / 5 * ph); } else { ctx.lineTo(P(phi), py + ph - phi * phi / 2 / 5 * ph); }
            }

            ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let k = -100; k <= 100; k++) {

                const phi = k / 100 * Math.PI;

                if (k === -100) { ctx.moveTo(P(phi), py + ph - (1 - Math.cos(phi)) / 5 * ph); } else { ctx.lineTo(P(phi), py + ph - (1 - Math.cos(phi)) / 5 * ph); }
            }

            ctx.stroke();

            const phi0 = Math.asin(s.i);

            dot(ctx, P(phi0), py + ph - (1 - Math.cos(phi0)) / 5 * ph, 6, ROSE + "1)");
            txt(ctx, "coil: parabola", px + pw - 4, py + 18, 10, BLUE + "1)", "right");
            txt(ctx, "junction: flatter cosine", px + pw / 2, py + ph + 20, 10, GOLD + "1)");
        }
    });


    function squidF(phi, d) {

        const ej = 20 * Math.sqrt(Math.pow(Math.cos(Math.PI * phi), 2) + d * d * Math.pow(Math.sin(Math.PI * phi), 2));

        return Math.sqrt(8 * ej * 0.25) - 0.25;
    }

    make("qc-squid", {
        title: "Try it: tune a qubit with a magnetic field",
        w: 680, h: 240,
        aria: "A SQUID loop made of two Josephson junctions. Magnetic flux through the loop lowers the qubit frequency.",
        defaults: { phi: 0.2, d: 0 },
        sliders: [["Flux through the loop (in Φ₀)", "phi", 0, 1, 0.005, function (v) { return v.toFixed(3); }], ["Junction mismatch", "d", 0, 0.5, 0.01, function (v) { return Math.round(v * 100) + "%"; }]],
        stats: [["Qubit frequency", "f"], ["Sensitivity to flux noise", "s"]],
        formula: "Put two junctions in a small loop and you get a <b>SQUID</b>, which acts like one junction whose strength you can tune: E<sub>J</sub> = E<sub>J,max</sub> |cos(πΦ/Φ<sub>0</sub>)| for matched junctions. A current in a nearby 'flux line' threads flux Φ through the loop and lowers the qubit frequency. At the top of the curve (the <b>sweet spot</b>) the frequency barely changes with flux, so noise there does least harm. Making the two junctions different on purpose limits how far the frequency can drop.",
        read: function (s) {

            const f = squidF(s.phi, s.d);
            const slope = Math.abs(squidF(s.phi + 0.002, s.d) - squidF(Math.max(0, s.phi - 0.002), s.d)) / (s.phi < 0.002 ? 0.002 : 0.004);

            return {
                f: f > 0 ? fmtGHz(f) : "0",
                s: slope < 0.3 ? "Low (sweet spot)" : slope < 3 ? "Medium" : "High",
                verdict: Math.abs(f - 5) < 0.03 ? "Tuned to 5.00 GHz" : s.phi < 0.02 ? "At the sweet spot: highest frequency, least noise" : "Flux has tuned the qubit down"
            };
        },
        reward: { when: function (s) { return Math.abs(squidF(s.phi, s.d) - 5) < 0.03; }, msg: "You tuned a qubit to 5 GHz with flux" },
        draw: function (ctx, s) {

            const cx = 130, cy = 120;

            ctx.lineWidth = 10;
            ctx.strokeStyle = "rgba(170,190,220,.55)";
            ctx.strokeRect(cx - 70, cy - 60, 140, 120);
            box(ctx, cx - 78, cy - 10, 16, 20, PURPLE + ".9)");
            box(ctx, cx + 62, cy - 10, 16, 20, PURPLE + ".9)");
            txt(ctx, "junction 1", cx - 70, cy + 34, 10, PURPLE + "1)");
            txt(ctx, "junction 2", cx + 70, cy + 34, 10, PURPLE + "1)");

            const n = Math.round(s.phi * 8);

            for (let i = 0; i < n; i++) { txt(ctx, "⊗", cx - 35 + (i % 4) * 23, cy - 18 + Math.floor(i / 4) * 30, 14, GOLD + "1)"); }

            txt(ctx, "flux Φ", cx, cy + 50, 11, GOLD + "1)");
            line(ctx, cx - 90, cy + 80, cx + 90, cy + 80, BLUE + "1)", 3);
            txt(ctx, "flux line", cx, cy + 98, 10, BLUE + "1)");

            const gx = 300, gy = 30, gw = 350, gh = 170;
            const X = function (p) { return gx + p * gw; };
            const Y = function (f) { return gy + gh - f / 7 * gh; };

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);
            txt(ctx, "flux (Φ₀)", gx + gw / 2, gy + gh + 30, 11, GREY + ".85)");
            txt(ctx, "qubit frequency (GHz)", gx + 4, gy - 10, 11, GREY + ".85)", "left");

            [0, 0.5, 1].forEach(function (p) { txt(ctx, String(p), X(p), gy + gh + 15, 11, GREY + ".8)"); });
            [0, 2, 4, 6].forEach(function (f) { txt(ctx, String(f), gx - 6, Y(f) + 4, 11, GREY + ".8)", "right"); });

            line(ctx, gx, Y(5), gx + gw, Y(5), TEAL + ".4)", 1, [4, 4]);

            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let k = 0; k <= 200; k++) {

                const p = k / 200;
                const f = Math.max(0, squidF(p, s.d));

                if (k === 0) { ctx.moveTo(X(p), Y(f)); } else { ctx.lineTo(X(p), Y(f)); }
            }

            ctx.stroke();
            dot(ctx, X(s.phi), Y(Math.max(0, squidF(s.phi, s.d))), 7, ROSE + "1)");
            txt(ctx, "sweet spot", X(0) + 8, Y(squidF(0, s.d)) - 8, 10, TEAL + "1)", "left");
        }
    });


    /* ======================================
       UNIT 18: FROM LC CIRCUIT TO TRANSMON
    ====================================== */

    make("qc-lc", {
        title: "Try it: an LC circuit rings like a pendulum",
        w: 680, h: 240,
        aria: "A capacitor and an inductor pass energy back and forth. The energy level ladder on the right has equal steps.",
        defaults: { L: 10, C: 80 },
        sliders: [["Inductance L", "L", 1, 20, 0.5, function (v) { return v + " nH"; }], ["Capacitance C", "C", 20, 200, 1, function (v) { return v + " fF"; }]],
        stats: [["Resonant frequency", "f"], ["Energy step", "e"]],
        animated: true,
        formula: "A capacitor (two metal pads) and an inductor (a coil, or later a junction) pass energy back and forth, like a pendulum swapping height for speed. It rings at f = 1 / (2π√(LC)). Nanohenries and tens of femtofarads give a few GHz. Quantum mechanically, its energy comes in equal steps of hf, a ladder of evenly spaced levels. (The animation is slowed down by about a billion times.)",
        init: function (s, d) { d.t = 0; },
        step: function (dt, s, d) { d.t += dt; },
        read: function (s) {

            const f = 1 / (2 * Math.PI * Math.sqrt(s.L * 1e-9 * s.C * 1e-15)) / 1e9;

            return {
                f: fmtGHz(f),
                e: (f * 4.136).toFixed(1) + " µeV",
                verdict: f >= 4 && f <= 6 ? "In the qubit band: 4 to 6 GHz" : f > 6 ? "Higher than most qubits" : "Lower than most qubits"
            };
        },
        reward: { when: function (s) { const f = 1 / (2 * Math.PI * Math.sqrt(s.L * 1e-9 * s.C * 1e-15)) / 1e9; return f >= 4 && f <= 6; }, msg: "You tuned an LC circuit into the qubit band" },
        draw: function (ctx, s, d) {

            const ph = d.t * Math.PI * 2 / 6;
            const q = Math.cos(ph);
            const i = Math.sin(ph);

            line(ctx, 80, 60, 80, 180, GREY + ".7)", 2);
            line(ctx, 80, 60, 300, 60, GREY + ".7)", 2);
            line(ctx, 80, 180, 300, 180, GREY + ".7)", 2);
            line(ctx, 300, 60, 300, 95, GREY + ".7)", 2);
            line(ctx, 300, 145, 300, 180, GREY + ".7)", 2);
            box(ctx, 50, 105, 60, 8, TEAL + (0.3 + 0.7 * Math.max(0, q)) + ")");
            box(ctx, 50, 127, 60, 8, ROSE + (0.3 + 0.7 * Math.max(0, -q)) + ")");
            txt(ctx, q > 0 ? "+" : "−", 40, 112, 14, TEXT + ".9)", "center", true);
            txt(ctx, q > 0 ? "−" : "+", 40, 138, 14, TEXT + ".9)", "center", true);
            txt(ctx, "C", 30, 125, 13, TEAL + "1)", "center", true);

            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let k = 0; k <= 50; k++) { ctx.lineTo(300 + Math.sin(k / 50 * Math.PI * 8) * 12, 95 + k); }

            ctx.stroke();
            txt(ctx, "L", 330, 125, 13, GOLD + "1)", "center", true);

            for (let r = 1; r <= 3; r++) {

                ctx.strokeStyle = GOLD + (Math.abs(i) * 0.6 / r) + ")";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.ellipse(300, 120, 18 + r * 12, 34 + r * 8, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            txt(ctx, "energy in C: electric", 190, 210, 11, TEAL + (0.4 + 0.6 * q * q) + ")");
            txt(ctx, "energy in L: magnetic", 190, 226, 11, GOLD + (0.4 + 0.6 * i * i) + ")");

            // ladder
            txt(ctx, "energy levels", 560, 30, 12, TEXT + ".9)", "center", true);

            for (let n = 0; n < 5; n++) {

                const y = 200 - n * 38;

                line(ctx, 500, y, 620, y, BLUE + "1)", 2);
                txt(ctx, "|" + n + "⟩", 490, y + 4, 11, BLUE + "1)", "right");

                if (n < 4) { txt(ctx, "hf", 640, y - 15, 10, GREY + ".85)", "left"); }
            }

            txt(ctx, "all steps equal", 560, 226, 11, GREY + ".85)");
        }
    });


    make("qc-anharm", {
        title: "Try it: make the steps uneven",
        w: 680, h: 240,
        aria: "An energy ladder with a drive tuned to the bottom step. With equal steps the drive climbs the whole ladder; with a junction the upper steps are smaller and the drive stays on the bottom two.",
        defaults: { a: 0 },
        sliders: [["Anharmonicity (from the junction)", "a", 0, 350, 5, function (v) { return v + " MHz"; }]],
        stats: [["0→1 step", "f01"], ["1→2 step", "f12"], ["Leaks into |2⟩?", "lk"]],
        animated: true,
        formula: "In a plain LC circuit every step is the same size, so a pulse that lifts 0 to 1 would also lift 1 to 2, 2 to 3 and so on: no qubit. Swap the coil for a Josephson junction and the upper steps shrink. The difference f<sub>12</sub> − f<sub>01</sub> is the <b>anharmonicity</b>, about −200 to −300 MHz in a transmon. A 20 ns pulse has a spread of about 50 MHz, so it only drives the 0↔1 step and the circuit behaves as a two-level qubit.",
        init: function (s, d) { d.t = 0; },
        step: function (dt, s, d) { d.t += dt; },
        read: function (s) {

            const leak = s.a < 50;

            return {
                f01: "5.00 GHz",
                f12: (5 - s.a / 1000).toFixed(2) + " GHz",
                lk: leak ? "Yes" : s.a < 150 ? "A little" : "No",
                verdict: leak ? "Equal steps: the drive climbs the whole ladder" : s.a < 150 ? "Better, but fast pulses still leak" : "Uneven steps: a clean two-level qubit"
            };
        },
        reward: { when: function (s) { return s.a >= 200; }, msg: "You made a two-level qubit from a ladder" },
        draw: function (ctx, s, d) {

            const a = s.a / 1000;
            const E = [0, 5, 10 - a, 15 - 3 * a, 20 - 6 * a];
            const Y = function (e) { return 210 - e * 8.5; };
            const leak = s.a < 50 ? 1 : s.a < 150 ? 0.4 : 0;

            for (let n = 0; n < 5; n++) {

                line(ctx, 200, Y(E[n]), 360, Y(E[n]), (n < 2 ? GOLD : GREY) + "1)", 2.5);
                txt(ctx, "|" + n + "⟩", 190, Y(E[n]) + 4, 12, (n < 2 ? GOLD : GREY) + "1)", "right", true);
            }

            const k = (d.t % 6.5) / 6.5;
            const top = leak >= 1 ? Math.min(4, Math.floor(k * 5)) : leak > 0 ? (k > 0.5 ? 2 : 1) : 1;

            for (let n = 0; n < top; n++) {

                const ok = n === 0 || leak > 0;

                arrow(ctx, 260 + n * 22, Y(E[n]) - 2, 260 + n * 22, Y(E[n + 1]) + 4, (n === 0 ? TEAL : ROSE) + (ok ? "1)" : ".2)"), 2.5);
            }

            dot(ctx, 330, Y(E[top]), 7, PURPLE + "1)");

            txt(ctx, "drive pulse tuned to 5.00 GHz", 520, 60, 12, TEAL + "1)");

            for (let n = 0; n < 4; n++) {

                const gap = (E[n + 1] - E[n]).toFixed(2);

                txt(ctx, "step " + n + "→" + (n + 1) + ": " + gap + " GHz", 520, 100 + n * 24, 12, n === 0 ? TEAL + "1)" : (Math.abs(E[n + 1] - E[n] - 5) < 0.05 ? ROSE + "1)" : GREY + ".9)"));
            }
        }
    });


    make("qc-charge", {
        title: "Try it: from Cooper-pair box to transmon",
        w: 680, h: 240,
        aria: "The qubit frequency plotted against stray charge on the island. At a low ratio of Josephson to charging energy it wiggles; at a high ratio it is flat.",
        defaults: { r: 0.3 },
        sliders: [["Josephson energy ÷ charging energy", "r", 0, 2.1, 0.01, function (v) { return Math.pow(10, v).toFixed(Math.pow(10, v) < 10 ? 1 : 0); }]],
        stats: [["Frequency wobble from charge", "w"], ["Anharmonicity ÷ frequency", "a"]],
        formula: "The first superconducting qubit (the Cooper-pair box, 1999) was very sensitive to stray electric charges near the island: its frequency wobbled as charges hopped around. In 2007 the <b>transmon</b> (Koch et al.) fixed this with a large shunting capacitor, which raises E<sub>J</sub>/E<sub>C</sub> to about 50. The charge wobble shrinks exponentially, while the anharmonicity shrinks only slowly, so the transmon keeps enough unevenness to stay a qubit.",
        read: function (s) {

            const r = Math.pow(10, s.r);
            const w = disp(r);
            const f = Math.sqrt(8 * r) - 1;
            const rel = 1 / Math.max(0.5, f);

            return {
                w: r < 5 ? "huge" : w * 250 > 1 ? Math.round(w * 250) + " MHz" : w * 250e3 > 1 ? Math.round(w * 250e3) + " kHz" : "under 1 kHz",
                a: Math.round(rel * 100) + "%",
                verdict: r < 5 ? "Cooper-pair box: charge noise shakes the frequency" : r < 30 ? "In between: still charge sensitive" : "Transmon: flat, charge noise can't touch it"
            };
        },
        reward: { when: function (s) { return Math.pow(10, s.r) >= 40; }, msg: "You turned a Cooper-pair box into a transmon" },
        draw: function (ctx, s) {

            const r = Math.pow(10, s.r);
            const w = disp(r);
            const gx = 70, gy = 40, gw = 380, gh = 160;
            const amp = clamp((Math.log10(Math.max(w, 1e-9)) + 6) / 6, 0, 1) * 60;

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);
            txt(ctx, "stray charge on the island", gx + gw / 2, gy + gh + 30, 11, GREY + ".85)");
            txt(ctx, "qubit frequency", gx + 4, gy - 10, 11, GREY + ".85)", "left");
            txt(ctx, "−1e", gx, gy + gh + 15, 10, GREY + ".8)");
            txt(ctx, "0", gx + gw / 2, gy + gh + 15, 10, GREY + ".8)");
            txt(ctx, "+1e", gx + gw, gy + gh + 15, 10, GREY + ".8)");

            ctx.strokeStyle = (r >= 30 ? TEAL : r >= 5 ? GOLD : ROSE) + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let k = 0; k <= 200; k++) {

                const ng = k / 100 - 1;
                const y = gy + gh / 2 - amp * Math.cos(2 * Math.PI * ng);

                if (k === 0) { ctx.moveTo(gx + k / 200 * gw, y); } else { ctx.lineTo(gx + k / 200 * gw, y); }
            }

            ctx.stroke();

            // the circuit sketch
            const cx = 570, cy = 120;
            const capW = clamp(20 + Math.log10(r) * 40, 20, 100);

            box(ctx, cx - capW / 2, cy - 50, capW, 18, TEAL + ".6)", TEAL + "1)");
            box(ctx, cx - capW / 2, cy + 32, capW, 18, TEAL + ".6)", TEAL + "1)");
            line(ctx, cx, cy - 32, cx, cy - 8, GREY + ".8)", 2);
            line(ctx, cx, cy + 8, cx, cy + 32, GREY + ".8)", 2);
            box(ctx, cx - 8, cy - 8, 16, 16, PURPLE + "1)");
            txt(ctx, r >= 30 ? "transmon: big capacitor pads" : "Cooper-pair box: tiny island", cx, cy + 80, 11, TEXT + ".9)");
        }
    });

    // Koch et al. 2007: charge dispersion of the 0-1 transition, in units of E_C.
    function disp(r) {

        const e = Math.exp(-Math.sqrt(8 * r));
        const c = Math.sqrt(2 / Math.PI);
        const e0 = 32 * c * Math.pow(r / 2, 0.75) * e;
        const e1 = 512 * c * Math.pow(r / 2, 1.25) * e;

        return Math.abs(e1 - e0);
    }


    make("qc-transmon", {
        title: "Design it: a 5 GHz transmon",
        w: 680, h: 240,
        aria: "Sliders set the Josephson energy and charging energy of a transmon. The energy levels, capacitor size and junction inductance update.",
        defaults: { ej: 20, ec: 0.35 },
        sliders: [["Josephson energy E<sub>J</sub>/h (the junction)", "ej", 5, 40, 0.1, function (v) { return v.toFixed(1) + " GHz"; }], ["Charging energy E<sub>C</sub>/h (the pads)", "ec", 0.1, 0.5, 0.005, function (v) { return Math.round(v * 1000) + " MHz"; }]],
        stats: [["Qubit frequency", "f"], ["Anharmonicity", "a"], ["Pad capacitance", "c"], ["Junction inductance", "l"]],
        formula: "The two numbers that define a transmon: E<sub>C</sub> = e²/2C, set by the size of the capacitor pads, and E<sub>J</sub>, set by the junction. The qubit frequency is f<sub>01</sub> ≈ √(8E<sub>J</sub>E<sub>C</sub>) − E<sub>C</sub> and the anharmonicity is about −E<sub>C</sub>. Target: 4.8 to 5.2 GHz with an anharmonicity of 200 to 300 MHz. Fabrication then has to build exactly these values (Part 4).",
        read: function (s) {

            const f = Math.sqrt(8 * s.ej * s.ec) - s.ec;
            const C = 1.602e-19 * 1.602e-19 / (2 * H_PLANCK * s.ec * 1e9) * 1e15;
            const L = Math.pow(PHI0 / (2 * Math.PI), 2) / (H_PLANCK * s.ej * 1e9) * 1e9;
            const ok = f >= 4.8 && f <= 5.2 && s.ec >= 0.2 && s.ec <= 0.3;

            return {
                f: fmtGHz(f),
                a: "−" + Math.round(s.ec * 1000) + " MHz",
                c: Math.round(C) + " fF",
                l: L.toFixed(1) + " nH",
                verdict: ok ? "A good transmon design, ready to fabricate" : f < 4.8 || f > 5.2 ? "Aim for a frequency of 4.8 to 5.2 GHz" : "Aim for an anharmonicity of 200 to 300 MHz"
            };
        },
        reward: { when: function (s) { const f = Math.sqrt(8 * s.ej * s.ec) - s.ec; return f >= 4.8 && f <= 5.2 && s.ec >= 0.2 && s.ec <= 0.3; }, msg: "You designed a transmon" },
        draw: function (ctx, s) {

            const f = Math.sqrt(8 * s.ej * s.ec) - s.ec;
            const E = [0, f, 2 * f - s.ec];
            const Y = function (e) { return 200 - e * 14; };

            [[0, TEAL], [1, GOLD], [2, GREY]].forEach(function (l) {

                line(ctx, 60, Y(E[l[0]]), 200, Y(E[l[0]]), l[1] + "1)", 2.5);
                txt(ctx, "|" + l[0] + "⟩", 50, Y(E[l[0]]) + 4, 12, l[1] + "1)", "right", true);
            });

            arrow(ctx, 130, Y(0) - 2, 130, Y(E[1]) + 4, TEAL + "1)", 2);
            txt(ctx, fmtGHz(f), 140, (Y(0) + Y(E[1])) / 2, 11, TEAL + "1)", "left");
            arrow(ctx, 170, Y(E[1]) - 2, 170, Y(E[2]) + 4, GREY + ".9)", 2);
            txt(ctx, fmtGHz(f - s.ec), 180, (Y(E[1]) + Y(E[2])) / 2 + 12, 11, GREY + "1)", "left");

            if (f >= 4.8 && f <= 5.2) { box(ctx, 56, Y(5.2), 148, Y(4.8) - Y(5.2), "rgba(84,224,199,.12)"); }

            // the transmon: two pads and a junction; pad size grows as E_C falls
            const cx = 470, cy = 120;
            const pad = clamp(30 + (0.5 - s.ec) * 200, 30, 110);
            const jj = clamp(4 + s.ej / 4, 4, 14);

            box(ctx, cx - 30 - pad, cy - pad / 2, pad, pad, TEAL + ".45)", TEAL + "1)");
            box(ctx, cx + 30, cy - pad / 2, pad, pad, TEAL + ".45)", TEAL + "1)");
            line(ctx, cx - 30, cy, cx - jj / 2, cy, GREY + ".9)", 3);
            line(ctx, cx + jj / 2, cy, cx + 30, cy, GREY + ".9)", 3);
            box(ctx, cx - jj / 2, cy - jj / 2, jj, jj, PURPLE + "1)");
            txt(ctx, "capacitor pads: set the charging energy", cx, cy + pad / 2 + 22, 11, TEAL + "1)");
            txt(ctx, "junction: sets the Josephson energy", cx, cy - pad / 2 - 12, 11, PURPLE + "1)");
        }
    });


    SIMS["qc-shapes"] = stepper({
        title: "Explore: the transmon family",
        viewBox: "0 0 340 190",
        aria: "Four transmon designs: two pads, a cross-shaped Xmon, a tunable transmon with a SQUID, and a 3D transmon in a metal box.",
        interval: 6.5,
        steps: [
            { t: "Two-pad transmon", text: "Two large aluminium or niobium pads, a few hundred micrometres across, joined by one tiny junction. The pads form the capacitor that sets the charging energy." },
            { t: "The Xmon", text: "A cross-shaped island, with the junction connecting one arm to the ground plane. The four arms reach out to couplers, the drive line and the readout resonator. Google's chips use this design." },
            { t: "Tunable transmon", text: "Replace the single junction with a SQUID loop (two junctions) and add a flux line. The frequency can then be adjusted after the chip is made, at the cost of some flux noise." },
            { t: "3D transmon", text: "Put a transmon inside a machined metal box that acts as a 3D resonator (Paik et al., 2011). Most of the field sits in vacuum, far from lossy surfaces, so it lives longer, but it doesn't scale well." }
        ],
        rewardKey: "qc-shapes",
        rewardMsg: "You met the transmon family",
        draw: function (step, st) {

            const glow = 0.35 + 0.25 * Math.sin(st.anim * 1.2);
            let s = "";

            if (step === 0) {

                s += sR(60, 60, 90, 70, "rgba(84,224,199," + glow + ")", "#54e0c7", 4) + sR(190, 60, 90, 70, "rgba(84,224,199," + glow + ")", "#54e0c7", 4);
                s += sL(150, 95, 165, 95, "#aab3cf", 2) + sL(175, 95, 190, 95, "#aab3cf", 2) + sR(165, 90, 10, 10, "#be96ff");
                s += sT(170, 150, "pad + junction + pad", 9, "#aab3cf");
            }

            if (step === 1) {

                s += sR(20, 20, 300, 160, "rgba(170,179,207,.15)", "#aab3cf", 4);
                s += sR(110, 90, 120, 18, "rgba(84,224,199," + glow + ")", "#54e0c7") + sR(161, 40, 18, 118, "rgba(84,224,199," + glow + ")", "#54e0c7");
                s += sR(165, 158, 10, 8, "#be96ff") + sT(200, 175, "junction to ground", 8, "#be96ff");
                s += sT(80, 99, "coupler", 8, "#f5f7ff") + sT(255, 99, "readout", 8, "#f5f7ff") + sT(170, 34, "drive", 8, "#f5f7ff");
            }

            if (step === 2) {

                s += sR(60, 40, 90, 70, "rgba(84,224,199," + glow + ")", "#54e0c7", 4) + sR(190, 40, 90, 70, "rgba(84,224,199," + glow + ")", "#54e0c7", 4);
                s += sR(150, 65, 40, 20, "none", "#aab3cf") + sR(146, 71, 8, 8, "#be96ff") + sR(186, 71, 8, 8, "#be96ff");
                s += sL(120, 140, 220, 140, "#78b4ff", 3) + sP("M170 140 Q170 110 170 90", "#ffd666", 1.2) + sT(170, 158, "flux line", 9, "#78b4ff") + sT(170, 30, "SQUID loop", 9, "#be96ff");
            }

            if (step === 3) {

                s += sR(40, 40, 260, 120, "rgba(200,131,79,.25)", "#c8834f", 10) + sT(170, 32, "aluminium box (a 3D cavity)", 9, "#c8834f");
                s += sR(100, 92, 140, 8, "rgba(120,180,255,.4)", "#78b4ff") + sR(150, 85, 18, 22, "rgba(84,224,199," + glow + ")", "#54e0c7") + sR(172, 85, 18, 22, "rgba(84,224,199," + glow + ")", "#54e0c7");
                s += sT(170, 125, "sapphire chip with a transmon", 9, "#f5f7ff");

                for (let i = 0; i < 4; i++) { s += sP("M" + (70 + i * 60) + " 60 Q" + (85 + i * 60) + " " + (75 + 10 * Math.sin(st.anim + i)) + " " + (100 + i * 60) + " 60", "rgba(255,214,102,.6)", 1); }
            }

            return s;
        }
    });


    /* ======================================
       UNIT 19: RESONATORS AND READOUT
    ====================================== */

    make("qc-cpw", {
        title: "Try it: tune a resonator by its length",
        w: 680, h: 240,
        aria: "A meandering quarter-wave coplanar waveguide resonator with a standing wave glowing along it.",
        defaults: { len: 4.5, sub: "si" },
        segs: [["Substrate", "sub", [["si", "Silicon"], ["sa", "Sapphire"]]]],
        sliders: [["Resonator length", "len", 2, 10, 0.05, function (v) { return v.toFixed(2) + " mm"; }]],
        stats: [["Resonant frequency", "f"], ["Wavelength on chip", "w"]],
        animated: true,
        formula: "A readout resonator is a strip of superconductor between two ground planes (a <b>coplanar waveguide</b>), folded into a meander to save space. Shorted at one end and open at the other, it rings when its length is a quarter of a wavelength: f = c / (4ℓ√ε<sub>eff</sub>). On silicon, ε<sub>eff</sub> ≈ (11.7 + 1)/2 ≈ 6.3 because half the field is in the chip and half in vacuum. A 4.5 mm line rings near 6.6 GHz.",
        init: function (s, d) { d.t = 0; },
        step: function (dt, s, d) { d.t += dt; },
        read: function (s) {

            const ee = s.sub === "si" ? 6.35 : 5.7;
            const f = 3e8 / (4 * s.len * 1e-3 * Math.sqrt(ee)) / 1e9;

            return {
                f: fmtGHz(f),
                w: (s.len * 4).toFixed(1) + " mm",
                verdict: f >= 6 && f <= 7.5 ? "In the readout band, above the qubits" : f < 6 ? "Too low: it would sit among the qubit frequencies" : "Higher than usual readout"
            };
        },
        reward: { when: function (s) { const f = 3e8 / (4 * s.len * 1e-3 * Math.sqrt(s.sub === "si" ? 6.35 : 5.7)) / 1e9; return f >= 6.5 && f <= 7; }, msg: "You tuned a readout resonator" },
        draw: function (ctx, s, d) {

            const n = Math.max(2, Math.round(s.len * 1.6));
            const pts = [[60, 120]];
            const w = 520 / n;

            for (let i = 0; i < n; i++) {

                const x0 = 80 + i * w;

                pts.push([x0, 120], [x0, i % 2 ? 190 : 50], [x0 + w * 0.5, i % 2 ? 190 : 50], [x0 + w * 0.5, 120]);
            }

            const lens = [0];

            for (let i = 1; i < pts.length; i++) { lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); }

            const total = lens[lens.length - 1];
            const amp = Math.cos(d.t * Math.PI * 2 / 6);

            for (let i = 1; i < pts.length; i++) {

                const segs = 12;

                for (let k = 0; k < segs; k++) {

                    const u0 = (lens[i - 1] + (lens[i] - lens[i - 1]) * k / segs) / total;
                    const x1 = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k / segs;
                    const y1 = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k / segs;
                    const x2 = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * (k + 1) / segs;
                    const y2 = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * (k + 1) / segs;
                    const v = Math.sin(u0 * Math.PI / 2) * amp;

                    line(ctx, x1, y1, x2, y2, v >= 0 ? "rgba(255,214,102," + (0.25 + 0.75 * v) + ")" : "rgba(120,180,255," + (0.25 - 0.75 * v) + ")", 4);
                }
            }

            const last = pts[pts.length - 1];

            line(ctx, 40, 110, 40, 130, GREY + "1)", 3);
            line(ctx, 40, 120, 60, 120, GREY + "1)", 3);
            txt(ctx, "shorted end (V = 0)", 40, 100, 10, GREY + ".9)", "left");
            txt(ctx, "open end: biggest voltage", last[0], last[1] - 18, 10, GOLD + "1)", "right");
            txt(ctx, "voltage swings: gold +, blue −  (slowed down a billion times)", 340, 228, 11, GREY + ".85)");
        }
    });


    make("qc-qfactor", {
        title: "Try it: quality factor",
        w: 680, h: 240,
        aria: "A resonance dip whose width shrinks as the quality factor rises, and a ring-down that lasts longer.",
        defaults: { lq: 4 },
        sliders: [["Quality factor Q", "lq", 2, 7, 0.05, function (v) { const q = Math.pow(10, v); return q >= 1e6 ? (q / 1e6).toFixed(1) + " million" : Math.round(q).toLocaleString("en-US"); }]],
        stats: [["Linewidth", "lw"], ["Energy lifetime", "tau"]],
        formula: "The quality factor Q counts how many times a resonator rings before its energy fades: Q = f/Δf, where Δf is the width of the dip. The energy lifetime is τ = Q / (2πf). <b>Readout</b> resonators are deliberately leaky (Q of a few thousand) so the signal comes out quickly. <b>Test</b> resonators are made with the highest Q possible: a million or more is how fabs measure how lossy their materials are (Part 5).",
        read: function (s) {

            const q = Math.pow(10, s.lq);
            const f = 6e9;
            const lw = f / q;
            const tau = q / (2 * Math.PI * f) * 1e6;

            return {
                lw: lw >= 1e6 ? (lw / 1e6).toFixed(1) + " MHz" : lw >= 1e3 ? (lw / 1e3).toFixed(1) + " kHz" : Math.round(lw) + " Hz",
                tau: fmtUs(tau),
                verdict: q >= 1e6 ? "A very low-loss resonator: materials-test quality" : q >= 1e3 && q <= 3e4 ? "Typical for a fast readout resonator" : q < 1e3 ? "Very lossy" : "In between"
            };
        },
        reward: { when: function (s) { return s.lq >= 6; }, msg: "You reached a million Q" },
        draw: function (ctx, s) {

            const q = Math.pow(10, s.lq);
            const gx = 50, gy = 40, gw = 280, gh = 150;
            const span = 6e9 / 100;
            const hw = 6e9 / q / 2;
            const vis = Math.max(hw / span * gw, 0.6);

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            txt(ctx, "frequency (±60 MHz around 6 GHz)", gx + gw / 2, gy + gh + 20, 11, GREY + ".85)");
            txt(ctx, "transmission", gx, gy - 12, 11, GREY + ".85)", "left");

            ctx.strokeStyle = TEAL + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let x = 0; x <= gw; x++) {

                const dx = (x - gw / 2);
                const t = 1 - 0.9 / (1 + Math.pow(dx / vis, 2));

                if (x === 0) { ctx.moveTo(gx + x, gy + gh - t * gh); } else { ctx.lineTo(gx + x, gy + gh - t * gh); }
            }

            ctx.stroke();

            const rx = 380, ry = 40, rw = 280, rh = 150;
            const decay = clamp((s.lq - 2) / 5, 0, 1);

            line(ctx, rx, ry + rh / 2, rx + rw, ry + rh / 2, GREY + ".4)", 1);
            txt(ctx, "ring-down after a pulse", rx + rw / 2, ry - 12, 11, GREY + ".85)");

            ctx.strokeStyle = GOLD + "1)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            for (let x = 0; x <= rw; x++) {

                const env = Math.exp(-x / (6 + decay * 600));
                const y = ry + rh / 2 - env * (rh / 2 - 6) * Math.sin(x * 0.6);

                if (x === 0) { ctx.moveTo(rx + x, y); } else { ctx.lineTo(rx + x, y); }
            }

            ctx.stroke();
            txt(ctx, "time →", rx + rw, ry + rh + 20, 11, GREY + ".85)", "right");
        }
    });


    function s21(df, chi, sign) {

        const k = 0.5;
        const den = k * k + Math.pow(df - sign * chi, 2);
        const re = 1 - k * k / den;
        const im = k * (df - sign * chi) / den;

        return [re, im];
    }

    make("qc-dispersive", {
        title: "Try it: read the qubit through its resonator",
        w: 680, h: 240,
        aria: "Two resonance dips, one when the qubit is 0 and one when it is 1. A probe tone placed between them gives the biggest difference.",
        defaults: { q: 0, p: 2.5 },
        segs: [["Qubit is", "q", [[0, "|0⟩"], [1, "|1⟩"]]]],
        sliders: [["Probe tone (MHz from 7 GHz)", "p", -5, 5, 0.05, function (v) { return (v > 0 ? "+" : "") + v.toFixed(2) + " MHz"; }]],
        stats: [["Signal if |0⟩", "a"], ["Signal if |1⟩", "b"], ["Difference", "d"]],
        formula: "The qubit and its resonator are detuned, so they don't swap energy; instead the qubit nudges the resonator's frequency by ±χ (here 1 MHz) depending on whether it is 0 or 1. This is <b>dispersive readout</b>. Send a weak tone near 7 GHz and the transmitted signal (its amplitude and phase) tells you the qubit state without flipping it. The biggest difference comes from probing midway between the two dips, where the phases differ most.",
        read: function (s) {

            const a = s21(s.p, 1, -1);
            const b = s21(s.p, 1, 1);
            const diff = Math.hypot(a[0] - b[0], a[1] - b[1]);
            const best = 0.8;

            return {
                a: Math.round(Math.hypot(a[0], a[1]) * 100) + "%",
                b: Math.round(Math.hypot(b[0], b[1]) * 100) + "%",
                d: Math.round(diff / best * 100) + "% of best",
                verdict: diff >= best * 0.9 ? "Great spot: 0 and 1 give very different signals" : diff >= best * 0.4 ? "You can tell them apart, but not as clearly" : "Here 0 and 1 look almost the same"
            };
        },
        reward: { when: function (s) { const a = s21(s.p, 1, -1), b = s21(s.p, 1, 1); return Math.hypot(a[0] - b[0], a[1] - b[1]) >= 0.72; }, msg: "You found the best readout frequency" },
        draw: function (ctx, s) {

            const gx = 60, gy = 30, gw = 400, gh = 170;
            const X = function (df) { return gx + (df + 5) / 10 * gw; };
            const Y = function (m) { return gy + gh - m * gh; };

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);
            txt(ctx, "frequency (MHz from 7 GHz)", gx + gw / 2, gy + gh + 30, 11, GREY + ".85)");

            [-4, -2, 0, 2, 4].forEach(function (v) { txt(ctx, String(v), X(v), gy + gh + 15, 11, GREY + ".8)"); });

            [[-1, TEAL, 0], [1, GOLD, 1]].forEach(function (c) {

                ctx.strokeStyle = c[1] + (s.q === c[2] ? "1)" : ".35)");
                ctx.lineWidth = s.q === c[2] ? 3 : 1.5;
                ctx.beginPath();

                for (let k = 0; k <= 200; k++) {

                    const df = k / 20 - 5;
                    const v = s21(df, 1, c[0]);
                    const m = Math.hypot(v[0], v[1]);

                    if (k === 0) { ctx.moveTo(X(df), Y(m)); } else { ctx.lineTo(X(df), Y(m)); }
                }

                ctx.stroke();
                txt(ctx, "if " + (c[2] ? "|1⟩" : "|0⟩"), X(c[0]), Y(0) - 6, 11, c[1] + "1)", "center", true);
            });

            line(ctx, X(s.p), gy, X(s.p), gy + gh, ROSE + "1)", 2);
            txt(ctx, "probe", X(s.p), gy - 6, 11, ROSE + "1)");

            // IQ plane
            const cx = 570, cy = 115, R = 80;

            ctx.strokeStyle = GREY + ".5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.stroke();
            line(ctx, cx - R - 10, cy, cx + R + 10, cy, GREY + ".4)", 1);
            line(ctx, cx, cy - R - 10, cx, cy + R + 10, GREY + ".4)", 1);
            txt(ctx, "signal: amplitude and phase", cx, 22, 11, GREY + ".85)");

            const a = s21(s.p, 1, -1);
            const b = s21(s.p, 1, 1);

            dot(ctx, cx + a[0] * R, cy - a[1] * R, 7, TEAL + "1)");
            dot(ctx, cx + b[0] * R, cy - b[1] * R, 7, GOLD + "1)");
            line(ctx, cx + a[0] * R, cy - a[1] * R, cx + b[0] * R, cy - b[1] * R, ROSE + ".8)", 1.5, [3, 3]);
        }
    });


    function iqFid(t, T1) {

        const sigma = 0.15 / Math.sqrt(t);
        const pg = 0.5 * erfc(1 / (2 * sigma * Math.SQRT2));
        const pd = 1 - Math.exp(-t / 2 / T1);

        return 1 - (2 * pg + pd) / 2;
    }

    make("qc-iq", {
        title: "Try it: single-shot readout",
        w: 680, h: 250,
        aria: "Measurement results pile up as two clouds of dots, one for qubits prepared in 0 and one for qubits prepared in 1. Longer measurements separate the clouds, but the qubit may decay meanwhile.",
        defaults: { t: 0.3, T1: 100 },
        sliders: [["Measurement time", "t", 0.05, 1.5, 0.01, function (v) { return Math.round(v * 1000) + " ns"; }], ["Qubit lifetime T₁", "T1", 10, 300, 1, function (v) { return v + " µs"; }]],
        stats: [["Readout fidelity", "f"], ["Errors from noise", "n"], ["Errors from decay", "dk"]],
        animated: true,
        formula: "Each measurement ('shot') gives one point. Shots of qubits prepared in 0 (teal) and in 1 (gold) form two clouds. Measuring longer averages away noise and pulls the clouds apart, but the longer you wait, the more likely a 1 decays to 0 mid-measurement and lands in the wrong cloud (the gold streak). The best time balances the two. Today's best readouts take a few hundred nanoseconds and are about 99% accurate or better.",
        init: function (s, d) { d.pts = []; d.r = mulberry(19); d.acc = 0; },
        onChange: function (s, d) { d.pts = []; },
        step: function (dt, s, d) {

            d.acc += dt;

            while (d.acc > 0.04) {

                d.acc -= 0.04;

                const one = d.pts.length % 2 === 1;
                const sigma = 0.15 / Math.sqrt(s.t);
                const g = function () { return Math.sqrt(-2 * Math.log(d.r() + 1e-9)) * Math.cos(6.283 * d.r()); };
                let mean = one ? 1 : 0;

                if (one) {

                    const td = -s.T1 * Math.log(d.r() + 1e-9);

                    if (td < s.t) { mean = td / s.t; }
                }

                d.pts.push([mean - 0.5 + g() * sigma, g() * sigma, one]);

                if (d.pts.length > 400) { d.pts.splice(0, 2); }
            }
        },
        read: function (s) {

            const sigma = 0.15 / Math.sqrt(s.t);
            const pg = 0.5 * erfc(1 / (2 * sigma * Math.SQRT2));
            const pd = 1 - Math.exp(-s.t / 2 / s.T1);
            const F = iqFid(s.t, s.T1);

            return {
                f: (F * 100).toFixed(1) + "%",
                n: (pg * 100).toFixed(2) + "%",
                dk: (pd / 2 * 100).toFixed(2) + "%",
                verdict: F >= 0.99 ? "Excellent: better than 99%" : pg > pd ? "Too short: the clouds overlap" : "Too long: qubits decay during the measurement"
            };
        },
        reward: { when: function (s) { return iqFid(s.t, s.T1) >= 0.985; }, msg: "You optimised single-shot readout" },
        draw: function (ctx, s, d) {

            const cx = 230, cy = 125, sc = 170;

            line(ctx, cx, 20, cx, 230, GREY + ".5)", 1, [4, 4]);
            txt(ctx, "threshold", cx, 16, 10, GREY + ".85)");

            d.pts.forEach(function (p) { dot(ctx, cx + p[0] * sc, cy + p[1] * sc, 2.2, (p[2] ? GOLD : TEAL) + ".75)"); });

            txt(ctx, "read as 0", cx - 110, 238, 11, TEAL + "1)");
            txt(ctx, "read as 1", cx + 110, 238, 11, GOLD + "1)");

            // fidelity vs time curve
            const gx = 450, gy = 40, gw = 200, gh = 160;

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);
            txt(ctx, "fidelity vs time", gx + gw / 2, gy - 12, 11, GREY + ".85)");
            txt(ctx, "100%", gx - 4, gy + 4, 10, GREY + ".8)", "right");
            txt(ctx, "90%", gx - 4, gy + gh + 4, 10, GREY + ".8)", "right");

            ctx.strokeStyle = TEAL + "1)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let k = 0; k <= 100; k++) {

                const t = 0.05 + k / 100 * 1.45;
                const F = clamp(iqFid(t, s.T1), 0.9, 1);

                if (k === 0) { ctx.moveTo(gx + k / 100 * gw, gy + gh - (F - 0.9) / 0.1 * gh); } else { ctx.lineTo(gx + k / 100 * gw, gy + gh - (F - 0.9) / 0.1 * gh); }
            }

            ctx.stroke();

            const F = clamp(iqFid(s.t, s.T1), 0.9, 1);

            dot(ctx, gx + (s.t - 0.05) / 1.45 * gw, gy + gh - (F - 0.9) / 0.1 * gh, 6, ROSE + "1)");
            txt(ctx, "time →", gx + gw, gy + gh + 16, 10, GREY + ".85)", "right");
        }
    });


    SIMS["qc-amps"] = stepper({
        title: "Explore: amplifying a whisper",
        viewBox: "0 0 340 190",
        aria: "The readout signal leaves the chip and passes a quantum-limited amplifier at 10 mK, an isolator, a HEMT amplifier at 4 K and room-temperature electronics.",
        interval: 6.5,
        steps: [
            { t: "A signal of a few photons", text: "The readout tone leaving the chip carries only a handful of microwave photons. Any amplifier noise would drown it." },
            { t: "Quantum-limited amplifier (10 mK)", text: "First, a Josephson parametric amplifier (JPA or TWPA) right next to the chip. Built from junctions itself, it adds close to the minimum noise quantum physics allows." },
            { t: "Isolators protect the qubit", text: "Isolators and circulators let the signal travel out but block noise travelling back toward the qubits." },
            { t: "HEMT amplifier (4 K)", text: "A low-noise transistor amplifier (a HEMT) on the 4 K plate boosts the signal by about 40 dB (10,000 times in power)." },
            { t: "Room temperature: digitise", text: "Outside the fridge, more amplifiers and fast digitisers record the amplitude and phase, and software decides 0 or 1, all within about a microsecond." }
        ],
        rewardKey: "qc-amps",
        rewardMsg: "You followed the readout chain",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            const stages = [[30, "chip", "#54e0c7", "10 mK"], [95, "JPA", "#be96ff", "10 mK"], [160, "isolator", "#78b4ff", "10 mK"], [225, "HEMT", "#ffd666", "4 K"], [290, "digitiser", "#ff6978", "300 K"]];
            let s = sL(30, 95, 300, 95, "#aab3cf", 1.5);

            stages.forEach(function (g, i) {

                const on = i <= step;

                s += sR(g[0] - 22, 75, 44, 40, on ? "rgba(255,255,255,.08)" : "none", on ? g[2] : "#555b70", 5);
                s += sT(g[0], 99, g[1], 8, on ? g[2] : "#7a8199");
                s += sT(g[0], 130, g[3], 8, "#aab3cf");
            });

            const from = stages[Math.max(0, step - 1)][0];
            const to = stages[step][0];
            const x = step === 0 ? 30 + k * 20 : from + (to - from) * ease(k);
            const a = 3 + step * 6;

            s += sP("M" + (x - 18) + " 60 " + Array.from({ length: 12 }, function (_, j) { return "L" + (x - 18 + j * 3) + " " + (60 + Math.sin(j * 1.4 + st.anim * 6) * a); }).join(" "), "#ffd666", 1.5);

            if (step === 0) { s += sT(170, 165, "just a few photons", 9, "#ffd666"); }
            if (step === 2) { s += sP("M180 150 L140 150", "#ff6978", 1.5) + sT(160, 168, "noise blocked ✗", 8, "#ff6978"); }
            if (step === 4) { s += sT(170, 165, "→ 0 or 1", 11, "#54e0c7"); }

            return s;
        }
    });


    /* ======================================
       UNIT 20: THE DILUTION REFRIGERATOR
    ====================================== */

    const STAGES = [["50 K plate", 45, BLUE], ["4 K plate", 3.5, PURPLE], ["Still", 0.8, GOLD], ["Cold plate", 0.1, TEAL], ["Mixing chamber", 0.01, ROSE]];

    function stageT(i, h) {

        const base = STAGES[i][1];

        if (i <= 1) {

            const tau = i === 0 ? 7 : 9;

            return base + (300 - base) * Math.exp(-h / tau) * (1 + 0.5 * Math.exp(-h / 3)) / 1.5;
        }

        const pre = stageT(1, h) * (1 + (i - 1) * 0.02);

        if (h < 24) { return pre; }

        const k = clamp((h - 24) / 6, 0, 1);

        return Math.exp(Math.log(pre) * (1 - k) + Math.log(base) * k);
    }

    make("qc-cooldown", {
        title: "Try it: cool a fridge from room temperature",
        w: 680, h: 250,
        aria: "Temperatures of the five fridge stages fall over about thirty hours, on a logarithmic scale.",
        defaults: {},
        actions: [["go", "❄ Start the cooldown"]],
        stats: [["Time since start", "h"], ["Mixing chamber", "mc"]],
        animated: true,
        liveRead: true,
        formula: "A pulse-tube cooler (a helium gas refrigerator, no liquid helium bath needed) slowly brings the upper plates to about 50 K and 3 K over roughly a day. Then the helium-3/helium-4 mixture is let in, condenses, and the <b>dilution</b> process takes the bottom plate to about 10 mK. The whole cooldown typically takes one to two days. Each second of animation here is one hour.",
        init: function (s, d) { d.h = 0; d.on = false; },
        act: function (id, s, d) { d.h = 0; d.on = true; },
        step: function (dt, s, d) { if (d.on && d.h < 34) { d.h += dt; } },
        read: function (s, d) {

            const T = stageT(4, d.h);

            return {
                h: d.on ? Math.floor(d.h) + " h" : "—",
                mc: fmtT(T),
                verdict: !d.on ? "Press Start" : d.h < 24 ? "The pulse tube is pre-cooling the plates" : T > 0.012 ? "Mixture condensed: dilution is cooling the bottom plate" : "Base temperature: ready for qubits"
            };
        },
        reward: { when: function (s, d) { return d.on && d.h >= 30; }, msg: "You cooled a dilution fridge to base temperature" },
        draw: function (ctx, s, d) {

            const gx = 80, gy = 20, gw = 420, gh = 190;
            const X = function (h) { return gx + h / 34 * gw; };
            const Y = function (T) { return gy + (Math.log10(300) - Math.log10(T)) / (Math.log10(300) + 2.2) * gh; };

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);

            [300, 10, 1, 0.1, 0.01].forEach(function (T) { txt(ctx, fmtT(T), gx - 6, Y(T) + 4, 10, GREY + ".85)", "right"); line(ctx, gx, Y(T), gx + gw, Y(T), GREY + ".12)", 1); });
            [0, 6, 12, 18, 24, 30].forEach(function (h) { txt(ctx, h + " h", X(h), gy + gh + 16, 10, GREY + ".85)"); });

            if (!d.on) { return; }

            STAGES.forEach(function (st, i) {

                ctx.strokeStyle = st[2] + "1)";
                ctx.lineWidth = 2.2;
                ctx.beginPath();

                for (let h = 0; h <= d.h; h += 0.1) {

                    if (h === 0) { ctx.moveTo(X(h), Y(stageT(i, h))); } else { ctx.lineTo(X(h), Y(stageT(i, h))); }
                }

                ctx.stroke();

                const T = stageT(i, d.h);

                txt(ctx, st[0] + ": " + fmtT(T), 520, 50 + i * 34, 12, st[2] + "1)", "left", true);
            });
        }
    });


    SIMS["qc-dilution"] = stepper({
        title: "Explore: how a dilution fridge reaches 10 mK",
        viewBox: "0 0 340 190",
        aria: "The mixing chamber holds two layers of helium. Helium-3 atoms cross from the upper layer into the lower one, absorbing heat, and are pumped away from the still and recycled.",
        interval: 6.5,
        steps: [
            { t: "Two kinds of helium", text: "The fridge circulates a mixture of helium-3 (rare, light) and helium-4. Below about 0.87 K the mixture separates into two layers, like oil and water." },
            { t: "Two layers in the mixing chamber", text: "On top: almost pure helium-3 (the concentrated phase). Below: helium-4 with about 6.6% helium-3 dissolved in it (the dilute phase)." },
            { t: "Crossing the boundary absorbs heat", text: "When helium-3 atoms cross from the top layer into the bottom one, they absorb heat, just as evaporation cools your skin. This happens in the mixing chamber, the coldest plate." },
            { t: "The still pumps helium-3 away", text: "The dilute phase connects up to the still (about 0.8 K). There helium-3 evaporates much more easily than helium-4, so pumps remove it, pulling more helium-3 across the boundary below." },
            { t: "Recycled in a loop", text: "Room-temperature pumps compress the helium-3, it is cooled and liquefied again on the way down, and returns to the top layer. The cycle runs continuously for months." }
        ],
        rewardKey: "qc-dilution",
        rewardMsg: "You learned how dilution refrigeration works",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = "";

            if (step === 0) {

                for (let i = 0; i < 20; i++) {

                    const x = 60 + (i * 53 + st.anim * (i % 2 ? 12 : -12)) % 220;

                    s += sC(Math.abs(x) % 220 + 60, 50 + (i * 37) % 110, i % 3 ? 5 : 4, i % 3 ? "#78b4ff" : "#ffd666");
                }

                s += sT(280, 180, "● He-3   ● He-4", 9, "#aab3cf");
            }

            if (step >= 1) {

                s += sR(60, 40, 120, 130, "none", "#aab3cf", 6) + sT(120, 32, "mixing chamber", 9, "#aab3cf");
                s += sR(62, 42, 116, 44, "rgba(255,214,102,.18)") + sT(120, 58, "concentrated He-3", 8, "#ffd666");
                s += sR(62, 86, 116, 82, "rgba(120,180,255,.18)") + sT(120, 160, "dilute: He-4 + 6.6% He-3", 8, "#78b4ff");
                s += sL(62, 86, 178, 86, "#f5f7ff", 1, "3 3");

                for (let i = 0; i < 6; i++) { s += sC(75 + i * 18, 72, 4, "#ffd666"); }
                for (let i = 0; i < 8; i++) { s += sC(72 + i * 14, 100 + (i % 3) * 20, 4, i % 4 ? "#78b4ff" : "#ffd666"); }
            }

            if (step >= 2) {

                const y = 72 + ease(k) * 30;

                s += sC(150, step === 2 ? y : 100, 4, "#ffd666");

                if (step === 2) { s += sT(255, 92, "absorbs heat ❄", 10, "#54e0c7") + sP("M190 90 L230 90", "#54e0c7", 1.5); }
            }

            if (step >= 3) {

                s += sR(230, 40, 80, 40, "rgba(255,214,102,.08)", "#ffd666", 4) + sT(270, 34, "still (0.8 K)", 9, "#ffd666");
                s += sP("M178 140 L250 140 L250 80", "#78b4ff", 2);
                s += sC(250, 140 - (step === 3 ? k * 60 : 60), 4, "#ffd666");
                s += sP("M270 40 L270 15", "#ff6978", 2) + sT(300, 20, "pumped out", 8, "#ff6978");
            }

            if (step === 4) {

                s += sP("M290 15 L325 15 L325 120 L180 52", "#54e0c7", 1.5) + sT(300, 110, "returns,", 8, "#54e0c7") + sT(300, 122, "liquefied", 8, "#54e0c7");

                const pts = [[270, 15], [325, 15], [325, 120], [180, 52]];
                const u = (st.anim * 0.25) % 1 * 3;
                const i = Math.floor(u);
                const f = u - i;

                s += sC(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, 4, "#ffd666");
            }

            return s;
        }
    });


    make("qc-coolpower", {
        title: "Try it: every wire costs cooling power",
        w: 680, h: 240,
        aria: "The mixing chamber temperature rises as more wires and heat are added; more helium-3 flow cools it down.",
        defaults: { n: 100, flow: 0.8 },
        sliders: [["Coaxial lines to the chip", "n", 10, 600, 10, function (v) { return v; }], ["Helium-3 circulation", "flow", 0.2, 2, 0.05, function (v) { return v.toFixed(2) + " mmol/s"; }]],
        stats: [["Heat on the mixing chamber", "p"], ["Mixing chamber temperature", "t"]],
        formula: "A dilution fridge's cooling power falls steeply as it gets colder: ideally Q̇ ≈ 84 ṅ T² watts, where ṅ is the helium-3 flow in mol/s. At 10 mK there are only microwatts to spend. Every coax line leaks heat down from above and warms its attenuators. Here each line adds about 0.05 µW. Scaling to thousands of qubits means thousands of lines: one of the biggest engineering problems (Part 8).",
        read: function (s) {

            const P = 1 + s.n * 0.05;
            const T = Math.max(0.006, Math.sqrt(P * 1e-6 / (84 * s.flow * 1e-3)));

            return {
                p: P.toFixed(1) + " µW",
                t: fmtT(T),
                verdict: T <= 0.015 ? "Cold enough for qubits" : T <= 0.025 ? "Getting warm: qubits will suffer" : "Too warm: the fridge can't keep up"
            };
        },
        reward: { when: function (s) { const T = Math.sqrt((1 + s.n * 0.05) * 1e-6 / (84 * s.flow * 1e-3)); return s.n >= 300 && T <= 0.015; }, msg: "You wired 300 lines and stayed cold" },
        draw: function (ctx, s) {

            const gx = 70, gy = 30, gw = 360, gh = 170;
            const X = function (P) { return gx + P / 35 * gw; };
            const Y = function (T) { return gy + gh - T / 0.04 * gh; };

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);
            line(ctx, gx, gy, gx, gy + gh, GREY + ".6)", 1);
            txt(ctx, "heat load (µW)", gx + gw / 2, gy + gh + 30, 11, GREY + ".85)");
            txt(ctx, "temperature", gx + 4, gy - 10, 11, GREY + ".85)", "left");

            [0, 10, 20, 30].forEach(function (P) { txt(ctx, String(P), X(P), gy + gh + 15, 10, GREY + ".8)"); });
            [0, 10, 20, 30, 40].forEach(function (T) { txt(ctx, T + " mK", gx - 6, Y(T / 1000) + 4, 10, GREY + ".8)", "right"); });

            box(ctx, gx, Y(0.015), gw, Y(0) - Y(0.015), "rgba(84,224,199,.08)");

            ctx.strokeStyle = BLUE + "1)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();

            for (let k = 0; k <= 100; k++) {

                const P = k / 100 * 35;
                const T = Math.max(0.006, Math.sqrt(P * 1e-6 / (84 * s.flow * 1e-3)));

                if (k === 0) { ctx.moveTo(X(P), Y(T)); } else { ctx.lineTo(X(P), Y(Math.min(T, 0.04))); }
            }

            ctx.stroke();

            const P = 1 + s.n * 0.05;
            const T = Math.max(0.006, Math.sqrt(P * 1e-6 / (84 * s.flow * 1e-3)));

            dot(ctx, X(Math.min(P, 35)), Y(Math.min(T, 0.04)), 7, T <= 0.015 ? TEAL + "1)" : ROSE + "1)");

            // the bundle of lines
            const bx = 470;

            box(ctx, bx, 196, 190, 14, ROSE + ".6)", ROSE + "1)");
            txt(ctx, "mixing chamber", bx + 95, 228, 11, ROSE + "1)");

            const shown = Math.min(60, Math.round(s.n / 10));

            for (let i = 0; i < shown; i++) { line(ctx, bx + 5 + i * 3, 30, bx + 5 + i * 3, 196, GOLD + ".55)", 1); }

            txt(ctx, s.n + " lines", bx + 95, 22, 11, GOLD + "1)");
        }
    });


    const ATT = [["4 K plate", 4, "a4"], ["Still (0.8 K)", 0.8, "as"], ["Cold plate (0.1 K)", 0.1, "ac"], ["Mixing chamber (10 mK)", 0.01, "am"]];

    function attChain(s) {

        let n = nTh(6, 300);
        const out = [n];

        ATT.forEach(function (a) {

            const A = Math.pow(10, s[a[2]] / 10);

            n = n / A + (1 - 1 / A) * nTh(6, a[1]);
            out.push(n);
        });

        return out;
    }

    make("qc-atten", {
        title: "Try it: keep room-temperature noise out",
        w: 680, h: 250,
        aria: "A drive line descends through four fridge stages, each with an attenuator. A bar chart shows how many thermal noise photons remain at each stage.",
        defaults: { a4: 20, as: 0, ac: 0, am: 10 },
        sliders: [["Attenuator at 4 K", "a4", 0, 30, 1, function (v) { return v + " dB"; }], ["At the still", "as", 0, 30, 1, function (v) { return v + " dB"; }], ["At the cold plate", "ac", 0, 30, 1, function (v) { return v + " dB"; }], ["At the mixing chamber", "am", 0, 30, 1, function (v) { return v + " dB"; }]],
        stats: [["Noise photons reaching the chip", "n"], ["Heat from drive pulses at 10 mK", "h"]],
        formula: "A cable from room temperature carries thermal noise: about 1,000 photons per mode at 6 GHz. Each attenuator (10 dB = 10 times weaker) absorbs most of what comes in, but adds its own thermal noise at its temperature. The noise reaching the chip must fall below about 0.001 photons, or it dephases the qubits. Putting more attenuation on colder plates helps more, but the absorbed drive power then heats those plates. Real fridges use about 60 dB in total, spread over the stages.",
        read: function (s) {

            const ch = attChain(s);
            const n = ch[ch.length - 1];
            const A = Math.pow(10, s.am / 10);

            return {
                n: n >= 0.01 ? n.toFixed(2) : n >= 1e-5 ? String(Number(n.toPrecision(1))) : "under 0.00001",
                h: Math.round(A - 1) + " pW",
                verdict: n < 0.001 ? (A > 1100 ? "Quiet, but the mixing chamber attenuator is heating up" : "Quiet line: the qubits are safe") : "Too much thermal noise: qubits will dephase"
            };
        },
        reward: { when: function (s) { const ch = attChain(s); return ch[ch.length - 1] < 0.001 && s.am <= 30; }, msg: "You designed a quiet drive line" },
        draw: function (ctx, s) {

            const ch = attChain(s);
            const names = ["300 K"].concat(ATT.map(function (a) { return a[0]; }));
            const X = function (i) { return 70 + i * 120; };
            const Y = function (n) { return 200 - (Math.log10(Math.max(n, 1e-5)) + 5) / 8 * 170; };

            line(ctx, 40, Y(0.001), 660, Y(0.001), TEAL + ".8)", 1.5, [5, 4]);
            txt(ctx, "safe: 0.001 photons", 655, Y(0.001) - 6, 10, TEAL + "1)", "right");

            [1000, 1, 0.001].forEach(function (v) { txt(ctx, String(v), 34, Y(v) + 4, 10, GREY + ".8)", "right"); });

            ch.forEach(function (n, i) {

                const y = Y(n);

                box(ctx, X(i) - 22, y, 44, 200 - y, (n < 0.001 ? TEAL : i === 0 ? ROSE : GOLD) + ".7)");
                txt(ctx, names[i], X(i), 220, 10, GREY + ".9)");

                if (i > 0) { txt(ctx, s[ATT[i - 1][2]] + " dB", X(i), 236, 10, PURPLE + "1)"); }

                txt(ctx, n >= 0.01 ? (n >= 10 ? Math.round(n) : n.toFixed(2)) : n >= 1e-5 ? String(Number(n.toPrecision(1))) : "≈0", X(i), y - 6, 10, TEXT + ".9)");
            });
        }
    });


    document.querySelectorAll('.fd-sim[data-sim^="qc-"]').forEach(F.mount);

})();
