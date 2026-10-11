/* ========================================
   BLOOD-BRAIN BARRIER ON A CHIP: 3D SCENES

   Unit 1:  the barrier is the vessel wall (leaky versus sealed capillary).
   Unit 5:  four ways around the barrier.
   Unit 9:  the anatomy of an organ-on-a-chip.
   Unit 14: cells for the chip, and how the supporting cast tightens the barrier.

   Built on diagram-sims-3d-core.js and the local three.js.
   Teaching models: sizes, speeds and counts are illustrative.
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
        // UNIT 1: THE BARRIER IS THE VESSEL WALL
        // ================================================================
        const MOLS = {
            glu: { name: "Glucose", r: 0.1, hex: 0xffc94a },
            o2: { name: "Oxygen / fat-soluble", r: 0.08, hex: 0x54e0c7 },
            tox: { name: "Toxin", r: 0.11, hex: 0xff6f7e },
            drug: { name: "Large drug (antibody)", r: 0.24, hex: 0xb89cff }
        };

        function crossRule(mol, wall) {

            if (wall === "leaky") { return mol === "drug" ? 0.35 : 1; }

            if (mol === "glu") { return 1; }       // dedicated transporter
            if (mol === "o2") { return 1; }        // slips through the cells themselves
            return 0;                              // toxins and large drugs are turned away
        }

        D("bbb-3d-barrier", {

            title: "Explore in 3D: a capillary wall, leaky or sealed",
            intro: "Send molecules down the vessel and compare an ordinary capillary with a brain capillary.",
            stats: [["Molecules that crossed", "yes"], ["Turned away", "no"], ["How they cross", "how"]],
            defaults: { wall: "brain", mol: "glu" },
            controls: [
                { seg: "wall", label: "The vessel wall", options: [["leaky", "Ordinary capillary (leaky)"], ["brain", "Brain capillary (sealed)"]] },
                { seg: "mol", label: "Send", options: [["glu", "Glucose"], ["o2", "Oxygen (fat-soluble)"], ["tox", "A toxin"], ["drug", "A large drug"]] },
                { actions: [["send", "➡ Send molecules"], ["clear", "↺ Clear counts"]], label: "Flow" },
                { views: ["three", "front", "top"] }
            ],
            formula: "In most organs, capillary walls let small molecules slip through gaps. In the brain, the cells lining the capillaries are sealed together by tight junctions and tightly control what crosses: they block germs, toxins and large proteins, deliver glucose and amino acids through dedicated transporters, and let small fat-soluble molecules such as oxygen pass through the cells. It is a selective gate, not a solid wall. The same wall blocks most medicines, which is the drug-delivery problem. (Shapes and counts are illustrative.)",
            stage: { target: [0, 1.5, 0], halfWidth: 4.2, halfHeight: 2.6, views: { three: [0.5, 1.2], front: [0, 1.5], top: [0, 0.35] }, home: "three", sway: [0.45, 0.3] },
            info: {
                tile: "An endothelial cell: one of the cells that line the capillary. In the brain they form a continuous, tightly sealed layer.",
                junc: "A tight junction: protein seals (such as claudin-5 and ZO-1) that glue neighboring cells together so nothing slips between them.",
                glut: "A GLUT1 glucose transporter: a dedicated gate that carries glucose across the cells.",
                peri: "A pericyte: it wraps the vessel, adds stability and sends signals that help keep the barrier tight.",
                astro: "An astrocyte and its end-feet: brain cells that wrap the vessel and send signals that tighten and maintain the barrier.",
                base: "The basement membrane: a thin supporting layer around the vessel wall.",
                mol: "A molecule in the blood."
            },
            read: function (c) {

                const d = c.data;

                if (d.yes === undefined) { return {}; }

                const m = c.state.mol;
                const w = c.state.wall;
                const how = w === "leaky" ? (m === "drug" ? "Some squeeze between cells" : "Through the gaps between cells") : m === "glu" ? "By the glucose transporter (GLUT1)" : m === "o2" ? "Straight through the cells (fat-soluble)" : "They do not: the sealed wall turns them away";

                return {
                    yes: d.yes,
                    no: d.no,
                    how: how,
                    verdict: w === "leaky" ? "An ordinary capillary: most small molecules slip through the gaps" : "The brain capillary is a selective gate: glucose and oxygen in, toxins and large drugs out"
                };
            },
            reward: { when: function (c) { return c.data.sawBrainDrug && c.data.sawLeakyDrug && c.count() >= 3; }, msg: "You saw why the brain's wall blocks medicine" },
            act: function (c, id) { if (id === "send") { c.data.send(); } else { c.data.yes = 0; c.data.no = 0; } },
            onChange: function (c, keys) { if (keys.indexOf("wall") >= 0) { c.data.buildWall(); c.data.yes = 0; c.data.no = 0; } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const root = new T.Group();
                const rand = mulberry(8);
                const NP = 60;
                const R = 1.0;
                const LEN = 6.4;
                const NR = 4;
                const NC = 8;
                let wallGroup = null;

                d.yes = 0; d.no = 0; d.sawBrainDrug = false; d.sawLeakyDrug = false;
                s.scene.add(root);
                s.shadow(root, 9, 4);

                d.buildWall = function () {

                    if (wallGroup) { s.dispose(wallGroup); }

                    wallGroup = new T.Group();
                    root.add(wallGroup);

                    const brain = c.state.wall === "brain";
                    const tm = s.glass(0xffb8c8, 0.26, false);
                    const gapX = brain ? 0.04 : 0.34;
                    const gapA = brain ? 0.04 : 0.3;
                    const tiles = [];
                    const juncs = [];
                    const jm = s.mat(0xff5aa0, { roughness: 0.35, emissive: 0x3a0820 });
                    const lx = LEN / NR;
                    const arc = 2 * Math.PI * R / NC;

                    for (let i = 0; i < NR; i++) {

                        for (let k = 0; k < NC; k++) {

                            const a = k / NC * Math.PI * 2 + (i % 2 ? Math.PI / NC : 0);
                            const x = -LEN / 2 + lx * (i + 0.5);
                            const tile = s.box(arc - gapA, lx - gapX, 0.12, tm, 0, 0, 0);

                            tile.position.set(x, 1.5 + Math.sin(a) * R, Math.cos(a) * R);
                            tile.up.set(1, 0, 0);
                            tile.lookAt(x, 1.5, 0);
                            wallGroup.add(tile);
                            tiles.push(tile);

                            if (brain) {

                                const jb = s.box(0.05, lx - 0.02, 0.05, jm, 0, 0, 0);

                                jb.position.set(x, 1.5 + Math.sin(a + Math.PI / NC) * R, Math.cos(a + Math.PI / NC) * R);
                                jb.up.set(1, 0, 0);
                                jb.lookAt(x, 1.5, 0);
                                wallGroup.add(jb);
                                juncs.push(jb);
                            }
                        }
                    }

                    s.part(wallGroup, "tile", tiles, [tm]);

                    if (juncs.length) { s.part(wallGroup, "junc", juncs, [jm]); }

                    // transporters on the brain wall
                    if (brain) {

                        const gm = s.mat(0x54c9b0, { roughness: 0.4 });
                        const gl = [];

                        [[-1.8, 0.6], [0.0, 2.7], [1.9, 4.3], [-1.0, 5.4]].forEach(function (p) {

                            const g1 = new T.Mesh(new T.TorusGeometry(0.1, 0.035, 8, 14), gm);

                            g1.position.set(p[0], 1.5 + Math.sin(p[1]) * (R - 0.09), Math.cos(p[1]) * (R - 0.09));
                            g1.lookAt(p[0], 1.5, 0);
                            wallGroup.add(g1);
                            gl.push(g1);
                        });

                        s.part(wallGroup, "glut", gl, [gm]);

                        // pericyte
                        const pm = s.mat(0xffa86a, { roughness: 0.5 });
                        const peri = s.sph(0.34, pm, -1.0, 1.5 + Math.sin(1.1) * (R + 0.25), Math.cos(1.1) * (R + 0.25), 18);

                        peri.scale.set(1.6, 0.8, 1);
                        s.part(wallGroup, "peri", peri, [pm]);

                        // astrocyte end-feet
                        const am = s.mat(0x9b7bff, { roughness: 0.5 });
                        const feet = [];
                        const body = s.sph(0.3, am, 1.2, 1.5 + (R + 1.0), 0.35, 16);

                        feet.push(body);

                        for (let i = 0; i < 5; i++) {

                            const a = 1.6 + i * 0.5;
                            const foot = s.box(0.55, 0.05, 0.32, am, 0.8 + i * 0.3, 1.5 + Math.sin(a) * (R + 0.2), Math.cos(a) * (R + 0.2));

                            foot.lookAt(0.8 + i * 0.3, 1.5, 0);
                            foot.rotateX(Math.PI / 2);
                            feet.push(foot);
                            wallGroup.add(foot);
                            wallGroup.add(s.tube([[1.2, 1.5 + (R + 1.0), 0.35], [1.1 + i * 0.1, 1.5 + (R + 0.6), 0.3], [0.8 + i * 0.3, 1.5 + Math.sin(a) * (R + 0.25), Math.cos(a) * (R + 0.25)]], 0.025, am, 10));
                        }

                        s.part(wallGroup, "astro", feet, [am]);
                    }

                    const bm = s.glass(0xc8d4ff, 0.08, false);
                    const base = s.cyl(R + 0.18, R + 0.18, LEN, bm, 0, 1.5, 0, 36, true);

                    base.rotation.z = Math.PI / 2;
                    s.part(wallGroup, "base", base, [bm], true);
                };

                d.buildWall();

                // the molecules
                const mm = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
                const pI = s.inst(NP, new T.SphereGeometry(1, 14, 12), mm);

                s.part(root, "mol", pI.mesh, [mm]);
                d.pI = pI; d.parts = [];

                for (let i = 0; i < NP; i++) { d.parts.push({ on: false }); }

                d.send = function () {

                    const m = c.state.mol;
                    const w = c.state.wall;
                    let n = 0;

                    if (m === "drug" && w === "brain") { d.sawBrainDrug = true; }
                    if (m === "drug" && w === "leaky") { d.sawLeakyDrug = true; }

                    d.parts.forEach(function (p) {

                        if (n >= 14 || p.on) { return; }

                        const a = rand() * 6.28;
                        const r = Math.sqrt(rand()) * 0.55;
                        const cross = rand() < crossRule(m, w);

                        p.on = true;
                        p.m = m;
                        p.x = -LEN / 2 - 0.2 - rand() * 1.4;
                        p.a = a;
                        p.r = r;
                        p.v = 0.9 + rand() * 0.5;
                        p.cross = cross;
                        p.hitX = -1.6 + rand() * 3.2;
                        p.state = 0;           // 0 flowing, 1 crossing, 2 bouncing, 3 done
                        p.u = 0;
                        p.done = false;
                        n++;
                    });
                };

                d.R = R; d.LEN = LEN; d.rand = rand;
            },
            frame: function (c, dt, t) {

                const d = c.data;

                d.parts.forEach(function (p, i) {

                    if (!p.on) { d.pI.hide(i); return; }

                    const spec = MOLS[p.m];
                    let px = p.x;
                    let rr = p.r;
                    const a = p.a + t * 0.6;

                    if (p.state === 0) {

                        p.x += p.v * dt;
                        px = p.x;

                        if (p.x > p.hitX) {

                            p.state = p.cross ? 1 : 2;
                            p.u = 0;
                            p.a0 = p.a + t * 0.6;
                            p.r0 = p.r;
                        }

                    } else if (p.state === 1) {

                        p.u += dt / 1.1;
                        p.x += p.v * dt * 0.25;
                        px = p.x;
                        rr = p.r0 + (d.R + 0.9 - p.r0) * Math.min(1, p.u);

                        if (p.u >= 1 && !p.done) { p.done = true; d.yes++; }
                        if (p.u > 1.4) { p.on = false; d.pI.hide(i); return; }

                    } else {

                        p.u += dt / 1.0;
                        p.x += p.v * dt * 0.6;
                        px = p.x;

                        const hump = Math.sin(Math.min(1, p.u) * Math.PI);

                        rr = p.r0 + (d.R - 0.14 - spec.r - p.r0) * hump;

                        if (p.u >= 0.5 && !p.done) { p.done = true; d.no++; }

                        if (p.u >= 1) { p.state = 0; p.hitX = 99; p.r = p.r0; p.a = p.a0 - t * 0.6; }
                    }

                    if (p.state === 0 && p.x > d.LEN / 2 + 0.3) { p.on = false; d.pI.hide(i); return; }

                    const aa = p.state === 1 ? p.a0 : a;

                    d.pI.xform(i, px, 1.5 + Math.sin(aa) * rr, Math.cos(aa) * rr, 0, 0, 0, spec.r, spec.r, spec.r);
                    d.pI.color(i, spec.hex);
                });

                d.pI.flush();
            }
        });

        // ================================================================
        // UNIT 5: WAYS AROUND THE BARRIER
        // ================================================================
        const WAYS = {
            none: { name: "No strategy", info: "A large drug cannot slip between sealed cells or through them, so it is turned away." },
            shuttle: { name: "Shuttle", info: "The drug is attached to something that binds a transport receptor on the cell. The cell engulfs the package and carries it across in a vesicle." },
            open: { name: "Open briefly", info: "Focused ultrasound makes microbubbles in the blood oscillate, which loosens the tight junctions for a short time. The drug slips between cells, and the seal closes again." },
            bypass: { name: "Bypass", info: "Skip the wall entirely: inject directly into the brain or the fluid around it." },
            redesign: { name: "Redesign", info: "Make the drug smaller or more fat-soluble, so it can diffuse straight through the cells." }
        };

        D("bbb-3d-ways", {

            title: "Explore in 3D: four ways around the barrier",
            intro: "Pick a strategy and send the drug. Then try the others.",
            stats: [["Strategy", "name"], ["Drug reached the brain side", "got"], ["What is happening", "what"]],
            defaults: { way: "none" },
            controls: [
                { seg: "way", label: "Strategy", options: [["none", "None"], ["shuttle", "Shuttle"], ["open", "Open briefly"], ["bypass", "Bypass"], ["redesign", "Redesign"]] },
                { actions: [["send", "💊 Send the drug"], ["clear", "↺ Clear"]], label: "Dose" },
                { views: ["front", "three", "side"] }
            ],
            formula: "Passive diffusion works best below roughly 400 to 500 daltons, and many modern drugs, and every antibody, are far larger. Four strategies: attach a shuttle that rides a transport receptor across, open the barrier briefly with focused ultrasound and microbubbles, bypass it by injecting directly, or redesign the drug to be smaller or more fat-soluble. Every strategy needs a way to measure whether it actually worked. (Schematic.)",
            stage: { target: [0, 1.2, 0], halfWidth: 4.6, halfHeight: 2.9, views: { three: [0.5, 1.25], front: [0, 1.5], side: [1.2, 1.45] }, home: "front", sway: [0.15, 0.2] },
            info: {
                cellA: "An endothelial cell of the brain capillary wall. Its membrane is a double lipid layer that large, water-loving drugs cannot cross.",
                junc: "The tight junction between two cells: a protein seal. In normal conditions nothing large fits through it.",
                recep: "A transport receptor on the blood side of the cell. A shuttle binds it, and the cell then carries the package across.",
                drug: "The drug: too large to diffuse across.",
                shuttle: "A shuttle: the drug is attached to something that binds a transport receptor.",
                bubble: "A microbubble: focused ultrasound makes it oscillate, which loosens the tight junction for a short time.",
                needle: "A needle delivering the drug directly into the brain, bypassing the wall.",
                blood: "The blood side.",
                brain: "The brain side."
            },
            read: function (c) {

                const d = c.data;

                if (d.got === undefined) { return {}; }

                const w = WAYS[c.state.way];

                return {
                    name: w.name,
                    got: d.got,
                    what: w.info.split(".")[0],
                    verdict: c.state.way === "none" ? "Without help, the drug is stopped at the wall" : d.got > 0 ? w.name + ": the drug reaches the brain side" : "Press Send to try " + w.name.toLowerCase()
                };
            },
            reward: { when: function (c) { return c.data.tried && Object.keys(c.data.tried).length >= 4; }, msg: "You tried the ways around the barrier" },
            act: function (c, id) { if (id === "send") { c.data.send(); } else { c.data.got = 0; } },
            onChange: function (c, keys) { if (keys.indexOf("way") >= 0) { c.data.setWay(); } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const rand = mulberry(55);
                const ND = 14;

                d.got = 0; d.tried = {};
                s.scene.add(g);
                s.shadow(g, 10, 5);

                // two cells side by side with a junction between
                const cm = s.glass(0xffb8c8, 0.5, false);
                const cA = s.box(3.1, 1.0, 2.4, cm, -1.65, 1.2, 0);
                const cB = s.box(3.1, 1.0, 2.4, cm, 1.65, 1.2, 0);

                s.part(g, "cellA", [cA, cB], [cm]);

                const jm = s.mat(0xff5aa0, { roughness: 0.35, emissive: 0x3a0820 });
                const junc = s.box(0.12, 1.0, 2.4, jm, 0, 1.2, 0);

                s.part(g, "junc", junc, [jm]);
                d.junc = junc;

                // receptors on the blood side
                const rm = s.mat(0x54c9b0, { roughness: 0.4 });
                const rec = [];

                [-2.6, -1.2, 1.2, 2.6].forEach(function (x) { const r = s.cyl(0.07, 0.07, 0.3, rm, x, 0.6, 0, 8); const h = s.sph(0.12, rm, x, 0.42, 0, 10); g.add(h); rec.push(r); });

                s.part(g, "recep", rec, [rm]);

                // blood and brain zones
                const bz = s.glass(0xff6a6a, 0.1, false);
                const brz = s.glass(0xb8a8ff, 0.1, false);

                s.part(g, "blood", s.box(8.6, 1.6, 2.4, bz, 0, -0.6, 0), [bz], true);
                s.part(g, "brain", s.box(8.6, 1.6, 2.4, brz, 0, 3.0, 0), [brz], true);

                const lb = s.label("Blood");

                lb.at = function () { return [-4.0, -0.6, 1.3]; };

                const lbr = s.label("Brain");

                lbr.at = function () { return [-4.0, 3.0, 1.3]; };

                // microbubbles
                const bubM = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, roughness: 0.1 });
                const bub = s.inst(8, new T.SphereGeometry(0.16, 14, 12), bubM);

                s.part(g, "bubble", bub.mesh, [bubM]);
                d.bub = bub;

                // needle
                const nm = s.mat(0xd9dae6, { metalness: 0.8, roughness: 0.25 });
                const needle = s.cyl(0.05, 0.05, 2.4, nm, 0.6, 4.4, 0, 10);

                needle.visible = false;
                s.part(g, "needle", needle, [nm]);
                d.needle = needle;

                // drug molecules
                const dm = new T.MeshStandardMaterial({ color: 0xb89cff, emissive: 0x2a1860, roughness: 0.3 });
                const drugs = s.inst(ND, new T.SphereGeometry(1, 16, 14), dm);

                s.part(g, "drug", drugs.mesh, [dm]);

                const vm = new T.MeshStandardMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.35, roughness: 0.2 });
                const ves = s.inst(ND, new T.SphereGeometry(0.34, 16, 14), vm);

                s.part(g, "shuttle", ves.mesh, [vm]);

                d.drugs = drugs; d.ves = ves; d.ND = ND; d.dm = dm; d.rand = rand;
                d.list = [];

                d.setWay = function () {

                    d.tried[c.state.way] = true;
                    d.needle.visible = c.state.way === "bypass";
                    d.list = [];
                    d.openT = 0;
                };

                d.send = function () {

                    d.tried[c.state.way] = true;
                    d.list = [];

                    for (let i = 0; i < 6; i++) { d.list.push({ x: -3.2 + rand() * 6.4, y: -1.2 - rand() * 0.4, z: (rand() - 0.5) * 1.6, ph: 0, st: 0, t: -rand() * 1.5, vx: (rand() - 0.5) * 0.3, tgt: 0, done: false }); }

                    d.openT = 0;
                    d.opening = c.state.way === "open";
                };

                d.setWay();
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const way = c.state.way;
                const r = way === "redesign" ? 0.1 : 0.26;

                d.dm.color.set(way === "redesign" ? 0x7be0a0 : 0xb89cff);

                // junction widens while ultrasound is on
                if (way === "open" && d.opening) { d.openT += dt; }

                const openAmt = way === "open" && d.opening ? Math.max(0, Math.min(1, d.openT / 0.6)) * (d.openT < 4.2 ? 1 : Math.max(0, 1 - (d.openT - 4.2) / 0.6)) : 0;

                d.junc.scale.x = 1 - openAmt * 0.0;
                d.junc.position.y = 1.2 - openAmt * 1.15;
                d.junc.material.opacity = 1;

                // microbubbles
                for (let i = 0; i < 8; i++) {

                    if (way !== "open") { d.bub.hide(i); continue; }

                    const k = 1 + Math.sin(t * 14 + i) * 0.28 * (d.opening ? 1 : 0.2);

                    d.bub.set(i, -0.7 + (i % 4) * 0.5, -0.5 - Math.floor(i / 4) * 0.5 + Math.sin(t + i) * 0.05, (i % 2 ? 0.3 : -0.3), k);
                }

                d.bub.flush();

                // drugs
                d.list.forEach(function (p, i) {

                    p.t += dt;

                    if (p.t < 0) { d.drugs.hide(i); d.ves.hide(i); return; }

                    let x = p.x, y = p.y, z = p.z;
                    let sc = r;
                    let vsc = 0;

                    if (p.st === 0) {

                        y += p.t * 0.9;
                        x += p.vx * p.t * 0.2;

                        const wallY = way === "redesign" ? 3.0 : 0.6;
                        const viaJunc = way === "open" && openAmt > 0.5 && Math.abs(p.x) < 1.3;

                        if (way === "shuttle") {

                            if (y > 0.45) {

                                p.st = 1; p.t = 0; p.x = clamp(p.x, -2.6, 2.6); p.rx = Math.abs(p.x) > 1.9 ? Math.sign(p.x) * 2.6 : Math.sign(p.x || 1) * 1.2;
                            }

                        } else if (way === "open" && viaJunc) {

                            if (p.t > 0.9) { p.st = 2; p.t = 0; p.x = p.x * 0.2; }

                        } else if (way === "bypass") {

                            // the drug appears at the needle tip in the brain
                            x = 0.6 + p.vx * 0.4; y = 3.2 - p.t * 0.0 + Math.sin(p.t * 2 + i) * 0.1; z = p.z * 0.5;

                            if (!p.done) { p.done = true; d.got++; }

                        } else if (way === "redesign") {

                            if (y > 0.5) { p.st = 3; p.t = 0; }

                        } else {

                            // blocked at the wall: bounce
                            if (y > 0.3) { y = 0.3 - Math.abs(Math.sin(p.t * 3)) * 0.3; }
                        }

                        d.drugs.xform(i, x, y, z, 0, 0, 0, sc, sc, sc);
                        d.ves.hide(i);

                        return;
                    }

                    if (p.st === 1) {

                        // carried in a vesicle through the cell
                        const u = Math.min(1, p.t / 2.2);
                        const px = p.rx;

                        x = px; y = 0.5 + u * 2.4; z = p.z * 0.6;
                        d.drugs.xform(i, x, y, z, 0, 0, 0, sc * 0.9, sc * 0.9, sc * 0.9);
                        d.ves.set(i, x, y, z, 1.0);

                        if (u >= 1 && !p.done) { p.done = true; d.got++; }
                        if (u >= 1) { p.st = 4; p.t = 0; p.y = y; p.x = x; }

                        return;
                    }

                    if (p.st === 2) {

                        // squeezing between cells
                        const u = Math.min(1, p.t / 1.4);

                        x = p.x * (1 - u) + 0.0; y = 0.6 + u * 2.4; z = p.z * 0.5;
                        d.drugs.xform(i, x, y, z, 0, 0, 0, sc, sc, sc);
                        d.ves.hide(i);

                        if (u >= 1 && !p.done) { p.done = true; d.got++; }
                        if (u >= 1) { p.st = 4; p.t = 0; p.y = y; p.x = x; }

                        return;
                    }

                    if (p.st === 3) {

                        // a smaller, fat-soluble drug diffuses straight through the cell
                        const u = Math.min(1, p.t / 1.2);

                        y = 0.5 + u * 2.6;
                        d.drugs.xform(i, p.x, y, p.z, 0, 0, 0, sc, sc, sc);
                        d.ves.hide(i);

                        if (u >= 1 && !p.done) { p.done = true; d.got++; }
                        if (u >= 1) { p.st = 4; p.t = 0; p.y = y; }

                        return;
                    }

                    // arrived: drift around on the brain side
                    d.drugs.xform(i, p.x + Math.sin(t * 1.3 + i) * 0.2, 3.1 + Math.sin(t * 1.1 + i * 2) * 0.25, p.z + Math.cos(t + i) * 0.1, 0, 0, 0, sc, sc, sc);
                    d.ves.hide(i);
                });

                for (let i = d.list.length; i < d.ND; i++) { d.drugs.hide(i); d.ves.hide(i); }

                d.drugs.flush();
                d.ves.flush();
            }
        });

        // ================================================================
        // UNIT 9: THE ORGAN-ON-A-CHIP
        // ================================================================
        D("bbb-3d-chip", {

            title: "Explore in 3D: an organ-on-a-chip",
            intro: "Click the parts of the chip, then change the flow rate and open the cutaway.",
            stats: [["Flow", "q"], ["Shear stress on the cells", "tau"], ["Cells on the membrane", "cells"]],
            defaults: { flow: 40, cells: "endo", cut: 55 },
            controls: [
                { seg: "cells", label: "Cells", options: [["none", "Empty chip"], ["endo", "Endothelial cells on top"], ["both", "Plus astrocytes below"]] },
                { slider: "flow", label: "Flow rate (relative)", min: 0, max: 100, step: 5, fmt: function (v) { return v + " %"; } },
                { slider: "cut", label: "Cutaway: remove the front of the chip", min: 0, max: 100, step: 1, fmt: function (v) { return v + " %"; } },
                { views: ["three", "front", "top"] }
            ],
            formula: "An organ-on-a-chip is a small device, often about the size of a microscope slide, with tiny channels that hold living human cells while fluid flows through them. For a barrier, one channel stands for the blood side and one for the brain side, with a thin porous membrane between them. Flow adds the fluid forces cells feel in a vessel (shear stress), and a barrier is exactly a thin layer between two fluids, so two microchannels and a membrane fit it well. A chip is not a tiny brain: it reproduces selected features so they can be studied and measured. (Schematic; flow is exaggerated.)",
            stage: { target: [0, 1.4, 0], halfWidth: 5.4, halfHeight: 2.6, views: { three: [0.55, 1.1], front: [0, 1.45], top: [0, 0.35] }, home: "three", sway: [0.4, 0.28] },
            info: {
                pdms: "The chip body: a clear polymer (often PDMS) or plastic block that holds the channels. It is transparent so cells can be watched under a microscope.",
                top: "The upper channel: the blood side. Fluid carrying nutrients or a test drug flows through it.",
                bottom: "The lower channel: the brain side.",
                memb: "The porous membrane between the channels. Cells grow on it, and molecules can cross through its tiny pores, but cells stay put.",
                endo: "A layer of brain endothelial cells growing on the membrane: they form the barrier itself.",
                astro: "Astrocytes on the brain side: they send signals that tighten the barrier.",
                tube: "Tubing: fluid enters and leaves through these ports, driven by a pump."
            },
            read: function (c) {

                const f = c.state.flow;

                return {
                    q: f === 0 ? "Stopped" : f + " % of maximum",
                    tau: f === 0 ? "None" : (f * 0.03).toFixed(1) + " dyn/cm² (relative)",
                    cells: c.state.cells === "none" ? "None" : c.state.cells === "endo" ? "Endothelial cells" : "Endothelial cells and astrocytes",
                    verdict: f === 0 ? "No flow: the cells feel no shear stress, as in a static dish" : "Flow gives the cells the fluid forces they feel in a real vessel"
                };
            },
            reward: { when: function (c) { return c.count() >= 4 && c.data.flowMoved; }, msg: "You explored the chip" },
            onChange: function (c, keys) { if (keys.indexOf("flow") >= 0) { c.data.flowMoved = true; } c.data.apply(); },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const rand = mulberry(90);
                const NP = 90;

                d.flowMoved = false;
                s.scene.add(g);
                s.shadow(g, 10, 5);

                // body clipped by the cut plane
                const pm = s.glass(0xaab8f0, 0.2, true);
                const body = s.box(8.2, 1.9, 3.0, pm, 0, 1.0, 0);

                s.part(g, "pdms", body, [pm], true);

                const ed = new T.LineSegments(new T.EdgesGeometry(body.geometry), new T.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.5, clippingPlanes: [s.plane] }));

                ed.position.copy(body.position);
                g.add(ed);

                // the channels
                const chM = new T.MeshStandardMaterial({ color: 0xff7a7a, transparent: true, opacity: 0.22, roughness: 0.2, depthWrite: false });
                const chM2 = new T.MeshStandardMaterial({ color: 0xb09cff, transparent: true, opacity: 0.22, roughness: 0.2, depthWrite: false });

                s.part(g, "top", s.box(7.0, 0.5, 1.1, chM, 0, 1.5, 0), [chM]);
                s.part(g, "bottom", s.box(7.0, 0.5, 1.1, chM2, 0, 0.55, 0), [chM2]);

                // the porous membrane with its holes
                const mm = new T.MeshStandardMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.8, roughness: 0.5 });
                const memb = s.box(7.0, 0.05, 1.1, mm, 0, 1.02, 0);

                s.part(g, "memb", memb, [mm]);

                const holeM = new T.MeshBasicMaterial({ color: 0x20243a });
                const holes = s.inst(160, new T.CylinderGeometry(0.035, 0.035, 0.06, 8), holeM);

                for (let i = 0; i < 160; i++) { holes.set(i, -3.3 + (i % 40) * 0.165, 1.02, -0.4 + Math.floor(i / 40) * 0.27); }

                holes.flush();
                g.add(holes.mesh);

                // cells on top of the membrane, and astrocytes below
                const tm = s.glass(0xffb8c8, 0.65, false);
                const endo = [];

                for (let i = 0; i < 14; i++) {

                    for (let k = 0; k < 3; k++) { endo.push(s.box(0.46, 0.06, 0.32, tm, -3.2 + i * 0.5, 1.07, -0.35 + k * 0.35)); }
                }

                d.endo = endo;
                s.part(g, "endo", endo, [tm]);

                const am = s.mat(0x9b7bff, { roughness: 0.5 });
                const astro = [];

                for (let i = 0; i < 6; i++) {

                    const x = -2.6 + i * 1.05;
                    const grp = [];

                    grp.push(s.sph(0.15, am, x, 0.4, (i % 2 ? 0.2 : -0.2), 12));

                    for (let k = 0; k < 5; k++) {

                        const a = k / 5 * Math.PI * 2;

                        grp.push(s.tube([[x, 0.4, (i % 2 ? 0.2 : -0.2)], [x + Math.cos(a) * 0.15, 0.58, (i % 2 ? 0.2 : -0.2) + Math.sin(a) * 0.15], [x + Math.cos(a) * 0.28, 0.9, (i % 2 ? 0.2 : -0.2) + Math.sin(a) * 0.28]], 0.02, am, 8));
                    }

                    grp.forEach(function (m) { g.add(m); astro.push(m); });
                }

                d.astro = astro;
                s.part(g, "astro", astro, [am]);

                // tubing at both ends
                const tubM = s.mat(0xc2c6d2, { metalness: 0.2, roughness: 0.4 });
                const tubes = [];

                [[-4.1, 1.5], [4.1, 1.5], [-4.1, 0.55], [4.1, 0.55]].forEach(function (p) {

                    const t1 = s.cyl(0.12, 0.12, 0.9, tubM, p[0] + (p[0] < 0 ? -0.4 : 0.4), p[1], 0, 14);

                    t1.rotation.z = Math.PI / 2;
                    tubes.push(t1);
                });

                s.part(g, "tube", tubes, [tubM]);

                // fluid particles
                const fM = new T.MeshStandardMaterial({ color: 0xff8a8a, roughness: 0.3 });
                const fb = s.inst(NP, new T.SphereGeometry(0.05, 8, 6), fM);
                const fM2 = new T.MeshStandardMaterial({ color: 0xb8a4ff, roughness: 0.3 });
                const fb2 = s.inst(NP, new T.SphereGeometry(0.05, 8, 6), fM2);

                g.add(fb.mesh);
                g.add(fb2.mesh);

                d.fb = fb; d.fb2 = fb2; d.pos = [];

                for (let i = 0; i < NP; i++) { d.pos.push({ x: -3.8 + rand() * 7.6, z: (rand() - 0.5) * 0.8, y: rand() * 0.3, v: 0.6 + rand() * 0.5 }); }

                d.NP = NP;

                d.apply = function () {

                    d.endo.forEach(function (m) { m.visible = c.state.cells !== "none"; });
                    d.astro.forEach(function (m) { m.visible = c.state.cells === "both"; });
                    s.plane.constant = 1.55 - c.state.cut / 100 * 1.55;
                };

                d.apply();

                const l1 = s.label("Blood side (top channel)");

                l1.at = function () { return [-2.0, 2.0, 1.65]; };

                const l2 = s.label("Brain side (bottom channel)");

                l2.at = function () { return [2.0, 0.1, 1.65]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const sp = c.state.flow / 100 * 3.0;

                for (let i = 0; i < d.NP; i++) {

                    const p = d.pos[i];

                    p.x += p.v * sp * dt;

                    if (p.x > 3.8) { p.x = -3.8; }

                    d.fb.set(i, p.x, 1.4 + p.y * 0.6 + Math.sin(t + i) * 0.02, p.z);
                    d.fb2.set(i, p.x, 0.55 + p.y * 0.5, p.z * 0.9);
                }

                d.fb.flush();
                d.fb2.flush();
            }
        });

        // ================================================================
        // UNIT 14: CELLS FOR THE CHIP
        // ================================================================
        D("bbb-3d-cells", {

            title: "Explore in 3D: growing a tight barrier",
            intro: "Let the cells mature, add the supporting cast, and watch the barrier tighten and the tracer leak shrink.",
            stats: [["TEER", "teer"], ["Tracer leaking through", "leak"], ["Junction proteins", "jun"]],
            defaults: { days: 0, cast: "none" },
            controls: [
                { seg: "cast", label: "Supporting cast", options: [["none", "Endothelial cells alone"], ["astro", "+ Astrocytes"], ["both", "+ Astrocytes and pericytes"]] },
                { slider: "days", label: "Time in culture (days)", min: 0, max: 100, step: 1, fmt: function (v) { return Math.round(v / 10) + " days"; } },
                { actions: [["tracer", "🧪 Add tracer on top"]], label: "Test" },
                { views: ["three", "front", "top"] }
            ],
            formula: "Cells are tested with two measures that should agree: TEER (how well ions are blocked, in Ω·cm²) and the leak of a tracer such as sodium fluorescein (a tight barrier gives a low permeability). Astrocytes send signals that tighten the barrier and keep it mature, and pericytes add stability and signals along the vessel wall. More cell types make a richer model and a harder experiment. Stain for claudin-5, ZO-1 and GLUT1 to prove the cells are what you think. (Numbers are illustrative.)",
            stage: { target: [0, 1.0, 0], halfWidth: 4.6, halfHeight: 2.9, views: { three: [0.55, 1.1], front: [0, 1.4], top: [0, 0.35] }, home: "three", sway: [0.4, 0.28] },
            info: {
                endo: "A brain endothelial cell grown on the membrane. As the culture matures it makes more junction proteins and seals to its neighbors.",
                junc: "Tight junctions (claudin-5, ZO-1): the stitches between cells. They grow over time and with help from the supporting cells.",
                astro: "An astrocyte below the membrane: it sends signals that tighten the barrier and keep it mature.",
                peri: "A pericyte: it adds stability and signals along the wall.",
                memb: "The porous membrane the cells grow on.",
                tracer: "Tracer molecules (sodium fluorescein, for example) added on top. Counting how many reach the bottom measures the barrier's leak.",
                glut: "GLUT1: a marker that the cells are behaving like brain endothelium."
            },
            read: function (c) {

                const d = c.data;

                if (d.tight === undefined) { return {}; }

                const teer = Math.round(30 + d.tight * 1200);

                return {
                    teer: teer + " Ω·cm²",
                    leak: Math.round((1 - d.tight) * 100) + " % of the maximum",
                    jun: d.tight < 0.2 ? "Few" : d.tight < 0.6 ? "Forming" : "Dense",
                    verdict: d.tight < 0.2 ? "Young cells: a leaky layer with gaps between the cells" : d.tight < 0.6 ? "The seal is forming: TEER is rising and the leak is falling" : "A tight barrier: high TEER and low tracer leak"
                };
            },
            reward: { when: function (c) { return c.data.tight > 0.8 && c.state.cast === "both" && c.data.tests >= 1; }, msg: "You grew a tight barrier" },
            act: function (c, id) { if (id === "tracer") { c.data.tests++; c.data.drop(); } },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;
                const g = new T.Group();
                const rand = mulberry(33);
                const NT = 70;
                const NC = 6;

                d.tight = 0; d.tests = 0;
                s.scene.add(g);
                s.shadow(g, 9, 5);

                // the insert: a clear well with a porous bottom
                const wm = s.glass(0xaab8f0, 0.14, false);
                const well = s.box(5.6, 3.0, 3.4, wm, 0, 1.6, 0);

                s.part(g, "memb", well, [wm], true);

                const ed = new T.LineSegments(new T.EdgesGeometry(well.geometry), new T.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.4 }));

                ed.position.copy(well.position);
                g.add(ed);

                const mm = new T.MeshStandardMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.3, roughness: 0.5, depthWrite: false });

                s.part(g, "memb", s.box(5.4, 0.06, 3.2, mm, 0, 1.5, 0), [mm]);

                // endothelial cells: a grid of tiles with gaps that close
                const tm = s.glass(0xffb8c8, 0.5, false);
                const tiles = [];
                const jm = new T.MeshStandardMaterial({ color: 0xff5aa0, emissive: 0x3a0820, roughness: 0.35 });
                const jI = s.inst(NC * 8 * 2, new T.BoxGeometry(1, 0.05, 0.05), jm);

                for (let i = 0; i < NC; i++) {

                    for (let k = 0; k < 5; k++) { tiles.push({ m: s.box(0.85, 0.08, 0.6, tm, 0, 1.56, 0), x: -2.1 + i * 0.84, z: -1.2 + k * 0.6 }); }
                }

                tiles.forEach(function (t0) { g.add(t0.m); });
                d.tiles = tiles;
                s.part(g, "endo", tiles.map(function (t0) { return t0.m; }), [tm]);
                s.part(g, "junc", jI.mesh, [jm]);
                d.jI = jI;

                // astrocytes and pericytes below
                const am = s.mat(0x9b7bff, { roughness: 0.5 });
                const ast = [];

                for (let i = 0; i < 5; i++) {

                    const x = -2.0 + i * 1.0;
                    const z = (i % 2 ? 0.6 : -0.6);

                    ast.push(s.sph(0.18, am, x, 0.9, z, 12));

                    for (let k = 0; k < 6; k++) {

                        const a = k / 6 * Math.PI * 2;

                        ast.push(s.tube([[x, 0.9, z], [x + Math.cos(a) * 0.18, 1.1, z + Math.sin(a) * 0.18], [x + Math.cos(a) * 0.34, 1.4, z + Math.sin(a) * 0.34]], 0.022, am, 8));
                    }
                }

                ast.forEach(function (m) { g.add(m); });
                d.ast = ast;
                s.part(g, "astro", ast, [am]);

                const pmM = s.mat(0xffa86a, { roughness: 0.5 });
                const pc = [];

                for (let i = 0; i < 4; i++) { const p = s.sph(0.22, pmM, -1.5 + i * 1.0, 1.3, i % 2 ? -0.9 : 0.9, 14); p.scale.set(1.6, 0.6, 1); pc.push(p); g.add(p); }

                d.pc = pc;
                s.part(g, "peri", pc, [pmM]);

                // tracer molecules
                const trM = new T.MeshStandardMaterial({ color: 0x7cff9a, emissive: 0x1c6a30, roughness: 0.3 });
                const tr = s.inst(NT, new T.SphereGeometry(0.06, 10, 8), trM);

                s.part(g, "tracer", tr.mesh, [trM]);
                d.tr = tr; d.NT = NT; d.rand = rand; d.list = [];

                d.drop = function () {

                    d.list = [];

                    for (let i = 0; i < NT; i++) { d.list.push({ x: -2.3 + rand() * 4.6, y: 3.3 + rand() * 0.4, z: -1.3 + rand() * 2.6, st: 0, gap: rand(), t: -rand() * 2.2 }); }
                };

                const l1 = s.label("Top: blood side");

                l1.at = function () { return [-2.2, 3.4, 1.7]; };

                const l2 = s.label("Bottom: brain side");

                l2.at = function () { return [-2.2, 0.15, 1.7]; };
            },
            frame: function (c, dt, t) {

                const d = c.data;
                const base = c.state.days / 100;
                const ceil = c.state.cast === "none" ? 0.55 : c.state.cast === "astro" ? 0.85 : 1.0;
                const target = Math.min(ceil, base * ceil * 1.15);

                d.tight += (target - d.tight) * Math.min(1, dt * 2);

                d.ast.forEach(function (m) { m.visible = c.state.cast !== "none"; });
                d.pc.forEach(function (m) { m.visible = c.state.cast === "both"; });

                // tiles close the gaps as the barrier tightens
                d.tiles.forEach(function (t0) {

                    const sc = 0.55 + 0.45 * d.tight;

                    t0.m.position.set(t0.x, 1.56, t0.z);
                    t0.m.scale.set(sc, 1, sc);
                });

                // junction bars appear along the tile edges
                let n = 0;

                d.tiles.forEach(function (t0, i) {

                    const k = clamp((d.tight - 0.1) / 0.8, 0, 1);

                    if (n + 1 < d.jI.n) {

                        d.jI.xform(n++, t0.x, 1.6, t0.z + 0.3, 0, 0, 0, 0.84 * k + 0.0001, 1, 1);
                        d.jI.xform(n++, t0.x + 0.42, 1.6, t0.z, 0, Math.PI / 2, 0, 0.58 * k + 0.0001, 1, 1);
                    }
                });

                for (let i = n; i < d.jI.n; i++) { d.jI.hide(i); }

                d.jI.flush();

                // tracer falls through gaps; the tighter the barrier, the fewer get through
                d.list.forEach(function (p, i) {

                    p.t += dt;

                    if (p.t < 0) { d.tr.hide(i); return; }

                    let y = p.y;

                    if (p.st === 0) {

                        y = p.y - p.t * 1.2;

                        if (y < 1.65) {

                            p.st = p.gap > d.tight ? 1 : 2;
                            p.t = 0;
                            p.y0 = 1.65;
                        }

                        d.tr.set(i, p.x, y, p.z);

                    } else if (p.st === 1) {

                        y = 1.65 - p.t * 1.0;

                        if (y < 0.3) { d.tr.hide(i); return; }

                        d.tr.set(i, p.x, y, p.z);

                    } else {

                        // turned away: bounces and floats back up
                        y = 1.65 + Math.abs(Math.sin(p.t * 3)) * 0.4 - p.t * 0.0;
                        d.tr.set(i, p.x + Math.sin(p.t * 2) * 0.1, y + p.t * 0.6, p.z, p.t < 1.6 ? 1 : 0.0001);
                    }
                });

                for (let i = d.list.length; i < d.NT; i++) { d.tr.hide(i); }

                d.tr.flush();
            }
        });

        document.querySelectorAll('.fd-sim[data-sim^="bbb-3d-"]').forEach(F.mount);
    }

})();
