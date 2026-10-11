/* ========================================
   SUPERCAPACITORS: 3D SCENES, PART 1

   Unit 5:  the three kinds of supercapacitor (EDLC, pseudocapacitor, hybrid).
   Unit 9:  what makes a good electrode (grain size, binder, additive, thickness).
   Unit 13: macro form factors (jelly roll, coin cell, pouch).

   Built on diagram-sims-3d-core.js and the local three.js.
   Teaching models: sizes, speeds and scores are illustrative.
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
        const seg = M.seg;
        const wire = M.wire;
        const head = M.head;
        const setVal = M.setVal;
        const out = M.out;
        const stat = M.stat;
        const SIMS = F.SIMS;
        const slider = F.slider;

        // ----------------------------------------------------------------
        // Shared helpers
        // ----------------------------------------------------------------
        function btn(label, attr) { return '<button type="button" class="fd-sim-btn" ' + attr + ">" + label + "</button>"; }

        // a pair of stacked electron dots flowing along an arch wire over a cell
        function addWire(s, g, x0, x1, top) {

            const T = s.T;
            const curve = new T.CatmullRomCurve3([
                new T.Vector3(x0, top, 0), new T.Vector3(x0, top + 0.5, 0), new T.Vector3(x0 + 0.5, top + 0.85, 0),
                new T.Vector3(x1 - 0.5, top + 0.85, 0), new T.Vector3(x1, top + 0.5, 0), new T.Vector3(x1, top, 0)
            ]);
            const wm = s.mat(0xd9b45a, { metalness: 0.7, roughness: 0.3 });
            const tube = new T.Mesh(new T.TubeGeometry(curve, 36, 0.04, 8), wm);
            const em = new T.InstancedMesh(new T.SphereGeometry(0.065, 8, 6), new T.MeshStandardMaterial({ color: 0x54e0c7, emissive: 0x1b7a68 }), 12);

            g.add(em);

            return { curve: curve, tube: tube, mat: wm, elec: em };
        }

        function flowElectrons(w, m4, t, moving, charging, rate) {

            for (let i = 0; i < 12; i++) {

                let u = (i / 12 + t * rate) % 1;

                if (charging) { u = 1 - u; }

                const p = w.curve.getPoint(u);
                const sc = moving ? 1 : 0.0001;

                m4.makeScale(sc, sc, sc);
                m4.setPosition(p.x, p.y, p.z);
                w.elec.setMatrixAt(i, m4);
            }

            w.elec.instanceMatrix.needsUpdate = true;
        }

        function terminalPair(s, g, x0, x1, y) {

            const T = s.T;
            const a = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.38, 18), s.mat(0x6aa5ff, { metalness: 0.6, roughness: 0.3 }));
            const b = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.38, 18), s.mat(0xff6f7e, { metalness: 0.6, roughness: 0.3 }));

            a.position.set(x0, y, 0);
            b.position.set(x1, y, 0);

            return [a, b];
        }

        // ================================================================
        // UNIT 5: THREE KINDS OF SUPERCAPACITOR
        // ================================================================
        const KINDS = {
            edlc: {
                name: "EDLC (double-layer)",
                neg: "carbon", pos: "carbon",
                mech: "Electrostatic: ions line up on the surface", cap: "Baseline", life: "Longest", power: "Highest",
                electrode: "Porous carbon. Charge is stored only by ions sticking to the surface as an electric double layer. Nothing reacts and nothing changes inside the carbon, so it is fast, gentle on the material, and lasts for a very long time.",
                ions: "The ions just move and line up on the carbon surface. Discharging lets them drift back into the liquid."
            },
            pseudo: {
                name: "Pseudocapacitor",
                neg: "redox", pos: "redox",
                mech: "Fast, reversible surface redox reactions", cap: "Higher", life: "Shorter", power: "High",
                electrode: "A metal oxide. Atoms at its surface really do change oxidation state as electrons move in or out (gold means charged). That stores more charge per area than a double layer, but the atoms are strained a little each cycle.",
                ions: "Ions still gather at the surface, but now each one pairs with a surface atom that gains or loses an electron: a fast chemical reaction confined to the surface."
            },
            hybrid: {
                name: "Hybrid",
                neg: "carbon", pos: "redox",
                mech: "Double layer on one electrode, redox on the other", cap: "Higher", life: "In between", power: "High",
                electrode: "One electrode is carbon (double layer) and the other is a redox material (surface reaction). The carbon side keeps the power and life, and the redox side adds capacitance and energy.",
                ions: "Ions line up on the carbon side and react at the surface atoms on the other side, so a hybrid blends both mechanisms in one device."
            }
        };

        function buildKindCell(s, kind, x0) {

            const T = s.T;
            const g = new T.Group();
            const rand = mulberry(kind.length * 13 + 5);
            const K = KINDS[kind];
            const parts = {};
            const dev = { kind: kind, group: g, K: K, m4: new T.Matrix4() };

            g.position.x = x0;
            s.shadow(g, 3.4, 2.6);

            // case
            const caseMat = s.glass(0x9fb8f0, 0.16);
            const cs = new T.Mesh(new T.BoxGeometry(2.3, 2.7, 1.6), caseMat);

            cs.position.set(0, 1.35, 0);
            parts.case = s.part(g, kind + ":case", cs, [caseMat], true);

            const ed = new T.LineSegments(new T.EdgesGeometry(cs.geometry), new T.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.5, clippingPlanes: [s.plane] }));

            ed.position.copy(cs.position);
            g.add(ed);

            const metal = s.mat(0xc2c6d2, { metalness: 0.75, roughness: 0.28 });
            const metal2 = s.mat(0xd8dae2, { metalness: 0.75, roughness: 0.28 });

            s.part(g, kind + ":coll", [s.box(0.05, 2.3, 1.3, metal, -0.98, 1.35, 0), s.box(0.05, 2.3, 1.3, metal2, 0.98, 1.35, 0)], [metal, metal2]);

            // electrodes
            function electrode(type, sign) {

                const x0e = sign < 0 ? -0.92 : 0.42;
                const geo = [];
                const mats = [];
                let sites = [];
                const meshes = [];

                if (type === "carbon") {

                    const mat = s.mat(0x2d3344, { metalness: 0.2, roughness: 0.65 });
                    const im = new T.InstancedMesh(new T.SphereGeometry(0.085, 8, 6), mat, 380);
                    const m4 = new T.Matrix4();

                    for (let i = 0; i < 380; i++) {

                        m4.makeTranslation(x0e + rand() * 0.5, 0.35 + rand() * 2.0, (rand() - 0.5) * 1.1);
                        im.setMatrixAt(i, m4);
                    }

                    meshes.push(im);
                    mats.push(mat);

                    return { meshes: meshes, mats: mats, atoms: null, type: type, mat: mat };
                }

                // redox lattice: a small crystal of atoms, the outer layer reacts
                const atomMat = s.mat(0xffffff, { metalness: 0.3, roughness: 0.35 });
                const nx = 3;
                const ny = 9;
                const nz = 5;
                const im = new T.InstancedMesh(new T.SphereGeometry(0.1, 12, 10), atomMat, nx * ny * nz);
                const m4 = new T.Matrix4();
                const surface = [];
                let n = 0;

                for (let a = 0; a < nx; a++) {

                    for (let b = 0; b < ny; b++) {

                        for (let c = 0; c < nz; c++) {

                            const x = x0e + 0.08 + a * 0.2;
                            const y = 0.45 + b * 0.22;
                            const z = (c - (nz - 1) / 2) * 0.24;

                            m4.makeTranslation(x, y, z);
                            im.setMatrixAt(n, m4);
                            im.setColorAt(n, new T.Color(0x7f93c9));

                            const faceA = sign < 0 ? nx - 1 : 0;

                            if (a === faceA) { surface.push({ i: n, x: x, y: y, z: z }); }

                            n++;
                        }
                    }
                }

                // thin lattice rods between neighbouring atoms
                const rods = new T.LineSegments(new T.BufferGeometry(), new T.LineBasicMaterial({ color: 0x9fb1e0, transparent: true, opacity: 0.35 }));
                const pts = [];

                for (let a = 0; a < nx; a++) {
                    for (let b = 0; b < ny; b++) {
                        for (let c = 0; c < nz; c++) {

                            const p = [x0e + 0.08 + a * 0.2, 0.45 + b * 0.22, (c - 2) * 0.24];

                            if (a + 1 < nx) { pts.push(p[0], p[1], p[2], p[0] + 0.2, p[1], p[2]); }
                            if (b + 1 < ny) { pts.push(p[0], p[1], p[2], p[0], p[1] + 0.22, p[2]); }
                            if (c + 1 < nz) { pts.push(p[0], p[1], p[2], p[0], p[1], p[2] + 0.24); }
                        }
                    }
                }

                rods.geometry.setAttribute("position", new T.Float32BufferAttribute(pts, 3));

                return { meshes: [im], extra: rods, mats: [atomMat], atoms: im, surface: surface, type: type, mat: atomMat, x0: x0e };
            }

            dev.neg = electrode(K.neg, -1);
            dev.pos = electrode(K.pos, 1);

            dev.neg.part = s.part(g, kind + ":neg", dev.neg.meshes, dev.neg.mats);
            dev.pos.part = s.part(g, kind + ":pos", dev.pos.meshes, dev.pos.mats);

            if (dev.neg.extra) { g.add(dev.neg.extra); }
            if (dev.pos.extra) { g.add(dev.pos.extra); }

            const sepMat = new T.MeshStandardMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.5, roughness: 0.6 });

            s.part(g, kind + ":sep", s.box(0.04, 2.3, 1.3, sepMat, 0, 1.35, 0), [sepMat]);

            // ions: attached sites differ by electrode type
            const N = 36;
            const ionMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, emissive: 0x222233 });
            const ions = new T.InstancedMesh(new T.SphereGeometry(0.068, 12, 10), ionMat, N * 2);

            dev.N = N;
            dev.free = [];
            dev.site = [];

            for (let i = 0; i < N * 2; i++) {

                const cation = i < N;
                const j = cation ? i : i - N;
                let site;

                if (cation) {

                    const sd = dev.neg;

                    if (sd.surface) {

                        const a = sd.surface[(j * 7) % sd.surface.length];

                        site = [a.x + 0.17, a.y, a.z];

                    } else {

                        site = [-0.37 - rand() * 0.04, 0.5 + (j % 9 + rand() * 0.6) * (1.9 / 9), -0.5 + (Math.floor(j / 9) + rand() * 0.6) * (1.0 / 4)];
                    }

                } else {

                    const sd = dev.pos;

                    if (sd.surface) {

                        const a = sd.surface[(j * 7) % sd.surface.length];

                        site = [a.x - 0.17, a.y, a.z];

                    } else {

                        site = [0.37 + rand() * 0.04, 0.5 + (j % 9 + rand() * 0.6) * (1.9 / 9), -0.5 + (Math.floor(j / 9) + rand() * 0.6) * (1.0 / 4)];
                    }
                }

                dev.free.push([(rand() - 0.5) * 0.55, 0.4 + rand() * 1.95, (rand() - 0.5) * 1.0]);
                dev.site.push(site);
                ions.setColorAt(i, new T.Color(cation ? 0xffb04a : 0x5fb1ff));
            }

            dev.ions = ions;
            dev.ionsPart = s.part(g, kind + ":ions", ions);

            terminalPair(s, g, -0.98, 0.98, 2.88).forEach(function (m, i) { s.part(g, kind + (i ? ":termP" : ":termN"), m); });
            dev.wire = addWire(s, g, -0.98, 0.98, 3.07);
            s.part(g, kind + ":wire", dev.wire.tube, [dev.wire.mat]);
            dev.caseEdges = ed;

            return dev;
        }

        SIMS["supercap-3d-kinds"] = function (root) {

            const defaults = { cut: 0 };
            const state = { cut: 0 };
            const seen = {};
            let mode = "idle";
            let q = 0;
            let cur = "edlc";
            let hit = false;
            let fullSeen = false;
            let S = null;
            const devs = {};

            root.innerHTML =
                head("Explore in 3D: three kinds of supercapacitor") +
                F.three.stageHTML() +
                '<div class="fd-stat-row">' + stat("Selected", "name") + stat("How it stores charge", "mech") + stat("Capacitance", "cap") + stat("Cycle life", "life") + "</div>" +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
                '<p class="fd-sim-note" data-out="info" style="min-height:4.2em">Click any part of any cell to see what it is and what it does.</p>' +
                '<div class="fd-seg"><span class="fd-seg-label">Reactions</span>' + btn("⚡ Charge all", 'data-act="charge"') + btn("🔋 Discharge all", 'data-act="discharge"') + btn("⏸ Hold", 'data-act="hold"') + "</div>" +
                '<div class="fd-seg"><span class="fd-seg-label">View</span>' + btn("3/4 view", 'data-view="three"') + btn("Front (cross-section)", 'data-view="front"') + btn("Top", 'data-view="top"') + "</div>" +
                '<div class="fd-sim-controls">' + slider({ label: "Cutaway: remove the front of the cases", key: "cut", min: 0, max: 100, step: 1, value: 0 }) + "</div>" +
                '<p class="fd-sim-formula">An EDLC stores charge only by lining up ions at a surface. A pseudocapacitor adds fast, reversible reactions at the surface (the gold atoms). A hybrid uses one of each. All three are surface processes, which is why they are fast and long-lived compared with a battery. (Shapes and speeds are illustrative.)</p>';

            function update() {

                const K = KINDS[cur];

                setVal(root, "cut", state.cut + " %");
                out(root, "name", K.name);
                out(root, "mech", K.mech);
                out(root, "cap", K.cap);
                out(root, "life", K.life);
                out(root, "verdict", mode === "charge" ? "Charging: ions line up and, where there is a redox electrode, surface atoms turn gold" : mode === "discharge" ? "Discharging: everything relaxes back" : "Press Charge and compare how each cell stores its charge");

                if (!hit && fullSeen && Object.keys(seen).length >= 4) {

                    hit = true;
                    F.reward("supercap-3d-kinds", 10, "You compared the three kinds in 3D");
                }
            }

            function describe(part) {

                if (!part) { return; }

                const k = part.key.split(":");
                const K = KINDS[k[0]];

                cur = k[0];
                seen[part.key] = true;

                const txt = {
                    case: "The sealed package that holds the electrolyte and electrodes.",
                    coll: "Metal foils that carry electrons between the electrodes and the outside circuit.",
                    neg: K.neg === "carbon" ? "Negative electrode, porous carbon. " + KINDS.edlc.electrode : "Negative electrode, redox material. " + KINDS.pseudo.electrode,
                    pos: K.pos === "carbon" ? "Positive electrode, porous carbon. " + KINDS.edlc.electrode : "Positive electrode, redox material. " + KINDS.pseudo.electrode,
                    sep: "A thin porous membrane that lets ions through but keeps the electrodes from touching.",
                    ions: K.ions,
                    termN: "Negative terminal.",
                    termP: "Positive terminal.",
                    wire: "The outside circuit. The teal dots are electrons going to or from the electrodes."
                }[k[1]];

                out(root, "info", K.name + ": " + txt);
                update();
            }

            function place(dt, t) {

                const rate = 1 / 3.2;

                if (mode === "charge") { q = Math.min(1, q + rate * dt); }
                if (mode === "discharge") { q = Math.max(0, q - rate * dt); }
                if (q >= 0.999) { fullSeen = true; }

                Object.keys(devs).forEach(function (k) {

                    const d = devs[k];
                    const m4 = d.m4;
                    const N = d.N;

                    for (let i = 0; i < N * 2; i++) {

                        const j = i < N ? i : i - N;
                        const sv = clamp(q * 1.4 - (j / N) * 0.4, 0, 1);
                        const e = sv * sv * (3 - 2 * sv);
                        const f = d.free[i];
                        const st = d.site[i];
                        const jit = (1 - e) * 0.025;

                        m4.makeTranslation(f[0] + (st[0] - f[0]) * e + Math.sin(t * 2 + i) * jit, f[1] + (st[1] - f[1]) * e + Math.cos(t * 1.7 + i * 1.3) * jit, f[2] + (st[2] - f[2]) * e + Math.sin(t * 1.9 + i * 0.7) * jit);
                        d.ions.setMatrixAt(i, m4);
                    }

                    d.ions.instanceMatrix.needsUpdate = true;

                    // redox surfaces turn gold; carbon tints blue or red
                    [[d.neg, 0x3b6fd8], [d.pos, 0xd85a68]].forEach(function (pr) {

                        const e = pr[0];

                        if (e.type === "carbon") {

                            e.mat.color.copy(e.mat.userData.base).lerp(new S.T.Color(pr[1]), q * 0.55);

                        } else {

                            const gold = new S.T.Color(0xffc94a);
                            const base = new S.T.Color(0x7f93c9);
                            const col = new S.T.Color();

                            e.surface.forEach(function (a, n) {

                                const k2 = clamp(q * 1.3 - (n / e.surface.length) * 0.3, 0, 1);

                                col.copy(base).lerp(gold, k2);
                                e.atoms.setColorAt(a.i, col);
                            });

                            e.atoms.instanceColor.needsUpdate = true;
                        }
                    });

                    flowElectrons(d.wire, m4, t, mode !== "idle" && ((mode === "charge" && q < 0.999) || (mode === "discharge" && q > 0.001)), mode === "charge", 0.4);
                });

                update();
            }

            root.querySelectorAll("[data-act]").forEach(function (b) {

                b.addEventListener("click", function () { mode = b.dataset.act === "hold" ? "idle" : b.dataset.act; update(); });
            });

            root.querySelectorAll("[data-view]").forEach(function (b) {

                b.addEventListener("click", function () { if (S) { S.preset(b.dataset.view); } });
            });

            root.querySelector("[data-reset]").addEventListener("click", function () {

                mode = "idle";
                q = 0;
                cur = "edlc";

                if (S) { S.select(null); S.resetView(); }

                out(root, "info", "Click any part of any cell to see what it is and what it does.");
                update();
            });

            wire(root, state, defaults, function () { if (S) { S.plane.constant = 1.05 - state.cut / 100 * 1.05; } update(); });

            update();

            F.three.create(root, { target: [0, 2.0, 0], halfWidth: 6.9, views: { three: [0.28, 1.2], front: [0, 1.5], top: [0, 0.22] }, home: "three", sway: [0.28, 0.25], onPick: describe }).then(function (s) {

                S = s;

                ["edlc", "pseudo", "hybrid"].forEach(function (k, i) {

                    devs[k] = buildKindCell(s, k, (i - 1) * 4.1);
                    s.scene.add(devs[k].group);

                    const lab = s.label(KINDS[k].name);

                    lab.at = function () { return [(i - 1) * 4.1, 4.5, 0]; };
                });

                s.onFrame(place);
                s.start();

            }).catch(function () { });
        };

        // ================================================================
        // UNIT 9: WHAT MAKES A GOOD ELECTRODE
        // ================================================================
        const MATS = {
            carbon: { name: "Carbon", color: 0x2d3344, cond: 0.85, area: 0.85, stab: 0.95, mech: 0.8 },
            oxide: { name: "Metal oxide", color: 0x8a6ce8, cond: 0.3, area: 0.6, stab: 0.6, mech: 0.6 },
            polymer: { name: "Conducting polymer", color: 0x4fb27a, cond: 0.55, area: 0.55, stab: 0.4, mech: 0.45 }
        };

        SIMS["supercap-3d-electrode"] = function (root) {

            const defaults = { mat: "carbon", size: 30, bind: 6, add: 8, thick: 1.4 };
            const state = { mat: "carbon", size: 30, bind: 6, add: 8, thick: 1.4 };
            const seen = {};
            let S = null;
            let mode = "idle";
            let q = 0;
            let hit = false;
            let grainIM = null;
            let binderIM = null;
            let lines = null;
            let ions = null;
            let nGrains = 0;
            let order = [];
            const rand = mulberry(77);
            const cand = [];
            const free = [];
            const dirs = [];
            const m4tmp = [];
            const MAXG = 1600;
            const NIONS = 70;
            const NL = 200;
            const pairs = [];
            const sites = [];
            let siteDirty = true;

            for (let i = 0; i < MAXG; i++) { cand.push([rand(), rand(), rand()]); }

            for (let i = 0; i < NIONS; i++) { free.push([rand(), rand(), rand()]); dirs.push([rand(), rand(), rand()]); }

            for (let i = 0; i < NL; i++) { pairs.push([Math.floor(rand() * 400), Math.floor(rand() * 400)]); }

            root.innerHTML =
                head("Explore in 3D: build an electrode") +
                F.three.stageHTML() +
                '<div class="fd-stat-row">' + stat("Conductivity", "c") + stat("Surface area", "a") + stat("Stability", "s") + stat("Mechanical strength", "m") + stat("Ion access", "i") + "</div>" +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
                '<p class="fd-sim-note" data-out="info" style="min-height:4.2em">Click the grains, the binder, the additive, or the current collector. Then change the sliders and watch the five scores trade off.</p>' +
                seg("Active material", "mat", [["carbon", "Carbon"], ["oxide", "Metal oxide"], ["polymer", "Conducting polymer"]]) +
                '<div class="fd-seg"><span class="fd-seg-label">Reactions</span>' + btn("⚡ Charge", 'data-act="charge"') + btn("🔋 Discharge", 'data-act="discharge"') + btn("⏸ Hold", 'data-act="hold"') + "</div>" +
                '<div class="fd-seg"><span class="fd-seg-label">View</span>' + btn("3/4 view", 'data-view="three"') + btn("Front (cross-section)", 'data-view="front"') + btn("Top", 'data-view="top"') + "</div>" +
                '<div class="fd-sim-controls">' +
                slider({ label: "Grain size (nm): smaller grains mean more surface", key: "size", min: 5, max: 100, step: 1, value: 30 }) +
                slider({ label: "Binder (%): the glue, which also blocks the surface", key: "bind", min: 0, max: 20, step: 1, value: 6 }) +
                slider({ label: "Conductive additive (%): carbon-black pathways", key: "add", min: 0, max: 20, step: 1, value: 8 }) +
                slider({ label: "Film thickness (relative): thicker means longer ion paths", key: "thick", min: 0.8, max: 3, step: 0.1, value: 1.4 }) +
                "</div>" +
                '<p class="fd-sim-formula">No material maximizes all five goals: conductivity, surface area, stability, mechanical strength, and ion access. Smaller grains add surface but make weaker contacts and tighter pores; more binder holds the film together but covers surface; a thicker film holds more but slows the ions. Score out of 5 = the sum of the five bars. (Illustrative model.)</p>';

            function metrics() {

                const m = MATS[state.mat];
                const sz = state.size;
                const b = state.bind / 20;
                const ad = state.add;
                const cond = clamp(m.cond * (0.4 + 0.6 * Math.min(1, ad / 12)) * (1 - 0.45 * b) * (0.55 + 0.45 * clamp(sz / 40, 0, 1)) * 1.1, 0, 1);
                const area = clamp(m.area * clamp(12 / sz, 0, 1.2) * (1 - 0.7 * b) * 1.15, 0, 1);
                const stab = m.stab;
                const mech = clamp(m.mech * (0.3 + 0.7 * Math.min(1, state.bind / 10)) * (1 - 0.3 * (state.thick - 0.8) / 2.2) * 1.12, 0, 1);
                const access = clamp(Math.pow(clamp(0.4 * sz / 3, 0, 1), 0.7) * Math.exp(-(state.thick - 0.8) / 3.2) * (1 - 0.5 * b) * 1.1, 0, 1);

                return { cond: cond, area: area, stab: stab, mech: mech, access: access, total: cond + area + stab + mech + access };
            }

            function bar(v) {

                return Math.round(v * 100) + " %";
            }

            function update() {

                const k = metrics();

                setVal(root, "size", state.size + " nm");
                setVal(root, "bind", state.bind + " %");
                setVal(root, "add", state.add + " %");
                setVal(root, "thick", state.thick.toFixed(1) + "×");
                out(root, "c", bar(k.cond));
                out(root, "a", bar(k.area));
                out(root, "s", bar(k.stab));
                out(root, "m", bar(k.mech));
                out(root, "i", bar(k.access));

                const worst = ["cond", "area", "stab", "mech", "access"].sort(function (a, b2) { return k[a] - k[b2]; })[0];
                const names = { cond: "conductivity", area: "surface area", stab: "stability", mech: "mechanical strength", access: "ion access" };

                out(root, "verdict", "Score " + k.total.toFixed(1) + " out of 5: weakest is " + names[worst]);

                if (!hit && k.total >= 3.5 && Object.keys(seen).length >= 3 && q > 0.5) {

                    hit = true;
                    F.reward("supercap-3d-electrode", 10, "You built a balanced electrode");
                }
            }

            const INFO = {
                grains: "Active material grains. Each grain's surface is where ions park and charge is stored. Smaller grains give far more surface for the same amount of material, but touch each other less well and leave narrow pores.",
                binder: "Binder: a polymer glue (gold). It keeps the film from cracking and peeling, but it is an insulator that coats grains and blocks pores, which hides surface and adds resistance.",
                additive: "Conductive additive: carbon-black paths (teal) that link grains so electrons can get out. Without them, grains far from the current collector sit unused.",
                collector: "Current collector: a metal foil that carries electrons out of the film. Grains must connect to it, directly or through the additive, to be useful.",
                ions: "Ions in the electrolyte. Only the ones that can reach a free grain surface store charge. In a thick film or with blocked pores, the inner grains stay empty.",
                electrolyte: "The electrolyte fills the space between grains. Its ions need open, wide-enough pores to reach the surface."
            };

            function rebuild() {

                if (!S) { return; }

                const T = S.T;
                const m = MATS[state.mat];
                const r = 0.06 + (state.size - 5) / 95 * 0.17;
                const vol = state.thick * 2.8 * 2.0;
                const n = Math.min(MAXG, Math.max(60, Math.round(vol * 0.42 / (4 / 3 * Math.PI * r * r * r))));
                const m4 = new T.Matrix4();
                const sc = new T.Vector3(1, 1, 1);
                const q0 = new T.Quaternion();
                const pos = new T.Vector3();

                nGrains = n;
                grainIM.count = n;
                binderIM.count = n;
                grainIM.material.color.set(m.color);
                grainIM.material.userData.base.set(m.color);
                grainIM.geometry.dispose();
                grainIM.geometry = new T.SphereGeometry(1, 10, 8);
                binderIM.geometry.dispose();
                binderIM.geometry = new T.SphereGeometry(1, 10, 8);

                order = [];

                for (let i = 0; i < n; i++) {

                    const c = cand[i];
                    const x = -2.1 + c[0] * state.thick;
                    const y = 0.5 + c[1] * 2.8;
                    const z = (c[2] - 0.5) * 2.0;

                    pos.set(x, y, z);
                    sc.set(r, r, r);
                    m4.compose(pos, q0, sc);
                    grainIM.setMatrixAt(i, m4);

                    sc.set(r * 1.12, r * 1.12, r * 1.12);
                    m4.compose(pos, q0, sc);
                    binderIM.setMatrixAt(i, m4);
                    order.push({ i: i, x: x, y: y, z: z, r: r });
                }

                grainIM.instanceMatrix.needsUpdate = true;
                binderIM.instanceMatrix.needsUpdate = true;

                // binder shows on a share of grains, spread through the film
                const share = state.bind / 20;
                const shown = Math.round(n * share * 1.4);

                for (let i = 0; i < n; i++) {

                    const on = (i * 2654435761 % 1000) / 1000 < share * 1.4;

                    binderIM.getMatrixAt(i, m4);
                    m4.decompose(pos, q0, sc);
                    sc.multiplyScalar(on ? 1 : 0.0001);
                    m4.compose(pos, q0, sc);
                    binderIM.setMatrixAt(i, m4);
                }

                void shown;
                binderIM.instanceMatrix.needsUpdate = true;

                // additive pathways between grains
                const lp = [];

                for (let i = 0; i < NL; i++) {

                    const a = order[pairs[i][0] % n];
                    const b2 = order[pairs[i][1] % n];

                    lp.push(a.x, a.y, a.z, b2.x, b2.y, b2.z);
                }

                lines.geometry.setAttribute("position", new T.Float32BufferAttribute(lp, 3));
                lines.geometry.setDrawRange(0, Math.round(state.add / 20 * NL) * 2);

                // surface sites for ions: outer grains first, deeper ones only if ions can get in
                order.sort(function (a, b2) { return b2.x - a.x; });
                siteDirty = true;
                update();
            }

            function ionSites() {

                const k = metrics();
                const reach = Math.max(0.05, k.access);
                const usable = Math.max(1, Math.round(nGrains * reach));

                for (let i = 0; i < NIONS; i++) {

                    const g = order[Math.min(usable - 1, Math.floor(Math.pow(i / NIONS, 1.0) * usable))];
                    const d = dirs[i];
                    const nx = 0.35 + d[0] * 0.65;
                    const ny = (d[1] - 0.5) * 1.4;
                    const nz = (d[2] - 0.5) * 1.4;
                    const len = Math.hypot(nx, ny, nz);

                    sites[i] = [g.x + nx / len * (g.r + 0.06), g.y + ny / len * (g.r + 0.06), g.z + nz / len * (g.r + 0.06)];
                }

                siteDirty = false;
            }

            function frame(dt, t) {

                const rate = 1 / 2.5;

                if (mode === "charge") { q = Math.min(1, q + rate * dt); }
                if (mode === "discharge") { q = Math.max(0, q - rate * dt); }

                if (siteDirty) { ionSites(); }

                const k = metrics();
                const attach = clamp(k.area * 0.6 + 0.4, 0, 1);
                const T = S.T;
                const m4 = new T.Matrix4();

                for (let i = 0; i < NIONS; i++) {

                    const f = free[i];
                    const fx = 0.2 + f[0] * 2.3;
                    const fy = 0.5 + f[1] * 2.8;
                    const fz = (f[2] - 0.5) * 2.0;
                    const s0 = sites[i];
                    const sv = clamp(q * 1.4 - (i / NIONS) * 0.4, 0, 1) * attach;
                    const e = sv * sv * (3 - 2 * sv);
                    const j = (1 - e) * 0.03;

                    m4.makeTranslation(fx + (s0[0] - fx) * e + Math.sin(t * 1.7 + i) * j, fy + (s0[1] - fy) * e + Math.cos(t * 1.3 + i * 1.1) * j, fz + (s0[2] - fz) * e + Math.sin(t * 1.5 + i * 0.7) * j);
                    ions.setMatrixAt(i, m4);
                }

                ions.instanceMatrix.needsUpdate = true;
            }

            root.querySelectorAll("[data-act]").forEach(function (b) {

                b.addEventListener("click", function () { mode = b.dataset.act === "hold" ? "idle" : b.dataset.act; });
            });

            root.querySelectorAll("[data-view]").forEach(function (b) {

                b.addEventListener("click", function () { if (S) { S.preset(b.dataset.view); } });
            });

            root.querySelector("[data-reset]").addEventListener("click", function () {

                mode = "idle";
                q = 0;

                if (S) { S.select(null); S.resetView(); }

                out(root, "info", "Click the grains, the binder, the additive, or the current collector. Then change the sliders and watch the five scores trade off.");
            });

            wire(root, state, defaults, function () { rebuild(); update(); });

            update();

            F.three.create(root, { target: [0.3, 1.9, 0], halfWidth: 5.2, views: { three: [0.55, 1.1], front: [0, 1.5], top: [0, 0.25] }, home: "three", sway: [0.5, 0.3], onPick: function (p) {

                if (!p) { return; }

                seen[p.key] = true;
                out(root, "info", INFO[p.key]);
                update();

            } }).then(function (s) {

                S = s;

                const T = s.T;
                const g = new T.Group();

                s.shadow(g, 7, 4);
                s.scene.add(g);

                const metal = s.mat(0xc2c6d2, { metalness: 0.75, roughness: 0.28 });

                s.part(g, "collector", s.box(0.12, 3.4, 2.4, metal, -2.2, 2.0, 0), [metal]);

                const gm = s.mat(0x2d3344, { metalness: 0.2, roughness: 0.6 });

                grainIM = new T.InstancedMesh(new T.SphereGeometry(1, 10, 8), gm, MAXG);
                s.part(g, "grains", grainIM);

                const bm = new T.MeshStandardMaterial({ color: 0xffc94a, transparent: true, opacity: 0.38, roughness: 0.4, depthWrite: false });

                binderIM = new T.InstancedMesh(new T.SphereGeometry(1, 10, 8), bm, MAXG);
                s.part(g, "binder", binderIM, [bm]);

                const lm = new T.LineBasicMaterial({ color: 0x54e0c7, transparent: true, opacity: 0.85 });

                lines = new T.LineSegments(new T.BufferGeometry(), lm);
                s.part(g, "additive", lines, [lm]);

                // electrolyte region (faint, picks as "electrolyte")
                const em = new T.MeshStandardMaterial({ color: 0x7fe6d6, transparent: true, opacity: 0.07, depthWrite: false });
                const el = s.box(5.2, 3.4, 2.4, em, 0.4, 2.0, 0);

                s.part(g, "electrolyte", el, [em], true);

                const im = new T.MeshStandardMaterial({ color: 0xffb04a, emissive: 0x6a3a00, roughness: 0.3 });

                ions = new T.InstancedMesh(new T.SphereGeometry(0.07, 12, 10), im, NIONS);
                s.part(g, "ions", ions);

                const lab = s.label("Electrode film");

                lab.at = function () { return [-1.2, 4.1, 0]; };

                const lab2 = s.label("Electrolyte and ions");

                lab2.at = function () { return [1.5, 4.1, 0]; };

                const lab3 = s.label("Current collector");

                lab3.at = function () { return [-2.2, 0.15, 0]; };

                rebuild();
                s.onFrame(frame);
                s.start();

            }).catch(function () { });
        };

        // ================================================================
        // UNIT 13: MACRO FORM FACTORS
        // ================================================================
        const FORMS = {
            roll: {
                name: "Cylindrical jelly roll", ion: "Short: across a thin separator", elec: "Long: along a very long foil", pack: "Efficient inside the can; round cans leave gaps in a module", use: "Rugged, power-oriented cells",
                parts: {
                    can: "The sealed metal can. It holds the wound electrodes and electrolyte and makes the cell rugged.",
                    elecA: "Electrode strip A: carbon coated on metal foil. Wound together with strip B, it forms a huge area folded into a small volume.",
                    elecB: "Electrode strip B, the other polarity, wound on the other side of the separator.",
                    sep: "The porous separator, wound between the two electrodes so they never touch.",
                    termA: "The terminal cap on one end. With only one tab, charge has to run along the whole foil, which adds resistance. Multiple tabs shorten that path."
                },
                hint: "Slide the Open it up slider to unroll the strips."
            },
            coin: {
                name: "Coin / button cell", ion: "Short: through one thin separator", elec: "Short: across the disc", pack: "Tiny and cheap, but small capacity", use: "Lab testing and memory backup",
                parts: {
                    can: "The two-part crimped metal case, with a plastic gasket that seals it.",
                    elecA: "An electrode disc on the bottom, soaked in electrolyte.",
                    sep: "A porous separator disc between the two electrode discs.",
                    elecB: "The second electrode disc on top of the separator.",
                    spacer: "A metal spacer and spring that press the stack together so contact stays good.",
                    cap: "The top cap, crimped over the gasket to close the cell."
                },
                hint: "Slide Open it up to pull the layers apart."
            },
            pouch: {
                name: "Pouch / prismatic cell", ion: "Short: across thin separators", elec: "Short: each plate has its own tab", pack: "Thin and flat, packs neatly in rectangular products", use: "Slim devices and compact packs",
                parts: {
                    foil: "The heat-sealed foil pouch. It is light and thin, but needs good seals and gentle compression, and it can swell if gas forms.",
                    elecA: "Electrode plates of one polarity. Each plate has a tab, so many plates work in parallel.",
                    elecB: "Electrode plates of the other polarity, interleaved with the first.",
                    sep: "Separators between every pair of plates.",
                    tabA: "Tabs from every plate of one polarity are gathered into one terminal.",
                    tabB: "Tabs from the other polarity are gathered into the other terminal."
                },
                hint: "Slide Open it up to pull the plates apart."
            }
        };

        SIMS["supercap-3d-cells"] = function (root) {

            const defaults = { form: "roll", open: 0, cut: 0 };
            const state = { form: "roll", open: 0, cut: 0 };
            const seen = {};
            let S = null;
            let group = null;
            let hit = false;
            let build = null;

            root.innerHTML =
                head("Explore in 3D: three cell shapes") +
                F.three.stageHTML() +
                '<div class="fd-stat-row">' + stat("Selected", "name") + stat("Ion path", "ion") + stat("Electron path", "elec") + stat("Packing", "pack") + "</div>" +
                '<div class="fd-sim-readout"><div class="fd-sim-big" data-out="verdict"></div></div>' +
                '<p class="fd-sim-note" data-out="info" style="min-height:4.2em">Click any layer of the cell to see what it is and what it does.</p>' +
                seg("Form factor", "form", [["roll", "Cylindrical jelly roll"], ["coin", "Coin / button"], ["pouch", "Pouch / prismatic"]]) +
                '<div class="fd-seg"><span class="fd-seg-label">View</span>' + btn("3/4 view", 'data-view="three"') + btn("Front", 'data-view="front"') + btn("Top", 'data-view="top"') + "</div>" +
                '<div class="fd-sim-controls">' +
                slider({ label: "Open it up: unroll the roll, or pull the layers apart", key: "open", min: 0, max: 100, step: 1, value: 0 }) +
                slider({ label: "Cutaway: remove the front of the case", key: "cut", min: 0, max: 100, step: 1, value: 0 }) +
                "</div>" +
                '<p class="fd-sim-formula">Same electrodes, same electrolyte: only the arrangement changes the trade between size, resistance, and packability. The roll is a long strip folded into a compact can, the coin cell is the simplest sealed sandwich, and the pouch stacks flat plates in parallel. (Layer counts and sizes are simplified.)</p>';

            function update() {

                const F2 = FORMS[state.form];

                setVal(root, "open", state.open + " %");
                setVal(root, "cut", state.cut + " %");
                out(root, "name", F2.name);
                out(root, "ion", F2.ion);
                out(root, "elec", F2.elec);
                out(root, "pack", F2.pack);
                out(root, "verdict", state.open < 5 ? F2.use + ". " + F2.hint : state.form === "roll" ? "Unrolled, it is one long pair of electrodes folded into a small can" : "Pulled apart, you can see every layer of the sandwich");

                if (!hit && Object.keys(seen).length >= 5 && state.open > 50) {

                    hit = true;
                    F.reward("supercap-3d-cells", 10, "You opened up the cell shapes");
                }
            }

            function makeRoll(s) {

                const T = s.T;
                const g = new T.Group();
                const H = 3.0;
                const N = 360;
                const turns = 5;
                const R0 = 0.3;
                const R1 = 1.3;
                const P = (R1 - R0) / turns;
                const ribbons = [];
                const colors = [0x54e0c7, 0xfff1c4, 0xffc94a, 0xfff1c4];
                const keys = ["elecA", "sep", "elecB", "sep"];
                const opac = [1, 0.55, 1, 0.55];

                s.shadow(g, 4.2, 4.2);

                for (let k = 0; k < 4; k++) {

                    const geo = new T.BufferGeometry();
                    const pos = new Float32Array((N + 1) * 2 * 3);
                    const idx = [];

                    for (let i = 0; i < N; i++) {

                        const a = i * 2;

                        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
                    }

                    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
                    geo.setIndex(idx);

                    const mat = new T.MeshStandardMaterial({ color: colors[k], side: T.DoubleSide, roughness: 0.5, metalness: k % 2 ? 0 : 0.25, transparent: opac[k] < 1, opacity: opac[k], clippingPlanes: [s.plane] });

                    mat.userData.base = new T.Color(colors[k]);

                    const mesh = new T.Mesh(geo, mat);

                    mesh.frustumCulled = false;
                    ribbons.push({ geo: geo, mesh: mesh, k: k });
                }

                // arc length of the spiral, used to lay the strip out flat
                const thetaMax = turns * Math.PI * 2 - 0.2;
                const lens = [];

                function rad(k, th) { return R0 + P * (th / (Math.PI * 2)) + k * P / 4; }

                for (let k = 0; k < 4; k++) {

                    let s2 = 0;
                    const arr = [0];

                    for (let i = 1; i <= N; i++) {

                        const th0 = (i - 1) / N * thetaMax;
                        const th1 = i / N * thetaMax;

                        s2 += (rad(k, th0) + rad(k, th1)) / 2 * (th1 - th0);
                        arr.push(s2);
                    }

                    lens.push(arr);
                }

                function shape(open) {

                    const u = open / 100;
                    const flatLen = 7.2;

                    [can, lid, base, term].forEach(function (m) { if (m) { m.visible = open < 6; } });

                    ribbons.forEach(function (r) {

                        const p = r.geo.attributes.position;
                        const arr = lens[r.k];
                        const total = arr[N];

                        for (let i = 0; i <= N; i++) {

                            const th = i / N * thetaMax;
                            const rr = rad(r.k, th);
                            const sx = rr * Math.cos(th);
                            const sz = rr * Math.sin(th);
                            const fx = (arr[i] / total - 0.5) * flatLen;
                            const fz = (r.k - 1.5) * 0.18 - 0.0;
                            const x = sx + (fx - sx) * u;
                            const z = sz + (fz - sz) * u;
                            const yb = 0.3 + (1 - u) * 0.0;

                            p.setXYZ(i * 2, x, yb, z);
                            p.setXYZ(i * 2 + 1, x, yb + H, z);
                        }

                        p.needsUpdate = true;
                        r.geo.computeVertexNormals();
                    });
                }

                ribbons.forEach(function (r) { g.add(r.mesh); });

                const parts = {
                    elecA: s.part(g, "elecA", ribbons[0].mesh, [ribbons[0].mesh.material]),
                    elecB: s.part(g, "elecB", ribbons[2].mesh, [ribbons[2].mesh.material]),
                    sep: s.part(g, "sep", [ribbons[1].mesh, ribbons[3].mesh], [ribbons[1].mesh.material, ribbons[3].mesh.material])
                };

                void parts;

                // the can: an open glass tube and a base
                const canMat = s.glass(0x9fb8f0, 0.16);
                const can = new T.Mesh(new T.CylinderGeometry(1.5, 1.5, 3.4, 48, 1, true), canMat);

                can.position.set(0, 1.9, 0);
                s.part(g, "can", can, [canMat], true);

                const cap = s.mat(0xc2c6d2, { metalness: 0.75, roughness: 0.28 });
                const base = new T.Mesh(new T.CylinderGeometry(1.5, 1.5, 0.12, 48), cap);

                base.position.set(0, 0.2, 0);
                g.add(base);

                const termM = s.mat(0xff6f7e, { metalness: 0.6, roughness: 0.3 });
                const term = new T.Mesh(new T.CylinderGeometry(0.35, 0.35, 0.2, 24), termM);

                term.position.set(0, 3.2, 0);
                s.part(g, "termA", term, [termM]);

                const lid = new T.Mesh(new T.TorusGeometry(1.46, 0.05, 8, 64), cap);

                lid.rotation.x = Math.PI / 2;
                lid.position.set(0, 3.6, 0);
                g.add(lid);

                shape(0);

                return { group: g, shape: shape, lid: lid, term: term, can: can, base: base, height: 3.4 };
            }

            function makeCoin(s) {

                const T = s.T;
                const g = new T.Group();

                s.shadow(g, 4.2, 4.2);

                const steel = s.mat(0xc2c6d2, { metalness: 0.8, roughness: 0.28 });
                const steel2 = s.mat(0xa7acb8, { metalness: 0.8, roughness: 0.3 });
                const carb = s.mat(0x2d3344, { metalness: 0.2, roughness: 0.6 });
                const carb2 = s.mat(0x37405a, { metalness: 0.2, roughness: 0.6 });
                const sepM = new T.MeshStandardMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.7, roughness: 0.6 });
                const gasket = s.mat(0xff9fb0, { roughness: 0.7 });
                const layers = [];

                function disc(r, h, mat, key, rim) {

                    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 56), mat);

                    layers.push({ mesh: m, h: h });
                    s.part(g, key, m, [mat]);

                    return m;
                }

                const bottom = disc(1.5, 0.14, steel, "can");
                const aD = disc(1.25, 0.16, carb, "elecA");
                const sD = disc(1.3, 0.05, sepM, "sep");
                const bD = disc(1.25, 0.16, carb2, "elecB");
                const spc = disc(1.0, 0.1, steel2, "spacer");
                const spring = new T.Mesh(new T.TubeGeometry(new (class extends T.Curve { getPoint(u, t) { const a = u * Math.PI * 2 * 4; return (t || new T.Vector3()).set(Math.cos(a) * 0.7, u * 0.4, Math.sin(a) * 0.7); } })(), 80, 0.035, 6), steel);

                layers.push({ mesh: spring, h: 0.4 });
                s.part(g, "spacer", spring, [steel]);

                const topC = disc(1.5, 0.14, steel, "cap");
                const ring = new T.Mesh(new T.CylinderGeometry(1.46, 1.46, 0.2, 56, 1, true), gasket);

                ring.material.side = T.DoubleSide;
                layers.push({ mesh: ring, h: 0.2, ring: true });
                s.part(g, "can", ring, [gasket]);

                const order = [bottom, aD, sD, bD, spc, spring, topC];

                function shape(open) {

                    const u = open / 100;
                    let y = 0.15;
                    const gap = 0.36 * u;

                    order.forEach(function (m) {

                        const L = layers.find(function (l) { return l.mesh === m; });

                        if (m === spring) { m.position.set(0, y, 0); y += L.h + 0.02 + gap; return; }

                        m.position.set(0, y + L.h / 2, 0);
                        y += L.h + 0.02 + gap;
                    });

                    ring.position.set(0, 0.85 + gap * 2, 0);
                }

                shape(0);

                return { group: g, shape: shape, height: 2.4 };
            }

            function makePouch(s) {

                const T = s.T;
                const g = new T.Group();

                s.shadow(g, 4.2, 3.2);

                const foilM = s.glass(0xb9c8ee, 0.18);
                const foil = new T.Mesh(new T.BoxGeometry(2.9, 3.4, 0.9), foilM);

                foil.position.set(0, 1.9, 0);
                s.part(g, "foil", foil, [foilM], true);

                const ed = new T.LineSegments(new T.EdgesGeometry(foil.geometry), new T.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.5, clippingPlanes: [s.plane] }));

                ed.position.copy(foil.position);
                g.add(ed);

                const plates = [];
                const mA = s.mat(0x54c9b0, { metalness: 0.2, roughness: 0.5 });
                const mB = s.mat(0xe0b04a, { metalness: 0.2, roughness: 0.5 });
                const sepM = new T.MeshStandardMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.55, roughness: 0.6 });
                const tabM = s.mat(0xd0d3dc, { metalness: 0.8, roughness: 0.3 });
                const NP = 6;
                const aM = [];
                const bM = [];
                const sM = [];
                const tA = [];
                const tB = [];

                for (let i = 0; i < NP; i++) {

                    const isA = i % 2 === 0;
                    const pl = s.box(2.5, 2.6, 0.07, isA ? mA : mB, 0, 1.75, 0);

                    (isA ? aM : bM).push(pl);
                    g.add(pl);

                    const tab = s.box(0.34, 0.5, 0.05, tabM, isA ? -0.9 : 0.9, 3.33, 0);

                    (isA ? tA : tB).push(tab);
                    g.add(tab);
                    plates.push({ plate: pl, tab: tab, isA: isA, i: i });

                    if (i < NP - 1) {

                        const sp = s.box(2.55, 2.65, 0.03, sepM, 0, 1.75, 0);

                        sM.push(sp);
                        g.add(sp);
                        plates.push({ plate: sp, sep: true, i: i });
                    }
                }

                s.part(g, "elecA", aM, [mA]);
                s.part(g, "elecB", bM, [mB]);
                s.part(g, "sep", sM, [sepM]);
                s.part(g, "tabA", tA, [tabM]);
                s.part(g, "tabB", tB, [tabM]);

                const post = s.mat(0xff6f7e, { metalness: 0.6, roughness: 0.3 });
                const postN = s.mat(0x6aa5ff, { metalness: 0.6, roughness: 0.3 });
                const tA2 = s.box(0.3, 0.35, 0.18, postN, -0.9, 3.72, 0);
                const tB2 = s.box(0.3, 0.35, 0.18, post, 0.9, 3.72, 0);

                g.add(tA2);
                g.add(tB2);

                function shape(open) {

                    const u = open / 100;
                    const total = (NP + (NP - 1) * 0.5);
                    let z = 0;
                    const pitch = (0.12 + u * 0.46);

                    plates.forEach(function (p, idx) {

                        const zz = (idx - (plates.length - 1) / 2) * (p.sep ? pitch * 0.5 : pitch * 0.5);

                        p.plate.position.z = zz * 2 * (u > 0 ? 1 : 0.55) * (0.55 + u * 0.9);

                        if (p.tab) { p.tab.position.z = p.plate.position.z; }
                    });

                    void total;
                    void z;
                    foil.scale.z = 1 + u * 3.4;
                    ed.scale.z = foil.scale.z;
                }

                shape(0);

                return { group: g, shape: shape, height: 3.9 };
            }

            function applyForm() {

                if (!S) { return; }

                if (group) { S.dispose(group); }

                build = state.form === "roll" ? makeRoll(S) : state.form === "coin" ? makeCoin(S) : makePouch(S);
                group = build.group;
                S.scene.add(group);
                S.select(null);
                S.target.y = state.form === "coin" ? 1.5 : 1.9;
                build.shape(state.open);
                S.plane.constant = 1.05 - state.cut / 100 * 1.05;
                update();
            }

            root.querySelectorAll("[data-view]").forEach(function (b) {

                b.addEventListener("click", function () { if (S) { S.preset(b.dataset.view); } });
            });

            root.querySelector("[data-reset]").addEventListener("click", function () {

                if (S) { S.select(null); S.resetView(); }

                out(root, "info", "Click any layer of the cell to see what it is and what it does.");
            });

            let lastForm = state.form;

            wire(root, state, defaults, function () {

                if (S) {

                    if (state.form !== lastForm) { lastForm = state.form; applyForm(); }

                    build.shape(state.open);
                    S.plane.constant = 1.05 - state.cut / 100 * 1.05;
                }

                update();
            });

            update();

            F.three.create(root, { target: [0, 1.9, 0], halfWidth: 5.4, views: { three: [0.6, 1.1], front: [0, 1.45], top: [0, 0.25] }, home: "three", sway: [0.5, 0.3], onPick: function (p) {

                if (!p) { return; }

                const text = FORMS[state.form].parts[p.key];

                if (!text) { return; }

                seen[state.form + ":" + p.key] = true;
                out(root, "info", text);
                update();

            } }).then(function (s) {

                S = s;
                applyForm();
                s.start();

            }).catch(function () { });
        };

        document.querySelectorAll('.fd-sim[data-sim^="supercap-3d-"]').forEach(F.mount);
    }

})();
