/* ========================================
   QUANTUM COMPUTING CHIPS: 3D MODELS

   Unit 1:  a superconducting quantum processor in its sample holder.
   Unit 2/3: the Bloch sphere (set a state, measure it).
   Unit 10: quantum gates as rotations on the Bloch sphere.
   Unit 12: the qubit zoo: five kinds of quantum chip.
   Unit 17: a Josephson junction (layers, supercurrent).
   Unit 20: a dilution refrigerator (plates, wiring, cooldown).
   Unit 24: Dolan-bridge shadow evaporation, step by step.
   Unit 27: a flip-chip processor (bumps, vias, flip and bond).

   Built on diagram-sims-3d-core.js and the local three.js.
   Teaching models: shapes and sizes are illustrative, not to scale.
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

        // Bloch coordinates (x, y, z with z up) to three.js coordinates (y up).
        function b2t(v) { return [v[1], v[2], v[0]]; }

        function labelAt(s, text, pos) {

            const l = s.label(text);

            l.at = function () { return pos; };

            return l;
        }

        // A sphere, axes, rings and pole labels shared by the two Bloch scenes.
        function blochSphere(c, R, C) {

            const s = c.S;
            const T = s.T;
            const g = new T.Group();

            s.scene.add(g);
            s.shadow(g, 6, 6);

            const sph = s.sph(R, s.glass(0x7fa8ff, 0.16, false), C[0], C[1], C[2], 48);

            s.part(g, "sphere", sph, [sph.material]);

            const ringM = new T.MeshStandardMaterial({ color: 0xaab3cf, roughness: 0.5, transparent: true, opacity: 0.55 });
            const eq = new T.Mesh(new T.TorusGeometry(R, 0.012, 8, 96), ringM);

            eq.rotation.x = Math.PI / 2;
            eq.position.set(C[0], C[1], C[2]);
            g.add(eq);

            const mer1 = new T.Mesh(new T.TorusGeometry(R, 0.008, 8, 96), ringM);

            mer1.position.set(C[0], C[1], C[2]);
            g.add(mer1);

            const mer2 = mer1.clone();

            mer2.rotation.y = Math.PI / 2;
            g.add(mer2);

            const axes = [];
            const ax = [[[0, 0, 1], 0x54e0c7, "z"], [[1, 0, 0], 0xff6978, "x"], [[0, 1, 0], 0xffd666, "y"]];

            ax.forEach(function (a) {

                const p = b2t(a[0]);
                const ln = s.lineSeg([C[0] - p[0] * R * 1.25, C[1] - p[1] * R * 1.25, C[2] - p[2] * R * 1.25, C[0] + p[0] * R * 1.25, C[1] + p[1] * R * 1.25, C[2] + p[2] * R * 1.25], a[1], 0.75);

                g.add(ln);
                axes.push(ln);
            });

            const tips = [["|0⟩ north pole", [0, 0, 1]], ["|1⟩ south pole", [0, 0, -1]], ["|+⟩", [1, 0, 0]], ["|−⟩", [-1, 0, 0]], ["|+i⟩", [0, 1, 0]], ["|−i⟩", [0, -1, 0]]];
            const tipM = s.mat(0xf5f7ff, { roughness: 0.4 });
            const dots = [];

            tips.forEach(function (tp) {

                const p = b2t(tp[1]);
                const d = s.sph(0.06, tipM, C[0] + p[0] * R, C[1] + p[1] * R, C[2] + p[2] * R, 12);

                g.add(d);
                dots.push(d);
                labelAt(s, tp[0], [C[0] + p[0] * R * 1.38, C[1] + p[1] * R * 1.38, C[2] + p[2] * R * 1.38]);
            });

            s.part(g, "poles", dots, [tipM], true);

            labelAt(s, "equator: every 50/50 blend", [C[0] - R * 0.75, C[1] - 0.12, C[2] + R * 0.85]);

            // the state arrow: a shaft and a head inside a group that we point at the state
            const arM = new T.MeshStandardMaterial({ color: 0xbe96ff, emissive: 0x3a2070, roughness: 0.35 });
            const arrow = new T.Group();
            const shaft = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, R - 0.22, 14), arM);
            const headM = new T.Mesh(new T.ConeGeometry(0.12, 0.26, 18), arM);

            shaft.position.y = (R - 0.22) / 2;
            headM.position.y = R - 0.13;
            arrow.add(shaft);
            arrow.add(headM);
            arrow.position.set(C[0], C[1], C[2]);
            g.add(arrow);
            s.part(g, "arrow", [shaft, headM], [arM]);

            const up = new T.Vector3(0, 1, 0);

            function point(v) {

                const p = b2t(v);
                const dir = new T.Vector3(p[0], p[1], p[2]);

                if (dir.length() < 1e-6) { return; }

                arrow.quaternion.setFromUnitVectors(up, dir.normalize());
            }

            return { g: g, point: point, arM: arM, R: R, C: C };
        }

        function vecFrom(th, ph) {

            const t = th * Math.PI / 180;
            const p = ph * Math.PI / 180;

            return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)];
        }

        function nameOf(v) {

            const n = [["|0⟩", [0, 0, 1]], ["|1⟩", [0, 0, -1]], ["|+⟩", [1, 0, 0]], ["|−⟩", [-1, 0, 0]], ["|+i⟩", [0, 1, 0]], ["|−i⟩", [0, -1, 0]]].filter(function (c) { return Math.hypot(v[0] - c[1][0], v[1] - c[1][1], v[2] - c[1][2]) < 0.08; })[0];

            return n ? n[0] : "a superposition";
        }

        function slerpVec(a, b, k) {

            const v = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
            const L = Math.hypot(v[0], v[1], v[2]) || 1;

            return [v[0] / L, v[1] / L, v[2] / L];
        }


        // ================================================================
        // UNIT 1: A SUPERCONDUCTING QUANTUM PROCESSOR
        // ================================================================
        D("qc-3d-processor", {

            title: "Explore in 3D: a superconducting quantum chip",
            intro: "Click any part of the chip. Then drive a qubit or send a readout pulse along the feedline.",
            stats: [["Parts explored", "seen"], ["Last action", "act"]],
            defaults: {},
            controls: [
                { actions: [["drive", "⚡ Drive a qubit"], ["read", "📡 Read the qubits out"]], label: "Try" },
                { views: ["three", "top", "front"] }
            ],
            formula: "A superconducting quantum processor is a centimetre-sized chip: aluminium or niobium circuits on silicon. Each qubit (a transmon) is a cross-shaped capacitor joined to the ground by a Josephson junction. Couplers link neighbouring qubits, a meandering resonator next to each qubit is used to read it out, and wire bonds connect the chip to a copper holder that sits at 10 millikelvin. (Six qubits shown; real chips have dozens to a thousand.)",
            stage: { target: [0, 0.6, 0], halfWidth: 4.6, halfHeight: 2.2, views: { three: [0.55, 1.0], top: [0, 0.12], front: [0, 1.45] }, home: "three", sway: [0.55, 0.3] },
            info: {
                holder: "Copper sample holder: it holds the chip, connects it to coaxial cables and keeps it at the fridge's 10 mK. Copper conducts heat well and shields stray signals.",
                chip: "Silicon chip: high-purity, high-resistivity silicon (or sapphire), so the substrate itself absorbs almost no microwave energy.",
                ground: "Ground plane: a thin film of superconducting aluminium or niobium covering most of the chip. The circuits are patterned into it with lithography and etching.",
                qubit: "Transmon qubit: a cross-shaped superconducting capacitor (an 'Xmon'). Together with its Josephson junction it forms an anharmonic oscillator whose two lowest levels are the qubit, at about 4 to 6 GHz.",
                junction: "Josephson junction: two aluminium layers separated by about 1 to 2 nanometres of aluminium oxide. Its nonlinear inductance gives the qubit uneven energy levels. Its area and oxide thickness set the qubit frequency.",
                coupler: "Coupler: a small circuit between neighbouring qubits. Tuning it turns their interaction on for a two-qubit gate and off the rest of the time.",
                resonator: "Readout resonator: a meandering microwave line, a few millimetres long, that rings at about 6 to 7 GHz. Its frequency shifts slightly depending on whether its qubit is 0 or 1.",
                feedline: "Feedline: a transmission line that carries readout tones past all the resonators at once, so many qubits can be measured through one cable.",
                drive: "Drive line: carries the microwave pulses that rotate one qubit (its quantum gates).",
                pads: "Bond pads and wire bonds: thin aluminium wires, about 25 µm across, connect the chip's pads to the holder's circuit board.",
            },
            read: function (c) {

                return {
                    seen: c.count() + " of 10",
                    act: c.data.act || "—",
                    verdict: c.count() >= 6 ? "You've explored the main parts of a quantum processor" : "Click the parts to learn what each one does"
                };
            },
            reward: { when: function (c) { return c.count() >= 6; }, msg: "You explored a superconducting quantum chip" },
            act: function (c, id) {

                const d = c.data;

                if (id === "drive") { d.pulse = { path: d.drivePath, t: 0, q: d.driveQ }; d.act = "Microwave pulse on a drive line"; }
                if (id === "read") { d.pulse = { path: d.feedPath, t: 0, read: true }; d.act = "Readout tone along the feedline"; }
            },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                s.scene.add(g);
                s.shadow(g, 10, 10);

                const cuM = s.mat(0xc8834f, { metalness: 0.85, roughness: 0.35 });
                const holder = s.box(8, 0.4, 7, cuM, 0, 0.2, 0);
                const recess = s.box(5.6, 0.05, 5.6, s.mat(0x7a4a2a, { metalness: 0.6, roughness: 0.5 }), 0, 0.42, 0);

                s.part(g, "holder", [holder, recess], [cuM]);

                const siM = s.mat(0x4a5266, { roughness: 0.35, metalness: 0.3 });
                const chip = s.box(5, 0.22, 5, siM, 0, 0.55, 0);

                s.part(g, "chip", chip, [siM]);

                const gndM = s.mat(0x8f97ab, { metalness: 0.75, roughness: 0.32 });
                const gnd = s.box(4.8, 0.015, 4.8, gndM, 0, 0.67, 0);

                s.part(g, "ground", gnd, [gndM], true);

                const alM = s.mat(0xe3e8f2, { metalness: 0.9, roughness: 0.22 });
                const jjM = s.mat(0xffd666, { emissive: 0x6a4a00, roughness: 0.3 });
                const qPos = [[-1.4, -0.75], [0, -0.75], [1.4, -0.75], [-1.4, 0.75], [0, 0.75], [1.4, 0.75]];
                const qMeshes = [];
                const jj = [];
                const Y = 0.69;

                d.qMats = [];

                qPos.forEach(function (p) {

                    const m = alM.clone();

                    m.userData.base = alM.userData.base;
                    d.qMats.push(m);

                    const a = s.box(0.9, 0.035, 0.13, m, p[0], Y, p[1]);
                    const b = s.box(0.13, 0.035, 0.9, m, p[0], Y, p[1]);

                    qMeshes.push(a, b);

                    const j = s.box(0.08, 0.05, 0.08, jjM, p[0], Y + 0.01, p[1] + (p[1] < 0 ? -0.5 : 0.5));

                    jj.push(j);
                });

                s.part(g, "qubit", qMeshes, d.qMats);
                s.part(g, "junction", jj, [jjM]);

                const cpM = s.mat(0xbe96ff, { roughness: 0.35, metalness: 0.4 });
                const cps = [];

                [[-0.7, -0.75], [0.7, -0.75], [-0.7, 0.75], [0.7, 0.75], [-1.4, 0], [0, 0], [1.4, 0]].forEach(function (p, i) {

                    cps.push(i < 4 ? s.box(0.42, 0.03, 0.07, cpM, p[0], Y, p[1]) : s.box(0.07, 0.03, 0.42, cpM, p[0], Y, p[1]));
                });

                s.part(g, "coupler", cps, [cpM]);

                // readout resonators: meanders from each qubit's outer arm to the feedline
                const rsM = s.mat(0x54e0c7, { metalness: 0.6, roughness: 0.3 });
                const res = [];

                qPos.forEach(function (p) {

                    const dir = p[1] < 0 ? -1 : 1;
                    const pts = [[p[0] + 0.45, Y, p[1]]];
                    const z0 = p[1] + dir * 0.15;

                    for (let k = 0; k < 6; k++) {

                        const zz = z0 + dir * (0.1 + k * 0.12);

                        pts.push([p[0] + 0.5 + (k % 2 ? -0.12 : 0.12), Y, zz]);
                    }

                    pts.push([p[0] + 0.5, Y, dir * 2.0]);
                    res.push(s.tube(pts, 0.02, rsM, 40));
                });

                s.part(g, "resonator", res, [rsM]);

                // feedline: a U shape around the chip, from the left pads to the right pads
                const fdM = s.mat(0x78b4ff, { metalness: 0.6, roughness: 0.3 });
                const feedPts = [[-2.35, Y, -2.05], [0, Y, -2.05], [1.85, Y, -2.05], [2.02, Y, -2.0], [2.1, Y, -1.85], [2.1, Y, 0], [2.1, Y, 1.85], [2.02, Y, 2.0], [1.85, Y, 2.05], [0, Y, 2.05], [-2.35, Y, 2.05]];
                const feed = s.tube(feedPts, 0.035, fdM, 160);

                s.part(g, "feedline", feed, [fdM]);
                d.feedPath = feedPts;

                // drive lines from the left edge to two qubits
                const drM = s.mat(0xff9f6a, { metalness: 0.5, roughness: 0.35 });
                const dr1 = s.tube([[-2.4, Y, -0.3], [-1.9, Y, -0.3], [-1.75, Y, -0.6]], 0.02, drM, 20);
                const dr2 = s.tube([[-2.4, Y, 0.3], [-1.9, Y, 0.3], [-1.75, Y, 0.6]], 0.02, drM, 20);

                s.part(g, "drive", [dr1, dr2], [drM]);
                d.drivePath = [[-2.4, Y, -0.3], [-1.9, Y, -0.3], [-1.75, Y, -0.6]];
                d.driveQ = 0;

                // bond pads and wire bonds
                const auM = s.mat(0xffcf5a, { metalness: 0.9, roughness: 0.25 });
                const pads = [];

                [[-2.35, -2.05], [-2.35, 2.05], [-2.4, -0.3], [-2.4, 0.3], [2.35, -1.2], [2.35, 1.2]].forEach(function (p) {

                    pads.push(s.box(0.2, 0.03, 0.2, auM, p[0], Y, p[1]));

                    const hx = p[0] < 0 ? -3.4 : 3.4;

                    pads.push(s.box(0.3, 0.03, 0.22, auM, hx, 0.44, p[1]));
                    pads.push(s.tube([[p[0], Y + 0.01, p[1]], [(p[0] + hx) / 2, 1.0, p[1]], [hx, 0.46, p[1]]], 0.012, auM, 16));
                });

                s.part(g, "pads", pads, [auM]);

                labelAt(s, "Qubit (transmon)", [0, 1.15, -0.75]);
                labelAt(s, "Josephson junction", [-1.4, 0.95, -1.35]);
                labelAt(s, "Coupler", [0.7, 0.95, 0.75]);
                labelAt(s, "Readout resonator", [1.9, 0.95, 1.55]);
                labelAt(s, "Feedline", [0.4, 0.9, 2.3]);
                labelAt(s, "Wire bonds", [-3.0, 1.25, -2.05]);
                labelAt(s, "Silicon chip", [2.6, 0.55, -2.6]);
                labelAt(s, "Copper holder", [3.7, 0.25, 3.4]);

                const pulseM = new T.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffb800, emissiveIntensity: 1.6 });

                d.ball = s.sph(0.09, pulseM, 0, -5, 0, 14);
                g.add(d.ball);
                d.glow = 0;
            },
            frame: function (c, dt) {

                const d = c.data;

                if (d.pulse) {

                    const P = d.pulse.path;

                    d.pulse.t += dt * 0.8;

                    const segs = P.length - 1;
                    const u = Math.min(d.pulse.t, 1) * segs;
                    const i = Math.min(Math.floor(u), segs - 1);
                    const k = u - i;

                    d.ball.position.set(P[i][0] + (P[i + 1][0] - P[i][0]) * k, P[i][1] + 0.06, P[i][2] + (P[i + 1][2] - P[i][2]) * k);

                    if (d.pulse.t >= 1) {

                        if (!d.pulse.read) { d.glow = 1.5; }

                        d.ball.position.y = -5;
                        d.pulse = null;
                    }
                }

                if (d.glow > 0) { d.glow = Math.max(0, d.glow - dt); }

                d.qMats[d.driveQ].emissive.setRGB(0.5 * d.glow, 0.42 * d.glow, 0.1 * d.glow);
            }
        });


        // ================================================================
        // UNITS 2 AND 3: THE BLOCH SPHERE
        // ================================================================
        D("qc-3d-bloch", {

            title: "Explore in 3D: the Bloch sphere",
            intro: "Move the sliders to point the qubit's arrow anywhere on the sphere. Then measure it and watch it collapse to a pole.",
            stats: [["State", "name"], ["P(0)", "p0"], ["P(1)", "p1"], ["Results 0 / 1", "cnt"]],
            defaults: { th: 60, ph: 70 },
            controls: [
                { slider: "th", label: "Blend towards 1 (θ)", min: 0, max: 180, step: 1, fmt: function (v) { return v + "°"; } },
                { slider: "ph", label: "Phase (φ)", min: 0, max: 360, step: 5, fmt: function (v) { return v + "°"; } },
                { actions: [["measure", "Measure"], ["again", "Prepare the state again"], ["m50", "Measure 50 fresh copies"]], label: "Try" },
                { views: ["three", "front", "top"] }
            ],
            formula: "Every state of one qubit is a point on this sphere: |0⟩ at the top, |1⟩ at the bottom, and all the 50/50 blends on the equator, which differ only in phase (|+⟩, |−⟩, |+i⟩, |−i⟩). The height of the arrow sets the odds: P(0) = cos²(θ/2). Measuring snaps the arrow to a pole at random with those odds. Click the sphere, the arrow or the pole labels for more.",
            stage: { target: [0, 2.2, 0], halfWidth: 3.2, halfHeight: 2.4, views: { three: [0.75, 1.15], front: [0, 1.5], top: [0, 0.15] }, home: "three", sway: [0.75, 0.35] },
            info: {
                sphere: "The Bloch sphere: every possible state of a single qubit is a point on its surface. Opposite points are the two results of some measurement.",
                arrow: "The state arrow. Its angle from the top (θ) sets the odds of reading 0 or 1. Its direction around the vertical axis (φ) is the phase, which only shows up through interference.",
                poles: "The six named states: |0⟩ and |1⟩ (top and bottom), |+⟩ and |−⟩ (front and back), |+i⟩ and |−i⟩ (left and right). Opposite ones are completely different; neighbours are 50/50 blends of each other."
            },
            read: function (c) {

                const d = c.data;
                const st = c.state;
                const p0 = Math.pow(Math.cos(st.th * Math.PI / 360), 2);

                return {
                    name: d.collapsed !== null && d.collapsed !== undefined ? "|" + d.collapsed + "⟩ (measured)" : nameOf(vecFrom(st.th, st.ph)),
                    p0: Math.round(p0 * 100) + "%",
                    p1: Math.round((1 - p0) * 100) + "%",
                    cnt: (d.n0 || 0) + " / " + (d.n1 || 0),
                    verdict: d.collapsed !== null && d.collapsed !== undefined ? "Collapsed to |" + d.collapsed + "⟩: the blend is gone" : st.th > 85 && st.th < 95 ? "On the equator: a 50/50 blend" : "Point the arrow, then measure"
                };
            },
            reward: { when: function (c) { return (c.data.n0 || 0) + (c.data.n1 || 0) >= 50; }, msg: "You measured qubits on the Bloch sphere" },
            act: function (c, id) {

                const d = c.data;
                const st = c.state;
                const p0 = Math.pow(Math.cos(st.th * Math.PI / 360), 2);

                if (id === "measure") { d.collapsed = d.rand() < p0 ? 0 : 1; if (d.collapsed === 0) { d.n0++; } else { d.n1++; } }
                if (id === "again") { d.collapsed = null; }
                if (id === "m50") { for (let i = 0; i < 50; i++) { if (d.rand() < p0) { d.n0++; } else { d.n1++; } } d.collapsed = null; }
            },
            onChange: function (c) { c.data.collapsed = null; c.data.n0 = 0; c.data.n1 = 0; },
            reset: function (c) { c.data.collapsed = null; c.data.n0 = 0; c.data.n1 = 0; },
            build: function (c) {

                const d = c.data;

                d.B = blochSphere(c, 1.7, [0, 2.2, 0]);
                d.cur = vecFrom(c.state.th, c.state.ph);
                d.collapsed = null;
                d.n0 = 0;
                d.n1 = 0;
                d.rand = mulberry(Date.now() % 8888);

                const T = c.S.T;

                d.latM = new T.MeshBasicMaterial({ color: 0xffd666, transparent: true, opacity: 0.5 });
                d.lat = new T.Mesh(new T.TorusGeometry(1, 0.01, 6, 80), d.latM);
                d.lat.rotation.x = Math.PI / 2;
                c.S.scene.add(d.lat);
            },
            frame: function (c, dt) {

                const d = c.data;
                const st = c.state;
                const target = d.collapsed === null ? vecFrom(st.th, st.ph) : (d.collapsed === 0 ? [0, 0, 1] : [0, 0, -1]);

                d.cur = slerpVec(d.cur, target, Math.min(1, dt * 6));
                d.B.point(d.cur);

                const z = d.cur[2];
                const r = Math.sqrt(Math.max(0, 1 - z * z)) * 1.7;

                d.lat.visible = r > 0.05;
                d.lat.scale.set(Math.max(r, 0.01), Math.max(r, 0.01), 1);
                d.lat.position.set(0, 2.2 + z * 1.7, 0);
                d.B.arM.emissive.setHex(d.collapsed === null ? 0x3a2070 : (d.collapsed === 0 ? 0x0a5a4a : 0x5a4a00));
            }
        });


        // ================================================================
        // UNIT 10: GATES AS ROTATIONS
        // ================================================================
        const GATE_AXES = { X: [[1, 0, 0], Math.PI], Y: [[0, 1, 0], Math.PI], Z: [[0, 0, 1], Math.PI], H: [[Math.SQRT1_2, 0, Math.SQRT1_2], Math.PI], S: [[0, 0, 1], Math.PI / 2], T: [[0, 0, 1], Math.PI / 4] };
        const TARGETS = [[0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]];

        D("qc-3d-gates", {

            title: "Explore in 3D: quantum gates are rotations",
            intro: "Press a gate and watch the arrow rotate. Try to land the purple arrow on the faint gold target.",
            stats: [["Current state", "name"], ["Target", "tgt"], ["Gates used", "moves"], ["Targets reached", "won"]],
            defaults: {},
            controls: [
                { actions: [["X", "X"], ["Y", "Y"], ["Z", "Z"], ["H", "H"], ["S", "S"], ["T", "T"]], label: "Gate" },
                { actions: [["new", "New target"], ["zero", "Back to |0⟩"]], label: "Game" },
                { views: ["three", "front", "top"] }
            ],
            formula: "Every single-qubit gate is a rotation of the Bloch sphere. X, Y and Z are half turns about those axes. H is a half turn about the diagonal between X and Z, so it swaps |0⟩ and |+⟩. S and T are quarter and eighth turns about the vertical axis: they change only the phase. On a real chip, each rotation is a shaped microwave pulse a few tens of nanoseconds long.",
            stage: { target: [0, 2.2, 0], halfWidth: 3.2, halfHeight: 2.4, views: { three: [0.75, 1.15], front: [0, 1.5], top: [0, 0.15] }, home: "three", sway: [0.75, 0.35] },
            info: {
                sphere: "The Bloch sphere. Gates rotate the whole sphere, carrying the state arrow with it.",
                arrow: "The qubit's state. The trail behind it shows the path each rotation takes.",
                poles: "The six named states are the corners every X, Y, Z, H and S gate moves between. T gates land in between."
            },
            read: function (c) {

                const d = c.data;

                return {
                    name: d.v ? nameOf(d.v) : "|0⟩",
                    tgt: d.tgt ? nameOf(d.tgt) : "—",
                    moves: String(d.moves || 0),
                    won: String(d.won || 0),
                    verdict: d.justWon ? "Target reached! A new one has appeared." : "Rotate the arrow onto the gold target"
                };
            },
            reward: { when: function (c) { return (c.data.won || 0) >= 3; }, msg: "You steered a qubit with gates in 3D" },
            act: function (c, id) {

                const d = c.data;

                if (id === "new") { d.newTarget(); return; }
                if (id === "zero") { d.v = [0, 0, 1]; d.anim = null; d.trail = []; d.moves = 0; return; }
                if (d.anim) { d.v = d.anim.end; d.anim = null; }

                const ga = GATE_AXES[id];

                d.anim = { start: d.v.slice(), axis: ga[0], ang: ga[1], t: 0, end: rot(d.v, ga[0], ga[1]) };
                d.moves++;
                d.justWon = false;
            },
            build: function (c) {

                const d = c.data;
                const s = c.S;
                const T = s.T;

                d.B = blochSphere(c, 1.7, [0, 2.2, 0]);
                d.v = [0, 0, 1];
                d.moves = 0;
                d.won = 0;
                d.trail = [];
                d.rand = mulberry(Date.now() % 6666);

                const ghostM = new T.MeshStandardMaterial({ color: 0xffd666, emissive: 0x5a4a00, transparent: true, opacity: 0.4 });

                d.ghost = new T.Group();

                const gs = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 1.48, 12), ghostM);
                const gh = new T.Mesh(new T.ConeGeometry(0.13, 0.26, 16), ghostM);

                gs.position.y = 0.74;
                gh.position.y = 1.57;
                d.ghost.add(gs);
                d.ghost.add(gh);
                d.ghost.position.set(0, 2.2, 0);
                s.scene.add(d.ghost);

                d.trailGeo = new T.BufferGeometry();
                d.trailGeo.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(600 * 3), 3));
                d.trailGeo.setDrawRange(0, 0);
                s.scene.add(new T.Line(d.trailGeo, new T.LineBasicMaterial({ color: 0xbe96ff, transparent: true, opacity: 0.8 })));

                d.newTarget = function () {

                    let t;

                    do { t = TARGETS[Math.floor(d.rand() * TARGETS.length)]; } while (Math.hypot(t[0] - d.v[0], t[1] - d.v[1], t[2] - d.v[2]) < 0.1);

                    d.tgt = t;

                    const p = b2t(t);

                    d.ghost.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(p[0], p[1], p[2]).normalize());
                };

                d.newTarget();
            },
            frame: function (c, dt) {

                const d = c.data;

                if (d.anim) {

                    d.anim.t = Math.min(1, d.anim.t + dt * 0.9);

                    const e = d.anim.t < 0.5 ? 2 * d.anim.t * d.anim.t : 1 - Math.pow(-2 * d.anim.t + 2, 2) / 2;

                    d.v = rot(d.anim.start, d.anim.axis, d.anim.ang * e);

                    const p = b2t(d.v);

                    d.trail.push([p[0] * 1.7, 2.2 + p[1] * 1.7, p[2] * 1.7]);

                    if (d.trail.length > 600) { d.trail.shift(); }

                    if (d.anim.t >= 1) {

                        d.v = d.anim.end;
                        d.anim = null;

                        if (d.tgt && Math.hypot(d.tgt[0] - d.v[0], d.tgt[1] - d.v[1], d.tgt[2] - d.v[2]) < 0.05) { d.won++; d.justWon = true; d.newTarget(); }
                    }

                    const arr = d.trailGeo.attributes.position.array;

                    d.trail.forEach(function (q, i) { arr[i * 3] = q[0]; arr[i * 3 + 1] = q[1]; arr[i * 3 + 2] = q[2]; });
                    d.trailGeo.attributes.position.needsUpdate = true;
                    d.trailGeo.setDrawRange(0, d.trail.length);
                }

                d.B.point(d.v);
            }
        });

        // Rotate a Bloch vector v about a unit axis by angle (Rodrigues' formula).
        function rot(v, k, a) {

            const c = Math.cos(a);
            const s = Math.sin(a);
            const dot = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
            const cr = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
            const r = [0, 1, 2].map(function (i) { return v[i] * c + cr[i] * s + k[i] * dot * (1 - c); });

            return r.map(function (x) { return Math.abs(x) < 1e-9 ? 0 : x; });
        }


        // ================================================================
        // UNIT 12: THE QUBIT ZOO
        // ================================================================
        const ZOO = {
            sc: "Superconducting",
            si: "Silicon spin",
            ion: "Trapped ion",
            atom: "Neutral atom",
            ph: "Photonic"
        };

        D("qc-3d-zoo", {

            title: "Explore in 3D: five kinds of quantum chip",
            intro: "Pick a platform, then click its parts. Each one is a different way of making a qubit.",
            stats: [["Platform", "plat"], ["Platforms explored", "seen"]],
            defaults: { p: "sc" },
            controls: [
                { seg: "p", label: "Platform", options: Object.keys(ZOO).map(function (k) { return [k, ZOO[k]]; }) },
                { views: ["three", "top", "front"] }
            ],
            formula: "Superconducting circuits and silicon spins are made in cleanrooms like ordinary chips. Ions and neutral atoms are nature's identical qubits, held in place by microfabricated electrodes or laser light. Photonic qubits travel through waveguides etched into silicon. Models are simplified and not to scale.",
            stage: { target: [0, 0.9, 0], halfWidth: 4.2, halfHeight: 2.2, views: { three: [0.6, 1.05], top: [0, 0.15], front: [0, 1.45] }, home: "three", sway: [0.6, 0.3] },
            info: {
                sc_sub: "Silicon or sapphire substrate, chosen because it barely absorbs microwave energy.",
                sc_pad: "Capacitor pads: two large superconducting aluminium pads. Their size sets the qubit's charging energy, and their edges are where most loss happens.",
                sc_jj: "Josephson junction: Al / about 1–2 nm AlOₓ / Al, made by evaporating aluminium from two angles through a suspended resist bridge. It's the qubit's nonlinear heart.",
                sc_res: "Readout resonator: a meandering line whose frequency shifts with the qubit's state.",
                sc_feed: "Feedline: carries the readout tone past the resonator.",
                si_sub: "Silicon substrate at the bottom of the stack.",
                si_sige: "Silicon-germanium layers. Their slightly larger atomic spacing stretches the thin silicon layer between them, which traps electrons there.",
                si_well: "Silicon quantum well: a strained layer about 10 nm thick, ideally made of pure silicon-28 so no nuclear spins disturb the qubits.",
                si_gates: "Gate electrodes: overlapping metal fingers tens of nanometres wide. Plunger gates pull single electrons into quantum dots; barrier gates control how they tunnel between dots.",
                si_e: "Electrons: each one trapped in a quantum dot. Its spin (up or down in a magnetic field) is the qubit.",
                si_mag: "Micromagnet: a cobalt strip whose sloping field lets electric pulses on the gates rotate the spins.",
                ion_chip: "Trap chip: gold electrodes patterned on sapphire or silicon, much like a MEMS chip.",
                ion_rf: "RF electrodes: carry a radio-frequency voltage that makes a pocket of electric field holding the ions about 50–100 µm above the surface.",
                ion_dc: "DC electrodes: segmented electrodes that shuttle ions along the trap and push them together or apart.",
                ion_ions: "Ions (the qubits): single charged atoms such as ytterbium or calcium, floating in vacuum. Every one is identical.",
                ion_laser: "Laser beam: focused light drives the gates and makes the ions fluoresce for readout. New chips route the light through on-chip waveguides.",
                at_atoms: "Neutral atoms (the qubits): rubidium or caesium atoms, cooled to microkelvin temperatures.",
                at_tw: "Optical tweezers: tightly focused laser beams, each holding one atom. Moving the beams rearranges the array.",
                at_ryd: "Rydberg pair: two atoms excited to giant Rydberg states interact strongly, which makes a two-qubit gate.",
                at_lens: "Objective lens: focuses the tweezer beams and collects the atoms' light for imaging.",
                at_cell: "Glass vacuum cell: the atoms live in ultra-high vacuum, so nothing collides with them.",
                ph_chip: "Photonic chip: silicon or silicon nitride waveguides made in a photonics foundry with the usual lithography and etch tools.",
                ph_src: "Photon source: a ring resonator turns laser light into pairs of single photons.",
                ph_wg: "Waveguides: thin ridges that guide light around the chip with little loss. A photon's path is its qubit.",
                ph_bs: "Beam splitters: where two waveguides run close together, a photon splits between them: the photonic version of a gate.",
                ph_heat: "Phase shifter: a tiny heater changes the waveguide's refractive index, shifting the photon's phase.",
                ph_det: "Single-photon detectors: superconducting nanowires about 100 nm wide, at a few kelvin, that click when a single photon arrives."
            },
            read: function (c) {

                const d = c.data;

                return {
                    plat: ZOO[c.state.p],
                    seen: Object.keys(d.seen || {}).length + " of 5",
                    verdict: { sc: "Circuits made in a cleanroom, cooled to 10 mK", si: "Electrons in silicon, made like transistors", ion: "Identical atoms held above a chip", atom: "Atoms in a grid of laser tweezers", ph: "Light in waveguides, detected by superconducting wires" }[c.state.p]
                };
            },
            reward: { when: function (c) { return Object.keys(c.data.seen || {}).length >= 5; }, msg: "You toured the qubit zoo" },
            onChange: function (c) { c.data.show(c.state.p); },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const d = c.data;

                d.groups = {};
                d.labs = {};
                d.seen = {};

                Object.keys(ZOO).forEach(function (k) { d.groups[k] = new T.Group(); d.labs[k] = []; s.scene.add(d.groups[k]); });

                const lab = function (k, text, pos) { const l = labelAt(s, text, pos); l._at = l.at; d.labs[k].push(l); };

                // ---------- superconducting ----------
                (function () {

                    const g = d.groups.sc;

                    s.shadow(g, 8, 6);

                    const sub = s.box(6, 0.3, 4, s.mat(0x4a5266, { roughness: 0.35, metalness: 0.3 }), 0, 0.15, 0);

                    s.part(g, "sc_sub", sub, [sub.material]);

                    const alM = s.mat(0xe3e8f2, { metalness: 0.9, roughness: 0.2 });
                    const p1 = s.box(1.6, 0.06, 1.1, alM, -1.15, 0.33, 0);
                    const p2 = s.box(1.6, 0.06, 1.1, alM, 1.15, 0.33, 0);

                    s.part(g, "sc_pad", [p1, p2], [alM]);

                    const jM = s.mat(0xffd666, { emissive: 0x5a4000, roughness: 0.3 });
                    const l1 = s.box(0.38, 0.04, 0.07, alM, -0.17, 0.34, 0);
                    const l2 = s.box(0.07, 0.04, 0.38, alM, 0.0, 0.38, 0.12);
                    const ox = s.box(0.12, 0.03, 0.12, jM, 0, 0.36, 0);

                    g.add(l1);
                    g.add(l2);
                    s.part(g, "sc_jj", [ox], [jM]);

                    const rM = s.mat(0x54e0c7, { metalness: 0.6, roughness: 0.3 });
                    const pts = [[1.15, 0.33, -0.55]];

                    for (let k = 0; k < 7; k++) { pts.push([0.6 + (k % 2) * 1.1, 0.33, -0.75 - k * 0.12]); }

                    pts.push([1.15, 0.33, -1.6]);

                    const res = s.tube(pts, 0.03, rM, 50);

                    s.part(g, "sc_res", res, [rM]);

                    const fM = s.mat(0x78b4ff, { metalness: 0.6, roughness: 0.3 });
                    const feed = s.tube([[-2.9, 0.33, -1.7], [2.9, 0.33, -1.7]], 0.05, fM, 8);

                    s.part(g, "sc_feed", feed, [fM]);

                    lab("sc", "Capacitor pads", [-1.7, 0.75, 0.7]);
                    lab("sc", "Josephson junction", [0.25, 1.3, -0.15]);
                    lab("sc", "Readout resonator", [1.9, 0.75, -1.1]);
                    lab("sc", "Feedline", [-2.2, 0.75, -1.7]);
                    lab("sc", "Silicon substrate", [2.4, 0.2, 1.9]);
                }());

                // ---------- silicon spin ----------
                (function () {

                    const g = d.groups.si;

                    s.shadow(g, 8, 5);

                    const W = 5;
                    const Dp = 2.4;
                    const layers = [["si_sub", 0.7, 0x5a6273, 0.35], ["si_sige", 0.4, 0xb89c74, 0.9], ["si_well", 0.1, 0x54e0c7, 1.15], ["si_sige", 0.3, 0xb89c74, 1.35], [null, 0.06, 0x9fb2ff, 1.53]];
                    const sigeMeshes = [];
                    const sigeM = s.mat(0xb89c74, { roughness: 0.6 });

                    layers.forEach(function (L) {

                        if (L[0] === "si_sige") { sigeMeshes.push(s.box(W, L[1], Dp, sigeM, 0, L[3], 0)); return; }

                        const m = L[0] === "si_well" ? s.mat(L[2], { emissive: 0x0a4a40, roughness: 0.4 }) : L[0] ? s.mat(L[2], { roughness: 0.5 }) : s.glass(L[2], 0.35, false);
                        const mesh = s.box(W, L[1], Dp, m, 0, L[3], 0);

                        if (L[0]) { s.part(g, L[0], mesh, [m]); } else { g.add(mesh); }
                    });

                    s.part(g, "si_sige", sigeMeshes, [sigeM]);

                    const gM = s.mat(0xd8c08a, { metalness: 0.85, roughness: 0.3 });
                    const gM2 = s.mat(0xc9ced8, { metalness: 0.85, roughness: 0.3 });
                    const gates = [];

                    for (let i = 0; i < 9; i++) {

                        const x = -2 + i * 0.5;
                        const plunger = i % 2 === 1;

                        gates.push(s.box(0.28, 0.14, Dp * 0.8, plunger ? gM : gM2, x, plunger ? 1.73 : 1.64, 0.1));
                    }

                    s.part(g, "si_gates", gates, [gM, gM2]);

                    const eM = new T.MeshStandardMaterial({ color: 0x78b4ff, emissive: 0x2050c0, emissiveIntensity: 1.2 });
                    const es = [];

                    for (let i = 0; i < 4; i++) { es.push(s.sph(0.09, eM, -1.5 + i * 1.0, 1.15, 1.25, 14)); }

                    s.part(g, "si_e", es, [eM]);
                    d.electrons = es;

                    const mag = s.box(4.4, 0.2, 0.4, s.mat(0xff7aa8, { metalness: 0.5, roughness: 0.4 }), 0, 1.9, -1.0);

                    s.part(g, "si_mag", mag, [mag.material]);

                    lab("si", "Gate electrodes", [0, 2.35, 0.6]);
                    lab("si", "Electron spins (qubits)", [-1.5, 0.85, 1.7]);
                    lab("si", "Silicon-28 quantum well", [2.9, 1.15, 0.8]);
                    lab("si", "SiGe layers", [2.9, 0.75, 1.2]);
                    lab("si", "Micromagnet", [1.8, 2.3, -1.0]);
                }());

                // ---------- trapped ion ----------
                (function () {

                    const g = d.groups.ion;

                    s.shadow(g, 8, 5);

                    const chip = s.box(6, 0.3, 3, s.mat(0x9fb6d8, { roughness: 0.25, metalness: 0.1 }), 0, 0.15, 0);

                    s.part(g, "ion_chip", chip, [chip.material]);

                    const auM = s.mat(0xffcf5a, { metalness: 0.95, roughness: 0.2 });
                    const rf = [s.box(5.6, 0.05, 0.35, auM, 0, 0.33, -0.3), s.box(5.6, 0.05, 0.35, auM, 0, 0.33, 0.3)];

                    s.part(g, "ion_rf", rf, [auM]);

                    const dcM = s.mat(0xe0b862, { metalness: 0.9, roughness: 0.3 });
                    const dcs = [];

                    for (let i = 0; i < 8; i++) { [-1, 1].forEach(function (sd) { dcs.push(s.box(0.6, 0.05, 0.7, dcM, -2.45 + i * 0.7, 0.33, sd * 0.95)); }); }

                    s.part(g, "ion_dc", dcs, [dcM]);

                    const iM = new T.MeshStandardMaterial({ color: 0x9fe8ff, emissive: 0x40b0ff, emissiveIntensity: 1.3 });
                    const ions = [];

                    for (let i = 0; i < 5; i++) { ions.push(s.sph(0.1, iM, -1.2 + i * 0.6, 1.0, 0, 16)); }

                    s.part(g, "ion_ions", ions, [iM]);
                    d.ions = ions;

                    const lM = new T.MeshStandardMaterial({ color: 0xff4fa0, emissive: 0xff2080, emissiveIntensity: 1.2, transparent: true, opacity: 0.55 });
                    const beam = s.cyl(0.03, 0.03, 5, lM, -0.6, 1.0, 0);

                    beam.rotation.x = Math.PI / 2;
                    beam.rotation.z = 0.5;
                    s.part(g, "ion_laser", beam, [lM]);

                    lab("ion", "Ions (qubits)", [0, 1.55, 0]);
                    lab("ion", "RF electrodes", [2.4, 0.75, 0]);
                    lab("ion", "DC electrodes", [-2.4, 0.75, 1.2]);
                    lab("ion", "Laser beam", [-0.6, 1.25, 2.2]);
                    lab("ion", "Trap chip", [2.6, 0.2, 1.7]);
                }());

                // ---------- neutral atoms ----------
                (function () {

                    const g = d.groups.atom;

                    s.shadow(g, 7, 6);

                    const lens = s.cyl(1.6, 1.6, 0.35, s.glass(0x9fd8ff, 0.45, false), 0, 0.3, 0, 48);

                    s.part(g, "at_lens", lens, [lens.material]);

                    const aM = new T.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffa000, emissiveIntensity: 0.9 });
                    const tM = new T.MeshStandardMaterial({ color: 0xff6040, emissive: 0xff3010, emissiveIntensity: 0.6, transparent: true, opacity: 0.18 });
                    const atoms = [];
                    const beams = [];

                    for (let i = 0; i < 5; i++) {

                        for (let j = 0; j < 4; j++) {

                            const x = -1.2 + i * 0.6;
                            const z = -0.9 + j * 0.6;

                            atoms.push(s.sph(0.07, aM, x, 1.9, z, 12));

                            const b = s.cyl(0.015, 0.09, 1.4, tM, x, 1.2, z, 10, true);

                            beams.push(b);
                        }
                    }

                    s.part(g, "at_atoms", atoms, [aM]);
                    s.part(g, "at_tw", beams, [tM], true);

                    const rM = new T.MeshStandardMaterial({ color: 0xbe96ff, emissive: 0x7040ff, emissiveIntensity: 0.9, transparent: true, opacity: 0.35 });
                    const halo = [s.sph(0.32, rM, 0, 1.9, -0.3, 20), s.sph(0.32, rM, 0, 1.9, 0.3, 20)];

                    s.part(g, "at_ryd", halo, [rM]);
                    d.halo = halo;

                    const cell = s.box(4.2, 2.4, 3.4, s.glass(0xcfe4ff, 0.08, false), 0, 1.55, 0);

                    s.part(g, "at_cell", cell, [cell.material], true);

                    lab("atom", "Atoms (qubits)", [-1.2, 2.3, -0.9]);
                    lab("atom", "Optical tweezers", [1.4, 1.2, 1.0]);
                    lab("atom", "Rydberg pair (gate)", [0, 2.45, 0.6]);
                    lab("atom", "Objective lens", [1.9, 0.35, 1.2]);
                    lab("atom", "Vacuum cell", [-2.2, 2.9, 1.7]);
                }());

                // ---------- photonic ----------
                (function () {

                    const g = d.groups.ph;

                    s.shadow(g, 8, 5);

                    const chip = s.box(6.2, 0.3, 3, s.mat(0x4a5266, { roughness: 0.35, metalness: 0.3 }), 0, 0.15, 0);

                    s.part(g, "ph_chip", chip, [chip.material]);

                    const wM = s.mat(0x9fe8ff, { emissive: 0x1a5070, roughness: 0.2 });
                    const y = 0.34;
                    const upper = [[-2.6, y, -0.6], [-1.4, y, -0.6], [-0.9, y, -0.1], [-0.5, y, -0.1], [0, y, -0.6], [1.0, y, -0.6], [1.5, y, -0.1], [1.9, y, -0.1], [2.4, y, -0.6], [2.8, y, -0.6]];
                    const lower = upper.map(function (p) { return [p[0], p[1], -p[2]]; });
                    const wu = s.tube(upper, 0.04, wM, 80);
                    const wl = s.tube(lower, 0.04, wM, 80);

                    s.part(g, "ph_wg", [wu, wl], [wM]);
                    d.upper = upper;
                    d.lower = lower;

                    const bsM = new T.MeshStandardMaterial({ color: 0x78b4ff, transparent: true, opacity: 0.35, emissive: 0x2040a0 });
                    const bs = [s.box(0.5, 0.06, 0.45, bsM, -0.7, y, 0), s.box(0.5, 0.06, 0.45, bsM, 1.7, y, 0)];

                    s.part(g, "ph_bs", bs, [bsM]);

                    const hM = s.mat(0xffcf5a, { metalness: 0.9, roughness: 0.25 });
                    const heat = s.box(0.7, 0.05, 0.22, hM, 0.5, 0.4, -0.6);

                    s.part(g, "ph_heat", heat, [hM]);

                    const srcM = new T.MeshStandardMaterial({ color: 0xff9fd0, emissive: 0xff40a0, emissiveIntensity: 0.8 });
                    const src = new T.Mesh(new T.TorusGeometry(0.28, 0.035, 10, 40), srcM);

                    src.rotation.x = Math.PI / 2;
                    src.position.set(-2.3, y, -1.0);
                    s.part(g, "ph_src", src, [srcM]);

                    const dM = s.mat(0x303848, { metalness: 0.7, roughness: 0.4 });
                    const dets = [];

                    [-0.6, 0.6].forEach(function (z) {

                        const pts = [];

                        for (let k = 0; k < 8; k++) { pts.push([2.85 + (k % 2) * 0.25, y + 0.02, z - 0.2 + k * 0.055]); }

                        dets.push(s.tube(pts, 0.015, dM, 30));
                        dets.push(s.box(0.5, 0.02, 0.5, s.mat(0x1c2230, { roughness: 0.6 }), 2.97, y - 0.01, z));
                    });

                    s.part(g, "ph_det", dets, [dM]);

                    const pM = new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0a0, emissiveIntensity: 1.6 });

                    d.photons = [s.sph(0.07, pM, 0, -5, 0, 10), s.sph(0.07, pM, 0, -5, 0, 10)];
                    d.photons.forEach(function (p) { g.add(p); });
                    d.phT = 0;

                    lab("ph", "Photon source (ring)", [-2.3, 0.85, -1.2]);
                    lab("ph", "Waveguides", [-1.8, 0.55, 1.05]);
                    lab("ph", "Beam splitter", [-0.7, 1.05, -0.25]);
                    lab("ph", "Phase shifter (heater)", [0.5, 0.9, -0.9]);
                    lab("ph", "Single-photon detectors", [2.9, 0.85, 1.1]);
                }());

                d.show = function (k) {

                    Object.keys(d.groups).forEach(function (key) {

                        const on = key === k;

                        d.groups[key].visible = on;
                        d.groups[key].position.y = on ? 0 : -200;

                        d.labs[key].forEach(function (l) {

                            l.at = on ? l._at : null;
                            l.el.style.display = on ? "" : "none";
                        });
                    });

                    d.seen[k] = true;
                    s.select(null);
                };

                d.show(c.state.p);
            },
            frame: function (c, dt, t) {

                const d = c.data;

                if (c.state.p === "ion" && d.ions) { d.ions.forEach(function (m, i) { m.position.y = 1.0 + Math.sin(t * 3 + i) * 0.02; }); }

                if (c.state.p === "si" && d.electrons) { d.electrons.forEach(function (m, i) { m.position.x = -1.5 + i * 1.0 + Math.sin(t * 2 + i * 1.7) * 0.04; }); }

                if (c.state.p === "atom" && d.halo) { const k = 0.3 + 0.25 * (Math.sin(t * 2.5) * 0.5 + 0.5); d.halo.forEach(function (h) { h.material.opacity = k; }); }

                if (c.state.p === "ph" && d.photons) {

                    d.phT = (d.phT + dt * 0.35) % 1;

                    [d.upper, d.lower].forEach(function (P, j) {

                        const segs = P.length - 1;
                        const u = d.phT * segs;
                        const i = Math.min(Math.floor(u), segs - 1);
                        const k = u - i;

                        d.photons[j].position.set(P[i][0] + (P[i + 1][0] - P[i][0]) * k, P[i][1] + 0.05, P[i][2] + (P[i + 1][2] - P[i][2]) * k);
                    });
                }
            }
        });



        // ================================================================
        // UNIT 17: A JOSEPHSON JUNCTION
        // ================================================================
        D("qc-3d-junction", {

            title: "Explore in 3D: a Josephson junction",
            intro: "Click the layers. Send a supercurrent through, or lift the top electrode to see the barrier.",
            stats: [["Parts explored", "seen"], ["Last action", "act"]],
            defaults: {},
            controls: [
                { actions: [["pairs", "⚡ Send a supercurrent"], ["lift", "⬆ Lift the top electrode"]], label: "Try" },
                { views: ["three", "top", "front"] }
            ],
            formula: "A qubit's Josephson junction is where two aluminium strips cross, with a 1 to 2 nm layer of aluminium oxide between them. The overlap is tiny, about 0.2 × 0.2 µm, so it's drawn hugely magnified here (and the barrier thicker than scale). Cooper pairs tunnel through the barrier with no voltage at all, as long as the current stays below the critical current.",
            stage: { target: [0, 0.4, 0], halfWidth: 3.8, halfHeight: 1.8, views: { three: [0.7, 1.0], top: [0, 0.12], front: [0, 1.45] }, home: "three", sway: [0.7, 0.3] },
            info: {
                substrate: "Silicon substrate: high-resistivity silicon (or sapphire) carries the junction and the rest of the qubit.",
                bottom: "Bottom electrode: the first aluminium layer, about 30 to 100 nm thick, evaporated at one angle.",
                oxide: "Tunnel barrier: amorphous aluminium oxide, only 1 to 2 nm thick (a few atoms), grown by letting pure oxygen into the chamber. Its thickness sets the critical current very sensitively.",
                top: "Top electrode: the second aluminium layer, evaporated at the opposite angle after oxidation. Where it crosses the bottom layer, the junction forms.",
                overlap: "The junction itself: the overlap area, about 0.04 µm². Its area times the barrier's resistance per area sets the junction's resistance, and so the qubit frequency.",
                pads: "Leads: these connect the junction to the qubit's capacitor pads (they are much bigger than drawn here)."
            },
            read: function (c) {

                return {
                    seen: c.count() + " of 6",
                    act: c.data.act || "—",
                    verdict: c.count() >= 4 ? "You've explored the junction's layers" : "Click the layers to learn what each one does"
                };
            },
            reward: { when: function (c) { return c.count() >= 4; }, msg: "You explored a Josephson junction" },
            reset: function (c) { c.data.liftT = 0; c.data.lift = false; c.data.pairs = []; c.data.act = ""; },
            act: function (c, id) {

                const d = c.data;

                if (id === "pairs") {

                    d.pairs = [0, 0.18, 0.36, 0.54, 0.72].map(function (k) { return { t: -k }; });
                    d.act = "Cooper pairs tunnel through, V = 0";
                }

                if (id === "lift") { d.lift = !d.lift; d.act = d.lift ? "Top electrode lifted" : "Top electrode lowered"; }
            },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                s.scene.add(g);
                s.shadow(g, 9, 7);

                const siM = s.mat(0x4a5266, { roughness: 0.35, metalness: 0.3 });

                s.part(g, "substrate", s.box(7.4, 0.3, 5.2, siM, 0, 0.15, 0), [siM]);

                const alM = s.mat(0xd9e0ee, { metalness: 0.9, roughness: 0.22 });
                const alM2 = s.mat(0xb9c6e0, { metalness: 0.9, roughness: 0.25 });
                const bottom = s.box(6, 0.12, 0.6, alM, 0, 0.36, 0);
                const bPads = [s.box(0.9, 0.12, 1.2, alM, -3.2, 0.36, 0), s.box(0.9, 0.12, 1.2, alM, 3.2, 0.36, 0)];

                s.part(g, "bottom", bottom, [alM]);

                const oxM = s.mat(0xbe96ff, { transparent: true, opacity: 0.85, emissive: 0x2a1450, roughness: 0.4 });
                const ox = s.box(0.62, 0.05, 0.62, oxM, 0, 0.445, 0);

                s.part(g, "oxide", ox, [oxM]);

                // the top electrode is one group so it can be lifted
                const top = new T.Group();

                top.add(s.box(0.6, 0.12, 0.72, alM2, 0, 0.53, 0));
                [-1, 1].forEach(function (sg) {

                    top.add(s.box(0.6, 0.12, 1.9, alM2, 0, 0.36, sg * 1.31));
                    top.add(s.box(0.6, 0.29, 0.06, alM2, 0, 0.445, sg * 0.33));
                });

                const tPads = [s.box(1.2, 0.12, 0.9, alM2, 0, 0.36, -2.6), s.box(1.2, 0.12, 0.9, alM2, 0, 0.36, 2.6)];

                g.add(top);
                s.part(top, "top", top.children.slice(), [alM2]);
                s.part(g, "pads", bPads.concat(tPads), [alM, alM2], true);
                d.top = top;

                const ovM = s.mat(0xffd666, { emissive: 0x6a4a00, transparent: true, opacity: 0.55 });
                const ov = s.box(0.6, 0.01, 0.6, ovM, 0, 0.475, 0);

                s.part(g, "overlap", ov, [ovM], true);

                labelAt(s, "Bottom aluminium", [-2.2, 0.8, 0.5]);
                labelAt(s, "Top aluminium", [0.5, 0.85, 1.6]);
                labelAt(s, "AlOₓ barrier, 1–2 nm", [0.6, 1.25, -0.4]);
                labelAt(s, "Silicon", [3.2, 0.2, 2.4]);

                const pairM = new T.MeshStandardMaterial({ color: 0xffd666, emissive: 0xffb800, emissiveIntensity: 1.2 });

                d.balls = [];

                for (let i = 0; i < 10; i++) {

                    const b = s.sph(0.07, pairM, 0, -5, 0, 12);

                    g.add(b);
                    d.balls.push(b);
                }

                d.pairs = [];
                d.liftT = 0;
            },
            frame: function (c, dt) {

                const d = c.data;

                d.liftT = clamp(d.liftT + (d.lift ? dt : -dt) * 0.6, 0, 1);
                d.top.position.y = d.liftT * 0.9;

                d.balls.forEach(function (b) { b.position.y = -5; });

                d.pairs.forEach(function (p, i) {

                    p.t += dt * 0.16;

                    const t = p.t;

                    if (t < 0 || t > 1) { return; }

                    let x, y, z;

                    if (t < 0.45) { x = -3 + t / 0.45 * 3; y = 0.45; z = 0; }
                    else if (t < 0.55) { x = 0; y = 0.45 + (t - 0.45) / 0.1 * 0.17 + d.liftT * 0.9 * ((t - 0.45) / 0.1); z = 0; }
                    else { x = 0; y = 0.62 + d.liftT * 0.9; z = (t - 0.55) / 0.45 * 2.6; if (z > 0.36) { y = 0.45 + d.liftT * 0.9; } }

                    [-0.06, 0.06].forEach(function (off, j) {

                        const b = d.balls[i * 2 + j];

                        b.position.set(x + (z ? off : 0), y, z + (z ? 0 : off));
                    });
                });

                d.pairs = d.pairs.filter(function (p) { return p.t <= 1; });
            }
        });


        // ================================================================
        // UNIT 20: THE DILUTION REFRIGERATOR
        // ================================================================
        const FRIDGE = [
            ["top", "Room-temperature top plate", 5.6, 1.75, 300],
            ["p50", "50 K plate", 4.85, 1.65, 45],
            ["p4", "4 K plate", 4.1, 1.55, 3.5],
            ["still", "Still plate", 3.4, 1.4, 0.8],
            ["cp", "Cold plate", 2.75, 1.3, 0.1],
            ["mxc", "Mixing chamber plate", 2.1, 1.2, 0.01]
        ];

        D("qc-3d-fridge", {

            title: "Explore in 3D: a dilution refrigerator",
            intro: "Click any plate or component. Start a cooldown, or send a microwave pulse down to the chip.",
            stats: [["Parts explored", "seen"], ["Mixing chamber", "temp"]],
            defaults: {},
            controls: [
                { actions: [["cool", "❄ Cool down"], ["pulse", "⚡ Send a pulse to the chip"]], label: "Try" },
                { views: ["three", "front", "side"] }
            ],
            formula: "Inside its outer vacuum can and radiation shields, a dilution refrigerator is a 'chandelier' of gold-plated copper plates, each colder than the one above: about 50 K, 4 K, 0.8 K (the still), 0.1 K (the cold plate) and 10 mK (the mixing chamber). Coaxial lines carry signals down, with attenuators on each plate to block heat and noise. The quantum chip hangs at the bottom, inside a magnetic shield. (The cans and shields are hidden here; the speeds of the animations are not to scale.)",
            stage: { target: [0, 3.0, 0], halfWidth: 2.6, halfHeight: 3.3, views: { three: [0.6, 1.25], front: [0, 1.5], side: [1.5, 1.45] }, home: "three", sway: [0.6, 0.35] },
            info: {
                top: "Top plate (300 K): the vacuum flange at room temperature, where cables, pumping lines and the pulse tube enter.",
                p50: "50 K plate: the first stage of the pulse-tube cooler. A radiation shield hangs from it to block heat radiated from the room-temperature can.",
                p4: "4 K plate: cooled by the pulse tube's second stage to about 3 K. The HEMT readout amplifiers and the first big attenuators sit here, where there is plenty of cooling power.",
                still: "Still plate (about 0.8 K): helium-3 is pumped away from the still, driving the dilution cycle.",
                cp: "Cold plate (about 0.1 K): an intermediate stage that intercepts heat flowing down the cables.",
                mxc: "Mixing chamber plate (about 10 mK): the coldest point, where helium-3 dissolves into helium-4 and absorbs heat. The chip and quantum-limited amplifiers are attached here.",
                pt: "Pulse-tube cooler: a closed-cycle helium gas refrigerator that cools the 50 K and 4 K plates without a bath of liquid helium. Its gentle vibration is one thing designers must isolate from the qubits.",
                dil: "Dilution unit: the still, heat exchangers and mixing chamber where the helium-3/helium-4 mixture circulates.",
                coax: "Coaxial lines: thin superconducting or stainless-steel cables that conduct little heat. Each qubit needs one or more; big systems carry hundreds.",
                att: "Attenuators: on each plate they absorb room-temperature noise and pass on only a tiny, cold remnant of the signal.",
                hemt: "HEMT amplifier (4 K): a low-noise transistor amplifier that boosts the weak readout signal.",
                twpa: "Quantum-limited amplifier (10 mK): a parametric amplifier made of Josephson junctions, the first amplifier the readout signal meets.",
                sample: "Sample holder and chip: the quantum processor in its copper holder, bolted to the mixing chamber plate.",
                shield: "Magnetic shield: cryogenic mu-metal and superconducting cans keep stray magnetic fields (and trapped flux) away from the chip."
            },
            read: function (c) {

                const T = c.data.T === undefined ? 300 : c.data.T;

                return {
                    seen: c.count() + " of 14",
                    temp: T >= 1 ? T.toFixed(T < 10 ? 1 : 0) + " K" : Math.round(T * 1000) + " mK",
                    verdict: T <= 0.012 ? "At base temperature: ready for qubits" : c.count() >= 8 ? "You've explored the fridge" : "Click the parts to learn what each one does"
                };
            },
            reward: { when: function (c) { return c.count() >= 8; }, msg: "You explored a dilution refrigerator" },
            reset: function (c) { c.data.cool = 0; c.data.cooling = false; c.data.T = 300; c.data.pulse = null; },
            act: function (c, id) {

                const d = c.data;

                if (id === "cool") { d.cooling = true; d.cool = 0; }
                if (id === "pulse") { d.pulse = 0; }
            },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                s.scene.add(g);
                s.shadow(g, 5, 5);

                d.plateMats = [];

                FRIDGE.forEach(function (p, i) {

                    const m = s.mat(i === 0 ? 0xb8bcc8 : i === 5 ? 0xe0b450 : 0xd29a5c, { metalness: 0.85, roughness: 0.3 });

                    d.plateMats.push(m);
                    s.part(g, p[0], s.disc(p[3], 0.1, m, 0, p[2], 0), [m]);
                    labelAt(s, p[1].replace(" plate", "") + (i ? " · " + (p[4] >= 1 ? p[4] + " K" : p[4] * 1000 + " mK") : " · 300 K"), [-p[3] - 0.25, p[2] + 0.05, 0]);

                    if (i < FRIDGE.length - 1) {

                        const nx = FRIDGE[i + 1];
                        const rodM = s.mat(0x8f97ab, { metalness: 0.6, roughness: 0.4 });

                        [0, 2.1, 4.2].forEach(function (a) {

                            const r = nx[3] - 0.12;

                            g.add(s.cyl(0.03, 0.03, p[2] - nx[2], rodM, Math.cos(a) * r, (p[2] + nx[2]) / 2, Math.sin(a) * r, 8));
                        });
                    }
                });

                // pulse tube from the top plate to the 4 K plate
                const ptM = s.mat(0x9aa6c4, { metalness: 0.7, roughness: 0.3 });

                s.part(g, "pt", [s.cyl(0.22, 0.22, 0.8, ptM, 0.9, 6.05, 0.3), s.cyl(0.13, 0.13, 0.75, ptM, 0.9, 5.22, 0.3), s.cyl(0.1, 0.1, 0.75, ptM, 0.9, 4.47, 0.3)], [ptM]);

                // dilution unit: still pot, heat exchanger coil and mixing chamber pot
                const dlM = s.mat(0xc9d3e6, { metalness: 0.8, roughness: 0.3 });
                const coil = [];

                for (let k = 0; k <= 60; k++) {

                    const a = k / 60 * Math.PI * 8;

                    coil.push([-0.55 + Math.cos(a) * 0.18, 3.25 - k / 60 * 1.0, 0.45 + Math.sin(a) * 0.18]);
                }

                s.part(g, "dil", [s.cyl(0.25, 0.25, 0.35, dlM, -0.55, 3.15, 0.45), s.tube(coil, 0.025, dlM, 200), s.cyl(0.28, 0.28, 0.3, dlM, -0.55, 1.88, 0.45)], [dlM]);

                // coax lines with attenuators on each plate
                const cxM = s.mat(0x78b4ff, { metalness: 0.6, roughness: 0.35 });
                const atM = s.mat(0xffd666, { metalness: 0.6, roughness: 0.35 });
                const lines = [];
                const atts = [];

                [[0.35, -0.55], [0.5, -0.4], [0.2, -0.65], [0.62, -0.2]].forEach(function (p) {

                    lines.push(s.cyl(0.018, 0.018, 4.0, cxM, p[0], 4.0, p[1], 8));

                    [3, 4, 5].forEach(function (i) { atts.push(s.box(0.09, 0.14, 0.09, atM, p[0], FRIDGE[i][2] - 0.12, p[1])); });
                    atts.push(s.box(0.09, 0.14, 0.09, atM, p[0], FRIDGE[2][2] - 0.12, p[1]));
                });

                s.part(g, "coax", lines, [cxM]);
                s.part(g, "att", atts, [atM]);

                const hemtM = s.mat(0x54e0c7, { metalness: 0.5, roughness: 0.3 });

                s.part(g, "hemt", s.box(0.4, 0.16, 0.3, hemtM, -0.6, FRIDGE[2][2] + 0.13, -0.6), [hemtM]);

                const twM = s.mat(0xbe96ff, { metalness: 0.5, roughness: 0.3 });

                s.part(g, "twpa", s.box(0.35, 0.14, 0.25, twM, 0.55, FRIDGE[5][2] - 0.12, 0.5), [twM]);

                // sample holder hanging below the mixing chamber, inside a magnetic shield
                const cuM = s.mat(0xc8834f, { metalness: 0.85, roughness: 0.35 });

                s.part(g, "sample", [s.cyl(0.07, 0.07, 0.6, cuM, 0, 1.75, 0), s.box(0.45, 0.6, 0.1, cuM, 0, 1.15, 0), s.box(0.22, 0.22, 0.02, s.mat(0x4a5266), 0, 1.15, 0.06)], [cuM]);

                const shM = s.glass(0x9fb3d8, 0.25, false);

                s.part(g, "shield", s.cyl(0.42, 0.42, 1.2, shM, 0, 1.25, 0, 32, true), [shM], true);

                labelAt(s, "Pulse tube", [1.4, 6.3, 0.3]);
                labelAt(s, "Coax lines + attenuators", [1.4, 3.7, -0.6]);
                labelAt(s, "Chip in magnetic shield", [1.1, 1.0, 0]);
                labelAt(s, "Dilution unit", [-1.2, 2.6, 0.8]);

                const pulseM = new T.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffb800, emissiveIntensity: 1.6 });

                d.ball = s.sph(0.06, pulseM, 0, -5, 0, 12);
                g.add(d.ball);
                d.T = 300;
                d.cool = 0;
            },
            frame: function (c, dt) {

                const d = c.data;

                if (d.cooling) { d.cool = Math.min(1, d.cool + dt / 18); }

                // stage temperatures blend from 300 K to their base values over the cooldown
                FRIDGE.forEach(function (p, i) {

                    if (i === 0) { return; }

                    const k = clamp(d.cool * 1.6 - (i - 1) * 0.12, 0, 1);
                    const Tst = Math.exp(Math.log(300) * (1 - k) + Math.log(p[4]) * k);
                    const warm = clamp(Math.log10(Tst) / Math.log10(300), 0, 1);
                    const m = d.plateMats[i];

                    if (c.S.selected() && c.S.selected().mats.indexOf(m) >= 0) { return; }

                    m.emissive.setRGB(0.25 * warm * warm, 0.05 * warm, 0.25 * (1 - warm) * (i >= 3 ? 1 : 0.5));

                    if (i === 5) { d.T = Tst; }
                });

                if (d.pulse !== null && d.pulse !== undefined) {

                    d.pulse += dt * 0.2;

                    if (d.pulse < 0.8) {

                        d.ball.position.set(0.35, 6.0 - d.pulse / 0.8 * 4.0, -0.55);

                    } else {

                        const f = (d.pulse - 0.8) / 0.2;

                        d.ball.position.set(0.35 * (1 - f), 2.0 - 0.85 * f, -0.55 + 0.65 * f);
                    }

                    if (d.pulse >= 1) { d.pulse = null; d.ball.position.y = -5; }
                }
            }
        });


        // ================================================================
        // UNIT 24: SHADOW EVAPORATION THROUGH A DOLAN BRIDGE
        // ================================================================
        D("qc-3d-dolan", {

            title: "Explore in 3D: making a junction with a shadow",
            intro: "Do the four steps in order: evaporate, oxidise, evaporate again, then lift off. Click any layer to learn about it.",
            stats: [["Step", "step"], ["Junction", "jj"]],
            defaults: {},
            controls: [
                { actions: [["e1", "① Evaporate from the left"], ["ox", "② Oxidise"], ["e2", "③ Evaporate from the right"], ["lift", "④ Lift off"]], label: "Steps" },
                { views: ["three", "top", "front"] }
            ],
            formula: "The Dolan technique (1977): e-beam lithography makes a two-layer resist with a thin bridge suspended over an undercut cavity. Aluminium is evaporated twice, from opposite angles, with an oxidation in between. The bridge's shadow shifts with the angle, so the two layers overlap under the bridge, forming the junction, all in one vacuum pump-down. Dissolving the resist lifts off the metal on top. (Greatly magnified; the bridge is about 100 to 200 nm wide.)",
            stage: { target: [0, 0.5, 0], halfWidth: 3.6, halfHeight: 1.8, views: { three: [0.55, 0.95], top: [0, 0.1], front: [0, 1.4] }, home: "three", sway: [0.55, 0.3] },
            info: {
                substrate: "Substrate: the wafer, already carrying the rest of the qubit circuit (pads and wiring).",
                lower: "Lower resist (for example a copolymer, MMA): thick, and more sensitive, so development undercuts it into a cavity below the top layer.",
                upper: "Upper resist (PMMA): a thin layer patterned by the electron beam. It defines the line and the bridge.",
                bridge: "The Dolan bridge: a strip of upper resist suspended over the cavity. It casts the shadow that separates and offsets the two evaporations.",
                al1: "First aluminium layer: evaporated from one side, so its pattern lands shifted one way.",
                oxide: "Oxide: pure oxygen at a controlled pressure and time grows the 1 to 2 nm AlOₓ tunnel barrier on the first layer.",
                al2: "Second aluminium layer: evaporated from the other side, shifted the other way. Under the bridge it lands on the oxidised first layer: that overlap is the junction.",
                topmetal: "Metal on the resist: most of the evaporated aluminium lands on top of the resist and is removed in liftoff.",
                junction: "The junction: where the second layer lies on the oxidised first layer, right under where the bridge was. The wide overlaps along the leads are junctions too, but so large that they act almost like plain wire."
            },
            read: function (c) {

                const d = c.data;
                const names = ["Not started", "First layer deposited", "Barrier grown", "Second layer deposited", "Lifted off: finished"];

                return {
                    step: names[d.stage || 0],
                    jj: (d.stage || 0) >= 3 ? "Formed under the bridge" : "Not yet",
                    verdict: d.msg || (d.stage === 4 ? "A finished junction: two overlapping aluminium layers with oxide between" : "Follow the steps in order")
                };
            },
            reward: { when: function (c) { return c.data.stage === 4; }, msg: "You made a junction by shadow evaporation" },
            reset: function (c) {

                const d = c.data;

                d.stage = 0;
                d.anim = null;
                d.msg = "";
                d.al1.forEach(function (m) { m.scale.y = 0.001; });
                d.al2.forEach(function (m) { m.scale.y = 0.001; });
                d.oxides.forEach(function (m) { m.visible = false; });
                d.tops.forEach(function (m) { m.visible = false; m.scale.y = 0.001; m.position.y = d.Y2 + 0.03; });
                d.resist.forEach(function (m) { m.visible = true; });
                d.resistMats.forEach(function (m) { m.opacity = m.userData.op; });
                d.rLabels.forEach(function (l) { l.el.style.visibility = ""; });
                d.jj.visible = false;
            },
            act: function (c, id) {

                const d = c.data;
                const order = ["e1", "ox", "e2", "lift"];
                const want = order[d.stage || 0];

                if (d.anim) { d.msg = "Wait for the current step to finish"; return; }

                if (id !== want) { d.msg = want ? "Next step: " + ["① evaporate from the left", "② oxidise", "③ evaporate from the right", "④ lift off"][d.stage] : "Finished! Press Reset to start again"; return; }

                d.msg = "";
                d.anim = { id: id, t: 0 };
            },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                s.scene.add(g);
                s.shadow(g, 8, 5);

                const siM = s.mat(0x4a5266, { roughness: 0.35, metalness: 0.3 });

                s.part(g, "substrate", s.box(6.4, 0.3, 3.4, siM, 0, 0.15, 0), [siM]);

                const loM = s.glass(0xffb27a, 0.28, false);
                const upM = s.glass(0xff9f6a, 0.55, false);
                const brM = s.mat(0xff9f6a, { transparent: true, opacity: 0.85, roughness: 0.5 });

                loM.userData.op = 0.28;
                upM.userData.op = 0.55;
                brM.userData.op = 0.85;
                d.resistMats = [loM, upM, brM];

                const Y0 = 0.3, Y1 = 1.0, Y2 = 1.12;
                const lower = [
                    s.box(6.4, Y1 - Y0, 1.2, loM, 0, (Y0 + Y1) / 2, 1.1),
                    s.box(6.4, Y1 - Y0, 1.2, loM, 0, (Y0 + Y1) / 2, -1.1),
                    s.box(0.6, Y1 - Y0, 1.0, loM, -2.9, (Y0 + Y1) / 2, 0),
                    s.box(0.6, Y1 - Y0, 1.0, loM, 2.9, (Y0 + Y1) / 2, 0)
                ];
                const upperBoxes = [[0, 6.4, 0.2, 1.5], [0, 6.4, -1.5, -0.2], [-1, 1.0, -0.2, 0.2], [1, 1.0, -0.2, 0.2]];
                const upper = upperBoxes.map(function (b) {

                    if (b[0] === 0) { return s.box(6.4, Y2 - Y1, b[3] - b[2], upM, 0, (Y1 + Y2) / 2, (b[2] + b[3]) / 2); }

                    return s.box(b[1], Y2 - Y1, 0.4, upM, b[0] * 2.7, (Y1 + Y2) / 2, 0);
                });
                const bridge = s.box(0.3, Y2 - Y1, 0.4, brM, 0, (Y1 + Y2) / 2, 0);

                s.part(g, "lower", lower, [loM]);
                s.part(g, "upper", upper, [upM]);
                s.part(g, "bridge", bridge, [brM]);
                d.resist = lower.concat(upper, [bridge]);

                // geometry of the shadows: shift = (height of the bridge above the floor) × tan(angle)
                const sh = 0.35;
                const strip = function (x1, x2, y, mat) {

                    const m = s.box(x2 - x1, 0.05, 0.4, mat, (x1 + x2) / 2, y, 0);

                    m.geometry.translate(0, 0.025, 0);
                    m.position.y = y;
                    m.scale.y = 0.001;

                    return m;
                };

                const a1M = s.mat(0xd9e0ee, { metalness: 0.9, roughness: 0.22 });
                const a2M = s.mat(0xa9c0ea, { metalness: 0.9, roughness: 0.25 });

                d.al1 = [strip(-2.2 + sh, -0.15 + sh, Y0, a1M), strip(0.15 + sh, 2.2 + sh, Y0, a1M)];
                d.al2 = [strip(-2.2 - sh, -0.15 - sh, Y0 + 0.07, a2M), strip(0.15 - sh, 2.2 - sh, Y0 + 0.07, a2M)];

                s.part(g, "al1", d.al1, [a1M]);
                s.part(g, "al2", d.al2, [a2M]);

                const oxM = s.mat(0xbe96ff, { emissive: 0x2a1450, roughness: 0.4 });

                d.oxides = d.al1.map(function (m) {

                    const o = s.box(m.geometry.parameters.width, 0.02, 0.4, oxM, m.position.x, Y0 + 0.06, 0);

                    o.visible = false;

                    return o;
                });

                s.part(g, "oxide", d.oxides, [oxM]);

                const tmM = s.mat(0xc9d3e6, { metalness: 0.9, roughness: 0.25 });

                d.tops = upper.concat([bridge]).map(function (u) {

                    const p = u.geometry.parameters;
                    const m = s.box(p.width, 0.06, p.depth, tmM, u.position.x, Y2 + 0.03, u.position.z);

                    m.visible = false;

                    return m;
                });

                s.part(g, "topmetal", d.tops, [tmM], true);

                d.rLabels = [labelAt(s, "Suspended bridge", [0, 1.65, 0]), labelAt(s, "Upper resist", [-2.4, 1.45, -1.2]), labelAt(s, "Undercut cavity", [-1.6, 0.75, 0])];
                labelAt(s, "Junction forms here", [0, 0.1, -0.9]);

                // the small junction under the bridge glows once the second layer lands on the first
                const jjM = s.mat(0xffd666, { emissive: 0x8a6000, transparent: true, opacity: 0.9 });

                d.jj = s.box(0.4, 0.02, 0.44, jjM, 0, Y0 + 0.065, 0);
                d.jj.visible = false;
                s.part(g, "junction", d.jj, [jjM]);

                const atomM = new T.MeshStandardMaterial({ color: 0xf5f7ff, emissive: 0x8090b0 });

                d.atoms = [];

                for (let i = 0; i < 40; i++) {

                    const a = s.sph(0.035, atomM, 0, -5, 0, 8);

                    g.add(a);
                    d.atoms.push({ m: a, x: (i % 20) / 20 * 4.4 - 2.2, ph: (i * 0.37) % 1 });
                }

                d.stage = 0;
                d.anim = null;
                d.Y0 = Y0;
                d.Y2 = Y2;
            },
            frame: function (c, dt) {

                const d = c.data;

                d.atoms.forEach(function (a) { a.m.position.y = -5; });

                if (!d.anim) { return; }

                const A = d.anim;

                A.t += dt / 4.5;

                const k = Math.min(1, A.t);

                if (A.id === "e1" || A.id === "e2") {

                    const dir = A.id === "e1" ? 1 : -1;
                    const layer = A.id === "e1" ? d.al1 : d.al2;

                    layer.forEach(function (m) { m.scale.y = Math.max(0.001, k); });

                    if (A.id === "e2" && k >= 1) { d.jj.visible = true; }
                    d.tops.forEach(function (m) { m.visible = true; m.scale.y = Math.max(0.001, A.id === "e1" ? k : 1); });

                    d.atoms.forEach(function (a) {

                        const u = (a.ph + A.t * 2.2) % 1;
                        const y = 3 - u * 2.7;
                        const x = a.x + dir * 0.35 - dir * (y - d.Y0) * 0.5;

                        if (k < 1) { a.m.position.set(x, y, (a.ph - 0.5) * 0.3); }
                    });
                }

                if (A.id === "ox") {

                    d.oxides.forEach(function (o) { o.visible = true; o.scale.y = Math.max(0.001, k); });
                }

                if (A.id === "lift") {

                    d.resistMats.forEach(function (m) { m.opacity = m.userData.op * (1 - k); });
                    d.tops.forEach(function (m) { m.position.y = d.Y2 + 0.03 + k * 2; m.visible = k < 0.95; });
                    d.resist.forEach(function (m) { m.visible = k < 0.98; });
                    d.rLabels.forEach(function (l) { l.el.style.visibility = k > 0.5 ? "hidden" : ""; });
                }

                if (A.t >= 1) {

                    d.stage++;
                    d.anim = null;
                    d.msg = "";
                }
            }
        });


        // ================================================================
        // UNIT 27: A FLIP-CHIP QUANTUM PROCESSOR
        // ================================================================
        D("qc-3d-flipchip", {

            title: "Explore in 3D: a flip-chip quantum processor",
            intro: "Click any layer. Replay the flip-and-bond, pull the layers apart, or send a signal up through the stack.",
            stats: [["Parts explored", "seen"], ["Last action", "act"]],
            defaults: {},
            controls: [
                { actions: [["flip", "🔄 Flip and bond"], ["explode", "↕ Pull the layers apart"], ["signal", "⚡ Send a signal up"]], label: "Try" },
                { views: ["three", "front", "top"] }
            ],
            formula: "In a flip-chip processor, the qubits live on their own clean chip, turned face-down onto a second chip that carries the wiring, joined by superconducting indium bumps a few micrometres tall. Through-silicon vias carry signals vertically from the package below, so lines no longer need to squeeze out to the chip edge. (Vertical sizes are hugely exaggerated.)",
            stage: { target: [0, 0.9, 0], halfWidth: 4.2, halfHeight: 2.2, views: { three: [0.65, 1.05], front: [0, 1.45], top: [0, 0.12] }, home: "three", sway: [0.65, 0.3] },
            info: {
                base: "Package board: carries signals from the coaxial cables to the chip stack, inside the copper sample holder.",
                interposer: "Wiring chip (interposer): carries the readout and control lines and, in some designs, the readout resonators, keeping lossy wiring away from the qubits.",
                wiring: "Wiring: superconducting lines on the wiring chip, routed underneath the qubit chip to each qubit.",
                tsv: "Through-silicon vias: superconductor-lined holes through the wiring chip, connecting its top and bottom. Fences of grounded vias also suppress box modes.",
                bumps: "Indium bumps: soft, superconducting below 3.4 K, cold-welded when the chips are pressed together. They carry signals and tie the grounds of the two chips together.",
                chip: "Qubit chip: flipped face-down. Only qubits and couplers live here, so its surfaces can be kept as clean as possible.",
                qubits: "Qubits: Xmon-style transmons on the underside of the qubit chip, a few micrometres above the wiring chip. Their frequency depends slightly on that gap, so bump height must be uniform."
            },
            read: function (c) {

                return {
                    seen: c.count() + " of 7",
                    act: c.data.act || "—",
                    verdict: c.count() >= 5 ? "You've explored a 3D-integrated quantum processor" : "Click the layers to learn what each one does"
                };
            },
            reward: { when: function (c) { return c.count() >= 5; }, msg: "You explored a flip-chip quantum processor" },
            reset: function (c) { c.data.flipT = 1; c.data.exT = 0; c.data.ex = false; c.data.sig = null; c.data.act = ""; },
            act: function (c, id) {

                const d = c.data;

                if (id === "flip") { d.flipT = 0; d.act = "Qubit chip flipped and pressed onto the bumps"; }
                if (id === "explode") { d.ex = !d.ex; d.act = d.ex ? "Layers pulled apart" : "Layers back together"; }
                if (id === "signal") { d.sig = 0; d.act = "Signal: via → wiring → bump → qubit"; }
            },
            build: function (c) {

                const s = c.S;
                const T = s.T;
                const g = new T.Group();
                const d = c.data;

                s.scene.add(g);
                s.shadow(g, 9, 9);

                const pcbM = s.mat(0x2f5a46, { roughness: 0.6 });

                s.part(g, "base", s.box(7, 0.2, 7, pcbM, 0, 0.1, 0), [pcbM], true);

                // everything above the board sits in groups so the stack can be pulled apart
                d.lower = new T.Group();
                d.mid = new T.Group();
                d.upper = new T.Group();
                g.add(d.lower);
                g.add(d.mid);
                g.add(d.upper);

                const siM = s.mat(0x4a5266, { roughness: 0.35, metalness: 0.3 });

                s.part(d.lower, "interposer", s.box(5, 0.3, 5, siM, 0, 0.35, 0), [siM]);

                const tsvM = s.mat(0xd6b85a, { metalness: 0.85, roughness: 0.3 });
                const tsvs = [];

                for (let i = -2; i <= 2; i++) { [-2.2, 2.2].forEach(function (z) { tsvs.push(s.cyl(0.06, 0.06, 0.32, tsvM, i * 0.9, 0.35, z, 12)); tsvs.push(s.cyl(0.06, 0.06, 0.32, tsvM, z, 0.35, i * 0.9, 12)); }); }

                s.part(d.lower, "tsv", tsvs, [tsvM]);

                const wM = s.mat(0x78b4ff, { metalness: 0.6, roughness: 0.3 });
                const wires = [];

                [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].forEach(function (q, i) {

                    const ex = i % 2 ? 2.2 : -2.2;

                    wires.push(s.tube([[q[0] * 1.1, 0.52, q[1] * 1.1], [q[0] * 1.1 + (ex - q[0] * 1.1) * 0.5, 0.52, q[1] * 1.1 + 0.15], [ex, 0.52, q[1] * 1.1 * 0.9]], 0.02, wM, 16));
                });

                s.part(d.lower, "wiring", wires, [wM]);

                const inM = s.mat(0xc0c4d6, { metalness: 0.75, roughness: 0.4 });
                const bumps = [];

                for (let i = -3; i <= 3; i++) {

                    for (let j = -3; j <= 3; j++) {

                        if ((i + j) % 2) { continue; }

                        bumps.push(s.cyl(0.07, 0.07, 0.2, inM, i * 0.55, 0.6, j * 0.55, 12));
                    }
                }

                s.part(d.mid, "bumps", bumps, [inM]);

                const chipM = s.glass(0x8fa0c0, 0.45, false);

                d.chip = new T.Group();
                d.upper.add(d.chip);

                const chip = s.box(3.8, 0.25, 3.8, chipM, 0, 0, 0);

                d.chip.add(chip);
                s.part(d.chip, "chip", chip, [chipM]);

                const qM = s.mat(0xe3e8f2, { metalness: 0.9, roughness: 0.22, emissive: 0x000000 });
                const qs = [];

                [-1, 0, 1].forEach(function (x) {

                    [-1, 0, 1].forEach(function (z) {

                        qs.push(s.box(0.6, 0.03, 0.09, qM, x * 1.1, -0.14, z * 1.1));
                        qs.push(s.box(0.09, 0.03, 0.6, qM, x * 1.1, -0.14, z * 1.1));
                    });
                });

                qs.forEach(function (m) { d.chip.add(m); });
                s.part(d.chip, "qubits", qs, [qM]);
                d.qM = qM;

                labelAt(s, "Qubit chip (face down)", [0, 1.55, -2.2]);
                labelAt(s, "Indium bumps", [2.6, 0.75, 1.0]);
                labelAt(s, "Wiring chip", [2.9, 0.35, -2.6]);
                labelAt(s, "Through-silicon vias", [-3.2, 0.2, 2.2]);
                labelAt(s, "Package board", [3.6, 0.05, 3.4]);

                const pM = new T.MeshStandardMaterial({ color: 0xfff1b0, emissive: 0xffb800, emissiveIntensity: 1.6 });

                d.ball = s.sph(0.08, pM, 0, -5, 0, 12);
                g.add(d.ball);
                d.flipT = 1;
                d.exT = 0;
                d.glow = 0;
            },
            frame: function (c, dt) {

                const d = c.data;
                const chipY = 0.825;

                d.exT = clamp(d.exT + (d.ex ? dt : -dt) * 0.6, 0, 1);

                if (d.flipT < 1) { d.flipT = Math.min(1, d.flipT + dt / 6); }

                const k = d.flipT;
                const lift = k < 0.6 ? 2.2 : 2.2 * (1 - (k - 0.6) / 0.4);
                const rot = Math.PI * (1 - clamp(k / 0.6, 0, 1));

                d.mid.position.y = d.exT * 0.7;
                d.upper.position.y = d.exT * 1.5;
                d.chip.position.set(0, chipY + lift, 0);
                d.chip.rotation.z = rot;

                if (d.sig !== null && d.sig !== undefined) {

                    d.sig += dt * 0.22;

                    const u = d.sig;
                    const P = [[-2.2, 0.15, 0], [-2.2, 0.52, 0], [-1.1, 0.52, 0], [-1.1, 0.6 + d.exT * 0.7, 0], [-1.1, chipY - 0.14 + d.exT * 1.5, 0]];
                    const segs = P.length - 1;
                    const x = Math.min(u, 1) * segs;
                    const i = Math.min(Math.floor(x), segs - 1);
                    const f = x - i;

                    d.ball.position.set(P[i][0] + (P[i + 1][0] - P[i][0]) * f, P[i][1] + (P[i + 1][1] - P[i][1]) * f, P[i][2] + (P[i + 1][2] - P[i][2]) * f);

                    if (u >= 1) { d.sig = null; d.ball.position.y = -5; d.glow = 1.5; }
                }

                if (d.glow > 0) { d.glow = Math.max(0, d.glow - dt); }

                if (!(c.S.selected() && c.S.selected().mats.indexOf(d.qM) >= 0)) { d.qM.emissive.setRGB(0.5 * d.glow, 0.42 * d.glow, 0.1 * d.glow); }
            }
        });

        document.querySelectorAll('.fd-sim[data-sim^="qc-3d-"]').forEach(F.mount);
    }

})();
