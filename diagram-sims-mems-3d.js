/* ========================================
   MEMS & MICROFABRICATION: 3D SCENES

   Unit 1:  a comb-drive MEMS: a sensor and an actuator, next to a human hair.
   Unit 4:  contamination on a wafer, and what a cleanroom does about it.
   Unit 7:  silicon, doping, and the carriers that carry current.
   Unit 13: the PolyMUMPs layer stack, and releasing the structure.
   Unit 17: a MEMS accelerometer: a proof mass on springs.
   Unit 21: a digital micromirror array.
   Unit 25: sorting cells with a standing sound wave (acoustophoresis).
   Unit 29: from die to package, in nine steps.

   Built on diagram-sims-3d-core.js and the local three.js.
   Teaching models: sizes, speeds and numbers are illustrative.
======================================== */

(function () {

    const F = window.FabInteract;

    if (!F || !F.memsHelpers) {
        return;
    }

    function needCore(cb) {

        if (F.three) { cb(); return; }

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
        // UNIT 1: A COMB-DRIVE MEMS
        // ================================================================
        D("mems-3d-comb", {

            title: "Explore in 3D: a MEMS comb drive",
            intro: "Use it as an actuator (apply a voltage) or as a sensor (shake it), and compare its size with a human hair.",
            stats: [["Shuttle position", "x"], ["Capacitance change", "dc"], ["Mode", "mode"]],
            defaults: { mode: "act", v: 0, a: 0, hair: "off" },
            controls: [
                { seg: "mode", label: "Use it as", options: [["act", "An actuator (apply a voltage)"], ["sen", "A sensor (shake it)"]] },
                { slider: "v", label: "Voltage across the combs (V)", min: 0, max: 100, step: 1, fmt: function (v) { return v + " V"; } },
                { slider: "a", label: "Acceleration of the chip (g)", min: -10, max: 10, step: 0.5, fmt: function (v) { return (v > 0 ? "+" : "") + v + " g"; } },
                { seg: "hair", label: "Scale", options: [["off", "Hide the hair"], ["on", "Show a human hair"]] },
                { views: ["three", "front", "top"] }
            ],
            formula: "MEMS combine tiny mechanical structures with electrical components to sense, move, control, or interact with the physical world. A sensor detects a physical quantity and converts it into a useful signal; an actuator uses energy or a control signal to create movement or force. In this comb drive, a voltage between interleaved fingers pulls the shuttle in (an actuator; the force grows with V²), and in sensor mode an acceleration pushes the shuttle and changes the capacitance between the fingers. A human hair is about 70 µm wide, roughly 35 times the width of one of these fingers. (Not to scale in length.)",
            stage: { target: [0, 0.8, 0], halfWidth: 5.2, halfHeight: 2.4, views: { three: [0.5, 1.15], front: [0, 1.2], top: [0, 0.35] }, home: "three", sway: [0.4, 0.25] },
            info: {
                chip: "The silicon chip: the base everything is built on. The MEMS structure is etched from a thin layer on top.",
                shuttle: "The shuttle: the movable central bar. Its comb fingers slide between the fixed ones.",
                mfing: "Movable fingers: attached to the shuttle. They form capacitors with the fixed fingers.",
                ffing: "Fixed fingers: attached to anchors on the chip. A voltage between fixed and movable fingers pulls them together.",
                spring: "Folded springs: they hold the shuttle and let it move along one direction while resisting other motion.",
                anchor: "Anchors: where the structure is fixed to the chip.",
                hair: "A human hair, about 70 micrometers wide. It dwarfs the comb fingers, which are only a couple of micrometers wide."
            },
            read: function (c) {

                const x = c.data.x || 0;

                return {
                    x: (x * 4).toFixed(1) + " µm",
                    dc: (Math.abs(x) * 38).toFixed(0) + " fF (illustrative)",
                    mode: c.state.mode === "act" ? "Actuator: voltage in, motion out" : "Sensor: motion in, capacitance out",
                    verdict: c.state.mode === "act" ? "The voltage pulls the shuttle in: the force grows with the square of the voltage" : "Acceleration pushes the shuttle, and the capacitance between the fingers changes: that is the signal"
                };
            },
            reward: { when: function (c) { return c.data.sawAct && c.data.sawSen && c.data.sawHair; }, msg: "You used a comb drive both ways" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                d.x = 0; d.sawAct = false; d.sawSen = false; d.sawHair = false;
                s.scene.add(g);
                s.shadow(g, 12, 7);

                const sub = s.mat(0x39415c, { metalness: 0.3, roughness: 0.55 });

                s.part(g, "chip", s.box(10.4, 0.4, 5.2, sub, 0, -0.2, 0), [sub]);

                const pm = s.mat(0xe2e6f2, { metalness: 0.6, roughness: 0.3 });
                const pm2 = s.mat(0xffc94a, { metalness: 0.5, roughness: 0.35 });
                const am = s.mat(0xff7a8a, { metalness: 0.4, roughness: 0.4 });

                // anchors
                const anchors = [];

                [[-4.4, -2.0], [-4.4, 2.0], [4.4, -2.0], [4.4, 2.0]].forEach(function (p) { anchors.push(s.box(0.5, 0.35, 0.5, am, p[0], 0.17, p[1])); });
                [[0, -3.45], [0, 3.45]].forEach(function (p) { anchors.push(s.box(2.2, 0.35, 0.5, am, p[0], 0.17, p[1])); });
                s.part(g, "anchor", anchors, [am]);

                // moving group: the shuttle and its fingers
                const mover = new T.Group();

                g.add(mover);
                d.mover = mover;

                const shuttle = s.box(0.6, 0.3, 4.0, pm2, 0, 0.5, 0);

                mover.add(shuttle);

                const mf = [];

                for (let i = 0; i < 9; i++) {

                    const z = -1.8 + i * 0.45;

                    mf.push(s.box(1.5, 0.28, 0.1, pm2, -0.9, 0.5, z));
                    mf.push(s.box(1.5, 0.28, 0.1, pm2, 0.9, 0.5, z));
                }

                mf.forEach(function (m) { mover.add(m); });
                s.part(mover, "shuttle", shuttle, [pm2]);
                s.part(mover, "mfing", mf, [pm2]);

                // fixed fingers
                const ff = [];

                for (let i = 0; i < 9; i++) {

                    const z = -1.8 + i * 0.45 + 0.22;

                    ff.push(s.box(1.5, 0.28, 0.1, pm, -1.55, 0.5, z));
                    ff.push(s.box(1.5, 0.28, 0.1, pm, 1.55, 0.5, z));
                }

                ff.push(s.box(0.3, 0.28, 4.4, pm, -2.35, 0.5, 0));
                ff.push(s.box(0.3, 0.28, 4.4, pm, 2.35, 0.5, 0));
                s.part(g, "ffing", ff, [pm]);

                // folded springs at each end of the shuttle: two beams and a crossbar, joined to an anchor
                const spm = s.mat(0xc9ccd6, { metalness: 0.7, roughness: 0.3 });
                const springs = [];

                [-1, 1].forEach(function (e) {

                    [-0.5, 0.5].forEach(function (x) { const b = s.box(0.08, 0.14, 0.9, spm, x, 0.5, e * 2.45); mover.add(b); springs.push(b); });

                    const cb = s.box(1.08, 0.14, 0.08, spm, 0, 0.5, e * 2.9); mover.add(cb); springs.push(cb);
                    const st = s.box(0.08, 0.14, 0.4, spm, 0, 0.5, e * 3.1); mover.add(st); springs.push(st);
                });

                s.part(mover, "spring", springs, [spm]);

                // the hair
                const hm = s.mat(0x6b4a2a, { roughness: 0.8 });
                const hair = s.cyl(1.05, 1.05, 11, hm, 0, 1.15, -3.6, 24);

                hair.rotation.z = Math.PI / 2;
                hair.rotation.y = 0.0;
                s.part(g, "hair", hair, [hm]);
                d.hair = hair;

                const hl = s.label("A human hair (70 µm)");

                hl.at = function () { return [-3.0, 2.4, -3.6]; };
                d.hl = hl;

                const l1 = s.label("Comb fingers (about 2 µm wide)");

                l1.at = function () { return [0, 1.2, 2.4]; };

                d.vel = 0;
            },
            frame: function (c, dt) {

                const d = c.data;
                const st = c.state;

                if (st.mode === "act") { d.sawAct = true; } else { d.sawSen = true; }
                if (st.hair === "on") { d.sawHair = true; }

                d.hair.visible = st.hair === "on";
                d.hl.el.style.opacity = st.hair === "on" ? "1" : "0";

                // actuator: pulled in by an electrostatic force ~ V^2. Sensor: pushed by inertia ~ -a.
                const target = st.mode === "act" ? 0.45 * Math.pow(st.v / 100, 2) : -st.a * 0.045;
                const k = 70;
                const cdamp = 14;

                d.vel += (k * (target - d.x) - cdamp * d.vel) * dt;
                d.x += d.vel * dt;
                d.mover.position.x = d.x;
            }
        });

        // ================================================================
        // UNIT 4: CLEANROOMS AND WAFER CLEANING
        // ================================================================
        D("mems-3d-cleanroom", {

            title: "Explore in 3D: contamination on a wafer",
            intro: "Watch particles settle on the wafer, then turn on the cleanroom measures and run a wafer clean.",
            stats: [["Particles on the wafer", "n"], ["Chance a die survives", "ok"], ["Biggest source right now", "src"]],
            defaults: { air: "off", suit: "off" },
            controls: [
                { seg: "air", label: "Cleanroom air", options: [["off", "Ordinary room"], ["on", "Filtered laminar airflow"]] },
                { seg: "suit", label: "People", options: [["off", "Street clothes"], ["on", "Cleanroom suit"]] },
                { actions: [["clean", "🧼 Run an RCA clean"], ["dirty", "💨 Expose to the room"]], label: "Wafer" },
                { views: ["three", "front", "top"] }
            ],
            formula: "Microfabrication works with extremely small structures, so contamination that seems tiny to us can become a major defect. Contamination comes from people (skin particles, hair, clothing fibers, oils, salts), from airborne particles (dust settling on the surface), and from process residue (chemicals, photoresist, metals). Cleanrooms filter the air and control people; before important steps, wafers are cleaned to remove particles, organic residue and metallic contamination. One established method is RCA cleaning. The chance a die survives falls as particles land on it. (Counts are illustrative.)",
            stage: { target: [0, 2.0, 0], halfWidth: 4.8, halfHeight: 3.5, views: { three: [0.45, 1.05], front: [0, 1.4], top: [0, 0.3] }, home: "three", sway: [0.4, 0.25] },
            info: {
                wafer: "A silicon wafer. Any particle that lands on a die can ruin it.",
                skin: "Skin flakes, hair and clothing fibers shed by people.",
                dust: "Airborne dust settling out of the air.",
                resid: "Process residue: leftover chemicals and photoresist.",
                metal: "Metallic contamination: it can ruin electrical behavior even in tiny amounts.",
                hepa: "The filter ceiling: pushes clean air downward in a steady, laminar flow that carries particles away from the wafer.",
                person: "A person: the biggest source of particles in a cleanroom."
            },
            read: function (c) {

                const d = c.data;

                if (d.n === undefined) { return {}; }

                const area = 0.35;
                const ok = Math.exp(-d.n / 60 * area * 3);

                return {
                    n: d.n,
                    ok: Math.round(ok * 100) + " %",
                    src: d.n < 3 ? "None: the wafer is clean" : c.state.suit === "off" && c.state.air === "off" ? "People and the room air" : c.state.suit === "off" ? "People" : c.state.air === "off" ? "Airborne dust" : "Process residue",
                    verdict: d.n < 3 ? "A clean surface: start with a clean wafer" : ok < 0.5 ? "Heavily contaminated: most dies would fail" : "Contamination is building: clean it before the next step"
                };
            },
            reward: { when: function (c) { return c.data.cleaned >= 1 && c.data.sawBoth; }, msg: "You controlled contamination and cleaned a wafer" },
            act: function (c, id) { if (id === "clean") { c.data.cleaning = 1; c.data.cleaned++; } else { c.data.n = 0; c.data.cleaning = 0; c.data.fill(40); } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const rand = mulberry(4);
                const MAXP = 220;

                d.n = 0; d.cleaning = 0; d.cleaned = 0; d.sawBoth = false; d.list = [];
                s.scene.add(g);
                s.shadow(g, 8, 8);

                // wafer
                const wm = s.mat(0x8a93b8, { metalness: 0.85, roughness: 0.18 });
                const wafer = s.disc(2.2, 0.12, wm, 0, 0.06, 0);

                s.part(g, "wafer", wafer, [wm]);

                // die grid lines
                const pts = [];

                for (let i = -4; i <= 4; i++) {

                    const x = i * 0.5;
                    const half = Math.sqrt(Math.max(0, 2.15 * 2.15 - x * x));

                    pts.push(x, 0.13, -half, x, 0.13, half, -half, 0.13, x, half, 0.13, x);
                }

                const grid = s.lineSeg(pts, 0xcfe0ff, 0.4);

                g.add(grid);

                // filter ceiling and airflow arrows
                const hm = s.mat(0x4a516a, { metalness: 0.4, roughness: 0.5, emissive: 0x000000 });
                const hepa = s.box(5.2, 0.2, 5.2, hm, 0, 5.0, 0);

                s.part(g, "hepa", hepa, [hm]);
                d.hm = hm;

                const arrows = new T.Group();

                [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5], [0, 0]].forEach(function (p) { arrows.add(s.arrow([p[0], 4.7, p[1]], [p[0], 2.6, p[1]], 0x7fd0ff, 0.04)); });
                g.add(arrows);
                d.arrows = arrows;

                // a person standing beside the wafer
                const pm = s.mat(0xe2c2a8, { roughness: 0.6, emissive: 0x000000 });
                const head = s.sph(0.4, pm, 3.6, 3.4, 0, 18);
                const bodyM = s.mat(0xd5d8e4, { roughness: 0.6 });
                const body = s.cyl(0.5, 0.6, 1.9, bodyM, 3.6, 2.0, 0, 18);

                s.part(g, "person", [head, body], [pm, bodyM]);
                d.pm = pm; d.bodyM = bodyM;

                const pl = s.label("A person");

                pl.at = function () { return [3.6, 4.2, 0]; };

                // particles: skin (rose), dust (grey), residue (gold), metal (cyan)
                const cols = [0xff9aa8, 0xb6bcd0, 0xffc94a, 0x54e0c7];
                const mats = cols.map(function (h) { return new T.MeshStandardMaterial({ color: h, roughness: 0.5 }); });
                const ims = mats.map(function (m) { return s.inst(MAXP, new T.SphereGeometry(0.07, 8, 6), m); });
                const keys = ["skin", "dust", "resid", "metal"];

                ims.forEach(function (im, i) { s.part(g, keys[i], im.mesh, [mats[i]]); });
                d.ims = ims; d.MAXP = MAXP; d.rand = rand;

                d.fill = function (n) {

                    d.list = [];

                    for (let i = 0; i < n; i++) { d.addP(Math.floor(rand() * 4), true); }
                };

                d.addP = function (kind, landed) {

                    const a = rand() * 6.28;
                    const r = Math.sqrt(rand()) * 2.0;

                    d.list.push({ k: kind, x: Math.cos(a) * r, z: Math.sin(a) * r, y: landed ? 0.14 : (kind === 0 ? 3.5 : 4.8), landed: !!landed, v: 0.6 + rand() * 0.5, gone: 0 });
                };

                d.list.length = 0;
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const lam = c.state.air === "on";
                const suit = c.state.suit === "on";

                if (lam && suit) { d.sawBoth = true; }

                // sources: people shed, air drops dust, process leaves a trickle of residue and metals
                const rates = [suit ? 0.4 : 7, lam ? 0.5 : 5, 0.8, 0.3];

                if (!d.cleaning) {

                    rates.forEach(function (r, k) { if (d.rand() < r * dt && d.list.length < d.MAXP) { d.addP(k, false); } });
                }

                d.arrows.visible = lam;
                d.hm.emissive.setRGB(lam ? 0.1 : 0, lam ? 0.3 : 0, lam ? 0.45 : 0);
                d.pm.emissive.setRGB(suit ? 0.15 : 0, suit ? 0.15 : 0, suit ? 0.2 : 0);

                if (d.cleaning) { d.cleaning += dt * 0.3; }

                d.list.forEach(function (p) {

                    if (!p.landed) {

                        p.y -= p.v * dt * (lam ? 1.6 : 0.8);
                        p.x += Math.sin(t * 2 + p.z * 4) * 0.1 * dt;

                        if (lam && Math.hypot(p.x, p.z) > 2.2) { p.y -= dt * 4; }
                        if (p.y <= 0.14) {

                            // with filtered airflow most airborne particles are carried past the wafer
                            if (lam && d.rand() < 0.85 && p.k === 1) { p.gone = 2; } else { p.landed = true; p.y = 0.14; }
                        }
                    }

                    if (d.cleaning && p.landed) { p.gone = Math.max(p.gone, d.cleaning > 1 ? 2 : 0); if (d.rand() < dt * 1.8) { p.gone = 2; } }
                });

                d.list = d.list.filter(function (p) { return p.gone < 2 && p.y > 0; });

                if (d.cleaning > 1.2) { d.cleaning = 0; }

                let n = 0;
                const counts = [0, 0, 0, 0];

                d.ims.forEach(function (im) { for (let i = 0; i < d.MAXP; i++) { im.hide(i); } });

                d.list.forEach(function (p) {

                    const idx = counts[p.k]++;

                    if (idx < d.MAXP) { d.ims[p.k].set(idx, p.x, p.y, p.z); }

                    if (p.landed) { n++; }
                });

                d.ims.forEach(function (im) { im.flush(); });
                d.n = n;
            }
        });

        // ================================================================
        // UNIT 7: SILICON AND DOPING
        // ================================================================
        D("mems-3d-silicon", {

            title: "Explore in 3D: silicon, doping and carriers",
            intro: "Start with pure silicon, then replace a few atoms with boron or phosphorus and apply a voltage.",
            stats: [["Dopant", "dop"], ["Majority carrier", "maj"], ["Conductivity", "cond"]],
            defaults: { dop: "none", n: 4, v: 0.6 },
            controls: [
                { seg: "dop", label: "Silicon", options: [["none", "Pure silicon"], ["n", "n-type (phosphorus)"], ["p", "p-type (boron)"]] },
                { slider: "n", label: "Dopant atoms in this block", min: 1, max: 12, step: 1, fmt: function (v) { return v + " atoms"; } },
                { slider: "v", label: "Voltage across the block (V)", min: 0, max: 1, step: 0.05, fmt: function (v) { return v.toFixed(2) + " V"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "Silicon is a semiconductor whose electrical behavior can be deliberately modified. Introducing impurity atoms changes the concentration and type of carriers: group V dopants such as phosphorus give extra free electrons (n-type, majority carriers are electrons); group III dopants such as boron leave missing electrons called holes (p-type, majority carriers are holes). Pure silicon barely conducts; a few dopant atoms per million silicon atoms make it a good conductor. (A tiny crystal drawn with far more dopants than real.)",
            stage: { target: [0, 1.6, 0], halfWidth: 4.2, halfHeight: 2.8, views: { three: [0.6, 1.15], front: [0, 1.5], top: [0, 0.4] }, home: "three", sway: [0.5, 0.3] },
            info: {
                si: "A silicon atom: four outer electrons, each shared in a bond with a neighbor. In pure silicon almost no electrons are free to move.",
                bond: "A bond: a pair of shared electrons holding two atoms together.",
                dopP: "A phosphorus atom (group V): it has five outer electrons, four to bond and one extra that is free to move.",
                dopB: "A boron atom (group III): it has only three outer electrons, so one bond is missing an electron, a hole that can move.",
                elec: "A free electron: it moves toward the positive side.",
                hole: "A hole: a missing electron. It behaves like a positive charge and moves toward the negative side."
            },
            read: function (c) {

                const d = c.state.dop;
                const n = d === "none" ? 0 : c.state.n;

                return {
                    dop: d === "none" ? "None" : d === "n" ? "Phosphorus (group V)" : "Boron (group III)",
                    maj: d === "none" ? "Almost none free" : d === "n" ? "Electrons" : "Holes",
                    cond: n === 0 ? "Very low" : n < 4 ? "Low" : n < 8 ? "Medium" : "High",
                    verdict: d === "none" ? "Pure silicon barely conducts: almost no carriers are free" : d === "n" ? "Each phosphorus atom donates a free electron that drifts toward the positive side" : "Each boron atom leaves a hole that drifts toward the negative side"
                };
            },
            reward: { when: function (c) { return c.data.sawN && c.data.sawP && c.count() >= 2; }, msg: "You doped silicon both ways" },
            onChange: function (c, keys) { if (keys.indexOf("dop") >= 0 || keys.indexOf("n") >= 0) { c.data.rebuild(); } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const rand = mulberry(6);
                const NA = 5;
                const SP = 0.75;

                d.sawN = false; d.sawP = false;
                s.scene.add(g);
                s.shadow(g, 6, 6);

                const gm = s.glass(0x9fb8f0, 0.08, false);

                s.part(g, "si", s.box(NA * SP + 0.4, NA * SP + 0.4, NA * SP + 0.4, gm, 0, 1.9, 0), [gm], true);

                // lattice sites
                const sites = [];

                for (let i = 0; i < NA; i++) { for (let j = 0; j < NA; j++) { for (let k = 0; k < NA; k++) { sites.push([(i - 2) * SP, 1.9 + (j - 2) * SP, (k - 2) * SP]); } } }

                d.sites = sites;

                const siM = new T.MeshStandardMaterial({ color: 0xb4bdd8, roughness: 0.35, metalness: 0.3 });
                const sI = s.inst(sites.length, new T.SphereGeometry(0.17, 14, 12), siM);

                s.part(g, "si", sI.mesh, [siM]);

                // bonds
                const bp = [];

                sites.forEach(function (a, i) {

                    const ix = Math.floor(i / 25), iy = Math.floor(i / 5) % 5, iz = i % 5;

                    if (ix < NA - 1) { bp.push(a[0], a[1], a[2], a[0] + SP, a[1], a[2]); }
                    if (iy < NA - 1) { bp.push(a[0], a[1], a[2], a[0], a[1] + SP, a[2]); }
                    if (iz < NA - 1) { bp.push(a[0], a[1], a[2], a[0], a[1], a[2] + SP); }
                });

                const bonds = s.lineSeg(bp, 0xcfe0ff, 0.28);

                g.add(bonds);
                s.part(g, "bond", bonds, [bonds.material]);

                // dopants and carriers
                const pM = new T.MeshStandardMaterial({ color: 0xffa24a, emissive: 0x6a3000, roughness: 0.3 });
                const bM = new T.MeshStandardMaterial({ color: 0xc86aff, emissive: 0x3a1060, roughness: 0.3 });
                const dopP = s.inst(12, new T.SphereGeometry(0.2, 14, 12), pM);
                const dopB = s.inst(12, new T.SphereGeometry(0.2, 14, 12), bM);

                s.part(g, "dopP", dopP.mesh, [pM]);
                s.part(g, "dopB", dopB.mesh, [bM]);

                const eM = new T.MeshStandardMaterial({ color: 0x54e0c7, emissive: 0x1b7a68, roughness: 0.3 });
                const hM = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, roughness: 0.2, emissive: 0x555555 });
                const elec = s.inst(12, new T.SphereGeometry(0.15, 10, 8), eM);
                const hole = s.inst(12, new T.TorusGeometry(0.16, 0.05, 8, 16), hM);

                s.part(g, "elec", elec.mesh, [eM]);
                s.part(g, "hole", hole.mesh, [hM]);

                d.sI = sI; d.dopP = dopP; d.dopB = dopB; d.elec = elec; d.hole = hole; d.rand = rand; d.car = [];
                d.pick = [];

                d.rebuild = function () {

                    const n = c.state.dop === "none" ? 0 : c.state.n;
                    const idx = [];

                    for (let i = 0; i < n; i++) { idx.push((i * 37 + 13) % sites.length); }

                    d.pick = idx;

                    sites.forEach(function (p, i) {

                        if (idx.indexOf(i) >= 0) { sI.hide(i); } else { sI.set(i, p[0], p[1], p[2]); }
                    });

                    sI.flush();

                    for (let i = 0; i < 12; i++) {

                        if (i < n && c.state.dop === "n") { dopP.set(i, sites[idx[i]][0], sites[idx[i]][1], sites[idx[i]][2]); } else { dopP.hide(i); }
                        if (i < n && c.state.dop === "p") { dopB.set(i, sites[idx[i]][0], sites[idx[i]][1], sites[idx[i]][2]); } else { dopB.hide(i); }
                    }

                    dopP.flush(); dopB.flush();

                    d.car = [];

                    for (let i = 0; i < n; i++) { d.car.push({ x: (rand() - 0.5) * 3, y: 1.9 + (rand() - 0.5) * 3, z: (rand() - 0.5) * 3, ph: rand() * 6 }); }

                    if (c.state.dop === "n") { d.sawN = true; }
                    if (c.state.dop === "p") { d.sawP = true; }
                };

                d.rebuild();

                const lp = s.label("+ side");
                const ln = s.label("− side");

                lp.at = function () { return [2.6, 1.9, 0]; };
                ln.at = function () { return [-2.6, 1.9, 0]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const dop = c.state.dop;
                const V = c.state.v;

                // electrons drift toward +x (the positive side), holes toward -x
                d.car.forEach(function (p, i) {

                    const dir = dop === "n" ? 1 : -1;

                    p.x += dir * V * 1.6 * dt + Math.sin(t * 2 + p.ph) * 0.2 * dt;
                    p.y += Math.cos(t * 1.7 + p.ph) * 0.25 * dt;
                    p.z += Math.sin(t * 1.3 + p.ph * 2) * 0.25 * dt;

                    if (p.x > 1.9) { p.x = -1.9; }
                    if (p.x < -1.9) { p.x = 1.9; }

                    p.y = clamp(p.y, 0.2, 3.6);
                    p.z = clamp(p.z, -1.9, 1.9);

                    if (dop === "n") { d.elec.set(i, p.x, p.y, p.z); d.hole.hide(i); } else { d.hole.set(i, p.x, p.y, p.z); d.elec.hide(i); }
                });

                for (let i = d.car.length; i < 12; i++) { d.elec.hide(i); d.hole.hide(i); }

                d.elec.flush();
                d.hole.flush();
            }
        });

        // ================================================================
        // UNIT 13: THE POLYMUMPS STACK
        // ================================================================
        D("mems-3d-mumps", {

            title: "Explore in 3D: the PolyMUMPs layer stack",
            intro: "Pull the layers apart to see them, then release the structure by etching the sacrificial glass away.",
            stats: [["Layers", "n"], ["Sacrificial oxide", "ox"], ["Structure", "str"]],
            defaults: { explode: 40, release: 0 },
            controls: [
                { slider: "explode", label: "Pull the layers apart", min: 0, max: 100, step: 1, fmt: function (v) { return v + " %"; } },
                { slider: "release", label: "Release: etch away the sacrificial glass (PSG)", min: 0, max: 100, step: 1, fmt: function (v) { return v + " %"; } },
                { views: ["three", "front", "side"] }
            ],
            formula: "PolyMUMPs is a real, commercially available MEMS foundry process: eight mask levels build seven physical layers, with three polysilicon layers (Poly0, Poly1, Poly2) as structural material and two sacrificial oxide layers (PSG, phosphosilicate glass). Each layer is deposited and patterned in turn, then the final step dissolves the sacrificial glass in hydrofluoric acid, releasing the polysilicon so it can move. (Layer thicknesses are exaggerated, and the pattern is simplified.)",
            stage: { target: [0, 2.0, 0], halfWidth: 5.0, halfHeight: 3.6, views: { three: [0.6, 1.1], front: [0, 1.45], side: [1.3, 1.4] }, home: "three", sway: [0.5, 0.3] },
            info: {
                sub: "The silicon substrate: the wafer everything is built on.",
                nit: "Silicon nitride: an insulating layer that isolates the structures electrically from the substrate.",
                poly0: "Poly0: the first polysilicon layer, patterned into electrodes on the substrate (shown as two pads).",
                ox1: "First sacrificial oxide (PSG): a temporary glass layer that supports everything above it and is etched away at the end.",
                poly1: "Poly1: the main structural layer. Here it forms a beam anchored to Poly0 through holes in the oxide. After release it is free to move.",
                ox2: "Second sacrificial oxide (PSG): holds up Poly2 until release.",
                poly2: "Poly2: the third polysilicon layer, here a bridge crossing over the Poly1 beam.",
                metal: "Metal: a thin top layer for wiring and bond pads.",
                anchor: "An anchor: a post of polysilicon that fills a hole etched in the oxide and fixes the beam to the layer below."
            },
            read: function (c) {

                const r = c.state.release / 100;

                return {
                    n: "7 physical layers (8 masks)",
                    ox: r < 0.02 ? "Intact: supports the structure" : r < 0.98 ? "Dissolving…" : "Gone",
                    str: r < 0.98 ? "Locked in glass" : "Released: free to move",
                    verdict: r < 0.98 ? "The sacrificial glass holds everything in place while the layers are built" : "With the sacrificial glass etched away, the polysilicon beam and bridge are free-standing"
                };
            },
            reward: { when: function (c) { return c.state.release >= 99 && c.state.explode >= 30 && c.count() >= 3; }, msg: "You released a MEMS structure" },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                s.scene.add(g);
                s.shadow(g, 9, 6);

                const L = [];

                function layer(key, name, mesh, hex, y0) { L.push({ key: key, name: name, group: mesh, y0: y0 }); g.add(mesh); }

                const subM = s.mat(0x5a627e, { metalness: 0.4, roughness: 0.5 });
                const nitM = s.mat(0x7be0d0, { roughness: 0.4, transparent: true, opacity: 0.7 });
                const polyM = s.mat(0xd5d8e4, { metalness: 0.6, roughness: 0.3 });
                const poly1M = s.mat(0xffc94a, { metalness: 0.5, roughness: 0.3 });
                const poly2M = s.mat(0xff9aa8, { metalness: 0.5, roughness: 0.3 });
                const psgM = new T.MeshStandardMaterial({ color: 0x9fb8f0, transparent: true, opacity: 0.35, roughness: 0.2, depthWrite: false });
                const psg2M = new T.MeshStandardMaterial({ color: 0xb4a4ff, transparent: true, opacity: 0.35, roughness: 0.2, depthWrite: false });
                const metM = s.mat(0xe8e0a0, { metalness: 0.9, roughness: 0.25 });

                const sub = s.box(7, 0.5, 4.2, subM, 0, 0, 0);
                const nit = s.box(7, 0.14, 4.2, nitM, 0, 0, 0);
                const p0 = new T.Group();

                p0.add(s.box(1.2, 0.16, 1.6, polyM, -2.6, 0, 0));
                p0.add(s.box(1.2, 0.16, 1.6, polyM, 2.6, 0, 0));

                const ox1 = s.box(7, 0.4, 4.2, psgM, 0, 0, 0);
                const p1 = new T.Group();

                p1.add(s.box(5.6, 0.18, 0.9, poly1M, 0, 0.0, 0));
                p1.add(s.box(0.7, 0.8, 0.9, poly1M, -2.6, -0.45, 0));
                p1.add(s.box(0.7, 0.8, 0.9, poly1M, 2.6, -0.45, 0));

                const ox2 = s.box(7, 0.4, 4.2, psg2M, 0, 0, 0);
                const p2 = new T.Group();

                p2.add(s.box(0.9, 0.18, 3.4, poly2M, 0, 0, 0));
                p2.add(s.box(0.7, 0.8, 0.7, poly2M, 0, -0.45, -1.6));
                p2.add(s.box(0.7, 0.8, 0.7, poly2M, 0, -0.45, 1.6));

                const met = new T.Group();

                met.add(s.box(0.9, 0.08, 0.9, metM, -3.0, 0, 1.6));
                met.add(s.box(0.9, 0.08, 0.9, metM, 3.0, 0, -1.6));

                s.part(g, "sub", sub, [subM]);
                s.part(g, "nit", nit, [nitM]);
                s.part(g, "poly0", p0.children.slice(), [polyM]);
                s.part(g, "ox1", ox1, [psgM]);
                s.part(g, "poly1", p1.children.slice(), [poly1M]);
                s.part(g, "ox2", ox2, [psg2M]);
                s.part(g, "poly2", p2.children.slice(), [poly2M]);
                s.part(g, "metal", met.children.slice(), [metM]);

                const defs = [["Substrate", sub, 0], ["Nitride", nit, 1], ["Poly0", p0, 2], ["Oxide 1 (PSG)", ox1, 3], ["Poly1", p1, 4], ["Oxide 2 (PSG)", ox2, 5], ["Poly2", p2, 6], ["Metal", met, 7]];

                defs.forEach(function (df, i) {

                    g.add(df[1]);
                    L.push({ g: df[1], i: i, name: df[0], psg: i === 3 || i === 5 });

                    const lb = s.label(df[0]);

                    lb.at = function () { return [3.8, df[1].position.y, 2.2]; };
                });

                d.L = L; d.psg = [ox1, ox2]; d.psgM = [psgM, psg2M];
            },
            frame: function (c, dt) {

                const d = c.data;
                const e = c.state.explode / 100;
                const r = c.state.release / 100;
                const base = [0, 0.32, 0.47, 0.67, 1.0, 1.25, 1.58, 1.8];
                const gap = 0.75;

                d.L.forEach(function (l) {

                    const y = base[l.i] * 1.5 + l.i * gap * e;

                    l.g.position.y += (y - l.g.position.y) * Math.min(1, dt * 6);
                });

                d.psg.forEach(function (m, i) {

                    d.psgM[i].opacity = 0.35 * (1 - r);
                    m.scale.set(1 - r * 0.0, 1, 1 - r * 0.0);
                    m.visible = r < 0.99;
                });

                // after release the beam and bridge sink slightly: they are free-standing
                d.L[4].g.children[0].position.y = -r * 0.0;
            }
        });

        // ================================================================
        // UNIT 17: A MEMS ACCELEROMETER
        // ================================================================
        D("mems-3d-accel", {

            title: "Explore in 3D: a MEMS accelerometer",
            intro: "Push the chip with the acceleration slider, or press Shake, and watch the proof mass lag behind on its springs.",
            stats: [["Mass displacement", "x"], ["Capacitance, left / right", "c"], ["Output", "out"]],
            defaults: { a: 0 },
            controls: [
                { actions: [["shake", "📳 Shake it"]], label: "Try" },
                { slider: "a", label: "Steady acceleration of the chip (g)", min: -10, max: 10, step: 0.5, fmt: function (v) { return (v > 0 ? "+" : "") + v + " g"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "An accelerometer measures acceleration. Inside is a proof mass hung on springs: when the chip accelerates, the mass lags behind (inertia), and the springs stretch. Comb fingers on the mass form capacitors with fixed fingers, so the mass moving toward one side raises that capacitance and lowers the other. The difference is the signal. The mass moves x = ma/k, so a stiffer spring gives less motion. About 50 million MEMS accelerometers ship every year, in phones, airbags, drones and game controllers. (Motion is exaggerated.)",
            stage: { target: [0, 0.8, 0], halfWidth: 5.2, halfHeight: 2.6, views: { three: [0.5, 1.15], front: [0, 1.25], top: [0, 0.35] }, home: "three", sway: [0.4, 0.25] },
            info: {
                mass: "The proof mass: a large block of silicon free to move along one direction. Its inertia makes it lag behind when the chip accelerates.",
                spring: "Springs: they hold the mass and pull it back to the center. Stiffer springs mean less motion for the same acceleration.",
                comb: "Sense fingers: comb fingers on the mass form capacitors with fixed fingers on the frame. Moving closer raises the capacitance.",
                frame: "The frame and anchors, fixed to the chip.",
                bar: "A capacitance reading: the left and right sides change in opposite directions, and their difference is the output."
            },
            read: function (c) {

                const d = c.data;

                if (d.x === undefined) { return {}; }

                const dc = d.x * 120;

                return {
                    x: (d.x * 3).toFixed(2) + " µm",
                    c: (50 - dc).toFixed(0) + " / " + (50 + dc).toFixed(0) + " fF",
                    out: (dc * 0.04).toFixed(2) + " V (illustrative)",
                    verdict: Math.abs(d.x) < 0.03 ? "At rest: the springs hold the mass in the middle and the two capacitances match" : d.x > 0 ? "The mass has lagged toward the right: the right capacitance is up and the left is down" : "The mass has lagged toward the left: the left capacitance is up and the right is down"
                };
            },
            reward: { when: function (c) { return c.data.shakes >= 1 && c.state.a !== 0 && c.count() >= 2; }, msg: "You measured acceleration with a mass on springs" },
            act: function (c, id) { if (id === "shake") { c.data.shakes++; c.data.shakeT = 0; } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();

                d.x = 0; d.v = 0; d.shakes = 0; d.shakeT = 99;
                s.scene.add(g);
                s.shadow(g, 11, 7);

                const sub = s.mat(0x39415c, { metalness: 0.3, roughness: 0.55 });

                g.add(s.box(10.4, 0.4, 5.6, sub, 0, -0.2, 0));

                const am = s.mat(0xff7a8a, { metalness: 0.4, roughness: 0.4 });
                const fm = s.mat(0xe2e6f2, { metalness: 0.6, roughness: 0.3 });
                const mm = s.mat(0xffc94a, { metalness: 0.5, roughness: 0.35 });
                const spm = s.mat(0xc9ccd6, { metalness: 0.7, roughness: 0.3 });

                const anchors = [];

                [[-4.4, -2.3], [-4.4, 2.3], [4.4, -2.3], [4.4, 2.3]].forEach(function (p) { anchors.push(s.box(0.6, 0.35, 0.6, am, p[0], 0.17, p[1])); });
                s.part(g, "frame", anchors, [am]);

                // the proof mass with its sense fingers
                const mover = new T.Group();

                g.add(mover);
                d.mover = mover;

                const mass = s.box(3.0, 0.5, 3.0, mm, 0, 0.45, 0);

                mover.add(mass);
                s.part(mover, "mass", mass, [mm]);

                const mf = [];

                for (let i = 0; i < 6; i++) {

                    const z = -1.1 + i * 0.44;

                    mf.push(s.box(0.9, 0.24, 0.1, mm, -1.9, 0.45, z));
                    mf.push(s.box(0.9, 0.24, 0.1, mm, 1.9, 0.45, z));
                }

                mf.forEach(function (m) { mover.add(m); });

                // fixed sense fingers (interleaved)
                const ff = [];

                for (let i = 0; i < 6; i++) {

                    const z = -1.1 + i * 0.44 + 0.2;

                    ff.push(s.box(0.9, 0.24, 0.1, fm, -2.3, 0.45, z));
                    ff.push(s.box(0.9, 0.24, 0.1, fm, 2.3, 0.45, z));
                }

                ff.push(s.box(0.3, 0.24, 3.2, fm, -2.85, 0.45, 0));
                ff.push(s.box(0.3, 0.24, 3.2, fm, 2.85, 0.45, 0));
                s.part(g, "comb", ff.concat(mf), [fm, mm]);

                // springs: one rod each, scaled in length as the mass moves
                const springs = [];

                [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (q) {

                    const rod = s.box(1, 0.1, 0.1, spm, 0, 0.45, q[1] * 2.1);

                    rod.userData.q = q;
                    g.add(rod);
                    springs.push(rod);
                });

                s.part(g, "spring", springs, [spm]);
                d.springs = springs;

                // two capacitance bars
                const bm = s.mat(0x54e0c7, { roughness: 0.4, emissive: 0x0b4a3c });
                const bm2 = s.mat(0x9b7bff, { roughness: 0.4, emissive: 0x2a1860 });
                const barL = s.box(0.5, 1, 0.5, bm, -5.8, 0.5, 0);
                const barR = s.box(0.5, 1, 0.5, bm2, 5.8, 0.5, 0);

                s.part(g, "bar", [barL, barR], [bm, bm2]);
                d.barL = barL; d.barR = barR;

                const l1 = s.label("Left capacitance");
                const l2 = s.label("Right capacitance");

                l1.at = function () { return [-5.8, 2.0, 0]; };
                l2.at = function () { return [5.8, 2.0, 0]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;
                let a = c.state.a;

                // a shake is a decaying wiggle in the chip's acceleration
                d.shakeT += dt;

                if (d.shakeT < 3) { a += 9 * Math.sin(d.shakeT * 14) * Math.exp(-d.shakeT * 1.1); }

                // proof mass lags behind the chip: m x'' = -k x - c x' - m a
                const k = 90, cd = 5;
                const acc = -k * d.x - cd * d.v - a * 0.9;

                d.v += acc * dt;
                d.x += d.v * dt;
                d.x = clamp(d.x, -0.6, 0.6);
                d.mover.position.x = d.x;

                d.springs.forEach(function (r) {

                    const q = r.userData.q;
                    const left = q[0] < 0;
                    const x0 = left ? -4.4 : 4.4;
                    const x1 = d.x + (left ? -1.5 : 1.5);
                    const len = Math.abs(x1 - x0);

                    r.scale.x = len;
                    r.position.x = (x0 + x1) / 2;
                });

                const dc = d.x * 120;
                const hL = 1 + (50 - dc) / 50;
                const hR = 1 + (50 + dc) / 50;

                d.barL.scale.y = Math.max(0.05, hL * 0.7);
                d.barL.position.y = d.barL.scale.y / 2;
                d.barR.scale.y = Math.max(0.05, hR * 0.7);
                d.barR.position.y = d.barR.scale.y / 2;
            }
        });

        // ================================================================
        // UNIT 21: MICROMIRRORS
        // ================================================================
        const PATTERNS = {
            heart: ["00000000", "01100110", "11111111", "11111111", "11111111", "01111110", "00111100", "00011000"],
            plus: ["00011000", "00011000", "00011000", "11111111", "11111111", "00011000", "00011000", "00011000"],
            checker: ["10101010", "01010101", "10101010", "01010101", "10101010", "01010101", "10101010", "01010101"],
            letter: ["11111110", "11000011", "11000011", "11111110", "11000000", "11000000", "11000000", "11000000"]
        };

        D("mems-3d-mirrors", {

            title: "Explore in 3D: a micromirror array",
            intro: "Each tiny mirror tilts one way to send light to the lens, or the other way to throw it away. Pick an image, or click a mirror.",
            stats: [["Mirrors tilted ON", "on"], ["Light reaching the lens", "lens"], ["Mirror tilt", "tilt"]],
            defaults: { img: "heart", tilt: 12 },
            controls: [
                { seg: "img", label: "Image", options: [["heart", "Heart"], ["plus", "Plus"], ["letter", "P"], ["checker", "Checkerboard"]] },
                { slider: "tilt", label: "Mirror tilt angle (degrees)", min: 4, max: 20, step: 1, fmt: function (v) { return "±" + v + "°"; } },
                { views: ["three", "front", "side"] }
            ],
            formula: "A single MEMS chip can steer over a million mirrors, each one flipping thousands of times a second, to project an image onto a screen. In a reflective display such as Texas Instruments' digital micromirror device (DMD), each micromirror tilts to one of two states: ON sends light through the lens to the screen, OFF sends it to a light absorber. Brightness comes from how long each mirror stays ON. The wavelength of light is on the same scale as MEMS dimensions, which makes them a natural match. (8 × 8 mirrors shown; click a mirror to flip it.)",
            stage: { target: [1.2, 2.0, 0], halfWidth: 7.2, halfHeight: 3.5, views: { three: [0.7, 1.1], front: [0, 1.4], side: [1.4, 1.35] }, home: "three", sway: [0.6, 0.3] },
            info: {
                mirror: "A micromirror: a tiny mirror on a hinge, a few micrometers across. Electrostatic force tilts it between two stable positions.",
                chip: "The chip underneath: CMOS memory cells that hold each mirror's state and switch it.",
                lens: "The projection lens: it collects the light from mirrors tilted ON and focuses it onto the screen.",
                dump: "The light absorber: it swallows light from mirrors tilted OFF so it never reaches the screen.",
                src: "The lamp: it floods the whole array with light.",
                screen: "The screen, where the image appears as a grid of lit and dark spots."
            },
            read: function (c) {

                const d = c.data;

                if (d.states === undefined) { return {}; }

                const n = d.states.reduce(function (a, v) { return a + v; }, 0);

                return {
                    on: n + " of 64",
                    lens: Math.round(n / 64 * 100) + " % of the light",
                    tilt: "±" + c.state.tilt + "°",
                    verdict: "ON mirrors send light to the lens (bright pixels); OFF mirrors send it to the absorber (dark pixels)"
                };
            },
            reward: { when: function (c) { return c.data.flips >= 2 && c.count() >= 2; }, msg: "You steered light with micromirrors" },
            onChange: function (c, keys) { if (keys.indexOf("img") >= 0) { c.data.load(); } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const N = 8;
                const P = 0.55;

                d.states = new Array(64).fill(0);
                d.flips = 0;
                s.scene.add(g);
                s.shadow(g, 9, 6);

                const cm = s.mat(0x2a3150, { metalness: 0.3, roughness: 0.5 });

                s.part(g, "chip", s.box(N * P + 0.5, 0.3, N * P + 0.5, cm, 0, -0.15, 0), [cm]);

                const mm = s.mat(0xe8ecf8, { metalness: 0.95, roughness: 0.12 });
                const mirrors = s.inst(64, new T.BoxGeometry(P * 0.86, 0.05, P * 0.86), mm);

                s.part(g, "mirror", mirrors.mesh, [mm]);
                d.mirrors = mirrors;

                // lamp, lens, absorber, screen
                const lm = new T.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffd666, emissiveIntensity: 1.2 });
                const lamp = s.sph(0.4, lm, -4.4, 4.0, 0, 18);

                s.part(g, "src", lamp, [lm]);

                const lensM = s.glass(0x9fd0ff, 0.5, false);
                const lens = s.cyl(0.9, 0.9, 0.25, lensM, 3.3, 4.0, 0, 28);

                lens.rotation.z = Math.PI / 2 - 0.5;
                s.part(g, "lens", lens, [lensM]);

                const dm = s.mat(0x10141f, { roughness: 0.9 });
                const dump = s.box(0.4, 1.4, 1.8, dm, 3.3, 0.6, 0);

                dump.rotation.z = 0.5;
                s.part(g, "dump", dump, [dm]);

                const scM = s.mat(0xf5f7ff, { roughness: 0.9 });
                const scr = s.box(0.1, 3.2, 3.2, scM, 7.0, 4.4, 0);

                s.part(g, "screen", scr, [scM]);

                // screen pixels
                const cv = document.createElement("canvas");

                cv.width = cv.height = 64;
                d.cv = cv;
                d.tex = new T.CanvasTexture(cv);
                d.tex.magFilter = T.NearestFilter;

                const sp = new T.Mesh(new T.PlaneGeometry(3.0, 3.0), new T.MeshBasicMaterial({ map: d.tex }));

                sp.position.set(6.94, 4.4, 0);
                sp.rotation.y = -Math.PI / 2;
                g.add(sp);

                // light rays: one in (all), one out (per mirror)
                const rays = new T.BufferGeometry();
                const rp = new Float32Array(64 * 2 * 3 + 64 * 2 * 3);

                rays.setAttribute("position", new T.BufferAttribute(rp, 3));
                d.raysG = rays;

                const rl = new T.LineSegments(rays, new T.LineBasicMaterial({ color: 0xfff1b0, transparent: true, opacity: 0.55 }));

                rl.frustumCulled = false;
                g.add(rl);

                d.load = function () {

                    const pat = PATTERNS[c.state.img];

                    for (let r = 0; r < N; r++) { for (let k = 0; k < N; k++) { d.states[r * N + k] = pat[r][k] === "1" ? 1 : 0; } }
                };

                d.load();
                d.N = N; d.P = P;

                const l1 = s.label("Lamp");
                const l2 = s.label("Lens: to the screen");
                const l3 = s.label("Absorber: thrown away");

                l1.at = function () { return [-4.4, 4.8, 0]; };
                l2.at = function () { return [3.3, 5.1, 0]; };
                l3.at = function () { return [3.3, -0.3, 0]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const S = c.S;
                const N = d.N, P = d.P;
                const tilt = c.state.tilt * Math.PI / 180;
                const rp = d.raysG.attributes.position;
                let q = 0;

                // clicking a mirror flips it
                if (S.lastHit && S.lastHit.object === d.mirrors.mesh && S.lastHit.instanceId !== undefined && S.lastHit !== d.lastSeen) {

                    d.lastSeen = S.lastHit;
                    d.states[S.lastHit.instanceId] ^= 1;
                    d.flips++;
                }

                for (let r = 0; r < N; r++) {

                    for (let k = 0; k < N; k++) {

                        const i = r * N + k;
                        const on = d.states[i];
                        const target = on ? tilt : -tilt;

                        d.cur = d.cur || new Array(64).fill(0);
                        d.cur[i] += (target - d.cur[i]) * Math.min(1, dt * 12);

                        const x = (k - 3.5) * P;
                        const z = (r - 3.5) * P;

                        d.mirrors.xform(i, x, 0.06, z, 0, 0, d.cur[i]);

                        // incoming ray from the lamp, then the reflected ray to the lens (ON) or the absorber (OFF)
                        rp.setXYZ(q++, -4.4, 4.0, 0);
                        rp.setXYZ(q++, x, 0.08, z);
                        rp.setXYZ(q++, x, 0.08, z);
                        rp.setXYZ(q++, 3.3, on ? 4.0 : 0.6, z * 0.2);
                    }
                }

                d.mirrors.flush();
                rp.needsUpdate = true;
                d.raysG.setDrawRange(0, q);

                // update the screen image
                const x = d.cv.getContext("2d");

                x.fillStyle = "#05070e";
                x.fillRect(0, 0, 64, 64);

                for (let r = 0; r < N; r++) {

                    for (let k = 0; k < N; k++) {

                        if (d.states[r * N + k]) { x.fillStyle = "#ffe9a0"; x.fillRect(k * 8 + 1, r * 8 + 1, 6, 6); }
                    }
                }

                d.tex.needsUpdate = true;
            }
        });

        // ================================================================
        // UNIT 25: ACOUSTOPHORESIS
        // ================================================================
        D("mems-3d-acoustic", {

            title: "Explore in 3D: sorting cells with sound",
            intro: "Turn up the sound and watch big cells gather at the center while small ones stay put, then collect them at the outlets.",
            stats: [["Large cells in the center outlet", "big"], ["Small cells in the center outlet", "small"], ["Separation", "sep"]],
            defaults: { p: 60, flow: 50 },
            controls: [
                { actions: [["clear", "↺ Clear counts"]], label: "Run" },
                { slider: "p", label: "Acoustic power (relative)", min: 0, max: 100, step: 5, fmt: function (v) { return v + " %"; } },
                { slider: "flow", label: "Flow speed (relative)", min: 10, max: 100, step: 5, fmt: function (v) { return v + " %"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "Two surface acoustic waves traveling toward each other across a piezoelectric substrate combine into a standing wave: alternating pressure nodes and antinodes. Cells in the channel are pushed toward the pressure node, and the force grows with the square of the cell size, so large cells reach the node much faster than small ones. At the end of the channel, cells gathered at the center go to one outlet and the rest to the side outlets: sorting by size, with no chemicals and no filters. (Illustrative.)",
            stage: { target: [0, 0.6, 0], halfWidth: 6.0, halfHeight: 2.3, views: { three: [0.5, 1.1], front: [0, 1.45], top: [0, 0.3] }, home: "three", sway: [0.35, 0.25] },
            info: {
                chan: "The microchannel: cells flow through it from left to right.",
                idt: "An interdigital transducer: metal fingers on a piezoelectric crystal. A voltage makes it launch a surface acoustic wave across the channel.",
                node: "A pressure node: the line down the middle where the standing wave's pressure stays low. Cells are pushed here.",
                big: "A large cell (such as a white blood cell): the acoustic force grows with size squared, so it moves to the node quickly.",
                small: "A small cell or particle (such as a platelet): it feels a much weaker force and stays spread out across the channel.",
                out: "The outlets: the center outlet collects what gathered at the node; the side outlets collect the rest."
            },
            read: function (c) {

                const d = c.data;

                if (d.cb === undefined) { return {}; }

                const tb = d.cb + d.sb;

                return {
                    big: d.cb + " of " + d.tb,
                    small: d.cs + " of " + d.ts,
                    sep: tb < 5 ? "Collecting…" : d.cb / Math.max(1, d.cb + d.cs) > 0.8 ? "Good: nearly all large" : d.cb / Math.max(1, d.cb + d.cs) > 0.6 ? "Partial" : "Poor: mixed",
                    verdict: c.state.p < 10 ? "No sound: cells flow straight through and split evenly" : "Standing sound waves sort by size: large cells reach the center first"
                };
            },
            reward: { when: function (c) { const d = c.data; return d.cb >= 8 && d.cs <= 3 && c.count() >= 2; }, msg: "You sorted cells by size with sound" },
            act: function (c, id) { if (id === "clear") { const d = c.data; d.cb = 0; d.cs = 0; d.tb = 0; d.ts = 0; d.sb = 0; } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;
                const rand = mulberry(25);
                const NP = 90;

                d.cb = 0; d.cs = 0; d.tb = 0; d.ts = 0; d.sb = 0;
                s.scene.add(g);
                s.shadow(g, 14, 6);

                // piezo substrate and IDTs
                const pm = s.mat(0x39415c, { metalness: 0.3, roughness: 0.55 });

                g.add(s.box(12, 0.3, 6.0, pm, 0, -0.15, 0));

                const im = s.mat(0xe2c25a, { metalness: 0.8, roughness: 0.3, emissive: 0x000000 });
                const idts = [];

                [-1, 1].forEach(function (side) {

                    for (let i = 0; i < 10; i++) { idts.push(s.box(1.4, 0.04, 0.06, im, 0, 0.03, side * (1.7 + i * 0.22))); }
                });

                s.part(g, "idt", idts, [im]);
                d.im = im;

                // channel
                const cm = s.glass(0x9fb8f0, 0.2, false);
                const chan = s.box(11, 0.5, 2.4, cm, 0, 0.3, 0);

                s.part(g, "chan", chan, [cm]);

                const ed = new T.LineSegments(new T.EdgesGeometry(chan.geometry), new T.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.5 }));

                ed.position.copy(chan.position);
                g.add(ed);

                // pressure node plane
                const nm = new T.MeshStandardMaterial({ color: 0x54e0c7, transparent: true, opacity: 0.18, depthWrite: false, side: T.DoubleSide });
                const node = s.box(10.6, 0.5, 0.06, nm, 0, 0.3, 0);

                s.part(g, "node", node, [nm]);
                d.nm = nm;

                // outlets
                const om = s.glass(0xc8d4ff, 0.3, false);
                const out1 = s.box(1.4, 0.5, 0.5, om, 6.2, 0.3, 0);
                const out2 = s.box(1.4, 0.5, 0.5, om, 6.2, 0.3, 0.9);
                const out3 = s.box(1.4, 0.5, 0.5, om, 6.2, 0.3, -0.9);

                s.part(g, "out", [out1, out2, out3], [om]);

                const lb1 = s.label("Center outlet: collected");
                const lb2 = s.label("Side outlets: waste");

                lb1.at = function () { return [6.4, 1.0, 0]; };
                lb2.at = function () { return [6.4, 0.2, 1.6]; };

                // cells
                const bM = new T.MeshStandardMaterial({ color: 0xff7a8a, roughness: 0.4 });
                const sM = new T.MeshStandardMaterial({ color: 0x5fb1ff, roughness: 0.4 });
                const big = s.inst(NP, new T.SphereGeometry(0.15, 14, 12), bM);
                const small = s.inst(NP, new T.SphereGeometry(0.08, 12, 10), sM);

                s.part(g, "big", big.mesh, [bM]);
                s.part(g, "small", small.mesh, [sM]);
                d.big = big; d.small = small; d.NP = NP; d.rand = rand;
                d.pb = []; d.ps = [];

                function spawn(arr, i) { arr[i] = { x: -5.2 - rand() * 3.0, z: (rand() - 0.5) * 2.0, y: 0.3 + (rand() - 0.5) * 0.2, done: false }; }

                for (let i = 0; i < NP; i++) { spawn(d.pb, i); spawn(d.ps, i); }

                d.spawn = spawn;
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const P = c.state.p / 100;
                const v = 0.9 + c.state.flow / 100 * 2.0;

                d.im.emissive.setRGB(P * 0.5, P * 0.35, 0);
                d.nm.opacity = 0.05 + 0.3 * P;

                [[d.pb, d.big, 1.0, 0], [d.ps, d.small, 0.05, 1]].forEach(function (grp) {

                    const arr = grp[0], im = grp[1], size2 = grp[2], kind = grp[3];

                    arr.forEach(function (p, i) {

                        p.x += v * dt;

                        // the acoustic force pushes toward the node at z = 0, stronger for larger cells
                        const force = -Math.sin(Math.PI * p.z / 1.2 * 0.5) * P * size2 * 2.6;

                        if (p.x > -4.5 && p.x < 4.6) { p.z += force * dt; }

                        p.z += Math.sin(t * 2 + i) * 0.03 * dt;
                        p.z = clamp(p.z, -1.1, 1.1);

                        if (p.x > 5.4 && !p.done) {

                            p.done = true;

                            if (kind === 0) { d.tb++; } else { d.ts++; }

                            if (Math.abs(p.z) < 0.3) { if (kind === 0) { d.cb++; } else { d.cs++; } } else { d.sb++; }
                        }

                        if (p.x > 6.6) { d.spawn(arr, i); }

                        im.set(i, p.x, p.y, p.z);
                    });

                    im.flush();
                });
            }
        });

        // ================================================================
        // UNIT 29: DIE TO PACKAGE
        // ================================================================
        const PSTEPS = [
            "A finished die sits on its wafer, bonded to a cap wafer to protect the moving parts.",
            "Wafer sawing: a thin blade cuts the wafer into individual dies.",
            "Pick and place: a machine lifts each good die and sets it on the package substrate.",
            "Die attach: adhesive glues the die to the package so it stays put and conducts heat away.",
            "Wire bonding: fine gold wires connect the die's pads to the package leads.",
            "Encapsulation: a soft gel or lid protects the die and wires from moisture and mechanical shock.",
            "Overmolding: a plastic body is molded around everything for a rugged package.",
            "Trimming: the leads are cut free from the frame and shaped.",
            "Final testing: every unit is tested before it ships."
        ];

        D("mems-3d-package", {

            title: "Explore in 3D: from die to package",
            intro: "Step through the nine steps and watch a bare die become a shipped part.",
            stats: [["Step", "step"], ["What happens", "what"], ["The package protects", "prot"]],
            defaults: { step: 0 },
            controls: [
                { actions: [["play", "▶ Play all nine steps"]], label: "Build" },
                { slider: "step", label: "Step (1 to 9)", min: 0, max: 9, step: 1, fmt: function (v) { return v === 0 ? "Bare die" : v + " of 9"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "A perfectly fabricated MEMS die is still useless until it is protected, wired up, and sealed into something you can actually ship. Packaging builds the connection between the die and everything outside it while letting through only the parameters you actually care about. It has two jobs: protect the device (from moisture, shock, chemicals, light, heat) and protect the environment. Nine steps: bonding, wafer sawing, pick and place; die attach, wire bonding, encapsulation; overmolding, trimming, final testing. (Schematic.)",
            stage: { target: [0, 1.0, 0], halfWidth: 3.6, halfHeight: 2.3, views: { three: [0.6, 1.15], front: [0, 1.4], top: [0, 0.35] }, home: "three", sway: [0.5, 0.3] },
            info: {
                die: "The MEMS die: a tiny silicon chip with the moving structure on top and a protective cap bonded over it.",
                cap: "The cap: bonded over the die to protect the moving parts.",
                sub: "The package substrate or leadframe: the base that carries the die and the leads.",
                att: "Die-attach adhesive: a thin layer that holds the die and conducts heat.",
                wire: "Bond wires: fine gold wires that connect each pad on the die to a lead on the package.",
                gel: "Encapsulation: a soft protective gel or lid over the die and wires.",
                mold: "The molded body: plastic around the die and wires, giving a rugged package.",
                lead: "The leads: metal legs that connect the package to a circuit board.",
                saw: "The saw blade that cuts the wafer into dies."
            },
            read: function (c) {

                const st = c.state.step;

                return {
                    step: st === 0 ? "Bare die" : st + " of 9",
                    what: st === 0 ? "Start" : ["Bonding", "Wafer sawing", "Pick and place", "Die attach", "Wire bonding", "Encapsulation", "Overmolding", "Trimming", "Final testing"][st - 1],
                    prot: st < 6 ? "Nothing yet: the die is exposed" : st < 7 ? "From moisture and shock" : "From moisture, shock and handling",
                    verdict: st === 0 ? PSTEPS[0] : PSTEPS[st - 1]
                };
            },
            reward: { when: function (c) { return c.state.step >= 9 && c.count() >= 3; }, msg: "You packaged a MEMS die" },
            act: function (c, id) { if (id === "play") { c.state.step = 0; c.data.auto = true; c.data.at = 0; c.root.querySelector('input[data-key="step"]').value = 0; } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                d.auto = false; d.at = 0;
                s.scene.add(g);
                s.shadow(g, 9, 7);

                // wafer piece
                const wm = s.mat(0x8a93b8, { metalness: 0.7, roughness: 0.25 });
                const wafer = s.box(3.4, 0.2, 3.4, wm, 0, 0.1, 0);

                g.add(wafer);
                d.wafer = wafer;

                // saw lines
                const sawM = s.mat(0xff6f7e, { roughness: 0.4 });
                const lines = [];

                [-1.2, 0, 1.2].forEach(function (z) { const l1 = s.box(3.4, 0.03, 0.04, sawM, 0, 0.22, z); g.add(l1); lines.push(l1); });
                d.lines = lines;

                const blade = s.cyl(0.9, 0.9, 0.06, s.mat(0xc9ccd6, { metalness: 0.9, roughness: 0.2 }), 0, 1.3, 0, 32);

                blade.rotation.x = Math.PI / 2;
                s.part(g, "saw", blade, [blade.material]);
                d.blade = blade;

                // the die and its cap (this one moves)
                const dieG = new T.Group();
                const dm = s.mat(0x5f7bd8, { metalness: 0.4, roughness: 0.4 });
                const cm = s.glass(0xbfd0ff, 0.5, false);
                const die = s.box(1.0, 0.18, 1.0, dm, 0, 0, 0);
                const cap = s.box(0.8, 0.12, 0.8, cm, 0, 0.15, 0);

                dieG.add(die);
                dieG.add(cap);
                s.part(dieG, "die", die, [dm]);
                s.part(dieG, "cap", cap, [cm]);
                g.add(dieG);
                d.dieG = dieG;

                // substrate with leads
                const sm = s.mat(0x3b8f5a, { roughness: 0.6 });
                const sub = s.box(3.0, 0.2, 3.0, sm, 0, 0.1, 0);

                s.part(g, "sub", sub, [sm]);
                g.add(sub);
                d.sub = sub;

                const lm = s.mat(0xd9b45a, { metalness: 0.85, roughness: 0.25 });
                const leads = [];

                for (let i = 0; i < 4; i++) {

                    leads.push(s.box(0.7, 0.08, 0.2, lm, -1.8, 0.22, -0.9 + i * 0.6));
                    leads.push(s.box(0.7, 0.08, 0.2, lm, 1.8, 0.22, -0.9 + i * 0.6));
                }

                leads.forEach(function (l) { g.add(l); });
                s.part(g, "lead", leads, [lm]);
                d.leads = leads;

                // adhesive
                const am = s.mat(0xffe08a, { roughness: 0.5 });
                const att = s.box(1.1, 0.04, 1.1, am, 0, 0.22, 0);

                s.part(g, "att", att, [am]);
                g.add(att);
                d.att = att;

                // bond wires: arcs from the die edge to the leads
                const wires = [];
                const wmat = s.mat(0xf2d27a, { metalness: 0.9, roughness: 0.2 });

                for (let i = 0; i < 4; i++) {

                    const z = -0.9 + i * 0.6;

                    [-1, 1].forEach(function (sx) {

                        const w = s.tube([[sx * 0.45, 0.32, z * 0.5], [sx * 1.0, 0.65, z * 0.8], [sx * 1.5, 0.3, z]], 0.018, wmat, 14);

                        g.add(w);
                        wires.push(w);
                    });
                }

                s.part(g, "wire", wires, [wmat]);
                d.wires = wires;

                // gel and mold
                const gm = new T.MeshStandardMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.5, roughness: 0.2, depthWrite: false });
                const gel = s.cyl(1.0, 1.1, 0.7, gm, 0, 0.55, 0, 30);

                s.part(g, "gel", gel, [gm]);
                g.add(gel);
                d.gel = gel;

                const mm = s.mat(0x1b1f2e, { roughness: 0.5, transparent: true, opacity: 0.92 });
                const mold = s.box(2.7, 0.9, 2.6, mm, 0, 0.6, 0);

                s.part(g, "mold", mold, [mm]);
                g.add(mold);
                d.mold = mold; d.mm = mm;

                // test: a green tick plate
                const tm = new T.MeshStandardMaterial({ color: 0x54e0c7, emissive: 0x1b7a68, roughness: 0.4 });
                const tick = s.box(0.5, 0.05, 0.5, tm, 0, 1.15, 0);

                g.add(tick);
                d.tick = tick;
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const st = c.state.step;

                if (d.auto) {

                    d.at += dt;

                    if (d.at > 2.0) {

                        d.at = 0;

                        if (c.state.step < 9) { c.state.step++; c.root.querySelector('input[data-key="step"]').value = c.state.step; } else { d.auto = false; }
                    }
                }

                const k = Math.min(1, dt * 4);

                // wafer and saw: visible before the die is placed
                const onWafer = st < 3;

                d.wafer.visible = st <= 2;
                d.lines.forEach(function (l) { l.visible = st <= 2; l.scale.x = 1; });
                d.blade.visible = st === 2;
                d.blade.position.z = Math.sin(t * 2) * 1.2;

                // the die: on the wafer, then lifted and placed on the substrate
                const subVisible = st >= 3 || (st === 3);

                d.sub.visible = st >= 3;
                d.leads.forEach(function (l, i) { l.visible = st >= 3; l.scale.x = st >= 8 ? 0.55 : 1; l.position.x = (i % 2 ? 1 : -1) * (st >= 8 ? 1.6 : 1.8); });

                const dieY = st < 3 ? 0.4 : st === 3 ? 1.2 : 0.38;
                const dieX = st < 3 ? 0 : 0;

                d.dieG.position.y += (dieY - d.dieG.position.y) * k;
                d.dieG.position.x += (dieX - d.dieG.position.x) * k;
                void onWafer; void subVisible;

                d.att.visible = st >= 4;
                d.wires.forEach(function (w) { w.visible = st >= 5; });
                d.gel.visible = st === 6;
                d.mold.visible = st >= 7;
                d.mm.opacity = st >= 7 ? 0.9 : 0;
                d.tick.visible = st >= 9;
                d.tick.position.y = 1.15 + Math.sin(t * 3) * 0.05;
            }
        });

        document.querySelectorAll('.fd-sim[data-sim^="mems-3d-"]').forEach(F.mount);
    }

})();
