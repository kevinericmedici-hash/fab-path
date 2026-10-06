/* ========================================
   INTERACTIVE DIAGRAMS

   Loaded by script.js on any page that has an
   interactive diagram. Two kinds:

   1. Tap-to-explain. A .module-visual.fet-diagram
      whose SVG has [data-hotspot="id"] groups and a
      <script type="application/json" class="fd-hotspot-data">
      block:
        { hint, parts: { id: { role, color, title, text } } }
      Tapping a group highlights it and shows its
      card under the diagram.

   2. Simulators. An element
      <div class="module-visual fd-sim" data-sim="name">
      is filled in by SIMS[name]: sliders that drive a
      live drawing and readout.
======================================== */

(function () {

    if (window.__fabInteractive) {
        return;
    }

    window.__fabInteractive = true;

    const NS = "http://www.w3.org/2000/svg";

    const CSS = `
/* ---------- tap to explain ---------- */

.fd-hot [data-hotspot] {
    cursor: pointer;
    transition: opacity .25s ease;
    outline: none;
}

.fd-hot [data-hotspot]:hover:not(.fd-active) .fd-hit,
.fd-hot [data-hotspot]:focus-visible .fd-hit {
    fill: rgba(255, 255, 255, .08) !important;
    stroke: rgba(255, 255, 255, .5) !important;
    stroke-width: 1 !important;
    stroke-dasharray: 3 3;
}

.fd-hot.fd-has-active [data-hotspot]:not(.fd-active) {
    opacity: .28;
}

.fd-hot [data-hotspot].fd-active .fd-hit {
    fill: rgba(84, 224, 199, .1) !important;
    stroke: var(--accent) !important;
    stroke-width: 1.2 !important;
    stroke-dasharray: 4 3;
}

@keyframes fd-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .45; }
}

.fd-hot.fd-hot-hint [data-hotspot] {
    animation: fd-pulse 1.8s ease-in-out 2;
}

.fd-card {
    margin: -14px 0 30px;
    padding: 16px 18px;
    border: 1px solid var(--border);
    border-left: 4px solid var(--accent);
    border-radius: 16px;
    background: rgba(255, 255, 255, .035);
    text-align: left;
    min-height: 92px;
    transition: border-color .25s ease;
}

.fd-card[data-color="gold"] { border-left-color: #ffd666; }
.fd-card[data-color="rose"] { border-left-color: #ff6978; }
.fd-card[data-color="teal"] { border-left-color: var(--accent); }

.fd-card h4 {
    margin: 4px 0 6px;
    font-size: 1.15rem;
}

.fd-card p {
    margin: 0;
    color: var(--muted);
    line-height: 1.55;
    font-size: .97rem;
}

.fd-card .fd-hint {
    color: var(--muted);
    font-size: .97rem;
}

.fd-chip {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    font-size: .72rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--accent);
}

.fd-sim .fd-chip {
    text-transform: none;
    letter-spacing: 0;
    font-size: .82rem;
}

.fd-chip.gold { color: #ffd666; }
.fd-chip.rose { color: #ff6978; }

.fd-card-nav {
    margin-top: 10px;
    display: flex;
    gap: 14px;
}

.fd-card-nav button {
    background: none;
    border: 0;
    padding: 0;
    color: var(--accent);
    font: inherit;
    font-size: .9rem;
    font-weight: 700;
    cursor: pointer;
}

/* ---------- simulators ---------- */

.module-visual.fd-sim {
    display: block;
    padding: 18px 18px 14px;
    text-align: left;
    font-size: 1rem;
    overflow: visible;
}

.fd-sim-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
}

.fd-sim-title {
    font-size: .74rem;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--accent);
}

.fd-sim button.fd-sim-btn {
    background: rgba(255, 255, 255, .06);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px 12px;
    color: var(--text);
    font: inherit;
    font-size: .8rem;
    font-weight: 700;
    cursor: pointer;
}

.fd-sim button.fd-sim-btn:hover {
    border-color: var(--accent);
}

.fd-sim svg.fd-sim-art {
    width: 100%;
    height: auto;
    display: block;
    max-width: 520px;
    margin: 0 auto;
}

.fd-sim-readout {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px 14px;
    margin: 6px 0 4px;
}

.fd-sim-big {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -.02em;
}

.fd-sim-big small {
    font-size: .85rem;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0;
}

.fd-sim-note {
    margin: 2px 0 8px;
    color: var(--muted);
    font-size: .9rem;
    line-height: 1.5;
}

.fd-sim-controls {
    display: grid;
    gap: 10px;
    margin-top: 8px;
}

.fd-sim-row label {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: .9rem;
    font-weight: 700;
    margin-bottom: 2px;
}

.fd-sim-row label span {
    color: var(--accent);
    font-variant-numeric: tabular-nums;
}

.fd-sim-row input[type="range"] {
    width: 100%;
    accent-color: var(--accent);
    margin: 0;
}

.fd-sim-quick {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
}

.fd-sim-formula {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: .88rem;
}

@media (max-width: 600px) {

    .module-visual.fd-sim {
        padding: 12px 12px 10px;
    }

    .fd-sim-big {
        font-size: 1.4rem;
    }

    .fd-card {
        margin: -10px 0 24px;
    }
}

@media (prefers-reduced-motion: reduce) {

    .fd-hot.fd-hot-hint [data-hotspot] {
        animation: none;
    }
}
`;


    function injectStyles() {

        if (document.getElementById("fabInteractiveStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "fabInteractiveStyles";
        style.textContent = CSS;

        document.head.appendChild(style);
    }


    function esc(text) {

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }


    /* ======================================
       TAP TO EXPLAIN
    ====================================== */

    function setupHotspots(box, config) {

        const parts = config.parts || {};
        const ids = Object.keys(parts);

        const spots =
            Array.prototype.slice.call(box.querySelectorAll("[data-hotspot]"));

        if (!spots.length || !ids.length) {
            return;
        }

        const card = document.createElement("div");

        card.className = "fd-card";
        card.setAttribute("aria-live", "polite");

        box.after(card);

        box.classList.add("fd-hot", "fd-hot-hint");

        let current = null;

        function showHint() {

            card.removeAttribute("data-color");

            card.innerHTML =
                '<p class="fd-hint">👆 ' +
                esc(config.hint || "Tap a part of the diagram to learn more.") +
                "</p>";
        }

        function select(id) {

            current = id;

            box.classList.remove("fd-hot-hint");
            box.classList.toggle("fd-has-active", Boolean(id));

            spots.forEach(function (spot) {
                spot.classList.toggle("fd-active", spot.dataset.hotspot === id);
            });

            if (!id || !parts[id]) {
                showHint();
                return;
            }

            const part = parts[id];

            card.setAttribute("data-color", part.color || "teal");

            card.innerHTML =
                '<span class="fd-chip ' + esc(part.color || "") + '">' +
                esc(part.role || "") + "</span>" +
                "<h4>" + esc(part.title || id) + "</h4>" +
                "<p>" + esc(part.text || "") + "</p>" +
                '<div class="fd-card-nav">' +
                '<button type="button" data-step="-1">← Previous part</button>' +
                '<button type="button" data-step="1">Next part →</button>' +
                "</div>";
        }

        card.addEventListener("click", function (e) {

            const button = e.target.closest("button[data-step]");

            if (!button || current === null) {
                return;
            }

            const step = parseInt(button.dataset.step, 10);
            const index = ids.indexOf(current);

            select(ids[(index + step + ids.length) % ids.length]);
        });

        spots.forEach(function (spot, i) {

            spot.style.animationDelay = (i * 0.2) + "s";

            spot.addEventListener("click", function (e) {

                e.stopPropagation();

                select(current === spot.dataset.hotspot ? null : spot.dataset.hotspot);
            });

            spot.addEventListener("keydown", function (e) {

                if (e.key === "Enter" || e.key === " ") {

                    e.preventDefault();

                    select(current === spot.dataset.hotspot ? null : spot.dataset.hotspot);
                }
            });
        });

        box.addEventListener("click", function (e) {

            if (!e.target.closest("[data-hotspot]")) {
                select(null);
            }
        });

        showHint();
    }


    /* ======================================
       SIMULATOR HELPERS
    ====================================== */

    let uid = 0;

    function slider(opts) {

        const id = "fdSim" + (++uid);

        return '<div class="fd-sim-row"><label for="' + id + '">' + opts.label +
            ' <span data-val="' + opts.key + '"></span></label>' +
            '<input type="range" id="' + id + '" data-key="' + opts.key + '" min="' +
            opts.min + '" max="' + opts.max + '" step="' + opts.step + '" value="' +
            opts.value + '"></div>';
    }

    function arrow(x1, y1, x2, y2, color, width) {

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const head = Math.min(7, len * 0.6);
        const bx = x2 - ux * head;
        const by = y2 - uy * head;
        const px = -uy * head * 0.45;
        const py = ux * head * 0.45;

        return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + bx.toFixed(1) +
            '" y2="' + by.toFixed(1) + '" style="stroke:' + color +
            ';stroke-width:' + (width || 1.6) + '"/>' +
            '<polygon points="' + x2 + "," + y2 + " " +
            (bx + px).toFixed(1) + "," + (by + py).toFixed(1) + " " +
            (bx - px).toFixed(1) + "," + (by - py).toFixed(1) +
            '" style="fill:' + color + '"/>';
    }

    function text(x, y, label, size, anchor, fill) {

        return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") +
            '" style="font-size:' + (size || 7) + "px;fill:" + (fill || "var(--muted)") +
            '">' + label + "</text>";
    }

    const ACCENT = "var(--accent)";
    const GOLD = "rgba(255,214,102,.95)";
    const ROSE = "rgba(255,105,120,.95)";
    const TEXT = "var(--text)";


    const SIMS = {};


    /* ======================================
       SIM: wall shear stress in a channel
       tau = 6 mu Q / (w h^2)
    ====================================== */

    SIMS.shear = function (root) {

        const MU = 0.0007; // Pa s, culture medium near 37 C
        const defaults = { q: 143, h: 100, w: 1.0 };
        const state = { q: defaults.q, h: defaults.h, w: defaults.w };

        root.innerHTML =
            '<div class="fd-sim-head"><span class="fd-sim-title">Try it: set the shear stress</span>' +
            '<button type="button" class="fd-sim-btn" data-reset>Reset</button></div>' +
            '<svg class="fd-sim-art" viewBox="0 0 340 182" role="img" aria-label="Side view of a flow channel: arrows show the flow speed profile, and red arrows show the drag on the cells on the floor"></svg>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big"><span data-out="tau"></span> Pa <small>(<span data-out="dyn"></span> dyn/cm²)</small></div>' +
            '<span class="fd-chip" data-out="status"></span></div>' +
            '<svg class="fd-sim-art" viewBox="0 0 340 40" role="img" aria-label="Log scale gauge of shear stress with the brain-like range highlighted" data-gauge></svg>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Flow rate Q", key: "q", min: 10, max: 400, step: 1, value: defaults.q }) +
            slider({ label: "Channel height h", key: "h", min: 40, max: 200, step: 5, value: defaults.h }) +
            slider({ label: "Channel width w", key: "w", min: 0.5, max: 2, step: 0.1, value: defaults.w }) +
            "</div>" +
            '<p class="fd-sim-formula">τ = 6 μ Q ÷ (w h²), with μ = 0.7 mPa·s. Brain capillaries are often modeled at about 1 to 2 Pa.</p>';

        const art = root.querySelector("svg.fd-sim-art");
        const gauge = root.querySelector("svg[data-gauge]");

        function compute() {

            const q = state.q * 1e-9 / 60;     // m^3/s
            const w = state.w * 1e-3;          // m
            const h = state.h * 1e-6;          // m
            const tau = 6 * MU * q / (w * h * h);
            const speed = q / (w * h) * 1000;  // mm/s

            return { tau: tau, speed: speed };
        }

        function status(tau) {

            if (tau < 0.5) { return ["Well below brain-like", ""]; }
            if (tau < 1) { return ["A bit low", "gold"]; }
            if (tau <= 2) { return ["In the brain-like range", "ok"]; }
            if (tau <= 4) { return ["A bit high", "gold"]; }
            return ["Well above brain-like", "rose"];
        }

        function drawArt(res) {

            const hpx = 22 + (state.h - 40) / 160 * 70;
            const floor = 124;
            const top = floor - hpx;
            const vLen = 14 + 90 * Math.sqrt(res.speed / 333);
            const sLen = 8 + 46 * Math.sqrt(res.tau / 10);

            let svg = "";

            svg += '<rect x="20" y="' + (top - 24) + '" width="300" height="24" rx="4" style="fill:rgba(255,255,255,.08);stroke:var(--text);stroke-width:1;opacity:.8"/>';
            svg += '<rect x="20" y="' + floor + '" width="300" height="22" rx="4" style="fill:rgba(255,255,255,.08);stroke:var(--text);stroke-width:1;opacity:.8"/>';
            svg += '<rect x="20" y="' + top + '" width="300" height="' + hpx +
                '" style="fill:rgba(120,180,255,.13);stroke:none"/>';

            for (let x = 36; x <= 304; x += 19) {
                svg += '<circle cx="' + x + '" cy="' + (floor - 4) + '" r="4.2" style="fill:rgba(84,224,199,.55);stroke:' + ACCENT + ';stroke-width:1"/>';
            }

            for (let i = 1; i <= 5; i++) {

                const s = i / 6;
                const len = vLen * 4 * s * (1 - s);
                const y = (top + hpx * s).toFixed(1);

                svg += arrow(78, y, (78 + Math.max(4, len)).toFixed(1), y, TEXT, 1.4);
            }

            [90, 170, 250].forEach(function (x) {
                svg += arrow(x, floor - 11, x + sLen, floor - 11, ROSE, 2);
            });

            svg += '<line x1="12" y1="' + top + '" x2="12" y2="' + floor + '" style="stroke:var(--muted);stroke-width:1"/>';
            svg += '<line x1="8" y1="' + top + '" x2="16" y2="' + top + '" style="stroke:var(--muted);stroke-width:1"/>';
            svg += '<line x1="8" y1="' + floor + '" x2="16" y2="' + floor + '" style="stroke:var(--muted);stroke-width:1"/>';
            svg += text(24, ((top + floor) / 2 + 3).toFixed(1), "h = " + state.h + " µm", 7, "start", "var(--text)");
            svg += text(20, 164, "red arrows: drag on the cells", 7, "start", ROSE);
            svg += text(320, 164, "flow →   mean speed " + res.speed.toFixed(res.speed < 10 ? 1 : 0) + " mm/s", 7, "end");
            svg += text(320, 175, "w = " + state.w.toFixed(1) + " mm (into the page)", 7, "end");

            art.innerHTML = svg;
        }

        function drawGauge(tau) {

            const lo = Math.log10(0.01);
            const hi = Math.log10(50);
            const pos = function (t) {
                return 14 + 312 * (Math.log10(Math.max(0.01, Math.min(50, t))) - lo) / (hi - lo);
            };

            let svg = '<rect x="14" y="14" width="312" height="8" rx="4" style="fill:rgba(255,255,255,.1)"/>';

            svg += '<rect x="' + pos(1).toFixed(1) + '" y="12" width="' + (pos(2) - pos(1)).toFixed(1) +
                '" height="12" rx="3" style="fill:rgba(84,224,199,.45);stroke:' + ACCENT + ';stroke-width:1"/>';

            [0.01, 0.1, 1, 10].forEach(function (t) {
                svg += '<line x1="' + pos(t).toFixed(1) + '" y1="24" x2="' + pos(t).toFixed(1) + '" y2="28" style="stroke:var(--muted)"/>';
                svg += text(pos(t).toFixed(1), 37, t + " Pa", 6.5);
            });

            svg += text(((pos(1) + pos(2)) / 2).toFixed(1), 9, "brain-like", 6.5, "middle", ACCENT);

            const mx = pos(tau).toFixed(1);

            svg += '<polygon points="' + mx + ",26 " + (mx - 5) + ",34 " + (+mx + 5) + ',34" style="fill:' + GOLD + '"/>';

            gauge.innerHTML = svg;
        }

        function update() {

            const res = compute();
            const st = status(res.tau);

            const tau = res.tau < 10 ? res.tau.toFixed(2) : res.tau.toFixed(1);

            root.querySelector('[data-out="tau"]').textContent = tau;
            root.querySelector('[data-out="dyn"]').textContent = (res.tau * 10).toFixed(res.tau * 10 < 100 ? 1 : 0);

            const chip = root.querySelector('[data-out="status"]');

            chip.textContent = st[0];
            chip.className = "fd-chip " + (st[1] === "ok" ? "" : st[1]);

            root.querySelector('[data-val="q"]').textContent = state.q + " µL/min";
            root.querySelector('[data-val="h"]').textContent = state.h + " µm";
            root.querySelector('[data-val="w"]').textContent = state.w.toFixed(1) + " mm";

            root.querySelector('[data-out="note"]').textContent =
                "Doubling the flow doubles the shear. Halving the height makes it four times larger, because height is squared.";

            drawArt(res);
            drawGauge(res.tau);
        }

        root.querySelectorAll("input[type=range]").forEach(function (input) {

            input.addEventListener("input", function () {

                state[input.dataset.key] = parseFloat(input.value);

                update();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            Object.keys(defaults).forEach(function (key) {

                state[key] = defaults[key];
                root.querySelector('input[data-key="' + key + '"]').value = defaults[key];
            });

            update();
        });

        update();
    };


    /* ======================================
       SIM: receptor occupancy
       occupancy = [L] / ([L] + Kd)
    ====================================== */

    SIMS.binding = function (root) {

        const defaults = { l: 1, kd: 1 }; // log10 nM: 10 nM and 10 nM
        const state = { l: defaults.l, kd: defaults.kd };

        root.innerHTML =
            '<div class="fd-sim-head"><span class="fd-sim-title">Try it: fill the receptors</span>' +
            '<button type="button" class="fd-sim-btn" data-reset>Reset</button></div>' +
            '<svg class="fd-sim-art" viewBox="0 0 340 190" role="img" aria-label="Left: a field of receptors, with the occupied ones filled. Right: the binding curve with a marker at the current concentration"></svg>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big">Occupancy <span data-out="occ"></span></div>' +
            '<span class="fd-chip" data-out="ratio"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Ligand concentration [L]", key: "l", min: -1, max: 3, step: 0.05, value: defaults.l }) +
            '<div class="fd-sim-quick"><button type="button" class="fd-sim-btn" data-l="0">1 nM</button>' +
            '<button type="button" class="fd-sim-btn" data-l="1">10 nM</button>' +
            '<button type="button" class="fd-sim-btn" data-l="2">100 nM</button></div>' +
            slider({ label: "Binding strength (Kd)", key: "kd", min: -1, max: 3, step: 0.05, value: defaults.kd }) +
            "</div>" +
            '<p class="fd-sim-formula">Occupancy = [L] ÷ ([L] + K<sub>d</sub>). Both sliders are on a log scale.</p>';

        const art = root.querySelector("svg.fd-sim-art");

        function nm(logv) {

            const v = Math.pow(10, logv);

            if (v < 1) { return v.toFixed(2) + " nM"; }
            if (v < 10) { return v.toFixed(1) + " nM"; }
            return Math.round(v) + " nM";
        }

        function drawArt(occ, L, Kd) {

            const total = 40;
            const filled = Math.round(occ * total);
            let svg = "";

            svg += text(82, 14, "receptors on a cell", 7.5, "middle", "var(--text)");
            svg += '<rect x="14" y="92" width="136" height="0" style="fill:none"/>';

            for (let i = 0; i < total; i++) {

                const col = i % 8;
                const row = Math.floor(i / 8);
                const cx = 24 + col * 16.5;
                const cy = 30 + row * 20;

                if (i < filled) {
                    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="7" style="fill:rgba(84,224,199,.5);stroke:' + ACCENT + ';stroke-width:1.2"/>';
                    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="2.8" style="fill:' + GOLD + '"/>';
                } else {
                    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="7" style="fill:rgba(255,255,255,.05);stroke:var(--muted);stroke-width:1;stroke-dasharray:2 2"/>';
                }
            }

            svg += text(82, 144, filled + " of " + total + " receptors hold a ligand", 7, "middle");
            svg += '<circle cx="30" cy="160" r="3.4" style="fill:' + GOLD + '"/>' + text(37, 163, "ligand", 6.5, "start");
            svg += '<circle cx="76" cy="160" r="5" style="fill:rgba(84,224,199,.5);stroke:' + ACCENT + '"/>' + text(85, 163, "occupied", 6.5, "start");
            svg += '<circle cx="128" cy="160" r="5" style="fill:rgba(255,255,255,.05);stroke:var(--muted);stroke-dasharray:2 2"/>' + text(137, 163, "empty", 6.5, "start");

            // curve panel
            const x0 = 190, x1 = 330, y0 = 150, y1 = 30;
            const px = function (logL) { return x0 + (logL + 1) / 4 * (x1 - x0); };
            const py = function (o) { return y0 - o * (y0 - y1); };

            svg += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '" style="stroke:var(--muted)"/>';
            svg += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + (y1 - 6) + '" style="stroke:var(--muted)"/>';
            svg += text(x0 - 4, py(1) + 2, "100%", 6, "end");
            svg += text(x0 - 4, py(0.5) + 2, "50%", 6, "end");
            svg += text(x0 - 4, py(0) + 2, "0", 6, "end");
            [0, 1, 2, 3].forEach(function (p) {
                svg += '<line x1="' + px(p) + '" y1="' + y0 + '" x2="' + px(p) + '" y2="' + (y0 + 4) + '" style="stroke:var(--muted)"/>';
                svg += text(px(p), y0 + 13, Math.pow(10, p) + "", 6);
            });
            svg += text((x0 + x1) / 2, y0 + 25, "[L] in nM (log scale)", 6.5);

            const pts = [];

            for (let p = -1; p <= 3.001; p += 0.1) {
                const o = Math.pow(10, p) / (Math.pow(10, p) + Kd);
                pts.push(px(p).toFixed(1) + "," + py(o).toFixed(1));
            }

            svg += '<line x1="' + x0 + '" y1="' + py(0.5).toFixed(1) + '" x2="' + px(state.kd).toFixed(1) + '" y2="' + py(0.5).toFixed(1) + '" style="stroke:var(--muted);stroke-dasharray:3 3;opacity:.6"/>';
            svg += '<line x1="' + px(state.kd).toFixed(1) + '" y1="' + py(0.5).toFixed(1) + '" x2="' + px(state.kd).toFixed(1) + '" y2="' + y0 + '" style="stroke:var(--muted);stroke-dasharray:3 3;opacity:.6"/>';
            svg += text(px(state.kd).toFixed(1), y0 - 4, "Kd", 7, "middle", ACCENT);
            svg += '<polyline points="' + pts.join(" ") + '" style="fill:none;stroke:' + ACCENT + ';stroke-width:2.2"/>';

            const mx = px(state.l);
            const my = py(occ);

            svg += '<line x1="' + mx.toFixed(1) + '" y1="' + my.toFixed(1) + '" x2="' + mx.toFixed(1) + '" y2="' + y0 + '" style="stroke:' + GOLD + ';stroke-width:1.2"/>';
            svg += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="4.6" style="fill:' + GOLD + ';stroke:var(--bg);stroke-width:1"/>';

            art.innerHTML = svg;
        }

        function update() {

            const L = Math.pow(10, state.l);
            const Kd = Math.pow(10, state.kd);
            const occ = L / (L + Kd);

            const pct = occ * 100;
            const label = pct < 1 ? "under 1%" : pct > 99 ? "over 99%" : Math.round(pct) + "%";

            root.querySelector('[data-out="occ"]').textContent = label;

            const ratio = L / Kd;
            const chip = root.querySelector('[data-out="ratio"]');

            chip.textContent = ratio >= 0.95 && ratio <= 1.05
                ? "[L] = Kd"
                : "[L] is " + (ratio >= 1 ? ratio.toFixed(ratio < 10 ? 1 : 0) + "× Kd" : (1 / ratio).toFixed(1 / ratio < 10 ? 1 : 0) + "× below Kd");

            root.querySelector('[data-val="l"]').textContent = nm(state.l);
            root.querySelector('[data-val="kd"]').textContent = nm(state.kd);

            root.querySelector('[data-out="note"]').textContent =
                Math.abs(ratio - 1) < 0.06
                    ? "When [L] equals Kd, exactly half the receptors are occupied."
                    : ratio > 1
                        ? "More ligand than Kd, so most receptors are occupied. The curve flattens as they fill up."
                        : "Less ligand than Kd, so most receptors are empty. A tighter binder (lower Kd) would fill more of them.";

            drawArt(occ, L, Kd);
        }

        root.querySelectorAll("input[type=range]").forEach(function (input) {

            input.addEventListener("input", function () {

                state[input.dataset.key] = parseFloat(input.value);

                update();
            });
        });

        root.querySelectorAll("button[data-l]").forEach(function (button) {

            button.addEventListener("click", function () {

                state.l = parseFloat(button.dataset.l);
                root.querySelector('input[data-key="l"]').value = state.l;

                update();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.l = defaults.l;
            state.kd = defaults.kd;

            root.querySelector('input[data-key="l"]').value = defaults.l;
            root.querySelector('input[data-key="kd"]').value = defaults.kd;

            update();
        });

        update();
    };


    /* ======================================
       INIT
    ====================================== */

    function init() {

        const boxes = document.querySelectorAll(".module-visual.fet-diagram");
        const sims = document.querySelectorAll(".fd-sim[data-sim]");

        let any = sims.length > 0;

        boxes.forEach(function (box) {

            if (box.querySelector("script.fd-hotspot-data")) {
                any = true;
            }
        });

        if (!any) {
            return;
        }

        injectStyles();

        boxes.forEach(function (box) {

            const data = box.querySelector("script.fd-hotspot-data");

            if (!data) {
                return;
            }

            try {
                setupHotspots(box, JSON.parse(data.textContent));
            } catch (e) {
                // a bad data block should never break the slide
            }
        });

        sims.forEach(function (el) {

            const sim = SIMS[el.dataset.sim];

            if (sim) {
                sim(el);
            }
        });
    }


    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", init);

    } else {

        init();
    }

})();
