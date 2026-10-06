/* ========================================
   SAND TO CHIP: LAYER FLOWS AND LITHOGRAPHY SIMULATORS

   Unit 12: build STI and copper damascene step by step, match tool to film.
   Unit 14: spin coating curve, post-exposure bake trade-off.
   Unit 16: step-and-scan with reduction, overlay budget.
   Unit 17: self-aligned double patterning, EUV tin plasma source.
   Unit 18: focus-exposure process window, EUV photon shot noise.

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
    const fmtNm = H.fmtNm;
    const sci = H.sci;
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

    function gauss(rand) {

        const u = Math.max(1e-9, rand());
        const v = rand();

        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
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

    const COL = {
        si: "rgba(170,179,207,.45)",
        ox: "rgba(120,180,255,.6)",
        nit: "rgba(255,105,120,.65)",
        cu: "rgba(255,170,90,.9)",
        bar: "rgba(255,105,200,.85)",
        film: "rgba(255,214,102,.65)",
        spacer: "rgba(84,224,199,.7)",
        mand: "rgba(120,180,255,.55)"
    };


    /* ======================================
       UNIT 12: BUILD STI AND COPPER DAMASCENE STEP BY STEP
    ====================================== */

    SIMS["chip-flow"] = function (root) {

        const procs = {
            sti: {
                name: "Shallow trench isolation",
                steps: [
                    { t: "1 · Pad oxide and nitride", tool: "Furnace oxidation + LPCVD", text: "Grow a thin oxide, then deposit silicon nitride by LPCVD." },
                    { t: "2 · Etch the trench", tool: "Plasma etch", text: "Pattern, then plasma-etch through the nitride and into the silicon." },
                    { t: "3 · Liner and fill", tool: "Thermal liner + CVD oxide", text: "Grow a thin liner oxide, then overfill the trench with CVD oxide." },
                    { t: "4 · Polish", tool: "CMP", text: "CMP flattens the oxide and stops on the nitride." },
                    { t: "5 · Strip the nitride", tool: "Hot phosphoric acid", text: "Hot phosphoric acid removes the nitride, leaving oxide-filled isolation." }
                ],
                legend: [["silicon", COL.si], ["pad oxide / oxide", COL.ox], ["nitride", COL.nit]]
            },
            cu: {
                name: "Copper damascene",
                steps: [
                    { t: "1 · Insulator", tool: "CVD", text: "Deposit the interlayer dielectric by CVD." },
                    { t: "2 · Etch", tool: "Plasma etch", text: "Pattern and etch trenches into it." },
                    { t: "3 · Barrier and seed", tool: "Sputtering (PVD)", text: "Sputter a Ta/TaN barrier, then a thin copper seed." },
                    { t: "4 · Plate", tool: "Electroplating", text: "Electroplate copper until it overfills the trenches." },
                    { t: "5 · Polish", tool: "CMP", text: "CMP removes the excess, leaving copper only in the trenches." }
                ],
                legend: [["insulator", COL.ox], ["barrier", COL.bar], ["copper", COL.cu], ["lower layers", COL.si]]
            }
        };

        const defaults = { proc: "sti", step: 0 };
        const state = { proc: "sti", step: 0, playing: true, t: 0, seen: {} };

        root.innerHTML =
            head("Watch it: build it one step at a time") +
            art("0 0 340 200", "A cross-section drawn step by step for shallow trench isolation or copper damascene") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div><span class="fd-chip" data-out="tool"></span></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-play>⏸ Pause</button>' +
            [0, 1, 2, 3, 4].map(function (i) { return '<button type="button" class="fd-sim-btn" data-stepbtn="' + i + '">' + (i + 1) + "</button>"; }).join("") +
            "</div>" +
            seg("Process", "proc", [["sti", "Shallow trench isolation"], ["cu", "Copper damascene"]]) +
            '<p class="fd-sim-formula">Each process borrows tools from other units. Growth, CVD, etch, and CMP team up to isolate transistors, and copper cannot be etched, so the trench is etched first and then filled.</p>';

        const svg = root.querySelector("svg");
        const playBtn = root.querySelector("[data-play]");

        function drawSti(step) {

            let s = rect(20, 120, 300, 60, COL.si);

            if (step >= 1) {

                s = rect(20, 120, 120, 60, COL.si) + rect(200, 120, 120, 60, COL.si) + rect(140, 156, 60, 24, COL.si);
            }

            if (step <= 1) {

                const spans = step === 0 ? [[20, 320]] : [[20, 140], [200, 320]];

                spans.forEach(function (sp) {
                    s += rect(sp[0], 114, sp[1] - sp[0], 6, COL.ox) + rect(sp[0], 100, sp[1] - sp[0], 14, COL.nit);
                });
            }

            if (step === 2) {

                [[20, 140], [200, 320]].forEach(function (sp) {
                    s += rect(sp[0], 114, sp[1] - sp[0], 6, COL.ox) + rect(sp[0], 100, sp[1] - sp[0], 14, COL.nit);
                });

                s += '<path d="M20,100 L20,86 L140,86 L150,96 L190,96 L200,86 L320,86 L320,100 Z" style="fill:' + COL.ox + '"/>';
                s += rect(140, 100, 60, 56, COL.ox);
            }

            if (step === 3) {

                [[20, 140], [200, 320]].forEach(function (sp) {
                    s += rect(sp[0], 114, sp[1] - sp[0], 6, COL.ox) + rect(sp[0], 100, sp[1] - sp[0], 14, COL.nit);
                });

                s += rect(140, 100, 60, 56, COL.ox);
                s += '<line x1="14" y1="100" x2="326" y2="100" style="stroke:rgba(84,224,199,.9);stroke-dasharray:4 3"/>';
                s += label(326, 94, "polish stops here", 6.5, "end", "rgba(84,224,199,.95)");
            }

            if (step === 4) {

                s += rect(140, 100, 60, 56, COL.ox);
            }

            if (step >= 1) {
                s += label(170, 176, "trench", 6.5, "middle", "var(--muted)");
            }

            return s + label(60, 150, "silicon", 7, "middle", "var(--muted)") + legend(procs.sti.legend, 194);
        }

        function drawCu(step) {

            let s = rect(20, 150, 300, 30, COL.si) + label(60, 168, "lower layers", 7, "middle", "var(--muted)");

            if (step === 0) {
                s += rect(20, 90, 300, 60, COL.ox);
            }

            if (step >= 1) {

                s += rect(20, 90, 30, 60, COL.ox) + rect(100, 90, 80, 60, COL.ox) + rect(250, 90, 70, 60, COL.ox) +
                    rect(50, 120, 50, 30, COL.ox) + rect(180, 120, 70, 30, COL.ox);
            }

            const outline = '<polyline points="50,90 50,120 100,120 100,90" style="fill:none;stroke:' + COL.bar + ';stroke-width:3"/>' +
                '<polyline points="180,90 180,120 250,120 250,90" style="fill:none;stroke:' + COL.bar + ';stroke-width:3"/>';

            if (step === 2) {

                s += outline + rect(20, 87, 30, 3, COL.bar) + rect(100, 87, 80, 3, COL.bar) + rect(250, 87, 70, 3, COL.bar);
                s += '<polyline points="54,90 54,116 96,116 96,90" style="fill:none;stroke:' + COL.cu + ';stroke-width:1.5"/>';
                s += '<polyline points="184,90 184,116 246,116 246,90" style="fill:none;stroke:' + COL.cu + ';stroke-width:1.5"/>';
            }

            if (step === 3) {

                s += rect(20, 66, 300, 21, COL.cu) + rect(50, 87, 50, 33, COL.cu) + rect(180, 87, 70, 33, COL.cu);
                s += outline + rect(20, 87, 30, 3, COL.bar) + rect(100, 87, 80, 3, COL.bar) + rect(250, 87, 70, 3, COL.bar);
                s += label(170, 60, "excess copper", 6.5, "middle", "var(--muted)");
            }

            if (step === 4) {

                s += rect(50, 90, 50, 30, COL.cu) + rect(180, 90, 70, 30, COL.cu) + outline;
                s += '<line x1="14" y1="90" x2="326" y2="90" style="stroke:rgba(84,224,199,.9);stroke-dasharray:4 3"/>';
                s += label(326, 84, "flat surface", 6.5, "end", "rgba(84,224,199,.95)");
            }

            return s + legend(procs.cu.legend, 194);
        }

        function render() {

            const p = procs[state.proc];
            const st = p.steps[state.step];

            svg.innerHTML = state.proc === "sti" ? drawSti(state.step) : drawCu(state.step);

            out(root, "title", p.name + ": " + st.t);
            out(root, "tool", "Tool: " + st.tool);
            out(root, "text", st.text);

            root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {
                b.classList.toggle("on", parseInt(b.dataset.stepbtn, 10) === state.step);
            });

            root.querySelectorAll("button[data-set]").forEach(function (b) {
                b.classList.toggle("on", b.dataset.set === "proc:" + state.proc);
            });

            if (state.step === 4) {

                state.seen[state.proc] = true;

                if (state.seen.sti && state.seen.cu) {
                    F.reward("chip-flow-both", 10, "You built both STI and damascene");
                }
            }
        }

        animate(root, function (dt) {

            if (!state.playing) {
                return;
            }

            state.t += dt;

            if (state.t > 2.4) {

                state.t = 0;
                state.step = (state.step + 1) % 5;

                render();
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

                render();
            });
        });

        root.querySelectorAll("button[data-set]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.proc = b.dataset.set.split(":")[1];
                state.step = 0;
                state.t = 0;

                render();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.proc = "sti";
            state.step = 0;
            state.t = 0;
            state.playing = true;
            playBtn.textContent = "⏸ Pause";

            render();
        });

        render();
    };


    /* ======================================
       UNIT 12: MATCH THE TOOL TO THE FILM (game)
    ====================================== */

    SIMS["chip-toolmatch"] = function (root) {

        const tools = ["Furnace oxidation", "LPCVD", "PECVD", "Sputtering (PVD)", "Electroplating", "CVD", "ALD"];

        const all = [
            { q: "The gate oxide, or the isolation oxide grown early on bare silicon.", a: "Furnace oxidation", why: "Early in the flow, nothing temperature-sensitive is on the wafer yet, so a furnace above 1,000 °C grows the best oxide." },
            { q: "A polysilicon gate layer or a silicon nitride film that needs high quality over many wafers at once.", a: "LPCVD", why: "Low-pressure CVD in a hot furnace gives uniform polysilicon and nitride on a whole batch of wafers." },
            { q: "Oxide between metal layers, deposited after wiring is on the wafer.", a: "PECVD", why: "Plasma supplies the energy, so it works below about 400 °C, which copper and delicate insulators can survive." },
            { q: "Aluminum, titanium, tantalum, or the thin copper seed layer.", a: "Sputtering (PVD)", why: "Sputtering knocks metal atoms off a target onto the wafer, which works well for these metals." },
            { q: "The copper wiring that fills the trenches.", a: "Electroplating", why: "Plating grows thick copper quickly from the seed layer, filling trenches from the bottom up." },
            { q: "Tungsten plugs that fill the contact holes.", a: "CVD", why: "Chemical vapor deposition of tungsten coats the narrow holes well and fills them." },
            { q: "A high-k gate dielectric only 1 to 2 nm thick.", a: "ALD", why: "Atomic layer deposition adds one atomic layer at a time, so thickness is controlled to a fraction of a nanometer." }
        ];

        const rand = mulberry(Date.now() % 100000);
        const state = { i: 0, score: 0, answered: false, rounds: [] };

        function pickRounds() {

            const pool = all.slice();

            for (let i = pool.length - 1; i > 0; i--) {

                const j = Math.floor(rand() * (i + 1));
                const tmp = pool[i];

                pool[i] = pool[j];
                pool[j] = tmp;
            }

            state.rounds = pool.slice(0, 6);
        }

        root.innerHTML =
            head("Game: which tool builds this layer?") +
            '<div class="fd-stat-row">' + stat("Round", "round") + stat("Score", "score") + "</div>" +
            '<p class="fd-q-prompt" data-out="q"></p>' +
            '<div class="fd-q-options" data-opts></div>' +
            '<p class="fd-q-feedback" data-out="fb"></p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-next style="display:none">Next →</button></div>';

        const optsEl = root.querySelector("[data-opts]");
        const nextBtn = root.querySelector("[data-next]");

        function show() {

            const n = state.rounds.length;

            if (state.i >= n) {

                out(root, "q", "Done! You got " + state.score + " of " + n + ".");
                optsEl.innerHTML = "";
                out(root, "fb", state.score >= 5 ? "You can pick the tool from the film. Thickness, quality, and the temperature limit choose it." : "The film, its thickness, and the temperature limit together pick the tool. Hit Reset to try again.");
                nextBtn.style.display = "none";
                out(root, "round", "done");
                out(root, "score", state.score + " / " + n);

                F.reward("chip-toolmatch-done", 15, "You matched tools to films");

                return;
            }

            const r = state.rounds[state.i];

            state.answered = false;

            out(root, "round", (state.i + 1) + " of " + n);
            out(root, "score", state.score + " / " + n);
            out(root, "q", r.q);
            out(root, "fb", "Which tool fits best?");
            nextBtn.style.display = "none";

            optsEl.innerHTML = tools.map(function (o) {
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

            pickRounds();
            show();
        });

        pickRounds();
        show();
    };


    /* ======================================
       UNIT 14: SPIN COATING
    ====================================== */

    SIMS["chip-spin"] = function (root) {

        const K = { thin: 4382, std: 21909, thick: 109545 };
        const NAMES = { thin: "Thin resist", std: "Standard resist", thick: "Thick resist" };
        const defaults = { rpm: 3000, visc: "std" };
        const state = { rpm: 3000, visc: "std" };

        root.innerHTML =
            head("Try it: spin on the resist") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="360" role="img" aria-label="Left: a wafer seen from above, spinning while a drop of resist spreads into a film. Right: a chart of resist thickness against spin speed, which falls as speed rises"></canvas>' +
            '<div class="fd-stat-row">' + stat("Film thickness", "thick") + stat("Spin speed", "rpm") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="use"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-drop>💧 Dispense again</button></div>' +
            seg("Resist", "visc", [["thin", "Thin"], ["std", "Standard"], ["thick", "Thick"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Spin speed (rpm)", key: "rpm", min: 500, max: 6000, step: 100, value: 3000 }) +
            "</div>" +
            '<p class="fd-sim-formula">Thickness falls roughly as 1 ÷ √(spin speed): spin four times faster for a film half as thick.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const CX = 175;
        const CY = 180;
        const R = 140;

        let t = 0;
        let angle = 0;
        let flung = [];

        function thick(rpm, visc) { return K[visc] / Math.sqrt(rpm); }

        function fmtT(nm) {

            return nm >= 1000 ? (nm / 1000).toFixed(2) + " µm" : Math.round(nm) + " nm";
        }

        function yOf(nm) {

            const y0 = 320;
            const y1 = 40;
            const l = (Math.log10(clamp(nm, 20, 10000)) - Math.log10(20)) / (Math.log10(10000) - Math.log10(20));

            return y0 - l * (y0 - y1);
        }

        function xOf(rpm) { return 410 + (rpm - 500) / 5500 * 240; }

        function update() {

            const nm = thick(state.rpm, state.visc);

            out(root, "thick", fmtT(nm));
            out(root, "rpm", state.rpm.toLocaleString() + " rpm");

            let use;

            if (nm < 80) {
                use = "About the thickness for EUV resist";
            } else if (nm < 600) {
                use = "A typical film for chip lithography";
            } else if (nm < 3000) {
                use = "A thick film, like those in packaging";
            } else {
                use = "Very thick: for MEMS and packaging";
            }

            out(root, "use", NAMES[state.visc] + ": " + use.toLowerCase().replace(/^./, function (c) { return c.toUpperCase(); }));
            setVal(root, "rpm", state.rpm.toLocaleString() + " rpm");

            if (nm < 60) {
                F.reward("chip-spin-thin", 5, "You spun a film thinner than 60 nm");
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 360);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 360);

            const nm = thick(state.rpm, state.visc);
            const lvl = (Math.log10(clamp(nm, 20, 10000)) - Math.log10(20)) / (Math.log10(10000) - Math.log10(20));

            // wafer
            ctx.fillStyle = "rgba(170,179,207,.4)";
            ctx.beginPath();
            ctx.arc(CX, CY, R, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(245,247,255,.5)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // resist film: starts as a drop, spreads outward
            const spread = clamp((t - 0.5) / 1.4, 0, 1);
            const rr = R * (0.04 + 0.96 * Math.pow(spread, 0.6));

            if (t > 0.5) {

                ctx.fillStyle = "rgba(255,105,120," + (0.22 + 0.5 * lvl).toFixed(2) + ")";
                ctx.beginPath();
                ctx.arc(CX, CY, rr, 0, Math.PI * 2);
                ctx.fill();
            }

            // the falling drop
            if (t < 0.5) {

                ctx.fillStyle = "rgba(255,105,120,.95)";
                ctx.beginPath();
                ctx.arc(CX, 20 + (CY - 20) * (t / 0.5), 6, 0, Math.PI * 2);
                ctx.fill();
            }

            // spokes show the spin
            ctx.strokeStyle = "rgba(245,247,255,.55)";
            ctx.lineWidth = 2;

            for (let k = 0; k < 6; k++) {

                const a = angle + k * Math.PI / 3;

                ctx.beginPath();
                ctx.moveTo(CX + Math.cos(a) * 14, CY + Math.sin(a) * 14);
                ctx.lineTo(CX + Math.cos(a) * (R - 6), CY + Math.sin(a) * (R - 6));
                ctx.stroke();
            }

            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.beginPath();
            ctx.arc(CX, CY, 5, 0, Math.PI * 2);
            ctx.fill();

            // excess resist flies off the edge
            ctx.fillStyle = "rgba(255,105,120,.85)";

            flung.forEach(function (f) {

                ctx.beginPath();
                ctx.arc(CX + Math.cos(f.a) * f.r, CY + Math.sin(f.a) * f.r, 2.2, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("wafer from above, spinning", CX, 352);

            // chart
            const x0 = 410;
            const x1 = 650;

            ctx.strokeStyle = "rgba(170,179,207,.6)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0, 40);
            ctx.lineTo(x0, 320);
            ctx.lineTo(x1, 320);
            ctx.stroke();

            ctx.font = "11px sans-serif";
            ctx.textAlign = "right";
            ctx.fillStyle = "rgba(170,179,207,.9)";

            [[50, "50 nm"], [100, "100 nm"], [1000, "1 µm"], [10000, "10 µm"]].forEach(function (tk) {

                const y = yOf(tk[0]);

                ctx.fillText(tk[1], x0 - 6, y + 4);
                ctx.strokeStyle = "rgba(170,179,207,.18)";
                ctx.beginPath();
                ctx.moveTo(x0, y);
                ctx.lineTo(x1, y);
                ctx.stroke();
            });

            ctx.textAlign = "center";
            ctx.fillText("spin speed (rpm)", (x0 + x1) / 2, 346);
            ctx.fillText("500", x0, 336);
            ctx.fillText("6000", x1, 336);

            Object.keys(K).forEach(function (v) {

                ctx.strokeStyle = v === state.visc ? "rgba(84,224,199,.95)" : "rgba(170,179,207,.35)";
                ctx.lineWidth = v === state.visc ? 2.4 : 1.2;
                ctx.beginPath();

                for (let r = 500; r <= 6000; r += 100) {

                    const px = xOf(r);
                    const py = yOf(thick(r, v));

                    if (r === 500) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
                }

                ctx.stroke();
            });

            ctx.fillStyle = "rgba(255,214,102,1)";
            ctx.beginPath();
            ctx.arc(xOf(state.rpm), yOf(nm), 6, 0, Math.PI * 2);
            ctx.fill();
        }

        function frame(dt) {

            t += dt;
            angle += dt * state.rpm / 1000 * 4;

            // fling droplets off the rim after the film has spread
            if (t > 1.2 && t < 3 && flung.length < 40 && Math.random() < dt * state.rpm / 300) {
                flung.push({ a: Math.random() * Math.PI * 2, r: R + 4, v: 80 + state.rpm / 20 });
            }

            flung.forEach(function (f) { f.r += f.v * dt; });
            flung = flung.filter(function (f) { return f.r < 290; });

            draw();
        }

        function dispense() {

            t = 0;
            flung = [];
        }

        root.querySelector("[data-drop]").addEventListener("click", dispense);

        wire(root, state, defaults, update);

        root.querySelectorAll("input[data-key],button[data-set]").forEach(function (el) {
            el.addEventListener(el.tagName === "INPUT" ? "input" : "click", function () { draw(); });
        });

        animate(root, frame);

        update();
        draw();
    };


    /* ======================================
       UNIT 14: POST-EXPOSURE BAKE TRADE-OFF
    ====================================== */

    SIMS["chip-peb"] = function (root) {

        const PITCH = 64;
        const defaults = { time: 60, temp: 100 };
        const state = { time: 60, temp: 100 };

        root.innerHTML =
            head("Try it: the post-exposure bake") +
            art("0 0 340 210", "Two repeating lines of light, the acid image after the bake spreads it out, and the resist lines left after development") +
            '<div class="fd-stat-row">' + stat("Chemical gain", "gain") + stat("Light needed", "dose") + stat("Image contrast", "con") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Bake time (s)", key: "time", min: 0, max: 90, step: 5, value: 60 }) +
            slider({ label: "Bake temperature (°C)", key: "temp", min: 80, max: 130, step: 5, value: 100 }) +
            "</div>" +
            '<p class="fd-sim-formula">Heat lets the acid spread and change many resist molecules, so less light is needed. But the acid also wanders sideways, which blurs the pattern.</p>';

        const svg = root.querySelector("svg");

        function model() {

            const r = Math.exp((state.temp - 100) / 20);
            const L = 8 * Math.sqrt(state.time / 60) * Math.exp((state.temp - 100) / 25);
            const C = Math.exp(-2 * Math.PI * Math.PI * L * L / (PITCH * PITCH));
            const G = 1 + 30 * (1 - Math.exp(-state.time * r / 45));
            const D = 150 / (1 + 0.2 * (G - 1));

            return { L: L, C: C, G: G, D: D };
        }

        function update() {

            const m = model();

            out(root, "gain", Math.round(m.G) + "×");
            out(root, "dose", Math.round(m.D) + " mJ/cm²");
            out(root, "con", Math.round(m.C * 100) + "%");
            setVal(root, "time", state.time + " s");
            setVal(root, "temp", state.temp + " °C");

            const chip = root.querySelector('[data-out="chip"]');
            let msg;
            let tone = "";
            let big;

            if (m.C < 0.55) {

                big = "Acid spread too far";
                msg = "✕ Too blurry";
                tone = "rose";

            } else if (m.D > 80) {

                big = "Not enough amplification";
                msg = "✕ Too slow: needs lots of light";
                tone = "rose";

            } else {

                big = "Sharp image, modest dose";
                msg = "✓ Sweet spot";
                F.reward("chip-peb-sweet", 10, "You found the bake sweet spot");
            }

            out(root, "verdict", big);

            chip.textContent = msg;
            chip.className = "fd-chip " + tone;

            // plot
            const px0 = 24;
            const px1 = 316;
            const py0 = 30;
            const py1 = 130;
            const span = PITCH * 2;

            let ideal = "";
            let blur = "";

            for (let i = 0; i <= 120; i++) {

                const x = i / 120 * span;
                const c = 0.5 + 0.5 * Math.cos(2 * Math.PI * x / PITCH);
                const b = 0.5 + 0.5 * m.C * Math.cos(2 * Math.PI * x / PITCH);
                const sx = (px0 + i / 120 * (px1 - px0)).toFixed(1);

                ideal += sx + "," + (py1 - c * (py1 - py0)).toFixed(1) + " ";
                blur += sx + "," + (py1 - b * (py1 - py0)).toFixed(1) + " ";
            }

            let s = "";

            s += '<line x1="' + px0 + '" y1="' + py1 + '" x2="' + px1 + '" y2="' + py1 + '" style="stroke:var(--muted)"/>';
            s += '<line x1="' + px0 + '" y1="' + ((py0 + py1) / 2) + '" x2="' + px1 + '" y2="' + ((py0 + py1) / 2) + '" style="stroke:rgba(255,214,102,.7);stroke-dasharray:3 3"/>';
            s += label(px1, (py0 + py1) / 2 - 3, "dissolves above this", 6, "end", "rgba(255,214,102,.9)");
            s += '<polyline points="' + ideal + '" style="fill:none;stroke:rgba(170,179,207,.6);stroke-dasharray:3 3;stroke-width:1.2"/>';
            s += '<polyline points="' + blur + '" style="fill:none;stroke:' + COL.spacer + ';stroke-width:2.2"/>';
            s += label(px0, 22, "acid after the bake (dashed: right after exposure)", 7, "start", "var(--text)");
            s += label(px0, py1 + 11, "position across two line-and-space pairs", 6.5, "start", "var(--muted)");

            // developed resist: where acid is below the line, the resist stays
            s += label(px0, 158, "resist left after development", 7, "start", "var(--text)");

            const barAlpha = clamp(m.C * 4, 0.12, 1);

            for (let k = 0; k < 2; k++) {

                const x0 = px0 + (k * PITCH + PITCH / 2) / span * (px1 - px0);
                const w = PITCH / 2 / span * (px1 - px0);

                s += rect(x0.toFixed(1), 165, w.toFixed(1), 26, "rgba(255,105,120," + (0.65 * barAlpha).toFixed(2) + ")", "rgba(255,105,120," + barAlpha.toFixed(2) + ")");
            }

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 16: STEP AND SCAN
    ====================================== */

    SIMS["chip-stepscan"] = function (root) {

        const defaults = { mode: "scan", mag: 4 };
        const state = { mode: "scan", mag: 4 };

        root.innerHTML =
            head("Watch it: step and scan") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="400" role="img" aria-label="Left: a reticle and wafer moving in opposite directions beneath a narrow slit of light. Right: a wafer map filling in field by field"></canvas>' +
            '<div class="fd-stat-row">' + stat("Reticle stage speed", "spd") + stat("Reticle size needed", "size") + stat("Fields done", "done") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            seg("Tool", "mode", [["scan", "Scanner"], ["step", "Stepper"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Reduction (×)", key: "mag", min: 1, max: 8, step: 0.5, value: 4 }) +
            "</div>" +
            '<p class="fd-sim-formula">The reticle moves as many times faster than the wafer as the reduction. The largest field is about 26 × 33 mm, so a 4× reticle pattern is about 104 × 132 mm.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const CX = 215;
        const FW = 40;       // field width on the wafer, px
        const PITCH = 52;    // spacing of fields along the strip
        const MAPX = 565;
        const MAPY = 200;
        const MAPR = 98;

        // wafer map fields
        const fields = [];
        const cols = 11;
        const rows = 9;
        const cw = 2 * MAPR / cols;
        const rh = 2 * MAPR / rows;

        for (let r = 0; r < rows; r++) {

            const row = [];

            for (let c = 0; c < cols; c++) {

                const fx = MAPX - MAPR + (c + 0.5) * cw;
                const fy = MAPY - MAPR + (r + 0.5) * rh;

                if (Math.hypot(fx - MAPX, fy - MAPY) < MAPR - 8) {
                    row.push({ x: fx, y: fy });
                }
            }

            if (r % 2 === 1) { row.reverse(); }

            row.forEach(function (f) { fields.push(f); });
        }

        const rr = mulberry(7);
        const chrome = [];

        for (let i = 0; i < 40; i++) {
            chrome.push([rr(), rr() * 0.7 + 0.1, rr() * 0.06 + 0.02]);
        }

        let t = 0;
        let idx = 0;
        const STEP_T = 0.7;
        const SCAN_T = 2.6;
        const FLASH_T = 0.5;

        function phaseInfo() {

            const total = STEP_T + (state.mode === "scan" ? SCAN_T : FLASH_T);
            const ph = t % total;

            if (ph < STEP_T) {
                return { kind: "step", f: ph / STEP_T };
            }

            return { kind: state.mode === "scan" ? "scan" : "flash", f: (ph - STEP_T) / (total - STEP_T) };
        }

        function update() {

            const spd = state.mag;
            const size = 33 * state.mag;

            out(root, "spd", spd.toFixed(1) + "× the wafer");
            out(root, "size", Math.round(size) + " mm");
            setVal(root, "mag", state.mag.toFixed(1) + "×");

            const chip = root.querySelector('[data-out="chip"]');

            if (size > 152) {

                out(root, "verdict", "Does not fit a 6-inch reticle");
                chip.textContent = "✕ Reticle too big";
                chip.className = "fd-chip rose";

            } else if (state.mag < 3.5) {

                out(root, "verdict", "Works, but the pattern is hard to draw");
                chip.textContent = "⚠ Less shrink";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", state.mag === 4 ? "The standard 4× reduction" : "Fits on a 6-inch reticle");
                chip.textContent = "✓ Practical";
                chip.className = "fd-chip";
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 400);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 400);

            const info = phaseInfo();
            const scan = state.mode === "scan";
            const Lr = FW * state.mag;
            const rY = 80;
            const wY = 290;

            // field index advances when a step phase begins a new cycle
            const total = STEP_T + (scan ? SCAN_T : FLASH_T);
            const cyc = Math.floor(t / total);

            idx = cyc % fields.length;

            // lamp
            ctx.fillStyle = "rgba(255,214,102,.95)";
            ctx.beginPath();
            ctx.arc(CX, 24, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("light", CX + 14, 28);

            // reticle plate and pattern
            let s = scan ? (info.kind === "scan" ? info.f : (info.kind === "step" ? 0 : 0)) : 0.5;

            if (scan && info.kind === "step") { s = 0; }

            const rc = scan ? CX + (s - 0.5) * Lr : CX;

            ctx.fillStyle = "rgba(120,180,255,.2)";
            ctx.fillRect(rc - Lr / 2, rY, Lr, 10);
            ctx.strokeStyle = "rgba(120,180,255,.8)";
            ctx.strokeRect(rc - Lr / 2, rY, Lr, 10);
            ctx.fillStyle = "rgba(20,24,40,.95)";

            chrome.forEach(function (c) {
                ctx.fillRect(rc - Lr / 2 + c[0] * Lr * 0.94, rY + 1, Math.max(2, c[2] * Lr * 0.3), 8);
            });

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.fillText("reticle", Math.max(10, rc - Lr / 2), rY - 8);

            // lens
            ctx.strokeStyle = "rgba(245,247,255,.8)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(CX, 175, 70, 11, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.fillText("lens (" + state.mag.toFixed(1) + "× smaller)", CX + 78, 179);

            // wafer strip with fields
            const target = scan ? CX + FW / 2 : CX;
            let fc;

            if (info.kind === "step") {
                fc = target + PITCH * (1 - info.f);
            } else if (scan && info.kind === "scan") {
                fc = target - info.f * FW;
            } else {
                fc = target;
            }

            ctx.fillStyle = "rgba(170,179,207,.35)";
            ctx.fillRect(10, wY, 420, 22);
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.fillText("wafer", 14, wY + 38);

            for (let k = -4; k <= 4; k++) {

                const x = fc + k * PITCH;
                const done = k < 0;

                if (x - FW / 2 < 10 || x + FW / 2 > 430) {
                    continue;
                }

                ctx.strokeStyle = "rgba(245,247,255,.6)";
                ctx.lineWidth = 1;

                if (done) {

                    ctx.fillStyle = "rgba(84,224,199,.55)";
                    ctx.fillRect(x - FW / 2, wY - 14, FW, 14);

                } else if (k === 0) {

                    let expW = 0;

                    if (scan && info.kind === "scan") { expW = info.f * FW; }
                    if (!scan && info.kind === "flash") { expW = FW; }

                    ctx.fillStyle = "rgba(84,224,199,.65)";
                    ctx.fillRect(x - FW / 2, wY - 14, expW, 14);
                }

                ctx.strokeRect(x - FW / 2, wY - 14, FW, 14);
            }

            // light beam
            const exposing = (scan && info.kind === "scan") || (!scan && info.kind === "flash");

            if (exposing) {

                ctx.fillStyle = "rgba(255,214,102,.28)";
                ctx.beginPath();

                if (scan) {

                    ctx.moveTo(CX - 5, rY + 10);
                    ctx.lineTo(CX + 5, rY + 10);
                    ctx.lineTo(CX + 2, wY - 14);
                    ctx.lineTo(CX - 2, wY - 14);

                } else {

                    ctx.moveTo(CX - Lr / 2, rY + 10);
                    ctx.lineTo(CX + Lr / 2, rY + 10);
                    ctx.lineTo(CX + FW / 2, wY - 14);
                    ctx.lineTo(CX - FW / 2, wY - 14);
                }

                ctx.closePath();
                ctx.fill();
            }

            if (scan) {

                // slit
                ctx.strokeStyle = "rgba(255,214,102,.9)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(CX - 5, rY - 4);
                ctx.lineTo(CX - 5, rY + 14);
                ctx.moveTo(CX + 5, rY - 4);
                ctx.lineTo(CX + 5, rY + 14);
                ctx.stroke();

                // direction arrows
                ctx.fillStyle = "rgba(255,105,120,.95)";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("reticle moves " + state.mag.toFixed(1) + "× faster →", CX, rY + 36);
                ctx.fillStyle = "rgba(84,224,199,.95)";
                ctx.fillText("← wafer moves the opposite way", CX, wY + 52);
            } else {

                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(info.kind === "flash" ? "whole field exposed at once" : "wafer steps to the next field", CX, wY + 52);
            }

            // wafer map
            ctx.strokeStyle = "rgba(245,247,255,.5)";
            ctx.fillStyle = "rgba(170,179,207,.22)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(MAPX, MAPY, MAPR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            fields.forEach(function (f, i) {

                if (i < idx) {
                    ctx.fillStyle = "rgba(84,224,199,.6)";
                } else if (i === idx) {
                    ctx.fillStyle = exposing ? "rgba(255,214,102,.95)" : "rgba(255,214,102,.4)";
                } else {
                    ctx.fillStyle = "rgba(245,247,255,.12)";
                }

                ctx.fillRect(f.x - cw / 2 + 1, f.y - rh / 2 + 1, cw - 2, rh - 2);
            });

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("wafer: one shot per field", MAPX, MAPY + MAPR + 22);

            out(root, "done", idx + " / " + fields.length);

            if (idx >= 12) {
                F.reward("chip-stepscan-watch", 5, "You watched the scanner cover the wafer");
            }
        }

        function frame(dt) {

            t += dt;

            draw();
        }

        wire(root, state, defaults, function () {

            t = 0;
            idx = 0;

            update();
            draw();
        });

        const anim = animate(root, frame);

        bindPause(root, anim);

        update();
        draw();
    };


    /* ======================================
       UNIT 16: OVERLAY
    ====================================== */

    SIMS["chip-overlay"] = function (root) {

        const defaults = { cd: 30, dx: 0, dy: 0 };
        const state = { cd: 30, dx: 0, dy: 0 };
        const uid = "ovl" + Math.floor(Math.random() * 1e6);

        root.innerHTML =
            head("Try it: land the via on the pad") +
            art("0 0 340 210", "A top view of a square metal pad on the lower layer and a via from the upper layer, which can be shifted off the pad") +
            '<div class="fd-stat-row">' + stat("Shift", "shift") + stat("Room each way", "slack") + stat("Via on the pad", "cover") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-align>🎯 Align with the marks</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Via size (nm)", key: "cd", min: 10, max: 60, step: 1, value: 30 }) +
            slider({ label: "Shift sideways (nm)", key: "dx", min: -20, max: 20, step: 0.5, value: 0 }) +
            slider({ label: "Shift up or down (nm)", key: "dy", min: -20, max: 20, step: 0.5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">The pad is 1.5× the via, so the via can drift only a quarter of its own size before it hangs off. The smaller the feature, the tighter the overlay.</p>';

        const svg = root.querySelector("svg");
        const rand = mulberry(Date.now() % 100000);

        function update() {

            const cd = state.cd;
            const padW = 1.5 * cd;
            const slack = (padW - cd) / 2;
            const scale = 60 / cd;
            const cx = 170;
            const cy = 100;

            const px = cx - padW * scale / 2;
            const py = cy - padW * scale / 2;
            const vx = cx + state.dx * scale - cd * scale / 2;
            const vy = cy + state.dy * scale - cd * scale / 2;

            // overlap area as a fraction of the via
            const ox = Math.max(0, Math.min(vx + cd * scale, px + padW * scale) - Math.max(vx, px));
            const oy = Math.max(0, Math.min(vy + cd * scale, py + padW * scale) - Math.max(vy, py));
            const cover = ox * oy / (cd * scale * cd * scale);

            let s = "";

            s += '<defs><clipPath id="' + uid + '"><rect x="' + px + '" y="' + py + '" width="' + (padW * scale) + '" height="' + (padW * scale) + '"/></clipPath></defs>';
            s += rect(px.toFixed(1), py.toFixed(1), (padW * scale).toFixed(1), (padW * scale).toFixed(1), "rgba(255,214,102,.45)", "rgba(255,214,102,.95)");
            s += label(cx, py - 6, "metal pad (lower layer)", 7, "middle", "rgba(255,214,102,.95)");
            s += rect(vx.toFixed(1), vy.toFixed(1), (cd * scale).toFixed(1), (cd * scale).toFixed(1), "rgba(255,105,120,.6)", "rgba(255,105,120,.95)");
            s += '<g clip-path="url(#' + uid + ')">' + rect(vx.toFixed(1), vy.toFixed(1), (cd * scale).toFixed(1), (cd * scale).toFixed(1), "rgba(84,224,199,.7)", "none") + "</g>";
            s += rect(vx.toFixed(1), vy.toFixed(1), (cd * scale).toFixed(1), (cd * scale).toFixed(1), "none", "rgba(245,247,255,.9)");
            s += label(cx, 196, "via from the upper layer: teal where it lands on the pad, red where it hangs off", 6.5, "middle", "var(--muted)");

            svg.innerHTML = s;

            const shift = Math.max(Math.abs(state.dx), Math.abs(state.dy));

            out(root, "shift", state.dx.toFixed(1) + ", " + state.dy.toFixed(1) + " nm");
            out(root, "slack", "±" + slack.toFixed(1) + " nm");
            out(root, "cover", Math.round(cover * 100) + "%");
            setVal(root, "cd", cd + " nm");
            setVal(root, "dx", state.dx.toFixed(1) + " nm");
            setVal(root, "dy", state.dy.toFixed(1) + " nm");

            ["dx", "dy", "cd"].forEach(function (k) {

                const inp = root.querySelector('input[data-key="' + k + '"]');

                if (inp && document.activeElement !== inp) {
                    inp.value = state[k];
                }
            });

            const chip = root.querySelector('[data-out="chip"]');

            if (shift > slack) {

                out(root, "verdict", "The via hangs off the pad");
                chip.textContent = "✕ Poor contact or a short";
                chip.className = "fd-chip rose";

            } else if (shift > slack * 0.6) {

                out(root, "verdict", "Right at the limit");
                chip.textContent = "⚠ Marginal";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Well aligned");
                chip.textContent = "✓ Within the overlay budget";
                chip.className = "fd-chip";
            }
        }

        root.querySelector("[data-align]").addEventListener("click", function () {

            const slack = state.cd * 0.25;

            state.dx = Math.round((rand() - 0.5) * slack * 0.5 * 20) / 20;
            state.dy = Math.round((rand() - 0.5) * slack * 0.5 * 20) / 20;

            update();

            F.reward("chip-overlay-align", 10, "You aligned with the marks");
        });

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 17: SELF-ALIGNED DOUBLE PATTERNING
    ====================================== */

    SIMS["chip-sadp"] = function (root) {

        const steps = [
            { t: "1 · Print the mandrels", text: "Lithography prints a coarse pattern: lines 20 nm wide every 80 nm." },
            { t: "2 · Deposit the spacer film", text: "A thin film coats the mandrels evenly on the tops, sides, and floor." },
            { t: "3 · Etch the spacer back", text: "A plasma etch removes the film from the flat parts and leaves a spacer on every sidewall." },
            { t: "4 · Remove the mandrels", text: "The mandrels are stripped. The spacers remain: twice as many lines, at half the pitch." },
            { t: "5 · Etch into the film", text: "The spacers act as the mask, and the pattern is etched into the film below." }
        ];

        const defaults = { step: 0, sp: 20 };
        const state = { step: 0, sp: 20, playing: true, t: 0 };

        root.innerHTML =
            head("Watch it: double the lines with a spacer") +
            art("0 0 340 200", "Side view of mandrels, a spacer film wrapped around them, spacers on the sidewalls, and the final doubled line pattern") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-play>⏸ Pause</button>' +
            steps.map(function (s, i) { return '<button type="button" class="fd-sim-btn" data-stepbtn="' + i + '">' + (i + 1) + "</button>"; }).join("") +
            "</div>" +
            '<div class="fd-sim-controls">' +
            slider({ label: "Spacer thickness (nm)", key: "sp", min: 12, max: 28, step: 1, value: 20 }) +
            "</div>" +
            '<p class="fd-sim-formula">With a spacer exactly as thick as the mandrel, the lines come out evenly spaced. Any difference makes the gaps alternate wide and narrow.</p>';

        const svg = root.querySelector("svg");
        const playBtn = root.querySelector("[data-play]");

        function render() {

            const sp = state.sp;
            const step = state.step;
            const X0 = 10;
            const per = 80;
            const mw = 20;
            const off = 30;
            const top = 100;
            const fy = 140;

            let s = rect(10, 156, 320, 24, COL.si);

            if (step < 4) {
                s += rect(10, fy, 320, 16, COL.film);
            }

            for (let k = 0; k < 4; k++) {

                const m0 = X0 + per * k + off;

                if (step === 1) {

                    // conformal film over the mandrel, sidewalls and floor
                    s += rect(m0 - sp, top - sp, mw + 2 * sp, 40 + sp, COL.spacer);
                }

                if (step <= 1) {
                    s += rect(m0, top, mw, 40, COL.mand, "rgba(120,180,255,.9)");
                }

                if (step === 2 || step === 3) {

                    s += rect(m0 - sp, top, sp, 40, COL.spacer) + rect(m0 + mw, top, sp, 40, COL.spacer);

                    if (step === 2) {
                        s += rect(m0, top, mw, 40, COL.mand, "rgba(120,180,255,.9)");
                    }
                }

                if (step === 4) {

                    s += rect(m0 - sp, fy, sp, 16, COL.film, "rgba(255,214,102,.95)") + rect(m0 + mw, fy, sp, 16, COL.film, "rgba(255,214,102,.95)");
                }
            }

            if (step === 1) {
                s += rect(10, fy - sp, 320, sp, COL.spacer);
                for (let k = 0; k < 4; k++) {
                    const m0 = X0 + per * k + off;
                    s += rect(m0, top, mw, 40, COL.mand, "rgba(120,180,255,.9)");
                }
            }

            const A = mw;                 // space inside the old mandrel
            const B = per - mw - 2 * sp;  // space across the old gap
            const even = Math.abs(A - B) <= 1.5;

            // annotations
            if (step === 0) {

                s += '<line x1="' + (X0 + off) + '" y1="86" x2="' + (X0 + per + off) + '" y2="86" style="stroke:rgba(245,247,255,.8)"/>';
                s += label(X0 + off + per / 2, 80, "pitch 80 nm", 7, "middle");
            }

            if (step >= 3) {

                s += label(X0 + off + mw / 2, 80, "gap " + A + " nm", 7, "middle", "rgba(255,214,102,.95)");
                s += label(X0 + off + mw + sp + B / 2, 80, B > 0 ? "gap " + B + " nm" : "merged", 7, "middle", even ? "rgba(255,214,102,.95)" : "rgba(255,105,120,1)");
            }

            svg.innerHTML = s + legend([["spacer", COL.spacer], ["mandrel", COL.mand], ["film to pattern", COL.film]], 194);

            out(root, "title", steps[step].t);
            out(root, "text", steps[step].text);

            const chip = root.querySelector('[data-out="chip"]');

            if (step >= 3) {

                if (even) {

                    chip.textContent = "✓ Even pitch: 40 nm";
                    chip.className = "fd-chip";

                    if (step === 4) {
                        F.reward("chip-sadp-even", 10, "You doubled the line density");
                    }

                } else {

                    chip.textContent = "✕ Gaps alternate: " + A + " and " + B + " nm";
                    chip.className = "fd-chip rose";
                }

            } else {

                chip.textContent = step === 0 ? "pitch 80 nm" : "building the spacers";
                chip.className = "fd-chip gold";
            }

            setVal(root, "sp", sp + " nm");

            root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {
                b.classList.toggle("on", parseInt(b.dataset.stepbtn, 10) === state.step);
            });
        }

        animate(root, function (dt) {

            if (!state.playing) {
                return;
            }

            state.t += dt;

            if (state.t > 2.6) {

                state.t = 0;
                state.step = (state.step + 1) % 5;

                render();
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

                render();
            });
        });

        wire(root, state, defaults, function () {

            state.playing = false;
            playBtn.textContent = "▶ Play";

            render();
        });

        render();
    };


    /* ======================================
       UNIT 17: MAKING EUV LIGHT
    ====================================== */

    SIMS["chip-euv"] = function (root) {

        const defaults = { rate: 50, pre: 1 };
        const state = { rate: 50, pre: 1 };

        root.innerHTML =
            head("Watch it: a tin droplet becomes light") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="440" role="img" aria-label="Tin droplets falling past two laser pulses: a pre-pulse flattens each droplet and a main pulse turns it into a hot plasma that gives off EUV light collected by a curved mirror"></canvas>' +
            '<div class="fd-stat-row">' + stat("Droplets per second", "dps") + stat("Light made", "pow") + stat("Reaches the wafer", "wafer") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            seg("Lasers", "pre", [["1", "Pre-pulse + main pulse"], ["0", "Main pulse only"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Droplets per second (thousands)", key: "rate", min: 10, max: 50, step: 5, value: 50 }) +
            "</div>" +
            '<p class="fd-sim-formula">Shown in slow motion. A first laser pulse flattens the droplet into a pancake so the second pulse can turn much more of it into plasma.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const PX = 380;
        const Y1 = 165;   // pre-pulse
        const Y2 = 260;   // main pulse
        const FX = 110;   // intermediate focus
        const FY = 395;
        const CCX = 240;
        const CR = 250;

        let drops = [];
        let bursts = [];
        let beams = [];
        let spawn = 0;
        let t = 0;

        function factor() { return state.pre ? 1 : 0.3; }

        function update() {

            const power = state.rate * 1000 * 0.005 * factor();

            out(root, "dps", (state.rate * 1000).toLocaleString());
            out(root, "pow", Math.round(power) + " W");
            out(root, "wafer", "about " + (power * 0.03).toFixed(1) + " W");
            setVal(root, "rate", state.rate + " thousand");

            const chip = root.querySelector('[data-out="chip"]');

            if (state.pre) {

                out(root, "verdict", "Flattened first, then vaporized");
                chip.textContent = "✓ Bright, efficient";
                chip.className = "fd-chip";

                if (state.rate >= 50) {
                    F.reward("chip-euv-full", 10, "You ran the source at full rate");
                }

            } else {

                out(root, "verdict", "A small droplet makes little light");
                chip.textContent = "✕ Dim and messy";
                chip.className = "fd-chip rose";
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 440);
            ctx.fillStyle = "rgba(6,10,24,.6)";
            ctx.fillRect(0, 0, 680, 440);

            // collector mirror
            ctx.strokeStyle = "rgba(170,230,255,.95)";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(CCX, 250, CR, -0.7, 0.7);
            ctx.stroke();
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("collector mirror", 450, 92);

            // droplet generator and catcher
            ctx.fillStyle = "rgba(170,179,207,.6)";
            ctx.fillRect(PX - 16, 8, 32, 18);
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.fillText("tin droplets", PX + 24, 22);
            ctx.fillStyle = "rgba(170,179,207,.5)";
            ctx.fillRect(PX - 22, 418, 44, 14);
            ctx.fillText("tin catcher", PX + 30, 430);

            // lasers
            ctx.font = "12px sans-serif";

            if (state.pre) {

                ctx.fillStyle = "rgba(255,105,120,.9)";
                ctx.fillText("pre-pulse laser", 8, Y1 - 6);
                ctx.fillRect(0, Y1 - 1, 24, 2);
            }

            ctx.fillStyle = "rgba(255,170,90,.95)";
            ctx.fillText("main CO₂ laser", 8, Y2 - 6);
            ctx.fillRect(0, Y2 - 1, 24, 2);

            // laser beams when they fire
            beams.forEach(function (b) {

                ctx.strokeStyle = "rgba(" + b.c + "," + (b.life * 2).toFixed(2) + ")";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, b.y);
                ctx.lineTo(PX, b.y);
                ctx.stroke();
            });

            // droplets
            drops.forEach(function (d) {

                let rx = 5;
                let ry = 5;

                if (state.pre && d.y > Y1) {

                    const f = clamp((d.y - Y1) / (Y2 - Y1), 0, 1);

                    rx = 5 + 24 * f;
                    ry = 5 - 2.6 * f;
                }

                ctx.fillStyle = "rgba(200,205,225,.95)";
                ctx.beginPath();
                ctx.ellipse(PX, d.y, rx, ry, 0, 0, Math.PI * 2);
                ctx.fill();
            });

            // plasma bursts and light
            bursts.forEach(function (b) {

                const a = clamp(b.life, 0, 1);
                const r = 6 + (1 - a) * 22;
                const g = ctx.createRadialGradient(PX, Y2, 0, PX, Y2, r * 2);

                g.addColorStop(0, "rgba(220,170,255," + (0.95 * a * b.k).toFixed(2) + ")");
                g.addColorStop(1, "rgba(120,60,255,0)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(PX, Y2, r * 2, 0, Math.PI * 2);
                ctx.fill();

                // rays to the collector and then to the focus
                ctx.lineWidth = 1.4;

                for (let k = 0; k < 9; k++) {

                    const ang = -0.65 + k * 0.1625;
                    const hx = CCX + CR * Math.cos(ang);
                    const hy = 250 + CR * Math.sin(ang);

                    ctx.strokeStyle = "rgba(200,140,255," + (0.7 * a * b.k).toFixed(2) + ")";
                    ctx.beginPath();
                    ctx.moveTo(PX, Y2);
                    ctx.lineTo(hx, hy);
                    ctx.stroke();

                    ctx.strokeStyle = "rgba(140,230,255," + (0.8 * a * b.k).toFixed(2) + ")";
                    ctx.beginPath();
                    ctx.moveTo(hx, hy);
                    ctx.lineTo(FX, FY);
                    ctx.stroke();
                }

                // debris when the droplet is not flattened first
                if (b.k < 0.5) {

                    ctx.fillStyle = "rgba(200,205,225," + (0.8 * a).toFixed(2) + ")";

                    for (let k = 0; k < 8; k++) {
                        ctx.beginPath();
                        ctx.arc(PX + Math.cos(k * 0.79) * (1 - a) * 60, Y2 + Math.sin(k * 0.79) * (1 - a) * 60, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });

            // intermediate focus
            ctx.strokeStyle = "rgba(140,230,255,.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(FX, FY, 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.textAlign = "left";
            ctx.fillText("to the scanner (13.5 nm light)", FX + 14, FY + 4);
        }

        function frame(dt) {

            t += dt;

            const speed = 70 + state.rate * 2.2;

            spawn += dt * speed;

            if (spawn >= 110) {

                spawn = 0;
                drops.push({ y: 34, pre: false, main: false });
            }

            drops.forEach(function (d) {

                d.y += speed * dt;

                if (state.pre && !d.pre && d.y >= Y1) {

                    d.pre = true;
                    beams.push({ y: Y1, c: "255,105,120", life: 0.5 });
                }

                if (!d.main && d.y >= Y2) {

                    d.main = true;
                    beams.push({ y: Y2, c: "255,170,90", life: 0.5 });
                    bursts.push({ life: 1, k: factor() });
                }
            });

            drops = drops.filter(function (d) { return d.y < 410 && !d.main; });

            bursts.forEach(function (b) { b.life -= dt * 2.6; });
            bursts = bursts.filter(function (b) { return b.life > 0; });
            beams.forEach(function (b) { b.life -= dt; });
            beams = beams.filter(function (b) { return b.life > 0; });

            draw();
        }

        wire(root, state, defaults, update);

        const anim = animate(root, frame);

        bindPause(root, anim);

        update();
        draw();
    };


    /* ======================================
       UNIT 18: FOCUS-EXPOSURE PROCESS WINDOW
    ====================================== */

    SIMS["chip-window"] = function (root) {

        const defaults = { con: 1, fo: 0, dd: 0, sig: 1.2 };
        const state = { con: 1, fo: 0, dd: 0, sig: 1.2 };
        const rand = mulberry(Date.now() % 100000);

        let dots = [];

        root.innerHTML =
            head("Try it: find the process window") +
            art("0 0 340 210", "A grid of printed test results across focus and exposure dose values. Green cells keep the line width in spec, red cells do not, and the shape of the green region is the process window") +
            '<div class="fd-stat-row">' + stat("Window size", "win") + stat("Line width now", "cd") + stat("Wafers in spec", "yield") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-run>🎲 Run 50 wafers</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Image quality (contrast)", key: "con", min: 0.5, max: 1.5, step: 0.1, value: 1 }) +
            slider({ label: "Focus drift", key: "fo", min: -4, max: 4, step: 0.25, value: 0 }) +
            slider({ label: "Dose drift", key: "dd", min: -4, max: 4, step: 0.25, value: 0 }) +
            slider({ label: "Process variation", key: "sig", min: 0.5, max: 2.5, step: 0.1, value: 1.2 }) +
            "</div>" +
            '<p class="fd-sim-formula">Each cell is one test exposure at a different focus and dose. Green means the line width stays within ±10% of the target. A bigger green area means the process tolerates real-world drift.</p>';

        const svg = root.querySelector("svg");

        function cdAt(f, d) {

            return 1 - 0.04 * d + (0.012 / state.con) * f * f;
        }

        function inSpec(f, d) {

            // line width within 10%, focus inside the usable depth, and dose inside the exposure latitude
            return Math.abs(cdAt(f, d) - 1) <= 0.1 && Math.abs(f) <= 1.8 + 1.4 * state.con && Math.abs(d) <= 2.6;
        }

        function update() {

            let n = 0;
            let s = "";
            const cell = 18;
            const gx = 30;
            const gy = 22;

            for (let i = -4; i <= 4; i++) {

                for (let j = -4; j <= 4; j++) {

                    const ok = inSpec(i, j);

                    if (ok) { n++; }

                    s += rect(gx + (i + 4) * cell + 1, gy + (j + 4) * cell + 1, cell - 2, cell - 2, ok ? "rgba(84,224,199,.6)" : "rgba(255,105,120,.25)");
                }
            }

            s += label(gx + 4.5 * cell, 14, "focus →", 7, "middle", "var(--muted)");
            s += '<text x="12" y="' + (gy + 4.5 * cell) + '" text-anchor="middle" transform="rotate(-90 12 ' + (gy + 4.5 * cell) + ')" style="font-size:7px;fill:var(--muted)">dose ↓</text>';

            // operating points
            dots.forEach(function (p) {

                const ok = inSpec(p[0], p[1]);

                s += '<circle cx="' + (gx + (p[0] + 4.5) * cell).toFixed(1) + '" cy="' + (gy + (p[1] + 4.5) * cell).toFixed(1) + '" r="2.3" style="fill:' + (ok ? "#ffffff" : "rgba(255,105,120,1)") + ';stroke:rgba(6,10,24,.8);stroke-width:.6"/>';
            });

            const nowX = gx + (clamp(state.fo, -4, 4) + 4.5) * cell;
            const nowY = gy + (clamp(state.dd, -4, 4) + 4.5) * cell;

            s += '<circle cx="' + nowX + '" cy="' + nowY + '" r="6" style="fill:none;stroke:rgba(255,214,102,1);stroke-width:2"/>';

            // legend on the right
            s += rect(212, 40, 10, 10, "rgba(84,224,199,.6)") + label(228, 48, "line width in spec", 7, "start", "var(--text)");
            s += rect(212, 58, 10, 10, "rgba(255,105,120,.25)") + label(228, 66, "out of spec", 7, "start", "var(--text)");
            s += '<circle cx="217" cy="85" r="5" style="fill:none;stroke:rgba(255,214,102,1);stroke-width:2"/>' + label(228, 88, "where the process sits now", 7, "start", "var(--text)");
            s += '<circle cx="217" cy="105" r="2.3" style="fill:#fff"/>' + label(228, 108, "one test wafer", 7, "start", "var(--text)");

            svg.innerHTML = s;

            const now = inSpec(state.fo, state.dd);
            const cdNow = cdAt(state.fo, state.dd);

            out(root, "win", Math.round(n / 81 * 100) + "% of the grid");
            out(root, "cd", (cdNow * 100).toFixed(0) + "% of target");
            setVal(root, "con", state.con.toFixed(1));
            setVal(root, "fo", state.fo.toFixed(2));
            setVal(root, "dd", state.dd.toFixed(2));
            setVal(root, "sig", state.sig.toFixed(1));

            if (dots.length) {

                const good = dots.filter(function (p) { return inSpec(p[0], p[1]); }).length;

                out(root, "yield", Math.round(good / dots.length * 100) + "%");

            } else {

                out(root, "yield", "run some");
            }

            const chip = root.querySelector('[data-out="chip"]');

            out(root, "verdict", now ? "This setting prints in spec" : "This setting prints out of spec");
            chip.textContent = now ? "✓ Inside the window" : "✕ Outside the window";
            chip.className = "fd-chip " + (now ? "" : "rose");

            ["fo", "dd"].forEach(function (k) {

                const inp = root.querySelector('input[data-key="' + k + '"]');

                if (inp && document.activeElement !== inp) {
                    inp.value = state[k];
                }
            });
        }

        root.querySelector("[data-run]").addEventListener("click", function () {

            dots = [];

            for (let i = 0; i < 50; i++) {
                dots.push([clamp(gauss(rand) * state.sig, -4.4, 4.4), clamp(gauss(rand) * state.sig, -4.4, 4.4)]);
            }

            update();

            const good = dots.filter(function (p) { return inSpec(p[0], p[1]); }).length;

            F.reward("chip-window-run", 5, "You ran a batch of wafers");

            if (good / dots.length >= 0.9) {
                F.reward("chip-window-good", 10, "You got 90% of wafers in spec");
            }
        });

        wire(root, state, defaults, function () {

            dots = [];
            update();
        });

        update();
    };


    /* ======================================
       UNIT 18: PHOTON SHOT NOISE
    ====================================== */

    SIMS["chip-stochastic"] = function (root) {

        const EV = { arf: 6.42, euv: 91.8 };
        const defaults = { lam: "euv", dose: 30 };
        const state = { lam: "euv", dose: 30 };

        root.innerHTML =
            head("Try it: too few photons") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="440" role="img" aria-label="A grid of tiny spots on the resist colored by how many photons each one received, with red spots receiving too few or too many, and below it a printed line edge that wobbles with the noise"></canvas>' +
            '<div class="fd-stat-row">' + stat("Photons per 5 nm spot", "n") + stat("Random variation", "sd") + stat("Defective spots", "bad") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-again>🔁 Expose again</button></div>' +
            seg("Light", "lam", [["arf", "193 nm (ArF)"], ["euv", "13.5 nm (EUV)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Dose (mJ/cm²)", key: "dose", min: 5, max: 100, step: 5, value: 30 }) +
            "</div>" +
            '<p class="fd-sim-formula">An EUV photon carries about 14× the energy of a 193 nm photon, so the same dose holds about 14× fewer photons. Random counting noise grows as 1 ÷ √(photons).</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const COLS = 36;
        const ROWS = 22;
        const CS = 12;
        const GX = 20;
        const GY = 16;

        let rand = mulberry(Date.now() % 100000);
        let noise = [];
        let edge = [];

        function sample() {

            noise = [];

            for (let i = 0; i < COLS * ROWS; i++) {
                noise.push(gauss(rand));
            }

            edge = [];

            let v = 0;

            for (let i = 0; i < 72; i++) {

                v = v * 0.55 + gauss(rand) * 0.85;
                edge.push(v);
            }
        }

        function meanPhotons() {

            // dose in J/cm2 times a 5 nm x 5 nm area in cm2, divided by the photon energy in J
            return state.dose * 1e-3 * 2.5e-13 / (EV[state.lam] * 1.602e-19);
        }

        function stats() {

            const N = meanPhotons();
            const sd = 1 / Math.sqrt(N);

            let bad = 0;

            for (let i = 0; i < noise.length; i++) {

                if (Math.abs(noise[i] * sd) > 0.1) { bad++; }
            }

            return { N: N, sd: sd, bad: bad };
        }

        function update() {

            const st = stats();

            out(root, "n", st.N >= 100000 ? sci(st.N) : Math.round(st.N).toLocaleString());
            out(root, "sd", (st.sd * 100).toFixed(1) + "%");
            out(root, "bad", st.bad + " of " + noise.length);
            setVal(root, "dose", state.dose + " mJ/cm²");

            const chip = root.querySelector('[data-out="chip"]');

            if (st.bad === 0) {

                out(root, "verdict", "Plenty of photons: a clean print");
                chip.textContent = "✓ No defective spots";
                chip.className = "fd-chip";

            } else if (st.bad <= 40) {

                out(root, "verdict", "A few random defects");
                chip.textContent = "⚠ Stochastic defects";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Far too noisy to print");
                chip.textContent = "✕ Many defects";
                chip.className = "fd-chip rose";
            }

            if (state.lam === "euv" && st.bad >= 12) {
                F.reward("chip-stoch-see", 5, "You saw EUV shot noise");
            }

            draw(st);
        }

        function draw(st) {

            ctx.clearRect(0, 0, 680, 440);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 440);

            for (let r = 0; r < ROWS; r++) {

                for (let c = 0; c < COLS; c++) {

                    const dev = noise[r * COLS + c] * st.sd;
                    const bad = Math.abs(dev) > 0.1;

                    if (bad) {
                        ctx.fillStyle = dev < 0 ? "rgba(255,105,120,.95)" : "rgba(255,170,90,.95)";
                    } else {
                        ctx.fillStyle = "rgba(84,224,199," + (0.4 + clamp(dev * 3, -0.25, 0.25)).toFixed(2) + ")";
                    }

                    ctx.fillRect(GX + c * CS + 1, GY + r * CS + 1, CS - 2, CS - 2);
                }
            }

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("each square is a 5 nm spot: red got too few photons, orange too many", GX, GY + ROWS * CS + 18);

            // printed line edge
            const ey = 372;

            ctx.strokeStyle = "rgba(170,179,207,.6)";
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(GX, ey);
            ctx.lineTo(GX + COLS * CS, ey);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.strokeStyle = "rgba(255,214,102,.95)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            edge.forEach(function (v, i) {

                const x = GX + i / (edge.length - 1) * COLS * CS;
                const y = ey + clamp(v * st.sd * 260, -34, 34);

                if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
            });

            ctx.stroke();

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.fillText("the printed edge of a line: the wobble is line-edge roughness", GX, 428);
        }

        root.querySelector("[data-again]").addEventListener("click", function () {

            sample();
            update();
        });

        sample();
        wire(root, state, defaults, update);
        update();
    };


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="chip-"]').forEach(F.mount);

})();
