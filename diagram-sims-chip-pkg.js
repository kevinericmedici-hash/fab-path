/* ========================================
   SAND TO CHIP: PACKAGING, TEST, RELIABILITY, AND THE INDUSTRY

   Unit 37: why test the die before packaging.
   Unit 38: wire bonding versus flip-chip assembly.
   Unit 39: how many pins fit each package type.
   Unit 41: package heat, and the bathtub curve.
   Unit 42: chiplets and yield.
   Unit 43: business model sorting game.
   Unit 44: how long a fab takes to pay for itself.
   Unit 45: what happens when a supplier goes down.
   Unit 46: the design flow and its checking loop.
   Unit 48: which role fits you.

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

    function money(v) {

        if (v >= 1e9) { return "$" + (v / 1e9).toFixed(1) + " billion"; }
        if (v >= 1e6) { return "$" + (v / 1e6).toFixed(1) + " million"; }
        if (v >= 1000) { return "$" + Math.round(v).toLocaleString(); }
        if (v >= 10) { return "$" + v.toFixed(0); }

        return "$" + v.toFixed(2);
    }

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

                        if (correct) { state.score++; }

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


    /* ======================================
       UNIT 37: TEST BEFORE YOU PACKAGE
    ====================================== */

    SIMS["chip-pkgflow"] = function (root) {

        const defaults = { sort: "yes", y: 85 };
        const state = { sort: "yes", y: 85 };
        const DIE = 500;
        const PKG = 3;
        const TEST = 1;

        root.innerHTML =
            head("Try it: what if you skip the wafer test?") +
            art("0 0 340 170", "Three bars: the die on the wafer split into good and bad, the die sent to packaging, and the chips that ship") +
            '<div class="fd-stat-row">' + stat("Bad die packaged", "bad") + stat("Packaging money wasted", "waste") + stat("Packaging cost per shipped chip", "per") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            seg("Test each die on the wafer first?", "sort", [["yes", "Yes: wafer sort"], ["no", "No: package everything"]]) +
            '<div class="fd-sim-controls">' +
            F.slider({ label: "Wafer yield (%)", key: "y", min: 50, max: 98, step: 1, value: 85 }) +
            "</div>" +
            '<p class="fd-sim-formula">Illustrative: 500 die per wafer, $3 to package a die, $1 for final test. A chip is tested twice: once bare on the wafer, and once again, finished, in its package.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const good = Math.round(DIE * state.y / 100);
            const bad = DIE - good;
            const sort = state.sort === "yes";
            const packaged = sort ? good : DIE;
            const shipped = Math.round(good * 0.98);
            const wasted = sort ? 0 : bad * (PKG + TEST);
            const total = packaged * (PKG + TEST);

            const sc = 230 / DIE;
            let s = "";

            s += label(14, 24, "On the wafer", 7.5, "start");
            s += rect(14, 30, good * sc, 18, "rgba(84,224,199,.7)", "rgba(84,224,199,1)") + rect(14 + good * sc, 30, bad * sc, 18, "rgba(255,105,120,.7)", "rgba(255,105,120,1)");
            s += label(14 + DIE * sc + 6, 43, DIE + " die", 7, "start", "var(--muted)");

            s += label(14, 72, sort ? "Sent to packaging (good die only)" : "Sent to packaging (everything)", 7.5, "start");
            s += rect(14, 78, good * sc, 18, "rgba(84,224,199,.7)", "rgba(84,224,199,1)");

            if (!sort) {
                s += rect(14 + good * sc, 78, bad * sc, 18, "rgba(255,105,120,.7)", "rgba(255,105,120,1)");
            }

            s += label(14 + packaged * sc + 6, 91, packaged + " packaged", 7, "start", "var(--muted)");

            s += label(14, 120, "Ship after final test", 7.5, "start");
            s += rect(14, 126, shipped * sc, 18, "rgba(84,224,199,.7)", "rgba(84,224,199,1)");
            s += label(14 + shipped * sc + 6, 139, shipped + " ship", 7, "start", "var(--muted)");

            s += legend([["good die", "rgba(84,224,199,.7)"], ["bad die", "rgba(255,105,120,.7)"]], 162);

            svg.innerHTML = s;

            out(root, "bad", sort ? "0" : bad);
            out(root, "waste", money(wasted) + " per wafer");
            out(root, "per", "$" + (total / shipped).toFixed(2));
            setVal(root, "y", state.y + "%");

            const chip = root.querySelector('[data-out="chip"]');

            if (sort) {

                out(root, "verdict", "Bad die never waste a package");
                chip.textContent = "✓ Test first";
                chip.className = "fd-chip";
                F.reward("chip-pkgflow-compare", 10, "You saw why chips are tested twice");

            } else {

                out(root, "verdict", "You paid to package " + bad + " die that were already dead");
                chip.textContent = "✕ Wasted packaging";
                chip.className = "fd-chip rose";
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 38: WIRE BONDING VERSUS FLIP-CHIP
    ====================================== */

    SIMS["chip-attach"] = function (root) {

        const defaults = { method: "wire", n: 1200 };
        const state = { method: "wire", n: 1200 };

        root.innerHTML =
            head("Watch it: two ways to connect a die") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="320" role="img" aria-label="A die seen from above: wire bonding adds one wire at a time around its edge, while flip-chip connects every bump on the face at once"></canvas>' +
            '<div class="fd-stat-row">' + stat("Connections that fit", "fit") + stat("Time to connect them all", "time") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button></div>' +
            seg("Method", "method", [["wire", "Wire bonding"], ["flip", "Flip-chip"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Connections the chip needs", key: "n", min: 100, max: 5000, step: 100, value: 1200 }) +
            "</div>" +
            '<p class="fd-sim-formula">Illustrative: a 10 mm die with wire pads every 50 µm around its edge, or bumps every 150 µm across its face. A wire bonder places about 20 wires per second, and flip-chip reflows every bump in one pass.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let t = 0;

        function limits() {

            return {
                wire: 4 * Math.floor(10 / 0.05),
                flip: Math.pow(Math.floor(10 / 0.15), 2)
            };
        }

        function update() {

            const lim = limits();
            const wireOk = state.n <= lim.wire;
            const flipOk = state.n <= lim.flip;

            const secs = state.method === "wire" ? state.n / 20 : 60;
            const ok = state.method === "wire" ? wireOk : flipOk;

            out(root, "fit", (state.method === "wire" ? lim.wire : lim.flip).toLocaleString());
            out(root, "time", secs >= 120 ? (secs / 60).toFixed(1) + " min" : Math.round(secs) + " s");
            setVal(root, "n", state.n.toLocaleString());

            const chip = root.querySelector('[data-out="chip"]');

            if (!ok) {

                out(root, "verdict", "The pads run out of room");
                chip.textContent = "✕ Does not fit";
                chip.className = "fd-chip rose";

            } else if (state.method === "wire") {

                out(root, "verdict", "Cheap and proven, one wire at a time");
                chip.textContent = secs > 60 ? "⚠ Slow for this many" : "✓ Works";
                chip.className = "fd-chip " + (secs > 60 ? "gold" : "");

            } else {

                out(root, "verdict", "Every bump connects at once");
                chip.textContent = "✓ Dense and fast";
                chip.className = "fd-chip";
                F.reward("chip-attach-flip", 5, "You compared wire bonding and flip-chip");
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 320);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 320);

            const cx = 340;
            const cy = 160;
            const half = 100;

            // substrate
            ctx.fillStyle = "rgba(170,179,207,.28)";
            ctx.fillRect(cx - 160, cy - 140, 320, 280);
            ctx.strokeStyle = "rgba(245,247,255,.5)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cx - 160, cy - 140, 320, 280);

            // die
            ctx.fillStyle = "rgba(20,30,60,.95)";
            ctx.fillRect(cx - half, cy - half, half * 2, half * 2);
            ctx.strokeStyle = "rgba(84,224,199,.9)";
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - half, cy - half, half * 2, half * 2);

            if (state.method === "wire") {

                const pads = [];

                for (let i = 0; i < 12; i++) {

                    const f = (i + 0.5) / 12;

                    pads.push({ x: cx - half + f * half * 2, y: cy - half + 7, dx: 0, dy: -1 });
                    pads.push({ x: cx + half - 7, y: cy - half + f * half * 2, dx: 1, dy: 0 });
                    pads.push({ x: cx - half + f * half * 2, y: cy + half - 7, dx: 0, dy: 1 });
                    pads.push({ x: cx - half + 7, y: cy - half + f * half * 2, dx: -1, dy: 0 });
                }

                const k = Math.floor(t * 9) % (pads.length + 8);

                pads.forEach(function (p, i) {

                    ctx.fillStyle = "rgba(255,214,102,.95)";
                    ctx.fillRect(p.x - 3, p.y - 3, 6, 6);

                    if (i < k) {

                        ctx.strokeStyle = "rgba(255,214,102,.95)";
                        ctx.lineWidth = 1.4;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.quadraticCurveTo(p.x + p.dx * 22, p.y + p.dy * 22 - 10, p.x + p.dx * 44, p.y + p.dy * 44);
                        ctx.stroke();
                    }
                });

                if (k < pads.length) {

                    ctx.fillStyle = "rgba(255,105,120,1)";
                    ctx.beginPath();
                    ctx.arc(pads[k].x, pads[k].y, 6, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.font = "12px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("die face up: wires added one at a time around the edge", cx, cy + 156);

            } else {

                const phase = t % 5;
                const hot = phase > 1.6 && phase < 3.2;
                const done = phase >= 3.2;

                for (let r = 0; r < 8; r++) {

                    for (let c = 0; c < 8; c++) {

                        const x = cx - half + 18 + c * ((half * 2 - 36) / 7);
                        const y = cy - half + 18 + r * ((half * 2 - 36) / 7);

                        ctx.fillStyle = hot ? "rgba(255,150,80,1)" : (done ? "rgba(84,224,199,1)" : "rgba(255,214,102,.95)");
                        ctx.beginPath();
                        ctx.arc(x, y, 6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.font = "12px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(hot ? "one reflow pass: every bump melts at once" : (done ? "all connections made together" : "die flipped face down onto matching pads"), cx, cy + 156);
            }
        }

        wire(root, state, defaults, function () {

            t = 0;
            update();
            draw();
        });

        const anim = animate(root, function (dt) {

            t += dt;
            draw();
        });

        bindPause(root, anim);

        update();
        draw();
    };


    /* ======================================
       UNIT 39: PINS BY PACKAGE TYPE
    ====================================== */

    SIMS["chip-pkgpins"] = function (root) {

        const defaults = { side: 20, pitch: 1, need: 300 };
        const state = { side: 20, pitch: 1, need: 300 };

        root.innerHTML =
            head("Try it: how many pins can each package hold?") +
            art("0 0 340 160", "Bars showing how many connections a leaded package, a quad flat package, and a ball grid array can hold at the chosen size and pitch") +
            '<div class="fd-stat-row">' + stat("Package side", "sd") + stat("Pins needed", "need") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Package side (mm)", key: "side", min: 5, max: 40, step: 1, value: 20 }) +
            slider({ label: "Pin or ball spacing (mm)", key: "pitch", min: 0.4, max: 2.5, step: 0.1, value: 1 }) +
            slider({ label: "Connections the chip needs", key: "need", min: 20, max: 5000, step: 20, value: 300 }) +
            "</div>" +
            '<p class="fd-sim-formula">Perimeter pins grow with the edge length, while ball-grid connections grow with the area. Double the side: twice the edge pins, four times the balls.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const n = Math.floor(state.side / state.pitch);
            const caps = [
                { name: "DIP (two rows)", v: 2 * n, c: "rgba(255,105,120,.75)" },
                { name: "QFP (four sides)", v: 4 * n, c: "rgba(255,214,102,.75)" },
                { name: "BGA (whole underside)", v: n * n, c: "rgba(84,224,199,.75)" }
            ];

            const x0 = 100;
            const x1 = 320;

            function X(v) { return x0 + clamp(Math.log10(Math.max(v, 10)) - 1, 0, 4) / 4 * (x1 - x0); }

            let s = "";
            let best = null;

            caps.forEach(function (cap, i) {

                const y = 22 + i * 38;
                const ok = cap.v >= state.need;

                if (ok && !best) { best = cap; }

                s += label(x0 - 6, y + 12, cap.name, 6.8, "end");
                s += rect(x0, y, Math.max(2, X(cap.v) - x0), 20, ok ? cap.c : "rgba(170,179,207,.25)", ok ? "rgba(245,247,255,.7)" : "rgba(170,179,207,.5)");
                s += label(Math.min(X(cap.v) + 4, x1 - 2), y + 13, cap.v.toLocaleString(), 7, X(cap.v) > x1 - 36 ? "end" : "start");
            });

            const nx = X(state.need);

            s += '<line x1="' + nx + '" y1="12" x2="' + nx + '" y2="136" style="stroke:rgba(255,214,102,.95);stroke-dasharray:3 3;stroke-width:1.4"/>';
            s += label(nx, 8, "needed", 7, "middle", "rgba(255,214,102,.95)");
            s += label(x0, 150, "10", 6.5, "middle", "var(--muted)") + label(x1, 150, "100,000 (log scale)", 6.5, "end", "var(--muted)");

            svg.innerHTML = s;

            out(root, "sd", state.side + " mm");
            out(root, "need", state.need.toLocaleString());
            setVal(root, "side", state.side + " mm");
            setVal(root, "pitch", state.pitch.toFixed(1) + " mm");
            setVal(root, "need", state.need.toLocaleString());

            const chip = root.querySelector('[data-out="chip"]');

            if (best) {

                out(root, "verdict", "Smallest style that holds them: " + best.name.split(" (")[0]);
                chip.textContent = "✓ Fits";
                chip.className = "fd-chip";

                if (best.name.indexOf("BGA") === 0 && state.need >= 1000) {
                    F.reward("chip-pkgpins-bga", 10, "You found a chip that needs a ball grid array");
                }

            } else {

                out(root, "verdict", "No package at this size holds that many");
                chip.textContent = "✕ Too many pins";
                chip.className = "fd-chip rose";
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 41: HEAT OUT OF THE PACKAGE
    ====================================== */

    SIMS["chip-thermal"] = function (root) {

        const defaults = { theta: 15, p: 20 };
        const state = { theta: 15, p: 20 };
        const AMB = 25;
        const LIMIT = 125;

        root.innerHTML =
            head("Try it: how hot does the chip run?") +
            art("0 0 340 190", "A chip package with heat rising from the die, colored by junction temperature, beside a thermometer with the 125 degree limit marked") +
            '<div class="fd-stat-row">' + stat("Junction temperature", "tj") + stat("Most power it can take", "pmax") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            seg("Cooling (θJA in °C per watt)", "theta", [["40", "Bare plastic (40)"], ["15", "Metal slug (15)"], ["3", "Heat sink (3)"], ["0.8", "Heat sink and fan (0.8)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Power the chip dissipates (W)", key: "p", min: 1, max: 150, step: 1, value: 20 }) +
            "</div>" +
            '<p class="fd-sim-formula">Temperature rise = power × θJA. Junction temperature = 25 °C air + that rise. Illustrative limit: 125 °C.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const tj = AMB + state.p * state.theta;
            const pmax = (LIMIT - AMB) / state.theta;

            const heat = clamp((tj - 25) / 200, 0, 1);
            const col = tj > LIMIT ? "rgba(255,105,120,.95)" : (tj > 85 ? "rgba(255,214,102,.9)" : "rgba(84,224,199,.85)");

            let s = "";

            // heat sink fins for the better cooling options
            if (state.theta <= 3) {

                for (let i = 0; i < 9; i++) {
                    s += rect(60 + i * 20, 22, 8, 42, "rgba(170,179,207,.7)", "rgba(245,247,255,.6)");
                }

                s += rect(52, 64, 188, 8, "rgba(170,179,207,.8)", "rgba(245,247,255,.6)");
            } else if (state.theta <= 15) {

                s += rect(92, 52, 96, 18, "rgba(170,179,207,.8)", "rgba(245,247,255,.6)");
                s += label(140, 49, "metal slug", 6.5, "middle", "var(--muted)");
            }

            // package and die
            s += rect(52, 72, 188, 56, "rgba(40,48,72,.95)", "rgba(245,247,255,.5)");
            s += rect(110, 86, 72, 28, col, "rgba(245,247,255,.8)");
            s += label(146, 104, "die", 8, "middle", "rgba(6,10,24,1)");
            s += label(146, 142, "package", 7, "middle", "var(--muted)");

            // heat arrows rising
            const arrows = clamp(Math.round(state.p / 25) + 1, 1, 7);

            for (let i = 0; i < arrows; i++) {

                const x = 60 + (i + 0.5) * (172 / arrows);
                const y = state.theta <= 3 ? 12 : 30;

                s += '<polygon points="' + (x - 4) + "," + (y + 8) + " " + (x + 4) + "," + (y + 8) + " " + x + "," + (y - 2) + '" style="fill:rgba(255,150,80,.9)"/>';
            }

            if (state.theta > 3) {
                s += label(146, 20, state.theta === 0.8 ? "" : "heat leaves the package", 7, "middle", "var(--muted)");
            }

            if (state.theta === 0.8) {
                s += label(146, 12, "fan blows across the sink", 7, "middle", "var(--muted)");
            }

            // thermometer 0..250 C
            const tx = 280;
            const ty0 = 20;
            const ty1 = 165;
            const level = clamp(tj / 250, 0, 1);

            s += rect(tx - 7, ty0, 14, ty1 - ty0, "rgba(170,179,207,.2)", "rgba(245,247,255,.5)");
            s += rect(tx - 7, ty1 - level * (ty1 - ty0), 14, level * (ty1 - ty0), col, "none");

            const ly = ty1 - LIMIT / 250 * (ty1 - ty0);

            s += '<line x1="' + (tx - 14) + '" y1="' + ly + '" x2="' + (tx + 14) + '" y2="' + ly + '" style="stroke:rgba(255,105,120,1);stroke-width:1.6"/>';
            s += label(tx + 18, ly + 3, "125 °C limit", 6.5, "start", "rgba(255,105,120,1)");
            s += label(tx, ty1 + 12, tj > 300 ? "300+ °C" : Math.round(tj) + " °C", 8, "middle");

            svg.innerHTML = s;

            out(root, "tj", tj > 300 ? "over 300 °C" : Math.round(tj) + " °C");
            out(root, "pmax", pmax >= 100 ? Math.round(pmax) + " W" : pmax.toFixed(1) + " W");
            setVal(root, "p", state.p + " W");

            const chip = root.querySelector('[data-out="chip"]');

            if (tj > LIMIT) {

                out(root, "verdict", "Too hot: it would slow itself down or fail");
                chip.textContent = "✕ Over the limit";
                chip.className = "fd-chip rose";

            } else if (tj > 85) {

                out(root, "verdict", "Hot, but inside the limit");
                chip.textContent = "⚠ Little margin";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Running cool");
                chip.textContent = "✓ Safe";
                chip.className = "fd-chip";

                if (state.p >= 60) {
                    F.reward("chip-thermal-cool", 10, "You cooled a high-power chip");
                }
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 41: THE BATHTUB CURVE AND BURN-IN
    ====================================== */

    SIMS["chip-bathtub"] = function (root) {

        const defaults = { burn: 0 };
        const state = { burn: 0 };
        const TAU = 0.02;

        root.innerHTML =
            head("Try it: what does burn-in do to the curve?") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="330" role="img" aria-label="A bathtub-shaped failure rate curve over a chip life on a log scale, with the early failure peak shrinking as burn-in time is added"></canvas>' +
            '<div class="fd-stat-row">' + stat("Burn-in time", "bt") + stat("Early field failures, first year", "ff") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Burn-in time (hours)", key: "burn", min: 0, max: 336, step: 12, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Burn-in trades a little factory time for a lot fewer field failures. It runs the chip hot and at high voltage so the weak ones fail at the factory, not in a customer\'s hands.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function lambda(t, burnYears) {

            const infant = 300 * Math.exp(-(t + burnYears) / TAU);
            const base = 3;
            const wear = 30 * Math.exp((t - 10) / 1.6);

            return infant + base + wear;
        }

        function firstYear(burnYears) {

            let sum = 0;
            const steps = 400;

            for (let i = 0; i < steps; i++) {

                const t0 = i / steps;

                sum += lambda(t0 + 0.5 / steps, burnYears) / steps;
            }

            return sum;
        }

        function update() {

            const by = state.burn / 8760;
            const ff = firstYear(by);

            out(root, "bt", state.burn + " h");
            out(root, "ff", ff.toFixed(1) + " per 1,000");
            setVal(root, "burn", state.burn + " h");

            out(root, "verdict", state.burn === 0 ? "No burn-in: weak chips fail in customers' hands" : "Early failures pushed out before the chip ships");

            if (state.burn >= 120) {
                F.reward("chip-bathtub-burn", 10, "You shrank the infant-mortality peak");
            }

            draw(by);
        }

        function draw(by) {

            ctx.clearRect(0, 0, 680, 330);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 330);

            const x0 = 60;
            const x1 = 650;
            const y0 = 20;
            const y1 = 270;
            const tMin = 0.001;
            const tMax = 12;

            function X(t) { return x0 + (Math.log10(t) - Math.log10(tMin)) / (Math.log10(tMax) - Math.log10(tMin)) * (x1 - x0); }
            function Y(v) { return y1 - (Math.log10(clamp(v, 1, 1000))) / 3 * (y1 - y0); }

            ctx.strokeStyle = "rgba(170,179,207,.6)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0, y1);
            ctx.lineTo(x1, y1);
            ctx.stroke();

            ctx.font = "11px sans-serif";
            ctx.fillStyle = "rgba(170,179,207,.9)";
            ctx.textAlign = "right";

            [1, 10, 100, 1000].forEach(function (v) {

                ctx.fillText(v, x0 - 6, Y(v) + 4);
                ctx.strokeStyle = "rgba(170,179,207,.15)";
                ctx.beginPath();
                ctx.moveTo(x0, Y(v));
                ctx.lineTo(x1, Y(v));
                ctx.stroke();
            });

            ctx.textAlign = "center";

            [[0.00274, "1 day"], [0.0192, "1 week"], [0.0833, "1 month"], [1, "1 year"], [10, "10 years"]].forEach(function (t) {
                ctx.fillText(t[1], X(t[0]), y1 + 16);
            });

            ctx.fillText("time in service (log scale)", (x0 + x1) / 2, y1 + 38);
            ctx.textAlign = "left";
            ctx.fillText("failure rate", x0 + 4, y0 - 6);

            function curve(burn, color, width) {

                ctx.strokeStyle = color;
                ctx.lineWidth = width;
                ctx.beginPath();

                for (let i = 0; i <= 200; i++) {

                    const t = Math.pow(10, Math.log10(tMin) + i / 200 * (Math.log10(tMax) - Math.log10(tMin)));
                    const x = X(t);
                    const y = Y(lambda(t, burn));

                    if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
                }

                ctx.stroke();
            }

            if (by > 0) {
                curve(0, "rgba(170,179,207,.5)", 1.5);
            }

            curve(by, "rgba(84,224,199,1)", 3);

            ctx.fillStyle = "rgba(255,105,120,.95)";
            ctx.textAlign = "left";
            ctx.font = "12px sans-serif";
            ctx.fillText("infant mortality", x0 + 14, y0 + 20);
            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.fillText("useful life", X(0.3), Y(3) + 28);
            ctx.fillStyle = "rgba(255,214,102,.95)";
            ctx.fillText("wear-out", X(4), Y(30) - 12);

            if (by > 0) {

                ctx.fillStyle = "rgba(170,179,207,.9)";
                ctx.fillText("grey: with no burn-in", x1 - 150, y0 + 20);
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 42: CHIPLETS AND YIELD
    ====================================== */

    SIMS["chip-chiplet"] = function (root) {

        const defaults = { area: 600, d0: 0.15, n: 4 };
        const state = { area: 600, d0: 0.15, n: 4 };
        let seed = 7;

        root.innerHTML =
            head("Try it: one big die, or several chiplets?") +
            art("0 0 340 200", "Ten big dies and ten sets of small chiplets, with red marking the dies that caught a defect, and bars comparing the silicon needed for each working product") +
            '<div class="fd-stat-row">' + stat("Big die yield", "ym") + stat("Chiplet yield", "yc") + stat("Silicon saved per working product", "save") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-again>🎲 Try another 10</button></div>' +
            seg("Chiplets", "n", [["1", "1 (one big die)"], ["2", "2"], ["4", "4"], ["8", "8"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Total silicon area (mm²)", key: "area", min: 100, max: 800, step: 20, value: 600 }) +
            slider({ label: "Defects per cm²", key: "d0", min: 0.05, max: 0.5, step: 0.05, value: 0.15 }) +
            "</div>" +
            '<p class="fd-sim-formula">Yield = e<sup>−area × defect density</sup>. Each chiplet is tested before assembly, so a bad one is thrown away alone instead of taking the whole design with it. Assembly adds about 4% silicon equivalent cost per extra chiplet.</p>';

        const svg = root.querySelector("svg");

        function yieldOf(areaMm2) { return Math.exp(-areaMm2 / 100 * state.d0); }

        function update() {

            const ym = yieldOf(state.area);
            const n = state.n;
            const yc = yieldOf(state.area / n);
            const overhead = 1 + 0.04 * (n - 1);
            const siMono = state.area / ym;
            const siChip = state.area / yc * overhead;
            const save = 1 - siChip / siMono;

            const rand = mulberry(seed * 977 + Math.round(state.area) + n);
            let s = "";

            s += label(14, 14, "Big die: each square is a whole product", 7, "start");

            for (let i = 0; i < 10; i++) {

                const bad = rand() > ym;

                s += rect(14 + i * 32, 20, 26, 26, bad ? "rgba(255,105,120,.8)" : "rgba(84,224,199,.7)", "rgba(245,247,255,.5)");
            }

            s += label(14, 62, n === 1 ? "One die per product (same as above)" : "Chiplets: " + n + " small dies per product, each tested alone", 7, "start");

            for (let i = 0; i < 10; i++) {

                const g = Math.ceil(Math.sqrt(n));
                const sz = 26 / g;

                for (let k = 0; k < n; k++) {

                    const bad = rand() > yc;
                    const cx = 14 + i * 32 + (k % g) * sz;
                    const cy = 68 + Math.floor(k / g) * sz;

                    s += rect(cx.toFixed(1), cy.toFixed(1), (sz - 0.8).toFixed(1), (sz - 0.8).toFixed(1), bad ? "rgba(255,105,120,.8)" : "rgba(84,224,199,.7)", "none");
                }
            }

            // silicon per working product bars
            const mx = Math.max(siMono, siChip);

            s += label(14, 116, "Silicon needed per working product (mm²)", 7, "start");
            s += rect(14, 122, siMono / mx * 220, 16, "rgba(255,105,120,.7)", "rgba(255,105,120,1)") + label(14 + siMono / mx * 220 + 4, 134, Math.round(siMono).toLocaleString(), 7, "start");
            s += rect(14, 144, siChip / mx * 220, 16, "rgba(84,224,199,.7)", "rgba(84,224,199,1)") + label(14 + siChip / mx * 220 + 4, 156, Math.round(siChip).toLocaleString(), 7, "start");
            s += label(14, 172, "(top: big die, bottom: chiplets)", 6.5, "start", "var(--muted)");

            svg.innerHTML = s + legend([["good", "rgba(84,224,199,.7)"], ["caught a defect", "rgba(255,105,120,.8)"]], 194);

            out(root, "ym", Math.round(ym * 100) + "%");
            out(root, "yc", Math.round(yc * 100) + "%");
            out(root, "save", n === 1 ? "none" : Math.round(save * 100) + "%");
            setVal(root, "area", state.area + " mm²");
            setVal(root, "d0", state.d0.toFixed(2));

            const chip = root.querySelector('[data-out="chip"]');

            if (n === 1) {

                out(root, "verdict", "Pick more than one chiplet to compare");
                chip.textContent = "same design";
                chip.className = "fd-chip gold";

            } else if (save > 0.05) {

                out(root, "verdict", "Smaller dies yield better, and a bad chiplet is cheaper to lose");
                chip.textContent = "✓ Chiplets win";
                chip.className = "fd-chip";
                F.reward("chip-chiplet-win", 10, "You made chiplets pay off");

            } else {

                out(root, "verdict", "The big die already yields well, so splitting adds cost for little gain");
                chip.textContent = "⚠ Not worth it here";
                chip.className = "fd-chip gold";
            }
        }

        root.querySelector("[data-again]").addEventListener("click", function () {

            seed++;
            update();
        });

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 43: IDM, FABLESS, OR FOUNDRY?
    ====================================== */

    SIMS["chip-models"] = quiz(
        "Game: which business model?",
        ["IDM", "Fabless", "Foundry"],
        [
            { q: "Apple designs its own chips but has someone else build them.", a: "Fabless", why: "A fabless company designs chips only and ships the design to a foundry." },
            { q: "TSMC builds chips designed by other companies and does not sell its own designs.", a: "Foundry", why: "A foundry builds chips for others without designing a chip of its own." },
            { q: "Nvidia designs chips and pays others to manufacture them.", a: "Fabless", why: "Designing without owning a fab is the fabless model." },
            { q: "Intel, historically: it designs its own chips and builds them in its own fabs.", a: "IDM", why: "An IDM handles both design and construction under one roof." },
            { q: "Qualcomm designs mobile chips and sends them out to be manufactured.", a: "Fabless", why: "Its whole product is the design, so it needs a foundry to build it." },
            { q: "Samsung, when it builds chips for other companies.", a: "Foundry", why: "Building chips from other companies' designs is the foundry model." }
        ],
        5,
        "chip-models-done",
        "You sorted the business models",
        "You know the three models: design and build (IDM), design only (fabless), build only (foundry).",
        "Ask two questions: who designs it, and who builds it? Hit Reset to try again."
    );


    /* ======================================
       UNIT 44: FAB PAYBACK
    ====================================== */

    SIMS["chip-fabroi"] = function (root) {

        const defaults = { cost: 12, wpm: 60, y: 90, util: 90 };
        const state = { cost: 12, wpm: 60, y: 90, util: 90 };

        root.innerHTML =
            head("Try it: when does a fab pay for itself?") +
            art("0 0 340 150", "A bar showing the years needed to earn back the cost of the fab, with a marker at 10 years") +
            '<div class="fd-stat-row">' + stat("Profit per wafer", "ppw") + stat("Profit per year", "ppy") + stat("Years to pay back", "yrs") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Cost to build the fab ($ billions)", key: "cost", min: 10, max: 20, step: 1, value: 12 }) +
            slider({ label: "Wafers started per month (thousands)", key: "wpm", min: 20, max: 120, step: 5, value: 60 }) +
            slider({ label: "Yield (%)", key: "y", min: 50, max: 98, step: 1, value: 90 }) +
            slider({ label: "How busy the fab is (%)", key: "util", min: 40, max: 100, step: 5, value: 90 }) +
            "</div>" +
            '<p class="fd-sim-formula">Illustrative: a wafer of good chips sells for up to $9,000 and costs $6,000 to run through the fab. Yield and fab cost are the same economic problem seen from two angles.</p>';

        const svg = root.querySelector("svg");

        function update() {

            const ppw = 9000 * state.y / 100 - 6000;
            const wafers = state.wpm * 1000 * 12 * state.util / 100;
            const ppy = ppw * wafers;
            const yrs = ppy > 0 ? state.cost * 1e9 / ppy : Infinity;

            let s = "";
            const x0 = 20;
            const x1 = 320;

            function X(v) { return x0 + clamp(v, 0, 20) / 20 * (x1 - x0); }

            s += rect(x0, 40, x1 - x0, 26, "rgba(170,179,207,.18)", "rgba(170,179,207,.4)");

            const ok = yrs <= 10;

            s += rect(x0, 40, isFinite(yrs) ? X(yrs) - x0 : x1 - x0, 26, ok ? "rgba(84,224,199,.7)" : "rgba(255,105,120,.7)", ok ? "rgba(84,224,199,1)" : "rgba(255,105,120,1)");
            s += '<line x1="' + X(10) + '" y1="30" x2="' + X(10) + '" y2="78" style="stroke:rgba(255,214,102,.95);stroke-dasharray:3 3;stroke-width:1.4"/>';
            s += label(X(10), 26, "10 years", 7, "middle", "rgba(255,214,102,.95)");
            s += label(x0, 94, "0", 6.5, "middle", "var(--muted)") + label(x1, 94, "20+ years", 6.5, "end", "var(--muted)");
            s += label(170, 120, "years of running to earn back the build cost", 7, "middle", "var(--muted)");

            svg.innerHTML = s;

            out(root, "ppw", (ppw < 0 ? "−" : "") + "$" + Math.abs(Math.round(ppw)).toLocaleString());
            out(root, "ppy", ppy <= 0 ? "none" : money(ppy));
            out(root, "yrs", isFinite(yrs) ? yrs.toFixed(1) + " years" : "never");
            setVal(root, "cost", "$" + state.cost + " billion");
            setVal(root, "wpm", state.wpm + ",000");
            setVal(root, "y", state.y + "%");
            setVal(root, "util", state.util + "%");

            const chip = root.querySelector('[data-out="chip"]');

            if (!isFinite(yrs)) {

                out(root, "verdict", "Every wafer loses money: the fab can never pay back");
                chip.textContent = "✕ Never";
                chip.className = "fd-chip rose";

            } else if (yrs > 10) {

                out(root, "verdict", "Too slow: the tools would be outdated before they pay back");
                chip.textContent = "✕ Too long";
                chip.className = "fd-chip rose";

            } else if (yrs > 6) {

                out(root, "verdict", "Pays back, but it is a long bet");
                chip.textContent = "⚠ Long payback";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "A strong case: it earns its cost back quickly");
                chip.textContent = "✓ Healthy";
                chip.className = "fd-chip";
                F.reward("chip-fabroi-good", 10, "You made a fab pay back fast");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 45: WHEN A SUPPLIER GOES DOWN
    ====================================== */

    SIMS["chip-supplyrisk"] = function (root) {

        const nodes = [
            { id: "asml", group: "Equipment", name: "ASML (EUV scanners)", effect: "stop", why: "no EUV scanners, so leading-edge layers cannot be printed or expanded" },
            { id: "etch", group: "Equipment", name: "Deposition and etch tools", effect: "stop", why: "no way to add or remove film, so the line cannot build chips" },
            { id: "metro", group: "Equipment", name: "Metrology tools", effect: "slow", why: "the fab can still run, but it cannot measure its results, so yield suffers" },
            { id: "wafers", group: "Materials", name: "Silicon wafers", effect: "stop", why: "nothing to build on: the line starves" },
            { id: "chem", group: "Materials", name: "Chemicals and gases", effect: "stop", why: "no resist, dopants, or process gases, so no layer can be made" },
            { id: "masks", group: "Materials", name: "Photomasks", effect: "stop", why: "no masks, so no pattern can be printed" },
            { id: "eda", group: "Software", name: "EDA design software", effect: "slow", why: "no new designs can be verified, though chips already designed can still be built" }
        ];

        const state = { down: {} };

        root.innerHTML =
            head("Try it: knock out a supplier") +
            '<p class="fd-sim-note">Tap a supplier to take it offline and see what happens at the fab.</p>' +
            '<div class="fd-route" data-nodes></div>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<p class="fd-sim-note" data-out="why"></p>' +
            '<p class="fd-sim-formula">The fab is where three separate industries meet and become one product. If any one is missing, the product is not made.</p>';

        if (!document.getElementById("fabChipRouteStyles")) {

            const el = document.createElement("style");

            el.id = "fabChipRouteStyles";
            el.textContent = `
.fd-route { display: grid; gap: 8px; margin: 8px 0 12px; }
.fd-route-row { display: grid; grid-template-columns: 1fr auto; gap: 6px 10px; align-items: center; padding: 8px 10px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,.04); }
.fd-route-row b { display: block; }
.fd-route-row small { color: var(--muted); }
.fd-route-row.bad { border-color: #ff6978; }
.fd-route-row.good { border-color: var(--accent); }
.fd-route-tiers { display: flex; gap: 4px; flex-wrap: wrap; }
.fd-route-tiers button { padding: 6px 10px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,.05); color: var(--text); font: inherit; font-size: .85rem; cursor: pointer; }
.fd-route-tiers button.on { border-color: var(--accent); background: rgba(84,224,199,.22); font-weight: 700; }
@media (max-width: 520px) { .fd-route-row { grid-template-columns: 1fr; } }
`;
            document.head.appendChild(el);
        }

        const list = root.querySelector("[data-nodes]");

        function render() {

            list.innerHTML = nodes.map(function (n) {

                const down = state.down[n.id];

                return '<div class="fd-route-row ' + (down ? "bad" : "good") + '"><div><b>' + n.name + "</b><small>" + n.group + "</small></div>" +
                    '<div class="fd-route-tiers"><button type="button" data-id="' + n.id + '" class="' + (down ? "" : "on") + '">' + (down ? "Offline" : "Online") + "</button></div></div>";
            }).join("");

            list.querySelectorAll("button[data-id]").forEach(function (b) {

                b.addEventListener("click", function () {

                    state.down[b.dataset.id] = !state.down[b.dataset.id];
                    render();
                });
            });

            const offline = nodes.filter(function (n) { return state.down[n.id]; });
            const chip = root.querySelector('[data-out="chip"]');

            if (!offline.length) {

                out(root, "verdict", "The fab is running normally");
                chip.textContent = "✓ All suppliers online";
                chip.className = "fd-chip";
                out(root, "why", "");

                return;
            }

            const stopped = offline.filter(function (n) { return n.effect === "stop"; });

            if (stopped.length) {

                out(root, "verdict", "The fab stops");
                chip.textContent = "✕ Production halted";
                chip.className = "fd-chip rose";
                out(root, "why", stopped.map(function (n) { return n.name + ": " + n.why + "."; }).join(" "));

            } else {

                out(root, "verdict", "The fab keeps running, but worse");
                chip.textContent = "⚠ Degraded";
                chip.className = "fd-chip gold";
                out(root, "why", offline.map(function (n) { return n.name + ": " + n.why + "."; }).join(" "));
            }

            F.reward("chip-supplyrisk-try", 5, "You tested the supply chain");
        }

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.down = {};
            render();
        });

        render();
    };


    /* ======================================
       UNIT 46: THE DESIGN FLOW AND ITS CHECKING LOOP
    ====================================== */

    SIMS["chip-edaflow"] = function (root) {

        const stages = [
            { name: "Logic design", days: 20 },
            { name: "Synthesis", days: 5 },
            { name: "Place and route", days: 10 },
            { name: "Verification and DRC", days: 7 },
            { name: "Tapeout", days: 0 }
        ];

        const defaults = { care: 60 };
        const state = { care: 60, stage: 0, f: 0, loops: 0, days: 0, running: false, done: false, msg: "", fail: false };
        const rand = mulberry(Date.now() % 100000);

        root.innerHTML =
            head("Watch it: a design, from behavior to mask data") +
            art("0 0 340 150", "Five boxes in a row: logic design, synthesis, place and route, verification and DRC, and tapeout, with a marker that moves along and loops back when the checks fail") +
            '<div class="fd-stat-row">' + stat("Times sent back", "loops") + stat("Days so far", "days") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-run>▶ Run the flow</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Care taken in layout (chance checks pass)", key: "care", min: 10, max: 95, step: 5, value: 60 }) +
            "</div>" +
            '<p class="fd-sim-formula">Verification checks the result against both the intended behavior and the fab\'s design-rule book. A failure sends the design back to place and route. Tapeout is the moment a design stops being software and starts becoming a mask.</p>';

        const svg = root.querySelector("svg");
        const runBtn = root.querySelector("[data-run]");

        function draw() {

            let s = "";
            const bw = 56;
            const gap = 12;
            const x0 = (340 - (5 * bw + 4 * gap)) / 2;

            stages.forEach(function (st, i) {

                const x = x0 + i * (bw + gap);
                const active = i === state.stage && !state.done;
                const past = i < state.stage || state.done;

                let fill = past ? "rgba(84,224,199,.5)" : "rgba(170,179,207,.18)";

                if (active) { fill = state.fail && i === 3 ? "rgba(255,105,120,.7)" : "rgba(255,214,102,.65)"; }

                s += rect(x, 40, bw, 40, fill, active ? "rgba(255,214,102,1)" : "rgba(170,179,207,.6)");
                s += label(x + bw / 2, 56, st.name.split(" ")[0], 6.5, "middle");
                s += label(x + bw / 2, 66, st.name.split(" ").slice(1).join(" "), 6.5, "middle");

                if (i < 4) {
                    s += '<polygon points="' + (x + bw + 2) + ",56 " + (x + bw + gap - 2) + ",60 " + (x + bw + 2) + ',64" style="fill:rgba(245,247,255,.7)"/>';
                }
            });

            // loop-back arrow under place and route / verification
            s += '<path d="M' + (x0 + 3 * (bw + gap) + bw / 2) + ',82 q0,22 -' + (bw + gap) + ',22 q-' + (bw / 2) + ',0 -' + (bw / 2 + 4) + ',-22" style="fill:none;stroke:rgba(255,105,120,.8);stroke-width:1.4;stroke-dasharray:3 3"/>';
            s += label(x0 + 2.5 * (bw + gap), 116, "checks failed: back to place and route", 6.5, "middle", "rgba(255,105,120,.95)");

            // token
            if (state.running || state.done) {

                const tx = x0 + state.stage * (bw + gap) + bw / 2 + (state.running && state.stage < 4 ? state.f * (bw + gap) : 0);

                s += '<circle cx="' + tx.toFixed(1) + '" cy="30" r="5" style="fill:rgba(255,214,102,1);stroke:rgba(6,10,24,.8)"/>';
            }

            svg.innerHTML = s;
        }

        function stats() {

            out(root, "loops", state.loops);
            out(root, "days", state.days);
            out(root, "verdict", state.msg);
            setVal(root, "care", state.care + "%");
        }

        function begin() {

            state.stage = 0;
            state.f = 0;
            state.loops = 0;
            state.days = 0;
            state.running = true;
            state.done = false;
            state.fail = false;
            state.msg = "Running the flow…";
            runBtn.disabled = true;

            stats();
            draw();
        }

        animate(root, function (dt) {

            if (!state.running) {
                return;
            }

            state.f += dt / 0.9;

            if (state.f < 1) {
                draw();

                return;
            }

            state.f = 0;

            if (state.stage === 3) {

                const pass = rand() * 100 < state.care;

                if (pass) {

                    state.days += stages[3].days;
                    state.stage = 4;
                    state.running = false;
                    state.done = true;
                    state.msg = "Tapeout after " + state.loops + (state.loops === 1 ? " trip" : " trips") + " back. Mask data goes to the fab.";
                    runBtn.disabled = false;
                    runBtn.textContent = "↺ Run again";

                    F.reward("chip-edaflow-done", state.loops === 0 ? 15 : 10, "You taped out a design");

                } else {

                    state.loops++;
                    state.days += stages[3].days;
                    state.fail = true;
                    state.stage = 2;
                    state.msg = "Checks failed. Back to place and route.";
                    state.days += stages[2].days;
                }

            } else {

                state.days += stages[state.stage].days;
                state.stage++;
                state.fail = false;
            }

            stats();
            draw();
        });

        runBtn.addEventListener("click", begin);

        wire(root, state, defaults, function () {

            stats();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.running = false;
            state.done = false;
            state.stage = 0;
            state.loops = 0;
            state.days = 0;
            state.msg = "Press Run the flow.";
            runBtn.disabled = false;
            runBtn.textContent = "▶ Run the flow";

            stats();
            draw();
        });

        state.msg = "Press Run the flow.";
        stats();
        draw();
    };


    /* ======================================
       UNIT 48: WHICH ROLE FITS YOU?
    ====================================== */

    SIMS["chip-careers"] = function (root) {

        const roles = {
            process: { name: "Process or equipment engineer", text: "You like tuning machines until they hit a nanometer target. These engineers keep the deposition, etch, and lithography tools running in spec (Parts 1 to 3)." },
            yield: { name: "Yield engineer", text: "You like finding patterns in data. Yield engineers chase wafer maps and control charts to find out why chips fail (Part 6)." },
            design: { name: "Design or EDA engineer", text: "You like logic, code, and puzzles. Design engineers build the chips, and EDA engineers build the software that designs them (Part 8)." },
            package: { name: "Packaging and test engineer", text: "You like hands-on hardware, heat, and reliability. These engineers connect, cool, test, and stress chips before they ship (Part 7)." },
            business: { name: "Supply chain or business role", text: "You like how money and suppliers fit together. These roles plan fabs, suppliers, and costs across the whole industry (Part 8)." }
        };

        const qs = [
            { q: "Which sounds most fun?", a: [["Tuning a machine until it hits a nanometer target", "process"], ["Digging through data to find out why chips fail", "yield"], ["Designing a circuit in software", "design"], ["Planning how an industry's suppliers and money fit together", "business"], ["Testing a chip under heat and stress", "package"]] },
            { q: "Which school subject do you like most?", a: [["Chemistry or physics", "process"], ["Statistics", "yield"], ["Programming or logic", "design"], ["Economics or geography", "business"], ["Engineering design or shop class", "package"]] },
            { q: "Where would you rather work?", a: [["In a cleanroom in a full suit, beside the tools", "process"], ["At a desk with dashboards and charts", "yield"], ["At a computer, writing and checking designs", "design"], ["In meetings, planning for years ahead", "business"], ["At a lab bench with boards, ovens, and probes", "package"]] },
            { q: "Pick a puzzle", a: [["Why did this tool drift off target?", "process"], ["What pattern do these thousand wafer maps share?", "yield"], ["How can this circuit be smaller and faster?", "design"], ["What happens if a key supplier goes offline?", "business"], ["How do we keep this chip cool for ten years?", "package"]] }
        ];

        const state = { i: 0, score: {}, done: false };

        root.innerHTML =
            head("Game: which role fits you?") +
            '<div class="fd-stat-row">' + stat("Question", "round") + "</div>" +
            '<p class="fd-q-prompt" data-out="q"></p>' +
            '<div class="fd-q-options" data-opts></div>' +
            '<p class="fd-q-feedback" data-out="fb"></p>';

        const optsEl = root.querySelector("[data-opts]");

        function show() {

            if (state.i >= qs.length) {

                let best = "process";

                Object.keys(roles).forEach(function (k) {

                    if ((state.score[k] || 0) > (state.score[best] || 0)) { best = k; }
                });

                out(root, "q", "Your best fit: " + roles[best].name);
                optsEl.innerHTML = "";
                out(root, "fb", roles[best].text + " Every part of this course is a legitimate career on its own.");
                out(root, "round", "done");

                F.reward("chip-careers-done", 10, "You found a role that fits you");

                return;
            }

            const q = qs[state.i];

            out(root, "round", (state.i + 1) + " of " + qs.length);
            out(root, "q", q.q);
            out(root, "fb", "There is no wrong answer.");

            optsEl.innerHTML = q.a.map(function (o, i) {
                return '<button type="button" data-i="' + i + '">' + o[0] + "</button>";
            }).join("");

            optsEl.querySelectorAll("button").forEach(function (b) {

                b.addEventListener("click", function () {

                    const role = q.a[parseInt(b.dataset.i, 10)][1];

                    state.score[role] = (state.score[role] || 0) + 1;
                    state.i++;

                    show();
                });
            });
        }

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.i = 0;
            state.score = {};

            show();
        });

        show();
    };


    // Mount any sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="chip-"]').forEach(F.mount);

})();
