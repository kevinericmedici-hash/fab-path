/* ========================================
   SAND TO CHIP: ETCH MATCH GAME, CMP, AND LITHOGRAPHY LOOP

   Unit 10: match the etch gas to the film, then catch the
   endpoint. Unit 11: animated chemical mechanical polishing
   for four real applications. Unit 13: the lithography loop
   (coat, expose, develop, etch, strip) with positive and
   negative resist.

   Registers on window.FabInteract; loaded by diagram-sims-chip.js.
   Teaching models: shapes and timings are illustrative.
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
    const SIMS = F.SIMS;
    const slider = F.slider;

    (function injectStyles() {

        if (document.getElementById("fabChipPatterningStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "fabChipPatterningStyles";

        style.textContent = `
.fd-match {
    display: grid;
    gap: 10px;
    margin: 8px 0 12px;
}

.fd-match-pool {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 44px;
}

.fd-match-card {
    padding: 8px 12px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, .05);
    color: var(--text);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
}

.fd-match-card.sel {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(84, 224, 199, .28);
}

.fd-match-card.shake {
    animation: fd-shake .35s;
    border-color: #ff6978;
}

@keyframes fd-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.fd-match-buckets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
}

.fd-match-bucket {
    padding: 12px;
    border-radius: 14px;
    border: 1px dashed var(--border);
    background: rgba(255, 255, 255, .03);
    text-align: left;
    color: var(--text);
    font: inherit;
    cursor: pointer;
}

.fd-match-bucket:hover,
.fd-match-bucket.sel {
    border-color: var(--accent);
}

.fd-match-bucket b {
    display: block;
    margin-bottom: 2px;
}

.fd-match-bucket small {
    display: block;
    color: var(--muted);
    margin-bottom: 8px;
}

.fd-match-bucket .got {
    display: inline-block;
    margin: 2px 4px 2px 0;
    padding: 3px 9px;
    border-radius: 999px;
    background: rgba(84, 224, 199, .2);
    border: 1px solid var(--accent);
    font-size: .85rem;
    font-weight: 700;
}

.fd-sim hr.fd-rule {
    border: 0;
    border-top: 1px solid var(--border);
    margin: 16px 0 10px;
}
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


    /* ======================================
       UNIT 10: MATCH THE GAS, THEN CATCH THE ENDPOINT
    ====================================== */

    SIMS["chip-etchmatch"] = function (root) {

        const gases = [
            { id: "fl", name: "Fluorine gases", formula: "CF₄, CHF₃", why: "Fluorine forms volatile compounds with silicon dioxide and silicon nitride, which are pumped away." },
            { id: "cl", name: "Chlorine or bromine", formula: "Cl₂, HBr", why: "Chlorine and bromine etch silicon, polysilicon, and aluminum." },
            { id: "o2", name: "Oxygen plasma", formula: "O₂", why: "Oxygen plasma ashes away the photoresist after the etch." }
        ];

        const films = [
            { id: "sio2", label: "Silicon dioxide (SiO₂)", gas: "fl" },
            { id: "sin", label: "Silicon nitride (Si₃N₄)", gas: "fl" },
            { id: "si", label: "Silicon", gas: "cl" },
            { id: "poly", label: "Polysilicon", gas: "cl" },
            { id: "al", label: "Aluminum", gas: "cl" },
            { id: "pr", label: "Photoresist (after the etch)", gas: "o2" }
        ];

        const state = { sel: null, done: {}, matchedAll: false };

        root.innerHTML =
            head("Game: match the gas, then catch the endpoint") +
            '<div class="fd-stat-row">' + stat("Round 1: matched", "n") + stat("Round 2: endpoint", "ep") + "</div>" +
            '<p class="fd-sim-note"><b>Round 1.</b> Tap a film, then tap the gas that etches it.</p>' +
            '<div class="fd-match"><div class="fd-match-pool" data-pool></div><div class="fd-match-buckets" data-buckets></div></div>' +
            '<p class="fd-sim-note" data-out="msg"></p>' +
            '<hr class="fd-rule">' +
            '<p class="fd-sim-note"><b>Round 2.</b> The plasma\'s color shifts when the film clears. Press Start, then press Stop right after the glow changes. Too early leaves film behind. Too late etches into the layer below.</p>' +
            '<svg class="fd-sim-art" viewBox="0 0 340 170" data-ep role="img" aria-label="Left: a wafer cross-section where the film is etched away over time, with the plasma glow above it. Right: the plasma light intensity over time, which drops when the film clears"></svg>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-start>▶ Start etch</button><button type="button" class="fd-sim-btn" data-stop disabled>⏹ Stop etch</button></div>' +
            '<p class="fd-sim-note" data-out="epmsg"></p>';

        const pool = root.querySelector("[data-pool]");
        const buckets = root.querySelector("[data-buckets]");

        function renderMatch() {

            pool.innerHTML = films.filter(function (f) { return !state.done[f.id]; }).map(function (f) {
                return '<button type="button" class="fd-match-card' + (state.sel && state.sel.kind === "film" && state.sel.id === f.id ? " sel" : "") + '" data-film="' + f.id + '">' + f.label + "</button>";
            }).join("");

            buckets.innerHTML = gases.map(function (g) {

                const got = films.filter(function (f) { return state.done[f.id] && f.gas === g.id; });

                return '<button type="button" class="fd-match-bucket' + (state.sel && state.sel.kind === "gas" && state.sel.id === g.id ? " sel" : "") + '" data-gas="' + g.id + '"><b>' + g.name + "</b><small>" + g.formula + "</small>" +
                    got.map(function (f) { return '<span class="got">' + f.label.replace(" (after the etch)", "") + "</span>"; }).join("") + "</button>";
            }).join("");

            const n = Object.keys(state.done).length;

            out(root, "n", n + " of " + films.length);

            pool.querySelectorAll("[data-film]").forEach(function (b) {

                b.addEventListener("click", function () {

                    if (state.sel && state.sel.kind === "gas") {
                        attempt(b.dataset.film, state.sel.id, b);
                    } else {
                        state.sel = { kind: "film", id: b.dataset.film };
                        renderMatch();
                    }
                });
            });

            buckets.querySelectorAll("[data-gas]").forEach(function (b) {

                b.addEventListener("click", function () {

                    if (state.sel && state.sel.kind === "film") {
                        attempt(state.sel.id, b.dataset.gas, b);
                    } else {
                        state.sel = { kind: "gas", id: b.dataset.gas };
                        renderMatch();
                    }
                });
            });
        }

        function attempt(filmId, gasId, el) {

            const film = films.filter(function (f) { return f.id === filmId; })[0];
            const gas = gases.filter(function (g) { return g.id === gasId; })[0];

            state.sel = null;

            if (film.gas === gasId) {

                state.done[filmId] = true;
                out(root, "msg", "✅ " + gas.name + " (" + gas.formula + "): " + gas.why);
                renderMatch();

                if (Object.keys(state.done).length === films.length) {

                    state.matchedAll = true;
                    out(root, "msg", "🏆 All matched! Choose the gas by the film. Now catch the endpoint below.");
                    F.reward("chip-etchmatch-all", 15, "You matched every etch gas to its film");
                }

            } else {

                const right = gases.filter(function (g) { return g.id === film.gas; })[0];

                out(root, "msg", "❌ Not that one. Hint: for " + film.label.replace(" (after the etch)", "") + ", think " + right.name + " (" + right.formula + ").");
                renderMatch();

                const card = root.querySelector('[data-film="' + filmId + '"]');

                if (card) {

                    card.classList.add("shake");
                    setTimeout(function () { card.classList.remove("shake"); }, 400);
                }
            }
        }

        /* ----- round 2: endpoint ----- */

        const svg = root.querySelector("svg[data-ep]");
        const startBtn = root.querySelector("[data-start]");
        const stopBtn = root.querySelector("[data-stop]");
        const rand = mulberry(Date.now() % 100000);

        let running = false;
        let t = 0;
        let endpoint = 5;
        let stopped = false;
        let trace = [];
        let resultKind = "";
        let accN = 0;

        function drawEp() {

            const clear = t >= endpoint;
            const film = clamp(1 - t / endpoint, 0, 1);
            const over = clamp((t - endpoint) * 0.22, 0, 1);

            let s = "";

            // plasma glow
            const glowCol = clear ? "120,180,255" : "255,105,200";

            s += '<circle cx="85" cy="40" r="26" style="fill:rgba(' + glowCol + ',.45);stroke:rgba(' + glowCol + ',.9)"/>';
            s += '<text x="85" y="44" text-anchor="middle" style="font-size:8px;fill:var(--text)">plasma</text>';

            // wafer stack: substrate, underlayer, film
            s += '<rect x="30" y="148" width="110" height="14" style="fill:rgba(170,179,207,.35)"/>';
            s += '<rect x="30" y="' + (136 + over * 8) + '" width="110" height="' + (12 - over * 8) + '" style="fill:rgba(120,180,255,.45)"/>';
            s += '<text x="85" y="157" text-anchor="middle" style="font-size:6.5px;fill:var(--muted)">layer below</text>';
            s += '<rect x="30" y="' + (136 - 50 * film) + '" width="110" height="' + (50 * film) + '" style="fill:rgba(255,214,102,.5);stroke:rgba(255,214,102,.9)"/>';

            if (!clear) {
                s += '<text x="85" y="' + (136 - 25 * film + 3) + '" text-anchor="middle" style="font-size:7px;fill:var(--text)">film being etched</text>';
            }

            // trace
            const x0 = 178, x1 = 330, y0 = 150, y1 = 28;

            s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '" style="stroke:var(--muted)"/>';
            s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + (y1 - 4) + '" style="stroke:var(--muted)"/>';
            s += '<text x="' + x1 + '" y="' + (y0 + 12) + '" text-anchor="end" style="font-size:6.5px;fill:var(--muted)">time</text>';
            s += '<text x="' + (x0 + 4) + '" y="' + (y1 - 8) + '" style="font-size:6.5px;fill:var(--muted)">plasma light</text>';

            if (trace.length > 1) {

                const pts = trace.map(function (q) {
                    return (x0 + q[0] / 10 * (x1 - x0)).toFixed(1) + "," + (y0 - q[1] * (y0 - y1)).toFixed(1);
                });

                s += '<polyline points="' + pts.join(" ") + '" style="fill:none;stroke:' + (clear ? "rgba(120,180,255,.95)" : "rgba(255,105,200,.95)") + ';stroke-width:2"/>';
            }

            if (stopped) {
                s += '<line x1="' + (x0 + t / 10 * (x1 - x0)).toFixed(1) + '" y1="' + y0 + '" x2="' + (x0 + t / 10 * (x1 - x0)).toFixed(1) + '" y2="' + y1 + '" style="stroke:rgba(255,214,102,.9);stroke-dasharray:3 3"/>';
                s += '<line x1="' + (x0 + endpoint / 10 * (x1 - x0)).toFixed(1) + '" y1="' + y0 + '" x2="' + (x0 + endpoint / 10 * (x1 - x0)).toFixed(1) + '" y2="' + y1 + '" style="stroke:rgba(84,224,199,.9);stroke-dasharray:2 3"/>';
                s += '<text x="' + (x0 + endpoint / 10 * (x1 - x0)).toFixed(1) + '" y="' + (y1 - 2) + '" text-anchor="middle" style="font-size:6.5px;fill:rgba(84,224,199,.95)">endpoint</text>';
            }

            svg.innerHTML = s;
        }

        function frame(dt) {

            if (!running) {
                return;
            }

            t += dt;
            accN += dt;

            if (accN > 0.08) {

                accN = 0;

                const v = t < endpoint ? 0.82 + (rand() - 0.5) * 0.08 : 0.34 + (rand() - 0.5) * 0.08;

                trace.push([t, v]);
            }

            if (t >= 10) {
                finish();
            }

            drawEp();
        }

        function finish() {

            running = false;
            stopped = true;
            startBtn.disabled = false;
            stopBtn.disabled = true;
            startBtn.textContent = "▶ Try again";

            const late = t - endpoint;
            let kind;

            if (t < endpoint - 0.05) {
                kind = "early";
                out(root, "epmsg", "Too early: film is still left on the wafer, so some areas would not be etched through. Wait for the glow to change.");
            } else if (late <= 1.3) {
                kind = "good";
                out(root, "epmsg", "🎯 Nice stop, " + late.toFixed(1) + " s after the endpoint. The film is clear with only a tiny overetch.");
            } else {
                kind = "late";
                out(root, "epmsg", "Too late: " + late.toFixed(1) + " s of overetch ate into the layer below. Stop soon after the color changes.");
            }

            out(root, "ep", kind === "good" ? "nailed it" : kind === "early" ? "too early" : "too late");
            drawEp();

            F.reward(kind === "good" ? "chip-endpoint-good" : "chip-endpoint-try", kind === "good" ? 15 : 5, kind === "good" ? "You caught the endpoint" : "You tried the endpoint");
        }

        startBtn.addEventListener("click", function () {

            running = true;
            stopped = false;
            t = 0;
            trace = [[0, 0.82]];
            endpoint = 3.6 + rand() * 2.6;
            startBtn.disabled = true;
            stopBtn.disabled = false;

            out(root, "epmsg", "Etching… watch the plasma glow and the light trace.");
            out(root, "ep", "running");

            drawEp();
        });

        stopBtn.addEventListener("click", function () {

            if (running) {
                finish();
            }
        });

        const reset = root.querySelector("[data-reset]");

        reset.addEventListener("click", function () {

            state.sel = null;
            state.done = {};
            out(root, "msg", "");
            out(root, "ep", "ready");
            out(root, "epmsg", "");
            running = false;
            stopped = false;
            t = 0;
            trace = [];
            startBtn.disabled = false;
            stopBtn.disabled = true;
            startBtn.textContent = "▶ Start etch";

            renderMatch();
            drawEp();
        });

        animate(root, frame);

        out(root, "msg", "Tap a film card, then tap a gas. Or tap a gas first.");
        out(root, "ep", "ready");
        renderMatch();
        drawEp();
    };


    /* ======================================
       UNIT 11: CMP, FOUR REAL USES
    ====================================== */

    SIMS["chip-cmp"] = function (root) {

        const apps = {
            sti: { name: "Shallow trench isolation", stop: "Stops on the silicon nitride", text: "The oxide overfill sits high over the active areas and low over the trenches. CMP wears the high points down first, until it reaches the nitride stop layer, leaving oxide only in the trenches." },
            cu: { name: "Copper damascene", stop: "Leaves copper only in the trenches", text: "Excess copper, then the barrier on top, is polished away, leaving metal only in the trenches. Soft copper in a wide line dishes if you polish too long." },
            w: { name: "Tungsten plugs", stop: "Leaves plugs flush with the insulator", text: "Tungsten covers everything after it fills the contact holes. CMP removes it from the surface and leaves plugs in the holes." },
            ild: { name: "Interlayer dielectric", stop: "Flattens the insulator for the next metal layer", text: "The insulator deposited over metal lines is bumpy. CMP planarizes it so the next layer, and its lithography, starts on a flat surface." }
        };

        const defaults = { app: "sti" };
        const state = { app: "sti", p: 0, playing: true, viewed: {} };

        root.innerHTML =
            head("Watch it: CMP flattens the wafer") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="440" role="img" aria-label="Top: a wafer pressed face down onto a spinning polishing pad with slurry. Bottom: a cross-section showing the layer on the wafer being polished flat"></canvas>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button><button type="button" class="fd-sim-btn" data-replay>↺ Replay</button></div>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="name"></div><span class="fd-chip" data-out="status"></span></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            seg("What is being polished?", "app", [["sti", "Shallow trench isolation"], ["cu", "Copper damascene"], ["w", "Tungsten plugs"], ["ild", "Interlayer dielectric"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Polish progress (drag to scrub)", key: "p", min: 0, max: 100, step: 0.5, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">The wafer is pressed face down onto a spinning pad while slurry flows between them. The chemistry softens the surface, the abrasive removes it, and high points wear away faster than low ones.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const W = canvas.width;

        const BASE = 424;      // y of "height 0" in the cross-section
        const X0 = 60;         // left edge of the cross-section
        const NX = 560;        // width in px

        let t = 0;

        const C = {
            si: "rgba(170,179,207,.5)", pad: "rgba(255,214,102,.8)", nit: "rgba(255,105,120,.7)",
            ox: "rgba(120,180,255,.5)", cu: "rgba(255,170,90,.85)", bar: "rgba(255,105,120,.85)",
            w: "rgba(245,247,255,.65)", metal: "rgba(255,170,90,.85)"
        };

        function smooth(arr, r) {

            const out2 = new Array(arr.length);

            for (let i = 0; i < arr.length; i++) {

                let s = 0;
                let n = 0;

                for (let k = -r; k <= r; k++) {

                    const j = i + k;

                    if (j >= 0 && j < arr.length) { s += arr[j]; n++; }
                }

                out2[i] = s / n;
            }

            return out2;
        }

        // ---- scene data, built once ----
        function build(app) {

            const cols = [];

            for (let i = 0; i < NX; i++) { cols.push({}); }

            if (app === "sti") {

                const layout = [["m", 70], ["t", 40], ["m", 100], ["t", 100], ["m", 70], ["t", 40], ["m", 90], ["t", 50]];
                let x = 0;

                layout.forEach(function (seg2) {

                    for (let i = 0; i < seg2[1] && x < NX; i++, x++) {
                        cols[x] = { mesa: seg2[0] === "m", w: seg2[1] };
                    }
                });

                const base = cols.map(function (c) { return c.mesa ? 56 : 10; });
                const h0 = smooth(base, 14).map(function (v) { return v + 50; });

                return { cols: cols, h0: h0, lmax: Math.max.apply(null, h0), stop: 56, kind: "sti" };
            }

            if (app === "cu") {

                // wide trench 30..130, dense array 200..344, isolated 420..444
                const tr = new Array(NX).fill(0);

                for (let x = 30; x < 130; x++) { tr[x] = 1; }

                for (let k = 0; k < 5; k++) {
                    for (let x = 200 + k * 32; x < 216 + k * 32; x++) { tr[x] = 2; }
                }

                for (let x = 420; x < 444; x++) { tr[x] = 3; }

                const wide = smooth(tr.map(function (v) { return v === 1 ? 1 : 0; }), 12);
                const h0 = wide.map(function (v) { return 133 - 14 * v; });

                return { cols: tr, h0: h0, lmax: 133, kind: "cu" };
            }

            if (app === "w") {

                const holes = new Array(NX).fill(0);

                [100, 260, 420].forEach(function (hx) {
                    for (let x = hx; x < hx + 16; x++) { holes[x] = 1; }
                });

                return { cols: holes, h0: new Array(NX).fill(133), lmax: 133, kind: "w" };
            }

            // ild: metal lines
            const metal = new Array(NX).fill(0);

            [[40, 30], [100, 30], [140, 30], [180, 30], [330, 30], [450, 30]].forEach(function (ln) {
                for (let x = ln[0]; x < ln[0] + ln[1]; x++) { metal[x] = 1; }
            });

            const base2 = metal.map(function (v) { return v ? 50 : 30; });
            const h02 = smooth(base2, 10).map(function (v) { return v + 70; });

            return { cols: metal, h0: h02, lmax: Math.max.apply(null, h02), kind: "ild" };
        }

        const scenes = {};

        Object.keys(apps).forEach(function (k) { scenes[k] = build(k); });

        function level(sc, p) {

            // L descends from lmax to the target as p goes 0..0.85, then overpolish
            const t1 = clamp(p / 0.85, 0, 1);
            const extra = p > 0.85 ? (p - 0.85) / 0.15 : 0;

            let target;

            if (sc.kind === "sti") { target = 56; }
            else if (sc.kind === "cu") { target = 80; }
            else if (sc.kind === "w") { target = 90; }
            else { target = 96; }

            // copper and tungsten also remove a thin barrier near the end
            return { L: sc.lmax - (sc.lmax - target) * t1, extra: extra, target: target };
        }

        function col(ctx2, x, y0, y1, color) {

            if (y1 <= y0) { return; }

            ctx2.fillStyle = color;
            ctx2.fillRect(X0 + x, BASE - y1, 1.4, y1 - y0 + 0.6);
        }

        function drawScene(sc, p) {

            const lv = level(sc, p);
            const L = lv.L;
            const ex = lv.extra;

            for (let x = 0; x < NX; x++) {

                const c = sc.cols[x];
                const h0 = sc.h0[x];

                if (sc.kind === "sti") {

                    const mesa = c.mesa;
                    const top = Math.min(h0, L);

                    col(ctx, x, 0, mesa ? 40 : 10, C.si);

                    if (mesa) {

                        const nitTop = 56 - ex * 2;

                        col(ctx, x, 40, 42, C.pad);
                        col(ctx, x, 42, nitTop, C.nit);
                        col(ctx, x, nitTop, Math.max(nitTop, top), C.ox);

                    } else {

                        const dish = ex * Math.min(10, c.w / 10);

                        col(ctx, x, 10, Math.max(10, top - dish), C.ox);
                    }

                } else if (sc.kind === "cu") {

                    const dielTop = 80;
                    const kind = c;

                    // erosion in the dense array
                    const dense = x >= 196 && x <= 348;
                    const eros = dense ? ex * 5 : 0;
                    const dTop = dielTop - eros;

                    col(ctx, x, 0, dTop, C.ox);

                    if (kind === 0) {

                        // field: barrier on top until polished through, copper overburden above it
                        if (L > dielTop) {

                            col(ctx, x, dTop, dTop + 3, C.bar);
                            col(ctx, x, dTop + 3, Math.max(dTop + 3, Math.min(h0, L)), C.cu);
                        }

                    } else {

                        // in a trench: dielectric dips to 40, barrier lines the bottom and walls, copper fills
                        ctx.clearRect(X0 + x, BASE - dielTop - 2, 1.4, dielTop - 38);
                        col(ctx, x, 0, 40, C.ox);

                        const edge = (sc.cols[x - 1] !== kind) || (sc.cols[x + 1] !== kind);

                        col(ctx, x, 40, 43, C.bar);

                        if (edge) { col(ctx, x, 40, dielTop, C.bar); }

                        const dish = kind === 1 ? ex * 14 : ex * 3;
                        const cuTop = L > dielTop ? Math.min(h0, L) : dielTop - dish - eros;

                        col(ctx, x, 43, Math.max(43, cuTop), C.cu);
                    }

                } else if (sc.kind === "w") {

                    const dielTop = 90;

                    col(ctx, x, 0, 20, C.si);

                    if (c === 0) {

                        col(ctx, x, 20, dielTop, C.ox);

                        if (L > dielTop) {

                            col(ctx, x, dielTop, dielTop + 3, C.bar);
                            col(ctx, x, dielTop + 3, Math.max(dielTop + 3, Math.min(h0, L)), C.w);
                        }

                    } else {

                        const edge = (sc.cols[x - 1] !== 1) || (sc.cols[x + 1] !== 1);

                        col(ctx, x, 20, 23, C.bar);

                        if (edge) { col(ctx, x, 20, dielTop, C.bar); }

                        const wTop = L > dielTop ? Math.min(h0, L) : dielTop - ex * 5;

                        col(ctx, x, 23, Math.max(23, wTop), C.w);
                    }

                } else {

                    // ild
                    col(ctx, x, 0, 30, C.si);

                    if (c === 1) { col(ctx, x, 30, 50, C.metal); }

                    const base = c === 1 ? 50 : 30;
                    const top = Math.min(h0, L - ex * 14);

                    col(ctx, x, base, Math.max(base, top), C.ox);
                }
            }

            // target level guide
            ctx.strokeStyle = "rgba(84,224,199,.7)";
            ctx.setLineDash([5, 4]);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(X0 - 8, BASE - lv.target);
            ctx.lineTo(X0 + NX + 8, BASE - lv.target);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(84,224,199,.95)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("target level", X0 + NX - 70, BASE - lv.target - 6);
        }

        function drawTool(p) {

            const cx = W / 2;
            const padY = 118;

            // platen and pad
            ctx.fillStyle = "rgba(170,179,207,.35)";
            ctx.fillRect(110, padY + 14, 460, 18);
            ctx.fillStyle = "rgba(255,214,102,.28)";
            ctx.fillRect(110, padY, 460, 14);

            // moving pad texture shows it spinning
            ctx.fillStyle = "rgba(245,247,255,.35)";

            for (let x = 110 - ((t * 60) % 30); x < 570; x += 30) {
                ctx.fillRect(Math.max(110, x), padY + 3, 14, 3);
            }

            // wafer carrier and wafer (face down), pressing
            const press = 3 + Math.sin(t * 3) * 0.6;

            ctx.fillStyle = "rgba(245,247,255,.45)";
            ctx.fillRect(cx - 90, padY - 40 + press, 180, 22);
            ctx.fillStyle = "rgba(170,179,207,.75)";
            ctx.fillRect(cx - 80, padY - 18 + press, 160, 12);
            ctx.fillStyle = "rgba(84,224,199,.7)";
            ctx.fillRect(cx - 80, padY - 8 + press, 160, 7);

            ctx.fillStyle = "rgba(245,247,255,.88)";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("wafer, face down", cx, padY - 48);
            ctx.fillText("polishing pad", cx, padY + 52);

            // slurry drip
            ctx.fillStyle = "rgba(255,105,200,.9)";

            for (let k = 0; k < 4; k++) {

                const yy = 30 + ((t * 70 + k * 22) % 90);

                if (yy < padY) {
                    ctx.beginPath();
                    ctx.arc(cx + 120 + k * 4, yy, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.fillStyle = "rgba(255,105,200,.95)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("slurry", cx + 134, 40);

            // rotation arrows
            ctx.strokeStyle = "rgba(245,247,255,.8)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx - 108, padY - 20, 14, 0.3 * Math.PI, 1.7 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx + 150, padY + 44, 14, 0.3 * Math.PI, 1.7 * Math.PI);
            ctx.stroke();
        }

        function render() {

            const sc = scenes[state.app];
            const p = state.p / 100;

            ctx.clearRect(0, 0, W, canvas.height);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, W, canvas.height);

            drawTool(p);
            drawScene(sc, p);

            const a = apps[state.app];
            const lv = level(sc, p);

            out(root, "name", a.name);
            out(root, "text", a.text);

            const chip = root.querySelector('[data-out="status"]');
            let msg;
            let tone = "";

            if (p < 0.02) { msg = "Before polishing"; }
            else if (p < 0.85) { msg = "Polishing: high points first"; tone = "gold"; }
            else if (p < 0.9) { msg = "✓ " + a.stop; }
            else { msg = "Overpolished: " + (state.app === "cu" ? "dishing and erosion" : state.app === "sti" ? "the oxide dishes" : state.app === "w" ? "the plugs recess" : "the insulator gets too thin"); tone = "rose"; }

            chip.textContent = msg;
            chip.className = "fd-chip " + tone;

            setVal(root, "p", Math.round(state.p) + "%");

            const slid = root.querySelector('input[data-key="p"]');

            if (slid && document.activeElement !== slid) {
                slid.value = state.p;
            }

            if (p >= 0.85) {

                state.viewed[state.app] = true;

                if (Object.keys(state.viewed).length === 4) {
                    F.reward("chip-cmp-all", 10, "You watched all four CMP uses");
                }
            }
        }

        function frame(dt) {

            t += dt;

            if (state.playing && state.p < 100) {

                state.p = Math.min(100, state.p + dt * 9);

                if (state.p >= 100) { state.playing = false; }
            }

            render();
        }

        const anim = animate(root, frame);

        bindPause(root, anim);

        function restart() {

            state.p = 0;
            state.playing = true;

            anim.kick();
        }

        root.querySelector("[data-replay]").addEventListener("click", restart);

        // manual scrubbing pauses the autoplay
        root.querySelector('input[data-key="p"]').addEventListener("input", function (e) {

            state.playing = false;
            state.p = parseFloat(e.target.value);

            render();
        });

        root.querySelectorAll("button[data-set]").forEach(function (b) {

            b.addEventListener("click", function () {

                const parts = b.dataset.set.split(":");

                state[parts[0]] = parts[1];

                root.querySelectorAll("button[data-set]").forEach(function (x) {
                    x.classList.toggle("on", x.dataset.set === "app:" + state.app);
                });

                restart();
                render();
            });
        });

        const resetBtn = root.querySelector("[data-reset]");

        resetBtn.addEventListener("click", function () {

            state.app = "sti";
            root.querySelectorAll("button[data-set]").forEach(function (x) {
                x.classList.toggle("on", x.dataset.set === "app:sti");
            });

            restart();
            render();
        });

        root.querySelectorAll("button[data-set]").forEach(function (x) {
            x.classList.toggle("on", x.dataset.set === "app:" + state.app);
        });

        render();
    };


    /* ======================================
       UNIT 13: THE LITHOGRAPHY LOOP
    ====================================== */

    SIMS["chip-litholoop"] = function (root) {

        const steps = [
            { title: "1 · Coat", text: "The wafer is spun with a thin coat of photoresist, a polymer that reacts to light." },
            { title: "2 · Expose", text: "Light shines through the reticle, a stencil drawn 4× larger than the pattern. The lens shrinks the image onto the resist, and the resist changes wherever the light lands." },
            { title: "3 · Develop", text: "A developer washes away part of the resist. Positive resist loses the exposed parts. Negative resist keeps them." },
            { title: "4 · Etch", text: "Plasma removes the film wherever the resist does not protect it." },
            { title: "5 · Strip", text: "The resist is stripped, leaving the pattern in the film. The wafer then heads to the next layer: the loop repeats." }
        ];

        const defaults = { tone: "pos" };
        const state = { tone: "pos", step: 0, auto: true };

        root.innerHTML =
            head("Watch it: the litho loop") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="440" role="img" aria-label="An animated lithography loop: a reticle is lit from above, a lens shrinks its image onto photoresist on a wafer, the resist is developed, the film is etched, and the resist is stripped"></canvas>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="title"></div><span class="fd-chip" data-out="tone"></span></div>' +
            '<p class="fd-sim-note" data-out="text"></p>' +
            '<div class="fd-play"><button type="button" class="fd-sim-btn" data-pause>⏸ Pause</button>' +
            steps.map(function (s, i) { return '<button type="button" class="fd-sim-btn" data-stepbtn="' + i + '">' + (i + 1) + "</button>"; }).join("") +
            "</div>" +
            seg("Resist tone", "tone", [["pos", "Positive resist"], ["neg", "Negative resist"]]) +
            '<p class="fd-sim-formula">Coat, expose, develop, etch, strip. Same light, opposite result: positive resist loses the exposed parts, negative resist keeps them. The reticle must be drawn as the opposite pattern depending on the tone.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const W = canvas.width;

        const CX = W / 2;
        const SUB_Y = 392;      // top of the substrate
        const FILM_T = 22;
        const RES_T = 26;
        const FILM_Y = SUB_Y - FILM_T;
        const WAF_X0 = 70;
        const WAF_X1 = 610;

        // printed features: [centre offset, width] on the wafer; the reticle draws them 4x larger and 4x farther apart
        const feats = [[-50, 12], [0, 20], [50, 12]];
        const STEP_LEN = 3.6;

        let t = 0;
        let stepT = 0;

        function drawReticleAndOptics(expose, tt) {

            // lamp
            ctx.fillStyle = "rgba(255,214,102,.9)";
            ctx.beginPath();
            ctx.arc(CX, 26, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(245,247,255,.85)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("UV light", CX + 18, 30);

            // reticle plate
            const rY = 70;

            ctx.fillStyle = "rgba(120,180,255,.18)";
            ctx.fillRect(CX - 250, rY, 500, 12);
            ctx.strokeStyle = "rgba(120,180,255,.7)";
            ctx.strokeRect(CX - 250, rY, 500, 12);

            // chrome blocks everywhere except the openings (reticle features are 4x the wafer features)
            ctx.fillStyle = "rgba(20,24,40,.95)";

            let x = CX - 250;

            const opens = feats.map(function (f) { return [CX + f[0] * 4 - f[1] * 2, CX + f[0] * 4 + f[1] * 2]; });

            opens.forEach(function (o) {

                ctx.fillRect(x, rY, Math.max(0, o[0] - x), 12);
                x = o[1];
            });

            ctx.fillRect(x, rY, CX + 250 - x, 12);

            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("reticle: pattern drawn 4× larger", CX - 250, rY - 8);

            // lens
            ctx.strokeStyle = "rgba(245,247,255,.85)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(CX, 190, 90, 14, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.fillText("lens shrinks the image 4×", CX + 98, 194);

            // rays
            if (expose > 0) {

                ctx.strokeStyle = "rgba(255,214,102," + (0.35 + 0.35 * Math.sin(tt * 8)).toFixed(2) + ")";
                ctx.lineWidth = 2;

                feats.forEach(function (f) {

                    const rx0 = CX + f[0] * 4 - f[1] * 2;
                    const rx1 = CX + f[0] * 4 + f[1] * 2;
                    const wx0 = CX + f[0] - f[1] / 2;
                    const wx1 = CX + f[0] + f[1] / 2;
                    const resTop = FILM_Y - RES_T;

                    ctx.beginPath();
                    ctx.moveTo(rx0, rY + 12);
                    ctx.lineTo(CX + (rx0 - CX) * 0.55, 190);
                    ctx.lineTo(wx0, resTop);
                    ctx.moveTo(rx1, rY + 12);
                    ctx.lineTo(CX + (rx1 - CX) * 0.55, 190);
                    ctx.lineTo(wx1, resTop);
                    ctx.stroke();

                    ctx.fillStyle = "rgba(255,214,102,.14)";
                    ctx.beginPath();
                    ctx.moveTo(rx0, rY + 12);
                    ctx.lineTo(rx1, rY + 12);
                    ctx.lineTo(wx1, resTop);
                    ctx.lineTo(wx0, resTop);
                    ctx.closePath();
                    ctx.fill();
                });
            }
        }

        function filmBlocks() {

            // returns the x-ranges (on the wafer) of the film left at the end
            const e = feats.map(function (f) { return [CX + f[0] - f[1] / 2, CX + f[0] + f[1] / 2]; });

            if (state.tone === "pos") {

                // film stays everywhere except under the exposed openings
                const blocks = [];
                let x = WAF_X0;

                e.forEach(function (r) {
                    blocks.push([x, r[0]]);
                    x = r[1];
                });

                blocks.push([x, WAF_X1]);

                return blocks;
            }

            return e;
        }

        function draw() {

            ctx.clearRect(0, 0, W, canvas.height);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, W, canvas.height);

            const s = state.step;
            const frac = clamp(stepT / STEP_LEN, 0, 1);

            // substrate
            ctx.fillStyle = "rgba(170,179,207,.4)";
            ctx.fillRect(WAF_X0, SUB_Y, WAF_X1 - WAF_X0, 36);
            ctx.fillStyle = "rgba(245,247,255,.8)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("wafer", WAF_X0 + 6, SUB_Y + 24);

            const exposedRanges = feats.map(function (f) { return [CX + f[0] - f[1] / 2, CX + f[0] + f[1] / 2]; });
            const blocks = filmBlocks();

            // film layer
            if (s < 3) {

                ctx.fillStyle = "rgba(255,214,102,.55)";
                ctx.fillRect(WAF_X0, FILM_Y, WAF_X1 - WAF_X0, FILM_T);

            } else if (s === 3) {

                // etch eats the unprotected film progressively
                ctx.fillStyle = "rgba(255,214,102,.55)";
                ctx.fillRect(WAF_X0, FILM_Y, WAF_X1 - WAF_X0, FILM_T);

                // carve away film where it is unprotected
                const clearAreas = state.tone === "pos" ? exposedRanges : complementRanges(exposedRanges);

                clearAreas.forEach(function (r) {

                    ctx.fillStyle = "rgba(6,10,24,1)";
                    ctx.fillRect(r[0], FILM_Y, r[1] - r[0], FILM_T * frac);
                });

            } else {

                blocks.forEach(function (b) {

                    ctx.fillStyle = "rgba(255,214,102,.55)";
                    ctx.fillRect(b[0], FILM_Y, b[1] - b[0], FILM_T);
                });
            }

            // resist layer
            const resTop = FILM_Y - RES_T;
            const resFill = "rgba(255,105,120,.55)";

            if (s === 0) {

                // coating spreads from the centre outwards
                const half = (WAF_X1 - WAF_X0) / 2 * frac;

                ctx.fillStyle = resFill;
                ctx.fillRect(CX - half, resTop, half * 2, RES_T);

                // spinning drops
                ctx.fillStyle = "rgba(255,105,120,.9)";

                for (let k = 0; k < 5; k++) {
                    ctx.beginPath();
                    ctx.arc(CX - 40 + ((t * 120 + k * 40) % 80), resTop - 20 - (k % 3) * 6, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

            } else if (s === 1) {

                ctx.fillStyle = resFill;
                ctx.fillRect(WAF_X0, resTop, WAF_X1 - WAF_X0, RES_T);

                // exposed regions glow as the light lands
                exposedRanges.forEach(function (r) {

                    ctx.fillStyle = "rgba(255,214,102," + (0.2 + 0.7 * frac).toFixed(2) + ")";
                    ctx.fillRect(r[0], resTop, r[1] - r[0], RES_T);
                });

            } else if (s === 2) {

                const keep = state.tone === "pos" ? complementRanges(exposedRanges) : exposedRanges;
                const gone = state.tone === "pos" ? exposedRanges : complementRanges(exposedRanges);

                keep.forEach(function (r) {

                    ctx.fillStyle = resFill;
                    ctx.fillRect(r[0], resTop, r[1] - r[0], RES_T);
                });

                gone.forEach(function (r) {

                    // the dissolving part shrinks away
                    ctx.fillStyle = "rgba(255,105,120," + (0.55 * (1 - frac)).toFixed(2) + ")";
                    ctx.fillRect(r[0], resTop, r[1] - r[0], RES_T * (1 - frac));
                });

            } else if (s === 3) {

                const keep = state.tone === "pos" ? complementRanges(exposedRanges) : exposedRanges;

                keep.forEach(function (r) {

                    ctx.fillStyle = resFill;
                    ctx.fillRect(r[0], resTop, r[1] - r[0], RES_T);
                });

                // etch ions
                ctx.fillStyle = "rgba(255,255,255,.9)";

                for (let k = 0; k < 24; k++) {

                    const x = WAF_X0 + ((k * 53 + t * 40) % (WAF_X1 - WAF_X0));
                    const y = 110 + ((t * 140 + k * 17) % 190);

                    ctx.beginPath();
                    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = "rgba(245,247,255,.85)";
                ctx.font = "12px sans-serif";
                ctx.fillText("plasma etch", 74, 130);

            } else {

                // strip: leftover resist fades out
                const keep = state.tone === "pos" ? complementRanges(exposedRanges) : exposedRanges;

                keep.forEach(function (r) {

                    ctx.fillStyle = "rgba(255,105,120," + (0.55 * (1 - frac)).toFixed(2) + ")";
                    ctx.fillRect(r[0], resTop + RES_T * frac, r[1] - r[0], RES_T * (1 - frac));
                });

                if (frac > 0.6) {

                    ctx.fillStyle = "rgba(84,224,199,.95)";
                    ctx.font = "bold 14px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("✓ the pattern is now in the film", CX, 360);
                }
            }

            // optics only during expose (and a faint outline otherwise)
            drawReticleAndOptics(s === 1 ? 1 : 0, t);

            // labels
            ctx.fillStyle = "rgba(245,247,255,.85)";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("photoresist", WAF_X1 - 70, resTop - 6);
            ctx.fillText("film", WAF_X1 - 40, FILM_Y + 15);
        }

        function complementRanges(ranges) {

            const res = [];
            let x = WAF_X0;

            ranges.forEach(function (r) {
                res.push([x, r[0]]);
                x = r[1];
            });

            res.push([x, WAF_X1]);

            return res;
        }

        function showStep() {

            const st = steps[state.step];

            out(root, "title", st.title);
            out(root, "text", st.text);

            root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {
                b.classList.toggle("on", parseInt(b.dataset.stepbtn, 10) === state.step);
            });

            const chip = root.querySelector('[data-out="tone"]');

            chip.textContent = state.tone === "pos" ? "positive resist" : "negative resist";
            chip.className = "fd-chip " + (state.tone === "pos" ? "" : "gold");
        }

        function frame(dt) {

            t += dt;
            stepT += dt;

            if (state.auto && stepT >= STEP_LEN) {

                stepT = 0;
                state.step = (state.step + 1) % steps.length;

                showStep();

                if (state.step === 0) {
                    F.reward("chip-litholoop-cycle", 5, "You watched a full litho loop");
                }
            }

            draw();
        }

        root.querySelectorAll("button[data-stepbtn]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.auto = false;
                state.step = parseInt(b.dataset.stepbtn, 10);
                stepT = 0;

                showStep();
                draw();
            });
        });

        root.querySelectorAll("button[data-set]").forEach(function (b) {

            b.addEventListener("click", function () {

                state.tone = b.dataset.set.split(":")[1];

                root.querySelectorAll("button[data-set]").forEach(function (x) {
                    x.classList.toggle("on", x.dataset.set === "tone:" + state.tone);
                });

                state.auto = true;
                state.step = 0;
                stepT = 0;

                showStep();
                draw();
            });
        });

        const anim = animate(root, frame);

        bindPause(root, anim);

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.tone = "pos";
            state.auto = true;
            state.step = 0;
            stepT = 0;

            root.querySelectorAll("button[data-set]").forEach(function (x) {
                x.classList.toggle("on", x.dataset.set === "tone:pos");
            });

            showStep();
            draw();
        });

        root.querySelectorAll("button[data-set]").forEach(function (x) {
            x.classList.toggle("on", x.dataset.set === "tone:" + state.tone);
        });

        showStep();
        draw();
    };


    // Mount any patterning sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="chip-"]').forEach(F.mount);

})();
