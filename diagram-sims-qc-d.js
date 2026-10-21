/* ========================================
   QUANTUM COMPUTING CHIPS: INTERACTIVE SIMULATORS, PART 4

   Unit 21: the substrate (silicon vs sapphire, loss tangent, surface prep, cleanliness, dies per wafer).
   Unit 22: superconducting films (deposition, metals, oxides, sputter thickness, tantalum phase).
   Unit 23: patterning (lithography, etching, liftoff, CPW impedance, fab defects).
   Unit 24: the Josephson junction (shadow evaporation, oxidation, Manhattan junctions, spread).
   Unit 25: hitting the frequency (room-temperature resistance, collisions, laser trimming).
   Unit 26: airbridges (slotline modes, building a bridge, crosstalk, span, placement).
   Unit 27: 3D integration (fan-out, bump bonds, TSVs, box modes).

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
    const TEAL = Q.TEAL;
    const GOLD = Q.GOLD;
    const ROSE = Q.ROSE;
    const BLUE = Q.BLUE;
    const GREY = Q.GREY;
    const TEXT = Q.TEXT;
    const PURPLE = Q.PURPLE;

    // Small SVG helpers for the step-by-step animations.
    function sT(x, y, s, size, fill, anchor) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" style="font-size:' + (size || 9) + "px;fill:" + (fill || "#f5f7ff") + '">' + s + "</text>"; }
    function sR(x, y, w, h, fill, stroke, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + Math.max(0, w) + '" height="' + Math.max(0, h) + '" rx="' + (rx || 0) + '" style="fill:' + (fill || "none") + ";stroke:" + (stroke || "none") + '"/>'; }
    function sC(x, y, r, fill, stroke) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="fill:' + (fill || "none") + ";stroke:" + (stroke || "none") + '"/>'; }
    function sL(x1, y1, x2, y2, stroke, w, dash) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" style="stroke:' + stroke + ";stroke-width:" + (w || 1.5) + (dash ? ";stroke-dasharray:" + dash : "") + '"/>'; }
    function sP(d, stroke, w, fill) { return '<path d="' + d + '" style="fill:' + (fill || "none") + ";stroke:" + (stroke || "none") + ";stroke-width:" + (w || 1.5) + '"/>'; }

    function prog(st, interval) { return clamp(st.t / interval, 0, 1); }

    function ease(k) { return k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k); }

    function fmtGHz(g) { return g >= 1 ? g.toFixed(3) + " GHz" : Math.round(g * 1000) + " MHz"; }

    function fmtUs(us) {

        if (us < 1000) { return (us < 10 ? us.toFixed(1) : Math.round(us)) + " µs"; }

        return (us / 1000).toFixed(us < 1e4 ? 2 : 1) + " ms";
    }

    // Shared colours for fab cross-sections.
    const SI = "#4a5266";
    const METAL = "#c9d3e6";
    const RESIST = "rgba(255,159,106,.55)";
    const OXIDE = "#be96ff";

    function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(6.283 * r()); }


    /* ======================================
       UNIT 21: THE SUBSTRATE
    ====================================== */

    const SUBS = {
        si: { n: "Silicon", rows: [["Crystal", "Diamond-cubic silicon"], ["Dielectric constant", "11.7"], ["Purity", "Float-zone, resistivity above 10 kΩ·cm"], ["Strength", "Fits standard chip fabs; vias can be etched through it"], ["Watch out for", "Native oxide on the surface; free carriers if impure"]] },
        sa: { n: "Sapphire", rows: [["Crystal", "Single-crystal aluminium oxide (Al₂O₃)"], ["Dielectric constant", "About 9.4 to 11.6 (depends on direction)"], ["Purity", "An insulator: no free carriers at all"], ["Strength", "Extremely low loss; used for record tantalum qubits"], ["Watch out for", "Hard to etch through; fewer big-fab tools handle it"]] }
    };

    make("qc-substrate", {
        title: "Compare: silicon or sapphire?",
        w: 680, h: 230,
        aria: "A wafer and its crystal lattice, with a table of properties for the chosen substrate.",
        defaults: { s: "si" },
        segs: [["Substrate", "s", [["si", "Silicon"], ["sa", "Sapphire"]]]],
        stats: [["Substrates compared", "n"]],
        formula: "Most of a qubit's electric field passes through the chip it sits on, so the substrate must absorb almost nothing at microwave frequencies. Two crystals dominate: very pure, high-resistivity <b>silicon</b> (it fits the tools of standard chip fabs) and <b>sapphire</b> (a perfect insulator with very low loss). Both are bought as polished wafers.",
        init: function (s, d) { d.seen = {}; },
        read: function (s, d) {

            d.seen[s.s] = true;

            return {
                n: Object.keys(d.seen).length + " of 2",
                verdict: SUBS[s.s].n + ": " + SUBS[s.s].rows[3][1].toLowerCase()
            };
        },
        reward: { when: function (s, d) { return Object.keys(d.seen).length >= 2; }, msg: "You compared the two qubit substrates" },
        draw: function (ctx, s) {

            const si = s.s === "si";
            const g = ctx.createRadialGradient(110, 100, 10, 120, 115, 90);

            g.addColorStop(0, si ? "#8f97ab" : "#b9d4f0");
            g.addColorStop(1, si ? "#3c4356" : "#5b7fa8");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(120, 115, 85, 0, Math.PI * 2);
            ctx.fill();
            box(ctx, 100, 196, 40, 6, "rgba(6,10,24,1)");
            txt(ctx, si ? "silicon wafer" : "sapphire wafer (transparent)", 120, 222, 11, GREY + ".9)");

            for (let i = 0; i < 4; i++) {

                for (let j = 0; j < 3; j++) {

                    const x = 245 + i * 26 + (j % 2) * 13;
                    const y = 70 + j * 30;

                    if (i < 3) { line(ctx, x, y, x + 26, y, GREY + ".5)", 1); }
                    if (j < 2) { line(ctx, x, y, x + ((j % 2) ? -13 : 13), y + 30, GREY + ".5)", 1); }

                    dot(ctx, x, y, si ? 6 : ((i + j) % 2 ? 4 : 7), si ? BLUE + "1)" : ((i + j) % 2 ? ROSE + "1)" : GOLD + "1)"));
                }
            }

            txt(ctx, si ? "Si atoms" : "Al and O atoms", 290, 170, 11, GREY + ".9)");

            SUBS[s.s].rows.forEach(function (r, i) {

                txt(ctx, r[0], 400, 50 + i * 36, 11, GREY + ".9)", "left");
                txt(ctx, r[1], 400, 66 + i * 36, 12, TEXT + "1)", "left", true);
            });
        }
    });


    make("qc-tand", {
        title: "Try it: the substrate's loss sets a lifetime limit",
        w: 680, h: 230,
        aria: "A logarithmic bar shows the longest qubit lifetime the substrate allows, given its loss tangent and how much of the qubit's field it holds.",
        defaults: { lt: -6, p: 0.9, f: 5 },
        sliders: [["Loss tangent tan δ", "lt", -8, -5, 0.05, function (v) { return "10" + "⁻" + "⁰¹²³⁴⁵⁶⁷⁸⁹"[Math.round(-v)] + (Math.abs(v - Math.round(v)) > 0.01 ? " (×" + Math.pow(10, v - Math.round(v)).toFixed(1) + ")" : ""); }], ["Share of field in the substrate", "p", 0.5, 0.95, 0.01, function (v) { return Math.round(v * 100) + "%"; }], ["Qubit frequency", "f", 4, 7, 0.1, function (v) { return v.toFixed(1) + " GHz"; }]],
        stats: [["Quality factor limit", "q"], ["Lifetime limit T₁", "t1"]],
        formula: "Every material wastes a small fraction of the microwave energy passing through it each cycle: its <b>loss tangent</b>, tan δ. A qubit with a share p of its field energy inside the substrate can have a quality factor of at most Q = 1 / (p tan δ), which caps its lifetime at T<sub>1</sub> = Q / (2πf). Good substrates reach tan δ around 10<sup>−7</sup> or better, so today the surfaces and interfaces usually limit qubits instead (Part 5).",
        read: function (s) {

            const q = 1 / (s.p * Math.pow(10, s.lt));
            const t1 = q / (2 * Math.PI * s.f * 1e9) * 1e6;

            return {
                q: q >= 1e6 ? (q / 1e6).toFixed(1) + " million" : Math.round(q).toLocaleString("en-US"),
                t1: fmtUs(t1),
                verdict: t1 >= 1000 ? "The substrate allows lifetimes over a millisecond" : t1 >= 100 ? "Fine for today's qubits, but it could be better" : "This substrate would ruin the qubit"
            };
        },
        reward: { when: function (s) { return 1 / (s.p * Math.pow(10, s.lt)) / (2 * Math.PI * s.f * 1e9) * 1e6 >= 1000; }, msg: "You found a millisecond-class substrate" },
        draw: function (ctx, s) {

            const t1 = 1 / (s.p * Math.pow(10, s.lt)) / (2 * Math.PI * s.f * 1e9) * 1e6;
            const X = function (us) { return 60 + (Math.log10(us) + 0.5) / 5.5 * 560; };

            box(ctx, 60, 90, 560, 40, "rgba(255,255,255,.04)", GREY + ".5)");
            box(ctx, 60, 90, clamp(X(t1) - 60, 0, 560), 40, (t1 >= 1000 ? TEAL : t1 >= 100 ? GOLD : ROSE) + ".75)");

            [1, 10, 100, 1000, 10000].forEach(function (us) {

                line(ctx, X(us), 84, X(us), 136, GREY + ".5)", 1);
                txt(ctx, fmtUs(us), X(us), 154, 11, GREY + ".85)");
            });

            txt(ctx, "lifetime limit from the substrate", 60, 72, 12, TEXT + ".9)", "left", true);
            txt(ctx, "typical transmon today: about 100 to 300 µs", X(170), 190, 11, GOLD + "1)");
            line(ctx, X(100), 176, X(300), 176, GOLD + "1)", 3);
        }
    });


    SIMS["qc-hf"] = stepper({
        title: "Explore: preparing the surface",
        viewBox: "0 0 340 190",
        aria: "A cross-section of a silicon wafer being cleaned: organic dirt removed, the native oxide stripped with hydrofluoric acid, then loaded into vacuum.",
        interval: 6.5,
        steps: [
            { t: "As delivered", text: "Even a new wafer carries a 1 to 2 nm layer of native silicon oxide, plus traces of organic dirt. Both host tiny defects that absorb qubit energy." },
            { t: "Strip the organics", text: "Solvents, then a hot 'piranha' mix of sulfuric acid and hydrogen peroxide (or the standard RCA clean), burn off organic residues." },
            { t: "Strip the oxide with HF", text: "A dip in dilute hydrofluoric acid dissolves the oxide and leaves the silicon surface capped with hydrogen atoms." },
            { t: "Into vacuum, fast", text: "The oxide starts regrowing in air within minutes, so the wafer goes straight into the deposition tool's vacuum. Some fabs also bake it there to drive off water." }
        ],
        rewardKey: "qc-hf",
        rewardMsg: "You prepared a clean silicon surface",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = sR(40, 110, 260, 50, SI, "#7a8199") + sT(170, 140, "silicon", 10, "#aab3cf");
            const ox = step === 0 || step === 1 ? 8 : step === 2 ? 8 * (1 - ease(k)) : 0;

            if (ox > 0.2) { s += sR(40, 110 - ox, 260, ox, "rgba(190,150,255,.6)") + sT(310, 108, "oxide", 8, OXIDE, "start"); }

            if (step === 0 || (step === 1 && k < 0.8)) {

                for (let i = 0; i < 9; i++) {

                    const x = 55 + i * 28;
                    const fade = step === 1 ? 1 - k / 0.8 : 1;

                    s += sC(x, 98 - (i % 3) * 3, 4, "rgba(255,214,102," + fade + ")");
                }

                s += sT(170, 76, "organic dirt", 9, "#ffd666");
            }

            if (step === 1) { s += sT(170, 30, "piranha / RCA clean", 10, "#ff6978"); }

            if (step === 2) {

                s += sT(170, 30, "dilute HF dip", 10, "#54e0c7");

                if (k > 0.6) { for (let i = 0; i < 26; i++) { s += sC(45 + i * 10, 106, 2, "#f5f7ff"); } s += sT(170, 92, "H-terminated surface", 9, "#f5f7ff"); }
            }

            if (step === 3) {

                for (let i = 0; i < 26; i++) { s += sC(45 + i * 10, 106, 2, "#f5f7ff"); }

                s += sR(20, 40, 300, 140, "none", "#78b4ff", 8) + sT(170, 34, "vacuum chamber", 10, "#78b4ff");
                s += sT(170, 80, "⏱ minutes, not hours", 10, "#ffd666");
            }

            return s;
        }
    });


    SIMS["qc-cleanquiz"] = quiz(
        "Game: help or harm?",
        ["Helps the qubit", "Hurts the qubit"],
        [
            { q: "A layer of native oxide left on the silicon under the metal.", a: "Hurts the qubit", why: "Amorphous oxides are full of two-level defects that absorb microwave energy." },
            { q: "A dilute HF dip right before the metal is deposited.", a: "Helps the qubit", why: "It strips the oxide and leaves a clean, hydrogen-terminated surface." },
            { q: "Photoresist residue left behind after a lithography step.", a: "Hurts the qubit", why: "Organic residue is a lossy dielectric right where the fields are strongest." },
            { q: "Using float-zone silicon with very high resistivity.", a: "Helps the qubit", why: "Fewer impurities means fewer free charges to absorb energy." },
            { q: "Handling the wafer with a bare finger.", a: "Hurts the qubit", why: "Skin oils and salts contaminate the surface." },
            { q: "Annealing a sapphire wafer at high temperature to smooth its surface.", a: "Helps the qubit", why: "A smoother, cleaner crystal surface has fewer defects." },
            { q: "Metal particles shed by a poorly maintained deposition tool.", a: "Hurts the qubit", why: "Particles can short circuits or add loss." },
            { q: "A piranha clean to burn off organic contamination.", a: "Helps the qubit", why: "It removes organic residues before processing." }
        ],
        6,
        "qc-cleanquiz-done",
        "You think like a qubit fab engineer",
        "Clean surfaces and pure materials mean longer-lived qubits.",
        "Most loss hides at surfaces and interfaces. Hit Reset to try again."
    );


    make("qc-wafer", {
        title: "Try it: how many chips per wafer?",
        w: 680, h: 240,
        aria: "A round wafer divided into square chips. Only chips that fit fully inside the usable area are counted.",
        defaults: { d: 100, c: 10 },
        segs: [["Wafer", "d", [[100, "100 mm"], [150, "150 mm"], [200, "200 mm"], [300, "300 mm"]]]],
        sliders: [["Chip size", "c", 5, 30, 0.5, function (v) { return v.toFixed(1) + " mm"; }]],
        stats: [["Whole chips", "n"], ["Wafer used", "u"]],
        formula: "Qubit chips are made many at a time on one wafer, then diced apart. University labs mostly use 100 mm wafers; industrial fabs moving quantum chips onto standard lines use 200 or 300 mm wafers, which fit far more chips and use the same automated tools as ordinary chips. A 3 mm rim at the edge is not used.",
        read: function (s) {

            const n = countDies(s.d, s.c);
            const used = n * s.c * s.c / (Math.PI * s.d * s.d / 4);

            return {
                n: String(n),
                u: Math.round(used * 100) + "%",
                verdict: n >= 100 ? "A big batch: plenty of chips to test and pick from" : n >= 20 ? "A small batch of chips" : "Only a handful of chips per wafer"
            };
        },
        reward: { when: function (s) { return countDies(s.d, s.c) >= 100; }, msg: "You fitted 100 chips on a wafer" },
        draw: function (ctx, s) {

            const R = 105;
            const cx = 170, cy = 120;
            const sc = R / (s.d / 2);
            const r = s.d / 2 - 3;

            ctx.fillStyle = "#5b6378";
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.fill();

            const n = Math.floor(s.d / s.c) + 2;

            for (let i = -n; i <= n; i++) {

                for (let j = -n; j <= n; j++) {

                    const x0 = i * s.c - s.c / 2;
                    const y0 = j * s.c - s.c / 2;
                    const corners = [[x0, y0], [x0 + s.c, y0], [x0, y0 + s.c], [x0 + s.c, y0 + s.c]];
                    const inside = corners.every(function (c) { return Math.hypot(c[0], c[1]) <= r; });

                    if (Math.hypot(x0 + s.c / 2, y0 + s.c / 2) > s.d / 2 + s.c) { continue; }

                    box(ctx, cx + x0 * sc + 0.5, cy + y0 * sc + 0.5, s.c * sc - 1, s.c * sc - 1, inside ? TEAL + ".55)" : "rgba(255,105,120,.12)", inside ? TEAL + ".9)" : null);
                }
            }

            ctx.strokeStyle = GOLD + ".7)";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(cx, cy, r * sc, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            txt(ctx, "teal: whole chips   red: wasted edge pieces", 470, 80, 12, GREY + ".9)");
            txt(ctx, s.d + " mm wafer", 470, 120, 22, TEXT + "1)", "center", true);
            txt(ctx, countDies(s.d, s.c) + " chips of " + s.c + " × " + s.c + " mm", 470, 155, 14, TEAL + "1)", "center", true);
        }
    });

    function countDies(D, c) {

        const r = D / 2 - 3;
        const n = Math.floor(D / c) + 2;
        let k = 0;

        for (let i = -n; i <= n; i++) {

            for (let j = -n; j <= n; j++) {

                const x0 = i * c - c / 2;
                const y0 = j * c - c / 2;

                if ([[x0, y0], [x0 + c, y0], [x0, y0 + c], [x0 + c, y0 + c]].every(function (p) { return Math.hypot(p[0], p[1]) <= r; })) { k++; }
            }
        }

        return k;
    }


    /* ======================================
       UNIT 22: SUPERCONDUCTING FILMS
    ====================================== */

    SIMS["qc-deposit"] = stepper({
        title: "Explore: four ways to lay down a metal film",
        viewBox: "0 0 340 190",
        aria: "Animations of sputtering, electron-beam evaporation, heated-substrate sputtering and reactive sputtering of titanium nitride.",
        interval: 6.5,
        steps: [
            { t: "Sputtering", text: "Argon ions from a plasma hit a metal target and knock atoms off; they coat the wafer from many directions. Fast and uniform: used for niobium, tantalum and TiN.", tool: "Sputter tool" },
            { t: "Electron-beam evaporation", text: "An electron beam melts a pellet of aluminium in high vacuum. Atoms fly out in straight lines, like light from a bulb. That directionality is what makes shadow-evaporated junctions possible (Unit 24).", tool: "E-beam evaporator" },
            { t: "Sputtering onto a hot wafer", text: "Heating the substrate to several hundred °C lets atoms settle into a better crystal. This is how the low-loss alpha phase of tantalum is grown." },
            { t: "Reactive sputtering (TiN)", text: "Sputter titanium in a mix of argon and nitrogen and the film grows as titanium nitride. The nitrogen flow sets its composition and critical temperature. TiN can also be grown atom layer by atom layer (ALD)." }
        ],
        rewardKey: "qc-deposit",
        rewardMsg: "You met the film deposition tools",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = sR(70, 160, 200, 14, SI, "#7a8199") + sR(70, 160 - 6 * ease(k), 200, 6 * ease(k), step === 3 ? "#d6b85a" : METAL);
            const r = mulberry(step + 1);

            if (step === 0 || step === 2 || step === 3) {

                s += sR(90, 20, 160, 16, step === 3 ? "#9aa6c4" : "#c9d3e6", "#f5f7ff") + sT(170, 14, step === 3 ? "titanium target" : "metal target", 9, "#aab3cf");
                s += sR(80, 40, 180, 30, "rgba(190,150,255,.15)") + sT(290, 58, "plasma", 9, "#be96ff");

                for (let i = 0; i < 14; i++) {

                    const t = (st.anim * 0.4 + r()) % 1;
                    const x0 = 100 + r() * 140;
                    const dx = (r() - 0.5) * 120;

                    s += sC(x0 + dx * t, 40 + t * 118, 2.5, step === 3 && i % 2 ? "#78b4ff" : "#f5f7ff");
                }

                if (step === 3) { s += sT(300, 100, "+ N₂", 10, "#78b4ff"); }
                if (step === 2) { s += sR(70, 174, 200, 8, "rgba(255,105,120,.8)") + sT(170, 188, "heater: several hundred °C", 8, "#ff6978"); }
            }

            if (step === 1) {

                s += sR(150, 20, 40, 14, "#555b70", "#aab3cf") + sC(170, 20, 7, "#ffd666") + sT(220, 18, "molten Al", 9, "#ffd666", "start");
                s += sP("M60 40 Q120 0 165 18", "#78b4ff", 1.5) + sT(60, 54, "e-beam", 9, "#78b4ff");

                for (let i = 0; i < 12; i++) {

                    const t = (st.anim * 0.35 + r()) % 1;
                    const ang = (r() - 0.5) * 0.9;

                    s += sC(170 + Math.sin(ang) * t * 160, 28 + Math.cos(ang) * t * 132, 2.5, "#f5f7ff");
                }

                s += sT(300, 100, "straight-line paths", 9, "#aab3cf");
            }

            return s;
        }
    });


    const FILMS = {
        al: { n: "Aluminium", tc: 1.2, gap: 90, ox: "AlOₓ, about 2 nm, amorphous", use: "Every Josephson junction; also wiring", pro: "Its oxide is the junction barrier", con: "Low critical temperature; its oxide adds loss on wiring" },
        nb: { n: "Niobium", tc: 9.3, gap: 700, ox: "A mix: NbO, NbO₂, Nb₂O₅", use: "Wiring, resonators, ground planes", pro: "High critical temperature; robust", con: "Its suboxides are lossy" },
        ta: { n: "Tantalum", tc: 4.4, gap: 330, ox: "Mostly Ta₂O₅, thin and uniform", use: "Capacitor pads and wiring of record-coherence transmons", pro: "Low-loss surface; survives harsh acid cleans", con: "Must be grown in its alpha phase" },
        tin: { n: "Titanium nitride", tc: 4.5, gap: 330, ox: "A thin TiOₓNᵧ layer", use: "Ultra-low-loss resonators, high-inductance wires", pro: "Very low surface loss; chemically stable", con: "Properties depend on the exact recipe" }
    };

    make("qc-metals", {
        title: "Compare: four superconducting films",
        w: 680, h: 230,
        aria: "A card describing the chosen superconducting film and a bar chart of critical temperatures.",
        defaults: { m: "al" },
        segs: [["Film", "m", [["al", "Aluminium"], ["nb", "Niobium"], ["ta", "Tantalum"], ["tin", "TiN"]]]],
        stats: [["Critical temperature", "tc"], ["Films compared", "n"]],
        formula: "A transmon is usually a <b>mix</b> of metals: aluminium for the junction (its oxide makes an excellent barrier), plus niobium, tantalum or TiN for the large capacitor pads, resonators and ground plane, where surface loss matters most. In 2021, tantalum pads pushed transmon lifetimes past 0.3 ms (Place et al.).",
        init: function (s, d) { d.seen = {}; },
        read: function (s, d) {

            const m = FILMS[s.m];

            d.seen[s.m] = true;

            return {
                tc: m.tc + " K",
                n: Object.keys(d.seen).length + " of 4",
                verdict: m.n + ": " + m.use.toLowerCase()
            };
        },
        reward: { when: function (s, d) { return Object.keys(d.seen).length >= 4; }, msg: "You compared all four films" },
        draw: function (ctx, s) {

            const m = FILMS[s.m];
            const rows = [["Native oxide", m.ox], ["Used for", m.use], ["Strength", m.pro], ["Weakness", m.con], ["Pair-breaking gap", "about " + m.gap + " GHz"]];

            rows.forEach(function (r, i) {

                txt(ctx, r[0], 30, 36 + i * 40, 11, GREY + ".9)", "left");
                txt(ctx, r[1], 30, 53 + i * 40, 13, TEXT + "1)", "left", true);
            });

            const keys = ["al", "nb", "ta", "tin"];

            keys.forEach(function (k, i) {

                const f = FILMS[k];
                const h = f.tc / 10 * 150;
                const x = 460 + i * 52;
                const on = k === s.m;

                box(ctx, x, 190 - h, 36, h, (on ? GOLD : TEAL) + (on ? ".9)" : ".4)"));
                txt(ctx, f.tc + " K", x + 18, 184 - h, 11, TEXT + ".9)");
                txt(ctx, k === "tin" ? "TiN" : f.n.slice(0, 2), x + 18, 206, 12, on ? GOLD + "1)" : GREY + ".9)", "center", true);
            });

            txt(ctx, "critical temperature", 560, 26, 11, GREY + ".85)");
        }
    });


    const OX = {
        al: { n: "Aluminium", t: 2.5, d: 0.5 },
        nb: { n: "Niobium", t: 5, d: 1 },
        ta: { n: "Tantalum", t: 2.5, d: 0.25 },
        tin: { n: "TiN", t: 1.5, d: 0.2 }
    };

    make("qc-oxide", {
        title: "Try it: the oxide on top of the metal",
        w: 680, h: 230,
        aria: "A cross-section of a metal film with its native oxide on top. Purple dots mark defects that absorb energy.",
        defaults: { m: "nb", cap: "none" },
        segs: [["Metal", "m", [["al", "Aluminium"], ["nb", "Niobium"], ["ta", "Tantalum"], ["tin", "TiN"]]], ["Surface", "cap", [["none", "Left in air"], ["cap", "Capped in vacuum"]]]],
        stats: [["Oxide thickness", "t"], ["Surface loss (Nb in air = 100)", "l"]],
        animated: true,
        formula: "As soon as a metal meets air, a native oxide grows on it, a few nanometres thick and usually amorphous. Amorphous oxides host <b>two-level system (TLS) defects</b>: atoms that can flip between two positions and absorb qubit energy. Niobium's mixed oxides are especially lossy. Fixes: pick a metal with a benign oxide (tantalum), or cover the metal with a thin capping layer before it ever sees air (shown to help niobium qubits in 2024). Values are illustrative.",
        init: function (s, d) { d.r = mulberry(22); d.tls = []; for (let i = 0; i < 60; i++) { d.tls.push([d.r(), d.r(), d.r() * 6.28]); } },
        read: function (s) {

            const o = OX[s.m];
            const capped = s.cap === "cap";
            const loss = Math.round((capped ? 0.15 : 1) * o.d * 100);

            return {
                t: capped ? "almost none" : "about " + o.t + " nm",
                l: String(loss),
                verdict: loss <= 25 ? "A low-loss surface" : loss <= 50 ? "Moderate surface loss" : "A lossy surface: qubits made from it will be short-lived"
            };
        },
        reward: { when: function (s) { return s.m === "nb" && s.cap === "cap"; }, msg: "You protected niobium from its oxide" },
        draw: function (ctx, s, d, time) {

            const o = OX[s.m];
            const capped = s.cap === "cap";
            const ot = capped ? 0 : o.t * 12;

            box(ctx, 60, 180, 560, 30, SI);
            txt(ctx, "substrate", 340, 200, 11, GREY + ".9)");
            box(ctx, 60, 110, 560, 70, "#9aa6c4");
            txt(ctx, o.n + " film", 340, 150, 13, "#1a2033", "center", true);

            if (capped) {

                box(ctx, 60, 100, 560, 10, GOLD + ".8)");
                txt(ctx, "thin cap deposited in vacuum: no native oxide", 340, 90, 11, GOLD + "1)");

            } else {

                box(ctx, 60, 110 - ot, 560, ot, "rgba(190,150,255,.4)");
                txt(ctx, "native oxide", 630, 110 - ot / 2 + 4, 11, PURPLE + "1)", "right");

                const n = Math.round(60 * o.d);

                for (let i = 0; i < n; i++) {

                    const t = d.tls[i];
                    const x = 70 + t[0] * 540;
                    const y = 110 - ot + 3 + t[1] * Math.max(1, ot - 6);
                    const on = Math.sin(time * 2 + t[2]) > 0;

                    dot(ctx, x + (on ? 1.5 : -1.5), y, 2.6, ROSE + (on ? "1)" : ".5)"));
                }

                txt(ctx, "red: defects (TLS) that flip and absorb energy", 340, 40, 11, ROSE + "1)");
            }
        }
    });


    make("qc-sputter", {
        title: "Try it: sputter a 150 nm film",
        w: 680, h: 230,
        aria: "Atoms rain down onto a wafer and a metal film grows; a gauge shows the thickness against a 150 nanometre target.",
        defaults: { pw: 300, t: 6 },
        sliders: [["Sputter power", "pw", 100, 500, 10, function (v) { return v + " W"; }], ["Deposition time", "t", 0, 25, 0.25, function (v) { return v.toFixed(2) + " min"; }]],
        stats: [["Deposition rate", "r"], ["Film thickness", "th"]],
        animated: true,
        formula: "Deposition rate rises roughly in proportion to the sputter power, so thickness ≈ rate × time. Fabs calibrate each tool by measuring test films with a profilometer or X-ray reflectivity. Qubit films are typically 100 to 200 nm thick: thick enough to be robust, thin enough to pattern finely. (Here rate = 0.04 nm/min per watt, an illustrative calibration.)",
        init: function (s, d) { d.r = mulberry(5); },
        read: function (s) {

            const rate = 0.04 * s.pw;
            const th = rate * s.t;

            return {
                r: rate.toFixed(1) + " nm/min",
                th: th.toFixed(0) + " nm",
                verdict: Math.abs(th - 150) <= 5 ? "On target: 150 nm" : th < 150 ? "Too thin: keep going" : "Too thick: you overshot"
            };
        },
        reward: { when: function (s) { return Math.abs(0.04 * s.pw * s.t - 150) <= 5; }, msg: "You sputtered a film to the target thickness" },
        draw: function (ctx, s, d, time) {

            const th = 0.04 * s.pw * s.t;
            const h = clamp(th / 250 * 90, 0, 120);

            box(ctx, 80, 30, 300, 16, "#c9d3e6");
            txt(ctx, "target", 230, 24, 10, GREY + ".85)");
            box(ctx, 80, 200, 300, 20, SI);
            box(ctx, 80, 200 - h, 300, h, "#9aa6c4");

            const n = Math.round(s.pw / 25);

            for (let i = 0; i < n; i++) {

                const u = (time * 0.6 + i * 0.137) % 1;
                const x = 90 + ((i * 97) % 280) + Math.sin(i) * 20 * u;

                dot(ctx, x, 50 + u * (148 - h), 2.4, TEXT + ".9)");
            }

            const gx = 470;
            const Y = function (t) { return 200 - t / 250 * 160; };

            box(ctx, gx, 40, 30, 160, "rgba(255,255,255,.04)", GREY + ".5)");
            box(ctx, gx, Y(Math.min(th, 250)), 30, 200 - Y(Math.min(th, 250)), (Math.abs(th - 150) <= 5 ? TEAL : th > 155 ? ROSE : GOLD) + ".8)");
            line(ctx, gx - 8, Y(150), gx + 38, Y(150), TEAL + "1)", 2);
            txt(ctx, "150 nm target", gx + 44, Y(150) + 4, 11, TEAL + "1)", "left");
            txt(ctx, th.toFixed(0) + " nm", gx + 15, 218, 12, TEXT + "1)", "center", true);
        }
    });


    function alphaFrac(T) { return 1 / (1 + Math.exp(-(T - 450) / 45)); }

    make("qc-taphase", {
        title: "Try it: grow the right kind of tantalum",
        w: 680, h: 230,
        aria: "Grains of tantalum film coloured by crystal phase: alpha (wanted) or beta (unwanted). Heating the sapphire substrate turns more grains alpha.",
        defaults: { T: 150 },
        sliders: [["Substrate temperature during sputtering", "T", 20, 800, 5, function (v) { return v + " °C"; }]],
        stats: [["Alpha-phase grains", "a"], ["Film critical temperature", "tc"]],
        formula: "Tantalum can grow in two crystal forms. <b>Alpha</b> tantalum (body-centred cubic) superconducts below about 4.4 K and is the low-loss film qubits want. <b>Beta</b> tantalum (tetragonal) superconducts only below about 1 K and is lossy. Sputtering onto sapphire heated to several hundred °C gives pure alpha films; on silicon a thin seed layer is often used instead. The temperature curve here is illustrative.",
        init: function (s, d) { d.r = mulberry(31); d.g = []; for (let i = 0; i < 70; i++) { d.g.push(d.r()); } },
        read: function (s) {

            const a = alphaFrac(s.T);
            const tc = a > 0.97 ? 4.4 : a > 0.5 ? 4.2 : 0.8;

            return {
                a: Math.round(a * 100) + "%",
                tc: "about " + tc + " K",
                verdict: a > 0.97 ? "Pure alpha tantalum: ready for record qubits" : a > 0.5 ? "Mixed phases: extra loss at the beta grains" : "Mostly beta tantalum: lossy, with a low critical temperature"
            };
        },
        reward: { when: function (s) { return alphaFrac(s.T) > 0.97; }, msg: "You grew alpha-phase tantalum" },
        draw: function (ctx, s, d) {

            const a = alphaFrac(s.T);

            box(ctx, 40, 180, 600, 30, "#b9d4f0");
            txt(ctx, "sapphire", 340, 200, 11, "#1a2033");

            for (let i = 0; i < 35; i++) {

                const isA = d.g[i] < a;
                const x = 40 + i * (600 / 35);

                box(ctx, x + 0.5, 110, 600 / 35 - 1, 70, isA ? TEAL + ".75)" : ROSE + ".6)");
                txt(ctx, isA ? "α" : "β", x + 600 / 70, 150, 11, "#1a2033", "center", true);
            }

            box(ctx, 40, 210, 600, 6, "rgba(255,105," + Math.round(120 * (1 - s.T / 800)) + "," + (0.3 + 0.7 * s.T / 800) + ")");
            txt(ctx, "teal α: low loss, 4.4 K    red β: lossy, under 1 K", 340, 80, 12, GREY + ".9)");
            txt(ctx, "tantalum film", 340, 100, 11, TEXT + ".9)");
        }
    });


    /* ======================================
       UNIT 23: PATTERNING THE CIRCUIT
    ====================================== */

    SIMS["qc-litho"] = stepper({
        title: "Explore: drawing the circuit with light",
        viewBox: "0 0 340 190",
        aria: "Cross-sections: resist spun on a metal film, exposed through a mask, developed, the metal etched, and the resist stripped.",
        interval: 6.5,
        steps: [
            { t: "Spin on resist", text: "A light-sensitive polymer (photoresist) is spun onto the metal-coated wafer, forming an even layer about a micrometre thick.", tool: "Spin coater" },
            { t: "Expose the pattern", text: "UV light shines through a mask (or a stepper projects it, shrunk). For the smallest features, like junctions, an electron beam writes the pattern directly instead.", tool: "Stepper / e-beam" },
            { t: "Develop", text: "A developer dissolves the exposed resist, uncovering the metal where gaps should be." },
            { t: "Etch the metal", text: "A chlorine or fluorine plasma (or a wet etch) removes the uncovered metal. Now the circuit is cut into the film.", tool: "Plasma etcher" },
            { t: "Strip the resist", text: "Solvents and an oxygen plasma remove the remaining resist. Any residue left behind adds loss, so this clean must be thorough." }
        ],
        rewardKey: "qc-litho",
        rewardMsg: "You followed a lithography cycle",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            const gaps = [[110, 30], [200, 30]];
            let s = sR(50, 140, 240, 30, SI) + sT(170, 160, "substrate", 9, "#aab3cf");
            const metalCut = step >= 3;
            const etch = step === 3 ? ease(k) : step > 3 ? 1 : 0;

            s += sR(50, 125, 240, 15, METAL);

            if (metalCut) { gaps.forEach(function (g) { s += sR(g[0], 125, g[1], 15 * etch, "rgba(6,10,24,1)"); }); }

            if (step <= 3) {

                const rh = step === 0 ? 20 * ease(k) : 20;

                s += sR(50, 125 - rh, 240, rh, RESIST);

                if (step >= 2) { gaps.forEach(function (g) { s += sR(g[0], 105, g[1], 20 * (step === 2 ? ease(k) : 1), "rgba(6,10,24,1)"); }); }
            }

            if (step === 4) {

                const rh = 20 * (1 - ease(k));

                [[50, 60], [140, 60], [230, 60]].forEach(function (p) { s += sR(p[0], 125 - rh, p[1], rh, RESIST); });
            }

            if (step === 1) {

                s += sR(50, 50, 240, 8, "#555b70") + sR(110, 50, 30, 8, "rgba(255,255,255,.1)") + sR(200, 50, 30, 8, "rgba(255,255,255,.1)") + sT(300, 56, "mask", 9, "#aab3cf", "start");

                gaps.forEach(function (g) { for (let i = 0; i < 3; i++) { s += sL(g[0] + 5 + i * 10, 58, g[0] + 5 + i * 10, 58 + 45 * ease(k), "#be96ff", 2); } });

                s += sT(170, 36, "UV light", 9, "#be96ff");
            }

            if (step === 3) { s += sT(170, 60, "plasma", 10, "#ff6978"); for (let i = 0; i < 8; i++) { s += sC(70 + i * 28, 70 + ((st.anim * 40 + i * 13) % 30), 2, "#ff6978"); } }

            return s;
        }
    });


    make("qc-etch", {
        title: "Try it: wet or dry etch?",
        w: 680, h: 230,
        aria: "A cross-section of a metal film under a resist mask being etched. A wet etch undercuts sideways; a dry plasma etch cuts straight down and can trench into the silicon.",
        defaults: { m: "dry", t: 0.4 },
        segs: [["Etch", "m", [["wet", "Wet (acid bath)"], ["dry", "Dry (plasma)"]]]],
        sliders: [["Etch time (× time to clear the metal)", "t", 0, 2, 0.02, function (v) { return v.toFixed(2) + "×"; }]],
        stats: [["Metal cleared?", "c"], ["Sideways undercut", "u"], ["Trench into silicon", "tr"]],
        formula: "A <b>wet</b> etch eats in every direction, so it undercuts the mask by about as much as it etches down: fine for big features, bad for 2 µm gaps. A <b>dry</b> plasma etch is directional and cuts straight down. Keep a dry etch going a bit longer (over-etch) and it digs a shallow trench into the silicon, which removes some lossy surface from the strongest fields. Too deep, though, and the line's frequency shifts.",
        read: function (s) {

            const cleared = s.t >= 1;
            const under = s.m === "wet" ? Math.min(s.t, 1.6) * 0.15 : 0.01 * s.t;
            const trench = s.m === "dry" && s.t > 1 ? (s.t - 1) * 0.5 : 0;

            return {
                c: cleared ? "Yes" : "No: metal still bridges the gap",
                u: (under * 1000).toFixed(0) + " nm",
                tr: trench > 0 ? (trench * 1000).toFixed(0) + " nm" : "none",
                verdict: !cleared ? "Not done: the gap is still shorted" : s.m === "wet" ? "Cleared, but the undercut widened the 2 µm gap" : trench > 0.4 ? "Trench too deep: frequencies will shift" : "Clean, vertical walls"
            };
        },
        reward: { when: function (s) { return s.m === "dry" && s.t >= 1 && (s.t - 1) * 0.5 <= 0.3; }, msg: "You etched clean, vertical gaps" },
        draw: function (ctx, s) {

            const X0 = 80, W = 520;
            const sc = 100;
            const metalT = 0.15 * sc;
            const top = 110;
            const gap = [[260, 60], [380, 60]];
            const t = s.t;

            box(ctx, X0, top + metalT, W, 80, SI);
            txt(ctx, "silicon", 340, top + metalT + 60, 11, GREY + ".9)");
            box(ctx, X0, top, W, metalT, METAL);

            gap.forEach(function (g) {

                const depth = Math.min(t, 1) * metalT;
                const under = s.m === "wet" ? Math.min(t, 1.6) * 0.15 * sc : 0;

                if (s.m === "wet") {

                    ctx.fillStyle = "rgba(6,10,24,1)";
                    ctx.beginPath();
                    ctx.moveTo(g[0], top);
                    ctx.quadraticCurveTo(g[0] - under, top, g[0] - under, top + depth);
                    ctx.lineTo(g[0] + g[1] + under, top + depth);
                    ctx.quadraticCurveTo(g[0] + g[1] + under, top, g[0] + g[1], top);
                    ctx.fill();

                } else {

                    box(ctx, g[0], top, g[1], depth, "rgba(6,10,24,1)");

                    if (t > 1) { box(ctx, g[0], top + metalT, g[1], (t - 1) * 0.5 * sc, "rgba(6,10,24,1)"); }
                }

            });

            [[X0, gap[0][0]], [gap[0][0] + gap[0][1], gap[1][0]], [gap[1][0] + gap[1][1], X0 + W]].forEach(function (r) { box(ctx, r[0], top - 22, r[1] - r[0], 22, RESIST); });

            txt(ctx, "resist mask", 150, top - 30, 11, "rgba(255,159,106,1)");
            txt(ctx, "metal", 150, top + 12, 11, "#1a2033", "center", true);
            txt(ctx, "2 µm gaps", 350, top - 30, 11, TEXT + ".9)");
        }
    });


    SIMS["qc-liftoff"] = stepper({
        title: "Explore: liftoff, the other way to pattern",
        viewBox: "0 0 340 190",
        aria: "Resist with overhanging openings; metal is evaporated over everything; dissolving the resist lifts off the unwanted metal.",
        interval: 6.5,
        steps: [
            { t: "Pattern the resist first", text: "Instead of etching metal, pattern the resist on the bare wafer. A two-layer resist gives the openings an overhang (an undercut profile)." },
            { t: "Evaporate metal everywhere", text: "Metal from an evaporator lands on top of the resist and, through the openings, on the substrate. The overhang keeps the two deposits from touching." },
            { t: "Dissolve the resist", text: "A solvent dissolves the resist and the metal on top of it floats away: it lifts off. Only the metal in the openings stays." },
            { t: "Why use liftoff", text: "No plasma ever touches the metal, and it works with metals that are hard to etch. Josephson junctions are always made this way (Unit 24). The risk: flakes and resist residue left at the edges." }
        ],
        rewardKey: "qc-liftoff",
        rewardMsg: "You learned the liftoff process",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = sR(40, 140, 260, 30, SI);
            const opens = [[110, 40], [200, 40]];

            if (step <= 1 || (step === 2 && k < 0.7)) {

                const lift = step === 2 ? ease(k / 0.7) * 50 : 0;
                const fade = step === 2 ? 1 - k / 0.7 : 1;

                [[40, 70], [150, 50], [240, 60]].forEach(function (p) {

                    s += sR(p[0] + 4, 120 - lift, p[1] - 8, 20, "rgba(255,159,106," + 0.45 * fade + ")");
                    s += sR(p[0], 112 - lift, p[1], 8, "rgba(255,159,106," + 0.75 * fade + ")");

                    if (step >= 1) { s += sR(p[0], 106 - lift, p[1], step === 1 ? 6 * ease(k) : 6, "rgba(201,211,230," + fade + ")"); }
                });
            }

            if (step >= 1) { opens.forEach(function (o) { s += sR(o[0], 134, o[1], step === 1 ? 6 * ease(k) : 6, METAL); }); }

            if (step === 1) { for (let i = 0; i < 10; i++) { s += sL(60 + i * 24, 20 + ((st.anim * 50 + i * 7) % 60), 60 + i * 24, 26 + ((st.anim * 50 + i * 7) % 60), "#f5f7ff", 2); } s += sT(170, 14, "evaporated metal", 9, "#f5f7ff"); }

            if (step === 2) { s += sT(170, 40, "solvent", 10, "#54e0c7"); }

            if (step === 3) { s += sT(170, 110, "only the wanted metal remains", 10, "#54e0c7"); }

            if (step === 0) { s += sT(170, 60, "overhang (undercut)", 9, "rgba(255,159,106,1)") + sL(150, 66, 150, 112, "rgba(255,159,106,1)", 1, "2 2"); }

            return s;
        }
    });


    // Complete elliptic integral of the first kind, by the arithmetic-geometric mean.
    function ellipK(k) {

        let a = 1;
        let b = Math.sqrt(1 - k * k);

        for (let i = 0; i < 12; i++) { const an = (a + b) / 2; b = Math.sqrt(a * b); a = an; }

        return Math.PI / (2 * a);
    }

    function cpwZ(w, g, er) {

        const k = w / (w + 2 * g);
        const kp = Math.sqrt(1 - k * k);
        const ee = (er + 1) / 2;

        return 30 * Math.PI / Math.sqrt(ee) * ellipK(kp) / ellipK(k);
    }

    make("qc-cpwz", {
        title: "Design it: a 50-ohm line",
        w: 680, h: 230,
        aria: "The cross-section of a coplanar waveguide: a centre strip between two ground planes on a substrate. Its impedance updates as the widths change.",
        defaults: { w: 6, g: 8, s: "si" },
        segs: [["Substrate", "s", [["si", "Silicon (11.7)"], ["sa", "Sapphire (about 10.4)"]]]],
        sliders: [["Centre strip width", "w", 2, 30, 0.5, function (v) { return v + " µm"; }], ["Gap to ground", "g", 1, 20, 0.5, function (v) { return v + " µm"; }]],
        stats: [["Impedance", "z"], ["Mismatch reflection", "r"]],
        formula: "Every cable and connector in the fridge is 50 Ω, so the feedline and drive lines on the chip must be too, or signals reflect. A coplanar waveguide's impedance depends only on the <b>ratio</b> of strip width to gap (and the substrate): Z<sub>0</sub> = (30π/√ε<sub>eff</sub>) K(k′)/K(k), with k = w/(w + 2g). That's why lithography must hold a 10 µm strip and a 6 µm gap to a fraction of a micrometre.",
        read: function (s) {

            const er = s.s === "si" ? 11.7 : 10.4;
            const z = cpwZ(s.w, s.g, er);
            const gamma = Math.abs((z - 50) / (z + 50));

            return {
                z: z.toFixed(1) + " Ω",
                r: (gamma * gamma * 100).toFixed(2) + "% of power",
                verdict: Math.abs(z - 50) <= 1 ? "Matched to 50 Ω" : z > 50 ? "Too high: widen the strip or narrow the gap" : "Too low: narrow the strip or widen the gap"
            };
        },
        reward: { when: function (s) { return Math.abs(cpwZ(s.w, s.g, s.s === "si" ? 11.7 : 10.4) - 50) <= 1; }, msg: "You designed a 50-ohm line" },
        draw: function (ctx, s) {

            const sc = 6;
            const cx = 340;
            const y = 120;
            const half = s.w / 2 * sc;
            const gp = s.g * sc;

            box(ctx, 30, y + 6, 620, 70, s.s === "si" ? SI : "#5b7fa8");
            box(ctx, cx - half, y, 2 * half, 6, GOLD + "1)");
            box(ctx, 30, y, cx - half - gp - 30, 6, METAL);
            box(ctx, cx + half + gp, y, 650 - cx - half - gp, 6, METAL);

            for (let i = 0; i < 9; i++) {

                const a = Math.PI * (0.1 + 0.8 * i / 8);

                ctx.strokeStyle = PURPLE + ".5)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(cx, y + 3, half + gp * 0.7 + i * 3, (half + gp) * 0.6 + i * 2, 0, Math.PI + a * 0.2, 2 * Math.PI - a * 0.2);
                ctx.stroke();
            }

            txt(ctx, "ground", 80, y - 10, 11, GREY + ".9)");
            txt(ctx, "ground", 600, y - 10, 11, GREY + ".9)");
            txt(ctx, "signal strip " + s.w + " µm", cx, y + 30, 12, GOLD + "1)", "center", true);
            txt(ctx, "gap " + s.g + " µm", cx - half - gp / 2, y - 10, 11, TEXT + ".9)");
            txt(ctx, "gap " + s.g + " µm", cx + half + gp / 2, y - 10, 11, TEXT + ".9)");
            txt(ctx, "purple: electric field lines", 340, 30, 11, PURPLE + "1)");
        }
    });


    SIMS["qc-fabmistakes"] = quiz(
        "Game: fab detective",
        ["Short circuit", "Open circuit", "Extra loss (short T₁)", "Wrong frequency"],
        [
            { q: "A sliver of metal was left behind, joining the feedline to the ground plane.", a: "Short circuit", why: "Unwanted metal between conductors connects them." },
            { q: "A scratch cut right across a resonator's centre strip.", a: "Open circuit", why: "A break in a line stops the signal." },
            { q: "Resist residue was left under the capacitor pads.", a: "Extra loss (short T₁)", why: "Organic residue is a lossy dielectric where the fields are strong." },
            { q: "The capacitor pads came out 10% smaller than designed.", a: "Wrong frequency", why: "Less capacitance raises the charging energy and the qubit frequency." },
            { q: "The junction's area came out 10% too big.", a: "Wrong frequency", why: "A bigger junction has a larger Josephson energy, so the qubit frequency rises." },
            { q: "A dust particle blocked the exposure, so metal remained across a gap.", a: "Short circuit", why: "Unexposed resist protected metal that should have been etched." },
            { q: "Native oxide was left on the silicon before the metal went down.", a: "Extra loss (short T₁)", why: "The metal–substrate interface now holds lossy defects." },
            { q: "A wire bond lifted off its pad during packaging.", a: "Open circuit", why: "The line is no longer connected to the outside world." }
        ],
        6,
        "qc-fabmistakes-done",
        "Case closed",
        "Each fab mistake leaves its own fingerprint in the measurements.",
        "Shorts and opens break circuits; residues add loss; size errors shift frequencies. Hit Reset to try again."
    );


    /* ======================================
       UNIT 24: MAKING THE JOSEPHSON JUNCTION
    ====================================== */

    make("qc-shadow", {
        title: "Try it: shadow evaporation geometry",
        w: 680, h: 240,
        aria: "A cross-section of a suspended resist bridge. Metal arrives from two angles; the two deposits overlap under the bridge to form the junction.",
        defaults: { h: 0.6, a: 25, b: 0.2 },
        sliders: [["Resist height under the bridge", "h", 0.2, 1.2, 0.02, function (v) { return v.toFixed(2) + " µm"; }], ["Evaporation angle", "a", 0, 45, 0.5, function (v) { return "±" + v + "°"; }], ["Bridge width", "b", 0.1, 0.4, 0.01, function (v) { return Math.round(v * 1000) + " nm"; }]],
        stats: [["Shift per evaporation", "sh"], ["Overlap (junction length)", "ov"]],
        formula: "The resist bridge casts a shadow. Evaporating at +θ and then at −θ shifts each copy of the pattern sideways by h·tan θ, where h is the height of the bridge above the substrate. The two copies overlap under the bridge by 2h·tan θ − b. That overlap, a couple of hundred nanometres, is the junction. Tilt too little and they don't overlap (no junction); too much and the junction is too big.",
        read: function (s) {

            const sh = s.h * Math.tan(s.a * Math.PI / 180);
            const ov = 2 * sh - s.b;

            return {
                sh: Math.round(sh * 1000) + " nm",
                ov: ov > 0 ? Math.round(ov * 1000) + " nm" : "none",
                verdict: ov <= 0 ? "No overlap: an open circuit, not a junction" : ov < 0.1 ? "A very small junction: fragile and hard to reproduce" : ov <= 0.3 ? "A good transmon-sized junction" : "Too big: the qubit frequency will be too high"
            };
        },
        reward: { when: function (s) { const ov = 2 * s.h * Math.tan(s.a * Math.PI / 180) - s.b; return ov >= 0.15 && ov <= 0.25; }, msg: "You aimed a shadow-evaporated junction" },
        draw: function (ctx, s) {

            const sc = 220;
            const cx = 340;
            const ySub = 190;
            const yBr = ySub - s.h * sc;
            const hb = s.b * sc / 2;
            const sh = s.h * Math.tan(s.a * Math.PI / 180) * sc;
            const open = 0.9 * sc;

            box(ctx, 40, ySub, 600, 30, SI);
            box(ctx, 40, yBr - 14, cx - open - 40, 14, RESIST);
            box(ctx, cx + open, yBr - 14, 640 - cx - open, 14, RESIST);
            box(ctx, cx - hb, yBr - 14, 2 * hb, 14, "rgba(255,159,106,.9)");
            box(ctx, 40, yBr, cx - open - 40 - 20, ySub - yBr, "rgba(255,159,106,.25)");
            box(ctx, cx + open + 20, yBr, 640 - cx - open - 20, ySub - yBr, "rgba(255,159,106,.25)");
            txt(ctx, "bridge", cx, yBr - 20, 11, "rgba(255,159,106,1)");

            const t = Math.tan(s.a * Math.PI / 180);

            // first evaporation: from the upper left, shifts right
            [[1, BLUE, -1], [-1, GOLD, 1]].forEach(function (e, i) {

                const shift = e[0] * sh;
                const leftA = cx - open + shift;
                const leftB = cx - hb + shift;
                const rightA = cx + hb + shift;
                const rightB = cx + open + shift;
                const y = ySub - 6 - i * 6;

                box(ctx, Math.max(leftA, 40), y, leftB - Math.max(leftA, 40), 6, e[1] + ".9)");
                box(ctx, rightA, y, Math.min(rightB, 640) - rightA, 6, e[1] + ".9)");

                for (let k = 0; k < 3; k++) {

                    const x0 = cx - 60 + k * 60;

                    arrow(ctx, x0 - e[0] * t * 60, 30 + i * 4, x0, 90 + i * 4, e[1] + ".7)", 1.5);
                }
            });

            txt(ctx, "1st evaporation", 120, 28, 11, BLUE + "1)");
            txt(ctx, "2nd (after oxidising)", 560, 28, 11, GOLD + "1)");

            const ov = 2 * s.h * t - s.b;

            if (ov > 0) {

                box(ctx, cx + hb - sh, ySub - 12, (ov) * sc, 12, "rgba(190,150,255,.5)", PURPLE + "1)");
                txt(ctx, "junction", cx + hb - sh + ov * sc / 2, ySub + 46, 12, PURPLE + "1)", "center", true);
            }
        }
    });


    make("qc-oxidation", {
        title: "Try it: grow the tunnel barrier",
        w: 680, h: 230,
        aria: "Oxygen molecules settle on aluminium and grow a thin oxide barrier. The resulting junction resistance is shown against a 9 kilohm target.",
        defaults: { lp: 0, t: 10, A: 0.03 },
        sliders: [["Oxygen pressure", "lp", -1, 2, 0.02, function (v) { const p = Math.pow(10, v); return (p < 1 ? p.toFixed(2) : p < 10 ? p.toFixed(1) : Math.round(p)) + " mbar"; }], ["Oxidation time", "t", 1, 60, 0.5, function (v) { return v + " min"; }], ["Junction area", "A", 0.01, 0.1, 0.001, function (v) { return v.toFixed(3) + " µm²"; }]],
        stats: [["Oxygen exposure", "e"], ["Barrier resistance × area", "ra"], ["Junction resistance", "rn"]],
        animated: true,
        formula: "Between the two evaporations, pure oxygen is let into the chamber. It grows a self-limiting aluminium oxide barrier, 1 to 2 nm thick. More exposure (pressure × time) makes a slightly thicker barrier, and the resistance × area rises roughly as exposure<sup>0.4</sup>. Divide by the area to get the junction's resistance. A typical transmon junction is about 5 to 15 kΩ. Each fab calibrates its own curve; these numbers are illustrative.",
        init: function (s, d) { d.r = mulberry(8); },
        read: function (s) {

            const E = Math.pow(10, s.lp) * s.t * 60;
            const ra = 10 * Math.pow(E, 0.4);
            const rn = ra / s.A / 1000;

            return {
                e: Math.round(E).toLocaleString("en-US") + " mbar·s",
                ra: Math.round(ra) + " Ω·µm²",
                rn: rn.toFixed(1) + " kΩ",
                verdict: Math.abs(rn - 9) <= 0.5 ? "On target: about 9 kΩ" : rn < 9 ? "Too low: more oxygen, or a smaller junction" : "Too high: less oxygen, or a bigger junction"
            };
        },
        reward: { when: function (s) { const rn = 10 * Math.pow(Math.pow(10, s.lp) * s.t * 60, 0.4) / s.A / 1000; return Math.abs(rn - 9) <= 0.5; }, msg: "You oxidised a junction to target" },
        draw: function (ctx, s, d, time) {

            const E = Math.pow(10, s.lp) * s.t * 60;
            const ot = clamp(8 + Math.log10(E) * 4, 8, 34);

            box(ctx, 60, 170, 360, 40, METAL);
            txt(ctx, "bottom aluminium", 240, 195, 12, "#1a2033", "center", true);
            box(ctx, 60, 170 - ot, 360, ot, "rgba(190,150,255,.55)");
            txt(ctx, "AlOₓ barrier", 430, 170 - ot / 2 + 4, 11, PURPLE + "1)", "left");

            const n = Math.round(4 + s.lp * 6 + 6);

            for (let i = 0; i < n; i++) {

                const u = (time * 0.35 + i * 0.173) % 1;
                const x = 80 + ((i * 71) % 320);

                dot(ctx, x, 30 + u * (130 - ot), 3, ROSE + ".9)");
                dot(ctx, x + 6, 30 + u * (130 - ot), 3, ROSE + ".9)");
            }

            txt(ctx, "O₂", 60, 40, 12, ROSE + "1)", "left", true);

            const rn = 10 * Math.pow(E, 0.4) / s.A / 1000;
            const gx = 520;
            const Y = function (r) { return 200 - clamp(r / 20, 0, 1) * 160; };

            box(ctx, gx, 40, 30, 160, "rgba(255,255,255,.04)", GREY + ".5)");
            box(ctx, gx, Y(rn), 30, 200 - Y(rn), (Math.abs(rn - 9) <= 0.5 ? TEAL : GOLD) + ".8)");
            line(ctx, gx - 8, Y(9), gx + 38, Y(9), TEAL + "1)", 2);
            txt(ctx, "9 kΩ", gx + 44, Y(9) + 4, 11, TEAL + "1)", "left");
            txt(ctx, "20 kΩ", gx + 44, 44, 10, GREY + ".8)", "left");
        }
    });


    SIMS["qc-manhattan"] = stepper({
        title: "Explore: the Manhattan-style junction",
        viewBox: "0 0 340 190",
        aria: "Two crossing lines opened in resist, seen from above. The first evaporation fills one line, the second fills the other, and they overlap in a small square: the junction.",
        interval: 6.5,
        steps: [
            { t: "Two crossing trenches", text: "Instead of a suspended bridge, e-beam lithography opens two thin lines in a thick resist, crossing at right angles like streets in Manhattan." },
            { t: "First evaporation: along line A", text: "Tilt the wafer so the metal arrives along line A. The tall resist walls of line B block it, so metal only reaches the floor of line A." },
            { t: "Oxidise", text: "Let in oxygen to grow the AlOₓ barrier on the first layer." },
            { t: "Second evaporation: along line B", text: "Rotate the wafer 90°. Now metal only reaches the floor of line B. Where B crosses A, it lands on the oxidised first layer: a small square junction." },
            { t: "Lift off and add a 'bandage'", text: "Lift off the resist. A final 'bandage' layer, deposited after ion-milling away the oxide, connects the junction leads to the rest of the circuit. No fragile bridge is needed, so results are more reproducible." }
        ],
        rewardKey: "qc-manhattan",
        rewardMsg: "You built a Manhattan junction",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = sR(30, 20, 280, 160, "rgba(255,159,106,.35)", "rgba(255,159,106,.8)", 4);

            s += sR(30, 92, 280, 16, "rgba(6,10,24,.9)") + sR(162, 20, 16, 160, "rgba(6,10,24,.9)");
            s += sT(50, 88, "line A", 9, "#78b4ff", "start") + sT(184, 32, "line B", 9, "#ffd666", "start");

            if (step >= 1) { s += sR(30, 92, 280 * (step === 1 ? ease(k) : 1), 16, "rgba(120,180,255,.75)"); }
            if (step === 1) { s += sP("M20 70 L60 92", "#78b4ff", 2) + sT(20, 64, "metal arrives", 8, "#78b4ff", "start"); }

            if (step >= 2) { s += sR(162, 92, 16, 16, "rgba(190,150,255," + (step === 2 ? 0.3 + 0.6 * ease(k) : 0.9) + ")"); }
            if (step === 2) { for (let i = 0; i < 6; i++) { s += sC(80 + i * 35, 70 + Math.sin(st.anim * 2 + i) * 6, 3, "#ff6978"); } s += sT(170, 60, "O₂", 10, "#ff6978"); }

            if (step >= 3) {

                const h = 160 * (step === 3 ? ease(k) : 1);

                s += sR(162, 20, 16, h, "rgba(255,214,102,.7)");
                s += sR(158, 88, 24, 24, "none", "#be96ff");
            }

            if (step === 4) {

                s = sR(30, 20, 280, 160, "rgba(6,10,24,.2)");
                s += sR(30, 92, 280, 16, "rgba(120,180,255,.75)") + sR(162, 20, 16, 160, "rgba(255,214,102,.7)") + sR(162, 92, 16, 16, "#be96ff");
                s += sR(30, 80, 40, 40, "rgba(84,224,199,.6)") + sR(150, 20, 40, 30, "rgba(84,224,199,.6)") + sT(50, 136, "bandage", 9, "#54e0c7");
                s += sT(230, 140, "junction", 10, "#be96ff") + sL(200, 134, 178, 110, "#be96ff", 1);
            }

            return s;
        }
    });


    make("qc-jjspread", {
        title: "Try it: why no two junctions are identical",
        w: 680, h: 240,
        aria: "A histogram of qubit frequencies from 300 junctions with random edge roughness. Bigger junctions and smoother edges give a narrower spread.",
        defaults: { w: 200, r: 5 },
        sliders: [["Junction width (square)", "w", 100, 400, 5, function (v) { return v + " nm"; }], ["Edge roughness", "r", 0.5, 10, 0.1, function (v) { return v.toFixed(1) + " nm"; }]],
        stats: [["Resistance spread", "rs"], ["Frequency spread", "fs"]],
        formula: "A junction's resistance depends on its area, so a few nanometres of random edge wobble changes it by a few percent. Because the qubit frequency goes as √E<sub>J</sub>, a 2% spread in resistance gives about a 1% spread in frequency: around 50 MHz at 5 GHz. Larger junctions and smoother resist edges narrow the spread, but even the best fabs see about 1 to 2%. That's why frequency targeting needs its own step (Unit 25).",
        init: function (s, d) { d.seed = 41; },
        read: function (s) {

            const relA = Math.SQRT2 * s.r / s.w;
            const rs = Math.sqrt(relA * relA + 0.01 * 0.01);
            const fs = rs / 2 * 5000;

            return {
                rs: "±" + (rs * 100).toFixed(1) + "%",
                fs: "±" + Math.round(fs) + " MHz",
                verdict: fs <= 30 ? "A tight spread: most qubits land near their targets" : fs <= 60 ? "Typical: trimming will be needed" : "Wide spread: many qubits will collide"
            };
        },
        reward: { when: function (s) { const relA = Math.SQRT2 * s.r / s.w; return Math.sqrt(relA * relA + 1e-4) / 2 * 5000 <= 30; }, msg: "You tightened the junction spread" },
        draw: function (ctx, s, d) {

            const r = mulberry(d.seed);
            const bins = new Array(41).fill(0);

            for (let i = 0; i < 300; i++) {

                const w1 = s.w + gauss(r) * s.r;
                const w2 = s.w + gauss(r) * s.r;
                const A = w1 * w2 / (s.w * s.w) * (1 + 0.01 * gauss(r));
                const f = 5 * Math.sqrt(A);
                const b = Math.round((f - 5) / 0.01) + 20;

                if (b >= 0 && b <= 40) { bins[b]++; }
            }

            const gx = 60, gy = 30, gw = 400, gh = 170;
            const mx = Math.max.apply(null, bins);

            line(ctx, gx, gy + gh, gx + gw, gy + gh, GREY + ".6)", 1);

            bins.forEach(function (n, i) { box(ctx, gx + i * gw / 41 + 1, gy + gh - n / mx * gh, gw / 41 - 2, n / mx * gh, (Math.abs(i - 20) <= 2 ? TEAL : GOLD) + ".75)"); });

            [4.8, 4.9, 5.0, 5.1, 5.2].forEach(function (f) { txt(ctx, f.toFixed(1), gx + (f - 4.8) / 0.4 * gw, gy + gh + 16, 11, GREY + ".85)"); });
            txt(ctx, "qubit frequency (GHz) of 300 junctions", gx + gw / 2, gy + gh + 34, 11, GREY + ".85)");

            // junction top view with rough edges
            const cx = 570, cy = 115;
            const sc = 0.32;

            ctx.fillStyle = PURPLE + ".6)";
            ctx.beginPath();

            for (let i = 0; i <= 80; i++) {

                const side = Math.floor(i / 20) % 4;
                const u = (i % 20) / 20;
                const half = s.w * sc / 2;
                const wob = (Math.sin(i * 7.3) + Math.sin(i * 3.1)) * s.r * sc * 0.8;
                const pts = [[-half + u * 2 * half, -half + wob], [half + wob, -half + u * 2 * half], [half - u * 2 * half, half + wob], [-half + wob, half - u * 2 * half]][side];

                if (i === 0) { ctx.moveTo(cx + pts[0], cy + pts[1]); } else { ctx.lineTo(cx + pts[0], cy + pts[1]); }
            }

            ctx.fill();
            txt(ctx, "junction from above", cx, cy + s.w * sc / 2 + 26, 11, PURPLE + "1)");
        }
    });


    /* ======================================
       UNIT 25: HITTING THE TARGET FREQUENCY
    ====================================== */

    function rnToF(rn, ec) {

        const ic = Math.PI * 0.18e-3 / (2 * rn * 1000);
        const ej = ic / (4 * Math.PI * 1.602e-19) / 1e9;

        return { ic: ic, ej: ej, f: Math.sqrt(8 * ej * ec) - ec };
    }

    make("qc-rn", {
        title: "Try it: predict the frequency with an ohmmeter",
        w: 680, h: 230,
        aria: "A probe station measures a junction's resistance at room temperature, and a chain of formulas turns it into the qubit frequency.",
        defaults: { rn: 12, ec: 0.25 },
        sliders: [["Room-temperature junction resistance", "rn", 4, 20, 0.01, function (v) { return v.toFixed(2) + " kΩ"; }], ["Charging energy (from the pad design)", "ec", 0.2, 0.3, 0.005, function (v) { return Math.round(v * 1000) + " MHz"; }]],
        stats: [["Critical current", "ic"], ["Josephson energy", "ej"], ["Predicted qubit frequency", "f"]],
        formula: "You can't put every chip in a fridge, but you can probe every junction at room temperature. In 1963 Ambegaokar and Baratoff showed that a junction's critical current follows from its normal-state resistance: I<sub>c</sub> = πΔ / (2eR<sub>n</sub>). From I<sub>c</sub> comes E<sub>J</sub>, and with the designed E<sub>C</sub> the transmon formula gives the frequency. (Here Δ = 0.18 meV for aluminium. In practice the resistance rises by roughly 10% on cooling, which fabs fold into their calibration.)",
        read: function (s) {

            const r = rnToF(s.rn, s.ec);

            return {
                ic: (r.ic * 1e9).toFixed(1) + " nA",
                ej: r.ej.toFixed(1) + " GHz",
                f: fmtGHz(r.f),
                verdict: Math.abs(r.f - 5) <= 0.01 ? "Bang on 5.000 GHz" : r.f > 5 ? "Above 5 GHz: needs more resistance" : "Below 5 GHz: needs less resistance"
            };
        },
        reward: { when: function (s) { return Math.abs(rnToF(s.rn, s.ec).f - 5) <= 0.01; }, msg: "You predicted a 5 GHz qubit from a resistance" },
        draw: function (ctx, s) {

            const r = rnToF(s.rn, s.ec);

            box(ctx, 30, 150, 220, 30, SI);
            box(ctx, 60, 140, 60, 10, METAL);
            box(ctx, 160, 140, 60, 10, METAL);
            box(ctx, 120, 142, 40, 6, PURPLE + ".9)");
            line(ctx, 90, 140, 70, 60, GREY + "1)", 2);
            line(ctx, 190, 140, 210, 60, GREY + "1)", 2);
            box(ctx, 80, 30, 120, 34, "rgba(6,10,24,.9)", TEAL + "1)");
            txt(ctx, s.rn.toFixed(2) + " kΩ", 140, 53, 15, TEAL + "1)", "center", true);
            txt(ctx, "probe station, room temperature", 140, 205, 11, GREY + ".9)");

            const steps = [s.rn.toFixed(2) + " kΩ", (r.ic * 1e9).toFixed(1) + " nA", r.ej.toFixed(1) + " GHz", fmtGHz(r.f)];

            steps.forEach(function (st, i) {

                const x = 300 + i * 92;

                box(ctx, x - 38, 90, 76, 46, "rgba(255,255,255,.05)", (i === 3 ? GOLD : BLUE) + ".9)");
                txt(ctx, ["resistance", "current", "Josephson E", "qubit"][i], x, 108, 10, GREY + ".9)");
                txt(ctx, st, x, 126, 12, TEXT + "1)", "center", true);

                if (i < 3) { arrow(ctx, x + 40, 113, x + 52, 113, GREY + ".8)", 1.5); }
            });
        }
    });


    function chipYield(sigma, seed, n) {

        const r = mulberry(seed);
        let good = 0;
        let lastBad = null;

        for (let c = 0; c < n; c++) {

            const f = [];

            for (let i = 0; i < 16; i++) { f.push((((i % 4) + Math.floor(i / 4)) % 2 ? 5.2 : 5.0) + gauss(r) * sigma / 1000); }

            const bad = [];

            for (let i = 0; i < 16; i++) {

                [1, 4].forEach(function (dd) {

                    const j = i + dd;

                    if ((dd === 1 && i % 4 === 3) || j >= 16) { return; }

                    const a = f[i], b = f[j];

                    if (Math.abs(a - b) < 0.02 || Math.abs(a - (b - 0.3)) < 0.02 || Math.abs(b - (a - 0.3)) < 0.02) { bad.push([i, j]); }
                });
            }

            if (!bad.length) { good++; }
            if (c === n - 1) { lastBad = { f: f, bad: bad }; }
        }

        return { y: good / n, last: lastBad };
    }

    make("qc-collide", {
        title: "Try it: frequency collisions",
        w: 680, h: 240,
        aria: "A 4 by 4 grid of qubits with alternating target frequencies. Neighbouring qubits whose frequencies collide are joined by red lines; a bar shows the share of collision-free chips.",
        defaults: { s: 60 },
        sliders: [["Spread in qubit frequency", "s", 5, 150, 1, function (v) { return "±" + v + " MHz"; }]],
        actions: [["new", "🎲 Make another chip"]],
        stats: [["Collision-free chips (of 200)", "y"], ["Collisions on this chip", "c"]],
        formula: "Fixed-frequency qubits are coupled to their neighbours and driven with microwaves at their own frequencies. If two neighbours land within about 20 MHz of each other, or one's 0→1 frequency matches the other's 1→2 frequency, gates on one disturb the other: a <b>collision</b>. Targets alternate between 5.0 and 5.2 GHz here, with an anharmonicity of −300 MHz. With a fabrication spread of 1 to 2%, a large chip almost always has some collisions.",
        init: function (s, d) { d.seed = 3; },
        act: function (id, s, d) { d.seed++; },
        read: function (s, d) {

            const y = chipYield(s.s, 100, 200).y;
            const one = chipYield(s.s, d.seed, 1).last;

            return {
                y: Math.round(y * 100) + "%",
                c: String(one.bad.length),
                verdict: y >= 0.9 ? "Most chips work: the spread is small enough" : y >= 0.5 ? "Many chips have collisions" : "Almost every chip collides: the spread must shrink"
            };
        },
        reward: { when: function (s) { return chipYield(s.s, 100, 200).y >= 0.9; }, msg: "You found the spread a 16-qubit chip can tolerate" },
        draw: function (ctx, s, d) {

            const one = chipYield(s.s, d.seed, 1).last;
            const P = function (i) { return [80 + (i % 4) * 90, 40 + Math.floor(i / 4) * 55]; };

            for (let i = 0; i < 16; i++) {

                [1, 4].forEach(function (dd) {

                    const j = i + dd;

                    if ((dd === 1 && i % 4 === 3) || j >= 16) { return; }

                    const bad = one.bad.some(function (b) { return b[0] === i && b[1] === j; });

                    line(ctx, P(i)[0], P(i)[1], P(j)[0], P(j)[1], bad ? ROSE + "1)" : GREY + ".4)", bad ? 4 : 1.5);
                });
            }

            for (let i = 0; i < 16; i++) {

                const hi = ((i % 4) + Math.floor(i / 4)) % 2;

                dot(ctx, P(i)[0], P(i)[1], 18, (hi ? GOLD : TEAL) + ".85)");
                txt(ctx, one.f[i].toFixed(2), P(i)[0], P(i)[1] + 4, 10, "#1a2033", "center", true);
            }

            const y = chipYield(s.s, 100, 200).y;

            box(ctx, 470, 40, 40, 170, "rgba(255,255,255,.04)", GREY + ".5)");
            box(ctx, 470, 40 + 170 * (1 - y), 40, 170 * y, (y >= 0.9 ? TEAL : y >= 0.5 ? GOLD : ROSE) + ".8)");
            txt(ctx, "chips with", 580, 110, 11, GREY + ".9)");
            txt(ctx, "no collisions", 580, 126, 11, GREY + ".9)");
            txt(ctx, Math.round(y * 100) + "%", 580, 156, 22, TEXT + "1)", "center", true);
        }
    });


    SIMS["qc-anneal"] = stepper({
        title: "Explore: trimming qubits with a laser",
        viewBox: "0 0 340 190",
        aria: "A laser spot heats one junction on a chip; its resistance rises and its qubit frequency falls until it reaches the target.",
        interval: 6.5,
        steps: [
            { t: "Measure every junction", text: "At room temperature, probe each junction's resistance and predict each qubit's frequency (the previous slide). Designs aim slightly high, because trimming only moves frequencies down." },
            { t: "Heat one junction with a laser", text: "A focused laser warms a single junction for a few seconds. The thin oxide barrier rearranges and its resistance rises, so the qubit's frequency falls." },
            { t: "Measure again", text: "Re-measure, compare with the target, and repeat with smaller doses until the junction is on target." },
            { t: "A tuned chip", text: "IBM reported this laser annealing technique (2021) tightening frequency spreads to well under 1%, enough to make large chips of fixed-frequency qubits with few collisions." }
        ],
        rewardKey: "qc-anneal",
        rewardMsg: "You learned how qubits are laser-trimmed",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = sR(30, 40, 180, 130, "rgba(74,82,102,.6)", "#7a8199", 4);
            const freqs = [5.08, 5.04, 5.11, 5.06];
            const targets = 5.0;

            freqs.forEach(function (f0, i) {

                const x = 70 + (i % 2) * 100;
                const y = 75 + Math.floor(i / 2) * 60;
                let f = f0;

                if (step >= 1 && i === 0) { f = f0 - (step === 1 ? 0.05 * ease(k) : 0.05); }
                if (step === 3) { f = 5.0 + (i === 0 ? 0.03 : 0) * 0 + 0.002 * i; }

                const on = Math.abs(f - targets) < 0.01;

                s += sC(x, y, 16, on ? "rgba(84,224,199,.6)" : "rgba(255,214,102,.5)", on ? "#54e0c7" : "#ffd666");
                s += sT(x, y + 4, f.toFixed(2), 8, "#f5f7ff");
            });

            if (step === 1) {

                s += sP("M70 0 L70 59", "#ff6978", 3) + sC(70, 75, 6 + 2 * Math.sin(st.anim * 8), "rgba(255,105,120,.5)") + sT(110, 20, "laser spot", 9, "#ff6978", "start");
            }

            if (step === 0 || step === 2) { s += sL(70, 10, 70, 59, "#aab3cf", 1.5) + sT(80, 20, "probe", 9, "#aab3cf", "start"); }

            s += sT(275, 60, "target", 9, "#aab3cf") + sT(275, 76, "5.00 GHz", 12, "#54e0c7");
            s += sT(275, 120, step === 3 ? "all on target ✓" : "gold: still high", 9, step === 3 ? "#54e0c7" : "#ffd666");

            return s;
        }
    });


    make("qc-trim", {
        title: "Game: trim the chip",
        w: 680, h: 220,
        aria: "Six qubits with measured frequencies above their targets. Each laser shot lowers one qubit's frequency by a random 6 to 12 MHz.",
        defaults: {},
        actions: [["q0", "🔦 Q1"], ["q1", "🔦 Q2"], ["q2", "🔦 Q3"], ["q3", "🔦 Q4"], ["q4", "🔦 Q5"], ["q5", "🔦 Q6"], ["new", "🎲 New chip"]],
        stats: [["On target (±8 MHz)", "on"], ["Ruined (too low)", "bad"], ["Laser shots", "n"]],
        formula: "Bring every qubit within ±8 MHz of its target: 5.00 GHz for Q1, Q3 and Q5, and 5.15 GHz for Q2, Q4 and Q6. Each laser shot lowers a qubit's frequency by a random 6 to 12 MHz. Annealing only goes one way, so if a qubit falls more than 8 MHz below its target, it's ruined. Stop as soon as a qubit is inside its window.",
        init: function (s, d) {

            d.r = mulberry(Math.floor(Math.random() * 1e5));
            d.f = [];

            for (let i = 0; i < 6; i++) { d.f.push((i % 2 ? 5150 : 5000) + 10 + d.r() * 50); }

            d.n = 0;
            d.flash = -1;
        },
        act: function (id, s, d) {

            if (id === "new") { trimReset(d); return; }

            const i = parseInt(id.slice(1), 10);

            d.f[i] -= 6 + d.r() * 6;
            d.n++;
            d.flash = i;
        },
        read: function (s, d) {

            const tgt = function (i) { return i % 2 ? 5150 : 5000; };
            const on = d.f.filter(function (f, i) { return Math.abs(f - tgt(i)) <= 8; }).length;
            const bad = d.f.filter(function (f, i) { return f < tgt(i) - 8; }).length;

            d.won = on === 6;

            return {
                on: on + " of 6",
                bad: String(bad),
                n: String(d.n),
                verdict: on === 6 ? "Every qubit on target in " + d.n + " shots!" : bad ? "A qubit went too low: try a new chip" : "Fire the laser at the qubits that are still high"
            };
        },
        reward: { when: function (s, d) { return d.won; }, msg: "You trimmed a whole chip onto target" },
        draw: function (ctx, s, d) {

            d.f.forEach(function (f, i) {

                const x = 70 + i * 100;
                const tgt = i % 2 ? 5150 : 5000;
                const Y = function (v) { return 180 - (v - tgt + 20) / 90 * 150; };
                const on = Math.abs(f - tgt) <= 8;
                const bad = f < tgt - 8;

                box(ctx, x - 20, Y(tgt + 8), 40, Y(tgt - 8) - Y(tgt + 8), "rgba(84,224,199,.18)");
                line(ctx, x - 24, Y(tgt), x + 24, Y(tgt), TEAL + "1)", 1.5);
                line(ctx, x, 30, x, 180, GREY + ".3)", 1);
                dot(ctx, x, clamp(Y(f), 24, 196), 9, (bad ? ROSE : on ? TEAL : GOLD) + "1)");

                if (d.flash === i) { dot(ctx, x, clamp(Y(f), 24, 196), 15, ROSE + ".3)"); }

                txt(ctx, "Q" + (i + 1), x, 212, 12, TEXT + ".9)", "center", true);
                txt(ctx, (f / 1000).toFixed(3), x + 14, clamp(Y(f), 24, 196) + 4, 10, TEXT + ".85)", "left");
            });

            txt(ctx, "teal band = target window", 340, 16, 11, TEAL + "1)");
        }
    });

    function trimReset(d) {

        d.f = [];

        for (let i = 0; i < 6; i++) { d.f.push((i % 2 ? 5150 : 5000) + 10 + d.r() * 50); }

        d.n = 0;
        d.flash = -1;
    }


    SIMS["qc-fixtune"] = quiz(
        "Game: fixed or tunable?",
        ["Fixed-frequency qubit", "Flux-tunable qubit"],
        [
            { q: "Needs no flux line, so it has one fewer wire and is immune to flux noise.", a: "Fixed-frequency qubit", why: "With a single junction, magnetic flux doesn't change its frequency." },
            { q: "Can dodge a frequency collision after the chip is made.", a: "Flux-tunable qubit", why: "A current in its flux line moves its frequency." },
            { q: "Must be trimmed precisely during fabrication.", a: "Fixed-frequency qubit", why: "Its frequency is frozen once the junction is made." },
            { q: "Uses a SQUID loop of two junctions.", a: "Flux-tunable qubit", why: "The SQUID's effective Josephson energy depends on the flux through the loop." },
            { q: "Is most sensitive to magnetic flux noise away from its sweet spot.", a: "Flux-tunable qubit", why: "Its frequency depends on flux, so flux noise causes dephasing." },
            { q: "IBM's processors use this kind, with microwave-only 'cross-resonance' gates.", a: "Fixed-frequency qubit", why: "IBM chose fixed-frequency transmons and laser trimming." },
            { q: "Google's processors use this kind, with tunable couplers between them.", a: "Flux-tunable qubit", why: "Google's chips tune qubits and couplers with flux pulses." }
        ],
        5,
        "qc-fixtune-done",
        "You know both design philosophies",
        "Fixed qubits are simpler and quieter; tunable ones are more flexible.",
        "Fixed means one junction and no flux line; tunable means a SQUID and a flux line. Hit Reset to try again."
    );


    /* ======================================
       UNIT 26: AIRBRIDGES AND CROSSOVERS
    ====================================== */

    SIMS["qc-slotline"] = stepper({
        title: "Explore: why chips need bridges",
        viewBox: "0 0 340 190",
        aria: "Top view of a coplanar waveguide splitting the ground plane in two. Without bridges the two halves can carry different voltages; airbridges tie them together.",
        interval: 6.5,
        steps: [
            { t: "Lines cut the ground in two", text: "A coplanar line runs between two ground planes. Over a long, winding path, the two halves are only joined far away, at the chip edge." },
            { t: "An unwanted mode", text: "The two ground halves can carry opposite voltages: a 'slotline' mode. Isolated ground islands can also ring like stray resonators. Both steal energy and cause crosstalk." },
            { t: "Airbridges tie the grounds together", text: "Small metal arches spanning the line connect the two ground planes every few hundred micrometres. The unwanted modes are shorted out." },
            { t: "Crossovers", text: "The same arches let a signal line hop over another one, for example a drive line crossing the readout feedline, without touching it." }
        ],
        rewardKey: "qc-slotline",
        rewardMsg: "You learned why airbridges are needed",
        draw: function (step, st) {

            const ph = Math.sin(st.anim * 2);
            let s = "";
            const gA = step === 1 ? "rgba(255,105,120," + (0.25 + 0.25 * ph) + ")" : "rgba(170,179,207,.35)";
            const gB = step === 1 ? "rgba(120,180,255," + (0.25 - 0.25 * ph) + ")" : "rgba(170,179,207,.35)";

            s += sR(20, 20, 300, 72, gA) + sR(20, 108, 300, 72, gB);
            s += sR(20, 98, 300, 4, "#ffd666") + sT(300, 96, "signal", 8, "#ffd666", "end");

            if (step === 1) { s += sT(170, 60, "+", 16, "#ff6978") + sT(170, 150, "−", 16, "#78b4ff") + sT(170, 40, "slotline mode", 9, "#f5f7ff"); }

            if (step >= 2) {

                for (let i = 0; i < 5; i++) {

                    const x = 50 + i * 60;

                    s += sR(x - 5, 86, 10, 28, "rgba(84,224,199,.85)", "#54e0c7", 2);
                }

                s += sT(170, 76, "airbridges", 9, "#54e0c7");
            }

            if (step === 3) {

                s += sR(240, 20, 6, 160, "#ff9f6a") + sT(250, 34, "drive line", 8, "#ff9f6a", "start");
                s += sR(232, 88, 22, 24, "rgba(255,159,106,.6)", "#ff9f6a", 3) + sT(270, 128, "crossover", 8, "#ff9f6a", "start");
            }

            return s;
        }
    });


    SIMS["qc-airbridge"] = stepper({
        title: "Explore: building an airbridge",
        viewBox: "0 0 340 190",
        aria: "Side views: a resist block is patterned, reflowed into a rounded hump, coated with aluminium, the aluminium is patterned, and the resist is dissolved to leave a free-standing arch.",
        interval: 6.5,
        steps: [
            { t: "Pattern a resist block", text: "Lithography leaves a block of resist, a few micrometres tall, over the line the bridge must span." },
            { t: "Reflow it into a hump", text: "Baking the resist above its softening point makes it slump into a smooth, rounded hump: the scaffold for the arch." },
            { t: "Coat with aluminium", text: "Aluminium is deposited over everything (after a brief ion clean so it connects well to the ground planes)." },
            { t: "Pattern the bridge", text: "A second lithography and etch step cuts the aluminium into narrow strips, one per bridge." },
            { t: "Dissolve the scaffold", text: "Solvent removes the resist underneath. A free-standing arch remains, typically 20 to 40 µm long and a few µm high." }
        ],
        rewardKey: "qc-airbridge",
        rewardMsg: "You built an airbridge",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = sR(30, 150, 280, 25, SI) + sR(30, 144, 90, 6, METAL) + sR(220, 144, 90, 6, METAL) + sR(160, 144, 20, 6, "#ffd666");

            s += sT(75, 140, "ground", 8, "#aab3cf") + sT(265, 140, "ground", 8, "#aab3cf") + sT(170, 184, "signal line underneath", 8, "#ffd666");

            const round = step === 0 ? 0 : step === 1 ? ease(k) : 1;
            const hump = function (x) { const u = (x - 110) / 120; return 144 - 40 * (round * Math.sin(Math.PI * clamp(u, 0, 1)) + (1 - round) * (u >= 0 && u <= 1 ? 1 : 0)); };

            if (step <= 3 || (step === 4 && k < 0.8)) {

                const fade = step === 4 ? 1 - k / 0.8 : 1;
                let d = "M110 144";

                for (let x = 110; x <= 230; x += 4) { d += " L" + x + " " + hump(x); }

                d += " L230 144 Z";
                s += sP(d, "none", 0, "rgba(255,159,106," + 0.6 * fade + ")");
            }

            if (step >= 2) {

                let d = "M95 144 L110 144";

                for (let x = 110; x <= 230; x += 4) { d += " L" + x + " " + (hump(x) - 2); }

                d += " L245 144";

                const width = step === 2 ? ease(k) : 1;

                s += sP(d, "rgba(201,211,230," + width + ")", 4);

                if (step === 2) { s += sP("M30 140 L310 140", "rgba(201,211,230," + (0.5 * width) + ")", 2); }
            }

            if (step >= 3) { s += sT(170, 80, step === 4 ? "free-standing arch" : "bridge strip patterned", 9, "#54e0c7"); }

            return s;
        }
    });


    make("qc-crosstalk", {
        title: "Try it: keep signals in their own lines",
        w: 680, h: 230,
        aria: "Two parallel signal lines on a chip. Field from one leaks into the other; more spacing and a grounded shield strip with airbridges reduce the leakage.",
        defaults: { d: 100, sh: "none" },
        segs: [["Between the lines", "sh", [["none", "Nothing"], ["gnd", "Ground strip + airbridges"]]]],
        sliders: [["Spacing between the lines", "d", 20, 500, 5, function (v) { return v + " µm"; }]],
        stats: [["Crosstalk", "x"]],
        animated: true,
        formula: "A drive pulse meant for one qubit can leak into a neighbouring line and nudge the wrong qubit: <b>crosstalk</b>. Leakage falls with distance, but chip area is precious. A grounded strip between the lines, stitched to the ground planes with airbridges, soaks up the stray field. Designers aim for crosstalk below about −50 dB (a hundred-thousandth of the power). The numbers here are illustrative.",
        read: function (s) {

            const k = 0.3 / (1 + Math.pow(s.d / 40, 2)) * (s.sh === "gnd" ? 0.05 : 1);
            const db = 20 * Math.log10(k);

            return {
                x: Math.round(db) + " dB",
                verdict: db <= -50 ? "Well isolated: below −50 dB" : db <= -35 ? "Noticeable leakage" : "Strong crosstalk: the neighbour feels every pulse"
            };
        },
        reward: { when: function (s) { const k = 0.3 / (1 + Math.pow(s.d / 40, 2)) * (s.sh === "gnd" ? 0.05 : 1); return 20 * Math.log10(k) <= -50 && s.d <= 200; }, msg: "You isolated two lines in a small space" },
        draw: function (ctx, s, d, time) {

            const gapPx = 30 + s.d / 500 * 140;
            const y1 = 100 - gapPx / 2;
            const y2 = 100 + gapPx / 2;
            const k = 0.3 / (1 + Math.pow(s.d / 40, 2)) * (s.sh === "gnd" ? 0.05 : 1);

            line(ctx, 40, y1, 640, y1, GOLD + "1)", 5);
            line(ctx, 40, y2, 640, y2, BLUE + "1)", 5);
            txt(ctx, "drive line for qubit A", 40, y1 - 12, 11, GOLD + "1)", "left");
            txt(ctx, "line to qubit B", 40, y2 + 22, 11, BLUE + "1)", "left");

            if (s.sh === "gnd") {

                line(ctx, 40, 100, 640, 100, GREY + ".9)", 3);

                for (let x = 80; x < 640; x += 80) { line(ctx, x, y1 - 14, x, y2 + 14, TEAL + ".8)", 2); }
            }

            const p = (time * 80) % 600;

            for (let i = 0; i < 5; i++) {

                const x = 40 + (p + i * 120) % 600;

                dot(ctx, x, y1, 6, GOLD + "1)");
                dot(ctx, x, y2, 6 * Math.min(1, Math.sqrt(k) * 3), ROSE + Math.min(1, Math.sqrt(k) * 4) + ")");
            }

            txt(ctx, "red: leaked signal", 640, 210, 11, ROSE + "1)", "right");
        }
    });


    make("qc-bridgespan", {
        title: "Try it: how long can a bridge be?",
        w: 680, h: 230,
        aria: "A side view of an aluminium airbridge. Longer spans and thinner metal sag more; if the sag reaches the line underneath, the bridge shorts.",
        defaults: { L: 30, t: 300 },
        sliders: [["Span", "L", 10, 80, 1, function (v) { return v + " µm"; }], ["Aluminium thickness", "t", 100, 600, 10, function (v) { return v + " nm"; }]],
        stats: [["Sag at the middle", "sg"], ["Clearance left", "cl"]],
        formula: "A bridge must clear the line beneath it (here a 3 µm high arch) and survive the solvent drying that tends to pull it down. Sag grows steeply with span (roughly as span⁴) and shrinks with thicker metal. Longer bridges are tempting, to cross wide lines, but they may collapse onto the signal line and short it. The mechanics here are illustrative.",
        read: function (s) {

            const sag = 0.6 * Math.pow(s.L / 30, 4) * Math.pow(300 / s.t, 2);
            const cl = 3 - sag;

            return {
                sg: sag.toFixed(2) + " µm",
                cl: cl > 0 ? cl.toFixed(2) + " µm" : "none",
                verdict: cl <= 0 ? "Collapsed: the bridge touches the line and shorts it" : cl < 1 ? "Risky: barely clears the line" : "Sturdy: plenty of clearance"
            };
        },
        reward: { when: function (s) { const sag = 0.6 * Math.pow(s.L / 30, 4) * Math.pow(300 / s.t, 2); return s.L >= 40 && 3 - sag >= 1; }, msg: "You designed a long, sturdy bridge" },
        draw: function (ctx, s) {

            const sag = 0.6 * Math.pow(s.L / 30, 4) * Math.pow(300 / s.t, 2);
            const cx = 340;
            const half = s.L * 3.5;
            const base = 170;
            const h = 3 * 25;
            const mid = Math.min(h, sag * 25);

            box(ctx, 40, base, 600, 30, SI);
            box(ctx, cx - 30, base - 8, 60, 8, GOLD + "1)");
            box(ctx, 40, base - 8, cx - half - 50, 8, METAL);
            box(ctx, cx + half + 10, base - 8, 640 - cx - half - 10, 8, METAL);

            ctx.strokeStyle = mid >= h ? ROSE + "1)" : TEAL + "1)";
            ctx.lineWidth = 2 + s.t / 150;
            ctx.beginPath();
            ctx.moveTo(cx - half - 10, base - 8);

            for (let i = 0; i <= 60; i++) {

                const u = i / 60;
                const x = cx - half + u * 2 * half;
                const arch = Math.sin(Math.PI * u) * h;
                const droop = Math.sin(Math.PI * u) * mid;

                ctx.lineTo(x, base - 8 - arch + droop);
            }

            ctx.lineTo(cx + half + 10, base - 8);
            ctx.stroke();

            txt(ctx, s.L + " µm span", cx, 40, 13, TEXT + "1)", "center", true);
            txt(ctx, "signal line", cx, base + 20, 11, "#1a2033", "center", true);
        }
    });


    SIMS["qc-bridgequiz"] = quiz(
        "Game: bridge or no bridge?",
        ["Needs airbridges", "No bridge needed"],
        [
            { q: "A long readout resonator meanders across the chip, splitting the ground plane.", a: "Needs airbridges", why: "Bridges stitch the ground planes together along it." },
            { q: "A flux line must cross the readout feedline.", a: "Needs airbridges", why: "A crossover lets one line hop over the other." },
            { q: "A patch of ground plane is completely surrounded by lines.", a: "Needs airbridges", why: "An isolated island would float and ring; bridges ground it." },
            { q: "The tiny Josephson junction in the middle of a qubit.", a: "No bridge needed", why: "The junction is a separate overlap structure, not a crossing." },
            { q: "A bond pad at the edge of the chip.", a: "No bridge needed", why: "Pads connect to wire bonds, not across lines." },
            { q: "A short coupler between two neighbouring qubits, with continuous ground around it.", a: "No bridge needed", why: "If the ground is continuous, no stitching is needed." }
        ],
        5,
        "qc-bridgequiz-done",
        "You know where bridges go",
        "Bridges stitch grounds together and let lines cross.",
        "Split grounds, islands and crossings need bridges. Hit Reset to try again."
    );


    /* ======================================
       UNIT 27: 3D INTEGRATION
    ====================================== */

    make("qc-fanout", {
        title: "Try it: running out of edge",
        w: 680, h: 240,
        aria: "A square chip with a grid of qubits and bond pads around its edge. As the grid grows, the pads needed exceed the pads that fit around the edge.",
        defaults: { n: 6, l: 2.5 },
        sliders: [["Qubits per side", "n", 2, 30, 1, function (v) { return v + " (" + v * v + " qubits)"; }], ["Lines per qubit", "l", 1, 4, 0.5, function (v) { return v; }]],
        stats: [["Lines needed", "need"], ["Pads that fit on the edge", "fit"]],
        formula: "Each qubit needs a drive line, often a flux line, and a share of a readout line. Qubits fill the chip's <b>area</b>, which grows as n², but wire bonds can only land on its <b>edge</b>, which grows as n. Past a few dozen qubits there isn't enough edge, and lines in the middle can't get out without crossing others. The answer is to go vertical: bring signals in from above or below (next slides). Here qubits are 1 mm apart and pads 250 µm apart.",
        read: function (s) {

            const need = Math.ceil(s.n * s.n * s.l);
            const fit = 4 * Math.floor((s.n + 1) / 0.25);

            return {
                need: String(need),
                fit: String(fit),
                verdict: need <= fit ? "Enough edge for every line" : "Out of edge: you need to bring wires in vertically"
            };
        },
        reward: { when: function (s) { return Math.ceil(s.n * s.n * s.l) > 4 * Math.floor((s.n + 1) / 0.25); }, msg: "You found where wire bonding runs out" },
        draw: function (ctx, s) {

            const need = Math.ceil(s.n * s.n * s.l);
            const fit = 4 * Math.floor((s.n + 1) / 0.25);
            const size = 190;
            const x0 = 60, y0 = 25;
            const cell = size / (s.n + 1);

            box(ctx, x0, y0, size, size, "rgba(74,82,102,.8)", GREY + ".7)");

            for (let i = 0; i < s.n; i++) {

                for (let j = 0; j < s.n; j++) {

                    const cx = x0 + (i + 1) * cell;
                    const cy = y0 + (j + 1) * cell;

                    dot(ctx, cx, cy, Math.max(1.2, cell * 0.25), TEAL + ".9)");
                }
            }

            const perSide = Math.min(60, fit / 4);

            for (let k = 0; k < perSide; k++) {

                const u = (k + 0.5) / perSide * size;

                [[x0 + u, y0 - 4], [x0 + u, y0 + size + 4], [x0 - 4, y0 + u], [x0 + size + 4, y0 + u]].forEach(function (p) { box(ctx, p[0] - 1.5, p[1] - 1.5, 3, 3, GOLD + ".9)"); });
            }

            const gx = 340;
            const mx = Math.max(need, fit) * 1.1;

            box(ctx, gx, 200 - need / mx * 160, 80, need / mx * 160, (need > fit ? ROSE : TEAL) + ".75)");
            box(ctx, gx + 120, 200 - fit / mx * 160, 80, fit / mx * 160, GOLD + ".75)");
            txt(ctx, "lines needed", gx + 40, 220, 11, TEXT + ".9)");
            txt(ctx, "edge pads", gx + 160, 220, 11, TEXT + ".9)");
            txt(ctx, String(need), gx + 40, 194 - need / mx * 160, 12, TEXT + "1)", "center", true);
            txt(ctx, String(fit), gx + 160, 194 - fit / mx * 160, 12, TEXT + "1)", "center", true);
        }
    });


    SIMS["qc-bump"] = stepper({
        title: "Explore: bump bonding two chips together",
        viewBox: "0 0 340 190",
        aria: "Side views: indium bumps grown on the pads of two chips, the top chip flipped and aligned, then pressed together so the bumps cold-weld.",
        interval: 6.5,
        steps: [
            { t: "Barrier layer on the pads", text: "A thin under-bump layer (for example TiN) goes on the pads of both chips. It stops the indium from mixing into the aluminium wiring." },
            { t: "Grow indium bumps", text: "Indium is evaporated through a liftoff mask, leaving soft bumps a few micrometres tall on each pad." },
            { t: "Flip and align", text: "The qubit chip is turned upside down and aligned over the wiring chip to within about a micrometre in a flip-chip bonder." },
            { t: "Press together", text: "Pressing the chips together at or near room temperature cold-welds the soft indium bumps. The bump height sets the gap between the chips, often several micrometres." },
            { t: "Superconducting joints", text: "Indium superconducts below 3.4 K, so the bonds carry signals and ground with zero resistance. The qubits stay on their own clean chip, while the wiring lives on the other." }
        ],
        rewardKey: "qc-bump",
        rewardMsg: "You bump-bonded two chips",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = sR(40, 140, 260, 26, SI) + sT(170, 158, "wiring chip", 9, "#aab3cf");
            const pads = [80, 140, 200, 260];
            const bump = step >= 1 ? (step === 1 ? ease(k) : 1) : 0;

            pads.forEach(function (x) {

                s += sR(x - 10, 134, 20, 6, METAL);

                if (step >= 0) { s += sR(x - 8, 131, 16, 3, step === 0 ? "rgba(214,184,90," + ease(k) + ")" : "#d6b85a"); }
                if (bump > 0) { s += sR(x - 6, 131 - 14 * bump, 12, 14 * bump, "rgba(200,200,220,.9)", null, 3); }
            });

            if (step >= 2) {

                const yTop = step === 2 ? 20 + ease(k) * 45 : step === 3 ? 65 + ease(k) * 26 : 91;
                const squash = step >= 3 ? (step === 3 ? ease(k) : 1) : 0;

                s += sR(40, yTop, 260, 22, SI) + sT(170, yTop + 15, "qubit chip (upside down)", 9, "#aab3cf");

                pads.forEach(function (x) {

                    s += sR(x - 10, yTop + 22, 20, 5, METAL);
                    s += sR(x - 6 - squash * 3, yTop + 27, 12 + squash * 6, 12 - squash * 4, "rgba(200,200,220,.9)", null, 3);
                });

                if (step === 2) { s += sT(320, 50, "↓", 16, "#54e0c7", "end"); }
            }

            if (step === 4) { s += sT(170, 60, "indium: superconducting below 3.4 K", 9, "#54e0c7"); }

            return s;
        }
    });


    SIMS["qc-tsv"] = stepper({
        title: "Explore: through-silicon vias",
        viewBox: "0 0 340 190",
        aria: "Cross-sections: deep holes etched through a silicon wafer, their walls coated with superconductor, connecting the top and bottom surfaces.",
        interval: 6.5,
        steps: [
            { t: "Etch deep holes", text: "The Bosch process alternates a short fluorine plasma etch with a protective coating step, drilling narrow holes hundreds of micrometres deep with straight walls." },
            { t: "Coat the walls", text: "A superconductor such as TiN is grown on the hole walls (atomic layer deposition can coat deep holes evenly), forming a superconducting tube from top to bottom." },
            { t: "Signals go vertical", text: "Now lines can run straight down through the chip to a wiring layer or package underneath, instead of crowding to the edges." },
            { t: "Fences of vias", text: "Rows of grounded vias also tie the top and bottom ground planes together, so the chip can't ring with unwanted 'box modes' (next slide)." }
        ],
        rewardKey: "qc-tsv",
        rewardMsg: "You learned how through-silicon vias are made",
        draw: function (step, st) {

            const k = prog(st, 6.5);
            let s = sR(40, 40, 260, 110, SI) + sT(40, 34, "silicon wafer", 9, "#aab3cf", "start");
            const holes = [90, 170, 250];

            holes.forEach(function (x) {

                const depth = step === 0 ? 110 * ease(k) : 110;

                s += sR(x - 9, 40, 18, depth, "rgba(6,10,24,1)");

                if (step === 0) { for (let i = 0; i < depth / 8; i++) { s += sL(x - 9, 40 + i * 8, x - 7, 44 + i * 8, "#78b4ff", 1); } }

                if (step >= 1) {

                    const c = step === 1 ? ease(k) : 1;

                    s += sR(x - 9, 40, 3, 110 * c, "#d6b85a") + sR(x + 6, 40, 3, 110 * c, "#d6b85a");
                }
            });

            if (step >= 1) { s += sR(40, 34, 260, 6, METAL) + sR(40, 150, 260, 6, METAL); }

            if (step === 2) {

                const y = 34 + ((st.anim * 40) % 122);

                s += sC(170, y, 4, "#ffd666") + sT(220, 100, "signal", 9, "#ffd666", "start");
            }

            if (step === 3) { s += sT(170, 176, "top and bottom grounds tied together", 9, "#54e0c7"); }

            return s;
        }
    });


    make("qc-boxmode", {
        title: "Try it: when the chip itself becomes a resonator",
        w: 680, h: 240,
        aria: "A chip seen from above, glowing with the pattern of its lowest box mode. Bigger chips have lower mode frequencies; rows of vias push them back up.",
        defaults: { a: 10, v: "none" },
        segs: [["Grounding", "v", [["none", "Edges only"], ["via", "Via fences every 2 mm"]]]],
        sliders: [["Chip size", "a", 3, 30, 0.5, function (v) { return v + " × " + v + " mm"; }]],
        stats: [["Lowest box mode", "f"], ["Qubit band", "q"]],
        animated: true,
        formula: "A chip in a metal enclosure is itself a cavity. Its lowest mode sits at roughly f = c / (2√ε) × √(1/a² + 1/b²), so bigger chips ring at lower frequencies. Once that mode falls near the qubits (4 to 8 GHz), it couples to them and steals energy. Rows of grounded vias and bump bonds split the chip into small cells, pushing the modes far above the qubit band. (Here ε ≈ 4, an illustrative mix of silicon and vacuum.)",
        read: function (s) {

            const a = s.v === "via" ? Math.min(s.a, 2) : s.a;
            const f = 3e8 / (2 * 2) * Math.sqrt(2) / (a * 1e-3) / 1e9;

            return {
                f: f.toFixed(1) + " GHz",
                q: "4 – 8 GHz",
                verdict: f > 10 ? "Safely above the qubits" : f > 8 ? "Close above the qubit band: marginal" : "Inside the qubit band: the chip will steal qubit energy"
            };
        },
        reward: { when: function (s) { return s.a >= 20 && s.v === "via"; }, msg: "You tamed the box modes of a big chip" },
        draw: function (ctx, s, d, time) {

            const size = 180;
            const x0 = 60, y0 = 30;
            const cells = s.v === "via" ? Math.max(1, Math.round(s.a / 2)) : 1;
            const cs = size / cells;
            const a = s.v === "via" ? Math.min(s.a, 2) : s.a;
            const f = 3e8 / 4 * Math.sqrt(2) / (a * 1e-3) / 1e9;
            const inBand = f <= 8;
            const ph = Math.cos(time * Math.PI * 2 / 6);

            for (let i = 0; i < cells; i++) {

                for (let j = 0; j < cells; j++) {

                    for (let u = 0; u < 6; u++) {

                        for (let v = 0; v < 6; v++) {

                            const amp = Math.sin(Math.PI * (u + 0.5) / 6) * Math.sin(Math.PI * (v + 0.5) / 6) * ph;
                            const strength = inBand ? 0.7 : 0.25;

                            box(ctx, x0 + i * cs + u * cs / 6, y0 + j * cs + v * cs / 6, cs / 6 + 0.5, cs / 6 + 0.5, amp >= 0 ? "rgba(255,105,120," + amp * strength + ")" : "rgba(120,180,255," + (-amp) * strength + ")");
                        }
                    }
                }
            }

            ctx.strokeStyle = GREY + ".8)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x0, y0, size, size);

            if (s.v === "via") {

                for (let i = 1; i < cells; i++) {

                    for (let k = 0; k < 24; k++) {

                        dot(ctx, x0 + i * cs, y0 + (k + 0.5) * size / 24, 1.6, GOLD + "1)");
                        dot(ctx, x0 + (k + 0.5) * size / 24, y0 + i * cs, 1.6, GOLD + "1)");
                    }
                }
            }

            txt(ctx, s.a + " mm chip", x0 + size / 2, y0 + size + 22, 12, TEXT + ".9)");

            const gx = 330, gw = 320;
            const X = function (fr) { return gx + Math.min(fr, 40) / 40 * gw; };

            box(ctx, X(4), 90, X(8) - X(4), 50, "rgba(84,224,199,.25)");
            txt(ctx, "qubits", X(6), 84, 11, TEAL + "1)");
            line(ctx, gx, 140, gx + gw, 140, GREY + ".6)", 1);

            [0, 10, 20, 30, 40].forEach(function (fr) { txt(ctx, fr + " GHz", X(fr), 158, 10, GREY + ".85)"); });

            line(ctx, X(f), 70, X(f), 140, (inBand ? ROSE : GOLD) + "1)", 3);
            txt(ctx, "box mode " + (f > 40 ? "> 40" : f.toFixed(1)) + " GHz", X(f), 62, 11, (inBand ? ROSE : GOLD) + "1)");
        }
    });


    document.querySelectorAll('.fd-sim[data-sim^="qc-"]').forEach(F.mount);

})();
