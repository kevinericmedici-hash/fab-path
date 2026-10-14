/* ========================================
   SAND TO CHIP: INTRO-PART SIMULATORS AND GAMES

   The playful, hook-the-learner pieces for the
   front of the course (Units 1 to 6). Registers
   on window.FabInteract, using the helpers that
   diagram-sims-chip.js shares. Loaded by that file.

   Teaching models only: numbers are typical or
   illustrative.
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
    const art = H.art;
    const stat = H.stat;
    const rectS = H.rectS;
    const circ = H.circ;
    const line = H.line;
    const slider = F.slider;
    const text = F.text;

    const ACCENT = F.colors.accent;
    const GOLD = F.colors.gold;
    const ROSE = F.colors.rose;
    const TEXT = F.colors.text;
    const BLUE = H.BLUE;
    const SIMS = F.SIMS;

    (function injectStyles() {

        if (document.getElementById("fabChipIntroStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "fabChipIntroStyles";

        style.textContent = `
.fd-sim .fd-czfz-steps .fd-stat b {
    font-size: 0.9rem;
    line-height: 1.4;
    letter-spacing: 0;
}

.fd-q-prompt {
    margin: 4px 0 10px;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.4;
}

.fd-q-options {
    display: grid;
    gap: 8px;
}

.fd-q-options button {
    text-align: left;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, .04);
    color: var(--text);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
}

.fd-q-options button:hover:not(:disabled) {
    border-color: var(--accent);
}

.fd-q-options button.right {
    border-color: var(--accent);
    background: rgba(84, 224, 199, .18);
}

.fd-q-options button.wrong {
    border-color: #ff6978;
    background: rgba(255, 105, 120, .16);
}

.fd-q-feedback {
    min-height: 3em;
    margin: 10px 0 4px;
    color: var(--muted);
    line-height: 1.5;
}

.fd-sim canvas.fd-wide {
    max-width: 560px;
}

.fd-verbs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 8px;
    margin-top: 8px;
}

.fd-verbs button {
    padding: 11px 8px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, .05);
    color: var(--text);
    font: inherit;
    font-weight: 800;
    cursor: pointer;
}

.fd-verbs button:hover {
    border-color: var(--accent);
}

.fd-verbs button.next {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(84, 224, 199, .22);
}
`;

        document.head.appendChild(style);

    })();


    /* ---------- small helpers ---------- */

    const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

    const smooth = function (a, b, x) {

        const t = clamp((x - a) / (b - a), 0, 1);

        return t * t * (3 - 2 * t);
    };

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

    function fmtLen(m) {

        if (m >= 1) { return m.toFixed(m < 10 ? 1 : 0) + " m"; }
        if (m >= 1e-2) { return (m * 100).toFixed(m * 100 < 10 ? 1 : 0) + " cm"; }
        if (m >= 1e-3) { return (m * 1000).toFixed(m * 1000 < 10 ? 1 : 0) + " mm"; }
        if (m >= 1e-6) { return (m * 1e6).toFixed(m * 1e6 < 10 ? 1 : 0) + " µm"; }
        if (m >= 1e-9) { return (m * 1e9).toFixed(m * 1e9 < 10 ? 1 : 0) + " nm"; }

        return (m * 1e12).toFixed(0) + " pm";
    }

    function niceBar(target) {

        const e = Math.floor(Math.log10(target));
        const base = Math.pow(10, e);
        const options = [1, 2, 5, 10].map(function (k) { return k * base; });

        let best = options[0];

        options.forEach(function (o) {

            if (Math.abs(Math.log(o / target)) < Math.abs(Math.log(best / target))) {
                best = o;
            }
        });

        return best;
    }


    /* ======================================
       ZOOM INTO A CHIP: wafer to atoms
    ====================================== */

    SIMS["chip-zoom"] = function (root) {

        const defaults = { zoom: 0 };
        const state = { zoom: defaults.zoom };

        root.innerHTML =
            head("Try it: zoom into a chip") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="400" role="img" aria-label="A view that zooms from a whole wafer, to one die, to wiring, to transistors, to single atoms, as you drag the slider"></canvas>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="stage"></div><span class="fd-chip" data-out="width"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Zoom in", key: "zoom", min: 0, max: 100, step: 0.2, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">Drag the slider and keep going. Each step is about ten times closer, and the whole journey spans nine orders of magnitude.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const HT = canvas.height;

        const refs = [
            [0.3, "a dinner plate, about the size of a wafer"],
            [0.01, "a fingernail, about the size of one die"],
            [7e-5, "a human hair"],
            [7e-6, "a red blood cell"],
            [1e-6, "a bacterium"],
            [1e-7, "a virus"],
            [2e-8, "a transistor gate on a modern chip"],
            [2e-9, "the width of a DNA helix"],
            [5.4e-10, "the spacing of silicon atoms"]
        ];

        const stages = [
            [-1.6, "A whole wafer"],
            [-3.2, "One die"],
            [-5.3, "Wiring between circuits"],
            [-7.0, "A row of transistors"],
            [-8.5, "One transistor"],
            [-99, "Silicon atoms"]
        ];

        function drawWafer(S) {

            const R = S / 2;
            const dsz = S / 25;

            ctx.beginPath();
            ctx.arc(0, 0, R, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(170,179,207,.2)";
            ctx.fill();
            ctx.strokeStyle = "rgba(170,179,207,.75)";
            ctx.lineWidth = 2;
            ctx.stroke();

            const ni = Math.ceil((W / 2) / dsz) + 1;
            const nj = Math.ceil((HT / 2) / dsz) + 1;

            for (let i = -ni; i < ni; i++) {
                for (let j = -nj; j < nj; j++) {

                    const x0 = i * dsz;
                    const y0 = j * dsz;

                    if (Math.hypot(Math.max(Math.abs(x0), Math.abs(x0 + dsz)), Math.max(Math.abs(y0), Math.abs(y0 + dsz))) > R * 0.96) {
                        continue;
                    }

                    ctx.fillStyle = "rgba(84,224,199,.38)";
                    ctx.fillRect(x0 + dsz * 0.04, y0 + dsz * 0.04, dsz * 0.92, dsz * 0.92);
                }
            }
        }

        function drawDie(S) {

            const blocks = [
                [-0.46, -0.46, 0.42, 0.42, "rgba(84,224,199,.55)"],
                [-0.02, -0.46, 0.48, 0.26, "rgba(255,214,102,.5)"],
                [-0.02, -0.18, 0.48, 0.3, "rgba(120,180,255,.5)"],
                [-0.46, 0.02, 0.42, 0.22, "rgba(255,105,120,.5)"],
                [-0.46, 0.28, 0.92, 0.18, "rgba(170,179,207,.4)"]
            ];

            ctx.fillStyle = "rgba(10,16,34,.9)";
            ctx.fillRect(-S / 2, -S / 2, S, S);
            ctx.strokeStyle = "rgba(245,247,255,.8)";
            ctx.lineWidth = 2;
            ctx.strokeRect(-S / 2, -S / 2, S, S);

            blocks.forEach(function (b) {

                ctx.fillStyle = b[4];
                ctx.fillRect(b[0] * S, b[1] * S, b[2] * S, b[3] * S);
            });

            ctx.fillStyle = "rgba(245,247,255,.7)";

            for (let k = 0; k < 14; k++) {

                const p = (-0.46 + k * 0.0708) * S;
                const sq = S * 0.022;

                ctx.fillRect(p, -S * 0.5 + S * 0.004, sq, sq);
                ctx.fillRect(p, S * 0.5 - S * 0.004 - sq, sq, sq);
                ctx.fillRect(-S * 0.5 + S * 0.004, p, sq, sq);
                ctx.fillRect(S * 0.5 - S * 0.004 - sq, p, sq, sq);
            }
        }

        function drawWiring(S) {

            ctx.fillStyle = "rgba(10,16,34,.92)";
            ctx.fillRect(-S / 2, -S / 2, S, S);

            const p = S / 40;
            const nI = Math.ceil((W / 2) / p) + 1;
            const nJ = Math.ceil((HT / 2) / p) + 1;

            ctx.fillStyle = "rgba(255,170,90,.55)";

            for (let j = -nJ; j < nJ; j++) {

                const wdt = (Math.abs(j) % 3 === 0) ? p * 0.34 : p * 0.2;

                ctx.fillRect(-S / 2, j * p, S, wdt);
            }

            ctx.fillStyle = "rgba(120,180,255,.45)";

            for (let i = -nI; i < nI; i++) {

                if (Math.abs(i * 7) % 5 === 0) {
                    continue;
                }

                ctx.fillRect(i * p * 1.5, -S / 2, p * 0.22, S);
            }

            ctx.fillStyle = "rgba(245,247,255,.8)";

            for (let i = -nI; i < nI; i += 2) {
                for (let j = -nJ; j < nJ; j += 3) {

                    if ((Math.abs(i * 13 + j * 7)) % 4 === 0) {
                        ctx.fillRect(i * p * 1.5, j * p, p * 0.3, p * 0.3);
                    }
                }
            }

            // a human hair, to scale
            const hair = S * (70 / 240);

            ctx.fillStyle = "rgba(255,255,255,.18)";
            ctx.fillRect(-S * 0.42, -S / 2, hair, S);
            ctx.fillStyle = "rgba(255,255,255,.9)";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("a human hair", -S * 0.42 + hair / 2, -S * 0.5 + 18);
            ctx.fillText("is this wide", -S * 0.42 + hair / 2, -S * 0.5 + 34);
        }

        function drawArray(S) {

            const pitch = S * 0.1;
            const nI = Math.ceil((W / 2) / pitch) + 1;

            ctx.fillStyle = "rgba(10,16,34,.9)";
            ctx.fillRect(-S / 2, -S / 2, S, S);
            ctx.fillStyle = "rgba(170,179,207,.28)";
            ctx.fillRect(-S / 2, S * 0.1, S, S * 0.4);

            for (let i = -nI; i < nI; i++) {

                const x = i * pitch;

                ctx.fillStyle = "rgba(255,214,102,.65)";
                ctx.fillRect(x - S * 0.018, S * 0.04, S * 0.036, S * 0.06);
                ctx.fillStyle = "rgba(84,224,199,.7)";
                ctx.fillRect(x + S * 0.03, S * 0.1, S * 0.04, S * 0.03);
                ctx.fillStyle = "rgba(255,170,90,.8)";
                ctx.fillRect(x + S * 0.045, -S * 0.04, S * 0.01, S * 0.14);
            }

            ctx.fillStyle = "rgba(255,170,90,.6)";
            ctx.fillRect(-S / 2, -S * 0.07, S, S * 0.025);
            ctx.fillRect(-S / 2, -S * 0.17, S, S * 0.025);
            ctx.fillRect(-S / 2, -S * 0.3, S, S * 0.04);

            ctx.fillStyle = "rgba(255,170,90,.8)";

            for (let i = -nI; i < nI; i += 2) {
                ctx.fillRect(i * pitch + S * 0.02, -S * 0.17, S * 0.012, S * 0.1);
                ctx.fillRect(i * pitch + S * 0.06, -S * 0.3, S * 0.012, S * 0.13);
            }
        }

        function drawTransistor(S) {

            ctx.fillStyle = "rgba(10,16,34,.9)";
            ctx.fillRect(-S / 2, -S / 2, S, S);
            ctx.fillStyle = "rgba(170,179,207,.3)";
            ctx.fillRect(-S / 2, S * 0.06, S, S * 0.44);
            ctx.fillStyle = "rgba(84,224,199,.6)";
            ctx.fillRect(-S * 0.5, S * 0.06, S * 0.34, S * 0.18);
            ctx.fillRect(S * 0.16, S * 0.06, S * 0.34, S * 0.18);
            ctx.fillStyle = "rgba(255,214,102,.8)";
            ctx.fillRect(-S * 0.14, S * 0.04, S * 0.28, S * 0.02);
            ctx.fillStyle = "rgba(245,247,255,.5)";
            ctx.fillRect(-S * 0.1, -S * 0.2, S * 0.2, S * 0.24);
            ctx.strokeStyle = "rgba(245,247,255,.9)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-S * 0.1, -S * 0.2, S * 0.2, S * 0.24);
            ctx.fillStyle = "rgba(255,255,255,.95)";

            for (let k = 0; k < 10; k++) {
                ctx.beginPath();
                ctx.arc(-S * 0.13 + k * S * 0.03, S * 0.075, Math.max(1.5, S * 0.006), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(255,255,255,.95)";
            ctx.fillText("gate", 0, -S * 0.2 - 8);
            ctx.fillText("source", -S * 0.33, S * 0.18);
            ctx.fillText("drain", S * 0.33, S * 0.18);
        }

        function drawAtoms(S) {

            const a = S * 0.247;
            const nI = Math.ceil((W / 2) / a) + 2;
            const nJ = Math.ceil((HT / 2) / a) + 2;

            ctx.fillStyle = "rgba(10,16,34,.9)";
            ctx.fillRect(-W, -HT, W * 2, HT * 2);
            ctx.strokeStyle = "rgba(170,179,207,.55)";
            ctx.lineWidth = Math.max(1, a * 0.04);

            for (let i = -nI; i < nI; i++) {
                for (let j = -nJ; j < nJ; j++) {

                    const x = i * a;
                    const y = j * a;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + a * 0.5, y + a * 0.5);
                    ctx.lineTo(x + a, y);
                    ctx.moveTo(x + a * 0.5, y + a * 0.5);
                    ctx.lineTo(x + a * 0.5, y + a);
                    ctx.stroke();
                }
            }

            for (let i = -nI; i < nI; i++) {
                for (let j = -nJ; j < nJ; j++) {

                    const x = i * a;
                    const y = j * a;

                    ctx.fillStyle = "rgba(120,180,255,.95)";
                    ctx.beginPath();
                    ctx.arc(x, y, a * 0.12, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255,214,102,.95)";
                    ctx.beginPath();
                    ctx.arc(x + a * 0.5, y + a * 0.5, a * 0.12, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        const layers = [
            { wc: 0.3, draw: drawWafer },
            { wc: 0.012, draw: drawDie },
            { wc: 2.4e-4, draw: drawWiring },
            { wc: 2.4e-6, draw: drawArray },
            { wc: 1.2e-7, draw: drawTransistor },
            { wc: 2.2e-9, draw: drawAtoms }
        ];

        function update() {

            const logW = -0.6 - 8.9 * state.zoom / 100;
            const Wm = Math.pow(10, logW);

            ctx.clearRect(0, 0, W, HT);
            ctx.fillStyle = "rgba(6,10,24,.55)";
            ctx.fillRect(0, 0, W, HT);

            layers.forEach(function (layer) {

                const r = layer.wc / Wm;
                const alpha = smooth(0.12, 0.5, r) * (1 - smooth(3, 8, r));

                if (alpha < 0.02) {
                    return;
                }

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(W / 2, HT / 2);
                layer.draw(r * W);
                ctx.restore();
            });

            // crosshair
            ctx.strokeStyle = "rgba(255,255,255,.18)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2 - 12, HT / 2);
            ctx.lineTo(W / 2 + 12, HT / 2);
            ctx.moveTo(W / 2, HT / 2 - 12);
            ctx.lineTo(W / 2, HT / 2 + 12);
            ctx.stroke();

            // scale bar
            const bar = niceBar(Wm * 0.22);
            const px = bar / Wm * W;

            ctx.fillStyle = "rgba(255,255,255,.92)";
            ctx.fillRect(18, HT - 26, px, 4);
            ctx.fillRect(18, HT - 31, 2, 14);
            ctx.fillRect(18 + px - 2, HT - 31, 2, 14);
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(fmtLen(bar), 18, HT - 38);

            // readouts
            let stageName = stages[stages.length - 1][1];

            for (let i = 0; i < stages.length; i++) {

                if (logW > stages[i][0]) {
                    stageName = stages[i][1];
                    break;
                }
            }

            let ref = refs[0];

            refs.forEach(function (rf) {

                if (Math.abs(Math.log10(rf[0]) - Math.log10(Wm / 3)) < Math.abs(Math.log10(ref[0]) - Math.log10(Wm / 3))) {
                    ref = rf;
                }
            });

            out(root, "stage", stageName);
            out(root, "width", "view is " + fmtLen(Wm) + " wide");
            out(root, "note", "For scale: " + ref[1] + ".");
            const mag = Math.pow(10, 8.9 * state.zoom / 100);

            setVal(root, "zoom", "×" + (mag < 10000 ? Math.round(mag).toLocaleString() : H.sci(mag)));

            if (state.zoom >= 95) {
                F.reward("chip-zoom-atoms", 10, "You zoomed all the way down to atoms");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       BUILD A LAYER: add, pattern, remove, modify
    ====================================== */

    SIMS["chip-loop"] = function (root) {

        const verbs = [
            { id: "add", label: "➕ Add", doing: "You deposited a thin film over the whole wafer.", why: "deposit or grow a thin film" },
            { id: "pattern", label: "🎭 Pattern", doing: "Light through a mask turned some resist into a pattern.", why: "use light to define where material goes" },
            { id: "remove", label: "✂️ Remove", doing: "The etch removed the film wherever the resist did not protect it.", why: "etch away what you do not need" },
            { id: "modify", label: "💧 Modify", doing: "Dopants changed the film's properties, and the resist was stripped. One layer done!", why: "change a material's properties with dopants or heat" }
        ];

        const defaults = { layers: 0, step: 0 };
        const state = { layers: 0, step: 0, msg: "Where does every chip start? Press the highlighted verb." };

        root.innerHTML =
            head("Try it: build a chip, one layer at a time") +
            art("0 0 340 210", "A cross-section of a growing stack of layers on a silicon wafer, showing the film, resist, etch and dopant steps of the current layer") +
            '<div class="fd-sim-readout"><div class="fd-sim-big">Layers built: <span data-out="n"></span></div><span class="fd-chip" data-out="hint"></span></div>' +
            '<p class="fd-sim-note" data-out="msg"></p>' +
            '<div class="fd-verbs">' +
            verbs.map(function (v) { return '<button type="button" data-verb="' + v.id + '">' + v.label + "</button>"; }).join("") +
            "</div>" +
            '<p class="fd-sim-formula">Four verbs, repeated hundreds of times: Add, Pattern, Remove, Modify. A real chip stacks dozens of layers this way.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function render() {

            const total = state.layers;
            const lh = Math.min(16, 118 / (total + 1.2));
            const base = 176;
            let s = "";

            s += rectS(30, base, 280, 24, "rgba(170,179,207,.22)", "rgba(170,179,207,.55)", 3);
            s += text(170, base + 16, "silicon wafer", 7.5, "middle", "var(--muted)");

            for (let k = 0; k < total; k++) {

                const y = base - (k + 1) * lh;
                const col = k % 2 === 0 ? "rgba(255,214,102,.5)" : "rgba(84,224,199,.5)";
                const edge = k % 2 === 0 ? GOLD : ACCENT;

                for (let b = 0; b < 6; b++) {
                    s += rectS(36 + b * 46, y, 34, lh - 1, col, edge, 1);
                }
            }

            // the layer in progress
            const y = base - (total + 1) * lh;
            const colNow = total % 2 === 0 ? "rgba(255,214,102,.5)" : "rgba(84,224,199,.5)";
            const edgeNow = total % 2 === 0 ? GOLD : ACCENT;
            const step = state.step;

            if (step === 1) {

                s += rectS(30, y, 280, lh - 1, colNow, edgeNow, 1);

            } else if (step === 2) {

                s += rectS(30, y, 280, lh - 1, colNow, edgeNow, 1);

                for (let b = 0; b < 6; b++) {
                    s += rectS(36 + b * 46, y - 5, 34, 5, "rgba(255,105,120,.7)", ROSE, 1);
                }

            } else if (step === 3) {

                for (let b = 0; b < 6; b++) {
                    s += rectS(36 + b * 46, y, 34, lh - 1, colNow, edgeNow, 1);
                    s += rectS(36 + b * 46, y - 5, 34, 5, "rgba(255,105,120,.7)", ROSE, 1);
                }
            }

            if (step === 0 && total === 0) {
                s += text(170, 90, "Start with a bare wafer", 8, "middle", "var(--muted)");
            }

            s += text(170, 20, total >= 3 ? "Look at that: you are building a chip!" : "Cross-section of the wafer", 7.5, "middle", total >= 3 ? ACCENT : "var(--muted)");

            svg.innerHTML = s;

            out(root, "n", String(total));
            out(root, "msg", state.msg);

            const chip = root.querySelector('[data-out="hint"]');

            chip.textContent = "Next: " + verbs[state.step].label.replace(/^[^ ]+ /, "");
            chip.className = "fd-chip";

            root.querySelectorAll("button[data-verb]").forEach(function (b) {
                b.classList.toggle("next", b.dataset.verb === verbs[state.step].id);
            });
        }

        root.querySelectorAll("button[data-verb]").forEach(function (button) {

            button.addEventListener("click", function () {

                const expected = verbs[state.step];

                if (button.dataset.verb !== expected.id) {

                    state.msg = "Not yet. The next verb is " + expected.label.replace(/^[^ ]+ /, "") + ": " + expected.why + ".";

                    render();

                    return;
                }

                state.msg = expected.doing;

                if (state.step === 3) {

                    state.layers++;
                    state.step = 0;

                    if (state.layers === 1) {
                        F.reward("chip-loop-first", 5, "You built your first layer");
                    }

                    if (state.layers === 3) {
                        F.reward("chip-loop-three", 15, "Three layers built. A real chip has dozens!");
                    }

                } else {

                    state.step++;
                }

                render();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () {

            state.layers = 0;
            state.step = 0;
            state.msg = "Fresh wafer. Press the highlighted verb.";

            render();
        });

        render();
    };


    /* ======================================
       PICK THE MATERIAL (quiz game)
    ====================================== */

    SIMS["chip-pickmat"] = function (root) {

        const rounds = [
            { q: "The main processor in a phone: billions of switches, built cheaply on huge wafers.", a: "Silicon", opts: ["Silicon", "Germanium", "Gallium arsenide", "Gallium nitride"], why: "Silicon grows its own stable insulating oxide, survives the heat of processing, and its conductivity is easy to control." },
            { q: "The very first transistor, built in 1947.", a: "Germanium", opts: ["Silicon", "Germanium", "Silicon carbide", "Gallium nitride"], why: "Germanium came first, but its oxide dissolves in water and its small band gap leaks at room temperature, so silicon replaced it." },
            { q: "A power converter in an electric car that must handle high voltage and high temperature.", a: "Silicon carbide", opts: ["Germanium", "Silicon", "Silicon carbide", "Gallium arsenide"], why: "A wide band gap, about 3.3 eV, tolerates more voltage and heat than silicon can." },
            { q: "A blue LED.", a: "Gallium nitride", opts: ["Silicon", "Gallium nitride", "Germanium", "Gallium arsenide"], why: "Silicon is a poor light source, and gallium nitride has the wide band gap that gives blue light." },
            { q: "A very fast radio amplifier that also needs to emit light.", a: "Gallium arsenide", opts: ["Gallium arsenide", "Silicon", "Germanium", "Silicon carbide"], why: "Electrons move faster in gallium arsenide, and it emits light well." }
        ];

        const state = { i: 0, score: 0, answered: false };

        root.innerHTML =
            head("Game: pick the right material") +
            '<div class="fd-stat-row">' + stat("Round", "round") + stat("Score", "score") + "</div>" +
            '<p class="fd-q-prompt" data-out="q"></p>' +
            '<div class="fd-q-options" data-opts></div>' +
            '<p class="fd-q-feedback" data-out="fb"></p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-next style="display:none">Next →</button></div>';

        const optsEl = root.querySelector("[data-opts]");
        const nextBtn = root.querySelector("[data-next]");

        function show() {

            if (state.i >= rounds.length) {

                out(root, "q", "Done! You got " + state.score + " of " + rounds.length + ".");
                optsEl.innerHTML = "";
                out(root, "fb", state.score >= 4 ? "You know your semiconductors. Each material wins where its band gap and chemistry fit the job." : "Silicon wins most jobs, and the others win where silicon cannot go. Hit Reset to try again.");
                nextBtn.style.display = "none";
                out(root, "round", "done");
                out(root, "score", state.score + " / " + rounds.length);

                F.reward("chip-pickmat-done", 15, "You finished the material game");

                return;
            }

            const r = rounds[state.i];

            state.answered = false;

            out(root, "round", (state.i + 1) + " of " + rounds.length);
            out(root, "score", state.score + " / " + rounds.length);
            out(root, "q", r.q);
            out(root, "fb", "Which material fits best?");
            nextBtn.style.display = "none";

            optsEl.innerHTML = r.opts.map(function (o) {
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
                    out(root, "score", state.score + " / " + rounds.length);

                    nextBtn.style.display = "";
                    nextBtn.textContent = state.i === rounds.length - 1 ? "See my score →" : "Next →";
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

            show();
        });

        show();
    };


    /* ======================================
       HOW PURE IS PURE?
    ====================================== */

    SIMS["chip-purity"] = function (root) {

        const stages = [
            { name: "Metallurgical silicon", pct: "98 to 99%", bad: 15e6, red: 56, say: "about 15 million per billion", note: "Rough silicon straight from the arc furnace." },
            { name: "Solar-grade silicon", pct: "99.9999%", bad: 1000, red: 12, say: "about 1,000 per billion (1 in a million)", note: "Six nines. Good enough for solar cells, but not for chips." },
            { name: "Electronic-grade silicon", pct: "99.9999999%", bad: 1, red: 3, say: "about 1 per billion", note: "Nine nines: one foreign atom for every billion silicon atoms, like one stranger in a crowd of a billion people." },
            { name: "Top electronic-grade silicon", pct: "99.999999999%", bad: 0.01, red: 1, say: "about 1 per 100 billion", note: "Eleven nines. Even a few parts per billion of the wrong atom can change how a chip behaves." }
        ];

        const defaults = { stage: 0 };
        const state = { stage: 0 };

        root.innerHTML =
            head("Try it: purify the silicon") +
            art("0 0 340 190", "Left: a flask of silicon atoms with a few red impurity atoms, fewer at each purification stage. Right: a log-scale bar of impurity atoms per billion silicon atoms for each stage") +
            '<div class="fd-sim-readout"><div class="fd-sim-big"><span data-out="pct"></span></div><span class="fd-chip" data-out="name"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Stage", "stage", [[0, "Furnace"], [1, "Solar-grade"], [2, "Electronic 9N"], [3, "Electronic 11N"]]) +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-more>Purify one more step →</button></div>' +
            '<p class="fd-sim-formula">The red dots are exaggerated so you can see them. In real electronic-grade silicon, you would have to look through about a billion atoms to find one that does not belong.</p>';

        const svg = root.querySelector("svg.fd-sim-art");
        const rand = mulberry(11);
        const spots = [];

        for (let i = 0; i < 360; i++) {
            spots.push([26 + rand() * 118, 46 + rand() * 118]);
        }

        function update() {

            const st = stages[state.stage];
            let s = "";

            s += rectS(20, 36, 130, 134, "rgba(255,255,255,.04)", "rgba(170,179,207,.55)", 10);
            s += text(85, 26, "a flask of silicon", 7.5, "middle", TEXT);

            spots.forEach(function (p, i) {
                s += circ(p[0].toFixed(1), p[1].toFixed(1), i < st.red ? 3 : 2.1, i < st.red ? "rgba(255,105,120,.95)" : "rgba(120,180,255,.5)");
            });

            s += text(85, 184, "red = impurity atoms", 6.5, "middle", ROSE);

            // right: log bars
            const lx0 = 190;
            const wOf = function (ppb) { return Math.max(4, (Math.log10(ppb) + 2) / 9.2 * 130); };

            s += text(255, 26, "impurities per billion atoms", 7.5, "middle", TEXT);

            stages.forEach(function (g, i) {

                const y = 44 + i * 34;
                const on = i === state.stage;

                s += text(lx0, y + 8, g.name.replace(" silicon", ""), 6.5, "start", on ? TEXT : "var(--muted)");
                s += rectS(lx0, y + 12, wOf(g.bad), 12, on ? "rgba(255,105,120,.55)" : "rgba(255,105,120,.18)", on ? ROSE : "rgba(255,105,120,.4)", 2);
            });

            s += text(255, 184, "log scale: shorter is purer", 6.5, "middle", "var(--muted)");

            svg.innerHTML = s;

            out(root, "pct", st.pct + " pure");
            out(root, "name", st.say);
            out(root, "note", st.name + ". " + st.note);

            if (state.stage === 3) {
                F.reward("chip-purity-max", 10, "You purified all the way to eleven nines");
            }
        }

        root.querySelector("[data-more]").addEventListener("click", function () {

            state.stage = Math.min(3, state.stage + 1);

            root.querySelectorAll("button[data-set]").forEach(function (b) {
                b.classList.toggle("on", b.dataset.set === "stage:" + state.stage);
            });

            update();
        });

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       PULL A CRYSTAL (Czochralski game)
    ====================================== */

    /* ======================================
       CZ VERSUS FLOAT ZONE (animation)
       Both growth methods side by side. Left: Czochralski,
       a seed pulled from a melt in a quartz crucible, which
       sheds oxygen into the crystal. Right: float zone, an
       induction coil walking a molten zone up a polysilicon
       rod with no crucible, sweeping impurities to the top.
       Teaching animation: proportions are illustrative.
    ====================================== */

    SIMS["chip-czfz"] = function (root) {

        const CYCLE = 24;          // seconds for one full growth
        const HOLD = 2.5;          // pause on the finished crystals before looping

        const defaults = { dots: "on" };
        const state = { dots: "on" };

        const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let t = reduce ? 0.62 : 0;   // progress 0..1
        let hold = 0;
        let playing = false;
        let rafId = null;
        let last = 0;
        let spin = 0;

        const uid = "czfz" + Math.random().toString(36).slice(2, 7);

        root.innerHTML =
            head("Watch: Czochralski vs float zone") +
            art("0 0 340 236", "Two crystal growers side by side. Left, Czochralski: a seed is dipped into molten silicon in a quartz crucible and pulled up while rotating, growing a wide crystal; oxygen from the crucible ends up in the crystal. Right, float zone: a coil melts a narrow zone in a polysilicon rod with no crucible, the zone travels up the rod, single crystal forms below it, and impurities are carried to the top") +
            '<div class="fd-stat-row fd-czfz-steps">' + stat("Czochralski now", "cz") + stat("Float zone now", "fz") + "</div>" +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-play>▶ Play</button></div>' +
            seg("Show impurities", "dots", [["on", "Oxygen and impurities"], ["off", "Hide them"]]) +
            '<p class="fd-sim-formula">Czochralski: wide, fast and cheap, but the quartz crucible adds oxygen (around 10¹⁸ atoms per cm³). ' +
            "Float zone: nothing touches the melt, so the crystal is far purer, but surface tension can only hold a narrow zone, which limits the diameter.</p>";

        const svg = root.querySelector("svg.fd-sim-art");
        const playBtn = root.querySelector("[data-play]");

        // Fixed random positions for oxygen specks and feed-rod impurities.
        const rnd = (function () { let a = 7; return function () { a = (a * 16807) % 2147483647; return a / 2147483647; }; }());
        const oxy = [];
        const imp = [];

        for (let i = 0; i < 70; i++) { oxy.push({ u: rnd(), v: rnd() * 2 - 1 }); }
        for (let i = 0; i < 46; i++) { imp.push({ y: 30 + rnd() * 160, x: rnd() * 2 - 1 }); }

        function clamp01(v) { return Math.max(0, Math.min(1, v)); }

        function ease(a, b, p) { return clamp01((p - a) / (b - a)); }

        /* ----- Czochralski ----- */

        function czPhase(p) {

            if (p < 0.08) { return "Heaters melt the polysilicon at about 1,420 °C"; }
            if (p < 0.15) { return "Seed crystal dips into the melt"; }
            if (p < 0.25) { return "Thin neck pulled to shed defects"; }
            if (p < 0.36) { return "Crown widens to full diameter"; }
            if (p < 0.93) { return "Body pulled up, crystal and crucible counter-rotating"; }

            return "Tail tapers off: a wide ingot, with some oxygen inside";
        }

        // Crystal radius at a distance z (px) below the seed, for growth progress p.
        const CZ = { cx: 82, meltTop: 150, R: 30, neck: 18, crown: 16 };

        function czRadius(z, grown) {

            if (z < CZ.neck) { return 1.6; }
            if (z < CZ.neck + CZ.crown) { return 1.6 + (CZ.R - 1.6) * Math.sin((z - CZ.neck) / CZ.crown * Math.PI / 2); }

            const tail = 12;

            if (grown > 120 && z > grown - tail) { return CZ.R * Math.max(0.15, (grown - z) / tail); }

            return CZ.R;
        }

        function drawCZ(p) {

            let s = "";
            const melted = ease(0, 0.08, p);
            const grown = p < 0.15 ? 0 : (p < 0.25 ? ease(0.15, 0.25, p) * CZ.neck : p < 0.36 ? CZ.neck + ease(0.25, 0.36, p) * CZ.crown : CZ.neck + CZ.crown + ease(0.36, 1, p) * 98);

            // Melt drops as the crystal takes silicon out of it.
            const used = clamp01((grown - CZ.neck - CZ.crown) / 98);
            const meltY = CZ.meltTop + used * 26;

            // heaters
            const glow = 0.25 + 0.6 * melted;

            s += rectS(14, 138, 8, 74, "rgba(255,105,120," + (glow * 0.5) + ")", ROSE, 2);
            s += rectS(142, 138, 8, 74, "rgba(255,105,120," + (glow * 0.5) + ")", ROSE, 2);

            // crucible and melt (clipped to the crucible)
            s += '<clipPath id="' + uid + 'c"><path d="M30 140 L36 210 Q82 222 128 210 L134 140 Z"/></clipPath>';
            s += '<path d="M30 140 L36 210 Q82 222 128 210 L134 140" style="fill:rgba(245,247,255,.07);stroke:rgba(245,247,255,.6);stroke-width:1.4"/>';
            s += '<g clip-path="url(#' + uid + 'c)">' + rectS(26, meltY, 112, 90, melted < 1 ? "rgba(170,179,207," + (0.35 * (1 - melted)) + ")" : "none") +
                rectS(26, meltY, 112, 90, "rgba(255,105,120," + (0.55 * melted) + ")") + "</g>";

            // oxygen leaving the crucible wall into the melt
            if (state.dots === "on" && melted > 0.9) {

                for (let i = 0; i < 6; i++) {

                    const ph = (spin * 0.35 + i / 6) % 1;
                    const side = i % 2 ? 1 : -1;
                    const x = 82 + side * (46 - ph * 30);
                    const y = 206 - ph * (206 - meltY - 6);

                    s += circ(x, y, 1.3, GOLD);
                }
            }

            // seed holder and crystal
            const top = meltY - grown;
            const seedTop = Math.max(8, top - 22) - (p < 0.15 ? (1 - ease(0.08, 0.15, p)) * 24 : 0);

            s += line(CZ.cx, 0, CZ.cx, seedTop, "rgba(245,247,255,.6)", 1.4);
            s += rectS(CZ.cx - 3, seedTop, 6, (p < 0.15 ? meltY - seedTop - (1 - ease(0.08, 0.15, p)) * 24 : top - seedTop), "rgba(84,224,199,.75)", TEXT, 1);

            if (grown > 0.5) {

                const left = [];
                const right = [];

                for (let z = 0; z <= grown; z += 2) {

                    const r = czRadius(z, grown);

                    left.push((CZ.cx - r) + "," + (top + z));
                    right.unshift((CZ.cx + r) + "," + (top + z));
                }

                s += '<polygon points="' + left.concat(right).join(" ") + '" style="fill:rgba(84,224,199,.55);stroke:rgba(245,247,255,.85);stroke-width:1"/>';

                // rotation hint: stripes that drift across the body
                for (let k = 0; k < 4; k++) {

                    const ph = ((spin + k / 4) % 1);
                    const x = CZ.cx - CZ.R + ph * 2 * CZ.R;
                    const bodyTop = top + CZ.neck + CZ.crown;

                    if (grown > CZ.neck + CZ.crown + 4 && Math.abs(x - CZ.cx) < CZ.R - 2) {
                        s += line(x, bodyTop + 2, x, meltY - 2, "rgba(245,247,255,.22)", 1);
                    }
                }

                // oxygen trapped in the crystal
                if (state.dots === "on") {

                    oxy.forEach(function (d) {

                        const z = CZ.neck + CZ.crown + d.u * (grown - CZ.neck - CZ.crown);

                        if (z < CZ.neck + CZ.crown || z > grown - 2) { return; }

                        s += circ(CZ.cx + d.v * (czRadius(z, grown) - 3), top + z, 0.9, GOLD);
                    });
                }
            }

            // counter-rotation arrows
            if (p > 0.15) {

                s += '<path d="M' + (CZ.cx - 18) + ' 24 A 18 5 0 0 0 ' + (CZ.cx + 18) + ' 24" style="fill:none;stroke:#9ef2e2;stroke-width:1.2"/>';
                s += '<polygon points="' + (CZ.cx + 18) + ',24 ' + (CZ.cx + 13) + ',20 ' + (CZ.cx + 12) + ',26" style="fill:#9ef2e2"/>';
                s += '<path d="M48 226 A 34 5 0 0 1 116 226" style="fill:none;stroke:rgba(245,247,255,.5);stroke-width:1.2"/>';
                s += '<polygon points="48,226 53,222 54,228" style="fill:rgba(245,247,255,.5)"/>';
            }

            s += text(82, 12, "CZOCHRALSKI", 9, "middle", TEXT);
            s += text(140, 134, "heater", 7.5, "middle");
            s += text(82, 234, "quartz crucible", 7.5, "middle");

            return s;
        }

        /* ----- Float zone ----- */

        const FZ = { cx: 258, top: 22, bottom: 206, R: 15 };

        function fzPhase(p) {

            if (p < 0.08) { return "Polysilicon rod hangs inside an RF coil, no crucible"; }
            if (p < 0.16) { return "Coil melts the bottom of the rod onto a seed"; }
            if (p < 0.93) { return "Molten zone travels up the rod, crystal forms below"; }

            return "Done: a narrower but very pure crystal; impurities end at the top";
        }

        function drawFZ(p) {

            let s = "";
            const travel = ease(0.16, 0.93, p);
            const zoneY = p < 0.16 ? FZ.bottom - 18 : FZ.bottom - 18 - travel * (FZ.bottom - 18 - FZ.top - 14);
            const zh = 9;
            const heat = ease(0.06, 0.16, p);

            // seed and holder at the bottom
            s += line(FZ.cx, FZ.bottom + 4, FZ.cx, 236, "rgba(245,247,255,.6)", 1.4);
            s += rectS(FZ.cx - 3, FZ.bottom - 6, 6, 12, "rgba(84,224,199,.75)", TEXT, 1);

            // single crystal below the zone (neck near the seed, then full width)
            if (heat > 0.5) {

                const yTop = zoneY + zh;
                const yNeck = FZ.bottom - 6;
                const pts = [
                    (FZ.cx - FZ.R) + "," + yTop, (FZ.cx + FZ.R) + "," + yTop,
                    (FZ.cx + FZ.R) + "," + Math.max(yTop, yNeck - 16), (FZ.cx + 2) + "," + yNeck,
                    (FZ.cx - 2) + "," + yNeck, (FZ.cx - FZ.R) + "," + Math.max(yTop, yNeck - 16)
                ];

                if (yNeck - yTop > 2) { s += '<polygon points="' + pts.join(" ") + '" style="fill:rgba(84,224,199,.55);stroke:rgba(245,247,255,.85);stroke-width:1"/>'; }
            }

            // polysilicon feed rod above the zone, with grain lines
            const rodBottom = zoneY - zh;

            if (rodBottom > FZ.top) {

                s += rectS(FZ.cx - FZ.R, FZ.top, FZ.R * 2, rodBottom - FZ.top, "rgba(170,179,207,.45)", "rgba(245,247,255,.6)", 2);

                for (let y = FZ.top + 6; y < rodBottom - 3; y += 9) {
                    s += line(FZ.cx - FZ.R + 3, y, FZ.cx - FZ.R + 9, y + 4, "rgba(245,247,255,.25)", 0.8);
                    s += line(FZ.cx + 2, y + 3, FZ.cx + FZ.R - 3, y - 1, "rgba(245,247,255,.25)", 0.8);
                }
            }

            s += line(FZ.cx, 0, FZ.cx, FZ.top, "rgba(245,247,255,.6)", 1.4);

            // molten zone: a slightly bulging ring held by surface tension
            if (heat > 0) {

                s += '<path d="M' + (FZ.cx - FZ.R) + " " + (zoneY - zh) + " Q " + (FZ.cx - FZ.R - 5) + " " + zoneY + " " + (FZ.cx - FZ.R) + " " + (zoneY + zh) +
                    " L " + (FZ.cx + FZ.R) + " " + (zoneY + zh) + " Q " + (FZ.cx + FZ.R + 5) + " " + zoneY + " " + (FZ.cx + FZ.R) + " " + (zoneY - zh) + ' Z" style="fill:rgba(255,105,120,' + (0.7 * heat) + ');stroke:' + ROSE + ';stroke-width:1"/>';
            }

            // RF coil: two turns around the zone
            [-4, 4].forEach(function (dy) {
                s += '<ellipse cx="' + FZ.cx + '" cy="' + (zoneY + dy) + '" rx="' + (FZ.R + 11) + '" ry="4" style="fill:none;stroke:rgba(255,184,107,.95);stroke-width:2"/>';
            });

            // impurities: still in the rod above the zone, or swept along inside it
            if (state.dots === "on") {

                let caught = 0;

                imp.forEach(function (d) {

                    if (d.y < zoneY - zh) { s += circ(FZ.cx + d.x * (FZ.R - 3), d.y, 1, "rgba(255,105,120,.95)"); }
                    else if (heat > 0.5 && p >= 0.16) { caught++; }
                });

                for (let i = 0; i < caught; i++) {

                    const a = (i * 2.399) % (Math.PI * 2);

                    s += circ(FZ.cx + Math.cos(a) * (FZ.R - 4) * ((i % 5) / 5 + 0.2), zoneY + Math.sin(a) * (zh - 3), 0.9, "rgba(255,105,120,.95)");
                }
            }

            s += text(258, 12, "FLOAT ZONE", 9, "middle", TEXT);
            s += text(FZ.cx + FZ.R + 30, zoneY + 2, "RF coil", 7.5, "start");
            s += text(FZ.cx - FZ.R - 22, Math.min(FZ.bottom - 20, zoneY + 28), "crystal", 7.5, "end");
            s += text(FZ.cx - FZ.R - 22, Math.max(FZ.top + 12, zoneY - 26), "poly rod", 7.5, "end");

            return s;
        }

        function draw() {

            svg.innerHTML = drawCZ(t) + line(170, 18, 170, 230, "rgba(245,247,255,.12)", 1) + drawFZ(t);

            out(root, "cz", czPhase(t));
            out(root, "fz", fzPhase(t));
        }

        function tick(now) {

            rafId = null;

            // Stop quietly when the slide is not showing.
            if (!root.offsetParent) { pause(); return; }

            const dt = Math.min(0.1, (now - last) / 1000);

            last = now;
            spin = (spin + dt * 0.6) % 1;

            if (t >= 1) {

                hold += dt;

                if (hold > HOLD) { t = 0; hold = 0; }

            } else {

                t = Math.min(1, t + dt / CYCLE);
            }

            draw();

            rafId = requestAnimationFrame(tick);
        }

        function play() {

            if (playing) { return; }

            playing = true;
            playBtn.textContent = "❚❚ Pause";
            last = performance.now();
            rafId = requestAnimationFrame(tick);
        }

        function pause() {

            playing = false;
            playBtn.textContent = "▶ Play";

            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }

        playBtn.addEventListener("click", function () { if (playing) { pause(); } else { play(); } });

        // Reset (in the header) starts both crystals again.
        wire(root, state, defaults, function () { draw(); });

        root.querySelector("[data-reset]").addEventListener("click", function () { t = 0; hold = 0; draw(); });

        draw();

        // Start on its own once the slide comes into view, unless the reader prefers less motion.
        if (!reduce && "IntersectionObserver" in window) {

            const io = new IntersectionObserver(function (entries) {

                entries.forEach(function (e) { if (e.isIntersecting && !playing) { play(); } });
            }, { threshold: 0.4 });

            io.observe(root);
        }
    };


    /* ======================================
       THE FINISHING LINE (animation)
       Ingot to polished wafer in seven steps: crop and
       test, grind and mark, slice, round and lap, etch,
       polish, clean and inspect. The wafer's surface gets
       smoother at every step, because each one removes the
       damage the previous one left. Illustrative scale.
    ====================================== */

    SIMS["chip-finish"] = function (root) {

        const STEP_SEC = 6;

        const STEPS = [
            { key: "crop", name: "Crop and test", cap: "Saws cut off the cone-shaped seed and tail ends. A four-point probe then checks the resistivity and crystal quality." },
            { key: "grind", name: "Grind and mark", cap: "A grinding wheel runs along the ingot to an exact diameter, then a notch is ground along its length to mark the crystal orientation." },
            { key: "slice", name: "Slice", cap: "The ingot is pushed into a web of moving diamond-coated wire, which cuts hundreds of wafers at once." },
            { key: "lap", name: "Round and lap", cap: "The sharp edges are ground round so they will not chip, then lapping plates grind both faces flat and remove the saw marks." },
            { key: "etch", name: "Etch", cap: "An acid bath dissolves the thin layer of crystal that grinding and lapping damaged." },
            { key: "polish", name: "Polish", cap: "Chemical-mechanical polishing: a spinning pad and slurry make the top face a mirror, smooth to a few atoms." },
            { key: "clean", name: "Clean and inspect", cap: "Cleaning baths lift off particles, then a laser scan checks flatness and hunts for defects. Ready for the fab." }
        ];

        const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let step = 0;
        let q = reduce ? 1 : 0;      // progress within the step, 0..1
        let playing = false;
        let rafId = null;
        let last = 0;
        let spin = 0;

        root.innerHTML =
            head("Watch: from ingot to polished wafer") +
            art("0 0 340 210", "An animation of the seven wafer finishing steps, one after another: cropping and testing the ingot, grinding it round and marking a notch, slicing it with a wire saw, rounding and lapping the wafer, etching away damage, polishing to a mirror, and cleaning and inspecting") +
            '<div class="fd-stat-row fd-czfz-steps">' + stat("Now", "now") + "</div>" +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-play>▶ Play</button></div>' +
            '<div class="fd-seg"><span class="fd-seg-label">Jump to a step</span>' +
            STEPS.map(function (s, i) { return '<button type="button" class="fd-sim-btn" data-step="' + i + '">' + (i + 1) + ". " + s.name + "</button>"; }).join("") +
            "</div>" +
            '<p class="fd-sim-formula">The wafer\'s surface gets smoother at every step: each one removes the damage left by the one before it.</p>';

        const svg = root.querySelector("svg.fd-sim-art");
        const playBtn = root.querySelector("[data-play]");
        const stepBtns = root.querySelectorAll("[data-step]");

        function clamp01(v) { return Math.max(0, Math.min(1, v)); }

        function ease(a, b, p) { return clamp01((p - a) / (b - a)); }

        const SI = "rgba(170,179,207,.55)";      // silicon grey
        const SI_EDGE = "rgba(245,247,255,.75)";

        /* ----- shared pieces ----- */

        // Wafer seen edge-on: a slab whose faces are roughened by amplitude rough (px).
        function waferEdge(x0, x1, yTop, th, rough, roundR, fill) {

            const n = 44;
            let top = "";
            let bot = "";

            for (let i = 0; i <= n; i++) {

                const x = x0 + roundR + (x1 - x0 - 2 * roundR) * i / n;
                const r1 = rough * Math.sin(i * 2.3) * Math.cos(i * 0.7);
                const r2 = rough * Math.sin(i * 1.9 + 1) * Math.cos(i * 0.9);

                top += (i ? " L " : "M ") + x.toFixed(1) + " " + (yTop + r1).toFixed(1);
                bot = " L " + x.toFixed(1) + " " + (yTop + th + r2).toFixed(1) + bot;
            }

            const r = roundR;
            const d = top +
                " Q " + (x1 + 0.2) + " " + yTop + " " + x1 + " " + (yTop + th / 2) +
                " Q " + (x1 + 0.2) + " " + (yTop + th) + " " + (x1 - r) + " " + (yTop + th) +
                bot.replace(/^ L/, " L") +
                " Q " + (x0 - 0.2) + " " + (yTop + th) + " " + x0 + " " + (yTop + th / 2) +
                " Q " + (x0 - 0.2) + " " + yTop + " " + (x0 + r) + " " + yTop + " Z";

            return '<path d="' + d + '" style="fill:' + (fill || SI) + ";stroke:" + SI_EDGE + ';stroke-width:1"/>';
        }

        function label(x, y, s, anchor, color) { return text(x, y, s, 7.5, anchor || "middle", color); }

        /* ----- the seven scenes ----- */

        function sceneCrop(p) {

            let s = "";
            const cy = 100;
            const r = 34;
            const fall = ease(0.45, 0.7, p);

            // cropped cones drop away
            s += '<polygon points="70,' + (cy - r) + " " + (40 - fall * 14) + "," + (cy + fall * 40) + " 70," + (cy + r) + '" style="fill:' + SI + ";stroke:" + SI_EDGE + ";opacity:" + (1 - fall) + ";transform:translate(" + (-fall * 12) + "px," + (fall * 40) + 'px)"/>';
            s += '<polygon points="270,' + (cy - r) + " " + (304 + fall * 14) + "," + (cy + fall * 40) + " 270," + (cy + r) + '" style="fill:' + SI + ";stroke:" + SI_EDGE + ";opacity:" + (1 - fall) + ";transform:translate(" + (fall * 12) + "px," + (fall * 40) + 'px)"/>';

            s += rectS(70, cy - r, 200, 2 * r, SI, SI_EDGE, 2);
            s += '<ellipse cx="270" cy="' + cy + '" rx="7" ry="' + r + '" style="fill:rgba(170,179,207,.75);stroke:' + SI_EDGE + '"/>';

            // two saw blades come down at the ends
            // the blades come down, cut, then lift away again
            const blade = p < 0.45 ? ease(0, 0.45, p) : 1 - ease(0.5, 0.65, p);

            [70, 270].forEach(function (x) {

                const y = -20 + blade * (cy + r + 4 + 20);

                s += circ(x, y - 22, 22, "rgba(245,247,255,.06)", "rgba(245,247,255,.55)");
                s += line(x, y - 44, x, y, "rgba(255,214,102,.9)", 1.5);
            });

            // four-point probe
            const probe = ease(0.65, 0.85, p);

            if (probe > 0) {

                const y = cy - r - 30 + probe * 26;

                s += rectS(150, y - 14, 40, 12, "rgba(138,164,255,.35)", "rgba(138,164,255,.9)", 2);

                [155, 165, 175, 185].forEach(function (x) { s += line(x, y - 2, x, y + 4, "rgba(245,247,255,.9)", 1.2); });

                if (p > 0.85) { s += label(170, y - 20, "resistivity in spec ✓", "middle", ACCENT); }
            }

            s += label(170, 186, "as-grown ingot: seed end and tail end removed");

            return s;
        }

        function sceneGrind(p) {

            let s = "";
            const cy = 96;
            const r = 34;
            const wx = 70 + ease(0, 0.7, p) * 204;      // where the wheel has reached

            // ingot: wavy (as grown) ahead of the wheel, straight behind it
            let topPath = "M 70 " + (cy - r);
            let botPath = "";

            for (let x = 70; x <= 270; x += 4) {

                const wob = x > wx ? 2.6 * Math.sin(x / 9) : 0;

                topPath += " L " + x + " " + (cy - r - 2 + wob).toFixed(1);
                botPath = " L " + x + " " + (cy + r + 2 - wob).toFixed(1) + botPath;
            }

            s += '<path d="' + topPath + botPath + ' Z" style="fill:' + SI + ";stroke:" + SI_EDGE + '"/>';

            // grinding wheel
            if (p < 0.78) {

                s += circ(wx, cy - r - 24, 22, "rgba(255,184,107,.18)", "rgba(255,184,107,.9)");

                for (let k = 0; k < 6; k++) {

                    const a = spin * Math.PI * 4 + k * Math.PI / 3;

                    s += line(wx, cy - r - 24, wx + Math.cos(a) * 20, cy - r - 24 + Math.sin(a) * 20, "rgba(255,184,107,.5)", 1);
                }

                s += label(wx, cy - r - 52, "grinding wheel");
            }

            // notch groove along the length, and an end view
            const notch = ease(0.75, 0.95, p);

            if (notch > 0) {

                s += line(70, cy + r - 2, 70 + notch * 200, cy + r - 2, "rgba(255,214,102,.95)", 2);

                const ex = 304;
                const ey = 76;

                s += circ(ex, ey, 20, SI, SI_EDGE);
                s += '<polygon points="' + (ex - 3) + "," + (ey + 20) + " " + ex + "," + (ey + 15) + " " + (ex + 3) + "," + (ey + 20) + '" style="fill:#0d1326;stroke:rgba(255,214,102,.95)"/>';
                s += label(ex, ey + 32, "end view: notch", "middle", GOLD);
            }

            s += label(170, 186, "ground to an exact diameter, then marked");

            return s;
        }

        function sceneSlice(p) {

            let s = "";
            const r = 30;
            const descend = ease(0.05, 0.75, p);
            const cy = 58 + descend * 84;                 // ingot moves down, all the way through the wire web
            const webY = 104;
            const cut = clamp01((cy + r - webY) / (2 * r));
            const apart = ease(0.82, 1, p);

            // guide rollers
            s += circ(46, webY + 14, 14, "rgba(245,247,255,.06)", "rgba(245,247,255,.5)");
            s += circ(294, webY + 14, 14, "rgba(245,247,255,.06)", "rgba(245,247,255,.5)");

            // the ingot, cut into slices above the web
            const n = 12;
            const w = 200 / n;

            for (let i = 0; i < n; i++) {

                const x = 70 + i * w + (i - (n - 1) / 2) * apart * 3;

                s += rectS(x + 0.4, cy - r, w - 0.8 + (cut > 0 ? 0 : 0.8), 2 * r, SI, SI_EDGE, 1);
            }

            // wires seen end-on: a row of dots, each with a little dash showing motion
            for (let i = 0; i <= n; i++) {

                const x = 70 + i * w;
                const jig = Math.sin(spin * Math.PI * 8 + i) * 2;

                s += circ(x, webY, 1.4, "rgba(255,214,102,.95)");
                s += line(x - 3 + jig, webY + 4, x + 3 + jig, webY + 4, "rgba(255,214,102,.5)", 1);

                if (cut > 0) { s += line(x, Math.max(cy - r, webY - cut * 2 * r), x, webY, "rgba(13,19,38,.9)", 1.2); }
            }

            s += line(46, webY, 294, webY, "rgba(255,214,102,.25)", 0.8, "2 3");
            s += label(170, 186, "diamond wire web: hundreds of wafers in one cut");

            return s;
        }

        function sceneLap(p) {

            let s = "";
            const roundT = ease(0.05, 0.42, p);
            const lapT = ease(0.48, 0.95, p);
            const rough = 3.2 - 2.0 * lapT;
            const th = 26 - lapT * 3;
            const y = 92 - th / 2;

            s += waferEdge(60, 280, y, th, rough, 2 + roundT * 11);

            // edge grinder at the right edge
            if (p < 0.45) {

                s += circ(296, 92, 16, "rgba(255,184,107,.18)", "rgba(255,184,107,.9)");
                s += line(296, 92, 296 + Math.cos(spin * 20) * 14, 92 + Math.sin(spin * 20) * 14, "rgba(255,184,107,.6)", 1);
                s += label(296, 124, "edge grinder");
            }

            // lapping plates squeeze and slide
            if (p > 0.45) {

                const slide = Math.sin(spin * Math.PI * 6) * 10;
                const gap = 5 - lapT * 2;

                s += rectS(50 + slide, y - gap - 14, 240, 12, "rgba(245,247,255,.12)", "rgba(245,247,255,.5)", 3);
                s += rectS(50 - slide, y + th + gap + 2, 240, 12, "rgba(245,247,255,.12)", "rgba(245,247,255,.5)", 3);
                s += label(170, y - gap - 20, "lapping plates and abrasive slurry");
            }

            s += label(170, 186, p < 0.45 ? "one wafer, edge-on (thickness exaggerated)" : "both faces ground flat: saw marks gone, fine scratches left");

            return s;
        }

        function sceneEtch(p) {

            let s = "";
            const gone = ease(0.1, 0.9, p);
            const y = 80;
            const th = 23;

            // tank of acid
            s += rectS(40, 46, 260, 110, "rgba(138,164,255,.12)", "rgba(138,164,255,.55)", 6);
            s += line(40, 58, 300, 58, "rgba(138,164,255,.6)", 1, "4 3");

            s += waferEdge(60, 280, y, th, 1.2 * (1 - gone) + 0.5, 13);

            // the damaged layer on each face, shrinking away
            const band = 4.5 * (1 - gone);

            if (band > 0.2) {

                s += rectS(73, y - 0.5, 194, band, "rgba(255,105,120,.45)");
                s += rectS(73, y + th - band + 0.5, 194, band, "rgba(255,105,120,.45)");
                s += label(312, y + 2, "damaged", "end", ROSE);
            }

            // bubbles
            for (let i = 0; i < 9; i++) {

                const ph = (spin * 1.4 + i / 9) % 1;

                s += circ(70 + i * 25 + Math.sin(i + ph * 6) * 3, 150 - ph * 88, 1.6, "rgba(245,247,255,.5)");
            }

            s += label(170, 186, "the damaged surface layer dissolves away");

            return s;
        }

        function scenePolish(p) {

            let s = "";
            const shine = ease(0.25, 0.85, p);
            const y = 84;
            const th = 22;

            // rotating pad (seen from the side) and carrier
            s += '<ellipse cx="170" cy="' + (y + th + 18) + '" rx="140" ry="12" style="fill:rgba(84,224,199,.12);stroke:rgba(84,224,199,.6)"/>';

            for (let k = 0; k < 6; k++) {

                const x = 170 + Math.cos(spin * Math.PI * 4 + k) * 120;

                s += line(x, y + th + 12, x, y + th + 24, "rgba(84,224,199,.35)", 1);
            }

            s += rectS(80, y - 16, 180, 12, "rgba(245,247,255,.12)", "rgba(245,247,255,.5)", 4);
            s += label(170, y - 22, "carrier presses the wafer face down");

            s += waferEdge(90, 250, y, th, 0.6 * (1 - shine), 10, "rgba(170,179,207," + (0.55 + 0.25 * shine) + ")");

            // slurry drops
            for (let i = 0; i < 4; i++) {

                const ph = (spin * 1.8 + i / 4) % 1;

                s += circ(60 + i * 8, 56 + ph * 64, 1.8, "rgba(245,247,255,.7)");
            }

            // mirror highlight sliding across once it is smooth
            if (shine > 0.4) {

                const hx = 96 + ((spin * 1.2) % 1) * 148;

                s += line(hx, y + 2, hx + 10, y + th - 2, "rgba(255,255,255," + (0.7 * shine) + ")", 2);
            }

            s += label(170, 186, shine > 0.9 ? "mirror finish, smooth to a few atoms" : "spinning pad + chemical slurry");

            return s;
        }

        function sceneClean(p) {

            let s = "";
            const cx = 170;
            const cy = 92;
            const R = 62;
            const washed = ease(0.05, 0.45, p);
            const scan = ease(0.5, 0.92, p);

            s += circ(cx, cy, R, "rgba(170,179,207,.55)", SI_EDGE);
            s += '<polygon points="' + (cx - 3) + "," + (cy + R) + " " + cx + "," + (cy + R - 5) + " " + (cx + 3) + "," + (cy + R) + '" style="fill:#0d1326;stroke:' + SI_EDGE + '"/>';

            // particles washing off
            const spots = [[-30, -20], [18, -36], [36, 10], [-12, 26], [8, 4], [-40, 14], [28, 38]];

            spots.forEach(function (d, i) {

                const gone = clamp01(washed * 1.4 - i * 0.05);

                if (gone < 1) { s += circ(cx + d[0] + gone * 30, cy + d[1] - gone * 10, 2, "rgba(255,105,120," + (0.95 * (1 - gone)) + ")"); }
            });

            // spray nozzle while cleaning
            if (p < 0.5) {

                s += rectS(cx + 72, cy - 70, 22, 10, "rgba(138,164,255,.35)", "rgba(138,164,255,.9)", 2);

                for (let i = 0; i < 5; i++) { s += line(cx + 76, cy - 58, cx + 30 - i * 9, cy - 20 + i * 8, "rgba(138,164,255,.35)", 1, "2 3"); }
            }

            // laser scan sweeping across
            if (scan > 0) {

                const x = cx - R + scan * 2 * R;
                const h = Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx)));

                s += line(x, cy - h, x, cy + h, "rgba(84,224,199,.95)", 1.6);
                s += label(cx + R + 10, cy + 4, "laser scan", "start", ACCENT);
            }

            if (p > 0.92) { s += label(cx, cy + R + 14, "✓ flat, clean, ready for the fab", "middle", ACCENT); }

            s += label(170, 186, "particles removed, then flatness and defects checked");

            return s;
        }

        const SCENES = [sceneCrop, sceneGrind, sceneSlice, sceneLap, sceneEtch, scenePolish, sceneClean];

        function draw() {

            let s = SCENES[step](q);

            // step track along the top
            STEPS.forEach(function (st, i) {

                const x = 26 + i * 48;
                const done = i < step || (i === step && q >= 1);
                const on = i === step;

                s += line(x, 14, x + 48, 14, i < STEPS.length - 1 ? "rgba(245,247,255,.18)" : "none", 1);
                s += circ(x, 14, on ? 5.5 : 4, done ? "rgba(84,224,199,.9)" : on ? "rgba(255,214,102,.95)" : "rgba(245,247,255,.12)", "rgba(245,247,255,.6)");
            });

            s += text(26 + step * 48, 30, (step + 1) + ". " + STEPS[step].name, 8, step < 2 ? "start" : step > 4 ? "end" : "middle", TEXT);

            svg.innerHTML = s;

            out(root, "now", "Step " + (step + 1) + " of 7 · " + STEPS[step].name + ": " + STEPS[step].cap);

            stepBtns.forEach(function (b, i) { b.classList.toggle("on", i === step); });
        }

        function tick(now) {

            rafId = null;

            if (!root.offsetParent) { pause(); return; }

            const dt = Math.min(0.1, (now - last) / 1000);

            last = now;
            spin = (spin + dt * 0.5) % 1;
            q += dt / STEP_SEC;

            if (q >= 1.25) { q = 0; step = (step + 1) % STEPS.length; }

            draw();

            rafId = requestAnimationFrame(tick);
        }

        function play() {

            if (playing) { return; }

            playing = true;
            playBtn.textContent = "❚❚ Pause";
            last = performance.now();
            rafId = requestAnimationFrame(tick);
        }

        function pause() {

            playing = false;
            playBtn.textContent = "▶ Play";

            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }

        playBtn.addEventListener("click", function () { if (playing) { pause(); } else { play(); } });

        stepBtns.forEach(function (b) {

            b.addEventListener("click", function () {

                step = Number(b.dataset.step);
                q = playing ? 0 : 1;
                draw();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () { step = 0; q = reduce ? 1 : 0; draw(); });

        draw();

        if (!reduce && "IntersectionObserver" in window) {

            const io = new IntersectionObserver(function (entries) {

                entries.forEach(function (e) { if (e.isIntersecting && !playing) { play(); } });
            }, { threshold: 0.4 });

            io.observe(root);
        }
    };


    /* ======================================
       WHEN OXIDE GETS TOO THIN (animation)
       A gate stack in cross-section: electrons in the gate
       press on the oxide. Thick oxide stops them; as it thins,
       more of them tunnel straight through and leak. Then a
       thicker high-k film (HfO₂) stops them again while acting
       like a thin oxide electrically.
       The leakage meter follows the usual rule of thumb that
       direct tunnelling through SiO₂ grows about tenfold for
       every 0.2 nm thinner. How often the dots tunnel is
       compressed so all four stages are visible.
    ====================================== */

    SIMS["chip-thinoxide"] = function (root) {

        const PHASE_SEC = 7;

        const PHASES = [
            { name: "5 nm oxide", d: 5, hk: false, cap: "A 5 nm silicon dioxide film is a wide barrier. Electrons in the gate bounce off it, so almost no current leaks." },
            { name: "Thinner: 2 nm", d: 2, hk: false, cap: "Thinning the oxide makes transistors faster and stronger. At about 2 nm, a few electrons start tunnelling straight through the barrier." },
            { name: "Too thin: 1.2 nm", d: 1.2, hk: false, cap: "At 1 to 2 nm, electrons pour through. The chip leaks current and heats up even when it is doing nothing." },
            { name: "High-k fix: HfO₂", d: 3, hk: true, cap: "Hafnium oxide (high-k) can be about 3 nm thick, wide enough to stop the electrons, yet it acts like about 1 nm of SiO₂ for switching the transistor." }
        ];

        // Tunnelling through SiO₂: roughly ×10 for every 0.2 nm thinner (2κ ≈ 11.5 per nm).
        function leakRel(d, hk) { return hk ? Math.pow(10, -2) : Math.exp(-11.5 * (d - 1.2)); }

        // How often a dot gets through, squeezed so the change is visible on screen.
        function pVisible(d, hk) { return hk ? 0.012 : 0.5 * Math.exp(-1.8 * (d - 1.2)); }

        const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let phase = 0;
        let q = 0;              // progress within the phase
        let playing = false;
        let rafId = null;
        let last = 0;
        let flash = 0;          // recent tunnelling, for the glow

        root.innerHTML =
            head("Watch: when the gate oxide gets too thin") +
            art("0 0 340 214", "A transistor gate in cross-section: a metal gate on top, an insulating oxide in the middle and the silicon channel below. Electrons in the gate bounce off a thick oxide. As the oxide gets thinner more electrons tunnel through it and leak, shown on a leakage meter. Finally a thicker hafnium oxide layer stops them again") +
            '<div class="fd-stat-row">' + stat("Physical thickness", "phys") + stat("Acts like (SiO₂)", "eot") + stat("Gate leakage", "leak") + "</div>" +
            '<div class="fd-stat-row fd-czfz-steps">' + stat("What is happening", "cap") + "</div>" +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-play>▶ Play</button></div>' +
            '<div class="fd-seg"><span class="fd-seg-label">Jump to a stage</span>' +
            PHASES.map(function (p, i) { return '<button type="button" class="fd-sim-btn" data-phase="' + i + '">' + (i + 1) + ". " + p.name + "</button>"; }).join("") +
            "</div>" +
            '<p class="fd-sim-formula">Tunnelling is a quantum effect: an electron has a small chance of appearing on the far side of a barrier it does not have the energy to climb. That chance falls exponentially with thickness, roughly tenfold for every 0.2 nm of SiO₂.</p>';

        const svg = root.querySelector("svg.fd-sim-art");
        const playBtn = root.querySelector("[data-play]");
        const phaseBtns = root.querySelectorAll("[data-phase]");

        const GATE_TOP = 34;
        const GATE_BOT = 86;
        const X0 = 22;
        const X1 = 214;

        function tpx(d) { return 6 + d * 9; }           // oxide thickness on screen

        // Thickness right now: eases from the previous stage to this one.
        function current() {

            const prev = PHASES[(phase + PHASES.length - 1) % PHASES.length];
            const cur = PHASES[phase];
            const m = phase === 0 ? 1 : Math.min(1, q / 0.45);
            const s = m * m * (3 - 2 * m);

            if (cur.hk) { return { d: prev.d + (cur.d - prev.d) * s, hk: s > 0.5, mix: s }; }

            return { d: prev.hk ? cur.d : prev.d + (cur.d - prev.d) * s, hk: false, mix: 0 };
        }

        // Electrons: bounce around inside the gate; on hitting the oxide they either reflect or tunnel.
        const rnd = (function () { let a = 11; return function () { a = (a * 16807) % 2147483647; return a / 2147483647; }; }());
        const els = [];

        for (let i = 0; i < 22; i++) {
            els.push({ x: X0 + 8 + rnd() * (X1 - X0 - 16), y: GATE_TOP + 6 + rnd() * (GATE_BOT - GATE_TOP - 12), vx: (rnd() - 0.5) * 18, vy: (rnd() < 0.5 ? -1 : 1) * (14 + rnd() * 10), mode: "gate", life: 0 });
        }

        function stepElectrons(dt, st) {

            const oxBot = GATE_BOT + tpx(st.d);
            const p = pVisible(st.d, st.hk);

            els.forEach(function (e) {

                if (e.mode === "gate") {

                    e.x += e.vx * dt;
                    e.y += e.vy * dt;

                    if (e.x < X0 + 4 || e.x > X1 - 4) { e.vx = -e.vx; e.x = Math.max(X0 + 4, Math.min(X1 - 4, e.x)); }
                    if (e.y < GATE_TOP + 4) { e.vy = Math.abs(e.vy); }

                    if (e.y >= GATE_BOT - 2) {

                        if (rnd() < p) { e.mode = "tunnel"; e.y = GATE_BOT; flash = 1; }
                        else { e.vy = -Math.abs(e.vy); e.y = GATE_BOT - 2; }
                    }

                } else if (e.mode === "tunnel") {

                    e.y += 40 * dt;

                    if (e.y > oxBot) { e.mode = "out"; e.life = 0; }

                } else {

                    e.y += 26 * dt;
                    e.life += dt;

                    if (e.life > 1.4) { e.mode = "gate"; e.y = GATE_TOP + 6; e.vy = 14 + rnd() * 10; }
                }
            });
        }

        function fmtLeak(st) {

            const r = leakRel(st.d, st.hk);
            const e = Math.round(Math.log10(r));

            if (r < 1e-9) { return "practically none"; }
            if (Math.abs(e) <= 0) { return "very high"; }

            return e > 0 ? "10" + H.sup(e) + "× the 1.2 nm level" : "1/10" + H.sup(-e) + " of the 1.2 nm level";
        }

        function draw() {

            const st = current();
            const th = tpx(st.d);
            const oxBot = GATE_BOT + th;
            let s = "";

            // chip heating up when it leaks
            const heat = Math.min(1, leakRel(st.d, st.hk));

            if (heat > 0.02) { s += rectS(X0 - 8, GATE_TOP - 8, X1 - X0 + 16, 190 - GATE_TOP + 12, "rgba(255,105,120," + (0.18 * heat + 0.1 * flash * heat) + ")", "none", 10); }

            // gate, oxide, channel
            s += rectS(X0, GATE_TOP, X1 - X0, GATE_BOT - GATE_TOP, "rgba(255,214,102,.18)", "rgba(255,214,102,.8)", 2);
            s += text(X0 + 6, GATE_TOP + 11, "gate", 8, "start", GOLD);

            const oxFill = st.mix > 0 ? "rgba(" + Math.round(138 + (199 - 138) * st.mix) + "," + Math.round(164 - 40 * st.mix) + "," + Math.round(255 - 40 * st.mix) + ",.45)" : "rgba(138,164,255,.45)";

            s += rectS(X0, GATE_BOT, X1 - X0, th, oxFill, "rgba(245,247,255,.7)");
            s += text(X1 + 6, GATE_BOT + th / 2 + 3, st.hk ? "HfO₂" : "SiO₂", 8, "start", TEXT);

            s += rectS(X0, oxBot, X1 - X0, 190 - oxBot, "rgba(84,224,199,.18)", "rgba(84,224,199,.7)", 2);
            s += text(X0 + 6, 186, "silicon channel", 8, "start", ACCENT);

            // thickness bracket
            s += line(X0 - 6, GATE_BOT, X0 - 6, oxBot, TEXT, 1);
            s += line(X0 - 9, GATE_BOT, X0 - 3, GATE_BOT, TEXT, 1);
            s += line(X0 - 9, oxBot, X0 - 3, oxBot, TEXT, 1);

            // electrons
            els.forEach(function (e) {

                if (e.mode === "gate") {

                    s += circ(e.x, e.y, 2.4, "rgba(138,200,255,.95)");

                } else if (e.mode === "tunnel") {

                    s += line(e.x, GATE_BOT - 4, e.x, e.y, "rgba(255,105,120,.6)", 1, "2 2");
                    s += circ(e.x, e.y, 2.4, "rgba(255,105,120,.95)");

                } else {

                    s += circ(e.x, e.y, 2.4, "rgba(255,105,120," + Math.max(0, 0.95 - e.life * 0.65) + ")");
                }
            });

            // leakage meter: log scale, 1e-12 .. 1e1 of the 1.2 nm level
            const mx = 262;
            const my0 = 40;
            const my1 = 178;
            const lr = leakRel(st.d, st.hk);
            const frac = Math.max(0, Math.min(1, (Math.log10(Math.max(lr, 1e-12)) + 12) / 13));
            const barTop = my1 - frac * (my1 - my0);

            s += text(mx + 10, my0 - 10, "gate leakage", 8, "middle", TEXT);
            s += rectS(mx, my0, 20, my1 - my0, "rgba(245,247,255,.05)", "rgba(245,247,255,.4)", 3);
            s += rectS(mx + 2, barTop, 16, my1 - barTop, frac > 0.85 ? "rgba(255,105,120,.85)" : frac > 0.55 ? "rgba(255,214,102,.85)" : "rgba(84,224,199,.75)", "none", 2);

            [["high", 0.92], ["low", 0.08]].forEach(function (m) { s += text(mx + 26, my1 - m[1] * (my1 - my0) + 3, m[0], 7.5, "start"); });

            svg.innerHTML = s;

            out(root, "phys", st.d.toFixed(1) + " nm " + (st.hk ? "HfO₂" : "SiO₂"));
            out(root, "eot", st.hk ? "about 1 nm" : st.d.toFixed(1) + " nm");
            out(root, "leak", fmtLeak(st));
            out(root, "cap", "Stage " + (phase + 1) + " of 4 · " + PHASES[phase].cap);

            phaseBtns.forEach(function (b, i) { b.classList.toggle("on", i === phase); });
        }

        function tick(now) {

            rafId = null;

            if (!root.offsetParent) { pause(); return; }

            const dt = Math.min(0.1, (now - last) / 1000);

            last = now;
            flash = Math.max(0, flash - dt * 1.5);
            q += dt / PHASE_SEC;

            if (q >= 1) { q = 0; phase = (phase + 1) % PHASES.length; }

            stepElectrons(dt, current());
            draw();

            rafId = requestAnimationFrame(tick);
        }

        function play() {

            if (playing) { return; }

            playing = true;
            playBtn.textContent = "❚❚ Pause";
            last = performance.now();
            rafId = requestAnimationFrame(tick);
        }

        function pause() {

            playing = false;
            playBtn.textContent = "▶ Play";

            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }

        playBtn.addEventListener("click", function () { if (playing) { pause(); } else { play(); } });

        phaseBtns.forEach(function (b) {

            b.addEventListener("click", function () {

                phase = Number(b.dataset.phase);
                q = playing ? 0 : 0.5;
                draw();
            });
        });

        root.querySelector("[data-reset]").addEventListener("click", function () { phase = 0; q = 0; draw(); });

        draw();

        if (!reduce && "IntersectionObserver" in window) {

            const io = new IntersectionObserver(function (entries) {

                entries.forEach(function (e) { if (e.isIntersecting && !playing) { play(); } });
            }, { threshold: 0.4 });

            io.observe(root);
        }
    };


    SIMS["chip-czgame"] = function (root) {

        const DUR = 40;     // seconds
        const DT = 0.05;
        const TARGET = 300;
        const BAND = 15;
        const FAIL = 55;

        const defaults = { speed: 1 };
        const state = { speed: defaults.speed };

        let running = false;
        let t = 0;
        let D = TARGET;
        let drift = 0;
        let inBand = 0;
        let steps = 0;
        let hist = [];
        let rafId = null;
        let last = 0;
        let acc = 0;
        let result = "";

        root.innerHTML =
            head("Game: pull a perfect crystal") +
            art("0 0 340 210", "Left: a silicon ingot hanging from a seed above a melt, its width tracing how the diameter changed. Right: a strip chart of diameter over time with the allowed band highlighted") +
            '<div class="fd-stat-row">' + stat("Diameter now", "d") + stat("Time in spec", "ok") + stat("Time left", "left") + "</div>" +
            '<p class="fd-sim-note" data-out="msg">Press Start. The melt temperature keeps wobbling, which makes the crystal fatter or thinner. Pull faster to thin it and slower to thicken it, and keep it inside the green band.</p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-start>Start pulling</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Pull speed", key: "speed", min: 0.5, max: 1.5, step: 0.01, value: defaults.speed }) +
            "</div>" +
            '<p class="fd-sim-formula">A real crystal puller does this automatically, holding the diameter within a tight tolerance for days. Slower pulling makes a fatter crystal, faster makes it thinner.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function randn() {

            let u = 0;
            let v = 0;

            while (u === 0) { u = Math.random(); }
            while (v === 0) { v = Math.random(); }

            return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        }

        function draw() {

            let s = "";
            const top = 36;
            const bot = 168;
            const cx = 86;
            const pxw = function (d) { return d / TARGET * 40; };

            // melt and crucible
            s += rectS(30, 176, 112, 22, "rgba(255,105,120,.3)", ROSE, 6);
            s += text(86, 190, "melt", 7, "middle", TEXT);
            s += rectS(cx - 4, 22, 8, 14, "rgba(245,247,255,.7)", TEXT, 1);
            s += text(cx, 16, "seed", 6.5, "middle", "var(--muted)");

            // ingot silhouette from history
            if (hist.length > 1) {

                const n = hist.length;
                const rowH = (bot - top) / (DUR / DT);
                const pts = [];

                for (let i = 0; i < n; i += 3) {
                    pts.push([cx - pxw(hist[i]) / 2, top + i * rowH]);
                }

                const right = pts.slice().reverse().map(function (p) { return [cx + (cx - p[0]), p[1]]; });
                const poly = pts.concat(right).map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");

                s += '<polygon points="' + poly + '" style="fill:rgba(170,179,207,.4);stroke:' + TEXT + ';stroke-width:1"/>';
            }

            // allowed band
            s += line(cx - pxw(TARGET + BAND) / 2, top, cx - pxw(TARGET + BAND) / 2, bot, ACCENT, 1, "3 3");
            s += line(cx + pxw(TARGET + BAND) / 2, top, cx + pxw(TARGET + BAND) / 2, bot, ACCENT, 1, "3 3");
            s += line(cx - pxw(TARGET - BAND) / 2, top, cx - pxw(TARGET - BAND) / 2, bot, ACCENT, 1, "3 3");
            s += line(cx + pxw(TARGET - BAND) / 2, top, cx + pxw(TARGET - BAND) / 2, bot, ACCENT, 1, "3 3");

            // strip chart
            const x0 = 178;
            const x1 = 330;
            const y0 = 40;
            const y1 = 170;
            const gy = function (d) { return y1 - (clamp(d, TARGET - 70, TARGET + 70) - (TARGET - 70)) / 140 * (y1 - y0); };

            s += rectS(x0, gy(TARGET + BAND), x1 - x0, gy(TARGET - BAND) - gy(TARGET + BAND), "rgba(84,224,199,.2)", "none", 0);
            s += line(x0, y1, x1, y1, "var(--muted)", 1);
            s += line(x0, y1, x0, y0 - 4, "var(--muted)", 1);
            s += text(x1, y1 + 12, "time", 6.5, "end", "var(--muted)");
            s += text(x0 + 4, y0 - 6, "diameter", 6.5, "start", "var(--muted)");
            s += text(x1, gy(TARGET + BAND) - 3, "in spec", 6.5, "end", ACCENT);

            if (hist.length > 1) {

                const pts2 = [];

                for (let i = 0; i < hist.length; i += 3) {
                    pts2.push((x0 + i / (DUR / DT) * (x1 - x0)).toFixed(1) + "," + gy(hist[i]).toFixed(1));
                }

                const inb = Math.abs(D - TARGET) <= BAND;

                s += '<polyline points="' + pts2.join(" ") + '" style="fill:none;stroke:' + (inb ? ACCENT : ROSE) + ';stroke-width:2.2"/>';
            }

            svg.innerHTML = s;

            out(root, "d", Math.round(D) + " mm");
            out(root, "ok", steps ? Math.round(inBand / steps * 100) + "%" : "n/a");
            out(root, "left", Math.max(0, Math.ceil(DUR - t)) + " s");
            setVal(root, "speed", state.speed.toFixed(2) + "×");
        }

        function finish(fail) {

            running = false;
            cancelAnimationFrame(rafId);

            const pct = steps ? Math.round(inBand / steps * 100) : 0;

            if (fail) {
                result = "Ingot lost: the diameter drifted too far. Real pullers lose ingots this way, so control matters.";
            } else if (pct >= 85) {
                result = "🏆 Excellent: " + pct + "% of the ingot was in spec. Almost every wafer cut from it can be used.";
            } else if (pct >= 60) {
                result = "Good pull: " + pct + "% in spec. The out-of-spec sections would be scrapped.";
            } else {
                result = "Only " + pct + "% in spec. That much scrap would sink a real fab. Try again!";
            }

            out(root, "msg", result);
            root.querySelector("[data-start]").textContent = "Pull again";

            if (!fail && pct >= 60) {
                F.reward("chip-czgame-good", 15, "You pulled a good crystal");
            } else {
                F.reward("chip-czgame-try", 5, "You gave crystal pulling a go");
            }
        }

        function tick(now) {

            if (!running) {
                return;
            }

            if (!last) {
                last = now;
            }

            acc += Math.min(0.2, (now - last) / 1000);
            last = now;

            while (acc >= DT) {

                acc -= DT;

                drift += (-0.7 * drift) * DT + 2.4 * Math.sqrt(DT) * randn();
                D += (14 * (1 - state.speed) + drift) * DT;
                t += DT;
                steps++;

                if (Math.abs(D - TARGET) <= BAND) {
                    inBand++;
                }

                hist.push(D);

                if (Math.abs(D - TARGET) > FAIL) {
                    draw();
                    finish(true);
                    return;
                }

                if (t >= DUR) {
                    draw();
                    finish(false);
                    return;
                }
            }

            draw();

            rafId = requestAnimationFrame(tick);
        }

        function start() {

            running = true;
            t = 0;
            D = TARGET;
            drift = 0;
            inBand = 0;
            steps = 0;
            hist = [TARGET];
            acc = 0;
            last = 0;

            out(root, "msg", "Pulling… keep the diameter inside the green band.");
            root.querySelector("[data-start]").textContent = "Restart";

            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(tick);
        }

        root.querySelector("[data-start]").addEventListener("click", start);

        wire(root, state, defaults, function () { draw(); });
        draw();
    };


    /* ======================================
       SLICE THE INGOT
    ====================================== */

    SIMS["chip-slice"] = function (root) {

        const sizes = { 150: 675, 200: 725, 300: 775 };
        const defaults = { size: 300, len: 0.8, kerf: 180 };
        const state = { size: defaults.size, len: defaults.len, kerf: defaults.kerf };

        root.innerHTML =
            head("Try it: slice an ingot into wafers") +
            art("0 0 340 200", "An ingot cut into wafers by a wire saw, with a magnified view showing each wafer and the thin strip of silicon lost as dust between wafers") +
            '<div class="fd-stat-row">' + stat("Wafers from the ingot", "n") + stat("Wafer thickness", "t") + stat("Silicon lost as dust", "loss") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Wafer size", "size", [[150, "150 mm"], [200, "200 mm"], [300, "300 mm"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Usable ingot length", key: "len", min: 0.4, max: 2, step: 0.05, value: defaults.len }) +
            slider({ label: "Saw cut width (kerf)", key: "kerf", min: 100, max: 300, step: 10, value: defaults.kerf }) +
            "</div>" +
            '<p class="fd-sim-formula">Wafers ≈ ingot length ÷ (wafer thickness + kerf). A thinner wire wastes less silicon. Typical diamond-wire cuts are roughly 100 to 200 µm wide, so these numbers are approximate.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function update() {

            const t = sizes[state.size];
            const pitch = t + state.kerf;
            const n = Math.floor(state.len * 1e6 / pitch);
            const loss = state.kerf / pitch * 100;

            setVal(root, "len", state.len.toFixed(2) + " m");
            setVal(root, "kerf", state.kerf + " µm");
            out(root, "n", n.toLocaleString());
            out(root, "t", t + " µm");
            out(root, "loss", loss.toFixed(0) + "%");
            out(root, "note", "About " + loss.toFixed(0) + "% of the cut silicon turns into dust. Every wafer pays for a sliver of its neighbor.");

            const w = 20 + (state.len / 2) * 200;
            let s = "";

            s += rectS(20, 40, w, 50, "rgba(170,179,207,.3)", TEXT, 6);
            const lines = Math.min(48, n);

            for (let i = 1; i < lines; i++) {
                s += line(20 + i * (w / lines), 40, 20 + i * (w / lines), 90, ROSE, 0.9);
            }

            s += text(20 + w / 2, 34, "the ingot, " + state.size + " mm across, cut into wafers", 7, "middle", "var(--muted)");
            s += line(20 + w, 65, 20 + w + 14, 65, TEXT, 1.6);

            // magnified strip
            const mx = 30;
            const mw = 280;
            const unit = mw / (4 * pitch);

            s += text(170, 118, "zoom in: wafer, dust, wafer, dust", 7, "middle", "var(--muted)");

            for (let i = 0; i < 4; i++) {

                const x = mx + i * pitch * unit;

                s += rectS(x.toFixed(1), 128, (t * unit).toFixed(1), 38, "rgba(84,224,199,.45)", ACCENT, 2);
                s += rectS((x + t * unit).toFixed(1), 128, (state.kerf * unit).toFixed(1), 38, "rgba(255,105,120,.55)", ROSE, 1);
            }

            s += text(mx + t * unit / 2, 182, "wafer", 7, "middle", ACCENT);
            s += text(mx + t * unit + state.kerf * unit / 2, 194, "dust", 7, "middle", ROSE);

            svg.innerHTML = s;
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       WAFER SIZE AND DIE COUNT
    ====================================== */

    SIMS["chip-wafersize"] = function (root) {

        const startArea = parseFloat(root.dataset.area) || 100;
        const startSize = parseFloat(root.dataset.size) || 300;

        const defaults = { size: startSize, loga: Math.log10(startArea) };
        const state = { size: defaults.size, loga: defaults.loga };

        root.innerHTML =
            head("Try it: how many chips fit?") +
            '<canvas class="fd-sim-canvas" width="560" height="560" aria-label="A wafer drawn to scale with the die that fit on it; the outlines show smaller wafer sizes for comparison"></canvas>' +
            '<div class="fd-stat-row">' + stat("Wafer area", "area") + stat("Whole die on the wafer", "dies") + stat("Formula estimate", "est") + stat("Compared with 200 mm", "rel") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Wafer size", "size", [[150, "150 mm"], [200, "200 mm"], [300, "300 mm"], [450, "450 mm (never adopted)"]]) +
            '<div class="fd-sim-controls">' +
            slider({ label: "Die size", key: "loga", min: 1.3, max: 2.9, step: 0.02, value: defaults.loga }) +
            "</div>" +
            '<p class="fd-sim-formula">Dies per wafer ≈ π d² ÷ (4 A) − π d ÷ √(2 A). Bigger wafers help twice: more area, and a smaller share lost around the edge.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const d = state.size;
            const A = Math.pow(10, state.loga);
            const side = Math.sqrt(A);
            const R = d / 2;
            const usable = R - 3;
            const Wd = canvas.width;
            const scale = (Wd / 2 - 12) / 225;

            setVal(root, "loga", A < 100 ? A.toFixed(0) + " mm²" : A.toFixed(0) + " mm² (" + (A / 100).toFixed(1) + " cm²)");

            const nHalf = Math.ceil(R / side) + 1;
            let count = 0;

            ctx.clearRect(0, 0, Wd, Wd);
            ctx.save();
            ctx.translate(Wd / 2, Wd / 2);

            [450, 300, 200, 150].forEach(function (sz) {

                ctx.beginPath();
                ctx.arc(0, 0, sz / 2 * scale, 0, Math.PI * 2);
                ctx.strokeStyle = sz === d ? "rgba(170,179,207,.8)" : "rgba(170,179,207,.22)";
                ctx.lineWidth = sz === d ? 2 : 1;
                ctx.setLineDash(sz === d ? [] : [4, 4]);
                ctx.stroke();
            });

            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(0, 0, R * scale, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(170,179,207,.16)";
            ctx.fill();

            const gap = Math.min(1.2, side * scale * 0.12);

            for (let i = -nHalf; i < nHalf; i++) {
                for (let j = -nHalf; j < nHalf; j++) {

                    const x0 = i * side;
                    const y0 = j * side;
                    const corners = [[x0, y0], [x0 + side, y0], [x0, y0 + side], [x0 + side, y0 + side]];

                    if (corners.every(function (c) { return Math.hypot(c[0], c[1]) <= usable; })) {

                        count++;
                        ctx.fillStyle = "rgba(84,224,199,.6)";
                        ctx.fillRect(x0 * scale + gap / 2, y0 * scale + gap / 2, side * scale - gap, side * scale - gap);
                    }
                }
            }

            ctx.restore();

            const est = Math.max(0, Math.round(Math.PI * d * d / (4 * A) - Math.PI * d / Math.sqrt(2 * A)));
            const ref = Math.round(Math.PI * 200 * 200 / (4 * A) - Math.PI * 200 / Math.sqrt(2 * A));

            out(root, "area", (Math.PI * R * R / 100).toFixed(0) + " cm²");
            out(root, "dies", count.toLocaleString());
            out(root, "est", est.toLocaleString());
            out(root, "rel", ref > 0 ? (est / ref).toFixed(2) + "×" : "n/a");
            out(root, "note", d === 450
                ? "A 450 mm wafer was proposed to cut cost per chip, but the industry never adopted it."
                : "Shrink the die or grow the wafer, and the count climbs fast. The outlines show the other wafer sizes to scale.");
        }

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       CLEANROOM PARTICLE COUNTER
    ====================================== */

    SIMS["chip-clean"] = function (root) {

        const classes = [
            { name: "Ordinary room air", perM3: 35e6, tag: "about" },
            { name: "ISO Class 8", perM3: 3.52e6, tag: "limit" },
            { name: "ISO Class 7", perM3: 352000, tag: "limit" },
            { name: "ISO Class 6", perM3: 35200, tag: "limit" },
            { name: "ISO Class 5", perM3: 3520, tag: "limit" },
            { name: "ISO Class 4", perM3: 352, tag: "limit" },
            { name: "ISO Class 3", perM3: 35, tag: "limit" }
        ];

        const defaults = { level: 0 };
        const state = { level: 0, seed: 1 };

        root.innerHTML =
            head("Try it: breathe the air in a fab") +
            '<canvas class="fd-sim-canvas fd-wide" width="680" height="340" role="img" aria-label="A one litre sample of air shown as a box of dust particles: dense in ordinary room air and nearly empty in a cleanroom"></canvas>' +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="name"></div><span class="fd-chip" data-out="rel"></span></div>' +
            '<div class="fd-stat-row">' + stat("Particles per cubic meter (0.5 µm and up)", "m3") + stat("In this litre of air", "l") + "</div>" +
            '<p class="fd-sim-note" data-out="note"></p>' +
            '<div class="fd-seg"><button type="button" class="fd-sim-btn" data-resample>Take another sample</button></div>' +
            '<div class="fd-sim-controls">' +
            slider({ label: "Cleanliness", key: "level", min: 0, max: 6, step: 1, value: 0 }) +
            "</div>" +
            '<p class="fd-sim-formula">ISO Class 5 allows about 3,520 particles of 0.5 µm and larger per cubic meter, roughly ten thousand times cleaner than ordinary room air. Critical areas run even cleaner.</p>';

        const canvas = root.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        function update() {

            const c = classes[state.level];
            const perLitre = c.perM3 / 1000;
            const rand = mulberry(state.seed * 131 + state.level * 17);
            let n = Math.floor(perLitre);

            if (rand() < perLitre - n) {
                n++;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(120,180,255,.07)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(245,247,255,.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

            const dotColor = n > 5000 ? "rgba(255,214,102,.5)" : "rgba(255,214,102,.95)";
            const r = n > 5000 ? 1.4 : n > 200 ? 2.4 : 4.5;

            ctx.fillStyle = dotColor;

            for (let i = 0; i < n; i++) {

                ctx.beginPath();
                ctx.arc(8 + rand() * (canvas.width - 16), 8 + rand() * (canvas.height - 16), r, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = "rgba(245,247,255,.9)";
            ctx.font = "bold 15px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("one litre of air", 16, canvas.height - 14);

            setVal(root, "level", c.name);
            out(root, "name", c.name);
            out(root, "m3", (c.tag === "about" ? "about " : "up to ") + c.perM3.toLocaleString());
            out(root, "l", n.toLocaleString() + " particle" + (n === 1 ? "" : "s"));

            const better = 35e6 / c.perM3;

            out(root, "rel", state.level === 0 ? "the baseline" : better >= 1000 ? Math.round(better / 1000).toLocaleString() + " thousand times cleaner" : Math.round(better) + "× cleaner");
            out(root, "note", state.level === 0
                ? "Ordinary air is full of dust, skin flakes, and fibers. One killer particle on a chip can ruin a die."
                : state.level < 4
                    ? "Better, but still too dirty for the most delicate steps."
                    : state.level === 4
                        ? "This is a typical cleanroom grade: only a handful of particles per litre."
                        : "Critical areas run even cleaner than this. You can barely find a particle at all.");

            if (state.level === 6) {
                F.reward("chip-clean-max", 10, "You found the cleanest air on the slider");
            }
        }

        root.querySelector("[data-resample]").addEventListener("click", function () {

            state.seed++;

            update();
        });

        wire(root, state, defaults, update);
        update();
    };


    /* ======================================
       WHY THE LITHOGRAPHY ROOM IS YELLOW
    ====================================== */

    SIMS["chip-yellow"] = function (root) {

        const bands = [
            { name: "UV", lo: 0, hi: 1, color: "rgba(150,110,255,.85)" },
            { name: "violet and blue", lo: 1, hi: 2, color: "rgba(90,130,255,.85)" },
            { name: "green", lo: 2, hi: 3, color: "rgba(80,210,120,.85)" },
            { name: "yellow", lo: 3, hi: 4, color: "rgba(255,214,102,.9)" },
            { name: "red", lo: 4, hi: 5, color: "rgba(255,105,120,.85)" }
        ];

        const sources = {
            white: { label: "White light", emits: [1, 2, 3, 4], note: "White light contains blue, which can expose the resist. The pattern would be ruined before printing." },
            yellow: { label: "Yellow light", emits: [3, 4], note: "Yellow light has no UV or blue, so the resist stays untouched. That is why lithography rooms glow yellow." },
            uv: { label: "UV lamp", emits: [0], note: "UV is exactly what the resist is built to react to. That is the light the scanner uses, on purpose." }
        };

        const defaults = { src: "white" };
        const state = { src: "white" };

        root.innerHTML =
            head("Try it: pick the room lights") +
            art("0 0 340 190", "A spectrum bar from ultraviolet to red with the wavelengths the photoresist reacts to marked, and the wavelengths the chosen light source emits shown above it; a wafer on the left is fogged if they overlap") +
            '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div><span class="fd-chip" data-out="chip"></span></div>' +
            '<p class="fd-sim-note" data-out="note"></p>' +
            seg("Room lighting", "src", [["white", "White light"], ["yellow", "Yellow light"], ["uv", "UV lamp"]]) +
            '<p class="fd-sim-formula">Photoresist reacts to shorter wavelengths: ultraviolet and blue light. Yellow light lacks them, so wafers can be handled safely.</p>';

        const svg = root.querySelector("svg.fd-sim-art");

        function update() {

            const src = sources[state.src];
            const x0 = 150;
            const bw = 36;
            const exposed = src.emits.some(function (i) { return i <= 1; });

            let s = "";

            s += circ(70, 84, 46, exposed ? "rgba(255,105,120,.35)" : "rgba(84,224,199,.25)", exposed ? ROSE : ACCENT);
            s += circ(70, 84, 34, exposed ? "rgba(255,105,120,.18)" : "rgba(84,224,199,.12)", "none");
            s += text(70, 90, exposed ? "fogged" : "safe", 8, "middle", TEXT);
            s += text(70, 150, "resist-coated wafer", 7, "middle", "var(--muted)");

            bands.forEach(function (b, i) {

                const x = x0 + i * bw;

                s += rectS(x, 108, bw - 2, 20, b.color, "none", 2);
                s += text(x + bw / 2 - 1, 142, b.name, 5.5, "middle", "var(--muted)");

                if (src.emits.indexOf(i) >= 0) {

                    s += rectS(x, 76, bw - 2, 24, b.color.replace(/[\d.]+\)$/, ".3)"), b.color, 3);
                    s += text(x + bw / 2 - 1, 91, "on", 7, "middle", TEXT);
                }
            });

            s += text(x0 + 2.5 * bw, 66, "light in the room: " + src.label.toLowerCase(), 7, "middle", TEXT);
            s += line(x0, 160, x0 + 2 * bw - 2, 160, ROSE, 2);
            s += text(x0 + bw, 174, "resist reacts here", 6.5, "middle", ROSE);

            svg.innerHTML = s;

            out(root, "verdict", exposed ? "Wafer fogged!" : "Wafer is safe");
            out(root, "note", src.note);

            const chip = root.querySelector('[data-out="chip"]');

            chip.textContent = exposed ? (state.src === "uv" ? "that's the exposure light" : "bad for handling") : "safe to handle";
            chip.className = "fd-chip " + (exposed && state.src !== "uv" ? "rose" : "");

            if (state.src === "yellow") {
                F.reward("chip-yellow-found", 5, "You found why the room is yellow");
            }
        }

        wire(root, state, defaults, update);
        update();
    };


    // Mount any chip-* sims on this page that were registered by this file.
    document.querySelectorAll('.fd-sim[data-sim^="chip-"]').forEach(F.mount);

})();
