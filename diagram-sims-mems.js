/* ========================================
   MEMS & MICROFABRICATION: SHARED HELPERS AND FOUNDATION SIMULATORS

   Unit 1: sensors versus actuators, how small is the microscale.
   Unit 2: scaling laws.
   Unit 3: accelerometer and gyroscope.
   Unit 4: cleanroom particles, RCA cleaning.
   Unit 5: gowning.
   Unit 6: process order game, inspection game.

   Registers on window.FabInteract; loaded by script.js when a page has a
   mems-* simulator. Chains diagram-sims-mems-fab.js for units 7 to 12.
   Teaching models: numbers and shapes are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.SIMS) {
        return;
    }

    const SIMS = F.SIMS;
    const slider = F.slider;


    /* ---------- styles ---------- */

    (function injectStyles() {

        if (document.getElementById("fabMemsSimStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "fabMemsSimStyles";

        style.textContent = `
.fd-seg { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 2px; }
.fd-seg-label { width: 100%; font-size: .85rem; font-weight: 700; }
.fd-sim button.fd-sim-btn.on { background: var(--accent); border-color: var(--accent); color: #04201b; }
.fd-sim canvas.fd-sim-canvas { display: block; width: 100%; max-width: 340px; margin: 0 auto; border-radius: 14px; background: rgba(255, 255, 255, .03); }
.fd-sim canvas.fd-wide { max-width: 600px; }
.fd-sim .fd-stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; margin: 8px 0; }
.fd-sim .fd-stat { border: 1px solid var(--border); border-radius: 12px; padding: 8px 10px; background: rgba(255, 255, 255, .03); }
.fd-sim .fd-stat b { display: block; font-size: 1.15rem; letter-spacing: -.01em; }
.fd-sim .fd-stat span { font-size: .72rem; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; font-weight: 700; }
.fd-sim .fd-play { display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0; }
.fd-q-prompt { margin: 4px 0 10px; font-size: 1.1rem; font-weight: 700; line-height: 1.4; }
.fd-q-options { display: grid; gap: 8px; }
.fd-q-options button { text-align: left; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255, 255, 255, .04); color: var(--text); font: inherit; font-weight: 700; cursor: pointer; }
.fd-q-options button:hover:not(:disabled) { border-color: var(--accent); }
.fd-q-options button.right { border-color: var(--accent); background: rgba(84, 224, 199, .18); }
.fd-q-options button.wrong { border-color: #ff6978; background: rgba(255, 105, 120, .16); }
.fd-q-options button.shake { animation: fd-mems-shake .35s; border-color: #ff6978; }
.fd-q-feedback { min-height: 3em; margin: 10px 0 4px; color: var(--muted); line-height: 1.5; }
@keyframes fd-mems-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
`;

        document.head.appendChild(style);

    })();


    /* ---------- helpers ---------- */

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

    function seg(label, key, options) {

        return '<div class="fd-seg"><span class="fd-seg-label">' + label + "</span>" +
            options.map(function (o) {
                return '<button type="button" class="fd-sim-btn" data-set="' + key + ":" + o[0] + '">' + o[1] + "</button>";
            }).join("") + "</div>";
    }

    function wire(root, state, defaults, update) {

        function sync() {

            root.querySelectorAll("input[type=range]").forEach(function (input) {

                if (input.dataset.key in state && document.activeElement !== input) {
                    input.value = state[input.dataset.key];
                }
            });

            root.querySelectorAll("button[data-set]").forEach(function (button) {

                const parts = button.dataset.set.split(":");

                button.classList.toggle("on", String(state[parts[0]]) === parts[1]);
            });
        }

        root.querySelectorAll("input[type=range]").forEach(function (input) {

            input.addEventListener("input", function () {

                state[input.dataset.key] = parseFloat(input.value);

                update();
                sync();
            });
        });

        root.querySelectorAll("button[data-set]").forEach(function (button) {

            button.addEventListener("click", function () {

                const parts = button.dataset.set.split(":");
                const value = parts[1];

                state[parts[0]] = isNaN(value) ? value : parseFloat(value);

                sync();
                update();
            });
        });

        const reset = root.querySelector("[data-reset]");

        if (reset) {

            reset.addEventListener("click", function () {

                Object.keys(defaults).forEach(function (key) {
                    state[key] = defaults[key];
                });

                sync();
                update();
            });
        }

        sync();
    }

    function head(title) {

        return '<div class="fd-sim-head"><span class="fd-sim-title">' + title +
            '</span><button type="button" class="fd-sim-btn" data-reset>Reset</button></div>';
    }

    function setVal(root, key, value) {

        const el = root.querySelector('[data-val="' + key + '"]');

        if (el) {
            el.textContent = value;
        }
    }

    function out(root, key, value) {

        const el = root.querySelector('[data-out="' + key + '"]');

        if (el) {
            el.textContent = value;
        }
    }

    function art(viewBox, aria) {

        return '<svg class="fd-sim-art" viewBox="' + viewBox + '" role="img" aria-label="' + aria + '"></svg>';
    }

    function stat(label, key) {

        return '<div class="fd-stat"><b data-out="' + key + '"></b><span>' + label + "</span></div>";
    }

    function rect(x, y, w, h, fill, stroke) {

        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:' + fill + ";stroke:" + (stroke || "none") + ';stroke-width:1"/>';
    }

    function label(x, y, text, size, anchor, fill) {

        return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" style="font-size:' + (size || 7) + "px;fill:" + (fill || "var(--text)") + '">' + text + "</text>";
    }

    function pline(points, color, width, fill) {

        return '<polyline points="' + points.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" style="fill:' + (fill || "none") + ";stroke:" + color + ";stroke-width:" + (width || 1) + ';stroke-linejoin:round"/>';
    }

    function poly(points, fill, stroke) {

        return '<polygon points="' + points.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" style="fill:' + fill + ";stroke:" + (stroke || "none") + ';stroke-width:1;stroke-linejoin:round"/>';
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

    // A reusable multiple-choice game.
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


    // A step-through animation: step buttons, play and pause, and a draw function that returns SVG.
    function stepper(cfg) {

        return function (root) {

            const state = { step: 0, playing: true, t: 0, anim: 0 };
            const n = cfg.steps.length;

            root.innerHTML =
                head(cfg.title) +
                art(cfg.viewBox || "0 0 340 190", cfg.aria) +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div><span class="fd-chip" data-out="tool"></span></div>' +
                '<p class="fd-sim-note" data-out="text"></p>' +
                '<div class="fd-play"><button type="button" class="fd-sim-btn" data-play>⏸ Pause</button>' +
                cfg.steps.map(function (st, i) { return '<button type="button" class="fd-sim-btn" data-stepbtn="' + i + '">' + (i + 1) + "</button>"; }).join("") +
                "</div>" + (cfg.extra || "") +
                (cfg.formula ? '<p class="fd-sim-formula">' + cfg.formula + "</p>" : "");

            const svg = root.querySelector("svg");
            const playBtn = root.querySelector("[data-play]");

            function render() {

                svg.innerHTML = cfg.draw(state.step, state);

                const st = cfg.steps[state.step];

                out(root, "title", st.t);
                out(root, "text", st.text);

                const chip = root.querySelector('[data-out="tool"]');

                chip.textContent = st.tool ? st.tool : "";
                chip.style.display = st.tool ? "" : "none";

                root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {
                    b.classList.toggle("on", parseInt(b.dataset.stepbtn, 10) === state.step);
                });

                if (state.step === n - 1 && cfg.rewardKey) {
                    F.reward(cfg.rewardKey, 10, cfg.rewardMsg || "You followed the whole sequence");
                }

                if (cfg.after) { cfg.after(root, state); }
            }

            animate(root, function (dt) {

                state.anim += dt;
                state.t += dt;

                if (state.playing && state.t > (cfg.interval || 2.8)) {

                    state.t = 0;
                    state.step = (state.step + 1) % n;
                }

                render();
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
                    state.t = 0;

                    render();
                });
            });

            root.querySelector("[data-reset]").addEventListener("click", function () {

                state.step = 0;
                state.t = 0;
                state.playing = true;
                playBtn.textContent = "⏸ Pause";

                render();
            });

            if (cfg.wire) { cfg.wire(root, state, render); }

            render();
        };
    }

    // An ordering game: tap the steps in the right order.
    function orderGame(title, steps, rewardKey, rewardMsg, intro, doneText) {

        return function (root) {

            const rand = mulberry(Date.now() % 100000);
            const state = { next: 0, mistakes: 0, order: [] };

            root.innerHTML =
                head(title) +
                '<div class="fd-stat-row">' + stat("Placed", "placed") + stat("Mistakes", "miss") + "</div>" +
                '<p class="fd-sim-note">' + intro + "</p>" +
                '<div class="fd-q-options" data-pool></div>' +
                '<p class="fd-q-feedback" data-out="fb"></p>' +
                '<ol class="fd-sim-note" data-done style="margin:6px 0 0 20px"></ol>';

            const pool = root.querySelector("[data-pool]");
            const done = root.querySelector("[data-done]");

            function shuffle() {

                const a = steps.map(function (s, i) { return i; });

                for (let i = a.length - 1; i > 0; i--) {

                    const j = Math.floor(rand() * (i + 1));
                    const t = a[i];

                    a[i] = a[j];
                    a[j] = t;
                }

                state.order = a;
            }

            function render() {

                pool.innerHTML = state.order.filter(function (i) { return i >= state.next; }).map(function (i) {
                    return '<button type="button" data-i="' + i + '">' + steps[i].n + (steps[i].d ? " · " + steps[i].d : "") + "</button>";
                }).join("");

                done.innerHTML = steps.slice(0, state.next).map(function (s) { return "<li>" + s.n + ": " + s.why + "</li>"; }).join("");

                out(root, "placed", state.next + " of " + steps.length);
                out(root, "miss", state.mistakes);

                pool.querySelectorAll("button").forEach(function (b) {

                    b.addEventListener("click", function () {

                        const i = parseInt(b.dataset.i, 10);

                        if (i === state.next) {

                            state.next++;
                            out(root, "fb", "✅ " + steps[i].why);

                            if (state.next === steps.length) {

                                out(root, "fb", "✅ " + doneText + (state.mistakes === 0 ? " No mistakes!" : ""));
                                F.reward(rewardKey, state.mistakes === 0 ? 20 : 10, rewardMsg);
                            }

                            render();

                        } else {

                            state.mistakes++;
                            out(root, "fb", "❌ Not yet. Think about what has to exist before " + steps[i].n.toLowerCase() + " can happen.");
                            out(root, "miss", state.mistakes);
                            b.classList.add("shake");
                            setTimeout(function () { b.classList.remove("shake"); }, 400);
                        }
                    });
                });
            }

            root.querySelector("[data-reset]").addEventListener("click", function () {

                state.next = 0;
                state.mistakes = 0;
                out(root, "fb", "");

                shuffle();
                render();
            });

            shuffle();
            render();
        };
    }

    // A y-axis title: rotated text running up the left edge of a canvas graph.
    function ylab(ctx, text, cy, x) {

        ctx.save();
        ctx.translate(x || 16, cy);
        ctx.rotate(-Math.PI / 2);
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(238,242,255,.9)";
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }


    F.memsHelpers = {
        clamp: clamp, mulberry: mulberry, seg: seg, wire: wire, head: head, setVal: setVal, out: out,
        art: art, stat: stat, rect: rect, label: label, pline: pline, poly: poly, legend: legend,
        animate: animate, bindPause: bindPause, quiz: quiz, stepper: stepper, orderGame: orderGame, ylab: ylab
    };


    /* ======================================
       UNIT 1: SENSOR OR ACTUATOR
    ====================================== */

    SIMS["mems-sensact"] = function (root) {

        const defaults = { mode: "sensor", a: 0, v: 0 };
        const state = { mode: "sensor", a: 0, v: 0 };
        const seen = {};

        root.innerHTML =
            head("Try it: the same tiny structure, two jobs") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="280" role="img" aria-label="A suspended mass on springs between two anchors. As a sensor, acceleration moves the mass and creates an electrical signal. As an actuator, a voltage pulls the mass and creates motion"></canvas>' +
            '<div class="fd-stat-row">' + stat("Input", "inp") + stat("Mass moves", "mv") + stat("Output", "outp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            seg("Job", "mode", [["sensor", "Sensor: motion in, signal out"], ["actuator", "Actuator: signal in, motion out"]]) +
            '<div class="fd-sim-controls" data-controls></div>' +
            '<p class="fd-sim-formula">Illustrative: about 10 nm of motion per g of acceleration, and an electrostatic pull that grows with the square of the voltage.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const controls = root.querySelector("[data-controls]");

        let x = 0;
        let built = "";

        function buildControls() {

            if (built === state.mode) {
                return;
            }

            built = state.mode;

            controls.innerHTML = state.mode === "sensor"
                ? slider({ label: "Acceleration (g)", key: "a", min: -10, max: 10, step: 0.5, value: state.a })
                : slider({ label: "Voltage (V)", key: "v", min: 0, max: 10, step: 0.5, value: state.v });

            controls.querySelectorAll("input[type=range]").forEach(function (input) {

                input.addEventListener("input", function () {

                    state[input.dataset.key] = parseFloat(input.value);
                    update();
                });
            });
        }

        function target() {

            // visual displacement in px, positive to the right
            return state.mode === "sensor" ? -state.a * 5 : state.v * state.v * 0.45;
        }

        function update() {

            buildControls();

            if (state.mode === "sensor") {

                out(root, "inp", state.a.toFixed(1) + " g");
                out(root, "mv", Math.abs(state.a * 10).toFixed(0) + " nm");
                out(root, "outp", (state.a * 20).toFixed(0) + " mV");
                setVal(root, "a", state.a.toFixed(1) + " g");
                out(root, "verdict", state.a === 0 ? "Sitting still: no signal" : "Acceleration moves the mass, and the motion becomes a signal");
                seen.sensor = state.a !== 0 || seen.sensor;

            } else {

                out(root, "inp", state.v.toFixed(1) + " V");
                out(root, "mv", (state.v * state.v * 0.03).toFixed(2) + " µm");
                out(root, "outp", state.v === 0 ? "no force" : "force " + (state.v * state.v * 0.5).toFixed(0) + " nN");
                setVal(root, "v", state.v.toFixed(1) + " V");
                out(root, "verdict", state.v === 0 ? "No voltage: nothing moves" : "A voltage pulls the mass, so a signal becomes motion");
                seen.actuator = state.v !== 0 || seen.actuator;
            }

            const chip = root.querySelector('[data-out="chip"]');

            chip.textContent = state.mode === "sensor" ? "👁️ Sensor" : "⚙️ Actuator";
            chip.className = "fd-chip " + (state.mode === "sensor" ? "" : "gold");

            if (seen.sensor && seen.actuator) {
                F.reward("mems-sensact-both", 10, "You tried a sensor and an actuator");
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 280);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 280);

            const cy = 140;
            const mx = 340 + x;

            // anchors
            ctx.fillStyle = "rgba(170,179,207,.7)";
            ctx.fillRect(30, cy - 70, 24, 140);
            ctx.fillRect(626, cy - 70, 24, 140);

            // springs
            function spring(xa, xb) {

                ctx.strokeStyle = "rgba(245,247,255,.85)";
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.moveTo(xa, cy);

                const n = 10;

                for (let i = 1; i <= n; i++) {

                    const px = xa + (xb - xa) * i / n;

                    ctx.lineTo(px, cy + (i < n ? (i % 2 ? -14 : 14) : 0));
                }

                ctx.stroke();
            }

            spring(54, mx - 54);
            spring(mx + 54, 626);

            // fixed comb fingers on top and bottom
            ctx.fillStyle = "rgba(255,214,102,.8)";

            for (let i = -3; i <= 3; i++) {
                ctx.fillRect(340 + i * 22 - 3, cy - 90, 6, 48);
                ctx.fillRect(340 + i * 22 - 3, cy + 42, 6, 48);
            }

            // proof mass with its own fingers
            ctx.fillStyle = "rgba(84,224,199,.75)";
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.lineWidth = 2;
            ctx.fillRect(mx - 54, cy - 36, 108, 72);
            ctx.strokeRect(mx - 54, cy - 36, 108, 72);

            ctx.fillStyle = "rgba(84,224,199,.9)";

            for (let i = -3; i <= 3; i++) {
                ctx.fillRect(mx + i * 14 - 2, cy - 48, 4, 14);
                ctx.fillRect(mx + i * 14 - 2, cy + 34, 4, 14);
            }

            ctx.fillStyle = "rgba(6,10,24,.9)";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("mass", mx, cy + 5);

            // input and output labels
            ctx.font = "12px sans-serif";
            ctx.fillStyle = "rgba(245,247,255,.88)";

            if (state.mode === "sensor") {

                ctx.fillText("the frame accelerates, the mass lags behind", 340, 30);

                if (Math.abs(state.a) > 0.1) {

                    ctx.strokeStyle = "rgba(255,214,102,.95)";
                    ctx.fillStyle = "rgba(255,214,102,.95)";
                    ctx.lineWidth = 3;

                    const dir = state.a > 0 ? 1 : -1;

                    ctx.beginPath();
                    ctx.moveTo(340 - dir * 60, 250);
                    ctx.lineTo(340 + dir * 60, 250);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(340 + dir * 60, 250);
                    ctx.lineTo(340 + dir * 48, 243);
                    ctx.lineTo(340 + dir * 48, 257);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillText("acceleration", 340, 272);
                }

                // output meter
                ctx.fillStyle = "rgba(170,179,207,.25)";
                ctx.fillRect(500, 240, 150, 12);
                ctx.fillStyle = "rgba(255,214,102,.95)";
                ctx.fillRect(575, 240, clamp(state.a / 10, -1, 1) * 75, 12);
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.textAlign = "right";
                ctx.fillText("signal out", 650, 270);

            } else {

                ctx.fillText("a voltage on the fingers pulls the mass sideways", 340, 30);

                ctx.fillStyle = "rgba(170,179,207,.25)";
                ctx.fillRect(30, 240, 150, 12);
                ctx.fillStyle = "rgba(255,214,102,.95)";
                ctx.fillRect(30, 240, state.v / 10 * 150, 12);
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.textAlign = "left";
                ctx.fillText("signal in (voltage)", 30, 270);

                if (state.v > 0.4) {

                    ctx.strokeStyle = "rgba(255,105,120,.95)";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(mx + 60, 100);
                    ctx.lineTo(mx + 60 + 36, 100);
                    ctx.stroke();
                    ctx.fillStyle = "rgba(255,105,120,.95)";
                    ctx.beginPath();
                    ctx.moveTo(mx + 60 + 36, 100);
                    ctx.lineTo(mx + 60 + 26, 94);
                    ctx.lineTo(mx + 60 + 26, 106);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }

        animate(root, function (dt) {

            x += (target() - x) * Math.min(1, dt * 7);
            draw();
        });

        wire(root, state, defaults, function () {

            built = "";
            update();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 1: HOW SMALL IS THE MICROSCALE
    ====================================== */

    SIMS["mems-scale"] = function (root) {

        const defaults = { logs: -4 };
        const state = { logs: -4 };

        const things = [
            { n: "a person", l: 0.23, row: 1 },
            { n: "an ant", l: -2.5, row: -1 },
            { n: "a grain of sand", l: -3.3, row: 2 },
            { n: "a human hair's width", l: -4.15, row: -1 },
            { n: "a typical MEMS device", l: -4, row: 1 },
            { n: "a red blood cell", l: -5.1, row: -2 },
            { n: "a bacterium", l: -6, row: 1 },
            { n: "a virus", l: -7, row: -1 },
            { n: "the width of DNA", l: -8.7, row: 1 }
        ];

        root.innerHTML =
            head("Try it: slide down the scale") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="260" role="img" aria-label="A ruler from one meter down to one nanometer with common objects marked and the microscale highlighted"></canvas>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="size"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<p class="fd-sim-note" data-out="seen"></p>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Size you are looking at (log scale)", key: "logs", min: -9, max: 0, step: 0.05, value: -4 }) +
            "</div>" +
            '<p class="fd-sim-formula">Remember: 1 mm = 1,000 µm and 1 µm = 1,000 nm. The microscale runs from about 1 µm to 1 mm.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function fmt(l) {

            const m = Math.pow(10, l);

            if (m >= 1) { return m.toFixed(1) + " m"; }
            if (m >= 1e-3) { return (m * 1e3).toFixed(m * 1e3 < 10 ? 1 : 0) + " mm"; }
            if (m >= 1e-6) { return (m * 1e6).toFixed(m * 1e6 < 10 ? 1 : 0) + " µm"; }

            return (m * 1e9).toFixed(m * 1e9 < 10 ? 1 : 0) + " nm";
        }

        function update() {

            out(root, "size", fmt(state.logs));
            setVal(root, "logs", fmt(state.logs));

            const near = things.filter(function (t) { return Math.abs(t.l - state.logs) <= 0.5; });
            const chip = root.querySelector('[data-out="chip"]');

            if (state.logs >= -6 && state.logs <= -3) {

                chip.textContent = "✓ The microscale";
                chip.className = "fd-chip";
                F.reward("mems-scale-micro", 5, "You found the microscale");

            } else if (state.logs > -3) {

                chip.textContent = "bigger than MEMS";
                chip.className = "fd-chip gold";

            } else {

                chip.textContent = "smaller than MEMS";
                chip.className = "fd-chip gold";
            }

            out(root, "seen", near.length ? "About this size: " + near.map(function (t) { return t.n; }).join(", ") + "." : "Nothing familiar sits right here. Slide to find the next thing.");

            draw();
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 260);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 260);

            const x0 = 30;
            const x1 = 650;
            const y = 150;

            function X(l) { return x0 + (l - 0) / (-9 - 0) * (x1 - x0); }

            // microscale band
            ctx.fillStyle = "rgba(84,224,199,.16)";
            ctx.fillRect(X(-3), y - 90, X(-6) - X(-3), 120);
            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("the microscale (MEMS)", (X(-3) + X(-6)) / 2, y - 98);

            // ruler
            ctx.strokeStyle = "rgba(245,247,255,.85)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x0, y);
            ctx.lineTo(x1, y);
            ctx.stroke();

            ctx.font = "12px sans-serif";
            ctx.fillStyle = "rgba(245,247,255,.88)";

            [[0, "1 m"], [-1, "10 cm"], [-2, "1 cm"], [-3, "1 mm"], [-4, "100 µm"], [-5, "10 µm"], [-6, "1 µm"], [-7, "100 nm"], [-8, "10 nm"], [-9, "1 nm"]].forEach(function (t) {

                ctx.beginPath();
                ctx.moveTo(X(t[0]), y - 8);
                ctx.lineTo(X(t[0]), y + 8);
                ctx.stroke();
                ctx.fillText(t[1], X(t[0]), y + 26);
            });

            // things, in label rows above and below the ruler
            things.forEach(function (t) {

                const ty = t.row > 0 ? y - 24 - t.row * 22 : y + 44 + (-t.row) * 20;

                ctx.fillStyle = "rgba(255,214,102,.95)";
                ctx.beginPath();
                ctx.arc(X(t.l), y, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "rgba(255,214,102,.5)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(X(t.l), y);
                ctx.lineTo(X(t.l), t.row > 0 ? ty + 4 : ty - 12);
                ctx.stroke();

                ctx.fillStyle = Math.abs(t.l - state.logs) <= 0.5 ? "rgba(255,255,255,1)" : "rgba(245,247,255,.62)";
                ctx.font = Math.abs(t.l - state.logs) <= 0.5 ? "bold 12px sans-serif" : "11px sans-serif";
                ctx.textAlign = t.l > -1 ? "left" : (t.l < -8 ? "right" : "center");
                ctx.fillText(t.n, X(t.l), ty);
            });

            // magnifier window: one decade wide
            const wx0 = X(clamp(state.logs + 0.5, -9, 0));
            const wx1 = X(clamp(state.logs - 0.5, -9, 0));

            ctx.strokeStyle = "rgba(255,105,120,1)";
            ctx.lineWidth = 3;
            ctx.strokeRect(wx0, y - 56, wx1 - wx0, 112);
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 2: SCALING LAWS
    ====================================== */

    SIMS["mems-scaling"] = function (root) {

        const defaults = { logl: 0 };
        const state = { logl: 0 };

        root.innerHTML =
            head("Try it: shrink everything") +
            art("0 0 340 210", "A cube that shrinks with the chosen size, and bars on a log scale showing how much stronger surface forces and electrostatic forces become compared with weight") +
            '<div class="fd-stat-row">' + stat("Size", "size") + stat("Surface area ÷ volume", "sv") + stat("Surface force vs weight", "sf") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Size of the object (log scale, from 1 m down to 1 µm)", key: "logl", min: -6, max: 0, step: 0.05, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Length L shrinks by 10, area L² by 100, volume L³ by 1,000. Weight follows volume, surface forces follow length, so smaller things are ruled by surface effects.</p>';

        const svg = root.querySelector("svg");

        function fmt(m) {

            if (m >= 1) { return m.toFixed(1) + " m"; }
            if (m >= 1e-3) { return (m * 1e3).toFixed(m * 1e3 < 10 ? 1 : 0) + " mm"; }

            return (m * 1e6).toFixed(m * 1e6 < 10 ? 1 : 0) + " µm";
        }

        function update() {

            const L = Math.pow(10, state.logl);
            const sv = 6 / L;
            const surf = 1 / (L * L);
            const elec = 1 / L;

            let s = "";

            // cube whose edge follows the log size
            const edge = 14 + (state.logl + 6) / 6 * 46;

            s += poly([[40, 150], [40 + edge, 150], [40 + edge, 150 - edge], [40, 150 - edge]], "rgba(84,224,199,.55)", "rgba(245,247,255,.9)");
            s += poly([[40, 150 - edge], [40 + edge, 150 - edge], [40 + edge + edge * 0.35, 150 - edge - edge * 0.3], [40 + edge * 0.35, 150 - edge - edge * 0.3]], "rgba(84,224,199,.8)", "rgba(245,247,255,.9)");
            s += poly([[40 + edge, 150], [40 + edge, 150 - edge], [40 + edge + edge * 0.35, 150 - edge - edge * 0.3], [40 + edge + edge * 0.35, 150 - edge * 0.3]], "rgba(84,224,199,.35)", "rgba(245,247,255,.9)");
            s += label(70, 182, "the same cube, shrunk", 7, "middle", "var(--muted)");

            // bars on a log scale: effect relative to weight at 1 m (= 1)
            const x0 = 232;
            const x1 = 332;
            const rows = [
                { n: "weight", v: 1, c: "rgba(170,179,207,.75)" },
                { n: "electrostatic", v: elec, c: "rgba(255,214,102,.8)" },
                { n: "surface", v: surf, c: "rgba(255,105,120,.8)" }
            ];

            function X(v) { return x0 + clamp(Math.log10(Math.max(v, 1)), 0, 12) / 12 * (x1 - x0); }

            rows.forEach(function (r, i) {

                const y = 40 + i * 44;

                s += label(x0 - 6, y + 12, r.n, 6.8, "end");
                s += rect(x0, y, Math.max(2, X(r.v) - x0), 18, r.c, "rgba(245,247,255,.5)");
            });

            s += label(x0 - 50, 28, "strength compared with weight (log scale)", 6.8, "start", "var(--muted)");
            s += label(x0, 176, "1×", 6.5, "middle", "var(--muted)") + label(x1, 176, "10¹²×", 6.5, "end", "var(--muted)");

            svg.innerHTML = s;

            out(root, "size", fmt(L));
            out(root, "sv", sv >= 1000 ? Math.round(sv).toLocaleString() + " per m" : sv.toFixed(1) + " per m");
            out(root, "sf", surf < 10 ? "about the same" : surf >= 1e6 ? "about 10" + sup(Math.round(Math.log10(surf))) + "× more" : Math.round(surf).toLocaleString() + "× more");
            setVal(root, "logl", fmt(L));

            const chip = root.querySelector('[data-out="chip"]');

            if (L > 1e-1) {

                out(root, "verdict", "Everyday size: weight rules");
                chip.textContent = "gravity dominates";
                chip.className = "fd-chip gold";

            } else if (L > 1e-3) {

                out(root, "verdict", "Getting small: surface effects creep in");
                chip.textContent = "transition";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "Microscale: surface forces and electrostatics win");
                chip.textContent = "✓ Different physics";
                chip.className = "fd-chip";
                F.reward("mems-scaling-micro", 10, "You shrank something to the microscale");
            }
        }

        function sup(n) {

            const map = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

            return String(n).split("").map(function (c) { return map[c] || c; }).join("");
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       UNIT 3: ACCELEROMETER
    ====================================== */

    SIMS["mems-accel"] = function (root) {

        const defaults = { a: 0 };
        const state = { a: 0 };

        root.innerHTML =
            head("Try it: shake a MEMS accelerometer") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="A tiny proof mass hanging on springs between two sets of fixed fingers. When the device accelerates the mass moves, one gap shrinks and the other grows, and the change in capacitance is the signal"></canvas>' +
            '<div class="fd-stat-row">' + stat("Mass moves", "mv") + stat("Capacitance difference", "dc") + stat("Output", "outp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-shake>📱 Shake it</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Steady acceleration (g)", key: "a", min: -5, max: 5, step: 0.5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Motion is exaggerated so you can see it: a real proof mass moves only tens of nanometers per g.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let x = 0;
        let v = 0;
        let shake = 0;
        let t = 0;

        const W0 = 5.5; // visual natural frequency

        function accNow() { return state.a + (shake > 0 ? 6 * Math.sin(t * 22) * Math.min(1, shake) : 0); }

        function update() {

            setVal(root, "a", state.a.toFixed(1) + " g");
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 300);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 300);

            const cy = 130;
            const mx = 340 + x * 6;
            const gapL = clamp(24 + x * 6, 2, 60);
            const gapR = clamp(24 - x * 6, 2, 60);

            ctx.fillStyle = "rgba(170,179,207,.7)";
            ctx.fillRect(20, cy - 60, 22, 120);
            ctx.fillRect(638, cy - 60, 22, 120);

            function spring(xa, xb) {

                ctx.strokeStyle = "rgba(245,247,255,.85)";
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(xa, cy);

                for (let i = 1; i <= 10; i++) {
                    ctx.lineTo(xa + (xb - xa) * i / 10, cy + (i < 10 ? (i % 2 ? -12 : 12) : 0));
                }

                ctx.stroke();
            }

            spring(42, mx - 70);
            spring(mx + 70, 638);

            // fixed plates, left and right of the mass
            const plateLx = mx - 70 - gapL - 8;
            const plateRx = mx + 70 + gapR;

            ctx.fillStyle = "rgba(255,214,102,.85)";
            ctx.fillRect(plateLx - 8, cy - 44, 8, 88);
            ctx.fillRect(plateRx + 8, cy - 44, 8, 88);

            // proof mass
            ctx.fillStyle = "rgba(84,224,199,.75)";
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.lineWidth = 2;
            ctx.fillRect(mx - 70, cy - 44, 140, 88);
            ctx.strokeRect(mx - 70, cy - 44, 140, 88);

            ctx.fillStyle = "rgba(6,10,24,.9)";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("proof mass", mx, cy + 5);

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.fillText("gap", plateLx + 4, cy + 66);
            ctx.fillText("gap", plateRx + 12, cy + 66);

            // capacitance bars: C proportional to 1 / gap
            const cL = 24 / gapL;
            const cR = 24 / gapR;

            ctx.fillStyle = "rgba(170,179,207,.25)";
            ctx.fillRect(120, 250, 180, 14);
            ctx.fillRect(380, 250, 180, 14);
            ctx.fillStyle = "rgba(255,105,120,.9)";
            ctx.fillRect(120, 250, clamp(cL, 0, 2) / 2 * 180, 14);
            ctx.fillStyle = "rgba(84,224,199,.9)";
            ctx.fillRect(380, 250, clamp(cR, 0, 2) / 2 * 180, 14);
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.fillText("left capacitor", 210, 284);
            ctx.fillText("right capacitor", 470, 284);

            const diff = cR - cL;

            out(root, "mv", Math.abs(x * 6 / 6 * 10).toFixed(0) + " nm");
            out(root, "dc", (diff * 8).toFixed(1) + " fF");
            out(root, "outp", (diff * 80).toFixed(0) + " mV");
            out(root, "verdict", Math.abs(x) < 0.05 ? "At rest: both gaps equal, no signal" : "One gap shrinks and one grows: that difference is the signal");
        }

        animate(root, function (dt) {

            t += dt;

            if (shake > 0) { shake -= dt * 0.5; }

            const a = accNow();
            const steps = 4;

            for (let i = 0; i < steps; i++) {

                const h = dt / steps;

                // the mass lags the frame: relative acceleration is the negative of the frame's
                const acc = -W0 * W0 * (x + a * 0.06) - 2 * 0.35 * W0 * v;

                v += acc * h;
                x += v * h;
            }

            x = clamp(x, -3.4, 3.4);

            draw();
        });

        root.querySelector("[data-shake]").addEventListener("click", function () {

            shake = 1.6;
            F.reward("mems-accel-shake", 5, "You shook the accelerometer");
        });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    /* ======================================
       UNIT 3: GYROSCOPE
    ====================================== */

    SIMS["mems-gyro"] = function (root) {

        const defaults = { w: 0 };
        const state = { w: 0 };

        root.innerHTML =
            head("Try it: rotate a vibrating gyroscope") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="320" role="img" aria-label="A mass vibrating side to side. When the device rotates, a sideways force called the Coriolis force pushes the mass in the other direction, and that second motion measures the rotation"></canvas>' +
            '<div class="fd-stat-row">' + stat("Rotation rate", "rate") + stat("Sideways motion", "sense") + stat("Output", "outp") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Rotation rate (degrees per second)", key: "w", min: -300, max: 300, step: 10, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">The mass is driven back and forth. Rotation turns that motion into a second motion at right angles, and the size of the second motion tells how fast the device rotates.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        let t = 0;
        const trail = [];

        function update() {

            setVal(root, "w", state.w + " °/s");
            out(root, "rate", state.w + " °/s");
            out(root, "sense", Math.abs(state.w * 0.12).toFixed(0) + " nm");
            out(root, "outp", (state.w * 0.5).toFixed(0) + " mV");
            out(root, "verdict", state.w === 0 ? "Not rotating: the mass only vibrates left and right" : "Rotation adds a second motion, and that motion measures the rotation");

            if (Math.abs(state.w) >= 200) {
                F.reward("mems-gyro-fast", 5, "You spun the gyroscope fast");
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 320);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 320);

            const cx = 340;
            const cy = 160;

            ctx.save();
            ctx.translate(cx, cy);

            // frame
            ctx.strokeStyle = "rgba(170,179,207,.8)";
            ctx.lineWidth = 3;
            ctx.strokeRect(-210, -120, 420, 240);

            // sense electrodes (top and bottom)
            ctx.fillStyle = "rgba(255,214,102,.8)";
            ctx.fillRect(-60, -118, 120, 8);
            ctx.fillRect(-60, 110, 120, 8);

            // drive electrodes (left and right)
            ctx.fillStyle = "rgba(255,105,120,.8)";
            ctx.fillRect(-208, -30, 8, 60);
            ctx.fillRect(200, -30, 8, 60);

            const px = 130 * Math.sin(t * 3.2);
            const py = clamp(state.w * 0.26, -75, 75) * Math.cos(t * 3.2);

            // trail
            ctx.strokeStyle = "rgba(84,224,199,.35)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let i = 0; i < 60; i++) {

                const tt = t - i * 0.02;
                const tx = 130 * Math.sin(tt * 3.2);
                const ty = clamp(state.w * 0.26, -75, 75) * Math.cos(tt * 3.2);

                if (i === 0) { ctx.moveTo(tx, ty); } else { ctx.lineTo(tx, ty); }
            }

            ctx.stroke();

            ctx.fillStyle = "rgba(84,224,199,.85)";
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.lineWidth = 2;
            ctx.fillRect(px - 32, py - 24, 64, 48);
            ctx.strokeRect(px - 32, py - 24, 64, 48);

            ctx.restore();

            // rotation indicator
            if (state.w !== 0) {

                const dir = state.w > 0 ? 1 : -1;

                ctx.strokeStyle = "rgba(255,214,102,.95)";
                ctx.fillStyle = "rgba(255,214,102,.95)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(58, 60, 22, dir > 0 ? 0.3 : Math.PI - 0.3, dir > 0 ? 4.6 : -1.5, dir < 0);
                ctx.stroke();
                ctx.font = "11px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("rotating", 58, 98);
            }

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("red: drive electrodes push the mass left and right", cx, 22);
            ctx.fillText("gold: sense electrodes measure the sideways motion", cx, 312);

            void trail;
        }

        animate(root, function (dt) {

            t += dt;
            draw();
        });

        wire(root, state, defaults, update);
        update();
        draw();
    };


    /* ======================================
       UNIT 4: PARTICLES IN THE ROOM
    ====================================== */

    SIMS["mems-cleanroom"] = function (root) {

        const defaults = { room: 1e6, act: 1 };
        const state = { room: 1e6, act: 1 };

        root.innerHTML =
            head("Watch it: where do particles land?") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="320" role="img" aria-label="Particles drifting down onto a wafer: more from an ordinary room and from a person moving around, far fewer in a cleanroom"></canvas>' +
            '<div class="fd-stat-row">' + stat("Particles per cubic foot of air", "conc") + stat("Landed on the wafer", "landed") + stat("Likely killer defects", "kill") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-clear>🧽 Clean the wafer</button></div>' +
            seg("Room", "room", [["1000000", "Ordinary room"], ["10000", "Class 10,000"], ["100", "Class 100"], ["1", "Class 1"]]) +
            seg("The operator", "act", [["0", "Away"], ["1", "Standing still"], ["4", "Walking"], ["12", "Rushing"]]) +
            '<p class="fd-sim-formula">Illustrative: each class is the number of particles per cubic foot. People add particles of their own, so movement near an open wafer matters.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(Date.now() % 100000);

        let parts = [];
        let landed = [];
        let spawn = 0;

        function rate() {

            // visual particles per second, compressed from the real concentration
            const air = 0.6 + 7 * Math.log10(1 + state.room) / 6;
            const people = state.act * 1.4;

            return air + people;
        }

        function update() {

            out(root, "conc", state.room.toLocaleString());

            const chip = root.querySelector('[data-out="chip"]');
            const bad = state.room >= 10000 || state.act >= 4;

            if (state.room <= 100 && state.act <= 1) {

                out(root, "verdict", "Almost no particles reach the wafer");
                chip.textContent = "✓ Cleanroom discipline";
                chip.className = "fd-chip";
                F.reward("mems-cleanroom-clean", 10, "You kept the wafer clean");

            } else if (bad) {

                out(root, "verdict", "Contamination piles up fast");
                chip.textContent = "✕ Defects likely";
                chip.className = "fd-chip rose";

            } else {

                out(root, "verdict", "Better, but every bit of movement adds particles");
                chip.textContent = "⚠ Watch the operator";
                chip.className = "fd-chip gold";
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 320);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 320);

            // operator silhouette
            if (state.act > 0) {

                ctx.fillStyle = "rgba(120,180,255,.25)";
                ctx.beginPath();
                ctx.arc(110, 90, 24, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(80, 118, 60, 120);
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.font = "12px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("operator", 110, 258);
            }

            // wafer
            ctx.fillStyle = "rgba(170,179,207,.55)";
            ctx.fillRect(220, 270, 340, 14);
            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("wafer", 390, 304);

            ctx.fillStyle = "rgba(255,214,102,.95)";

            parts.forEach(function (p) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });

            landed.forEach(function (p) {

                ctx.fillStyle = p.big ? "rgba(255,105,120,1)" : "rgba(255,214,102,.9)";
                ctx.beginPath();
                ctx.arc(p.x, 268 - p.r, p.r + (p.big ? 1 : 0), 0, Math.PI * 2);
                ctx.fill();
            });
        }

        animate(root, function (dt) {

            spawn += dt * rate();

            while (spawn >= 1) {

                spawn -= 1;

                const fromPerson = state.act > 0 && rand() < state.act * 1.4 / rate();
                const x = fromPerson ? 140 + rand() * 40 : 20 + rand() * 640;
                const y = fromPerson ? 120 + rand() * 80 : 10;

                parts.push({ x: x, y: y, vx: fromPerson ? 20 + rand() * 50 : (rand() - 0.5) * 12, vy: 18 + rand() * 24, r: 1.5 + rand() * 2.2 });
            }

            parts.forEach(function (p) {

                p.x += p.vx * dt + Math.sin(p.y * 0.05) * 10 * dt;
                p.y += p.vy * dt;
            });

            parts = parts.filter(function (p) {

                if (p.y >= 268) {

                    if (p.x > 220 && p.x < 560 && landed.length < 400) {
                        landed.push({ x: p.x, r: p.r, big: p.r > 3 });
                    }

                    return false;
                }

                return p.x > -10 && p.x < 690;
            });

            out(root, "landed", landed.length);
            out(root, "kill", landed.filter(function (p) { return p.big; }).length);

            draw();
        });

        root.querySelector("[data-clear]").addEventListener("click", function () {

            landed = [];
            parts = [];
        });

        wire(root, state, defaults, function () {

            landed = [];
            update();
        });

        update();
        draw();
    };


    /* ======================================
       UNIT 4: RCA CLEANING
    ====================================== */

    SIMS["mems-rca"] = function (root) {

        const baths = {
            sc1: { name: "SC-1 bath", cleans: ["particle", "organic"], text: "Ammonia, hydrogen peroxide, and water lift off particles and organic residue." },
            sc2: { name: "SC-2 bath", cleans: ["metal"], text: "Hydrochloric acid, hydrogen peroxide, and water remove metallic contamination." },
            hf: { name: "HF dip", cleans: ["oxide"], text: "A dilute hydrofluoric acid dip strips the thin native oxide, and it is commonly the last step." }
        };

        const kinds = {
            particle: { name: "particles", color: "rgba(200,205,225,.95)" },
            organic: { name: "organic residue", color: "rgba(255,214,102,.9)" },
            metal: { name: "metal ions", color: "rgba(255,105,120,.95)" },
            oxide: { name: "native oxide", color: "rgba(120,180,255,.7)" }
        };

        root.innerHTML =
            head("Try it: clean the wafer") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="300" role="img" aria-label="A close-up of a dirty wafer surface with particles, organic residue, metal ions, and a thin native oxide that different cleaning baths remove"></canvas>' +
            '<div class="fd-stat-row">' + stat("Particles", "n_particle") + stat("Organic residue", "n_organic") + stat("Metal ions", "n_metal") + stat("Native oxide", "n_oxide") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            '<div class="fd-play" data-baths>' +
            Object.keys(baths).map(function (k) { return '<button type="button" class="fd-sim-btn" data-bath="' + k + '">' + baths[k].name + "</button>"; }).join("") +
            '<button type="button" class="fd-sim-btn" data-dirty>🧪 Contaminate again</button></div>' +
            '<p class="fd-sim-note" data-out="note">Pick a bath. Each one targets different contamination.</p>' +
            '<p class="fd-sim-formula">One established method is RCA cleaning. Each bath targets a different kind of contamination, so a clean surface needs the right baths in turn.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const rand = mulberry(33);

        let items = [];
        let t = 0;

        function fill() {

            items = [];

            for (let i = 0; i < 16; i++) { items.push({ kind: "particle", x: 40 + rand() * 600, y: 70 + rand() * 90, r: 5 + rand() * 4, life: 1 }); }
            for (let i = 0; i < 8; i++) { items.push({ kind: "organic", x: 40 + rand() * 600, y: 80 + rand() * 80, r: 10 + rand() * 8, life: 1 }); }
            for (let i = 0; i < 14; i++) { items.push({ kind: "metal", x: 40 + rand() * 600, y: 150 + rand() * 40, r: 3, life: 1 }); }
        }

        function counts() {

            const c = { particle: 0, organic: 0, metal: 0, oxide: 0 };

            items.forEach(function (it) { if (it.life > 0.99) { c[it.kind]++; } });
            c.oxide = oxide ? 1 : 0;

            return c;
        }

        let oxide = true;

        function status() {

            const c = counts();

            Object.keys(kinds).forEach(function (k) {
                out(root, "n_" + k, k === "oxide" ? (c.oxide ? "present" : "gone") : c[k]);
            });

            const left = c.particle + c.organic + c.metal;

            out(root, "verdict", left === 0 && !c.oxide ? "Clean: ready for the next step" : (left === 0 ? "Contamination removed, only the thin native oxide remains" : "Still contaminated"));

            if (left === 0) {
                F.reward("mems-rca-clean", 10, "You cleaned a wafer");
            }
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 300);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, 680, 300);

            // silicon with native oxide
            ctx.fillStyle = "rgba(170,179,207,.5)";
            ctx.fillRect(20, 200, 640, 80);

            if (oxide) {
                ctx.fillStyle = kinds.oxide.color;
                ctx.fillRect(20, 192, 640, 8);
            }

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("silicon wafer surface", 28, 262);

            items.forEach(function (it) {

                if (it.life <= 0) { return; }

                ctx.globalAlpha = clamp(it.life, 0, 1);
                ctx.fillStyle = kinds[it.kind].color;
                ctx.beginPath();

                if (it.kind === "organic") {
                    ctx.ellipse(it.x, 189, it.r * 1.6, it.r * 0.5, 0, 0, Math.PI * 2);
                } else if (it.kind === "metal") {
                    ctx.arc(it.x, 189 - (it.y - 150) * 0.1, it.r, 0, Math.PI * 2);
                } else {
                    ctx.arc(it.x, 189 - it.r + (it.y % 5), it.r, 0, Math.PI * 2);
                }

                ctx.fill();
                ctx.globalAlpha = 1;
            });

            // legend
            let lx = 28;

            ctx.font = "11px sans-serif";

            Object.keys(kinds).forEach(function (k) {

                ctx.fillStyle = kinds[k].color;
                ctx.fillRect(lx, 16, 10, 10);
                ctx.fillStyle = "rgba(245,247,255,.88)";
                ctx.fillText(kinds[k].name, lx + 14, 25);
                lx += 40 + kinds[k].name.length * 6;
            });
        }

        animate(root, function (dt) {

            t += dt;

            items.forEach(function (it) {

                if (it.removing) {

                    it.life -= dt * 1.4;

                    if (it.life <= 0) { it.life = 0; it.removing = false; status(); }
                }
            });

            draw();
        });

        root.querySelectorAll("[data-bath]").forEach(function (b) {

            b.addEventListener("click", function () {

                const bath = baths[b.dataset.bath];

                items.forEach(function (it) {

                    if (bath.cleans.indexOf(it.kind) >= 0 && it.life > 0.99) {
                        it.removing = true;
                    }
                });

                if (bath.cleans.indexOf("oxide") >= 0) { oxide = false; }

                out(root, "note", baths[b.dataset.bath].name + ": " + bath.text);
                setTimeout(status, 800);
            });
        });

        root.querySelector("[data-dirty]").addEventListener("click", function () {

            oxide = true;
            fill();
            status();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            oxide = true;
            fill();
            out(root, "note", "Pick a bath. Each one targets different contamination.");
            status();
        });

        fill();
        status();
        draw();
    };


    /* ======================================
       UNIT 5: GOWNING
    ====================================== */

    SIMS["mems-gown"] = function (root) {

        const items = [
            { id: "suit", name: "Cleanroom suit", cut: 0.62, text: "Covers normal clothing and contains fibers and particles." },
            { id: "face", name: "Face and hair covering", cut: 0.2, text: "Reduces contamination from hair, skin, and respiratory droplets." },
            { id: "gloves", name: "Gloves", cut: 0.12, text: "Stop oils, salts, and particles from transferring from hands to wafers." },
            { id: "eyes", name: "Eye protection", cut: 0, text: "This one protects you around chemicals and equipment. It does not change the particles reaching the wafer." }
        ];

        const defaults = { move: 1 };
        const state = { move: 1, on: {} };

        root.innerHTML =
            head("Try it: gown up") +
            art("0 0 340 190", "A person figure with a suit, face and hair covering, gloves, and eye protection that can each be put on, with particles coming off them") +
            '<div class="fd-stat-row">' + stat("Particles shed per minute", "shed") + stat("Compared with bare clothes", "rel") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<div class="fd-play" data-items>' +
            items.map(function (it) { return '<button type="button" class="fd-sim-btn" data-item="' + it.id + '">' + it.name + "</button>"; }).join("") + "</div>" +
            '<p class="fd-sim-note" data-out="note">Tap an item to put it on or take it off.</p>' +
            seg("How the operator moves", "move", [["0.5", "Slowly"], ["1", "Normally"], ["3", "Quickly"], ["6", "Rushing"]]) +
            '<p class="fd-sim-formula">Cleanroom rule: protect the wafer from yourself. Illustrative: a person in everyday clothes sheds on the order of a million particles a minute.</p>';

        const svg = root.querySelector("svg");

        function emission() {

            let e = 1;

            items.forEach(function (it) { if (state.on[it.id]) { e -= it.cut; } });

            return Math.max(0.03, e);
        }

        function update() {

            const e = emission();
            const shed = 1e6 * e * state.move;
            const bare = 1e6 * state.move;

            const suit = state.on.suit;
            const face = state.on.face;
            const gloves = state.on.gloves;
            const eyes = state.on.eyes;

            let s = "";

            // body
            s += rect(122, 70, 96, 100, suit ? "rgba(245,247,255,.85)" : "rgba(120,160,220,.7)", "rgba(245,247,255,.8)");
            s += rect(90, 74, 28, 70, suit ? "rgba(245,247,255,.85)" : "rgba(120,160,220,.7)", "rgba(245,247,255,.8)");
            s += rect(222, 74, 28, 70, suit ? "rgba(245,247,255,.85)" : "rgba(120,160,220,.7)", "rgba(245,247,255,.8)");

            // hands
            s += '<circle cx="104" cy="152" r="9" style="fill:' + (gloves ? "rgba(84,224,199,.9)" : "rgba(255,200,170,.9)") + ';stroke:rgba(245,247,255,.8)"/>';
            s += '<circle cx="236" cy="152" r="9" style="fill:' + (gloves ? "rgba(84,224,199,.9)" : "rgba(255,200,170,.9)") + ';stroke:rgba(245,247,255,.8)"/>';

            // head
            s += '<circle cx="170" cy="46" r="26" style="fill:' + (face ? "rgba(245,247,255,.9)" : "rgba(255,200,170,.9)") + ';stroke:rgba(245,247,255,.8)"/>';

            if (!face) { s += '<path d="M146,40 q24,-26 48,0" style="fill:none;stroke:rgba(120,80,40,.95);stroke-width:5"/>'; }
            if (face) { s += rect(152, 50, 36, 12, "rgba(170,230,255,.9)", "rgba(245,247,255,.8)"); }

            s += rect(154, 36, 32, 8, eyes ? "rgba(84,224,199,.55)" : "rgba(6,10,24,.35)", eyes ? "rgba(84,224,199,1)" : "rgba(245,247,255,.4)");

            // particles
            const n = Math.round(clamp(Math.log10(shed + 1) - 3, 0, 4) * 9);

            for (let i = 0; i < n; i++) {

                const a = i * 2.399963;
                const r = 70 + (i * 7 % 28);

                s += '<circle cx="' + (170 + Math.cos(a) * r * 1.25).toFixed(1) + '" cy="' + (96 + Math.sin(a) * r * 0.7).toFixed(1) + '" r="1.6" style="fill:rgba(255,214,102,.95)"/>';
            }

            svg.innerHTML = s + label(170, 186, "particles shed into the room", 6.5, "middle", "var(--muted)");

            out(root, "shed", shed >= 1e6 ? (shed / 1e6).toFixed(1) + " million" : Math.round(shed / 1000).toLocaleString() + ",000");
            out(root, "rel", Math.round(shed / bare * 100) + "%");

            root.querySelectorAll("[data-item]").forEach(function (b) {
                b.classList.toggle("on", !!state.on[b.dataset.item]);
            });

            const chip = root.querySelector('[data-out="chip"]');

            if (shed < 80000) {

                out(root, "verdict", "Well contained: the wafer is protected");
                chip.textContent = "✓ Cleanroom ready";
                chip.className = "fd-chip";
                F.reward("mems-gown-ready", 10, "You gowned correctly");

            } else if (shed < 400000) {

                out(root, "verdict", "Better, but there are still gaps");
                chip.textContent = "⚠ Keep going";
                chip.className = "fd-chip gold";

            } else {

                out(root, "verdict", "The operator is a major contamination source");
                chip.textContent = "✕ Not ready";
                chip.className = "fd-chip rose";
            }
        }

        root.querySelectorAll("[data-item]").forEach(function (b) {

            b.addEventListener("click", function () {

                const id = b.dataset.item;
                const it = items.filter(function (x) { return x.id === id; })[0];

                state.on[id] = !state.on[id];
                out(root, "note", it.name + ": " + it.text);
                update();
            });
        });

        wire(root, state, defaults, function () {

            update();
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.on = {};
            out(root, "note", "Tap an item to put it on or take it off.");
            update();
        });

        update();
    };


    /* ======================================
       UNIT 6: PROCESS ORDER GAME
    ====================================== */

    SIMS["mems-flow"] = function (root) {

        const steps = [
            { n: "Design", d: "Device layout", why: "Everything starts as a design that becomes the mask pattern." },
            { n: "Cleanroom entry", d: "Gown correctly", why: "The operator has to be gowned before going near an open wafer." },
            { n: "Wafer cleaning", d: "Remove contaminants", why: "A contaminated starting surface creates defects that last through every later step." },
            { n: "Deposition", d: "Add material", why: "A film has to exist before it can be patterned." },
            { n: "Patterning", d: "Lithography", why: "Resist is patterned to mark where material will be removed." },
            { n: "Etching", d: "Transfer the pattern", why: "Material is removed wherever the resist does not protect it." },
            { n: "Inspection", d: "Check the result", why: "Defects are caught before more processing is done." }
        ];

        const rand = mulberry(Date.now() % 100000);
        const state = { next: 0, mistakes: 0, order: [] };

        root.innerHTML =
            head("Game: put the steps in order") +
            '<div class="fd-stat-row">' + stat("Placed", "placed") + stat("Mistakes", "miss") + "</div>" +
            '<p class="fd-sim-note">Tap the steps in the order a fabrication run happens.</p>' +
            '<div class="fd-q-options" data-pool></div>' +
            '<p class="fd-q-feedback" data-out="fb"></p>' +
            '<ol class="fd-sim-note" data-done style="margin:6px 0 0 20px"></ol>';

        const pool = root.querySelector("[data-pool]");
        const done = root.querySelector("[data-done]");

        function shuffle() {

            const a = steps.map(function (s, i) { return i; });

            for (let i = a.length - 1; i > 0; i--) {

                const j = Math.floor(rand() * (i + 1));
                const t = a[i];

                a[i] = a[j];
                a[j] = t;
            }

            state.order = a;
        }

        function render() {

            pool.innerHTML = state.order.filter(function (i) { return i >= state.next; }).map(function (i) {
                return '<button type="button" data-i="' + i + '">' + steps[i].n + " · " + steps[i].d + "</button>";
            }).join("");

            done.innerHTML = steps.slice(0, state.next).map(function (s) { return "<li>" + s.n + ": " + s.why + "</li>"; }).join("");

            out(root, "placed", state.next + " of " + steps.length);
            out(root, "miss", state.mistakes);

            pool.querySelectorAll("button").forEach(function (b) {

                b.addEventListener("click", function () {

                    const i = parseInt(b.dataset.i, 10);

                    if (i === state.next) {

                        state.next++;
                        out(root, "fb", "✅ " + steps[i].why);

                        if (state.next === steps.length) {

                            out(root, "fb", "✅ In order. The order matters because later processes depend on structures created earlier." + (state.mistakes === 0 ? " No mistakes!" : ""));
                            F.reward("mems-flow-done", state.mistakes === 0 ? 20 : 10, "You ordered a whole fabrication run");
                        }

                        render();

                    } else {

                        state.mistakes++;
                        out(root, "fb", "❌ Not yet. Think about what has to exist before " + steps[i].n.toLowerCase() + " can happen.");
                        out(root, "miss", state.mistakes);
                        b.classList.add("shake");
                        setTimeout(function () { b.classList.remove("shake"); }, 400);
                    }
                });
            });
        }

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.next = 0;
            state.mistakes = 0;
            out(root, "fb", "");

            shuffle();
            render();
        });

        shuffle();
        render();
    };


    /* ======================================
       UNIT 6: INSPECTION GAME
    ====================================== */

    SIMS["mems-inspect"] = function (root) {

        const defaults = { tool: "optical" };
        const state = { tool: "optical", found: {} };

        root.innerHTML =
            head("Game: find the defects") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="330" role="img" aria-label="A magnified view of a patterned die with hidden defects: particles, scratches, and tiny flaws that only an electron microscope can see. Tap a defect to mark it"></canvas>' +
            '<div class="fd-stat-row">' + stat("Defects found", "found") + stat("This tool can see", "sees") + "</div>" +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
            seg("Inspection tool", "tool", [["optical", "🔬 Optical microscope"], ["sem", "🖥️ SEM"]]) +
            '<p class="fd-sim-formula">Optical microscopy suits routine inspection of patterns, particles, and visible defects. A scanning electron microscope reveals much finer detail.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const defects = [
            { x: 120, y: 90, kind: "particle", small: false },
            { x: 300, y: 230, kind: "scratch", small: false },
            { x: 520, y: 80, kind: "particle", small: false },
            { x: 430, y: 270, kind: "missing", small: false },
            { x: 210, y: 175, kind: "tiny", small: true },
            { x: 590, y: 200, kind: "tiny", small: true },
            { x: 360, y: 120, kind: "tiny", small: true }
        ];

        function visible(d) { return !d.small || state.tool === "sem"; }

        function update() {

            const total = defects.filter(visible).length;
            const got = defects.filter(function (d) { return visible(d) && state.found[defects.indexOf(d)]; }).length;

            out(root, "found", got + " of " + total);
            out(root, "sees", state.tool === "optical" ? "large defects" : "large and tiny");
            out(root, "verdict", got === total ? (state.tool === "sem" ? "Every defect found" : "All the large ones found. Try the SEM for the tiny ones.") : "Tap anything that looks wrong");

            if (got === total && state.tool === "sem") {
                F.reward("mems-inspect-all", 15, "You found every defect");
            }

            draw();
        }

        function draw() {

            ctx.clearRect(0, 0, 680, 330);
            ctx.fillStyle = state.tool === "sem" ? "rgba(30,34,44,1)" : "rgba(26,32,56,1)";
            ctx.fillRect(0, 0, 680, 330);

            // repeating pattern: rows of rectangles
            ctx.fillStyle = state.tool === "sem" ? "rgba(200,205,215,.55)" : "rgba(120,180,255,.35)";

            for (let r = 0; r < 6; r++) {

                for (let c = 0; c < 11; c++) {

                    if (r === 3 && c === 7) { continue; } // missing feature

                    ctx.fillRect(24 + c * 60, 20 + r * 52, 44, 34);
                }
            }

            defects.forEach(function (d, i) {

                if (!visible(d)) { return; }

                ctx.fillStyle = "rgba(255,214,102,.95)";
                ctx.strokeStyle = "rgba(255,214,102,.95)";
                ctx.lineWidth = d.small ? 1.4 : 3;

                if (d.kind === "particle") {

                    ctx.beginPath();
                    ctx.arc(d.x, d.y, 9, 0, Math.PI * 2);
                    ctx.fill();

                } else if (d.kind === "scratch") {

                    ctx.beginPath();
                    ctx.moveTo(d.x - 50, d.y - 20);
                    ctx.lineTo(d.x + 60, d.y + 18);
                    ctx.stroke();

                } else if (d.kind === "tiny") {

                    ctx.beginPath();
                    ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                if (state.found[i]) {

                    ctx.strokeStyle = "rgba(84,224,199,1)";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(d.x, d.y, 22, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            // the missing feature shows as a gap, so mark that spot when found
            ctx.fillStyle = "rgba(245,247,255,.6)";
            ctx.font = "11px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(state.tool === "sem" ? "scanning electron microscope view" : "optical microscope view", 12, 322);
        }

        canvas.addEventListener("click", function (e) {

            const rc = canvas.getBoundingClientRect();
            const px = (e.clientX - rc.left) * 680 / rc.width;
            const py = (e.clientY - rc.top) * 330 / rc.height;

            defects.forEach(function (d, i) {

                if (visible(d) && Math.hypot(px - d.x, py - d.y) < (d.kind === "scratch" ? 55 : 20)) {
                    state.found[i] = true;
                }
            });

            update();
        });

        wire(root, state, defaults, update);

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.found = {};
            update();
        });

        update();
    };


    // Load the other MEMS simulator files, which build on these helpers.
    // (Pages that only use these helpers, such as the supercapacitor course, skip them.)
    (document.querySelector('.fd-sim[data-sim^="mems-"]') ? [
        ["fabMemsFabScript", "diagram-sims-mems-fab.js"],
        ["fabMemsMumpsScript", "diagram-sims-mems-mumps.js"],
        ["fabMemsSensorsScript", "diagram-sims-mems-sensors.js"],
        ["fabMemsOpticsScript", "diagram-sims-mems-optics.js"],
        ["fabMemsFluidicScript", "diagram-sims-mems-fluidic.js"],
        ["fabMemsPkgScript", "diagram-sims-mems-pkg.js"]
    ] : []).concat(document.querySelector('.fd-sim[data-sim^="mems-3d-"]') ? [["fabMems3dScript", "diagram-sims-mems-3d.js"]] : []).forEach(function (f) {

        if (document.getElementById(f[0])) {
            return;
        }

        const more = document.createElement("script");

        more.id = f[0];
        more.src = f[1];

        document.head.appendChild(more);
    });

    document.querySelectorAll('.fd-sim[data-sim^="mems-"]').forEach(F.mount);

})();
