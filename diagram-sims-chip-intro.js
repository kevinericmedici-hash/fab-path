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
