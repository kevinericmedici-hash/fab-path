/* ========================================
   SAND TO CHIP: THE BUILD, THE FLOW, DEFECTS, AND PROCESS CONTROL

   Unit 24: build a transistor step by step.
   Unit 25: front-end or back-end sorting game.
   Unit 30: the full flow from bare wafer to tested die.
   Unit 32: killer and non-killer defects.
   Unit 33: match the measurement to the tool.
   Unit 34: diagnose a wafer map.
   Unit 35: spot the drift on a control chart.
   Unit 40: binning chips by speed.

   Registers on window.FabInteract; loaded by diagram-sims-chip.js.
   Teaching models: numbers and shapes are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.chipHelpers) {
        return;
    }

    const H = F.chipHelpers;
    const seg = H.seg;
    const wire = H.wire;
    const head = H.head;
    const setVal = H.setVal;
    const out = H.out;
    const stat = H.stat;
    const art = H.art;
    const SIMS = F.SIMS;
    const slider = F.slider;

    const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

    function mulberry(seedValue) {

        let a = seedValue >>> 0;

        return function () {

            a += 0x6D2B79F5;

            let t = a;

            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function animate(root, frame) {

        let raf = 0;
        let last = 0;
        let paused = false;
        let visible = true;

        function tick(now) {

            raf = 0;

            if (!root.isConnected || paused || !visible) {
                return;
            }

            const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;

            last = now;

            frame(dt);

            raf = requestAnimationFrame(tick);
        }

        function kick() {

            if (!raf && !paused && visible) {

                last = 0;
                raf = requestAnimationFrame(tick);
            }
        }

        if ("IntersectionObserver" in window) {

            new IntersectionObserver(function (entries) {

                visible = entries[0].isIntersecting;

                if (visible) {
                    kick();
                }
            }).observe(root);
        }

        kick();

        return {
            toggle: function () {

                paused = !paused;

                if (!paused) {
                    kick();
                }

                return paused;
            },
            kick: kick
        };
    }

    function bindPause(root, anim) {

        const b = root.querySelector("[data-pause]");

        if (b) {

            b.addEventListener("click", function () {

                const paused = anim.toggle();

                b.textContent = paused ? "▶ Play" : "⏸ Pause";
            });
        }
    }

    function rect(x, y, w, h, fill, stroke) {

        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:' + fill + ";stroke:" + (stroke || "none") + ';stroke-width:1"/>';
    }

    function label(x, y, text, size, anchor, fill) {

        return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" style="font-size:' + (size || 7) + "px;fill:" + (fill || "var(--text)") + '">' + text + "</text>";
    }

    function legend(items, y) {

        let s = "";
        let x = 14;

        items.forEach(function (it) {

            s += rect(x, y - 6, 8, 8, it[1], "none") + label(x + 12, y + 1, it[0], 7, "start", "var(--muted)");

            x += 22 + it[0].length * 3.9;
        });

        return s;
    }

    function arrowDown(x, y, color) {

        return '<polyline points="' + x + "," + y + " " + x + "," + (y + 14) + '" style="fill:none;stroke:' + color + ';stroke-width:1.6"/><polygon points="' + (x - 3) + "," + (y + 12) + " " + (x + 3) + "," + (y + 12) + " " + x + "," + (y + 18) + '" style="fill:' + color + '"/>';
    }

    // A reusable multiple-choice game: pick some random rounds, one answer each, with an explanation.
    function quiz(title, options, rounds, count, rewardKey, rewardMsg, endGood, endTry) {

        return function (root) {

            const rand = mulberry(Date.now() % 100000);
            const state = { i: 0, score: 0, answered: false, list: [] };

            function pick() {

                const pool = rounds.slice();

                for (let i = pool.length - 1; i > 0; i--) {

                    const j = Math.floor(rand() * (i + 1));
                    const tmp = pool[i];

                    pool[i] = pool[j];
                    pool[j] = tmp;
                }

                state.list = pool.slice(0, count);
            }

            root.innerHTML =
                head(title) +
                '<div class="fd-stat-row">' + stat("Round", "round") + stat("Score", "score") + "</div>" +
                '<p class="fd-q-prompt" data-out="q"></p>' +
                '<div class="fd-q-options" data-opts></div>' +
                '<p class="fd-q-feedback" data-out="fb"></p>' +
                '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-next style="display:none">Next →</button></div>';

            const optsEl = root.querySelector("[data-opts]");
            const nextBtn = root.querySelector("[data-next]");

            function show() {

                const n = state.list.length;

                if (state.i >= n) {

                    out(root, "q", "Done! You got " + state.score + " of " + n + ".");
                    optsEl.innerHTML = "";
                    out(root, "fb", state.score >= n - 1 ? endGood : endTry);
                    nextBtn.style.display = "none";
                    out(root, "round", "done");
                    out(root, "score", state.score + " / " + n);

                    F.reward(rewardKey, 15, rewardMsg);

                    return;
                }

                const r = state.list[state.i];

                state.answered = false;

                out(root, "round", (state.i + 1) + " of " + n);
                out(root, "score", state.score + " / " + n);
                out(root, "q", r.q);
                out(root, "fb", "Pick the best answer.");
                nextBtn.style.display = "none";

                optsEl.innerHTML = options.map(function (o) {
                    return '<button type="button" data-opt="' + o + '">' + o + "</button>";
                }).join("");

                optsEl.querySelectorAll("button").forEach(function (b) {

                    b.addEventListener("click", function () {

                        if (state.answered) {
                            return;
                        }

                        state.answered = true;

                        const correct = b.dataset.opt === r.a;

                        if (correct) {
                            state.score++;
                        }

                        optsEl.querySelectorAll("button").forEach(function (x) {

                            x.disabled = true;

                            if (x.dataset.opt === r.a) {
                                x.classList.add("right");
                            } else if (x === b) {
                                x.classList.add("wrong");
                            }
                        });

                        out(root, "fb", (correct ? "✅ Right. " : "❌ Not quite: it's " + r.a + ". ") + r.why);
                        out(root, "score", state.score + " / " + n);

                        nextBtn.style.display = "";
                        nextBtn.textContent = state.i === n - 1 ? "See my score →" : "Next →";
                    });
                });
            }

            nextBtn.addEventListener("click", function () {

                state.i++;

                show();
            });

            root.querySelector("[data-reset]").addEventListener("click", function () {

                state.i = 0;
                state.score = 0;

                pick();
                show();
            });

            pick();
            show();
        };
    }

    const COL = {
        si: "rgba(170,179,207,.45)",
        ox: "rgba(120,180,255,.6)",
        poly: "rgba(200,205,225,.6)",
        well: "rgba(84,224,199,.2)",
        ldd: "rgba(255,214,102,.45)",
        sd: "rgba(84,224,199,.6)",
        spacer: "rgba(255,105,120,.6)"
    };


    /* ======================================
       UNIT 24: BUILD A TRANSISTOR
    ====================================== */

    SIMS["chip-build"] = function (root) {

        const steps = [
            { t: "1 · Well implant", tool: "Ion implant + anneal", text: "An n-well or p-well is implanted and annealed first, setting up the body the transistor lives in." },
            { t: "2 · Gate oxide", tool: "Furnace oxidation", text: "A thin insulator, only a few nanometers thick, is grown thermally on the silicon under the gate." },
            { t: "3 · Gate poly", tool: "Deposition, lithography, etch", text: "Polysilicon is deposited, then patterned and etched by lithography into the gate." },
            { t: "4 · LDD implant", tool: "Ion implant (no extra mask)", text: "A light implant self-aligned to the gate's edge, so it needs no extra mask." },
            { t: "5 · Spacer", tool: "Deposit and etch back", text: "A deposited film is etched back to leave a sidewall on the gate. It sets back the heavier implant that follows." },
            { t: "6 · Source and drain implant", tool: "Ion implant", text: "The heavier, deeper implant, held back from the gate by the spacer." },
            { t: "7 · Spike anneal", tool: "Rapid thermal anneal", text: "A brief, very hot step activates every implant made so far, all at once." }
        ];

        const state = { step: 0, playing: true, t: 0 };

        root.innerHTML =
            head("Watch it: a transistor, one step at a time") +
            art("0 0 340 200", "A transistor cross-section built up in seven steps: well, gate oxide, gate polysilicon, light implant, spacers, heavy source and drain implant, and anneal") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div><span class="fd-chip" data-out="tool"></span></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-play>⏸ Pause</button>' +
            steps.map(function (s, i) { return '<button type="button" class="fd-sim-btn" data-stepbtn="' + i + '">' + (i + 1) + "</button>"; }).join("") +
            "</div>" +
            '<p class="fd-sim-formula">Notice how few extra masks this needs: the gate itself does most of the aligning.</p>';

        const svg = root.querySelector("svg");
        const playBtn = root.querySelector("[data-play]");

        function draw() {

            const s = state.step;
            let g = rect(20, 112, 300, 62, COL.si);

            if (s >= 0) { g += rect(40, 112, 260, 30, COL.well); }
            if (s >= 1) { g += rect(145, 106, 50, 6, COL.ox); }
            if (s >= 2) { g += rect(150, 76, 40, 30, COL.poly); }

            if (s >= 3) {

                g += rect(124, 112, 26, 9, COL.ldd) + rect(190, 112, 26, 9, COL.ldd);
            }

            if (s >= 4) {

                g += rect(140, 84, 10, 28, COL.spacer) + rect(190, 84, 10, 28, COL.spacer);
            }

            if (s >= 5) {

                const w = s >= 6 ? 4 : 0;

                g += rect(60 - w, 112, 80 + w, 22 + w, COL.sd) + rect(200, 112, 80 + w, 22 + w, COL.sd);
            }

            // implant arrows and heat
            if (s === 0) {
                [70, 120, 170, 220, 270].forEach(function (x) { g += arrowDown(x, 70, "rgba(255,214,102,.95)"); });
            }

            if (s === 3) {
                [130, 140, 200, 210].forEach(function (x) { g += arrowDown(x, 70, "rgba(255,214,102,.95)"); });
            }

            if (s === 5) {
                [75, 95, 115, 215, 235, 255].forEach(function (x) { g += arrowDown(x, 74, "rgba(255,214,102,.95)"); });
            }

            if (s === 6) {

                for (let i = 0; i < 5; i++) {
                    g += '<path d="M' + (60 + i * 55) + ',52 q6,-8 12,0 t12,0 t12,0" style="fill:none;stroke:rgba(255,105,120,.95);stroke-width:2"/>';
                }

                g += label(170, 34, "heat: every implant activates at once", 8, "middle", "rgba(255,105,120,1)");
            }

            g += label(100, 150, "source", 7, "middle", "var(--muted)") + label(240, 150, "drain", 7, "middle", "var(--muted)");

            if (s >= 2) { g += label(170, 72, "gate", 7, "middle", "var(--muted)"); }
            if (s >= 0) { g += label(48, 160, "well", 7, "start", "var(--muted)"); }

            svg.innerHTML = g + legend([["silicon", COL.si], ["oxide", COL.ox], ["poly", COL.poly], ["light implant", COL.ldd], ["heavy implant", COL.sd]], 194);

            out(root, "title", steps[s].t);
            out(root, "tool", steps[s].tool);
            out(root, "text", steps[s].text);

            root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {
                b.classList.toggle("on", parseInt(b.dataset.stepbtn, 10) === s);
            });

            if (s === 6) {
                F.reward("chip-build-done", 10, "You built a whole transistor");
            }
        }

        animate(root, function (dt) {

            if (!state.playing) {
                return;
            }

            state.t += dt;

            if (state.t > 2.6) {

                state.t = 0;
                state.step = (state.step + 1) % steps.length;

                draw();
            }
        });

        playBtn.addEventListener("click", function () {

            state.playing = !state.playing;
            playBtn.textContent = state.playing ? "⏸ Pause" : "▶ Play";
        });

        root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.playing = false;
                playBtn.textContent = "▶ Play";
                state.step = parseInt(b.dataset.stepbtn, 10);

                draw();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.step = 0;
            state.t = 0;
            state.playing = true;
            playBtn.textContent = "⏸ Pause";

            draw();
        });

        draw();
    };


    /* ======================================
       UNIT 25: FRONT-END OR BACK-END?
    ====================================== */

    SIMS["chip-feolbeol"] = quiz(
        "Game: front-end or back-end?",
        ["Front-end (FEOL)", "Back-end (BEOL)"],
        [
            { q: "The well implant that sets up each transistor's body.", a: "Front-end (FEOL)", why: "Doping at or below the transistor is front-end work, and it can run hot." },
            { q: "Growing the gate oxide and etching the polysilicon gate.", a: "Front-end (FEOL)", why: "The gate stack is part of the transistor itself." },
            { q: "The spike anneal that activates every implant.", a: "Front-end (FEOL)", why: "It runs near or above 1,000 °C, which is only safe before any wiring exists." },
            { q: "The source and drain implant.", a: "Front-end (FEOL)", why: "It builds the transistor's doped regions directly in the silicon." },
            { q: "Tungsten plugs that reach down to the transistor.", a: "Back-end (BEOL)", why: "Contacts start the wiring that connects transistors together." },
            { q: "The first layer of copper wiring.", a: "Back-end (BEOL)", why: "Anything that wires transistors together is back-end, and it must stay gentle on the transistors below." },
            { q: "Vias that connect one metal layer to the next.", a: "Back-end (BEOL)", why: "Vias are vertical wires between the layers of the metal stack." },
            { q: "The metal pads that wire bonds attach to later.", a: "Back-end (BEOL)", why: "Pads are the last metal on the chip." }
        ],
        6,
        "chip-feolbeol-done",
        "You sorted the whole flow",
        "You can sort any step. If it happens at or below the transistor it is front-end, and if it wires transistors together it is back-end.",
        "The test: does it build or dope the transistor itself (front-end), or wire transistors together (back-end)? Hit Reset to try again."
    );


    /* ======================================
       UNIT 30: THE FULL FLOW
    ====================================== */

    SIMS["chip-fullflow"] = function (root) {

        const stages = [
            { name: "A bare, polished wafer", from: 0, to: 3 },
            { name: "Front-end: building the transistors", from: 3, to: 45 },
            { name: "Back-end: wiring them together", from: 45, to: 85 },
            { name: "Passivation and pads", from: 85, to: 90 },
            { name: "Wafer test: probing every die", from: 90, to: 96 },
            { name: "Dicing into individual die", from: 96, to: 100 }
        ];

        const defaults = { p: 0 };
        const state = { p: 0, playing: true };

        root.innerHTML =
            head("Watch it: a wafer's whole journey") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="400" role="img" aria-label="A chip cross-section that grows from a bare wafer through transistors and metal layers to pads, beside a wafer map that is tested and then diced"></canvas>' +
            '<div class="fd-stat-row">' + stat("Day", "day") + stat("Process steps done", "steps") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="stage"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button><button type="button" class="fd-sim-btn" data-replay>↺ Replay</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Progress through the flow (drag to scrub)", key: "p", min: 0, max: 100, step: 0.5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Shown here as one smooth timeline: a leading-edge chip often takes well over 1,000 steps and several months from bare wafer to tested die.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(21);
        const dies = [];

        const MX = 560;
        const MY = 170;
        const MR = 96;
        const N = 11;
        const cell = 2 * MR / N;

        for (let r = 0; r < N; r++) {

            for (let c = 0; c < N; c++) {

                const x = MX - MR + (c + 0.5) * cell;
                const y = MY - MR + (r + 0.5) * cell;

                if (Math.hypot(x - MX, y - MY) < MR - 6) {
                    dies.push({ x: x, y: y, good: rand() > 0.14 });
                }
            }
        }

        function frac(a, b, p) { return clamp((p - a) / (b - a), 0, 1); }

        function draw() {

            const p = state.p;

            ctx.clearRect(0, 0, 680, 400);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 400);

            const x0 = 40;
            const x1 = 400;
            const base = 330;

            // substrate
            ctx.fillStyle = "rgba(170,179,207,.45)";
            ctx.fillRect(x0, base, x1 - x0, 30);
            ctx.fillStyle = "rgba(245,247,255,.85)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("silicon wafer", x0 + 6, base + 20);

            // front-end: transistors
            const f1 = frac(3, 45, p);
            const nT = Math.floor(f1 * 6 + 0.001);

            for (let i = 0; i < 6; i++) {

                const tx = x0 + 24 + i * 58;

                if (i < nT || (i === nT && f1 < 1 && f1 * 6 - nT > 0.01)) {

                    const part = i < nT ? 1 : f1 * 6 - nT;

                    ctx.fillStyle = "rgba(84,224,199," + (0.6 * part).toFixed(2) + ")";
                    ctx.fillRect(tx - 18, base - 8 * part, 12, 8 * part);
                    ctx.fillRect(tx + 18, base - 8 * part, 12, 8 * part);
                    ctx.fillStyle = "rgba(200,205,225," + (0.8 * part).toFixed(2) + ")";
                    ctx.fillRect(tx - 3, base - 8 - 14 * part, 14, 14 * part);
                }
            }

            // back-end: metal layers
            const f2 = frac(45, 85, p);
            const layers = 8 * f2;

            for (let i = 0; i < 8; i++) {

                const part = clamp(layers - i, 0, 1);

                if (part <= 0) {
                    continue;
                }

                const y = base - 30 - i * 22;
                const w = 6 + i * 1.2;

                ctx.fillStyle = "rgba(120,180,255," + (0.16 * part).toFixed(2) + ")";
                ctx.fillRect(x0, y - 6, x1 - x0, 20 * part);

                ctx.fillStyle = "rgba(255,214,102," + (0.9 * part).toFixed(2) + ")";

                for (let k = 0; k < 7; k++) {
                    ctx.fillRect(x0 + 20 + k * 50 - w / 2, y + 6 - 5 * part, w + 14, 5 * part);
                }

                ctx.fillStyle = "rgba(255,170,90," + (0.9 * part).toFixed(2) + ")";

                for (let k = 0; k < 4; k++) {
                    ctx.fillRect(x0 + 42 + k * 95, y + 8, 4, 14 * part);
                }
            }

            // passivation and pads
            const f3 = frac(85, 90, p);
            const topY = base - 30 - 8 * 22 - 4;

            if (f3 > 0) {

                ctx.fillStyle = "rgba(170,230,255," + (0.5 * f3).toFixed(2) + ")";
                ctx.fillRect(x0, topY - 6, x1 - x0, 8);
                ctx.fillStyle = "rgba(255,214,102," + (0.95 * f3).toFixed(2) + ")";

                for (let k = 0; k < 5; k++) {
                    ctx.fillRect(x0 + 40 + k * 70, topY - 10, 24, 6);
                }
            }

            // probe card
            const f4 = frac(90, 96, p);

            if (p >= 90 && p < 96) {

                const py = topY - 70 + 54 * Math.min(1, f4 * 2);

                ctx.strokeStyle = "rgba(245,247,255,.9)";
                ctx.lineWidth = 2;

                for (let k = 0; k < 3; k++) {

                    ctx.beginPath();
                    ctx.moveTo(x0 + 52 + k * 70, topY - 90);
                    ctx.lineTo(x0 + 52 + k * 70, py);
                    ctx.stroke();
                }

                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.fillText("probes", x1 - 70, topY - 76);
            }

            // dicing lines on the cross-section
            if (p >= 96) {

                ctx.strokeStyle = "rgba(255,105,120,.95)";
                ctx.setLineDash([5, 4]);
                ctx.lineWidth = 2;

                [x0 + 120, x0 + 240].forEach(function (x) {
                    ctx.beginPath();
                    ctx.moveTo(x, topY - 20);
                    ctx.lineTo(x, base + 30);
                    ctx.stroke();
                });

                ctx.setLineDash([]);
            }

            // wafer map on the right
            ctx.fillStyle = "rgba(170,179,207,.28)";
            ctx.strokeStyle = "rgba(245,247,255,.5)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(MX, MY, MR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            const tested = p >= 90;
            const diced = frac(96, 100, p);
            const showCut = p >= 96;
            const progressTest = frac(90, 96, p);

            dies.forEach(function (d, i) {

                const done = !tested ? false : (i / dies.length) <= progressTest;

                let fill = "rgba(245,247,255,.18)";

                if (done) {
                    fill = d.good ? "rgba(84,224,199,.75)" : "rgba(255,105,120,.75)";
                } else if (p >= 45) {
                    fill = "rgba(120,180,255,.4)";
                } else if (p >= 3) {
                    fill = "rgba(84,224,199," + (0.1 + 0.25 * f1).toFixed(2) + ")";
                }

                const spread = 1 + diced * 0.28;
                const dx = (d.x - MX) * spread + MX;
                const dy = (d.y - MY) * spread + MY;
                const s = showCut ? cell - 2 - diced * 4 : cell - 1;

                ctx.fillStyle = fill;
                ctx.fillRect(dx - s / 2, dy - s / 2, s, s);
            });

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(p >= 96 ? "individual die, ready for packaging" : (p >= 90 ? "teal = good die, red = bad" : "the wafer, die by die"), MX, MY + MR + 26);

            // stage info
            let stage = stages[0];

            stages.forEach(function (s) { if (p >= s.from) { stage = s; } });

            out(root, "stage", stage.name);
            out(root, "day", "Day " + Math.round(p * 0.9));
            out(root, "steps", Math.round(p * 12).toLocaleString() + " of 1,200");
            setVal(root, "p", Math.round(p) + "%");

            const inp = root.querySelector('input[data-key="p"]');

            if (inp && document.activeElement !== inp) {
                inp.value = p;
            }

            if (p >= 99.5) {
                F.reward("chip-fullflow-done", 10, "You followed a wafer all the way to die");
            }
        }

        const anim = animate(root, function (dt) {

            if (state.playing && state.p < 100) {

                state.p = Math.min(100, state.p + dt * 7);

                if (state.p >= 100) { state.playing = false; }
            }

            draw();
        });

        bindPause(root, anim);

        root.querySelector("[data-replay]").addEventListener("click", function () {

            state.p = 0;
            state.playing = true;
            anim.kick();
        });

        root.querySelector('input[data-key="p"]').addEventListener("input", function (e) {

            state.playing = false;
            state.p = parseFloat(e.target.value);

            draw();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.p = 0;
            state.playing = true;
            anim.kick();
        });

        draw();
    };


    /* ======================================
       UNIT 32: KILLER AND NON-KILLER DEFECTS
    ====================================== */

    SIMS["chip-killer"] = function (root) {

        const defaults = { size: 24 };
        const state = { size: 24, placed: 0, killers: 0, particles: [] };

        root.innerHTML =
            head("Try it: drop particles on a layout") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="360" role="img" aria-label="A layout with tightly packed metal lines on the left and a sparse area on the right. Tap to drop a particle: if it bridges two lines it is a killer defect"></canvas>' +
            '<div class="fd-stat-row">' + stat("Particles dropped", "n") + stat("Killers", "k") + stat("Killer share", "pct") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-rain>🌧 Rain 40 random particles</button><button type="button" class="fd-sim-btn" data-clear>Clear</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Particle size (nm)", key: "size", min: 4, max: 60, step: 1, value: 24 }) +
            "</div>" +
            '<p class="fd-sim-formula">Tap the layout to place a particle. The same particle can kill one die and do nothing to another: size and location matter more than the defect\'s simple existence.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(Date.now() % 100000);

        // vertical metal lines: dense on the left, sparse on the right
        const lines = [];

        for (let i = 0; i < 12; i++) {
            lines.push({ x: 50 + i * 26, w: 12 });
        }

        [420, 520, 600].forEach(function (x) { lines.push({ x: x, w: 12 }); });

        const AREA = { x0: 30, x1: 650, y0: 30, y1: 300 };

        function hits(px, py, r) {

            // lines the particle touches
            return lines.filter(function (l) {

                const nearestX = clamp(px, l.x, l.x + l.w);

                return Math.abs(px - nearestX) < r && py + r > AREA.y0 && py - r < AREA.y1;
            });
        }

        function drop(px, py) {

            const r = state.size / 2 * 1.0;
            const touched = hits(px, py, r);
            const killer = touched.length >= 2;

            state.particles.push({ x: px, y: py, r: r, killer: killer });
            state.placed++;

            if (killer) {

                state.killers++;
                F.reward("chip-killer-first", 5, "You made a killer defect");
            }
        }

        function update() {

            out(root, "n", state.placed);
            out(root, "k", state.killers);
            out(root, "pct", state.placed ? Math.round(state.killers / state.placed * 100) + "%" : "-");
            setVal(root, "size", state.size + " nm");

            let v;

            if (!state.placed) {
                v = "Tap the layout to drop a particle";
            } else if (state.killers === 0) {
                v = "No killers yet: every particle landed somewhere harmless";
            } else {
                v = "Killers are the ones that bridge two lines";
            }

            out(root, "verdict", v);

            draw();
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 360);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 360);

            ctx.fillStyle = "rgba(120,180,255,.12)";
            ctx.fillRect(AREA.x0, AREA.y0, AREA.x1 - AREA.x0, AREA.y1 - AREA.y0);

            ctx.fillStyle = "rgba(255,214,102,.85)";

            lines.forEach(function (l) {
                ctx.fillRect(l.x, AREA.y0 + 10, l.w, AREA.y1 - AREA.y0 - 20);
            });

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("tightly packed wires", 200, 326);
            ctx.fillText("sparse wires", 520, 326);

            state.particles.forEach(function (p) {

                ctx.fillStyle = p.killer ? "rgba(255,105,120,.95)" : "rgba(84,224,199,.9)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(2, p.r), 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "rgba(6,10,24,.9)";
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(255,105,120,.95)";
            ctx.fillText("● killer (shorts two wires)", 40, 348);
            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.fillText("● harmless", 230, 348);
        }

        canvas.addEventListener("click", function (e) {

            const rc = canvas.getBoundingClientRect();
            const px = (e.clientX - rc.left) * 680 / rc.width;
            const py = (e.clientY - rc.top) * 360 / rc.height;

            if (px < AREA.x0 || px > AREA.x1 || py < AREA.y0 || py > AREA.y1) {
                return;
            }

            drop(px, py);
            update();
        });

        root.querySelector("[data-rain]").addEventListener("click", function () {

            for (let i = 0; i < 40; i++) {
                drop(AREA.x0 + rand() * (AREA.x1 - AREA.x0), AREA.y0 + rand() * (AREA.y1 - AREA.y0));
            }

            update();

            F.reward("chip-killer-rain", 5, "You rained particles on a layout");
        });

        root.querySelector("[data-clear]").addEventListener("click", function () {

            state.placed = 0;
            state.killers = 0;
            state.particles = [];

            update();
        });

        wire(root, state, defaults, function () {

            state.placed = 0;
            state.killers = 0;
            state.particles = [];

            update();
        });

        update();
    };


    /* ======================================
       UNIT 33: MATCH THE MEASUREMENT TO THE TOOL
    ====================================== */

    SIMS["chip-metroquiz"] = quiz(
        "Game: which tool measures it?",
        ["CD-SEM", "Scatterometry", "Overlay metrology", "Film-thickness tool"],
        [
            { q: "Is this printed line 24 nm wide, or 26 nm? You want to see the feature and measure its width directly.", a: "CD-SEM", why: "A CD-SEM scans an electron beam across the feature and reads the width from the image, with resolution down to a few nanometers." },
            { q: "How far is layer two's pattern from layer one's, in nanometers?", a: "Overlay metrology", why: "Special targets on each layer show how well one layer lines up with the one beneath it." },
            { q: "How thick is the oxide that was just grown? It should be only a few nanometers.", a: "Film-thickness tool", why: "Thickness is checked constantly, often after every single layer, with optical tools that read light reflected from the film." },
            { q: "Measure the line width and profile of a repeating grating without touching it, by bouncing light off it.", a: "Scatterometry", why: "The way light scatters from a grating reveals line width and profile quickly and without touching the wafer." },
            { q: "Check whether the alignment marks of two layers sit where they should after exposure.", a: "Overlay metrology", why: "Overlay tolerance shrinks with the features, so it is measured on every layer." },
            { q: "After a deposition, confirm the film came out at its target thickness before the next step.", a: "Film-thickness tool", why: "A fab measures thickness after every deposition or growth step to catch drift early." }
        ],
        5,
        "chip-metroquiz-done",
        "You matched measurements to tools",
        "You know your metrology tools: CD-SEM for width, overlay targets for alignment, and optical tools for thickness.",
        "Remember the three numbers: width (CD-SEM or scatterometry), alignment (overlay), and thickness. Hit Reset to try again."
    );


    /* ======================================
       UNIT 34: DIAGNOSE THE WAFER MAP
    ====================================== */

    SIMS["chip-wafermapdx"] = function (root) {

        const causes = {
            center: "Uneven polish or spin coat",
            edge: "Etch or deposition at the edge",
            streak: "A scratch from handling",
            random: "Random particles"
        };

        const why = {
            center: "A cluster in the middle is a classic CMP or spin-coat uniformity signature.",
            edge: "An edge ring often means an etch or deposition step behaves differently near the wafer's edge.",
            streak: "A streak points to a mechanical scan or a scratch from wafer handling.",
            random: "Failures scattered with no shape are usually just particles."
        };

        const kinds = Object.keys(causes);
        const rand = mulberry(Date.now() % 100000);
        const state = { i: 0, score: 0, answered: false, list: [], map: [] };

        root.innerHTML =
            head("Game: read the wafer map") +
            '<div class="fd-stat-row">' + stat("Round", "round") + stat("Score", "score") + "</div>" +
            '<canvas class="fd-sim-canvas" width="360" height="360" role="img" aria-label="A wafer map where red dies failed and teal dies passed"></canvas>' +
            '<p class="fd-q-prompt">What most likely caused these failures?</p>' +
            '<div class="fd-q-options" data-opts></div>' +
            '<p class="fd-q-feedback" data-out="fb"></p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-next style="display:none">Next →</button></div>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const optsEl = root.querySelector("[data-opts]");
        const nextBtn = root.querySelector("[data-next]");

        const N = 21;
        const R = 160;
        const CX = 180;
        const CY = 180;

        function build(kind) {

            const dies = [];
            const ang = rand() * Math.PI;

            for (let r = 0; r < N; r++) {

                for (let c = 0; c < N; c++) {

                    const x = (c + 0.5) / N * 2 - 1;
                    const y = (r + 0.5) / N * 2 - 1;
                    const rad = Math.hypot(x, y);

                    if (rad > 0.97) {
                        continue;
                    }

                    let p = 0.04;

                    if (kind === "center") { p = 0.04 + 0.9 * Math.exp(-Math.pow(rad / 0.38, 2)); }
                    if (kind === "edge") { p = rad > 0.78 ? 0.8 : 0.04; }
                    if (kind === "streak") {

                        const dist = Math.abs(x * Math.sin(ang) - y * Math.cos(ang));

                        p = dist < 0.07 ? 0.88 : 0.04;
                    }

                    if (kind === "random") { p = 0.14; }

                    dies.push({ x: x, y: y, bad: rand() < p });
                }
            }

            return dies;
        }

        function draw() {

            ctx.clearRect(0, 0, 360, 360);
            ctx.fillStyle = "rgba(170,179,207,.25)";
            ctx.beginPath();
            ctx.arc(CX, CY, R + 6, 0, Math.PI * 2);
            ctx.fill();

            const s = 2 * R / N;

            state.map.forEach(function (d) {

                ctx.fillStyle = d.bad ? "rgba(255,105,120,.95)" : "rgba(84,224,199,.55)";
                ctx.fillRect(CX + d.x * R - s / 2 + 1, CY + d.y * R - s / 2 + 1, s - 2, s - 2);
            });
        }

        function pickList() {

            const l = [];

            while (l.length < 6) {

                const k = kinds[Math.floor(rand() * kinds.length)];

                if (l.length && l[l.length - 1] === k) {
                    continue;
                }

                l.push(k);
            }

            state.list = l;
        }

        function show() {

            const n = state.list.length;

            if (state.i >= n) {

                optsEl.innerHTML = "";
                out(root, "fb", "Done! You got " + state.score + " of " + n + ". The shape first, then the root cause.");
                out(root, "round", "done");
                nextBtn.style.display = "none";
                F.reward("chip-wafermapdx-done", 15, "You read six wafer maps");

                return;
            }

            const kind = state.list[state.i];

            state.answered = false;
            state.map = build(kind);

            draw();

            out(root, "round", (state.i + 1) + " of " + n);
            out(root, "score", state.score + " / " + n);
            out(root, "fb", "Look at the shape first.");
            nextBtn.style.display = "none";

            optsEl.innerHTML = kinds.map(function (k) {
                return '<button type="button" data-opt="' + k + '">' + causes[k] + "</button>";
            }).join("");

            optsEl.querySelectorAll("button").forEach(function (b) {

                b.addEventListener("click", function () {

                    if (state.answered) {
                        return;
                    }

                    state.answered = true;

                    const correct = b.dataset.opt === kind;

                    if (correct) { state.score++; }

                    optsEl.querySelectorAll("button").forEach(function (x) {

                        x.disabled = true;

                        if (x.dataset.opt === kind) {
                            x.classList.add("right");
                        } else if (x === b) {
                            x.classList.add("wrong");
                        }
                    });

                    out(root, "fb", (correct ? "✅ Right. " : "❌ Not quite: it's " + causes[kind].toLowerCase() + ". ") + why[kind]);
                    out(root, "score", state.score + " / " + n);

                    nextBtn.style.display = "";
                    nextBtn.textContent = state.i === n - 1 ? "See my score →" : "Next →";
                });
            });
        }

        nextBtn.addEventListener("click", function () {

            state.i++;

            show();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.i = 0;
            state.score = 0;

            pickList();
            show();
        });

        pickList();
        show();
    };


    /* ======================================
       UNIT 35: SPOT THE DRIFT
    ====================================== */

    SIMS["chip-spc"] = function (root) {

        const MAXP = 60;
        const state = { run: true, pts: [], t: 0, driftAt: 0, stoppedAt: -1, msg: "" };
        const rand = mulberry(Date.now() % 100000);

        function gauss() {

            const u = Math.max(1e-9, rand());

            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
        }

        root.innerHTML =
            head("Game: catch the drift") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="340" role="img" aria-label="A control chart: a measurement plotted for each wafer, with upper and lower control limits. At some point the process starts to drift."></canvas>' +
            '<div class="fd-stat-row">' + stat("Wafers run", "n") + stat("Wafers run after the drift began", "bad") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-stop>🛑 Stop the tool</button><button type="button" class="fd-sim-btn" data-again>↺ New run</button></div>' +
            '<p class="fd-sim-formula">The limits are not a spec: they are where this process normally lives. A point outside them, or a run of points drifting one way, is an out-of-control signal. It is a question to answer, not a verdict.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const stopBtn = root.querySelector("[data-stop]");

        function start() {

            state.run = true;
            state.pts = [];
            state.t = 0;
            state.driftAt = 16 + Math.floor(rand() * 14);
            state.stoppedAt = -1;
            stopBtn.disabled = false;

            out(root, "verdict", "Watching the process. Stop the tool if it starts to drift.");
            updateStats();
        }

        function signalIndex() {

            // first out-of-control signal: a point beyond 3 sigma, or 6 points in a row on one side of the center
            for (let i = 0; i < state.pts.length; i++) {

                if (Math.abs(state.pts[i]) > 3) { return i; }

                if (i >= 5) {

                    let up = true;
                    let down = true;

                    for (let k = 0; k < 6; k++) {

                        if (state.pts[i - k] <= 0) { up = false; }
                        if (state.pts[i - k] >= 0) { down = false; }
                    }

                    if (up || down) { return i; }
                }
            }

            return -1;
        }

        function updateStats() {

            out(root, "n", state.pts.length);

            const after = state.pts.length - state.driftAt;

            out(root, "bad", state.pts.length > state.driftAt ? after : 0);
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 340);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 340);

            const x0 = 40;
            const x1 = 650;
            const y0 = 20;
            const y1 = 310;

            function X(i) { return x0 + (i + 0.5) / MAXP * (x1 - x0); }
            function Y(v) { return (y0 + y1) / 2 - v / 4.5 * (y1 - y0) / 2; }

            ctx.fillStyle = "rgba(84,224,199,.10)";
            ctx.fillRect(x0, Y(3), x1 - x0, Y(-3) - Y(3));

            [[3, "upper limit"], [0, "center"], [-3, "lower limit"]].forEach(function (l) {

                ctx.strokeStyle = l[0] === 0 ? "rgba(170,179,207,.6)" : "rgba(255,214,102,.9)";
                ctx.setLineDash(l[0] === 0 ? [3, 4] : []);
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(x0, Y(l[0]));
                ctx.lineTo(x1, Y(l[0]));
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.font = "11px sans-serif";
                ctx.textAlign = "left";
                ctx.fillText(l[1], x0 + 4, Y(l[0]) - 4);
            });

            const sig = signalIndex();

            ctx.strokeStyle = "rgba(245,247,255,.5)";
            ctx.lineWidth = 1.4;
            ctx.beginPath();

            state.pts.forEach(function (v, i) {

                if (i === 0) { ctx.moveTo(X(i), Y(v)); } else { ctx.lineTo(X(i), Y(v)); }
            });

            ctx.stroke();

            state.pts.forEach(function (v, i) {

                const out3 = Math.abs(v) > 3;

                ctx.fillStyle = out3 ? "rgba(255,105,120,1)" : (sig >= 0 && i >= sig ? "rgba(255,214,102,1)" : "rgba(84,224,199,1)");
                ctx.beginPath();
                ctx.arc(X(i), Y(v), 4, 0, Math.PI * 2);
                ctx.fill();
            });

            if (sig >= 0) {

                ctx.fillStyle = "rgba(255,105,120,1)";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("⚠ out-of-control signal", clamp(X(sig), 100, 600), 14);
            }

            if (state.stoppedAt >= 0) {

                ctx.strokeStyle = "rgba(255,105,120,.95)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(X(state.stoppedAt) + 8, y0);
                ctx.lineTo(X(state.stoppedAt) + 8, y1);
                ctx.stroke();
            }
        }

        function finish(stopped) {

            state.run = false;
            stopBtn.disabled = true;
            state.stoppedAt = state.pts.length - 1;

            const drifted = state.pts.length > state.driftAt;
            const after = state.pts.length - state.driftAt;

            if (!stopped) {

                out(root, "verdict", "The chart filled up. " + (drifted ? after + " wafers ran after the drift began." : "The process never drifted."));

            } else if (!drifted) {

                out(root, "verdict", "False alarm: the process had not drifted yet. Stopping costs production too, so wait for a real signal.");
                F.reward("chip-spc-try", 5, "You tried the control chart");

            } else if (after <= 6) {

                out(root, "verdict", "Caught it: only " + after + " wafers ran after the drift began.");
                F.reward("chip-spc-caught", 15, "You caught the drift early");

            } else {

                out(root, "verdict", "Stopped, but " + after + " wafers ran after the drift began. Watch for a run of points moving one way.");
                F.reward("chip-spc-try", 5, "You tried the control chart");
            }

            updateStats();
            draw();
        }

        stopBtn.addEventListener("click", function () {

            if (state.run) {
                finish(true);
            }
        });

        root.querySelector("[data-again]").addEventListener("click", function () {

            start();
            draw();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            start();
            draw();
        });

        animate(root, function (dt) {

            if (!state.run) {
                return;
            }

            state.t += dt;

            if (state.t >= 0.4) {

                state.t = 0;

                const n = state.pts.length;
                const shift = n >= state.driftAt ? (n - state.driftAt + 1) * 0.12 : 0;

                state.pts.push(gauss() * 0.95 + shift);
                updateStats();

                if (state.pts.length >= MAXP) {
                    finish(false);
                }
            }

            draw();
        });

        start();
        draw();
    };


    /* ======================================
       UNIT 40: BINNING BY SPEED
    ====================================== */

    SIMS["chip-binning"] = function (root) {

        const defaults = { top: 3.3, mid: 2.8 };
        const state = { top: 3.3, mid: 2.8 };
        const MEAN = 3.0;
        const SD = 0.25;
        const SCRAP = 2.3;
        const PRICE = { top: 500, mid: 300, low: 150 };

        root.innerHTML =
            head("Try it: sort chips into speed bins") +
            art("0 0 340 190", "A bell curve of chip speeds divided into premium, standard, value, and scrap bins by two adjustable cut-off speeds") +
            '<div class="fd-stat-row">' + stat("Premium", "pt") + stat("Standard", "pm") + stat("Value", "pl") + stat("Average price per chip", "avg") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Premium bin starts at (GHz)", key: "top", min: 3.0, max: 3.8, step: 0.05, value: 3.3 }) +
            slider({ label: "Standard bin starts at (GHz)", key: "mid", min: 2.4, max: 3.2, step: 0.05, value: 2.8 }) +
            "</div>" +
            '<p class="fd-sim-formula">One design, several products. Chips slower than ' + SCRAP.toFixed(1) + ' GHz are scrap. Illustrative prices: premium $500, standard $300, value $150.</p>';

        const svg = root.querySelector("svg");

        function cdf(x) {

            // normal CDF via erf approximation
            const z = (x - MEAN) / (SD * Math.SQRT2);
            const t = 1 / (1 + 0.3275911 * Math.abs(z));
            const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);

            return 0.5 * (1 + (z >= 0 ? y : -y));
        }

        function update() {

            const mid = Math.min(state.mid, state.top - 0.05);
            const pTop = 1 - cdf(state.top);
            const pMid = cdf(state.top) - cdf(mid);
            const pLow = cdf(mid) - cdf(SCRAP);

            const avg = pTop * PRICE.top + pMid * PRICE.mid + pLow * PRICE.low;

            const baseAvg = (1 - cdf(SCRAP)) * PRICE.low;

            let s = "";
            const x0 = 24;
            const x1 = 316;
            const y1 = 150;
            const y0 = 20;
            const lo = 2.0;
            const hi = 4.0;

            function X(v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); }

            const bars = 40;

            for (let i = 0; i < bars; i++) {

                const a = lo + i / bars * (hi - lo);
                const b = lo + (i + 1) / bars * (hi - lo);
                const h = (cdf(b) - cdf(a)) / 0.09 * (y1 - y0);
                const mid2 = (a + b) / 2;

                let fill = "rgba(255,105,120,.55)";

                if (mid2 >= state.top) { fill = "rgba(255,214,102,.85)"; }
                else if (mid2 >= mid) { fill = "rgba(84,224,199,.75)"; }
                else if (mid2 >= SCRAP) { fill = "rgba(120,180,255,.7)"; }

                s += rect(X(a).toFixed(1), (y1 - Math.min(h, y1 - y0)).toFixed(1), ((x1 - x0) / bars - 0.6).toFixed(1), Math.min(h, y1 - y0).toFixed(1), fill, "none");
            }

            s += '<line x1="' + x0 + '" y1="' + y1 + '" x2="' + x1 + '" y2="' + y1 + '" style="stroke:var(--muted)"/>';

            [[2, "2.0"], [3, "3.0"], [4, "4.0 GHz"]].forEach(function (t) {
                s += label(X(t[0]), y1 + 11, t[1], 6.5, "middle", "var(--muted)");
            });

            [state.top, mid].forEach(function (v) {
                s += '<line x1="' + X(v) + '" y1="' + (y0 - 4) + '" x2="' + X(v) + '" y2="' + y1 + '" style="stroke:rgba(245,247,255,.9);stroke-dasharray:3 3"/>';
            });

            s += label((X(state.top) + x1) / 2, y0 + 4, "premium", 7, "middle", "rgba(255,214,102,1)");
            s += label((X(mid) + X(state.top)) / 2, y0 + 4, "standard", 7, "middle", "rgba(84,224,199,1)");
            s += label((X(SCRAP) + X(mid)) / 2, y0 + 4, "value", 7, "middle", "rgba(120,180,255,1)");
            s += label((x0 + X(SCRAP)) / 2, y0 + 4, "scrap", 7, "middle", "rgba(255,105,120,1)");
            s += label(170, 178, "measured chip speed", 7, "middle", "var(--muted)");

            svg.innerHTML = s;

            out(root, "pt", Math.round(pTop * 100) + "%");
            out(root, "pm", Math.round(pMid * 100) + "%");
            out(root, "pl", Math.round(pLow * 100) + "%");
            out(root, "avg", "$" + Math.round(avg));
            setVal(root, "top", state.top.toFixed(2) + " GHz");
            setVal(root, "mid", state.mid.toFixed(2) + " GHz");

            out(root, "verdict", avg > baseAvg * 2 ? "Binning earns far more than selling every chip as the slowest grade" : "Move the cut-offs: more chips fall into higher-priced bins");

            if (avg > baseAvg * 2) {
                F.reward("chip-binning-good", 10, "You made the binning pay");
            }

        }

        wire(root, state, defaults, update);
        update();
    };


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="chip-"]').forEach(F.mount);

})();
