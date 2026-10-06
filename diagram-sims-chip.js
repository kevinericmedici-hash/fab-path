/* ========================================
   SAND TO CHIP: INTERACTIVE SIMULATORS

   Registers chip-* simulators on window.FabInteract
   (diagram-interact.js). A simulator is mounted by:
     <div class="module-visual fd-sim" data-sim="chip-xxx"></div>
   Loaded by script.js on pages that contain one.

   All of these are teaching models. Numbers are
   typical or illustrative, not tool-specific.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F) {
        return;
    }

    const slider = F.slider;
    const arrow = F.arrow;
    const text = F.text;

    const ACCENT = F.colors.accent;
    const GOLD = F.colors.gold;
    const ROSE = F.colors.rose;
    const TEXT = F.colors.text;
    const BLUE = "rgba(120,180,255,.95)";

    const KB = 8.617e-5; // eV/K


    /* ---------- extra styles ---------- */

    (function injectStyles() {

        if (document.getElementById("fabChipSimStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "fabChipSimStyles";

        style.textContent = `
.fd-seg {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 4px 0 2px;
}

.fd-seg-label {
    width: 100%;
    font-size: .85rem;
    font-weight: 700;
}

.fd-sim button.fd-sim-btn.on {
    background: var(--accent);
    border-color: var(--accent);
    color: #04201b;
}

.fd-sim canvas.fd-sim-canvas {
    display: block;
    width: 100%;
    max-width: 340px;
    margin: 0 auto;
    border-radius: 14px;
    background: rgba(255, 255, 255, .03);
}

.fd-sim .fd-stat-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
    margin: 8px 0;
}

.fd-sim .fd-stat {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, .03);
}

.fd-sim .fd-stat b {
    display: block;
    font-size: 1.15rem;
    letter-spacing: -.01em;
}

.fd-sim .fd-stat span {
    font-size: .72rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .08em;
    font-weight: 700;
}

.fd-sim table.fd-truth {
    border-collapse: collapse;
    margin: 6px auto 0;
    font-size: .85rem;
}

.fd-sim table.fd-truth th,
.fd-sim table.fd-truth td {
    border: 1px solid var(--border);
    padding: 3px 12px;
    text-align: center;
}

.fd-sim table.fd-truth tr.hit td {
    background: rgba(84, 224, 199, .18);
    font-weight: 800;
}
`;

        document.head.appendChild(style);

    })();


    /* ---------- helpers ---------- */

    function seg(label, key, options) {

        return '<div class="fd-seg"><span class="fd-seg-label">' + label + "</span>" +
            options.map(function (o) {
                return '<button type="button" class="fd-sim-btn" data-set="' + key + ":" + o[0] + '">' + o[1] + "</button>";
            }).join("") + "</div>";
    }

    function wire(root, state, defaults, update) {

        function sync() {

            root.querySelectorAll("input[type=range]").forEach(function (input) {
                input.value = state[input.dataset.key];
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

    function fmtNm(nm) {

        if (nm >= 1000) {
            return (nm / 1000).toFixed(nm >= 10000 ? 0 : 2) + " µm";
        }

        if (nm >= 100) {
            return Math.round(nm) + " nm";
        }

        return nm.toFixed(nm >= 10 ? 1 : 2) + " nm";
    }

    function sup(n) {

        const map = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

        return String(n).split("").map(function (c) { return map[c] || c; }).join("");
    }

    function sci(v) {

        if (!isFinite(v) || v <= 0) {
            return "0";
        }

        const e = Math.floor(Math.log10(v));
        const m = v / Math.pow(10, e);

        return m.toFixed(1) + " × 10" + sup(e);
    }

    function art(viewBox, aria) {

        return '<svg class="fd-sim-art" viewBox="' + viewBox + '" role="img" aria-label="' + aria + '"></svg>';
    }

    function stat(label, key) {

        return '<div class="fd-stat"><b data-out="' + key + '"></b><span>' + label + "</span></div>";
    }

    function rectS(x, y, w, h, fill, stroke, rx) {

        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) +
            '" style="fill:' + fill + ";stroke:" + (stroke || "none") + ';stroke-width:1.2"/>';
    }

    function circ(x, y, r, fill, stroke) {

        return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="fill:' + fill + ";stroke:" + (stroke || "none") + '"/>';
    }

    function line(x1, y1, x2, y2, color, width, dash) {

        return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" style="stroke:' + color +
            ";stroke-width:" + (width || 1) + (dash ? ";stroke-dasharray:" + dash : "") + '"/>';
    }

    const SIMS = F.SIMS;


    /* ======================================
       OXIDE GROWTH (Deal-Grove, typical constants)
    ====================================== */

    SIMS["chip-oxide"] = function (root) {

        const consts = {
            dry: { b0: 772, eb: 1.23, c: 3.71e6, ec: 2.0 },
            wet: { b0: 386, eb: 0.78, c: 9.7e7, ec: 2.05 }
        };

        const defaults = { mode: "dry", temp: 1000, logt: 0 };
        const state = { mode: defaults.mode, temp: defaults.temp, logt: defaults.logt };

        function thicknessUm(mode, tempC, hours) {

            const k = consts[mode];
            const tk = tempC + 273.15;
            const B = k.b0 * Math.exp(-k.eb / (KB * tk));
            const BA = k.c * Math.exp(-k.ec / (KB * tk));
            const A = B / BA;

            return (A / 2) * (Math.sqrt(1 + 4 * B * hours / (A * A)) - 1);
        }

        root.innerHTML =
            head("Try it: grow an oxide") +
            art("0 0 340 200", "Left: a silicon cross-section with oxide growing up and down from the original surface. Right: oxide thickness against time for dry and wet oxidation") +
            '<div class="fd-stat-row">' + stat("Oxide thickness", "x") + stat("Silicon consumed", "cons") + stat("Growth above original surface", "above") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Atmosphere", "mode", [["dry", "Dry (O₂)"], ["wet", "Wet (steam)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Furnace temperature", key: "temp", min: 800, max: 1200, step: 10, value: defaults.temp }) +
            slider({ label: "Time in the furnace", key: "logt", min: -1.3, max: 1, step: 0.02, value: defaults.logt }) +
            "</div>" +
            '<p class="fd-sim-formula">A simplified Deal–Grove model with typical constants, so the numbers are approximate. Thick films grow roughly as x ≈ √(B · t).</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function update() {

            const hours = Math.pow(10, state.logt);
            const x = thicknessUm(state.mode, state.temp, hours) * 1000; // nm
            const xDry = function (h) { return thicknessUm("dry", state.temp, h) * 1000; };
            const xWet = function (h) { return thicknessUm("wet", state.temp, h) * 1000; };

            setVal(root, "temp", state.temp + " °C");
            setVal(root, "logt", hours < 1 ? Math.round(hours * 60) + " min" : hours.toFixed(1) + " h");

            out(root, "x", fmtNm(x));
            out(root, "cons", fmtNm(x * 0.44));
            out(root, "above", fmtNm(x * 0.56));
            out(root, "note", state.mode === "dry"
                ? "Dry oxide is slow but dense, the quality choice for gate oxides."
                : "Wet oxide grows much faster, so it suits thick isolation oxide.");

            // left: cross-section (schematic height scale)
            const surf = 100;
            const px = function (nm) { return 5 + 52 * Math.sqrt(nm / 3000); };
                        const up = px(x) * 0.56;
            const down = px(x) * 0.44;

            let s = "";

            s += rectS(14, surf + down, 136, 90 - down, "rgba(170,179,207,.16)", "rgba(170,179,207,.55)", 3);
            s += rectS(14, surf - up, 136, up + down, "rgba(255,214,102,.3)", GOLD, 2);
            s += line(10, surf, 154, surf, TEXT, 1, "4 3");
            s += text(82, surf + down + 24, "silicon", 7.5);
            s += text(82, surf - up - 8, "SiO₂", 7.5, "middle", GOLD);
            s += text(158, surf + 3, "original", 6.5, "start");
            s += text(158, surf + 11, "surface", 6.5, "start");
            s += arrow(8, surf - up, 8, surf, GOLD, 1.2);
            s += arrow(8, surf + down, 8, surf, ROSE, 1.2);
            s += text(82, 24, "schematic, not to scale", 6.5);

            // right: thickness vs time (0 to 10 h)
            const gx0 = 196, gx1 = 330, gy0 = 168, gy1 = 28;
            const ymax = Math.max(xDry(10), xWet(10), 50);
            const gx = function (h) { return gx0 + (h / 10) * (gx1 - gx0); };
            const gy = function (v) { return gy0 - (v / ymax) * (gy0 - gy1); };

            function curve(fn) {

                const pts = [];

                for (let h = 0; h <= 10.001; h += 0.25) {
                    pts.push(gx(h).toFixed(1) + "," + gy(fn(Math.max(h, 0.0001))).toFixed(1));
                }

                return pts.join(" ");
            }

            s += line(gx0, gy0, gx1, gy0, "var(--muted)", 1);
            s += line(gx0, gy0, gx0, gy1 - 4, "var(--muted)", 1);
            [0, 5, 10].forEach(function (h) {
                s += text(gx(h), gy0 + 11, h + " h", 6.5);
            });
            s += text(gx0 - 4, gy1 + 2, fmtNm(ymax), 6, "end");
            s += text(gx0 - 4, gy0 + 2, "0", 6, "end");
            s += '<polyline points="' + curve(xDry) + '" style="fill:none;stroke:' + ACCENT + ";stroke-width:" + (state.mode === "dry" ? 2.4 : 1.2) + ";opacity:" + (state.mode === "dry" ? 1 : 0.5) + '"/>';
            s += '<polyline points="' + curve(xWet) + '" style="fill:none;stroke:' + GOLD + ";stroke-width:" + (state.mode === "wet" ? 2.4 : 1.2) + ";opacity:" + (state.mode === "wet" ? 1 : 0.5) + '"/>';
            s += text(gx1, gy(xDry(10)) - 4, "dry", 6.5, "end", ACCENT);
            s += text(gx1, gy(xWet(10)) - 4, "wet", 6.5, "end", GOLD);
            s += circ(gx(Math.min(hours, 10)).toFixed(1), gy(x).toFixed(1), 4.4, GOLD, "var(--bg)");
            s += text(263, 16, "thickness against time", 7.5, "middle", TEXT);

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       LITHOGRAPHY RESOLUTION  CD = k1 * lambda / NA
    ====================================== */

    SIMS["chip-litho"] = function (root) {

        const presets = [
            { name: "g-line", lam: 436, na: 0.45, k1: 0.8 },
            { name: "i-line", lam: 365, na: 0.6, k1: 0.6 },
            { name: "KrF", lam: 248, na: 0.8, k1: 0.45 },
            { name: "ArF", lam: 193, na: 0.93, k1: 0.4 },
            { name: "ArF immersion", lam: 193, na: 1.35, k1: 0.28 },
            { name: "EUV", lam: 13.5, na: 0.33, k1: 0.4 },
            { name: "High-NA EUV", lam: 13.5, na: 0.55, k1: 0.4 }
        ];

        const defaults = { lam: 193, na: 1.35, k1: 0.28 };
        const state = { lam: defaults.lam, na: defaults.na, k1: defaults.k1 };

        root.innerHTML =
            head("Try it: how small can it print?") +
            art("0 0 340 190", "Left: a lens focusing a cone of light onto the wafer; a wider cone means a smaller spot. Right: a row of printed lines whose spacing follows the smallest printable half-pitch") +
            '<div class="fd-sim-readout"><div class="fd-sim-big">Smallest half-pitch <span data-out="cd"></span></div>' +
            '<span class="fd-chip" data-out="warn"></span></div>' +
            '<div class="fd-stat-row">' + stat("Depth of focus (rough)", "dof") + stat("Cone half-angle", "ang") + stat("Versus a human hair", "hair") + "</div>" +
            '<div class="fd-seg"><span class="fd-seg-label">Presets (typical values)</span>' +
            presets.map(function (p, i) {
                return '<button type="button" class="fd-sim-btn" data-preset="' + i + '">' + p.name + "</button>";
            }).join("") + "</div>" +
            '<div class="fd-sim-controls">' +
            slider({ label: "Wavelength λ", key: "lam", min: 10, max: 450, step: 0.5, value: defaults.lam }) +
            slider({ label: "Numerical aperture NA", key: "na", min: 0.2, max: 1.4, step: 0.01, value: defaults.na }) +
            slider({ label: "Process factor k₁", key: "k1", min: 0.25, max: 0.8, step: 0.01, value: defaults.k1 }) +
            "</div>" +
            '<p class="fd-sim-formula">CD = k₁ · λ ÷ NA. Shorter wavelength and larger NA both shrink the feature. For one exposure k₁ cannot go below 0.25.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function presetFor(i) {

            const p = presets[i];

            state.lam = p.lam;
            state.na = p.na;
            state.k1 = p.k1;

            root.querySelectorAll("input[type=range]").forEach(function (input) {
                input.value = state[input.dataset.key];
            });

            update();
        }

        root.querySelectorAll("button[data-preset]").forEach(function (b) {

            b.addEventListener("click", function () {
                presetFor(parseInt(b.dataset.preset, 10));
            });
        });

        function update() {

            const cd = state.k1 * state.lam / state.na;
            const dof = state.lam / (state.na * state.na);
            const n = state.na > 1 ? 1.44 : 1;
            const theta = Math.asin(Math.min(0.999, state.na / n));

            setVal(root, "lam", state.lam.toFixed(state.lam < 100 ? 1 : 0) + " nm");
            setVal(root, "na", state.na.toFixed(2));
            setVal(root, "k1", state.k1.toFixed(2));

            out(root, "cd", fmtNm(cd));
            out(root, "dof", fmtNm(dof));
            out(root, "ang", (theta * 180 / Math.PI).toFixed(0) + "°" + (state.na > 1 ? " (in water)" : ""));
            out(root, "hair", Math.round(70000 / cd).toLocaleString() + "× narrower");

            let warn = "";
            let tone = "rose";

            if (state.lam > 50 && state.na > 1.35) {
                warn = "Beyond water immersion";
            } else if (state.lam < 50 && state.na > 0.6) {
                warn = "Beyond current EUV optics";
            } else if (state.lam > 50 && state.na > 1) {
                warn = "Water immersion";
                tone = "gold";
            }

            const chip = root.querySelector('[data-out="warn"]');

            chip.textContent = warn;
            chip.className = "fd-chip " + tone;
            chip.style.display = warn ? "" : "none";

            // left: lens cone
            let s = "";
            const cx = 80, lensY = 38, waferY = 150;
            const reach = waferY - lensY;
            const spread = Math.tan(theta) * reach;
            const half = Math.min(66, spread);

            s += '<path d="M' + (cx - 66) + "," + (lensY + 6) + " Q" + cx + "," + (lensY - 16) + " " + (cx + 66) + "," + (lensY + 6) + '" style="fill:none;stroke:' + TEXT + ';stroke-width:2.4"/>';
            s += text(cx, 20, "lens", 7);
            s += line(cx - half, lensY + 4, cx, waferY, GOLD, 1.4);
            s += line(cx + half, lensY + 4, cx, waferY, GOLD, 1.4);
            s += '<polygon points="' + (cx - half) + "," + (lensY + 4) + " " + cx + "," + waferY + " " + (cx + half) + "," + (lensY + 4) + '" style="fill:rgba(255,214,102,.12);stroke:none"/>';
            s += rectS(14, waferY, 132, 12, "rgba(170,179,207,.18)", "rgba(170,179,207,.55)", 2);
            s += text(cx, waferY + 24, "wafer", 7);
            s += circ(cx, waferY, 3 + 5 * (cd / 800), GOLD, "var(--bg)");
            s += text(cx, 186, "wider cone, sharper spot", 7, "middle", "var(--muted)");

            // right: printed lines
            const lpx = 6 + (Math.log10(Math.max(cd, 8)) - 0.9) / 2.05 * 34;
            const n2 = Math.floor(150 / (2 * lpx));
            const x0 = 186;

            s += rectS(x0 - 6, 40, 150, 100, "rgba(170,179,207,.1)", "rgba(170,179,207,.35)", 4);

            for (let i = 0; i < n2; i++) {
                s += rectS((x0 + i * 2 * lpx).toFixed(1), 48, lpx.toFixed(1), 84, "rgba(84,224,199,.55)", ACCENT, 0);
            }

            s += line(x0, 146, x0 + lpx, 146, ROSE, 1.5);
            s += text(x0 + lpx / 2, 160, "half-pitch", 6.5, "middle", ROSE);
            s += text(255, 28, "printed lines", 7.5, "middle", TEXT);
            s += text(255, 186, "spacing follows CD", 7, "middle", "var(--muted)");

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       YIELD: wafer map, Y = exp(-D0 * A)
    ====================================== */

    SIMS["chip-yield"] = function (root) {

        const startArea = parseFloat(root.dataset.area) || 100;
        const startD0 = parseFloat(root.dataset.d0) || 0.2;

        const defaults = { loga: Math.log10(startArea), d0: startD0 };
        const state = { loga: defaults.loga, d0: defaults.d0, seed: 7 };

        root.innerHTML =
            head("Try it: yield on a 300 mm wafer") +
            '<canvas class="fd-sim-canvas" width="560" height="560" aria-label="A wafer map: each small square is a die, green if it works and red if a defect landed on it"></canvas>' +
            '<div class="fd-stat-row">' + stat("Die per wafer", "dies") + stat("Good die", "good") + stat("Measured yield", "meas") + stat("Model e<sup>−D₀·A</sup>", "model") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-roll>New random wafer</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Die area A", key: "loga", min: 1, max: 2.9, step: 0.02, value: defaults.loga }) +
            slider({ label: "Defect density D₀", key: "d0", min: 0.02, max: 1, step: 0.01, value: defaults.d0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Killer defects land at random. A die works only if no defect lands on it, so Y ≈ e<sup>−D₀·A</sup>. Bigger die and dirtier fabs both lose yield.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function rng(seedValue) {

            let a = seedValue >>> 0;

            return function () {

                a += 0x6D2B79F5;

                let t = a;

                t = Math.imul(t ^ (t >>> 15), t | 1);
                t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
        }

        function poisson(mean, rand) {

            if (mean > 40) {

                // normal approximation
                const u1 = Math.max(rand(), 1e-9);
                const u2 = rand();
                const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

                return Math.max(0, Math.round(mean + Math.sqrt(mean) * z));
            }

            const limit = Math.exp(-mean);
            let k = 0;
            let p = 1;

            do {
                k++;
                p *= rand();
            } while (p > limit);

            return k - 1;
        }

        function update() {

            const area = Math.pow(10, state.loga);       // mm^2
            const side = Math.sqrt(area);
            const R = 150;
            const usable = 147;
            const wafCm2 = Math.PI * R * R / 100;

            setVal(root, "loga", area < 100 ? area.toFixed(0) + " mm²" : area.toFixed(0) + " mm² (" + (area / 100).toFixed(1) + " cm²)");
            setVal(root, "d0", state.d0.toFixed(2) + " per cm²");

            const rand = rng(state.seed * 9973 + Math.round(state.d0 * 1000));
            const nDef = poisson(state.d0 * wafCm2, rand);
            const defects = [];

            for (let i = 0; i < nDef; i++) {

                const r = R * Math.sqrt(rand());
                const a = rand() * 2 * Math.PI;

                defects.push([r * Math.cos(a), r * Math.sin(a)]);
            }

            const dies = [];
            const nHalf = Math.ceil(R / side) + 1;

            for (let i = -nHalf; i < nHalf; i++) {
                for (let j = -nHalf; j < nHalf; j++) {

                    const x0 = i * side;
                    const y0 = j * side;
                    const corners = [[x0, y0], [x0 + side, y0], [x0, y0 + side], [x0 + side, y0 + side]];

                    if (corners.every(function (c) { return Math.hypot(c[0], c[1]) <= usable; })) {
                        dies.push({ x: x0, y: y0, bad: false });
                    }
                }
            }

            defects.forEach(function (d) {

                const i = Math.floor(d[0] / side);
                const j = Math.floor(d[1] / side);

                for (let k = 0; k < dies.length; k++) {

                    if (Math.floor(dies[k].x / side + 0.5) === i && Math.floor(dies[k].y / side + 0.5) === j) {
                        dies[k].bad = true;
                        break;
                    }
                }
            });

            const total = dies.length;
            const bad = dies.filter(function (d) { return d.bad; }).length;
            const good = total - bad;
            const model = Math.exp(-state.d0 * area / 100);

            out(root, "dies", total.toLocaleString());
            out(root, "good", good.toLocaleString());
            out(root, "meas", total ? (good / total * 100).toFixed(0) + "%" : "n/a");
            out(root, "model", (model * 100).toFixed(0) + "%");
            out(root, "note", total
                ? "Each square is one die. Re-roll the wafer to see the scatter: measured yield wobbles around the model."
                : "That die is bigger than the wafer's usable area.");

            // draw
            const W = canvas.width;
            const scale = (W / 2 - 14) / R;

            ctx.clearRect(0, 0, W, W);
            ctx.save();
            ctx.translate(W / 2, W / 2);

            ctx.beginPath();
            ctx.arc(0, 0, R * scale, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(170,179,207,.16)";
            ctx.fill();
            ctx.strokeStyle = "rgba(170,179,207,.6)";
            ctx.lineWidth = 2;
            ctx.stroke();

            const gap = Math.min(1.2, side * scale * 0.12);

            dies.forEach(function (d) {

                ctx.fillStyle = d.bad ? "rgba(255,105,120,.78)" : "rgba(84,224,199,.62)";
                ctx.fillRect(d.x * scale + gap / 2, d.y * scale + gap / 2, side * scale - gap, side * scale - gap);
            });

            if (defects.length < 900) {

                ctx.fillStyle = "rgba(10,14,28,.85)";

                defects.forEach(function (d) {

                    ctx.beginPath();
                    ctx.arc(d[0] * scale, d[1] * scale, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            ctx.restore();
        }

        root.querySelector("[data-roll]").addEventListener("click", function () {

            state.seed++;

            update();
        });

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       MOSFET: gate voltage opens a channel
    ====================================== */

    SIMS["chip-mosfet"] = function (root) {

        const VT = 0.7;
        const K = 120; // µA / V^2
        const defaults = { vg: 0, vd: 1 };
        const state = { vg: defaults.vg, vd: defaults.vd };

        root.innerHTML =
            head("Try it: turn a transistor on") +
            art("0 0 340 190", "Cross-section of an n-channel MOSFET. Raising the gate voltage past the threshold forms a channel of electrons under the gate, and current flows from source to drain") +
            '<div class="fd-sim-readout"><div class="fd-sim-big">I<sub>D</sub> = <span data-out="id"></span> µA</div>' +
            '<span class="fd-chip" data-out="region"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Gate voltage V<sub>G</sub>", key: "vg", min: 0, max: 2, step: 0.05, value: defaults.vg }) +
            slider({ label: "Drain voltage V<sub>D</sub>", key: "vd", min: 0, max: 2, step: 0.05, value: defaults.vd }) +
            "</div>" +
            '<p class="fd-sim-formula">Threshold V<sub>T</sub> = 0.7 V. Below it there is no channel (cutoff). Above it, current grows with the overdrive V<sub>G</sub> − V<sub>T</sub>.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function update() {

            const ov = state.vg - VT;
            let region = "Cutoff";
            let id = 0;

            if (ov > 0) {

                if (state.vd < ov) {
                    region = "Triode";
                    id = K * (ov * state.vd - state.vd * state.vd / 2);
                } else {
                    region = "Saturation";
                    id = K / 2 * ov * ov;
                }
            }

            setVal(root, "vg", state.vg.toFixed(2) + " V");
            setVal(root, "vd", state.vd.toFixed(2) + " V");
            out(root, "id", id < 10 ? id.toFixed(1) : Math.round(id));

            const chip = root.querySelector('[data-out="region"]');

            chip.textContent = region;
            chip.className = "fd-chip " + (region === "Cutoff" ? "rose" : region === "Triode" ? "gold" : "");

            out(root, "note", region === "Cutoff"
                ? "The gate is below threshold, so no channel forms and the transistor is off."
                : region === "Triode"
                    ? "A channel runs from source to drain, and the transistor behaves like a voltage-controlled resistor."
                    : "The drain voltage is high enough to pinch the channel off near the drain, and the current levels out.");

            let s = "";

            s += rectS(20, 112, 300, 62, "rgba(170,179,207,.14)", "rgba(170,179,207,.5)", 4);
            s += text(170, 166, "p-type body", 7.5, "middle", "var(--muted)");
            s += rectS(46, 112, 70, 26, "rgba(84,224,199,.3)", ACCENT, 3);
            s += rectS(224, 112, 70, 26, "rgba(84,224,199,.3)", ACCENT, 3);
            s += text(81, 129, "n⁺ source", 7, "middle", TEXT);
            s += text(259, 129, "n⁺ drain", 7, "middle", TEXT);
            s += rectS(116, 104, 108, 8, "rgba(255,214,102,.35)", GOLD, 1);
            s += rectS(116, 80, 108, 24, "rgba(245,247,255,.25)", TEXT, 3);
            s += text(170, 96, "gate", 7.5, "middle", TEXT);
            s += line(170, 80, 170, 58, TEXT, 1.4);
            s += text(170, 52, "gate " + state.vg.toFixed(2) + " V", 7.5, "middle", GOLD);
            s += line(259, 112, 259, 70, TEXT, 1.4);
            s += line(259, 70, 259, 62, TEXT, 1.4);
            s += text(259, 56, "drain " + state.vd.toFixed(2) + " V", 7.5, "middle", GOLD);
            s += line(81, 112, 81, 62, TEXT, 1.4);
            s += text(81, 56, "source 0 V", 7.5, "middle", "var(--muted)");

            if (ov > 0) {

                const thick = 2 + 11 * Math.min(1, ov / 1.3);
                const pinch = region === "Saturation";
                const rightT = pinch ? 0.6 : thick;

                s += '<polygon points="116,112 224,112 224,' + (112 + rightT).toFixed(1) + " 116," + (112 + thick).toFixed(1) +
                    '" style="fill:rgba(84,224,199,.55);stroke:' + ACCENT + '"/>';

                const dots = Math.round(4 + thick);

                for (let i = 0; i < dots; i++) {

                    const x = 122 + (i / dots) * 96;
                    const t = thick + (rightT - thick) * ((x - 116) / 108);

                    s += circ(x.toFixed(1), (112 + t * (0.3 + 0.4 * ((i * 7) % 5) / 5)).toFixed(1), 1.8, "#fff");
                }

                if (id > 0) {

                    const len = 20 + 70 * Math.min(1, id / 100);

                    s += arrow(120, 124 + thick, 120 + len, 124 + thick, GOLD, 1.8);
                    s += text(170, 150 + thick, "electrons flow source → drain", 6.5, "middle", GOLD);
                }
            } else {

                s += text(170, 124, "no channel", 7, "middle", ROSE);
            }

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       CMOS GATES
    ====================================== */

    SIMS["chip-gates"] = function (root) {

        const defaults = { gate: "nand", a: 1, b: 1 };
        const state = { gate: defaults.gate, a: defaults.a, b: defaults.b };

        root.innerHTML =
            head("Try it: switch a CMOS gate") +
            art("0 0 340 210", "A CMOS gate drawn as two networks of switches: PMOS transistors between the supply and the output, and NMOS transistors between the output and ground. The switches that conduct set the output") +
            '<div class="fd-sim-readout"><div class="fd-sim-big">Out = <span data-out="o"></span></div><span class="fd-chip" data-out="why"></span></div>' +
            '<table class="fd-truth" data-table></table>' +
            seg("Gate", "gate", [["inv", "Inverter"], ["nand", "NAND"], ["nor", "NOR"]]) +
            seg("Input A", "a", [["0", "A = 0"], ["1", "A = 1"]]) +
            '<div data-bseg>' + seg("Input B", "b", [["0", "B = 0"], ["1", "B = 1"]]) + "</div>" +
            '<p class="fd-sim-formula">A PMOS switch conducts when its input is 0. An NMOS switch conducts when its input is 1. In a CMOS gate exactly one network conducts at a time.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function logic(g, a, b) {

            if (g === "inv") { return a ? 0 : 1; }
            if (g === "nand") { return (a && b) ? 0 : 1; }

            return (a || b) ? 0 : 1;
        }

        function sw(x, y, label, on, kind) {

            const fill = on ? (kind === "p" ? "rgba(255,214,102,.45)" : "rgba(84,224,199,.5)") : "rgba(255,255,255,.05)";
            const stroke = on ? (kind === "p" ? GOLD : ACCENT) : "rgba(170,179,207,.45)";

            return rectS(x, y, 54, 24, fill, stroke, 5) +
                text(x + 27, y + 15, label + (on ? " on" : " off"), 7, "middle", on ? TEXT : "var(--muted)");
        }

        function update() {

            const a = state.a;
            const b = state.gate === "inv" ? 0 : state.b;
            const g = state.gate;
            const out1 = logic(g, a, b);

            root.querySelector("[data-bseg]").style.display = g === "inv" ? "none" : "";

            const pOn = [a === 0, b === 0];
            const nOn = [a === 1, b === 1];

            let upConducts;
            let downConducts;

            if (g === "inv") {
                upConducts = pOn[0];
                downConducts = nOn[0];
            } else if (g === "nand") {
                upConducts = pOn[0] || pOn[1];
                downConducts = nOn[0] && nOn[1];
            } else {
                upConducts = pOn[0] && pOn[1];
                downConducts = nOn[0] || nOn[1];
            }

            out(root, "o", out1);
            out(root, "why", out1 ? "Pull-up conducts: output pulled to the supply" : "Pull-down conducts: output pulled to ground");

            const tbl = [];

            for (let ai = 0; ai < 2; ai++) {

                if (g === "inv") {
                    tbl.push([ai, null, logic(g, ai, 0)]);
                } else {
                    for (let bi = 0; bi < 2; bi++) {
                        tbl.push([ai, bi, logic(g, ai, bi)]);
                    }
                }
            }

            root.querySelector("[data-table]").innerHTML =
                "<tr><th>A</th>" + (g === "inv" ? "" : "<th>B</th>") + "<th>Out</th></tr>" +
                tbl.map(function (row) {

                    const hit = row[0] === a && (g === "inv" || row[1] === b);

                    return '<tr class="' + (hit ? "hit" : "") + '"><td>' + row[0] + "</td>" +
                        (g === "inv" ? "" : "<td>" + row[1] + "</td>") + "<td>" + row[2] + "</td></tr>";
                }).join("");

            const wireOn = function (c) { return c ? ACCENT : "rgba(170,179,207,.4)"; };
            const upC = wireOn(upConducts);
            const dnC = wireOn(downConducts);

            let s = "";

            s += text(170, 14, "VDD (supply)", 7.5, "middle", GOLD);
            s += line(60, 20, 280, 20, GOLD, 2);
            s += text(170, 202, "GND (ground)", 7.5, "middle", "var(--muted)");
            s += line(60, 190, 280, 190, "var(--muted)", 2);

            // pull-up network
            if (g === "inv") {

                s += line(170, 20, 170, 42, upC, 2) + sw(143, 42, "P·A", pOn[0], "p") + line(170, 66, 170, 98, upC, 2);

            } else if (g === "nand") {

                s += line(130, 20, 130, 42, upC, 2) + line(210, 20, 210, 42, upC, 2);
                s += sw(103, 42, "P·A", pOn[0], "p") + sw(183, 42, "P·B", pOn[1], "p");
                s += line(130, 66, 130, 82, upC, 2) + line(210, 66, 210, 82, upC, 2) + line(130, 82, 210, 82, upC, 2) + line(170, 82, 170, 98, upC, 2);

            } else {

                s += line(170, 20, 170, 32, upC, 2) + sw(143, 32, "P·A", pOn[0], "p") + line(170, 56, 170, 64, upC, 2) + sw(143, 64, "P·B", pOn[1], "p") + line(170, 88, 170, 98, upC, 2);
            }

            // output node
            s += circ(170, 102, 4.5, out1 ? GOLD : "rgba(255,255,255,.5)", "var(--bg)");
            s += line(174, 102, 250, 102, TEXT, 1.6);
            s += circ(258, 102, 11, out1 ? "rgba(255,214,102,.5)" : "rgba(255,255,255,.08)", out1 ? GOLD : "var(--muted)");
            s += text(258, 106, String(out1), 10, "middle", TEXT);
            s += text(258, 124, "Out", 7, "middle", "var(--muted)");

            // pull-down network
            if (g === "inv") {

                s += line(170, 106, 170, 126, dnC, 2) + sw(143, 126, "N·A", nOn[0], "n") + line(170, 150, 170, 190, dnC, 2);

            } else if (g === "nand") {

                s += line(170, 106, 170, 114, dnC, 2) + sw(143, 114, "N·A", nOn[0], "n") + line(170, 138, 170, 148, dnC, 2) + sw(143, 148, "N·B", nOn[1], "n") + line(170, 172, 170, 190, dnC, 2);

            } else {

                s += line(170, 106, 170, 120, dnC, 2) + line(130, 120, 210, 120, dnC, 2) + line(130, 120, 130, 136, dnC, 2) + line(210, 120, 210, 136, dnC, 2);
                s += sw(103, 136, "N·A", nOn[0], "n") + sw(183, 136, "N·B", nOn[1], "n");
                s += line(130, 160, 130, 174, dnC, 2) + line(210, 160, 210, 174, dnC, 2) + line(130, 174, 210, 174, dnC, 2) + line(170, 174, 170, 190, dnC, 2);
            }

            s += text(40, 70, "pull-up", 7.5, "middle", GOLD);
            s += text(40, 80, "(PMOS)", 7, "middle", "var(--muted)");
            s += text(40, 150, "pull-down", 7.5, "middle", ACCENT);
            s += text(40, 160, "(NMOS)", 7, "middle", "var(--muted)");

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       ETCH PROFILE: isotropic vs anisotropic
    ====================================== */

    SIMS["chip-etch"] = function (root) {

        const defaults = { depth: 300, aniso: 0 };
        const state = { depth: defaults.depth, aniso: defaults.aniso };

        root.innerHTML =
            head("Try it: etch a trench") +
            art("0 0 340 190", "Cross-section: a patterned mask on a film. The etched cavity is wider under the mask edges when the etch is isotropic, and has vertical walls when it is anisotropic") +
            '<div class="fd-sim-readout"><div class="fd-sim-big">Undercut <span data-out="under"></span> per side</div><span class="fd-chip" data-out="kind"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Etch depth", key: "depth", min: 50, max: 500, step: 10, value: defaults.depth }) +
            slider({ label: "Anisotropy (0 = wet and round, 100 = plasma and straight)", key: "aniso", min: 0, max: 100, step: 1, value: defaults.aniso }) +
            "</div>" +
            '<p class="fd-sim-formula">The mask opening is 300 nm wide. An isotropic etch eats sideways as fast as it eats down, so it undercuts the mask.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function update() {

            const a = state.aniso / 100;
            const d = state.depth;
            const under = (1 - a) * d;
            const pxPerNm = 0.2;
            const x0 = 130;           // opening left edge
            const w0 = 300 * pxPerNm; // 60 px
            const top = 56;
            const filmH = 500 * pxPerNm; // 100 px

            setVal(root, "depth", d + " nm");
            setVal(root, "aniso", state.aniso + "%");
            out(root, "under", fmtNm(under));
            out(root, "kind", state.aniso < 25 ? "Mostly isotropic" : state.aniso > 75 ? "Mostly anisotropic" : "In between");
            out(root, "note", "The feature ends up " + fmtNm(300 + 2 * under) + " wide at the top instead of the 300 nm the mask defined.");

            let s = "";

            s += rectS(40, top + filmH, 260, 28, "rgba(170,179,207,.2)", "rgba(170,179,207,.5)", 2);
            s += text(170, top + filmH + 18, "substrate", 7, "middle", "var(--muted)");
            s += rectS(40, top, 260, filmH, "rgba(255,214,102,.25)", GOLD, 2);

            const pts = [];
            const steps = 24;

            for (let i = 0; i <= steps; i++) {

                const y = (d * i / steps);
                const ext = (1 - a) * Math.sqrt(Math.max(0, d * d - y * y));

                pts.push([(x0 - ext * pxPerNm), top + y * pxPerNm]);
            }

            const left = pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); });
            const right = pts.slice().reverse().map(function (p) {
                return (x0 + w0 + (x0 - p[0])).toFixed(1) + "," + p[1].toFixed(1);
            });

            s += '<polygon points="' + left.concat(right).join(" ") + '" style="fill:var(--bg);stroke:' + ACCENT + ';stroke-width:1.4"/>';
            s += rectS(40, top - 14, x0 - 40, 14, "rgba(255,255,255,.3)", TEXT, 2);
            s += rectS(x0 + w0, top - 14, 300 - (x0 + w0), 14, "rgba(255,255,255,.3)", TEXT, 2);
            s += text(85, top - 4, "mask", 7, "middle", TEXT);
            s += text(x0 + w0 / 2, top - 22, "opening 300 nm", 7, "middle", "var(--muted)");

            if (under > 4) {

                s += arrow(x0, top + 6, x0 - under * pxPerNm, top + 6, ROSE, 1.4);
            }

            s += text(170, 187, "etched to " + d + " nm deep", 7, "middle", "var(--muted)");

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       DOPANT PROFILES (shared plot)
    ====================================== */

    function profilePlot(opts) {

        // opts: xmax (nm), conc(x_nm) in cm^-3, bg, xj (nm or null), peakX
        const x0 = 44, x1 = 330, y0 = 156, y1 = 22;
        const lo = 14, hi = 22;
        const gx = function (x) { return x0 + (x / opts.xmax) * (x1 - x0); };
        const gy = function (c) {

            const l = Math.log10(Math.max(c, 1));

            return y0 - (Math.max(lo, Math.min(hi, l)) - lo) / (hi - lo) * (y0 - y1);
        };

        let s = "";

        s += line(x0, y0, x1, y0, "var(--muted)", 1);
        s += line(x0, y0, x0, y1 - 4, "var(--muted)", 1);

        for (let p = lo; p <= hi; p += 2) {

            s += line(x0 - 3, gy(Math.pow(10, p)), x0, gy(Math.pow(10, p)), "var(--muted)", 1);
            s += text(x0 - 5, (gy(Math.pow(10, p)) + 2).toFixed(1), "10" + sup(p), 6, "end");
        }

        const ticks = 4;

        for (let i = 0; i <= ticks; i++) {

            const xv = opts.xmax * i / ticks;

            s += text(gx(xv).toFixed(1), y0 + 11, fmtNm(xv), 6.5);
        }

        s += text(x0 + (x1 - x0) / 2, y0 + 22, "depth below the surface", 6.5);
        s += text(14, 24, "dopant per cm³", 6.5, "start");

        s += line(x0, gy(opts.bg), x1, gy(opts.bg), ROSE, 1, "4 3");
        s += text(x1, gy(opts.bg) - 3, "wafer's own doping", 6.5, "end", ROSE);

        const pts = [];

        for (let i = 0; i <= 120; i++) {

            const x = opts.xmax * i / 120;

            pts.push(gx(x).toFixed(1) + "," + gy(opts.conc(x)).toFixed(1));
        }

        s += '<polyline points="' + pts.join(" ") + '" style="fill:none;stroke:' + ACCENT + ';stroke-width:2.4"/>';

        if (opts.xj && opts.xj < opts.xmax) {

            s += line(gx(opts.xj), gy(opts.bg), gx(opts.xj), y0, GOLD, 1.4, "3 3");
            s += circ(gx(opts.xj).toFixed(1), gy(opts.bg).toFixed(1), 4.2, GOLD, "var(--bg)");
            s += text(gx(opts.xj), y0 - 6, "junction", 6.5, "middle", GOLD);
        }

        return s;
    }

    function niceMax(v) {

        const steps = [50, 100, 200, 400, 600, 800, 1000, 1500, 2000, 3000, 5000];

        for (let i = 0; i < steps.length; i++) {

            if (v <= steps[i]) {
                return steps[i];
            }
        }

        return 8000;
    }


    /* ======================================
       ION IMPLANTATION
    ====================================== */

    SIMS["chip-implant"] = function (root) {

        // approximate projected range per keV in silicon, and straggle ratio
        const species = {
            B: { name: "Boron", rpPerKev: 3.1, ratio: 0.36 },
            P: { name: "Phosphorus", rpPerKev: 1.25, ratio: 0.36 },
            As: { name: "Arsenic", rpPerKev: 0.58, ratio: 0.34 }
        };

        const defaults = { sp: "P", kev: 60, logdose: 14 };
        const state = { sp: defaults.sp, kev: defaults.kev, logdose: defaults.logdose };

        root.innerHTML =
            head("Try it: shoot dopant into silicon") +
            art("0 0 340 190", "A graph of dopant concentration against depth: a bell-shaped peak whose depth is set by the ion energy and whose height is set by the dose. The depth where it falls to the wafer's own doping is the junction depth") +
            '<div class="fd-stat-row">' + stat("Peak depth (range)", "rp") + stat("Peak concentration", "peak") + stat("Junction depth", "xj") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Dopant ion", "sp", [["B", "Boron (light)"], ["P", "Phosphorus"], ["As", "Arsenic (heavy)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Energy", key: "kev", min: 10, max: 300, step: 5, value: defaults.kev }) +
            slider({ label: "Dose", key: "logdose", min: 11, max: 16, step: 0.1, value: defaults.logdose }) +
            "</div>" +
            '<p class="fd-sim-formula">Energy sets how deep, dose sets how much. Values are approximate and use a simple bell-curve model of the implant.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function update() {

            const sp = species[state.sp];
            const rp = sp.rpPerKev * state.kev;       // nm
            const dr = sp.ratio * rp;                  // nm
            const dose = Math.pow(10, state.logdose);  // cm^-2
            const peak = dose / (Math.sqrt(2 * Math.PI) * dr * 1e-7);
            const bg = 1e16;
            const xj = peak > bg ? rp + dr * Math.sqrt(2 * Math.log(peak / bg)) : null;

            setVal(root, "kev", state.kev + " keV");
            setVal(root, "logdose", sci(dose) + " per cm²");

            out(root, "rp", fmtNm(rp));
            out(root, "peak", sci(peak) + " /cm³");
            out(root, "xj", xj ? fmtNm(xj) : "no junction");
            out(root, "note", xj
                ? "Where the implant falls below the wafer's own doping, the material flips type. That is the junction."
                : "The implant never rises above the wafer's own doping, so no junction forms. Raise the dose.");

            const xmax = niceMax((xj || rp + 3 * dr) * 1.25);

            svg.innerHTML = profilePlot({
                xmax: xmax,
                bg: bg,
                xj: xj,
                conc: function (x) {
                    return peak * Math.exp(-Math.pow(x - rp, 2) / (2 * dr * dr));
                }
            });
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       DIFFUSION DRIVE-IN
    ====================================== */

    SIMS["chip-diffuse"] = function (root) {

        const dopants = {
            B: { d0: 0.76, ea: 3.46 },
            P: { d0: 3.85, ea: 3.66 }
        };

        const defaults = { sp: "B", temp: 1000, logt: 1.48 };
        const state = { sp: defaults.sp, temp: defaults.temp, logt: defaults.logt };

        root.innerHTML =
            head("Try it: diffuse a dopant") +
            art("0 0 340 190", "A graph of dopant concentration against depth after diffusion: a bell-shaped profile that spreads deeper and flatter with more temperature or time") +
            '<div class="fd-stat-row">' + stat("Diffusivity D", "d") + stat("Spread √(D·t)", "sqrt") + stat("Junction depth", "xj") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Dopant", "sp", [["B", "Boron"], ["P", "Phosphorus"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Furnace temperature", key: "temp", min: 850, max: 1150, step: 10, value: defaults.temp }) +
            slider({ label: "Time", key: "logt", min: 0.7, max: 2.4, step: 0.02, value: defaults.logt }) +
            "</div>" +
            '<p class="fd-sim-formula">A fixed amount of dopant (10¹⁴ per cm²) starts near the surface and spreads. D rises steeply with temperature, so temperature is the strongest knob.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function update() {

            const k = dopants[state.sp];
            const minutes = Math.pow(10, state.logt);
            const D = k.d0 * Math.exp(-k.ea / (KB * (state.temp + 273.15))); // cm^2/s
            const dt = D * minutes * 60;                                      // cm^2
            const Q = 1e14;
            const bg = 1e16;
            const c0 = Q / Math.sqrt(Math.PI * dt);
            const xjCm = c0 > bg ? 2 * Math.sqrt(dt) * Math.sqrt(Math.log(c0 / bg)) : 0;
            const xj = xjCm * 1e7; // nm

            setVal(root, "temp", state.temp + " °C");
            setVal(root, "logt", minutes < 100 ? Math.round(minutes) + " min" : (minutes / 60).toFixed(1) + " h");

            out(root, "d", sci(D) + " cm²/s");
            out(root, "sqrt", fmtNm(Math.sqrt(dt) * 1e7));
            out(root, "xj", xj > 0 ? fmtNm(xj) : "no junction");
            out(root, "note", "Doubling the time spreads the profile only about 1.4 times deeper. A hotter furnace spreads it far faster.");

            const xmax = niceMax(Math.max(xj, Math.sqrt(dt) * 1e7 * 3) * 1.25);

            svg.innerHTML = profilePlot({
                xmax: xmax,
                bg: bg,
                xj: xj > 0 ? xj : null,
                conc: function (xnm) {
                    return c0 * Math.exp(-Math.pow(xnm * 1e-7, 2) / (4 * dt));
                }
            });
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       MOORE'S LAW
    ====================================== */

    SIMS["chip-moore"] = function (root) {

        const chips = [
            [1971, 2300, "Intel 4004"],
            [1978, 29000, "Intel 8086"],
            [1985, 275000, "Intel 386"],
            [1993, 3100000, "Pentium"],
            [2000, 42000000, "Pentium 4"],
            [2006, 291000000, "Core 2 Duo"],
            [2018, 6900000000, "Apple A12"],
            [2022, 114000000000, "Apple M1 Ultra"]
        ];

        const defaults = { year: 2000 };
        const state = { year: defaults.year };

        root.innerHTML =
            head("Try it: slide through the years") +
            art("0 0 340 190", "A log chart of transistors per chip from 1971 to 2022 for eight landmark processors, with a dashed line showing a doubling every two years") +
            '<div class="fd-stat-row">' + stat("Doubling-every-2-years line", "pred") + stat("Closest landmark chip", "chip") + stat("Its real count", "real") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Year", key: "year", min: 1971, max: 2025, step: 1, value: defaults.year }) +
            "</div>" +
            '<p class="fd-sim-formula">Transistor counts are approximate public figures. A doubling every two years from the 4004 is the classic form of Moore\'s Law.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function human(n) {

            if (n >= 1e9) { return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1) + " billion"; }
            if (n >= 1e6) { return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + " million"; }
            if (n >= 1e3) { return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + " thousand"; }

            return Math.round(n).toString();
        }

        function update() {

            const y = state.year;
            const pred = 2300 * Math.pow(2, (y - 1971) / 2);

            let near = chips[0];

            chips.forEach(function (c) {

                if (Math.abs(c[0] - y) < Math.abs(near[0] - y)) {
                    near = c;
                }
            });

            setVal(root, "year", String(y));
            out(root, "pred", human(pred));
            out(root, "chip", near[2] + " (" + near[0] + ")");
            out(root, "real", human(near[1]));

            const ratio = near[1] / (2300 * Math.pow(2, (near[0] - 1971) / 2));

            out(root, "note", ratio > 1.4
                ? "That landmark chip sits above the two-year line, so growth ran slightly faster there."
                : ratio < 0.7
                    ? "That landmark chip sits below the two-year line, so growth ran slightly slower there."
                    : "That landmark chip sits close to the two-year line.");

            const x0 = 44, x1 = 330, y0 = 156, y1 = 22;
            const gx = function (yr) { return x0 + (yr - 1970) / 55 * (x1 - x0); };
            const gy = function (n) { return y0 - (Math.log10(n) - 3) / 9 * (y0 - y1); };

            let s = "";

            s += line(x0, y0, x1, y0, "var(--muted)", 1) + line(x0, y0, x0, y1 - 4, "var(--muted)", 1);

            [3, 5, 7, 9, 11].forEach(function (p) {

                s += line(x0 - 3, gy(Math.pow(10, p)), x0, gy(Math.pow(10, p)), "var(--muted)", 1);
                s += text(x0 - 5, (gy(Math.pow(10, p)) + 2).toFixed(1), "10" + sup(p), 6, "end");
            });

            [1980, 1990, 2000, 2010, 2020].forEach(function (yr) {
                s += text(gx(yr).toFixed(1), y0 + 11, String(yr), 6.5);
            });

            s += text(14, 24, "transistors per chip", 6.5, "start");
            s += line(gx(1971), gy(2300), gx(2025), gy(2300 * Math.pow(2, 54 / 2)), ROSE, 1.2, "4 3");
            s += '<polyline points="' + chips.map(function (c) { return gx(c[0]).toFixed(1) + "," + gy(c[1]).toFixed(1); }).join(" ") + '" style="fill:none;stroke:' + ACCENT + ';stroke-width:1.4;opacity:.7"/>';

            chips.forEach(function (c) {

                const on = c === near;

                s += circ(gx(c[0]).toFixed(1), gy(c[1]).toFixed(1), on ? 5 : 3.2, on ? GOLD : ACCENT, "var(--bg)");
            });

            s += text((gx(near[0]) + (near[0] > 2005 ? -8 : 8)).toFixed(1), (gy(near[1]) + (near[0] > 2005 ? 14 : -8)).toFixed(1), near[2], 7, near[0] > 2005 ? "end" : "start", GOLD);

            s += line(gx(y), y0, gx(y), y1, GOLD, 1, "2 3");
            s += circ(gx(y).toFixed(1), gy(pred).toFixed(1), 4, ROSE, "var(--bg)");

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    // Share the drawing helpers with the other chip sim files.
    F.chipHelpers = {
        seg: seg, wire: wire, head: head, setVal: setVal, out: out, fmtNm: fmtNm,
        sup: sup, sci: sci, art: art, stat: stat, rectS: rectS, circ: circ, line: line, BLUE: BLUE
    };

    // Mount any chip-* sims that are on this page.
    document.querySelectorAll('.fd-sim[data-sim^="chip-"]').forEach(F.mount);

    // Then load the other chip simulator files, which build on these helpers.
    [
        ["fabChipIntroScript", "diagram-sims-chip-intro.js"],
        ["fabChipLayersScript", "diagram-sims-chip-layers.js"],
        ["fabChipPatterningScript", "diagram-sims-chip-patterning.js"],
        ["fabChipLithoScript", "diagram-sims-chip-litho.js"],
        ["fabChipDeviceScript", "diagram-sims-chip-device.js"]
    ].forEach(function (f) {

        if (document.getElementById(f[0])) {
            return;
        }

        const more = document.createElement("script");

        more.id = f[0];
        more.src = f[1];
        more.async = true;

        document.head.appendChild(more);
    });

})();
