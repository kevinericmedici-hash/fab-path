/* ========================================
   FROM SAND TO CHIP: 3D SCENES

   Unit 1:  wafer, die and transistor: zooming in.
   Unit 7:  growing oxide on silicon.
   Unit 13: lithography: coat, expose, develop.
   Unit 19: the p-n junction.
   Unit 25: front-end and back-end: the chip as one tall stack.
   Unit 31: yield: defects, die size and the wafer map.
   Unit 37: from die to package: wire bond or flip chip.
   Unit 43: IDM, fabless and foundry.

   Built on diagram-sims-3d-core.js and the local three.js.
   Teaching models: sizes, speeds and numbers are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F) {
        return;
    }

    // The chip pages load their own helpers, so pull in the shared helper file first when it is missing.
    function needMems(cb) {

        if (F.memsHelpers) { cb(); return; }

        let m = document.getElementById("fabMemsCoreFor3d");

        if (!m) {

            m = document.createElement("script");
            m.id = "fabMemsCoreFor3d";
            m.src = "diagram-sims-mems.js";
            document.head.appendChild(m);
        }

        m.addEventListener("load", function () { cb(); });
    }

    function needCore(cb) {

        if (F.three) { cb(); return; }

        if (!F.memsHelpers) { needMems(function () { needCore(cb); }); return; }

        let s = document.getElementById("fabThreeCore");

        if (!s) {

            s = document.createElement("script");
            s.id = "fabThreeCore";
            s.src = "diagram-sims-3d-core.js";
            document.head.appendChild(s);
        }

        s.addEventListener("load", function () { cb(); });
    }

    needCore(init);

    function init() {

        const M = F.memsHelpers;
        const clamp = M.clamp;
        const mulberry = M.mulberry;
        const D = F.three.define;

        // ================================================================
        // UNIT 1: WAFER, DIE, TRANSISTOR
        // ================================================================
        const LEVELS = {
            wafer: { name: "Wafer", across: "About 30 cm (300 mm)", has: "Hundreds of identical dies", feat: "Features are far too small to see" },
            die: { name: "Die", across: "About 1 cm: a fingernail", has: "Billions of transistors under a stack of wiring", feat: "Wires only tens of nanometers wide" },
            tr: { name: "Transistor", across: "Tens of nanometers", has: "One switch: a gate over a channel", feat: "Thousands of times narrower than a hair (about 70 µm)" }
        };

        D("chip-3d-zoom", {

            title: "Explore in 3D: from wafer to transistor",
            intro: "Pick a level: the wafer, one die, or a single transistor. Click parts at each level.",
            stats: [["Level", "lvl"], ["How big", "size"], ["What is in it", "has"]],
            defaults: { level: "wafer" },
            controls: [
                { seg: "level", label: "Zoom level", options: [["wafer", "Wafer"], ["die", "Die"], ["tr", "Transistor"]] },
                { views: ["three", "front", "top"] }
            ],
            formula: "A wafer is a thin, polished disc of silicon, usually 300 mm across, that carries hundreds of microchips. A die is one rectangular chip cut from the wafer, often about a centimeter on a side. Each die holds billions of transistors, whose features are only tens of nanometers across. The whole industry is about making the same tiny structure billions of times, identically. (Drawn schematically: each level is shown larger than life and not to scale.)",
            stage: { target: [0, 0.6, 0], halfWidth: 4.8, halfHeight: 2.8, views: { three: [0.5, 1.1], front: [0, 1.4], top: [0, 0.35] }, home: "three", sway: [0.4, 0.25] },
            info: {
                wafer: "The wafer: a thin, polished disc of single-crystal silicon, usually 300 mm across.",
                dies: "Dies: a grid of identical rectangular chips. After testing, the wafer is cut apart along the lines between them.",
                notch: "The notch marks the crystal direction and keeps the wafer oriented in the machines.",
                die: "One die: a rectangle about a centimeter on a side, cut from the wafer.",
                metal: "The wiring stack: many layers of copper wire and insulator built over the transistors.",
                si: "The silicon underneath, where the transistors live.",
                gate: "The gate: it switches the channel on and off.",
                srcd: "Source and drain: the two ends of the channel, doped silicon.",
                chan: "The channel: where current flows when the gate says so.",
                ox: "The thin gate insulator between the gate and the channel."
            },
            read: function (c) {

                const L = LEVELS[c.state.level];

                return { lvl: L.name, size: L.across, has: L.has, verdict: L.feat };
            },
            reward: { when: function (c) { return c.data.sawAll && c.count() >= 3; }, msg: "You zoomed from wafer to transistor" },
            onChange: function (c, keys) { c.data.setLevel(); },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const root = new T.Group();
                const rand = mulberry(1);

                d.seen = {}; d.sawAll = false;
                s.scene.add(root);
                s.shadow(root, 10, 8);

                // level 1: the wafer with its die grid
                const gw = new T.Group();
                const wm = s.mat(0x8a93b8, { metalness: 0.85, roughness: 0.2 });
                const wafer = s.disc(3.2, 0.14, wm, 0, 0.07, 0);

                s.part(gw, "wafer", wafer, [wm]);

                const dm = s.mat(0x5f7bd8, { metalness: 0.5, roughness: 0.3 });
                const dies = [];

                for (let i = -5; i <= 5; i++) {

                    for (let k = -5; k <= 5; k++) {

                        const x = i * 0.52, z = k * 0.52;

                        if (Math.hypot(Math.abs(x) + 0.22, Math.abs(z) + 0.22) < 3.05) { dies.push(s.box(0.46, 0.04, 0.46, dm, x, 0.16, z)); }
                    }
                }

                s.part(gw, "dies", dies, [dm]);

                const notch = s.box(0.3, 0.14, 0.2, s.mat(0x10141f), 0, 0.07, 3.15);

                s.part(gw, "notch", notch, [notch.material]);
                root.add(gw);

                // level 2: one die with its wiring stack
                const gd = new T.Group();
                const siM = s.mat(0x8a93b8, { metalness: 0.7, roughness: 0.3 });
                const si = s.box(3.2, 0.5, 3.2, siM, 0, 0.25, 0);

                s.part(gd, "si", si, [siM]);

                const mets = [];
                const cols = [0xd9b45a, 0xc9a04a, 0xe2c26a, 0xb8903a, 0xf0d27a];

                for (let i = 0; i < 5; i++) {

                    const m = s.mat(cols[i], { metalness: 0.8, roughness: 0.3 });
                    const lay = new T.Group();

                    for (let k = 0; k < 12; k++) {

                        const w = i % 2 === 0 ? s.box(3.0, 0.05, 0.1, m, 0, 0, -1.4 + k * 0.255) : s.box(0.1, 0.05, 3.0, m, -1.4 + k * 0.255, 0, 0);

                        lay.add(w);
                        mets.push(w);
                    }

                    lay.position.y = 0.6 + i * 0.22;
                    gd.add(lay);
                }

                const im = new T.MeshStandardMaterial({ color: 0x9fb8f0, transparent: true, opacity: 0.18, depthWrite: false });
                const ild = s.box(3.2, 1.2, 3.2, im, 0, 1.1, 0);

                gd.add(ild);
                s.part(gd, "metal", mets, [mets[0].material]);
                s.part(gd, "die", ild, [im]);
                gd.visible = false;
                root.add(gd);

                // level 3: a transistor
                const gt = new T.Group();
                const bodyM = s.glass(0x7c8cff, 0.3, false);
                const body = s.box(3.8, 1.0, 2.2, bodyM, 0, 0.5, 0);

                s.part(gt, "si", body, [bodyM]);

                const sdM = s.mat(0xff9a54, { roughness: 0.5, transparent: true, opacity: 0.7 });

                s.part(gt, "srcd", [s.box(1.2, 0.45, 2.2, sdM, -1.3, 0.78, 0), s.box(1.2, 0.45, 2.2, sdM, 1.3, 0.78, 0)], [sdM]);

                const oxM = s.glass(0xfff1c4, 0.7, false);

                s.part(gt, "ox", s.box(1.4, 0.1, 2.2, oxM, 0, 1.02, 0), [oxM]);

                const gM = s.mat(0xc2c6d2, { metalness: 0.8, roughness: 0.25 });

                s.part(gt, "gate", s.box(1.4, 0.4, 2.2, gM, 0, 1.28, 0), [gM]);

                const cM = new T.MeshStandardMaterial({ color: 0x54e0c7, transparent: true, opacity: 0.3, depthWrite: false });

                s.part(gt, "chan", s.box(1.4, 0.08, 2.0, cM, 0, 0.9, 0), [cM]);
                gt.visible = false;
                root.add(gt);

                d.gw = gw; d.gd = gd; d.gt = gt;
                d.vis = { wafer: 1, die: 0, tr: 0 };

                d.setLevel = function () {

                    d.seen[c.state.level] = true;
                    d.sawAll = d.seen.wafer && d.seen.die && d.seen.tr;
                };

                d.setLevel();

                const l1 = s.label("Wafer: 300 mm");

                l1.at = function () { return [0, 0.8, 3.6]; };
                d.l1 = l1;
            },
            frame: function (c, dt) {

                const d = c.data;
                const lv = c.state.level;
                const k = Math.min(1, dt * 6);

                [["wafer", d.gw], ["die", d.gd], ["tr", d.gt]].forEach(function (p) {

                    const want = lv === p[0] ? 1 : 0;

                    d.vis[p[0]] += (want - d.vis[p[0]]) * k;

                    const v = d.vis[p[0]];

                    p[1].visible = v > 0.02;
                    p[1].scale.setScalar(Math.max(0.02, 0.4 + 0.6 * v));
                });

                d.l1.set(LEVELS[lv].name + ": " + LEVELS[lv].across.split(":")[0].split("(")[0].trim());
            }
        });

        // ================================================================
        // UNIT 7: GROWING OXIDE
        // ================================================================
        D("chip-3d-oxide", {

            title: "Explore in 3D: oxide that eats silicon",
            intro: "Heat silicon in oxygen and watch an oxide layer grow. Note where the original surface ends up.",
            stats: [["Oxide thickness", "th"], ["Silicon consumed (below the old surface)", "below"], ["Oxide above the old surface", "above"]],
            defaults: { gas: "dry", temp: 1000, time: 1 },
            controls: [
                { seg: "gas", label: "Atmosphere", options: [["dry", "Dry (O₂)"], ["wet", "Wet (steam)"]] },
                { slider: "temp", label: "Furnace temperature (°C)", min: 800, max: 1200, step: 10, fmt: function (v) { return v + " °C"; } },
                { slider: "time", label: "Time in the furnace (hours)", min: 0, max: 6, step: 0.1, fmt: function (v) { return v.toFixed(1) + " h"; } },
                { views: ["three", "front", "side"] }
            ],
            formula: "Si + O<sub>2</sub> → SiO<sub>2</sub>. At roughly 800 to 1,200 °C, oxygen or steam reacts with the silicon surface and turns it into silicon dioxide, a glass. Growing oxide consumes silicon: SiO<sub>2</sub> takes up about 2.3 times the volume of the silicon it replaces, so about 44% of the final thickness lies below the original surface and 56% above it. Dry oxidation (O<sub>2</sub>) is slow but makes dense oxide of the best electrical quality, used for gate oxides; wet oxidation (steam) is much faster, so it is used when thick oxide is needed. (Thickness model is illustrative and exaggerated in the drawing.)",
            stage: { target: [0, 0.2, 0], halfWidth: 4.4, halfHeight: 2.4, views: { three: [0.5, 1.1], front: [0, 1.5], side: [1.3, 1.4] }, home: "three", sway: [0.4, 0.25] },
            info: {
                si: "The silicon wafer. As oxide grows, silicon is used up: the silicon surface sinks below where it started.",
                ox: "The silicon dioxide layer: a glass that grows from the silicon itself, so it forms a clean, strong interface.",
                old: "The original silicon surface. About 44% of the final oxide thickness is below this line and 56% above.",
                gas: "Oxygen (or steam) molecules diffusing through the oxide to reach the silicon, where they react."
            },
            read: function (c) {

                const th = c.data.th || 0;
                const um = th / 3;

                return {
                    th: (um * 1000).toFixed(0) + " nm (illustrative)",
                    below: (um * 0.44 * 1000).toFixed(0) + " nm",
                    above: (um * 0.56 * 1000).toFixed(0) + " nm",
                    verdict: c.state.gas === "dry" ? "Dry oxidation: slow, dense, best electrical quality: used for gate oxides" : "Wet oxidation: much faster, a bit less dense: used when you need thick oxide"
                };
            },
            reward: { when: function (c) { return c.data.sawDry && c.data.sawWet && c.state.time >= 3; }, msg: "You grew oxide wet and dry" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const rand = mulberry(7);
                const NG = 70;

                d.th = 0; d.sawDry = false; d.sawWet = false;
                s.scene.add(g);
                s.shadow(g, 8, 6);

                const siM = s.mat(0x8a93b8, { metalness: 0.7, roughness: 0.3 });
                const si = s.box(5.0, 1, 3.0, siM, 0, -0.5, 0);

                s.part(g, "si", si, [siM]);

                const oxM = s.glass(0xfff1c4, 0.6, false);
                const ox = s.box(5.0, 1, 3.0, oxM, 0, 0.0, 0);

                s.part(g, "ox", ox, [oxM]);

                // the original surface
                const om = new T.MeshBasicMaterial({ color: 0xffc94a, transparent: true, opacity: 0.35, side: T.DoubleSide, depthWrite: false });
                const old = new T.Mesh(new T.PlaneGeometry(5.4, 3.4), om);

                old.rotation.x = -Math.PI / 2;
                old.position.y = 0;
                s.part(g, "old", old, [om]);

                const l1 = s.label("Original surface");

                l1.at = function () { return [-2.9, 0, 1.7]; };

                // oxidant molecules
                const gM = new T.MeshStandardMaterial({ color: 0x5fb1ff, emissive: 0x0a2a4a, roughness: 0.3 });
                const gl = s.inst(NG, new T.SphereGeometry(0.09, 10, 8), gM);

                s.part(g, "gas", gl.mesh, [gM]);

                d.gl = gl; d.NG = NG; d.rand = rand; d.ox = ox; d.si = si; d.gp = [];

                for (let i = 0; i < NG; i++) { d.gp.push({ x: (rand() - 0.5) * 4.6, z: (rand() - 0.5) * 2.6, t: rand(), v: 0.5 + rand() * 0.6 }); }
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const wet = c.state.gas === "wet";

                if (wet) { d.sawWet = true; } else { d.sawDry = true; }

                // thickness grows as the square root of time, faster when wet and hot
                const k = (wet ? 0.95 : 0.34) * Math.exp((c.state.temp - 1000) / 250);
                const th = Math.min(2.4, k * Math.sqrt(c.state.time) * 1.3);

                d.th += (th - d.th) * Math.min(1, dt * 3);

                const above = d.th * 0.56;
                const below = d.th * 0.44;

                // the oxide runs from below the old surface up to above it
                d.ox.scale.y = Math.max(0.001, d.th);
                d.ox.position.y = (above - below) / 2;

                // the silicon surface sinks by the consumed amount
                d.si.position.y = -0.5 - below;

                // oxidant diffuses down through the oxide and reacts at the interface
                d.gp.forEach(function (p, i) {

                    p.t += dt * p.v * 0.5;

                    if (p.t > 1) { p.t = 0; p.x = (d.rand() - 0.5) * 4.6; p.z = (d.rand() - 0.5) * 2.6; }

                    const top = above + 0.6;
                    const bottom = -below;
                    const y = top + (bottom - top) * p.t;

                    d.gl.set(i, p.x, y, p.z, p.t < 0.96 ? 1 : 0.0001);
                });

                d.gl.flush();
            }
        });

        // ================================================================
        // UNIT 13: LITHOGRAPHY
        // ================================================================
        const MASKPAT = [1, 0, 1, 1, 0, 0, 1, 0, 1];     // 1 = clear (light passes)

        D("chip-3d-litho", {

            title: "Explore in 3D: coat, expose, develop",
            intro: "Step through the process and compare a positive resist with a negative resist.",
            stats: [["Step", "step"], ["Resist left on the wafer", "left"], ["Tone", "tone"]],
            defaults: { tone: "pos", step: 0 },
            controls: [
                { seg: "tone", label: "Resist tone", options: [["pos", "Positive: light dissolves it"], ["neg", "Negative: light hardens it"]] },
                { slider: "step", label: "Step (0 coat, 1 expose, 2 develop)", min: 0, max: 2, step: 1, fmt: function (v) { return ["Coated", "Exposed", "Developed"][v]; } },
                { views: ["three", "front", "side"] }
            ],
            formula: "A wafer gets coated with photoresist, exposed to a patterned image, and developed so part of the resist washes away. The remaining resist protects some areas while the next step works on the rest. Resist is a polymer that reacts to light: positive resist becomes soluble where it is exposed and dissolves; negative resist cross-links where it is exposed and stays. The mask (reticle) is a very flat quartz plate with an opaque chrome pattern that blocks light where the pattern says dark. (Pattern and sizes simplified.)",
            stage: { target: [0, 1.6, 0], halfWidth: 4.6, halfHeight: 3.3, views: { three: [0.6, 1.1], front: [0, 1.45], side: [1.3, 1.4] }, home: "three", sway: [0.5, 0.3] },
            info: {
                mask: "The mask: a quartz plate with an opaque chrome pattern. Clear areas let light through; chrome blocks it.",
                chrome: "The chrome pattern: opaque lines that block the light.",
                light: "The light, shining through the clear areas of the mask and focused onto the wafer.",
                resist: "The photoresist: a polymer film that changes when light hits it.",
                si: "The silicon wafer underneath.",
                lens: "The lens: it shrinks the mask image onto the wafer, so the pattern on the wafer is much smaller than on the mask."
            },
            read: function (c) {

                const d = c.data;
                const st = c.state.step;
                const pos = c.state.tone === "pos";
                const left = MASKPAT.reduce(function (a, v) { return a + (pos ? (v === 0 ? 1 : 0) : (v === 1 ? 1 : 0)); }, 0);

                return {
                    step: ["Coat", "Expose", "Develop"][st],
                    left: st < 2 ? "All of it (not developed yet)" : left + " of 9 stripes",
                    tone: pos ? "Positive" : "Negative",
                    verdict: st === 0 ? "A uniform film of photoresist covers the wafer" : st === 1 ? "Light passes through the clear parts of the mask and changes the resist underneath" : pos ? "Developed: the exposed resist dissolved, so the pattern is the mask itself" : "Developed: the unexposed resist washed away, so the pattern is the mask's opposite"
                };
            },
            reward: { when: function (c) { return c.data.sawPos && c.data.sawNeg; }, msg: "You developed both kinds of resist" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();

                d.sawPos = false; d.sawNeg = false; d.expose = 0;
                s.scene.add(g);
                s.shadow(g, 8, 6);

                const siM = s.mat(0x8a93b8, { metalness: 0.7, roughness: 0.3 });

                s.part(g, "si", s.box(5.0, 0.4, 3.2, siM, 0, 0.2, 0), [siM]);

                // resist stripes
                const stripes = [];
                const rm = new T.MeshStandardMaterial({ color: 0xff9a54, transparent: true, opacity: 0.85, roughness: 0.4, emissive: 0x000000 });

                for (let i = 0; i < 9; i++) {

                    const sb = s.box(0.52, 0.32, 3.0, rm, -2.2 + i * 0.55, 0.56, 0);

                    stripes.push(sb);
                    g.add(sb);
                }

                s.part(g, "resist", stripes, [rm]);
                d.stripes = stripes; d.rm = rm;

                // exposed stripes get their own material so they can glow
                d.expM = new T.MeshStandardMaterial({ color: 0xffe08a, transparent: true, opacity: 0.9, roughness: 0.4, emissive: 0xffb800, emissiveIntensity: 0.6 });

                // mask, with chrome stripes
                const qm = s.glass(0xbfd0ff, 0.28, false);
                const mask = s.box(5.2, 0.12, 3.4, qm, 0, 3.0, 0);

                s.part(g, "mask", mask, [qm]);

                const cm = s.mat(0x10141f, { roughness: 0.6 });
                const chrome = [];

                MASKPAT.forEach(function (v, i) {

                    if (v === 0) { const b = s.box(0.5, 0.05, 3.2, cm, -2.2 + i * 0.55, 3.08, 0); g.add(b); chrome.push(b); }
                });

                s.part(g, "chrome", chrome, [cm]);

                // lens
                const lm = s.glass(0x9fd0ff, 0.45, false);
                const lens = s.cyl(1.4, 1.4, 0.35, lm, 0, 1.9, 0, 32);

                s.part(g, "lens", lens, [lm]);

                // light beams, one per clear stripe
                const bm = new T.MeshBasicMaterial({ color: 0xfff1b0, transparent: true, opacity: 0.0, depthWrite: false });
                const beams = [];

                MASKPAT.forEach(function (v, i) {

                    if (v === 1) {

                        const b = s.box(0.4, 2.3, 3.0, bm, -2.2 + i * 0.55, 1.75, 0);

                        g.add(b);
                        beams.push(b);
                    }
                });

                s.part(g, "light", beams, [bm]);
                d.bm = bm;

                const lb = s.label("Mask");

                lb.at = function () { return [-2.8, 3.1, 1.7]; };

                const l2 = s.label("Photoresist");

                l2.at = function () { return [-2.8, 0.55, 1.7]; };
            },
            frame: function (c, dt) {

                const d = c.data;
                const st = c.state.step;
                const pos = c.state.tone === "pos";

                if (st === 2) { if (pos) { d.sawPos = true; } else { d.sawNeg = true; } }

                // light on during the exposure step
                const want = st === 1 ? 0.28 : 0;

                d.bm.opacity += (want - d.bm.opacity) * Math.min(1, dt * 5);

                d.stripes.forEach(function (sb, i) {

                    const clear = MASKPAT[i] === 1;
                    const exposed = st >= 1 && clear;
                    const removed = st >= 2 && (pos ? clear : !clear);

                    sb.material = exposed ? d.expM : d.rm;
                    sb.visible = true;

                    const target = removed ? 0.0001 : 1;

                    sb.scale.y += (target - sb.scale.y) * Math.min(1, dt * 6);
                    sb.position.y = 0.4 + 0.16 * sb.scale.y;
                });
            }
        });

        // ================================================================
        // UNIT 19: THE P-N JUNCTION
        // ================================================================
        D("chip-3d-pn", {

            title: "Explore in 3D: a p-n junction",
            intro: "Slide the bias voltage and watch the depletion region and the current.",
            stats: [["Bias", "bias"], ["Depletion region", "dep"], ["Current", "cur"]],
            defaults: { v: 0 },
            controls: [
                { slider: "v", label: "Voltage on the p side relative to the n side (V)", min: -2, max: 0.9, step: 0.05, fmt: function (v) { return (v > 0 ? "+" : "") + v.toFixed(2) + " V"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "Put p-type and n-type silicon side by side and the boundary becomes a p-n junction. Mobile carriers near the boundary diffuse across and cancel out, leaving a depletion region of fixed charge: positive donor ions on the n side and negative acceptor ions on the p side. A forward bias (positive on the p side) shrinks the region and lets current flow; a reverse bias widens it and blocks current. That one-way behavior is the heart of diodes and transistors. (Illustrative.)",
            stage: { target: [0, 1.0, 0], halfWidth: 4.6, halfHeight: 2.4, views: { three: [0.5, 1.15], front: [0, 1.45], top: [0, 0.4] }, home: "three", sway: [0.4, 0.25] },
            info: {
                p: "The p side: boron-doped silicon, with plenty of holes (missing electrons) as mobile positive carriers.",
                n: "The n side: phosphorus-doped silicon, with plenty of free electrons.",
                dep: "The depletion region: carriers near the junction have diffused across and cancelled, leaving only fixed charged atoms. It has almost no mobile carriers, so it blocks current.",
                hole: "A hole: a mobile positive carrier on the p side.",
                elec: "An electron: a mobile negative carrier on the n side.",
                ionN: "A fixed positive donor ion on the n side, left behind when its electron wandered off.",
                ionP: "A fixed negative acceptor ion on the p side, left behind when its hole wandered off."
            },
            read: function (c) {

                const v = c.state.v;
                const w = clamp(1.0 - v * 0.9, 0.12, 2.4);
                const cur = v > 0.3 ? Math.round((Math.exp((v - 0.3) * 6) - 1) * 0.6) : v < 0 ? -1 : 0;

                return {
                    bias: v > 0.02 ? "Forward" : v < -0.02 ? "Reverse" : "None",
                    dep: w < 0.4 ? "Thin" : w > 1.4 ? "Wide" : "Medium",
                    cur: cur > 1 ? cur + " mA (flowing)" : cur < 0 ? "Tiny leak" : "Almost none",
                    verdict: v > 0.3 ? "Forward bias: the depletion region has shrunk and carriers cross the junction as current" : v > 0 ? "Forward but below the turn-on voltage: still almost no current" : v < -0.02 ? "Reverse bias: the depletion region widens and blocks the current" : "No bias: a small depletion region sits at the boundary"
                };
            },
            reward: { when: function (c) { return c.data.fwd && c.data.rev; }, msg: "You biased a junction both ways" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const rand = mulberry(19);
                const NC = 42;

                d.fwd = false; d.rev = false;
                s.scene.add(g);
                s.shadow(g, 9, 5);

                const pm = s.glass(0xff8a9a, 0.2, false);
                const nm = s.glass(0x7cb4ff, 0.2, false);
                const pb = s.box(3.2, 1.8, 2.4, pm, -1.7, 0.9, 0);
                const nb = s.box(3.2, 1.8, 2.4, nm, 1.7, 0.9, 0);

                s.part(g, "p", pb, [pm]);
                s.part(g, "n", nb, [nm]);
                d.pb = pb; d.nb = nb;

                const dm = new T.MeshStandardMaterial({ color: 0xffe08a, transparent: true, opacity: 0.22, depthWrite: false });
                const dep = s.box(1, 1.8, 2.4, dm, 0, 0.9, 0);

                s.part(g, "dep", dep, [dm]);
                d.dep = dep;

                // fixed ions in the depletion region (cubes)
                const ipM = new T.MeshStandardMaterial({ color: 0xff6f7e, roughness: 0.4 });
                const inM = new T.MeshStandardMaterial({ color: 0x5f8bff, roughness: 0.4 });
                const ionsP = s.inst(40, new T.BoxGeometry(0.16, 0.16, 0.16), inM);
                const ionsN = s.inst(40, new T.BoxGeometry(0.16, 0.16, 0.16), ipM);

                s.part(g, "ionP", ionsP.mesh, [inM]);
                s.part(g, "ionN", ionsN.mesh, [ipM]);
                d.ionsP = ionsP; d.ionsN = ionsN;

                const hM = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 0.2, emissive: 0x666666 });
                const eM = new T.MeshStandardMaterial({ color: 0x54e0c7, emissive: 0x1b7a68, roughness: 0.3 });
                const holes = s.inst(NC, new T.TorusGeometry(0.13, 0.045, 8, 16), hM);
                const elecs = s.inst(NC, new T.SphereGeometry(0.11, 12, 10), eM);

                s.part(g, "hole", holes.mesh, [hM]);
                s.part(g, "elec", elecs.mesh, [eM]);

                d.holes = holes; d.elecs = elecs; d.NC = NC; d.hp = []; d.ep = [];

                for (let i = 0; i < NC; i++) {

                    d.hp.push({ x: -3.2 + rand() * 3.0, y: 0.15 + rand() * 1.6, z: (rand() - 0.5) * 2.1, ph: rand() * 6 });
                    d.ep.push({ x: 0.2 + rand() * 3.0, y: 0.15 + rand() * 1.6, z: (rand() - 0.5) * 2.1, ph: rand() * 6 });
                }

                const lp = s.label("p side (holes)");
                const ln = s.label("n side (electrons)");

                lp.at = function () { return [-1.7, 2.0, 0]; };
                ln.at = function () { return [1.7, 2.0, 0]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const v = c.state.v;
                const w = clamp(1.0 - v * 0.9, 0.12, 2.4);

                if (v > 0.35) { d.fwd = true; }
                if (v < -0.5) { d.rev = true; }

                d.dep.scale.x = w;

                // fixed ions line the two edges of the depletion region
                for (let i = 0; i < 40; i++) {

                    const row = i % 8, col = Math.floor(i / 8);
                    const y = 0.25 + row * 0.2;
                    const z = -0.9 + col * 0.45;

                    d.ionsP.set(i, -w / 2 + 0.12, y, z);
                    d.ionsN.set(i, w / 2 - 0.12, y, z);
                }

                d.ionsP.flush();
                d.ionsN.flush();

                // carriers: held back by the depletion region; forward bias pushes them across
                const drive = v > 0 ? v * 1.6 : v * 0.3;

                d.hp.forEach(function (p, i) {

                    p.x += (drive + Math.sin(t * 2 + p.ph) * 0.35) * dt;
                    p.y += Math.cos(t * 1.4 + p.ph) * 0.25 * dt;
                    p.z += Math.sin(t * 1.1 + p.ph * 2) * 0.25 * dt;

                    const wall = v > 0.4 ? 3.2 : -w / 2;

                    if (v <= 0.4) { p.x = clamp(p.x, -3.2, -w / 2 - 0.05); } else if (p.x > 3.2) { p.x = -3.2; }

                    p.y = clamp(p.y, 0.15, 1.7);
                    p.z = clamp(p.z, -1.1, 1.1);
                    void wall;
                    d.holes.set(i, p.x, p.y, p.z);
                });

                d.ep.forEach(function (p, i) {

                    p.x -= (drive - Math.sin(t * 2.3 + p.ph) * 0.35) * dt;
                    p.y += Math.cos(t * 1.3 + p.ph) * 0.25 * dt;
                    p.z += Math.sin(t * 1.2 + p.ph * 2) * 0.25 * dt;

                    if (v <= 0.4) { p.x = clamp(p.x, w / 2 + 0.05, 3.2); } else if (p.x < -3.2) { p.x = 3.2; }

                    p.y = clamp(p.y, 0.15, 1.7);
                    p.z = clamp(p.z, -1.1, 1.1);
                    d.elecs.set(i, p.x, p.y, p.z);
                });

                d.holes.flush();
                d.elecs.flush();
            }
        });

        // ================================================================
        // UNIT 25: FRONT-END AND BACK-END
        // ================================================================
        D("chip-3d-stack", {

            title: "Explore in 3D: the chip as one tall stack",
            intro: "Highlight the front end (transistors) or the back end (wiring), and pull the layers apart.",
            stats: [["Showing", "show"], ["Layers", "n"], ["What this half does", "does"]],
            defaults: { half: "all", explode: 30 },
            controls: [
                { seg: "half", label: "Highlight", options: [["all", "The whole stack"], ["feol", "Front end (FEOL)"], ["beol", "Back end (BEOL)"]] },
                { slider: "explode", label: "Pull the layers apart", min: 0, max: 100, step: 1, fmt: function (v) { return v + " %"; } },
                { views: ["three", "front", "side"] }
            ],
            formula: "Every process step sorts into one of two halves. Front-end-of-line (FEOL) builds the transistors themselves: wells, the gate stack, the implants, and the anneal that activates them. Back-end-of-line (BEOL) is everything above the first contact: tungsten contacts reaching down to the transistors, then layer after layer of copper wiring, and finally the pads that wire bonds attach to. Picture the whole chip as a single tall stack: transistors below, wiring above. (Simplified: real chips have up to fifteen wiring layers.)",
            stage: { target: [0, 3.4, 0], halfWidth: 4.4, halfHeight: 5.2, views: { three: [0.6, 1.1], front: [0, 1.45], side: [1.3, 1.4] }, home: "three", sway: [0.5, 0.3] },
            info: {
                sub: "The silicon substrate: the foundation.",
                well: "Wells: doped regions that set up each transistor's type.",
                gate: "Gates and transistors: the oxide-and-polysilicon gate stacks, with source and drain implants beside them.",
                contact: "Contacts: tungsten plugs that reach down to the transistor terminals. They mark the boundary between front end and back end.",
                m1: "Metal 1: the first layer of copper wiring, just above the contacts.",
                mid: "Upper metal layers: wiring runs in alternating directions, joined by vias, getting wider and thicker toward the top.",
                pad: "Pads: the metal squares that wire bonds or bumps attach to later."
            },
            read: function (c) {

                const h = c.state.half;

                return {
                    show: h === "all" ? "Everything" : h === "feol" ? "Front end only" : "Back end only",
                    n: "3 front-end and 7 back-end layers shown",
                    does: h === "feol" ? "Builds the transistors" : h === "beol" ? "Wires them together" : "Transistors below, wiring above",
                    verdict: h === "feol" ? "FEOL: wells, gate stack, implants and anneal" : h === "beol" ? "BEOL: contacts, then copper wiring layer after layer, then pads" : "Transistors below, wiring above: one tall stack"
                };
            },
            reward: { when: function (c) { return c.data.sawF && c.data.sawB && c.count() >= 3; }, msg: "You split a chip into front end and back end" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const L = [];

                d.sawF = false; d.sawB = false;
                s.scene.add(g);
                s.shadow(g, 7, 7);

                function layer(key, y, grp, feol) { grp.userData = { y: y, feol: feol }; g.add(grp); L.push(grp); }

                const sm = s.mat(0x8a93b8, { metalness: 0.7, roughness: 0.3 });
                const sub = new T.Group();

                sub.add(s.box(4.2, 0.4, 4.2, sm, 0, 0, 0));
                s.part(sub, "sub", sub.children.slice(), [sm]);
                layer("sub", 0, sub, true);

                const wm = s.mat(0x7c8cff, { roughness: 0.5, transparent: true, opacity: 0.8 });
                const wm2 = s.mat(0xff9a54, { roughness: 0.5, transparent: true, opacity: 0.8 });
                const wells = new T.Group();

                wells.add(s.box(1.8, 0.2, 3.6, wm, -1.0, 0, 0));
                wells.add(s.box(1.8, 0.2, 3.6, wm2, 1.0, 0, 0));
                s.part(wells, "well", wells.children.slice(), [wm, wm2]);
                layer("wells", 1, wells, true);

                const gm = s.mat(0xc2c6d2, { metalness: 0.8, roughness: 0.25 });
                const gates = new T.Group();

                for (let i = 0; i < 4; i++) { gates.add(s.box(0.25, 0.3, 3.0, gm, -1.5 + i, 0, 0)); }

                s.part(gates, "gate", gates.children.slice(), [gm]);
                layer("gates", 2, gates, true);

                const cm = s.mat(0xe0e2ea, { metalness: 0.9, roughness: 0.25 });
                const contacts = new T.Group();

                for (let i = 0; i < 4; i++) { for (let k = 0; k < 3; k++) { contacts.add(s.cyl(0.07, 0.07, 0.35, cm, -1.5 + i, 0, -1 + k, 10)); } }

                s.part(contacts, "contact", contacts.children.slice(), [cm]);
                layer("contacts", 3, contacts, false);

                const cols = [0xd9b45a, 0xe2c26a, 0xc9a04a, 0xe8cc7a, 0xb8903a];

                for (let i = 0; i < 5; i++) {

                    const m = s.mat(cols[i], { metalness: 0.85, roughness: 0.3 });
                    const lay = new T.Group();
                    const n = 8 - Math.floor(i / 2);

                    for (let k = 0; k < n; k++) {

                        const off = -1.7 + k * (3.4 / (n - 1));
                        const w = i % 2 === 0 ? s.box(3.8, 0.1, 0.18 + i * 0.03, m, 0, 0, off) : s.box(0.18 + i * 0.03, 0.1, 3.8, m, off, 0, 0);

                        lay.add(w);
                    }

                    s.part(lay, i === 0 ? "m1" : "mid", lay.children.slice(), [m]);
                    layer("m" + (i + 1), 4 + i, lay, false);
                }

                const pm = s.mat(0xf0e090, { metalness: 0.9, roughness: 0.25 });
                const pads = new T.Group();

                [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].forEach(function (p) { pads.add(s.box(0.6, 0.1, 0.6, pm, p[0], 0, p[1])); });
                s.part(pads, "pad", pads.children.slice(), [pm]);
                layer("pads", 9, pads, false);

                d.L = L;

                [["Back end: copper wiring", 6.2, false], ["Front end: transistors", 1.2, true]].forEach(function (b) {

                    const lb = s.label(b[0]);

                    lb.at = function () { return [-2.8, d.labelY ? d.labelY[b[2] ? 0 : 1] : b[1], 0]; };
                });

                d.labelY = [1.2, 6.2];
            },
            frame: function (c, dt) {

                const d = c.data;
                const e = c.state.explode / 100;
                const h = c.state.half;

                if (h === "feol") { d.sawF = true; }
                if (h === "beol") { d.sawB = true; }

                d.L.forEach(function (grp) {

                    const y = grp.userData.y * (0.42 + 0.9 * e);

                    grp.position.y += (y - grp.position.y) * Math.min(1, dt * 6);

                    const on = h === "all" || (h === "feol") === grp.userData.feol;

                    grp.traverse(function (o) {

                        if (o.isMesh) {

                            o.material.transparent = true;
                            o.material.opacity += ((on ? (o.material.userData.o0 || 1) : 0.12) - o.material.opacity) * Math.min(1, dt * 6);
                            o.material.userData.o0 = o.material.userData.o0 || o.material.opacity;
                        }
                    });
                });

                d.labelY = [d.L[1].position.y + 0.3, d.L[6].position.y + 0.3];
            }
        });

        // ================================================================
        // UNIT 31: YIELD
        // ================================================================
        D("chip-3d-yield", {

            title: "Explore in 3D: yield on a wafer",
            intro: "Scatter defects over the wafer and change the die size to see how many good dies are left.",
            stats: [["Good dies", "good"], ["Yield", "yield"], ["Model prediction", "model"]],
            defaults: { dens: 0.2, die: 10 },
            controls: [
                { actions: [["roll", "🎲 Scatter new defects"]], label: "Defects" },
                { slider: "dens", label: "Defect density (per cm²)", min: 0.02, max: 1, step: 0.02, fmt: function (v) { return v.toFixed(2) + " /cm²"; } },
                { slider: "die", label: "Die size (mm on a side)", min: 5, max: 25, step: 1, fmt: function (v) { return v + " mm"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "Yield is the fraction of die that pass every test and actually work: yield = good die ÷ total die. A wafer costs about the same whether 95% or 40% of its die work, so low yield makes each good die carry more of the cost. Smaller die fit more per wafer and give each defect fewer chances to land on one; die near the edge are usually thrown out because the pattern there is incomplete. A simple Poisson model predicts yield Y = e<sup>−A·D</sup>, with die area A and defect density D. (Wafer is 300 mm; counts are for illustration.)",
            stage: { target: [0, 0.2, 0], halfWidth: 4.6, halfHeight: 4.7, views: { three: [0.4, 1.0], front: [0, 1.4], top: [0, 0.28] }, home: "top", sway: [0.0, 0.0] },
            info: {
                good: "A good die: no defect landed on it, so it passes every test.",
                bad: "A bad die: at least one killer defect fell inside it.",
                edge: "An edge die: partly off the wafer, so it is thrown away.",
                defect: "A defect: a particle or flaw that ruins any die it lands on.",
                wafer: "The wafer."
            },
            read: function (c) {

                const d = c.data;

                if (d.total === undefined) { return {}; }

                const A = Math.pow(c.state.die / 10, 2);
                const model = Math.exp(-A * c.state.dens);
                const y = d.total ? d.good / d.total : 0;

                return {
                    good: d.good + " of " + d.total,
                    yield: Math.round(y * 100) + " %",
                    model: Math.round(model * 100) + " %",
                    verdict: y > 0.8 ? "High yield: most dies work" : y > 0.5 ? "Moderate yield: a quarter or more of the dies are lost" : "Low yield: each good die carries the cost of the wasted ones"
                };
            },
            reward: { when: function (c) { return c.data.sawSmall && c.data.sawBig && c.data.rolls >= 1; }, msg: "You saw how die size and defects set yield" },
            act: function (c, id) { if (id === "roll") { c.data.rolls++; c.data.newDefects(); c.data.recompute(); } },
            onChange: function (c) { if (c.state.die <= 8) { c.data.sawSmall = true; } if (c.state.die >= 20) { c.data.sawBig = true; } c.data.recompute(); },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const WR = 4.0;                      // wafer radius in scene units = 150 mm
                const U = WR / 150;                  // units per mm
                const MAXD = 3200;
                const MAXF = 700;
                const rand = mulberry(31);

                d.total = 0; d.good = 0; d.rolls = 0; d.sawSmall = false; d.sawBig = false;
                s.scene.add(g);
                s.shadow(g, 10, 10);

                const wm = s.mat(0x39415c, { metalness: 0.4, roughness: 0.4 });

                s.part(g, "wafer", s.disc(WR + 0.1, 0.1, wm, 0, 0.05, 0), [wm]);

                const dm = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
                const dies = s.inst(MAXD, new T.BoxGeometry(1, 0.06, 1), dm);

                s.part(g, "good", dies.mesh, [dm]);

                const fm = new T.MeshStandardMaterial({ color: 0xff3a50, emissive: 0x801020, roughness: 0.3 });
                const defs = s.inst(MAXF, new T.SphereGeometry(0.05, 8, 6), fm);

                s.part(g, "defect", defs.mesh, [fm]);
                d.dies = dies; d.defs = defs; d.MAXD = MAXD; d.MAXF = MAXF; d.dpos = [];

                d.newDefects = function () {

                    d.dpos = [];

                    for (let i = 0; i < MAXF; i++) {

                        const a = rand() * 6.283, r = Math.sqrt(rand()) * 150;

                        d.dpos.push([Math.cos(a) * r, Math.sin(a) * r]);
                    }
                };

                d.newDefects();

                d.recompute = function () {

                    const p = c.state.die;
                    const area = Math.PI * 150 * 150 / 100;                  // wafer area in cm²
                    const nDef = Math.min(MAXF, Math.round(c.state.dens * area));
                    let total = 0, good = 0, n = 0;

                    for (let ix = -Math.ceil(150 / p); ix <= Math.ceil(150 / p); ix++) {

                        for (let iz = -Math.ceil(150 / p); iz <= Math.ceil(150 / p); iz++) {

                            const x0 = ix * p - p / 2, x1 = x0 + p, z0 = iz * p - p / 2, z1 = z0 + p;
                            const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
                            const far = Math.max(Math.hypot(Math.abs(x0), Math.abs(z0)), Math.hypot(Math.abs(x1), Math.abs(z1)), Math.hypot(Math.abs(x0), Math.abs(z1)), Math.hypot(Math.abs(x1), Math.abs(z0)));

                            if (Math.hypot(cx, cz) > 160 || n >= MAXD) { continue; }

                            const inside = far <= 150;
                            let killed = false;

                            for (let k = 0; k < nDef && !killed; k++) { const q = d.dpos[k]; if (q[0] >= x0 && q[0] < x1 && q[1] >= z0 && q[1] < z1) { killed = true; } }

                            dies.xform(n, cx * U, 0.12, cz * U, 0, 0, 0, (p - 0.5) * U, 1, (p - 0.5) * U);
                            dies.color(n, !inside ? 0x4a516a : killed ? 0xff6f7e : 0x54e0c7);

                            if (inside) { total++; if (!killed) { good++; } }

                            n++;
                        }
                    }

                    for (let i = n; i < MAXD; i++) { dies.hide(i); }

                    dies.flush();
                    d.total = total;
                    d.good = good;

                    for (let k = 0; k < MAXF; k++) {

                        if (k < nDef) { defs.set(k, d.dpos[k][0] * U, 0.2, d.dpos[k][1] * U); } else { defs.hide(k); }
                    }

                    defs.flush();
                };

                d.recompute();
            },
            frame: function () { }
        });

        // ================================================================
        // UNIT 37: DIE TO PACKAGE
        // ================================================================
        D("chip-3d-package", {

            title: "Explore in 3D: inside a chip package",
            intro: "Pull the package apart, then compare a wire-bonded die with a flip-chip die.",
            stats: [["Connection", "conn"], ["Heat leaves through", "heat"], ["Signal path", "path"]],
            defaults: { conn: "wire", explode: 40 },
            controls: [
                { seg: "conn", label: "First-level interconnect", options: [["wire", "Wire bonding"], ["flip", "Flip chip"]] },
                { slider: "explode", label: "Pull the package apart", min: 0, max: 100, step: 1, fmt: function (v) { return v + " %"; } },
                { views: ["three", "front", "side"] }
            ],
            formula: "A bare die is too fragile to use. A package protects it from moisture, dust and damage; connects it, turning micron-scale pads into balls or pins a board can solder to; and cools it, giving the heat generated inside a path out. There are two ways in. Wire bonding glues the die face-up and runs fine gold wires from its pads to the package. Flip chip turns the die face-down and joins it with an array of tiny solder bumps, which gives shorter connections and many more of them. (Simplified: sizes are not to scale.)",
            stage: { target: [0, 1.5, 0], halfWidth: 4.2, halfHeight: 3.3, views: { three: [0.6, 1.1], front: [0, 1.4], side: [1.3, 1.4] }, home: "three", sway: [0.5, 0.3] },
            info: {
                die: "The die: the silicon chip itself. Its active face holds the circuits and the tiny pads.",
                sub: "The package substrate: a small board that fans the die's tiny pads out to larger balls.",
                wire: "Bond wires: fine gold wires from the die's pads to the substrate. Each is a single connection.",
                bump: "Solder bumps: tiny balls that join the face-down die to the substrate in one step, with many connections in a small area.",
                ball: "Solder balls: the connections that the finished package uses to attach to a circuit board.",
                lid: "The lid or heat spreader: protects the die and carries heat up and away to a heat sink.",
                heat: "Heat flow: the die makes heat, and the package gives it a path out."
            },
            read: function (c) {

                const f = c.state.conn === "flip";

                return {
                    conn: f ? "Flip chip: bumps under the die" : "Wire bonding: wires from the top",
                    heat: f ? "The back of the die, straight to the lid" : "The lid above, through the die's back",
                    path: f ? "Short and direct: many connections" : "A longer wire per connection",
                    verdict: f ? "Flip chip: the die is face-down on an array of bumps: short paths and many connections" : "Wire bonding: the die sits face-up and fine wires run from each pad to the package"
                };
            },
            reward: { when: function (c) { return c.data.sawW && c.data.sawF && c.count() >= 3; }, msg: "You compared the two ways to connect a die" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const L = {};

                d.sawW = false; d.sawF = false;
                s.scene.add(g);
                s.shadow(g, 7, 7);

                // solder balls (bottom)
                const bm = s.mat(0xc9ccd6, { metalness: 0.9, roughness: 0.2 });
                const balls = new T.Group();

                for (let i = 0; i < 5; i++) { for (let k = 0; k < 5; k++) { balls.add(s.sph(0.17, bm, -1.3 + i * 0.65, 0, -1.3 + k * 0.65, 14)); } }

                s.part(balls, "ball", balls.children.slice(), [bm]);
                g.add(balls);
                L.balls = balls;

                // substrate
                const sm = s.mat(0x3b8f5a, { roughness: 0.6 });
                const sub = s.box(3.8, 0.22, 3.8, sm, 0, 0, 0);

                s.part(g, "sub", sub, [sm]);
                L.sub = sub;

                // the die
                const dm = s.mat(0x5f7bd8, { metalness: 0.4, roughness: 0.4 });
                const die = s.box(1.8, 0.16, 1.8, dm, 0, 0, 0);

                s.part(g, "die", die, [dm]);
                L.die = die;

                // wire bonds
                const wm = s.mat(0xf2d27a, { metalness: 0.9, roughness: 0.2 });
                const wires = new T.Group();

                for (let i = 0; i < 5; i++) {

                    const z = -0.7 + i * 0.35;

                    [-1, 1].forEach(function (sx) { wires.add(s.tube([[sx * 0.8, 0.12, z], [sx * 1.15, 0.5, z], [sx * 1.55, 0.14, z]], 0.02, wm, 14)); });
                }

                s.part(wires, "wire", wires.children.slice(), [wm]);
                g.add(wires);
                L.wires = wires;

                // flip-chip bumps
                const bum = new T.Group();

                for (let i = 0; i < 5; i++) { for (let k = 0; k < 5; k++) { bum.add(s.sph(0.07, bm, -0.7 + i * 0.35, 0, -0.7 + k * 0.35, 10)); } }

                s.part(bum, "bump", bum.children.slice(), [bm]);
                g.add(bum);
                L.bumps = bum;

                // lid
                const lm = s.glass(0xbfd0ff, 0.28, false);
                const lid = s.box(3.4, 0.14, 3.4, lm, 0, 0, 0);

                s.part(g, "lid", lid, [lm]);
                L.lid = lid;

                // heat arrows
                const heat = new T.Group();

                [-0.5, 0, 0.5].forEach(function (x) { heat.add(s.arrow([x, 0.2, 0], [x, 1.3, 0], 0xff6f4a, 0.04)); });
                g.add(heat);
                L.heat = heat;
                s.part(g, "heat", heat.children[0].children.slice(), [heat.children[0].children[0].material]);

                d.L = L;
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const L = d.L;
                const e = c.state.explode / 100;
                const flip = c.state.conn === "flip";

                if (flip) { d.sawF = true; } else { d.sawW = true; }

                const k = Math.min(1, dt * 6);

                function to(o, y) { o.position.y += (y - o.position.y) * k; }

                to(L.balls, 0.0);
                to(L.sub, 0.45 + 0.4 * e);
                to(L.bumps, flip ? 0.7 + 0.9 * e : -5);
                to(L.die, flip ? 0.78 + 1.0 * e : 0.68 + 1.0 * e);
                to(L.wires, 0.68 + 1.0 * e);
                to(L.lid, 1.15 + 2.2 * e);
                to(L.heat, 1.1 + 2.0 * e);

                L.bumps.visible = flip;
                L.wires.visible = !flip;
                L.heat.children.forEach(function (a, i) { a.position.y = 0.0 + Math.sin(t * 2 + i) * 0.05; });
            }
        });

        // ================================================================
        // UNIT 43: IDM, FABLESS AND FOUNDRY
        // ================================================================
        D("chip-3d-industry", {

            title: "Explore in 3D: who designs, who builds",
            intro: "Compare an IDM, which does both, with the fabless and foundry split.",
            stats: [["Companies", "co"], ["Cost to build the fab", "cost"], ["Flowing between them", "flow"]],
            defaults: { model: "idm", cost: 10 },
            controls: [
                { seg: "model", label: "Business model", options: [["idm", "IDM (designs and builds)"], ["fab", "Fabless + foundry"]] },
                { slider: "cost", label: "Cost of a leading-edge fab ($ billions)", min: 1, max: 25, step: 1, fmt: function (v) { return "$" + v + "B"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "A chip company can design its own chips and build them in its own fabs (an integrated device manufacturer, IDM, such as Intel historically), design chips only (fabless, such as Nvidia, Qualcomm or Apple), or build chips for others (a foundry). A fabless company designs a chip, then ships the design to a foundry, which builds it without ever selling the chip under its own name. The split happened because fabs got too costly for every design house to own one. (Schematic.)",
            stage: { target: [0, 2.0, 0], halfWidth: 6.4, halfHeight: 4.6, views: { three: [0.5, 1.05], front: [0, 1.4], top: [0, 0.4] }, home: "three", sway: [0.4, 0.25] },
            info: {
                design: "A design team: it draws the chip but, in the fabless model, owns no factory.",
                fab: "A fab: a factory costing billions of dollars. Its height here grows with the cost.",
                files: "A design file traveling to the fab.",
                wafer: "A finished wafer traveling back."
            },
            read: function (c) {

                const idm = c.state.model === "idm";

                return {
                    co: idm ? "One company does both" : "Three design houses and one foundry",
                    cost: "$" + c.state.cost + " billion",
                    flow: idm ? "Design files stay in house" : "Design files go out, wafers come back",
                    verdict: idm ? "An IDM owns the whole path, but it also carries the whole cost of the fab" : "Several fabless companies share one foundry, so only one company carries the cost of the fab"
                };
            },
            reward: { when: function (c) { return c.data.sawIdm && c.data.sawFab && c.count() >= 2; }, msg: "You compared the industry models" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const rand = mulberry(43);
                const NF = 24;

                d.sawIdm = false; d.sawFab = false;
                s.scene.add(g);
                s.shadow(g, 16, 7);

                const fm = s.mat(0x7c8cff, { metalness: 0.3, roughness: 0.5 });
                const fab = s.box(2.6, 1, 2.8, fm, 4.2, 0.5, 0);

                s.part(g, "fab", fab, [fm]);
                d.fab = fab;

                // chimneys for flavor
                const chim = [];

                for (let i = 0; i < 3; i++) { const ch = s.cyl(0.12, 0.12, 1, s.mat(0x4a516a), 3.4 + i * 0.8, 0, -1.0, 10); g.add(ch); chim.push(ch); }

                d.chim = chim;

                const dm = s.mat(0x54c9b0, { metalness: 0.3, roughness: 0.5 });
                const designs = [];

                [[-4.6, -1.8], [-4.6, 0], [-4.6, 1.8]].forEach(function (p, i) {

                    const t = s.box(1.4, 1.8, 1.4, dm, p[0], 0.9, p[1]);

                    g.add(t);
                    designs.push(t);
                });

                s.part(g, "design", designs, [dm]);
                d.designs = designs;

                // the "IDM" outline that wraps design and fab together
                const om = new T.MeshBasicMaterial({ color: 0xffd666, transparent: true, opacity: 0.0, depthWrite: false });
                const idmBox = s.box(11, 0.1, 3.0, om, 0, 0.05, 0);

                g.add(idmBox);
                d.om = om;

                // files (blue) go right, wafers (gold) come back
                const fM = new T.MeshStandardMaterial({ color: 0x5fb1ff, emissive: 0x0a2a4a, roughness: 0.3 });
                const wM = new T.MeshStandardMaterial({ color: 0xffc94a, emissive: 0x4a3000, roughness: 0.3 });
                const files = s.inst(NF, new T.BoxGeometry(0.22, 0.04, 0.3), fM);
                const wafers = s.inst(NF, new T.CylinderGeometry(0.16, 0.16, 0.04, 20), wM);

                s.part(g, "files", files.mesh, [fM]);
                s.part(g, "wafer", wafers.mesh, [wM]);
                d.files = files; d.wafers = wafers; d.NF = NF; d.fp = [];

                for (let i = 0; i < NF; i++) { d.fp.push({ u: rand(), row: i % 3, v: 0.25 + rand() * 0.15 }); }

                const l1 = s.label("Design");

                l1.at = function () { return [-4.6, 2.4, 0]; };

                const l2 = s.label("Fab");

                l2.at = function () { return [4.2, d.fab.scale.y * 1 + 0.4, 0]; };
                d.l2 = l2;
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const idm = c.state.model === "idm";

                if (idm) { d.sawIdm = true; } else { d.sawFab = true; }

                // the fab grows with its cost
                const h = 0.8 + c.state.cost * 0.22;

                d.fab.scale.y += (h - d.fab.scale.y) * Math.min(1, dt * 4);
                d.fab.position.y = d.fab.scale.y / 2;
                d.chim.forEach(function (ch, i) { ch.scale.y = d.fab.scale.y + 0.6; ch.position.y = ch.scale.y / 2; });

                // an IDM is one company: one design block next to the fab, shown with a gold outline
                d.designs.forEach(function (t0, i) {

                    const show = !idm || i === 1;

                    t0.visible = show;
                    t0.position.x += ((idm ? -1.8 : -4.6) - t0.position.x) * Math.min(1, dt * 4);
                    t0.position.z += (((idm ? 0 : (i - 1) * 1.8)) - t0.position.z) * Math.min(1, dt * 4);
                });

                d.om.opacity += ((idm ? 0.25 : 0) - d.om.opacity) * Math.min(1, dt * 4);

                // the flows
                const x0 = idm ? -1.1 : -3.8;
                const x1 = 3.0;

                d.fp.forEach(function (p, i) {

                    p.u = (p.u + dt * p.v) % 1;

                    const z = idm ? 0 : (p.row - 1) * 1.8;
                    const x = x0 + (x1 - x0) * p.u;

                    d.files.set(i, x, 0.35 + Math.sin(p.u * Math.PI) * 0.4, z + 0.3);
                    d.wafers.set(i, x1 - (x1 - x0) * ((p.u + 0.5) % 1), 0.2, z - 0.3);
                });

                d.files.flush();
                d.wafers.flush();
            }
        });

        document.querySelectorAll('.fd-sim[data-sim^="chip-3d-"]').forEach(F.mount);
    }

})();
